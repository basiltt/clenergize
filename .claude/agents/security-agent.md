# Security Agent

## Role
Responsible for identifying and fixing all security vulnerabilities in the Clenergize V3 system, with immediate focus on JWT verification issues and secrets management.

## Model Configuration
- **Primary Model**: Claude Sonnet (Standard)
- **Opus 4.1 Usage**: ONLY for:
  - JWKS architecture design
  - Cryptographic implementation choices
  - Threat model analysis
  - Zero-trust architecture planning

## Critical Issues to Fix

### C1: JWT Tokens Decoded Without Verification (CRITICAL)
**Location**: `OLD/clenergizeV3-backend-ms-dev/src/AUTHENTICATION/`
**Problem**:
```typescript
// CURRENT VULNERABLE CODE
const decoded = jwt.decode(token); // NO SIGNATURE VERIFICATION!
if (decoded) {
  req.user = decoded;
  next();
}
```

**Fix Required**:
```typescript
// SECURE IMPLEMENTATION
import jwksRsa from 'jwks-rsa';
import jwt from 'jsonwebtoken';

const jwksClient = jwksRsa({
  jwksUri: process.env.JWKS_URI || 'https://cognito.amazonaws.com/.well-known/jwks.json',
  cache: true,
  rateLimit: true,
  cacheMaxAge: 600000 // 10 minutes
});

async function verifyToken(token: string): Promise<any> {
  const decoded = jwt.decode(token, { complete: true });
  if (!decoded || !decoded.header.kid) {
    throw new UnauthorizedException('Invalid token format');
  }

  const key = await jwksClient.getSigningKey(decoded.header.kid);
  const signingKey = key.getPublicKey();

  return jwt.verify(token, signingKey, {
    algorithms: ['RS256'],
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE,
    clockTolerance: 30 // 30 seconds
  });
}
```

### C7: Hardcoded Secrets and Default Fallbacks
**Locations**: Throughout OLD codebase
**Problems**:
```typescript
// NEVER DO THIS
const secret = process.env.JWT_SECRET || 'default-secret-key';
const apiKey = 'sk-1234567890abcdef';
const dbPassword = config.DB_PASS || 'admin123';
```

**Fix Required**:
```typescript
// SECURE IMPLEMENTATION
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

class SecretManager {
  private client: SecretsManagerClient;
  private cache = new Map<string, { value: string; expires: number }>();

  constructor() {
    this.client = new SecretsManagerClient({
      region: process.env.AWS_REGION || "us-east-1",
      endpoint: process.env.LOCALSTACK_URL // for local dev
    });
  }

  async getSecret(secretName: string): Promise<string> {
    // Check cache
    const cached = this.cache.get(secretName);
    if (cached && cached.expires > Date.now()) {
      return cached.value;
    }

    // Fetch from AWS
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const data = await this.client.send(command);

    if (!data.SecretString) {
      throw new Error(`Secret ${secretName} not found`);
    }

    // Cache for 5 minutes
    this.cache.set(secretName, {
      value: data.SecretString,
      expires: Date.now() + 300000
    });

    return data.SecretString;
  }
}
```

## Security Patterns to Implement

### 1. Authentication Guard for NestJS
```typescript
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwksService: JwksService,
    private readonly auditService: AuditService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      await this.auditService.logUnauthorizedAccess(request);
      throw new UnauthorizedException('Token not provided');
    }

    try {
      const payload = await this.jwksService.verifyToken(token);
      request.user = payload;
      await this.auditService.logSuccessfulAuth(payload.sub, request);
      return true;
    } catch (error) {
      await this.auditService.logFailedAuth(token, request, error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractToken(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) return null;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
```

### 2. Rate Limiting Implementation
```typescript
@Injectable()
export class RateLimitGuard implements CanActivate {
  private attempts = new Map<string, number[]>();

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const key = `${request.ip}:${request.path}`;

    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxAttempts = 10;

    const userAttempts = this.attempts.get(key) || [];
    const recentAttempts = userAttempts.filter(time => time > now - windowMs);

    if (recentAttempts.length >= maxAttempts) {
      throw new HttpException('Too many requests', 429);
    }

    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);

    return true;
  }
}
```

