import { BaseEvent } from '@clenergize/event-lib';
import { MockEventBus } from '../mocks/event-bus.mock';

/**
 * Assertion helpers for event testing
 */
export class EventAssertions {
  /**
   * Assert that an event was published
   */
  static assertEventPublished(
    eventBus: MockEventBus,
    eventType: string,
    message?: string
  ): void {
    const wasPublished = eventBus.wasEventPublished(eventType);
    if (!wasPublished) {
      throw new Error(
        message || `Expected event "${eventType}" to be published, but it was not.`
      );
    }
  }

  /**
   * Assert that an event was NOT published
   */
  static assertEventNotPublished(
    eventBus: MockEventBus,
    eventType: string,
    message?: string
  ): void {
    const wasPublished = eventBus.wasEventPublished(eventType);
    if (wasPublished) {
      throw new Error(
        message || `Expected event "${eventType}" to NOT be published, but it was.`
      );
    }
  }

  /**
   * Assert event was published with specific data
   */
  static assertEventPublishedWith<T extends BaseEvent>(
    eventBus: MockEventBus,
    eventType: string,
    expectedData: Partial<T['toJSON']>,
    message?: string
  ): void {
    const event = eventBus.getLastPublishedEventOfType<T>(eventType);

    if (!event) {
      throw new Error(
        message || `Expected event "${eventType}" to be published, but it was not.`
      );
    }

    const eventData = event.toJSON();
    const mismatches: string[] = [];

    Object.entries(expectedData).forEach(([key, expectedValue]) => {
      const actualValue = (eventData as any)[key];
      if (JSON.stringify(actualValue) !== JSON.stringify(expectedValue)) {
        mismatches.push(
          `  ${key}: expected ${JSON.stringify(expectedValue)}, got ${JSON.stringify(actualValue)}`
        );
      }
    });

    if (mismatches.length > 0) {
      throw new Error(
        message ||
          `Event "${eventType}" was published but with different data:\n${mismatches.join('\n')}`
      );
    }
  }

  /**
   * Assert event count
   */
  static assertEventCount(
    eventBus: MockEventBus,
    expectedCount: number,
    eventType?: string,
    message?: string
  ): void {
    const actualCount = eventBus.getPublishedEventCount(eventType);

    if (actualCount !== expectedCount) {
      const typeStr = eventType ? ` of type "${eventType}"` : '';
      throw new Error(
        message ||
          `Expected ${expectedCount} event(s)${typeStr} to be published, but found ${actualCount}.`
      );
    }
  }
}

/**
 * Jest matcher extensions for event testing
 */
export const eventMatchers = {
  toHavePublishedEvent(eventBus: MockEventBus, eventType: string) {
    const pass = eventBus.wasEventPublished(eventType);

    return {
      pass,
      message: () =>
        pass
          ? `Expected event "${eventType}" NOT to be published`
          : `Expected event "${eventType}" to be published`,
    };
  },

  toHavePublishedEventCount(
    eventBus: MockEventBus,
    expectedCount: number,
    eventType?: string
  ) {
    const actualCount = eventBus.getPublishedEventCount(eventType);
    const pass = actualCount === expectedCount;
    const typeStr = eventType ? ` of type "${eventType}"` : '';

    return {
      pass,
      message: () =>
        pass
          ? `Expected NOT to publish ${expectedCount} event(s)${typeStr}`
          : `Expected to publish ${expectedCount} event(s)${typeStr}, but found ${actualCount}`,
    };
  },
};
