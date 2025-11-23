# Phase 2: Strategic ESG Services - Detailed Architecture

> **Version**: 1.0.0
> **Last Updated**: November 23, 2025
> **Phase Duration**: 4-6 months (Months 9-14)
> **Status**: 📋 PLANNING
> **Story Points**: 550 points
> **Prerequisites**: Phase 1 complete and production-validated

---

## Executive Summary

Phase 2 expands the Clenergize V3 platform from **carbon footprint management** (2 modules) to **comprehensive ESG platform** (8 modules). This phase adds **strategic ESG capabilities** including materiality assessment, gap analysis, benchmarking, target setting, and multi-framework reporting.

### Phase 2 Objectives

**Business Goals**:
- ✅ Complete all 8 user modules (100% coverage)
- ✅ Enable CSRD compliance (mandatory in EU from 2024)
- ✅ Support multi-framework reporting (GRI, SASB, TCFD, CDP, SDGs)
- ✅ Position platform competitively vs. Workiva, Persefoni, Sphera

**Technical Goals**:
- ✅ Expand from 7 to 15+ microservices
- ✅ Maintain <200ms p95 API response time
- ✅ Support 10,000+ concurrent users
- ✅ 99.99% uptime SLA

### New Services Overview

| Service | Port | Module(s) Served | Story Points | Priority |
|---------|------|------------------|--------------|----------|
| **Workflow Service** | 3009 | Cross-cutting | 40 | HIGH |
| **Integration Service** | 3010 | Cross-cutting | 25 | HIGH |
| **Notification Service** | 3008 | Cross-cutting | 30 | MEDIUM |
| **Materiality Service** | 3041 | Module 7 | 55 | CRITICAL |
| **Strategy Service** | 3042 | Modules 5, 6 | 95 | HIGH |
| **Benchmark Service** | 3043 | Modules 3, 4 | 80 | HIGH |
| **Enhanced Reporting Service** | 3044 | Module 8 | 270 | CRITICAL |
| **Policy Service** | 3037 | Module 5 | 35 | MEDIUM |

**Total**: 8 new services, 630 story points (550 after optimization)

---

## Table of Contents

