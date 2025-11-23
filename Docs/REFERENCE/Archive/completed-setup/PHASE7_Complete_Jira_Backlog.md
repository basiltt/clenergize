# Complete Jira Backlog Structure - Clenergize V3 Rebuild

## Overview

This document contains the complete hierarchical backlog for the Clenergize V3 rebuild project, organized by phases, epics, stories, and tasks. Each item includes story points, priority, and acceptance criteria.

**Total Estimated Effort**: 563 story points across 16 sprints (8 months)
- Original: 555 points (540 base + 15 frontend foundation)
- Added: 8 points (Local Docker Dev Environment)

---

## PHASE 0: Foundation & Risk Mitigation (168 points)

### Epic: CLNZ-09 - Local Development Environment (8 points) 🆕
**Goal**: Establish local-first development using WSL2 + Docker Desktop

#### Story: CLNZ-091 - Docker Compose Development Stack (8 points)
**Priority**: Critical
**As a** developer
**I want** a complete local development environment
**So that** I can develop without cloud dependencies

**Acceptance Criteria**:
- WSL2 + Docker Desktop configured
- docker-compose.dev.yml with all services
- MongoDB and Redis running locally
- LocalStack for AWS service simulation
- Hot-reload working for all services
- Single command startup (`make up`)

**Tasks**:
- CLNZ-091.1: Create Docker Compose structure (2 pts)
- CLNZ-091.2: Configure MongoDB and Redis (1 pt)
- CLNZ-091.3: Set up LocalStack for AWS services (2 pts)
- CLNZ-091.4: Dockerize all microservices (2 pts)
- CLNZ-091.5: Create developer Makefile (1 pt)

### Epic: CLNZ-10 - Security Foundation (45 points)
**Goal**: Eliminate critical security vulnerabilities and establish secure coding practices

#### Story: CLNZ-101 - Implement JWT Verification with JWKS (8 points)
**Priority**: Critical
**As a** security engineer
**I want** proper JWT signature verification
**So that** tokens cannot be forged

**Acceptance Criteria**:
- JWT tokens verified using JWKS endpoint
- RS256 algorithm enforced
- Token expiry validated
- Issuer and audience claims checked
- Unit tests with 100% coverage
- Security test for token forgery attempts

**Tasks**:
- CLNZ-101.1: Research and select JWKS library (2 pts)
- CLNZ-101.2: Implement JWT verification service (3 pts)
- CLNZ-101.3: Create JWKS endpoint (2 pts)
- CLNZ-101.4: Write security tests (1 pt)

#### Story: CLNZ-102 - Secure Secrets Management (5 points)
**Priority**: Critical
**As a** platform engineer
**I want** centralized secrets management
**So that** no secrets are hardcoded

**Acceptance Criteria**:
- AWS Secrets Manager integrated
- All secrets retrieved at runtime
- Local development with .env files
- Secret rotation supported
- No default fallback values

**Tasks**:
- CLNZ-102.1: Configure AWS Secrets Manager (2 pts)
- CLNZ-102.2: Create secrets retrieval service (2 pts)
- CLNZ-102.3: Remove all hardcoded secrets (1 pt)

#### Story: CLNZ-103 - API Rate Limiting & DDoS Protection (5 points)
**Priority**: High
**As a** platform engineer
**I want** rate limiting on all APIs
**So that** the system is protected from abuse

**Acceptance Criteria**:
- Rate limiting per user and IP
- Configurable limits per endpoint
- DDoS protection at API Gateway
- Graceful error responses
- Monitoring of rate limit hits

**Tasks**:
- CLNZ-103.1: Implement rate limiter middleware (2 pts)
- CLNZ-103.2: Configure API Gateway throttling (2 pts)
- CLNZ-103.3: Add monitoring alerts (1 pt)

#### Story: CLNZ-104 - Input Validation Framework (5 points)
**Priority**: High
**As a** developer
**I want** consistent input validation
**So that** injection attacks are prevented

**Acceptance Criteria**:
- DTO validation with class-validator
- Schema validation for all endpoints
- SQL/NoSQL injection prevention
- XSS protection
- Error messages don't leak sensitive info

**Tasks**:
- CLNZ-104.1: Create validation decorators (2 pts)
- CLNZ-104.2: Implement validation pipe (2 pts)
- CLNZ-104.3: Add sanitization utilities (1 pt)

#### Story: CLNZ-105 - Security Headers & CORS (3 points)
**Priority**: High
**As a** security engineer
**I want** proper security headers
**So that** common web vulnerabilities are mitigated

**Acceptance Criteria**:
- Helmet.js configured
- CORS properly configured
- CSP headers implemented
- HSTS enabled
- X-Frame-Options set

#### Story: CLNZ-106 - Audit Logging for Security Events (5 points)
**Priority**: High
**As a** compliance officer
**I want** comprehensive security audit logs
**So that** we can track and investigate security events

**Acceptance Criteria**:
- All authentication events logged
- Failed authorization attempts logged
- Structured JSON logging
- PII masked in logs
- Log retention configured

#### Story: CLNZ-107 - Dependency Vulnerability Scanning (3 points)
**Priority**: High
**As a** security engineer
**I want** automated vulnerability scanning
**So that** dependencies are kept secure

**Acceptance Criteria**:
- npm audit in CI/CD pipeline
- Snyk integration configured
- Automated PRs for patches
- License compliance check

#### Story: CLNZ-108 - Security Testing Suite (8 points)
**Priority**: High
**As a** QA engineer
**I want** automated security tests
**So that** vulnerabilities are caught early

**Acceptance Criteria**:
- OWASP ZAP integration
- Authentication bypass tests
- Authorization flaw tests
- Injection attack tests
- Security regression tests

#### Story: CLNZ-109 - Encryption Implementation (3 points)
**Priority**: High
**As a** data protection officer
**I want** encryption at rest and in transit
**So that** data is protected

**Acceptance Criteria**:
- TLS 1.3 enforced
- Database encryption enabled
- Sensitive fields encrypted
- Encryption key management

---

### Epic: CLNZ-11 - Infrastructure Setup (40 points)

