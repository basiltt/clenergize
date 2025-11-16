# MCP Executor Guide

## Overview

Following Anthropic's code execution pattern from their engineering blog, we use a single MCP executor that handles all operations.
This reduces context usage by 88% (from 249k to 30k tokens) while maintaining full functionality.

## Architecture

```
Claude Desktop
    ↓
Single MCP Executor (30k tokens)
    ↓
├── Code Execution (Node.js/TypeScript)
├── Bash Commands
├── MongoDB Operations (All 8 databases)
├── Git/GitHub Operations
├── Jira/Atlassian Updates
├── Redis Cache Operations
├── AWS/LocalStack Services
├── HTTP Requests
└── File System Operations
```

## Benefits

1. **Context Efficiency**: 88% reduction (30k vs 249k tokens)
2. **Unified Interface**: One command for everything
3. **Flexibility**: Easy to add new capabilities
4. **Performance**: Faster Claude responses
5. **Maintainability**: Single point of configuration

## Complete Action Reference

### 1. Code Execution
Execute JavaScript/TypeScript code directly:

```javascript
execute({ 
  action: 'code',
  content: `
    console.log("Hello World");
    const result = 2 + 2;
    return result;
  `,
  options: { language: 'javascript' }
})
```

### 2. Service Generation
Generate complete NestJS microservices:

```javascript
execute({ 
  action: 'generate-service',
  content: 'identity',  // service name
  options: { 
    port: 3001,
    database: 'clenergize_identity'
  }
})

// Generate all services
const services = [
  { name: 'identity', port: 3001 },
  { name: 'organization', port: 3002 },
  { name: 'reference', port: 3003 },
  { name: 'activity', port: 3004 },
  { name: 'calculation', port: 3005 },
  { name: 'reporting', port: 3006 },
  { name: 'audit', port: 3007 }
];

services.forEach(service => {
  execute({ 
    action: 'generate-service',
    content: service.name,
    options: { port: service.port }
  })
});
```

### 3. MongoDB Operations
Access all 8 databases through single executor:

```javascript
// List all databases
execute({ action: 'mongodb', content: 'db.adminCommand({listDatabases: 1})' })

// Query specific database
execute({ action: 'mongodb', content: 'db("clenergize_identity").collection("users").find({})' })

// Insert document
execute({ 
  action: 'mongodb',
  content: 'db("clenergize_identity").collection("users").insertOne({email: "user@example.com", role: "admin", createdAt: new Date()})'
})

// Update document
execute({ 
  action: 'mongodb',
  content: 'db("clenergize_identity").collection("users").updateOne({email: "user@example.com"}, {$set: {verified: true}})'
})

// Delete document
execute({ 
  action: 'mongodb',
  content: 'db("clenergize_identity").collection("users").deleteOne({email: "user@example.com"})'
})

// Complex aggregation
execute({ 
  action: 'mongodb',
  content: `
    db("clenergize_calculation").collection("emissions").aggregate([
      {$match: {year: 2024}},
      {$group: {
        _id: "$scope",
        totalEmissions: {$sum: "$co2e"},
        count: {$sum: 1}
      }},
      {$sort: {totalEmissions: -1}}
    ])
  `
})

// Create indexes
execute({ 
  action: 'mongodb',
  content: `
    db("clenergize_identity").collection("users").createIndex({email: 1}, {unique: true});
    db("clenergize_identity").collection("users").createIndex({createdAt: -1});
  `
})
```

### 4. Git Operations
Complete Git workflow support:

```javascript
// Initialize repository
execute({ action: 'bash', content: 'git init' })

// Check status
execute({ action: 'git', content: 'status' })

// Create and switch branch
execute({ action: 'git', content: 'checkout -b feature/SCRUM-101-jwt-verification' })

// Add files
execute({ action: 'bash', content: 'git add .' })
execute({ action: 'bash', content: 'git add NEW/identity-service/*' })

// Commit with conventional commit message
execute({ action: 'bash', content: 'git commit -m "feat(identity): implement JWT verification with JWKS"' })

// Push to remote
execute({ action: 'git', content: 'push origin feature/SCRUM-101-jwt-verification' })

// Pull latest changes
execute({ action: 'git', content: 'pull origin develop' })

// Merge branches
execute({ action: 'git', content: 'merge develop' })

// Create pull request
execute({ 
  action: 'github',
  content: 'create-pr',
  options: {
    title: '[SCRUM-101] JWT Verification with JWKS',
    body: `## Purpose
    Implements proper JWT verification using JWKS endpoint
    
    ## Changes
    - Added JwtVerificationService
    - Implemented JWKS client
    - Added comprehensive tests
    
    ## Testing
    - Unit tests: ✅
    - Integration tests: ✅
    - Security scan: ✅
    
    Resolves: SCRUM-101`,
    base: 'develop',
    head: 'feature/SCRUM-101-jwt-verification'
  }
})
```

