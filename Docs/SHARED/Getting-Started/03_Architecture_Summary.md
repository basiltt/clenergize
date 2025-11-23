# Architecture Summary - Clenergize V3 ESG Platform

**Version**: 1.0.0
**Last Updated**: November 22, 2025
**Audience**: Developers, Architects, Technical Leads

---

## Overview

Clenergize V3 is a **comprehensive Enterprise ESG Management Platform** built using modern microservices architecture. The platform enables organizations to measure, manage, and report on their complete sustainability performance across Environmental, Social, and Governance (ESG) dimensions.

### Key Statistics

```yaml
Platform Scope:
  Total Services: 50 microservices
  Phases: 6 (Foundation → Environmental → Social → Governance → Strategic → Analytics)
  Timeline: 19-20 months
  Investment: $1.85M development + $132K/year infrastructure
  Team: 7 developers + 30+ specialized Claude agents

Technical Stack:
  Backend: NestJS (TypeScript) - 44 services
  ML Service: Python/FastAPI - 1 service
  Frontend: Next.js 14, React 18
  Databases: MongoDB, Redis, InfluxDB, Neo4j, ClickHouse, PostgreSQL
  Event Streaming: Apache Kafka / AWS MSK
  Infrastructure: Docker, Kubernetes, AWS ECS Fargate
```

---

## Architectural Principles

### 1. Domain-Driven Design (DDD)

Services are organized by **bounded contexts** aligned with business domains:

```
Identity Context → Identity Service (Port 3001)
Organization Context → Organization Service (Port 3002)
Reference Context → Reference Service (Port 3003)
Activity Context → Activity Service (Port 3004)
Calculation Context → Calculation Service (Port 3005)
Reporting Context → Reporting Service (Port 3006)
Audit Context → Audit Service (Port 3007)
```

**Benefits**:
- Clear service boundaries
- Independent scaling
- Team autonomy
- Reduced coupling

### 2. Event-Driven Architecture

**Pattern**: Services communicate asynchronously via domain events

**Event Naming Convention**: `<context>.<aggregate>.<action>.v<version>`

**Example Flow**:
```
1. User creates activity data
   → activity.data.ingested.v1

2. Activity Service publishes event
   → Kafka topic: activity.data.ingested.v1

3. Calculation Service consumes event
   → Runs emission calculation
   → Publishes calculation.emission.calculated.v1

4. Reporting Service consumes event
   → Updates dashboard metrics
```

**Benefits**:
- Loose coupling
- Scalability
- Event sourcing (audit trail)
- Replay capability

### 3. Database-per-Service

**Pattern**: Each service owns its database

```yaml
Identity Service → clenergize_identity (MongoDB)
Organization Service → clenergize_organization (MongoDB)
Reference Service → clenergize_reference (MongoDB)
Activity Service → clenergize_activity (MongoDB) + InfluxDB (IoT data)
Calculation Service → clenergize_calculation (MongoDB)
Reporting Service → clenergize_reporting (MongoDB)
Audit Service → clenergize_audit (MongoDB)
```

**Benefits**:
- Data isolation
- Independent scaling
- Technology flexibility
- Clear ownership

### 4. API Gateway Pattern

**Pattern**: Single entry point for all client requests

```
Client → NGINX (local) / AWS API Gateway (production)
       → Backend Services (via internal service discovery)
```

**API Paths**:
- **External**: `/api/v1/*` (client-facing, through gateway)
- **Internal**: `/v1/*` (service-to-service, direct)

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                           │
│  - Web App (Next.js)                                       │
│  - Mobile App                                               │
│  - API Integrations                                         │
└─────────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   API GATEWAY LAYER                         │
│  - NGINX (local) / AWS API Gateway (prod)                  │
│  - Authentication (JWT verification)                        │
│  - Rate Limiting, CORS, Routing                            │
└─────────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              MICROSERVICES LAYER (50 services)              │
│                                                             │
│  Phase 1: Carbon Footprint (7 services)                    │
│  Phase 2: Strategic ESG (8 services)                       │
│  Phase 3: Environmental (9 services)                       │
│  Phase 4: Social (10 services)                             │
│  Phase 5: Governance (8 services)                          │
│  Phase 6: Analytics & ML (6 services)                      │
└─────────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                               │
│  - MongoDB (50 databases, 1 per service)                   │
│  - Redis (cache, pub/sub, queue)                           │
│  - InfluxDB (time-series IoT data)                         │
│  - Neo4j (graph: supply chains, hierarchies)               │
│  - ClickHouse (OLAP analytics, billions of rows)           │
│  - PostgreSQL (Temporal workflows, SOX controls)           │
└─────────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                 EVENT STREAMING LAYER                       │
│  - Apache Kafka / AWS MSK                                  │
│  - 124+ event types                                         │
│  - Event sourcing, audit trail                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Service Catalog

