# Development Commands (Updated for MCP Executor)

## Overview
All commands now use the single `execute` function with the MCP executor pattern.
This reduces context usage by 88% while maintaining all functionality.

## Service Generation

### Generate New Service
```javascript
// Generate complete NestJS microservice
execute({
  action: 'generate-service',
  content: 'identity',  // service name
  options: {
    port: 3001,
    database: 'clenergize_identity'
  }
})

// Generate other services
execute({ action: 'generate-service', content: 'organization', options: { port: 3002 }})
execute({ action: 'generate-service', content: 'reference', options: { port: 3003 }})
execute({ action: 'generate-service', content: 'activity', options: { port: 3004 }})
execute({ action: 'generate-service', content: 'calculation', options: { port: 3005 }})
execute({ action: 'generate-service', content: 'reporting', options: { port: 3006 }})
execute({ action: 'generate-service', content: 'audit', options: { port: 3007 }})
```

### Add Module to Service
```javascript
// Add auth module to identity service
execute({
  action: 'code',
  content: 'generate-module',
  options: {
    service: 'identity',
    module: 'auth'
  }
})
```

## Database Operations

### MongoDB Queries
```javascript
// List all databases
execute({ action: 'mongodb', content: 'db.adminCommand({listDatabases: 1})' })

// Access specific database
execute({ action: 'mongodb', content: 'db("clenergize_identity").collection("users").find({})' })

// Insert document
execute({
  action: 'mongodb',
  content: 'db("clenergize_identity").collection("users").insertOne({email: "test@example.com", role: "admin"})'
})

// Update document
execute({
  action: 'mongodb',
  content: 'db("clenergize_identity").collection("users").updateOne({email: "test@example.com"}, {$set: {verified: true}})'
})

// Delete document
execute({
  action: 'mongodb',
  content: 'db("clenergize_identity").collection("users").deleteOne({email: "test@example.com"})'
})

// Aggregate query
execute({
  action: 'mongodb',
  content: `db("clenergize_organization").collection("projects").aggregate([
    {$match: {status: "active"}},
    {$group: {_id: "$company", count: {$sum: 1}}}
  ])`
})
```

### Database Management
```javascript
// Create collection with indexes
execute({
  action: 'mongodb',
  content: `
    db("clenergize_identity").createCollection("users");
    db("clenergize_identity").collection("users").createIndex({email: 1}, {unique: true});
  `
})

// Check collection stats
execute({
  action: 'mongodb',
  content: 'db("clenergize_identity").collection("users").stats()'
})
```

## Git Workflow

### Branch Management
```javascript
// Check status
execute({ action: 'git', content: 'status' })

// Create and switch to feature branch
execute({ action: 'git', content: 'checkout -b feature/SCRUM-101-jwt-verification' })

// Switch branches
execute({ action: 'git', content: 'checkout develop' })

// Pull latest changes
execute({ action: 'git', content: 'pull origin develop' })

// List branches
execute({ action: 'git', content: 'branch -a' })
```

### Committing Changes
```javascript
// Stage all changes
execute({ action: 'bash', content: 'git add .' })

// Stage specific files
execute({ action: 'bash', content: 'git add NEW/identity-service/*' })

// Commit with message
execute({ action: 'bash', content: 'git commit -m "feat(identity): implement JWT verification with JWKS"' })

// Amend last commit
execute({ action: 'bash', content: 'git commit --amend -m "feat(identity): implement JWT verification with JWKS and tests"' })
```

### Remote Operations
```javascript
// Push to remote
execute({ action: 'git', content: 'push origin feature/SCRUM-101-jwt-verification' })

// Force push (use carefully)
execute({ action: 'git', content: 'push -f origin feature/SCRUM-101-jwt-verification' })

// Fetch remote changes
execute({ action: 'git', content: 'fetch origin' })

// Create pull request
execute({
  action: 'github',
  content: 'create-pr',
  options: {
    title: '[SCRUM-101] JWT Verification with JWKS',
    body: 'Implements proper JWT verification using JWKS endpoint',
    base: 'develop',
    head: 'feature/SCRUM-101-jwt-verification'
  }
})
```

## Testing Commands

### Unit Tests
```javascript
// Run unit tests for a service
execute({ action: 'test', content: 'unit', options: { service: 'identity' }})

// Run specific test file
execute({
  action: 'bash',
  content: 'cd NEW/identity-service && npm test -- jwt-verification.service.spec.ts'
})

// Run tests in watch mode
execute({
  action: 'bash',
  content: 'cd NEW/identity-service && npm run test:watch'
})
```

