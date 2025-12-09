# BaseAPIClient & IdentityClient Implementation Guide

## Overview

This document incorporates the BaseAPIClient & IdentityClient design specification and provides implementation guidance aligned with the Clenergize V3 security-first architecture.

## Design Specification Summary

### Security Requirements

1. **No localStorage for tokens** - Prevents XSS attacks
2. **HttpOnly, Secure cookies** - Managed entirely by backend
3. **No token exposure to frontend code** - Browser handles cookie auth
4. **Correlation IDs** - For request tracing
5. **Structured error handling** - Normalized error categories

### BaseAPIClient Responsibilities

The BaseAPIClient is the **single low-level HTTP abstraction** that:
- Handles all HTTP communication with backend services
- Normalizes errors into well-defined categories
- Implements cross-cutting concerns (timeout, retry, correlation IDs)
- Does NOT handle authentication tokens (cookies managed by browser)

### IdentityClient Responsibilities

The IdentityClient is the **domain-specific client** for authentication that:
- Wraps BaseAPIClient for all identity-related calls
- Provides typed methods for auth operations
- Never exposes raw tokens to UI code
- Returns normalized results using BaseAPIClient's error model

## Error Model

### Error Categories

```typescript
enum ErrorCategory {
  AuthError = 'AUTH_ERROR',           // 401/403 responses
  ValidationError = 'VALIDATION_ERROR', // 400 with field errors
  NotFoundError = 'NOT_FOUND_ERROR',    // 404
  ConflictError = 'CONFLICT_ERROR',     // 409
  RateLimitError = 'RATE_LIMIT_ERROR',  // 429
  ServerError = 'SERVER_ERROR',         // 5xx
  NetworkError = 'NETWORK_ERROR',       // DNS, timeout, connection
  UnknownError = 'UNKNOWN_ERROR'        // Anything else
}

interface APIError {
  category: ErrorCategory;
  message: string;
  statusCode?: number;
  code?: string; // e.g., 'AUTH_TOKEN_EXPIRED'
  fieldErrors?: Record<string, string[]>;
}
```

## Implementation Architecture

### Directory Structure

```
src/lib/api/
├── base-api-client/
│   ├── index.ts
│   ├── base-api-client.ts
│   ├── error-normalizer.ts
│   ├── types.ts
│   └── __tests__/
│       └── base-api-client.test.ts
├── identity-client/
│   ├── index.ts
│   ├── identity-client.ts
│   ├── types.ts
│   └── __tests__/
│       └── identity-client.test.ts
└── index.ts
```

## BaseAPIClient Implementation Blueprint

### Core Methods

```typescript
class BaseAPIClient {
  private baseURL: string;
  private timeout: number;
  private correlationId?: string;

  constructor(config: APIClientConfig) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout || 10000;
  }

  async get<T>(path: string, options?: RequestOptions): Promise<Result<T>>;
  async post<T>(path: string, body?: any, options?: RequestOptions): Promise<Result<T>>;
  async put<T>(path: string, body?: any, options?: RequestOptions): Promise<Result<T>>;
  async patch<T>(path: string, body?: any, options?: RequestOptions): Promise<Result<T>>;
  async delete<T>(path: string, options?: RequestOptions): Promise<Result<T>>;

  private async request<T>(config: InternalRequestConfig): Promise<Result<T>>;
  private constructHeaders(config: InternalRequestConfig): Headers;
  private normalizeError(error: unknown): APIError;
  private shouldRetry(error: APIError, attempt: number): boolean;
}
```

### Key Implementation Points

1. **Headers Construction**:
   - Always set `Content-Type: application/json` for JSON bodies
   - Always set `Accept: application/json`
   - Add `X-Request-Id` for correlation
   - Add `X-Client-Version` for versioning
   - Do NOT add Authorization header (cookies handle auth)

2. **Timeout Handling**:
   - Use AbortController for request cancellation
   - Default 10 seconds, configurable per request
   - Clean abort on timeout

3. **Retry Logic**:
   - Only retry GET requests (idempotent)
   - Max 2 retries for transient errors
   - Exponential backoff: 1s, 2s
   - Never retry 4xx errors
   - Never retry auth errors

4. **Error Normalization**:
   - Map HTTP status codes to error categories
   - Extract validation errors from 400 responses
   - Preserve useful error details without exposing sensitive data
   - Always include correlation ID in errors

