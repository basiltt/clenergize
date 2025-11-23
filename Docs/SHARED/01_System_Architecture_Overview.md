# Target Architecture Overview - Clenergize V3 Rebuild

## Executive Summary

The target architecture for Clenergize V3 rebuild establishes clear bounded contexts aligned with business capabilities, eliminates data duplication, implements proper security patterns, and creates a maintainable, scalable system optimized for medium-scale deployments (1K-10K concurrent users, 10K-100K transactions/day) on AWS infrastructure.

## Architecture Principles

1. **Domain-Driven Design**: Clear bounded contexts with well-defined aggregates
2. **Single Responsibility**: Each microservice owns one business capability
3. **Data Ownership**: Each service owns its data; no shared databases
4. **Event-Driven**: Asynchronous communication via events for loose coupling
5. **API-First**: Contract-first development with OpenAPI specifications
6. **Security by Design**: Zero-trust, defense in depth, least privilege
7. **Cloud-Native**: Containerized, stateless, horizontally scalable
8. **Observable**: Built-in metrics, tracing, structured logging

## Target System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        External Systems                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ AWS Cognito  │  │    Brevo     │  │    AWS S3    │         │
│  │ (Auth Provider)│  │   (Email)    │  │  (Storage)   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                      Client Applications                         │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  │
│  │   Web App      │  │  Mobile App    │  │   API Clients  │  │
│  │  (Next.js)     │  │   (Future)     │  │  (Third-party) │  │
│  └────────────────┘  └────────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                           HTTPS/WSS
                                │
┌─────────────────────────────────────────────────────────────────┐
│                         API Gateway Layer                        │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              AWS API Gateway + ALB                       │    │
│  │         (Rate limiting, SSL, routing, CORS)             │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                                │
          ┌────────────────────┬┴────────────────────┐
          │                    │                      │
┌─────────────────────────────────────────────────────────────────┐
│                     Core Business Services                       │
│                                                                  │
│  ┌──────────────────────┐  ┌──────────────────────┐           │
│  │  Identity Service    │  │ Organization Service │           │
│  │   (Port: 3001)       │  │    (Port: 3002)      │           │
│  │  - Authentication    │  │  - Companies         │           │
│  │  - Authorization     │  │  - Projects          │           │
│  │  - User profiles     │  │  - Hierarchies       │           │
│  └──────────────────────┘  └──────────────────────┘           │
│                                                                  │
│  ┌──────────────────────┐  ┌──────────────────────┐           │
│  │ Reference Service    │  │  Activity Service    │           │
│  │   (Port: 3003)       │  │    (Port: 3004)      │           │
│  │  - Emission factors  │  │  - Data collection   │           │
│  │  - Conversions       │  │  - Validation        │           │
│  │  - Parameters        │  │  - Import/Export     │           │
│  └──────────────────────┘  └──────────────────────┘           │
│                                                                  │
│  ┌──────────────────────┐  ┌──────────────────────┐           │
│  │ Calculation Service  │  │  Reporting Service   │           │
│  │   (Port: 3005)       │  │    (Port: 3006)      │           │
│  │  - GHG calculations  │  │  - Analytics         │           │
│  │  - Aggregations      │  │  - Dashboards        │           │
│  │  - Scope roll-ups    │  │  - Report generation │           │
│  └──────────────────────┘  └──────────────────────┘           │
│                                                                  │
│  ┌──────────────────────┐                                      │
│  │   Audit Service      │                                      │
│  │   (Port: 3007)       │                                      │
│  │  - Activity logs     │                                      │
│  │  - Compliance        │                                      │
│  │  - Data lineage      │                                      │
│  └──────────────────────┘                                      │
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                    Data & Infrastructure Layer                   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────┐      │
│  │              Event Bus (AWS EventBridge)             │      │
│  │         Domain Events / Integration Events           │      │
│  └─────────────────────────────────────────────────────┘      │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │MongoDB   │  │MongoDB   │  │MongoDB   │  │MongoDB   │     │
│  │Identity  │  │Org DB    │  │Reference │  │Activity  │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │MongoDB   │  │MongoDB   │  │MongoDB   │  │Redis     │     │
│  │Calc DB   │  │Report DB │  │Audit DB  │  │Cache     │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
│                                                                  │
│  ┌─────────────────────────────────────────────────────┐      │
│  │           AWS S3 (Documents, Exports, Backups)       │      │
│  └─────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

## Bounded Contexts & Domain Model

### 1. Identity & Access Context
**Purpose**: Manage user identities, authentication, and authorization

**Aggregates**:
- User (root)
  - Profile
  - Credentials
  - MFA settings
- Role
  - Permissions
- Session

**Key Concepts**:
- Centralized authentication via AWS Cognito
- JWT tokens with proper verification (JWKS)
- Role-based access control (RBAC)
- Session management with Redis

