# JWT/JWKS Authentication Architecture

> **Document Type**: Security Architecture
> **Status**: Draft
> **Version**: 1.0.0
> **Last Updated**: November 18, 2025
> **Owner**: Security Agent

---

## Executive Summary

This document defines the JWT (JSON Web Token) and JWKS (JSON Web Key Set) authentication architecture for Clenergize V3. This design **fixes the critical security vulnerability** in the OLD system where JWT tokens were decoded without signature verification (CVSS 9.8).

### Key Changes from OLD System

| Aspect | OLD System ❌ | NEW System ✅ |
|--------|--------------|--------------|
| **Signature Verification** | None - `jwt.decode()` only | Full JWKS verification with RS256 |
| **Key Management** | Hardcoded HS256 secret | AWS Cognito JWKS rotation |
| **Token Storage** | localStorage (XSS vulnerable) | HttpOnly cookies + secure storage |
| **Refresh Strategy** | No refresh tokens | Refresh token rotation |
| **Session Management** | No session tracking | Redis-backed sessions with fingerprinting |
| **MFA Integration** | None | TOTP-based MFA required for sensitive operations |

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    AWS Cognito User Pool                    │
│  • JWT Issuer (iss)                                         │
│  • JWKS Endpoint: /.well-known/jwks.json                    │
│  • RS256 Key Rotation (every 90 days)                       │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
                         │ Public Keys
┌────────────────────────▼────────────────────────────────────┐
│              API Gateway (NestJS) - Port 3000               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           JWT Verification Middleware                │   │
│  │  1. Extract token from Authorization header          │   │
│  │  2. Decode header to get 'kid' (Key ID)              │   │
│  │  3. Fetch public key from JWKS cache                 │   │
│  │  4. Verify signature with RS256                      │   │
│  │  5. Validate claims (iss, aud, exp, nbf)             │   │
│  │  6. Attach user to request context                   │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼────┐     ┌────▼────┐     ┌───▼─────┐
    │Identity │     │  Org    │     │Activity │
    │ Service │     │ Service │     │ Service │
    └─────────┘     └─────────┘     └─────────┘
         │
         │ Session Validation
         │
    ┌────▼────┐
    │  Redis  │
    │ Sessions│
    └─────────┘
```

---

## Table of Contents

1. [JWT Token Structure](#jwt-token-structure)
2. [JWKS Integration](#jwks-integration)
3. [Token Verification Flow](#token-verification-flow)
4. [Key Rotation Strategy](#key-rotation-strategy)
5. [Implementation Details](#implementation-details)
6. [Refresh Token Mechanism](#refresh-token-mechanism)
7. [Session Management](#session-management)
8. [MFA Integration](#mfa-integration)
9. [Error Handling](#error-handling)
10. [Security Best Practices](#security-best-practices)
11. [Testing Strategy](#testing-strategy)
12. [Migration from OLD System](#migration-from-old-system)

---

## 1. JWT Token Structure

### 1.1 Access Token (Short-lived - 15 minutes)

**Purpose**: Authorize API requests

**Header**:
```json
{
  "alg": "RS256",
  "typ": "JWT",
  "kid": "1234567890abcdef1234567890abcdef12345678"
}
```

**Payload (Claims)**:
```json
{
  "sub": "auth0|507f1f77bcf86cd799439011",
  "iss": "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_XXXXXXXXX",
  "aud": "3qkr0b53jn9m8h7g6f5e4d3c2b1a0",
  "exp": 1700000000,
  "iat": 1699999100,
  "nbf": 1699999100,
  "jti": "unique-token-id-uuid-v4",
  "token_use": "access",
  "scope": "openid profile email",
  "cognito:groups": ["clenergize_users"],
  "cognito:username": "user@example.com",
  "custom:organizationId": "org-uuid",
  "custom:roles": "CARBON_MANAGER,CONTRIBUTOR"
}
```

**Claim Descriptions**:

| Claim | Required | Description | Validation |
|-------|----------|-------------|------------|
| `sub` | ✅ Yes | Subject (User ID) - Unique identifier | Must be valid UUID |
| `iss` | ✅ Yes | Issuer - Cognito User Pool URL | Must match expected issuer |
| `aud` | ✅ Yes | Audience - Client ID | Must match app client ID |
| `exp` | ✅ Yes | Expiration Time (Unix timestamp) | Must be in future |
| `iat` | ✅ Yes | Issued At (Unix timestamp) | Must not be in future |
| `nbf` | ✅ Yes | Not Before (Unix timestamp) | Must be in past |
| `jti` | ✅ Yes | JWT ID - Unique token identifier | Used for token revocation |
| `token_use` | ✅ Yes | Token type: "access" or "id" | Must be "access" |
| `scope` | ❌ No | OAuth scopes granted | Space-separated scopes |
| `cognito:groups` | ❌ No | Cognito user groups | Array of group names |
| `cognito:username` | ✅ Yes | Username (email) | Must be valid email |
| `custom:organizationId` | ✅ Yes | Organization ID | Must be valid UUID |
| `custom:roles` | ✅ Yes | User roles | Comma-separated roles |

**Important**:
- ⚠️ **NEVER store sensitive data** in JWT claims (passwords, secrets, PII)
- ⚠️ **NEVER trust claims without verification** - Always fetch user details from database
- ⚠️ **Minimal payload** - Only include data needed for authorization

### 1.2 Refresh Token (Long-lived - 30 days)

**Purpose**: Obtain new access tokens without re-authentication

**Structure**: Opaque token (random 256-bit string, NOT a JWT)
```
eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ...
```

**Properties**:
- Stored in database (hashed with SHA-256)
- HttpOnly cookie or secure storage only
- Single-use with rotation
- Can be revoked globally (logout all devices)

### 1.3 ID Token (Information only - 15 minutes)

**Purpose**: User profile information (OpenID Connect)

**Payload**:
```json
{
  "sub": "auth0|507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "email_verified": true,
  "name": "John Doe",
  "given_name": "John",
  "family_name": "Doe",
  "picture": "https://...",
  "iss": "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_XXXXXXXXX",
  "aud": "3qkr0b53jn9m8h7g6f5e4d3c2b1a0",
  "token_use": "id",
  "exp": 1700000000,
  "iat": 1699999100
}
```

**Note**: ID tokens are for display purposes only - NOT for authorization

---

## 2. JWKS Integration

### 2.1 What is JWKS?

JWKS (JSON Web Key Set) is a set of public keys used to verify JWT signatures. AWS Cognito publishes its public keys at a well-known endpoint.

**JWKS Endpoint**:
```
https://cognito-idp.us-east-1.amazonaws.com/us-east-1_XXXXXXXXX/.well-known/jwks.json
```

**Example Response**:
```json
{
  "keys": [
    {
      "alg": "RS256",
      "e": "AQAB",
      "kid": "1234567890abcdef1234567890abcdef12345678",
      "kty": "RSA",
      "n": "0vx7agoebGcQSuuPiLJXZptN9nndrQmbXEps2aiAFbWhM78LhWx...",
      "use": "sig"
    },
    {
      "alg": "RS256",
      "e": "AQAB",
      "kid": "abcdef1234567890abcdef1234567890abcdef12",
      "kty": "RSA",
      "n": "xjlCRBqkQxrXIvpFVKfWLnBvXzJz5gKlVVvXJz0RQmbXEps...",
      "use": "sig"
    }
  ]
}
```

### 2.2 JWKS Caching Strategy

**Requirements**:
- Cache public keys to avoid fetching on every request
- Refresh cache when encountering unknown `kid`
- Handle key rotation gracefully
- Rate limit JWKS endpoint calls

**Implementation**:
```typescript
// @shared/auth/jwks-client.ts
import jwksRsa from 'jwks-rsa';
import NodeCache from 'node-cache';

