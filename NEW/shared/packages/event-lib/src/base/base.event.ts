import { v4 as uuidv4 } from 'uuid';

/**
 * Base class for all domain events in the system
 *
 * Event Naming Convention:
 * Format: <bounded-context>.<aggregate>.<action>.v<version>
 * Example: identity.user.created.v1
 *
 * Use lowercase with kebab-case for actions
 */
export abstract class BaseEvent {
  public readonly id: string;
  public readonly type: string;
  public readonly timestamp: string;
  public readonly version: number;
  public readonly correlationId?: string;
  public readonly causationId?: string;
  public readonly userId?: string;

  constructor(
    type: string,
    version: number = 1,
    correlationId?: string,
    causationId?: string,
    userId?: string
  ) {
    this.id = uuidv4();
    this.type = type;
    this.timestamp = new Date().toISOString();
    this.version = version;
    this.correlationId = correlationId;
    this.causationId = causationId;
    this.userId = userId;
  }

  /**
   * Serialize event to JSON for persistence or transmission
   */
  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      type: this.type,
      timestamp: this.timestamp,
      version: this.version,
      correlationId: this.correlationId,
      causationId: this.causationId,
      userId: this.userId,
      payload: this.getPayload(),
    };
  }

  /**
   * Get the event payload (to be implemented by subclasses)
   */
  protected abstract getPayload(): Record<string, any>;
}

/**
 * Interface for event metadata
 */
export interface EventMetadata {
  correlationId?: string;
  causationId?: string;
  userId?: string;
  source?: string;
  [key: string]: any;
}

/**
 * Interface for event handlers
 */
export interface IEventHandler<T extends BaseEvent> {
  handle(event: T): Promise<void> | void;
}

/**
 * Interface for event bus
 */
export interface IEventBus {
  publish<T extends BaseEvent>(event: T): Promise<void>;
  subscribe<T extends BaseEvent>(
    eventType: string,
    handler: IEventHandler<T>
  ): void;
}
