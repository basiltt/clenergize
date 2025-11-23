# Service Specification: Workflow Service

## Service Overview

**Service Name**: Workflow Service
**Port**: 3009
**Purpose**: Orchestrates business processes, manages approval chains, automates workflows, and tracks SLA compliance across the ESG platform
**Domain**: Core Platform Infrastructure
**Team Ownership**: Workflow & Orchestration Team
**Phase**: 2 (Months 9-12)
**Story Points**: 40
**Agent**: Workflow Agent

## 1. Functional Requirements

### 1.1 Core Features

#### Workflow Engine (Temporal Integration)
- **Workflow Definition**: Define complex multi-step business processes
  - Declarative workflow syntax (YAML/JSON)
  - Visual workflow builder (drag-and-drop)
  - State machine representation
  - Branching and conditional logic
  - Parallel execution support
  - Loop and retry mechanisms
- **Workflow Execution**: Orchestrate long-running workflows
  - Durable execution (survives service restarts)
  - State persistence and recovery
  - Event-driven progression
  - Human task management
  - Automatic retry with backoff
  - Timeout handling
- **Workflow Versioning**: Manage workflow evolution
  - Version control for workflow definitions
  - Backward compatibility
  - Migration paths for in-flight workflows
  - A/B testing for workflow changes
- **Temporal Activities**: Reusable workflow activities
  - Activity library (approval, notification, data validation)
  - Custom activity creation
  - Activity composition
  - Error handling and compensation

#### Approval Workflow Engine
- **Approval Chain Configuration**: Define multi-level approval hierarchies
  - Sequential approvals (A → B → C)
  - Parallel approvals (A && B && C)
  - Conditional approvals (if condition, then A, else B)
  - Escalation rules (after X days, escalate to Y)
  - Delegation support (approve on behalf of)
  - Voting mechanisms (majority, unanimous, quorum)
- **Approval Request Management**: Create and track approval requests
  - Request creation with context
  - Assignee notification
  - Approval/rejection actions
  - Comment and feedback capture
  - Attachment support
  - Approval history audit trail
- **Escalation Rules**: Automatic escalation for overdue approvals
  - Time-based escalation (SLA breaches)
  - Escalation paths (manager → director → VP)
  - Escalation notifications
  - Auto-approval on timeout (configurable)
  - Escalation analytics
- **Delegation Management**: Temporary approval delegation
  - Delegate approval authority
  - Delegation period (start/end dates)
  - Delegation scope (specific workflows, all workflows)
  - Delegation chain transparency
  - Delegation audit logging

#### Data Collection Workflows
- **Survey Workflows**: Automate survey distribution and collection
  - Survey design and distribution
  - Reminder scheduling
  - Response collection and aggregation
  - Partial response saving
  - Survey completion workflows
- **Form Workflows**: Multi-step form completion processes
  - Progressive disclosure forms
  - Conditional form fields
  - Draft saving and resumption
  - Form validation and submission
  - Review and approval of submissions
- **Data Validation Workflows**: Automated data quality checks
  - Rule-based validation
  - Data completeness checks
  - Cross-field validation
  - External data verification
  - Validation failure workflows

#### Reporting Workflows
- **Scheduled Report Generation**: Automate periodic report creation
  - Cron-based scheduling
  - Report template selection
  - Data aggregation and calculation
  - Report rendering (PDF, Excel, HTML)
  - Report distribution via email/storage
- **Report Distribution Workflows**: Distribute reports to stakeholders
  - Distribution list management
  - Multi-channel delivery (email, portal, API)
  - Delivery confirmation tracking
  - Retry on failure
  - Distribution analytics
- **Report Review & Approval**: Multi-stage report review process
  - Draft review by authors
  - Peer review
  - Management approval
  - Compliance review
  - Publication workflow

#### Business Process Automation
- **Process Templates**: Pre-built workflow templates
  - ESG data collection workflow
  - Materiality assessment workflow
  - Target setting and tracking workflow
  - Incident reporting workflow
  - Audit preparation workflow
  - Disclosure submission workflow
- **Custom Process Builder**: Build organization-specific workflows
  - Visual workflow designer
  - Drag-and-drop activities
  - Conditional logic configuration
  - Integration with services
  - Test and simulation mode
- **Process Monitoring**: Real-time workflow monitoring
  - Active workflow instances
  - Workflow state visualization
  - Bottleneck identification
  - Performance metrics
  - Error tracking and alerts

#### SLA Tracking & Management
- **SLA Definition**: Define service level agreements
  - Response time SLAs (e.g., approve within 3 days)
  - Resolution time SLAs (e.g., complete within 7 days)
  - Availability SLAs (e.g., 99.9% uptime)
  - Custom SLA metrics
- **SLA Monitoring**: Track SLA compliance
  - Real-time SLA status
  - SLA breach detection
  - SLA violation alerts
  - Grace period handling
  - SLA reporting and dashboards
- **SLA Escalation**: Automatic escalation on SLA violations
  - Escalation triggers (approaching SLA, SLA breached)
  - Escalation actions (notify, reassign, escalate)
  - Escalation chains
  - SLA waiver requests

#### Reminders & Notifications
- **Reminder Scheduling**: Schedule workflow reminders
  - One-time reminders
  - Recurring reminders
  - Relative reminders (3 days before due date)
  - Escalating reminder frequency
- **Notification Triggers**: Event-driven notifications
  - Workflow started/completed
  - Approval pending
  - Task assigned
  - Deadline approaching
  - SLA breach
  - Workflow failure
- **Multi-Channel Delivery**: Deliver notifications via multiple channels
  - Email notifications
  - In-app notifications
  - SMS alerts (critical workflows)
  - Webhook callbacks
  - Slack/Teams integration

#### Workflow Templates & Builder
- **Template Library**: Pre-configured workflow templates
  - Approval workflows (1-level, 2-level, 3-level)
  - Data collection workflows
  - Reporting workflows
  - Compliance workflows
  - Incident response workflows
- **Visual Workflow Builder**: No-code workflow designer
  - Drag-and-drop interface
  - Activity palette
  - Connection editor
  - Property configurator
  - Validation and testing
- **Template Customization**: Adapt templates to specific needs
  - Modify template steps
  - Add custom activities
  - Configure approvers
  - Set SLAs and reminders
  - Save as new template

### 1.2 API Endpoints

#### Workflow Definition Endpoints
```yaml
POST /v1/workflows/definitions
  Request:
    - name: string (required)
    - description: string
    - version: string (default: "1.0.0")
    - definition: object (required)
        type: string ("sequential" | "parallel" | "state_machine")
        steps: [{
          stepId: string,
          stepName: string,
          activityType: string,
          activityConfig: object,
          nextStep: string | string[] | object (conditional),
          timeout: number (seconds),
          retryPolicy: object
        }]
    - sla: {
        responseTime: number (hours),
        resolutionTime: number (hours)
      }
    - metadata: object
  Response:
    - workflowDefinitionId: string
    - version: string
    - createdAt: timestamp
    - createdBy: string

GET /v1/workflows/definitions
  Query:
    - search: string
    - category: string ("approval" | "data_collection" | "reporting" | "custom")
    - status: string ("draft" | "active" | "deprecated")
    - page: number
    - limit: number
  Response:
    - definitions: WorkflowDefinition[]
    - total: number
    - page: number

GET /v1/workflows/definitions/:definitionId
  Response:
    - definition: WorkflowDefinition
    - activeInstances: number
    - completedInstances: number
    - averageExecutionTime: number (seconds)

PUT /v1/workflows/definitions/:definitionId
  Request:
    - name: string
    - description: string
    - definition: object
    - status: string ("draft" | "active" | "deprecated")
  Response:
    - definition: WorkflowDefinition
    - version: string

DELETE /v1/workflows/definitions/:definitionId
  Response:
    - success: boolean
    - message: string
```

#### Workflow Execution Endpoints
```yaml
POST /v1/workflows/instances
  Request:
    - workflowDefinitionId: string (required)
    - workflowDefinitionVersion: string (default: latest)
    - initiator: string (userId)
    - context: object (workflow input data)
        entityId: string,
        entityType: string,
        metadata: object
    - priority: string ("low" | "normal" | "high" | "critical")
    - dueDate: timestamp (optional)
  Response:
    - workflowInstanceId: string
    - status: string ("running")
    - startedAt: timestamp

GET /v1/workflows/instances
  Query:
    - definitionId: string (optional)
    - status: string ("running" | "paused" | "completed" | "failed" | "cancelled")
    - initiator: string (userId)
    - startDate: timestamp
    - endDate: timestamp
    - page: number
    - limit: number
  Response:
    - instances: WorkflowInstance[]
    - total: number
    - page: number

GET /v1/workflows/instances/:instanceId
  Response:
    - instance: WorkflowInstance
    - currentStep: string
    - completedSteps: string[]
    - pendingTasks: Task[]
    - history: WorkflowEvent[]
    - slaStatus: {
        responseTimeSLA: {target: number, elapsed: number, status: string},
        resolutionTimeSLA: {target: number, elapsed: number, status: string}
      }

PUT /v1/workflows/instances/:instanceId/pause
  Response:
    - instance: WorkflowInstance
    - status: "paused"
    - pausedAt: timestamp

PUT /v1/workflows/instances/:instanceId/resume
  Response:
    - instance: WorkflowInstance
    - status: "running"
    - resumedAt: timestamp

PUT /v1/workflows/instances/:instanceId/cancel
  Request:
    - reason: string
    - cancelledBy: string
  Response:
    - instance: WorkflowInstance
    - status: "cancelled"
    - cancelledAt: timestamp

POST /v1/workflows/instances/:instanceId/complete-task
  Request:
    - taskId: string (required)
    - result: object (task output)
    - completedBy: string
  Response:
    - task: Task
    - workflowInstance: WorkflowInstance
    - nextStep: string
```

