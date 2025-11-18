# Agent Coordination Guide

## Overview

This guide establishes the coordination protocols for the 14 specialized Claude agents working on the Clenergize V3 rebuild project. Effective agent handoffs, clear communication, and proper context management are critical for maintaining consistency and avoiding conflicts.

**Agents**: Master Coordinator + 13 Specialized Agents
**Context Budget**: 200K tokens per agent
**Coordination Method**: Jira tickets, Git branches, Slack channels, Integration map

---

## Table of Contents

1. [Agent Roster](#agent-roster)
2. [Handoff Protocol](#handoff-protocol)
3. [Communication Channels](#communication-channels)
4. [Integration Point Documentation](#integration-point-documentation)
5. [Conflict Resolution](#conflict-resolution)
6. [Daily Standup Template](#daily-standup-template)
7. [Decision Recording](#decision-recording)

---

## Agent Roster

### 1. Master Coordinator Agent
- **Responsibility**: Cross-service coordination, sprint planning, architecture decisions
- **Tools**: Jira, Git, Integration Map
- **Triggers**: Sprint planning, major decisions, integration conflicts
- **Escalates To**: Product Owner, Tech Lead

### 2. Architecture Agent
- **Responsibility**: Service boundaries, event schemas, distributed transactions
- **Tools**: Design docs, Architecture Decision Records (ADRs)
- **Triggers**: New service design, major refactoring, performance optimization
- **Escalates To**: Master Coordinator

### 3. Security Agent
- **Responsibility**: Authentication, authorization, vulnerability patching
- **Tools**: Security scanners, JWKS configuration, secret management
- **Triggers**: Security stories (CLNZ-101 to CLNZ-108), vulnerability reports
- **Escalates To**: Master Coordinator (immediate for critical issues)

### 4. Identity Agent (Service)
- **Responsibility**: User management, authentication, JWT issuance
- **Port**: 3001
- **Database**: clenergize_identity
- **Dependencies**: None (foundational service)
- **Consumers**: All other services (for JWT verification)

### 5. Organization Agent (Service)
- **Responsibility**: Organizations, projects, hierarchies (reference-based)
- **Port**: 3002
- **Database**: clenergize_organization
- **Dependencies**: Identity (authentication), Reference (hierarchy templates)

### 6. Reference Agent (Service)
- **Responsibility**: Emission factors, units, conversions, hierarchy templates
- **Port**: 3003
- **Database**: clenergize_reference
- **Dependencies**: Identity (authentication)

### 7. Activity Agent (Service)
- **Responsibility**: Activity data ingestion, validation, bulk imports
- **Port**: 3004
- **Database**: clenergize_activity
- **Dependencies**: Identity, Organization, Reference

### 8. Calculation Agent (Service)
- **Responsibility**: Emission calculations, aggregations, rollups
- **Port**: 3005
- **Database**: clenergize_calculation
- **Dependencies**: Identity, Activity, Reference

### 9. Reporting Agent (Service)
- **Responsibility**: Report generation, exports, scheduled reports
- **Port**: 3006
- **Database**: clenergize_reporting
- **Dependencies**: Identity, Calculation, Organization

### 10. Audit Agent (Service)
- **Responsibility**: Audit logging, compliance tracking, event sourcing
- **Port**: 3007
- **Database**: clenergize_audit
- **Dependencies**: None (listens to all events)

### 11. Frontend Agent
- **Responsibility**: UI components, state management, accessibility
- **Port**: 3005 (Next.js)
- **Dependencies**: All backend services (via API Gateway)

### 12. DevOps Agent
- **Responsibility**: Docker, AWS, CI/CD, monitoring, infrastructure
- **Tools**: Docker Compose, GitHub Actions, CloudWatch
- **Triggers**: Infrastructure changes, deployment issues

### 13. Testing Agent
- **Responsibility**: Unit tests, integration tests, E2E tests, performance tests
- **Tools**: Jest, Supertest, Cypress, K6
- **Triggers**: New features, bug fixes, performance requirements

### 14. Migration Agent
- **Responsibility**: Data migration from OLD to NEW, ETL pipelines
- **Tools**: MongoDB migration scripts, data validators
- **Triggers**: Migration stories (Phase 4), data inconsistencies

---

## Handoff Protocol

### Task Completion Checklist

Before handing off to another agent, the current agent MUST complete:

#### 1. Code Commit ✅
```bash
# Create feature branch if not exists
git checkout -b feature/CLNZ-XXX-description

# Commit all changes
git add .
git commit -m "feat(service): implement feature X

- Detail 1
- Detail 2
- Detail 3

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to remote
git push origin feature/CLNZ-XXX-description
```

#### 2. Jira Ticket Update ✅
```
Status: Update to "In Review" or next appropriate status
Comment: Add summary of work completed
Attachments: Link to PR, ADR, or relevant docs
Time Logged: Estimated effort (story points converted to hours)
```

#### 3. Integration Map Update ✅

Update `Docs/integration-map.md` with new integration points:

```markdown
## Identity Service → Organization Service

**Integration Point**: JWT Verification
**Type**: Authentication
**Implementation**:
- Organization service calls Identity JWKS endpoint
- Verifies JWT signature on every request
- Extracts user context for authorization

**Files**:
- `organization-service/src/middleware/auth.middleware.ts`
- `identity-service/src/controllers/jwks.controller.ts`

**Status**: ✅ Implemented
**Owner**: Identity Agent + Organization Agent
**Last Updated**: 2025-11-17
```

#### 4. Architecture Decision Record (ADR) ✅

For significant decisions, create an ADR in `Docs/decisions/`:

```markdown
# ADR-NNN: [Title]

## Status
Accepted | Proposed | Deprecated

## Context
What is the issue we're addressing?

## Decision
What is the change we're proposing/making?

## Consequences
What becomes easier or harder as a result?

## Alternatives Considered
What other options did we evaluate?
```

#### 5. Handoff Message ✅

Post in Slack channel with this format:

```markdown
@[next-agent] Task Handoff

**Jira**: CLNZ-XXX
**From**: [Your Agent Name]
**To**: [Next Agent Name]
**Status**: [Completed/Ready for Review/Blocked]

**What Was Completed**:
- Implemented JWT verification middleware
- Added unit tests (coverage: 85%)
- Updated integration map

**Integration Points**:
- Exports: `@clenergize/security` package with JWTVerifier class
- Location: `shared/packages/security/src/jwt.middleware.ts`
- Usage: All services import and use in auth guards

**Next Steps**:
1. Implement auth guards in Organization service
2. Add E2E tests for protected endpoints
3. Update API documentation with auth requirements

**Blockers**: None

**Files Changed**:
- `shared/packages/security/src/jwt.middleware.ts` (new)
- `shared/packages/common/src/errors/index.ts` (updated)

**Branch**: feature/CLNZ-101-jwt-verification
**PR**: #123 (pending review)
```

---

## Communication Channels

### Slack Workspace Structure

```
#clenergize-rebuild (Main channel)
  ├── #coord-master (Master Coordinator updates)
  ├── #agent-architecture (Architecture decisions)
  ├── #agent-security (Security alerts and fixes)
  ├── #service-identity (Identity service)
  ├── #service-organization (Organization service)
  ├── #service-reference (Reference service)
  ├── #service-activity (Activity service)
  ├── #service-calculation (Calculation service)
  ├── #service-reporting (Reporting service)
  ├── #service-audit (Audit service)
  ├── #frontend (Frontend development)
  ├── #devops (Infrastructure and deployment)
  ├── #testing (Test strategies and results)
  └── #migration (Data migration)
```

### Communication Rules

1. **Tag appropriately**: Always @ mention the agent you're handing off to
2. **Thread replies**: Keep related discussion in threads
3. **Use emoji status**: ✅ Done, 🔄 In Progress, ❌ Blocked, ⚠️ Needs Review
4. **Link to Jira**: Always include ticket number
5. **Be concise**: Summary first, details in thread

---

## Integration Point Documentation

### Integration Map Structure

Maintain `Docs/integration-map.md` with this format:

```markdown
# Clenergize V3 - Service Integration Map

Last Updated: 2025-11-17

## Integration Matrix

| From Service | To Service | Type | Status | Owner |
|--------------|------------|------|--------|-------|
| Organization | Identity | Auth | ✅ Done | Identity + Org Agents |
| Activity | Reference | Data | 🔄 In Progress | Activity + Ref Agents |
| Calculation | Activity | Event | ⚠️ Needs Review | Calc + Activity Agents |

## Detailed Integration Points

### [Service A] → [Service B]

**Purpose**: Brief description

**Type**:
- Synchronous API call
- Asynchronous event
- Shared database (avoid!)
- Shared package

**Implementation**:
- Technical details
- File locations
- Configuration

**Error Handling**:
- Retry strategy
- Circuit breaker
- Fallback behavior

**Testing**:
- Unit tests location
- Integration tests location
- E2E tests coverage

**Performance**:
- Expected latency
- Throughput requirements
- Scaling considerations
```

---

## Conflict Resolution

### Types of Conflicts

#### 1. Code Conflicts (Git Merge Conflicts)

```bash
# Pull latest changes
git checkout develop
git pull origin develop

# Rebase your branch
git checkout feature/CLNZ-XXX
git rebase develop

# Resolve conflicts manually
# Update files, then:
git add .
git rebase --continue

# Force push (since history changed)
git push --force-with-lease origin feature/CLNZ-XXX
```

**Escalation**: If conflicts are complex, tag both agents + Master Coordinator in Slack

#### 2. Design Conflicts (Architecture Disagreements)

**Process**:
1. Both agents document their approach in ADR format
2. Post to #agent-architecture channel
3. Tag Architecture Agent for review
4. Architecture Agent makes final decision within 24 hours
5. Document decision in ADR-NNN
6. Losing approach archived for reference

**Escalation**: If no consensus after Architecture Agent review, escalate to Master Coordinator

#### 3. Integration Conflicts (API Contract Disputes)

**Process**:
1. Both agents meet in Slack thread
2. Review OpenAPI specification
3. Identify breaking vs non-breaking changes
4. Follow API versioning strategy:
   - Non-breaking: Add to existing version
   - Breaking: Create new version (v2)
5. Update integration map
6. Create migration plan if needed

**Escalation**: Tag Master Coordinator if breaking changes affect multiple services

#### 4. Data Model Conflicts (Schema Disagreements)

**Process**:
1. Document both approaches with examples
2. Tag Architecture Agent + Migration Agent
3. Consider:
   - Migration complexity
   - Query performance
   - Consistency requirements
   - Future extensibility
4. Architecture Agent decides with input from Migration Agent
5. Document in ADR
6. Create migration script if affecting existing data

**Escalation**: Master Coordinator if affects production data

---

## Daily Standup Template

Post this in #clenergize-rebuild by 9am daily:

```markdown
## 🤖 [Agent Name] - Daily Update
**Date**: 2025-11-17
**Sprint**: 0.1 (Day X of 10)

### ✅ Yesterday
- Completed CLNZ-101: JWT verification middleware
- Code review feedback addressed on PR #123
- Added 15 unit tests (coverage now 85%)

### 🔄 Today
- Starting CLNZ-102: Implement auth guards in Organization service
- Pair with Organization Agent on integration testing
- Update API documentation with auth requirements

### 🎯 Target
- Complete auth guards by EOD
- All tests passing
- PR ready for review

### ❌ Blockers
None

### 💡 Notes
- Discovered potential optimization in JWT caching
- Will create follow-up ticket for Sprint 0.2
```

---

## Decision Recording

### When to Create an ADR

Create an ADR for:
- Architecture patterns (repository pattern, event sourcing, etc.)
- Technology choices (NestJS vs Express, MongoDB vs PostgreSQL)
- API design (REST vs GraphQL, versioning strategy)
- Security decisions (JWT vs sessions, encryption algorithms)
- Data modeling (normalization, denormalization, indexing)
- Performance optimizations (caching strategy, database pooling)
- Migration strategies (big bang vs gradual, data transformation)

### ADR Template

Location: `Docs/decisions/ADR-NNN-title-in-kebab-case.md`

```markdown
# ADR-NNN: [Title]

**Status**: Proposed | Accepted | Deprecated | Superseded by ADR-XXX
**Date**: 2025-11-17
**Deciders**: Architecture Agent, [Other Agents]
**Context Owner**: [Agent Name]

## Context

What is the issue we're addressing? Include:
- Business requirements
- Technical constraints
- Current state
- Desired state

## Decision

What change are we making? Be specific:
- What pattern/technology/approach
- How it works
- Why this over alternatives

## Consequences

### Positive
- What becomes easier
- What problems it solves
- Performance improvements
- Developer experience gains

### Negative
- What becomes harder
- New complexity introduced
- Technical debt
- Migration effort required

### Risks
- What could go wrong
- Mitigation strategies

## Alternatives Considered

### Alternative 1: [Name]
- Description
- Pros
- Cons
- Why rejected

### Alternative 2: [Name]
- Description
- Pros
- Cons
- Why rejected

## Implementation Plan

1. Step one
2. Step two
3. Step three

**Estimated Effort**: X story points
**Assigned To**: [Agent Name]
**Target Sprint**: X.X

## Validation

How will we know if this decision was correct?
- Metrics to track
- Success criteria
- Review date

## References

- [Link to related ADRs]
- [Link to documentation]
- [Link to research]

---

**Approved By**: Master Coordinator
**Implementation Status**: Not Started | In Progress | Complete
```

---

## Agent-to-Agent Communication Best Practices

### DO ✅
- Tag the specific agent you're addressing
- Include ticket number (CLNZ-XXX)
- Provide file locations for code references
- Specify branch names for PR reviews
- Use code blocks for technical details
- Add emojis for status (✅ 🔄 ❌ ⚠️)
- Link to relevant documentation
- Be specific about what's needed next

### DON'T ❌
- Post without context
- Assume others remember previous discussions
- Skip integration map updates
- Forget to commit before handoff
- Leave code in broken state
- Ignore test failures
- Skip ADRs for major decisions
- Work on same files simultaneously (coordinate first!)

---

## Escalation Matrix

```
Technical Issue Flow:
Service Agent → Architecture Agent → Master Coordinator → Tech Lead

Security Issue Flow:
Any Agent → Security Agent (immediate) → Master Coordinator → CISO

Data Issue Flow:
Service Agent → Migration Agent → Architecture Agent → Master Coordinator

Process Issue Flow:
Any Agent → Master Coordinator → Product Owner

Blocker Resolution:
Any Agent → Master Coordinator (within 2 hours) → Tech Lead (if unresolved)
```

---

## Weekly Coordination Meeting

**When**: Every Monday 10am
**Duration**: 30 minutes
**Attendees**: All agents (Master Coordinator leads)
**Agenda**:
1. Sprint progress review (5 min)
2. Integration point updates (10 min)
3. Blockers and dependencies (10 min)
4. Upcoming decisions needed (5 min)

**Output**:
- Updated sprint board
- Integration map changes
- Blocker resolution plan
- Upcoming ADRs to draft

---

## Tools Reference

### Jira
- Create tickets: Project CLNZ
- Sprint board: `https://yourcompany.atlassian.net/jira/software/projects/CLNZ/boards/1`
- Custom fields: Agent Owner, Integration Points, ADR Reference

### Git
- Main branch: `main`
- Development branch: `develop`
- Feature branches: `feature/CLNZ-XXX-description`
- Hotfix branches: `hotfix/CLNZ-XXX-description`

### Integration Map
- File: `Docs/integration-map.md`
- Update before handoff
- Version controlled in Git

### ADRs
- Directory: `Docs/decisions/`
- Naming: `ADR-NNN-title.md`
- Sequential numbering

---

## Success Metrics

Track these metrics weekly:

- **Handoff Quality**: % of handoffs with all checklist items complete
- **Integration Clarity**: % of services with documented integration points
- **Conflict Resolution Time**: Average time to resolve conflicts
- **ADR Coverage**: % of major decisions with ADRs
- **Communication Response Time**: Average time to respond to @mentions

**Target**: >90% for all metrics

---

## Appendix: Quick Reference

### Handoff Checklist (Print This!)

```
□ Code committed to feature branch
□ Tests passing (min 80% coverage)
□ Jira ticket updated (status, comment, time)
□ Integration map updated (if applicable)
□ ADR created (if significant decision)
□ Slack handoff message posted
□ Next agent tagged
□ Branch pushed to remote
□ PR created (if ready for review)
□ Documentation updated
```

---

**Last Updated**: November 17, 2025
**Maintained By**: Master Coordinator Agent
**Review Frequency**: End of each sprint
