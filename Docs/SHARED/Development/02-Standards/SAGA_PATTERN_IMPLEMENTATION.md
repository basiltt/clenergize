# Saga Pattern Implementation for Distributed Transactions

## Executive Summary

Complete implementation of the Saga pattern for managing distributed transactions across Clenergize V3 microservices, with both orchestration and choreography approaches, compensation logic, and state management.

**Pattern Types**: Orchestration & Choreography
**State Storage**: MongoDB + Event Sourcing
**Implementation Time**: 6 hours

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Orchestration-Based Saga](#orchestration-based-saga)
3. [Choreography-Based Saga](#choreography-based-saga)
4. [State Machine Implementation](#state-machine-implementation)
5. [Compensation Logic](#compensation-logic)
6. [Event Sourcing](#event-sourcing)
7. [Saga Examples](#saga-examples)
8. [Error Handling](#error-handling)
9. [Monitoring & Observability](#monitoring-observability)
10. [Testing Strategies](#testing-strategies)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Saga Architecture                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Orchestration-Based Saga:                                 │
│  ┌──────────┐                                              │
│  │   Saga   │──────> Service A ────┐                      │
│  │Orchestra │                       │                      │
│  │   tor    │<──────────────────────┘                      │
│  │          │──────> Service B ────┐                      │
│  │          │                       │                      │
│  │          │<──────────────────────┘                      │
│  └──────────┘                                              │
│                                                             │
│  Choreography-Based Saga:                                  │
│  Service A ──event──> Service B ──event──> Service C      │
│      ↑                                          │          │
│      └────────── compensation event ───────────┘          │
│                                                             │
│  State Storage:                                            │
│  • MongoDB: Current saga state                             │
│  • Event Store: Complete event history                     │
│  • Redis: Distributed locks                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Orchestration-Based Saga

### Base Saga Orchestrator

```typescript
// File: NEW/shared/src/saga/orchestrator.ts

import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import * as stateMachine from 'javascript-state-machine';

export interface SagaDefinition {
  name: string;
  steps: SagaStep[];
  timeout?: number;
  retryPolicy?: RetryPolicy;
}

export interface SagaStep {
  name: string;
  service: string;
  action: string;
  compensate?: string;
  timeout?: number;
  retryable?: boolean;
  critical?: boolean;
  transformInput?: (data: any) => any;
  transformOutput?: (data: any) => any;
}

export interface SagaInstance {
  id: string;
  name: string;
  state: SagaState;
  currentStep: number;
  context: any;
  startedAt: Date;
  completedAt?: Date;
  error?: any;
  compensationIndex?: number;
  history: SagaEvent[];
}

export enum SagaState {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPENSATING = 'COMPENSATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  TIMEOUT = 'TIMEOUT',
}

export interface SagaEvent {
  timestamp: Date;
  type: string;
  step?: string;
  data?: any;
  error?: any;
}

@Injectable()
export class SagaOrchestrator {
  private readonly logger = new Logger(SagaOrchestrator.name);
  private readonly sagas = new Map<string, SagaDefinition>();
  private readonly runningInstances = new Map<string, SagaInstance>();

  constructor(
    @InjectModel('Saga') private sagaModel: Model<SagaInstance>,
    private eventEmitter: EventEmitter2,
  ) {}

  registerSaga(definition: SagaDefinition) {
    this.sagas.set(definition.name, definition);
    this.logger.log(`Registered saga: ${definition.name}`);
  }

  async startSaga(
    sagaName: string,
    initialContext: any,
    correlationId?: string
  ): Promise<SagaInstance> {
    const definition = this.sagas.get(sagaName);
    if (!definition) {
      throw new Error(`Saga ${sagaName} not found`);
    }

    const sagaId = correlationId || uuidv4();
    const instance: SagaInstance = {
      id: sagaId,
      name: sagaName,
      state: SagaState.PENDING,
      currentStep: 0,
      context: initialContext,
      startedAt: new Date(),
      history: [],
    };

    // Save to database
    await this.sagaModel.create(instance);
    this.runningInstances.set(sagaId, instance);

    // Start execution
    this.executeSaga(sagaId, definition);

    return instance;
  }

  private async executeSaga(sagaId: string, definition: SagaDefinition) {
    const instance = this.runningInstances.get(sagaId);
    if (!instance) {
      this.logger.error(`Saga instance ${sagaId} not found`);
      return;
    }

    try {
      // Update state to running
      await this.updateSagaState(sagaId, SagaState.RUNNING);

      // Set timeout if specified
      if (definition.timeout) {
        setTimeout(() => this.handleTimeout(sagaId), definition.timeout);
      }

      // Execute steps sequentially
      for (let i = 0; i < definition.steps.length; i++) {
        const step = definition.steps[i];
        instance.currentStep = i;

        this.logger.log(`Executing step ${step.name} for saga ${sagaId}`);

        try {
          const result = await this.executeStep(step, instance);

          // Update context with result
          instance.context = {
            ...instance.context,
            [`${step.name}_result`]: result,
          };

          // Record event
          this.recordEvent(instance, {
            type: 'STEP_COMPLETED',
            step: step.name,
            data: result,
          });

          // Save progress
          await this.saveSagaProgress(instance);

        } catch (error) {
          this.logger.error(`Step ${step.name} failed for saga ${sagaId}:`, error);

          // Record failure
          this.recordEvent(instance, {
            type: 'STEP_FAILED',
            step: step.name,
            error: error.message,
          });

          // Determine if we should compensate or retry
          if (step.retryable && this.shouldRetry(instance, step)) {
            await this.retryStep(step, instance, definition.retryPolicy);
          } else {
            // Start compensation
            await this.compensateSaga(sagaId, definition, i);
            return;
          }
        }
      }

      // All steps completed successfully
      await this.completeSaga(sagaId);

    } catch (error) {
      this.logger.error(`Saga ${sagaId} failed:`, error);
      await this.failSaga(sagaId, error);
    }
  }

  private async executeStep(step: SagaStep, instance: SagaInstance): Promise<any> {
    // Transform input if needed
    const input = step.transformInput
      ? step.transformInput(instance.context)
      : instance.context;

    // Create step execution context
    const stepContext = {
      sagaId: instance.id,
      stepName: step.name,
      input,
      timeout: step.timeout || 30000,
    };

    // Emit event for service to handle
    const eventName = `saga.${step.service}.${step.action}`;
    const result = await this.emitAndWait(eventName, stepContext);

    // Transform output if needed
    return step.transformOutput
      ? step.transformOutput(result)
      : result;
  }

  private async compensateSaga(
    sagaId: string,
    definition: SagaDefinition,
    failedStepIndex: number
  ) {
    const instance = this.runningInstances.get(sagaId);
    if (!instance) return;

    await this.updateSagaState(sagaId, SagaState.COMPENSATING);
    instance.compensationIndex = failedStepIndex;

    this.logger.log(`Starting compensation for saga ${sagaId} from step ${failedStepIndex}`);

    // Compensate in reverse order
    for (let i = failedStepIndex - 1; i >= 0; i--) {
      const step = definition.steps[i];

      if (!step.compensate) {
        this.logger.log(`No compensation defined for step ${step.name}`);
        continue;
      }

      try {
        this.logger.log(`Compensating step ${step.name} for saga ${sagaId}`);

        const compensationContext = {
          sagaId: instance.id,
          stepName: step.name,
          originalInput: instance.context,
          stepResult: instance.context[`${step.name}_result`],
        };

        const eventName = `saga.${step.service}.${step.compensate}`;
        await this.emitAndWait(eventName, compensationContext);

        this.recordEvent(instance, {
          type: 'STEP_COMPENSATED',
          step: step.name,
        });

      } catch (error) {
        this.logger.error(`Compensation failed for step ${step.name}:`, error);

        this.recordEvent(instance, {
          type: 'COMPENSATION_FAILED',
          step: step.name,
          error: error.message,
        });

        // Mark saga as failed if compensation fails
        if (step.critical) {
          await this.failSaga(sagaId, error);
          return;
        }
      }
    }

    // Mark saga as compensated (failed but consistent)
    await this.updateSagaState(sagaId, SagaState.FAILED);
    instance.completedAt = new Date();
    await this.saveSagaProgress(instance);
  }

  private async emitAndWait(event: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Timeout waiting for ${event}`));
      }, data.timeout || 30000);

      const responseEvent = `${event}.response`;
      const errorEvent = `${event}.error`;

      const cleanup = () => {
        clearTimeout(timeout);
        this.eventEmitter.off(responseEvent, successHandler);
        this.eventEmitter.off(errorEvent, errorHandler);
      };

      const successHandler = (result: any) => {
        if (result.sagaId === data.sagaId) {
          cleanup();
          resolve(result.data);
        }
      };

      const errorHandler = (error: any) => {
        if (error.sagaId === data.sagaId) {
          cleanup();
          reject(new Error(error.message));
        }
      };

      this.eventEmitter.on(responseEvent, successHandler);
      this.eventEmitter.on(errorEvent, errorHandler);

      // Emit the event
      this.eventEmitter.emit(event, data);
    });
  }

  private async retryStep(
    step: SagaStep,
    instance: SagaInstance,
    policy?: RetryPolicy
  ) {
    const maxRetries = policy?.maxRetries || 3;
    const backoff = policy?.backoff || 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      this.logger.log(`Retry attempt ${attempt} for step ${step.name}`);

      try {
        await this.delay(backoff * Math.pow(2, attempt - 1));
        const result = await this.executeStep(step, instance);

        // Success - continue saga
        instance.context[`${step.name}_result`] = result;
        return;

      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
      }
    }
  }

  private shouldRetry(instance: SagaInstance, step: SagaStep): boolean {
    // Check if step has already been retried too many times
    const retryCount = instance.history.filter(
      e => e.type === 'STEP_RETRY' && e.step === step.name
    ).length;

    return retryCount < 3;
  }

  private async updateSagaState(sagaId: string, state: SagaState) {
    const instance = this.runningInstances.get(sagaId);
    if (instance) {
      instance.state = state;
      await this.sagaModel.updateOne(
        { id: sagaId },
        { $set: { state } }
      );
    }
  }

  private async completeSaga(sagaId: string) {
    const instance = this.runningInstances.get(sagaId);
    if (!instance) return;

    instance.state = SagaState.COMPLETED;
    instance.completedAt = new Date();

    await this.saveSagaProgress(instance);
    this.runningInstances.delete(sagaId);

    this.logger.log(`Saga ${sagaId} completed successfully`);

    // Emit completion event
    this.eventEmitter.emit('saga.completed', {
      sagaId,
      name: instance.name,
      context: instance.context,
    });
  }

  private async failSaga(sagaId: string, error: any) {
    const instance = this.runningInstances.get(sagaId);
    if (!instance) return;

    instance.state = SagaState.FAILED;
    instance.completedAt = new Date();
    instance.error = error.message;

    await this.saveSagaProgress(instance);
    this.runningInstances.delete(sagaId);

    this.logger.error(`Saga ${sagaId} failed:`, error);

    // Emit failure event
    this.eventEmitter.emit('saga.failed', {
      sagaId,
      name: instance.name,
      error: error.message,
    });
  }

  private async handleTimeout(sagaId: string) {
    const instance = this.runningInstances.get(sagaId);
    if (!instance || instance.state !== SagaState.RUNNING) return;

    this.logger.warn(`Saga ${sagaId} timed out`);

    instance.state = SagaState.TIMEOUT;
    instance.completedAt = new Date();

    await this.saveSagaProgress(instance);

    // Start compensation
    const definition = this.sagas.get(instance.name);
    if (definition) {
      await this.compensateSaga(sagaId, definition, instance.currentStep);
    }
  }

  private recordEvent(instance: SagaInstance, event: Omit<SagaEvent, 'timestamp'>) {
    instance.history.push({
      ...event,
      timestamp: new Date(),
    });
  }

  private async saveSagaProgress(instance: SagaInstance) {
    await this.sagaModel.updateOne(
      { id: instance.id },
      { $set: instance }
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getSagaStatus(sagaId: string): Promise<SagaInstance | null> {
    return this.sagaModel.findOne({ id: sagaId }).exec();
  }

  async resumeSaga(sagaId: string): Promise<void> {
    const instance = await this.sagaModel.findOne({ id: sagaId }).exec();
    if (!instance) {
      throw new Error(`Saga ${sagaId} not found`);
    }

    if (instance.state !== SagaState.RUNNING) {
      throw new Error(`Saga ${sagaId} is not in running state`);
    }

    const definition = this.sagas.get(instance.name);
    if (!definition) {
      throw new Error(`Saga definition ${instance.name} not found`);
    }

    this.runningInstances.set(sagaId, instance as any);

    // Resume from current step
    this.executeSaga(sagaId, definition);
  }
}

interface RetryPolicy {
  maxRetries: number;
  backoff: number;
  retryableErrors?: string[];
}
```

---

## Choreography-Based Saga

### Event-Driven Saga Implementation

```typescript
// File: NEW/shared/src/saga/choreography.ts

import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export interface ChoreographySaga {
  id: string;
  type: string;
  state: string;
  participants: SagaParticipant[];
  startedAt: Date;
  completedAt?: Date;
  context: any;
  events: SagaEvent[];
}

export interface SagaParticipant {
  service: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'COMPENSATED';
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

@Injectable()
export class ChoreographySagaManager {
  private readonly logger = new Logger(ChoreographySagaManager.name);

  constructor(
    @InjectModel('ChoreographySaga') private sagaModel: Model<ChoreographySaga>,
    private eventEmitter: EventEmitter2,
  ) {}

  // User Registration Saga - Choreography Example
  @OnEvent('user.registration.initiated')
  async handleUserRegistration(payload: any) {
    const sagaId = payload.correlationId;

    // Create saga instance
    const saga: ChoreographySaga = {
      id: sagaId,
      type: 'USER_REGISTRATION',
      state: 'STARTED',
      participants: [
        { service: 'identity', status: 'PENDING' },
        { service: 'organization', status: 'PENDING' },
        { service: 'notification', status: 'PENDING' },
        { service: 'audit', status: 'PENDING' },
      ],
      startedAt: new Date(),
      context: payload,
      events: [],
    };

    await this.sagaModel.create(saga);

    // Start the saga by emitting first event
    this.eventEmitter.emit('identity.user.create', {
      ...payload,
      sagaId,
    });
  }

  @OnEvent('identity.user.created')
  async handleUserCreated(payload: any) {
    const saga = await this.updateParticipant(
      payload.sagaId,
      'identity',
      'COMPLETED'
    );

    if (!saga) return;

    // Trigger next step
    this.eventEmitter.emit('organization.project.create-default', {
      userId: payload.userId,
      sagaId: payload.sagaId,
    });

    this.recordEvent(saga, {
      type: 'USER_CREATED',
      service: 'identity',
      data: payload,
    });
  }

  @OnEvent('organization.project.created')
  async handleProjectCreated(payload: any) {
    const saga = await this.updateParticipant(
      payload.sagaId,
      'organization',
      'COMPLETED'
    );

    if (!saga) return;

    // Trigger notifications
    this.eventEmitter.emit('notification.welcome.send', {
      userId: payload.userId,
      projectId: payload.projectId,
      sagaId: payload.sagaId,
    });

    this.recordEvent(saga, {
      type: 'PROJECT_CREATED',
      service: 'organization',
      data: payload,
    });
  }

  @OnEvent('notification.welcome.sent')
  async handleNotificationSent(payload: any) {
    const saga = await this.updateParticipant(
      payload.sagaId,
      'notification',
      'COMPLETED'
    );

    if (!saga) return;

    // Final step - audit
    this.eventEmitter.emit('audit.registration.log', {
      userId: payload.userId,
      sagaId: payload.sagaId,
    });

    this.recordEvent(saga, {
      type: 'NOTIFICATION_SENT',
      service: 'notification',
      data: payload,
    });
  }

  @OnEvent('audit.registration.logged')
  async handleAuditLogged(payload: any) {
    const saga = await this.updateParticipant(
      payload.sagaId,
      'audit',
      'COMPLETED'
    );

    if (!saga) return;

    // Check if all participants completed
    const allCompleted = saga.participants.every(
      p => p.status === 'COMPLETED'
    );

    if (allCompleted) {
      await this.completeSaga(saga.id);
    }
  }

  // Handle failures and trigger compensation
  @OnEvent('organization.project.creation-failed')
  async handleProjectCreationFailed(payload: any) {
    const saga = await this.updateParticipant(
      payload.sagaId,
      'organization',
      'FAILED',
      payload.error
    );

    if (!saga) return;

    this.logger.warn(`Saga ${saga.id} failed at organization step`);

    // Start compensation
    await this.startCompensation(saga);
  }

  private async startCompensation(saga: ChoreographySaga) {
    this.logger.log(`Starting compensation for saga ${saga.id}`);

    // Update saga state
    saga.state = 'COMPENSATING';
    await this.sagaModel.updateOne(
      { id: saga.id },
      { $set: { state: saga.state } }
    );

    // Compensate completed steps
    const completedParticipants = saga.participants.filter(
      p => p.status === 'COMPLETED'
    );

    for (const participant of completedParticipants) {
      this.emitCompensationEvent(participant.service, saga);
    }
  }

  private emitCompensationEvent(service: string, saga: ChoreographySaga) {
    const compensationEvents = {
      identity: 'identity.user.delete',
      organization: 'organization.project.delete',
      notification: 'notification.cancellation.send',
      audit: 'audit.compensation.log',
    };

    const event = compensationEvents[service];
    if (event) {
      this.eventEmitter.emit(event, {
        sagaId: saga.id,
        context: saga.context,
        reason: 'Saga compensation',
      });
    }
  }

  @OnEvent('identity.user.deleted')
  async handleUserDeleted(payload: any) {
    await this.updateParticipant(
      payload.sagaId,
      'identity',
      'COMPENSATED'
    );

    await this.checkCompensationComplete(payload.sagaId);
  }

  private async checkCompensationComplete(sagaId: string) {
    const saga = await this.sagaModel.findOne({ id: sagaId }).exec();
    if (!saga) return;

    const allCompensated = saga.participants
      .filter(p => p.status === 'COMPLETED')
      .every(p => p.status === 'COMPENSATED');

    if (allCompensated) {
      saga.state = 'COMPENSATED';
      saga.completedAt = new Date();
      await saga.save();

      this.logger.log(`Saga ${sagaId} compensation completed`);
    }
  }

  private async updateParticipant(
    sagaId: string,
    service: string,
    status: string,
    error?: string
  ): Promise<ChoreographySaga | null> {
    const saga = await this.sagaModel.findOne({ id: sagaId }).exec();
    if (!saga) {
      this.logger.error(`Saga ${sagaId} not found`);
      return null;
    }

    const participant = saga.participants.find(p => p.service === service);
    if (participant) {
      participant.status = status as any;
      participant.completedAt = new Date();
      if (error) {
        participant.error = error;
      }
    }

    await saga.save();
    return saga;
  }

  private async completeSaga(sagaId: string) {
    const saga = await this.sagaModel.findOne({ id: sagaId }).exec();
    if (!saga) return;

    saga.state = 'COMPLETED';
    saga.completedAt = new Date();
    await saga.save();

    this.logger.log(`Saga ${sagaId} completed successfully`);

    // Emit completion event
    this.eventEmitter.emit('saga.choreography.completed', {
      sagaId,
      type: saga.type,
      context: saga.context,
    });
  }

  private recordEvent(saga: ChoreographySaga, event: any) {
    saga.events.push({
      ...event,
      timestamp: new Date(),
    });

    saga.save();
  }
}
```

---

## State Machine Implementation

### Saga State Machine

```typescript
// File: NEW/shared/src/saga/state-machine.ts

import StateMachine from 'javascript-state-machine';
import { Injectable } from '@nestjs/common';

export interface SagaStateMachineConfig {
  initialState: string;
  states: string[];
  transitions: StateTransition[];
  handlers?: StateHandlers;
}

export interface StateTransition {
  name: string;
  from: string | string[];
  to: string;
}

export interface StateHandlers {
  onEnterState?: (lifecycle: any) => void;
  onLeaveState?: (lifecycle: any) => void;
  onTransition?: (lifecycle: any) => void;
}

@Injectable()
export class SagaStateMachineFactory {
  createStateMachine(config: SagaStateMachineConfig): any {
    return new StateMachine({
      init: config.initialState,
      transitions: config.transitions,
      methods: {
        onEnterState: config.handlers?.onEnterState,
        onLeaveState: config.handlers?.onLeaveState,
        onTransition: config.handlers?.onTransition,
      },
    });
  }

  // Project Creation Saga State Machine
  createProjectCreationStateMachine() {
    return this.createStateMachine({
      initialState: 'idle',
      states: [
        'idle',
        'validating_user',
        'creating_project',
        'assigning_permissions',
        'initializing_hierarchy',
        'sending_notifications',
        'completed',
        'compensating',
        'failed',
      ],
      transitions: [
        { name: 'start', from: 'idle', to: 'validating_user' },
        { name: 'userValidated', from: 'validating_user', to: 'creating_project' },
        { name: 'projectCreated', from: 'creating_project', to: 'assigning_permissions' },
        { name: 'permissionsAssigned', from: 'assigning_permissions', to: 'initializing_hierarchy' },
        { name: 'hierarchyInitialized', from: 'initializing_hierarchy', to: 'sending_notifications' },
        { name: 'notificationsSent', from: 'sending_notifications', to: 'completed' },
        { name: 'fail', from: '*', to: 'compensating' },
        { name: 'compensated', from: 'compensating', to: 'failed' },
      ],
      handlers: {
        onEnterState: (lifecycle) => {
          console.log(`Entering state: ${lifecycle.to}`);
        },
        onLeaveState: (lifecycle) => {
          console.log(`Leaving state: ${lifecycle.from}`);
        },
        onTransition: (lifecycle) => {
          console.log(`Transition: ${lifecycle.transition} (${lifecycle.from} -> ${lifecycle.to})`);
        },
      },
    });
  }

  // Order Processing Saga State Machine
  createOrderStateMachine() {
    return new StateMachine({
      init: 'pending',
      transitions: [
        { name: 'reserve', from: 'pending', to: 'reserving_inventory' },
        { name: 'inventoryReserved', from: 'reserving_inventory', to: 'processing_payment' },
        { name: 'paymentProcessed', from: 'processing_payment', to: 'confirming_order' },
        { name: 'orderConfirmed', from: 'confirming_order', to: 'shipping' },
        { name: 'shipped', from: 'shipping', to: 'completed' },

        // Compensation transitions
        { name: 'reserveFailed', from: 'reserving_inventory', to: 'failed' },
        { name: 'paymentFailed', from: 'processing_payment', to: 'releasing_inventory' },
        { name: 'inventoryReleased', from: 'releasing_inventory', to: 'failed' },
        { name: 'confirmFailed', from: 'confirming_order', to: 'refunding_payment' },
        { name: 'paymentRefunded', from: 'refunding_payment', to: 'releasing_inventory' },
      ],
      data: {
        orderId: null,
        customerId: null,
        items: [],
        totalAmount: 0,
        error: null,
      },
      methods: {
        onReserve: function(lifecycle, orderId, items) {
          this.orderId = orderId;
          this.items = items;
          console.log(`Reserving inventory for order ${orderId}`);
        },
        onPaymentProcessed: function(lifecycle, paymentId) {
          this.paymentId = paymentId;
          console.log(`Payment ${paymentId} processed for order ${this.orderId}`);
        },
        onFail: function(lifecycle, error) {
          this.error = error;
          console.error(`Order ${this.orderId} failed:`, error);
        },
        onInvalidTransition: function(transition, from, to) {
          throw new Error(`Invalid transition ${transition} from ${from} to ${to}`);
        },
      },
    });
  }
}

// Usage Example
export class ProjectCreationSaga {
  private stateMachine: any;

  constructor(private stateMachineFactory: SagaStateMachineFactory) {
    this.stateMachine = this.stateMachineFactory.createProjectCreationStateMachine();
  }

  async execute(context: any) {
    try {
      // Start the saga
      this.stateMachine.start();

      // Validate user
      await this.validateUser(context.userId);
      this.stateMachine.userValidated();

      // Create project
      const project = await this.createProject(context);
      this.stateMachine.projectCreated();

      // Assign permissions
      await this.assignPermissions(project.id, context.userId);
      this.stateMachine.permissionsAssigned();

      // Initialize hierarchy
      await this.initializeHierarchy(project.id);
      this.stateMachine.hierarchyInitialized();

      // Send notifications
      await this.sendNotifications(context.userId, project.id);
      this.stateMachine.notificationsSent();

      return { success: true, projectId: project.id };

    } catch (error) {
      // Trigger compensation
      this.stateMachine.fail();
      await this.compensate();
      this.stateMachine.compensated();

      throw error;
    }
  }

  private async validateUser(userId: string) {
    // Implementation
  }

  private async createProject(context: any) {
    // Implementation
    return { id: 'project-123' };
  }

  private async assignPermissions(projectId: string, userId: string) {
    // Implementation
  }

  private async initializeHierarchy(projectId: string) {
    // Implementation
  }

  private async sendNotifications(userId: string, projectId: string) {
    // Implementation
  }

  private async compensate() {
    // Compensation logic based on current state
    const state = this.stateMachine.state;

    switch (state) {
      case 'sending_notifications':
        // No compensation needed for notifications
      case 'initializing_hierarchy':
        await this.deleteHierarchy();
      case 'assigning_permissions':
        await this.revokePermissions();
      case 'creating_project':
        await this.deleteProject();
      case 'validating_user':
        // No compensation needed
        break;
    }
  }

  private async deleteHierarchy() {
    // Compensation implementation
  }

  private async revokePermissions() {
    // Compensation implementation
  }

  private async deleteProject() {
    // Compensation implementation
  }
}
```

---

## Compensation Logic

### Compensation Strategies

```typescript
// File: NEW/shared/src/saga/compensation.ts

import { Injectable, Logger } from '@nestjs/common';

export interface CompensationAction {
  service: string;
  action: string;
  params: any;
  order: number;
  critical: boolean;
  timeout: number;
}

export interface CompensationStrategy {
  type: 'BACKWARD' | 'FORWARD' | 'CUSTOM';
  actions: CompensationAction[];
  fallback?: () => Promise<void>;
}

@Injectable()
export class CompensationManager {
  private readonly logger = new Logger(CompensationManager.name);
  private readonly compensationStrategies = new Map<string, CompensationStrategy>();

  registerStrategy(sagaName: string, strategy: CompensationStrategy) {
    this.compensationStrategies.set(sagaName, strategy);
  }

  async executeCompensation(
    sagaName: string,
    failedStep: number,
    context: any
  ): Promise<void> {
    const strategy = this.compensationStrategies.get(sagaName);
    if (!strategy) {
      throw new Error(`No compensation strategy for saga ${sagaName}`);
    }

    switch (strategy.type) {
      case 'BACKWARD':
        await this.executeBackwardCompensation(strategy, failedStep, context);
        break;
      case 'FORWARD':
        await this.executeForwardCompensation(strategy, context);
        break;
      case 'CUSTOM':
        await this.executeCustomCompensation(strategy, context);
        break;
    }
  }

  private async executeBackwardCompensation(
    strategy: CompensationStrategy,
    failedStep: number,
    context: any
  ) {
    // Execute compensation actions in reverse order
    const actionsToCompensate = strategy.actions
      .filter(a => a.order < failedStep)
      .sort((a, b) => b.order - a.order);

    for (const action of actionsToCompensate) {
      await this.executeAction(action, context);
    }
  }

  private async executeForwardCompensation(
    strategy: CompensationStrategy,
    context: any
  ) {
    // Execute all compensation actions forward
    for (const action of strategy.actions) {
      await this.executeAction(action, context);
    }
  }

  private async executeCustomCompensation(
    strategy: CompensationStrategy,
    context: any
  ) {
    // Execute custom compensation logic
    if (strategy.fallback) {
      await strategy.fallback();
    }
  }

  private async executeAction(action: CompensationAction, context: any) {
    try {
      this.logger.log(`Executing compensation: ${action.service}.${action.action}`);

      // Add timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Compensation timeout')), action.timeout);
      });

      const actionPromise = this.callService(action, context);

      await Promise.race([actionPromise, timeoutPromise]);

      this.logger.log(`Compensation completed: ${action.service}.${action.action}`);

    } catch (error) {
      this.logger.error(`Compensation failed: ${action.service}.${action.action}`, error);

      if (action.critical) {
        throw error;
      }
      // Continue with next compensation if not critical
    }
  }

  private async callService(action: CompensationAction, context: any): Promise<void> {
    // Implementation would call the actual service
    // This is a placeholder
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Predefined compensation strategies
  static readonly Strategies = {
    ProjectCreation: {
      type: 'BACKWARD' as const,
      actions: [
        {
          service: 'identity',
          action: 'revokePermissions',
          params: { userId: '{{userId}}', projectId: '{{projectId}}' },
          order: 4,
          critical: false,
          timeout: 5000,
        },
        {
          service: 'organization',
          action: 'deleteHierarchy',
          params: { projectId: '{{projectId}}' },
          order: 3,
          critical: true,
          timeout: 10000,
        },
        {
          service: 'organization',
          action: 'deleteProject',
          params: { projectId: '{{projectId}}' },
          order: 2,
          critical: true,
          timeout: 5000,
        },
        {
          service: 'audit',
          action: 'logCompensation',
          params: { sagaId: '{{sagaId}}', reason: 'ProjectCreationFailed' },
          order: 1,
          critical: false,
          timeout: 3000,
        },
      ],
    },

    UserDeletion: {
      type: 'FORWARD' as const,
      actions: [
        {
          service: 'organization',
          action: 'transferOwnership',
          params: { fromUserId: '{{userId}}', toUserId: '{{fallbackOwnerId}}' },
          order: 1,
          critical: true,
          timeout: 10000,
        },
        {
          service: 'activity',
          action: 'archiveUserActivities',
          params: { userId: '{{userId}}' },
          order: 2,
          critical: false,
          timeout: 30000,
        },
        {
          service: 'identity',
          action: 'deleteUser',
          params: { userId: '{{userId}}' },
          order: 3,
          critical: true,
          timeout: 5000,
        },
        {
          service: 'audit',
          action: 'logUserDeletion',
          params: { userId: '{{userId}}', deletedAt: '{{timestamp}}' },
          order: 4,
          critical: false,
          timeout: 3000,
        },
      ],
    },

    EmissionCalculation: {
      type: 'CUSTOM' as const,
      actions: [],
      fallback: async () => {
        // Custom compensation for calculation failures
        // Mark calculation as failed and notify user
        console.log('Custom compensation for emission calculation');
      },
    },
  };
}
```

---

## Saga Examples

### Project Creation Saga

```typescript
// File: NEW/organization-service/src/sagas/project-creation.saga.ts

import { Injectable } from '@nestjs/common';
import { SagaOrchestrator } from '@clenergize/common';

@Injectable()
export class ProjectCreationSaga {
  constructor(private orchestrator: SagaOrchestrator) {
    this.registerSaga();
  }

  private registerSaga() {
    this.orchestrator.registerSaga({
      name: 'PROJECT_CREATION',
      timeout: 60000, // 1 minute
      steps: [
        {
          name: 'validateUser',
          service: 'identity',
          action: 'validateUser',
          timeout: 5000,
          critical: true,
          retryable: true,
        },
        {
          name: 'checkQuota',
          service: 'organization',
          action: 'checkProjectQuota',
          compensate: 'releaseQuota',
          timeout: 3000,
          retryable: true,
        },
        {
          name: 'createProject',
          service: 'organization',
          action: 'createProject',
          compensate: 'deleteProject',
          timeout: 10000,
          critical: true,
        },
        {
          name: 'createHierarchy',
          service: 'organization',
          action: 'createDefaultHierarchy',
          compensate: 'deleteHierarchy',
          timeout: 15000,
        },
        {
          name: 'assignPermissions',
          service: 'identity',
          action: 'assignProjectPermissions',
          compensate: 'revokePermissions',
          timeout: 5000,
        },
        {
          name: 'initializeReferences',
          service: 'reference',
          action: 'initializeProjectReferences',
          compensate: 'deleteReferences',
          timeout: 10000,
        },
        {
          name: 'sendNotification',
          service: 'notification',
          action: 'sendProjectCreatedEmail',
          timeout: 5000,
          retryable: true,
          critical: false, // Don't fail saga if notification fails
        },
        {
          name: 'auditLog',
          service: 'audit',
          action: 'logProjectCreation',
          timeout: 3000,
          critical: false,
        },
      ],
      retryPolicy: {
        maxRetries: 3,
        backoff: 1000,
      },
    });
  }

  async createProject(request: CreateProjectRequest): Promise<CreateProjectResponse> {
    const context = {
      userId: request.userId,
      projectName: request.name,
      organizationId: request.organizationId,
      templateId: request.templateId,
      metadata: request.metadata,
    };

    const saga = await this.orchestrator.startSaga(
      'PROJECT_CREATION',
      context,
      request.correlationId
    );

    // Wait for completion or timeout
    const result = await this.waitForCompletion(saga.id, 60000);

    if (result.state === 'COMPLETED') {
      return {
        success: true,
        projectId: result.context.projectId,
        message: 'Project created successfully',
      };
    } else {
      throw new Error(`Project creation failed: ${result.error}`);
    }
  }

  private async waitForCompletion(sagaId: string, timeout: number) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const status = await this.orchestrator.getSagaStatus(sagaId);

      if (status?.state === 'COMPLETED' || status?.state === 'FAILED') {
        return status;
      }

      await this.delay(1000);
    }

    throw new Error('Saga timeout');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

interface CreateProjectRequest {
  userId: string;
  name: string;
  organizationId: string;
  templateId?: string;
  metadata?: any;
  correlationId?: string;
}

interface CreateProjectResponse {
  success: boolean;
  projectId?: string;
  message: string;
}
```

### User Deletion Saga

```typescript
// File: NEW/identity-service/src/sagas/user-deletion.saga.ts

import { Injectable } from '@nestjs/common';
import { ChoreographySagaManager } from '@clenergize/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class UserDeletionSaga {
  constructor(
    private sagaManager: ChoreographySagaManager,
    private eventEmitter: EventEmitter2,
  ) {}

  async deleteUser(userId: string, deletedBy: string): Promise<void> {
    const sagaId = `user-deletion-${userId}-${Date.now()}`;

    // Start choreography-based saga
    this.eventEmitter.emit('user.deletion.initiated', {
      sagaId,
      userId,
      deletedBy,
      timestamp: new Date(),
    });
  }

  // Step 1: Check if user can be deleted
  @OnEvent('user.deletion.initiated')
  async checkDeletionEligibility(payload: any) {
    try {
      // Check if user owns any active projects
      const activeProjects = await this.projectService.findByOwner(payload.userId);

      if (activeProjects.length > 0) {
        // Cannot delete - transfer ownership first
        this.eventEmitter.emit('user.deletion.blocked', {
          ...payload,
          reason: 'User owns active projects',
          projects: activeProjects,
        });
        return;
      }

      // Proceed with deletion
      this.eventEmitter.emit('user.deletion.approved', payload);

    } catch (error) {
      this.eventEmitter.emit('user.deletion.failed', {
        ...payload,
        error: error.message,
      });
    }
  }

  // Step 2: Archive user data
  @OnEvent('user.deletion.approved')
  async archiveUserData(payload: any) {
    try {
      // Archive activities
      await this.activityService.archiveUserActivities(payload.userId);

      // Archive calculations
      await this.calculationService.archiveUserCalculations(payload.userId);

      // Archive reports
      await this.reportingService.archiveUserReports(payload.userId);

      this.eventEmitter.emit('user.data.archived', payload);

    } catch (error) {
      // Start compensation
      this.eventEmitter.emit('user.archival.failed', {
        ...payload,
        error: error.message,
      });
    }
  }

  // Step 3: Delete user permissions
  @OnEvent('user.data.archived')
  async deletePermissions(payload: any) {
    try {
      await this.permissionService.deleteUserPermissions(payload.userId);

      this.eventEmitter.emit('user.permissions.deleted', payload);

    } catch (error) {
      this.eventEmitter.emit('user.permission.deletion.failed', {
        ...payload,
        error: error.message,
      });
    }
  }

  // Step 4: Delete user account
  @OnEvent('user.permissions.deleted')
  async deleteUserAccount(payload: any) {
    try {
      await this.userService.deleteUser(payload.userId);

      this.eventEmitter.emit('user.account.deleted', payload);

    } catch (error) {
      this.eventEmitter.emit('user.account.deletion.failed', {
        ...payload,
        error: error.message,
      });
    }
  }

  // Step 5: Audit and notify
  @OnEvent('user.account.deleted')
  async auditAndNotify(payload: any) {
    // Log to audit
    await this.auditService.log({
      event: 'USER_DELETED',
      userId: payload.userId,
      deletedBy: payload.deletedBy,
      timestamp: new Date(),
    });

    // Send confirmation email
    await this.notificationService.sendUserDeletionConfirmation(payload.userId);

    this.eventEmitter.emit('user.deletion.completed', payload);
  }

  // Compensation handlers
  @OnEvent('user.archival.failed')
  async handleArchivalFailure(payload: any) {
    // Nothing to compensate yet
    this.markSagaFailed(payload.sagaId, 'Failed to archive user data');
  }

  @OnEvent('user.permission.deletion.failed')
  async handlePermissionDeletionFailure(payload: any) {
    // Restore archived data
    await this.activityService.restoreUserActivities(payload.userId);
    await this.calculationService.restoreUserCalculations(payload.userId);
    await this.reportingService.restoreUserReports(payload.userId);

    this.markSagaFailed(payload.sagaId, 'Failed to delete permissions');
  }

  @OnEvent('user.account.deletion.failed')
  async handleAccountDeletionFailure(payload: any) {
    // Restore permissions
    await this.permissionService.restoreUserPermissions(payload.userId);

    // Restore archived data
    await this.activityService.restoreUserActivities(payload.userId);
    await this.calculationService.restoreUserCalculations(payload.userId);
    await this.reportingService.restoreUserReports(payload.userId);

    this.markSagaFailed(payload.sagaId, 'Failed to delete user account');
  }

  private async markSagaFailed(sagaId: string, reason: string) {
    this.eventEmitter.emit('saga.failed', {
      sagaId,
      reason,
      timestamp: new Date(),
    });
  }
}
```

---

## Error Handling

### Saga Error Handling

```typescript
// File: NEW/shared/src/saga/error-handler.ts

import { Injectable, Logger } from '@nestjs/common';

export enum ErrorType {
  TIMEOUT = 'TIMEOUT',
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  BUSINESS = 'BUSINESS',
  SYSTEM = 'SYSTEM',
  UNKNOWN = 'UNKNOWN',
}

export interface SagaError {
  type: ErrorType;
  message: string;
  service?: string;
  step?: string;
  retryable: boolean;
  compensatable: boolean;
  details?: any;
}

@Injectable()
export class SagaErrorHandler {
  private readonly logger = new Logger(SagaErrorHandler.name);

  classifyError(error: any): SagaError {
    if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKETTIMEDOUT') {
      return {
        type: ErrorType.TIMEOUT,
        message: 'Operation timed out',
        retryable: true,
        compensatable: true,
        details: error,
      };
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return {
        type: ErrorType.NETWORK,
        message: 'Network error',
        retryable: true,
        compensatable: true,
        details: error,
      };
    }

    if (error.status === 400 || error.name === 'ValidationError') {
      return {
        type: ErrorType.VALIDATION,
        message: 'Validation error',
        retryable: false,
        compensatable: true,
        details: error,
      };
    }

    if (error.status >= 500) {
      return {
        type: ErrorType.SYSTEM,
        message: 'System error',
        retryable: true,
        compensatable: true,
        details: error,
      };
    }

    return {
      type: ErrorType.UNKNOWN,
      message: error.message || 'Unknown error',
      retryable: false,
      compensatable: true,
      details: error,
    };
  }

  shouldRetry(error: SagaError, attempt: number): boolean {
    if (!error.retryable) return false;

    // Don't retry validation errors
    if (error.type === ErrorType.VALIDATION) return false;

    // Retry network and timeout errors up to 3 times
    if (error.type === ErrorType.NETWORK || error.type === ErrorType.TIMEOUT) {
      return attempt < 3;
    }

    // Retry system errors up to 2 times
    if (error.type === ErrorType.SYSTEM) {
      return attempt < 2;
    }

    return false;
  }

  shouldCompensate(error: SagaError): boolean {
    // Always compensate for business errors
    if (error.type === ErrorType.BUSINESS) return true;

    // Don't compensate for validation errors in early steps
    if (error.type === ErrorType.VALIDATION) {
      return error.step !== 'validation' && error.step !== 'authorization';
    }

    // Compensate for persistent failures
    return error.compensatable;
  }

  getRetryDelay(attempt: number, errorType: ErrorType): number {
    const baseDelay = {
      [ErrorType.TIMEOUT]: 2000,
      [ErrorType.NETWORK]: 1000,
      [ErrorType.SYSTEM]: 3000,
      [ErrorType.BUSINESS]: 5000,
      [ErrorType.VALIDATION]: 0,
      [ErrorType.UNKNOWN]: 1000,
    };

    // Exponential backoff
    return baseDelay[errorType] * Math.pow(2, attempt - 1);
  }

  logError(sagaId: string, error: SagaError) {
    const logLevel = this.getLogLevel(error.type);

    const message = `Saga ${sagaId} error: ${error.message}`;
    const context = {
      sagaId,
      errorType: error.type,
      service: error.service,
      step: error.step,
      retryable: error.retryable,
      details: error.details,
    };

    switch (logLevel) {
      case 'error':
        this.logger.error(message, context);
        break;
      case 'warn':
        this.logger.warn(message, context);
        break;
      default:
        this.logger.log(message, context);
    }
  }

  private getLogLevel(errorType: ErrorType): string {
    switch (errorType) {
      case ErrorType.SYSTEM:
      case ErrorType.UNKNOWN:
        return 'error';
      case ErrorType.TIMEOUT:
      case ErrorType.NETWORK:
        return 'warn';
      default:
        return 'log';
    }
  }
}
```

---

## Monitoring & Observability

### Saga Metrics

```typescript
// File: NEW/shared/src/saga/metrics.ts

