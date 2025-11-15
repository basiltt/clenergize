# OLD to NEW Code Migration Guide

## ⚠️ CRITICAL: Never Copy-Paste from OLD Code

This guide helps agents properly migrate functionality from OLD services to NEW services while fixing all identified issues.

## Top 10 Critical Issues from OLD Code to Fix

### 1. ❌ JWT Verification (CRITICAL SECURITY)

**OLD (VULNERABLE):**
```typescript
// clenergizeV3-backend-ms-dev/src/AUTHENTICATION/
const decoded = jwt.decode(token);  // NO VERIFICATION!
const secret = process.env.JWT_SECRET || 'default-secret-key';  // HARDCODED FALLBACK!
```

**NEW (SECURE):**
```typescript
// NEW/identity-service/src/infrastructure/auth/
import { JwksClient } from 'jwks-rsa';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtVerificationService {
  private jwksClient: JwksClient;
  
  constructor(private configService: ConfigService) {
    this.jwksClient = new JwksClient({
      jwksUri: configService.get('JWT_JWKS_URI'),
      cache: true,
      rateLimit: true
    });
  }
  
  async verifyToken(token: string): Promise<JwtPayload> {
    const decoded = jwt.decode(token, { complete: true });
    const key = await this.jwksClient.getSigningKey(decoded.header.kid);
    
    return jwt.verify(token, key.getPublicKey(), {
      algorithms: ['RS256'],
      issuer: this.configService.get('JWT_ISSUER'),
      audience: this.configService.get('JWT_AUDIENCE')
    });
  }
}
```

### 2. ❌ Hierarchy Cloning (DATA DUPLICATION)

**OLD (BAD):**
```typescript
// clenergizeV3-project-management-ms-dev
async createProject(dto: CreateProjectDto) {
  const templateHierarchy = await this.getTemplate();
  const project = {
    entities: [...cloneDeep(templateHierarchy.entities)],  // CLONING!
    subsidiaries: [...cloneDeep(templateHierarchy.subsidiaries)],
    locations: [...cloneDeep(templateHierarchy.locations)]
  };
  // Results in massive data duplication
}
```

**NEW (REFERENCES):**
```typescript
// NEW/organization-service/src/domain/project/
@Injectable()
export class ProjectService {
  async createProject(dto: CreateProjectDto): Promise<Project> {
    const template = await this.templateRepo.findById(dto.templateId);
    
    const project = Project.create({
      name: dto.name,
      companyId: dto.companyId,
      hierarchyRef: template.hierarchyId,  // Just reference!
      templateVersion: template.version,
      customizations: dto.customizations || []
    });
    
    await this.projectRepo.save(project);
    await this.eventBus.publish(new ProjectCreatedEvent(project));
    
    return project;
  }
  
  async getProjectHierarchy(projectId: string): Promise<Hierarchy> {
    const project = await this.projectRepo.findById(projectId);
    const hierarchy = await this.hierarchyRepo.findById(project.hierarchyRef);
    return hierarchy.applyCustomizations(project.customizations);
  }
}
```

### 3. ❌ Infinite SQS Polling (RESOURCE EXHAUSTION)

**OLD (BLOCKS FOREVER):**
```typescript
// clenergizeV3-backend-ms-dev
async startSQSConsumer() {
  while (true) {  // INFINITE LOOP!
    const messages = await this.sqs.receiveMessage({
      QueueUrl: this.queueUrl,
      WaitTimeSeconds: 20
    }).promise();
    // No shutdown mechanism, blocks forever
  }
}
```

**NEW (GRACEFUL):**
```typescript
// NEW/shared/infrastructure/messaging/
@Injectable()
export class SQSConsumer implements OnModuleInit, OnModuleDestroy {
  private isShutdown = false;
  private activePolls = 0;
  
  async onModuleInit() {
    this.startPolling();
  }
  
  async onModuleDestroy() {
    this.isShutdown = true;
    await this.waitForActivePolls();
  }
  
  private async startPolling() {
    while (!this.isShutdown) {
      this.activePolls++;
      try {
        await this.pollMessages();
      } catch (error) {
        await this.handleError(error);
        await this.backoff();
      } finally {
        this.activePolls--;
      }
    }
  }
  
  private async pollMessages() {
    const messages = await this.sqs.receiveMessage({
      QueueUrl: this.queueUrl,
      WaitTimeSeconds: 10,  // Shorter for responsiveness
      MaxNumberOfMessages: 10
    }).promise();
    
    if (messages.Messages) {
      await Promise.all(
        messages.Messages.map(msg => this.processMessage(msg))
      );
    }
  }
}
```

