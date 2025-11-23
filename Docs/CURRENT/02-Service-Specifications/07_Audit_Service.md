# PHASE 3: Service Specification - Audit Service

**Version**: 1.0.0
**Status**: Design Phase
**Last Updated**: November 18, 2025
**Owner**: Audit Agent

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

The **Audit Service** is the compliance and security engine of the Clenergize V3 platform, responsible for:

- **Audit Logging**: Capture all system events for compliance and debugging
- **Event Sourcing**: Store complete event history for event replay
- **Compliance Tracking**: GDPR, SOC2, ISO 14064 compliance support
- **Access Logging**: Track all data access for security audits
- **Data Lineage**: Trace data from source to calculated emission to report
- **Change History**: Track all modifications to entities
- **Tamper Detection**: Verify audit log integrity
- **Retention Management**: Enforce data retention policies

### 1.2 Bounded Context

**Domain**: Audit & Compliance Context (part of Platform Support Domain)

**Responsibilities**:
- Log all domain events from all services
- Provide audit trail queries
- Track GDPR data subject requests
- Maintain tamper-proof event log
- Generate compliance reports
- Manage data retention policies

**NOT Responsible For**:
- Business logic (handled by domain services)
- User authentication (Identity Service)
- Report generation (Reporting Service)
- Data storage beyond audit logs

### 1.3 Technology Stack

```yaml
Framework: NestJS 10+ (TypeScript)
Database: MongoDB 7+ (audit_events, access_logs, compliance_requests)
Time-Series DB: TimescaleDB (optional, for high-volume event storage)
Cache: Redis 7+ (event deduplication)
Queue: AWS SQS (async event ingestion)
Storage: AWS S3 (long-term event archive)
Event Bus: AWS EventBridge (consumes all events)
Encryption: AWS KMS (audit log encryption)
Validation: Zod
Testing: Jest, Supertest
Documentation: OpenAPI 3.1 (Swagger)
```

### 1.4 Service Dependencies

```mermaid
graph TD
    ALL[All Services] -->|All Domain Events| A[Audit Service]
    A -->|Store| MONGO[(MongoDB)]
    A -->|Archive| S3[(S3)]
    A -->|Dedupe| REDIS[(Redis)]
    A -->|Compliance Reports| REPORT[Reporting Service]
```

**Upstream Dependencies** (Services we depend on):
- ALL SERVICES: Consume domain events from all 6 services
- Identity Service: User details for audit records

**Downstream Consumers** (Services that depend on us):
- Reporting Service: Compliance reports
- Frontend: Audit trail views
- External Auditors: Export audit logs

---

## 2. Functional Requirements

### 2.1 Core Features

#### F-AUDIT-001: Event Logging
**Description**: Capture all domain events from all services

**Event Categories**:
1. **Identity Events**: User created, authenticated, role assigned, password changed
2. **Organization Events**: Project created, hierarchy modified, entity added
3. **Reference Events**: Emission factor created, parameter updated
4. **Activity Events**: Data ingested, verified, updated, deleted
5. **Calculation Events**: Emission calculated, aggregation completed, scenario run
6. **Reporting Events**: Report generated, exported, distributed
7. **System Events**: Service started, configuration changed, error occurred

**Acceptance Criteria**:
- Capture 100% of domain events (no loss)
- Enrich events with contextual metadata (user, IP, timestamp)
- Store events immutably (append-only)
- Deduplicate events using event ID
- Archive events after retention period
- Support event replay for debugging

**Event Enrichment**:
```typescript
interface EnrichedAuditEvent {
  // Original event
  ...domainEvent,

  // Enrichment
  audit: {
    receivedAt: Date;          // When audit service received it
    processedAt: Date;         // When processed
    sourceService: string;     // Originating service
    sourceIp?: string;         // Client IP (if HTTP request)
    userAgent?: string;        // Client user agent
    userId?: string;           // Executing user
    organizationId?: string;   // Tenant/org
    sessionId?: string;        // Session ID
    requestId?: string;        // Trace ID
    geolocation?: {
      country: string;
      region: string;
      city: string;
    };
  };

  // Integrity
  integrity: {
    hash: string;              // SHA-256 hash of event data
    previousHash?: string;     // Hash of previous event (hash chain)
    signature?: string;        // Digital signature (optional)
  };
}
```

---

#### F-AUDIT-002: Audit Trail Queries
**Description**: Query audit logs for compliance and debugging

**Query Capabilities**:
- By user: "Show all actions by user@example.com"
- By entity: "Show all changes to project-123"
- By time range: "Show events from 2024-01-01 to 2024-12-31"
- By event type: "Show all user.created events"
- By service: "Show all events from calculation-service"
- Full-text search: "Find events containing 'emission factor updated'"

**Acceptance Criteria**:
- Response time <500ms for typical queries
- Support pagination (up to 1M events per query)
- Export results to CSV, JSON
- Support complex filters (AND, OR, NOT)
- Highlight related events (same correlation ID)

**Example Query**:
```typescript
{
  filters: {
    eventType: 'activity.data.verified.v1',
    dateRange: {
      from: '2024-01-01T00:00:00Z',
      to: '2024-12-31T23:59:59Z'
    },
    userId: '123e4567-e89b-12d3-a456-426614174000',
    projectId: 'abc123'
  },
  sort: { field: 'occurredAt', direction: 'desc' },
  page: 1,
  limit: 100
}
```

---

#### F-AUDIT-003: GDPR Compliance
**Description**: Support GDPR data subject rights

**GDPR Operations**:
1. **Right to Access**: Export all data for a user
2. **Right to Erasure**: Delete/anonymize user data
3. **Right to Rectification**: Track data corrections
4. **Right to Portability**: Export data in machine-readable format
5. **Right to Object**: Track opt-out requests

**Acceptance Criteria**:
- Process GDPR requests within 30 days (legal requirement)
- Generate GDPR data export in JSON format
- Anonymize user data while preserving audit trail
- Track all GDPR requests and completions
- Provide proof of deletion for regulators

**GDPR Data Export Example**:
```json
{
  "subject": {
    "userId": "user-123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "exportDate": "2024-11-18T10:00:00Z",
  "dataCategories": {
    "identity": {
      "user": { ... },
      "sessions": [ ... ],
      "loginHistory": [ ... ]
    },
    "activity": {
      "projects": [ ... ],
      "activityData": [ ... ],
      "verifications": [ ... ]
    },
    "audit": {
      "events": [ ... ],
      "accessLogs": [ ... ]
    }
  },
  "retentionPolicies": {
    "identity": "7 years",
    "activity": "10 years",
    "audit": "10 years"
  }
}
```

---

#### F-AUDIT-004: Data Lineage Tracking
**Description**: Trace data from source to report

**Lineage Graph**:
```
Activity Data (ingested)
  → Verified by User A at 2024-01-15
  → Calculated using Emission Factor v2.1 at 2024-01-16
  → Aggregated in Hierarchy Rollup at 2024-01-17
  → Included in GHG Protocol Report #789 at 2024-01-18
  → Exported to Excel by User B at 2024-01-20
```

**Acceptance Criteria**:
- Build lineage graph from event stream
- Support forward and backward tracing
- Visualize lineage in UI (DAG)
- Identify data quality issues in lineage
- Export lineage for external auditors

**Lineage Query**:
```typescript
// Trace forward: "Where did this activity data end up?"
const lineage = await auditService.traceLineage({
  entityType: 'ActivityData',
  entityId: 'activity-123',
  direction: 'forward'
});

// Result:
[
  { event: 'activity.data.verified.v1', timestamp: '2024-01-15' },
  { event: 'calculation.emission.calculated.v1', timestamp: '2024-01-16' },
  { event: 'calculation.rollup.completed.v1', timestamp: '2024-01-17' },
  { event: 'reporting.report.generated.v1', timestamp: '2024-01-18' }
]
```

---

#### F-AUDIT-005: Access Logging
**Description**: Track all data access for security audits

**Access Types**:
- **Read**: User viewed sensitive data (PII, emissions)
- **Write**: User created/updated/deleted data
- **Export**: User exported data
- **Admin**: Admin performed privileged operation

**Acceptance Criteria**:
- Log all access to sensitive resources
- Include who, what, when, where, why
- Detect anomalous access patterns
- Alert on suspicious activity
- Support forensic analysis

**Access Log Entry**:
```typescript
interface AccessLog {
  accessId: string;
  timestamp: Date;

  // Who
  userId: string;
  userEmail: string;
  userRole: string;

  // What
  action: 'read' | 'write' | 'delete' | 'export' | 'admin';
  resourceType: 'user' | 'project' | 'activityData' | 'emissionFactor';
  resourceId: string;

  // Where
  sourceIp: string;
  country: string;
  userAgent: string;

  // How
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  httpStatus: number;

  // Why (optional)
  reason?: string;             // E.g., "Annual audit preparation"

  // Security
  sensitivityLevel: 'public' | 'internal' | 'confidential' | 'restricted';
  dataClassification?: 'PII' | 'FinancialData' | 'EmissionData';
}
```

---

#### F-AUDIT-006: Retention Management
**Description**: Enforce data retention policies

**Retention Policies**:
```yaml
Event Type Retention:
  - identity.user.created: 7 years (legal requirement)
  - activity.data.ingested: 10 years (GHG Protocol)
  - calculation.emission.calculated: 10 years
  - reporting.report.generated: 10 years
  - system.error.occurred: 1 year
  - access.data.read: 3 years (security audit)

Storage Tiers:
  - Hot (MongoDB): 0-1 year (fast queries)
  - Warm (S3 Standard): 1-3 years (slower queries)
  - Cold (S3 Glacier): 3-10 years (archive, slow retrieval)
  - Delete: After retention period
```

**Acceptance Criteria**:
- Automatically archive events based on age
- Move to S3 after 1 year
- Move to Glacier after 3 years
- Delete after retention period (with proof)
- Support legal hold (freeze deletion)

**Archival Process**:
```typescript
async function archiveOldEvents() {
  // Find events older than 1 year
  const oldEvents = await auditEventRepository.find({
    'audit.receivedAt': { $lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
    archived: false
  });

  for (const event of oldEvents) {
    // Upload to S3
    await s3.upload({
      Bucket: 'clenergize-audit-archive',
      Key: `events/${event.occurredAt.getFullYear()}/${event.eventId}.json`,
      Body: JSON.stringify(event),
      ServerSideEncryption: 'aws:kms'
    });

    // Mark as archived
    await auditEventRepository.updateOne(
      { eventId: event.eventId },
      { archived: true, archivedAt: new Date() }
    );

    // Delete from hot storage (keep metadata only)
    await auditEventRepository.deleteOne({ eventId: event.eventId });
  }
}
```

---

#### F-AUDIT-007: Tamper Detection
**Description**: Ensure audit log integrity

**Integrity Mechanisms**:
1. **Hash Chain**: Each event contains hash of previous event
2. **Digital Signatures**: Sign critical events with private key
3. **Merkle Trees**: Periodic snapshots with Merkle root
4. **External Anchoring**: Publish hashes to blockchain (optional)

**Acceptance Criteria**:
- Detect any modification to past events
- Verify hash chain on demand
- Alert on integrity violations
- Provide cryptographic proof of non-tampering

**Hash Chain Verification**:
```typescript
async function verifyHashChain(
  startEventId: string,
  endEventId: string
): Promise<VerificationResult> {

  const events = await auditEventRepository.find({
    eventId: { $gte: startEventId, $lte: endEventId }
  }).sort({ occurredAt: 1 });

  let previousHash: string | null = null;

  for (const event of events) {
    // Recalculate hash
    const calculatedHash = this.calculateEventHash(event);

    // Verify hash matches stored value
    if (calculatedHash !== event.integrity.hash) {
      return {
        valid: false,
        tamperedEvent: event.eventId,
        reason: 'Hash mismatch - event data modified'
      };
    }

    // Verify hash chain
    if (previousHash && event.integrity.previousHash !== previousHash) {
      return {
        valid: false,
        tamperedEvent: event.eventId,
        reason: 'Hash chain broken - event inserted or deleted'
      };
    }

    previousHash = calculatedHash;
  }

  return { valid: true };
}

private calculateEventHash(event: AuditEvent): string {
  const data = {
    eventId: event.id,
    type: event.type,
    occurredAt: event.occurredAt,
    data: event.data
  };

  return crypto
    .createHash('sha256')
    .update(JSON.stringify(data))
    .digest('hex');
}
```

---

### 2.2 Compliance Standards Support

| Standard | Requirement | Audit Service Implementation |
|----------|-------------|------------------------------|
| **GDPR** | Right to Access | Export all user data in machine-readable format |
| **GDPR** | Right to Erasure | Anonymize user data while preserving audit trail |
| **SOC 2** | Access Control | Log all access to sensitive data |
| **SOC 2** | Change Management | Track all configuration changes |
| **ISO 14064-1** | Data Retention | Retain emission data for 10 years |
| **ISO 14064-1** | Data Quality | Track data quality indicators in audit logs |
| **GHG Protocol** | Transparency | Provide complete audit trail for calculations |
| **GHG Protocol** | Recalculation | Support event replay to reproduce results |

---

## 3. API Endpoints

### 3.1 Event Logging

#### `POST /v1/events`
**Description**: Ingest domain event (called by other services via event bus)

**Request**:
```typescript
{
  ...domainEvent,              // Standard domain event format
  context?: {
    sourceIp?: string;
    userAgent?: string;
    userId?: string;
    sessionId?: string;
  }
}
```

**Response** (202 Accepted):
```typescript
{
  eventId: string;
  receivedAt: string;
  queued: true;
}
```

**Note**: This endpoint is typically called via event bus, not directly by clients.

---

### 3.2 Audit Queries

#### `GET /v1/audit/events`
**Description**: Query audit events

**Query Parameters**:
- `eventType`: string (filter by event type)
- `userId`: string (filter by user)
- `projectId`: string (filter by project)
- `entityType`: string (filter by aggregate type)
- `entityId`: string (filter by aggregate ID)
- `startDate`: ISO 8601
- `endDate`: ISO 8601
- `search`: string (full-text search)
- `page`: number
- `limit`: number (max 1000)
- `sort`: 'asc' | 'desc'

