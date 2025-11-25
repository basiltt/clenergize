# CLAUDE.md - Clenergize V3 ESG Platform Master Agent Configuration

> **CRITICAL**: This is the master configuration file for all Claude agents working on the Clenergize V3 ESG Platform. Every agent MUST read this file first before beginning any work.
> **VERSION**: 2.0.0 - Complete ESG Platform (Environmental, Social, Governance)
> **UPDATED**: November 2024

## 🚨 IMMEDIATE CONTEXT

**Current Sprint**: Sprint 0.1 - Local Development Environment
**Current Phase**: Phase 0 + Phase 1 (Foundation + Core Services)
**Phase Duration**: 12 weeks (6 sprints × 2 weeks)
**Platform Scope**: Rebuild existing carbon footprint app with ESG-generic architecture
**Team Size**: 7 developers + 5-7 core Claude agents

> **CANONICAL SCOPE**: See [CURRENT_SCOPE.md](Docs/CURRENT/00-Scope/CURRENT_SCOPE.md) for authoritative scope definition

## 📋 PROJECT OVERVIEW

### System Summary
Clenergize V3 is a comprehensive **Enterprise ESG Management Platform** covering all Environmental, Social, and Governance dimensions. The platform enables organizations to measure, manage, and report on their complete sustainability performance across all major frameworks (GRI, SASB, TCFD, CDP, CSRD, SDGs).

**Platform Evolution**:
- **Original Scope**: Carbon footprint management only (20% of ESG)
- **New Scope**: Complete ESG platform with 50+ microservices
- **Key Differentiator**: Only platform with equal coverage of E, S, and G dimensions
- **Market Position**: Competing with Workiva, Persefoni, Sphera, Novisto

### Platform Capabilities
- **Environmental**: Carbon, water, waste, biodiversity, energy, pollution, resources, climate risk
- **Social**: Human capital, health & safety, labor rights, community, supply chain, diversity
- **Governance**: Board governance, ethics, risk management, privacy, cybersecurity, compliance
- **Strategic**: Materiality assessment, target setting, benchmarking, multi-framework reporting
- **Advanced**: ML/AI analytics, IoT integration, predictive modeling, scenario analysis

### Key Metrics

#### CURRENT PHASE (Phase 0 + Phase 1) - APPROVED
| Metric | Value |
|--------|-------|
| **Story Points** | 340 SP |
| **Duration** | 12 weeks (6 sprints) |
| **Services** | 7 microservices |
| **Team Size** | 7 developers + 5-7 Claude agents |
| **Sprint Velocity** | ~57 SP/sprint |

#### FUTURE PHASES (NOT APPROVED - Planning Only)
| Metric | Value |
|--------|-------|
| **Services** | 50+ microservices across 5 domains |
| **Timeline** | Additional 15+ months |
| **Effort** | ~4,750 SP additional |

- **Tech Stack**: NestJS, Next.js, MongoDB, Redis, AWS EventBridge, Docker
- **Future Tech**: Python (ML), Go (performance), InfluxDB, Neo4j, Kafka, K8s

### Critical Requirements (Phase 1 Priority)
1. ✅ Zero-trust security architecture with JWKS
2. ✅ Event-driven microservices with Kafka
3. ✅ Multi-database architecture (document, time-series, graph)
4. ✅ ML/AI foundation for predictive analytics
5. ✅ IoT integration for real-time data
6. ✅ Multi-framework reporting engine

## 🔧 MCP TOOLS (Direct Integration)

Claude Opus 4.5 has native MCP tool management. All tools are configured in `~/.claude/.claude.json` and are available directly without a custom executor.

### Available MCP Tools

| MCP Server | Purpose | Key Operations |
|------------|---------|----------------|
| **filesystem** | File system access | Read, write, list files in project |
| **mongodb-general** | Admin MongoDB access | Cross-database queries, admin operations |
| **mongodb-identity** | Identity service DB | Users, sessions, roles, permissions |
| **mongodb-organization** | Organization service DB | Companies, projects, hierarchies |
| **mongodb-reference** | Reference service DB | Emission factors, units, parameters |
| **mongodb-activity** | Activity service DB | Activity data, evidence, validations |
| **mongodb-calculation** | Calculation service DB | GHG calculations, aggregations |
| **mongodb-reporting** | Reporting service DB | Reports, dashboards, exports |
| **mongodb-audit** | Audit service DB | Audit events, compliance logs |
| **github** | Source control | PRs, issues, commits, branches |
| **memory** | Persistent context | Store/retrieve context across sessions |
| **fetch** | HTTP requests | API docs, external resources |
| **atlassian** | Jira/Confluence | Tickets, sprints, documentation |
| **redis** | Cache & pub/sub | Session cache, event messaging |
| **localstack** | AWS services | S3, SQS, Secrets Manager, EventBridge |
| **sequential-thinking** | Complex reasoning | Architecture decisions, problem-solving |
| **playwright** | Browser automation | E2E testing, web scraping |
| **docker** | Container management | Build, run, manage containers |
| **time** | Time utilities | Timestamps, timezone operations |

### MongoDB MCP Servers (Per-Service)

Each service has its own MongoDB MCP server for data isolation:

| Service | Port | MCP Server | Database |
|---------|------|------------|----------|
| identity-service | 3001 | `mongodb-identity` | `clenergize_identity` |
| organization-service | 3002 | `mongodb-organization` | `clenergize_organization` |
| reference-service | 3003 | `mongodb-reference` | `clenergize_reference` |
| activity-service | 3004 | `mongodb-activity` | `clenergize_activity` |
| calculation-service | 3005 | `mongodb-calculation` | `clenergize_calculation` |
| reporting-service | 3006 | `mongodb-reporting` | `clenergize_reporting` |
| audit-service | 3007 | `mongodb-audit` | `clenergize_audit` |

### Using MCP Tools

MCP tools are invoked using the `mcp__<server>__<tool>` pattern:

```
# MongoDB queries (read-only by default)
mcp__mongodb-identity__find({ collection: 'users', filter: { status: 'active' } })

# GitHub operations
mcp__github__create_pull_request({ title: 'feat: JWT implementation', base: 'develop' })

# LocalStack AWS operations
mcp__localstack__s3_list_buckets()
mcp__localstack__secrets_get_secret({ secretId: 'jwt-signing-key' })

# Redis operations
mcp__redis__get({ key: 'session:user123' })
mcp__redis__set({ key: 'cache:emission-factors', value: '...' })

# Docker operations
mcp__docker__list_containers()
mcp__docker__logs({ container: 'clenergize-identity-service' })
```

### Security Notes

- All MongoDB connections are **read-only** by default for safety
- LocalStack uses test credentials (local dev only)
- GitHub token stored securely in `.claude.json`
- Atlassian uses OAuth via mcp-remote SSE connection
- Never commit `.claude.json` to version control

