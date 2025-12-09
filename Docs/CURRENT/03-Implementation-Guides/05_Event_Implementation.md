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

## Identity Service Events

### Event Types

```typescript
// @clenergize/contracts/src/events/identity/types.ts
export type IdentityEvent =
  | UserCreatedEvent
  | UserUpdatedEvent
  | UserDeletedEvent
  | UserAuthenticatedEvent
  | UserAuthenticationFailedEvent
  | PasswordResetRequestedEvent
  | PasswordResetCompletedEvent
  | UserRoleAssignedEvent
  | UserRoleRevokedEvent
  | UserActivatedEvent
  | UserDeactivatedEvent
  | SessionCreatedEvent
  | SessionExpiredEvent
  | TwoFactorEnabledEvent
  | TwoFactorDisabledEvent;
```

### User Created Event

```typescript
// @clenergize/contracts/src/events/identity/user-created.event.ts
import { DomainEvent } from '../base-event';
import { z } from 'zod';

export interface UserCreatedEvent extends DomainEvent {
  type: 'identity.user.created.v1';
  aggregateType: 'User';
  data: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
    createdBy: string;
    metadata?: Record<string, any>;
  };
}

export const UserCreatedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('identity.user.created.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('User'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    userId: z.string().uuid(),
    email: z.string().email(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    roles: z.array(z.string()),
    status: z.enum(['ACTIVE', 'PENDING', 'SUSPENDED']),
    createdBy: z.string().uuid(),
    metadata: z.record(z.any()).optional()
  })
});
```

### User Authenticated Event

```typescript
export interface UserAuthenticatedEvent extends DomainEvent {
  type: 'identity.user.authenticated.v1';
  aggregateType: 'User';
  data: {
    userId: string;
    sessionId: string;
    ipAddress: string;
    userAgent: string;
    authMethod: 'PASSWORD' | 'SSO' | 'MFA';
    timestamp: string;
  };
}

export const UserAuthenticatedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('identity.user.authenticated.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('User'),
  userId: z.string().uuid(),
  correlationId: z.string().uuid(),
  data: z.object({
    userId: z.string().uuid(),
    sessionId: z.string().uuid(),
    ipAddress: z.string().ip(),
    userAgent: z.string(),
    authMethod: z.enum(['PASSWORD', 'SSO', 'MFA']),
    timestamp: z.string().datetime()
  })
});
```

### Password Reset Requested Event

```typescript
export interface PasswordResetRequestedEvent extends DomainEvent {
  type: 'identity.password.reset-requested.v1';
  aggregateType: 'User';
  data: {
    userId: string;
    email: string;
    resetToken: string;
    expiresAt: string;
    requestedFrom: string; // IP address
  };
}

export const PasswordResetRequestedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('identity.password.reset-requested.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('User'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    userId: z.string().uuid(),
    email: z.string().email(),
    resetToken: z.string(),
    expiresAt: z.string().datetime(),
    requestedFrom: z.string().ip()
  })
});
```

### User Role Assigned Event

```typescript
export interface UserRoleAssignedEvent extends DomainEvent {
  type: 'identity.user.role-assigned.v1';
  aggregateType: 'User';
  data: {
    userId: string;
    role: string;
    scope?: {
      organizationId?: string;
      projectId?: string;
    };
    assignedBy: string;
    reason?: string;
  };
}

export const UserRoleAssignedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('identity.user.role-assigned.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('User'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    userId: z.string().uuid(),
    role: z.string(),
    scope: z.object({
      organizationId: z.string().uuid().optional(),
      projectId: z.string().uuid().optional()
    }).optional(),
    assignedBy: z.string().uuid(),
    reason: z.string().optional()
  })
});
```

### User Updated Event

```typescript
export interface UserUpdatedEvent extends DomainEvent {
  type: 'identity.user.updated.v1';
  aggregateType: 'User';
  data: {
    userId: string;
    changes: {
      field: string;
      oldValue: any;
      newValue: any;
    }[];
    updatedBy: string;
    reason?: string;
    timestamp: string;
  };
}

export const UserUpdatedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('identity.user.updated.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('User'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    userId: z.string().uuid(),
    changes: z.array(z.object({
      field: z.string(),
      oldValue: z.any(),
      newValue: z.any()
    })),
    updatedBy: z.string().uuid(),
    reason: z.string().optional(),
    timestamp: z.string().datetime()
  })
});
```

### User Deleted Event

```typescript
export interface UserDeletedEvent extends DomainEvent {
  type: 'identity.user.deleted.v1';
  aggregateType: 'User';
  data: {
    userId: string;
    email: string;
    deletionType: 'SOFT' | 'HARD';
    deletedBy: string;
    reason: string;
    gdprCompliant: boolean;
    timestamp: string;
  };
}

export const UserDeletedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('identity.user.deleted.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('User'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    userId: z.string().uuid(),
    email: z.string().email(),
    deletionType: z.enum(['SOFT', 'HARD']),
    deletedBy: z.string().uuid(),
    reason: z.string(),
    gdprCompliant: z.boolean(),
    timestamp: z.string().datetime()
  })
});
```

### User Authentication Failed Event