**Response** (200 OK):
```typescript
{
  events: [
    {
      eventId: string;
      type: string;
      version: string;
      occurredAt: string;
      aggregateId: string;
      aggregateType: string;
      data: { ... };
      audit: {
        userId: string;
        userEmail: string;
        sourceIp: string;
        sourceService: string;
      };
    }
  ];
  pagination: {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
  };
  query: {
    filters: { ... };
    duration: number;          // Query execution time (ms)
  };
}
```

---

#### `GET /v1/audit/events/{eventId}`
**Description**: Get single event details

**Response** (200 OK):
```typescript
{
  // Full enriched audit event
  ...event,
  relatedEvents: [
    {
      eventId: string;
      type: string;
      relation: 'caused_by' | 'led_to' | 'same_correlation';
    }
  ];
}
```

---

#### `GET /v1/audit/events/{eventId}/lineage`
**Description**: Get data lineage for an event

**Query Parameters**:
- `direction`: 'forward' | 'backward' | 'both'
- `maxDepth`: number (default: 10)

**Response** (200 OK):
```typescript
{
  rootEvent: { ... };
  lineage: {
    nodes: [
      {
        eventId: string;
        type: string;
        occurredAt: string;
        depth: number;
      }
    ];
    edges: [
      {
        from: string;          // Event ID
        to: string;            // Event ID
        relationship: 'triggered' | 'updated' | 'referenced';
      }
    ];
  };
  visualization: {
    mermaidDiagram: string;    // Mermaid syntax for rendering
  };
}
```

---

### 3.3 Access Logs

#### `POST /v1/access-logs`
**Description**: Log data access (called by other services)

**Request**:
```typescript
{
  userId: string;
  action: 'read' | 'write' | 'delete' | 'export' | 'admin';
  resourceType: string;
  resourceId: string;
  endpoint: string;
  method: string;
  httpStatus: number;
  sourceIp?: string;
  userAgent?: string;
  reason?: string;
  sensitivityLevel?: 'public' | 'internal' | 'confidential' | 'restricted';
}
```

**Response** (201 Created):
```typescript
{
  accessLogId: string;
  timestamp: string;
}
```

---

#### `GET /v1/access-logs`
**Description**: Query access logs

**Query Parameters**:
- `userId`: string
- `resourceType`: string
- `resourceId`: string
- `action`: string
- `startDate`: ISO 8601
- `endDate`: ISO 8601
- `sensitivityLevel`: string
- `page`: number
- `limit`: number

**Response** (200 OK):
```typescript
{
  accessLogs: [ ... ];
  pagination: { ... };
  analytics: {
    totalAccess: number;
    uniqueUsers: number;
    topResources: [ ... ];
    anomalies: [
      {
        type: 'unusual_time' | 'unusual_location' | 'excessive_access';
        description: string;
        confidence: number;      // 0-1
      }
    ];
  };
}
```

---

### 3.4 GDPR Compliance

#### `POST /v1/gdpr/requests`
**Description**: Create GDPR data subject request

**Request**:
```typescript
{
  requestType: 'access' | 'erasure' | 'rectification' | 'portability' | 'object';
  subjectUserId: string;
  subjectEmail: string;
  requestedBy: string;          // User ID of requester
  reason: string;
  legalBasis?: string;
}
```

**Response** (201 Created):
```typescript
{
  requestId: string;
  requestType: string;
  status: 'pending';
  estimatedCompletionDate: string;  // Max 30 days from now
  reference: string;            // Unique reference for requester
}
```

---

#### `GET /v1/gdpr/requests/{requestId}`
**Description**: Get GDPR request status

**Response** (200 OK):
```typescript
{
  requestId: string;
  requestType: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  subjectUserId: string;
  subjectEmail: string;
  createdAt: string;
  completedAt?: string;
  result?: {
    dataExportUrl?: string;     // For 'access' requests
    deletionProof?: string;     // For 'erasure' requests
    summary: {
      recordsDeleted: number;
      recordsAnonymized: number;
      recordsRetainedForCompliance: number;
    };
  };
}
```

---

#### `POST /v1/gdpr/requests/{requestId}/execute`
**Description**: Execute GDPR request (admin only)

**Request**:
```typescript
{
  confirmation: boolean;        // Must be true
  executedBy: string;           // Admin user ID
  notes?: string;
}
```

**Response** (200 OK):
```typescript
{
  requestId: string;
  status: 'completed';
  executedAt: string;
  executedBy: string;
  result: { ... };
}
```

---

### 3.5 Compliance Reports

#### `GET /v1/compliance/reports/access-summary`
**Description**: Generate access summary report for compliance

**Query Parameters**:
- `startDate`: ISO 8601
- `endDate`: ISO 8601
- `userId`: string (optional)
- `resourceType`: string (optional)

**Response** (200 OK):
```typescript
{
  period: {
    from: string;
    to: string;
  };
  summary: {
    totalAccess: number;
    uniqueUsers: number;
    byAction: {
      read: number;
      write: number;
      delete: number;
      export: number;
      admin: number;
    };
    bySensitivity: {
      public: number;
      internal: number;
      confidential: number;
      restricted: number;
    };
  };
  topUsers: [
    {
      userId: string;
      userEmail: string;
      accessCount: number;
    }
  ];
  topResources: [
    {
      resourceType: string;
      resourceId: string;
      accessCount: number;
    }
  ];
}
```

---

#### `GET /v1/compliance/reports/data-retention`
**Description**: Data retention status report

**Response** (200 OK):
```typescript
{
  retentionPolicies: [
    {
      dataType: string;
      retentionPeriod: string;  // E.g., "10 years"
      legalBasis: string;       // E.g., "GHG Protocol requirement"
    }
  ];
  dataVolume: {
    total: number;              // Total events stored
    byAge: {
      '0-1_year': number;
      '1-3_years': number;
      '3-10_years': number;
      'over_10_years': number;
    };
    byStorage: {
      hot: number;              // MongoDB
      warm: number;             // S3 Standard
      cold: number;             // S3 Glacier
    };
  };
  upcomingDeletions: [
    {
      eventType: string;
      count: number;
      deletionDate: string;
    }
  ];
}
```

---

### 3.6 Integrity Verification

#### `POST /v1/integrity/verify`
**Description**: Verify audit log integrity

**Request**:
```typescript
{
  startEventId: string;
  endEventId: string;
  verifyHashChain: boolean;     // Default: true
  verifySignatures: boolean;    // Default: false (optional feature)
}
```

**Response** (200 OK):
```typescript
{
  verificationId: string;
  status: 'valid' | 'invalid' | 'warning';
  results: {
    eventsVerified: number;
    hashChainValid: boolean;
    signaturesValid?: boolean;
    tamperedEvents?: [
      {
        eventId: string;
        issue: string;
        severity: 'critical' | 'warning';
      }
    ];
  };
  certificate?: string;         // Cryptographic proof of verification
}
```

---

## 4. Data Models

### 4.1 MongoDB Collections

#### Collection: `audit_events`

```typescript
interface AuditEvent {
  _id: ObjectId;

  // Original domain event
  eventId: string;               // UUID (unique across all services)
  type: string;                  // Event type (e.g., 'identity.user.created.v1')
  version: string;               // Event schema version
  occurredAt: Date;              // When event occurred
  aggregateId: string;           // Entity ID
  aggregateType: string;         // Entity type (User, Project, etc.)
  correlationId: string;         // Request trace ID
  data: any;                     // Event payload

  // Enrichment
  audit: {
    receivedAt: Date;
    processedAt: Date;
    sourceService: string;
    sourceIp?: string;
    userAgent?: string;
    userId?: string;
    userEmail?: string;
    organizationId?: string;
    sessionId?: string;
    requestId?: string;
    geolocation?: {
      country: string;
      region: string;
      city: string;
      lat?: number;
      lon?: number;
    };
  };

  // Integrity
  integrity: {
    hash: string;                // SHA-256 hash
    previousHash?: string;       // Hash of previous event (hash chain)
    signature?: string;          // Digital signature (optional)
    merkleRoot?: string;         // Merkle tree root (for batch verification)
  };

  // Retention
  retentionPolicy: {
    retentionPeriod: number;     // Days
    deleteAfter: Date;           // Calculated deletion date
    legalHold: boolean;          // Freeze deletion if true
    archived: boolean;
    archivedAt?: Date;
    archiveLocation?: string;    // S3 key
  };

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
```javascript
db.audit_events.createIndex({ eventId: 1 }, { unique: true });
db.audit_events.createIndex({ type: 1, occurredAt: -1 });
db.audit_events.createIndex({ aggregateId: 1, aggregateType: 1, occurredAt: -1 });
db.audit_events.createIndex({ 'audit.userId': 1, occurredAt: -1 });
db.audit_events.createIndex({ 'audit.organizationId': 1, occurredAt: -1 });
db.audit_events.createIndex({ correlationId: 1 });
db.audit_events.createIndex({ occurredAt: -1 });
db.audit_events.createIndex({ 'retentionPolicy.deleteAfter': 1 }, { sparse: true });

// Full-text search
db.audit_events.createIndex({
  type: 'text',
  'data.$**': 'text',
  'audit.userEmail': 'text'
});
```

---

#### Collection: `access_logs`

```typescript
interface AccessLog {
  _id: ObjectId;
  accessLogId: string;           // UUID
  timestamp: Date;

  // Who
  userId: string;
  userEmail: string;
  userRole: string;
  organizationId: string;

  // What
  action: 'read' | 'write' | 'delete' | 'export' | 'admin';
  resourceType: string;          // 'user', 'project', 'activityData', etc.
  resourceId: string;

  // Where
  sourceIp: string;
  country: string;
  city?: string;
  userAgent: string;

  // How
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  httpStatus: number;
  responseTime: number;          // ms

  // Why
  reason?: string;

  // Security classification
  sensitivityLevel: 'public' | 'internal' | 'confidential' | 'restricted';
  dataClassification?: 'PII' | 'FinancialData' | 'EmissionData' | 'Proprietary';

  // Anomaly detection
  anomaly?: {
    detected: boolean;
    type: 'unusual_time' | 'unusual_location' | 'excessive_access' | 'privilege_escalation';
    confidence: number;          // 0-1
    baselineDeviation: number;   // How much it deviates from normal
  };

  createdAt: Date;
}
```

**Indexes**:
```javascript
db.access_logs.createIndex({ accessLogId: 1 }, { unique: true });
db.access_logs.createIndex({ userId: 1, timestamp: -1 });
db.access_logs.createIndex({ resourceType: 1, resourceId: 1, timestamp: -1 });
db.access_logs.createIndex({ timestamp: -1 });
db.access_logs.createIndex({ sensitivityLevel: 1, timestamp: -1 });
db.access_logs.createIndex({ 'anomaly.detected': 1, timestamp: -1 }, { sparse: true });

// TTL index (auto-delete after 3 years)
db.access_logs.createIndex({ timestamp: 1 }, { expireAfterSeconds: 94608000 });  // 3 years
```

---

#### Collection: `gdpr_requests`

```typescript
interface GDPRRequest {
  _id: ObjectId;
  requestId: string;             // UUID
  reference: string;             // Human-readable reference (e.g., "GDPR-2024-001")

  // Request details
  requestType: 'access' | 'erasure' | 'rectification' | 'portability' | 'object';
  subjectUserId: string;
  subjectEmail: string;

  // Status
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  createdAt: Date;
  completedAt?: Date;
  dueDate: Date;                 // 30 days from creation

  // Requester
  requestedBy: string;           // User ID
  requestedByEmail: string;
  reason: string;
  legalBasis?: string;

  // Execution
  executedBy?: string;           // Admin user ID
  executedAt?: Date;
  executionNotes?: string;

  // Result
  result?: {
    dataExportUrl?: string;      // S3 presigned URL
    dataExportExpiresAt?: Date;
    deletionProof?: {
      recordsDeleted: number;
      recordsAnonymized: number;
      recordsRetainedForCompliance: number;
      deletionLog: {
        collection: string;
        recordId: string;
        action: 'deleted' | 'anonymized' | 'retained';
        reason?: string;
      }[];
      verificationHash: string;  // Hash of deletion log for proof
    };
  };

  // Audit
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
```javascript
db.gdpr_requests.createIndex({ requestId: 1 }, { unique: true });
db.gdpr_requests.createIndex({ reference: 1 }, { unique: true });
db.gdpr_requests.createIndex({ subjectUserId: 1, createdAt: -1 });
db.gdpr_requests.createIndex({ status: 1, dueDate: 1 });
db.gdpr_requests.createIndex({ organizationId: 1, createdAt: -1 });
```

---

#### Collection: `data_lineage`

```typescript
interface DataLineage {
  _id: ObjectId;
  lineageId: string;             // UUID

  // Source entity
  sourceType: string;            // 'ActivityData', 'EmissionFactor', etc.
  sourceId: string;

  // Lineage graph
  nodes: {
    nodeId: string;              // Entity ID or Event ID
    nodeType: string;            // Entity type or Event type
    occurredAt: Date;
    depth: number;               // Distance from source
    metadata?: any;
  }[];

  edges: {
    from: string;                // Node ID
    to: string;                  // Node ID
    relationship: 'created' | 'updated' | 'referenced' | 'triggered' | 'included_in';
    eventId: string;             // Event that created this edge
    occurredAt: Date;
  }[];

  // Cache
  cachedAt: Date;
  expiresAt: Date;

  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
```javascript
db.data_lineage.createIndex({ lineageId: 1 }, { unique: true });
db.data_lineage.createIndex({ sourceType: 1, sourceId: 1 });
db.data_lineage.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });  // TTL
```

---

### 4.2 Redis Cache Schema

#### Event Deduplication

```typescript
// Deduplicate events using event ID
const EVENT_DEDUPE_KEY = `event:dedupe:${eventId}`;
const EVENT_DEDUPE_TTL = 3600; // 1 hour

// Check if event already processed
const exists = await redis.exists(EVENT_DEDUPE_KEY);
if (exists) {
  logger.warn('Duplicate event detected', { eventId });
  return;
}

// Mark as processed
await redis.setex(EVENT_DEDUPE_KEY, EVENT_DEDUPE_TTL, '1');
```

#### Lineage Cache

```typescript
// Cache lineage graph
const LINEAGE_CACHE_KEY = `lineage:${entityType}:${entityId}`;
const LINEAGE_CACHE_TTL = 600; // 10 minutes

