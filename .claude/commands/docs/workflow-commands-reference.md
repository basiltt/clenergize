# Development Workflow Commands

## Overview

These commands orchestrate the complete development workflow from Jira issue selection through PR merge.

## State Tracking

The workflow maintains state in these files:

| File | Purpose |
|------|---------|
| `.claude/workflow-state.md` | Current issue, queue, sprint progress |
| `.claude/issue-docs-mapping.md` | Issue → Documentation links |
| `Docs/CURRENT/04-JIRA/JIRA_COMPLETE_PLAN.md` | Detailed requirements |

**Auto-Sync**: The workflow automatically reads these files before each action and updates them after completion.

---

## Issue Management Commands

### /pick-issue [CLNZ-XXX | next | auto]

Pick a Jira issue and start the development workflow.

**Usage**:
```
/pick-issue CLNZ-170    # Pick specific issue
/pick-issue next         # Auto-pick next from queue
/pick-issue auto         # Alias for next
```

**What it does**:
1. **Checks state** - Reads workflow-state.md, ensures no issue in progress
2. **Determines issue** - Uses specified issue OR gets next from queue
3. **🔍 Checks existing code** - Scans codebase for prior implementation attempts
4. **Loads documentation** - Reads issue-docs-mapping.md, loads ALL linked docs
5. **Fetches Jira details** - Gets acceptance criteria from Jira
6. **Validates dependencies** - Checks if dependent issues are completed
7. **Creates feature branch** - `feature/CLNZ-XXX-description` (or uses existing)
8. **Updates state** - Marks issue as in_progress in workflow-state.md
9. **Transitions Jira** - Updates status to "In Progress"
10. **Displays context** - Shows full context including loaded docs + existing code
11. **Delegates to agent** - Hands off to appropriate service agent

**Pre-Development Code Check** (Step 3):
Before starting development, the workflow scans for existing implementations:

```yaml
Code Detection:
  check_branches:
    - git branch -a | grep "feature/CLNZ-{issue_id}"
    - Check for existing feature branch from previous attempt

  check_codebase:
    - Scan NEW/{service}/src/ for related modules
    - Check docker-compose.dev.yml for service definitions
    - Look for tests related to the issue

  check_git_history:
    - Search commit messages for CLNZ-{issue_id}
    - Look for reverted or abandoned commits

  if_code_exists:
    outcome: WARN
    message: |
      ⚠️ EXISTING CODE DETECTED for CLNZ-XXX

      Found:
      - Branch: feature/CLNZ-XXX-description (last commit: 3 days ago)
      - Files: NEW/identity-service/src/modules/auth/
      - Tests: NEW/identity-service/test/auth.spec.ts

      Options:
      1. Continue from existing code (recommended)
      2. Start fresh (will archive existing branch)
      3. Review existing implementation first

    action: Prompt user for decision before proceeding

  if_jira_mismatch:
    outcome: SYNC_REQUIRED
    message: |
      🔄 JIRA STATUS MISMATCH

      Code exists but Jira shows "To Do"
      This may indicate:
      - Previous attempt was abandoned
      - Jira ticket wasn't updated after work started
      - PR was merged but Jira not closed

    action: Offer to sync Jira status or investigate history
```

**Auto-Pick Algorithm**:
- Gets first `pending` issue from queue in workflow-state.md
- Skips issues with unmet dependencies
- **Checks for existing code** before marking as next
- Ensures no issue is missed

**Agent**: dev-workflow-agent

---

### /workflow-status

Show overall workflow progress and current state, including code existence checks.

**Usage**:
```
/workflow-status
```

**Displays**:
- Current sprint info and progress percentage
- Active issue (if any) with branch and agent
- Next 3 issues in queue
- Overall completion (X/340 SP)
- Blocked issues (waiting for dependencies)
- **Code Sync Status**: Issues with existing code but open Jira status