import { Injectable } from '@nestjs/common';
import { PrometheusService } from '../monitoring/prometheus.service';

@Injectable()
export class SagaMetricsService {
  private sagaStarted: Counter;
  private sagaCompleted: Counter;
  private sagaFailed: Counter;
  private sagaCompensated: Counter;
  private sagaDuration: Histogram;
  private stepDuration: Histogram;
  private compensationDuration: Histogram;
  private activeagaCount: Gauge;

  constructor(private prometheus: PrometheusService) {
    this.initializeMetrics();
  }

  private initializeMetrics() {
    this.sagaStarted = this.prometheus.createCounter({
      name: 'saga_started_total',
      help: 'Total number of sagas started',
      labelNames: ['saga_name'],
    });

    this.sagaCompleted = this.prometheus.createCounter({
      name: 'saga_completed_total',
      help: 'Total number of sagas completed successfully',
      labelNames: ['saga_name'],
    });

    this.sagaFailed = this.prometheus.createCounter({
      name: 'saga_failed_total',
      help: 'Total number of sagas failed',
      labelNames: ['saga_name', 'error_type'],
    });

    this.sagaCompensated = this.prometheus.createCounter({
      name: 'saga_compensated_total',
      help: 'Total number of sagas compensated',
      labelNames: ['saga_name'],
    });

    this.sagaDuration = this.prometheus.createHistogram({
      name: 'saga_duration_seconds',
      help: 'Duration of saga execution',
      labelNames: ['saga_name', 'status'],
      buckets: [0.5, 1, 2, 5, 10, 30, 60, 120],
    });

    this.stepDuration = this.prometheus.createHistogram({
      name: 'saga_step_duration_seconds',
      help: 'Duration of individual saga steps',
      labelNames: ['saga_name', 'step_name', 'service'],
      buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
    });

    this.compensationDuration = this.prometheus.createHistogram({
      name: 'saga_compensation_duration_seconds',
      help: 'Duration of saga compensation',
      labelNames: ['saga_name'],
      buckets: [0.5, 1, 2, 5, 10, 30],
    });

    this.activeSagaCount = this.prometheus.createGauge({
      name: 'saga_active_count',
      help: 'Number of currently active sagas',
      labelNames: ['saga_name'],
    });
  }

