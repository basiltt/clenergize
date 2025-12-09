# Security Overview - Clenergize V3 ESG Platform

**Version**: 1.0.0  
**Last Updated**: November 22, 2025  
**Security Standards**: SOC 2 Type II, ISO 27001, GDPR-compliant

## Security Architecture Layers

1. **Network Security**: AWS WAF, DDoS Protection, VPC private subnets
2. **Application Security**: JWT authentication, RBAC, input validation
3. **Data Security**: Encryption at rest (AES-256), TLS 1.3 in transit
4. **Identity & Access**: AWS Cognito, MFA, password policies
5. **Monitoring & Response**: SIEM, IDS, audit logging, incident response

## Authentication Flow

```
User Login → Validate Credentials → Generate JWT (RS256)
→ Generate Refresh Token → Return to Client
```

### JWT Token Claims

- `sub`: User ID
- `iss`: clenergize-identity-service
- `aud`: clenergize-api
- `exp`: Expiry (1 hour)
- `role`: User role (ADMIN, MANAGER, USER, VIEWER)
- `permissions`: Array of permissions

## RBAC Permissions

- **SUPER_ADMIN**: All permissions
- **ORG_ADMIN**: Organization and user management
- **MANAGER**: Project and data management
- **USER**: Read/write data
- **VIEWER**: Read-only access

## Input Validation

All API inputs validated with Zod schemas:
- Email validation
- Password complexity (8+ chars, uppercase, lowercase, number, special)
- SQL/NoSQL injection prevention (parameterized queries)
- XSS prevention (DOMPurify, Content Security Policy)

## Secrets Management

- **Storage**: AWS Secrets Manager
- **Rotation**: Database passwords (90 days), API keys (180 days), JWT keys (365 days)
- **Access**: IAM role-based access only

## Data Protection

- **Encryption at Rest**: AES-256 (MongoDB, S3, EBS)
- **Encryption in Transit**: TLS 1.3 (minimum cipher: TLS_AES_256_GCM_SHA384)
- **PII Protection**: Hash or redact in logs, anonymize for analytics

## Rate Limiting

- **Global**: 100 requests per 15 minutes
- **Auth endpoints**: 5 requests per minute
- **AWS WAF**: Block IPs with >2000 requests per 5 minutes

## Audit Logging

All user actions logged with:
- Event ID, type, timestamp
- User ID, IP address, user agent
- Resource, action, result
- Correlation ID for tracing

**Storage**: AWS S3 with Object Lock (7-year retention)

## Incident Response Levels

- **P0 Critical**: Data breach (15 min response)
- **P1 High**: Security vulnerability exploited (1 hour)
- **P2 Medium**: Suspicious activity (4 hours)
- **P3 Low**: Policy violation (24 hours)

## Compliance

- **SOC 2 Type II**: 9 control categories
- **GDPR**: Right to access, erasure, portability, rectification
- **Breach Notification**: Within 72 hours

## Security Testing

- **Container Scanning**: Trivy (CI/CD)
- **Dependency Checks**: npm audit
- **DAST**: OWASP ZAP
- **SAST**: SonarQube
- **Penetration Testing**: Annually

## Pre-Production Checklist

- [ ] Secrets in AWS Secrets Manager
- [ ] JWT signature verification with JWKS
- [ ] Input validation on all endpoints
- [ ] Rate limiting configured
- [ ] TLS 1.3 enforced
- [ ] Audit logging enabled
- [ ] Container images scanned (0 high/critical vulns)
- [ ] Penetration test completed

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Compliance Guide](08_Compliance_Requirements.md)
- [Incident Response Runbook](../06-Deployment/08_Runbook.md)