export class JwksClient {
  private client: jwksRsa.JwksClient;
  private cache: NodeCache;

  constructor(jwksUri: string) {
    // In-memory cache (10 hours TTL)
    this.cache = new NodeCache({
      stdTTL: 36000, // 10 hours
      checkperiod: 600, // Check for expired keys every 10 minutes
      useClones: false
    });

    // JWKS client with rate limiting
    this.client = jwksRsa({
      jwksUri,
      cache: true,
      cacheMaxEntries: 5, // Max 5 keys cached
      cacheMaxAge: 36000000, // 10 hours in ms
      rateLimit: true,
      jwksRequestsPerMinute: 10 // Max 10 requests per minute
    });
  }

  async getSigningKey(kid: string): Promise<string> {
    // Check cache first
    const cached = this.cache.get<string>(kid);
    if (cached) {
      return cached;
    }

    // Fetch from JWKS endpoint
    const key = await this.client.getSigningKey(kid);
    const publicKey = key.getPublicKey();

    // Cache public key
    this.cache.set(kid, publicKey);

    return publicKey;
  }

  // Force refresh (called on key rotation)
  async refresh(): Promise<void> {
    this.cache.flushAll();
    this.client = jwksRsa({
      jwksUri: this.client.options.jwksUri,
      cache: false // Bypass cache for refresh
    });
  }
}
```

### 2.3 Handling Key Rotation

**Scenario**: AWS Cognito rotates keys every 90 days

**Strategy**:
1. Cognito publishes both old and new keys during transition (overlap period)
2. New tokens signed with new key (`kid: new-key-id`)
3. Old tokens still valid (signed with old key)
4. After 24 hours, old key removed from JWKS

**Implementation**:
```typescript
async function verifyToken(token: string): Promise<JwtPayload> {
  try {
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || typeof decoded === 'string') {
      throw new UnauthorizedException('Invalid token format');
    }

    const kid = decoded.header.kid;
    if (!kid) {
      throw new UnauthorizedException('Token missing kid header');
    }

    // Try to get signing key
    let publicKey: string;
    try {
      publicKey = await jwksClient.getSigningKey(kid);
    } catch (error) {
      if (error.message.includes('Unable to find a signing key')) {
        // Key not in cache - refresh JWKS and retry
        await jwksClient.refresh();
        publicKey = await jwksClient.getSigningKey(kid);
      } else {
        throw error;
      }
    }

    // Verify signature
    const payload = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
      clockTolerance: 60 // Allow 60 seconds clock skew
    }) as JwtPayload;

    return payload;

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedException('Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new UnauthorizedException('Invalid token signature');
    } else if (error.name === 'NotBeforeError') {
      throw new UnauthorizedException('Token not yet valid');
    } else {
      throw new UnauthorizedException('Token verification failed');
    }
  }
}
```

---

## 3. Token Verification Flow

### 3.1 Request Flow Diagram

```
┌─────────────┐                                    ┌─────────────┐
│   Client    │                                    │ API Gateway │
│ (Frontend)  │                                    │   (NestJS)  │
└──────┬──────┘                                    └──────┬──────┘
       │                                                  │
       │ 1. Request with JWT                             │
       │ GET /api/v1/projects                            │
       │ Authorization: Bearer eyJhbGc...                │
       ├────────────────────────────────────────────────>│
       │                                                  │
       │                                  ┌───────────────▼───────────────┐
       │                                  │  JWT Verification Middleware  │
       │                                  │                               │
       │                                  │  2. Extract token             │
       │                                  │  3. Decode header (get kid)   │
       │                                  │  4. Fetch public key (JWKS)   │
       │                                  │  5. Verify signature          │
       │                                  │  6. Validate claims           │
       │                                  │  7. Check token revocation    │
       │                                  │  8. Validate session          │
       │                                  └───────────────┬───────────────┘
       │                                                  │
       │                                  ┌───────────────▼───────────────┐
       │                                  │  Authorization Guard          │
       │                                  │                               │
       │                                  │  9. Fetch user from DB        │
       │                                  │ 10. Check roles/permissions   │
       │                                  │ 11. Attach to request context │
       │                                  └───────────────┬───────────────┘
       │                                                  │
       │                                  ┌───────────────▼───────────────┐
       │                                  │  Route Handler                │
       │                                  │                               │
       │                                  │ 12. Process request           │
       │                                  │ 13. Return response           │
       │                                  └───────────────┬───────────────┘
       │                                                  │
       │ 14. Response (200 OK)                            │
       │<─────────────────────────────────────────────────┤
       │                                                  │
