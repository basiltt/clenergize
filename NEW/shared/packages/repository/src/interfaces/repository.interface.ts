import { ClientSession } from 'mongoose';

/**
 * Query options for repository operations
 */
export interface QueryOptions {
  /**
   * Fields to select (projection)
   */
  select?: string | string[] | Record<string, 0 | 1>;

  /**
   * Sort criteria
   */
  sort?: Record<string, 1 | -1> | string;

  /**
   * Number of documents to skip
   */
  skip?: number;

  /**
   * Maximum number of documents to return
   */
  limit?: number;

  /**
   * Population options for references
   */
  populate?: string | string[] | PopulateOptions | PopulateOptions[];

  /**
   * Include soft-deleted documents
   */
  includeDeleted?: boolean;

  /**
   * MongoDB session for transactions
   */
  session?: ClientSession;

  /**
   * Use lean queries (returns POJOs instead of Mongoose documents)
   */
  lean?: boolean;
}

/**
 * Population options for nested references
 */
export interface PopulateOptions {
  path: string;
  select?: string;
  model?: string;
  populate?: PopulateOptions | PopulateOptions[];
  match?: any;
  options?: any;
}

/**
 * Pagination result
 */
export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page: number;
  pageSize: number;
  sort?: Record<string, 1 | -1> | string;
  populate?: string | string[] | PopulateOptions | PopulateOptions[];
}

/**
 * Bulk write operation
 */
export interface BulkWriteOperation<T> {
  insertOne?: { document: Partial<T> };
  updateOne?: { filter: any; update: any; upsert?: boolean };
  updateMany?: { filter: any; update: any };
  deleteOne?: { filter: any };
  deleteMany?: { filter: any };
  replaceOne?: { filter: any; replacement: T; upsert?: boolean };
}

/**
 * Aggregate pipeline stage
 */
export type PipelineStage = Record<string, any>;

/**
 * Base repository interface
 */
export interface IRepository<T> {
  /**
   * Find a document by ID
   */
  findById(id: string, options?: QueryOptions): Promise<T | null>;

  /**
   * Find a single document matching the filter
   */
  findOne(filter: Partial<T> | any, options?: QueryOptions): Promise<T | null>;

  /**
   * Find all documents matching the filter
   */
  find(filter?: Partial<T> | any, options?: QueryOptions): Promise<T[]>;

  /**
   * Find documents with pagination
   */
  findPaginated(
    filter: Partial<T> | any,
    options: PaginationOptions
  ): Promise<PaginationResult<T>>;

  /**
   * Count documents matching the filter
   */
  count(filter?: Partial<T> | any, options?: QueryOptions): Promise<number>;

  /**
   * Check if a document exists
   */
  exists(filter: Partial<T> | any, options?: QueryOptions): Promise<boolean>;

  /**
   * Create a new document
   */
  create(data: Partial<T>, options?: QueryOptions): Promise<T>;

  /**
   * Create multiple documents
   */
  createMany(data: Partial<T>[], options?: QueryOptions): Promise<T[]>;

  /**
   * Update a document by ID
   */
  updateById(
    id: string,
    update: Partial<T> | any,
    options?: QueryOptions
  ): Promise<T | null>;

  /**
   * Update a single document matching the filter
   */
  updateOne(
    filter: Partial<T> | any,
    update: Partial<T> | any,
    options?: QueryOptions
  ): Promise<T | null>;

  /**
   * Update multiple documents matching the filter
   */
  updateMany(
    filter: Partial<T> | any,
    update: Partial<T> | any,
    options?: QueryOptions
  ): Promise<{ modifiedCount: number; matchedCount: number }>;

  /**
   * Find and update a document atomically
   */
  findOneAndUpdate(
    filter: Partial<T> | any,
    update: Partial<T> | any,
    options?: QueryOptions & { upsert?: boolean; new?: boolean }
  ): Promise<T | null>;

  /**
   * Delete a document by ID (soft delete by default)
   */
  deleteById(id: string, options?: QueryOptions & { hard?: boolean }): Promise<T | null>;

  /**
   * Delete a single document matching the filter
   */
  deleteOne(
    filter: Partial<T> | any,
    options?: QueryOptions & { hard?: boolean }
  ): Promise<T | null>;

  /**
   * Delete multiple documents matching the filter
   */
  deleteMany(
    filter: Partial<T> | any,
    options?: QueryOptions & { hard?: boolean }
  ): Promise<{ deletedCount: number }>;

  /**
   * Restore a soft-deleted document
   */
  restore(filter: Partial<T> | any, options?: QueryOptions): Promise<T | null>;

  /**
   * Restore multiple soft-deleted documents
   */
  restoreMany(
    filter: Partial<T> | any,
    options?: QueryOptions
  ): Promise<{ restoredCount: number }>;

  /**
   * Perform bulk write operations
   */
  bulkWrite(
    operations: BulkWriteOperation<T>[],
    options?: QueryOptions & { ordered?: boolean }
  ): Promise<{
    insertedCount: number;
    modifiedCount: number;
    deletedCount: number;
  }>;

  /**
   * Execute an aggregation pipeline
   */
  aggregate<R = any>(pipeline: PipelineStage[], options?: QueryOptions): Promise<R[]>;

  /**
   * Get distinct values for a field
   */
  distinct<K extends keyof T>(
    field: K,
    filter?: Partial<T> | any,
    options?: QueryOptions
  ): Promise<T[K][]>;

  /**
   * Start a database transaction
   */
  startTransaction(): Promise<ClientSession>;

  /**
   * Execute operations within a transaction
   */
  withTransaction<R>(
    fn: (session: ClientSession) => Promise<R>
  ): Promise<R>;

  /**
   * Create indexes
   */
  createIndex(
    index: Record<string, 1 | -1 | 'text'>,
    options?: {
      unique?: boolean;
      sparse?: boolean;
      background?: boolean;
      expireAfterSeconds?: number;
      name?: string;
    }
  ): Promise<string>;

  /**
   * Drop an index
   */
  dropIndex(indexName: string): Promise<void>;

  /**
   * Get collection statistics
   */
  getStats(): Promise<{
    count: number;
    size: number;
    avgObjSize: number;
    storageSize: number;
    indexes: number;
  }>;
}

/**
 * Repository with event publishing
 */
export interface IEventRepository<T> extends IRepository<T> {
  /**
   * Publish domain events after successful operations
   */
  publishEvents(): Promise<void>;

  /**
   * Get pending events
   */
  getPendingEvents(): any[];

  /**
   * Clear pending events
   */
  clearEvents(): void;
}

/**
 * Repository with caching support
 */
export interface ICacheableRepository<T> extends IRepository<T> {
  /**
   * Invalidate cache for a specific key
   */
  invalidateCache(key: string): Promise<void>;

  /**
   * Clear all cache entries
   */
  clearCache(): Promise<void>;

  /**
   * Get from cache or fetch from database
   */
  getOrSet(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T>;
}