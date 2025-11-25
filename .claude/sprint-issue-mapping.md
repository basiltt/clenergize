# Sprint Issue Mapping

> **Purpose**: Maps Jira issues to sprints for the Clenergize V3 project
> **Generated**: 2025-11-25
> **Status**: COMPLETED - All sprints created and issues assigned

## Sprint IDs (Created 2025-11-25)

| Sprint | Name | Jira Sprint ID | Issues Assigned |
|--------|------|----------------|-----------------|
| 0.1 | Infrastructure | 35 | ~20 |
| 0.2 | Security | 36 | ~30 |
| 1.1 | Identity & Org | 37 | ~17 |
| 1.2 | Reference & Data | 38 | ~18 |
| 1.3 | Calc & Reports | 39 | ~20 |
| 1.4 | Audit & Integ | 40 | ~16 |

**Total**: 6 sprints, ~121 issues assigned

---

## Sprint Definitions

### Sprint 0.1 - Infrastructure Foundation
- **Story Points**: 48 SP
- **Duration**: 2 weeks
- **Focus**: Docker, Environment, Base Setup

| Jira Key | Doc ID | Title | SP | Epic |
|----------|--------|-------|-----|------|
| CLNZ-20 | CLNZ-101 | Docker Compose Development Environment | 13 | CLNZ-5 (E01) |
| TBD | CLNZ-102 | Base NestJS Service Templates | 13 | CLNZ-5 (E01) |
| TBD | CLNZ-103 | Environment Configuration | 8 | CLNZ-5 (E01) |
| TBD | CLNZ-104 | Development Scripts & Makefile | 8 | CLNZ-5 (E01) |
| TBD | CLNZ-105 | Database Initialization | 6 | CLNZ-5 (E01) |

---

### Sprint 0.2 - Security & Shared Libraries
- **Story Points**: 50 SP
- **Duration**: 2 weeks
- **Focus**: JWT, Secrets, Shared Code

| Jira Key | Doc ID | Title | SP | Epic |
|----------|--------|-------|-----|------|
| CLNZ-21 | CLNZ-201 | JWT/JWKS Authentication | 13 | CLNZ-6 (E02) |
| CLNZ-22 | CLNZ-202 | AWS Secrets Manager Integration | 8 | CLNZ-6 (E02) |
| CLNZ-23 | CLNZ-203 | Shared Library (@clenergize/shared) | 13 | CLNZ-6 (E02) |
| CLNZ-24 | CLNZ-204 | Correlation ID Middleware | 8 | CLNZ-6 (E02) |
| CLNZ-25 | CLNZ-205 | Input Validation Framework | 8 | CLNZ-6 (E02) |

**Additional Security Stories**:
| Jira Key | Doc ID | Title | SP | Epic |
|----------|--------|-------|-----|------|
| CLNZ-26 | CLNZ-106 | Audit Logging for Security Events | 5 | CLNZ-6 (E02) |
| CLNZ-27 | CLNZ-107 | Dependency Vulnerability Scanning | 3 | CLNZ-6 (E02) |
| CLNZ-28 | CLNZ-108 | Security Testing Suite | 8 | CLNZ-6 (E02) |
| CLNZ-29 | CLNZ-109 | Encryption Implementation | 3 | CLNZ-6 (E02) |

---

### Sprint 1.1 - Identity & Organization Services
- **Story Points**: 60 SP
- **Duration**: 2 weeks
- **Focus**: User Auth, Company, Project Management

| Jira Key | Doc ID | Title | SP | Epic |
|----------|--------|-------|-----|------|
| TBD | CLNZ-301 | User Authentication | 13 | CLNZ-11 (E03) |
| TBD | CLNZ-302 | User Management | 8 | CLNZ-11 (E03) |
| TBD | CLNZ-303 | Password Reset | 5 | CLNZ-11 (E03) |
| TBD | CLNZ-304 | Role-Based Access Control | 8 | CLNZ-11 (E03) |
| TBD | CLNZ-401 | Company Management | 8 | CLNZ-12 (E04) |
| TBD | CLNZ-402 | Project Management | 8 | CLNZ-12 (E04) |
| TBD | CLNZ-403 | Hierarchy Management | 8 | CLNZ-12 (E04) |

---

### Sprint 1.2 - Reference & Activity Services
- **Story Points**: 60 SP
- **Duration**: 2 weeks
- **Focus**: Emission Factors, Activity Data

| Jira Key | Doc ID | Title | SP | Epic |
|----------|--------|-------|-----|------|
| TBD | CLNZ-501 | Emission Factor Management | 13 | CLNZ-13 (E05) |
| TBD | CLNZ-502 | QC Workflow | 8 | CLNZ-13 (E05) |
| TBD | CLNZ-503 | Unit Conversions | 8 | CLNZ-13 (E05) |
| TBD | CLNZ-601 | Activity Data CRUD | 13 | CLNZ-14 (E06) |
| TBD | CLNZ-602 | Bulk Import | 8 | CLNZ-14 (E06) |
| TBD | CLNZ-603 | Data Validation | 8 | CLNZ-14 (E06) |

