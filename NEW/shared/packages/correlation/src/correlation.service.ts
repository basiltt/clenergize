import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { v4 as uuidv4 } from 'uuid';
import { CorrelationContext, CorrelationConfig, CorrelationStore } from './correlation.interfaces';

/**
 * Service for managing correlation IDs and request context
 * Uses AsyncLocalStorage to maintain context across async operations
 */
@Injectable()
export class CorrelationService implements CorrelationStore {
  private static storage = new AsyncLocalStorage<CorrelationContext>();
  private config: CorrelationConfig;

  constructor(config?: Partial<CorrelationConfig>) {
    this.config = {
      enabled: true,
      correlationHeader: 'x-correlation-id',
      causationHeader: 'x-causation-id',
      generateIfMissing: true,
      logCorrelation: true,
      includeInResponse: true,
      ...config,
    };
  }

  /**
   * Get AsyncLocalStorage instance (for middleware use)
   */
  static getStorage(): AsyncLocalStorage<CorrelationContext> {
    return this.storage;
  }

  /**
   * Get current correlation context
   */
  getContext(): CorrelationContext | undefined {
    return CorrelationService.storage.getStore();
  }

  /**
   * Set correlation context
   */
  setContext(context: CorrelationContext): void {
    // This method is typically not used directly
    // Context is set via runWithContext
    throw new Error('Use runWithContext to set correlation context');
  }

  /**
   * Clear correlation context
   */
  clearContext(): void {
    // Context is automatically cleared when async context ends
    // This method is provided for completeness
  }

  /**
   * Run function with correlation context
   */
  runWithContext<T>(context: CorrelationContext, fn: () => T): T {
    return CorrelationService.storage.run(context, fn);
  }

  /**
   * Get correlation ID from current context
   */
  getCorrelationId(): string | undefined {
    return this.getContext()?.correlationId;
  }

  /**
   * Get causation ID from current context
   */
  getCausationId(): string | undefined {
    return this.getContext()?.causationId;
  }

  /**
   * Get user ID from current context
   */
  getUserId(): string | undefined {
    return this.getContext()?.userId;
  }

  /**
   * Get session ID from current context
   */
  getSessionId(): string | undefined {
    return this.getContext()?.sessionId;
  }

  /**
   * Generate a new correlation ID
   */
  generateCorrelationId(): string {
    const prefix = this.config.idPrefix || 'req';
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 9);
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Generate a UUID correlation ID
   */
  generateUuidCorrelationId(): string {
    return uuidv4();
  }

  /**
   * Create correlation context from request
   */
  createContextFromRequest(req: any): CorrelationContext {
    const headers = req.headers || {};

    // Extract or generate correlation ID
    let correlationId = headers[this.config.correlationHeader] ||
                       headers['x-request-id'] ||
                       headers['x-trace-id'];

    if (!correlationId && this.config.generateIfMissing) {
      correlationId = this.generateCorrelationId();
    }

    // Extract other IDs
    const causationId = headers[this.config.causationHeader];
    const sessionId = headers['x-session-id'] || req.session?.id;
    const userId = headers['x-user-id'] || req.user?.id;

    // Create context
    const context: CorrelationContext = {
      correlationId,
      causationId,
      userId,
      sessionId,
      startTime: Date.now(),
      sourceService: headers['x-source-service'],
      targetService: process.env.SERVICE_NAME,
      method: req.method,
      path: req.path || req.url,
      clientIp: this.extractClientIp(req),
      userAgent: headers['user-agent'],
      metadata: {},
    };

    // Add custom headers if configured
    if (this.config.customHeaders) {
      for (const header of this.config.customHeaders) {
        const value = headers[header.toLowerCase()];
        if (value) {
          context.metadata![header] = value;
        }
      }
    }

    return context;
  }

  /**
   * Extract client IP from request
   */
  private extractClientIp(req: any): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    return req.headers['x-real-ip'] ||
           req.connection?.remoteAddress ||
           req.socket?.remoteAddress ||
           req.ip;
  }

  /**
   * Add correlation headers to response
   */
  addCorrelationHeaders(res: any): void {
    if (!this.config.includeInResponse) {
      return;
    }

    const context = this.getContext();
    if (!context) {
      return;
    }

    res.setHeader('X-Correlation-Id', context.correlationId);

    if (context.causationId) {
      res.setHeader('X-Causation-Id', context.causationId);
    }

    // Add request duration
    const duration = Date.now() - context.startTime;
    res.setHeader('X-Request-Duration', duration.toString());
  }

  /**
   * Get correlation headers for outgoing requests
   */
  getOutgoingHeaders(): Record<string, string> {
    const context = this.getContext();
    if (!context) {
      return {};
    }

    const headers: Record<string, string> = {
      [this.config.correlationHeader]: context.correlationId,
    };

    // Current correlation becomes causation for next request
    headers[this.config.causationHeader] = context.correlationId;

    if (context.userId) {
      headers['x-user-id'] = context.userId;
    }

    if (context.sessionId) {
      headers['x-session-id'] = context.sessionId;
    }

    headers['x-source-service'] = process.env.SERVICE_NAME || 'unknown';

    return headers;
  }

  /**
   * Create a child context for sub-operations
   */
  createChildContext(causationId?: string): CorrelationContext {
    const parent = this.getContext();
    if (!parent) {
      throw new Error('No parent correlation context found');
    }

    return {
      ...parent,
      correlationId: this.generateCorrelationId(),
      causationId: causationId || parent.correlationId,
      startTime: Date.now(),
    };
  }

  /**
   * Get context summary for logging
   */
  getContextSummary(): Record<string, any> {
    const context = this.getContext();
    if (!context) {
      return {};
    }

    return {
      correlationId: context.correlationId,
      causationId: context.causationId,
      userId: context.userId,
      sessionId: context.sessionId,
      duration: Date.now() - context.startTime,
      method: context.method,
      path: context.path,
      source: context.sourceService,
      target: context.targetService,
    };
  }

  /**
   * Check if correlation is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Get configuration
   */
  getConfig(): CorrelationConfig {
    return { ...this.config };
  }
}