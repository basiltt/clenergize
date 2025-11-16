# Audit Agent

## Role
Manages the Audit Service (NEW greenfield service), handling comprehensive audit logging, compliance tracking, event sourcing, and security monitoring across all services.

## Service Configuration
- **Port**: 3007
- **Database**: MongoDB - `clenergize_audit`
- **OLD Reference**: None (greenfield service)
- **NEW Implementation**: `NEW/audit-service/`
- **Model**: Claude Sonnet (Standard)

## Purpose
This is a new service created to address the lack of audit trails in the OLD system. It provides centralized logging for compliance, security, and operational auditing.

## NEW Service Architecture

### Domain Structure
```
NEW/audit-service/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── audit-log.entity.ts
│   │   │   ├── compliance-record.entity.ts
│   │   │   └── security-event.entity.ts
│   │   ├── value-objects/
│   │   │   ├── event-type.vo.ts
│   │   │   └── severity-level.vo.ts
│   │   ├── events/
│   │   │   └── audit-event-recorded.event.ts
│   │   └── services/
│   │       ├── event-store.service.ts
│   │       └── compliance.service.ts
│   ├── application/
│   │   ├── commands/
│   │   │   └── record-audit-event.command.ts
│   │   └── queries/
│   │       ├── get-audit-trail.query.ts
│   │       └── compliance-report.query.ts
│   └── infrastructure/
│       ├── repositories/
│       │   └── audit.repository.ts
│       └── services/
│           ├── event-listener.service.ts
│           └── retention.service.ts
```

## Core Features to Implement

### 1. Audit Log Entity
```typescript
export class AuditLog {
  private readonly id: AuditLogId;
  private timestamp: Date;
  private eventType: EventType;
  private service: string;
  private userId?: UserId;
  private organizationId?: OrganizationId;
  private projectId?: ProjectId;
  private action: string;
  private resource: AuditResource;
  private changes?: ChangeRecord;
  private metadata: AuditMetadata;
  private severity: SeverityLevel;
  private correlationId?: string;
  private sessionId?: string;
  private ipAddress?: string;
  private userAgent?: string;

  constructor(props: AuditLogProps) {
    this.validateAuditLog(props);
    Object.assign(this, props);
    this.timestamp = new Date();
  }

  private validateAuditLog(props: AuditLogProps): void {
    if (!props.eventType || !props.service || !props.action) {
      throw new InvalidAuditLogException('Missing required fields');
    }

    if (!this.isValidEventType(props.eventType)) {
      throw new InvalidAuditLogException('Invalid event type');
    }
  }

  isSecurityRelevant(): boolean {
    return [
      EventType.AUTHENTICATION,
      EventType.AUTHORIZATION,
      EventType.DATA_ACCESS,
      EventType.CONFIGURATION_CHANGE
    ].includes(this.eventType);
  }

  isComplianceRelevant(): boolean {
    return [
      EventType.DATA_EXPORT,
      EventType.DATA_DELETION,
      EventType.USER_CONSENT,
      EventType.CALCULATION_CHANGE
    ].includes(this.eventType);
  }

  private isValidEventType(type: EventType): boolean {
    return Object.values(EventType).includes(type);
  }
}

// Event Types
enum EventType {
  // Security Events
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  TOKEN_GENERATION = 'token_generation',
  TOKEN_VERIFICATION = 'token_verification',
  PASSWORD_CHANGE = 'password_change',
  ACCOUNT_LOCKOUT = 'account_lockout',

  // Data Events
  DATA_CREATE = 'data_create',
  DATA_READ = 'data_read',
  DATA_UPDATE = 'data_update',
  DATA_DELETE = 'data_delete',
  DATA_EXPORT = 'data_export',
  DATA_IMPORT = 'data_import',

  // Calculation Events
  CALCULATION_PERFORMED = 'calculation_performed',
  CALCULATION_CHANGE = 'calculation_change',
  FACTOR_UPDATED = 'factor_updated',

  // System Events
  SERVICE_START = 'service_start',
  SERVICE_STOP = 'service_stop',
  CONFIGURATION_CHANGE = 'configuration_change',
  ERROR_OCCURRED = 'error_occurred',

  // Compliance Events
  USER_CONSENT = 'user_consent',
  GDPR_REQUEST = 'gdpr_request',
  REPORT_GENERATED = 'report_generated',
  AUDIT_TRAIL_ACCESSED = 'audit_trail_accessed'
}

// Severity Levels
enum SeverityLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Resource being audited
interface AuditResource {
  type: string; // 'user', 'project', 'emission', etc.
  id: string;
  name?: string;
}

// Change tracking
interface ChangeRecord {
  before?: any;
  after?: any;
  fields?: string[];
}

// Additional metadata
interface AuditMetadata {
  duration?: number; // Operation duration in ms
  errorMessage?: string;
  stackTrace?: string;
  requestId?: string;
  tags?: string[];
}
```

