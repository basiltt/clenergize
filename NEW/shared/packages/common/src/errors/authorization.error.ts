import { BaseError } from './base.error';

/**
 * Authorization Error
 *
 * Thrown when user lacks permission to perform an action
 * HTTP Status Code: 403 Forbidden
 *
 * Examples:
 * - User doesn't have required role
 * - User doesn't have permission to access resource
 * - User doesn't have permission to perform action
 */
export class AuthorizationError extends BaseError {
  constructor(
    message: string,
    code: string,
    details?: Record<string, any>
  ) {
    super(message, code, 403, true, details);
  }

  /**
   * Create error for insufficient permissions
   */
  static insufficientPermissions(
    code: string,
    requiredPermission: string
  ): AuthorizationError {
    return new AuthorizationError(
      `Insufficient permissions. Required: ${requiredPermission}`,
      code,
      { requiredPermission }
    );
  }

  /**
   * Create error for role requirement
   */
  static roleRequired(
    code: string,
    requiredRole: string,
    userRole?: string
  ): AuthorizationError {
    return new AuthorizationError(
      `Required role: ${requiredRole}`,
      code,
      { requiredRole, userRole }
    );
  }

  /**
   * Create error for resource access denial
   */
  static resourceAccessDenied(
    code: string,
    resourceType: string,
    resourceId: string
  ): AuthorizationError {
    return new AuthorizationError(
      `Access denied to ${resourceType}`,
      code,
      { resourceType, resourceId }
    );
  }
}