**Code Existence Check**:
The workflow automatically scans the codebase to detect:
1. **Orphaned implementations**: Code exists but Jira ticket still "To Do" or "In Progress"
2. **Incomplete closures**: Branch/PR merged but Jira not transitioned to "Done"
3. **Abandoned work**: Feature branch exists but no recent commits

```yaml
Code Sync Detection:
  scan_locations:
    - NEW/{service-name}/src/     # Service implementations
    - NEW/frontend/src/           # Frontend components
    - docker-compose*.yml         # Infrastructure changes
    - .github/workflows/          # CI/CD changes

  detection_patterns:
    docker_compose: "services listed in docker-compose.dev.yml"
    service_modules: "modules in NEW/{service}/src/modules/"
    api_endpoints: "controllers in NEW/{service}/src/infrastructure/http/"
    git_branches: "feature/CLNZ-* branches"

  sync_check:
    - For each pending issue, check if related code already exists
    - For each "In Progress" issue, verify branch exists and has commits
    - For merged branches, verify Jira status is "Done"
```

**Agent**: dev-workflow-agent

---

### /complete-issue [CLNZ-XXX]

Mark an issue as complete and auto-suggest next issue.

**Usage**:
```
/complete-issue CLNZ-170
/complete-issue          # Completes current active issue
```

**What it does**:
1. Updates workflow-state.md (marks completed, clears current_issue)
2. Adds to Completed Issues Log
3. Transitions Jira to "Done"
4. Calculates sprint progress
5. **Auto-suggests next issue**: "Next: CLNZ-XXX - [Title]"

**Agent**: dev-workflow-agent

---

### /list-issues [status]

List available Jira issues from the backlog.

**Usage**:
```
/list-issues
/list-issues todo
/list-issues in-progress
/list-issues high-priority
```

**JQL Queries Used**:
```sql
-- All To Do
project = CLNZ AND status = "To Do" ORDER BY priority DESC

-- High Priority
project = CLNZ AND priority in (High, Highest) AND status = "To Do"

-- Current Sprint
project = CLNZ AND sprint in openSprints()
```

**Agent**: dev-workflow-agent

---

### /issue-status [CLNZ-XXX]

Check the current status of a Jira issue.

**Usage**:
```
/issue-status CLNZ-170
```

**Agent**: dev-workflow-agent

---

## Development Commands

### /start-dev

Begin development on the current issue (after /pick-issue).

**Usage**:
```
/start-dev
```

**What it does**:
1. Confirms branch is created
2. Opens relevant service files
3. Sets up development context
4. Displays acceptance criteria as checklist

**Agent**: Appropriate service agent (identity-agent, activity-agent, etc.)

---

### /self-review

Run the self-review checklist before requesting PR.

**Usage**:
```
/self-review
```

**Checklist Items**:
- [ ] Code follows project conventions
- [ ] No TypeScript `any` types
- [ ] ESLint passing with 0 errors
- [ ] Proper error handling
- [ ] Unit tests written (≥80% coverage)
- [ ] Integration tests passing
- [ ] No security vulnerabilities
- [ ] Event schemas followed

**Agent**: Current service agent

---

## Testing Commands

### /run-tests

Execute the complete test suite for current changes.

**Usage**:
```
/run-tests
/run-tests unit
/run-tests integration
/run-tests all
```

**What it does**:
1. Runs unit tests
2. Runs integration tests
3. Generates coverage report
4. Reports pass/fail status

**Agent**: testing-agent

---

### /test-coverage

Check test coverage for current changes.

**Usage**:
```
/test-coverage
```

**Targets**:
- Unit tests: ≥80% coverage
- Integration tests: ≥70% coverage
- Critical paths: 100% coverage

**Agent**: testing-agent

---

## Pull Request Commands

### /create-pr

Create a comprehensive pull request.

**Usage**:
```
/create-pr
```

