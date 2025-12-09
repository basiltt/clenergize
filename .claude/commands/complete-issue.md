---
description: Mark an issue as complete and auto-suggest next issue
argument-hint: [CLNZ-XXX]
allowed-tools: Read, Write, Edit, Bash(git:*), mcp__atlassian__*
model: claude-opus-4-5-20251101
---

# Complete Issue Command

Mark the specified issue (or current active issue) as complete and suggest the next issue to work on.

## Arguments
- Issue key: $ARGUMENTS (optional - uses current active issue if not specified)

## Steps

### 1. Determine Issue to Complete
- If `$ARGUMENTS` is provided: Use that issue key
- If empty: Read `.claude/workflow-state.md` and use the current_issue

### 2. Update Workflow State
Update `.claude/workflow-state.md`:
- Mark the issue as "completed" in the queue
- Clear current_issue
- Add to Completed Issues Log with timestamp

### 3. Transition Jira to Done
Use mcp__atlassian__transitionJiraIssue to move the issue to "Done" status.

Add a completion comment with:
- Summary of what was implemented
- Branch/PR reference
- Time taken (if tracked)

### 4. Calculate Sprint Progress
Update the sprint progress percentage based on completed story points.

### 5. Auto-Suggest Next Issue
Look at the issue queue and suggest the next issue:
- Skip issues with unmet dependencies
- Check for existing code (previous attempts)
- Display: "Next: CLNZ-XXX - [Title]"

### 6. Display Summary
```
Issue [CLNZ-XXX] completed.
Sprint Progress: [X/Y] SP ([Z]%)

Suggested next issue:
CLNZ-XXX: [Title] ([X] SP)
Dependencies: [None | List]
Related docs: [Documentation links]

Use `/pick-issue next` to start the next issue.
```
