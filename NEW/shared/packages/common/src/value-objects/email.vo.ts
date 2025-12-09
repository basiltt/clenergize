import { z } from 'zod';
import { ValidationError } from '../errors';

/**
 * Email Value Object
 *
 * Represents a valid email address.
 * Immutable and self-validating.
 *
 * Usage:
 * ```typescript
 * const email = Email.create('user@example.com');
 * console.log(email.value); // 'user@example.com'
 * console.log(email.domain); // 'example.com'
 * ```
 */
export class Email {
  private readonly _value: string;

  private static readonly schema = z
    .string()
    .email('Invalid email format')
    .toLowerCase()
    .max(255, 'Email must be less than 255 characters');

  private constructor(value: string) {
    this._value = value;
  }

  /**
   * Create Email from string
   * @throws ValidationError if email is invalid
   */
  static create(value: string, errorCode: string = 'COMMON_VAL_001'): Email {
    const result = Email.schema.safeParse(value);

    if (!result.success) {
      throw new ValidationError(
        `Invalid email: ${value}`,
        errorCode,
        { errors: result.error.errors }
      );
    }

    return new Email(result.data);
  }

  /**
   * Create Email without throwing (returns null on failure)
   */
  static tryCreate(value: string): Email | null {
    try {
      return Email.create(value);
    } catch {
      return null;
    }
  }

  /**
   * Check if string is valid email
   */
  static isValid(value: string): boolean {
    return Email.schema.safeParse(value).success;
  }

  /**
   * Get email value
   */
  get value(): string {
    return this._value;
  }

  /**
   * Get local part (before @)
   */
  get localPart(): string {
    return this._value.split('@')[0] || '';
  }

  /**
   * Get domain part (after @)
   */
  get domain(): string {
    return this._value.split('@')[1] || '';
  }

  /**
   * Check if email belongs to domain
   */
  belongsToDomain(domain: string): boolean {
    return this.domain.toLowerCase() === domain.toLowerCase();
  }

  /**
   * Compare with another Email
   */
  equals(other: Email): boolean {
    return this._value === other._value;
  }

  /**
   * Convert to string
   */
  toString(): string {
    return this._value;
  }

  /**
   * Convert to JSON
   */
  toJSON(): string {
    return this._value;
  }
}
