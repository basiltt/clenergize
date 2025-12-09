import { ClientSession } from 'mongoose';
import { IRepository } from './repository.interface';

/**
 * Unit of Work pattern for managing transactions across multiple repositories
 *
 * Ensures that all database operations within a business transaction
 * either complete successfully or are rolled back together.
 */
export interface IUnitOfWork {
  /**
   * Get or create a session for the unit of work
   */
  getSession(): ClientSession;

  /**
   * Start a new transaction
   */
  startTransaction(): Promise<void>;

  /**
   * Commit the current transaction
   */
  commit(): Promise<void>;

  /**
   * Rollback the current transaction
   */
  rollback(): Promise<void>;

  /**
   * Execute a function within a transaction
   */
  execute<T>(work: (uow: IUnitOfWork) => Promise<T>): Promise<T>;

  /**
   * Get a repository for a specific model
   */
  getRepository<T>(modelName: string): IRepository<T>;

  /**
   * Register a repository with the unit of work
   */
  registerRepository(modelName: string, repository: IRepository<any>): void;

  /**
   * Check if a transaction is active
   */
  isTransactionActive(): boolean;

  /**
   * Dispose of resources (end session)
   */
  dispose(): Promise<void>;
}

/**
 * Unit of Work factory
 */
export interface IUnitOfWorkFactory {
  /**
   * Create a new unit of work instance
   */
  create(): Promise<IUnitOfWork>;
}

/**
 * Transaction options
 */
export interface TransactionOptions {
  /**
   * Read concern level
   */
  readConcern?: {
    level: 'local' | 'available' | 'majority' | 'linearizable' | 'snapshot';
  };

  /**
   * Write concern
   */
  writeConcern?: {
    w?: number | 'majority';
    j?: boolean;
    wtimeout?: number;
  };

  /**
   * Read preference
   */
  readPreference?: 'primary' | 'primaryPreferred' | 'secondary' | 'secondaryPreferred' | 'nearest';

  /**
   * Maximum time to wait for transaction commit
   */
  maxCommitTimeMS?: number;
}

/**
 * Transactional operation result
 */
export interface TransactionResult<T> {
  /**
   * The result of the transaction
   */
  result: T;

  /**
   * Whether the transaction was committed
   */
  committed: boolean;

  /**
   * Error if transaction failed
   */
  error?: Error;

  /**
   * Retry attempts made
   */
  retryAttempts?: number;
}

/**
 * Transaction coordinator for distributed transactions
 */
export interface ITransactionCoordinator {
  /**
   * Begin a distributed transaction
   */
  beginTransaction(transactionId: string): Promise<void>;

  /**
   * Register a participant in the transaction
   */
  registerParticipant(
    transactionId: string,
    participantId: string,
    callback: () => Promise<void>
  ): void;

  /**
   * Prepare phase of two-phase commit
   */
  prepare(transactionId: string): Promise<boolean>;

  /**
   * Commit phase of two-phase commit
   */
  commit(transactionId: string): Promise<void>;

  /**
   * Rollback the transaction
   */
  rollback(transactionId: string): Promise<void>;

  /**
   * Get transaction status
   */
  getStatus(transactionId: string): Promise<'pending' | 'prepared' | 'committed' | 'aborted'>;
}

/**
 * Saga pattern for long-running transactions
 */
export interface ISaga<T> {
  /**
   * Saga identifier
   */
  id: string;

  /**
   * Saga state
   */
  state: 'started' | 'running' | 'compensating' | 'completed' | 'failed';

  /**
   * Execute the saga
   */
  execute(): Promise<T>;

  /**
   * Compensate (rollback) the saga
   */
  compensate(): Promise<void>;

  /**
   * Add a step to the saga
   */
  addStep(step: ISagaStep): void;

  /**
   * Get saga execution log
   */
  getLog(): SagaLogEntry[];
}

/**
 * Saga step definition
 */
export interface ISagaStep {
  /**
   * Step name
   */
  name: string;

  /**
   * Execute the step
   */
  execute(): Promise<any>;

  /**
   * Compensate (rollback) the step
   */
  compensate(): Promise<void>;

  /**
   * Retry policy for the step
   */
  retryPolicy?: {
    maxAttempts: number;
    backoffMs: number;
  };
}

/**
 * Saga execution log entry
 */
export interface SagaLogEntry {
  timestamp: Date;
  step: string;
  action: 'execute' | 'compensate';
  status: 'started' | 'completed' | 'failed';
  error?: string;
  duration?: number;
}