#### Story: CLNZ-111 - AWS VPC and Networking (8 points)
**Priority**: Critical
**As a** platform engineer
**I want** secure network infrastructure
**So that** services are properly isolated

**Acceptance Criteria**:
- VPC with public/private subnets
- NAT Gateway configured
- Security groups defined
- NACLs configured
- Infrastructure as Code (CDK)

**Tasks**:
- CLNZ-111.1: Design network architecture (2 pts)
- CLNZ-111.2: Implement VPC with CDK (3 pts)
- CLNZ-111.3: Configure security groups (2 pts)
- CLNZ-111.4: Set up VPN access (1 pt)

#### Story: CLNZ-112 - ECS Fargate Cluster Setup (5 points)
**Priority**: Critical
**As a** platform engineer
**I want** container orchestration platform
**So that** services can be deployed and scaled

**Acceptance Criteria**:
- ECS cluster created
- Task definitions templated
- Service auto-scaling configured
- ALB integration
- CloudWatch logging

**Tasks**:
- CLNZ-112.1: Create ECS cluster (2 pts)
- CLNZ-112.2: Define task templates (2 pts)
- CLNZ-112.3: Configure auto-scaling (1 pt)

#### Story: CLNZ-113 - MongoDB Atlas Configuration (5 points)
**Priority**: Critical
**As a** database administrator
**I want** managed MongoDB cluster
**So that** data is highly available

**Acceptance Criteria**:
- 3-node replica set
- Encryption at rest
- Automated backups
- VPC peering configured
- Connection pooling

**Tasks**:
- CLNZ-113.1: Provision MongoDB cluster (2 pts)
- CLNZ-113.2: Configure VPC peering (1 pt)
- CLNZ-113.3: Set up backups (1 pt)
- CLNZ-113.4: Create database users (1 pt)

#### Story: CLNZ-114 - Redis Cache Cluster (3 points)
**Priority**: High
**As a** platform engineer
**I want** distributed caching
**So that** performance is optimized

**Acceptance Criteria**:
- ElastiCache Redis cluster
- Multi-AZ deployment
- Automatic failover
- Connection pooling
- Monitoring configured

#### Story: CLNZ-115 - AWS EventBridge Setup (5 points)
**Priority**: High
**As a** platform engineer
**I want** event bus infrastructure
**So that** services can communicate asynchronously

**Acceptance Criteria**:
- Event bus created
- Event rules defined
- DLQ configured
- Schema registry setup
- Event replay capability

**Tasks**:
- CLNZ-115.1: Create event bus (1 pt)
- CLNZ-115.2: Define event rules (2 pts)
- CLNZ-115.3: Configure DLQ (1 pt)
- CLNZ-115.4: Set up monitoring (1 pt)

#### Story: CLNZ-116 - API Gateway Configuration (5 points)
**Priority**: High
**As a** platform engineer
**I want** unified API gateway
**So that** all services are accessed through single entry point

**Acceptance Criteria**:
- API Gateway deployed
- Custom domain configured
- SSL certificate attached
- Request/response transformation
- Usage plans defined

#### Story: CLNZ-117 - S3 Buckets for Storage (3 points)
**Priority**: Medium
**As a** platform engineer
**I want** object storage configured
**So that** files can be stored securely

**Acceptance Criteria**:
- Buckets created with versioning
- Lifecycle policies defined
- CORS configured
- IAM policies set
- Encryption enabled

#### Story: CLNZ-118 - Monitoring Stack Setup (6 points)
**Priority**: High
**As a** DevOps engineer
**I want** comprehensive monitoring
**So that** issues are detected quickly

**Acceptance Criteria**:
- CloudWatch dashboards created
- X-Ray tracing enabled
- Log aggregation configured
- Alerts defined
- Runbooks documented

---

### Epic: CLNZ-12 - Shared Libraries (35 points)

#### Story: CLNZ-121 - Event Bus Client Library (5 points)
**Priority**: High
**As a** developer
**I want** event bus abstraction
**So that** event publishing is consistent

**Acceptance Criteria**:
- Type-safe event publishing
- Schema validation
- Retry logic
- Error handling
- Unit tests

**Tasks**:
- CLNZ-121.1: Create event publisher class (2 pts)
- CLNZ-121.2: Implement schema validation (2 pts)
- CLNZ-121.3: Add retry mechanism (1 pt)

#### Story: CLNZ-122 - Database Repository Pattern (5 points)
**Priority**: High
**As a** developer
**I want** repository base classes
**So that** database operations are standardized

**Acceptance Criteria**:
- Generic repository interface
- MongoDB implementation
- Transaction support
- Soft delete support
- Pagination utilities

**Tasks**:
- CLNZ-122.1: Define repository interface (1 pt)
- CLNZ-122.2: Implement base repository (2 pts)
- CLNZ-122.3: Add transaction support (1 pt)
- CLNZ-122.4: Create pagination helpers (1 pt)

#### Story: CLNZ-123 - Error Handling Framework (5 points)
**Priority**: High
**As a** developer
**I want** consistent error handling
**So that** errors are properly managed

**Acceptance Criteria**:
- Custom exception classes
- Global exception filter
- Error response format
- Error codes taxonomy
- Correlation ID in errors

#### Story: CLNZ-124 - Authentication Guards (5 points)
**Priority**: High
**As a** developer
**I want** reusable auth guards
**So that** endpoints are protected consistently

**Acceptance Criteria**:
- JWT auth guard
- Role-based guard
- Permission-based guard
- API key guard
- Composite guards

#### Story: CLNZ-125 - Validation Utilities (3 points)
**Priority**: Medium
**As a** developer
**I want** validation utilities
**So that** input validation is simplified

**Acceptance Criteria**:
- Custom validators
- Sanitization functions
- Schema validators
- Error messages
- Type transformers

#### Story: CLNZ-126 - Logger Service (3 points)
**Priority**: High
**As a** developer
**I want** structured logging
**So that** logs are searchable

**Acceptance Criteria**:
- JSON structured logs
- Log levels configuration
- Correlation ID injection
- PII masking
- CloudWatch integration

