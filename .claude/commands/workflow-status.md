---
description: Show overall workflow progress and current state
allowed-tools: Read, Glob, Grep, Bash(git:*), mcp__atlassian__*
model: claude-opus-4-5-20251101
---

# Workflow Status Command

Display the current workflow status including sprint progress, active issues, and code sync status.

## Steps

### 1. Read Workflow State
Read `.claude/workflow-state.md` to get:
- Current sprint info
- Active issue (if any)
- Issue queue
- Completed issues

### 2. Check Code Sync Status
Scan for potential mismatches:
- Orphaned implementations: Code exists but Jira still "To Do"
- Incomplete closures: Branch/PR merged but Jira not "Done"
- Abandoned work: Feature branches with no recent commits

Scan locations:
- `NEW/{service-name}/src/` for service implementations
- `NEW/frontend/src/` for frontend components
- `docker-compose*.yml` for infrastructure changes
- `.github/workflows/` for CI/CD changes

### 3. Display Status Report

Format the output as:

```
## Sprint Status: [Sprint Name]
Progress: [X/Y] story points ([Z]%)

## Current Issue
[Issue key]: [Title]
Branch: feature/CLNZ-XXX-description
Agent: [assigned agent]
Status: [in_progress/blocked/review]

## Next Issues in Queue
1. [CLNZ-XXX]: [Title] ([X] SP)
2. [CLNZ-XXX]: [Title] ([X] SP)
3. [CLNZ-XXX]: [Title] ([X] SP)

## Code Sync Warnings
- [Any orphaned implementations or mismatches]

## Blocked Issues
- [Issues waiting for dependencies]
```

### 4. Calculate Overall Progress
Show overall completion: X/340 SP total for Phase 1.