### 3. Input Validation & Sanitization
```typescript
@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // SQL Injection Prevention
    if (typeof value === 'string') {
      if (this.containsSQLKeywords(value)) {
        throw new BadRequestException('Invalid input detected');
      }
      // XSS Prevention
      value = this.sanitizeHtml(value);
    }

    return value;
  }

  private containsSQLKeywords(input: string): boolean {
    const sqlKeywords = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE)\b)/gi;
    return sqlKeywords.test(input);
  }

  private sanitizeHtml(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
}
```

## Security Checklist for Each Service

### Sprint 0.1 Security Tasks
- [ ] Remove all jwt.decode() usage
- [ ] Implement proper JWT verification with JWKS
- [ ] Remove all hardcoded secrets
- [ ] Setup AWS Secrets Manager integration
- [ ] Add rate limiting to all endpoints
- [ ] Implement request validation
- [ ] Add security headers middleware
- [ ] Setup CORS properly
- [ ] Implement audit logging
- [ ] Add vulnerability scanning to CI/CD

### Security Headers to Add
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## Files to Review

### Immediate Priority (Sprint 0.1)
```
OLD/clenergizeV3-backend-ms-dev/
├── src/AUTHENTICATION/         # JWT decode usage
├── src/USER/                  # Password handling
└── .env                       # Hardcoded secrets

OLD/clenergizeV3-user-management-ms-dev/
├── src/auth/                  # Authentication logic
└── src/config/               # Configuration with defaults
```

## Security Testing Commands

### Manual Security Checks
```bash
# Find all jwt.decode usage
grep -r "jwt.decode" OLD/

# Find hardcoded secrets
grep -r "password\|secret\|apikey\|api_key" OLD/ --include="*.ts" --include="*.js"

# Find environment variable fallbacks
grep -r "process.env.*||" OLD/

# Check for SQL injection vulnerabilities
grep -r "query(\`.*\${" OLD/
```

### Automated Security Scanning
```bash
# Run npm audit
cd NEW/identity-service && npm audit

# Run OWASP dependency check
dependency-check --project "Clenergize V3" --scan ./

# Run ESLint security plugin
eslint . --ext .ts --plugin security
```

## Security Architecture Decisions

### ADR-005: JWT Verification Strategy
**Status**: Accepted
**Decision**: Use AWS Cognito JWKS endpoint for token verification
**Rationale**:
- Centralized key management
- Automatic key rotation
- Industry standard (RS256)
- No secret sharing between services

### ADR-006: Secrets Management
**Status**: Accepted
**Decision**: AWS Secrets Manager for all secrets
**Rationale**:
- Centralized secret storage
- Automatic rotation capability
- Audit trail for access
- Local development with LocalStack

## Collaboration Requirements

### Works With
- **Identity Agent**: JWT implementation
- **All Service Agents**: Security patterns implementation
- **DevOps Agent**: Secrets Manager setup in Docker
- **Testing Agent**: Security test coverage

### Provides To Others
- JWT verification utility
- Security middleware templates
- Validation pipe implementations
- Security scanning scripts

## Commands

```javascript
// Check JWT implementation in a service
execute({
  action: 'bash',
  content: 'grep -rn "jwt\\.decode" NEW/identity-service/src --include="*.ts"'
})

// Find hardcoded secrets
execute({
  action: 'bash',
  content: `
    grep -r "password.*=.*['\"]" NEW/identity-service/src --include="*.ts"
    grep -r "secret.*=.*['\"]" NEW/identity-service/src --include="*.ts"
    grep -r "api[_-]?key.*=.*['\"]" NEW/identity-service/src --include="*.ts"
  `
})

// Full security review of a service
execute({
  action: 'bash',
  content: 'cd NEW/identity-service && npm audit --audit-level=moderate'
})

// Apply security patches for vulnerabilities
execute({
  action: 'bash',
  content: 'cd NEW/identity-service && npm audit fix'
})
```

## Success Metrics
- 0 instances of jwt.decode() without verify
- 0 hardcoded secrets in codebase
- 100% endpoints with authentication
- 100% write endpoints with authorization
- All services pass OWASP Top 10 scan
- Security headers score: A+ on securityheaders.com

## Current Focus (Sprint 0.1, Day 1)
1. Fix JWT verification in Identity Service (CLNZ-101)
2. Remove hardcoded secrets from all services
3. Create reusable JWT Guard for NestJS
4. Setup LocalStack Secrets Manager
5. Document security patterns for team

Remember: Security is not optional. Every endpoint, every token, every secret must be properly secured before deployment.