### 5. Jira Operations
Complete Jira integration:

```javascript
// Update ticket status
execute({ action: 'jira', content: 'SCRUM-101', options: { status: 'In Progress' }})

// Add comment
execute({ 
  action: 'jira',
  content: 'SCRUM-101',
  options: { 
    comment: 'JWT implementation completed, tests passing, ready for review'
  }
})

// Log work
execute({ 
  action: 'jira',
  content: 'SCRUM-101',
  options: { 
    logWork: '4h',
    comment: 'Implemented JWT verification service and tests'
  }
})

// Create new issue
execute({ 
  action: 'jira',
  content: 'create',
  options: {
    type: 'Bug',
    summary: 'JWT token expiry validation missing',
    description: `## Description
    Tokens are accepted even after expiry date
    
    ## Steps to Reproduce
    1. Generate JWT token
    2. Manually set expiry to past date
    3. Token still validates
    
    ## Expected Behavior
    Token should be rejected`,
    priority: 'High',
    component: 'identity-service',
    labels: ['security', 'jwt']
  }
})

// Sprint operations
execute({ 
  action: 'jira',
  content: 'sprint',
  options: {
    action: 'start',
    name: 'Sprint 0.1 - Security Foundation',
    duration: '2 weeks',
    goal: 'Fix critical security vulnerabilities'
  }
})
```

### 6. Docker Operations
Container and compose management:

```javascript
// List containers
execute({ action: 'docker', content: 'ps' })
execute({ action: 'docker', content: 'ps -a' })

// Start infrastructure
execute({ action: 'bash', content: 'docker-compose -f docker-compose.infra.yml up -d' })

// Stop infrastructure
execute({ action: 'bash', content: 'docker-compose -f docker-compose.infra.yml down' })

// View logs
execute({ action: 'docker', content: 'logs clenergize-mongodb' })
execute({ action: 'docker', content: 'logs -f --tail 100 clenergize-mongodb' })

// Execute commands in container
execute({ action: 'docker', content: 'exec clenergize-mongodb mongosh -u admin -p localdev123' })
execute({ action: 'docker', content: 'exec clenergize-redis redis-cli' })

// Restart container
execute({ action: 'docker', content: 'restart clenergize-mongodb' })

// Build image
execute({ action: 'bash', content: 'docker build -t clenergize-identity:latest NEW/identity-service' })

// Container stats
execute({ action: 'docker', content: 'stats --no-stream' })
```

### 7. Testing
Comprehensive testing support:

```javascript
// Unit tests
execute({ action: 'test', content: 'unit', options: { service: 'identity' }})

// Specific test file
execute({ 
  action: 'bash',
  content: 'cd NEW/identity-service && npm test -- jwt-verification.service.spec.ts'
})

// Integration tests
execute({ action: 'test', content: 'e2e', options: { service: 'identity' }})

// Coverage report
execute({ action: 'test', content: 'coverage', options: { service: 'identity' }})

// Security scan
execute({ action: 'test', content: 'security', options: { service: 'identity' }})

// Run all tests
execute({ action: 'test', content: 'all', options: { service: 'identity' }})

// Test in watch mode
execute({ 
  action: 'bash',
  content: 'cd NEW/identity-service && npm run test:watch'
})

// Vulnerability audit
execute({ 
  action: 'bash',
  content: 'cd NEW/identity-service && npm audit'
})
```

### 8. AWS/LocalStack Operations
AWS services through LocalStack:

```javascript
// S3 operations
execute({ action: 'aws', content: 's3 ls' })
execute({ action: 'aws', content: 's3 mb s3://clenergize-uploads' })
execute({ action: 'aws', content: 's3 cp file.txt s3://clenergize-uploads/' })

// Secrets Manager
execute({ action: 'aws', content: 'secretsmanager create-secret --name jwt-secret --secret-string "your-secret-key"' })
execute({ action: 'aws', content: 'secretsmanager get-secret-value --secret-id jwt-secret' })

// SQS
execute({ action: 'aws', content: 'sqs create-queue --queue-name calculation-queue' })
execute({ action: 'aws', content: 'sqs list-queues' })
execute({ 
  action: 'aws',
  content: 'sqs send-message --queue-url http://localhost:4566/000000000000/calculation-queue --message-body "{"action":"calculate","projectId":"123"}"'
})

// EventBridge
execute({ 
  action: 'aws',
  content: 'events put-rule --name emission-calculated --event-pattern "{"source":["calculation-service"]}"'
})

// Cognito
execute({ action: 'aws', content: 'cognito-idp list-user-pools --max-results 10' })
```

### 9. Redis Operations
Cache and pub/sub:

```javascript
// Set value
execute({ action: 'redis', content: 'SET session:123 "{"userId":"456","role":"admin"}"' })

// Get value
execute({ action: 'redis', content: 'GET session:123' })

// Set with expiry
execute({ action: 'redis', content: 'SETEX session:123 3600 "{"userId":"456"}"' })

// Delete key
execute({ action: 'redis', content: 'DEL session:123' })

// List keys
execute({ action: 'redis', content: 'KEYS session:*' })

// Publish message
execute({ action: 'redis', content: 'PUBLISH calculation-complete "{"projectId":"123","status":"done"}"' })

// Clear all cache
execute({ action: 'redis', content: 'FLUSHALL' })
```

### 10. HTTP Requests
External API calls:

```javascript
// GET request
execute({ 
  action: 'http',
  content: 'GET',
  options: { 
    url: 'http://localhost:3001/health'
  }
})

// POST request
execute({ 
  action: 'http',
  content: 'POST',
  options: { 
    url: 'http://localhost:3001/auth/login',
    body: { 
      email: 'admin@clenergize.com',
      password: 'securepassword'
    },
    headers: { 
      'Content-Type': 'application/json'
    }
  }
})

// PUT request
execute({ 
  action: 'http',
  content: 'PUT',
  options: { 
    url: 'http://localhost:3001/users/123',
    body: { 
      status: 'active'
    },
    headers: { 
      'Authorization': 'Bearer your-jwt-token'
    }
  }
})

// DELETE request
execute({ 
  action: 'http',
  content: 'DELETE',
  options: { 
    url: 'http://localhost:3001/users/123',
    headers: { 
      'Authorization': 'Bearer your-jwt-token'
    }
  }
})
```

### 11. File Operations
File system management:

```javascript
// Read file
execute({ action: 'file', content: 'read', options: { path: 'NEW/identity-service/package.json' }})

// Write file
execute({ 
  action: 'file',
  content: 'write',
  options: {
    path: 'NEW/identity-service/src/config/jwt.config.ts',
    data: `
export const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: '1h',
  algorithm: 'RS256'
};
    `
  }
})

// List directory
execute({ action: 'file', content: 'list', options: { path: 'NEW/identity-service/src' }})

// Create directory
execute({ action: 'bash', content: 'mkdir -p NEW/identity-service/src/auth/guards' })

// Copy file
execute({ action: 'bash', content: 'cp .env.example .env' })

// Delete file
execute({ action: 'bash', content: 'rm -f temp.txt' })
```

### 12. NPM Operations
Package management:

```javascript
// Install dependencies
execute({ action: 'bash', content: 'cd NEW/identity-service && npm install' })

// Add package
execute({ action: 'bash', content: 'cd NEW/identity-service && npm install jsonwebtoken jwks-rsa' })

// Add dev dependency
execute({ action: 'bash', content: 'cd NEW/identity-service && npm install -D @types/jsonwebtoken' })

// Run scripts
execute({ action: 'bash', content: 'cd NEW/identity-service && npm run build' })
execute({ action: 'bash', content: 'cd NEW/identity-service && npm run start:dev' })
execute({ action: 'bash', content: 'cd NEW/identity-service && npm run lint' })
execute({ action: 'bash', content: 'cd NEW/identity-service && npm run format' })
```