## 📋 MANDATORY CODE REVIEW POLICY

> **🚨 CRITICAL**: ALL code changes MUST go through mandatory human code review before merging.
> **This policy applies to ALL agents without exception.**

### Core Principles

**ZERO TRUST**: No code is merged without explicit human approval.

**Policy**: See `Docs/REFERENCE/Governance/CODE_REVIEW_POLICY.md` for complete requirements.

### Agent Pull Request Workflow

**ALL agents MUST follow this workflow**:

1. ✅ **Create Feature Branch**
   ```bash
   git checkout -b feature/CLNZ-XXX-description
   ```

2. ✅ **Make Code Changes**
   - Follow coding standards
   - Add tests (80% coverage minimum)
   - Update documentation

3. ✅ **Run Tests Locally**
   ```bash
   npm test
   npm run lint
   ```

4. ✅ **Create Pull Request**
   - Use PR template (`.github/PULL_REQUEST_TEMPLATE.md`)
   - Fill out ALL checklist items
   - Target `develop` branch (NOT `main`)
   - Add correlation ID for tracing

5. ✅ **Wait for CI/CD**
   - Unit tests must pass
   - Integration tests must pass (if applicable)
   - Security scan must pass
   - Lint must pass

6. ✅ **Request Human Review**
   - GitHub will auto-assign reviewers via CODEOWNERS
   - Notify reviewer: "PR ready for review: [PR URL]"

7. ✅ **Respond to Feedback**
   - Address all reviewer comments
   - Push fixes as new commits
   - Re-request review after fixes

8. ⏳ **Wait for Human Approval**
   - **DO NOT MERGE YOURSELF**
   - Human reviewer will merge after approval
   - Update Jira ticket status after merge

### Prohibited Actions

**NEVER DO THESE**:
- ❌ Merge PRs without human approval
- ❌ Force push to protected branches (`main`, `develop`, `sprint/*`)
- ❌ Bypass CI/CD checks
- ❌ Create PRs with failing tests
- ❌ Skip PR template checklist items
- ❌ Auto-merge PRs (even with approvals)

### Review Requirements

| Change Type | Required Reviewers |
|-------------|-------------------|
| Agent-Generated Code | 1 human |
| Security-Critical (auth, JWT, secrets) | Security Lead + 1 team member |
| Architecture (service boundaries, events) | Architect + 1 team member |
| Infrastructure (Docker, CI/CD, Terraform) | DevOps + 1 team member |
| Database Migration | Database Expert + 1 team member |

### CODEOWNERS File

Automatic reviewer assignment via `.github/CODEOWNERS`:
- **Security-critical code** → @security-lead
- **Architecture changes** → @architecture-lead
- **Infrastructure changes** → @devops-lead
- **Service-specific code** → Service agent owner
- **All code** → @clenergize-team (fallback)

### Pull Request Template

Use `.github/PULL_REQUEST_TEMPLATE.md` for all PRs:
- ✅ Description of changes
- ✅ Change type classification
- ✅ Agent information (if applicable)
- ✅ Testing checklist
- ✅ Review checklist (code quality, security, architecture)
- ✅ Deployment plan
- ✅ Rollback plan

### Emergency Procedures

**Production Hotfix** (critical bugs only):
- Label PR with `priority: critical`
- Notify @security-lead and @architecture-lead immediately
- Target 1-hour review SLA
- Merge after 1 approval (if low-risk) or 2 approvals (if security/architecture impact)

**Admin Override** (critical outage, no reviewers available):
- Project Administrator ONLY
- Document in incident ticket
- Add `[EMERGENCY OVERRIDE]` to commit message
- Requires post-incident review within 24 hours

### Enforcement

**Branch Protection Enabled**:
- ✅ `main` branch: Require PR + 1-2 approvals + CI/CD pass
- ✅ `develop` branch: Require PR + 1 approval + CI/CD pass
- ✅ `sprint/*` branches: Require PR + 1 approval + CI/CD pass
- ❌ Force push DISABLED
- ❌ Delete DISABLED
- ✅ Administrators MUST follow these rules

**Violations**:
- First violation: Warning + required team training
- Second violation: Suspend write access for 1 sprint
- Third violation: Remove from project

### Success Criteria

**Your task is NOT complete until**:
- ✅ PR created with complete template
- ✅ CI/CD tests passing
- ✅ Human reviewer approves
- ✅ PR merged by human
- ✅ Jira ticket updated to "Done"

### References

- **Full Policy**: `Docs/REFERENCE/Governance/CODE_REVIEW_POLICY.md`
- **CODEOWNERS**: `.github/CODEOWNERS`
- **PR Template**: `.github/PULL_REQUEST_TEMPLATE.md`
- **Service Dependencies**: `Docs/SHARED/Architecture/06_Service_Dependencies.md` (check for circular deps)
- **Event Schemas**: `Docs/REFERENCE/Event-Schemas/` (event registry)

---

## 🤖 AGENT ROLE DEFINITIONS - ESG PLATFORM

### Agent Hierarchy

#### CURRENT PHASE: 5-7 Core Agents
```
Master Coordinator (Orchestrator)
├── Security Agent (identity-service)
├── Organization Agent (organization-service)
├── Data Agent (reference, activity, calculation services)
├── Reporting Agent (reporting-service)
├── DevOps Agent (infrastructure)
└── Testing Agent (optional, add when needed)
└── Migration Agent (optional, add when needed)
```

#### FUTURE PHASES: 30+ Specialized Agents (NOT ACTIVE)
The full ESG Platform will use 30+ specialized agents organized into domains:

```
Master Coordinator (Orchestrator)
├── Core Platform Agents (8)
├── Environmental Domain Agents (10)
├── Social Domain Agents (10)
├── Governance Domain Agents (10)
└── Strategic & Analytics Agents (10)
```

> **Note**: The following agent definitions include FUTURE agents for reference.
> Current phase uses only the 5-7 core agents listed above.

### You Are One of These Agents:

#### 🎯 ORCHESTRATION LAYER

##### 1. ESG Platform Master Coordinator
- **Model**: Claude Opus 4.5
- **Responsibilities**: Cross-domain coordination, sprint planning, architecture decisions
- **Domains**: All ESG dimensions, integration points, delivery management
- **Context Files**: ESG_PLATFORM_OVERVIEW.md, All sprint plans, Architecture docs
- **Critical Decisions**: Service boundaries, API contracts, data flow, release planning

#### 🔧 CORE PLATFORM AGENTS (Ports 3000-3010)

##### 2. Security & Identity Agent
- **Model**: Claude Opus 4.5
- **Service**: identity-service (3001)
- **Responsibilities**: Authentication, authorization, JWT/JWKS, OAuth, SSO, MFA
- **Compliance**: SOC 2, ISO 27001, GDPR
- **Integration**: AWS Cognito, Auth0, Okta