### 2. Event Store Service
```typescript
@Injectable()
export class EventStoreService {
  constructor(
    private auditRepository: AuditRepository,
    @Inject('DB_CONNECTION') private db: Connection,
    private encryptionService: EncryptionService
  ) {}

  async recordEvent(event: AuditEvent): Promise<void> {
    const session = await this.db.startSession();

    try {
      await session.withTransaction(async () => {
        // Create immutable audit log
        const auditLog = new AuditLog({
          id: new AuditLogId(),
          eventType: event.type,
          service: event.service,
          userId: event.userId,
          organizationId: event.organizationId,
          projectId: event.projectId,
          action: event.action,
          resource: event.resource,
          changes: event.changes,
          metadata: event.metadata,
          severity: event.severity || SeverityLevel.INFO,
          correlationId: event.correlationId,
          sessionId: event.sessionId,
          ipAddress: event.ipAddress,
          userAgent: event.userAgent
        });

        // Encrypt sensitive data if needed
        if (this.containsSensitiveData(auditLog)) {
          auditLog.changes = await this.encryptionService.encrypt(
            auditLog.changes
          );
        }

        // Save to audit store (write-only, no updates allowed)
        await this.auditRepository.append(auditLog, session);

        // Index for searching
        await this.indexAuditLog(auditLog, session);

        // Check for security alerts
        if (this.isSecurityAlert(auditLog)) {
          await this.raiseSecurityAlert(auditLog);
        }
      });
    } finally {
      await session.endSession();
    }
  }

  async getEventStream(
    filter: AuditFilter,
    options: StreamOptions
  ): AsyncIterable<AuditLog> {
    // Stream events for real-time monitoring
    const cursor = this.auditRepository.stream(filter, options);

    for await (const event of cursor) {
      // Decrypt sensitive data if authorized
      if (event.changes && options.includeDetails) {
        event.changes = await this.encryptionService.decrypt(
          event.changes
        );
      }

      yield event;
    }
  }

  private containsSensitiveData(log: AuditLog): boolean {
    const sensitiveTypes = [
      EventType.PASSWORD_CHANGE,
      EventType.TOKEN_GENERATION,
      EventType.GDPR_REQUEST
    ];

    return sensitiveTypes.includes(log.eventType);
  }

  private isSecurityAlert(log: AuditLog): boolean {
    // Detect potential security issues
    return (
      log.severity === SeverityLevel.CRITICAL ||
      log.eventType === EventType.ACCOUNT_LOCKOUT ||
      (log.eventType === EventType.AUTHENTICATION &&
        log.metadata.errorMessage)
    );
  }

  private async raiseSecurityAlert(log: AuditLog): Promise<void> {
    // Send to security monitoring system
    console.error('SECURITY ALERT:', {
      type: log.eventType,
      user: log.userId,
      timestamp: log.timestamp,
      details: log.metadata
    });

    // Could integrate with PagerDuty, Slack, etc.
  }
}
```

