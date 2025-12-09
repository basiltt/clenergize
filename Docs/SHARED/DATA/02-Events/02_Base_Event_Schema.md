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