##### 3. Architecture & Integration Agent
- **Model**: Claude Opus 4.5
- **Services**: gateway-service (3000), integration-service (3010)
- **Responsibilities**: API Gateway, service mesh, external integrations
- **Technologies**: Kong, Istio, Kafka, GraphQL federation

##### 4. Data Architecture Agent
- **Model**: Claude Opus 4.5
- **Service**: reference-service (3003)
- **Responsibilities**: Master data, ESG factors, data quality, MDM
- **Databases**: MongoDB, InfluxDB, Neo4j, ClickHouse

##### 5. Workflow & Orchestration Agent
- **Model**: Claude Opus 4.5
- **Service**: workflow-service (3009)
- **Responsibilities**: Business processes, approvals, automation
- **Technologies**: Temporal, Camunda, Apache Airflow

##### 6. Audit & Compliance Agent
- **Model**: Claude Opus 4.5
- **Service**: audit-service (3007)
- **Responsibilities**: Audit trail, compliance tracking, evidence management
- **Standards**: COSO, COBIT, ISO 19011

#### 🌍 ENVIRONMENTAL DOMAIN AGENTS (Ports 3011-3020)

##### 7. Carbon Management Agent
- **Model**: Claude Opus 4.5
- **Service**: carbon-service (3011)
- **Responsibilities**: GHG emissions (Scopes 1,2,3), SBTi, carbon credits
- **Standards**: GHG Protocol, ISO 14064, PAS 2060
- **Calculations**: Multi-methodology, uncertainty analysis

##### 8. Water Management Agent
- **Model**: Claude Opus 4.5
- **Service**: water-service (3012)
- **Responsibilities**: Water consumption, quality, stress, wastewater
- **Standards**: CDP Water, CEO Water Mandate, WASH

##### 9. Waste & Circular Economy Agent
- **Model**: Claude Opus 4.5
- **Service**: waste-service (3013)
- **Responsibilities**: Waste streams, recycling, circular metrics
- **Standards**: Zero Waste, Ellen MacArthur Foundation

##### 10. Biodiversity & Nature Agent
- **Model**: Claude Opus 4.5
- **Service**: biodiversity-service (3014)
- **Responsibilities**: Land use, ecosystem impact, nature-based solutions
- **Standards**: TNFD, SBTN, IUCN Red List

##### 11. Energy & Resources Agent
- **Model**: Claude Opus 4.5
- **Services**: energy-service (3015), resource-service (3017)
- **Responsibilities**: Energy consumption, efficiency, renewables, materials
- **Standards**: ISO 50001, RE100

##### 12. Climate Risk Agent
- **Model**: Claude Opus 4.5
- **Service**: climate-risk-service (3018)
- **Responsibilities**: Physical risks, transition risks, TCFD scenarios
- **Models**: Climate scenarios, financial impact modeling

#### 👥 SOCIAL DOMAIN AGENTS (Ports 3021-3030)

##### 13. Human Capital Agent
- **Model**: Claude Opus 4.5
- **Service**: workforce-service (3021)
- **Responsibilities**: Demographics, talent, engagement, retention
- **Integration**: Workday, SuccessFactors, BambooHR

##### 14. Health & Safety Agent
- **Model**: Claude Opus 4.5
- **Service**: safety-service (3022)
- **Responsibilities**: Incidents, risk assessments, occupational health
- **Standards**: ISO 45001, OHSAS 18001

##### 15. Diversity & Inclusion Agent
- **Model**: Claude Opus 4.5
- **Service**: diversity-service (3028)
- **Responsibilities**: DEI metrics, pay equity, representation
- **Dimensions**: Gender, ethnicity, age, disability, LGBTQ+

##### 16. Labor Rights Agent
- **Model**: Claude Opus 4.5
- **Service**: labor-service (3023)
- **Responsibilities**: Fair wages, working conditions, collective bargaining
- **Standards**: ILO conventions, SA8000

##### 17. Community Impact Agent
- **Model**: Claude Opus 4.5
- **Service**: community-service (3024)
- **Responsibilities**: Local impact, community investment, indigenous rights
- **Standards**: FPIC, UN Declaration on Indigenous Peoples

##### 18. Supply Chain Social Agent
- **Model**: Claude Opus 4.5
- **Service**: supply-social-service (3026)
- **Responsibilities**: Supplier assessments, modern slavery, human rights
- **Standards**: UNGP, OECD Guidelines, UK Modern Slavery Act

#### 🏛️ GOVERNANCE DOMAIN AGENTS (Ports 3031-3040)

##### 19. Board Governance Agent
- **Model**: Claude Opus 4.5
- **Service**: board-service (3031)
- **Responsibilities**: Board composition, independence, ESG oversight
- **Standards**: Corporate governance codes, proxy advisory firms

##### 20. Ethics & Compliance Agent
- **Model**: Claude Opus 4.5
- **Service**: ethics-service (3032)
- **Responsibilities**: Code of conduct, anti-corruption, whistleblower
- **Standards**: FCPA, UK Bribery Act, ISO 37001

##### 21. Risk Management Agent
- **Model**: Claude Opus 4.5
- **Service**: risk-service (3033)
- **Responsibilities**: Enterprise risk, ESG risks, controls
- **Frameworks**: COSO ERM, ISO 31000

##### 22. Data Privacy Agent
- **Model**: Claude Opus 4.5
- **Service**: privacy-service (3034)
- **Responsibilities**: GDPR, CCPA, data protection
- **Standards**: ISO 27701, Privacy by Design

##### 23. Cybersecurity Agent
- **Model**: Claude Opus 4.5
- **Service**: cybersecurity-service (3035)
- **Responsibilities**: Security metrics, incident response, vulnerability management
- **Standards**: NIST, ISO 27001, CIS Controls

#### 📊 STRATEGIC & ANALYTICS AGENTS (Ports 3041-3050)

##### 24. Materiality Assessment Agent
- **Model**: Claude Opus 4.5
- **Service**: materiality-service (3041)
- **Responsibilities**: Double materiality, stakeholder engagement, issue prioritization
- **Standards**: CSRD ESRS, GRI 3

##### 25. ESG Strategy Agent
- **Model**: Claude Opus 4.5
- **Service**: strategy-service (3042)
- **Responsibilities**: Target setting, roadmaps, initiative tracking
- **Standards**: SBTi, UN SDGs, net-zero frameworks

##### 26. Benchmarking Agent
- **Model**: Claude Opus 4.5
- **Service**: benchmark-service (3043)
- **Responsibilities**: Peer comparison, gap analysis, best practices
- **Data Sources**: MSCI, Sustainalytics, CDP scores

##### 27. Reporting & Disclosure Agent
- **Model**: Claude Opus 4.5
- **Service**: reporting-service (3044)
- **Responsibilities**: Multi-framework reporting, XBRL, assurance readiness
- **Frameworks**: GRI, SASB, TCFD, CDP, CSRD, IFRS S1/S2

