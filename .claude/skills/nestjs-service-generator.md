# NestJS Service Generator Skill

## Purpose
Generate clean NestJS service templates that fix all the issues from OLD codebase: missing transactions, improper JWT handling, unbounded queries, and missing event publishing.

## Usage
Use this skill when creating any new NestJS service in the NEW directory.

## Template

### 1. Base Service Structure
```typescript
// NEW/{service-name}/src/app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TerminusModule } from '@nestjs/terminus';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validationSchema: environmentSchema, // Joi schema for validation
    }),

    // Database with transactions support
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        dbName: configService.get<string>('DATABASE_NAME'),
        // Enable transactions
        replicaSet: 'rs0', // For local development
        directConnection: true,
        retryWrites: true,
      }),
      inject: [ConfigService],
    }),

    // Event system
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 10,
      verboseMemoryLeak: true,
    }),

    // Health checks
    TerminusModule,

    // Rate limiting
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 100,
    }),

    // Domain modules
    DomainModule,
    ApplicationModule,
    InfrastructureModule,
  ],
})
export class AppModule {}
```

### 2. Domain Entity with Validation
```typescript
// NEW/{service-name}/src/domain/entities/entity.ts
import { AggregateRoot } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';

export abstract class Entity extends AggregateRoot {
  protected readonly _id: string;
  protected _version: number = 1;
  protected _createdAt: Date;
  protected _updatedAt: Date;

  constructor(id?: string) {
    super();
    this._id = id || uuidv4();
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  get id(): string {
    return this._id;
  }

  get version(): number {
    return this._version;
  }

  protected validateInvariants(): void {
    // Override in derived classes
  }

  protected recordEvent(event: any): void {
    this.apply(event);
    this._version++;
    this._updatedAt = new Date();
  }
}

// Example domain entity
export class Project extends Entity {
  private _name: string;
  private _organizationId: string;
  private _status: ProjectStatus;

  constructor(props: CreateProjectProps) {
    super(props.id);
    this._name = props.name;
    this._organizationId = props.organizationId;
    this._status = ProjectStatus.DRAFT;

    this.validateInvariants();

    this.recordEvent(new ProjectCreatedEvent({
      projectId: this.id,
      name: this._name,
      organizationId: this._organizationId,
    }));
  }

  protected validateInvariants(): void {
    if (!this._name || this._name.length < 3) {
      throw new InvalidProjectNameException();
    }

    if (!this._organizationId) {
      throw new MissingOrganizationException();
    }
  }
}
```

### 3. Repository with Transactions
```typescript
// NEW/{service-name}/src/infrastructure/repositories/mongodb.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, ClientSession } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export abstract class MongoRepository<T> {
  constructor(
    @InjectModel(Entity.name) protected model: Model<T>,
    @InjectConnection() protected connection: Connection,
    protected eventEmitter: EventEmitter2,
  ) {}

  async findById(id: string, session?: ClientSession): Promise<T | null> {
    return this.model.findById(id).session(session || null).exec();
  }

  async findAll(filter: any = {}, options: QueryOptions = {}): Promise<T[]> {
    const { page = 1, limit = 100, sort = { createdAt: -1 } } = options;

    // ALWAYS paginate queries (fix for OLD unbounded queries)
    return this.model
      .find(filter)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort(sort)
      .session(options.session || null)
      .exec();
  }

  async create(entity: T): Promise<T> {
    const session = await this.connection.startSession();

    try {
      const result = await session.withTransaction(async () => {
        const created = await this.model.create([entity], { session });

        // Publish domain events
        const events = this.extractEvents(entity);
        for (const event of events) {
          await this.eventEmitter.emitAsync(event.constructor.name, event);
        }

        return created[0];
      });

      return result;
    } finally {
      await session.endSession();
    }
  }

  async update(id: string, updates: Partial<T>): Promise<T> {
    const session = await this.connection.startSession();

    try {
      const result = await session.withTransaction(async () => {
        const updated = await this.model
          .findByIdAndUpdate(
            id,
            { ...updates, $inc: { version: 1 } },
            { new: true, session }
          )
          .exec();

        if (!updated) {
          throw new EntityNotFoundException(id);
        }

        // Publish update event
        await this.eventEmitter.emitAsync('Entity.Updated', {
          entityId: id,
          entityType: this.model.modelName,
          changes: updates,
          timestamp: new Date(),
        });

        return updated;
      });

      return result;
    } finally {
      await session.endSession();
    }
  }

  async delete(id: string): Promise<void> {
    const session = await this.connection.startSession();

    try {
      await session.withTransaction(async () => {
        const deleted = await this.model
          .findByIdAndDelete(id)
          .session(session)
          .exec();

        if (!deleted) {
          throw new EntityNotFoundException(id);
        }

        // Publish delete event
        await this.eventEmitter.emitAsync('Entity.Deleted', {
          entityId: id,
          entityType: this.model.modelName,
          timestamp: new Date(),
        });
      });
    } finally {
      await session.endSession();
    }
  }

  private extractEvents(entity: any): any[] {
    // Extract domain events from aggregate root
    if (entity.getUncommittedEvents) {
      return entity.getUncommittedEvents();
    }
    return [];
  }
}

interface QueryOptions {
  page?: number;
  limit?: number;
  sort?: any;
  session?: ClientSession;
}
```

