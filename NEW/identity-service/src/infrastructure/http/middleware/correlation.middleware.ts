import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CorrelationService } from '../../../shared/correlation/correlation.service';

/**
 * Correlation Middleware
 *
 * Captures or generates correlation IDs for all incoming requests.
 * Stores context in AsyncLocalStorage for automatic propagation.
 */
@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId = (req.headers['x-correlation-id'] as string) || uuidv4();
    const causationId = req.headers['x-causation-id'] as string;
    const userId = (req as any).user?.id;

    const context = {
      correlationId,
      causationId,
      userId,
      startTime: Date.now(),
    };

    // Store context for this async execution
    CorrelationService.getStorage().run(context, () => {
      // Add to response headers
      res.setHeader('X-Correlation-Id', correlationId);
      if (causationId) {
        res.setHeader('X-Causation-Id', causationId);
      }

      next();
    });
  }
}
