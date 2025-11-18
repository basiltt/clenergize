# NestJS Service Template Design

**Document Version**: 1.0.0
**Last Updated**: November 18, 2025
**Status**: Design Phase - Week 4-5
**Author**: Architecture Team

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Structure](#project-structure)
3. [Architecture Layers](#architecture-layers)
4. [Module Organization](#module-organization)
5. [Configuration Management](#configuration-management)
6. [Database Integration](#database-integration)
7. [Caching Integration](#caching-integration)
8. [Event Bus Integration](#event-bus-integration)
9. [Authentication & Authorization](#authentication--authorization)
10. [Logging & Monitoring](#logging--monitoring)
11. [Error Handling](#error-handling)
12. [Testing Strategy](#testing-strategy)
13. [Docker Configuration](#docker-configuration)
14. [Example Implementations](#example-implementations)

---

## 1. Executive Summary

### Purpose

This document provides a comprehensive blueprint for creating production-ready Clenergize microservices using NestJS. It establishes:
- **Consistent architecture** across all 7 services
- **Best practices** for scalability, security, and maintainability
- **Reusable patterns** for common functionality
- **Clear separation of concerns** with DDD layering

### Technology Stack

```yaml
Framework: NestJS 10+
Language: TypeScript 5+ (strict mode)
Runtime: Node.js 20 LTS
Database: MongoDB 7+ with Mongoose
Cache: Redis 7+ with ioredis
Event Bus: AWS EventBridge (prod), Redis Pub/Sub (local)
Authentication: AWS Cognito with JWT/JWKS
Secrets: AWS Secrets Manager
Logging: Winston + CloudWatch
Monitoring: CloudWatch Metrics + X-Ray
Testing: Jest + Supertest
Documentation: OpenAPI/Swagger
```

### Service Template Goals

```yaml
Scalability:
  - Horizontal scaling with stateless design
  - Connection pooling (MongoDB, Redis)
  - Caching for frequently accessed data
  - Async processing for heavy operations

Security:
  - JWT signature verification
  - Role-based access control (RBAC)
  - Input validation with class-validator
  - SQL injection prevention
  - CORS configuration
  - Rate limiting

Observability:
  - Structured JSON logging
  - Distributed tracing with correlation IDs
  - Custom CloudWatch metrics
  - Health check endpoints
  - Graceful shutdown

Maintainability:
  - Clean architecture with DDD layers
  - Dependency injection
  - Interface-based design
  - Comprehensive tests (80% coverage)
  - Auto-generated API documentation
```

---

## 2. Project Structure

### Folder Organization

```
service-name/
├── src/
│   ├── domain/                    # Domain Layer (Business Logic)
│   │   ├── entities/              # Domain entities
│   │   │   ├── user.entity.ts
│   │   │   ├── project.entity.ts
│   │   │   └── index.ts
│   │   ├── value-objects/         # Value objects
│   │   │   ├── email.vo.ts
│   │   │   ├── hierarchy-path.vo.ts
│   │   │   └── index.ts
│   │   ├── events/                # Domain events
│   │   │   ├── user-created.event.ts
│   │   │   ├── project-updated.event.ts
│   │   │   └── index.ts
│   │   ├── repositories/          # Repository interfaces
│   │   │   ├── user.repository.interface.ts
│   │   │   ├── project.repository.interface.ts
│   │   │   └── index.ts
│   │   ├── services/              # Domain services
│   │   │   ├── user-domain.service.ts
│   │   │   ├── project-domain.service.ts
│   │   │   └── index.ts
│   │   └── exceptions/            # Domain exceptions
│   │       ├── user-not-found.exception.ts
│   │       ├── invalid-hierarchy.exception.ts
│   │       └── index.ts
│   │
│   ├── application/               # Application Layer (Use Cases)
│   │   ├── commands/              # Command handlers
│   │   │   ├── create-user/
│   │   │   │   ├── create-user.command.ts
│   │   │   │   ├── create-user.handler.ts
│   │   │   │   └── create-user.dto.ts
│   │   │   ├── update-project/
│   │   │   └── index.ts
│   │   ├── queries/               # Query handlers
│   │   │   ├── get-user/
│   │   │   │   ├── get-user.query.ts
│   │   │   │   ├── get-user.handler.ts
│   │   │   │   └── get-user.dto.ts
│   │   │   ├── list-projects/
│   │   │   └── index.ts
│   │   ├── events/                # Event handlers
│   │   │   ├── user-created.handler.ts
│   │   │   ├── project-updated.handler.ts
│   │   │   └── index.ts
│   │   └── mappers/               # DTO to Entity mappers
│   │       ├── user.mapper.ts
│   │       ├── project.mapper.ts
│   │       └── index.ts
│   │
│   ├── infrastructure/            # Infrastructure Layer
│   │   ├── database/              # Database implementations
│   │   │   ├── mongoose/
│   │   │   │   ├── schemas/
│   │   │   │   │   ├── user.schema.ts
│   │   │   │   │   ├── project.schema.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── repositories/
│   │   │   │   │   ├── user.repository.ts
│   │   │   │   │   ├── project.repository.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── database.module.ts
│   │   │   └── migrations/
│   │   │       ├── 001_initial_setup.ts
│   │   │       └── index.ts
│   │   ├── cache/                 # Cache implementations
│   │   │   ├── redis/
│   │   │   │   ├── redis.service.ts
│   │   │   │   ├── redis.module.ts
│   │   │   │   └── index.ts
│   │   │   └── decorators/
│   │   │       ├── cacheable.decorator.ts
│   │   │       └── cache-invalidate.decorator.ts
│   │   ├── messaging/             # Event bus implementations
│   │   │   ├── eventbridge/
│   │   │   │   ├── eventbridge.service.ts
│   │   │   │   ├── eventbridge.module.ts
│   │   │   │   └── index.ts
│   │   │   └── redis-pubsub/
│   │   │       ├── redis-pubsub.service.ts
│   │   │       └── redis-pubsub.module.ts
│   │   ├── http/                  # HTTP layer (Controllers)
│   │   │   ├── controllers/
│   │   │   │   ├── user.controller.ts
│   │   │   │   ├── project.controller.ts
│   │   │   │   ├── health.controller.ts
│   │   │   │   └── index.ts
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   ├── roles.guard.ts
│   │   │   │   └── index.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── logging.interceptor.ts
│   │   │   │   ├── transform.interceptor.ts
│   │   │   │   ├── timeout.interceptor.ts
│   │   │   │   └── index.ts
│   │   │   ├── filters/
│   │   │   │   ├── http-exception.filter.ts
│   │   │   │   ├── all-exceptions.filter.ts
│   │   │   │   └── index.ts
│   │   │   ├── middleware/
│   │   │   │   ├── correlation-id.middleware.ts
│   │   │   │   ├── request-logging.middleware.ts
│   │   │   │   └── index.ts
│   │   │   └── pipes/
│   │   │       ├── validation.pipe.ts
│   │   │       └── index.ts
│   │   └── external/              # External service clients
│   │       ├── aws/
│   │       │   ├── s3.service.ts
│   │       │   ├── secrets.service.ts
│   │       │   └── index.ts
│   │       └── cognito/
│   │           ├── cognito.service.ts
│   │           └── index.ts
│   │
│   ├── shared/                    # Shared utilities
│   │   ├── config/                # Configuration
│   │   │   ├── app.config.ts
│   │   │   ├── database.config.ts
│   │   │   ├── redis.config.ts
│   │   │   ├── jwt.config.ts
│   │   │   └── index.ts
│   │   ├── constants/             # Constants
│   │   │   ├── error-codes.ts
│   │   │   ├── event-types.ts
│   │   │   └── index.ts
│   │   ├── decorators/            # Custom decorators
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── public.decorator.ts
│   │   │   └── index.ts
│   │   ├── types/                 # TypeScript types
│   │   │   ├── request.types.ts
│   │   │   ├── response.types.ts
│   │   │   └── index.ts
│   │   └── utils/                 # Utility functions
│   │       ├── logger.util.ts
│   │       ├── date.util.ts
│   │       └── index.ts
│   │
│   ├── app.module.ts              # Root module
│   ├── app.controller.ts          # Root controller
│   ├── app.service.ts             # Root service
│   └── main.ts                    # Bootstrap file
│
├── test/                          # Tests
│   ├── unit/                      # Unit tests
│   │   ├── domain/
│   │   ├── application/
│   │   └── infrastructure/
│   ├── integration/               # Integration tests
│   │   ├── api/
│   │   ├── database/
│   │   └── cache/
│   ├── e2e/                       # End-to-end tests
│   │   ├── user.e2e-spec.ts
│   │   └── project.e2e-spec.ts
│   └── fixtures/                  # Test fixtures
│       ├── users.fixture.ts
│       └── projects.fixture.ts
│
├── docs/                          # Documentation
│   ├── api/                       # API documentation
│   ├── architecture/              # Architecture diagrams
│   └── guides/                    # Developer guides
│
├── .github/                       # GitHub workflows
│   └── workflows/
│       ├── ci.yml
│       └── cd.yml
│
├── docker/                        # Docker files
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── docker-compose.yml
│
├── scripts/                       # Utility scripts
│   ├── seed-db.ts
│   ├── migrate.ts
│   └── generate-service.sh
│
├── .env.example                   # Environment template
├── .eslintrc.js                   # ESLint config
├── .prettierrc                    # Prettier config
├── jest.config.js                 # Jest config
├── nest-cli.json                  # NestJS CLI config
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
└── README.md                      # Project documentation
```

### File Naming Conventions

```yaml
Entities: *.entity.ts
  Example: user.entity.ts, project.entity.ts

Value Objects: *.vo.ts
  Example: email.vo.ts, hierarchy-path.vo.ts

DTOs: *.dto.ts
  Example: create-user.dto.ts, update-project.dto.ts

Commands: *.command.ts
  Example: create-user.command.ts

Queries: *.query.ts
  Example: get-user.query.ts

Handlers: *.handler.ts
  Example: create-user.handler.ts, user-created.handler.ts

Events: *.event.ts
  Example: user-created.event.ts

Schemas: *.schema.ts
  Example: user.schema.ts

Repositories: *.repository.ts
  Example: user.repository.ts

Controllers: *.controller.ts
  Example: user.controller.ts

Services: *.service.ts
  Example: user.service.ts

Guards: *.guard.ts
  Example: jwt-auth.guard.ts

Interceptors: *.interceptor.ts
  Example: logging.interceptor.ts

Filters: *.filter.ts
  Example: http-exception.filter.ts

Middleware: *.middleware.ts
  Example: correlation-id.middleware.ts

Tests: *.spec.ts (unit), *.e2e-spec.ts (e2e)
  Example: user.service.spec.ts, user.e2e-spec.ts
```

---

## 3. Architecture Layers

### 3.1 Domain Layer

**Purpose**: Contains business logic and rules, independent of frameworks

**Responsibilities**:
- Define domain entities
- Define value objects
- Define domain events
- Implement business rules
- Define repository interfaces (not implementations!)

**Example Entity**:

```typescript
// src/domain/entities/user.entity.ts
import { AggregateRoot } from '@nestjs/cqrs';
import { UserCreatedEvent } from '../events/user-created.event';
import { Email } from '../value-objects/email.vo';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  CONTRIBUTOR = 'CONTRIBUTOR',
  VIEWER = 'VIEWER'
}

export class User extends AggregateRoot {
  constructor(
    public readonly id: string,
    public readonly email: Email,
    public firstName: string,
    public lastName: string,
    public readonly organizationId: string,
    public roles: UserRole[],
    public status: UserStatus,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public cognitoId?: string
  ) {
    super();
  }

  // Factory method
  static create(
    email: Email,
    firstName: string,
    lastName: string,
    organizationId: string,
    roles: UserRole[] = [UserRole.VIEWER]
  ): User {
    const user = new User(
      null, // ID will be generated by repository
      email,
      firstName,
      lastName,
      organizationId,
      roles,
      UserStatus.ACTIVE,
      new Date(),
      new Date()
    );

    // Publish domain event
    user.apply(new UserCreatedEvent(user));

    return user;
  }

  // Business methods
  activate(): void {
    if (this.status === UserStatus.ACTIVE) {
      throw new Error('User is already active');
    }
    this.status = UserStatus.ACTIVE;
    this.updatedAt = new Date();
  }

  suspend(): void {
    if (this.status === UserStatus.SUSPENDED) {
      throw new Error('User is already suspended');
    }
    this.status = UserStatus.SUSPENDED;
    this.updatedAt = new Date();
  }

  assignRole(role: UserRole): void {
    if (this.roles.includes(role)) {
      throw new Error(`User already has role: ${role}`);
    }
    this.roles.push(role);
    this.updatedAt = new Date();
  }

  removeRole(role: UserRole): void {
    const index = this.roles.indexOf(role);
    if (index === -1) {
      throw new Error(`User does not have role: ${role}`);
    }
    this.roles.splice(index, 1);
    this.updatedAt = new Date();
  }

  hasRole(role: UserRole): boolean {
    return this.roles.includes(role);
  }

  hasAnyRole(roles: UserRole[]): boolean {
    return roles.some(role => this.hasRole(role));
  }
}
```

**Example Value Object**:

```typescript
// src/domain/value-objects/email.vo.ts
export class Email {
  private readonly value: string;

  constructor(email: string) {
    this.validate(email);
    this.value = email.toLowerCase().trim();
  }

  private validate(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error(`Invalid email: ${email}`);
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
```

**Example Repository Interface**:

```typescript
// src/domain/repositories/user.repository.interface.ts
import { User } from '../entities/user.entity';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByCognitoId(cognitoId: string): Promise<User | null>;
  findByOrganization(organizationId: string): Promise<User[]>;
  save(user: User): Promise<User>;
  update(id: string, user: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
```

### 3.2 Application Layer

**Purpose**: Orchestrates use cases and coordinates domain objects

**Responsibilities**:
- Handle commands (write operations)
- Handle queries (read operations)
- Handle domain events
- Map DTOs to domain entities
- Coordinate transactions

**Example Command Handler**:

```typescript
// src/application/commands/create-user/create-user.command.ts
export class CreateUserCommand {
  constructor(
    public readonly email: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly organizationId: string,
    public readonly roles?: string[]
  ) {}
}

// src/application/commands/create-user/create-user.dto.ts
import { IsEmail, IsString, IsOptional, IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsUUID()
  organizationId: string;

  @ApiProperty({ example: ['CONTRIBUTOR'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];
}

// src/application/commands/create-user/create-user.handler.ts
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateUserCommand } from './create-user.command';
import { IUserRepository, USER_REPOSITORY } from '../../../domain/repositories/user.repository.interface';
import { User, UserRole } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.vo';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: CreateUserCommand): Promise<User> {
    // 1. Validate email uniqueness
    const existingUser = await this.userRepository.findByEmail(command.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // 2. Create domain entity
    const email = new Email(command.email);
    const roles = command.roles?.map(r => UserRole[r]) || [UserRole.VIEWER];

    const user = User.create(
      email,
      command.firstName,
      command.lastName,
      command.organizationId,
      roles
    );

    // 3. Save to repository
    const savedUser = await this.userRepository.save(user);

    // 4. Publish domain events
    user.getUncommittedEvents().forEach(event => {
      this.eventBus.publish(event);
    });
    user.commit();

    return savedUser;
  }
}
```

**Example Query Handler**:

```typescript
// src/application/queries/get-user/get-user.query.ts
export class GetUserQuery {
  constructor(public readonly userId: string) {}
}

// src/application/queries/get-user/get-user.handler.ts
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUserQuery } from './get-user.query';
import { IUserRepository, USER_REPOSITORY } from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../domain/entities/user.entity';

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository
  ) {}

  async execute(query: GetUserQuery): Promise<User | null> {
    return this.userRepository.findById(query.userId);
  }
}
```

**Example Event Handler**:

```typescript
// src/application/events/user-created.handler.ts
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserCreatedEvent } from '../../domain/events/user-created.event';
import { Logger } from '@nestjs/common';

@EventsHandler(UserCreatedEvent)
export class UserCreatedHandler implements IEventHandler<UserCreatedEvent> {
  private readonly logger = new Logger(UserCreatedHandler.name);

  async handle(event: UserCreatedEvent): Promise<void> {
    this.logger.log(`User created: ${event.user.id}`);

    // 1. Send welcome email
    await this.sendWelcomeEmail(event.user);

    // 2. Publish to external event bus
    await this.publishToEventBridge(event);

    // 3. Update analytics
    await this.trackUserCreation(event.user);
  }

  private async sendWelcomeEmail(user: User): Promise<void> {
    // Implementation...
  }

  private async publishToEventBridge(event: UserCreatedEvent): Promise<void> {
    // Implementation...
  }

  private async trackUserCreation(user: User): Promise<void> {
    // Implementation...
  }
}
```

### 3.3 Infrastructure Layer

**Purpose**: Implements technical concerns and integrates with external systems

**Responsibilities**:
- Database implementations (Mongoose repositories)
- Cache implementations (Redis)
- Message bus implementations (EventBridge)
- HTTP layer (Controllers, Guards, Interceptors)
- External service clients (AWS, Cognito)

**Example Mongoose Schema**:

```typescript
// src/infrastructure/database/mongoose/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = UserModel & Document;

@Schema({
  collection: 'users',
  timestamps: true,
  versionKey: 'version'
})
export class UserModel {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Organization', index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: [String], enum: ['ADMIN', 'MANAGER', 'CONTRIBUTOR', 'VIEWER'], default: ['VIEWER'] })
  roles: string[];

  @Prop({ type: String, enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'], default: 'ACTIVE', index: true })
  status: string;

  @Prop({ unique: true, sparse: true })
  cognitoId?: string;

  @Prop()
  deletedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);

// Indexes
UserSchema.index({ organizationId: 1, status: 1, createdAt: -1 });
UserSchema.index({ email: 'text', firstName: 'text', lastName: 'text' });

// Virtual properties
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Middleware
UserSchema.pre('save', function(next) {
  this.email = this.email.toLowerCase();
  next();
});
```

**Example Repository Implementation**:

```typescript
// src/infrastructure/database/mongoose/repositories/user.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IUserRepository } from '../../../../domain/repositories/user.repository.interface';
import { User, UserRole, UserStatus } from '../../../../domain/entities/user.entity';
import { UserModel, UserDocument } from '../schemas/user.schema';
import { Email } from '../../../../domain/value-objects/email.vo';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserDocument>
  ) {}

  async findById(id: string): Promise<User | null> {
    const doc = await this.userModel.findById(id).lean().exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await this.userModel
      .findOne({ email: email.toLowerCase() })
      .lean()
      .exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findByCognitoId(cognitoId: string): Promise<User | null> {
    const doc = await this.userModel.findOne({ cognitoId }).lean().exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findByOrganization(organizationId: string): Promise<User[]> {
    const docs = await this.userModel
      .find({
        organizationId: new Types.ObjectId(organizationId),
        status: UserStatus.ACTIVE
      })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return docs.map(doc => this.toDomain(doc));
  }

  async save(user: User): Promise<User> {
    const doc = new this.userModel(this.toPersistence(user));
    const saved = await doc.save();
    return this.toDomain(saved.toObject());
  }

  async update(id: string, user: Partial<User>): Promise<User> {
    const updated = await this.userModel
      .findByIdAndUpdate(
        id,
        { $set: this.toPersistence(user) },
        { new: true }
      )
      .lean()
      .exec();

    if (!updated) {
      throw new Error('User not found');
    }

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    // Soft delete
    await this.userModel.findByIdAndUpdate(id, {
      $set: { deletedAt: new Date() }
    });
  }

  // Mapper: Domain to Persistence
  private toPersistence(user: Partial<User>): Partial<UserDocument> {
    return {
      ...(user.email && { email: user.email.getValue() }),
      ...(user.firstName && { firstName: user.firstName }),
      ...(user.lastName && { lastName: user.lastName }),
      ...(user.organizationId && { organizationId: new Types.ObjectId(user.organizationId) }),
      ...(user.roles && { roles: user.roles }),
      ...(user.status && { status: user.status }),
      ...(user.cognitoId && { cognitoId: user.cognitoId })
    };
  }

  // Mapper: Persistence to Domain
  private toDomain(doc: any): User {
    return new User(
      doc._id.toString(),
      new Email(doc.email),
      doc.firstName,
      doc.lastName,
      doc.organizationId.toString(),
      doc.roles.map(r => UserRole[r]),
      UserStatus[doc.status],
      doc.createdAt,
      doc.updatedAt,
      doc.cognitoId
    );
  }
}
```

**Example Controller**:

```typescript
// src/infrastructure/http/controllers/user.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { CreateUserDto } from '../../../application/commands/create-user/create-user.dto';
import { CreateUserCommand } from '../../../application/commands/create-user/create-user.command';
import { GetUserQuery } from '../../../application/queries/get-user/get-user.query';
import { User, UserRole } from '../../../domain/entities/user.entity';

@ApiTags('users')
@ApiBearerAuth()
@Controller('api/v1/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async createUser(@Body() dto: CreateUserDto): Promise<User> {
    const command = new CreateUserCommand(
      dto.email,
      dto.firstName,
      dto.lastName,
      dto.organizationId,
      dto.roles
    );

    return this.commandBus.execute(command);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUser(@Param('id') id: string): Promise<User> {
    const query = new GetUserQuery(id);
    return this.queryBus.execute(query);
  }

  @Get()
  @ApiOperation({ summary: 'List users' })
  @ApiQuery({ name: 'organizationId', required: false })
  @ApiResponse({ status: 200, description: 'Users retrieved' })
  async listUsers(
    @Query('organizationId') organizationId?: string,
    @CurrentUser() currentUser?: User
  ): Promise<User[]> {
    // Use currentUser's organization if not specified
    const orgId = organizationId || currentUser.organizationId;

    // Query implementation...
    return [];
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User updated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(
    @Param('id') id: string,
    @Body() dto: Partial<CreateUserDto>
  ): Promise<User> {
    // Update command implementation...
    return null;
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 204, description: 'User deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('id') id: string): Promise<void> {
    // Delete command implementation...
  }
}
```

---

## 4. Module Organization

### 4.1 Module Structure

**Root Module** (`app.module.ts`):

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { DatabaseModule } from './infrastructure/database/mongoose/database.module';
import { CacheModule } from './infrastructure/cache/redis/redis.module';
import { MessagingModule } from './infrastructure/messaging/eventbridge/eventbridge.module';
import { UserModule } from './modules/user.module';
import { ProjectModule } from './modules/project.module';
import { HealthModule } from './modules/health.module';
import { appConfig, databaseConfig, redisConfig, jwtConfig } from './shared/config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig, jwtConfig],
      envFilePath: ['.env.local', '.env'],
      validationSchema: envValidationSchema
    }),

    // CQRS
    CqrsModule,

    // Infrastructure
    DatabaseModule,
    CacheModule,
    MessagingModule,

    // Feature Modules
    UserModule,
    ProjectModule,
    HealthModule
  ]
})
export class AppModule {}
```

**Feature Module** (`user.module.ts`):

```typescript
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

// Controllers
import { UserController } from '../infrastructure/http/controllers/user.controller';

// Command Handlers
import { CreateUserHandler } from '../application/commands/create-user/create-user.handler';
import { UpdateUserHandler } from '../application/commands/update-user/update-user.handler';

// Query Handlers
import { GetUserHandler } from '../application/queries/get-user/get-user.handler';
import { ListUsersHandler } from '../application/queries/list-users/list-users.handler';

// Event Handlers
import { UserCreatedHandler } from '../application/events/user-created.handler';

// Repositories
import { UserRepository } from '../infrastructure/database/mongoose/repositories/user.repository';
import { USER_REPOSITORY } from '../domain/repositories/user.repository.interface';

// Schemas
import { UserModel, UserSchema } from '../infrastructure/database/mongoose/schemas/user.schema';

// Domain Services
import { UserDomainService } from '../domain/services/user-domain.service';

const commandHandlers = [CreateUserHandler, UpdateUserHandler];
const queryHandlers = [GetUserHandler, ListUsersHandler];
const eventHandlers = [UserCreatedHandler];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }])
  ],
  controllers: [UserController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    ...eventHandlers,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository
    },
    UserDomainService
  ],
  exports: [USER_REPOSITORY, UserDomainService]
})
export class UserModule {}
```

### 4.2 Dependency Injection

**Interface-based DI**:

```typescript
// Define interface in domain layer
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  // ... other methods
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

// Provide implementation in infrastructure layer
@Module({
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository // MongoDB implementation
    }
  ]
})
export class UserModule {}

