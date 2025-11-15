# Instructions for Claude Code: Generate Sub-Agents, Skills, and Slash Commands

## Overview
Generate the complete Claude configuration structure for the Clenergize V3 project, including 14 sub-agent configurations, custom skills, and slash commands.

## Project Structure to Create

```
ClenergizeV3/
├── .claude/
│   ├── agents/
│   │   ├── master-coordinator/
│   │   ├── architecture-agent/
│   │   ├── security-agent/
│   │   ├── identity-agent/
│   │   ├── organization-agent/
│   │   ├── reference-agent/
│   │   ├── activity-agent/
│   │   ├── calculation-agent/
│   │   ├── reporting-agent/
│   │   ├── audit-agent/
│   │   ├── frontend-agent/
│   │   ├── testing-agent/
│   │   ├── devops-agent/
│   │   └── migration-agent/
│   │
│   ├── skills/
│   │   ├── nestjs-service-generator/
│   │   ├── security-scanner/
│   │   ├── mongodb-migration/
│   │   ├── api-contract-validator/
│   │   ├── performance-profiler/
│   │   ├── old-to-new-migrator/
│   │   └── docker-compose-builder/
│   │
│   └── commands/
│       ├── global-commands.md
│       └── agent-specific-commands.md
```

## Task 1: Generate Sub-Agent Configuration Files

For each of the 14 agents, create a `config.md` file in their respective directory under `.claude/agents/[agent-name]/`:

### 1.1 Master Coordinator Agent
**Path**: `.claude/agents/master-coordinator/config.md`

```markdown
# Master Coordinator Agent Configuration

## Role
Orchestrates all other agents, manages sprint planning, and ensures cross-service coordination.

## Model
Claude Sonnet (Standard)

## Context Files
- CLAUDE.md
- PROJECT_STRUCTURE_GUIDE.md
- OLD_TO_NEW_MIGRATION_GUIDE.md
- All PHASE*.md files
- SPRINT_*.md files
- ACTION_ITEMS_Next_Steps.md

## Responsibilities
- Cross-service coordination
- Sprint planning and task allocation
- Architecture decision records
- Integration point management
- Progress tracking and reporting
- OLD to NEW migration oversight

## Available Tools
- Jira MCP for project management
- GitHub MCP for repository overview
- Slack MCP for team communication

## Communication Protocol
- Daily standup coordination
- Sprint retrospectives
- Blocker resolution
- Agent task assignment

## Success Metrics
- Sprint velocity tracking
- Blocker resolution time < 4 hours
- Integration success rate > 95%
```

### 1.2 Security Agent
**Path**: `.claude/agents/security-agent/config.md`

```markdown
# Security Agent Configuration

## Role
Handles all security implementations, vulnerability fixes, and security architecture decisions.

## Model
Claude Sonnet (Opus 4.1 for critical security architecture only)

## When to Use Opus 4.1
- JWT/JWKS implementation design
- Cryptographic algorithm selection
- Threat modeling
- Security vulnerability analysis
- Zero-trust architecture design

## Context Files
- CLAUDE.md
- OLD_TO_NEW_MIGRATION_GUIDE.md
- Security stories CLNZ-101 through CLNZ-108
- PHASE5_SDLC_Quality_Strategy.md
- OLD/clenergizeV3-backend-ms-dev/src/AUTHENTICATION/

## Critical Issues to Fix from OLD
- C1: JWT tokens decoded without signature verification
- C2: Default secret fallbacks ('default-secret-key')
- C5: No contract governance for event payloads
- C10: Lack of structured error taxonomy

## Responsibilities
- JWT/JWKS implementation
- Secrets management (AWS Secrets Manager)
- Security testing and vulnerability assessment
- OWASP compliance verification
- Rate limiting implementation

## Available Tools
- OWASP ZAP scanner
- JWT libraries (jsonwebtoken, jwks-rsa)
- AWS Secrets Manager SDK
- Security linting tools

## Sprint 0.1 Priority Tasks
- CLNZ-101: Implement JWT verification with JWKS (8 points)
- CLNZ-102: Secure Secrets Management (5 points)
- CLNZ-103: API Rate Limiting (5 points)
```