1. [Target Architecture](#target-architecture)
2. [Core Platform Services](#core-platform-services)
3. [Strategic ESG Services](#strategic-esg-services)
4. [Service Communication Patterns](#service-communication-patterns)
5. [Data Architecture](#data-architecture)
6. [Integration Architecture](#integration-architecture)
7. [Deployment Architecture](#deployment-architecture)
8. [Security Architecture](#security-architecture)
9. [Migration Strategy](#migration-strategy)
10. [Success Metrics](#success-metrics)

---

## Target Architecture

### System Diagram (Phase 2)

```
┌────────────────────────────────────────────────────────────────────────┐
│                          External Systems                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌─────────┐│
│  │AWS Cognito│ │  Brevo   │  │  AWS S3  │  │   MSCI    │  │SBTi API ││
│  │  (Auth)   │ │ (Email)  │  │(Storage) │  │(Benchmark)│  │(Targets)││
│  └──────────┘  └──────────┘  └──────────┘  └───────────┘  └─────────┘│
└────────────────────────────────────────────────────────────────────────┘
                                    │
┌────────────────────────────────────────────────────────────────────────┐
│                       Client Applications                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │
│  │   Web App    │  │  Mobile App  │  │ API Clients  │                │
│  │  (Next.js)   │  │   (Phase 3)  │  │(Third-party) │                │
│  └──────────────┘  └──────────────┘  └──────────────┘                │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                              HTTPS/WSS
                                    │
┌────────────────────────────────────────────────────────────────────────┐
│                       API Gateway Layer                                 │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │           Gateway Service (NestJS) - Port 3000                    │ │
│  │  - Routing to 15 backend services                                │ │
│  │  - JWT verification with correlation ID                          │ │
│  │  - Rate limiting (per user/IP)                                   │ │
│  │  - Request aggregation (GraphQL-style)                           │ │
│  └──────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          │                         │                         │
┌─────────────────────────────────────────────────────────────────────────┐
│                   Core Platform Services (Phase 1)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │  Identity    │  │Organization  │  │  Reference   │                 │
│  │  (3001)      │  │  (3002)      │  │   (3003)     │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │  Activity    │  │ Calculation  │  │  Reporting   │                 │
│  │  (3004)      │  │  (3005)      │  │   (3006)     │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
│                                                                          │
│  ┌──────────────┐                                                       │
│  │    Audit     │                                                       │
│  │   (3007)     │                                                       │
│  └──────────────┘                                                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────────┐
│              New Core Platform Services (Phase 2)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │Notification  │  │  Workflow    │  │ Integration  │                 │
│  │  (3008)      │  │  (3009)      │  │   (3010)     │                 │
│  │- Email/SMS   │  │- Approvals   │  │- ERP/HR APIs │                 │
│  │- In-app      │  │- Automation  │  │- Webhooks    │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────────┐
│              Strategic ESG Services (Phase 2)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │ Materiality  │  │  Strategy    │  │  Benchmark   │                 │
│  │  (3041)      │  │  (3042)      │  │   (3043)     │                 │
│  │- Assessment  │  │- Initiatives │  │- Peer Group  │                 │
│  │- Stakeholder │  │- Targets     │  │- Best Practice│                │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐                                    │
│  │Enhanced      │  │   Policy     │                                    │
│  │ Reporting    │  │   (3037)     │                                    │
│  │  (3044)      │  │- Lifecycle   │                                    │
│  │- Multi-Frame │  │- Compliance  │                                    │
│  └──────────────┘  └──────────────┘                                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────────┐
│                    Event Bus & Infrastructure                            │
│  ┌─────────────────────────────────────────────────────────────┐       │
│  │           AWS EventBridge (Domain Events)                    │       │
│  │  - 200+ event types                                          │       │
│  │  - Schema registry with versioning                           │       │
│  │  - Dead letter queues                                        │       │
│  └─────────────────────────────────────────────────────────────┘       │
│                                                                          │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐  │
│  │MongoDB │ │MongoDB │ │MongoDB │ │MongoDB │ │MongoDB │ │MongoDB │  │
│  │(15 DBs)│ │  ...   │ │  ...   │ │  ...   │ │  ...   │ │  ...   │  │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘  │
│                                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                       │
│  │   Redis    │  │   AWS S3   │  │ AWS SQS    │                       │
│  │  (Cache)   │  │ (Storage)  │  │  (Queue)   │                       │
│  └────────────┘  └────────────┘  └────────────┘                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Core Platform Services

### 1. Notification Service (Port 3008)

#### Overview
**Purpose**: Centralized notification delivery across all channels (email, SMS, in-app, push)
**Priority**: MEDIUM (nice-to-have but improves UX significantly)
**Story Points**: 30

#### Responsibilities
```yaml
Email Notifications:
  - Transactional emails (password reset, verification)
  - Scheduled emails (report distribution, alerts)
  - Template management (Handlebars)
  - Integration with Brevo/SendGrid

SMS Notifications:
  - One-time passwords (OTP)
  - Critical alerts
  - Integration with Twilio/AWS SNS

In-App Notifications:
  - Real-time notifications (WebSocket)
  - Notification center (unread count, read status)
  - Notification preferences per user

Push Notifications (Future):
  - Mobile app notifications
  - Integration with FCM/APNS

Notification Management:
  - Delivery status tracking
  - Retry logic for failed deliveries
  - User preferences (opt-in/opt-out)
  - Notification history
```

#### API Endpoints
```yaml
POST   /api/v1/notifications/send
POST   /api/v1/notifications/bulk
GET    /api/v1/notifications/user/:userId
PUT    /api/v1/notifications/:id/mark-read
GET    /api/v1/notifications/preferences
PUT    /api/v1/notifications/preferences
GET    /api/v1/notifications/templates
POST   /api/v1/notifications/templates
```

#### Events Published
```yaml
- notification.email.sent.v1
- notification.email.failed.v1
- notification.sms.sent.v1
- notification.in-app.created.v1
```

#### Events Consumed
```yaml
- identity.user.created.v1 → Send welcome email
- calculation.emission.calculated.v1 → Send completion notification
- reporting.report.generated.v1 → Send report email
- workflow.approval.required.v1 → Send approval request
- materiality.assessment.completed.v1 → Send results notification
```

#### Technology Stack
```yaml
Framework: NestJS
Email: Brevo SDK (or SendGrid)
SMS: Twilio SDK (or AWS SNS)
Templates: Handlebars
Queue: AWS SQS (for async delivery)
Database: MongoDB (notification history)
Cache: Redis (delivery status)
```

#### Data Model
```typescript
interface Notification {
  id: string;
  userId: string;
  channel: 'email' | 'sms' | 'in-app' | 'push';
  type: string; // 'report_generated', 'approval_required', etc.
  subject?: string;
  body: string;
  templateId?: string;
  templateData?: Record<string, any>;
  status: 'pending' | 'sent' | 'failed' | 'read';
  sentAt?: Date;
  readAt?: Date;
  error?: string;
  metadata: Record<string, any>;
  createdAt: Date;
}
```

---

### 2. Workflow Service (Port 3009)

#### Overview
**Purpose**: Business process automation, approval workflows, scheduled tasks
**Priority**: HIGH (required for enterprise features)
**Story Points**: 40

#### Responsibilities
```yaml
Approval Workflows:
  - Multi-step approval chains
  - Parallel approvals (all must approve)
  - Sequential approvals (hierarchical)
  - Delegation support
  - Escalation rules (SLA-based)
  - Approval history and audit trail

Workflow Types:
  - Report approval (before publishing)
  - Data approval (before calculation)
  - Target approval (board-level)
  - Policy approval (lifecycle management)
  - Initiative approval (budget allocation)

Automation:
  - Scheduled tasks (daily, weekly, monthly)
  - Event-triggered workflows
  - Conditional logic (if-then-else)
  - Data transformations
  - Integration with external systems

Business Process Management:
  - Visual workflow designer (future)
  - Process templates library
  - Process monitoring and analytics
  - SLA tracking
```

#### API Endpoints
```yaml
POST   /api/v1/workflows/definitions
GET    /api/v1/workflows/definitions
POST   /api/v1/workflows/instances
GET    /api/v1/workflows/instances/:id
POST   /api/v1/workflows/instances/:id/approve
POST   /api/v1/workflows/instances/:id/reject
GET    /api/v1/workflows/pending
GET    /api/v1/workflows/history
```

#### Events Published
```yaml
- workflow.approval.required.v1
- workflow.approved.v1
- workflow.rejected.v1
- workflow.escalated.v1
- workflow.completed.v1
```

#### Events Consumed
```yaml
- reporting.report.submitted.v1 → Start approval workflow
- strategy.target.proposed.v1 → Start approval workflow
- policy.draft.created.v1 → Start review workflow
```

#### Technology Stack
```yaml
Framework: NestJS
Workflow Engine: Temporal (or custom state machine)
Scheduler: node-cron (or AWS EventBridge Scheduler)
Database: MongoDB (workflow state)
Cache: Redis (active workflows)
```

#### Data Model
```typescript
interface WorkflowDefinition {
  id: string;
  name: string;
  type: string;
  steps: WorkflowStep[];
  sla?: number; // in hours
  escalationRules?: EscalationRule[];
  createdAt: Date;
}

interface WorkflowInstance {
  id: string;
  definitionId: string;
  entityType: string; // 'report', 'target', 'policy'
  entityId: string;
  currentStep: number;
  status: 'pending' | 'approved' | 'rejected' | 'escalated' | 'completed';
  approvalHistory: ApprovalAction[];
  startedAt: Date;
  completedAt?: Date;
}

interface ApprovalAction {
  userId: string;
  action: 'approve' | 'reject' | 'delegate';
  comment?: string;
  timestamp: Date;
}
```

---

### 3. Integration Service (Port 3010)

#### Overview
**Purpose**: External system integrations, data connectors, webhooks
**Priority**: HIGH (enables ecosystem connectivity)
**Story Points**: 25

#### Responsibilities
```yaml
Pre-built Connectors:
  ERP Systems:
    - SAP S/4HANA (activity data extraction)
    - Oracle EBS (financial data)
    - Microsoft Dynamics (operations data)

  HR Systems:
    - Workday (workforce metrics for social ESG)
    - SuccessFactors (talent data)
    - ADP (payroll and demographics)

  Facilities Management:
    - TRIRIGA (building data)
    - Planon (space utilization)

  IoT Platforms:
    - AWS IoT Core (sensor data)
    - Azure IoT Hub
    - Custom MQTT brokers

Webhook Management:
  - Incoming webhooks (receive data from external systems)
  - Outgoing webhooks (send events to subscribers)
  - Webhook security (HMAC verification)
  - Retry logic and failure handling

API Marketplace:
  - Connector catalog (browse available integrations)
  - Custom connector SDK
  - Connector testing and validation
  - Usage analytics per connector

Data Transformation:
  - Field mapping (source → destination)
  - Data type conversions
  - Business rule application
  - Validation and error handling
```

#### API Endpoints
```yaml
GET    /api/v1/integrations/connectors
POST   /api/v1/integrations/connections
GET    /api/v1/integrations/connections
POST   /api/v1/integrations/sync
POST   /api/v1/webhooks/incoming/:source
POST   /api/v1/webhooks/outgoing
GET    /api/v1/webhooks/subscriptions
```

#### Events Published
```yaml
- integration.sync.started.v1
- integration.sync.completed.v1
- integration.sync.failed.v1
- integration.data.received.v1
```

#### Events Consumed
```yaml
- activity.data.created.v1 → Send to external analytics
- calculation.emission.calculated.v1 → Send to CDP
- reporting.report.generated.v1 → Send to data warehouse
```

#### Technology Stack
```yaml
Framework: NestJS
Connectors: Custom adapters (REST, GraphQL, SOAP, FTP)
Scheduler: node-cron (for polling)
Queue: AWS SQS (for async processing)
Database: MongoDB (connection configs)
```

#### Data Model
```typescript
interface IntegrationConnection {
  id: string;
  connectorType: string; // 'sap', 'workday', 'iot'
  name: string;
  config: Record<string, any>; // connector-specific config
  credentials: {
    encrypted: true;
    secretArn: string; // AWS Secrets Manager ARN
  };
  syncSchedule?: string; // cron expression
  lastSyncAt?: Date;
  status: 'active' | 'paused' | 'error';
  createdAt: Date;
}
```

---

## Strategic ESG Services

### 4. Materiality Service (Port 3041)

#### Overview
**Purpose**: Double materiality assessment, stakeholder engagement, topic prioritization
**Priority**: CRITICAL (required for CSRD compliance)
**Story Points**: 55
**Module Coverage**: Module 7 (Materiality)

#### Responsibilities
```yaml
Materiality Assessment:
  - Double materiality (financial + impact)
  - Financial materiality: Topics affecting company value
  - Impact materiality: Company's impact on society/environment
  - Sector-specific topics (SASB materiality map)
  - Dynamic materiality (evolves over time)
  - ESRS topic mapping (E1-E5, S1-S4, G1)

Stakeholder Engagement:
  - Stakeholder identification and categorization
  - Multi-channel surveys (email, web, mobile)
  - Interview scheduling and transcription
  - Focus group coordination
  - Feedback collection and aggregation
  - Sentiment analysis (NLP on qualitative responses)

Topic Prioritization:
  - Pre-defined topic library (200+ ESG topics)
  - Custom topic creation
  - Stakeholder voting/weighting
  - Impact scoring (severity, scope, irremediability)
  - Likelihood assessment
  - Weighted scoring algorithms
  - Threshold setting (material vs. non-material)

Materiality Matrix:
  - 2D heat map (financial vs. impact)
  - Interactive visualization
  - Topic clustering
  - Historical comparison (year-over-year changes)
  - Export (PDF, Excel, PowerPoint)

Continuous Monitoring:
  - Emerging risk scanning (news, regulations)
  - Stakeholder feedback loops
  - Automatic re-assessment triggers
  - Materiality refresh cycles (annual recommended)
```

#### API Endpoints
```yaml
POST   /api/v1/materiality/assessments
GET    /api/v1/materiality/assessments/:id
GET    /api/v1/materiality/assessments/:id/status
POST   /api/v1/materiality/topics
GET    /api/v1/materiality/topics
PUT    /api/v1/materiality/topics/:id
POST   /api/v1/materiality/stakeholders
GET    /api/v1/materiality/stakeholders
POST   /api/v1/materiality/surveys
GET    /api/v1/materiality/surveys/:id
GET    /api/v1/materiality/surveys/:id/results
GET    /api/v1/materiality/matrix
POST   /api/v1/materiality/matrix/generate
GET    /api/v1/materiality/esrs-mapping
```

#### Events Published
```yaml
- materiality.assessment.created.v1
- materiality.assessment.completed.v1
- materiality.topic.created.v1
- materiality.topic.scored.v1
- materiality.survey.sent.v1
- materiality.survey.completed.v1
- materiality.matrix.generated.v1
```

#### Events Consumed
```yaml
- identity.user.created.v1 → Add as potential stakeholder
- organization.project.created.v1 → Trigger assessment
```

#### Technology Stack
```yaml
Framework: NestJS
NLP: Hugging Face Transformers (sentiment analysis)
Database: MongoDB (assessments, surveys)
Visualization: D3.js data export for frontend
External: News API (emerging risks)
```

#### Data Model
```typescript
interface MaterialityAssessment {
  id: string;
  organizationId: string;
  name: string;
  year: number;
  type: 'double' | 'financial' | 'impact';
  framework: 'ESRS' | 'GRI' | 'SASB' | 'Custom';
  status: 'draft' | 'in-progress' | 'completed';
  stakeholders: StakeholderGroup[];
  topics: MaterialityTopic[];
  matrixThreshold: { financial: number; impact: number };
  completedAt?: Date;
  createdAt: Date;
}

interface MaterialityTopic {
  id: string;
  name: string;
  description: string;
  category: 'E' | 'S' | 'G';
  esrsCode?: string; // e.g., "E1-1"
  financialScore: number; // 0-10
  impactScore: number; // 0-10
  isMaterial: boolean;
  rationale: string;
  stakeholderFeedback: Feedback[];
}

interface StakeholderGroup {
  id: string;
  name: string;
  type: 'internal' | 'external';
  category: string; // 'employees', 'investors', 'customers', 'community'
  surveysSent: number;
  responsesReceived: number;
  weight: number; // influence factor
}
```

#### Integration Points
- **Strategy Service**: Strategy aligned with material topics
- **Reporting Service**: Material topics disclosure (GRI 3, CSRD)
- **Benchmark Service**: Compare materiality with peers
- **All Data Services**: Filter metrics by materiality level

---

### 5. Strategy Service (Port 3042)

#### Overview
**Purpose**: ESG strategy management, initiative tracking, target setting (SBTi)
**Priority**: HIGH
**Story Points**: 95 (45 for strategy + 50 for targets)
**Module Coverage**: Modules 5 (Strategy), 6 (Targets)

#### Responsibilities
```yaml
ESG Strategy:
  - Vision and mission statements
  - Strategic pillars and themes
  - Material topic alignment
  - Stakeholder commitments
  - Board-level ESG oversight tracking

Initiative Management:
  - Project portfolio (reduction projects, programs)
  - Initiative tracking (status, budget, ROI)
  - Resource allocation
  - Timeline and milestone management
  - Cross-functional team collaboration
  - Impact measurement

Roadmap Management:
  - Gantt charts for initiatives
  - Dependency mapping
  - Critical path analysis
  - Scenario planning (what-if analysis)
  - Budget and resource forecasting

Target Setting (SBTi):
  - Science-based target validation (1.5°C alignment)
  - Scope 1+2 target calculator
  - Scope 3 target calculator
  - Near-term targets (5-10 years)
  - Long-term targets (net-zero by 2050)
  - SBTi criteria validation

Target Types:
  - Absolute reduction targets (total tCO2e)
  - Intensity targets (tCO2e per revenue/employee)
  - Renewable energy targets (RE100)
  - Water reduction targets
  - Waste diversion targets
  - Social targets (DEI, safety, training)

Target Cascade:
  - Corporate-level targets
  - Business unit allocation
  - Facility-level targets
  - Department targets
  - Individual KPIs (incentive compensation)

KPI Management:
  - 100+ pre-built ESG KPIs
  - Custom KPI builder
  - Formula management
  - Benchmark comparison
  - Historical trend analysis

Progress Tracking:
  - Real-time progress calculation
  - Milestone tracking
  - Alerts for off-track targets
  - Forecast to target (predictive analytics)
  - Corrective action recommendations

SDG Alignment:
  - Map targets to UN Sustainable Development Goals
  - SDG contribution calculation
  - SDG impact reporting
```

#### API Endpoints
```yaml
# Strategy
POST   /api/v1/strategies
GET    /api/v1/strategies/:id
PUT    /api/v1/strategies/:id
POST   /api/v1/initiatives
GET    /api/v1/initiatives
PUT    /api/v1/initiatives/:id
GET    /api/v1/roadmaps

# Targets
POST   /api/v1/targets
GET    /api/v1/targets
PUT    /api/v1/targets/:id
GET    /api/v1/targets/:id/progress
POST   /api/v1/targets/validate-sbti
POST   /api/v1/targets/cascade
GET    /api/v1/targets/forecast

# KPIs
GET    /api/v1/kpis
POST   /api/v1/kpis/custom
GET    /api/v1/kpis/:id/calculate

# SDGs
GET    /api/v1/sdgs
GET    /api/v1/sdgs/alignment
POST   /api/v1/sdgs/map-target
```

#### Events Published
```yaml
- strategy.initiative.created.v1
- strategy.initiative.updated.v1
- strategy.milestone.completed.v1
- strategy.target.created.v1
- strategy.target.updated.v1
- strategy.target.achieved.v1
- strategy.target.at-risk.v1
- strategy.kpi.calculated.v1
```

#### Events Consumed
```yaml
- calculation.emission.calculated.v1 → Update target progress
- materiality.assessment.completed.v1 → Align strategy with material topics
- benchmark.peer-comparison.completed.v1 → Inform target setting
```

#### Technology Stack
```yaml
Framework: NestJS
Target Validation: SBTi API (external)
Forecasting: TensorFlow.js (predictive models)
Database: MongoDB (strategies, targets, KPIs)
Cache: Redis (progress calculations)
```

#### Data Model
```typescript
interface ESGStrategy {
  id: string;
  organizationId: string;
  name: string;
  vision: string;
  mission: string;
  pillars: StrategyPillar[];
  materialTopics: string[]; // references to Materiality Service
  initiatives: string[]; // initiative IDs
  approvedBy?: string; // board approval
  approvedAt?: Date;
  createdAt: Date;
}

interface Initiative {
  id: string;
  strategyId: string;
  name: string;
  description: string;
  type: 'reduction' | 'efficiency' | 'innovation' | 'policy';
  category: 'E' | 'S' | 'G';
  owner: string; // user ID
  team: string[]; // user IDs
  budget: number;
  spent: number;
  status: 'planned' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled';
  startDate: Date;
  endDate: Date;
  milestones: Milestone[];
  impact: {
    metric: string;
    baseline: number;
    target: number;
    actual?: number;
  };
  roi?: number;
}

interface Target {
  id: string;
  name: string;
  type: 'absolute' | 'intensity';
  metric: string; // 'tCO2e', 'MWh', 'gallons', etc.
  baselineYear: number;
  baselineValue: number;
  targetYear: number;
  targetValue: number;
  reductionPercentage: number;
  scope: string[]; // ['Scope 1', 'Scope 2', 'Scope 3']
  isSBTi: boolean;
  sbtiValidation?: {
    validated: boolean;
    alignmentLevel: '1.5C' | '2C' | 'well-below-2C';
    validatedAt: Date;
  };
  cascade: TargetCascade[];
  progress: {
    current: number;
    percentage: number;
    onTrack: boolean;
    forecast: number;
  };
  sdgs: string[]; // SDG codes
}
```

#### Integration Points
- **Calculation Service**: Actual emissions for target progress
- **Materiality Service**: Strategy aligned with material topics
- **Benchmark Service**: Inform target setting with peer data
- **Reporting Service**: Strategy and target disclosures
- **External**: SBTi API for target validation

---

### 6. Benchmark Service (Port 3043)

#### Overview
**Purpose**: Peer benchmarking, gap analysis, best practice library
**Priority**: HIGH
**Story Points**: 80
**Module Coverage**: Modules 3 (Gap Analysis), 4 (Benchmarking)

#### Responsibilities
```yaml
Peer Selection:
  - Industry-based peer groups (NAICS/SIC)
  - Custom peer selection (manual)
  - Company size matching (revenue, employees)
  - Geographic matching (region/country)
  - Automatic peer discovery

Performance Comparison:
  - Emissions intensity benchmarking
  - Scope-level comparisons
  - Category-level deep dives
  - Year-over-year trend comparisons
  - Quartile analysis (top 25%, median, bottom 25%)
  - Percentile ranking

Best Practice Library:
  - Industry-specific case studies (500+ examples)
  - Reduction initiative database
  - Technology and solution catalog
  - ROI and payback calculations
  - Implementation guides
  - Vendor recommendations

Competitive Intelligence:
  - Public disclosure tracking (CDP, sustainability reports)
  - Target commitments (SBTi, net-zero pledges)
  - Certification tracking (B Corp, ISO, LEED)
  - ESG rating scores (MSCI, Sustainalytics, CDP)
  - News and announcement monitoring

Gap Analysis:
  - Current state assessment
  - Target state definition (regulatory, best practice)
  - Gap identification (automated)
  - Gap prioritization (impact, effort, urgency)
  - Remediation recommendations
  - Action plan generation
  - Gap tracking (closure progress)

Data Sources:
  - Internal calculation data
  - CDP public responses (10K+ companies)
  - MSCI ESG Ratings API
  - Sustainalytics API
  - Public sustainability reports (web scraping + NLP)
  - Industry association databases
  - News APIs
```

#### API Endpoints
```yaml
# Peer Groups
POST   /api/v1/benchmarks/peer-groups
GET    /api/v1/benchmarks/peer-groups/:id
PUT    /api/v1/benchmarks/peer-groups/:id

# Comparisons
GET    /api/v1/benchmarks/comparisons
GET    /api/v1/benchmarks/rankings
GET    /api/v1/benchmarks/trends

# Best Practices
GET    /api/v1/benchmarks/best-practices
GET    /api/v1/benchmarks/case-studies
GET    /api/v1/benchmarks/technologies

# Competitive Intelligence
GET    /api/v1/benchmarks/ratings
GET    /api/v1/benchmarks/certifications
GET    /api/v1/benchmarks/commitments

# Gap Analysis
POST   /api/v1/gap-analysis/assessments
GET    /api/v1/gap-analysis/assessments/:id
GET    /api/v1/gap-analysis/gaps
PUT    /api/v1/gap-analysis/gaps/:id/status
POST   /api/v1/gap-analysis/action-plans
```

#### Events Published
```yaml
- benchmark.peer-group.created.v1
- benchmark.comparison.completed.v1
- benchmark.rating.updated.v1
- gap-analysis.assessment.completed.v1
- gap-analysis.gap.identified.v1
- gap-analysis.gap.closed.v1
```

#### Events Consumed
```yaml
- calculation.emission.calculated.v1 → Update company performance
- strategy.target.created.v1 → Compare target ambition with peers
```

#### Technology Stack
```yaml
Framework: NestJS
Web Scraping: Puppeteer (for public reports)
NLP: Hugging Face (extract insights from reports)
External APIs:
  - MSCI ESG Ratings API
  - Sustainalytics API
  - CDP Public API
  - News API
Database: MongoDB (benchmarks, gaps)
Cache: Redis (peer comparisons)
```

#### Data Model
```typescript
interface PeerGroup {
  id: string;
  organizationId: string;
  name: string;
  criteria: {
    industry?: string[];
    revenueRange?: { min: number; max: number };
    employeeRange?: { min: number; max: number };
    geography?: string[];
  };
  peers: PeerCompany[];
  createdAt: Date;
}

interface PeerCompany {
  id: string;
  name: string;
  industry: string;
  revenue: number;
  employees: number;
  country: string;
  performance: {
    totalEmissions: number;
    intensityRevenue: number;
    intensityEmployee: number;
    scope1: number;
    scope2: number;
    scope3: number;
  };
  targets?: {
    hasSBTi: boolean;
    netZeroYear?: number;
  };
  ratings?: {
    msci?: string; // 'AAA', 'AA', 'A', etc.
    sustainalytics?: number; // risk score
    cdp?: string; // 'A', 'A-', 'B', etc.
  };
  certifications: string[]; // 'B Corp', 'ISO 14001', etc.
  dataSource: string;
  lastUpdated: Date;
}

interface GapAssessment {
  id: string;
  organizationId: string;
  name: string;
  framework: 'GRI' | 'SASB' | 'TCFD' | 'CSRD' | 'Custom';
  gaps: Gap[];
  status: 'draft' | 'in-progress' | 'completed';
  completedAt?: Date;
  createdAt: Date;
}

interface Gap {
  id: string;
  topic: string;
  category: 'E' | 'S' | 'G';
  requirement: string; // what's required
  currentState: string; // where we are
  targetState: string; // where we need to be
  priority: 'critical' | 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  recommendations: string[];
  status: 'open' | 'in-progress' | 'closed';
  assignedTo?: string;
  dueDate?: Date;
}
```

#### Integration Points
- **Calculation Service**: Company performance data
- **Strategy Service**: Inform target setting
- **Reporting Service**: Benchmark reports
- **Materiality Service**: Compare materiality with peers
- **External APIs**: MSCI, Sustainalytics, CDP, News API

---

### 7. Enhanced Reporting Service (Port 3044)

#### Overview
**Purpose**: Multi-framework ESG reporting (GRI, SASB, TCFD, CSRD, CDP, SDG)
**Priority**: CRITICAL (required for investor-grade reporting)
**Story Points**: 270
**Module Coverage**: Module 8 (Report - enhanced)

#### Responsibilities
```yaml
Multi-Framework Reporting:
  GRI Standards (50 points):
    - GRI 1: Foundation
    - GRI 2: General Disclosures
    - GRI 3: Material Topics
    - GRI 200: Economic (7 topics)
    - GRI 300: Environmental (10 topics)
    - GRI 400: Social (18 topics)
    - Automatic indicator mapping
    - Narrative builder with AI

  SASB Standards (45 points):
    - 77 industry-specific standards
    - Materiality map integration
    - Quantitative metrics tracking
    - Disclosure topics by industry
    - Activity metrics

  TCFD Recommendations (55 points):
    - Governance disclosure
    - Strategy (risks, opportunities, resilience)
    - Risk Management
    - Metrics & Targets
    - Scenario analysis builder (2°C, 4°C)
    - Financial impact quantification

  CSRD/ESRS (60 points):
    - ESRS 1: General Requirements
    - ESRS 2: General Disclosures
    - ESRS E1-E5: Environmental
    - ESRS S1-S4: Social
    - ESRS G1: Governance
    - Double materiality integration
    - 1,000+ data point mapping

  CDP (30 points):
    - CDP Climate (C1-C12)
    - CDP Water (W1-W11)
    - CDP Forests (F1-F17)
    - Automated response generation
    - Score prediction

  SDG Reporting (30 points):
    - 17 SDG goal mapping
    - 169 target alignment
    - Indicator tracking (232 indicators)
    - Impact measurement

Advanced Features:
  - Narrative builder with NLP
  - Evidence management (attach files to claims)
  - Version control and change tracking
  - Collaboration (comments, approvals)
  - Assurance readiness (audit trail, data lineage)
  - Multi-language support (10+ languages)
  - Custom report designer (drag-and-drop)
  - Report scheduling and distribution
  - XBRL tagging (for digital taxonomy)
```

#### API Endpoints
```yaml
# Framework Reports
POST   /api/v1/reports/gri
POST   /api/v1/reports/sasb
POST   /api/v1/reports/tcfd
POST   /api/v1/reports/csrd
POST   /api/v1/reports/cdp
POST   /api/v1/reports/sdg

# Report Management
GET    /api/v1/reports
GET    /api/v1/reports/:id
PUT    /api/v1/reports/:id
POST   /api/v1/reports/:id/publish
GET    /api/v1/reports/:id/coverage
GET    /api/v1/reports/:id/gaps

# Evidence & Assurance
POST   /api/v1/reports/:id/evidence
GET    /api/v1/reports/:id/evidence
GET    /api/v1/reports/:id/assurance-readiness
GET    /api/v1/reports/:id/data-lineage

# Collaboration
POST   /api/v1/reports/:id/comments
GET    /api/v1/reports/:id/comments
POST   /api/v1/reports/:id/submit-approval

# Export
POST   /api/v1/reports/:id/export/pdf
POST   /api/v1/reports/:id/export/xbrl
POST   /api/v1/reports/:id/export/docx
```

#### Events Published
```yaml
- reporting.report.created.v1
- reporting.report.submitted.v1
- reporting.report.approved.v1
- reporting.report.published.v1
- reporting.evidence.attached.v1
- reporting.framework.coverage-updated.v1
```

#### Events Consumed
```yaml
- calculation.emission.calculated.v1 → Update emissions data
- materiality.assessment.completed.v1 → Update material topics
- strategy.target.updated.v1 → Update targets in report
- workflow.approved.v1 → Publish approved report
```

#### Technology Stack
```yaml
Framework: NestJS
NLP: OpenAI GPT-4 (narrative generation)
PDF: Puppeteer (server-side rendering)
XBRL: Custom XBRL library
Templates: React (server-side rendering)
Database: MongoDB (reports, evidence)
Cache: Redis (framework mappings)
External:
  - GRI API (standards)
  - SASB API (standards)
  - TCFD guidance
  - EFRAG ESRS taxonomy
```

#### Data Model
```typescript
interface ESGReport {
  id: string;
  organizationId: string;
  reportingYear: number;
  framework: 'GRI' | 'SASB' | 'TCFD' | 'CSRD' | 'CDP' | 'SDG' | 'Custom';
  status: 'draft' | 'in-review' | 'approved' | 'published';
  materialTopics: string[];
  sections: ReportSection[];
  evidence: Evidence[];
  coverage: {
    required: number;
    completed: number;
    percentage: number;
  };
  assuranceLevel?: 'limited' | 'reasonable';
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface ReportSection {
  id: string;
  framework: string;
  sectionCode: string; // e.g., "GRI-305-1", "ESRS-E1"
  title: string;
  requirementType: 'quantitative' | 'qualitative' | 'narrative';
  status: 'not-started' | 'in-progress' | 'completed' | 'verified';
  data?: {
    value: any;
    unit?: string;
    source: string; // data lineage
    calculationMethod?: string;
  };
  narrative?: string;
  evidence?: string[]; // evidence IDs
  comments: Comment[];
  lastUpdatedBy: string;
  lastUpdatedAt: Date;
}

interface Evidence {
  id: string;
  type: 'document' | 'calculation' | 'policy' | 'audit' | 'external-data';
  title: string;
  description: string;
  fileUrl?: string;
  metadata: Record<string, any>;
  linkedSections: string[]; // section IDs
  uploadedBy: string;
  uploadedAt: Date;
}
```

#### Integration Points
- **All Data Services**: Pull data for comprehensive reporting
- **Materiality Service**: Report on material topics
- **Strategy Service**: Include targets and initiatives
- **Benchmark Service**: Include peer comparisons
- **Calculation Service**: Emissions data
- **Workflow Service**: Approval workflows
- **External**: Framework providers (GRI, SASB, EFRAG)

---

### 8. Policy Service (Port 3037)

#### Overview
**Purpose**: Policy lifecycle management, compliance tracking, distribution
**Priority**: MEDIUM
**Story Points**: 35
**Module Coverage**: Module 5 (Policies)

#### Responsibilities
```yaml
Policy Lifecycle:
  - Policy creation and drafting
  - Review and approval workflows
  - Version control and history
  - Publication and distribution
  - Scheduled review cycles (annual, biennial)
  - Retirement and archival

Policy Types:
  - Environmental policies (energy, waste, water, biodiversity)
  - Social policies (DEI, health & safety, human rights, labor)
  - Governance policies (code of conduct, ethics, anti-corruption)
  - Compliance policies (GDPR, SOC 2, industry-specific)

Policy Distribution:
  - User acknowledgment tracking
  - Training assignment (linked to LMS)
  - Attestation and certification
  - Policy search and discovery
  - Multi-language support
  - Mobile access

Compliance Monitoring:
  - Policy adherence tracking
  - Exception management
  - Audit trail (who read, when)
  - Regulatory change tracking
  - Policy effectiveness measurement
  - Gap analysis (policy vs. actual practice)
```

#### API Endpoints
```yaml
POST   /api/v1/policies
GET    /api/v1/policies
GET    /api/v1/policies/:id
PUT    /api/v1/policies/:id
POST   /api/v1/policies/:id/approve
POST   /api/v1/policies/:id/publish
POST   /api/v1/policies/:id/acknowledge
GET    /api/v1/policies/compliance-status
GET    /api/v1/policies/search
```

#### Events Published
```yaml
- policy.created.v1
- policy.approved.v1
- policy.published.v1
- policy.acknowledged.v1
- policy.review-due.v1
- policy.retired.v1
```

#### Events Consumed
```yaml
- workflow.approved.v1 → Publish approved policy
- identity.user.created.v1 → Assign mandatory policies
```

#### Technology Stack
```yaml
Framework: NestJS
Document Storage: AWS S3 (PDF, DOCX)
Database: MongoDB (policy metadata)
Search: Elasticsearch (policy search)
```

#### Data Model
```typescript
interface Policy {
  id: string;
  title: string;
  category: 'environmental' | 'social' | 'governance' | 'compliance';
  type: string; // 'energy', 'dei', 'code-of-conduct', etc.
  version: number;
  status: 'draft' | 'in-review' | 'approved' | 'published' | 'retired';
  owner: string; // user ID
  approvers: string[];
  effectiveDate: Date;
  reviewDate: Date;
  retirementDate?: Date;
  content: {
    summary: string;
    fileUrl: string; // S3 URL
    format: 'pdf' | 'docx' | 'html';
  };
  applicableTo: {
    userIds?: string[];
    roles?: string[];
    organizationIds?: string[];
  };
  acknowledgments: PolicyAcknowledgment[];
  createdAt: Date;
  updatedAt: Date;
}

interface PolicyAcknowledgment {
  userId: string;
  acknowledgedAt: Date;
  ipAddress: string;
  userAgent: string;
}
```

---

## Service Communication Patterns

### Event Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Event Flow (Phase 2)                         │
└─────────────────────────────────────────────────────────────────┘

User Creates Materiality Assessment
    │
    ├─> Materiality Service
    │     ├─> materiality.assessment.created.v1 ──┐
    │     └─> materiality.survey.sent.v1 ─────────┼─> Notification Service
    │                                              │
    ├─> Notification Service                      │
    │     └─> Send survey emails                  │
    │                                              │
    └─> Users Complete Surveys                    │
          │                                        │
          ├─> Materiality Service                 │
          │     ├─> materiality.assessment.completed.v1 ─┐
          │     └─> materiality.matrix.generated.v1      │
          │                                               │
          ├─> Strategy Service (consumes assessment)     │
          │     ├─> Update strategy alignment            │
          │     └─> strategy.target.created.v1 ──────────┼─> Calculation Service
          │                                               │
          ├─> Benchmark Service (consumes assessment)    │
          │     └─> Compare materiality with peers       │
          │                                               │
          └─> Reporting Service (consumes assessment)    │
                └─> Include in CSRD report              │
```

### Service Dependency Matrix

```yaml
Service Dependencies (Phase 2):

  Materiality Service (3041):
    Depends on:
      - Identity Service (user/stakeholder data)
      - Organization Service (company context)
    Used by:
      - Strategy Service (material topics)
      - Reporting Service (material topic disclosure)
      - Benchmark Service (peer materiality comparison)

  Strategy Service (3042):
    Depends on:
      - Materiality Service (material topics)
      - Benchmark Service (peer targets)
      - Calculation Service (actual performance)
    Used by:
      - Reporting Service (strategy disclosure)
      - Workflow Service (initiative approvals)

  Benchmark Service (3043):
    Depends on:
      - Calculation Service (company performance)
    Used by:
      - Strategy Service (target setting)
      - Reporting Service (peer comparisons)
      - Gap Analysis (identify gaps)

  Enhanced Reporting Service (3044):
    Depends on:
      - ALL services (comprehensive data)
      - Materiality Service (material topics)
      - Strategy Service (targets, initiatives)
      - Benchmark Service (peer data)
      - Calculation Service (emissions)
      - Policy Service (governance disclosures)
    Used by:
      - External stakeholders (investors, regulators)

  Workflow Service (3009):
    Depends on:
      - Identity Service (approvers)
    Used by:
      - Reporting Service (report approvals)
      - Strategy Service (target approvals)
      - Policy Service (policy approvals)

  Notification Service (3008):
    Depends on:
      - Identity Service (user contact info)
    Used by:
      - ALL services (notifications)

  Integration Service (3010):
    Depends on:
      - Activity Service (data ingestion)
    Used by:
      - ALL services (external data)

  Policy Service (3037):
    Depends on:
      - Identity Service (users)
      - Workflow Service (approvals)
    Used by:
      - Reporting Service (governance disclosure)
```

---

## Data Architecture

### Database Strategy (Phase 2)

```yaml
MongoDB Databases (15 total):
  # Phase 1 (Existing)
  - clenergize_identity
  - clenergize_organization
  - clenergize_reference
  - clenergize_activity
  - clenergize_calculation
  - clenergize_reporting
  - clenergize_audit

  # Phase 2 (New)
  - clenergize_notification
  - clenergize_workflow
  - clenergize_integration
  - clenergize_materiality
  - clenergize_strategy
  - clenergize_benchmark
  - clenergize_reporting_enhanced (separate for multi-framework)
  - clenergize_policy

Redis Databases (Logical separation):
  0: Session cache
  1: Reference data cache (emission factors)
  2: Calculation results cache
  3: API response cache
  4: Workflow state cache (active workflows)
  5: Notification delivery status
  6: Benchmark peer data cache
  7: Report generation cache

S3 Buckets:
  - clenergize-documents (policies, evidence files)
  - clenergize-reports (generated PDFs, Excel)
  - clenergize-exports (data exports)
  - clenergize-backups (database backups)
  - clenergize-audit-logs (long-term audit storage)
```

### Data Partitioning Strategy

```yaml
Partitioning by Organization:
  - All collections partitioned by organizationId
  - Enables multi-tenancy isolation
  - Simplifies data export for customers
  - Example MongoDB queries always filter by organizationId

Partitioning by Time (for time-series data):
  - Activity data: Partitioned by year/month
  - Calculation results: Partitioned by reportingPeriod
  - Audit logs: Partitioned by month (with TTL)
  - Notifications: Partitioned by month (30-day retention)

Indexes:
  - Compound indexes: { organizationId: 1, createdAt: -1 }
  - Text search indexes: { description: "text" } for policies
  - Geospatial indexes: For location-based queries
```

---

## Integration Architecture

### External API Integrations

```yaml
Phase 2 External Integrations:

  ESG Rating Agencies:
    MSCI ESG Ratings API:
      - Purpose: Fetch ESG scores for benchmarking
      - Authentication: API key
      - Rate Limit: 1,000 requests/month
      - Cost: $5,000/year

    Sustainalytics API:
      - Purpose: Fetch risk scores
      - Authentication: OAuth 2.0
      - Rate Limit: 500 requests/month
      - Cost: $3,000/year

    CDP Public API:
      - Purpose: Public disclosure data
      - Authentication: API key
      - Rate Limit: Free tier (100 requests/day)
      - Cost: Free

  Science-Based Targets:
    SBTi API:
      - Purpose: Validate targets against 1.5°C pathway
      - Authentication: API key
      - Rate Limit: 10 validations/day
      - Cost: Free (for now)

  Framework Providers:
    GRI API:
      - Purpose: Fetch GRI Standards updates
      - Authentication: Public (no auth)
      - Rate Limit: Unlimited
      - Cost: Free

    EFRAG ESRS Taxonomy:
      - Purpose: CSRD data point mapping
      - Format: XML/XBRL download
      - Cost: Free

  News & Emerging Risks:
    News API:
      - Purpose: Monitor ESG-related news
      - Authentication: API key
      - Rate Limit: 500 requests/day
      - Cost: $449/month
```

---

## Deployment Architecture

### AWS Infrastructure (Phase 2)

```yaml
Compute:
  ECS Fargate:
    - 15 services (7 from Phase 1 + 8 new)
    - Auto-scaling: 2-10 instances per service
    - CPU: 1 vCPU per instance
    - Memory: 2 GB per instance
    - Cost: ~$1,200/month (15 services × 2 instances × $40/month)

  Lambda (for async tasks):
    - Report generation
    - Data exports
    - Webhook processing
    - Cost: ~$100/month

Database:
  MongoDB Atlas:
    - Cluster: M40 (dedicated, 3 nodes)
    - Storage: 500 GB
    - IOPS: 3,000
    - Cost: ~$1,000/month

  Redis ElastiCache:
    - Instance: cache.r6g.large (2 nodes for HA)
    - Memory: 13.07 GB per node
    - Cost: ~$300/month

Storage:
  S3:
    - Documents: 100 GB
    - Reports: 50 GB
    - Backups: 200 GB
    - Cost: ~$50/month

Networking:
  Application Load Balancer:
    - 2 ALBs (public, internal)
    - Cost: ~$50/month

  Data Transfer:
    - Egress: 1 TB/month
    - Cost: ~$90/month

Monitoring:
  CloudWatch:
    - Logs: 100 GB/month
    - Metrics: 1,000 custom metrics
    - Cost: ~$150/month

  X-Ray:
    - Traces: 1 million/month
    - Cost: ~$50/month

Total Infrastructure Cost (Phase 2): ~$3,000/month
```

---

## Security Architecture

### Additional Security Requirements (Phase 2)

```yaml
Data Classification:
  Public:
    - Published reports
    - Framework standards
    - Best practices library

  Internal:
    - Materiality assessments
    - Strategy documents
    - Benchmark comparisons

  Confidential:
    - Financial data
    - Competitive intelligence
    - Stakeholder feedback

  Restricted:
    - User credentials
    - API keys
    - PII data

Encryption:
  Data at Rest:
    - MongoDB: Encryption at rest enabled
    - S3: AES-256 encryption
    - Redis: Encrypted snapshots

  Data in Transit:
    - TLS 1.3 for all connections
    - Certificate pinning for mobile apps
    - mTLS for service-to-service (future)

Access Control:
  Role-Based Access Control (RBAC):
    - Viewer: Read-only access
    - Contributor: Create/edit data
    - Manager: Approve workflows
    - Admin: Full access
    - Super Admin: System configuration

  Attribute-Based Access Control (ABAC):
    - Filter by organization (multi-tenancy)
    - Filter by materiality level
    - Filter by data classification

Audit Logging:
  - All API requests logged
  - User actions tracked
  - Data changes recorded
  - Admin actions flagged
  - Retention: 7 years (compliance)
```

---

## Migration Strategy

### Phase 1 → Phase 2 Migration

```yaml
Migration Approach: Parallel Development

Week 1-2: Foundation
  ☐ Set up 8 new service skeletons
  ☐ Configure CI/CD pipelines
  ☐ Create MongoDB databases
  ☐ Set up Redis logical databases
  ☐ Configure S3 buckets

Week 3-4: Core Platform Services
  ☐ Implement Notification Service
  ☐ Implement Workflow Service
  ☐ Implement Integration Service
  ☐ Integration testing with Phase 1 services

Week 5-8: Materiality Service
  ☐ Implement materiality assessment engine
  ☐ Implement stakeholder engagement
  ☐ Implement materiality matrix
  ☐ CSRD/ESRS mapping
  ☐ Integration with Phase 1

Week 9-12: Strategy & Policy Services
  ☐ Implement Strategy Service (targets, KPIs)
  ☐ Implement SBTi validation
  ☐ Implement Policy Service
  ☐ Integration with Materiality Service

Week 13-16: Benchmark & Gap Analysis
  ☐ Implement Benchmark Service
  ☐ Implement gap analysis
  ☐ External API integrations (MSCI, Sustainalytics)
  ☐ Web scraping for public data

Week 17-24: Enhanced Reporting (Largest effort)
  ☐ Week 17-18: GRI Standards implementation
  ☐ Week 19-20: SASB Standards implementation
  ☐ Week 21-22: TCFD implementation
  ☐ Week 23-24: CSRD/ESRS implementation
  ☐ CDP & SDG implementation
  ☐ Narrative builder with AI
  ☐ XBRL tagging

Week 25-26: Integration & Testing
  ☐ End-to-end testing (all 8 modules)
  ☐ Performance testing (10K+ users)
  ☐ Security testing (penetration test)
  ☐ User acceptance testing

Week 27-28: Production Deployment
  ☐ Blue-green deployment
  ☐ Data migration (if needed)
  ☐ Monitoring setup
  ☐ Customer training
```

---

## Success Metrics

### Phase 2 Completion Criteria

```yaml
Functional Completeness:
  ☐ All 8 user modules operational (100% coverage)
  ☐ Materiality Service: CSRD-compliant
  ☐ Strategy Service: SBTi validation working
  ☐ Benchmark Service: 10,000+ peer companies
  ☐ Reporting Service: 6 frameworks supported
  ☐ Policy Service: Full lifecycle implemented
  ☐ Workflow Service: Approval chains working
  ☐ Notification Service: Multi-channel delivery

Technical Metrics:
  ☐ API response time: p95 <200ms (same as Phase 1)
  ☐ Database queries: p95 <100ms
  ☐ Report generation: <2 min for full report
  ☐ Concurrent users: 10,000+ supported
  ☐ Uptime: 99.99% (last 90 days)
  ☐ Error rate: <0.1%
  ☐ Test coverage: >90% unit, >80% integration

Security Metrics:
  ☐ Zero high/critical vulnerabilities
  ☐ SOC 2 Type II compliant
  ☐ GDPR compliant
  ☐ Penetration test passed
  ☐ All data encrypted at rest and in transit

Customer Validation:
  ☐ 100+ production customers
  ☐ NPS score >40
  ☐ Customer retention >95%
  ☐ Feature adoption >70%
  ☐ Zero critical bugs (30-day window)

Compliance & Frameworks:
  ☐ GRI Standards: 100% coverage
  ☐ SASB Standards: 77 industries
  ☐ TCFD: All 11 recommendations
  ☐ CSRD/ESRS: All 12 standards
  ☐ CDP: Climate, Water, Forests
  ☐ SDGs: All 17 goals mapped
  ☐ Third-party assurance: Ready
```

---

## Risk Management

### Phase 2 Specific Risks

```yaml
Technical Risks:
  Risk: Multi-framework complexity
    Likelihood: HIGH
    Impact: HIGH
    Mitigation:
      - Modular framework implementation
      - Shared data model across frameworks
      - Early validation with ESG experts
      - Automated framework mapping

  Risk: External API dependencies
    Likelihood: MEDIUM
    Impact: MEDIUM
    Mitigation:
      - API fallbacks (cached data)
      - Rate limit monitoring
      - Alternative data sources
      - Graceful degradation

  Risk: Performance degradation (15 services)
    Likelihood: MEDIUM
    Impact: HIGH
    Mitigation:
      - Aggressive caching
      - Database query optimization
      - Service mesh for routing
      - Load testing before launch

Business Risks:
  Risk: CSRD regulation changes
    Likelihood: HIGH (regulations evolve)
    Impact: MEDIUM
    Mitigation:
      - Flexible framework mapping
      - Quarterly regulation reviews
      - Partnership with EFRAG

  Risk: Customer adoption of new modules
    Likelihood: MEDIUM
    Impact: MEDIUM
    Mitigation:
      - Customer training program
      - Guided onboarding
      - Success metrics dashboard
      - Dedicated customer success team
```

---

## Summary & Recommendations

### Phase 2 Scope Summary

**Services Added**: 8 new microservices
**Modules Completed**: 6 additional modules (total 8/8)
**Story Points**: 550 points (~4-6 months with team of 7)
**Infrastructure Cost**: +$2,000/month (total $3,000/month)

### Recommended Approach

1. **Sequential Development**: Build services in order of dependency
   - Week 1-4: Core platform (Notification, Workflow, Integration)
   - Week 5-8: Materiality (prerequisite for others)
   - Week 9-12: Strategy & Policy
   - Week 13-16: Benchmark
   - Week 17-24: Enhanced Reporting (largest effort)

2. **Continuous Integration**: Integrate with Phase 1 services throughout
   - Weekly integration tests
   - Monthly performance tests
   - Continuous security scanning

3. **Customer Validation**: Early beta program
   - 10 beta customers for Materiality Service (Month 10)
   - 20 beta customers for full platform (Month 12)
   - Collect feedback and iterate

4. **Risk Mitigation**: Focus on high-risk areas
   - Multi-framework mapping (invest in data model upfront)
   - External API reliability (build fallbacks)
   - Performance at scale (continuous load testing)

---

**Document Status**: ✅ APPROVED for planning
**Next Steps**:
1. Validate Phase 2 scope with stakeholders
2. Complete Phase 1 before starting Phase 2
3. Hire additional developers if needed (7 → 10)
4. Secure budget for external APIs ($10K/year)

**Owner**: Master Coordinator + Architecture Agent
**Last Updated**: November 23, 2025
