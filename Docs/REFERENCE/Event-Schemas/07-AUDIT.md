# Audit Service Event Schemas

**Service**: Audit Service
**Port**: 3007
**Event Count**: 4 types

---

## Audit Service Events

### Event Types

```typescript
export type AuditEvent =
  | AuditLogCreatedEvent
  | ComplianceCheckCompletedEvent
  | DataAccessLoggedEvent
  | SecurityEventDetectedEvent;
```

### Audit Log Created Event

```typescript
export interface AuditLogCreatedEvent extends DomainEvent {
  type: 'audit.log.created.v1';
  aggregateType: 'AuditLog';
  data: {
    auditLogId: string;
    action: string;
    resourceType: string;
    resourceId: string;
    userId: string;
    result: 'SUCCESS' | 'FAILURE';
    changes?: {
      field: string;
      oldValue: any;
      newValue: any;
    }[];
    ipAddress: string;
    userAgent: string;
    timestamp: string;
    metadata?: Record<string, any>;
  };
}

export const AuditLogCreatedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('audit.log.created.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('AuditLog'),
  correlationId: z.string().uuid(),
  data: z.object({
    auditLogId: z.string().uuid(),
    action: z.string(),
    resourceType: z.string(),
    resourceId: z.string(),
    userId: z.string().uuid(),
    result: z.enum(['SUCCESS', 'FAILURE']),
    changes: z.array(z.object({
      field: z.string(),
      oldValue: z.any(),
      newValue: z.any()
    })).optional(),
    ipAddress: z.string().ip(),
    userAgent: z.string(),
    timestamp: z.string().datetime(),
    metadata: z.record(z.any()).optional()
  })
});
```

### Compliance Check Completed Event

```typescript
export interface ComplianceCheckCompletedEvent extends DomainEvent {
  type: 'audit.compliance.check-completed.v1';
  aggregateType: 'ComplianceCheck';
  data: {
    checkId: string;
    checkType: 'GDPR' | 'ISO14064' | 'GHG_PROTOCOL' | 'CUSTOM';
    projectId?: string;
    organizationId?: string;
    result: 'PASS' | 'FAIL' | 'WARNING';
    findings: {
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      category: string;
      description: string;
      affectedRecords?: number;
    }[];
    checkedAt: string;
    checkedBy: string;
  };
}

export const ComplianceCheckCompletedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('audit.compliance.check-completed.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('ComplianceCheck'),
  correlationId: z.string().uuid(),
  data: z.object({
    checkId: z.string().uuid(),
    checkType: z.enum(['GDPR', 'ISO14064', 'GHG_PROTOCOL', 'CUSTOM']),
    projectId: z.string().uuid().optional(),
    organizationId: z.string().uuid().optional(),
    result: z.enum(['PASS', 'FAIL', 'WARNING']),
    findings: z.array(z.object({
      severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
      category: z.string(),
      description: z.string(),
      affectedRecords: z.number().int().nonnegative().optional()
    })),
    checkedAt: z.string().datetime(),
    checkedBy: z.string().uuid()
  })
});
```

### Security Event Detected Event

```typescript
export interface SecurityEventDetectedEvent extends DomainEvent {
  type: 'audit.security.event-detected.v1';
  aggregateType: 'SecurityEvent';
  data: {
    securityEventId: string;
    eventType: 'BRUTE_FORCE' | 'UNAUTHORIZED_ACCESS' | 'SUSPICIOUS_ACTIVITY' | 'DATA_EXFILTRATION';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    userId?: string;
    ipAddress: string;
    details: Record<string, any>;
    detectedAt: string;
    responseActions: string[];
  };
}

export const SecurityEventDetectedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('audit.security.event-detected.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('SecurityEvent'),
  correlationId: z.string().uuid(),
  data: z.object({
    securityEventId: z.string().uuid(),
    eventType: z.enum(['BRUTE_FORCE', 'UNAUTHORIZED_ACCESS', 'SUSPICIOUS_ACTIVITY', 'DATA_EXFILTRATION']),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    userId: z.string().uuid().optional(),
    ipAddress: z.string().ip(),
    details: z.record(z.any()),
    detectedAt: z.string().datetime(),
    responseActions: z.array(z.string())
  })
});
```

### Data Access Logged Event

```typescript
export interface DataAccessLoggedEvent extends DomainEvent {
  type: 'audit.data-access.logged.v1';
  aggregateType: 'DataAccessLog';
  data: {
    accessLogId: string;
    userId: string;
    resourceType: string;
    resourceId: string;
    action: 'READ' | 'WRITE' | 'DELETE' | 'EXPORT';
    accessMethod: 'UI' | 'API' | 'DIRECT_DATABASE';
    ipAddress: string;
    userAgent: string;
    success: boolean;
    dataClassification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
    recordCount?: number;
    timestamp: string;
  };
}

export const DataAccessLoggedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('audit.data-access.logged.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('DataAccessLog'),
  correlationId: z.string().uuid(),
  data: z.object({
    accessLogId: z.string().uuid(),
    userId: z.string().uuid(),
    resourceType: z.string(),
    resourceId: z.string(),
    action: z.enum(['READ', 'WRITE', 'DELETE', 'EXPORT']),
    accessMethod: z.enum(['UI', 'API', 'DIRECT_DATABASE']),
    ipAddress: z.string().ip(),
    userAgent: z.string(),
    success: z.boolean(),
    dataClassification: z.enum(['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED']),
    recordCount: z.number().int().nonnegative().optional(),
    timestamp: z.string().datetime()
  })
});
```

---