// Inject using symbol
@Injectable()
export class CreateUserHandler {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository
  ) {}
}
```

This allows swapping implementations without changing business logic (e.g., switch from MongoDB to PostgreSQL).

---

## 5. Configuration Management

### 5.1 Environment Variables

**Environment File** (`.env.example`):

```bash
# Application
NODE_ENV=development
PORT=3001
SERVICE_NAME=identity-service
APP_VERSION=1.0.0
LOG_LEVEL=debug

# MongoDB
MONGODB_URI=mongodb://admin:localdev123@localhost:27017/?authSource=admin
MONGODB_DATABASE=clenergize_identity

# Redis
REDIS_URL=redis://localhost:6379
REDIS_DB_SESSION=0
REDIS_DB_CACHE=1

# JWT / Cognito
JWT_ISSUER=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_XXXXXXXXX
JWT_AUDIENCE=your-client-id
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_CLIENT_ID=your-client-id
COGNITO_JWKS_URI=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_XXXXXXXXX/.well-known/jwks.json

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test

# LocalStack (for local development)
LOCALSTACK_ENDPOINT=http://localhost:4566

# EventBridge
EVENT_BUS_NAME=clenergize-events

# Secrets Manager
SECRETS_PREFIX=/clenergize/development/identity-service

# CloudWatch
CLOUDWATCH_LOG_GROUP=/clenergize/development/identity-service
CLOUDWATCH_ENABLED=true