### 2. Organization Context
**Purpose**: Manage organizational structures and relationships

**Aggregates**:
- Company (root)
  - Metadata
  - Settings
- Project (root)
  - Configuration
  - Reporting periods
- OrganizationHierarchy
  - Entity
  - Subsidiary
  - Location
- TeamAssignment
  - ProjectUser
  - Permissions

**Key Concepts**:
- Reference-based hierarchies (no cloning)
- Immutable hierarchy snapshots for historical reporting
- Project-specific permission scopes
- Temporal validity (effective dates)

### 3. Reference Data Context
**Purpose**: Manage calculation parameters and reference data

**Aggregates**:
- EmissionFactor (root)
  - Version history
  - QC status
  - Validity period
- ConversionFactor
- Parameter
- EnergyValue
- ReportingYear

**Key Concepts**:
- Versioned reference data
- Quality control workflow
- Temporal validity
- Immutable once approved

### 4. Activity Data Context
**Purpose**: Collect and validate emission activity data

**Aggregates**:
- ActivityRecord (root)
  - Source data
  - Validation status
  - Attachments
- DataImportBatch
  - Import mappings
  - Validation results
- DataTemplate

**Key Concepts**:
- Schema validation
- Data quality checks
- Bulk import/export
- Audit trail of changes

### 5. Calculation Context
**Purpose**: Calculate emissions based on activity data

**Aggregates**:
- CalculationRequest (root)
  - Parameters
  - Status
- CalculationResult
  - Emissions by scope
  - Methodology used
  - Factors applied
- AggregationResult
  - Roll-up totals
  - Hierarchy level

**Key Concepts**:
- Idempotent calculations
- Versioned methodologies
- Async processing via events
- Result caching

### 6. Reporting Context
**Purpose**: Generate reports and analytics

**Aggregates**:
- Report (root)
  - Configuration
  - Schedule
- Dashboard
  - Widgets
  - Filters
- DataExport
  - Format
  - Status

**Key Concepts**:
- Pre-aggregated metrics
- Materialized views
- Export queue management
- Real-time dashboards via WebSocket

### 7. Audit Context
**Purpose**: Track all system activities for compliance

**Aggregates**:
- AuditLog (root)
  - Actor
  - Action
  - Target
  - Timestamp
- ComplianceReport
- DataLineage

**Key Concepts**:
- Immutable audit logs
- Data lineage tracking
- Compliance reporting
- Retention policies

## Microservice Specifications

### 1. Identity Service
**Technology Stack**: NestJS, TypeScript, MongoDB, Redis
**Port**: 3001

**Responsibilities**:
- User registration and profile management
- Authentication orchestration (AWS Cognito)
- Authorization and RBAC
- Session management
- Password reset flows
- MFA management

**API Endpoints**:
- POST /auth/register
- POST /auth/login
- POST /auth/logout
- POST /auth/refresh
- POST /auth/forgot-password
- GET /users/{id}
- PUT /users/{id}
- GET /roles
- POST /roles/{roleId}/permissions

**Events Published**:
- UserRegistered
- UserAuthenticated
- UserProfileUpdated
- RoleAssigned
- PasswordReset

### 2. Organization Service
**Technology Stack**: NestJS, TypeScript, MongoDB
**Port**: 3002

**Responsibilities**:
- Company management
- Project lifecycle
- Organization hierarchy (Entity/Subsidiary/Location)
- Team assignments
- Permission management

**API Endpoints**:
- POST /companies
- GET /companies/{id}
- POST /projects
- GET /projects/{id}/hierarchy
- POST /projects/{id}/users
- PUT /hierarchies/{id}
- GET /permissions/effective

**Events Published**:
- CompanyCreated
- ProjectCreated
- HierarchyUpdated
- UserAssignedToProject
- PermissionsChanged

**Events Consumed**:
- UserRegistered (create default permissions)
- UserDeleted (remove assignments)

### 3. Reference Service
**Technology Stack**: NestJS, TypeScript, MongoDB
**Port**: 3003

**Responsibilities**:
- Emission factor management
- Conversion factors
- Parameters and constants
- Quality control workflow
- Version management

**API Endpoints**:
- GET /emission-factors
- POST /emission-factors
- PUT /emission-factors/{id}/approve
- GET /conversions
- GET /parameters
- GET /reporting-years

**Events Published**:
- EmissionFactorApproved
- ConversionFactorUpdated
- ReportingYearActivated

### 4. Activity Service
**Technology Stack**: NestJS, TypeScript, MongoDB
**Port**: 3004

**Responsibilities**:
- Activity data collection
- Data validation
- Import/export management
- Template management
- Data quality assurance