### Detailed Retry Policy Implementation

```typescript
interface RetryPolicyConfig {
  maxRetries: number;
  backoffMs: number;
  retryableStatuses: number[];
  retryableErrors: string[];
}

class BaseAPIClient {
  private readonly retryPolicy: RetryPolicyConfig = {
    maxRetries: 3,
    backoffMs: 1000,
    retryableStatuses: [408, 429, 500, 502, 503, 504],
    retryableErrors: [
      'ECONNRESET',
      'ETIMEDOUT',
      'ECONNREFUSED',
      'NETWORK_ERROR'
    ]
  };

  async request<T>(config: RequestConfig): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= this.retryPolicy.maxRetries; attempt++) {
      try {
        const response = await fetch(config.url, {
          ...config,
          signal: AbortSignal.timeout(config.timeout || 30000) // 30s timeout
        });

        if (!response.ok) {
          throw await this.handleHttpError(response);
        }

        return await response.json();
      } catch (error) {
        lastError = error as Error;

        // Don't retry if this is the last attempt
        if (attempt >= this.retryPolicy.maxRetries) {
          throw this.transformError(error);
        }

        // Check if error is retryable
        if (!this.isRetryable(error, attempt, config.method)) {
          throw this.transformError(error);
        }

        // Exponential backoff with jitter
        const delay = this.calculateBackoff(attempt);
        await this.sleep(delay);

        console.log(`Retrying request (attempt ${attempt + 1}/${this.retryPolicy.maxRetries})...`);
      }
    }

    throw new MaxRetriesExceededError(lastError!);
  }

  private isRetryable(
    error: any,
    attempt: number,
    method: string = 'GET'
  ): boolean {
    // Only retry GET requests (idempotent)
    if (method !== 'GET') {
      return false;
    }

    // Don't retry if max attempts reached
    if (attempt >= this.retryPolicy.maxRetries) {
      return false;
    }

    // Check HTTP status codes
    if (error instanceof HttpError) {
      return this.retryPolicy.retryableStatuses.includes(error.status);
    }

    // Check error messages
    return this.retryPolicy.retryableErrors.some(code =>
      error.message?.includes(code)
    );
  }

  private calculateBackoff(attempt: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s...
    const exponentialDelay = this.retryPolicy.backoffMs * Math.pow(2, attempt);

    // Add jitter to prevent thundering herd (±20%)
    const jitter = exponentialDelay * 0.2 * (Math.random() - 0.5);

    return exponentialDelay + jitter;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async handleHttpError(response: Response): Promise<HttpError> {
    const body = await response.json().catch(() => ({}));

    return new HttpError({
      status: response.status,
      code: body.code || 'UNKNOWN_ERROR',
      message: body.message || response.statusText,
      details: body.details,
      correlationId: response.headers.get('X-Correlation-ID') || undefined
    });
  }

  private transformError(error: unknown): APIError {
    if (error instanceof HttpError) {
      return {
        category: this.categorizeHttpError(error.status),
        message: error.message,
        statusCode: error.status,
        code: error.code,
        correlationId: error.correlationId
      };
    }

    if (error instanceof NetworkError) {
      return {
        category: ErrorCategory.NetworkError,
        message: 'Network connection lost. Please check your internet.',
        code: 'NETWORK_ERROR'
      };
    }

    if (error instanceof MaxRetriesExceededError) {
      return {
        category: ErrorCategory.ServerError,
        message: 'Service is experiencing issues. Please try again later.',
        code: 'MAX_RETRIES_EXCEEDED'
      };
    }

    return {
      category: ErrorCategory.UnknownError,
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR'
    };
  }

  private categorizeHttpError(status: number): ErrorCategory {
    if (status === 401 || status === 403) return ErrorCategory.AuthError;
    if (status === 400) return ErrorCategory.ValidationError;
    if (status === 404) return ErrorCategory.NotFoundError;
    if (status === 409) return ErrorCategory.ConflictError;
    if (status === 429) return ErrorCategory.RateLimitError;
    if (status >= 500) return ErrorCategory.ServerError;
    return ErrorCategory.UnknownError;
  }
}

// Custom error classes
export class HttpError extends Error {
  constructor(public readonly params: {
    status: number;
    code: string;
    message: string;
    details?: any;
    correlationId?: string;
  }) {
    super(params.message);
    this.name = 'HttpError';
  }

  get status(): number {
    return this.params.status;
  }

  get code(): string {
    return this.params.code;
  }

  get correlationId(): string | undefined {
    return this.params.correlationId;
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class MaxRetriesExceededError extends Error {
  constructor(public readonly originalError: Error) {
    super('Maximum retry attempts exceeded');
    this.name = 'MaxRetriesExceededError';
  }
}
```

