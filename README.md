# Clenergize V3 - Enterprise ESG Management Platform

> A comprehensive **Environmental, Social, and Governance (ESG)** platform enabling organizations to measure, manage, and report sustainability performance across all major frameworks.

[![Build Status](https://github.com/yourcompany/clenergize-v3/workflows/CI/badge.svg)](https://github.com/yourcompany/clenergize-v3/actions)
[![License](https://img.shields.io/badge/license-UNLICENSED-red.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![Phase](https://img.shields.io/badge/phase-1%20of%206-blue.svg)](#current-phase)

---

## Table of Contents

- [Executive Summary](#executive-summary)
- [What is ESG?](#what-is-esg)
- [Project Vision](#project-vision)
- [Current Phase Scope](#current-phase-scope)
- [Future Platform Vision](#future-platform-vision)
- [Architecture Overview](#architecture-overview)
- [OLD vs NEW Codebase](#old-vs-new-codebase)
- [Critical Issues Being Fixed](#critical-issues-being-fixed)
- [Technical Stack](#technical-stack)
- [Project Structure](#project-structure)
- [Documentation Structure](#documentation-structure)
- [Services Overview](#services-overview)
- [Development Setup](#development-setup)
- [Development Commands](#development-commands)
- [Security Architecture](#security-architecture)
- [Testing Strategy](#testing-strategy)
- [AI-Assisted Development](#ai-assisted-development)
- [Sprint Planning](#sprint-planning)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License](#license)

---

## Executive Summary

Clenergize V3 is a ground-up rebuild of an existing carbon footprint management application, transformed into a comprehensive ESG (Environmental, Social, Governance) platform. The project addresses critical security vulnerabilities, architectural flaws, and data integrity issues in the legacy codebase while building a future-proof foundation for a 50+ microservice platform.

**Key Differentiators:**
- **ESG-Generic Architecture**: Data models designed for full E, S, and G coverage from day one
- **Enterprise-Grade Security**: Zero-trust architecture with JWT/JWKS, proper cryptographic implementations
- **Scalable Microservices**: Domain-Driven Design with event-driven communication
- **Multi-Framework Reporting**: Support for GRI, SASB, TCFD, CDP, CSRD, IFRS S1/S2
- **AI-Assisted Development**: Claude agents for accelerated, high-quality development

---

## What is ESG?

**ESG** stands for **Environmental, Social, and Governance** - the three central pillars used to measure the sustainability and ethical impact of an organization.

### Environmental (E)
Measures how a company performs as a steward of the natural environment:
- **Carbon Emissions**: Scope 1 (direct), Scope 2 (indirect energy), Scope 3 (value chain)
- **Water Management**: Consumption, quality, stress assessments
- **Waste & Circular Economy**: Waste streams, recycling rates, circular metrics
- **Biodiversity**: Land use, ecosystem impact, nature-based solutions
- **Energy**: Consumption, efficiency, renewable energy adoption
- **Climate Risk**: Physical and transition risks, TCFD scenarios

### Social (S)
Measures how a company manages relationships with stakeholders:
- **Human Capital**: Demographics, talent development, employee engagement
- **Health & Safety**: Incident rates, risk assessments, occupational health
- **Diversity & Inclusion**: DEI metrics, pay equity, representation
- **Labor Rights**: Fair wages, working conditions, collective bargaining
- **Community Impact**: Local engagement, community investment
- **Supply Chain**: Supplier assessments, modern slavery, human rights

### Governance (G)
Measures how a company is directed and controlled:
- **Board Governance**: Composition, independence, ESG oversight
- **Ethics & Compliance**: Code of conduct, anti-corruption, whistleblower programs
- **Risk Management**: Enterprise risk, ESG-specific risks, controls
- **Data Privacy**: GDPR, CCPA, data protection policies
- **Cybersecurity**: Security metrics, incident response, vulnerability management

### Why ESG Matters
- **Regulatory Compliance**: CSRD (EU), SEC Climate Disclosure (US), mandatory reporting requirements
- **Investor Demand**: $40+ trillion in ESG assets under management globally
- **Risk Management**: Climate risks, supply chain disruptions, reputation risks
- **Competitive Advantage**: Customer preferences, talent attraction, operational efficiency
- **Stakeholder Trust**: Transparency builds trust with customers, employees, and communities

---

## Project Vision

### Current State (OLD Codebase)
The existing application (`OLD/` directory) is a carbon footprint management tool with:
- 6 NestJS microservices with critical security and architectural issues
- Carbon-specific data models (not extensible to full ESG)
- Hard-coded configurations and improper secret management
- Data integrity issues (hierarchy cloning causing 300% data bloat)

### Target State (NEW Codebase)
A comprehensive ESG platform with:
- 50+ microservices covering all E, S, and G dimensions
- ESG-generic data models designed for extensibility
- Enterprise-grade security following industry best practices
- Event-driven architecture with proper audit trails
- Multi-framework reporting (GRI, SASB, TCFD, CDP, CSRD)

### Development Approach
**Build for the future, implement for today:**
- Architecture designed for 50+ services
- Phase 1 implements 7 core services
- Code changes should not be required when adding new ESG modules
- Shared libraries and patterns established from day one

---

## Current Phase Scope

**Phase 1: Core Platform Foundation** (12 weeks, 340 story points)

| Metric | Value |
|--------|-------|
| Duration | 12 weeks (6 sprints x 2 weeks) |
| Story Points | 340 SP |
| Services | 7 microservices |
| Team | 7 developers + 5-7 Claude agents |
| Sprint Velocity | ~57 SP/sprint |

### Phase 1 Services

| Service | Port | Responsibility |
|---------|------|----------------|
| **identity-service** | 3001 | Authentication, authorization, JWT/JWKS, user management |
| **organization-service** | 3002 | Companies, projects, hierarchy templates, permissions |
| **reference-service** | 3003 | Emission factors, units, master data, parameters |
| **activity-service** | 3004 | Activity data ingestion, validation, data quality |
| **calculation-service** | 3005 | GHG calculations, aggregations, methodology support |
| **reporting-service** | 3006 | Reports, dashboards, exports, framework mappings |
| **audit-service** | 3007 | Audit trails, compliance logging, event sourcing |

### Phase 1 Modules
1. **Company Details**: Organization and project management
2. **Carbon Footprint**: Full GHG Protocol implementation (Scopes 1, 2, 3)
3. **Gap Analysis**: Assessment against frameworks and standards
4. **Benchmarking**: Peer comparison and industry analysis
5. **Strategy & Policies**: Sustainability strategy management
6. **KPI & Targets**: Goal setting and progress tracking
7. **Materiality**: Issue prioritization and stakeholder engagement
8. **Report**: Multi-format export (PDF, Excel, CSV)

---

## Future Platform Vision

### Full ESG Platform (Phases 2-6)

The complete platform will include 50+ microservices organized into domains:

```
Platform Structure (Future)
├── Core Platform (8 services)
│   ├── identity-service
│   ├── organization-service
│   ├── reference-service
│   ├── gateway-service
│   ├── integration-service
│   ├── workflow-service
│   ├── audit-service
│   └── notification-service
│
├── Environmental Domain (10 services)
│   ├── carbon-service
│   ├── water-service
│   ├── waste-service
│   ├── biodiversity-service
│   ├── energy-service
│   ├── resource-service
│   ├── climate-risk-service
│   └── ...
│
├── Social Domain (10 services)
│   ├── workforce-service
│   ├── safety-service
│   ├── diversity-service
│   ├── labor-service
│   ├── community-service
│   └── ...
│
├── Governance Domain (10 services)
│   ├── board-service
│   ├── ethics-service
│   ├── risk-service
│   ├── privacy-service
│   ├── cybersecurity-service
│   └── ...
│
└── Strategic & Analytics (10 services)
    ├── materiality-service
    ├── strategy-service
    ├── benchmark-service
    ├── reporting-service
    ├── ml-service
    ├── analytics-service
    └── ...
```

### Phase Breakdown

| Phase | Focus | Duration | Services |
|-------|-------|----------|----------|
| **Phase 1** | Core Platform & Carbon | 12 weeks | 7 services |
| **Phase 2** | Strategic ESG | 8 weeks | 8 services |
| **Phase 3** | Environmental Expansion | 10 weeks | 10 services |
| **Phase 4** | Social Domain | 10 weeks | 10 services |
| **Phase 5** | Governance Domain | 10 weeks | 10 services |
| **Phase 6** | Analytics & AI | 8 weeks | 5 services |

---

## Architecture Overview

### High-Level Architecture

```
                         ┌─────────────────────────────────────┐
                         │           Load Balancer             │
                         │         (AWS ALB / NGINX)           │
                         └─────────────────┬───────────────────┘
                                           │
                         ┌─────────────────▼───────────────────┐
                         │           API Gateway               │
                         │    (Authentication, Rate Limiting)  │
                         └─────────────────┬───────────────────┘
                                           │
        ┌──────────────────────────────────┼──────────────────────────────────┐
        │                                  │                                  │
        ▼                                  ▼                                  ▼
┌───────────────┐                 ┌───────────────┐                 ┌───────────────┐
│   Identity    │                 │ Organization  │                 │   Reference   │
│   Service     │                 │   Service     │                 │   Service     │
│   (3001)      │                 │   (3002)      │                 │   (3003)      │
└───────┬───────┘                 └───────┬───────┘                 └───────┬───────┘
        │                                  │                                  │
        │         ┌────────────────────────┼────────────────────────┐         │
        │         │                        │                        │         │
        │         ▼                        ▼                        ▼         │
        │  ┌───────────────┐      ┌───────────────┐      ┌───────────────┐   │
        │  │   Activity    │      │  Calculation  │      │   Reporting   │   │
        │  │   Service     │      │   Service     │      │   Service     │   │
        │  │   (3004)      │      │   (3005)      │      │   (3006)      │   │
        │  └───────┬───────┘      └───────┬───────┘      └───────┬───────┘   │
        │          │                      │                      │            │
        │          └──────────────────────┼──────────────────────┘            │
        │                                 │                                   │
        │                        ┌────────▼────────┐                          │
        │                        │  Audit Service  │                          │
        │                        │    (3007)       │                          │
        │                        └────────┬────────┘                          │
        │                                 │                                   │
        └─────────────────────────────────┼───────────────────────────────────┘
                                          │
                         ┌────────────────┼────────────────┐
                         │                │                │
                         ▼                ▼                ▼
                 ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
                 │   MongoDB    │ │    Redis     │ │  EventBridge │
                 │  (per svc)   │ │ Cache/PubSub │ │  (Events)    │
                 └──────────────┘ └──────────────┘ └──────────────┘
```

### Key Architecture Patterns

| Pattern | Description | Implementation |
|---------|-------------|----------------|
| **Domain-Driven Design** | Each service owns a bounded context | Service folder structure with domain/, application/, infrastructure/ |
| **Event-Driven Architecture** | Services communicate via events | AWS EventBridge (prod), Redis Pub/Sub (local) |
| **CQRS** | Separate read and write models | Commands for writes, queries for reads |
| **Repository Pattern** | Database abstraction | Repository interfaces in domain, implementations in infrastructure |
| **Circuit Breaker** | Resilience for service calls | Implemented for all inter-service communication |
| **Saga Pattern** | Distributed transactions | For operations spanning multiple services |

### Data Architecture

| Database | Purpose | Services |
|----------|---------|----------|
| **MongoDB** | Document storage | All services (separate DB per service) |
| **Redis** | Caching, sessions, pub/sub | All services |
| **InfluxDB** | Time-series data | Activity, Calculation (future) |
| **Neo4j** | Graph relationships | Organization, Hierarchy (future) |

---

## OLD vs NEW Codebase

### Directory Purpose

| Directory | Purpose |
|-----------|---------|
| `OLD/` | **Reference only** - Legacy codebase with known issues. Used to understand business logic, never copy-paste. |
| `NEW/` | **Active development** - Clean architecture implementation following best practices. |

### Service Mapping

| OLD Service | NEW Service(s) | Key Changes |
|------------|----------------|-------------|
| `clenergizeV3-user-management-ms-dev` | `identity-service` | Proper JWT verification, JWKS support, secrets management |
| `clenergizeV3-project-management-ms-dev` | `organization-service` | Hierarchy references instead of cloning, proper data normalization |
| `clenergizeV3-master-data-ms-dev` | `reference-service` | Type safety, versioning, proper seeding |
| `clenergizeV3-carbon-footprint-ms-dev` | `activity-service` + `calculation-service` | Separation of concerns, transactions, deduplication |
| `clenergizeV3-backend-ms-dev` | Gateway + `reporting-service` | Fixed infinite loops, separated concerns |
| `clenergizeV3-companyDetails-ms-dev` | Merged into `organization-service` | Consolidated functionality |

### Important: When Working with OLD Code

1. **Read** OLD code to understand business logic
2. **Check** `OLD/DESIGN-REVIEW.md` for known issues
3. **Rewrite** cleanly in NEW following DDD patterns
4. **Fix** all identified security and data issues
5. **Add** comprehensive tests
6. **Never** copy-paste from OLD without review

---

## Critical Issues Being Fixed

### Critical Severity (C1-C10)

| ID | Issue | Impact | Fix in NEW |
|----|-------|--------|------------|
| **C1** | JWT tokens decoded but NOT verified | Critical security vulnerability | Proper JWKS verification with `jwks-rsa` |
| **C2** | Infinite SQS polling loops | Performance degradation, cost | Event-driven with proper error handling |
| **C3** | Hierarchy cloning instead of references | 300% data bloat, sync issues | Reference IDs with template versioning |
| **C4** | Heavy denormalization | Data inconsistency | Proper normalization with computed views |
| **C5** | V1 endpoint duplication | Confusion, maintenance burden | Single versioned API |
| **C6** | Missing transactions | Data integrity risk | MongoDB transactions for multi-step operations |
| **C7** | Seeding on every startup | Duplicate data | Idempotent seeding with version checks |
| **C8** | Hardcoded secrets in code | Security breach risk | AWS Secrets Manager, environment variables |
| **C9** | No audit trail | Compliance failure | Full audit service with event sourcing |
| **C10** | Weak password hashing | Credential compromise | bcrypt with proper work factor, OWASP compliance |

### Major Issues (M1-M10)

| ID | Issue | Fix |
|----|-------|-----|
| **M1** | Mixed concerns in services | DDD with clear boundaries |
| **M2** | No rate limiting | Proper rate limiting per endpoint |
| **M3** | No input validation | Zod schemas for all inputs |
| **M4** | No correlation IDs | AsyncLocalStorage-based tracing |
| **M5** | Inconsistent error handling | Global exception filters |
| **M6** | No health checks | Standardized health endpoints |
| **M7** | No circuit breakers | Resilience patterns implemented |
| **M8** | No retry logic | Exponential backoff for external calls |
| **M9** | No dead letter queues | DLQ for failed events |
| **M10** | No metrics/monitoring | Prometheus metrics, Grafana dashboards |

---

## Technical Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 20+ | Runtime environment |
| **NestJS** | 10+ | Backend framework |
| **TypeScript** | 5+ | Type safety |
| **MongoDB** | 7+ | Document database |
| **Redis** | 7+ | Cache, sessions, pub/sub |
| **Jest** | 29+ | Testing framework |
| **Zod** | 3+ | Runtime validation |
| **Winston** | 3+ | Structured logging |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14+ | React framework |
| **React** | 18+ | UI library |
| **TypeScript** | 5+ | Type safety |
| **TailwindCSS** | 3+ | Styling |
| **React Query** | 5+ | Server state management |
| **Zustand** | 4+ | Client state management |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Local development |
| **NGINX** | API Gateway (local) |
| **LocalStack** | AWS simulation (local) |
| **GitHub Actions** | CI/CD |
| **AWS** | Production cloud |

### Security

| Technology | Purpose |
|------------|---------|
| **JWT/JWKS** | Token-based authentication |
| **AWS Cognito** | Identity provider |
| **AWS Secrets Manager** | Secrets management |
| **Helmet** | Security headers |
| **bcrypt** | Password hashing |

---

## Project Structure

```
ClenergizeV3/
│
├── NEW/                              # Active development - Clean architecture
│   ├── identity-service/             # Authentication & authorization
│   │   ├── src/
│   │   │   ├── domain/               # Business logic, entities, events
│   │   │   ├── application/          # Use cases, commands, queries
│   │   │   ├── infrastructure/       # Database, HTTP, external services
│   │   │   └── shared/               # Service-specific shared code
│   │   ├── test/                     # Tests (unit, integration, e2e)
│   │   ├── .env.example              # Environment template
│   │   └── package.json
│   │
│   ├── organization-service/         # Companies, projects, hierarchies
│   ├── reference-service/            # Master data, emission factors
│   ├── activity-service/             # Data ingestion, validation
│   ├── calculation-service/          # GHG calculations
│   ├── reporting-service/            # Reports, exports
│   ├── audit-service/                # Audit trails
│   │
│   ├── frontend/                     # Next.js application (to be scaffolded)
│   │
│   ├── shared/                       # Shared packages
│   │   └── packages/
│   │       ├── auth-lib/             # JWT/JWKS utilities
│   │       ├── common/               # Types, utilities, constants
│   │       ├── config-lib/           # Configuration management
│   │       ├── correlation/          # Request correlation IDs
│   │       ├── event-bus/            # Event publishing/subscribing
│   │       ├── event-lib/            # Event definitions
│   │       ├── migration/            # Database migration utilities
│   │       ├── repository/           # Base repository patterns
│   │       ├── service-template/     # Service scaffolding
│   │       └── test-utils/           # Testing utilities
│   │
│   ├── migration-scripts/            # Data migration from OLD to NEW
│   ├── monitoring-dashboards/        # Grafana dashboard definitions
│   ├── performance-tests/            # Load and performance tests
│   └── scripts/                      # Utility scripts
│
├── OLD/                              # Legacy codebase (reference only)
│   ├── clenergizeV3-backend-ms-dev/
│   ├── clenergizeV3-carbon-footprint-ms-dev/
│   ├── clenergizeV3-companyDetails-ms-dev/
│   ├── clenergizeV3-frontend-dev/
│   ├── clenergizeV3-master-data-ms-dev/
│   ├── clenergizeV3-project-management-ms-dev/
│   ├── clenergizeV3-user-management-ms-dev/
│   └── DESIGN-REVIEW.md              # Critical issues documentation
│
├── Docs/                             # All documentation
│   ├── CURRENT/                      # Phase 1 documentation
│   ├── FUTURE/                       # Future phases planning
│   ├── SHARED/                       # Development guides, standards
│   └── REFERENCE/                    # Event schemas, governance
│
├── .claude/                          # Claude agent configuration
│   ├── CLAUDE.md                     # Master agent instructions
│   ├── agents/                       # Agent definitions
│   ├── commands/                     # Slash commands
│   ├── patterns/                     # Implementation patterns
│   └── skills/                       # Agent skills
│
├── .github/                          # GitHub configuration
│   ├── workflows/                    # CI/CD pipelines
│   ├── CODEOWNERS                    # Code ownership
│   └── PULL_REQUEST_TEMPLATE.md      # PR template
│
├── init-scripts/                     # Database initialization scripts
├── nginx/                            # NGINX configuration
│
├── docker-compose.dev.yml            # Development environment
├── Makefile                          # Development commands
└── README.md                         # This file
```

---

## Documentation Structure

```
Docs/
├── CURRENT/                          # Phase 1 - Building NOW
│   ├── 00-Scope/                     # Scope definitions
│   │   ├── CURRENT_SCOPE.md          # Authoritative scope document
│   │   ├── SERVICE_MAPPING.md        # OLD to NEW mapping
│   │   └── FUTURE_SCOPE.md           # Future phases overview
│   ├── 01-Architecture/              # Architecture decisions
│   ├── 02-Service-Specifications/    # Service specs for Phase 1
│   ├── 03-API-Documentation/         # API contracts
│   └── 04-Sprint-Documentation/      # Sprint plans and tasks
│
├── FUTURE/                           # Phases 2-6 - Planning ONLY
│   ├── Phase2-Strategic-ESG/
│   ├── Phase3-Environmental/
│   ├── Phase4-Social/
│   ├── Phase5-Governance/
│   └── Phase6-Analytics/
│
├── SHARED/                           # Applies to ALL phases
│   ├── Architecture/                 # ESG-generic data models
│   ├── Development/                  # Setup guides, standards
│   ├── Testing/                      # Testing strategies
│   ├── Security/                     # Security policies
│   ├── Deployment/                   # Deployment guides
│   ├── Operations/                   # Operational procedures
│   └── DATA/                         # Data schemas
│
└── REFERENCE/                        # Reference materials
    ├── Event-Schemas/                # Domain event definitions
    ├── Governance/                   # Project governance, reviews
    └── Archive/                      # Historical documents
```

---

## Services Overview

### Phase 1 Services (Port 3001-3007)

#### identity-service (Port 3001)
**Responsibility**: Authentication, authorization, user management

**Key Features**:
- JWT token issuance with RS256 signing
- JWKS endpoint for public key distribution
- User registration, login, password reset
- Role-based access control (RBAC)
- Session management with refresh tokens
- MFA support (TOTP)

**Key Endpoints**:
- `POST /api/v1/auth/login` - User authentication
- `POST /api/v1/auth/refresh` - Token refresh
- `GET /.well-known/jwks.json` - Public keys
- `POST /api/v1/users` - User registration

#### organization-service (Port 3002)
**Responsibility**: Companies, projects, hierarchy management

**Key Features**:
- Company and subsidiary management
- Project lifecycle management
- Hierarchy template system (reference-based)
- Permission management
- Team assignments

**Key Endpoints**:
- `POST /api/v1/companies` - Create company
- `POST /api/v1/projects` - Create project
- `GET /api/v1/projects/:id/hierarchy` - Get hierarchy
- `POST /api/v1/hierarchy-templates` - Create template

#### reference-service (Port 3003)
**Responsibility**: Master data, emission factors

**Key Features**:
- Emission factor management (EPA, DEFRA, custom)
- Unit conversions
- Parameter definitions
- Data versioning and audit

**Key Endpoints**:
- `GET /api/v1/emission-factors` - List factors
- `GET /api/v1/units` - List units
- `POST /api/v1/emission-factors` - Create factor

#### activity-service (Port 3004)
**Responsibility**: Activity data ingestion

**Key Features**:
- Bulk data import (Excel, CSV, API)
- Data validation and quality scoring
- Deduplication
- Evidence attachment

**Key Endpoints**:
- `POST /api/v1/activities` - Create activity
- `POST /api/v1/activities/bulk` - Bulk import
- `GET /api/v1/activities/:id` - Get activity

#### calculation-service (Port 3005)
**Responsibility**: GHG calculations

**Key Features**:
- Multi-methodology support (GHG Protocol, ISO 14064)
- Scope 1, 2, 3 calculations
- Aggregations and rollups
- Uncertainty analysis

**Key Endpoints**:
- `POST /api/v1/calculations` - Trigger calculation
- `GET /api/v1/calculations/:id` - Get result
- `POST /api/v1/aggregations` - Run aggregation

#### reporting-service (Port 3006)
**Responsibility**: Reports and exports

**Key Features**:
- Multi-framework reporting (GHG Protocol, CDP, etc.)
- PDF, Excel, CSV exports
- Dashboard data APIs
- Scheduled reports

**Key Endpoints**:
- `POST /api/v1/reports` - Generate report
- `GET /api/v1/reports/:id/export` - Download report
- `GET /api/v1/dashboards/:id` - Dashboard data

#### audit-service (Port 3007)
**Responsibility**: Audit trails, compliance

**Key Features**:
- Full event sourcing
- Compliance logging
- Change history
- Data retention policies

**Key Endpoints**:
- `GET /api/v1/audit/events` - Query events
- `GET /api/v1/audit/entity/:id/history` - Entity history

---

## Development Setup

### Prerequisites

| Requirement | Version | Purpose |
|-------------|---------|---------|
| Docker Desktop | 24+ | Container runtime |
| Node.js | 20+ | JavaScript runtime |
| Git | 2.40+ | Version control |
| VS Code | Latest | Recommended IDE |

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/yourcompany/clenergize-v3.git
cd clenergize-v3

# 2. Start infrastructure
make up

# 3. Verify services are running
make status

# 4. View logs
make logs
```

### Service URLs (Local Development)

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | - |
| API Gateway | http://localhost:80/api | - |
| MongoDB Express | http://localhost:8081 | admin/admin123 |
| Redis Commander | http://localhost:8082 | - |
| Mailhog (Email) | http://localhost:8025 | - |
| Swagger Docs | http://localhost:8080 | - |

### Per-Service Development

Each service has its own `.env.example`:

```bash
# Navigate to service directory
cd NEW/identity-service

# Copy environment file
cp .env.example .env

# Install dependencies
npm install

# Run in development mode
npm run start:dev
```

### Debug Ports

| Service | Debug Port |
|---------|------------|
| identity-service | 9001 |
| organization-service | 9002 |
| reference-service | 9003 |
| activity-service | 9004 |
| calculation-service | 9005 |
| reporting-service | 9006 |
| audit-service | 9007 |

---

## Development Commands

### Docker Compose Commands

```bash
make up                    # Start all services
make down                  # Stop all services
make restart               # Restart all services
make logs                  # View all logs
make logs-service service=identity  # View specific service logs
make status                # Check service status
make clean                 # Remove containers and volumes
```

### Build & Test Commands

```bash
make install               # Install all dependencies
make build                 # Build all services
make test                  # Run all tests
make lint                  # Run linters
make format                # Format code
make security-scan         # Run security audit
```

### Database Commands

```bash
make mongo-shell           # Open MongoDB shell
make redis-cli             # Open Redis CLI
make db-backup             # Backup databases
make db-restore            # Restore from backup
make seed                  # Seed development data
```

### Service-Specific Commands

```bash
make build-service service=identity
make test-service service=identity
make restart-service service=identity
```

---

## Security Architecture

### Authentication Flow

```
┌─────────┐     ┌─────────┐     ┌──────────────┐     ┌─────────┐
│ Client  │────▶│ Gateway │────▶│   Identity   │────▶│ Cognito │
│         │     │         │     │   Service    │     │  (IDP)  │
└─────────┘     └────┬────┘     └──────────────┘     └─────────┘
                     │
                     │ JWT Validation
                     │ (JWKS)
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌──────────────┐         ┌──────────────┐
│   Service    │         │   Service    │
│     A        │         │     B        │
└──────────────┘         └──────────────┘
```

### Security Requirements

| Requirement | Implementation |
|-------------|----------------|
| **Token Verification** | JWT verified with JWKS (RS256) |
| **Token Expiry** | Access: 1 hour, Refresh: 7 days |
| **Password Policy** | 12+ chars, uppercase, lowercase, number, special (OWASP) |
| **Rate Limiting** | 100 requests/minute per user |
| **CORS** | Explicit origin allowlist |
| **Headers** | Helmet for security headers |
| **Secrets** | AWS Secrets Manager (never in code) |
| **Audit** | All auth events logged |

---

## Testing Strategy

### Coverage Targets

| Test Type | Coverage Target | Tools |
|-----------|-----------------|-------|
| Unit Tests | 80% | Jest |
| Integration Tests | 70% | Supertest, TestContainers |
| E2E Tests | Critical paths | Playwright |
| Contract Tests | All APIs | Pact |
| Performance Tests | <200ms p95 | K6 |

### Running Tests

```bash
# All tests
npm test

# Specific types
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:cov

# Service-specific
make test-service service=identity
```

---

## AI-Assisted Development

### Claude Agent Architecture

The project uses Claude AI agents for accelerated development:

```
Master Coordinator (Orchestrator)
├── Security Agent (identity-service)
├── Organization Agent (organization-service)
├── Data Agent (reference, activity, calculation)
├── Reporting Agent (reporting-service)
├── DevOps Agent (infrastructure)
├── Testing Agent (quality assurance)
└── Migration Agent (OLD to NEW)
```

### Agent Configuration

Agent definitions are in `.claude/`:

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Master instructions for all agents |
| `agents/` | Individual agent definitions |
| `commands/` | Slash commands |
| `patterns/` | Implementation patterns |
| `skills/` | Agent capabilities |

### Code Review Policy

**All code requires human review** - even AI-generated code:

1. AI creates PR with changes
2. CI/CD runs automated checks
3. Human reviewer approves
4. Human merges PR

See [Code Review Policy](Docs/REFERENCE/Governance/CODE_REVIEW_POLICY.md) for details.

---

## Sprint Planning

### Current Sprint: Sprint 0.1 - Local Development Environment

**Goals**:
- Docker environment running all services
- JWT verification implemented correctly
- LocalStack simulating AWS services
- Base service templates created
- Security vulnerabilities patched

### Sprint Structure

| Sprint | Focus | Duration |
|--------|-------|----------|
| Sprint 0.1-0.2 | Foundation, Security | 4 weeks |
| Sprint 1.1-1.2 | Identity & Organization | 4 weeks |
| Sprint 1.3-1.4 | Data & Calculation | 4 weeks |

---

## Contributing

### Workflow

1. **Create feature branch** from `develop`:
   ```bash
   git checkout -b feature/CLNZ-XXX-description
   ```

2. **Make changes** following [coding standards](Docs/SHARED/Development/02-Standards/01_Coding_Standards.md)

3. **Write tests** (minimum 80% coverage)

4. **Create PR** using the [PR template](.github/PULL_REQUEST_TEMPLATE.md)

5. **Wait for human review** (mandatory)

### Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production releases |
| `develop` | Integration branch |
| `feature/*` | Feature development |
| `bugfix/*` | Bug fixes |
| `hotfix/*` | Production hotfixes |

### Code Style

- **TypeScript** for all code
- **ESLint + Prettier** for formatting
- **Conventional Commits** for messages
- **DDD patterns** for architecture

---

## Roadmap

### Phase 1 (Current): Core Platform Foundation
**Timeline**: 12 weeks
- [x] Project structure setup
- [x] Documentation framework
- [x] Docker development environment
- [ ] Identity service with JWT/JWKS
- [ ] Organization service with hierarchies
- [ ] Reference service with emission factors
- [ ] Activity service with bulk import
- [ ] Calculation service with GHG calculations
- [ ] Reporting service with exports
- [ ] Audit service with event sourcing

### Phase 2: Strategic ESG
**Timeline**: 8 weeks (after Phase 1)
- Materiality assessment
- Strategy management
- Benchmarking
- Goal setting

### Phase 3-6: Domain Expansion
**Timeline**: 38 weeks (after Phase 2)
- Environmental domain expansion
- Social domain implementation
- Governance domain implementation
- Analytics and AI capabilities

---

## License

**UNLICENSED** - Proprietary software. All rights reserved.

---

## Support

| Channel | Purpose |
|---------|---------|
| [Documentation](Docs/) | Comprehensive guides |
| [GitHub Issues](https://github.com/yourcompany/clenergize-v3/issues) | Bug reports, feature requests |
| #clenergize-rebuild (Slack) | Team communication |

---

**Last Updated**: November 2024
**Version**: 1.0.0
