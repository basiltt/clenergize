# Security Commands

## Authentication & Authorization Commands

### /verify-jwt [token]
Verify JWT token with proper JWKS validation.

**Usage**: `/verify-jwt "eyJhbGciOiJSUzI1NiIs..."`

**Output**:
```
Token Status: ✅ VALID
Algorithm: RS256
Issuer: https://cognito.amazonaws.com/us-east-1_xxxxx
Audience: clenergize-api
Subject: user-123
Expiry: 2025-11-15T14:30:00Z
Claims: {
  "email": "user@example.com",
  "roles": ["admin", "project-manager"],
  "organizationId": "org-456"
}
Key ID: 48f7e3a9-2b4f-4c89-b123-456def789abc
Signature: VERIFIED ✅
```

### /scan-secrets [path]
Scan for hardcoded secrets and credentials.

**Usage**: `/scan-secrets NEW/identity-service`

**Detects**:
- Hardcoded API keys
- JWT secrets in code
- Database passwords
- AWS credentials
- Private keys
- Default fallback values

**Output**:
```
Scanning: NEW/identity-service
❌ CRITICAL: Hardcoded secret found
File: src/config/auth.config.ts:15
Line: const secret = process.env.JWT_SECRET || 'default-secret'
Fix: Remove fallback value, use proper secrets management

❌ WARNING: Potential API key detected
File: src/services/external.service.ts:8
Line: headers: { 'x-api-key': 'sk_test_4242424242' }
Fix: Move to environment variables or AWS Secrets Manager

Summary: 2 issues found (1 critical, 1 warning)
```

### /security-audit [service]
Comprehensive security audit of a service.

**Usage**: `/security-audit identity-service`

**Checks Performed**:
```
Authentication:
✅ JWT verification implemented correctly
✅ JWKS client configured with caching
✅ Token expiry validation
❌ Missing rate limiting on auth endpoints

Authorization:
✅ RBAC implementation present
✅ Permission checks on all endpoints
⚠️ Some admin endpoints lack audit logging

Secrets Management:
✅ Using AWS Secrets Manager
✅ No hardcoded credentials
✅ Environment variables properly configured

Input Validation:
✅ Class-validator on all DTOs
✅ SQL injection prevention
⚠️ Missing XSS sanitization on user inputs

Dependencies:
❌ 3 packages with known vulnerabilities
- express-jwt@5.3.1 (CVE-2022-xxxxx)
- mongodb@3.6.0 (outdated)
- bcrypt@3.0.0 (upgrade available)

Network Security:
✅ HTTPS enforced
✅ CORS properly configured
⚠️ Missing CSP headers

Overall Score: 7.5/10
Priority Fixes: Rate limiting, dependency updates
```

### /fix-jwt-vulnerability [service]
Fix JWT decode without verification (C1 issue).

**Usage**: `/fix-jwt-vulnerability identity-service`

**Actions**:
1. Searches for all jwt.decode() usage
2. Replaces with jwt.verify()
3. Adds JWKS client configuration
4. Implements proper error handling
5. Updates tests

**Before**:
```typescript
const payload = jwt.decode(token); // VULNERABLE!
```

**After**:
```typescript
const key = await jwksClient.getSigningKey(kid);
const payload = jwt.verify(token, key.getPublicKey(), {
  algorithms: ['RS256'],
  issuer: process.env.JWT_ISSUER,
  audience: process.env.JWT_AUDIENCE
});
```

## Encryption & Secrets Commands

### /rotate-secrets [service]
Rotate all secrets for a service.

**Usage**: `/rotate-secrets calculation-service`

**Actions**:
1. Generates new JWT signing keys
2. Updates AWS Secrets Manager
3. Rotates database passwords
4. Updates API keys
5. Triggers rolling deployment
6. Maintains zero downtime

### /encrypt-pii [service] [field]
Implement PII encryption for sensitive fields.

**Usage**: `/encrypt-pii identity-service email`

**Implementation**:
```typescript
class EncryptedField {
  @Transform(({ value }) => encrypt(value), { toPlainOnly: true })
  @Transform(({ value }) => decrypt(value), { toClassOnly: true })
  email: string;
}

// Automatic encryption/decryption on database operations
// Uses AWS KMS for key management
// Searchable encryption with blind indexes
```

### /generate-api-key [service] [scope]
Generate secure API key with scoped permissions.

**Usage**: `/generate-api-key reporting-service read-only`

**Output**:
```
API Key Generated:
Key: clnz_live_4f3a8b9c2d1e5f6g7h8i9j0k
Prefix: clnz_live (identifiable)
Service: reporting-service
Scope: read-only
Permissions: [
  "reports:read",
  "calculations:read",
  "projects:read"
]
Rate Limit: 1000 req/hour
Expires: 2026-11-15T00:00:00Z

Store this key securely. It cannot be retrieved again.
```

## Vulnerability Management Commands

### /dependency-check [service]
Check for vulnerable dependencies.

**Usage**: `/dependency-check organization-service`