### User-Friendly Error Messages

```typescript
export class ErrorMessageService {
  /**
   * Convert technical errors to user-friendly messages
   */
  getDisplayMessage(error: APIError): string {
    switch (error.category) {
      case ErrorCategory.AuthError:
        if (error.code === 'AUTH_TOKEN_EXPIRED') {
          return 'Your session has expired. Please log in again.';
        }
        if (error.code === 'AUTH_REQUIRED') {
          return 'Please log in to continue';
        }
        if (error.code === 'PERMISSION_DENIED') {
          return "You don't have permission to perform this action";
        }
        return 'Authentication failed. Please try again.';

      case ErrorCategory.ValidationError:
        return error.details?.message || 'Please check your input and try again';

      case ErrorCategory.NotFoundError:
        return 'The requested resource was not found';

      case ErrorCategory.ConflictError:
        return 'This action conflicts with existing data';

      case ErrorCategory.RateLimitError:
        return 'Too many requests. Please wait a moment and try again.';

      case ErrorCategory.ServerError:
        return 'Our servers are experiencing issues. Please try again later.';

      case ErrorCategory.NetworkError:
        return 'Network connection lost. Please check your internet connection.';

      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Get error severity for UI display
   */
  getSeverity(error: APIError): 'error' | 'warning' | 'info' {
    switch (error.category) {
      case ErrorCategory.AuthError:
      case ErrorCategory.ServerError:
      case ErrorCategory.NetworkError:
        return 'error';

      case ErrorCategory.RateLimitError:
      case ErrorCategory.ConflictError:
        return 'warning';

      default:
        return 'info';
    }
  }

  /**
   * Determine if error should show retry button
   */
  canRetry(error: APIError): boolean {
    return [
      ErrorCategory.ServerError,
      ErrorCategory.NetworkError,
      ErrorCategory.RateLimitError
    ].includes(error.category);
  }
}

const errorMessageService = new ErrorMessageService();
export default errorMessageService;
```

### React Error Boundary

```typescript
// components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/react';
import errorMessageService from '@/lib/api/error-message-service';
import type { APIError } from '@/lib/api/types';

interface Props {
  children: ReactNode;
  component?: string;
  userId?: string;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  displayMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      displayMessage: ''
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      displayMessage: error instanceof APIError
        ? errorMessageService.getDisplayMessage(error)
        : 'An unexpected error occurred'
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to error tracking service (Sentry)
    Sentry.captureException(error, {
      extra: errorInfo,
      tags: {
        component: this.props.component || 'unknown',
        userId: this.props.userId
      }
    });

    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      displayMessage: ''
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.resetError);
      }

      return (
        <div className="error-boundary-fallback">
          <h2>Something went wrong</h2>
          <p>{this.state.displayMessage}</p>
          <button onClick={this.resetError}>Try Again</button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage:
// <ErrorBoundary component="ProjectList" userId={user.id}>
//   <ProjectList />
// </ErrorBoundary>
```

### Optimistic Updates with Rollback

