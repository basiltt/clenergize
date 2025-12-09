# Agent Initialization & Configuration Guide

## Quick Start: Setting Up Your Multi-Agent System

### Step 1: Create Claude Projects

Create separate Claude Projects for each agent with the following configuration:

```yaml
Project Structure:
ClenergizeV3/
├── OLD/                        # Reference codebase (READ-ONLY)
│   ├── clenergizeV3-backend-ms-dev/
│   ├── clenergizeV3-carbon-footprint-ms-dev/
│   ├── clenergizeV3-companyDetails-ms-dev/
│   ├── clenergizeV3-frontend-dev/
│   ├── clenergizeV3-master-data-ms-dev/
│   ├── clenergizeV3-project-management-ms-dev/
│   └── clenergizeV3-user-management-ms-dev/
├── NEW/                        # Clean implementation
│   ├── identity-service/
│   ├── organization-service/
│   ├── reference-service/
│   ├── activity-service/
│   ├── calculation-service/
│   ├── reporting-service/
│   ├── audit-service/
│   ├── frontend/
│   └── shared/
└── .claude/                    # Agent configurations
    ├── agents/
    │   ├── master-coordinator/
    │   ├── architecture-agent/
    │   ├── security-agent/
    │   ├── identity-agent/
    │   ├── organization-agent/
    │   ├── reference-agent/
    │   ├── activity-agent/
    │   ├── calculation-agent/
    │   ├── reporting-agent/
    │   ├── audit-agent/
    │   ├── frontend-agent/
    │   ├── testing-agent/
    │   ├── devops-agent/
    │   └── migration-agent/
    └── skills/
```

### Step 2: Configure Each Agent Project

#### For Each Agent Project:

1. **Upload Core Files**:
```bash
# Essential for ALL agents
- CLAUDE.md (master configuration)
- CLAUDE_MULTI_AGENT_STRATEGY.md (this strategy doc)
- PROJECT_STRUCTURE_GUIDE.md (directory organization)
- OLD_TO_NEW_MIGRATION_GUIDE.md (migration patterns)

# Phase-specific files per agent
Master Coordinator:
- All PHASE*.md files
- SPRINT_*.md files
- ACTION_ITEMS_Next_Steps.md

Architecture Agent:
- PHASE2_Target_Architecture_Overview.md
- PHASE2_Microservice_Decomposition_Bounded_Contexts.md
- PHASE3_Service_Specs_Summary.md

Security Agent:
- PHASE5_SDLC_Quality_Strategy.md
- Security sections from PHASE7_Complete_Jira_Backlog.md

Service Agents (Identity/Org/Ref/Activity/Calc/Report/Audit):
- PHASE3_Service_Spec_[01-03]_*.md (relevant service spec)
- PHASE2_Microservice_Decomposition_Bounded_Contexts.md
- OLD_TO_NEW_MIGRATION_GUIDE.md (critical for migration)
- OLD code reference mapping:
  * Identity: OLD/clenergizeV3-user-management-ms-dev/
  * Organization: OLD/clenergizeV3-project-management-ms-dev/
  * Reference: OLD/clenergizeV3-master-data-ms-dev/
  * Activity: OLD/clenergizeV3-carbon-footprint-ms-dev/
  * Calculation: OLD/clenergizeV3-carbon-footprint-ms-dev/
  * Reporting: OLD/clenergizeV3-backend-ms-dev/
  * Audit: (no OLD equivalent - greenfield)

Frontend Agent:
- PHASE9_Frontend_Adaptation_Plan.md
- PHASE10_BaseAPIClient_Implementation_Guide.md

DevOps Agent:
- LOCAL_DEV_ENVIRONMENT_Updates.md
- PHASE4_Delivery_Phasing_Plan.md
- PHASE6_Jira_MCP_Configuration.md

Testing Agent:
- PHASE5_SDLC_Quality_Strategy.md
- Testing sections from all service specs

Migration Agent:
- PHASE1_Current_Architecture_Overview.md
- PHASE2_Target_Architecture_Overview.md
- PHASE8_Review_Corrections.md
```

2. **Set Project Instructions**:

```markdown
# Project Instructions for [Agent Name]

You are the [Agent Name] for the Clenergize V3 rebuild project.

## CRITICAL: OLD vs NEW Code
- OLD/ directory contains reference code with known issues
- NEVER copy-paste from OLD code
- Use OLD only to understand business logic
- Check OLD_TO_NEW_MIGRATION_GUIDE.md for patterns
- Fix all issues identified in DESIGN-REVIEW.md

## Primary Responsibilities:
[List from strategy document]

## OLD Code Reference:
[Path to relevant OLD service for this agent]

## Known Issues to Fix:
[List critical issues from DESIGN-REVIEW.md relevant to this service]

## Context Files Priority:
1. Always read CLAUDE.md first
2. Check current sprint status
3. Review OLD_TO_NEW_MIGRATION_GUIDE.md
4. Review your specific service/domain files
5. Reference OLD code for business logic only

## Communication Protocol:
- Start each session by checking sprint status
- Update progress after completing tasks
- Escalate blockers immediately
- Document any NEW issues found in OLD code

## Key Focus Areas:
[Agent-specific priorities]

## Available Tools:
[List MCP servers and tools for this agent]
```

### Step 3: Configure MCP Servers

#### MongoDB MCP Configuration (Per Service)

```json
{
  "mcpServers": {
    "mongodb-identity": {
      "command": "mongodb-mcp",
      "args": ["--connection", "mongodb://localhost:27017/clenergize_identity"],
      "description": "Identity service database"
    },
    "mongodb-organization": {
      "command": "mongodb-mcp",
      "args": ["--connection", "mongodb://localhost:27017/clenergize_organization"],
      "description": "Organization service database"
    },
    "mongodb-reference": {
      "command": "mongodb-mcp",
      "args": ["--connection", "mongodb://localhost:27017/clenergize_reference"],
      "description": "Reference service database"
    }
  }
}
```

#### Jira MCP Configuration

```json
{
  "mcpServers": {
    "jira": {
      "command": "jira-mcp",
      "args": [
        "--url", "https://yourcompany.atlassian.net",
        "--project", "CLNZ",
        "--email", "your-email@company.com",
        "--token", "${JIRA_API_TOKEN}"
      ],
      "description": "Project management"
    }
  }
}
```

#### GitHub MCP Configuration

```json
{
  "mcpServers": {
    "github": {
      "command": "github-mcp",
      "args": [
        "--repo", "clenergize-v3-rebuild",
        "--org", "yourcompany",
        "--token", "${GITHUB_TOKEN}"
      ],
      "description": "Source control"
    }
  }
}
```

### Step 4: Create Custom Skills

#### Skill 1: Service Generator

Create file: `/skills/nestjs-service-generator/skill.md`

```markdown
# NestJS Service Generator Skill

## Purpose
Generate consistent NestJS microservice boilerplate

## Usage
When creating a new service or module, use these templates:

### Controller Template
\`\`\`typescript
@Controller('resource')
@ApiTags('resource')
export class ResourceController {
  constructor(private readonly service: ResourceService) {}
  
  @Post()
  @ApiOperation({ summary: 'Create resource' })
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateResourceDto) {
    return this.service.create(dto);
  }
}
\`\`\`

### Service Template
\`\`\`typescript
@Injectable()
export class ResourceService {
  constructor(
    @InjectRepository(Resource)
    private repository: Repository<Resource>,
    private eventBus: EventBusService
  ) {}
  
  async create(dto: CreateResourceDto): Promise<Resource> {
    const entity = await this.repository.save(dto);
    await this.eventBus.publish(new ResourceCreatedEvent(entity));
    return entity;
  }
}
\`\`\`

### Repository Template
[Include repository pattern]

### Event Publisher Template
[Include event publishing pattern]
```

#### Skill 2: Security Scanner

Create file: `/skills/security-scanner/skill.md`

```markdown
# Security Scanner Skill

## JWT Verification Checklist
- [ ] Using JWKS for signature verification
- [ ] Algorithm specified (RS256)
- [ ] Issuer validated
- [ ] Audience checked
- [ ] Expiry validated
- [ ] No jwt.decode() without verify

## Secrets Management Checklist
- [ ] No hardcoded secrets
- [ ] No default fallbacks
- [ ] Using AWS Secrets Manager
- [ ] Environment variables for local dev
- [ ] Secrets rotation enabled

## API Security Checklist
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] Authentication guards on write operations
- [ ] CORS properly configured
- [ ] SQL injection prevention
```

### Step 5: Configure Slash Commands

In each agent project, set up these custom commands:

```python
# Core Commands (All Agents)
/status - Show current sprint status and tasks
/sync - Synchronize with master coordinator
/blocker - Report a blocking issue
/complete - Mark task as complete

# Agent-Specific Commands
## Master Coordinator
/assign [task] [agent] - Assign task to agent
/sprint-report - Generate sprint progress report
/integration-check - Verify service integrations

## Service Agents
/generate-crud [entity] - Generate CRUD operations
/add-event [event-name] - Add domain event
/test-endpoint [endpoint] - Test API endpoint

## Security Agent
/security-scan [service] - Run security audit
/verify-jwt - Check JWT implementation
/secrets-check - Verify secrets management

## DevOps Agent
/docker-status - Check Docker services
/deploy-local - Deploy to local environment
/health-check - Run health checks

## Testing Agent
/coverage-report - Generate coverage report
/run-e2e - Execute E2E tests
/performance-test - Run performance tests
```

### Step 6: Initialize Development Environment

```bash
#!/bin/bash
# init-dev-environment.sh

echo "🚀 Initializing Clenergize V3 Development Environment"

# Step 1: Clone repository
git clone https://github.com/yourcompany/clenergize-v3-rebuild.git
cd clenergize-v3-rebuild

# Step 2: Create Docker Compose file
cat > docker-compose.dev.yml << 'EOF'
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: clenergize-mongodb
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: localdev123
    volumes:
      - mongodb-data:/data/db

  redis:
    image: redis:7-alpine
    container_name: clenergize-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

  localstack:
    image: localstack/localstack:latest
    container_name: clenergize-localstack
    ports:
      - "4566:4566"
    environment:
      - SERVICES=secretsmanager,sqs,s3,cognito,eventbridge
      - DEFAULT_REGION=us-east-1
      - DOCKER_HOST=unix:///var/run/docker.sock
    volumes:
      - localstack-data:/tmp/localstack
      - /var/run/docker.sock:/var/run/docker.sock

  # Service containers will be added here
  identity-service:
    build:
      context: ./NEW/identity-service
      dockerfile: Dockerfile.dev
    container_name: identity-service
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - PORT=3001
      - MONGODB_URI=mongodb://admin:localdev123@mongodb:27017/clenergize_identity?authSource=admin
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongodb
      - redis
      - localstack
    volumes:
      - ./NEW/identity-service:/app
      - ./OLD/clenergizeV3-user-management-ms-dev:/reference:ro  # OLD code as read-only reference
      - /app/node_modules

  organization-service:
    build:
      context: ./NEW/organization-service
      dockerfile: Dockerfile.dev
    container_name: organization-service
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=development
      - PORT=3002
      - MONGODB_URI=mongodb://admin:localdev123@mongodb:27017/clenergize_organization?authSource=admin
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongodb
      - redis
      - localstack
    volumes:
      - ./NEW/organization-service:/app
      - ./OLD/clenergizeV3-project-management-ms-dev:/reference:ro  # OLD code as read-only reference
      - /app/node_modules

volumes:
  mongodb-data:
  redis-data:
  localstack-data:

networks:
  default:
    name: clenergize-network
EOF

# Step 3: Create Makefile
cat > Makefile << 'EOF'
.PHONY: help up down logs test clean

help:
	@echo "Available commands:"
	@echo "  make up       - Start all services"
	@echo "  make down     - Stop all services"
	@echo "  make logs     - View logs"
	@echo "  make test     - Run tests"
	@echo "  make clean    - Clean everything"

up:
	docker-compose -f docker-compose.dev.yml up -d
	@echo "✅ Services started. Access at:"
	@echo "  MongoDB: mongodb://localhost:27017"
	@echo "  Redis: redis://localhost:6379"
	@echo "  LocalStack: http://localhost:4566"

down:
	docker-compose -f docker-compose.dev.yml down

logs:
	docker-compose -f docker-compose.dev.yml logs -f $(service)

test:
	npm run test:all

clean:
	docker-compose -f docker-compose.dev.yml down -v
	rm -rf node_modules
	rm -rf services/*/node_modules
EOF

# Step 4: Create service directories
mkdir -p OLD  # Will contain reference code
mkdir -p NEW/{identity-service,organization-service,reference-service,activity-service,calculation-service,reporting-service,audit-service,frontend,shared}
mkdir -p NEW/shared/{contracts,common,config}

# Step 5: Initialize git
git init
git add .
git commit -m "Initial setup for Clenergize V3 rebuild"

echo "✅ Development environment initialized!"
echo "Run 'make up' to start services"
```

### Step 7: Agent Communication Protocol

#### Daily Sync Format