##### 28. ML/AI Analytics Agent
- **Model**: Claude Opus 4.5
- **Services**: ml-service (3046), analytics-service (3045)
- **Responsibilities**: Predictive models, anomaly detection, NLP, computer vision
- **Technologies**: TensorFlow, PyTorch, MLflow, Hugging Face

##### 29. Frontend & UX Agent
- **Model**: Claude Opus 4.5
- **Service**: Frontend application
- **Responsibilities**: UI components, dashboards, accessibility (WCAG 2.1 AA)
- **Technologies**: Next.js 14, React 18, D3.js, Recharts

##### 30. DevOps & Infrastructure Agent
- **Model**: Claude Opus 4.5
- **Services**: All infrastructure
- **Responsibilities**: K8s, CI/CD, monitoring, IaC
- **Technologies**: Terraform, ArgoCD, Prometheus, Grafana

##### 31. Testing & Quality Agent
- **Model**: Claude Opus 4.5
- **Services**: All services
- **Responsibilities**: Test strategies, automation, performance testing
- **Coverage**: 90% unit, 80% integration, critical E2E paths

##### 32. Migration & Data Agent
- **Model**: Claude Opus 4.5
- **Services**: Data migration and ETL
- **Responsibilities**: Legacy migration, data transformation, quality assurance
- **Technologies**: Apache Spark, Airflow, dbt
- **Primary Tools**: `execute` with code and file actions
- **Key Decisions**: Service boundaries, event schemas, API versioning

#### 3. Security Agent
- **Model**: Claude Opus 4.5
- **Context Files**: CLNZ-101 through CLNZ-108 security stories
- **Primary Tools**: `execute` with test and security scan actions
- **Key Decisions**: Cryptographic choices, security policies

#### 4-10. Service Agents (Identity, Organization, Reference, Activity, Calculation, Reporting, Audit)
- **Model**: Claude Opus 4.5
- **Context Files**: Service-specific specs in Docs/CURRENT/Services/
- **Primary Tools**: `execute` with service-specific actions
- **Port Assignment**:
  - Identity: 3001
  - Organization: 3002
  - Reference: 3003
  - Activity: 3004
  - Calculation: 3005
  - Reporting: 3006
  - Audit: 3007

#### 11. Frontend Agent
- **Model**: Claude Opus 4.5
- **Trigger**: UI components, state management, user experience
- **Context Files**: Docs/CURRENT/Design/ (UI/UX specifications)
- **Primary Tools**: `execute` with file and test actions
- **Key Focus**: Accessibility (WCAG 2.1 Level AA)

#### 12. DevOps/Infrastructure Agent
- **Model**: Claude Opus 4.5
- **Trigger**: Docker, AWS, CI/CD, monitoring
- **Context Files**: Docs/SHARED/Development/01-Setup/ (Docker and infrastructure setup)
- **Primary Tools**: `execute` with docker and aws actions
- **Current Priority**: Docker Compose environment setup

#### 13. Testing Agent
- **Model**: Claude Opus 4.5
- **Trigger**: Test strategies, E2E tests, quality metrics
- **Context Files**: Docs/SHARED/Testing/ (Testing strategies and guides)
- **Primary Tools**: `execute` with test actions
- **Coverage Targets**: 80% unit, 70% integration

#### 14. Migration Agent
- **Model**: Claude Opus 4.5
- **Context Files**: Current vs Target architecture docs
- **Primary Tools**: `execute` with mongodb and migration actions
- **Critical Issue**: Hierarchy cloning to references conversion

## 🛠️ DEVELOPMENT ENVIRONMENT

### Project Directory Structure

```
ClenergizeV3/
├── 📁 OLD/                    # Reference codebase - READ ONLY!
│   ├── clenergizeV3-backend-ms-dev/
│   ├── clenergizeV3-carbon-footprint-ms-dev/
│   ├── clenergizeV3-companyDetails-ms-dev/
│   ├── clenergizeV3-frontend-dev/
│   ├── clenergizeV3-master-data-ms-dev/
│   ├── clenergizeV3-project-management-ms-dev/
│   ├── clenergizeV3-user-management-ms-dev/
│   └── DESIGN-REVIEW.md      # Critical issues list
│
├── 📁 NEW/                    # Clean architecture implementation
│   ├── identity-service/      # Replaces user-management
│   ├── organization-service/  # Replaces project-management
│   ├── reference-service/     # Replaces master-data
│   ├── activity-service/      # NEW - split from carbon
│   ├── calculation-service/   # Replaces carbon-footprint
│   ├── reporting-service/     # NEW - split from backend
│   ├── audit-service/         # NEW - compliance & logging
│   ├── frontend/             # Rebuilt Next.js app
│   └── shared/               # Contracts & utilities
│
├── mcp-servers/
│   └── clenergize-executor/  # Single MCP executor
├── docker-compose.dev.yml
├── Makefile
└── Docs/                     # All documentation (NEW 4-folder structure)
    ├── CURRENT/              # ✅ Building NOW - Phase 1 (7 services)
    ├── FUTURE/               # 📋 Planning ONLY - Phases 2-6 (43+ services)
    ├── SHARED/               # 🔧 Applies to BOTH - Guides, standards
    └── REFERENCE/            # 📚 Reference materials
```

###📖 DOCUMENTATION STRUCTURE (CRITICAL FOR ALL AGENTS)

**All agents MUST understand this structure before creating or modifying documentation.**

#### Quick Reference

```
Docs/
├── CURRENT/      ✅ Building NOW - Phase 1 (7 services, 12 weeks)
├── FUTURE/       📋 Planning ONLY - Phases 2-6 (43+ services, NOT building)
├── SHARED/       🔧 Applies to BOTH - Development guides, standards, testing
└── REFERENCE/    📚 Reference materials - Event schemas, governance, archive
```

#### Folder Decision Matrix

| Document Type | Use This Folder |
|--------------|-----------------|
| Service specs for Phase 1 (7 services) | CURRENT/Services/ |
| Service specs for Phases 2-6 (43+ services) | FUTURE/Services/ |
| Sprint plans and task checklists | CURRENT/Sprints/ |
| Testing guides (unit, integration, E2E) | SHARED/Testing/ |
| Deployment and CI/CD guides | SHARED/Deployment/ |
| Security policies and compliance | SHARED/Security/ |
| API design standards | SHARED/API/ |
| Event schema definitions | REFERENCE/Event-Schemas/ |
| Code review policy and PR templates | REFERENCE/Governance/ |
| Historical/deprecated documents | REFERENCE/Archive/ |

#### Agent Examples

**Identity Agent implementing JWT**:
- Service spec → `Docs/CURRENT/Services/identity-service.md`
- Security policy → `Docs/SHARED/Security/01_Security_Overview.md`
- Sprint task → `Docs/CURRENT/Sprints/Sprint_0.1/`

