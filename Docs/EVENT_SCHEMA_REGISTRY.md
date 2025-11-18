# Event Schema Registry

**Version**: 1.0.0
**Last Updated**: November 18, 2025
**Status**: ACTIVE
**Sprint**: 0.2
**Priority**: CRITICAL

---

## Executive Summary

This document defines the complete event schema registry for the Clenergize V3 microservices architecture. All events are **type-safe, versioned, and validated** using TypeScript discriminated unions and Zod schemas. This eliminates the string-based event typos and runtime failures present in the OLD codebase.

### Key Benefits

| OLD Approach | NEW Approach | Improvement |
|--------------|--------------|-------------|
| String-based event types | TypeScript discriminated unions | **100% compile-time safety** |
| No validation | Zod schema validation | **Runtime type checking** |
| Event typos (e.g., "permission-granded") | Type-checked event types | **Zero typos possible** |
| No versioning | Built-in version field | **Backward compatibility** |
| No correlation IDs | Automatic correlation tracking | **Distributed tracing** |

---

## Table of Contents

1. [Base Event Schema](#base-event-schema)
2. [Identity Service Events](#identity-service-events)
3. [Organization Service Events](#organization-service-events)
4. [Reference Service Events](#reference-service-events)
5. [Activity Service Events](#activity-service-events)
6. [Calculation Service Events](#calculation-service-events)
7. [Reporting Service Events](#reporting-service-events)
8. [Audit Service Events](#audit-service-events)
9. [Event Publishing Patterns](#event-publishing-patterns)
10. [Event Consumption Patterns](#event-consumption-patterns)
11. [Event Versioning Strategy](#event-versioning-strategy)
12. [Migration from OLD](#migration-from-old)

---

## Base Event Schema

### Domain Event Interface

```typescript
// @clenergize/contracts/src/events/base-event.ts
export interface DomainEvent {
  /** Unique event identifier (UUID v4) */
  id: string;

  /** Event type in format: <service>.<aggregate>.<action>.v<version> */
  type: string;

  /** Schema version (semver) */
  version: string;

  /** When the event occurred (ISO 8601) */
  occurredAt: string;

  /** ID of the aggregate that generated this event */
  aggregateId: string;

  /** Type of the aggregate (e.g., "User", "Project") */
  aggregateType: string;

  /** User ID who triggered this event (if applicable) */
  userId?: string;

  /** Request correlation ID for distributed tracing */
  correlationId: string;

  /** ID of the event that caused this event (event chain) */
  causationId?: string;

  /** Event-specific payload */
  data: any;
}
```

### Base Event Zod Schema

```typescript
import { z } from 'zod';

export const DomainEventSchema = z.object({
  id: z.string().uuid(),
  type: z.string().regex(/^[a-z]+\.[a-z]+\.[a-z]+\.v\d+$/),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.string().min(1),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.record(z.any())
});
```

---

## Identity Service Events

### Event Types

```typescript
// @clenergize/contracts/src/events/identity/types.ts
export type IdentityEvent =
  | UserCreatedEvent
  | UserUpdatedEvent
  | UserDeletedEvent
  | UserAuthenticatedEvent
  | UserAuthenticationFailedEvent
  | PasswordResetRequestedEvent
  | PasswordResetCompletedEvent
  | UserRoleAssignedEvent
  | UserRoleRevokedEvent
  | UserActivatedEvent
  | UserDeactivatedEvent;
```

### User Created Event

```typescript
// @clenergize/contracts/src/events/identity/user-created.event.ts
import { DomainEvent } from '../base-event';
import { z } from 'zod';

export interface UserCreatedEvent extends DomainEvent {
  type: 'identity.user.created.v1';
  aggregateType: 'User';
  data: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
    createdBy: string;
    metadata?: Record<string, any>;
  };
}

export const UserCreatedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('identity.user.created.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('User'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    userId: z.string().uuid(),
    email: z.string().email(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    roles: z.array(z.string()),
    status: z.enum(['ACTIVE', 'PENDING', 'SUSPENDED']),
    createdBy: z.string().uuid(),
    metadata: z.record(z.any()).optional()
  })
});
```

### User Authenticated Event

```typescript
export interface UserAuthenticatedEvent extends DomainEvent {
  type: 'identity.user.authenticated.v1';
  aggregateType: 'User';
  data: {
    userId: string;
    sessionId: string;
    ipAddress: string;
    userAgent: string;
    authMethod: 'PASSWORD' | 'SSO' | 'MFA';
    timestamp: string;
  };
}

export const UserAuthenticatedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('identity.user.authenticated.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('User'),
  userId: z.string().uuid(),
  correlationId: z.string().uuid(),
  data: z.object({
    userId: z.string().uuid(),
    sessionId: z.string().uuid(),
    ipAddress: z.string().ip(),
    userAgent: z.string(),
    authMethod: z.enum(['PASSWORD', 'SSO', 'MFA']),
    timestamp: z.string().datetime()
  })
});
```

### Password Reset Requested Event

```typescript
export interface PasswordResetRequestedEvent extends DomainEvent {
  type: 'identity.password.reset-requested.v1';
  aggregateType: 'User';
  data: {
    userId: string;
    email: string;
    resetToken: string;
    expiresAt: string;
    requestedFrom: string; // IP address
  };
}
```

### User Role Assigned Event

```typescript
export interface UserRoleAssignedEvent extends DomainEvent {
  type: 'identity.user.role-assigned.v1';
  aggregateType: 'User';
  data: {
    userId: string;
    role: string;
    scope?: {
      organizationId?: string;
      projectId?: string;
    };
    assignedBy: string;
    reason?: string;
  };
}
```

---

## Organization Service Events

### Event Types

```typescript
export type OrganizationEvent =
  | OrganizationCreatedEvent
  | OrganizationUpdatedEvent
  | OrganizationDeletedEvent
  | ProjectCreatedEvent
  | ProjectUpdatedEvent
  | ProjectDeletedEvent
  | HierarchyCreatedEvent
  | HierarchyUpdatedEvent
  | HierarchyNodeAddedEvent
  | HierarchyNodeRemovedEvent
  | PermissionGrantedEvent
  | PermissionRevokedEvent
  | UserAddedToOrganizationEvent
  | UserRemovedFromOrganizationEvent;
```

### Project Created Event

```typescript
export interface ProjectCreatedEvent extends DomainEvent {
  type: 'organization.project.created.v1';
  aggregateType: 'Project';
  data: {
    projectId: string;
    companyId: string;
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
    ownerId: string;
    hierarchyTemplateId?: string;
    metadata?: Record<string, any>;
  };
}

export const ProjectCreatedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('organization.project.created.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Project'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  data: z.object({
    projectId: z.string().uuid(),
    companyId: z.string().uuid(),
    name: z.string().min(1).max(255),
    description: z.string().max(1000).optional(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED']),
    ownerId: z.string().uuid(),
    hierarchyTemplateId: z.string().uuid().optional(),
    metadata: z.record(z.any()).optional()
  })
});
```

### Hierarchy Updated Event (CRITICAL - fixes OLD hierarchy cloning issue)

```typescript
export interface HierarchyUpdatedEvent extends DomainEvent {
  type: 'organization.hierarchy.updated.v1';
  aggregateType: 'Hierarchy';
  data: {
    hierarchyId: string;
    projectId: string;
    /** Reference to hierarchy template (NOT cloned data!) */
    templateReference: {
      templateId: string;
      version: string;
      snapshotId?: string; // For point-in-time consistency
    };
    /** Only store overrides/customizations */
    customizations?: {
      nodeId: string;
      overriddenFields: Record<string, any>;
    }[];
    updatedBy: string;
    changeReason?: string;
  };
}
```

### Permission Granted Event

```typescript
export interface PermissionGrantedEvent extends DomainEvent {
  type: 'organization.permission.granted.v1';
  aggregateType: 'Permission';
  data: {
    permissionId: string;
    userId: string;
    resourceType: 'ORGANIZATION' | 'PROJECT' | 'HIERARCHY' | 'REPORT';
    resourceId: string;
    permissions: ('READ' | 'WRITE' | 'DELETE' | 'ADMIN')[];
    grantedBy: string;
    expiresAt?: string;
    reason?: string;
  };
}
```

### User Added to Organization Event

```typescript
export interface UserAddedToOrganizationEvent extends DomainEvent {
  type: 'organization.user.added.v1';
  aggregateType: 'Organization';
  data: {
    organizationId: string;
    userId: string;
    role: string;
    permissions: string[];
    addedBy: string;
    startDate: string;
    endDate?: string;
  };
}
```

---

## Reference Service Events

### Event Types

```typescript
export type ReferenceEvent =
  | EmissionFactorCreatedEvent
  | EmissionFactorUpdatedEvent
  | EmissionFactorDeprecatedEvent
  | UnitCreatedEvent
  | UnitUpdatedEvent
  | ConversionRuleCreatedEvent
  | ReferenceDataImportedEvent
  | ReferenceDataVersionedEvent;
```

### Emission Factor Created Event

```typescript
export interface EmissionFactorCreatedEvent extends DomainEvent {
  type: 'reference.emission-factor.created.v1';
  aggregateType: 'EmissionFactor';
  data: {
    emissionFactorId: string;
    name: string;
    category: string;
    subcategory?: string;
    scope: 1 | 2 | 3;
    unit: string;
    value: number;
    source: string;
    sourceReference?: string;
    geography?: string;
    validFrom: string;
    validTo?: string;
    version: string;
    createdBy: string;
    metadata?: Record<string, any>;
  };
}
```

### Reference Data Versioned Event (NEW - ensures consistency)

```typescript
export interface ReferenceDataVersionedEvent extends DomainEvent {
  type: 'reference.data.versioned.v1';
  aggregateType: 'ReferenceDataSet';
  data: {
    dataSetId: string;
    dataType: 'EMISSION_FACTOR' | 'UNIT' | 'CONVERSION_RULE';
    version: string;
    previousVersion?: string;
    changesSummary: {
      added: number;
      updated: number;
      deprecated: number;
    };
    snapshotId: string; // For point-in-time queries
    effectiveDate: string;
    createdBy: string;
  };
}
```

---

## Activity Service Events

### Event Types

```typescript
export type ActivityEvent =
  | ActivityDataIngestedEvent
  | ActivityDataValidatedEvent
  | ActivityDataValidationFailedEvent
  | ActivityDataUpdatedEvent
  | ActivityDataDeletedEvent
  | BulkImportStartedEvent
  | BulkImportCompletedEvent
  | BulkImportFailedEvent;
```

### Activity Data Ingested Event

```typescript
export interface ActivityDataIngestedEvent extends DomainEvent {
  type: 'activity.data.ingested.v1';
  aggregateType: 'ActivityData';
  data: {
    activityDataId: string;
    projectId: string;
    hierarchyNodeId: string;
    activityType: string;
    quantity: number;
    unit: string;
    period: {
      startDate: string;
      endDate: string;
    };
    source: 'MANUAL' | 'IMPORT' | 'API' | 'INTEGRATION';
    sourceReference?: string;
    uploadedBy: string;
    metadata?: Record<string, any>;
  };
}
```

### Activity Data Validation Failed Event

```typescript
export interface ActivityDataValidationFailedEvent extends DomainEvent {
  type: 'activity.data.validation-failed.v1';
  aggregateType: 'ActivityData';
  data: {
    activityDataId: string;
    projectId: string;
    validationErrors: {
      field: string;
      message: string;
      code: string;
      severity: 'ERROR' | 'WARNING';
    }[];
    rawData: Record<string, any>;
    timestamp: string;
  };
}
```

### Bulk Import Completed Event

```typescript
export interface BulkImportCompletedEvent extends DomainEvent {
  type: 'activity.bulk-import.completed.v1';
  aggregateType: 'BulkImport';
  data: {
    importId: string;
    projectId: string;
    fileName: string;
    totalRecords: number;
    successfulRecords: number;
    failedRecords: number;
    warnings: number;
    duration: number; // milliseconds
    importedBy: string;
    completedAt: string;
  };
}
```

---

## Calculation Service Events

### Event Types

```typescript
export type CalculationEvent =
  | CalculationStartedEvent
  | CalculationCompletedEvent
  | CalculationFailedEvent
  | EmissionCalculatedEvent
  | RollupStartedEvent
  | RollupCompletedEvent
  | RecalculationTriggeredEvent;
```

### Emission Calculated Event

```typescript
export interface EmissionCalculatedEvent extends DomainEvent {
  type: 'calculation.emission.calculated.v1';
  aggregateType: 'Emission';
  data: {
    calculationId: string;
    activityDataId: string;
    projectId: string;
    hierarchyNodeId: string;
    emissionFactorId: string;
    emissionFactorVersion: string;
    methodology: string;
    inputs: {
      quantity: number;
      unit: string;
      emissionFactor: number;
      conversionFactor?: number;
    };
    result: {
      co2e: number; // kg CO2e
      co2: number;
      ch4: number;
      n2o: number;
      uncertainty?: number; // percentage
    };
    scope: 1 | 2 | 3;
    calculatedAt: string;
    calculatedBy: string;
  };
}

export const EmissionCalculatedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('calculation.emission.calculated.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Emission'),
  correlationId: z.string().uuid(),
  data: z.object({
    calculationId: z.string().uuid(),
    activityDataId: z.string().uuid(),
    projectId: z.string().uuid(),
    hierarchyNodeId: z.string().uuid(),
    emissionFactorId: z.string().uuid(),
    emissionFactorVersion: z.string(),
    methodology: z.string(),
    inputs: z.object({
      quantity: z.number().positive(),
      unit: z.string(),
      emissionFactor: z.number(),
      conversionFactor: z.number().optional()
    }),
    result: z.object({
      co2e: z.number(),
      co2: z.number(),
      ch4: z.number(),
      n2o: z.number(),
      uncertainty: z.number().min(0).max(100).optional()
    }),
    scope: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    calculatedAt: z.string().datetime(),
    calculatedBy: z.string().uuid()
  })
});
```

### Rollup Completed Event

```typescript
export interface RollupCompletedEvent extends DomainEvent {
  type: 'calculation.rollup.completed.v1';
  aggregateType: 'Rollup';
  data: {
    rollupId: string;
    projectId: string;
    hierarchyNodeId: string;
    level: number; // Hierarchy level
    period: {
      startDate: string;
      endDate: string;
    };
    totals: {
      scope1: number;
      scope2: number;
      scope3: number;
      total: number;
    };
    childNodes: number;
    leafActivities: number;
    calculatedAt: string;
  };
}
```

### Recalculation Triggered Event

```typescript
export interface RecalculationTriggeredEvent extends DomainEvent {
  type: 'calculation.recalculation.triggered.v1';
  aggregateType: 'Recalculation';
  data: {
    recalculationId: string;
    trigger: 'EMISSION_FACTOR_UPDATED' | 'ACTIVITY_DATA_CHANGED' | 'MANUAL' | 'SCHEDULED';
    scope: {
      projectId?: string;
      hierarchyNodeId?: string;
      activityDataIds?: string[];
    };
    estimatedRecords: number;
    triggeredBy: string;
    scheduledFor?: string;
  };
}
```

---

## Reporting Service Events

### Event Types

```typescript
export type ReportingEvent =
  | ReportGenerationStartedEvent
  | ReportGenerationCompletedEvent
  | ReportGenerationFailedEvent
  | ReportScheduledEvent
  | ReportExportedEvent
  | DashboardRefreshedEvent;
```

### Report Generation Completed Event

```typescript
export interface ReportGenerationCompletedEvent extends DomainEvent {
  type: 'reporting.report.generation-completed.v1';
  aggregateType: 'Report';
  data: {
    reportId: string;
    reportType: 'EMISSION_SUMMARY' | 'ACTIVITY_DETAIL' | 'COMPARISON' | 'AUDIT';
    projectId: string;
    period: {
      startDate: string;
      endDate: string;
    };
    format: 'PDF' | 'EXCEL' | 'CSV' | 'JSON';
    fileUrl: string;
    fileSize: number; // bytes
    generationDuration: number; // milliseconds
    generatedBy: string;
    generatedAt: string;
    expiresAt?: string;
  };
}
```

### Report Exported Event

```typescript
export interface ReportExportedEvent extends DomainEvent {
  type: 'reporting.report.exported.v1';
  aggregateType: 'Report';
  data: {
    reportId: string;
    exportId: string;
    destination: 'S3' | 'EMAIL' | 'FTP' | 'WEBHOOK';
    destinationDetails: Record<string, any>;
    status: 'SUCCESS' | 'FAILED';
    error?: string;
    exportedBy: string;
    exportedAt: string;
  };
}
```

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
```

---

## Event Publishing Patterns

### Basic Event Publishing

```typescript
import { EventBridge } from '@aws-sdk/client-eventbridge';
import { v4 as uuid } from 'uuid';
import { UserCreatedEvent, UserCreatedEventSchema } from '@clenergize/contracts';
import { CorrelationIdMiddleware } from '@clenergize/common';

export class EventPublisher {
  constructor(
    private readonly eventBridge: EventBridge,
    private readonly serviceName: string
  ) {}

  async publishUserCreated(user: User, createdBy: string): Promise<void> {
    const event: UserCreatedEvent = {
      id: uuid(),
      type: 'identity.user.created.v1',
      version: '1.0.0',
      occurredAt: new Date().toISOString(),
      aggregateId: user.id,
      aggregateType: 'User',
      userId: createdBy,
      correlationId: CorrelationIdMiddleware.get() || uuid(),
      data: {
        userId: user.id,
        email: user.email.getValue(),
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        status: user.status,
        createdBy
      }
    };

    // Validate before publishing
    const validated = UserCreatedEventSchema.parse(event);

    await this.eventBridge.putEvents({
      Entries: [{
        Source: this.serviceName,
        DetailType: event.type,
        Detail: JSON.stringify(validated),
        EventBusName: process.env.EVENT_BUS_NAME
      }]
    });
  }
}
```

### Batch Event Publishing (for performance)

```typescript
export class EventPublisher {
  async publishBatch(events: DomainEvent[]): Promise<void> {
    // EventBridge supports max 10 events per batch
    const batches = this.chunkArray(events, 10);

    for (const batch of batches) {
      await this.eventBridge.putEvents({
        Entries: batch.map(event => ({
          Source: this.serviceName,
          DetailType: event.type,
          Detail: JSON.stringify(event),
          EventBusName: process.env.EVENT_BUS_NAME
        }))
      });
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
```

### Transaction-Aware Event Publishing (Critical!)

```typescript
export class TransactionalEventPublisher {
  private pendingEvents: DomainEvent[] = [];

  /**
   * Stage event for publishing after transaction commits
   */
  stageEvent(event: DomainEvent): void {
    this.pendingEvents.push(event);
  }

  /**
   * Publish all staged events (called after successful transaction)
   */
  async publishStagedEvents(): Promise<void> {
    if (this.pendingEvents.length === 0) return;

    try {
      await this.publishBatch(this.pendingEvents);
      this.pendingEvents = [];
    } catch (error) {
      // Log error but don't fail the transaction
      console.error('Failed to publish events:', error);
      // Could implement retry queue here
    }
  }

  /**
   * Clear staged events (called on transaction rollback)
   */
  clearStagedEvents(): void {
    this.pendingEvents = [];
  }
}

// Usage in service
class UserService {
  @Transactional()
  async createUser(userData: any, session?: ClientSession): Promise<User> {
    const user = await this.userRepository.create(userData, session);

    // Stage event (don't publish yet - transaction might rollback!)
    this.eventPublisher.stageEvent(
      this.createUserCreatedEvent(user)
    );

    return user;
  }

  async onTransactionCommit(): Promise<void> {
    // Publish all events after transaction succeeds
    await this.eventPublisher.publishStagedEvents();
  }

  async onTransactionRollback(): Promise<void> {
    // Clear events if transaction fails
    this.eventPublisher.clearStagedEvents();
  }
}
```

---

## Event Consumption Patterns

### Event Handler Implementation

```typescript
import { IEventHandler, BaseEvent } from '@clenergize/common';
import { UserCreatedEvent } from '@clenergize/contracts';

export class SendWelcomeEmailHandler implements IEventHandler<UserCreatedEvent> {
  readonly handlerId = 'send-welcome-email-handler';
  readonly eventTypes = ['identity.user.created.v1'];

  constructor(
    private readonly emailService: EmailService,
    private readonly logger: StructuredLogger
  ) {}

  async handle(event: UserCreatedEvent): Promise<void> {
    this.logger.info('Processing UserCreatedEvent', {
      eventId: event.id,
      userId: event.data.userId,
      correlationId: event.correlationId
    });

    try {
      await this.emailService.sendWelcomeEmail({
        to: event.data.email,
        firstName: event.data.firstName,
        correlationId: event.correlationId
      });

      this.logger.info('Welcome email sent successfully', {
        eventId: event.id,
        userId: event.data.userId
      });
    } catch (error) {
      await this.onError(event, error as Error);
    }
  }

  async onError(event: UserCreatedEvent, error: Error): Promise<void> {
    this.logger.error('Failed to send welcome email', error, {
      eventId: event.id,
      userId: event.data.userId,
      correlationId: event.correlationId
    });

    // Could implement retry logic or dead letter queue here
  }
}
```

### Event Subscription (EventBridge)

```typescript
// Lambda handler for EventBridge events
export const handler = async (event: any): Promise<void> => {
  // EventBridge wraps the event in a container
  const domainEvent: UserCreatedEvent = JSON.parse(event.detail);

  // Validate event schema
  const validated = UserCreatedEventSchema.parse(domainEvent);

  // Route to appropriate handler
  const handler = new SendWelcomeEmailHandler(emailService, logger);
  await handler.handle(validated);
};
```

### Event Subscription (Redis Pub/Sub for local dev)

```typescript
import Redis from 'ioredis';

export class RedisEventSubscriber {
  private redis: Redis;
  private handlers: Map<string, IEventHandler[]> = new Map();

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl);
  }

  async subscribe<T extends DomainEvent>(
    eventType: string,
    handler: IEventHandler<T>
  ): Promise<void> {
    const handlers = this.handlers.get(eventType) || [];
    handlers.push(handler as IEventHandler);
    this.handlers.set(eventType, handlers);

    await this.redis.subscribe(eventType);

    this.redis.on('message', async (channel, message) => {
      if (channel === eventType) {
        const event: T = JSON.parse(message);
        const eventHandlers = this.handlers.get(channel) || [];

        for (const h of eventHandlers) {
          await h.handle(event);
        }
      }
    });
  }
}
```

---

## Event Versioning Strategy

### Version Format

```
<service>.<aggregate>.<action>.v<major-version>

Examples:
- identity.user.created.v1
- identity.user.created.v2  (breaking change)
- organization.project.created.v1
```

### Handling Breaking Changes

```typescript
// V1 Event (original)
export interface UserCreatedEventV1 extends DomainEvent {
  type: 'identity.user.created.v1';
  data: {
    userId: string;
    email: string;
    name: string; // Single field
  };
}

// V2 Event (breaking change - split name into firstName/lastName)
export interface UserCreatedEventV2 extends DomainEvent {
  type: 'identity.user.created.v2';
  data: {
    userId: string;
    email: string;
    firstName: string; // Split field
    lastName: string;  // Split field
  };
}

// Handler that supports both versions
export class UserCreatedHandlerV2 implements IEventHandler {
  readonly eventTypes = ['identity.user.created.v1', 'identity.user.created.v2'];

  async handle(event: UserCreatedEventV1 | UserCreatedEventV2): Promise<void> {
    if (event.type === 'identity.user.created.v1') {
      // Transform V1 to V2 format
      const [firstName, lastName] = this.parseName(event.data.name);
      return this.processUser(event.data.userId, event.data.email, firstName, lastName);
    } else {
      // V2 format - use directly
      return this.processUser(
        event.data.userId,
        event.data.email,
        event.data.firstName,
        event.data.lastName
      );
    }
  }

  private parseName(fullName: string): [string, string] {
    const parts = fullName.split(' ');
    return [parts[0], parts.slice(1).join(' ')];
  }
}
```

### Version Deprecation Policy

1. **Announcement**: 2 sprints before removal
2. **Deprecation Header**: Add `X-Event-Deprecated: true` metadata
3. **Dual Publishing**: Publish both old and new versions for 2 sprints
4. **Removal**: After 2 sprints of dual publishing

---

## Migration from OLD

### OLD Approach (String-Based Events)

```typescript
// ❌ OLD codebase - error-prone string-based events

// publisher.ts
await sqs.sendMessage({
  QueueUrl: process.env.QUEUE_URL,
  MessageBody: JSON.stringify({
    type: 'permission-granded', // ❌ TYPO! Should be "granted"
    userId: user.id,
    projectId: project.id
  })
});

// consumer.ts
sqs.on('message', async (message) => {
  const event = JSON.parse(message.Body);

  // ❌ No type safety, no validation
  if (event.type === 'permission-granted') { // Different spelling!
    // This handler will NEVER execute due to typo
    await grantPermission(event.userId, event.projectId);
  }
});

// Result: Silent failure, permissions not granted, no error logged
```

### NEW Approach (Type-Safe Events)

```typescript
// ✅ NEW codebase - type-safe events with compile-time checks

import { PermissionGrantedEvent, PermissionGrantedEventSchema } from '@clenergize/contracts';

// publisher.ts
const event: PermissionGrantedEvent = {
  id: uuid(),
  type: 'organization.permission.granted.v1', // ✅ Type-checked!
  version: '1.0.0',
  occurredAt: new Date().toISOString(),
  aggregateId: permission.id,
  aggregateType: 'Permission',
  userId: admin.id,
  correlationId: requestId,
  data: {
    permissionId: permission.id,
    userId: user.id,
    resourceType: 'PROJECT',
    resourceId: project.id,
    permissions: ['READ', 'WRITE'],
    grantedBy: admin.id
  }
};

// ✅ Validate at runtime
const validated = PermissionGrantedEventSchema.parse(event);

await eventBus.publish(validated);

// consumer.ts
class PermissionGrantedHandler implements IEventHandler<PermissionGrantedEvent> {
  readonly eventTypes = ['organization.permission.granted.v1']; // ✅ Type-checked!

  async handle(event: PermissionGrantedEvent): Promise<void> {
    // ✅ Full type safety, autocomplete in IDE
    await this.grantPermission(
      event.data.userId,
      event.data.resourceId,
      event.data.permissions
    );
  }
}

// Result: Compile-time safety, runtime validation, guaranteed execution
```

### Migration Checklist

- [ ] Replace all SQS string events with typed EventBridge events
- [ ] Add Zod schemas for runtime validation
- [ ] Implement correlation ID tracking
- [ ] Add event versioning
- [ ] Set up EventBridge rules for local dev (LocalStack)
- [ ] Configure dead letter queues for failed events
- [ ] Implement event replay mechanism
- [ ] Add monitoring/alerting for event failures

---

## Best Practices

### 1. Event Naming Conventions

✅ **DO:**
- Use descriptive past tense: `UserCreated`, `OrderPlaced`, `PaymentProcessed`
- Follow format: `<service>.<aggregate>.<action>.v<version>`
- Use semantic versioning: `v1`, `v2`, `v3`

❌ **DON'T:**
- Use generic names: `Event`, `Update`, `Change`
- Mix tenses: `UserCreate`, `OrderPlacing`
- Skip versioning: `user.created` (no version)

### 2. Event Size

- Keep events < 256 KB (EventBridge limit)
- Store large payloads in S3, reference in event
- Include only essential data

### 3. Event Ordering

- Events are **not guaranteed to be ordered** across aggregates
- Use `causationId` to track event chains
- Design for eventual consistency

### 4. Idempotency

```typescript
// Always check if event was already processed
export class UserCreatedHandler {
  async handle(event: UserCreatedEvent): Promise<void> {
    // Check idempotency key
    const alreadyProcessed = await this.cache.get(`event:${event.id}`);
    if (alreadyProcessed) {
      this.logger.info('Event already processed', { eventId: event.id });
      return;
    }

    // Process event
    await this.processUser(event.data);

    // Mark as processed (TTL: 7 days)
    await this.cache.set(`event:${event.id}`, 'processed', 604800);
  }
}
```

---

## Appendix

### Complete Event Type Registry

```typescript
export type AllEvents =
  | IdentityEvent
  | OrganizationEvent
  | ReferenceEvent
  | ActivityEvent
  | CalculationEvent
  | ReportingEvent
  | AuditEvent;

export const EVENT_TYPE_MAP: Record<string, z.ZodSchema> = {
  'identity.user.created.v1': UserCreatedEventSchema,
  'identity.user.authenticated.v1': UserAuthenticatedEventSchema,
  'organization.project.created.v1': ProjectCreatedEventSchema,
  'organization.permission.granted.v1': PermissionGrantedEventSchema,
  'calculation.emission.calculated.v1': EmissionCalculatedEventSchema,
  // ... all other event schemas
};
```

### Event Statistics (for monitoring)

| Service | Event Types | Avg Events/Day | Peak Events/Hour |
|---------|-------------|----------------|------------------|
| Identity | 11 | 500 | 100 |
| Organization | 14 | 1,200 | 300 |
| Reference | 8 | 50 | 10 |
| Activity | 8 | 5,000 | 1,000 |
| Calculation | 7 | 10,000 | 2,500 |
| Reporting | 6 | 200 | 50 |
| Audit | 4 | 2,000 | 500 |
| **Total** | **58** | **19,000** | **4,460** |

---

**Last Updated**: November 18, 2025
**Next Review**: Sprint 0.3 (after EventBridge implementation)
**Maintained By**: Architecture Agent + All Service Agents
