# Testing Commands (MCP Executor)

## Test Execution Commands

### Run Tests
```javascript
// Run unit tests
execute({
  action: 'test',
  content: 'unit',
  options: { service: 'identity' }
})

// Run integration tests
execute({
  action: 'test',
  content: 'integration',
  options: { service: 'identity' }
})

// Run E2E tests
execute({
  action: 'test',
  content: 'e2e',
  options: { service: 'identity' }
})

// Run all tests
execute({
  action: 'test',
  content: 'all',
  options: { service: 'identity' }
})

// Run specific test file
execute({
  action: 'bash',
  content: 'cd NEW/identity-service && npm test -- jwt-verification.service.spec.ts'
})

// Run tests in watch mode
execute({
  action: 'bash',
  content: 'cd NEW/identity-service && npm run test:watch'
})
```

### Coverage Check
```javascript
// Generate coverage report
execute({
  action: 'test',
  content: 'coverage',
  options: {
    service: 'identity',
    threshold: 80
  }
})

// View coverage summary
execute({
  action: 'bash',
  content: 'cd NEW/identity-service && npm run test:cov'
})

// Check specific file coverage
execute({
  action: 'bash',
  content: 'cd NEW/identity-service && npm run test:cov -- jwt.guard.ts'
})

// Generate HTML coverage report
execute({
  action: 'bash',
  content: 'cd NEW/identity-service && npm run test:cov && open coverage/index.html'
})
```

### Run E2E Tests
```javascript
// Run user registration flow
execute({
  action: 'bash',
  content: 'cd NEW/frontend && npm run cypress:run -- --spec "cypress/e2e/user-registration.cy.ts"'
})

// Run with UI
execute({
  action: 'bash',
  content: 'cd NEW/frontend && npm run cypress:open'
})

// Run all E2E tests
execute({
  action: 'bash',
  content: 'cd NEW/frontend && npm run test:e2e'
})

// Run specific test suite
execute({
  action: 'bash',
  content: 'cd NEW/identity-service && npm run test:e2e -- auth.e2e-spec.ts'
})
```

### Performance Testing
```javascript
// Run K6 performance test
execute({
  action: 'bash',
  content: `
    k6 run --vus 100 --duration 5m \\
      --out json=performance-results.json \\
      tests/performance/calculation-service.js
  `
})

// Quick baseline test
execute({
  action: 'bash',
  content: `
    k6 run --vus 10 --duration 30s \\
      tests/performance/baseline.js
  `
})

// Stress test
execute({
  action: 'bash',
  content: `
    k6 run --vus 200 --duration 10m \\
      --stage 5m:100,5m:200 \\
      tests/performance/stress-test.js
  `
})
```

## Test Generation Commands

### Generate Tests
```javascript
// Generate test file for service
execute({
  action: 'file',
  content: 'write',
  options: {
    path: 'NEW/identity-service/src/auth/jwt.guard.spec.ts',
    data: `
import { Test, TestingModule } from '@nestjs/testing';
import { JwtGuard } from './jwt.guard';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtGuard', () => {
  let guard: JwtGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtGuard],
    }).compile();

    guard = module.get<JwtGuard>(JwtGuard);
  });

  describe('validateToken', () => {
    it('should validate a valid JWT token', async () => {
      const validToken = 'valid.jwt.token';
      const result = await guard.validateToken(validToken);
      expect(result).toBeDefined();
      expect(result.sub).toBeTruthy();
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      const invalidToken = 'invalid.token';
      await expect(guard.validateToken(invalidToken))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for expired token', async () => {
      const expiredToken = 'expired.jwt.token';
      await expect(guard.validateToken(expiredToken))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should verify token signature with JWKS', async () => {
      const token = 'signed.jwt.token';
      const result = await guard.validateToken(token);
      expect(result).toHaveProperty('sub');
      expect(result).toHaveProperty('iss');
    });
  });
});
    `
  }
})
```

### Mutation Testing
```javascript
// Install Stryker
execute({
  action: 'bash',
  content: 'cd NEW/identity-service && npm install -D @stryker-mutator/core @stryker-mutator/jest-runner'
})

// Run mutation tests
execute({
  action: 'bash',
  content: 'cd NEW/identity-service && npm run test:mutation'
})

// View mutation report
execute({
  action: 'bash',
  content: 'cd NEW/identity-service && open mutation-report/index.html'
})
```

