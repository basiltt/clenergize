# Jira MCP Configuration & Backlog Structure

## Executive Summary

This document defines the Jira project configuration, issue type hierarchy, and MCP (Model Context Protocol) integration setup for creating and managing the Clenergize V3 rebuild backlog programmatically.

## Jira Project Configuration

### Project Setup

```yaml
Project:
  Key: CLNZ
  Name: Clenergize V3 Rebuild
  Type: Software Development
  Template: Scrum
  Lead: Tech Lead/Architect
```

### Issue Type Hierarchy

```
Initiative
  └── Epic
      └── Story
          ├── Task (technical work)
          ├── Bug (defects)
          └── Spike (research)
      └── Sub-task (granular work items)
```

### Components (Services)

```yaml
Components:
  - name: identity-service
    lead: developer1
    description: Authentication and authorization

  - name: organization-service
    lead: developer2
    description: Companies, projects, hierarchies

  - name: reference-service
    lead: developer3
    description: Emission factors and parameters

  - name: activity-service
    lead: developer2
    description: Activity data management

  - name: calculation-service
    lead: developer1
    description: Emission calculations

  - name: reporting-service
    lead: developer3
    description: Reports and analytics

  - name: audit-service
    lead: developer1
    description: Audit and compliance

  - name: shared-libraries
    lead: tech-lead
    description: Common packages

  - name: infrastructure
    lead: devops
    description: AWS, CI/CD, monitoring
```

### Labels

```yaml
Labels:
  # Phase Labels
  - phase-0-foundation
  - phase-1-core-mvp
  - phase-2-calculation
  - phase-3-reporting
  - phase-4-hardening

  # Priority Labels
  - critical-security
  - high-priority
  - medium-priority
  - low-priority

  # Technical Labels
  - api
  - database
  - event-driven
  - authentication
  - migration
  - performance
  - technical-debt

  # Risk Labels
  - risk-high
  - risk-medium
  - risk-low
  - security-fix
  - data-fix
```

### Custom Fields

```yaml
CustomFields:
  - name: Story Points
    type: number
    field_id: customfield_10001

  - name: Sprint
    type: sprint
    field_id: customfield_10002

  - name: Risk Level
    type: select
    field_id: customfield_10003
    options: [Low, Medium, High, Critical]

  - name: Service
    type: multiselect
    field_id: customfield_10004
    options: [Identity, Organization, Reference, Activity, Calculation, Reporting, Audit]

  - name: Acceptance Criteria
    type: text
    field_id: customfield_10005
```

### Workflows

```yaml
Workflow States:
  - To Do (initial)
  - In Analysis
  - Ready for Dev
  - In Progress
  - Code Review
  - Ready for Test
  - Testing
  - Done (final)
  - Blocked
  - Won't Do

Transitions:
  - Start Work: To Do → In Progress
  - Submit for Review: In Progress → Code Review
  - Approve Review: Code Review → Ready for Test
  - Start Testing: Ready for Test → Testing
  - Pass Testing: Testing → Done
  - Fail Testing: Testing → In Progress
  - Block: any → Blocked
  - Unblock: Blocked → previous state
```

## MCP Integration Configuration

### MCP Connection Setup

```javascript
// mcp-config.js
module.exports = {
  jira: {
    host: 'your-company.atlassian.net',
    email: 'automation@your-company.com',
    apiToken: process.env.JIRA_API_TOKEN,
    project: 'CLNZ'
  },
  defaults: {
    issueType: 'Story',
    priority: 'Medium',
    reporter: 'automation@your-company.com'
  }
};
```

### MCP Authentication

```bash
# Environment variables needed
JIRA_HOST=your-company.atlassian.net
JIRA_EMAIL=automation@your-company.com
JIRA_API_TOKEN=your-api-token-here
JIRA_PROJECT_KEY=CLNZ
```

## Backlog Structure

### Initiative Level

```yaml
Initiative: Clenergize V3 Platform Rebuild
  Key: CLNZ-1
  Summary: Complete rebuild of Clenergize platform with microservices
  Description: |
    Rebuild the Clenergize carbon management platform to address:
    - Critical security vulnerabilities
    - Data model issues
    - Performance and scalability
    - Maintainability concerns
```

### Epic Structure (by Phase)

#### Phase 0 Epics