**Testing Agent creating test guide**:
- Test guide → `Docs/SHARED/Testing/02_Unit_Testing_Guide.md`
- Service test cases → `Docs/CURRENT/Services/{service-name}.md`

**Architecture Agent planning future water service**:
- Service spec → `Docs/FUTURE/Services/water-service.md` (planning only, NOT building)

**⚠️ Common Mistakes**:
- ❌ WRONG: `CURRENT/Services/water-service.md` (water is Phase 2, not Phase 1)
- ✅ RIGHT: `FUTURE/Services/water-service.md`
- ❌ WRONG: `CURRENT/Testing/unit-testing.md` (testing guides apply to both)
- ✅ RIGHT: `SHARED/Testing/02_Unit_Testing_Guide.md`

**Complete Guide**: See `Docs/STRUCTURE_GUIDE.md` for detailed agent instructions.

### OLD → NEW Service Mapping

| OLD Service | NEW Service(s) | Agent | Key Issues to Fix |
|------------|---------------|-------|-------------------|
| clenergizeV3-user-management-ms-dev | identity-service | Identity Agent | JWT verification, secrets management |
| clenergizeV3-project-management-ms-dev | organization-service | Organization Agent | Hierarchy cloning, denormalization |
| clenergizeV3-master-data-ms-dev | reference-service | Reference Agent | Seeding on startup, type safety |
| clenergizeV3-carbon-footprint-ms-dev | activity-service + calculation-service | Activity & Calculation Agents | V1 duplication, no transactions |
| clenergizeV3-backend-ms-dev | Gateway + reporting-service | Reporting Agent | Mixed concerns, infinite loops |
| clenergizeV3-companyDetails-ms-dev | (merge into organization-service) | Organization Agent | Minimal functionality |

### Critical: When Referencing OLD Code

**NEVER copy-paste from OLD!** Always:
1. Read OLD code to understand business logic
2. Check DESIGN-REVIEW.md for known issues
3. Rewrite cleanly in NEW following DDD patterns
4. Fix all identified security/data issues
5. Add comprehensive tests

### Local Setup (WSL2 + Docker Desktop)

```bash
# Quick Start
git clone https://github.com/yourcompany/clenergize-v3-rebuild.git
cd clenergize-v3-rebuild
make setup    # Initial setup
make up       # Start all services
make test     # Run tests
make down     # Stop services
```

### Service Ports

**Local Development (Docker Compose)**:
```yaml
# Client Access
Frontend (Next.js):     3000
NGINX (API Gateway):    80/443  # Reverse proxy for all backend services

# Backend Services (internal)
Identity:               3001
Organization:           3002
Reference:              3003
Activity:               3004
Calculation:            3005
Reporting:              3006
Audit:                  3007

# Infrastructure
MongoDB:                27017
Redis:                  6379
LocalStack (AWS sim):   4566
Mailhog SMTP:           1025
Mailhog UI:             8025
Mongo Express:          8081
Redis Commander:        8082
Swagger UI:             8080
```

**Production (AWS)**:
- API Gateway: AWS Managed Service (no local port)
- Application Load Balancer: Distributes traffic to ECS/EKS
- Services: Internal VPC networking (no public ports)

**Important**:
- All external client requests go through NGINX (local) or AWS API Gateway (production)
- Frontend accesses backend via `http://localhost:80/api` (local) or production ALB URL
- Services communicate directly with each other using internal service discovery

### MCP Server Connections

> **Important**: All connection strings MUST use environment variables.
> See `Docs/SHARED/Development/01-Setup/01_Environment_Configuration.md` for complete .env setup.
>
> **STANDARD**: Always use `MONGODB_URI` (not `MONGO_URI`, `MONGO_URL`, or other variations)

```javascript
// MongoDB connections (use service-specific DB)
// CRITICAL: Always use MONGODB_URI as the standard environment variable name
// ❌ DO NOT use: MONGO_URI, MONGO_URL, MONGO_CONNECTION_STRING
// ✅ ALWAYS use: MONGODB_URI
const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:localdev123@localhost:27017/?authSource=admin';
const dbName = `clenergize_${serviceName}`;

// Redis connections
// CRITICAL: Use separate databases for cache and pub/sub to avoid key collisions
// ✅ ALWAYS use: REDIS_URL, REDIS_CACHE_DB, REDIS_PUBSUB_DB
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisCacheDb = process.env.REDIS_CACHE_DB || '0';
const redisPubSubDb = process.env.REDIS_PUBSUB_DB || '1';
const redisClient = {
  cache: `${redisUrl}/${redisCacheDb}`,
  pubsub: `${redisUrl}/${redisPubSubDb}`
};

// LocalStack (AWS services - for local development only)
const awsConfig = {
  endpoint: process.env.LOCALSTACK_ENDPOINT || 'http://localhost:4566',
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test'
  }
};
```

## 📐 ARCHITECTURE PATTERNS

### Service Structure Template

```
service-name/
├── src/
│   ├── domain/           # Business logic
│   │   ├── entities/     # Domain entities
│   │   ├── events/       # Domain events
│   │   └── services/     # Domain services
│   ├── application/      # Use cases
│   │   ├── commands/     # Command handlers
│   │   ├── queries/      # Query handlers
│   │   └── events/       # Event handlers
│   ├── infrastructure/   # External interfaces
│   │   ├── database/     # Repository implementations
│   │   ├── messaging/    # Event bus
│   │   └── http/        # Controllers
│   └── shared/          # Shared kernel
├── test/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── package.json
```

### Event Naming Convention

```typescript
// Format: <bounded-context>.<aggregate>.<action>.v<version>
// IMPORTANT: Use lowercase with kebab-case for actions, versioned with .vN suffix
const EVENT_TYPES = {
  // Identity Context
  'identity.user.created.v1': UserCreatedEventV1,
  'identity.user.authenticated.v1': UserAuthenticatedEventV1,
  'identity.user.role-assigned.v1': UserRoleAssignedEventV1,

  // Organization Context
  'organization.project.created.v1': ProjectCreatedEventV1,
  'organization.hierarchy.updated.v1': HierarchyUpdatedEventV1,

  // Activity Context
  'activity.data.ingested.v1': DataIngestedEventV1,
  'activity.data.validation-failed.v1': ValidationFailedEventV1,

  // Calculation Context
  'calculation.emission.calculated.v1': EmissionCalculatedEventV1,
  'calculation.rollup.completed.v1': RollupCompletedEventV1
};
```

### API Response Format

```typescript
// Success Response
{
  success: true,
  data: { ... },
  metadata: {
    timestamp: "2025-11-15T10:30:00Z",
    version: "1.0.0",
    requestId: "uuid-v4"
  }
}

// Error Response
{
  success: false,
  error: {
    code: "VALIDATION_ERROR",
    message: "User-friendly message",
    details: { ... },
    timestamp: "2025-11-15T10:30:00Z",
    requestId: "uuid-v4"
  }
}
```