# X-Ray
XRAY_ENABLED=false
```

### 5.2 Configuration Objects

**App Config** (`src/shared/config/app.config.ts`):

```typescript
import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  serviceName: process.env.SERVICE_NAME || 'clenergize-service',
  version: process.env.APP_VERSION || '1.0.0',
  logLevel: process.env.LOG_LEVEL || 'info',

  // CORS
  corsEnabled: process.env.CORS_ENABLED === 'true',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],

  // Rate Limiting
  rateLimitTtl: parseInt(process.env.RATE_LIMIT_TTL, 10) || 60,
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,

  // Timeouts
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT, 10) || 30000,
  shutdownTimeout: parseInt(process.env.SHUTDOWN_TIMEOUT, 10) || 5000
}));
```

**Database Config** (`src/shared/config/database.config.ts`):

```typescript
import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  uri: process.env.MONGODB_URI,
  database: process.env.MONGODB_DATABASE,

  // Connection Pool
  minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE, 10) || 10,
  maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE, 10) || 100,
  maxIdleTimeMS: parseInt(process.env.DB_MAX_IDLE_TIME_MS, 10) || 60000,
  waitQueueTimeoutMS: parseInt(process.env.DB_WAIT_QUEUE_TIMEOUT_MS, 10) || 5000,

  // Timeouts
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,

  // Retry
  retryWrites: true,
  retryReads: true,

  // Read/Write Concerns
  readPreference: 'primaryPreferred',
  w: 'majority',
  journal: true
}));
```

**Environment Validation Schema**:

```typescript
import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'staging', 'production', 'test')
    .default('development'),

  PORT: Joi.number().default(3000),

  MONGODB_URI: Joi.string().required(),
  MONGODB_DATABASE: Joi.string().required(),

  REDIS_URL: Joi.string().required(),

  JWT_ISSUER: Joi.string().required(),
  JWT_AUDIENCE: Joi.string().required(),

  AWS_REGION: Joi.string().default('us-east-1'),

  // ... other validations
});
```

---

## 6. Database Integration

### 6.1 Database Module

```typescript
// src/infrastructure/database/mongoose/database.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
        dbName: configService.get<string>('database.database'),
        minPoolSize: configService.get<number>('database.minPoolSize'),
        maxPoolSize: configService.get<number>('database.maxPoolSize'),
        maxIdleTimeMS: configService.get<number>('database.maxIdleTimeMS'),
        waitQueueTimeoutMS: configService.get<number>('database.waitQueueTimeoutMS'),
        serverSelectionTimeoutMS: configService.get<number>('database.serverSelectionTimeoutMS'),
        socketTimeoutMS: configService.get<number>('database.socketTimeoutMS'),
        connectTimeoutMS: configService.get<number>('database.connectTimeoutMS'),
        retryWrites: configService.get<boolean>('database.retryWrites'),
        retryReads: configService.get<boolean>('database.retryReads'),
        readPreference: configService.get<string>('database.readPreference'),
        w: configService.get<string>('database.w'),
        journal: configService.get<boolean>('database.journal')
      })
    })
  ]
})
export class DatabaseModule {}
```

### 6.2 Database Migrations

```typescript
// src/infrastructure/database/migrations/001_initial_setup.ts
import { Db } from 'mongodb';

