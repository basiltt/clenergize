# 🚀 Claude Code Multi-Agent System - Quick Start Guide

> **Welcome to the Clenergize V3 Migration Project!** This guide will help you get started with the Claude Code multi-agent configuration system designed to migrate from problematic legacy code (OLD/) to clean microservices architecture (NEW/).

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Critical Issues We're Fixing](#critical-issues-were-fixing)
3. [Agent System Architecture](#agent-system-architecture)
4. [Getting Started](#getting-started)
5. [Available Commands](#available-commands)
6. [Using Skills](#using-skills)
7. [Sprint 0.1 Tasks](#sprint-01-tasks)
8. [Common Workflows](#common-workflows)
9. [Troubleshooting](#troubleshooting)

## 🎯 Project Overview

**Project**: Clenergize V3 - Enterprise Carbon Footprint Management Platform
**Architecture**: Microservices (NestJS + Next.js 15)
**Timeline**: 8 months (16 sprints)
**Current Sprint**: 0.1 - Security Foundation & Local Development (Day 1/10)

### Directory Structure
```
ClenergizeV3/
├── .claude/               # Claude Code configuration
│   ├── agents/           # 14 specialized agent configs
│   ├── skills/           # 10 reusable skill patterns
│   ├── commands/         # 5 command categories
│   └── CLAUDE.md         # Master configuration
├── OLD/                  # Legacy code (READ ONLY!)
│   └── [7 problematic services]
├── NEW/                  # Clean microservices
│   ├── identity-service/     (port 3001)
│   ├── organization-service/ (port 3002)
│   ├── reference-service/    (port 3003)
│   ├── activity-service/     (port 3004)
│   ├── calculation-service/  (port 3005)
│   ├── reporting-service/    (port 3006)
│   ├── audit-service/        (port 3007)
│   └── frontend/            (port 3000)
└── docker-compose.dev.yml
```

## 🔴 Critical Issues We're Fixing

The OLD codebase has 10 critical issues (C1-C10) that MUST be fixed:

| Code | Issue | Severity | Impact | Fix |
|------|-------|----------|--------|-----|
| **C1** | JWT decode without verification | CRITICAL | Security breach | Use JWKS verification |
| **C2** | Infinite SQS polling loops | HIGH | System crashes | Add cancellation tokens |
| **C3** | Hierarchy cloning | HIGH | 300% data bloat | Use references |
| **C6** | No transaction boundaries | HIGH | Data corruption | Add MongoDB transactions |
| **C7** | Hardcoded secrets | CRITICAL | Security risk | Use AWS Secrets Manager |

## 🤖 Agent System Architecture

### The 14 Specialized Agents

1. **Master Coordinator** - Orchestrates all agents
2. **Security Agent** - Fixes JWT and security issues
3. **Identity Agent** - User management (port 3001)
4. **Organization Agent** - Projects & hierarchies (port 3002)
5. **Reference Agent** - Emission factors (port 3003)
6. **Activity Agent** - Data collection (port 3004)
7. **Calculation Agent** - Emissions math (port 3005)
8. **Reporting Agent** - Reports & exports (port 3006)
9. **Audit Agent** - Compliance logging (port 3007)
10. **Frontend Agent** - Next.js UI
11. **DevOps Agent** - Docker & AWS
12. **Testing Agent** - Quality assurance
13. **Migration Agent** - Data transformation
14. **Architecture Agent** - System design

### When to Use Opus 4.1 (5% Max)

Use Opus 4.1 ONLY for:
- JWT/JWKS architecture design
- Complex emission calculations
- Hierarchy migration logic
- Distributed transaction patterns
- Service dependency resolution

## 🚀 Getting Started

### 1. Initial Setup
```bash
# Clone the repository
git clone https://github.com/yourcompany/clenergize-v3-rebuild.git
cd clenergize-v3-rebuild

# Start Docker environment
docker-compose -f docker-compose.dev.yml up -d

# Verify services
curl http://localhost:3001/health  # Identity service
curl http://localhost:3002/health  # Organization service
# ... etc
```

### 2. Check Sprint Status
```bash
# Use Claude Code command
/sprint-status

# Expected output:
Sprint 0.1 - Security Foundation & Local Development
Day: 1 of 10
Progress: 0% (0 of 45 story points)
Key Tasks:
- Fix JWT verification (C1)
- Setup Docker environment
- Create base service templates
```

### 3. Assign Tasks to Agents
```bash
# Assign JWT fix to Security Agent
/assign-task CLNZ-101 security-agent

# Assign Docker setup to DevOps Agent
/assign-task CLNZ-102 devops-agent
```

## 📝 Available Commands

### Project Management
- `/sprint-status` - View current sprint progress
- `/daily-sync` - Collect status from all agents
- `/assign-task [CLNZ-XXX] [agent]` - Assign ticket to agent
- `/blocker-report [issue]` - Escalate blocking issues

### Development
- `/generate-service [name] [type]` - Create new microservice
- `/fix-old-issue [C1-C10] [service]` - Apply specific fix
- `/generate-crud [service] [entity]` - Generate CRUD operations
- `/add-endpoint [service] [method] [path]` - Add API endpoint

### Security
- `/verify-jwt [token]` - Verify JWT with JWKS
- `/scan-secrets [path]` - Find hardcoded secrets
- `/security-audit [service]` - Full security check
- `/fix-jwt-vulnerability [service]` - Fix C1 issue

### Migration
- `/migrate-hierarchy [old] [new]` - Fix C3 cloning issue
- `/normalize-data [collection] [field]` - Fix denormalization
- `/validate-migration [old] [new]` - Verify data integrity

### Testing
- `/run-tests [service] [type]` - Execute tests
- `/coverage-check [service] [threshold]` - Check coverage
- `/run-e2e [flow]` - Run end-to-end tests
- `/performance-test [service] [scenario]` - Load testing

## 🛠️ Using Skills

Skills are reusable patterns that fix specific OLD code issues:

### JWT Verification Fix (C1)
```typescript
// Skill: jwt-verification-fix
// OLD (VULNERABLE):
const payload = jwt.decode(token);  // NO VERIFICATION!

// NEW (SECURE):
import jwksRsa from 'jwks-rsa';
const jwksClient = jwksRsa({
  jwksUri: 'https://cognito.amazonaws.com/.well-known/jwks.json'
});
const key = await jwksClient.getSigningKey(kid);
const payload = jwt.verify(token, key.getPublicKey());
```

### Hierarchy Migration (C3)
```typescript
// Skill: hierarchy-migration
// OLD: 300% data bloat
project.hierarchy = deepClone(templateHierarchy);  // 50KB per project!

// NEW: Reference pattern
project.hierarchyRef = templateId;  // 24 bytes only!
// 97% storage reduction!
```

### Transaction Helper (C6)
```typescript
// Skill: mongodb-transaction-helper
const session = await mongoose.startSession();
await session.withTransaction(async () => {
  await collection.insertOne(doc, { session });
  await eventBus.publish(event);
});
```

## 📅 Sprint 0.1 Tasks

**Duration**: 10 days
**Story Points**: 45
**Critical Path**: JWT → Docker → Services

### Day 1-2: Security Foundation
- [ ] Fix JWT verification in all services (C1)
- [ ] Remove hardcoded secrets (C7)
- [ ] Setup AWS Secrets Manager

### Day 3-4: Docker Environment
- [ ] Create docker-compose.dev.yml
- [ ] Setup LocalStack for AWS services
- [ ] Configure MongoDB replica set
- [ ] Setup Redis for caching/pubsub

### Day 5-7: Base Services
- [ ] Generate identity-service with auth
- [ ] Generate organization-service with hierarchy refs
- [ ] Create shared event contracts
- [ ] Implement health checks

### Day 8-9: Testing & Integration
- [ ] Unit tests (80% coverage)
- [ ] Integration tests
- [ ] Security scanning
- [ ] Performance baseline

### Day 10: Documentation & Handoff
- [ ] Update API documentation
- [ ] Create deployment guide
- [ ] Sprint retrospective
- [ ] Plan Sprint 0.2

## 🔄 Common Workflows

### Creating a New Service
```bash
# 1. Generate service structure
/generate-service notification-service standard

# 2. Fix OLD issues proactively
/fix-old-issue C1 notification-service  # JWT
/fix-old-issue C6 notification-service  # Transactions

# 3. Add CRUD operations
/generate-crud notification-service notification

# 4. Run tests
/run-tests notification-service all

# 5. Add to Docker
/docker-up notification-service
```

### Migrating from OLD Service
```bash
# 1. Analyze OLD service issues
/analyze-old-issues OLD/clenergizeV3-user-management-ms-dev

# 2. Create migration plan
/migration-plan OLD/clenergizeV3-user-management-ms-dev NEW/identity-service

# 3. Export data
/export-old-data clenergizeV3-user-management-ms-dev json

# 4. Transform and import
/import-to-new identity-service exports/users.json

# 5. Validate migration
/validate-migration OLD/clenergizeV3-user-management-ms-dev NEW/identity-service
```

### Daily Development Flow
```bash
# Morning
/daily-sync                    # Get status from all agents
/sprint-status                 # Check progress

# During development
/fix-old-issue C1 identity    # Fix issues as you find them
/test-impact-analysis HEAD    # Run relevant tests only

# Before commit
/scan-secrets .                # Security check
/coverage-check identity 80    # Verify coverage

# End of day
/blocker-report "Need help with JWT implementation"
```

## ❗ Troubleshooting

### Common Issues

#### JWT Verification Failing
```bash
# Check JWKS configuration
/verify-jwt "your-token-here"

# If failing, run security audit
/security-audit identity-service

# Apply automatic fix
/fix-jwt-vulnerability identity-service
```

#### Service Not Starting
```bash
# Check health
/health-check-all

# View logs
docker logs clenergize-identity-service

# Reset service
/reset-service identity-service
```

#### Migration Data Mismatch
```bash
# Validate data integrity
/validate-migration OLD/service NEW/service

# Check for broken references
/fix-references organization-service

# Rollback if needed
/rollback-migration organization-service previous-version
```

### Getting Help

1. **Blockers**: Use `/blocker-report` to escalate
2. **Architecture**: Consult Architecture Agent
3. **Security**: Always escalate to Security Agent
4. **Data Loss Risk**: Immediate escalation to Migration Agent + Master Coordinator

## 📊 Success Metrics

### Sprint 0.1 Completion Criteria
- ✅ All JWT vulnerabilities fixed (0 instances of jwt.decode without verify)
- ✅ Docker environment running (all 7 services + infrastructure)
- ✅ Base service templates created (with all C1-C10 fixes)
- ✅ 80% unit test coverage
- ✅ Security scan passing (no critical issues)

### Key Performance Indicators
- **Storage Reduction**: 97% (hierarchy references)
- **Query Performance**: 84% faster
- **Security Score**: 10/10 (from 3/10)
- **Test Coverage**: 80%+ (from 0%)
- **Code Quality**: A rating (from D)

## 🎓 Learning Resources

### Key Documentation
1. `.claude/CLAUDE.md` - Master configuration (READ FIRST!)
2. `.claude/agents/*.md` - Individual agent specs
3. `.claude/skills/*.md` - Reusable patterns
4. `.claude/commands/*.md` - Available commands
5. `OLD/DESIGN-REVIEW.md` - Critical issues list

### Best Practices
- **NEVER** copy-paste from OLD code
- **ALWAYS** verify JWT tokens properly
- **USE** transactions for multi-step operations
- **IMPLEMENT** proper error handling
- **ADD** tests for all new code

## 🚦 Quick Decision Tree

```
Need to make a decision?
├─ Is it security-related? → Security Agent
├─ Is it about architecture? → Architecture Agent
├─ Is it a complex calculation? → Calculation Agent (maybe Opus 4.1)
├─ Is it data migration? → Migration Agent
├─ Is it about testing? → Testing Agent
├─ Is it frontend? → Frontend Agent
└─ Not sure? → Master Coordinator
```

## 📞 Emergency Contacts

- **Slack Channel**: #clenergize-rebuild
- **Jira Board**: CLNZ project
- **GitHub**: github.com/yourcompany/clenergize-v3-rebuild
- **Master Coordinator**: Available 24/7 via `/daily-sync`

---

**Remember**: You're rebuilding a critical enterprise system. Every decision matters. Follow the patterns, maintain quality, and escalate concerns immediately.

**Good luck with Sprint 0.1! 🚀**