#### Story: CLNZ-127 - Configuration Service (3 points)
**Priority**: High
**As a** developer
**I want** centralized configuration
**So that** settings are managed properly

**Acceptance Criteria**:
- Environment validation
- Type-safe configuration
- Default values
- Secret integration
- Hot reload support

#### Story: CLNZ-128 - Testing Utilities (3 points)
**Priority**: Medium
**As a** developer
**I want** testing helpers
**So that** tests are easier to write

**Acceptance Criteria**:
- Test database utilities
- Mock factories
- Request helpers
- Assertion utilities
- Coverage reporting

#### Story: CLNZ-129 - Health Check Module (3 points)
**Priority**: High
**As a** DevOps engineer
**I want** standardized health checks
**So that** service health is monitored

**Acceptance Criteria**:
- Liveness probe
- Readiness probe
- Dependency checks
- Custom health indicators
- Graceful shutdown

---

### Epic: CLNZ-13 - CI/CD Pipeline (40 points)

#### Story: CLNZ-131 - GitHub Actions Setup (8 points)
**Priority**: Critical
**As a** DevOps engineer
**I want** automated CI/CD pipeline
**So that** deployments are consistent

**Acceptance Criteria**:
- Build pipeline configured
- Test automation integrated
- Security scanning included
- Artifact management
- Environment deployments

**Tasks**:
- CLNZ-131.1: Create build workflow (2 pts)
- CLNZ-131.2: Add test stages (2 pts)
- CLNZ-131.3: Configure deployments (2 pts)
- CLNZ-131.4: Set up environments (2 pts)

#### Story: CLNZ-132 - Docker Image Building (5 points)
**Priority**: High
**As a** DevOps engineer
**I want** optimized Docker images
**So that** containers are efficient

**Acceptance Criteria**:
- Multi-stage builds
- Layer caching
- Security scanning
- Image signing
- Registry push

#### Story: CLNZ-133 - Automated Testing Pipeline (8 points)
**Priority**: High
**As a** QA engineer
**I want** automated test execution
**So that** quality is ensured

**Acceptance Criteria**:
- Unit tests run
- Integration tests run
- Code coverage check
- Test reports generated
- Failed test notifications

#### Story: CLNZ-134 - Code Quality Gates (5 points)
**Priority**: High
**As a** tech lead
**I want** quality gates
**So that** code quality is maintained

**Acceptance Criteria**:
- SonarQube integration
- Coverage thresholds
- Linting checks
- Complexity analysis
- Technical debt tracking

#### Story: CLNZ-135 - Deployment Automation (8 points)
**Priority**: High
**As a** DevOps engineer
**I want** automated deployments
**So that** releases are reliable

**Acceptance Criteria**:
- Blue-green deployments
- Automatic rollback
- Database migrations
- Configuration updates
- Smoke tests

#### Story: CLNZ-136 - Environment Management (6 points)
**Priority**: High
**As a** DevOps engineer
**I want** environment configurations
**So that** deployments are environment-specific

**Acceptance Criteria**:
- Dev environment setup
- Staging environment setup
- Production environment setup
- Environment variables managed
- Secrets per environment

---

## PHASE 1: Core Services MVP (150 points)

### Epic: CLNZ-60 - Frontend API Client Foundation (15 points)

#### Story: CLNZ-601 - BaseAPIClient Implementation (3 points)
**Priority**: Critical
**As a** frontend developer
**I want** a secure base HTTP client
**So that** all API calls are consistent and secure

**Acceptance Criteria**:
- Request/response handling with timeout support
- Error normalization into defined categories
- Correlation ID injection
- No localStorage token usage
- HttpOnly cookie support
- Retry logic for idempotent operations

#### Story: CLNZ-602 - IdentityClient Implementation (3 points)
**Priority**: Critical
**As a** frontend developer
**I want** a dedicated identity service client
**So that** authentication is handled securely

**Acceptance Criteria**:
- Login/logout methods using BaseAPIClient
- getCurrentUser without token exposure
- Password management methods
- All auth via HttpOnly cookies
- Proper error handling
- TypeScript type safety

#### Story: CLNZ-603 - Error Handling Framework (2 points)
**Priority**: High
**As a** user
**I want** clear error messages
**So that** I understand what went wrong

**Acceptance Criteria**:
- Global error boundary
- Error category mapping to user messages
- Retry mechanisms for transient errors
- Graceful degradation

#### Story: CLNZ-604 - Frontend Auth Guards (2 points)
**Priority**: High
**As a** system
**I want** protected routes
**So that** unauthorized access is prevented

**Acceptance Criteria**:
- AuthGuard component
- Permission-based guards
- Redirect to login when needed
- Session checking on mount

#### Story: CLNZ-605 - Service Client Integration (3 points)
**Priority**: High
**As a** developer
**I want** Redux integration
**So that** state management is consistent

**Acceptance Criteria**:
- Auth slice with IdentityClient
- Async thunks for API calls
- Proper loading/error states
- Cache invalidation

#### Story: CLNZ-606 - Remove Legacy Token Handling (2 points)
**Priority**: Critical
**As a** security engineer
**I want** all localStorage tokens removed
**So that** XSS attacks are prevented

**Acceptance Criteria**:
- Audit all localStorage usage
- Remove token storage code
- Update all API calls to use clients
- Verify no direct fetch() calls

---

## PHASE 1: Core Services Backend (135 points)

### Epic: CLNZ-20 - Identity Service (45 points)

#### Story: CLNZ-201 - User Registration & Login (8 points)
**Priority**: Critical
**As a** user
**I want** to register and login
**So that** I can access the platform

**Acceptance Criteria**:
- Registration with email validation
- Login with email/password
- Password complexity enforced
- Account verification email
- Session management

#### Story: CLNZ-202 - JWT Token Management (5 points)
**Priority**: Critical
**As a** developer
**I want** JWT token generation
**So that** users are authenticated

**Acceptance Criteria**:
- Access token generation
- Refresh token rotation
- Token validation
- Claims management
- Expiry handling

#### Story: CLNZ-203 - Role-Based Access Control (8 points)
**Priority**: Critical
**As an** administrator
**I want** role-based permissions
**So that** access is controlled