export async function up(db: Db): Promise<void> {
  // Create collections
  await db.createCollection('users');
  await db.createCollection('projects');

  // Create indexes
  await db.collection('users').createIndexes([
    { key: { email: 1 }, unique: true },
    { key: { cognitoId: 1 }, unique: true, sparse: true },
    { key: { organizationId: 1, status: 1, createdAt: -1 } },
    { key: { email: 'text', firstName: 'text', lastName: 'text' } }
  ]);

  await db.collection('projects').createIndexes([
    { key: { organizationId: 1, name: 1 }, unique: true },
    { key: { organizationId: 1, status: 1, reportingYear: -1 } },
    { key: { hierarchyId: 1 } }
  ]);
}

export async function down(db: Db): Promise<void> {
  await db.collection('users').drop();
  await db.collection('projects').drop();
}
```

**Migration Runner**:

```typescript
// scripts/migrate.ts
import { MongoClient } from 'mongodb';
import { config } from 'dotenv';
import * as migrations from '../src/infrastructure/database/migrations';

config();

async function migrate() {
  const client = await MongoClient.connect(process.env.MONGODB_URI);
  const db = client.db(process.env.MONGODB_DATABASE);

  try {
    const migrationFiles = Object.values(migrations).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    for (const migration of migrationFiles) {
      console.log(`Running migration: ${migration.name}`);
      await migration.up(db);
      console.log(`✓ ${migration.name} completed`);
    }

    console.log('All migrations completed successfully');
  } finally {
    await client.close();
  }
}