#### Approval Workflow Endpoints
```yaml
POST /v1/approvals/chains
  Request:
    - name: string (required)
    - description: string
    - entityType: string (e.g., "materiality_assessment", "esg_report")
    - approvalSteps: [{
        stepId: string,
        stepName: string,
        approverType: string ("user" | "role" | "group"),
        approvers: string[] (userIds, roleIds, groupIds),
        approvalType: string ("any" | "all" | "majority"),
        escalationAfter: number (hours),
        escalateTo: string[] (userIds)
      }]
    - sla: {
        totalApprovalTime: number (hours)
      }
  Response:
    - approvalChainId: string
    - createdAt: timestamp

GET /v1/approvals/chains
  Query:
    - entityType: string
    - status: string ("active" | "inactive")
  Response:
    - chains: ApprovalChain[]

POST /v1/approvals/requests
  Request:
    - approvalChainId: string (required)
    - entityId: string (required)
    - entityType: string (required)
    - requestedBy: string
    - title: string
    - description: string
    - attachments: string[] (URLs)
    - dueDate: timestamp (optional)
  Response:
    - approvalRequestId: string
    - status: "pending_approval"
    - currentStep: number
    - currentApprovers: string[]
    - createdAt: timestamp

GET /v1/approvals/requests
  Query:
    - status: string ("pending" | "approved" | "rejected" | "escalated")
    - assignedTo: string (userId)
    - requestedBy: string (userId)
    - entityType: string
    - startDate: timestamp
    - endDate: timestamp
    - page: number
    - limit: number
  Response:
    - requests: ApprovalRequest[]
    - total: number

GET /v1/approvals/requests/:requestId
  Response:
    - request: ApprovalRequest
    - approvalChain: ApprovalChain
    - currentStep: ApprovalStep
    - approvalHistory: ApprovalAction[]
    - slaStatus: object

POST /v1/approvals/requests/:requestId/approve
  Request:
    - approverId: string (required)
    - comments: string
    - conditions: string (optional)
  Response:
    - request: ApprovalRequest
    - status: string ("pending_approval" | "approved")
    - nextApprovers: string[] (if multi-step)

POST /v1/approvals/requests/:requestId/reject
  Request:
    - approverId: string (required)
    - reason: string (required)
    - suggestions: string
  Response:
    - request: ApprovalRequest
    - status: "rejected"
    - rejectedAt: timestamp

POST /v1/approvals/requests/:requestId/delegate
  Request:
    - delegateFrom: string (userId)
    - delegateTo: string (userId)
    - delegationPeriod: {
        startDate: timestamp,
        endDate: timestamp
      }
    - reason: string
  Response:
    - delegation: Delegation
    - request: ApprovalRequest

POST /v1/approvals/requests/:requestId/escalate
  Request:
    - escalatedBy: string
    - reason: string
    - escalateTo: string[] (userIds)
  Response:
    - request: ApprovalRequest
    - status: "escalated"
    - escalatedTo: string[]
```

#### Data Collection Workflow Endpoints
```yaml
POST /v1/workflows/data-collection
  Request:
    - collectionName: string (required)
    - collectionType: string ("survey" | "form" | "upload")
    - targetAudience: {
        type: string ("users" | "stakeholders" | "external"),
        targets: string[]
      }
    - questions: [{
        questionId: string,
        questionText: string,
        questionType: string,
        required: boolean,
        validationRules: object
      }]
    - schedule: {
        openDate: timestamp,
        closeDate: timestamp,
        reminders: [timestamp]
      }
    - workflow: {
        onSubmission: string (workflowDefinitionId),
        onCompletion: string (workflowDefinitionId)
      }
  Response:
    - collectionId: string
    - collectionUrl: string
    - workflowInstanceId: string

GET /v1/workflows/data-collection/:collectionId/responses
  Query:
    - status: string ("pending" | "submitted" | "reviewed")
    - page: number
    - limit: number
  Response:
    - responses: Response[]
    - completionRate: number
    - total: number

POST /v1/workflows/data-collection/:collectionId/send-reminders
  Request:
    - targetUsers: string[] (optional, default: all pending)
    - message: string
  Response:
    - remindersSent: number
    - workflowInstanceId: string
```

#### Reporting Workflow Endpoints
```yaml
POST /v1/workflows/reporting/schedules
  Request:
    - reportName: string (required)
    - reportType: string (e.g., "carbon_footprint", "materiality", "esg_summary")
    - schedule: string (cron expression)
    - reportConfig: {
        templateId: string,
        dataFilters: object,
        format: string ("pdf" | "excel" | "html")
      }
    - distribution: {
        recipients: string[] (email addresses or userIds),
        deliveryMethod: string ("email" | "portal" | "api"),
        includeAttachment: boolean
      }
    - approvalRequired: boolean
    - approvalChainId: string (if approvalRequired)
  Response:
    - reportScheduleId: string
    - nextExecutionAt: timestamp
    - workflowDefinitionId: string

GET /v1/workflows/reporting/schedules
  Query:
    - status: string ("active" | "paused" | "failed")
    - reportType: string
  Response:
    - schedules: ReportSchedule[]

GET /v1/workflows/reporting/executions
  Query:
    - scheduleId: string
    - status: string ("pending" | "generating" | "completed" | "failed")
    - startDate: timestamp
    - endDate: timestamp
  Response:
    - executions: ReportExecution[]
    - total: number

PUT /v1/workflows/reporting/schedules/:scheduleId/pause
  Response:
    - schedule: ReportSchedule
    - status: "paused"

PUT /v1/workflows/reporting/schedules/:scheduleId/resume
  Response:
    - schedule: ReportSchedule
    - status: "active"
    - nextExecutionAt: timestamp
```

#### SLA Tracking Endpoints
```yaml
POST /v1/workflows/slas
  Request:
    - slaName: string (required)
    - entityType: string (e.g., "approval_request", "workflow_instance")
    - metrics: [{
        metricName: string ("response_time" | "resolution_time"),
        target: number (hours),
        thresholdWarning: number (percentage, e.g., 80),
        thresholdCritical: number (percentage, e.g., 100)
      }]
    - escalationRules: [{
        condition: string ("warning" | "critical"),
        action: string ("notify" | "escalate"),
        recipients: string[]
      }]
  Response:
    - slaId: string
    - createdAt: timestamp

GET /v1/workflows/slas/:slaId/compliance
  Query:
    - period: string ("day" | "week" | "month" | "quarter")
    - startDate: timestamp
    - endDate: timestamp
  Response:
    - compliance: {
        totalEntities: number,
        metricsCompliance: [{
          metricName: string,
          target: number,
          achieved: number,
          complianceRate: number,
          violations: number
        }],
        overallCompliance: number
      }

GET /v1/workflows/slas/violations
  Query:
    - slaId: string
    - severity: string ("warning" | "critical")
    - status: string ("open" | "acknowledged" | "resolved")
    - startDate: timestamp
    - endDate: timestamp
  Response:
    - violations: SLAViolation[]
    - total: number

PUT /v1/workflows/slas/violations/:violationId/acknowledge
  Request:
    - acknowledgedBy: string
    - comments: string
  Response:
    - violation: SLAViolation
    - status: "acknowledged"
```

#### Notification & Reminder Endpoints
```yaml
POST /v1/workflows/reminders
  Request:
    - entityId: string (required)
    - entityType: string (required)
    - reminderType: string ("one_time" | "recurring")
    - schedule: {
        reminderDate: timestamp (for one_time),
        cronExpression: string (for recurring)
      }
    - recipients: string[] (userIds or email addresses)
    - message: {
        subject: string,
        body: string,
        actionUrl: string (optional)
      }
    - channels: string[] (["email", "in_app", "sms"])
  Response:
    - reminderId: string
    - nextReminderAt: timestamp

GET /v1/workflows/reminders
  Query:
    - entityId: string
    - status: string ("active" | "paused" | "completed")
  Response:
    - reminders: Reminder[]

DELETE /v1/workflows/reminders/:reminderId
  Response:
    - success: boolean
```

#### Workflow Analytics Endpoints
```yaml
GET /v1/workflows/analytics/performance
  Query:
    - definitionId: string (optional)
    - startDate: timestamp
    - endDate: timestamp
  Response:
    - analytics: {
        totalInstances: number,
        completedInstances: number,
        failedInstances: number,
        averageExecutionTime: number (seconds),
        medianExecutionTime: number (seconds),
        p95ExecutionTime: number (seconds),
        bottlenecks: [{stepId: string, averageTime: number}],
        failureReasons: [{reason: string, count: number}]
      }

GET /v1/workflows/analytics/sla-dashboard
  Query:
    - period: string ("day" | "week" | "month")
  Response:
    - dashboard: {
        overallCompliance: number,
        slaByType: [{type: string, compliance: number}],
        recentViolations: SLAViolation[],
        trendData: [{date: string, compliance: number}]
      }

GET /v1/workflows/analytics/approval-metrics
  Query:
    - startDate: timestamp
    - endDate: timestamp
  Response:
    - metrics: {
        totalApprovalRequests: number,
        averageApprovalTime: number (hours),
        approvalRate: number (percentage),
        rejectionRate: number (percentage),
        escalationRate: number (percentage),
        approverPerformance: [{
          approverId: string,
          approverName: string,
          totalAssigned: number,
          totalApproved: number,
          averageResponseTime: number
        }]
      }
```

### 1.3 Business Rules

