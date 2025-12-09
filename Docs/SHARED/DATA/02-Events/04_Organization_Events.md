# Organization Service Event Schemas

**Service**: Organization Service
**Port**: 3002
**Event Count**: 14 types

---

## Organization Service Events

### Event Types

```typescript
export type OrganizationEvent =
  | OrganizationCreatedEvent
  | OrganizationUpdatedEvent
  | OrganizationDeletedEvent
  | ProjectCreatedEvent
  | ProjectUpdatedEvent
  | ProjectDeletedEvent
  | ProjectArchivedEvent
  | ProjectRestoredEvent
  | HierarchyCreatedEvent
  | HierarchyUpdatedEvent
  | HierarchyNodeAddedEvent
  | HierarchyNodeRemovedEvent
  | HierarchyNodeMovedEvent
  | PermissionGrantedEvent
  | PermissionRevokedEvent
  | UserAddedToOrganizationEvent
  | UserRemovedFromOrganizationEvent
  | ReportingYearCreatedEvent
  | ReportingYearLockedEvent
  | ModuleEnabledEvent
  | ModuleDisabledEvent
  | TeamCreatedEvent
  | TeamMemberAddedEvent
  | TeamMemberRemovedEvent
  | EntityCreatedEvent
  | EntityUpdatedEvent
  | EntityDeletedEvent;
```

### Project Created Event

```typescript
export interface ProjectCreatedEvent extends DomainEvent {
  type: 'organization.project.created.v1';
  aggregateType: 'Project';
  data: {
    projectId: string;
    companyId: string;
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
    ownerId: string;
    hierarchyTemplateId?: string;
    metadata?: Record<string, any>;
  };
}

export const ProjectCreatedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('organization.project.created.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Project'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  data: z.object({
    projectId: z.string().uuid(),
    companyId: z.string().uuid(),
    name: z.string().min(1).max(255),
    description: z.string().max(1000).optional(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED']),
    ownerId: z.string().uuid(),
    hierarchyTemplateId: z.string().uuid().optional(),
    metadata: z.record(z.any()).optional()
  })
});
```

### Hierarchy Updated Event (CRITICAL - fixes OLD hierarchy cloning issue)

```typescript
export interface HierarchyUpdatedEvent extends DomainEvent {
  type: 'organization.hierarchy.updated.v1';
  aggregateType: 'Hierarchy';
  data: {
    hierarchyId: string;
    projectId: string;
    /** Reference to hierarchy template (NOT cloned data!) */
    templateReference: {
      templateId: string;
      version: string;
      snapshotId?: string; // For point-in-time consistency
    };
    /** Only store overrides/customizations */
    customizations?: {
      nodeId: string;
      overriddenFields: Record<string, any>;
    }[];
    updatedBy: string;
    changeReason?: string;
  };
}

export const HierarchyUpdatedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('organization.hierarchy.updated.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Hierarchy'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    hierarchyId: z.string().uuid(),
    projectId: z.string().uuid(),
    templateReference: z.object({
      templateId: z.string().uuid(),
      version: z.string(),
      snapshotId: z.string().uuid().optional()
    }),
    customizations: z.array(z.object({
      nodeId: z.string().uuid(),
      overriddenFields: z.record(z.any())
    })).optional(),
    updatedBy: z.string().uuid(),
    changeReason: z.string().optional()
  })
});
```

### Permission Granted Event

```typescript
export interface PermissionGrantedEvent extends DomainEvent {
  type: 'organization.permission.granted.v1';
  aggregateType: 'Permission';
  data: {
    permissionId: string;
    userId: string;
    resourceType: 'ORGANIZATION' | 'PROJECT' | 'HIERARCHY' | 'REPORT';
    resourceId: string;
    permissions: ('READ' | 'WRITE' | 'DELETE' | 'ADMIN')[];
    grantedBy: string;
    expiresAt?: string;
    reason?: string;
  };
}

export const PermissionGrantedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('organization.permission.granted.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Permission'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    permissionId: z.string().uuid(),
    userId: z.string().uuid(),
    resourceType: z.enum(['ORGANIZATION', 'PROJECT', 'HIERARCHY', 'REPORT']),
    resourceId: z.string().uuid(),
    permissions: z.array(z.enum(['READ', 'WRITE', 'DELETE', 'ADMIN'])),
    grantedBy: z.string().uuid(),
    expiresAt: z.string().datetime().optional(),
    reason: z.string().optional()
  })
});
```

