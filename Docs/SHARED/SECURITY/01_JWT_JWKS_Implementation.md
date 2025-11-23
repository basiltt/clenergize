# JWT/JWKS Security Implementation Guide

## Critical Security Fix for Sprint 0.1

### ⚠️ CURRENT BUG TO FIX IMMEDIATELY

The current implementation has a critical security vulnerability where JWT tokens are decoded without verification:

```typescript
// ❌ VULNERABLE CODE - NEVER DO THIS
const decoded = jwt.decode(token); // No signature verification!
if (decoded) {
  // Trusting unverified token data - SECURITY BREACH!
  req.user = decoded;
  next();
}
```

This allows attackers to forge tokens and bypass authentication completely.

## Correct JWT/JWKS Implementation

### 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   JWT/JWKS ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Token Flow:                                                │
│  1. User authenticates → Identity Service                   │
│  2. Identity Service generates JWT signed with private key  │
│  3. Public key published at JWKS endpoint                   │
│  4. Services verify tokens using JWKS public key            │
│                                                             │
│  JWKS Endpoint:                                              │
│  • Identity Service: /v1/.well-known/jwks.json             │
│  • Cached by consuming services                            │
│  • Automatic key rotation support                          │
│                                                             │
│  Token Structure:                                           │
│  • Header: { alg: "RS256", kid: "key-id", typ: "JWT" }     │
│  • Payload: { sub, iss, aud, exp, iat, roles, org }       │
│  • Signature: RSA SHA-256                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2. Identity Service - Token Generation

```typescript
// identity-service/src/infrastructure/auth/jwt.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { readFileSync } from 'fs';
import { Algorithm } from 'jsonwebtoken';
import * as jwksRsa from 'jwks-rsa';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class JwtService {
  private readonly privateKey: string;
  private readonly publicKey: string;
  private readonly keyId: string;

  constructor(private jwtService: NestJwtService) {
    // Load RSA keys from secure location (use AWS Secrets Manager in production)
    this.privateKey = process.env.JWT_PRIVATE_KEY ||
      readFileSync('./keys/private.pem', 'utf8');
    this.publicKey = process.env.JWT_PUBLIC_KEY ||
      readFileSync('./keys/public.pem', 'utf8');
    this.keyId = process.env.JWT_KEY_ID || 'clenergize-key-001';
  }

  /**
   * Generate a signed JWT token
   */
  async generateToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      organizationId: user.organizationId,
      iss: process.env.JWT_ISSUER || 'https://api.clenergize.com',
      aud: process.env.JWT_AUDIENCE || 'clenergize-v3',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
      jti: uuidv4(), // Unique token ID for revocation
    };

    return this.jwtService.sign(payload, {
      algorithm: 'RS256' as Algorithm,
      privateKey: this.privateKey,
      keyid: this.keyId,
    });
  }

  /**
   * Generate refresh token with longer expiry
   */
  async generateRefreshToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      type: 'refresh',
      iss: process.env.JWT_ISSUER,
      aud: process.env.JWT_AUDIENCE,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30), // 30 days
      jti: uuidv4(),
    };

    return this.jwtService.sign(payload, {
      algorithm: 'RS256' as Algorithm,
      privateKey: this.privateKey,
      keyid: this.keyId,
    });
  }

  /**
   * Get JWKS for public key distribution
   */
  getJwks() {
    return {
      keys: [
        {
          kty: 'RSA',
          kid: this.keyId,
          use: 'sig',
          alg: 'RS256',
          n: this.extractModulus(this.publicKey),
          e: 'AQAB', // Standard RSA exponent
        },
      ],
    };
  }

  private extractModulus(publicKey: string): string {
    // Extract modulus from PEM format
    const keyData = publicKey
      .replace(/-----BEGIN PUBLIC KEY-----/, '')
      .replace(/-----END PUBLIC KEY-----/, '')
      .replace(/\s/g, '');

    // Convert to base64url format required by JWKS
    return Buffer.from(keyData, 'base64')
      .toString('base64url');
  }
}
```

### 3. JWKS Endpoint Controller

```typescript
// identity-service/src/infrastructure/http/controllers/jwks.controller.ts
import { Controller, Get } from '@nestjs/common';
import { JwtService } from '../auth/jwt.service';

@Controller('v1/.well-known')
export class JwksController {
  constructor(private jwtService: JwtService) {}

  @Get('jwks.json')
  getJwks() {
    return this.jwtService.getJwks();
  }

  @Get('openid-configuration')
  getOpenIdConfiguration() {
    return {
      issuer: process.env.JWT_ISSUER,
      jwks_uri: `${process.env.JWT_ISSUER}/.well-known/jwks.json`,
      authorization_endpoint: `${process.env.JWT_ISSUER}/v1/auth/authorize`,
      token_endpoint: `${process.env.JWT_ISSUER}/v1/auth/token`,
      userinfo_endpoint: `${process.env.JWT_ISSUER}/v1/auth/userinfo`,
      subject_types_supported: ['public'],
      id_token_signing_alg_values_supported: ['RS256'],
      response_types_supported: ['code', 'token', 'id_token'],
      token_endpoint_auth_methods_supported: ['client_secret_basic'],
    };
  }
}
```