#### Workflow Execution Rules
1. **Durability Guarantee**: All workflows must survive service restarts and failures
2. **Idempotency**: Workflow activities must be idempotent (safe to retry)
3. **At-Least-Once Execution**: Activities may be retried, implement compensation logic
4. **Timeout Enforcement**: All activities must have timeout limits (default: 1 hour)
5. **Retry Policy**: Failed activities retry with exponential backoff (max 5 retries)
6. **State Consistency**: Workflow state transitions are atomic

#### Approval Chain Rules
1. **Sequential Approval**: Next approver notified only after previous approval
2. **Parallel Approval**: All approvers notified simultaneously, all must approve (unless "any" mode)
3. **Majority Voting**: Approval granted if >50% of approvers approve (configurable threshold)
4. **Escalation Timing**: Escalation triggers after SLA breach (e.g., 3 days no response)
5. **Delegation Validation**: Delegate must have appropriate permissions for entity type
6. **Approval Immutability**: Once approved, cannot be reverted (new approval request required)
7. **Rejection Short-Circuit**: Any rejection immediately fails the approval chain

#### SLA Management Rules
1. **SLA Calculation**: Start time = workflow/approval creation, end time = completion
2. **Business Hours**: SLA calculated in business hours (9 AM - 5 PM, Mon-Fri), excludes holidays
3. **SLA Breach Notification**: Immediate notification when SLA breached (100% threshold)
4. **SLA Warning Notification**: Notification at 80% threshold (approaching SLA)
5. **Grace Period**: 10% grace period before escalation (e.g., 3.3 hours for 3-hour SLA)
6. **SLA Waiver**: Authorized users can waive SLA for exceptional circumstances

#### Reminder Rules
1. **Reminder Frequency**: Max 3 reminders per entity to avoid spam
2. **Escalating Frequency**: Reminder frequency increases (Day 1, Day 3, Day 5)
3. **Reminder Suppression**: No reminders after entity completion or cancellation
4. **Multi-Channel Delivery**: Critical reminders sent via email + in-app, non-critical via in-app only
5. **Opt-Out Respect**: Respect user notification preferences

### 1.4 Error Handling

```yaml
Error Responses:
  400 Bad Request:
    - INVALID_WORKFLOW_DEFINITION
    - INVALID_CRON_EXPRESSION
    - MISSING_APPROVERS
    - INVALID_SLA_CONFIGURATION
    - CIRCULAR_WORKFLOW_DEPENDENCY

  401 Unauthorized:
    - INVALID_AUTHENTICATION_TOKEN
    - SESSION_EXPIRED

  403 Forbidden:
    - INSUFFICIENT_PERMISSIONS
    - NOT_ASSIGNED_APPROVER
    - WORKFLOW_LOCKED
    - DELEGATION_NOT_ALLOWED

  404 Not Found:
    - WORKFLOW_DEFINITION_NOT_FOUND
    - WORKFLOW_INSTANCE_NOT_FOUND
    - APPROVAL_REQUEST_NOT_FOUND
    - TASK_NOT_FOUND

  409 Conflict:
    - WORKFLOW_ALREADY_RUNNING
    - APPROVAL_ALREADY_PROCESSED
    - SLA_ALREADY_EXISTS
    - DUPLICATE_REMINDER

  422 Unprocessable Entity:
    - WORKFLOW_VALIDATION_FAILED
    - INVALID_APPROVAL_CHAIN
    - SLA_TARGET_TOO_LOW
    - MISSING_REQUIRED_CONTEXT

  500 Internal Server Error:
    - TEMPORAL_CONNECTION_FAILED
    - WORKFLOW_EXECUTION_FAILED
    - NOTIFICATION_SEND_FAILED
    - DATABASE_ERROR

  503 Service Unavailable:
    - TEMPORAL_UNAVAILABLE
    - DATABASE_UNAVAILABLE
```

## 2. Data Model

### 2.1 MongoDB Collections

#### workflow_definitions Collection
```javascript
{
  _id: ObjectId,
  workflowDefinitionId: String (UUID, unique, indexed),
  name: String,
  description: String,
  version: String, // Semantic versioning (e.g., "1.2.0")

  category: String, // "approval" | "data_collection" | "reporting" | "custom"

  definition: {
    type: String, // "sequential" | "parallel" | "state_machine"

    steps: [{
      stepId: String,
      stepName: String,
      activityType: String, // "approval" | "notification" | "data_collection" | "calculation" | "human_task"
      activityConfig: {
        activityName: String,
        parameters: Object,
        inputMapping: Object,
        outputMapping: Object
      },
      nextStep: Mixed, // String (single next) | String[] (parallel) | Object (conditional routing)
      timeout: Number (seconds, default: 3600),
      retryPolicy: {
        maxAttempts: Number (default: 5),
        backoffCoefficient: Number (default: 2),
        initialInterval: Number (seconds, default: 1),
        maxInterval: Number (seconds, default: 100)
      },
      compensation: String // Compensation activity for rollback
    }],

    errorHandling: {
      onFailure: String, // "fail" | "compensate" | "retry" | "ignore"
      compensationWorkflow: String (workflowDefinitionId)
    }
  },

  sla: {
    responseTime: Number (hours),
    resolutionTime: Number (hours),
    businessHoursOnly: Boolean (default: true)
  },

  permissions: {
    initiators: [String], // RoleIds or UserIds who can start this workflow
    viewers: [String] // Who can view workflow instances
  },

  status: String, // "draft" | "active" | "deprecated"

  statistics: {
    totalInstances: Number,
    completedInstances: Number,
    failedInstances: Number,
    averageExecutionTime: Number (seconds),
    lastExecutedAt: Date
  },

  temporalConfig: {
    taskQueue: String, // Temporal task queue name
    workflowType: String, // Temporal workflow type
    executionTimeout: Number (seconds)
  },

  metadata: {
    createdAt: Date (indexed),
    createdBy: ObjectId,
    updatedAt: Date,
    updatedBy: ObjectId,
    tags: [String],
    isTemplate: Boolean,
    templateCategory: String
  }
}

// Indexes
- workflowDefinitionId: unique
- name: 1
- category: 1
- status: 1
- metadata.createdAt: -1
```

#### workflow_instances Collection
```javascript
{
  _id: ObjectId,
  workflowInstanceId: String (UUID, unique, indexed),
  workflowDefinitionId: String (indexed),
  workflowDefinitionVersion: String,

  temporalWorkflowId: String (unique, indexed), // Temporal workflow execution ID
  temporalRunId: String, // Temporal run ID

  status: String, // "running" | "paused" | "completed" | "failed" | "cancelled" | "timed_out"

  context: {
    entityId: String,
    entityType: String,
    initiator: ObjectId,
    priority: String, // "low" | "normal" | "high" | "critical"
    dueDate: Date,
    metadata: Object // Workflow-specific context data
  },

  execution: {
    startedAt: Date (indexed),
    completedAt: Date,
    currentStep: String (stepId),
    completedSteps: [String],
    failedSteps: [String],
    totalSteps: Number,
    progress: Number (percentage)
  },

  sla: {
    responseTimeSLA: {
      target: Number (hours),
      startedAt: Date,
      elapsed: Number (hours),
      status: String // "on_track" | "warning" | "breached"
    },
    resolutionTimeSLA: {
      target: Number (hours),
      startedAt: Date,
      elapsed: Number (hours),
      status: String
    }
  },

  tasks: [{
    taskId: String (UUID),
    taskName: String,
    assignedTo: [String], // UserIds
    status: String, // "pending" | "in_progress" | "completed" | "failed"
    dueDate: Date,
    completedBy: String (userId),
    completedAt: Date,
    result: Object
  }],

  errorInfo: {
    errorType: String,
    errorMessage: String,
    errorStack: String,
    failedStep: String,
    failedAt: Date,
    retryAttempts: Number
  },

  metadata: {
    createdAt: Date,
    updatedAt: Date,
    correlationId: String,
    causationId: String
  }
}

// Indexes
- workflowInstanceId: unique
- temporalWorkflowId: unique
- workflowDefinitionId: 1
- status: 1
- context.entityId + context.entityType: 1
- context.initiator: 1
- execution.startedAt: -1
- sla.resolutionTimeSLA.status: 1
```

#### approval_chains Collection
```javascript
{
  _id: ObjectId,
  approvalChainId: String (UUID, unique, indexed),
  name: String,
  description: String,
  entityType: String (indexed), // e.g., "materiality_assessment", "esg_report"

  approvalSteps: [{
    stepId: String,
    stepName: String,
    stepOrder: Number,

    approverType: String, // "user" | "role" | "group" | "dynamic"
    approvers: [String], // UserIds, RoleIds, or GroupIds

    approvalType: String, // "any" (at least one) | "all" (unanimous) | "majority" (>50%)
    minimumApprovals: Number (for majority),

    escalationRules: {
      escalateAfter: Number (hours),
      escalateTo: [String], // UserIds or RoleIds
      escalationType: String // "parallel" | "sequential"
    },

    allowDelegation: Boolean (default: true),
    requireComments: Boolean (default: false)
  }],

  sla: {
    totalApprovalTime: Number (hours),
    perStepTime: Number (hours)
  },

  status: String, // "active" | "inactive"

  statistics: {
    totalRequests: Number,
    approvedRequests: Number,
    rejectedRequests: Number,
    averageApprovalTime: Number (hours)
  },

  metadata: {
    createdAt: Date,
    createdBy: ObjectId,
    updatedAt: Date,
    updatedBy: ObjectId
  }
}

// Indexes
- approvalChainId: unique
- entityType: 1
- status: 1
```

