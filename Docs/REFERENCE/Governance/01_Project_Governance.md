# Project Governance

> Governance framework for the Clenergize V3 ESG Platform project.

---

## Overview

This document defines the governance structure, decision-making processes, and accountability framework for the Clenergize V3 rebuild project.

---

## Project Structure

### Stakeholders

| Role | Responsibility | Authority |
|------|----------------|-----------|
| **Product Owner** | Define requirements, prioritize backlog | Final say on scope |
| **Technical Lead** | Architecture decisions, technical direction | Design approval |
| **Security Lead** | Security architecture, compliance | Security sign-off |
| **DevOps Lead** | Infrastructure, deployment | Deployment approval |
| **Team Leads** | Sprint execution, team coordination | Task assignment |

### Development Team

| Team | Focus Area | Size |
|------|------------|------|
| Core Platform | Identity, Organization, Gateway | 2 developers |
| Data Services | Reference, Activity, Calculation | 2 developers |
| Reporting | Reporting, Audit, Frontend | 2 developers |
| Infrastructure | DevOps, Testing, Security | 1 developer |

### Claude Agents

| Agent | Responsibility | Human Oversight |
|-------|----------------|-----------------|
| Master Coordinator | Cross-service coordination | Architecture review |
| Security Agent | Auth, secrets, security scans | Security Lead approval |
| Service Agents | Service-specific implementation | Code review required |
| DevOps Agent | Infrastructure, CI/CD | DevOps Lead approval |
| Testing Agent | Test strategies, coverage | QA review |

---

## Decision Framework

### Decision Categories

| Category | Examples | Decision Maker | Approval |
|----------|----------|----------------|----------|
| **Strategic** | Platform scope, timeline, budget | Product Owner | Stakeholder committee |
| **Architecture** | Service boundaries, data models | Technical Lead | Architecture review board |
| **Security** | Auth mechanism, encryption | Security Lead | Technical Lead + Security audit |
| **Technical** | Library choice, patterns | Developer | Technical Lead |
| **Operational** | Sprint planning, task assignment | Team Lead | None required |

### Architecture Decision Records (ADRs)

All significant technical decisions must be documented as ADRs:

```markdown
# ADR-XXX: [Title]

## Status
[Proposed | Accepted | Deprecated | Superseded]

## Context
[What is the issue we're addressing?]

## Decision
[What is the change we're making?]

## Consequences
[What becomes easier? What becomes harder?]

## Alternatives Considered
[What other options were evaluated?]
```

ADR Location: `Docs/CURRENT/05-Technical-Decisions/`

### Escalation Path

```
Developer Issue
    │
    ├─→ Technical Question → Team Lead → Technical Lead
    │
    ├─→ Security Concern → Security Lead → Technical Lead
    │
    ├─→ Scope Question → Product Owner
    │
    └─→ Resource/Timeline → Project Manager → Stakeholders
```

---

## Sprint Governance

### Sprint Cadence

| Activity | Timing | Duration | Participants |
|----------|--------|----------|--------------|
| Sprint Planning | Day 1 | 2 hours | All team + PO |
| Daily Standup | Daily | 15 min | Dev team |
| Backlog Refinement | Mid-sprint | 1 hour | Leads + PO |
| Sprint Review | Last day | 1 hour | All + stakeholders |
| Retrospective | Last day | 1 hour | Dev team |

### Sprint Goals

Each sprint must have:
1. Clear sprint goal statement
2. Success criteria (measurable)
3. Risk assessment
4. Dependencies identified

### Definition of Done

A story is complete when:
- [ ] Code implemented and builds successfully
- [ ] Unit tests written (80% coverage)
- [ ] Integration tests passing
- [ ] Code reviewed by human
- [ ] Security scan passed
- [ ] Documentation updated
- [ ] Deployed to development environment
- [ ] Product Owner acceptance

---

## Code Governance

### Code Ownership

```
NEW/identity-service/      → Identity Agent + Security Lead
NEW/organization-service/  → Organization Agent + Technical Lead
NEW/reference-service/     → Reference Agent
NEW/activity-service/      → Activity Agent
NEW/calculation-service/   → Calculation Agent + Technical Lead
NEW/reporting-service/     → Reporting Agent
NEW/audit-service/         → Audit Agent + Security Lead
NEW/shared/                → Technical Lead
```

### Branch Protection