## Test Data Management

### Seed Test Data
```javascript
// Seed minimal test data
execute({
  action: 'mongodb',
  content: `
    db("clenergize_identity_test").collection("users").insertMany([
      {email: "admin@test.com", role: "admin", password: "hashed_password"},
      {email: "user@test.com", role: "user", password: "hashed_password"}
    ])
  `
})

// Seed performance test data
execute({
  action: 'bash',
  content: 'cd NEW/identity-service && npm run seed:performance'
})

// Seed from fixture file
execute({
  action: 'bash',
  content: 'cd NEW/identity-service && npm run seed -- fixtures/users.json'
})
```

### Clean Test Data
```javascript
// Clean test database
execute({
  action: 'mongodb',
  content: `
    db("clenergize_identity_test").dropDatabase()
  `
})

// Clean specific collection
execute({
  action: 'mongodb',
  content: `
    db("clenergize_identity_test").collection("users").deleteMany({
      email: {$regex: "_test_"}
    })
  `
})

// Reset test database
execute({
  action: 'bash',
  content: `
    mongo clenergize_identity_test --eval "db.dropDatabase()" &&
    cd NEW/identity-service && npm run seed:test
  `
})
```

## Test Quality Commands

### Detect Test Smells
```javascript
// Scan for test smells
execute({
  action: 'bash',
  content: `
    echo "=== Magic Numbers ==="
    grep -rn "expect.*toBe([0-9]" NEW/identity-service/test --include="*.spec.ts"

    echo "=== Hardcoded Delays ==="
    grep -rn "sleep\\|setTimeout" NEW/identity-service/test --include="*.spec.ts"

    echo "=== Missing Assertions ==="
    grep -rn "it(.*=>.*{$" NEW/identity-service/test --include="*.spec.ts" -A 5 | grep -v "expect"
  `
})

// Check test naming conventions
execute({
  action: 'bash',
  content: `
    grep -rn "it('test" NEW/identity-service/test --include="*.spec.ts"
  `
})
```

### Flaky Test Detection
```javascript
// Run tests multiple times
execute({
  action: 'bash',
  content: `
    for i in {1..10}; do
      echo "Run $i/10"
      cd NEW/identity-service && npm test -- --silent 2>&1 | tee test-run-$i.log
    done
  `
})

// Analyze flaky tests
execute({
  action: 'bash',
  content: `
    grep -h "FAIL" test-run-*.log | sort | uniq -c | sort -rn
  `
})
```

## Contract Testing

### Test API Contracts
```javascript
// Install Pact
execute({
  action: 'bash',
  content: 'cd NEW/frontend && npm install -D @pact-foundation/pact'
})

// Consumer test (Frontend)
execute({
  action: 'file',
  content: 'write',
  options: {
    path: 'NEW/frontend/tests/pact/identity-service.pact.spec.ts',
    data: `
import { Pact } from '@pact-foundation/pact';

describe('Identity Service Contract', () => {
  const provider = new Pact({
    consumer: 'Frontend',
    provider: 'IdentityService',
    port: 1234
  });

  beforeAll(() => provider.setup());
  afterAll(() => provider.finalize());

  describe('POST /auth/login', () => {
    it('returns token on successful login', async () => {
      await provider.addInteraction({
        state: 'user exists',
        uponReceiving: 'login request',
        withRequest: {
          method: 'POST',
          path: '/auth/login',
          body: { email: 'test@example.com', password: 'Test123!' }
        },
        willRespondWith: {
          status: 200,
          body: { token: 'jwt-token' }
        }
      });

      // Test implementation
    });
  });
});
    `
  }
})

// Verify provider
execute({
  action: 'bash',
  content: 'cd NEW/identity-service && npm run test:pact:verify'
})
```

### Generate Mocks
```javascript
// Create mock service
execute({
  action: 'file',
  content: 'write',
  options: {
    path: 'NEW/identity-service/test/mocks/jwt.service.mock.ts',
    data: `
export class JwtServiceMock {
  private responses = new Map();

