# Clenergize V3 Project Structure & Repository Organization

## Directory Structure Overview

```
ClenergizeV3/
├── 📁 OLD/                                    # Reference codebase (DO NOT MODIFY)
│   ├── clenergizeV3-backend-ms-dev/         # Gateway + mixed concerns (anti-pattern)
│   ├── clenergizeV3-carbon-footprint-ms-dev/# Calculation service
│   ├── clenergizeV3-companyDetails-ms-dev/  # Company metadata
│   ├── clenergizeV3-frontend-dev/           # Next.js frontend
│   ├── clenergizeV3-master-data-ms-dev/     # Reference data
│   ├── clenergizeV3-project-management-ms-dev/ # Projects & hierarchies
│   ├── clenergizeV3-user-management-ms-dev/ # User & auth
│   └── DESIGN-REVIEW.md                     # Architecture issues
│
├── 📁 NEW/                                    # Clean microservices architecture
│   ├── identity-service/                    # Port 3001 (replaces user-management)
│   ├── organization-service/                # Port 3002 (replaces project-management)
│   ├── reference-service/                   # Port 3003 (replaces master-data)
│   ├── activity-service/                    # Port 3004 (new - separated from carbon)
│   ├── calculation-service/                 # Port 3005 (replaces carbon-footprint)
│   ├── reporting-service/                   # Port 3006 (new - separated from backend)
│   ├── audit-service/                       # Port 3007 (new - compliance & logging)
│   ├── frontend/                            # Port 3005 (rebuilt Next.js app)
│   └── shared/                              # Shared libraries & contracts
│       ├── contracts/                       # Event schemas, API contracts
│       ├── common/                          # Utilities, helpers
│       └── config/                          # Shared configuration
│
├── 📁 .claude/                               # Claude agent configurations
│   ├── agents/                              # Agent-specific contexts
│   └── skills/                              # Custom skills
│
├── 📁 .idea/                                 # IDE settings (IntelliJ/WebStorm)
├── 📁 Docs.zip                              # Project documentation
├── 📁 .gitignore                            # Git ignore rules
├── docker-compose.dev.yml                   # Local development environment
├── docker-compose.prod.yml                  # Production deployment
├── Makefile                                  # Developer commands
└── README.md                                # Project overview
```

## Service Mapping: OLD → NEW

### 1. User Management → Identity Service

**OLD Path**: `OLD/clenergizeV3-user-management-ms-dev/`
**NEW Path**: `NEW/identity-service/`

```yaml
Mapping:
  OLD Modules:
    - user.module (registration, profile)
    - auth flows (Cognito integration)
    - legacy migration
    
  NEW Structure:
    identity-service/
    ├── src/
    │   ├── domain/
    │   │   ├── user/
    │   │   ├── authentication/
    │   │   └── authorization/
    │   ├── infrastructure/
    │   │   ├── cognito/
    │   │   └── database/
    │   └── application/
    │       ├── commands/
    │       └── queries/
```

### 2. Project Management → Organization Service

**OLD Path**: `OLD/clenergizeV3-project-management-ms-dev/`
**NEW Path**: `NEW/organization-service/`

```yaml
Mapping:
  OLD Issues:
    - Cloned hierarchies (CRITICAL)
    - Denormalized data
    - Permission as nested objects
    
  NEW Fixes:
    - Reference-based hierarchies
    - Normalized permissions
    - Event-driven updates
```

### 3. Master Data → Reference Service

**OLD Path**: `OLD/clenergizeV3-master-data-ms-dev/`
**NEW Path**: `NEW/reference-service/`

```yaml
Mapping:
  OLD Components:
    - Emission factors
    - Conversion factors
    - Parameters
    - Energy values
    
  NEW Improvements:
    - Versioned reference data
    - Approval workflows
    - Change tracking
```

### 4. Carbon Footprint → Activity + Calculation Services

**OLD Path**: `OLD/clenergizeV3-carbon-footprint-ms-dev/`
**NEW Paths**: 
- `NEW/activity-service/` (data collection)
- `NEW/calculation-service/` (emissions calc)

```yaml
Split Rationale:
  Activity Service:
    - Data ingestion
    - Validation
    - Import/Export
    
  Calculation Service:
    - Emission calculations
    - Aggregations
    - Roll-ups
```

### 5. Backend MS → Gateway + Reporting Service

**OLD Path**: `OLD/clenergizeV3-backend-ms-dev/`
**NEW Paths**:
- API Gateway (AWS/Kong)
- `NEW/reporting-service/`

```yaml
Decomposition:
  Remove from Backend:
    - V1 calculation modules → calculation-service
    - Result reports → reporting-service
    - Authentication → identity-service
    
  Gateway Only:
    - Request routing
    - Rate limiting
    - CORS
```

### 6. Company Details → Part of Organization Service

**OLD Path**: `OLD/clenergizeV3-companyDetails-ms-dev/`
**NEW Path**: `NEW/organization-service/domain/company/`

