import { ClientSession, Connection } from 'mongoose';
import {
  IUnitOfWork,
  IUnitOfWorkFactory,
  TransactionOptions,
  TransactionResult,
} from './interfaces/unit-of-work.interface';
import { IRepository } from './interfaces/repository.interface';
import { Logger } from '@nestjs/common';

/**
 * MongoDB implementation of Unit of Work pattern
 *
 * Manages database transactions across multiple repositories,
 * ensuring data consistency and atomicity.
 */
export class MongooseUnitOfWork implements IUnitOfWork {
  private readonly logger = new Logger(MongooseUnitOfWork.name);
  private session: ClientSession | null = null;
  private repositories = new Map<string, IRepository<any>>();
  private isActive = false;

  constructor(private readonly connection: Connection) {}

  /**
   * Get or create a session for the unit of work
   */
  getSession(): ClientSession {
    if (!this.session) {
      throw new Error('No active session. Call startTransaction() first.');
    }
    return this.session;
  }

  /**
   * Start a new transaction
   */
  async startTransaction(options?: TransactionOptions): Promise<void> {
    if (this.isActive) {
      throw new Error('Transaction already active');
    }

    this.session = await this.connection.startSession();

    const transactionOptions: any = {
      readConcern: { level: options?.readConcern?.level || 'snapshot' },
      writeConcern: {
        w: options?.writeConcern?.w || 'majority',
        j: options?.writeConcern?.j || true,
        wtimeout: options?.writeConcern?.wtimeout || 10000,
      },
    };

    if (options?.readPreference) {
      transactionOptions.readPreference = options.readPreference;
    }

    if (options?.maxCommitTimeMS) {
      transactionOptions.maxCommitTimeMS = options.maxCommitTimeMS;
    }

    this.session.startTransaction(transactionOptions);
    this.isActive = true;

    this.logger.debug('Transaction started', {
      sessionId: this.session.id,
      options: transactionOptions,
    });
  }

  /**
   * Commit the current transaction
   */
  async commit(): Promise<void> {
    if (!this.session || !this.isActive) {
      throw new Error('No active transaction to commit');
    }

    try {
      await this.session.commitTransaction();
      this.logger.debug('Transaction committed', {
        sessionId: this.session.id,
      });
    } catch (error) {
      this.logger.error('Failed to commit transaction', {
        sessionId: this.session.id,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    } finally {
      this.isActive = false;
    }
  }

  /**
   * Rollback the current transaction
   */
  async rollback(): Promise<void> {
    if (!this.session) {
      return;
    }

    if (this.isActive) {
      try {
        await this.session.abortTransaction();
        this.logger.debug('Transaction rolled back', {
          sessionId: this.session.id,
        });
      } catch (error) {
        this.logger.error('Failed to rollback transaction', {
          sessionId: this.session.id,
          error: error instanceof Error ? error.message : error,
        });
      } finally {
        this.isActive = false;
      }
    }
  }

  /**
   * Execute a function within a transaction
   */
  async execute<T>(work: (uow: IUnitOfWork) => Promise<T>): Promise<T> {
    await this.startTransaction();

    try {
      const result = await work(this);
      await this.commit();
      return result;
    } catch (error) {
      await this.rollback();
      throw error;
    } finally {
      await this.dispose();
    }
  }

  /**
   * Execute with retry logic for transient errors
   */
  async executeWithRetry<T>(
    work: (uow: IUnitOfWork) => Promise<T>,
    maxRetries: number = 3
  ): Promise<TransactionResult<T>> {
    let lastError: Error | undefined;
    let retryAttempts = 0;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.execute(work);
        return {
          result,
          committed: true,
          retryAttempts,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        retryAttempts++;

        // Check if error is retryable
        if (!this.isRetryableError(lastError)) {
          break;
        }

        if (attempt < maxRetries) {
          const delay = Math.min(100 * Math.pow(2, attempt), 1000);
          this.logger.warn(`Transaction failed, retrying in ${delay}ms`, {
            attempt: attempt + 1,
            maxRetries,
            error: lastError.message,
          });
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    return {
      result: null as any,
      committed: false,
      error: lastError,
      retryAttempts,
    };
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase();

    // MongoDB transient transaction errors
    if (message.includes('transienttransactionerror')) return true;
    if (message.includes('unknowntransactioncommitresult')) return true;
    if (message.includes('writeconcernerror')) return true;
    if (message.includes('writeconflict')) return true;

    // Network errors
    if (message.includes('network error')) return true;
    if (message.includes('socket') && message.includes('timeout')) return true;

    return false;
  }

  /**
   * Get a repository for a specific model
   */
  getRepository<T>(modelName: string): IRepository<T> {
    const repository = this.repositories.get(modelName);
    if (!repository) {
      throw new Error(`Repository for model '${modelName}' not found`);
    }
    return repository as IRepository<T>;
  }

  /**
   * Register a repository with the unit of work
   */
  registerRepository(modelName: string, repository: IRepository<any>): void {
    this.repositories.set(modelName, repository);
    this.logger.debug(`Repository registered: ${modelName}`);
  }

  /**
   * Check if a transaction is active
   */
  isTransactionActive(): boolean {
    return this.isActive && this.session?.inTransaction() === true;
  }

  /**
   * Dispose of resources
   */
  async dispose(): Promise<void> {
    if (this.session) {
      await this.session.endSession();
      this.session = null;
      this.isActive = false;
      this.logger.debug('Session disposed');
    }
  }
}

/**
 * Factory for creating Unit of Work instances
 */
export class MongooseUnitOfWorkFactory implements IUnitOfWorkFactory {
  constructor(private readonly connection: Connection) {}

  /**
   * Create a new unit of work instance
   */
  async create(): Promise<IUnitOfWork> {
    return new MongooseUnitOfWork(this.connection);
  }
}

/**
 * Decorator for methods that should run within a transaction
 */
export function Transactional(options?: TransactionOptions) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // Check if unit of work is available
      if (!this.unitOfWork) {
        // No unit of work, execute without transaction
        return method.apply(this, args);
      }

      // Check if already in a transaction
      if (this.unitOfWork.isTransactionActive()) {
        // Already in transaction, just execute
        return method.apply(this, args);
      }

      // Start new transaction
      try {
        await this.unitOfWork.startTransaction(options);
        const result = await method.apply(this, args);
        await this.unitOfWork.commit();
        return result;
      } catch (error) {
        await this.unitOfWork.rollback();
        throw error;
      } finally {
        await this.unitOfWork.dispose();
      }
    };

    return descriptor;
  };
}