### Integration Tests
```javascript
// Run e2e tests
execute({ action: 'test', content: 'e2e', options: { service: 'identity' }})

// Run specific e2e test
execute({
  action: 'bash',
  content: 'cd NEW/identity-service && npm run test:e2e -- auth.e2e-spec.ts'
})
```

### Coverage Reports
```javascript
// Generate coverage report
execute({ action: 'test', content: 'coverage', options: { service: 'identity' }})

// View coverage summary
execute({
  action: 'bash',
  content: 'cd NEW/identity-service && npm run test:cov'
})
```

### Security Testing
```javascript
// Run security scan
execute({ action: 'test', content: 'security', options: { service: 'identity' }})

// Check for vulnerabilities
execute({
  action: 'bash',
  content: 'cd NEW/identity-service && npm audit'
})

// Fix vulnerabilities
execute({
  action: 'bash',
  content: 'cd NEW/identity-service && npm audit fix'
})
```

## Docker Operations

### Container Management
```javascript
// List running containers
execute({ action: 'docker', content: 'ps' })

// List all containers
execute({ action: 'docker', content: 'ps -a' })

// Start infrastructure
execute({ action: 'bash', content: 'docker-compose -f docker-compose.infra.yml up -d' })

// Stop infrastructure
execute({ action: 'bash', content: 'docker-compose -f docker-compose.infra.yml down' })

// Restart specific service
execute({ action: 'docker', content: 'restart clenergize-mongodb' })
```

### Logs and Debugging
```javascript
// View container logs
execute({ action: 'docker', content: 'logs clenergize-mongodb' })

// Follow logs
execute({ action: 'docker', content: 'logs -f clenergize-mongodb' })

// Execute command in container
execute({ action: 'docker', content: 'exec clenergize-mongodb mongosh -u admin -p localdev123' })
```

### Docker Compose
```javascript
// Build services
execute({ action: 'bash', content: 'docker-compose -f docker-compose.dev.yml build' })

// Start all services
execute({ action: 'bash', content: 'docker-compose -f docker-compose.dev.yml up -d' })

// View compose status
execute({ action: 'bash', content: 'docker-compose -f docker-compose.dev.yml ps' })
```

## Jira Operations

### Ticket Management
```javascript
// Update ticket status
execute({ action: 'jira', content: 'SCRUM-101', options: { status: 'In Progress' }})

// Add comment to ticket
execute({
  action: 'jira',
  content: 'SCRUM-101',
  options: {
    comment: 'JWT implementation completed, moving to testing phase'
  }
})

// Create new ticket
execute({
  action: 'jira',
  content: 'create',
  options: {
    type: 'Bug',
    summary: 'JWT token expiry not validated',
    description: 'Tokens are accepted even after expiry',
    priority: 'High',
    component: 'identity-service'
  }
})

// Assign ticket
execute({
  action: 'jira',
  content: 'SCRUM-101',
  options: {
    assignee: 'developer@company.com'
  }
})
```

### Sprint Management
```javascript
// Start sprint
execute({
  action: 'jira',
  content: 'sprint',
  options: {
    action: 'start',
    name: 'Sprint 0.1 - Security Foundation',
    duration: '2 weeks'
  }
})

// Add story to sprint
execute({
  action: 'jira',
  content: 'sprint',
  options: {
    action: 'add-story',
    story: 'SCRUM-102'
  }
})
```

## File Operations

### Read Files
```javascript
// Read file content
execute({ action: 'file', content: 'read', options: { path: 'NEW/identity-service/package.json' }})

// List directory
execute({ action: 'file', content: 'list', options: { path: 'NEW/identity-service/src' }})

// Check if file exists
execute({ action: 'file', content: 'exists', options: { path: 'NEW/identity-service/.env' }})
```

### Write Files
```javascript
// Create new file
execute({
  action: 'file',
  content: 'write',
  options: {
    path: 'NEW/identity-service/src/auth/jwt-verification.service.ts',
    data: `
import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as jwksClient from 'jwks-rsa';

@Injectable()
export class JwtVerificationService {
  // Implementation here
}
    `
  }
})

// Append to file
execute({
  action: 'file',
  content: 'append',
  options: {
    path: '.gitignore',
    data: '\n# Environment files\n.env\n.env.local'
  }
})
```

### File Management
```javascript
// Copy file
execute({
  action: 'bash',
  content: 'cp .env.example .env'
})

// Move/rename file
execute({
  action: 'bash',
  content: 'mv old-file.ts new-file.ts'
})

// Delete file
execute({
  action: 'bash',
  content: 'rm temp-file.txt'
})

// Create directory
execute({
  action: 'bash',
  content: 'mkdir -p NEW/identity-service/src/auth/guards'
})
```

## Environment Setup