```typescript
export interface UserAuthenticationFailedEvent extends DomainEvent {
  type: 'identity.user.authentication-failed.v1';
  aggregateType: 'User';
  data: {
    email: string;
    ipAddress: string;
    userAgent: string;
    failureReason: 'INVALID_CREDENTIALS' | 'ACCOUNT_LOCKED' | 'ACCOUNT_SUSPENDED' | 'MFA_FAILED';
    attemptCount: number;
    timestamp: string;
  };
}

export const UserAuthenticationFailedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('identity.user.authentication-failed.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('User'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    email: z.string().email(),
    ipAddress: z.string().ip(),
    userAgent: z.string(),
    failureReason: z.enum(['INVALID_CREDENTIALS', 'ACCOUNT_LOCKED', 'ACCOUNT_SUSPENDED', 'MFA_FAILED']),
    attemptCount: z.number().int().positive(),
    timestamp: z.string().datetime()
  })
});
```

### Password Reset Completed Event

```typescript
export interface PasswordResetCompletedEvent extends DomainEvent {
  type: 'identity.password.reset-completed.v1';
  aggregateType: 'User';
  data: {
    userId: string;
    email: string;
    resetToken: string;
    resetFrom: string; // IP address
    timestamp: string;
  };
}

export const PasswordResetCompletedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('identity.password.reset-completed.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('User'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    userId: z.string().uuid(),
    email: z.string().email(),
    resetToken: z.string(),
    resetFrom: z.string().ip(),
    timestamp: z.string().datetime()
  })
});
```

### User Role Revoked Event

```typescript
export interface UserRoleRevokedEvent extends DomainEvent {
  type: 'identity.user.role-revoked.v1';
  aggregateType: 'User';
  data: {
    userId: string;
    role: string;
    scope?: {
      organizationId?: string;
      projectId?: string;
    };
    revokedBy: string;
    reason: string;
    timestamp: string;
  };
}

export const UserRoleRevokedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('identity.user.role-revoked.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('User'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    userId: z.string().uuid(),
    role: z.string(),
    scope: z.object({
      organizationId: z.string().uuid().optional(),
      projectId: z.string().uuid().optional()
    }).optional(),
    revokedBy: z.string().uuid(),
    reason: z.string(),
    timestamp: z.string().datetime()
  })
});
```

### User Activated Event

```typescript
export interface UserActivatedEvent extends DomainEvent {
  type: 'identity.user.activated.v1';
  aggregateType: 'User';
  data: {
    userId: string;
    email: string;
    activatedBy: string;
    activationMethod: 'EMAIL_VERIFICATION' | 'ADMIN_APPROVAL' | 'AUTO';
    timestamp: string;
  };
}

export const UserActivatedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('identity.user.activated.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('User'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    userId: z.string().uuid(),
    email: z.string().email(),
    activatedBy: z.string().uuid(),
    activationMethod: z.enum(['EMAIL_VERIFICATION', 'ADMIN_APPROVAL', 'AUTO']),
    timestamp: z.string().datetime()
  })
});
```

### User Deactivated Event

```typescript
export interface UserDeactivatedEvent extends DomainEvent {
  type: 'identity.user.deactivated.v1';
  aggregateType: 'User';
  data: {
    userId: string;
    email: string;
    deactivatedBy: string;
    reason: string;
    suspensionDuration?: number; // days, null = permanent
    timestamp: string;
  };
}

export const UserDeactivatedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('identity.user.deactivated.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('User'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    userId: z.string().uuid(),
    email: z.string().email(),
    deactivatedBy: z.string().uuid(),
    reason: z.string(),
    suspensionDuration: z.number().int().positive().optional(),
    timestamp: z.string().datetime()
  })
});
```

### Session Created Event

```typescript
export interface SessionCreatedEvent extends DomainEvent {
  type: 'identity.session.created.v1';
  aggregateType: 'Session';
  data: {
    sessionId: string;
    userId: string;
    ipAddress: string;
    userAgent: string;
    expiresAt: string;
    refreshToken?: string;
    timestamp: string;
  };
}

export const SessionCreatedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('identity.session.created.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Session'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    sessionId: z.string().uuid(),
    userId: z.string().uuid(),
    ipAddress: z.string().ip(),
    userAgent: z.string(),
    expiresAt: z.string().datetime(),
    refreshToken: z.string().optional(),
    timestamp: z.string().datetime()
  })
});
```

### Session Expired Event

```typescript
export interface SessionExpiredEvent extends DomainEvent {
  type: 'identity.session.expired.v1';
  aggregateType: 'Session';
  data: {
    sessionId: string;
    userId: string;
    reason: 'TIMEOUT' | 'LOGOUT' | 'FORCE_LOGOUT' | 'TOKEN_REVOKED';
    timestamp: string;
  };
}

export const SessionExpiredEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('identity.session.expired.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Session'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    sessionId: z.string().uuid(),
    userId: z.string().uuid(),
    reason: z.enum(['TIMEOUT', 'LOGOUT', 'FORCE_LOGOUT', 'TOKEN_REVOKED']),
    timestamp: z.string().datetime()
  })
});
```

### Two-Factor Authentication Enabled Event

```typescript
export interface TwoFactorEnabledEvent extends DomainEvent {
  type: 'identity.2fa.enabled.v1';
  aggregateType: 'User';
  data: {
    userId: string;
    method: 'TOTP' | 'SMS' | 'EMAIL';
    backupCodesGenerated: boolean;
    enabledBy: string;
    timestamp: string;
  };
}

export const TwoFactorEnabledEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('identity.2fa.enabled.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('User'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    userId: z.string().uuid(),
    method: z.enum(['TOTP', 'SMS', 'EMAIL']),
    backupCodesGenerated: z.boolean(),
    enabledBy: z.string().uuid(),
    timestamp: z.string().datetime()
  })
});
```

### Two-Factor Authentication Disabled Event