```yaml
Integration:
  - Merge into organization context
  - Share database with org service
  - Unified API endpoints
```

### 7. Frontend → Complete Rebuild

**OLD Path**: `OLD/clenergizeV3-frontend-dev/`
**NEW Path**: `NEW/frontend/`

```yaml
Technology Stack:
  OLD:
    - Next.js 15
    - Ant Design 5
    - Redux Toolkit
    
  NEW (keep same):
    - Next.js 15
    - Ant Design 5
    - Redux Toolkit
    - Add: WCAG 2.1 compliance
    - Add: BaseAPIClient pattern
```

## Repository Structure per Service

### Standard Service Structure

```
NEW/[service-name]/
├── src/
│   ├── domain/               # Business logic
│   │   ├── entities/         # Domain models
│   │   ├── events/           # Domain events
│   │   ├── services/         # Domain services
│   │   └── repositories/     # Repository interfaces
│   │
│   ├── application/          # Use cases
│   │   ├── commands/         # Write operations
│   │   ├── queries/          # Read operations
│   │   └── handlers/         # Event handlers
│   │
│   ├── infrastructure/       # External interfaces
│   │   ├── database/         # MongoDB implementations
│   │   ├── messaging/        # EventBridge/SQS
│   │   ├── http/            # REST controllers
│   │   └── external/        # Third-party integrations
│   │
│   └── shared/              # Service-specific shared code
│       ├── decorators/      # Custom decorators
│       ├── filters/         # Exception filters
│       ├── guards/          # Auth guards
│       └── pipes/           # Validation pipes
│
├── test/
│   ├── unit/                # Unit tests
│   ├── integration/         # Integration tests
│   └── e2e/                # End-to-end tests
│
├── .env.example            # Environment template
├── .gitignore             # Git ignore
├── Dockerfile             # Production container
├── Dockerfile.dev         # Development container
├── nest-cli.json          # NestJS CLI config
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
└── README.md              # Service documentation
```

## Shared Libraries Structure

```
NEW/shared/
├── contracts/
│   ├── events/
│   │   ├── identity/
│   │   │   ├── user-created.event.ts
│   │   │   ├── user-authenticated.event.ts
│   │   │   └── role-assigned.event.ts
│   │   ├── organization/
│   │   │   ├── project-created.event.ts
│   │   │   └── hierarchy-modified.event.ts
│   │   └── index.ts
│   │
│   ├── api/
│   │   ├── openapi/
│   │   │   ├── identity-api.yaml
│   │   │   ├── organization-api.yaml
│   │   │   └── reference-api.yaml
│   │   └── types/
│   │       ├── responses.ts
│   │       └── errors.ts
│   │
│   └── package.json
│
├── common/
│   ├── utils/
│   │   ├── id-converter.ts
│   │   ├── date-helper.ts
│   │   └── validation.ts
│   ├── constants/
│   │   ├── modules.ts
│   │   └── permissions.ts
│   └── package.json
│
└── config/
    ├── schemas/
    │   ├── database.schema.ts
    │   ├── aws.schema.ts
    │   └── service.schema.ts
    └── package.json
```

## Git Repository Strategy

### Monorepo vs Multi-repo Decision

**Recommended: Monorepo with Lerna/NX**

```yaml
Advantages:
  - Atomic commits across services
  - Shared dependency management
  - Simplified CI/CD
  - Easier refactoring

Structure:
  clenergize-v3-rebuild/
  ├── packages/
  │   ├── identity-service/
  │   ├── organization-service/
  │   ├── reference-service/
  │   ├── activity-service/
  │   ├── calculation-service/
  │   ├── reporting-service/
  │   ├── audit-service/
  │   ├── frontend/
  │   └── shared/
  ├── lerna.json
  ├── nx.json
  └── package.json
```

## Development Workflow

### 1. Reference OLD Code

```bash
# When implementing a feature, reference OLD code
cd OLD/clenergizeV3-[service]-ms-dev
# Understand existing logic
# Identify issues from DESIGN-REVIEW.md
# DON'T copy-paste, rewrite cleanly
```

### 2. Implement in NEW

```bash
# Create clean implementation
cd NEW/[service-name]
# Follow DDD principles
# Fix identified issues
# Write tests first (TDD)
```

### 3. Migration Mapping

```typescript
// Create migration maps for data
// OLD/clenergizeV3-project-management-ms-dev
interface OldProject {
  clonedEntities: Entity[];  // BAD: Cloned data
}

// NEW/organization-service
interface NewProject {
  entityRefs: string[];      // GOOD: References only
}

// Migration script
async function migrateProject(old: OldProject): Promise<NewProject> {
  const entityIds = await createEntityReferences(old.clonedEntities);
  return {
    entityRefs: entityIds
  };
}
```

## Agent Assignment by Service

### Service-to-Agent Mapping

