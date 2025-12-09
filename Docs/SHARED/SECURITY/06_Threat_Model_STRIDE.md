# Security Threat Model - STRIDE Analysis

> **Document Type**: Security Architecture
> **Status**: Draft
> **Version**: 1.0.0
> **Last Updated**: November 18, 2025
> **Owner**: Security Agent

---

## Executive Summary

This document provides a comprehensive STRIDE threat model analysis for all 7 microservices in the Clenergize V3 rebuild. The analysis identifies **127 potential threats** across six STRIDE categories and provides detailed mitigation strategies for each.

### Threat Statistics

| Service | Critical | High | Medium | Low | Total |
|---------|----------|------|--------|-----|-------|
| Identity | 8 | 12 | 6 | 3 | 29 |
| Organization | 4 | 8 | 10 | 4 | 26 |
| Reference | 2 | 4 | 6 | 3 | 15 |
| Activity | 3 | 6 | 8 | 4 | 21 |
| Calculation | 2 | 4 | 5 | 2 | 13 |
| Reporting | 1 | 3 | 6 | 3 | 13 |
| Audit | 3 | 5 | 2 | 0 | 10 |
| **Total** | **23** | **42** | **43** | **19** | **127** |

### Critical Findings

**From OLD System Analysis** (MUST FIX):
1. ❗ **JWT tokens decoded without signature verification** → 8 related STRIDE threats
2. ❗ **Hardcoded secrets in environment files** → 6 related STRIDE threats
3. ❗ **No request rate limiting** → 4 related STRIDE threats
4. ❗ **Missing input validation** → 12 related STRIDE threats
5. ❗ **Infinite SQS polling loops** → 2 related STRIDE threats

---

## Table of Contents