```typescript
export interface TwoFactorDisabledEvent extends DomainEvent {
  type: 'identity.2fa.disabled.v1';
  aggregateType: 'User';
  data: {
    userId: string;
    disabledBy: string;
    reason: string;
    timestamp: string;
  };
}

export const TwoFactorDisabledEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('identity.2fa.disabled.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('User'),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  data: z.object({
    userId: z.string().uuid(),
    disabledBy: z.string().uuid(),
    reason: z.string(),
    timestamp: z.string().datetime()
  })
});
```

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

## Reporting Service Events

### Event Types

```typescript
export type ReportingEvent =
  | ReportGenerationStartedEvent
  | ReportGenerationCompletedEvent
  | ReportGenerationFailedEvent
  | ReportScheduledEvent
  | ReportExportedEvent
  | DashboardRefreshedEvent
  | ExportStartedEvent
  | ExportCompletedEvent;
```

### Report Generation Completed Event

```typescript
export interface ReportGenerationCompletedEvent extends DomainEvent {
  type: 'reporting.report.generation-completed.v1';
  aggregateType: 'Report';
  data: {
    reportId: string;
    reportType: 'EMISSION_SUMMARY' | 'ACTIVITY_DETAIL' | 'COMPARISON' | 'AUDIT';
    projectId: string;
    period: {
      startDate: string;
      endDate: string;
    };
    format: 'PDF' | 'EXCEL' | 'CSV' | 'JSON';
    fileUrl: string;
    fileSize: number; // bytes
    generationDuration: number; // milliseconds
    generatedBy: string;
    generatedAt: string;
    expiresAt?: string;
  };
}

export const ReportGenerationCompletedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('reporting.report.generation-completed.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Report'),
  correlationId: z.string().uuid(),
  data: z.object({
    reportId: z.string().uuid(),
    reportType: z.enum(['EMISSION_SUMMARY', 'ACTIVITY_DETAIL', 'COMPARISON', 'AUDIT']),
    projectId: z.string().uuid(),
    period: z.object({
      startDate: z.string().datetime(),
      endDate: z.string().datetime()
    }),
    format: z.enum(['PDF', 'EXCEL', 'CSV', 'JSON']),
    fileUrl: z.string().url(),
    fileSize: z.number().positive(),
    generationDuration: z.number().positive(),
    generatedBy: z.string().uuid(),
    generatedAt: z.string().datetime(),
    expiresAt: z.string().datetime().optional()
  })
});
```

### Report Exported Event

```typescript
export interface ReportExportedEvent extends DomainEvent {
  type: 'reporting.report.exported.v1';
  aggregateType: 'Report';
  data: {
    reportId: string;
    exportId: string;
    destination: 'S3' | 'EMAIL' | 'FTP' | 'WEBHOOK';
    destinationDetails: Record<string, any>;
    status: 'SUCCESS' | 'FAILED';
    error?: string;
    exportedBy: string;
    exportedAt: string;
  };
}

export const ReportExportedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('reporting.report.exported.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Report'),
  correlationId: z.string().uuid(),
  data: z.object({
    reportId: z.string().uuid(),
    exportId: z.string().uuid(),
    destination: z.enum(['S3', 'EMAIL', 'FTP', 'WEBHOOK']),
    destinationDetails: z.record(z.any()),
    status: z.enum(['SUCCESS', 'FAILED']),
    error: z.string().optional(),
    exportedBy: z.string().uuid(),
    exportedAt: z.string().datetime()
  })
});
```

### Report Generation Started Event

```typescript
export interface ReportGenerationStartedEvent extends DomainEvent {
  type: 'reporting.report.generation-started.v1';
  aggregateType: 'Report';
  data: {
    reportId: string;
    reportType: string;
    projectId: string;
    startedBy: string;
    timestamp: string;
  };
}

export const ReportGenerationStartedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('reporting.report.generation-started.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Report'),
  correlationId: z.string().uuid(),
  data: z.object({
    reportId: z.string().uuid(),
    reportType: z.string(),
    projectId: z.string().uuid(),
    startedBy: z.string().uuid(),
    timestamp: z.string().datetime()
  })
});
```

### Report Generation Failed Event

```typescript
export interface ReportGenerationFailedEvent extends DomainEvent {
  type: 'reporting.report.generation-failed.v1';
  aggregateType: 'Report';
  data: {
    reportId: string;
    errorMessage: string;
    errorCode: string;
    timestamp: string;
  };
}

export const ReportGenerationFailedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('reporting.report.generation-failed.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Report'),
  correlationId: z.string().uuid(),
  data: z.object({
    reportId: z.string().uuid(),
    errorMessage: z.string(),
    errorCode: z.string(),
    timestamp: z.string().datetime()
  })
});
```

### Report Scheduled Event

```typescript
export interface ReportScheduledEvent extends DomainEvent {
  type: 'reporting.report.scheduled.v1';
  aggregateType: 'ReportSchedule';
  data: {
    scheduleId: string;
    reportType: string;
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
    nextRunAt: string;
    recipients: string[];
    createdBy: string;
    timestamp: string;
  };
}

export const ReportScheduledEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('reporting.report.scheduled.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('ReportSchedule'),
  correlationId: z.string().uuid(),
  data: z.object({
    scheduleId: z.string().uuid(),
    reportType: z.string(),
    frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY']),
    nextRunAt: z.string().datetime(),
    recipients: z.array(z.string().email()),
    createdBy: z.string().uuid(),
    timestamp: z.string().datetime()
  })
});
```

### Dashboard Refreshed Event

