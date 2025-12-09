---
description: Review implementation logic only
allowed-tools: Read, Grep, Glob, mcp__atlassian__*, Task
model: claude-sonnet-4-5-20250929
---

# Review Logic Command

Review the implementation logic of current changes against acceptance criteria.

## Steps

### 1. Get Acceptance Criteria
Fetch the Jira issue to get acceptance criteria using mcp__atlassian__getJiraIssue.

### 2. Analyze Changed Files
```bash
git diff develop --name-only
```

### 3. Review Each Criterion

For each acceptance criterion:
1. Find the implementing code
2. Verify the logic is correct
3. Check edge cases are handled
4. Verify error scenarios

### 4. Generate Report

```
## Logic Review Report

### Acceptance Criteria Check

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | [Criterion text] | ✅/❌ | [Notes] |
| 2 | [Criterion text] | ✅/❌ | [Notes] |
| ... | ... | ... | ... |

### Business Logic Analysis
- [Finding 1]
- [Finding 2]

### Edge Cases
| Scenario | Handled? | Location |
|----------|----------|----------|
| [Edge case 1] | ✅/❌ | [file:line] |
| [Edge case 2] | ✅/❌ | [file:line] |

### Error Handling
- [Error scenario 1]: [How handled]
- [Error scenario 2]: [How handled]

### Recommendation
**Status**: [PASS / NEEDS_WORK]
**Action Items**:
1. [Item if any]
```