#### approval_requests Collection
```javascript
{
  _id: ObjectId,
  approvalRequestId: String (UUID, unique, indexed),
  approvalChainId: String (indexed),

  entity: {
    entityId: String (indexed),
    entityType: String,
    entityData: Object // Snapshot of entity for approval
  },

  requestedBy: ObjectId (indexed),
  title: String,
  description: String,
  attachments: [String], // URLs to supporting documents

  status: String, // "pending" | "approved" | "rejected" | "escalated" | "cancelled"

  currentStep: {
    stepId: String,
    stepOrder: Number,
    assignedTo: [String], // Current approvers
    startedAt: Date,
    slaDeadline: Date
  },

  approvalHistory: [{
    stepId: String,
    stepName: String,
    approverId: String,
    action: String, // "approved" | "rejected" | "delegated" | "escalated"
    comments: String,
    conditions: String, // Conditional approval notes
    timestamp: Date,
    ipAddress: String,
    userAgent: String
  }],

  escalations: [{
    escalatedAt: Date,
    escalatedFrom: String (userId),
    escalatedTo: [String],
    reason: String,
    autoEscalation: Boolean
  }],

  delegations: [{
    delegatedAt: Date,
    delegatedFrom: String (userId),
    delegatedTo: String (userId),
    delegationPeriod: {
      startDate: Date,
      endDate: Date
    },
    reason: String,
    status: String // "active" | "expired" | "revoked"
  }],

  sla: {
    target: Number (hours),
    startedAt: Date,
    deadline: Date,
    elapsed: Number (hours),
    status: String, // "on_track" | "warning" | "breached"
    breachedAt: Date
  },

  dueDate: Date,

  workflowInstanceId: String, // Link to workflow if part of larger process

  metadata: {
    createdAt: Date (indexed),
    updatedAt: Date,
    completedAt: Date,
    correlationId: String
  }
}

// Indexes
- approvalRequestId: unique
- approvalChainId: 1
- entity.entityId + entity.entityType: 1
- requestedBy: 1
- status: 1
- currentStep.assignedTo: 1 (multi-key)
- metadata.createdAt: -1
- sla.status: 1
```

#### data_collection_workflows Collection
```javascript
{
  _id: ObjectId,
  collectionId: String (UUID, unique, indexed),
  collectionName: String,
  collectionType: String, // "survey" | "form" | "upload"

  targetAudience: {
    type: String, // "users" | "stakeholders" | "external"
    targets: [String], // UserIds, StakeholderIds, or email addresses
    totalTargets: Number
  },

  questions: [{
    questionId: String (UUID),
    questionText: String,
    questionType: String, // "text" | "number" | "date" | "choice" | "rating" | "file_upload"
    required: Boolean,
    validationRules: {
      minLength: Number,
      maxLength: Number,
      minValue: Number,
      maxValue: Number,
      regex: String,
      allowedFileTypes: [String]
    },
    options: [String], // For choice/rating questions
    order: Number
  }],

  schedule: {
    openDate: Date,
    closeDate: Date,
    reminders: [Date]
  },

  workflow: {
    onSubmission: String (workflowDefinitionId), // Workflow to run on each submission
    onCompletion: String (workflowDefinitionId) // Workflow to run when collection closes
  },

  responses: {
    totalSubmissions: Number,
    completionRate: Number,
    lastSubmissionAt: Date
  },

  status: String, // "draft" | "open" | "closed" | "archived"

  workflowInstanceId: String, // Parent workflow instance

  metadata: {
    createdAt: Date,
    createdBy: ObjectId,
    updatedAt: Date,
    correlationId: String
  }
}

// Indexes
- collectionId: unique
- status: 1
- schedule.closeDate: 1
```

#### report_schedules Collection
```javascript
{
  _id: ObjectId,
  reportScheduleId: String (UUID, unique, indexed),
  reportName: String,
  reportType: String (indexed), // e.g., "carbon_footprint", "materiality"

  schedule: {
    cronExpression: String, // e.g., "0 9 1 * *" (9 AM, 1st of month)
    timezone: String (default: "UTC"),
    nextExecutionAt: Date (indexed)
  },

  reportConfig: {
    templateId: String,
    dataFilters: Object,
    format: String, // "pdf" | "excel" | "html"
    parameters: Object
  },

  distribution: {
    recipients: [String], // Email addresses or UserIds
    deliveryMethod: String, // "email" | "portal" | "api" | "s3"
    includeAttachment: Boolean,
    emailSubject: String,
    emailBody: String
  },

  approvalRequired: Boolean,
  approvalChainId: String,

  status: String, // "active" | "paused" | "failed"

  executionHistory: {
    totalExecutions: Number,
    successfulExecutions: Number,
    failedExecutions: Number,
    lastExecutionAt: Date,
    lastExecutionStatus: String
  },

  workflowDefinitionId: String, // Reporting workflow definition

  metadata: {
    createdAt: Date,
    createdBy: ObjectId,
    updatedAt: Date,
    updatedBy: ObjectId
  }
}

// Indexes
- reportScheduleId: unique
- reportType: 1
- status: 1
- schedule.nextExecutionAt: 1
```

#### slas Collection
```javascript
{
  _id: ObjectId,
  slaId: String (UUID, unique, indexed),
  slaName: String,
  entityType: String (indexed), // "approval_request" | "workflow_instance"

  metrics: [{
    metricName: String, // "response_time" | "resolution_time" | "approval_time"
    target: Number (hours),
    unit: String, // "hours" | "days"
    thresholdWarning: Number (percentage, e.g., 80),
    thresholdCritical: Number (percentage, e.g., 100),
    businessHoursOnly: Boolean
  }],

  escalationRules: [{
    condition: String, // "warning" | "critical"
    action: String, // "notify" | "escalate" | "auto_approve"
    recipients: [String], // UserIds or RoleIds
    escalateAfter: Number (hours)
  }],

  compliance: {
    complianceTarget: Number (percentage, e.g., 95),
    measurementPeriod: String // "day" | "week" | "month" | "quarter"
  },

  status: String, // "active" | "inactive"

  metadata: {
    createdAt: Date,
    createdBy: ObjectId,
    updatedAt: Date,
    updatedBy: ObjectId
  }
}

// Indexes
- slaId: unique
- entityType: 1
- status: 1
```

#### sla_violations Collection
```javascript
{
  _id: ObjectId,
  violationId: String (UUID, unique, indexed),
  slaId: String (indexed),

  entity: {
    entityId: String (indexed),
    entityType: String
  },

  violation: {
    metricName: String,
    target: Number,
    actual: Number,
    exceedance: Number (hours),
    severity: String, // "warning" | "critical"
    detectedAt: Date (indexed)
  },

  response: {
    status: String, // "open" | "acknowledged" | "resolved" | "waived"
    acknowledgedBy: String (userId),
    acknowledgedAt: Date,
    comments: String,
    resolutionNotes: String,
    resolvedAt: Date,
    waiver: {
      waivedBy: String (userId),
      reason: String,
      approvedBy: String (managerId)
    }
  },

  escalation: {
    escalated: Boolean,
    escalatedAt: Date,
    escalatedTo: [String],
    escalationReason: String
  },

  metadata: {
    createdAt: Date,
    correlationId: String
  }
}

// Indexes
- violationId: unique
- slaId: 1
- entity.entityId + entity.entityType: 1
- violation.detectedAt: -1
- violation.severity: 1
- response.status: 1
```

#### reminders Collection
```javascript
{
  _id: ObjectId,
  reminderId: String (UUID, unique, indexed),

  entity: {
    entityId: String (indexed),
    entityType: String
  },

  reminderType: String, // "one_time" | "recurring"

  schedule: {
    reminderDate: Date (for one_time),
    cronExpression: String (for recurring),
    nextReminderAt: Date (indexed),
    lastReminderAt: Date
  },

  recipients: [{
    recipientId: String, // UserId or email
    recipientType: String // "user" | "email"
  }],

  message: {
    subject: String,
    body: String,
    actionUrl: String,
    actionLabel: String
  },

  channels: [String], // ["email", "in_app", "sms"]

  status: String, // "active" | "paused" | "completed" | "failed"

  deliveryHistory: [{
    deliveredAt: Date,
    channel: String,
    status: String, // "sent" | "failed" | "bounced"
    errorMessage: String
  }],

  metadata: {
    createdAt: Date,
    createdBy: ObjectId,
    correlationId: String
  }
}

// Indexes
- reminderId: unique
- entity.entityId + entity.entityType: 1
- schedule.nextReminderAt: 1
- status: 1
```

### 2.2 Redis Data Structures

#### Workflow Instance Cache
```
Key: workflow_instance:{instanceId}
Value: {
  status: string,
  currentStep: string,
  progress: number,
  slaStatus: string,
  lastUpdated: timestamp
}
TTL: 1 hour (refresh on workflow activity)
```

#### Approval Request Queue
```
Key: approval_queue:{userId}
Value: List<{
  approvalRequestId: string,
  title: string,
  priority: string,
  dueDate: timestamp,
  slaDeadline: timestamp
}>
TTL: 24 hours
```

#### SLA Monitoring Cache
```
Key: sla_monitor:{entityType}:{entityId}
Value: {
  slaId: string,
  metrics: [{metricName: string, target: number, elapsed: number, status: string}],
  nextCheckAt: timestamp
}
TTL: 30 minutes
```

#### Reminder Processing Lock
```
Key: reminder_lock:{reminderId}
Value: {
  lockedBy: string (worker ID),
  lockedAt: timestamp
}
TTL: 5 minutes (prevent duplicate reminder sends)
```

### 2.3 Temporal Workflow Definitions

