# MongoDB Transaction Helper Skill

## Purpose
Add transaction boundaries to MongoDB operations, fixing Issue C6 where multi-step operations lack atomicity, leading to data inconsistencies.

## Problem in OLD Code

```typescript
// OLD: No transactions! If step 2 fails, step 1 is not rolled back
async createProject(dto: CreateProjectDto) {
  // Step 1: Create project
  const project = await this.projectRepo.save(dto); // What if this succeeds...

  // Step 2: Create related data
  await this.hierarchyRepo.save(hierarchy); // ...but this fails?

  // Step 3: Create audit log
  await this.auditRepo.save(auditLog); // Or this fails?

  // Result: Partial data, inconsistent state!
}

// Also problematic: Multiple collections updated without transactions
async deleteOrganization(orgId: string) {
  await this.orgRepo.delete(orgId);      // Delete org
  await this.projectRepo.deleteMany(...); // Delete projects
  await this.userRepo.updateMany(...);    // Update users
  // If any step fails, we have orphaned data!
}
```

## Correct Implementation

### 1. Transaction Wrapper Service
```typescript
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ClientSession } from 'mongoose';

@Injectable()
export class TransactionService {
  constructor(
    @InjectConnection() private connection: Connection,
    private logger: LoggerService,
    private metricsService: MetricsService
  ) {}

  /**
   * Execute a function within a transaction with automatic retry
   */
  async withTransaction<T>(
    fn: (session: ClientSession) => Promise<T>,
    options?: TransactionOptions
  ): Promise<T> {
    const opts: TransactionOptions = {
      maxRetries: 3,
      retryDelay: 100,
      timeout: 30000, // 30 seconds
      ...options
    };

    let lastError: any;

    for (let attempt = 1; attempt <= opts.maxRetries; attempt++) {
      const session = await this.connection.startSession();

      try {
        // Start transaction timer
        const startTime = Date.now();

        // Configure transaction options
        const transactionOptions = {
          readConcern: { level: 'snapshot' },
          writeConcern: { w: 'majority' },
          readPreference: 'primary',
          maxCommitTimeMS: opts.timeout
        };

        // Execute transaction
        const result = await session.withTransaction(
          async () => {
            // Check timeout
            if (Date.now() - startTime > opts.timeout) {
              throw new TransactionTimeoutError('Transaction timeout');
            }

            // Execute user function
            return await fn(session);
          },
          transactionOptions
        );

        // Record metrics
        this.metricsService.recordHistogram(
          'transaction.duration',
          Date.now() - startTime
        );
        this.metricsService.incrementCounter('transaction.success');

        return result;

      } catch (error) {
        lastError = error;

        this.logger.warn(
          `Transaction attempt ${attempt} failed: ${error.message}`
        );

        // Check if retryable
        if (!this.isRetryableError(error) || attempt === opts.maxRetries) {
          this.metricsService.incrementCounter('transaction.failure');
          throw error;
        }

        // Exponential backoff
        const delay = opts.retryDelay * Math.pow(2, attempt - 1);
        await this.delay(delay);

        this.metricsService.incrementCounter('transaction.retry');

      } finally {
        await session.endSession();
      }
    }

    throw lastError;
  }

  /**
   * Execute multiple operations in sequence within a transaction
   */
  async executeInTransaction(
    operations: TransactionOperation[],
    options?: TransactionOptions
  ): Promise<any[]> {
    return this.withTransaction(async (session) => {
      const results = [];

      for (const operation of operations) {
        this.logger.debug(`Executing operation: ${operation.name}`);

        try {
          const result = await operation.execute(session);
          results.push(result);

          if (operation.onSuccess) {
            await operation.onSuccess(result, session);
          }
        } catch (error) {
          if (operation.onError) {
            await operation.onError(error, session);
          }
          throw error;
        }
      }

      return results;
    }, options);
  }

  /**
   * Saga pattern with compensating transactions
   */
  async executeSaga(
    steps: SagaStep[],
    options?: TransactionOptions
  ): Promise<any[]> {
    const executedSteps: ExecutedStep[] = [];

    try {
      // Execute forward steps
      for (const step of steps) {
        const session = await this.connection.startSession();

        try {
          const result = await session.withTransaction(async () => {
            return await step.execute(session);
          });

          executedSteps.push({ step, result, session });

          this.logger.info(`Saga step completed: ${step.name}`);
        } catch (error) {
          // Start compensation
          this.logger.error(`Saga step failed: ${step.name}`, error);
          await this.compensate(executedSteps);
          throw error;
        } finally {
          await session.endSession();
        }
      }

      return executedSteps.map(s => s.result);

    } catch (error) {
      this.logger.error('Saga execution failed', error);
      throw error;
    }
  }

  private async compensate(executedSteps: ExecutedStep[]): Promise<void> {
    this.logger.info('Starting saga compensation...');

    // Compensate in reverse order
    for (const { step, result } of executedSteps.reverse()) {
      if (step.compensate) {
        const session = await this.connection.startSession();

        try {
          await session.withTransaction(async () => {
            await step.compensate!(result, session);
          });

          this.logger.info(`Compensated step: ${step.name}`);
        } catch (error) {
          this.logger.error(`Compensation failed for ${step.name}`, error);
          // Continue with other compensations
        } finally {
          await session.endSession();
        }
      }
    }
  }

  private isRetryableError(error: any): boolean {
    // MongoDB transient transaction errors
    const retryableCodes = [
      'UnknownTransactionCommitResult',
      'TransientTransactionError',
      'WriteConcernFailed',
      'NoSuchTransaction',
      'NetworkTimeout'
    ];

    return retryableCodes.includes(error.codeName) ||
           error.hasErrorLabel?.('TransientTransactionError') ||
           error.hasErrorLabel?.('UnknownTransactionCommitResult');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

interface TransactionOptions {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
}

interface TransactionOperation {
  name: string;
  execute: (session: ClientSession) => Promise<any>;
  onSuccess?: (result: any, session: ClientSession) => Promise<void>;
  onError?: (error: any, session: ClientSession) => Promise<void>;
}

interface SagaStep {
  name: string;
  execute: (session: ClientSession) => Promise<any>;
  compensate?: (result: any, session: ClientSession) => Promise<void>;
}

interface ExecutedStep {
  step: SagaStep;
  result: any;
  session: ClientSession;
}
```

