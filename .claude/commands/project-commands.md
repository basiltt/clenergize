# Project Commands (MCP Executor)

## Sprint Management Commands

### Sprint Status
```javascript
// Get current sprint status
execute({
  action: 'jira',
  content: 'sprint-status',
  options: {
    sprint: 'Sprint 0.1'
  }
})

// Get detailed task breakdown
execute({
  action: 'jira',
  content: 'sprint-tasks',
  options: {
    sprint: 'Sprint 0.1',
    groupBy: 'status'
  }
})
```

### Assign Task
```javascript
// Assign Jira ticket to agent
execute({
  action: 'jira',
  content: 'CLNZ-101',
  options: {
    assignee: 'security-agent@clenergize.com',
    status: 'In Progress'
  }
})

// Add comment to ticket
execute({
  action: 'jira',
  content: 'CLNZ-101',
  options: {
    comment: 'Starting JWT verification implementation'
  }
})
```

### Blocker Report
```javascript
// Escalate blocking issue
execute({
  action: 'jira',
  content: 'create',
  options: {
    type: 'Bug',
    priority: 'Blocker',
    summary: 'JWT verification failing in production environment',
    description: 'Detailed description of the blocker',
    labels: ['blocker', 'security', 'production']
  }
})

// Notify team in Slack
execute({
  action: 'slack',
  content: 'send-message',
  options: {
    channel: '#clenergize-rebuild',
    message: '🚨 BLOCKER: JWT verification failing - CLNZ-XXX'
  }
})
```

### Daily Sync
```javascript
// Collect status from all services
execute({
  action: 'bash',
  content: 'for service in identity organization reference activity calculation reporting audit; do echo "=== $service ===" && curl -s http://localhost:300$((port++))/health; done'
})

// Get git status
execute({
  action: 'git',
  content: 'status'
})

// Check Docker services
execute({
  action: 'docker',
  content: 'ps'
})
```

### Integration Check
```javascript
// Verify integration between services
execute({
  action: 'test',
  content: 'integration',
  options: {
    services: ['identity-service', 'organization-service'],
    checks: [
      'api-contracts',
      'event-schemas',
      'shared-types',
      'error-handling'
    ]
  }
})

// Test specific integration endpoint
execute({
  action: 'bash',
  content: `
    curl -X POST http://localhost:3001/auth/login \\
      -H "Content-Type: application/json" \\
      -d '{"email":"test@example.com","password":"Test123!"}' \\
      -o /tmp/token.json && \\
    TOKEN=$(cat /tmp/token.json | jq -r '.data.token') && \\
    curl -H "Authorization: Bearer $TOKEN" \\
      http://localhost:3002/projects
  `
})
```

## Project Initialization Commands

### Init Project
```javascript
// Initialize new microservice
execute({
  action: 'generate-service',
  content: 'reporting',
  options: {
    port: 3006,
    database: 'clenergize_reporting',
    features: ['auth', 'logging', 'health-checks']
  }
})

// Add to docker-compose
execute({
  action: 'file',
  content: 'append',
  options: {
    path: 'docker-compose.dev.yml',
    data: `
  reporting-service:
    build: ./NEW/reporting-service
    ports:
      - "3006:3006"
    environment:
      - MONGODB_URI=mongodb://admin:localdev123@mongodb:27017/clenergize_reporting?authSource=admin
      - PORT=3006
    depends_on:
      - mongodb
      - redis
    `
  }
})
```

### Clone to Reference
```javascript
// Analyze OLD service
execute({
  action: 'bash',
  content: 'cd OLD/clenergizeV3-user-management-ms-dev && find src -name "*.ts" | wc -l'
})

// Identify problematic patterns
execute({
  action: 'code-analysis',
  content: 'scan-issues',
  options: {
    path: 'OLD/clenergizeV3-user-management-ms-dev',
    issues: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10']
  }
})

// Generate NEW service with fixes
execute({
  action: 'generate-service',
  content: 'identity',
  options: {
    port: 3001,
    basedOn: 'OLD/clenergizeV3-user-management-ms-dev',
    applyFixes: true
  }
})
```

## Migration Commands

### Analyze Old Issues
```javascript
// Scan OLD service for all issues
execute({
  action: 'bash',
  content: `
    echo "=== C1: JWT decode without verification ===" &&
    grep -r "jwt.decode" OLD/clenergizeV3-backend-ms-dev/src &&
    echo "=== C2: Infinite SQS polling ===" &&
    grep -r "while(true)" OLD/clenergizeV3-backend-ms-dev/src &&
    echo "=== C6: No transaction boundaries ===" &&
    grep -rL "startSession" OLD/clenergizeV3-backend-ms-dev/src
  `
})

// Generate issue report
execute({
  action: 'file',
  content: 'write',
  options: {
    path: 'analysis/OLD-service-issues.md',
    data: `# OLD Service Issues Report

