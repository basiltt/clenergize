import { z } from 'zod';
import { createEventSchema } from './base-event.schema';

// ==================== ORGANIZATION EVENTS ====================

export const OrganizationCreatedEventSchema = createEventSchema(
  'organization.organization.created.v1',
  'Organization',
  z.object({
    organizationId: z.string().uuid(),
    name: z.string().min(1).max(255),
    industry: z.string().optional(),
    country: z.string().length(2),
    timezone: z.string(),
    fiscalYearStart: z.string(),
    createdBy: z.string().uuid(),
    metadata: z.record(z.any()).optional(),
  })
);

// ==================== PROJECT EVENTS ====================

export const ProjectCreatedEventSchema = createEventSchema(
  'organization.project.created.v1',
  'Project',
  z.object({
    projectId: z.string().uuid(),
    companyId: z.string().uuid(),
    name: z.string().min(1).max(255),
    description: z.string().max(1000).optional(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED']),
    ownerId: z.string().uuid(),
    hierarchyTemplateId: z.string().uuid().optional(),
    metadata: z.record(z.any()).optional(),
  })
);

export const ProjectUpdatedEventSchema = createEventSchema(
  'organization.project.updated.v1',
  'Project',
  z.object({
    projectId: z.string().uuid(),
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

export const ProjectArchivedEventSchema = createEventSchema(
  'organization.project.archived.v1',
  'Project',
  z.object({
    projectId: z.string().uuid(),
    archivedBy: z.string().uuid(),
    reason: z.string(),
    timestamp: z.string().datetime(),
  })
);

// ==================== HIERARCHY EVENTS (CRITICAL - fixes cloning issue) ====================

export const HierarchyCreatedEventSchema = createEventSchema(
  'organization.hierarchy.created.v1',
  'Hierarchy',
  z.object({
    hierarchyId: z.string().uuid(),
    projectId: z.string().uuid(),
    templateReference: z.object({
      templateId: z.string().uuid(),
      version: z.string(),
    }),
    createdBy: z.string().uuid(),
    timestamp: z.string().datetime(),
  })
);

export const HierarchyUpdatedEventSchema = createEventSchema(
  'organization.hierarchy.updated.v1',
  'Hierarchy',
  z.object({
    hierarchyId: z.string().uuid(),
    projectId: z.string().uuid(),
    templateReference: z.object({
      templateId: z.string().uuid(),
      version: z.string(),
    }),
    updatedBy: z.string().uuid(),
    changes: z.array(z.string()),
    timestamp: z.string().datetime(),
  })
);

export const HierarchyNodeAddedEventSchema = createEventSchema(
  'organization.hierarchy.node-added.v1',
  'Hierarchy',
  z.object({
    hierarchyId: z.string().uuid(),
    nodeId: z.string().uuid(),
    parentNodeId: z.string().uuid().optional(),
    nodeType: z.string(),
    nodeName: z.string(),
    level: z.number().int().min(0),
    addedBy: z.string().uuid(),
    timestamp: z.string().datetime(),
  })
);

// ==================== PERMISSION EVENTS ====================

export const PermissionGrantedEventSchema = createEventSchema(
  'organization.permission.granted.v1',
  'Permission',
  z.object({
    userId: z.string().uuid(),
    resourceType: z.string(),
    resourceId: z.string().uuid(),
    permission: z.string(),
    grantedBy: z.string().uuid(),
    expiresAt: z.string().datetime().optional(),
    timestamp: z.string().datetime(),
  })
);

export const PermissionRevokedEventSchema = createEventSchema(
  'organization.permission.revoked.v1',
  'Permission',
  z.object({
    userId: z.string().uuid(),
    resourceType: z.string(),
    resourceId: z.string().uuid(),
    permission: z.string(),
    revokedBy: z.string().uuid(),
    reason: z.string(),
    timestamp: z.string().datetime(),
  })
);

// ==================== USER MEMBERSHIP EVENTS ====================

export const UserAddedToOrganizationEventSchema = createEventSchema(
  'organization.user.added.v1',
  'Organization',
  z.object({
    organizationId: z.string().uuid(),
    userId: z.string().uuid(),
    role: z.string(),
    addedBy: z.string().uuid(),
    timestamp: z.string().datetime(),
  })
);

export const UserRemovedFromOrganizationEventSchema = createEventSchema(
  'organization.user.removed.v1',
  'Organization',
  z.object({
    organizationId: z.string().uuid(),
    userId: z.string().uuid(),
    removedBy: z.string().uuid(),
    reason: z.string(),
    timestamp: z.string().datetime(),
  })
);

// ==================== REPORTING YEAR EVENTS ====================

export const ReportingYearCreatedEventSchema = createEventSchema(
  'organization.reporting-year.created.v1',
  'ReportingYear',
  z.object({
    reportingYearId: z.string().uuid(),
    projectId: z.string().uuid(),
    year: z.number().int().min(2000).max(2100),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    status: z.enum(['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'LOCKED']),
    createdBy: z.string().uuid(),
    timestamp: z.string().datetime(),
  })
);

// ==================== TYPE EXPORTS ====================

export type OrganizationCreatedEvent = z.infer<typeof OrganizationCreatedEventSchema>;
export type ProjectCreatedEvent = z.infer<typeof ProjectCreatedEventSchema>;
export type ProjectUpdatedEvent = z.infer<typeof ProjectUpdatedEventSchema>;
export type ProjectArchivedEvent = z.infer<typeof ProjectArchivedEventSchema>;
export type HierarchyCreatedEvent = z.infer<typeof HierarchyCreatedEventSchema>;
export type HierarchyUpdatedEvent = z.infer<typeof HierarchyUpdatedEventSchema>;
export type HierarchyNodeAddedEvent = z.infer<typeof HierarchyNodeAddedEventSchema>;
export type PermissionGrantedEvent = z.infer<typeof PermissionGrantedEventSchema>;
export type PermissionRevokedEvent = z.infer<typeof PermissionRevokedEventSchema>;
export type UserAddedToOrganizationEvent = z.infer<typeof UserAddedToOrganizationEventSchema>;
export type UserRemovedFromOrganizationEvent = z.infer<
  typeof UserRemovedFromOrganizationEventSchema
>;
export type ReportingYearCreatedEvent = z.infer<typeof ReportingYearCreatedEventSchema>;

export type OrganizationEvent =
  | OrganizationCreatedEvent
  | ProjectCreatedEvent
  | ProjectUpdatedEvent
  | ProjectArchivedEvent
  | HierarchyCreatedEvent
  | HierarchyUpdatedEvent
  | HierarchyNodeAddedEvent
  | PermissionGrantedEvent
  | PermissionRevokedEvent
  | UserAddedToOrganizationEvent
  | UserRemovedFromOrganizationEvent
  | ReportingYearCreatedEvent;
