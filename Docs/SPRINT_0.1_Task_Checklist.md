# Sprint 0.1 Task Checklist - Security Foundation & Local Development

**Sprint Duration**: 2 weeks (10 working days)
**Sprint Goal**: Eliminate critical security vulnerabilities and establish local development environment
**Commitment**: 35 story points
**Team**: 3-4 developers

---

## Pre-Sprint Setup (Day 0)

### Local Development Environment Verification
**Owner**: Tech Lead
**Duration**: 2 hours

- [ ] WSL2 installed and configured (Windows developers)
- [ ] Docker Desktop with WSL2 backend enabled
- [ ] Docker Compose v2 verified
- [ ] GitHub repository access granted to team
- [ ] Jira project CLNZ created with correct permissions
- [ ] Slack channel #clenergize-rebuild created
- [ ] Team calendar invites sent for ceremonies
- [ ] AWS account created (not blocking, for future use)

### Development Environment Setup
**Owner**: All Developers
**Duration**: 3 hours

- [ ] WSL2 properly configured with Ubuntu 22.04
- [ ] Docker Desktop installed with WSL2 integration
- [ ] Node.js 20 LTS installed (in WSL2)
- [ ] VS Code with Remote-WSL extension
- [ ] Git configured with SSH keys
- [ ] MongoDB Compass installed (host machine)
- [ ] Postman/Insomnia for API testing
- [ ] Access to OLD codebase verified
- [ ] Test Docker performance: `docker run hello-world`

---

## Story: CLNZ-100 - Local Docker Dev Cluster (8 points) 🆕

### Task 0.1: Docker Compose Structure
**Owner**: Tech Lead
**Duration**: 3 hours
**Day**: 1

```yaml
# docker-compose.dev.yml structure
clenergize-v3/
├── docker-compose.dev.yml
├── docker-compose.override.yml (local overrides)
├── .env.development
└── services/
    ├── identity/Dockerfile.dev
    ├── organization/Dockerfile.dev
    └── ...
```

- [ ] Create docker-compose.dev.yml with all services:
  - [ ] MongoDB (single instance for dev)
  - [ ] Redis (single instance)
  - [ ] LocalStack (for AWS services simulation)
  - [ ] 7 backend microservices
  - [ ] Frontend service (Next.js)
  - [ ] Nginx reverse proxy
- [ ] Configure service networking (internal network)
- [ ] Set up volume mounts for hot-reload
- [ ] Create .env.development template

### Task 0.2: Local MongoDB Setup
**Owner**: Developer 1
**Duration**: 2 hours
**Day**: 1

```yaml
# MongoDB service in docker-compose.dev.yml
mongodb:
  image: mongo:7.0
  container_name: clenergize-mongodb
  ports:
    - "27017:27017"
  environment:
    MONGO_INITDB_ROOT_USERNAME: admin
    MONGO_INITDB_ROOT_PASSWORD: localdev123
  volumes:
    - mongodb-data:/data/db
    - ./init-scripts:/docker-entrypoint-initdb.d
```

- [ ] Configure MongoDB container
- [ ] Create initialization scripts for dev data
- [ ] Set up database users for each service
- [ ] Test connection from host machine
- [ ] Document connection strings

### Task 0.3: LocalStack Configuration
**Owner**: Developer 2
**Duration**: 3 hours
**Day**: 1

```yaml
# LocalStack service for AWS simulation
localstack:
  image: localstack/localstack:latest
  container_name: clenergize-localstack
  ports:
    - "4566:4566"  # AWS services
  environment:
    - SERVICES=secretsmanager,sqs,s3,cognito
    - DEFAULT_REGION=us-east-1
    - DATA_DIR=/tmp/localstack/data
  volumes:
    - localstack-data:/tmp/localstack
```

- [ ] Configure LocalStack services
- [ ] Create AWS resource initialization scripts
- [ ] Set up Secrets Manager with dev secrets
- [ ] Configure SQS queues and DLQs
- [ ] Test AWS SDK connectivity

### Task 0.4: Service Dockerization
**Owner**: Developer 3
**Duration**: 4 hours
**Day**: 2