---

### Sprint 1.3 - Calculation & Reporting
- **Story Points**: 60 SP
- **Duration**: 2 weeks
- **Focus**: GHG Calculations, Reports

| Jira Key | Doc ID | Title | SP | Epic |
|----------|--------|-------|-----|------|
| TBD | CLNZ-701 | GHG Calculation Engine | 13 | CLNZ-15 (E07) |
| TBD | CLNZ-702 | Hierarchical Aggregations | 8 | CLNZ-15 (E07) |
| TBD | CLNZ-703 | Calculation Jobs | 8 | CLNZ-15 (E07) |
| TBD | CLNZ-704 | Result Caching | 5 | CLNZ-15 (E07) |
| TBD | CLNZ-801 | Dashboard API | 13 | CLNZ-16 (E08) |
| TBD | CLNZ-802 | Report Generation | 8 | CLNZ-16 (E08) |
| TBD | CLNZ-803 | Data Export | 5 | CLNZ-16 (E08) |

---

### Sprint 1.4 - Audit & Integration
- **Story Points**: 60 SP
- **Duration**: 2 weeks
- **Focus**: Audit Logging, Testing, Migration

| Jira Key | Doc ID | Title | SP | Epic |
|----------|--------|-------|-----|------|
| TBD | CLNZ-804 | Audit Logging | 13 | CLNZ-17 (Audit) |
| TBD | CLNZ-805 | Data Lineage | 8 | CLNZ-17 (Audit) |
| TBD | CLNZ-901 | End-to-End Integration Tests | 13 | CLNZ-19 (E09) |
| TBD | CLNZ-902 | Data Migration from OLD | 13 | CLNZ-19 (E09) |
| TBD | CLNZ-903 | Production Readiness | 8 | CLNZ-19 (E09) |

---

## Current Jira Issue Inventory

### Issues Ready for Sprint Assignment

Based on JQL search `project = CLNZ`, these issues exist and need sprint assignment:

**Sprint 0.1 Issues (Infrastructure)**:
- CLNZ-20: Docker Compose Development Environment (13 SP) - **IN PROGRESS**

**Sprint 0.2 Issues (Security)**:
- CLNZ-21: JWT/JWKS Authentication (13 SP)
- CLNZ-22: AWS Secrets Manager Integration (8 SP)
- CLNZ-23: Shared Library (@clenergize/shared) (13 SP)
- CLNZ-24: Correlation ID Middleware (8 SP)
- CLNZ-25: Input Validation Framework (8 SP)
- CLNZ-26: Audit Logging for Security Events (5 SP)
- CLNZ-27: Dependency Vulnerability Scanning (3 SP)
- CLNZ-28: Security Testing Suite (8 SP)
- CLNZ-29: Encryption Implementation (3 SP)

**Infrastructure/Integration Issues** (under CLNZ-19 Epic):
- CLNZ-30: AWS VPC and Networking (8 SP)
- CLNZ-31: ECS Fargate Cluster Setup (5 SP)
- CLNZ-32: MongoDB Atlas Configuration (5 SP)
- CLNZ-33: Redis Cache Cluster (3 SP)
- CLNZ-34: AWS EventBridge Setup (5 SP)
- CLNZ-35: API Gateway Configuration (5 SP)
- CLNZ-36: S3 Buckets for Storage (3 SP)
- CLNZ-37: Monitoring Stack Setup (6 SP)
- CLNZ-38: Event Bus Client Library (5 SP)
- CLNZ-39: Database Repository Pattern (5 SP)
- CLNZ-40: Error Handling Framework (5 SP)
- CLNZ-41: Authentication Guards (5 SP)
- CLNZ-42: Validation Utilities (3 SP)
- CLNZ-43: Logger Service (3 SP)
- CLNZ-44: Configuration Service (3 SP)
- CLNZ-45: Testing Utilities (3 SP)
- CLNZ-46: Health Check Module (3 SP)
- CLNZ-47: GitHub Actions Setup (8 SP)
- CLNZ-48: Docker Image Building (5 SP)
- CLNZ-49: Automated Testing Pipeline (8 SP)
- CLNZ-50: Code Quality Gates (5 SP)
- CLNZ-51: Deployment Automation (8 SP)

---

## Sprint Assignment Command

Once sprints are created in Jira, use this pattern to assign issues:

```bash
# Using Atlassian MCP tool
mcp__atlassian__editJiraIssue({
  cloudId: "321128eb-5b74-4a90-896a-2a44197f6673",
  issueIdOrKey: "CLNZ-XX",
  fields: {
    "customfield_10020": SPRINT_ID  # Integer Sprint ID
  }
})
```

---

## Notes

1. **Team-Managed Project**: CLNZ is a team-managed (next-gen) Jira project
2. **Sprint Field**: `customfield_10020` accepts integer Sprint IDs
3. **Board**: Issues appear on Board only when assigned to an active Sprint
4. **Workflow**: To Do → In Progress → Done

---

**Document Version**: 1.0.0
**Last Updated**: 2025-11-25
