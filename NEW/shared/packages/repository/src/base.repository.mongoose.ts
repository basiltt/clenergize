import {
  Model,
  Document,
  ClientSession,
  FilterQuery,
  UpdateQuery,
  QueryOptions as MongooseQueryOptions,
  Connection,
  Types,
} from 'mongoose';
import { BaseRepository } from './base.repository';
import {
  QueryOptions,
  PaginatedResult,
  BulkWriteResult,
  AggregateOptions,
  BulkOperation,
} from './interfaces/repository.interface';

/**
 * MongoDB/Mongoose implementation of the base repository
 *
 * Provides MongoDB-specific implementations with full transaction support
 * and optimized query patterns for document databases.
 */
export class MongooseRepository<T extends Document> extends BaseRepository<T> {
  protected readonly model: Model<T>;
  protected readonly connection: Connection;

  constructor(model: Model<T>, connection: Connection) {
    super(model.modelName);
    this.model = model;
    this.connection = connection;
  }

  /**
   * Convert QueryOptions to Mongoose options
   */
  private toMongooseOptions(options?: QueryOptions): MongooseQueryOptions {
    if (!options) return {};

    const mongooseOptions: MongooseQueryOptions = {};

    if (options.session) {
      mongooseOptions.session = options.session as ClientSession;
    }

    if (options.sort) {
      mongooseOptions.sort = this.buildSort(options.sort);
    }

    if (options.select) {
      mongooseOptions.select = options.select.join(' ');
    }

    if (options.populate) {
      mongooseOptions.populate = options.populate;
    }

    if (options.lean !== undefined) {
      mongooseOptions.lean = options.lean;
    }

    return mongooseOptions;
  }

