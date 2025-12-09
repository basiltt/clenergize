# Event Contracts Skill

## Purpose
Replace string-based events with typed event contracts to prevent typos and ensure consistency.

## Problem in OLD Code

```typescript
// OLD: String events with typos and no type safety
eventEmitter.emit('user.crated', userData); // Typo!
eventEmitter.on('user.updated', (data) => {
  // What's in data? No type information!
});
```

## Solution: Typed Event System

### 1. Event Contract Definitions
```typescript
// Event base class
export abstract class DomainEvent {
  public readonly eventId: string = uuid();
  public readonly timestamp: Date = new Date();
  public readonly version: number = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventType: string
  ) {}
}

// Typed events
export class UserCreatedEvent extends DomainEvent {
  static readonly EVENT_TYPE = 'identity.user.created.v1';

  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly roles: string[]
  ) {
    super(userId, UserCreatedEvent.EVENT_TYPE);
  }
}

export class ProjectCreatedEvent extends DomainEvent {
  static readonly EVENT_TYPE = 'organization.project.created.v1';

  constructor(
    public readonly projectId: string,
    public readonly organizationId: string,
    public readonly name: string
  ) {
    super(projectId, ProjectCreatedEvent.EVENT_TYPE);
  }
}

export class EmissionCalculatedEvent extends DomainEvent {
  static readonly EVENT_TYPE = 'calculation.emission.calculated.v1';

  constructor(
    public readonly calculationId: string,
    public readonly projectId: string,
    public readonly emissions: number,
    public readonly unit: string
  ) {
    super(calculationId, EmissionCalculatedEvent.EVENT_TYPE);
  }
}
```

### 2. Type-Safe Event Bus
```typescript
// Typed event bus
export class TypedEventBus {
  private handlers = new Map<string, Set<EventHandler>>();

  // Type-safe subscription
  on<T extends DomainEvent>(
    eventClass: new (...args: any[]) => T,
    handler: (event: T) => Promise<void>
  ): void {
    const eventType = (eventClass as any).EVENT_TYPE;

    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }

    this.handlers.get(eventType)!.add(handler);
  }

  // Type-safe publishing
  async publish<T extends DomainEvent>(event: T): Promise<void> {
    const handlers = this.handlers.get(event.eventType) || new Set();

    for (const handler of handlers) {
      await handler(event);
    }
  }
}

// Usage with type safety
const eventBus = new TypedEventBus();

eventBus.on(UserCreatedEvent, async (event) => {
  // event is typed as UserCreatedEvent
  console.log(`User created: ${event.email}`);
});

await eventBus.publish(new UserCreatedEvent(
  'user-123',
  'john@example.com',
  ['user']
));
```

### 3. Event Schema Validation
```typescript
import { z } from 'zod';

// Define schemas
const UserCreatedSchema = z.object({
  eventType: z.literal('identity.user.created.v1'),
  userId: z.string().uuid(),
  email: z.string().email(),
  roles: z.array(z.string())
});

// Validate events
export class ValidatedEventBus {
  async publish(event: DomainEvent): Promise<void> {
    const schema = this.getSchemaForEvent(event.eventType);

    if (schema) {
      const result = schema.safeParse(event);

      if (!result.success) {
        throw new EventValidationException(
          `Invalid event: ${result.error.message}`
        );
      }
    }

    // Publish validated event
    await this.internalPublish(event);
  }
}
```

### 4. Event Sourcing Support
```typescript
// Event store for event sourcing
export class EventStore {
  async append(
    streamId: string,
    events: DomainEvent[],
    expectedVersion: number
  ): Promise<void> {
    const stream = await this.getStream(streamId);

    if (stream.version !== expectedVersion) {
      throw new ConcurrencyException();
    }

    for (const event of events) {
      await this.saveEvent({
        streamId,
        eventId: event.eventId,
        eventType: event.eventType,
        eventData: event,
        eventVersion: ++stream.version,
        timestamp: event.timestamp
      });
    }
  }

  async getEvents(
    streamId: string,
    fromVersion?: number
  ): Promise<DomainEvent[]> {
    const events = await this.loadEvents(streamId, fromVersion);

    return events.map(e => this.deserializeEvent(e));
  }
}
```

## Benefits
- Type safety
- No typos in event names
- IDE autocomplete
- Compile-time checking
- Event versioning support