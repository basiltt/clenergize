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
execute({ action: 'git', content: 'checkout -b feature/CLNZ-101-jwt-verification' })

// Add files
execute({ action: 'bash', content: 'git add .' })
execute({ action: 'bash', content: 'git add NEW/identity-service/*' })

// Commit with conventional commit message
execute({ action: 'bash', content: 'git commit -m "feat(identity): implement JWT verification with JWKS"' })

// Push to remote
execute({ action: 'git', content: 'push origin feature/CLNZ-101-jwt-verification' })

// Pull latest changes
execute({ action: 'git', content: 'pull origin develop' })

// Merge branches
execute({ action: 'git', content: 'merge develop' })

// Create pull request
execute({ 
  action: 'github',
  content: 'create-pr',
  options: {
    title: '[CLNZ-101] JWT Verification with JWKS',
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
    
    Resolves: CLNZ-101`,
    base: 'develop',
    head: 'feature/CLNZ-101-jwt-verification'
  }
})
```

### 5. Jira Operations
Complete Jira integration:

```javascript
// Update ticket status
execute({ action: 'jira', content: 'CLNZ-101', options: { status: 'In Progress' }})

// Add comment
execute({ 
  action: 'jira',
  content: 'CLNZ-101',
  options: { 
    comment: 'JWT implementation completed, tests passing, ready for review'
  }
})

// Log work
execute({ 
  action: 'jira',
  content: 'CLNZ-101',
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

### 8. Health Check Operations 🆕
Comprehensive service health monitoring:

```javascript
// Health check all services
execute({
  action: 'health-check',
  content: 'all'
})
// Returns:
// {
//   mongodb: { status: 'healthy', latency: '12ms', connections: 5 },
//   redis: { status: 'healthy', latency: '2ms', memory: '50MB' },
//   identity: { status: 'healthy', latency: '45ms', uptime: '2h 15m' },
//   organization: { status: 'degraded', latency: '1200ms', error: 'Database slow queries detected' },
//   reference: { status: 'healthy', latency: '30ms' },
//   activity: { status: 'unhealthy', error: 'Service not responding' },
//   calculation: { status: 'healthy', latency: '120ms' },
//   reporting: { status: 'healthy', latency: '80ms' },
//   audit: { status: 'healthy', latency: '25ms' }
// }

// Health check specific service
execute({
  action: 'health-check',
  content: 'identity',
  options: { detailed: true }
})

// Add to Make file
health:
	@execute({action: 'health-check', content: 'all'})
```

### 9. Dry-Run Mode Operations 🆕
Test destructive operations safely:

```javascript
// Dry-run: Delete operation
execute({
  action: 'mongodb',
  content: 'db("clenergize_identity").collection("users").deleteMany({status: "inactive"})',
  options: { dryRun: true }
})
// Returns: "Would delete 1,234 documents from users collection"
// No actual deletion occurs!

// Dry-run: Bash commands
execute({
  action: 'bash',
  content: 'rm -rf node_modules',
  options: { dryRun: true }
})
// Returns: "Would execute: rm -rf node_modules"
```

### 10. MongoDB Transaction Operations 🆕
Multi-collection atomic transactions:

```javascript
// Transaction wrapper
execute({
  action: 'mongodb-transaction',
  content: [
    'db("clenergize_identity").collection("users").insertOne({email: "user@example.com"})',
    'db("clenergize_organization").collection("projects").insertOne({name: "Project A", ownerId: "user-123"})',
    'db("clenergize_audit").collection("events").insertOne({type: "USER_CREATED", userId: "user-123"})'
  ],
  options: {
    timeout: 30000,
    rollbackOnError: true
  }
})
// Either ALL operations succeed, or ALL are rolled back
```

### 11. AWS/LocalStack Operations
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

Here's the complete workflow for implementing JWT verification (CLNZ-101):

```javascript
// ========== Day 1: Start Development ==========

// 1. Morning: Update Jira and create branch
execute({ action: 'jira', content: 'CLNZ-101', options: { status: 'In Progress' }})
execute({ action: 'git', content: 'checkout develop' })
execute({ action: 'git', content: 'pull origin develop' })
execute({ action: 'git', content: 'checkout -b feature/CLNZ-101-jwt-verification' })

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
  content: 'git commit -m "feat(identity): implement JWT verification with JWKS\n\n- Added JwtVerificationService with JWKS support\n- Implemented RS256 algorithm validation\n- Added token expiry and claims checking\n- Replaced jwt.decode with jwt.verify\n- Added comprehensive security tests\n\nResolves: CLNZ-101"'
})

// 9. Push to remote
execute({ action: 'git', content: 'push origin feature/CLNZ-101-jwt-verification' })

// 10. Create pull request
execute({ 
  action: 'github',
  content: 'create-pr',
  options: {
    title: '[CLNZ-101] JWT Verification with JWKS',
    body: 'Implements secure JWT verification using JWKS endpoint',
    base: 'develop',
    head: 'feature/CLNZ-101-jwt-verification'
  }
})

// 11. Update Jira
execute({ 
  action: 'jira',
  content: 'CLNZ-101',
  options: { 
    status: 'In Review',
    comment: 'Implementation complete, PR created, all tests passing'
  }
})

// ========== Day 2: After Code Review ==========

// 1. Address review comments
execute({ action: 'git', content: 'checkout feature/CLNZ-101-jwt-verification' })

// 2. Make requested changes
// ... implement changes ...

// 3. Commit fixes
execute({ action: 'bash', content: 'git add .' })
execute({ action: 'bash', content: 'git commit -m "fix: address PR review comments"' })
execute({ action: 'git', content: 'push origin feature/CLNZ-101-jwt-verification' })

// 4. After approval, merge PR
execute({ 
  action: 'github',
  content: 'merge-pr',
  options: {
    pr: 'CLNZ-101',
    method: 'squash'
  }
})

// 5. Update Jira to Done
execute({ 
  action: 'jira',
  content: 'CLNZ-101',
  options: { 
    status: 'Done',
    comment: 'Merged to develop'
  }
})

// 6. Clean up branch
execute({ action: 'git', content: 'checkout develop' })
execute({ action: 'git', content: 'pull origin develop' })
execute({ action: 'bash', content: 'git branch -d feature/CLNZ-101-jwt-verification' })
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

### 🚨 Critical Security Requirements

The MCP Executor handles powerful operations that require strict security controls to prevent code injection, unauthorized access, and data breaches.

### 1. Input Sanitization

**CRITICAL: NEVER use `eval()` for MongoDB queries - This creates code injection vulnerabilities!**

> ⚠️ **WARNING**: The following anti-pattern must NEVER be implemented:
> ```
> // ❌ NEVER DO THIS - CRITICAL SECURITY VULNERABILITY
> // await eval(`client.${query}`) // CODE INJECTION RISK!
> ```
> Using eval() allows arbitrary code execution and is a critical security vulnerability.
> Always use the Function constructor with proper sanitization instead.

**✅ CORRECT IMPLEMENTATION - Use Function constructor with sanitization:**

```javascript
async executeMongo(queryString) {
  const client = await this.connectMongo();

  try {
    // Sanitize query first
    const sanitized = this.sanitizeMongoQuery(queryString);

    // Use Function constructor (more controlled than eval)
    const executor = new Function('client', `return ${sanitized}`);
    const result = await executor(client);

    // Serialize result safely
    return {
      success: true,
      result: JSON.parse(JSON.stringify(result)),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}
```

### 2. Query Sanitization Implementation

**Maintain an allowlist of permitted operations**

```javascript
sanitizeMongoQuery(queryString) {
  // Block dangerous patterns
  const forbidden = [
    'require(',
    'import(',
    'eval(',
    'Function(',
    'process.exit',
    'child_process',
    '__dirname',
    '__filename',
    'fs.readFile',
    'fs.writeFile'
  ];

  for (const pattern of forbidden) {
    if (queryString.includes(pattern)) {
      throw new Error(`Forbidden operation detected: ${pattern}`);
    }
  }

  // Only allow specific MongoDB operations
  const allowedOperations = [
    'db(',
    'collection(',
    'find(',
    'findOne(',
    'insertOne(',
    'insertMany(',
    'updateOne(',
    'updateMany(',
    'deleteOne(',
    'deleteMany(',
    'aggregate(',
    'countDocuments(',
    'distinct(',
    'createIndex(',
    'dropIndex('
  ];

  const hasAllowedOp = allowedOperations.some(op => queryString.includes(op));
  if (!hasAllowedOp) {
    throw new Error('Query must use allowed MongoDB operations');
  }

  return queryString;
}
```

### 3. Environment Variables

**NEVER hardcode paths, credentials, or configuration**

```javascript
// ❌ WRONG - Hardcoded values
class ClenergizeExecutor {
  constructor() {
    this.projectRoot = 'C:\\Users\\ttbasil\\Desktop\\...';  // OS-specific!
    this.jiraToken = 'ATATTxxx...';  // Exposed secret!
    this.jiraEmail = 'user@example.com';  // Exposed!
  }
}

// ✅ CORRECT - Use environment variables
class ClenergizeExecutor {
  constructor() {
    this.projectRoot = process.env.PROJECT_ROOT || path.join(process.cwd(), '../..');
    this.jiraToken = process.env.JIRA_API_TOKEN;
    this.jiraEmail = process.env.JIRA_EMAIL;
    this.mongoUri = process.env.MONGODB_URI;
  }

  // Validate required environment variables
  validateEnvironment() {
    const required = ['PROJECT_ROOT', 'MONGODB_URI'];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
}
```

### 4. Required Environment Variables

Create `.env` file in `mcp-servers/clenergize-executor/`:

```bash
# Project Configuration
PROJECT_ROOT=/absolute/path/to/ClenergizeV3
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://admin:localdev123@localhost:27017/?authSource=admin

# Jira Integration (optional)
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your_jira_api_token_here
JIRA_BASE_URL=https://yourcompany.atlassian.net

# Execution Limits
EXEC_TIMEOUT_MS=30000
MAX_QUERY_LENGTH=5000
```

### 5. Timeout Protection

**Always set timeouts to prevent infinite loops**

```javascript
async executeNode(code) {
  const tmpDir = path.join(this.projectRoot, '.tmp');
  await fs.mkdir(tmpDir, { recursive: true });

  const tmpFile = path.join(tmpDir, `exec_${Date.now()}.js`);
  await fs.writeFile(tmpFile, code);

  try {
    const { stdout, stderr } = await execAsync(`node ${tmpFile}`, {
      cwd: this.projectRoot,
      timeout: parseInt(process.env.EXEC_TIMEOUT_MS) || 30000  // 30 second timeout
    });
    return { success: true, output: stdout, error: stderr };
  } catch (error) {
    if (error.killed) {
      return { success: false, error: 'Execution timeout exceeded' };
    }
    return { success: false, error: error.message };
  } finally {
    await fs.unlink(tmpFile).catch(() => {});  // Cleanup
  }
}
```

### 6. Secure Credential Handling

**Use secure authentication for external services**

```javascript
async updateJiraTicket(ticketId, status) {
  // Check credentials are configured
  if (!this.jiraToken || !this.jiraEmail) {
    return {
      success: false,
      error: 'JIRA credentials not configured. Set JIRA_API_TOKEN and JIRA_EMAIL.'
    };
  }

  try {
    // Build auth header at runtime (never store encoded)
    const auth = Buffer.from(`${this.jiraEmail}:${this.jiraToken}`).toString('base64');

    const response = await fetch(
      `${process.env.JIRA_BASE_URL}/rest/api/3/issue/${ticketId}/transitions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ transition: { id: status } })
      }
    );

    if (!response.ok) {
      throw new Error(`Jira API error: ${response.status}`);
    }

    return { success: true, ticketId, status };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### 7. Input Validation

