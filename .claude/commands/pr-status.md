---
description: Check current PR status
allowed-tools: Bash(gh:*), Read, mcp__atlassian__*
model: claude-opus-4-5-20251101
---

# PR Status Command

Check the status of the current pull request.

## Steps

### 1. Get Current Branch
```bash
git branch --show-current
```

### 2. Check PR Status
```bash
gh pr view --json number,title,state,reviewDecision,statusCheckRollup,mergeable,url
```

### 3. Get Review Comments
```bash
gh pr view --json reviews,comments
```

### 4. Check CI Status
```bash
gh pr checks
```

### 5. Display Status Report

```
## PR Status

**PR**: #[number] - [title]
**URL**: [url]
**State**: [open/closed/merged]

### Review Status
- Decision: [APPROVED/CHANGES_REQUESTED/PENDING]
- Reviewers:
  - @reviewer1: [approved/requested changes/pending]
  - @reviewer2: [approved/requested changes/pending]

### CI Checks
| Check | Status |
|-------|--------|
| Build | ✅/❌/⏳ |
| Tests | ✅/❌/⏳ |
| Lint | ✅/❌/⏳ |
| Security | ✅/❌/⏳ |

### Comments/Feedback
- [List of unresolved comments]

### Merge Status
- Mergeable: [YES/NO]
- Conflicts: [None/List conflicts]

### Next Steps
- [Based on current status, suggest next action]
```
