import { BaseError } from './base.error';

/**
 * Business Logic Error
 *
 * Thrown when a business rule is violated
 * HTTP Status Code: 422 Unprocessable Entity
 *
 * Examples:
 * - Cannot delete project with active calculations
 * - Cannot assign emission factor to incompatible activity type
 * - Calculation period overlaps with existing calculation
 * - Insufficient balance for operation
 */
export class BusinessLogicError extends BaseError {
  constructor(
    message: string,
    code: string,
    details?: Record<string, any>
  ) {
    super(message, code, 422, true, details);
  }

  /**
   * Create error for rule violation
   */
  static ruleViolation(
    rule: string,
    reason: string,
    code: string
  ): BusinessLogicError {
    return new BusinessLogicError(
      `Business rule violation: ${rule}`,
      code,
      { rule, reason }
    );
  }

  /**
   * Create error for invalid state transition
   */
  static invalidStateTransition(
    entityType: string,
    currentState: string,
    targetState: string,
    code: string
  ): BusinessLogicError {
    return new BusinessLogicError(
      `Cannot transition ${entityType} from '${currentState}' to '${targetState}'`,
      code,
      { entityType, currentState, targetState }
    );
  }

  /**
   * Create error for precondition failure
   */
  static preconditionFailed(
    operation: string,
    precondition: string,
    code: string
  ): BusinessLogicError {
    return new BusinessLogicError(
      `Precondition failed for operation '${operation}': ${precondition}`,
      code,
      { operation, precondition }
    );
  }
}
