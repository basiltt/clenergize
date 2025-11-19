import { ValidationError } from '../errors';
import { isAfter, isBefore, isEqual, parseISO, formatISO } from 'date-fns';

/**
 * Date Range Value Object
 *
 * Represents a time period with start and end dates.
 * Immutable and self-validating.
 *
 * Usage:
 * ```typescript
 * const range = DateRange.create(
 *   new Date('2024-01-01'),
 *   new Date('2024-12-31')
 * );
 * console.log(range.durationInDays); // 366
 * ```
 */
export class DateRange {
  private readonly _start: Date;
  private readonly _end: Date;

  private constructor(start: Date, end: Date) {
    this._start = start;
    this._end = end;
  }

  /**
   * Create DateRange from Date objects
   * @throws ValidationError if end is before start
   */
  static create(
    start: Date,
    end: Date,
    errorCode: string = 'COMMON_VAL_003'
  ): DateRange {
    if (isAfter(start, end)) {
      throw new ValidationError(
        'Start date must be before or equal to end date',
        errorCode,
        { start: start.toISOString(), end: end.toISOString() }
      );
    }

    return new DateRange(start, end);
  }

  /**
   * Create DateRange from ISO strings
   */
  static fromStrings(
    startISO: string,
    endISO: string,
    errorCode: string = 'COMMON_VAL_003'
  ): DateRange {
    try {
      const start = parseISO(startISO);
      const end = parseISO(endISO);
      return DateRange.create(start, end, errorCode);
    } catch (error) {
      throw new ValidationError(
        'Invalid date format',
        errorCode,
        { start: startISO, end: endISO, error: (error as Error).message }
      );
    }
  }

  /**
   * Get start date
   */
  get start(): Date {
    return new Date(this._start);
  }

  /**
   * Get end date
   */
  get end(): Date {
    return new Date(this._end);
  }

  /**
   * Get duration in milliseconds
   */
  get durationMs(): number {
    return this._end.getTime() - this._start.getTime();
  }

  /**
   * Get duration in days
   */
  get durationInDays(): number {
    return Math.ceil(this.durationMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if date falls within range (inclusive)
   */
  contains(date: Date): boolean {
    return !isBefore(date, this._start) && !isAfter(date, this._end);
  }

  /**
   * Check if another range overlaps with this one
   */
  overlaps(other: DateRange): boolean {
    return this.contains(other._start) ||
           this.contains(other._end) ||
           other.contains(this._start) ||
           other.contains(this._end);
  }

  /**
   * Check if this range completely contains another range
   */
  encompasses(other: DateRange): boolean {
    return !isBefore(other._start, this._start) &&
           !isAfter(other._end, this._end);
  }

  /**
   * Compare with another DateRange
   */
  equals(other: DateRange): boolean {
    return isEqual(this._start, other._start) &&
           isEqual(this._end, other._end);
  }

  /**
   * Convert to ISO string representation
   */
  toString(): string {
    return `${formatISO(this._start)} - ${formatISO(this._end)}`;
  }

  /**
   * Convert to JSON
   */
  toJSON(): { start: string; end: string } {
    return {
      start: formatISO(this._start),
      end: formatISO(this._end)
    };
  }
}
