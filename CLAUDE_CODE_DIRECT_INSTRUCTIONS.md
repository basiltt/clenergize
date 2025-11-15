# COPY THIS INTO CLAUDE CODE

## Direct Instructions for Claude Code

Please generate the complete Claude Code configuration structure for the Clenergize V3 project. Create all necessary files in the .claude/ directory following these specifications:

### Task 1: Create Directory Structure
```bash
mkdir -p .claude/agents
mkdir -p .claude/skills  
mkdir -p .claude/commands
```

### Task 2: Generate All 14 Agent Files

Create these files in `.claude/agents/`:

1. **master-coordinator.md** - Orchestrates all agents, manages sprint planning, uses Sonnet only
2. **architecture-agent.md** - System design, API contracts, uses Opus for dependency resolution
3. **security-agent.md** - JWT/JWKS implementation, uses Opus for crypto design
4. **identity-agent.md** - Port 3001, references OLD/clenergizeV3-user-management-ms-dev
5. **organization-agent.md** - Port 3002, references OLD/clenergizeV3-project-management-ms-dev
6. **reference-agent.md** - Port 3003, references OLD/clenergizeV3-master-data-ms-dev
7. **activity-agent.md** - Port 3004, references OLD/clenergizeV3-carbon-footprint-ms-dev
8. **calculation-agent.md** - Port 3005, references OLD/clenergizeV3-carbon-footprint-ms-dev, uses Opus for algorithms
9. **reporting-agent.md** - Port 3006, references OLD/clenergizeV3-backend-ms-dev
10. **audit-agent.md** - Port 3007, new service (no OLD reference)
11. **frontend-agent.md** - Next.js/React, references OLD/clenergizeV3-frontend-dev
12. **testing-agent.md** - Test automation, quality gates
13. **devops-agent.md** - Docker, CI/CD, infrastructure
14. **migration-agent.md** - Data transformation, uses Opus for complex migrations

Each agent file must include:
- Model configuration (Sonnet default, Opus triggers)
- Service port and OLD code reference path
- Critical issues from DESIGN-REVIEW.md to fix
- MCP servers needed
- Integration points with other agents

### Task 3: Generate All 10 Skill Files

Create these files in `.claude/skills/`:

1. **nestjs-service-generator.md** - NestJS boilerplate with transactions, proper JWT guards
2. **mongodb-migration-tool.md** - Convert cloned hierarchies to references
3. **openapi-contract-validator.md** - API contract validation between services
4. **security-vulnerability-scanner.md** - Check for jwt.decode(), hardcoded secrets
5. **performance-optimization-tool.md** - Fix N+1 queries, add caching
6. **jwt-implementation-helper.md** - JWKS verification patterns
7. **event-schema-generator.md** - Typed events to replace string-based events
8. **test-data-factory.md** - Generate test data for all entities
9. **docker-environment-manager.md** - Docker Compose for OLD/NEW structure
10. **old-to-new-converter.md** - Patterns for migrating OLD code issues

Each skill must include:
- Templates fixing OLD code issues
- Anti-patterns to avoid from OLD code
- Validation checklists

### Task 4: Generate All 5 Command Files

Create these files in `.claude/commands/`:

1. **project-commands.md**
   - /sprint-status - Show sprint progress
   - /assign-task [ticket] [agent] - Assign work
   - /create-ticket - Create JIRA ticket
   - /integration-check - Verify integrations
   - /daily-sync - Daily standup report

2. **development-commands.md**
   - /generate-service [name] - Create new service
   - /generate-crud [entity] - Create CRUD operations
   - /add-event [name] - Add domain event
   - /fix-old-issue [issue-id] - Fix specific OLD code issue

3. **testing-commands.md**
   - /run-tests [service] - Run service tests
   - /coverage-report - Generate coverage
   - /e2e-test - Run E2E tests
   - /security-scan - Security audit

4. **deployment-commands.md**
   - /docker-up - Start services
   - /docker-down - Stop services
   - /deploy-local - Local deployment
   - /health-check - Service health

5. **migration-commands.md**
   - /migrate-data [service] - Run migrations
   - /validate-migration - Check data integrity
   - /rollback [version] - Rollback migration
   - /compare-schemas - OLD vs NEW comparison

### Task 5: Generate settings.local.json

Create `.claude/settings.local.json`:
```json
{
  "project": {
    "name": "Clenergize V3 Rebuild",
    "phase": "Sprint 0.1",
    "model_preference": "sonnet",
    "opus_budget_hours": 50
  },
  "agents": {
    "count": 14,
    "default_model": "claude-3-sonnet",
    "opus_triggers": ["jwt", "hierarchy", "algorithm", "migration"]
  },
  "old_code": {
    "path": "./OLD",
    "reference_only": true,
    "issues_file": "OLD/DESIGN-REVIEW.md"
  },
  "new_code": {
    "path": "./NEW"
  },
  "services": {
    "identity": { "port": 3001, "old_ref": "clenergizeV3-user-management-ms-dev" },
    "organization": { "port": 3002, "old_ref": "clenergizeV3-project-management-ms-dev" },
    "reference": { "port": 3003, "old_ref": "clenergizeV3-master-data-ms-dev" },
    "activity": { "port": 3004, "old_ref": "clenergizeV3-carbon-footprint-ms-dev" },
    "calculation": { "port": 3005, "old_ref": "clenergizeV3-carbon-footprint-ms-dev" },
    "reporting": { "port": 3006, "old_ref": "clenergizeV3-backend-ms-dev" },
    "audit": { "port": 3007, "old_ref": null }
  }
}
```

### Task 6: Generate Project README

Create `.claude/README.md` with:
- Quick start guide
- Agent activation instructions  
- Daily workflow
- Sprint 0.1 priorities
- Command reference

### Task 7: Generate Validation Script

Create `.claude/validate.sh`:
```bash
#!/bin/bash
echo "Validating Claude Code Setup..."
# Check all 14 agents exist
# Check all 10 skills exist
# Check all 5 command files exist
# Validate settings.json
echo "Setup validation complete!"
```

## PRIORITY ORDER

1. First create agent files (especially master-coordinator, security-agent, devops-agent)
2. Then create skills (especially nestjs-service-generator, security-vulnerability-scanner)
3. Then create commands
4. Finally create settings and validation

## SUCCESS CRITERIA

✅ 14 agent configuration files created
✅ 10 skill files created  
✅ 5 command category files created
✅ settings.local.json configured
✅ All files reference OLD code issues to fix
✅ Opus 4.1 usage clearly defined (only 5% of tasks)
✅ Ready to start Sprint 0.1 tasks

Generate all files now following the specifications above. Focus on fixing the critical issues from OLD code: JWT verification, hierarchy cloning, infinite loops, missing transactions, and denormalized data.
