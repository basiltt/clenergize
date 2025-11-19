# @clenergize/auth-lib

> Secure authentication and authorization library for Clenergize microservices

## Installation

```bash
npm install @clenergize/auth-lib @clenergize/common
npm install @nestjs/passport passport passport-jwt jwks-rsa bcrypt
```

## Features

- ✅ **JWT Verification with JWKS** - Fixes CRITICAL vulnerability from OLD codebase
- ✅ **Password Hashing** - Secure bcrypt hashing (OWASP recommended)
- ✅ **NestJS Guards** - JwtAuthGuard, RolesGuard
- ✅ **Decorators** - @CurrentUser(), @Public(), @Roles()
- ✅ **Type-Safe** - Full TypeScript support
- ✅ **Production-Ready** - Rate limiting, caching, error handling

## Quick Start

### 1. Configure JWT Service

```typescript
import { JwtService, createJwtService } from '@clenergize/auth-lib';

const jwtService = createJwtService({
  jwksUri: 'https://cognito-idp.us-east-1.amazonaws.com/your-pool/.well-known/jwks.json',
  issuer: 'https://cognito-idp.us-east-1.amazonaws.com/your-pool',
  audience: 'your-app-client-id',
  algorithms: ['RS256'],
  cacheEnabled: true,
  rateLimit: true
});

// Verify token (SECURE - uses JWKS)
const payload = await jwtService.verifyToken(token);
console.log(payload); // { sub: 'user-id', email: '...', role: 'ADMIN', ... }
```

### 2. Setup Authentication Module (NestJS)

```typescript
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '@clenergize/auth-lib';

@Module({
  imports: [PassportModule],
  providers: [
    {
      provide: JwtStrategy,
      useFactory: () => new JwtStrategy({
        jwksUri: process.env.JWKS_URI!,
        issuer: process.env.JWT_ISSUER!,
        audience: process.env.JWT_AUDIENCE!
      })
    }
  ],
  exports: [JwtStrategy]
})
export class AuthModule {}
```

### 3. Protect Routes

```typescript
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import {
  JwtAuthGuard,
  RolesGuard,
  CurrentUser,
  Public,
  Roles,
  JwtPayload
} from '@clenergize/auth-lib';

@Controller('users')
@UseGuards(JwtAuthGuard) // Protect all routes
export class UsersController {
  // Public route (no authentication)
  @Post('login')
  @Public()
  async login(@Body() credentials: LoginDto) {
    return this.authService.login(credentials);
  }

  // Protected route (authentication required)
  @Get('profile')
  getProfile(@CurrentUser() user: JwtPayload) {
    return {
      id: user.sub,
      email: user.email,
      role: user.role
    };
  }

  // Admin-only route (authentication + authorization)
  @Get('admin-dashboard')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  getAdminDashboard(@CurrentUser() user: JwtPayload) {
    return { message: 'Admin dashboard data' };
  }

  // Multiple roles (user needs ANY of these roles)
  @Post('create-project')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'PROJECT_MANAGER')
  createProject(@CurrentUser('sub') userId: string) {
    return this.projectService.create(userId);
  }
}
```

## Password Hashing

```typescript
import { PasswordService, createPasswordService } from '@clenergize/auth-lib';

const passwordService = createPasswordService({
  saltRounds: 12 // OWASP recommended
});

// Hash password
const hashedPassword = await passwordService.hashPassword('MySecurePass123!');

// Verify password
const isValid = await passwordService.verifyPassword('MySecurePass123!', hashedPassword);
console.log(isValid); // true

// Validate complexity
const validation = passwordService.validatePasswordComplexity('weak');
console.log(validation);
// {
//   isValid: false,
//   errors: [
//     'Password must contain at least one uppercase letter',
//     'Password must contain at least one number',
//     ...
//   ]
// }

// Generate random password
const randomPassword = passwordService.generateRandomPassword(16);
console.log(randomPassword); // 'Kx#9mL!pQ2vR@nY8'
```

## Security Features

### ❌ OLD (VULNERABLE) vs ✅ NEW (SECURE)

```typescript
// ❌ OLD CODEBASE (jwt.decode - NO VERIFICATION!)
const decoded = jwt.decode(token);
// ^ Anyone can create a fake token!

// ✅ NEW (JWKS VERIFICATION)
const verified = await jwtService.verifyToken(token);
// ^ Token signature verified with AWS Cognito public key
```

