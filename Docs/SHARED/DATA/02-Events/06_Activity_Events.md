# Activity Service Event Schemas

**Service**: Activity Service
**Port**: 3004
**Event Count**: 8 types

---

## Activity Service Events

### Event Types

```typescript
export type ActivityEvent =
  | ActivityDataIngestedEvent
  | ActivityDataValidatedEvent
  | ActivityDataValidationFailedEvent
  | ActivityDataVerifiedEvent
  | ActivityDataUpdatedEvent
  | ActivityDataDeletedEvent
  | BulkImportStartedEvent
  | BulkImportCompletedEvent
  | BulkImportFailedEvent
  | CarbonScopeCreatedEvent
  | CarbonScopeUpdatedEvent
  | ActivityCommentAddedEvent
  | FileAttachedEvent
  | DataQualityFlaggedEvent
  | DataQualityResolvedEvent;
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

export const ActivityDataIngestedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('activity.data.ingested.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('ActivityData'),
  correlationId: z.string().uuid(),
  data: z.object({
    activityDataId: z.string().uuid(),
    projectId: z.string().uuid(),
    hierarchyNodeId: z.string().uuid(),
    activityType: z.string(),
    quantity: z.number(),
    unit: z.string(),
    period: z.object({
      startDate: z.string().datetime(),
      endDate: z.string().datetime()
    }),
    source: z.enum(['MANUAL', 'IMPORT', 'API', 'INTEGRATION']),
    sourceReference: z.string().optional(),
    uploadedBy: z.string().uuid(),
    metadata: z.record(z.any()).optional()
  })
});
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

export const ActivityDataValidationFailedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('activity.data.validation-failed.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('ActivityData'),
  correlationId: z.string().uuid(),
  data: z.object({
    activityDataId: z.string().uuid(),
    projectId: z.string().uuid(),
    validationErrors: z.array(z.object({
      field: z.string(),
      message: z.string(),
      code: z.string(),
      severity: z.enum(['ERROR', 'WARNING'])
    })),
    rawData: z.record(z.any()),
    timestamp: z.string().datetime()
  })
});
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

export const BulkImportCompletedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('activity.bulk-import.completed.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('BulkImport'),
  correlationId: z.string().uuid(),
  data: z.object({
    importId: z.string().uuid(),
    projectId: z.string().uuid(),
    fileName: z.string(),
    totalRecords: z.number().int().nonnegative(),
    successfulRecords: z.number().int().nonnegative(),
    failedRecords: z.number().int().nonnegative(),
    warnings: z.number().int().nonnegative(),
    duration: z.number().positive(),
    importedBy: z.string().uuid(),
    completedAt: z.string().datetime()
  })
});
```

### Activity Data Validated Event

```typescript
export interface ActivityDataValidatedEvent extends DomainEvent {
  type: 'activity.data.validated.v1';
  aggregateType: 'ActivityData';
  data: {
    activityDataId: string;
    validatedBy: string;
    validationResult: 'PASS' | 'PASS_WITH_WARNINGS' | 'FAIL';
    dataQualityScore: number; // 1-4 (GHG Protocol)
    validatedAt: string;
  };
}

export const ActivityDataValidatedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('activity.data.validated.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('ActivityData'),
  correlationId: z.string().uuid(),
  data: z.object({
    activityDataId: z.string().uuid(),
    validatedBy: z.string().uuid(),
    validationResult: z.enum(['PASS', 'PASS_WITH_WARNINGS', 'FAIL']),
    dataQualityScore: z.number().min(1).max(4),
    validatedAt: z.string().datetime()
  })
});
```

### Activity Data Verified Event

```typescript
export interface ActivityDataVerifiedEvent extends DomainEvent {
  type: 'activity.data.verified.v1';
  aggregateType: 'ActivityData';
  data: {
    activityDataId: string;
    verifiedBy: string;
    verificationMethod: 'MANUAL' | 'AUTOMATED';
    confidence: number; // 0-100
    timestamp: string;
  };
}

export const ActivityDataVerifiedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('activity.data.verified.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('ActivityData'),
  correlationId: z.string().uuid(),
  data: z.object({
    activityDataId: z.string().uuid(),
    verifiedBy: z.string().uuid(),
    verificationMethod: z.enum(['MANUAL', 'AUTOMATED']),
    confidence: z.number().min(0).max(100),
    timestamp: z.string().datetime()
  })
});
```

