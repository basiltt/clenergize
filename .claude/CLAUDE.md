# CLAUDE.md - Clenergize V3 Master Agent Configuration

> **CRITICAL**: This is the master configuration file for all Claude agents working on the Clenergize V3 rebuild project. Every agent MUST read this file first before beginning any work.

## 🚨 IMMEDIATE CONTEXT

**Current Sprint**: Sprint 0.1 - Security Foundation & Local Development
**Sprint Day**: Day 1 of 10
**Critical Path**: JWT Verification → Docker Environment → Service Initialization
**Blocking Issues**: None currently

## 📋 PROJECT OVERVIEW

### System Summary
Clenergize V3 is an enterprise carbon footprint management platform being rebuilt from a problematic monolithic architecture to a secure, scalable microservices architecture.

### Key Metrics
- **Services**: 7 backend microservices + 1 frontend
- **Timeline**: 8 months (16 sprints)
- **Effort**: 563 story points
- **Team Size**: 3-4 developers + Claude agents
- **Tech Stack**: NestJS, Next.js, MongoDB, Redis, AWS

### Critical Security Issues (MUST FIX IN SPRINT 0.1)
1. ❗ JWT tokens decoded without signature verification
2. ❗ Hardcoded secrets and default fallbacks
3. ❗ Infinite SQS polling loops causing system instability
4. ❗ Missing authentication on write endpoints

## 🔧 MCP EXECUTOR USAGE (NEW - Optimized Approach)

As of Sprint 0.1, we use a single MCP executor following Anthropic's code execution pattern.
This reduces context usage from 249k to ~30k tokens.

> **🚨 CRITICAL SECURITY WARNING**
>
> The MCP executor implementation MUST follow secure coding practices:
>
> **NEVER use `eval()` for MongoDB queries** - This creates code injection vulnerabilities!
> - ❌ WRONG: `const result = await eval(client.${query});`
> - ✅ CORRECT: Use Function constructor with input sanitization
>
> **ALWAYS use environment variables** - Never hardcode paths or credentials!
> - ❌ WRONG: `this.projectRoot = 'C:\\Users\\...'`
> - ✅ CORRECT: `this.projectRoot = process.env.PROJECT_ROOT`
>
> **REQUIRED Environment Variables**:
> - `PROJECT_ROOT` - Absolute path to project root
> - `MONGODB_URI` - MongoDB connection string
> - `JIRA_API_TOKEN` - Jira API authentication token
> - `JIRA_EMAIL` - Jira user email
>
> **Input Sanitization Requirements**:
> - Maintain allowlist of permitted MongoDB operations
> - Block dangerous patterns: `require()`, `import()`, `eval()`, `process.exit`
> - Validate all user input before execution
> - Use timeout limits on all operations
>
> See `Docs/MCP_EXECUTOR_GUIDE.md` for complete security implementation details.

### How to Use MCP Commands

All operations now go through the single `execute` command:

#### File Operations (replaces filesystem MCP)
```javascript
// Read file
execute({ action: 'file', content: 'read', options: { path: 'path/to/file' }})

// Write file
execute({ action: 'file', content: 'write', options: { path: 'path/to/file', data: 'content' }})

// List directory
execute({ action: 'file', content: 'list', options: { path: 'directory/path' }})
```

#### MongoDB Operations (replaces all mongodb-* MCPs)
```javascript
// Access any database (queries are sanitized by MCP executor)
execute({ action: 'mongodb', content: 'db("clenergize_identity").collection("users").find({})' })

// Insert document
execute({ action: 'mongodb', content: 'db("clenergize_identity").collection("users").insertOne({name: "test"})' })

// Update document
execute({ action: 'mongodb', content: 'db("clenergize_identity").collection("users").updateOne({_id: "123"}, {$set: {status: "active"}})' })

// NOTE: The MCP executor automatically sanitizes these queries to prevent code injection.
// Only allowlisted MongoDB operations (find, insertOne, updateOne, etc.) are permitted.
// Dangerous patterns like require(), eval(), or process.exit are blocked.
```

#### Git Operations (replaces github MCP)
```javascript
// Create branch
execute({ action: 'git', content: 'checkout -b feature/SCRUM-101' })

// Commit
execute({ action: 'bash', content: 'git add . && git commit -m "feat: implement JWT"' })

// Push
execute({ action: 'git', content: 'push origin feature/SCRUM-101' })
```

#### Jira Operations (replaces atlassian MCP)
```javascript
// Update ticket status
execute({ action: 'jira', content: 'SCRUM-101', options: { status: 'In Progress' }})

// Add comment
execute({ action: 'jira', content: 'SCRUM-101', options: { comment: 'JWT implementation started' }})
```

