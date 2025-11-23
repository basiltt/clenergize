# Event Sourcing Patterns for Clenergize V3
## Reliable Event-Driven Architecture Implementation Guide

**Created**: 2025-11-18
**Purpose**: Comprehensive guide for implementing event sourcing patterns across all microservices
**Sprint**: 0.1-0.2 (Foundation)
**Priority**: CRITICAL

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Outbox Pattern](#outbox-pattern)
3. [Saga Pattern](#saga-pattern)
4. [Idempotency Pattern](#idempotency-pattern)
5. [Event Versioning Strategy](#event-versioning-strategy)
6. [Event Replay](#event-replay)
7. [Dead Letter Queue Handling](#dead-letter-queue-handling)
8. [Event Store Design](#event-store-design)
9. [Implementation Checklist](#implementation-checklist)

---

## Executive Summary

This document defines the **event sourcing patterns** that ensure reliable, consistent, and fault-tolerant event-driven communication across all 7 Clenergize V3 microservices.

### Why Event Sourcing for Clenergize V3?

**Current Problem (OLD system)**:
- Events published **before** database commits (data loss risk)
- No idempotency (duplicate processing)
- No event versioning (breaking changes)
- Infinite SQS polling loops (system instability)
- No compensation for failed distributed operations

**NEW Solution**:
- **Outbox Pattern**: Atomic event publishing with database commits
- **Saga Pattern**: Distributed transactions with compensation
- **Idempotency**: Handle duplicate events gracefully
- **Event Versioning**: Schema evolution without breaking consumers
- **Circuit Breakers**: Prevent cascading failures

### Key Benefits

| Pattern | Problem Solved | Benefit |
|---------|---------------|---------|
| Outbox Pattern | Event lost if publish fails | **100% delivery guarantee** |
| Idempotency | Duplicate events processed | **Exactly-once semantics** |
| Saga Pattern | No distributed transactions | **Eventual consistency** |
| Event Versioning | Breaking schema changes | **Zero-downtime deployments** |
| Dead Letter Queue | Poison messages block queue | **Automatic error recovery** |

---

## Outbox Pattern

### Problem Statement

**Dual-write problem**: Writing to database and publishing event are two separate operations. If either fails, system state becomes inconsistent.

```typescript
// ❌ WRONG (OLD system approach)
async createProject(data: CreateProjectDto) {
  // Step 1: Write to database
  const project = await this.projectRepository.save(data);

  // Step 2: Publish event
  await this.eventBus.publish(new ProjectCreatedEvent(project));
  //        ^^^^^^^^^^^^^^^^ PROBLEM: If this fails, project exists but no one knows!

  return project;
}
```

**Failure scenarios**:
1. Database commit succeeds, event publish fails → **Data inconsistency**
2. Event publish succeeds, database commit fails → **Ghost events**
3. Network partition during publish → **Undefined state**

### Solution: Outbox Pattern

Store events in the **same database transaction** as the business data, then publish asynchronously.

```typescript
// ✅ CORRECT (NEW approach with Outbox Pattern)
async createProject(data: CreateProjectDto) {
  const session = await this.connection.startSession();

  try {
    await session.withTransaction(async () => {
      // Step 1: Write business data
      const project = await this.projectRepository.save(data, { session });

      // Step 2: Write event to outbox (ATOMIC with step 1)
      await this.outboxRepository.save({
        id: uuid(),
        aggregateId: project.id,
        aggregateType: 'Project',
        eventType: 'organization.project.created.v1',
        payload: {
          projectId: project.id,
          companyId: project.companyId,
          name: project.name,
          ownerId: project.ownerId,
          status: project.status
        },
        status: 'PENDING',
        createdAt: new Date(),
        attempts: 0
      }, { session });

      // ✅ Both operations commit together - no inconsistency possible
    });

    return project;
  } finally {
    await session.endSession();
  }
}
```

### Outbox Schema

```typescript
interface OutboxEvent {
  _id: ObjectId;

  // Event identification
  aggregateId: string;
  aggregateType: string;
  eventType: string;            // e.g., 'organization.project.created.v1'

  // Event data
  payload: Record<string, any>;
  correlationId?: string;
  causationId?: string;
  userId?: string;

  // Publishing status
  status: 'PENDING' | 'PUBLISHED' | 'FAILED';
  attempts: number;             // Retry counter
  lastAttempt?: Date;
  error?: string;               // Last error message

  // Timestamps
  createdAt: Date;
  publishedAt?: Date;

  // Indexes
  // - { status: 1, createdAt: 1 } - for poller query
  // - { aggregateId: 1, createdAt: 1 } - for event replay
  // - { publishedAt: 1 } - for cleanup (TTL index)
}
```

### Outbox Poller

```typescript
// @clenergize/common/src/outbox/outbox-poller.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OutboxRepository } from './outbox.repository';
import { EventBusService } from '../messaging/event-bus.service';

@Injectable()
export class OutboxPollerService {
  private readonly logger = new Logger(OutboxPollerService.name);
  private readonly MAX_RETRIES = 5;
  private readonly BATCH_SIZE = 100;

  constructor(
    private outboxRepository: OutboxRepository,
    private eventBus: EventBusService
  ) {}

  /**
   * Poll outbox every 5 seconds for pending events
   */
  @Cron(CronExpression.EVERY_5_SECONDS)
  async pollAndPublish() {
    try {
      // Fetch pending events (ordered by creation time)
      const pendingEvents = await this.outboxRepository.findPending({
        limit: this.BATCH_SIZE,
        maxAttempts: this.MAX_RETRIES
      });

      if (pendingEvents.length === 0) {
        return; // Nothing to publish
      }

      this.logger.log(`Publishing ${pendingEvents.length} pending events`);

      // Publish each event
      for (const outboxEvent of pendingEvents) {
        await this.publishEvent(outboxEvent);
      }
    } catch (error) {
      this.logger.error('Outbox poller failed', error.stack);
    }
  }

  private async publishEvent(outboxEvent: OutboxEvent) {
    try {
      // Construct domain event
      const domainEvent = {
        id: uuid(),
        type: outboxEvent.eventType,
        version: '1.0.0',
        occurredAt: outboxEvent.createdAt.toISOString(),
        aggregateId: outboxEvent.aggregateId,
        aggregateType: outboxEvent.aggregateType,
        correlationId: outboxEvent.correlationId || uuid(),
        causationId: outboxEvent.causationId,
        userId: outboxEvent.userId,
        data: outboxEvent.payload
      };

      // Publish to event bus (EventBridge, SQS, etc.)
      await this.eventBus.publish(domainEvent);

      // Mark as published
      await this.outboxRepository.markPublished(outboxEvent._id);

      this.logger.debug(`Published event ${outboxEvent.eventType} for ${outboxEvent.aggregateId}`);
    } catch (error) {
      // Increment retry counter
      await this.outboxRepository.markFailed(outboxEvent._id, error.message);

      if (outboxEvent.attempts >= this.MAX_RETRIES) {
        this.logger.error(
          `Event ${outboxEvent.eventType} exceeded max retries (${this.MAX_RETRIES})`,
          error.stack
        );
        // Optionally: Send to dead letter queue
        await this.moveToDeadLetterQueue(outboxEvent, error);
      }
    }
  }

  private async moveToDeadLetterQueue(outboxEvent: OutboxEvent, error: Error) {
    // Store in DLQ collection for manual review
    await this.outboxRepository.moveToDeadLetterQueue({
      ...outboxEvent,
      error: error.message,
      failedAt: new Date()
    });
  }

  /**
   * Cleanup published events after 7 days (configurable)
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupPublishedEvents() {
    const retentionDays = 7;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.outboxRepository.deletePublished(cutoffDate);

    this.logger.log(`Cleaned up ${result.deletedCount} published events older than ${retentionDays} days`);
  }
}
```

### Outbox Repository

```typescript
// outbox.repository.ts
@Injectable()
export class OutboxRepository {
  constructor(
    @InjectModel('OutboxEvent') private model: Model<OutboxEventDocument>
  ) {}

  async save(event: Partial<OutboxEvent>, options?: SaveOptions): Promise<OutboxEvent> {
    return this.model.create([event], options)[0];
  }

  async findPending(options: { limit: number; maxAttempts: number }): Promise<OutboxEvent[]> {
    return this.model
      .find({
        status: 'PENDING',
        attempts: { $lt: options.maxAttempts }
      })
      .sort({ createdAt: 1 })
      .limit(options.limit)
      .exec();
  }

  async markPublished(id: ObjectId): Promise<void> {
    await this.model.updateOne(
      { _id: id },
      {
        $set: {
          status: 'PUBLISHED',
          publishedAt: new Date()
        }
      }
    );
  }

  async markFailed(id: ObjectId, error: string): Promise<void> {
    await this.model.updateOne(
      { _id: id },
      {
        $set: {
          status: 'FAILED',
          error,
          lastAttempt: new Date()
        },
        $inc: { attempts: 1 }
      }
    );
  }

  async moveToDeadLetterQueue(event: OutboxEvent & { failedAt: Date }): Promise<void> {
    // Move to separate DLQ collection
    await this.model.db.collection('outbox_dlq').insertOne(event);

    // Update status
    await this.model.updateOne(
      { _id: event._id },
      { $set: { status: 'MOVED_TO_DLQ' } }
    );
  }

  async deletePublished(beforeDate: Date): Promise<{ deletedCount: number }> {
    const result = await this.model.deleteMany({
      status: 'PUBLISHED',
      publishedAt: { $lt: beforeDate }
    });

    return { deletedCount: result.deletedCount };
  }
}
```

### Benefits of Outbox Pattern

✅ **Guaranteed Delivery**: Event publishing can be retried until successful
✅ **Consistency**: Business data and events commit atomically
✅ **Resilience**: Service can restart without losing events
✅ **Ordering**: Events published in creation order
✅ **Observability**: Failed events visible in outbox table

---

## Saga Pattern

### Problem Statement

Distributed transactions across microservices don't exist. How do we ensure consistency when an operation spans multiple services?

**Example**: Creating a project requires:
1. Create project (Organization Service)
2. Create carbon scopes (Activity Service)
3. Initialize company details (Organization Service)
4. Create audit log (Audit Service)

If step 3 fails, steps 1-2 must be rolled back (compensated).

### Solution: Saga Pattern

A saga is a sequence of local transactions with compensation actions for rollback.

```typescript
// saga/create-project.saga.ts
import { Injectable, Logger } from '@nestjs/common';
import { SagaOrchestrator } from '@clenergize/common';

@Injectable()
export class CreateProjectSaga {
  private readonly logger = new Logger(CreateProjectSaga.name);

  constructor(
    private orchestrator: SagaOrchestrator,
    private projectService: ProjectService,
    private carbonScopeService: CarbonScopeService,
    private companyDetailsService: CompanyDetailsService,
    private auditService: AuditService
  ) {}

  async execute(data: CreateProjectDto, userId: string) {
    const saga = this.orchestrator.create({
      sagaId: uuid(),
      name: 'CreateProject',
      correlationId: data.correlationId || uuid(),
      userId
    });

    try {
      // Step 1: Create project
      const project = await saga.step({
        name: 'CreateProject',
        execute: async () => {
          return await this.projectService.create(data);
        },
        compensate: async (project) => {
          this.logger.warn(`Compensating: Deleting project ${project.id}`);
          await this.projectService.delete(project.id, { hard: true });
        }
      });

      // Step 2: Create carbon scopes for each year
      const carbonScopes = await saga.step({
        name: 'CreateCarbonScopes',
        execute: async () => {
          return await this.carbonScopeService.createForProject({
            projectId: project.id,
            years: data.years,
            modules: data.modules
          });
        },
        compensate: async (scopes) => {
          this.logger.warn(`Compensating: Deleting ${scopes.length} carbon scopes`);
          await this.carbonScopeService.deleteByProject(project.id);
        }
      });

      // Step 3: Initialize company details
      const companyDetails = await saga.step({
        name: 'InitializeCompanyDetails',
        execute: async () => {
          return await this.companyDetailsService.initialize({
            projectId: project.id,
            companyId: project.companyId,
            year: data.years[0] // Initialize for first year
          });
        },
        compensate: async (details) => {
          this.logger.warn(`Compensating: Deleting company details ${details.id}`);
          await this.companyDetailsService.delete(details.id);
        }
      });

      // Step 4: Create audit log
      await saga.step({
        name: 'CreateAuditLog',
        execute: async () => {
          return await this.auditService.log({
            action: 'PROJECT_CREATED',
            entityType: 'Project',
            entityId: project.id,
            userId,
            details: {
              projectName: project.name,
              companyId: project.companyId
            }
          });
        },
        compensate: async () => {
          // Audit logs are immutable - no compensation needed
          this.logger.warn('Compensating: Audit log remains (immutable)');
        }
      });

      // All steps completed successfully
      await saga.complete();

      this.logger.log(`Saga completed: Project ${project.id} created successfully`);

      return {
        project,
        carbonScopes,
        companyDetails
      };
    } catch (error) {
      // Saga failed - compensate all completed steps
      await saga.compensate();

      this.logger.error(`Saga failed: ${error.message}`, error.stack);
      throw new SagaFailedError(saga.sagaId, error);
    }
  }
}
```

### Saga Orchestrator

```typescript
// @clenergize/common/src/saga/saga-orchestrator.ts
export interface SagaStep<T = any> {
  name: string;
  execute: () => Promise<T>;
  compensate: (result: T) => Promise<void>;
}

export class SagaOrchestrator {
  create(config: { sagaId: string; name: string; correlationId: string; userId: string }) {
    return new Saga(config);
  }
}

export class Saga {
  private steps: { name: string; result: any; compensate: (result: any) => Promise<void> }[] = [];
  private status: 'RUNNING' | 'COMPLETED' | 'COMPENSATING' | 'COMPENSATED' | 'FAILED' = 'RUNNING';

  constructor(
    private config: { sagaId: string; name: string; correlationId: string; userId: string }
  ) {}

  async step<T>(step: SagaStep<T>): Promise<T> {
    if (this.status !== 'RUNNING') {
      throw new Error('Cannot execute step - saga is not running');
    }

    try {
      const result = await step.execute();

      // Store step for potential compensation
      this.steps.push({
        name: step.name,
        result,
        compensate: step.compensate
      });

      return result;
    } catch (error) {
      // Step failed - initiate compensation
      throw error;
    }
  }

  async complete() {
    this.status = 'COMPLETED';
  }

  async compensate() {
    this.status = 'COMPENSATING';

    // Compensate in reverse order (last step first)
    for (let i = this.steps.length - 1; i >= 0; i--) {
      const step = this.steps[i];

      try {
        await step.compensate(step.result);
      } catch (error) {
        console.error(`Compensation failed for step ${step.name}:`, error);
        // Continue compensating other steps even if one fails
      }
    }

    this.status = 'COMPENSATED';
  }
}
```

### Saga State Persistence

For long-running sagas (hours/days), persist saga state:

```typescript
interface SagaState {
  sagaId: string;
  name: string;
  status: 'RUNNING' | 'COMPLETED' | 'COMPENSATING' | 'COMPENSATED' | 'FAILED';
  steps: {
    name: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'COMPENSATED';
    result?: any;
    error?: string;
    startedAt: Date;
    completedAt?: Date;
  }[];
  correlationId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Benefits of Saga Pattern

✅ **Distributed Transactions**: Eventual consistency across services
✅ **Resilience**: Automatic rollback on failure
✅ **Visibility**: Saga state visible in logs/database
✅ **Compensation**: Clean failure handling
✅ **Retry**: Can retry failed steps

---

## Idempotency Pattern

### Problem Statement

Events can be delivered **more than once** (at-least-once delivery). Processing the same event twice can cause:
- Duplicate database records
- Incorrect calculations (double-counting)
- Duplicate notifications

### Solution: Idempotency Keys

Track processed events to detect and skip duplicates.

```typescript
// idempotency/idempotency.guard.ts
import { Injectable, Logger } from '@nestjs/common';
import { IdempotencyRepository } from './idempotency.repository';

@Injectable()
export class IdempotencyGuard {
  private readonly logger = new Logger(IdempotencyGuard.name);

  constructor(private repository: IdempotencyRepository) {}

  /**
   * Execute operation with idempotency protection
   */
  async execute<T>(
    idempotencyKey: string,
    operation: () => Promise<T>
  ): Promise<{ result: T; wasProcessed: boolean }> {
    // Check if already processed
    const existing = await this.repository.findByKey(idempotencyKey);

    if (existing) {
      if (existing.status === 'COMPLETED') {
        this.logger.debug(`Event ${idempotencyKey} already processed - skipping`);
        return { result: existing.result as T, wasProcessed: true };
      }

      if (existing.status === 'PROCESSING') {
        // Another instance is processing - wait and retry
        this.logger.warn(`Event ${idempotencyKey} is being processed elsewhere - waiting...`);
        await this.waitForCompletion(idempotencyKey);
        return this.execute(idempotencyKey, operation); // Retry
      }
    }

    // Mark as processing
    await this.repository.create({
      idempotencyKey,
      status: 'PROCESSING',
      startedAt: new Date()
    });

    try {
      // Execute operation
      const result = await operation();

      // Mark as completed with result
      await this.repository.markCompleted(idempotencyKey, result);

      return { result, wasProcessed: false };
    } catch (error) {
      // Mark as failed
      await this.repository.markFailed(idempotencyKey, error.message);
      throw error;
    }
  }

  private async waitForCompletion(key: string, maxWaitMs: number = 5000): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitMs) {
      const record = await this.repository.findByKey(key);

      if (record?.status === 'COMPLETED') {
        return;
      }

      // Wait 100ms before checking again
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    throw new Error(`Timeout waiting for idempotency key ${key}`);
  }
}
```

### Idempotency Schema

```typescript
interface IdempotencyRecord {
  _id: ObjectId;
  idempotencyKey: string;     // Event ID or composite key
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  result?: any;               // Cached result
  error?: string;
  startedAt: Date;
  completedAt?: Date;

  // TTL index on completedAt (clean up after 7 days)
}
```

### Event Handler with Idempotency

```typescript
// handlers/user-created.handler.ts
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserCreatedEvent } from '@clenergize/contracts';

@EventsHandler(UserCreatedEvent)
export class UserCreatedHandler implements IEventHandler<UserCreatedEvent> {
  constructor(
    private userReferenceService: UserReferenceService,
    private idempotencyGuard: IdempotencyGuard
  ) {}

  async handle(event: UserCreatedEvent) {
    // Use event ID as idempotency key
    const idempotencyKey = event.id;

    const { wasProcessed } = await this.idempotencyGuard.execute(
      idempotencyKey,
      async () => {
        // Create user reference
        return await this.userReferenceService.create({
          userId: event.data.userId,
          email: event.data.email,
          name: `${event.data.firstName} ${event.data.lastName}`,
          roles: event.data.roles
        });
      }
    );

    if (wasProcessed) {
      console.log(`Event ${event.id} was already processed - skipped`);
    } else {
      console.log(`Event ${event.id} processed successfully`);
    }
  }
}
```

### Benefits of Idempotency

✅ **Exactly-Once Processing**: Duplicate events don't cause duplicate work
✅ **Resilience**: Safe to retry failed operations
✅ **Correctness**: Prevents double-counting in calculations
✅ **Simplicity**: Consumers don't need complex deduplication logic

---

## Event Versioning Strategy

### Problem Statement

Event schemas evolve over time. How do we change event structure without breaking existing consumers?

**Example**: Adding a new field to UserCreatedEvent
```typescript
// v1 (original)
{
  userId: string;
  email: string;
  name: string;
}

// v2 (new - firstName/lastName instead of name)
{
  userId: string;
  email: string;
  firstName: string;  // NEW
  lastName: string;   // NEW
  // name removed - BREAKING CHANGE!
}
```

### Solution: Semantic Versioning

Use **semantic versioning** for event types:
- `identity.user.created.v1` - Original version
- `identity.user.created.v2` - Non-breaking changes (add fields)
- `identity.user.created.v3` - Breaking changes (remove/rename fields)

### Version Compatibility Matrix

| Change Type | Version Bump | Example |
|-------------|--------------|---------|
| Add optional field | Minor (v1.1) | Add `phoneNumber?: string` |
| Add required field with default | Minor (v1.2) | Add `status: 'ACTIVE'` |
| Remove field | Major (v2.0) | Remove `name` |
| Rename field | Major (v2.0) | `name` → `firstName`, `lastName` |
| Change field type | Major (v2.0) | `age: string` → `age: number` |

### Event Upcasting

Convert old event versions to new versions:

```typescript
// event-upcaster.service.ts
@Injectable()
export class EventUpcasterService {
  /**
   * Convert event to latest version
   */
  upcast(event: DomainEvent): DomainEvent {
    // Extract version from event type
    const version = this.extractVersion(event.type);

    // Apply upcasters sequentially
    let upgradedEvent = event;

    if (event.type.startsWith('identity.user.created')) {
      if (version === 1) {
        upgradedEvent = this.upcastUserCreatedV1ToV2(upgradedEvent);
      }
      // Add more version upgrades as needed
    }

    return upgradedEvent;
  }

  private upcastUserCreatedV1ToV2(event: any): any {
    // v1 had single `name` field
    // v2 has `firstName` and `lastName`

    const nameParts = event.data.name?.split(' ') || ['', ''];

    return {
      ...event,
      type: 'identity.user.created.v2',
      version: '2.0.0',
      data: {
        ...event.data,
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(' ') || nameParts[0],
        // Remove old `name` field
        name: undefined
      }
    };
  }

  private extractVersion(eventType: string): number {
    const match = eventType.match(/\.v(\d+)$/);
    return match ? parseInt(match[1], 10) : 1;
  }
}
```

### Consumer Version Support

Consumers declare which event versions they support:

```typescript
// user-created.handler.ts
@EventsHandler(UserCreatedEvent)
export class UserCreatedHandler implements IEventHandler<UserCreatedEvent> {
  // Declare supported versions
  static readonly SUPPORTED_VERSIONS = [1, 2];

  constructor(
    private upcaster: EventUpcasterService,
    private userReferenceService: UserReferenceService
  ) {}

  async handle(event: UserCreatedEvent) {
    // Upcast to latest version
    const upgradedEvent = this.upcaster.upcast(event);

    // Process using v2 structure
    await this.userReferenceService.create({
      userId: upgradedEvent.data.userId,
      email: upgradedEvent.data.email,
      firstName: upgradedEvent.data.firstName,
      lastName: upgradedEvent.data.lastName
    });
  }
}
```

### Benefits of Event Versioning

✅ **Zero-Downtime Deployments**: Deploy consumers/producers independently
✅ **Backward Compatibility**: Old events still work with new consumers
✅ **Forward Compatibility**: New consumers understand old events (via upcasting)
✅ **Schema Evolution**: Evolve event structure safely over time

---

## Event Replay

### Use Cases

1. **Rebuild Read Models**: Regenerate projections from events
2. **Debug**: Investigate what happened
3. **Migration**: Move to new event store
4. **Audit**: Compliance investigations

### Implementation

```typescript
// event-replay.service.ts
@Injectable()
export class EventReplayService {
  constructor(
    private eventStore: EventStoreRepository,
    private eventBus: EventBusService
  ) {}

  /**
   * Replay all events for an aggregate
   */
  async replayAggregate(aggregateId: string): Promise<void> {
    const events = await this.eventStore.findByAggregate(aggregateId, {
      orderBy: 'occurredAt',
      direction: 'ASC'
    });

    for (const event of events) {
      await this.eventBus.publish(event);
    }
  }

  /**
   * Replay events in a time range
   */
  async replayTimeRange(startDate: Date, endDate: Date): Promise<void> {
    const events = await this.eventStore.findInTimeRange(startDate, endDate, {
      orderBy: 'occurredAt',
      direction: 'ASC',
      batchSize: 1000
    });

    for (const event of events) {
      await this.eventBus.publish(event);

      // Throttle to avoid overwhelming consumers
      await this.sleep(10); // 10ms delay between events
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

---

## Dead Letter Queue Handling

### When Events Fail

Events can fail to process due to:
1. **Transient errors**: Network issues, database unavailable
2. **Poison messages**: Invalid data, schema violations
3. **Business logic errors**: Validation failures

### DLQ Strategy

```typescript
// event-consumer.service.ts
async processEvent(event: DomainEvent) {
  const MAX_RETRIES = 3;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      await this.handleEvent(event);
      return; // Success
    } catch (error) {
      attempt++;

      if (this.isTransientError(error)) {
        // Retry with exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await this.sleep(delay);
        continue;
      }

      // Non-retryable error - send to DLQ
      await this.sendToDeadLetterQueue(event, error);
      throw error;
    }
  }

  // Max retries exceeded - send to DLQ
  await this.sendToDeadLetterQueue(event, new Error('Max retries exceeded'));
}

private isTransientError(error: Error): boolean {
  return [
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND'
  ].some(code => error.message.includes(code));
}

private async sendToDeadLetterQueue(event: DomainEvent, error: Error) {
  await this.dlqRepository.save({
    event,
    error: error.message,
    stack: error.stack,
    failedAt: new Date(),
    serviceName: process.env.SERVICE_NAME
  });
}
```

---

## Event Store Design

### Schema

```typescript
interface EventStoreEntry {
  _id: ObjectId;

  // Event identification
  eventId: string;              // UUID
  eventType: string;            // e.g., 'identity.user.created.v1'
  version: string;              // Semantic version

  // Aggregate information
  aggregateId: string;
  aggregateType: string;
  aggregateVersion: number;     // Aggregate version (incremented per event)

  // Event data
  payload: Record<string, any>;

  // Correlation
  correlationId: string;
  causationId?: string;
  userId?: string;

  // Metadata
  occurredAt: Date;
  service: string;

  // Indexes:
  // - { aggregateId: 1, aggregateVersion: 1 } unique - ensures event order
  // - { eventType: 1, occurredAt: 1 } - for event type queries
  // - { correlationId: 1 } - for distributed tracing
}
```

---

## Implementation Checklist

### Sprint 0.1 (Critical - Security Foundation)
- [ ] Implement Outbox Pattern in all services
- [ ] Create Outbox Poller background job
- [ ] Add MongoDB transactions to all write operations
- [ ] Implement Idempotency Guard
- [ ] Create idempotency tables in all service databases

### Sprint 0.2 (Event Infrastructure)
- [ ] Implement Saga Orchestrator
- [ ] Create CreateProjectSaga (example saga)
- [ ] Implement Event Upcaster Service
- [ ] Add event versioning support (v1 → v2 migration)
- [ ] Create Dead Letter Queue tables

### Sprint 0.3 (Event Store)
- [ ] Implement Event Store Repository
- [ ] Create Event Replay Service
- [ ] Add event archiving (move old events to S3)
- [ ] Implement event query API

### Sprint 0.4 (Monitoring)
- [ ] Add metrics for outbox lag
- [ ] Create dashboards for saga status
- [ ] Set up alerts for DLQ threshold
- [ ] Implement event audit trail

---

## Conclusion

These event sourcing patterns provide the foundation for a **reliable, consistent, and fault-tolerant** event-driven architecture across all Clenergize V3 microservices.

**Key Takeaways**:
1. **Outbox Pattern**: Never publish events directly - use outbox for guaranteed delivery
2. **Saga Pattern**: Use sagas for distributed transactions with compensation
3. **Idempotency**: Always use idempotency keys to handle duplicate events
4. **Event Versioning**: Version all events for safe schema evolution
5. **DLQ**: Always have a dead letter queue for poison messages

**Next Steps**:
1. Implement Outbox Pattern in Sprint 0.1 (CRITICAL)
2. Create reusable Saga Orchestrator library
3. Add event versioning to Event Schema Registry
4. Set up monitoring for event processing health

---

**Document Version**: 1.0.0
**Last Updated**: 2025-11-18
**Next Review**: End of Sprint 0.2
