import { BaseEvent, IEventBus, IEventHandler } from '@clenergize/event-lib';

/**
 * Mock EventBus for testing
 * Captures published events without actually sending them
 */
export class MockEventBus implements IEventBus {
  private publishedEvents: BaseEvent[] = [];
  private handlers: Map<string, Set<IEventHandler<any>>> = new Map();

  async publish<T extends BaseEvent>(event: T): Promise<void> {
    this.publishedEvents.push(event);

    // Also trigger any registered handlers for testing
    const handlers = this.handlers.get(event.type);
    if (handlers) {
      await Promise.all(Array.from(handlers).map((handler) => handler.handle(event)));
    }
  }

  subscribe<T extends BaseEvent>(eventType: string, handler: IEventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
  }

  /**
   * Get all published events
   */
  getPublishedEvents(): BaseEvent[] {
    return [...this.publishedEvents];
  }

  /**
   * Get published events of a specific type
   */
  getPublishedEventsOfType<T extends BaseEvent>(eventType: string): T[] {
    return this.publishedEvents.filter((e) => e.type === eventType) as T[];
  }

  /**
   * Get the last published event
   */
  getLastPublishedEvent(): BaseEvent | undefined {
    return this.publishedEvents[this.publishedEvents.length - 1];
  }

  /**
   * Get the last published event of a specific type
   */
  getLastPublishedEventOfType<T extends BaseEvent>(eventType: string): T | undefined {
    return this.getPublishedEventsOfType<T>(eventType).pop();
  }

  /**
   * Check if an event was published
   */
  wasEventPublished(eventType: string): boolean {
    return this.publishedEvents.some((e) => e.type === eventType);
  }

  /**
   * Count published events
   */
  getPublishedEventCount(eventType?: string): number {
    if (eventType) {
      return this.publishedEvents.filter((e) => e.type === eventType).length;
    }
    return this.publishedEvents.length;
  }

  /**
   * Clear all published events (useful between tests)
   */
  clear(): void {
    this.publishedEvents = [];
  }

  /**
   * Reset the mock (clear events and handlers)
   */
  reset(): void {
    this.publishedEvents = [];
    this.handlers.clear();
  }
}

/**
 * Create a mock event bus for testing
 */
export function createMockEventBus(): MockEventBus {
  return new MockEventBus();
}
