---
description: Merge the approved pull request
allowed-tools: Bash(gh:*), Bash(git:*), mcp__atlassian__*, Read, Write
model: claude-opus-4-5-20251101
---

# Merge PR Command

Merge the approved pull request.

## Prerequisites
- PR is approved
- All CI checks passing
- No merge conflicts

## Steps

### 1. Verify PR is Ready
```bash
gh pr view --json reviewDecision,statusCheckRollup,mergeable
```

Check:
- reviewDecision = "APPROVED"
- All status checks passed
- mergeable = true

If any check fails, display what's blocking and exit.

### 2. Squash and Merge
```bash
gh pr merge --squash --delete-branch
```

### 3. Update Jira
Transition the issue to "Done" using mcp__atlassian__transitionJiraIssue.

Add completion comment with:
- PR link
- Merge commit hash
- Summary of changes

### 4. Update Workflow State
Update `.claude/workflow-state.md`:
- Mark issue as completed
- Clear current_issue
- Add to completed issues log

### 5. Clean Up Local
```bash
git checkout develop
git pull origin develop
```

### 6. Display Summary

```
## PR Merged Successfully! 🎉

**PR**: #[number] - [title]
**Merged to**: develop
**Commit**: [hash]

### Jira
Issue [CLNZ-XXX] transitioned to Done

### Cleanup
- Feature branch deleted
- Local branch switched to develop
- Latest changes pulled

### Sprint Progress
[X/Y] SP completed ([Z]%)

### Next Issue
Use `/pick-issue next` to start the next issue from the queue.
```