await redis.setex(
  LINEAGE_CACHE_KEY,
  LINEAGE_CACHE_TTL,
  JSON.stringify(lineageGraph)
);
```

---

## 5. Business Logic

### 5.1 Event Ingestion Pipeline

#### Event Consumer

```typescript
@EventsHandler('*')  // Listen to all events
export class AuditEventConsumer implements IEventHandler<DomainEvent> {

  async handle(event: DomainEvent): Promise<void> {
    try {
      // Step 1: Deduplicate
      if (await this.isDuplicate(event.id)) {
        logger.debug('Duplicate event skipped', { eventId: event.id });
        return;
      }

      // Step 2: Enrich event
      const enrichedEvent = await this.enrichEvent(event);

      // Step 3: Calculate integrity hash
      const hash = this.calculateHash(enrichedEvent);
      const previousHash = await this.getLastEventHash();

      enrichedEvent.integrity = {
        hash,
        previousHash
      };

      // Step 4: Store event
      await this.auditEventRepository.save(enrichedEvent);

      // Step 5: Update lineage graph (async)
      await this.lineageService.updateLineage(enrichedEvent);

      // Step 6: Check for anomalies (async)
      await this.anomalyDetectionService.analyze(enrichedEvent);

      // Step 7: Mark as processed (deduplication)
      await this.markAsProcessed(event.id);

      logger.debug('Event ingested successfully', {
        eventId: event.id,
        type: event.type
      });

    } catch (error) {
      logger.error('Event ingestion failed', {
        eventId: event.id,
        error: error.message
      });

      // Send to dead letter queue
      await this.dlq.send(event);
    }
  }

  private async enrichEvent(event: DomainEvent): Promise<EnrichedAuditEvent> {
    // Fetch user details
    const user = event.metadata?.userId
      ? await this.identityServiceClient.getUser(event.metadata.userId)
      : null;

    // Geolocate IP
    const geolocation = event.metadata?.sourceIp
      ? await this.geolocationService.lookup(event.metadata.sourceIp)
      : null;

    return {
      ...event,
      audit: {
        receivedAt: new Date(),
        processedAt: new Date(),
        sourceService: event.metadata?.sourceService || 'unknown',
        sourceIp: event.metadata?.sourceIp,
        userAgent: event.metadata?.userAgent,
        userId: user?.id,
        userEmail: user?.email,
        organizationId: event.metadata?.organizationId,
        sessionId: event.metadata?.sessionId,
        requestId: event.metadata?.requestId,
        geolocation
      },
      retentionPolicy: this.getRetentionPolicy(event.type)
    };
  }

  private getRetentionPolicy(eventType: string): RetentionPolicy {
    // Default: 10 years for emission-related events
    const defaults = {
      retentionPeriod: 3650,  // 10 years in days
      legalBasis: 'GHG Protocol requirement',
      archived: false
    };

    // Override for specific event types
    if (eventType.startsWith('identity.')) {
      return { ...defaults, retentionPeriod: 2555 };  // 7 years
    }

    if (eventType.startsWith('system.error')) {
      return { ...defaults, retentionPeriod: 365 };   // 1 year
    }

    const deleteAfter = new Date();
    deleteAfter.setDate(deleteAfter.getDate() + defaults.retentionPeriod);

    return {
      ...defaults,
      deleteAfter,
      legalHold: false
    };
  }
}
```

---

### 5.2 Data Lineage Builder

#### Lineage Graph Construction

```typescript
class DataLineageService {
  async updateLineage(event: AuditEvent): Promise<void> {
    // Determine if event creates lineage relationship
    const relationships = this.extractRelationships(event);

    if (relationships.length === 0) {
      return;  // No lineage impact
    }

    for (const rel of relationships) {
      // Find or create lineage graph for source entity
      let lineage = await this.lineageRepository.findOne({
        sourceType: rel.sourceType,
        sourceId: rel.sourceId
      });

      if (!lineage) {
        lineage = await this.createLineageGraph(rel.sourceType, rel.sourceId);
      }

      // Add node (if new entity created)
      if (rel.targetType && rel.targetId) {
        lineage.nodes.push({
          nodeId: rel.targetId,
          nodeType: rel.targetType,
          occurredAt: event.occurredAt,
          depth: this.calculateDepth(lineage, rel.targetId),
          metadata: rel.metadata
        });
      }

      // Add edge (relationship)
      lineage.edges.push({
        from: rel.sourceId,
        to: rel.targetId,
        relationship: rel.relationship,
        eventId: event.eventId,
        occurredAt: event.occurredAt
      });

      // Save updated lineage
      await this.lineageRepository.save(lineage);

      // Invalidate lineage cache
      await this.invalidateLineageCache(rel.sourceType, rel.sourceId);
    }
  }

  private extractRelationships(event: AuditEvent): LineageRelationship[] {
    const relationships: LineageRelationship[] = [];

    switch (event.type) {
      case 'activity.data.verified.v1':
        relationships.push({
          sourceType: 'ActivityData',
          sourceId: event.aggregateId,
          targetType: 'Verification',
          targetId: event.data.verificationId,
          relationship: 'verified_by',
          metadata: {
            verifiedBy: event.data.verifiedBy,
            verifiedAt: event.occurredAt
          }
        });
        break;

      case 'calculation.emission.calculated.v1':
        relationships.push({
          sourceType: 'ActivityData',
          sourceId: event.data.activityDataId,
          targetType: 'CalculationResult',
          targetId: event.aggregateId,
          relationship: 'used_in_calculation'
        });
        relationships.push({
          sourceType: 'EmissionFactor',
          sourceId: event.data.emissionFactorId,
          targetType: 'CalculationResult',
          targetId: event.aggregateId,
          relationship: 'applied_in_calculation'
        });
        break;

      case 'reporting.report.generated.v1':
        // Find all calculations included in this report
        const calculationIds = event.data.includedCalculations || [];
        calculationIds.forEach(calcId => {
          relationships.push({
            sourceType: 'CalculationResult',
            sourceId: calcId,
            targetType: 'Report',
            targetId: event.aggregateId,
            relationship: 'included_in_report'
          });
        });
        break;
    }

    return relationships;
  }

