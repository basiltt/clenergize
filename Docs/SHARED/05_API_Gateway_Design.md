# API Gateway Specification
**Clenergize V3 - API Gateway & Reverse Proxy Configuration**

**Version**: 1.0.0
**Last Updated**: November 18, 2025
**Owner**: DevOps Agent + Architecture Agent
**Status**: Draft

---

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Routing Configuration](#routing-configuration)
4. [Authentication & Authorization](#authentication--authorization)
5. [Rate Limiting](#rate-limiting)
6. [CORS Configuration](#cors-configuration)
7. [Circuit Breaker Patterns](#circuit-breaker-patterns)
8. [Request/Response Transformation](#requestresponse-transformation)
9. [Health Check Aggregation](#health-check-aggregation)
10. [Error Handling](#error-handling)
11. [Logging & Monitoring](#logging--monitoring)
12. [Security Headers](#security-headers)
13. [Caching Strategy](#caching-strategy)
14. [WebSocket Support](#websocket-support)
15. [Deployment Configuration](#deployment-configuration)

---

## 1. Overview

### Purpose
The API Gateway serves as the **single entry point** for all external client requests to the Clenergize V3 backend microservices. It handles authentication, routing, rate limiting, monitoring, and cross-cutting concerns.

### Technology Stack

| Environment | Technology | Purpose |
|------------|------------|---------|
| **Local Development** | NGINX (Docker) | Reverse proxy with basic routing |
| **Production** | AWS API Gateway + ALB | Managed gateway with advanced features |
| **Staging** | AWS API Gateway + ALB | Production parity |

### Key Responsibilities
- ✅ **Routing**: Direct requests to appropriate backend services
- ✅ **Authentication**: Verify JWT tokens before forwarding
- ✅ **Rate Limiting**: Protect services from abuse
- ✅ **CORS**: Handle cross-origin requests
- ✅ **Circuit Breaking**: Prevent cascading failures
- ✅ **Monitoring**: Log all traffic for observability
- ✅ **SSL/TLS Termination**: Handle encryption/decryption

---

## 2. Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  (Web Browser, Mobile App, Third-Party Integrations)            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTPS (TLS 1.3)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Authentication Middleware (JWT Verification)            │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Rate Limiting (Per User/IP)                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  CORS Validation                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Request Routing (Path-based)                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Circuit Breaker (Per Service)                           │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  Identity     │    │ Organization  │    │  Reference    │
│  Service      │    │  Service      │    │  Service      │
│  :3001        │    │  :3002        │    │  :3003        │
└───────────────┘    └───────────────┘    └───────────────┘
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  Activity     │    │ Calculation   │    │  Reporting    │
│  Service      │    │  Service      │    │  Service      │
│  :3004        │    │  :3005        │    │  :3006        │
└───────────────┘    └───────────────┘    └───────────────┘
                             │
                             ▼
                     ┌───────────────┐
                     │  Audit        │
                     │  Service      │
                     │  :3007        │
                     └───────────────┘
```

### Request Flow

```
1. Client sends request to https://api.clenergize.com/api/v1/users/me
2. API Gateway receives request
3. SSL/TLS termination (decrypt HTTPS)
4. Authentication middleware verifies JWT token
5. Rate limiting checks user quota
6. CORS validation (if cross-origin)
7. Route matching: /api/v1/users/* → Identity Service
8. Circuit breaker check: Is Identity Service healthy?
9. Forward request to http://identity-service:3001/v1/users/me
10. Identity Service processes request
11. Gateway receives response
12. Add correlation headers (X-Correlation-Id)
13. Add security headers (HSTS, CSP, etc.)
14. Return response to client
```

---

## 3. Routing Configuration

### Routing Rules

All external client requests use `/api/v1/*` prefix. The gateway strips `/api` and forwards to services with `/v1/*`.

#### Identity Service Routes

| Client Request | Gateway Strips | Service Receives | Description |
|---------------|----------------|------------------|-------------|
| `POST /api/v1/auth/login` | `/api` | `POST /v1/auth/login` | User login |
| `POST /api/v1/auth/register` | `/api` | `POST /v1/auth/register` | User registration |
| `POST /api/v1/auth/logout` | `/api` | `POST /v1/auth/logout` | User logout |
| `POST /api/v1/auth/refresh` | `/api` | `POST /v1/auth/refresh` | Token refresh |
| `GET /api/v1/users/me` | `/api` | `GET /v1/users/me` | Current user profile |
| `GET /api/v1/users/:id` | `/api` | `GET /v1/users/:id` | User details |
| `PUT /api/v1/users/:id` | `/api` | `PUT /v1/users/:id` | Update user |
| `DELETE /api/v1/users/:id` | `/api` | `DELETE /v1/users/:id` | Delete user |
| `POST /api/v1/users/:id/roles` | `/api` | `POST /v1/users/:id/roles` | Assign role |

**Target**: `http://identity-service:3001`

---

#### Organization Service Routes

| Client Request | Gateway Strips | Service Receives | Description |
|---------------|----------------|------------------|-------------|
| `GET /api/v1/organizations` | `/api` | `GET /v1/organizations` | List organizations |
| `POST /api/v1/organizations` | `/api` | `POST /v1/organizations` | Create organization |
| `GET /api/v1/organizations/:id` | `/api` | `GET /v1/organizations/:id` | Organization details |
| `PUT /api/v1/organizations/:id` | `/api` | `PUT /v1/organizations/:id` | Update organization |
| `GET /api/v1/projects` | `/api` | `GET /v1/projects` | List projects |
| `POST /api/v1/projects` | `/api` | `POST /v1/projects` | Create project |
| `GET /api/v1/projects/:id` | `/api` | `GET /v1/projects/:id` | Project details |
| `GET /api/v1/projects/:id/hierarchy` | `/api` | `GET /v1/projects/:id/hierarchy` | Project hierarchy |
| `POST /api/v1/hierarchies` | `/api` | `POST /v1/hierarchies` | Create hierarchy template |

**Target**: `http://organization-service:3002`

---

#### Reference Service Routes

| Client Request | Gateway Strips | Service Receives | Description |
|---------------|----------------|------------------|-------------|
| `GET /api/v1/emission-factors` | `/api` | `GET /v1/emission-factors` | List emission factors |
| `GET /api/v1/emission-factors/:id` | `/api` | `GET /v1/emission-factors/:id` | Factor details |
| `POST /api/v1/emission-factors` | `/api` | `POST /v1/emission-factors` | Create factor (admin) |
| `GET /api/v1/units` | `/api` | `GET /v1/units` | List units |
| `GET /api/v1/conversions` | `/api` | `GET /v1/conversions` | Unit conversions |
| `GET /api/v1/categories` | `/api` | `GET /v1/categories` | Activity categories |

**Target**: `http://reference-service:3003`

---

#### Activity Service Routes

| Client Request | Gateway Strips | Service Receives | Description |
|---------------|----------------|------------------|-------------|
| `GET /api/v1/activities` | `/api` | `GET /v1/activities` | List activities |
| `POST /api/v1/activities` | `/api` | `POST /v1/activities` | Create activity |
| `POST /api/v1/activities/bulk` | `/api` | `POST /v1/activities/bulk` | Bulk upload (Excel) |
| `GET /api/v1/activities/:id` | `/api` | `GET /v1/activities/:id` | Activity details |
| `PUT /api/v1/activities/:id` | `/api` | `PUT /v1/activities/:id` | Update activity |
| `DELETE /api/v1/activities/:id` | `/api` | `DELETE /v1/activities/:id` | Delete activity |
| `POST /api/v1/activities/validate` | `/api` | `POST /v1/activities/validate` | Validate data |

**Target**: `http://activity-service:3004`

---

#### Calculation Service Routes

| Client Request | Gateway Strips | Service Receives | Description |
|---------------|----------------|------------------|-------------|
| `POST /api/v1/calculations/trigger` | `/api` | `POST /v1/calculations/trigger` | Trigger calculation |
| `GET /api/v1/calculations/:id` | `/api` | `GET /v1/calculations/:id` | Calculation result |
| `GET /api/v1/calculations/:id/status` | `/api` | `GET /v1/calculations/:id/status` | Calculation status |
| `POST /api/v1/rollups/trigger` | `/api` | `POST /v1/rollups/trigger` | Trigger rollup |
| `GET /api/v1/rollups/:projectId` | `/api` | `GET /v1/rollups/:projectId` | Rollup results |

**Target**: `http://calculation-service:3005`

---

#### Reporting Service Routes

| Client Request | Gateway Strips | Service Receives | Description |
|---------------|----------------|------------------|-------------|
| `POST /api/v1/reports/generate` | `/api` | `POST /v1/reports/generate` | Generate report |
| `GET /api/v1/reports/:id` | `/api` | `GET /v1/reports/:id` | Report details |
| `GET /api/v1/reports/:id/download` | `/api` | `GET /v1/reports/:id/download` | Download report |
| `GET /api/v1/exports/create` | `/api` | `GET /v1/exports/create` | Create export |
| `GET /api/v1/exports/:id/status` | `/api` | `GET /v1/exports/:id/status` | Export status |

**Target**: `http://reporting-service:3006`

---

#### Audit Service Routes

| Client Request | Gateway Strips | Service Receives | Description |
|---------------|----------------|------------------|-------------|
| `GET /api/v1/audit/logs` | `/api` | `GET /v1/audit/logs` | Query audit logs |
| `GET /api/v1/audit/logs/:id` | `/api` | `GET /v1/audit/logs/:id` | Audit log details |
| `GET /api/v1/audit/user/:userId` | `/api` | `GET /v1/audit/user/:userId` | User audit trail |
| `POST /api/v1/compliance/gdpr-export` | `/api` | `POST /v1/compliance/gdpr-export` | GDPR data export |

**Target**: `http://audit-service:3007`

---

### NGINX Configuration (Local Development)

```nginx
# /etc/nginx/conf.d/clenergize-gateway.conf

upstream identity_service {
    server identity-service:3001 max_fails=3 fail_timeout=30s;
}

upstream organization_service {
    server organization-service:3002 max_fails=3 fail_timeout=30s;
}

upstream reference_service {
    server reference-service:3003 max_fails=3 fail_timeout=30s;
}

upstream activity_service {
    server activity-service:3004 max_fails=3 fail_timeout=30s;
}

upstream calculation_service {
    server calculation-service:3005 max_fails=3 fail_timeout=30s;
}

upstream reporting_service {
    server reporting-service:3006 max_fails=3 fail_timeout=30s;
}

upstream audit_service {
    server audit-service:3007 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name localhost;

    # Redirect HTTP to HTTPS (in production)
    # return 301 https://$server_name$request_uri;

    # Request body size limit (for file uploads)
    client_max_body_size 50M;

    # Timeouts
    proxy_connect_timeout 30s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;

    # Buffer settings
    proxy_buffering on;
    proxy_buffer_size 4k;
    proxy_buffers 8 4k;

    # Add correlation ID if not present
    set $correlation_id $http_x_correlation_id;
    if ($correlation_id = "") {
        set $correlation_id $request_id;
    }

    # Identity Service routes
    location ~ ^/api/v1/(auth|users) {
        proxy_pass http://identity_service;
        rewrite ^/api/v1/(.*)$ /v1/$1 break;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Correlation-Id $correlation_id;

        # Rate limiting (basic)
        limit_req zone=api_limit burst=20 nodelay;
    }

    # Organization Service routes
    location ~ ^/api/v1/(organizations|projects|hierarchies) {
        proxy_pass http://organization_service;
        rewrite ^/api/v1/(.*)$ /v1/$1 break;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Correlation-Id $correlation_id;

        limit_req zone=api_limit burst=20 nodelay;
    }

    # Reference Service routes
    location ~ ^/api/v1/(emission-factors|units|conversions|categories) {
        proxy_pass http://reference_service;
        rewrite ^/api/v1/(.*)$ /v1/$1 break;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Correlation-Id $correlation_id;

        limit_req zone=api_limit burst=50 nodelay;

        # Enable caching for reference data (5 minutes)
        proxy_cache_valid 200 5m;
    }

    # Activity Service routes
    location ~ ^/api/v1/activities {
        proxy_pass http://activity_service;
        rewrite ^/api/v1/(.*)$ /v1/$1 break;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Correlation-Id $correlation_id;

        limit_req zone=api_limit burst=20 nodelay;

        # Increased timeout for bulk uploads
        proxy_read_timeout 300s;
    }

    # Calculation Service routes
    location ~ ^/api/v1/(calculations|rollups) {
        proxy_pass http://calculation_service;
        rewrite ^/api/v1/(.*)$ /v1/$1 break;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Correlation-Id $correlation_id;

        limit_req zone=api_limit burst=10 nodelay;

        # Long timeout for calculations
        proxy_read_timeout 600s;
    }

    # Reporting Service routes
    location ~ ^/api/v1/(reports|exports) {
        proxy_pass http://reporting_service;
        rewrite ^/api/v1/(.*)$ /v1/$1 break;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Correlation-Id $correlation_id;

        limit_req zone=api_limit burst=10 nodelay;

        # Long timeout for report generation
        proxy_read_timeout 600s;
    }

    # Audit Service routes
    location ~ ^/api/v1/(audit|compliance) {
        proxy_pass http://audit_service;
        rewrite ^/api/v1/(.*)$ /v1/$1 break;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Correlation-Id $correlation_id;

        limit_req zone=api_limit burst=20 nodelay;
    }

    # Health check endpoint (aggregated)
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Metrics endpoint (for monitoring)
    location /metrics {
        stub_status on;
        access_log off;
        allow 127.0.0.1;
        deny all;
    }

    # Default fallback
    location / {
        return 404 '{"success": false, "error": {"code": "ROUTE_NOT_FOUND", "message": "The requested route does not exist"}}';
        add_header Content-Type application/json;
    }
}

# Rate limiting zone definition
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
```

---

## 4. Authentication & Authorization

### JWT Verification Middleware

**Responsibility**: Verify JWT token signature before forwarding to backend services.

#### AWS API Gateway Configuration

```yaml
# API Gateway Authorizer
Authorizers:
  CognitoAuthorizer:
    Type: COGNITO_USER_POOLS
    Name: ClenergizeUserPool
    IdentitySource: method.request.header.Authorization
    UserPoolArn: arn:aws:cognito:us-east-1:ACCOUNT_ID:userpool/POOL_ID

  # OR Custom Lambda Authorizer (if using JWKS verification)
  JWKSAuthorizer:
    Type: TOKEN
    AuthorizerUri: arn:aws:lambda:us-east-1:ACCOUNT_ID:function:jwt-authorizer
    IdentitySource: method.request.header.Authorization
    AuthorizerResultTtlInSeconds: 300
```

#### Lambda Authorizer (Custom JWKS Verification)

```typescript
// infrastructure/lambda/jwt-authorizer/index.ts
import jwksRsa from 'jwks-rsa';
import jwt from 'jsonwebtoken';

const jwksClient = jwksRsa({
  jwksUri: process.env.JWKS_URI!,
  cache: true,
  cacheMaxAge: 600000, // 10 minutes
  rateLimit: true,
  jwksRequestsPerMinute: 10
});

export const handler = async (event: any) => {
  try {
    const token = event.authorizationToken.replace('Bearer ', '');

    // Decode token to get kid
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || !decoded.header.kid) {
      return generatePolicy('user', 'Deny', event.methodArn);
    }

    // Get signing key
    const key = await jwksClient.getSigningKey(decoded.header.kid);
    const signingKey = key.getPublicKey();

    // Verify token
    const verified = jwt.verify(token, signingKey, {
      algorithms: ['RS256'],
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE
    });

    // Generate allow policy with user context
    return generatePolicy(verified.sub, 'Allow', event.methodArn, {
      userId: verified.sub,
      email: verified.email,
      roles: verified['custom:roles'] || []
    });

  } catch (error) {
    console.error('JWT verification failed:', error);
    return generatePolicy('user', 'Deny', event.methodArn);
  }
};

function generatePolicy(principalId: string, effect: string, resource: string, context?: any) {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [{
        Action: 'execute-api:Invoke',
        Effect: effect,
        Resource: resource
      }]
    },
    context: context || {}
  };
}
```

### Exempt Routes (No Authentication Required)

| Route | Method | Reason |
|-------|--------|--------|
| `POST /api/v1/auth/login` | POST | Login endpoint |
| `POST /api/v1/auth/register` | POST | Registration endpoint |
| `POST /api/v1/auth/refresh` | POST | Token refresh (uses refresh token) |
| `GET /health` | GET | Health check |
| `GET /api/v1/emission-factors` | GET | Public reference data |

All other routes **require valid JWT token** in `Authorization: Bearer <token>` header.

---

## 5. Rate Limiting

### Rate Limiting Strategy

**Goal**: Protect backend services from abuse while allowing legitimate traffic.

#### Rate Limiting Tiers

| Tier | Requests per Minute | Burst | Use Case |
|------|---------------------|-------|----------|
| **Public** | 10 req/min | 5 | Unauthenticated users |
| **Authenticated** | 100 req/min | 20 | Standard users |
| **Premium** | 500 req/min | 50 | Paid accounts |
| **Admin** | 1000 req/min | 100 | System administrators |
| **Service-to-Service** | 10000 req/min | 200 | Internal microservices |

#### Per-Endpoint Rate Limits

| Endpoint | Rate Limit | Reason |
|----------|------------|--------|
| `POST /api/v1/auth/login` | 5 req/min per IP | Prevent brute force |
| `POST /api/v1/auth/register` | 3 req/min per IP | Prevent spam accounts |
| `POST /api/v1/activities/bulk` | 5 req/hour | Heavy processing |
| `POST /api/v1/calculations/trigger` | 10 req/min | Expensive operations |
| `POST /api/v1/reports/generate` | 5 req/min | Report generation |
| `GET /api/v1/emission-factors` | 200 req/min | Cacheable reference data |

#### AWS API Gateway Rate Limiting

```yaml
# API Gateway Usage Plans
UsagePlans:
  FreeUserPlan:
    Throttle:
      RateLimit: 100  # requests per second
      BurstLimit: 20
    Quota:
      Limit: 10000   # requests per month
      Period: MONTH

  PremiumUserPlan:
    Throttle:
      RateLimit: 500
      BurstLimit: 50
    Quota:
      Limit: 1000000
      Period: MONTH

  AdminUserPlan:
    Throttle:
      RateLimit: 1000
      BurstLimit: 100
    Quota:
      Limit: 10000000
      Period: MONTH
```

#### NGINX Rate Limiting Configuration

```nginx
# Rate limiting zones
limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;
limit_req_zone $binary_remote_addr zone=register_limit:10m rate=3r/m;
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
limit_req_zone $binary_remote_addr zone=bulk_limit:10m rate=5r/h;

# Apply in location blocks
location ~ ^/api/v1/auth/login {
    limit_req zone=login_limit burst=2 nodelay;
    limit_req_status 429;
    # ... rest of config
}

location ~ ^/api/v1/auth/register {
    limit_req zone=register_limit burst=1 nodelay;
    limit_req_status 429;
    # ... rest of config
}
```

#### Response Headers

When rate limit is exceeded:

```
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1700000000
Retry-After: 60

{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "You have exceeded the rate limit. Please try again in 60 seconds.",
    "retryAfter": 60
  }
}
```

---

## 6. CORS Configuration

### CORS Policy

**Goal**: Allow frontend applications to make cross-origin requests while maintaining security.

#### Allowed Origins

| Environment | Allowed Origins |
|-------------|----------------|
| **Local Development** | `http://localhost:3000` |
| **Staging** | `https://staging.clenergize.com` |
| **Production** | `https://app.clenergize.com`, `https://www.clenergize.com` |

#### CORS Headers

```yaml
Access-Control-Allow-Origin: https://app.clenergize.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Correlation-Id, X-Request-Id
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400  # 24 hours
Access-Control-Expose-Headers: X-Correlation-Id, X-RateLimit-Limit, X-RateLimit-Remaining
```

#### NGINX CORS Configuration

```nginx
# CORS configuration
location / {
    # Handle OPTIONS preflight requests
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' $http_origin always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Correlation-Id' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Max-Age' 86400 always;
        add_header 'Content-Length' 0;
        add_header 'Content-Type' 'text/plain';
        return 204;
    }

    # Add CORS headers to all responses
    add_header 'Access-Control-Allow-Origin' $http_origin always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;
    add_header 'Access-Control-Expose-Headers' 'X-Correlation-Id, X-RateLimit-Limit' always;

    # ... rest of proxy config
}
```

#### AWS API Gateway CORS

```yaml
# CloudFormation / SAM Template
CORS:
  AllowOrigins:
    - https://app.clenergize.com
    - https://www.clenergize.com
  AllowMethods:
    - GET
    - POST
    - PUT
    - DELETE
    - PATCH
    - OPTIONS
  AllowHeaders:
    - Content-Type
    - Authorization
    - X-Correlation-Id
    - X-Request-Id
  AllowCredentials: true
  MaxAge: 86400
  ExposeHeaders:
    - X-Correlation-Id
    - X-RateLimit-Limit
    - X-RateLimit-Remaining
```

---

## 7. Circuit Breaker Patterns

### Purpose
Prevent cascading failures when a backend service becomes unhealthy. The gateway will "trip" the circuit breaker after consecutive failures and return cached responses or friendly errors.

### Circuit Breaker Configuration

| Service | Max Failures | Timeout | Half-Open After | Fallback Strategy |
|---------|--------------|---------|-----------------|-------------------|
| Identity | 5 failures | 30s | 60s | Return cached user profile |
| Organization | 5 failures | 30s | 60s | Return error |
| Reference | 3 failures | 30s | 120s | Return cached reference data |
| Activity | 5 failures | 60s | 60s | Queue request for later |
| Calculation | 3 failures | 120s | 300s | Return error |
| Reporting | 3 failures | 120s | 300s | Return error |
| Audit | 10 failures | 30s | 60s | Log locally |

### Circuit Breaker States

```
┌─────────┐
│ CLOSED  │  ◀── Normal operation, requests flow through
└────┬────┘
     │ 5 consecutive failures
     ▼
┌─────────┐
│  OPEN   │  ◀── Circuit tripped, fast fail, return fallback
└────┬────┘
     │ After 60 seconds
     ▼
┌─────────┐
│ HALF    │  ◀── Test if service recovered (allow 1 request)
│ OPEN    │
└────┬────┘
     │ Success → CLOSED
     │ Failure → OPEN
```

### Implementation (AWS API Gateway with Lambda)

```typescript
// infrastructure/lambda/circuit-breaker/index.ts
import { DynamoDBClient, GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';

const dynamodb = new DynamoDBClient({ region: 'us-east-1' });

interface CircuitBreakerState {
  service: string;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  lastFailureTime: number;
  lastStateChange: number;
}

export async function checkCircuitBreaker(serviceName: string): Promise<boolean> {
  const state = await getCircuitState(serviceName);

  // Circuit is OPEN, reject immediately
  if (state.state === 'OPEN') {
    const now = Date.now();
    const timeSinceOpen = now - state.lastStateChange;

    // Transition to HALF_OPEN after timeout
    if (timeSinceOpen > 60000) { // 60 seconds
      await updateCircuitState(serviceName, { state: 'HALF_OPEN' });
      return true; // Allow one test request
    }

    return false; // Circuit still open
  }

  // Circuit is CLOSED or HALF_OPEN, allow request
  return true;
}

export async function recordSuccess(serviceName: string): Promise<void> {
  await updateCircuitState(serviceName, {
    state: 'CLOSED',
    failureCount: 0
  });
}

export async function recordFailure(serviceName: string): Promise<void> {
  const state = await getCircuitState(serviceName);
  const newFailureCount = state.failureCount + 1;

  // Trip circuit breaker after 5 failures
  if (newFailureCount >= 5) {
    await updateCircuitState(serviceName, {
      state: 'OPEN',
      failureCount: newFailureCount,
      lastFailureTime: Date.now(),
      lastStateChange: Date.now()
    });
  } else {
    await updateCircuitState(serviceName, {
      failureCount: newFailureCount,
      lastFailureTime: Date.now()
    });
  }
}

async function getCircuitState(serviceName: string): Promise<CircuitBreakerState> {
  const result = await dynamodb.send(new GetItemCommand({
    TableName: 'CircuitBreakerState',
    Key: { service: { S: serviceName } }
  }));

  if (!result.Item) {
    return {
      service: serviceName,
      state: 'CLOSED',
      failureCount: 0,
      lastFailureTime: 0,
      lastStateChange: Date.now()
    };
  }

  return {
    service: result.Item.service.S!,
    state: result.Item.state.S as any,
    failureCount: parseInt(result.Item.failureCount.N!),
    lastFailureTime: parseInt(result.Item.lastFailureTime.N!),
    lastStateChange: parseInt(result.Item.lastStateChange.N!)
  };
}

async function updateCircuitState(serviceName: string, updates: Partial<CircuitBreakerState>): Promise<void> {
  const currentState = await getCircuitState(serviceName);
  const newState = { ...currentState, ...updates };

  await dynamodb.send(new PutItemCommand({
    TableName: 'CircuitBreakerState',
    Item: {
      service: { S: newState.service },
      state: { S: newState.state },
      failureCount: { N: newState.failureCount.toString() },
      lastFailureTime: { N: newState.lastFailureTime.toString() },
      lastStateChange: { N: (newState.lastStateChange || Date.now()).toString() }
    }
  }));
}
```

### Fallback Responses

#### Circuit Open Response

```json
HTTP/1.1 503 Service Unavailable
Content-Type: application/json
X-Circuit-Breaker: OPEN
Retry-After: 60

{
  "success": false,
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "The Identity Service is temporarily unavailable. Please try again in 60 seconds.",
    "service": "identity-service",
    "retryAfter": 60
  }
}
```

---

## 8. Request/Response Transformation

### Request Enrichment

The gateway adds metadata to all requests before forwarding:

```typescript
// Headers added by gateway
{
  'X-Correlation-Id': 'uuid-v4',           // Request tracing
  'X-Real-IP': '203.0.113.45',             // Client IP
  'X-Forwarded-For': '203.0.113.45',       // Proxy chain
  'X-Forwarded-Proto': 'https',            // Protocol
  'X-Request-Start': '1700000000000',      // Timestamp
  'X-User-Id': 'user-123',                 // From JWT
  'X-User-Roles': 'ADMIN,MANAGER',         // From JWT
  'X-Organization-Id': 'org-456'           // From JWT
}
```

### Response Enrichment

The gateway adds metadata to all responses:

```typescript
// Headers added by gateway
{
  'X-Correlation-Id': 'uuid-v4',           // Same as request
  'X-Response-Time': '150',                // Milliseconds
  'X-Service': 'identity-service',         // Which service responded
  'X-Cache-Status': 'MISS',                // Cache hit/miss
  'X-RateLimit-Limit': '100',              // Rate limit quota
  'X-RateLimit-Remaining': '95',           // Remaining requests
  'X-RateLimit-Reset': '1700000060'        // Reset timestamp
}
```

### Response Standardization

Ensure all service responses follow RFC 7807 Problem Details format:

```typescript
// Success Response (standardized)
{
  "success": true,
  "data": { ... },
  "metadata": {
    "timestamp": "2025-11-18T10:30:00Z",
    "version": "1.0.0",
    "correlationId": "uuid-v4"
  }
}

// Error Response (standardized)
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "User-friendly message",
    "details": { ... },
    "timestamp": "2025-11-18T10:30:00Z",
    "correlationId": "uuid-v4"
  }
}
```

---

## 9. Health Check Aggregation

### Service Health Checks

Each backend service exposes health endpoints:

```
GET /health/live     # Liveness probe (is process running?)
GET /health/ready    # Readiness probe (can it handle traffic?)
```

### Gateway Health Aggregation

```
GET /health          # Aggregated health of all services
```

**Response**:

```json
{
  "status": "healthy",
  "timestamp": "2025-11-18T10:30:00Z",
  "services": {
    "identity": {
      "status": "healthy",
      "responseTime": 15,
      "lastCheck": "2025-11-18T10:29:55Z"
    },
    "organization": {
      "status": "healthy",
      "responseTime": 12,
      "lastCheck": "2025-11-18T10:29:55Z"
    },
    "reference": {
      "status": "healthy",
      "responseTime": 8,
      "lastCheck": "2025-11-18T10:29:55Z"
    },
    "activity": {
      "status": "degraded",
      "responseTime": 250,
      "lastCheck": "2025-11-18T10:29:55Z",
      "message": "High response time"
    },
    "calculation": {
      "status": "healthy",
      "responseTime": 45,
      "lastCheck": "2025-11-18T10:29:55Z"
    },
    "reporting": {
      "status": "healthy",
      "responseTime": 30,
      "lastCheck": "2025-11-18T10:29:55Z"
    },
    "audit": {
      "status": "healthy",
      "responseTime": 10,
      "lastCheck": "2025-11-18T10:29:55Z"
    }
  },
  "dependencies": {
    "mongodb": "healthy",
    "redis": "healthy",
    "eventbridge": "healthy"
  }
}
```

### Health Check Thresholds

| Status | Condition |
|--------|-----------|
| `healthy` | Response time < 100ms, no errors |
| `degraded` | Response time 100-500ms OR 1-5% errors |
| `unhealthy` | Response time > 500ms OR >5% errors OR unreachable |

---

## 10. Error Handling

### Gateway Error Responses

#### 400 Bad Request (Invalid Input)

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request is malformed or contains invalid data.",
    "details": {
      "errors": [
        {
          "field": "email",
          "code": "INVALID_FORMAT",
          "message": "Email must be a valid email address"
        }
      ]
    }
  }
}
```

#### 401 Unauthorized (Invalid/Missing Token)

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication is required. Please provide a valid JWT token.",
    "action": "Please log in to obtain a valid token."
  }
}
```

#### 403 Forbidden (Insufficient Permissions)

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to access this resource.",
    "requiredRole": "ADMIN",
    "currentRole": "USER"
  }
}
```

#### 404 Not Found (Route Not Found)

```json
{
  "success": false,
  "error": {
    "code": "ROUTE_NOT_FOUND",
    "message": "The requested route does not exist.",
    "path": "/api/v1/nonexistent",
    "method": "GET"
  }
}
```

#### 429 Too Many Requests (Rate Limit)

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "You have exceeded the rate limit. Please try again later.",
    "limit": 100,
    "remaining": 0,
    "resetAt": "2025-11-18T10:31:00Z",
    "retryAfter": 60
  }
}
```

#### 502 Bad Gateway (Service Error)

```json
{
  "success": false,
  "error": {
    "code": "BAD_GATEWAY",
    "message": "The Identity Service returned an invalid response.",
    "service": "identity-service",
    "correlationId": "uuid-v4"
  }
}
```

#### 503 Service Unavailable (Circuit Open)

```json
{
  "success": false,
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "The Identity Service is temporarily unavailable.",
    "service": "identity-service",
    "circuitState": "OPEN",
    "retryAfter": 60
  }
}
```

#### 504 Gateway Timeout

```json
{
  "success": false,
  "error": {
    "code": "GATEWAY_TIMEOUT",
    "message": "The Identity Service did not respond in time.",
    "service": "identity-service",
    "timeout": 30,
    "correlationId": "uuid-v4"
  }
}
```

---

## 11. Logging & Monitoring

### Access Logs

Log every request with:

```json
{
  "timestamp": "2025-11-18T10:30:00.123Z",
  "correlationId": "uuid-v4",
  "method": "GET",
  "path": "/api/v1/users/me",
  "statusCode": 200,
  "responseTime": 150,
  "userAgent": "Mozilla/5.0...",
  "clientIp": "203.0.113.45",
  "userId": "user-123",
  "service": "identity-service",
  "cacheStatus": "MISS",
  "bytesIn": 512,
  "bytesOut": 2048
}
```

### Error Logs

Log all 4xx and 5xx responses:

```json
{
  "timestamp": "2025-11-18T10:30:00.123Z",
  "level": "error",
  "correlationId": "uuid-v4",
  "errorCode": "SERVICE_UNAVAILABLE",
  "message": "Identity Service is unavailable",
  "service": "identity-service",
  "circuitState": "OPEN",
  "userId": "user-123",
  "path": "/api/v1/users/me",
  "statusCode": 503
}
```

### CloudWatch Metrics

Publish custom metrics to CloudWatch:

| Metric | Unit | Description |
|--------|------|-------------|
| `RequestCount` | Count | Total requests per service |
| `ErrorCount` | Count | 4xx and 5xx errors |
| `ResponseTime` | Milliseconds | Request latency (p50, p95, p99) |
| `RateLimitExceeded` | Count | Rate limit violations |
| `CircuitBreakerOpen` | Count | Circuit breaker trips |
| `CacheHitRate` | Percent | Cache hit percentage |

### X-Ray Tracing

Enable AWS X-Ray distributed tracing:

```typescript
// X-Ray segment for gateway
const segment = AWSXRay.getSegment();
segment.addAnnotation('service', 'api-gateway');
segment.addAnnotation('correlationId', correlationId);
segment.addMetadata('request', {
  method: req.method,
  path: req.path,
  userId: req.user?.id
});
```

---

## 12. Security Headers

### Required Security Headers

```yaml
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### NGINX Security Headers Configuration

```nginx
# Add security headers to all responses
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

# Remove server version
server_tokens off;
```

---

## 13. Caching Strategy

### Cacheable Endpoints

| Endpoint | Cache TTL | Invalidation |
|----------|-----------|--------------|
| `GET /api/v1/emission-factors` | 5 minutes | On data update |
| `GET /api/v1/units` | 1 hour | On data update |
| `GET /api/v1/conversions` | 1 hour | On data update |
| `GET /api/v1/categories` | 10 minutes | On data update |
| `GET /api/v1/users/:id` | 2 minutes | On user update |

### NGINX Caching Configuration

```nginx
# Define cache path
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m inactive=60m use_temp_path=off;

# Enable caching for reference data
location ~ ^/api/v1/emission-factors {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
    proxy_cache_lock on;
    proxy_cache_key "$scheme$request_method$host$request_uri";

    add_header X-Cache-Status $upstream_cache_status;

    # ... rest of proxy config
}
```

### Cache Invalidation

Backend services can invalidate cache by sending headers:

```typescript
// In backend service response
res.setHeader('Cache-Control', 'no-cache');
res.setHeader('X-Cache-Invalidate', '/api/v1/emission-factors/*');
```

---

## 14. WebSocket Support

### WebSocket Routes

For real-time updates (calculation progress, notifications):

```
wss://api.clenergize.com/ws/calculations
wss://api.clenergize.com/ws/notifications
```

### NGINX WebSocket Configuration

```nginx
location /ws/ {
    proxy_pass http://backend_service;

    # WebSocket upgrade
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";

    # Standard headers
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

    # Timeouts for long-lived connections
    proxy_read_timeout 3600s;
    proxy_send_timeout 3600s;
}
```

### AWS API Gateway WebSocket

```yaml
# WebSocket API (separate from REST API)
WebSocketAPI:
  Type: AWS::ApiGatewayV2::Api
  Properties:
    Name: ClenergizeWebSocketAPI
    ProtocolType: WEBSOCKET
    RouteSelectionExpression: $request.body.action

Routes:
  - RouteKey: $connect
    Target: !Sub "integrations/${ConnectIntegration}"
  - RouteKey: $disconnect
    Target: !Sub "integrations/${DisconnectIntegration}"
  - RouteKey: calculations
    Target: !Sub "integrations/${CalculationsIntegration}"
```

---

## 15. Deployment Configuration

### Docker Compose (Local Development)

```yaml
# docker-compose.gateway.yml
version: '3.8'

services:
  nginx-gateway:
    image: nginx:1.25-alpine
    container_name: clenergize-gateway
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./infrastructure/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./infrastructure/nginx/conf.d:/etc/nginx/conf.d:ro
      - ./infrastructure/nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - identity-service
      - organization-service
      - reference-service
      - activity-service
      - calculation-service
      - reporting-service
      - audit-service
    networks:
      - clenergize-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s

networks:
  clenergize-network:
    external: true
```

### AWS API Gateway (Production)

```yaml
# infrastructure/cloudformation/api-gateway.yml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Clenergize V3 API Gateway Configuration'

Resources:
  ClenergizeRestAPI:
    Type: AWS::ApiGateway::RestApi
    Properties:
      Name: ClenergizeV3API
      Description: API Gateway for Clenergize V3 microservices
      EndpointConfiguration:
        Types:
          - REGIONAL
      Policy:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal: '*'
            Action: 'execute-api:Invoke'
            Resource: '*'

  # JWT Authorizer
  JWTAuthorizer:
    Type: AWS::ApiGateway::Authorizer
    Properties:
      Name: CognitoAuthorizer
      Type: COGNITO_USER_POOLS
      RestApiId: !Ref ClenergizeRestAPI
      IdentitySource: method.request.header.Authorization
      ProviderARNs:
        - !GetAtt CognitoUserPool.Arn

  # Deploy API Gateway
  APIDeployment:
    Type: AWS::ApiGateway::Deployment
    DependsOn:
      - IdentityServiceResource
      - OrganizationServiceResource
    Properties:
      RestApiId: !Ref ClenergizeRestAPI
      StageName: prod

  # Usage Plan
  UsagePlan:
    Type: AWS::ApiGateway::UsagePlan
    Properties:
      UsagePlanName: StandardUserPlan
      Description: Standard usage plan for authenticated users
      ApiStages:
        - ApiId: !Ref ClenergizeRestAPI
          Stage: prod
      Throttle:
        RateLimit: 100
        BurstLimit: 20
      Quota:
        Limit: 100000
        Period: MONTH

  # CloudWatch Logs
  APIGatewayLogGroup:
    Type: AWS::Logs::LogGroup
    Properties:
      LogGroupName: /aws/apigateway/clenergize-v3
      RetentionInDays: 30

Outputs:
  APIGatewayURL:
    Description: API Gateway URL
    Value: !Sub "https://${ClenergizeRestAPI}.execute-api.${AWS::Region}.amazonaws.com/prod"
    Export:
      Name: ClenergizeAPIGatewayURL
```

---

## Testing & Validation

### Gateway Testing Checklist

- [ ] JWT verification works (valid token → 200, invalid → 401)
- [ ] Rate limiting enforced (exceed limit → 429)
- [ ] CORS headers present (preflight OPTIONS → 204)
- [ ] Routing to all 7 services works
- [ ] Circuit breaker trips after 5 failures
- [ ] Health check aggregation returns status
- [ ] Correlation IDs propagated to services
- [ ] Security headers present in all responses
- [ ] Timeouts configured correctly (30s-600s)
- [ ] Error responses follow RFC 7807 format

### Load Testing

```bash
# Test gateway throughput
k6 run --vus 100 --duration 5m infrastructure/tests/gateway-load-test.js
```

---

## References

- [NGINX Reverse Proxy Guide](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)
- [AWS API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [RFC 7807: Problem Details for HTTP APIs](https://tools.ietf.org/html/rfc7807)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)

---

**Document Status**: ✅ Complete
**Next Review**: Sprint 0.2 (Week 3)
**Owner**: DevOps Agent + Architecture Agent