```

### 3.2 Step-by-Step Verification

**Step 1: Extract Token**
```typescript
@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Extract token from Authorization header
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const payload = await this.verifyToken(token);

    // Attach to request
    request.user = payload;

    return true;
  }
}
```

**Step 2: Decode Header**
```typescript
const decoded = jwt.decode(token, { complete: true });

// decoded.header:
{
  "alg": "RS256",
  "typ": "JWT",
  "kid": "1234567890abcdef1234567890abcdef12345678"
}

// decoded.payload:
{
  "sub": "user-id",
  "iss": "https://cognito...",
  ...
}
```

**Step 3: Fetch Public Key**
```typescript
const kid = decoded.header.kid;
const publicKey = await jwksClient.getSigningKey(kid);
```

**Step 4: Verify Signature**
```typescript
const payload = jwt.verify(token, publicKey, {
  algorithms: ['RS256'], // Only allow RS256
  issuer: process.env.JWT_ISSUER, // Validate issuer
  audience: process.env.JWT_AUDIENCE, // Validate audience
  clockTolerance: 60 // Allow 60 seconds clock skew
});
```

**Step 5: Validate Claims**
```typescript
function validateClaims(payload: JwtPayload): void {
  // Check required claims
  if (!payload.sub) {
    throw new UnauthorizedException('Missing sub claim');
  }

  if (payload.token_use !== 'access') {
    throw new UnauthorizedException('Invalid token type');
  }

  // Validate custom claims
  if (!payload['custom:organizationId']) {
    throw new UnauthorizedException('Missing organizationId');
  }

  // Validate expiration (jwt.verify already checks this, but we can add custom logic)
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    throw new UnauthorizedException('Token expired');
  }

  // Validate not before
  if (payload.nbf && payload.nbf > now + 60) { // +60 for clock skew
    throw new UnauthorizedException('Token not yet valid');
  }
}
```

**Step 6: Check Token Revocation**
```typescript
async function checkRevocation(jti: string, userId: string): Promise<void> {
  // Check if token is in revocation list (Redis)
  const isRevoked = await redis.get(`revoked:${jti}`);
  if (isRevoked) {
    throw new UnauthorizedException('Token has been revoked');
  }

  // Check if user's all tokens were revoked (password change, etc.)
  const globalRevocationTime = await redis.get(`revoke-all:${userId}`);
  if (globalRevocationTime) {
    const revokedAt = parseInt(globalRevocationTime);
    const issuedAt = payload.iat;

    if (issuedAt < revokedAt) {
      throw new UnauthorizedException('Token revoked due to security event');
    }
  }
}
```

**Step 7: Validate Session**
```typescript
async function validateSession(userId: string, jti: string): Promise<void> {
  // Check if session exists in Redis
  const session = await redis.hgetall(`session:${jti}`);

  if (!session) {
    throw new UnauthorizedException('Session not found');
  }

  // Check session expiration
  if (new Date(session.expiresAt) < new Date()) {
    await redis.del(`session:${jti}`);
    throw new UnauthorizedException('Session expired');
  }

  // Update last activity
  await redis.hset(`session:${jti}`, 'lastActivityAt', new Date().toISOString());
}
```

**Step 8: Fetch User from Database**
```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const payload = request.user; // From JWT

    // Fetch FRESH user data from database (don't trust JWT!)
    const user = await this.userService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User account is not active');
    }

    // Fetch permissions
    const permissions = await this.permissionService.getUserPermissions(user.id);

    // Attach to request
    request.user = {
      id: user.id,
      email: user.email,
      organizationId: user.organizationId,
      roles: user.roles,
      permissions
    };

    return true;
  }
}
```

### 3.3 Error Handling Flow

```typescript
try {
  const payload = await verifyToken(token);
} catch (error) {
  if (error.name === 'TokenExpiredError') {
    // Token expired - client should refresh
    throw new UnauthorizedException({
      code: 'TOKEN_EXPIRED',
      message: 'Access token has expired',
      action: 'REFRESH_TOKEN'
    });
  }

  if (error.name === 'JsonWebTokenError') {
    // Invalid signature
    throw new UnauthorizedException({
      code: 'INVALID_SIGNATURE',
      message: 'Token signature verification failed',
      action: 'RE_AUTHENTICATE'
    });
  }

  if (error.name === 'NotBeforeError') {
    // Token not yet valid
    throw new UnauthorizedException({
      code: 'TOKEN_NOT_YET_VALID',
      message: 'Token is not yet valid',
      action: 'RETRY'
    });
  }

  // Generic error
  throw new UnauthorizedException({
    code: 'AUTHENTICATION_FAILED',
    message: 'Authentication failed',
    action: 'RE_AUTHENTICATE'
  });
}
```

---

## 4. Key Rotation Strategy

### 4.1 AWS Cognito Automatic Rotation

**Default Behavior**:
- Cognito rotates keys automatically every **90 days**
- During rotation, both old and new keys are published in JWKS
- Overlap period: **24 hours**
- Old key removed after overlap period

**Timeline**:
```
Day 0:
  JWKS: [key1]
  New tokens: Signed with key1