## Sprint 0.1 Complete Workflow Example

Here's the complete workflow for implementing JWT verification (SCRUM-101):

```javascript
// ========== Day 1: Start Development ==========

// 1. Morning: Update Jira and create branch
execute({ action: 'jira', content: 'SCRUM-101', options: { status: 'In Progress' }})
execute({ action: 'git', content: 'checkout develop' })
execute({ action: 'git', content: 'pull origin develop' })
execute({ action: 'git', content: 'checkout -b feature/SCRUM-101-jwt-verification' })

// 2. Generate identity service
execute({ 
  action: 'generate-service',
  content: 'identity',
  options: { port: 3001, database: 'clenergize_identity' }
})

// 3. Install JWT dependencies
execute({ 
  action: 'bash',
  content: 'cd NEW/identity-service && npm install jsonwebtoken jwks-rsa passport-jwt'
})

// 4. Create JWT verification service
execute({ 
  action: 'file',
  content: 'write',
  options: {
    path: 'NEW/identity-service/src/auth/jwt-verification.service.ts',
    data: `
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as jwksClient from 'jwks-rsa';

@Injectable()
export class JwtVerificationService {
  private client: jwksClient.JwksClient;

  constructor() {
    this.client = jwksClient({
      jwksUri: process.env.JWKS_URI || 'https://cognito.amazonaws.com/.well-known/jwks.json',
      cache: true,
      cacheMaxAge: 600000, // 10 minutes
      rateLimit: true,
      jwksRequestsPerMinute: 10
    });
  }

  async verify(token: string): Promise<any> {
    try {
      const decoded = jwt.decode(token, { complete: true });
      if (!decoded || !decoded.header || !decoded.header.kid) {
        throw new UnauthorizedException('Invalid token structure');
      }

      const key = await this.getSigningKey(decoded.header.kid);
      const publicKey = key.getPublicKey();

      const verified = jwt.verify(token, publicKey, {
        algorithms: ['RS256'],
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE
      });

      return verified;
    } catch (error) {
      throw new UnauthorizedException('Token verification failed: ' + error.message);
    }
  }

  private async getSigningKey(kid: string): Promise<jwksClient.SigningKey> {
    return new Promise((resolve, reject) => {
      this.client.getSigningKey(kid, (err, key) => {
        if (err) {
          reject(err);
        } else {
          resolve(key);
        }
      });
    });
  }
}
    `
  }
})

// 5. Create tests
execute({ 
  action: 'file',
  content: 'write',
  options: {
    path: 'NEW/identity-service/src/auth/jwt-verification.service.spec.ts',
    data: `