**What it does**:
1. Gathers changes from current branch
2. Fetches Jira issue details
3. Generates PR description from template
4. Creates PR targeting develop branch
5. Links PR to Jira issue
6. Requests review from code-reviewer-agent

**Agent**: pr-manager-agent

---

### /pr-status

Check current PR status.

**Usage**:
```
/pr-status
```

**Shows**:
- PR approval status
- CI check status
- Review comments
- Merge readiness

**Agent**: pr-manager-agent

---

### /request-review

Request code review for the current PR.

**Usage**:
```
/request-review
```

**What it does**:
1. Notifies code-reviewer-agent
2. Updates Jira to "In Review"
3. Starts multi-stage review process

**Agent**: pr-manager-agent

---

### /merge-pr

Merge the approved pull request.

**Usage**:
```
/merge-pr
```

**Requirements**:
- PR is approved
- All CI checks passing
- No merge conflicts

**What it does**:
1. Squash and merge to develop
2. Delete feature branch
3. Transition Jira to "Done"
4. Add completion comment

**Agent**: pr-manager-agent

---

## Code Review Commands

### /review-all

Run all review stages on current PR.

**Usage**:
```
/review-all
```

**Stages**:
1. Logic Review
2. Code Quality Review
3. Security Review
4. Performance Review

**Agent**: code-reviewer-agent

---

### /review-logic

Review implementation logic only.

**Usage**:
```
/review-logic
```

**Checks**:
- Implementation matches acceptance criteria
- Business logic correctness
- Edge cases handled
- Error scenarios covered

**Agent**: code-reviewer-agent

---

### /review-quality

Review code quality only.

**Usage**:
```
/review-quality
```

**Checks**:
- SOLID principles
- Naming conventions
- Code readability
- DRY compliance
- No code smells

**Agent**: code-reviewer-agent

---

### /review-security

Review security aspects only.

**Usage**:
```
/review-security
```

**Checks**:
- Injection vulnerabilities
- Authentication/Authorization
- Secrets management
- Input validation
- OWASP Top 10

**Agent**: code-reviewer-agent / security-agent

---

### /review-performance

Review performance aspects only.

**Usage**:
```
/review-performance
```

**Checks**:
- N+1 queries
- Database indexing
- Algorithm efficiency
- Memory management
- Caching usage

**Agent**: code-reviewer-agent

---

### /approve-pr

Approve the pull request after review passes.

**Usage**:
```
/approve-pr
```

**Agent**: code-reviewer-agent

---

### /request-changes [reason]

Request changes on the current PR.

**Usage**:
```
/request-changes "Missing unit tests for edge cases"
```

**What it does**:
1. Adds review comments to PR
2. Notifies development agent
3. Transitions Jira back to "In Progress"

**Agent**: code-reviewer-agent

---

## Complete Workflow Example

```bash
# Step 1: Pick an issue from backlog
/pick-issue CLNZ-170

# Step 2: Begin development
/start-dev

# Step 3: [Development happens...]

# Step 4: Self-review before PR
/self-review

# Step 5: Run tests
/run-tests

# Step 6: Create PR
/create-pr

# Step 7: Request review
/request-review

# Step 8: [Review happens...]
/review-all

# Step 9: If approved, merge
/merge-pr
```

## Dedicated Service Agents

The workflow automatically delegates development tasks to specialized agents based on issue content:

### Service Agent Mapping