Day 90 (Rotation):
  JWKS: [key1, key2]
  New tokens: Signed with key2
  Old tokens: Still valid (signed with key1)

Day 91 (After overlap):
  JWKS: [key2]
  New tokens: Signed with key2
  Old tokens from Day 90: Still valid
  Old tokens from Day 89: INVALID (key1 removed)
```

### 4.2 Monitoring Key Rotation

**CloudWatch Alarms**:
```yaml
# cloudwatch-alarms.yml
KeyRotationDetected:
  Type: AWS::CloudWatch::Alarm
  Properties:
    AlarmName: CognitoKeyRotation
    AlarmDescription: Detect JWKS key rotation
    MetricName: JwksKeyCount
    Namespace: Clenergize/Auth
    Statistic: Maximum
    Period: 300
    EvaluationPeriods: 1
    Threshold: 2 # Alert when 2 keys present (rotation happening)
    ComparisonOperator: GreaterThanOrEqualToThreshold
    AlarmActions:
      - !Ref SlackNotificationTopic
```

**Health Check Endpoint**:
```typescript
@Get('auth/health')
async checkAuthHealth(): Promise<AuthHealthStatus> {
  try {
    // Fetch current JWKS
    const response = await fetch(process.env.JWKS_URI);
    const jwks = await response.json();

    const keyCount = jwks.keys.length;

    return {
      status: 'healthy',
      jwksUri: process.env.JWKS_URI,
      keyCount,
      rotation: keyCount > 1 ? 'IN_PROGRESS' : 'STABLE',
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      lastChecked: new Date().toISOString()
    };
  }
}
```

### 4.3 Manual Key Rotation (Emergency)

**Scenario**: Suspected key compromise

**Steps**:
1. Create new Cognito User Pool (new keys)
2. Update JWKS_URI environment variable
3. Deploy updated configuration
4. Force all users to re-authenticate
5. Revoke all existing tokens

**Implementation**:
```typescript
// Emergency key rotation script
async function emergencyKeyRotation(): Promise<void> {
  console.log('Starting emergency key rotation...');

  // 1. Update JWKS URI
  const newJwksUri = process.env.NEW_JWKS_URI;
  await updateConfig('JWKS_URI', newJwksUri);

  // 2. Clear JWKS cache
  await jwksClient.refresh();

  // 3. Revoke all existing tokens
  const users = await db.users.find({ status: 'ACTIVE' });

  for (const user of users) {
    const revokeTime = Math.floor(Date.now() / 1000);
    await redis.set(`revoke-all:${user.id}`, revokeTime, 'EX', 86400); // 24 hours
  }

  // 4. Clear all sessions
  const sessionKeys = await redis.keys('session:*');
  if (sessionKeys.length > 0) {
    await redis.del(...sessionKeys);
  }

  console.log(`Revoked tokens for ${users.length} users`);
  console.log('Emergency key rotation complete');
}
```

---

## 5. Implementation Details

### 5.1 NestJS JWT Strategy

**File Structure**:
```
src/
├── auth/
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   ├── roles.guard.ts
│   │   └── permissions.guard.ts
│   ├── strategies/
│   │   ├── jwt.strategy.ts
│   │   └── jwt-refresh.strategy.ts
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   ├── roles.decorator.ts
│   │   └── public.decorator.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── token.service.ts
│   │   └── session.service.ts
│   ├── dto/
│   │   ├── login.dto.ts
│   │   ├── refresh-token.dto.ts
│   │   └── register.dto.ts
│   └── auth.module.ts
```

**JWT Strategy Implementation**:
```typescript
// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwksClient } from '../jwks-client';
import { UserService } from '../../users/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly jwksClient: JwksClient,
    private readonly userService: UserService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      algorithms: ['RS256'],
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
      secretOrKeyProvider: async (request, rawJwtToken, done) => {
        try {
          const decodedToken = jwt.decode(rawJwtToken, { complete: true });
          if (!decodedToken || typeof decodedToken === 'string') {
            return done(new UnauthorizedException('Invalid token'), null);
          }

          const kid = decodedToken.header.kid;
          if (!kid) {
            return done(new UnauthorizedException('Missing kid'), null);
          }

          const publicKey = await this.jwksClient.getSigningKey(kid);
          done(null, publicKey);

        } catch (error) {
          done(error, null);
        }
      }
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    // Validate claims
    if (payload.token_use !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Check token revocation
    await this.checkRevocation(payload.jti, payload.sub);

    // Fetch fresh user data from database
    const user = await this.userService.findById(payload.sub);
    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Fetch permissions
    const permissions = await this.userService.getUserPermissions(user.id);

    return {
      ...user,
      permissions
    };
  }

  private async checkRevocation(jti: string, userId: string): Promise<void> {
    // Check if specific token is revoked
    const isRevoked = await this.redis.get(`revoked:${jti}`);
    if (isRevoked) {
      throw new UnauthorizedException('Token has been revoked');
    }

    // Check if all user tokens were revoked
    const globalRevocation = await this.redis.get(`revoke-all:${userId}`);
    if (globalRevocation) {
      const revokedAt = parseInt(globalRevocation);
      const issuedAt = payload.iat;

      if (issuedAt < revokedAt) {
        throw new UnauthorizedException('Token revoked');
      }
    }
  }
}
```

**JWT Auth Guard**:
```typescript
// src/auth/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
```

**Public Decorator** (for routes that don't require authentication):
```typescript
// src/auth/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

