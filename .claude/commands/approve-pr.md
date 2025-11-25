---
description: Approve the pull request after review passes
allowed-tools: Bash(gh:*), mcp__atlassian__*
model: claude-opus-4-5-20251101
---

# Approve PR Command

Approve the current pull request after all review stages pass.

## Prerequisites
- All review stages completed
- No blocking issues identified
- CI checks passing

## Steps

### 1. Verify Review Status
Check that all reviews passed:
- Logic review: PASS
- Quality review: PASS
- Security review: PASS (if applicable)
- Performance review: PASS (if applicable)

### 2. Approve PR
```bash
gh pr review --approve --body "✅ Code review passed. All checks completed successfully.

**Review Summary:**
- Logic: ✅ Acceptance criteria met
- Quality: ✅ Code standards followed
- Security: ✅ No vulnerabilities found
- Performance: ✅ No concerns

Approved for merge."
```

### 3. Add PR Label
```bash
gh pr edit --add-label "approved"
```

### 4. Notify Author
```bash
gh pr comment --body "🎉 PR approved! Ready for merge."
```

### 5. Display Confirmation

```
## PR Approved ✅

**PR**: #[number] - [title]

### Review Summary
- Logic Review: PASS
- Quality Review: PASS
- Security Review: PASS
- Performance Review: PASS

### Next Steps
The PR is now approved and ready for merge.
Use `/merge-pr` to complete the merge.
```