### 3. Compliance Service
```typescript
@Injectable()
export class ComplianceService {
  constructor(
    private auditRepository: AuditRepository,
    private reportGenerator: ReportGenerator
  ) {}

  async generateComplianceReport(
    organizationId: OrganizationId,
    period: DateRange,
    standard: ComplianceStandard
  ): Promise<ComplianceReport> {
    const report = new ComplianceReport({
      organizationId,
      period,
      standard,
      generatedAt: new Date()
    });

    // Gather required evidence
    const evidence = await this.gatherEvidence(
      organizationId,
      period,
      standard
    );

    // Check compliance rules
    const violations = await this.checkCompliance(evidence, standard);

    // Generate report sections
    report.sections = {
      summary: this.generateSummary(evidence, violations),
      dataHandling: await this.auditDataHandling(organizationId, period),
      calculations: await this.auditCalculations(organizationId, period),
      userAccess: await this.auditUserAccess(organizationId, period),
      changes: await this.auditChanges(organizationId, period),
      violations,
      recommendations: this.generateRecommendations(violations)
    };

    // Calculate compliance score
    report.complianceScore = this.calculateScore(evidence, violations);

    return report;
  }

  private async gatherEvidence(
    organizationId: OrganizationId,
    period: DateRange,
    standard: ComplianceStandard
  ): Promise<Evidence[]> {
    const requirements = this.getStandardRequirements(standard);
    const evidence: Evidence[] = [];

    for (const requirement of requirements) {
      const logs = await this.auditRepository.find({
        organizationId,
        timestamp: { $gte: period.start, $lte: period.end },
        eventType: { $in: requirement.eventTypes }
      });

      evidence.push({
        requirement: requirement.id,
        description: requirement.description,
        logs,
        isSatisfied: this.checkRequirementSatisfied(logs, requirement)
      });
    }

    return evidence;
  }

  private getStandardRequirements(
    standard: ComplianceStandard
  ): Requirement[] {
    switch (standard) {
      case ComplianceStandard.ISO14064:
        return [
          {
            id: 'ISO14064-4.1',
            description: 'GHG quantification and reporting',
            eventTypes: [
              EventType.CALCULATION_PERFORMED,
              EventType.REPORT_GENERATED
            ],
            minFrequency: 'monthly'
          },
          {
            id: 'ISO14064-4.2',
            description: 'Data quality management',
            eventTypes: [
              EventType.DATA_IMPORT,
              EventType.DATA_UPDATE
            ],
            requiresValidation: true
          },
          // ... more requirements
        ];

      case ComplianceStandard.GHG_PROTOCOL:
        return [
          {
            id: 'GHG-5.1',
            description: 'Scope 1, 2, 3 emissions tracking',
            eventTypes: [EventType.CALCULATION_PERFORMED],
            scopes: ['scope_1', 'scope_2', 'scope_3']
          },
          // ... more requirements
        ];

      case ComplianceStandard.GDPR:
        return [
          {
            id: 'GDPR-Art15',
            description: 'Right of access by data subject',
            eventTypes: [
              EventType.DATA_EXPORT,
              EventType.GDPR_REQUEST
            ]
          },
          {
            id: 'GDPR-Art17',
            description: 'Right to erasure',
            eventTypes: [EventType.DATA_DELETE]
          },
          // ... more requirements
        ];

      default:
        return [];
    }
  }

  async handleGDPRRequest(
    request: GDPRRequest
  ): Promise<GDPRResponse> {
    switch (request.type) {
      case 'ACCESS':
        return this.handleAccessRequest(request);

      case 'ERASURE':
        return this.handleErasureRequest(request);

      case 'PORTABILITY':
        return this.handlePortabilityRequest(request);

      case 'RECTIFICATION':
        return this.handleRectificationRequest(request);

      default:
        throw new UnsupportedRequestException(request.type);
    }
  }

  private async handleAccessRequest(
    request: GDPRRequest
  ): Promise<GDPRResponse> {
    // Find all audit logs related to the user
    const logs = await this.auditRepository.find({
      userId: request.userId,
      organizationId: request.organizationId
    });

    // Redact other users' information
    const sanitizedLogs = logs.map(log => this.sanitizeLog(log));

    // Record the access request itself
    await this.recordGDPRRequest(request, 'ACCESS');

    return {
      requestId: request.id,
      type: 'ACCESS',
      data: sanitizedLogs,
      completedAt: new Date()
    };
  }
}

// Compliance Standards
enum ComplianceStandard {
  ISO14064 = 'ISO14064',
  GHG_PROTOCOL = 'GHG_PROTOCOL',
  TCFD = 'TCFD',
  CDP = 'CDP',
  GDPR = 'GDPR',
  CCPA = 'CCPA'
}
```