**API Endpoints**:
- POST /activities
- GET /activities
- POST /activities/import
- POST /activities/validate
- GET /templates
- POST /exports

**Events Published**:
- ActivityDataCreated
- ActivityDataUpdated
- DataImported
- ValidationCompleted

**Events Consumed**:
- HierarchyUpdated (update location references)
- EmissionFactorApproved (revalidate data)

### 5. Calculation Service
**Technology Stack**: NestJS, TypeScript, MongoDB, Redis
**Port**: 3005

**Responsibilities**:
- Emission calculations
- Methodology application
- Result aggregation
- Scope roll-ups
- Calculation scheduling

**API Endpoints**:
- POST /calculations/request
- GET /calculations/{id}/status
- GET /calculations/{id}/result
- POST /aggregations/rollup
- GET /methodologies

**Events Published**:
- CalculationCompleted
- AggregationCompleted
- RecalculationRequired

**Events Consumed**:
- ActivityDataCreated
- ActivityDataUpdated
- EmissionFactorApproved

### 6. Reporting Service
**Technology Stack**: NestJS, TypeScript, MongoDB, Redis
**Port**: 3006

**Responsibilities**:
- Report generation
- Dashboard management
- Analytics queries
- Data exports
- Real-time updates

**API Endpoints**:
- GET /dashboards/{id}
- POST /reports/generate
- GET /reports/{id}
- GET /analytics/summary
- WebSocket /ws/dashboards

**Events Published**:
- ReportGenerated
- ExportCompleted

**Events Consumed**:
- CalculationCompleted
- AggregationCompleted

### 7. Audit Service
**Technology Stack**: NestJS, TypeScript, MongoDB
**Port**: 3007

**Responsibilities**:
- Activity logging
- Compliance reporting
- Data lineage tracking
- Audit trail management
- Retention management

**API Endpoints**:
- GET /audit-logs
- GET /audit-logs/search
- GET /compliance/reports
- GET /lineage/{entityId}

**Events Consumed**:
- All domain events (for audit logging)

## Communication Patterns

### Synchronous Communication (HTTP/REST)
- Client → API Gateway → Services
- Service-to-service for immediate reads (minimal)
- Circuit breakers on all HTTP clients
- Timeout: 10s default, configurable per endpoint

### Asynchronous Communication (Events)
**Event Bus**: AWS EventBridge
- Schema registry for all events
- Event versioning support
- Dead letter queues for failed events
- Event replay capability

**Event Categories**:
1. **Domain Events**: Business state changes
2. **Integration Events**: Cross-service coordination
3. **System Events**: Technical/operational events

**Event Structure**:
```json
{
  "eventId": "uuid",
  "eventType": "UserRegistered",
  "version": "1.0",
  "timestamp": "2024-01-01T00:00:00Z",
  "source": "identity-service",
  "correlationId": "uuid",
  "payload": {
    // Event-specific data
  },
  "metadata": {
    "userId": "actor",
    "tenantId": "company"
  }
}
```

### Caching Strategy
**Redis Cache Layers**:
1. **Session Cache**: User sessions, tokens (TTL: 1h)
2. **Reference Cache**: Emission factors, conversions (TTL: 24h)
3. **Calculation Cache**: Recent results (TTL: 1h)
4. **API Response Cache**: GET endpoints (TTL: 5m)

## Data Architecture

### Database Strategy
- **One database per service** (no shared databases)
- **MongoDB** for domain data (with proper indexes)
- **Redis** for caching and sessions
- **S3** for documents and exports

### Schema Design Principles
1. **Normalized references** instead of embedded documents for shared data
2. **Immutable event store** for audit logs
3. **Materialized views** for reporting queries
4. **Temporal data** with effective dates
5. **Soft deletes** with consistent semantics

### Data Consistency
- **Eventual consistency** between services
- **Saga pattern** for distributed transactions
- **Outbox pattern** for reliable event publishing
- **Idempotency keys** for all write operations

## Security Architecture

### Authentication & Authorization
- **AWS Cognito** as identity provider
- **JWT tokens** with JWKS verification
- **OAuth 2.0 / OIDC** compliance
- **MFA** support (TOTP, SMS)
- **API key** management for service accounts

### Security Patterns
1. **Zero Trust**: Verify every request
2. **Defense in Depth**: Multiple security layers
3. **Least Privilege**: Minimal permissions
4. **Encryption**: TLS 1.3+ for transit, AES-256 for rest
5. **Input Validation**: Schema validation on all inputs
6. **Rate Limiting**: Per-user and per-IP
7. **OWASP Top 10**: Protection against common vulnerabilities

## Scalability & Performance

### Horizontal Scaling
- **Stateless services**: No sticky sessions
- **Auto-scaling**: Based on CPU/memory/queue depth
- **Load balancing**: AWS ALB with health checks
- **Database scaling**: MongoDB replica sets with read preferences