### 4. JWT Guard with Proper Verification
```typescript
// NEW/{service-name}/src/infrastructure/guards/jwt-auth.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import * as jwksRsa from 'jwks-rsa';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private jwksClient: jwksRsa.JwksClient;

  constructor(
    private configService: ConfigService,
    private auditService: AuditService,
  ) {
    this.jwksClient = jwksRsa({
      jwksUri: this.configService.get<string>('JWKS_URI'),
      cache: true,
      rateLimit: true,
      cacheMaxAge: 600000, // 10 minutes
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      await this.auditService.logUnauthorizedAccess(request);
      throw new UnauthorizedException('Token not provided');
    }

    try {
      // CRITICAL FIX: Always verify JWT signature (not just decode)
      const decoded = jwt.decode(token, { complete: true }) as any;

      if (!decoded || !decoded.header.kid) {
        throw new UnauthorizedException('Invalid token format');
      }

      const key = await this.jwksClient.getSigningKey(decoded.header.kid);
      const signingKey = key.getPublicKey();

      const verified = jwt.verify(token, signingKey, {
        algorithms: ['RS256'],
        issuer: this.configService.get<string>('JWT_ISSUER'),
        audience: this.configService.get<string>('JWT_AUDIENCE'),
        clockTolerance: 30,
      }) as any;

      request.user = verified;

      await this.auditService.logSuccessfulAuth(verified.sub, request);

      return true;
    } catch (error) {
      await this.auditService.logFailedAuth(token, request, error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractToken(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return null;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
```

### 5. Service with CQRS Pattern
```typescript
// NEW/{service-name}/src/application/services/service.ts
import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus, EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProjectService {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    private eventBus: EventBus,
    @InjectRepository(ProjectRepository)
    private projectRepository: ProjectRepository,
  ) {}

  async createProject(dto: CreateProjectDto): Promise<ProjectDto> {
    // Use command for write operations
    const command = new CreateProjectCommand(dto);
    const project = await this.commandBus.execute(command);

    // Publish integration event
    await this.eventBus.publish(new ProjectCreatedEvent({
      projectId: project.id,
      organizationId: project.organizationId,
      name: project.name,
      timestamp: new Date(),
    }));

    return project;
  }

  async getProject(id: string): Promise<ProjectDto> {
    // Use query for read operations
    const query = new GetProjectQuery(id);
    return this.queryBus.execute(query);
  }

  async listProjects(filter: ProjectFilterDto): Promise<PaginatedResult<ProjectDto>> {
    // Always paginate list operations
    const query = new ListProjectsQuery({
      ...filter,
      page: filter.page || 1,
      limit: Math.min(filter.limit || 100, 100), // Max 100 items
    });

    return this.queryBus.execute(query);
  }
}
```

### 6. Error Handling Middleware
```typescript
// NEW/{service-name}/src/infrastructure/middleware/error-handler.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private logger: LoggerService,
    private auditService: AuditService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();
      message = typeof responseBody === 'string'
        ? responseBody
        : (responseBody as any).message || message;
      code = (responseBody as any).code || code;
    } else if (exception instanceof DomainException) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
      code = exception.code;
    }

    const errorResponse = {
      success: false,
      error: {
        code,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId: request.id,
      },
    };

    // Log error
    this.logger.error('Request failed', {
      ...errorResponse.error,
      stack: exception instanceof Error ? exception.stack : undefined,
      userId: (request as any).user?.id,
    });

    // Audit critical errors
    if (status >= 500) {
      this.auditService.logCriticalError({
        error: message,
        stack: exception instanceof Error ? exception.stack : undefined,
        request: {
          method: request.method,
          url: request.url,
          headers: request.headers,
          body: request.body,
        },
        userId: (request as any).user?.id,
      });
    }

    response.status(status).json(errorResponse);
  }
}
```

### 7. Health Check Implementation
```typescript
// NEW/{service-name}/src/infrastructure/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: MongooseHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private customHealthService: CustomHealthService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Database health
      () => this.db.pingCheck('database'),

      // Memory health (max 150MB heap)
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),

      // Disk health (min 10% free)
      () => this.disk.checkStorage('storage', {
        path: '/',
        thresholdPercent: 0.1,
      }),

      // Custom service checks
      () => this.customHealthService.checkDependencies(),
      () => this.customHealthService.checkRedis(),
      () => this.customHealthService.checkEventBus(),
    ]);
  }

  @Get('/ready')
  @HealthCheck()
  readiness() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.customHealthService.checkMigrations(),
    ]);
  }

  @Get('/live')
  @HealthCheck()
  liveness() {
    return { status: 'ok', timestamp: new Date() };
  }
}
```

## Key Improvements from OLD Code

1. **JWT Verification**: Always verifies signature, not just decode
2. **Transactions**: All write operations use MongoDB transactions
3. **Pagination**: All list operations are paginated (max 100 items)
4. **Event Publishing**: Typed events with proper async handling
5. **Error Handling**: Comprehensive error handling with audit logging
6. **Health Checks**: Proper health endpoints for k8s probes
7. **Rate Limiting**: Built-in throttling to prevent abuse
8. **CQRS**: Separation of read and write operations
9. **Validation**: Input validation at all levels
10. **Monitoring**: Integrated logging and metrics

## Usage Example

```bash
# Generate new service
/generate-service organization 3002

# This will create:
# - NEW/organization-service/
#   - src/
#     - domain/
#     - application/
#     - infrastructure/
#   - test/
#   - Dockerfile
#   - package.json
#   - tsconfig.json
```

Remember: NEVER copy patterns from OLD code. Always use this template for NEW services.