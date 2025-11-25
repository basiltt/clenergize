# JIRA Complete Plan - Clenergize V3 Rebuild

> **Version**: 1.0.0
> **Status**: APPROVED
> **Canonical Reference**: [CURRENT_SCOPE.md](../00-Scope/CURRENT_SCOPE.md)
> **Last Updated**: November 25, 2024

---

## Executive Summary

| Metric | Value |
|--------|-------|
| **Total Story Points** | 340 SP |
| **Duration** | 12 weeks (6 sprints × 2 weeks) |
| **Sprint Velocity** | ~57 SP/sprint |
| **Epics** | 8 |
| **User Stories** | 48 |
| **Services** | 7 microservices |

---

## Epic Overview

| Epic ID | Epic Name | Sprint | Story Points |
|---------|-----------|--------|--------------|
| CLNZ-E01 | Infrastructure Foundation | 0.1 | 50 SP |
| CLNZ-E02 | Security & Shared Libraries | 0.2 | 50 SP |
| CLNZ-E03 | Identity Service | 1.1 | 35 SP |
| CLNZ-E04 | Organization Service | 1.1 | 25 SP |
| CLNZ-E05 | Reference Service | 1.2 | 30 SP |
| CLNZ-E06 | Activity Service | 1.2 | 30 SP |
| CLNZ-E07 | Calculation Service | 1.3 | 35 SP |
| CLNZ-E08 | Reporting & Audit Services | 1.3-1.4 | 50 SP |
| CLNZ-E09 | Integration & Migration | 1.4 | 35 SP |

---

## PHASE 0: Foundation (100 SP, 4 weeks)

### EPIC CLNZ-E01: Infrastructure Foundation
**Sprint**: 0.1 | **Story Points**: 50 SP

#### CLNZ-101: Docker Compose Development Environment
**Type**: Technical Story | **Points**: 13
**Description**: Setup complete local development environment with Docker Compose

**Acceptance Criteria**:
- [ ] Docker Compose file starts all 7 services
- [ ] MongoDB with replica set for transactions
- [ ] Redis for cache and pub/sub
- [ ] LocalStack for AWS services (S3, SQS, Secrets Manager)
- [ ] All developers can run `make up` successfully
- [ ] Health checks pass for all containers

**Tasks**:
- CLNZ-101.1: Create docker-compose.dev.yml (5 SP)
- CLNZ-101.2: Configure MongoDB replica set (3 SP)
- CLNZ-101.3: Setup Redis cluster (2 SP)
- CLNZ-101.4: Configure LocalStack (3 SP)

---

#### CLNZ-102: Base NestJS Service Templates
**Type**: Technical Story | **Points**: 13
**Description**: Create standardized NestJS service templates with DDD structure

**Acceptance Criteria**:
- [ ] Service template follows DDD pattern (domain, application, infrastructure)
- [ ] ESG-generic data models included
- [ ] Health check endpoints implemented (/health/live, /health/ready)
- [ ] Structured logging with correlation IDs
- [ ] Environment configuration validated on startup
- [ ] Template can generate new service in <5 minutes

**Tasks**:
- CLNZ-102.1: Create service scaffold generator (5 SP)
- CLNZ-102.2: Implement DDD folder structure (3 SP)
- CLNZ-102.3: Add health check endpoints (2 SP)
- CLNZ-102.4: Configure structured logging (3 SP)

---

#### CLNZ-103: Environment Configuration
**Type**: Technical Story | **Points**: 8
**Description**: Standardize environment configuration across all services

**Acceptance Criteria**:
- [ ] All services use consistent env var naming (MONGODB_URI, REDIS_URL)
- [ ] .env.example documented for all required variables
- [ ] Environment validation fails fast on missing required vars
- [ ] No hardcoded credentials or paths
- [ ] LocalStack endpoint configurable