```typescript
export interface DashboardRefreshedEvent extends DomainEvent {
  type: 'reporting.dashboard.refreshed.v1';
  aggregateType: 'Dashboard';
  data: {
    dashboardId: string;
    projectId: string;
    refreshedAt: string;
    cacheKey: string;
    dataSources: string[];
  };
}

export const DashboardRefreshedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('reporting.dashboard.refreshed.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Dashboard'),
  correlationId: z.string().uuid(),
  data: z.object({
    dashboardId: z.string().uuid(),
    projectId: z.string().uuid(),
    refreshedAt: z.string().datetime(),
    cacheKey: z.string(),
    dataSources: z.array(z.string())
  })
});
```

### Export Started Event

```typescript
export interface ExportStartedEvent extends DomainEvent {
  type: 'reporting.export.started.v1';
  aggregateType: 'Export';
  data: {
    exportId: string;
    exportType: 'ACTIVITY_DATA' | 'CALCULATIONS' | 'AGGREGATED';
    format: 'CSV' | 'EXCEL' | 'JSON';
    estimatedRows: number;
    startedBy: string;
    timestamp: string;
  };
}

export const ExportStartedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('reporting.export.started.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Export'),
  correlationId: z.string().uuid(),
  data: z.object({
    exportId: z.string().uuid(),
    exportType: z.enum(['ACTIVITY_DATA', 'CALCULATIONS', 'AGGREGATED']),
    format: z.enum(['CSV', 'EXCEL', 'JSON']),
    estimatedRows: z.number().int().nonnegative(),
    startedBy: z.string().uuid(),
    timestamp: z.string().datetime()
  })
});
```

### Export Completed Event

```typescript
export interface ExportCompletedEvent extends DomainEvent {
  type: 'reporting.export.completed.v1';
  aggregateType: 'Export';
  data: {
    exportId: string;
    fileUrl: string;
    fileSize: number;
    totalRows: number;
    duration: number; // ms
    timestamp: string;
  };
}

export const ExportCompletedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('reporting.export.completed.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Export'),
  correlationId: z.string().uuid(),
  data: z.object({
    exportId: z.string().uuid(),
    fileUrl: z.string().url(),
    fileSize: z.number().positive(),
    totalRows: z.number().int().nonnegative(),
    duration: z.number().positive(),
    timestamp: z.string().datetime()
  })
});
```

---

## Audit Service Events

### Event Types

```typescript
export type AuditEvent =
  | AuditLogCreatedEvent
  | ComplianceCheckCompletedEvent
  | DataAccessLoggedEvent
  | SecurityEventDetectedEvent;
```

### Audit Log Created Event

```typescript
export interface AuditLogCreatedEvent extends DomainEvent {
  type: 'audit.log.created.v1';
  aggregateType: 'AuditLog';
  data: {
    auditLogId: string;
    action: string;
    resourceType: string;
    resourceId: string;
    userId: string;
    result: 'SUCCESS' | 'FAILURE';
    changes?: {
      field: string;
      oldValue: any;
      newValue: any;
    }[];
    ipAddress: string;
    userAgent: string;
    timestamp: string;
    metadata?: Record<string, any>;
  };
}

export const AuditLogCreatedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('audit.log.created.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('AuditLog'),
  correlationId: z.string().uuid(),
  data: z.object({
    auditLogId: z.string().uuid(),
    action: z.string(),
    resourceType: z.string(),
    resourceId: z.string(),
    userId: z.string().uuid(),
    result: z.enum(['SUCCESS', 'FAILURE']),
    changes: z.array(z.object({
      field: z.string(),
      oldValue: z.any(),
      newValue: z.any()
    })).optional(),
    ipAddress: z.string().ip(),
    userAgent: z.string(),
    timestamp: z.string().datetime(),
    metadata: z.record(z.any()).optional()
  })
});
```

### Compliance Check Completed Event

```typescript
export interface ComplianceCheckCompletedEvent extends DomainEvent {
  type: 'audit.compliance.check-completed.v1';
  aggregateType: 'ComplianceCheck';
  data: {
    checkId: string;
    checkType: 'GDPR' | 'ISO14064' | 'GHG_PROTOCOL' | 'CUSTOM';
    projectId?: string;
    organizationId?: string;
    result: 'PASS' | 'FAIL' | 'WARNING';
    findings: {
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      category: string;
      description: string;
      affectedRecords?: number;
    }[];
    checkedAt: string;
    checkedBy: string;
  };
}

export const ComplianceCheckCompletedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('audit.compliance.check-completed.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('ComplianceCheck'),
  correlationId: z.string().uuid(),
  data: z.object({
    checkId: z.string().uuid(),
    checkType: z.enum(['GDPR', 'ISO14064', 'GHG_PROTOCOL', 'CUSTOM']),
    projectId: z.string().uuid().optional(),
    organizationId: z.string().uuid().optional(),
    result: z.enum(['PASS', 'FAIL', 'WARNING']),
    findings: z.array(z.object({
      severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
      category: z.string(),
      description: z.string(),
      affectedRecords: z.number().int().nonnegative().optional()
    })),
    checkedAt: z.string().datetime(),
    checkedBy: z.string().uuid()
  })
});
```

### Security Event Detected Event

