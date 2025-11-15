# SQS Polling Fix Skill

## Purpose
Fix infinite SQS polling loops that cause resource exhaustion and system instability (Issue C2).

## Problem in OLD Code

```typescript
// OLD: Infinite loops that never exit!
while (true) {
  const messages = await sqs.receiveMessage(params).promise();

  if (messages.Messages) {
    for (const message of messages.Messages) {
      await processMessage(message); // What if this fails?
      // No error handling, no backoff, no timeout!
    }
  }
  // Polls forever, even when service should shut down!
}

// Also problematic: No timeout, no cancellation
async function pollQueue() {
  const result = await sqs.receiveMessage({
    QueueUrl: queueUrl,
    WaitTimeSeconds: 20 // Long polling, but no escape!
  }).promise();

  // Recursive call with no exit condition
  await pollQueue(); // Stack overflow risk!
}
```

## Correct Implementation

### 1. Graceful SQS Consumer with Cancellation
```typescript
import { SQS } from '@aws-sdk/client-sqs';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class SQSConsumerService implements OnModuleDestroy {
  private sqs: SQS;
  private isRunning = false;
  private abortController: AbortController;
  private activeProcessing = new Set<string>();
  private readonly maxConcurrency = 10;
  private pollInterval: NodeJS.Timer;

  constructor(
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
    private logger: LoggerService,
    private metricsService: MetricsService
  ) {
    this.sqs = new SQS({
      region: this.configService.get('AWS_REGION'),
      endpoint: this.configService.get('AWS_ENDPOINT') // LocalStack for dev
    });
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('SQS consumer already running');
      return;
    }

    this.isRunning = true;
    this.abortController = new AbortController();

    this.logger.info('Starting SQS consumer...');

    // Use interval-based polling instead of while(true)
    this.pollInterval = setInterval(
      () => this.pollMessages(),
      1000 // Poll every second
    );

    // Initial poll
    await this.pollMessages();
  }

  async stop(): Promise<void> {
    this.logger.info('Stopping SQS consumer...');
    this.isRunning = false;

    // Stop polling
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }

    // Cancel in-flight requests
    if (this.abortController) {
      this.abortController.abort();
    }

    // Wait for active processing to complete (with timeout)
    await this.waitForActiveProcessing(30000); // 30 second timeout

    this.logger.info('SQS consumer stopped');
  }

  private async pollMessages(): Promise<void> {
    if (!this.isRunning) return;

    // Check concurrency limit
    if (this.activeProcessing.size >= this.maxConcurrency) {
      this.logger.debug('Max concurrency reached, skipping poll');
      return;
    }

    try {
      const messages = await this.receiveMessages();

      if (messages && messages.length > 0) {
        // Process messages in parallel with concurrency control
        await this.processMessages(messages);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        this.logger.info('Polling aborted');
      } else {
        this.logger.error('Error polling SQS', error);
        this.metricsService.incrementCounter('sqs.poll.error');

        // Exponential backoff on errors
        await this.handlePollingError(error);
      }
    }
  }

  private async receiveMessages(): Promise<SQSMessage[]> {
    const params = {
      QueueUrl: this.configService.get('SQS_QUEUE_URL'),
      MaxNumberOfMessages: Math.min(
        10,
        this.maxConcurrency - this.activeProcessing.size
      ),
      WaitTimeSeconds: 20, // Long polling
      VisibilityTimeout: 300, // 5 minutes to process
      MessageAttributeNames: ['All'],
      // Add abort signal for cancellation
      AbortSignal: this.abortController.signal
    };

    const response = await this.sqs.receiveMessage(params);

    if (!response.Messages) {
      return [];
    }

    this.metricsService.recordHistogram(
      'sqs.messages.received',
      response.Messages.length
    );

    return response.Messages.map(msg => ({
      id: msg.MessageId!,
      body: msg.Body!,
      receiptHandle: msg.ReceiptHandle!,
      attributes: msg.MessageAttributes || {},
      approximateReceiveCount: parseInt(
        msg.Attributes?.ApproximateReceiveCount || '0'
      )
    }));
  }

  private async processMessages(messages: SQSMessage[]): Promise<void> {
    const processingPromises = messages.map(message =>
      this.processMessageWithTimeout(message)
    );

    await Promise.allSettled(processingPromises);
  }

  private async processMessageWithTimeout(
    message: SQSMessage
  ): Promise<void> {
    const messageId = message.id;
    this.activeProcessing.add(messageId);

    const timeout = this.configService.get('MESSAGE_PROCESSING_TIMEOUT', 60000);

    try {
      // Wrap processing in timeout
      await Promise.race([
        this.processMessage(message),
        this.createTimeout(timeout, messageId)
      ]);

      // Delete message on success
      await this.deleteMessage(message.receiptHandle);
      this.metricsService.incrementCounter('sqs.message.success');

    } catch (error) {
      this.logger.error(`Failed to process message ${messageId}`, error);
      this.metricsService.incrementCounter('sqs.message.error');

      // Handle based on receive count
      await this.handleProcessingError(message, error);

    } finally {
      this.activeProcessing.delete(messageId);
    }
  }

  private async processMessage(message: SQSMessage): Promise<void> {
    const startTime = Date.now();

    try {
      // Parse message body
      const payload = JSON.parse(message.body);

      // Validate message
      this.validateMessage(payload);

      // Route to appropriate handler
      const handler = this.getMessageHandler(payload.type);

      if (!handler) {
        throw new Error(`No handler for message type: ${payload.type}`);
      }

      // Process with handler
      await handler.handle(payload);

      // Emit success event
      await this.eventEmitter.emitAsync('sqs.message.processed', {
        messageId: message.id,
        type: payload.type,
        duration: Date.now() - startTime
      });

    } catch (error) {
      // Emit failure event
      await this.eventEmitter.emitAsync('sqs.message.failed', {
        messageId: message.id,
        error: error.message,
        duration: Date.now() - startTime
      });

      throw error;
    }
  }

  private async handleProcessingError(
    message: SQSMessage,
    error: any
  ): Promise<void> {
    const maxRetries = this.configService.get('MAX_MESSAGE_RETRIES', 3);

    if (message.approximateReceiveCount >= maxRetries) {
      // Move to DLQ
      await this.moveToDeadLetterQueue(message, error);
    } else if (this.isRetryableError(error)) {
      // Return to queue with backoff
      const backoffSeconds = Math.pow(2, message.approximateReceiveCount) * 10;
      await this.changeMessageVisibility(
        message.receiptHandle,
        backoffSeconds
      );
    } else {
      // Non-retryable error, move to DLQ immediately
      await this.moveToDeadLetterQueue(message, error);
    }
  }

  private isRetryableError(error: any): boolean {
    // Determine if error is retryable
    const nonRetryableErrors = [
      'ValidationError',
      'InvalidMessageFormat',
      'UnauthorizedError'
    ];

    return !nonRetryableErrors.includes(error.name);
  }

  private async moveToDeadLetterQueue(
    message: SQSMessage,
    error: any
  ): Promise<void> {
    const dlqUrl = this.configService.get('SQS_DLQ_URL');

    if (!dlqUrl) {
      this.logger.error('No DLQ configured, message will be lost', {
        messageId: message.id
      });
      return;
    }

    try {
      // Send to DLQ with error metadata
      await this.sqs.sendMessage({
        QueueUrl: dlqUrl,
        MessageBody: message.body,
        MessageAttributes: {
          ...message.attributes,
          ErrorMessage: { DataType: 'String', StringValue: error.message },
          ErrorType: { DataType: 'String', StringValue: error.name },
          OriginalQueue: {
            DataType: 'String',
            StringValue: this.configService.get('SQS_QUEUE_URL')
          },
          FailedAt: {
            DataType: 'String',
            StringValue: new Date().toISOString()
          }
        }
      });

      // Delete from main queue
      await this.deleteMessage(message.receiptHandle);

      this.logger.warn(`Message ${message.id} moved to DLQ`, {
        error: error.message
      });

    } catch (dlqError) {
      this.logger.error('Failed to move message to DLQ', dlqError);
    }
  }

  private async deleteMessage(receiptHandle: string): Promise<void> {
    await this.sqs.deleteMessage({
      QueueUrl: this.configService.get('SQS_QUEUE_URL'),
      ReceiptHandle: receiptHandle
    });
  }

  private async changeMessageVisibility(
    receiptHandle: string,
    visibilityTimeout: number
  ): Promise<void> {
    await this.sqs.changeMessageVisibility({
      QueueUrl: this.configService.get('SQS_QUEUE_URL'),
      ReceiptHandle: receiptHandle,
      VisibilityTimeout: visibilityTimeout
    });
  }

  private createTimeout(ms: number, messageId: string): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Message ${messageId} processing timeout after ${ms}ms`));
      }, ms);
    });
  }

  private async waitForActiveProcessing(timeout: number): Promise<void> {
    const startTime = Date.now();

    while (this.activeProcessing.size > 0) {
      if (Date.now() - startTime > timeout) {
        this.logger.warn(
          `Timeout waiting for ${this.activeProcessing.size} messages to complete`
        );
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  private async handlePollingError(error: any): Promise<void> {
    // Exponential backoff with jitter
    const baseDelay = 1000; // 1 second
    const maxDelay = 60000; // 1 minute
    const attempt = this.getErrorAttempt(error);

    const delay = Math.min(
      baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
      maxDelay
    );

    this.logger.info(`Backing off for ${delay}ms after error`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private getErrorAttempt(error: any): number {
    // Track error attempts for backoff calculation
    if (!error._attempts) {
      error._attempts = 0;
    }
    return error._attempts++;
  }

  private validateMessage(payload: any): void {
    if (!payload.type) {
      throw new Error('Message missing type field');
    }

    if (!payload.data) {
      throw new Error('Message missing data field');
    }

    if (!payload.timestamp) {
      throw new Error('Message missing timestamp field');
    }

    // Check message age
    const messageAge = Date.now() - new Date(payload.timestamp).getTime();
    const maxAge = this.configService.get('MAX_MESSAGE_AGE', 3600000); // 1 hour

    if (messageAge > maxAge) {
      throw new Error(`Message too old: ${messageAge}ms`);
    }
  }

  private getMessageHandler(type: string): MessageHandler | null {
    // Map message types to handlers
    const handlers: Record<string, MessageHandler> = {
      'report.generate': this.reportGenerationHandler,
      'email.send': this.emailHandler,
      'calculation.execute': this.calculationHandler,
      'import.process': this.importHandler
    };

    return handlers[type] || null;
  }

  async onModuleDestroy(): Promise<void> {
    await this.stop();
  }
}

interface SQSMessage {
  id: string;
  body: string;
  receiptHandle: string;
  attributes: Record<string, any>;
  approximateReceiveCount: number;
}

interface MessageHandler {
  handle(payload: any): Promise<void>;
}
```

### 2. Message Handler Implementation
```typescript
@Injectable()
export class ReportGenerationHandler implements MessageHandler {
  constructor(
    private reportService: ReportService,
    private logger: LoggerService
  ) {}

  async handle(payload: any): Promise<void> {
    const { reportId, parameters } = payload.data;

    this.logger.info(`Generating report ${reportId}`);

    try {
      // Process with proper error handling and timeout
      const report = await this.reportService.generate(reportId, parameters);

      // Notify completion
      await this.notifyReportComplete(reportId, report);

    } catch (error) {
      // Handle specific error types
      if (error instanceof DataNotAvailableError) {
        // Retry later
        throw error;
      } else if (error instanceof InvalidParametersError) {
        // Don't retry, notify failure
        await this.notifyReportFailed(reportId, error);
      } else {
        // Unknown error, retry
        throw error;
      }
    }
  }

  private async notifyReportComplete(reportId: string, report: any): Promise<void> {
    // Send completion notification
  }

  private async notifyReportFailed(reportId: string, error: any): Promise<void> {
    // Send failure notification
  }
}
```

### 3. Circuit Breaker Pattern
```typescript
@Injectable()
export class CircuitBreakerService {
  private states = new Map<string, CircuitState>();
  private readonly defaultOptions: CircuitBreakerOptions = {
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 60000, // 1 minute
    halfOpenRequests: 3
  };

  async execute<T>(
    name: string,
    fn: () => Promise<T>,
    options?: CircuitBreakerOptions
  ): Promise<T> {
    const state = this.getState(name);
    const opts = { ...this.defaultOptions, ...options };

    if (state.status === 'OPEN') {
      if (Date.now() - state.lastFailureTime < opts.timeout) {
        throw new CircuitOpenError(`Circuit ${name} is OPEN`);
      }
      // Try half-open
      state.status = 'HALF_OPEN';
      state.halfOpenAttempts = 0;
    }

    if (state.status === 'HALF_OPEN' &&
        state.halfOpenAttempts >= opts.halfOpenRequests) {
      throw new CircuitOpenError(`Circuit ${name} is HALF_OPEN, max attempts reached`);
    }

    try {
      const result = await fn();

      // Success
      if (state.status === 'HALF_OPEN') {
        state.successCount++;
        state.halfOpenAttempts++;

        if (state.successCount >= opts.successThreshold) {
          state.status = 'CLOSED';
          state.failureCount = 0;
          state.successCount = 0;
        }
      } else {
        state.failureCount = 0;
      }

      return result;

    } catch (error) {
      // Failure
      state.failureCount++;
      state.lastFailureTime = Date.now();
      state.successCount = 0;

      if (state.failureCount >= opts.failureThreshold) {
        state.status = 'OPEN';
        this.logger.warn(`Circuit ${name} opened after ${state.failureCount} failures`);
      }

      throw error;
    }
  }

  private getState(name: string): CircuitState {
    if (!this.states.has(name)) {
      this.states.set(name, {
        status: 'CLOSED',
        failureCount: 0,
        successCount: 0,
        lastFailureTime: 0,
        halfOpenAttempts: 0
      });
    }
    return this.states.get(name)!;
  }
}

interface CircuitState {
  status: 'OPEN' | 'CLOSED' | 'HALF_OPEN';
  failureCount: number;
  successCount: number;
  lastFailureTime: number;
  halfOpenAttempts: number;
}
```

### 4. Graceful Shutdown Handler
```typescript
@Injectable()
export class ShutdownService {
  private shutdownCallbacks: Array<() => Promise<void>> = [];
  private isShuttingDown = false;

  constructor() {
    // Register signal handlers
    process.on('SIGTERM', () => this.shutdown('SIGTERM'));
    process.on('SIGINT', () => this.shutdown('SIGINT'));
  }

  registerShutdownCallback(callback: () => Promise<void>): void {
    this.shutdownCallbacks.push(callback);
  }

  private async shutdown(signal: string): Promise<void> {
    if (this.isShuttingDown) {
      console.log('Shutdown already in progress');
      return;
    }

    this.isShuttingDown = true;
    console.log(`Received ${signal}, starting graceful shutdown...`);

    // Set timeout for forced shutdown
    const forceShutdownTimeout = setTimeout(() => {
      console.error('Forced shutdown due to timeout');
      process.exit(1);
    }, 30000); // 30 seconds

    try {
      // Execute all shutdown callbacks
      await Promise.all(
        this.shutdownCallbacks.map(callback =>
          callback().catch(error =>
            console.error('Shutdown callback error:', error)
          )
        )
      );

      console.log('Graceful shutdown complete');
      clearTimeout(forceShutdownTimeout);
      process.exit(0);

    } catch (error) {
      console.error('Error during shutdown:', error);
      clearTimeout(forceShutdownTimeout);
      process.exit(1);
    }
  }
}
```

### 5. Health Check for Queue Processing
```typescript
@Injectable()
export class QueueHealthIndicator extends HealthIndicator {
  constructor(
    private sqsConsumer: SQSConsumerService,
    private sqs: SQS
  ) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // Check queue attributes
      const attributes = await this.sqs.getQueueAttributes({
        QueueUrl: this.configService.get('SQS_QUEUE_URL'),
        AttributeNames: [
          'ApproximateNumberOfMessages',
          'ApproximateNumberOfMessagesNotVisible',
          'ApproximateNumberOfMessagesDelayed'
        ]
      });

      const messagesAvailable = parseInt(
        attributes.Attributes?.ApproximateNumberOfMessages || '0'
      );
      const messagesInFlight = parseInt(
        attributes.Attributes?.ApproximateNumberOfMessagesNotVisible || '0'
      );

      const isHealthy = messagesAvailable < 10000 && messagesInFlight < 100;

      return this.getStatus(key, isHealthy, {
        messagesAvailable,
        messagesInFlight,
        consumerRunning: this.sqsConsumer.isRunning,
        activeProcessing: this.sqsConsumer.activeProcessing.size
      });

    } catch (error) {
      return this.getStatus(key, false, { error: error.message });
    }
  }
}
```

## Testing SQS Polling

```typescript
describe('SQS Consumer', () => {
  let consumer: SQSConsumerService;
  let sqsMock: jest.Mocked<SQS>;

  beforeEach(() => {
    consumer = new SQSConsumerService(/* dependencies */);
    sqsMock = consumer['sqs'] as jest.Mocked<SQS>;
  });

  it('should stop polling when service stops', async () => {
    await consumer.start();
    expect(consumer['isRunning']).toBe(true);

    await consumer.stop();
    expect(consumer['isRunning']).toBe(false);
    expect(consumer['pollInterval']).toBeUndefined();
  });

  it('should handle message processing timeout', async () => {
    const message = createMockMessage();
    const slowHandler = jest.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100000))
    );

    consumer['getMessageHandler'] = jest.fn().mockReturnValue({
      handle: slowHandler
    });

    await consumer['processMessageWithTimeout'](message);

    expect(slowHandler).toHaveBeenCalled();
    // Should timeout and handle error
    expect(consumer['handleProcessingError']).toHaveBeenCalled();
  });

  it('should move message to DLQ after max retries', async () => {
    const message = createMockMessage();
    message.approximateReceiveCount = 3;

    await consumer['handleProcessingError'](message, new Error('Test error'));

    expect(sqsMock.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        QueueUrl: 'dlq-url'
      })
    );
  });

  it('should implement exponential backoff on errors', async () => {
    const error = new Error('Test error');
    const delays: number[] = [];

    jest.spyOn(global, 'setTimeout').mockImplementation((fn, delay) => {
      delays.push(delay as number);
      return {} as any;
    });

    await consumer['handlePollingError'](error);
    await consumer['handlePollingError'](error);
    await consumer['handlePollingError'](error);

    // Check exponential increase
    expect(delays[1]).toBeGreaterThan(delays[0]);
    expect(delays[2]).toBeGreaterThan(delays[1]);
  });
});
```

## Key Points

1. **No infinite loops** - Use intervals or event-driven approach
2. **Always have exit conditions** - Check `isRunning` flag
3. **Implement timeouts** - Prevent stuck processing
4. **Handle errors gracefully** - Exponential backoff
5. **Support cancellation** - AbortController for in-flight requests
6. **Limit concurrency** - Prevent resource exhaustion
7. **Use DLQ** - Don't lose messages
8. **Graceful shutdown** - Wait for active processing
9. **Circuit breaker** - Prevent cascade failures
10. **Monitor health** - Queue depth, processing rate

Remember: Infinite loops are never acceptable. Always have proper exit conditions and timeouts.