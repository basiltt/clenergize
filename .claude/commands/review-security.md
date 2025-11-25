---
description: Review security aspects only
allowed-tools: Read, Grep, Glob, Bash(npm:*), Task
model: claude-sonnet-4-5-20250929
---

# Review Security Command

Review security aspects of current changes.

## Security Checks (OWASP Top 10)

### 1. Injection
- SQL/NoSQL injection
- Command injection
- LDAP injection

### 2. Broken Authentication
- JWT handling
- Session management
- Password policies

### 3. Sensitive Data Exposure
- PII handling
- Encryption at rest
- TLS/HTTPS

### 4. XML External Entities (XXE)
- XML parsing security

### 5. Broken Access Control
- Authorization checks
- RBAC implementation
- Resource ownership

### 6. Security Misconfiguration
- Default credentials
- Error handling
- CORS settings

### 7. XSS
- Input sanitization
- Output encoding

### 8. Insecure Deserialization
- Object deserialization

### 9. Vulnerable Components
- npm audit results

### 10. Insufficient Logging
- Security event logging
- Audit trail

## Scan Commands

```bash
# Check for hardcoded secrets
grep -rn "password.*=" src/ --include="*.ts"
grep -rn "secret.*=" src/ --include="*.ts"

# Check for any types in security code
grep -rn ": any" src/auth/ --include="*.ts"

# npm audit
npm audit
```

## Output Format

```
## Security Review

### OWASP Top 10 Check
| Category | Status | Findings |
|----------|--------|----------|
| Injection | ✅/❌ | [Details] |
| Authentication | ✅/❌ | [Details] |
| Data Exposure | ✅/❌ | [Details] |
| ... | ... | ... |

### Hardcoded Secrets
- [Found/None]

### Dependency Vulnerabilities
- Critical: [X]
- High: [X]
- Medium: [X]

### Authentication/Authorization
- [Findings]

### Input Validation
- [Findings]

### Recommendation
**Security Score**: [X/10]
**Status**: [PASS / CRITICAL_ISSUES / NEEDS_WORK]
**Blocking Issues**: [List any blocking security issues]
```

Delegate to security-agent for deep analysis if needed.
