import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { CorrelationService } from './correlation.service';

/**
 * Logger that automatically includes correlation IDs in all log entries
 */
@Injectable()
export class CorrelationLogger implements LoggerService {
  private logger: winston.Logger;

  constructor(
    private correlationService: CorrelationService,
    serviceName?: string
  ) {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: {
        service: serviceName || process.env.SERVICE_NAME || 'unknown',
        environment: process.env.NODE_ENV || 'development',
      },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
      ],
    });
  }

  /**
   * Enrich log entry with correlation context
   */
  private enrichWithCorrelation(
    message: string,
    context?: any
  ): Record<string, any> {
    const correlationContext = this.correlationService.getContext();

    return {
      message,
      correlationId: correlationContext?.correlationId,
      causationId: correlationContext?.causationId,
      userId: correlationContext?.userId,
      sessionId: correlationContext?.sessionId,
      requestDuration: correlationContext
        ? Date.now() - correlationContext.startTime
        : undefined,
      ...context,
    };
  }

  /**
   * Log a message at the 'log' level
   */
  log(message: string, context?: any): void {
    this.logger.info(this.enrichWithCorrelation(message, context));
  }

  /**
   * Log an error message
   */
  error(message: string, trace?: string, context?: any): void {
    this.logger.error(
      this.enrichWithCorrelation(message, {
        ...context,
        trace,
        stack: trace,
      })
    );
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: any): void {
    this.logger.warn(this.enrichWithCorrelation(message, context));
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: any): void {
    this.logger.debug(this.enrichWithCorrelation(message, context));
  }

  /**
   * Log a verbose message
   */
  verbose(message: string, context?: any): void {
    this.logger.verbose(this.enrichWithCorrelation(message, context));
  }

  /**
   * Log an info message
   */
  info(message: string, context?: any): void {
    this.logger.info(this.enrichWithCorrelation(message, context));
  }

  /**
   * Create a child logger with additional metadata
   */
  child(metadata: Record<string, any>): CorrelationLogger {
    const childLogger = new CorrelationLogger(
      this.correlationService,
      metadata.service
    );

    childLogger.logger = this.logger.child(metadata);
    return childLogger;
  }

  /**
   * Log method entry with correlation
   */
  logMethodEntry(className: string, methodName: string, args?: any): void {
    this.debug(`Entering ${className}.${methodName}`, {
      className,
      methodName,
      args: this.sanitizeArgs(args),
    });
  }

  /**
   * Log method exit with correlation
   */
  logMethodExit(
    className: string,
    methodName: string,
    result?: any,
    duration?: number
  ): void {
    this.debug(`Exiting ${className}.${methodName}`, {
      className,
      methodName,
      duration,
      resultType: result ? typeof result : 'void',
    });
  }

  /**
   * Log method error with correlation
   */
  logMethodError(
    className: string,
    methodName: string,
    error: Error,
    duration?: number
  ): void {
    this.error(`Error in ${className}.${methodName}`, error.stack, {
      className,
      methodName,
      duration,
      errorName: error.name,
      errorMessage: error.message,
    });
  }

  /**
   * Sanitize arguments for logging (remove sensitive data)
   */
  private sanitizeArgs(args: any): any {
    if (!args) return undefined;

    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'key',
      'authorization',
      'cookie',
      'credit',
      'ssn',
      'pin',
    ];

    const sanitize = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) {
        return obj;
      }

      if (Array.isArray(obj)) {
        return obj.map(sanitize);
      }

      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        if (sensitiveFields.some((field) => lowerKey.includes(field))) {
          sanitized[key] = '[REDACTED]';
        } else if (typeof value === 'object') {
          sanitized[key] = sanitize(value);
        } else {
          sanitized[key] = value;
        }
      }

      return sanitized;
    };

    return sanitize(args);
  }
}

/**
 * Factory function to create a correlation-aware logger
 */
export function createCorrelationLogger(
  serviceName?: string,
  correlationService?: CorrelationService
): CorrelationLogger {
  const service = correlationService || new CorrelationService();
  return new CorrelationLogger(service, serviceName);
}