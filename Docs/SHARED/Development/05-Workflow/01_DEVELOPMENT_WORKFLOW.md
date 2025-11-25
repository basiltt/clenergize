# Clenergize V3 - Multi-Agent Development Workflow

> **Version**: 1.0.0
> **Last Updated**: November 2024
> **Model**: Claude Opus 4.5 (All Agents)

## Overview

This document defines the automated multi-agent development workflow that integrates Jira issue tracking, GitHub version control, multi-stage code review, automated testing, and PR management.

## Workflow Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         DEVELOPMENT WORKFLOW                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐│
│  │    JIRA     │────▶│   GITHUB    │────▶│   DEVELOP   │────▶│    TEST     ││
│  │  Pick Issue │     │Create Branch│     │  Implement  │     │  Validate   ││
│  └─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘│
│         │                                       │                   │        │
│         ▼                                       ▼                   ▼        │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐│
│  │   UPDATE    │◀────│    MERGE    │◀────│  REVIEW PR  │◀────│  CREATE PR  ││
│  │ Jira Status │     │  to develop │     │Multi-Stage  │     │Comprehensive││
│  └─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘│
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Agent Responsibilities

### 1. Development Agent (Service-Specific)
- **Trigger**: `/start-task CLNZ-XXX`
- **Responsibilities**:
  - Fetch Jira issue details
  - Create feature branch
  - Implement the solution
  - Write unit tests
  - Run local tests
  - Self-review code quality

### 2. Code Reviewer Agent
- **Trigger**: Automated after PR creation
- **Responsibilities**:
  - Multi-stage code review:
    1. **Logic Review**: Verify implementation matches requirements
    2. **Code Quality**: Check patterns, naming, structure
    3. **Security Review**: Identify vulnerabilities
    4. **Performance Review**: Check for bottlenecks
  - Request changes if needed
  - Approve when ready

### 3. PR Manager Agent
- **Trigger**: After development complete
- **Responsibilities**:
  - Create comprehensive PR with:
    - Summary of changes
    - Test plan
    - Screenshots (if UI)
    - Breaking changes
  - Link PR to Jira issue
  - Request reviews
  - Handle merge after approval
  - Update Jira status

## Detailed Workflow Steps

### Phase 1: Issue Selection and Setup

```yaml
Step 1.1 - Pick Jira Issue:
  Command: /pick-issue CLNZ-XXX
  Actions:
    - Fetch issue details from Jira (mcp__atlassian__getJiraIssue)
    - Validate issue status is "To Do" or "Ready for Dev"
    - Display acceptance criteria
    - Confirm with user before proceeding

Step 1.2 - Create Feature Branch:
  Branch Naming: feature/CLNZ-XXX-brief-description
  Actions:
    - git checkout develop
    - git pull origin develop
    - git checkout -b feature/CLNZ-XXX-description
    - Update Jira status to "In Progress" (mcp__atlassian__transitionJiraIssue)
```

### Phase 2: Development

```yaml
Step 2.1 - Understand Requirements:
  Actions:
    - Parse acceptance criteria from Jira issue
    - Identify affected services
    - Plan implementation approach
    - Create todo list for tracking

Step 2.2 - Implement Solution:
  Actions:
    - Write production code
    - Follow coding standards (Docs/SHARED/Development/02-Standards/)
    - Use appropriate design patterns
    - Handle edge cases
    - Add proper error handling
    - Use service templates (Docs/SHARED/Development/03-Templates/)

Step 2.3 - Self-Review:
  Checklist:
    - [ ] Code follows project conventions
    - [ ] No hardcoded values
    - [ ] Proper typing (no 'any')
    - [ ] Error handling complete
    - [ ] Logging added where appropriate
    - [ ] No security vulnerabilities
    - [ ] Event schemas followed (Docs/REFERENCE/Event-Schemas/)
```

### Phase 3: Testing

```yaml
Step 3.1 - Unit Tests:
  Reference: Docs/SHARED/TESTING/02_Unit_Testing_Guide.md
  Requirements:
    - Minimum 80% coverage for new code
    - Test all edge cases
    - Test error scenarios
    - Mock external dependencies

Step 3.2 - Integration Tests:
  Reference: Docs/SHARED/TESTING/03_Integration_Testing_Guide.md
  Requirements:
    - Test API endpoints
    - Test database operations
    - Test event publishing/consuming

Step 3.3 - Flow Tests:
  Reference: Docs/SHARED/TESTING/05_E2E_Testing_Guide.md
  Requirements:
    - Test complete user flows
    - Test cross-service interactions
    - Validate end-to-end scenarios

Step 3.4 - Run All Tests:
  Command: npm test
  Actions:
    - Execute unit tests
    - Execute integration tests
    - Generate coverage report
    - Fail if coverage < 80%
```