#### Approval Workflow (Temporal)
```typescript
@WorkflowMethod
async function ApprovalWorkflow(input: ApprovalWorkflowInput): Promise<ApprovalResult> {
  const { approvalRequestId, approvalChainId, entityId } = input;

  // Load approval chain
  const approvalChain = await getApprovalChain(approvalChainId);

  for (const step of approvalChain.approvalSteps) {
    // Wait for approvals at this step
    const approvalResult = await waitForApprovals({
      approvalRequestId,
      stepId: step.stepId,
      approvers: step.approvers,
      approvalType: step.approvalType,
      escalateAfter: step.escalationRules.escalateAfter
    });

    if (approvalResult.status === 'rejected') {
      return { status: 'rejected', rejectedBy: approvalResult.rejectedBy };
    }

    if (approvalResult.status === 'escalated') {
      // Handle escalation
      await escalateApproval(approvalRequestId, step.escalationRules.escalateTo);
    }
  }

  return { status: 'approved', approvedAt: Date.now() };
}
```

#### Report Generation Workflow (Temporal)
```typescript
@WorkflowMethod
async function ReportGenerationWorkflow(input: ReportInput): Promise<ReportResult> {
  const { reportScheduleId, reportConfig } = input;

  // Step 1: Collect data
  const data = await collectReportData(reportConfig.dataFilters);

  // Step 2: Validate data
  const validation = await validateReportData(data);
  if (!validation.isValid) {
    throw new Error(`Data validation failed: ${validation.errors}`);
  }

  // Step 3: Generate report
  const report = await generateReport({
    templateId: reportConfig.templateId,
    data,
    format: reportConfig.format
  });

  // Step 4: Approval (if required)
  if (reportScheduleId.approvalRequired) {
    const approval = await waitForReportApproval(report.reportId);
    if (approval.status !== 'approved') {
      return { status: 'rejected', reportId: report.reportId };
    }
  }

  // Step 5: Distribute report
  await distributeReport({
    reportId: report.reportId,
    recipients: reportConfig.distribution.recipients,
    deliveryMethod: reportConfig.distribution.deliveryMethod
  });

  return { status: 'completed', reportId: report.reportId, reportUrl: report.downloadUrl };
}
```

## 3. Non-Functional Requirements

### 3.1 Performance
- **Workflow Instance Creation**: < 500ms
- **Approval Request Creation**: < 300ms
- **Workflow State Update**: < 200ms
- **SLA Calculation**: < 100ms
- **Reminder Delivery**: < 5s (email), < 1s (in-app)
- **Workflow Analytics Query**: < 2s
- **Concurrent Workflow Executions**: 1,000+ active workflows
- **Approval Throughput**: 500 approval actions/second

### 3.2 Scalability
- **Horizontal Scaling**: Stateless service, scale to N instances
- **Temporal Workers**: Auto-scale based on task queue depth
- **Database**: MongoDB replica set with 1 primary, 2 secondaries
- **Cache**: Redis cluster with 3 nodes
- **Workflow Capacity**: 10,000 active workflow instances
- **Approval Capacity**: 50,000 active approval requests
- **SLA Monitoring**: 100,000 entities under SLA tracking

### 3.3 Availability
- **Uptime SLA**: 99.9% (43 min/month downtime)
- **RTO**: 1 hour
- **RPO**: 5 minutes
- **Graceful Degradation**: Cache failures don't block workflow execution
- **Circuit Breakers**: For external service calls (Notification Service)
- **Temporal High Availability**: Multi-node Temporal cluster

### 3.4 Security
- **Encryption at Rest**: AES-256 for approval data
- **Encryption in Transit**: TLS 1.3
- **Approval Immutability**: Approved requests cannot be tampered
- **Audit Trail**: All workflow actions logged
- **Access Control**: RBAC for workflow initiation and viewing
- **IP Whitelisting**: Restrict approval actions from specific IPs (optional)

### 3.5 Compliance
- **SOX Compliance**: Immutable approval audit trail
- **GDPR Compliance**: Data retention policies, right to deletion
- **ISO 27001**: Workflow security controls
- **Audit Readiness**: Complete workflow execution history

## 4. Events

### 4.1 Events Published

#### Workflow Lifecycle Events
```typescript
// platform.workflow.started.v1
{
  eventId: string,
  eventType: "platform.workflow.started.v1",
  timestamp: string (ISO 8601),
  workflowInstanceId: string,
  workflowDefinitionId: string,
  workflowName: string,
  initiator: string,
  entityId: string,
  entityType: string,
  priority: string,
  correlationId: string
}

// platform.workflow.step-completed.v1
{
  eventId: string,
  eventType: "platform.workflow.step-completed.v1",
  timestamp: string,
  workflowInstanceId: string,
  stepId: string,
  stepName: string,
  stepResult: object,
  nextStep: string,
  progress: number,
  correlationId: string
}

// platform.workflow.completed.v1
{
  eventId: string,
  eventType: "platform.workflow.completed.v1",
  timestamp: string,
  workflowInstanceId: string,
  workflowDefinitionId: string,
  status: string,
  executionTime: number (seconds),
  completedBy: string,
  result: object,
  correlationId: string
}

// platform.workflow.failed.v1
{
  eventId: string,
  eventType: "platform.workflow.failed.v1",
  timestamp: string,
  workflowInstanceId: string,
  workflowDefinitionId: string,
  failedStep: string,
  errorType: string,
  errorMessage: string,
  retryAttempts: number,
  correlationId: string
}

// platform.workflow.paused.v1
{
  eventId: string,
  eventType: "platform.workflow.paused.v1",
  timestamp: string,
  workflowInstanceId: string,
  pausedBy: string,
  reason: string,
  correlationId: string
}

// platform.workflow.resumed.v1
{
  eventId: string,
  eventType: "platform.workflow.resumed.v1",
  timestamp: string,
  workflowInstanceId: string,
  resumedBy: string,
  correlationId: string
}
```

#### Approval Events
```typescript
// platform.approval.requested.v1
{
  eventId: string,
  eventType: "platform.approval.requested.v1",
  timestamp: string,
  approvalRequestId: string,
  approvalChainId: string,
  entityId: string,
  entityType: string,
  requestedBy: string,
  currentApprovers: string[],
  dueDate: string,
  slaDeadline: string,
  correlationId: string
}

// platform.approval.granted.v1
{
  eventId: string,
  eventType: "platform.approval.granted.v1",
  timestamp: string,
  approvalRequestId: string,
  stepId: string,
  approverId: string,
  comments: string,
  approvalTime: number (hours),
  remainingSteps: number,
  correlationId: string
}

// platform.approval.rejected.v1
{
  eventId: string,
  eventType: "platform.approval.rejected.v1",
  timestamp: string,
  approvalRequestId: string,
  stepId: string,
  rejectedBy: string,
  reason: string,
  suggestions: string,
  correlationId: string
}

// platform.approval.escalated.v1
{
  eventId: string,
  eventType: "platform.approval.escalated.v1",
  timestamp: string,
  approvalRequestId: string,
  escalatedFrom: string[],
  escalatedTo: string[],
  reason: string,
  autoEscalation: boolean,
  slaBreached: boolean,
  correlationId: string
}

// platform.approval.delegated.v1
{
  eventId: string,
  eventType: "platform.approval.delegated.v1",
  timestamp: string,
  approvalRequestId: string,
  delegatedFrom: string,
  delegatedTo: string,
  delegationPeriod: object,
  reason: string,
  correlationId: string
}
```

#### SLA Events
```typescript
// platform.sla.warning.v1
{
  eventId: string,
  eventType: "platform.sla.warning.v1",
  timestamp: string,
  entityId: string,
  entityType: string,
  slaId: string,
  metricName: string,
  target: number,
  elapsed: number,
  threshold: number,
  escalateAt: string,
  correlationId: string
}

// platform.sla.breached.v1
{
  eventId: string,
  eventType: "platform.sla.breached.v1",
  timestamp: string,
  violationId: string,
  entityId: string,
  entityType: string,
  slaId: string,
  metricName: string,
  target: number,
  actual: number,
  exceedance: number,
  severity: string,
  correlationId: string
}

// platform.sla.violation-resolved.v1
{
  eventId: string,
  eventType: "platform.sla.violation-resolved.v1",
  timestamp: string,
  violationId: string,
  resolvedBy: string,
  resolutionTime: number (hours),
  resolutionNotes: string,
  correlationId: string
}
```

#### Reminder Events
```typescript
// platform.reminder.sent.v1
{
  eventId: string,
  eventType: "platform.reminder.sent.v1",
  timestamp: string,
  reminderId: string,
  entityId: string,
  entityType: string,
  recipients: string[],
  channel: string,
  correlationId: string
}

// platform.reminder.failed.v1
{
  eventId: string,
  eventType: "platform.reminder.failed.v1",
  timestamp: string,
  reminderId: string,
  channel: string,
  errorMessage: string,
  correlationId: string
}
```

### 4.2 Events Consumed

```typescript
// identity.user.deactivated.v1
// Trigger: Cancel all approval requests assigned to deactivated user

// organization.entity.created.v1
// Trigger: Start default data collection workflows for new entities

// materiality.assessment.published.v1
// Trigger: Start reporting approval workflow

// strategic.target.set.v1
// Trigger: Start target tracking workflow

// environmental.carbon.emission-calculated.v1
// Trigger: Check if all emissions calculated, start report generation workflow

// governance.risk.identified.v1
// Trigger: Start risk mitigation approval workflow

// social.safety.incident-reported.v1
// Trigger: Start incident investigation workflow

// reporting.report.generated.v1
// Trigger: Start report approval workflow

// platform.audit.data-modified.v1
// Trigger: Log workflow-related audit events
```

## 5. Service Dependencies

### 5.1 Upstream Dependencies (Services We Call)

#### Identity Service (3001)
- **Purpose**: User authentication, role resolution
- **Endpoints Used**:
  - `GET /v1/users/:userId` - Get user details for approvers
  - `GET /v1/roles/:roleId/users` - Get users in role for dynamic approval assignment
  - `GET /v1/users/:userId/manager` - Get manager for escalation
