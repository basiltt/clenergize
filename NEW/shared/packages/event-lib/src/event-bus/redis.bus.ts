import Redis from 'ioredis';
import { BaseEvent, IEventBus, IEventHandler } from '../base/base.event';

export interface RedisEventBusConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
}

/**
 * Redis Pub/Sub implementation of the EventBus
 * Used for local development and testing
 *
 * IMPORTANT: Uses Redis Pub/Sub database (REDIS_PUBSUB_DB) to avoid
 * collisions with cache data (REDIS_CACHE_DB)
 */
export class RedisEventBus implements IEventBus {
  private publisher: Redis;
  private subscriber: Redis;
  private handlers: Map<string, Set<IEventHandler<any>>>;
  private subscriptions: Set<string>;

  constructor(config: RedisEventBusConfig) {
    const redisConfig = {
      host: config.host,
      port: config.port,
      password: config.password,
      db: config.db || 1, // Use separate DB for pub/sub
      keyPrefix: config.keyPrefix,
    };

    this.publisher = new Redis(redisConfig);
    this.subscriber = new Redis(redisConfig);
    this.handlers = new Map();
    this.subscriptions = new Set();

    this.setupSubscriber();
  }

  async publish<T extends BaseEvent>(event: T): Promise<void> {
    const channel = this.getChannelName(event.type);
    const payload = JSON.stringify(event.toJSON());

    try {
      await this.publisher.publish(channel, payload);
      console.log(`Published event to Redis: ${event.type}`);
    } catch (error) {
      console.error('Redis publish error:', error);
      throw error;
    }
  }

  subscribe<T extends BaseEvent>(eventType: string, handler: IEventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }

    this.handlers.get(eventType)!.add(handler);

    // Subscribe to Redis channel if not already subscribed
    const channel = this.getChannelName(eventType);
    if (!this.subscriptions.has(channel)) {
      this.subscriber
        .subscribe(channel)
        .then(() => {
          console.log(`Subscribed to Redis channel: ${channel}`);
          this.subscriptions.add(channel);
        })
        .catch((err: Error) => {
          console.error(`Failed to subscribe to ${channel}:`, err);
        });
    }
  }

  /**
   * Setup Redis subscriber to handle incoming messages
   */
  private setupSubscriber(): void {
    this.subscriber.on('message', async (_channel: string, message: string) => {
      try {
        const event = JSON.parse(message);
        const eventType = event.type;

        const handlers = this.handlers.get(eventType);
        if (!handlers || handlers.size === 0) {
          console.warn(`No handlers for event type: ${eventType}`);
          return;
        }

        // Execute all handlers for this event type
        const promises = Array.from(handlers).map((handler) =>
          Promise.resolve(handler.handle(event as BaseEvent)).catch((error: Error) => {
            console.error(`Error in event handler for ${eventType}:`, error);
            throw error;
          })
        );

        await Promise.all(promises);
      } catch (error) {
        console.error('Error processing Redis message:', error);
      }
    });

    this.subscriber.on('error', (error: Error) => {
      console.error('Redis subscriber error:', error);
    });
  }

  /**
   * Get Redis channel name for an event type
   * Example: 'identity.user.created.v1' -> 'events:identity.user.created.v1'
   */
  private getChannelName(eventType: string): string {
    return `events:${eventType}`;
  }

  /**
   * Disconnect from Redis (call during shutdown)
   */
  async disconnect(): Promise<void> {
    await this.publisher.quit();
    await this.subscriber.quit();
    console.log('Redis EventBus disconnected');
  }
}
