import { Connection, ClientSession } from 'mongoose';
import { IMigration } from './interfaces/migration.interface';
import * as crypto from 'crypto';

/**
 * Abstract base class for all migrations
 *
 * Provides common functionality and ensures consistent migration structure
 */
export abstract class BaseMigration implements IMigration {
  public readonly id: string;
  public readonly name: string;
  public readonly version: number;
  public readonly timestamp: Date;

  constructor(id: string, name: string, version: number) {
    this.id = id;
    this.name = name;
    this.version = version;
    this.timestamp = new Date();
  }

  /**
   * Execute the forward migration
   */
  abstract up(connection: Connection, session?: ClientSession): Promise<void>;

  /**
   * Execute the rollback migration
   */
  abstract down(connection: Connection, session?: ClientSession): Promise<void>;

  /**
   * Validate that migration can be applied
   * Override this method to add custom validation
   */
  async validate(connection: Connection): Promise<boolean> {
    return true;
  }

  /**
   * Cleanup after migration
   * Override this method to add custom cleanup logic
   */
  async cleanup(connection: Connection): Promise<void> {
    // Default: no cleanup needed
  }

  /**
   * Generate checksum for the migration
   */
  public getChecksum(): string {
    const content = `${this.id}-${this.name}-${this.version}`;
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Helper: Check if collection exists
   */
  protected async collectionExists(
    connection: Connection,
    collectionName: string
  ): Promise<boolean> {
    const collections = await connection.db.listCollections().toArray();
    return collections.some(col => col.name === collectionName);
  }

  /**
   * Helper: Create collection with options
   */
  protected async createCollection(
    connection: Connection,
    collectionName: string,
    options?: any,
    session?: ClientSession
  ): Promise<void> {
    const exists = await this.collectionExists(connection, collectionName);
    if (!exists) {
      await connection.db.createCollection(collectionName, {
        ...options,
        session,
      });
    }
  }

  /**
   * Helper: Drop collection
   */
  protected async dropCollection(
    connection: Connection,
    collectionName: string,
    session?: ClientSession
  ): Promise<void> {
    const exists = await this.collectionExists(connection, collectionName);
    if (exists) {
      await connection.db.collection(collectionName).drop({ session });
    }
  }

  /**
   * Helper: Create index
   */
  protected async createIndex(
    connection: Connection,
    collectionName: string,
    index: any,
    options?: any,
    session?: ClientSession
  ): Promise<void> {
    await connection.db
      .collection(collectionName)
      .createIndex(index, { ...options, session });
  }

  /**
   * Helper: Drop index
   */
  protected async dropIndex(
    connection: Connection,
    collectionName: string,
    indexName: string,
    session?: ClientSession
  ): Promise<void> {
    await connection.db
      .collection(collectionName)
      .dropIndex(indexName, { session });
  }

  /**
   * Helper: Rename collection
   */
  protected async renameCollection(
    connection: Connection,
    oldName: string,
    newName: string,
    session?: ClientSession
  ): Promise<void> {
    await connection.db
      .collection(oldName)
      .rename(newName, { session });
  }

  /**
   * Helper: Add field to all documents
   */
  protected async addField(
    connection: Connection,
    collectionName: string,
    fieldName: string,
    defaultValue: any,
    session?: ClientSession
  ): Promise<number> {
    const result = await connection.db
      .collection(collectionName)
      .updateMany(
        { [fieldName]: { $exists: false } },
        { $set: { [fieldName]: defaultValue } },
        { session }
      );

    return result.modifiedCount;
  }

  /**
   * Helper: Remove field from all documents
   */
  protected async removeField(
    connection: Connection,
    collectionName: string,
    fieldName: string,
    session?: ClientSession
  ): Promise<number> {
    const result = await connection.db
      .collection(collectionName)
      .updateMany(
        {},
        { $unset: { [fieldName]: '' } },
        { session }
      );

    return result.modifiedCount;
  }

  /**
   * Helper: Rename field
   */
  protected async renameField(
    connection: Connection,
    collectionName: string,
    oldFieldName: string,
    newFieldName: string,
    session?: ClientSession
  ): Promise<number> {
    const result = await connection.db
      .collection(collectionName)
      .updateMany(
        { [oldFieldName]: { $exists: true } },
        { $rename: { [oldFieldName]: newFieldName } },
        { session }
      );

    return result.modifiedCount;
  }

  /**
   * Helper: Batch process documents
   */
  protected async batchProcess<T>(
    connection: Connection,
    collectionName: string,
    batchSize: number,
    processor: (batch: T[]) => Promise<void>,
    filter: any = {},
    session?: ClientSession
  ): Promise<number> {
    const collection = connection.db.collection(collectionName);
    const cursor = collection.find(filter, { session });

    let processed = 0;
    let batch: T[] = [];

    for await (const doc of cursor) {
      batch.push(doc as T);

      if (batch.length >= batchSize) {
        await processor(batch);
        processed += batch.length;
        batch = [];
      }
    }

    if (batch.length > 0) {
      await processor(batch);
      processed += batch.length;
    }

    return processed;
  }

  /**
   * Helper: Run aggregation pipeline
   */
  protected async aggregate(
    connection: Connection,
    collectionName: string,
    pipeline: any[],
    session?: ClientSession
  ): Promise<any[]> {
    return await connection.db
      .collection(collectionName)
      .aggregate(pipeline, { session })
      .toArray();
  }

  /**
   * Helper: Bulk write operations
   */
  protected async bulkWrite(
    connection: Connection,
    collectionName: string,
    operations: any[],
    session?: ClientSession
  ): Promise<any> {
    return await connection.db
      .collection(collectionName)
      .bulkWrite(operations, { session });
  }

  /**
   * Log migration step
   */
  protected log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [Migration ${this.id}]`;

    switch (level) {
      case 'error':
        console.error(`${prefix} ERROR: ${message}`);
        break;
      case 'warn':
        console.warn(`${prefix} WARN: ${message}`);
        break;
      default:
        console.log(`${prefix} INFO: ${message}`);
    }
  }
}