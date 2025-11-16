# 🚀 Quick Start with MCP Executor

> **Welcome to Clenergize V3!** This quick start guide uses the new MCP executor pattern that reduces context usage by 88% (from 249k to 30k tokens).

## Prerequisites Check

Before starting, ensure:
- ✅ Docker Desktop is running
- ✅ Node.js v18+ installed
- ✅ Git configured
- ✅ Claude Desktop with MCP Executor configured

## 1. Start Infrastructure

```javascript
// Start all Docker services
execute({ action: 'bash', content: 'docker-compose -f docker-compose.infra.yml up -d' })

// Verify services are running
execute({ action: 'docker', content: 'ps' })

// Check MongoDB connection
execute({ action: 'mongodb', content: 'db.adminCommand({ping: 1})' })
```

## 2. Initialize Git Repository

```javascript
// Initialize repository
execute({ action: 'bash', content: 'git init' })

// Create develop branch
execute({ action: 'git', content: 'checkout -b develop' })

// Initial commit
execute({ action: 'bash', content: 'git add .' })
execute({ action: 'bash', content: 'git commit -m "chore: initial project setup"' })

// Add remote (replace with your repository URL)
execute({ action: 'bash', content: 'git remote add origin https://github.com/youruser/clenergize-v3.git' })
```

## 3. Quick Sprint 0.1 Start

### JWT Implementation (SCRUM-101) - Quick Commands

```javascript
// 1. Start work - Update Jira
execute({ action: 'jira', content: 'SCRUM-101', options: { status: 'In Progress' }})

// 2. Create feature branch
execute({ action: 'git', content: 'checkout -b feature/SCRUM-101-jwt' })

// 3. Generate identity service
execute({ action: 'generate-service', content: 'identity', options: { port: 3001 }})

// 4. Apply JWT security fix (using skill)
execute({ action: 'apply-skill', content: 'jwt-verification-fix', options: { service: 'identity' }})

// 5. Run tests
execute({ action: 'test', content: 'all', options: { service: 'identity' }})

// 6. Commit changes
execute({ action: 'bash', content: 'git add . && git commit -m "feat(identity): implement JWT verification with JWKS"' })

// 7. Push and create PR
execute({ action: 'git', content: 'push origin feature/SCRUM-101-jwt' })

// 8. Update Jira
execute({ action: 'jira', content: 'SCRUM-101', options: { status: 'In Review' }})
```

## 4. Common Quick Commands

### Service Operations
```javascript
// Generate any service quickly
execute({ action: 'generate-service', content: 'organization', options: { port: 3002 }})
execute({ action: 'generate-service', content: 'reference', options: { port: 3003 }})

// Start a service
execute({ action: 'bash', content: 'cd NEW/identity-service && npm run start:dev' })

// Build a service
execute({ action: 'bash', content: 'cd NEW/identity-service && npm run build' })
```

### Database Quick Access
```javascript
// List all databases
execute({ action: 'mongodb', content: 'db.adminCommand({listDatabases: 1})' })

// Quick query
execute({ action: 'mongodb', content: 'db("clenergize_identity").collection("users").find({})' })

// Insert test data
execute({ action: 'mongodb', content: 'db("clenergize_identity").collection("users").insertOne({email: "admin@test.com", role: "admin"})' })
```

### Git Quick Commands
```javascript
// Check status
execute({ action: 'git', content: 'status' })

// Create branch
execute({ action: 'git', content: 'checkout -b feature/new-feature' })

// Quick commit
execute({ action: 'bash', content: 'git add . && git commit -m "feat: description"' })

// Push
execute({ action: 'git', content: 'push origin branch-name' })
```

### Testing Quick Commands
```javascript
// Run all tests for a service
execute({ action: 'test', content: 'all', options: { service: 'identity' }})

// Unit tests only
execute({ action: 'test', content: 'unit', options: { service: 'identity' }})

// Security scan
execute({ action: 'test', content: 'security', options: { service: 'identity' }})
```