**Acceptance Criteria**:
- Role CRUD operations
- Permission assignment
- Role hierarchy
- Default roles created
- Permission evaluation

#### Story: CLNZ-204 - Password Management (5 points)
**Priority**: High
**As a** user
**I want** password reset capability
**So that** I can recover my account

**Acceptance Criteria**:
- Forgot password flow
- Reset token generation
- Password change
- Password history
- Email notifications

#### Story: CLNZ-205 - Multi-Factor Authentication (5 points)
**Priority**: High
**As a** user
**I want** MFA protection
**So that** my account is secure

**Acceptance Criteria**:
- TOTP support
- QR code generation
- Backup codes
- MFA enforcement
- Recovery process

#### Story: CLNZ-206 - User Profile Management (5 points)
**Priority**: Medium
**As a** user
**I want** to manage my profile
**So that** my information is current

**Acceptance Criteria**:
- Profile CRUD
- Avatar upload
- Timezone settings
- Notification preferences
- Privacy settings

#### Story: CLNZ-207 - Session Management (5 points)
**Priority**: High
**As a** security engineer
**I want** session management
**So that** sessions are secure

**Acceptance Criteria**:
- Session creation
- Session invalidation
- Concurrent session limits
- Session timeout
- Device tracking

#### Story: CLNZ-208 - AWS Cognito Integration (4 points)
**Priority**: High
**As a** platform engineer
**I want** Cognito integration
**So that** auth is managed

**Acceptance Criteria**:
- User pool configured
- User sync
- MFA through Cognito
- Password policies
- User migration

---

### Epic: CLNZ-21 - Organization Service (45 points)

#### Story: CLNZ-211 - Company Management (5 points)
**Priority**: High
**As an** administrator
**I want** company management
**So that** organizations are registered

**Acceptance Criteria**:
- Company CRUD
- Industry classification
- Settings management
- Logo upload
- Multi-company support

#### Story: CLNZ-212 - Project Creation (8 points)
**Priority**: Critical
**As a** project manager
**I want** project creation
**So that** emissions are tracked

**Acceptance Criteria**:
- Project CRUD
- Reporting periods
- Baseline configuration
- Target setting
- Project templates

#### Story: CLNZ-213 - Reference-Based Hierarchy (13 points)
**Priority**: Critical
**As a** data architect
**I want** reference-based hierarchies
**So that** data isn't duplicated

**Acceptance Criteria**:
- Entity management
- Subsidiary management
- Location management
- Reference relationships
- NO cloning

**Tasks**:
- CLNZ-213.1: Design reference model (3 pts)
- CLNZ-213.2: Implement entities (3 pts)
- CLNZ-213.3: Implement subsidiaries (3 pts)
- CLNZ-213.4: Implement locations (3 pts)
- CLNZ-213.5: Add validation (1 pt)

#### Story: CLNZ-214 - Team Assignments (8 points)
**Priority**: High
**As a** project manager
**I want** team assignments
**So that** users have access

**Acceptance Criteria**:
- User-project assignment
- Role assignment
- Scope definition
- Permission inheritance
- Assignment expiry

#### Story: CLNZ-215 - Permission Evaluation (5 points)
**Priority**: High
**As a** developer
**I want** permission checking
**So that** access is controlled

**Acceptance Criteria**:
- Effective permissions
- Scope evaluation
- Cache permissions
- Permission API
- Audit logging

#### Story: CLNZ-216 - Hierarchy Validation (3 points)
**Priority**: High
**As a** data quality engineer
**I want** hierarchy validation
**So that** structures are valid

**Acceptance Criteria**:
- No circular references
- Parent-child validation
- Code uniqueness
- Temporal validation
- Consistency checks

#### Story: CLNZ-217 - Invitation System (3 points)
**Priority**: Medium
**As a** project manager
**I want** user invitations
**So that** team members can join

**Acceptance Criteria**:
- Send invitations
- Accept/reject flow
- Token management
- Email notifications
- Expiry handling

---

### Epic: CLNZ-22 - Reference Service (45 points)

#### Story: CLNZ-221 - Emission Factor Management (8 points)
**Priority**: Critical
**As a** data manager
**I want** emission factor management
**So that** calculations are accurate

**Acceptance Criteria**:
- Factor CRUD
- Version control
- Geographic applicability
- Source tracking
- Search functionality

#### Story: CLNZ-222 - QC Workflow (5 points)
**Priority**: High
**As a** data quality manager
**I want** QC workflow
**So that** factors are validated

**Acceptance Criteria**:
- Draft/Review/Approved states
- Approval workflow
- Rejection with reasons
- Audit trail
- Notifications

#### Story: CLNZ-223 - Conversion Factors (5 points)
**Priority**: High
**As a** calculator
**I want** unit conversions
**So that** data is normalized

**Acceptance Criteria**:
- Conversion CRUD
- Bidirectional conversions
- Category management
- Precision handling
- Chain conversions

#### Story: CLNZ-224 - Parameter Management (5 points)
**Priority**: High
**As an** administrator
**I want** parameter management
**So that** calculations are configured

**Acceptance Criteria**:
- Parameter CRUD
- Type validation
- Constraints
- Version history
- Default values

#### Story: CLNZ-225 - Factor Import (5 points)
**Priority**: High
**As a** data manager
**I want** bulk import
**So that** factors are loaded

**Acceptance Criteria**:
- CSV/Excel import
- Mapping configuration
- Validation
- Error reporting
- Rollback capability

#### Story: CLNZ-226 - Factor Search Engine (5 points)
**Priority**: High
**As a** calculator
**I want** factor search
**So that** correct factors are found

**Acceptance Criteria**:
- Full-text search
- Filter by attributes
- Recommendations
- Ranking algorithm
- Cache results

#### Story: CLNZ-227 - Master Data Management (5 points)
**Priority**: Medium
**As an** administrator
**I want** master data management
**So that** reference data is maintained

**Acceptance Criteria**:
- Reporting years
- Scope definitions
- Activity types
- Region management
- Standards compliance

#### Story: CLNZ-228 - Initial Data Load (7 points)
**Priority**: Critical
**As a** system
**I want** initial data
**So that** calculations can run

