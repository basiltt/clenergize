# PHASE 3: Service Specification - Reporting Service

**Version**: 1.0.0
**Status**: Design Phase
**Last Updated**: November 18, 2025
**Owner**: Reporting Agent

---

## Table of Contents

1. [Service Overview](#service-overview)
2. [Functional Requirements](#functional-requirements)
3. [API Endpoints](#api-endpoints)
4. [Data Models](#data-models)
5. [Business Logic](#business-logic)
6. [Integration Points](#integration-points)
7. [Non-Functional Requirements](#non-functional-requirements)
8. [Testing Strategy](#testing-strategy)
9. [Deployment Configuration](#deployment-configuration)
10. [Migration from OLD System](#migration-from-old-system)

---

## 1. Service Overview

### 1.1 Purpose

The **Reporting Service** is the analytics and reporting engine of the Clenergize V3 platform, responsible for:

- **Report Generation**: Create GHG Protocol-compliant emission reports
- **Data Export**: Export data in multiple formats (CSV, Excel, PDF)
- **Scheduled Reporting**: Automate periodic report generation and distribution
- **Dashboard Aggregations**: Provide real-time analytics data for dashboards
- **Report Templates**: Manage customizable report templates
- **Compliance Reporting**: Generate audit-ready compliance documents
- **Subscription Management**: Distribute reports to stakeholders via email

### 1.2 Bounded Context

**Domain**: Reporting Context (part of Carbon Management Support Domain)

**Responsibilities**:
- Generate emission summary reports
- Aggregate calculation results for analysis
- Export data in various formats
- Schedule and distribute reports
- Manage report templates and layouts
- Track report generation history

**NOT Responsible For**:
- Emission calculations (Calculation Service)
- Activity data collection (Activity Service)
- User authentication (Identity Service)
- Data storage beyond reports (other services)

### 1.3 Technology Stack

```yaml
Framework: NestJS 10+ (TypeScript)
Database: MongoDB 7+ (reports, templates, subscriptions)
Cache: Redis 7+ (dashboard aggregations, report status)
Queue: AWS SQS (report generation jobs)
Storage: AWS S3 (generated report files)
Email: AWS SES (report distribution)
Event Bus: AWS EventBridge (production), Redis Pub/Sub (local)
PDF Generation: Puppeteer + Handlebars
Excel Generation: ExcelJS
Validation: Zod
Testing: Jest, Supertest
Documentation: OpenAPI 3.1 (Swagger)
```

### 1.4 Service Dependencies

```mermaid
graph TD
    CALC[Calculation Service] -->|calculation.emission.calculated.v1| R[Reporting Service]
    CALC -->|calculation.rollup.completed.v1| R
    ORG[Organization Service] -->|Read: Project/Entity names| R
    ID[Identity Service] -->|Read: User details| R
    REF[Reference Service] -->|Read: Parameter metadata| R
    R -->|report.generated.v1| A[Audit Service]
    R -->|Email| SES[AWS SES]
    R -->|Store Files| S3[AWS S3]
```

**Upstream Dependencies** (Services we depend on):
- Calculation Service: Provides emission data (event-driven)
- Organization Service: Provides project/entity details
- Identity Service: Provides user details for distribution
- Reference Service: Provides parameter/category names

**Downstream Consumers** (Services that depend on us):
- Audit Service: Logs report generation
- Frontend: Displays reports, triggers generation
- External Systems: Consume exported data

---

## 2. Functional Requirements

### 2.1 Core Features

#### F-REPORT-001: Report Generation
**Description**: Generate emission reports in multiple formats

**Report Types**:
1. **GHG Protocol Report**: Standard emission inventory report
2. **Scope Summary Report**: Breakdown by Scope 1/2/3
3. **Category Analysis Report**: Emissions by activity category
4. **Trend Analysis Report**: Year-over-year comparison
5. **Entity Comparison Report**: Compare emissions across entities
6. **Custom Report**: User-defined dimensions and filters

**Acceptance Criteria**:
- Generate reports in PDF, Excel, CSV formats
- Support filtering by: year, scope, category, entity
- Include charts and visualizations (PDF/Excel only)
- Watermark reports with generation timestamp
- Include data quality indicators
- Support multi-year comparisons

**Output Example** (GHG Protocol Report):
```
Company: Acme Corporation
Reporting Year: 2024
Report Date: 2025-11-18

Executive Summary:
- Total Emissions: 12,450 tCO2e
- Scope 1: 4,200 tCO2e (34%)
- Scope 2: 3,800 tCO2e (31%)
- Scope 3: 4,450 tCO2e (35%)
- YoY Change: -8.5% (vs 2023)

Scope 1 Breakdown:
- Stationary Combustion: 2,800 tCO2e
- Mobile Combustion: 1,200 tCO2e
- Fugitive Emissions: 200 tCO2e

[Detailed tables, charts, methodology notes...]
```

---

#### F-REPORT-002: Report Scheduling
**Description**: Automate periodic report generation and distribution

**Acceptance Criteria**:
- Support cron-based schedules (daily, weekly, monthly, quarterly, annually)
- Support one-time scheduled reports
- Distribute reports via email to recipients
- Retry failed report generation (max 3 attempts)
- Send failure notifications
- Allow pause/resume of schedules

**Scheduling Options**:
```typescript
interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'custom';
  cronExpression?: string;      // For custom schedules
  startDate: Date;
  endDate?: Date;               // Optional expiration
  timezone: string;             // e.g., 'America/New_York'
  recipients: string[];         // Email addresses
  format: 'pdf' | 'excel' | 'csv';
}
```

**Critical Fix from OLD System**:
```typescript
// ❌ OLD: Infinite SQS polling loop
while (true) {
  const messages = await sqs.receiveMessage({ ... });
  // Process messages
  // NO BREAK CONDITION - runs forever!
}

// ✅ NEW: Proper queue consumer with graceful shutdown
async function startQueueConsumer() {
  let isShuttingDown = false;

  process.on('SIGTERM', () => {
    isShuttingDown = true;
    logger.info('Graceful shutdown initiated');
  });

  while (!isShuttingDown) {
    try {
      const messages = await sqs.receiveMessage({
        QueueUrl: REPORT_QUEUE_URL,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 20,        // Long polling
        VisibilityTimeout: 300      // 5 minutes
      });

      if (messages.Messages) {
        await processMessages(messages.Messages);
      }
    } catch (error) {
      logger.error('Queue consumer error', error);
      await sleep(5000);  // Back off on error
    }
  }

  logger.info('Queue consumer stopped gracefully');
}
```

---

#### F-REPORT-003: Data Export
**Description**: Export activity data and calculations in structured formats

**Export Types**:
1. **Activity Data Export**: All activity data for a project/year
2. **Calculation Results Export**: All calculations with metadata
3. **Aggregated Summary Export**: Totals by various dimensions
4. **Audit Trail Export**: Complete change history

**Acceptance Criteria**:
- Support CSV, Excel, JSON formats
- Include headers with field descriptions
- Support pagination for large exports (>100k rows)
- Compress large files (ZIP)
- Generate presigned S3 URLs for download
- Expire download links after 7 days

**Excel Export Features**:
- Multiple worksheets (Summary, Details, Methodology)
- Data validation for editable fields
- Conditional formatting for thresholds
- Embedded charts
- Freeze panes for headers

---

#### F-REPORT-004: Dashboard Aggregations
**Description**: Provide real-time analytics data for frontend dashboards

**Dashboard Widgets**:
1. **Total Emissions Card**: Current total with YoY trend
2. **Scope Breakdown Pie Chart**: Scope 1/2/3 distribution
3. **Category Breakdown Bar Chart**: Top 10 categories
4. **Trend Line Chart**: Monthly emissions over time
5. **Entity Leaderboard**: Highest emitting entities
6. **Data Quality Gauge**: Percentage of verified data
7. **Recent Activity Feed**: Latest calculations/verifications

**Acceptance Criteria**:
- Response time <200ms for dashboard queries
- Cache aggregations for 5 minutes
- Support real-time updates via WebSocket (optional)
- Provide drill-down capability (click to details)

**Caching Strategy**:
```typescript
// Cache key pattern
const DASHBOARD_CACHE_KEY = `dashboard:${projectId}:${year}:${widget}`;
const CACHE_TTL = 300; // 5 minutes

async function getDashboardData(projectId: string, year: number) {
  const cacheKey = `dashboard:${projectId}:${year}:summary`;

  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Query database
  const data = await aggregateEmissions(projectId, year);

  // Cache result
  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(data));

  return data;
}

// Invalidate cache when new calculations arrive
@EventsHandler('calculation.emission.calculated.v1')
async onCalculationCompleted(event: CalculationCompletedEvent) {
  const pattern = `dashboard:${event.data.projectId}:${event.data.year}:*`;
  await redis.del(pattern);
}
```

---

#### F-REPORT-005: Report Templates
**Description**: Manage customizable report templates

**Template Types**:
- **System Templates**: Pre-built templates (GHG Protocol, ISO 14064)
- **Organization Templates**: Company-specific branding/layout
- **User Templates**: Personal saved report configurations

**Template Components**:
```typescript
interface ReportTemplate {
  templateId: string;
  name: string;
  description: string;
  type: 'system' | 'organization' | 'user';

  // Report configuration
  sections: {
    id: string;
    title: string;
    type: 'table' | 'chart' | 'text' | 'summary';
    dataSource: string;         // Query or aggregation
    filters?: Filter[];
    sortBy?: SortConfig;
    visualization?: ChartConfig;
  }[];

  // Styling
  branding?: {
    logo: string;               // S3 URL
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    fonts: {
      heading: string;
      body: string;
    };
  };

  // Metadata
  createdBy: string;
  createdAt: Date;
  version: number;
}
```

**Acceptance Criteria**:
- Clone and customize system templates
- Preview templates before generation
- Version templates (track changes)
- Share templates within organization
- Export/import templates (JSON)

---

#### F-REPORT-006: Report Distribution
**Description**: Distribute reports to stakeholders

**Distribution Channels**:
1. **Email**: Send report as attachment or link
2. **Download Link**: Generate presigned S3 URL
3. **Webhook**: POST report data to external URL
4. **SFTP**: Upload to customer's SFTP server (enterprise feature)

**Email Template**:
```html
Subject: [Clenergize] Monthly Emissions Report - October 2024

Dear {recipient_name},

Your monthly emissions report for {project_name} is ready.

Report Details:
- Period: {reporting_period}
- Total Emissions: {total_emissions} tCO2e
- Change vs Last Month: {percentage_change}%

Download Report: {presigned_url}
(Link expires in 7 days)

View Dashboard: {dashboard_url}

---
This is an automated email from Clenergize.
To manage your report subscriptions, visit {settings_url}
```

**Acceptance Criteria**:
- Support multiple recipients per report
- Track delivery status (sent, failed, bounced)
- Respect user email preferences (opt-out)
- Include unsubscribe link
- Log all distribution events

---

### 2.2 Report Types Reference

| Report Type | Description | Key Metrics | Format | Audience |
|------------|-------------|-------------|--------|----------|
| **GHG Protocol Inventory** | Complete emission inventory per GHG Protocol | Scope 1/2/3 totals, category breakdown, methodology | PDF, Excel | Compliance, Auditors |
| **Executive Summary** | High-level overview for leadership | Total emissions, YoY trend, key initiatives | PDF | C-suite, Board |
| **Scope Analysis** | Detailed analysis of specific scope | Category breakdown, top emitters, reduction opportunities | Excel, PDF | Sustainability team |
| **Trend Report** | Multi-year comparison | Historical trends, projection, targets | PDF with charts | Management |
| **Entity Comparison** | Compare multiple entities | Side-by-side metrics, rankings, benchmarks | Excel, PDF | Facilities managers |
| **Activity Detail** | Raw activity data | All transactions with calculations | CSV, Excel | Data analysts |
| **Verification Report** | Audit-ready compliance | Audit trail, data quality, verification status | PDF | External auditors |
| **What-If Scenario** | Scenario analysis | Baseline vs scenario, delta, action items | PDF | Strategy team |

---

## 3. API Endpoints

### 3.1 Report Generation

#### `POST /v1/reports/generate`
**Description**: Generate a report on-demand

**Request**:
```typescript
{
  templateId?: string;           // Optional: use template
  reportType: 'ghg-protocol' | 'scope-analysis' | 'trend' | 'custom';
  format: 'pdf' | 'excel' | 'csv';

  // Filters
  projectId: string;
  year: number;
  scope?: 'Scope 1' | 'Scope 2' | 'Scope 3' | 'All';
  entityIds?: string[];          // Filter to specific entities
  categories?: string[];         // Filter to specific categories

  // Options
  includeCharts?: boolean;       // Default: true for PDF/Excel
  includeMethodology?: boolean;  // Include calculation methodology
  compareToYear?: number;        // Compare to previous year

  // Distribution (optional)
  sendEmail?: boolean;
  recipients?: string[];
}
```

**Response** (202 Accepted):
```typescript
{
  reportId: string;              // UUID
  status: 'queued' | 'generating' | 'completed' | 'failed';
  estimatedDuration: number;     // seconds
  queuePosition: number;
}
```

**Polling Endpoint**: `GET /v1/reports/{reportId}/status`

**Download Endpoint**: `GET /v1/reports/{reportId}/download`
- Returns: Presigned S3 URL (expires in 7 days)

---

#### `GET /v1/reports/{reportId}`
**Description**: Get report details and download link

**Response** (200 OK):
```typescript
{
  reportId: string;
  status: 'completed';
  reportType: string;
  format: string;

  // Metadata
  projectId: string;
  projectName: string;
  year: number;
  generatedAt: string;           // ISO 8601
  generatedBy: string;           // User ID

  // File details
  file: {
    name: string;                // "GHG_Protocol_Report_2024.pdf"
    size: number;                // Bytes
    url: string;                 // Presigned S3 URL
    expiresAt: string;           // Link expiration
  };

  // Report summary
  summary: {
    totalEmissions: number;
    scope1: number;
    scope2: number;
    scope3: number;
    dataQuality: number;         // % (0-100)
  };
}
```

---

#### `POST /v1/reports/{reportId}/regenerate`
**Description**: Regenerate an existing report with updated data

**Response** (202 Accepted):
```typescript
{
  newReportId: string;
  status: 'queued';
  originalReportId: string;
}
```

---

### 3.2 Report Scheduling

#### `POST /v1/schedules/create`
**Description**: Create a scheduled report

**Request**:
```typescript
{
  name: string;                  // "Monthly Emissions Report"
  description?: string;

  // Report configuration
  reportType: string;
  format: 'pdf' | 'excel' | 'csv';
  templateId?: string;
  filters: {
    projectId: string;
    scope?: string;
    entityIds?: string[];
  };

  // Schedule
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'custom';
  cronExpression?: string;       // For custom frequency
  timezone: string;              // IANA timezone (e.g., 'America/New_York')
  startDate: string;             // ISO 8601
  endDate?: string;              // Optional

  // Distribution
  recipients: string[];          // Email addresses
  subject?: string;              // Email subject template
  message?: string;              // Email body template

  // Options
  enabled: boolean;              // Default: true
}
```

**Response** (201 Created):
```typescript
{
  scheduleId: string;
  name: string;
  nextRunAt: string;             // ISO 8601
  status: 'active' | 'paused';
}
```

---

#### `GET /v1/schedules`
**Description**: List all scheduled reports

**Query Parameters**:
- `projectId`: string (filter by project)
- `status`: 'active' | 'paused' | 'expired'
- `page`: number
- `limit`: number

**Response** (200 OK):
```typescript
{
  schedules: [
    {
      scheduleId: string;
      name: string;
      frequency: string;
      nextRunAt: string;
      lastRunAt?: string;
      status: 'active' | 'paused';
      recipients: string[];
    }
  ];
  pagination: { ... };
}
```

---

#### `PATCH /v1/schedules/{scheduleId}`
**Description**: Update scheduled report

**Request**:
```typescript
{
  name?: string;
  frequency?: string;
  recipients?: string[];
  enabled?: boolean;             // Pause/resume
}
```

**Response** (200 OK):
```typescript
{
  scheduleId: string;
  updated: true;
  nextRunAt: string;
}
```

---

#### `DELETE /v1/schedules/{scheduleId}`
**Description**: Delete scheduled report

**Response** (200 OK):
```typescript
{
  scheduleId: string;
  deleted: true;
}
```

---

### 3.3 Data Export

#### `POST /v1/exports/activity-data`
**Description**: Export activity data

**Request**:
```typescript
{
  projectId: string;
  year: number;
  format: 'csv' | 'excel' | 'json';

  // Filters
  scope?: string;
  categories?: string[];
  entityIds?: string[];
  verified?: boolean;            // Only verified data

  // Options
  includeCalculations?: boolean; // Include emission results
  includeMetadata?: boolean;     // Include timestamps, users, etc.
}
```

**Response** (202 Accepted):
```typescript
{
  exportId: string;
  status: 'queued';
  estimatedRows: number;
}
```

**Download**: `GET /v1/exports/{exportId}/download`

---

#### `POST /v1/exports/calculations`
**Description**: Export calculation results

**Request**:
```typescript
{
  projectId: string;
  year: number;
  format: 'csv' | 'excel' | 'json';

  // Filters
  scope?: string;
  categories?: string[];
  entityIds?: string[];
  dateRange?: {
    from: string;                // ISO 8601
    to: string;
  };

  // Options
  includeInputs?: boolean;       // Include calculation inputs
  includeUncertainty?: boolean;  // Include uncertainty data
}
```

---

#### `POST /v1/exports/aggregated`
**Description**: Export aggregated summary

**Request**:
```typescript
{
  projectId: string;
  years: number[];               // Support multi-year
  format: 'csv' | 'excel';

  // Grouping
  groupBy: ['year', 'scope', 'category', 'entity'];  // Array of dimensions

  // Options
  includePercentages?: boolean;  // % of total
  includeTrends?: boolean;       // YoY change
}
```

**Excel Output Example**:
```
Year | Scope    | Category              | Entity      | Emissions (tCO2e) | % of Total | YoY Change
2024 | Scope 1  | Stationary Combustion | HQ          | 1,234            | 25%        | -5%
2024 | Scope 1  | Mobile Combustion     | HQ          | 567              | 11%        | +2%
2024 | Scope 2  | Electricity           | HQ          | 890              | 18%        | -12%
...
```

---

### 3.4 Dashboard Analytics

#### `GET /v1/dashboard/summary`
**Description**: Get dashboard summary data

**Query Parameters**:
- `projectId`: string
- `year`: number
- `compareToYear`: number (optional)

**Response** (200 OK):
```typescript
{
  projectId: string;
  projectName: string;
  year: number;

  // Totals
  totals: {
    emission: number;            // tCO2e
    scope1: number;
    scope2: number;
    scope3: number;
  };

  // Trends (if compareToYear provided)
  trends?: {
    totalChange: number;         // tCO2e absolute
    percentageChange: number;    // %
    scope1Change: number;
    scope2Change: number;
    scope3Change: number;
  };

  // Data quality
  dataQuality: {
    totalRecords: number;
    verifiedRecords: number;
    verificationRate: number;    // % (0-100)
    qualityScore: number;        // Average (1-4)
  };

  // Recent activity
  recentActivity: {
    lastCalculation: string;     // ISO 8601
    lastVerification: string;
    lastUpdate: string;
  };

  // Cache metadata
  cachedAt: string;
  cacheExpiry: string;
}
```

**Caching**: 5 minutes TTL, invalidate on new calculations

---

#### `GET /v1/dashboard/breakdown`
**Description**: Get emissions breakdown

**Query Parameters**:
- `projectId`: string
- `year`: number
- `dimension`: 'scope' | 'category' | 'entity' | 'month'
- `topN`: number (default: 10)

**Response** (200 OK):
```typescript
{
  dimension: 'category';
  breakdown: [
    {
      key: 'Stationary Combustion';
      value: 3500;               // tCO2e
      percentage: 28;            // %
      trend?: number;            // YoY % change
    },
    {
      key: 'Electricity';
      value: 2800;
      percentage: 22;
      trend: -8
    },
    // ... top N items
  ];
  others?: {
    value: number;               // Sum of remaining items
    percentage: number;
  };
}
```

---

#### `GET /v1/dashboard/trend`
**Description**: Get emissions trend over time

**Query Parameters**:
- `projectId`: string
- `years`: number[] (comma-separated)
- `groupBy`: 'month' | 'quarter' | 'year'
- `scope`: string (optional)

**Response** (200 OK):
```typescript
{
  groupBy: 'month';
  dataPoints: [
    {
      period: '2024-01';         // YYYY-MM for month
      emission: number;
      scope1: number;
      scope2: number;
      scope3: number;
    },
    // ... all periods
  ];
  aggregated: {
    total: number;
    average: number;
    min: number;
    max: number;
    stdDev: number;
  };
}
```

---

### 3.5 Report Templates

#### `GET /v1/templates`
**Description**: List available report templates

**Query Parameters**:
- `type`: 'system' | 'organization' | 'user'
- `reportType`: string (filter by report type)

**Response** (200 OK):
```typescript
{
  templates: [
    {
      templateId: string;
      name: string;
      description: string;
      type: 'system' | 'organization' | 'user';
      reportType: string;
      previewUrl?: string;       // Template preview image
      createdBy?: string;        // For user/org templates
      createdAt: string;
    }
  ];
}
```

---

#### `POST /v1/templates/create`
**Description**: Create custom report template

**Request**:
```typescript
{
  name: string;
  description?: string;
  type: 'organization' | 'user';  // Cannot create system templates
  baseTemplateId?: string;        // Clone from existing

  // Template configuration
  sections: [ ... ];              // See ReportTemplate interface
  branding?: { ... };
}
```

**Response** (201 Created):
```typescript
{
  templateId: string;
  name: string;
  version: 1;
}
```

---

#### `GET /v1/templates/{templateId}`
**Description**: Get template details

**Response** (200 OK):
```typescript
{
  // Full ReportTemplate object
}
```

---

#### `PUT /v1/templates/{templateId}`
**Description**: Update template (creates new version)

**Request**:
```typescript
{
  sections?: Section[];
  branding?: Branding;
  versionNotes?: string;
}
```

**Response** (200 OK):
```typescript
{
  templateId: string;
  version: number;               // Incremented
  updatedAt: string;
}
```

---

## 4. Data Models

### 4.1 MongoDB Collections

#### Collection: `reports`

```typescript
interface Report {
  _id: ObjectId;
  reportId: string;              // UUID

  // Report configuration
  reportType: 'ghg-protocol' | 'scope-analysis' | 'trend' | 'entity-comparison' | 'custom';
  format: 'pdf' | 'excel' | 'csv';
  templateId?: ObjectId;

  // Filters
  projectId: ObjectId;
  year: number;
  scope?: 'Scope 1' | 'Scope 2' | 'Scope 3' | 'All';
  entityIds?: ObjectId[];
  categories?: string[];

  // Options
  includeCharts: boolean;
  includeMethodology: boolean;
  compareToYear?: number;

  // Generation status
  status: 'queued' | 'generating' | 'completed' | 'failed';
  queuedAt: Date;
  startedAt?: Date;
  completedAt?: Date;

  // File details
  file?: {
    s3Key: string;
    s3Bucket: string;
    fileName: string;
    fileSize: number;             // Bytes
    mimeType: string;
    presignedUrl?: string;
    urlExpiresAt?: Date;
  };

  // Summary data (cached from report)
  summary?: {
    totalEmissions: number;
    scope1: number;
    scope2: number;
    scope3: number;
    dataQuality: number;
    recordCount: number;
  };

  // Error tracking
  error?: {
    message: string;
    stack?: string;
    code: string;
  };
  attempts: number;              // Retry count

  // Distribution
  distributedTo?: string[];      // Email addresses
  distributedAt?: Date;

  // Metadata
  generatedBy: ObjectId;         // User ID
  organization: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
```javascript
db.reports.createIndex({ reportId: 1 }, { unique: true });
db.reports.createIndex({ projectId: 1, year: 1, status: 1 });
db.reports.createIndex({ generatedBy: 1, createdAt: -1 });
db.reports.createIndex({ status: 1, queuedAt: 1 });  // For queue processing
db.reports.createIndex({ 'file.s3Key': 1 });
db.reports.createIndex({ createdAt: 1 }, { expireAfterSeconds: 7776000 });  // 90 days TTL
```

---

#### Collection: `report_schedules`

```typescript
interface ReportSchedule {
  _id: ObjectId;
  scheduleId: string;            // UUID

  // Schedule details
  name: string;
  description?: string;
  enabled: boolean;

  // Report configuration (same as Report)
  reportType: string;
  format: string;
  templateId?: ObjectId;
  filters: {
    projectId: ObjectId;
    scope?: string;
    entityIds?: ObjectId[];
    categories?: string[];
  };

  // Schedule configuration
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'custom';
  cronExpression?: string;       // For custom frequency
  timezone: string;
  startDate: Date;
  endDate?: Date;

  // Execution tracking
  nextRunAt: Date;
  lastRunAt?: Date;
  lastReportId?: ObjectId;       // Reference to last generated report
  lastStatus?: 'success' | 'failed';

  // Distribution
  recipients: string[];          // Email addresses
  emailSubject?: string;         // Template with placeholders
  emailBody?: string;

  // Statistics
  stats: {
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    lastErrorMessage?: string;
  };

  // Metadata
  createdBy: ObjectId;
  organization: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
```javascript
db.report_schedules.createIndex({ scheduleId: 1 }, { unique: true });
db.report_schedules.createIndex({ nextRunAt: 1, enabled: 1 });  // For scheduler queries
db.report_schedules.createIndex({ 'filters.projectId': 1 });
db.report_schedules.createIndex({ createdBy: 1 });
```

---

#### Collection: `report_templates`

```typescript
interface ReportTemplate {
  _id: ObjectId;
  templateId: string;            // UUID

  // Template details
  name: string;
  description?: string;
  type: 'system' | 'organization' | 'user';
  reportType: string;

  // Template configuration
  sections: {
    id: string;
    title: string;
    type: 'table' | 'chart' | 'text' | 'summary' | 'image';
    order: number;

    // Data configuration
    dataSource?: string;         // MongoDB aggregation pipeline (JSON)
    filters?: {
      field: string;
      operator: string;
      value: any;
    }[];
    sortBy?: {
      field: string;
      direction: 'asc' | 'desc';
    };

    // Visualization (for charts)
    visualization?: {
      chartType: 'bar' | 'line' | 'pie' | 'scatter' | 'area';
      xAxis?: string;
      yAxis?: string;
      groupBy?: string;
      colors?: string[];
    };

    // Styling
    style?: {
      fontSize?: number;
      fontWeight?: string;
      alignment?: 'left' | 'center' | 'right';
      backgroundColor?: string;
    };
  }[];

  // Branding
  branding?: {
    logo?: string;               // S3 URL
    colors?: {
      primary: string;
      secondary: string;
      accent: string;
    };
    fonts?: {
      heading: string;
      body: string;
    };
    header?: string;             // HTML template
    footer?: string;             // HTML template
  };

  // Version control
  version: number;
  versionNotes?: string;
  baseTemplateId?: ObjectId;     // If cloned from another

  // Access control
  organization?: ObjectId;       // For org templates
  createdBy: ObjectId;
  sharedWith?: ObjectId[];       // User IDs with access

  // Status
  status: 'draft' | 'published' | 'archived';

  // Usage tracking
  stats: {
    timesUsed: number;
    lastUsedAt?: Date;
  };

  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
```javascript
db.report_templates.createIndex({ templateId: 1, version: 1 }, { unique: true });
db.report_templates.createIndex({ type: 1, status: 1 });
db.report_templates.createIndex({ organization: 1 });
db.report_templates.createIndex({ createdBy: 1 });
db.report_templates.createIndex({ reportType: 1 });
```

---

#### Collection: `exports`

```typescript
interface Export {
  _id: ObjectId;
  exportId: string;              // UUID

  // Export configuration
  exportType: 'activity-data' | 'calculations' | 'aggregated';
  format: 'csv' | 'excel' | 'json';

  // Filters
  projectId: ObjectId;
  year: number;
  scope?: string;
  categories?: string[];
  entityIds?: ObjectId[];
  dateRange?: {
    from: Date;
    to: Date;
  };

  // Options
  includeCalculations?: boolean;
  includeMetadata?: boolean;
  includeInputs?: boolean;
  includeUncertainty?: boolean;
  groupBy?: string[];

  // Status
  status: 'queued' | 'processing' | 'completed' | 'failed';
  queuedAt: Date;
  startedAt?: Date;
  completedAt?: Date;

  // File details
  file?: {
    s3Key: string;
    s3Bucket: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    presignedUrl?: string;
    urlExpiresAt?: Date;
    compressed: boolean;         // If ZIP
  };

  // Statistics
  stats?: {
    totalRows: number;
    processedRows: number;
    errorRows: number;
  };

  // Error tracking
  error?: {
    message: string;
    code: string;
  };
  attempts: number;

  // Metadata
  requestedBy: ObjectId;
  organization: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
```javascript
db.exports.createIndex({ exportId: 1 }, { unique: true });
db.exports.createIndex({ status: 1, queuedAt: 1 });
db.exports.createIndex({ projectId: 1, createdAt: -1 });
db.exports.createIndex({ requestedBy: 1, createdAt: -1 });
db.exports.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 });  // 30 days TTL
```

---

### 4.2 Redis Cache Schema

#### Dashboard Cache Keys

```typescript
// Dashboard summary
const DASHBOARD_SUMMARY_KEY = `dashboard:summary:${projectId}:${year}`;
const DASHBOARD_SUMMARY_TTL = 300; // 5 minutes

// Dashboard breakdown
const DASHBOARD_BREAKDOWN_KEY = `dashboard:breakdown:${projectId}:${year}:${dimension}`;
const DASHBOARD_BREAKDOWN_TTL = 300;

// Dashboard trend
const DASHBOARD_TREND_KEY = `dashboard:trend:${projectId}:${years}:${groupBy}`;
const DASHBOARD_TREND_TTL = 600; // 10 minutes

// Report status (for polling)
const REPORT_STATUS_KEY = `report:status:${reportId}`;
const REPORT_STATUS_TTL = 3600; // 1 hour
```

#### Cache Invalidation

```typescript
// Invalidate all dashboard caches for a project when new calculation arrives
async function invalidateDashboardCache(projectId: string, year: number) {
  const patterns = [
    `dashboard:summary:${projectId}:${year}`,
    `dashboard:breakdown:${projectId}:${year}:*`,
    `dashboard:trend:${projectId}:*`
  ];

  for (const pattern of patterns) {
    await redis.del(pattern);
  }
}
```

---

## 5. Business Logic

### 5.1 Report Generation Engine

#### PDF Report Generation

```typescript
class PDFReportGenerator {
  async generateReport(
    reportConfig: ReportConfig,
    template: ReportTemplate
  ): Promise<Buffer> {

    // Step 1: Fetch data
    const data = await this.fetchReportData(reportConfig);

    // Step 2: Apply template sections
    const sections = await Promise.all(
      template.sections.map(section => this.renderSection(section, data))
    );

    // Step 3: Compile Handlebars template
    const templateHtml = this.compileTemplate(template, sections);

    // Step 4: Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(templateHtml, {
      waitUntil: 'networkidle0'
    });

    // Generate PDF with options
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      displayHeaderFooter: true,
      headerTemplate: template.branding?.header || '',
      footerTemplate: template.branding?.footer || this.defaultFooter()
    });

    await browser.close();

    return pdfBuffer;
  }

  private defaultFooter(): string {
    return `
      <div style="font-size: 10px; text-align: center; width: 100%; padding: 10px;">
        <span class="pageNumber"></span> / <span class="totalPages"></span>
        | Generated on ${new Date().toLocaleDateString()}
        | Clenergize V3
      </div>
    `;
  }

  private async renderSection(
    section: TemplateSection,
    data: any
  ): Promise<string> {
    switch (section.type) {
      case 'table':
        return this.renderTable(section, data);
      case 'chart':
        return this.renderChart(section, data);
      case 'summary':
        return this.renderSummary(section, data);
      case 'text':
        return this.renderText(section, data);
      default:
        throw new Error(`Unknown section type: ${section.type}`);
    }
  }

  private renderChart(section: TemplateSection, data: any): string {
    // Use Chart.js or similar to generate chart image
    const chartConfig = {
      type: section.visualization?.chartType || 'bar',
      data: this.transformDataForChart(data, section),
      options: {
        responsive: false,
        width: 600,
        height: 400
      }
    };

    // Generate chart as base64 image
    const chartImage = this.generateChartImage(chartConfig);

    return `
      <div class="chart-section">
        <h3>${section.title}</h3>
        <img src="${chartImage}" alt="${section.title}" />
      </div>
    `;
  }
}
```

---

#### Excel Report Generation

```typescript
import ExcelJS from 'exceljs';

class ExcelReportGenerator {
  async generateReport(
    reportConfig: ReportConfig,
    template: ReportTemplate
  ): Promise<Buffer> {

    const workbook = new ExcelJS.Workbook();

    // Set workbook properties
    workbook.creator = 'Clenergize V3';
    workbook.created = new Date();

    // Create Summary worksheet
    const summarySheet = workbook.addWorksheet('Summary', {
      properties: { tabColor: { argb: 'FF00FF00' } }
    });

    await this.populateSummarySheet(summarySheet, reportConfig);

    // Create Details worksheet
    const detailsSheet = workbook.addWorksheet('Details');
    await this.populateDetailsSheet(detailsSheet, reportConfig);

    // Create Charts worksheet (if configured)
    if (template.sections.some(s => s.type === 'chart')) {
      const chartsSheet = workbook.addWorksheet('Charts');
      await this.populateChartsSheet(chartsSheet, reportConfig);
    }

    // Create Methodology worksheet
    const methodologySheet = workbook.addWorksheet('Methodology');
    await this.populateMethodologySheet(methodologySheet);

    // Generate buffer
    return await workbook.xlsx.writeBuffer();
  }

  private async populateSummarySheet(
    sheet: ExcelJS.Worksheet,
    config: ReportConfig
  ): Promise<void> {

    // Add title
    sheet.mergeCells('A1:E1');
    sheet.getCell('A1').value = 'GHG Emission Inventory Report';
    sheet.getCell('A1').font = { size: 16, bold: true };
    sheet.getCell('A1').alignment = { horizontal: 'center' };

    // Add metadata
    sheet.getCell('A3').value = 'Company:';
    sheet.getCell('B3').value = config.projectName;
    sheet.getCell('A4').value = 'Reporting Year:';
    sheet.getCell('B4').value = config.year;
    sheet.getCell('A5').value = 'Report Date:';
    sheet.getCell('B5').value = new Date().toISOString().split('T')[0];

    // Fetch summary data
    const summary = await this.fetchSummaryData(config);

    // Add summary table
    sheet.getCell('A7').value = 'Scope';
    sheet.getCell('B7').value = 'Emissions (tCO2e)';
    sheet.getCell('C7').value = '% of Total';
    sheet.getCell('D7').value = 'YoY Change (%)';

    sheet.getRow(7).font = { bold: true };
    sheet.getRow(7).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }
    };

    // Populate data
    let row = 8;
    ['Scope 1', 'Scope 2', 'Scope 3'].forEach(scope => {
      const data = summary.byScope[scope];
      sheet.getCell(`A${row}`).value = scope;
      sheet.getCell(`B${row}`).value = data.emission;
      sheet.getCell(`B${row}`).numFmt = '#,##0.00';
      sheet.getCell(`C${row}`).value = data.percentage / 100;
      sheet.getCell(`C${row}`).numFmt = '0.0%';
      sheet.getCell(`D${row}`).value = data.yoyChange / 100;
      sheet.getCell(`D${row}`).numFmt = '0.0%';

      // Conditional formatting for YoY change
      if (data.yoyChange < 0) {
        sheet.getCell(`D${row}`).font = { color: { argb: 'FF00FF00' } };  // Green
      } else if (data.yoyChange > 0) {
        sheet.getCell(`D${row}`).font = { color: { argb: 'FFFF0000' } };  // Red
      }

      row++;
    });

    // Add total row
    sheet.getCell(`A${row}`).value = 'Total';
    sheet.getCell(`A${row}`).font = { bold: true };
    sheet.getCell(`B${row}`).value = summary.total;
    sheet.getCell(`B${row}`).numFmt = '#,##0.00';
    sheet.getCell(`B${row}`).font = { bold: true };

    // Auto-fit columns
    sheet.columns.forEach(column => {
      column.width = 15;
    });
  }

  private async populateDetailsSheet(
    sheet: ExcelJS.Worksheet,
    config: ReportConfig
  ): Promise<void> {

    // Add headers
    const headers = [
      'Category',
      'Parameter',
      'Quantity',
      'UOM',
      'Emission Factor',
      'Emissions (tCO2e)',
      'Data Quality'
    ];

    sheet.addRow(headers);
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    sheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    // Fetch detailed data
    const details = await this.fetchDetailedData(config);

    // Populate rows
    details.forEach(record => {
      sheet.addRow([
        record.category,
        record.parameter,
        record.quantity,
        record.uom,
        record.emissionFactor,
        record.emission,
        this.getQualityLabel(record.qualityScore)
      ]);
    });

    // Add data validation for quality
    sheet.getColumn(7).eachCell((cell, rowNumber) => {
      if (rowNumber > 1) {
        cell.dataValidation = {
          type: 'list',
          allowBlank: false,
          formulae: ['"Measured,Calculated,Estimated,Proxy"']
        };
      }
    });

    // Freeze header row
    sheet.views = [{ state: 'frozen', ySplit: 1 }];

    // Auto-filter
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: sheet.rowCount, column: headers.length }
    };
  }
}
```

---

### 5.2 Report Scheduling Engine

#### Scheduler Implementation

```typescript
import { CronJob } from 'cron';

class ReportScheduler {
  private jobs: Map<string, CronJob> = new Map();

  async start(): Promise<void> {
    // Load all active schedules from database
    const schedules = await this.scheduleRepository.find({
      enabled: true,
      nextRunAt: { $lte: new Date() }
    });

    for (const schedule of schedules) {
      await this.registerSchedule(schedule);
    }

    logger.info(`Scheduler started with ${schedules.length} active schedules`);
  }

  async registerSchedule(schedule: ReportSchedule): Promise<void> {
    // Convert frequency to cron expression
    const cronExpression = schedule.cronExpression ||
      this.frequencyToCron(schedule.frequency);

    // Create cron job
    const job = new CronJob(
      cronExpression,
      async () => await this.executeSchedule(schedule.scheduleId),
      null,
      true,  // Start immediately
      schedule.timezone
    );

    this.jobs.set(schedule.scheduleId, job);

    logger.info('Schedule registered', {
      scheduleId: schedule.scheduleId,
      name: schedule.name,
      cronExpression,
      nextRun: job.nextDate().toISO()
    });
  }

  private frequencyToCron(frequency: string): string {
    switch (frequency) {
      case 'daily':
        return '0 9 * * *';        // 9 AM daily
      case 'weekly':
        return '0 9 * * 1';        // 9 AM every Monday
      case 'monthly':
        return '0 9 1 * *';        // 9 AM first day of month
      case 'quarterly':
        return '0 9 1 */3 *';      // 9 AM first day of quarter
      case 'annually':
        return '0 9 1 1 *';        // 9 AM Jan 1st
      default:
        throw new Error(`Unknown frequency: ${frequency}`);
    }
  }

  async executeSchedule(scheduleId: string): Promise<void> {
    const schedule = await this.scheduleRepository.findOne({ scheduleId });

    if (!schedule || !schedule.enabled) {
      logger.warn('Schedule not found or disabled', { scheduleId });
      return;
    }

    logger.info('Executing schedule', {
      scheduleId,
      name: schedule.name
    });

    try {
      // Generate report
      const report = await this.reportGenerator.generate({
        reportType: schedule.reportType,
        format: schedule.format,
        templateId: schedule.templateId,
        ...schedule.filters
      });

      // Distribute report
      await this.distributeReport(report, schedule.recipients, {
        subject: this.populateEmailTemplate(schedule.emailSubject || '', schedule),
        body: this.populateEmailTemplate(schedule.emailBody || '', schedule)
      });

      // Update schedule
      await this.scheduleRepository.updateOne(
        { scheduleId },
        {
          lastRunAt: new Date(),
          lastReportId: report.reportId,
          lastStatus: 'success',
          'stats.totalRuns': { $inc: 1 },
          'stats.successfulRuns': { $inc: 1 }
        }
      );

      logger.info('Schedule executed successfully', {
        scheduleId,
        reportId: report.reportId
      });

    } catch (error) {
      logger.error('Schedule execution failed', {
        scheduleId,
        error: error.message
      });

      // Update schedule with error
      await this.scheduleRepository.updateOne(
        { scheduleId },
        {
          lastRunAt: new Date(),
          lastStatus: 'failed',
          'stats.totalRuns': { $inc: 1 },
          'stats.failedRuns': { $inc: 1 },
          'stats.lastErrorMessage': error.message
        }
      );

      // Send failure notification
      await this.sendFailureNotification(schedule, error);
    }
  }

  private populateEmailTemplate(template: string, schedule: ReportSchedule): string {
    return template
      .replace('{schedule_name}', schedule.name)
      .replace('{project_name}', schedule.filters.projectName || 'Unknown')
      .replace('{reporting_period}', this.formatReportingPeriod(schedule))
      .replace('{next_run}', schedule.nextRunAt.toISOString());
  }
}
```

---

### 5.3 Email Distribution

#### Email Service

```typescript
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

class EmailDistributionService {
  private sesClient: SESClient;

  constructor() {
    this.sesClient = new SESClient({
      region: process.env.AWS_REGION,
      endpoint: process.env.LOCALSTACK_ENDPOINT  // For local dev
    });
  }

  async sendReportEmail(
    recipients: string[],
    report: Report,
    options: {
      subject?: string;
      body?: string;
    }
  ): Promise<void> {

    // Generate presigned URL for report download
    const downloadUrl = await this.s3Service.generatePresignedUrl(
      report.file.s3Bucket,
      report.file.s3Key,
      { expiresIn: 604800 }  // 7 days
    );

    // Compile email template
    const emailHtml = this.compileEmailTemplate({
      reportName: report.reportType,
      projectName: report.projectName,
      year: report.year,
      downloadUrl,
      summary: report.summary,
      customBody: options.body
    });

    // Send email to each recipient
    for (const recipient of recipients) {
      try {
        const command = new SendEmailCommand({
          Source: 'noreply@clenergize.com',
          Destination: {
            ToAddresses: [recipient]
          },
          Message: {
            Subject: {
              Data: options.subject || `[Clenergize] ${report.reportType} Report - ${report.year}`
            },
            Body: {
              Html: {
                Data: emailHtml
              },
              Text: {
                Data: this.stripHtml(emailHtml)
              }
            }
          },
          ReplyToAddresses: ['support@clenergize.com']
        });

        await this.sesClient.send(command);

        logger.info('Report email sent', {
          reportId: report.reportId,
          recipient
        });

        // Track delivery
        await this.trackEmailDelivery(report.reportId, recipient, 'sent');

      } catch (error) {
        logger.error('Failed to send report email', {
          reportId: report.reportId,
          recipient,
          error: error.message
        });

        await this.trackEmailDelivery(report.reportId, recipient, 'failed', error.message);
      }
    }
  }

  private compileEmailTemplate(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .header { background: #4472C4; color: white; padding: 20px; }
          .content { padding: 20px; }
          .summary-box { background: #F3F4F6; padding: 15px; margin: 20px 0; }
          .button { background: #4472C4; color: white; padding: 12px 24px; text-decoration: none; display: inline-block; }
          .footer { background: #F3F4F6; padding: 15px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Clenergize Emission Report</h1>
        </div>

        <div class="content">
          <p>Dear Stakeholder,</p>

          <p>Your ${data.reportName} report for ${data.projectName} (${data.year}) is ready for download.</p>

          ${data.customBody || ''}

          <div class="summary-box">
            <h3>Report Summary</h3>
            <ul>
              <li><strong>Total Emissions:</strong> ${data.summary?.totalEmissions?.toFixed(2) || 'N/A'} tCO2e</li>
              <li><strong>Scope 1:</strong> ${data.summary?.scope1?.toFixed(2) || 'N/A'} tCO2e</li>
              <li><strong>Scope 2:</strong> ${data.summary?.scope2?.toFixed(2) || 'N/A'} tCO2e</li>
              <li><strong>Scope 3:</strong> ${data.summary?.scope3?.toFixed(2) || 'N/A'} tCO2e</li>
              <li><strong>Data Quality:</strong> ${data.summary?.dataQuality?.toFixed(1) || 'N/A'}%</li>
            </ul>
          </div>

          <p style="text-align: center; margin: 30px 0;">
            <a href="${data.downloadUrl}" class="button">Download Report</a>
          </p>

          <p style="font-size: 12px; color: #666;">
            <em>This link will expire in 7 days.</em>
          </p>
        </div>

        <div class="footer">
          <p>
            This is an automated email from Clenergize.
            <a href="{{unsubscribe_url}}">Unsubscribe</a>
          </p>
          <p>&copy; ${new Date().getFullYear()} Clenergize. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }
}
```

---

## 6. Integration Points

### 6.1 Calculation Service

**Dependency Type**: Strong (Upstream)

**Integration Method**: Event-Driven

**Events Consumed**:
```typescript
'calculation.emission.calculated.v1' => Invalidate dashboard cache
'calculation.rollup.completed.v1' => Update dashboard aggregations
'calculation.batch.completed.v1' => Trigger scheduled reports if configured
```

**Event Handler**:
```typescript
@EventsHandler('calculation.emission.calculated.v1')
async onCalculationCompleted(event: CalculationCompletedEvent) {
  // Invalidate dashboard cache for this project/year
  await this.cachingService.invalidateDashboardCache(
    event.data.projectId,
    event.data.year
  );

  // Check if any scheduled reports are waiting for this data
  const pendingSchedules = await this.scheduleRepository.find({
    'filters.projectId': event.data.projectId,
    status: 'waiting_for_data'
  });

  for (const schedule of pendingSchedules) {
    await this.queueReportGeneration(schedule);
  }
}
```

---

### 6.2 Organization Service

**Dependency Type**: Moderate (Upstream)

**Integration Method**: REST + Cache

**REST Calls**:
```typescript
GET /v1/projects/{projectId}
  Purpose: Get project name for report header
  Cache: 1 hour

GET /v1/entities/{entityId}
  Purpose: Get entity name for report details
  Cache: 1 hour

GET /v1/hierarchy/tree?projectId={projectId}
  Purpose: Build entity hierarchy for report structure
  Cache: 1 hour
```

---

### 6.3 Identity Service

**Dependency Type**: Moderate (Upstream)

**Integration Method**: REST

**REST Calls**:
```typescript
GET /v1/users/{userId}
  Purpose: Get user details for report distribution
  Cache: 30 minutes

GET /v1/users/by-role?role=sustainability-manager&organizationId={orgId}
  Purpose: Get default recipients for organization reports
  Cache: 15 minutes
```

---

### 6.4 Reference Service

**Dependency Type**: Weak (Upstream)

**Integration Method**: REST + Cache

**REST Calls**:
```typescript
GET /v1/parameters/{parameterId}
  Purpose: Get parameter name/metadata for report display
  Cache: 24 hours

GET /v1/categories
  Purpose: Get category list for report filtering
  Cache: 24 hours
```

---

### 6.5 Audit Service

**Dependency Type**: Weak (Downstream)

**Integration Method**: Event-Driven

**Events Published**:
```typescript
'reporting.report.generated.v1' => Log report generation
'reporting.export.completed.v1' => Log data export
'reporting.schedule.executed.v1' => Log scheduled report execution
'reporting.distribution.sent.v1' => Log email distribution
```

---

### 6.6 Frontend

**Integration Method**: REST API + WebSocket (optional)

**Key Endpoints Used**:
- `POST /v1/reports/generate` - Ad-hoc report generation
- `GET /v1/dashboard/summary` - Dashboard widget data
- `POST /v1/exports/activity-data` - Data export
- `POST /v1/schedules/create` - Create scheduled report

**WebSocket** (optional real-time updates):
```typescript
// Client subscribes to report status updates
socket.on('report:status', (reportId, status) => {
  updateReportStatus(reportId, status);
});

// Server emits updates
io.to(`report:${reportId}`).emit('report:status', reportId, 'generating');
io.to(`report:${reportId}`).emit('report:status', reportId, 'completed');
```

---

## 7. Non-Functional Requirements

### 7.1 Performance

| Metric | Target | Critical Path |
|--------|--------|---------------|
| **Dashboard Query** | < 200ms p95 | Redis caching |
| **PDF Generation** | < 10s for 50-page report | Puppeteer optimization |
| **Excel Generation** | < 5s for 10k rows | Streaming write |
| **CSV Export** | < 30s for 100k rows | Streaming pipeline |
| **Email Delivery** | < 5s per recipient | SES batch send |
| **Cache Hit Ratio** | > 85% for dashboards | Smart invalidation |

**Optimization Strategies**:
- Dashboard data cached with 5-minute TTL
- Report generation queued (non-blocking)
- Large exports use streaming to avoid memory issues
- Parallel PDF rendering for multi-section reports

### 7.2 Scalability

**Horizontal Scaling**:
- Stateless service design (can run multiple instances)
- Queue-based report generation (SQS)
- S3 for file storage (infinite scale)
- Redis for distributed caching

**Data Volume Targets**:
- 1000+ reports generated per day
- 10k+ dashboard queries per minute
- 100+ concurrent exports
- 500+ active scheduled reports

**Resource Limits**:
```yaml
Container Resources:
  CPU: 1 core (request), 2 cores (limit)
  Memory: 1Gi (request), 2Gi (limit)

Puppeteer (PDF):
  Max Concurrent: 5 instances
  Memory per Instance: 256Mi
  Timeout: 60s

File Size Limits:
  PDF: 50 MB
  Excel: 100 MB
  CSV: 500 MB (auto-compress to ZIP)
```

### 7.3 Reliability

**Error Handling**:
- Retry failed report generation (max 3 attempts)
- Dead letter queue for persistent failures
- Graceful degradation (serve stale cache if generation fails)
- Circuit breaker for external service calls

**Queue Consumer** (fixes OLD infinite loop issue):
```typescript
// ✅ CORRECT: Proper shutdown handling
class ReportQueueConsumer {
  private isRunning = false;

  async start() {
    this.isRunning = true;

    // Graceful shutdown handler
    process.on('SIGTERM', () => this.stop());
    process.on('SIGINT', () => this.stop());

    while (this.isRunning) {
      try {
        const messages = await this.receiveMessages();

        if (messages.length > 0) {
          await this.processMessages(messages);
        }

        // Check shutdown flag
        if (!this.isRunning) break;

      } catch (error) {
        logger.error('Queue consumer error', error);
        await this.backoff();
      }
    }

    logger.info('Queue consumer stopped gracefully');
  }

  stop() {
    logger.info('Shutdown signal received');
    this.isRunning = false;
  }

  private async backoff() {
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}
```

### 7.4 Security

**Input Validation**:
```typescript
const GenerateReportSchema = z.object({
  reportType: z.enum(['ghg-protocol', 'scope-analysis', 'trend', 'custom']),
  format: z.enum(['pdf', 'excel', 'csv']),
  projectId: z.string().uuid(),
  year: z.number().min(2000).max(2100),
  entityIds: z.array(z.string().uuid()).max(100).optional(),
  recipients: z.array(z.string().email()).max(50).optional()
});
```

**File Storage Security**:
- All reports stored in private S3 bucket
- Presigned URLs with expiration (7 days)
- Encryption at rest (AES-256)
- Encryption in transit (TLS 1.3)

**Access Control**:
- Reports inherit permissions from source project
- Only project members can generate reports
- Only admins can create organization templates
- Email recipients validated against project access

### 7.5 Observability

**Metrics** (Prometheus):
```yaml
report_generation_total:
  Type: Counter
  Labels: [report_type, format, status]

report_generation_duration_seconds:
  Type: Histogram
  Labels: [report_type, format]

dashboard_query_duration_seconds:
  Type: Histogram
  Labels: [widget_type]

cache_hit_rate:
  Type: Gauge
  Labels: [cache_type]

scheduled_reports_executed_total:
  Type: Counter
  Labels: [status]

email_delivery_total:
  Type: Counter
  Labels: [status]
```

**Logging**:
```typescript
logger.info('Report generation started', {
  reportId,
  reportType,
  format,
  projectId,
  estimatedDuration
});

logger.info('Report generation completed', {
  reportId,
  duration: endTime - startTime,
  fileSize: report.file.fileSize,
  recordCount: report.summary.recordCount
});

logger.error('Report generation failed', {
  reportId,
  error: error.message,
  attempt: attemptNumber
});
```

---

## 8. Testing Strategy

### 8.1 Unit Tests

**Coverage Target**: 80%+

**Key Test Cases**:
```typescript
describe('PDFReportGenerator', () => {
  it('should generate PDF with correct sections', async () => {
    const pdf = await generator.generateReport(config, template);
    expect(pdf).toBeInstanceOf(Buffer);
    expect(pdf.length).toBeGreaterThan(0);
  });

  it('should apply branding to PDF', async () => {
    const pdf = await generator.generateReport(config, templateWithBranding);
    // Verify branding elements present
  });

  it('should handle missing data gracefully', async () => {
    const pdf = await generator.generateReport(configWithMissingData, template);
    expect(pdf).toBeDefined();
  });
});

describe('EmailDistributionService', () => {
  it('should send email to all recipients', async () => {
    await service.sendReportEmail(['user1@example.com', 'user2@example.com'], report);
    expect(sesClient.send).toHaveBeenCalledTimes(2);
  });

  it('should generate presigned URL with correct expiration', async () => {
    const url = await service.generateDownloadUrl(report);
    expect(url).toContain('X-Amz-Expires=604800');  // 7 days
  });
});
```

### 8.2 Integration Tests

**Coverage Target**: 70%+

**Key Test Scenarios**:
```typescript
describe('Report Generation Integration', () => {
  it('should generate report end-to-end', async () => {
    // 1. Trigger report generation
    const response = await request(app)
      .post('/v1/reports/generate')
      .send({ projectId, year: 2024, reportType: 'ghg-protocol', format: 'pdf' })
      .expect(202);

    // 2. Poll for completion
    const reportId = response.body.reportId;
    const report = await pollReportStatus(reportId, { timeout: 60000 });

    // 3. Verify report completed
    expect(report.status).toBe('completed');
    expect(report.file).toBeDefined();

    // 4. Download report
    const downloadResponse = await request(app)
      .get(`/v1/reports/${reportId}/download`)
      .expect(200);

    expect(downloadResponse.body.url).toContain('s3');
  });

  it('should handle concurrent report generation', async () => {
    // Generate 10 reports simultaneously
    const promises = Array.from({ length: 10 }, (_, i) =>
      request(app)
        .post('/v1/reports/generate')
        .send({ projectId, year: 2024, reportType: 'scope-analysis' })
    );

    const responses = await Promise.all(promises);
    expect(responses.every(r => r.status === 202)).toBe(true);
  });
});
```

### 8.3 E2E Tests

**Tool**: Cypress

**Test Flows**:
```typescript
describe('E2E: Report Generation Flow', () => {
  it('should generate and download report from dashboard', async () => {
    // 1. Login
    await cy.login('pm@example.com', 'password');

    // 2. Navigate to reports page
    await cy.visit('/projects/123/reports');

    // 3. Generate new report
    await cy.get('[data-testid="generate-report-btn"]').click();
    await cy.get('[data-testid="report-type"]').select('GHG Protocol');
    await cy.get('[data-testid="format"]').select('PDF');
    await cy.get('[data-testid="submit"]').click();

    // 4. Wait for generation
    await cy.contains('Report generated successfully', { timeout: 60000 });

    // 5. Download report
    await cy.get('[data-testid="download-btn"]').click();

    // 6. Verify file downloaded
    await cy.verifyDownload('GHG_Protocol_Report_2024.pdf');
  });
});
```

---

## 9. Deployment Configuration

### 9.1 Environment Variables

```bash
# Service Configuration
NODE_ENV=development|production
SERVICE_NAME=reporting-service
PORT=3006

# Database
MONGODB_URI=mongodb://admin:password@mongodb:27017/clenergize_reporting?authSource=admin

# Redis
REDIS_URL=redis://redis:6379
REDIS_CACHE_DB=0
DASHBOARD_CACHE_TTL=300  # 5 minutes

# AWS Services
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<secret>
AWS_SECRET_ACCESS_KEY=<secret>
LOCALSTACK_ENDPOINT=http://localstack:4566  # Local dev only

# S3
S3_REPORTS_BUCKET=clenergize-reports
S3_PRESIGNED_URL_EXPIRY=604800  # 7 days

# SQS
SQS_REPORT_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/123456789/report-generation
SQS_MAX_MESSAGES=10
SQS_VISIBILITY_TIMEOUT=300  # 5 minutes
SQS_WAIT_TIME_SECONDS=20    # Long polling

# SES
SES_FROM_EMAIL=noreply@clenergize.com
SES_REPLY_TO_EMAIL=support@clenergize.com

# Service Dependencies
CALCULATION_SERVICE_URL=http://calculation-service:3005
ORGANIZATION_SERVICE_URL=http://organization-service:3002
IDENTITY_SERVICE_URL=http://identity-service:3001
REFERENCE_SERVICE_URL=http://reference-service:3003

# Report Generation
PDF_MAX_CONCURRENT=5
PDF_TIMEOUT_MS=60000
EXCEL_MAX_ROWS=1000000
CSV_MAX_ROWS=10000000
EXPORT_ZIP_THRESHOLD=10485760  # 10 MB

# Feature Flags
ENABLE_SCHEDULED_REPORTS=true
ENABLE_EMAIL_DISTRIBUTION=true
ENABLE_WEBSOCKET_UPDATES=false
```

### 9.2 Docker Configuration

**Dockerfile**:
```dockerfile
FROM node:24-alpine AS builder

WORKDIR /app

# Install Puppeteer dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:24-alpine

WORKDIR /app

# Install Chromium
RUN apk add --no-cache chromium

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production
EXPOSE 3006

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3006/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

CMD ["node", "dist/main.js"]
```

**docker-compose.yml** (excerpt):
```yaml
reporting-service:
  build:
    context: ./NEW/reporting-service
    dockerfile: Dockerfile.dev
  container_name: clenergize-reporting-service
  restart: unless-stopped
  ports:
    - "3006:3006"
    - "9006:9229"  # Debug port
  environment:
    - NODE_ENV=development
    - PORT=3006
    - MONGODB_URI=mongodb://admin:localdev123@mongodb:27017/clenergize_reporting?authSource=admin
    - REDIS_URL=redis://redis:6379
    - S3_REPORTS_BUCKET=clenergize-reports-local
    - LOCALSTACK_ENDPOINT=http://localstack:4566
    - CALCULATION_SERVICE_URL=http://calculation-service:3005
  volumes:
    - ./NEW/reporting-service:/app
    - /app/node_modules
  depends_on:
    - mongodb
    - redis
    - localstack
    - calculation-service
  command: npm run start:dev
```

---

## 10. Migration from OLD System

### 10.1 Current State Analysis

**OLD Service**: `clenergizeV3-backend-ms-dev`

**Critical Issues**:
1. **Infinite SQS Loop**: No graceful shutdown, runs forever
2. **Mixed Concerns**: Report generation mixed with API gateway logic
3. **No Templating**: Hardcoded report layouts
4. **Synchronous Generation**: Blocks API requests
5. **No Scheduling**: Manual report generation only
6. **No Caching**: Recalculates dashboard on every request

**OLD Report Generation** (problematic):
```typescript
// ❌ OLD: Synchronous, blocks request
app.get('/api/reports/generate', async (req, res) => {
  const data = await fetchData();  // Slow query
  const pdf = await generatePDF(data);  // Slow PDF generation
  res.send(pdf);  // Client waits 30+ seconds!
});

// ❌ OLD: Infinite loop
while (true) {
  const messages = await sqs.receiveMessage({ ... });
  processMessages(messages);
  // NO BREAK - runs forever!
}
```

### 10.2 Migration Strategy

#### Phase 1: Parallel Run (Week 1-2)

**Goal**: Run NEW service alongside OLD, compare outputs

**Approach**:
```typescript
// Dual-generation pattern
async function generateReportWithComparison(config: ReportConfig) {
  // Generate with NEW system
  const newReport = await newReportService.generate(config);

  // Generate with OLD system (for comparison)
  const oldReport = await oldReportService.generate(config);

  // Compare outputs
  const diff = await compareReports(newReport, oldReport);

  if (diff.hasSignificantDifference) {
    logger.warn('Report mismatch detected', {
      configHash: hashConfig(config),
      differences: diff.details
    });

    await reviewQueue.add({ newReport, oldReport, diff });
  }

  // Return NEW report (but keep OLD for backup)
  return newReport;
}
```

#### Phase 2: Feature Parity (Week 3-4)

**Checklist**:
- ✅ All OLD report types migrated
- ✅ Dashboard queries optimized (< 200ms)
- ✅ PDF/Excel generation working
- ✅ Email distribution implemented
- ✅ Scheduled reports functional
- ✅ Cache invalidation working

#### Phase 3: Cutover (Week 5)

**Steps**:
1. Freeze OLD service (read-only mode)
2. Migrate scheduled report configurations
3. Switch frontend to NEW service endpoints
4. Monitor for errors (24-hour observation)
5. Decommission OLD service if no issues

**Rollback Plan**:
- Keep OLD service running in standby for 30 days
- Feature flag to switch back to OLD if critical issues
- Database backup before migration

### 10.3 Data Migration

**Report History**:
```typescript
// Migrate OLD report records to NEW schema
async function migrateReportHistory() {
  const oldReports = await oldDb.collection('reports').find({}).toArray();

  for (const oldReport of oldReports) {
    await newDb.collection('reports').insertOne({
      reportId: oldReport._id.toString(),
      reportType: mapOldReportType(oldReport.type),
      format: oldReport.format || 'pdf',
      projectId: oldReport.projectId,
      year: oldReport.year,
      status: 'completed',  // All historical reports are completed
      file: {
        s3Key: oldReport.fileKey,
        s3Bucket: 'clenergize-reports-legacy',
        fileName: oldReport.fileName,
        fileSize: oldReport.fileSize,
        mimeType: guessMimeType(oldReport.format)
      },
      summary: extractSummary(oldReport),
      generatedBy: oldReport.userId,
      createdAt: oldReport.createdAt,
      updatedAt: oldReport.updatedAt
    });
  }

  logger.info(`Migrated ${oldReports.length} historical reports`);
}
```

---

## Appendix A: Report Template Examples

### GHG Protocol Report Template

```json
{
  "templateId": "template-ghg-protocol-v1",
  "name": "GHG Protocol Inventory Report",
  "type": "system",
  "reportType": "ghg-protocol",
  "sections": [
    {
      "id": "executive-summary",
      "title": "Executive Summary",
      "type": "summary",
      "order": 1,
      "dataSource": "aggregated_totals"
    },
    {
      "id": "scope-breakdown",
      "title": "Emissions by Scope",
      "type": "chart",
      "order": 2,
      "visualization": {
        "chartType": "pie",
        "groupBy": "scope"
      }
    },
    {
      "id": "category-table",
      "title": "Emissions by Category",
      "type": "table",
      "order": 3,
      "dataSource": "emissions_by_category",
      "sortBy": { "field": "emission", "direction": "desc" }
    },
    {
      "id": "methodology",
      "title": "Calculation Methodology",
      "type": "text",
      "order": 4
    }
  ],
  "branding": {
    "colors": {
      "primary": "#4472C4",
      "secondary": "#70AD47",
      "accent": "#FFC000"
    }
  }
}
```

---

## Appendix B: Error Codes

| Code | Error | Description | Resolution |
|------|-------|-------------|------------|
| `REPORT-001` | `ReportGenerationFailedError` | Report generation failed | Check logs, retry |
| `REPORT-002` | `TemplateNotFoundError` | Template doesn't exist | Check template ID |
| `REPORT-003` | `InvalidReportConfigError` | Invalid report configuration | Validate request |
| `REPORT-004` | `DataNotAvailableError` | Required data not available | Wait for calculations |
| `REPORT-005` | `ExportTooLargeError` | Export exceeds size limit | Apply filters |
| `REPORT-006` | `ScheduleNotFoundError` | Schedule doesn't exist | Check schedule ID |
| `REPORT-007` | `EmailDeliveryFailedError` | Email delivery failed | Check email address |
| `REPORT-008` | `S3UploadFailedError` | S3 upload failed | Check S3 permissions |

---

## Appendix C: Event Schemas

### `reporting.report.generated.v1`

```typescript
{
  id: string;
  type: 'reporting.report.generated.v1';
  version: '1.0.0';
  occurredAt: string;
  aggregateId: string;             // Report ID
  aggregateType: 'Report';
  correlationId: string;
  data: {
    reportId: string;
    reportType: string;
    format: string;
    projectId: string;
    year: number;
    fileSize: number;
    generatedBy: string;
    duration: number;              // Generation time (ms)
  };
}
```

---

**END OF SPECIFICATION**

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-18 | Reporting Agent | Initial specification |

**Next Review**: End of Week 1 (Design Phase)

**Stakeholder Approval**: [ ] Architecture Agent [ ] Security Agent [ ] Master Coordinator
