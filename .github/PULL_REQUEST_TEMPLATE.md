# Pull Request

<!--
Thank you for contributing to Clenergize V3!
Please fill out this template completely to help reviewers understand your changes.

See complete review policy at: Docs/CODE_REVIEW_POLICY.md
-->

## Description

<!-- Provide a clear and concise description of what this PR does -->



## Change Type

**Select all that apply**:
- [ ] Agent-Generated Code (requires 1 human approval)
- [ ] Human-Written Code
- [ ] 🔒 Security-Critical Change (requires Security Lead + 1 team member approval)
- [ ] 🏗️ Architecture Change (requires Architect + 1 team member approval)
- [ ] 🔧 Infrastructure Change (requires DevOps + 1 team member approval)
- [ ] 🗄️ Database Migration (requires Database Expert + 1 team member approval)
- [ ] 🐛 Bug Fix
- [ ] ✨ New Feature
- [ ] 📝 Documentation Only
- [ ] ♻️ Refactoring
- [ ] 🧪 Test Addition/Update

## Agent Information (if applicable)

<!-- Fill this section ONLY if this is agent-generated code -->

- **Agent Type**: <!-- Master Coordinator / Architecture / Security / Identity / Organization / etc. -->
- **Agent Task**: <!-- Brief description of the agent's task -->
- **Related Jira Ticket**: <!-- CLNZ-XXX -->
- **Sprint**: <!-- Sprint 0.1 / 0.2 / etc. -->
- **Correlation ID**: <!-- correlation-id for tracing -->

## Changes Made

<!-- List specific changes made in this PR -->

**Modified Files**:
-
-
-

**Key Changes**:
1.
2.
3.

## Related Issues

<!-- Link to related Jira tickets, GitHub issues, documentation -->

- **Jira**: [CLNZ-XXX](https://yourcompany.atlassian.net/browse/CLNZ-XXX)
- **Related PRs**: #XXX
- **Documentation**: [Link to relevant docs]

## Testing

### Test Coverage

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated (if applicable)
- [ ] Manual testing performed
- [ ] Security tests passed (if security-critical)
- [ ] Performance tests passed (if performance-critical)

### Test Results

**Unit Test Coverage**:
```
File          | % Stmts | % Branch | % Funcs | % Lines |
------------- | ------- | -------- | ------- | ------- |
[filename].ts |   XX%   |   XX%    |   XX%   |   XX%   |
```

**Integration Test Results**:
```
[Paste test output or CI/CD link]
```

### Manual Testing Steps

<!-- Describe how you manually tested this change -->

1.
2.
3.

**Expected Result**:


**Actual Result**:


## Review Checklist

<!-- Reviewers: Verify each item before approving -->

### Code Quality

- [ ] Code follows project conventions and style guide
- [ ] Variables/functions have meaningful names
- [ ] Complex logic has explanatory comments
- [ ] No commented-out code (use git history)
- [ ] No console.log() in production code (use proper logger)
- [ ] No hardcoded URLs/credentials/secrets
- [ ] Error handling is comprehensive
- [ ] Functions are small and focused (<50 lines)
- [ ] No code duplication (DRY principle)
- [ ] TypeScript types are properly defined (no `any` without justification)

### Security (required for security-critical changes)

- [ ] Input validation on all user inputs
- [ ] Authentication checks on protected endpoints
- [ ] Authorization checks (role-based permissions)
- [ ] No SQL/NoSQL injection vulnerabilities
- [ ] No command injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] Secrets accessed via AWS Secrets Manager or environment variables
- [ ] Sensitive data encrypted at rest (if applicable)
- [ ] HTTPS/TLS enforced for external calls
- [ ] Rate limiting implemented (if applicable)
- [ ] CORS configured properly (no wildcard * in production)
- [ ] JWT tokens verified (signature + expiration)
- [ ] No sensitive data logged

### Architecture (required for architecture changes)