### What Gets Verified

1. **Signature** - Token signed by trusted issuer (AWS Cognito)
2. **Expiration** - Token not expired
3. **Issuer** - Token from correct issuer
4. **Audience** - Token intended for this application
5. **Algorithm** - Token uses RS256 (not HS256 or none)
6. **Claims** - Required claims (sub, iat, exp) present

## API

### JWT Service

**Methods**:
- `verifyToken(token: string)` - Verify JWT with JWKS (SECURE)
- `decodeTokenUnsafe(token: string)` - Decode without verification (debugging only)
- `isTokenExpired(token: string)` - Check if token is expired
- `getTimeUntilExpiry(token: string)` - Get seconds until expiration
- `extractTokenFromHeader(authHeader: string)` - Extract Bearer token

### Password Service

**Methods**:
- `hashPassword(password: string)` - Hash password with bcrypt
- `verifyPassword(password: string, hash: string)` - Verify password
- `validatePasswordComplexity(password: string)` - Check password strength
- `generateRandomPassword(length: number)` - Generate secure password

### Guards

- `JwtAuthGuard` - Require valid JWT token
- `RolesGuard` - Require specific role(s)

### Decorators

- `@CurrentUser()` - Get authenticated user
- `@CurrentUser('sub')` - Get specific property
- `@Public()` - Mark route as public
- `@Roles('ADMIN', 'USER')` - Require role(s)

## Configuration

### Environment Variables

```env
# JWT Configuration
JWKS_URI=https://cognito-idp.us-east-1.amazonaws.com/your-pool/.well-known/jwks.json
JWT_ISSUER=https://cognito-idp.us-east-1.amazonaws.com/your-pool
JWT_AUDIENCE=your-app-client-id

# Password Hashing
BCRYPT_SALT_ROUNDS=12
```

### TypeScript Types

```typescript
import { JwtPayload } from '@clenergize/auth-lib';

interface User extends JwtPayload {
  sub: string;           // User ID
  email?: string;        // Email
  role?: string;         // Role (ADMIN, USER, etc.)
  permissions?: string[]; // Permissions array
  iat: number;          // Issued at (Unix timestamp)
  exp: number;          // Expires at (Unix timestamp)
  iss: string;          // Issuer
  aud: string;          // Audience
}
```

## Testing

```typescript
import { JwtService } from '@clenergize/auth-lib';
import { AuthenticationError } from '@clenergize/common';

describe('JwtService', () => {
  it('should verify valid token', async () => {
    const jwtService = createJwtService(config);
    const payload = await jwtService.verifyToken(validToken);
    expect(payload.sub).toBe('user-123');
  });

  it('should throw on invalid token', async () => {
    const jwtService = createJwtService(config);
    await expect(jwtService.verifyToken(invalidToken))
      .rejects
      .toThrow(AuthenticationError);
  });
});
```

## Migration from OLD Codebase

### Before (VULNERABLE)

```typescript
// OLD codebase - jwt.service.ts (CRITICAL VULNERABILITY!)
verifyAuthToken(token: string) {
  const decoded = jwt.decode(token) as JwtUserPayload; // ❌ NO VERIFICATION
  return decoded;
}
```

### After (SECURE)

```typescript
// NEW codebase - Using @clenergize/auth-lib
import { JwtService } from '@clenergize/auth-lib';

const jwtService = new JwtService({
  jwksUri: 'https://.../.well-known/jwks.json',
  issuer: 'https://...',
  audience: 'app-id'
});

const payload = await jwtService.verifyToken(token); // ✅ JWKS VERIFICATION
```

## Security Best Practices

1. **Always use verifyToken()** - Never use jwt.decode() for authentication
2. **Use HTTPS only** - Never send tokens over HTTP
3. **Short token expiry** - Maximum 1 hour for access tokens
4. **Rotate refresh tokens** - Implement refresh token rotation
5. **Rate limit auth endpoints** - Prevent brute force attacks
6. **Log auth failures** - Monitor for suspicious activity
7. **Use strong passwords** - Enforce password complexity
8. **Hash passwords with bcrypt** - Never store plaintext passwords

## License

PROPRIETARY - Clenergize Team

## Links

- [Clenergize V3 Documentation](../../Docs/)
- [Security Audit](../../Docs/MCP_SECURITY_AUDIT.md)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