### Phase 1: Carbon Footprint Services (Ports 3000-3007)

| Service | Port | Database | Responsibility |
|---------|------|----------|----------------|
| **Gateway** | 3000 | - | API routing, authentication |
| **Identity** | 3001 | MongoDB | User management, JWT auth, RBAC |
| **Organization** | 3002 | MongoDB, Neo4j | Projects, hierarchies, teams |
| **Reference** | 3003 | MongoDB | Emission factors, units, countries |
| **Activity** | 3004 | MongoDB, InfluxDB | Activity data, IoT sensors |
| **Calculation** | 3005 | MongoDB | Emissions calculations, rollups |
| **Reporting** | 3006 | MongoDB, ClickHouse | Reports, dashboards |
| **Audit** | 3007 | MongoDB | Audit trails, compliance tracking |

### Phase 2: Strategic ESG Services (Ports 3008-3010, 3041-3044)

| Service | Port | Database | Responsibility |
|---------|------|----------|----------------|
| **Notification** | 3008 | MongoDB | Multi-channel notifications |
| **Workflow** | 3009 | PostgreSQL | Temporal workflows, approvals |
| **Integration** | 3010 | MongoDB | External integrations (API, FTP) |
| **Materiality** | 3041 | MongoDB | Double materiality assessment (CSRD) |
| **Strategy** | 3042 | MongoDB | ESG targets, SBTi alignment |
| **Reporting Enhanced** | 3044 | MongoDB | Multi-framework reporting (GRI, SASB, TCFD) |

### Phase 3: Environmental Services (Ports 3012-3020)

| Service | Port | Database | Responsibility |
|---------|------|----------|----------------|
| **Water** | 3012 | MongoDB, InfluxDB | Water consumption, WRI Aqueduct |
| **Waste** | 3013 | MongoDB | Waste streams, circular economy |
| **Biodiversity** | 3014 | MongoDB | TNFD LEAP analysis, IBAT |
| **Energy** | 3015 | MongoDB, InfluxDB | Energy meters, renewables |
| **Pollution** | 3016 | MongoDB | Air/water pollution tracking |
| **Resource** | 3017 | MongoDB | Material consumption |
| **Climate Risk** | 3018 | MongoDB | TCFD scenario analysis |
| **Green Finance** | 3019 | MongoDB | Green bonds, carbon credits |
| **Environmental Supply Chain** | 3020 | MongoDB, Neo4j | Scope 3 environmental impact |

### Phase 4: Social Services (Ports 3021-3030)

**CRITICAL**: ZERO PII storage, k-anonymity enforcement

| Service | Port | Database | Responsibility |
|---------|------|----------|----------------|
| **Workforce** | 3021 | MongoDB | Aggregated demographics (k >= 5) |
| **Safety** | 3022 | MongoDB | OSHA compliance, incident tracking |
| **Labor** | 3023 | MongoDB | Fair wages, working conditions |
| **Community** | 3024 | MongoDB | Community investment, FPIC |
| **Product** | 3025 | MongoDB | Product safety, recalls |
| **Social Supply Chain** | 3026 | MongoDB, Neo4j | Modern slavery, human rights |
| **Human Rights** | 3027 | MongoDB | UNGP compliance |
| **Diversity** | 3028 | MongoDB | DEI metrics, pay equity (k >= 10) |
| **Wellbeing** | 3029 | MongoDB | Mental health, work-life balance |
| **Training** | 3030 | MongoDB | Employee development |

### Phase 5: Governance Services (Ports 3031-3040)

| Service | Port | Database | Responsibility |
|---------|------|----------|----------------|
| **Board** | 3031 | MongoDB | Board composition, independence |
| **Ethics** | 3032 | MongoDB | Code of conduct, whistleblower |
| **Risk** | 3033 | MongoDB | Enterprise risk management (COSO) |
| **Privacy** | 3034 | MongoDB | GDPR DSR, ROPA |
| **Cybersecurity** | 3035 | MongoDB | Security incidents, NIST CSF |
| **Business Conduct** | 3036 | MongoDB | Anti-corruption, FCPA |
| **Transparency** | 3039 | MongoDB | Disclosure tracking |
| **Controls** | 3040 | PostgreSQL | SOX 404 controls testing |

### Phase 6: Analytics & ML Services (Ports 3045-3050)

