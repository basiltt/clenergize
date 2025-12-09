import { BaseError } from './base.error';

/**
 * Internal Error
 *
 * Thrown when an unexpected internal error occurs
 * HTTP Status Code: 500 Internal Server Error
 *
 * Examples:
 * - Database connection failure
 * - External service unavailable
 * - Unexpected null/undefined value
 * - Programming errors (should not happen in production)
 *
 * Note: These errors are NOT operational (indicates a bug or infrastructure issue)
 */
export class InternalError extends BaseError {
  constructor(
    message: string,
    code: string,
    details?: Record<string, any>,
    isOperational: boolean = false // Internal errors are usually NOT operational
  ) {
    super(message, code, 500, isOperational, details);
  }

  /**
   * Create error for database failure
   */
  static database(
    operation: string,
    originalError: Error,
    code: string
  ): InternalError {
    return new InternalError(
      `Database operation failed: ${operation}`,
      code,
      {
        operation,
        originalError: originalError.message,
        stack: originalError.stack
      }
    );
  }

  /**
   * Create error for external service failure
   */
  static externalService(
    serviceName: string,
    originalError: Error,
    code: string
  ): InternalError {
    return new InternalError(
      `External service '${serviceName}' failed`,
      code,
      {
        serviceName,
        originalError: originalError.message,
        stack: originalError.stack
      },
      true // External service failures are operational (retryable)
    );
  }

  /**
   * Create error for unexpected condition
   */
  static unexpected(
    context: string,
    originalError: Error,
    code: string
  ): InternalError {
    return new InternalError(
      `Unexpected error in ${context}`,
      code,
      {
        context,
        originalError: originalError.message,
        stack: originalError.stack
      },
      false // Unexpected errors indicate bugs
    );
  }

  /**
   * Create error for configuration issues
   */
  static configuration(
    configKey: string,
    reason: string,
    code: string
  ): InternalError {
    return new InternalError(
      `Configuration error: ${configKey}`,
      code,
      { configKey, reason },
      false // Configuration errors prevent startup
    );
  }
}