```typescript
export interface SecurityEventDetectedEvent extends DomainEvent {
  type: 'audit.security.event-detected.v1';
  aggregateType: 'SecurityEvent';
  data: {
    securityEventId: string;
    eventType: 'BRUTE_FORCE' | 'UNAUTHORIZED_ACCESS' | 'SUSPICIOUS_ACTIVITY' | 'DATA_EXFILTRATION';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    userId?: string;
    ipAddress: string;
    details: Record<string, any>;
    detectedAt: string;
    responseActions: string[];
  };
}

export const SecurityEventDetectedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('audit.security.event-detected.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('SecurityEvent'),
  correlationId: z.string().uuid(),
  data: z.object({
    securityEventId: z.string().uuid(),
    eventType: z.enum(['BRUTE_FORCE', 'UNAUTHORIZED_ACCESS', 'SUSPICIOUS_ACTIVITY', 'DATA_EXFILTRATION']),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    userId: z.string().uuid().optional(),
    ipAddress: z.string().ip(),
    details: z.record(z.any()),
    detectedAt: z.string().datetime(),
    responseActions: z.array(z.string())
  })
});
```

### Data Access Logged Event

```typescript
export interface DataAccessLoggedEvent extends DomainEvent {
  type: 'audit.data-access.logged.v1';
  aggregateType: 'DataAccessLog';
  data: {
    accessLogId: string;
    userId: string;
    resourceType: string;
    resourceId: string;
    action: 'READ' | 'WRITE' | 'DELETE' | 'EXPORT';
    accessMethod: 'UI' | 'API' | 'DIRECT_DATABASE';
    ipAddress: string;
    userAgent: string;
    success: boolean;
    dataClassification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
    recordCount?: number;
    timestamp: string;
  };
}

export const DataAccessLoggedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('audit.data-access.logged.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('DataAccessLog'),
  correlationId: z.string().uuid(),
  data: z.object({
    accessLogId: z.string().uuid(),
    userId: z.string().uuid(),
    resourceType: z.string(),
    resourceId: z.string(),
    action: z.enum(['READ', 'WRITE', 'DELETE', 'EXPORT']),
    accessMethod: z.enum(['UI', 'API', 'DIRECT_DATABASE']),
    ipAddress: z.string().ip(),
    userAgent: z.string(),
    success: z.boolean(),
    dataClassification: z.enum(['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED']),
    recordCount: z.number().int().nonnegative().optional(),
    timestamp: z.string().datetime()
  })
});
```

---

## Event Publishing Patterns

### Basic Event Publishing

```typescript
import { EventBridge } from '@aws-sdk/client-eventbridge';
import { v4 as uuid } from 'uuid';
import { UserCreatedEvent, UserCreatedEventSchema } from '@clenergize/contracts';
import { CorrelationIdMiddleware } from '@clenergize/common';

export class EventPublisher {
  constructor(
    private readonly eventBridge: EventBridge,
    private readonly serviceName: string
  ) {}

  async publishUserCreated(user: User, createdBy: string): Promise<void> {
    const event: UserCreatedEvent = {
      id: uuid(),
      type: 'identity.user.created.v1',
      version: '1.0.0',
      occurredAt: new Date().toISOString(),
      aggregateId: user.id,
      aggregateType: 'User',
      userId: createdBy,
      correlationId: CorrelationIdMiddleware.get() || uuid(),
      data: {
        userId: user.id,
        email: user.email.getValue(),
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        status: user.status,
        createdBy
      }
    };

    // Validate before publishing
    const validated = UserCreatedEventSchema.parse(event);

    await this.eventBridge.putEvents({
      Entries: [{
        Source: this.serviceName,
        DetailType: event.type,
        Detail: JSON.stringify(validated),
        EventBusName: process.env.EVENT_BUS_NAME
      }]
    });
  }
}
```

### Batch Event Publishing (for performance)

```typescript
export class EventPublisher {
  async publishBatch(events: DomainEvent[]): Promise<void> {
    // EventBridge supports max 10 events per batch
    const batches = this.chunkArray(events, 10);

    for (const batch of batches) {
      await this.eventBridge.putEvents({
        Entries: batch.map(event => ({
          Source: this.serviceName,
          DetailType: event.type,
          Detail: JSON.stringify(event),
          EventBusName: process.env.EVENT_BUS_NAME
        }))
      });
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
```

### Transaction-Aware Event Publishing (Critical!)

```typescript
export class TransactionalEventPublisher {
  private pendingEvents: DomainEvent[] = [];

  /**
   * Stage event for publishing after transaction commits
   */
  stageEvent(event: DomainEvent): void {
    this.pendingEvents.push(event);
  }

  /**
   * Publish all staged events (called after successful transaction)
   */
  async publishStagedEvents(): Promise<void> {
    if (this.pendingEvents.length === 0) return;

    try {
      await this.publishBatch(this.pendingEvents);
      this.pendingEvents = [];
    } catch (error) {
      // Log error but don't fail the transaction
      console.error('Failed to publish events:', error);
      // Could implement retry queue here
    }
  }

  /**
   * Clear staged events (called on transaction rollback)
   */
  clearStagedEvents(): void {
    this.pendingEvents = [];
  }
}

// Usage in service
class UserService {
  @Transactional()
  async createUser(userData: any, session?: ClientSession): Promise<User> {
    const user = await this.userRepository.create(userData, session);

    // Stage event (don't publish yet - transaction might rollback!)
    this.eventPublisher.stageEvent(
      this.createUserCreatedEvent(user)
    );

    return user;
  }

  async onTransactionCommit(): Promise<void> {
    // Publish all events after transaction succeeds
    await this.eventPublisher.publishStagedEvents();
  }

  async onTransactionRollback(): Promise<void> {
    // Clear events if transaction fails
    this.eventPublisher.clearStagedEvents();
  }
}
```

---

## Event Consumption Patterns

### Event Handler Implementation