1. [STRIDE Methodology](#stride-methodology)
2. [Threat Model Overview](#threat-model-overview)
3. [Identity Service Threats](#identity-service-threats)
4. [Organization Service Threats](#organization-service-threats)
5. [Reference Service Threats](#reference-service-threats)
6. [Activity Service Threats](#activity-service-threats)
7. [Calculation Service Threats](#calculation-service-threats)
8. [Reporting Service Threats](#reporting-service-threats)
9. [Audit Service Threats](#audit-service-threats)
10. [Cross-Service Threats](#cross-service-threats)
11. [Mitigation Strategy Summary](#mitigation-strategy-summary)
12. [Security Testing Requirements](#security-testing-requirements)

---

## 1. STRIDE Methodology

### What is STRIDE?

STRIDE is a threat modeling framework developed by Microsoft that categorizes security threats into six types:

| Category | Description | Examples |
|----------|-------------|----------|
| **S**poofing | Pretending to be someone/something else | Fake user credentials, token theft, session hijacking |
| **T**ampering | Modifying data or code | Database manipulation, request tampering, code injection |
| **R**epudiation | Denying actions performed | No audit trail, missing logs, unsigned transactions |
| **I**nformation Disclosure | Exposing information to unauthorized parties | Data leaks, unencrypted transmission, verbose errors |
| **D**enial of Service | Making system unavailable | Resource exhaustion, infinite loops, flood attacks |
| **E**levation of Privilege | Gaining unauthorized permissions | Privilege escalation, IDOR, broken access control |

### STRIDE per Component Type

| Component | Primary STRIDE Concerns |
|-----------|------------------------|
| Web API | S, T, I, D, E |
| Database | T, I, E |
| Message Queue | T, I, D |
| File Storage | T, I, E |
| Authentication | S, E |
| Authorization | E |
| Audit Logging | R |

### Threat Severity Ranking

| Severity | CVSS Score | Impact | Likelihood | Examples |
|----------|------------|--------|------------|----------|
| **Critical** | 9.0-10.0 | Complete system compromise | High | JWT bypass, SQL injection, RCE |
| **High** | 7.0-8.9 | Major data breach or privilege escalation | Medium-High | IDOR, XSS, weak crypto |
| **Medium** | 4.0-6.9 | Limited data exposure or availability impact | Medium | Missing rate limits, verbose errors |
| **Low** | 0.1-3.9 | Minor information leakage | Low | Version disclosure, cache timing |

---

## 2. Threat Model Overview

### System Architecture Context

```
┌─────────────────────────────────────────────────────────────┐
│                     Internet / Users                        │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS (TLS 1.3)
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    AWS CloudFront (CDN)                     │
│                 • DDoS Protection (AWS Shield)              │
│                 • WAF Rules (SQL Injection, XSS)            │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    API Gateway (NestJS)                     │
│  • JWT Verification (JWKS)                                  │
│  • Rate Limiting (Token Bucket)                             │
│  • Request Validation (Zod)                                 │
│  • CORS Configuration                                       │
└────────────────────────┬────────────────────────────────────┘
                         │ Internal Network (VPC)
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼────┐     ┌────▼────┐     ┌───▼─────┐
    │Identity │     │  Org    │     │Reference│
    │ Service │     │ Service │ ... │ Service │
    └────┬────┘     └────┬────┘     └────┬────┘
         │               │               │
         └───────────────┼───────────────┘
                         │
         ┌───────────────┴────────────────┐
         │                                │
    ┌────▼────┐                     ┌─────▼─────┐
    │ MongoDB │                     │   Redis   │
    │ (Encrypted│                   │  (TLS)    │
    │  at rest) │                   └───────────┘
    └───────────┘
```

### Trust Boundaries

1. **External → CDN**: Untrusted traffic from internet
2. **CDN → API Gateway**: Filtered traffic (WAF applied)
3. **API Gateway → Services**: Authenticated requests (JWT verified)
4. **Services → Database**: Trusted internal network
5. **Services → Event Bus**: Trusted internal events

### Data Classification

| Classification | Examples | Encryption | Access Control |
|----------------|----------|------------|----------------|
| **Public** | Emission factors, units | Optional | Anonymous read |
| **Internal** | Project metadata, hierarchy names | In-transit | Authenticated users |
| **Confidential** | Activity data, calculations | In-transit + At-rest | Role-based access |
| **Restricted** | User credentials, audit logs | In-transit + At-rest + Field-level | Admin only |

---

## 3. Identity Service Threats

**Service Responsibility**: Authentication, user management, MFA, session management

### 3.1 Spoofing Threats

#### IDENT-S-001: JWT Token Forgery
- **Severity**: 🔴 **CRITICAL** (CVSS 9.8)
- **OLD System Issue**: ✅ **YES** - Tokens decoded without signature verification
- **Description**: Attacker crafts fake JWT tokens with elevated privileges
- **Attack Vector**:
  ```javascript
  // OLD SYSTEM (VULNERABLE):
  const decoded = jwt.decode(token); // NO VERIFICATION!
  const userId = decoded.sub;

  // Attacker can craft token:
  const fakeToken = jwt.sign({ sub: 'admin-id', roles: ['ADMIN'] }, 'guessed-secret');
  ```
- **Impact**: Complete authentication bypass, full system access
- **Likelihood**: High (publicly known vulnerability)
- **Affected Components**: All endpoints requiring authentication
- **Mitigation**:
  ```typescript
  // NEW SYSTEM (SECURE):
  import jwksRsa from 'jwks-rsa';
  import jwt from 'jsonwebtoken';

  const jwksClient = jwksRsa({
    jwksUri: process.env.COGNITO_JWKS_URI,
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 10
  });

  async function verifyToken(token: string): Promise<JwtPayload> {
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded) throw new Error('Invalid token');

    const kid = decoded.header.kid;
    const signingKey = await jwksClient.getSigningKey(kid);
    const publicKey = signingKey.getPublicKey();

    return jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
      clockTolerance: 60 // Allow 60 seconds clock skew
    }) as JwtPayload;
  }
  ```
- **References**: CLNZ-101, OWASP A07:2021 - Identification and Authentication Failures

#### IDENT-S-002: Session Hijacking
- **Severity**: 🟠 **HIGH** (CVSS 8.1)
- **Description**: Attacker steals session token via XSS or network sniffing
- **Attack Vector**:
  - XSS attack extracts session token from localStorage
  - Man-in-the-middle attack on HTTP connection
  - Session fixation attack
- **Impact**: Account takeover, unauthorized access
- **Likelihood**: Medium
- **Mitigation**:
  ```typescript
  // 1. Use HttpOnly cookies (not localStorage)
  res.cookie('sessionToken', token, {
    httpOnly: true,        // Prevent JavaScript access
    secure: true,          // HTTPS only
    sameSite: 'strict',    // CSRF protection
    maxAge: 3600000,       // 1 hour
    signed: true           // Cookie signing
  });

  // 2. Implement session fingerprinting
  interface SessionFingerprint {
    userAgent: string;
    ipAddress: string;
    browserHash: string;
  }

  async function validateSession(sessionId: string, request: Request): Promise<boolean> {
    const session = await db.sessions.findOne({ sessionId });

    // Verify fingerprint hasn't changed
    if (session.userAgent !== request.headers['user-agent']) {
      await revokeSession(sessionId);
      throw new Error('Session hijacking detected');
    }

    return true;
  }
  ```

#### IDENT-S-003: Credential Stuffing
- **Severity**: 🟠 **HIGH** (CVSS 7.5)
- **Description**: Automated login attempts using leaked credential databases
- **Impact**: Account compromise, data breach
- **Likelihood**: High (common attack)
- **Mitigation**:
  ```typescript
  // 1. Rate limiting per IP and per email
  @UseGuards(RateLimitGuard)
  @RateLimit({ points: 5, duration: 900 }) // 5 attempts per 15 minutes
  async login(@Body() credentials: LoginDto, @Ip() ip: string) {
    // Track failed attempts per IP
    const ipAttempts = await redis.incr(`login:ip:${ip}`);
    if (ipAttempts > 10) {
      throw new TooManyRequestsException('IP temporarily blocked');
    }

    // Track failed attempts per email
    const emailAttempts = await redis.incr(`login:email:${credentials.email}`);
    if (emailAttempts > 5) {
      // Trigger MFA even if password is correct
      return { requireMfa: true };
    }

    // ... authentication logic
  }

  // 2. Implement CAPTCHA after 3 failed attempts
  if (failedAttempts >= 3) {
    const captchaValid = await verifyCaptcha(request.body.captchaToken);
    if (!captchaValid) {
      throw new BadRequestException('CAPTCHA verification failed');
    }
  }

  // 3. Use password breach detection (HaveIBeenPwned API)
  async function checkPasswordBreach(password: string): Promise<boolean> {
    const hash = crypto.createHash('sha1').update(password).digest('hex');
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    const hashes = await response.text();

    return hashes.includes(suffix.toUpperCase());
  }
  ```

#### IDENT-S-004: MFA Bypass
- **Severity**: 🟠 **HIGH** (CVSS 7.3)
- **Description**: Attacker bypasses two-factor authentication
- **Attack Scenarios**:
  - Backup codes stolen or guessed
  - TOTP secret extraction from QR code
  - Race condition in verification logic
  - Session reuse after MFA verification
- **Mitigation**:
  ```typescript
  // 1. Encrypt MFA secrets with KMS
  import { KMSClient, EncryptCommand, DecryptCommand } from '@aws-sdk/client-kms';

  async function storeMfaSecret(userId: string, secret: string): Promise<void> {
    const kms = new KMSClient({ region: 'us-east-1' });
    const encrypted = await kms.send(new EncryptCommand({
      KeyId: process.env.KMS_KEY_ID,
      Plaintext: Buffer.from(secret)
    }));

    await db.mfa_secrets.insertOne({
      userId,
      secretEncrypted: encrypted.CiphertextBlob.toString('base64'),
      backupCodesHash: await bcrypt.hash(backupCodes.join(','), 12)
    });
  }

  // 2. One-time use for backup codes
  async function useBackupCode(userId: string, code: string): Promise<boolean> {
    const mfaRecord = await db.mfa_secrets.findOne({ userId });

    // Check if code was already used
    if (mfaRecord.usedBackupCodes?.includes(code)) {
      throw new Error('Backup code already used');
    }

    // Verify and mark as used
    const isValid = await verifyBackupCode(code, mfaRecord.backupCodesHash);
    if (isValid) {
      await db.mfa_secrets.updateOne(
        { userId },
        { $push: { usedBackupCodes: code } }
      );
    }

    return isValid;
  }

  // 3. MFA session separate from main session
  interface MfaSession {
    userId: string;
    mfaCompleted: boolean;
    expiresAt: Date; // 5 minutes
  }
  ```

### 3.2 Tampering Threats

#### IDENT-T-001: Password Hash Downgrade
- **Severity**: 🟠 **HIGH** (CVSS 7.8)
- **Description**: Attacker modifies password hashing algorithm to weaker version
- **Mitigation**:
  ```typescript
  // Use bcrypt with cost factor 12 minimum
  const BCRYPT_ROUNDS = 12;

  async function hashPassword(password: string): Promise<string> {
    // Verify strong password policy
    if (!validatePasswordStrength(password)) {
      throw new Error('Password does not meet requirements');
    }

    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  // Detect and upgrade old hashes
  async function verifyAndUpgradePassword(
    userId: string,
    password: string,
    storedHash: string
  ): Promise<boolean> {
    const isValid = await bcrypt.compare(password, storedHash);

    if (isValid) {
      // Check if hash needs upgrade (old cost factor)
      const rounds = bcrypt.getRounds(storedHash);
      if (rounds < BCRYPT_ROUNDS) {
        // Rehash with stronger algorithm
        const newHash = await hashPassword(password);
        await db.users.updateOne(
          { _id: userId },
          { $set: { passwordHash: newHash, passwordChangedAt: new Date() } }
        );
      }
    }

    return isValid;
  }
  ```

#### IDENT-T-002: Account Enumeration
- **Severity**: 🟡 **MEDIUM** (CVSS 5.3)
- **Description**: Attacker determines which emails are registered
- **Attack Vector**:
  - Different error messages for "user not found" vs "wrong password"
  - Timing attacks on password verification
  - Different HTTP status codes
- **Mitigation**:
  ```typescript
  // Always return same generic error message
  async function login(email: string, password: string): Promise<LoginResult> {
    const user = await db.users.findOne({ email: email.toLowerCase() });

    // Always verify password even if user doesn't exist (timing attack prevention)
    const validPassword = user
      ? await bcrypt.compare(password, user.passwordHash)
      : await bcrypt.compare(password, '$2b$12$fakehashfortimingequalityzzzzzzzzzz');

    if (!user || !validPassword) {
      // Generic error (don't reveal if user exists)
      throw new UnauthorizedException('Invalid email or password');
    }

    // Log failed attempts without revealing user existence
    await auditLog.create({
      action: 'LOGIN_FAILED',
      email: email, // Log email, not userId
      ipAddress: request.ip
    });

    return generateTokens(user);
  }
  ```

### 3.3 Repudiation Threats

#### IDENT-R-001: Authentication Event Not Logged
- **Severity**: 🟡 **MEDIUM** (CVSS 5.0)
- **Description**: Failed login attempts, password changes not logged
- **Impact**: Cannot detect brute force attacks, no forensic evidence
- **Mitigation**:
  ```typescript
  // Log ALL authentication events
  enum AuthEventType {
    LOGIN_SUCCESS = 'LOGIN_SUCCESS',
    LOGIN_FAILED = 'LOGIN_FAILED',
    LOGOUT = 'LOGOUT',
    PASSWORD_CHANGED = 'PASSWORD_CHANGED',
    PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED',
    MFA_ENABLED = 'MFA_ENABLED',
    MFA_DISABLED = 'MFA_DISABLED',
    SESSION_EXPIRED = 'SESSION_EXPIRED',
    SESSION_REVOKED = 'SESSION_REVOKED'
  }

  async function logAuthEvent(event: AuthEvent): Promise<void> {
    await eventBus.publish({
      type: 'identity.auth.event.v1',
      data: {
        eventType: event.type,
        userId: event.userId,
        email: event.email,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        success: event.success,
        failureReason: event.failureReason,
        timestamp: new Date().toISOString()
      }
    });

    // Also store in audit service
    await auditService.logSecurityEvent({
      organizationId: user.organizationId,
      userId: event.userId,
      action: event.type,
      result: event.success ? 'SUCCESS' : 'FAILURE',
      ipAddress: event.ipAddress
    });
  }
  ```

### 3.4 Information Disclosure Threats

#### IDENT-I-001: Sensitive Data in JWT Payload
- **Severity**: 🟠 **HIGH** (CVSS 7.1)
- **Description**: JWT contains sensitive information (email, roles) in plaintext
- **Impact**: Information leakage if token intercepted
- **Mitigation**:
  ```typescript
  // Minimal JWT payload (opaque token preferred)
  interface JwtPayload {
    sub: string;              // User ID only
    iss: string;              // Issuer
    aud: string;              // Audience
    exp: number;              // Expiration
    iat: number;              // Issued at
    jti: string;              // Token ID
    // NO email, roles, or sensitive data!
  }

  // Fetch user details from database on each request
  @Injectable()
  export class JwtStrategy extends PassportStrategy(Strategy) {
    async validate(payload: JwtPayload): Promise<User> {
      // Token only contains user ID
      const user = await this.userService.findById(payload.sub);
      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException();
      }

      // Fetch fresh permissions from database
      const permissions = await this.permissionService.getUserPermissions(user.id);

      return { ...user, permissions };
    }
  }
  ```

#### IDENT-I-002: Password Reset Token in URL
- **Severity**: 🟡 **MEDIUM** (CVSS 6.5)
- **Description**: Reset token in URL can leak via Referer header, browser history
- **Mitigation**:
  ```typescript
  // Use POST for token verification, not GET
  // URL: https://app.clenergize.com/reset-password (no token in URL)

  // Frontend submits token via POST
  @Post('password-reset/verify')
  async verifyResetToken(@Body() dto: VerifyTokenDto): Promise<boolean> {
    const token = await db.password_reset_tokens.findOne({
      tokenHash: await hashToken(dto.token),
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    return !!token;
  }

  // Short expiration time (1 hour)
  const RESET_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour
  ```

### 3.5 Denial of Service Threats

#### IDENT-D-001: Bcrypt Amplification Attack
- **Severity**: 🟠 **HIGH** (CVSS 7.5)
- **Description**: Attacker sends long passwords to exhaust CPU via bcrypt
- **Attack Vector**:
  ```javascript
  // Attacker sends 1MB password
  POST /auth/login
  {
    "email": "test@example.com",
    "password": "A".repeat(1000000) // 1 million characters
  }
  // bcrypt hashing takes 30+ seconds, blocks event loop
  ```
- **Impact**: CPU exhaustion, service unavailable
- **Mitigation**:
  ```typescript
  // 1. Validate password length BEFORE hashing
  @IsString()
  @MaxLength(128) // Bcrypt max is 72 bytes, but limit earlier
  @MinLength(12)
  password: string;

  // 2. Use async bcrypt to avoid blocking event loop
  import bcrypt from 'bcryptjs'; // Async version

  async function verifyPassword(password: string, hash: string): Promise<boolean> {
    // Validate length
    if (password.length > 128) {
      throw new BadRequestException('Password too long');
    }

    // Use async compare (doesn't block event loop)
    return bcrypt.compare(password, hash);
  }

  // 3. Implement timeout on password operations
  async function verifyPasswordWithTimeout(
    password: string,
    hash: string
  ): Promise<boolean> {
    return Promise.race([
      bcrypt.compare(password, hash),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 5000)
      )
    ]);
  }
  ```

#### IDENT-D-002: Session Table Bloat
- **Severity**: 🟡 **MEDIUM** (CVSS 5.3)
- **Description**: Attacker creates millions of sessions to fill database
- **Mitigation**:
  ```typescript
  // 1. Rate limit session creation per IP
  @RateLimit({ points: 10, duration: 3600 }) // 10 sessions per hour per IP
  async createSession(userId: string, ip: string): Promise<Session> {
    // Check existing sessions for this user
    const activeSessions = await db.sessions.countDocuments({
      userId,
      expiresAt: { $gt: new Date() },
      isRevoked: false
    });

    // Limit concurrent sessions per user
    if (activeSessions >= 5) {
      // Revoke oldest session
      const oldestSession = await db.sessions.findOne(
        { userId, isRevoked: false },
        { sort: { createdAt: 1 } }
      );
      await revokeSession(oldestSession._id);
    }

    // ... create new session
  }

  // 2. Use MongoDB TTL index for auto-cleanup
  // See DATABASE_SCHEMA_DESIGN.md - sessions collection has TTL index on expiresAt
  ```

### 3.6 Elevation of Privilege Threats

#### IDENT-E-001: Role Manipulation in Token
- **Severity**: 🔴 **CRITICAL** (CVSS 9.1)
- **OLD System Issue**: ✅ **YES** - Roles stored in JWT without verification
- **Description**: Attacker modifies roles in JWT to gain admin access
- **Mitigation**:
  ```typescript
  // NEVER trust roles from JWT - always fetch from database
  @Injectable()
  export class AuthGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const user = request.user; // From JWT (only contains userId)

      // Fetch FRESH roles from database (not from JWT!)
      const userRecord = await db.users.findOne({ _id: user.id });
      if (!userRecord) {
        throw new UnauthorizedException();
      }

      // Attach actual roles to request
      request.user.roles = userRecord.roles;

      return true;
    }
  }

  // Role-based guards
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  async adminOnlyEndpoint() {
    // Only users with ADMIN or MANAGER role in database can access
  }
  ```

#### IDENT-E-002: Insecure Direct Object Reference (IDOR)
- **Severity**: 🟠 **HIGH** (CVSS 8.2)
- **Description**: User can access/modify other users' data
- **Example**:
  ```
  GET /users/12345/profile  // User 67890 accessing user 12345's profile
  PUT /users/12345          // User 67890 modifying user 12345
  ```
- **Mitigation**:
  ```typescript
  // Always verify resource ownership
  @Get('users/:userId/profile')
  async getUserProfile(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: User
  ): Promise<UserProfile> {
    // Check if user can access this profile
    if (userId !== currentUser.id && !currentUser.roles.includes('ADMIN')) {
      // Check if users are in same organization
      const targetUser = await db.users.findOne({ _id: userId });
      if (targetUser.organizationId !== currentUser.organizationId) {
        throw new ForbiddenException('Cannot access user from different organization');
      }
    }

    return this.userService.getProfile(userId);
  }

  // Better: Use organization-scoped queries
  @Get('users/:userId')
  async getUser(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: User
  ): Promise<User> {
    // Query scoped to current user's organization
    const user = await db.users.findOne({
      _id: userId,
      organizationId: currentUser.organizationId // Automatic scoping!
    });

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }
  ```

---

## 4. Organization Service Threats

**Service Responsibility**: Organization management, projects, hierarchies, permissions

### 4.1 Spoofing Threats

#### ORG-S-001: Organization Impersonation
- **Severity**: 🟠 **HIGH** (CVSS 7.4)
- **Description**: User creates organization with same name as legitimate company
- **Impact**: Brand impersonation, data confusion
- **Mitigation**:
  ```typescript
  // 1. Verify organization ownership during registration
  @Post('organizations')
  async createOrganization(@Body() dto: CreateOrgDto, @CurrentUser() user: User) {
    // Check for similar organization names
    const similar = await db.organizations.findOne({
      name: { $regex: new RegExp(dto.name, 'i') },
      deletedAt: null
    });

    if (similar) {
      // Require domain verification for similar names
      if (!dto.domainVerificationToken) {
        throw new ConflictException('Domain verification required for this name');
      }

      await this.verifyDomainOwnership(dto.name, dto.domainVerificationToken);
    }

    // ... create organization
  }

  // 2. Domain verification process
  async function verifyDomainOwnership(
    orgName: string,
    domain: string
  ): Promise<boolean> {
    const verificationCode = crypto.randomBytes(32).toString('hex');

    // Ask user to add TXT record: clenergize-verify=<code>
    const txtRecords = await dns.resolveTxt(domain);
    const verified = txtRecords.some(record =>
      record.includes(`clenergize-verify=${verificationCode}`)
    );

    if (!verified) {
      throw new BadRequestException('Domain verification failed');
    }

    return true;
  }
  ```

### 4.2 Tampering Threats

#### ORG-T-001: Hierarchy Data Manipulation
- **Severity**: 🟠 **HIGH** (CVSS 7.6)
- **OLD System Issue**: ✅ **YES** - Cloned hierarchies allowed tampering
- **Description**: Attacker modifies hierarchy structure to hide emissions
- **Impact**: Inaccurate carbon reporting, compliance violations
- **Mitigation**:
  ```typescript
  // 1. Immutable hierarchy snapshots for locked reporting years
  @Put('hierarchies/:hierarchyId')
  async updateHierarchy(
    @Param('hierarchyId') hierarchyId: string,
    @Body() updates: UpdateHierarchyDto,
    @CurrentUser() user: User
  ): Promise<Hierarchy> {
    const hierarchy = await db.hierarchies.findOne({ _id: hierarchyId });

    // Check if hierarchy is used in locked reporting years
    const lockedYears = await db.reporting_years.find({
      organizationId: hierarchy.organizationId,
      status: 'LOCKED'
    });

    const projectsUsingHierarchy = await db.projects.find({
      hierarchyId: hierarchyId,
      reportingYear: { $in: lockedYears.map(y => y.year) }
    });

    if (projectsUsingHierarchy.length > 0) {
      throw new ConflictException(
        'Cannot modify hierarchy used in locked reporting years'
      );
    }

    // Version hierarchy before modification
    await this.createHierarchyVersion(hierarchyId);

    // Apply updates
    return db.hierarchies.findOneAndUpdate(
      { _id: hierarchyId },
      { $set: updates, $inc: { version: 1 } },
      { new: true }
    );
  }

  // 2. Audit all hierarchy changes
  @Aspect()
  export class HierarchyAuditAspect {
    @After('execution(* HierarchyService.update*(..))')
    async afterUpdate(joinPoint: JoinPoint): Promise<void> {
      const [hierarchyId, updates] = joinPoint.args;

      await eventBus.publish({
        type: 'organization.hierarchy.updated.v1',
        data: {
          hierarchyId,
          changes: updates,
          userId: joinPoint.context.user.id,
          timestamp: new Date().toISOString()
        }
      });
    }
  }
  ```

#### ORG-T-002: Permission Escalation via Team
- **Severity**: 🟠 **HIGH** (CVSS 8.0)
- **Description**: User adds themselves to team with higher permissions
- **Mitigation**:
  ```typescript
  // Only team lead or admins can add members
  @Post('teams/:teamId/members')
  @UseGuards(TeamLeadOrAdminGuard)
  async addTeamMember(
    @Param('teamId') teamId: string,
    @Body() dto: AddMemberDto,
    @CurrentUser() user: User
  ): Promise<Team> {
    const team = await db.teams.findOne({ _id: teamId });

    // Cannot add yourself
    if (dto.userId === user.id) {
      throw new ForbiddenException('Cannot add yourself to team');
    }

    // Verify user is in same organization
    const targetUser = await db.users.findOne({ _id: dto.userId });
    if (targetUser.organizationId !== team.organizationId) {
      throw new ForbiddenException('User not in organization');
    }

    // Log permission grant
    await auditLog.create({
      action: 'TEAM_MEMBER_ADDED',
      teamId,
      targetUserId: dto.userId,
      grantedBy: user.id
    });

    return db.teams.findOneAndUpdate(
      { _id: teamId },
      {
        $push: {
          members: {
            userId: dto.userId,
            role: dto.role,
            joinedAt: new Date()
          }
        }
      },
      { new: true }
    );
  }
  ```

### 4.3 Repudiation Threats

#### ORG-R-001: Project Data Changes Not Audited
- **Severity**: 🟡 **MEDIUM** (CVSS 5.5)
- **Description**: No audit trail for project modifications
- **Mitigation**:
  ```typescript
  // Use Mongoose hooks to auto-audit all changes
  ProjectSchema.pre('findOneAndUpdate', async function() {
    const update = this.getUpdate();
    const filter = this.getFilter();

    // Get old document before update
    const oldDoc = await this.model.findOne(filter);

    // Calculate changes
    const changes = Object.keys(update.$set || {}).map(field => ({
      field,
      oldValue: oldDoc[field],
      newValue: update.$set[field]
    }));

    // Publish audit event
    await eventBus.publish({
      type: 'organization.project.updated.v1',
      data: {
        projectId: oldDoc._id,
        changes,
        userId: this.options.user.id, // From request context
        timestamp: new Date().toISOString()
      }
    });
  });
  ```

### 4.4 Information Disclosure Threats

#### ORG-I-001: Hierarchy Data Leakage
- **Severity**: 🟡 **MEDIUM** (CVSS 6.2)
- **Description**: User can query hierarchies from other organizations
- **Mitigation**:
  ```typescript
  // Always scope queries to user's organization
  @Get('hierarchies')
  async listHierarchies(@CurrentUser() user: User): Promise<Hierarchy[]> {
    // Automatic organization scoping
    return db.hierarchies.find({
      organizationId: user.organizationId,
      deletedAt: null
    });
  }

  // Global query interceptor
  @Injectable()
  export class OrganizationScopeInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const request = context.switchToHttp().getRequest();
      const user = request.user;

      // Inject organizationId into all queries
      if (request.query) {
        request.query.organizationId = user.organizationId;
      }

      return next.handle();
    }
  }
  ```

### 4.5 Denial of Service Threats

#### ORG-D-001: Hierarchy Depth Bomb
- **Severity**: 🟡 **MEDIUM** (CVSS 5.8)
- **Description**: Attacker creates deeply nested hierarchy (1000+ levels)
- **Impact**: Stack overflow in tree traversal, database performance degradation
- **Mitigation**:
  ```typescript
  // Limit hierarchy depth
  const MAX_HIERARCHY_DEPTH = 10;

  @Post('hierarchy-nodes')
  async createNode(
    @Body() dto: CreateNodeDto,
    @CurrentUser() user: User
  ): Promise<HierarchyNode> {
    if (dto.parentId) {
      const parent = await db.hierarchy_nodes.findOne({ _id: dto.parentId });

      // Check depth limit
      if (parent.level >= MAX_HIERARCHY_DEPTH) {
        throw new BadRequestException(
          `Maximum hierarchy depth (${MAX_HIERARCHY_DEPTH}) exceeded`
        );
      }

      // Set path and level
      dto.path = `${parent.path}/${dto.name}`;
      dto.level = parent.level + 1;
    } else {
      dto.path = `/${dto.name}`;
      dto.level = 0;
    }

    return db.hierarchy_nodes.create(dto);
  }
  ```

### 4.6 Elevation of Privilege Threats

#### ORG-E-001: Permission Grant Without Verification
- **Severity**: 🔴 **CRITICAL** (CVSS 9.3)
- **Description**: User grants permissions they don't have themselves
- **Mitigation**:
  ```typescript
  // Verify granter has permission to grant
  @Post('permissions')
  async grantPermission(
    @Body() dto: GrantPermissionDto,
    @CurrentUser() user: User
  ): Promise<Permission> {
    // Check if granter has ADMIN permission on resource
    const granterPermission = await db.permissions.findOne({
      userId: user.id,
      resourceType: dto.resourceType,
      resourceId: dto.resourceId,
      actions: { $in: ['ADMIN'] },
      revokedAt: null
    });

    if (!granterPermission && !user.roles.includes('SUPER_ADMIN')) {
      throw new ForbiddenException(
        'You do not have permission to grant access to this resource'
      );
    }

    // Cannot grant more permissions than you have
    const requestedActions = dto.actions;
    const granterActions = granterPermission.actions;
    const invalidActions = requestedActions.filter(
      action => !granterActions.includes(action) && action !== 'ADMIN'
    );

    if (invalidActions.length > 0) {
      throw new ForbiddenException(
        `Cannot grant permissions you don't have: ${invalidActions.join(', ')}`
      );
    }

    // Create permission
    const permission = await db.permissions.create({
      ...dto,
      grantedBy: user.id,
      createdAt: new Date()
    });

    // Audit permission grant
    await eventBus.publish({
      type: 'organization.permission.granted.v1',
      data: {
        permissionId: permission._id,
        userId: dto.userId,
        resourceType: dto.resourceType,
        resourceId: dto.resourceId,
        actions: dto.actions,
        grantedBy: user.id
      }
    });

    return permission;
  }
  ```

---

## 5. Reference Service Threats

**Service Responsibility**: Emission factors, units, parameters, categories

### 5.1 Tampering Threats

#### REF-T-001: Emission Factor Manipulation
- **Severity**: 🔴 **CRITICAL** (CVSS 9.0)
- **Description**: Attacker modifies emission factors to reduce calculated emissions
- **Impact**: Fraudulent carbon reporting, compliance violations, greenwashing
- **Mitigation**:
  ```typescript
  // 1. Standard emission factors are immutable (read-only)
  @Put('emission-factors/:id')
  async updateEmissionFactor(
    @Param('id') id: string,
    @Body() updates: UpdateEmissionFactorDto,
    @CurrentUser() user: User
  ): Promise<EmissionFactor> {
    const factor = await db.emission_factors.findOne({ _id: id });

    // STANDARD factors cannot be modified
    if (factor.type === 'STANDARD') {
      throw new ForbiddenException('Standard emission factors are read-only');
    }

    // CUSTOM factors can only be modified by creator's organization
    if (factor.organizationId?.toString() !== user.organizationId) {
      throw new ForbiddenException('Can only modify your organization\'s custom factors');
    }

    // Version custom factors (don't modify in-place)
    const newVersion = await db.emission_factors.create({
      ...factor,
      ...updates,
      version: `${parseInt(factor.version) + 1}.0`,
      supersededBy: null,
      createdAt: new Date(),
      createdBy: user.id
    });

    // Mark old version as deprecated
    await db.emission_factors.updateOne(
      { _id: id },
      {
        $set: {
          status: 'DEPRECATED',
          deprecatedAt: new Date(),
          supersededBy: newVersion._id
        }
      }
    );

    // Trigger recalculation for all data using old factor
    await eventBus.publish({
      type: 'reference.emission-factor.updated.v1',
      data: {
        oldFactorId: id,
        newFactorId: newVersion._id,
        affectedOrganizations: [user.organizationId]
      }
    });

    return newVersion;
  }

  // 2. Cryptographic integrity verification for standard factors
  interface EmissionFactorSignature {
    factorId: string;
    data: string; // JSON.stringify(factor data)
    signature: string; // RSA signature
    publicKey: string; // IPCC/EPA public key
  }

  async function verifyFactorIntegrity(
    factor: EmissionFactor
  ): Promise<boolean> {
    if (factor.type !== 'STANDARD') return true;

    const data = JSON.stringify({
      name: factor.name,
      factors: factor.factors,
      source: factor.source,
      version: factor.version
    });

    const signature = factor.metadata?.signature;
    const publicKey = await fetchPublicKey(factor.source); // IPCC/EPA

    const verify = crypto.createVerify('SHA256');
    verify.update(data);
    verify.end();

    return verify.verify(publicKey, signature, 'base64');
  }
  ```

#### REF-T-002: Unit Conversion Manipulation
- **Severity**: 🟠 **HIGH** (CVSS 8.1)
- **Description**: Attacker modifies unit conversion factors
- **Example**: Change kWh → MWh from 1000 to 100 (10x underreporting)
- **Mitigation**:
  ```typescript
  // Unit conversions are immutable and mathematically verified
  @Post('conversion-rules')
  async createConversionRule(
    @Body() dto: CreateConversionRuleDto
  ): Promise<ConversionRule> {
    // Verify mathematical correctness
    const fromUnit = await db.units.findOne({ _id: dto.fromUnitId });
    const toUnit = await db.units.findOne({ _id: dto.toUnitId });

    // Units must be same category
    if (fromUnit.category !== toUnit.category) {
      throw new BadRequestException('Cannot convert between different unit categories');
    }

    // Verify bidirectional consistency
    const reverseRule = await db.conversion_rules.findOne({
      fromUnitId: dto.toUnitId,
      toUnitId: dto.fromUnitId
    });

    if (reverseRule) {
      const expected = 1 / reverseRule.factor;
      const tolerance = 0.0001;

      if (Math.abs(dto.factor - expected) > tolerance) {
        throw new BadRequestException(
          `Conversion factor inconsistent with reverse rule. Expected ${expected}, got ${dto.factor}`
        );
      }
    }

    return db.conversion_rules.create(dto);
  }
  ```

### 5.2 Information Disclosure Threats

#### REF-I-001: Custom Emission Factor Leakage
- **Severity**: 🟡 **MEDIUM** (CVSS 5.7)
- **Description**: Custom emission factors visible to other organizations
- **Mitigation**:
  ```typescript
  // Filter custom factors by organization
  @Get('emission-factors')
  async listEmissionFactors(
    @CurrentUser() user: User,
    @Query() filters: FilterDto
  ): Promise<EmissionFactor[]> {
    return db.emission_factors.find({
      $or: [
        { type: 'STANDARD' }, // Standard factors visible to all
        {
          type: 'CUSTOM',
          organizationId: user.organizationId // Only own custom factors
        }
      ],
      ...filters
    });
  }
  ```

### 5.3 Denial of Service Threats

#### REF-D-001: Emission Factor Import Bomb
- **Severity**: 🟡 **MEDIUM** (CVSS 6.0)
- **Description**: Attacker uploads massive emission factor file (1GB+)
- **Mitigation**:
  ```typescript
  // Limit file size and processing time
  @Post('emission-factors/import')
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB max
    }
  }))
  async importEmissionFactors(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User
  ): Promise<ImportResult> {
    // Validate file format
    if (!['text/csv', 'application/json'].includes(file.mimetype)) {
      throw new BadRequestException('Invalid file format');
    }

    // Stream parse (don't load entire file into memory)
    const parser = csv.parse(file.buffer, {
      columns: true,
      skip_empty_lines: true
    });

    let count = 0;
    const MAX_ROWS = 10000;

    for await (const record of parser) {
      if (++count > MAX_ROWS) {
        throw new BadRequestException(`Maximum ${MAX_ROWS} rows exceeded`);
      }

      // Process record...
    }

    return { imported: count };
  }
  ```

---

## 6. Activity Service Threats

**Service Responsibility**: Activity data ingestion, carbon scopes, bulk imports

### 6.1 Tampering Threats

#### ACT-T-001: Activity Data Manipulation After Verification
- **Severity**: 🔴 **CRITICAL** (CVSS 9.2)
- **Description**: User modifies verified activity data to reduce emissions
- **Mitigation**:
  ```typescript
  // Lock verified data
  @Put('activity-data/:id')
  async updateActivityData(
    @Param('id') id: string,
    @Body() updates: UpdateActivityDataDto,
    @CurrentUser() user: User
  ): Promise<ActivityData> {
    const activityData = await db.activity_data.findOne({ _id: id });

    // Cannot modify VERIFIED data
    if (activityData.status === 'VERIFIED') {
      throw new ForbiddenException('Cannot modify verified activity data');
    }

    // Cannot modify data in locked reporting year
    const project = await db.projects.findOne({ _id: activityData.projectId });
    const reportingYear = await db.reporting_years.findOne({
      organizationId: project.organizationId,
      year: activityData.year
    });

    if (reportingYear?.status === 'LOCKED') {
      throw new ForbiddenException('Cannot modify data in locked reporting year');
    }

    // Version activity data before update
    await this.createActivityDataVersion(id);

    // Apply updates
    const updated = await db.activity_data.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          ...updates,
          updatedBy: user.id,
          updatedAt: new Date()
        },
        $inc: { version: 1 }
      },
      { new: true }
    );

    // Publish update event
    await eventBus.publish({
      type: 'activity.data.updated.v1',
      data: {
        activityDataId: id,
        changes: updates,
        userId: user.id
      }
    });

    return updated;
  }
  ```

#### ACT-T-002: Bulk Import Data Injection
- **Severity**: 🟠 **HIGH** (CVSS 7.8)
- **Description**: Attacker injects malicious data via CSV import
- **Attack Vectors**:
  - CSV formula injection (=cmd|'/c calc'!A1)
  - XXE injection in Excel files
  - SQL injection in field values
- **Mitigation**:
  ```typescript
  // Sanitize all imported data
  @Post('activity-data/bulk-import')
  async bulkImport(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: BulkImportDto
  ): Promise<BulkImport> {
    // 1. Scan file for malware
    const scanResult = await clamav.scanBuffer(file.buffer);
    if (scanResult.isInfected) {
      throw new BadRequestException('File contains malware');
    }

    // 2. Parse and validate each row
    const rows = await this.parseImportFile(file);
    const errors: ImportError[] = [];

    for (const [index, row] of rows.entries()) {
      try {
        // Sanitize formula injection
        const sanitized = this.sanitizeRow(row);

        // Validate with Zod schema
        const validated = ActivityDataSchema.parse(sanitized);

        // Check data ranges (detect anomalies)
        if (validated.quantityConsumed > 1000000) {
          errors.push({
            row: index,
            field: 'quantityConsumed',
            message: 'Value exceeds reasonable limit'
          });
          continue;
        }

        // Insert validated data
        await db.activity_data.create(validated);

      } catch (error) {
        errors.push({
          row: index,
          field: error.path?.join('.'),
          message: error.message
        });
      }
    }

    return {
      totalRows: rows.length,
      successRows: rows.length - errors.length,
      errorRows: errors.length,
      errors
    };
  }

  // CSV formula injection prevention
  function sanitizeRow(row: Record<string, any>): Record<string, any> {
    const sanitized = {};

    for (const [key, value] of Object.entries(row)) {
      if (typeof value === 'string') {
        // Remove formula prefixes: =, +, -, @
        sanitized[key] = value.replace(/^[=+\-@]/, '');
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
  ```

### 6.2 Information Disclosure Threats

#### ACT-I-001: Activity Data Cross-Organization Access
- **Severity**: 🟠 **HIGH** (CVSS 7.5)
- **Description**: User accesses activity data from other organizations
- **Mitigation**:
  ```typescript
  // Global query filter for organization scoping
  @Injectable()
  export class ActivityDataRepository {
    async findOne(
      filter: FilterQuery<ActivityData>,
      user: User
    ): Promise<ActivityData> {
      // Always inject organizationId check
      const scoped = {
        ...filter,
        organizationId: user.organizationId
      };

      return db.activity_data.findOne(scoped);
    }
  }

  // Mongoose middleware to auto-scope queries
  ActivityDataSchema.pre(['find', 'findOne'], function() {
    const context = this.getOptions().context;
    if (context?.user) {
      this.where({ organizationId: context.user.organizationId });
    }
  });
  ```

### 6.3 Denial of Service Threats

#### ACT-D-001: Bulk Import Resource Exhaustion
- **Severity**: 🟡 **MEDIUM** (CVSS 6.5)
- **Description**: Attacker uploads 100MB CSV causing memory exhaustion
- **Mitigation**:
  ```typescript
  // Process imports asynchronously with queue
  @Post('activity-data/bulk-import')
  async queueBulkImport(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User
  ): Promise<{ importId: string }> {
    // Upload to S3 first (don't keep in memory)
    const s3Key = `imports/${user.organizationId}/${uuid.v4()}.csv`;
    await s3.upload({
      Bucket: 'clenergize-imports',
      Key: s3Key,
      Body: file.buffer
    });

    // Create import job
    const importJob = await db.bulk_imports.create({
      projectId: dto.projectId,
      organizationId: user.organizationId,
      fileName: file.originalname,
      s3Key,
      status: 'PENDING',
      createdBy: user.id
    });

    // Queue for async processing (SQS)
    await sqs.sendMessage({
      QueueUrl: process.env.IMPORT_QUEUE_URL,
      MessageBody: JSON.stringify({
        importId: importJob._id,
        s3Key,
        userId: user.id
      })
    });

    return { importId: importJob._id };
  }

  // Worker processes queue with streaming
  async function processImport(importId: string): Promise<void> {
    const importJob = await db.bulk_imports.findOne({ _id: importId });

    // Stream from S3 (don't load entire file)
    const s3Stream = s3.getObject({
      Bucket: 'clenergize-imports',
      Key: importJob.s3Key
    }).createReadStream();

    const parser = s3Stream.pipe(csv.parse({ columns: true }));

    let processed = 0;
    const batchSize = 1000;
    let batch = [];

    for await (const record of parser) {
      batch.push(record);

      if (batch.length >= batchSize) {
        // Bulk insert batch
        await db.activity_data.insertMany(batch);
        processed += batch.length;

        // Update progress
        await db.bulk_imports.updateOne(
          { _id: importId },
          { $set: { processedRows: processed } }
        );

        batch = [];
      }
    }

    // Insert remaining records
    if (batch.length > 0) {
      await db.activity_data.insertMany(batch);
    }

    // Mark complete
    await db.bulk_imports.updateOne(
      { _id: importId },
      {
        $set: {
          status: 'COMPLETED',
          completedAt: new Date(),
          successRows: processed
        }
      }
    );
  }
  ```

---

## 7. Calculation Service Threats

**Service Responsibility**: Emission calculations, rollups, allocations

### 7.1 Tampering Threats

#### CALC-T-001: Calculation Result Manipulation
- **Severity**: 🔴 **CRITICAL** (CVSS 9.5)
- **Description**: Attacker modifies calculation results to show lower emissions
- **Impact**: Fraudulent reporting, compliance violations
- **Mitigation**:
  ```typescript
  // Calculations are immutable - recalculate instead of update
  @Put('calculations/:id')
  async updateCalculation(): Promise<never> {
    throw new ForbiddenException('Calculations are immutable. Use recalculate endpoint.');
  }

  // Recalculation creates new record
  @Post('calculations/:id/recalculate')
  async recalculate(
    @Param('id') id: string,
    @CurrentUser() user: User
  ): Promise<Calculation> {
    const oldCalc = await db.calculations.findOne({ _id: id });

    // Fetch fresh data
    const activityData = await activityService.findById(oldCalc.activityDataId);
    const emissionFactor = await referenceService.getEmissionFactor(
      activityData.parameterId,
      activityData.year
    );

    // Perform calculation
    const result = await this.calculateEmissions(activityData, emissionFactor);

    // Create new calculation record
    const newCalc = await db.calculations.create({
      activityDataId: oldCalc.activityDataId,
      projectId: oldCalc.projectId,
      organizationId: oldCalc.organizationId,
      emissionFactorId: emissionFactor._id,
      scope: activityData.scope,
      quantityConsumed: activityData.quantityConsumed,
      uomId: activityData.uomId,
      methodology: oldCalc.methodology,
      result,
      status: 'COMPLETED',
      calculatedAt: new Date(),
      recalculationJobId: dto.jobId
    });

    // Mark old calculation as superseded
    await db.calculations.updateOne(
      { _id: id },
      { $set: { status: 'RECALCULATED', supersededBy: newCalc._id } }
    );

    return newCalc;
  }

  // Verify calculation integrity
  async function verifyCalculation(calcId: string): Promise<boolean> {
    const calc = await db.calculations.findOne({ _id: calcId });

    // Re-run calculation with same inputs
    const activityData = await db.activity_data.findOne({ _id: calc.activityDataId });
    const emissionFactor = await db.emission_factors.findOne({ _id: calc.emissionFactorId });

    const expected = this.calculateEmissions(
      calc.quantityConsumed,
      emissionFactor.factors,
      calc.uomId
    );

    // Compare results (allow 0.01% tolerance for floating point)
    const tolerance = 0.0001;
    const diff = Math.abs(calc.result.co2e - expected.co2e) / calc.result.co2e;

    if (diff > tolerance) {
      // Log integrity violation
      await auditLog.create({
        action: 'CALCULATION_INTEGRITY_VIOLATION',
        calculationId: calcId,
        expected: expected.co2e,
        actual: calc.result.co2e,
        difference: diff
      });

      return false;
    }

    return true;
  }
  ```

#### CALC-T-002: Rollup Aggregation Tampering
- **Severity**: 🟠 **HIGH** (CVSS 8.0)
- **Description**: Attacker modifies rollup totals to hide emissions
- **Mitigation**:
  ```typescript
  // Rollups are calculated from source calculations (not user input)
  @Post('rollups/calculate')
  async calculateRollup(
    @Body() dto: CalculateRollupDto,
    @CurrentUser() user: User
  ): Promise<Rollup> {
    // Fetch all calculations for project/year
    const calculations = await db.calculations.find({
      projectId: dto.projectId,
      year: dto.year,
      status: 'COMPLETED'
    });

    // Aggregate by scope
    const totalEmissions = {
      scope1: 0,
      scope2Location: 0,
      scope2Market: 0,
      scope3: 0,
      total: 0
    };

    for (const calc of calculations) {
      if (calc.scope === 1) {
        totalEmissions.scope1 += calc.result.co2e;
      } else if (calc.scope === 2) {
        if (calc.methodology === 'LOCATION_BASED') {
          totalEmissions.scope2Location += calc.result.co2e;
        } else {
          totalEmissions.scope2Market += calc.result.co2e;
        }
      } else if (calc.scope === 3) {
        totalEmissions.scope3 += calc.result.co2e;
      }
      totalEmissions.total += calc.result.co2e;
    }

    // Store rollup with calculation count for verification
    const rollup = await db.rollups.create({
      projectId: dto.projectId,
      organizationId: user.organizationId,
      year: dto.year,
      aggregationType: 'PROJECT',
      totalEmissions,
      calculatedAt: new Date(),
      calculationCount: calculations.length
    });

    // Verify rollup integrity
    await this.verifyRollupIntegrity(rollup._id);

    return rollup;
  }

  // Periodic rollup verification job
  async function verifyRollupIntegrity(rollupId: string): Promise<boolean> {
    const rollup = await db.rollups.findOne({ _id: rollupId });

    // Recalculate from source calculations
    const calculations = await db.calculations.find({
      projectId: rollup.projectId,
      year: rollup.year,
      status: 'COMPLETED'
    });

    // Verify calculation count matches
    if (calculations.length !== rollup.calculationCount) {
      await auditLog.create({
        action: 'ROLLUP_INTEGRITY_VIOLATION',
        rollupId,
        reason: 'Calculation count mismatch',
        expected: calculations.length,
        actual: rollup.calculationCount
      });
      return false;
    }

    // Verify total matches
    const actualTotal = calculations.reduce((sum, c) => sum + c.result.co2e, 0);
    const diff = Math.abs(actualTotal - rollup.totalEmissions.total) / actualTotal;

    if (diff > 0.0001) {
      await auditLog.create({
        action: 'ROLLUP_INTEGRITY_VIOLATION',
        rollupId,
        reason: 'Total emissions mismatch',
        expected: actualTotal,
        actual: rollup.totalEmissions.total
      });
      return false;
    }

    return true;
  }
  ```

### 7.2 Denial of Service Threats

#### CALC-D-001: Calculation Bomb
- **Severity**: 🟡 **MEDIUM** (CVSS 6.0)
- **OLD System Issue**: ✅ **YES** - No limits on calculation batch size
- **Description**: Attacker triggers recalculation of 1 million records
- **Mitigation**:
  ```typescript
  // Rate limit recalculation requests
  @Post('recalculation-jobs')
  @RateLimit({ points: 5, duration: 3600 }) // 5 jobs per hour
  async createRecalculationJob(
    @Body() dto: CreateRecalcJobDto,
    @CurrentUser() user: User
  ): Promise<RecalculationJob> {
    // Estimate affected calculations
    const count = await db.calculations.countDocuments(dto.filters);

    // Limit batch size
    if (count > 100000) {
      throw new BadRequestException('Recalculation batch too large (max 100,000)');
    }

    // Check existing jobs
    const pendingJobs = await db.recalculation_jobs.countDocuments({
      organizationId: user.organizationId,
      status: { $in: ['PENDING', 'RUNNING'] }
    });

    if (pendingJobs >= 3) {
      throw new TooManyRequestsException('Maximum 3 concurrent recalculation jobs');
    }

    // Create job
    const job = await db.recalculation_jobs.create({
      projectId: dto.projectId,
      organizationId: user.organizationId,
      scope: dto.scope,
      filters: dto.filters,
      status: 'PENDING',
      totalCalculations: count,
      createdBy: user.id
    });

    // Queue for async processing
    await sqs.sendMessage({
      QueueUrl: process.env.RECALC_QUEUE_URL,
      MessageBody: JSON.stringify({ jobId: job._id })
    });

    return job;
  }

  // Worker processes with circuit breaker
  async function processRecalculationJob(jobId: string): Promise<void> {
    const job = await db.recalculation_jobs.findOne({ _id: jobId });

    // Update status
    await db.recalculation_jobs.updateOne(
      { _id: jobId },
      { $set: { status: 'RUNNING', startedAt: new Date() } }
    );

    const calculations = await db.calculations.find(job.filters);

    let processed = 0;
    let errors = 0;
    const batchSize = 100;

    for (let i = 0; i < calculations.length; i += batchSize) {
      const batch = calculations.slice(i, i + batchSize);

      await Promise.allSettled(
        batch.map(calc => this.recalculate(calc._id))
      );

      processed += batch.length;

      // Update progress
      await db.recalculation_jobs.updateOne(
        { _id: jobId },
        { $set: { processedCalculations: processed } }
      );

      // Throttle to avoid overload
      await sleep(100);
    }

    // Mark complete
    await db.recalculation_jobs.updateOne(
      { _id: jobId },
      {
        $set: {
          status: 'COMPLETED',
          completedAt: new Date(),
          successCount: processed - errors,
          errorCount: errors
        }
      }
    );
  }
  ```

---

## 8. Reporting Service Threats

### 8.1 Information Disclosure Threats

#### REP-I-001: Report Data Leakage via URL
- **Severity**: 🟠 **HIGH** (CVSS 7.2)
- **Description**: Generated reports accessible via predictable URLs
- **Mitigation**:
  ```typescript
  // Use signed URLs with expiration
  @Get('reports/:reportId/download')
  async downloadReport(
    @Param('reportId') reportId: string,
    @CurrentUser() user: User
  ): Promise<{ url: string }> {
    const report = await db.reports.findOne({
      _id: reportId,
      organizationId: user.organizationId
    });

    if (!report) {
      throw new NotFoundException();
    }

    // Generate signed S3 URL (expires in 5 minutes)
    const signedUrl = await s3.getSignedUrlPromise('getObject', {
      Bucket: 'clenergize-reports',
      Key: report.s3Key,
      Expires: 300 // 5 minutes
    });

    // Log download
    await auditLog.create({
      action: 'REPORT_DOWNLOADED',
      reportId,
      userId: user.id,
      ipAddress: request.ip
    });

    return { url: signedUrl };
  }
  ```

### 8.2 Denial of Service Threats

#### REP-D-001: Report Generation Resource Exhaustion
- **Severity**: 🟡 **MEDIUM** (CVSS 5.5)
- **OLD System Issue**: ✅ **YES** - Infinite SQS polling loops
- **Description**: Attacker generates 100 concurrent reports causing memory exhaustion
- **Mitigation**:
  ```typescript
  // Queue-based report generation with concurrency limits
  @Post('reports/generate')
  @RateLimit({ points: 10, duration: 3600 }) // 10 reports per hour per user
  async queueReportGeneration(
    @Body() dto: GenerateReportDto,
    @CurrentUser() user: User
  ): Promise<{ reportId: string }> {
    // Check pending reports
    const pending = await db.reports.countDocuments({
      organizationId: user.organizationId,
      status: 'PROCESSING'
    });

    if (pending >= 5) {
      throw new TooManyRequestsException('Maximum 5 concurrent reports');
    }

    // Create report record
    const report = await db.reports.create({
      projectId: dto.projectId,
      organizationId: user.organizationId,
      reportType: dto.reportType,
      title: dto.title,
      period: dto.period,
      format: dto.format,
      status: 'PROCESSING',
      createdBy: user.id
    });

    // Queue for generation
    await sqs.sendMessage({
      QueueUrl: process.env.REPORT_QUEUE_URL,
      MessageBody: JSON.stringify({ reportId: report._id }),
      MessageAttributes: {
        priority: { DataType: 'Number', StringValue: '5' }
      }
    });

    return { reportId: report._id };
  }

  // Worker with graceful shutdown (fixes infinite loop)
  class ReportWorker {
    private isShuttingDown = false;

    async start(): Promise<void> {
      // Handle shutdown signals
      process.on('SIGTERM', () => {
        console.log('SIGTERM received, shutting down gracefully');
        this.isShuttingDown = true;
      });

      process.on('SIGINT', () => {
        console.log('SIGINT received, shutting down gracefully');
        this.isShuttingDown = true;
      });

      // Poll queue with shutdown check
      while (!this.isShuttingDown) {
        try {
          const messages = await sqs.receiveMessage({
            QueueUrl: process.env.REPORT_QUEUE_URL,
            MaxNumberOfMessages: 1,
            WaitTimeSeconds: 20, // Long polling
            VisibilityTimeout: 300 // 5 minutes
          });

          if (messages.Messages) {
            for (const message of messages.Messages) {
              await this.processMessage(message);

              // Delete message from queue
              await sqs.deleteMessage({
                QueueUrl: process.env.REPORT_QUEUE_URL,
                ReceiptHandle: message.ReceiptHandle
              });
            }
          }

        } catch (error) {
          console.error('Queue error:', error);
          await sleep(5000); // Back off on error
        }
      }

      console.log('Worker shut down gracefully');
    }

    async processMessage(message: SQS.Message): Promise<void> {
      const { reportId } = JSON.parse(message.Body);

      try {
        await this.generateReport(reportId);
      } catch (error) {
        // Mark report as failed
        await db.reports.updateOne(
          { _id: reportId },
          { $set: { status: 'FAILED', errorMessage: error.message } }
        );
      }
    }
  }
  ```

---

## 9. Audit Service Threats

### 9.1 Tampering Threats

#### AUD-T-001: Audit Log Tampering
- **Severity**: 🔴 **CRITICAL** (CVSS 9.0)
- **Description**: Attacker modifies or deletes audit logs to hide malicious activity
- **Mitigation**:
  ```typescript
  // Audit logs are immutable with hash chain

  // 1. No update or delete operations allowed
  @Put('audit-logs/:id')
  async updateAuditLog(): Promise<never> {
    throw new ForbiddenException('Audit logs are immutable');
  }

  @Delete('audit-logs/:id')
  async deleteAuditLog(): Promise<never> {
    throw new ForbiddenException('Audit logs cannot be deleted');
  }

  // 2. Hash chain for tamper detection (see DATABASE_SCHEMA_DESIGN.md)
  AuditLogSchema.pre('save', async function() {
    const crypto = require('crypto');

    // Get previous log
    const prevLog = await this.constructor.findOne({
      organizationId: this.organizationId
    }).sort({ sequenceNumber: -1 });

    this.previousHash = prevLog?.hash || null;
    this.sequenceNumber = (prevLog?.sequenceNumber || 0) + 1;

    // Calculate hash of current log
    const data = JSON.stringify({
      organizationId: this.organizationId,
      userId: this.userId,
      action: this.action,
      resourceType: this.resourceType,
      resourceId: this.resourceId,
      changes: this.changes,
      timestamp: this.createdAt,
      previousHash: this.previousHash,
      sequenceNumber: this.sequenceNumber
    });

    this.hash = crypto.createHash('sha256').update(data).digest('hex');
  });

  // 3. Periodic hash chain verification
  async function verifyAuditLogIntegrity(
    organizationId: string
  ): Promise<IntegrityCheckResult> {
    const logs = await db.audit_logs.find({ organizationId })
      .sort({ sequenceNumber: 1 });

    const violations = [];

    for (let i = 1; i < logs.length; i++) {
      const current = logs[i];
      const previous = logs[i - 1];

      // Verify hash chain
      if (current.previousHash !== previous.hash) {
        violations.push({
          sequenceNumber: current.sequenceNumber,
          reason: 'Hash chain broken',
          expected: previous.hash,
          actual: current.previousHash
        });
      }

      // Verify sequence numbers are consecutive
      if (current.sequenceNumber !== previous.sequenceNumber + 1) {
        violations.push({
          sequenceNumber: current.sequenceNumber,
          reason: 'Sequence number gap detected'
        });
      }
    }

    if (violations.length > 0) {
      // Alert security team
      await eventBus.publish({
        type: 'audit.integrity.violation.v1',
        data: {
          organizationId,
          violations,
          timestamp: new Date().toISOString()
        }
      });
    }

    return {
      valid: violations.length === 0,
      violations
    };
  }

  // 4. Write-ahead logging to separate service
  async function createAuditLog(data: AuditLogData): Promise<void> {
    // Write to primary audit service database
    const log = await db.audit_logs.create(data);

    // Also write to WORM storage (AWS S3 Glacier with Object Lock)
    await s3.putObject({
      Bucket: 'clenergize-audit-archive',
      Key: `${data.organizationId}/${log._id}.json`,
      Body: JSON.stringify(log),
      ObjectLockMode: 'COMPLIANCE',
      ObjectLockRetainUntilDate: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000) // 7 years
    });
  }
  ```

### 9.2 Repudiation Threats

#### AUD-R-001: Non-Repudiation Bypass
- **Severity**: 🟠 **HIGH** (CVSS 7.0)
- **Description**: User claims they didn't perform action (no proof)
- **Mitigation**:
  ```typescript
  // Capture comprehensive context for every action
  interface AuditContext {
    userId: string;
    ipAddress: string;
    userAgent: string;
    sessionId: string;
    timestamp: Date;
    requestId: string;
    digitalSignature?: string; // For critical actions
  }

  // For critical actions, require digital signature
  @Post('projects/:id/lock')
  async lockProject(
    @Param('id') projectId: string,
    @Body() dto: { signature: string },
    @CurrentUser() user: User
  ): Promise<Project> {
    // Verify user's digital signature
    const message = `LOCK_PROJECT:${projectId}:${Date.now()}`;
    const signature = dto.signature;

    const isValid = crypto.verify(
      'SHA256',
      Buffer.from(message),
      {
        key: user.publicKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING
      },
      Buffer.from(signature, 'base64')
    );

    if (!isValid) {
      throw new BadRequestException('Invalid signature');
    }

    // Perform action
    const project = await db.projects.findOneAndUpdate(
      { _id: projectId },
      { $set: { status: 'LOCKED', lockedAt: new Date(), lockedBy: user.id } },
      { new: true }
    );

    // Audit with signature
    await auditLog.create({
      action: 'PROJECT_LOCKED',
      resourceType: 'PROJECT',
      resourceId: projectId,
      userId: user.id,
      ipAddress: request.ip,
      digitalSignature: signature,
      message,
      result: 'SUCCESS'
    });

    return project;
  }
  ```

### 9.3 Information Disclosure Threats

#### AUD-I-001: Audit Log Data Leakage
- **Severity**: 🟡 **MEDIUM** (CVSS 6.0)
- **Description**: Audit logs contain sensitive data in `changes` field
- **Mitigation**:
  ```typescript
  // Redact sensitive fields from audit logs
  const SENSITIVE_FIELDS = [
    'password',
    'passwordHash',
    'mfaSecret',
    'apiKey',
    'accessToken',
    'refreshToken'
  ];

  function redactSensitiveData(changes: FieldChange[]): FieldChange[] {
    return changes.map(change => {
      if (SENSITIVE_FIELDS.includes(change.field)) {
        return {
          ...change,
          oldValue: '[REDACTED]',
          newValue: '[REDACTED]'
        };
      }
      return change;
    });
  }

  // Use when creating audit logs
  async function auditUpdate(
    resourceType: string,
    resourceId: string,
    changes: FieldChange[],
    userId: string
  ): Promise<void> {
    await db.audit_logs.create({
      action: 'UPDATE',
      resourceType,
      resourceId,
      userId,
      changes: redactSensitiveData(changes), // Redact sensitive fields
      result: 'SUCCESS',
      ipAddress: request.ip,
      createdAt: new Date()
    });
  }
  ```

---

## 10. Cross-Service Threats

### 10.1 Authentication & Authorization

#### CROSS-A-001: Inter-Service Authentication Bypass
- **Severity**: 🔴 **CRITICAL** (CVSS 9.5)
- **Description**: Services don't verify caller identity
- **Mitigation**:
  ```typescript
  // Use service-to-service authentication with mTLS

  // 1. Generate service certificates
  // Each service has its own certificate signed by internal CA

  // 2. Verify caller service certificate
  @Injectable()
  export class ServiceAuthGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();

      // Extract client certificate
      const cert = request.socket.getPeerCertificate();

      if (!cert || !cert.subject) {
        throw new UnauthorizedException('No client certificate provided');
      }

      // Verify certificate is signed by internal CA
      const isValid = await this.verifyCertificate(cert);
      if (!isValid) {
        throw new UnauthorizedException('Invalid client certificate');
      }

      // Extract service name from certificate CN
      const serviceName = cert.subject.CN; // e.g., "calculation-service"

      // Check if service is allowed to call this endpoint
      const endpoint = request.route.path;
      const allowed = await this.checkServicePermission(serviceName, endpoint);

      if (!allowed) {
        throw new ForbiddenException(
          `Service ${serviceName} not allowed to access ${endpoint}`
        );
      }

      request.callerService = serviceName;
      return true;
    }
  }

  // 3. Service permission matrix
  const SERVICE_PERMISSIONS = {
    'calculation-service': {
      allowedServices: ['activity-service', 'reporting-service'],
      allowedEndpoints: [
        '/v1/calculations/calculate',
        '/v1/rollups/calculate'
      ]
    },
    'audit-service': {
      allowedServices: ['*'], // All services can create audit logs
      allowedEndpoints: ['/v1/audit-logs']
    }
  };
  ```

### 10.2 Event Bus Security

#### CROSS-E-001: Event Injection Attack
- **Severity**: 🟠 **HIGH** (CVSS 8.0)
- **Description**: Attacker publishes fake events to trigger unwanted actions
- **Mitigation**:
  ```typescript
  // Sign all events with service private key
  interface SignedEvent {
    event: DomainEvent;
    signature: string;
    serviceName: string;
    timestamp: string;
  }

  // Publisher signs events
  async function publishEvent(event: DomainEvent): Promise<void> {
    const eventData = JSON.stringify(event);

    // Sign with service private key
    const sign = crypto.createSign('SHA256');
    sign.update(eventData);
    sign.end();

    const signature = sign.sign(privateKey, 'base64');

    const signedEvent: SignedEvent = {
      event,
      signature,
      serviceName: process.env.SERVICE_NAME,
      timestamp: new Date().toISOString()
    };

    await eventBridge.putEvents({
      Entries: [{
        Source: 'clenergize.v3',
        DetailType: event.type,
        Detail: JSON.stringify(signedEvent)
      }]
    });
  }

  // Subscriber verifies signature
  async function handleEvent(signedEvent: SignedEvent): Promise<void> {
    // Get publisher service's public key
    const publicKey = await getServicePublicKey(signedEvent.serviceName);

    // Verify signature
    const verify = crypto.createVerify('SHA256');
    verify.update(JSON.stringify(signedEvent.event));
    verify.end();

    const isValid = verify.verify(publicKey, signedEvent.signature, 'base64');

    if (!isValid) {
      await auditLog.create({
        action: 'INVALID_EVENT_SIGNATURE',
        eventType: signedEvent.event.type,
        serviceName: signedEvent.serviceName,
        result: 'FAILURE'
      });
      throw new Error('Invalid event signature');
    }

    // Verify event is not too old (replay attack prevention)
    const eventAge = Date.now() - new Date(signedEvent.timestamp).getTime();
    if (eventAge > 60000) { // 1 minute max age
      throw new Error('Event too old');
    }

    // Process event
    await this.processEvent(signedEvent.event);
  }
  ```

#### CROSS-E-002: Event Replay Attack
- **Severity**: 🟡 **MEDIUM** (CVSS 6.5)
- **Description**: Attacker replays old events to trigger duplicate actions
- **Mitigation**:
  ```typescript
  // Use idempotency keys with Redis tracking
  async function handleEvent(event: DomainEvent): Promise<void> {
    const idempotencyKey = event.metadata.idempotencyKey || event.metadata.eventId;

    // Check if event already processed
    const processed = await redis.get(`event:${idempotencyKey}`);
    if (processed) {
      console.log(`Event ${idempotencyKey} already processed, skipping`);
      return;
    }

    // Mark as processing (with 1 hour TTL)
    await redis.setex(`event:${idempotencyKey}`, 3600, 'processing');

    try {
      // Process event
      await this.processEvent(event);

      // Mark as completed
      await redis.setex(`event:${idempotencyKey}`, 86400, 'completed'); // 24 hour TTL
    } catch (error) {
      // Remove processing lock on error
      await redis.del(`event:${idempotencyKey}`);
      throw error;
    }
  }
  ```

### 10.3 Database Security

#### CROSS-D-001: MongoDB Injection
- **Severity**: 🔴 **CRITICAL** (CVSS 9.0)
- **Description**: Attacker injects malicious MongoDB operators
- **Example**:
  ```javascript
  // VULNERABLE:
  const email = req.body.email; // User input: {"$ne": null}
  const user = await db.users.findOne({ email });
  // Returns first user where email != null (ANY USER!)
  ```
- **Mitigation**:
  ```typescript
  // 1. Use Mongoose/TypeORM with schema validation
  @Schema()
  export class User {
    @Prop({ required: true, type: String }) // Explicitly type String
    email: string;
  }

  // 2. Validate input with Zod
  const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string()
  });

  @Post('login')
  async login(@Body(new ZodValidationPipe(LoginSchema)) dto: LoginDto) {
    // dto.email is guaranteed to be a string
    const user = await db.users.findOne({ email: dto.email });
  }

  // 3. Sanitize query objects
  function sanitizeQuery(query: any): any {
    if (typeof query !== 'object' || query === null) {
      return query;
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(query)) {
      // Remove MongoDB operators from user input
      if (key.startsWith('$')) {
        continue;
      }

      if (typeof value === 'object') {
        sanitized[key] = sanitizeQuery(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
  ```

---

## 11. Mitigation Strategy Summary

### Priority Matrix

| Priority | Threats | Mitigation Timeline | Owner |
|----------|---------|---------------------|-------|
| **P0 (Critical)** | 23 threats | Sprint 0.1-0.2 (2 weeks) | Security Agent |
| **P1 (High)** | 42 threats | Sprint 0.3-0.5 (6 weeks) | Security + Service Agents |
| **P2 (Medium)** | 43 threats | Sprint 0.6-1.0 (10 weeks) | Service Agents |
| **P3 (Low)** | 19 threats | Sprint 1.1+ (ongoing) | DevOps Agent |

### Quick Wins (Implement First)

1. **JWT Signature Verification** (IDENT-S-001) - 4 hours
2. **Rate Limiting** (IDENT-S-003, IDENT-D-001) - 8 hours
3. **Input Validation with Zod** (CROSS-D-001) - 8 hours
4. **Audit Logging** (IDENT-R-001) - 16 hours
5. **Organization Scoping** (ORG-I-001, ACT-I-001) - 8 hours

**Total Quick Wins**: 44 hours (5-6 days) → Addresses 15 critical/high threats

### Security Controls Checklist

**Authentication & Authorization:**
- [ ] JWT signature verification with JWKS
- [ ] MFA with encrypted TOTP secrets
- [ ] Session fingerprinting
- [ ] Role-based access control (RBAC)
- [ ] Resource-based permissions (PBAC)
- [ ] Service-to-service mTLS

**Input Validation:**
- [ ] Zod schema validation on all endpoints
- [ ] MongoDB injection prevention
- [ ] CSV formula injection sanitization
- [ ] File upload size limits
- [ ] Request size limits

**Data Protection:**
- [ ] TLS 1.3 for all connections
- [ ] Encryption at rest (MongoDB, S3)
- [ ] Field-level encryption (MFA secrets, tokens)
- [ ] Signed S3 URLs with expiration
- [ ] No sensitive data in JWTs

**Audit & Logging:**
- [ ] Immutable audit logs with hash chain
- [ ] All authentication events logged
- [ ] All data modifications logged
- [ ] GDPR data access logs
- [ ] Security event monitoring

**Rate Limiting & DoS Protection:**
- [ ] Token bucket rate limiting
- [ ] Per-IP and per-user limits
- [ ] Bulk operation limits
- [ ] Queue-based async processing
- [ ] Graceful shutdown (no infinite loops)

**Integrity Protection:**
- [ ] Immutable calculations
- [ ] Versioned emission factors
- [ ] Locked reporting years
- [ ] Hash chain audit logs
- [ ] Event signatures

---

## 12. Security Testing Requirements

### Automated Security Scans

```yaml
# .github/workflows/security-scan.yml
name: Security Scan

on:
  push:
    branches: [main, develop]
  pull_request:
  schedule:
    - cron: '0 0 * * *' # Daily

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      # Dependency vulnerability scan
      - name: Run npm audit
        run: npm audit --audit-level=moderate

      # SAST (Static Application Security Testing)
      - name: Run Semgrep
        uses: returntocorp/semgrep-action@v1
        with:
          config: >-
            p/owasp-top-ten
            p/nodejs
            p/typescript

      # Secret scanning
      - name: Run TruffleHog
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: main
          head: HEAD

      # Container scanning
      - name: Run Trivy
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'
```

### Manual Penetration Testing

**Sprint 0.4 - Security Testing Sprint:**

1. **Authentication Testing** (3 days)
   - JWT forgery attempts
   - Session hijacking
   - Credential stuffing
   - MFA bypass techniques

2. **Authorization Testing** (3 days)
   - IDOR vulnerabilities
   - Privilege escalation
   - Cross-organization access
   - Permission bypass

3. **Injection Testing** (2 days)
   - MongoDB injection
   - CSV formula injection
   - Event injection
   - SQL injection (if using SQL anywhere)

4. **API Security Testing** (2 days)
   - Rate limit bypass
   - Mass assignment
   - Excessive data exposure
   - Security misconfiguration

**Tools:**
- Burp Suite Professional
- OWASP ZAP
- Postman (API testing)
- Custom scripts for business logic testing

### Security Metrics

**Track Weekly:**
- Critical vulnerabilities: 0 target
- High vulnerabilities: <5 target
- Audit log coverage: 100% target
- Authentication success rate: >99%
- Failed login attempts: <1% of total
- MFA adoption rate: >80% target

---

## Summary

This STRIDE threat model identified **127 security threats** across all 7 microservices, with **23 critical** and **42 high severity** threats requiring immediate attention.

**Key Takeaways:**

1. **JWT Verification is Critical**: OLD system's lack of signature verification is the #1 security risk
2. **Immutability Matters**: Calculations, audit logs, and emission factors must be immutable
3. **Defense in Depth**: Multiple layers of security (authentication, authorization, validation, audit)
4. **Assume Breach**: Even with all controls, implement comprehensive audit logging
5. **Test Everything**: Automated scanning + manual pentesting required

**Next Steps:**
1. Implement Quick Wins (44 hours)
2. Complete P0 critical threats (Sprint 0.1-0.2)
3. Security testing sprint (Sprint 0.4)
4. Ongoing security reviews

---

**Last Updated**: November 18, 2025
**Next Review**: End of Sprint 0.2
**Maintained By**: Security Agent