```yaml
Epic: Security Foundation
  Key: CLNZ-10
  Summary: Implement secure authentication and JWT verification
  Labels: [phase-0-foundation, critical-security]
  Component: shared-libraries

Epic: Infrastructure Setup
  Key: CLNZ-11
  Summary: Provision AWS infrastructure with IaC
  Labels: [phase-0-foundation]
  Component: infrastructure

Epic: Shared Libraries
  Key: CLNZ-12
  Summary: Create common packages for all services
  Labels: [phase-0-foundation]
  Component: shared-libraries
```

#### Phase 1 Epics

```yaml
Epic: Identity Service Implementation
  Key: CLNZ-20
  Summary: Build authentication and authorization service
  Labels: [phase-1-core-mvp]
  Component: identity-service

Epic: Organization Service Implementation
  Key: CLNZ-21
  Summary: Build company and project management service
  Labels: [phase-1-core-mvp]
  Component: organization-service

Epic: Reference Service Implementation
  Key: CLNZ-22
  Summary: Build emission factors and parameters service
  Labels: [phase-1-core-mvp]
  Component: reference-service
```

## MCP API Calls - Examples

### Creating an Epic

```javascript
// Create Epic via MCP
const createEpic = {
  method: 'POST',
  endpoint: '/rest/api/3/issue',
  payload: {
    fields: {
      project: { key: 'CLNZ' },
      summary: 'Security Foundation',
      description: {
        type: 'doc',
        version: 1,
        content: [{
          type: 'paragraph',
          content: [{
            type: 'text',
            text: 'Implement secure authentication with JWT verification, fixing critical vulnerabilities'
          }]
        }]
      },
      issuetype: { name: 'Epic' },
      labels: ['phase-0-foundation', 'critical-security'],
      components: [{ name: 'shared-libraries' }],
      customfield_10003: { value: 'Critical' }, // Risk Level
      reporter: { email: 'automation@your-company.com' }
    }
  }
};
```

### Creating a Story

```javascript
// Create Story via MCP
const createStory = {
  method: 'POST',
  endpoint: '/rest/api/3/issue',
  payload: {
    fields: {
      project: { key: 'CLNZ' },
      parent: { key: 'CLNZ-10' }, // Link to Epic
      summary: 'Implement JWT verification with JWKS',
      description: {
        type: 'doc',
        version: 1,
        content: [{
          type: 'paragraph',
          content: [{
            type: 'text',
            text: 'As a security engineer, I want proper JWT signature verification so that tokens cannot be forged'
          }]
        }]
      },
      issuetype: { name: 'Story' },
      labels: ['critical-security', 'authentication'],
      components: [{ name: 'identity-service' }],
      customfield_10001: 5, // Story Points
      customfield_10005: `
        - JWT tokens verified using JWKS
        - RS256 algorithm enforced
        - Token expiry validated
        - Issuer and audience claims checked
        - Unit tests with 100% coverage
        - Security test for token forgery attempts
      `, // Acceptance Criteria
      priority: { name: 'Critical' }
    }
  }
};
```

### Creating a Task

```javascript
// Create Task via MCP
const createTask = {
  method: 'POST',
  endpoint: '/rest/api/3/issue',
  payload: {
    fields: {
      project: { key: 'CLNZ' },
      parent: { key: 'CLNZ-101' }, // Link to Story
      summary: 'Set up JWKS endpoint and key rotation',
      description: 'Configure JWKS endpoint for public key distribution and implement key rotation mechanism',
      issuetype: { name: 'Task' },
      assignee: { email: 'developer1@your-company.com' },
      customfield_10001: 3, // Story Points
      timetracking: {
        originalEstimate: '1d'
      }
    }
  }
};
```

### Bulk Create Issues

```javascript
// Bulk create multiple issues
const bulkCreate = {
  method: 'POST',
  endpoint: '/rest/api/3/issue/bulk',
  payload: {
    issueUpdates: [
      {
        fields: {
          project: { key: 'CLNZ' },
          summary: 'Configure MongoDB connection pool',
          issuetype: { name: 'Task' },
          parent: { key: 'CLNZ-11' }
        }
      },
      {
        fields: {
          project: { key: 'CLNZ' },
          summary: 'Set up Redis cluster for caching',
          issuetype: { name: 'Task' },
          parent: { key: 'CLNZ-11' }
        }
      },
      {
        fields: {
          project: { key: 'CLNZ' },
          summary: 'Configure EventBridge event bus',
          issuetype: { name: 'Task' },
          parent: { key: 'CLNZ-11' }
        }
      }
    ]
  }
};
```

