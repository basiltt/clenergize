---
description: Check the current status of a Jira issue
argument-hint: <CLNZ-XXX>
allowed-tools: mcp__atlassian__*, Read, Bash(git:*)
model: claude-opus-4-5-20251101
---

# Issue Status Command

Check the detailed status of a specific Jira issue.

## Arguments
- Issue key: $ARGUMENTS (required, e.g., "CLNZ-170")

## Steps

### 1. Fetch Jira Issue
Use mcp__atlassian__getJiraIssue with:
- cloudId: 321128eb-5b74-4a90-896a-2a44197f6673
- issueIdOrKey: $ARGUMENTS

### 2. Check Code Status
- Look for related git branches: `git branch -a | grep "$ARGUMENTS"`
- Check for open PRs using `gh pr list --search "$ARGUMENTS"`
- Scan for related files in the codebase

### 3. Check Documentation
Read `.claude/issue-docs-mapping.md` to find linked documentation.

### 4. Display Status

```
## Issue: $ARGUMENTS

**Title**: [Issue title]
**Status**: [To Do | In Progress | In Review | Done]
**Priority**: [Priority]
**Story Points**: [SP]
**Assignee**: [Name or Unassigned]

### Description
[Issue description]

### Acceptance Criteria
- [ ] Criteria 1
- [ ] Criteria 2
- [ ] ...

### Code Status
- Branch: [branch name or "Not created"]
- PR: [PR link or "None"]
- Related files: [list of files]

### Documentation
- [Doc 1 link]
- [Doc 2 link]

### Dependencies
- Blocked by: [List or None]
- Blocks: [List or None]
```
