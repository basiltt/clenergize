import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CorrelationService } from './correlation.service';

/**
 * Middleware to extract and propagate correlation IDs through requests
 */
@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
  constructor(private correlationService: CorrelationService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Skip if correlation is disabled
    if (!this.correlationService.isEnabled()) {
      return next();
    }

    // Create correlation context from request
    const context = this.correlationService.createContextFromRequest(req);

    // Run the rest of the request handling within correlation context
    CorrelationService.getStorage().run(context, () => {
      // Add correlation headers to response
      this.correlationService.addCorrelationHeaders(res);

      // Log the request with correlation
      if (this.correlationService.getConfig().logCorrelation) {
        console.log('Request started', {
          ...this.correlationService.getContextSummary(),
          timestamp: new Date().toISOString(),
        });
      }

      // Handle response finish event
      res.on('finish', () => {
        if (this.correlationService.getConfig().logCorrelation) {
          const summary = this.correlationService.getContextSummary();
          console.log('Request completed', {
            ...summary,
            statusCode: res.statusCode,
            timestamp: new Date().toISOString(),
          });
        }
      });

      next();
    });
  }
}

/**
 * Functional middleware factory for use outside NestJS
 */
export function createCorrelationMiddleware(
  correlationService?: CorrelationService
): (req: Request, res: Response, next: NextFunction) => void {
  const service = correlationService || new CorrelationService();

  return (req: Request, res: Response, next: NextFunction) => {
    if (!service.isEnabled()) {
      return next();
    }

    const context = service.createContextFromRequest(req);

    CorrelationService.getStorage().run(context, () => {
      service.addCorrelationHeaders(res);

      if (service.getConfig().logCorrelation) {
        console.log('Request started', {
          ...service.getContextSummary(),
          timestamp: new Date().toISOString(),
        });
      }

      res.on('finish', () => {
        if (service.getConfig().logCorrelation) {
          const summary = service.getContextSummary();
          console.log('Request completed', {
            ...summary,
            statusCode: res.statusCode,
            timestamp: new Date().toISOString(),
          });
        }
      });

      next();
    });
  };
}