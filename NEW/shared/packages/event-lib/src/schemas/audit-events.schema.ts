import { z } from 'zod';
import { createEventSchema } from './base-event.schema';

// ==================== AUDIT LOG EVENTS ====================

export const AuditLogCreatedEventSchema = createEventSchema(
  'audit.log.created.v1',
  'AuditLog',
  z.object({
    auditId: z.string().uuid(),
    userId: z.string().uuid(),
    action: z.string(),
    resource: z.string(),
    resourceId: z.string().uuid(),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    status: z.enum(['SUCCESS', 'FAILURE', 'PARTIAL']),
    ipAddress: z.string().ip(),
    userAgent: z.string(),
    metadata: z.record(z.any()).optional(),
    timestamp: z.string().datetime(),
  })
);

// ==================== COMPLIANCE EVENTS ====================

export const ComplianceCheckStartedEventSchema = createEventSchema(
  'audit.compliance.check-started.v1',
  'ComplianceCheck',
  z.object({
    checkId: z.string().uuid(),
    projectId: z.string().uuid(),
    standard: z.string(),
    scope: z.string(),
    startedBy: z.string().uuid(),
    timestamp: z.string().datetime(),
  })
);

export const ComplianceCheckCompletedEventSchema = createEventSchema(
  'audit.compliance.check-completed.v1',
  'ComplianceCheck',
  z.object({
    checkId: z.string().uuid(),
    passed: z.boolean(),
    findings: z.array(
      z.object({
        category: z.string(),
        severity: z.enum(['INFO', 'WARNING', 'ERROR', 'CRITICAL']),
        message: z.string(),
        recommendation: z.string().optional(),
      })
    ),
    duration: z.number().int().positive(),
    timestamp: z.string().datetime(),
  })
);

// ==================== SECURITY EVENTS ====================

export const SecurityEventDetectedEventSchema = createEventSchema(
  'audit.security.event-detected.v1',
  'SecurityEvent',
  z.object({
    eventId: z.string().uuid(),
    eventType: z.string(),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    userId: z.string().uuid().optional(),
    ipAddress: z.string().ip(),
    description: z.string(),
    affectedResources: z.array(z.string()),
    automaticResponse: z.string().optional(),
    timestamp: z.string().datetime(),
  })
);

// ==================== DATA RETENTION EVENTS ====================

export const DataRetentionPolicyAppliedEventSchema = createEventSchema(
  'audit.retention.policy-applied.v1',
  'DataRetention',
  z.object({
    policyId: z.string().uuid(),
    resourceType: z.string(),
    recordsProcessed: z.number().int().nonnegative(),
    recordsDeleted: z.number().int().nonnegative(),
    retentionPeriodDays: z.number().int().positive(),
    timestamp: z.string().datetime(),
  })
);

// ==================== GDPR/PRIVACY EVENTS ====================

export const DataExportRequestedEventSchema = createEventSchema(
  'audit.privacy.data-export-requested.v1',
  'PrivacyRequest',
  z.object({
    requestId: z.string().uuid(),
    userId: z.string().uuid(),
    requestType: z.enum(['DATA_EXPORT', 'DATA_DELETION', 'DATA_PORTABILITY']),
    requestedBy: z.string().uuid(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED']),
    timestamp: z.string().datetime(),
  })
);

export const DataExportCompletedEventSchema = createEventSchema(
  'audit.privacy.data-export-completed.v1',
  'PrivacyRequest',
  z.object({
    requestId: z.string().uuid(),
    userId: z.string().uuid(),
    exportFileS3Key: z.string(),
    fileSize: z.number().int().positive(),
    recordCount: z.number().int().positive(),
    expiresAt: z.string().datetime(),
    timestamp: z.string().datetime(),
  })
);

// ==================== TYPE EXPORTS ====================

export type AuditLogCreatedEvent = z.infer<typeof AuditLogCreatedEventSchema>;
export type ComplianceCheckStartedEvent = z.infer<typeof ComplianceCheckStartedEventSchema>;
export type ComplianceCheckCompletedEvent = z.infer<typeof ComplianceCheckCompletedEventSchema>;
export type SecurityEventDetectedEvent = z.infer<typeof SecurityEventDetectedEventSchema>;
export type DataRetentionPolicyAppliedEvent = z.infer<
  typeof DataRetentionPolicyAppliedEventSchema
>;
export type DataExportRequestedEvent = z.infer<typeof DataExportRequestedEventSchema>;
export type DataExportCompletedEvent = z.infer<typeof DataExportCompletedEventSchema>;

export type AuditEvent =
  | AuditLogCreatedEvent
  | ComplianceCheckStartedEvent
  | ComplianceCheckCompletedEvent
  | SecurityEventDetectedEvent
  | DataRetentionPolicyAppliedEvent
  | DataExportRequestedEvent
  | DataExportCompletedEvent;