**Tasks**:
- CLNZ-103.1: Create shared config module (3 SP)
- CLNZ-103.2: Document environment variables (2 SP)
- CLNZ-103.3: Add validation on startup (3 SP)

---

#### CLNZ-104: Development Scripts & Makefile
**Type**: Technical Story | **Points**: 8
**Description**: Create developer productivity scripts

**Acceptance Criteria**:
- [ ] `make up` starts all services
- [ ] `make down` stops all services
- [ ] `make logs service=X` shows service logs
- [ ] `make test` runs all tests
- [ ] `make seed` seeds development data
- [ ] `make clean` removes all containers/volumes

**Tasks**:
- CLNZ-104.1: Create Makefile with all commands (3 SP)
- CLNZ-104.2: Create shell scripts for complex operations (2 SP)
- CLNZ-104.3: Document all available commands (3 SP)

---

#### CLNZ-105: Database Initialization
**Type**: Technical Story | **Points**: 8
**Description**: Setup database initialization and seeding

**Acceptance Criteria**:
- [ ] Each service has its own database (clenergize_identity, etc.)
- [ ] Indexes created automatically on startup
- [ ] Seed data available for development
- [ ] Migration framework in place
- [ ] Database connections use connection pooling

**Tasks**:
- CLNZ-105.1: Create database initialization scripts (3 SP)
- CLNZ-105.2: Setup seed data for each service (3 SP)
- CLNZ-105.3: Configure connection pooling (2 SP)

---

### EPIC CLNZ-E02: Security & Shared Libraries
**Sprint**: 0.2 | **Story Points**: 50 SP

#### CLNZ-201: JWT/JWKS Authentication
**Type**: Technical Story | **Points**: 13 | **Priority**: CRITICAL
**Description**: Implement secure JWT authentication with JWKS verification

**Acceptance Criteria**:
- [ ] JWT tokens verified using JWKS (not decode-only)
- [ ] RS256 algorithm enforced
- [ ] Token expiration enforced (1 hour access, 24 hour refresh)
- [ ] No hardcoded secrets or fallbacks
- [ ] JWKS client caches keys with TTL
- [ ] Security tests pass (token tampering detected)

**Tasks**:
- CLNZ-201.1: Implement JwtVerificationService (5 SP)
- CLNZ-201.2: Create AuthGuard using JWKS (3 SP)
- CLNZ-201.3: Add token refresh mechanism (3 SP)
- CLNZ-201.4: Write security tests (2 SP)

---

#### CLNZ-202: AWS Secrets Manager Integration
**Type**: Technical Story | **Points**: 8 | **Priority**: HIGH
**Description**: Integrate AWS Secrets Manager for secure secret management

**Acceptance Criteria**:
- [ ] All secrets fetched from Secrets Manager (LocalStack for dev)
- [ ] No secrets in environment variables or code
- [ ] Secrets cached with configurable TTL
- [ ] Service fails fast if secrets unavailable
- [ ] Secret rotation supported

**Tasks**:
- CLNZ-202.1: Create SecretsService (3 SP)
- CLNZ-202.2: Configure LocalStack secrets (2 SP)
- CLNZ-202.3: Implement caching layer (3 SP)

---

#### CLNZ-203: Shared Library (@clenergize/shared)
**Type**: Technical Story | **Points**: 13
**Description**: Create shared library with ESG-generic types and utilities

**Acceptance Criteria**:
- [ ] ESGDomain, ESGSubdomains enums defined
- [ ] ESGActivityData, ESGCalculationInput interfaces
- [ ] Common DTOs for API responses
- [ ] Error taxonomy (ValidationError, NotFoundError, etc.)
- [ ] Published to private npm registry
- [ ] All services import from @clenergize/shared

**Tasks**:
- CLNZ-203.1: Create package structure (2 SP)
- CLNZ-203.2: Define ESG domain types (3 SP)
- CLNZ-203.3: Create common DTOs (3 SP)
- CLNZ-203.4: Define error taxonomy (2 SP)
- CLNZ-203.5: Setup npm publishing (3 SP)

