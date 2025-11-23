# Calculation Service Event Schemas

**Service**: Calculation Service
**Port**: 3005
**Event Count**: 7 types

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
  | RecalculationTriggeredEvent
  | AllocationCreatedEvent;
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

export const RollupCompletedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('calculation.rollup.completed.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Rollup'),
  correlationId: z.string().uuid(),
  data: z.object({
    rollupId: z.string().uuid(),
    projectId: z.string().uuid(),
    hierarchyNodeId: z.string().uuid(),
    level: z.number().int().nonnegative(),
    period: z.object({
      startDate: z.string().datetime(),
      endDate: z.string().datetime()
    }),
    totals: z.object({
      scope1: z.number(),
      scope2: z.number(),
      scope3: z.number(),
      total: z.number()
    }),
    childNodes: z.number().int().nonnegative(),
    leafActivities: z.number().int().nonnegative(),
    calculatedAt: z.string().datetime()
  })
});
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

export const RecalculationTriggeredEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('calculation.recalculation.triggered.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Recalculation'),
  correlationId: z.string().uuid(),
  data: z.object({
    recalculationId: z.string().uuid(),
    trigger: z.enum(['EMISSION_FACTOR_UPDATED', 'ACTIVITY_DATA_CHANGED', 'MANUAL', 'SCHEDULED']),
    scope: z.object({
      projectId: z.string().uuid().optional(),
      hierarchyNodeId: z.string().uuid().optional(),
      activityDataIds: z.array(z.string().uuid()).optional()
    }),
    estimatedRecords: z.number().int().nonnegative(),
    triggeredBy: z.string().uuid(),
    scheduledFor: z.string().datetime().optional()
  })
});
```

### Calculation Started Event

```typescript
export interface CalculationStartedEvent extends DomainEvent {
  type: 'calculation.calculation.started.v1';
  aggregateType: 'Calculation';
  data: {
    calculationId: string;
    activityDataId: string;
    projectId: string;
    startedBy: string;
    timestamp: string;
  };
}

export const CalculationStartedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('calculation.calculation.started.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Calculation'),
  correlationId: z.string().uuid(),
  data: z.object({
    calculationId: z.string().uuid(),
    activityDataId: z.string().uuid(),
    projectId: z.string().uuid(),
    startedBy: z.string().uuid(),
    timestamp: z.string().datetime()
  })
});
```

### Calculation Completed Event

```typescript
export interface CalculationCompletedEvent extends DomainEvent {
  type: 'calculation.calculation.completed.v1';
  aggregateType: 'Calculation';
  data: {
    calculationId: string;
    activityDataId: string;
    emission: number;
    duration: number; // ms
    timestamp: string;
  };
}

export const CalculationCompletedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('calculation.calculation.completed.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Calculation'),
  correlationId: z.string().uuid(),
  data: z.object({
    calculationId: z.string().uuid(),
    activityDataId: z.string().uuid(),
    emission: z.number(),
    duration: z.number().positive(),
    timestamp: z.string().datetime()
  })
});
```

### Calculation Failed Event

```typescript
export interface CalculationFailedEvent extends DomainEvent {
  type: 'calculation.calculation.failed.v1';
  aggregateType: 'Calculation';
  data: {
    calculationId: string;
    activityDataId: string;
    errorMessage: string;
    errorCode: string;
    retry: boolean;
    timestamp: string;
  };
}

export const CalculationFailedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('calculation.calculation.failed.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Calculation'),
  correlationId: z.string().uuid(),
  data: z.object({
    calculationId: z.string().uuid(),
    activityDataId: z.string().uuid(),
    errorMessage: z.string(),
    errorCode: z.string(),
    retry: z.boolean(),
    timestamp: z.string().datetime()
  })
});
```

### Rollup Started Event

```typescript
export interface RollupStartedEvent extends DomainEvent {
  type: 'calculation.rollup.started.v1';
  aggregateType: 'Rollup';
  data: {
    rollupId: string;
    hierarchyNodeId: string;
    year: number;
    startedBy: string;
    timestamp: string;
  };
}

export const RollupStartedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('calculation.rollup.started.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Rollup'),
  correlationId: z.string().uuid(),
  data: z.object({
    rollupId: z.string().uuid(),
    hierarchyNodeId: z.string().uuid(),
    year: z.number().int().positive(),
    startedBy: z.string().uuid(),
    timestamp: z.string().datetime()
  })
});
```

### Allocation Created Event

```typescript
export interface AllocationCreatedEvent extends DomainEvent {
  type: 'calculation.allocation.created.v1';
  aggregateType: 'Allocation';
  data: {
    allocationId: string;
    emissionSourceId: string;
    allocationType: 'HEADCOUNT' | 'REVENUE' | 'FLOOR_AREA' | 'CUSTOM';
    totalEmission: number;
    targets: {
      entityId: string;
      allocationValue: number;
      allocatedEmission: number;
    }[];
    createdBy: string;
    timestamp: string;
  };
}

export const AllocationCreatedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('calculation.allocation.created.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Allocation'),
  correlationId: z.string().uuid(),
  data: z.object({
    allocationId: z.string().uuid(),
    emissionSourceId: z.string().uuid(),
    allocationType: z.enum(['HEADCOUNT', 'REVENUE', 'FLOOR_AREA', 'CUSTOM']),
    totalEmission: z.number(),
    targets: z.array(z.object({
      entityId: z.string().uuid(),
      allocationValue: z.number(),
      allocatedEmission: z.number()
    })),
    createdBy: z.string().uuid(),
    timestamp: z.string().datetime()
  })
});
```

---