### 4. Retention Service
```typescript
@Injectable()
export class RetentionService {
  constructor(
    private auditRepository: AuditRepository,
    private archiveService: ArchiveService,
    private configService: ConfigService
  ) {}

  @Cron('0 0 * * *') // Daily at midnight
  async enforceRetentionPolicies(): Promise<void> {
    const policies = this.configService.getRetentionPolicies();

    for (const policy of policies) {
      await this.enforcePolicy(policy);
    }
  }

  private async enforcePolicy(policy: RetentionPolicy): Promise<void> {
    const cutoffDate = this.calculateCutoffDate(policy);

    // Find logs to be archived/deleted
    const logs = await this.auditRepository.find({
      timestamp: { $lt: cutoffDate },
      eventType: { $in: policy.eventTypes }
    });

    if (logs.length === 0) return;

    if (policy.action === 'ARCHIVE') {
      // Archive to cold storage
      await this.archiveService.archive(logs);

      // Remove from hot storage
      await this.auditRepository.deleteMany({
        _id: { $in: logs.map(l => l.id) }
      });
    } else if (policy.action === 'DELETE') {
      // Permanently delete (after compliance period)
      await this.auditRepository.deleteMany({
        _id: { $in: logs.map(l => l.id) }
      });
    }

    console.log(`Retention policy ${policy.name} enforced: ${logs.length} records processed`);
  }

  private calculateCutoffDate(policy: RetentionPolicy): Date {
    const now = new Date();

    switch (policy.duration.unit) {
      case 'days':
        return new Date(now.setDate(now.getDate() - policy.duration.value));

      case 'months':
        return new Date(now.setMonth(now.getMonth() - policy.duration.value));

      case 'years':
        return new Date(now.setFullYear(now.getFullYear() - policy.duration.value));

      default:
        throw new Error(`Unknown duration unit: ${policy.duration.unit}`);
    }
  }
}

interface RetentionPolicy {
  name: string;
  eventTypes: EventType[];
  duration: {
    value: number;
    unit: 'days' | 'months' | 'years';
  };
  action: 'ARCHIVE' | 'DELETE';
  exceptions?: string[]; // Event IDs to keep
}
```

## API Endpoints

### Audit Logs
```typescript
POST   /audit/events          - Record audit event
GET    /audit/trail          - Get audit trail
GET    /audit/search         - Search audit logs
GET    /audit/stream         - Real-time event stream (SSE)
```

### Compliance
```typescript
GET    /compliance/report     - Generate compliance report
GET    /compliance/standards  - List supported standards
GET    /compliance/score     - Get compliance score
POST   /compliance/gdpr      - Handle GDPR request
```

### Analytics
```typescript
GET    /analytics/security   - Security analytics
GET    /analytics/usage     - Usage analytics
GET    /analytics/changes   - Change analytics
```

## Events Consumed

The Audit Service subscribes to ALL events from other services:

```typescript
// From Identity Service
- Identity.User.*
- Identity.Authentication.*

// From Organization Service
- Organization.Project.*
- Organization.Hierarchy.*

// From Activity Service
- Activity.Data.*
- Activity.BulkImport.*

// From Calculation Service
- Calculation.Emission.*
- Calculation.Rollup.*

// From Reporting Service
- Reporting.Report.*

// From Reference Service
- Reference.EmissionFactor.*
- Reference.DataVersion.*
```

## Database Schema

