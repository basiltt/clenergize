# REST API Specification & Standards

**Version**: 1.0.0
**Last Updated**: November 18, 2025
**Status**: ACTIVE
**Owner**: Architecture Team
**Applies To**: All Clenergize V3 Microservices

---

## Table of Contents

1. [Purpose](#purpose)
2. [REST API Design Principles](#rest-api-design-principles)
3. [URL Structure & Naming Conventions](#url-structure--naming-conventions)
4. [HTTP Methods](#http-methods)
5. [HTTP Status Codes](#http-status-codes)
6. [Request Format](#request-format)
7. [Response Format](#response-format)
8. [Error Handling](#error-handling)
9. [Pagination](#pagination)
10. [Filtering, Sorting & Search](#filtering-sorting--search)
11. [Versioning Strategy](#versioning-strategy)
12. [Authentication & Authorization](#authentication--authorization)
13. [Rate Limiting](#rate-limiting)
14. [CORS Configuration](#cors-configuration)
15. [Caching Headers](#caching-headers)
16. [Idempotency](#idempotency)
17. [Bulk Operations](#bulk-operations)
18. [Async Operations](#async-operations)
19. [File Upload/Download](#file-uploaddownload)
20. [OpenAPI Documentation](#openapi-documentation)
21. [Testing Standards](#testing-standards)
22. [Quick Reference](#quick-reference)

---

## Purpose

This document defines the REST API standards for all Clenergize V3 microservices. Every API endpoint MUST conform to these specifications to ensure:

- **Consistency**: Predictable API behavior across all services
- **Developer Experience**: Easy to learn and use
- **Maintainability**: Clear patterns for future development
- **Interoperability**: Services can communicate seamlessly
- **Security**: Standardized authentication and authorization

For complete endpoint definitions, see [API_DESIGN_SPECIFICATION.md](./API_DESIGN_SPECIFICATION.md).

---

## REST API Design Principles

### Core Principles

```yaml
1. Resource-Oriented Architecture:
   - APIs represent resources (nouns), not actions (verbs)
   - Use HTTP methods to define actions on resources
   - Resources are identified by URIs

2. Stateless Operations:
   - Each request contains all information needed
   - No server-side session state
   - Use JWT tokens for authentication context

3. HATEOAS (Hypermedia as the Engine of Application State):
   - Include navigation links in responses
   - Enable API discoverability
   - Support forward compatibility

4. Idempotent Operations:
   - GET, PUT, DELETE are idempotent
   - Safe to retry without side effects
   - Use idempotency keys for POST operations

5. Self-Descriptive Messages:
   - Use standard HTTP methods and status codes
   - Include Content-Type headers
   - Provide clear error messages
```

### Industry Standards Compliance

- **REST**: Representational State Transfer (Roy Fielding's dissertation)
- **HTTP/1.1**: RFC 7231 (Semantics and Content)
- **RFC 7807**: Problem Details for HTTP APIs (error format)
- **OpenAPI 3.1**: API documentation standard
- **JSON**: RFC 8259 data format
- **JWT**: RFC 7519 authentication tokens
- **OAuth 2.0**: RFC 6749 authorization framework

---

## URL Structure & Naming Conventions

### URL Pattern

```
https://{domain}/{api-prefix}/{version}/{resource}/{id}/{sub-resource}
```

### Examples

```http
# Production
https://api.clenergize.com/api/v1/projects/123/activities

# Development
http://localhost:3000/api/v1/users/456/roles

# Service-to-Service (internal)
http://organization-service:3002/api/v1/organizations/789
```

### Naming Rules

| Component | Convention | Example |
|-----------|------------|---------|
| Resources | Plural nouns, kebab-case | `/users`, `/emission-factors`, `/project-hierarchies` |
| IDs | UUID v4 or alphanumeric | `/users/550e8400-e29b-41d4-a716-446655440000` |
| Sub-resources | Nested under parent | `/projects/123/activities` |
| Actions | POST verb after resource | `/calculations/456/recalculate` |
| Query params | camelCase | `?startDate=2024-01-01&includeDeleted=false` |
| JSON fields | camelCase | `{"firstName": "John", "createdAt": "..."}` |

### Resource Naming Best Practices

```http
✅ CORRECT
GET /api/v1/users
GET /api/v1/projects/123/activities
POST /api/v1/emission-factors
PUT /api/v1/organizations/456
DELETE /api/v1/reports/789
POST /api/v1/calculations/111/recalculate

❌ INCORRECT
GET /api/v1/getUsers                    # Don't use verbs
GET /api/v1/user                        # Use plural
GET /api/v1/projects_activities         # Use nesting, not underscores
POST /api/v1/create-emission-factor     # Resource name should be noun
PUT /api/v1/organizations-456           # Use path params, not hyphens for IDs
DELETE /api/v1/reports?id=789           # Use path params for IDs
POST /api/v1/recalculate-calculation    # Action after resource
```

---

## HTTP Methods

### Standard CRUD Operations

| Method | Purpose | Idempotent | Safe | Request Body | Response Body |
|--------|---------|------------|------|--------------|---------------|
| GET | Retrieve resource(s) | Yes | Yes | No | Yes |
| POST | Create new resource | No | No | Yes | Yes (201) |
| PUT | Replace entire resource | Yes | No | Yes | Yes |
| PATCH | Partially update resource | No | No | Yes | Yes |
| DELETE | Remove resource | Yes | No | Optional | Optional (204) |
| HEAD | Get metadata only | Yes | Yes | No | No |
| OPTIONS | Get allowed methods | Yes | Yes | No | Yes |

### Method Usage Guidelines

```http
# GET - Retrieve resources (read-only, no side effects)
GET /api/v1/users                    # List all users
GET /api/v1/users/123                # Get specific user
GET /api/v1/users/123/permissions    # Get user's permissions

# POST - Create new resources (non-idempotent)
POST /api/v1/users                   # Create new user
POST /api/v1/users/123/activate      # Trigger action (exception to REST)
POST /api/v1/calculations/456/recalculate  # Start async operation

# PUT - Replace entire resource (idempotent)
PUT /api/v1/users/123                # Replace entire user object
PUT /api/v1/organizations/456/settings  # Replace all settings

# PATCH - Partial updates (use JSON Patch RFC 6902)
PATCH /api/v1/users/123              # Update specific fields
PATCH /api/v1/projects/789           # Partial update

# DELETE - Remove resource (idempotent)
DELETE /api/v1/users/123             # Hard delete
DELETE /api/v1/projects/456          # Soft delete (mark as deleted)
```

### Action Endpoints (Exceptions to Pure REST)

For operations that don't fit CRUD, use POST with action verb:

```http
POST /api/v1/calculations/{id}/recalculate
POST /api/v1/reports/{id}/regenerate
POST /api/v1/users/{id}/reset-password
POST /api/v1/projects/{id}/archive
POST /api/v1/emissions/{id}/verify
```

---

## HTTP Status Codes

### Success Codes (2xx)

| Code | Name | Usage | Response Body |
|------|------|-------|---------------|
| 200 | OK | Successful GET, PUT, PATCH, or action | Yes |
| 201 | Created | Successful POST creating resource | Yes (with Location header) |
| 202 | Accepted | Async operation started | Yes (with status URL) |
| 204 | No Content | Successful DELETE | No |

### Client Error Codes (4xx)

| Code | Name | Usage | Common Scenarios |
|------|------|-------|------------------|
| 400 | Bad Request | Invalid syntax or malformed request | Missing required fields, invalid JSON |
| 401 | Unauthorized | Missing or invalid authentication | No token, expired token, invalid signature |
| 403 | Forbidden | Valid auth but insufficient permissions | User lacks required role/permission |
| 404 | Not Found | Resource does not exist | Invalid ID, deleted resource |
| 405 | Method Not Allowed | HTTP method not supported | POST on read-only resource |
| 409 | Conflict | Resource state conflict | Duplicate creation, version mismatch |
| 422 | Unprocessable Entity | Validation errors | Business rule violations |
| 429 | Too Many Requests | Rate limit exceeded | Too many requests in time window |

### Server Error Codes (5xx)

| Code | Name | Usage | Common Scenarios |
|------|------|-------|------------------|
| 500 | Internal Server Error | Unexpected server error | Unhandled exceptions, bugs |
| 502 | Bad Gateway | Upstream service failure | Dependent service down |
| 503 | Service Unavailable | Service temporarily unavailable | Maintenance, overload |
| 504 | Gateway Timeout | Upstream service timeout | Slow dependent service |

### Status Code Decision Tree

```
Request Received
│
├─ Authentication Valid?
│  ├─ No → 401 Unauthorized
│  └─ Yes
│     │
│     ├─ Authorization Valid?
│     │  ├─ No → 403 Forbidden
│     │  └─ Yes
│     │     │
│     │     ├─ Resource Exists? (for GET, PUT, PATCH, DELETE)
│     │     │  ├─ No → 404 Not Found
│     │     │  └─ Yes
│     │     │     │
│     │     │     ├─ Request Valid?
│     │     │     │  ├─ No → 400 Bad Request
│     │     │     │  └─ Yes
│     │     │     │     │
│     │     │     │     ├─ Validation Passed?
│     │     │     │     │  ├─ No → 422 Unprocessable Entity
│     │     │     │     │  └─ Yes
│     │     │     │     │     │
│     │     │     │     │     ├─ Rate Limit OK?
│     │     │     │     │     │  ├─ No → 429 Too Many Requests
│     │     │     │     │     │  └─ Yes
│     │     │     │     │     │     │
│     │     │     │     │     │     ├─ Operation Successful?
│     │     │     │     │     │     │  ├─ GET/PUT/PATCH → 200 OK
│     │     │     │     │     │     │  ├─ POST (sync) → 201 Created
│     │     │     │     │     │     │  ├─ POST (async) → 202 Accepted
│     │     │     │     │     │     │  ├─ DELETE → 204 No Content
│     │     │     │     │     │     │  └─ Error → 500 Internal Server Error
```

---

## Request Format

### Required Headers

```http
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
X-Request-ID: <uuid-v4>              # For request tracing
X-Client-Version: <version>          # Client application version
Accept: application/json
```

### Optional Headers

```http
X-Correlation-ID: <uuid-v4>          # For distributed tracing
X-Idempotency-Key: <uuid-v4>         # For idempotent POST operations
If-Match: <etag>                     # For optimistic locking
If-None-Match: <etag>                # For conditional requests
X-Organization-ID: <uuid>            # Multi-tenant context
```

### Request Body Schema

```json
{
  "field1": "value",
  "field2": 123,
  "nestedObject": {
    "subField": "value"
  },
  "arrayField": ["item1", "item2"]
}
```

### Example Request

```http
POST /api/v1/users HTTP/1.1
Host: api.clenergize.com
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
X-Request-ID: 550e8400-e29b-41d4-a716-446655440000
X-Client-Version: 1.2.3

{
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "ADMIN",
  "organizationId": "org-123"
}
```

---

## Response Format

### Standard Success Response Envelope

```typescript
{
  "success": true,
  "data": {
    // Resource data or array of resources
  },
  "metadata": {
    "timestamp": "2025-11-18T10:30:00.000Z",  // ISO 8601
    "version": "1.0.0",                       // API version
    "requestId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### Example Responses

#### Single Resource (GET /api/v1/users/123)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "ADMIN",
    "status": "ACTIVE",
    "createdAt": "2025-01-15T08:00:00.000Z",
    "updatedAt": "2025-11-18T10:30:00.000Z",
    "_links": {
      "self": { "href": "/api/v1/users/550e8400-e29b-41d4-a716-446655440000" },
      "permissions": { "href": "/api/v1/users/550e8400-e29b-41d4-a716-446655440000/permissions" },
      "organization": { "href": "/api/v1/organizations/org-123" }
    }
  },
  "metadata": {
    "timestamp": "2025-11-18T10:30:00.000Z",
    "version": "1.0.0",
    "requestId": "req-uuid"
  }
}
```

#### Resource Creation (POST /api/v1/users) - 201 Created

```http
HTTP/1.1 201 Created
Location: /api/v1/users/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "ADMIN",
    "status": "ACTIVE",
    "createdAt": "2025-11-18T10:30:00.000Z",
    "updatedAt": "2025-11-18T10:30:00.000Z"
  },
  "metadata": {
    "timestamp": "2025-11-18T10:30:00.000Z",
    "version": "1.0.0",
    "requestId": "req-uuid"
  }
}
```

#### Async Operation (POST /api/v1/calculations/123/recalculate) - 202 Accepted

```json
{
  "success": true,
  "data": {
    "operationId": "op-550e8400",
    "status": "PENDING",
    "estimatedCompletion": "2025-11-18T10:35:00.000Z",
    "_links": {
      "self": { "href": "/api/v1/operations/op-550e8400" },
      "cancel": { "href": "/api/v1/operations/op-550e8400/cancel" }
    }
  },
  "metadata": {
    "timestamp": "2025-11-18T10:30:00.000Z",
    "version": "1.0.0",
    "requestId": "req-uuid"
  }
}
```

#### No Content (DELETE /api/v1/users/123) - 204 No Content

```http
HTTP/1.1 204 No Content
X-Request-ID: req-uuid
```

---

## Error Handling

### Error Response Format (RFC 7807 Problem Details)

```typescript
{
  "success": false,
  "error": {
    "type": "https://api.clenergize.com/errors/<error-type>",  // URI identifying the error type
    "title": "Validation Failed",                              // Human-readable summary
    "status": 422,                                             // HTTP status code
    "detail": "Email address is required and must be valid",   // Detailed explanation
    "instance": "/api/v1/users",                              // URI where error occurred
    "timestamp": "2025-11-18T10:30:00.000Z",
    "requestId": "req-uuid",
    "errors": [                                                // Field-level errors (optional)
      {
        "field": "email",
        "message": "Email address is required",
        "code": "REQUIRED_FIELD",
        "value": null
      }
    ],
    "metadata": {                                              // Additional context (optional)
      "validationRules": "https://api.clenergize.com/docs/validation/user"
    }
  }
}
```

### Standard Error Types

| Error Type | HTTP Status | Usage |
|------------|-------------|-------|
| `validation-error` | 422 | Request validation failed |
| `authentication-error` | 401 | Authentication failed |
| `authorization-error` | 403 | Insufficient permissions |
| `not-found-error` | 404 | Resource not found |
| `conflict-error` | 409 | Resource conflict |
| `rate-limit-error` | 429 | Rate limit exceeded |
| `internal-error` | 500 | Unexpected server error |
| `service-unavailable` | 503 | Service temporarily down |

### Example Error Responses

#### Validation Error (422)

```json
{
  "success": false,
  "error": {
    "type": "https://api.clenergize.com/errors/validation-error",
    "title": "Validation Failed",
    "status": 422,
    "detail": "The request contains invalid or missing required fields",
    "instance": "/api/v1/users",
    "timestamp": "2025-11-18T10:30:00.000Z",
    "requestId": "req-uuid",
    "errors": [
      {
        "field": "email",
        "message": "Email address is required",
        "code": "REQUIRED_FIELD",
        "value": null
      },
      {
        "field": "password",
        "message": "Password must be at least 12 characters",
        "code": "MIN_LENGTH",
        "value": "short"
      }
    ]
  }
}
```

#### Authentication Error (401)

```json
{
  "success": false,
  "error": {
    "type": "https://api.clenergize.com/errors/authentication-error",
    "title": "Authentication Failed",
    "status": 401,
    "detail": "The provided JWT token is invalid or expired",
    "instance": "/api/v1/projects",
    "timestamp": "2025-11-18T10:30:00.000Z",
    "requestId": "req-uuid",
    "metadata": {
      "reason": "JWT_EXPIRED",
      "expiredAt": "2025-11-18T09:00:00.000Z"
    }
  }
}
```

#### Authorization Error (403)

```json
{
  "success": false,
  "error": {
    "type": "https://api.clenergize.com/errors/authorization-error",
    "title": "Insufficient Permissions",
    "status": 403,
    "detail": "You do not have permission to delete this project",
    "instance": "/api/v1/projects/123",
    "timestamp": "2025-11-18T10:30:00.000Z",
    "requestId": "req-uuid",
    "metadata": {
      "requiredPermission": "project:delete",
      "userPermissions": ["project:read", "project:update"]
    }
  }
}
```

#### Not Found Error (404)

```json
{
  "success": false,
  "error": {
    "type": "https://api.clenergize.com/errors/not-found-error",
    "title": "Resource Not Found",
    "status": 404,
    "detail": "User with ID '550e8400-e29b-41d4-a716-446655440000' does not exist",
    "instance": "/api/v1/users/550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2025-11-18T10:30:00.000Z",
    "requestId": "req-uuid"
  }
}
```

#### Rate Limit Error (429)

```json
{
  "success": false,
  "error": {
    "type": "https://api.clenergize.com/errors/rate-limit-error",
    "title": "Rate Limit Exceeded",
    "status": 429,
    "detail": "You have exceeded the rate limit of 100 requests per minute",
    "instance": "/api/v1/calculations",
    "timestamp": "2025-11-18T10:30:00.000Z",
    "requestId": "req-uuid",
    "metadata": {
      "limit": 100,
      "remaining": 0,
      "reset": "2025-11-18T10:31:00.000Z",
      "retryAfter": 30
    }
  }
}
```

---

## Pagination

### Pagination Strategy: Offset-Based (Default)

```http
GET /api/v1/users?page=1&pageSize=20
```

### Pagination Query Parameters

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `page` | integer | 1 | - | Page number (1-indexed) |
| `pageSize` | integer | 20 | 100 | Items per page |
| `limit` | integer | 20 | 100 | Alias for pageSize |
| `offset` | integer | 0 | - | Number of items to skip |

### Paginated Response Format

```json
{
  "success": true,
  "data": [
    { "id": "1", "name": "Item 1" },
    { "id": "2", "name": "Item 2" }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalPages": 10,
    "totalItems": 200,
    "hasNext": true,
    "hasPrevious": false,
    "links": {
      "self": "/api/v1/users?page=1&pageSize=20",
      "next": "/api/v1/users?page=2&pageSize=20",
      "previous": null,
      "first": "/api/v1/users?page=1&pageSize=20",
      "last": "/api/v1/users?page=10&pageSize=20"
    }
  },
  "metadata": {
    "timestamp": "2025-11-18T10:30:00.000Z",
    "version": "1.0.0",
    "requestId": "req-uuid"
  }
}
```

### Cursor-Based Pagination (For Large Datasets)

```http
GET /api/v1/activities?cursor=eyJpZCI6IjEyMyIsInRpbWVzdGFtcCI6MTYzMjg0MTIwMH0&limit=50
```

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "limit": 50,
    "hasMore": true,
    "nextCursor": "eyJpZCI6IjE3MyIsInRpbWVzdGFtcCI6MTYzMjg0MTMwMH0",
    "previousCursor": null
  }
}
```

---

## Filtering, Sorting & Search

### Filtering

```http
# Single filter
GET /api/v1/users?status=ACTIVE

# Multiple filters (AND logic)
GET /api/v1/users?status=ACTIVE&role=ADMIN

# Range filters
GET /api/v1/activities?startDate=2024-01-01&endDate=2024-12-31

# Array filters (OR logic)
GET /api/v1/projects?status=ACTIVE,PENDING

# Nested filters
GET /api/v1/organizations?settings.tier=ENTERPRISE
```

### Sorting

```http
# Single field ascending
GET /api/v1/users?sort=createdAt

# Single field descending
GET /api/v1/users?sort=-createdAt

# Multiple fields
GET /api/v1/users?sort=lastName,firstName,-createdAt
```

### Search

```http
# Full-text search
GET /api/v1/users?q=john+doe

# Field-specific search
GET /api/v1/projects?search=name:solar&search=status:active
```

### Field Selection (Sparse Fieldsets)

```http
# Include only specific fields
GET /api/v1/users?fields=id,email,firstName,lastName

# Exclude fields
GET /api/v1/users?fields=-permissions,-settings
```

### Combining Parameters

```http
GET /api/v1/activities?
  projectId=123&
  status=COMPLETED&
  startDate=2024-01-01&
  endDate=2024-12-31&
  sort=-completedAt&
  page=2&
  pageSize=50&
  fields=id,name,emissionValue,completedAt
```

---

## Versioning Strategy

### URL-Based Versioning (REQUIRED)

```http
GET /api/v1/users          # Version 1
GET /api/v2/users          # Version 2
```

### Version Lifecycle

```yaml
Development (v2-beta):
  - Path: /api/v2-beta/users
  - Stability: Breaking changes allowed
  - Support: Development only

Stable (v2):
  - Path: /api/v2/users
  - Stability: No breaking changes
  - Support: Full support

Deprecated (v1):
  - Path: /api/v1/users
  - Stability: Security fixes only
  - Support: 12 months after v2 release
  - Header: Deprecation: true, Sunset: 2026-12-31

Retired (v0):
  - Path: /api/v0/users
  - Status: 410 Gone
```

### Version Headers

```http
# Request
Accept: application/vnd.clenergize.v2+json
API-Version: 2

# Response
API-Version: 2
Deprecation: false
Sunset: null
```

### Breaking vs Non-Breaking Changes

```yaml
Breaking Changes (Require New Version):
  - Removing endpoints or fields
  - Changing field types
  - Changing URL structure
  - Changing authentication method
  - Changing required fields
  - Changing error response format

Non-Breaking Changes (Same Version):
  - Adding new endpoints
  - Adding optional fields
  - Adding new query parameters
  - Improving performance
  - Bug fixes
  - Adding new HTTP headers
```

---

## Authentication & Authorization

### Authentication: JWT Bearer Tokens

```http
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEyMyJ9...
```

### JWT Token Structure

```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT",
    "kid": "key-123"
  },
  "payload": {
    "sub": "user-uuid",
    "iss": "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_XXXXX",
    "aud": "clenergize-api",
    "exp": 1700000000,
    "iat": 1699990000,
    "email": "john.doe@example.com",
    "roles": ["ADMIN"],
    "organizationId": "org-123",
    "permissions": ["user:read", "user:write", "project:delete"]
  },
  "signature": "..."
}
```

### JWT Verification (CRITICAL - MUST VERIFY SIGNATURE)

```typescript
import jwksClient from 'jwks-rsa';
import jwt from 'jsonwebtoken';

const client = jwksClient({
  jwksUri: process.env.JWKS_URI,
  cache: true,
  rateLimit: true,
  cacheMaxEntries: 100,
  cacheMaxAge: 600000 // 10 minutes
});

async function verifyToken(token: string) {
  // Decode token to get kid (key ID)
  const decoded = jwt.decode(token, { complete: true });
  if (!decoded) throw new Error('Invalid token');

  // Get signing key from JWKS
  const key = await client.getSigningKey(decoded.header.kid);
  const signingKey = key.getPublicKey();

  // Verify signature and claims
  return jwt.verify(token, signingKey, {
    algorithms: ['RS256'],
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE
  });
}

// ❌ NEVER DO THIS (security vulnerability!)
// const decoded = jwt.decode(token); // No signature verification!
```

### Authorization: Role-Based Access Control (RBAC)

```typescript
// Permission Format: <resource>:<action>
const permissions = [
  'user:read',
  'user:write',
  'user:delete',
  'project:read',
  'project:write',
  'organization:admin'
];

// Role Definitions
const roles = {
  VIEWER: ['*:read'],
  CONTRIBUTOR: ['*:read', 'activity:write', 'project:read'],
  ADMIN: ['*:read', '*:write', '*:delete'],
  SUPER_ADMIN: ['*:*']
};
```

### Protected Endpoint Example

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Permissions('user:delete')
@Delete('/users/:id')
async deleteUser(@Param('id') id: string) {
  return this.userService.delete(id);
}
```

---

## Rate Limiting

### Rate Limit Strategy: Token Bucket Algorithm

```yaml
Tiers:
  Anonymous: 10 requests/minute
  Authenticated: 100 requests/minute
  Premium: 1000 requests/minute
  Internal: No limit

Burst Allowance:
  - 2x sustained rate for 10 seconds
  - Example: Premium can burst to 2000 req/min for 10s
```

### Rate Limit Headers

```http
# Response Headers
X-RateLimit-Limit: 100           # Max requests per window
X-RateLimit-Remaining: 45        # Requests remaining
X-RateLimit-Reset: 1700000000    # Unix timestamp when limit resets
Retry-After: 30                  # Seconds until retry allowed (if 429)
```

### Rate Limit Error Response (429)

```json
{
  "success": false,
  "error": {
    "type": "https://api.clenergize.com/errors/rate-limit-error",
    "title": "Rate Limit Exceeded",
    "status": 429,
    "detail": "You have exceeded the rate limit of 100 requests per minute",
    "instance": "/api/v1/calculations",
    "timestamp": "2025-11-18T10:30:00.000Z",
    "requestId": "req-uuid",
    "metadata": {
      "limit": 100,
      "remaining": 0,
      "reset": "2025-11-18T10:31:00.000Z",
      "retryAfter": 30
    }
  }
}
```

---

## CORS Configuration

### CORS Headers (All Services)

```typescript
// NestJS CORS Configuration
app.enableCors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Request-ID',
    'X-Client-Version',
    'X-Organization-ID'
  ],
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'X-Request-ID'
  ],
  credentials: true,
  maxAge: 86400 // 24 hours
});
```

### Preflight Request Handling (OPTIONS)

```http
OPTIONS /api/v1/users HTTP/1.1
Origin: http://localhost:3000
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type, Authorization

HTTP/1.1 204 No Content
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Request-ID
Access-Control-Max-Age: 86400
```

---

## Caching Headers

### Cache-Control Directives

```http
# Public, cacheable for 1 hour
Cache-Control: public, max-age=3600

# Private, cacheable for 5 minutes
Cache-Control: private, max-age=300

# No caching
Cache-Control: no-store, no-cache, must-revalidate

# Conditional caching
Cache-Control: public, max-age=3600, must-revalidate
```

### ETag for Conditional Requests

```http
# Initial Request
GET /api/v1/users/123
→ ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"

# Conditional Request
GET /api/v1/users/123
If-None-Match: "33a64df551425fcc55e4d42a148795d9f25f89d4"
→ 304 Not Modified (if unchanged)
→ 200 OK (if changed, with new ETag)
```

### Caching Strategy by Resource Type

| Resource Type | Cache-Control | Duration | Rationale |
|---------------|---------------|----------|-----------|
| User profile | `private, max-age=300` | 5 min | User-specific, moderate change frequency |
| Emission factors | `public, max-age=86400` | 24 hours | Rarely changes, public data |
| Calculation results | `private, max-age=3600` | 1 hour | User-specific, immutable once calculated |
| Real-time data | `no-store` | None | Always fresh data |
| Static assets | `public, max-age=31536000` | 1 year | Immutable, versioned URLs |

---

## Idempotency

### Idempotent Methods (Built-in)

```yaml
GET: Always safe and idempotent
PUT: Idempotent by design (full replacement)
DELETE: Idempotent (multiple deletes have same effect)
PATCH: Not guaranteed idempotent
POST: Not idempotent (creates new resource each time)
```

### Idempotency Keys for POST Requests

```http
POST /api/v1/users
Content-Type: application/json
Authorization: Bearer <token>
X-Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000

{
  "email": "john.doe@example.com",
  "firstName": "John"
}
```

### Server Idempotency Handling

```typescript
@Post('/users')
async createUser(
  @Body() dto: CreateUserDto,
  @Headers('X-Idempotency-Key') idempotencyKey?: string
) {
  if (idempotencyKey) {
    // Check if request already processed
    const cached = await this.redis.get(`idempotency:${idempotencyKey}`);
    if (cached) return JSON.parse(cached);
  }

  const user = await this.userService.create(dto);

  if (idempotencyKey) {
    // Cache result for 24 hours
    await this.redis.setex(
      `idempotency:${idempotencyKey}`,
      86400,
      JSON.stringify(user)
    );
  }

  return user;
}
```

---

## Bulk Operations

### Bulk Create

```http
POST /api/v1/users/bulk
Content-Type: application/json

{
  "users": [
    { "email": "user1@example.com", "firstName": "User", "lastName": "One" },
    { "email": "user2@example.com", "firstName": "User", "lastName": "Two" }
  ]
}
```

### Bulk Create Response

```json
{
  "success": true,
  "data": {
    "created": 150,
    "failed": 0,
    "results": [
      { "id": "uuid-1", "email": "user1@example.com", "status": "created" },
      { "id": "uuid-2", "email": "user2@example.com", "status": "created" }
    ]
  },
  "metadata": {
    "timestamp": "2025-11-18T10:30:00.000Z",
    "duration": 1234,
    "requestId": "req-uuid"
  }
}
```

### Partial Success Handling

```json
{
  "success": false,
  "data": {
    "created": 148,
    "failed": 2,
    "results": [
      { "email": "user1@example.com", "status": "created", "id": "uuid-1" },
      {
        "email": "invalid-email",
        "status": "failed",
        "error": {
          "code": "VALIDATION_ERROR",
          "message": "Invalid email address"
        }
      }
    ]
  }
}
```

---

## Async Operations

### Long-Running Operations Pattern

```http
POST /api/v1/reports/123/regenerate
→ 202 Accepted

{
  "success": true,
  "data": {
    "operationId": "op-550e8400",
    "status": "PENDING",
    "estimatedCompletion": "2025-11-18T10:35:00.000Z",
    "_links": {
      "self": { "href": "/api/v1/operations/op-550e8400" },
      "cancel": { "href": "/api/v1/operations/op-550e8400/cancel" }
    }
  }
}
```

### Polling for Status

```http
GET /api/v1/operations/op-550e8400
→ 200 OK

{
  "success": true,
  "data": {
    "operationId": "op-550e8400",
    "status": "IN_PROGRESS",
    "progress": 65,
    "startedAt": "2025-11-18T10:30:00.000Z",
    "estimatedCompletion": "2025-11-18T10:35:00.000Z",
    "_links": {
      "self": { "href": "/api/v1/operations/op-550e8400" },
      "cancel": { "href": "/api/v1/operations/op-550e8400/cancel" }
    }
  }
}
```

### Completion

```http
GET /api/v1/operations/op-550e8400
→ 200 OK

{
  "success": true,
  "data": {
    "operationId": "op-550e8400",
    "status": "COMPLETED",
    "progress": 100,
    "startedAt": "2025-11-18T10:30:00.000Z",
    "completedAt": "2025-11-18T10:34:30.000Z",
    "result": {
      "reportId": "report-456",
      "_links": {
        "download": { "href": "/api/v1/reports/report-456/download" }
      }
    }
  }
}
```

---

## File Upload/Download

### File Upload (Multipart Form Data)

```http
POST /api/v1/activities/import
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="activities.csv"
Content-Type: text/csv

[CSV content]
------WebKitFormBoundary
Content-Disposition: form-data; name="projectId"

project-123
------WebKitFormBoundary--
```

### File Upload Response

```json
{
  "success": true,
  "data": {
    "fileId": "file-uuid",
    "fileName": "activities.csv",
    "fileSize": 1048576,
    "uploadedAt": "2025-11-18T10:30:00.000Z",
    "status": "PROCESSING",
    "_links": {
      "status": { "href": "/api/v1/uploads/file-uuid/status" }
    }
  }
}
```

### File Download

```http
GET /api/v1/reports/123/download
→ 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="carbon-report-2024.pdf"
Content-Length: 2048576

[Binary file content]
```

---

## OpenAPI Documentation

### OpenAPI 3.1 Specification (Required for All Services)

```yaml
openapi: 3.1.0
info:
  title: Clenergize Identity Service API
  version: 1.0.0
  description: Authentication and user management service
  contact:
    name: Clenergize API Team
    email: api@clenergize.com
  license:
    name: Proprietary

servers:
  - url: https://api.clenergize.com/api/v1
    description: Production
  - url: http://localhost:3001/api/v1
    description: Development

paths:
  /users:
    get:
      summary: List users
      operationId: listUsers
      tags: [Users]
      security:
        - bearerAuth: []
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserListResponse'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    User:
      type: object
      required: [id, email]
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
```

### Auto-Generated Documentation

- **Swagger UI**: `http://localhost:3001/api-docs`
- **ReDoc**: `http://localhost:3001/api-redoc`
- **OpenAPI JSON**: `http://localhost:3001/api-docs-json`

---

## Testing Standards

### API Test Coverage Requirements

```yaml
Unit Tests:
  - Request validation
  - Response serialization
  - Business logic
  - Error handling

Integration Tests:
  - Full request/response cycle
  - Database interactions
  - Authentication/Authorization
  - Error scenarios

E2E Tests:
  - Critical user workflows
  - Cross-service operations
  - Performance tests
```

### Test Example (Jest + Supertest)

```typescript
describe('POST /api/v1/users', () => {
  it('should create user with valid data', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      })
      .expect(201)
      .expect('Content-Type', /json/);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({
      id: expect.any(String),
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      createdAt: expect.any(String)
    });
  });

  it('should return 422 for invalid email', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        email: 'invalid-email',
        firstName: 'Test'
      })
      .expect(422);

    expect(response.body.success).toBe(false);
    expect(response.body.error.errors).toEqual([
      expect.objectContaining({
        field: 'email',
        code: 'INVALID_FORMAT'
      })
    ]);
  });
});
```

---

## Quick Reference

### HTTP Methods Cheat Sheet

```
GET    /api/v1/users          → List all users
GET    /api/v1/users/123      → Get specific user
POST   /api/v1/users          → Create new user
PUT    /api/v1/users/123      → Replace entire user
PATCH  /api/v1/users/123      → Update user fields
DELETE /api/v1/users/123      → Delete user
```

### Status Codes Cheat Sheet

```
200 OK                    → Successful GET, PUT, PATCH
201 Created               → Successful POST (resource created)
202 Accepted              → Async operation started
204 No Content            → Successful DELETE
400 Bad Request           → Invalid request syntax
401 Unauthorized          → Missing/invalid authentication
403 Forbidden             → Insufficient permissions
404 Not Found             → Resource doesn't exist
409 Conflict              → Resource conflict
422 Unprocessable Entity  → Validation failed
429 Too Many Requests     → Rate limit exceeded
500 Internal Server Error → Server error
503 Service Unavailable   → Service down
```

### Common Headers

```
Authorization: Bearer <token>
Content-Type: application/json
X-Request-ID: <uuid>
X-Idempotency-Key: <uuid>
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 45
Cache-Control: public, max-age=3600
ETag: "hash"
```

---

## Compliance Checklist

Before deploying any API endpoint, ensure:

- [ ] URL follows `/api/v1/<resource>` pattern
- [ ] Resource names are plural nouns in kebab-case
- [ ] HTTP methods correctly match operations (GET/POST/PUT/PATCH/DELETE)
- [ ] HTTP status codes follow standard definitions
- [ ] Request/response use standard envelope format
- [ ] Errors follow RFC 7807 Problem Details format
- [ ] Pagination implemented for list endpoints
- [ ] JWT signature verification implemented (NOT just decode!)
- [ ] Role-based access control applied
- [ ] Rate limiting configured
- [ ] CORS headers properly set
- [ ] OpenAPI 3.1 documentation generated
- [ ] Integration tests written with >70% coverage
- [ ] Idempotency keys supported for POST operations
- [ ] Async operations return 202 with status URL
- [ ] All dates in ISO 8601 format
- [ ] All IDs are UUID v4
- [ ] Request-ID header propagated
- [ ] Logging includes correlation IDs
- [ ] Health check endpoint implemented

---

## References

### Standards & RFCs

- **REST**: [Roy Fielding's Dissertation](https://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm)
- **HTTP/1.1**: [RFC 7231](https://tools.ietf.org/html/rfc7231)
- **RFC 7807**: [Problem Details for HTTP APIs](https://tools.ietf.org/html/rfc7807)
- **OpenAPI 3.1**: [Specification](https://spec.openapis.org/oas/v3.1.0)
- **JWT**: [RFC 7519](https://tools.ietf.org/html/rfc7519)
- **OAuth 2.0**: [RFC 6749](https://tools.ietf.org/html/rfc6749)
- **JSON**: [RFC 8259](https://tools.ietf.org/html/rfc8259)

### Internal Documentation

- [API_DESIGN_SPECIFICATION.md](./API_DESIGN_SPECIFICATION.md) - Complete API endpoint catalog
- [ERROR_CODE_REGISTRY.md](./ERROR_CODE_REGISTRY.md) - Centralized error codes
- [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md) - JWT implementation details
- [PHASE3_Service_Spec_*.md](./PHASE3_Service_Spec_01_Identity.md) - Service-specific API specs

---

**Document Status**: ACTIVE
**Last Review**: November 18, 2025
**Next Review**: December 18, 2025
**Owner**: Architecture Team
**Approved By**: CTO

---

*This specification is mandatory for all Clenergize V3 microservices. Deviations require architectural review and approval.*