---

#### CLNZ-204: Correlation ID Middleware
**Type**: Technical Story | **Points**: 8
**Description**: Implement correlation ID tracking across all services

**Acceptance Criteria**:
- [ ] X-Correlation-Id header propagated across services
- [ ] AsyncLocalStorage used for context
- [ ] All logs include correlation ID
- [ ] HTTP clients forward correlation IDs
- [ ] Events include correlation IDs

**Tasks**:
- CLNZ-204.1: Create CorrelationService (3 SP)
- CLNZ-204.2: Add middleware to all services (2 SP)
- CLNZ-204.3: Integrate with logger (3 SP)

---

#### CLNZ-205: Input Validation Framework
**Type**: Technical Story | **Points**: 8
**Description**: Implement consistent input validation with Zod

**Acceptance Criteria**:
- [ ] All DTOs validated with Zod schemas
- [ ] Validation errors return consistent format
- [ ] Custom validators for domain-specific rules
- [ ] Validation pipe integrated with NestJS
- [ ] 0 high/critical vulnerabilities (npm audit)

**Tasks**:
- CLNZ-205.1: Setup Zod validation pipe (3 SP)
- CLNZ-205.2: Create common validators (3 SP)
- CLNZ-205.3: Add security scanning (2 SP)

---

## PHASE 1: Core Services (240 SP, 8 weeks)

### EPIC CLNZ-E03: Identity Service
**Sprint**: 1.1 | **Story Points**: 35 SP | **Port**: 3001

#### CLNZ-301: User Authentication
**Type**: User Story | **Points**: 13
**As a** user, **I want to** authenticate with the system **so that** I can access protected resources.

**Acceptance Criteria**:
- [ ] Login endpoint returns JWT access + refresh tokens
- [ ] Password hashed with bcrypt (cost factor 12)
- [ ] Failed login attempts tracked (lockout after 5)
- [ ] Logout invalidates refresh token
- [ ] Login audit logged to audit-service

**Tasks**:
- CLNZ-301.1: Create auth endpoints (POST /login, /logout, /refresh) (5 SP)
- CLNZ-301.2: Implement password hashing (2 SP)
- CLNZ-301.3: Add login attempt tracking (3 SP)
- CLNZ-301.4: Integrate with audit logging (3 SP)

---

#### CLNZ-302: User Management
**Type**: User Story | **Points**: 8
**As an** admin, **I want to** manage users **so that** I can control access to the system.

**Acceptance Criteria**:
- [ ] CRUD operations for users
- [ ] User roles assignable (Admin, Manager, Analyst, Viewer)
- [ ] User status manageable (Active, Inactive, Locked)
- [ ] Email uniqueness enforced
- [ ] Audit trail for all user changes

**Tasks**:
- CLNZ-302.1: Create user CRUD endpoints (3 SP)
- CLNZ-302.2: Implement role assignment (2 SP)
- CLNZ-302.3: Add user status management (3 SP)

---

#### CLNZ-303: Password Reset
**Type**: User Story | **Points**: 5
**As a** user, **I want to** reset my password **so that** I can regain access if forgotten.

**Acceptance Criteria**:
- [ ] Password reset email sent with secure token
- [ ] Token expires in 1 hour
- [ ] Token can only be used once
- [ ] New password must meet complexity requirements
- [ ] User notified of password change

**Tasks**:
- CLNZ-303.1: Create password reset flow (3 SP)
- CLNZ-303.2: Integrate with email service (2 SP)

---

#### CLNZ-304: Role-Based Access Control
**Type**: Technical Story | **Points**: 8
**Description**: Implement RBAC with permission evaluation

**Acceptance Criteria**:
- [ ] Permissions defined per role
- [ ] Resource-level permissions supported
- [ ] Permission evaluation <50ms
- [ ] Permissions cached in Redis
- [ ] Permission changes propagated immediately

