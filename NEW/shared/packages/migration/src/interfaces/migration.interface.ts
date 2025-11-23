import { Connection, ClientSession } from 'mongoose';

/**
 * Migration status tracking
 */
export enum MigrationStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  ROLLED_BACK = 'rolled_back',
}

/**
 * Migration interface that all migrations must implement
 */
export interface IMigration {
  /**
   * Unique identifier for the migration
   */
  id: string;

  /**
   * Human-readable name/description
   */
  name: string;

  /**
   * Version number (for ordering)
   */
  version: number;

  /**
   * Timestamp when migration was created
   */
  timestamp: Date;

  /**
   * Execute the forward migration
   */
  up(connection: Connection, session?: ClientSession): Promise<void>;

  /**
   * Execute the rollback migration
   */
  down(connection: Connection, session?: ClientSession): Promise<void>;

  /**
   * Validate that migration can be applied
   */
  validate?(connection: Connection): Promise<boolean>;

  /**
   * Cleanup after migration (optional)
   */
  cleanup?(connection: Connection): Promise<void>;
}

/**
 * Migration metadata stored in database
 */
export interface MigrationDocument {
  _id?: string;
  migrationId: string;
  name: string;
  version: number;
  status: MigrationStatus;
  executedAt?: Date;
  executionTime?: number;
  error?: string;
  rollbackedAt?: Date;
  checksum: string;
  metadata?: Record<string, any>;
}

/**
 * Migration runner configuration
 */
export interface MigrationConfig {
  /**
   * MongoDB connection URI
   */
  connectionUri: string;

  /**
   * Database name
   */
  databaseName: string;

  /**
   * Collection to store migration history
   */
  migrationsCollection?: string;

  /**
   * Directory containing migration files
   */
  migrationsPath?: string;

  /**
   * File pattern for migrations
   */
  migrationPattern?: string;

  /**
   * Enable transaction support
   */
  useTransactions?: boolean;

  /**
   * Enable dry run mode
   */
  dryRun?: boolean;

  /**
   * Logger instance
   */
  logger?: IMigrationLogger;

  /**
   * Maximum retries for failed migrations
   */
  maxRetries?: number;

  /**
   * Timeout for each migration (ms)
   */
  timeout?: number;

  /**
   * Validate checksums before running
   */
  validateChecksums?: boolean;

  /**
   * Run migrations in parallel (for independent migrations)
   */
  parallel?: boolean;
}

/**
 * Migration logger interface
 */
export interface IMigrationLogger {
  info(message: string, metadata?: any): void;
  error(message: string, error?: any): void;
  warn(message: string, metadata?: any): void;
  debug(message: string, metadata?: any): void;
}

/**
 * Migration execution result
 */
export interface MigrationResult {
  migrationId: string;
  name: string;
  status: 'success' | 'failed' | 'skipped';
  executionTime: number;
  error?: Error;
}

/**
 * Batch migration result
 */
export interface BatchMigrationResult {
  successful: MigrationResult[];
  failed: MigrationResult[];
  skipped: MigrationResult[];
  totalTime: number;
}

/**
 * Migration runner interface
 */
export interface IMigrationRunner {
  /**
   * Run all pending migrations
   */
  up(target?: string): Promise<BatchMigrationResult>;

  /**
   * Rollback migrations
   */
  down(target?: string): Promise<BatchMigrationResult>;

  /**
   * Get migration status
   */
  status(): Promise<MigrationDocument[]>;

  /**
   * Validate all migrations
   */
  validate(): Promise<boolean>;

  /**
   * Create a new migration
   */
  create(name: string): Promise<string>;

  /**
   * Reset all migrations (dangerous!)
   */
  reset(): Promise<void>;

  /**
   * Get list of pending migrations
   */
  pending(): Promise<IMigration[]>;

  /**
   * Get list of executed migrations
   */
  executed(): Promise<MigrationDocument[]>;

  /**
   * Lock migrations to prevent concurrent execution
   */
  lock(): Promise<boolean>;

  /**
   * Unlock migrations
   */
  unlock(): Promise<void>;
}

/**
 * Migration lock document
 */
export interface MigrationLock {
  _id: string;
  lockedAt: Date;
  lockedBy: string;
  pid: number;
  host: string;
}

/**
 * Migration validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  migration: string;
  message: string;
  type: 'checksum' | 'missing' | 'duplicate' | 'order' | 'syntax';
}

export interface ValidationWarning {
  migration: string;
  message: string;
  type: 'deprecated' | 'performance' | 'best-practice';
}