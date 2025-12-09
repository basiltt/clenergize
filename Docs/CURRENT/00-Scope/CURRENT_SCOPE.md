# Clenergize V3 - Current Phase Scope (Single Source of Truth)

> **CANONICAL DOCUMENT**: This is the authoritative scope definition. All other documents MUST align with this.
> **Version**: 2.0.0
> **Last Updated**: November 25, 2024
> **Status**: APPROVED

---

## 1. Executive Summary

| Metric | Value |
|--------|-------|
| **Phase Name** | Phase 0 + Phase 1 (Foundation + Core Services) |
| **Duration** | 12 weeks (6 sprints x 2 weeks) |
| **Story Points** | 340 SP total |
| **Sprint Velocity** | ~57 SP/sprint |
| **Team Size** | 7 developers |
| **Claude Agents** | 5-7 core agents (start small, expand as needed) |
| **Services** | 7 microservices |

---

## 2. Objective

**Rebuild the existing Clenergize application** (code in `OLD/` folder) with:
1. Modern, secure microservices architecture
2. ESG-generic foundations (to support future modules without refactoring)
3. Carbon footprint module fully functional (matching OLD functionality)
4. All critical bugs from OLD codebase fixed

**This is NOT**:
- A new feature development project
- A full ESG platform build (that's future phases)
- A scope expansion beyond what exists in OLD

---

## 3. What Exists in OLD (Must Rebuild)

| OLD Service | Port | Functionality | NEW Service |
|-------------|------|---------------|-------------|
| user-management-ms | 3001 | User auth, JWT, roles, email | identity-service |
| project-management-ms | 3002 | Projects, hierarchy (Company/Entity/Subsidiary/Location) | organization-service |
| master-data-ms | 3003 | Emission factors, parameters, conversions, years | reference-service |
| carbon-footprint-ms | 3005 | Activity data, calculations, scopes 1/2/3 | activity-service + calculation-service |
| backend-ms | 3000 | API Gateway, orchestration, SQS consumers | reporting-service + gateway |
| companyDetails-ms | - | Company extended info | (merge into organization-service) |
| frontend | 3000 | Next.js application | frontend (minimal changes) |

---

## 4. Phase Structure

### Phase 0: Foundation (2 Sprints = 4 Weeks, 100 SP)

| Sprint | Focus | Story Points |
|--------|-------|--------------|
| 0.1 | Infrastructure Setup | 50 SP |
| 0.2 | Security & Patterns | 50 SP |

**Deliverables**:
- Docker Compose environment with all infrastructure
- CI/CD pipeline (GitHub Actions)
- Shared libraries with ESG-generic types
- JWT/JWKS verification implementation
- Correlation ID middleware
- Circuit breakers and saga coordinator

### Phase 1: Core Services (4 Sprints = 8 Weeks, 240 SP)

| Sprint | Focus | Story Points |
|--------|-------|--------------|
| 1.1 | Identity & Organization | 60 SP |
| 1.2 | Reference & Activity | 60 SP |
| 1.3 | Calculation & Reporting | 60 SP |
| 1.4 | Audit & Integration | 60 SP |

**Deliverables**:
- All 7 microservices rebuilt and deployed
- Carbon module functionality matching OLD
- E2E integration tests passing
- Data migration validated (7-day dual-run)
- Security audit passed

---

## 5. Services Architecture

### 5.1 Service List (7 Services)

| Service | Port | Database | Purpose |
|---------|------|----------|---------|
| identity-service | 3001 | clenergize_identity | Auth, users, JWT/JWKS, RBAC |
| organization-service | 3002 | clenergize_organization | Companies, projects, hierarchy |
| reference-service | 3003 | clenergize_reference | Emission factors, parameters |
| activity-service | 3004 | clenergize_activity | Activity data, validation, import |
| calculation-service | 3005 | clenergize_calculation | GHG calculations, aggregations |
| reporting-service | 3006 | clenergize_reporting | Reports, dashboards, exports |
| audit-service | 3007 | clenergize_audit | Audit trail, compliance logging |

### 5.2 ESG-Generic Architecture

**Build now, use later**:
- ESG domain types in shared library (Environmental, Social, Governance)
- Activity model supports domain/subdomain (implement only `environmental/carbon`)
- Reference service supports multi-domain data (implement only emission factors)
- Calculation engine is pluggable (implement only GHG calculations)
- Reporting is framework-agnostic (implement only GHG Protocol)

This investment of ~2 sprints avoids 15-25 sprints of refactoring in future phases.

---

## 6. Critical Bugs to Fix

### Security (P0 - Blocking)
| Issue | OLD Problem | NEW Solution |
|-------|-------------|--------------|
| C1 | JWT decoded without signature verification | JWKS verification with RS256 |
| C7 | Hardcoded fallback secrets | AWS Secrets Manager, fail-fast |

### Data Integrity (P0 - Blocking)
| Issue | OLD Problem | NEW Solution |
|-------|-------------|--------------|
| C3 | Hierarchy cloning (300% data bloat) | Reference-based with templates |
| C6 | Non-transactional operations | MongoDB transactions |

### Reliability (P1 - High)
| Issue | OLD Problem | NEW Solution |
|-------|-------------|--------------|
| C2 | Infinite SQS polling loops | Event-driven with graceful shutdown |
| - | No circuit breakers | Circuit breakers for all HTTP calls |

---

## 7. Team Configuration

### Developers
- 7 full-stack developers
- Per-developer velocity: ~8 SP/sprint
- Team velocity: ~56 SP/sprint

### Claude Agents (5-7 Core)
| Agent | Responsibility |
|-------|----------------|
| Master Coordinator | Cross-service coordination |
| Security Agent | JWT/JWKS, auth, secrets |
| Identity Agent | identity-service |
| Organization Agent | organization-service |
| Data Agent | reference, activity, calculation services |
| Reporting Agent | reporting-service |
| DevOps Agent | Docker, CI/CD, deployment |

**Future agents** (add when needed): Testing Agent, Migration Agent, Frontend Agent

---

## 8. Success Criteria

### Must Have (Go/No-Go)
- [ ] All 7 services deployed and healthy
- [ ] Carbon module matches OLD functionality
- [ ] All critical bugs (C1-C7) fixed
- [ ] JWT/JWKS verification working
- [ ] 80% unit test coverage
- [ ] 70% integration test coverage
- [ ] <200ms p95 API response time
- [ ] Security audit passed
- [ ] Data migration successful (7-day validation)

### ESG-Ready (Architecture)
- [ ] ESG domain types in shared library
- [ ] Activity service supports domain/subdomain
- [ ] Calculation engine interface is pluggable
- [ ] Reporting service is framework-agnostic

---

## 9. Out of Scope (Future Phases)

**NOT building in current phase**:
- Gap Analysis module
- Benchmarking module
- Strategy & Policies module
- KPI & Targets module
- Materiality module
- Multi-framework reporting (GRI, SASB, TCFD, CDP, CSRD)
- Water, waste, biodiversity services
- Social dimension services
- Governance services
- ML/AI analytics

See [FUTURE_SCOPE.md](./FUTURE_SCOPE.md) for future planning.

---

## 10. Document References

### Authoritative Documents
- **This file**: `Docs/CURRENT/00-Scope/CURRENT_SCOPE.md` (Single Source of Truth)
- **Service Mapping**: `Docs/CURRENT/00-Scope/SERVICE_MAPPING.md`
- **Future Scope**: `Docs/CURRENT/00-Scope/FUTURE_SCOPE.md`
- **JIRA Plan**: `Docs/CURRENT/05-JIRA/JIRA_MASTER_PLAN.md`

### Archived Documents (Do Not Use)
Any document in `Docs/REFERENCE/Archive/` should be considered historical only.

---

**IMPORTANT**: If any document conflicts with this scope definition, THIS DOCUMENT IS CORRECT. Report conflicts for cleanup.