- [ ] Service boundaries respected (no cross-service database access)
- [ ] Event schemas documented in EVENT_SCHEMA_REGISTRY.md
- [ ] API contracts defined in Swagger/OpenAPI
- [ ] No circular dependencies introduced (checked SERVICE_DEPENDENCY_DIAGRAM.md)
- [ ] Transaction boundaries documented (see TRANSACTION_BOUNDARY_SPEC.md)
- [ ] Backward compatibility maintained (or migration plan documented)
- [ ] API versioning used (/api/v1/* for external, /v1/* for internal)

### Testing

- [ ] Unit test coverage ≥80% (per file)
- [ ] Integration tests cover happy path
- [ ] Edge cases tested
- [ ] Error scenarios tested
- [ ] Tests are deterministic (no flaky tests)
- [ ] Mock external dependencies in tests
- [ ] Tests pass locally: `npm test`

### Performance

- [ ] No N+1 query issues
- [ ] Database queries use indexes
- [ ] Large datasets paginated (default page size: 50)
- [ ] Timeouts configured for external calls (default: 30s)
- [ ] Circuit breakers used for external dependencies
- [ ] Caching implemented where appropriate (Redis TTL documented)
- [ ] Memory leaks prevented (event listeners cleaned up)

### Documentation

- [ ] API endpoints documented in Swagger/OpenAPI
- [ ] Complex algorithms explained in comments
- [ ] README updated if public API changed
- [ ] Architecture docs updated if service boundaries changed
- [ ] Event schemas updated if events added/modified
- [ ] Migration guide provided if breaking changes

## Deployment Plan

<!-- Describe how this will be deployed -->

**Deployment Steps**:
1.
2.
3.

**Environment Variables** (if any new variables added):
```bash
NEW_VARIABLE=value  # Description
```

**Database Migrations** (if applicable):
```bash
# Run migration command
npm run migrate:up
```

**Dependencies**:
- [ ] Requires infrastructure changes (specify below)
- [ ] Requires database migration
- [ ] Requires environment variable updates
- [ ] Requires service restart
- [ ] Requires frontend deployment

**Infrastructure Requirements**:


## Rollback Plan

<!-- CRITICAL: How to rollback if this causes issues -->

**Rollback Steps**:
1.
2.
3.

**Rollback Commands** (if applicable):
```bash
# Rollback commands
git revert <commit-hash>
npm run migrate:down  # if database migration
```

**Data Recovery** (if applicable):


## Screenshots (if applicable)

<!-- Add screenshots for UI changes -->



## Performance Impact

<!-- For performance-critical changes -->

**Before**:
```
[Performance metrics before change]
```

**After**:
```
[Performance metrics after change]
```

**Benchmark Results**:


## Breaking Changes

<!-- ⚠️ IMPORTANT: List any breaking changes -->

- [ ] **NO BREAKING CHANGES**
- [ ] Breaking changes (list below):

**Breaking Changes**:
1.
2.

**Migration Guide**:


## Additional Notes

<!-- Any additional context, screenshots, or information -->



---

## For Reviewers

### Review Guidelines

1. ✅ Verify all checklist items are completed
2. ✅ Run code locally if possible: `npm run dev`
3. ✅ Check for security vulnerabilities (especially for auth/input validation)
4. ✅ Ensure tests pass in CI/CD
5. ✅ Verify documentation is updated
6. ✅ Check for architectural concerns (circular dependencies, service boundaries)
7. ✅ Approve only if confident in code quality

### Security-Critical Review (if applicable)

- [ ] JWT implementation reviewed (signature verification, expiration)
- [ ] Input validation reviewed (no injection vulnerabilities)
- [ ] Secrets management reviewed (AWS Secrets Manager, no hardcoded secrets)
- [ ] Authorization checks reviewed (role-based permissions)
- [ ] Encryption reviewed (at rest, in transit)

### Architecture Review (if applicable)

- [ ] Service dependencies reviewed (no circular dependencies)
- [ ] Event schemas reviewed (versioning, backward compatibility)
- [ ] API contracts reviewed (Swagger updated)
- [ ] Database schema changes reviewed (migrations, indexes)
- [ ] Transaction boundaries reviewed (local vs saga)

### Questions for Author

<!-- Reviewers: Add questions here -->



---

## Agent Signature (if applicable)

<!-- Auto-generated by agent -->

```
Generated by: [Agent Name]
Date: [YYYY-MM-DD HH:MM:SS UTC]
Correlation ID: [correlation-id]
Sprint: [Sprint X.Y]
Jira: [CLNZ-XXX]

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

---

**Review Policy**: See [Docs/CODE_REVIEW_POLICY.md](../Docs/CODE_REVIEW_POLICY.md) for complete review requirements.
**Service Dependencies**: See [Docs/SERVICE_DEPENDENCY_DIAGRAM.md](../Docs/SERVICE_DEPENDENCY_DIAGRAM.md) to verify no circular dependencies.
**Event Schemas**: See [Docs/EVENT_SCHEMA_REGISTRY.md](../Docs/EVENT_SCHEMA_REGISTRY.md) for event definitions.
