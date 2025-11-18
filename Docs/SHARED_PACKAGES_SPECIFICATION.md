# Shared TypeScript Packages Specification

**Version**: 1.0.0
**Last Updated**: November 18, 2025
**Status**: ACTIVE
**Sprint**: 0.1
**Priority**: CRITICAL

---

## Executive Summary

This document specifies the complete structure, interfaces, and implementation patterns for all shared TypeScript packages used across the Clenergize V3 microservices architecture. These packages ensure consistency, reduce duplication, and enforce architectural patterns across all 7 backend services and the frontend application.

### Package Overview

| Package | Purpose | Used By | Version |
|---------|---------|---------|---------|
| `@clenergize/common` | Core shared utilities, value objects, errors | All services + frontend | 1.0.0 |
| `@clenergize/contracts` | Event schemas, API contracts, DTOs | All services | 1.0.0 |
| `@clenergize/testing` | Test utilities, mocks, fixtures | All services | 1.0.0 |

---

## Table of Contents

1. [@clenergize/common Package](#clenergizecommon-package)
2. [@clenergize/contracts Package](#clenergizecontracts-package)
3. [@clenergize/testing Package](#clenergizetes testing-package)
4. [Package Development Workflow](#package-development-workflow)
5. [Versioning Strategy](#versioning-strategy)
6. [Migration from OLD](#migration-from-old)

---

## @clenergize/common Package

### Package Structure

```
@clenergize/common/
├── src/
│   ├── domain/
│   │   ├── value-objects/
│   │   │   ├── index.ts
│   │   │   ├── email.vo.ts
│   │   │   ├── user-id.vo.ts
│   │   │   ├── organization-id.vo.ts
│   │   │   ├── project-id.vo.ts
│   │   │   ├── date-range.vo.ts
│   │   │   ├── money.vo.ts
│   │   │   └── percentage.vo.ts
│   │   ├── errors/
│   │   │   ├── index.ts
│   │   │   ├── domain-error.base.ts
│   │   │   ├── validation-error.ts
│   │   │   ├── authorization-error.ts
│   │   │   ├── not-found-error.ts
│   │   │   ├── conflict-error.ts
│   │   │   └── business-rule-error.ts
│   │   └── events/
│   │       ├── index.ts
│   │       ├── base-event.ts
│   │       ├── event-bus.interface.ts
│   │       └── event-handler.interface.ts
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── index.ts
│   │   │   ├── base-repository.ts
│   │   │   ├── base-repository.interface.ts
│   │   │   ├── mongodb-connection.ts
│   │   │   ├── transaction.decorator.ts
│   │   │   └── query-builder.ts
│   │   ├── http/
│   │   │   ├── index.ts
│   │   │   ├── base-http-client.ts
│   │   │   ├── circuit-breaker.ts
│   │   │   ├── retry-policy.ts
│   │   │   └── http-error.ts
│   │   ├── messaging/
│   │   │   ├── index.ts
│   │   │   ├── eventbridge-client.ts
│   │   │   ├── redis-pub-sub.ts
│   │   │   └── message-queue.interface.ts
│   │   └── logging/
│   │       ├── index.ts
│   │       ├── logger.interface.ts
│   │       ├── structured-logger.ts
│   │       ├── correlation-id.middleware.ts
│   │       └── log-context.ts
│   ├── config/
│   │   ├── index.ts
│   │   ├── env-validator.ts
│   │   ├── base-config.ts
│   │   ├── service-config.interface.ts
│   │   └── config.schemas.ts
│   └── utils/
│       ├── index.ts
│       ├── pagination.ts
│       ├── validators.ts
│       ├── transformers.ts
│       ├── date-utils.ts
│       └── crypto-utils.ts
├── test/
│   └── unit/
├── package.json
├── tsconfig.json
└── README.md
```

---

### 1. Domain Layer - Value Objects

#### Email Value Object

```typescript
// src/domain/value-objects/email.vo.ts
import { z } from 'zod';
import { ValidationError } from '../errors';

export class Email {
  private readonly value: string;

  private constructor(email: string) {
    this.value = email.toLowerCase().trim();
  }

  static create(email: string): Email {
    const schema = z.string().email();
    const result = schema.safeParse(email);

    if (!result.success) {
      throw new ValidationError('Invalid email address', {
        field: 'email',
        value: email,
        errors: result.error.errors
      });
    }

    return new Email(result.data);
  }

  getValue(): string {
    return this.value;
  }

  getDomain(): string {
    return this.value.split('@')[1];
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
```

#### User ID Value Object

```typescript
// src/domain/value-objects/user-id.vo.ts
import { v4 as uuid, validate as validateUuid } from 'uuid';
import { ValidationError } from '../errors';

export class UserId {
  private readonly value: string;

  private constructor(id: string) {
    this.value = id;
  }

  static create(id?: string): UserId {
    if (id) {
      if (!validateUuid(id)) {
        throw new ValidationError('Invalid user ID format', {
          field: 'userId',
          value: id,
          expected: 'UUID v4'
        });
      }
      return new UserId(id);
    }
    return new UserId(uuid());
  }

  getValue(): string {
    return this.value;
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
```

#### Date Range Value Object

```typescript
// src/domain/value-objects/date-range.vo.ts
import { BusinessRuleError } from '../errors';

export class DateRange {
  private constructor(
    private readonly startDate: Date,
    private readonly endDate: Date
  ) {}

  static create(startDate: Date, endDate: Date): DateRange {
    if (startDate >= endDate) {
      throw new BusinessRuleError(
        'Start date must be before end date',
        {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      );
    }

    return new DateRange(startDate, endDate);
  }

  getStartDate(): Date {
    return new Date(this.startDate);
  }

  getEndDate(): Date {
    return new Date(this.endDate);
  }

  getDurationInDays(): number {
    const diff = this.endDate.getTime() - this.startDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  contains(date: Date): boolean {
    return date >= this.startDate && date <= this.endDate;
  }

  overlaps(other: DateRange): boolean {
    return this.startDate < other.endDate && this.endDate > other.startDate;
  }
}
```

#### Money Value Object

```typescript
// src/domain/value-objects/money.vo.ts
import { ValidationError } from '../errors';

export class Money {
  private constructor(
    private readonly amount: number,
    private readonly currency: string
  ) {}

  static create(amount: number, currency: string = 'USD'): Money {
    if (amount < 0) {
      throw new ValidationError('Amount cannot be negative', {
        amount,
        currency
      });
    }

    if (!/^[A-Z]{3}$/.test(currency)) {
      throw new ValidationError('Invalid currency code', {
        currency,
        expected: 'ISO 4217 format (e.g., USD, EUR)'
      });
    }

    // Round to 2 decimal places
    const roundedAmount = Math.round(amount * 100) / 100;

    return new Money(roundedAmount, currency);
  }

  getAmount(): number {
    return this.amount;
  }

  getCurrency(): string {
    return this.currency;
  }

  add(other: Money): Money {
    this.ensureSameCurrency(other);
    return Money.create(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    this.ensureSameCurrency(other);
    return Money.create(this.amount - other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return Money.create(this.amount * factor, this.currency);
  }

  private ensureSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new BusinessRuleError(
        'Cannot perform operation on different currencies',
        {
          currency1: this.currency,
          currency2: other.currency
        }
      );
    }
  }

  format(locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this.currency
    }).format(this.amount);
  }
}
```

---

### 2. Domain Layer - Errors

#### Base Domain Error

```typescript
// src/domain/errors/domain-error.base.ts
export abstract class DomainError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: any;
  public readonly timestamp: Date;

  protected constructor(
    message: string,
    code: string,
    statusCode: number,
    details?: any
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date();
    this.name = this.constructor.name;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp.toISOString()
    };
  }
}
```

#### Validation Error

```typescript
// src/domain/errors/validation-error.ts
import { DomainError } from './domain-error.base';

export class ValidationError extends DomainError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }

  static fromZodError(zodError: any, context?: string): ValidationError {
    const errors = zodError.errors.map((err: any) => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }));

    return new ValidationError(
      context || 'Validation failed',
      { errors }
    );
  }
}
```

#### Authorization Error

```typescript
// src/domain/errors/authorization-error.ts
import { DomainError } from './domain-error.base';

export class AuthorizationError extends DomainError {
  constructor(message: string = 'Access denied', details?: any) {
    super(message, 'AUTHORIZATION_ERROR', 403, details);
  }
}

export class AuthenticationError extends DomainError {
  constructor(message: string = 'Authentication required', details?: any) {
    super(message, 'AUTHENTICATION_ERROR', 401, details);
  }
}
```

#### Not Found Error

```typescript
// src/domain/errors/not-found-error.ts
import { DomainError } from './domain-error.base';

export class NotFoundError extends DomainError {
  constructor(
    resourceType: string,
    identifier: string | number,
    details?: any
  ) {
    super(
      `${resourceType} not found`,
      'NOT_FOUND',
      404,
      { resourceType, identifier, ...details }
    );
  }
}
```

#### Conflict Error

```typescript
// src/domain/errors/conflict-error.ts
import { DomainError } from './domain-error.base';

export class ConflictError extends DomainError {
  constructor(message: string, details?: any) {
    super(message, 'CONFLICT', 409, details);
  }
}
```

#### Business Rule Error

```typescript
// src/domain/errors/business-rule-error.ts
import { DomainError } from './domain-error.base';

export class BusinessRuleError extends DomainError {
  constructor(message: string, details?: any) {
    super(message, 'BUSINESS_RULE_VIOLATION', 422, details);
  }
}
```

---

### 3. Domain Layer - Events

#### Base Event

```typescript
// src/domain/events/base-event.ts
import { v4 as uuid } from 'uuid';

export abstract class BaseEvent {
  public readonly id: string;
  public readonly occurredAt: Date;
  public readonly version: string;
  public correlationId?: string;
  public causationId?: string;

  protected constructor(
    public readonly type: string,
    public readonly aggregateId: string,
    public readonly aggregateType: string,
    version: string = '1.0'
  ) {
    this.id = uuid();
    this.occurredAt = new Date();
    this.version = version;
  }

  setCorrelationId(correlationId: string): this {
    this.correlationId = correlationId;
    return this;
  }

  setCausationId(causationId: string): this {
    this.causationId = causationId;
    return this;
  }

  abstract getData(): any;

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      version: this.version,
      occurredAt: this.occurredAt.toISOString(),
      aggregateId: this.aggregateId,
      aggregateType: this.aggregateType,
      correlationId: this.correlationId,
      causationId: this.causationId,
      data: this.getData()
    };
  }
}
```

#### Event Bus Interface

```typescript
// src/domain/events/event-bus.interface.ts
import { BaseEvent } from './base-event';

export interface IEventBus {
  /**
   * Publish an event to the event bus
   */
  publish<T extends BaseEvent>(event: T): Promise<void>;

  /**
   * Publish multiple events atomically
   */
  publishBatch<T extends BaseEvent>(events: T[]): Promise<void>;

  /**
   * Subscribe to events of a specific type
   */
  subscribe<T extends BaseEvent>(
    eventType: string,
    handler: IEventHandler<T>
  ): Promise<void>;

  /**
   * Unsubscribe from events
   */
  unsubscribe(eventType: string, handlerId: string): Promise<void>;
}
```

#### Event Handler Interface

```typescript
// src/domain/events/event-handler.interface.ts
import { BaseEvent } from './base-event';

export interface IEventHandler<T extends BaseEvent = BaseEvent> {
  /**
   * Unique identifier for this handler
   */
  readonly handlerId: string;

  /**
   * Event types this handler responds to
   */
  readonly eventTypes: string[];

  /**
   * Handle the event
   */
  handle(event: T): Promise<void>;

  /**
   * Handle errors during event processing
   */
  onError?(event: T, error: Error): Promise<void>;
}
```

---

### 4. Infrastructure Layer - Database

#### Base Repository Interface

```typescript
// src/infrastructure/database/base-repository.interface.ts
export interface IBaseRepository<T> {
  /**
   * Find entity by ID
   */
  findById(id: string): Promise<T | null>;

  /**
   * Find all entities matching filter
   */
  findAll(filter?: Partial<T>, options?: QueryOptions): Promise<T[]>;

  /**
   * Find one entity matching filter
   */
  findOne(filter: Partial<T>): Promise<T | null>;

  /**
   * Create new entity
   */
  create(entity: T): Promise<T>;

  /**
   * Update existing entity
   */
  update(id: string, updates: Partial<T>): Promise<T>;

  /**
   * Delete entity
   */
  delete(id: string): Promise<void>;

  /**
   * Count entities matching filter
   */
  count(filter?: Partial<T>): Promise<number>;

  /**
   * Check if entity exists
   */
  exists(filter: Partial<T>): Promise<boolean>;
}

export interface QueryOptions {
  skip?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
  projection?: Record<string, 0 | 1>;
}
```

#### Base Repository Implementation

```typescript
// src/infrastructure/database/base-repository.ts
import { Collection, Filter, UpdateFilter, ClientSession } from 'mongodb';
import { IBaseRepository, QueryOptions } from './base-repository.interface';
import { NotFoundError } from '../../domain/errors';

export abstract class BaseRepository<T extends { id: string }>
  implements IBaseRepository<T> {

  constructor(
    protected readonly collection: Collection,
    protected readonly entityName: string
  ) {}

  async findById(id: string): Promise<T | null> {
    const result = await this.collection.findOne({ _id: id } as Filter<T>);
    return result ? this.mapToDomain(result) : null;
  }

  async findAll(filter?: Partial<T>, options?: QueryOptions): Promise<T[]> {
    const query = this.collection.find(
      this.buildFilter(filter),
      { projection: options?.projection }
    );

    if (options?.skip) query.skip(options.skip);
    if (options?.limit) query.limit(options.limit);
    if (options?.sort) query.sort(options.sort);

    const results = await query.toArray();
    return results.map(r => this.mapToDomain(r));
  }

  async findOne(filter: Partial<T>): Promise<T | null> {
    const result = await this.collection.findOne(this.buildFilter(filter));
    return result ? this.mapToDomain(result) : null;
  }

  async create(entity: T, session?: ClientSession): Promise<T> {
    const document = this.mapToDocument(entity);
    await this.collection.insertOne(document, { session });
    return entity;
  }

  async update(id: string, updates: Partial<T>, session?: ClientSession): Promise<T> {
    const updateDoc = this.mapToDocument(updates) as UpdateFilter<T>;

    const result = await this.collection.findOneAndUpdate(
      { _id: id } as Filter<T>,
      { $set: updateDoc },
      { returnDocument: 'after', session }
    );

    if (!result.value) {
      throw new NotFoundError(this.entityName, id);
    }

    return this.mapToDomain(result.value);
  }

  async delete(id: string, session?: ClientSession): Promise<void> {
    const result = await this.collection.deleteOne(
      { _id: id } as Filter<T>,
      { session }
    );

    if (result.deletedCount === 0) {
      throw new NotFoundError(this.entityName, id);
    }
  }

  async count(filter?: Partial<T>): Promise<number> {
    return this.collection.countDocuments(this.buildFilter(filter));
  }

  async exists(filter: Partial<T>): Promise<boolean> {
    const count = await this.collection.countDocuments(
      this.buildFilter(filter),
      { limit: 1 }
    );
    return count > 0;
  }

  protected buildFilter(filter?: Partial<T>): Filter<T> {
    if (!filter) return {} as Filter<T>;

    // Convert 'id' to '_id' for MongoDB
    const mongoFilter: any = { ...filter };
    if (mongoFilter.id) {
      mongoFilter._id = mongoFilter.id;
      delete mongoFilter.id;
    }

    return mongoFilter as Filter<T>;
  }

  protected abstract mapToDomain(document: any): T;
  protected abstract mapToDocument(entity: Partial<T>): any;
}
```

#### Transaction Decorator

```typescript
// src/infrastructure/database/transaction.decorator.ts
import { MongoClient, ClientSession } from 'mongodb';

export function Transactional() {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const mongoClient: MongoClient = this.mongoClient;
      const session: ClientSession = mongoClient.startSession();

      try {
        let result;
        await session.withTransaction(async () => {
          // Inject session into method arguments
          result = await method.apply(this, [...args, session]);
        });
        return result;
      } finally {
        await session.endSession();
      }
    };

    return descriptor;
  };
}

// Usage example:
// @Transactional()
// async createUserWithOrganization(userData: any, orgData: any, session?: ClientSession) {
//   await this.userRepo.create(userData, session);
//   await this.orgRepo.create(orgData, session);
// }
```

---

### 5. Infrastructure Layer - HTTP Client

#### Base HTTP Client

```typescript
// src/infrastructure/http/base-http-client.ts
import { CircuitBreaker } from './circuit-breaker';
import { RetryPolicy } from './retry-policy';
import { HttpError } from './http-error';
import { CorrelationIdMiddleware } from '../logging/correlation-id.middleware';

export interface HttpClientConfig {
  baseUrl: string;
  timeout?: number;
  retryPolicy?: RetryPolicy;
  circuitBreaker?: CircuitBreaker;
  headers?: Record<string, string>;
}

export interface RequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

export class BaseHttpClient {
  private readonly retryPolicy: RetryPolicy;
  private readonly circuitBreaker: CircuitBreaker;

  constructor(private readonly config: HttpClientConfig) {
    this.retryPolicy = config.retryPolicy || RetryPolicy.default();
    this.circuitBreaker = config.circuitBreaker || CircuitBreaker.default();
  }

  async request<T>(requestConfig: RequestConfig): Promise<T> {
    return this.circuitBreaker.execute(() =>
      this.retryPolicy.execute(() =>
        this.executeRequest<T>(requestConfig)
      )
    );
  }

  async get<T>(url: string, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({ ...config, url, method: 'GET' });
  }

  async post<T>(url: string, body: any, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({ ...config, url, method: 'POST', body });
  }

  async put<T>(url: string, body: any, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({ ...config, url, method: 'PUT', body });
  }

  async patch<T>(url: string, body: any, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({ ...config, url, method: 'PATCH', body });
  }

  async delete<T>(url: string, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({ ...config, url, method: 'DELETE' });
  }

  private async executeRequest<T>(requestConfig: RequestConfig): Promise<T> {
    const url = this.buildUrl(requestConfig.url);
    const headers = this.buildHeaders(requestConfig.headers);
    const timeout = requestConfig.timeout || this.config.timeout || 30000;

    try {
      const response = await fetch(url, {
        method: requestConfig.method || 'GET',
        headers,
        body: requestConfig.body ? JSON.stringify(requestConfig.body) : undefined,
        signal: AbortSignal.timeout(timeout)
      });

      if (!response.ok) {
        throw await HttpError.fromResponse(response);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError({
        status: 0,
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Network request failed',
        details: { originalError: error }
      });
    }
  }

  private buildUrl(path: string): string {
    const baseUrl = this.config.baseUrl.replace(/\/$/, '');
    const cleanPath = path.replace(/^\//, '');
    return `${baseUrl}/${cleanPath}`;
  }

  private buildHeaders(additionalHeaders?: Record<string, string>): Record<string, string> {
    const correlationId = CorrelationIdMiddleware.get();

    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...this.config.headers,
      ...additionalHeaders,
      ...(correlationId && { 'X-Correlation-ID': correlationId })
    };
  }
}
```

#### Circuit Breaker

```typescript
// src/infrastructure/http/circuit-breaker.ts
export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private nextAttempt: number = Date.now();

  constructor(private readonly config: CircuitBreakerConfig) {}

  static default(): CircuitBreaker {
    return new CircuitBreaker({
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 60000 // 1 minute
    });
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = CircuitState.HALF_OPEN;
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.config.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.successCount = 0;
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.successCount = 0;

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.nextAttempt = Date.now() + this.config.timeout;
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}
```

#### Retry Policy

```typescript
// src/infrastructure/http/retry-policy.ts
export interface RetryPolicyConfig {
  maxRetries: number;
  backoffMs: number;
  retryableStatuses: number[];
  retryableErrors: string[];
}

export class RetryPolicy {
  constructor(private readonly config: RetryPolicyConfig) {}

  static default(): RetryPolicy {
    return new RetryPolicy({
      maxRetries: 3,
      backoffMs: 1000,
      retryableStatuses: [408, 429, 500, 502, 503, 504],
      retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED']
    });
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (!this.isRetryable(error, attempt)) {
          throw error;
        }

        // Exponential backoff
        const delay = this.config.backoffMs * Math.pow(2, attempt);
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  private isRetryable(error: any, attempt: number): boolean {
    if (attempt >= this.config.maxRetries) {
      return false;
    }

    if (error.status && this.config.retryableStatuses.includes(error.status)) {
      return true;
    }

    return this.config.retryableErrors.some(code =>
      error.message?.includes(code)
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

#### HTTP Error

```typescript
// src/infrastructure/http/http-error.ts
export interface HttpErrorParams {
  status: number;
  code: string;
  message: string;
  details?: any;
  correlationId?: string;
}

export class HttpError extends Error {
  constructor(public readonly params: HttpErrorParams) {
    super(params.message);
    this.name = 'HttpError';
  }

  static async fromResponse(response: Response): Promise<HttpError> {
    let body: any;
    try {
      body = await response.json();
    } catch {
      body = {};
    }

    return new HttpError({
      status: response.status,
      code: body.code || 'HTTP_ERROR',
      message: body.message || response.statusText,
      details: body.details,
      correlationId: response.headers.get('X-Correlation-ID') || undefined
    });
  }

  get status(): number {
    return this.params.status;
  }

  get code(): string {
    return this.params.code;
  }
}
```

---

### 6. Infrastructure Layer - Logging

#### Correlation ID Middleware

```typescript
// src/infrastructure/logging/correlation-id.middleware.ts
import { AsyncLocalStorage } from 'node:async_hooks';
import { v4 as uuid } from 'uuid';
import { Request, Response, NextFunction } from 'express';

export class CorrelationIdMiddleware {
  private static storage = new AsyncLocalStorage<string>();

  static middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const correlationId = req.headers['x-correlation-id'] as string || uuid();

      res.setHeader('X-Correlation-ID', correlationId);

      CorrelationIdMiddleware.storage.run(correlationId, () => {
        next();
      });
    };
  }

  static get(): string | undefined {
    return CorrelationIdMiddleware.storage.getStore();
  }

  static set(correlationId: string): void {
    // Only for manual setting in tests or background jobs
    return;
  }
}
```

#### Structured Logger

```typescript
// src/infrastructure/logging/structured-logger.ts
import { CorrelationIdMiddleware } from './correlation-id.middleware';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export interface LogContext {
  [key: string]: any;
}

export class StructuredLogger {
  constructor(
    private readonly serviceName: string,
    private readonly version: string
  ) {}

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, {
      ...context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    const logEntry = {
      level,
      message,
      service: this.serviceName,
      version: this.version,
      timestamp: new Date().toISOString(),
      correlationId: CorrelationIdMiddleware.get(),
      ...context
    };

    const logMethod = level === LogLevel.ERROR ? console.error : console.log;
    logMethod(JSON.stringify(logEntry));
  }
}
```

---

### 7. Config Layer - Environment Validation

#### Base Config

```typescript
// src/config/base-config.ts
import { z } from 'zod';

export const BaseConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']),
  SERVICE_NAME: z.string(),
  SERVICE_VERSION: z.string().default('1.0.0'),
  PORT: z.coerce.number().default(3000),

  // MongoDB
  MONGODB_URI: z.string().url(),
  MONGODB_DATABASE: z.string(),

  // Redis
  REDIS_URL: z.string().url(),

  // AWS
  AWS_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),

  // JWT
  JWT_ISSUER: z.string(),
  JWT_AUDIENCE: z.string(),
  JWKS_URI: z.string().url(),

  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type BaseConfig = z.infer<typeof BaseConfigSchema>;

export function validateConfig<T extends z.ZodSchema>(
  schema: T,
  env: Record<string, string | undefined> = process.env
): z.infer<T> {
  try {
    return schema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      console.error('Environment variable validation failed:');
      errors.forEach(err => console.error(`  - ${err.field}: ${err.message}`));

      process.exit(1);
    }
    throw error;
  }
}
```

---

### 8. Utils - Pagination

```typescript
// src/utils/pagination.ts
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export class PaginationHelper {
  static calculateSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  static createMeta(
    page: number,
    limit: number,
    total: number
  ): PaginationMeta {
    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    };
  }

  static createResult<T>(
    data: T[],
    page: number,
    limit: number,
    total: number
  ): PaginatedResult<T> {
    return {
      data,
      meta: this.createMeta(page, limit, total)
    };
  }
}
```

---

## @clenergize/contracts Package

### Package Structure

```
@clenergize/contracts/
├── src/
│   ├── events/
│   │   ├── index.ts
│   │   ├── identity/
│   │   ├── organization/
│   │   ├── reference/
│   │   ├── activity/
│   │   ├── calculation/
│   │   ├── reporting/
│   │   └── audit/
│   ├── dtos/
│   │   ├── index.ts
│   │   └── [service-specific DTOs]
│   └── api/
│       ├── index.ts
│       └── [API contracts]
├── package.json
└── README.md
```

> **Note**: Event schemas are detailed in `Docs/EVENT_SCHEMA_REGISTRY.md`

---

## @clenergize/testing Package

### Package Structure

```
@clenergize/testing/
├── src/
│   ├── mocks/
│   │   ├── mock-event-bus.ts
│   │   ├── mock-repository.ts
│   │   └── mock-http-client.ts
│   ├── fixtures/
│   │   ├── user.fixture.ts
│   │   ├── project.fixture.ts
│   │   └── organization.fixture.ts
│   └── helpers/
│       ├── test-database.ts
│       └── test-server.ts
├── package.json
└── README.md
```

### Mock Event Bus

```typescript
// src/mocks/mock-event-bus.ts
import { IEventBus, BaseEvent, IEventHandler } from '@clenergize/common';

export class MockEventBus implements IEventBus {
  public publishedEvents: BaseEvent[] = [];
  private handlers: Map<string, IEventHandler[]> = new Map();

  async publish<T extends BaseEvent>(event: T): Promise<void> {
    this.publishedEvents.push(event);

    const handlers = this.handlers.get(event.type) || [];
    for (const handler of handlers) {
      await handler.handle(event);
    }
  }

  async publishBatch<T extends BaseEvent>(events: T[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }

  async subscribe<T extends BaseEvent>(
    eventType: string,
    handler: IEventHandler<T>
  ): Promise<void> {
    const handlers = this.handlers.get(eventType) || [];
    handlers.push(handler as IEventHandler);
    this.handlers.set(eventType, handlers);
  }

  async unsubscribe(eventType: string, handlerId: string): Promise<void> {
    const handlers = this.handlers.get(eventType) || [];
    const filtered = handlers.filter(h => h.handlerId !== handlerId);
    this.handlers.set(eventType, filtered);
  }

  clear(): void {
    this.publishedEvents = [];
    this.handlers.clear();
  }

  getPublishedEvents<T extends BaseEvent>(type?: string): T[] {
    if (type) {
      return this.publishedEvents.filter(e => e.type === type) as T[];
    }
    return this.publishedEvents as T[];
  }
}
```

---

## Package Development Workflow

### 1. Creating a New Package

```bash
# Navigate to shared directory
cd NEW/shared/packages

# Create package directory
mkdir my-package
cd my-package

# Initialize package
npm init -y

# Install dependencies
npm install --save-dev typescript @types/node
```

### 2. Package Configuration

```json
// package.json
{
  "name": "@clenergize/my-package",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "lint": "eslint src/**/*.ts"
  },
  "files": [
    "dist"
  ]
}
```

### 3. TypeScript Configuration

```json
// tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
```

### 4. Building and Publishing

```bash
# Build package
npm run build

# Link for local development
npm link

# In consuming service
npm link @clenergize/my-package

# Publish to private registry (production)
npm publish --access restricted
```

---

## Versioning Strategy

### Semantic Versioning

```
MAJOR.MINOR.PATCH

MAJOR: Breaking changes
MINOR: New features (backward compatible)
PATCH: Bug fixes
```

### Breaking Change Policy

1. **Deprecation Warning**: Add deprecation notice 1 sprint before removal
2. **Version Bump**: Increment MAJOR version
3. **Migration Guide**: Document migration path
4. **Support Window**: Maintain N-1 version for 2 sprints

---

## Migration from OLD

### Before (OLD Codebase)

```typescript
// ❌ No shared packages, duplicated code everywhere

// In user-management-ms
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
  }
}