```typescript
// hooks/useOptimisticUpdate.ts
import { useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { APIError } from '@/lib/api/types';

interface OptimisticUpdateOptions<T> {
  /**
   * Optimistic update to apply immediately
   */
  optimisticUpdate: (current: T) => T;

  /**
   * Async operation to perform
   */
  operation: () => Promise<T>;

  /**
   * Error handler
   */
  onError?: (error: APIError) => void;

  /**
   * Success handler
   */
  onSuccess?: (result: T) => void;
}

export function useOptimisticUpdate<T>() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);

  const execute = useCallback(async (
    currentValue: T,
    options: OptimisticUpdateOptions<T>
  ): Promise<T | null> => {
    // Store original value for rollback
    const originalValue = currentValue;

    try {
      setIsLoading(true);
      setError(null);

      // Apply optimistic update immediately
      const optimisticValue = options.optimisticUpdate(currentValue);

      // Perform async operation
      const result = await options.operation();

      // Success - optimistic update confirmed
      if (options.onSuccess) {
        options.onSuccess(result);
      }

      return result;
    } catch (err) {
      // Rollback optimistic update
      const apiError = err as APIError;
      setError(apiError);

      if (options.onError) {
        options.onError(apiError);
      }

      // Return original value (rollback)
      return originalValue;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { execute, isLoading, error };
}

// Usage Example:
export function ProjectList() {
  const projects = useAppSelector(state => state.projects.items);
  const { execute, isLoading } = useOptimisticUpdate<Project[]>();
  const apiClient = useAPIClient();

  const handleToggleArchive = async (projectId: string) => {
    await execute(projects, {
      // Optimistic UI update
      optimisticUpdate: (current) =>
        current.map(p =>
          p.id === projectId
            ? { ...p, archived: !p.archived }
            : p
        ),

      // Actual API call
      operation: async () => {
        const project = projects.find(p => p.id === projectId)!;
        return await apiClient.projects.update(projectId, {
          archived: !project.archived
        });
      },

      // Error handler - rollback happens automatically
      onError: (error) => {
        toast.error(errorMessageService.getDisplayMessage(error));
      },

      // Success handler
      onSuccess: (result) => {
        toast.success('Project updated successfully');
      }
    });
  };

  return (
    <div>
      {projects.map(project => (
        <ProjectCard
          key={project.id}
          project={project}
          onToggleArchive={() => handleToggleArchive(project.id)}
        />
      ))}
    </div>
  );
}
```

### Network Error Handling

```typescript
// hooks/useNetworkStatus.ts
import { useState, useEffect } from 'react';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// components/NetworkStatusBanner.tsx
export function NetworkStatusBanner() {
  const isOnline = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div className="network-status-banner offline">
      <AlertIcon />
      <span>No internet connection. Changes will be saved when you're back online.</span>
    </div>
  );
}

// Enhanced BaseAPIClient with network detection
class BaseAPIClient {
  async request<T>(config: RequestConfig): Promise<T> {
    // Check network status before making request
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new NetworkError('No internet connection');
    }

    // ... rest of request logic
  }
}
```

## IdentityClient Implementation Blueprint

### Method Specifications

```typescript
class IdentityClient {
  private apiClient: BaseAPIClient;

  constructor(apiClient: BaseAPIClient) {
    this.apiClient = apiClient;
  }

  async login(email: string, password: string, rememberMe?: boolean): Promise<LoginResult>;
  async logout(): Promise<void>;
  async getCurrentUser(): Promise<UserProfile>;
  async refreshSession(): Promise<UserProfile>;
  async changePassword(currentPassword: string, newPassword: string): Promise<void>;
  async requestPasswordReset(email: string): Promise<void>;
  async confirmPasswordReset(token: string, newPassword: string): Promise<void>;
  async updateProfile(updates: ProfileUpdate): Promise<UserProfile>;
}
```

### Response Types

```typescript
interface LoginResult {
  user: UserProfile;
  requiresMFA?: boolean;
  passwordExpired?: boolean;
}

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  companyId?: string;
  projectIds?: string[];
  lastLogin?: Date;
}
```

## Testing Strategy

### BaseAPIClient Tests

```typescript
describe('BaseAPIClient', () => {
  describe('request construction', () => {
    it('should construct correct URL with query params');
    it('should set required headers');
    it('should add correlation ID');
    it('should handle timeout correctly');
  });

  describe('error handling', () => {
    it('should categorize 401 as AuthError');
    it('should categorize 400 with fields as ValidationError');
    it('should categorize 500 as ServerError');
    it('should handle network errors');
  });

  describe('retry logic', () => {
    it('should retry GET on 503 Service Unavailable');
    it('should not retry POST requests');
    it('should not retry 400 errors');
    it('should use exponential backoff');
  });
});
```

### IdentityClient Tests

```typescript
describe('IdentityClient', () => {
  describe('login', () => {
    it('should return user profile on success');
    it('should handle wrong password error');
    it('should handle account locked error');
    it('should handle MFA required response');
  });

  describe('getCurrentUser', () => {
    it('should return current user when authenticated');
    it('should throw AuthError when not authenticated');
  });

  describe('security', () => {
    it('should never expose tokens in responses');
    it('should never store data in localStorage');
    it('should rely on HttpOnly cookies');
  });
});
```

## Integration with Redux

### Redux Slice Example

