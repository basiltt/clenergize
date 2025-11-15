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