#### Service Generation
```javascript
// Generate complete service
execute({ action: 'generate-service', content: 'identity', options: { port: 3001 }})
```

#### Testing
```javascript
// Run tests
execute({ action: 'test', content: 'unit', options: { service: 'identity' }})
execute({ action: 'test', content: 'e2e', options: { service: 'identity' }})
execute({ action: 'test', content: 'security', options: { service: 'identity' }})
```

## 🤖 AGENT ROLE DEFINITIONS

### You Are One of These Agents:

#### 1. Master Coordinator Agent
- **Model**: Claude Sonnet (Standard)
- **Trigger**: Tasks involving cross-service coordination, sprint planning
- **Context Files**: All PHASE*.md files, SPRINT_*.md files
- **Primary Tools**: `execute` with jira, git, and context actions
- **Key Decisions**: Architecture choices, task allocation, integration points

#### 2. Architecture Agent
- **Model**: Claude Sonnet (Opus 4.1 for complex decisions only)
- **Use Opus 4.1 When**:
  - Resolving service circular dependencies
  - Designing distributed transaction patterns
  - Major refactoring decisions
  - Performance bottleneck solutions
- **Context Files**: PHASE2_*.md, PHASE3_Service_Spec_*.md
- **Primary Tools**: `execute` with code and file actions
- **Key Decisions**: Service boundaries, event schemas, API versioning

#### 3. Security Agent
- **Model**: Claude Sonnet (Opus 4.1 for critical security only)
- **Use Opus 4.1 When**:
  - JWT/JWKS architecture design
  - Cryptographic implementation choices
  - Threat model analysis
  - Zero-trust architecture planning
- **Context Files**: CLNZ-101 through CLNZ-108 security stories
- **Primary Tools**: `execute` with test and security scan actions
- **Key Decisions**: Cryptographic choices, security policies

#### 4-10. Service Agents (Identity, Organization, Reference, Activity, Calculation, Reporting, Audit)
- **Model**: Claude Sonnet (Standard)
- **Special Case - Calculation Service**:
  - Use Opus 4.1 for complex emission algorithms
  - Use Opus 4.1 for aggregation optimization
- **Context Files**: Service-specific specs in PHASE3_Service_Spec_*.md
- **Primary Tools**: `execute` with service-specific actions
- **Port Assignment**:
  - Identity: 3001
  - Organization: 3002
  - Reference: 3003
  - Activity: 3004
  - Calculation: 3005
  - Reporting: 3006
  - Audit: 3007

#### 11. Frontend Agent
- **Model**: Claude Sonnet (Standard)
- **Trigger**: UI components, state management, user experience
- **Context Files**: PHASE9_Frontend_Adaptation_Plan.md
- **Primary Tools**: `execute` with file and test actions
- **Key Focus**: Accessibility (WCAG 2.1 Level AA)

#### 12. DevOps/Infrastructure Agent
- **Model**: Claude Sonnet (Standard)
- **Trigger**: Docker, AWS, CI/CD, monitoring
- **Context Files**: LOCAL_DEV_ENVIRONMENT_Updates.md
- **Primary Tools**: `execute` with docker and aws actions
- **Current Priority**: Docker Compose environment setup

#### 13. Testing Agent
- **Model**: Claude Sonnet (Standard)
- **Trigger**: Test strategies, E2E tests, quality metrics
- **Context Files**: PHASE5_SDLC_Quality_Strategy.md
- **Primary Tools**: `execute` with test actions
- **Coverage Targets**: 80% unit, 70% integration

#### 14. Migration Agent
- **Model**: Claude Sonnet (Opus 4.1 for complex transformations only)
- **Use Opus 4.1 When**:
  - Hierarchy cloning to references conversion
  - Multi-phase migration strategy
  - Complex ETL pipeline design
  - Data validation algorithm creation
- **Context Files**: Current vs Target architecture docs
- **Primary Tools**: `execute` with mongodb and migration actions
- **Critical Issue**: Hierarchy cloning to references conversion

## 🛠️ DEVELOPMENT ENVIRONMENT

### Project Directory Structure

```
ClenergizeV3/
├── 📁 OLD/                    # Reference codebase - READ ONLY!
│   ├── clenergizeV3-backend-ms-dev/
│   ├── clenergizeV3-carbon-footprint-ms-dev/
│   ├── clenergizeV3-companyDetails-ms-dev/
│   ├── clenergizeV3-frontend-dev/
│   ├── clenergizeV3-master-data-ms-dev/
│   ├── clenergizeV3-project-management-ms-dev/
│   ├── clenergizeV3-user-management-ms-dev/
│   └── DESIGN-REVIEW.md      # Critical issues list
│
├── 📁 NEW/                    # Clean architecture implementation
│   ├── identity-service/      # Replaces user-management
│   ├── organization-service/  # Replaces project-management
│   ├── reference-service/     # Replaces master-data
│   ├── activity-service/      # NEW - split from carbon
│   ├── calculation-service/   # Replaces carbon-footprint
│   ├── reporting-service/     # NEW - split from backend
│   ├── audit-service/         # NEW - compliance & logging
│   ├── frontend/             # Rebuilt Next.js app
│   └── shared/               # Contracts & utilities
│
├── mcp-servers/
│   └── clenergize-executor/  # Single MCP executor
├── docker-compose.dev.yml
├── Makefile
└── Docs/                     # All documentation
```

