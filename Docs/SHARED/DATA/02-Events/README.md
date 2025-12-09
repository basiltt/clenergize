# Event Schema Registry

> **Split from**: `EVENT_SCHEMA_REGISTRY.md` (4,606 lines → 9 manageable files)
> **Reason**: Original file exceeded token limits (41,424 tokens), preventing verification
> **Date Split**: November 18, 2025

---

## 📚 Table of Contents

This directory contains all event schemas for the Clenergize V3 microservices architecture. Each file is now under 25,000 tokens for easy reading and verification.

### Core Event Schemas (58 total event types)

| File | Service | Events | Size | Description |
|------|---------|--------|------|-------------|
| [00-BASE.md](00-BASE.md) | All | Base | 3.1K | Base `DomainEvent` interface and Zod schema |
| [01-IDENTITY.md](01-IDENTITY.md) | Identity | 15 | 16K | Authentication, users, sessions, MFA |
| [02-ORGANIZATION.md](02-ORGANIZATION.md) | Organization | 14 | 31K | Projects, hierarchies, permissions |
| [03-REFERENCE.md](03-REFERENCE.md) | Reference | 8 | 19K | Emission factors, units, versioning |
| [04-ACTIVITY.md](04-ACTIVITY.md) | Activity | 8 | 16K | Data ingestion, validation |
| [05-CALCULATION.md](05-CALCULATION.md) | Calculation | 7 | 9.6K | Emission calculations, aggregations |
| [06-REPORTING.md](06-REPORTING.md) | Reporting | 6 | 8.3K | Report generation, exports |
| [07-AUDIT.md](07-AUDIT.md) | Audit | 4 | 5.8K | Compliance, security monitoring |

### Implementation Guides

| File | Size | Description |
|------|------|-------------|
| [99-IMPLEMENTATION-GUIDE.md](99-IMPLEMENTATION-GUIDE.md) | 20K | Event publishing patterns, consumption patterns, versioning strategy, migration guide, best practices |

---

## 🚀 Quick Reference

### Event Naming Convention

```
<service>.<aggregate>.<action>.v<version>
```

**Examples**:
- `identity.user.created.v1`
- `organization.project.hierarchy-updated.v1`
- `activity.data.ingested.v1`
- `calculation.emission.calculated.v1`

**Rules**:
- Lowercase only
- Kebab-case for multi-word actions (`role-assigned`, not `roleAssigned`)
- Versioned with `.vN` suffix
- Past tense for completed actions

### Event Structure

All events extend the base `DomainEvent` interface:

```typescript
export interface DomainEvent {
  id: string;                 // UUID v4
  type: string;               // Event type (see naming convention)
  version: string;            // Schema version (semver)
  occurredAt: string;         // ISO 8601 timestamp
  aggregateId: string;        // ID of aggregate that generated event
  aggregateType: string;      // Type of aggregate (e.g., "User", "Project")
  userId?: string;            // User who triggered event
  correlationId: string;      // Request tracing ID
  causationId?: string;       // ID of event that caused this event
  data: any;                  // Event-specific payload
}
```

### Usage Example

```typescript
import { UserCreatedEvent } from '@clenergize/contracts/events/identity';

// Publishing an event
const event: UserCreatedEvent = {
  id: uuidv4(),
  type: 'identity.user.created.v1',
  version: '1.0.0',
  occurredAt: new Date().toISOString(),
  aggregateId: user.id,
  aggregateType: 'User',
  userId: creatingUser.id,
  correlationId: req.correlationId,
  data: {
    userId: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    roles: user.roles,
    status: user.status,
    createdBy: creatingUser.id
  }
};

await eventBus.publish(event);
```

---

## 🔍 Event Cross-Service Dependencies

### Identity → Organization
- `identity.user.created.v1` → Organization creates user association
- `identity.user.deleted.v1` → Organization removes user from projects

### Organization → Calculation
- `organization.project.created.v1` → Calculation initializes emission tracking
- `organization.hierarchy.updated.v1` → Calculation recalculates aggregations

### Activity → Calculation
- `activity.data.ingested.v1` → Calculation triggers emission computation
- `activity.data.validation-failed.v1` → Calculation skips invalid data

### Calculation → Reporting
- `calculation.emission.calculated.v1` → Reporting updates dashboards
- `calculation.rollup.completed.v1` → Reporting generates period reports

### All Services → Audit
- All events published to EventBridge
- Audit service subscribes to ALL event types for compliance logging

---

## 📊 Event Statistics

| Metric | Value |
|--------|-------|
| **Total Event Types** | 58 |
| **Total Lines (combined)** | 4,606 |
| **Largest Service** | Organization (14 events, 31K) |
| **Smallest Service** | Audit (4 events, 5.8K) |
| **Average Events per Service** | 8.3 |

---

## ✅ Validation

All events are validated using:
- **TypeScript**: Compile-time type checking
- **Zod**: Runtime schema validation
- **Jest**: Unit tests for each event type

Example validation:

```typescript
import { UserCreatedEventSchema } from '@clenergize/contracts/events/identity';

// Validate event before publishing
const validationResult = UserCreatedEventSchema.safeParse(event);

if (!validationResult.success) {
  throw new Error(`Invalid event: ${validationResult.error.message}`);
}
```

---

## 🔄 Migration from OLD System

The OLD system had several event-related issues:

| Issue | OLD Approach | NEW Approach |
|-------|--------------|--------------|
| Event typos | String literals ("permission-granded") | TypeScript discriminated unions |
| No validation | None | Zod schema validation |
| No versioning | N/A | Built-in `.vN` suffix |
| No tracing | Manual correlation IDs | Automatic propagation |

See [99-IMPLEMENTATION-GUIDE.md](99-IMPLEMENTATION-GUIDE.md#migration-from-old) for detailed migration steps.

---

## 📝 Contributing

When adding new events:

1. Choose the appropriate service file (01-07)
2. Follow the naming convention
3. Extend `DomainEvent` interface
4. Create Zod validation schema
5. Add to service's TypeScript union type
6. Update this README with event count
7. Write unit tests

---

## 📞 Questions?

- **Architecture**: See [02-ORGANIZATION.md](02-ORGANIZATION.md) for complex hierarchy events
- **Security**: See [01-IDENTITY.md](01-IDENTITY.md) for authentication events
- **Calculations**: See [05-CALCULATION.md](05-CALCULATION.md) for emission algorithms
- **Best Practices**: See [99-IMPLEMENTATION-GUIDE.md](99-IMPLEMENTATION-GUIDE.md)

---

**Last Updated**: November 18, 2025
**Maintained By**: Architecture Team
**Status**: ACTIVE
