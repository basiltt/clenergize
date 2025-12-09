import winston from 'winston';

/**
 * Logger Service
 *
 * Structured logging with correlation ID support.
 * Wraps Winston for consistent logging across all services.
 *
 * Usage:
 * ```typescript
 * import { Logger } from '@clenergize/common';
 *
 * const logger = Logger.create('identity-service');
 * logger.info('User logged in', { userId: '123', email: 'user@example.com' });
 * ```
 */

export interface LogContext {
  correlationId?: string;
  causationId?: string;
  userId?: string;
  service?: string;
  [key: string]: any;
}

export class Logger {
  private logger: winston.Logger;
  private readonly serviceName: string;
  private context: LogContext = {};

  private constructor(serviceName: string, level: string = 'info') {
    this.serviceName = serviceName;

    this.logger = winston.createLogger({
      level,
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: {
        service: serviceName,
        environment: process.env.NODE_ENV || 'development'
      },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ level, message, timestamp, ...meta }) => {
              const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
              return `${timestamp} [${level}] [${serviceName}]: ${message} ${metaStr}`;
            })
          )
        })
      ]
    });

    // Add file transport in production
    if (process.env.NODE_ENV === 'production') {
      this.logger.add(
        new winston.transports.File({
          filename: `logs/${serviceName}-error.log`,
          level: 'error',
          format: winston.format.json()
        })
      );
      this.logger.add(
        new winston.transports.File({
          filename: `logs/${serviceName}-combined.log`,
          format: winston.format.json()
        })
      );
    }
  }

  /**
   * Create logger instance
   */
  static create(serviceName: string, level?: string): Logger {
    return new Logger(serviceName, level);
  }

  /**
   * Set context for all subsequent logs
   */
  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Clear context
   */
  clearContext(): void {
    this.context = {};
  }

  /**
   * Create child logger with additional context
   */
  child(context: LogContext): Logger {
    const childLogger = new Logger(this.serviceName, this.logger.level);
    childLogger.context = { ...this.context, ...context };
    return childLogger;
  }

  /**
   * Log info message
   */
  info(message: string, meta?: LogContext): void {
    this.logger.info(message, { ...this.context, ...meta });
  }

  /**
   * Log warning message
   */
  warn(message: string, meta?: LogContext): void {
    this.logger.warn(message, { ...this.context, ...meta });
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | unknown, meta?: LogContext): void {
    const errorMeta = error instanceof Error
      ? { error: { message: error.message, stack: error.stack, name: error.name } }
      : { error };

    this.logger.error(message, { ...this.context, ...errorMeta, ...meta });
  }

  /**
   * Log debug message (only in development)
   */
  debug(message: string, meta?: LogContext): void {
    this.logger.debug(message, { ...this.context, ...meta });
  }

  /**
   * Log verbose message
   */
  verbose(message: string, meta?: LogContext): void {
    this.logger.verbose(message, { ...this.context, ...meta });
  }

  /**
   * Log HTTP request
   */
  logRequest(method: string, path: string, statusCode: number, duration: number, meta?: LogContext): void {
    this.info(`${method} ${path} ${statusCode}`, {
      ...meta,
      http: {
        method,
        path,
        statusCode,
        durationMs: duration
      }
    });
  }

  /**
   * Log database query
   */
  logQuery(operation: string, collection: string, duration: number, meta?: LogContext): void {
    this.debug(`DB ${operation} on ${collection}`, {
      ...meta,
      database: {
        operation,
        collection,
        durationMs: duration
      }
    });
  }

  /**
   * Log event published
   */
  logEvent(eventType: string, eventId: string, meta?: LogContext): void {
    this.info(`Event published: ${eventType}`, {
      ...meta,
      event: {
        type: eventType,
        id: eventId
      }
    });
  }
}

// Export singleton instance for convenience
export const createLogger = (serviceName: string, level?: string): Logger => {
  return Logger.create(serviceName, level);
};