## Complete Backlog Creation Script

```javascript
// Full MCP script to create initial backlog
async function createClenergizeBacklog(mcpClient) {

  // 1. Create Initiative
  const initiative = await mcpClient.createIssue({
    type: 'Initiative',
    summary: 'Clenergize V3 Platform Rebuild',
    description: 'Complete platform rebuild with microservices architecture'
  });

  // 2. Create Phase 0 Epics
  const phase0Epics = [
    {
      summary: 'Security Foundation',
      description: 'Fix critical security vulnerabilities',
      labels: ['phase-0-foundation', 'critical-security'],
      component: 'shared-libraries'
    },
    {
      summary: 'Infrastructure Setup',
      description: 'AWS infrastructure with IaC',
      labels: ['phase-0-foundation'],
      component: 'infrastructure'
    },
    {
      summary: 'Shared Libraries',
      description: 'Common packages for services',
      labels: ['phase-0-foundation'],
      component: 'shared-libraries'
    }
  ];

  for (const epic of phase0Epics) {
    const createdEpic = await mcpClient.createIssue({
      type: 'Epic',
      parent: initiative.key,
      ...epic
    });

    // 3. Create Stories for each Epic
    const stories = getStoriesForEpic(epic.summary);
    for (const story of stories) {
      await mcpClient.createIssue({
        type: 'Story',
        parent: createdEpic.key,
        ...story
      });
    }
  }
}

function getStoriesForEpic(epicSummary) {
  const storyMap = {
    'Security Foundation': [
      {
        summary: 'Implement JWT verification with JWKS',
        points: 5,
        priority: 'Critical'
      },
      {
        summary: 'Set up secrets management with AWS Secrets Manager',
        points: 3,
        priority: 'High'
      },
      {
        summary: 'Implement rate limiting and DDoS protection',
        points: 3,
        priority: 'High'
      }
    ],
    'Infrastructure Setup': [
      {
        summary: 'Provision VPC and networking with CDK',
        points: 5,
        priority: 'High'
      },
      {
        summary: 'Set up ECS Fargate clusters',
        points: 3,
        priority: 'High'
      },
      {
        summary: 'Configure MongoDB Atlas cluster',
        points: 2,
        priority: 'High'
      }
    ],
    'Shared Libraries': [
      {
        summary: 'Create event bus abstraction',
        points: 3,
        priority: 'High'
      },
      {
        summary: 'Implement repository base classes',
        points: 3,
        priority: 'Medium'
      },
      {
        summary: 'Build error handling framework',
        points: 2,
        priority: 'Medium'
      }
    ]
  };

  return storyMap[epicSummary] || [];
}
```

## Sprint Planning in Jira

### Sprint Creation

```javascript
// Create Sprint via MCP
const createSprint = {
  method: 'POST',
  endpoint: '/rest/agile/1.0/sprint',
  payload: {
    name: 'Sprint 0.1 - Security Foundation',
    startDate: '2024-01-15T10:00:00.000Z',
    endDate: '2024-01-29T17:00:00.000Z',
    goal: 'Establish secure foundation with JWT verification and infrastructure',
    originBoardId: 1 // Your board ID
  }
};

// Add issues to sprint
const addToSprint = {
  method: 'POST',
  endpoint: '/rest/agile/1.0/sprint/{sprintId}/issue',
  payload: {
    issues: ['CLNZ-101', 'CLNZ-102', 'CLNZ-103']
  }
};
```

### Sprint Planning Template

```yaml
Sprint 0.1 (Security Foundation):
  Capacity: 35 points
  Stories:
    - CLNZ-101: JWT verification (5 pts)
    - CLNZ-102: Secrets management (3 pts)
    - CLNZ-103: Rate limiting (3 pts)
    - CLNZ-104: VPC setup (5 pts)
    - CLNZ-105: MongoDB setup (2 pts)
  Total: 18 points
  Buffer: 17 points for tasks/bugs

Sprint 0.2 (Infrastructure Completion):
  Capacity: 35 points
  Stories:
    - CLNZ-106: ECS Fargate setup (3 pts)
    - CLNZ-107: EventBridge configuration (3 pts)
    - CLNZ-108: CI/CD pipeline (5 pts)
    - CLNZ-109: Monitoring setup (3 pts)
    - CLNZ-110: Event bus abstraction (3 pts)
  Total: 17 points
  Buffer: 18 points
```

