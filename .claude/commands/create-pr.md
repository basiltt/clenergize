---
description: Create a comprehensive pull request
allowed-tools: Bash(git:*), Bash(gh:*), Read, mcp__atlassian__*
model: claude-sonnet-4-5-20250929
---

# Create PR Command

Create a comprehensive pull request for the current feature branch.

## Prerequisites
- Active issue from `/pick-issue`
- All tests passing
- Self-review completed

## Steps

### 1. Gather Context
Read `.claude/workflow-state.md` to get:
- Current issue (CLNZ-XXX)
- Feature branch name
- Related documentation

### 2. Get Git Info
```bash
git status
git log develop..HEAD --oneline
git diff develop --stat
```

### 3. Fetch Jira Details
Use mcp__atlassian__getJiraIssue to get:
- Issue title
- Acceptance criteria
- Story points

### 4. Generate PR Description

Use the PR template format:

```markdown
## Summary
[Brief description of changes]

## Related Issue
- Jira: [CLNZ-XXX](https://yourcompany.atlassian.net/browse/CLNZ-XXX)

## Changes Made
- [List of specific changes]

## Acceptance Criteria
- [x] [Criterion 1]
- [x] [Criterion 2]

## Test Plan
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
[Add screenshots for UI changes]

## Checklist
- [ ] Code follows project conventions
- [ ] Tests passing with >80% coverage
- [ ] No TypeScript `any` types
- [ ] Security review completed
- [ ] Documentation updated

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

### 5. Create PR
```bash
gh pr create --title "[CLNZ-XXX] [Title]" --body "[description]" --base develop
```

### 6. Link to Jira
Add a comment to the Jira issue with the PR link using mcp__atlassian__addCommentToJiraIssue.

### 7. Display PR Info
```
PR Created Successfully!

URL: [PR URL]
Title: [CLNZ-XXX] [Title]
Base: develop
Head: feature/CLNZ-XXX-description

Next steps:
1. Run `/request-review` to request code review
2. Wait for CI checks to pass
3. Address any review comments
```
