import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CorrelationService } from './correlation.service';

/**
 * Interceptor to add correlation tracking to all requests
 * Can be used as an alternative or in addition to middleware
 */
@Injectable()
export class CorrelationInterceptor implements NestInterceptor {
  constructor(private correlationService: CorrelationService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Create correlation context if not already present
    let existingContext = this.correlationService.getContext();

    if (!existingContext) {
      const newContext = this.correlationService.createContextFromRequest(request);

      // Run the handler within correlation context
      return new Observable(subscriber => {
        CorrelationService.getStorage().run(newContext, () => {
          next.handle()
            .pipe(
              tap(() => {
                // Add correlation headers to response
                this.correlationService.addCorrelationHeaders(response);

                // Log completion
                if (this.correlationService.getConfig().logCorrelation) {
                  const summary = this.correlationService.getContextSummary();
                  console.log('Request handled by interceptor', {
                    ...summary,
                    handlerName: context.getHandler().name,
                    className: context.getClass().name,
                  });
                }
              })
            )
            .subscribe(subscriber);
        });
      });
    }

    // Context already exists (likely set by middleware)
    return next.handle().pipe(
      tap(() => {
        // Add correlation headers to response
        this.correlationService.addCorrelationHeaders(response);

        // Log completion
        if (this.correlationService.getConfig().logCorrelation) {
          const summary = this.correlationService.getContextSummary();
          console.log('Request handled by interceptor', {
            ...summary,
            handlerName: context.getHandler().name,
            className: context.getClass().name,
          });
        }
      })
    );
  }
}

/**
 * Global correlation interceptor that can be applied at the application level
 */
@Injectable()
export class GlobalCorrelationInterceptor implements NestInterceptor {
  private correlationService: CorrelationService;

  constructor() {
    this.correlationService = new CorrelationService({
      enabled: true,
      generateIfMissing: true,
      includeInResponse: true,
      logCorrelation: process.env.NODE_ENV !== 'production',
    });
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    // Skip for non-HTTP contexts
    if (!request || !response) {
      return next.handle();
    }

    // Check if context already exists
    const existingContext = this.correlationService.getContext();
    if (existingContext) {
      return next.handle();
    }

    // Create new context
    const newContext = this.correlationService.createContextFromRequest(request);

    return new Observable(subscriber => {
      CorrelationService.getStorage().run(newContext, () => {
        next.handle()
          .pipe(
            tap({
              next: () => {
                this.correlationService.addCorrelationHeaders(response);
              },
              error: (error) => {
                this.correlationService.addCorrelationHeaders(response);

                // Log error with correlation
                console.error('Request failed', {
                  ...this.correlationService.getContextSummary(),
                  error: error.message,
                  stack: error.stack,
                });
              },
            })
          )
          .subscribe(subscriber);
      });
    });
  }
}