## Jira Automation Rules

### Rule 1: Auto-assign based on component

```yaml
Trigger: Issue Created
Condition: Component = "identity-service"
Action: Assign to developer1@company.com
```

### Rule 2: Move to Ready when subtasks complete

```yaml
Trigger: All subtasks transitioned to Done
Condition: Issue type = Story
Action: Transition to "Ready for Test"
```

### Rule 3: Add label based on priority

```yaml
Trigger: Issue Updated
Condition: Priority = "Critical"
Action: Add label "critical-path"
```

## JQL Queries for Tracking

### Critical Security Items
```jql
project = CLNZ AND labels in ("critical-security") AND status != Done
ORDER BY priority DESC, created ASC
```

### Current Sprint Work
```jql
project = CLNZ AND sprint in openSprints()
ORDER BY rank ASC
```

### Phase 0 Progress
```jql
project = CLNZ AND labels = "phase-0-foundation"
```

### Blocked Items
```jql
project = CLNZ AND status = Blocked
```

### High Risk Items
```jql
project = CLNZ AND "Risk Level" in (High, Critical) AND status != Done
```

## Dashboard Configuration

### Widgets for Project Dashboard

1. **Sprint Burndown Chart**
   - Shows daily progress toward sprint goal

2. **Velocity Chart**
   - Tracks team velocity over sprints

3. **Epic Progress**
   - Shows completion % per epic

4. **Risk Matrix**
   - 2D grid of probability vs impact

5. **Security Items**
   - Filter: label = "critical-security"

6. **Cumulative Flow Diagram**
   - Shows work item flow through states

7. **Component Health**
   - Issues per service component

## MCP Execution Plan

### Step 1: Test Connection
```javascript
async function testJiraConnection() {
  try {
    const response = await mcpClient.get('/rest/api/3/myself');
    console.log('Connected as:', response.data.displayName);
    return true;
  } catch (error) {
    console.error('Connection failed:', error);
    return false;
  }
}
```

### Step 2: Create Project Structure
```javascript
async function setupProject() {
  // 1. Create components
  await createComponents();

  // 2. Create custom fields (if admin)
  await createCustomFields();

  // 3. Create initial epics
  await createPhase0Epics();

  // 4. Create first sprint
  await createFirstSprint();
}
```

### Step 3: Populate Backlog
```javascript
async function populateBacklog() {
  const phases = [0, 1, 2, 3, 4];

  for (const phase of phases) {
    const epics = await getEpicsForPhase(phase);

    for (const epic of epics) {
      const epicKey = await createEpic(epic);
      const stories = await getStoriesForEpic(epic);

      for (const story of stories) {
        await createStory({ ...story, epicKey });
      }
    }
  }
}
```

## Monitoring & Metrics

### Key Metrics to Track

```yaml
Velocity Metrics:
  - Story points completed per sprint
  - Number of stories completed
  - Bugs found vs fixed

Quality Metrics:
  - Defect escape rate
  - Test coverage %
  - Code review turnaround

Process Metrics:
  - Cycle time (In Progress → Done)
  - Lead time (Created → Done)
  - Blocked time per issue

Risk Metrics:
  - High-risk items open
  - Security issues resolved
  - Technical debt ratio
```

## Next Steps

1. **Configure MCP Connection**
   ```bash
   npm install @atlassian/jira-client
   export JIRA_API_TOKEN=your-token
   ```

2. **Validate Configuration**
   - Test API connection
   - Verify project permissions
   - Check custom field IDs

3. **Execute Backlog Creation**
   - Run initialization script
   - Create Phase 0 items
   - Set up first sprint

4. **Team Onboarding**
   - Share Jira project URL
   - Explain workflow states
   - Demo dashboard usage

5. **Start Sprint 0.1**
   - Sprint planning meeting
   - Assign stories to team
   - Begin development

## Conclusion

This Jira MCP configuration provides a complete framework for managing the Clenergize V3 rebuild project. The structure supports our phased approach, risk-first prioritization, and small team dynamics. With automated backlog creation via MCP, we can quickly establish a comprehensive project structure and begin development immediately.