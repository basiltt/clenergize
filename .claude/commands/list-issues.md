---
description: List available Jira issues from the backlog
argument-hint: [todo | in-progress | high-priority | sprint]
allowed-tools: mcp__atlassian__*
model: claude-opus-4-5-20251101
---

# List Issues Command

List Jira issues based on the specified filter.

## Arguments
- Filter: $ARGUMENTS (optional, defaults to "todo")
  - `todo` - All To Do issues
  - `in-progress` - Issues currently in progress
  - `high-priority` - High/Highest priority To Do issues
  - `sprint` - Issues in current sprint

## Jira Configuration
- Cloud ID: 321128eb-5b74-4a90-896a-2a44197f6673
- Project Key: CLNZ

## JQL Queries

Based on `$ARGUMENTS`, use mcp__atlassian__searchJiraIssuesUsingJql with:

### todo (default)
```
project = CLNZ AND status = "To Do" ORDER BY priority DESC, created ASC
```

### in-progress
```
project = CLNZ AND status = "In Progress" ORDER BY updated DESC
```

### high-priority
```
project = CLNZ AND priority in (High, Highest) AND status = "To Do" ORDER BY priority DESC
```

### sprint
```
project = CLNZ AND sprint in openSprints() ORDER BY priority DESC
```

## Output Format

Display results as:

```
## [Filter Name] Issues

| Key | Title | Priority | SP | Assignee |
|-----|-------|----------|----|---------|
| CLNZ-XXX | Title here | High | 5 | @user |
| ... | ... | ... | ... | ... |

Total: [X] issues, [Y] story points
```

If no issues found, display helpful message.