| Service | Port | Database | Responsibility |
|---------|------|----------|----------------|
| **Analytics** | 3045 | ClickHouse, MongoDB | 500+ KPIs, dashboards (<2s load) |
| **ML** | 3046 | MongoDB, InfluxDB | **Python/FastAPI**, TensorFlow, PyTorch |
| **Forecast** | 3047 | MongoDB | Emissions forecasting (MAPE <15%) |
| **Scenario** | 3048 | MongoDB | Climate scenarios (NGFS, IEA) |
| **Rating** | 3049 | MongoDB | ESG scoring, benchmarking |
| **Insights** | 3050 | MongoDB | NLG insights (GPT-4, Claude) |

---

## Data Architecture

### Multi-Database Strategy

```yaml
MongoDB Atlas (Primary):
  - 50 databases (1 per service)
  - Sharded clusters for scalability
  - Performance: <10ms p95 read latency
  - Use Case: Transactional data, flexible schemas

Redis Cluster:
  - Cache (DB 0): User sessions, API responses (15-min TTL)
  - Pub/Sub (DB 1): Real-time notifications
  - Queue (DB 2): Background jobs (Bull)
  - Performance: <1ms p95 latency

InfluxDB Cloud:
  - Hot storage (90 days): Raw IoT sensor data
  - Warm storage (2 years): Hourly aggregates
  - Cold storage (5 years): Daily aggregates
  - Performance: 1M points/sec write, <100ms query

Neo4j Aura:
  - Supply chain graphs (6-tier traceability)
  - Organizational hierarchies (multi-level rollups)
  - Data lineage (report → calculation → activity)
  - Performance: <100ms p95 for 6-hop traversal

ClickHouse Cloud:
  - Pre-aggregated ESG metrics (500+ KPIs)
  - Billions of rows (5 years historical data)
  - Materialized views for <2s dashboard load
  - Performance: <2s p95 for complex queries

PostgreSQL RDS:
  - Temporal workflow state (ACID required)
  - SOX 404 controls testing (compliance)
  - Performance: <50ms p95, ACID guarantees
```

---

## Security Architecture

### Authentication & Authorization

**JWT-Based Authentication**:
```typescript
// 1. User logs in
POST /api/v1/auth/login
→ Returns JWT access token (1 hour expiry) + refresh token

// 2. Client includes token in requests
Authorization: Bearer <access_token>

// 3. Gateway verifies JWT using JWKS
→ Validates signature, expiration, issuer, audience
→ Extracts user ID, role, permissions

// 4. Service performs authorization
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'MANAGER')
async createProject() { ... }
```

**Role-Based Access Control (RBAC)**:
- **Roles**: Owner, Admin, Manager, Contributor, Viewer
- **Permissions**: Resource:Action format (e.g., `projects:create`)
- **Hierarchical**: Admin inherits Contributor permissions

### Security Hardening

```yaml
Network Security:
  - TLS 1.3 for all connections
  - VPC isolation (production)
  - Security groups (AWS)
  - No public database endpoints

Data Protection:
  - PII encryption at rest (AES-256)
  - Secrets in AWS Secrets Manager
  - No default credentials
  - Field-level encryption for sensitive data

API Security:
  - Rate limiting (100 req/min per user)
  - CORS (specific origins only)
  - Input validation (Zod schemas)
  - SQL/NoSQL injection prevention

Compliance:
  - SOC 2 Type II
  - ISO 27001
  - GDPR (EU)
  - CCPA (California)
```

---

## Performance Targets

### Service-Level Objectives (SLOs)

```yaml
API Gateway:
  - Response Time (p95): <50ms
  - Throughput: 10,000 req/sec
  - Availability: 99.95%

Microservices:
  - Response Time (p95): <100ms
  - Database Query (p95): <10ms
  - Throughput: 5,000 req/sec per service

Databases:
  - MongoDB: <10ms read, <15ms write
  - Redis: <1ms
  - InfluxDB: <100ms query
  - Neo4j: <100ms (6-hop traversal)
  - ClickHouse: <2s (dashboard load)

Dashboard Load:
  - 500 KPIs: <2s
  - 100 simultaneous users: No degradation
```

---

## Deployment Architecture

### Local Development

```yaml
Environment: Docker Compose
Services: All 50 services available locally
Databases: MongoDB, Redis, LocalStack (AWS simulation)
Access: localhost:3000 (frontend), localhost:3000/api (backend)
```

### Production (AWS)

```yaml
Compute:
  - ECS Fargate (containerized services)
  - Auto-scaling (CPU > 70% → scale out)
  - Blue-green deployments

Load Balancing:
  - Application Load Balancer (ALB)
  - Health checks every 30 seconds
  - Automatic failover

Databases:
  - MongoDB Atlas (managed, multi-region)
  - ElastiCache Redis (managed)
  - RDS PostgreSQL (managed)
  - InfluxDB Cloud, Neo4j Aura, ClickHouse Cloud

Monitoring:
  - CloudWatch (metrics, logs, alarms)
  - Prometheus + Grafana (custom metrics)
  - X-Ray (distributed tracing)
  - PagerDuty (incident alerting)
```

