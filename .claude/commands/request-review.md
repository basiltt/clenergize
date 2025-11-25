---
description: Request code review for the current PR
allowed-tools: Bash(gh:*), mcp__atlassian__*, Read, Write, Task
model: claude-opus-4-5-20251101
---

# Request Review Command

Request code review for the current pull request.

## Steps

### 1. Get PR Info
```bash
gh pr view --json number,url,title
```

### 2. Request Reviewers
Based on the changed files, request appropriate reviewers:

```bash
# Request review from team
gh pr edit --add-reviewer @security-lead,@architecture-lead
```

### 3. Update Jira Status
Transition the Jira issue to "In Review" using mcp__atlassian__transitionJiraIssue.

### 4. Trigger Code Review Agent
Use the Task tool to spawn the code-reviewer-agent with:
- PR number and URL
- Changed files summary
- Issue acceptance criteria

The code-reviewer-agent will perform:
1. Logic review
2. Code quality review
3. Security review (if applicable)
4. Performance review (if applicable)

### 5. Add PR Comment
```bash
gh pr comment --body "🔍 Code review requested. Automated review in progress."
```

### 6. Display Status

```
## Review Requested

**PR**: #[number] - [title]
**URL**: [url]

### Reviewers Assigned
- @security-lead (if security-related)
- @architecture-lead (if architecture changes)
- @team-member

### Jira Status
Updated to: In Review

### Automated Review
Code-reviewer-agent triggered. Review stages:
- [ ] Logic Review
- [ ] Code Quality Review
- [ ] Security Review
- [ ] Performance Review

You will be notified when review is complete.
```
