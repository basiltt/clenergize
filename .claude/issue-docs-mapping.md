# Issue to Documentation Mapping

> **Purpose**: Links CLNZ Jira tickets to detailed documentation in Docs folder
> **Usage**: Before starting any issue, load these docs for full context

---

## How to Use This Mapping

When starting work on an issue:
1. Look up the issue ID (CLNZ-XXX) in this file
2. Read ALL linked documentation
3. Understand the broader context from related docs
4. Only then begin implementation

---

## Sprint 0.1 - Infrastructure Foundation

### CLNZ-101: Docker Compose Development Environment

**Primary Documentation**:
- [JIRA_COMPLETE_PLAN.md](Docs/CURRENT/04-JIRA/JIRA_COMPLETE_PLAN.md) - Lines 44-61
- [01_Environment_Configuration.md](Docs/SHARED/Development/01-Setup/01_Environment_Configuration.md)

**Related Context**:
- [SERVICE_MAPPING.md](Docs/CURRENT/00-Scope/SERVICE_MAPPING.md) - Port assignments
- [CURRENT_SCOPE.md](Docs/CURRENT/00-Scope/CURRENT_SCOPE.md) - 7 services overview

**Agent**: devops-agent

**Key Requirements**:
- Docker Compose starts all 7 services
- MongoDB with replica set
- Redis for cache/pub-sub
- LocalStack for AWS (S3, SQS, Secrets Manager)
- Health checks for all containers

---

### CLNZ-102: Base NestJS Service Templates

**Primary Documentation**:
- [JIRA_COMPLETE_PLAN.md](Docs/CURRENT/04-JIRA/JIRA_COMPLETE_PLAN.md) - Lines 64-82
- [01_Service_Template_Guide.md](Docs/CURRENT/03-Implementation-Guides/01_Service_Template_Guide.md)

**Related Context**:
- [01_Coding_Standards.md](Docs/SHARED/Development/02-Standards/01_Coding_Standards.md)
- [ESG_GENERIC_DATA_MODELS.md](Docs/SHARED/Architecture/ESG_GENERIC_DATA_MODELS.md)
- [01_Microservice_Boundaries.md](Docs/CURRENT/05-Technical-Decisions/01_Microservice_Boundaries.md)

**Agent**: architecture-agent

**Key Requirements**:
- DDD folder structure (domain, application, infrastructure)
- ESG-generic data models included
- Health check endpoints (/health/live, /health/ready)
- Structured logging with correlation IDs
- Template generates new service in <5 minutes

---

### CLNZ-103: Environment Configuration

**Primary Documentation**:
- [JIRA_COMPLETE_PLAN.md](Docs/CURRENT/04-JIRA/JIRA_COMPLETE_PLAN.md) - Lines 84-99
- [01_Environment_Configuration.md](Docs/SHARED/Development/01-Setup/01_Environment_Configuration.md)

**Related Context**:
- [CLAUDE.md](.claude/CLAUDE.md) - MCP Server Connections section

**Agent**: devops-agent

**Key Requirements**:
- Consistent env var naming (MONGODB_URI, REDIS_URL)
- .env.example for all variables
- Fast-fail on missing required vars
- No hardcoded credentials

---

### CLNZ-104: Development Scripts & Makefile

**Primary Documentation**:
- [JIRA_COMPLETE_PLAN.md](Docs/CURRENT/04-JIRA/JIRA_COMPLETE_PLAN.md) - Lines 102-118

**Related Context**:
- [CLAUDE.md](.claude/CLAUDE.md) - Quick Commands section

**Agent**: devops-agent

**Key Requirements**:
- `make up/down/logs/test/seed/clean` commands
- Shell scripts for complex operations
- Documented commands

---

### CLNZ-105: Database Initialization

**Primary Documentation**:
- [JIRA_COMPLETE_PLAN.md](Docs/CURRENT/04-JIRA/JIRA_COMPLETE_PLAN.md) - Lines 121-136
- [04_Database_Migration.md](Docs/CURRENT/03-Implementation-Guides/04_Database_Migration.md)