### Generate Similar Configs for All 14 Agents
Create config.md for each agent with:
- Role definition
- Model specification (when to use Opus 4.1)
- Context files needed
- OLD code reference path
- Critical issues to fix
- Responsibilities
- Available tools
- Sprint priorities

## Task 2: Generate Custom Skills

Create skill directories with SKILL.md files under `.claude/skills/`:

### 2.1 NestJS Service Generator Skill
**Path**: `.claude/skills/nestjs-service-generator/SKILL.md`

```markdown
# NestJS Service Generator Skill

## Purpose
Generate consistent NestJS microservice boilerplate following DDD patterns and fixing OLD code issues.

## Templates

### Domain Entity Template
```typescript
// src/domain/entities/[entity].entity.ts
export class [Entity] {
  private readonly id: string;
  private readonly createdAt: Date;
  private readonly updatedAt: Date;
  
  constructor(props: [Entity]Props) {
    this.validate(props);
    Object.assign(this, props);
  }
  
  private validate(props: [Entity]Props): void {
    // Domain validation logic
  }
  
  // Domain methods
}
```

### Repository Interface Template
```typescript
// src/domain/repositories/[entity].repository.ts
export interface I[Entity]Repository {
  findById(id: string): Promise<[Entity] | null>;
  findAll(filter?: Partial<[Entity]>): Promise<[Entity][]>;
  save(entity: [Entity], session?: ClientSession): Promise<void>;
  delete(id: string, session?: ClientSession): Promise<void>;
}
```

### Use Case Template
```typescript
// src/application/use-cases/create-[entity].use-case.ts
@Injectable()
export class Create[Entity]UseCase {
  constructor(
    private readonly repository: I[Entity]Repository,
    private readonly eventBus: IEventBus
  ) {}
  
  async execute(command: Create[Entity]Command): Promise<[Entity]> {
    const session = await this.mongoClient.startSession();
    
    try {
      const result = await session.withTransaction(async () => {
        const entity = [Entity].create(command);
        await this.repository.save(entity, session);
        
        // Publish event after transaction
        this.eventBus.publish(new [Entity]CreatedEvent(entity));
        
        return entity;
      });
      
      return result;
    } finally {
      await session.endSession();
    }
  }
}
```

### Controller Template
```typescript
// src/infrastructure/http/[entity].controller.ts
@Controller('[entities]')
@ApiTags('[entities]')
export class [Entity]Controller {
  constructor(
    private readonly create[Entity]: Create[Entity]UseCase,
    private readonly find[Entity]: Find[Entity]UseCase
  ) {}
  
  @Post()
  @ApiOperation({ summary: 'Create [entity]' })
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  async create(@Body() dto: Create[Entity]Dto, @Request() req) {
    const command = new Create[Entity]Command({
      ...dto,
      userId: req.user.id
    });
    
    const result = await this.create[Entity].execute(command);
    
    return {
      success: true,
      data: result,
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    };
  }
}
```

## Usage Instructions
1. Replace [Entity] with your entity name (PascalCase)
2. Replace [entities] with plural lowercase
3. Ensure MongoDB transactions are used for multi-step operations
4. Always publish domain events after successful operations
5. Include proper error handling and validation
```

### 2.2 Security Scanner Skill
**Path**: `.claude/skills/security-scanner/SKILL.md`

```markdown
# Security Scanner Skill

## Purpose
Automated security checking and vulnerability detection for all services.

## Checklists

### JWT Security Checklist
```typescript
// ✅ CORRECT JWT Implementation
import { JwksClient } from 'jwks-rsa';
import * as jwt from 'jsonwebtoken';

const jwksClient = new JwksClient({
  jwksUri: process.env.JWT_JWKS_URI,
  cache: true,
  rateLimit: true,
  cacheMaxAge: 600000 // 10 minutes
});

async function verifyToken(token: string): Promise<JwtPayload> {
  // Decode to get kid
  const decoded = jwt.decode(token, { complete: true });
  if (!decoded || !decoded.header || !decoded.header.kid) {
    throw new UnauthorizedError('Invalid token structure');
  }
  
  // Get signing key
  const key = await jwksClient.getSigningKey(decoded.header.kid);
  const signingKey = key.getPublicKey();
  
  // Verify with all checks
  return jwt.verify(token, signingKey, {
    algorithms: ['RS256'],
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE,
    clockTolerance: 30 // 30 seconds
  });
}

