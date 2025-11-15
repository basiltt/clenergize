# Testing Commands

## Test Execution Commands

### /run-tests [service] [type]
Run tests for a specific service.

**Usage**: `/run-tests identity-service unit`

**Test Types**:
- `unit`: Unit tests only
- `integration`: Integration tests
- `e2e`: End-to-end tests
- `all`: All test types
- `smoke`: Quick smoke tests
- `regression`: Regression suite

**Output**:
```
Running Unit Tests: identity-service
Framework: Jest
Coverage: Enabled

Test Suites: 23 total
Tests: 145 total

PASS src/domain/services/user.service.spec.ts (2.3s)
  UserService
    ✓ should create user with valid data (45ms)
    ✓ should hash password before saving (23ms)
    ✓ should generate verification token (12ms)
    ✓ should publish UserCreated event (34ms)

PASS src/application/commands/auth.handler.spec.ts (1.8s)
  AuthCommandHandler
    ✓ should verify JWT with JWKS (156ms)
    ✓ should reject invalid tokens (23ms)
    ✓ should handle expired tokens (18ms)

Test Results:
├─ Passed: 143 ✅
├─ Failed: 2 ❌
├─ Skipped: 0
└─ Time: 14.3s

Coverage:
├─ Statements: 84.3% (1245/1478)
├─ Branches: 78.9% (234/296)
├─ Functions: 89.2% (145/162)
└─ Lines: 85.1% (1189/1397)
```

### /coverage-check [service] [threshold]
Check test coverage against thresholds.

**Usage**: `/coverage-check organization-service 80`

**Coverage Report**:
```
Coverage Analysis: organization-service
Threshold: 80%

File Coverage:
=====================================
✅ domain/entities/project.entity.ts          92.3%
✅ domain/services/hierarchy.service.ts       87.5%
⚠️ application/commands/create.handler.ts     76.8%
❌ infrastructure/repositories/project.repo.ts 68.2%
✅ infrastructure/controllers/project.ctrl.ts  94.1%

Uncovered Code:
📍 project.repo.ts:145-156
   Missing: Error handling in findWithHierarchy()
📍 project.repo.ts:234-245
   Missing: Transaction rollback scenario
📍 create.handler.ts:78-82
   Missing: Validation edge cases

Summary:
├─ Overall Coverage: 78.4% ❌ (Below 80% threshold)
├─ Critical Paths: 92.3% ✅
├─ Error Handlers: 65.4% ❌
└─ Action Required: Add 12 more tests

Suggested Tests:
1. Test transaction rollback in createProject()
2. Test hierarchy reference validation
3. Test concurrent update handling
```

### /run-e2e [flow]
Execute end-to-end test flows.

**Usage**: `/run-e2e user-registration`

**Available Flows**:
- `user-registration`: Complete signup flow
- `project-creation`: Create and configure project
- `emission-calculation`: Full calculation workflow
- `report-generation`: Generate and export report
- `data-import`: Bulk data import flow

**Execution**:
```
E2E Test: User Registration Flow
Framework: Cypress
Browser: Chrome 119
Environment: http://localhost:3000

Steps:
1. Navigate to signup page ✅ (1.2s)
2. Fill registration form ✅ (0.8s)
3. Submit form ✅ (2.3s)
4. Verify email sent ✅ (0.5s)
5. Click verification link ✅ (1.1s)
6. Complete profile ✅ (1.5s)
7. Land on dashboard ✅ (0.9s)

Screenshots:
- step-1-signup-page.png
- step-3-form-submitted.png
- step-7-dashboard.png

Video: cypress/videos/user-registration.mp4

Result: ✅ PASSED (8.3s)
```

### /performance-test [service] [scenario]
Run performance tests.

**Usage**: `/performance-test calculation-service bulk-calculation`

**Scenarios**:
- `baseline`: Normal load
- `stress`: 2x normal load
- `spike`: Sudden traffic spike
- `soak`: Extended duration
- `bulk-calculation`: Large batch processing

**Results**:
```
Performance Test: Bulk Calculation
Tool: K6
Duration: 5 minutes
Virtual Users: 100

Scenario Metrics:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Request Rate: 500 req/s
Data Processed: 50,000 activities

Response Times:
├─ p50: 45ms ✅
├─ p95: 156ms ✅
├─ p99: 423ms ⚠️ (target: <400ms)
└─ max: 1,234ms

Throughput:
├─ Success: 498 req/s (99.6%)
├─ Failed: 2 req/s (0.4%)
└─ Total: 150,000 requests

Resource Usage:
├─ CPU: 78% average, 92% peak
├─ Memory: 2.3GB average, 3.1GB peak
├─ Database: 234 connections peak
└─ Redis: 45MB cache size

Errors:
├─ Timeouts: 234 (0.15%)
├─ 500 errors: 12 (0.008%)
└─ Connection refused: 0

Bottlenecks Identified:
1. Database connection pool (increase to 300)
2. Redis cache misses (add warming)
3. Memory spike during aggregation
```