### Phase 4: Code Review (Multi-Stage)

```yaml
Stage 1 - Logic Review:
  Reviewer: Code Reviewer Agent
  Checks:
    - Implementation matches acceptance criteria
    - Business logic is correct
    - Edge cases handled
    - No logical errors

Stage 2 - Code Quality Review:
  Reviewer: Code Reviewer Agent
  Reference: Docs/SHARED/Development/02-Standards/01_Coding_Standards.md
  Checks:
    - Follows SOLID principles
    - Proper naming conventions
    - Code is readable and maintainable
    - No code smells
    - DRY principle followed

Stage 3 - Security Review:
  Reviewer: Security Agent (if security-related)
  Reference: Docs/SHARED/SECURITY/
  Checks:
    - No injection vulnerabilities
    - Proper authentication/authorization
    - Secrets properly managed
    - Input validation complete

Stage 4 - Performance Review:
  Reviewer: Code Reviewer Agent
  Reference: Docs/SHARED/Operations/PERFORMANCE_TARGETS.md
  Checks:
    - No N+1 queries
    - Proper indexing used
    - No memory leaks
    - Efficient algorithms
```

### Phase 5: Pull Request Management

```yaml
Step 5.1 - Create Pull Request:
  Template: .github/PULL_REQUEST_TEMPLATE.md
  Contents:
    - Summary of changes
    - Jira ticket link (CLNZ-XXX)
    - Test plan
    - Screenshots (if applicable)
    - Checklist completion
    - Breaking changes noted

Step 5.2 - Request Reviews:
  Actions:
    - Auto-assign based on CODEOWNERS
    - Notify reviewers via GitHub
    - Add appropriate labels

Step 5.3 - Address Feedback:
  Actions:
    - Review comments from Code Reviewer Agent
    - Make requested changes
    - Push updates
    - Re-request review

Step 5.4 - Merge PR:
  Requirements:
    - All checks passing
    - Approved by reviewer
    - No merge conflicts
  Actions:
    - Squash and merge to develop
    - Delete feature branch
    - Update Jira to "Done" (mcp__atlassian__transitionJiraIssue)
```

## Agent Handoff Protocol

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AGENT HANDOFF FLOW                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   User                                                                      │
│     │                                                                       │
│     ▼                                                                       │
│   ┌─────────────────┐                                                       │
│   │  Dev Workflow   │  /pick-issue CLNZ-XXX                               │
│   │     Agent       │────────────────────────────────────────┐             │
│   └────────┬────────┘                                        │             │
│            │                                                 │             │
│            ▼                                                 │             │
│   ┌─────────────────┐     ┌─────────────────┐               │             │
│   │ Service Agent   │────▶│ Testing Agent   │               │             │
│   │ (Identity/Org/  │     │                 │               │             │
│   │  Activity/etc)  │     └────────┬────────┘               │             │
│   └─────────────────┘              │                        │             │
│                                    ▼                        │             │
│                           ┌─────────────────┐               │             │
│                           │  PR Manager     │◀──────────────┘             │
│                           │     Agent       │                             │
│                           └────────┬────────┘                             │
│                                    │                                       │
│                                    ▼                                       │
│                           ┌─────────────────┐                             │
│                           │  Code Reviewer  │                             │
│                           │     Agent       │                             │
│                           └────────┬────────┘                             │
│                                    │                                       │
│              ┌─────────────────────┴─────────────────────┐                │
│              │                                           │                │
│              ▼                                           ▼                │
│   ┌─────────────────┐                         ┌─────────────────┐        │
│   │ Changes Required│                         │    Approved     │        │
│   │ → Back to Dev   │                         │ → Merge PR      │        │
│   └─────────────────┘                         │ → Update Jira   │        │
│                                               └─────────────────┘        │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Configuration

### Jira Configuration

```yaml
jira:
  cloud_id: "321128eb-5b74-4a90-896a-2a44197f6673"
  project_key: "CLNZ"
  project_name: "Clenergize"
  transitions:
    to_do: "To Do"
    in_progress: "In Progress"
    in_review: "In Review"
    done: "Done"
  issue_types:
    - Epic
    - Story
    - Task
    - Bug
    - Subtask
```

