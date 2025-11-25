---
description: Pick a Jira issue and start the development workflow
argument-hint: <CLNZ-XXX | next | auto>
allowed-tools: Bash(git:*), mcp__atlassian__*, Read, Glob, Grep, Write, Edit, Task
model: claude-sonnet-4-5-20250929
---

# Pick Issue Command

You are executing the `/pick-issue` workflow command. Pick the Jira issue specified by the user and start the development workflow.

## Arguments
- Issue key: $ARGUMENTS (e.g., "CLNZ-170", "next", or "auto")

## Workflow Steps

### Step 1: Read Workflow State
Read `.claude/workflow-state.md` to check:
- If there's already an issue in progress (block if so)
- Get the current sprint info
- Get the issue queue if "next" or "auto" is specified

### Step 2: Determine the Issue
- If `$ARGUMENTS` is a specific issue key (CLNZ-XXX): Use that issue
- If `$ARGUMENTS` is "next" or "auto": Get the first pending issue from the queue in workflow-state.md
- If `$ARGUMENTS` is empty: Ask the user which issue to pick

### Step 3: Check for Existing Code
Before starting development, scan for existing implementations:
- Check git branches: `git branch -a | grep "feature/CLNZ-{issue_id}"`
- Scan NEW/{service}/src/ for related modules
- Check docker-compose.dev.yml for service definitions
- Search commit messages for the issue ID

If existing code is found, warn the user and offer options:
1. Continue from existing code (recommended)
2. Start fresh (archive existing branch)
3. Review existing implementation first

### Step 4: Load Documentation
Read `.claude/issue-docs-mapping.md` to find all linked documentation for this issue and load them.

### Step 5: Fetch Jira Details
Use the Atlassian MCP tools to get the issue details:
- mcp__atlassian__getJiraIssue with cloudId "321128eb-5b74-4a90-896a-2a44197f6673"
- Get acceptance criteria, description, priority

### Step 6: Validate Dependencies
Check if any dependent issues need to be completed first.

### Step 7: Create Feature Branch
Create or switch to the feature branch:
```bash
git checkout -b feature/CLNZ-{issue_id}-{short-description}
```
Or use existing branch if found.

### Step 8: Update Workflow State
Update `.claude/workflow-state.md`:
- Set current_issue to this issue
- Mark status as "in_progress"
- Record the branch name

### Step 9: Transition Jira
Use mcp__atlassian__transitionJiraIssue to move the issue to "In Progress".

### Step 10: Display Context
Show the user:
- Issue details (title, description, acceptance criteria)
- Loaded documentation references
- Existing code found (if any)
- Recommended service agent to delegate to

### Step 11: Delegate to Agent
Based on the issue content, recommend delegating to the appropriate service agent:
- identity-agent: Authentication, JWT, User, Login, RBAC
- organization-agent: Organization, Project, Hierarchy
- reference-agent: Emission Factor, Master Data, Unit
- activity-agent: Activity Data, Import, CSV, Excel
- calculation-agent: Calculation, GHG Protocol, Emission
- reporting-agent: Report, Export, Dashboard
- audit-agent: Audit, Compliance, Logging
- frontend-agent: UI, Component, React, Next.js
- devops-agent: Docker, CI/CD, Pipeline
- testing-agent: Test, Coverage, E2E

## Configuration
- Jira Cloud ID: 321128eb-5b74-4a90-896a-2a44197f6673
- Project Key: CLNZ
- Base Branch: develop
- Branch Prefix: feature/CLNZ-