### Docker Quick Commands
```javascript
// View logs
execute({ action: 'docker', content: 'logs clenergize-mongodb' })

// Restart service
execute({ action: 'docker', content: 'restart clenergize-mongodb' })

// Stop all
execute({ action: 'bash', content: 'docker-compose -f docker-compose.infra.yml down' })
```

## 5. Sprint 0.1 Complete Flow (2 Weeks)

### Week 1: Security Foundation

#### Day 1-2: JWT Verification (SCRUM-101)
```javascript
// Morning
execute({ action: 'jira', content: 'SCRUM-101', options: { status: 'In Progress' }})
execute({ action: 'git', content: 'checkout -b feature/SCRUM-101-jwt' })
execute({ action: 'generate-service', content: 'identity', options: { port: 3001 }})

// Implement
execute({ action: 'apply-skill', content: 'jwt-verification-fix', options: { service: 'identity' }})

// Test
execute({ action: 'test', content: 'all', options: { service: 'identity' }})

// Complete
execute({ action: 'bash', content: 'git add . && git commit -m "feat: JWT verification"' })
execute({ action: 'git', content: 'push origin feature/SCRUM-101-jwt' })
execute({ action: 'jira', content: 'SCRUM-101', options: { status: 'Done' }})
```

#### Day 3-4: Secrets Management (SCRUM-102)
```javascript
// Start
execute({ action: 'jira', content: 'SCRUM-102', options: { status: 'In Progress' }})
execute({ action: 'git', content: 'checkout -b feature/SCRUM-102-secrets' })

// Implement AWS Secrets Manager integration
execute({ action: 'apply-skill', content: 'secrets-management', options: { service: 'all' }})

// Test
execute({ action: 'test', content: 'all', options: { service: 'identity' }})

// Complete
execute({ action: 'bash', content: 'git add . && git commit -m "feat: secrets management"' })
execute({ action: 'git', content: 'push origin feature/SCRUM-102-secrets' })
execute({ action: 'jira', content: 'SCRUM-102', options: { status: 'Done' }})
```

#### Day 5: GitHub Actions (SCRUM-141)
```javascript
// Start
execute({ action: 'jira', content: 'SCRUM-141', options: { status: 'In Progress' }})
execute({ action: 'git', content: 'checkout -b feature/SCRUM-141-github-actions' })

// Create CI/CD pipeline
execute({
  action: 'file',
  content: 'write',
  options: {
    path: '.github/workflows/ci.yml',
    data: `
name: CI Pipeline
on:
  push:
    branches: [develop, main]
  pull_request:
    branches: [develop]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm test
      - run: npm run lint
    `
  }
})

// Complete
execute({ action: 'bash', content: 'git add . && git commit -m "ci: add GitHub Actions"' })
execute({ action: 'git', content: 'push origin feature/SCRUM-141-github-actions' })
execute({ action: 'jira', content: 'SCRUM-141', options: { status: 'Done' }})
```

### Week 2: Core Services

#### Day 6-7: Rate Limiting (SCRUM-103)
```javascript
execute({ action: 'jira', content: 'SCRUM-103', options: { status: 'In Progress' }})
execute({ action: 'git', content: 'checkout -b feature/SCRUM-103-rate-limiting' })
execute({ action: 'apply-skill', content: 'rate-limiting', options: { service: 'all' }})
execute({ action: 'test', content: 'all', options: { service: 'identity' }})
execute({ action: 'bash', content: 'git add . && git commit -m "feat: rate limiting"' })
execute({ action: 'jira', content: 'SCRUM-103', options: { status: 'Done' }})
```

