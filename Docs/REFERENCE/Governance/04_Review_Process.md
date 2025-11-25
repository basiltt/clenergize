# Review Process

> Standard review processes for code, architecture, and documentation in Clenergize V3.

---

## Overview

All changes to the Clenergize V3 codebase must go through appropriate review processes. This document defines the review types, criteria, and workflows.

---

## Review Types

### 1. Code Review

**Purpose**: Ensure code quality, security, and adherence to standards.

**Scope**: All code changes (features, fixes, refactoring).

**Reviewers**: At least 1 human reviewer (see [Code Review Policy](./CODE_REVIEW_POLICY.md)).

### 2. Architecture Review

**Purpose**: Validate significant design decisions and changes.

**Scope**:
- New services or modules
- Database schema changes
- API contract changes
- Integration patterns

**Reviewers**: Technical Lead + relevant domain expert.

### 3. Security Review

**Purpose**: Identify and mitigate security risks.

**Scope**:
- Authentication/authorization changes
- Cryptographic implementations
- Input validation changes
- External integrations

**Reviewers**: Security Lead (mandatory).

### 4. Documentation Review

**Purpose**: Ensure documentation accuracy and completeness.

**Scope**: All documentation changes affecting:
- Architecture documents
- API documentation
- Security policies
- User guides

**Reviewers**: Technical writer or domain expert.

---

## Code Review Process

### Workflow

```
Developer creates PR
        │
        ▼
    CI/CD checks run
        │
        ├─── FAIL ──→ Developer fixes
        │
        ▼ PASS
    Auto-assign reviewers (CODEOWNERS)
        │
        ▼
    Reviewers conduct review
        │
        ├─── Changes Requested ──→ Developer updates
        │
        ▼ Approved
    Merge to target branch
        │
        ▼
    Post-merge validation
```

### Review Checklist

#### Functionality
- [ ] Code accomplishes the stated purpose
- [ ] Edge cases handled appropriately
- [ ] Error handling is comprehensive
- [ ] Business logic is correct

#### Code Quality
- [ ] Code follows project coding standards
- [ ] No unnecessary complexity
- [ ] DRY principle applied
- [ ] Clear naming conventions
- [ ] Appropriate comments (not excessive)

#### Security
- [ ] No hardcoded secrets
- [ ] Input validation present
- [ ] Authentication/authorization correct
- [ ] No SQL/NoSQL injection risks
- [ ] Sensitive data properly handled

#### Testing
- [ ] Unit tests cover new code
- [ ] Integration tests for API changes
- [ ] Tests pass locally and in CI
- [ ] Coverage meets threshold (80%+)

#### Performance
- [ ] No obvious performance issues
- [ ] Database queries optimized
- [ ] No N+1 query problems
- [ ] Appropriate caching used

#### Documentation
- [ ] API documentation updated
- [ ] Code comments where needed
- [ ] README updated if applicable
- [ ] Changelog entry added

### Review SLAs

| Priority | Initial Review | Final Approval |
|----------|---------------|----------------|
| Critical (P0) | 2 hours | 4 hours |
| High (P1) | 4 hours | 8 hours |
| Normal (P2) | 24 hours | 48 hours |
| Low (P3) | 48 hours | 72 hours |

### Reviewer Guidelines

**Do**:
- Review within SLA
- Be constructive and specific
- Suggest alternatives when criticizing
- Acknowledge good work
- Ask questions for clarification

**Don't**:
- Block PRs without clear justification
- Nitpick on style if linter passes
- Approve without actually reviewing
- Make personal comments
- Delay reviews without communication

---

## Architecture Review Process

### When Required

Architecture review is required for:
- New microservice creation
- Significant API changes (breaking changes)
- New database or schema changes
- New external integrations
- Changes to authentication/authorization flow
- Cross-service communication pattern changes

### Workflow

```
Developer prepares Architecture Decision Record (ADR)
        │
        ▼
    Submit for review (create issue/meeting)
        │
        ▼
    Architecture Review Board meets
        │
        ├─── Rejected ──→ Revise proposal
        │
        ├─── Conditionally Approved ──→ Address conditions
        │
        ▼ Approved
    Document decision in ADR
        │
        ▼
    Proceed with implementation
```

### Architecture Review Board

| Member | Role |
|--------|------|
| Technical Lead | Chair, final decision |
| Security Lead | Security implications |
| DevOps Lead | Infrastructure impact |
| Domain Expert | Business context |

### ADR Template