  recordSagaStart(sagaName: string) {
    this.sagaStarted.inc({ saga_name: sagaName });
    this.activeSagaCount.inc({ saga_name: sagaName });
  }

  recordSagaComplete(sagaName: string, duration: number) {
    this.sagaCompleted.inc({ saga_name: sagaName });
    this.sagaDuration.observe(
      { saga_name: sagaName, status: 'completed' },
      duration
    );
    this.activeSagaCount.dec({ saga_name: sagaName });
  }

  recordSagaFailure(sagaName: string, errorType: string, duration: number) {
    this.sagaFailed.inc({ saga_name: sagaName, error_type: errorType });
    this.sagaDuration.observe(
      { saga_name: sagaName, status: 'failed' },
      duration
    );
    this.activeSagaCount.dec({ saga_name: sagaName });
  }

  recordSagaCompensation(sagaName: string, duration: number) {
    this.sagaCompensated.inc({ saga_name: sagaName });
    this.compensationDuration.observe({ saga_name: sagaName }, duration);
  }

  recordStepDuration(sagaName: string, stepName: string, service: string, duration: number) {
    this.stepDuration.observe(
      { saga_name: sagaName, step_name: stepName, service },
      duration
    );
  }
}
```

---

## Testing Strategies

### Saga Testing

```typescript
// File: NEW/shared/test/saga.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { SagaOrchestrator } from '../src/saga/orchestrator';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('Saga Pattern', () => {
  let orchestrator: SagaOrchestrator;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SagaOrchestrator,
        EventEmitter2,
      ],
    }).compile();

    orchestrator = module.get<SagaOrchestrator>(SagaOrchestrator);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  describe('Orchestration Saga', () => {
    it('should complete saga successfully', async () => {
      // Register test saga
      orchestrator.registerSaga({
        name: 'TEST_SAGA',
        steps: [
          {
            name: 'step1',
            service: 'service1',
            action: 'action1',
          },
          {
            name: 'step2',
            service: 'service2',
            action: 'action2',
          },
        ],
      });

      // Mock service responses
      eventEmitter.on('saga.service1.action1', (data) => {
        eventEmitter.emit('saga.service1.action1.response', {
          sagaId: data.sagaId,
          data: { result: 'success1' },
        });
      });

      eventEmitter.on('saga.service2.action2', (data) => {
        eventEmitter.emit('saga.service2.action2.response', {
          sagaId: data.sagaId,
          data: { result: 'success2' },
        });
      });

      // Start saga
      const saga = await orchestrator.startSaga('TEST_SAGA', { input: 'test' });

      // Wait for completion
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify saga completed
      const status = await orchestrator.getSagaStatus(saga.id);
      expect(status?.state).toBe('COMPLETED');
    });

    it('should compensate on failure', async () => {
      // Register saga with compensation
      orchestrator.registerSaga({
        name: 'COMPENSATING_SAGA',
        steps: [
          {
            name: 'step1',
            service: 'service1',
            action: 'action1',
            compensate: 'compensate1',
          },
          {
            name: 'step2',
            service: 'service2',
            action: 'action2',
            compensate: 'compensate2',
          },
        ],
      });

      let compensated = false;

      // Mock successful first step
      eventEmitter.on('saga.service1.action1', (data) => {
        eventEmitter.emit('saga.service1.action1.response', {
          sagaId: data.sagaId,
          data: { result: 'success1' },
        });
      });

      // Mock failed second step
      eventEmitter.on('saga.service2.action2', (data) => {
        eventEmitter.emit('saga.service2.action2.error', {
          sagaId: data.sagaId,
          message: 'Service 2 failed',
        });
      });

      // Mock compensation
      eventEmitter.on('saga.service1.compensate1', (data) => {
        compensated = true;
        eventEmitter.emit('saga.service1.compensate1.response', {
          sagaId: data.sagaId,
          data: { compensated: true },
        });
      });

      // Start saga
      const saga = await orchestrator.startSaga('COMPENSATING_SAGA', {});

      // Wait for compensation
      await new Promise(resolve => setTimeout(resolve, 200));

      // Verify compensation occurred
      expect(compensated).toBe(true);

      const status = await orchestrator.getSagaStatus(saga.id);
      expect(status?.state).toBe('FAILED');
    });

    it('should handle timeouts', async () => {
      orchestrator.registerSaga({
        name: 'TIMEOUT_SAGA',
        timeout: 100,
        steps: [
          {
            name: 'slowStep',
            service: 'service1',
            action: 'slowAction',
          },
        ],
      });

      // Don't respond to simulate timeout
      eventEmitter.on('saga.service1.slowAction', () => {
        // No response
      });

      const saga = await orchestrator.startSaga('TIMEOUT_SAGA', {});

      // Wait for timeout
      await new Promise(resolve => setTimeout(resolve, 150));

      const status = await orchestrator.getSagaStatus(saga.id);
      expect(status?.state).toBe('TIMEOUT');
    });
  });

  describe('Choreography Saga', () => {
    it('should handle event-driven flow', async () => {
      const events: string[] = [];

      // Track events
      eventEmitter.on('*', (event) => {
        events.push(event);
      });

      // Simulate choreography
      eventEmitter.emit('order.placed', { orderId: '123' });

      // Service 1 responds to order
      eventEmitter.on('order.placed', () => {
        eventEmitter.emit('inventory.reserved', { orderId: '123' });
      });

      // Service 2 responds to inventory
      eventEmitter.on('inventory.reserved', () => {
        eventEmitter.emit('payment.processed', { orderId: '123' });
      });

      // Service 3 responds to payment
      eventEmitter.on('payment.processed', () => {
        eventEmitter.emit('order.confirmed', { orderId: '123' });
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify event chain
      expect(events).toContain('order.placed');
      expect(events).toContain('inventory.reserved');
      expect(events).toContain('payment.processed');
      expect(events).toContain('order.confirmed');
    });
  });

  describe('State Machine', () => {
    it('should transition through states correctly', () => {
      const stateMachine = createTestStateMachine();

      expect(stateMachine.state).toBe('idle');

      stateMachine.start();
      expect(stateMachine.state).toBe('processing');

      stateMachine.complete();
      expect(stateMachine.state).toBe('completed');
    });

    it('should handle invalid transitions', () => {
      const stateMachine = createTestStateMachine();

      expect(() => stateMachine.complete()).toThrow();
    });
  });
});

function createTestStateMachine() {
  return new StateMachine({
    init: 'idle',
    transitions: [
      { name: 'start', from: 'idle', to: 'processing' },
      { name: 'complete', from: 'processing', to: 'completed' },
      { name: 'fail', from: 'processing', to: 'failed' },
    ],
  });
}
```

---

**This completes the Saga Pattern Implementation for managing distributed transactions across microservices with comprehensive orchestration, choreography, and compensation strategies.**