#### Day 8-9: Input Validation (SCRUM-104)
```javascript
execute({ action: 'jira', content: 'SCRUM-104', options: { status: 'In Progress' }})
execute({ action: 'git', content: 'checkout -b feature/SCRUM-104-validation' })
execute({ action: 'apply-skill', content: 'input-validation', options: { service: 'all' }})
execute({ action: 'test', content: 'all', options: { service: 'identity' }})
execute({ action: 'bash', content: 'git add . && git commit -m "feat: input validation"' })
execute({ action: 'jira', content: 'SCRUM-104', options: { status: 'Done' }})
```

#### Day 10: Error Handling (SCRUM-105)
```javascript
execute({ action: 'jira', content: 'SCRUM-105', options: { status: 'In Progress' }})
execute({ action: 'git', content: 'checkout -b feature/SCRUM-105-error-handling' })
execute({ action: 'apply-skill', content: 'error-handling', options: { service: 'all' }})
execute({ action: 'test', content: 'all', options: { service: 'identity' }})
execute({ action: 'bash', content: 'git add . && git commit -m "feat: error handling"' })
execute({ action: 'jira', content: 'SCRUM-105', options: { status: 'Done' }})
```

## 6. Quick Debugging Commands

### Check System Status
```javascript
// Docker services
execute({ action: 'docker', content: 'ps' })

// MongoDB status
execute({ action: 'mongodb', content: 'db.adminCommand({ping: 1})' })

// Redis status
execute({ action: 'redis', content: 'PING' })

// Git status
execute({ action: 'git', content: 'status' })
```

### View Logs
```javascript
// MongoDB logs
execute({ action: 'docker', content: 'logs --tail 50 clenergize-mongodb' })

// Service logs
execute({ action: 'bash', content: 'cd NEW/identity-service && npm run start:dev' })
```

### Fix Common Issues
```javascript
// Restart Docker services
execute({ action: 'bash', content: 'docker-compose -f docker-compose.infra.yml restart' })

// Clear Redis cache
execute({ action: 'redis', content: 'FLUSHALL' })

// Fix npm issues
execute({ action: 'bash', content: 'cd NEW/identity-service && rm -rf node_modules package-lock.json && npm install' })
```

## 7. Daily Workflow Template

### Morning Routine
```javascript
// 1. Check sprint status
execute({ action: 'jira', content: 'sprint-status' })

// 2. Pull latest changes
execute({ action: 'git', content: 'checkout develop' })
execute({ action: 'git', content: 'pull origin develop' })

// 3. Start Docker services
execute({ action: 'bash', content: 'docker-compose -f docker-compose.infra.yml up -d' })

// 4. Pick up ticket
execute({ action: 'jira', content: 'SCRUM-XXX', options: { status: 'In Progress' }})

// 5. Create feature branch
execute({ action: 'git', content: 'checkout -b feature/SCRUM-XXX-description' })
```

### During Development
```javascript
// Run tests frequently
execute({ action: 'test', content: 'unit', options: { service: 'identity' }})

// Check code quality
execute({ action: 'bash', content: 'cd NEW/identity-service && npm run lint' })

// Commit regularly
execute({ action: 'bash', content: 'git add . && git commit -m "wip: description"' })
```

### End of Day
```javascript
// 1. Run all tests
execute({ action: 'test', content: 'all', options: { service: 'identity' }})

// 2. Commit final changes
execute({ action: 'bash', content: 'git add . && git commit -m "feat: completed feature"' })

// 3. Push to remote
execute({ action: 'git', content: 'push origin feature/SCRUM-XXX-description' })

// 4. Update Jira
execute({ action: 'jira', content: 'SCRUM-XXX', options: { comment: 'Progress update' }})

// 5. Stop services (optional)
execute({ action: 'bash', content: 'docker-compose -f docker-compose.infra.yml down' })
```

## 8. Skill Application Commands

Apply pre-built skills to accelerate development:

```javascript
// Apply JWT verification fix
execute({ action: 'apply-skill', content: 'jwt-verification-fix', options: { service: 'identity' }})

// Apply MongoDB transaction helper
execute({ action: 'apply-skill', content: 'mongodb-transaction-helper', options: { service: 'all' }})

// Apply error taxonomy
execute({ action: 'apply-skill', content: 'error-taxonomy', options: { service: 'all' }})

// Apply security scanner
execute({ action: 'apply-skill', content: 'security-scanner', options: { service: 'identity' }})

// Apply SQS polling fix
execute({ action: 'apply-skill', content: 'sqs-polling-fix', options: { service: 'calculation' }})

// Apply denormalization fix
execute({ action: 'apply-skill', content: 'denormalization-fix', options: { service: 'organization' }})
```

## 9. Service Port Reference

Quick reference for service ports:

| Service | Port | Database |
|---------|------|----------|
| Identity | 3001 | clenergize_identity |
| Organization | 3002 | clenergize_organization |
| Reference | 3003 | clenergize_reference |
| Activity | 3004 | clenergize_activity |
| Calculation | 3005 | clenergize_calculation |
| Reporting | 3006 | clenergize_reporting |
| Audit | 3007 | clenergize_audit |
| Frontend | 3000 | - |

## 10. Emergency Commands

If things go wrong:

```javascript
// Stop everything
execute({ action: 'bash', content: 'docker-compose -f docker-compose.infra.yml down' })
execute({ action: 'bash', content: 'docker system prune -a' })

// Reset Git (careful!)
execute({ action: 'git', content: 'reset --hard HEAD' })
execute({ action: 'git', content: 'clean -fd' })

// Restore from develop
execute({ action: 'git', content: 'checkout develop' })
execute({ action: 'git', content: 'pull origin develop' })

// Clear all MongoDB data (careful!)
execute({ action: 'mongodb', content: 'db.dropDatabase()' })

// Restart Claude Desktop if executor stops responding
```

## 📚 Critical Security Issues Reference

| Code | Issue | Fix Command |
|------|-------|-------------|
| C1 | JWT decode without verification | `execute({ action: 'apply-skill', content: 'jwt-verification-fix', options: { service: 'identity' }})` |
| C2 | Infinite SQS polling | `execute({ action: 'apply-skill', content: 'sqs-polling-fix', options: { service: 'calculation' }})` |
| C3 | Hierarchy cloning (300% bloat) | `execute({ action: 'apply-skill', content: 'hierarchy-reference-fix', options: { service: 'organization' }})` |
| C6 | No transactions | `execute({ action: 'apply-skill', content: 'mongodb-transaction-helper', options: { service: 'all' }})` |
| C7 | Hardcoded secrets | `execute({ action: 'apply-skill', content: 'secrets-management', options: { service: 'all' }})` |

## 📊 Success Metrics

### Sprint 0.1 Completion Criteria
- ✅ All JWT vulnerabilities fixed (0 instances of jwt.decode without verify)
- ✅ Docker environment running (all 7 services + infrastructure)
- ✅ Base service templates created (with all C1-C10 fixes)
- ✅ 80% unit test coverage
- ✅ Security scan passing (no critical issues)

## 🎯 Key Benefits of MCP Executor

- **88% less context usage**: 30k tokens vs 249k tokens
- **Single unified interface**: All operations through `execute()`
- **Faster responses**: Less context = faster processing
- **More available context**: More space for your code
- **Consistent patterns**: Same pattern for all operations

## Remember

- **One command for everything**: Use `execute()` for all operations
- **Context is precious**: We're using only 30k tokens instead of 249k
- **Test everything**: Run tests after every change
- **Commit often**: Small, atomic commits
- **Update Jira**: Keep tickets current

## Next Steps

1. **Read**: [CLAUDE.md](.claude/CLAUDE.md) - Master configuration
2. **Review**: [development-commands.md](.claude/commands/development-commands.md) - All available commands
3. **Start**: Begin with JWT verification (SCRUM-101) above
4. **Ask**: Use Master Coordinator for questions

Ready to start development! 🚀
