# Security Commands (MCP Executor)

## Authentication & Authorization Commands

### Verify JWT Token
```javascript
// Verify JWT with JWKS
execute({
  action: 'code',
  content: `
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const client = jwksClient({
  jwksUri: 'https://cognito.amazonaws.com/.well-known/jwks.json',
  cache: true
});

async function verifyToken(token) {
  const decoded = jwt.decode(token, { complete: true });
  const key = await client.getSigningKey(decoded.header.kid);
  return jwt.verify(token, key.getPublicKey(), {
    algorithms: ['RS256'],
    issuer: process.env.JWT_ISSUER
  });
}

verifyToken('YOUR_TOKEN_HERE').then(console.log).catch(console.error);
  `,
  options: { language: 'javascript' }
})
```

### Scan for Hardcoded Secrets
```javascript
// Scan directory for secrets
execute({
  action: 'bash',
  content: `
    echo "=== Scanning for hardcoded secrets ==="
    grep -r "password.*=.*['\"]" NEW/identity-service/src --include="*.ts"
    grep -r "secret.*=.*['\"]" NEW/identity-service/src --include="*.ts"
    grep -r "api[_-]?key.*=.*['\"]" NEW/identity-service/src --include="*.ts"
    grep -r "Bearer sk_" NEW/identity-service/src --include="*.ts"
  `
})

// Check for default fallback values
execute({
  action: 'bash',
  content: `
    grep -r "process\\.env\\.[A-Z_]*\\s*||\\s*['\"]" NEW/ --include="*.ts"
  `
})
```

### Security Audit
```javascript
// Run comprehensive security audit
execute({
  action: 'bash',
  content: 'cd NEW/identity-service && npm audit --audit-level=moderate'
})

// Check for vulnerable dependencies
execute({
  action: 'bash',
  content: 'cd NEW/identity-service && npm audit --json | jq \'.vulnerabilities\''
})

// Fix vulnerabilities
execute({
  action: 'bash',
  content: 'cd NEW/identity-service && npm audit fix'
})
```

### Fix JWT Vulnerability (C1)
```javascript
// Find JWT decode without verification
execute({
  action: 'bash',
  content: 'grep -rn "jwt\\.decode" NEW/identity-service/src --include="*.ts"'
})

// Replace with proper verification
execute({
  action: 'file',
  content: 'write',
  options: {
    path: 'NEW/identity-service/src/auth/jwt.guard.ts',
    data: `
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import jwksRsa from 'jwks-rsa';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtGuard {
  private jwksClient: jwksRsa.JwksClient;

  constructor() {
    this.jwksClient = jwksRsa({
      jwksUri: process.env.JWKS_URI,
      cache: true,
      rateLimit: true
    });
  }

  async validateToken(token: string) {
    try {
      const decoded = jwt.decode(token, { complete: true });
      if (!decoded) throw new UnauthorizedException('Invalid token');

      const key = await this.jwksClient.getSigningKey(decoded.header.kid);
      const signingKey = key.getPublicKey();

      return jwt.verify(token, signingKey, {
        algorithms: ['RS256'],
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE
      });
    } catch (error) {
      throw new UnauthorizedException('Token verification failed');
    }
  }
}
    `
  }
})
```

## Encryption & Secrets Management

### Rotate Secrets
```javascript
// Generate new secrets
execute({
  action: 'bash',
  content: 'openssl rand -base64 32'
})

// Update AWS Secrets Manager
execute({
  action: 'aws',
  content: `secretsmanager update-secret --secret-id jwt-signing-key --secret-string '{"key":"NEW_SECRET_HERE"}'`
})

// Trigger rolling deployment
execute({
  action: 'bash',
  content: 'kubectl rollout restart deployment/identity-service'
})
```

### Encrypt PII Fields
```javascript
// Implement field-level encryption
execute({
  action: 'file',
  content: 'write',
  options: {
    path: 'NEW/identity-service/src/common/decorators/encrypted.decorator.ts',
    data: `
import { Transform } from 'class-transformer';
import { createCipher, createDecipher } from 'crypto';

export function Encrypted() {
  return function (target: any, propertyKey: string) {
    const key = process.env.ENCRYPTION_KEY;

    Transform(({ value }) => {
      const cipher = createCipher('aes-256-cbc', key);
      return cipher.update(value, 'utf8', 'hex') + cipher.final('hex');
    }, { toPlainOnly: true })(target, propertyKey);

    Transform(({ value }) => {
      const decipher = createDecipher('aes-256-cbc', key);
      return decipher.update(value, 'hex', 'utf8') + decipher.final('utf8');
    }, { toClassOnly: true })(target, propertyKey);
  };
}
    `
  }
})
```

