# Identity Service Event Schemas

**Service**: Identity Service
**Port**: 3001
**Event Count**: 15 types

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

