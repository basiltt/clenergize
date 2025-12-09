/**
 * Standard Domain Events for Clenergize Platform
 *
 * These events follow the naming convention:
 * <bounded-context>.<aggregate>.<action>.v<version>
 */

import { DomainEvent } from './interfaces';

// ============================================
// Identity Context Events
// ============================================

export interface UserCreatedEvent extends DomainEvent {
  type: 'identity.user.created.v1';
  payload: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    organizationId?: string;
  };
}

export interface UserAuthenticatedEvent extends DomainEvent {
  type: 'identity.user.authenticated.v1';
  payload: {
    userId: string;
    email: string;
    ipAddress: string;
    userAgent?: string;
    timestamp: string;
  };
}

export interface UserRoleAssignedEvent extends DomainEvent {
  type: 'identity.user.role-assigned.v1';
  payload: {
    userId: string;
    roleId: string;
    roleName: string;
    assignedBy: string;
  };
}

export interface PasswordChangedEvent extends DomainEvent {
  type: 'identity.user.password-changed.v1';
  payload: {
    userId: string;
    changedAt: string;
  };
}

// ============================================
// Organization Context Events
// ============================================

export interface OrganizationCreatedEvent extends DomainEvent {
  type: 'organization.organization.created.v1';
  payload: {
    organizationId: string;
    name: string;
    type: string;
    industry?: string;
    country: string;
  };
}

export interface ProjectCreatedEvent extends DomainEvent {
  type: 'organization.project.created.v1';
  payload: {
    projectId: string;
    organizationId: string;
    name: string;
    type: string;
    reportingYear: number;
  };
}

export interface HierarchyUpdatedEvent extends DomainEvent {
  type: 'organization.hierarchy.updated.v1';
  payload: {
    hierarchyId: string;
    projectId: string;
    changes: Record<string, any>;
    updatedBy: string;
  };
}

export interface EntityAddedEvent extends DomainEvent {
  type: 'organization.entity.added.v1';
  payload: {
    entityId: string;
    projectId: string;
    parentId?: string;
    name: string;
    type: string;
  };
}

// ============================================
// Reference Context Events
// ============================================

export interface EmissionFactorCreatedEvent extends DomainEvent {
  type: 'reference.factor.created.v1';
  payload: {
    factorId: string;
    name: string;
    category: string;
    unit: string;
    value: number;
    source: string;
  };
}

export interface ConversionFactorUpdatedEvent extends DomainEvent {
  type: 'reference.conversion.updated.v1';
  payload: {
    conversionId: string;
    fromUnit: string;
    toUnit: string;
    factor: number;
  };
}

// ============================================
// Activity Context Events
// ============================================

export interface ActivityDataIngestedEvent extends DomainEvent {
  type: 'activity.data.ingested.v1';
  payload: {
    activityId: string;
    projectId: string;
    entityId: string;
    activityType: string;
    quantity: number;
    unit: string;
    period: {
      start: string;
      end: string;
    };
  };
}

export interface DataValidationFailedEvent extends DomainEvent {
  type: 'activity.data.validation-failed.v1';
  payload: {
    activityId: string;
    errors: Array<{
      field: string;
      message: string;
      value: any;
    }>;
  };
}

export interface BulkImportCompletedEvent extends DomainEvent {
  type: 'activity.import.completed.v1';
  payload: {
    importId: string;
    projectId: string;
    recordsProcessed: number;
    recordsSuccessful: number;
    recordsFailed: number;
    duration: number;
  };
}

// ============================================
// Calculation Context Events
// ============================================

export interface EmissionCalculatedEvent extends DomainEvent {
  type: 'calculation.emission.calculated.v1';
  payload: {
    calculationId: string;
    activityId: string;
    projectId: string;
    entityId: string;
    scope: 'scope1' | 'scope2' | 'scope3';
    emission: {
      value: number;
      unit: string;
      co2e: number;
    };
    methodology: string;
  };
}

export interface RollupCompletedEvent extends DomainEvent {
  type: 'calculation.rollup.completed.v1';
  payload: {
    rollupId: string;
    projectId: string;
    entityId: string;
    level: string;
    totals: {
      scope1: number;
      scope2: number;
      scope3: number;
      total: number;
    };
    period: {
      start: string;
      end: string;
    };
  };
}

