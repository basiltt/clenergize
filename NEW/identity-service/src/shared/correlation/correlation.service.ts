import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export interface CorrelationContext {
  correlationId: string;
  causationId?: string;
  userId?: string;
  startTime: number;
}

/**
 * Correlation Service using AsyncLocalStorage
 *
 * Enables request tracing across all microservices by maintaining
 * correlation context throughout async execution chains.
 */
@Injectable()
export class CorrelationService {
  private static storage = new AsyncLocalStorage<CorrelationContext>();

  static getStorage() {
    return this.storage;
  }

  getContext(): CorrelationContext | undefined {
    return CorrelationService.storage.getStore();
  }

  getCorrelationId(): string {
    return this.getContext()?.correlationId || 'UNKNOWN';
  }

  getCausationId(): string | undefined {
    return this.getContext()?.causationId;
  }

  getUserId(): string | undefined {
    return this.getContext()?.userId;
  }

  getStartTime(): number {
    return this.getContext()?.startTime || Date.now();
  }
}