**Tasks**:
- CLNZ-304.1: Define permission model (3 SP)
- CLNZ-304.2: Create RoleGuard decorator (2 SP)
- CLNZ-304.3: Implement permission caching (3 SP)

---

### EPIC CLNZ-E04: Organization Service
**Sprint**: 1.1 | **Story Points**: 25 SP | **Port**: 3002

#### CLNZ-401: Company Management
**Type**: User Story | **Points**: 8
**As a** user, **I want to** manage company information **so that** I can set up my organization.

**Acceptance Criteria**:
- [ ] Company CRUD operations
- [ ] Industry classification (NAICS, SIC codes)
- [ ] Fiscal year configuration
- [ ] Company logo upload to S3
- [ ] Multi-company support

**Tasks**:
- CLNZ-401.1: Create company endpoints (3 SP)
- CLNZ-401.2: Add industry classification (2 SP)
- CLNZ-401.3: Implement file upload (3 SP)

---

#### CLNZ-402: Project Management
**Type**: User Story | **Points**: 8
**As a** user, **I want to** create and manage projects **so that** I can organize carbon tracking.

**Acceptance Criteria**:
- [ ] Project CRUD operations
- [ ] Projects linked to companies
- [ ] Year selection for projects
- [ ] Project status management
- [ ] Reference-based hierarchy (NO CLONING)

**Tasks**:
- CLNZ-402.1: Create project endpoints (3 SP)
- CLNZ-402.2: Implement reference-based hierarchy (3 SP)
- CLNZ-402.3: Add year configuration (2 SP)

---

#### CLNZ-403: Hierarchy Management
**Type**: User Story | **Points**: 8
**As a** user, **I want to** define organizational hierarchy **so that** I can track emissions by location.

**Acceptance Criteria**:
- [ ] Entity/Subsidiary/Location hierarchy
- [ ] Hierarchy templates (reusable)
- [ ] Reference-based (not cloned data)
- [ ] Hierarchy snapshots for historical reports
- [ ] MongoDB transactions for consistency

**Tasks**:
- CLNZ-403.1: Create hierarchy endpoints (3 SP)
- CLNZ-403.2: Implement templates (2 SP)
- CLNZ-403.3: Add transactional support (3 SP)

---

### EPIC CLNZ-E05: Reference Service
**Sprint**: 1.2 | **Story Points**: 30 SP | **Port**: 3003

#### CLNZ-501: Emission Factor Management
**Type**: User Story | **Points**: 13
**As a** user, **I want to** access emission factors **so that** I can calculate emissions.

**Acceptance Criteria**:
- [ ] Emission factor CRUD operations
- [ ] Factor search by category, region, fuel type
- [ ] Factor versioning and history
- [ ] One-time seeding (not every startup)
- [ ] ESGFactor interface implemented

**Tasks**:
- CLNZ-501.1: Create factor endpoints (5 SP)
- CLNZ-501.2: Implement search (3 SP)
- CLNZ-501.3: Add versioning (3 SP)
- CLNZ-501.4: Create seed data (2 SP)

---

#### CLNZ-502: QC Workflow
**Type**: User Story | **Points**: 8
**As an** admin, **I want to** approve emission factors **so that** I can ensure data quality.

**Acceptance Criteria**:
- [ ] QC states: Draft → Review → Approved/Rejected
- [ ] Approved factors used in calculations
- [ ] Rejection requires reason
- [ ] QC history tracked
- [ ] Notifications on state changes

**Tasks**:
- CLNZ-502.1: Implement state machine (3 SP)
- CLNZ-502.2: Add approval workflow (3 SP)
- CLNZ-502.3: Create notifications (2 SP)

---

#### CLNZ-503: Unit Conversions
**Type**: Technical Story | **Points**: 8
**Description**: Implement unit conversion system

**Acceptance Criteria**:
- [ ] Conversion factors defined
- [ ] Support for common units (kg, tonnes, kWh, MWh)
- [ ] Custom conversion rules
- [ ] Conversion accuracy validated
- [ ] API for conversions