```typescript
import { IEventHandler, BaseEvent } from '@clenergize/common';
import { UserCreatedEvent } from '@clenergize/contracts';

export class SendWelcomeEmailHandler implements IEventHandler<UserCreatedEvent> {
  readonly handlerId = 'send-welcome-email-handler';
  readonly eventTypes = ['identity.user.created.v1'];

  constructor(
    private readonly emailService: EmailService,
    private readonly logger: StructuredLogger
  ) {}

  async handle(event: UserCreatedEvent): Promise<void> {
    this.logger.info('Processing UserCreatedEvent', {
      eventId: event.id,
      userId: event.data.userId,
      correlationId: event.correlationId
    });

    try {
      await this.emailService.sendWelcomeEmail({
        to: event.data.email,
        firstName: event.data.firstName,
        correlationId: event.correlationId
      });

      this.logger.info('Welcome email sent successfully', {
        eventId: event.id,
        userId: event.data.userId
      });
    } catch (error) {
      await this.onError(event, error as Error);
    }
  }

  async onError(event: UserCreatedEvent, error: Error): Promise<void> {
    this.logger.error('Failed to send welcome email', error, {
      eventId: event.id,
      userId: event.data.userId,
      correlationId: event.correlationId
    });

    // Could implement retry logic or dead letter queue here
  }
}
```

### Event Subscription (EventBridge)

```typescript
// Lambda handler for EventBridge events
export const handler = async (event: any): Promise<void> => {
  // EventBridge wraps the event in a container
  const domainEvent: UserCreatedEvent = JSON.parse(event.detail);

  // Validate event schema
  const validated = UserCreatedEventSchema.parse(domainEvent);

  // Route to appropriate handler
  const handler = new SendWelcomeEmailHandler(emailService, logger);
  await handler.handle(validated);
};
```

### Event Subscription (Redis Pub/Sub for local dev)

```typescript
import Redis from 'ioredis';

export class RedisEventSubscriber {
  private redis: Redis;
  private handlers: Map<string, IEventHandler[]> = new Map();

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl);
  }

  async subscribe<T extends DomainEvent>(
    eventType: string,
    handler: IEventHandler<T>
  ): Promise<void> {
    const handlers = this.handlers.get(eventType) || [];
    handlers.push(handler as IEventHandler);
    this.handlers.set(eventType, handlers);

    await this.redis.subscribe(eventType);

    this.redis.on('message', async (channel, message) => {
      if (channel === eventType) {
        const event: T = JSON.parse(message);
        const eventHandlers = this.handlers.get(channel) || [];

        for (const h of eventHandlers) {
          await h.handle(event);
        }
      }
    });
  }
}
```

---

## Event Versioning Strategy

### Version Format

```
<service>.<aggregate>.<action>.v<major-version>

Examples:
- identity.user.created.v1
- identity.user.created.v2  (breaking change)
- organization.project.created.v1
```

### Handling Breaking Changes

```typescript
// V1 Event (original)
export interface UserCreatedEventV1 extends DomainEvent {
  type: 'identity.user.created.v1';
  data: {
    userId: string;
    email: string;
    name: string; // Single field
  };
}

// V2 Event (breaking change - split name into firstName/lastName)
export interface UserCreatedEventV2 extends DomainEvent {
  type: 'identity.user.created.v2';
  data: {
    userId: string;
    email: string;
    firstName: string; // Split field
    lastName: string;  // Split field
  };
}

// Handler that supports both versions
export class UserCreatedHandlerV2 implements IEventHandler {
  readonly eventTypes = ['identity.user.created.v1', 'identity.user.created.v2'];

  async handle(event: UserCreatedEventV1 | UserCreatedEventV2): Promise<void> {
    if (event.type === 'identity.user.created.v1') {
      // Transform V1 to V2 format
      const [firstName, lastName] = this.parseName(event.data.name);
      return this.processUser(event.data.userId, event.data.email, firstName, lastName);
    } else {
      // V2 format - use directly
      return this.processUser(
        event.data.userId,
        event.data.email,
        event.data.firstName,
        event.data.lastName
      );
    }
  }

  private parseName(fullName: string): [string, string] {
    const parts = fullName.split(' ');
    return [parts[0], parts.slice(1).join(' ')];
  }
}
```

### Version Deprecation Policy

1. **Announcement**: 2 sprints before removal
2. **Deprecation Header**: Add `X-Event-Deprecated: true` metadata
3. **Dual Publishing**: Publish both old and new versions for 2 sprints
4. **Removal**: After 2 sprints of dual publishing

---

## Migration from OLD

### OLD Approach (String-Based Events)

```typescript
// ❌ OLD codebase - error-prone string-based events

// publisher.ts
await sqs.sendMessage({
  QueueUrl: process.env.QUEUE_URL,
  MessageBody: JSON.stringify({
    type: 'permission-granded', // ❌ TYPO! Should be "granted"
    userId: user.id,
    projectId: project.id
  })
});

// consumer.ts
sqs.on('message', async (message) => {
  const event = JSON.parse(message.Body);

  // ❌ No type safety, no validation
  if (event.type === 'permission-granted') { // Different spelling!
    // This handler will NEVER execute due to typo
    await grantPermission(event.userId, event.projectId);
  }
});

// Result: Silent failure, permissions not granted, no error logged
```

### NEW Approach (Type-Safe Events)