// ❌ NEVER DO THIS (from OLD code)
const decoded = jwt.decode(token); // NO VERIFICATION!
```

### Secrets Management Checklist
- [ ] No hardcoded secrets in code
- [ ] No default fallback values
- [ ] Environment variables validated at startup
- [ ] AWS Secrets Manager for production
- [ ] Secret rotation implemented
- [ ] Audit logging for secret access

### API Security Checklist
- [ ] Rate limiting per user and IP
- [ ] Input validation on all endpoints
- [ ] SQL/NoSQL injection prevention
- [ ] XSS protection headers
- [ ] CORS properly configured
- [ ] Authentication required for write operations
- [ ] Authorization checks for resource access

### Vulnerability Scan Commands
```bash
# Dependency vulnerability scan
npm audit
npm audit fix

# OWASP dependency check
dependency-check --scan . --project "Clenergize-V3"

# Security linting
eslint --plugin security .

# Docker security scan
docker scan [image-name]
```

## Security Patterns

### Rate Limiting Implementation
```typescript
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests',
  standardHeaders: true,
  legacyHeaders: false,
});

// Per-user rate limiting
const userLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  keyGenerator: (req) => req.user?.id || req.ip,
  skip: (req) => req.user?.role === 'admin'
});
```

## Reporting Template
```markdown
## Security Scan Report - [Service Name]
Date: [YYYY-MM-DD]

### Vulnerabilities Found
- Critical: [count]
- High: [count]
- Medium: [count]
- Low: [count]

### Issues Fixed
1. [Issue description] - [Fix applied]

### Remaining Risks
1. [Risk description] - [Mitigation plan]

### Compliance Status
- OWASP Top 10: [Pass/Fail]
- PCI DSS: [N/A or status]
- GDPR: [Compliant/Non-compliant]
```
```

### Generate More Skills
Create SKILL.md for:
- mongodb-migration
- api-contract-validator
- performance-profiler
- old-to-new-migrator
- docker-compose-builder

## Task 3: Generate Slash Commands

### 3.1 Global Commands
**Path**: `.claude/commands/global-commands.md`

```markdown
# Global Slash Commands (All Agents)

## Core Commands

### /status
Show current sprint status and assigned tasks
```
Usage: /status
Output: Current sprint, day X of Y, assigned tasks, completion %
```

### /sync
Synchronize with master coordinator
```
Usage: /sync
Action: Fetches latest sprint updates, task assignments
```

### /blocker
Report a blocking issue
```
Usage: /blocker [description]
Action: Creates blocker ticket, notifies master coordinator
```

### /complete
Mark a task as complete
```
Usage: /complete [CLNZ-XXX]
Action: Updates Jira, logs completion, notifies coordinator
```

### /help
Show available commands
```
Usage: /help [command]
Output: List of commands or specific command details
```

### /context
Show current context usage
```
Usage: /context
Output: KB used, KB remaining, files loaded
```

### /old-reference
Show OLD service mapping
```
Usage: /old-reference
Output: Which OLD service this agent should reference
```

### /issues
List critical issues to fix from OLD code
```
Usage: /issues
Output: Issues from DESIGN-REVIEW.md for this service
```

## Development Commands

### /generate
Generate boilerplate code
```
Usage: /generate [type] [name]
Types: entity, service, controller, repository, usecase
Example: /generate entity User
```

### /test
Run tests for current service
```
Usage: /test [type]
Types: unit, integration, e2e, all
```

### /migrate
Create migration script
```
Usage: /migrate [description]
Action: Generates migration boilerplate
```

## Documentation Commands

### /document
Generate documentation
```
Usage: /document [type]
Types: api, readme, adr, changelog
```

### /diagram
Generate architecture diagram
```
Usage: /diagram [type]
Types: sequence, class, component, deployment
```
```

### 3.2 Agent-Specific Commands
**Path**: `.claude/commands/agent-specific-commands.md`

