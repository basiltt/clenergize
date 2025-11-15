# Project Commands

## Sprint Management Commands

### /sprint-status
Show current Sprint 0.1 progress with detailed task breakdown.

**Usage**: `/sprint-status`

**Output**:
```
Sprint 0.1 - Security Foundation & Local Development
Day: 1 of 10
Progress: 12% (5 of 45 story points completed)

✅ Completed:
- Docker environment setup
- JWT verification fix in Identity Service

🚧 In Progress:
- Hierarchy migration planning (Migration Agent)
- LocalStack AWS services setup (DevOps Agent)

📋 Pending:
- Transaction boundaries implementation
- Security scanning automation
- Base service templates

⚠️ Blockers:
- None currently

Key Milestone: Docker environment operational by Day 3
```

### /assign-task [CLNZ-XXX] [agent]
Assign a specific Jira ticket to an agent.

**Usage**: `/assign-task CLNZ-101 security-agent`

**Parameters**:
- `CLNZ-XXX`: Jira ticket number
- `agent`: Agent name (security, identity, organization, etc.)

### /blocker-report [issue]
Escalate a blocking issue that needs immediate attention.

**Usage**: `/blocker-report "JWT verification failing in production environment"`

**Output**: Creates escalation report and notifies Master Coordinator

### /daily-sync
Collect status updates from all active agents.

**Usage**: `/daily-sync`

**Output**: Aggregated status report from all 14 agents

### /integration-check [service1] [service2]
Verify integration points between two services.

**Usage**: `/integration-check identity-service organization-service`

**Output**:
```
Integration Check: identity-service ↔ organization-service
✅ API contracts compatible
✅ Event schemas aligned
✅ Shared types match
⚠️ Warning: organization-service not handling UserDeleted event
```

## Project Initialization Commands

### /init-project [name]
Initialize a new microservice project with clean architecture.

**Usage**: `/init-project reporting-service`

**Actions**:
1. Creates NEW/{name}/ directory structure
2. Applies NestJS service template
3. Configures MongoDB connection
4. Sets up Docker configuration
5. Adds to docker-compose.yml
6. Creates health check endpoints

### /clone-to-reference [old-service] [new-service]
Convert OLD service patterns to NEW reference-based architecture.

**Usage**: `/clone-to-reference clenergizeV3-user-management-ms-dev identity-service`

**Actions**:
1. Analyzes OLD service structure
2. Identifies problematic patterns
3. Generates NEW service with fixes
4. Creates migration plan

## Migration Commands

### /analyze-old-issues [service]
Scan OLD service for all known issues (C1-C10).

**Usage**: `/analyze-old-issues clenergizeV3-backend-ms-dev`

**Output**:
```
Issues found in clenergizeV3-backend-ms-dev:
❌ C1: JWT decode without verification (3 occurrences)
❌ C2: Infinite SQS polling loop (1 occurrence)
❌ C6: No transaction boundaries (5 operations)
✅ C3: No hierarchy cloning (not applicable)
```

### /migration-plan [old] [new]
Generate detailed migration plan from OLD to NEW service.

**Usage**: `/migration-plan clenergizeV3-project-management-ms-dev organization-service`

**Output**: Detailed migration steps with effort estimates

## Quality Assurance Commands

### /health-check-all
Check health status of all services.

**Usage**: `/health-check-all`

**Output**:
```
Service Health Status:
✅ identity-service    (port 3001): Healthy
✅ organization-service (port 3002): Healthy
❌ reference-service    (port 3003): Unhealthy - MongoDB connection failed
✅ activity-service     (port 3004): Healthy
✅ calculation-service  (port 3005): Healthy
⚠️ reporting-service    (port 3006): Degraded - SQS queue depth high
✅ audit-service        (port 3007): Healthy
```

### /dependency-graph [service]
Show dependency graph for a service.

**Usage**: `/dependency-graph calculation-service`

**Output**: ASCII art dependency tree showing all service dependencies