migrate().catch(console.error);
```

---

## 7. Caching Integration

### 7.1 Redis Module

```typescript
// src/infrastructure/cache/redis/redis.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

@Module({
  imports: [ConfigModule],
  providers: [RedisService],
  exports: [RedisService]
})
export class RedisModule {}

// src/infrastructure/cache/redis/redis.service.ts
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redis: Redis;

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>('redis.url');
    const db = this.configService.get<number>('redis.db');

    this.redis = new Redis(redisUrl, {
      db,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError: (err) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true; // Reconnect
        }
        return false;
      }
    });

    this.redis.on('error', (err) => {
      console.error('Redis connection error:', err);
    });

    this.redis.on('connect', () => {
      console.log('Redis connected');
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);

    if (ttlSeconds) {
      await this.redis.setex(key, ttlSeconds, serialized);
    } else {
      await this.redis.set(key, serialized);
    }
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    let cursor = '0';

    do {
      const [newCursor, keys] = await this.redis.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100
      );
      cursor = newCursor;

      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } while (cursor !== '0');
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
}
```

### 7.2 Cacheable Decorator

```typescript
// src/infrastructure/cache/decorators/cacheable.decorator.ts
import { SetMetadata } from '@nestjs/common';

export interface CacheableOptions {
  ttl: number;
  key?: string | ((args: any[]) => string);
  condition?: (args: any[]) => boolean;
}

export const CACHEABLE_KEY = 'cacheable';

export const Cacheable = (options: CacheableOptions) =>
  SetMetadata(CACHEABLE_KEY, options);

// src/infrastructure/cache/interceptors/cache.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RedisService } from '../redis/redis.service';
import { CACHEABLE_KEY, CacheableOptions } from '../decorators/cacheable.decorator';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly redisService: RedisService
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const options = this.reflector.get<CacheableOptions>(
      CACHEABLE_KEY,
      context.getHandler()
    );

    if (!options) {
      return next.handle();
    }

    // Get method arguments
    const args = context.getArgByIndex(1); // Assumes second argument is the actual parameter

    // Check condition
    if (options.condition && !options.condition(args)) {
      return next.handle();
    }

    // Generate cache key
    const cacheKey =
      typeof options.key === 'function'
        ? options.key(args)
        : options.key || this.generateDefaultKey(context, args);

    // Try to get from cache
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return of(cached);
    }

    // Cache miss - execute method and cache result
    return next.handle().pipe(
      tap(async (result) => {
        await this.redisService.set(cacheKey, result, options.ttl);
      })
    );
  }

  private generateDefaultKey(context: ExecutionContext, args: any): string {
    const className = context.getClass().name;
    const methodName = context.getHandler().name;
    const argsHash = JSON.stringify(args);

    return `${className}:${methodName}:${argsHash}`;
  }
}

// Usage Example
@Injectable()
export class ProjectService {
  @Cacheable({
    ttl: 1800, // 30 minutes
    key: (args) => `project:${args[0]}:metadata`
  })
  async getProjectMetadata(projectId: string): Promise<ProjectMetadata> {
    return this.projectRepository.findMetadataById(projectId);
  }
}
```

---

## 8. Event Bus Integration

### 8.1 EventBridge Module

```typescript
// src/infrastructure/messaging/eventbridge/eventbridge.module.ts
import { Module } from '@nestjs/common';
import { EventBridgeService } from './eventbridge.service';

@Module({
  providers: [EventBridgeService],
  exports: [EventBridgeService]
})
export class EventBridgeModule {}

// src/infrastructure/messaging/eventbridge/eventbridge.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  EventBridgeClient,
  PutEventsCommand,
  PutEventsCommandInput
} from '@aws-sdk/client-eventbridge';

@Injectable()
export class EventBridgeService {
  private readonly client: EventBridgeClient;
  private readonly eventBusName: string;

  constructor(private readonly configService: ConfigService) {
    this.client = new EventBridgeClient({
      region: this.configService.get('aws.region'),
      endpoint: this.configService.get('localstack.endpoint') // For local dev
    });

    this.eventBusName = this.configService.get('eventbridge.busName');
  }

  async publish(event: DomainEvent): Promise<void> {
    const input: PutEventsCommandInput = {
      Entries: [
        {
          EventBusName: this.eventBusName,
          Source: `clenergize.${event.source}`,
          DetailType: event.eventType,
          Detail: JSON.stringify(event.data),
          Time: new Date()
        }
      ]
    };

    const command = new PutEventsCommand(input);
    const response = await this.client.send(command);

    if (response.FailedEntryCount > 0) {
      throw new Error(`Failed to publish event: ${JSON.stringify(response.Entries)}`);
    }
  }

  async publishBatch(events: DomainEvent[]): Promise<void> {
    const entries = events.map((event) => ({
      EventBusName: this.eventBusName,
      Source: `clenergize.${event.source}`,
      DetailType: event.eventType,
      Detail: JSON.stringify(event.data),
      Time: new Date()
    }));

    const input: PutEventsCommandInput = { Entries: entries };
    const command = new PutEventsCommand(input);
    const response = await this.client.send(command);

    if (response.FailedEntryCount > 0) {
      throw new Error(`Failed to publish ${response.FailedEntryCount} events`);
    }
  }
}

// Domain Event Interface
export interface DomainEvent {
  source: string; // 'identity', 'organization', etc.
  eventType: string; // 'identity.user.created.v1'
  data: any;
}
```

---

## 9. Authentication & Authorization

### 9.1 JWT Authentication Guard

```typescript
// src/infrastructure/http/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../../shared/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or expired token');
    }
    return user;
  }
}

// src/infrastructure/http/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwksClient } from '../../../external/jwks-client';
import { UserService } from '../../../application/services/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly jwksClient: JwksClient,
    private readonly userService: UserService,
    private readonly configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      algorithms: ['RS256'],
      issuer: configService.get('jwt.issuer'),
      audience: configService.get('jwt.audience'),
      secretOrKeyProvider: async (request, rawJwtToken, done) => {
        try {
          const decodedToken = jwt.decode(rawJwtToken, { complete: true });
          const kid = decodedToken.header.kid;
          const publicKey = await this.jwksClient.getSigningKey(kid);
          done(null, publicKey);
        } catch (error) {
          done(error, null);
        }
      }
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    if (payload.token_use !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Fetch fresh user data from database
    const user = await this.userService.findByCognitoId(payload.sub);

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }
}
```

### 9.2 Roles Guard

```typescript
// src/infrastructure/http/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../../domain/entities/user.entity';
import { ROLES_KEY } from '../../../shared/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (!requiredRoles) {
      return true; // No role restriction
    }

    const { user } = context.switchToHttp().getRequest();

    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}