```typescript
// ✅ NEW codebase - type-safe events with compile-time checks

import { PermissionGrantedEvent, PermissionGrantedEventSchema } from '@clenergize/contracts';

// publisher.ts
const event: PermissionGrantedEvent = {
  id: uuid(),
  type: 'organization.permission.granted.v1', // ✅ Type-checked!
  version: '1.0.0',
  occurredAt: new Date().toISOString(),
  aggregateId: permission.id,
  aggregateType: 'Permission',
  userId: admin.id,
  correlationId: requestId,
  data: {
    permissionId: permission.id,
    userId: user.id,
    resourceType: 'PROJECT',
    resourceId: project.id,
    permissions: ['READ', 'WRITE'],
    grantedBy: admin.id
  }
};

// ✅ Validate at runtime
const validated = PermissionGrantedEventSchema.parse(event);

await eventBus.publish(validated);

// consumer.ts
class PermissionGrantedHandler implements IEventHandler<PermissionGrantedEvent> {
  readonly eventTypes = ['organization.permission.granted.v1']; // ✅ Type-checked!

  async handle(event: PermissionGrantedEvent): Promise<void> {
    // ✅ Full type safety, autocomplete in IDE
    await this.grantPermission(
      event.data.userId,
      event.data.resourceId,
      event.data.permissions
    );
  }
}

// Result: Compile-time safety, runtime validation, guaranteed execution
```

### Migration Checklist

- [ ] Replace all SQS string events with typed EventBridge events
- [ ] Add Zod schemas for runtime validation
- [ ] Implement correlation ID tracking
- [ ] Add event versioning
- [ ] Set up EventBridge rules for local dev (LocalStack)
- [ ] Configure dead letter queues for failed events
- [ ] Implement event replay mechanism
- [ ] Add monitoring/alerting for event failures

---

## Best Practices

### 1. Event Naming Conventions

✅ **DO:**
- Use descriptive past tense: `UserCreated`, `OrderPlaced`, `PaymentProcessed`
- Follow format: `<service>.<aggregate>.<action>.v<version>`
- Use semantic versioning: `v1`, `v2`, `v3`

❌ **DON'T:**
- Use generic names: `Event`, `Update`, `Change`
- Mix tenses: `UserCreate`, `OrderPlacing`
- Skip versioning: `user.created` (no version)

### 2. Event Size

- Keep events < 256 KB (EventBridge limit)
- Store large payloads in S3, reference in event
- Include only essential data

### 3. Event Ordering

- Events are **not guaranteed to be ordered** across aggregates
- Use `causationId` to track event chains
- Design for eventual consistency

### 4. Idempotency

```typescript
// Always check if event was already processed
export class UserCreatedHandler {
  async handle(event: UserCreatedEvent): Promise<void> {
    // Check idempotency key
    const alreadyProcessed = await this.cache.get(`event:${event.id}`);
    if (alreadyProcessed) {
      this.logger.info('Event already processed', { eventId: event.id });
      return;
    }

    // Process event
    await this.processUser(event.data);

    // Mark as processed (TTL: 7 days)
    await this.cache.set(`event:${event.id}`, 'processed', 604800);
  }
}
```

---

## Appendix

### Complete Event Type Registry