```dockerfile
# Example Dockerfile.dev for services
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

- [ ] Create Dockerfile.dev for each service
- [ ] Configure hot-reload with nodemon/ts-node-dev
- [ ] Set up health check endpoints (`/health/ready` and `/health/live`)
- [ ] Add Docker health check configuration:
  ```yaml
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:3001/health/ready"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 40s
  ```
- [ ] Implement health check responses with:
  - Database connectivity status
  - Redis connectivity status
  - Service version and uptime
  - Dependency health checks
- [ ] Configure logging to stdout
- [ ] Test container builds
- [ ] Verify health checks work in docker-compose

### Task 0.5: Makefile for Developer Experience
**Owner**: Tech Lead
**Duration**: 2 hours
**Day**: 2

```makefile
# Makefile commands
.PHONY: up down logs reset

up:
	docker-compose -f docker-compose.dev.yml up -d

down:
	docker-compose -f docker-compose.dev.yml down

logs:
	docker-compose -f docker-compose.dev.yml logs -f

reset:
	docker-compose -f docker-compose.dev.yml down -v
	docker-compose -f docker-compose.dev.yml up -d
```

- [ ] Create developer-friendly Makefile
- [ ] Add commands for common operations
- [ ] Document all commands in README
- [ ] Test all workflows

### Task 0.6: Create Test Data Seeders
**Owner**: Developer 2 + Testing Agent
**Duration**: 3 hours
**Story Points**: 3
**Day**: 2-3

Create MongoDB initialization scripts for consistent test data across all services.

**Seeder Scripts** (See `Docs/TEST_DATA_SEEDING_GUIDE.md`):

```
init-scripts/mongo/
├── 01-create-databases.js      # Create all 8 service databases
├── 02-create-users.js           # Create service-specific DB users
├── 03-seed-reference-data.js    # Emission factors, units, templates
├── 04-seed-test-users.js        # Test user accounts (4 users)
├── 05-seed-organizations.js     # Test organization with hierarchy
├── 06-seed-activities.js        # Sample activity data
└── 07-seed-calculations.js      # Pre-calculated emissions
```

- [ ] Create MongoDB init scripts directory structure
- [ ] Implement 01-create-databases.js (all 8 databases)
- [ ] Implement 02-create-users.js (service users with permissions)
- [ ] Implement 03-seed-reference-data.js:
  - [ ] 4+ emission factors (Scope 1, 2, 3)
  - [ ] 4+ units and conversions
  - [ ] 2+ hierarchy templates
- [ ] Implement 04-seed-test-users.js:
  - [ ] admin@clenergize.test (role: admin)
  - [ ] manager@clenergize.test (role: manager)
  - [ ] analyst@clenergize.test (role: analyst)
  - [ ] viewer@clenergize.test (role: viewer)
  - [ ] Password: "password123" (hashed with bcrypt)
- [ ] Implement 05-seed-organizations.js:
  - [ ] Test organization "Acme Manufacturing Corp"
  - [ ] 3-level hierarchy (Corp → Division → Site)
  - [ ] Test project "2024 Carbon Footprint Assessment"
- [ ] Implement 06-seed-activities.js (3+ sample activities)
- [ ] Implement 07-seed-calculations.js (emissions calculations)
- [ ] Mount init scripts in docker-compose.yml:
  ```yaml
  mongodb:
    volumes:
      - ./init-scripts/mongo:/docker-entrypoint-initdb.d:ro
  ```
- [ ] Test seeders execute on container startup
- [ ] Verify data created correctly in all databases
- [ ] Document seeder execution in README

### Task 0.7: Environment Variable Validation
**Owner**: Developer 3 + Security Agent
**Duration**: 2 hours
**Story Points**: 2
**Day**: 3

Implement environment variable validation using Zod schemas.

**Files to Create**:
- `NEW/.env.example` - Template with all required variables
- `shared/packages/common/src/config/env-validator.ts` - Zod validation

**Implementation**:

```typescript
// env-validator.ts
import { z } from 'zod';