### NPM Operations
```javascript
// Install dependencies
execute({
  action: 'bash',
  content: 'cd NEW/identity-service && npm install'
})

// Add new package
execute({
  action: 'bash',
  content: 'cd NEW/identity-service && npm install jsonwebtoken jwks-rsa'
})

// Add dev dependency
execute({
  action: 'bash',
  content: 'cd NEW/identity-service && npm install -D @types/jsonwebtoken'
})

// Update packages
execute({
  action: 'bash',
  content: 'cd NEW/identity-service && npm update'
})
```

### Environment Variables
```javascript
// Create .env file
execute({
  action: 'file',
  content: 'write',
  options: {
    path: 'NEW/identity-service/.env',
    data: `
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://admin:localdev123@localhost:27017/clenergize_identity?authSource=admin
JWT_SECRET=development-secret-key
JWKS_URI=https://cognito.amazonaws.com/.well-known/jwks.json
    `
  }
})
```

## Build and Deploy

### Build Service
```javascript
// Build for development
execute({
  action: 'bash',
  content: 'cd NEW/identity-service && npm run build'
})

// Build for production
execute({
  action: 'bash',
  content: 'cd NEW/identity-service && npm run build:prod'
})

// Build Docker image
execute({
  action: 'bash',
  content: 'docker build -t clenergize-identity:latest NEW/identity-service'
})
```

### Run Service
```javascript
// Start in development mode
execute({
  action: 'bash',
  content: 'cd NEW/identity-service && npm run start:dev'
})

// Start in production mode
execute({
  action: 'bash',
  content: 'cd NEW/identity-service && npm run start:prod'
})

// Start with PM2
execute({
  action: 'bash',
  content: 'cd NEW/identity-service && pm2 start dist/main.js --name identity-service'
})
```

## Utility Commands

### Code Quality
```javascript
// Run linter
execute({
  action: 'bash',
  content: 'cd NEW/identity-service && npm run lint'
})

// Fix linting issues
execute({
  action: 'bash',
  content: 'cd NEW/identity-service && npm run lint:fix'
})

// Format code
execute({
  action: 'bash',
  content: 'cd NEW/identity-service && npm run format'
})
```

### Documentation
```javascript
// Generate API documentation
execute({
  action: 'bash',
  content: 'cd NEW/identity-service && npm run docs:generate'
})

// Serve documentation
execute({
  action: 'bash',
  content: 'cd NEW/identity-service && npm run docs:serve'
})
```

### Monitoring
```javascript
// Check service health
execute({
  action: 'http',
  content: 'GET',
  options: {
    url: 'http://localhost:3001/health'
  }
})

// View service metrics
execute({
  action: 'http',
  content: 'GET',
  options: {
    url: 'http://localhost:3001/metrics'
  }
})
```

## Redis Operations
```javascript
// Set cache value
execute({ action: 'redis', content: 'SET user:123 {"name":"John","role":"admin"}' })

// Get cache value
execute({ action: 'redis', content: 'GET user:123' })

// Delete cache key
execute({ action: 'redis', content: 'DEL user:123' })

// Clear all cache
execute({ action: 'redis', content: 'FLUSHALL' })
```

## AWS/LocalStack Operations
```javascript
// List S3 buckets
execute({ action: 'aws', content: 's3 ls' })

// Create S3 bucket
execute({ action: 'aws', content: 's3 mb s3://clenergize-uploads' })

// Get secret from Secrets Manager
execute({ action: 'aws', content: 'secretsmanager get-secret-value --secret-id jwt-secret' })

// Send SQS message
execute({
  action: 'aws',
  content: 'sqs send-message --queue-url http://localhost:4566/000000000000/calculation-queue --message-body "{"task":"calculate"}"'
})
```

## Quick Command Reference

| Action | Command |
|--------|---------|
| Generate service | `execute({ action: 'generate-service', content: 'identity', options: { port: 3001 }})` |
| Run tests | `execute({ action: 'test', content: 'unit', options: { service: 'identity' }})` |
| Git commit | `execute({ action: 'bash', content: 'git add . && git commit -m "message"' })` |
| Update Jira | `execute({ action: 'jira', content: 'SCRUM-101', options: { status: 'In Progress' }})` |
| MongoDB query | `execute({ action: 'mongodb', content: 'db("clenergize_identity").collection("users").find({})' })` |
| Docker logs | `execute({ action: 'docker', content: 'logs container-name' })` |
| Install packages | `execute({ action: 'bash', content: 'cd service && npm install' })` |
| Build service | `execute({ action: 'bash', content: 'cd service && npm run build' })` |

Remember: All operations now go through the single `execute` command with appropriate actions and options.