### Activity Data Updated Event

```typescript
export interface ActivityDataUpdatedEvent extends DomainEvent {
  type: 'activity.data.updated.v1';
  aggregateType: 'ActivityData';
  data: {
    activityDataId: string;
    changes: { field: string; oldValue: any; newValue: any }[];
    updatedBy: string;
    reason?: string;
    requiresRecalculation: boolean;
    timestamp: string;
  };
}

export const ActivityDataUpdatedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('activity.data.updated.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('ActivityData'),
  correlationId: z.string().uuid(),
  data: z.object({
    activityDataId: z.string().uuid(),
    changes: z.array(z.object({
      field: z.string(),
      oldValue: z.any(),
      newValue: z.any()
    })),
    updatedBy: z.string().uuid(),
    reason: z.string().optional(),
    requiresRecalculation: z.boolean(),
    timestamp: z.string().datetime()
  })
});
```

### Activity Data Deleted Event

```typescript
export interface ActivityDataDeletedEvent extends DomainEvent {
  type: 'activity.data.deleted.v1';
  aggregateType: 'ActivityData';
  data: {
    activityDataId: string;
    deletedBy: string;
    reason: string;
    cascadeDeleteCalculations: boolean;
    timestamp: string;
  };
}

export const ActivityDataDeletedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('activity.data.deleted.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('ActivityData'),
  correlationId: z.string().uuid(),
  data: z.object({
    activityDataId: z.string().uuid(),
    deletedBy: z.string().uuid(),
    reason: z.string(),
    cascadeDeleteCalculations: z.boolean(),
    timestamp: z.string().datetime()
  })
});
```

### Bulk Import Started Event

```typescript
export interface BulkImportStartedEvent extends DomainEvent {
  type: 'activity.bulk-import.started.v1';
  aggregateType: 'BulkImport';
  data: {
    importId: string;
    projectId: string;
    fileName: string;
    fileSize: number;
    estimatedRecords: number;
    importedBy: string;
    timestamp: string;
  };
}

export const BulkImportStartedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('activity.bulk-import.started.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('BulkImport'),
  correlationId: z.string().uuid(),
  data: z.object({
    importId: z.string().uuid(),
    projectId: z.string().uuid(),
    fileName: z.string(),
    fileSize: z.number().positive(),
    estimatedRecords: z.number().int().nonnegative(),
    importedBy: z.string().uuid(),
    timestamp: z.string().datetime()
  })
});
```

### Bulk Import Failed Event

```typescript
export interface BulkImportFailedEvent extends DomainEvent {
  type: 'activity.bulk-import.failed.v1';
  aggregateType: 'BulkImport';
  data: {
    importId: string;
    errorMessage: string;
    failureReason: 'VALIDATION_ERROR' | 'FILE_FORMAT_ERROR' | 'SYSTEM_ERROR';
    timestamp: string;
  };
}

export const BulkImportFailedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('activity.bulk-import.failed.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('BulkImport'),
  correlationId: z.string().uuid(),
  data: z.object({
    importId: z.string().uuid(),
    errorMessage: z.string(),
    failureReason: z.enum(['VALIDATION_ERROR', 'FILE_FORMAT_ERROR', 'SYSTEM_ERROR']),
    timestamp: z.string().datetime()
  })
});
```

### Carbon Scope Created Event

