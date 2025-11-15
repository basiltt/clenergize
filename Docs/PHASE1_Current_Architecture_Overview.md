# Current Architecture Overview - Clenergize V3

## Executive Summary

Clenergize V3 is a carbon footprint management platform that enables organizations to track, calculate, and report their greenhouse gas emissions across multiple scopes (Scope 1, 2, and 3). The system follows a microservices architecture with 6 backend services and 1 frontend application, built primarily with NestJS/TypeScript and Next.js/React.

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     External Systems                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ AWS Cognito  │  │    Brevo     │  │    AWS S3    │      │
│  │    (Auth)    │  │   (Email)    │  │   (Files)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │          Frontend (Next.js 15 + React 19)          │    │
│  │                    Port: 3005                      │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                         HTTP/REST
                              │
┌─────────────────────────────────────────────────────────────┐
│                      Gateway Layer                           │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Backend MS (Gateway + Domain Logic)        │    │
│  │                    Port: 3000                      │    │
│  │  [Mixed concerns: Gateway, Auth, Calculations]     │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │    HTTP/REST      │
                    ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│                   Microservices Layer                        │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ User Management  │  │Project Management│               │
│  │   MS (3001)      │  │   MS (3002)      │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │  Master Data     │  │ Carbon Footprint │               │
│  │   MS (3003)      │  │   MS (3005)      │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                              │
│  ┌──────────────────┐                                      │
│  │ Company Details  │                                      │
│  │   MS (3004)      │                                      │
│  └──────────────────┘                                      │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Data & Messaging Layer                    │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐          │
│  │  MongoDB   │  │   Redis    │  │  AWS SQS   │          │
│  │ (Primary)  │  │ (Cache/    │  │  (Async    │          │
│  │            │  │  PubSub)   │  │  Events)   │          │
│  └────────────┘  └────────────┘  └────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

## Microservices Inventory

### 1. Backend MS (Port: 3000)
**Status**: Anti-pattern - Mixed Gateway and Domain Logic

**Responsibilities**:
- API Gateway/Proxy to other services
- JWT authentication orchestration
- CSRF protection
- Password reset flows
- Direct implementation of emission calculation modules (V1 versions)
- SQS consumer for calculation results
- Result report generation
- Swagger documentation

**Key Issues**:
- Violates gateway pattern by including domain logic
- JWT decoded without signature verification
- Infinite SQS polling loops
- Mixed logging patterns

### 2. User Management MS (Port: 3001)
**Responsibilities**:
- User registration and profile management
- AWS Cognito integration
- Authentication flows
- Legacy user migration
- User lifecycle event publishing (SQS)

**Key Issues**:
- Missing proper error handling
- No transaction boundaries for multi-step operations

### 3. Project Management MS (Port: 3002)
**Responsibilities**:
- Project creation and hierarchy management
- Entity/Subsidiary/Location structure
- User permissions (scope-based)
- Team assignments
- Company entity linking
- Year reference management

**Key Issues**:
- CRITICAL: Clones entire hierarchies instead of references
- Missing AuthGuard on write endpoints
- Non-transactional operations
- N+1 query problems
- Permissions stored as dynamic nested objects

### 4. Master Data MS (Port: 3003)
**Responsibilities**:
- Emission factors management (with QC workflow)
- Conversion factors
- Parameters and energy values
- Input sources
- Master years
- Activity logs for audit

**Key Issues**:
- Seeding runs on EVERY startup (duplicate key errors)
- No type safety (everything is `any`)
- Missing transactions in multi-step operations

### 5. Carbon Footprint MS (Port: 3005)
**Responsibilities**:
- Activity data ingestion
- Emission calculations by category:
  - Stationary Combustion
  - Mobile Combustion
  - Process Emissions
  - Fugitive Emissions
  - Electricity
  - Chilled Water
  - Heating/Steaming
  - Waste Water
- Result aggregation and roll-ups
- Export functionality

**Key Issues**:
- Duplicate modules (V1 and non-V1)
- No transaction boundaries
- Unbounded cascading roll-ups
- Sequential record processing (performance)

### 6. Company Details MS (Port: 3004)
**Responsibilities**:
- Company metadata management
- Entity details per scope

**Key Issues**:
- Minimal functionality
- No database error handling
- Missing ValidationPipe