## Test Generation Commands

### /generate-tests [file]
Generate tests for a specific file.

**Usage**: `/generate-tests src/domain/services/calculation.service.ts`

**Generated**: `calculation.service.spec.ts`
```typescript
describe('CalculationService', () => {
  let service: CalculationService;
  let mockRepository: jest.Mocked<CalculationRepository>;
  let mockEventBus: jest.Mocked<EventBus>;

  beforeEach(() => {
    mockRepository = createMock<CalculationRepository>();
    mockEventBus = createMock<EventBus>();
    service = new CalculationService(mockRepository, mockEventBus);
  });

  describe('calculateEmissions', () => {
    it('should calculate emissions with valid data', async () => {
      // Arrange
      const activity = { quantity: 100, emissionFactor: 2.34 };
      mockRepository.findFactor.mockResolvedValue({ value: 2.34 });

      // Act
      const result = await service.calculateEmissions(activity);

      // Assert
      expect(result).toBe(234);
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'EmissionCalculated'
        })
      );
    });

    it('should handle missing emission factor', async () => {
      mockRepository.findFactor.mockResolvedValue(null);

      await expect(service.calculateEmissions({}))
        .rejects.toThrow('Emission factor not found');
    });

    // Generated: 15 more test cases...
  });
});
```

### /mutation-test [service]
Run mutation testing to verify test quality.

**Usage**: `/mutation-test identity-service`

**Mutation Report**:
```
Mutation Testing Report
Framework: Stryker
Service: identity-service

Mutations Applied: 234
Mutations Killed: 198 ✅
Mutations Survived: 36 ❌

Survived Mutations (Test Gaps):
1. auth.service.ts:45
   Original: if (user.status === 'ACTIVE')
   Mutation: if (user.status !== 'ACTIVE')
   Impact: Test missing for inactive user login

2. jwt.guard.ts:78
   Original: throw new UnauthorizedException()
   Mutation: return true
   Impact: Test missing for invalid token bypass

3. user.repository.ts:123
   Original: { email: email.toLowerCase() }
   Mutation: { email: email }
   Impact: Test missing for case sensitivity

Mutation Score: 84.6%
Quality Rating: Good (target: >80%)

Recommendations:
- Add test for inactive user authentication
- Add test for JWT guard bypass prevention
- Add test for email normalization
```

## Test Data Management

### /seed-test-data [scenario]
Seed database with test data scenarios.

**Usage**: `/seed-test-data performance-testing`

**Scenarios**:
- `minimal`: 10 users, 5 projects
- `standard`: 100 users, 50 projects
- `performance-testing`: 10k users, 1k projects
- `edge-cases`: Boundary and error conditions
- `demo`: Realistic demo data

**Seeding Process**:
```
Seeding: Performance Testing Dataset
Target: mongodb://localhost:27017/clenergize_test

Creating:
✅ 10,000 users (with varied roles)
✅ 500 organizations (hierarchical)
✅ 1,000 projects (distributed)
✅ 50,000 activities (mixed types)
✅ 25,000 calculations (pre-computed)
✅ 5,000 reports (various formats)

Relationships:
- Each org: 5-50 users
- Each project: 10-500 activities
- Each activity: 1-5 calculations

Special Cases:
- 10% deleted (soft)
- 5% with errors
- 15% incomplete data
- 20% edge date ranges

Seeding Complete: 2.3 minutes
Database Size: 1.2 GB
```

### /clean-test-data [service]
Clean test data from database.

**Usage**: `/clean-test-data organization-service`

**Cleaning Process**:
```
Test Data Cleanup
Service: organization-service
Database: clenergize_organization_test

Identifying Test Data:
- Pattern: *_test_*, *_e2e_*
- Created by: test users
- Marked: isTestData: true

Found:
- Projects: 234 test records
- Organizations: 45 test records
- Hierarchies: 89 test records

Cleaning...
✅ Deleted 368 documents
✅ Cleared test collections
✅ Reset sequences
✅ Cleaned Redis cache

Verification:
- Production data intact ✅
- Test data removed ✅
- Indexes preserved ✅
```

## Test Quality Commands

### /test-smell-detector [path]
Detect test smells and anti-patterns.

**Usage**: `/test-smell-detector src/test`

**Analysis**:
```
Test Smell Detection Report
===========================

Smells Detected:

1. Magic Numbers (12 occurrences)
   File: calculation.spec.ts:45
   Code: expect(result).toBe(234)
   Fix: Use named constants

2. Excessive Mocking (8 occurrences)
   File: service.spec.ts:12-45
   Impact: Brittle tests, hard to maintain
   Fix: Use integration tests

3. Test Interdependence (3 occurrences)
   File: auth.spec.ts:78, 92, 105
   Impact: Order-dependent failures
   Fix: Isolate test cases

4. Missing Assertions (5 occurrences)
   File: repository.spec.ts:234
   Impact: False positives
   Fix: Add expect() statements

5. Hardcoded Delays (2 occurrences)
   File: e2e.spec.ts:156
   Code: await sleep(5000)
   Fix: Use waitFor patterns

Quality Score: 7.2/10
Priority Fixes: Test interdependence, Missing assertions
```

