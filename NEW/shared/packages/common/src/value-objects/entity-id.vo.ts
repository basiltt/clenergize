import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import { z } from 'zod';
import { ValidationError } from '../errors';

/**
 * Entity ID Value Object
 *
 * Represents a unique identifier for entities.
 * Uses UUID v4 format.
 *
 * Usage:
 * ```typescript
 * const userId = EntityId.generate(); // New UUID
 * const projectId = EntityId.create('123e4567-e89b-12d3-a456-426614174000');
 * ```
 */
export class EntityId {
  private readonly _value: string;

  private static readonly schema = z
    .string()
    .uuid('Invalid UUID format');

  private constructor(value: string) {
    this._value = value;
  }

  /**
   * Generate new UUID
   */
  static generate(): EntityId {
    return new EntityId(uuidv4());
  }

  /**
   * Create EntityId from string
   * @throws ValidationError if not valid UUID
   */
  static create(value: string, errorCode: string = 'COMMON_VAL_002'): EntityId {
    const result = EntityId.schema.safeParse(value);

    if (!result.success) {
      throw new ValidationError(
        `Invalid entity ID: ${value}`,
        errorCode,
        { errors: result.error.errors }
      );
    }

    return new EntityId(result.data);
  }

  /**
   * Create EntityId without throwing (returns null on failure)
   */
  static tryCreate(value: string): EntityId | null {
    try {
      return EntityId.create(value);
    } catch {
      return null;
    }
  }

  /**
   * Check if string is valid UUID
   */
  static isValid(value: string): boolean {
    return uuidValidate(value);
  }

  /**
   * Get ID value
   */
  get value(): string {
    return this._value;
  }

  /**
   * Compare with another EntityId
   */
  equals(other: EntityId): boolean {
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
