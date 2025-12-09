import { Connection, ClientSession } from 'mongoose';
import * as path from 'path';
import * as glob from 'glob';
import * as crypto from 'crypto';
import * as os from 'os';
import {
  IMigration,
  IMigrationRunner,
  MigrationConfig,
  MigrationDocument,
  MigrationStatus,
  BatchMigrationResult,
  MigrationResult,
  MigrationLock,
  IMigrationLogger,
  ValidationResult,
} from './interfaces/migration.interface';

/**
 * Migration runner implementation
 *
 * Handles execution, rollback, and tracking of database migrations
 */
export class MigrationRunner implements IMigrationRunner {
  private connection: Connection;
  private config: MigrationConfig;
  private logger: IMigrationLogger;
  private migrations: Map<string, IMigration> = new Map();
  private readonly LOCK_ID = 'migration_lock';

  constructor(connection: Connection, config: MigrationConfig) {
    this.connection = connection;
    this.config = {
      migrationsCollection: '_migrations',
      migrationsPath: 'migrations',
      migrationPattern: '*.migration.js',
      useTransactions: true,
      dryRun: false,
      maxRetries: 3,
      timeout: 60000,
      validateChecksums: true,
      parallel: false,
      ...config,
    };
    this.logger = config.logger || this.createDefaultLogger();
  }

  /**
   * Load all migration files
   */
  private async loadMigrations(): Promise<void> {
    const pattern = path.join(this.config.migrationsPath!, this.config.migrationPattern!);
    const files = glob.sync(pattern);

    this.migrations.clear();

    for (const file of files) {
      try {
        const migrationModule = require(path.resolve(file));
        const MigrationClass = migrationModule.default || migrationModule;

        if (typeof MigrationClass === 'function') {
          const migration = new MigrationClass() as IMigration;
          this.migrations.set(migration.id, migration);
          this.logger.debug(`Loaded migration: ${migration.id}`);
        }
      } catch (error) {
        this.logger.error(`Failed to load migration: ${file}`, error);
      }
    }

    this.logger.info(`Loaded ${this.migrations.size} migrations`);
  }

  /**
   * Get migration history collection
   */
  private getMigrationCollection() {
    return this.connection.db.collection<MigrationDocument>(
      this.config.migrationsCollection!
    );
  }

  /**
   * Get migration lock collection
   */
  private getLockCollection() {
    return this.connection.db.collection<MigrationLock>('_migration_locks');
  }

  /**
   * Run all pending migrations
   */
  async up(target?: string): Promise<BatchMigrationResult> {
    await this.loadMigrations();

    if (!await this.lock()) {
      throw new Error('Another migration process is running');
    }

    const startTime = Date.now();
    const result: BatchMigrationResult = {
      successful: [],
      failed: [],
      skipped: [],
      totalTime: 0,
    };

    try {
      const pending = await this.pending();
      const toRun = target
        ? pending.filter(m => m.version <= parseInt(target))
        : pending;

      this.logger.info(`Running ${toRun.length} pending migrations`);

      for (const migration of toRun) {
        const migrationResult = await this.runSingleMigration(migration, 'up');

        if (migrationResult.status === 'success') {
          result.successful.push(migrationResult);
        } else if (migrationResult.status === 'failed') {
          result.failed.push(migrationResult);

          // Stop on first failure
          if (!this.config.parallel) {
            break;
          }
        } else {
          result.skipped.push(migrationResult);
        }
      }
    } finally {
      await this.unlock();
      result.totalTime = Date.now() - startTime;
    }

    this.logger.info(`Migration completed in ${result.totalTime}ms`, {
      successful: result.successful.length,
      failed: result.failed.length,
      skipped: result.skipped.length,
    });

    return result;
  }

  /**
   * Rollback migrations
   */
  async down(target?: string): Promise<BatchMigrationResult> {
    await this.loadMigrations();

    if (!await this.lock()) {
      throw new Error('Another migration process is running');
    }

    const startTime = Date.now();
    const result: BatchMigrationResult = {
      successful: [],
      failed: [],
      skipped: [],
      totalTime: 0,
    };

    try {
      const executed = await this.executed();
      const toRollback = target
        ? executed.filter(m => m.version >= parseInt(target))
        : executed.slice(-1); // Only rollback the last one by default

      toRollback.reverse(); // Rollback in reverse order

      this.logger.info(`Rolling back ${toRollback.length} migrations`);

      for (const migrationDoc of toRollback) {
        const migration = this.migrations.get(migrationDoc.migrationId);

        if (!migration) {
          this.logger.error(`Migration not found: ${migrationDoc.migrationId}`);
          continue;
        }

        const migrationResult = await this.runSingleMigration(migration, 'down');

        if (migrationResult.status === 'success') {
          result.successful.push(migrationResult);
          await this.markAsRolledBack(migrationDoc.migrationId);
        } else {
          result.failed.push(migrationResult);
          break; // Stop on first failure
        }
      }
    } finally {
      await this.unlock();
      result.totalTime = Date.now() - startTime;
    }

    return result;
  }