| Agent | Service | Port | Trigger Keywords |
|-------|---------|------|------------------|
| **identity-agent** | identity-service | 3001 | Authentication, JWT, User, Login, RBAC, Role, Permission, Session, OAuth, SSO |
| **organization-agent** | organization-service | 3002 | Organization, Project, Hierarchy, Company, Tenant, Workspace, Team |
| **reference-agent** | reference-service | 3003 | Emission Factor, Master Data, Unit, Conversion, Reference Data, Lookup |
| **activity-agent** | activity-service | 3004 | Activity Data, Import, CSV, Excel, Bulk Upload, Data Collection, Validation |
| **calculation-agent** | calculation-service | 3005 | Calculation, GHG Protocol, Emission, Aggregation, Carbon, Scope 1/2/3 |
| **reporting-agent** | reporting-service | 3006 | Report, Export, Dashboard, PDF, Chart, Visualization, Analytics |
| **audit-agent** | audit-service | 3007 | Audit, Compliance, Logging, Trail, GDPR, Event Sourcing |
| **frontend-agent** | frontend | 3000 | UI, Component, React, Next.js, Page, Form, Modal, WCAG, Accessibility |
| **devops-agent** | infrastructure | - | Docker, CI/CD, Pipeline, Deployment, AWS, Terraform, Kubernetes |
| **testing-agent** | all services | - | Test, Coverage, E2E, Integration Test, Unit Test, Performance Test |
| **security-agent** | all services | - | Security, Vulnerability, OWASP, Penetration, Secrets, Encryption |
| **migration-agent** | data migration | - | Migration, ETL, Data Transform, Legacy, OLD to NEW |
| **architecture-agent** | cross-service | - | Architecture, Service Boundary, API Contract, Event Schema, DDD |

### Agent Delegation Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    AGENT DELEGATION FLOW                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. dev-workflow-agent picks Jira issue                                │
│                                                                         │
│  2. Analyze issue content (title, description, acceptance criteria)    │
│                                                                         │
│  3. Match keywords to service agents:                                  │
│     ┌──────────────────────────────────────────────────────────────┐  │
│     │ "JWT authentication" → identity-agent                         │  │
│     │ "CSV import"         → activity-agent                         │  │
│     │ "GHG calculations"   → calculation-agent                      │  │
│     │ "Dashboard UI"       → frontend-agent + reporting-agent       │  │
│     │ "Security audit"     → security-agent + audit-agent           │  │
│     └──────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  4. Delegate to primary agent with issue context                       │
│                                                                         │
│  5. Secondary agents consulted as needed:                              │
│     - testing-agent: Always for test coverage                          │
│     - security-agent: For auth/data handling code                      │
│     - architecture-agent: For cross-service changes                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Multi-Agent Collaboration

Some issues require multiple agents working together:

| Issue Type | Primary Agent | Supporting Agents |
|------------|---------------|-------------------|
| New API endpoint | Service agent (identity/org/etc) | testing-agent, security-agent |
| UI feature | frontend-agent | Service agent for API, testing-agent |
| Cross-service feature | architecture-agent | Multiple service agents |
| Security hardening | security-agent | All affected service agents |
| Performance optimization | calculation-agent/activity-agent | testing-agent, devops-agent |
| Infrastructure change | devops-agent | All service agents (for testing) |

---

## Configuration

### Jira Settings
```yaml
cloud_id: "321128eb-5b74-4a90-896a-2a44197f6673"
project_key: "CLNZ"
```

### GitHub Settings
```yaml
base_branch: "develop"
branch_prefix: "feature/CLNZ-"
```

### Review Settings
```yaml
required_stages:
  - logic
  - quality
stages_for_security:
  - security (when security-related)
stages_for_performance:
  - performance (when performance-critical)
```

## Troubleshooting

### Issue not found
```
Error: CLNZ-XXX not found
Solution: Verify issue key is correct and exists in Jira
```

### Branch already exists
```
Error: Branch feature/CLNZ-XXX already exists
Solution: Delete existing branch or continue with existing
```

### Tests failing
```
Error: Tests failed - cannot create PR
Solution: Fix failing tests before proceeding
```

### PR blocked
```
Error: PR cannot be merged
Solutions:
- Resolve merge conflicts
- Get required approvals
- Fix failing CI checks
```

---

**Document**: Workflow Commands Reference
**Version**: 1.0.0
**Last Updated**: November 2024