| Branch | Protection Rules |
|--------|-----------------|
| `main` | PR required, 2 approvals, CI pass, no force push |
| `develop` | PR required, 1 approval, CI pass |
| `sprint/*` | PR required, 1 approval |
| `feature/*` | No protection (developer branches) |

### Code Review Requirements

See [Code Review Policy](./CODE_REVIEW_POLICY.md) for detailed requirements.

Summary:
- All agent-generated code requires human approval
- Security-critical changes require Security Lead review
- Architecture changes require Technical Lead review

---

## Quality Gates

### Phase Gate Criteria

#### Phase 0 → Phase 1

- [ ] Docker environment operational
- [ ] CI/CD pipeline configured
- [ ] Shared libraries published
- [ ] Security scanning enabled
- [ ] JWT/JWKS implementation verified

#### Phase 1 Complete

- [ ] All 7 services deployed and healthy
- [ ] Carbon module matches OLD functionality
- [ ] 80% unit test coverage
- [ ] 70% integration test coverage
- [ ] Security audit passed
- [ ] Performance benchmarks met
- [ ] Data migration validated

### Release Criteria

| Criteria | Threshold |
|----------|-----------|
| Critical bugs | 0 |
| High bugs | ≤ 3 (with workarounds) |
| Test coverage | ≥ 80% |
| Security scan | No high/critical |
| Performance | p95 < 200ms |
| Documentation | Complete |

---

## Risk Management

### Risk Categories

| Category | Owner | Review Frequency |
|----------|-------|------------------|
| Security | Security Lead | Weekly |
| Technical | Technical Lead | Sprint review |
| Schedule | Project Manager | Weekly |
| Resource | Project Manager | Bi-weekly |
| Scope | Product Owner | Sprint planning |

### Risk Register

Maintained in: `Docs/CURRENT/00-Scope/RISK_REGISTER.md`

Format:
```markdown
| ID | Risk | Probability | Impact | Mitigation | Owner | Status |
```

### Issue Tracking

- **JIRA**: Primary issue tracker
- **GitHub Issues**: Technical bugs, PRs
- **Slack**: Real-time communication

---

## Communication

### Channels

| Channel | Purpose | Audience |
|---------|---------|----------|
| #clenergize-rebuild | General updates | All team |
| #clenergize-dev | Technical discussion | Developers |
| #clenergize-alerts | CI/CD, monitoring | DevOps + Leads |
| #clenergize-security | Security discussions | Security + Leads |

### Reporting

| Report | Frequency | Audience |
|--------|-----------|----------|
| Sprint Status | Daily | Team |
| Sprint Summary | End of sprint | Stakeholders |
| Security Report | Weekly | Security Lead + Stakeholders |
| Quality Metrics | Sprint review | All |

---

## Compliance

### Standards

| Standard | Applicability | Owner |
|----------|---------------|-------|
| SOC 2 Type II | Data security | Security Lead |
| ISO 27001 | Information security | Security Lead |
| GDPR | Data privacy | Legal + Technical Lead |
| GHG Protocol | Carbon calculations | Technical Lead |

### Audit Trail

All significant actions must be logged to audit-service:
- User authentication
- Data modifications
- Permission changes
- Report generation
- Configuration changes

---

## Change Management

### Change Request Process

1. Submit change request with justification
2. Impact assessment by relevant lead
3. Approval based on change category
4. Schedule implementation
5. Communicate to stakeholders

### Emergency Changes

For production incidents:
1. Immediate fix by on-call developer
2. Post-incident review within 24 hours
3. Document in incident log
4. Create follow-up tickets

---

## Document Control

### Document Categories

| Category | Location | Review Cycle |
|----------|----------|--------------|
| Architecture | Docs/CURRENT/, Docs/SHARED/ | Quarterly |
| Process | Docs/REFERENCE/Governance/ | Bi-annually |
| Technical | Docs/SHARED/ | As needed |
| Sprint | Docs/CURRENT/04-Sprint-Documentation/ | Per sprint |

### Version Control

- All documentation in Git
- Meaningful commit messages
- PR for significant changes
- Changelog maintained

---

## Related Documents

- [Code Review Policy](./CODE_REVIEW_POLICY.md)
- [Review Process](./04_Review_Process.md)
- [Multi-Agent Strategy](./02_Multi_Agent_Strategy.md)
- [JIRA Structure](./03_JIRA_Structure.md)