---

## Development Workflow

### Branch Strategy

```
main (protected)
  ├── develop (protected)
  │    ├── feature/CLNZ-101-jwt-auth
  │    ├── feature/CLNZ-102-rbac
  │    └── bugfix/CLNZ-150-calculation-fix
  └── hotfix/CLNZ-200-security-patch
```

### Code Review Policy

**MANDATORY**: All code changes require human approval before merging

```yaml
Process:
  1. Create feature branch (feature/CLNZ-XXX-description)
  2. Make changes, add tests (80% coverage minimum)
  3. Create Pull Request to develop branch
  4. CI/CD runs (tests, lint, security scan)
  5. Human reviewer approves (CODEOWNERS auto-assign)
  6. Merge after approval

Reviewers Required:
  - Security-critical code: Security Lead + 1 team member
  - Architecture changes: Architect + 1 team member
  - All other code: 1 team member

Prohibited:
  - ❌ Self-merge
  - ❌ Bypass CI/CD
  - ❌ Force push to protected branches
```

---

## Technology Stack Summary

### Backend

```yaml
Language: TypeScript (Node.js 18+)
Framework: NestJS 10
ORM: Mongoose (MongoDB), TypeORM (PostgreSQL)
Validation: Zod, class-validator
Testing: Jest, Supertest, TestContainers
ML Service: Python 3.11, FastAPI, TensorFlow, PyTorch
```

### Frontend

```yaml
Framework: Next.js 14 (App Router)
UI Library: React 18
State Management: Zustand, React Query
Styling: Tailwind CSS
Charts: Recharts, D3.js
Testing: Vitest, React Testing Library, Playwright
```

### Infrastructure

```yaml
Containers: Docker, Docker Compose
Orchestration: Kubernetes, AWS ECS Fargate
IaC: Terraform
CI/CD: GitHub Actions, ArgoCD
Monitoring: Prometheus, Grafana, ELK Stack
```

---

## Key Design Patterns

### 1. Repository Pattern

```typescript
interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(filter?: Partial<T>): Promise<T[]>;
  create(entity: T): Promise<T>;
  update(id: string, entity: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}
```

### 2. CQRS (Command Query Responsibility Segregation)

```typescript
// Command: Write operations
class CreateUserCommand {
  constructor(public readonly email: string, public readonly name: string) {}
}

class CreateUserHandler {
  async execute(command: CreateUserCommand): Promise<User> {
    // Create user, publish event
  }
}

// Query: Read operations
class GetUserQuery {
  constructor(public readonly userId: string) {}
}

class GetUserHandler {
  async execute(query: GetUserQuery): Promise<User> {
    // Read from cache or database
  }
}
```

### 3. Saga Pattern (Distributed Transactions)

```typescript
// Workflow: Multi-step process with compensation
async function generateReport(reportId: string) {
  // Step 1: Collect data
  const data = await collectData();

  // Step 2: Generate PDF
  let pdfUrl: string;
  try {
    pdfUrl = await generatePDF(data);
  } catch (error) {
    await compensateCollectData(data); // Rollback
    throw error;
  }

  // Step 3: Send notifications
  try {
    await sendNotifications(pdfUrl);
  } catch (error) {
    await compensateGeneratePDF(pdfUrl); // Delete PDF
    await compensateCollectData(data);
    throw error;
  }
}
```

---

## References

### Documentation

- **Complete Architecture Diagrams**: [../03-Architecture/01_Complete_Platform_Architecture_Diagrams.md](../03-Architecture/01_Complete_Platform_Architecture_Diagrams.md)
- **Data Models**: [../08-Data/01-Models/01_Complete_Data_Models.md](../08-Data/01-Models/01_Complete_Data_Models.md)
- **Service Dependencies**: [../03-Architecture/06_Service_Dependencies.md](../03-Architecture/06_Service_Dependencies.md)
- **Event Schema Registry**: [../08-Data/02-Events/01_Event_Schema_Registry.md](../08-Data/02-Events/01_Event_Schema_Registry.md)

### External Resources

- **NestJS Documentation**: https://docs.nestjs.com
- **MongoDB Best Practices**: https://www.mongodb.com/docs/manual/
- **Temporal Workflows**: https://docs.temporal.io
- **Apache Kafka**: https://kafka.apache.org/documentation

---

**Last Updated**: November 22, 2025
**Maintained By**: Architecture Agent
**Questions?** Ask in #clenergize-architecture on Slack
