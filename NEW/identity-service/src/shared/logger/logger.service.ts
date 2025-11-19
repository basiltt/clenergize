import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import winston from 'winston';
import { CorrelationService } from '../correlation/correlation.service';

/**
 * Custom Logger Service
 *
 * Automatically enriches all log entries with correlation context:
 * - correlationId: Traces requests across services
 * - causationId: Tracks event causality chains
 * - userId: Associates logs with users
 * - service: Identifies the source service
 */
@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;

  constructor(private correlationService: CorrelationService) {
    this.logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ level, message, timestamp, ...meta }) => {
              const correlationId = meta.correlationId || 'UNKNOWN';
              const service = meta.service || 'identity-service';
              return `${timestamp} [${service}] ${level}: ${message} (correlationId: ${correlationId})`;
            })
          ),
        }),
      ],
    });
  }

  private enrichWithContext(message: string, context?: any) {
    return {
      message,
      correlationId: this.correlationService.getCorrelationId(),
      causationId: this.correlationService.getCausationId(),
      userId: this.correlationService.getUserId(),
      service: process.env.SERVICE_NAME || 'identity-service',
      ...context,
    };
  }

  log(message: string, context?: any) {
    this.logger.info(this.enrichWithContext(message, context));
  }

  error(message: string, trace?: string, context?: any) {
    this.logger.error(this.enrichWithContext(message, { ...context, trace }));
  }

  warn(message: string, context?: any) {
    this.logger.warn(this.enrichWithContext(message, context));
  }

  debug(message: string, context?: any) {
    this.logger.debug(this.enrichWithContext(message, context));
  }

  verbose(message: string, context?: any) {
    this.logger.verbose(this.enrichWithContext(message, context));
  }
}