```yaml
Services:
  identity-service:
    Agent: Identity Agent
    Context: OLD/clenergizeV3-user-management-ms-dev
    
  organization-service:
    Agent: Organization Agent
    Context: OLD/clenergizeV3-project-management-ms-dev
    
  reference-service:
    Agent: Reference Agent
    Context: OLD/clenergizeV3-master-data-ms-dev
    
  activity-service:
    Agent: Activity Agent
    Context: OLD/clenergizeV3-carbon-footprint-ms-dev (partial)
    
  calculation-service:
    Agent: Calculation Agent
    Context: OLD/clenergizeV3-carbon-footprint-ms-dev (partial)
    
  reporting-service:
    Agent: Reporting Agent
    Context: OLD/clenergizeV3-backend-ms-dev (RESULT-REPORT)
    
  audit-service:
    Agent: Audit Agent
    Context: NEW (no OLD equivalent)
    
  frontend:
    Agent: Frontend Agent
    Context: OLD/clenergizeV3-frontend-dev
```

## Critical Fixes from OLD to NEW

### Priority 1: Security (Sprint 0.1)

```typescript
// OLD: BAD - No JWT verification
const decoded = jwt.decode(token);  // VULNERABLE!

// NEW: GOOD - Proper verification
import { JwksClient } from 'jwks-rsa';
const verified = await jwt.verify(token, getKey);
```

### Priority 2: Data Consistency (Sprint 0.2)

```typescript
// OLD: BAD - Cloning hierarchies
const project = {
  entities: [...cloneDeep(templateEntities)]  // DATA DUPLICATION!
};

// NEW: GOOD - References
const project = {
  entityRefs: templateEntityIds,  // Just IDs
  templateVersion: "v1.2.3"       // Track version
};
```

### Priority 3: Resilience (Sprint 0.2)

```typescript
// OLD: BAD - Infinite loop
while(true) {
  const messages = await sqs.receiveMessage();  // BLOCKS FOREVER!
}

// NEW: GOOD - Graceful polling
class SQSConsumer {
  private shutdown = false;
  
  async start() {
    while (!this.shutdown) {
      await this.pollWithBackoff();
    }
  }
  
  async stop() {
    this.shutdown = true;
  }
}
```

## Environment Configuration

### Local Development (.env.development)

```bash
# Service Ports
IDENTITY_SERVICE_PORT=3001
ORGANIZATION_SERVICE_PORT=3002
REFERENCE_SERVICE_PORT=3003
ACTIVITY_SERVICE_PORT=3004
CALCULATION_SERVICE_PORT=3005
REPORTING_SERVICE_PORT=3006
AUDIT_SERVICE_PORT=3007

# MongoDB (Local)
MONGODB_URI=mongodb://admin:localdev123@localhost:27017

# Redis (Local)
REDIS_URL=redis://localhost:6379

# LocalStack (AWS Mock)
AWS_ENDPOINT=http://localhost:4566
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test

# Service Discovery
SERVICE_REGISTRY=http://localhost:8500  # Consul
```

## Docker Compose Integration

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  # Infrastructure
  mongodb:
    image: mongo:7.0
    ports: ["27017:27017"]
    
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    
  localstack:
    image: localstack/localstack:latest
    ports: ["4566:4566"]
    
  # NEW Services
  identity-service:
    build: ./NEW/identity-service
    ports: ["3001:3001"]
    volumes:
      - ./NEW/identity-service:/app
      - ./OLD/clenergizeV3-user-management-ms-dev:/reference:ro
    
  organization-service:
    build: ./NEW/organization-service
    ports: ["3002:3002"]
    volumes:
      - ./NEW/organization-service:/app
      - ./OLD/clenergizeV3-project-management-ms-dev:/reference:ro
    
  # ... other services
```

## Migration Checklist

### Per Service Migration Steps

- [ ] Analyze OLD service code
- [ ] Review DESIGN-REVIEW.md issues
- [ ] Create NEW service structure
- [ ] Define domain models
- [ ] Implement repositories
- [ ] Create use cases
- [ ] Build REST controllers
- [ ] Add event publishers
- [ ] Write unit tests (80% coverage)
- [ ] Write integration tests
- [ ] Create migration scripts
- [ ] Document API contracts
- [ ] Update shared contracts
- [ ] Test with OLD data
- [ ] Performance benchmarks

## Success Metrics

### Code Quality Metrics
- Test Coverage: ≥80% (unit), ≥70% (integration)
- Code Duplication: <3%
- Cyclomatic Complexity: <10 per method
- Technical Debt Ratio: <5%

### Architecture Metrics
- Service Coupling: Low (events only)
- API Response Time: <200ms p95
- Build Time: <2 minutes per service
- Deployment Time: <5 minutes

### Security Metrics
- No hardcoded secrets
- All JWTs verified
- Zero critical vulnerabilities
- OWASP Top 10 compliance

## Conclusion

This structure ensures:
1. Clean separation from OLD code (reference only)
2. Proper microservice boundaries in NEW
3. Shared contracts and utilities
4. Clear migration path
5. Agent-specific contexts
6. Comprehensive testing
7. Security-first implementation

Each agent can work independently on their service while maintaining consistency through shared contracts and the Master Coordinator's oversight.
