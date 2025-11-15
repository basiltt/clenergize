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

## 🤖 AGENT ROLE DEFINITIONS

### You Are One of These Agents:

#### 1. Master Coordinator Agent
- **Model**: Claude Sonnet (Standard)
- **Trigger**: Tasks involving cross-service coordination, sprint planning
- **Context Files**: All PHASE*.md files, SPRINT_*.md files
- **Primary Tools**: Jira MCP, GitHub MCP, Slack MCP
- **Key Decisions**: Architecture choices, task allocation, integration points

#### 2. Architecture Agent
- **Model**: Claude Sonnet (Opus 4.1 for complex decisions only)
- **Use Opus 4.1 When**: 
  - Resolving service circular dependencies
  - Designing distributed transaction patterns
  - Major refactoring decisions
  - Performance bottleneck solutions
- **Context Files**: PHASE2_*.md, PHASE3_Service_Spec_*.md
- **Primary Tools**: OpenAPI generator, PlantUML
- **Key Decisions**: Service boundaries, event schemas, API versioning

#### 3. Security Agent
- **Model**: Claude Sonnet (Opus 4.1 for critical security only)
- **Use Opus 4.1 When**:
  - JWT/JWKS architecture design
  - Cryptographic implementation choices
  - Threat model analysis
  - Zero-trust architecture planning
- **Context Files**: CLNZ-101 through CLNZ-108 security stories
- **Primary Tools**: OWASP scanner, JWT libraries, AWS Secrets Manager
- **Key Decisions**: Cryptographic choices, security policies

#### 4-10. Service Agents (Identity, Organization, Reference, Activity, Calculation, Reporting, Audit)
- **Model**: Claude Sonnet (Standard)
- **Special Case - Calculation Service**:
  - Use Opus 4.1 for complex emission algorithms
  - Use Opus 4.1 for aggregation optimization
- **Context Files**: Service-specific specs in PHASE3_Service_Spec_*.md
- **Primary Tools**: NestJS, TypeORM, MongoDB driver
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
- **Primary Tools**: Next.js, React, Redux Toolkit, Ant Design
- **Key Focus**: Accessibility (WCAG 2.1 Level AA)

#### 12. DevOps/Infrastructure Agent
- **Model**: Claude Sonnet (Standard)
- **Trigger**: Docker, AWS, CI/CD, monitoring
- **Context Files**: LOCAL_DEV_ENVIRONMENT_Updates.md
- **Primary Tools**: Docker, LocalStack, GitHub Actions
- **Current Priority**: Docker Compose environment setup

#### 13. Testing Agent
- **Model**: Claude Sonnet (Standard)
- **Trigger**: Test strategies, E2E tests, quality metrics
- **Context Files**: PHASE5_SDLC_Quality_Strategy.md
- **Primary Tools**: Jest, Supertest, Cypress
- **Coverage Targets**: 80% unit, 70% integration

#### 14. Migration Agent
- **Model**: Claude Sonnet (Opus 4.1 for complex transformations only)
- **Use Opus 4.1 When**:
  - Hierarchy cloning to references conversion
  - Multi-phase migration strategy
  - Complex ETL pipeline design
  - Data validation algorithm creation
- **Context Files**: Current vs Target architecture docs
- **Primary Tools**: MongoDB migration tools, validation scripts
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
```yaml
Frontend:        3005
Gateway:         3000
Identity:        3001
Organization:    3002
Reference:       3003
Activity:        3004
Calculation:     3005
Reporting:       3006
Audit:           3007
MongoDB:         27017
Redis:           6379
LocalStack:      4566
```

### MCP Server Connections

```javascript
// MongoDB connections (use service-specific DB)
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = `clenergize_${serviceName}`;

// Redis connections
const redisClient = {
  cache: 'redis://localhost:6379/0',
  pubsub: 'redis://localhost:6379/1'
};

// LocalStack (AWS services)
const awsConfig = {
  endpoint: 'http://localhost:4566',
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test'
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
// Format: <BoundedContext>.<Aggregate>.<Action>
const EVENT_TYPES = {
  // Identity Context
  'Identity.User.Created': UserCreatedEvent,
  'Identity.User.Authenticated': UserAuthenticatedEvent,
  'Identity.User.RoleAssigned': UserRoleAssignedEvent,
  
  // Organization Context
  'Organization.Project.Created': ProjectCreatedEvent,
  'Organization.Hierarchy.Modified': HierarchyModifiedEvent,
  
  // Activity Context
  'Activity.Data.Ingested': DataIngestedEvent,
  'Activity.Validation.Failed': ValidationFailedEvent,
  
  // Calculation Context
  'Calculation.Emission.Calculated': EmissionCalculatedEvent,
  'Calculation.Rollup.Completed': RollupCompletedEvent
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
