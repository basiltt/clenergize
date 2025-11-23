/**
 * Event Bus Interfaces and Types
 */

import { RedisOptions } from 'ioredis';

/**
 * Base domain event interface
 */
export interface DomainEvent {
  id: string;
  type: string;
  version?: string;
  timestamp?: string;
  correlationId?: string;
  causationId?: string;
  userId?: string;
  aggregateId?: string;
  aggregateType?: string;
  payload: Record<string, any>;
  metadata?: EventMetadata;
}

/**
 * Event metadata
 */
export interface EventMetadata {
  eventId: string;
  eventType: string;
  eventVersion: string;
  correlationId: string;
  causationId?: string;
  timestamp: string;
  source: string;
  userId?: string;
  [key: string]: any;
}

/**
 * Event handler function type
 */
export type EventHandler<T extends DomainEvent> = (event: T) => Promise<void>;

/**
 * Event subscription information
 */
export interface EventSubscription {
  id: string;
  eventType: string;
  channel: string;
  handler: EventHandler<DomainEvent>;
  isActive: boolean;
}

/**
 * Options for publishing events
 */
export interface PublishOptions {
  correlationId?: string;
  causationId?: string;
  validateSchema?: boolean;
  retryOnFailure?: boolean;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  multiplier: number;
}

/**
 * Dead letter queue configuration
 */
export interface DeadLetterQueueConfig {
  enabled: boolean;
  channel: string;
}

/**
 * Event bus configuration
 */
export interface EventBusConfig {
  redis: RedisOptions;
  retry: RetryConfig;
  deadLetterQueue: DeadLetterQueueConfig;
  serviceName: string;
}

/**
 * Event pattern for NestJS event handling
 */
export interface EventPattern {
  eventType: string;
  version?: string;
}

/**
 * Common event payloads
 */

export interface EntityCreatedPayload {
  entity: Record<string, any>;
  entityType: string;
  entityId: string;
}

export interface EntityUpdatedPayload {
  entity: Record<string, any>;
  entityType: string;
  entityId: string;
  changes: Record<string, any>;
  previousValues?: Record<string, any>;
}

export interface EntityDeletedPayload {
  entityType: string;
  entityId: string;
  deletedBy?: string;
}

/**
 * Integration event for cross-service communication
 */
export interface IntegrationEvent extends DomainEvent {
  sourceService: string;
  targetService?: string;
  replyTo?: string;
}

/**
 * Command event for CQRS pattern
 */
export interface CommandEvent extends DomainEvent {
  commandName: string;
  commandId: string;
  expectsReply: boolean;
  replyChannel?: string;
}

/**
 * Query event for CQRS pattern
 */
export interface QueryEvent extends DomainEvent {
  queryName: string;
  queryId: string;
  replyChannel: string;
  filters?: Record<string, any>;
  pagination?: {
    page: number;
    limit: number;
  };
}

/**
 * Event store interface for event sourcing
 */
export interface EventStore {
  append(event: DomainEvent): Promise<void>;
  getEvents(aggregateId: string, fromVersion?: number): Promise<DomainEvent[]>;
  getEventsByType(eventType: string, limit?: number): Promise<DomainEvent[]>;
  getSnapshot(aggregateId: string): Promise<any>;
  saveSnapshot(aggregateId: string, snapshot: any, version: number): Promise<void>;
}

/**
 * Event projection interface
 */
export interface EventProjection {
  name: string;
  handle(event: DomainEvent): Promise<void>;
  rebuild(events: DomainEvent[]): Promise<void>;
  getState(): Promise<any>;
}

/**
 * Saga interface for long-running transactions
 */
export interface Saga {
  id: string;
  name: string;
  state: SagaState;
  handle(event: DomainEvent): Promise<CommandEvent[]>;
  onCompleted(): Promise<void>;
  onFailed(error: Error): Promise<void>;
}

export enum SagaState {
  STARTED = 'STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  COMPENSATING = 'COMPENSATING',
  COMPENSATED = 'COMPENSATED',
}