```typescript
// store/auth/authSlice.ts
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  },
  reducers: {
    // ... reducers
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

// Thunk using IdentityClient
export const loginAsync = createAsyncThunk(
  'auth/login',
  async ({ email, password }: LoginCredentials) => {
    const identityClient = new IdentityClient(apiClient);
    const result = await identityClient.login(email, password);
    return result.user;
  }
);
```

## Usage in React Components

### Login Component Example

```typescript
// components/auth/LoginForm.tsx
const LoginForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(state => state.auth);

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      await dispatch(loginAsync({
        email: values.email,
        password: values.password
      })).unwrap();

      // Redirect on success
      router.push('/dashboard');
    } catch (err) {
      // Error handled by Redux state
      console.error('Login failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      {error && <ErrorMessage error={error} />}
    </form>
  );
};
```

### Protected Route Example

```typescript
// components/guards/AuthGuard.tsx
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Check session on mount
    dispatch(checkAuthStatus());
  }, [dispatch]);

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return <>{children}</>;
};
```

## Migration Checklist

### Phase 1: Foundation (Sprint 1.1)
- [ ] Implement BaseAPIClient with error model
- [ ] Implement IdentityClient with all methods
- [ ] Write comprehensive unit tests
- [ ] Create TypeScript type definitions

### Phase 2: Integration (Sprint 1.2)
- [ ] Integrate with Redux auth slice
- [ ] Update login/logout components
- [ ] Implement auth guards
- [ ] Remove all localStorage token usage

### Phase 3: Service Clients (Sprint 1.3-1.4)
- [ ] Create OrganizationClient
- [ ] Create ReferenceClient
- [ ] Create ActivityClient
- [ ] Create CalculationClient

### Phase 4: Complete Migration (Sprint 2.1)
- [ ] Create ReportingClient
- [ ] Create AuditClient
- [ ] Remove all direct fetch() calls
- [ ] Performance testing

## Security Checklist

### Must Have
- ✓ HttpOnly cookies for auth tokens
- ✓ Secure flag on cookies (HTTPS only)
- ✓ SameSite cookie attribute
- ✓ No localStorage usage for sensitive data
- ✓ No token exposure in frontend code
- ✓ CORS properly configured
- ✓ XSS protection via CSP headers

### Nice to Have
- ○ Request signing for critical operations
- ○ Certificate pinning for mobile apps
- ○ Rate limiting on client side
- ○ Request/response encryption for sensitive data

## Performance Considerations

### Optimization Strategies
1. **Connection Pooling**: Reuse HTTP connections
2. **Request Deduplication**: Prevent duplicate in-flight requests
3. **Response Caching**: Cache GET responses with TTL
4. **Batch Requests**: Combine multiple requests when possible
5. **Compression**: Enable gzip for responses

### Monitoring
- Track API response times
- Monitor error rates by category
- Track retry attempts and success rates
- Measure cache hit rates

## Prompt for AI Implementation

When ready to generate the implementation code, use this prompt with the specification:

> "You are a senior frontend engineer. Using the 'BaseAPIClient & IdentityClient Implementation Guide' and the security requirements, implement:
>
> 1. BaseAPIClient - A reusable HTTP client that:
>    - Uses fetch() API with proper error handling
>    - Implements the defined error model with categories
>    - Adds correlation IDs to all requests
>    - Supports timeout and cancellation
>    - Implements retry logic for idempotent operations
>    - Never handles tokens directly (relies on HttpOnly cookies)
>
> 2. IdentityClient - Built on BaseAPIClient that:
>    - Implements all authentication methods
>    - Returns strongly typed responses
>    - Handles all error cases gracefully
>    - Never exposes tokens to frontend code
>
> Include comprehensive TypeScript types, unit tests with 100% coverage for critical paths, and JSDoc documentation. Follow Next.js 15 and React 19 best practices. The code should be production-ready and follow the security-first approach defined in the specification."

## Conclusion

This implementation guide provides a complete blueprint for building secure, maintainable API clients for the Clenergize V3 frontend. By following this specification, the frontend team can ensure:

1. **Security**: No XSS vulnerabilities from token storage
2. **Consistency**: Uniform error handling across all services
3. **Maintainability**: Clear separation of concerns
4. **Type Safety**: Full TypeScript coverage
5. **Testability**: Comprehensive test coverage

The BaseAPIClient/IdentityClient pattern establishes a solid foundation for all frontend-backend communication in the new architecture.