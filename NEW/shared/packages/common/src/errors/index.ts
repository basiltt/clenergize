/**
 * Clenergize Error Taxonomy
 *
 * Complete error classification system for all microservices.
 * All errors extend from BaseError and follow the format:
 * SERVICE_CATEGORY_NUMBER
 *
 * Usage:
 * ```typescript
 * import { ValidationError, NotFoundError } from '@clenergize/common/errors';
 *
 * throw ValidationError.forField('email', 'Invalid format', 'IDN_VAL_001');
 * throw NotFoundError.byId('User', userId, 'IDN_NFD_001');
 * ```
 */

export * from './base.error';
export * from './validation.error';
export * from './authentication.error';
export * from './authorization.error';
export * from './not-found.error';
export * from './conflict.error';
export * from './business-logic.error';
export * from './internal.error';

// Re-export for convenience
import { BaseError } from './base.error';
import { ValidationError } from './validation.error';
import { AuthenticationError } from './authentication.error';
import { AuthorizationError } from './authorization.error';
import { NotFoundError } from './not-found.error';
import { ConflictError } from './conflict.error';
import { BusinessLogicError } from './business-logic.error';
import { InternalError } from './internal.error';

export const Errors = {
  Base: BaseError,
  Validation: ValidationError,
  Authentication: AuthenticationError,
  Authorization: AuthorizationError,
  NotFound: NotFoundError,
  Conflict: ConflictError,
  BusinessLogic: BusinessLogicError,
  Internal: InternalError
};
