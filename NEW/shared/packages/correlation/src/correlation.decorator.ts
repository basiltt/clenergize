import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CorrelationService } from './correlation.service';
import { CorrelationContext } from './correlation.interfaces';

/**
 * Parameter decorator to inject correlation ID into controller methods
 *
 * @example
 * ```typescript
 * @Get()
 * findAll(@CorrelationId() correlationId: string) {
 *   console.log('Correlation ID:', correlationId);
 * }
 * ```
 */
export const CorrelationId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['x-correlation-id'] ||
           request.headers['x-request-id'] ||
           request.correlationId;
  }
);

/**
 * Parameter decorator to inject causation ID into controller methods
 *
 * @example
 * ```typescript
 * @Post()
 * create(@CausationId() causationId: string) {
 *   console.log('Causation ID:', causationId);
 * }
 * ```
 */
export const CausationId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['x-causation-id'] || request.causationId;
  }
);

/**
 * Parameter decorator to inject the full correlation context
 *
 * @example
 * ```typescript
 * @Get()
 * findAll(@CorrelationContext() context: CorrelationContext) {
 *   console.log('Full context:', context);
 * }
 * ```
 */
export const CorrelationCtx = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CorrelationContext | undefined => {
    const correlationService = new CorrelationService();
    return correlationService.getContext();
  }
);

/**
 * Method decorator to automatically log correlation information
 *
 * @example
 * ```typescript
 * @LogCorrelation()
 * async processData(data: any) {
 *   // Method execution will be logged with correlation ID
 * }
 * ```
 */
export function LogCorrelation() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const correlationService = new CorrelationService();
      const context = correlationService.getContext();

      const startTime = Date.now();
      const className = target.constructor.name;
      const methodName = propertyKey;

      console.log('Method execution started', {
        class: className,
        method: methodName,
        correlationId: context?.correlationId,
        causationId: context?.causationId,
        userId: context?.userId,
      });

      try {
        const result = await originalMethod.apply(this, args);

        console.log('Method execution completed', {
          class: className,
          method: methodName,
          correlationId: context?.correlationId,
          duration: Date.now() - startTime,
        });

        return result;
      } catch (error) {
        console.error('Method execution failed', {
          class: className,
          method: methodName,
          correlationId: context?.correlationId,
          duration: Date.now() - startTime,
          error: (error as Error).message,
        });

        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Method decorator to add correlation to outgoing HTTP requests
 *
 * @example
 * ```typescript
 * @PropagateCorrelation()
 * async callExternalService(data: any) {
 *   // Outgoing requests will include correlation headers
 * }
 * ```
 */
export function PropagateCorrelation() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const correlationService = new CorrelationService();
      const headers = correlationService.getOutgoingHeaders();

      // If the method has an HTTP client, add headers
      if (this.httpService || this.http) {
        const httpClient = this.httpService || this.http;
        const originalRequest = httpClient.request;

        httpClient.request = function (config: any) {
          config.headers = {
            ...config.headers,
            ...headers,
          };
          return originalRequest.call(this, config);
        };
      }

      // If the method has axios, add headers
      if (this.axios) {
        this.axios.defaults.headers.common = {
          ...this.axios.defaults.headers.common,
          ...headers,
        };
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Class decorator to enable correlation tracking for all methods
 *
 * @example
 * ```typescript
 * @TrackCorrelation()
 * export class MyService {
 *   // All methods will have correlation tracking
 * }
 * ```
 */
export function TrackCorrelation() {
  return function (constructor: Function) {
    const originalMethods = Object.getOwnPropertyNames(constructor.prototype);

    originalMethods.forEach((methodName) => {
      if (methodName === 'constructor') {
        return;
      }

      const originalMethod = constructor.prototype[methodName];

      if (typeof originalMethod !== 'function') {
        return;
      }

      constructor.prototype[methodName] = async function (...args: any[]) {
        const correlationService = new CorrelationService();
        const context = correlationService.getContext();

        if (context && correlationService.getConfig().logCorrelation) {
          console.log(`${constructor.name}.${methodName} called`, {
            correlationId: context.correlationId,
            causationId: context.causationId,
          });
        }

        return originalMethod.apply(this, args);
      };
    });
  };
}