**Related Context**:
- [SERVICE_MAPPING.md](Docs/CURRENT/00-Scope/SERVICE_MAPPING.md) - Database per service

**Agent**: devops-agent

**Key Requirements**:
- Each service has own database
- Indexes created on startup
- Seed data available
- Connection pooling configured

---

## Sprint 0.2 - Security & Shared Libraries

### CLNZ-201: JWT/JWKS Authentication

**Primary Documentation**:
- [JIRA_COMPLETE_PLAN.md](Docs/CURRENT/04-JIRA/JIRA_COMPLETE_PLAN.md) - Lines 142-159
- [03_Security_Architecture.md](Docs/CURRENT/05-Technical-Decisions/03_Security_Architecture.md)
- [01_Security_Overview.md](Docs/SHARED/SECURITY/01_Security_Overview.md)

**Related Context**:
- [CLAUDE.md](.claude/CLAUDE.md) - Security Requirements section
- [01_Identity_Service.md](Docs/CURRENT/02-Service-Specifications/01_Identity_Service.md)
- OLD Code: `OLD/clenergizeV3-user-management-ms-dev/` (for reference of bugs to fix)

**Agent**: identity-agent (with security-agent support)

**Key Requirements**:
- JWT verified using JWKS (NOT decode-only!)
- RS256 algorithm enforced
- 1 hour access token, 24 hour refresh
- No hardcoded secrets
- Security tests pass

---

### CLNZ-202: AWS Secrets Manager Integration

**Primary Documentation**:
- [JIRA_COMPLETE_PLAN.md](Docs/CURRENT/04-JIRA/JIRA_COMPLETE_PLAN.md) - Lines 162-177

**Related Context**:
- [CLAUDE.md](.claude/CLAUDE.md) - Secrets Management section

**Agent**: security-agent

**Key Requirements**:
- All secrets from Secrets Manager (LocalStack for dev)
- No secrets in env vars or code
- Cached with TTL
- Secret rotation supported

---

### CLNZ-203: Shared Library (@clenergize/shared)

**Primary Documentation**:
- [JIRA_COMPLETE_PLAN.md](Docs/CURRENT/04-JIRA/JIRA_COMPLETE_PLAN.md) - Lines 180-198
- [ESG_GENERIC_DATA_MODELS.md](Docs/SHARED/Architecture/ESG_GENERIC_DATA_MODELS.md)

**Related Context**:
- All Service Specifications in Docs/CURRENT/02-Service-Specifications/

**Agent**: architecture-agent

**Key Requirements**:
- ESGDomain, ESGSubdomains enums
- ESGActivityData, ESGCalculationInput interfaces
- Common DTOs
- Error taxonomy
- Published to npm registry

---

### CLNZ-204: Correlation ID Middleware

**Primary Documentation**:
- [JIRA_COMPLETE_PLAN.md](Docs/CURRENT/04-JIRA/JIRA_COMPLETE_PLAN.md) - Lines 201-216
- [CLAUDE.md](.claude/CLAUDE.md) - Correlation ID Implementation section

**Agent**: architecture-agent

**Key Requirements**:
- X-Correlation-Id propagated
- AsyncLocalStorage for context
- All logs include correlation ID
- HTTP clients forward IDs
- Events include IDs

---

### CLNZ-205: Input Validation Framework

**Primary Documentation**:
- [JIRA_COMPLETE_PLAN.md](Docs/CURRENT/04-JIRA/JIRA_COMPLETE_PLAN.md) - Lines 219-234

**Agent**: architecture-agent

**Key Requirements**:
- Zod schemas for all DTOs
- Consistent error format
- Custom domain validators
- NestJS pipe integration
- 0 npm audit vulnerabilities

---

## Sprint 1.1 - Identity & Organization

### CLNZ-301: User Authentication

**Primary Documentation**:
- [JIRA_COMPLETE_PLAN.md](Docs/CURRENT/04-JIRA/JIRA_COMPLETE_PLAN.md) - Lines 242-258
- [01_Identity_Service.md](Docs/CURRENT/02-Service-Specifications/01_Identity_Service.md)

**Related Context**:
- OLD Code: `OLD/clenergizeV3-user-management-ms-dev/src/auth/`