  async traceLineage(
    entityType: string,
    entityId: string,
    options: {
      direction: 'forward' | 'backward' | 'both';
      maxDepth: number;
    }
  ): Promise<LineageGraph> {

    // Check cache
    const cacheKey = `lineage:${entityType}:${entityId}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Build lineage graph
    const lineage = await this.lineageRepository.findOne({
      sourceType: entityType,
      sourceId: entityId
    });

    if (!lineage) {
      return { nodes: [], edges: [] };
    }

    // Filter by direction
    let filteredEdges = lineage.edges;

    if (options.direction === 'forward') {
      filteredEdges = lineage.edges.filter(edge => edge.from === entityId);
    } else if (options.direction === 'backward') {
      filteredEdges = lineage.edges.filter(edge => edge.to === entityId);
    }

    // Filter by depth
    const relevantNodes = lineage.nodes.filter(node =>
      node.depth <= options.maxDepth
    );

    const graph = {
      nodes: relevantNodes,
      edges: filteredEdges
    };

    // Cache result
    await this.cache.setex(cacheKey, 600, JSON.stringify(graph));

    return graph;
  }
}
```

---

### 5.3 GDPR Request Handler

#### GDPR Request Execution

```typescript
class GDPRRequestService {
  async executeRequest(requestId: string, executedBy: string): Promise<GDPRRequestResult> {
    const request = await this.gdprRequestRepository.findOne({ requestId });

    if (!request) {
      throw new GDPRRequestNotFoundError(requestId);
    }

    if (request.status !== 'pending') {
      throw new GDPRRequestAlreadyProcessedError(requestId);
    }

    // Update status
    await this.gdprRequestRepository.updateOne(
      { requestId },
      { status: 'processing', executedBy, executedAt: new Date() }
    );

    try {
      let result: any;

      switch (request.requestType) {
        case 'access':
          result = await this.executeAccessRequest(request);
          break;

        case 'erasure':
          result = await this.executeErasureRequest(request);
          break;

        case 'rectification':
          result = await this.executeRectificationRequest(request);
          break;

        case 'portability':
          result = await this.executePortabilityRequest(request);
          break;

        case 'object':
          result = await this.executeObjectRequest(request);
          break;

        default:
          throw new UnsupportedRequestTypeError(request.requestType);
      }

      // Mark as completed
      await this.gdprRequestRepository.updateOne(
        { requestId },
        {
          status: 'completed',
          completedAt: new Date(),
          result
        }
      );

      // Publish event
      await this.eventBus.publish({
        type: 'audit.gdpr-request.completed.v1',
        aggregateId: requestId,
        aggregateType: 'GDPRRequest',
        data: {
          requestId,
          requestType: request.requestType,
          subjectUserId: request.subjectUserId,
          executedBy,
          completedAt: new Date()
        }
      });

      return result;

    } catch (error) {
      // Mark as failed
      await this.gdprRequestRepository.updateOne(
        { requestId },
        {
          status: 'rejected',
          executionNotes: error.message
        }
      );

      throw error;
    }
  }

  private async executeAccessRequest(request: GDPRRequest): Promise<any> {
    const userId = request.subjectUserId;

    // Collect data from all services
    const userData = await this.identityServiceClient.getUserData(userId);
    const projectData = await this.organizationServiceClient.getUserProjects(userId);
    const activityData = await this.activityServiceClient.getUserActivityData(userId);
    const calculations = await this.calculationServiceClient.getUserCalculations(userId);
    const reports = await this.reportingServiceClient.getUserReports(userId);
    const auditEvents = await this.auditEventRepository.find({
      'audit.userId': userId
    });
    const accessLogs = await this.accessLogRepository.find({
      userId
    });

    // Compile GDPR data export
    const dataExport = {
      subject: {
        userId,
        email: request.subjectEmail,
        exportDate: new Date().toISOString()
      },
      dataCategories: {
        identity: userData,
        organization: projectData,
        activity: activityData,
        calculation: calculations,
        reporting: reports,
        audit: {
          events: auditEvents,
          accessLogs
        }
      },
      retentionPolicies: {
        identity: '7 years',
        activity: '10 years',
        audit: '10 years'
      }
    };

    // Upload to S3
    const s3Key = `gdpr-exports/${userId}/${requestId}.json`;
    await this.s3.upload({
      Bucket: 'clenergize-gdpr-exports',
      Key: s3Key,
      Body: JSON.stringify(dataExport, null, 2),
      ServerSideEncryption: 'aws:kms',
      ContentType: 'application/json'
    });

    // Generate presigned URL (expires in 30 days)
    const dataExportUrl = await this.s3.getSignedUrl('getObject', {
      Bucket: 'clenergize-gdpr-exports',
      Key: s3Key,
      Expires: 2592000  // 30 days
    });

    return {
      dataExportUrl,
      dataExportExpiresAt: new Date(Date.now() + 2592000 * 1000)
    };
  }

  private async executeErasureRequest(request: GDPRRequest): Promise<any> {
    const userId = request.subjectUserId;

    const deletionLog: any[] = [];
    let recordsDeleted = 0;
    let recordsAnonymized = 0;
    let recordsRetainedForCompliance = 0;

    // Delete/anonymize user data in each service
    // Note: Some data must be retained for compliance

    // 1. Identity data - Anonymize (retain for compliance)
    await this.identityServiceClient.anonymizeUser(userId);
    deletionLog.push({
      collection: 'users',
      recordId: userId,
      action: 'anonymized',
      reason: 'GDPR erasure - user identity anonymized but record retained for audit'
    });
    recordsAnonymized++;

    // 2. Activity data - Anonymize user association but keep data (emission data)
    const activityRecords = await this.activityServiceClient.getUserActivityData(userId);
    for (const record of activityRecords) {
      await this.activityServiceClient.anonymizeUserAssociation(record.id);
      deletionLog.push({
        collection: 'activity_data',
        recordId: record.id,
        action: 'anonymized',
        reason: 'User association removed but data retained for emission calculations'
      });
      recordsAnonymized++;
    }

    // 3. Audit events - Anonymize (must retain for compliance)
    await this.auditEventRepository.updateMany(
      { 'audit.userId': userId },
      {
        'audit.userId': 'ANONYMIZED',
        'audit.userEmail': 'anonymized@gdpr-erasure'
      }
    );
    const auditCount = await this.auditEventRepository.count({ 'audit.userId': userId });
    deletionLog.push({
      collection: 'audit_events',
      recordId: 'multiple',
      action: 'anonymized',
      reason: 'Audit logs must be retained for 10 years per GHG Protocol'
    });
    recordsRetainedForCompliance += auditCount;

    // 4. Access logs - Delete (not required for compliance)
    const accessLogs = await this.accessLogRepository.find({ userId });
    await this.accessLogRepository.deleteMany({ userId });
    recordsDeleted += accessLogs.length;
    deletionLog.push({
      collection: 'access_logs',
      recordId: 'multiple',
      action: 'deleted',
      reason: 'Not required for compliance'
    });

    // Generate verification hash
    const verificationHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(deletionLog))
      .digest('hex');

    return {
      deletionProof: {
        recordsDeleted,
        recordsAnonymized,
        recordsRetainedForCompliance,
        deletionLog,
        verificationHash
      }
    };
  }
}
```

---

### 5.4 Anomaly Detection

#### Access Pattern Analysis

```typescript
class AnomalyDetectionService {
  async analyze(accessLog: AccessLog): Promise<AnomalyResult | null> {
    // Build user access profile
    const profile = await this.getUserAccessProfile(accessLog.userId);

    const anomalies: Anomaly[] = [];

    // 1. Check for unusual time
    if (this.isUnusualTime(accessLog.timestamp, profile.typicalAccessTimes)) {
      anomalies.push({
        type: 'unusual_time',
        confidence: 0.7,
        description: `Access at ${accessLog.timestamp.toISOString()} is outside typical hours`
      });
    }

    // 2. Check for unusual location
    if (this.isUnusualLocation(accessLog.country, profile.typicalCountries)) {
      anomalies.push({
        type: 'unusual_location',
        confidence: 0.9,
        description: `Access from ${accessLog.country} - user typically accesses from ${profile.typicalCountries.join(', ')}`
      });
    }

    // 3. Check for excessive access
    const recentAccessCount = await this.getRecentAccessCount(
      accessLog.userId,
      { last: 3600000 }  // Last hour
    );

    if (recentAccessCount > profile.averageAccessPerHour * 3) {
      anomalies.push({
        type: 'excessive_access',
        confidence: 0.8,
        description: `${recentAccessCount} accesses in last hour vs average of ${profile.averageAccessPerHour}`
      });
    }

    // 4. Check for privilege escalation
    if (accessLog.action === 'admin' && !profile.isAdmin) {
      anomalies.push({
        type: 'privilege_escalation',
        confidence: 1.0,
        description: 'Admin action performed by non-admin user'
      });
    }

    if (anomalies.length > 0) {
      // Update access log with anomaly
      await this.accessLogRepository.updateOne(
        { accessLogId: accessLog.accessLogId },
        {
          anomaly: {
            detected: true,
            type: anomalies[0].type,
            confidence: anomalies[0].confidence,
            baselineDeviation: this.calculateDeviation(accessLog, profile)
          }
        }
      );

      // Send alert if high confidence
      if (anomalies.some(a => a.confidence > 0.8)) {
        await this.sendSecurityAlert(accessLog, anomalies);
      }

      return { anomalies };
    }

    return null;
  }

  private async getUserAccessProfile(userId: string): Promise<UserAccessProfile> {
    // Get last 30 days of access logs
    const recentAccess = await this.accessLogRepository.find({
      userId,
      timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    // Build profile
    const typicalAccessTimes = this.extractTypicalTimes(recentAccess);
    const typicalCountries = [...new Set(recentAccess.map(a => a.country))];
    const averageAccessPerHour = recentAccess.length / (30 * 24);

    return {
      userId,
      typicalAccessTimes,
      typicalCountries,
      averageAccessPerHour,
      isAdmin: recentAccess.some(a => a.action === 'admin')
    };
  }
}
```

---

## 6. Integration Points

### 6.1 All Services

**Dependency Type**: Conformist (consumes events from all services)

**Integration Method**: Event-Driven

**Events Consumed**: ALL domain events from all 6 services (Identity, Organization, Reference, Activity, Calculation, Reporting)

**Event Handler Registration**:
```typescript
// Universal event handler
@EventsHandler('*')  // Wildcard - listen to all events
export class AuditEventConsumer implements IEventHandler<DomainEvent> {
  async handle(event: DomainEvent): Promise<void> {
    await this.auditService.ingestEvent(event);
  }
}
```

---

### 6.2 Identity Service

**REST Calls**:
```typescript
GET /v1/users/{userId}
  Purpose: Enrich audit events with user details
  Cache: 15 minutes

POST /v1/users/{userId}/anonymize
  Purpose: GDPR erasure - anonymize user
```

---

### 6.3 Frontend

**Integration Method**: REST API

**Key Endpoints Used**:
- `GET /v1/audit/events` - Audit trail view
- `GET /v1/access-logs` - Access logs view
- `POST /v1/gdpr/requests` - GDPR request submission
- `GET /v1/compliance/reports/access-summary` - Compliance dashboard

---

## 7. Non-Functional Requirements

### 7.1 Performance

| Metric | Target | Critical Path |
|--------|--------|---------------|
| **Event Ingestion** | < 50ms p95 | Async processing |
| **Audit Query** | < 500ms p95 | Indexed queries |
| **Lineage Trace** | < 1s for 10 levels | Graph caching |
| **GDPR Export** | < 5 minutes | Async job |
| **Integrity Verification** | < 10s for 10k events | Hash chain verification |

### 7.2 Scalability

**Event Volume Targets**:
- 10M+ events per day
- 100k+ audit queries per day
- 10 years of event retention (3.65 billion events)

**Storage Strategy**:
- Hot (MongoDB): 0-1 year (~365M events)
- Warm (S3 Standard): 1-3 years (~730M events)
- Cold (S3 Glacier): 3-10 years (~2.55B events)

### 7.3 Reliability

**Data Durability**: 99.999999999% (11 nines) - S3 guarantees

**Event Loss Prevention**:
- At-least-once delivery guarantee
- Dead letter queue for failed ingestion
- Automatic retry (max 3 attempts)

### 7.4 Security

**Encryption**:
- At rest: AWS KMS encryption for all audit logs
- In transit: TLS 1.3 for all API calls
- Archive: Encrypted S3 buckets

**Access Control**:
- Only admins can query audit logs
- Only admins can execute GDPR requests
- Audit logs are append-only (no updates/deletes)

### 7.5 Compliance

**Standards Supported**:
- GDPR (Right to Access, Erasure, Portability)
- SOC 2 Type II (Access logs, change tracking)
- ISO 14064-1 (Data retention, audit trail)
- GHG Protocol (Transparency, recalculation support)

---

## 8. Testing Strategy

### 8.1 Unit Tests

**Coverage Target**: 85%+

**Key Test Cases**:
```typescript
describe('AuditEventConsumer', () => {
  it('should deduplicate events', async () => {
    await consumer.handle(event);
    await consumer.handle(event);  // Duplicate

    const count = await auditEventRepository.count({ eventId: event.id });
    expect(count).toBe(1);
  });

  it('should calculate hash chain correctly', async () => {
    await consumer.handle(event1);
    await consumer.handle(event2);

    const event2Stored = await auditEventRepository.findOne({ eventId: event2.id });
    expect(event2Stored.integrity.previousHash).toBe(event1.integrity.hash);
  });
});

describe('DataLineageService', () => {
  it('should trace lineage forward', async () => {
    const lineage = await service.traceLineage('ActivityData', 'activity-123', {
      direction: 'forward',
      maxDepth: 5
    });

    expect(lineage.edges).toContainEqual(
      expect.objectContaining({
        relationship: 'used_in_calculation'
      })
    );
  });
});
```

### 8.2 Integration Tests

**Key Test Scenarios**:
```typescript
describe('GDPR Request Integration', () => {
  it('should execute access request end-to-end', async () => {
    // 1. Create request
    const response = await request(app)
      .post('/v1/gdpr/requests')
      .send({ requestType: 'access', subjectUserId: user.id })
      .expect(201);

    // 2. Execute request
    await request(app)
      .post(`/v1/gdpr/requests/${response.body.requestId}/execute`)
      .send({ confirmation: true, executedBy: admin.id })
      .expect(200);

    // 3. Verify data export created
    const gdprRequest = await gdprRequestRepository.findOne({
      requestId: response.body.requestId
    });

    expect(gdprRequest.status).toBe('completed');
    expect(gdprRequest.result.dataExportUrl).toBeDefined();
  });
});
```

---

## 9. Deployment Configuration

### 9.1 Environment Variables

```bash
# Service Configuration
NODE_ENV=development|production
SERVICE_NAME=audit-service
PORT=3007

# Database
MONGODB_URI=mongodb://admin:password@mongodb:27017/clenergize_audit?authSource=admin

# Redis
REDIS_URL=redis://redis:6379

# AWS Services
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<secret>
AWS_SECRET_ACCESS_KEY=<secret>

# S3
S3_AUDIT_ARCHIVE_BUCKET=clenergize-audit-archive
S3_GDPR_EXPORTS_BUCKET=clenergize-gdpr-exports

# SQS
SQS_AUDIT_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/123456789/audit-events

# KMS
KMS_AUDIT_KEY_ID=arn:aws:kms:us-east-1:123456789:key/audit-encryption

# Retention
AUDIT_HOT_RETENTION_DAYS=365
AUDIT_WARM_RETENTION_DAYS=1095
AUDIT_TOTAL_RETENTION_DAYS=3650

# Service Dependencies
IDENTITY_SERVICE_URL=http://identity-service:3001

# Feature Flags
ENABLE_HASH_CHAIN=true
ENABLE_DIGITAL_SIGNATURES=false
ENABLE_ANOMALY_DETECTION=true
```

---

## 10. Migration from OLD System

### 10.1 Current State Analysis

**OLD System**: No dedicated audit service - logs scattered across services

**Critical Gaps**:
1. No centralized audit logging
2. No GDPR compliance support
3. No data lineage tracking
4. No retention management
5. No tamper detection

### 10.2 Migration Strategy

#### Phase 1: Deploy NEW Audit Service (Week 1)

- Deploy audit service
- Start ingesting events from all services
- No migration of OLD logs initially

#### Phase 2: Backfill Historical Events (Week 2-3)

- Extract events from OLD service logs
- Reconstruct audit events
- Import into NEW audit service
- Build lineage graphs

#### Phase 3: Enable Compliance Features (Week 4)

- Enable GDPR request handling
- Implement retention policies
- Configure archival to S3

---

**END OF SPECIFICATION**

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-18 | Audit Agent | Initial specification |

**Next Review**: End of Week 1 (Design Phase)

**Stakeholder Approval**: [ ] Architecture Agent [ ] Security Agent [ ] Master Coordinator

---

## 11. Error Code Registry

### 11.1 Error Code Taxonomy

All Audit Service errors follow the format: `AUD_CATEGORY_NUMBER`

**Categories**:
- **AUD_VAL**: Validation errors (001-020)
- **AUD_AUTH**: Authentication/Authorization errors (021-040)
- **AUD_RES**: Resource not found errors (041-060)
- **AUD_PROC**: Processing errors (061-080)
- **AUD_DEP**: Dependency errors (081-100)
- **AUD_SYS**: System errors (101-120)

### 11.2 Validation Errors (AUD_VAL_xxx)

```typescript
export const AUD_VAL_001 = {
  code: 'AUD_VAL_001',
  message: 'Event validation failed',
  httpStatus: 400,
  userMessage: 'The provided event data is invalid',
  resolution: 'Check event schema and ensure all required fields are present'
};

export const AUD_VAL_002 = {
  code: 'AUD_VAL_002',
  message: 'Invalid event type',
  httpStatus: 400,
  userMessage: 'The event type is not recognized',
  resolution: 'Use a valid event type from the event schema registry'
};

export const AUD_VAL_003 = {
  code: 'AUD_VAL_003',
  message: 'Invalid date range',
  httpStatus: 400,
  userMessage: 'Start date must be before end date',
  resolution: 'Ensure startDate < endDate in query parameters'
};

export const AUD_VAL_004 = {
  code: 'AUD_VAL_004',
  message: 'Invalid query filters',
  httpStatus: 400,
  userMessage: 'The provided query filters are invalid',
  resolution: 'Check filter syntax and supported operators'
};

export const AUD_VAL_005 = {
  code: 'AUD_VAL_005',
  message: 'GDPR request validation failed',
  httpStatus: 400,
  userMessage: 'GDPR request data is incomplete or invalid',
  resolution: 'Ensure requestType, subjectUserId, and reason are provided'
};

export const AUD_VAL_006 = {
  code: 'AUD_VAL_006',
  message: 'Pagination limit exceeded',
  httpStatus: 400,
  userMessage: 'Maximum query limit is 1000 records',
  resolution: 'Reduce limit parameter to 1000 or less'
};

export const AUD_VAL_007 = {
  code: 'AUD_VAL_007',
  message: 'Invalid lineage direction',
  httpStatus: 400,
  userMessage: 'Lineage direction must be forward, backward, or both',
  resolution: 'Use one of: forward | backward | both'
};
```

### 11.3 Authentication/Authorization Errors (AUD_AUTH_xxx)

```typescript
export const AUD_AUTH_021 = {
  code: 'AUD_AUTH_021',
  message: 'Insufficient permissions to access audit logs',
  httpStatus: 403,
  userMessage: 'You do not have permission to view audit logs',
  resolution: 'Contact administrator to request audit log access'
};

export const AUD_AUTH_022 = {
  code: 'AUD_AUTH_022',
  message: 'GDPR request execution requires admin role',
  httpStatus: 403,
  userMessage: 'Only administrators can execute GDPR requests',
  resolution: 'Contact an administrator to execute this request'
};

export const AUD_AUTH_023 = {
  code: 'AUD_AUTH_023',
  message: 'Cannot access other organization audit logs',
  httpStatus: 403,
  userMessage: 'You can only access audit logs for your organization',
  resolution: 'Filter query by your organization ID'
};

export const AUD_AUTH_024 = {
  code: 'AUD_AUTH_024',
  message: 'Cannot modify audit logs',
  httpStatus: 403,
  userMessage: 'Audit logs are immutable and cannot be modified',
  resolution: 'Audit logs are append-only for compliance'
};
```

### 11.4 Resource Not Found Errors (AUD_RES_xxx)

```typescript
export const AUD_RES_041 = {
  code: 'AUD_RES_041',
  message: 'Audit event not found',
  httpStatus: 404,
  userMessage: 'The requested audit event does not exist',
  resolution: 'Check the event ID and try again'
};

export const AUD_RES_042 = {
  code: 'AUD_RES_042',
  message: 'GDPR request not found',
  httpStatus: 404,
  userMessage: 'The requested GDPR request does not exist',
  resolution: 'Check the request ID and try again'
};

export const AUD_RES_043 = {
  code: 'AUD_RES_043',
  message: 'Access log not found',
  httpStatus: 404,
  userMessage: 'The requested access log does not exist',
  resolution: 'Check the access log ID and try again'
};

export const AUD_RES_044 = {
  code: 'AUD_RES_044',
  message: 'Lineage data not found',
  httpStatus: 404,
  userMessage: 'No lineage data available for this entity',
  resolution: 'Ensure the entity has been processed and lineage tracking is enabled'
};

export const AUD_RES_045 = {
  code: 'AUD_RES_045',
  message: 'Archived event not accessible',
  httpStatus: 404,
  userMessage: 'This event has been archived and requires special retrieval',
  resolution: 'Contact administrator to retrieve archived events from S3'
};
```

### 11.5 Processing Errors (AUD_PROC_xxx)

```typescript
export const AUD_PROC_061 = {
  code: 'AUD_PROC_061',
  message: 'Event ingestion failed',
  httpStatus: 500,
  userMessage: 'Failed to process audit event',
  resolution: 'Event sent to dead letter queue for retry'
};

export const AUD_PROC_062 = {
  code: 'AUD_PROC_062',
  message: 'Hash chain verification failed',
  httpStatus: 500,
  userMessage: 'Audit log integrity check detected tampering',
  resolution: 'Critical security alert - contact security team immediately'
};

export const AUD_PROC_063 = {
  code: 'AUD_PROC_063',
  message: 'Lineage graph construction failed',
  httpStatus: 500,
  userMessage: 'Failed to build data lineage graph',
  resolution: 'Lineage may be incomplete - contact support'
};

export const AUD_PROC_064 = {
  code: 'AUD_PROC_064',
  message: 'GDPR data export failed',
  httpStatus: 500,
  userMessage: 'Failed to generate GDPR data export',
  resolution: 'Retry the request or contact support'
};

export const AUD_PROC_065 = {
  code: 'AUD_PROC_065',
  message: 'Event archival to S3 failed',
  httpStatus: 500,
  userMessage: 'Failed to archive events to long-term storage',
  resolution: 'Events retained in hot storage - administrator notified'
};

export const AUD_PROC_066 = {
  code: 'AUD_PROC_066',
  message: 'Anomaly detection processing failed',
  httpStatus: 500,
  userMessage: 'Anomaly detection temporarily unavailable',
  resolution: 'Access logs still recorded but anomalies not detected'
};

export const AUD_PROC_067 = {
  code: 'AUD_PROC_067',
  message: 'GDPR request already processed',
  httpStatus: 422,
  userMessage: 'This GDPR request has already been executed',
  resolution: 'Check request status for completion details'
};
```

### 11.6 Dependency Errors (AUD_DEP_xxx)

```typescript
export const AUD_DEP_081 = {
  code: 'AUD_DEP_081',
  message: 'Identity service unavailable',
  httpStatus: 503,
  userMessage: 'Cannot enrich events with user data - Identity service unavailable',
  resolution: 'Events stored without user enrichment - will be enriched later'
};

export const AUD_DEP_082 = {
  code: 'AUD_DEP_082',
  message: 'Geolocation service unavailable',
  httpStatus: 503,
  userMessage: 'Cannot determine location from IP address',
  resolution: 'Event stored without geolocation data'
};

export const AUD_DEP_083 = {
  code: 'AUD_DEP_083',
  message: 'S3 archive unavailable',
  httpStatus: 503,
  userMessage: 'Cannot access archived events',
  resolution: 'Try again later or contact support'
};

export const AUD_DEP_084 = {
  code: 'AUD_DEP_084',
  message: 'Event bus unavailable',
  httpStatus: 503,
  userMessage: 'Cannot receive events from event bus',
  resolution: 'Event ingestion paused - will resume automatically'
};
```

### 11.7 System Errors (AUD_SYS_xxx)

```typescript
export const AUD_SYS_101 = {
  code: 'AUD_SYS_101',
  message: 'MongoDB connection failed',
  httpStatus: 503,
  userMessage: 'Audit database temporarily unavailable',
  resolution: 'Service will retry automatically'
};

export const AUD_SYS_102 = {
  code: 'AUD_SYS_102',
  message: 'Redis connection failed',
  httpStatus: 503,
  userMessage: 'Caching layer unavailable',
  resolution: 'Service continues with degraded performance'
};

export const AUD_SYS_103 = {
  code: 'AUD_SYS_103',
  message: 'Query timeout exceeded',
  httpStatus: 504,
  userMessage: 'Audit query took too long to execute',
  resolution: 'Narrow your search criteria or reduce date range'
};

export const AUD_SYS_104 = {
  code: 'AUD_SYS_104',
  message: 'Internal server error',
  httpStatus: 500,
  userMessage: 'An unexpected error occurred',
  resolution: 'Error logged for investigation'
};
```

---

## 12. Event Schemas with Zod Validation

### 12.1 Published Events

The Audit Service publishes the following events (other services subscribe):

#### 12.1.1 audit.event.ingested.v1

**Description**: Published when an audit event is successfully ingested and stored

**Schema**:
```typescript
import { z } from 'zod';

export const AuditEventIngestedEventDataSchema = z.object({
  eventId: z.string().uuid(),
  originalEventType: z.string().min(1).max(200),
  aggregateId: z.string().uuid(),
  aggregateType: z.string().min(1).max(100),
  sourceService: z.string().min(1).max(100),
  occurredAt: z.string().datetime(),
  ingestedAt: z.string().datetime(),
  userId: z.string().uuid().optional(),
  organizationId: z.string().uuid().optional(),
  integrityHash: z.string().length(64),  // SHA-256
  enrichmentComplete: z.boolean()
});

export type AuditEventIngestedEventData = z.infer<typeof AuditEventIngestedEventDataSchema>;

export const AuditEventIngestedEvent = z.object({
  id: z.string().uuid(),
  type: z.literal('audit.event.ingested.v1'),
  version: z.literal('1.0'),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('AuditEvent'),
  data: AuditEventIngestedEventDataSchema,
  metadata: z.object({
    correlationId: z.string().uuid(),
    causationId: z.string().uuid(),
    userId: z.string().uuid().optional()
  })
});

export type AuditEventIngestedEvent = z.infer<typeof AuditEventIngestedEvent>;
```

**Example**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "audit.event.ingested.v1",
  "version": "1.0",
  "occurredAt": "2024-11-18T10:30:00Z",
  "aggregateId": "audit-event-123",
  "aggregateType": "AuditEvent",
  "data": {
    "eventId": "original-event-456",
    "originalEventType": "identity.user.created.v1",
    "aggregateId": "user-789",
    "aggregateType": "User",
    "sourceService": "identity-service",
    "occurredAt": "2024-11-18T10:29:58Z",
    "ingestedAt": "2024-11-18T10:30:00Z",
    "userId": "admin-123",
    "organizationId": "org-456",
    "integrityHash": "a3c5e9f0b2d4e6f8a0c2e4f6a8b0c2e4f6a8b0c2e4f6a8b0c2e4f6a8b0c2e4",
    "enrichmentComplete": true
  },
  "metadata": {
    "correlationId": "req-123",
    "causationId": "original-event-456",
    "userId": "admin-123"
  }
}
```

---

#### 12.1.2 audit.gdpr-request.completed.v1

**Description**: Published when a GDPR data subject request has been completed

**Schema**:
```typescript
export const GDPRRequestCompletedEventDataSchema = z.object({
  requestId: z.string().uuid(),
  reference: z.string().min(1).max(50),
  requestType: z.enum(['access', 'erasure', 'rectification', 'portability', 'object']),
  subjectUserId: z.string().uuid(),
  subjectEmail: z.string().email(),
  executedBy: z.string().uuid(),
  executedAt: z.string().datetime(),
  completedAt: z.string().datetime(),
  result: z.object({
    dataExportUrl: z.string().url().optional(),
    recordsDeleted: z.number().int().nonnegative().optional(),
    recordsAnonymized: z.number().int().nonnegative().optional(),
    recordsRetainedForCompliance: z.number().int().nonnegative().optional()
  })
});

export type GDPRRequestCompletedEventData = z.infer<typeof GDPRRequestCompletedEventDataSchema>;

export const GDPRRequestCompletedEvent = z.object({
  id: z.string().uuid(),
  type: z.literal('audit.gdpr-request.completed.v1'),
  version: z.literal('1.0'),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('GDPRRequest'),
  data: GDPRRequestCompletedEventDataSchema,
  metadata: z.object({
    correlationId: z.string().uuid(),
    causationId: z.string().uuid(),
    userId: z.string().uuid()
  })
});
```

---

#### 12.1.3 audit.integrity-violation.detected.v1

**Description**: Published when audit log tampering is detected (CRITICAL security event)

**Schema**:
```typescript
export const IntegrityViolationDetectedEventDataSchema = z.object({
  verificationId: z.string().uuid(),
  detectedAt: z.string().datetime(),
  violationType: z.enum(['hash_mismatch', 'chain_broken', 'signature_invalid', 'event_missing']),
  affectedEventId: z.string().uuid().optional(),
  affectedEventRange: z.object({
    startEventId: z.string().uuid(),
    endEventId: z.string().uuid()
  }).optional(),
  severity: z.enum(['critical', 'high', 'medium']),
  details: z.string().max(1000),
  investigationRequired: z.boolean(),
  automaticAlertSent: z.boolean()
});

export type IntegrityViolationDetectedEventData = z.infer<typeof IntegrityViolationDetectedEventDataSchema>;

export const IntegrityViolationDetectedEvent = z.object({
  id: z.string().uuid(),
  type: z.literal('audit.integrity-violation.detected.v1'),
  version: z.literal('1.0'),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('IntegrityViolation'),
  data: IntegrityViolationDetectedEventDataSchema,
  metadata: z.object({
    correlationId: z.string().uuid(),
    causationId: z.string().uuid(),
    userId: z.string().uuid().optional()
  })
});
```

---

#### 12.1.4 audit.anomaly.detected.v1

**Description**: Published when suspicious access patterns are detected

**Schema**:
```typescript
export const AnomalyDetectedEventDataSchema = z.object({
  anomalyId: z.string().uuid(),
  detectedAt: z.string().datetime(),
  accessLogId: z.string().uuid(),
  userId: z.string().uuid(),
  userEmail: z.string().email(),
  anomalyType: z.enum(['unusual_time', 'unusual_location', 'excessive_access', 'privilege_escalation']),
  confidence: z.number().min(0).max(1),  // 0-1
  baselineDeviation: z.number().nonnegative(),
  details: z.object({
    expectedValue: z.string().optional(),
    actualValue: z.string().optional(),
    threshold: z.number().optional()
  }),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  alertSent: z.boolean(),
  requiresInvestigation: z.boolean()
});

export type AnomalyDetectedEventData = z.infer<typeof AnomalyDetectedEventDataSchema>;

export const AnomalyDetectedEvent = z.object({
  id: z.string().uuid(),
  type: z.literal('audit.anomaly.detected.v1'),
  version: z.literal('1.0'),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Anomaly'),
  data: AnomalyDetectedEventDataSchema,
  metadata: z.object({
    correlationId: z.string().uuid(),
    causationId: z.string().uuid(),
    userId: z.string().uuid().optional()
  })
});
```

---

#### 12.1.5 audit.retention.archived.v1

**Description**: Published when events are archived to S3 for long-term retention

**Schema**:
```typescript
export const RetentionArchivedEventDataSchema = z.object({
  archiveId: z.string().uuid(),
  archivedAt: z.string().datetime(),
  eventCount: z.number().int().positive(),
  dateRange: z.object({
    from: z.string().datetime(),
    to: z.string().datetime()
  }),
  s3Location: z.object({
    bucket: z.string().min(1).max(255),
    key: z.string().min(1).max(1024)
  }),
  storageClass: z.enum(['STANDARD', 'GLACIER', 'DEEP_ARCHIVE']),
  encrypted: z.boolean(),
  kmsKeyId: z.string().optional(),
  sizeBytes: z.number().int().positive(),
  deletedFromHotStorage: z.boolean()
});

export type RetentionArchivedEventData = z.infer<typeof RetentionArchivedEventDataSchema>;

export const RetentionArchivedEvent = z.object({
  id: z.string().uuid(),
  type: z.literal('audit.retention.archived.v1'),
  version: z.literal('1.0'),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Archive'),
  data: RetentionArchivedEventDataSchema,
  metadata: z.object({
    correlationId: z.string().uuid(),
    causationId: z.string().uuid(),
    userId: z.string().uuid().optional()
  })
});
```

---

### 12.2 Event Versioning Strategy

```typescript
// Event version registry
export const EVENT_VERSIONS = {
  'audit.event.ingested': {
    current: 'v1',
    supported: ['v1'],
    deprecated: []
  },
  'audit.gdpr-request.completed': {
    current: 'v1',
    supported: ['v1'],
    deprecated: []
  },
  'audit.integrity-violation.detected': {
    current: 'v1',
    supported: ['v1'],
    deprecated: []
  },
  'audit.anomaly.detected': {
    current: 'v1',
    supported: ['v1'],
    deprecated: []
  },
  'audit.retention.archived': {
    current: 'v1',
    supported: ['v1'],
    deprecated: []
  }
};
```

---

## 13. Caching Strategy

### 13.1 Cache Architecture

The Audit Service uses a **2-layer caching strategy**:

1. **Layer 1**: Redis (distributed cache for lineage graphs and query results)
2. **Layer 2**: In-memory deduplication (event processing)

**Key Principle**: Audit events themselves are NEVER cached (immutable, append-only). Only lineage graphs and aggregated query results are cached.

### 13.2 Cache Configuration

```typescript
// src/infrastructure/caching/audit-cache.config.ts
export const AUDIT_CACHE_CONFIG = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    db: 3,  // Dedicated DB for audit service
    ttl: {
      lineageGraph: 600,         // 10 minutes
      queryResults: 300,         // 5 minutes
      eventDeduplication: 3600,  // 1 hour
      userAccessProfile: 1800    // 30 minutes
    }
  }
};
```

### 13.3 Lineage Cache Implementation

```typescript
// src/infrastructure/caching/lineage-cache.service.ts
import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';
import { LineageGraph } from '@/domain/entities/lineage-graph.entity';