### 2. Repository with Transaction Support
```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, ClientSession } from 'mongoose';

@Injectable()
export class TransactionalRepository<T> {
  constructor(
    @InjectModel('Entity') private model: Model<T>,
    @InjectConnection() private connection: Connection,
    private transactionService: TransactionService,
    private eventBus: EventBus
  ) {}

  /**
   * Create with transaction
   */
  async create(entity: T, session?: ClientSession): Promise<T> {
    if (session) {
      // Use provided session
      const [created] = await this.model.create([entity], { session });
      return created;
    }

    // Create new transaction
    return this.transactionService.withTransaction(async (txSession) => {
      const [created] = await this.model.create([entity], { session: txSession });

      // Publish events within transaction
      await this.publishEvents(entity, txSession);

      return created;
    });
  }

  /**
   * Bulk create with transaction
   */
  async createMany(entities: T[], session?: ClientSession): Promise<T[]> {
    if (session) {
      return this.model.create(entities, { session });
    }

    return this.transactionService.withTransaction(async (txSession) => {
      const created = await this.model.create(entities, { session: txSession });

      // Publish bulk event
      await this.eventBus.publish(
        new BulkEntitiesCreatedEvent(created),
        txSession
      );

      return created;
    });
  }

  /**
   * Update with optimistic locking
   */
  async updateWithLock(
    id: string,
    updates: Partial<T>,
    expectedVersion: number,
    session?: ClientSession
  ): Promise<T> {
    const operation = async (txSession: ClientSession) => {
      // Find and lock document
      const entity = await this.model
        .findById(id)
        .session(txSession)
        .exec();

      if (!entity) {
        throw new EntityNotFoundException(id);
      }

      // Check version for optimistic locking
      if (entity.version !== expectedVersion) {
        throw new OptimisticLockException(
          `Version mismatch: expected ${expectedVersion}, got ${entity.version}`
        );
      }

      // Update with incremented version
      const updated = await this.model
        .findByIdAndUpdate(
          id,
          {
            ...updates,
            $inc: { version: 1 }
          },
          {
            new: true,
            session: txSession,
            runValidators: true
          }
        )
        .exec();

      // Publish update event
      await this.eventBus.publish(
        new EntityUpdatedEvent(id, updates),
        txSession
      );

      return updated;
    };

    if (session) {
      return operation(session);
    }

    return this.transactionService.withTransaction(operation);
  }

  /**
   * Delete with cascade
   */
  async deleteWithCascade(
    id: string,
    cascadeOptions: CascadeOptions,
    session?: ClientSession
  ): Promise<void> {
    const operation = async (txSession: ClientSession) => {
      // Delete main entity
      const deleted = await this.model
        .findByIdAndDelete(id)
        .session(txSession)
        .exec();

      if (!deleted) {
        throw new EntityNotFoundException(id);
      }

      // Cascade delete related entities
      for (const cascade of cascadeOptions.cascades) {
        await cascade.repository.deleteMany(
          { [cascade.foreignKey]: id },
          { session: txSession }
        );
      }

      // Publish delete event
      await this.eventBus.publish(
        new EntityDeletedEvent(id),
        txSession
      );
    };

    if (session) {
      return operation(session);
    }

    return this.transactionService.withTransaction(operation);
  }

  /**
   * Aggregate with transaction
   */
  async aggregateWithTransaction<R>(
    pipeline: any[],
    session?: ClientSession
  ): Promise<R[]> {
    const aggregation = this.model.aggregate(pipeline);

    if (session) {
      aggregation.session(session);
    }

    return aggregation.exec();
  }

  private async publishEvents(entity: any, session: ClientSession): Promise<void> {
    // Extract domain events from entity
    const events = entity.getUncommittedEvents?.() || [];

    for (const event of events) {
      await this.eventBus.publish(event, session);
    }

    // Mark events as committed
    entity.markEventsAsCommitted?.();
  }
}

interface CascadeOptions {
  cascades: Array<{
    repository: any;
    foreignKey: string;
  }>;
}
```