- **Circuit Breaker**: Yes (30s timeout)
- **Fallback**: Use cached user data

#### Organization Service (3002)
- **Purpose**: Organization hierarchy for approval routing
- **Endpoints Used**:
  - `GET /v1/organizations/:orgId/hierarchy` - Get org hierarchy for escalation paths
  - `GET /v1/users/:userId/reporting-chain` - Get reporting chain for approvals
- **Circuit Breaker**: Yes (30s timeout)
- **Fallback**: Use default escalation path

#### Notification Service (3008)
- **Purpose**: Send workflow notifications and reminders
- **Endpoints Used**:
  - `POST /v1/notifications/email` - Send email notifications
  - `POST /v1/notifications/in-app` - Send in-app notifications
  - `POST /v1/notifications/sms` - Send SMS alerts (critical workflows)
- **Circuit Breaker**: Yes (30s timeout)
- **Fallback**: Queue notifications for retry

#### Reporting Service (3006)
- **Purpose**: Generate reports via reporting workflows
- **Endpoints Used**:
  - `POST /v1/reports/generate` - Trigger report generation
  - `GET /v1/reports/:reportId` - Get generated report
- **Circuit Breaker**: Yes (120s timeout)
- **Fallback**: Retry report generation

#### Materiality Service (3041)
- **Purpose**: Trigger materiality workflows
- **Endpoints Used**:
  - `GET /v1/materiality/assessments/:assessmentId` - Get assessment data for approval
- **Circuit Breaker**: Yes (30s timeout)
- **Fallback**: None (workflow fails if cannot access data)

### 5.2 Downstream Consumers (Services That Call Us)

#### All Services
- **Consumes**: Workflow orchestration for multi-step processes
- **Events Subscribed**: None (services call Workflow Service APIs directly)

#### Reporting Service (3006)
- **Consumes**: Report generation and approval workflows
- **Endpoints Called**: `POST /v1/workflows/instances` (start report workflow)

#### Materiality Service (3041)
- **Consumes**: Stakeholder engagement workflows
- **Endpoints Called**: `POST /v1/workflows/data-collection` (surveys, interviews)

#### Strategy Service (3042)
- **Consumes**: Target approval workflows
- **Endpoints Called**: `POST /v1/approvals/requests` (target approval)

### 5.3 External Integrations

#### Temporal (Workflow Engine)
- **Purpose**: Durable workflow execution
- **API**: Temporal gRPC API
- **Configuration**:
  - Temporal Server: localhost:7233 (local), temporal-frontend.temporal.svc.cluster.local:7233 (K8s)
  - Namespace: clenergize-workflows
  - Task Queue: esg-workflows
- **High Availability**: Multi-node Temporal cluster
- **Persistence**: PostgreSQL (Temporal state store)

#### Email Service (SendGrid/SES)
- **Purpose**: Email delivery for reminders/notifications
- **API**: Via Notification Service (3008)
- **Fallback**: Internal SMTP server

#### Slack/Teams Integration (Optional)
- **Purpose**: Approval notifications in collaboration tools
- **API**: Webhook-based
- **Fallback**: Email notifications

## 6. Implementation Phases

### 6.1 MVP (Phase 2.1 - Month 9)
**Story Points**: 13 (CLNZ-501, CLNZ-502)

**Features**:
- ✅ Temporal workflow engine setup
- ✅ Workflow definition CRUD APIs
- ✅ Workflow instance management
- ✅ Basic approval workflow (1-level, 2-level)
- ✅ Approval request APIs
- ✅ Approval/rejection actions
- ✅ Approval chain configuration
- ✅ Email notifications for approvals
- ✅ MongoDB collections and indexes
- ✅ Temporal activities (approval, notification)

**Deliverables**:
- Workflow engine integration
- Approval workflow APIs
- Workflow execution monitoring
- Basic frontend for approvals

### 6.2 Phase 2 Enhancements (Phase 2.2 - Month 10)
**Story Points**: 16 (CLNZ-503, CLNZ-504)

**Features**:
- ✅ Data collection workflows (surveys, forms)
- ✅ Reporting workflows (scheduled generation)
- ✅ Escalation rules and delegation
- ✅ SLA tracking and monitoring
- ✅ SLA violation detection
- ✅ Reminders and notifications
- ✅ Workflow templates library
- ✅ Multi-channel notifications (email + in-app)

**Deliverables**:
- Data collection workflow APIs
- Reporting workflow scheduler
- SLA management APIs
- Reminder system
- Workflow template library

### 6.3 Phase 3 Advanced Features (Phase 2.3 - Month 11)
**Story Points**: 8 (CLNZ-505)

**Features**:
- ✅ Visual workflow builder (drag-and-drop)
- ✅ Workflow versioning and migration
- ✅ Workflow analytics and dashboards
- ✅ Advanced SLA compliance reporting
- ✅ Parallel approval workflows
- ✅ Conditional routing and branching
- ✅ Workflow simulation and testing
- ✅ Integration with Slack/Teams

**Deliverables**:
- Visual workflow designer
- Workflow analytics APIs
- SLA compliance dashboards
- Advanced workflow patterns

### 6.4 Future Roadmap (Phase 3+)
**Story Points**: 3

**Features**:
- 🔮 AI-powered workflow optimization (predict bottlenecks)
- 🔮 Auto-escalation based on ML predictions
- 🔮 Workflow recommendation engine
- 🔮 Integration with external workflow tools (Zapier, IFTTT)
- 🔮 Voice-based approvals (Alexa, Google Assistant)
- 🔮 Blockchain-based approval audit trail

## 7. Testing Strategy

### 7.1 Unit Tests (Target: 90% Coverage)

**Core Business Logic**:
- Approval chain resolution (sequential, parallel, conditional)
  - Test approval type logic (any, all, majority)
  - Test escalation rules
  - Test delegation validation
  - Test SLA calculation
- Workflow state transitions
  - Test step progression
  - Test conditional routing
  - Test error handling and retry
  - Test compensation logic
- SLA breach detection
  - Test warning threshold (80%)
  - Test critical threshold (100%)
  - Test business hours calculation
  - Test grace period handling

**Data Validation**:
- Workflow definition validation
  - Test circular dependency detection
  - Test missing activity configuration
  - Test invalid step references
  - Test timeout validation
- Approval chain validation
  - Test approver existence
  - Test escalation path validity
  - Test SLA configuration
- Cron expression validation

### 7.2 Integration Tests (Target: 80% Coverage)

**API Endpoint Tests**:
- Workflow lifecycle (create definition → start instance → complete)
- Approval workflow (request → approve → complete)
- Data collection workflow (create → collect responses → complete)
- Reporting workflow (schedule → generate → distribute)
- SLA monitoring (track → detect breach → escalate)

**Database Integration**:
- MongoDB read/write operations
- Temporal workflow state persistence
- Complex aggregation queries (analytics)
- Transaction handling

**Service Integration**:
- Identity Service: User and role resolution
- Notification Service: Email and in-app notifications
- Reporting Service: Report generation triggers

### 7.3 Contract Tests (Pact)

**Consumer Contracts** (Workflow Service as Consumer):
```typescript
// Contract with Identity Service
describe('Identity Service Contract', () => {
  it('provides user details', async () => {
    await provider.addInteraction({
      state: 'user exists',
      uponReceiving: 'a request for user details',
      withRequest: {
        method: 'GET',
        path: '/v1/users/user-123'
      },
      willRespondWith: {
        status: 200,
        body: {
          userId: 'user-123',
          name: 'John Doe',
          email: 'john@example.com',
          managerId: 'manager-456'
        }
      }
    });
  });
});
```

**Provider Contracts** (Workflow Service as Provider):
```typescript
// Contract for Reporting Service consuming workflow APIs
describe('Workflow Service Contract', () => {
  it('starts workflow instance', async () => {
    await provider.addInteraction({
      state: 'workflow definition exists',
      uponReceiving: 'a request to start workflow',
      withRequest: {
        method: 'POST',
        path: '/v1/workflows/instances',
        headers: { Authorization: 'Bearer token' },
        body: {
          workflowDefinitionId: 'workflow-123',
          context: { entityId: 'report-456' }
        }
      },
      willRespondWith: {
        status: 201,
        body: {
          workflowInstanceId: string,
          status: 'running',
          startedAt: iso8601DateTime
        }
      }
    });
  });
});
```

### 7.4 E2E Test Flows

**Flow 1: Complete Approval Workflow**
1. Create approval chain (2-level sequential)
2. Create approval request
3. Notify first approver
4. First approver approves
5. Notify second approver
6. Second approver approves
7. Workflow completes successfully
8. Verify approval history
9. Verify events published

**Flow 2: Escalation Workflow**
1. Create approval request with SLA
2. Wait for escalation period
3. SLA breached, auto-escalate
4. Notify escalated approvers
5. Escalated approver approves
6. Verify SLA violation recorded
7. Verify escalation events

**Flow 3: Reporting Workflow**
1. Create report schedule (monthly)
2. Trigger scheduled report generation
3. Report generated successfully
4. Start approval workflow (if required)
5. Approve report
6. Distribute report to recipients
7. Verify delivery confirmations
8. Verify report stored in S3

**Flow 4: Data Collection Workflow**
1. Create survey workflow
2. Send survey invitations
3. Collect survey responses
4. Send reminders to non-respondents
5. Close survey after deadline
6. Trigger aggregation workflow
7. Verify completion rate
8. Verify workflow events

### 7.5 Performance Tests

**Load Testing** (Apache JMeter / K6):
- 1,000 concurrent workflow instances executing
- 500 approval actions/second
- 10,000 active approval requests
- 100 scheduled reports executing simultaneously

**Stress Testing**:
- 10,000 workflow instances in 1 hour
- 100,000 SLA entities under monitoring
- Temporal task queue saturation scenarios
- Database connection pool exhaustion