```markdown
# Agent-Specific Slash Commands

## Master Coordinator Commands

### /assign
Assign task to an agent
```
Usage: /assign [CLNZ-XXX] [agent-name]
Action: Updates Jira, notifies agent
```

### /sprint-report
Generate sprint progress report
```
Usage: /sprint-report
Output: Burndown, velocity, blockers, agent performance
```

### /integration-check
Verify service integrations
```
Usage: /integration-check
Output: Service health, API contract compliance, event flow
```

### /retrospective
Run sprint retrospective
```
Usage: /retrospective
Action: Collects metrics, generates report, identifies improvements
```

## Security Agent Commands

### /security-scan
Run security audit on service
```
Usage: /security-scan [service-name]
Output: Vulnerabilities, OWASP compliance, recommendations
```

### /verify-jwt
Check JWT implementation
```
Usage: /verify-jwt [service-name]
Output: Implementation status, issues found, fixes needed
```

### /secrets-check
Verify secrets management
```
Usage: /secrets-check
Output: Hardcoded secrets scan, environment validation
```

### /threat-model
Generate threat model
```
Usage: /threat-model [component]
Output: Attack vectors, mitigations, risk assessment
```

## Service Agent Commands

### /crud
Generate CRUD operations
```
Usage: /crud [entity-name]
Action: Creates controller, service, repository, DTOs
```

### /add-event
Add domain event
```
Usage: /add-event [event-name]
Action: Creates event class, updates event bus
```

### /api-test
Test API endpoint
```
Usage: /api-test [method] [endpoint] [payload]
Example: /api-test POST /users {"name":"John"}
```

### /old-compare
Compare with OLD implementation
```
Usage: /old-compare [feature]
Output: OLD vs NEW implementation, issues fixed
```

## DevOps Agent Commands

### /docker-status
Check Docker services status
```
Usage: /docker-status
Output: Container health, resource usage, logs
```

### /deploy-local
Deploy to local environment
```
Usage: /deploy-local [service]
Action: Builds, deploys to local Docker
```

### /health-check
Run health checks
```
Usage: /health-check
Output: All services health status, dependencies
```

### /setup-env
Setup development environment
```
Usage: /setup-env
Action: Creates .env files, initializes databases
```

## Testing Agent Commands

### /coverage
Generate coverage report
```
Usage: /coverage [service]
Output: Unit %, Integration %, E2E %, uncovered lines
```

### /e2e-run
Execute E2E tests
```
Usage: /e2e-run [scenario]
Action: Runs Cypress/Playwright tests
```

### /performance-test
Run performance tests
```
Usage: /performance-test [service]
Output: Response times, throughput, bottlenecks
```

### /test-data
Generate test data
```
Usage: /test-data [type] [count]
Action: Creates test fixtures
```

## Migration Agent Commands

### /analyze-old
Analyze OLD service structure
```
Usage: /analyze-old [service-name]
Output: Issues found, data structures, migration complexity
```

### /migration-plan
Generate migration plan
```
Usage: /migration-plan [old-service] [new-service]
Output: Step-by-step migration plan, data mappings
```

### /data-transform
Create data transformation script
```
Usage: /data-transform [collection]
Action: Generates transformation script template
```

### /verify-migration
Verify migration completeness
```
Usage: /verify-migration [service]
Output: Data integrity check, missing mappings
```

## Frontend Agent Commands

### /component
Generate React component
```
Usage: /component [name] [type]
Types: functional, class, hook
```

### /redux-slice
Generate Redux slice
```
Usage: /redux-slice [name]
Action: Creates actions, reducers, selectors
```

### /accessibility
Check accessibility compliance
```
Usage: /accessibility [component]
Output: WCAG violations, recommendations
```

### /api-client
Generate API client code
```
Usage: /api-client [endpoint]
Action: Creates typed API calls
```
```

## Task 4: Generate Project Instructions Template

**Path**: `.claude/agents/AGENT_TEMPLATE.md`

