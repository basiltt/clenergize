import { BaseError } from './base.error';

/**
 * Not Found Error
 *
 * Thrown when a requested resource doesn't exist
 * HTTP Status Code: 404 Not Found
 *
 * Examples:
 * - User not found
 * - Project not found
 * - Emission factor not found
 */
export class NotFoundError extends BaseError {
  constructor(
    message: string,
    code: string,
    details?: Record<string, any>
  ) {
    super(message, code, 404, true, details);
  }

  /**
   * Create error for entity not found
   */
  static entity(
    entityType: string,
    identifier: string | Record<string, any>,
    code: string
  ): NotFoundError {
    const idStr = typeof identifier === 'string'
      ? identifier
      : JSON.stringify(identifier);

    return new NotFoundError(
      `${entityType} not found`,
      code,
      { entityType, identifier: idStr }
    );
  }

  /**
   * Create error for resource not found by ID
   */
  static byId(
    resourceType: string,
    id: string,
    code: string
  ): NotFoundError {
    return new NotFoundError(
      `${resourceType} with ID '${id}' not found`,
      code,
      { resourceType, id }
    );
  }
}
