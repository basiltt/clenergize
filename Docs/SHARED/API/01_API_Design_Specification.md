# API Design Specification

**Version**: 1.0.0
**Last Updated**: November 18, 2025
**Status**: DESIGN PHASE
**Sprint**: 0.1
**Priority**: CRITICAL

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [API Design Principles](#api-design-principles)
3. [Authentication & Authorization](#authentication--authorization)
4. [API Versioning Strategy](#api-versioning-strategy)
5. [Error Handling Standards](#error-handling-standards)
6. [Rate Limiting & Throttling](#rate-limiting--throttling)
7. [Identity Service APIs](#identity-service-apis)
8. [Organization Service APIs](#organization-service-apis)
9. [Reference Service APIs](#reference-service-apis)
10. [Activity Service APIs](#activity-service-apis)
11. [Calculation Service APIs](#calculation-service-apis)
12. [Reporting Service APIs](#reporting-service-apis)
13. [Audit Service APIs](#audit-service-apis)
14. [GraphQL Schema](#graphql-schema)
15. [WebSocket Events](#websocket-events)
16. [API Gateway Configuration](#api-gateway-configuration)

---

## Executive Summary

This document defines the complete API surface for the Clenergize V3 microservices architecture, consisting of:

- **REST APIs**: 180+ endpoints across 7 services
- **GraphQL API**: Unified query layer for complex data fetching
- **WebSocket API**: Real-time updates for calculations, reports, and notifications
- **OpenAPI 3.1**: Complete specification for all REST endpoints

### API Statistics

| Service | REST Endpoints | GraphQL Queries | GraphQL Mutations | Total Operations |
|---------|----------------|-----------------|-------------------|------------------|
| Identity | 18 | 5 | 8 | 31 |
| Organization | 45 | 12 | 15 | 72 |
| Reference | 22 | 8 | 6 | 36 |
| Activity | 28 | 10 | 12 | 50 |
| Calculation | 15 | 6 | 4 | 25 |
| Reporting | 24 | 8 | 5 | 37 |
| Audit | 12 | 4 | 2 | 18 |
| **Total** | **164** | **53** | **52** | **269** |

### Key Improvements Over OLD System

| Issue in OLD | Solution in NEW | Impact |
|--------------|-----------------|--------|
| No API versioning | URL-based versioning (`/v1/`, `/v2/`) | Backward compatibility |
| Inconsistent error formats | RFC 7807 Problem Details | Better error handling |
| No rate limiting | Token bucket algorithm | Prevents abuse |
| Mixed REST/GraphQL patterns | Clear separation | Better performance |
| No OpenAPI documentation | OpenAPI 3.1 specs | Auto-generated docs |
| Hardcoded authentication | JWT with JWKS verification | Security compliance |

---

## API Design Principles

### 1. RESTful Design

```yaml
Principles:
  - Resource-oriented URLs: /v1/projects/{id}/activities
  - HTTP verbs match intent: GET (read), POST (create), PUT (update), DELETE (remove)
  - Stateless operations: No server-side session state
  - HATEOAS links: Include navigation links in responses
  - Idempotent operations: Safe retries for PUT/DELETE
```

### 2. Consistent Naming Conventions

```typescript
// Resource names: Plural nouns
GET /v1/users
GET /v1/projects
GET /v1/emission-factors

// Sub-resources: Nested under parent
GET /v1/projects/{projectId}/activities
GET /v1/organizations/{orgId}/projects

// Actions: Verb after resource (exception to REST)
POST /v1/calculations/{id}/recalculate
POST /v1/reports/{id}/regenerate
POST /v1/users/{id}/activate

// Query parameters: camelCase
GET /v1/activities?projectId=123&startDate=2024-01-01&includeDeleted=false

// Response fields: camelCase
{
  "userId": "uuid",
  "firstName": "John",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### 3. HTTP Status Codes

```yaml
Success Codes:
  200: OK - Successful GET, PUT, PATCH
  201: Created - Successful POST with resource creation
  202: Accepted - Async operation started (calculations, reports)
  204: No Content - Successful DELETE

Client Error Codes:
  400: Bad Request - Invalid request body/parameters
  401: Unauthorized - Missing or invalid authentication
  403: Forbidden - Valid auth but insufficient permissions
  404: Not Found - Resource does not exist
  409: Conflict - Resource already exists or version mismatch
  422: Unprocessable Entity - Validation errors
  429: Too Many Requests - Rate limit exceeded

Server Error Codes:
  500: Internal Server Error - Unexpected server error
  502: Bad Gateway - Upstream service failure
  503: Service Unavailable - Service temporarily down
  504: Gateway Timeout - Upstream service timeout
```

### 4. Request/Response Format

All APIs use JSON with UTF-8 encoding:

```typescript
// Request headers
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <JWT_TOKEN>",
  "X-Request-ID": "uuid-v4",
  "X-Client-Version": "1.0.0"
}

// Success response envelope
{
  "success": true,
  "data": { /* resource data */ },
  "metadata": {
    "timestamp": "2025-11-18T10:30:00Z",
    "version": "1.0.0",
    "requestId": "uuid-v4"
  }
}

// Error response (RFC 7807)
{
  "success": false,
  "error": {
    "type": "https://api.clenergize.com/errors/validation-error",
    "title": "Validation Failed",
    "status": 422,
    "detail": "Email address is required",
    "instance": "/v1/users",
    "timestamp": "2025-11-18T10:30:00Z",
    "requestId": "uuid-v4",
    "errors": [
      {
        "field": "email",
        "message": "Email address is required",
        "code": "REQUIRED_FIELD"
      }
    ]
  }
}

// Paginated response
{
  "success": true,
  "data": [ /* array of items */ ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalPages": 10,
    "totalItems": 200,
    "hasNext": true,
    "hasPrevious": false,
    "links": {
      "self": "/v1/users?page=1&pageSize=20",
      "next": "/v1/users?page=2&pageSize=20",
      "first": "/v1/users?page=1&pageSize=20",
      "last": "/v1/users?page=10&pageSize=20"
    }
  },
  "metadata": {
    "timestamp": "2025-11-18T10:30:00Z",
    "version": "1.0.0",
    "requestId": "uuid-v4"
  }
}
```

---

## Authentication & Authorization

### JWT Token Structure

```typescript
// JWT Header
{
  "alg": "RS256",
  "typ": "JWT",
  "kid": "key-id-from-jwks"
}

// JWT Payload
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "roles": ["ADMIN", "CARBON_MANAGER"],
  "permissions": [
    "projects:read",
    "projects:write",
    "calculations:execute"
  ],
  "organizationId": "org-uuid",
  "iss": "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_XXXXXX",
  "aud": "client-id",
  "exp": 1700000000,
  "iat": 1699996400,
  "jti": "token-uuid"
}
```

### Authorization Patterns

```typescript
// 1. Role-Based Access Control (RBAC)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'CARBON_MANAGER')
@Get('/v1/projects')
async getProjects() { }

// 2. Permission-Based Access Control (PBAC)
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('projects:read')
@Get('/v1/projects/:id')
async getProject() { }

// 3. Resource Ownership
@UseGuards(JwtAuthGuard, ResourceOwnershipGuard)
@Get('/v1/projects/:id')
async getProject(@Param('id') id: string, @CurrentUser() user: User) {
  // Guard checks: user.organizationId === project.organizationId
}

// 4. Attribute-Based Access Control (ABAC)
@UseGuards(JwtAuthGuard, AbacGuard)
@CheckPolicy((user, resource) => {
  return user.organizationId === resource.organizationId &&
         (user.roles.includes('ADMIN') || resource.ownerId === user.id);
})
@Put('/v1/projects/:id')
async updateProject() { }
```

### Permission Matrix

| Resource | VIEWER | CONTRIBUTOR | MANAGER | ADMIN |
|----------|--------|-------------|---------|-------|
| **Projects** |
| Read | ✓ | ✓ | ✓ | ✓ |
| Create | ✗ | ✗ | ✓ | ✓ |
| Update | ✗ | ✓ | ✓ | ✓ |
| Delete | ✗ | ✗ | ✓ | ✓ |
| Archive | ✗ | ✗ | ✓ | ✓ |
| **Activity Data** |
| Read | ✓ | ✓ | ✓ | ✓ |
| Create | ✗ | ✓ | ✓ | ✓ |
| Update | ✗ | ✓ | ✓ | ✓ |
| Delete | ✗ | ✗ | ✓ | ✓ |
| Verify | ✗ | ✗ | ✓ | ✓ |
| **Calculations** |
| Read | ✓ | ✓ | ✓ | ✓ |
| Execute | ✗ | ✓ | ✓ | ✓ |
| Recalculate | ✗ | ✗ | ✓ | ✓ |
| **Reports** |
| Read | ✓ | ✓ | ✓ | ✓ |
| Generate | ✗ | ✓ | ✓ | ✓ |
| Export | ✗ | ✓ | ✓ | ✓ |
| Schedule | ✗ | ✗ | ✓ | ✓ |
| **Users** |
| Read | ✓ | ✓ | ✓ | ✓ |
| Invite | ✗ | ✗ | ✓ | ✓ |
| Update Roles | ✗ | ✗ | ✗ | ✓ |
| Delete | ✗ | ✗ | ✗ | ✓ |

---

## API Versioning Strategy

### URL-Based Versioning

```
https://api.clenergize.com/v1/projects
https://api.clenergize.com/v2/projects
```

**Benefits**:
- Clear and explicit
- Easy to route at gateway level
- Simple for clients to adopt

### Deprecation Policy

```yaml
Version Lifecycle:
  - v1 (Current):
      Status: Active
      Support: Full support + new features

  - v2 (Beta):
      Status: Preview
      Support: Limited support, may change
      Header: X-API-Version: v2-beta

  - v1 (Deprecated):
      Status: Deprecated
      Support: Bug fixes only, no new features
      Sunset Date: 6 months from deprecation
      Headers:
        Warning: "299 - API version v1 is deprecated. Migrate to v2 by 2025-06-01"
        Sunset: "Sat, 01 Jun 2025 00:00:00 GMT"

  - v1 (Removed):
      Status: Removed
      Response: 410 Gone
```

### Breaking vs Non-Breaking Changes

```yaml
Non-Breaking Changes (Same version):
  - Adding new endpoints
  - Adding optional request parameters
  - Adding new response fields
  - Adding new HTTP methods to existing endpoints
  - Relaxing validation rules

Breaking Changes (New version):
  - Removing endpoints
  - Removing request/response fields
  - Changing field types
  - Renaming fields
  - Making optional fields required
  - Changing authentication mechanism
  - Changing URL structure
```

---

## Error Handling Standards

### RFC 7807 Problem Details

All errors follow the [RFC 7807](https://tools.ietf.org/html/rfc7807) standard:

```typescript
interface ProblemDetails {
  type: string;        // URI identifying the problem type
  title: string;       // Short, human-readable summary
  status: number;      // HTTP status code
  detail: string;      // Human-readable explanation
  instance: string;    // URI identifying the specific occurrence
  timestamp: string;   // ISO 8601 timestamp
  requestId: string;   // Correlation ID for tracing
  errors?: ValidationError[];  // Detailed validation errors
}

interface ValidationError {
  field: string;       // Field that failed validation
  message: string;     // Error message
  code: string;        // Machine-readable error code
  value?: any;         // The invalid value (if safe to expose)
}
```

### Error Type Taxonomy

```typescript
// Base error types
const ERROR_TYPES = {
  // Client Errors (4xx)
  VALIDATION_ERROR: {
    type: 'https://api.clenergize.com/errors/validation-error',
    title: 'Validation Failed',
    status: 422
  },
  AUTHENTICATION_ERROR: {
    type: 'https://api.clenergize.com/errors/authentication-error',
    title: 'Authentication Failed',
    status: 401
  },
  AUTHORIZATION_ERROR: {
    type: 'https://api.clenergize.com/errors/authorization-error',
    title: 'Insufficient Permissions',
    status: 403
  },
  RESOURCE_NOT_FOUND: {
    type: 'https://api.clenergize.com/errors/not-found',
    title: 'Resource Not Found',
    status: 404
  },
  RESOURCE_CONFLICT: {
    type: 'https://api.clenergize.com/errors/conflict',
    title: 'Resource Conflict',
    status: 409
  },
  RATE_LIMIT_EXCEEDED: {
    type: 'https://api.clenergize.com/errors/rate-limit',
    title: 'Too Many Requests',
    status: 429
  },

  // Server Errors (5xx)
  INTERNAL_SERVER_ERROR: {
    type: 'https://api.clenergize.com/errors/internal-error',
    title: 'Internal Server Error',
    status: 500
  },
  SERVICE_UNAVAILABLE: {
    type: 'https://api.clenergize.com/errors/service-unavailable',
    title: 'Service Temporarily Unavailable',
    status: 503
  },

  // Domain-Specific Errors
  CALCULATION_FAILED: {
    type: 'https://api.clenergize.com/errors/calculation-failed',
    title: 'Emission Calculation Failed',
    status: 422
  },
  EMISSION_FACTOR_NOT_FOUND: {
    type: 'https://api.clenergize.com/errors/emission-factor-not-found',
    title: 'Emission Factor Not Available',
    status: 404
  },
  HIERARCHY_CYCLE_DETECTED: {
    type: 'https://api.clenergize.com/errors/hierarchy-cycle',
    title: 'Circular Hierarchy Reference',
    status: 422
  }
};
```

### Example Error Responses

```typescript
// Validation Error (422)
{
  "success": false,
  "error": {
    "type": "https://api.clenergize.com/errors/validation-error",
    "title": "Validation Failed",
    "status": 422,
    "detail": "Request validation failed for 3 fields",
    "instance": "/v1/projects",
    "timestamp": "2025-11-18T10:30:00Z",
    "requestId": "req-uuid",
    "errors": [
      {
        "field": "name",
        "message": "Project name is required",
        "code": "REQUIRED_FIELD"
      },
      {
        "field": "startDate",
        "message": "Start date must be before end date",
        "code": "INVALID_DATE_RANGE",
        "value": "2025-12-31"
      },
      {
        "field": "hierarchyTemplateId",
        "message": "Hierarchy template not found",
        "code": "RESOURCE_NOT_FOUND"
      }
    ]
  }
}

// Authentication Error (401)
{
  "success": false,
  "error": {
    "type": "https://api.clenergize.com/errors/authentication-error",
    "title": "Authentication Failed",
    "status": 401,
    "detail": "JWT token has expired",
    "instance": "/v1/projects/123",
    "timestamp": "2025-11-18T10:30:00Z",
    "requestId": "req-uuid"
  }
}

// Rate Limit Error (429)
{
  "success": false,
  "error": {
    "type": "https://api.clenergize.com/errors/rate-limit",
    "title": "Too Many Requests",
    "status": 429,
    "detail": "Rate limit of 100 requests per minute exceeded",
    "instance": "/v1/calculations",
    "timestamp": "2025-11-18T10:30:00Z",
    "requestId": "req-uuid",
    "retryAfter": 45  // seconds
  }
}
```

---

## Rate Limiting & Throttling

### Rate Limit Strategy

```yaml
Rate Limits by Tier:
  Free:
    Requests per minute: 60
    Requests per hour: 1000
    Concurrent requests: 5

  Pro:
    Requests per minute: 300
    Requests per hour: 10000
    Concurrent requests: 20

  Enterprise:
    Requests per minute: 1000
    Requests per hour: 50000
    Concurrent requests: 100

Special Limits:
  Bulk Import: 10 per hour (all tiers)
  Report Generation: 50 per hour (Free), 200 per hour (Pro), unlimited (Enterprise)
  Calculation Engine: 100 per minute (Free), 500 per minute (Pro), unlimited (Enterprise)
```

### Rate Limit Headers

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1700000000
X-RateLimit-Retry-After: 18
```

### Token Bucket Algorithm

```typescript
interface RateLimiter {
  checkLimit(userId: string, endpoint: string): Promise<RateLimitResult>;
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

class TokenBucketRateLimiter implements RateLimiter {
  async checkLimit(userId: string, endpoint: string): Promise<RateLimitResult> {
    const key = `ratelimit:${userId}:${endpoint}`;
    const bucket = await this.redis.hgetall(key);

    const limit = this.getLimitForUser(userId);
    const tokens = parseInt(bucket.tokens || limit);
    const lastRefill = parseInt(bucket.lastRefill || Date.now());

    // Refill tokens based on time elapsed
    const now = Date.now();
    const elapsedSeconds = (now - lastRefill) / 1000;
    const refillRate = limit / 60; // tokens per second
    const newTokens = Math.min(limit, tokens + (elapsedSeconds * refillRate));

    if (newTokens >= 1) {
      // Allow request, consume 1 token
      await this.redis.hset(key, {
        tokens: newTokens - 1,
        lastRefill: now
      });
      await this.redis.expire(key, 3600); // 1 hour TTL

      return {
        allowed: true,
        limit,
        remaining: Math.floor(newTokens - 1),
        resetAt: now + ((limit - newTokens + 1) / refillRate * 1000)
      };
    } else {
      // Deny request
      return {
        allowed: false,
        limit,
        remaining: 0,
        resetAt: now + ((1 - newTokens) / refillRate * 1000),
        retryAfter: Math.ceil((1 - newTokens) / refillRate)
      };
    }
  }
}
```

---

## Identity Service APIs

**Base URL**: `https://api.clenergize.com/v1`
**Service Port**: 3001
**Total Endpoints**: 18

### Authentication APIs

#### POST /v1/auth/register

Register a new user account.

```yaml
Summary: Register new user
Authentication: None (public endpoint)
Rate Limit: 10 per hour per IP

Request Body:
  type: object
  required: [email, password, firstName, lastName]
  properties:
    email:
      type: string
      format: email
      example: user@example.com
    password:
      type: string
      format: password
      minLength: 12
      pattern: ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$
      example: SecureP@ssw0rd!
    firstName:
      type: string
      minLength: 1
      maxLength: 50
      example: John
    lastName:
      type: string
      minLength: 1
      maxLength: 50
      example: Doe
    organizationName:
      type: string
      minLength: 1
      maxLength: 100
      example: Acme Corporation

Response (201 Created):
  {
    "success": true,
    "data": {
      "userId": "uuid",
      "email": "user@example.com",
      "status": "PENDING_VERIFICATION",
      "verificationEmailSent": true
    },
    "metadata": {
      "timestamp": "2025-11-18T10:30:00Z",
      "version": "1.0.0",
      "requestId": "uuid"
    }
  }

Errors:
  - 400: Invalid request body
  - 409: Email already registered
  - 422: Password does not meet requirements
```

#### POST /v1/auth/login

Authenticate user and obtain JWT token.

```yaml
Summary: Login user
Authentication: None (public endpoint)
Rate Limit: 5 per minute per IP

Request Body:
  type: object
  required: [email, password]
  properties:
    email:
      type: string
      format: email
    password:
      type: string
      format: password
    mfaCode:
      type: string
      pattern: ^\d{6}$
      description: Required if MFA is enabled

Response (200 OK):
  {
    "success": true,
    "data": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "expiresIn": 3600,
      "tokenType": "Bearer",
      "user": {
        "userId": "uuid",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "roles": ["CARBON_MANAGER"],
        "organizationId": "uuid"
      }
    },
    "metadata": {
      "timestamp": "2025-11-18T10:30:00Z",
      "version": "1.0.0",
      "requestId": "uuid"
    }
  }

Errors:
  - 401: Invalid credentials
  - 403: Account suspended
  - 422: MFA code required but not provided
  - 429: Too many login attempts (account locked for 30 minutes)
```

#### POST /v1/auth/refresh

Refresh expired access token using refresh token.

```yaml
Summary: Refresh access token
Authentication: Refresh token in request body
Rate Limit: 10 per minute

Request Body:
  type: object
  required: [refreshToken]
  properties:
    refreshToken:
      type: string

Response (200 OK):
  {
    "success": true,
    "data": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "expiresIn": 3600,
      "tokenType": "Bearer"
    }
  }

Errors:
  - 401: Invalid or expired refresh token
```

#### POST /v1/auth/logout

Invalidate current session and tokens.

```yaml
Summary: Logout user
Authentication: Bearer token required
Rate Limit: 10 per minute

Request Body: None

Response (204 No Content)

Errors:
  - 401: Invalid token
```

#### POST /v1/auth/forgot-password

Request password reset email.

```yaml
Summary: Request password reset
Authentication: None (public endpoint)
Rate Limit: 3 per hour per IP

Request Body:
  type: object
  required: [email]
  properties:
    email:
      type: string
      format: email

Response (200 OK):
  {
    "success": true,
    "data": {
      "message": "If an account exists with this email, a password reset link has been sent",
      "expiresIn": 3600
    }
  }

Note: Always returns 200 even if email doesn't exist (security best practice)
```

#### POST /v1/auth/reset-password

Reset password using reset token from email.

```yaml
Summary: Reset password
Authentication: Reset token from email
Rate Limit: 5 per hour

Request Body:
  type: object
  required: [token, newPassword]
  properties:
    token:
      type: string
    newPassword:
      type: string
      format: password
      minLength: 12

Response (200 OK):
  {
    "success": true,
    "data": {
      "message": "Password successfully reset"
    }
  }

Errors:
  - 400: Invalid or expired reset token
  - 422: Password does not meet requirements
```

### User Management APIs

#### GET /v1/users/me

Get current authenticated user's profile.

```yaml
Summary: Get current user profile
Authentication: Bearer token required
Rate Limit: 100 per minute

Response (200 OK):
  {
    "success": true,
    "data": {
      "userId": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "roles": ["CARBON_MANAGER", "CONTRIBUTOR"],
      "permissions": ["projects:read", "projects:write", "calculations:execute"],
      "organizationId": "uuid",
      "status": "ACTIVE",
      "mfaEnabled": true,
      "emailVerified": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "lastLoginAt": "2025-11-18T09:00:00Z",
      "preferences": {
        "language": "en",
        "timezone": "America/New_York",
        "dateFormat": "MM/DD/YYYY",
        "measurementSystem": "metric"
      }
    }
  }
```

#### PUT /v1/users/me

Update current user's profile.

```yaml
Summary: Update current user profile
Authentication: Bearer token required
Rate Limit: 20 per minute

Request Body:
  type: object
  properties:
    firstName:
      type: string
    lastName:
      type: string
    preferences:
      type: object
      properties:
        language: { type: string, enum: [en, es, fr, de] }
        timezone: { type: string }
        dateFormat: { type: string, enum: [MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD] }
        measurementSystem: { type: string, enum: [metric, imperial] }

Response (200 OK): Same as GET /v1/users/me
```

#### GET /v1/users

List users in organization (admin only).

```yaml
Summary: List users
Authentication: Bearer token required
Authorization: ADMIN role required
Rate Limit: 100 per minute

Query Parameters:
  - page: integer (default: 1)
  - pageSize: integer (default: 20, max: 100)
  - search: string (search by name or email)
  - role: string (filter by role)
  - status: string (filter by status: ACTIVE, SUSPENDED, PENDING)
  - sortBy: string (default: createdAt)
  - sortOrder: string (default: desc)

Response (200 OK): Paginated list of users
```

#### POST /v1/users/{userId}/roles

Assign role to user (admin only).

```yaml
Summary: Assign role
Authentication: Bearer token required
Authorization: ADMIN role required
Rate Limit: 50 per minute

Request Body:
  type: object
  required: [role]
  properties:
    role:
      type: string
      enum: [VIEWER, CONTRIBUTOR, MANAGER, ADMIN]
    scope:
      type: object
      properties:
        projectId: { type: string }
        organizationId: { type: string }

Response (200 OK): Updated user object
```

### MFA (Multi-Factor Authentication) APIs

#### POST /v1/auth/mfa/enable

Enable two-factor authentication.

```yaml
Summary: Enable MFA
Authentication: Bearer token required
Rate Limit: 5 per hour

Request Body: None

Response (200 OK):
  {
    "success": true,
    "data": {
      "secret": "BASE32SECRET",
      "qrCode": "data:image/png;base64,...",
      "backupCodes": [
        "XXXXXXXX",
        "XXXXXXXX",
        "XXXXXXXX"
      ]
    }
  }
```

#### POST /v1/auth/mfa/verify

Verify and activate MFA.

```yaml
Summary: Verify MFA setup
Authentication: Bearer token required
Rate Limit: 10 per hour

Request Body:
  type: object
  required: [code]
  properties:
    code:
      type: string
      pattern: ^\d{6}$

Response (200 OK):
  {
    "success": true,
    "data": {
      "mfaEnabled": true,
      "backupCodes": ["..."]
    }
  }
```

#### POST /v1/auth/mfa/disable

Disable two-factor authentication.

```yaml
Summary: Disable MFA
Authentication: Bearer token required
Rate Limit: 5 per hour

Request Body:
  type: object
  required: [password, code]
  properties:
    password: { type: string }
    code: { type: string, pattern: ^\d{6}$ }

Response (200 OK):
  {
    "success": true,
    "data": {
      "mfaEnabled": false
    }
  }
```

### Session Management APIs

#### GET /v1/sessions

List active sessions for current user.

```yaml
Summary: List active sessions
Authentication: Bearer token required
Rate Limit: 50 per minute

Response (200 OK):
  {
    "success": true,
    "data": [
      {
        "sessionId": "uuid",
        "deviceInfo": {
          "userAgent": "Mozilla/5.0...",
          "ipAddress": "192.168.1.1",
          "location": "New York, US"
        },
        "createdAt": "2025-11-18T09:00:00Z",
        "lastActivity": "2025-11-18T10:30:00Z",
        "expiresAt": "2025-11-18T13:00:00Z",
        "current": true
      }
    ]
  }
```

#### DELETE /v1/sessions/{sessionId}

Revoke a specific session.

```yaml
Summary: Revoke session
Authentication: Bearer token required
Rate Limit: 20 per minute

Response (204 No Content)
```

---

## Organization Service APIs

**Base URL**: `https://api.clenergize.com/v1`
**Service Port**: 3002
**Total Endpoints**: 45

### Organization Management

#### POST /v1/organizations

Create a new organization.

```yaml
Summary: Create organization
Authentication: Bearer token required
Rate Limit: 10 per hour

Request Body:
  type: object
  required: [name, country]
  properties:
    name:
      type: string
      minLength: 1
      maxLength: 100
      example: Acme Corporation
    industry:
      type: string
      enum: [MANUFACTURING, TECHNOLOGY, FINANCE, HEALTHCARE, RETAIL, OTHER]
    size:
      type: string
      enum: [SMALL, MEDIUM, LARGE, ENTERPRISE]
    country:
      type: string
      pattern: ^[A-Z]{2}$
      example: US
    address:
      type: object
      properties:
        street: { type: string }
        city: { type: string }
        state: { type: string }
        postalCode: { type: string }
        country: { type: string }
    subscriptionTier:
      type: string
      enum: [FREE, PRO, ENTERPRISE]
      default: FREE

Response (201 Created):
  {
    "success": true,
    "data": {
      "organizationId": "uuid",
      "name": "Acme Corporation",
      "industry": "TECHNOLOGY",
      "size": "MEDIUM",
      "country": "US",
      "subscriptionTier": "PRO",
      "status": "ACTIVE",
      "createdAt": "2025-11-18T10:30:00Z",
      "ownerId": "uuid"
    }
  }
```

#### GET /v1/organizations/{organizationId}

Get organization details.

```yaml
Summary: Get organization
Authentication: Bearer token required
Authorization: User must belong to organization
Rate Limit: 100 per minute

Response (200 OK):
  {
    "success": true,
    "data": {
      "organizationId": "uuid",
      "name": "Acme Corporation",
      "industry": "TECHNOLOGY",
      "size": "MEDIUM",
      "country": "US",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "postalCode": "10001",
        "country": "US"
      },
      "subscriptionTier": "PRO",
      "status": "ACTIVE",
      "stats": {
        "totalProjects": 15,
        "totalUsers": 42,
        "totalEmissions": 1250.5,
        "dataQualityScore": 4.2
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2025-11-18T10:30:00Z"
    }
  }
```

#### PUT /v1/organizations/{organizationId}

Update organization details.

```yaml
Summary: Update organization
Authentication: Bearer token required
Authorization: ADMIN role required
Rate Limit: 20 per minute

Request Body: Partial update (any subset of create fields)

Response (200 OK): Updated organization object
```

#### DELETE /v1/organizations/{organizationId}

Delete organization (soft delete).

```yaml
Summary: Delete organization
Authentication: Bearer token required
Authorization: ADMIN role required
Rate Limit: 5 per hour

Query Parameters:
  - hardDelete: boolean (default: false) - permanent deletion
  - retentionDays: integer (default: 90) - days to keep archived data

Response (204 No Content)
```

### Project Management

#### POST /v1/projects

Create a new carbon footprint project.

```yaml
Summary: Create project
Authentication: Bearer token required
Authorization: MANAGER or ADMIN role required
Rate Limit: 50 per hour

Request Body:
  type: object
  required: [name, startDate, endDate]
  properties:
    name:
      type: string
      minLength: 1
      maxLength: 255
      example: 2024 Carbon Footprint Assessment
    description:
      type: string
      maxLength: 1000
    startDate:
      type: string
      format: date
      example: "2024-01-01"
    endDate:
      type: string
      format: date
      example: "2024-12-31"
    hierarchyTemplateId:
      type: string
      format: uuid
      description: Reference to hierarchy template (NOT cloned!)
    modules:
      type: array
      items:
        type: string
        enum: [
          STATIONARY_COMBUSTION,
          MOBILE_COMBUSTION,
          ELECTRICITY,
          REFRIGERANTS,
          WASTE,
          WATER,
          BUSINESS_TRAVEL,
          EMPLOYEE_COMMUTING,
          PURCHASED_GOODS
        ]
      example: [STATIONARY_COMBUSTION, ELECTRICITY, BUSINESS_TRAVEL]
    baseline:
      type: object
      properties:
        year: { type: integer }
        totalEmissions: { type: number }

Response (201 Created):
  {
    "success": true,
    "data": {
      "projectId": "uuid",
      "name": "2024 Carbon Footprint Assessment",
      "description": "Annual GHG inventory",
      "startDate": "2024-01-01",
      "endDate": "2024-12-31",
      "status": "DRAFT",
      "hierarchyReference": {
        "templateId": "uuid",
        "version": "1.0.0",
        "snapshotId": "uuid"
      },
      "modules": ["STATIONARY_COMBUSTION", "ELECTRICITY"],
      "createdAt": "2025-11-18T10:30:00Z",
      "ownerId": "uuid",
      "organizationId": "uuid"
    }
  }
```

#### GET /v1/projects

List projects.

```yaml
Summary: List projects
Authentication: Bearer token required
Rate Limit: 100 per minute

Query Parameters:
  - page: integer (default: 1)
  - pageSize: integer (default: 20, max: 100)
  - status: string (DRAFT, ACTIVE, COMPLETED, ARCHIVED)
  - search: string (search by name or description)
  - startDate: string (filter by start date >= value)
  - endDate: string (filter by end date <= value)
  - sortBy: string (default: createdAt)
  - sortOrder: string (default: desc)

Response (200 OK): Paginated list of projects
```

#### GET /v1/projects/{projectId}

Get project details.

```yaml
Summary: Get project
Authentication: Bearer token required
Authorization: projects:read permission required
Rate Limit: 100 per minute

Response (200 OK):
  {
    "success": true,
    "data": {
      "projectId": "uuid",
      "name": "2024 Carbon Footprint Assessment",
      "description": "Annual GHG inventory",
      "startDate": "2024-01-01",
      "endDate": "2024-12-31",
      "status": "ACTIVE",
      "hierarchyReference": {
        "templateId": "uuid",
        "version": "1.0.0",
        "snapshotId": "uuid",
        "hierarchyName": "Corporate Structure 2024"
      },
      "modules": ["STATIONARY_COMBUSTION", "ELECTRICITY"],
      "stats": {
        "totalEmissions": 1250.5,
        "scope1": 450.2,
        "scope2": 300.3,
        "scope3": 500.0,
        "dataCompleteness": 85.5,
        "lastCalculatedAt": "2025-11-18T09:00:00Z"
      },
      "team": [
        {
          "userId": "uuid",
          "name": "John Doe",
          "role": "MANAGER",
          "addedAt": "2024-01-01T00:00:00Z"
        }
      ],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2025-11-18T10:30:00Z",
      "ownerId": "uuid",
      "organizationId": "uuid"
    }
  }
```

#### PUT /v1/projects/{projectId}

Update project details.

```yaml
Summary: Update project
Authentication: Bearer token required
Authorization: projects:write permission required
Rate Limit: 50 per minute

Request Body: Partial update (any subset of create fields except hierarchyTemplateId)

Response (200 OK): Updated project object

Note: Cannot change hierarchyTemplateId once set. Create new project instead.
```

#### DELETE /v1/projects/{projectId}

Delete project.

```yaml
Summary: Delete project
Authentication: Bearer token required
Authorization: projects:delete permission required
Rate Limit: 10 per hour

Query Parameters:
  - cascade: boolean (default: false) - delete associated activity data and calculations

Response (200 OK):
  {
    "success": true,
    "data": {
      "projectId": "uuid",
      "deletedAt": "2025-11-18T10:30:00Z",
      "cascadeDelete": true,
      "affectedRecords": {
        "activityData": 150,
        "calculations": 150,
        "reports": 5
      }
    }
  }

Errors:
  - 409: Project has data and cascade=false
```

#### POST /v1/projects/{projectId}/archive

Archive project (make read-only).

```yaml
Summary: Archive project
Authentication: Bearer token required
Authorization: projects:write permission required
Rate Limit: 20 per hour

Request Body:
  type: object
  properties:
    reason:
      type: string
      maxLength: 500

Response (200 OK):
  {
    "success": true,
    "data": {
      "projectId": "uuid",
      "status": "ARCHIVED",
      "archivedAt": "2025-11-18T10:30:00Z",
      "readOnlyMode": true
    }
  }
```

#### POST /v1/projects/{projectId}/restore

Restore archived project.

```yaml
Summary: Restore project
Authentication: Bearer token required
Authorization: projects:write permission required
Rate Limit: 20 per hour

Response (200 OK): Restored project object
```

### Hierarchy Management

#### POST /v1/hierarchies

Create hierarchy template.

```yaml
Summary: Create hierarchy template
Authentication: Bearer token required
Authorization: MANAGER or ADMIN role required
Rate Limit: 20 per hour

Request Body:
  type: object
  required: [name, rootNode]
  properties:
    name:
      type: string
      example: Corporate Structure 2024
    description:
      type: string
    rootNode:
      type: object
      required: [nodeType, name]
      properties:
        nodeType:
          type: string
          enum: [COMPANY, ENTITY, SUBSIDIARY, LOCATION]
        name:
          type: string
        metadata:
          type: object
          properties:
            country: { type: string }
            employeeCount: { type: integer }
            floorArea: { type: number }
            revenue: { type: number }

Response (201 Created):
  {
    "success": true,
    "data": {
      "hierarchyId": "uuid",
      "name": "Corporate Structure 2024",
      "version": "1.0.0",
      "rootNode": {
        "nodeId": "uuid",
        "nodeType": "COMPANY",
        "name": "Acme Corporation",
        "level": 0,
        "children": []
      },
      "createdAt": "2025-11-18T10:30:00Z"
    }
  }
```

#### POST /v1/hierarchies/{hierarchyId}/nodes

Add node to hierarchy.

```yaml
Summary: Add hierarchy node
Authentication: Bearer token required
Authorization: projects:write permission required
Rate Limit: 100 per minute

Request Body:
  type: object
  required: [parentNodeId, nodeType, name]
  properties:
    parentNodeId:
      type: string
      format: uuid
    nodeType:
      type: string
      enum: [ENTITY, SUBSIDIARY, LOCATION]
    name:
      type: string
    metadata:
      type: object

Response (201 Created): Node object with computed level
```

#### PUT /v1/hierarchies/{hierarchyId}/nodes/{nodeId}/move

Move node to different parent.

```yaml
Summary: Move hierarchy node
Authentication: Bearer token required
Authorization: projects:write permission required
Rate Limit: 50 per minute

Request Body:
  type: object
  required: [newParentId]
  properties:
    newParentId:
      type: string
      format: uuid
    reason:
      type: string

Response (200 OK): Updated node with new parent and level

Errors:
  - 422: Would create circular reference
```

#### DELETE /v1/hierarchies/{hierarchyId}/nodes/{nodeId}

Remove node from hierarchy.

```yaml
Summary: Delete hierarchy node
Authentication: Bearer token required
Authorization: projects:write permission required
Rate Limit: 20 per minute

Query Parameters:
  - cascade: boolean (default: false) - delete children nodes

Response (200 OK):
  {
    "success": true,
    "data": {
      "nodeId": "uuid",
      "cascadeDelete": true,
      "affectedChildren": 5,
      "deletedAt": "2025-11-18T10:30:00Z"
    }
  }
```

### Permission Management

#### POST /v1/permissions

Grant permission to user.

```yaml
Summary: Grant permission
Authentication: Bearer token required
Authorization: ADMIN role required
Rate Limit: 50 per minute

Request Body:
  type: object
  required: [userId, resourceType, resourceId, permissions]
  properties:
    userId:
      type: string
      format: uuid
    resourceType:
      type: string
      enum: [ORGANIZATION, PROJECT, HIERARCHY, REPORT]
    resourceId:
      type: string
      format: uuid
    permissions:
      type: array
      items:
        type: string
        enum: [READ, WRITE, DELETE, ADMIN]
    expiresAt:
      type: string
      format: date-time
      description: Optional expiration date

Response (201 Created):
  {
    "success": true,
    "data": {
      "permissionId": "uuid",
      "userId": "uuid",
      "resourceType": "PROJECT",
      "resourceId": "uuid",
      "permissions": ["READ", "WRITE"],
      "grantedBy": "uuid",
      "grantedAt": "2025-11-18T10:30:00Z",
      "expiresAt": null
    }
  }
```

#### DELETE /v1/permissions/{permissionId}

Revoke permission.

```yaml
Summary: Revoke permission
Authentication: Bearer token required
Authorization: ADMIN role required
Rate Limit: 50 per minute

Response (204 No Content)
```

#### GET /v1/users/{userId}/permissions

List user's permissions.

```yaml
Summary: List user permissions
Authentication: Bearer token required
Rate Limit: 100 per minute

Response (200 OK):
  {
    "success": true,
    "data": [
      {
        "permissionId": "uuid",
        "resourceType": "PROJECT",
        "resourceId": "uuid",
        "resourceName": "2024 Carbon Footprint",
        "permissions": ["READ", "WRITE"],
        "grantedAt": "2025-01-01T00:00:00Z",
        "expiresAt": null
      }
    ]
  }
```

### Reporting Year Management

#### POST /v1/projects/{projectId}/reporting-years

Create reporting year for project.

```yaml
Summary: Create reporting year
Authentication: Bearer token required
Authorization: projects:write permission required
Rate Limit: 20 per hour

Request Body:
  type: object
  required: [year]
  properties:
    year:
      type: integer
      minimum: 1900
      maximum: 2100
      example: 2024
    startDate:
      type: string
      format: date
      example: "2024-01-01"
    endDate:
      type: string
      format: date
      example: "2024-12-31"
    fiscalYearOffset:
      type: integer
      description: Months offset from calendar year
      example: 0

Response (201 Created):
  {
    "success": true,
    "data": {
      "yearId": "uuid",
      "projectId": "uuid",
      "year": 2024,
      "startDate": "2024-01-01",
      "endDate": "2024-12-31",
      "fiscalYearOffset": 0,
      "status": "DRAFT",
      "createdAt": "2025-11-18T10:30:00Z"
    }
  }
```

#### POST /v1/reporting-years/{yearId}/lock

Lock reporting year (prevent data changes).

```yaml
Summary: Lock reporting year
Authentication: Bearer token required
Authorization: MANAGER or ADMIN role required
Rate Limit: 10 per hour

Request Body:
  type: object
  required: [lockReason]
  properties:
    lockReason:
      type: string
      enum: [AUDIT, COMPLIANCE, FINAL_REPORT]
    allowsRecalculation:
      type: boolean
      default: false

Response (200 OK):
  {
    "success": true,
    "data": {
      "yearId": "uuid",
      "status": "LOCKED",
      "lockedBy": "uuid",
      "lockedAt": "2025-11-18T10:30:00Z",
      "lockReason": "AUDIT",
      "allowsRecalculation": false
    }
  }
```

---

## Reference Service APIs

**Base URL**: `https://api.clenergize.com/v1`
**Service Port**: 3003
**Total Endpoints**: 22

### Emission Factor Management

#### GET /v1/emission-factors

List emission factors with filtering.

```yaml
Summary: List emission factors
Authentication: Bearer token required
Rate Limit: 100 per minute

Query Parameters:
  - page: integer (default: 1)
  - pageSize: integer (default: 50, max: 200)
  - scope: integer (1, 2, or 3)
  - category: string
  - geography: string (ISO country code)
  - source: string (DEFRA, EPA, IPCC, CUSTOM)
  - search: string (search by name)
  - validOn: string (date - get factors valid on this date)
  - includeDeprecated: boolean (default: false)

Response (200 OK):
  {
    "success": true,
    "data": [
      {
        "emissionFactorId": "uuid",
        "name": "Natural Gas - Stationary Combustion",
        "category": "STATIONARY_COMBUSTION",
        "subcategory": "NATURAL_GAS",
        "scope": 1,
        "unit": "kg CO2e/kWh",
        "value": 0.18391,
        "source": "DEFRA",
        "sourceReference": "2024 Conversion Factors",
        "geography": "GB",
        "validFrom": "2024-01-01",
        "validTo": null,
        "version": "2024.1.0",
        "status": "ACTIVE",
        "gasBreakdown": {
          "co2": 0.18316,
          "ch4": 0.00001,
          "n2o": 0.00074
        },
        "metadata": {
          "netCalorificValue": 38.1,
          "grossCalorificValue": 42.3,
          "uncertaintyRange": "±5%"
        }
      }
    ],
    "pagination": { /* pagination object */ }
  }
```

#### GET /v1/emission-factors/{factorId}

Get emission factor details.

```yaml
Summary: Get emission factor
Authentication: Bearer token required
Rate Limit: 200 per minute

Response (200 OK): Single emission factor object with full details
```

#### POST /v1/emission-factors

Create custom emission factor (organization-specific).

```yaml
Summary: Create custom emission factor
Authentication: Bearer token required
Authorization: MANAGER or ADMIN role required
Rate Limit: 20 per hour

Request Body:
  type: object
  required: [name, value, unit, scope, justification]
  properties:
    name:
      type: string
      example: Custom Electricity Factor - Solar Mix
    category:
      type: string
    value:
      type: number
      minimum: 0
      example: 0.05
    unit:
      type: string
      example: kg CO2e/kWh
    scope:
      type: integer
      enum: [1, 2, 3]
    geography:
      type: string
      pattern: ^[A-Z]{2}$
    justification:
      type: string
      description: Why this custom factor is needed
      minLength: 20
    validFrom:
      type: string
      format: date
    validTo:
      type: string
      format: date
    gasBreakdown:
      type: object
      properties:
        co2: { type: number }
        ch4: { type: number }
        n2o: { type: number }

Response (201 Created): Created emission factor object

Note: Custom factors require approval before use in calculations
```

#### PUT /v1/emission-factors/{factorId}

Update custom emission factor.

```yaml
Summary: Update emission factor
Authentication: Bearer token required
Authorization: Only for custom factors created by user's organization
Rate Limit: 20 per hour

Request Body: Partial update

Response (200 OK): Updated emission factor

Note: Creates new version if factor is already in use
```

#### POST /v1/emission-factors/{factorId}/deprecate

Deprecate emission factor.

```yaml
Summary: Deprecate emission factor
Authentication: Bearer token required
Authorization: ADMIN role required (for system factors)
Rate Limit: 10 per hour

Request Body:
  type: object
  required: [deprecationReason]
  properties:
    deprecationReason:
      type: string
    replacementFactorId:
      type: string
      format: uuid
      description: Recommended replacement factor
    effectiveDate:
      type: string
      format: date
      description: When deprecation takes effect

Response (200 OK):
  {
    "success": true,
    "data": {
      "emissionFactorId": "uuid",
      "status": "DEPRECATED",
      "deprecatedAt": "2025-11-18T10:30:00Z",
      "replacementFactorId": "uuid",
      "affectedProjects": ["uuid1", "uuid2"]
    }
  }
```

### Unit & Conversion Management

#### GET /v1/units

List measurement units.

```yaml
Summary: List units
Authentication: Bearer token required
Rate Limit: 100 per minute

Query Parameters:
  - type: string (MASS, VOLUME, ENERGY, DISTANCE, AREA, COUNT)
  - search: string

Response (200 OK):
  {
    "success": true,
    "data": [
      {
        "unitId": "uuid",
        "name": "kilogram",
        "symbol": "kg",
        "type": "MASS",
        "baseUnit": "kg",
        "conversionFactor": 1.0,
        "aliases": ["kilogramme", "kilo"]
      },
      {
        "unitId": "uuid",
        "name": "tonne",
        "symbol": "t",
        "type": "MASS",
        "baseUnit": "kg",
        "conversionFactor": 1000.0,
        "aliases": ["metric ton", "MT"]
      }
    ]
  }
```

#### GET /v1/units/convert

Convert between units.

```yaml
Summary: Convert units
Authentication: Bearer token required
Rate Limit: 200 per minute

Query Parameters:
  - value: number (required)
  - fromUnit: string (required) - unit symbol or ID
  - toUnit: string (required) - unit symbol or ID

Response (200 OK):
  {
    "success": true,
    "data": {
      "originalValue": 1000,
      "originalUnit": "kg",
      "convertedValue": 1,
      "convertedUnit": "t",
      "conversionFactor": 0.001,
      "formula": "value * 0.001"
    }
  }

Errors:
  - 400: Units are not compatible (different types)
```

#### POST /v1/units

Create custom unit.

```yaml
Summary: Create unit
Authentication: Bearer token required
Authorization: ADMIN role required
Rate Limit: 10 per hour

Request Body:
  type: object
  required: [name, symbol, type, conversionFactor]
  properties:
    name: { type: string }
    symbol: { type: string }
    type: { type: string, enum: [MASS, VOLUME, ENERGY, DISTANCE, AREA, COUNT] }
    baseUnit: { type: string }
    conversionFactor: { type: number }

Response (201 Created): Created unit object
```

### Parameter & Category Management

#### GET /v1/parameters

List activity parameters.

```yaml
Summary: List parameters
Authentication: Bearer token required
Rate Limit: 100 per minute

Query Parameters:
  - scope: integer (1, 2, or 3)
  - category: string
  - search: string

Response (200 OK):
  {
    "success": true,
    "data": [
      {
        "parameterId": "uuid",
        "name": "Natural Gas Consumption",
        "category": "STATIONARY_COMBUSTION",
        "subcategory": "NATURAL_GAS",
        "scope": 1,
        "allowedUnits": ["kWh", "m3", "therms"],
        "defaultUnit": "kWh",
        "description": "Natural gas combustion in stationary equipment",
        "dataQualityGuidance": "Prefer actual meter readings over estimates",
        "ghgProtocolReference": "Table 7.1"
      }
    ]
  }
```

#### GET /v1/categories

List emission categories.

```yaml
Summary: List categories
Authentication: Bearer token required
Rate Limit: 100 per minute

Query Parameters:
  - scope: integer (1, 2, or 3)
  - includeSubcategories: boolean (default: true)

Response (200 OK):
  {
    "success": true,
    "data": [
      {
        "categoryId": "uuid",
        "name": "Stationary Combustion",
        "code": "STATIONARY_COMBUSTION",
        "scope": 1,
        "description": "Emissions from fuel combustion in stationary equipment",
        "icon": "fire",
        "color": "#FF5733",
        "subcategories": [
          {
            "subcategoryId": "uuid",
            "name": "Natural Gas",
            "code": "NATURAL_GAS"
          }
        ]
      }
    ]
  }
```

### Data Import & Sync

#### POST /v1/reference-data/import

Import reference data from external source.

```yaml
Summary: Import reference data
Authentication: Bearer token required
Authorization: ADMIN role required
Rate Limit: 5 per day

Request Body:
  type: object
  required: [dataSource, dataType]
  properties:
    dataSource:
      type: string
      enum: [DEFRA, EPA, IPCC, CUSTOM_FILE]
    dataType:
      type: string
      enum: [EMISSION_FACTOR, UNIT, PARAMETER, CATEGORY]
    fileUrl:
      type: string
      description: Required if dataSource is CUSTOM_FILE
    validateOnly:
      type: boolean
      default: false
      description: Run validation without importing

Response (202 Accepted):
  {
    "success": true,
    "data": {
      "importId": "uuid",
      "status": "PROCESSING",
      "estimatedCompletion": "2025-11-18T11:00:00Z",
      "statusUrl": "/v1/reference-data/imports/{importId}"
    }
  }
```

#### GET /v1/reference-data/imports/{importId}

Check import status.

```yaml
Summary: Get import status
Authentication: Bearer token required
Rate Limit: 60 per minute

Response (200 OK):
  {
    "success": true,
    "data": {
      "importId": "uuid",
      "status": "COMPLETED",
      "dataSource": "DEFRA",
      "dataType": "EMISSION_FACTOR",
      "startedAt": "2025-11-18T10:30:00Z",
      "completedAt": "2025-11-18T10:35:00Z",
      "results": {
        "totalRecords": 1000,
        "successfulRecords": 995,
        "failedRecords": 5,
        "recordsAdded": 50,
        "recordsUpdated": 945,
        "recordsDeprecated": 10
      },
      "errors": [
        {
          "rowNumber": 42,
          "field": "value",
          "message": "Invalid numeric value",
          "rawValue": "N/A"
        }
      ]
    }
  }
```

#### POST /v1/reference-data/sync

Sync with external data source (scheduled job).

```yaml
Summary: Sync reference data
Authentication: Bearer token required
Authorization: ADMIN role required
Rate Limit: 1 per hour

Request Body:
  type: object
  required: [dataSource]
  properties:
    dataSource:
      type: string
      enum: [DEFRA, EPA, IPCC]
    syncType:
      type: string
      enum: [FULL, INCREMENTAL]
      default: INCREMENTAL

Response (202 Accepted): Import job created
```

---

## Activity Service APIs

**Base URL**: `https://api.clenergize.com/v1`
**Service Port**: 3004
**Total Endpoints**: 28

### Carbon Scope Management

#### POST /v1/carbon-scopes

Create carbon scope for entity/location.

```yaml
Summary: Create carbon scope
Authentication: Bearer token required
Authorization: projects:write permission required
Rate Limit: 100 per hour

Request Body:
  type: object
  required: [projectId, entityId, year]
  properties:
    projectId:
      type: string
      format: uuid
    entityId:
      type: string
      format: uuid
      description: Hierarchy node ID
    entityType:
      type: string
      enum: [COMPANY, ENTITY, SUBSIDIARY, LOCATION]
    year:
      type: integer
    modules:
      type: array
      items:
        type: string
      example: [STATIONARY_COMBUSTION, ELECTRICITY]
    status:
      type: string
      enum: [ACTIVE, INACTIVE]
      default: ACTIVE

Response (201 Created):
  {
    "success": true,
    "data": {
      "carbonScopeId": "uuid",
      "projectId": "uuid",
      "entityId": "uuid",
      "entityType": "LOCATION",
      "entityName": "New York Office",
      "year": 2024,
      "modules": ["STATIONARY_COMBUSTION", "ELECTRICITY"],
      "status": "ACTIVE",
      "stats": {
        "totalActivities": 0,
        "dataCompleteness": 0,
        "lastUpdated": null
      },
      "createdAt": "2025-11-18T10:30:00Z"
    }
  }
```

#### GET /v1/carbon-scopes

List carbon scopes.

```yaml
Summary: List carbon scopes
Authentication: Bearer token required
Rate Limit: 100 per minute

Query Parameters:
  - projectId: string (required)
  - year: integer
  - entityId: string
  - status: string (ACTIVE, INACTIVE)
  - module: string

Response (200 OK): List of carbon scopes
```

### Activity Data Management

#### POST /v1/activity-data

Create activity data entry.

```yaml
Summary: Create activity data
Authentication: Bearer token required
Authorization: projects:write permission required
Rate Limit: 500 per hour

Request Body:
  type: object
  required: [carbonScopeId, parameterId, year, quantityConsumed, uom]
  properties:
    carbonScopeId:
      type: string
      format: uuid
    parameterId:
      type: string
      format: uuid
      description: Activity parameter (e.g., Natural Gas)
    year:
      type: integer
    quantityConsumed:
      type: number
      minimum: 0
      description: Annual total or sum of monthly data
    uom:
      type: string
      description: Unit of measurement (must be allowed for parameter)
    monthlyData:
      type: object
      description: Optional monthly breakdown
      properties:
        jan: { type: number }
        feb: { type: number }
        mar: { type: number }
        apr: { type: number }
        may: { type: number }
        jun: { type: number }
        jul: { type: number }
        aug: { type: number }
        sep: { type: number }
        oct: { type: number }
        nov: { type: number }
        dec: { type: number }
    dataSource:
      type: string
      description: Source of data (e.g., "Utility Bill", "Meter Reading")
    dataQuality:
      type: integer
      minimum: 1
      maximum: 4
      description: GHG Protocol data quality score (1=highest, 4=lowest)
    comments:
      type: string

Response (201 Created):
  {
    "success": true,
    "data": {
      "activityDataId": "uuid",
      "carbonScopeId": "uuid",
      "parameterId": "uuid",
      "parameterName": "Natural Gas Consumption",
      "category": "STATIONARY_COMBUSTION",
      "year": 2024,
      "quantityConsumed": 50000,
      "uom": "kWh",
      "monthlyData": {
        "jan": 5000,
        "feb": 4500,
        // ...
      },
      "isVerified": false,
      "dataQuality": 2,
      "status": "PENDING_CALCULATION",
      "createdAt": "2025-11-18T10:30:00Z",
      "createdBy": "uuid"
    }
  }
```

#### GET /v1/activity-data

List activity data.

```yaml
Summary: List activity data
Authentication: Bearer token required
Rate Limit: 100 per minute

Query Parameters:
  - projectId: string (required)
  - carbonScopeId: string
  - year: integer
  - category: string
  - parameterId: string
  - verified: boolean
  - dataQuality: integer (1-4)
  - page: integer
  - pageSize: integer

Response (200 OK): Paginated list of activity data
```

#### GET /v1/activity-data/{activityDataId}

Get activity data details.

```yaml
Summary: Get activity data
Authentication: Bearer token required
Rate Limit: 200 per minute

Response (200 OK):
  {
    "success": true,
    "data": {
      "activityDataId": "uuid",
      "carbonScopeId": "uuid",
      "scope": {
        "scopeId": "uuid",
        "entityName": "New York Office",
        "year": 2024
      },
      "parameter": {
        "parameterId": "uuid",
        "name": "Natural Gas Consumption",
        "category": "STATIONARY_COMBUSTION",
        "scope": 1
      },
      "quantityConsumed": 50000,
      "uom": "kWh",
      "monthlyData": { /* monthly breakdown */ },
      "calculation": {
        "calculationId": "uuid",
        "emissionCO2e": 9.1955,
        "emissionFactor": {
          "factorId": "uuid",
          "name": "Natural Gas - Stationary",
          "value": 0.18391,
          "source": "DEFRA"
        },
        "calculatedAt": "2025-11-18T10:35:00Z"
      },
      "verification": {
        "isVerified": true,
        "verifiedBy": "uuid",
        "verifiedAt": "2025-11-18T11:00:00Z",
        "verificationMethod": "MANUAL"
      },
      "dataQuality": 2,
      "dataSource": "Utility Bill - ConEd",
      "comments": "Winter consumption higher due to cold weather",
      "fileAttachments": [
        {
          "fileId": "uuid",
          "fileName": "jan_2024_gas_bill.pdf",
          "fileSize": 256000,
          "uploadedAt": "2025-11-18T10:30:00Z"
        }
      ],
      "auditTrail": [
        {
          "action": "CREATED",
          "userId": "uuid",
          "timestamp": "2025-11-18T10:30:00Z"
        },
        {
          "action": "UPDATED",
          "userId": "uuid",
          "changes": ["quantityConsumed"],
          "timestamp": "2025-11-18T10:45:00Z"
        }
      ],
      "createdAt": "2025-11-18T10:30:00Z",
      "updatedAt": "2025-11-18T10:45:00Z"
    }
  }
```

#### PUT /v1/activity-data/{activityDataId}

Update activity data.

```yaml
Summary: Update activity data
Authentication: Bearer token required
Authorization: projects:write permission required
Rate Limit: 200 per hour

Request Body: Partial update

Response (200 OK): Updated activity data

Note: Updating data triggers automatic recalculation
```

#### DELETE /v1/activity-data/{activityDataId}

Delete activity data.

```yaml
Summary: Delete activity data
Authentication: Bearer token required
Authorization: projects:delete permission required
Rate Limit: 50 per hour

Query Parameters:
  - cascadeDeleteCalculations: boolean (default: true)

Response (204 No Content)
```

#### POST /v1/activity-data/{activityDataId}/verify

Verify activity data.

```yaml
Summary: Verify activity data
Authentication: Bearer token required
Authorization: MANAGER or ADMIN role required
Rate Limit: 100 per hour

Request Body:
  type: object
  properties:
    verificationMethod:
      type: string
      enum: [MANUAL, AUTOMATED]
      default: MANUAL
    confidence:
      type: integer
      minimum: 0
      maximum: 100
      description: Verification confidence level
    comments:
      type: string

Response (200 OK):
  {
    "success": true,
    "data": {
      "activityDataId": "uuid",
      "isVerified": true,
      "verifiedBy": "uuid",
      "verifiedAt": "2025-11-18T11:00:00Z",
      "verificationMethod": "MANUAL",
      "confidence": 95
    }
  }
```

### Bulk Import

#### POST /v1/activity-data/import

Bulk import activity data from Excel/CSV.

```yaml
Summary: Bulk import activity data
Authentication: Bearer token required
Authorization: projects:write permission required
Rate Limit: 10 per hour
Max File Size: 10 MB

Request Body (multipart/form-data):
  - file: File (required) - Excel or CSV file
  - projectId: string (required)
  - year: integer (required)
  - validateOnly: boolean (default: false)

Response (202 Accepted):
  {
    "success": true,
    "data": {
      "importId": "uuid",
      "fileName": "activity_data_2024.xlsx",
      "fileSize": 2048576,
      "status": "PROCESSING",
      "estimatedRecords": 150,
      "estimatedCompletion": "2025-11-18T11:00:00Z",
      "statusUrl": "/v1/activity-data/imports/{importId}"
    }
  }
```

#### GET /v1/activity-data/imports/{importId}

Check bulk import status.

```yaml
Summary: Get import status
Authentication: Bearer token required
Rate Limit: 60 per minute

Response (200 OK):
  {
    "success": true,
    "data": {
      "importId": "uuid",
      "status": "COMPLETED",
      "fileName": "activity_data_2024.xlsx",
      "startedAt": "2025-11-18T10:30:00Z",
      "completedAt": "2025-11-18T10:35:00Z",
      "results": {
        "totalRecords": 150,
        "successfulRecords": 145,
        "failedRecords": 5,
        "warnings": 10
      },
      "errors": [
        {
          "row": 42,
          "column": "quantityConsumed",
          "message": "Invalid numeric value",
          "severity": "ERROR"
        }
      ],
      "warnings": [
        {
          "row": 15,
          "column": "dataQuality",
          "message": "Data quality score missing, defaulting to 3",
          "severity": "WARNING"
        }
      ]
    }
  }
```

### File Attachments

#### POST /v1/activity-data/{activityDataId}/attachments

Upload file attachment (invoices, bills, etc).

```yaml
Summary: Upload file attachment
Authentication: Bearer token required
Rate Limit: 50 per hour
Max File Size: 5 MB per file

Request Body (multipart/form-data):
  - file: File (required)
  - description: string
  - month: string (optional) - Link to specific month

Response (201 Created):
  {
    "success": true,
    "data": {
      "fileId": "uuid",
      "activityDataId": "uuid",
      "fileName": "utility_bill.pdf",
      "fileSize": 256000,
      "fileType": "application/pdf",
      "s3Key": "attachments/uuid/utility_bill.pdf",
      "downloadUrl": "https://...",
      "uploadedBy": "uuid",
      "uploadedAt": "2025-11-18T10:30:00Z"
    }
  }
```

#### DELETE /v1/activity-data/attachments/{fileId}

Delete file attachment.

```yaml
Summary: Delete attachment
Authentication: Bearer token required
Rate Limit: 20 per hour

Response (204 No Content)
```

### Comments & Collaboration

#### POST /v1/activity-data/{activityDataId}/comments

Add comment to activity data.

```yaml
Summary: Add comment
Authentication: Bearer token required
Rate Limit: 100 per hour

Request Body:
  type: object
  required: [comment]
  properties:
    comment:
      type: string
      minLength: 1
      maxLength: 1000

Response (201 Created):
  {
    "success": true,
    "data": {
      "commentId": "uuid",
      "activityDataId": "uuid",
      "comment": "Updated based on revised utility bill",
      "addedBy": {
        "userId": "uuid",
        "name": "John Doe"
      },
      "addedAt": "2025-11-18T10:30:00Z"
    }
  }
```

#### GET /v1/activity-data/{activityDataId}/comments

List comments.

```yaml
Summary: List comments
Authentication: Bearer token required
Rate Limit: 100 per minute

Response (200 OK): List of comments
```

### Data Quality

#### POST /v1/activity-data/{activityDataId}/flag-quality

Flag data quality issue.

```yaml
Summary: Flag data quality issue
Authentication: Bearer token required
Rate Limit: 50 per hour

Request Body:
  type: object
  required: [flagType, description]
  properties:
    flagType:
      type: string
      enum: [OUTLIER, MISSING_DATA, INCONSISTENT, LOW_QUALITY]
    description:
      type: string
    severity:
      type: string
      enum: [LOW, MEDIUM, HIGH]

Response (201 Created):
  {
    "success": true,
    "data": {
      "flagId": "uuid",
      "activityDataId": "uuid",
      "flagType": "OUTLIER",
      "description": "Consumption 300% higher than previous year",
      "severity": "HIGH",
      "status": "OPEN",
      "flaggedBy": "uuid",
      "flaggedAt": "2025-11-18T10:30:00Z"
    }
  }
```

#### PUT /v1/data-quality-flags/{flagId}/resolve

Resolve data quality flag.

```yaml
Summary: Resolve quality flag
Authentication: Bearer token required
Rate Limit: 50 per hour

Request Body:
  type: object
  required: [resolution]
  properties:
    resolution:
      type: string
      minLength: 10

Response (200 OK):
  {
    "success": true,
    "data": {
      "flagId": "uuid",
      "status": "RESOLVED",
      "resolution": "Confirmed with facility manager - new equipment installed",
      "resolvedBy": "uuid",
      "resolvedAt": "2025-11-18T11:00:00Z"
    }
  }
```

---

## Calculation Service APIs

**Base URL**: `https://api.clenergize.com/v1`
**Service Port**: 3005
**Total Endpoints**: 15

### Emission Calculations

#### POST /v1/calculations/calculate

Calculate emissions for activity data.

```yaml
Summary: Calculate emissions
Authentication: Bearer token required
Authorization: calculations:execute permission required
Rate Limit: 500 per hour

Request Body:
  type: object
  required: [activityDataId]
  properties:
    activityDataId:
      type: string
      format: uuid
      description: Activity data to calculate
    emissionFactorId:
      type: string
      format: uuid
      description: Optional override for emission factor
    methodology:
      type: string
      enum: [FUEL_BASED, DISTANCE_BASED, SPEND_BASED, LOCATION_BASED, MARKET_BASED]
      description: Calculation methodology

Response (201 Created):
  {
    "success": true,
    "data": {
      "calculationId": "uuid",
      "activityDataId": "uuid",
      "emissionFactorId": "uuid",
      "emissionFactorVersion": "2024.1.0",
      "methodology": "FUEL_BASED",
      "inputs": {
        "quantity": 50000,
        "unit": "kWh",
        "emissionFactor": 0.18391,
        "conversionFactor": 1.0
      },
      "result": {
        "co2e": 9.1955,
        "co2": 9.158,
        "ch4": 0.0005,
        "n2o": 0.037,
        "uncertainty": 5.0
      },
      "scope": 1,
      "calculatedAt": "2025-11-18T10:35:00Z",
      "calculatedBy": "uuid"
    }
  }

Errors:
  - 404: Activity data or emission factor not found
  - 422: Invalid calculation inputs (e.g., unit mismatch)
```

#### POST /v1/calculations/batch

Batch calculate emissions for multiple activity data entries.

```yaml
Summary: Batch calculate emissions
Authentication: Bearer token required
Authorization: calculations:execute permission required
Rate Limit: 50 per hour

Request Body:
  type: object
  required: [activityDataIds]
  properties:
    activityDataIds:
      type: array
      items:
        type: string
        format: uuid
      maxItems: 100

Response (202 Accepted):
  {
    "success": true,
    "data": {
      "batchId": "uuid",
      "status": "PROCESSING",
      "totalItems": 50,
      "estimatedCompletion": "2025-11-18T10:40:00Z",
      "statusUrl": "/v1/calculations/batch/{batchId}"
    }
  }
```

#### GET /v1/calculations/batch/{batchId}

Check batch calculation status.

```yaml
Summary: Get batch calculation status
Authentication: Bearer token required
Rate Limit: 60 per minute

Response (200 OK):
  {
    "success": true,
    "data": {
      "batchId": "uuid",
      "status": "COMPLETED",
      "totalItems": 50,
      "successfulItems": 48,
      "failedItems": 2,
      "startedAt": "2025-11-18T10:30:00Z",
      "completedAt": "2025-11-18T10:35:00Z",
      "results": [
        {
          "activityDataId": "uuid",
          "calculationId": "uuid",
          "status": "SUCCESS",
          "emission": 9.1955
        }
      ],
      "errors": [
        {
          "activityDataId": "uuid",
          "error": "Emission factor not found for parameter"
        }
      ]
    }
  }
```

#### POST /v1/calculations/{calculationId}/recalculate

Recalculate specific emission calculation.

```yaml
Summary: Recalculate emissions
Authentication: Bearer token required
Authorization: calculations:execute permission required
Rate Limit: 100 per hour

Request Body:
  type: object
  properties:
    reason:
      type: string
      description: Reason for recalculation

Response (201 Created): New calculation object

Note: Creates new calculation record (immutable audit trail)
```

#### GET /v1/calculations

List calculations with filtering.

```yaml
Summary: List calculations
Authentication: Bearer token required
Rate Limit: 100 per minute

Query Parameters:
  - projectId: string (required)
  - activityDataId: string
  - scope: integer (1, 2, or 3)
  - startDate: string
  - endDate: string
  - page: integer
  - pageSize: integer

Response (200 OK): Paginated list of calculations
```

#### GET /v1/calculations/{calculationId}

Get calculation details.

```yaml
Summary: Get calculation
Authentication: Bearer token required
Rate Limit: 200 per minute

Response (200 OK):
  {
    "success": true,
    "data": {
      "calculationId": "uuid",
      "activityData": {
        "activityDataId": "uuid",
        "parameter": "Natural Gas Consumption",
        "quantity": 50000,
        "unit": "kWh"
      },
      "emissionFactor": {
        "factorId": "uuid",
        "name": "Natural Gas - Stationary Combustion",
        "value": 0.18391,
        "unit": "kg CO2e/kWh",
        "source": "DEFRA",
        "version": "2024.1.0"
      },
      "methodology": "FUEL_BASED",
      "calculation": {
        "formula": "quantity × emissionFactor × conversionFactor",
        "steps": [
          {
            "description": "Convert kWh to base unit",
            "value": 50000
          },
          {
            "description": "Apply emission factor",
            "value": 9.1955
          }
        ]
      },
      "result": {
        "co2e": 9.1955,
        "gasBreakdown": {
          "co2": 9.158,
          "ch4": 0.0005,
          "n2o": 0.037
        },
        "uncertainty": 5.0
      },
      "scope": 1,
      "calculatedAt": "2025-11-18T10:35:00Z",
      "calculatedBy": "uuid",
      "version": 1
    }
  }
```

### Hierarchy Aggregation (Rollup)

#### POST /v1/rollups/trigger

Trigger rollup calculation for hierarchy.

```yaml
Summary: Trigger rollup
Authentication: Bearer token required
Authorization: calculations:execute permission required
Rate Limit: 20 per hour

Request Body:
  type: object
  required: [projectId, year]
  properties:
    projectId:
      type: string
      format: uuid
    year:
      type: integer
    hierarchyNodeId:
      type: string
      format: uuid
      description: Optional - rollup from specific node (default: root)
    scope:
      type: integer
      enum: [1, 2, 3]
      description: Optional - rollup specific scope only

Response (202 Accepted):
  {
    "success": true,
    "data": {
      "rollupId": "uuid",
      "status": "PROCESSING",
      "hierarchyNodeId": "uuid",
      "estimatedCompletion": "2025-11-18T10:40:00Z",
      "statusUrl": "/v1/rollups/{rollupId}"
    }
  }
```

#### GET /v1/rollups/{rollupId}

Get rollup status and results.

```yaml
Summary: Get rollup status
Authentication: Bearer token required
Rate Limit: 60 per minute

Response (200 OK):
  {
    "success": true,
    "data": {
      "rollupId": "uuid",
      "status": "COMPLETED",
      "hierarchyNodeId": "uuid",
      "nodeName": "Acme Corporation",
      "level": 0,
      "period": {
        "year": 2024,
        "startDate": "2024-01-01",
        "endDate": "2024-12-31"
      },
      "totals": {
        "scope1": 450.25,
        "scope2": 300.15,
        "scope3": 500.00,
        "total": 1250.40
      },
      "breakdown": {
        "directEmissions": 450.25,
        "indirectEmissions": 800.15,
        "childNodes": [
          {
            "nodeId": "uuid",
            "nodeName": "New York Office",
            "emissions": 250.10
          },
          {
            "nodeId": "uuid",
            "nodeName": "London Office",
            "emissions": 200.05
          }
        ]
      },
      "childNodeCount": 5,
      "leafActivityCount": 150,
      "calculatedAt": "2025-11-18T10:35:00Z"
    }
  }
```

#### GET /v1/rollups

List historical rollups.

```yaml
Summary: List rollups
Authentication: Bearer token required
Rate Limit: 100 per minute

Query Parameters:
  - projectId: string (required)
  - year: integer
  - hierarchyNodeId: string
  - page: integer
  - pageSize: integer

Response (200 OK): Paginated list of rollups
```

### Emission Allocations

#### POST /v1/allocations

Create emission allocation.

```yaml
Summary: Create allocation
Authentication: Bearer token required
Authorization: calculations:execute permission required
Rate Limit: 50 per hour

Request Body:
  type: object
  required: [emissionSourceId, allocationType, targets]
  properties:
    emissionSourceId:
      type: string
      format: uuid
      description: Calculation or rollup to allocate
    allocationType:
      type: string
      enum: [HEADCOUNT, REVENUE, FLOOR_AREA, CUSTOM]
    totalEmission:
      type: number
      description: Total emission to allocate
    targets:
      type: array
      items:
        type: object
        required: [entityId, allocationValue]
        properties:
          entityId:
            type: string
            format: uuid
          allocationValue:
            type: number
            description: Basis for allocation (e.g., employee count)

Response (201 Created):
  {
    "success": true,
    "data": {
      "allocationId": "uuid",
      "emissionSourceId": "uuid",
      "allocationType": "HEADCOUNT",
      "totalEmission": 100.0,
      "targets": [
        {
          "entityId": "uuid",
          "entityName": "New York Office",
          "allocationValue": 50,
          "allocationPercentage": 62.5,
          "allocatedEmission": 62.5
        },
        {
          "entityId": "uuid",
          "entityName": "London Office",
          "allocationValue": 30,
          "allocationPercentage": 37.5,
          "allocatedEmission": 37.5
        }
      ],
      "createdAt": "2025-11-18T10:30:00Z",
      "createdBy": "uuid"
    }
  }
```

#### GET /v1/allocations

List allocations.

```yaml
Summary: List allocations
Authentication: Bearer token required
Rate Limit: 100 per minute

Query Parameters:
  - projectId: string (required)
  - allocationType: string
  - year: integer

Response (200 OK): List of allocations
```

### Recalculation Engine

#### POST /v1/recalculation/trigger

Trigger recalculation for changed emission factors or activity data.

```yaml
Summary: Trigger recalculation
Authentication: Bearer token required
Authorization: MANAGER or ADMIN role required
Rate Limit: 10 per hour

Request Body:
  type: object
  required: [trigger]
  properties:
    trigger:
      type: string
      enum: [EMISSION_FACTOR_UPDATED, ACTIVITY_DATA_CHANGED, MANUAL]
    scope:
      type: object
      properties:
        projectId:
          type: string
          format: uuid
        hierarchyNodeId:
          type: string
          format: uuid
        activityDataIds:
          type: array
          items:
            type: string
            format: uuid
    scheduledFor:
      type: string
      format: date-time
      description: Optional - schedule for later execution

Response (202 Accepted):
  {
    "success": true,
    "data": {
      "recalculationId": "uuid",
      "trigger": "EMISSION_FACTOR_UPDATED",
      "status": "QUEUED",
      "estimatedRecords": 150,
      "estimatedCompletion": "2025-11-18T11:00:00Z",
      "statusUrl": "/v1/recalculation/{recalculationId}"
    }
  }
```

#### GET /v1/recalculation/{recalculationId}

Check recalculation progress.

```yaml
Summary: Get recalculation status
Authentication: Bearer token required
Rate Limit: 60 per minute

Response (200 OK):
  {
    "success": true,
    "data": {
      "recalculationId": "uuid",
      "status": "COMPLETED",
      "trigger": "EMISSION_FACTOR_UPDATED",
      "startedAt": "2025-11-18T10:30:00Z",
      "completedAt": "2025-11-18T10:45:00Z",
      "results": {
        "totalRecords": 150,
        "successfulRecords": 148,
        "failedRecords": 2,
        "averageChange": 2.5
      }
    }
  }
```

### Calculation Validation

#### POST /v1/calculations/validate

Validate calculation without persisting.

```yaml
Summary: Validate calculation
Authentication: Bearer token required
Rate Limit: 200 per hour

Request Body:
  type: object
  required: [parameterId, quantity, unit, year]
  properties:
    parameterId: { type: string, format: uuid }
    quantity: { type: number }
    unit: { type: string }
    year: { type: integer }
    emissionFactorId: { type: string, format: uuid }

Response (200 OK):
  {
    "success": true,
    "data": {
      "valid": true,
      "estimatedEmission": 9.1955,
      "emissionFactor": {
        "factorId": "uuid",
        "name": "Natural Gas - Stationary",
        "value": 0.18391,
        "source": "DEFRA"
      },
      "warnings": [
        {
          "code": "HIGH_UNCERTAINTY",
          "message": "Emission factor has ±10% uncertainty",
          "severity": "WARNING"
        }
      ]
    }
  }
```

---

## Reporting Service APIs

**Base URL**: `https://api.clenergize.com/v1`
**Service Port**: 3006
**Total Endpoints**: 24

### Report Generation

#### POST /v1/reports/generate

Generate emission report.

```yaml
Summary: Generate report
Authentication: Bearer token required
Authorization: reports:generate permission required
Rate Limit: 20 per hour

Request Body:
  type: object
  required: [reportType, projectId, period]
  properties:
    reportType:
      type: string
      enum: [
        GHG_INVENTORY,
        EXECUTIVE_SUMMARY,
        SCOPE_ANALYSIS,
        TREND_REPORT,
        ENTITY_COMPARISON,
        ACTIVITY_DETAIL,
        VERIFICATION_REPORT
      ]
    projectId:
      type: string
      format: uuid
    period:
      type: object
      required: [year]
      properties:
        year: { type: integer }
        month: { type: integer }
        quarter: { type: integer }
    format:
      type: string
      enum: [PDF, EXCEL, CSV]
      default: PDF
    options:
      type: object
      properties:
        includeCharts: { type: boolean, default: true }
        includeDetailedBreakdown: { type: boolean, default: false }
        language: { type: string, enum: [en, es, fr, de], default: en }
        template: { type: string }

Response (202 Accepted):
  {
    "success": true,
    "data": {
      "reportId": "uuid",
      "reportType": "GHG_INVENTORY",
      "status": "PROCESSING",
      "estimatedCompletion": "2025-11-18T10:35:00Z",
      "statusUrl": "/v1/reports/{reportId}"
    }
  }
```

#### GET /v1/reports/{reportId}

Get report status and download link.

```yaml
Summary: Get report status
Authentication: Bearer token required
Rate Limit: 100 per minute

Response (200 OK):
  {
    "success": true,
    "data": {
      "reportId": "uuid",
      "reportType": "GHG_INVENTORY",
      "projectId": "uuid",
      "projectName": "2024 Carbon Footprint",
      "period": {
        "year": 2024,
        "startDate": "2024-01-01",
        "endDate": "2024-12-31"
      },
      "format": "PDF",
      "status": "COMPLETED",
      "fileUrl": "https://s3.amazonaws.com/reports/uuid.pdf",
      "fileSize": 2048576,
      "generatedAt": "2025-11-18T10:35:00Z",
      "generatedBy": "uuid",
      "expiresAt": "2025-11-25T10:35:00Z",
      "metadata": {
        "totalPages": 42,
        "totalEmissions": 1250.40,
        "dataCompleteness": 95.5
      }
    }
  }
```

#### GET /v1/reports

List generated reports.

```yaml
Summary: List reports
Authentication: Bearer token required
Rate Limit: 100 per minute

Query Parameters:
  - projectId: string (required)
  - reportType: string
  - year: integer
  - status: string (PROCESSING, COMPLETED, FAILED)
  - page: integer
  - pageSize: integer

Response (200 OK): Paginated list of reports
```

#### DELETE /v1/reports/{reportId}

Delete generated report.

```yaml
Summary: Delete report
Authentication: Bearer token required
Rate Limit: 20 per hour

Response (204 No Content)
```

### Report Scheduling

#### POST /v1/report-schedules

Schedule recurring report generation.

```yaml
Summary: Create report schedule
Authentication: Bearer token required
Authorization: reports:schedule permission required
Rate Limit: 10 per hour

Request Body:
  type: object
  required: [reportType, projectId, frequency]
  properties:
    reportType: { type: string }
    projectId: { type: string, format: uuid }
    frequency:
      type: string
      enum: [DAILY, WEEKLY, MONTHLY, QUARTERLY, ANNUALLY]
    deliveryMethod:
      type: string
      enum: [EMAIL, S3, WEBHOOK]
      default: EMAIL
    recipients:
      type: array
      items:
        type: string
        format: email
    timezone:
      type: string
      default: UTC
    enabled:
      type: boolean
      default: true

Response (201 Created):
  {
    "success": true,
    "data": {
      "scheduleId": "uuid",
      "reportType": "GHG_INVENTORY",
      "projectId": "uuid",
      "frequency": "MONTHLY",
      "nextRunAt": "2025-12-01T00:00:00Z",
      "deliveryMethod": "EMAIL",
      "recipients": ["manager@example.com"],
      "enabled": true,
      "createdAt": "2025-11-18T10:30:00Z"
    }
  }
```

#### GET /v1/report-schedules

List report schedules.

```yaml
Summary: List report schedules
Authentication: Bearer token required
Rate Limit: 100 per minute

Query Parameters:
  - projectId: string
  - enabled: boolean

Response (200 OK): List of report schedules
```

#### PUT /v1/report-schedules/{scheduleId}

Update report schedule.

```yaml
Summary: Update report schedule
Authentication: Bearer token required
Rate Limit: 20 per hour

Request Body: Partial update

Response (200 OK): Updated schedule
```

#### DELETE /v1/report-schedules/{scheduleId}

Delete report schedule.

```yaml
Summary: Delete report schedule
Authentication: Bearer token required
Rate Limit: 20 per hour

Response (204 No Content)
```

### Data Export

#### POST /v1/exports

Export data to Excel/CSV.

```yaml
Summary: Export data
Authentication: Bearer token required
Authorization: reports:export permission required
Rate Limit: 10 per hour

Request Body:
  type: object
  required: [exportType, projectId, format]
  properties:
    exportType:
      type: string
      enum: [ACTIVITY_DATA, CALCULATIONS, AGGREGATED_EMISSIONS, AUDIT_LOG]
    projectId:
      type: string
      format: uuid
    format:
      type: string
      enum: [CSV, EXCEL, JSON]
    filters:
      type: object
      properties:
        year: { type: integer }
        scope: { type: integer }
        category: { type: string }
    options:
      type: object
      properties:
        includeHeaders: { type: boolean, default: true }
        includeCalculations: { type: boolean, default: true }

Response (202 Accepted):
  {
    "success": true,
    "data": {
      "exportId": "uuid",
      "exportType": "ACTIVITY_DATA",
      "format": "EXCEL",
      "status": "PROCESSING",
      "estimatedRows": 1000,
      "estimatedCompletion": "2025-11-18T10:35:00Z",
      "statusUrl": "/v1/exports/{exportId}"
    }
  }
```

#### GET /v1/exports/{exportId}

Get export status and download link.

```yaml
Summary: Get export status
Authentication: Bearer token required
Rate Limit: 100 per minute

Response (200 OK):
  {
    "success": true,
    "data": {
      "exportId": "uuid",
      "exportType": "ACTIVITY_DATA",
      "format": "EXCEL",
      "status": "COMPLETED",
      "fileUrl": "https://s3.amazonaws.com/exports/uuid.xlsx",
      "fileSize": 1048576,
      "totalRows": 1000,
      "duration": 5000,
      "completedAt": "2025-11-18T10:35:00Z",
      "expiresAt": "2025-11-25T10:35:00Z"
    }
  }
```

### Dashboard & Analytics

#### GET /v1/dashboards/overview

Get project overview dashboard data.

```yaml
Summary: Get dashboard overview
Authentication: Bearer token required
Rate Limit: 100 per minute

Query Parameters:
  - projectId: string (required)
  - year: integer (required)

Response (200 OK):
  {
    "success": true,
    "data": {
      "projectId": "uuid",
      "year": 2024,
      "summary": {
        "totalEmissions": 1250.40,
        "scope1": 450.25,
        "scope2": 300.15,
        "scope3": 500.00,
        "yearOverYearChange": -5.5,
        "dataCompleteness": 95.5
      },
      "scopeBreakdown": [
        {
          "scope": 1,
          "emission": 450.25,
          "percentage": 36.0,
          "categories": [
            { "category": "Stationary Combustion", "emission": 350.0 },
            { "category": "Mobile Combustion", "emission": 100.25 }
          ]
        }
      ],
      "topEmitters": [
        {
          "entityId": "uuid",
          "entityName": "New York Office",
          "emission": 350.50,
          "percentage": 28.0
        }
      ],
      "trends": {
        "monthly": [
          { "month": "2024-01", "emission": 110.5 },
          { "month": "2024-02", "emission": 105.2 }
        ]
      },
      "dataQuality": {
        "score": 4.2,
        "distribution": {
          "tier1": 60,
          "tier2": 30,
          "tier3": 8,
          "tier4": 2
        }
      },
      "refreshedAt": "2025-11-18T10:30:00Z",
      "cacheKey": "dashboard:uuid:2024"
    }
  }
```

#### GET /v1/dashboards/trends

Get emission trends over time.

```yaml
Summary: Get emission trends
Authentication: Bearer token required
Rate Limit: 100 per minute

Query Parameters:
  - projectId: string (required)
  - startYear: integer (required)
  - endYear: integer (required)
  - granularity: string (MONTHLY, QUARTERLY, ANNUALLY)

Response (200 OK):
  {
    "success": true,
    "data": {
      "trends": [
        {
          "period": "2024-Q1",
          "scope1": 112.5,
          "scope2": 75.0,
          "scope3": 125.0,
          "total": 312.5
        }
      ],
      "yearOverYear": [
        {
          "year": 2024,
          "emission": 1250.40,
          "change": -5.5,
          "changePercentage": -4.2
        }
      ]
    }
  }
```

#### GET /v1/dashboards/comparison

Compare emissions across entities or periods.

```yaml
Summary: Get comparison data
Authentication: Bearer token required
Rate Limit: 100 per minute

Query Parameters:
  - projectId: string (required)
  - comparisonType: string (ENTITY, PERIOD, CATEGORY)
  - year: integer

Response (200 OK):
  {
    "success": true,
    "data": {
      "comparisonType": "ENTITY",
      "items": [
        {
          "entityId": "uuid",
          "entityName": "New York Office",
          "emission": 350.50,
          "rank": 1,
          "metrics": {
            "emissionPerEmployee": 7.0,
            "emissionPerSquareFoot": 0.05
          }
        }
      ]
    }
  }
```

#### POST /v1/dashboards/refresh

Force refresh dashboard cache.

```yaml
Summary: Refresh dashboard
Authentication: Bearer token required
Rate Limit: 10 per hour

Request Body:
  type: object
  required: [projectId]
  properties:
    projectId: { type: string, format: uuid }
    year: { type: integer }

Response (202 Accepted):
  {
    "success": true,
    "data": {
      "status": "REFRESHING",
      "estimatedCompletion": "2025-11-18T10:32:00Z"
    }
  }
```

### Report Templates

#### GET /v1/report-templates

List available report templates.

```yaml
Summary: List report templates
Authentication: Bearer token required
Rate Limit: 100 per minute

Query Parameters:
  - reportType: string

Response (200 OK):
  {
    "success": true,
    "data": [
      {
        "templateId": "uuid",
        "name": "GHG Protocol Inventory Template",
        "reportType": "GHG_INVENTORY",
        "description": "Standard GHG Protocol Corporate Standard template",
        "format": "PDF",
        "previewUrl": "https://...",
        "customizable": true,
        "language": "en"
      }
    ]
  }
```

#### POST /v1/report-templates

Create custom report template.

```yaml
Summary: Create report template
Authentication: Bearer token required
Authorization: ADMIN role required
Rate Limit: 5 per day

Request Body:
  type: object
  required: [name, reportType, templateFile]
  properties:
    name: { type: string }
    reportType: { type: string }
    templateFile: { type: string, description: Base64 encoded template }
    description: { type: string }

Response (201 Created): Created template object
```

---

## Audit Service APIs

**Base URL**: `https://api.clenergize.com/v1`
**Service Port**: 3007
**Total Endpoints**: 12

### Audit Logs

#### GET /v1/audit-logs

Query audit logs.

```yaml
Summary: Query audit logs
Authentication: Bearer token required
Authorization: ADMIN role required
Rate Limit: 100 per minute

Query Parameters:
  - startDate: string (ISO 8601) (required)
  - endDate: string (ISO 8601) (required)
  - userId: string
  - action: string (CREATE, UPDATE, DELETE, READ, EXPORT)
  - resourceType: string (USER, PROJECT, ACTIVITY_DATA, CALCULATION, REPORT)
  - resourceId: string
  - result: string (SUCCESS, FAILURE)
  - page: integer
  - pageSize: integer (max: 500)

Response (200 OK):
  {
    "success": true,
    "data": [
      {
        "auditLogId": "uuid",
        "eventId": "uuid",
        "action": "UPDATE",
        "resourceType": "ACTIVITY_DATA",
        "resourceId": "uuid",
        "userId": "uuid",
        "userName": "John Doe",
        "result": "SUCCESS",
        "changes": [
          {
            "field": "quantityConsumed",
            "oldValue": 45000,
            "newValue": 50000
          }
        ],
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "timestamp": "2025-11-18T10:30:00Z",
        "correlationId": "uuid",
        "integrity": {
          "hash": "sha256-hash",
          "previousHash": "sha256-hash"
        }
      }
    ],
    "pagination": { /* pagination object */ }
  }
```

#### GET /v1/audit-logs/{auditLogId}

Get audit log details.

```yaml
Summary: Get audit log
Authentication: Bearer token required
Authorization: ADMIN role required
Rate Limit: 200 per minute

Response (200 OK): Single audit log with full details including metadata
```

#### POST /v1/audit-logs/verify-integrity

Verify audit log chain integrity.

```yaml
Summary: Verify audit log integrity
Authentication: Bearer token required
Authorization: ADMIN role required
Rate Limit: 10 per hour

Request Body:
  type: object
  required: [startEventId, endEventId]
  properties:
    startEventId: { type: string, format: uuid }
    endEventId: { type: string, format: uuid }

Response (200 OK):
  {
    "success": true,
    "data": {
      "valid": true,
      "totalEvents": 1000,
      "startEventId": "uuid",
      "endEventId": "uuid",
      "verifiedAt": "2025-11-18T10:30:00Z",
      "issues": []
    }
  }

Note: Returns invalid if hash chain is broken (tamper detection)
```

### Compliance & GDPR

#### POST /v1/compliance/check

Run compliance check.

```yaml
Summary: Run compliance check
Authentication: Bearer token required
Authorization: ADMIN role required
Rate Limit: 5 per day

Request Body:
  type: object
  required: [checkType]
  properties:
    checkType:
      type: string
      enum: [GDPR, ISO14064, GHG_PROTOCOL, SOC2, CUSTOM]
    projectId:
      type: string
      format: uuid
    organizationId:
      type: string
      format: uuid

Response (202 Accepted):
  {
    "success": true,
    "data": {
      "checkId": "uuid",
      "checkType": "GDPR",
      "status": "PROCESSING",
      "estimatedCompletion": "2025-11-18T10:45:00Z",
      "statusUrl": "/v1/compliance/checks/{checkId}"
    }
  }
```

#### GET /v1/compliance/checks/{checkId}

Get compliance check results.

```yaml
Summary: Get compliance check results
Authentication: Bearer token required
Authorization: ADMIN role required
Rate Limit: 100 per minute

Response (200 OK):
  {
    "success": true,
    "data": {
      "checkId": "uuid",
      "checkType": "GDPR",
      "status": "COMPLETED",
      "result": "PASS",
      "findings": [
        {
          "severity": "MEDIUM",
          "category": "DATA_RETENTION",
          "description": "Some audit logs older than retention policy",
          "affectedRecords": 50,
          "recommendation": "Archive old logs to cold storage"
        }
      ],
      "checkedAt": "2025-11-18T10:35:00Z",
      "checkedBy": "uuid"
    }
  }
```

#### POST /v1/gdpr/data-subject-request

Handle GDPR data subject request.

```yaml
Summary: GDPR data subject request
Authentication: Bearer token required
Authorization: ADMIN role required
Rate Limit: 10 per day

Request Body:
  type: object
  required: [requestType, userId]
  properties:
    requestType:
      type: string
      enum: [ACCESS, ERASURE, RECTIFICATION, PORTABILITY, OBJECT]
    userId:
      type: string
      format: uuid
    reason:
      type: string
      minLength: 20

Response (202 Accepted):
  {
    "success": true,
    "data": {
      "requestId": "uuid",
      "requestType": "ERASURE",
      "userId": "uuid",
      "status": "PROCESSING",
      "estimatedCompletion": "2025-11-18T11:00:00Z",
      "statusUrl": "/v1/gdpr/requests/{requestId}"
    }
  }
```

#### GET /v1/gdpr/requests/{requestId}

Get GDPR request status.

```yaml
Summary: Get GDPR request status
Authentication: Bearer token required
Authorization: ADMIN role required
Rate Limit: 100 per minute

Response (200 OK):
  {
    "success": true,
    "data": {
      "requestId": "uuid",
      "requestType": "ACCESS",
      "userId": "uuid",
      "status": "COMPLETED",
      "result": {
        "exportUrl": "https://s3.amazonaws.com/gdpr/uuid.zip",
        "fileSize": 5242880,
        "expiresAt": "2025-11-25T10:35:00Z"
      },
      "completedAt": "2025-11-18T10:45:00Z"
    }
  }
```

### Security Events

#### GET /v1/security-events

List security events.

```yaml
Summary: List security events
Authentication: Bearer token required
Authorization: ADMIN role required
Rate Limit: 100 per minute

Query Parameters:
  - startDate: string (required)
  - endDate: string (required)
  - eventType: string (BRUTE_FORCE, UNAUTHORIZED_ACCESS, SUSPICIOUS_ACTIVITY, DATA_EXFILTRATION)
  - severity: string (LOW, MEDIUM, HIGH, CRITICAL)
  - userId: string

Response (200 OK):
  {
    "success": true,
    "data": [
      {
        "securityEventId": "uuid",
        "eventType": "BRUTE_FORCE",
        "severity": "HIGH",
        "userId": "uuid",
        "ipAddress": "192.168.1.1",
        "details": {
          "attemptCount": 15,
          "timeWindow": "5 minutes"
        },
        "detectedAt": "2025-11-18T10:30:00Z",
        "responseActions": [
          "Account locked for 30 minutes",
          "Admin notified"
        ],
        "resolved": true,
        "resolvedAt": "2025-11-18T10:35:00Z"
      }
    ]
  }
```

### Data Access Logs

#### GET /v1/data-access-logs

Query data access logs (who accessed what data).

```yaml
Summary: Query data access logs
Authentication: Bearer token required
Authorization: ADMIN role required
Rate Limit: 100 per minute

Query Parameters:
  - startDate: string (required)
  - endDate: string (required)
  - userId: string
  - resourceType: string
  - resourceId: string
  - action: string (READ, WRITE, DELETE, EXPORT)
  - dataClassification: string (PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED)

Response (200 OK):
  {
    "success": true,
    "data": [
      {
        "accessLogId": "uuid",
        "userId": "uuid",
        "userName": "John Doe",
        "resourceType": "ACTIVITY_DATA",
        "resourceId": "uuid",
        "action": "EXPORT",
        "accessMethod": "API",
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "success": true,
        "dataClassification": "CONFIDENTIAL",
        "recordCount": 1000,
        "timestamp": "2025-11-18T10:30:00Z"
      }
    ]
  }
```

### Retention & Archival

#### POST /v1/retention/archive

Archive old audit logs to cold storage.

```yaml
Summary: Archive audit logs
Authentication: Bearer token required
Authorization: ADMIN role required
Rate Limit: 5 per day

Request Body:
  type: object
  required: [olderThan]
  properties:
    olderThan:
      type: string
      format: date
      description: Archive logs older than this date
    tier:
      type: string
      enum: [WARM, COLD]
      default: COLD

Response (202 Accepted):
  {
    "success": true,
    "data": {
      "archivalId": "uuid",
      "status": "PROCESSING",
      "estimatedRecords": 50000,
      "estimatedCompletion": "2025-11-18T11:00:00Z"
    }
  }
```

#### GET /v1/retention/policies

Get data retention policies.

```yaml
Summary: Get retention policies
Authentication: Bearer token required
Authorization: ADMIN role required
Rate Limit: 100 per minute

Response (200 OK):
  {
    "success": true,
    "data": {
      "policies": [
        {
          "dataType": "AUDIT_LOG",
          "hotRetention": 365,
          "warmRetention": 1095,
          "coldRetention": 3650,
          "deleteAfter": 3650
        },
        {
          "dataType": "ACTIVITY_DATA",
          "hotRetention": 1825,
          "warmRetention": null,
          "coldRetention": null,
          "deleteAfter": null
        }
      ]
    }
  }
```

---

**Last Updated**: November 18, 2025
**Version**: 1.0.0
**Status**: DESIGN COMPLETE

## Summary

This API Design Specification provides comprehensive documentation for **164 REST API endpoints** across all 7 microservices:

| Service | Endpoints | Key Features |
|---------|-----------|--------------|
| Identity | 18 | Authentication, user management, MFA, sessions |
| Organization | 45 | Organizations, projects, hierarchies, permissions |
| Reference | 22 | Emission factors, units, parameters, data import |
| Activity | 28 | Carbon scopes, activity data, bulk import, quality control |
| Calculation | 15 | Emission calculations, rollups, allocations, validation |
| Reporting | 24 | Report generation, scheduling, dashboards, exports |
| Audit | 12 | Audit logs, compliance, GDPR, security events |
| **Total** | **164** | **Complete API surface for Clenergize V3** |

### Key Design Principles Applied:

✅ **Security First**: JWT/JWKS authentication, RBAC/PBAC authorization, rate limiting
✅ **Error Handling**: RFC 7807 Problem Details standard
✅ **Versioning**: URL-based with clear deprecation policy
✅ **Documentation**: Complete request/response schemas for all endpoints
✅ **Performance**: Batch operations, async processing, caching strategies
✅ **Compliance**: GDPR support, audit logging, data retention policies

The specification is production-ready and can be used to generate OpenAPI 3.1 specifications for API documentation and client SDK generation.