### 7. Frontend Application (Port: 3005)
**Stack**: Next.js 15, React 19, Ant Design 5, Redux Toolkit
**Responsibilities**:
- User interface
- Data entry forms
- Dashboards and reporting
- User authentication flows

## Data Architecture

### MongoDB Collections

**Shared or Per-Service Collections**:
- User Management: `users`, `sessions`, `legacy_users`
- Project Management: `projects`, `entities`, `subsidiaries`, `locations`, `projectusers`, `companies`, `companyentities`, `yearreferences`
- Master Data: `emissionfactors`, `conversions`, `parameters`, `energyvalues`, `inputsources`, `masteryears`, `scopemasters`, `activitylogs`
- Carbon Footprint: Multiple emission collections, `carbonscopes`, `results`, `activitylogs`
- Company Details: `company_details`

### Redis Usage
- Password reset tokens
- Email invite tokens
- Session data
- Pub/Sub message broker

### AWS SQS Queues
- User lifecycle events
- Permission changes
- Calculation results
- Year activation events

## Communication Patterns

### Synchronous (HTTP/REST)
- Frontend → Backend MS (Gateway)
- Backend MS → All other microservices
- Direct service-to-service calls

### Asynchronous (Events)
**Redis Pub/Sub**:
- User created/deleted events
- Debug logging
- Not type-safe, typo-prone

**AWS SQS**:
- FIFO queues with deduplication
- Infinite polling loops (resilience issue)
- No schema validation

## Critical Anti-Patterns Identified

### 1. Security Vulnerabilities
- **JWT tokens decoded without signature verification** (Critical)
- Default secret fallbacks ("default-secret-key")
- Sensitive data in logs (tokens, cookies)
- Missing authentication guards on write endpoints

### 2. Data Architecture Issues
- **Hierarchy cloning instead of references** (Critical)
- Denormalized company names causing update anomalies
- Permissions as nested dynamic objects (impossible to query)
- Soft delete inconsistency across entities

### 3. Resilience & Stability
- **Infinite SQS polling loops** (Critical)
- No circuit breakers or retry logic
- Missing database transactions
- No graceful shutdown mechanisms

### 4. Service Boundaries
- Backend MS violates gateway principles
- Version management via folder duplication (V1 modules)
- Unclear bounded contexts
- Domain logic scattered across services

### 5. Operational Issues
- No observability (metrics, tracing, health checks)
- Unstructured logging
- Configuration sprawl (no centralized validation)
- Seeding runs on every startup

### 6. Performance Issues
- N+1 query problems in hierarchy operations
- Sequential record processing
- Unbounded cascading roll-ups
- No caching strategy

## Known Technical Debt

1. **Type Safety**: Extensive use of `any` types throughout
2. **Code Duplication**: V1 modules duplicated as folders
3. **Event Contracts**: No schema validation for messages
4. **Error Handling**: Inconsistent error taxonomy
5. **Testing**: Limited test coverage evident
6. **Documentation**: Minimal inline documentation

## Migration Challenges

1. **Data Migration**: Cloned hierarchies need to be converted to references
2. **Permission Model**: Dynamic object structure needs normalization
3. **Event System**: Need proper contracts and validation
4. **Security**: Complete JWT implementation overhaul required
5. **Service Decomposition**: Backend MS needs to be split properly

## Recommended Refactoring Priority

**Phase 1 - Critical Security & Stability**:
- Fix JWT verification
- Replace infinite polling loops
- Add database transactions
- Centralize configuration

**Phase 2 - Data Consistency**:
- Migrate from hierarchy cloning to references
- Normalize permissions
- Fix denormalized fields

**Phase 3 - Service Architecture**:
- Properly separate gateway from domain logic
- Define clear bounded contexts
- Implement proper versioning strategy

**Phase 4 - Observability & Operations**:
- Add health checks
- Implement structured logging
- Add metrics and tracing
- Create proper CI/CD pipeline

## Conclusion

The current Clenergize V3 architecture exhibits significant technical debt and critical security vulnerabilities that must be addressed. The microservice boundaries are poorly defined, with the Backend MS acting as both a gateway and domain service. Data duplication through hierarchy cloning creates maintenance nightmares and consistency issues. The lack of proper resilience patterns, transactions, and observability makes the system unsuitable for production use without significant refactoring.

A complete architectural redesign is recommended to establish proper bounded contexts, implement security best practices, and create a maintainable, scalable system.