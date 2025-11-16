# Identity Agent

## Role
Manages the Identity Service (formerly user-management-ms), handling authentication, authorization, user management, and JWT token generation with proper security.

## Service Configuration
- **Port**: 3001
- **Database**: MongoDB - `clenergize_identity`
- **OLD Reference**: `OLD/clenergizeV3-user-management-ms-dev/`
- **NEW Implementation**: `NEW/identity-service/`
- **Model**: Claude Sonnet (Standard)

## Critical Issues to Fix from OLD

### From DESIGN-REVIEW.md
1. **C1**: JWT tokens decoded without verification
2. **C7**: Hardcoded JWT secrets with fallbacks
3. **No transaction boundaries** for user operations
4. **No proper password policies**
5. **Missing audit trails** for authentication events

### OLD Code Problems
```typescript
// OLD: Vulnerable authentication
const token = jwt.sign(payload, 'secret123'); // Hardcoded secret!
const decoded = jwt.decode(token); // No verification!

// OLD: No password validation
async createUser(dto: CreateUserDto) {
  const user = new User();
  user.password = dto.password; // Plain text storage!
  return this.userRepo.save(user);
}
```

## NEW Service Architecture

### Domain Structure
```
NEW/identity-service/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── user.entity.ts
│   │   │   ├── role.entity.ts
│   │   │   └── permission.entity.ts
│   │   ├── value-objects/
│   │   │   ├── email.vo.ts
│   │   │   ├── password.vo.ts
│   │   │   └── user-id.vo.ts
│   │   ├── events/
│   │   │   ├── user-created.event.ts
│   │   │   ├── user-authenticated.event.ts
│   │   │   └── password-reset.event.ts
│   │   └── services/
│   │       ├── password.service.ts
│   │       └── token.service.ts
│   ├── application/
│   │   ├── commands/
│   │   │   ├── create-user.command.ts
│   │   │   ├── authenticate-user.command.ts
│   │   │   └── reset-password.command.ts
│   │   └── queries/
│   │       ├── get-user.query.ts
│   │       └── verify-token.query.ts
│   └── infrastructure/
│       ├── guards/
│       │   └── jwt-auth.guard.ts
│       └── repositories/
│           └── user.repository.ts
```

## Core Features to Implement

### 1. Secure User Entity
```typescript
export class User {
  private readonly id: UserId;
  private email: Email;
  private passwordHash: string; // Never store plain text
  private roles: Role[];
  private mfaEnabled: boolean;
  private mfaSecret?: string;
  private loginAttempts: number;
  private lockedUntil?: Date;
  private lastLoginAt?: Date;
  private refreshTokens: RefreshToken[];
  private createdAt: Date;
  private updatedAt: Date;

  constructor(props: UserProps) {
    this.validateInvariants(props);
    Object.assign(this, props);
  }

  async authenticate(password: string): Promise<AuthResult> {
    if (this.isLocked()) {
      throw new AccountLockedException();
    }

    const isValid = await bcrypt.compare(password, this.passwordHash);

    if (!isValid) {
      this.recordFailedAttempt();
      throw new InvalidCredentialsException();
    }

    this.resetLoginAttempts();
    return AuthResult.success(this);
  }

  private isLocked(): boolean {
    return this.lockedUntil && this.lockedUntil > new Date();
  }

  private recordFailedAttempt(): void {
    this.loginAttempts++;
    if (this.loginAttempts >= 5) {
      this.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    }
  }
}
```

### 2. JWT Service with Proper Verification
```typescript
@Injectable()
export class TokenService {
  private jwksClient: JwksClient;

  constructor(
    @Inject('SECRETS_MANAGER') private secrets: ISecretsManager,
    private auditService: AuditService
  ) {
    this.jwksClient = jwksRsa({
      jwksUri: process.env.JWKS_URI,
      cache: true,
      rateLimit: true
    });
  }

  async generateTokens(user: User): Promise<TokenPair> {
    const payload: JwtPayload = {
      sub: user.id.toString(),
      email: user.email.value,
      roles: user.roles.map(r => r.name),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
    };

    const privateKey = await this.secrets.getSecret('jwt-private-key');

    const accessToken = jwt.sign(payload, privateKey, {
      algorithm: 'RS256',
      issuer: 'clenergize-identity',
      audience: 'clenergize-api'
    });

    const refreshToken = this.generateRefreshToken();

    await this.auditService.logTokenGeneration(user.id, {
      tokenId: payload.jti,
      expiresAt: new Date(payload.exp * 1000)
    });

    return { accessToken, refreshToken };
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    const decoded = jwt.decode(token, { complete: true });

    if (!decoded || !decoded.header.kid) {
      throw new InvalidTokenException('Invalid token format');
    }

    const key = await this.jwksClient.getSigningKey(decoded.header.kid);
    const signingKey = key.getPublicKey();

    try {
      const verified = jwt.verify(token, signingKey, {
        algorithms: ['RS256'],
        issuer: 'clenergize-identity',
        audience: 'clenergize-api'
      });

      await this.auditService.logTokenVerification(verified.sub, true);
      return verified as JwtPayload;
    } catch (error) {
      await this.auditService.logTokenVerification(null, false, error);
      throw new InvalidTokenException('Token verification failed');
    }
  }
}
```

