# @clenergize/common

> Shared common utilities, types, and base classes for Clenergize microservices

## Installation

```bash
npm install @clenergize/common
```

## Features

- ✅ **Error Taxonomy** - Complete error classification system with 7 error types
- ✅ **Value Objects** - Immutable, self-validating domain objects
- ✅ **Type Definitions** - Shared TypeScript types and interfaces
- ✅ **Structured Logging** - Winston-based logger with correlation ID support
- ✅ **Type-Safe** - Full TypeScript support with strict mode
- ✅ **Well-Tested** - 80%+ code coverage

## Usage

### Error Handling

```typescript
import { ValidationError, NotFoundError, Errors } from '@clenergize/common';

// Throw validation error
throw ValidationError.forField('email', 'Invalid format', 'IDN_VAL_001');

// Throw not found error
throw NotFoundError.byId('User', userId, 'IDN_NFD_001');

// Create error from Zod validation
const zodError = schema.parse(data);
throw ValidationError.fromZod(zodError, 'IDN_VAL_002');

// Convert error to JSON for API response
try {
  // ... operation
} catch (error) {
  if (error instanceof Errors.Base) {
    return res.status(error.statusCode).json(error.toJSON());
  }
}
```

### Value Objects

```typescript
import { Email, EntityId, DateRange } from '@clenergize/common';

// Email
const email = Email.create('user@example.com');
console.log(email.value); // 'user@example.com'
console.log(email.domain); // 'example.com'
console.log(email.belongsToDomain('example.com')); // true

// Entity ID (UUID)
const userId = EntityId.generate(); // New UUID
const projectId = EntityId.create('123e4567-e89b-12d3-a456-426614174000');
console.log(userId.value); // 'e4a3b8f1-...'

// Date Range
const range = DateRange.create(
  new Date('2024-01-01'),
  new Date('2024-12-31')
);
console.log(range.durationInDays); // 366
console.log(range.contains(new Date('2024-06-15'))); // true
```

### Logging

```typescript
import { Logger } from '@clenergize/common';

// Create logger
const logger = Logger.create('identity-service');

// Log messages
logger.info('User logged in', { userId: '123', email: 'user@example.com' });
logger.warn('Rate limit exceeded', { userId: '123', attempts: 5 });
logger.error('Database connection failed', error, { database: 'mongodb' });

// Set context for all subsequent logs
logger.setContext({ correlationId: 'abc-123', userId: '456' });
logger.info('Processing request'); // Will include correlationId and userId

// Create child logger with additional context
const requestLogger = logger.child({ requestId: 'req-789' });
requestLogger.info('Handling request'); // Includes all parent context + requestId

// Log HTTP requests
logger.logRequest('GET', '/api/v1/users', 200, 45);

// Log database queries
logger.logQuery('find', 'users', 12);

// Log events
logger.logEvent('user.created.v1', 'evt-123');
```

### Types

```typescript
import {
  ApiResponse,
  PaginatedResponse,
  Entity,
  AuditFields,
  Result,
  isSuccess
} from '@clenergize/common';

// API Response
const response: ApiResponse<User> = {
  success: true,
  data: user,
  metadata: {
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    requestId: 'req-123'
  }
};

// Paginated Response
const users: PaginatedResponse<User> = {
  items: [user1, user2, user3],
  pagination: {
    page: 1,
    limit: 10,
    total: 100,
    totalPages: 10,
    hasNextPage: true,
    hasPreviousPage: false
  }
};

// Result Type (Railway Oriented Programming)
function divideNumbers(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return { success: false, error: 'Division by zero' };
  }
  return { success: true, value: a / b };
}

const result = divideNumbers(10, 2);
if (isSuccess(result)) {
  console.log(result.value); // 5
} else {
  console.error(result.error);
}
```

## Error Taxonomy

All errors extend from `BaseError` and follow the format: `SERVICE_CATEGORY_NUMBER`

### Error Types

| Class | HTTP Status | Use Case | Example Code |
|-------|-------------|----------|--------------|
| `ValidationError` | 400 | Invalid input | `IDN_VAL_001` |
| `AuthenticationError` | 401 | Auth failure | `IDN_AUTH_001` |
| `AuthorizationError` | 403 | Permission denied | `IDN_AUTHZ_001` |
| `NotFoundError` | 404 | Resource not found | `IDN_NFD_001` |
| `ConflictError` | 409 | Duplicate/conflict | `IDN_CONF_001` |
| `BusinessLogicError` | 422 | Business rule violation | `IDN_BIZ_001` |
| `InternalError` | 500 | Server error | `IDN_INT_001` |

### Service Prefixes

- `IDN` - Identity Service
- `ORG` - Organization Service
- `REF` - Reference Service
- `ACT` - Activity Service
- `CAL` - Calculation Service
- `REP` - Reporting Service
- `AUD` - Audit Service

## API

### Errors

- `BaseError` - Base class for all errors
- `ValidationError` - Input validation failures
- `AuthenticationError` - Authentication failures
- `AuthorizationError` - Permission denied
- `NotFoundError` - Resource not found
- `ConflictError` - Duplicate or conflicting state
- `BusinessLogicError` - Business rule violations
- `InternalError` - Server errors

### Value Objects

- `Email` - Email address with validation
- `EntityId` - UUID-based entity identifier
- `DateRange` - Time period with validation

### Utilities

- `Logger` - Structured logging service
- `createLogger()` - Factory function for logger

### Types

See [src/types/common.types.ts](src/types/common.types.ts) for complete type definitions.

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Build and watch
npm run build:watch

# Run tests
npm test

# Run tests with coverage
npm test:coverage

# Lint
npm run lint

# Format
npm run format
```

## Testing

```typescript
import { Email, ValidationError } from '@clenergize/common';

describe('Email', () => {
  it('should create valid email', () => {
    const email = Email.create('user@example.com');
    expect(email.value).toBe('user@example.com');
  });

  it('should throw on invalid email', () => {
    expect(() => Email.create('invalid')).toThrow(ValidationError);
  });
});
```

## License

PROPRIETARY - Clenergize Team

## Links

- [Clenergize V3 Documentation](../../Docs/)
- [Architecture Overview](../../Docs/PHASE2_Target_Architecture_Overview.md)
- [Error Code Registry](../../Docs/ERROR_CODE_REGISTRY.md)