// src/shared/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../domain/entities/user.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

// Usage in controller
@Post()
@Roles(UserRole.ADMIN)
async createUser(@Body() dto: CreateUserDto): Promise<User> {
  // Only accessible by users with ADMIN role
}
```

---

## 10. Logging & Monitoring

### 10.1 Winston Logger Configuration

```typescript
// src/shared/config/logger.config.ts
import winston from 'winston';
import WinstonCloudWatch from 'winston-cloudwatch';

export function createLogger(serviceName: string) {
  const transports: winston.transport[] = [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ];

  // Add CloudWatch transport in production
  if (process.env.NODE_ENV === 'production' && process.env.CLOUDWATCH_ENABLED === 'true') {
    transports.push(
      new WinstonCloudWatch({
        logGroupName: process.env.CLOUDWATCH_LOG_GROUP,
        logStreamName: `${process.env.HOSTNAME}-${new Date().toISOString().split('T')[0]}`,
        awsRegion: process.env.AWS_REGION,
        jsonMessage: true
      })
    );
  }

  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    defaultMeta: {
      service: serviceName,
      version: process.env.APP_VERSION,
      environment: process.env.NODE_ENV
    },
    transports
  });
}
```

### 10.2 Logging Interceptor

```typescript
// src/infrastructure/http/interceptors/logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, headers } = request;
    const correlationId = headers['x-correlation-id'] || 'N/A';
    const startTime = Date.now();

    this.logger.log({
      message: 'Incoming request',
      method,
      url,
      correlationId,
      body: this.sanitizeBody(body)
    });

    return next.handle().pipe(
      tap({
        next: (response) => {
          const duration = Date.now() - startTime;

          this.logger.log({
            message: 'Request completed',
            method,
            url,
            correlationId,
            duration,
            statusCode: context.switchToHttp().getResponse().statusCode
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;

          this.logger.error({
            message: 'Request failed',
            method,
            url,
            correlationId,
            duration,
            error: error.message,
            stack: error.stack
          });
        }
      })
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return undefined;

    const sanitized = { ...body };

    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey'];
    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });

    return sanitized;
  }
}
```

### 10.3 CloudWatch Metrics

```typescript
// src/shared/utils/metrics.util.ts
import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';

export class MetricsService {
  private client: CloudWatchClient;
  private metricBuffer: any[] = [];

  constructor() {
    this.client = new CloudWatchClient({ region: process.env.AWS_REGION });

    // Flush metrics every 10 seconds
    setInterval(() => this.flush(), 10000);
  }

  async recordMetric(
    metricName: string,
    value: number,
    unit: string = 'Count',
    dimensions: Record<string, string> = {}
  ): Promise<void> {
    this.metricBuffer.push({
      MetricName: metricName,
      Value: value,
      Unit: unit,
      Timestamp: new Date(),
      Dimensions: Object.entries(dimensions).map(([Name, Value]) => ({ Name, Value }))
    });

    if (this.metricBuffer.length >= 20) {
      await this.flush();
    }
  }

  private async flush(): Promise<void> {
    if (this.metricBuffer.length === 0) return;

    const metrics = this.metricBuffer.splice(0, 20);

    try {
      await this.client.send(
        new PutMetricDataCommand({
          Namespace: 'Clenergize/Application',
          MetricData: metrics
        })
      );
    } catch (error) {
      console.error('Failed to publish metrics', error);
    }
  }
}
```

---

## 11. Error Handling

### 11.1 Custom Exceptions

```typescript
// src/domain/exceptions/base.exception.ts
export abstract class DomainException extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// src/domain/exceptions/user-not-found.exception.ts
export class UserNotFoundException extends DomainException {
  constructor(userId: string) {
    super(
      `User with ID ${userId} not found`,
      'USER_NOT_FOUND',
      404
    );
  }
}

// src/domain/exceptions/invalid-email.exception.ts
export class InvalidEmailException extends DomainException {
  constructor(email: string) {
    super(
      `Invalid email address: ${email}`,
      'INVALID_EMAIL',
      400
    );
  }
}

// src/domain/exceptions/unauthorized.exception.ts
export class UnauthorizedException extends DomainException {
  constructor(message: string = 'Unauthorized access') {
    super(message, 'UNAUTHORIZED', 401);
  }
}
```

### 11.2 Exception Filters

```typescript
// src/infrastructure/http/filters/all-exceptions.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainException } from '../../../domain/exceptions/base.exception';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';
    let details: any = null;

    if (exception instanceof DomainException) {
      // Domain-level exceptions
      status = exception.statusCode;
      message = exception.message;
      code = exception.code;

    } else if (exception instanceof HttpException) {
      // HTTP exceptions
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        code = (exceptionResponse as any).error || 'HTTP_EXCEPTION';
        details = (exceptionResponse as any).details;
      } else {
        message = exception.message;
      }

    } else if (exception instanceof Error) {
      // Generic errors
      message = exception.message;
      code = 'UNEXPECTED_ERROR';
    }

    const errorResponse = {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId: request.headers['x-correlation-id'] || 'N/A'
      }
    };

    // Log error
    this.logger.error({
      message: 'Request failed',
      error: message,
      code,
      statusCode: status,
      path: request.url,
      method: request.method,
      correlationId: request.headers['x-correlation-id'],
      stack: exception instanceof Error ? exception.stack : undefined
    });

    response.status(status).json(errorResponse);
  }
}
```

### 11.3 Response Format

**Success Response**:

```typescript
// src/shared/types/response.types.ts
export interface SuccessResponse<T> {
  success: true;
  data: T;
  metadata?: {
    timestamp: string;
    version: string;
    requestId: string;
  };
}

// src/infrastructure/http/interceptors/transform.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SuccessResponse } from '../../../shared/types/response.types';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, SuccessResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<SuccessResponse<T>> {
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        metadata: {
          timestamp: new Date().toISOString(),
          version: process.env.APP_VERSION || '1.0.0',
          requestId: request.headers['x-correlation-id'] || 'N/A'
        }
      }))
    );
  }
}
```

---

## 12. Testing Strategy

### 12.1 Unit Tests

**Testing Domain Entities**:

```typescript
// test/unit/domain/entities/user.entity.spec.ts
import { User, UserRole, UserStatus } from '../../../../src/domain/entities/user.entity';
import { Email } from '../../../../src/domain/value-objects/email.vo';