@Injectable()
export class LineageCacheService {
  constructor(private readonly redis: RedisService) {}

  async getLineage(
    entityType: string,
    entityId: string
  ): Promise<LineageGraph | null> {
    const key = this.buildLineageKey(entityType, entityId);

    const cached = await this.redis.get(key);
    if (!cached) {
      return null;
    }

    return JSON.parse(cached) as LineageGraph;
  }

  async setLineage(
    entityType: string,
    entityId: string,
    lineage: LineageGraph
  ): Promise<void> {
    const key = this.buildLineageKey(entityType, entityId);
    const ttl = AUDIT_CACHE_CONFIG.redis.ttl.lineageGraph;

    await this.redis.setex(key, ttl, JSON.stringify(lineage));
  }

  async invalidateLineage(
    entityType: string,
    entityId: string
  ): Promise<void> {
    const key = this.buildLineageKey(entityType, entityId);
    await this.redis.del(key);
  }

  private buildLineageKey(entityType: string, entityId: string): string {
    return `lineage:${entityType}:${entityId}`;
  }
}
```

### 13.4 Event Deduplication Cache

```typescript
// src/infrastructure/caching/event-deduplication.service.ts
import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class EventDeduplicationService {
  constructor(private readonly redis: RedisService) {}

  async isDuplicate(eventId: string): Promise<boolean> {
    const key = this.buildDedupeKey(eventId);
    return await this.redis.exists(key) === 1;
  }

  async markAsProcessed(eventId: string): Promise<void> {
    const key = this.buildDedupeKey(eventId);
    const ttl = AUDIT_CACHE_CONFIG.redis.ttl.eventDeduplication;

    await this.redis.setex(key, ttl, '1');
  }

  private buildDedupeKey(eventId: string): string {
    return `event:dedupe:${eventId}`;
  }
}
```

### 13.5 Query Results Cache

```typescript
// src/infrastructure/caching/query-cache.service.ts
import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';
import { AuditQueryFilters } from '@/application/queries/audit-query.dto';