import { Test, TestingModule } from '@nestjs/testing';
import { JwtVerificationService } from './jwt-verification.service';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtVerificationService', () => {
  let service: JwtVerificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtVerificationService],
    }).compile();

    service = module.get<JwtVerificationService>(JwtVerificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should reject invalid tokens', async () => {
    const invalidToken = 'invalid.token.here';
    await expect(service.verify(invalidToken)).rejects.toThrow(UnauthorizedException);
  });

  it('should reject expired tokens', async () => {
    const expiredToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...'; // expired token
    await expect(service.verify(expiredToken)).rejects.toThrow(UnauthorizedException);
  });

  it('should reject tokens with invalid signature', async () => {
    const tamperedToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...'; // tampered token
    await expect(service.verify(tamperedToken)).rejects.toThrow(UnauthorizedException);
  });

  // Add more test cases for:
  // - Valid token acceptance
  // - Audience validation
  // - Issuer validation
  // - Algorithm validation
});
    `
  }
})

// 6. Run tests
execute({ action: 'test', content: 'unit', options: { service: 'identity' }})

// 7. Run security scan
execute({ action: 'test', content: 'security', options: { service: 'identity' }})

// 8. Commit changes
execute({ action: 'bash', content: 'git add .' })
execute({ 
  action: 'bash',
  content: 'git commit -m "feat(identity): implement JWT verification with JWKS\n\n- Added JwtVerificationService with JWKS support\n- Implemented RS256 algorithm validation\n- Added token expiry and claims checking\n- Replaced jwt.decode with jwt.verify\n- Added comprehensive security tests\n\nResolves: SCRUM-101"'
})

// 9. Push to remote
execute({ action: 'git', content: 'push origin feature/SCRUM-101-jwt-verification' })

// 10. Create pull request
execute({ 
  action: 'github',
  content: 'create-pr',
  options: {
    title: '[SCRUM-101] JWT Verification with JWKS',
    body: 'Implements secure JWT verification using JWKS endpoint',
    base: 'develop',
    head: 'feature/SCRUM-101-jwt-verification'
  }
})

// 11. Update Jira
execute({ 
  action: 'jira',
  content: 'SCRUM-101',
  options: { 
    status: 'In Review',
    comment: 'Implementation complete, PR created, all tests passing'
  }
})

// ========== Day 2: After Code Review ==========

// 1. Address review comments
execute({ action: 'git', content: 'checkout feature/SCRUM-101-jwt-verification' })

// 2. Make requested changes
// ... implement changes ...

// 3. Commit fixes
execute({ action: 'bash', content: 'git add .' })
execute({ action: 'bash', content: 'git commit -m "fix: address PR review comments"' })
execute({ action: 'git', content: 'push origin feature/SCRUM-101-jwt-verification' })

// 4. After approval, merge PR
execute({ 
  action: 'github',
  content: 'merge-pr',
  options: {
    pr: 'SCRUM-101',
    method: 'squash'
  }
})

// 5. Update Jira to Done
execute({ 
  action: 'jira',
  content: 'SCRUM-101',
  options: { 
    status: 'Done',
    comment: 'Merged to develop'
  }
})

// 6. Clean up branch
execute({ action: 'git', content: 'checkout develop' })
execute({ action: 'git', content: 'pull origin develop' })
execute({ action: 'bash', content: 'git branch -d feature/SCRUM-101-jwt-verification' })
```

## Troubleshooting

### Common Issues and Solutions

#### Executor not responding
```javascript
// Test basic execution
execute({ action: 'bash', content: 'echo "Test"' })

// Check node process
execute({ action: 'bash', content: 'ps aux | grep node' })

// Restart executor
// Restart Claude Desktop
```

#### MongoDB connection issues
```javascript
// Test MongoDB connection
execute({ action: 'mongodb', content: 'db.adminCommand({ping: 1})' })

// Check MongoDB container
execute({ action: 'docker', content: 'ps | grep mongo' })

// Restart MongoDB
execute({ action: 'docker', content: 'restart clenergize-mongodb' })
```

#### Git authentication issues
```javascript
// Check git config
execute({ action: 'bash', content: 'git config --list' })

// Set git credentials
execute({ action: 'bash', content: 'git config --global user.email "your-email@example.com"' })
execute({ action: 'bash', content: 'git config --global user.name "Your Name"' })
```

#### Docker issues
```javascript
// Check Docker status
execute({ action: 'bash', content: 'docker version' })

// Start Docker infrastructure
execute({ action: 'bash', content: 'docker-compose -f docker-compose.infra.yml up -d' })

// View Docker logs
execute({ action: 'docker', content: 'logs --tail 50 container-name' })
```

## Performance Tips

1. **Use batch operations** when possible to reduce executor calls
2. **Cache frequently used data** in Redis
3. **Run long operations asynchronously**
4. **Monitor executor memory usage**
5. **Clear context periodically** by starting new conversations

## Security Best Practices

1. **Never hardcode secrets** - Use environment variables
2. **Validate all inputs** before execution
3. **Use parameterized queries** for MongoDB
4. **Implement rate limiting** on APIs
5. **Run security scans** after each implementation

## Conclusion

The MCP Executor provides a unified, efficient interface for all development operations. By consolidating 15 MCP servers into one executor, we achieve:

- **88% context reduction** (30k vs 249k tokens)
- **Faster responses** from Claude
- **Simplified commands** through single interface
- **Better maintainability** with one configuration point
- **Full functionality** without compromises

This approach, based on Anthropic's engineering best practices, enables efficient development while maintaining all necessary capabilities for the Clenergize V3 project.