describe('User Entity', () => {
  describe('create', () => {
    it('should create a new user with valid data', () => {
      const email = new Email('test@example.com');
      const user = User.create(email, 'John', 'Doe', 'org123');

      expect(user.email.getValue()).toBe('test@example.com');
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.status).toBe(UserStatus.ACTIVE);
      expect(user.roles).toContain(UserRole.VIEWER);
    });

    it('should publish UserCreatedEvent on creation', () => {
      const email = new Email('test@example.com');
      const user = User.create(email, 'John', 'Doe', 'org123');

      const events = user.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0].constructor.name).toBe('UserCreatedEvent');
    });
  });

  describe('activate', () => {
    it('should activate inactive user', () => {
      const user = new User(
        '1',
        new Email('test@example.com'),
        'John',
        'Doe',
        'org123',
        [UserRole.VIEWER],
        UserStatus.INACTIVE,
        new Date(),
        new Date()
      );

      user.activate();
      expect(user.status).toBe(UserStatus.ACTIVE);
    });

    it('should throw error if already active', () => {
      const user = new User(
        '1',
        new Email('test@example.com'),
        'John',
        'Doe',
        'org123',
        [UserRole.VIEWER],
        UserStatus.ACTIVE,
        new Date(),
        new Date()
      );

      expect(() => user.activate()).toThrow('User is already active');
    });
  });

  describe('assignRole', () => {
    it('should add new role to user', () => {
      const user = User.create(
        new Email('test@example.com'),
        'John',
        'Doe',
        'org123'
      );

      user.assignRole(UserRole.CONTRIBUTOR);
      expect(user.roles).toContain(UserRole.CONTRIBUTOR);
    });

    it('should throw error if role already assigned', () => {
      const user = User.create(
        new Email('test@example.com'),
        'John',
        'Doe',
        'org123',
        [UserRole.CONTRIBUTOR]
      );

      expect(() => user.assignRole(UserRole.CONTRIBUTOR)).toThrow(
        'User already has role: CONTRIBUTOR'
      );
    });
  });
});
```

**Testing Command Handlers**:

```typescript
// test/unit/application/commands/create-user.handler.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { EventBus } from '@nestjs/cqrs';
import { CreateUserHandler } from '../../../../src/application/commands/create-user/create-user.handler';
import { CreateUserCommand } from '../../../../src/application/commands/create-user/create-user.command';
import { IUserRepository, USER_REPOSITORY } from '../../../../src/domain/repositories/user.repository.interface';

describe('CreateUserHandler', () => {
  let handler: CreateUserHandler;
  let userRepository: jest.Mocked<IUserRepository>;
  let eventBus: jest.Mocked<EventBus>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserHandler,
        {
          provide: USER_REPOSITORY,
          useValue: {
            findByEmail: jest.fn(),
            save: jest.fn()
          }
        },
        {
          provide: EventBus,
          useValue: {
            publish: jest.fn()
          }
        }
      ]
    }).compile();

    handler = module.get<CreateUserHandler>(CreateUserHandler);
    userRepository = module.get(USER_REPOSITORY);
    eventBus = module.get(EventBus);
  });

  it('should create user successfully', async () => {
    const command = new CreateUserCommand(
      'test@example.com',
      'John',
      'Doe',
      'org123'
    );

    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.save.mockResolvedValue({
      id: '1',
      email: { getValue: () => 'test@example.com' },
      firstName: 'John',
      lastName: 'Doe'
    } as any);

    const result = await handler.execute(command);

    expect(result.id).toBe('1');
    expect(userRepository.save).toHaveBeenCalled();
    expect(eventBus.publish).toHaveBeenCalled();
  });

  it('should throw error if user already exists', async () => {
    const command = new CreateUserCommand(
      'existing@example.com',
      'John',
      'Doe',
      'org123'
    );

    userRepository.findByEmail.mockResolvedValue({} as any);

    await expect(handler.execute(command)).rejects.toThrow(
      'User with this email already exists'
    );
  });
});
```

### 12.2 Integration Tests

**Testing API Endpoints**:

```typescript
// test/integration/api/user.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('UserController (Integration)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let authToken: string;

  beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongoUri),
        AppModule
      ]
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Get auth token
    const authResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@example.com', password: 'password' });

    authToken = authResponse.body.data.accessToken;
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  describe('POST /api/v1/users', () => {
    it('should create a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'newuser@example.com',
          firstName: 'John',
          lastName: 'Doe',
          organizationId: '507f1f77bcf86cd799439011'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('newuser@example.com');
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'invalid-email',
          firstName: 'John',
          lastName: 'Doe',
          organizationId: '507f1f77bcf86cd799439011'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toContain('VALIDATION');
    });

    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/users')
        .send({
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          organizationId: '507f1f77bcf86cd799439011'
        })
        .expect(401);
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('should get user by ID', async () => {
      // First create a user
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'gettest@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          organizationId: '507f1f77bcf86cd799439011'
        });

      const userId = createResponse.body.data.id;

      // Then get the user
      const response = await request(app.getHttpServer())
        .get(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.id).toBe(userId);
      expect(response.body.data.email).toBe('gettest@example.com');
    });

    it('should return 404 for non-existent user', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/507f1f77bcf86cd799439999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
```

### 12.3 E2E Tests

```typescript
// test/e2e/user-workflow.e2e-spec.ts
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('User Workflow (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should complete full user lifecycle', async () => {
    // 1. Login as admin
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@example.com', password: 'password' })
      .expect(200);

    const authToken = loginResponse.body.data.accessToken;

    // 2. Create user
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        email: 'e2etest@example.com',
        firstName: 'E2E',
        lastName: 'Test',
        organizationId: '507f1f77bcf86cd799439011',
        roles: ['CONTRIBUTOR']
      })
      .expect(201);

    const userId = createResponse.body.data.id;

    // 3. Get user
    await request(app.getHttpServer())
      .get(`/api/v1/users/${userId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    // 4. Update user
    await request(app.getHttpServer())
      .put(`/api/v1/users/${userId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ firstName: 'Updated' })
      .expect(200);

    // 5. Verify update
    const getResponse = await request(app.getHttpServer())
      .get(`/api/v1/users/${userId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(getResponse.body.data.firstName).toBe('Updated');

    // 6. Delete user
    await request(app.getHttpServer())
      .delete(`/api/v1/users/${userId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(204);

    // 7. Verify deletion
    await request(app.getHttpServer())
      .get(`/api/v1/users/${userId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);
  });
});
```

### 12.4 Test Configuration

**Jest Config** (`jest.config.js`):

```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/**/*.module.ts',
    '!src/main.ts',
    '!src/**/*.dto.ts',
    '!src/**/*.interface.ts'
  ],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1'
  }
};
```

---

## 13. Docker Configuration

### 13.1 Dockerfile (Production)

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build application
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Install dumb-init (for proper signal handling)
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy dependencies from builder
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); });"

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]
```

### 13.2 Dockerfile.dev (Development)

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start in watch mode
CMD ["npm", "run", "start:dev"]
```

### 13.3 Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Identity Service
  identity-service:
    build:
      context: ./NEW/identity-service
      dockerfile: Dockerfile.dev
    container_name: identity-service
    ports:
      - '3001:3001'
    environment:
      - NODE_ENV=development
      - PORT=3001
      - SERVICE_NAME=identity-service
      - MONGODB_URI=mongodb://admin:localdev123@mongodb:27017/?authSource=admin
      - MONGODB_DATABASE=clenergize_identity
      - REDIS_URL=redis://redis:6379
      - JWT_ISSUER=${JWT_ISSUER}
      - JWT_AUDIENCE=${JWT_AUDIENCE}
      - COGNITO_JWKS_URI=${COGNITO_JWKS_URI}
      - LOCALSTACK_ENDPOINT=http://localstack:4566
      - AWS_REGION=us-east-1
      - AWS_ACCESS_KEY_ID=test
      - AWS_SECRET_ACCESS_KEY=test
    volumes:
      - ./NEW/identity-service/src:/app/src
      - ./NEW/identity-service/node_modules:/app/node_modules
    depends_on:
      - mongodb
      - redis
      - localstack
    networks:
      - clenergize

  # MongoDB
  mongodb:
    image: mongo:7
    container_name: clenergize-mongodb
    ports:
      - '27017:27017'
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: localdev123
    volumes:
      - mongodb_data:/data/db
      - ./docker/mongo-init.js:/docker-entrypoint-initdb.d/init.js:ro
    networks:
      - clenergize

  # Redis
  redis:
    image: redis:7-alpine
    container_name: clenergize-redis
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    networks:
      - clenergize

  # LocalStack (AWS emulation)
  localstack:
    image: localstack/localstack:latest
    container_name: clenergize-localstack
    ports:
      - '4566:4566'
    environment:
      - SERVICES=s3,sqs,eventbridge,secretsmanager
      - DEBUG=1
      - DATA_DIR=/tmp/localstack/data
    volumes:
      - ./docker/localstack-init.sh:/etc/localstack/init/ready.d/init.sh
      - localstack_data:/tmp/localstack
    networks:
      - clenergize