@Injectable()
export class QueryCacheService {
  constructor(private readonly redis: RedisService) {}

  async getCachedQuery(
    filters: AuditQueryFilters,
    page: number,
    limit: number
  ): Promise<any | null> {
    const key = this.buildQueryKey(filters, page, limit);

    const cached = await this.redis.get(key);
    if (!cached) {
      return null;
    }

    return JSON.parse(cached);
  }

  async cacheQuery(
    filters: AuditQueryFilters,
    page: number,
    limit: number,
    result: any
  ): Promise<void> {
    const key = this.buildQueryKey(filters, page, limit);
    const ttl = AUDIT_CACHE_CONFIG.redis.ttl.queryResults;

    await this.redis.setex(key, ttl, JSON.stringify(result));
  }

  private buildQueryKey(
    filters: AuditQueryFilters,
    page: number,
    limit: number
  ): string {
    // Create deterministic cache key from query parameters
    const filterHash = this.hashFilters(filters);
    return `query:${filterHash}:p${page}:l${limit}`;
  }

  private hashFilters(filters: AuditQueryFilters): string {
    const crypto = require('crypto');
    return crypto
      .createHash('md5')
      .update(JSON.stringify(filters))
      .digest('hex');
  }
}
```

### 13.6 Cache Invalidation Strategy

**Invalidation Triggers**:

| Event Type | Cache Invalidation |
|------------|-------------------|
| `audit.event.ingested.v1` | Invalidate lineage cache for affected entities |
| `organization.hierarchy.updated.v1` | Invalidate all lineage caches for project |
| `activity.data.verified.v1` | Invalidate lineage for activity data |
| `calculation.emission.calculated.v1` | Invalidate lineage for calculation |

**Implementation**:
```typescript
@EventsHandler('organization.hierarchy.updated.v1')
export class HierarchyUpdatedHandler {
  constructor(private lineageCache: LineageCacheService) {}

  async handle(event: HierarchyUpdatedEvent): Promise<void> {
    // Invalidate lineage for all entities in project
    const projectId = event.data.projectId;

    // Pattern-based deletion (Redis SCAN + DEL)
    await this.lineageCache.invalidateByPattern(`lineage:*:project-${projectId}:*`);
  }
}
```

### 13.7 Cache Monitoring

```typescript
// src/infrastructure/monitoring/cache-metrics.service.ts
import { Injectable } from '@nestjs/common';
import { PrometheusService } from './prometheus.service';

@Injectable()
export class CacheMetricsService {
  private hitCounter: Counter;
  private missCounter: Counter;
  private sizeGauge: Gauge;

  constructor(private prometheus: PrometheusService) {
    this.hitCounter = this.prometheus.createCounter({
      name: 'audit_cache_hits_total',
      help: 'Total number of cache hits',
      labelNames: ['cache_type']
    });

    this.missCounter = this.prometheus.createCounter({
      name: 'audit_cache_misses_total',
      help: 'Total number of cache misses',
      labelNames: ['cache_type']
    });

    this.sizeGauge = this.prometheus.createGauge({
      name: 'audit_cache_size_bytes',
      help: 'Current cache size in bytes',
      labelNames: ['cache_type']
    });
  }

  recordHit(cacheType: string): void {
    this.hitCounter.inc({ cache_type: cacheType });
  }

  recordMiss(cacheType: string): void {
    this.missCounter.inc({ cache_type: cacheType });
  }

  updateSize(cacheType: string, sizeBytes: number): void {
    this.sizeGauge.set({ cache_type: cacheType }, sizeBytes);
  }
}
```

---

## 14. Circuit Breaker Configuration

### 14.1 Circuit Breaker Pattern

The Audit Service uses circuit breakers for external dependencies to prevent cascading failures.

**Dependencies Requiring Circuit Breakers**:
1. Identity Service (user enrichment)
2. Geolocation Service (IP lookup)
3. S3 (archive storage)
4. Event Bus (event consumption)

### 14.2 Circuit Breaker Configuration

```typescript
// src/infrastructure/resilience/circuit-breaker.config.ts
export const CIRCUIT_BREAKER_CONFIG = {
  identityService: {
    timeout: 5000,              // 5 seconds
    errorThresholdPercentage: 50,
    resetTimeout: 30000,        // 30 seconds
    rollingCountBuckets: 10,
    rollingCountTimeout: 10000,
    volumeThreshold: 10,
    fallback: 'skipEnrichment'
  },
  geolocationService: {
    timeout: 3000,              // 3 seconds
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
    rollingCountBuckets: 10,
    rollingCountTimeout: 10000,
    volumeThreshold: 10,
    fallback: 'useDefaultLocation'
  },
  s3Archive: {
    timeout: 30000,             // 30 seconds (large file uploads)
    errorThresholdPercentage: 50,
    resetTimeout: 60000,        // 1 minute
    rollingCountBuckets: 10,
    rollingCountTimeout: 10000,
    volumeThreshold: 5,
    fallback: 'retainInMongoDB'
  },
  eventBus: {
    timeout: 10000,             // 10 seconds
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
    rollingCountBuckets: 10,
    rollingCountTimeout: 10000,
    volumeThreshold: 20,
    fallback: 'queueLocally'
  }
};
```

### 14.3 Identity Service Circuit Breaker

```typescript
// src/infrastructure/http/identity-service.client.ts
import { Injectable } from '@nestjs/common';
import CircuitBreaker from 'opossum';
import { CIRCUIT_BREAKER_CONFIG } from '../resilience/circuit-breaker.config';

@Injectable()
export class IdentityServiceClient {
  private breaker: CircuitBreaker;

  constructor() {
    this.breaker = new CircuitBreaker(
      this.fetchUser.bind(this),
      {
        timeout: CIRCUIT_BREAKER_CONFIG.identityService.timeout,
        errorThresholdPercentage: CIRCUIT_BREAKER_CONFIG.identityService.errorThresholdPercentage,
        resetTimeout: CIRCUIT_BREAKER_CONFIG.identityService.resetTimeout
      }
    );

    // Fallback when circuit is open
    this.breaker.fallback(() => ({
      enrichmentSkipped: true,
      reason: 'Identity service circuit breaker open'
    }));

    // Monitor circuit breaker state
    this.breaker.on('open', () => {
      logger.warn('Identity service circuit breaker opened');
    });

    this.breaker.on('halfOpen', () => {
      logger.info('Identity service circuit breaker half-open');
    });

    this.breaker.on('close', () => {
      logger.info('Identity service circuit breaker closed');
    });
  }

  async getUser(userId: string): Promise<any> {
    return this.breaker.fire(userId);
  }

