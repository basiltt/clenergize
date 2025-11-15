# JWT Verification Fix Skill

## Purpose
Fix the critical security vulnerability where JWT tokens are decoded without signature verification (Issue C1).

## Problem in OLD Code

```typescript
// OLD: VULNERABLE CODE - Never do this!
const decoded = jwt.decode(token); // NO SIGNATURE VERIFICATION!
if (decoded) {
  req.user = decoded;
  next();
}

// Also problematic:
const secret = process.env.JWT_SECRET || 'default-secret'; // Hardcoded fallback!
const token = jwt.sign(payload, secret); // Using symmetric key
```

## Correct Implementation

### 1. JWKS-Based Verification (RS256)
```typescript
// NEW: Proper JWT verification using JWKS
import * as jwt from 'jsonwebtoken';
import * as jwksRsa from 'jwks-rsa';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtVerificationService {
  private jwksClient: jwksRsa.JwksClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly auditService: AuditService
  ) {
    // Initialize JWKS client
    this.jwksClient = jwksRsa({
      jwksUri: this.configService.get<string>('JWKS_URI'),
      cache: true, // Cache keys for performance
      rateLimit: true, // Rate limit to prevent abuse
      cacheMaxAge: 600000, // 10 minutes
      jwksRequestsPerMinute: 10
    });
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      // Step 1: Decode to get the key ID (kid)
      const decoded = jwt.decode(token, { complete: true }) as any;

      if (!decoded) {
        throw new UnauthorizedException('Invalid token format');
      }

      if (!decoded.header || !decoded.header.kid) {
        throw new UnauthorizedException('Token missing key ID');
      }

      // Step 2: Get the signing key from JWKS endpoint
      const key = await this.jwksClient.getSigningKey(decoded.header.kid);
      const signingKey = key.getPublicKey();

      // Step 3: Verify the token signature
      const verified = jwt.verify(token, signingKey, {
        algorithms: ['RS256'], // Only allow RS256
        issuer: this.configService.get<string>('JWT_ISSUER'),
        audience: this.configService.get<string>('JWT_AUDIENCE'),
        clockTolerance: 30, // 30 seconds clock skew tolerance
      }) as JwtPayload;

      // Step 4: Additional validations
      this.validateTokenClaims(verified);

      // Step 5: Audit successful verification
      await this.auditService.logTokenVerified(verified.sub, verified.jti);

      return verified;
    } catch (error) {
      // Audit failed verification
      await this.auditService.logTokenVerificationFailed(token, error);

      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }

      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      }

      throw new UnauthorizedException('Token verification failed');
    }
  }

  private validateTokenClaims(payload: JwtPayload): void {
    // Check required claims
    if (!payload.sub) {
      throw new UnauthorizedException('Token missing subject claim');
    }

    if (!payload.iat || !payload.exp) {
      throw new UnauthorizedException('Token missing time claims');
    }

    // Check token age (max 24 hours old)
    const now = Math.floor(Date.now() / 1000);
    const maxAge = 24 * 60 * 60; // 24 hours in seconds

    if (now - payload.iat > maxAge) {
      throw new UnauthorizedException('Token is too old');
    }

    // Check custom claims
    if (payload.type === 'refresh') {
      throw new UnauthorizedException('Cannot use refresh token for API access');
    }
  }
}

interface JwtPayload {
  sub: string; // Subject (user ID)
  iat: number; // Issued at
  exp: number; // Expiration
  jti?: string; // JWT ID
  type?: string; // Token type
  roles?: string[]; // User roles
  permissions?: string[]; // User permissions
}
```

