---
description: Request changes on the current PR
argument-hint: <reason>
allowed-tools: Bash(gh:*), mcp__atlassian__*, Read, Write
model: claude-opus-4-5-20251101
---

# Request Changes Command

Request changes on the current pull request.

## Arguments
- Reason: $ARGUMENTS (required - description of changes needed)

## Steps

### 1. Get PR Info
```bash
gh pr view --json number,url,title,author
```

### 2. Submit Review with Changes Requested
```bash
gh pr review --request-changes --body "## Changes Requested

$ARGUMENTS

Please address the above issues and re-request review when ready."
```

### 3. Add PR Label
```bash
gh pr edit --add-label "changes-requested"
```

### 4. Update Jira
Transition issue back to "In Progress" using mcp__atlassian__transitionJiraIssue.

Add comment about the requested changes.

### 5. Update Workflow State
Update `.claude/workflow-state.md` to reflect the review feedback.

### 6. Display Summary

```
## Changes Requested

**PR**: #[number] - [title]
**Author**: @[author]

### Requested Changes
$ARGUMENTS

### Jira Status
Updated to: In Progress

### Next Steps for Author
1. Address the requested changes
2. Push new commits
3. Run `/request-review` again when ready

### For Reviewer
The author will re-request review when changes are addressed.
```