export const BaseEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']),
  SERVICE_NAME: z.string().min(1),
  PORT: z.string().regex(/^\d+$/),
  MONGODB_URI: z.string().url(),
  REDIS_URL: z.string().url(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  JWT_ISSUER: z.string().url(),
  JWT_AUDIENCE: z.string().min(1),
});

export function validateEnv<T extends z.ZodSchema>(schema: T): z.infer<T> {
  try {
    return schema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}
```

**Tasks**:
- [ ] Create `NEW/.env.example` with all required variables (see ENVIRONMENT_CONFIGURATION_GUIDE.md)
- [ ] Create `shared/packages/common/src/config/env-validator.ts`
- [ ] Implement BaseEnvSchema with common variables
- [ ] Implement validateEnv() function
- [ ] Create service-specific schemas:
  - [ ] IdentityServiceEnvSchema (includes JWT_SECRET)
  - [ ] JWKSServiceEnvSchema (includes JWKS_URI)
- [ ] Add validation to each service startup:
  ```typescript
  // main.ts
  import { validateEnv, IdentityServiceEnvSchema } from '@clenergize/common';

  async function bootstrap() {
    const env = validateEnv(IdentityServiceEnvSchema);
    // ...rest of startup
  }
  ```
- [ ] Test validation fails with missing required variables
- [ ] Test validation passes with all variables set
- [ ] Add .env to .gitignore (if not already)
- [ ] Document in ENVIRONMENT_CONFIGURATION_GUIDE.md

---

## Story: CLNZ-101 - JWT Verification with JWKS (8 points)

### Task 1.1: Research and Security Audit
**Owner**: Developer 1
**Duration**: 4 hours
**Day**: 1

- [ ] Audit current JWT implementation in OLD/backend-ms
- [ ] Document all instances of `jwt.decode()` without verification
- [ ] List all hardcoded secrets and default values
- [ ] Research JWKS libraries (jsonwebtoken vs jose vs jwks-rsa)
- [ ] Create security findings document
- [ ] Share findings in team channel

### Task 1.2: JWKS Library Setup
**Owner**: Developer 1
**Duration**: 6 hours
**Day**: 1-2

```bash
# Commands to run
npm init -y --workspace packages/auth-lib
cd packages/auth-lib
npm install jose jwks-rsa
npm install -D @types/node jest ts-jest
```

- [ ] Create `packages/auth-lib` workspace
- [ ] Install jose or jsonwebtoken with JWKS support
- [ ] Create TypeScript configuration
- [ ] Set up Jest for testing
- [ ] Create basic project structure:
  ```
  packages/auth-lib/
  ├── src/
  │   ├── jwt-verifier.ts
  │   ├── jwks-client.ts
  │   └── index.ts
  ├── tests/
  ├── package.json
  └── tsconfig.json
  ```

### Task 1.3: Implement JWT Verifier
**Owner**: Developer 1
**Duration**: 8 hours
**Day**: 2-3

- [ ] Implement JWKSClient class:
  ```typescript
  class JWKSClient {
    constructor(jwksUri: string)
    async getSigningKey(kid: string): Promise<SigningKey>
    async verifyToken(token: string): Promise<DecodedToken>
  }
  ```
- [ ] Implement token verification with:
  - [ ] Signature verification using RS256
  - [ ] Expiry validation (exp claim)
  - [ ] Issuer validation (iss claim)
  - [ ] Audience validation (aud claim)
  - [ ] Not-before validation (nbf claim)
- [ ] Add error handling for:
  - [ ] Invalid signature
  - [ ] Expired token
  - [ ] Invalid claims
  - [ ] Network errors fetching JWKS

### Task 1.4: Write Security Tests
**Owner**: Developer 1
**Duration**: 4 hours
**Day**: 3

- [ ] Test valid token verification
- [ ] Test forged token rejection
- [ ] Test expired token handling
- [ ] Test invalid issuer/audience
- [ ] Test JWKS key rotation
- [ ] Test rate limiting on JWKS fetch
- [ ] Achieve 100% code coverage

### Task 1.5: Create Migration Guide
**Owner**: Developer 1
**Duration**: 2 hours
**Day**: 4

- [ ] Document all code changes needed
- [ ] Create before/after examples
- [ ] List affected services
- [ ] Write rollback procedure

---

## Story: CLNZ-102 - Secure Secrets Management (5 points)

### Task 2.1: Local Secrets Management
**Owner**: Developer 2
**Duration**: 3 hours
**Day**: 1

```bash
# Local secrets in .env.development
JWT_PRIVATE_KEY=local-dev-key
JWT_PUBLIC_KEY=local-dev-public
MONGODB_URI=mongodb://admin:localdev123@mongodb:27017
REDIS_URL=redis://redis:6379
AWS_ENDPOINT=http://localstack:4566
```

- [ ] Create local secrets structure:
  ```
  config/
  ├── .env.development (local secrets)
  ├── .env.test (test secrets)
  └── secrets/
      ├── jwt-keys/
      │   ├── private.key
      │   └── public.key
      └── README.md
  ```
- [ ] Generate local JWT key pair for development
- [ ] Configure LocalStack Secrets Manager
- [ ] Document secret naming convention
- [ ] Create secrets initialization script

### Task 2.2: Secrets Retrieval Service
**Owner**: Developer 2
**Duration**: 6 hours
**Day**: 2

- [ ] Create `packages/config-lib` workspace
- [ ] Implement SecretsManager class:
  ```typescript
  class SecretsManager {
    async getSecret(name: string): Promise<string>
    async getBulkSecrets(prefix: string): Promise<Record<string, string>>
    cacheSecret(name: string, ttl: number): void
  }
  ```
- [ ] Add caching with TTL
- [ ] Add retry logic for transient failures
- [ ] Handle missing secrets gracefully

### Task 2.3: Remove Hardcoded Secrets
**Owner**: Developer 2
**Duration**: 4 hours
**Day**: 3

- [ ] Scan codebase for hardcoded values:
  ```bash
  grep -r "default-secret-key" OLD/
  grep -r "JWT_SECRET.*=.*['\"]" OLD/
  grep -r "mongodb://localhost" OLD/
  ```
- [ ] Create .env.example with all required vars
- [ ] Update configuration to use SecretsManager
- [ ] Verify no secrets in code

---

## Story: CLNZ-111 - AWS VPC and Networking (DEFERRED to Sprint 0.2)

**Note**: AWS infrastructure setup is deferred to Sprint 0.2. Local development uses Docker networking.

### ~~Task 3.1: Network Architecture Design~~
**Owner**: Developer 3 (DevOps)
**Duration**: 3 hours
**Day**: 1

- [ ] Design VPC CIDR blocks:
  ```
  VPC: 10.0.0.0/16
  Public Subnet 1: 10.0.1.0/24 (AZ-a)
  Public Subnet 2: 10.0.2.0/24 (AZ-b)
  Private Subnet 1: 10.0.10.0/24 (AZ-a)
  Private Subnet 2: 10.0.11.0/24 (AZ-b)
  ```
- [ ] Document security group rules
- [ ] Plan NAT Gateway placement
- [ ] Define NACL rules

### Task 3.2: CDK Project Setup
**Owner**: Developer 3
**Duration**: 4 hours
**Day**: 1-2

```bash
mkdir infrastructure
cd infrastructure
npm init -y
npm install aws-cdk-lib constructs
npm install -D typescript @types/node
npx cdk init --language typescript
```

- [ ] Initialize CDK project
- [ ] Configure CDK for multiple environments
- [ ] Set up CDK deployment pipeline
- [ ] Create base stack structure

### Task 3.3: Implement VPC Stack
**Owner**: Developer 3
**Duration**: 8 hours
**Day**: 2-3

```typescript
// infrastructure/lib/vpc-stack.ts
export class VpcStack extends Stack {
  public readonly vpc: ec2.Vpc;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, 'ClenergizeVPC', {
      maxAzs: 2,
      natGateways: 1,
      // ... configuration
    });
  }
}
```

- [ ] Create VPC with public/private subnets
- [ ] Configure Internet Gateway
- [ ] Set up NAT Gateway
- [ ] Create security groups:
  - [ ] ALB security group (80, 443)
  - [ ] ECS service security group
  - [ ] RDS security group
  - [ ] ElastiCache security group
- [ ] Configure VPC Flow Logs

### Task 3.4: Deploy and Validate
**Owner**: Developer 3
**Duration**: 3 hours
**Day**: 4

```bash
npx cdk diff
npx cdk deploy VpcStack --require-approval never
```

- [ ] Run CDK diff to review changes
- [ ] Deploy VPC stack to dev environment
- [ ] Validate network connectivity
- [ ] Test security group rules
- [ ] Document deployed resources

---

## Story: CLNZ-113 - MongoDB Atlas Setup (DEFERRED to Sprint 0.2)

**Note**: MongoDB Atlas setup is deferred to Sprint 0.2. Local development uses Docker MongoDB.

### ~~Task 4.1: Atlas Cluster Creation~~
**Owner**: Developer 2
**Duration**: 3 hours
**Day**: 4

- [ ] Create MongoDB Atlas account (if needed)
- [ ] Create project: "Clenergize-Dev"
- [ ] Configure M10 cluster (minimum for dev):
  - [ ] 3-node replica set
  - [ ] AWS us-east-1
  - [ ] MongoDB 7.0
  - [ ] 10GB storage
- [ ] Enable encryption at rest
- [ ] Configure automated backups

### Task 4.2: Network Configuration
**Owner**: Developer 2
**Duration**: 3 hours
**Day**: 4-5

- [ ] Set up VPC peering with AWS VPC
- [ ] Configure IP whitelist:
  - [ ] VPC CIDR range
  - [ ] Developer IPs (temporary)
  - [ ] CI/CD NAT Gateway IP
- [ ] Create database users:
  - [ ] Admin user
  - [ ] Application user (limited permissions)
  - [ ] Read-only user for analytics
- [ ] Test connectivity from VPC

### Task 4.3: Connection String Management
**Owner**: Developer 2
**Duration**: 2 hours
**Day**: 5

- [ ] Generate connection strings for each environment
- [ ] Store in AWS Secrets Manager
- [ ] Create connection pooling configuration
- [ ] Document connection parameters

---

## Story: CLNZ-131 - GitHub Actions Part 1 (4 points)

### Task 5.1: Repository Structure
**Owner**: Tech Lead
**Duration**: 2 hours
**Day**: 5

```yaml
# .github/workflows/ci.yml structure
clenergize-v3/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── security.yml
│   │   └── deploy-dev.yml
│   └── actions/
├── packages/
│   ├── auth-lib/
│   └── config-lib/
├── services/
└── infrastructure/
```

- [ ] Create monorepo structure
- [ ] Set up Lerna/Nx/Turborepo
- [ ] Configure workspaces
- [ ] Create .gitignore

### Task 5.2: Basic CI Pipeline
**Owner**: Tech Lead
**Duration**: 4 hours
**Day**: 5

```yaml
name: CI
on:
  pull_request:
    branches: [main, develop]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run lint