**Acceptance Criteria**:
- EPA factors loaded
- DEFRA factors loaded
- GWP values loaded
- Common conversions loaded
- Validation complete

---

## PHASE 2: Calculation Engine (120 points)

### Epic: CLNZ-30 - Activity Service (50 points)

#### Story: CLNZ-301 - Activity Data CRUD (8 points)
**Priority**: Critical
**As a** data entry user
**I want** activity management
**So that** emissions are tracked

**Acceptance Criteria**:
- Activity creation
- Activity update
- Activity deletion
- Batch operations
- Search/filter

#### Story: CLNZ-302 - Data Validation Framework (8 points)
**Priority**: Critical
**As a** data quality manager
**I want** data validation
**So that** data is accurate

**Acceptance Criteria**:
- Schema validation
- Business rule validation
- Unit validation
- Range checking
- Duplicate detection

#### Story: CLNZ-303 - Bulk Import System (10 points)
**Priority**: High
**As a** data manager
**I want** bulk import
**So that** data entry is efficient

**Acceptance Criteria**:
- CSV import
- Excel import
- Template management
- Mapping configuration
- Error reporting

**Tasks**:
- CLNZ-303.1: Create import parser (3 pts)
- CLNZ-303.2: Build mapping engine (3 pts)
- CLNZ-303.3: Add validation (2 pts)
- CLNZ-303.4: Generate reports (2 pts)

#### Story: CLNZ-304 - File Attachment Management (5 points)
**Priority**: Medium
**As a** auditor
**I want** supporting documents
**So that** data is verifiable

**Acceptance Criteria**:
- File upload to S3
- Attachment metadata
- File type validation
- Size limits
- Virus scanning

#### Story: CLNZ-305 - Data Quality Scoring (5 points)
**Priority**: Medium
**As a** data manager
**I want** quality scores
**So that** data quality is measured

**Acceptance Criteria**:
- Quality metrics
- Scoring algorithm
- Quality dashboard
- Improvement suggestions
- Trend analysis

#### Story: CLNZ-306 - Activity Search & Filter (5 points)
**Priority**: High
**As a** user
**I want** activity search
**So that** I can find data

**Acceptance Criteria**:
- Full-text search
- Advanced filters
- Date range search
- Saved searches
- Export results

#### Story: CLNZ-307 - Template Management (5 points)
**Priority**: Medium
**As a** data manager
**I want** import templates
**So that** imports are standardized

**Acceptance Criteria**:
- Template CRUD
- Template versioning
- Mapping rules
- Validation rules
- Template sharing

#### Story: CLNZ-308 - Data Export (4 points)
**Priority**: Medium
**As a** user
**I want** data export
**So that** data can be analyzed

**Acceptance Criteria**:
- Export to CSV
- Export to Excel
- Custom formats
- Scheduled exports
- Large dataset handling

---

### Epic: CLNZ-31 - Calculation Service (70 points)

#### Story: CLNZ-311 - Core Calculation Engine (13 points)
**Priority**: Critical
**As a** system
**I want** emission calculations
**So that** CO2e is computed

**Acceptance Criteria**:
- GHG Protocol methodology
- All scope calculations
- Factor selection
- Unit conversions
- Result storage

**Tasks**:
- CLNZ-311.1: Design calculation model (3 pts)
- CLNZ-311.2: Implement Scope 1 (3 pts)
- CLNZ-311.3: Implement Scope 2 (3 pts)
- CLNZ-311.4: Implement Scope 3 (3 pts)
- CLNZ-311.5: Add validation (1 pt)

#### Story: CLNZ-312 - Calculation Traceability (8 points)
**Priority**: Critical
**As an** auditor
**I want** calculation traceability
**So that** results are verifiable

**Acceptance Criteria**:
- Link to source activity
- Factor used recorded
- Methodology documented
- Assumptions listed
- Full audit trail

#### Story: CLNZ-313 - Allocation Logic (8 points)
**Priority**: High
**As a** analyst
**I want** emission allocation
**So that** shared emissions are distributed

**Acceptance Criteria**:
- Allocation methods
- Distribution rules
- Percentage allocation
- Custom allocation
- Allocation validation

#### Story: CLNZ-314 - Hierarchical Aggregation (8 points)
**Priority**: High
**As a** reporting user
**I want** roll-up calculations
**So that** totals are computed

**Acceptance Criteria**:
- Location roll-up
- Subsidiary roll-up
- Entity roll-up
- Project totals
- Period aggregation

#### Story: CLNZ-315 - Calculation Job Queue (8 points)
**Priority**: High
**As a** system
**I want** async processing
**So that** large calculations work

**Acceptance Criteria**:
- SQS job queue
- Worker scaling
- Progress tracking
- Error handling
- Retry logic

#### Story: CLNZ-316 - Result Caching (5 points)
**Priority**: High
**As a** performance engineer
**I want** result caching
**So that** performance is optimized

**Acceptance Criteria**:
- Redis caching
- Cache invalidation
- TTL management
- Cache warming
- Hit rate monitoring

#### Story: CLNZ-317 - Methodology Support (5 points)
**Priority**: High
**As a** compliance manager
**I want** multiple methodologies
**So that** standards are met

**Acceptance Criteria**:
- GHG Protocol
- ISO 14064
- Custom methodologies
- Version management
- Compliance checking

#### Story: CLNZ-318 - Calculation Validation (5 points)
**Priority**: High
**As a** quality manager
**I want** calculation validation
**So that** results are accurate

**Acceptance Criteria**:
- Range validation
- Sanity checks
- Comparison to baseline
- Anomaly detection
- Manual review flags

#### Story: CLNZ-319 - What-If Scenarios (10 points)
**Priority**: Medium
**As an** analyst
**I want** scenario modeling
**So that** impacts are assessed

**Acceptance Criteria**:
- Scenario creation
- Parameter changes
- Comparison to baseline
- Multiple scenarios
- Scenario reports

---

## PHASE 3: Reporting & Analytics (60 points)

### Epic: CLNZ-40 - Reporting Service (60 points)