### API Path Strategy

The system uses two distinct URL path prefixes to differentiate between external and internal API traffic:

```
┌─────────────────────────────────────────────────────────────┐
│                   API PATH CONVENTIONS                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  External APIs (through Gateway):                          │
│  • Pattern: /api/v1/*                                      │
│  • Example: POST /api/v1/users/login                       │
│  • Route: Client → Gateway → Service                       │
│  • Auth: JWT required (verified by Gateway)                │
│  • CORS: Enabled                                            │
│                                                             │
│  Internal Service-to-Service APIs:                         │
│  • Pattern: /v1/*                                          │
│  • Example: GET /v1/users/123                              │
│  • Route: Service → Service (direct)                       │
│  • Auth: Service-to-service token                          │
│  • CORS: Not applicable                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Implementation Guidelines:**

```typescript
// Gateway routes (external traffic)
@Controller('api/v1/users')
export class UserGatewayController {
  @Post('login')
  @UseGuards(JwtAuthGuard)
  async login(@Body() credentials: LoginDto) {
    // Routes to Identity Service: /v1/auth/login
    return this.identityService.authenticate(credentials);
  }
}

// Service internal routes (service-to-service)
@Controller('v1/users')
export class UserServiceController {
  @Get(':id')
  @UseGuards(ServiceAuthGuard)
  async getUser(@Param('id') id: string) {
    // Internal service endpoint
    return this.userService.findById(id);
  }
}
```

**Key Rules:**
1. All client-facing requests MUST use `/api/v1/*` prefix
2. All service-to-service requests MUST use `/v1/*` prefix
3. Gateway MUST NOT expose `/v1/*` endpoints externally
4. Services MUST NOT implement `/api/v1/*` routes (Gateway only)

## 🔒 SECURITY REQUIREMENTS

### JWT Implementation (CRITICAL - Sprint 0.1)

```typescript
// CORRECT Implementation
import jwksRsa from 'jwks-rsa';
import jwt from 'jsonwebtoken';

const jwksClient = jwksRsa({
  jwksUri: 'https://cognito.amazonaws.com/.well-known/jwks.json',
  cache: true,
  rateLimit: true
});

async function verifyToken(token: string) {
  const decoded = jwt.decode(token, { complete: true });
  const kid = decoded.header.kid;
  
  const key = await jwksClient.getSigningKey(kid);
  const signingKey = key.getPublicKey();
  
  return jwt.verify(token, signingKey, {
    algorithms: ['RS256'],
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE
  });
}

// NEVER DO THIS (current bug):
// const decoded = jwt.decode(token); // No verification!
```

### Secrets Management

```typescript
// Use AWS Secrets Manager or environment variables
// NEVER hardcode secrets or use defaults

import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ 
  region: "us-east-1",
  endpoint: process.env.LOCALSTACK_URL // for local dev
});

async function getSecret(secretName: string) {
  const command = new GetSecretValueCommand({ SecretId: secretName });
  const data = await client.send(command);
  return JSON.parse(data.SecretString);
}

// NEVER:
const secret = process.env.JWT_SECRET || 'default-secret'; // ❌
```

### Security Hardening Checklist (Sprint 0.2-0.3)

Before deploying ANY service to production, ensure ALL items are checked:

#### Authentication & Authorization
- [ ] JWT signature verification implemented with JWKS
- [ ] Token expiration enforced (max 1 hour for access tokens)
- [ ] Refresh token rotation implemented
- [ ] Role-based access control (RBAC) configured
- [ ] All write endpoints require authentication
- [ ] API rate limiting configured (per user/IP)

#### Secrets & Configuration
- [ ] No secrets in code or environment files
- [ ] AWS Secrets Manager integrated for production
- [ ] No default fallback values for secrets
- [ ] Environment variables validated on startup
- [ ] Secrets rotation policy configured (90 days)

#### Input Validation
- [ ] All API inputs validated with Zod schemas
- [ ] SQL/NoSQL injection prevention verified
- [ ] XSS prevention on all user inputs
- [ ] File upload validation (type, size, content)
- [ ] Request size limits enforced

#### Data Protection
- [ ] PII data encrypted at rest
- [ ] TLS 1.3 enforced for all connections
- [ ] Database connections use SSL/TLS
- [ ] Sensitive fields redacted from logs
- [ ] CORS configured with specific origins (no wildcards)

#### Monitoring & Incident Response
- [ ] Correlation IDs implemented (see below)
- [ ] Security events logged to audit service
- [ ] Failed authentication attempts monitored
- [ ] Anomaly detection alerts configured
- [ ] Incident response runbook documented

#### Dependencies & Supply Chain
- [ ] npm audit shows 0 high/critical vulnerabilities
- [ ] Dependency scanning in CI/CD pipeline
- [ ] Container images scanned (Trivy/Snyk)
- [ ] Base images from trusted sources only
- [ ] Software Bill of Materials (SBOM) generated

#### Deployment Security
- [ ] Non-root user in Docker containers
- [ ] Read-only file systems where possible
- [ ] Network policies configured (K8s)
- [ ] Service mesh mTLS enabled (production)
- [ ] Secrets never in container images

**Security Sign-Off**: Requires approval from Security Agent before production deployment.

## 📊 DATABASE PATTERNS

### Repository Pattern

```typescript
// Base Repository Interface
interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(filter?: Partial<T>): Promise<T[]>;
  create(entity: T): Promise<T>;
  update(id: string, entity: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// MongoDB Implementation
class MongoRepository<T> implements IRepository<T> {
  constructor(
    private collection: Collection<T>,
    private eventBus: IEventBus
  ) {}
  
  async create(entity: T): Promise<T> {
    const session = await this.startSession();
    try {
      await session.withTransaction(async () => {
        const result = await this.collection.insertOne(entity, { session });
        await this.eventBus.publish(new EntityCreatedEvent(entity));
        return result;
      });
    } finally {
      await session.endSession();
    }
  }
}
```

### Data Migration Pattern

```typescript
// Critical: Convert hierarchy cloning to references
interface MigrationScript {
  version: string;
  up(db: Db): Promise<void>;
  down(db: Db): Promise<void>;
}

class HierarchyMigration implements MigrationScript {
  version = '001_hierarchy_to_references';
  
  async up(db: Db) {
    // Transform cloned hierarchies to reference IDs
    const projects = await db.collection('projects').find({}).toArray();
    
    for (const project of projects) {
      if (project.clonedHierarchy) {
        const referenceId = await this.createReference(project.clonedHierarchy);
        await db.collection('projects').updateOne(
          { _id: project._id },
          { 
            $set: { hierarchyRef: referenceId },
            $unset: { clonedHierarchy: '' }
          }
        );
      }
    }
  }
}
```

## 🧪 TESTING STANDARDS

### Test Coverage Requirements

```yaml
Unit Tests:
  Target: 80%
  Focus: Business logic, domain services
  Tools: Jest, ts-jest

Integration Tests:
  Target: 70%
  Focus: API endpoints, database operations
  Tools: Supertest, TestContainers

E2E Tests:
  Target: Critical user paths
  Focus: User workflows, cross-service operations
  Tools: Cypress, Playwright

Performance Tests:
  Target: <200ms p95 response time
  Focus: Calculation engine, report generation
  Tools: K6, Artillery
```

### Test Structure

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData = { email: 'test@example.com', ... };

      // Act
      const user = await userService.createUser(userData);

      // Assert
      expect(user).toMatchObject({
        id: expect.any(String),
        email: userData.email,
        status: 'ACTIVE'
      });
    });

    it('should publish UserCreated event', async () => {
      // Test event publishing
    });

    it('should rollback on error', async () => {
      // Test transaction rollback
    });
  });
});
```

### Contract Testing (Sprint 0.4)

Contract testing ensures API compatibility between microservices without requiring full integration tests. We use **Pact** for consumer-driven contract testing.

**Quick Reference**:
```typescript
// Consumer (Organization Service) tests what it expects from Identity Service
import { pactWith } from 'jest-pact';

pactWith({ consumer: 'OrganizationService', provider: 'IdentityService' }, (provider) => {
  describe('GET /users/:id', () => {
    beforeEach(() => {
      return provider.addInteraction({
        state: 'user exists',
        uponReceiving: 'a request for user details',
        withRequest: {
          method: 'GET',
          path: '/v1/users/user-123',
          headers: { Authorization: 'Bearer token' }
        },
        willRespondWith: {
          status: 200,
          body: {
            id: 'user-123',
            email: 'test@example.com',
            role: 'ADMIN'
          }
        }
      });
    });

    it('fetches user details', async () => {
      const user = await organizationService.getUserDetails('user-123');
      expect(user.email).toBe('test@example.com');
    });
  });
});
```

**Provider Verification** (Identity Service):
```bash
# Verify that Identity Service actually satisfies the contract
npm run test:pact:verify
```

**Complete Implementation Guide**: See [Docs/SHARED/Testing/](Docs/SHARED/Testing/) for:
- Consumer-driven contract workflow
- Provider verification setup
- CI/CD integration
- Breaking change detection
- Pact Broker configuration

## 📈 MONITORING & OBSERVABILITY

### Logging Standards

```typescript
// Structured logging with correlation IDs
import winston from 'winston';

const logger = winston.createLogger({
  format: winston.format.json(),
  defaultMeta: { 
    service: process.env.SERVICE_NAME,
    version: process.env.VERSION 
  }
});

// Usage
logger.info('User created', {
  userId: user.id,
  correlationId: request.id,
  duration: Date.now() - startTime
});
```

### Health Checks

```typescript
// Every service must implement
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: process.env.SERVICE_NAME,
    version: process.env.VERSION,
    uptime: process.uptime(),
    checks: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      dependencies: await checkDependencies()
    }
  });
});
```

### Correlation ID Implementation (CRITICAL - Sprint 0.1)

Correlation IDs enable request tracing across all microservices. Every request must carry a correlation ID from entry to exit.

#### AsyncLocalStorage Pattern (Recommended)

```typescript
// src/shared/correlation/correlation.service.ts
import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export interface CorrelationContext {
  correlationId: string;
  causationId?: string;
  userId?: string;
  startTime: number;
}

@Injectable()
export class CorrelationService {
  private static storage = new AsyncLocalStorage<CorrelationContext>();

  static getStorage() {
    return this.storage;
  }

  getContext(): CorrelationContext | undefined {
    return CorrelationService.storage.getStore();
  }

  getCorrelationId(): string {
    return this.getContext()?.correlationId || 'UNKNOWN';
  }

  getCausationId(): string | undefined {
    return this.getContext()?.causationId;
  }

  getUserId(): string | undefined {
    return this.getContext()?.userId;
  }
}
```

#### Middleware Integration

```typescript
// src/infrastructure/http/middleware/correlation.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CorrelationService } from '@/shared/correlation/correlation.service';

@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId = req.headers['x-correlation-id'] as string || uuidv4();
    const causationId = req.headers['x-causation-id'] as string;
    const userId = req.user?.id;

    const context = {
      correlationId,
      causationId,
      userId,
      startTime: Date.now()
    };

    // Store context for this async execution
    CorrelationService.getStorage().run(context, () => {
      // Add to response headers
      res.setHeader('X-Correlation-Id', correlationId);
      if (causationId) {
        res.setHeader('X-Causation-Id', causationId);
      }

      next();
    });
  }
}
```

#### Logger Integration

```typescript
// src/shared/logger/logger.service.ts
import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import winston from 'winston';
import { CorrelationService } from '@/shared/correlation/correlation.service';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;

  constructor(private correlationService: CorrelationService) {
    this.logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console()
      ]
    });
  }

  private enrichWithContext(message: string, context?: any) {
    return {
      message,
      correlationId: this.correlationService.getCorrelationId(),
      causationId: this.correlationService.getCausationId(),
      userId: this.correlationService.getUserId(),
      service: process.env.SERVICE_NAME,
      ...context
    };
  }

  log(message: string, context?: any) {
    this.logger.info(this.enrichWithContext(message, context));
  }

  error(message: string, trace?: string, context?: any) {
    this.logger.error(this.enrichWithContext(message, { ...context, trace }));
  }

  warn(message: string, context?: any) {
    this.logger.warn(this.enrichWithContext(message, context));
  }

  debug(message: string, context?: any) {
    this.logger.debug(this.enrichWithContext(message, context));
  }
}
```

#### HTTP Client Integration

```typescript
// src/shared/http/base-api-client.ts
import { Injectable } from '@nestjs/common';
import { CorrelationService } from '@/shared/correlation/correlation.service';

@Injectable()
export class BaseAPIClient {
  constructor(private correlationService: CorrelationService) {}

  async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const correlationId = this.correlationService.getCorrelationId();

    const headers = {
      ...options.headers,
      'X-Correlation-Id': correlationId,
      'X-Causation-Id': correlationId // Current request becomes cause of new request
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
}
```

#### Event Publishing Integration

```typescript
// src/infrastructure/messaging/event-bus.service.ts
import { Injectable } from '@nestjs/common';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { DomainEvent } from '@/domain/events/base.event';
import { CorrelationService } from '@/shared/correlation/correlation.service';

@Injectable()
export class EventBusService {
  constructor(
    private eventBridge: EventBridgeClient,
    private correlationService: CorrelationService
  ) {}

  async publish(event: DomainEvent): Promise<void> {
    // Automatically enrich event with correlation IDs
    const enrichedEvent = {
      ...event,
      correlationId: this.correlationService.getCorrelationId(),
      causationId: event.id, // This event becomes the cause of future events
      userId: this.correlationService.getUserId()
    };

    await this.eventBridge.send(new PutEventsCommand({
      Entries: [{
        Source: `clenergize.${process.env.SERVICE_NAME}`,
        DetailType: event.type,
        Detail: JSON.stringify(enrichedEvent),
        EventBusName: process.env.EVENT_BUS_NAME
      }]
    }));
  }
}
```

#### Cross-Service Tracing Example

```typescript
// Request Flow:
// 1. Frontend → API Gateway (generates correlation ID: req-123)
// 2. Gateway → Identity Service (passes correlation ID: req-123)
// 3. Identity Service publishes UserAuthenticated event (causation ID: event-456)
// 4. Organization Service consumes event (correlation: req-123, causation: event-456)
// 5. Organization Service calls Reference Service (correlation: req-123, causation: event-456)

// All logs across services will have the same correlation ID:
{
  "correlationId": "req-123",
  "causationId": "event-456",
  "service": "identity-service",
  "message": "User authenticated successfully"
}

{
  "correlationId": "req-123",
  "causationId": "event-456",
  "service": "organization-service",
  "message": "Processing user authentication event"
}

{
  "correlationId": "req-123",
  "causationId": "event-456",
  "service": "reference-service",
  "message": "Fetching user permissions"
}
```

**Implementation Pattern**: See [.claude/patterns/correlation-id-implementation.md](.claude/patterns/correlation-id-implementation.md) for complete implementation guide.

## 📝 DECISION RECORDS

### ADR-001: Microservice Boundaries
**Status**: Accepted
**Decision**: Use DDD bounded contexts for service separation
**Rationale**: Clear ownership, reduced coupling, independent scaling

### ADR-002: Event Bus Choice
**Status**: Accepted
**Decision**: AWS EventBridge for production, Redis Pub/Sub for local
**Rationale**: Managed service, schema registry, event replay capability

### ADR-003: Authentication Strategy
**Status**: Accepted
**Decision**: AWS Cognito with JWT tokens
**Rationale**: Managed service, MFA support, enterprise features

### ADR-004: Database per Service
**Status**: Accepted
**Decision**: Separate MongoDB database per service
**Rationale**: Data isolation, independent scaling, clear ownership

## 🚀 QUICK COMMANDS

```bash
# Development Commands
make up                 # Start all services
make down              # Stop all services
make logs service=identity  # View service logs
make test              # Run all tests
make test-service service=identity  # Test specific service
make seed              # Seed development data
make clean             # Clean containers and volumes

# Database Commands
make db-migrate        # Run migrations
make db-seed          # Seed data
make db-backup        # Backup databases
make db-restore       # Restore from backup

# Deployment Commands
make build            # Build all services
make push            # Push to registry
make deploy-local    # Deploy to local k8s
make deploy-dev      # Deploy to dev environment

# Utility Commands
make lint            # Run linters
make format          # Format code
make security-scan   # Security audit
make performance-test # Run performance tests
```

## ⚠️ COMMON PITFALLS TO AVOID

1. **Never decode JWT without verification** - Always verify signature
2. **Never use any type** - Define proper TypeScript interfaces
3. **Never skip transactions** - Use database transactions for multi-step operations
4. **Never hardcode secrets** - Use environment variables or secrets manager
5. **Never ignore error handling** - Implement proper error boundaries
6. **Never skip tests** - Minimum 80% coverage required
7. **Never bypass API Gateway** - All external traffic through gateway
8. **Never share databases** - Each service owns its data
9. **Never use infinite loops** - Implement circuit breakers
10. **Never deploy without health checks** - Required for all services

## 📞 ESCALATION MATRIX

### Technical Issues
1. **Service Agent** → **Architecture Agent** → **Master Coordinator**
2. **Security Issues** → **Security Agent** (immediate escalation)
3. **Data Loss Risk** → **Migration Agent** + **Master Coordinator**
4. **Performance Issues** → **Testing Agent** → **Architecture Agent**

### Blockers
- Immediate: Post in #clenergize-rebuild Slack channel
- Architecture decisions: Schedule review with Architecture Agent
- Security concerns: Immediate review by Security Agent
- Integration issues: Coordinate through Master Coordinator

## 🎯 SUCCESS CRITERIA

### Sprint 0.1 (Current)
- [ ] JWT verification implemented correctly
- [ ] Docker environment running all services
- [ ] LocalStack simulating AWS services
- [ ] Base service templates created
- [ ] Security vulnerabilities patched

### Sprint 0.2
- [ ] All services have health checks
- [ ] Event bus operational
- [ ] Basic CRUD operations working
- [ ] Integration tests passing
- [ ] CI/CD pipeline configured

### Phase 1 Complete (Sprint 1.4)
- [ ] Identity & Organization services complete
- [ ] Authentication/Authorization working
- [ ] Project hierarchies functional
- [ ] 80% test coverage achieved
- [ ] Performance benchmarks met

## 📚 REFERENCE DOCUMENTS

### Priority Reading Order
1. **This file** (CLAUDE.md) - Always read first
2. **Canonical Scope** (Docs/CURRENT/00-Scope/CURRENT_SCOPE.md) - Single source of truth
3. **Service Mapping** (Docs/CURRENT/00-Scope/SERVICE_MAPPING.md) - OLD to NEW mapping
4. **ESG-Generic Models** (Docs/SHARED/Architecture/ESG_GENERIC_DATA_MODELS.md) - Data architecture
5. **Your Service Spec** (Docs/CURRENT/02-Service-Specifications/)
6. **Sprint Tasks** (Docs/CURRENT/04-Sprint-Documentation/)

### Quick Links
- [Jira Board](https://yourcompany.atlassian.net/jira/software/projects/CLNZ)
- [GitHub Repo](https://github.com/yourcompany/clenergize-v3-rebuild)
- [Confluence Docs](https://yourcompany.atlassian.net/wiki/spaces/CLNZ)
- [Slack Channel](https://yourcompany.slack.com/archives/clenergize-rebuild)
- [AWS Console](https://console.aws.amazon.com)

---

## 🔄 DAILY STANDUP TEMPLATE

```markdown
## Agent: [Your Agent Name]
## Date: [Today's Date]
## Sprint Day: [X of 10]

### Yesterday
- Completed: [What was finished]
- Commits: [List commit hashes]
- Tests: [Tests added/passed]

### Today
- Focus: [Main task for today]
- Target: [Specific deliverable]
- Pairing: [Any collaboration needed]

### Blockers
- [Any blocking issues]
- [Dependencies needed]

### Notes
- [Any important observations]
- [Decisions made]
```

---

**Remember**: You're building a critical enterprise system. Every decision matters. Follow the patterns, maintain quality, and escalate concerns immediately. The success of this project depends on consistent, high-quality implementation across all agents.

**Last Updated**: November 15, 2025
**Version**: 1.0.0
**Next Review**: End of Sprint 0.1