// In project-management-ms (duplicated!)
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
  }
}
```

### After (NEW Architecture)

```typescript
// ✅ Shared packages, single source of truth

import { ValidationError } from '@clenergize/common';

// Used consistently across all services
throw new ValidationError('Invalid email', { field: 'email' });
```

---

## Usage Examples

### Example 1: Using Value Objects

```typescript
import { Email, UserId } from '@clenergize/common';

// Create user with validated email
const email = Email.create('user@example.com');
const userId = UserId.create();

console.log(email.getValue()); // user@example.com
console.log(email.getDomain()); // example.com
console.log(userId.getValue()); // UUID v4
```

### Example 2: Using Base Repository

```typescript
import { BaseRepository } from '@clenergize/common';

class UserRepository extends BaseRepository<User> {
  constructor(collection: Collection) {
    super(collection, 'User');
  }

  protected mapToDomain(document: any): User {
    return new User({
      id: document._id,
      email: Email.create(document.email),
      name: document.name,
      createdAt: new Date(document.createdAt)
    });
  }

  protected mapToDocument(entity: Partial<User>): any {
    return {
      _id: entity.id,
      email: entity.email?.getValue(),
      name: entity.name,
      createdAt: entity.createdAt?.toISOString()
    };
  }
}
```

### Example 3: Using HTTP Client

```typescript
import { BaseHttpClient } from '@clenergize/common';