### Generate API Key
```javascript
// Generate secure API key
execute({
  action: 'code',
  content: `
const crypto = require('crypto');

function generateAPIKey(prefix = 'clnz_live') {
  const randomBytes = crypto.randomBytes(24).toString('hex');
  return \`\${prefix}_\${randomBytes}\`;
}

const apiKey = generateAPIKey();
console.log('API Key:', apiKey);

// Store in database with hash
const hash = crypto.createHash('sha256').update(apiKey).digest('hex');
console.log('Store this hash:', hash);
  `,
  options: { language: 'javascript' }
})
```

## Vulnerability Management

### Dependency Check
```javascript
// Check for vulnerable dependencies
execute({
  action: 'bash',
  content: 'cd NEW/organization-service && npm audit'
})

// Get detailed vulnerability report
execute({
  action: 'bash',
  content: `
    cd NEW/organization-service &&
    npm audit --json | jq '{
      critical: .metadata.vulnerabilities.critical,
      high: .metadata.vulnerabilities.high,
      moderate: .metadata.vulnerabilities.moderate,
      low: .metadata.vulnerabilities.low
    }'
  `
})

// Update vulnerable packages
execute({
  action: 'bash',
  content: 'cd NEW/organization-service && npm update'
})
```

### Penetration Test
```javascript
// Run OWASP ZAP scan
execute({
  action: 'bash',
  content: `
    docker run -t owasp/zap2docker-stable zap-baseline.py \\
      -t http://localhost:3001 \\
      -r zap-report.html
  `
})

// SQL/NoSQL injection test
execute({
  action: 'bash',
  content: `
    curl -X POST http://localhost:3001/auth/login \\
      -H "Content-Type: application/json" \\
      -d '{"email":"admin@test.com'\'' OR 1=1--","password":"test"}'
  `
})
```

### Compliance Check
```javascript
// OWASP Top 10 compliance check
execute({
  action: 'test',
  content: 'security',
  options: {
    service: 'identity',
    standard: 'OWASP',
    checks: [
      'injection',
      'broken-auth',
      'sensitive-data',
      'xxe',
      'broken-access-control',
      'security-misconfiguration',
      'xss',
      'insecure-deserialization',
      'vulnerable-components',
      'logging-monitoring'
    ]
  }
})
```

## Access Control Commands

### Setup RBAC
```javascript
// Create role definitions
execute({
  action: 'file',
  content: 'write',
  options: {
    path: 'NEW/organization-service/src/auth/roles.enum.ts',
    data: `
export enum Role {
  SUPER_ADMIN = 'super_admin',
  ORG_ADMIN = 'org_admin',
  PROJECT_MANAGER = 'project_manager',
  DATA_ANALYST = 'data_analyst',
  VIEWER = 'viewer'
}

export enum Permission {
  PROJECT_CREATE = 'project:create',
  PROJECT_READ = 'project:read',
  PROJECT_UPDATE = 'project:update',
  PROJECT_DELETE = 'project:delete',
  REPORT_GENERATE = 'report:generate',
  REPORT_EXPORT = 'report:export',
  USER_MANAGE = 'user:manage'
}

export const RolePermissions: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: [Permission.PROJECT_CREATE, Permission.PROJECT_READ, Permission.PROJECT_UPDATE, Permission.PROJECT_DELETE, Permission.REPORT_GENERATE, Permission.REPORT_EXPORT, Permission.USER_MANAGE],
  [Role.ORG_ADMIN]: [Permission.PROJECT_CREATE, Permission.PROJECT_READ, Permission.PROJECT_UPDATE, Permission.REPORT_GENERATE, Permission.REPORT_EXPORT],
  [Role.PROJECT_MANAGER]: [Permission.PROJECT_READ, Permission.PROJECT_UPDATE, Permission.REPORT_GENERATE],
  [Role.DATA_ANALYST]: [Permission.PROJECT_READ, Permission.REPORT_GENERATE],
  [Role.VIEWER]: [Permission.PROJECT_READ]
};
    `
  }
})
```

### Audit Log Query
```javascript
// Query audit logs for failed logins
execute({
  action: 'mongodb',
  content: `
    db("clenergize_audit").collection("security_events").find({
      event: "failed_login",
      timestamp: { $gte: new Date(Date.now() - 24*60*60*1000) }
    }).sort({ timestamp: -1 })
  `
})