### 4. ❌ No Transaction Boundaries

**OLD (PARTIAL WRITES):**
```typescript
// clenergizeV3-project-management-ms-dev
async createProjectWithHierarchy(dto: any) {
  // No transaction!
  const project = await this.projectModel.create(dto.project);
  const entities = await this.entityModel.create(dto.entities);  // Could fail!
  const subsidiaries = await this.subsidiaryModel.create(dto.subsidiaries);  // Inconsistent!
}
```

**NEW (TRANSACTIONAL):**
```typescript
// NEW/organization-service/src/application/commands/
@Injectable()
export class CreateProjectHandler {
  async execute(command: CreateProjectCommand): Promise<void> {
    const session = await this.mongoClient.startSession();
    
    try {
      await session.withTransaction(async () => {
        // All operations in transaction
        const project = await this.projectRepo.create(command.project, session);
        const hierarchy = await this.hierarchyRepo.create(command.hierarchy, session);
        await this.linkProjectHierarchy(project.id, hierarchy.id, session);
        
        // Events published after transaction commits
        this.eventQueue.add(new ProjectCreatedEvent(project));
      });
    } finally {
      await session.endSession();
    }
  }
}
```

### 5. ❌ Denormalized Data (UPDATE ANOMALIES)

**OLD (DENORMALIZED):**
```typescript
// clenergizeV3-project-management-ms-dev
interface Project {
  companyId: string;
  companyName: string;  // DENORMALIZED! What if company renames?
  users: Array<{
    userId: string;
    userName: string;  // DENORMALIZED!
    userEmail: string; // DENORMALIZED!
  }>;
}
```

**NEW (NORMALIZED):**
```typescript
// NEW/organization-service/src/domain/entities/
export class Project {
  id: string;
  companyId: string;  // Just the reference
  userRoles: UserRole[];  // Just IDs and roles
}

export class UserRole {
  userId: string;  // Just the ID
  projectId: string;
  role: Role;
  permissions: Permission[];
}

// Service layer handles joins
@Injectable()
export class ProjectQueryService {
  async getProjectWithDetails(projectId: string): Promise<ProjectDetailsDto> {
    const project = await this.projectRepo.findById(projectId);
    const company = await this.companyService.getById(project.companyId);
    const users = await this.identityService.getUsersByIds(
      project.userRoles.map(ur => ur.userId)
    );
    
    return this.mapToDetailsDto(project, company, users);
  }
}
```

### 6. ❌ Permissions as Nested Objects (UNQUERYABLE)

**OLD (NESTED MESS):**
```typescript
// clenergizeV3-project-management-ms-dev
interface UserPermissions {
  scopes: {
    [projectId: string]: {
      permissions: {
        [module: string]: string[];  // Impossible to query!
      }
    }
  }
}
```

**NEW (NORMALIZED):**
```typescript
// NEW/identity-service/src/domain/authorization/
export class Permission {
  id: string;
  userId: string;
  resourceType: ResourceType;  // 'project', 'company', etc.
  resourceId: string;
  module: Module;  // Enum
  actions: Action[];  // Enum[]
  
  // Indexed for queries
  @Index({ userId: 1, resourceType: 1, resourceId: 1 })
  @Index({ module: 1, actions: 1 })
}

// Easy to query
class PermissionRepository {
  async getUserPermissions(userId: string, projectId: string): Promise<Permission[]> {
    return this.model.find({
      userId,
      resourceId: projectId,
      resourceType: ResourceType.PROJECT
    });
  }
}
```

### 7. ❌ V1 Folder Duplication

**OLD (DUPLICATED):**
```
clenergizeV3-backend-ms-dev/src/
├── MOBILE-COMBUSTION/
├── MOBILE-COMBUSTION-V1/  # Duplicate!
├── STATIONARY-COMBUSTION/
├── STATIONARY-COMBUSTION-V1/  # Duplicate!
```