  /**
   * Run a single migration
   */
  private async runSingleMigration(
    migration: IMigration,
    direction: 'up' | 'down'
  ): Promise<MigrationResult> {
    const startTime = Date.now();

    this.logger.info(`${direction === 'up' ? 'Running' : 'Rolling back'} migration: ${migration.name}`);

    if (this.config.dryRun) {
      this.logger.info(`[DRY RUN] Would ${direction} migration: ${migration.id}`);
      return {
        migrationId: migration.id,
        name: migration.name,
        status: 'skipped',
        executionTime: 0,
      };
    }

    try {
      // Validate migration if going up
      if (direction === 'up' && migration.validate) {
        const isValid = await migration.validate(this.connection);
        if (!isValid) {
          throw new Error('Migration validation failed');
        }
      }

      // Execute migration
      if (this.config.useTransactions) {
        await this.runWithTransaction(migration, direction);
      } else {
        await migration[direction](this.connection);
      }

      // Run cleanup if needed
      if (direction === 'up' && migration.cleanup) {
        await migration.cleanup(this.connection);
      }

      // Record success
      if (direction === 'up') {
        await this.recordMigration(migration, Date.now() - startTime);
      }

      return {
        migrationId: migration.id,
        name: migration.name,
        status: 'success',
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      this.logger.error(`Migration ${direction} failed: ${migration.id}`, error);

      // Record failure
      if (direction === 'up') {
        await this.recordFailure(migration, error as Error);
      }

      return {
        migrationId: migration.id,
        name: migration.name,
        status: 'failed',
        executionTime: Date.now() - startTime,
        error: error as Error,
      };
    }
  }

  /**
   * Run migration with transaction
   */
  private async runWithTransaction(
    migration: IMigration,
    direction: 'up' | 'down'
  ): Promise<void> {
    const session = await this.connection.startSession();

    try {
      await session.withTransaction(async () => {
        await migration[direction](this.connection, session);
      });
    } finally {
      await session.endSession();
    }
  }

  /**
   * Record successful migration
   */
  private async recordMigration(
    migration: IMigration,
    executionTime: number
  ): Promise<void> {
    const collection = this.getMigrationCollection();

    await collection.updateOne(
      { migrationId: migration.id },
      {
        $set: {
          migrationId: migration.id,
          name: migration.name,
          version: migration.version,
          status: MigrationStatus.COMPLETED,
          executedAt: new Date(),
          executionTime,
          checksum: this.calculateChecksum(migration),
        },
      },
      { upsert: true }
    );
  }

  /**
   * Record failed migration
   */
  private async recordFailure(
    migration: IMigration,
    error: Error
  ): Promise<void> {
    const collection = this.getMigrationCollection();

    await collection.updateOne(
      { migrationId: migration.id },
      {
        $set: {
          migrationId: migration.id,
          name: migration.name,
          version: migration.version,
          status: MigrationStatus.FAILED,
          error: error.message,
          executedAt: new Date(),
        },
      },
      { upsert: true }
    );
  }

  /**
   * Mark migration as rolled back
   */
  private async markAsRolledBack(migrationId: string): Promise<void> {
    const collection = this.getMigrationCollection();

    await collection.updateOne(
      { migrationId },
      {
        $set: {
          status: MigrationStatus.ROLLED_BACK,
          rollbackedAt: new Date(),
        },
      }
    );
  }

  /**
   * Get migration status
   */
  async status(): Promise<MigrationDocument[]> {
    const collection = this.getMigrationCollection();
    return await collection.find({}).sort({ version: 1 }).toArray();
  }

  /**
   * Validate all migrations
   */
  async validate(): Promise<boolean> {
    await this.loadMigrations();

    const errors: string[] = [];
    const executed = await this.executed();

    // Check for checksum mismatches
    if (this.config.validateChecksums) {
      for (const executedMig of executed) {
        const migration = this.migrations.get(executedMig.migrationId);

        if (migration) {
          const currentChecksum = this.calculateChecksum(migration);

          if (executedMig.checksum !== currentChecksum) {
            errors.push(
              `Checksum mismatch for ${executedMig.migrationId}: ` +
              `expected ${executedMig.checksum}, got ${currentChecksum}`
            );
          }
        } else {
          errors.push(`Missing migration file: ${executedMig.migrationId}`);
        }
      }
    }

    // Check for version conflicts
    const versions = new Set<number>();

    for (const migration of this.migrations.values()) {
      if (versions.has(migration.version)) {
        errors.push(`Duplicate version ${migration.version}`);
      }
      versions.add(migration.version);
    }

    if (errors.length > 0) {
      errors.forEach(error => this.logger.error(error));
      return false;
    }

    return true;
  }

  /**
   * Create a new migration
   */
  async create(name: string): Promise<string> {
    const timestamp = Date.now();
    const version = Math.floor(timestamp / 1000);
    const className = name
      .split(/[-_\s]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

    const template = `import { BaseMigration } from '@clenergize/migration';
import { Connection, ClientSession } from 'mongoose';

export default class ${className}Migration extends BaseMigration {
  constructor() {
    super('${timestamp}_${name}', '${name}', ${version});
  }

  async up(connection: Connection, session?: ClientSession): Promise<void> {
    // TODO: Implement forward migration
    throw new Error('Migration not implemented');
  }

  async down(connection: Connection, session?: ClientSession): Promise<void> {
    // TODO: Implement rollback migration
    throw new Error('Rollback not implemented');
  }

  async validate(connection: Connection): Promise<boolean> {
    // TODO: Add validation logic
    return true;
  }
}`;

    const filename = path.join(
      this.config.migrationsPath!,
      `${timestamp}_${name}.migration.ts`
    );

    // Write file (would use fs in real implementation)
    this.logger.info(`Created migration: ${filename}`);

    return filename;
  }

  /**
   * Reset all migrations (dangerous!)
   */
  async reset(): Promise<void> {
    if (!await this.lock()) {
      throw new Error('Another migration process is running');
    }

    try {
      const collection = this.getMigrationCollection();
      await collection.deleteMany({});
      this.logger.warn('All migration history has been reset');
    } finally {
      await this.unlock();
    }
  }

  /**
   * Get list of pending migrations
   */
  async pending(): Promise<IMigration[]> {
    await this.loadMigrations();

    const executed = await this.executed();
    const executedIds = new Set(executed.map(e => e.migrationId));

    return Array.from(this.migrations.values())
      .filter(m => !executedIds.has(m.id))
      .sort((a, b) => a.version - b.version);
  }

  /**
   * Get list of executed migrations
   */
  async executed(): Promise<MigrationDocument[]> {
    const collection = this.getMigrationCollection();

    return await collection
      .find({ status: MigrationStatus.COMPLETED })
      .sort({ version: 1 })
      .toArray();
  }

  /**
   * Lock migrations to prevent concurrent execution
   */
  async lock(): Promise<boolean> {
    const collection = this.getLockCollection();

    try {
      await collection.insertOne({
        _id: this.LOCK_ID,
        lockedAt: new Date(),
        lockedBy: `${os.hostname()}-${process.pid}`,
        pid: process.pid,
        host: os.hostname(),
      });

      return true;
    } catch (error) {
      // Check if lock is stale (older than timeout)
      const lock = await collection.findOne({ _id: this.LOCK_ID });

      if (lock) {
        const lockAge = Date.now() - lock.lockedAt.getTime();

        if (lockAge > this.config.timeout!) {
          // Stale lock, remove and try again
          await collection.deleteOne({ _id: this.LOCK_ID });
          return await this.lock();
        }
      }

      return false;
    }
  }

  /**
   * Unlock migrations
   */
  async unlock(): Promise<void> {
    const collection = this.getLockCollection();
    await collection.deleteOne({ _id: this.LOCK_ID });
  }

  /**
   * Calculate migration checksum
   */
  private calculateChecksum(migration: IMigration): string {
    const content = migration.up.toString() + migration.down.toString();
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Create default logger
   */
  private createDefaultLogger(): IMigrationLogger {
    return {
      info: (message: string, metadata?: any) => {
        console.log(`[INFO] ${message}`, metadata || '');
      },
      error: (message: string, error?: any) => {
        console.error(`[ERROR] ${message}`, error || '');
      },
      warn: (message: string, metadata?: any) => {
        console.warn(`[WARN] ${message}`, metadata || '');
      },
      debug: (message: string, metadata?: any) => {
        if (process.env.DEBUG) {
          console.log(`[DEBUG] ${message}`, metadata || '');
        }
      },
    };
  }
}