**Validate all user inputs before processing**

```javascript
async execute(action, content, options = {}) {
  // Validate action type
  const validActions = ['code', 'bash', 'mongodb', 'git', 'jira', 'docker', 'test', 'file'];
  if (!validActions.includes(action)) {
    throw new Error(`Invalid action: ${action}`);
  }

  // Validate content length
  const maxLength = parseInt(process.env.MAX_QUERY_LENGTH) || 5000;
  if (content.length > maxLength) {
    throw new Error(`Content exceeds maximum length of ${maxLength} characters`);
  }

  // Validate content is not empty
  if (!content || content.trim().length === 0) {
    throw new Error('Content cannot be empty');
  }

  // Action-specific validation
  switch (action) {
    case 'mongodb':
      return await this.executeMongo(content);
    case 'bash':
      // Prevent dangerous bash commands
      if (content.includes('rm -rf /') || content.includes(':(){ :|:& };:')) {
        throw new Error('Dangerous bash command detected');
      }
      return await this.executeBash(content);
    // ... other cases
  }
}
```

### 8. File System Security

**Restrict file operations to project directory**

```javascript
async readFile(filePath) {
  // Resolve to absolute path
  const absolutePath = path.resolve(this.projectRoot, filePath);

  // Ensure path is within project directory (prevent path traversal)
  if (!absolutePath.startsWith(this.projectRoot)) {
    throw new Error('Access denied: Path outside project directory');
  }

  // Check file exists
  try {
    await fs.access(absolutePath, fs.constants.R_OK);
  } catch {
    throw new Error(`File not accessible: ${filePath}`);
  }

  // Read with size limit
  const stats = await fs.stat(absolutePath);
  if (stats.size > 10 * 1024 * 1024) {  // 10MB limit
    throw new Error('File too large to read');
  }

  return await fs.readFile(absolutePath, 'utf-8');
}
```