### 2. NestJS Guard Implementation
```typescript
// NEW: Secure JWT Guard
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtVerificationService,
    private readonly reflector: Reflector,
    private readonly cacheService: CacheService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    // Check token blacklist (for logout)
    const isBlacklisted = await this.cacheService.get(`blacklist:${token}`);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token has been revoked');
    }

    // Check token cache (for performance)
    const cachedUser = await this.cacheService.get(`token:${token}`);
    if (cachedUser) {
      request.user = JSON.parse(cachedUser);
      return true;
    }

    try {
      // Verify token
      const payload = await this.jwtService.verifyToken(token);

      // Get user details
      const user = await this.getUserFromPayload(payload);

      // Check permissions
      const requiredPermissions = this.reflector.get<string[]>(
        'permissions',
        context.getHandler()
      );

      if (requiredPermissions && !this.hasPermissions(user, requiredPermissions)) {
        throw new UnauthorizedException('Insufficient permissions');
      }

      // Cache for performance (5 minutes)
      await this.cacheService.set(
        `token:${token}`,
        JSON.stringify(user),
        300
      );

      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  private extractToken(request: any): string | null {
    // Check Authorization header
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Check cookies (for web apps)
    if (request.cookies && request.cookies.access_token) {
      return request.cookies.access_token;
    }

    return null;
  }

  private async getUserFromPayload(payload: JwtPayload): Promise<User> {
    // Fetch user from database or cache
    const user = await this.userService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is disabled');
    }

    return {
      id: user.id,
      email: user.email,
      roles: payload.roles || [],
      permissions: payload.permissions || [],
      organizationId: user.organizationId
    };
  }

  private hasPermissions(user: User, required: string[]): boolean {
    return required.every(permission =>
      user.permissions.includes(permission) ||
      user.roles.includes('admin')
    );
  }
}
```

### 3. Token Generation Service
```typescript
// NEW: Secure token generation
import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TokenGenerationService {
  constructor(
    private readonly secretsManager: SecretsManagerService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService
  ) {}

  async generateTokenPair(user: User): Promise<TokenPair> {
    const jwtId = uuidv4();
    const now = Math.floor(Date.now() / 1000);

    // Access token payload
    const accessPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      permissions: user.permissions,
      type: 'access',
      iat: now,
      exp: now + 3600, // 1 hour
      jti: jwtId,
    };

    // Refresh token payload
    const refreshPayload = {
      sub: user.id,
      type: 'refresh',
      iat: now,
      exp: now + 604800, // 7 days
      jti: `${jwtId}-refresh`,
    };

    // Get private key from secrets manager (never hardcode!)
    const privateKey = await this.secretsManager.getSecret('jwt-private-key');

    // Sign tokens with RS256
    const accessToken = jwt.sign(accessPayload, privateKey, {
      algorithm: 'RS256',
      issuer: this.configService.get<string>('JWT_ISSUER'),
      audience: this.configService.get<string>('JWT_AUDIENCE'),
      header: {
        kid: this.configService.get<string>('JWT_KEY_ID')
      }
    });

    const refreshToken = jwt.sign(refreshPayload, privateKey, {
      algorithm: 'RS256',
      issuer: this.configService.get<string>('JWT_ISSUER'),
      audience: this.configService.get<string>('JWT_AUDIENCE'),
      header: {
        kid: this.configService.get<string>('JWT_KEY_ID')
      }
    });

    // Store refresh token in database
    await this.storeRefreshToken(user.id, refreshToken, refreshPayload.exp);

    // Audit token generation
    await this.auditService.logTokenGenerated(user.id, jwtId);

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600,
      tokenType: 'Bearer'
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    // Verify refresh token
    const payload = await this.jwtService.verifyToken(refreshToken);

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if refresh token is still valid in database
    const isValid = await this.validateRefreshToken(payload.sub, refreshToken);
    if (!isValid) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    // Get user
    const user = await this.userService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate new access token only
    const { accessToken } = await this.generateTokenPair(user);
    return accessToken;
  }

  async revokeTokens(userId: string): Promise<void> {
    // Revoke all refresh tokens for user
    await this.refreshTokenRepository.deleteMany({ userId });

    // Add to blacklist cache (for immediate effect)
    const tokens = await this.getActiveTokensForUser(userId);
    for (const token of tokens) {
      await this.cacheService.set(
        `blacklist:${token}`,
        '1',
        3600 // Keep for 1 hour (token lifetime)
      );
    }

    // Audit token revocation
    await this.auditService.logTokensRevoked(userId);
  }
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}
```