  private async fetchUser(userId: string): Promise<any> {
    const response = await fetch(
      `${process.env.IDENTITY_SERVICE_URL}/v1/users/${userId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.getServiceToken()}`,
          'X-Service-Name': 'audit-service'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Identity service returned ${response.status}`);
    }

    return response.json();
  }
}
```

### 14.4 S3 Archive Circuit Breaker

```typescript
// src/infrastructure/storage/s3-archive.client.ts
import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import CircuitBreaker from 'opossum';
import { CIRCUIT_BREAKER_CONFIG } from '../resilience/circuit-breaker.config';

@Injectable()
export class S3ArchiveClient {
  private s3: S3Client;
  private breaker: CircuitBreaker;

  constructor() {
    this.s3 = new S3Client({ region: process.env.AWS_REGION });

    this.breaker = new CircuitBreaker(
      this.uploadToS3.bind(this),
      {
        timeout: CIRCUIT_BREAKER_CONFIG.s3Archive.timeout,
        errorThresholdPercentage: CIRCUIT_BREAKER_CONFIG.s3Archive.errorThresholdPercentage,
        resetTimeout: CIRCUIT_BREAKER_CONFIG.s3Archive.resetTimeout
      }
    );

    // Fallback: Keep in MongoDB hot storage
    this.breaker.fallback((key, data) => {
      logger.warn('S3 circuit breaker open - events retained in MongoDB', { key });
      return {
        archived: false,
        location: 'mongodb',
        reason: 'S3 unavailable'
      };
    });
  }

  async archiveEvents(key: string, data: Buffer): Promise<any> {
    return this.breaker.fire(key, data);
  }

  private async uploadToS3(key: string, data: Buffer): Promise<any> {
    await this.s3.send(new PutObjectCommand({
      Bucket: process.env.S3_AUDIT_ARCHIVE_BUCKET,
      Key: key,
      Body: data,
      ServerSideEncryption: 'aws:kms',
      SSEKMSKeyId: process.env.KMS_AUDIT_KEY_ID
    }));

    return {
      archived: true,
      location: 's3',
      bucket: process.env.S3_AUDIT_ARCHIVE_BUCKET,
      key
    };
  }
}
```

### 14.5 Circuit Breaker Metrics

```typescript
// src/infrastructure/monitoring/circuit-breaker-metrics.service.ts
import { Injectable } from '@nestjs/common';
import { PrometheusService } from './prometheus.service';
import CircuitBreaker from 'opossum';

@Injectable()
export class CircuitBreakerMetricsService {
  private stateGauge: Gauge;
  private callsCounter: Counter;
  private failuresCounter: Counter;

  constructor(private prometheus: PrometheusService) {
    this.stateGauge = this.prometheus.createGauge({
      name: 'audit_circuit_breaker_state',
      help: 'Circuit breaker state (0=closed, 1=open, 2=half_open)',
      labelNames: ['service']
    });

    this.callsCounter = this.prometheus.createCounter({
      name: 'audit_circuit_breaker_calls_total',
      help: 'Total circuit breaker calls',
      labelNames: ['service', 'result']
    });

    this.failuresCounter = this.prometheus.createCounter({
      name: 'audit_circuit_breaker_failures_total',
      help: 'Total circuit breaker failures',
      labelNames: ['service']
    });
  }

  monitorBreaker(serviceName: string, breaker: CircuitBreaker): void {
    breaker.on('success', () => {
      this.callsCounter.inc({ service: serviceName, result: 'success' });
    });

    breaker.on('failure', () => {
      this.callsCounter.inc({ service: serviceName, result: 'failure' });
      this.failuresCounter.inc({ service: serviceName });
    });

    breaker.on('open', () => {
      this.stateGauge.set({ service: serviceName }, 1);
    });

    breaker.on('halfOpen', () => {
      this.stateGauge.set({ service: serviceName }, 2);
    });

    breaker.on('close', () => {
      this.stateGauge.set({ service: serviceName }, 0);
    });
  }
}
```

---

## 15. Performance SLOs (Service Level Objectives)

### 15.1 Response Time SLOs

| Operation | p50 | p95 | p99 | Availability | Max Throughput |
|-----------|-----|-----|-----|--------------|----------------|
| Event Ingestion | < 20ms | < 50ms | < 100ms | 99.9% | 10,000 events/sec |
| Audit Query (Simple) | < 200ms | < 500ms | < 1s | 99.5% | 1,000 queries/sec |
| Audit Query (Complex) | < 500ms | < 1s | < 2s | 99.5% | 100 queries/sec |
| Lineage Trace (5 levels) | < 300ms | < 800ms | < 1.5s | 99.5% | 500 queries/sec |
| GDPR Data Export | < 30s | < 60s | < 2min | 99% | 10 requests/min |
| Integrity Verification | < 5s | < 10s | < 20s | 99% | 100 verifications/hour |

### 15.2 Benchmarking Scripts

#### K6 Event Ingestion Load Test

```javascript
// k6/audit-event-ingestion.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const ingestionRate = new Rate('event_ingestion_success_rate');
const ingestionDuration = new Trend('event_ingestion_duration');

export const options = {
  stages: [
    { duration: '2m', target: 1000 },   // Ramp to 1k events/sec
    { duration: '5m', target: 1000 },   // Sustain 1k events/sec
    { duration: '2m', target: 5000 },   // Spike to 5k events/sec
    { duration: '5m', target: 5000 },   // Sustain 5k events/sec
    { duration: '2m', target: 0 }       // Ramp down
  ],
  thresholds: {
    'event_ingestion_success_rate': ['rate>0.999'],  // 99.9% success
    'event_ingestion_duration': ['p(95)<50']         // p95 < 50ms
  }
};

export default function () {
  const event = {
    id: `event-${__VU}-${__ITER}`,
    type: 'activity.data.verified.v1',
    version: '1.0',
    occurredAt: new Date().toISOString(),
    aggregateId: `activity-${Math.floor(Math.random() * 10000)}`,
    aggregateType: 'ActivityData',
    data: {
      verifiedBy: 'user-123',
      verifiedAt: new Date().toISOString()
    },
    metadata: {
      correlationId: `req-${__VU}`,
      userId: 'user-123',
      sourceService: 'activity-service'
    }
  };

  const response = http.post(
    'http://localhost:3007/v1/events',
    JSON.stringify(event),
    {
      headers: { 'Content-Type': 'application/json' }
    }
  );

  const success = check(response, {
    'status is 202': (r) => r.status === 202,
    'response time < 100ms': (r) => r.timings.duration < 100
  });

  ingestionRate.add(success);
  ingestionDuration.add(response.timings.duration);

  sleep(0.001);  // 1ms sleep between iterations
}
```

#### K6 Audit Query Load Test

```javascript
// k6/audit-query.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const queryRate = new Rate('query_success_rate');
const queryDuration = new Trend('query_duration');

export const options = {
  stages: [
    { duration: '1m', target: 100 },    // Ramp to 100 queries/sec
    { duration: '3m', target: 100 },    // Sustain
    { duration: '1m', target: 0 }       // Ramp down
  ],
  thresholds: {
    'query_success_rate': ['rate>0.995'],  // 99.5% success
    'query_duration': ['p(95)<500']        // p95 < 500ms
  }
};

export default function () {
  const filters = {
    eventType: 'activity.data.verified.v1',
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
    page: 1,
    limit: 100
  };

  const url = `http://localhost:3007/v1/audit/events?${new URLSearchParams(filters)}`;

  const response = http.get(url, {
    headers: {
      'Authorization': `Bearer ${__ENV.JWT_TOKEN}`
    }
  });

  const success = check(response, {
    'status is 200': (r) => r.status === 200,
    'has events': (r) => JSON.parse(r.body).events.length > 0,
    'response time < 1s': (r) => r.timings.duration < 1000
  });

  queryRate.add(success);
  queryDuration.add(response.timings.duration);

  sleep(1);
}
```

### 15.3 Prometheus Alerts

```yaml
# prometheus/audit-alerts.yml
groups:
  - name: audit_service_slos
    interval: 30s
    rules:
      # Event Ingestion SLO
      - alert: AuditEventIngestionSlow
        expr: histogram_quantile(0.95, rate(audit_event_ingestion_duration_seconds_bucket[5m])) > 0.05
        for: 5m
        labels:
          severity: warning
          service: audit-service
        annotations:
          summary: "Audit event ingestion p95 > 50ms"
          description: "Event ingestion is slower than SLO (p95: {{ $value }}s)"

      - alert: AuditEventIngestionFailureRate
        expr: rate(audit_event_ingestion_failures_total[5m]) / rate(audit_event_ingestion_total[5m]) > 0.001
        for: 5m
        labels:
          severity: critical
          service: audit-service
        annotations:
          summary: "Audit event ingestion failure rate > 0.1%"
          description: "Event ingestion failures: {{ $value | humanizePercentage }}"

      # Query Performance SLO
      - alert: AuditQuerySlow
        expr: histogram_quantile(0.95, rate(audit_query_duration_seconds_bucket[5m])) > 0.5
        for: 5m
        labels:
          severity: warning
          service: audit-service
        annotations:
          summary: "Audit query p95 > 500ms"
          description: "Audit queries are slower than SLO (p95: {{ $value }}s)"

      # Integrity Violation Alert (CRITICAL)
      - alert: AuditIntegrityViolation
        expr: increase(audit_integrity_violations_total[5m]) > 0
        for: 1m
        labels:
          severity: critical
          service: audit-service
          page: security-team
        annotations:
          summary: "CRITICAL: Audit log integrity violation detected"
          description: "{{ $value }} integrity violations detected - possible tampering"

      # Anomaly Detection Alert
      - alert: AuditAnomalyDetected
        expr: increase(audit_anomalies_detected_total{confidence="high"}[5m]) > 5
        for: 2m
        labels:
          severity: warning
          service: audit-service
        annotations:
          summary: "High-confidence anomalies detected"
          description: "{{ $value }} high-confidence anomalies in last 5 minutes"

      # S3 Archive Failure
      - alert: AuditArchiveFailure
        expr: rate(audit_archive_failures_total[10m]) > 0.1
        for: 10m
        labels:
          severity: warning
          service: audit-service
        annotations:
          summary: "Audit event archival to S3 failing"
          description: "Archive failure rate: {{ $value | humanizePercentage }}"

      # Circuit Breaker Alert
      - alert: AuditCircuitBreakerOpen
        expr: audit_circuit_breaker_state{service="identity-service"} == 1
        for: 2m
        labels:
          severity: warning
          service: audit-service
        annotations:
          summary: "Circuit breaker open for {{ $labels.service }}"
          description: "Event enrichment degraded - identity service unavailable"
```

### 15.4 Capacity Planning

**Current System Capacity**:
- **Events**: 10M events/day = 115 events/second average
- **Peak Load**: 5x average = 575 events/second
- **Query Load**: 100,000 queries/day = 1.15 queries/second average
- **Storage Growth**: ~365M events/year @ 5KB/event = 1.8 TB/year

**Scaling Thresholds**:
| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| Event ingestion rate | > 400 events/sec | > 800 events/sec | Add event consumer instances |
| MongoDB connections | > 80% | > 95% | Increase connection pool |
| Redis memory | > 80% | > 95% | Add Redis nodes or evict old data |
| Query response time p95 | > 400ms | > 800ms | Add read replicas |
| Disk usage | > 80% | > 90% | Archive to S3 |

---

## 16. Disaster Recovery

### 16.1 RTO/RPO Targets

| Component | RTO (Recovery Time Objective) | RPO (Recovery Point Objective) | Priority |
|-----------|-------------------------------|--------------------------------|----------|
| Audit Event Ingestion | 15 minutes | 0 (no data loss) | P0 (Critical) |
| Audit Queries | 30 minutes | N/A (read-only) | P1 (High) |
| GDPR Requests | 4 hours | 1 hour | P2 (Medium) |
| S3 Archive | 24 hours | 24 hours | P3 (Low) |
| Data Lineage | 1 hour | 1 hour | P2 (Medium) |

### 16.2 Backup Strategy

#### MongoDB Backup

```yaml
# Continuous Backup Strategy
Backup Type: Continuous (Point-in-Time Recovery)
Provider: MongoDB Atlas OR AWS Backup
Frequency: Continuous WAL archiving
Retention:
  - Hourly snapshots: 7 days
  - Daily snapshots: 30 days
  - Weekly snapshots: 1 year
  - Monthly snapshots: 7 years (compliance requirement)

# Manual Backup Schedule
mongodump:
  frequency: Daily at 2 AM UTC
  retention: 90 days
  destination: s3://clenergize-backups/audit-db/
  encryption: AES-256 with AWS KMS
  compression: gzip
```

**Automated Backup Script**:
```bash
#!/bin/bash
# backup-audit-db.sh

DATE=$(date +%Y-%m-%d)
BACKUP_NAME="audit-db-${DATE}"
S3_BUCKET="s3://clenergize-backups/audit-db"
KMS_KEY_ID="arn:aws:kms:us-east-1:123456789:key/backup-encryption"

# Create backup
mongodump \
  --uri="${MONGODB_URI}" \
  --db=clenergize_audit \
  --gzip \
  --archive="/tmp/${BACKUP_NAME}.archive.gz"

# Encrypt and upload to S3
aws s3 cp "/tmp/${BACKUP_NAME}.archive.gz" \
  "${S3_BUCKET}/${BACKUP_NAME}.archive.gz" \
  --sse aws:kms \
  --sse-kms-key-id "${KMS_KEY_ID}"

# Cleanup local backup
rm "/tmp/${BACKUP_NAME}.archive.gz"

# Verify backup
aws s3 ls "${S3_BUCKET}/${BACKUP_NAME}.archive.gz"

echo "Backup completed: ${BACKUP_NAME}"
```

#### S3 Archive Backup

```yaml
# S3 Versioning
Versioning: Enabled
Lifecycle Rules:
  - Transition to Glacier after 90 days
  - Transition to Deep Archive after 3 years
  - Delete non-current versions after 30 days

# Cross-Region Replication
Primary Region: us-east-1
Replica Region: us-west-2
Replication: Real-time
Encryption: KMS (separate key per region)
```

### 16.3 Recovery Procedures

#### Scenario 1: Complete Database Loss

```bash
#!/bin/bash
# restore-audit-db.sh

# 1. Identify latest backup
LATEST_BACKUP=$(aws s3 ls s3://clenergize-backups/audit-db/ \
  --recursive | sort | tail -n 1 | awk '{print $4}')

echo "Restoring from: ${LATEST_BACKUP}"

# 2. Download backup
aws s3 cp "s3://clenergize-backups/audit-db/${LATEST_BACKUP}" \
  /tmp/restore.archive.gz \
  --sse aws:kms

# 3. Restore to MongoDB
mongorestore \
  --uri="${MONGODB_URI}" \
  --gzip \
  --archive="/tmp/restore.archive.gz" \
  --drop  # Drop existing collections first

# 4. Verify restoration
mongo "${MONGODB_URI}" --eval "
  db = db.getSiblingDB('clenergize_audit');
  print('Total audit events: ' + db.audit_events.count());
  print('Total access logs: ' + db.access_logs.count());
  print('Total GDPR requests: ' + db.gdpr_requests.count());
"

# 5. Rebuild indexes
mongo "${MONGODB_URI}" --eval "
  db = db.getSiblingDB('clenergize_audit');
  db.audit_events.createIndex({ eventId: 1 }, { unique: true });
  db.audit_events.createIndex({ type: 1, occurredAt: -1 });
  db.audit_events.createIndex({ aggregateId: 1, aggregateType: 1, occurredAt: -1 });
  db.access_logs.createIndex({ accessLogId: 1 }, { unique: true });
  db.access_logs.createIndex({ userId: 1, timestamp: -1 });
"

# 6. Verify integrity
npm run verify:integrity

echo "Database restoration complete"
```

#### Scenario 2: Point-in-Time Recovery (Data Corruption)

```bash
#!/bin/bash
# restore-to-point-in-time.sh

TARGET_TIME="$1"  # e.g., "2024-11-18T10:00:00Z"

if [ -z "$TARGET_TIME" ]; then
  echo "Usage: $0 <target-time>"
  exit 1
fi

echo "Restoring to point-in-time: ${TARGET_TIME}"

# Using MongoDB Atlas PITR
# Note: This requires MongoDB Atlas subscription with PITR enabled

# 1. Create restore job via Atlas API
curl -X POST \
  "https://cloud.mongodb.com/api/atlas/v1.0/groups/${ATLAS_PROJECT_ID}/clusters/${CLUSTER_NAME}/backup/restoreJobs" \
  --user "${ATLAS_PUBLIC_KEY}:${ATLAS_PRIVATE_KEY}" \
  --digest \
  -H "Content-Type: application/json" \
  -d "{
    \"deliveryType\": \"pointInTime\",
    \"pointInTimeUTCSeconds\": $(date -d "${TARGET_TIME}" +%s),
    \"targetClusterName\": \"${CLUSTER_NAME}-restored\",
    \"targetGroupId\": \"${ATLAS_PROJECT_ID}\"
  }"

echo "PITR restore job created - check Atlas console for progress"
```

#### Scenario 3: S3 Archive Recovery

```bash
#!/bin/bash
# restore-archived-events.sh

START_DATE="$1"
END_DATE="$2"

echo "Restoring archived events from ${START_DATE} to ${END_DATE}"

# 1. List archived event files in date range
ARCHIVE_FILES=$(aws s3 ls s3://clenergize-audit-archive/events/ \
  --recursive | awk '{print $4}' | grep -E "${START_DATE}|${END_DATE}")

# 2. Download and decompress
mkdir -p /tmp/archive-restore

for file in ${ARCHIVE_FILES}; do
  echo "Downloading ${file}"
  aws s3 cp "s3://clenergize-audit-archive/${file}" /tmp/archive-restore/
done

# 3. Import back to MongoDB
for jsonFile in /tmp/archive-restore/*.json; do
  echo "Importing ${jsonFile}"
  mongoimport \
    --uri="${MONGODB_URI}" \
    --db=clenergize_audit \
    --collection=audit_events \
    --file="${jsonFile}" \
    --mode=upsert \
    --upsertFields=eventId
done

# 4. Cleanup
rm -rf /tmp/archive-restore

echo "Archived events restored successfully"
```

### 16.4 Disaster Recovery Testing

**DR Test Schedule**: Quarterly (every 3 months)

**Test Scenarios**:
1. **Full Database Restore**: Restore from backup and verify data integrity
2. **Point-in-Time Recovery**: Restore to specific timestamp
3. **S3 Archive Retrieval**: Restore archived events from Glacier
4. **Cross-Region Failover**: Switch to replica region

**Test Checklist**:
```markdown
## Quarterly DR Test Checklist

### Pre-Test
- [ ] Notify team of DR test
- [ ] Create test environment (separate from production)
- [ ] Document current state (event count, latest event ID)
- [ ] Set up monitoring

### Test Execution
- [ ] Simulate disaster scenario (delete test database)
- [ ] Execute restore procedure
- [ ] Verify data integrity (hash chain, event count)
- [ ] Verify query functionality
- [ ] Verify GDPR request processing
- [ ] Measure RTO (time to restore)
- [ ] Measure RPO (data loss)

### Post-Test
- [ ] Document results (RTO achieved, RPO achieved)
- [ ] Identify improvements to procedures
- [ ] Update runbooks based on learnings
- [ ] Share results with team
- [ ] Schedule next DR test
```

### 16.5 Data Retention and Deletion

**Automated Retention Management**:
```typescript
// src/application/jobs/retention-management.job.ts
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AuditEventRepository } from '@/infrastructure/database/repositories/audit-event.repository';
import { S3ArchiveClient } from '@/infrastructure/storage/s3-archive.client';

@Injectable()
export class RetentionManagementJob {
  constructor(
    private auditEventRepo: AuditEventRepository,
    private s3Archive: S3ArchiveClient
  ) {}

  // Run daily at 1 AM
  @Cron('0 1 * * *')
  async handleRetention(): Promise<void> {
    const now = new Date();

    // Step 1: Archive events older than 1 year to S3
    await this.archiveOldEvents(now);

    // Step 2: Delete events past retention period
    await this.deleteExpiredEvents(now);

    // Step 3: Move S3 Standard to Glacier (events 1-3 years old)
    await this.transitionToGlacier(now);
  }

  private async archiveOldEvents(now: Date): Promise<void> {
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const eventsToArchive = await this.auditEventRepo.find({
      'audit.receivedAt': { $lt: oneYearAgo },
      'retentionPolicy.archived': false
    });

    for (const event of eventsToArchive) {
      // Upload to S3
      const s3Key = `events/${event.occurredAt.getFullYear()}/${event.eventId}.json`;
      await this.s3Archive.archiveEvents(s3Key, Buffer.from(JSON.stringify(event)));

      // Mark as archived
      await this.auditEventRepo.updateOne(
        { eventId: event.eventId },
        {
          'retentionPolicy.archived': true,
          'retentionPolicy.archivedAt': new Date(),
          'retentionPolicy.archiveLocation': s3Key
        }
      );

      // Delete from hot storage (keep metadata only)
      await this.auditEventRepo.deleteOne({ eventId: event.eventId });
    }

    logger.info('Events archived', { count: eventsToArchive.length });
  }

  private async deleteExpiredEvents(now: Date): Promise<void> {
    const expiredEvents = await this.auditEventRepo.find({
      'retentionPolicy.deleteAfter': { $lt: now },
      'retentionPolicy.legalHold': false
    });

    for (const event of expiredEvents) {
      // Delete from S3 archive
      if (event.retentionPolicy.archiveLocation) {
        await this.s3Archive.deleteObject(event.retentionPolicy.archiveLocation);
      }

      // Delete from MongoDB
      await this.auditEventRepo.deleteOne({ eventId: event.eventId });
    }

    logger.info('Expired events deleted', { count: expiredEvents.length });
  }
}
```

---

## 17. OpenAPI Specification

### 17.1 Swagger Configuration

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Clenergize Audit Service API')
    .setDescription('Compliance, audit logging, and data lineage tracking')
    .setVersion('1.0')
    .addTag('Events', 'Audit event ingestion and queries')
    .addTag('Access Logs', 'Access logging and anomaly detection')
    .addTag('GDPR', 'GDPR data subject requests')
    .addTag('Compliance', 'Compliance reports and retention management')
    .addTag('Integrity', 'Audit log integrity verification')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer('http://localhost:3007', 'Local Development')
    .addServer('https://api-dev.clenergize.com', 'Development')
    .addServer('https://api.clenergize.com', 'Production')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha'
    }
  });

  await app.listen(3007);
  console.log(`Audit Service running on http://localhost:3007`);
  console.log(`API Documentation: http://localhost:3007/api/docs`);
}

bootstrap();
```

### 17.2 API Documentation Examples

#### Event Query Endpoint

```typescript
// src/infrastructure/http/controllers/audit-events.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/infrastructure/auth/jwt-auth.guard';

@ApiTags('Events')
@Controller('v1/audit/events')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AuditEventsController {

  @Get()
  @ApiOperation({
    summary: 'Query audit events',
    description: 'Search and filter audit events with pagination. Supports full-text search, date ranges, and filtering by user/project/event type.'
  })
  @ApiQuery({ name: 'eventType', required: false, description: 'Filter by event type (e.g., identity.user.created.v1)' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'projectId', required: false, description: 'Filter by project ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (ISO 8601)', example: '2024-01-01T00:00:00Z' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (ISO 8601)', example: '2024-12-31T23:59:59Z' })
  @ApiQuery({ name: 'search', required: false, description: 'Full-text search query' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Results per page (max: 1000, default: 100)' })
  @ApiResponse({
    status: 200,
    description: 'Audit events retrieved successfully',
    schema: {
      example: {
        events: [
          {
            eventId: '550e8400-e29b-41d4-a716-446655440000',
            type: 'identity.user.created.v1',
            version: '1.0',
            occurredAt: '2024-11-18T10:30:00Z',
            aggregateId: 'user-123',
            aggregateType: 'User',
            data: { email: 'user@example.com' },
            audit: {
              userId: 'admin-123',
              userEmail: 'admin@example.com',
              sourceIp: '192.168.1.100',
              sourceService: 'identity-service'
            }
          }
        ],
        pagination: {
          page: 1,
          limit: 100,
          totalRecords: 5000,
          totalPages: 50
        },
        query: {
          filters: { eventType: 'identity.user.created.v1' },
          duration: 127
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async queryEvents(@Query() queryDto: AuditQueryDto) {
    return this.queryHandler.execute(queryDto);
  }
}
```

#### GDPR Request Endpoint

```typescript
@ApiTags('GDPR')
@Controller('v1/gdpr/requests')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class GDPRRequestsController {

  @Post()
  @ApiOperation({
    summary: 'Create GDPR data subject request',
    description: 'Submit a GDPR request for access, erasure, rectification, portability, or objection. Must be completed within 30 days per GDPR Article 12(3).'
  })
  @ApiResponse({
    status: 201,
    description: 'GDPR request created successfully',
    schema: {
      example: {
        requestId: '550e8400-e29b-41d4-a716-446655440000',
        reference: 'GDPR-2024-001',
        requestType: 'access',
        status: 'pending',
        estimatedCompletionDate: '2024-12-18T10:30:00Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 403, description: 'Not authorized to make GDPR request for this user' })
  async createGDPRRequest(@Body() requestDto: CreateGDPRRequestDto) {
    return this.createGDPRRequestHandler.execute(requestDto);
  }
}
```

---

## 18. Security Hardening

### 18.1 Input Validation with Zod

**Strict validation for all API inputs**:

```typescript
// src/application/commands/create-gdpr-request/create-gdpr-request.dto.ts
import { z } from 'zod';

export const CreateGDPRRequestDtoSchema = z.object({
  requestType: z.enum(['access', 'erasure', 'rectification', 'portability', 'object'], {
    required_error: 'Request type is required',
    invalid_type_error: 'Invalid request type'
  }),
  subjectUserId: z.string().uuid({
    message: 'Subject user ID must be a valid UUID'
  }),
  subjectEmail: z.string().email({
    message: 'Subject email must be a valid email address'
  }),
  requestedBy: z.string().uuid({
    message: 'Requester ID must be a valid UUID'
  }),
  reason: z.string()
    .min(10, 'Reason must be at least 10 characters')
    .max(1000, 'Reason must not exceed 1000 characters'),
  legalBasis: z.string()
    .max(500, 'Legal basis must not exceed 500 characters')
    .optional()
}).strict();  // Reject unknown properties

export type CreateGDPRRequestDto = z.infer<typeof CreateGDPRRequestDtoSchema>;

// Validation Pipe
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      throw new BadRequestException({
        code: 'AUD_VAL_005',
        message: 'GDPR request validation failed',
        errors: error.errors
      });
    }
  }
}
```

### 18.2 Authorization Guards

**Role-Based Access Control (RBAC)**:

```typescript
// src/infrastructure/auth/guards/audit-access.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuditAccessGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Only admins and auditors can access audit logs
    const allowedRoles = ['ADMIN', 'AUDITOR', 'COMPLIANCE_OFFICER'];

    if (!user || !allowedRoles.includes(user.role)) {
      throw new ForbiddenException({
        code: 'AUD_AUTH_021',
        message: 'Insufficient permissions to access audit logs',
        userMessage: 'You do not have permission to view audit logs'
      });
    }

    return true;
  }
}

// Usage in controller
@Controller('v1/audit/events')
@UseGuards(JwtAuthGuard, AuditAccessGuard)
export class AuditEventsController {
  // Only admins/auditors can access this
}
```

**Organization-Level Data Isolation**:

```typescript
// src/infrastructure/auth/guards/organization-isolation.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class OrganizationIsolationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const queryOrganizationId = request.query.organizationId || request.body.organizationId;

    // Super admins can access all organizations
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    // Regular users can only access their own organization
    if (queryOrganizationId && queryOrganizationId !== user.organizationId) {
      throw new ForbiddenException({
        code: 'AUD_AUTH_023',
        message: 'Cannot access other organization audit logs',
        userMessage: 'You can only access audit logs for your organization'
      });
    }

    // Auto-filter by user's organization
    if (!queryOrganizationId) {
      request.query.organizationId = user.organizationId;
    }

    return true;
  }
}
```

### 18.3 Rate Limiting

**Prevent abuse and DoS attacks**:

```typescript
// src/infrastructure/http/middleware/rate-limit.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RedisService } from '../caching/redis.service';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  constructor(private redis: RedisService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const userId = req.user?.id || req.ip;
    const endpoint = req.path;

    // Define rate limits per endpoint
    const limits = {
      '/v1/audit/events': { max: 100, window: 60 },           // 100 queries/minute
      '/v1/access-logs': { max: 50, window: 60 },             // 50 queries/minute
      '/v1/gdpr/requests': { max: 10, window: 3600 },         // 10 GDPR requests/hour
      '/v1/integrity/verify': { max: 20, window: 3600 }       // 20 verifications/hour
    };

    const limit = limits[endpoint];
    if (!limit) {
      return next();  // No rate limit for this endpoint
    }

    const key = `ratelimit:${endpoint}:${userId}`;
    const current = await this.redis.incr(key);

    if (current === 1) {
      await this.redis.expire(key, limit.window);
    }

    const remaining = Math.max(0, limit.max - current);

    res.setHeader('X-RateLimit-Limit', limit.max);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Date.now() + limit.window * 1000);

    if (current > limit.max) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Rate limit exceeded. Max ${limit.max} requests per ${limit.window} seconds.`,
          retryAfter: limit.window
        }
      });
    }

    next();
  }
}
```

### 18.4 Audit Log Immutability

**Ensure audit logs cannot be modified**:

```typescript
// src/infrastructure/database/repositories/audit-event.repository.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { Collection, MongoClient } from 'mongodb';

@Injectable()
export class AuditEventRepository {
  private collection: Collection;

  constructor(private mongoClient: MongoClient) {
    this.collection = this.mongoClient.db('clenergize_audit').collection('audit_events');
  }

  // ✅ ALLOWED: Insert only
  async save(event: AuditEvent): Promise<void> {
    await this.collection.insertOne(event);
  }

  // ✅ ALLOWED: Read only
  async findOne(filter: any): Promise<AuditEvent | null> {
    return this.collection.findOne(filter);
  }

  async find(filter: any): Promise<AuditEvent[]> {
    return this.collection.find(filter).toArray();
  }

  // ❌ FORBIDDEN: Update operations
  async updateOne(filter: any, update: any): Promise<void> {
    // Only allow specific metadata updates (archived flag)
    const allowedUpdates = ['retentionPolicy.archived', 'retentionPolicy.archivedAt'];
    const updateKeys = Object.keys(update.$set || {});

    if (!updateKeys.every(key => allowedUpdates.includes(key))) {
      throw new ForbiddenException({
        code: 'AUD_AUTH_024',
        message: 'Cannot modify audit logs',
        userMessage: 'Audit logs are immutable and cannot be modified'
      });
    }

    await this.collection.updateOne(filter, update);
  }

  // ❌ FORBIDDEN: Delete operations (except for retention management)
  async deleteOne(filter: any): Promise<void> {
    // Only allow deletion for retention management (must have deleteAfter date)
    const event = await this.collection.findOne(filter);

    if (!event.retentionPolicy?.deleteAfter || event.retentionPolicy.legalHold) {
      throw new ForbiddenException({
        code: 'AUD_AUTH_024',
        message: 'Cannot delete audit log',
        userMessage: 'This audit log cannot be deleted (retention period or legal hold)'
      });
    }

    await this.collection.deleteOne(filter);
  }
}
```

### 18.5 Secrets Management

**Use AWS Secrets Manager for sensitive configuration**:

```typescript
// src/infrastructure/config/secrets.service.ts
import { Injectable } from '@nestjs/common';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

@Injectable()
export class SecretsService {
  private client: SecretsManagerClient;
  private cache: Map<string, { value: any; expiresAt: number }> = new Map();

  constructor() {
    this.client = new SecretsManagerClient({
      region: process.env.AWS_REGION || 'us-east-1',
      endpoint: process.env.LOCALSTACK_ENDPOINT  // For local development
    });
  }

  async getSecret(secretName: string): Promise<any> {
    // Check cache first (5 minute TTL)
    const cached = this.cache.get(secretName);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    try {
      const command = new GetSecretValueCommand({ SecretId: secretName });
      const response = await this.client.send(command);

      const secretValue = JSON.parse(response.SecretString);

      // Cache for 5 minutes
      this.cache.set(secretName, {
        value: secretValue,
        expiresAt: Date.now() + 300000
      });

      return secretValue;

    } catch (error) {
      logger.error('Failed to retrieve secret', { secretName, error: error.message });
      throw error;
    }
  }
}

// Usage in configuration
export class ConfigService {
  constructor(private secrets: SecretsService) {}

  async getDatabaseUri(): Promise<string> {
    const dbSecrets = await this.secrets.getSecret('clenergize/audit/database');
    return dbSecrets.MONGODB_URI;
  }

  async getKMSKeyId(): Promise<string> {
    const kmsSecrets = await this.secrets.getSecret('clenergize/audit/kms');
    return kmsSecrets.KMS_AUDIT_KEY_ID;
  }
}
```

### 18.6 Encryption at Rest and in Transit

**MongoDB Encryption**:
```yaml
# MongoDB Configuration
security:
  enableEncryption: true
  encryptionKeyFile: /etc/mongodb-keyfile  # For self-hosted
  # OR use AWS KMS for managed MongoDB Atlas

# Connection string with TLS
MONGODB_URI: "mongodb://user:pass@host:27017/clenergize_audit?tls=true&tlsCAFile=/etc/ssl/ca.pem"
```

**S3 Encryption**:
```typescript
// Always encrypt audit data in S3
await s3.send(new PutObjectCommand({
  Bucket: 'clenergize-audit-archive',
  Key: key,
  Body: data,
  ServerSideEncryption: 'aws:kms',
  SSEKMSKeyId: process.env.KMS_AUDIT_KEY_ID  // Dedicated KMS key for audit data
}));
```

**TLS Configuration**:
```typescript
// src/main.ts
import * as fs from 'fs';
import * as https from 'https';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync(process.env.TLS_KEY_PATH),
    cert: fs.readFileSync(process.env.TLS_CERT_PATH),
    ca: fs.readFileSync(process.env.TLS_CA_PATH)
  };

  const app = await NestFactory.create(AppModule, {
    httpsOptions  // Enable HTTPS
  });

  await app.listen(3007);
}
```

### 18.7 Security Monitoring

**Security Event Detection**:

```typescript
// src/application/events/handlers/security-event.handler.ts
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';

@EventsHandler('audit.integrity-violation.detected.v1')
@Injectable()
export class IntegrityViolationHandler implements IEventHandler {
  async handle(event: IntegrityViolationDetectedEvent) {
    // Send critical security alert
    await this.alertService.sendCriticalAlert({
      title: 'CRITICAL: Audit Log Tampering Detected',
      description: event.data.details,
      severity: 'CRITICAL',
      affectedSystem: 'audit-service',
      requiresImmediate Investigation: true,
      notifySecurityTeam: true,
      notifyCompliance: true
    });

    // Log to SIEM
    await this.siemService.logSecurityEvent({
      type: 'INTEGRITY_VIOLATION',
      event
    });

    // Trigger incident response workflow
    await this.incidentResponseService.createIncident({
      type: 'DATA_TAMPERING',
      severity: 'P0',
      event
    });
  }
}

@EventsHandler('audit.anomaly.detected.v1')
@Injectable()
export class AnomalyDetectedHandler implements IEventHandler {
  async handle(event: AnomalyDetectedEvent) {
    // Only alert on high-confidence anomalies
    if (event.data.confidence < 0.8) {
      return;
    }

    await this.alertService.sendSecurityAlert({
      title: `Anomaly Detected: ${event.data.anomalyType}`,
      description: `User ${event.data.userEmail} - ${event.data.details}`,
      severity: event.data.severity,
      userId: event.data.userId,
      requiresReview: event.data.requiresInvestigation
    });
  }
}
```

---

**END OF PRODUCTION-READY SPECIFICATION**