```markdown
# ADR-XXX: [Decision Title]

## Status
Proposed | Under Review | Accepted | Rejected | Deprecated

## Date
[YYYY-MM-DD]

## Context
What is the issue we're addressing?
What constraints exist?

## Decision
What is the proposed solution?
Why this approach?

## Consequences
### Positive
- [Benefit 1]
- [Benefit 2]

### Negative
- [Drawback 1]
- [Mitigation]

## Alternatives Considered
### Option A
- Description
- Pros/Cons
- Why rejected

### Option B
- Description
- Pros/Cons
- Why rejected

## Implementation Plan
- Phase 1: [description]
- Phase 2: [description]

## Review Notes
[Notes from review meeting]
```

---

## Security Review Process

### When Required

Security review is **mandatory** for:
- Authentication mechanism changes
- Authorization logic changes
- Cryptographic implementations
- JWT/token handling
- Secret management
- API security (rate limiting, CORS)
- Third-party integrations
- Data encryption

### Security Review Checklist

#### Authentication
- [ ] JWT verification implemented correctly
- [ ] Token expiration enforced
- [ ] Refresh token rotation working
- [ ] MFA implementation (if applicable)

#### Authorization
- [ ] RBAC properly implemented
- [ ] Permission checks at all entry points
- [ ] No privilege escalation paths
- [ ] Audit logging for auth events

#### Data Protection
- [ ] PII encrypted at rest
- [ ] TLS for data in transit
- [ ] Sensitive fields masked in logs
- [ ] Proper data retention

#### Input Validation
- [ ] All inputs validated
- [ ] No injection vulnerabilities
- [ ] File upload restrictions
- [ ] Request size limits

#### Dependencies
- [ ] No known vulnerabilities (npm audit)
- [ ] Dependencies up to date
- [ ] License compliance

### Security Sign-off

Format:
```
Security Review: [PR/Change ID]
Reviewer: [Security Lead]
Date: [YYYY-MM-DD]

Findings:
- [ ] No critical issues
- [ ] High issues: [count] (mitigated/accepted)
- [ ] Medium issues: [count]

Decision: APPROVED / REJECTED / CONDITIONAL

Conditions (if any):
1. [Condition]
2. [Condition]

Signature: _______________
```

---

## Sprint Review Process

### Pre-Sprint Review

At sprint planning:
1. Review sprint backlog
2. Validate story estimates
3. Identify dependencies
4. Assess risks
5. Confirm sprint goal

### Mid-Sprint Review

At backlog refinement:
1. Review progress against goal
2. Identify blockers
3. Adjust priorities if needed
4. Refine upcoming stories

### Sprint Demo

At sprint review:
1. Demo completed features
2. Gather stakeholder feedback
3. Review metrics (velocity, quality)
4. Accept/reject completed stories

### Sprint Retrospective

Format:
```
## Sprint X Retrospective

### What went well
- [Item 1]
- [Item 2]

### What could be improved
- [Item 1]
- [Item 2]

### Action items
- [ ] [Action 1] - Owner: [Name] - Due: [Date]
- [ ] [Action 2] - Owner: [Name] - Due: [Date]
```

---

## Documentation Review

### When Required

Documentation review for:
- Architecture documents
- API specifications
- Security policies
- User-facing documentation
- Process documents

### Checklist

- [ ] Technically accurate
- [ ] Complete (no missing sections)
- [ ] Clear and understandable
- [ ] Consistent terminology
- [ ] Properly formatted
- [ ] Links working
- [ ] Examples provided where helpful

---

## Review Metrics

### Tracked Metrics

| Metric | Target | Measured |
|--------|--------|----------|
| PR review time | < 24 hours | Per PR |
| Review iterations | < 3 | Per PR |
| PRs approved without changes | > 70% | Weekly |
| Security reviews completed | 100% | Per sprint |

### Reporting

Weekly review metrics reported in sprint summary:
- Total PRs reviewed
- Average review time
- Rework rate
- Security review backlog

---

## Tools

### GitHub PR Review

- Use inline comments for specific issues
- Use "Request changes" for blocking issues
- Use "Approve" only when ready to merge
- Use PR templates consistently

### Review Automation

Automated checks (must pass before review):
- Linting (ESLint)
- Type checking (TypeScript)
- Unit tests (Jest)
- Security scan (npm audit)
- Build verification

---

## Related Documents

- [Code Review Policy](./CODE_REVIEW_POLICY.md)
- [Project Governance](./01_Project_Governance.md)
- [Coding Standards](../../SHARED/Development/02-Standards/01_Coding_Standards.md)
- [Security Overview](../../SHARED/Security/01_Security_Overview.md)