**Temporal Performance**:
- Workflow throughput: 500 workflows/second
- Activity execution latency: < 100ms
- Temporal cluster failure recovery time

### 7.6 Security Tests

**Authentication & Authorization**:
- Unauthenticated workflow initiation (expect 401)
- Insufficient permissions for approval (expect 403)
- JWT token expiration handling
- Approval delegation validation

**Approval Integrity**:
- Verify approval immutability (cannot modify after approval)
- Verify approval audit trail completeness
- Test approval forgery attempts (should fail)
- Test unauthorized delegation (should fail)

**Data Privacy**:
- Verify workflow context encryption at rest
- Verify sensitive data redacted from logs
- Test GDPR data export for user approvals
- Test GDPR data deletion (approval history retained for audit)

## 8. Migration Strategy

### 8.1 Data Migration

**No Legacy Migration** (New Service):
- Workflow Service is a NEW capability for Clenergize V3
- No workflow data migration from V2 required
- Fresh start with Temporal-based workflows

**Initial Data Seeding**:
```yaml
Seed Data:
  - Workflow Templates:
      - 1-Level Approval Workflow
      - 2-Level Approval Workflow
      - 3-Level Approval Workflow
      - Materiality Survey Workflow
      - Monthly Report Generation Workflow
      - Incident Response Workflow
  - Approval Chains:
      - Standard approval chain (manager → director)
      - Financial approval chain (CFO → CEO)
      - Compliance approval chain (compliance officer → legal)
  - SLA Definitions:
      - Approval SLA (3 days response, 7 days resolution)
      - Incident SLA (4 hours response, 24 hours resolution)
      - Report SLA (generate within 2 hours)
```

**Seeding Script** (`npm run seed:workflow`):
```typescript
async function seedWorkflowData() {
  // 1. Load workflow templates
  await loadWorkflowTemplates('./seeds/workflow-templates.json');

  // 2. Create default approval chains
  await createDefaultApprovalChains();

  // 3. Create default SLAs
  await createDefaultSLAs();

  // 4. Configure Temporal task queues
  await configureTemporalQueues();

  console.log('Workflow service seed data loaded successfully');
}
```

### 8.2 Integration with Existing Services

**Materiality Service Integration**:
- After materiality assessment created → start stakeholder survey workflow
- After survey completed → trigger assessment approval workflow
- After assessment published → trigger reporting workflow

**Reporting Service Integration**:
- After report generated → start report approval workflow
- After report approved → start distribution workflow
- Scheduled reports → use report generation workflow

**Strategy Service Integration**:
- After target set → start target approval workflow
- Target approval required → route to appropriate approvers
- Target approved → trigger target tracking workflow

### 8.3 Rollback Procedures

**Service Rollback**:
```bash
# Step 1: Pause all active workflows
kubectl exec -it workflow-service-pod -- npm run pause-all-workflows

# Step 2: Stop new workflow service
kubectl scale deployment workflow-service --replicas=0

# Step 3: Restore previous version
kubectl rollout undo deployment/workflow-service

# Step 4: Resume workflows
kubectl exec -it workflow-service-pod -- npm run resume-all-workflows

# Step 5: Verify health
kubectl rollout status deployment/workflow-service
```

**Temporal Rollback** (Critical - Preserves Workflow State):
```bash
# Temporal workflows are durable and survive service rollbacks
# No special Temporal rollback needed - workflows resume automatically

# Verify Temporal cluster health
tctl cluster health

# Verify workflows resumed
tctl workflow list --namespace clenergize-workflows
```

**Data Rollback** (MongoDB Point-in-Time Recovery):
```bash
# Restore to timestamp before issue
mongorestore --uri="$MONGODB_URI" \
  --oplogReplay \
  --oplogLimit=1234567890:1 \
  --db=clenergize_workflow
```

## 9. Monitoring & Observability

### 9.1 Key Metrics

**Business Metrics**:
```yaml
workflow_instances_total:
  type: counter
  description: Total workflow instances created
  labels: [workflowDefinitionId, status]

approval_requests_total:
  type: counter
  description: Total approval requests created
  labels: [approvalChainId, status]

approval_time_avg:
  type: gauge
  description: Average approval time (hours)
  labels: [approvalChainId, stepId]

sla_compliance_rate:
  type: gauge
  description: SLA compliance rate (percentage)
  labels: [slaId, entityType]

sla_violations_total:
  type: counter
  description: Total SLA violations
  labels: [slaId, severity]
```

**Performance Metrics**:
```yaml
workflow_execution_duration:
  type: histogram
  description: Workflow execution time (seconds)
  labels: [workflowDefinitionId]

approval_action_duration:
  type: histogram
  description: Approval action processing time (ms)
  labels: [action]

temporal_activity_execution_duration:
  type: histogram
  description: Temporal activity execution time (ms)
  labels: [activityType]

database_query_duration:
  type: histogram
  description: Database query execution time (ms)
  labels: [collection, operation]
```

**Error Metrics**:
```yaml
workflow_failures_total:
  type: counter
  description: Workflow failures by error type
  labels: [workflowDefinitionId, errorType]

approval_validation_errors:
  type: counter
  description: Approval validation errors
  labels: [errorCode]

notification_send_failures:
  type: counter
  description: Failed notification deliveries
  labels: [channel, reason]

temporal_task_failures:
  type: counter
  description: Temporal task failures
  labels: [taskQueue, errorType]
```

**Temporal Metrics** (from Temporal Metrics API):
```yaml
temporal_workflow_task_queue_depth:
  type: gauge
  description: Depth of Temporal task queue

temporal_workflow_execution_latency:
  type: histogram
  description: Temporal workflow execution latency

temporal_activity_task_failures:
  type: counter
  description: Temporal activity task failures
```

### 9.2 Alerts

**Critical Alerts** (PagerDuty):
```yaml
WorkflowServiceDown:
  condition: up{job="workflow-service"} == 0
  duration: 5m
  severity: critical
  action: Page on-call engineer

HighWorkflowFailureRate:
  condition: rate(workflow_failures_total[5m]) > 0.05
  duration: 10m
  severity: critical
  action: Page on-call engineer

TemporalClusterDown:
  condition: temporal_cluster_health == 0
  duration: 2m
  severity: critical
  action: Page on-call and Temporal admin

SLAComplianceCritical:
  condition: sla_compliance_rate < 0.5
  duration: 1h
  severity: critical
  action: Page on-call and notify ESG team

DatabaseConnectionLoss:
  condition: mongodb_connections_available < 5
  duration: 2m
  severity: critical
  action: Page on-call and DBA
```

**Warning Alerts** (Slack):
```yaml
HighApprovalEscalationRate:
  condition: rate(approval_requests_total{status="escalated"}[1h]) > 0.2
  duration: 1h
  severity: warning
  action: Notify workflow team

SlowApprovalProcessing:
  condition: approval_time_avg > 48
  duration: 1h
  severity: warning
  action: Notify approvers and managers

HighTaskQueueDepth:
  condition: temporal_workflow_task_queue_depth > 1000
  duration: 15m
  severity: warning
  action: Notify performance team, consider scaling Temporal workers

SLAWarningThreshold:
  condition: sla_compliance_rate < 0.8
  duration: 1h
  severity: warning
  action: Notify workflow team lead
```

### 9.3 Dashboards

**Executive Dashboard** (Grafana):
```yaml
Panels:
  - Total Workflows (by status)
  - Total Approval Requests (by status)
  - Average Approval Time (trend)
  - SLA Compliance Rate (overall and by SLA type)
  - Top Workflow Bottlenecks
  - Escalation Rate (trend)
```

**Operations Dashboard** (Grafana):
```yaml
Panels:
  - API Request Rate (req/s)
  - API Latency (p50, p95, p99)
  - Error Rate (by endpoint)
  - Database Query Performance
  - Cache Hit Rate
  - Temporal Task Queue Depth
  - Temporal Worker Utilization
  - Active Workflow Instances
```

**Approval Metrics Dashboard**:
```yaml
Panels:
  - Approval Throughput (approvals/hour)
  - Approval Time Distribution (histogram)
  - Approver Performance (top/bottom performers)
  - Escalation Rate (by approval chain)
  - Delegation Rate
  - Approval vs Rejection Rate
```

**SLA Compliance Dashboard**:
```yaml
Panels:
  - Overall SLA Compliance (gauge)
  - SLA Compliance by Entity Type
  - SLA Violations (recent)
  - SLA Trend (last 30 days)
  - Warning vs Critical Violations
  - Average Resolution Time for Violations
```

**Temporal Dashboard** (Temporal Web UI):
```yaml
Panels:
  - Active Workflows
  - Workflow Execution History
  - Task Queue Backlog
  - Worker Pool Status
  - Failed Workflows
  - Workflow Search
```

### 9.4 SLOs (Service Level Objectives)

```yaml
Availability SLO:
  target: 99.9%
  measurement_window: 30 days
  error_budget: 43 minutes/month

Latency SLO:
  target: 95% of requests < 500ms
  measurement_window: 7 days
  endpoints: [POST /workflows/instances, POST /approvals/requests]

Approval Processing SLO:
  target: 90% of approvals completed within SLA
  measurement_window: 7 days

Workflow Success Rate SLO:
  target: > 99% of workflows complete successfully
  measurement_window: 7 days

Data Durability SLO:
  target: 99.999% (no data loss)
  measurement_window: 365 days
```

## 10. Compliance & Regulatory

### 10.1 SOX Compliance (Sarbanes-Oxley)

**Approval Audit Trail**:
- ✅ Immutable approval history
- ✅ Timestamped approval actions
- ✅ IP address and user agent logging
- ✅ Digital signature support (optional)
- ✅ Change control for workflow definitions
- ✅ Separation of duties (approver ≠ requester)