### OLD → NEW Service Mapping

| OLD Service | NEW Service(s) | Agent | Key Issues to Fix |
|------------|---------------|-------|-------------------|
| clenergizeV3-user-management-ms-dev | identity-service | Identity Agent | JWT verification, secrets management |
| clenergizeV3-project-management-ms-dev | organization-service | Organization Agent | Hierarchy cloning, denormalization |
| clenergizeV3-master-data-ms-dev | reference-service | Reference Agent | Seeding on startup, type safety |
| clenergizeV3-carbon-footprint-ms-dev | activity-service + calculation-service | Activity & Calculation Agents | V1 duplication, no transactions |
| clenergizeV3-backend-ms-dev | Gateway + reporting-service | Reporting Agent | Mixed concerns, infinite loops |
| clenergizeV3-companyDetails-ms-dev | (merge into organization-service) | Organization Agent | Minimal functionality |

### Critical: When Referencing OLD Code

**NEVER copy-paste from OLD!** Always:
1. Read OLD code to understand business logic
2. Check DESIGN-REVIEW.md for known issues
3. Rewrite cleanly in NEW following DDD patterns
4. Fix all identified security/data issues
5. Add comprehensive tests

### Local Setup (WSL2 + Docker Desktop)

```bash
# Quick Start
git clone https://github.com/yourcompany/clenergize-v3-rebuild.git
cd clenergize-v3-rebuild
make setup    # Initial setup
make up       # Start all services
make test     # Run tests
make down     # Stop services
```

### Service Ports

**Local Development (Docker Compose)**:
```yaml
# Client Access
Frontend (Next.js):     3000
NGINX (API Gateway):    80/443  # Reverse proxy for all backend services

# Backend Services (internal)
Identity:               3001
Organization:           3002
Reference:              3003
Activity:               3004
Calculation:            3005
Reporting:              3006
Audit:                  3007

# Infrastructure
MongoDB:                27017
Redis:                  6379
LocalStack (AWS sim):   4566
Mailhog SMTP:           1025
Mailhog UI:             8025
Mongo Express:          8081
Redis Commander:        8082
Swagger UI:             8080
```

**Production (AWS)**:
- API Gateway: AWS Managed Service (no local port)
- Application Load Balancer: Distributes traffic to ECS/EKS
- Services: Internal VPC networking (no public ports)

**Important**:
- All external client requests go through NGINX (local) or AWS API Gateway (production)
- Frontend accesses backend via `http://localhost:80/api` (local) or production ALB URL
- Services communicate directly with each other using internal service discovery

### MCP Server Connections

> **Important**: All connection strings MUST use environment variables.
> See `Docs/ENVIRONMENT_CONFIGURATION_GUIDE.md` for complete .env setup.
>
> **STANDARD**: Always use `MONGODB_URI` (not `MONGO_URI`, `MONGO_URL`, or other variations)

```javascript
// MongoDB connections (use service-specific DB)
// CRITICAL: Always use MONGODB_URI as the standard environment variable name
// ❌ DO NOT use: MONGO_URI, MONGO_URL, MONGO_CONNECTION_STRING
// ✅ ALWAYS use: MONGODB_URI
const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:localdev123@localhost:27017/?authSource=admin';
const dbName = `clenergize_${serviceName}`;

// Redis connections
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisClient = {
  cache: `${redisUrl}/0`,
  pubsub: `${redisUrl}/1`
};

// LocalStack (AWS services - for local development only)
const awsConfig = {
  endpoint: process.env.LOCALSTACK_ENDPOINT || 'http://localhost:4566',
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test'
  }
};
```

## 📐 ARCHITECTURE PATTERNS

### Service Structure Template

```
service-name/
├── src/
│   ├── domain/           # Business logic
│   │   ├── entities/     # Domain entities
│   │   ├── events/       # Domain events
│   │   └── services/     # Domain services
│   ├── application/      # Use cases
│   │   ├── commands/     # Command handlers
│   │   ├── queries/      # Query handlers
│   │   └── events/       # Event handlers
│   ├── infrastructure/   # External interfaces
│   │   ├── database/     # Repository implementations
│   │   ├── messaging/    # Event bus
│   │   └── http/        # Controllers
│   └── shared/          # Shared kernel
├── test/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── package.json
```

