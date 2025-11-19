import { z } from 'zod';
import { createEventSchema } from './base-event.schema';

// ==================== DATA INGESTION EVENTS ====================

export const DataIngestedEventSchema = createEventSchema(
  'activity.data.ingested.v1',
  'ActivityData',
  z.object({
    ingestionId: z.string().uuid(),
    projectId: z.string().uuid(),
    dataSource: z.string(),
    fileName: z.string(),
    fileSize: z.number().int().positive(),
    recordCount: z.number().int().nonnegative(),
    format: z.enum(['CSV', 'XLSX', 'JSON', 'API']),
    ingestedBy: z.string().uuid(),
    s3Key: z.string().optional(),
    timestamp: z.string().datetime(),
  })
);

export const DataValidationCompletedEventSchema = createEventSchema(
  'activity.data.validation-completed.v1',
  'ActivityData',
  z.object({
    ingestionId: z.string().uuid(),
    validRecords: z.number().int().nonnegative(),
    invalidRecords: z.number().int().nonnegative(),
    validationErrors: z.array(
      z.object({
        row: z.number().int(),
        field: z.string(),
        error: z.string(),
      })
    ),
    timestamp: z.string().datetime(),
  })
);

export const DataValidationFailedEventSchema = createEventSchema(
  'activity.data.validation-failed.v1',
  'ActivityData',
  z.object({
    ingestionId: z.string().uuid(),
    errorCount: z.number().int().positive(),
    errors: z.array(
      z.object({
        row: z.number().int(),
        field: z.string(),
        error: z.string(),
      })
    ),
    timestamp: z.string().datetime(),
  })
);

// ==================== ACTIVITY RECORD EVENTS ====================

export const ActivityCreatedEventSchema = createEventSchema(
  'activity.activity.created.v1',
  'Activity',
  z.object({
    activityId: z.string().uuid(),
    projectId: z.string().uuid(),
    hierarchyNodeId: z.string().uuid(),
    activityType: z.string(),
    scope: z.enum(['SCOPE_1', 'SCOPE_2', 'SCOPE_3']),
    category: z.string(),
    quantity: z.number(),
    unit: z.string(),
    activityDate: z.string().datetime(),
    metadata: z.record(z.any()).optional(),
    createdBy: z.string().uuid(),
    timestamp: z.string().datetime(),
  })
);

export const ActivityUpdatedEventSchema = createEventSchema(
  'activity.activity.updated.v1',
  'Activity',
  z.object({
    activityId: z.string().uuid(),
    changes: z.array(
      z.object({
        field: z.string(),
        oldValue: z.any(),
        newValue: z.any(),
      })
    ),
    updatedBy: z.string().uuid(),
    timestamp: z.string().datetime(),
  })
);

export const ActivityDeletedEventSchema = createEventSchema(
  'activity.activity.deleted.v1',
  'Activity',
  z.object({
    activityId: z.string().uuid(),
    deletedBy: z.string().uuid(),
    reason: z.string(),
    timestamp: z.string().datetime(),
  })
);

// ==================== BULK OPERATIONS ====================

export const BulkImportStartedEventSchema = createEventSchema(
  'activity.bulk-import.started.v1',
  'BulkImport',
  z.object({
    importId: z.string().uuid(),
    projectId: z.string().uuid(),
    fileName: z.string(),
    totalRecords: z.number().int().positive(),
    startedBy: z.string().uuid(),
    timestamp: z.string().datetime(),
  })
);

export const BulkImportCompletedEventSchema = createEventSchema(
  'activity.bulk-import.completed.v1',
  'BulkImport',
  z.object({
    importId: z.string().uuid(),
    successCount: z.number().int().nonnegative(),
    failureCount: z.number().int().nonnegative(),
    duration: z.number().int().positive(),
    timestamp: z.string().datetime(),
  })
);

// ==================== TYPE EXPORTS ====================

export type DataIngestedEvent = z.infer<typeof DataIngestedEventSchema>;
export type DataValidationCompletedEvent = z.infer<typeof DataValidationCompletedEventSchema>;
export type DataValidationFailedEvent = z.infer<typeof DataValidationFailedEventSchema>;
export type ActivityCreatedEvent = z.infer<typeof ActivityCreatedEventSchema>;
export type ActivityUpdatedEvent = z.infer<typeof ActivityUpdatedEventSchema>;
export type ActivityDeletedEvent = z.infer<typeof ActivityDeletedEventSchema>;
export type BulkImportStartedEvent = z.infer<typeof BulkImportStartedEventSchema>;
export type BulkImportCompletedEvent = z.infer<typeof BulkImportCompletedEventSchema>;

export type ActivityEvent =
  | DataIngestedEvent
  | DataValidationCompletedEvent
  | DataValidationFailedEvent
  | ActivityCreatedEvent
  | ActivityUpdatedEvent
  | ActivityDeletedEvent
  | BulkImportStartedEvent
  | BulkImportCompletedEvent;