**Tasks**:
- CLNZ-503.1: Create conversion engine (3 SP)
- CLNZ-503.2: Define standard conversions (2 SP)
- CLNZ-503.3: Add validation (3 SP)

---

### EPIC CLNZ-E06: Activity Service
**Sprint**: 1.2 | **Story Points**: 30 SP | **Port**: 3004

#### CLNZ-601: Activity Data CRUD
**Type**: User Story | **Points**: 13
**As a** user, **I want to** enter activity data **so that** I can track emissions.

**Acceptance Criteria**:
- [ ] Activity CRUD for all scope types
- [ ] ESGActivityData interface implemented
- [ ] Monthly breakdown support
- [ ] Evidence attachments (S3)
- [ ] Data validation before save

**Tasks**:
- CLNZ-601.1: Create activity endpoints (5 SP)
- CLNZ-601.2: Implement ESG-generic model (3 SP)
- CLNZ-601.3: Add monthly breakdown (2 SP)
- CLNZ-601.4: Integrate file attachments (3 SP)

---

#### CLNZ-602: Bulk Import
**Type**: User Story | **Points**: 8
**As a** user, **I want to** import activity data in bulk **so that** I can efficiently enter data.

**Acceptance Criteria**:
- [ ] CSV/Excel import support
- [ ] Template download available
- [ ] Validation before import
- [ ] Error report generated
- [ ] 5000 records/minute throughput

**Tasks**:
- CLNZ-602.1: Create import endpoint (3 SP)
- CLNZ-602.2: Implement validation (3 SP)
- CLNZ-602.3: Generate error reports (2 SP)

---

#### CLNZ-603: Data Validation
**Type**: Technical Story | **Points**: 8
**Description**: Implement comprehensive data validation

**Acceptance Criteria**:
- [ ] Quantity range validation
- [ ] Unit compatibility checking
- [ ] Reference service factor validation
- [ ] Data quality scoring
- [ ] Validation <100ms per record

**Tasks**:
- CLNZ-603.1: Create validation engine (3 SP)
- CLNZ-603.2: Add quality scoring (3 SP)
- CLNZ-603.3: Integrate with reference service (2 SP)

---

### EPIC CLNZ-E07: Calculation Service
**Sprint**: 1.3 | **Story Points**: 35 SP | **Port**: 3005

#### CLNZ-701: GHG Calculation Engine
**Type**: User Story | **Points**: 13 | **Priority**: HIGH
**As a** user, **I want to** calculate GHG emissions **so that** I can report my carbon footprint.

**Acceptance Criteria**:
- [ ] ESGCalculationEngine interface implemented
- [ ] GHG Protocol methodology supported
- [ ] Scope 1, 2, 3 calculations
- [ ] Uncertainty propagation
- [ ] Full traceability (activity → factor → result)

**Tasks**:
- CLNZ-701.1: Implement calculation engine interface (5 SP)
- CLNZ-701.2: Create GHG calculator (5 SP)
- CLNZ-701.3: Add traceability (3 SP)

---

#### CLNZ-702: Hierarchical Aggregations
**Type**: User Story | **Points**: 8
**As a** user, **I want to** see aggregated emissions by hierarchy level **so that** I can understand emissions breakdown.

**Acceptance Criteria**:
- [ ] Roll-up by location → subsidiary → entity → company
- [ ] Cycle detection in hierarchy
- [ ] Aggregation <10s for 10K nodes
- [ ] Cache invalidation on data change
- [ ] Idempotent calculations

**Tasks**:
- CLNZ-702.1: Create rollup engine (3 SP)
- CLNZ-702.2: Add cycle detection (2 SP)
- CLNZ-702.3: Implement caching (3 SP)

---

#### CLNZ-703: Calculation Jobs
**Type**: Technical Story | **Points**: 8
**Description**: Implement async calculation job processing

