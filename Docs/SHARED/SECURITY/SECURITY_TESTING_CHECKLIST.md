# Security Testing Checklist
**Clenergize V3 - OWASP Top 10 & Security Hardening**

**Version**: 1.0.0
**Last Updated**: November 18, 2025
**Owner**: Security Agent
**Status**: Implementation Ready
**Sprint**: 0.2

---

## Table of Contents
1. [Overview](#overview)
2. [OWASP Top 10 (2021)](#owasp-top-10-2021)
3. [Authentication Testing](#authentication-testing)
4. [Authorization Testing](#authorization-testing)
5. [Input Validation Testing](#input-validation-testing)
6. [API Security Testing](#api-security-testing)
7. [Infrastructure Security](#infrastructure-security)
8. [Automated Security Scanning](#automated-security-scanning)
9. [Penetration Testing](#penetration-testing)
10. [Security Regression Tests](#security-regression-tests)

---

## 1. Overview

### Purpose

This checklist ensures all Clenergize V3 services meet security requirements before production deployment. Every service **MUST** pass all checks before release.

### Security Sign-Off Process

```
Developer completes → Security Agent reviews → Automated scans pass → Manual pen test → Production deployment
```

### Severity Levels

| Severity | Definition | Action Required |
|----------|------------|-----------------|
| **CRITICAL** | Remote code execution, data breach | Block deployment, immediate fix |
| **HIGH** | Authentication bypass, privilege escalation | Fix before deployment |
| **MEDIUM** | Information disclosure, DoS | Fix in next sprint |
| **LOW** | Minor info leak, best practice | Fix when convenient |

---

## 2. OWASP Top 10 (2021)

### A01:2021 – Broken Access Control

**Risk**: Users can access resources they shouldn't.

#### Test Cases

**Test 1.1: Horizontal Privilege Escalation**
```bash
# User A tries to access User B's data
curl -H "Authorization: Bearer user_a_token" \
  https://api.clenergize.com/api/v1/users/user_b_id

# Expected: 403 Forbidden
# Actual: _______________
```

**Test 1.2: Vertical Privilege Escalation**
```bash
# VIEWER role tries to perform ADMIN action
curl -X POST \
  -H "Authorization: Bearer viewer_token" \
  -H "Content-Type: application/json" \
  -d '{"email": "new@example.com", "role": "ADMIN"}' \
  https://api.clenergize.com/api/v1/users

# Expected: 403 Forbidden (insufficient permissions)
# Actual: _______________
```

**Test 1.3: Direct Object Reference**
```bash
# Try accessing project without membership
curl -H "Authorization: Bearer token" \
  https://api.clenergize.com/api/v1/projects/other_project_id

# Expected: 403 Forbidden
# Actual: _______________
```

**Test 1.4: Path Traversal**
```bash
# Try accessing files outside allowed directory
curl -H "Authorization: Bearer token" \
  https://api.clenergize.com/api/v1/files/../../../etc/passwd

# Expected: 400 Bad Request (invalid path)
# Actual: _______________
```

**Checklist**:
- [ ] All endpoints verify user identity (JWT token required)
- [ ] All write operations check user permissions (RBAC enforced)
- [ ] Project-level access control prevents cross-project data access
- [ ] Role-based endpoints reject unauthorized roles
- [ ] No direct object references without ownership validation

---

### A02:2021 – Cryptographic Failures

**Risk**: Sensitive data exposed due to weak encryption.

#### Test Cases

**Test 2.1: JWT Signature Verification**
```bash
# Try using tampered JWT token
curl -H "Authorization: Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c2VyMTIzIn0.invalid_signature" \
  https://api.clenergize.com/api/v1/users/me

# Expected: 401 Unauthorized (invalid signature)
# Actual: _______________
```

**Test 2.2: Secrets in Logs**
```bash
# Check application logs for sensitive data
grep -r "password\|secret\|token" /var/log/clenergize/

# Expected: No matches (secrets redacted)
# Actual: _______________
```

**Test 2.3: HTTPS Enforcement**
```bash
# Try HTTP request
curl http://api.clenergize.com/api/v1/users/me

# Expected: 301 Redirect to HTTPS or connection refused
# Actual: _______________
```

**Test 2.4: Database Connection Encryption**
```typescript
// Check MongoDB connection uses TLS
const mongoUri = process.env.MONGODB_URI;
console.log(mongoUri.includes('ssl=true')); // Should be true
```

**Checklist**:
- [ ] JWT tokens verified with JWKS (not decoded without signature check)
- [ ] All secrets stored in AWS Secrets Manager (no hardcoding)
- [ ] No default fallback values for secrets
- [ ] TLS 1.3 enforced for all external connections
- [ ] Database connections use SSL/TLS
- [ ] Sensitive fields (passwords, tokens) never logged
- [ ] PII data encrypted at rest (AES-256)

---

### A03:2021 – Injection

**Risk**: Attackers inject malicious code into queries.

#### Test Cases

**Test 3.1: NoSQL Injection (MongoDB)**
```bash
# Try MongoDB injection in query parameter
curl -H "Authorization: Bearer token" \
  'https://api.clenergize.com/api/v1/users?email[$ne]=null'

# Expected: 400 Bad Request (invalid query)
# Actual: _______________
```

**Test 3.2: Command Injection**
```bash
# Try command injection in file upload
curl -X POST \
  -H "Authorization: Bearer token" \
  -F "file=@test.txt;filename=test.txt; rm -rf /" \
  https://api.clenergize.com/api/v1/files

# Expected: 400 Bad Request (invalid filename)
# Actual: _______________
```

**Test 3.3: XSS (Cross-Site Scripting)**
```bash
# Try injecting script tag in user input
curl -X POST \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{"comment": "<script>alert(1)</script>"}' \
  https://api.clenergize.com/api/v1/activity-data/stationary-combustion/123/comments

# Expected: 400 Bad Request (HTML not allowed) OR escaped on output
# Actual: _______________
```

**Test 3.4: SQL Injection (if any SQL used)**
```bash
# Try SQL injection
curl "https://api.clenergize.com/api/v1/reports?year=2025' OR '1'='1"

# Expected: 400 Bad Request (invalid input)
# Actual: _______________
```

**Checklist**:
- [ ] All MongoDB queries use parameterized queries (no string concatenation)
- [ ] Input validation with Zod schemas on all endpoints
- [ ] User input sanitized before database operations
- [ ] File upload filenames sanitized (alphanumeric only)
- [ ] HTML entities escaped in all user-generated content
- [ ] No eval() or dynamic code execution

---

### A04:2021 – Insecure Design

**Risk**: Fundamental flaws in system design.

#### Test Cases

**Test 4.1: Rate Limiting**
```bash
# Send 1000 requests in 1 minute
for i in {1..1000}; do
  curl -H "Authorization: Bearer token" \
    https://api.clenergize.com/api/v1/users/me &
done

# Expected: After 100 requests, receive 429 Too Many Requests
# Actual: _______________
```

**Test 4.2: Brute Force Protection**
```bash
# Try 10 failed login attempts
for i in {1..10}; do
  curl -X POST \
    -H "Content-Type: application/json" \
    -d '{"email": "user@example.com", "password": "wrong"}' \
    https://api.clenergize.com/api/v1/auth/login
done

# Expected: After 5 attempts, receive 429 Too Many Requests or account locked
# Actual: _______________
```

**Test 4.3: Session Management**
```bash
# Check JWT token expiration
# Decode JWT and verify exp claim

# Expected: Expiration < 1 hour for access tokens
# Actual: _______________
```

**Test 4.4: Business Logic Flaws**
```typescript
// Test negative quantity
await activityDataApi.create({
  quantityConsumed: -100,  // Negative value
  // ... other fields
});

// Expected: 400 Bad Request (validation error)
// Actual: _______________
```

**Checklist**:
- [ ] Rate limiting enforced (100 req/min per user)
- [ ] Brute force protection on authentication (5 attempts = lockout)
- [ ] JWT tokens expire within 1 hour
- [ ] Refresh tokens rotate on use
- [ ] Business logic prevents invalid states (negative quantities, etc.)
- [ ] No infinite loops (SQS polling has circuit breaker)

---

### A05:2021 – Security Misconfiguration

**Risk**: Default configs, verbose errors, unnecessary features.

#### Test Cases

**Test 5.1: Error Information Disclosure**
```bash
# Trigger server error
curl -X POST \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}' \
  https://api.clenergize.com/api/v1/users

# Expected: Generic error (no stack trace)
# Actual: _______________
```

**Test 5.2: Server Header Disclosure**
```bash
# Check response headers
curl -I https://api.clenergize.com/api/v1/users/me

# Expected: No "X-Powered-By", "Server" headers (or generic values)
# Actual: _______________
```

**Test 5.3: Directory Listing**
```bash
# Try accessing directory
curl https://api.clenergize.com/uploads/

# Expected: 403 Forbidden (directory listing disabled)
# Actual: _______________
```

**Test 5.4: Default Credentials**
```bash
# Try logging in with default credentials
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@admin.com", "password": "admin"}' \
  https://api.clenergize.com/api/v1/auth/login

# Expected: 401 Unauthorized (no default accounts exist)
# Actual: _______________
```

**Checklist**:
- [ ] No stack traces in production error responses
- [ ] Server version headers removed or generic
- [ ] Directory listing disabled
- [ ] No default accounts (admin/admin, etc.)
- [ ] Unnecessary HTTP methods disabled (OPTIONS, TRACE)
- [ ] Security headers configured (HSTS, CSP, X-Frame-Options)
- [ ] CORS configured with specific origins (no wildcards)

---

### A06:2021 – Vulnerable and Outdated Components

**Risk**: Exploitable vulnerabilities in dependencies.

#### Test Cases

**Test 6.1: npm Audit**
```bash
cd services/identity-service
npm audit

# Expected: 0 high/critical vulnerabilities
# Actual: _______________
```

**Test 6.2: Dependency Scanning (Snyk)**
```bash
snyk test

# Expected: No high/critical vulnerabilities
# Actual: _______________
```

**Test 6.3: Container Image Scanning (Trivy)**
```bash
trivy image clenergize/identity-service:latest

# Expected: No high/critical vulnerabilities
# Actual: _______________
```

**Test 6.4: Outdated Dependencies**
```bash
npm outdated

# Expected: No major version updates available (or known vulnerabilities)
# Actual: _______________
```

**Checklist**:
- [ ] npm audit shows 0 high/critical vulnerabilities
- [ ] All dependencies up-to-date or patched
- [ ] Container images scanned (Trivy/Snyk)
- [ ] Base images from trusted sources (official Docker Hub)
- [ ] Automated dependency scanning in CI/CD
- [ ] Software Bill of Materials (SBOM) generated

---

### A07:2021 – Identification and Authentication Failures

**Risk**: Weak authentication allows account takeover.

#### Test Cases

**Test 7.1: Weak Password Policy**
```bash
# Try creating user with weak password
curl -X POST \
  -H "Authorization: Bearer admin_token" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "123"}' \
  https://api.clenergize.com/api/v1/users

# Expected: 400 Bad Request (password too weak)
# Actual: _______________
```

**Test 7.2: Account Enumeration**
```bash
# Try login with non-existent email
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"email": "nonexistent@example.com", "password": "test"}' \
  https://api.clenergize.com/api/v1/auth/login

# Expected: Generic error (don't reveal if email exists)
# Actual: _______________
```

**Test 7.3: Session Fixation**
```bash
# Try reusing old JWT token after logout
curl -H "Authorization: Bearer old_token_after_logout" \
  https://api.clenergize.com/api/v1/users/me

# Expected: 401 Unauthorized (token revoked)
# Actual: _______________
```

**Test 7.4: Multi-Factor Authentication**
```bash
# Check if MFA is enforced for admins
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "ValidP@ssw0rd"}' \
  https://api.clenergize.com/api/v1/auth/login

# Expected: MFA challenge required (not immediate access)
# Actual: _______________
```

**Checklist**:
- [ ] Password minimum length: 8 characters
- [ ] Password complexity: uppercase, lowercase, number, special char
- [ ] Account enumeration prevented (generic error messages)
- [ ] JWT tokens invalidated on logout (blacklist or short expiration)
- [ ] MFA enforced for admins (Cognito MFA)
- [ ] Password reset tokens expire after 15 minutes
- [ ] No password hints or security questions

---

### A08:2021 – Software and Data Integrity Failures

**Risk**: Untrusted data or code execution.

#### Test Cases

**Test 8.1: Unsigned Updates**
```bash
# Check if updates are signed
# (CI/CD pipeline should sign Docker images)

# Expected: All images signed with GPG key
# Actual: _______________
```

**Test 8.2: Insecure Deserialization**
```typescript
// Try sending malicious serialized object
const maliciousPayload = serialize({ __proto__: { isAdmin: true } });

fetch('/api/v1/users', {
  method: 'POST',
  body: maliciousPayload
});

// Expected: 400 Bad Request (invalid payload)
// Actual: _______________
```

**Test 8.3: CI/CD Pipeline Tampering**
```bash
# Verify CI/CD pipeline integrity
# Check GitHub Actions workflow has required approvals

# Expected: All deployments require approval
# Actual: _______________
```

**Test 8.4: Package Integrity**
```bash
# Check package-lock.json integrity
npm ci --audit=true

# Expected: All packages verified with checksums
# Actual: _______________
```

**Checklist**:
- [ ] Docker images signed and verified
- [ ] No eval() or unsafe deserialization
- [ ] CI/CD pipeline requires code review + approval
- [ ] package-lock.json committed (deterministic builds)
- [ ] NPM packages verified with checksums
- [ ] No execution of untrusted code (e.g., user-uploaded scripts)

---

### A09:2021 – Security Logging and Monitoring Failures

**Risk**: Attacks go undetected.

#### Test Cases

**Test 9.1: Failed Login Attempts Logged**
```bash
# Try failed login
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "wrong"}' \
  https://api.clenergize.com/api/v1/auth/login

# Check logs for event
grep "authentication_failed" /var/log/clenergize/identity-service.log

# Expected: Log entry with timestamp, email, IP address
# Actual: _______________
```

**Test 9.2: Security Events Logged**
```bash
# Check if security events are logged
# - Privilege escalation attempts
# - Unauthorized access attempts
# - Data export events

# Expected: All security events in audit log
# Actual: _______________
```

**Test 9.3: Log Tampering Protection**
```bash
# Try modifying log files
echo "fake log entry" >> /var/log/clenergize/identity-service.log

# Expected: Permission denied (logs immutable)
# Actual: _______________
```

**Test 9.4: Alerting**
```bash
# Trigger security alert (e.g., 10 failed logins)
# Check if alert sent to PagerDuty/Slack

# Expected: Alert received within 1 minute
# Actual: _______________
```

**Checklist**:
- [ ] All authentication attempts logged (success and failure)
- [ ] Authorization failures logged (403 Forbidden)
- [ ] Security-relevant events logged (role changes, data exports, etc.)
- [ ] Logs include: timestamp, user ID, IP, correlation ID, action
- [ ] Logs immutable (read-only after written)
- [ ] CloudWatch alerts configured for security events
- [ ] Log retention: 90 days minimum
- [ ] Sensitive data redacted from logs (passwords, tokens)

---

### A10:2021 – Server-Side Request Forgery (SSRF)

**Risk**: Attacker forces server to make requests to internal resources.

#### Test Cases

**Test 10.1: Internal Resource Access**
```bash
# Try accessing AWS metadata endpoint
curl -X POST \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{"url": "http://169.254.169.254/latest/meta-data/"}' \
  https://api.clenergize.com/api/v1/webhooks

# Expected: 400 Bad Request (internal URLs blocked)
# Actual: _______________
```

**Test 10.2: Port Scanning**
```bash
# Try scanning internal ports
curl -X POST \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{"url": "http://localhost:22"}' \
  https://api.clenergize.com/api/v1/webhooks

# Expected: 400 Bad Request (localhost blocked)
# Actual: _______________
```

**Test 10.3: DNS Rebinding**
```bash
# Try DNS rebinding attack
# (Advanced test - requires custom DNS server)

# Expected: URL validation prevents DNS rebinding
# Actual: _______________
```

**Checklist**:
- [ ] User-provided URLs validated (allowlist of domains)
- [ ] Internal IP ranges blocked (127.0.0.0/8, 10.0.0.0/8, 192.168.0.0/16, 169.254.169.254)
- [ ] No direct execution of user-provided URLs
- [ ] Webhook URLs validated before making requests
- [ ] DNS resolution validated (no private IPs)

---

## 3. Authentication Testing

### JWT Token Security

**Test 3.1: Token Expiration**
```typescript
// Decode JWT and verify expiration
const decoded = jwt.decode(token);
const exp = decoded.exp;
const now = Math.floor(Date.now() / 1000);

console.log(`Token expires in: ${exp - now} seconds`);
// Expected: < 3600 seconds (1 hour)
```

**Test 3.2: Token Refresh**
```bash
# Use refresh token to get new access token
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "refresh_token_here"}' \
  https://api.clenergize.com/api/v1/auth/refresh

# Expected: New access token returned, old refresh token rotated
# Actual: _______________
```

**Test 3.3: Token Revocation**
```bash
# Logout (revoke token)
curl -X POST \
  -H "Authorization: Bearer token" \
  https://api.clenergize.com/api/v1/auth/logout

# Try using old token
curl -H "Authorization: Bearer token" \
  https://api.clenergize.com/api/v1/users/me

# Expected: 401 Unauthorized (token revoked)
# Actual: _______________
```

---

## 4. Authorization Testing

### Role-Based Access Control (RBAC)

**Test 4.1: Admin-Only Endpoints**
```bash
# VIEWER tries to access admin endpoint
curl -X POST \
  -H "Authorization: Bearer viewer_token" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Organization"}' \
  https://api.clenergize.com/api/v1/organizations

# Expected: 403 Forbidden (insufficient permissions)
# Actual: _______________
```

**Test 4.2: Project-Level Permissions**
```bash
# User not in project tries to access project data
curl -H "Authorization: Bearer token" \
  https://api.clenergize.com/api/v1/projects/other_project_id/activities

# Expected: 403 Forbidden (not a project member)
# Actual: _______________
```

---

## 5. Input Validation Testing

### File Upload Security

**Test 5.1: File Size Limit**
```bash
# Try uploading 100MB file (limit is 10MB)
curl -X POST \
  -H "Authorization: Bearer token" \
  -F "file=@large_file.pdf" \
  https://api.clenergize.com/api/v1/files

# Expected: 413 Payload Too Large
# Actual: _______________
```

**Test 5.2: File Type Validation**
```bash
# Try uploading executable
curl -X POST \
  -H "Authorization: Bearer token" \
  -F "file=@malicious.exe" \
  https://api.clenergize.com/api/v1/files

# Expected: 400 Bad Request (invalid file type)
# Actual: _______________
```

**Test 5.3: Magic Number Verification**
```bash
# Try uploading .pdf renamed as .jpg
curl -X POST \
  -H "Authorization: Bearer token" \
  -F "file=@fake.jpg" \  # Actually a PDF
  https://api.clenergize.com/api/v1/files

# Expected: 400 Bad Request (content doesn't match extension)
# Actual: _______________
```

---

## 6. API Security Testing

### API Rate Limiting

**Test 6.1: Per-User Rate Limit**
```bash
# Send 150 requests (limit is 100/min)
for i in {1..150}; do
  curl -H "Authorization: Bearer token" \
    https://api.clenergize.com/api/v1/users/me
done | grep "429"

# Expected: Last 50 requests return 429 Too Many Requests
# Actual: _______________
```

---

## 7. Infrastructure Security

### Docker Security

**Test 7.1: Non-Root User**
```bash
# Check if containers run as non-root
docker inspect clenergize-identity-service | jq '.[].Config.User'

# Expected: "node" or numeric UID (not "root" or empty)
# Actual: _______________
```

**Test 7.2: Read-Only File System**
```bash
# Check if container file system is read-only
docker inspect clenergize-identity-service | jq '.[].HostConfig.ReadonlyRootfs'

# Expected: true (except /tmp, /var/log)
# Actual: _______________
```

---

## 8. Automated Security Scanning

### CI/CD Integration

Add to `.github/workflows/security-scan.yml`:

```yaml
name: Security Scan

on:
  push:
    branches: [develop, main]
  pull_request:
    branches: [develop, main]

jobs:
  security-scan:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run npm audit
        run: npm audit --audit-level=high

      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

      - name: Run Trivy (container scan)
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: clenergize/identity-service:latest
          severity: 'CRITICAL,HIGH'

      - name: Run SonarQube
        uses: sonarsource/sonarcloud-github-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

---

## 9. Penetration Testing

### External Pen Test (Quarterly)

**Scope**:
- All external APIs
- Authentication flows
- Authorization bypass attempts
- Data exfiltration attempts

**Provider**: [Third-party security firm]

**Report**: Stored in [secure location]

---

## 10. Security Regression Tests

### Automated Tests in CI/CD

Create `test/security/security.spec.ts`:

```typescript
describe('Security Regression Tests', () => {
  describe('JWT Verification', () => {
    it('rejects token with invalid signature', async () => {
      const tamperedToken = 'eyJhbGciOiJub25lIn0.eyJzdWIiOiJ1c2VyMTIzIn0.invalid';

      const response = await fetch('/api/v1/users/me', {
        headers: { Authorization: `Bearer ${tamperedToken}` }
      });

      expect(response.status).toBe(401);
    });

    it('rejects expired token', async () => {
      const expiredToken = generateExpiredToken();

      const response = await fetch('/api/v1/users/me', {
        headers: { Authorization: `Bearer ${expiredToken}` }
      });

      expect(response.status).toBe(401);
    });
  });

  describe('Authorization', () => {
    it('prevents horizontal privilege escalation', async () => {
      const userAToken = await loginAs('userA');

      const response = await fetch('/api/v1/users/userB_id', {
        headers: { Authorization: `Bearer ${userAToken}` }
      });

      expect(response.status).toBe(403);
    });

    it('prevents vertical privilege escalation', async () => {
      const viewerToken = await loginAs('viewer');

      const response = await fetch('/api/v1/users', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${viewerToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: 'new@example.com', role: 'ADMIN' })
      });

      expect(response.status).toBe(403);
    });
  });

  describe('Input Validation', () => {
    it('rejects NoSQL injection attempts', async () => {
      const response = await fetch('/api/v1/users?email[$ne]=null', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      expect(response.status).toBe(400);
    });

    it('rejects XSS attempts', async () => {
      const response = await fetch('/api/v1/comments', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comment: '<script>alert(1)</script>' })
      });

      expect(response.status).toBe(400);
    });
  });
});
```

---

**Document Status**: ✅ Complete
**Ready for Implementation**: YES
**Sprint**: 0.2
**Security Sign-Off Required**: YES (before production)
