import { z } from 'zod';
import { createEventSchema } from './base-event.schema';

// ==================== USER EVENTS ====================

export const UserCreatedEventSchema = createEventSchema(
  'identity.user.created.v1',
  'User',
  z.object({
    userId: z.string().uuid(),
    email: z.string().email(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    roles: z.array(z.string()),
    status: z.enum(['ACTIVE', 'PENDING', 'SUSPENDED']),
    createdBy: z.string().uuid(),
    metadata: z.record(z.any()).optional(),
  })
);

export const UserUpdatedEventSchema = createEventSchema(
  'identity.user.updated.v1',
  'User',
  z.object({
    userId: z.string().uuid(),
    changes: z.array(
      z.object({
        field: z.string(),
        oldValue: z.any(),
        newValue: z.any(),
      })
    ),
    updatedBy: z.string().uuid(),
    reason: z.string().optional(),
    timestamp: z.string().datetime(),
  })
);

export const UserDeletedEventSchema = createEventSchema(
  'identity.user.deleted.v1',
  'User',
  z.object({
    userId: z.string().uuid(),
    email: z.string().email(),
    deletionType: z.enum(['SOFT', 'HARD']),
    deletedBy: z.string().uuid(),
    reason: z.string(),
    gdprCompliant: z.boolean(),
    timestamp: z.string().datetime(),
  })
);

export const UserAuthenticatedEventSchema = createEventSchema(
  'identity.user.authenticated.v1',
  'User',
  z.object({
    userId: z.string().uuid(),
    sessionId: z.string().uuid(),
    ipAddress: z.string().ip(),
    userAgent: z.string(),
    authMethod: z.enum(['PASSWORD', 'SSO', 'MFA']),
    timestamp: z.string().datetime(),
  })
);

export const UserAuthenticationFailedEventSchema = createEventSchema(
  'identity.user.authentication-failed.v1',
  'User',
  z.object({
    email: z.string().email(),
    ipAddress: z.string().ip(),
    userAgent: z.string(),
    failureReason: z.enum([
      'INVALID_CREDENTIALS',
      'ACCOUNT_LOCKED',
      'ACCOUNT_SUSPENDED',
      'MFA_FAILED',
    ]),
    attemptCount: z.number().int().positive(),
    timestamp: z.string().datetime(),
  })
);

// ==================== PASSWORD EVENTS ====================

export const PasswordResetRequestedEventSchema = createEventSchema(
  'identity.password.reset-requested.v1',
  'User',
  z.object({
    userId: z.string().uuid(),
    email: z.string().email(),
    resetToken: z.string(),
    expiresAt: z.string().datetime(),
    requestedFrom: z.string().ip(),
  })
);

export const PasswordResetCompletedEventSchema = createEventSchema(
  'identity.password.reset-completed.v1',
  'User',
  z.object({
    userId: z.string().uuid(),
    email: z.string().email(),
    resetToken: z.string(),
    resetFrom: z.string().ip(),
    timestamp: z.string().datetime(),
  })
);

// ==================== ROLE EVENTS ====================

export const UserRoleAssignedEventSchema = createEventSchema(
  'identity.user.role-assigned.v1',
  'User',
  z.object({
    userId: z.string().uuid(),
    role: z.string(),
    scope: z
      .object({
        organizationId: z.string().uuid().optional(),
        projectId: z.string().uuid().optional(),
      })
      .optional(),
    assignedBy: z.string().uuid(),
    reason: z.string().optional(),
  })
);

export const UserRoleRevokedEventSchema = createEventSchema(
  'identity.user.role-revoked.v1',
  'User',
  z.object({
    userId: z.string().uuid(),
    role: z.string(),
    scope: z
      .object({
        organizationId: z.string().uuid().optional(),
        projectId: z.string().uuid().optional(),
      })
      .optional(),
    revokedBy: z.string().uuid(),
    reason: z.string(),
    timestamp: z.string().datetime(),
  })
);

// ==================== ACTIVATION EVENTS ====================

export const UserActivatedEventSchema = createEventSchema(
  'identity.user.activated.v1',
  'User',
  z.object({
    userId: z.string().uuid(),
    email: z.string().email(),
    activatedBy: z.string().uuid(),
    activationMethod: z.enum(['EMAIL_VERIFICATION', 'ADMIN_APPROVAL', 'AUTO']),
    timestamp: z.string().datetime(),
  })
);

export const UserDeactivatedEventSchema = createEventSchema(
  'identity.user.deactivated.v1',
  'User',
  z.object({
    userId: z.string().uuid(),
    email: z.string().email(),
    deactivatedBy: z.string().uuid(),
    reason: z.string(),
    suspensionDuration: z.number().int().positive().optional(),
    timestamp: z.string().datetime(),
  })
);

// ==================== SESSION EVENTS ====================

export const SessionCreatedEventSchema = createEventSchema(
  'identity.session.created.v1',
  'Session',
  z.object({
    sessionId: z.string().uuid(),
    userId: z.string().uuid(),
    ipAddress: z.string().ip(),
    userAgent: z.string(),
    expiresAt: z.string().datetime(),
    refreshToken: z.string().optional(),
    timestamp: z.string().datetime(),
  })
);

export const SessionExpiredEventSchema = createEventSchema(
  'identity.session.expired.v1',
  'Session',
  z.object({
    sessionId: z.string().uuid(),
    userId: z.string().uuid(),
    reason: z.enum(['TIMEOUT', 'LOGOUT', 'FORCE_LOGOUT', 'TOKEN_REVOKED']),
    timestamp: z.string().datetime(),
  })
);

// ==================== TWO-FACTOR AUTHENTICATION EVENTS ====================

export const TwoFactorEnabledEventSchema = createEventSchema(
  'identity.2fa.enabled.v1',
  'User',
  z.object({
    userId: z.string().uuid(),
    method: z.enum(['TOTP', 'SMS', 'EMAIL']),
    backupCodesGenerated: z.boolean(),
    enabledBy: z.string().uuid(),
    timestamp: z.string().datetime(),
  })
);

export const TwoFactorDisabledEventSchema = createEventSchema(
  'identity.2fa.disabled.v1',
  'User',
  z.object({
    userId: z.string().uuid(),
    disabledBy: z.string().uuid(),
    reason: z.string(),
    timestamp: z.string().datetime(),
  })
);

// ==================== TYPE EXPORTS ====================

export type UserCreatedEvent = z.infer<typeof UserCreatedEventSchema>;
export type UserUpdatedEvent = z.infer<typeof UserUpdatedEventSchema>;
export type UserDeletedEvent = z.infer<typeof UserDeletedEventSchema>;
export type UserAuthenticatedEvent = z.infer<typeof UserAuthenticatedEventSchema>;
export type UserAuthenticationFailedEvent = z.infer<
  typeof UserAuthenticationFailedEventSchema
>;
export type PasswordResetRequestedEvent = z.infer<typeof PasswordResetRequestedEventSchema>;
export type PasswordResetCompletedEvent = z.infer<typeof PasswordResetCompletedEventSchema>;
export type UserRoleAssignedEvent = z.infer<typeof UserRoleAssignedEventSchema>;
export type UserRoleRevokedEvent = z.infer<typeof UserRoleRevokedEventSchema>;
export type UserActivatedEvent = z.infer<typeof UserActivatedEventSchema>;
export type UserDeactivatedEvent = z.infer<typeof UserDeactivatedEventSchema>;
export type SessionCreatedEvent = z.infer<typeof SessionCreatedEventSchema>;
export type SessionExpiredEvent = z.infer<typeof SessionExpiredEventSchema>;
export type TwoFactorEnabledEvent = z.infer<typeof TwoFactorEnabledEventSchema>;
export type TwoFactorDisabledEvent = z.infer<typeof TwoFactorDisabledEventSchema>;

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
