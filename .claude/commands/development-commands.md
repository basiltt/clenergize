# Development Commands

## Service Generation Commands

### /generate-service [name] [type]
Generate a new microservice with clean architecture.

**Usage**: `/generate-service notification-service standard`

**Parameters**:
- `name`: Service name (e.g., notification-service)
- `type`: Service type (standard, event-driven, batch-processor)

**Actions**:
1. Creates service directory structure
2. Generates NestJS boilerplate with fixed patterns
3. Sets up MongoDB connection with transactions
4. Implements JWT verification correctly
5. Adds health check endpoints
6. Creates Docker configuration
7. Updates docker-compose.yml

### /fix-old-issue [issue-code] [service]
Apply specific fix for known OLD code issues.

**Usage**: `/fix-old-issue C1 identity-service`

**Issue Codes**:
- `C1`: JWT decode without verification
- `C2`: Infinite SQS polling loops
- `C3`: Hierarchy cloning (300% data bloat)
- `C4`: Missing pagination (OOM crashes)
- `C5`: Denormalized data everywhere
- `C6`: No transaction boundaries
- `C7`: Hardcoded secrets
- `C8`: Missing error handling
- `C9`: Direct database access
- `C10`: No event contracts

### /generate-crud [service] [entity]
Generate CRUD operations with proper patterns.

**Usage**: `/generate-crud organization-service project`

**Generated Files**:
```
src/
├── domain/
│   └── entities/project.entity.ts
├── application/
│   ├── commands/
│   │   ├── create-project.command.ts
│   │   ├── update-project.command.ts
│   │   └── delete-project.command.ts
│   └── queries/
│       ├── get-project.query.ts
│       └── list-projects.query.ts
├── infrastructure/
│   ├── repositories/project.repository.ts
│   └── controllers/project.controller.ts
└── test/
    └── project.spec.ts
```

### /add-endpoint [service] [method] [path]
Add a new API endpoint to a service.

**Usage**: `/add-endpoint calculation-service POST /calculations/bulk`

**Features Added**:
- Proper JWT authentication
- Input validation with class-validator
- Transaction support
- Event publishing
- Error handling
- OpenAPI documentation

### /implement-saga [name] [steps]
Implement a distributed saga pattern.

**Usage**: `/implement-saga project-creation "create-org,assign-users,setup-hierarchy"`

**Generated**:
```typescript
class ProjectCreationSaga {
  private steps = [
    { service: 'organization', action: 'create-org', compensate: 'delete-org' },
    { service: 'identity', action: 'assign-users', compensate: 'unassign-users' },
    { service: 'organization', action: 'setup-hierarchy', compensate: 'remove-hierarchy' }
  ];

  async execute(context: SagaContext): Promise<void> {
    // Implementation with automatic rollback on failure
  }
}
```

## Code Quality Commands

### /refactor-to-ddd [old-file]
Refactor OLD code to Domain-Driven Design patterns.

**Usage**: `/refactor-to-ddd OLD/clenergizeV3-backend-ms-dev/src/user/user.service.ts`

**Transformations**:
- Extracts business logic to domain layer
- Separates commands and queries (CQRS)
- Adds proper value objects
- Implements aggregates
- Creates domain events

### /add-monitoring [service]
Add comprehensive monitoring to a service.

**Usage**: `/add-monitoring calculation-service`

**Adds**:
- Prometheus metrics
- Distributed tracing with OpenTelemetry
- Structured logging with correlation IDs
- Performance profiling
- Custom CloudWatch metrics

### /optimize-query [file] [method]
Optimize database queries to prevent N+1 problems.

**Usage**: `/optimize-query project.repository.ts findWithActivities`

**Optimizations**:
- Converts to aggregation pipeline
- Adds proper indexes
- Implements batch loading
- Adds query result caching
- Uses projection for needed fields only

## Local Development Commands

### /docker-up [services]
Start specific services in Docker.

**Usage**: `/docker-up identity,organization,mongodb`

**Options**:
- `all`: Start all services
- `core`: Start core services only
- `[service1,service2]`: Start specific services

### /seed-data [environment]
Seed database with test data.

**Usage**: `/seed-data local`

**Environments**:
- `local`: Minimal test data
- `dev`: Full development dataset
- `demo`: Demo-ready data with real-looking values
- `performance`: Large dataset for performance testing

### /reset-service [name]
Reset a service to clean state.

**Usage**: `/reset-service calculation-service`

**Actions**:
1. Stops service container
2. Clears service database
3. Resets Redis cache
4. Clears SQS queues
5. Rebuilds container
6. Runs migrations
7. Seeds initial data

### /debug-mode [service] [level]
Enable debug mode for a service.

**Usage**: `/debug-mode identity-service verbose`

**Levels**:
- `basic`: HTTP requests and responses
- `verbose`: Include database queries
- `trace`: Full execution trace with timing

## API Development Commands

### /generate-client [service] [language]
Generate typed API client from OpenAPI spec.

**Usage**: `/generate-client organization-service typescript`

**Supported Languages**:
- `typescript`: TypeScript with axios
- `python`: Python with requests
- `go`: Go client
- `csharp`: C# with HttpClient

### /test-endpoint [service] [endpoint] [payload]
Test an API endpoint with sample data.

**Usage**: `/test-endpoint identity-service "POST /auth/login" '{"email":"test@example.com","password":"Test123!"}'`

**Output**:
```
Request: POST http://localhost:3001/auth/login
Headers: Content-Type: application/json
Body: {"email":"test@example.com","password":"Test123!"}

Response: 200 OK
Time: 145ms
Body: {
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": { ... }
  }
}
```

### /mock-service [name] [port]
Create a mock service for testing.

**Usage**: `/mock-service external-api 8080`

**Features**:
- Configurable responses
- Request logging
- Latency simulation
- Error injection
- OpenAPI compatibility

## Database Commands

### /create-index [service] [collection] [fields]
Create optimized indexes for queries.

**Usage**: `/create-index organization-service projects "organizationId,status,createdAt"`

**Analysis Provided**:
- Query patterns using these fields
- Index effectiveness score
- Storage impact
- Suggested compound indexes

### /analyze-schema [service]
Analyze database schema for issues.

**Usage**: `/analyze-schema calculation-service`

**Checks**:
- Missing indexes
- Denormalized data
- Large documents
- Unused fields
- Schema inconsistencies

## Hot Reload Commands

### /watch [service]
Enable hot reload for development.

**Usage**: `/watch identity-service`

**Features**:
- Automatic restart on code changes
- Preserves debug sessions
- Maintains database connections
- Shows compilation errors inline

### /sync-types
Synchronize TypeScript types across services.

**Usage**: `/sync-types`

**Actions**:
1. Extracts shared types
2. Updates shared/types directory
3. Regenerates service type imports
4. Validates type compatibility
5. Updates API documentation