import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import {
  DomainEvent,
  EventBusConfig,
  EventHandler,
  EventMetadata,
  EventSubscription,
  PublishOptions,
  RetryConfig,
} from './interfaces';
import { EventSchema } from './event-schema.registry';
import { CircuitBreaker } from './circuit-breaker';

/**
 * Redis-based Event Bus implementation for microservice communication
 * Provides reliable event publishing and subscription with retries and DLQ
 */
@Injectable()
export class EventBusService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventBusService.name);
  private publisher: Redis;
  private subscriber: Redis;
  private subscriptions: Map<string, EventSubscription[]> = new Map();
  private config: EventBusConfig;
  private circuitBreaker: CircuitBreaker;
  private isConnected = false;

  constructor(private configService: ConfigService) {
    this.config = this.loadConfiguration();
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      timeout: 60000,
      resetTime: 30000,
    });
  }

  /**
   * Load configuration from environment variables
   */
  private loadConfiguration(): EventBusConfig {
    return {
      redis: {
        host: this.configService.get<string>('REDIS_HOST', 'localhost'),
        port: this.configService.get<number>('REDIS_PORT', 6379),
        password: this.configService.get<string>('REDIS_PASSWORD'),
        db: this.configService.get<number>('REDIS_PUBSUB_DB', 1),
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        enableOfflineQueue: true,
        maxRetriesPerRequest: 3,
      },
      retry: {
        maxAttempts: this.configService.get<number>('EVENT_RETRY_MAX_ATTEMPTS', 3),
        initialDelay: this.configService.get<number>('EVENT_RETRY_INITIAL_DELAY', 1000),
        maxDelay: this.configService.get<number>('EVENT_RETRY_MAX_DELAY', 10000),
        multiplier: this.configService.get<number>('EVENT_RETRY_MULTIPLIER', 2),
      },
      deadLetterQueue: {
        enabled: this.configService.get<boolean>('EVENT_DLQ_ENABLED', true),
        channel: this.configService.get<string>('EVENT_DLQ_CHANNEL', 'event-bus:dlq'),
      },
      serviceName: this.configService.get<string>('SERVICE_NAME', 'unknown'),
    };
  }

  /**
   * Initialize Redis connections on module startup
   */
  async onModuleInit() {
    await this.connect();
  }

  /**
   * Cleanup connections on module shutdown
   */
  async onModuleDestroy() {
    await this.disconnect();
  }

  /**
   * Establish Redis connections
   */
  private async connect(): Promise<void> {
    try {
      this.logger.log('Connecting to Redis for event bus...');

      // Create separate connections for pub and sub
      this.publisher = new Redis(this.config.redis);
      this.subscriber = new Redis(this.config.redis);

      // Set up error handlers
      this.publisher.on('error', (error) => {
        this.logger.error('Redis publisher error', error);
        this.isConnected = false;
      });

      this.subscriber.on('error', (error) => {
        this.logger.error('Redis subscriber error', error);
        this.isConnected = false;
      });

      // Set up connection handlers
      this.publisher.on('connect', () => {
        this.logger.log('Redis publisher connected');
      });

      this.subscriber.on('connect', () => {
        this.logger.log('Redis subscriber connected');
        this.isConnected = true;
      });

      // Wait for connections
      await Promise.all([
        this.publisher.ping(),
        this.subscriber.ping(),
      ]);

      this.logger.log('Event bus connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect to event bus', error);
      throw error;
    }
  }

  /**
   * Disconnect from Redis
   */
  private async disconnect(): Promise<void> {
    try {
      this.logger.log('Disconnecting from event bus...');

      // Unsubscribe from all channels
      await this.subscriber.unsubscribe();

      // Close connections
      await Promise.all([
        this.publisher?.quit(),
        this.subscriber?.quit(),
      ]);

      this.isConnected = false;
      this.logger.log('Event bus disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting from event bus', error);
    }
  }

  /**
   * Publish an event to the event bus
   */
  async publish<T extends DomainEvent>(
    event: T,
    options: PublishOptions = {}
  ): Promise<void> {
    const eventId = event.id || uuidv4();
    const correlationId = options.correlationId || event.correlationId || uuidv4();
    const timestamp = new Date().toISOString();

    // Enrich event with metadata
    const enrichedEvent = {
      ...event,
      id: eventId,
      correlationId,
      metadata: {
        eventId,
        eventType: event.type,
        eventVersion: event.version || '1.0.0',
        correlationId,
        causationId: options.causationId || event.causationId,
        timestamp,
        source: this.config.serviceName,
        userId: event.userId,
        ...event.metadata,
      } as EventMetadata,
    };

    // Validate event schema if available
    if (options.validateSchema !== false) {
      this.validateEventSchema(enrichedEvent);
    }

    // Use circuit breaker for publishing
    await this.circuitBreaker.execute(async () => {
      const channel = this.getChannelName(event.type);
      const message = JSON.stringify(enrichedEvent);

      this.logger.debug(`Publishing event to channel: ${channel}`, {
        eventId,
        eventType: event.type,
        correlationId,
      });

      await this.publisher.publish(channel, message);

      this.logger.log(`Event published successfully`, {
        eventId,
        eventType: event.type,
        correlationId,
      });
    });
  }

  /**
   * Subscribe to events of a specific type
   */
  async subscribe<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>,
    options: { concurrency?: number } = {}
  ): Promise<EventSubscription> {
    const channel = this.getChannelName(eventType);
    const subscriptionId = uuidv4();

    // Create subscription object
    const subscription: EventSubscription = {
      id: subscriptionId,
      eventType,
      channel,
      handler: handler as EventHandler<DomainEvent>,
      isActive: true,
    };

    // Store subscription
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }
    this.subscriptions.get(eventType)!.push(subscription);

    // Subscribe to Redis channel
    await this.subscriber.subscribe(channel);

    // Set up message handler
    this.subscriber.on('message', async (receivedChannel, message) => {
      if (receivedChannel !== channel) return;

      try {
        const event = JSON.parse(message) as T;
        await this.handleEvent(event, subscription);
      } catch (error) {
        this.logger.error(`Error processing event from channel ${channel}`, error);
        await this.handleEventError(message, error as Error);
      }
    });

    this.logger.log(`Subscribed to event type: ${eventType} on channel: ${channel}`);

    return subscription;
  }

  /**
   * Unsubscribe from events
   */
  async unsubscribe(subscriptionId: string): Promise<void> {
    for (const [eventType, subscriptions] of this.subscriptions.entries()) {
      const index = subscriptions.findIndex(s => s.id === subscriptionId);
      if (index !== -1) {
        const subscription = subscriptions[index];
        subscription.isActive = false;
        subscriptions.splice(index, 1);

        // If no more subscriptions for this event type, unsubscribe from Redis
        if (subscriptions.length === 0) {
          await this.subscriber.unsubscribe(subscription.channel);
          this.subscriptions.delete(eventType);
        }

        this.logger.log(`Unsubscribed from event type: ${eventType}`);
        return;
      }
    }
  }

  /**
   * Handle incoming event
   */
  private async handleEvent(
    event: DomainEvent,
    subscription: EventSubscription
  ): Promise<void> {
    const startTime = Date.now();

    try {
      this.logger.debug(`Handling event`, {
        eventId: event.id,
        eventType: event.type,
        correlationId: event.correlationId,
      });

      // Execute handler with retry logic
      await this.executeWithRetry(
        () => subscription.handler(event),
        this.config.retry
      );

      const duration = Date.now() - startTime;
      this.logger.log(`Event handled successfully`, {
        eventId: event.id,
        eventType: event.type,
        correlationId: event.correlationId,
        duration,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`Failed to handle event after retries`, {
        eventId: event.id,
        eventType: event.type,
        correlationId: event.correlationId,
        duration,
        error: (error as Error).message,
      });

      // Send to dead letter queue
      await this.sendToDeadLetterQueue(event, error as Error);
      throw error;
    }
  }

  /**
   * Execute function with retry logic
   */
  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    config: RetryConfig
  ): Promise<T> {
    let lastError: Error;
    let delay = config.initialDelay;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`Attempt ${attempt} failed`, {
          error: lastError.message,
          nextRetryIn: delay,
        });

        if (attempt < config.maxAttempts) {
          await this.sleep(delay);
          delay = Math.min(delay * config.multiplier, config.maxDelay);
        }
      }
    }

    throw lastError!;
  }

  /**
   * Handle event processing errors
   */
  private async handleEventError(message: string, error: Error): Promise<void> {
    this.logger.error('Failed to process event message', {
      error: error.message,
      message: message.substring(0, 500),
    });

    // Send raw message to DLQ if we can't parse it
    if (this.config.deadLetterQueue.enabled) {
      const dlqMessage = {
        originalMessage: message,
        error: error.message,
        timestamp: new Date().toISOString(),
        service: this.config.serviceName,
      };

      await this.publisher.publish(
        this.config.deadLetterQueue.channel,
        JSON.stringify(dlqMessage)
      );
    }
  }

  /**
   * Send failed event to dead letter queue
   */
  private async sendToDeadLetterQueue(
    event: DomainEvent,
    error: Error
  ): Promise<void> {
    if (!this.config.deadLetterQueue.enabled) return;

    try {
      const dlqMessage = {
        event,
        error: {
          message: error.message,
          stack: error.stack,
        },
        timestamp: new Date().toISOString(),
        service: this.config.serviceName,
        retryCount: this.config.retry.maxAttempts,
      };

      await this.publisher.publish(
        this.config.deadLetterQueue.channel,
        JSON.stringify(dlqMessage)
      );

      this.logger.warn('Event sent to dead letter queue', {
        eventId: event.id,
        eventType: event.type,
      });
    } catch (dlqError) {
      this.logger.error('Failed to send event to dead letter queue', dlqError);
    }
  }

  /**
   * Get channel name for event type
   */
  private getChannelName(eventType: string): string {
    return `event-bus:${eventType}`;
  }

  /**
   * Validate event against schema
   */
  private validateEventSchema(event: DomainEvent): void {
    // TODO: Implement schema validation using Zod or Joi
    // For now, just validate required fields
    if (!event.type) {
      throw new Error('Event type is required');
    }

    if (!event.id) {
      throw new Error('Event ID is required');
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get event bus health status
   */
  async getHealth(): Promise<{
    isHealthy: boolean;
    details: Record<string, any>;
  }> {
    try {
      const pubPing = await this.publisher.ping();
      const subPing = await this.subscriber.ping();

      return {
        isHealthy: this.isConnected && pubPing === 'PONG' && subPing === 'PONG',
        details: {
          publisher: pubPing === 'PONG' ? 'connected' : 'disconnected',
          subscriber: subPing === 'PONG' ? 'connected' : 'disconnected',
          subscriptions: Array.from(this.subscriptions.keys()),
          circuitBreaker: this.circuitBreaker.getState(),
        },
      };
    } catch (error) {
      return {
        isHealthy: false,
        details: {
          error: (error as Error).message,
        },
      };
    }
  }
}