```typescript
export interface CarbonScopeCreatedEvent extends DomainEvent {
  type: 'activity.carbon-scope.created.v1';
  aggregateType: 'CarbonScope';
  data: {
    carbonScopeId: string;
    projectId: string;
    entityId: string;
    year: number;
    modules: string[];
    status: 'ACTIVE' | 'INACTIVE';
    createdBy: string;
    timestamp: string;
  };
}

export const CarbonScopeCreatedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('activity.carbon-scope.created.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('CarbonScope'),
  correlationId: z.string().uuid(),
  data: z.object({
    carbonScopeId: z.string().uuid(),
    projectId: z.string().uuid(),
    entityId: z.string().uuid(),
    year: z.number().int().positive(),
    modules: z.array(z.string()),
    status: z.enum(['ACTIVE', 'INACTIVE']),
    createdBy: z.string().uuid(),
    timestamp: z.string().datetime()
  })
});
```

### Carbon Scope Updated Event

```typescript
export interface CarbonScopeUpdatedEvent extends DomainEvent {
  type: 'activity.carbon-scope.updated.v1';
  aggregateType: 'CarbonScope';
  data: {
    carbonScopeId: string;
    changes: { field: string; oldValue: any; newValue: any }[];
    updatedBy: string;
    timestamp: string;
  };
}

export const CarbonScopeUpdatedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('activity.carbon-scope.updated.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('CarbonScope'),
  correlationId: z.string().uuid(),
  data: z.object({
    carbonScopeId: z.string().uuid(),
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

### Activity Comment Added Event

```typescript
export interface ActivityCommentAddedEvent extends DomainEvent {
  type: 'activity.comment.added.v1';
  aggregateType: 'ActivityData';
  data: {
    commentId: string;
    activityDataId: string;
    comment: string;
    addedBy: string;
    timestamp: string;
  };
}

export const ActivityCommentAddedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('activity.comment.added.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('ActivityData'),
  correlationId: z.string().uuid(),
  data: z.object({
    commentId: z.string().uuid(),
    activityDataId: z.string().uuid(),
    comment: z.string(),
    addedBy: z.string().uuid(),
    timestamp: z.string().datetime()
  })
});
```

### File Attached Event

```typescript
export interface FileAttachedEvent extends DomainEvent {
  type: 'activity.file.attached.v1';
  aggregateType: 'ActivityData';
  data: {
    fileId: string;
    activityDataId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    s3Key: string;
    uploadedBy: string;
    timestamp: string;
  };
}

export const FileAttachedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('activity.file.attached.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('ActivityData'),
  correlationId: z.string().uuid(),
  data: z.object({
    fileId: z.string().uuid(),
    activityDataId: z.string().uuid(),
    fileName: z.string(),
    fileSize: z.number().positive(),
    fileType: z.string(),
    s3Key: z.string(),
    uploadedBy: z.string().uuid(),
    timestamp: z.string().datetime()
  })
});
```

### Data Quality Flagged Event

```typescript
export interface DataQualityFlaggedEvent extends DomainEvent {
  type: 'activity.data-quality.flagged.v1';
  aggregateType: 'ActivityData';
  data: {
    activityDataId: string;
    flagType: 'OUTLIER' | 'MISSING_DATA' | 'INCONSISTENT' | 'LOW_QUALITY';
    flaggedBy: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    timestamp: string;
  };
}

export const DataQualityFlaggedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('activity.data-quality.flagged.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('ActivityData'),
  correlationId: z.string().uuid(),
  data: z.object({
    activityDataId: z.string().uuid(),
    flagType: z.enum(['OUTLIER', 'MISSING_DATA', 'INCONSISTENT', 'LOW_QUALITY']),
    flaggedBy: z.string().uuid(),
    description: z.string(),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    timestamp: z.string().datetime()
  })
});
```

### Data Quality Resolved Event

```typescript
export interface DataQualityResolvedEvent extends DomainEvent {
  type: 'activity.data-quality.resolved.v1';
  aggregateType: 'ActivityData';
  data: {
    activityDataId: string;
    flagId: string;
    resolution: string;
    resolvedBy: string;
    timestamp: string;
  };
}

export const DataQualityResolvedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('activity.data-quality.resolved.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('ActivityData'),
  correlationId: z.string().uuid(),
  data: z.object({
    activityDataId: z.string().uuid(),
    flagId: z.string().uuid(),
    resolution: z.string(),
    resolvedBy: z.string().uuid(),
    timestamp: z.string().datetime()
  })
});
```

---