#### Story: CLNZ-401 - Report Generation Engine (10 points)
**Priority**: High
**As a** user
**I want** report generation
**So that** results are documented

**Acceptance Criteria**:
- PDF generation
- Excel generation
- HTML generation
- Template engine
- Batch generation

#### Story: CLNZ-402 - Dashboard API (8 points)
**Priority**: High
**As a** frontend developer
**I want** dashboard API
**So that** data is displayed

**Acceptance Criteria**:
- Widget configuration
- Data aggregation
- Real-time updates
- Caching layer
- Permission checks

#### Story: CLNZ-403 - Analytics Engine (8 points)
**Priority**: High
**As an** analyst
**I want** analytics
**So that** insights are gained

**Acceptance Criteria**:
- Trend analysis
- YoY comparison
- Benchmarking
- Forecasting
- Custom metrics

#### Story: CLNZ-404 - WebSocket Real-time Updates (5 points)
**Priority**: Medium
**As a** user
**I want** real-time updates
**So that** data is current

**Acceptance Criteria**:
- WebSocket server
- Event streaming
- Connection management
- Reconnection logic
- Rate limiting

#### Story: CLNZ-405 - Report Templates (5 points)
**Priority**: High
**As a** report designer
**I want** report templates
**So that** reports are consistent

**Acceptance Criteria**:
- Template CRUD
- Variable binding
- Conditional sections
- Styling options
- Template library

#### Story: CLNZ-406 - Target Tracking (8 points)
**Priority**: High
**As a** sustainability manager
**I want** target tracking
**So that** progress is monitored

**Acceptance Criteria**:
- Target definition
- Progress calculation
- Trend projection
- Alert thresholds
- Target reports

#### Story: CLNZ-407 - Data Export System (5 points)
**Priority**: Medium
**As a** data analyst
**I want** data exports
**So that** analysis is possible

**Acceptance Criteria**:
- Large exports
- Multiple formats
- Scheduled exports
- API access
- Rate limiting

#### Story: CLNZ-408 - Report Scheduling (5 points)
**Priority**: Medium
**As a** manager
**I want** scheduled reports
**So that** updates are automatic

**Acceptance Criteria**:
- Schedule configuration
- Recipient management
- Email delivery
- Failure notifications
- Schedule management

#### Story: CLNZ-409 - Compliance Reports (6 points)
**Priority**: High
**As a** compliance officer
**I want** compliance reports
**So that** requirements are met

**Acceptance Criteria**:
- CDP format
- TCFD format
- GRI format
- Custom formats
- Validation checks

---

## PHASE 4: Hardening & Migration (65 points)

### Epic: CLNZ-50 - Audit Service (25 points)

#### Story: CLNZ-501 - Audit Log Implementation (8 points)
**Priority**: High
**As a** compliance officer
**I want** comprehensive audit logs
**So that** activities are tracked

**Acceptance Criteria**:
- All events logged
- Structured format
- Immutable storage
- Search capability
- Retention policy

#### Story: CLNZ-502 - Compliance Reporting (5 points)
**Priority**: High
**As a** auditor
**I want** compliance reports
**So that** audits are supported

**Acceptance Criteria**:
- Activity reports
- Access reports
- Change reports
- Export capability
- Filtering options

#### Story: CLNZ-503 - Data Lineage Tracking (5 points)
**Priority**: Medium
**As a** data governor
**I want** data lineage
**So that** data flow is understood

**Acceptance Criteria**:
- Source tracking
- Transformation tracking
- Dependency mapping
- Impact analysis
- Lineage visualization

#### Story: CLNZ-504 - User Activity Analytics (4 points)
**Priority**: Medium
**As a** security analyst
**I want** activity analytics
**So that** patterns are detected

**Acceptance Criteria**:
- Login patterns
- Usage analytics
- Anomaly detection
- Risk scoring
- Alert generation

#### Story: CLNZ-505 - Retention Management (3 points)
**Priority**: High
**As a** data manager
**I want** retention management
**So that** compliance is maintained

**Acceptance Criteria**:
- Retention rules
- Automated purging
- Archive process
- Restoration capability
- Compliance validation

---

### Epic: CLNZ-51 - Performance Optimization (20 points)

#### Story: CLNZ-511 - Database Optimization (5 points)
**Priority**: High
**As a** DBA
**I want** optimized queries
**So that** performance is improved

**Acceptance Criteria**:
- Index optimization
- Query optimization
- Connection pooling
- Read replicas
- Caching strategy

#### Story: CLNZ-512 - API Performance Tuning (5 points)
**Priority**: High
**As a** performance engineer
**I want** API optimization
**So that** response times are fast

**Acceptance Criteria**:
- Response compression
- Pagination optimization
- Eager loading
- N+1 prevention
- CDN integration

#### Story: CLNZ-513 - Load Testing (5 points)
**Priority**: High
**As a** QA engineer
**I want** load testing
**So that** capacity is validated

**Acceptance Criteria**:
- Test scenarios
- Performance benchmarks
- Bottleneck identification
- Scaling validation
- Report generation

#### Story: CLNZ-514 - Caching Strategy (5 points)
**Priority**: High
**As a** architect
**I want** comprehensive caching
**So that** performance is optimal

**Acceptance Criteria**:
- Multi-layer caching
- Cache invalidation
- Cache warming
- Hit rate monitoring
- Cache tuning

---

### Epic: CLNZ-52 - Data Migration (20 points)

#### Story: CLNZ-521 - Migration Tools (5 points)
**Priority**: Critical
**As a** data engineer
**I want** migration tools
**So that** data is transferred

**Acceptance Criteria**:
- Data extraction
- Transformation logic
- Loading process
- Validation checks
- Rollback capability

#### Story: CLNZ-522 - User Data Migration (5 points)
**Priority**: Critical
**As a** system
**I want** user migration
**So that** accounts are preserved

**Acceptance Criteria**:
- User accounts migrated
- Roles mapped
- Passwords reset required
- Sessions invalidated
- Verification complete

#### Story: CLNZ-523 - Hierarchy Migration (5 points)
**Priority**: Critical
**As a** system
**I want** hierarchy migration
**So that** structures are converted

