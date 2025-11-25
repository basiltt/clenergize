---
description: Run all review stages on current PR
allowed-tools: Read, Grep, Glob, Bash(git:*), Bash(gh:*), Task
model: claude-sonnet-4-5-20250929
---

# Review All Command

Run all code review stages on the current PR.

## Review Stages

### 1. Logic Review
Check that implementation matches requirements:
- Read acceptance criteria from Jira
- Verify all criteria are implemented
- Check business logic correctness
- Verify edge cases are handled
- Check error scenarios

### 2. Code Quality Review
Analyze code quality:
- SOLID principles adherence
- Naming conventions
- Code readability
- DRY compliance
- No code smells
- TypeScript best practices

### 3. Security Review
Check for security issues:
- Injection vulnerabilities
- Authentication/Authorization
- Secrets management
- Input validation
- OWASP Top 10

### 4. Performance Review
Analyze performance:
- N+1 queries
- Database indexing
- Algorithm efficiency
- Memory management
- Caching usage

## Output Format

```
## Code Review Report

### 1. Logic Review ✅/❌
**Score**: [X/10]
- [Findings and recommendations]

### 2. Code Quality Review ✅/❌
**Score**: [X/10]
- [Findings and recommendations]

### 3. Security Review ✅/❌
**Score**: [X/10]
- [Findings and recommendations]

### 4. Performance Review ✅/❌
**Score**: [X/10]
- [Findings and recommendations]

---

## Summary
**Overall Score**: [X/40]
**Recommendation**: [APPROVE / REQUEST_CHANGES]

### Action Items (if any)
1. [High priority item]
2. [Medium priority item]
3. [Low priority item]
```

Use Task tool to spawn code-reviewer-agent for detailed analysis.
