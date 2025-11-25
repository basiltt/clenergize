---
description: Execute the test suite for current changes
argument-hint: [unit | integration | e2e | all]
allowed-tools: Bash(npm:*), Bash(npx:*), Read
model: claude-opus-4-5-20251101
---

# Run Tests Command

Execute the test suite for the current service or changes.

## Arguments
- Test type: $ARGUMENTS (optional, defaults to "all")
  - `unit` - Run unit tests only
  - `integration` - Run integration tests only
  - `e2e` - Run end-to-end tests only
  - `all` - Run all tests

## Steps

### 1. Detect Current Service
Check current directory or recent changes to determine which service to test.

### 2. Run Tests Based on Type

#### Unit Tests ($ARGUMENTS = "unit" or "all")
```bash
npm run test
```

#### Integration Tests ($ARGUMENTS = "integration" or "all")
```bash
npm run test:integration
```

#### E2E Tests ($ARGUMENTS = "e2e" or "all")
```bash
npm run test:e2e
```

### 3. Generate Coverage Report
```bash
npm run test:cov
```

### 4. Display Results

```
## Test Results

### Unit Tests
- Total: [X] tests
- Passed: [Y]
- Failed: [Z]
- Duration: [T]ms

### Coverage
| Metric | Coverage | Target |
|--------|----------|--------|
| Statements | X% | 80% |
| Branches | X% | 80% |
| Functions | X% | 80% |
| Lines | X% | 80% |

### Failed Tests (if any)
1. [Test name]: [Error message]
2. ...

### Next Steps
- [Fix failing tests before PR]
- [Improve coverage in areas below target]
```
