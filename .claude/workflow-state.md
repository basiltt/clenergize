# Development Workflow State

> **Auto-Updated**: This file tracks the current state of development workflow
> **Last Sync**: [Auto-updated by dev-workflow-agent]
> **Jira Project**: CLNZ (Clenergize)
> **Cloud ID**: 321128eb-5b74-4a90-896a-2a44197f6673

---

## Issue ID Mapping (Doc → Jira)

Documentation uses CLNZ-XXX IDs. When Jira tickets are created, update this mapping with actual Jira issue numbers:

```yaml
# Sprint 0.1 - Infrastructure
CLNZ-101: CLNZ-TBD  # Docker Compose Development Environment
CLNZ-102: CLNZ-TBD  # Base NestJS Service Templates
CLNZ-103: CLNZ-TBD  # Environment Configuration
CLNZ-104: CLNZ-TBD  # Development Scripts & Makefile
CLNZ-105: CLNZ-TBD  # Database Initialization

# Sprint 0.2 - Security
CLNZ-201: CLNZ-TBD  # JWT/JWKS Authentication
CLNZ-202: CLNZ-TBD  # AWS Secrets Manager Integration
CLNZ-203: CLNZ-TBD  # Shared Library (@clenergize/shared)
CLNZ-204: CLNZ-TBD  # Correlation ID Middleware
CLNZ-205: CLNZ-TBD  # Input Validation Framework

# Sprint 1.1 - Identity & Organization
CLNZ-301: CLNZ-TBD  # User Authentication
CLNZ-302: CLNZ-TBD  # User Management
CLNZ-303: CLNZ-TBD  # Password Reset
CLNZ-304: CLNZ-TBD  # Role-Based Access Control
CLNZ-401: CLNZ-TBD  # Company Management
CLNZ-402: CLNZ-TBD  # Project Management
CLNZ-403: CLNZ-TBD  # Hierarchy Management

# Sprint 1.2 - Reference & Activity
CLNZ-501: CLNZ-TBD  # Emission Factor Management
CLNZ-502: CLNZ-TBD  # QC Workflow
CLNZ-503: CLNZ-TBD  # Unit Conversions
CLNZ-601: CLNZ-TBD  # Activity Data CRUD
CLNZ-602: CLNZ-TBD  # Bulk Import
CLNZ-603: CLNZ-TBD  # Data Validation

# Sprint 1.3 - Calculation & Reporting
CLNZ-701: CLNZ-TBD  # GHG Calculation Engine
CLNZ-702: CLNZ-TBD  # Hierarchical Aggregations
CLNZ-703: CLNZ-TBD  # Calculation Jobs
CLNZ-704: CLNZ-TBD  # Result Caching
CLNZ-801: CLNZ-TBD  # Dashboard API
CLNZ-802: CLNZ-TBD  # Report Generation
CLNZ-803: CLNZ-TBD  # Data Export

# Sprint 1.4 - Audit & Integration
CLNZ-804: CLNZ-TBD  # Audit Logging
CLNZ-805: CLNZ-TBD  # Data Lineage
CLNZ-901: CLNZ-TBD  # End-to-End Integration Tests
CLNZ-902: CLNZ-TBD  # Data Migration from OLD
CLNZ-903: CLNZ-TBD  # Production Readiness
```

**Note**: Before starting work, ensure the Jira ticket exists. If CLNZ-TBD, create the ticket first using the details from `Docs/CURRENT/04-JIRA/JIRA_COMPLETE_PLAN.md`.

---

## Sprint Configuration

> **How to find Sprint IDs**:
> 1. Go to your Jira Board → Backlog view
> 2. Create or select a Sprint
> 3. Open browser DevTools (F12) → Network tab
> 4. Drag an issue to the Sprint → Look for the API call
> 5. The Sprint ID will be in the request payload (e.g., `customfield_10020: [1]`)
>
> Alternatively, use Jira's REST API: `GET /rest/agile/1.0/board/{boardId}/sprint`

```yaml
# Sprint IDs for CLNZ Project (Created 2025-11-25)
sprints:
  sprint_0.1:
    name: "Sprint 0.1 - Infrastructure"
    jira_sprint_id: 35
    start_date: null
    end_date: null

  sprint_0.2:
    name: "Sprint 0.2 - Security"
    jira_sprint_id: 36
    start_date: null
    end_date: null

  sprint_1.1:
    name: "Sprint 1.1 - Identity & Org"
    jira_sprint_id: 37
    start_date: null
    end_date: null

  sprint_1.2:
    name: "Sprint 1.2 - Reference & Data"
    jira_sprint_id: 38
    start_date: null
    end_date: null

  sprint_1.3:
    name: "Sprint 1.3 - Calc & Reports"
    jira_sprint_id: 39
    start_date: null
    end_date: null

  sprint_1.4:
    name: "Sprint 1.4 - Audit & Integ"
    jira_sprint_id: 40
    start_date: null
    end_date: null

# Current active sprint for /pick-issue command
active_sprint_id: 35  # Sprint 0.1 - Infrastructure
```