### Performance Optimizations
1. **Connection pooling**: MongoDB, Redis
2. **Batch processing**: Bulk operations for imports
3. **Async processing**: Background jobs via SQS
4. **Pagination**: Cursor-based for large datasets
5. **Compression**: gzip for API responses
6. **CDN**: CloudFront for static assets

### Performance Targets
- **API Response Time**: p50 < 200ms, p99 < 1s
- **Calculation Processing**: < 5s for single record
- **Report Generation**: < 30s for standard reports
- **Concurrent Users**: 10K sustained
- **Throughput**: 100K transactions/day

## Observability

### Logging
- **Structured logging** (JSON format)
- **Correlation IDs** for request tracing
- **Log levels**: ERROR, WARN, INFO, DEBUG
- **Centralized**: AWS CloudWatch Logs
- **Retention**: 30 days hot, 1 year cold

### Metrics
- **Application metrics**: Custom business KPIs
- **System metrics**: CPU, memory, disk, network
- **Database metrics**: Query performance, connection pools
- **API metrics**: Latency, throughput, error rates
- **Tool**: AWS CloudWatch Metrics + Grafana

### Tracing
- **Distributed tracing**: AWS X-Ray
- **Span coverage**: All service boundaries
- **Sampling**: 10% in production
- **Performance profiling**: Slow query detection

### Health Checks
- **/health/live**: Liveness probe
- **/health/ready**: Readiness probe
- **/health/startup**: Startup probe
- **Dependencies check**: Database, cache, external services

## Migration Strategy (Strangler Fig)

### Phase 1: Foundation (Months 1-2)
1. Set up new infrastructure (API Gateway, EventBridge)
2. Implement Identity Service (authentication/authorization)
3. Create shared libraries (events, security, logging)
4. Establish CI/CD pipelines

### Phase 2: Core Services (Months 3-4)
1. Implement Organization Service
2. Implement Reference Service
3. Migrate reference data
4. Route new projects to new services

### Phase 3: Calculation Engine (Months 5-6)
1. Implement Activity Service
2. Implement Calculation Service
3. Run parallel calculations for validation
4. Progressive traffic shifting

### Phase 4: Reporting & Audit (Month 7)
1. Implement Reporting Service
2. Implement Audit Service
3. Migrate historical data
4. Deprecate legacy reporting

### Phase 5: Decommission (Month 8)
1. Complete data migration
2. Shut down legacy services
3. Archive legacy code
4. Documentation update

## Technology Decisions

### Core Stack (Maintained)
- **Runtime**: Node.js 20 LTS
- **Language**: TypeScript 5.x
- **Framework**: NestJS 10.x
- **Database**: MongoDB 7.x
- **Cache**: Redis 7.x
- **Queue**: AWS SQS → EventBridge (upgrade)

### New Additions
- **API Gateway**: AWS API Gateway
- **Event Bus**: AWS EventBridge
- **Monitoring**: AWS CloudWatch + X-Ray
- **Container**: Docker + AWS ECS Fargate
- **IaC**: AWS CDK (TypeScript)
- **Testing**: Jest + Supertest + K6

### Development Standards
- **API Design**: OpenAPI 3.1 specification
- **Event Schemas**: JSON Schema / Avro
- **Code Style**: ESLint + Prettier
- **Git Flow**: Feature branches + PR reviews
- **Documentation**: JSDoc + Swagger
- **Testing**: 80% coverage minimum

## Risk Mitigation

### Technical Risks
1. **Data Migration Complexity**
   - Mitigation: Incremental migration with rollback capability

2. **Service Communication Failures**
   - Mitigation: Circuit breakers, retries, fallbacks

3. **Performance Degradation**
   - Mitigation: Performance testing, gradual rollout

### Business Risks
1. **User Disruption**
   - Mitigation: Feature flags, A/B testing

2. **Data Inconsistency**
   - Mitigation: Reconciliation jobs, audit trails

3. **Compliance Issues**
   - Mitigation: Maintain audit logs throughout migration

## Success Criteria

### Technical Metrics
- JWT verification implemented correctly
- No infinite loops or resource leaks
- All data properly referenced (no cloning)
- 99.9% uptime SLA achieved
- < 1s p99 latency for APIs

### Business Metrics
- Zero data loss during migration
- User satisfaction maintained/improved
- Calculation accuracy validated
- Compliance requirements met
- TCO reduced by 30%

## Conclusion

This target architecture addresses all critical issues identified in the current system while providing a scalable, maintainable, and secure platform for carbon management. The clear separation of concerns, proper bounded contexts, and event-driven architecture will enable independent service evolution and team autonomy while maintaining system integrity.