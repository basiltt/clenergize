# Claude Code Setup Instructions for Clenergize V3

## Overview

This document provides step-by-step instructions for setting up Claude Code with sub-agents, skills, and slash commands for the Clenergize V3 project. Follow these instructions to generate all necessary configuration files in your project repository.

## Prerequisites

1. Claude Code installed and configured
2. Access to the ClenergizeV3 project directory
3. All documentation files from Docs.zip extracted

## Directory Structure to Create

```bash
ClenergizeV3/
├── .claude/
│   ├── agents/           # Sub-agent configurations
│   ├── skills/           # Custom skills
│   ├── commands/         # Slash commands
│   ├── CLAUDE.md         # Master configuration
│   └── settings.local.json
├── OLD/                  # Existing problematic code
├── NEW/                  # Clean implementation
└── Docs/                 # Documentation
```

## Step 1: Initialize Claude Code Project Structure

### Instructions for Claude Code:

```markdown
Please create the Claude Code configuration structure for the Clenergize V3 project. 

First, create the following directory structure:
- .claude/agents/
- .claude/skills/
- .claude/commands/

Then generate the configuration files as specified below.
```

## Step 2: Generate Sub-Agent Configuration Files

### Instructions for Claude Code:

```markdown
Generate 14 sub-agent configuration files in .claude/agents/ directory. Each agent should have its own markdown file with specific context and responsibilities.

Create the following agent files:

1. `.claude/agents/master-coordinator.md`
2. `.claude/agents/architecture-agent.md`
3. `.claude/agents/security-agent.md`
4. `.claude/agents/identity-agent.md`
5. `.claude/agents/organization-agent.md`
6. `.claude/agents/reference-agent.md`
7. `.claude/agents/activity-agent.md`
8. `.claude/agents/calculation-agent.md`
9. `.claude/agents/reporting-agent.md`
10. `.claude/agents/audit-agent.md`
11. `.claude/agents/frontend-agent.md`
12. `.claude/agents/testing-agent.md`
13. `.claude/agents/devops-agent.md`
14. `.claude/agents/migration-agent.md`

Each agent file should follow this template structure:
```

### Template for Each Agent File:

```markdown
# [Agent Name] Configuration

## Agent Type
[Master Coordinator | Architecture | Security | Service | Frontend | Testing | DevOps | Migration]

## Model Configuration
- Default: Claude Sonnet
- Opus 4.1: [When to activate - only for specific complex tasks]

## Primary Responsibilities
[List from CLAUDE_MULTI_AGENT_STRATEGY.md]

## Context Files
### Essential Documents
- .claude/CLAUDE.md (always first)
- Docs/CLAUDE_MULTI_AGENT_STRATEGY.md
- Docs/PROJECT_STRUCTURE_GUIDE.md
- Docs/OLD_TO_NEW_MIGRATION_GUIDE.md

### Agent-Specific Documents
[List relevant PHASE*.md files]

## Service Information
- Port: [300X if applicable]
- OLD Reference: [Path to OLD service]
- NEW Implementation: [Path to NEW service]

## Critical Issues to Fix
[List from DESIGN-REVIEW.md relevant to this agent]

## Integration Points
[List other agents this agent interacts with]

## Available Tools
- MCP Servers: [List]
- Skills: [List relevant skills]
- Commands: [List relevant commands]

## Decision Criteria for Opus 4.1
[Specific scenarios when to use Opus 4.1]

## Communication Protocol
- Daily sync format
- Escalation path
- Handoff procedures

## Success Metrics
- Coverage targets
- Performance benchmarks
- Quality gates
```

## Step 3: Generate Custom Skills

### Instructions for Claude Code:

```markdown
Create custom skills in .claude/skills/ directory. Generate the following skill files:

1. `.claude/skills/nestjs-service-generator.md`
2. `.claude/skills/mongodb-migration-tool.md`
3. `.claude/skills/openapi-contract-validator.md`
4. `.claude/skills/security-vulnerability-scanner.md`
5. `.claude/skills/performance-optimization-tool.md`
6. `.claude/skills/jwt-implementation-helper.md`
7. `.claude/skills/event-schema-generator.md`
8. `.claude/skills/test-data-factory.md`
9. `.claude/skills/docker-environment-manager.md`
10. `.claude/skills/old-to-new-converter.md`
```