const identityClient = new BaseHttpClient({
  baseUrl: 'http://identity-service:3001',
  timeout: 5000
});

try {
  const user = await identityClient.get<User>('/users/123');
  console.log('User:', user);
} catch (error) {
  if (error instanceof HttpError) {
    console.error(`HTTP ${error.status}: ${error.message}`);
  }
}
```

---

## Best Practices

### 1. Type Safety

- ✅ Use TypeScript strict mode
- ✅ Define explicit interfaces
- ✅ Avoid `any` type
- ✅ Use value objects for domain concepts

### 2. Error Handling

- ✅ Use domain-specific errors
- ✅ Include context in errors
- ✅ Log errors with correlation IDs
- ✅ Return user-friendly messages

### 3. Testing

- ✅ Test shared packages extensively
- ✅ Use mocks from @clenergize/testing
- ✅ Maintain 80%+ coverage
- ✅ Test edge cases

### 4. Documentation

- ✅ Document all public APIs
- ✅ Provide usage examples
- ✅ Maintain CHANGELOG.md
- ✅ Use JSDoc comments

---

## Appendix

### Package Dependencies

```json
{
  "dependencies": {
    "zod": "^3.22.0",
    "uuid": "^9.0.0",
    "mongodb": "^6.0.0"
  },
  "devDependencies": {
    "typescript": "^5.2.0",
    "@types/node": "^20.0.0",
    "@types/uuid": "^9.0.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0"
  }
}
```

---

**Last Updated**: November 18, 2025
**Next Review**: End of Sprint 0.1
**Maintained By**: Architecture Agent + Master Coordinator
