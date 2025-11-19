import { BaseError } from './base.error';

/**
 * Validation Error
 *
 * Thrown when input validation fails (invalid format, missing required fields, etc.)
 * HTTP Status Code: 400 Bad Request
 *
 * Examples:
 * - Invalid email format
 * - Missing required field
 * - Value out of range
 * - Invalid date format
 */
export class ValidationError extends BaseError {
  constructor(
    message: string,
    code: string,
    details?: Record<string, any>
  ) {
    super(message, code, 400, true, details);
  }

  /**
   * Create validation error from Zod validation result
   */
  static fromZod(zodError: any, code: string): ValidationError {
    const details = zodError.errors.reduce((acc: any, err: any) => {
      const path = err.path.join('.');
      acc[path] = err.message;
      return acc;
    }, {});

    return new ValidationError(
      'Validation failed',
      code,
      { validationErrors: details }
    );
  }

  /**
   * Create validation error for a specific field
   */
  static forField(
    fieldName: string,
    reason: string,
    code: string
  ): ValidationError {
    return new ValidationError(
      `Validation failed for field '${fieldName}': ${reason}`,
      code,
      { field: fieldName, reason }
    );
  }
}