```markdown
# [Agent Name] Project Instructions

You are the [Agent Name] for the Clenergize V3 rebuild project.

## 🚨 CRITICAL RULES
1. NEVER copy-paste from OLD code - only reference for business logic
2. Always check DESIGN-REVIEW.md for known issues
3. Fix all identified problems when implementing in NEW
4. Follow DDD patterns and clean architecture
5. Minimum 80% test coverage for all code

## 📂 Your Service Paths
- OLD Reference: `OLD/[old-service-name]/`
- NEW Implementation: `NEW/[new-service-name]/`
- Shared Code: `NEW/shared/`

## 🔴 Critical Issues to Fix (from OLD)
1. [Issue C1 from DESIGN-REVIEW.md]
2. [Issue C2 from DESIGN-REVIEW.md]
3. [Specific to this service]

## 📋 Current Sprint: Sprint 0.1
**Your Tasks:**
- [ ] [CLNZ-XXX]: Task description (X points)
- [ ] [CLNZ-XXX]: Task description (X points)

## 🧠 When to Use Opus 4.1
Only use Opus 4.1 for:
- [Specific complex task 1]
- [Specific complex task 2]
- [Specific complex task 3]

For everything else, use Sonnet.

## 🛠️ Your Available Tools
- [Tool 1]: Purpose
- [Tool 2]: Purpose
- [MCP Server 1]: Connection details

## 📊 Success Metrics
- Test Coverage: ≥80%
- API Response Time: <200ms p95
- Zero security vulnerabilities
- All OLD issues fixed

## 🔄 Daily Workflow
1. Start: Check /status for current tasks
2. Reference: Check OLD code for business logic
3. Implement: Write clean code in NEW
4. Test: Achieve 80% coverage
5. Document: Update API docs
6. Complete: Mark task done with /complete

## 🚦 Escalation Path
1. Blocked on integration → Master Coordinator
2. Security concern → Security Agent
3. Architecture question → Architecture Agent
4. Data migration → Migration Agent

## 📚 Key Documents Priority
1. CLAUDE.md (always read first)
2. OLD_TO_NEW_MIGRATION_GUIDE.md
3. Your service spec: PHASE3_Service_Spec_XX.md
4. Current sprint: SPRINT_0.1_Task_Checklist.md

## 💬 Available Commands
Type /help to see all available commands
Key commands: /status, /generate, /test, /old-reference
```

## Task 5: Generate MCP Configuration Files

**Path**: `.claude/mcp-configs/[service-name]-mcp.json`

Create MCP configuration for each service.

## Instructions for Claude Code

1. **Create Directory Structure**
   ```bash
   mkdir -p .claude/{agents,skills,commands,mcp-configs}
   mkdir -p .claude/agents/{master-coordinator,security-agent,...}
   mkdir -p .claude/skills/{nestjs-service-generator,security-scanner,...}
   ```

2. **Generate All Agent Configs**
   - Use the templates above
   - Customize for each of the 14 agents
   - Include OLD service references
   - Add specific issues from DESIGN-REVIEW.md

3. **Generate All Skills**
   - Create SKILL.md for each skill
   - Include templates and patterns
   - Reference OLD issues to fix

4. **Generate Command Files**
   - Create global-commands.md
   - Create agent-specific-commands.md
   - Ensure commands are executable

5. **Create README**
   ```markdown
   # Claude Configuration for Clenergize V3
   
   ## Structure
   - `agents/`: Sub-agent configurations
   - `skills/`: Reusable skills
   - `commands/`: Slash commands
   - `mcp-configs/`: MCP server configurations
   
   ## Setup
   1. Each developer creates Claude projects for agents they'll use
   2. Upload agent config + required docs to each project
   3. Configure MCP servers
   4. Test slash commands
   
   ## Active Agents
   [List all 14 agents with their responsibilities]
   ```

## Expected Output

After running these instructions, you should have:
- 14 agent configuration files
- 7+ skill definitions
- 2 command documentation files  
- MCP configurations
- Complete `.claude/` directory structure

## Validation Checklist

- [ ] All 14 agents have config.md files
- [ ] Each agent knows their OLD reference path
- [ ] Critical issues from DESIGN-REVIEW.md are documented
- [ ] Skills include templates and anti-patterns
- [ ] Commands are documented with examples
- [ ] Directory structure matches specification
- [ ] README explains the setup process