  /**
   * Find a single document by ID
   */
  async findById(id: string, options?: QueryOptions): Promise<T | null> {
    const mongooseOptions = this.toMongooseOptions(options);

    try {
      const result = await this.model.findById(id, null, mongooseOptions);
      return result;
    } catch (error) {
      if ((error as any)?.name === 'CastError') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Find a single document matching the filter
   */
  async findOne(filter: Partial<T>, options?: QueryOptions): Promise<T | null> {
    const mongooseOptions = this.toMongooseOptions(options);
    return await this.model.findOne(filter as FilterQuery<T>, null, mongooseOptions);
  }

  /**
   * Find multiple documents matching the filter
   */
  async findMany(filter: Partial<T>, options?: QueryOptions): Promise<T[]> {
    const mongooseOptions = this.toMongooseOptions(options);
    const query = this.model.find(filter as FilterQuery<T>, null, mongooseOptions);

    if (options?.limit) {
      query.limit(options.limit);
    }

    if (options?.skip) {
      query.skip(options.skip);
    }

    return await query.exec();
  }

  /**
   * Find documents with pagination
   */
  async findWithPagination(
    filter: Partial<T>,
    page: number,
    limit: number,
    options?: QueryOptions
  ): Promise<PaginatedResult<T>> {
    this.validatePagination(page, limit);

    const skip = (page - 1) * limit;
    const mongooseOptions = this.toMongooseOptions(options);

    // Execute count and find in parallel for performance
    const [total, data] = await Promise.all([
      this.model.countDocuments(filter as FilterQuery<T>).session(mongooseOptions.session),
      this.model
        .find(filter as FilterQuery<T>, null, mongooseOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
    ]);

    const pagination = this.calculatePagination(total, page, limit);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        ...pagination,
      },
    };
  }

  /**
   * Count documents matching the filter
   */
  async count(filter: Partial<T>, options?: QueryOptions): Promise<number> {
    const mongooseOptions = this.toMongooseOptions(options);
    return await this.model.countDocuments(filter as FilterQuery<T>).session(mongooseOptions.session);
  }

  /**
   * Check if a document exists
   */
  async exists(filter: Partial<T>, options?: QueryOptions): Promise<boolean> {
    const mongooseOptions = this.toMongooseOptions(options);
    const count = await this.model
      .countDocuments(filter as FilterQuery<T>)
      .limit(1)
      .session(mongooseOptions.session);
    return count > 0;
  }

  /**
   * Create a new document
   */
  async create(data: Partial<T>, options?: QueryOptions): Promise<T> {
    const mongooseOptions = this.toMongooseOptions(options);

    const [document] = await this.model.create([data], {
      session: mongooseOptions.session,
    });

    this.emitDomainEvent(`${this.modelName}.created`, document);
    return document;
  }

  /**
   * Create multiple documents
   */
  async createMany(data: Partial<T>[], options?: QueryOptions): Promise<T[]> {
    const mongooseOptions = this.toMongooseOptions(options);

    const documents = await this.model.create(data, {
      session: mongooseOptions.session,
    });

    for (const doc of documents) {
      this.emitDomainEvent(`${this.modelName}.created`, doc);
    }

    return documents;
  }

  /**
   * Update a document by ID
   */
  async updateById(id: string, data: Partial<T>, options?: QueryOptions): Promise<T | null> {
    const mongooseOptions = this.toMongooseOptions(options);

    const document = await this.model.findByIdAndUpdate(
      id,
      data as UpdateQuery<T>,
      {
        ...mongooseOptions,
        new: true,
        runValidators: true,
      }
    );

    if (document) {
      this.emitDomainEvent(`${this.modelName}.updated`, document);
    }

    return document;
  }

  /**
   * Update a single document matching the filter
   */
  async updateOne(filter: Partial<T>, data: Partial<T>, options?: QueryOptions): Promise<T | null> {
    const mongooseOptions = this.toMongooseOptions(options);

    const document = await this.model.findOneAndUpdate(
      filter as FilterQuery<T>,
      data as UpdateQuery<T>,
      {
        ...mongooseOptions,
        new: true,
        runValidators: true,
      }
    );

    if (document) {
      this.emitDomainEvent(`${this.modelName}.updated`, document);
    }

    return document;
  }

  /**
   * Update multiple documents
   */
  async updateMany(
    filter: Partial<T>,
    data: Partial<T>,
    options?: QueryOptions
  ): Promise<{ modifiedCount: number }> {
    const mongooseOptions = this.toMongooseOptions(options);

    const result = await this.model.updateMany(
      filter as FilterQuery<T>,
      data as UpdateQuery<T>,
      {
        ...mongooseOptions,
        runValidators: true,
      }
    );

    if (result.modifiedCount > 0) {
      this.emitDomainEvent(`${this.modelName}.bulk-updated`, {
        filter,
        modifiedCount: result.modifiedCount,
      });
    }

    return { modifiedCount: result.modifiedCount };
  }

  /**
   * Upsert a document
   */
  async upsert(
    filter: Partial<T>,
    data: Partial<T>,
    options?: QueryOptions
  ): Promise<{ document: T; isNew: boolean }> {
    const mongooseOptions = this.toMongooseOptions(options);

    const document = await this.model.findOneAndUpdate(
      filter as FilterQuery<T>,
      data as UpdateQuery<T>,
      {
        ...mongooseOptions,
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    const isNew = !document.isNew;

    this.emitDomainEvent(
      `${this.modelName}.${isNew ? 'created' : 'updated'}`,
      document
    );

    return { document, isNew };
  }

  /**
   * Delete a document by ID
   */
  async deleteById(id: string, options?: QueryOptions): Promise<boolean> {
    const mongooseOptions = this.toMongooseOptions(options);

    const document = await this.model.findByIdAndDelete(id, mongooseOptions);

    if (document) {
      this.emitDomainEvent(`${this.modelName}.deleted`, { id });
      return true;
    }

    return false;
  }

  /**
   * Delete a single document matching the filter
   */
  async deleteOne(filter: Partial<T>, options?: QueryOptions): Promise<boolean> {
    const mongooseOptions = this.toMongooseOptions(options);

    const document = await this.model.findOneAndDelete(
      filter as FilterQuery<T>,
      mongooseOptions
    );

    if (document) {
      this.emitDomainEvent(`${this.modelName}.deleted`, document);
      return true;
    }

    return false;
  }

  /**
   * Delete multiple documents
   */
  async deleteMany(filter: Partial<T>, options?: QueryOptions): Promise<{ deletedCount: number }> {
    const mongooseOptions = this.toMongooseOptions(options);

    const result = await this.model.deleteMany(
      filter as FilterQuery<T>,
      mongooseOptions
    );

    if (result.deletedCount > 0) {
      this.emitDomainEvent(`${this.modelName}.bulk-deleted`, {
        filter,
        deletedCount: result.deletedCount,
      });
    }

    return { deletedCount: result.deletedCount };
  }

  /**
   * Perform bulk operations
   */
  async bulkWrite(operations: BulkOperation<T>[], options?: QueryOptions): Promise<BulkWriteResult> {
    const mongooseOptions = this.toMongooseOptions(options);

    const bulkOps = operations.map((op) => {
      switch (op.type) {
        case 'insert':
          return { insertOne: { document: op.document } };
        case 'update':
          return {
            updateOne: {
              filter: op.filter,
              update: op.update,
              upsert: op.upsert,
            },
          };
        case 'updateMany':
          return {
            updateMany: {
              filter: op.filter,
              update: op.update,
            },
          };
        case 'delete':
          return { deleteOne: { filter: op.filter } };
        case 'deleteMany':
          return { deleteMany: { filter: op.filter } };
        case 'replace':
          return {
            replaceOne: {
              filter: op.filter,
              replacement: op.replacement,
              upsert: op.upsert,
            },
          };
        default:
          throw new Error(`Unknown bulk operation type: ${(op as any).type}`);
      }
    });

    const result = await this.model.bulkWrite(bulkOps as any, {
      session: mongooseOptions.session,
    });

    this.emitDomainEvent(`${this.modelName}.bulk-operation`, result);

    return {
      insertedCount: result.insertedCount,
      modifiedCount: result.modifiedCount,
      deletedCount: result.deletedCount,
      upsertedCount: result.upsertedCount,
    };
  }

  /**
   * Run aggregation pipeline
   */
  async aggregate<R = any>(pipeline: any[], options?: AggregateOptions): Promise<R[]> {
    const aggregation = this.model.aggregate(pipeline);

    if (options?.session) {
      aggregation.session(options.session as ClientSession);
    }

    if (options?.allowDiskUse) {
      aggregation.allowDiskUse(true);
    }

    if (options?.readPreference) {
      aggregation.read(options.readPreference);
    }

    return await aggregation.exec();
  }

  /**
   * Create an index
   */
  async createIndex(index: any, options?: any): Promise<string> {
    return await this.model.collection.createIndex(index, options);
  }

  /**
   * Drop an index
   */
  async dropIndex(indexName: string): Promise<void> {
    await this.model.collection.dropIndex(indexName);
  }

  /**
   * Get all indexes
   */
  async getIndexes(): Promise<any[]> {
    return await this.model.collection.indexes();
  }

  /**
   * Start a transaction
   */
  async startTransaction(): Promise<ClientSession> {
    const session = await this.connection.startSession();
    session.startTransaction({
      readConcern: { level: 'snapshot' },
      writeConcern: { w: 'majority' },
    });
    return session;
  }

  /**
   * Execute a function within a transaction
   */
  async withTransaction<R>(
    fn: (session: ClientSession) => Promise<R>,
    options?: any
  ): Promise<R> {
    const session = await this.connection.startSession();

    try {
      let result: R;

      await session.withTransaction(async () => {
        result = await fn(session);
      }, options);

      return result!;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Helper: Convert string ID to ObjectId if needed
   */
  protected toObjectId(id: string): Types.ObjectId {
    return new Types.ObjectId(id);
  }

  /**
   * Helper: Check if a string is a valid ObjectId
   */
  protected isValidObjectId(id: string): boolean {
    return Types.ObjectId.isValid(id);
  }
}