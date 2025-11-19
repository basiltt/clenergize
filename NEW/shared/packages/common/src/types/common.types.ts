/**
 * Common Types
 *
 * Shared type definitions used across all microservices
 */

/**
 * API Response Envelope
 *
 * Standard response format for all API endpoints
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata: ResponseMetadata;
}

/**
 * API Error Format (RFC 7807)
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  requestId?: string;
}

/**
 * Response Metadata
 */
export interface ResponseMetadata {
  timestamp: string;
  version: string;
  requestId: string;
  correlationId?: string;
}

/**
 * Paginated Response
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMetadata;
}

/**
 * Pagination Metadata
 */
export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Pagination Request
 */
export interface PaginationRequest {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Audit Fields
 *
 * Standard audit fields for all entities
 */
export interface AuditFields {
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string;
  version: number;
  deletedAt?: Date;
}

/**
 * Entity Base
 *
 * Base interface for all domain entities
 */
export interface Entity extends AuditFields {
  id: string;
}

/**
 * Query Filter
 */
export interface QueryFilter {
  field: string;
  operator: FilterOperator;
  value: any;
}

/**
 * Filter Operators
 */
export type FilterOperator =
  | 'eq'      // Equal
  | 'ne'      // Not equal
  | 'gt'      // Greater than
  | 'gte'     // Greater than or equal
  | 'lt'      // Less than
  | 'lte'     // Less than or equal
  | 'in'      // In array
  | 'nin'     // Not in array
  | 'contains'// String contains
  | 'startsWith' // String starts with
  | 'endsWith';  // String ends with

/**
 * Sort Options
 */
export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

/**
 * Health Check Response
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  service: string;
  version: string;
  uptime: number;
  timestamp: string;
  checks: HealthCheck[];
}

/**
 * Individual Health Check
 */
export interface HealthCheck {
  name: string;
  status: 'up' | 'down';
  responseTime?: number;
  message?: string;
  lastChecked: string;
}

/**
 * Event Metadata
 */
export interface EventMetadata {
  eventId: string;
  eventType: string;
  timestamp: string;
  correlationId: string;
  causationId?: string;
  userId?: string;
  version: number;
}

/**
 * Command Result
 */
export type Result<T, E = Error> = Success<T> | Failure<E>;

export interface Success<T> {
  success: true;
  value: T;
}

export interface Failure<E> {
  success: false;
  error: E;
}

/**
 * Type guard for Success
 */
export function isSuccess<T, E>(result: Result<T, E>): result is Success<T> {
  return result.success === true;
}

/**
 * Type guard for Failure
 */
export function isFailure<T, E>(result: Result<T, E>): result is Failure<E> {
  return result.success === false;
}

/**
 * Nullable type
 */
export type Nullable<T> = T | null;

/**
 * Optional type
 */
export type Optional<T> = T | undefined;

/**
 * Deep Partial (makes all nested properties optional)
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Constructor type
 */
export type Constructor<T = any> = new (...args: any[]) => T;