**Acceptance Criteria**:
- [ ] Jobs queued to SQS
- [ ] Progress tracking available
- [ ] Result caching in Redis
- [ ] Retry on failure (3 attempts)
- [ ] Dead letter queue for failures

**Tasks**:
- CLNZ-703.1: Create job queue (3 SP)
- CLNZ-703.2: Implement progress tracking (2 SP)
- CLNZ-703.3: Add retry logic (3 SP)

---

#### CLNZ-704: Result Caching
**Type**: Technical Story | **Points**: 5
**Description**: Implement calculation result caching

**Acceptance Criteria**:
- [ ] Results cached with fingerprint key
- [ ] Cache invalidation on data change
- [ ] Cache hit ratio >80%
- [ ] TTL configurable
- [ ] Redis cluster support

**Tasks**:
- CLNZ-704.1: Implement cache strategy (2 SP)
- CLNZ-704.2: Add fingerprinting (3 SP)

---

### EPIC CLNZ-E08: Reporting & Audit Services
**Sprint**: 1.3-1.4 | **Story Points**: 50 SP

#### CLNZ-801: Dashboard API
**Type**: User Story | **Points**: 13 | **Service**: reporting-service (3006)
**As a** user, **I want to** view emission dashboards **so that** I can monitor performance.

**Acceptance Criteria**:
- [ ] Dashboard configuration API
- [ ] Widget types: chart, table, metric, map
- [ ] Dashboard load <2s
- [ ] Data refresh configurable
- [ ] Sharing and permissions

**Tasks**:
- CLNZ-801.1: Create dashboard endpoints (5 SP)
- CLNZ-801.2: Implement widget system (5 SP)
- CLNZ-801.3: Add sharing (3 SP)

---

#### CLNZ-802: Report Generation
**Type**: User Story | **Points**: 8 | **Service**: reporting-service (3006)
**As a** user, **I want to** generate emission reports **so that** I can share with stakeholders.

**Acceptance Criteria**:
- [ ] PDF/Excel/HTML output formats
- [ ] GHG Protocol report template
- [ ] Report generation <30s
- [ ] S3 storage for generated reports
- [ ] Report scheduling

**Tasks**:
- CLNZ-802.1: Create report engine (3 SP)
- CLNZ-802.2: Add template system (3 SP)
- CLNZ-802.3: Implement scheduling (2 SP)

---

#### CLNZ-803: Data Export
**Type**: User Story | **Points**: 5 | **Service**: reporting-service (3006)
**As a** user, **I want to** export data **so that** I can use it in other systems.

**Acceptance Criteria**:
- [ ] CSV/Excel/JSON export formats
- [ ] Export up to 100MB
- [ ] Async export for large datasets
- [ ] Download link via email

**Tasks**:
- CLNZ-803.1: Create export endpoint (2 SP)
- CLNZ-803.2: Add async processing (3 SP)

---

#### CLNZ-804: Audit Logging
**Type**: Technical Story | **Points**: 13 | **Service**: audit-service (3007)
**Description**: Implement comprehensive audit logging

**Acceptance Criteria**:
- [ ] All service events logged
- [ ] Immutable audit trail
- [ ] 7-year retention support
- [ ] Query performance <500ms for 1M records
- [ ] 10K events/second throughput

**Tasks**:
- CLNZ-804.1: Create audit event consumer (5 SP)
- CLNZ-804.2: Implement storage strategy (3 SP)
- CLNZ-804.3: Add query API (3 SP)
- CLNZ-804.4: Configure retention (2 SP)

---

#### CLNZ-805: Data Lineage
**Type**: Technical Story | **Points**: 8 | **Service**: audit-service (3007)
**Description**: Track data lineage for compliance

**Acceptance Criteria**:
- [ ] Track data transformations
- [ ] Visualize lineage graph
- [ ] Impact analysis available
- [ ] Lineage query API