```typescript
export type AllEvents =
  | IdentityEvent
  | OrganizationEvent
  | ReferenceEvent
  | ActivityEvent
  | CalculationEvent
  | ReportingEvent
  | AuditEvent;

export const EVENT_TYPE_MAP: Record<string, z.ZodSchema> = {
  // Identity Service (15 events)
  'identity.user.created.v1': UserCreatedEventSchema,
  'identity.user.updated.v1': UserUpdatedEventSchema,
  'identity.user.deleted.v1': UserDeletedEventSchema,
  'identity.user.authenticated.v1': UserAuthenticatedEventSchema,
  'identity.user.authentication-failed.v1': UserAuthenticationFailedEventSchema,
  'identity.password.reset-requested.v1': PasswordResetRequestedEventSchema,
  'identity.password.reset-completed.v1': PasswordResetCompletedEventSchema,
  'identity.user.role-assigned.v1': UserRoleAssignedEventSchema,
  'identity.user.role-revoked.v1': UserRoleRevokedEventSchema,
  'identity.user.activated.v1': UserActivatedEventSchema,
  'identity.user.deactivated.v1': UserDeactivatedEventSchema,
  'identity.session.created.v1': SessionCreatedEventSchema,
  'identity.session.expired.v1': SessionExpiredEventSchema,
  'identity.2fa.enabled.v1': TwoFactorEnabledEventSchema,
  'identity.2fa.disabled.v1': TwoFactorDisabledEventSchema,

  // Organization Service (27 events)
  'organization.organization.created.v1': OrganizationCreatedEventSchema,
  'organization.organization.updated.v1': OrganizationUpdatedEventSchema,
  'organization.organization.deleted.v1': OrganizationDeletedEventSchema,
  'organization.project.created.v1': ProjectCreatedEventSchema,
  'organization.project.updated.v1': ProjectUpdatedEventSchema,
  'organization.project.deleted.v1': ProjectDeletedEventSchema,
  'organization.project.archived.v1': ProjectArchivedEventSchema,
  'organization.project.restored.v1': ProjectRestoredEventSchema,
  'organization.hierarchy.created.v1': HierarchyCreatedEventSchema,
  'organization.hierarchy.updated.v1': HierarchyUpdatedEventSchema,
  'organization.hierarchy.node-added.v1': HierarchyNodeAddedEventSchema,
  'organization.hierarchy.node-removed.v1': HierarchyNodeRemovedEventSchema,
  'organization.hierarchy.node-moved.v1': HierarchyNodeMovedEventSchema,
  'organization.permission.granted.v1': PermissionGrantedEventSchema,
  'organization.permission.revoked.v1': PermissionRevokedEventSchema,
  'organization.user.added.v1': UserAddedToOrganizationEventSchema,
  'organization.user.removed.v1': UserRemovedFromOrganizationEventSchema,
  'organization.reporting-year.created.v1': ReportingYearCreatedEventSchema,
  'organization.reporting-year.locked.v1': ReportingYearLockedEventSchema,
  'organization.module.enabled.v1': ModuleEnabledEventSchema,
  'organization.module.disabled.v1': ModuleDisabledEventSchema,
  'organization.team.created.v1': TeamCreatedEventSchema,
  'organization.team.member-added.v1': TeamMemberAddedEventSchema,
  'organization.team.member-removed.v1': TeamMemberRemovedEventSchema,
  'organization.entity.created.v1': EntityCreatedEventSchema,
  'organization.entity.updated.v1': EntityUpdatedEventSchema,
  'organization.entity.deleted.v1': EntityDeletedEventSchema,

  // Reference Service (15 events)
  'reference.emission-factor.created.v1': EmissionFactorCreatedEventSchema,
  'reference.emission-factor.updated.v1': EmissionFactorUpdatedEventSchema,
  'reference.emission-factor.deprecated.v1': EmissionFactorDeprecatedEventSchema,
  'reference.unit.created.v1': UnitCreatedEventSchema,
  'reference.unit.updated.v1': UnitUpdatedEventSchema,
  'reference.conversion.created.v1': ConversionRuleCreatedEventSchema,
  'reference.data.imported.v1': ReferenceDataImportedEventSchema,
  'reference.data.versioned.v1': ReferenceDataVersionedEventSchema,
  'reference.parameter.created.v1': ParameterCreatedEventSchema,
  'reference.parameter.updated.v1': ParameterUpdatedEventSchema,
  'reference.category.created.v1': CategoryCreatedEventSchema,
  'reference.data.synced.v1': ReferenceDataSyncedEventSchema,
  'reference.data.validated.v1': ReferenceDataValidatedEventSchema,
  'reference.emission-factor.region-mapped.v1': EmissionFactorRegionMappedEventSchema,
  'reference.custom-emission-factor.created.v1': CustomEmissionFactorCreatedEventSchema,

  // Activity Service (15 events)
  'activity.data.ingested.v1': ActivityDataIngestedEventSchema,
  'activity.data.validated.v1': ActivityDataValidatedEventSchema,
  'activity.data.validation-failed.v1': ActivityDataValidationFailedEventSchema,
  'activity.data.verified.v1': ActivityDataVerifiedEventSchema,
  'activity.data.updated.v1': ActivityDataUpdatedEventSchema,
  'activity.data.deleted.v1': ActivityDataDeletedEventSchema,
  'activity.bulk-import.started.v1': BulkImportStartedEventSchema,
  'activity.bulk-import.completed.v1': BulkImportCompletedEventSchema,
  'activity.bulk-import.failed.v1': BulkImportFailedEventSchema,
  'activity.carbon-scope.created.v1': CarbonScopeCreatedEventSchema,
  'activity.carbon-scope.updated.v1': CarbonScopeUpdatedEventSchema,
  'activity.comment.added.v1': ActivityCommentAddedEventSchema,
  'activity.file.attached.v1': FileAttachedEventSchema,
  'activity.data-quality.flagged.v1': DataQualityFlaggedEventSchema,
  'activity.data-quality.resolved.v1': DataQualityResolvedEventSchema,

  // Calculation Service (8 events)
  'calculation.calculation.started.v1': CalculationStartedEventSchema,
  'calculation.calculation.completed.v1': CalculationCompletedEventSchema,
  'calculation.calculation.failed.v1': CalculationFailedEventSchema,
  'calculation.emission.calculated.v1': EmissionCalculatedEventSchema,
  'calculation.rollup.started.v1': RollupStartedEventSchema,
  'calculation.rollup.completed.v1': RollupCompletedEventSchema,
  'calculation.recalculation.triggered.v1': RecalculationTriggeredEventSchema,
  'calculation.allocation.created.v1': AllocationCreatedEventSchema,

  // Reporting Service (8 events)
  'reporting.report.generation-started.v1': ReportGenerationStartedEventSchema,
  'reporting.report.generation-completed.v1': ReportGenerationCompletedEventSchema,
  'reporting.report.generation-failed.v1': ReportGenerationFailedEventSchema,
  'reporting.report.scheduled.v1': ReportScheduledEventSchema,
  'reporting.report.exported.v1': ReportExportedEventSchema,
  'reporting.dashboard.refreshed.v1': DashboardRefreshedEventSchema,
  'reporting.export.started.v1': ExportStartedEventSchema,
  'reporting.export.completed.v1': ExportCompletedEventSchema,

  // Audit Service (4 events)
  'audit.log.created.v1': AuditLogCreatedEventSchema,
  'audit.compliance.check-completed.v1': ComplianceCheckCompletedEventSchema,
  'audit.security.event-detected.v1': SecurityEventDetectedEventSchema,
  'audit.data-access.logged.v1': DataAccessLoggedEventSchema
};
```

### Event Statistics (for monitoring)

| Service | Event Types | Avg Events/Day | Peak Events/Hour |
|---------|-------------|----------------|------------------|
| Identity | 15 | 500 | 100 |
| Organization | 27 | 1,200 | 300 |
| Reference | 15 | 50 | 10 |
| Activity | 15 | 5,000 | 1,000 |
| Calculation | 8 | 10,000 | 2,500 |
| Reporting | 8 | 200 | 50 |
| Audit | 4 | 2,000 | 500 |
| **Total** | **92** | **19,000** | **4,460** |

---

**Last Updated**: November 18, 2025
**Next Review**: Sprint 0.3 (after EventBridge implementation)
**Maintained By**: Architecture Agent + All Service Agents