**NEW (VERSIONED ALGORITHMS):**
```typescript
// NEW/calculation-service/src/domain/algorithms/
interface CalculationAlgorithm {
  version: string;
  calculate(input: any): EmissionResult;
}

@Injectable()
export class AlgorithmRegistry {
  private algorithms = new Map<string, CalculationAlgorithm>();
  
  register(type: string, version: string, algorithm: CalculationAlgorithm) {
    this.algorithms.set(`${type}:${version}`, algorithm);
  }
  
  getAlgorithm(type: string, version: string = 'latest'): CalculationAlgorithm {
    return this.algorithms.get(`${type}:${version}`);
  }
}

// Algorithms as plugins
@Algorithm('mobile-combustion', 'v1')
export class MobileCombustionV1 implements CalculationAlgorithm {
  calculate(input: MobileCombustionInput): EmissionResult {
    // V1 logic
  }
}

@Algorithm('mobile-combustion', 'v2')
export class MobileCombustionV2 implements CalculationAlgorithm {
  calculate(input: MobileCombustionInput): EmissionResult {
    // V2 logic with improvements
  }
}
```

### 8. ❌ No Config Validation

**OLD (SCATTERED):**
```typescript
// Found throughout OLD services
const mongoUri = process.env.MONGO_URI;  // What if undefined?
const port = process.env.PORT || 3000;  // Inconsistent defaults
const secret = process.env.SECRET || 'default';  // Security risk!
```

**NEW (VALIDATED):**
```typescript
// NEW/shared/config/
import { z } from 'zod';

const ConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.number().min(1000).max(65535),
  
  MONGODB_URI: z.string().url(),
  MONGODB_DATABASE: z.string().min(1),
  
  JWT_ISSUER: z.string().url(),
  JWT_AUDIENCE: z.string().min(1),
  JWT_JWKS_URI: z.string().url(),
  
  AWS_REGION: z.string(),
  AWS_SQS_QUEUE_URL: z.string().url(),
  
  REDIS_URL: z.string().url(),
  
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']),
});

@Module()
export class ConfigModule {
  static forRoot(): DynamicModule {
    return {
      module: ConfigModule,
      providers: [
        {
          provide: CONFIG,
          useFactory: () => {
            const config = ConfigSchema.parse(process.env);
            return config;
          },
        },
      ],
      exports: [CONFIG],
    };
  }
}
```

### 9. ❌ No Error Taxonomy

**OLD (GENERIC):**
```typescript
// Throughout OLD code
throw new BadRequestException('Something went wrong');
throw new Error('Failed');
```

**NEW (DOMAIN ERRORS):**
```typescript
// NEW/shared/domain/errors/
export abstract class DomainError extends Error {
  abstract code: string;
  abstract statusCode: number;
}

export class ProjectNotFoundError extends DomainError {
  code = 'PROJECT_NOT_FOUND';
  statusCode = 404;
  
  constructor(projectId: string) {
    super(`Project ${projectId} not found`);
  }
}

export class InsufficientPermissionsError extends DomainError {
  code = 'INSUFFICIENT_PERMISSIONS';
  statusCode = 403;
  
  constructor(required: Permission[], actual: Permission[]) {
    super(`Missing permissions: ${this.getMissing(required, actual)}`);
  }
}

// Global error handler
@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter {
  catch(error: DomainError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    
    response.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
```

### 10. ❌ No Event Contracts

**OLD (STRINGS & TYPOS):**
```typescript
// clenergizeV3-project-management-ms-dev
this.eventEmitter.emit('permission-granded', data);  // TYPO!
this.eventEmitter.emit('user-created', { userId });  // No schema!
```

**NEW (TYPED EVENTS):**
```typescript
// NEW/shared/contracts/events/
export abstract class DomainEvent {
  abstract readonly type: string;
  readonly timestamp = new Date();
  readonly correlationId: string;
  
  constructor(correlationId?: string) {
    this.correlationId = correlationId || uuid();
  }
}

export class UserCreatedEvent extends DomainEvent {
  readonly type = 'Identity.User.Created';
  
  constructor(
    public readonly payload: {
      userId: string;
      email: string;
      roles: string[];
    },
    correlationId?: string
  ) {
    super(correlationId);
  }
}

// Type-safe event bus
@Injectable()
export class EventBus {
  publish<T extends DomainEvent>(event: T): Promise<void> {
    return this.sqs.sendMessage({
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify(event),
      MessageAttributes: {
        eventType: { StringValue: event.type },
        correlationId: { StringValue: event.correlationId }
      }
    }).promise();
  }
}
```

## Migration Patterns