### 9. Security Testing

**Run security scans regularly**

```javascript
// Test MCP security
execute({
  action: 'test',
  content: 'security',
  options: { service: 'mcp-executor' }
})

// Test for code injection vulnerabilities
execute({
  action: 'mongodb',
  content: 'require("child_process").exec("echo hacked")'  // Should fail!
})

// Test timeout protection
execute({
  action: 'code',
  content: 'while(true) {}'  // Should timeout and fail
})

// Test path traversal protection
execute({
  action: 'file',
  content: 'read',
  options: { path: '../../etc/passwd' }  // Should fail!
})
```

### 10. Security Checklist

Before deploying the MCP Executor:

- [ ] All eval() replaced with Function constructor + sanitization
- [ ] Forbidden patterns list implemented (require, import, eval, etc.)
- [ ] Allowlist of MongoDB operations enforced
- [ ] All credentials moved to environment variables
- [ ] No hardcoded paths or configuration
- [ ] Timeout limits set on all operations (30s default)
- [ ] File operations restricted to project directory
- [ ] Input validation on all user-provided content
- [ ] Bash command sanitization implemented
- [ ] Security tests written and passing
- [ ] Environment variable validation on startup
- [ ] Error messages don't expose sensitive information
- [ ] Logging redacts credentials and tokens
- [ ] Correlation IDs propagated through all operations

