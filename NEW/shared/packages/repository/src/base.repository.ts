import {
  IRepository,
  QueryOptions,
  PaginatedResult,
  BulkWriteResult,
  AggregateOptions,
  BulkOperation
} from './interfaces/repository.interface';
import { EventEmitter } from 'events';

/**
 * Abstract base repository implementing common functionality
 *
 * Provides a foundation for all repository implementations with:
 * - Standard CRUD operations
 * - Transaction support
 * - Event emission for domain events
 * - Pagination and filtering
 * - Bulk operations
 */
export abstract class BaseRepository<T> extends EventEmitter implements IRepository<T> {
  protected readonly modelName: string;

  constructor(modelName: string) {
    super();
    this.modelName = modelName;
  }

  /**
   * Find a single document by ID
   */
  abstract findById(id: string, options?: QueryOptions): Promise<T | null>;

  /**
   * Find a single document matching the filter
   */
  abstract findOne(filter: Partial<T>, options?: QueryOptions): Promise<T | null>;

  /**
   * Find multiple documents matching the filter
   */
  abstract findMany(filter: Partial<T>, options?: QueryOptions): Promise<T[]>;

  /**
   * Find documents with pagination
   */
  abstract findWithPagination(
    filter: Partial<T>,
    page: number,
    limit: number,
    options?: QueryOptions
  ): Promise<PaginatedResult<T>>;

  /**
   * Count documents matching the filter
   */
  abstract count(filter: Partial<T>, options?: QueryOptions): Promise<number>;

  /**
   * Check if a document exists
   */
  abstract exists(filter: Partial<T>, options?: QueryOptions): Promise<boolean>;

  /**
   * Create a new document
   */
  abstract create(data: Partial<T>, options?: QueryOptions): Promise<T>;

  /**
   * Create multiple documents
   */
  abstract createMany(data: Partial<T>[], options?: QueryOptions): Promise<T[]>;

  /**
   * Update a document by ID
   */
  abstract updateById(id: string, data: Partial<T>, options?: QueryOptions): Promise<T | null>;

  /**
   * Update a single document matching the filter
   */
  abstract updateOne(filter: Partial<T>, data: Partial<T>, options?: QueryOptions): Promise<T | null>;

  /**
   * Update multiple documents
   */
  abstract updateMany(
    filter: Partial<T>,
    data: Partial<T>,
    options?: QueryOptions
  ): Promise<{ modifiedCount: number }>;

  /**
   * Upsert a document
   */
  abstract upsert(
    filter: Partial<T>,
    data: Partial<T>,
    options?: QueryOptions
  ): Promise<{ document: T; isNew: boolean }>;

  /**
   * Delete a document by ID
   */
  abstract deleteById(id: string, options?: QueryOptions): Promise<boolean>;

  /**
   * Delete a single document matching the filter
   */
  abstract deleteOne(filter: Partial<T>, options?: QueryOptions): Promise<boolean>;

  /**
   * Delete multiple documents
   */
  abstract deleteMany(filter: Partial<T>, options?: QueryOptions): Promise<{ deletedCount: number }>;

  /**
   * Perform bulk operations
   */
  abstract bulkWrite(operations: BulkOperation<T>[], options?: QueryOptions): Promise<BulkWriteResult>;

  /**
   * Run aggregation pipeline
   */
  abstract aggregate<R = any>(pipeline: any[], options?: AggregateOptions): Promise<R[]>;

  /**
   * Create indexes
   */
  abstract createIndex(index: any, options?: any): Promise<string>;

  /**
   * Drop an index
   */
  abstract dropIndex(indexName: string): Promise<void>;

  /**
   * Get all indexes
   */
  abstract getIndexes(): Promise<any[]>;

  /**
   * Start a transaction (if supported)
   */
  abstract startTransaction(): Promise<any>;

  /**
   * Execute a function within a transaction
   */
  abstract withTransaction<R>(
    fn: (session: any) => Promise<R>,
    options?: any
  ): Promise<R>;

  /**
   * Emit a domain event
   */
  protected emitDomainEvent(eventType: string, data: any): void {
    this.emit('domain-event', {
      type: eventType,
      modelName: this.modelName,
      data,
      timestamp: new Date(),
    });
  }

  /**
   * Helper: Build sort object from string
   * @example "name,-createdAt" => { name: 1, createdAt: -1 }
   */
  protected buildSort(sortString?: string): Record<string, 1 | -1> {
    if (!sortString) return {};

    const sort: Record<string, 1 | -1> = {};
    const fields = sortString.split(',');

    for (const field of fields) {
      const trimmed = field.trim();
      if (trimmed.startsWith('-')) {
        sort[trimmed.substring(1)] = -1;
      } else {
        sort[trimmed] = 1;
      }
    }

    return sort;
  }

  /**
   * Helper: Build projection object from field array
   * @example ["name", "email"] => { name: 1, email: 1 }
   */
  protected buildProjection(fields?: string[]): Record<string, 0 | 1> {
    if (!fields || fields.length === 0) return {};

    const projection: Record<string, 0 | 1> = {};
    for (const field of fields) {
      if (field.startsWith('-')) {
        projection[field.substring(1)] = 0;
      } else {
        projection[field] = 1;
      }
    }

    return projection;
  }

  /**
   * Helper: Calculate pagination metadata
   */
  protected calculatePagination(
    total: number,
    page: number,
    limit: number
  ): {
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } {
    const totalPages = Math.ceil(total / limit);
    return {
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  /**
   * Helper: Validate pagination parameters
   */
  protected validatePagination(page: number, limit: number): void {
    if (page < 1) {
      throw new Error('Page number must be greater than 0');
    }
    if (limit < 1 || limit > 1000) {
      throw new Error('Limit must be between 1 and 1000');
    }
  }
}