### Pattern 1: Service Decomposition

```typescript
// OLD: Mixed concerns in one service
// clenergizeV3-carbon-footprint-ms-dev has both data collection and calculations

// NEW: Split into focused services
// activity-service/ - Data collection, validation, import/export
// calculation-service/ - Emission calculations, aggregations
```

### Pattern 2: Event-Driven Updates

```typescript
// OLD: Direct database updates across services
await this.userModel.updateMany({ companyId }, { companyName: newName });

// NEW: Event-driven propagation
await this.eventBus.publish(new CompanyRenamedEvent({ companyId, newName }));
// Each service handles the event independently
```

### Pattern 3: Repository Pattern

```typescript
// OLD: Direct MongoDB usage everywhere
const users = await this.userModel.find({ email }).exec();

// NEW: Repository abstraction
interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

class MongoUserRepository implements UserRepository {
  // MongoDB implementation details hidden
}
```

### Pattern 4: CQRS Separation

```typescript
// OLD: Mixed read/write in same method
async updateAndGet(id: string, data: any) {
  await this.model.update(id, data);
  return this.model.findById(id);
}

// NEW: Separate command and query
class UpdateProjectCommand {
  constructor(public projectId: string, public changes: Changes) {}
}

class GetProjectQuery {
  constructor(public projectId: string) {}
}
```

## Testing Migration

### OLD Test Issues
```typescript
// OLD: No tests or minimal coverage
// Tests mixed with implementation
// No test data factories
```

### NEW Testing Strategy
```typescript
// NEW: Comprehensive testing

// 1. Unit tests for domain logic
describe('Project', () => {
  it('should create project with valid data', () => {
    const project = Project.create(validData);
    expect(project.isValid()).toBe(true);
  });
});

// 2. Integration tests for repositories
describe('ProjectRepository', () => {
  it('should save and retrieve project', async () => {
    const project = await repository.save(testProject);
    const retrieved = await repository.findById(project.id);
    expect(retrieved).toEqual(project);
  });
});

// 3. E2E tests for workflows
describe('Create Project Workflow', () => {
  it('should create project with hierarchy', async () => {
    const response = await request(app)
      .post('/projects')
      .send(createProjectDto);
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });
});
```

## Performance Improvements

### OLD Performance Issues
- N+1 queries in loops
- No caching
- Sequential processing
- Unbounded queries

### NEW Performance Patterns
```typescript
// 1. Batch loading
const users = await this.userService.findByIds(userIds);  // One query

// 2. Caching
@Cacheable({ ttl: 300 })
async getEmissionFactor(id: string): Promise<EmissionFactor> {
  return this.repository.findById(id);
}

// 3. Parallel processing
await Promise.all(
  projects.map(p => this.processProject(p))
);

// 4. Pagination
async findProjects(page: number, limit: number) {
  return this.model.find()
    .skip((page - 1) * limit)
    .limit(limit);
}
```

## Checklist for Each Service Migration

- [ ] Review OLD service code completely
- [ ] Identify all issues from DESIGN-REVIEW.md
- [ ] Create NEW service structure
- [ ] Fix JWT verification if applicable
- [ ] Convert cloned data to references
- [ ] Add transaction boundaries
- [ ] Normalize denormalized data
- [ ] Create proper error types
- [ ] Define event contracts
- [ ] Implement repository pattern
- [ ] Add comprehensive logging
- [ ] Write unit tests (80% coverage)
- [ ] Write integration tests
- [ ] Document API contracts
- [ ] Performance test critical paths
- [ ] Security scan
- [ ] Create migration scripts for data

## Red Flags in OLD Code

If you see any of these in OLD code, DO NOT COPY:

- 🚫 `jwt.decode()` without `jwt.verify()`
- 🚫 `process.env.X || 'default-value'`
- 🚫 `while(true)` loops
- 🚫 `cloneDeep()` or spread operators on entities
- 🚫 Nested permission objects
- 🚫 Company/user names stored redundantly
- 🚫 `-V1` folder suffixes
- 🚫 Direct MongoDB operations without transactions
- 🚫 Generic error messages
- 🚫 String-based event names

## Remember

**The goal is not to port OLD code, but to rebuild it correctly!**

Every line of NEW code should be:
- Secure
- Testable  
- Maintainable
- Performant
- Observable

When in doubt, consult the Architecture Agent or Master Coordinator.