### 11. Correlation ID Support

**CRITICAL: All MCP Executor operations must propagate correlation IDs for distributed tracing and debugging.**

See `.claude/patterns/correlation-id-implementation.md` for complete implementation details.

#### Why Correlation IDs Matter

Correlation IDs allow you to trace a single user request across multiple services, making debugging distributed systems significantly easier. Without them, troubleshooting production issues becomes nearly impossible.

#### Implementation in MCP Executor

**1. Accept correlation ID from caller:**

```javascript
class ClenergizeExecutor {
  constructor() {
    this.correlationService = new CorrelationService();
  }

  async execute(action, content, options = {}) {
    const correlationId = options.correlationId || uuidv4();

    return await this.correlationService.run(correlationId, async () => {
      const startTime = Date.now();

      try {
        const result = await this.executeAction(action, content, options);

        this.logger.info('MCP operation completed', {
          action,
          correlationId,
          duration: Date.now() - startTime
        });

        return result;
      } catch (error) {
        this.logger.error('MCP operation failed', {
          action,
          correlationId,
          error: error.message,
          duration: Date.now() - startTime
        });
        throw error;
      }
    });
  }
}
```

**2. Propagate through MongoDB operations:**

```javascript
async executeMongo(queryString, options = {}) {
  const correlationId = this.correlationService.getCorrelationId();
  const client = await this.connectMongo();

  this.logger.info('MongoDB operation starting', {
    query: queryString,
    correlationId
  });

  try {
    const sanitized = this.sanitizeMongoQuery(queryString);
    const executor = new Function('client', `return ${sanitized}`);
    const result = await executor(client);

    this.logger.info('MongoDB operation succeeded', {
      correlationId,
      resultCount: result?.length || 0
    });

    return {
      success: true,
      result: JSON.parse(JSON.stringify(result)),
      correlationId,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    this.logger.error('MongoDB operation failed', {
      correlationId,
      error: error.message
    });

    return {
      success: false,
      error: error.message,
      correlationId,
      timestamp: new Date().toISOString()
    };
  }
}
```