### Skill Template:

```markdown
# [Skill Name]

## Purpose
[Brief description of what this skill does]

## When to Use
[Trigger conditions and use cases]

## Prerequisites
- [Required dependencies]
- [Environment setup]

## Templates

### Template 1: [Name]
```[language]
[Code template]
```

### Template 2: [Name]
```[language]
[Code template]
```

## Patterns

### Pattern 1: [Name]
[Description and implementation]

### Pattern 2: [Name]
[Description and implementation]

## Anti-Patterns to Avoid
- [What not to do]
- [Common mistakes]

## Examples

### Example 1: [Scenario]
```[language]
[Example code]
```

### Example 2: [Scenario]
```[language]
[Example code]
```

## Validation Checklist
- [ ] [Validation item 1]
- [ ] [Validation item 2]
- [ ] [Validation item 3]

## References
- [Related documentation]
- [External resources]
```

## Step 4: Generate Slash Commands

### Instructions for Claude Code:

```markdown
Create slash command configurations in .claude/commands/ directory. Generate the following command files:

1. `.claude/commands/project-commands.md` (project management)
2. `.claude/commands/development-commands.md` (coding tasks)
3. `.claude/commands/testing-commands.md` (quality assurance)
4. `.claude/commands/deployment-commands.md` (DevOps)
5. `.claude/commands/migration-commands.md` (data migration)
```

### Commands Template:

```markdown
# [Category] Commands

## Command List

### /[command-name]
- **Description**: [What it does]
- **Usage**: `/command-name [parameters]`
- **Parameters**:
  - `param1`: [description]
  - `param2`: [optional/required]
- **Example**: `/command-name value1 value2`
- **Agent**: [Which agent handles this]
- **Output**: [Expected output format]

[Repeat for each command]
```

## Step 5: Specific File Contents to Generate

### 5.1 Master Coordinator Agent (.claude/agents/master-coordinator.md)

```markdown
# Master Coordinator Agent Configuration

## Agent Type
Master Coordinator

## Model Configuration
- Default: Claude Sonnet (efficient for orchestration)
- Opus 4.1: Never (coordination doesn't require)

## Primary Responsibilities
- Cross-service coordination
- Sprint planning and task allocation
- Architecture decision records (ADRs)
- Integration point management
- Progress tracking and reporting
- OLD to NEW migration oversight
- Agent task distribution
- Blocker resolution

## Context Files
### Essential Documents
- .claude/CLAUDE.md
- Docs/CLAUDE_MULTI_AGENT_STRATEGY.md
- Docs/PROJECT_STRUCTURE_GUIDE.md
- Docs/OLD_TO_NEW_MIGRATION_GUIDE.md
- Docs/SPRINT_0.1_Task_Checklist.md
- Docs/ACTION_ITEMS_Next_Steps.md

### Sprint Planning
- Docs/PHASE4_Delivery_Phasing_Plan.md
- Docs/PHASE7_Complete_Jira_Backlog.md

## Service Information
- Port: N/A (Orchestration only)
- Coordinates all 7 services + frontend

## Integration Points
- All agents report to Master Coordinator
- Distributes tasks from Jira backlog
- Resolves cross-service dependencies

## Available Tools
### MCP Servers
- Jira MCP (project management)
- GitHub MCP (repository overview)
- Slack MCP (team communication)

### Skills
- agent-orchestration
- sprint-planning
- integration-validation

### Commands
- /sprint-status
- /assign-task
- /integration-check
- /blocker-report
- /daily-sync

## Communication Protocol
### Daily Sync Format
- Collect status from all agents
- Update Jira board
- Identify blockers
- Reassign tasks if needed

### Escalation Path
- Technical issues → Architecture Agent
- Security concerns → Security Agent
- Performance issues → Testing Agent

## Success Metrics
- Sprint velocity: 35-40 story points
- Blocker resolution: < 4 hours
- Integration success rate: > 95%
- Daily sync completion: 100%
```

### 5.2 NestJS Service Generator Skill (.claude/skills/nestjs-service-generator.md)

