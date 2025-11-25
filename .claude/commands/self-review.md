---
description: Run the self-review checklist before requesting PR
allowed-tools: Read, Bash(npm:*), Bash(git:*), Grep, Glob
model: claude-opus-4-5-20251101
---

# Self-Review Command

Run a comprehensive self-review checklist before creating a PR.

## Steps

### 1. Code Quality Checks

Run and report results for:

```bash
# ESLint
npm run lint

# TypeScript compilation
npm run build

# Check for 'any' types
grep -rn ": any" src/ --include="*.ts" | head -20
```

### 2. Test Coverage Check

```bash
npm run test:cov
```

Verify coverage meets targets:
- Unit tests: ≥80%
- Critical paths: 100%

### 3. Security Scan

```bash
# Check for hardcoded secrets
grep -rn "password.*=" src/ --include="*.ts"
grep -rn "secret.*=" src/ --include="*.ts"
grep -rn "api[_-]?key" src/ --include="*.ts"

# Dependency vulnerabilities
npm audit
```

### 4. Generate Self-Review Report

```
## Self-Review Report

### Code Quality
- [ ] ESLint: [PASS/FAIL] - [X] errors, [Y] warnings
- [ ] TypeScript: [PASS/FAIL] - No compilation errors
- [ ] No `any` types: [PASS/FAIL] - [X] found

### Test Coverage
- [ ] Unit Tests: [X]% (target: 80%)
- [ ] All tests passing: [PASS/FAIL]

### Security
- [ ] No hardcoded secrets: [PASS/FAIL]
- [ ] npm audit: [PASS/FAIL] - [X] vulnerabilities

### Code Standards
- [ ] Follows DDD patterns
- [ ] Proper error handling
- [ ] Event schemas followed
- [ ] Logging with correlation IDs

### Ready for PR: [YES/NO]
```

If any checks fail, provide specific remediation steps.