### 3. Authentication Command Handler
```typescript
@CommandHandler(AuthenticateUserCommand)
export class AuthenticateUserHandler {
  constructor(
    private userRepository: UserRepository,
    private tokenService: TokenService,
    private eventBus: EventBus,
    @Inject('DB_CONNECTION') private db: Connection
  ) {}

  async execute(command: AuthenticateUserCommand): Promise<AuthResult> {
    const session = await this.db.startSession();

    try {
      await session.withTransaction(async () => {
        const user = await this.userRepository.findByEmail(
          command.email,
          { session }
        );

        if (!user) {
          throw new InvalidCredentialsException();
        }

        const authResult = await user.authenticate(command.password);

        if (command.mfaCode && user.mfaEnabled) {
          const isValidMfa = await this.verifyMfaCode(
            user,
            command.mfaCode
          );
          if (!isValidMfa) {
            throw new InvalidMfaCodeException();
          }
        }

        const tokens = await this.tokenService.generateTokens(user);

        user.recordSuccessfulLogin();
        await this.userRepository.save(user, { session });

        await this.eventBus.publish(new UserAuthenticatedEvent({
          userId: user.id,
          email: user.email,
          timestamp: new Date(),
          ipAddress: command.ipAddress,
          userAgent: command.userAgent
        }));

        return {
          user: user.toDTO(),
          tokens
        };
      });
    } finally {
      await session.endSession();
    }
  }
}
```

### 4. Role-Based Access Control (RBAC)
```typescript
export enum Permission {
  // User permissions
  USER_READ = 'user:read',
  USER_CREATE = 'user:create',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',

  // Project permissions
  PROJECT_READ = 'project:read',
  PROJECT_CREATE = 'project:create',
  PROJECT_UPDATE = 'project:update',
  PROJECT_DELETE = 'project:delete',

  // Emission permissions
  EMISSION_READ = 'emission:read',
  EMISSION_CREATE = 'emission:create',
  EMISSION_CALCULATE = 'emission:calculate',
  EMISSION_APPROVE = 'emission:approve',

  // Admin permissions
  ADMIN_FULL = 'admin:full'
}

export class Role {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly permissions: Permission[],
    public readonly description: string
  ) {}

  hasPermission(permission: Permission): boolean {
    return this.permissions.includes(permission) ||
           this.permissions.includes(Permission.ADMIN_FULL);
  }
}

// Predefined roles
export const ROLES = {
  SUPER_ADMIN: new Role('super-admin', 'Super Admin', [Permission.ADMIN_FULL], 'Full system access'),
  ORG_ADMIN: new Role('org-admin', 'Organization Admin', [
    Permission.USER_READ, Permission.USER_CREATE, Permission.USER_UPDATE,
    Permission.PROJECT_READ, Permission.PROJECT_CREATE, Permission.PROJECT_UPDATE,
    Permission.EMISSION_READ, Permission.EMISSION_CREATE, Permission.EMISSION_CALCULATE
  ], 'Organization administrator'),
  PROJECT_MANAGER: new Role('project-manager', 'Project Manager', [
    Permission.PROJECT_READ, Permission.PROJECT_UPDATE,
    Permission.EMISSION_READ, Permission.EMISSION_CREATE
  ], 'Project management access'),
  DATA_ENTRY: new Role('data-entry', 'Data Entry', [
    Permission.PROJECT_READ,
    Permission.EMISSION_READ, Permission.EMISSION_CREATE
  ], 'Data entry access'),
  VIEWER: new Role('viewer', 'Viewer', [
    Permission.PROJECT_READ,
    Permission.EMISSION_READ
  ], 'Read-only access')
};
```

## API Endpoints

### Authentication
```typescript
POST   /auth/register       - Register new user
POST   /auth/login         - Authenticate user
POST   /auth/refresh       - Refresh access token
POST   /auth/logout        - Invalidate refresh token
POST   /auth/forgot-password - Request password reset
POST   /auth/reset-password  - Reset password with token
GET    /auth/verify-email/:token - Verify email address
```

### User Management
```typescript
GET    /users              - List users (paginated)
GET    /users/:id          - Get user details
PUT    /users/:id          - Update user
DELETE /users/:id          - Delete user (soft delete)
PUT    /users/:id/roles    - Update user roles
PUT    /users/:id/mfa      - Enable/disable MFA
GET    /users/:id/sessions - Get active sessions
DELETE /users/:id/sessions - Revoke all sessions
```

## Events Published

```typescript
// Identity.User.Created
{
  userId: string;
  email: string;
  roles: string[];
  organizationId?: string;
  createdBy: string;
  timestamp: Date;
}

// Identity.User.Authenticated
{
  userId: string;
  email: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  mfaUsed: boolean;
}

// Identity.User.PasswordReset
{
  userId: string;
  requestedBy: string;
  ipAddress: string;
  timestamp: Date;
}

// Identity.User.RoleChanged
{
  userId: string;
  oldRoles: string[];
  newRoles: string[];
  changedBy: string;
  timestamp: Date;
}

// Identity.User.Locked
{
  userId: string;
  reason: string;
  lockedUntil: Date;
  failedAttempts: number;
  timestamp: Date;
}
```