### GitHub Configuration

```yaml
github:
  repository: "ClenergizeV3"
  base_branch: "develop"
  protected_branches:
    - main
    - develop
  branch_naming: "feature/CLNZ-{issue_key}-{brief_description}"
  require_pr: true
  require_review: true
```

### MCP Servers Used

| Server | Purpose | Key Tools |
|--------|---------|-----------|
| `atlassian` | Jira integration | `getJiraIssue`, `transitionJiraIssue`, `searchJiraIssuesUsingJql` |
| `filesystem` | File operations | `read_text_file`, `write_file`, `edit_file` |
| `memory` | Context persistence | `create_entities`, `search_nodes` |

## Slash Commands Reference

> **Note**: All slash commands are individual `.md` files in `.claude/commands/`. Each filename becomes the command name.
> See `.claude/commands/README.md` for the complete command reference.

### Development Commands

| Command | Description | Agent |
|---------|-------------|-------|
| `/pick-issue CLNZ-XXX` | Pick and start a Jira issue | Dev Workflow |
| `/start-dev` | Begin development on current issue | Service Agent |
| `/self-review` | Run self-review checklist | Service Agent |
| `/run-tests` | Run all tests with coverage | Testing Agent |

### PR Commands

| Command | Description | Agent |
|---------|-------------|-------|
| `/create-pr` | Create PR with template | PR Manager |
| `/request-review` | Request code review | PR Manager |
| `/merge-pr` | Merge approved PR | PR Manager |

### Review Commands

| Command | Description | Agent |
|---------|-------------|-------|
| `/review-logic` | Review implementation logic | Code Reviewer |
| `/review-quality` | Review code quality | Code Reviewer |
| `/review-security` | Review security aspects | Security Agent |
| `/review-all` | Run all review stages | Code Reviewer |
| `/approve-pr` | Approve pull request | Code Reviewer |
| `/request-changes` | Request changes on PR | Code Reviewer |

## Error Handling

### Common Scenarios

| Scenario | Action |
|----------|--------|
| Tests fail | Block PR, notify developer, provide failure details |
| Review rejected | Return to development, provide feedback |
| Merge conflict | Alert developer, provide resolution guidance |
| Jira unavailable | Continue with local tracking, sync when available |

### Rollback Procedure

If issues are found after merge:
1. Create hotfix branch from develop
2. Fix the issue
3. Fast-track review (1 approval minimum)
4. Merge to develop
5. Update Jira with resolution

## Getting Started

### Quick Start

```bash
# 1. Pick an issue from Jira backlog
/pick-issue CLNZ-170

# 2. Development happens - agent creates branch, implements, tests

# 3. Create PR when ready
/create-pr

# 4. Review process runs
# Code Reviewer Agent performs multi-stage review

# 5. Merge after approval
/merge-pr
```

### Full Workflow Example

```bash
# Step 1: Start with a Jira issue
User: /pick-issue CLNZ-170

# Agent fetches issue: "CLNZ-303.1 - Create file parser for CSV/Excel"
# Creates branch: feature/CLNZ-170-csv-excel-parser
# Updates Jira status to "In Progress"

# Step 2: Development
# Agent implements the CSV/Excel parser
# Writes unit tests for parser functionality
# Runs self-review checklist

# Step 3: Testing
/run-tests
# All tests pass with 85% coverage

# Step 4: Create PR
/create-pr
# PR created with comprehensive description
# Review requested from Code Reviewer Agent

# Step 5: Review
# Code Reviewer Agent performs:
# - Logic review: PASS
# - Quality review: PASS
# - Security review: PASS (no security concerns)
# - Performance review: PASS

# Step 6: Merge
/merge-pr
# PR merged to develop
# Branch deleted
# Jira updated to "Done"
```

## Related Documentation

- [Coding Standards](../02-Standards/01_Coding_Standards.md)
- [Git Workflow](../02-Standards/02_Git_Workflow.md)
- [Code Review Policy](../02-Standards/03_Code_Review_Policy.md)
- [Testing Strategy](../../TESTING/01_Testing_Strategy.md)
- [Service Specifications](../../../CURRENT/02-Service-Specifications/)
- [Event Schemas](../../../REFERENCE/Event-Schemas/)

---

**Document Status**: Active
**Owner**: Master Coordinator Agent
**Review Cycle**: Monthly