// Find suspicious activity
execute({
  action: 'mongodb',
  content: `
    db("clenergize_audit").collection("security_events").aggregate([
      {$match: {event: "failed_login"}},
      {$group: {
        _id: "$ip",
        attempts: {$sum: 1},
        users: {$addToSet: "$userId"}
      }},
      {$match: {attempts: {$gte: 5}}},
      {$sort: {attempts: -1}}
    ])
  `
})
```

## Network Security Commands

### Configure CORS
```javascript
// Setup CORS configuration
execute({
  action: 'file',
  content: 'write',
  options: {
    path: 'NEW/identity-service/src/main.ts',
    data: `
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'https://app.clenergize.com',
      'https://staging.clenergize.com',
      process.env.NODE_ENV === 'development' && 'http://localhost:3000'
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Request-Id'],
    maxAge: 86400
  });

  await app.listen(3001);
}
bootstrap();
    `
  }
})
```

### Rate Limiting
```javascript
// Implement rate limiting
execute({
  action: 'bash',
  content: 'cd NEW/identity-service && npm install @nestjs/throttler'
})

// Configure rate limiter
execute({
  action: 'file',
  content: 'write',
  options: {
    path: 'NEW/identity-service/src/auth/rate-limit.guard.ts',
    data: `
import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthRateLimitGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): string {
    return req.ip; // or req.user.id for authenticated requests
  }
}
    `
  }
})
```

## Incident Response Commands

### Security Incident Report
```javascript
// Log security incident
execute({
  action: 'mongodb',
  content: `
    db("clenergize_audit").collection("incidents").insertOne({
      type: "data_breach",
      severity: "critical",
      timestamp: new Date(),
      description: "Potential data breach detected",
      affectedServices: ["calculation-service"],
      status: "investigating",
      reportedBy: "security-agent"
    })
  `
})

// Notify security team
execute({
  action: 'slack',
  content: 'send-message',
  options: {
    channel: '#security-incidents',
    message: '🚨 CRITICAL: Security incident detected - Investigation started'
  }
})
```

### Quarantine Service
```javascript
// Remove from load balancer
execute({
  action: 'bash',
  content: 'kubectl scale deployment calculation-service --replicas=0'
})

// Block all traffic
execute({
  action: 'bash',
  content: `
    docker network disconnect bridge calculation-service
  `
})

// Enable detailed logging
execute({
  action: 'bash',
  content: 'kubectl set env deployment/calculation-service LOG_LEVEL=debug'
})
```

## Monitoring Commands

### Security Metrics
```javascript
// Get authentication metrics
execute({
  action: 'mongodb',
  content: `
    db("clenergize_audit").collection("auth_events").aggregate([
      {$match: {timestamp: {$gte: new Date(Date.now() - 24*60*60*1000)}}},
      {$group: {
        _id: "$event",
        count: {$sum: 1}
      }}
    ])
  `
})

// Get vulnerability status
execute({
  action: 'bash',
  content: `
    for service in identity organization reference activity calculation reporting audit; do
      echo "=== $service-service ==="
      cd NEW/$service-service && npm audit --audit-level=high | grep "found"
      cd ../..
    done
  `
})
```

### Threat Detection
```javascript
// Enable real-time threat detection
execute({
  action: 'bash',
  content: `
    # Enable fail2ban for brute force protection
    docker run -d --name fail2ban \\
      --network=host \\
      -v /var/log:/var/log:ro \\
      crazymax/fail2ban:latest
  `
})

// Monitor suspicious patterns
execute({
  action: 'mongodb',
  content: `
    db("clenergize_audit").collection("requests").find({
      $or: [
        {path: {$regex: "\\\\.\\\\."}}, // Path traversal
        {query: {$regex: "union.*select"}}, // SQL injection
        {headers: {$regex: "<script"}}, // XSS
      ]
    })
  `
})
```

## Quick Reference

| Task | Command |
|------|---------|
| Verify JWT | `execute({ action: 'code', content: 'jwt.verify(...)', options: {...}})` |
| Scan secrets | `execute({ action: 'bash', content: 'grep -r "secret.*=" src/' })` |
| Security audit | `execute({ action: 'bash', content: 'npm audit' })` |
| Fix JWT vuln | Apply jwt-verification-fix skill |
| Rotate secrets | `execute({ action: 'aws', content: 'secretsmanager update-secret...' })` |
| Check dependencies | `execute({ action: 'bash', content: 'npm audit --json' })` |
| Setup RBAC | Create roles.enum.ts with permissions |
| Query audit log | `execute({ action: 'mongodb', content: 'db("audit").find(...)' })` |
| Rate limiting | Install @nestjs/throttler |

Remember: Security first - always verify, never trust!
