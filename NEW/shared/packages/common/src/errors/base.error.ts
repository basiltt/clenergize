/**
 * Base Domain Error
 *
 * All custom errors in the Clenergize system extend from this base class.
 * Provides consistent error structure across all microservices.
 *
 * Error Code Format: SERVICE_CATEGORY_NUMBER
 * - SERVICE: 3-letter service identifier (IDN, ORG, REF, ACT, CAL, REP, AUD)
 * - CATEGORY: Error category (VAL=Validation, AUTH=Authentication, BIZ=Business Logic, etc.)
 * - NUMBER: Sequential number (001-999)
 *
 * Example: IDN_AUTH_001 = Identity Service, Authentication Error, Number 001
 */
export abstract class BaseError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: string;
  public readonly details?: Record<string, any>;

  constructor(
    message: string,
    code: string,
    statusCode: number,
    isOperational: boolean = true,
    details?: Record<string, any>
  ) {
    super(message);

    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    this.details = details;

    // Ensure the name of this error is the same as the class name
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Convert error to JSON format for API responses
   */
  toJSON(): Record<string, any> {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
        timestamp: this.timestamp
      }
    };
  }

  /**
   * Convert error to string for logging
   */
  toString(): string {
    return `[${this.code}] ${this.message}${
      this.details ? ` | Details: ${JSON.stringify(this.details)}` : ''
    }`;
  }
}