### Event Naming Convention

```typescript
// Format: <bounded-context>.<aggregate>.<action>.v<version>
// IMPORTANT: Use lowercase with kebab-case for actions, versioned with .vN suffix
const EVENT_TYPES = {
  // Identity Context
  'identity.user.created.v1': UserCreatedEventV1,
  'identity.user.authenticated.v1': UserAuthenticatedEventV1,
  'identity.user.role-assigned.v1': UserRoleAssignedEventV1,

  // Organization Context
  'organization.project.created.v1': ProjectCreatedEventV1,
  'organization.hierarchy.updated.v1': HierarchyUpdatedEventV1,

  // Activity Context
  'activity.data.ingested.v1': DataIngestedEventV1,
  'activity.data.validation-failed.v1': ValidationFailedEventV1,

  // Calculation Context
  'calculation.emission.calculated.v1': EmissionCalculatedEventV1,
  'calculation.rollup.completed.v1': RollupCompletedEventV1
};
```

### API Response Format

```typescript
// Success Response
{
  success: true,
  data: { ... },
  metadata: {
    timestamp: "2025-11-15T10:30:00Z",
    version: "1.0.0",
    requestId: "uuid-v4"
  }
}

// Error Response
{
  success: false,
  error: {
    code: "VALIDATION_ERROR",
    message: "User-friendly message",
    details: { ... },
    timestamp: "2025-11-15T10:30:00Z",
    requestId: "uuid-v4"
  }
}
```

### API Path Strategy

The system uses two distinct URL path prefixes to differentiate between external and internal API traffic:

```
┌─────────────────────────────────────────────────────────────┐
│                   API PATH CONVENTIONS                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  External APIs (through Gateway):                          │
│  • Pattern: /api/v1/*                                      │
│  • Example: POST /api/v1/users/login                       │
│  • Route: Client → Gateway → Service                       │
│  • Auth: JWT required (verified by Gateway)                │
│  • CORS: Enabled                                            │
│                                                             │
│  Internal Service-to-Service APIs:                         │
│  • Pattern: /v1/*                                          │
│  • Example: GET /v1/users/123                              │
│  • Route: Service → Service (direct)                       │
│  • Auth: Service-to-service token                          │
│  • CORS: Not applicable                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Implementation Guidelines:**

```typescript
// Gateway routes (external traffic)
@Controller('api/v1/users')
export class UserGatewayController {
  @Post('login')
  @UseGuards(JwtAuthGuard)
  async login(@Body() credentials: LoginDto) {
    // Routes to Identity Service: /v1/auth/login
    return this.identityService.authenticate(credentials);
  }
}

