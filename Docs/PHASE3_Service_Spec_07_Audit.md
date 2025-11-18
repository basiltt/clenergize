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