**Acceptance Criteria**:
- Clone to reference conversion
- Validation of structures
- Historical snapshots
- Data integrity checks
- Performance optimization

#### Story: CLNZ-524 - Activity Data Migration (5 points)
**Priority**: Critical
**As a** system
**I want** activity migration
**So that** historical data is preserved

**Acceptance Criteria**:
- Activity records migrated
- Attachments transferred
- Calculations re-run
- Validation complete
- Audit trail maintained

---

### Epic: CLNZ-61 - Activity UI Updates (10 points)

**Goal**: Update frontend to integrate with new Activity Service
**Phase**: 4 - Hardening & Migration

#### Story: CLNZ-611 - Activity Data Entry Form (3 points)
**Priority**: High
**As a** data entry user
**I want** improved activity entry forms
**So that** data entry is easier and faster

**Acceptance Criteria**:
- Redesigned activity entry form
- Auto-save functionality
- Inline validation feedback
- Responsive mobile layout
- Field prefill from history

**Tasks**:
- CLNZ-611.1: Design new form layout (1 pt)
- CLNZ-611.2: Implement form components (1 pt)
- CLNZ-611.3: Add validation and auto-save (1 pt)

#### Story: CLNZ-612 - Activity List View (3 points)
**Priority**: High
**As a** user
**I want** better activity list display
**So that** I can quickly find activities

**Acceptance Criteria**:
- Filterable activity list
- Sortable columns
- Bulk actions support
- Export functionality
- Pagination/infinite scroll

**Tasks**:
- CLNZ-612.1: Create list component (1 pt)
- CLNZ-612.2: Add filters and sorting (1 pt)
- CLNZ-612.3: Implement bulk actions (1 pt)

#### Story: CLNZ-613 - Bulk Import UI (4 points)
**Priority**: High
**As a** data manager
**I want** improved bulk import interface
**So that** large imports are manageable

**Acceptance Criteria**:
- Drag-and-drop file upload
- Column mapping interface
- Real-time validation feedback
- Error correction workflow
- Progress tracking

**Tasks**:
- CLNZ-613.1: Build upload component (1 pt)
- CLNZ-613.2: Create mapping interface (2 pts)
- CLNZ-613.3: Add progress tracking (1 pt)

---

### Epic: CLNZ-63 - Frontend Cutover (5 points)

**Goal**: Complete frontend migration to new backend services
**Phase**: 4 - Hardening & Migration

#### Story: CLNZ-631 - Remove Legacy API Calls (2 points)
**Priority**: Critical
**As a** developer
**I want** all legacy API calls removed
**So that** old backend can be decommissioned

**Acceptance Criteria**:
- Audit all API calls
- Replace with new service clients
- Remove dead code
- Update error handling
- Test all user flows

**Tasks**:
- CLNZ-631.1: Audit legacy calls (1 pt)
- CLNZ-631.2: Replace and test (1 pt)

#### Story: CLNZ-632 - Feature Flag Cleanup (2 points)
**Priority**: High
**As a** developer
**I want** feature flags removed
**So that** code is simplified

**Acceptance Criteria**:
- Remove all feature flag checks
- Clean up conditional code
- Update documentation
- Test all features
- Deploy to production

**Tasks**:
- CLNZ-632.1: Remove flags (1 pt)
- CLNZ-632.2: Test and deploy (1 pt)

#### Story: CLNZ-633 - Production Cutover Verification (1 point)
**Priority**: Critical
**As a** DevOps engineer
**I want** cutover verification
**So that** production is stable

**Acceptance Criteria**:
- Smoke tests passing
- Performance within SLOs
- Error rates acceptable
- User acceptance confirmed
- Rollback plan ready

---

## Sprint Allocation

### Phase 0 Sprints (Months 1-2)

**Sprint 0.1** (35 points) - Local Dev Focus
- CLNZ-091: Docker Compose Stack (8 pts) 🆕
- CLNZ-101: JWT Verification (8 pts)
- CLNZ-102: Secrets Management (5 pts)
- CLNZ-121: Event Bus Client (5 pts)
- CLNZ-131: GitHub Actions (4 pts)
- CLNZ-141: Error Handling (5 pts)
- Note: AWS infrastructure (VPC, ECS, MongoDB Atlas) deferred to Sprint 0.2

**Sprint 0.2** (45 points) - AWS Infrastructure + Core Patterns
- CLNZ-111: VPC Setup (8 pts) - From Sprint 0.1
- CLNZ-112: ECS Setup (5 pts) - From Sprint 0.1
- CLNZ-113: MongoDB Atlas Setup (5 pts) - From Sprint 0.1
- CLNZ-103: Rate Limiting (5 pts)
- CLNZ-104: Input Validation (5 pts)
- CLNZ-115: EventBridge (5 pts)
- CLNZ-122: Repository Pattern (5 pts)
- CLNZ-123: Error Framework (5 pts)
- CLNZ-132: Docker Images (2 pts)

**Sprint 0.3** (40 points)
- CLNZ-105: Security Headers (3 pts)
- CLNZ-106: Audit Logging (5 pts)
- CLNZ-114: Redis Setup (3 pts)
- CLNZ-116: API Gateway (5 pts)
- CLNZ-124: Auth Guards (5 pts)
- CLNZ-125: Validation Utils (3 pts)
- CLNZ-126: Logger Service (3 pts)
- CLNZ-127: Config Service (3 pts)
- CLNZ-134: Quality Gates (5 pts)
- CLNZ-135: Deployment (5 pts)

**Sprint 0.4** (40 points)
- CLNZ-107: Vulnerability Scan (3 pts)
- CLNZ-108: Security Tests (8 pts)
- CLNZ-109: Encryption (3 pts)
- CLNZ-117: S3 Buckets (3 pts)
- CLNZ-118: Monitoring (6 pts)
- CLNZ-128: Test Utils (3 pts)
- CLNZ-129: Health Checks (3 pts)
- CLNZ-135: Deployment cont. (3 pts)
- CLNZ-136: Environments (6 pts)
- Buffer: 2 pts

### Phase 1 Sprints (Months 3-4)