volumes:
  mongodb_data:
  redis_data:
  localstack_data:

networks:
  clenergize:
    driver: bridge
```

### 13.4 Initialization Scripts

**MongoDB Init** (`docker/mongo-init.js`):

```javascript
// Create databases and users
db = db.getSiblingDB('clenergize_identity');
db.createUser({
  user: 'identity_user',
  pwd: 'identity_password',
  roles: [{ role: 'readWrite', db: 'clenergize_identity' }]
});

db = db.getSiblingDB('clenergize_organization');
db.createUser({
  user: 'organization_user',
  pwd: 'organization_password',
  roles: [{ role: 'readWrite', db: 'clenergize_organization' }]
});

// ... other services
```

**LocalStack Init** (`docker/localstack-init.sh`):

```bash
#!/bin/bash

# Create S3 buckets
awslocal s3 mb s3://clenergize-reports
awslocal s3 mb s3://clenergize-uploads

# Create SQS queues
awslocal sqs create-queue --queue-name clenergize-report-queue

# Create EventBridge event bus
awslocal events create-event-bus --name clenergize-events

# Create secrets
awslocal secretsmanager create-secret \
  --name /clenergize/development/identity-service/mongodb-password \
  --secret-string '{"username":"identity_user","password":"identity_password"}'

echo "LocalStack initialization complete"
```

---

## 14. Example Implementations

### 14.1 Complete Service Implementation

**Bootstrap** (`src/main.ts`):

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './infrastructure/http/filters/all-exceptions.filter';
import { LoggingInterceptor } from './infrastructure/http/interceptors/logging.interceptor';
import { TransformInterceptor } from './infrastructure/http/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose']
  });

  const configService = app.get(ConfigService);

  // Global prefix
  app.setGlobalPrefix('api');

  // Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1'
  });

  // Security
  app.use(helmet());
  app.enableCors({
    origin: configService.get('app.corsOrigins'),
    credentials: true
  });

  // Compression
  app.use(compression());

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true
      }
    })
  );

  // Global filters
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor()
  );

  // Swagger documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Clenergize Identity Service')
    .setDescription('Identity and authentication service API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('users')
    .addTag('auth')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // Graceful shutdown
  app.enableShutdownHooks();

  const port = configService.get('app.port');
  await app.listen(port);

  console.log(`🚀 Application running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
```

### 14.2 Package.json

```json
{
  "name": "identity-service",
  "version": "1.0.0",
  "description": "Clenergize Identity Service",
  "scripts": {
    "prebuild": "rimraf dist",
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "migrate": "ts-node scripts/migrate.ts",
    "seed": "ts-node scripts/seed-db.ts"
  },
  "dependencies": {
    "@aws-sdk/client-cloudwatch": "^3.450.0",
    "@aws-sdk/client-eventbridge": "^3.450.0",
    "@aws-sdk/client-s3": "^3.450.0",
    "@aws-sdk/client-secrets-manager": "^3.450.0",
    "@nestjs/common": "^10.0.0",
    "@nestjs/config": "^3.1.1",
    "@nestjs/core": "^10.0.0",
    "@nestjs/cqrs": "^10.2.6",
    "@nestjs/mongoose": "^10.0.2",
    "@nestjs/passport": "^10.0.3",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/swagger": "^7.1.16",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.0",
    "compression": "^1.7.4",
    "helmet": "^7.1.0",
    "ioredis": "^5.3.2",
    "joi": "^17.11.0",
    "jwks-rsa": "^3.1.0",
    "mongoose": "^8.0.3",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1",
    "winston": "^3.11.0",
    "winston-cloudwatch": "^6.2.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/compression": "^1.7.5",
    "@types/express": "^4.17.17",
    "@types/jest": "^29.5.2",
    "@types/node": "^20.3.1",
    "@types/passport-jwt": "^4.0.0",
    "@types/supertest": "^6.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.42.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-prettier": "^5.0.0",
    "jest": "^29.5.0",
    "mongodb-memory-server": "^9.1.3",
    "prettier": "^3.0.0",
    "rimraf": "^5.0.5",
    "supertest": "^6.3.3",
    "ts-jest": "^29.1.0",
    "ts-loader": "^9.4.3",
    "ts-node": "^10.9.1",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.1.3"
  }
}
```

### 14.3 Environment File Template

```bash
# .env.example

# Application
NODE_ENV=development
PORT=3001
SERVICE_NAME=identity-service
APP_VERSION=1.0.0
LOG_LEVEL=debug

# MongoDB
MONGODB_URI=mongodb://admin:localdev123@localhost:27017/?authSource=admin
MONGODB_DATABASE=clenergize_identity
DB_MIN_POOL_SIZE=10
DB_MAX_POOL_SIZE=100

# Redis
REDIS_URL=redis://localhost:6379
REDIS_DB_SESSION=0
REDIS_DB_CACHE=1

# JWT / Cognito
JWT_ISSUER=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_XXXXXXXXX
JWT_AUDIENCE=your-client-id
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_CLIENT_ID=your-client-id
COGNITO_JWKS_URI=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_XXXXXXXXX/.well-known/jwks.json

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test

# LocalStack (for local development)
LOCALSTACK_ENDPOINT=http://localhost:4566

# EventBridge
EVENT_BUS_NAME=clenergize-events

# Secrets Manager
SECRETS_PREFIX=/clenergize/development/identity-service

# CloudWatch
CLOUDWATCH_LOG_GROUP=/clenergize/development/identity-service
CLOUDWATCH_ENABLED=true

# CORS
CORS_ENABLED=true
CORS_ORIGINS=http://localhost:3000,http://localhost:3005

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# Timeouts
REQUEST_TIMEOUT=30000
SHUTDOWN_TIMEOUT=5000
```

---

## Summary

This NestJS Service Template Design provides a comprehensive blueprint for building production-ready Clenergize microservices with:

1. **Clean Architecture** - DDD layering with clear separation of concerns
2. **CQRS Pattern** - Command/Query separation for scalability
3. **Event-Driven** - Domain events with EventBridge integration
4. **Security First** - JWT/JWKS, RBAC, input validation, rate limiting
5. **Observability** - Structured logging, distributed tracing, CloudWatch metrics
6. **Caching** - Redis integration with declarative caching
7. **Testing** - Comprehensive unit, integration, and E2E tests
8. **Docker Ready** - Multi-stage builds with security best practices
9. **Developer Experience** - TypeScript strict mode, auto-generated API docs, hot reload

### Quick Start Checklist

```bash
# 1. Clone template
git clone <template-repo> my-service
cd my-service

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your values

# 4. Start dependencies (Docker)
docker-compose up -d mongodb redis localstack

# 5. Run migrations
npm run migrate

# 6. Seed database (optional)
npm run seed

# 7. Start development server
npm run start:dev

# 8. Run tests
npm test
npm run test:e2e

# 9. Build for production
npm run build

# 10. Start production server
npm run start:prod
```

### Next Steps

1. ✅ **Completed**: NestJS Service Template Design
2. **Next**: Next.js Frontend Template
3. **Next**: Shared Packages Design
4. **Next**: CI/CD Pipeline Templates

---

**Document Complete**: November 18, 2025