### 4. Token Verification (All Services)

```typescript
// shared/src/auth/jwt-auth.guard.ts
import { Injectable, UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as jwt from 'jsonwebtoken';
import * as jwksRsa from 'jwks-rsa';
import { promisify } from 'util';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private jwksClient: jwksRsa.JwksClient;
  private getSigningKey: (kid: string) => Promise<string>;

  constructor() {
    super();

    // Initialize JWKS client with caching
    this.jwksClient = jwksRsa({
      cache: true,
      cacheMaxEntries: 5,
      cacheMaxAge: 600000, // 10 minutes
      rateLimit: true,
      jwksRequestsPerMinute: 10,
      jwksUri: process.env.JWKS_URI ||
        'http://identity-service:3001/v1/.well-known/jwks.json',
    });

    this.getSigningKey = promisify(this.jwksClient.getSigningKey);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const decoded = await this.verifyToken(token);
      request.user = decoded;
      request.token = token;
      return true;
    } catch (error) {
      throw new UnauthorizedException(`Invalid token: ${error.message}`);
    }
  }

  /**
   * ✅ SECURE TOKEN VERIFICATION WITH JWKS
   */
  private async verifyToken(token: string): Promise<any> {
    // Step 1: Decode token header to get key ID
    const decoded = jwt.decode(token, { complete: true });

    if (!decoded || typeof decoded === 'string') {
      throw new Error('Invalid token format');
    }

    const { header, payload } = decoded;

    // Step 2: Get signing key from JWKS endpoint
    const key = await this.getSigningKey(header.kid);

    // Step 3: Verify token with public key
    const verified = jwt.verify(token, key, {
      algorithms: ['RS256'],
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
      clockTolerance: 5, // 5 seconds clock skew tolerance
    });

    // Step 4: Additional validation
    this.validateClaims(verified);

    return verified;
  }

  /**
   * Validate JWT claims
   */
  private validateClaims(payload: any): void {
    // Check token expiry
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new Error('Token expired');
    }

    // Check token not used before issued
    if (payload.iat && payload.iat > now + 5) {
      throw new Error('Token issued in the future');
    }

    // Check required claims
    if (!payload.sub) {
      throw new Error('Missing subject claim');
    }

    if (!payload.roles || !Array.isArray(payload.roles)) {
      throw new Error('Missing or invalid roles claim');
    }

    // Check token type (access vs refresh)
    if (payload.type === 'refresh') {
      throw new Error('Cannot use refresh token for API access');
    }
  }

  /**
   * Extract token from request
   */
  private extractToken(request: any): string | null {
    // Check Authorization header
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Check cookies (optional)
    if (request.cookies && request.cookies.access_token) {
      return request.cookies.access_token;
    }

    return null;
  }
}
```

### 5. Key Generation Script

```bash
#!/bin/bash
# scripts/generate-jwt-keys.sh

# Generate RSA private key
openssl genrsa -out keys/private.pem 4096

# Extract public key
openssl rsa -in keys/private.pem -pubout -out keys/public.pem

# Generate key ID
KEY_ID=$(uuidv4 || echo "clenergize-key-$(date +%s)")

echo "Keys generated successfully"
echo "Key ID: $KEY_ID"
echo ""
echo "Add to .env:"
echo "JWT_KEY_ID=$KEY_ID"
echo "JWT_PRIVATE_KEY=$(cat keys/private.pem | base64 -w 0)"
echo "JWT_PUBLIC_KEY=$(cat keys/public.pem | base64 -w 0)"
```

### 6. Token Refresh Implementation

```typescript
// identity-service/src/application/auth/refresh-token.handler.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '../../infrastructure/auth/jwt.service';
import { RedisService } from '../../infrastructure/cache/redis.service';

@Injectable()
export class RefreshTokenHandler {
  constructor(
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}

  async refreshAccessToken(refreshToken: string): Promise<TokenPair> {
    try {
      // Verify refresh token
      const decoded = await this.jwtService.verifyRefreshToken(refreshToken);

      // Check if refresh token is blacklisted
      const isBlacklisted = await this.redisService.exists(
        `blacklist:refresh:${decoded.jti}`
      );

      if (isBlacklisted) {
        throw new UnauthorizedException('Token has been revoked');
      }

      // Check if user still exists and is active
      const user = await this.userRepository.findById(decoded.sub);
      if (!user || user.status !== 'ACTIVE') {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Generate new token pair
      const newAccessToken = await this.jwtService.generateToken(user);
      const newRefreshToken = await this.jwtService.generateRefreshToken(user);

      // Revoke old refresh token
      await this.redisService.set(
        `blacklist:refresh:${decoded.jti}`,
        'revoked',
        decoded.exp - Math.floor(Date.now() / 1000),
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: 3600, // 1 hour
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
```

