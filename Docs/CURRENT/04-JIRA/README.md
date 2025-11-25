# JIRA Ticket Structure - Rebuild Required

> **STATUS**: Awaiting Generation
> **Last Updated**: November 25, 2024

---

## Important Notice

The previous JIRA planning documents have been archived due to scope conflicts. A complete rebuild of the JIRA ticket structure is required based on the canonical scope.

## Canonical Scope Reference

| Metric | Value |
|--------|-------|
| **Total Story Points** | 340 SP |
| **Duration** | 12 weeks (6 sprints) |
| **Sprint Velocity** | ~57 SP/sprint |
| **Team Size** | 7 developers |
| **Claude Agents** | 5-7 core agents |
| **Services** | 7 microservices |

## Services in Scope

1. **identity-service** (3001) - Auth, users, JWT/JWKS, RBAC
2. **organization-service** (3002) - Companies, projects, hierarchy
3. **reference-service** (3003) - Emission factors, parameters
4. **activity-service** (3004) - Activity data, validation, import
5. **calculation-service** (3005) - GHG calculations, aggregations
6. **reporting-service** (3006) - Reports, dashboards, exports
7. **audit-service** (3007) - Audit trail, compliance logging

## Sprint Structure

| Sprint | Focus | Story Points |
|--------|-------|--------------|
| 0.1 | Infrastructure Setup | 50 SP |
| 0.2 | Security & Patterns | 50 SP |
| 1.1 | Identity & Organization | 60 SP |
| 1.2 | Reference & Activity | 60 SP |
| 1.3 | Calculation & Reporting | 60 SP |
| 1.4 | Audit & Integration | 60 SP |

## Archived Documents

Previous JIRA documents archived to `Docs/REFERENCE/Archive/Scope-Conflicts/`:
- PHASE1_COMPLETE_JIRA_PLAN.md (850 SP - incorrect)
- PHASE1_OLD_FEATURE_VERIFICATION.md
- PHASE1_JIRA_IMPORT.csv
- 00_MASTER_JIRA_SUMMARY.md (5,700 SP - all phases combined)

## Next Steps

1. Generate complete JIRA epic/story/task structure
2. Include acceptance criteria for all stories
3. Create import-ready format (CSV or JSON)
4. Align with ESG-generic architecture requirements

---

**Reference**: See [CURRENT_SCOPE.md](../00-Scope/CURRENT_SCOPE.md) for authoritative scope definition.