```

- [ ] Create CI workflow file
- [ ] Configure build steps
- [ ] Add test execution
- [ ] Add linting checks
- [ ] Configure branch protection rules

### Task 5.3: Security Scanning
**Owner**: Tech Lead
**Duration**: 2 hours
**Day**: 5

- [ ] Add npm audit step
- [ ] Configure Snyk or Dependabot
- [ ] Set up secret scanning
- [ ] Create security workflow

---

## Daily Standup Topics

### Day 1
- Environment setup complete?
- Any blockers with AWS access?
- JWT audit findings

### Day 2
- JWKS implementation progress
- Secrets Manager setup status
- VPC design review

### Day 3
- JWT verifier testing
- Network implementation
- Any security concerns found?

### Day 4
- JWT story completion
- MongoDB Atlas setup
- Infrastructure deployment status

### Day 5
- All critical security fixes done?
- CI/CD pipeline working?
- Sprint goal achieved?

---

## Definition of Done Checklist

### Code Quality
- [ ] Code reviewed by at least 1 peer
- [ ] No hardcoded secrets or defaults
- [ ] TypeScript with strict mode
- [ ] ESLint passing with no warnings
- [ ] Prettier formatted

### Testing
- [ ] Unit tests written and passing
- [ ] Code coverage > 80%
- [ ] Security tests for auth code
- [ ] Integration tests for external services

### Documentation
- [ ] README.md updated
- [ ] API documentation (if applicable)
- [ ] Architecture decision recorded
- [ ] Migration guide written

### Security
- [ ] Security scan passing (npm audit)
- [ ] OWASP Top 10 considered
- [ ] Secrets in AWS Secrets Manager
- [ ] No sensitive data in logs

### Operations
- [ ] Deployed to dev environment
- [ ] Health checks implemented
- [ ] Logging configured
- [ ] Monitoring alerts set up

---

## Sprint Review Demo Script

### Demo 1: JWT Security (5 min)
1. Show old vulnerable code with jwt.decode()
2. Attempt token forgery attack (fails on old)
3. Show new JWKS implementation
4. Demonstrate token forgery prevention
5. Show automated key rotation

### Demo 2: Secrets Management (3 min)
1. Show AWS Secrets Manager structure
2. Demonstrate secret retrieval in code
3. Prove no hardcoded values remain
4. Show secret rotation capability

### Demo 3: Infrastructure (5 min)
1. Show VPC in AWS Console
2. Display network topology
3. Demonstrate MongoDB connectivity
4. Show CDK code and IaC approach

### Demo 4: CI/CD (2 min)
1. Create PR and show checks running
2. Show security scanning results
3. Demonstrate build success

---

## Risk Mitigation

### Risk: AWS Service Delays
**Mitigation**: Have backup plan to use localstack for development

### Risk: MongoDB Atlas VPC Peering Issues
**Mitigation**: Temporary IP whitelist for development, fix peering in Sprint 0.2

### Risk: Team Member Unavailable
**Mitigation**: Pair programming on critical tasks, knowledge sharing

### Risk: JWKS Library Complexity
**Mitigation**: Start with minimal implementation, add features incrementally

---

## Sprint Retrospective Questions

### What Went Well?
- Security vulnerabilities addressed?
- Team collaboration?
- Technical decisions?

### What Could Be Improved?
- Estimation accuracy?
- Communication?
- Documentation?

### Action Items for Next Sprint
- Technical debt to address?
- Process improvements?
- Tool or setup needs?

---

## Success Criteria

✅ **Sprint Goal Met If**:
1. Local Docker development cluster is fully operational
2. JWT verification using JWKS is working
3. No hardcoded secrets remain in code
4. All 7 services running in Docker Compose
5. Basic CI pipeline is running
6. All code is in Git with proper structure
7. Team can run `make up` and have full dev environment

⚠️ **Acceptable Partial Success**:
- JWT and Secrets complete (critical security)
- Docker cluster working for at least core services
- AWS infrastructure deferred to Sprint 0.2

❌ **Sprint Failure If**:
- Hardcoded secrets still exist
- JWT tokens still vulnerable to forgery
- Local dev environment not working

---

## Frontend Preparation (Optional Day 5 Task)

### Task 6.1: BaseAPIClient Design Review
**Owner**: Frontend Dev (if available) or Tech Lead
**Duration**: 2 hours
**Day**: 5

- [ ] Review BaseAPIClient & IdentityClient spec
- [ ] Confirm HttpOnly cookie approach with backend
- [ ] Document error code mappings
- [ ] Prepare TypeScript interfaces

### Task 6.2: Frontend Security Audit
**Owner**: Frontend Dev or Tech Lead
**Duration**: 2 hours
**Day**: 5

- [ ] Scan for localStorage token usage
- [ ] Identify all direct fetch() calls
- [ ] List components needing auth guards
- [ ] Document migration requirements

## Next Sprint Preview (0.2)

- AWS VPC and networking setup (if ready for cloud)
- MongoDB Atlas configuration (or continue with Docker)
- API Gateway setup (Kong/NGINX in Docker)
- EventBridge configuration (or local event bus)
- Shared library completion
- Rate limiting implementation
- **Frontend**: BaseAPIClient & IdentityClient implementation
- **Enhancement**: Docker Compose production optimizations

---

This checklist provides hour-by-hour, task-by-task guidance for Sprint 0.1 execution.