### 7. Token Revocation

```typescript
// identity-service/src/application/auth/token-revocation.handler.ts
import { Injectable } from '@nestjs/common';
import { RedisService } from '../../infrastructure/cache/redis.service';

@Injectable()
export class TokenRevocationHandler {
  constructor(private redisService: RedisService) {}

  /**
   * Revoke a specific token
   */
  async revokeToken(jti: string, exp: number): Promise<void> {
    const ttl = exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) {
      await this.redisService.set(`blacklist:token:${jti}`, 'revoked', ttl);
    }
  }

  /**
   * Revoke all tokens for a user
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    // Set a flag that all tokens issued before this timestamp are invalid
    const revocationTime = Math.floor(Date.now() / 1000);
    await this.redisService.set(
      `revocation:user:${userId}`,
      revocationTime,
      60 * 60 * 24 * 30, // Keep for 30 days
    );
  }

  /**
   * Check if token is revoked
   */
  async isTokenRevoked(jti: string, userId: string, iat: number): Promise<boolean> {
    // Check specific token revocation
    const tokenRevoked = await this.redisService.exists(`blacklist:token:${jti}`);
    if (tokenRevoked) {
      return true;
    }

    // Check user-wide revocation
    const userRevocationTime = await this.redisService.get(
      `revocation:user:${userId}`
    );

    if (userRevocationTime && iat < parseInt(userRevocationTime)) {
      return true;
    }

    return false;
  }
}
```

### 8. Rate Limiting with JWT

```typescript
// shared/src/auth/rate-limit.guard.ts
import { Injectable, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RedisService } from '../cache/redis.service';

@Injectable()
export class JwtRateLimitGuard extends ThrottlerGuard {
  constructor(private redisService: RedisService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return super.canActivate(context);
    }

    // User-specific rate limiting
    const key = `rate_limit:${user.sub}`;
    const limit = this.getRateLimitForRole(user.roles);
    const window = 60; // 1 minute window

    const current = await this.redisService.incr(key);

    if (current === 1) {
      await this.redisService.expire(key, window);
    }

    if (current > limit) {
      throw new HttpException(
        `Rate limit exceeded. Max ${limit} requests per minute.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private getRateLimitForRole(roles: string[]): number {
    if (roles.includes('ADMIN')) return 1000;
    if (roles.includes('PREMIUM')) return 500;
    return 100; // Default rate limit
  }
}
```

### 9. Testing JWT Implementation

```typescript
// test/auth/jwt.service.spec.ts
import { Test } from '@nestjs/testing';
import { JwtService } from '../../src/infrastructure/auth/jwt.service';
import * as jwt from 'jsonwebtoken';

describe('JwtService', () => {
  let service: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [JwtService],
    }).compile();

    service = module.get<JwtService>(JwtService);
  });

  describe('Token Generation', () => {
    it('should generate valid RS256 token', async () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        roles: ['USER'],
        organizationId: 'org-123',
      };

      const token = await service.generateToken(user);
      const decoded = jwt.decode(token, { complete: true });

      expect(decoded.header.alg).toBe('RS256');
      expect(decoded.header.kid).toBeDefined();
      expect(decoded.payload.sub).toBe(user.id);
      expect(decoded.payload.email).toBe(user.email);
    });

    it('should set correct expiry time', async () => {
      const token = await service.generateToken(mockUser);
      const decoded = jwt.decode(token);

      const now = Math.floor(Date.now() / 1000);
      expect(decoded.exp).toBeGreaterThan(now);
      expect(decoded.exp).toBeLessThanOrEqual(now + 3600);
    });
  });

  describe('Token Verification', () => {
    it('should reject token with invalid signature', async () => {
      const fakeToken = jwt.sign(
        { sub: 'fake-user' },
        'wrong-secret',
        { algorithm: 'HS256' }
      );

      await expect(service.verifyToken(fakeToken))
        .rejects.toThrow('Invalid signature');
    });

    it('should reject expired token', async () => {
      const expiredToken = jwt.sign(
        {
          sub: 'user-123',
          exp: Math.floor(Date.now() / 1000) - 3600,
        },
        privateKey,
        { algorithm: 'RS256' }
      );

      await expect(service.verifyToken(expiredToken))
        .rejects.toThrow('Token expired');
    });

    it('should verify valid token from JWKS', async () => {
      const token = await service.generateToken(mockUser);
      const verified = await service.verifyTokenWithJwks(token);

      expect(verified.sub).toBe(mockUser.id);
      expect(verified.email).toBe(mockUser.email);
    });
  });

  describe('JWKS Endpoint', () => {
    it('should return valid JWKS', () => {
      const jwks = service.getJwks();

      expect(jwks.keys).toHaveLength(1);
      expect(jwks.keys[0].kty).toBe('RSA');
      expect(jwks.keys[0].use).toBe('sig');
      expect(jwks.keys[0].alg).toBe('RS256');
      expect(jwks.keys[0].n).toBeDefined();
      expect(jwks.keys[0].e).toBe('AQAB');
    });
  });
});
```

### 10. Environment Configuration

```bash
# .env
# JWT Configuration
JWT_ISSUER=http://localhost:3001
JWT_AUDIENCE=clenergize-v3
JWT_KEY_ID=clenergize-key-001
JWKS_URI=http://localhost:3001/v1/.well-known/jwks.json