---

## Current Sprint

| Field | Value |
|-------|-------|
| **Sprint** | 0.1 |
| **Sprint Name** | Infrastructure |
| **Epic** | CLNZ-E01 |
| **Sprint Start** | TBD |
| **Sprint End** | TBD |
| **Velocity Target** | 50 SP |
| **Jira Sprint ID** | 35 |

---

## Active Issue

```yaml
current_issue: CLNZ-20
branch: feature/CLNZ-101-docker-compose-dev-env
started_at: 2025-11-25T10:30:00Z
primary_agent: devops-agent
supporting_agents: []
```

---

## Sprint Progress

### Sprint 0.1 - Infrastructure Foundation (50 SP)

| Issue | Title | SP | Status | Agent | Completed |
|-------|-------|-----|--------|-------|-----------|
| CLNZ-101 | Docker Compose Development Environment | 13 | in_progress | devops-agent | |
| CLNZ-102 | Base NestJS Service Templates | 13 | pending | architecture-agent | |
| CLNZ-103 | Environment Configuration | 8 | pending | devops-agent | |
| CLNZ-104 | Development Scripts & Makefile | 8 | pending | devops-agent | |
| CLNZ-105 | Database Initialization | 8 | pending | devops-agent | |

**Sprint 0.1 Progress**: 0/50 SP (0%)

---

### Sprint 0.2 - Security & Shared Libraries (50 SP)

| Issue | Title | SP | Status | Agent | Completed |
|-------|-------|-----|--------|-------|-----------|
| CLNZ-201 | JWT/JWKS Authentication | 13 | pending | identity-agent | |
| CLNZ-202 | AWS Secrets Manager Integration | 8 | pending | security-agent | |
| CLNZ-203 | Shared Library (@clenergize/shared) | 13 | pending | architecture-agent | |
| CLNZ-204 | Correlation ID Middleware | 8 | pending | architecture-agent | |
| CLNZ-205 | Input Validation Framework | 8 | pending | architecture-agent | |

**Sprint 0.2 Progress**: 0/50 SP (0%)

---

### Sprint 1.1 - Identity & Organization (60 SP)

| Issue | Title | SP | Status | Agent | Completed |
|-------|-------|-----|--------|-------|-----------|
| CLNZ-301 | User Authentication | 13 | pending | identity-agent | |
| CLNZ-302 | User Management | 8 | pending | identity-agent | |
| CLNZ-303 | Password Reset | 5 | pending | identity-agent | |
| CLNZ-304 | Role-Based Access Control | 8 | pending | identity-agent | |
| CLNZ-401 | Company Management | 8 | pending | organization-agent | |
| CLNZ-402 | Project Management | 8 | pending | organization-agent | |
| CLNZ-403 | Hierarchy Management | 8 | pending | organization-agent | |

**Sprint 1.1 Progress**: 0/60 SP (0%)

---

### Sprint 1.2 - Reference & Activity (60 SP)

| Issue | Title | SP | Status | Agent | Completed |
|-------|-------|-----|--------|-------|-----------|
| CLNZ-501 | Emission Factor Management | 13 | pending | reference-agent | |
| CLNZ-502 | QC Workflow | 8 | pending | reference-agent | |
| CLNZ-503 | Unit Conversions | 8 | pending | reference-agent | |
| CLNZ-601 | Activity Data CRUD | 13 | pending | activity-agent | |
| CLNZ-602 | Bulk Import | 8 | pending | activity-agent | |
| CLNZ-603 | Data Validation | 8 | pending | activity-agent | |

**Sprint 1.2 Progress**: 0/60 SP (0%)

---

### Sprint 1.3 - Calculation & Reporting (60 SP)

| Issue | Title | SP | Status | Agent | Completed |
|-------|-------|-----|--------|-------|-----------|
| CLNZ-701 | GHG Calculation Engine | 13 | pending | calculation-agent | |
| CLNZ-702 | Hierarchical Aggregations | 8 | pending | calculation-agent | |
| CLNZ-703 | Calculation Jobs | 8 | pending | calculation-agent | |
| CLNZ-704 | Result Caching | 5 | pending | calculation-agent | |
| CLNZ-801 | Dashboard API | 13 | pending | reporting-agent | |
| CLNZ-802 | Report Generation | 8 | pending | reporting-agent | |
| CLNZ-803 | Data Export | 5 | pending | reporting-agent | |

**Sprint 1.3 Progress**: 0/60 SP (0%)

---

### Sprint 1.4 - Audit & Integration (60 SP)

