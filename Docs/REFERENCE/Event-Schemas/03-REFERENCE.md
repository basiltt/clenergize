# Reference Service Event Schemas

**Service**: Reference Service
**Port**: 3003
**Event Count**: 8 types

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
  | ReferenceDataVersionedEvent
  | ParameterCreatedEvent
  | ParameterUpdatedEvent
  | CategoryCreatedEvent
  | ReferenceDataSyncedEvent
  | ReferenceDataValidatedEvent
  | EmissionFactorRegionMappedEvent
  | CustomEmissionFactorCreatedEvent;
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

export const EmissionFactorCreatedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('reference.emission-factor.created.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('EmissionFactor'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    emissionFactorId: z.string().uuid(),
    name: z.string(),
    category: z.string(),
    subcategory: z.string().optional(),
    scope: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    unit: z.string(),
    value: z.number(),
    source: z.string(),
    sourceReference: z.string().optional(),
    geography: z.string().optional(),
    validFrom: z.string().datetime(),
    validTo: z.string().datetime().optional(),
    version: z.string(),
    createdBy: z.string().uuid(),
    metadata: z.record(z.any()).optional()
  })
});
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

export const ReferenceDataVersionedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('reference.data.versioned.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('ReferenceDataSet'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    dataSetId: z.string().uuid(),
    dataType: z.enum(['EMISSION_FACTOR', 'UNIT', 'CONVERSION_RULE']),
    version: z.string(),
    previousVersion: z.string().optional(),
    changesSummary: z.object({
      added: z.number().int().nonnegative(),
      updated: z.number().int().nonnegative(),
      deprecated: z.number().int().nonnegative()
    }),
    snapshotId: z.string().uuid(),
    effectiveDate: z.string().datetime(),
    createdBy: z.string().uuid()
  })
});
```

### Emission Factor Updated Event

```typescript
export interface EmissionFactorUpdatedEvent extends DomainEvent {
  type: 'reference.emission-factor.updated.v1';
  aggregateType: 'EmissionFactor';
  data: {
    emissionFactorId: string;
    changes: {
      field: string;
      oldValue: any;
      newValue: any;
    }[];
    newVersion: string;
    updatedBy: string;
    recalculationRequired: boolean;
    affectedProjects?: string[];
    timestamp: string;
  };
}

export const EmissionFactorUpdatedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('reference.emission-factor.updated.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('EmissionFactor'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    emissionFactorId: z.string().uuid(),
    changes: z.array(z.object({
      field: z.string(),
      oldValue: z.any(),
      newValue: z.any()
    })),
    newVersion: z.string(),
    updatedBy: z.string().uuid(),
    recalculationRequired: z.boolean(),
    affectedProjects: z.array(z.string().uuid()).optional(),
    timestamp: z.string().datetime()
  })
});
```

### Emission Factor Deprecated Event

```typescript
export interface EmissionFactorDeprecatedEvent extends DomainEvent {
  type: 'reference.emission-factor.deprecated.v1';
  aggregateType: 'EmissionFactor';
  data: {
    emissionFactorId: string;
    deprecationReason: string;
    replacementFactorId?: string;
    effectiveDate: string;
    deprecatedBy: string;
    notifyProjects: string[];
    timestamp: string;
  };
}

export const EmissionFactorDeprecatedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('reference.emission-factor.deprecated.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('EmissionFactor'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    emissionFactorId: z.string().uuid(),
    deprecationReason: z.string(),
    replacementFactorId: z.string().uuid().optional(),
    effectiveDate: z.string().datetime(),
    deprecatedBy: z.string().uuid(),
    notifyProjects: z.array(z.string().uuid()),
    timestamp: z.string().datetime()
  })
});
```

### Unit Created Event

```typescript
export interface UnitCreatedEvent extends DomainEvent {
  type: 'reference.unit.created.v1';
  aggregateType: 'Unit';
  data: {
    unitId: string;
    name: string;
    symbol: string;
    type: 'MASS' | 'VOLUME' | 'ENERGY' | 'DISTANCE' | 'AREA' | 'COUNT';
    baseUnit?: string;
    conversionFactor?: number;
    createdBy: string;
    timestamp: string;
  };
}

export const UnitCreatedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('reference.unit.created.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Unit'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    unitId: z.string().uuid(),
    name: z.string(),
    symbol: z.string(),
    type: z.enum(['MASS', 'VOLUME', 'ENERGY', 'DISTANCE', 'AREA', 'COUNT']),
    baseUnit: z.string().optional(),
    conversionFactor: z.number().optional(),
    createdBy: z.string().uuid(),
    timestamp: z.string().datetime()
  })
});
```

### Unit Updated Event

```typescript
export interface UnitUpdatedEvent extends DomainEvent {
  type: 'reference.unit.updated.v1';
  aggregateType: 'Unit';
  data: {
    unitId: string;
    changes: {
      field: string;
      oldValue: any;
      newValue: any;
    }[];
    updatedBy: string;
    timestamp: string;
  };
}