### 3. Service Layer with Transactions
```typescript
@Injectable()
export class ProjectService {
  constructor(
    private projectRepo: ProjectRepository,
    private hierarchyRepo: HierarchyRepository,
    private activityRepo: ActivityRepository,
    private auditService: AuditService,
    private transactionService: TransactionService
  ) {}

  /**
   * Create project with all related data in a transaction
   */
  async createProject(dto: CreateProjectDto): Promise<Project> {
    return this.transactionService.withTransaction(async (session) => {
      // Step 1: Create project
      const project = await this.projectRepo.create(
        {
          ...dto,
          status: 'draft',
          createdAt: new Date()
        },
        session
      );

      // Step 2: Initialize hierarchy
      const hierarchy = await this.hierarchyRepo.create(
        {
          projectId: project.id,
          templateId: dto.hierarchyTemplateId,
          customizations: dto.customizations || {}
        },
        session
      );

      // Step 3: Create initial activities if provided
      if (dto.initialActivities) {
        await this.activityRepo.createMany(
          dto.initialActivities.map(activity => ({
            ...activity,
            projectId: project.id
          })),
          session
        );
      }

      // Step 4: Audit log
      await this.auditService.logProjectCreated(
        project,
        dto.userId,
        session
      );

      return project;
    });
  }

  /**
   * Delete project with all dependencies
   */
  async deleteProject(projectId: string, userId: string): Promise<void> {
    // Use saga pattern for complex deletion
    await this.transactionService.executeSaga([
      {
        name: 'Delete activities',
        execute: async (session) => {
          const count = await this.activityRepo.deleteMany(
            { projectId },
            { session }
          );
          return { deletedActivities: count };
        },
        compensate: async (result, session) => {
          // Restore activities from backup if needed
          this.logger.warn('Compensating activity deletion');
        }
      },
      {
        name: 'Delete calculations',
        execute: async (session) => {
          const count = await this.calculationRepo.deleteMany(
            { projectId },
            { session }
          );
          return { deletedCalculations: count };
        }
      },
      {
        name: 'Delete hierarchy',
        execute: async (session) => {
          await this.hierarchyRepo.deleteOne(
            { projectId },
            { session }
          );
        }
      },
      {
        name: 'Delete project',
        execute: async (session) => {
          const project = await this.projectRepo.findByIdAndDelete(
            projectId,
            { session }
          );

          if (!project) {
            throw new EntityNotFoundException(projectId);
          }

          return project;
        }
      },
      {
        name: 'Audit deletion',
        execute: async (session) => {
          await this.auditService.logProjectDeleted(
            projectId,
            userId,
            session
          );
        }
      }
    ]);
  }

  /**
   * Complex update with multiple collections
   */
  async updateProjectHierarchy(
    projectId: string,
    updates: HierarchyUpdateDto
  ): Promise<void> {
    await this.transactionService.executeInTransaction([
      {
        name: 'Update hierarchy',
        execute: async (session) => {
          return this.hierarchyRepo.update(
            projectId,
            updates,
            session
          );
        }
      },
      {
        name: 'Recalculate affected activities',
        execute: async (session) => {
          const affected = await this.activityRepo.find(
            {
              projectId,
              hierarchyNodeId: { $in: updates.affectedNodes }
            },
            { session }
          );

          for (const activity of affected) {
            activity.needsRecalculation = true;
            await activity.save({ session });
          }

          return affected.length;
        }
      },
      {
        name: 'Trigger recalculation',
        execute: async (session) => {
          await this.calculationService.scheduleRecalculation(
            projectId,
            session
          );
        }
      }
    ]);
  }
}
```