**Agent**: identity-agent

**Key Requirements**:
- Login returns JWT access + refresh
- bcrypt hash (cost 12)
- Lockout after 5 failed attempts
- Audit logging

---

### CLNZ-302: User Management

**Primary Documentation**:
- [JIRA_COMPLETE_PLAN.md](Docs/CURRENT/04-JIRA/JIRA_COMPLETE_PLAN.md) - Lines 261-276
- [01_Identity_Service.md](Docs/CURRENT/02-Service-Specifications/01_Identity_Service.md)

**Agent**: identity-agent

---

### CLNZ-303: Password Reset

**Primary Documentation**:
- [JIRA_COMPLETE_PLAN.md](Docs/CURRENT/04-JIRA/JIRA_COMPLETE_PLAN.md) - Lines 279-293
- [01_Identity_Service.md](Docs/CURRENT/02-Service-Specifications/01_Identity_Service.md)

**Agent**: identity-agent

---

### CLNZ-304: Role-Based Access Control

**Primary Documentation**:
- [JIRA_COMPLETE_PLAN.md](Docs/CURRENT/04-JIRA/JIRA_COMPLETE_PLAN.md) - Lines 296-311
- [01_Identity_Service.md](Docs/CURRENT/02-Service-Specifications/01_Identity_Service.md)

**Agent**: identity-agent

---

### CLNZ-401: Company Management

**Primary Documentation**:
- [JIRA_COMPLETE_PLAN.md](Docs/CURRENT/04-JIRA/JIRA_COMPLETE_PLAN.md) - Lines 317-332
- [02_Organization_Service.md](Docs/CURRENT/02-Service-Specifications/02_Organization_Service.md)

**Agent**: organization-agent

---

### CLNZ-402: Project Management

**Primary Documentation**:
- [JIRA_COMPLETE_PLAN.md](Docs/CURRENT/04-JIRA/JIRA_COMPLETE_PLAN.md) - Lines 335-350
- [02_Organization_Service.md](Docs/CURRENT/02-Service-Specifications/02_Organization_Service.md)

**Agent**: organization-agent

**Critical**: Reference-based hierarchy (NO CLONING!)

---

### CLNZ-403: Hierarchy Management

**Primary Documentation**:
- [JIRA_COMPLETE_PLAN.md](Docs/CURRENT/04-JIRA/JIRA_COMPLETE_PLAN.md) - Lines 353-368
- [02_Organization_Service.md](Docs/CURRENT/02-Service-Specifications/02_Organization_Service.md)

**Agent**: organization-agent

---

## Sprint 1.2 - Reference & Activity

### CLNZ-501: Emission Factor Management

**Primary Documentation**:
- [JIRA_COMPLETE_PLAN.md](Docs/CURRENT/04-JIRA/JIRA_COMPLETE_PLAN.md) - Lines 374-390
- [03_Reference_Service.md](Docs/CURRENT/02-Service-Specifications/03_Reference_Service.md)

**Related Context**:
- OLD Code: `OLD/clenergizeV3-master-data-ms-dev/`

**Agent**: reference-agent

---

### CLNZ-502: QC Workflow

**Primary Documentation**:
- [JIRA_COMPLETE_PLAN.md](Docs/CURRENT/04-JIRA/JIRA_COMPLETE_PLAN.md) - Lines 393-408
- [03_Reference_Service.md](Docs/CURRENT/02-Service-Specifications/03_Reference_Service.md)

**Agent**: reference-agent

---

### CLNZ-503: Unit Conversions

**Primary Documentation**:
- [JIRA_COMPLETE_PLAN.md](Docs/CURRENT/04-JIRA/JIRA_COMPLETE_PLAN.md) - Lines 411-426
- [03_Reference_Service.md](Docs/CURRENT/02-Service-Specifications/03_Reference_Service.md)

**Agent**: reference-agent

---

### CLNZ-601: Activity Data CRUD

**Primary Documentation**:
- [JIRA_COMPLETE_PLAN.md](Docs/CURRENT/04-JIRA/JIRA_COMPLETE_PLAN.md) - Lines 432-448
- [04_Activity_Service.md](Docs/CURRENT/02-Service-Specifications/04_Activity_Service.md)