export const UnitUpdatedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('reference.unit.updated.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Unit'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    unitId: z.string().uuid(),
    changes: z.array(z.object({
      field: z.string(),
      oldValue: z.any(),
      newValue: z.any()
    })),
    updatedBy: z.string().uuid(),
    timestamp: z.string().datetime()
  })
});
```

### Conversion Rule Created Event

```typescript
export interface ConversionRuleCreatedEvent extends DomainEvent {
  type: 'reference.conversion.created.v1';
  aggregateType: 'ConversionRule';
  data: {
    ruleId: string;
    fromUnit: string;
    toUnit: string;
    factor: number;
    formula?: string;
    source: string;
    createdBy: string;
    timestamp: string;
  };
}

export const ConversionRuleCreatedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('reference.conversion.created.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('ConversionRule'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    ruleId: z.string().uuid(),
    fromUnit: z.string(),
    toUnit: z.string(),
    factor: z.number(),
    formula: z.string().optional(),
    source: z.string(),
    createdBy: z.string().uuid(),
    timestamp: z.string().datetime()
  })
});
```

### Reference Data Imported Event

```typescript
export interface ReferenceDataImportedEvent extends DomainEvent {
  type: 'reference.data.imported.v1';
  aggregateType: 'ReferenceDataSet';
  data: {
    importId: string;
    dataType: 'EMISSION_FACTOR' | 'UNIT' | 'CONVERSION_RULE' | 'PARAMETER';
    source: string;
    fileName?: string;
    totalRecords: number;
    successfulRecords: number;
    failedRecords: number;
    version: string;
    importedBy: string;
    timestamp: string;
  };
}

export const ReferenceDataImportedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('reference.data.imported.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('ReferenceDataSet'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    importId: z.string().uuid(),
    dataType: z.enum(['EMISSION_FACTOR', 'UNIT', 'CONVERSION_RULE', 'PARAMETER']),
    source: z.string(),
    fileName: z.string().optional(),
    totalRecords: z.number().int().nonnegative(),
    successfulRecords: z.number().int().nonnegative(),
    failedRecords: z.number().int().nonnegative(),
    version: z.string(),
    importedBy: z.string().uuid(),
    timestamp: z.string().datetime()
  })
});
```

### Parameter Created Event

```typescript
export interface ParameterCreatedEvent extends DomainEvent {
  type: 'reference.parameter.created.v1';
  aggregateType: 'Parameter';
  data: {
    parameterId: string;
    name: string;
    category: string;
    subcategory?: string;
    scope: 1 | 2 | 3;
    allowedUnits: string[];
    description?: string;
    createdBy: string;
    timestamp: string;
  };
}

export const ParameterCreatedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('reference.parameter.created.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Parameter'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    parameterId: z.string().uuid(),
    name: z.string(),
    category: z.string(),
    subcategory: z.string().optional(),
    scope: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    allowedUnits: z.array(z.string()),
    description: z.string().optional(),
    createdBy: z.string().uuid(),
    timestamp: z.string().datetime()
  })
});
```

### Parameter Updated Event

```typescript
export interface ParameterUpdatedEvent extends DomainEvent {
  type: 'reference.parameter.updated.v1';
  aggregateType: 'Parameter';
  data: {
    parameterId: string;
    changes: {
      field: string;
      oldValue: any;
      newValue: any;
    }[];
    updatedBy: string;
    timestamp: string;
  };
}

export const ParameterUpdatedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('reference.parameter.updated.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Parameter'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    parameterId: z.string().uuid(),
    changes: z.array(z.object({
      field: z.string(),
      oldValue: z.any(),
      newValue: z.any()
    })),
    updatedBy: z.string().uuid(),
    timestamp: z.string().datetime()
  })
});
```

### Category Created Event

```typescript
export interface CategoryCreatedEvent extends DomainEvent {
  type: 'reference.category.created.v1';
  aggregateType: 'Category';
  data: {
    categoryId: string;
    name: string;
    scope: 1 | 2 | 3;
    description?: string;
    parentCategoryId?: string;
    icon?: string;
    color?: string;
    createdBy: string;
    timestamp: string;
  };
}

