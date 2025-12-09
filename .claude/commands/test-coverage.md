---
description: Check test coverage for current changes
allowed-tools: Bash(npm:*), Read, Glob
model: claude-opus-4-5-20251101
---

# Test Coverage Command

Generate and analyze test coverage report for the current service.

## Coverage Targets
- Unit tests: ≥80% coverage
- Integration tests: ≥70% coverage
- Critical paths: 100% coverage

## Steps

### 1. Run Coverage Analysis
```bash
npm run test:cov
```

### 2. Parse Coverage Results
Read the coverage report and extract:
- Statement coverage
- Branch coverage
- Function coverage
- Line coverage

### 3. Identify Uncovered Code
Find files with low coverage:
- Files below 80% coverage
- Uncovered critical paths (auth, validation, calculations)

### 4. Display Coverage Report

```
## Coverage Report

### Overall Coverage
| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Statements | X% | 80% | ✅/❌ |
| Branches | X% | 80% | ✅/❌ |
| Functions | X% | 80% | ✅/❌ |
| Lines | X% | 80% | ✅/❌ |

### Files Needing Attention
| File | Coverage | Issue |
|------|----------|-------|
| src/auth/jwt.guard.ts | 45% | Missing edge cases |
| ... | ... | ... |

### Recommendations
1. Add tests for [specific uncovered code]
2. Test error handling in [file]
3. Cover edge cases in [function]

### Coverage Ready for PR: [YES/NO]
```
