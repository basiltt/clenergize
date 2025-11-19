import { BaseError } from './base.error';

/**
 * Conflict Error
 *
 * Thrown when an operation conflicts with current system state
 * HTTP Status Code: 409 Conflict
 *
 * Examples:
 * - Duplicate email address
 * - Duplicate project name
 * - Resource already exists
 * - Concurrent modification conflict
 */
export class ConflictError extends BaseError {
  constructor(
    message: string,
    code: string,
    details?: Record<string, any>
  ) {
    super(message, code, 409, true, details);
  }

  /**
   * Create error for duplicate entity
   */
  static duplicate(
    entityType: string,
    field: string,
    value: string,
    code: string
  ): ConflictError {
    return new ConflictError(
      `${entityType} with ${field} '${value}' already exists`,
      code,
      { entityType, field, value }
    );
  }

  /**
   * Create error for concurrent modification
   */
  static concurrentModification(
    entityType: string,
    entityId: string,
    code: string
  ): ConflictError {
    return new ConflictError(
      `${entityType} was modified by another process`,
      code,
      { entityType, entityId }
    );
  }

  /**
   * Create error for version mismatch (optimistic locking)
   */
  static versionMismatch(
    entityType: string,
    expectedVersion: number,
    actualVersion: number,
    code: string
  ): ConflictError {
    return new ConflictError(
      `Version mismatch for ${entityType}`,
      code,
      { entityType, expectedVersion, actualVersion }
    );
  }
}