**Usage in Controllers**:
```typescript
@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  // Protected endpoint (requires JWT)
  @Get()
  @Roles('VIEWER', 'CONTRIBUTOR', 'MANAGER', 'ADMIN')
  async listProjects(@CurrentUser() user: User): Promise<Project[]> {
    return this.projectService.findByOrganization(user.organizationId);
  }

  // Public endpoint (no JWT required)
  @Get('public')
  @Public()
  async getPublicProjects(): Promise<Project[]> {
    return this.projectService.findPublic();
  }
}
```

### 5.2 Environment Configuration

```env
# .env.production

# AWS Cognito Configuration
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_CLIENT_ID=3qkr0b53jn9m8h7g6f5e4d3c2b1a0
COGNITO_CLIENT_SECRET=<secret-from-aws-secrets-manager>

# JWT Configuration
JWT_ISSUER=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_XXXXXXXXX
JWT_AUDIENCE=3qkr0b53jn9m8h7g6f5e4d3c2b1a0
JWKS_URI=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_XXXXXXXXX/.well-known/jwks.json

# Token Expiration
ACCESS_TOKEN_EXPIRY=900 # 15 minutes
REFRESH_TOKEN_EXPIRY=2592000 # 30 days
ID_TOKEN_EXPIRY=900 # 15 minutes

# Session Configuration
SESSION_REDIS_URL=redis://localhost:6379/1
SESSION_EXPIRY=3600 # 1 hour
```

---

## 6. Refresh Token Mechanism

### 6.1 Refresh Token Flow

```
┌─────────────┐                                    ┌─────────────┐
│   Client    │                                    │ API Gateway │
└──────┬──────┘                                    └──────┬──────┘
       │                                                  │
       │ 1. Access token expired (401)                   │
       │<─────────────────────────────────────────────────┤
       │                                                  │
       │ 2. Request new access token                     │
       │ POST /auth/refresh                              │
       │ { refreshToken: "..." }                         │
       ├────────────────────────────────────────────────>│
       │                                  ┌───────────────▼───────────────┐
       │                                  │  Refresh Token Verification   │
       │                                  │                               │
       │                                  │  3. Verify refresh token      │
       │                                  │  4. Check if revoked          │
       │                                  │  5. Validate user             │
       │                                  │  6. Generate new access token │
       │                                  │  7. Rotate refresh token      │
       │                                  └───────────────┬───────────────┘
       │                                                  │
       │ 8. Return new tokens                             │
       │ { accessToken: "...", refreshToken: "..." }     │
       │<─────────────────────────────────────────────────┤
       │                                                  │
```

### 6.2 Implementation

**Refresh Endpoint**:
```typescript
@Post('auth/refresh')
@Public()
async refreshToken(
  @Body() dto: RefreshTokenDto
): Promise<TokenResponse> {
  // 1. Hash the refresh token
  const tokenHash = crypto
    .createHash('sha256')
    .update(dto.refreshToken)
    .digest('hex');

  // 2. Find token in database
  const storedToken = await db.refresh_tokens.findOne({
    tokenHash,
    isRevoked: false,
    expiresAt: { $gt: new Date() }
  });

  if (!storedToken) {
    throw new UnauthorizedException('Invalid or expired refresh token');
  }

  // 3. Validate user
  const user = await db.users.findOne({ _id: storedToken.userId });
  if (!user || user.status !== UserStatus.ACTIVE) {
    throw new UnauthorizedException('User not found or inactive');
  }

  // 4. Revoke old refresh token (single-use)
  await db.refresh_tokens.updateOne(
    { _id: storedToken._id },
    {
      $set: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: 'ROTATED'
      }
    }
  );

  // 5. Generate new tokens
  const newAccessToken = await this.generateAccessToken(user);
  const newRefreshToken = await this.generateRefreshToken(user);

  // 6. Store new refresh token
  const newTokenHash = crypto
    .createHash('sha256')
    .update(newRefreshToken)
    .digest('hex');

  await db.refresh_tokens.create({
    userId: user._id,
    tokenHash: newTokenHash,
    previousTokenHash: tokenHash, // Link to previous token
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    ipAddress: request.ip,
    userAgent: request.headers['user-agent']
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    expiresIn: 900 // 15 minutes
  };
}
```

### 6.3 Refresh Token Rotation