### 4. Secrets Management
```typescript
// NEW: Never hardcode secrets!
import { Injectable } from '@nestjs/common';
import {
  SecretsManagerClient,
  GetSecretValueCommand
} from '@aws-sdk/client-secrets-manager';

@Injectable()
export class SecretsManagerService {
  private client: SecretsManagerClient;
  private cache = new Map<string, { value: string; expires: number }>();

  constructor(private configService: ConfigService) {
    this.client = new SecretsManagerClient({
      region: this.configService.get<string>('AWS_REGION'),
      endpoint: this.configService.get<string>('AWS_ENDPOINT'), // LocalStack for dev
    });
  }

  async getSecret(secretName: string): Promise<string> {
    // Check cache first
    const cached = this.cache.get(secretName);
    if (cached && cached.expires > Date.now()) {
      return cached.value;
    }

    try {
      // Fetch from AWS Secrets Manager
      const command = new GetSecretValueCommand({
        SecretId: secretName,
      });

      const response = await this.client.send(command);

      if (!response.SecretString) {
        throw new Error(`Secret ${secretName} not found`);
      }

      // Cache for 5 minutes
      this.cache.set(secretName, {
        value: response.SecretString,
        expires: Date.now() + 300000
      });

      return response.SecretString;
    } catch (error) {
      // NEVER fall back to default values
      throw new Error(`Failed to retrieve secret ${secretName}: ${error.message}`);
    }
  }
}
```

### 5. Migration Script to Fix OLD Code
```typescript
// migration-scripts/fix-jwt-verification.ts
export class JwtVerificationMigration {
  async migrate() {
    console.log('Fixing JWT verification in all services...');

    const services = [
      'identity-service',
      'organization-service',
      'activity-service',
      'calculation-service',
      'reporting-service'
    ];

    for (const service of services) {
      await this.fixService(service);
    }
  }

  async fixService(service: string) {
    const files = await this.findFilesWithJwtDecode(service);

    for (const file of files) {
      console.log(`Fixing ${file}...`);

      // Replace jwt.decode with proper verification
      let content = await fs.readFile(file, 'utf8');

      // Pattern 1: Simple decode
      content = content.replace(
        /jwt\.decode\((.*?)\)/g,
        'await this.jwtService.verifyToken($1)'
      );

      // Pattern 2: Decode with options
      content = content.replace(
        /jwt\.decode\((.*?),\s*{.*?}\)/g,
        'await this.jwtService.verifyToken($1)'
      );

      // Pattern 3: Hardcoded secrets
      content = content.replace(
        /process\.env\.(.*?)_SECRET\s*\|\|\s*['"].*?['"]/g,
        'await this.secretsManager.getSecret("$1_SECRET")'
      );

      await fs.writeFile(file, content);
    }

    // Add JWT verification service to module
    await this.addJwtServiceToModule(service);
  }
}
```

## Testing JWT Verification

```typescript
describe('JWT Verification', () => {
  it('should reject tokens without signature verification', async () => {
    const token = jwt.sign({ sub: '123' }, 'wrong-secret');

    await expect(jwtService.verifyToken(token))
      .rejects.toThrow('Invalid token');
  });

  it('should reject expired tokens', async () => {
    const token = jwt.sign(
      { sub: '123', exp: Math.floor(Date.now() / 1000) - 3600 },
      privateKey,
      { algorithm: 'RS256' }
    );

    await expect(jwtService.verifyToken(token))
      .rejects.toThrow('Token has expired');
  });

  it('should reject tokens with invalid issuer', async () => {
    const token = jwt.sign(
      { sub: '123' },
      privateKey,
      { algorithm: 'RS256', issuer: 'wrong-issuer' }
    );

    await expect(jwtService.verifyToken(token))
      .rejects.toThrow('Invalid token');
  });

  it('should verify valid tokens', async () => {
    const token = jwt.sign(
      { sub: '123', roles: ['user'] },
      privateKey,
      {
        algorithm: 'RS256',
        issuer: 'clenergize-identity',
        audience: 'clenergize-api'
      }
    );

    const payload = await jwtService.verifyToken(token);
    expect(payload.sub).toBe('123');
    expect(payload.roles).toContain('user');
  });
});
```

## Key Points

1. **ALWAYS verify JWT signatures** - Never just decode
2. **Use asymmetric keys (RS256)** - More secure than HS256
3. **JWKS for key distribution** - Enables key rotation
4. **Never hardcode secrets** - Use secrets manager
5. **Cache verified tokens** - For performance
6. **Blacklist revoked tokens** - For logout
7. **Audit all token operations** - For security
8. **Set reasonable expiration** - 1 hour for access, 7 days for refresh
9. **Validate all claims** - Not just signature
10. **Handle errors properly** - Don't leak information

Remember: JWT security is critical. A single jwt.decode() without verification can compromise the entire system.