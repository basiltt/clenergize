# Error Taxonomy Skill

## Purpose
Replace generic BadRequestException with domain-specific errors for better debugging and error handling.

## Problem in OLD Code

```typescript
// OLD: Generic errors everywhere!
throw new BadRequestException('Invalid data'); // What's invalid?
throw new Error('Something went wrong'); // What went wrong?
throw new HttpException('Failed', 500); // Why did it fail?
```

## Solution: Domain-Specific Error Hierarchy

### 1. Base Error Classes
```typescript
// Base domain exception
export abstract class DomainException extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details
    };
  }
}

// Specific error categories
export class ValidationException extends DomainException {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details);
  }
}

export class BusinessRuleException extends DomainException {
  constructor(message: string, rule: string, details?: any) {
    super(message, `BUSINESS_RULE_VIOLATION_${rule}`, details);
  }
}

export class ResourceNotFoundException extends DomainException {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`, 'RESOURCE_NOT_FOUND', { resource, id });
  }
}
```

### 2. Service-Specific Errors
```typescript
// Identity Service Errors
export class InvalidCredentialsException extends DomainException {
  constructor() {
    super('Invalid email or password', 'INVALID_CREDENTIALS');
  }
}

export class AccountLockedException extends DomainException {
  constructor(lockedUntil: Date) {
    super('Account is locked due to too many failed attempts', 'ACCOUNT_LOCKED', {
      lockedUntil: lockedUntil.toISOString()
    });
  }
}

export class TokenExpiredException extends DomainException {
  constructor() {
    super('Token has expired', 'TOKEN_EXPIRED');
  }
}

// Organization Service Errors
export class ProjectLimitExceededException extends BusinessRuleException {
  constructor(currentCount: number, limit: number) {
    super(
      `Project limit exceeded. Current: ${currentCount}, Limit: ${limit}`,
      'PROJECT_LIMIT',
      { currentCount, limit }
    );
  }
}

export class HierarchyCircularDependencyException extends ValidationException {
  constructor(nodeId: string, path: string[]) {
    super('Circular dependency detected in hierarchy', {
      nodeId,
      circularPath: path
    });
  }
}

// Calculation Service Errors
export class EmissionFactorNotFoundException extends ResourceNotFoundException {
  constructor(activity: string, region: string) {
    super('EmissionFactor', `${activity}_${region}`);
  }
}

export class CalculationTimeoutException extends DomainException {
  constructor(projectId: string, duration: number) {
    super(
      `Calculation timeout for project ${projectId}`,
      'CALCULATION_TIMEOUT',
      { projectId, duration }
    );
  }
}
```

### 3. Error Handler with Mapping
```typescript
@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    let status = 500;
    let errorResponse: any;

    if (exception instanceof ValidationException) {
      status = 400;
      errorResponse = {
        type: 'VALIDATION_ERROR',
        message: exception.message,
        details: exception.details
      };
    } else if (exception instanceof ResourceNotFoundException) {
      status = 404;
      errorResponse = {
        type: 'NOT_FOUND',
        message: exception.message,
        resource: exception.details.resource
      };
    } else if (exception instanceof BusinessRuleException) {
      status = 422;
      errorResponse = {
        type: 'BUSINESS_RULE_VIOLATION',
        message: exception.message,
        rule: exception.code
      };
    } else if (exception instanceof DomainException) {
      status = 400;
      errorResponse = {
        type: exception.code,
        message: exception.message,
        details: exception.details
      };
    } else {
      errorResponse = {
        type: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
      };
    }

    response.status(status).json({
      success: false,
      error: errorResponse,
      timestamp: new Date().toISOString()
    });
  }
}
```

### 4. Error Recovery Strategies
```typescript
export class ErrorRecoveryService {
  async handleWithRecovery<T>(
    operation: () => Promise<T>,
    recoveryStrategies: RecoveryStrategy[]
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      for (const strategy of recoveryStrategies) {
        if (strategy.canHandle(error)) {
          return await strategy.recover(error);
        }
      }
      throw error;
    }
  }
}

interface RecoveryStrategy {
  canHandle(error: any): boolean;
  recover(error: any): Promise<any>;
}

// Example recovery strategies
class RetryStrategy implements RecoveryStrategy {
  canHandle(error: any): boolean {
    return error instanceof NetworkException;
  }

  async recover(error: any): Promise<any> {
    // Retry with exponential backoff
  }
}

class FallbackStrategy implements RecoveryStrategy {
  canHandle(error: any): boolean {
    return error instanceof ServiceUnavailableException;
  }

  async recover(error: any): Promise<any> {
    // Use cached or default data
  }
}
```

## Benefits
- Clear error messages
- Easier debugging
- Better error handling
- Improved monitoring
- Type-safe error handling