**3. Propagate through HTTP requests (Jira, external APIs):**

```javascript
async executeJira(content, options = {}) {
  const correlationId = this.correlationService.getCorrelationId();

  const response = await fetch(`${this.jiraBaseUrl}/rest/api/3/${content}`, {
    method: options.method || 'GET',
    headers: {
      'Authorization': `Basic ${this.jiraAuth}`,
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId,  // Propagate to external service
      'X-Request-ID': uuidv4()
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  this.logger.info('Jira API call completed', {
    endpoint: content,
    status: response.status,
    correlationId
  });

  return await response.json();
}
```

**4. Include in all log messages:**

```javascript
class Logger {
  constructor(correlationService) {
    this.correlationService = correlationService;
    this.winston = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    });
  }

  info(message, meta = {}) {
    this.winston.info(message, {
      ...meta,
      correlationId: this.correlationService.getCorrelationId(),
      service: 'mcp-executor'
    });
  }

  error(message, meta = {}) {
    this.winston.error(message, {
      ...meta,
      correlationId: this.correlationService.getCorrelationId(),
      service: 'mcp-executor'
    });
  }
}
```

**5. Usage Example:**

```javascript
// Agent calling MCP Executor with correlation ID
const result = await execute({
  action: 'mongodb',
  content: 'db("clenergize_identity").collection("users").find({})',
  options: {
    correlationId: 'req-12345-abc-67890'  // From incoming request
  }
});

// All downstream operations will use this correlation ID
// MongoDB query → correlationId: req-12345-abc-67890
// Logs → correlationId: req-12345-abc-67890
// Jira updates → X-Correlation-ID: req-12345-abc-67890
```

**6. CloudWatch/Grafana Query:**

```
// Find all operations for a specific correlation ID
fields @timestamp, action, correlationId, message
| filter correlationId = "req-12345-abc-67890"
| sort @timestamp asc
```

**Benefits:**

- ✅ Trace user requests across all services and MCP operations
- ✅ Debug production issues by following correlation ID through logs
- ✅ Measure end-to-end latency for operations
- ✅ Identify bottlenecks in distributed workflows
- ✅ Essential for production support and incident response

### 12. Incident Response

**If a security issue is discovered:**

1. **Immediate**: Disable the MCP executor
2. **Assess**: Determine scope of vulnerability
3. **Fix**: Implement patch following secure patterns above
4. **Test**: Run full security test suite
5. **Deploy**: Update executor with fix
6. **Document**: Record in security changelog
7. **Review**: Update this guide with lessons learned

### Reference Implementation

See `IMMEDIATE_FIXES_GUIDE.md` (lines 32-327) for complete secure implementation of the MCP Executor with all security controls.

## Conclusion

The MCP Executor provides a unified, efficient interface for all development operations. By consolidating 15 MCP servers into one executor, we achieve:

- **88% context reduction** (30k vs 249k tokens)
- **Faster responses** from Claude
- **Simplified commands** through single interface
- **Better maintainability** with one configuration point
- **Full functionality** without compromises

This approach, based on Anthropic's engineering best practices, enables efficient development while maintaining all necessary capabilities for the Clenergize V3 project.