### 4. MongoDB Session Management
```typescript
@Injectable()
export class SessionManager {
  private activeSessions = new Map<string, SessionInfo>();

  constructor(
    @InjectConnection() private connection: Connection,
    private metricsService: MetricsService
  ) {}

  async createSession(
    options?: SessionOptions
  ): Promise<ManagedSession> {
    const session = await this.connection.startSession();
    const sessionId = this.generateSessionId();

    const managedSession = new ManagedSession(
      session,
      sessionId,
      options?.timeout || 30000
    );

    this.activeSessions.set(sessionId, {
      session: managedSession,
      startTime: Date.now(),
      operations: 0
    });

    // Auto cleanup on timeout
    setTimeout(() => {
      if (this.activeSessions.has(sessionId)) {
        this.endSession(sessionId);
      }
    }, managedSession.timeout);

    this.metricsService.gauge('sessions.active', this.activeSessions.size);

    return managedSession;
  }

  async endSession(sessionId: string): Promise<void> {
    const info = this.activeSessions.get(sessionId);

    if (info) {
      await info.session.end();
      this.activeSessions.delete(sessionId);

      this.metricsService.recordHistogram(
        'session.duration',
        Date.now() - info.startTime
      );
      this.metricsService.gauge('sessions.active', this.activeSessions.size);
    }
  }

  getActiveSessionCount(): number {
    return this.activeSessions.size;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

class ManagedSession {
  constructor(
    private session: ClientSession,
    public readonly id: string,
    public readonly timeout: number
  ) {}

  async withTransaction<T>(
    fn: (session: ClientSession) => Promise<T>
  ): Promise<T> {
    return this.session.withTransaction(fn);
  }

  async end(): Promise<void> {
    await this.session.endSession();
  }

  get native(): ClientSession {
    return this.session;
  }
}
```

### 5. Testing Transactions
```typescript
describe('Transaction Support', () => {
  let transactionService: TransactionService;
  let connection: Connection;

  beforeEach(async () => {
    connection = await mongoose.connect(mongoUri);
    transactionService = new TransactionService(connection);
  });

  it('should rollback on error', async () => {
    const projectRepo = connection.model('Project');
    const activityRepo = connection.model('Activity');

    try {
      await transactionService.withTransaction(async (session) => {
        // Create project
        await projectRepo.create([{ name: 'Test' }], { session });

        // This should fail and rollback project creation
        throw new Error('Intentional error');
      });
    } catch (error) {
      // Expected error
    }

    // Verify rollback
    const projects = await projectRepo.find({ name: 'Test' });
    expect(projects).toHaveLength(0);
  });

  it('should retry transient errors', async () => {
    let attempts = 0;

    const result = await transactionService.withTransaction(async (session) => {
      attempts++;

      if (attempts < 3) {
        const error: any = new Error('Transient error');
        error.codeName = 'TransientTransactionError';
        throw error;
      }

      return 'success';
    });

    expect(result).toBe('success');
    expect(attempts).toBe(3);
  });

  it('should handle concurrent transactions', async () => {
    const operations = Array.from({ length: 10 }, (_, i) =>
      transactionService.withTransaction(async (session) => {
        const project = await projectRepo.create(
          [{ name: `Project ${i}` }],
          { session }
        );
        return project;
      })
    );

    const results = await Promise.all(operations);
    expect(results).toHaveLength(10);
  });

  it('should support saga compensation', async () => {
    const executedSteps: string[] = [];
    const compensatedSteps: string[] = [];

    try {
      await transactionService.executeSaga([
        {
          name: 'Step 1',
          execute: async () => {
            executedSteps.push('Step 1');
            return 'result1';
          },
          compensate: async () => {
            compensatedSteps.push('Step 1');
          }
        },
        {
          name: 'Step 2',
          execute: async () => {
            executedSteps.push('Step 2');
            throw new Error('Step 2 failed');
          },
          compensate: async () => {
            compensatedSteps.push('Step 2');
          }
        }
      ]);
    } catch (error) {
      // Expected error
    }

    expect(executedSteps).toEqual(['Step 1', 'Step 2']);
    expect(compensatedSteps).toEqual(['Step 1']); // Compensated in reverse
  });
});
```

## Key Points

1. **Always use transactions** for multi-document operations
2. **Session must be passed** to all operations in transaction
3. **Handle retryable errors** - MongoDB has transient errors
4. **Set appropriate timeouts** - Prevent long-running transactions
5. **Use saga pattern** for distributed transactions
6. **Implement optimistic locking** for concurrent updates
7. **Test rollback scenarios** - Ensure data consistency
8. **Monitor transaction metrics** - Duration, success rate
9. **Cascade deletes carefully** - Use transactions
10. **Event publishing** must be within transaction

Remember: Without transactions, partial failures lead to inconsistent data. Always wrap related operations in transactions.