### User Added to Organization Event

```typescript
export interface UserAddedToOrganizationEvent extends DomainEvent {
  type: 'organization.user.added.v1';
  aggregateType: 'Organization';
  data: {
    organizationId: string;
    userId: string;
    role: string;
    permissions: string[];
    addedBy: string;
    startDate: string;
    endDate?: string;
  };
}

export const UserAddedToOrganizationEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('organization.user.added.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Organization'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    organizationId: z.string().uuid(),
    userId: z.string().uuid(),
    role: z.string(),
    permissions: z.array(z.string()),
    addedBy: z.string().uuid(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime().optional()
  })
});
```

### Organization Created Event

```typescript
export interface OrganizationCreatedEvent extends DomainEvent {
  type: 'organization.organization.created.v1';
  aggregateType: 'Organization';
  data: {
    organizationId: string;
    name: string;
    industry?: string;
    size?: 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE';
    country: string;
    ownerId: string;
    subscriptionTier: 'FREE' | 'PRO' | 'ENTERPRISE';
    createdBy: string;
    timestamp: string;
  };
}

export const OrganizationCreatedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('organization.organization.created.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Organization'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    organizationId: z.string().uuid(),
    name: z.string().min(1),
    industry: z.string().optional(),
    size: z.enum(['SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE']).optional(),
    country: z.string(),
    ownerId: z.string().uuid(),
    subscriptionTier: z.enum(['FREE', 'PRO', 'ENTERPRISE']),
    createdBy: z.string().uuid(),
    timestamp: z.string().datetime()
  })
});
```

### Organization Updated Event

```typescript
export interface OrganizationUpdatedEvent extends DomainEvent {
  type: 'organization.organization.updated.v1';
  aggregateType: 'Organization';
  data: {
    organizationId: string;
    changes: {
      field: string;
      oldValue: any;
      newValue: any;
    }[];
    updatedBy: string;
    timestamp: string;
  };
}

export const OrganizationUpdatedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('organization.organization.updated.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Organization'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    organizationId: z.string().uuid(),
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

### Organization Deleted Event

```typescript
export interface OrganizationDeletedEvent extends DomainEvent {
  type: 'organization.organization.deleted.v1';
  aggregateType: 'Organization';
  data: {
    organizationId: string;
    name: string;
    deletedBy: string;
    reason: string;
    dataRetentionPolicy: 'IMMEDIATE' | 'ARCHIVE_30_DAYS' | 'ARCHIVE_90_DAYS';
    timestamp: string;
  };
}

export const OrganizationDeletedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('organization.organization.deleted.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Organization'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    organizationId: z.string().uuid(),
    name: z.string(),
    deletedBy: z.string().uuid(),
    reason: z.string(),
    dataRetentionPolicy: z.enum(['IMMEDIATE', 'ARCHIVE_30_DAYS', 'ARCHIVE_90_DAYS']),
    timestamp: z.string().datetime()
  })
});
```

### Project Updated Event

```typescript
export interface ProjectUpdatedEvent extends DomainEvent {
  type: 'organization.project.updated.v1';
  aggregateType: 'Project';
  data: {
    projectId: string;
    changes: {
      field: string;
      oldValue: any;
      newValue: any;
    }[];
    updatedBy: string;
    timestamp: string;
  };
}

