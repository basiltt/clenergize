/**
 * Correlation Tracking Interfaces
 */

/**
 * Context information stored for each request
 */
export interface CorrelationContext {
  /**
   * Unique ID for the current request across all services
   */
  correlationId: string;

  /**
   * ID of the event/request that caused this request
   */
  causationId?: string;

  /**
   * User ID if authenticated
   */
  userId?: string;

  /**
   * Session ID if available
   */
  sessionId?: string;

  /**
   * Request start timestamp
   */
  startTime: number;

  /**
   * Source service name
   */
  sourceService?: string;

  /**
   * Target service name
   */
  targetService?: string;

  /**
   * Request method (GET, POST, etc.)
   */
  method?: string;

  /**
   * Request path
   */
  path?: string;

  /**
   * Client IP address
   */
  clientIp?: string;

  /**
   * User agent string
   */
  userAgent?: string;

  /**
   * Custom metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Options for correlation ID generation
 */
export interface CorrelationOptions {
  /**
   * Prefix for generated IDs
   */
  prefix?: string;

  /**
   * Whether to use short IDs
   */
  useShortId?: boolean;

  /**
   * Custom ID generator function
   */
  generator?: () => string;
}

/**
 * Headers used for correlation tracking
 */
export interface CorrelationHeaders {
  'x-correlation-id'?: string;
  'x-causation-id'?: string;
  'x-session-id'?: string;
  'x-user-id'?: string;
  'x-source-service'?: string;
  'x-request-id'?: string;
}

/**
 * Configuration for correlation tracking
 */
export interface CorrelationConfig {
  /**
   * Enable correlation tracking
   */
  enabled: boolean;

  /**
   * Header name for correlation ID
   */
  correlationHeader: string;

  /**
   * Header name for causation ID
   */
  causationHeader: string;

  /**
   * Generate correlation ID if not present
   */
  generateIfMissing: boolean;

  /**
   * Log correlation information
   */
  logCorrelation: boolean;

  /**
   * Correlation ID prefix
   */
  idPrefix?: string;

  /**
   * Include in response headers
   */
  includeInResponse: boolean;

  /**
   * Custom headers to track
   */
  customHeaders?: string[];
}

/**
 * Correlation storage interface
 */
export interface CorrelationStore {
  /**
   * Get current context
   */
  getContext(): CorrelationContext | undefined;

  /**
   * Set context
   */
  setContext(context: CorrelationContext): void;

  /**
   * Clear context
   */
  clearContext(): void;

  /**
   * Run function with context
   */
  runWithContext<T>(context: CorrelationContext, fn: () => T): T;
}