Date: ${new Date().toISOString()}
Service: clenergizeV3-backend-ms-dev

## Issues Found:
See scan results above
    `
  }
})
```

### Migration Plan
```javascript
// Generate migration plan
execute({
  action: 'migration',
  content: 'generate-plan',
  options: {
    source: 'OLD/clenergizeV3-project-management-ms-dev',
    target: 'NEW/organization-service',
    outputFile: 'migration-plans/organization-service-migration.md'
  }
})

// Review plan
execute({
  action: 'file',
  content: 'read',
  options: {
    path: 'migration-plans/organization-service-migration.md'
  }
})
```

## Quality Assurance Commands

### Health Check All
```javascript
// Check all service health
execute({
  action: 'bash',
  content: `
    for port in 3001 3002 3003 3004 3005 3006 3007; do
      echo "Checking port $port..."
      curl -s http://localhost:$port/health | jq '.status' || echo "FAILED"
    done
  `
})

// Check infrastructure health
execute({
  action: 'mongodb',
  content: 'db.adminCommand({ping: 1})'
})

execute({
  action: 'redis',
  content: 'PING'
})
```

### Dependency Graph
```javascript
// Generate dependency graph
execute({
  action: 'bash',
  content: 'cd NEW/calculation-service && npm ls --depth=0'
})

// Visualize service dependencies
execute({
  action: 'code-analysis',
  content: 'dependency-graph',
  options: {
    service: 'calculation-service',
    output: 'dependency-graph.md'
  }
})
```

## Documentation Commands

### Generate API Docs
```javascript
// Generate OpenAPI documentation
execute({
  action: 'bash',
  content: 'cd NEW/identity-service && npm run docs:generate'
})

// Serve documentation
execute({
  action: 'bash',
  content: 'cd NEW/identity-service && npm run docs:serve',
  run_in_background: true
})
```

### Update README
```javascript
// Update service README
execute({
  action: 'file',
  content: 'write',
  options: {
    path: 'NEW/identity-service/README.md',
    data: `# Identity Service

## Overview
User authentication and authorization service using JWT with JWKS verification.

## Port
3001

## Environment Variables
- MONGODB_URI
- JWT_ISSUER
- JWT_AUDIENCE
- JWKS_URI

## Endpoints
- POST /auth/login
- POST /auth/refresh
- GET /auth/user/:id
- GET /health

## Running
\`\`\`bash
npm run start:dev
\`\`\`
    `
  }
})
```

## Deployment Commands

### Build All Services
```javascript
// Build all services
execute({
  action: 'bash',
  content: `
    for service in identity organization reference activity calculation reporting audit; do
      echo "Building $service..."
      cd NEW/$service-service && npm run build && cd ../..
    done
  `
})
```

### Deploy to Dev
```javascript
// Deploy to development environment
execute({
  action: 'bash',
  content: 'docker-compose -f docker-compose.dev.yml up -d --build'
})

// Verify deployment
execute({
  action: 'bash',
  content: 'docker-compose -f docker-compose.dev.yml ps'
})
```

## Monitoring Commands

### View Logs
```javascript
// View service logs
execute({
  action: 'docker',
  content: 'logs --tail 100 -f clenergize-identity-service'
})

// View all service logs
execute({
  action: 'bash',
  content: 'docker-compose -f docker-compose.dev.yml logs --tail=50'
})
```

### Metrics Dashboard
```javascript
// Get service metrics
execute({
  action: 'bash',
  content: 'curl -s http://localhost:3001/metrics'
})

// Get resource usage
execute({
  action: 'docker',
  content: 'stats --no-stream'
})
```

## Quick Reference

| Task | Command |
|------|---------|
| Sprint status | `execute({ action: 'jira', content: 'sprint-status', options: {...}})` |
| Assign task | `execute({ action: 'jira', content: 'CLNZ-XXX', options: { assignee: 'agent@email.com' }})` |
| Health check | `execute({ action: 'bash', content: 'curl http://localhost:3001/health' })` |
| Generate service | `execute({ action: 'generate-service', content: 'name', options: { port: 3001 }})` |
| View logs | `execute({ action: 'docker', content: 'logs service-name' })` |
| Build service | `execute({ action: 'bash', content: 'cd NEW/service && npm run build' })` |
| Deploy | `execute({ action: 'bash', content: 'docker-compose -f docker-compose.dev.yml up -d' })` |

Remember: Use `execute()` for all operations!