// Service internal routes (service-to-service)
@Controller('v1/users')
export class UserServiceController {
  @Get(':id')
  @UseGuards(ServiceAuthGuard)
  async getUser(@Param('id') id: string) {
    // Internal service endpoint
    return this.userService.findById(id);
  }
}
```

**Key Rules:**
1. All client-facing requests MUST use `/api/v1/*` prefix
2. All service-to-service requests MUST use `/v1/*` prefix
3. Gateway MUST NOT expose `/v1/*` endpoints externally
4. Services MUST NOT implement `/api/v1/*` routes (Gateway only)

## 🔒 SECURITY REQUIREMENTS

### JWT Implementation (CRITICAL - Sprint 0.1)

```typescript
// CORRECT Implementation
import jwksRsa from 'jwks-rsa';
import jwt from 'jsonwebtoken';

const jwksClient = jwksRsa({
  jwksUri: 'https://cognito.amazonaws.com/.well-known/jwks.json',
  cache: true,
  rateLimit: true
});

async function verifyToken(token: string) {
  const decoded = jwt.decode(token, { complete: true });
  const kid = decoded.header.kid;
  
  const key = await jwksClient.getSigningKey(kid);
  const signingKey = key.getPublicKey();
  
  return jwt.verify(token, signingKey, {
    algorithms: ['RS256'],
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE
  });
}

// NEVER DO THIS (current bug):
// const decoded = jwt.decode(token); // No verification!
```

### Secrets Management

```typescript
// Use AWS Secrets Manager or environment variables
// NEVER hardcode secrets or use defaults

import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ 
  region: "us-east-1",
  endpoint: process.env.LOCALSTACK_URL // for local dev
});

async function getSecret(secretName: string) {
  const command = new GetSecretValueCommand({ SecretId: secretName });
  const data = await client.send(command);
  return JSON.parse(data.SecretString);
}

// NEVER:
const secret = process.env.JWT_SECRET || 'default-secret'; // ❌
```

### Security Hardening Checklist (Sprint 0.2-0.3)

Before deploying ANY service to production, ensure ALL items are checked:

#### Authentication & Authorization
- [ ] JWT signature verification implemented with JWKS
- [ ] Token expiration enforced (max 1 hour for access tokens)
- [ ] Refresh token rotation implemented
- [ ] Role-based access control (RBAC) configured
- [ ] All write endpoints require authentication
- [ ] API rate limiting configured (per user/IP)

#### Secrets & Configuration
- [ ] No secrets in code or environment files
- [ ] AWS Secrets Manager integrated for production
- [ ] No default fallback values for secrets
- [ ] Environment variables validated on startup
- [ ] Secrets rotation policy configured (90 days)

#### Input Validation
- [ ] All API inputs validated with Zod schemas
- [ ] SQL/NoSQL injection prevention verified
- [ ] XSS prevention on all user inputs
- [ ] File upload validation (type, size, content)
- [ ] Request size limits enforced

#### Data Protection
- [ ] PII data encrypted at rest
- [ ] TLS 1.3 enforced for all connections
- [ ] Database connections use SSL/TLS
- [ ] Sensitive fields redacted from logs
- [ ] CORS configured with specific origins (no wildcards)

#### Monitoring & Incident Response
- [ ] Correlation IDs implemented (see below)
- [ ] Security events logged to audit service
- [ ] Failed authentication attempts monitored
- [ ] Anomaly detection alerts configured
- [ ] Incident response runbook documented

#### Dependencies & Supply Chain
- [ ] npm audit shows 0 high/critical vulnerabilities
- [ ] Dependency scanning in CI/CD pipeline
- [ ] Container images scanned (Trivy/Snyk)
- [ ] Base images from trusted sources only
- [ ] Software Bill of Materials (SBOM) generated

#### Deployment Security
- [ ] Non-root user in Docker containers
- [ ] Read-only file systems where possible
- [ ] Network policies configured (K8s)
- [ ] Service mesh mTLS enabled (production)
- [ ] Secrets never in container images

**Security Sign-Off**: Requires approval from Security Agent before production deployment.

## 📊 DATABASE PATTERNS

### Repository Pattern

```typescript
// Base Repository Interface
interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(filter?: Partial<T>): Promise<T[]>;
  create(entity: T): Promise<T>;
  update(id: string, entity: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// MongoDB Implementation
class MongoRepository<T> implements IRepository<T> {
  constructor(
    private collection: Collection<T>,
    private eventBus: IEventBus
  ) {}
  
  async create(entity: T): Promise<T> {
    const session = await this.startSession();
    try {
      await session.withTransaction(async () => {
        const result = await this.collection.insertOne(entity, { session });
        await this.eventBus.publish(new EntityCreatedEvent(entity));
        return result;
      });
    } finally {
      await session.endSession();
    }
  }
}
```

### Data Migration Pattern

```typescript
// Critical: Convert hierarchy cloning to references
interface MigrationScript {
  version: string;
  up(db: Db): Promise<void>;
  down(db: Db): Promise<void>;
}

class HierarchyMigration implements MigrationScript {
  version = '001_hierarchy_to_references';
  
  async up(db: Db) {
    // Transform cloned hierarchies to reference IDs
    const projects = await db.collection('projects').find({}).toArray();
    
    for (const project of projects) {
      if (project.clonedHierarchy) {
        const referenceId = await this.createReference(project.clonedHierarchy);
        await db.collection('projects').updateOne(
          { _id: project._id },
          { 
            $set: { hierarchyRef: referenceId },
            $unset: { clonedHierarchy: '' }
          }
        );
      }
    }
  }
}
```

## 🧪 TESTING STANDARDS

### Test Coverage Requirements

```yaml
Unit Tests:
  Target: 80%
  Focus: Business logic, domain services
  Tools: Jest, ts-jest

Integration Tests:
  Target: 70%
  Focus: API endpoints, database operations
  Tools: Supertest, TestContainers

E2E Tests:
  Target: Critical user paths
  Focus: User workflows, cross-service operations
  Tools: Cypress, Playwright

Performance Tests:
  Target: <200ms p95 response time
  Focus: Calculation engine, report generation
  Tools: K6, Artillery
```

### Test Structure

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData = { email: 'test@example.com', ... };

      // Act
      const user = await userService.createUser(userData);

      // Assert
      expect(user).toMatchObject({
        id: expect.any(String),
        email: userData.email,
        status: 'ACTIVE'
      });
    });

    it('should publish UserCreated event', async () => {
      // Test event publishing
    });

    it('should rollback on error', async () => {
      // Test transaction rollback
    });
  });
});
```

### Contract Testing (Sprint 0.4)

Contract testing ensures API compatibility between microservices without requiring full integration tests. We use **Pact** for consumer-driven contract testing.

**Quick Reference**:
```typescript
// Consumer (Organization Service) tests what it expects from Identity Service
import { pactWith } from 'jest-pact';

pactWith({ consumer: 'OrganizationService', provider: 'IdentityService' }, (provider) => {
  describe('GET /users/:id', () => {
    beforeEach(() => {
      return provider.addInteraction({
        state: 'user exists',
        uponReceiving: 'a request for user details',
        withRequest: {
          method: 'GET',
          path: '/v1/users/user-123',
          headers: { Authorization: 'Bearer token' }
        },
        willRespondWith: {
          status: 200,
          body: {
            id: 'user-123',
            email: 'test@example.com',
            role: 'ADMIN'
          }
        }
      });
    });

    it('fetches user details', async () => {
      const user = await organizationService.getUserDetails('user-123');
      expect(user.email).toBe('test@example.com');
    });
  });
});
```

**Provider Verification** (Identity Service):
```bash
# Verify that Identity Service actually satisfies the contract
npm run test:pact:verify
```

**Complete Implementation Guide**: See [Docs/PHASE5_SDLC_Quality_Strategy.md](Docs/PHASE5_SDLC_Quality_Strategy.md#contract-testing-with-pact) for:
- Consumer-driven contract workflow
- Provider verification setup
- CI/CD integration
- Breaking change detection
- Pact Broker configuration

## 📈 MONITORING & OBSERVABILITY

### Logging Standards

```typescript
// Structured logging with correlation IDs
import winston from 'winston';

const logger = winston.createLogger({
  format: winston.format.json(),
  defaultMeta: { 
    service: process.env.SERVICE_NAME,
    version: process.env.VERSION 
  }
});

// Usage
logger.info('User created', {
  userId: user.id,
  correlationId: request.id,
  duration: Date.now() - startTime
});
```

### Health Checks

```typescript
// Every service must implement
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: process.env.SERVICE_NAME,
    version: process.env.VERSION,
    uptime: process.uptime(),
    checks: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      dependencies: await checkDependencies()
    }
  });
});
```

### Correlation ID Implementation (CRITICAL - Sprint 0.1)

Correlation IDs enable request tracing across all microservices. Every request must carry a correlation ID from entry to exit.

#### AsyncLocalStorage Pattern (Recommended)

```typescript
// src/shared/correlation/correlation.service.ts
import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export interface CorrelationContext {
  correlationId: string;
  causationId?: string;
  userId?: string;
  startTime: number;
}

@Injectable()
export class CorrelationService {
  private static storage = new AsyncLocalStorage<CorrelationContext>();

  static getStorage() {
    return this.storage;
  }

  getContext(): CorrelationContext | undefined {
    return CorrelationService.storage.getStore();
  }

  getCorrelationId(): string {
    return this.getContext()?.correlationId || 'UNKNOWN';
  }

  getCausationId(): string | undefined {
    return this.getContext()?.causationId;
  }

  getUserId(): string | undefined {
    return this.getContext()?.userId;
  }
}
```

#### Middleware Integration

```typescript
// src/infrastructure/http/middleware/correlation.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CorrelationService } from '@/shared/correlation/correlation.service';

@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId = req.headers['x-correlation-id'] as string || uuidv4();
    const causationId = req.headers['x-causation-id'] as string;
    const userId = req.user?.id;

    const context = {
      correlationId,
      causationId,
      userId,
      startTime: Date.now()
    };

    // Store context for this async execution
    CorrelationService.getStorage().run(context, () => {
      // Add to response headers
      res.setHeader('X-Correlation-Id', correlationId);
      if (causationId) {
        res.setHeader('X-Causation-Id', causationId);
      }

      next();
    });
  }
}
```

#### Logger Integration

```typescript
// src/shared/logger/logger.service.ts
import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import winston from 'winston';
import { CorrelationService } from '@/shared/correlation/correlation.service';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;

  constructor(private correlationService: CorrelationService) {
    this.logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console()
      ]
    });
  }

  private enrichWithContext(message: string, context?: any) {
    return {
      message,
      correlationId: this.correlationService.getCorrelationId(),
      causationId: this.correlationService.getCausationId(),
      userId: this.correlationService.getUserId(),
      service: process.env.SERVICE_NAME,
      ...context
    };
  }

  log(message: string, context?: any) {
    this.logger.info(this.enrichWithContext(message, context));
  }

  error(message: string, trace?: string, context?: any) {
    this.logger.error(this.enrichWithContext(message, { ...context, trace }));
  }

  warn(message: string, context?: any) {
    this.logger.warn(this.enrichWithContext(message, context));
  }

  debug(message: string, context?: any) {
    this.logger.debug(this.enrichWithContext(message, context));
  }
}
```

#### HTTP Client Integration

```typescript
// src/shared/http/base-api-client.ts
import { Injectable } from '@nestjs/common';
import { CorrelationService } from '@/shared/correlation/correlation.service';

@Injectable()
export class BaseAPIClient {
  constructor(private correlationService: CorrelationService) {}

  async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const correlationId = this.correlationService.getCorrelationId();

    const headers = {
      ...options.headers,
      'X-Correlation-Id': correlationId,
      'X-Causation-Id': correlationId // Current request becomes cause of new request
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
}
```

#### Event Publishing Integration

```typescript
// src/infrastructure/messaging/event-bus.service.ts
import { Injectable } from '@nestjs/common';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { DomainEvent } from '@/domain/events/base.event';
import { CorrelationService } from '@/shared/correlation/correlation.service';

@Injectable()
export class EventBusService {
  constructor(
    private eventBridge: EventBridgeClient,
    private correlationService: CorrelationService
  ) {}

  async publish(event: DomainEvent): Promise<void> {
    // Automatically enrich event with correlation IDs
    const enrichedEvent = {
      ...event,
      correlationId: this.correlationService.getCorrelationId(),
      causationId: event.id, // This event becomes the cause of future events
      userId: this.correlationService.getUserId()
    };

    await this.eventBridge.send(new PutEventsCommand({
      Entries: [{
        Source: `clenergize.${process.env.SERVICE_NAME}`,
        DetailType: event.type,
        Detail: JSON.stringify(enrichedEvent),
        EventBusName: process.env.EVENT_BUS_NAME
      }]
    }));
  }
}
```

#### Cross-Service Tracing Example

```typescript
// Request Flow:
// 1. Frontend → API Gateway (generates correlation ID: req-123)
// 2. Gateway → Identity Service (passes correlation ID: req-123)
// 3. Identity Service publishes UserAuthenticated event (causation ID: event-456)
// 4. Organization Service consumes event (correlation: req-123, causation: event-456)
// 5. Organization Service calls Reference Service (correlation: req-123, causation: event-456)

// All logs across services will have the same correlation ID:
{
  "correlationId": "req-123",
  "causationId": "event-456",
  "service": "identity-service",
  "message": "User authenticated successfully"
}

{
  "correlationId": "req-123",
  "causationId": "event-456",
  "service": "organization-service",
  "message": "Processing user authentication event"
}

{
  "correlationId": "req-123",
  "causationId": "event-456",
  "service": "reference-service",
  "message": "Fetching user permissions"
}
```

**Implementation Pattern**: See [.claude/patterns/correlation-id-implementation.md](.claude/patterns/correlation-id-implementation.md) for complete implementation guide.

## 📝 DECISION RECORDS

### ADR-001: Microservice Boundaries
**Status**: Accepted
**Decision**: Use DDD bounded contexts for service separation
**Rationale**: Clear ownership, reduced coupling, independent scaling

### ADR-002: Event Bus Choice
**Status**: Accepted
**Decision**: AWS EventBridge for production, Redis Pub/Sub for local
**Rationale**: Managed service, schema registry, event replay capability

### ADR-003: Authentication Strategy
**Status**: Accepted
**Decision**: AWS Cognito with JWT tokens
**Rationale**: Managed service, MFA support, enterprise features

### ADR-004: Database per Service
**Status**: Accepted
**Decision**: Separate MongoDB database per service
**Rationale**: Data isolation, independent scaling, clear ownership

## 🚀 QUICK COMMANDS

```bash
# Development Commands
make up                 # Start all services
make down              # Stop all services
make logs service=identity  # View service logs
make test              # Run all tests
make test-service service=identity  # Test specific service
make seed              # Seed development data
make clean             # Clean containers and volumes

# Database Commands
make db-migrate        # Run migrations
make db-seed          # Seed data
make db-backup        # Backup databases
make db-restore       # Restore from backup

# Deployment Commands
make build            # Build all services
make push            # Push to registry
make deploy-local    # Deploy to local k8s
make deploy-dev      # Deploy to dev environment

# Utility Commands
make lint            # Run linters
make format          # Format code
make security-scan   # Security audit
make performance-test # Run performance tests
```

## ⚠️ COMMON PITFALLS TO AVOID

1. **Never decode JWT without verification** - Always verify signature
2. **Never use any type** - Define proper TypeScript interfaces
3. **Never skip transactions** - Use database transactions for multi-step operations
4. **Never hardcode secrets** - Use environment variables or secrets manager
5. **Never ignore error handling** - Implement proper error boundaries
6. **Never skip tests** - Minimum 80% coverage required
7. **Never bypass API Gateway** - All external traffic through gateway
8. **Never share databases** - Each service owns its data
9. **Never use infinite loops** - Implement circuit breakers
10. **Never deploy without health checks** - Required for all services

## 📞 ESCALATION MATRIX

### Technical Issues
1. **Service Agent** → **Architecture Agent** → **Master Coordinator**
2. **Security Issues** → **Security Agent** (immediate escalation)
3. **Data Loss Risk** → **Migration Agent** + **Master Coordinator**
4. **Performance Issues** → **Testing Agent** → **Architecture Agent**

### Blockers
- Immediate: Post in #clenergize-rebuild Slack channel
- Architecture decisions: Schedule review with Architecture Agent
- Security concerns: Immediate review by Security Agent
- Integration issues: Coordinate through Master Coordinator

## 🎯 SUCCESS CRITERIA

### Opus 4.1 Decision Matrix

```
┌─────────────────────────────────────────────────────────────┐
│               WHEN TO USE OPUS 4.1                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Ask These Questions:                                      │
│  1. Is this a novel problem? ........................ → YES │
│  2. Could a mistake cause data loss? ................ → YES │
│  3. Does it need multi-step reasoning? .............. → YES │
│  4. Is it a security-critical component? ............ → YES │
│  5. Is it an optimization problem? .................. → YES │
│  6. Is the algorithm complexity O(n²) or worse? ..... → YES │
│                                                             │
│  If ANY answer is YES → Consider Opus 4.1                  │
│  If 2+ answers are YES → Definitely use Opus 4.1           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│              SPECIFIC OPUS 4.1 TRIGGERS                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Security:                                                  │
│  • JWT/JWKS implementation architecture                     │
│  • Encryption strategy design                              │
│  • Authentication flow design                              │
│                                                             │
│  Architecture:                                              │
│  • Service dependency resolution                           │
│  • Event sourcing patterns                                │
│  • Distributed transaction design                          │
│                                                             │
│  Calculations:                                             │
│  • Complex emission formulas                               │
│  • Multi-dimensional aggregations                          │
│  • Performance optimization                                │
│                                                             │
│  Migration:                                                 │
│  • Schema transformation logic                             │
│  • Data consistency validation                             │
│  • Rollback strategy design                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Sprint 0.1 (Current)
- [ ] JWT verification implemented correctly
- [ ] Docker environment running all services
- [ ] LocalStack simulating AWS services
- [ ] Base service templates created
- [ ] Security vulnerabilities patched

### Sprint 0.2
- [ ] All services have health checks
- [ ] Event bus operational
- [ ] Basic CRUD operations working
- [ ] Integration tests passing
- [ ] CI/CD pipeline configured

### Phase 1 Complete (Sprint 1.4)
- [ ] Identity & Organization services complete
- [ ] Authentication/Authorization working
- [ ] Project hierarchies functional
- [ ] 80% test coverage achieved
- [ ] Performance benchmarks met

## 📚 REFERENCE DOCUMENTS

### Priority Reading Order
1. **This file** (CLAUDE.md) - Always read first
2. **Current Sprint** (SPRINT_0.1_Task_Checklist.md)
3. **Your Service Spec** (PHASE3_Service_Spec_XX.md)
4. **Architecture Overview** (PHASE2_Target_Architecture_Overview.md)
5. **Security Requirements** (Security stories CLNZ-101 to CLNZ-108)

### Quick Links
- [Jira Board](https://yourcompany.atlassian.net/jira/software/projects/CLNZ)
- [GitHub Repo](https://github.com/yourcompany/clenergize-v3-rebuild)
- [Confluence Docs](https://yourcompany.atlassian.net/wiki/spaces/CLNZ)
- [Slack Channel](https://yourcompany.slack.com/archives/clenergize-rebuild)
- [AWS Console](https://console.aws.amazon.com)

---

## 🔄 DAILY STANDUP TEMPLATE

```markdown
## Agent: [Your Agent Name]
## Date: [Today's Date]
## Sprint Day: [X of 10]

### Yesterday
- Completed: [What was finished]
- Commits: [List commit hashes]
- Tests: [Tests added/passed]

### Today
- Focus: [Main task for today]
- Target: [Specific deliverable]
- Pairing: [Any collaboration needed]

### Blockers
- [Any blocking issues]
- [Dependencies needed]

### Notes
- [Any important observations]
- [Decisions made]
```

---

**Remember**: You're building a critical enterprise system. Every decision matters. Follow the patterns, maintain quality, and escalate concerns immediately. The success of this project depends on consistent, high-quality implementation across all agents.

**Last Updated**: November 15, 2025
**Version**: 1.0.0
**Next Review**: End of Sprint 0.1
