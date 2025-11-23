import { SetMetadata } from '@nestjs/common';
import { EventPattern } from './interfaces';

/**
 * Decorator to mark a method as an event handler
 * @param eventType The type of event to handle
 * @param version Optional event version
 */
export const OnEvent = (eventType: string, version?: string) => {
  return SetMetadata('event-pattern', { eventType, version } as EventPattern);
};

/**
 * Decorator to mark a class as an event handler
 */
export const EventHandler = () => {
  return (target: Function) => {
    SetMetadata('is-event-handler', true)(target);
  };
};

/**
 * Decorator to publish an event after method execution
 * @param eventType The type of event to publish
 */
export const PublishEvent = (eventType: string) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      const result = await originalMethod.apply(this, args);

      // The actual publishing logic would be injected via the service
      // This is a placeholder for the pattern
      if (this.eventBus) {
        await this.eventBus.publish({
          type: eventType,
          payload: result,
        });
      }

      return result;
    };

    return descriptor;
  };
};

/**
 * Decorator to add correlation ID to events
 */
export const WithCorrelationId = () => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      // Extract correlation ID from context if available
      const correlationId = this.correlationService?.getCorrelationId() ||
                          this.correlationId ||
                          args[0]?.correlationId;

      // Add correlation ID to the event
      if (args[0] && typeof args[0] === 'object') {
        args[0].correlationId = correlationId;
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
};

/**
 * Decorator for retry logic on event handlers
 */
export const Retry = (maxAttempts: number = 3, delay: number = 1000) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      let lastError: Error;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          lastError = error as Error;

          if (attempt < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, delay * attempt));
          }
        }
      }

      throw lastError!;
    };

    return descriptor;
  };
};