| Issue | Title | SP | Status | Agent | Completed |
|-------|-------|-----|--------|-------|-----------|
| CLNZ-804 | Audit Logging | 13 | pending | audit-agent | |
| CLNZ-805 | Data Lineage | 8 | pending | audit-agent | |
| CLNZ-901 | End-to-End Integration Tests | 13 | pending | testing-agent | |
| CLNZ-902 | Data Migration from OLD | 13 | pending | migration-agent | |
| CLNZ-903 | Production Readiness | 8 | pending | devops-agent | |

**Sprint 1.4 Progress**: 0/60 SP (0%)

---

## Issue Queue (Priority Order)

The next issue to pick is always the first `pending` issue in order:

```yaml
queue:
  # Sprint 0.1
  - CLNZ-101  # Docker Compose - FIRST PRIORITY
  - CLNZ-102  # Service Templates
  - CLNZ-103  # Environment Config
  - CLNZ-104  # Dev Scripts
  - CLNZ-105  # Database Init

  # Sprint 0.2
  - CLNZ-201  # JWT/JWKS
  - CLNZ-202  # Secrets Manager
  - CLNZ-203  # Shared Library
  - CLNZ-204  # Correlation IDs
  - CLNZ-205  # Validation

  # Sprint 1.1
  - CLNZ-301  # User Auth
  - CLNZ-302  # User Management
  - CLNZ-303  # Password Reset
  - CLNZ-304  # RBAC
  - CLNZ-401  # Company
  - CLNZ-402  # Project
  - CLNZ-403  # Hierarchy

  # Sprint 1.2
  - CLNZ-501  # Emission Factors
  - CLNZ-502  # QC Workflow
  - CLNZ-503  # Unit Conversions
  - CLNZ-601  # Activity CRUD
  - CLNZ-602  # Bulk Import
  - CLNZ-603  # Data Validation

  # Sprint 1.3
  - CLNZ-701  # GHG Calculation
  - CLNZ-702  # Aggregations
  - CLNZ-703  # Calc Jobs
  - CLNZ-704  # Result Caching
  - CLNZ-801  # Dashboard
  - CLNZ-802  # Reports
  - CLNZ-803  # Export

  # Sprint 1.4
  - CLNZ-804  # Audit Logging
  - CLNZ-805  # Data Lineage
  - CLNZ-901  # E2E Tests
  - CLNZ-902  # Migration
  - CLNZ-903  # Production Ready
```

---

## Completed Issues Log

| Issue | Title | Agent | Completed Date | PR |
|-------|-------|-------|----------------|-----|
| | | | | |

---

## Dependencies

Some issues have dependencies on others:

```yaml
dependencies:
  CLNZ-102:  # Service Templates
    depends_on: [CLNZ-101]  # Needs Docker first

  CLNZ-201:  # JWT/JWKS
    depends_on: [CLNZ-102, CLNZ-103]  # Needs templates and config

  CLNZ-203:  # Shared Library
    depends_on: [CLNZ-102]  # Needs service structure

  CLNZ-301:  # User Auth
    depends_on: [CLNZ-201, CLNZ-203]  # Needs JWT and shared lib

  CLNZ-501:  # Emission Factors
    depends_on: [CLNZ-203, CLNZ-105]  # Needs shared lib and DB

  CLNZ-601:  # Activity CRUD
    depends_on: [CLNZ-501]  # Needs reference data

  CLNZ-701:  # GHG Calculation
    depends_on: [CLNZ-601, CLNZ-501]  # Needs activity and reference

  CLNZ-801:  # Dashboard
    depends_on: [CLNZ-701]  # Needs calculation results

  CLNZ-804:  # Audit Logging
    depends_on: [CLNZ-203, CLNZ-204]  # Needs shared lib and correlation

  CLNZ-901:  # E2E Tests
    depends_on: [CLNZ-701, CLNZ-801]  # Needs full flow

  CLNZ-902:  # Migration
    depends_on: [CLNZ-901]  # Needs tests passing first
```

---

## Overall Progress

| Metric | Value |
|--------|-------|
| **Total Story Points** | 340 SP |
| **Completed Points** | 0 SP |
| **Remaining Points** | 340 SP |
| **Overall Progress** | 0% |
| **Issues Completed** | 0/33 |

---

## State Transitions

When `/pick-issue` is called:
1. Read this file to get current state
2. If `current_issue` is not null, warn user
3. Get next issue from queue (first `pending`)
4. Update `current_issue` in Active Issue section
5. Update issue status to `in_progress`
6. Create branch and start development

When `/complete-issue` or PR merged:
1. Update issue status to `completed`
2. Add to Completed Issues Log
3. Clear `current_issue`
4. Calculate sprint progress
5. Auto-suggest next issue

---

**Document**: Workflow State Tracker
**Version**: 1.0.0
**Auto-Managed**: Yes (by dev-workflow-agent)
