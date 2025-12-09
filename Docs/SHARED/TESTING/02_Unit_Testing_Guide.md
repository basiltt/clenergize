# Unit Testing Guide - Clenergize V3 ESG Platform

**Version**: 1.0.0  
**Last Updated**: November 22, 2025  
**Coverage Target**: 80% minimum (branches, functions, lines, statements)

## Quick Reference

```bash
npm test              # Run all unit tests
npm run test:watch   # Run in watch mode
npm run test:cov     # Generate coverage report
```

## Test Structure (AAA Pattern)

All tests follow the Arrange-Act-Assert pattern:

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with hashed password', async () => {
      // Arrange - Set up test data and mocks
      const dto = { email: 'test@example.com', password: 'Pass123!' };
      mockHasher.hash.mockResolvedValue('hashed_password');
      mockRepo.create.mockResolvedValue({ id: '123', email: dto.email });

      // Act - Execute the code under test
      const result = await service.createUser(dto);

      // Assert - Verify the results
      expect(result.id).toBe('123');
      expect(mockHasher.hash).toHaveBeenCalledWith('Pass123!');
      expect(mockRepo.create).toHaveBeenCalled();
    });
  });
});
```

## Jest Configuration

Each service has `jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: ['**/*.spec.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.dto.ts',
    '!src/**/*.module.ts',
    '!src/main.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
```

## Key Testing Patterns

### 1. Test Builders

```typescript
export class UserBuilder {
  private user = {
    id: 'user-123',
    email: 'test@example.com',
    status: 'ACTIVE'
  };

  withEmail(email: string): this {
    this.user.email = email;
    return this;
  }

  build() {
    return { ...this.user };
  }
}

// Usage
const user = new UserBuilder().withEmail('admin@example.com').build();
```

### 2. Parameterized Tests

```typescript
test.each([
  ['valid@example.com', true],
  ['invalid', false],
  ['@example.com', false]
])('validateEmail("%s") should return %s', (email, expected) => {
  expect(validator.validateEmail(email)).toBe(expected);
});
```

### 3. Mocking Dependencies

```typescript
const mockRepository = {
  findById: jest.fn(),
  create: jest.fn()
};

mockRepository.findById.mockResolvedValue({ id: '123' });
mockRepository.create.mockRejectedValue(new Error('DB error'));
```

## Best Practices

1. **Clear Test Names**: `should create user with ACTIVE status by default`
2. **Independent Tests**: Each test sets up its own data
3. **Mock Isolation**: Use `jest.clearAllMocks()` in `afterEach`
4. **Test Error Cases**: Don't just test happy paths
5. **Async/Await**: Always await promises in tests

## Common Issues

**Timeout Errors**: Increase timeout with `jest.setTimeout(10000)`  
**Mocks Not Resetting**: Add `afterEach(() => jest.clearAllMocks())`  
**Missing Await**: Always `await` async service calls

## Coverage Requirements

- Minimum 80% for all metrics (branches, functions, lines, statements)
- Run `npm run test:cov` before committing
- View report at `coverage/lcov-report/index.html`

## Additional Resources

- [Integration Testing Guide](03_Integration_Testing_Guide.md)
- [E2E Testing Guide](05_E2E_Testing_Guide.md)
- [SDLC Quality Strategy](../04-Development/02-Standards/PHASE5_SDLC_Quality_Strategy.md)