## Integration Points

### Consumes Events
- `Organization.User.Invited` - Create user account
- `Organization.User.Removed` - Deactivate user

### Provides to Other Services
- JWT verification endpoint for service-to-service auth
- User profile data for authorization decisions
- Role/permission checking utilities

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: string,
  emailVerified: boolean,
  passwordHash: string,
  roles: string[],
  organizationId: ObjectId,
  profile: {
    firstName: string,
    lastName: string,
    phone?: string,
    timezone?: string
  },
  mfa: {
    enabled: boolean,
    secret?: string,
    backupCodes?: string[]
  },
  security: {
    loginAttempts: number,
    lockedUntil?: Date,
    lastLoginAt?: Date,
    lastLoginIp?: string,
    passwordChangedAt: Date
  },
  status: 'active' | 'inactive' | 'locked' | 'deleted',
  createdAt: Date,
  updatedAt: Date,
  deletedAt?: Date
}
```

### Sessions Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  refreshToken: string,
  ipAddress: string,
  userAgent: string,
  expiresAt: Date,
  createdAt: Date,
  revokedAt?: Date,
  revokedBy?: string,
  revokedReason?: string
}
```

## Security Requirements

### Password Policy
- Minimum 12 characters
- At least 1 uppercase, 1 lowercase, 1 number, 1 special character
- Cannot contain user's email or name
- Cannot be in common password list
- Must be changed every 90 days
- Cannot reuse last 5 passwords

### Session Management
- Access tokens expire in 1 hour
- Refresh tokens expire in 7 days
- Maximum 5 concurrent sessions per user
- Sessions invalidated on password change
- IP-based session validation

### Rate Limiting
- Login: 5 attempts per 15 minutes
- Registration: 3 per hour per IP
- Password reset: 3 per hour per email

## Testing Requirements

### Unit Tests
```typescript
describe('User Entity', () => {
  it('should hash password on creation');
  it('should validate email format');
  it('should lock account after 5 failed attempts');
  it('should enforce password policy');
});

describe('Token Service', () => {
  it('should generate valid JWT tokens');
  it('should verify tokens with JWKS');
  it('should reject expired tokens');
  it('should reject tokens with invalid signature');
});
```

### Integration Tests
```typescript
describe('Authentication Flow', () => {
  it('should register new user with valid data');
  it('should authenticate user with correct credentials');
  it('should reject login with wrong password');
  it('should handle MFA flow correctly');
  it('should refresh tokens successfully');
});
```

## Commands

```javascript
// Create new user
execute({
  action: 'mongodb',
  content: `
    db("clenergize_identity").collection("users").insertOne({
      email: "user@example.com",
      passwordHash: await bcrypt.hash("SecurePass123!", 10),
      roles: ["data-entry"],
      status: "active",
      createdAt: new Date()
    })
  `
})

// Force password reset
execute({
  action: 'mongodb',
  content: `
    db("clenergize_identity").collection("users").updateOne(
      { _id: ObjectId("userId") },
      {
        $set: {
          passwordResetRequired: true,
          passwordResetToken: crypto.randomBytes(32).toString('hex'),
          passwordResetExpires: new Date(Date.now() + 3600000)
        }
      }
    )
  `
})

// Unlock locked account
execute({
  action: 'mongodb',
  content: `
    db("clenergize_identity").collection("users").updateOne(
      { _id: ObjectId("userId") },
      {
        $set: {
          "security.loginAttempts": 0,
          "security.lockedUntil": null,
          status: "active"
        }
      }
    )
  `
})

// Revoke all user sessions
execute({
  action: 'mongodb',
  content: `
    db("clenergize_identity").collection("sessions").updateMany(
      { userId: ObjectId("userId"), revokedAt: null },
      {
        $set: {
          revokedAt: new Date(),
          revokedBy: "admin",
          revokedReason: "Security reset"
        }
      }
    )
  `
})

// Show user audit trail
execute({
  action: 'mongodb',
  content: `
    db("clenergize_audit").collection("auth_events").find({
      userId: ObjectId("userId")
    }).sort({ timestamp: -1 }).limit(50)
  `
})
```

## Success Metrics
- JWT verification implemented (not just decode)
- 0 hardcoded secrets
- 100% password hashing
- Audit trail for all auth events
- Session management working
- MFA option available
- Account lockout after failed attempts
- All endpoints require authentication

## Current Sprint 0.1 Tasks
1. Remove all jwt.decode() usage (replace with verify)
2. Implement JWKS client for token verification
3. Add bcrypt for password hashing
4. Create user registration with validation
5. Implement login with account lockout
6. Add refresh token rotation
7. Create audit logging for all auth events
8. Add comprehensive tests

Remember: This service is the security gateway for the entire system. Every authentication decision must be secure, audited, and tested.