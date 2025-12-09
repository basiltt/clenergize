import { BaseError } from './base.error';

/**
 * Authentication Error
 *
 * Thrown when authentication fails (invalid credentials, expired token, etc.)
 * HTTP Status Code: 401 Unauthorized
 *
 * Examples:
 * - Invalid username/password
 * - Expired JWT token
 * - Missing authentication token
 * - Invalid token signature
 */
export class AuthenticationError extends BaseError {
  constructor(
    message: string,
    code: string,
    details?: Record<string, any>
  ) {
    super(message, code, 401, true, details);
  }

  /**
   * Create error for invalid credentials
   */
  static invalidCredentials(code: string): AuthenticationError {
    return new AuthenticationError(
      'Invalid credentials provided',
      code
    );
  }

  /**
   * Create error for expired token
   */
  static tokenExpired(code: string, expiresAt?: string): AuthenticationError {
    return new AuthenticationError(
      'Authentication token has expired',
      code,
      { expiresAt }
    );
  }

  /**
   * Create error for missing token
   */
  static tokenMissing(code: string): AuthenticationError {
    return new AuthenticationError(
      'Authentication token is required',
      code
    );
  }

  /**
   * Create error for invalid token
   */
  static tokenInvalid(code: string, reason?: string): AuthenticationError {
    return new AuthenticationError(
      'Authentication token is invalid',
      code,
      { reason }
    );
  }
}