**Why Rotate?**
- Prevents replay attacks
- Limits damage if refresh token is stolen
- Enables detection of token theft

**Rotation Strategy**:
1. Client uses refresh token to get new access token
2. Server generates NEW refresh token
3. Old refresh token is revoked (single-use)
4. New refresh token stored with link to old token

**Detecting Token Theft**:
```typescript
// If old refresh token is used again, it indicates theft
async function detectTokenTheft(tokenHash: string): Promise<void> {
  const token = await db.refresh_tokens.findOne({ tokenHash });

  if (token && token.isRevoked && token.revokedReason === 'ROTATED') {
    // Token was already used and rotated - this is suspicious!

    // Find all tokens in the rotation chain
    const chainTokens = await db.refresh_tokens.find({
      $or: [
        { previousTokenHash: tokenHash },
        { tokenHash: token.previousTokenHash }
      ]
    });

    // Revoke all tokens in chain
    for (const chainToken of chainTokens) {
      await db.refresh_tokens.updateOne(
        { _id: chainToken._id },
        {
          $set: {
            isRevoked: true,
            revokedAt: new Date(),
            revokedReason: 'SECURITY_BREACH'
          }
        }
      );
    }

    // Revoke all tokens for user
    const userId = token.userId;
    const revokeTime = Math.floor(Date.now() / 1000);
    await redis.set(`revoke-all:${userId}`, revokeTime, 'EX', 86400);

    // Alert security team
    await eventBus.publish({
      type: 'audit.security.event-detected.v1',
      data: {
        eventType: 'REFRESH_TOKEN_REUSE',
        severity: 'HIGH',
        userId: userId.toString(),
        description: 'Revoked refresh token was reused - possible token theft',
        ipAddress: request.ip,
        responseActions: ['REVOKE_ALL_TOKENS', 'NOTIFY_USER', 'REQUIRE_PASSWORD_CHANGE']
      }
    });

    throw new UnauthorizedException('Refresh token reuse detected. All tokens revoked.');
  }
}
```

---

## 7. Session Management

### 7.1 Session Storage (Redis)

**Schema**:
```typescript
interface Session {
  sessionId: string; // JWT jti
  userId: string;
  ipAddress: string;
  userAgent: string;
  deviceInfo: {
    browser: string;
    os: string;
    device: string;
  };
  fingerprint: string; // Browser fingerprint hash
  createdAt: Date;
  lastActivityAt: Date;
  expiresAt: Date;
  isRevoked: boolean;
}
```

**Redis Storage**:
```typescript
// Store as hash
await redis.hmset(`session:${jti}`, {
  userId: user.id,
  ipAddress: request.ip,
  userAgent: request.headers['user-agent'],
  fingerprint: await generateFingerprint(request),
  createdAt: new Date().toISOString(),
  lastActivityAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
  isRevoked: 'false'
});

// Set TTL (auto-delete after expiration)
await redis.expire(`session:${jti}`, 3600); // 1 hour
```

### 7.2 Session Fingerprinting

**Purpose**: Detect session hijacking

**Implementation**:
```typescript
async function generateFingerprint(request: Request): Promise<string> {
  const components = [
    request.headers['user-agent'],
    request.headers['accept-language'],
    request.headers['accept-encoding'],
    request.ip,
    // Add more browser characteristics
  ];

  const fingerprint = components.join('|');
  return crypto.createHash('sha256').update(fingerprint).digest('hex');
}

async function validateSessionFingerprint(
  sessionId: string,
  request: Request
): Promise<void> {
  const session = await redis.hgetall(`session:${sessionId}`);
  const currentFingerprint = await generateFingerprint(request);

  if (session.fingerprint !== currentFingerprint) {
    // Fingerprint mismatch - possible session hijacking
    await revokeSession(sessionId);

    await eventBus.publish({
      type: 'audit.security.event-detected.v1',
      data: {
        eventType: 'SESSION_HIJACKING_ATTEMPT',
        severity: 'HIGH',
        sessionId,
        userId: session.userId,
        description: 'Session fingerprint mismatch detected'
      }
    });

    throw new UnauthorizedException('Session fingerprint mismatch');
  }
}
```

### 7.3 Session Revocation

**Revoke Single Session**:
```typescript
async function revokeSession(sessionId: string): Promise<void> {
  // Mark session as revoked
  await redis.hset(`session:${sessionId}`, 'isRevoked', 'true');
  await redis.hset(`session:${sessionId}`, 'revokedAt', new Date().toISOString());

  // Add token to revocation list
  await redis.set(`revoked:${sessionId}`, '1', 'EX', 86400); // 24 hours
}
```

**Revoke All User Sessions** (logout from all devices):
```typescript
async function revokeAllUserSessions(userId: string): Promise<void> {
  // Set global revocation timestamp
  const revokeTime = Math.floor(Date.now() / 1000);
  await redis.set(`revoke-all:${userId}`, revokeTime, 'EX', 86400); // 24 hours

  // Find all active sessions for user
  const sessionKeys = await redis.keys('session:*');

  for (const key of sessionKeys) {
    const session = await redis.hgetall(key);
    if (session.userId === userId) {
      await redis.hset(key, 'isRevoked', 'true');
      await redis.hset(key, 'revokedAt', new Date().toISOString());
    }
  }

  // Revoke all refresh tokens
  await db.refresh_tokens.updateMany(
    { userId, isRevoked: false },
    {
      $set: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: 'USER_LOGOUT_ALL'
      }
    }
  );
}
```