**Agent**: activity-agent

---

### CLNZ-602: Bulk Import

**Primary Documentation**:
- [JIRA_COMPLETE_PLAN.md](Docs/CURRENT/04-JIRA/JIRA_COMPLETE_PLAN.md) - Lines 451-466
- [04_Activity_Service.md](Docs/CURRENT/02-Service-Specifications/04_Activity_Service.md)

**Agent**: activity-agent

---

### CLNZ-603: Data Validation

**Primary Documentation**:
- [JIRA_COMPLETE_PLAN.md](Docs/CURRENT/04-JIRA/JIRA_COMPLETE_PLAN.md) - Lines 469-484
- [04_Activity_Service.md](Docs/CURRENT/02-Service-Specifications/04_Activity_Service.md)

**Agent**: activity-agent

---

## Sprint 1.3 - Calculation & Reporting

### CLNZ-701: GHG Calculation Engine

**Primary Documentation**:
- [JIRA_COMPLETE_PLAN.md](Docs/CURRENT/04-JIRA/JIRA_COMPLETE_PLAN.md) - Lines 490-506
- [05_Calculation_Service.md](Docs/CURRENT/02-Service-Specifications/05_Calculation_Service.md)

**Related Context**:
- OLD Code: `OLD/clenergizeV3-carbon-footprint-ms-dev/`

**Agent**: calculation-agent

---

### CLNZ-702: Hierarchical Aggregations

**Primary Documentation**:
- [JIRA_COMPLETE_PLAN.md](Docs/CURRENT/04-JIRA/JIRA_COMPLETE_PLAN.md) - Lines 509-523
- [05_Calculation_Service.md](Docs/CURRENT/02-Service-Specifications/05_Calculation_Service.md)

**Agent**: calculation-agent

---

### CLNZ-703: Calculation Jobs

**Primary Documentation**:
- [JIRA_COMPLETE_PLAN.md](Docs/CURRENT/04-JIRA/JIRA_COMPLETE_PLAN.md) - Lines 526-541
- [05_Calculation_Service.md](Docs/CURRENT/02-Service-Specifications/05_Calculation_Service.md)

**Agent**: calculation-agent

---

### CLNZ-704: Result Caching

**Primary Documentation**:
- [JIRA_COMPLETE_PLAN.md](Docs/CURRENT/04-JIRA/JIRA_COMPLETE_PLAN.md) - Lines 544-558
- [05_Calculation_Service.md](Docs/CURRENT/02-Service-Specifications/05_Calculation_Service.md)

**Agent**: calculation-agent

---

### CLNZ-801: Dashboard API

**Primary Documentation**:
- [JIRA_COMPLETE_PLAN.md](Docs/CURRENT/04-JIRA/JIRA_COMPLETE_PLAN.md) - Lines 564-579
- [06_Reporting_Service.md](Docs/CURRENT/02-Service-Specifications/06_Reporting_Service.md)

**Agent**: reporting-agent

---

### CLNZ-802: Report Generation

**Primary Documentation**:
- [JIRA_COMPLETE_PLAN.md](Docs/CURRENT/04-JIRA/JIRA_COMPLETE_PLAN.md) - Lines 582-597
- [06_Reporting_Service.md](Docs/CURRENT/02-Service-Specifications/06_Reporting_Service.md)

**Agent**: reporting-agent

---

### CLNZ-803: Data Export

**Primary Documentation**:
- [JIRA_COMPLETE_PLAN.md](Docs/CURRENT/04-JIRA/JIRA_COMPLETE_PLAN.md) - Lines 600-613
- [06_Reporting_Service.md](Docs/CURRENT/02-Service-Specifications/06_Reporting_Service.md)

**Agent**: reporting-agent

---

## Sprint 1.4 - Audit & Integration

### CLNZ-804: Audit Logging

**Primary Documentation**:
- [JIRA_COMPLETE_PLAN.md](Docs/CURRENT/04-JIRA/JIRA_COMPLETE_PLAN.md) - Lines 616-632
- [07_Audit_Service.md](Docs/CURRENT/02-Service-Specifications/07_Audit_Service.md)