### AuditLogs Collection (Write-Once, Immutable)
```javascript
{
  _id: ObjectId,
  timestamp: Date,
  eventType: string,
  service: string,
  userId: ObjectId,
  organizationId: ObjectId,
  projectId: ObjectId,
  action: string,
  resource: {
    type: string,
    id: string,
    name: string
  },
  changes: {
    before: object, // Encrypted if sensitive
    after: object,  // Encrypted if sensitive
    fields: string[]
  },
  metadata: {
    duration: number,
    errorMessage: string,
    stackTrace: string,
    requestId: string,
    tags: string[]
  },
  severity: string,
  correlationId: string,
  sessionId: string,
  ipAddress: string,
  userAgent: string,

  // Indexes for efficient querying
  _indexes: {
    byUser: string,
    byOrg: string,
    byProject: string,
    byType: string,
    byDate: Date
  }
}
```

### ComplianceReports Collection
```javascript
{
  _id: ObjectId,
  organizationId: ObjectId,
  period: {
    start: Date,
    end: Date
  },
  standard: string,
  complianceScore: number,
  sections: {
    summary: object,
    dataHandling: object,
    calculations: object,
    userAccess: object,
    changes: object,
    violations: array,
    recommendations: array
  },
  evidence: [{
    requirement: string,
    description: string,
    isSatisfied: boolean,
    logs: array
  }],
  generatedAt: Date,
  generatedBy: string
}
```

## Security Considerations

### Data Protection
- Encrypt sensitive fields (passwords, tokens)
- Use field-level encryption for PII
- Implement access controls for audit logs
- No modification of audit logs allowed (immutable)

### Access Control
```typescript
// Role-based access to audit logs
const AUDIT_PERMISSIONS = {
  'audit-viewer': ['read:audit'],
  'audit-admin': ['read:audit', 'export:audit'],
  'compliance-officer': ['read:audit', 'generate:report'],
  'security-admin': ['read:audit', 'read:security', 'configure:alerts']
};
```

## Testing Requirements

### Unit Tests
```typescript
describe('Audit Service', () => {
  it('should record all event types');
  it('should encrypt sensitive data');
  it('should enforce retention policies');
  it('should generate compliance reports');
  it('should handle GDPR requests');
});
```

## Commands

```javascript
// Get user audit trail
execute({
  action: 'mongodb',
  content: `
    db("clenergize_audit").collection("audit_logs").find({
      userId: ObjectId("userId"),
      timestamp: {$gte: new Date(Date.now() - 30*24*60*60*1000)}
    }).sort({timestamp: -1})
  `
})

// Generate compliance report (ISO 14064, GHG Protocol, etc.)
execute({
  action: 'bash',
  content: 'cd NEW/audit-service && npm run compliance:report -- --standard=ISO14064'
})

// Export user data for GDPR request
execute({
  action: 'bash',
  content: 'cd NEW/audit-service && npm run gdpr:export -- --userId=userId --format=json'
})

// Run security analysis for period
execute({
  action: 'mongodb',
  content: `
    db("clenergize_audit").collection("security_events").aggregate([
      {$match: {timestamp: {$gte: new Date(Date.now() - 7*24*60*60*1000)}}},
      {$group: {
        _id: "$event",
        count: {$sum: 1},
        users: {$addToSet: "$userId"}
      }},
      {$sort: {count: -1}}
    ])
  `
})

// Manually run retention cleanup
execute({
  action: 'bash',
  content: 'cd NEW/audit-service && npm run retention:cleanup'
})
```

## Success Metrics
- 100% event capture rate
- Zero audit log tampering
- Compliance reports < 60s generation
- GDPR requests completed < 30 days
- Retention policies enforced daily
- Security alerts < 1 minute latency

## Current Sprint 0.1 Tasks
1. Create audit log entity and schema
2. Implement event store service
3. Add event listener for all services
4. Create compliance report generator
5. Implement GDPR request handlers
6. Add retention policy engine
7. Build security alert system
8. Add comprehensive tests

Remember: The Audit Service is critical for compliance and security. Every event must be captured, immutable, and auditable.