---

## 8. MFA Integration

### 8.1 TOTP-Based MFA

**Setup Flow**:
```typescript
@Post('mfa/enable')
@UseGuards(JwtAuthGuard)
async enableMFA(@CurrentUser() user: User): Promise<MFASetupResponse> {
  // Generate TOTP secret
  const secret = speakeasy.generateSecret({
    name: `Clenergize (${user.email})`,
    issuer: 'Clenergize'
  });

  // Generate QR code
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

  // Encrypt secret with KMS
  const kms = new KMSClient({ region: 'us-east-1' });
  const encrypted = await kms.send(new EncryptCommand({
    KeyId: process.env.KMS_KEY_ID,
    Plaintext: Buffer.from(secret.base32)
  }));

  // Store encrypted secret
  await db.mfa_secrets.create({
    userId: user.id,
    secretEncrypted: encrypted.CiphertextBlob.toString('base64'),
    qrCodeUrl,
    isVerified: false
  });

  return {
    secret: secret.base32,
    qrCodeUrl,
    backupCodes: await this.generateBackupCodes(user.id)
  };
}

@Post('mfa/verify')
@UseGuards(JwtAuthGuard)
async verifyMFA(
  @CurrentUser() user: User,
  @Body() dto: VerifyMFADto
): Promise<void> {
  const mfaSecret = await db.mfa_secrets.findOne({ userId: user.id });

  // Decrypt secret
  const kms = new KMSClient({ region: 'us-east-1' });
  const decrypted = await kms.send(new DecryptCommand({
    CiphertextBlob: Buffer.from(mfaSecret.secretEncrypted, 'base64')
  }));

  const secret = decrypted.Plaintext.toString();

  // Verify TOTP code
  const verified = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token: dto.code,
    window: 2 // Allow 2 time steps (60 seconds)
  });

  if (!verified) {
    throw new BadRequestException('Invalid MFA code');
  }

  // Mark as verified
  await db.mfa_secrets.updateOne(
    { userId: user.id },
    { $set: { isVerified: true, verifiedAt: new Date() } }
  );

  await db.users.updateOne(
    { _id: user.id },
    { $set: { mfaEnabled: true } }
  );

  // Publish event
  await eventBus.publish({
    type: 'identity.2fa.enabled.v1',
    data: { userId: user.id }
  });
}
```

### 8.2 MFA Login Flow

**Two-Step Login**:
```typescript
@Post('auth/login')
@Public()
async login(@Body() dto: LoginDto): Promise<LoginResponse> {
  // Step 1: Verify email/password
  const user = await this.verifyCredentials(dto.email, dto.password);

  // Check if MFA is enabled
  if (user.mfaEnabled) {
    // Generate temporary MFA session token (5 minutes)
    const mfaToken = await this.generateMFAToken(user.id);

    return {
      requireMfa: true,
      mfaToken,
      message: 'MFA code required'
    };
  }

  // No MFA - return access tokens
  return this.generateTokens(user);
}

@Post('auth/login/mfa')
@Public()
async loginWithMFA(@Body() dto: LoginMFADto): Promise<TokenResponse> {
  // Verify MFA session token
  const mfaSession = await this.verifyMFAToken(dto.mfaToken);

  // Verify TOTP code
  const user = await db.users.findOne({ _id: mfaSession.userId });
  const isValid = await this.verifyTOTP(user.id, dto.code);

  if (!isValid) {
    // Increment failed attempts
    await this.incrementMFAFailures(user.id);
    throw new UnauthorizedException('Invalid MFA code');
  }

  // Reset failed attempts
  await this.resetMFAFailures(user.id);

  // Generate access tokens
  return this.generateTokens(user);
}
```

---

## 9. Error Handling

### 9.1 Standard Error Responses

```typescript
// 401 Unauthorized - Token expired
{
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "Access token has expired",
  "code": "TOKEN_EXPIRED",
  "action": "REFRESH_TOKEN",
  "timestamp": "2025-11-18T10:30:00Z",
  "path": "/api/v1/projects"
}

// 401 Unauthorized - Invalid signature
{
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "Token signature verification failed",
  "code": "INVALID_SIGNATURE",
  "action": "RE_AUTHENTICATE",
  "timestamp": "2025-11-18T10:30:00Z",
  "path": "/api/v1/projects"
}

// 403 Forbidden - Insufficient permissions
{
  "statusCode": 403,
  "error": "Forbidden",
  "message": "Insufficient permissions to access this resource",
  "code": "INSUFFICIENT_PERMISSIONS",
  "required": ["projects:write"],
  "actual": ["projects:read"],
  "timestamp": "2025-11-18T10:30:00Z",
  "path": "/api/v1/projects/123"
}
```

### 9.2 Exception Filter

```typescript
@Catch(UnauthorizedException)
export class JwtExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Determine error code and action
    let code = 'AUTHENTICATION_FAILED';
    let action = 'RE_AUTHENTICATE';

    if (exception.message.includes('expired')) {
      code = 'TOKEN_EXPIRED';
      action = 'REFRESH_TOKEN';
    } else if (exception.message.includes('signature')) {
      code = 'INVALID_SIGNATURE';
    } else if (exception.message.includes('revoked')) {
      code = 'TOKEN_REVOKED';
    }

    response.status(status).json({
      statusCode: status,
      error: 'Unauthorized',
      message: exception.message,
      code,
      action,
      timestamp: new Date().toISOString(),
      path: request.url
    });
  }
}
```