**Sprint 1.1** (35 points)
- CLNZ-201: Registration/Login (8 pts)
- CLNZ-202: JWT Tokens (5 pts)
- CLNZ-203: RBAC (8 pts)
- CLNZ-211: Company Mgmt (5 pts)
- CLNZ-601: BaseAPIClient Implementation (3 pts)
- CLNZ-602: IdentityClient Implementation (3 pts)
- CLNZ-221: Emission Factors (3 pts)

**Sprint 1.2** (35 points)
- CLNZ-204: Password Mgmt (5 pts)
- CLNZ-205: MFA (5 pts)
- CLNZ-212: Projects (8 pts)
- CLNZ-213: Hierarchy (8 pts)
- CLNZ-222: QC Workflow (5 pts)
- Buffer: 4 pts

**Sprint 1.3** (35 points)
- CLNZ-206: Profiles (5 pts)
- CLNZ-207: Sessions (5 pts)
- CLNZ-213: Hierarchy cont. (5 pts)
- CLNZ-214: Assignments (8 pts)
- CLNZ-223: Conversions (5 pts)
- CLNZ-224: Parameters (5 pts)
- Buffer: 2 pts

**Sprint 1.4** (30 points)
- CLNZ-208: Cognito (4 pts)
- CLNZ-215: Permissions (5 pts)
- CLNZ-216: Validation (3 pts)
- CLNZ-217: Invitations (3 pts)
- CLNZ-225: Import (5 pts)
- CLNZ-226: Search (5 pts)
- CLNZ-227: Master Data (5 pts)

### Phase 2 Sprints (Months 5-6)

**Sprint 2.1** (30 points)
- CLNZ-301: Activity CRUD (8 pts)
- CLNZ-302: Validation (8 pts)
- CLNZ-228: Initial Load (7 pts)
- CLNZ-311: Calculation (7 pts)

**Sprint 2.2** (30 points)
- CLNZ-303: Bulk Import (10 pts)
- CLNZ-311: Calculation cont. (6 pts)
- CLNZ-312: Traceability (8 pts)
- CLNZ-313: Allocation (6 pts)

**Sprint 2.3** (30 points)
- CLNZ-304: Attachments (5 pts)
- CLNZ-305: Quality Score (5 pts)
- CLNZ-313: Allocation cont. (2 pts)
- CLNZ-314: Aggregation (8 pts)
- CLNZ-315: Job Queue (8 pts)
- Buffer: 2 pts

**Sprint 2.4** (30 points)
- CLNZ-306: Search (5 pts)
- CLNZ-307: Templates (5 pts)
- CLNZ-308: Export (4 pts)
- CLNZ-316: Caching (5 pts)
- CLNZ-317: Methodology (5 pts)
- CLNZ-318: Validation (5 pts)
- Buffer: 1 pt

### Phase 3 Sprints (Month 7)

**Sprint 3.1** (30 points)
- CLNZ-401: Report Engine (10 pts)
- CLNZ-402: Dashboard API (8 pts)
- CLNZ-403: Analytics (8 pts)
- CLNZ-404: WebSocket (4 pts)

**Sprint 3.2** (30 points)
- CLNZ-404: WebSocket cont. (1 pt)
- CLNZ-405: Templates (5 pts)
- CLNZ-406: Targets (8 pts)
- CLNZ-407: Export (5 pts)
- CLNZ-408: Scheduling (5 pts)
- CLNZ-409: Compliance (6 pts)

### Phase 4 Sprints (Month 8)

**Sprint 4.1** (33 points)
- CLNZ-501: Audit Logs (8 pts)
- CLNZ-502: Compliance (5 pts)
- CLNZ-503: Lineage (5 pts)
- CLNZ-511: DB Optimization (5 pts)
- CLNZ-512: API Tuning (5 pts)
- CLNZ-513: Load Testing (5 pts)

**Sprint 4.2** (32 points)
- CLNZ-504: Analytics (4 pts)
- CLNZ-505: Retention (3 pts)
- CLNZ-514: Caching (5 pts)
- CLNZ-521: Migration Tools (5 pts)
- CLNZ-522: User Migration (5 pts)
- CLNZ-523: Hierarchy Migration (5 pts)
- CLNZ-524: Activity Migration (5 pts)
- CLNZ-319: What-If (deferred)

---

## Summary Statistics

### By Phase
- **Phase 0**: 160 points (4 sprints)
- **Phase 1**: 150 points (4 sprints) - includes 15 pts frontend foundation
- **Phase 2**: 120 points (4 sprints)
- **Phase 3**: 60 points (2 sprints)
- **Phase 4**: 65 points (2 sprints)
- **Total**: 555 points (16 sprints)

### By Service
- **Identity**: 45 points
- **Organization**: 45 points
- **Reference**: 45 points
- **Activity**: 50 points
- **Calculation**: 70 points
- **Reporting**: 60 points
- **Audit**: 25 points
- **Infrastructure**: 80 points
- **Frontend Foundation**: 15 points
- **Shared/Other**: 120 points

### By Priority
- **Critical**: 180 points (33%)
- **High**: 270 points (50%)
- **Medium**: 90 points (17%)

### Risk Coverage
- **Security fixes**: 45 points
- **Data model fixes**: 40 points
- **Performance**: 25 points
- **Migration**: 20 points

---

## Definition of Ready

A story is ready for development when:
1. Acceptance criteria defined
2. Dependencies identified
3. Design approved (if applicable)
4. Test scenarios documented
5. Story pointed
6. No blockers

## Definition of Done

A story is done when:
1. Code complete and reviewed
2. Unit tests written (80% coverage)
3. Integration tests passing
4. API documentation updated
5. Deployed to staging
6. Acceptance criteria verified
7. No critical bugs

## Success Metrics

- **Sprint velocity**: 30-40 points/sprint
- **Defect rate**: < 2 bugs per story
- **Test coverage**: > 80%
- **On-time delivery**: > 85%
- **Performance SLOs**: Met 99% of time

---

This complete backlog provides a detailed roadmap for the entire Clenergize V3 rebuild project, with clear priorities, dependencies, and success criteria.