**Agent**: audit-agent

---

### CLNZ-805: Data Lineage

**Primary Documentation**:
- [JIRA_COMPLETE_PLAN.md](Docs/CURRENT/04-JIRA/JIRA_COMPLETE_PLAN.md) - Lines 635-649
- [07_Audit_Service.md](Docs/CURRENT/02-Service-Specifications/07_Audit_Service.md)

**Agent**: audit-agent

---

### CLNZ-901: End-to-End Integration Tests

**Primary Documentation**:
- [JIRA_COMPLETE_PLAN.md](Docs/CURRENT/04-JIRA/JIRA_COMPLETE_PLAN.md) - Lines 657-669
- [06_Testing_Strategy.md](Docs/CURRENT/03-Implementation-Guides/06_Testing_Strategy.md)
- [01_Testing_Strategy.md](Docs/SHARED/TESTING/01_Testing_Strategy.md)

**Agent**: testing-agent

---

### CLNZ-902: Data Migration from OLD

**Primary Documentation**:
- [JIRA_COMPLETE_PLAN.md](Docs/CURRENT/04-JIRA/JIRA_COMPLETE_PLAN.md) - Lines 672-687
- [OLD_TO_NEW_MIGRATION_GUIDE.md](Docs/CURRENT/01-Overview/OLD_TO_NEW_MIGRATION_GUIDE.md)
- [SERVICE_MAPPING.md](Docs/CURRENT/00-Scope/SERVICE_MAPPING.md)

**Related Context**:
- All OLD code in `OLD/` folder

**Agent**: migration-agent

---

### CLNZ-903: Production Readiness

**Primary Documentation**:
- [JIRA_COMPLETE_PLAN.md](Docs/CURRENT/04-JIRA/JIRA_COMPLETE_PLAN.md) - Lines 690-705

**Agent**: devops-agent

---

## Quick Reference - Service Specs

| Service | Documentation |
|---------|---------------|
| identity-service | [01_Identity_Service.md](Docs/CURRENT/02-Service-Specifications/01_Identity_Service.md) |
| organization-service | [02_Organization_Service.md](Docs/CURRENT/02-Service-Specifications/02_Organization_Service.md) |
| reference-service | [03_Reference_Service.md](Docs/CURRENT/02-Service-Specifications/03_Reference_Service.md) |
| activity-service | [04_Activity_Service.md](Docs/CURRENT/02-Service-Specifications/04_Activity_Service.md) |
| calculation-service | [05_Calculation_Service.md](Docs/CURRENT/02-Service-Specifications/05_Calculation_Service.md) |
| reporting-service | [06_Reporting_Service.md](Docs/CURRENT/02-Service-Specifications/06_Reporting_Service.md) |
| audit-service | [07_Audit_Service.md](Docs/CURRENT/02-Service-Specifications/07_Audit_Service.md) |
| gateway | [08_Gateway_Service.md](Docs/CURRENT/02-Service-Specifications/08_Gateway_Service.md) |

---

## Quick Reference - Shared Docs

| Topic | Documentation |
|-------|---------------|
| Architecture | [PHASE1_Current_Architecture_Overview.md](Docs/CURRENT/03-Architecture/PHASE1_Current_Architecture_Overview.md) |
| Coding Standards | [01_Coding_Standards.md](Docs/SHARED/Development/02-Standards/01_Coding_Standards.md) |
| Git Workflow | [02_Git_Workflow.md](Docs/SHARED/Development/02-Standards/02_Git_Workflow.md) |
| Testing Strategy | [01_Testing_Strategy.md](Docs/SHARED/TESTING/01_Testing_Strategy.md) |
| Security | [01_Security_Overview.md](Docs/SHARED/SECURITY/01_Security_Overview.md) |
| Event Schemas | [Event-Schemas/](Docs/REFERENCE/Event-Schemas/) |

---

**Document**: Issue to Documentation Mapping
**Version**: 1.0.0
**Purpose**: Ensure full context before development