---

## 10. Security Best Practices

### 10.1 Token Storage

**✅ DO**:
- Store access tokens in memory (JavaScript variable)
- Store refresh tokens in HttpOnly cookies
- Use secure flag (HTTPS only)
- Use SameSite=Strict for CSRF protection

**❌ DON'T**:
- Store tokens in localStorage (XSS vulnerable)
- Store tokens in sessionStorage (XSS vulnerable)
- Store tokens in cookies without HttpOnly flag
- Include sensitive data in JWT claims

### 10.2 Token Expiration

**Recommended Values**:
- Access Token: 15 minutes (short-lived)
- Refresh Token: 30 days (long-lived, rotated)
- ID Token: 15 minutes (same as access token)
- MFA Session: 5 minutes (temporary)

### 10.3 CORS Configuration

```typescript
// main.ts
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS.split(','), // Whitelist only
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 3600 // Cache preflight requests for 1 hour
});
```

### 10.4 Rate Limiting

```typescript
// Prevent brute force attacks on authentication endpoints
@Post('auth/login')
@Public()
@Throttle(5, 900) // 5 attempts per 15 minutes
async login(@Body() dto: LoginDto): Promise<LoginResponse> {
  // ...
}

@Post('auth/refresh')
@Public()
@Throttle(10, 60) // 10 refreshes per minute
async refreshToken(@Body() dto: RefreshTokenDto): Promise<TokenResponse> {
  // ...
}
```

---

## 11. Testing Strategy

### 11.1 Unit Tests

```typescript
describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let jwksClient: JwksClient;

  beforeEach(() => {
    jwksClient = new JwksClient(process.env.JWKS_URI);
    strategy = new JwtStrategy(jwksClient, userService);
  });

  it('should verify valid JWT token', async () => {
    const token = await generateTestToken({
      sub: 'test-user-id',
      exp: Math.floor(Date.now() / 1000) + 900
    });

    const payload = await strategy.validate(token);

    expect(payload.sub).toBe('test-user-id');
  });

  it('should reject expired token', async () => {
    const token = await generateTestToken({
      sub: 'test-user-id',
      exp: Math.floor(Date.now() / 1000) - 100 // Expired
    });

    await expect(strategy.validate(token)).rejects.toThrow('Token expired');
  });

  it('should reject token with invalid signature', async () => {
    const token = 'invalid.token.signature';

    await expect(strategy.validate(token)).rejects.toThrow('Invalid signature');
  });
});
```

### 11.2 Integration Tests

```typescript
describe('Authentication E2E', () => {
  it('should login with valid credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Test123!@#'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
  });

  it('should reject invalid credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'WrongPassword'
      });

    expect(response.status).toBe(401);
  });

  it('should refresh access token', async () => {
    // Login first
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Test123!@#'
      });

    const refreshToken = loginRes.body.refreshToken;

    // Refresh
    const refreshRes = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken });

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.accessToken).not.toBe(loginRes.body.accessToken);
  });
});
```

---

## 12. Migration from OLD System

### 12.1 Migration Checklist

- [ ] **Week 1: Setup AWS Cognito User Pool**
  - [ ] Create User Pool with custom attributes
  - [ ] Configure password policies
  - [ ] Setup app client (with client secret)
  - [ ] Note JWKS URI and Issuer

- [ ] **Week 2: Implement JWT Verification**
  - [ ] Install dependencies: `jwks-rsa`, `jsonwebtoken`, `passport-jwt`
  - [ ] Create JwksClient service
  - [ ] Implement JwtStrategy
  - [ ] Add JWT Auth Guard
  - [ ] Test with sample tokens

- [ ] **Week 3: Migrate Users**
  - [ ] Export users from OLD database
  - [ ] Import to Cognito (via AWS SDK)
  - [ ] Force password reset for all users
  - [ ] Send migration notification emails

- [ ] **Week 4: Update Frontend**
  - [ ] Replace localStorage with secure token storage
  - [ ] Implement token refresh logic
  - [ ] Add MFA enrollment flow
  - [ ] Test login/logout flows

- [ ] **Week 5: Gradual Rollout**
  - [ ] Deploy to staging environment
  - [ ] Beta test with internal users
  - [ ] Fix any issues
  - [ ] Production deployment (feature flag)

### 12.2 Rollback Plan

If issues arise:
1. Feature flag to revert to OLD authentication
2. Keep OLD tokens valid for 24 hours
3. Notify users of issue
4. Fix and redeploy
5. Re-enable NEW authentication

---

## Summary

This JWT/JWKS architecture provides a **secure, scalable authentication system** that fixes all critical vulnerabilities from the OLD system:

**Key Improvements**:
1. ✅ **Proper signature verification** with JWKS (fixes CVSS 9.8 vulnerability)
2. ✅ **Key rotation** handled automatically by AWS Cognito
3. ✅ **Secure token storage** with HttpOnly cookies
4. ✅ **Refresh token rotation** to prevent replay attacks
5. ✅ **Session management** with fingerprinting
6. ✅ **MFA support** with TOTP
7. ✅ **Token revocation** for logout and security events

**Next Steps**:
1. Setup AWS Cognito User Pool
2. Implement JWT verification middleware
3. Update all services to use JWT Auth Guard
4. Migrate users from OLD system
5. Security testing and penetration testing

---

**Last Updated**: November 18, 2025
**Next Review**: End of Sprint 0.2
**Maintained By**: Security Agent