### /test-flakiness [suite]
Detect and fix flaky tests.

**Usage**: `/test-flakiness e2e`

**Flakiness Report**:
```
Flaky Test Detection
Runs: 10 iterations
Suite: E2E Tests

Flaky Tests Found:

1. "should handle concurrent updates"
   Failure Rate: 30% (3/10)
   Reason: Race condition
   Line: concurrent.spec.ts:45
   Fix: Add proper synchronization

2. "should timeout after 5 seconds"
   Failure Rate: 20% (2/10)
   Reason: Hardcoded timeout
   Line: timeout.spec.ts:78
   Fix: Use configurable timeout

3. "should connect to external API"
   Failure Rate: 40% (4/10)
   Reason: Network dependency
   Line: api.spec.ts:123
   Fix: Mock external service

Stability Score: 73%
Action: Fix flaky tests before deployment
```

## Contract Testing Commands

### /contract-test [consumer] [provider]
Test API contracts between services.

**Usage**: `/contract-test frontend identity-service`

**Contract Validation**:
```
Contract Testing
Consumer: frontend
Provider: identity-service
Contract: auth-api-v1.json

Testing Endpoints:

POST /auth/login
✅ Request schema valid
✅ Response schema valid
✅ Status codes match
✅ Headers present

GET /auth/user/:id
✅ Request params valid
✅ Response schema valid
⚠️ Optional field 'avatar' not documented
✅ Error responses match

POST /auth/refresh
❌ Response schema mismatch
   Expected: { token, refreshToken }
   Actual: { accessToken, refreshToken }

Contract Compliance: 92%
Breaking Changes: 1
Warnings: 1
```

### /generate-mocks [service]
Generate mock services for testing.

**Usage**: `/generate-mocks identity-service`

**Generated Mocks**:
```typescript
// Generated: identity-service.mock.ts
export class IdentityServiceMock {
  private responses = new Map();

  // Auto-generated from OpenAPI
  async login(email: string, password: string) {
    return this.responses.get('login') || {
      token: 'mock-jwt-token',
      user: { id: 'user-123', email }
    };
  }

  // Configure responses
  setResponse(method: string, response: any) {
    this.responses.set(method, response);
  }

  // Verify calls
  verifyCalled(method: string, times: number = 1) {
    // Implementation
  }
}

// Usage in tests:
const identityMock = new IdentityServiceMock();
identityMock.setResponse('login', { error: 'Invalid' });
```

## Monitoring Commands

### /test-metrics [period]
Display testing metrics and trends.

**Usage**: `/test-metrics week`

**Dashboard**:
```
Testing Metrics Dashboard
Period: Last 7 Days
═════════════════════════════════════

Test Execution:
├─ Total Runs: 1,234
├─ Passed: 1,189 (96.4%)
├─ Failed: 45 (3.6%)
└─ Flaky: 12 (1%)

Coverage Trend:
Day 1: ████████░░ 78%
Day 2: ████████░░ 79%
Day 3: ████████░░ 80%
Day 4: █████████░ 82%
Day 5: █████████░ 83%
Day 6: █████████░ 84%
Day 7: █████████░ 85% ✅

Test Duration:
├─ Unit: 14s average
├─ Integration: 45s average
├─ E2E: 3m 23s average
└─ Total CI: 8m 45s

Top Failures:
1. auth.spec.ts: 12 failures
2. calculation.spec.ts: 8 failures
3. migration.spec.ts: 6 failures

New Tests Added: 45
Tests Removed: 12
Net Growth: +33
```

### /test-impact-analysis [commit]
Analyze which tests to run based on changes.

**Usage**: `/test-impact-analysis HEAD~1`

**Analysis**:
```
Test Impact Analysis
Commit: feat: update calculation algorithm
Files Changed: 5

Affected Components:
✓ calculation.service.ts
✓ emission.calculator.ts
✓ aggregation.helper.ts

Recommended Tests:
Required (directly affected):
- calculation.service.spec.ts
- emission.calculator.spec.ts
- aggregation.helper.spec.ts

Related (integration):
- calculation.e2e.spec.ts
- reporting.integration.spec.ts

Skippable (unaffected):
- auth.spec.ts (0% overlap)
- user.spec.ts (0% overlap)
- 127 other test files

Estimated Time:
- Full Suite: 8m 45s
- Recommended Only: 2m 15s
- Time Saved: 6m 30s (74%)
```