export const ProjectUpdatedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('organization.project.updated.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Project'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    projectId: z.string().uuid(),
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

### Project Deleted Event

```typescript
export interface ProjectDeletedEvent extends DomainEvent {
  type: 'organization.project.deleted.v1';
  aggregateType: 'Project';
  data: {
    projectId: string;
    name: string;
    deletedBy: string;
    cascadeDelete: boolean;
    affectedRecords: {
      activityData: number;
      calculations: number;
      reports: number;
    };
    timestamp: string;
  };
}

export const ProjectDeletedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('organization.project.deleted.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Project'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    projectId: z.string().uuid(),
    name: z.string(),
    deletedBy: z.string().uuid(),
    cascadeDelete: z.boolean(),
    affectedRecords: z.object({
      activityData: z.number().int().nonnegative(),
      calculations: z.number().int().nonnegative(),
      reports: z.number().int().nonnegative()
    }),
    timestamp: z.string().datetime()
  })
});
```

### Project Archived Event

```typescript
export interface ProjectArchivedEvent extends DomainEvent {
  type: 'organization.project.archived.v1';
  aggregateType: 'Project';
  data: {
    projectId: string;
    archivedBy: string;
    reason?: string;
    archiveDate: string;
    readOnlyMode: boolean;
    timestamp: string;
  };
}

export const ProjectArchivedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('organization.project.archived.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Project'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    projectId: z.string().uuid(),
    archivedBy: z.string().uuid(),
    reason: z.string().optional(),
    archiveDate: z.string().datetime(),
    readOnlyMode: z.boolean(),
    timestamp: z.string().datetime()
  })
});
```

### Project Restored Event

```typescript
export interface ProjectRestoredEvent extends DomainEvent {
  type: 'organization.project.restored.v1';
  aggregateType: 'Project';
  data: {
    projectId: string;
    restoredBy: string;
    originalArchiveDate: string;
    timestamp: string;
  };
}

export const ProjectRestoredEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('organization.project.restored.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Project'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    projectId: z.string().uuid(),
    restoredBy: z.string().uuid(),
    originalArchiveDate: z.string().datetime(),
    timestamp: z.string().datetime()
  })
});
```

### Hierarchy Created Event

```typescript
export interface HierarchyCreatedEvent extends DomainEvent {
  type: 'organization.hierarchy.created.v1';
  aggregateType: 'Hierarchy';
  data: {
    hierarchyId: string;
    projectId: string;
    name: string;
    templateId?: string;
    rootNode: {
      nodeId: string;
      nodeType: 'COMPANY' | 'ENTITY' | 'SUBSIDIARY' | 'LOCATION';
      name: string;
    };
    createdBy: string;
    timestamp: string;
  };
}

export const HierarchyCreatedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('organization.hierarchy.created.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Hierarchy'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    hierarchyId: z.string().uuid(),
    projectId: z.string().uuid(),
    name: z.string(),
    templateId: z.string().uuid().optional(),
    rootNode: z.object({
      nodeId: z.string().uuid(),
      nodeType: z.enum(['COMPANY', 'ENTITY', 'SUBSIDIARY', 'LOCATION']),
      name: z.string()
    }),
    createdBy: z.string().uuid(),
    timestamp: z.string().datetime()
  })
});
```

### Hierarchy Node Added Event

```typescript
export interface HierarchyNodeAddedEvent extends DomainEvent {
  type: 'organization.hierarchy.node-added.v1';
  aggregateType: 'Hierarchy';
  data: {
    hierarchyId: string;
    nodeId: string;
    nodeType: 'COMPANY' | 'ENTITY' | 'SUBSIDIARY' | 'LOCATION';
    nodeName: string;
    parentNodeId: string;
    level: number;
    metadata?: Record<string, any>;
    addedBy: string;
    timestamp: string;
  };
}

export const HierarchyNodeAddedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('organization.hierarchy.node-added.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Hierarchy'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    hierarchyId: z.string().uuid(),
    nodeId: z.string().uuid(),
    nodeType: z.enum(['COMPANY', 'ENTITY', 'SUBSIDIARY', 'LOCATION']),
    nodeName: z.string(),
    parentNodeId: z.string().uuid(),
    level: z.number().int().nonnegative(),
    metadata: z.record(z.any()).optional(),
    addedBy: z.string().uuid(),
    timestamp: z.string().datetime()
  })
});
```

### Hierarchy Node Removed Event

```typescript
export interface HierarchyNodeRemovedEvent extends DomainEvent {
  type: 'organization.hierarchy.node-removed.v1';
  aggregateType: 'Hierarchy';
  data: {
    hierarchyId: string;
    nodeId: string;
    nodeName: string;
    cascadeDelete: boolean;
    affectedChildren: number;
    removedBy: string;
    timestamp: string;
  };
}

export const HierarchyNodeRemovedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('organization.hierarchy.node-removed.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Hierarchy'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    hierarchyId: z.string().uuid(),
    nodeId: z.string().uuid(),
    nodeName: z.string(),
    cascadeDelete: z.boolean(),
    affectedChildren: z.number().int().nonnegative(),
    removedBy: z.string().uuid(),
    timestamp: z.string().datetime()
  })
});
```

### Hierarchy Node Moved Event

```typescript
export interface HierarchyNodeMovedEvent extends DomainEvent {
  type: 'organization.hierarchy.node-moved.v1';
  aggregateType: 'Hierarchy';
  data: {
    hierarchyId: string;
    nodeId: string;
    oldParentId: string;
    newParentId: string;
    movedBy: string;
    reason?: string;
    timestamp: string;
  };
}

export const HierarchyNodeMovedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('organization.hierarchy.node-moved.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Hierarchy'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    hierarchyId: z.string().uuid(),
    nodeId: z.string().uuid(),
    oldParentId: z.string().uuid(),
    newParentId: z.string().uuid(),
    movedBy: z.string().uuid(),
    reason: z.string().optional(),
    timestamp: z.string().datetime()
  })
});
```

### User Removed from Organization Event

```typescript
export interface UserRemovedFromOrganizationEvent extends DomainEvent {
  type: 'organization.user.removed.v1';
  aggregateType: 'Organization';
  data: {
    organizationId: string;
    userId: string;
    removedBy: string;
    reason: string;
    reassignWork: boolean;
    reassignedToUserId?: string;
    timestamp: string;
  };
}

export const UserRemovedFromOrganizationEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('organization.user.removed.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Organization'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    organizationId: z.string().uuid(),
    userId: z.string().uuid(),
    removedBy: z.string().uuid(),
    reason: z.string(),
    reassignWork: z.boolean(),
    reassignedToUserId: z.string().uuid().optional(),
    timestamp: z.string().datetime()
  })
});
```

### Permission Revoked Event

```typescript
export interface PermissionRevokedEvent extends DomainEvent {
  type: 'organization.permission.revoked.v1';
  aggregateType: 'Permission';
  data: {
    permissionId: string;
    userId: string;
    resourceType: 'ORGANIZATION' | 'PROJECT' | 'HIERARCHY' | 'REPORT';
    resourceId: string;
    revokedPermissions: ('READ' | 'WRITE' | 'DELETE' | 'ADMIN')[];
    revokedBy: string;
    reason: string;
    timestamp: string;
  };
}

export const PermissionRevokedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('organization.permission.revoked.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Permission'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    permissionId: z.string().uuid(),
    userId: z.string().uuid(),
    resourceType: z.enum(['ORGANIZATION', 'PROJECT', 'HIERARCHY', 'REPORT']),
    resourceId: z.string().uuid(),
    revokedPermissions: z.array(z.enum(['READ', 'WRITE', 'DELETE', 'ADMIN'])),
    revokedBy: z.string().uuid(),
    reason: z.string(),
    timestamp: z.string().datetime()
  })
});
```

### Reporting Year Created Event

```typescript
export interface ReportingYearCreatedEvent extends DomainEvent {
  type: 'organization.reporting-year.created.v1';
  aggregateType: 'ReportingYear';
  data: {
    yearId: string;
    projectId: string;
    year: number;
    startDate: string;
    endDate: string;
    fiscalYearOffset?: number;
    status: 'DRAFT' | 'ACTIVE' | 'LOCKED' | 'REPORTED';
    createdBy: string;
    timestamp: string;
  };
}

export const ReportingYearCreatedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('organization.reporting-year.created.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('ReportingYear'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    yearId: z.string().uuid(),
    projectId: z.string().uuid(),
    year: z.number().int(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    fiscalYearOffset: z.number().int().optional(),
    status: z.enum(['DRAFT', 'ACTIVE', 'LOCKED', 'REPORTED']),
    createdBy: z.string().uuid(),
    timestamp: z.string().datetime()
  })
});
```

### Reporting Year Locked Event

```typescript
export interface ReportingYearLockedEvent extends DomainEvent {
  type: 'organization.reporting-year.locked.v1';
  aggregateType: 'ReportingYear';
  data: {
    yearId: string;
    projectId: string;
    year: number;
    lockedBy: string;
    lockReason: 'AUDIT' | 'COMPLIANCE' | 'FINAL_REPORT';
    allowsRecalculation: boolean;
    timestamp: string;
  };
}

export const ReportingYearLockedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('organization.reporting-year.locked.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('ReportingYear'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    yearId: z.string().uuid(),
    projectId: z.string().uuid(),
    year: z.number().int(),
    lockedBy: z.string().uuid(),
    lockReason: z.enum(['AUDIT', 'COMPLIANCE', 'FINAL_REPORT']),
    allowsRecalculation: z.boolean(),
    timestamp: z.string().datetime()
  })
});
```

### Module Enabled Event

```typescript
export interface ModuleEnabledEvent extends DomainEvent {
  type: 'organization.module.enabled.v1';
  aggregateType: 'Project';
  data: {
    projectId: string;
    module: 'STATIONARY_COMBUSTION' | 'MOBILE_COMBUSTION' | 'ELECTRICITY' | 'WASTE' | 'WATER' | 'TRAVEL' | 'PURCHASED_GOODS';
    enabledBy: string;
    configuration?: Record<string, any>;
    timestamp: string;
  };
}

export const ModuleEnabledEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('organization.module.enabled.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Project'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    projectId: z.string().uuid(),
    module: z.enum(['STATIONARY_COMBUSTION', 'MOBILE_COMBUSTION', 'ELECTRICITY', 'WASTE', 'WATER', 'TRAVEL', 'PURCHASED_GOODS']),
    enabledBy: z.string().uuid(),
    configuration: z.record(z.any()).optional(),
    timestamp: z.string().datetime()
  })
});
```

### Module Disabled Event

```typescript
export interface ModuleDisabledEvent extends DomainEvent {
  type: 'organization.module.disabled.v1';
  aggregateType: 'Project';
  data: {
    projectId: string;
    module: string;
    disabledBy: string;
    reason: string;
    archiveExistingData: boolean;
    timestamp: string;
  };
}

export const ModuleDisabledEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('organization.module.disabled.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Project'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    projectId: z.string().uuid(),
    module: z.string(),
    disabledBy: z.string().uuid(),
    reason: z.string(),
    archiveExistingData: z.boolean(),
    timestamp: z.string().datetime()
  })
});
```

### Team Created Event

```typescript
export interface TeamCreatedEvent extends DomainEvent {
  type: 'organization.team.created.v1';
  aggregateType: 'Team';
  data: {
    teamId: string;
    organizationId: string;
    name: string;
    description?: string;
    leaderId: string;
    members: string[];
    permissions: string[];
    createdBy: string;
    timestamp: string;
  };
}

export const TeamCreatedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('organization.team.created.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Team'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    teamId: z.string().uuid(),
    organizationId: z.string().uuid(),
    name: z.string(),
    description: z.string().optional(),
    leaderId: z.string().uuid(),
    members: z.array(z.string().uuid()),
    permissions: z.array(z.string()),
    createdBy: z.string().uuid(),
    timestamp: z.string().datetime()
  })
});
```

### Team Member Added Event

```typescript
export interface TeamMemberAddedEvent extends DomainEvent {
  type: 'organization.team.member-added.v1';
  aggregateType: 'Team';
  data: {
    teamId: string;
    userId: string;
    role: 'MEMBER' | 'LEAD' | 'CONTRIBUTOR';
    addedBy: string;
    timestamp: string;
  };
}

export const TeamMemberAddedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('organization.team.member-added.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Team'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    teamId: z.string().uuid(),
    userId: z.string().uuid(),
    role: z.enum(['MEMBER', 'LEAD', 'CONTRIBUTOR']),
    addedBy: z.string().uuid(),
    timestamp: z.string().datetime()
  })
});
```

### Team Member Removed Event

```typescript
export interface TeamMemberRemovedEvent extends DomainEvent {
  type: 'organization.team.member-removed.v1';
  aggregateType: 'Team';
  data: {
    teamId: string;
    userId: string;
    removedBy: string;
    reason?: string;
    timestamp: string;
  };
}

export const TeamMemberRemovedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('organization.team.member-removed.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Team'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    teamId: z.string().uuid(),
    userId: z.string().uuid(),
    removedBy: z.string().uuid(),
    reason: z.string().optional(),
    timestamp: z.string().datetime()
  })
});
```

### Entity Created Event

```typescript
export interface EntityCreatedEvent extends DomainEvent {
  type: 'organization.entity.created.v1';
  aggregateType: 'Entity';
  data: {
    entityId: string;
    hierarchyId: string;
    name: string;
    entityType: 'COMPANY' | 'ENTITY' | 'SUBSIDIARY' | 'LOCATION';
    parentEntityId?: string;
    metadata: {
      address?: string;
      country?: string;
      employeeCount?: number;
      floorArea?: number;
      revenue?: number;
    };
    createdBy: string;
    timestamp: string;
  };
}

export const EntityCreatedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('organization.entity.created.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Entity'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    entityId: z.string().uuid(),
    hierarchyId: z.string().uuid(),
    name: z.string(),
    entityType: z.enum(['COMPANY', 'ENTITY', 'SUBSIDIARY', 'LOCATION']),
    parentEntityId: z.string().uuid().optional(),
    metadata: z.object({
      address: z.string().optional(),
      country: z.string().optional(),
      employeeCount: z.number().int().nonnegative().optional(),
      floorArea: z.number().nonnegative().optional(),
      revenue: z.number().nonnegative().optional()
    }),
    createdBy: z.string().uuid(),
    timestamp: z.string().datetime()
  })
});
```

### Entity Updated Event

```typescript
export interface EntityUpdatedEvent extends DomainEvent {
  type: 'organization.entity.updated.v1';
  aggregateType: 'Entity';
  data: {
    entityId: string;
    changes: {
      field: string;
      oldValue: any;
      newValue: any;
    }[];
    updatedBy: string;
    timestamp: string;
  };
}

export const EntityUpdatedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('organization.entity.updated.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Entity'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    entityId: z.string().uuid(),
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

### Entity Deleted Event

```typescript
export interface EntityDeletedEvent extends DomainEvent {
  type: 'organization.entity.deleted.v1';
  aggregateType: 'Entity';
  data: {
    entityId: string;
    name: string;
    deletedBy: string;
    cascadeDelete: boolean;
    affectedActivityData: number;
    timestamp: string;
  };
}

export const EntityDeletedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('organization.entity.deleted.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Entity'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    entityId: z.string().uuid(),
    name: z.string(),
    deletedBy: z.string().uuid(),
    cascadeDelete: z.boolean(),
    affectedActivityData: z.number().int().nonnegative(),
    timestamp: z.string().datetime()
  })
});
```

---

