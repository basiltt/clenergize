/**
 * Clenergize Event Bus - Redis Pub/Sub Implementation
 *
 * This module provides a robust event-driven communication system for microservices
 * using Redis Pub/Sub with automatic retries, dead letter queues, and correlation IDs.
 *
 * Features:
 * - Event publishing and subscription
 * - Automatic retries with exponential backoff
 * - Dead letter queue for failed events
 * - Correlation ID tracking
 * - Event versioning support
 * - Schema validation
 * - Circuit breaker pattern
 */

export * from './event-bus.service';
export * from './event-bus.module';
export * from './interfaces';
export * from './decorators';
export * from './events';