```markdown
## Daily Sync - [Date]
**Agent**: [Name]
**Sprint**: 0.1 Day [X/10]

### Completed
- Task: [CLNZ-XXX] Description
  - Files: [List modified files]
  - Tests: [Coverage %]
  - PR: #[number]

### In Progress
- Task: [CLNZ-XXX] Description
  - Status: [% complete]
  - ETA: [hours/days]

### Blocked
- Issue: [Description]
  - Blocking: [What's blocked]
  - Need: [What's needed]

### Handoffs
- To: [Agent name]
  - Task: [Description]
  - Context: [Key information]
```

#### Integration Point Documentation

```yaml
# integration-points.yaml
integrations:
  identity-to-organization:
    type: synchronous
    endpoint: POST /api/users/{userId}/permissions
    contract: openapi/identity-org-contract.yaml
    
  calculation-to-activity:
    type: synchronous  
    endpoint: GET /api/activities/{projectId}
    contract: openapi/calc-activity-contract.yaml
    
  all-to-audit:
    type: asynchronous
    event: *.*.Created, *.*.Updated, *.*.Deleted
    schema: events/audit-event-schema.json
```

### Step 8: Quality Gates

Each agent must pass these gates before marking work complete:

```yaml
Code Quality Gates:
  - Unit test coverage ≥ 80%
  - Integration tests passing
  - No TypeScript errors
  - ESLint passing
  - Security scan passing
  
Documentation Gates:
  - API documentation updated
  - README updated
  - ADR created for decisions
  - Integration points documented
  
Review Gates:
  - Code review by another agent
  - Security review for auth code
  - Architecture review for new patterns
```

### Step 9: Monitoring Setup

```bash
# Create monitoring dashboard
cat > monitoring/dashboard.json << 'EOF'
{
  "services": [
    {
      "name": "identity",
      "healthcheck": "http://localhost:3001/health",
      "metrics": ["response_time", "error_rate", "throughput"]
    },
    {
      "name": "organization",
      "healthcheck": "http://localhost:3002/health",
      "metrics": ["response_time", "error_rate", "throughput"]
    }
  ],
  "alerts": [
    {
      "name": "High Error Rate",
      "condition": "error_rate > 1%",
      "action": "notify-slack"
    },
    {
      "name": "Slow Response",
      "condition": "p95_response_time > 200ms",
      "action": "notify-slack"
    }
  ]
}
EOF
```

### Step 10: First Day Checklist

```markdown
## Day 1 Initialization Checklist

### Environment Setup
- [ ] WSL2 installed and configured
- [ ] Docker Desktop running
- [ ] Repository cloned
- [ ] Docker Compose running
- [ ] All services health checks passing

### Agent Configuration
- [ ] All 14 agent projects created
- [ ] Core files uploaded to each project
- [ ] MCP servers configured
- [ ] Custom skills created
- [ ] Slash commands tested

### Sprint 0.1 Kickoff
- [ ] Master Coordinator activated
- [ ] Sprint 0.1 tasks assigned
- [ ] Security Agent working on JWT (CLNZ-101)
- [ ] DevOps Agent setting up Docker (CLNZ-091)
- [ ] Service agents initialized

### Communication
- [ ] Slack channel joined
- [ ] Jira access verified
- [ ] GitHub access confirmed
- [ ] First sync completed
```

## Troubleshooting

### Common Issues

1. **Context Window Overflow**
   - Solution: Archive completed work, summarize decisions
   - Use context compression techniques

2. **Agent Confusion**
   - Solution: Always start with CLAUDE.md
   - Clear role definition in project instructions

3. **Integration Conflicts**
   - Solution: Use Master Coordinator for resolution
   - Document integration points clearly

4. **MCP Connection Issues**
   - Solution: Verify connection strings
   - Check Docker container status

5. **Test Failures**
   - Solution: Run isolated tests first
   - Check for missing dependencies

## Success Metrics

### Sprint 0.1 Success Criteria
- ✅ All agents operational
- ✅ Docker environment running
- ✅ JWT verification implemented
- ✅ Security vulnerabilities fixed
- ✅ Base service templates created
- ✅ 80% test coverage achieved

### Daily Metrics
- Tasks completed vs planned
- Test coverage percentage
- Build success rate
- Integration test status
- Blocker resolution time

## Next Steps

1. **Immediate** (Day 1-2):
   - Initialize all agent projects
   - Start Sprint 0.1 security tasks
   - Set up Docker environment

2. **This Week** (Day 3-5):
   - Complete JWT implementation
   - Create service templates
   - Establish testing framework

3. **Next Week** (Day 6-10):
   - Integration testing
   - Security audit
   - Sprint 0.1 completion
   - Sprint 0.2 planning

Remember: The key to success is clear communication between agents and maintaining context consistency. Use the Master Coordinator for any cross-service decisions.