**Tasks**:
- CLNZ-805.1: Create lineage model (3 SP)
- CLNZ-805.2: Implement tracking (3 SP)
- CLNZ-805.3: Add visualization API (2 SP)

---

### EPIC CLNZ-E09: Integration & Migration
**Sprint**: 1.4 | **Story Points**: 35 SP

#### CLNZ-901: End-to-End Integration Tests
**Type**: Technical Story | **Points**: 13
**Description**: Comprehensive E2E test suite

**Acceptance Criteria**:
- [ ] User registration → login → create project → enter data → calculate → report flow tested
- [ ] 70% integration test coverage
- [ ] Tests run in CI/CD
- [ ] Test data isolated

**Tasks**:
- CLNZ-901.1: Create test fixtures (3 SP)
- CLNZ-901.2: Write E2E test suite (8 SP)
- CLNZ-901.3: Configure CI/CD (2 SP)

---

#### CLNZ-902: Data Migration from OLD
**Type**: Technical Story | **Points**: 13
**Description**: Migrate data from OLD system

**Acceptance Criteria**:
- [ ] User data migrated
- [ ] Company/project data migrated
- [ ] Activity data migrated
- [ ] Reference data migrated
- [ ] Validation: results match within 0.1%

**Tasks**:
- CLNZ-902.1: Create migration scripts (5 SP)
- CLNZ-902.2: Transform hierarchy (clones → refs) (5 SP)
- CLNZ-902.3: Validate migration (3 SP)

---

#### CLNZ-903: Production Readiness
**Type**: Technical Story | **Points**: 8
**Description**: Prepare for production deployment

**Acceptance Criteria**:
- [ ] All services containerized
- [ ] Health checks working
- [ ] Monitoring configured
- [ ] Security scan passed
- [ ] Documentation complete

**Tasks**:
- CLNZ-903.1: Finalize Docker configs (3 SP)
- CLNZ-903.2: Configure monitoring (3 SP)
- CLNZ-903.3: Complete documentation (2 SP)

---

## Sprint Summary

| Sprint | Focus | Story Points | Epics |
|--------|-------|--------------|-------|
| 0.1 | Infrastructure Foundation | 50 SP | CLNZ-E01 |
| 0.2 | Security & Shared Libraries | 50 SP | CLNZ-E02 |
| 1.1 | Identity & Organization | 60 SP | CLNZ-E03, CLNZ-E04 |
| 1.2 | Reference & Activity | 60 SP | CLNZ-E05, CLNZ-E06 |
| 1.3 | Calculation & Reporting | 60 SP | CLNZ-E07, CLNZ-E08 (partial) |
| 1.4 | Audit & Integration | 60 SP | CLNZ-E08 (complete), CLNZ-E09 |
| **Total** | | **340 SP** | |

---

## Definition of Done

### Story Level
- [ ] Code complete and reviewed
- [ ] Unit tests written (80% coverage)
- [ ] Integration tests passing
- [ ] API documentation updated
- [ ] No critical security issues
- [ ] Performance requirements met
- [ ] Deployed to staging
- [ ] Product Owner acceptance

### Sprint Level
- [ ] All stories meet DoD
- [ ] Sprint demo completed
- [ ] Retrospective held
- [ ] Documentation updated
- [ ] Technical debt addressed

---

## Success Metrics

### Phase 0 (Foundation)
- [ ] Docker environment starts in <5 minutes
- [ ] All 7 services healthy
- [ ] JWT verification <50ms
- [ ] 0 hardcoded secrets

### Phase 1 (Core Services)
- [ ] All critical bugs fixed (C1-C7)
- [ ] 80% unit test coverage
- [ ] 70% integration test coverage
- [ ] <200ms p95 API response time
- [ ] Data migration validated (7-day dual-run)

---

**Document Owner**: Master Coordinator
**Canonical Reference**: [CURRENT_SCOPE.md](../00-Scope/CURRENT_SCOPE.md)
