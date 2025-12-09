---
description: Begin development on the current issue (after /pick-issue)
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(git:*), Task
model: claude-sonnet-4-5-20250929
---

# Start Development Command

Begin active development on the currently picked issue.

## Prerequisites
Must have run `/pick-issue` first to have an active issue.

## Steps

### 1. Verify Active Issue
Read `.claude/workflow-state.md` and confirm:
- There is a current_issue set
- The branch exists and is checked out
- Status is "in_progress"

If no active issue, prompt user to run `/pick-issue` first.

### 2. Load Issue Context
- Fetch the Jira issue details
- Load all linked documentation from `.claude/issue-docs-mapping.md`
- Review acceptance criteria

### 3. Analyze Service Context
Based on the issue, identify:
- Which service(s) are involved
- Which modules need to be created/modified
- Related existing code patterns

### 4. Display Development Checklist

```
## Development Checklist for [CLNZ-XXX]

### Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] ...

### Files to Create/Modify
- [ ] NEW/[service]/src/[path]/[file].ts
- [ ] ...

### Tests to Write
- [ ] Unit tests for [component]
- [ ] Integration tests for [endpoint]

### Documentation to Update
- [ ] API documentation
- [ ] README if needed

### Pre-PR Checklist
- [ ] Code follows project conventions
- [ ] No TypeScript `any` types
- [ ] ESLint passing with 0 errors
- [ ] Unit tests written (>80% coverage)
- [ ] Integration tests passing
```

### 5. Delegate to Service Agent
Use Task tool to delegate to the appropriate service agent based on issue keywords:
- identity-agent, organization-agent, reference-agent, etc.

The service agent will handle the actual implementation.