```markdown
# NestJS Service Generator Skill

## Purpose
Generate consistent NestJS microservice boilerplate following DDD principles and fixing issues from OLD code.

## When to Use
- Creating new service modules
- Implementing CRUD operations
- Setting up new domain entities
- Establishing repository patterns

## Prerequisites
- NestJS CLI installed
- TypeScript 5.x
- Node.js 20.x

## Templates

### Controller Template
```typescript
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard';
import { RolesGuard } from '@shared/guards/roles.guard';
import { Roles } from '@shared/decorators/roles.decorator';
import { ValidationPipe } from '@shared/pipes/validation.pipe';

@ApiTags('[resource]')
@Controller('[resource]')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class [Resource]Controller {
  constructor(private readonly [resource]Service: [Resource]Service) {}

  @Post()
  @ApiOperation({ summary: 'Create [resource]' })
  @ApiResponse({ status: 201, description: '[Resource] created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @Roles('admin', 'user')
  async create(@Body(ValidationPipe) dto: Create[Resource]Dto) {
    return this.[resource]Service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all [resources]' })
  @Roles('admin', 'user', 'viewer')
  async findAll(@Query() query: [Resource]QueryDto) {
    return this.[resource]Service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get [resource] by id' })
  @Roles('admin', 'user', 'viewer')
  async findOne(@Param('id') id: string) {
    return this.[resource]Service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update [resource]' })
  @Roles('admin', 'user')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) dto: Update[Resource]Dto
  ) {
    return this.[resource]Service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete [resource]' })
  @Roles('admin')
  async remove(@Param('id') id: string) {
    return this.[resource]Service.remove(id);
  }
}
```

### Service Template with Transactions
```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { EventBus } from '@shared/infrastructure/event-bus';
import { [Resource]Repository } from '../infrastructure/repositories/[resource].repository';
import { [Resource] } from '../domain/entities/[resource].entity';
import { [Resource]CreatedEvent } from '../domain/events/[resource]-created.event';

@Injectable()
export class [Resource]Service {
  constructor(
    private readonly repository: [Resource]Repository,
    private readonly eventBus: EventBus,
    @InjectConnection() private readonly mongoConnection: Connection
  ) {}

  async create(dto: Create[Resource]Dto): Promise<[Resource]> {
    const session = await this.mongoConnection.startSession();
    
    try {
      const result = await session.withTransaction(async () => {
        // Check for duplicates (fix OLD issue: no uniqueness validation)
        const existing = await this.repository.findByUniqueKey(dto.uniqueKey, session);
        if (existing) {
          throw new ConflictException('[Resource] already exists');
        }

        // Create entity with validation
        const entity = [Resource].create(dto);
        
        // Save with session (fix OLD issue: no transactions)
        const saved = await this.repository.save(entity, session);
        
        // Publish event (will be committed with transaction)
        await this.eventBus.publish(new [Resource]CreatedEvent(saved));
        
        return saved;
      });
      
      return result;
    } finally {
      await session.endSession();
    }
  }

  async findAll(query: [Resource]QueryDto): Promise<Paginated<[Resource]>> {
    // Fix OLD issue: unbounded queries
    const limit = Math.min(query.limit || 20, 100);
    const offset = query.offset || 0;
    
    return this.repository.findPaginated({
      filter: query.filter,
      limit,
      offset,
      sort: query.sort
    });
  }

  async findOne(id: string): Promise<[Resource]> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundException('[Resource] not found');
    }
    return entity;
  }

  async update(id: string, dto: Update[Resource]Dto): Promise<[Resource]> {
    const session = await this.mongoConnection.startSession();
    
    try {
      const result = await session.withTransaction(async () => {
        const entity = await this.repository.findById(id, session);
        if (!entity) {
          throw new NotFoundException('[Resource] not found');
        }

        // Apply updates with validation
        entity.update(dto);
        
        // Save changes
        const updated = await this.repository.save(entity, session);
        
        // Publish update event
        await this.eventBus.publish(new [Resource]UpdatedEvent(updated));
        
        return updated;
      });
      
      return result;
    } finally {
      await session.endSession();
    }
  }

  async remove(id: string): Promise<void> {
    const session = await this.mongoConnection.startSession();
    
    try {
      await session.withTransaction(async () => {
        const entity = await this.repository.findById(id, session);
        if (!entity) {
          throw new NotFoundException('[Resource] not found');
        }

        // Soft delete (fix OLD issue: inconsistent deletion)
        await this.repository.softDelete(id, session);
        
        // Publish delete event
        await this.eventBus.publish(new [Resource]DeletedEvent({ id }));
      });
    } finally {
      await session.endSession();
    }
  }
}
```

### Repository Template
```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { BaseRepository } from '@shared/infrastructure/base.repository';
import { [Resource] } from '../../domain/entities/[resource].entity';
import { [Resource]Document } from '../schemas/[resource].schema';

@Injectable()
export class [Resource]Repository extends BaseRepository<[Resource]> {
  constructor(
    @InjectModel([Resource].name) private [resource]Model: Model<[Resource]Document>
  ) {
    super([resource]Model);
  }

  async findByUniqueKey(key: string, session?: ClientSession): Promise<[Resource] | null> {
    const doc = await this.[resource]Model
      .findOne({ uniqueKey: key, deletedAt: null })
      .session(session)
      .exec();
      
    return doc ? this.toDomainEntity(doc) : null;
  }

  async findPaginated(options: PaginationOptions): Promise<Paginated<[Resource]>> {
    const { filter, limit, offset, sort } = options;
    
    // Build query (fix OLD issue: no filtering)
    const query = { 
      ...filter,
      deletedAt: null  // Soft delete filter
    };
    
    const [items, total] = await Promise.all([
      this.[resource]Model
        .find(query)
        .sort(sort || { createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .exec(),
      this.[resource]Model.countDocuments(query)
    ]);
    
    return {
      items: items.map(doc => this.toDomainEntity(doc)),
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    };
  }

  private toDomainEntity(doc: [Resource]Document): [Resource] {
    return [Resource].fromPersistence({
      id: doc._id.toString(),
      ...doc.toObject()
    });
  }
}
```

## Anti-Patterns to Avoid (From OLD Code)
- ❌ No transactions for multi-step operations
- ❌ Unbounded queries without pagination
- ❌ Missing uniqueness validation
- ❌ Hardcoded configuration values
- ❌ No error handling or generic errors
- ❌ Direct MongoDB operations without repository
- ❌ Missing soft delete handling
- ❌ No event publishing

## Validation Checklist
- [ ] JWT guard applied to all endpoints
- [ ] Role-based access control configured
- [ ] Input validation with class-validator
- [ ] Transactions for data modifications
- [ ] Events published for all state changes
- [ ] Pagination for list endpoints
- [ ] Proper error handling with domain errors
- [ ] Soft delete implemented consistently
- [ ] API documentation with Swagger
- [ ] Unit tests with 80% coverage
```

### 5.3 Project Commands (.claude/commands/project-commands.md)

```markdown
# Project Management Commands

## Sprint Management

### /sprint-status
- **Description**: Show current sprint progress and statistics
- **Usage**: `/sprint-status [sprint-id]`
- **Parameters**:
  - `sprint-id`: Optional, defaults to current sprint
- **Example**: `/sprint-status 0.1`
- **Agent**: Master Coordinator
- **Output**: Sprint burndown, completed tasks, blockers

### /assign-task
- **Description**: Assign a task to specific agent
- **Usage**: `/assign-task [task-id] [agent-name]`
- **Parameters**:
  - `task-id`: JIRA ticket ID (e.g., CLNZ-101)
  - `agent-name`: Target agent
- **Example**: `/assign-task CLNZ-101 security-agent`
- **Agent**: Master Coordinator
- **Output**: Assignment confirmation

### /create-ticket
- **Description**: Create new JIRA ticket
- **Usage**: `/create-ticket [type] [title] [description]`
- **Parameters**:
  - `type`: story|task|bug|spike
  - `title`: Ticket title
  - `description`: Detailed description
- **Example**: `/create-ticket bug "JWT verification failing" "Description..."`
- **Agent**: Master Coordinator
- **Output**: Created ticket ID

## Coordination

### /integration-check
- **Description**: Verify service integration points
- **Usage**: `/integration-check [service1] [service2]`
- **Parameters**:
  - `service1`: First service name
  - `service2`: Second service name
- **Example**: `/integration-check identity organization`
- **Agent**: Master Coordinator
- **Output**: Integration status, contract validation

### /blocker-report
- **Description**: Report and escalate blocking issue
- **Usage**: `/blocker-report [description] [severity]`
- **Parameters**:
  - `description`: Issue description
  - `severity`: critical|high|medium
- **Example**: `/blocker-report "MongoDB connection failing" critical`
- **Agent**: Current Agent → Master Coordinator
- **Output**: Escalation ticket, suggested resolution

### /daily-sync
- **Description**: Generate daily sync report
- **Usage**: `/daily-sync [date]`
- **Parameters**:
  - `date`: Optional, defaults to today
- **Example**: `/daily-sync 2024-11-15`
- **Agent**: All Agents → Master Coordinator
- **Output**: Consolidated daily report

## Architecture Decisions

### /create-adr
- **Description**: Create Architecture Decision Record
- **Usage**: `/create-adr [title] [decision]`
- **Parameters**:
  - `title`: ADR title
  - `decision`: Decision details
- **Example**: `/create-adr "Event Bus Selection" "Use EventBridge for production"`
- **Agent**: Architecture Agent
- **Output**: ADR document in Docs/ADR/

### /review-architecture
- **Description**: Request architecture review
- **Usage**: `/review-architecture [component] [concern]`
- **Parameters**:
  - `component`: Component to review
  - `concern`: Specific concern
- **Example**: `/review-architecture calculation-service "performance bottleneck"`
- **Agent**: Architecture Agent
- **Output**: Review findings and recommendations
```

## Step 6: Settings Configuration

### Instructions for Claude Code:

```markdown
Create or update .claude/settings.local.json with the following configuration:
```

```json
{
  "project": {
    "name": "Clenergize V3 Rebuild",
    "type": "microservices",
    "phase": "Sprint 0.1",
    "model_preference": "sonnet",
    "opus_budget": {
      "monthly_hours": 50,
      "used_hours": 0,
      "reserved_for": ["security", "migration", "architecture"]
    }
  },
  "agents": {
    "enabled": true,
    "count": 14,
    "orchestrator": "master-coordinator",
    "default_model": "claude-3-sonnet",
    "opus_triggers": {
      "security": ["jwt", "encryption", "authentication"],
      "migration": ["hierarchy", "normalization", "transformation"],
      "architecture": ["circular", "dependency", "pattern"],
      "calculation": ["algorithm", "optimization", "aggregation"]
    }
  },
  "skills": {
    "enabled": true,
    "auto_load": true,
    "directories": [
      ".claude/skills",
      "NEW/shared/skills"
    ]
  },
  "commands": {
    "enabled": true,
    "prefix": "/",
    "directories": [
      ".claude/commands"
    ]
  },
  "mcp_servers": {
    "mongodb": {
      "enabled": true,
      "databases": [
        "identity", "organization", "reference",
        "activity", "calculation", "reporting", "audit"
      ]
    },
    "redis": {
      "enabled": true,
      "purposes": ["cache", "pubsub"]
    },
    "jira": {
      "enabled": true,
      "project": "CLNZ"
    },
    "github": {
      "enabled": true,
      "repo": "clenergize-v3-rebuild"
    }
  },
  "context": {
    "max_tokens": 200000,
    "allocation": {
      "documentation": 50000,
      "active_code": 120000,
      "buffer": 30000
    },
    "priority_files": [
      ".claude/CLAUDE.md",
      "Docs/OLD_TO_NEW_MIGRATION_GUIDE.md",
      "OLD/DESIGN-REVIEW.md"
    ]
  },
  "old_code": {
    "reference_only": true,
    "mount_readonly": true,
    "never_copy_paste": true,
    "issues_file": "OLD/DESIGN-REVIEW.md"
  }
}
```

## Step 7: Validation Script

### Instructions for Claude Code:

```markdown
Create a validation script to verify all configurations are properly set up:
```

```bash
#!/bin/bash
# .claude/validate-setup.sh

echo "🔍 Validating Claude Code Setup for Clenergize V3"
echo "=================================================="

# Check directory structure
echo "✓ Checking directory structure..."
dirs=(".claude" ".claude/agents" ".claude/skills" ".claude/commands" "OLD" "NEW" "Docs")
for dir in "${dirs[@]}"; do
  if [ -d "$dir" ]; then
    echo "  ✓ $dir exists"
  else
    echo "  ✗ $dir missing - creating..."
    mkdir -p "$dir"
  fi
done

# Check agent files
echo "✓ Checking agent configurations..."
agents=(
  "master-coordinator" "architecture-agent" "security-agent"
  "identity-agent" "organization-agent" "reference-agent"
  "activity-agent" "calculation-agent" "reporting-agent"
  "audit-agent" "frontend-agent" "testing-agent"
  "devops-agent" "migration-agent"
)
for agent in "${agents[@]}"; do
  if [ -f ".claude/agents/$agent.md" ]; then
    echo "  ✓ $agent.md exists"
  else
    echo "  ✗ $agent.md missing"
  fi
done

# Check skill files
echo "✓ Checking skills..."
skills=(
  "nestjs-service-generator" "mongodb-migration-tool"
  "openapi-contract-validator" "security-vulnerability-scanner"
  "performance-optimization-tool"
)
for skill in "${skills[@]}"; do
  if [ -f ".claude/skills/$skill.md" ]; then
    echo "  ✓ $skill.md exists"
  else
    echo "  ✗ $skill.md missing"
  fi
done

# Check command files
echo "✓ Checking commands..."
commands=(
  "project-commands" "development-commands"
  "testing-commands" "deployment-commands"
  "migration-commands"
)
for cmd in "${commands[@]}"; do
  if [ -f ".claude/commands/$cmd.md" ]; then
    echo "  ✓ $cmd.md exists"
  else
    echo "  ✗ $cmd.md missing"
  fi
done

# Check settings
echo "✓ Checking settings..."
if [ -f ".claude/settings.local.json" ]; then
  echo "  ✓ settings.local.json exists"
  # Validate JSON
  if python -m json.tool .claude/settings.local.json > /dev/null 2>&1; then
    echo "  ✓ settings.local.json is valid JSON"
  else
    echo "  ✗ settings.local.json has invalid JSON"
  fi
else
  echo "  ✗ settings.local.json missing"
fi

# Check documentation
echo "✓ Checking documentation..."
docs=(
  "CLAUDE.md" "CLAUDE_MULTI_AGENT_STRATEGY.md"
  "PROJECT_STRUCTURE_GUIDE.md" "OLD_TO_NEW_MIGRATION_GUIDE.md"
)
for doc in "${docs[@]}"; do
  if [ -f ".claude/$doc" ] || [ -f "Docs/$doc" ]; then
    echo "  ✓ $doc exists"
  else
    echo "  ✗ $doc missing"
  fi
done

echo ""
echo "=================================================="
echo "Validation complete! Fix any ✗ items above."
```

## Final Instructions for Claude Code

Copy and paste this complete instruction set into Claude Code:

```markdown
# Generate Claude Code Configuration for Clenergize V3

Please execute the following tasks to set up the complete Claude Code configuration:

1. **Create Directory Structure**:
   - Create .claude/agents/, .claude/skills/, .claude/commands/ directories

2. **Generate 14 Agent Configuration Files** in .claude/agents/:
   - Use the agent template provided
   - Each agent should reference their OLD service path
   - Include Opus 4.1 decision criteria
   - Add integration points and MCP servers

3. **Generate 10 Skill Files** in .claude/skills/:
   - Focus on fixing OLD code issues
   - Include templates for NEW patterns
   - Add validation checklists

4. **Generate 5 Command Category Files** in .claude/commands/:
   - Project management commands
   - Development commands
   - Testing commands
   - Deployment commands
   - Migration commands

5. **Create settings.local.json** in .claude/:
   - Copy the provided JSON configuration
   - Set project phase to "Sprint 0.1"

6. **Create validate-setup.sh** in .claude/:
   - Copy the validation script
   - Make it executable

7. **Generate a README.md** in .claude/:
   - Document the setup
   - Include agent activation instructions
   - Add daily workflow guide

After generation, run the validation script to ensure everything is properly configured.

The goal is to have a fully operational multi-agent system ready to begin Sprint 0.1 with focus on:
- Fixing JWT verification (Security Agent)
- Setting up Docker environment (DevOps Agent)
- Planning hierarchy migration (Migration Agent)
```

## Summary

This completes the setup instructions for Claude Code. The generated files will:

1. **Enable 14 specialized agents** working on different aspects of the project
2. **Provide reusable skills** for common development patterns
3. **Offer slash commands** for quick operations
4. **Maintain configuration** for the entire project lifecycle

Next steps after file generation:
1. Run the validation script
2. Activate Master Coordinator agent
3. Begin Sprint 0.1 tasks
4. Daily syncs between agents