  sign(payload: any): string {
    return this.responses.get('sign') || 'mock-jwt-token';
  }

  verify(token: string): any {
    return this.responses.get('verify') || { sub: 'user-123', email: 'test@example.com' };
  }

  setResponse(method: string, response: any) {
    this.responses.set(method, response);
  }

  verifyCalled(method: string, times: number = 1) {
    // Verification logic
  }
}
    `
  }
})
```

## Monitoring & Metrics

### Test Metrics Dashboard
```javascript
// Get test execution stats
execute({
  action: 'bash',
  content: `
    cd NEW/identity-service &&
    npm test -- --json --outputFile=test-results.json &&
    cat test-results.json | jq '{
      total: .numTotalTests,
      passed: .numPassedTests,
      failed: .numFailedTests,
      duration: .testResults[].endTime - .testResults[].startTime
    }'
  `
})

// Generate coverage trend
execute({
  action: 'bash',
  content: `
    for service in identity organization reference activity calculation reporting audit; do
      echo "=== $service ==="
      cd NEW/$service-service &&
      npm run test:cov --silent 2>&1 | grep "All files" | awk '{print $10}'
      cd ../..
    done
  `
})
```

### Test Impact Analysis
```javascript
// Find affected tests
execute({
  action: 'bash',
  content: `
    # Get changed files
    CHANGED_FILES=$(git diff --name-only HEAD~1)

    # Find related test files
    for file in $CHANGED_FILES; do
      if [[ $file == *.ts ]]; then
        TEST_FILE="${file%.ts}.spec.ts"
        if [ -f "$TEST_FILE" ]; then
          echo "$TEST_FILE"
        fi
      fi
    done
  `
})

// Run only affected tests
execute({
  action: 'bash',
  content: 'cd NEW/identity-service && npm test -- --onlyChanged'
})
```

## Integration Testing

### Service Integration Tests
```javascript
// Test service-to-service communication
execute({
  action: 'bash',
  content: `
    # Start all services
    docker-compose -f docker-compose.test.yml up -d

    # Wait for services
    sleep 10

    # Run integration tests
    cd NEW/identity-service && npm run test:integration

    # Cleanup
    docker-compose -f docker-compose.test.yml down
  `
})

// Test with TestContainers
execute({
  action: 'bash',
  content: 'cd NEW/identity-service && npm install -D testcontainers'
})
```

### Database Integration Tests
```javascript
// Test MongoDB transactions
execute({
  action: 'file',
  content: 'write',
  options: {
    path: 'NEW/identity-service/test/integration/transaction.spec.ts',
    data: `
import { MongoClient } from 'mongodb';

describe('Transaction Tests', () => {
  let client: MongoClient;

  beforeAll(async () => {
    client = await MongoClient.connect(process.env.MONGODB_URI_TEST);
  });

  afterAll(async () => {
    await client.close();
  });

  it('should rollback on error', async () => {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        await db.collection('users').insertOne({ email: 'test@test.com' }, { session });
        throw new Error('Simulated error');
      });
    } catch (error) {
      // Transaction rolled back
    }

    const user = await db.collection('users').findOne({ email: 'test@test.com' });
    expect(user).toBeNull();
  });
});
    `
  }
})
```

## Quick Reference

| Task | Command |
|------|---------|
| Run unit tests | `execute({ action: 'test', content: 'unit', options: { service: 'identity' }})` |
| Run E2E tests | `execute({ action: 'test', content: 'e2e', options: { service: 'identity' }})` |
| Check coverage | `execute({ action: 'test', content: 'coverage', options: { service: 'identity', threshold: 80 }})` |
| Performance test | `execute({ action: 'bash', content: 'k6 run tests/performance/...' })` |
| Seed test data | `execute({ action: 'mongodb', content: 'db("test").collection("users").insertMany(...)' })` |
| Clean test data | `execute({ action: 'mongodb', content: 'db("test").dropDatabase()' })` |
| Generate tests | Create .spec.ts file with test template |
| Mutation testing | `execute({ action: 'bash', content: 'npm run test:mutation' })` |
| Contract testing | Use Pact for consumer/provider tests |

Remember: Test early, test often - aim for 80% coverage!