# Use base64 encoded keys in production
JWT_PRIVATE_KEY=LS0tLS1CRUdJTi...
JWT_PUBLIC_KEY=LS0tLS1CRUdJTi...

# Token Expiry
JWT_ACCESS_TOKEN_EXPIRY=1h
JWT_REFRESH_TOKEN_EXPIRY=30d

# Rate Limiting
RATE_LIMIT_DEFAULT=100
RATE_LIMIT_PREMIUM=500
RATE_LIMIT_ADMIN=1000
```

## Security Checklist

### Implementation Requirements
- [ ] **NEVER decode JWT without verification**
- [ ] Use RS256 algorithm (asymmetric) for production
- [ ] Implement JWKS endpoint for public key distribution
- [ ] Cache JWKS responses to reduce latency
- [ ] Implement token refresh mechanism
- [ ] Add token revocation support
- [ ] Set appropriate token expiry (1 hour for access, 30 days for refresh)
- [ ] Implement rate limiting per user
- [ ] Add JTI (JWT ID) for token tracking
- [ ] Validate all required claims (sub, iss, aud, exp)
- [ ] Handle clock skew (5 seconds tolerance)
- [ ] Log all authentication failures
- [ ] Monitor for suspicious patterns
- [ ] Rotate keys periodically (90 days)
- [ ] Use secure key storage (AWS Secrets Manager)

### Common Vulnerabilities to Avoid

1. **Algorithm Confusion Attack**
   ```typescript
   // ❌ VULNERABLE
   jwt.verify(token, key); // Accepts any algorithm

   // ✅ SECURE
   jwt.verify(token, key, { algorithms: ['RS256'] }); // Only RS256
   ```

2. **Key Exposure**
   ```typescript
   // ❌ VULNERABLE
   const privateKey = 'hardcoded-secret-key';

   // ✅ SECURE
   const privateKey = await secretsManager.getSecret('jwt-private-key');
   ```

3. **Missing Expiry Validation**
   ```typescript
   // ❌ VULNERABLE
   const decoded = jwt.verify(token, key, { ignoreExpiration: true });

   // ✅ SECURE
   const decoded = jwt.verify(token, key); // Validates expiry by default
   ```

4. **Weak Key Generation**
   ```bash
   # ❌ VULNERABLE - 1024 bit key
   openssl genrsa -out private.pem 1024

   # ✅ SECURE - 4096 bit key
   openssl genrsa -out private.pem 4096
   ```

## Migration Plan

### Phase 1: Fix Critical Bug (Sprint 0.1 - Week 1)
1. Replace all `jwt.decode()` with proper verification
2. Implement JWKS endpoint in Identity Service
3. Update all services to use JwtAuthGuard
4. Add comprehensive tests

### Phase 2: Enhanced Security (Sprint 0.2)
1. Implement token refresh mechanism
2. Add token revocation support
3. Implement rate limiting
4. Add audit logging

### Phase 3: Production Hardening (Sprint 0.3)
1. Integrate AWS Secrets Manager
2. Implement key rotation
3. Add monitoring and alerting
4. Security audit and penetration testing

## Monitoring and Alerts

### Key Metrics to Track
- Authentication success/failure rate
- Token verification latency
- JWKS endpoint response time
- Rate limit violations
- Token revocation events
- Suspicious authentication patterns

### Alert Thresholds
- Authentication failure rate > 10% (5 min window)
- JWKS endpoint latency > 500ms
- Rate limit violations > 100/min
- Token verification errors > 5/min
- Key rotation failures

## References

- [JWT Best Practices (RFC 8725)](https://datatracker.ietf.org/doc/html/rfc8725)
- [JSON Web Key (JWK) Specification](https://datatracker.ietf.org/doc/html/rfc7517)
- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
- [OWASP JWT Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)