**Output**:
```
Running npm audit...

Critical: 0
High: 2
Medium: 5
Low: 8

High Severity:
1. jsonwebtoken < 9.0.0
   Vulnerability: Improper Verification of Cryptographic Signature
   Current: 8.5.1 → Upgrade to: 9.0.2

2. mongodb < 5.0.0
   Vulnerability: Prototype Pollution
   Current: 4.17.2 → Upgrade to: 5.9.0

Auto-fix available: npm audit fix
Manual review needed: 2 breaking changes
```

### /penetration-test [service]
Run automated penetration testing.

**Usage**: `/penetration-test identity-service`

**Tests**:
- SQL/NoSQL injection
- XSS attacks
- CSRF vulnerabilities
- Authentication bypass
- Authorization flaws
- Rate limiting bypass
- Input validation
- File upload vulnerabilities

### /compliance-check [standard]
Check compliance with security standards.

**Usage**: `/compliance-check OWASP`

**Standards Supported**:
- `OWASP`: OWASP Top 10
- `PCI-DSS`: Payment Card Industry
- `GDPR`: Data protection
- `SOC2`: Security controls
- `ISO27001`: Information security

## Access Control Commands

### /setup-rbac [service]
Configure Role-Based Access Control.

**Usage**: `/setup-rbac organization-service`

**Generated Structure**:
```typescript
enum Role {
  SUPER_ADMIN = 'super_admin',
  ORG_ADMIN = 'org_admin',
  PROJECT_MANAGER = 'project_manager',
  DATA_ANALYST = 'data_analyst',
  VIEWER = 'viewer'
}

enum Permission {
  // Projects
  PROJECT_CREATE = 'project:create',
  PROJECT_READ = 'project:read',
  PROJECT_UPDATE = 'project:update',
  PROJECT_DELETE = 'project:delete',

  // Reports
  REPORT_GENERATE = 'report:generate',
  REPORT_EXPORT = 'report:export'
}

const RolePermissions = {
  [Role.SUPER_ADMIN]: ['*'],
  [Role.ORG_ADMIN]: [
    'project:*',
    'report:*',
    'user:*'
  ],
  [Role.PROJECT_MANAGER]: [
    'project:read',
    'project:update',
    'report:generate'
  ]
};
```

### /audit-log [action] [resource]
Query security audit logs.

**Usage**: `/audit-log failed-login user`

**Output**:
```
Security Audit Log - Failed Login Attempts
Period: Last 24 hours

1. 2025-11-15T10:30:45Z
   User: john@example.com
   IP: 192.168.1.50
   Reason: Invalid password
   Attempts: 3

2. 2025-11-15T09:15:23Z
   User: admin@company.com
   IP: 203.0.113.45
   Reason: Account locked
   Attempts: 5

Summary: 2 failed login incidents
Action: Consider implementing 2FA
```

## Network Security Commands

### /configure-cors [service] [origins]
Configure CORS policy for a service.

**Usage**: `/configure-cors identity-service "https://app.clenergize.com,https://staging.clenergize.com"`

**Configuration**:
```typescript
const corsOptions = {
  origin: [
    'https://app.clenergize.com',
    'https://staging.clenergize.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Request-Id'],
  maxAge: 86400 // 24 hours
};
```

### /rate-limit [service] [endpoint] [limit]
Configure rate limiting for endpoints.

**Usage**: `/rate-limit identity-service "/auth/login" "5/minute"`

**Implementation**:
```typescript
@UseGuards(RateLimitGuard)
@RateLimit({
  window: 60,
  limit: 5,
  keyGenerator: (req) => req.ip,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many attempts. Please try again later.'
    });
  }
})
@Post('/auth/login')
async login(@Body() dto: LoginDto) { }
```

## Incident Response Commands

### /security-incident [type] [severity]
Report and handle security incident.

**Usage**: `/security-incident data-breach critical`

**Actions**:
1. Logs incident with timestamp
2. Notifies security team
3. Initiates response protocol
4. Creates incident ticket
5. Starts evidence collection
6. Generates initial report

### /quarantine-service [name]
Quarantine a compromised service.

**Usage**: `/quarantine-service calculation-service`

**Actions**:
1. Removes service from load balancer
2. Blocks all incoming traffic
3. Preserves current state
4. Enables detailed logging
5. Notifies operations team
6. Initiates investigation mode

## Monitoring Commands

### /security-metrics
Display security metrics dashboard.

**Usage**: `/security-metrics`

**Output**:
```
Security Metrics Dashboard
═══════════════════════════════════════

Authentication:
├─ Successful Logins: 1,234 (98.5%)
├─ Failed Logins: 18 (1.5%)
├─ Active Sessions: 456
└─ 2FA Adoption: 67%

API Security:
├─ Valid Requests: 45,678 (99.2%)
├─ Blocked Requests: 367 (0.8%)
├─ Rate Limited: 23
└─ Malformed: 12

Vulnerabilities:
├─ Critical: 0 ✅
├─ High: 2 ⚠️
├─ Medium: 5
└─ Low: 12

Compliance:
├─ OWASP Score: 8.5/10
├─ Last Audit: 2025-11-10
└─ Next Audit: 2025-12-10
```

### /threat-detection [enable|disable]
Toggle real-time threat detection.

**Usage**: `/threat-detection enable`

**Features**:
- Anomaly detection
- Brute force protection
- Pattern recognition
- Behavioral analysis
- Automated blocking
- Alert generation