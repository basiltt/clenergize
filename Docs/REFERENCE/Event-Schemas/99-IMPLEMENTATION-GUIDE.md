# Event Implementation Guide

This document contains patterns, strategies, and best practices for implementing events in the Clenergize V3 system.

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
  // Identity Service (15 events)
  'identity.user.created.v1': UserCreatedEventSchema,
  'identity.user.updated.v1': UserUpdatedEventSchema,
  'identity.user.deleted.v1': UserDeletedEventSchema,
  'identity.user.authenticated.v1': UserAuthenticatedEventSchema,
  'identity.user.authentication-failed.v1': UserAuthenticationFailedEventSchema,
  'identity.password.reset-requested.v1': PasswordResetRequestedEventSchema,
  'identity.password.reset-completed.v1': PasswordResetCompletedEventSchema,
  'identity.user.role-assigned.v1': UserRoleAssignedEventSchema,
  'identity.user.role-revoked.v1': UserRoleRevokedEventSchema,
  'identity.user.activated.v1': UserActivatedEventSchema,
  'identity.user.deactivated.v1': UserDeactivatedEventSchema,
  'identity.session.created.v1': SessionCreatedEventSchema,
  'identity.session.expired.v1': SessionExpiredEventSchema,
  'identity.2fa.enabled.v1': TwoFactorEnabledEventSchema,
  'identity.2fa.disabled.v1': TwoFactorDisabledEventSchema,

  // Organization Service (27 events)
  'organization.organization.created.v1': OrganizationCreatedEventSchema,
  'organization.organization.updated.v1': OrganizationUpdatedEventSchema,
  'organization.organization.deleted.v1': OrganizationDeletedEventSchema,
  'organization.project.created.v1': ProjectCreatedEventSchema,
  'organization.project.updated.v1': ProjectUpdatedEventSchema,
  'organization.project.deleted.v1': ProjectDeletedEventSchema,
  'organization.project.archived.v1': ProjectArchivedEventSchema,
  'organization.project.restored.v1': ProjectRestoredEventSchema,
  'organization.hierarchy.created.v1': HierarchyCreatedEventSchema,
  'organization.hierarchy.updated.v1': HierarchyUpdatedEventSchema,
  'organization.hierarchy.node-added.v1': HierarchyNodeAddedEventSchema,
  'organization.hierarchy.node-removed.v1': HierarchyNodeRemovedEventSchema,
  'organization.hierarchy.node-moved.v1': HierarchyNodeMovedEventSchema,
  'organization.permission.granted.v1': PermissionGrantedEventSchema,
  'organization.permission.revoked.v1': PermissionRevokedEventSchema,
  'organization.user.added.v1': UserAddedToOrganizationEventSchema,
  'organization.user.removed.v1': UserRemovedFromOrganizationEventSchema,
  'organization.reporting-year.created.v1': ReportingYearCreatedEventSchema,
  'organization.reporting-year.locked.v1': ReportingYearLockedEventSchema,
  'organization.module.enabled.v1': ModuleEnabledEventSchema,
  'organization.module.disabled.v1': ModuleDisabledEventSchema,
  'organization.team.created.v1': TeamCreatedEventSchema,
  'organization.team.member-added.v1': TeamMemberAddedEventSchema,
  'organization.team.member-removed.v1': TeamMemberRemovedEventSchema,
  'organization.entity.created.v1': EntityCreatedEventSchema,
  'organization.entity.updated.v1': EntityUpdatedEventSchema,
  'organization.entity.deleted.v1': EntityDeletedEventSchema,

  // Reference Service (15 events)
  'reference.emission-factor.created.v1': EmissionFactorCreatedEventSchema,
  'reference.emission-factor.updated.v1': EmissionFactorUpdatedEventSchema,
  'reference.emission-factor.deprecated.v1': EmissionFactorDeprecatedEventSchema,
  'reference.unit.created.v1': UnitCreatedEventSchema,
  'reference.unit.updated.v1': UnitUpdatedEventSchema,
  'reference.conversion.created.v1': ConversionRuleCreatedEventSchema,
  'reference.data.imported.v1': ReferenceDataImportedEventSchema,
  'reference.data.versioned.v1': ReferenceDataVersionedEventSchema,
  'reference.parameter.created.v1': ParameterCreatedEventSchema,
  'reference.parameter.updated.v1': ParameterUpdatedEventSchema,
  'reference.category.created.v1': CategoryCreatedEventSchema,
  'reference.data.synced.v1': ReferenceDataSyncedEventSchema,
  'reference.data.validated.v1': ReferenceDataValidatedEventSchema,
  'reference.emission-factor.region-mapped.v1': EmissionFactorRegionMappedEventSchema,
  'reference.custom-emission-factor.created.v1': CustomEmissionFactorCreatedEventSchema,

  // Activity Service (15 events)
  'activity.data.ingested.v1': ActivityDataIngestedEventSchema,
  'activity.data.validated.v1': ActivityDataValidatedEventSchema,
  'activity.data.validation-failed.v1': ActivityDataValidationFailedEventSchema,
  'activity.data.verified.v1': ActivityDataVerifiedEventSchema,
  'activity.data.updated.v1': ActivityDataUpdatedEventSchema,
  'activity.data.deleted.v1': ActivityDataDeletedEventSchema,
  'activity.bulk-import.started.v1': BulkImportStartedEventSchema,
  'activity.bulk-import.completed.v1': BulkImportCompletedEventSchema,
  'activity.bulk-import.failed.v1': BulkImportFailedEventSchema,
  'activity.carbon-scope.created.v1': CarbonScopeCreatedEventSchema,
  'activity.carbon-scope.updated.v1': CarbonScopeUpdatedEventSchema,
  'activity.comment.added.v1': ActivityCommentAddedEventSchema,
  'activity.file.attached.v1': FileAttachedEventSchema,
  'activity.data-quality.flagged.v1': DataQualityFlaggedEventSchema,
  'activity.data-quality.resolved.v1': DataQualityResolvedEventSchema,

  // Calculation Service (8 events)
  'calculation.calculation.started.v1': CalculationStartedEventSchema,
  'calculation.calculation.completed.v1': CalculationCompletedEventSchema,
  'calculation.calculation.failed.v1': CalculationFailedEventSchema,
  'calculation.emission.calculated.v1': EmissionCalculatedEventSchema,
  'calculation.rollup.started.v1': RollupStartedEventSchema,
  'calculation.rollup.completed.v1': RollupCompletedEventSchema,
  'calculation.recalculation.triggered.v1': RecalculationTriggeredEventSchema,
  'calculation.allocation.created.v1': AllocationCreatedEventSchema,

  // Reporting Service (8 events)
  'reporting.report.generation-started.v1': ReportGenerationStartedEventSchema,
  'reporting.report.generation-completed.v1': ReportGenerationCompletedEventSchema,
  'reporting.report.generation-failed.v1': ReportGenerationFailedEventSchema,
  'reporting.report.scheduled.v1': ReportScheduledEventSchema,
  'reporting.report.exported.v1': ReportExportedEventSchema,
  'reporting.dashboard.refreshed.v1': DashboardRefreshedEventSchema,
  'reporting.export.started.v1': ExportStartedEventSchema,
  'reporting.export.completed.v1': ExportCompletedEventSchema,

  // Audit Service (4 events)
  'audit.log.created.v1': AuditLogCreatedEventSchema,
  'audit.compliance.check-completed.v1': ComplianceCheckCompletedEventSchema,
  'audit.security.event-detected.v1': SecurityEventDetectedEventSchema,
  'audit.data-access.logged.v1': DataAccessLoggedEventSchema
};
```

### Event Statistics (for monitoring)

| Service | Event Types | Avg Events/Day | Peak Events/Hour |
|---------|-------------|----------------|------------------|
| Identity | 15 | 500 | 100 |
| Organization | 27 | 1,200 | 300 |
| Reference | 15 | 50 | 10 |
| Activity | 15 | 5,000 | 1,000 |
| Calculation | 8 | 10,000 | 2,500 |
| Reporting | 8 | 200 | 50 |
| Audit | 4 | 2,000 | 500 |
| **Total** | **92** | **19,000** | **4,460** |

---

**Last Updated**: November 18, 2025
**Next Review**: Sprint 0.3 (after EventBridge implementation)
**Maintained By**: Architecture Agent + All Service Agents