**Internal Controls**:
- ✅ Approval chain enforcement
- ✅ Delegation tracking and audit
- ✅ Approval reversal prevention
- ✅ Workflow execution audit trail
- ✅ Automated control testing via SLA monitoring

### 10.2 GDPR Compliance (General Data Protection Regulation)

**Data Privacy**:
- ✅ Minimize personal data in workflow context
- ✅ Encrypt workflow data at rest (AES-256)
- ✅ Right to access: Export user's approval history
- ✅ Right to erasure: Anonymize user data (retain audit trail)
- ✅ Data retention policies: Auto-delete completed workflows after 7 years
- ✅ Consent management for external stakeholder workflows

**Data Processing**:
- ✅ Lawful basis: Legitimate interest (business process automation)
- ✅ Data minimization: Collect only necessary workflow context
- ✅ Purpose limitation: Workflow data used only for orchestration

### 10.3 ISO 27001 (Information Security)

**Access Control**:
- ✅ Role-based access control (RBAC) for workflow initiation
- ✅ Multi-factor authentication (MFA) for critical approvals
- ✅ Least privilege principle for approvers
- ✅ Approval delegation authorization checks

**Security Controls**:
- ✅ Encryption in transit (TLS 1.3)
- ✅ Encryption at rest (AES-256)
- ✅ Security event logging
- ✅ Intrusion detection for suspicious approval patterns
- ✅ Regular security audits

### 10.4 Audit Readiness

**Audit Trail**:
- ✅ Complete workflow execution history
- ✅ All approval decisions with rationale
- ✅ Escalation and delegation records
- ✅ SLA compliance reports
- ✅ Workflow definition version history
- ✅ User action correlation (who did what, when)

**Audit Reports**:
- ✅ Approval activity report (by user, by period)
- ✅ Workflow execution report (by definition, by status)
- ✅ SLA compliance report
- ✅ Escalation and delegation report
- ✅ Control effectiveness report

### 10.5 Data Retention Policies

**Retention Periods**:
```yaml
Workflow Instances:
  Completed: 7 years (SOX requirement)
  Failed: 3 years
  Cancelled: 1 year

Approval Requests:
  All: 7 years (audit requirement)

SLA Violations:
  All: 3 years

Reminders:
  Delivered: 90 days
  Failed: 1 year

Workflow Definitions:
  Active: Indefinite
  Deprecated: 5 years after last use
```

**Archival Strategy**:
- Completed workflows older than 1 year → Archive to S3 Glacier
- Approval requests older than 3 years → Archive to S3 Glacier
- Archived data retrievable within 12 hours for audit

## 11. Cost & Resource Estimates

### 11.1 Development Costs

**Team Allocation**:
```yaml
Phase 2.1 (Month 9) - MVP:
  Backend Developer: 1 FTE x 4 weeks = $20,000
  Temporal Engineer: 0.5 FTE x 4 weeks = $12,000
  Frontend Developer: 0.5 FTE x 4 weeks = $10,000
  QA Engineer: 0.5 FTE x 4 weeks = $8,000
  Total: $50,000

Phase 2.2 (Month 10) - Enhancements:
  Backend Developer: 1 FTE x 4 weeks = $20,000
  Frontend Developer: 0.5 FTE x 4 weeks = $10,000
  QA Engineer: 0.5 FTE x 4 weeks = $8,000
  Total: $38,000

Phase 2.3 (Month 11) - Advanced Features:
  Backend Developer: 1 FTE x 4 weeks = $20,000
  Frontend Developer: 0.5 FTE x 4 weeks = $10,000
  UX Designer: 0.25 FTE x 4 weeks = $5,000
  QA Engineer: 0.5 FTE x 4 weeks = $8,000
  Total: $43,000

Grand Total: $131,000
```

### 11.2 Infrastructure Costs (Annual)

**AWS Resources**:
```yaml
Compute (ECS Fargate):
  - Task Definition: 1 vCPU, 2 GB RAM
  - Running Tasks: 3 (HA)
  - Cost: 3 tasks x $0.04 x 730 hrs = $87.60/month

Database (MongoDB Atlas):
  - Tier: M10 (2 GB RAM)
  - Replica Set: 3 nodes
  - Cost: $0.08/hr x 3 x 730 = $175.20/month

Cache (ElastiCache Redis):
  - Node Type: cache.t3.medium
  - Nodes: 3 (cluster)
  - Cost: $0.068/hr x 3 x 730 = $149.04/month

Temporal Cluster (Self-Hosted on ECS):
  - Frontend: 2 tasks x 0.5 vCPU x 2 GB x $0.04 x 730 = $58.40/month
  - History: 2 tasks x 1 vCPU x 4 GB x $0.08 x 730 = $116.80/month
  - Matching: 2 tasks x 0.5 vCPU x 2 GB x $0.04 x 730 = $58.40/month
  - Worker: 4 tasks x 1 vCPU x 4 GB x $0.08 x 730 = $233.60/month
  - Total: $467.20/month

Temporal Database (RDS PostgreSQL):
  - Instance: db.r5.large (2 vCPU, 16 GB RAM)
  - Cost: $0.24/hr x 730 = $175.20/month

Storage (S3):
  - Workflow Archives: 500 GB
  - Cost: 500 GB x $0.023 = $11.50/month

Data Transfer:
  - Outbound: 200 GB/month
  - Cost: 200 GB x $0.09 = $18/month

EventBridge:
  - Custom Events: 2M/month
  - Cost: 2M x $1.00/million = $2.00/month

Total Monthly: $1,086.14
Total Annual: $13,033.68
```

### 11.3 Third-Party Costs

**Optional Integrations**:
```yaml
Temporal Cloud (Alternative to Self-Hosted):
  - Pricing: $0.00025 per action
  - Estimated Actions: 10M/month
  - Cost: 10M x $0.00025 = $2,500/month = $30,000/year
  - Note: Self-hosted is more cost-effective for our scale

SendGrid (Email Notifications):
  - Plan: Pro (100,000 emails/month)
  - Cost: $89.95/month = $1,079.40/year

Slack Integration:
  - Free (webhook-based)

Total Third-Party (Self-Hosted Temporal): $1,079.40/year
Total Third-Party (Temporal Cloud): $31,079.40/year
```

**Recommendation**: Use self-hosted Temporal for cost savings (~$28K/year saved).

## 12. Related Documentation

### 12.1 Architecture Documentation
- [ESG Platform Overview](../../ESG_PLATFORM_OVERVIEW.md)
- [Phase 2 Architecture Diagram](../../FUTURE-ROADMAP/Phase2-Strategic-ESG/Phase2_Architecture.md) *(To be created)*
- [Service Dependency Diagram](../../SERVICE_DEPENDENCY_DIAGRAM.md)
- [Event Schema Registry](../../ESG_EVENT_SCHEMA_REGISTRY.md)

### 12.2 API Documentation
- [API Design Specification](../../API_DESIGN_SPECIFICATION.md) *(To be created)*
- [Workflow Service OpenAPI Spec](./api/workflow-openapi.yaml) *(To be created)*
- [Event Schema Definitions](../../ESG_EVENT_SCHEMA_REGISTRY.md)

### 12.3 Data Models
- [Phase 2 Data Models](../../FUTURE-ROADMAP/Phase2-Strategic-ESG/Phase2_Data_Models.md) *(To be created)*
- [MongoDB Schema Reference](../../DATABASE_SCHEMA_REFERENCE.md) *(To be created)*

### 12.4 Testing Documentation
- [Testing Strategy Guide](../../PHASE5_SDLC_Quality_Strategy.md)
- [Contract Testing with Pact](../../PHASE5_SDLC_Quality_Strategy.md#contract-testing-with-pact)
- [E2E Test Scenarios](./tests/e2e-scenarios.md) *(To be created)*

### 12.5 Temporal Documentation
- [Temporal Architecture Overview](https://docs.temporal.io/docs/concepts/what-is-temporal)
- [Temporal Best Practices](https://docs.temporal.io/docs/best-practices)
- [Temporal Workflow Patterns](https://docs.temporal.io/docs/patterns)
- [Temporal Production Deployment](https://docs.temporal.io/docs/server/production-deployment)

### 12.6 Implementation Guides
- [Workflow Agent Handbook](../../.claude/agents/workflow-agent.md) *(To be created)*
- [Temporal Workflow Development Guide](../../Docs/TEMPORAL_WORKFLOW_GUIDE.md) *(To be created)*
- [Approval Workflow Best Practices](../../Docs/APPROVAL_WORKFLOW_GUIDE.md) *(To be created)*
- [SLA Management Guide](../../Docs/SLA_MANAGEMENT_GUIDE.md) *(To be created)*

### 12.7 JIRA References
- **EPIC-005**: Workflow Engine (40 points)
  - [CLNZ-501](https://yourcompany.atlassian.net/browse/CLNZ-501): Setup Temporal workflow engine (8 pts)
  - [CLNZ-502](https://yourcompany.atlassian.net/browse/CLNZ-502): Build approval workflows (13 pts)
  - [CLNZ-503](https://yourcompany.atlassian.net/browse/CLNZ-503): Create data collection workflows (8 pts)
  - [CLNZ-504](https://yourcompany.atlassian.net/browse/CLNZ-504): Implement reporting workflows (8 pts)
  - [CLNZ-505](https://yourcompany.atlassian.net/browse/CLNZ-505): Add workflow monitoring (3 pts)

---

**Document Version**: 1.0.0
**Last Updated**: November 20, 2024
**Author**: Workflow Agent
**Reviewers**: Architecture Agent, Master Coordinator
**Status**: Draft - Pending Review
