import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { BaseEvent, IEventBus, IEventHandler } from '../base/base.event';

export interface EventBridgeConfig {
  region: string;
  eventBusName: string;
  endpoint?: string;
}

/**
 * AWS EventBridge implementation of the EventBus
 * Used in production for reliable, scalable event delivery
 */
export class EventBridgeEventBus implements IEventBus {
  private client: EventBridgeClient;
  private eventBusName: string;
  private handlers: Map<string, Set<IEventHandler<any>>>;

  constructor(config: EventBridgeConfig) {
    this.client = new EventBridgeClient({
      region: config.region,
      ...(config.endpoint && { endpoint: config.endpoint }),
    });
    this.eventBusName = config.eventBusName;
    this.handlers = new Map();
  }

  async publish<T extends BaseEvent>(event: T): Promise<void> {
    const command = new PutEventsCommand({
      Entries: [
        {
          Source: `clenergize.${this.extractServiceName(event.type)}`,
          DetailType: event.type,
          Detail: JSON.stringify(event.toJSON()),
          EventBusName: this.eventBusName,
        },
      ],
    });

    try {
      const response = await this.client.send(command);

      if (response.FailedEntryCount && response.FailedEntryCount > 0) {
        const error = response.Entries?.[0]?.ErrorMessage || 'Unknown error';
        throw new Error(`Failed to publish event: ${error}`);
      }
    } catch (error) {
      console.error('EventBridge publish error:', error);
      throw error;
    }
  }

  subscribe<T extends BaseEvent>(eventType: string, handler: IEventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }

    this.handlers.get(eventType)!.add(handler);
    console.log(`Subscribed to event: ${eventType}`);
  }

  /**
   * Handle incoming event from EventBridge (called by NestJS event handler)
   */
  async handleEvent<T extends BaseEvent>(event: T): Promise<void> {
    const handlers = this.handlers.get(event.type);

    if (!handlers || handlers.size === 0) {
      console.warn(`No handlers registered for event type: ${event.type}`);
      return;
    }

    const promises = Array.from(handlers).map((handler) =>
      Promise.resolve(handler.handle(event)).catch((error) => {
        console.error(`Error in event handler for ${event.type}:`, error);
        throw error;
      })
    );

    await Promise.all(promises);
  }

  /**
   * Extract service name from event type
   * Example: 'identity.user.created.v1' -> 'identity'
   */
  private extractServiceName(eventType: string): string {
    return eventType.split('.')[0] || 'unknown';
  }
}