export interface RecalculationTriggeredEvent extends DomainEvent {
  type: 'calculation.recalculation.triggered.v1';
  payload: {
    projectId: string;
    entityIds: string[];
    reason: string;
    triggeredBy: string;
  };
}

// ============================================
// Reporting Context Events
// ============================================

export interface ReportGeneratedEvent extends DomainEvent {
  type: 'reporting.report.generated.v1';
  payload: {
    reportId: string;
    projectId: string;
    reportType: string;
    format: 'pdf' | 'excel' | 'csv' | 'json';
    fileUrl: string;
    generatedBy: string;
  };
}

export interface ReportScheduledEvent extends DomainEvent {
  type: 'reporting.report.scheduled.v1';
  payload: {
    scheduleId: string;
    projectId: string;
    reportType: string;
    schedule: string; // cron expression
    recipients: string[];
  };
}

// ============================================
// Audit Context Events
// ============================================

export interface AuditLogCreatedEvent extends DomainEvent {
  type: 'audit.log.created.v1';
  payload: {
    auditId: string;
    action: string;
    entityType: string;
    entityId: string;
    userId: string;
    changes?: Record<string, any>;
    ipAddress?: string;
  };
}

export interface ComplianceCheckCompletedEvent extends DomainEvent {
  type: 'audit.compliance.checked.v1';
  payload: {
    checkId: string;
    projectId: string;
    framework: string;
    passed: boolean;
    findings: Array<{
      requirement: string;
      status: 'compliant' | 'non-compliant' | 'partial';
      evidence?: string;
    }>;
  };
}

// ============================================
// System Events
// ============================================

export interface ServiceStartedEvent extends DomainEvent {
  type: 'system.service.started.v1';
  payload: {
    serviceName: string;
    version: string;
    startTime: string;
    environment: string;
  };
}

export interface ServiceStoppedEvent extends DomainEvent {
  type: 'system.service.stopped.v1';
  payload: {
    serviceName: string;
    stopTime: string;
    reason?: string;
  };
}

export interface HealthCheckFailedEvent extends DomainEvent {
  type: 'system.health.failed.v1';
  payload: {
    serviceName: string;
    checks: Record<string, boolean>;
    error?: string;
  };
}

// ============================================
// Event Type Constants
// ============================================

export const EventTypes = {
  // Identity
  USER_CREATED: 'identity.user.created.v1',
  USER_AUTHENTICATED: 'identity.user.authenticated.v1',
  USER_ROLE_ASSIGNED: 'identity.user.role-assigned.v1',
  PASSWORD_CHANGED: 'identity.user.password-changed.v1',

  // Organization
  ORGANIZATION_CREATED: 'organization.organization.created.v1',
  PROJECT_CREATED: 'organization.project.created.v1',
  HIERARCHY_UPDATED: 'organization.hierarchy.updated.v1',
  ENTITY_ADDED: 'organization.entity.added.v1',

  // Reference
  EMISSION_FACTOR_CREATED: 'reference.factor.created.v1',
  CONVERSION_FACTOR_UPDATED: 'reference.conversion.updated.v1',

  // Activity
  ACTIVITY_DATA_INGESTED: 'activity.data.ingested.v1',
  DATA_VALIDATION_FAILED: 'activity.data.validation-failed.v1',
  BULK_IMPORT_COMPLETED: 'activity.import.completed.v1',

  // Calculation
  EMISSION_CALCULATED: 'calculation.emission.calculated.v1',
  ROLLUP_COMPLETED: 'calculation.rollup.completed.v1',
  RECALCULATION_TRIGGERED: 'calculation.recalculation.triggered.v1',

  // Reporting
  REPORT_GENERATED: 'reporting.report.generated.v1',
  REPORT_SCHEDULED: 'reporting.report.scheduled.v1',

  // Audit
  AUDIT_LOG_CREATED: 'audit.log.created.v1',
  COMPLIANCE_CHECK_COMPLETED: 'audit.compliance.checked.v1',

  // System
  SERVICE_STARTED: 'system.service.started.v1',
  SERVICE_STOPPED: 'system.service.stopped.v1',
  HEALTH_CHECK_FAILED: 'system.health.failed.v1',
} as const;