export const CategoryCreatedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('reference.category.created.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Category'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    categoryId: z.string().uuid(),
    name: z.string(),
    scope: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    description: z.string().optional(),
    parentCategoryId: z.string().uuid().optional(),
    icon: z.string().optional(),
    color: z.string().optional(),
    createdBy: z.string().uuid(),
    timestamp: z.string().datetime()
  })
});
```

### Reference Data Synced Event

```typescript
export interface ReferenceDataSyncedEvent extends DomainEvent {
  type: 'reference.data.synced.v1';
  aggregateType: 'ReferenceDataSet';
  data: {
    syncId: string;
    dataSource: 'DEFRA' | 'EPA' | 'IPCC' | 'CUSTOM';
    syncType: 'FULL' | 'INCREMENTAL';
    recordsAdded: number;
    recordsUpdated: number;
    recordsDeprecated: number;
    syncedAt: string;
    nextSyncScheduled?: string;
  };
}

export const ReferenceDataSyncedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('reference.data.synced.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('ReferenceDataSet'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    syncId: z.string().uuid(),
    dataSource: z.enum(['DEFRA', 'EPA', 'IPCC', 'CUSTOM']),
    syncType: z.enum(['FULL', 'INCREMENTAL']),
    recordsAdded: z.number().int().nonnegative(),
    recordsUpdated: z.number().int().nonnegative(),
    recordsDeprecated: z.number().int().nonnegative(),
    syncedAt: z.string().datetime(),
    nextSyncScheduled: z.string().datetime().optional()
  })
});
```

### Reference Data Validated Event

```typescript
export interface ReferenceDataValidatedEvent extends DomainEvent {
  type: 'reference.data.validated.v1';
  aggregateType: 'ReferenceDataSet';
  data: {
    validationId: string;
    dataType: string;
    totalRecords: number;
    validRecords: number;
    invalidRecords: number;
    warnings: number;
    errors: {
      recordId: string;
      field: string;
      message: string;
      severity: 'ERROR' | 'WARNING';
    }[];
    validatedBy: string;
    timestamp: string;
  };
}

export const ReferenceDataValidatedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('reference.data.validated.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('ReferenceDataSet'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    validationId: z.string().uuid(),
    dataType: z.string(),
    totalRecords: z.number().int().nonnegative(),
    validRecords: z.number().int().nonnegative(),
    invalidRecords: z.number().int().nonnegative(),
    warnings: z.number().int().nonnegative(),
    errors: z.array(z.object({
      recordId: z.string(),
      field: z.string(),
      message: z.string(),
      severity: z.enum(['ERROR', 'WARNING'])
    })),
    validatedBy: z.string().uuid(),
    timestamp: z.string().datetime()
  })
});
```

### Emission Factor Region Mapping Created Event

```typescript
export interface EmissionFactorRegionMappedEvent extends DomainEvent {
  type: 'reference.emission-factor.region-mapped.v1';
  aggregateType: 'EmissionFactor';
  data: {
    mappingId: string;
    emissionFactorId: string;
    region: string;
    country: string;
    gridIntensity?: number;
    validFrom: string;
    validTo?: string;
    createdBy: string;
    timestamp: string;
  };
}

export const EmissionFactorRegionMappedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('reference.emission-factor.region-mapped.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('EmissionFactor'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    mappingId: z.string().uuid(),
    emissionFactorId: z.string().uuid(),
    region: z.string(),
    country: z.string(),
    gridIntensity: z.number().optional(),
    validFrom: z.string().datetime(),
    validTo: z.string().datetime().optional(),
    createdBy: z.string().uuid(),
    timestamp: z.string().datetime()
  })
});
```

### Custom Emission Factor Created Event

```typescript
export interface CustomEmissionFactorCreatedEvent extends DomainEvent {
  type: 'reference.custom-emission-factor.created.v1';
  aggregateType: 'EmissionFactor';
  data: {
    factorId: string;
    organizationId: string;
    name: string;
    value: number;
    unit: string;
    scope: 1 | 2 | 3;
    justification: string;
    approvedBy?: string;
    validityPeriod: {
      from: string;
      to: string;
    };
    createdBy: string;
    timestamp: string;
  };
}

export const CustomEmissionFactorCreatedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('reference.custom-emission-factor.created.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('EmissionFactor'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    factorId: z.string().uuid(),
    organizationId: z.string().uuid(),
    name: z.string(),
    value: z.number(),
    unit: z.string(),
    scope: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    justification: z.string(),
    approvedBy: z.string().uuid().optional(),
    validityPeriod: z.object({
      from: z.string().datetime(),
      to: z.string().datetime()
    }),
    createdBy: z.string().uuid(),
    timestamp: z.string().datetime()
  })
});
```

---

