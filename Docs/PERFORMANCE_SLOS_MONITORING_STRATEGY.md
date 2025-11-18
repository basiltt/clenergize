# Performance SLOs & Monitoring Strategy

**Document Version**: 1.0.0
**Last Updated**: November 18, 2025
**Status**: Design Phase - Week 3-4
**Author**: Architecture & DevOps Teams

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [SLO Framework](#slo-framework)
3. [Service-Level Objectives (SLOs)](#service-level-objectives-slos)
4. [Service-Level Indicators (SLIs)](#service-level-indicators-slis)
5. [Monitoring Architecture](#monitoring-architecture)
6. [CloudWatch Implementation](#cloudwatch-implementation)
7. [Alerting Strategy](#alerting-strategy)
8. [Performance Dashboards](#performance-dashboards)
9. [Capacity Planning](#capacity-planning)
10. [Cost Optimization](#cost-optimization)
11. [Incident Response](#incident-response)
12. [Testing & Validation](#testing--validation)

---

## 1. Executive Summary

### Purpose

This document defines Service Level Objectives (SLOs), Service Level Indicators (SLIs), and comprehensive monitoring strategy for Clenergize V3 to ensure:
- **99.9% availability** (43.8 minutes downtime/month)
- **Sub-200ms p95 response times** for critical endpoints
- **Proactive issue detection** before user impact
- **Data-driven capacity planning**
- **Cost optimization** with performance monitoring

### OLD System Monitoring Gaps

```yaml
Issues in OLD System:
  - No SLOs defined ❌
  - No structured monitoring ❌
  - Manual log analysis ❌
  - Reactive incident response ❌
  - No performance baselines ❌
  - No cost tracking ❌
  - No capacity planning ❌

Impact:
  - Average detection time: 45 minutes (user reports)
  - Mean Time To Recovery (MTTR): 4 hours
  - Unknown root cause: 60% of incidents
  - No performance trends
  - Unexpected AWS costs
```

### NEW System Monitoring Strategy

```yaml
Improvements:
  - ✅ Clear SLOs for all services
  - ✅ Automated monitoring with CloudWatch
  - ✅ Real-time alerting (PagerDuty + Slack)
  - ✅ Proactive anomaly detection
  - ✅ Performance baselines and trends
  - ✅ Cost optimization dashboards
  - ✅ Capacity planning automation

Goals:
  - Detection time: <2 minutes (automated)
  - MTTR: <30 minutes
  - Root cause identification: >90%
  - Performance SLO compliance: >99%
  - Cost predictability: ±5%
```

---

## 2. SLO Framework

### 2.1 SLO Hierarchy

```
Company-Level SLA (Service Level Agreement)
  ├─ 99.9% uptime guarantee
  ├─ <500ms p95 response time
  └─ <1 hour incident resolution

↓ Translated to Internal SLOs ↓

Service-Level SLOs
  ├─ Availability SLO: 99.95% (tighter than SLA)
  ├─ Latency SLO: <200ms p95 (2.5x buffer)
  └─ Error Budget: 0.05% (21.6 min/month)

↓ Measured by ↓

Service-Level Indicators (SLIs)
  ├─ Request Success Rate
  ├─ Response Time (p50, p95, p99)
  ├─ Database Query Performance
  ├─ Cache Hit Rate
  └─ Error Rate
```

### 2.2 Error Budget Concept

**Error Budget** = (1 - SLO) × Total Time

```yaml
Monthly Error Budget (99.95% SLO):
  Total Time: 43,200 minutes (30 days)
  Error Budget: 0.05% × 43,200 = 21.6 minutes

Budget Allocation:
  - Planned Deployments: 10 minutes (46%)
  - Unplanned Incidents: 6 minutes (28%)
  - Performance Degradation: 3 minutes (14%)
  - Reserve: 2.6 minutes (12%)

Error Budget Policy:
  - >80% remaining: Normal operations, frequent releases
  - 50-80% remaining: Caution, prioritize stability
  - 20-50% remaining: Focus on reliability, reduce releases
  - <20% remaining: Feature freeze, only critical fixes
```

### 2.3 SLO Review Cadence

```yaml
Weekly Review:
  - Error budget consumption
  - Incident postmortems
  - Performance trends
  - Capacity utilization

Monthly Review:
  - SLO compliance analysis
  - Adjust SLOs if needed
  - Capacity planning
  - Cost optimization

Quarterly Review:
  - Architectural improvements
  - Technology updates
  - Scaling strategy
  - Budget planning
```

---

## 3. Service-Level Objectives (SLOs)

### 3.1 Availability SLOs

**Target**: 99.95% uptime per service

```yaml
Identity Service:
  Availability: 99.95%
  Critical: YES (authentication blocks all features)
  Downtime Allowed: 21.6 min/month
  Dependencies: AWS Cognito, MongoDB, Redis

Organization Service:
  Availability: 99.95%
  Critical: YES (project access required for most features)
  Downtime Allowed: 21.6 min/month
  Dependencies: MongoDB, Redis, EventBridge

Reference Service:
  Availability: 99.90%
  Critical: MEDIUM (data cached, degraded mode possible)
  Downtime Allowed: 43.2 min/month
  Dependencies: MongoDB, Redis (primary data source)

Activity Service:
  Availability: 99.95%
  Critical: YES (primary data entry)
  Downtime Allowed: 21.6 min/month
  Dependencies: MongoDB, Redis, S3, EventBridge

Calculation Service:
  Availability: 99.90%
  Critical: MEDIUM (async processing, retry possible)
  Downtime Allowed: 43.2 min/month
  Dependencies: MongoDB, EventBridge

Reporting Service:
  Availability: 99.50%
  Critical: LOW (async, user-initiated)
  Downtime Allowed: 3.6 hours/month
  Dependencies: MongoDB, S3, SQS

Audit Service:
  Availability: 99.95%
  Critical: YES (compliance requirement)
  Downtime Allowed: 21.6 min/month
  Dependencies: MongoDB
```

### 3.2 Latency SLOs

**Response Time Targets** (per endpoint type):

```yaml
Point Queries (GET /resource/:id):
  p50: <25ms
  p95: <50ms
  p99: <100ms
  Example: GET /users/:id, GET /projects/:id

List Queries (GET /resources):
  p50: <50ms
  p95: <100ms
  p99: <200ms
  Example: GET /projects?organizationId=...

Search Queries (GET /resources?filter=...):
  p50: <75ms
  p95: <150ms
  p99: <300ms
  Example: GET /activity-data?projectId=...&year=2024

Aggregation Queries (POST /calculate):
  p50: <100ms
  p95: <200ms
  p99: <500ms
  Example: POST /calculations/emissions-summary

Create Operations (POST /resource):
  p50: <50ms
  p95: <100ms
  p99: <200ms
  Example: POST /activity-data

Update Operations (PUT /resource/:id):
  p50: <50ms
  p95: <100ms
  p99: <200ms
  Example: PUT /projects/:id

Delete Operations (DELETE /resource/:id):
  p50: <25ms
  p95: <75ms
  p99: <150ms
  Example: DELETE /activity-data/:id

Report Generation (POST /reports):
  p50: <2,000ms
  p95: <5,000ms
  p99: <10,000ms
  Example: POST /reports/annual-summary
```

### 3.3 Throughput SLOs

**Requests Per Second (RPS)** per service:

```yaml
Identity Service:
  Peak RPS: 5,000
  Avg RPS: 1,500
  Read/Write Ratio: 80/20

Organization Service:
  Peak RPS: 3,000
  Avg RPS: 800
  Read/Write Ratio: 70/30

Reference Service:
  Peak RPS: 10,000
  Avg RPS: 2,000
  Read/Write Ratio: 99/1 (mostly reads)

Activity Service:
  Peak RPS: 8,000
  Avg RPS: 2,500
  Read/Write Ratio: 60/40

Calculation Service:
  Peak RPS: 2,000
  Avg RPS: 500
  Read/Write Ratio: 50/50

Reporting Service:
  Peak RPS: 500
  Avg RPS: 100
  Read/Write Ratio: 20/80 (mostly writes)

Audit Service:
  Peak RPS: 2,000
  Avg RPS: 800
  Read/Write Ratio: 10/90 (write-heavy)
```

### 3.4 Error Rate SLOs

**Error Budget** per service:

```yaml
HTTP 4xx Errors (Client Errors):
  Target: <2% of requests
  Acceptable: Validation errors, auth failures
  Alert Threshold: >5% in 5 minutes

HTTP 5xx Errors (Server Errors):
  Target: <0.1% of requests
  Critical: Service failures, database errors
  Alert Threshold: >0.5% in 5 minutes

Database Errors:
  Target: <0.05% of queries
  Critical: Connection failures, timeouts
  Alert Threshold: >0.1% in 5 minutes

Cache Errors:
  Target: <1% of operations
  Acceptable: Cache misses, connection issues
  Alert Threshold: >5% in 5 minutes

External Service Errors (AWS):
  Target: <0.5% of calls
  Examples: S3, SQS, Cognito, EventBridge
  Alert Threshold: >2% in 5 minutes
```

### 3.5 Data Quality SLOs

```yaml
Data Accuracy:
  Calculation Precision: ±0.01%
  Emission Factor Accuracy: 100% (verified sources)
  Data Loss: 0% (durability guarantee)

Data Freshness:
  Real-time Data: <5 seconds lag
  Near Real-time Data: <1 minute lag
  Batch Data: <1 hour lag
  Reference Data: <24 hours lag

Data Completeness:
  Required Fields: 100% populated
  Optional Fields: >95% populated (where applicable)
  Audit Trail: 100% of critical operations
```

---

## 4. Service-Level Indicators (SLIs)

### 4.1 Availability SLI

**Measurement**:

```typescript
// Availability = Successful Requests / Total Requests
const availability = (
  totalRequests - errorRequests
) / totalRequests * 100;

// Example: 999,500 successful / 1,000,000 total = 99.95%
```

**CloudWatch Metric**:

```typescript
// Metric Filter on Application Logs
const successMetric = new MetricFilter({
  filterPattern: '[timestamp, request_id, level=INFO, status_code=2*, ...]',
  metricName: 'SuccessfulRequests',
  metricNamespace: 'Clenergize/SLI',
  metricValue: '1'
});

const errorMetric = new MetricFilter({
  filterPattern: '[timestamp, request_id, level=ERROR, status_code=5*, ...]',
  metricName: 'ErrorRequests',
  metricNamespace: 'Clenergize/SLI',
  metricValue: '1'
});

// Calculated Metric
const availabilitySLI = new MathExpression({
  expression: '(m1 / (m1 + m2)) * 100',
  usingMetrics: {
    m1: successMetric,
    m2: errorMetric
  }
});
```

### 4.2 Latency SLI

**Measurement**:

```typescript
// Latency percentiles from CloudWatch Metrics
const latencyMetrics = {
  p50: 'p50(ResponseTime)',
  p95: 'p95(ResponseTime)',
  p99: 'p99(ResponseTime)'
};

// Custom Metrics in NestJS
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;

        // Publish to CloudWatch
        this.cloudWatch.putMetricData({
          Namespace: 'Clenergize/SLI',
          MetricData: [{
            MetricName: 'ResponseTime',
            Value: duration,
            Unit: 'Milliseconds',
            Dimensions: [
              { Name: 'Service', Value: process.env.SERVICE_NAME },
              { Name: 'Endpoint', Value: request.route.path },
              { Name: 'Method', Value: request.method }
            ]
          }]
        });
      })
    );
  }
}
```

### 4.3 Error Rate SLI

**Measurement**:

```typescript
// Error Rate = Error Requests / Total Requests
const errorRate = (errorRequests / totalRequests) * 100;

// By Error Type
const errorBreakdown = {
  '4xx': clientErrors / totalRequests * 100,
  '5xx': serverErrors / totalRequests * 100,
  database: dbErrors / totalQueries * 100,
  external: externalErrors / totalExternalCalls * 100
};
```

### 4.4 Database Performance SLI

**Measurement**:

```typescript
// Query performance metrics
const dbMetrics = {
  queryDuration: {
    p50: 'p50(QueryDuration)',
    p95: 'p95(QueryDuration)',
    p99: 'p99(QueryDuration)'
  },
  indexHitRate: '(indexScans / totalScans) * 100',
  connectionPoolUtilization: '(activeConnections / maxConnections) * 100',
  slowQueryRate: '(slowQueries / totalQueries) * 100'
};

// Mongoose Plugin for Query Monitoring
export function metricsPlugin(schema: Schema): void {
  schema.pre(/^find/, function(next) {
    this['_startTime'] = Date.now();
    next();
  });

  schema.post(/^find/, async function(result, next) {
    const duration = Date.now() - this['_startTime'];

    await cloudWatch.putMetricData({
      Namespace: 'Clenergize/Database',
      MetricData: [{
        MetricName: 'QueryDuration',
        Value: duration,
        Unit: 'Milliseconds',
        Dimensions: [
          { Name: 'Collection', Value: this.model.collection.name },
          { Name: 'Operation', Value: this.op }
        ]
      }]
    });

    next();
  });
}
```

### 4.5 Cache Performance SLI

**Measurement**:

```typescript
// Cache hit rate
const cacheHitRate = (cacheHits / (cacheHits + cacheMisses)) * 100;

// Target: >85% hit rate

// Redis Monitoring
@Injectable()
export class CacheMetricsService {
  async recordCacheOperation(hit: boolean, key: string): Promise<void> {
    await this.cloudWatch.putMetricData({
      Namespace: 'Clenergize/Cache',
      MetricData: [
        {
          MetricName: 'CacheHits',
          Value: hit ? 1 : 0,
          Unit: 'Count',
          Dimensions: [
            { Name: 'KeyPattern', Value: this.getKeyPattern(key) }
          ]
        },
        {
          MetricName: 'CacheMisses',
          Value: hit ? 0 : 1,
          Unit: 'Count',
          Dimensions: [
            { Name: 'KeyPattern', Value: this.getKeyPattern(key) }
          ]
        }
      ]
    });
  }

  private getKeyPattern(key: string): string {
    // Extract pattern: "project:123:metadata" -> "project:*:metadata"
    return key.replace(/:[^:]+:/g, ':*:');
  }
}
```

### 4.6 External Service SLI

**Measurement**:

```typescript
// AWS Service availability
const externalServiceMetrics = {
  s3: {
    availability: '(successfulUploads / totalUploads) * 100',
    latency: 'p95(S3UploadDuration)'
  },
  cognito: {
    availability: '(successfulAuth / totalAuth) * 100',
    latency: 'p95(AuthDuration)'
  },
  eventBridge: {
    availability: '(publishedEvents / totalEvents) * 100',
    latency: 'p95(EventPublishDuration)'
  },
  sqs: {
    availability: '(processedMessages / totalMessages) * 100',
    latency: 'p95(MessageProcessingDuration)'
  }
};

// AWS SDK Instrumentation
const s3Client = new S3Client({
  region: 'us-east-1',
  requestHandler: new MetricsRequestHandler()
});

class MetricsRequestHandler implements RequestHandler {
  async handle(request: HttpRequest): Promise<HttpResponse> {
    const startTime = Date.now();
    const service = request.hostname.split('.')[0]; // s3, cognito, etc.

    try {
      const response = await this.defaultHandler.handle(request);
      const duration = Date.now() - startTime;

      await this.recordMetrics(service, duration, true);
      return response;

    } catch (error) {
      const duration = Date.now() - startTime;
      await this.recordMetrics(service, duration, false);
      throw error;
    }
  }
}
```

---

## 5. Monitoring Architecture

### 5.1 Monitoring Stack

```
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                      │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐           │
│  │ Identity  │  │   Org     │  │ Activity  │   ...     │
│  │  Service  │  │  Service  │  │  Service  │           │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘           │
│        │              │              │                   │
│        └──────────────┴──────────────┘                   │
│                       │                                  │
└───────────────────────┼──────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │   CloudWatch Agent (sidecar)   │
        │  - Structured Logs             │
        │  - Custom Metrics              │
        │  - Traces                      │
        └───────────────┬───────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    CloudWatch                            │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │    Logs     │  │   Metrics    │  │   Insights    │  │
│  │  (JSON)     │  │  (Custom)    │  │   (Queries)   │  │
│  └──────┬──────┘  └──────┬───────┘  └───────┬───────┘  │
│         │                │                   │          │
└─────────┼────────────────┼───────────────────┼──────────┘
          │                │                   │
          ▼                ▼                   ▼
┌─────────────────────────────────────────────────────────┐
│                  Alerting Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │  CloudWatch  │  │   Lambda     │  │   SNS Topic   │ │
│  │   Alarms     │  │  (Anomaly    │  │  (Routing)    │ │
│  │              │  │  Detection)  │  │               │ │
│  └──────┬───────┘  └──────┬───────┘  └───────┬───────┘ │
└─────────┼──────────────────┼──────────────────┼─────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
                ┌────────────┴────────────┐
                ▼                         ▼
        ┌───────────────┐        ┌───────────────┐
        │   PagerDuty   │        │     Slack     │
        │  (On-call)    │        │  (Team Alert) │
        └───────────────┘        └───────────────┘
```

### 5.2 Log Aggregation

**Structured Logging Format**:

```typescript
// Winston Logger Configuration
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: process.env.SERVICE_NAME,
    version: process.env.APP_VERSION,
    environment: process.env.NODE_ENV,
    instance: process.env.HOSTNAME
  },
  transports: [
    // CloudWatch Logs
    new WinstonCloudWatch({
      logGroupName: `/clenergize/${process.env.NODE_ENV}/${process.env.SERVICE_NAME}`,
      logStreamName: `${process.env.HOSTNAME}-${new Date().toISOString().split('T')[0]}`,
      awsRegion: 'us-east-1',
      jsonMessage: true
    }),
    // Console (for local development)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Structured Log Example
logger.info('User authenticated', {
  userId: '507f1f77bcf86cd799439011',
  email: 'user@example.com',
  method: 'cognito',
  duration: 245,
  correlationId: 'req-abc123',
  tags: ['authentication', 'success']
});

// Output (JSON):
{
  "timestamp": "2024-11-18T10:30:00.000Z",
  "level": "info",
  "message": "User authenticated",
  "service": "identity-service",
  "version": "1.0.0",
  "environment": "production",
  "instance": "identity-pod-7f8d9c",
  "userId": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "method": "cognito",
  "duration": 245,
  "correlationId": "req-abc123",
  "tags": ["authentication", "success"]
}
```

**Log Levels**:

```yaml
ERROR:
  - Application errors
  - Unhandled exceptions
  - External service failures
  - Database connection errors
  - Example: "Failed to save activity data"

WARN:
  - Degraded performance
  - Retry attempts
  - Deprecated feature usage
  - Cache misses (excessive)
  - Example: "Cache miss rate >20%"

INFO:
  - Request/response logs
  - Business events
  - Authentication events
  - Scheduled job execution
  - Example: "Report generated successfully"

DEBUG:
  - Detailed execution flow
  - Variable values
  - Query execution plans
  - Cache operations
  - Example: "Fetching emission factor for category=electricity"

TRACE:
  - Ultra-detailed debugging
  - Request/response payloads
  - Database queries
  - Example: "MongoDB query: {projectId: '...'}"
```

### 5.3 Distributed Tracing

**AWS X-Ray Integration**:

```typescript
import AWSXRay from 'aws-xray-sdk-core';
import AWS from 'aws-sdk';

// Instrument AWS SDK
const instrumentedAWS = AWSXRay.captureAWS(AWS);

// Instrument HTTP requests
import http from 'http';
AWSXRay.captureHTTPsGlobal(http);

// NestJS Middleware for Tracing
@Injectable()
export class TracingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const segment = AWSXRay.getSegment();

    if (segment) {
      const subsegment = segment.addNewSubsegment('HTTP Request');
      subsegment.addAnnotation('service', process.env.SERVICE_NAME);
      subsegment.addAnnotation('endpoint', req.path);
      subsegment.addAnnotation('method', req.method);
      subsegment.addMetadata('headers', req.headers);

      // Add correlation ID
      const correlationId = req.headers['x-correlation-id'] || uuidv4();
      subsegment.addAnnotation('correlationId', correlationId);
      res.setHeader('X-Correlation-ID', correlationId);

      res.on('finish', () => {
        subsegment.addAnnotation('statusCode', res.statusCode);
        subsegment.close();
      });
    }

    next();
  }
}

// Trace Database Queries
async function tracedQuery<T>(
  operation: string,
  query: () => Promise<T>
): Promise<T> {
  const segment = AWSXRay.getSegment();
  const subsegment = segment.addNewSubsegment('MongoDB Query');

  subsegment.addAnnotation('operation', operation);
  subsegment.addAnnotation('database', 'MongoDB');

  try {
    const result = await query();
    subsegment.addAnnotation('success', true);
    return result;
  } catch (error) {
    subsegment.addError(error);
    throw error;
  } finally {
    subsegment.close();
  }
}

// Usage
const projects = await tracedQuery('findProjects', async () => {
  return this.projectModel.find({ organizationId }).lean().exec();
});
```

**Trace Example**:

```
Trace: req-abc123 (250ms total)
├─ identity-service (50ms)
│  ├─ JWT Verification (15ms)
│  ├─ MongoDB Query: findUser (20ms)
│  └─ Cache Set: user:123 (5ms)
│
├─ organization-service (120ms)
│  ├─ MongoDB Query: findProjects (45ms)
│  ├─ Redis Get: projects:org:456 (5ms - MISS)
│  ├─ MongoDB Query: findHierarchy (60ms)
│  └─ Redis Set: projects:org:456 (10ms)
│
└─ activity-service (80ms)
   ├─ MongoDB Query: findActivityData (55ms)
   ├─ EventBridge: Publish event (20ms)
   └─ Cache Invalidation (5ms)
```

---

## 6. CloudWatch Implementation

### 6.1 Custom Metrics

**Metric Namespaces**:

```yaml
Clenergize/Application:
  - RequestCount
  - ResponseTime
  - ErrorCount
  - ActiveUsers

Clenergize/Database:
  - QueryDuration
  - ConnectionPoolUtilization
  - SlowQueries
  - IndexHitRate

Clenergize/Cache:
  - HitRate
  - MissRate
  - EvictionRate
  - MemoryUsage

Clenergize/Business:
  - ActivitiesCreated
  - CalculationsPerformed
  - ReportsGenerated
  - UserRegistrations

Clenergize/SLI:
  - Availability
  - Latency_P95
  - ErrorRate
  - ThroughputRPS
```

**Publishing Custom Metrics**:

```typescript
@Injectable()
export class CloudWatchMetricsService {
  private cloudWatch: CloudWatchClient;
  private metricBuffer: PutMetricDataCommandInput[] = [];

  constructor() {
    this.cloudWatch = new CloudWatchClient({ region: 'us-east-1' });

    // Flush metrics every 10 seconds
    setInterval(() => this.flushMetrics(), 10000);
  }

  async putMetric(
    namespace: string,
    metricName: string,
    value: number,
    unit: Unit,
    dimensions: Dimension[] = []
  ): Promise<void> {
    this.metricBuffer.push({
      Namespace: namespace,
      MetricData: [{
        MetricName: metricName,
        Value: value,
        Unit: unit,
        Timestamp: new Date(),
        Dimensions: [
          { Name: 'Service', Value: process.env.SERVICE_NAME },
          { Name: 'Environment', Value: process.env.NODE_ENV },
          ...dimensions
        ]
      }]
    });

    // Flush if buffer is full (CloudWatch limit: 20 metrics per request)
    if (this.metricBuffer.length >= 20) {
      await this.flushMetrics();
    }
  }

  private async flushMetrics(): Promise<void> {
    if (this.metricBuffer.length === 0) return;

    const batch = this.metricBuffer.splice(0, 20);

    try {
      await Promise.all(
        batch.map(metric =>
          this.cloudWatch.send(new PutMetricDataCommand(metric))
        )
      );
    } catch (error) {
      console.error('Failed to publish metrics', error);
    }
  }

  // High-level helpers
  async recordResponseTime(duration: number, endpoint: string): Promise<void> {
    await this.putMetric(
      'Clenergize/Application',
      'ResponseTime',
      duration,
      'Milliseconds',
      [{ Name: 'Endpoint', Value: endpoint }]
    );
  }

  async recordDatabaseQuery(duration: number, collection: string): Promise<void> {
    await this.putMetric(
      'Clenergize/Database',
      'QueryDuration',
      duration,
      'Milliseconds',
      [{ Name: 'Collection', Value: collection }]
    );
  }

  async recordCacheHit(hit: boolean, keyPattern: string): Promise<void> {
    await this.putMetric(
      'Clenergize/Cache',
      hit ? 'CacheHits' : 'CacheMisses',
      1,
      'Count',
      [{ Name: 'KeyPattern', Value: keyPattern }]
    );
  }

  async recordBusinessEvent(event: string, value: number = 1): Promise<void> {
    await this.putMetric(
      'Clenergize/Business',
      event,
      value,
      'Count'
    );
  }
}
```

### 6.2 CloudWatch Insights Queries

**Top 10 Slow Endpoints**:

```sql
fields @timestamp, endpoint, duration
| filter service = "activity-service"
| filter duration > 200
| stats count() as slowRequests, avg(duration) as avgDuration, max(duration) as maxDuration by endpoint
| sort slowRequests desc
| limit 10
```

**Error Rate by Service**:

```sql
fields @timestamp, service, level, message
| filter level = "ERROR"
| stats count() as errorCount by service, bin(5m)
| sort @timestamp desc
```

**Database Query Performance**:

```sql
fields @timestamp, collection, operation, duration
| filter namespace = "Clenergize/Database"
| stats avg(duration) as avgDuration, max(duration) as maxDuration, count() as queryCount by collection, operation
| sort avgDuration desc
```

**Cache Hit Rate**:

```sql
fields @timestamp, keyPattern, hit
| stats sum(hit) as hits, count() as total by keyPattern
| fields keyPattern, (hits / total * 100) as hitRate
| sort hitRate asc
```

**Request Volume by Endpoint**:

```sql
fields @timestamp, endpoint, method, statusCode
| stats count() as requestCount by endpoint, method, statusCode
| sort requestCount desc
| limit 20
```

### 6.3 CloudWatch Dashboards

**Executive Dashboard** (High-Level Metrics):

```typescript
const executiveDashboard = new CloudWatchDashboard({
  dashboardName: 'Clenergize-Executive-Overview',
  widgets: [
    // Row 1: SLO Compliance
    {
      type: 'metric',
      properties: {
        title: 'Availability SLO (99.95% target)',
        metrics: [
          ['Clenergize/SLI', 'Availability', { stat: 'Average' }]
        ],
        period: 300,
        yAxis: { left: { min: 99.5, max: 100 } },
        annotations: {
          horizontal: [
            { value: 99.95, label: 'SLO Target', color: '#2ca02c' }
          ]
        }
      }
    },
    {
      type: 'metric',
      properties: {
        title: 'Latency SLO (p95 < 200ms target)',
        metrics: [
          ['Clenergize/Application', 'ResponseTime', { stat: 'p95' }]
        ],
        period: 300,
        yAxis: { left: { min: 0, max: 500 } },
        annotations: {
          horizontal: [
            { value: 200, label: 'SLO Target', color: '#2ca02c' }
          ]
        }
      }
    },

    // Row 2: Traffic & Errors
    {
      type: 'metric',
      properties: {
        title: 'Requests Per Second',
        metrics: [
          ['Clenergize/Application', 'RequestCount', { stat: 'Sum', period: 60 }]
        ],
        period: 60,
        yAxis: { left: { min: 0 } }
      }
    },
    {
      type: 'metric',
      properties: {
        title: 'Error Rate (%)',
        metrics: [
          ['Clenergize/SLI', 'ErrorRate', { stat: 'Average' }]
        ],
        period: 300,
        yAxis: { left: { min: 0, max: 5 } },
        annotations: {
          horizontal: [
            { value: 0.1, label: 'SLO Target', color: '#2ca02c' },
            { value: 1, label: 'Warning', color: '#ff7f0e' }
          ]
        }
      }
    },

    // Row 3: Business Metrics
    {
      type: 'metric',
      properties: {
        title: 'Activities Created (last hour)',
        metrics: [
          ['Clenergize/Business', 'ActivitiesCreated', { stat: 'Sum' }]
        ],
        period: 3600
      }
    },
    {
      type: 'metric',
      properties: {
        title: 'Calculations Performed (last hour)',
        metrics: [
          ['Clenergize/Business', 'CalculationsPerformed', { stat: 'Sum' }]
        ],
        period: 3600
      }
    }
  ]
});
```

**Service-Level Dashboard** (Deep Dive):

```typescript
const serviceDashboard = (serviceName: string) => new CloudWatchDashboard({
  dashboardName: `Clenergize-${serviceName}-Details`,
  widgets: [
    // Response Time Distribution
    {
      type: 'metric',
      properties: {
        title: 'Response Time Percentiles',
        metrics: [
          ['Clenergize/Application', 'ResponseTime', { stat: 'p50', label: 'p50' }],
          ['...', { stat: 'p95', label: 'p95' }],
          ['...', { stat: 'p99', label: 'p99' }]
        ],
        period: 300
      }
    },

    // Database Performance
    {
      type: 'metric',
      properties: {
        title: 'Database Query Duration',
        metrics: [
          ['Clenergize/Database', 'QueryDuration', { stat: 'Average' }],
          ['...', { stat: 'p95' }]
        ],
        period: 300
      }
    },

    // Cache Performance
    {
      type: 'metric',
      properties: {
        title: 'Cache Hit Rate (%)',
        metrics: [
          [{ expression: '(m1 / (m1 + m2)) * 100', label: 'Hit Rate' }],
          ['Clenergize/Cache', 'CacheHits', { id: 'm1', visible: false }],
          ['Clenergize/Cache', 'CacheMisses', { id: 'm2', visible: false }]
        ],
        period: 300,
        yAxis: { left: { min: 0, max: 100 } },
        annotations: {
          horizontal: [{ value: 85, label: 'Target', color: '#2ca02c' }]
        }
      }
    },

    // Error Breakdown
    {
      type: 'log',
      properties: {
        title: 'Error Breakdown (Last Hour)',
        query: `SOURCE '/aws/ecs/${serviceName}'
                | fields @timestamp, level, message, errorType
                | filter level = "ERROR"
                | stats count() by errorType`,
        region: 'us-east-1'
      }
    },

    // Top Endpoints by Volume
    {
      type: 'log',
      properties: {
        title: 'Top Endpoints (Last Hour)',
        query: `SOURCE '/aws/ecs/${serviceName}'
                | fields endpoint, duration
                | stats count() as requests, avg(duration) as avgDuration by endpoint
                | sort requests desc
                | limit 10`,
        region: 'us-east-1'
      }
    }
  ]
});
```

---

## 7. Alerting Strategy

### 7.1 Alert Severity Levels

```yaml
P1 - Critical (Page immediately):
  - Service down (availability <99%)
  - Database connection failure
  - >5% error rate for >5 minutes
  - p95 latency >500ms for >5 minutes
  - Data loss detected
  Response Time: <5 minutes
  Escalation: Immediate PagerDuty page

P2 - High (Alert on-call):
  - SLO violation (availability <99.95%)
  - Error rate >2% for >10 minutes
  - p95 latency >300ms for >10 minutes
  - Cache failure
  - External service degradation
  Response Time: <15 minutes
  Escalation: PagerDuty notification

P3 - Medium (Alert during business hours):
  - Error rate >1% for >30 minutes
  - p95 latency >200ms for >30 minutes
  - Slow query count increasing
  - Disk usage >80%
  - Memory usage >80%
  Response Time: <1 hour
  Escalation: Slack + Email

P4 - Low (Informational):
  - Performance degradation
  - Non-critical errors
  - Capacity warnings
  - Cost anomalies
  Response Time: Next business day
  Escalation: Slack only
```

### 7.2 CloudWatch Alarms

**Availability Alarm** (P1):

```typescript
const availabilityAlarm = new CloudWatchAlarm({
  alarmName: 'Clenergize-Identity-Availability-P1',
  alarmDescription: 'Identity service availability below SLO',
  comparisonOperator: 'LessThanThreshold',
  threshold: 99.0, // Alert if <99% (SLO is 99.95%)
  evaluationPeriods: 2,
  datapointsToAlarm: 2,
  treatMissingData: 'breaching',

  metrics: [
    {
      id: 'm1',
      label: 'Success Rate',
      returnData: true,
      expression: '(success / (success + errors)) * 100'
    },
    {
      id: 'success',
      metric: {
        namespace: 'Clenergize/SLI',
        metricName: 'SuccessfulRequests',
        dimensions: { Service: 'identity-service' },
        stat: 'Sum',
        period: 300
      }
    },
    {
      id: 'errors',
      metric: {
        namespace: 'Clenergize/SLI',
        metricName: 'ErrorRequests',
        dimensions: { Service: 'identity-service' },
        stat: 'Sum',
        period: 300
      }
    }
  ],

  alarmActions: [
    'arn:aws:sns:us-east-1:123456789012:pagerduty-critical'
  ]
});
```

**Latency Alarm** (P2):

```typescript
const latencyAlarm = new CloudWatchAlarm({
  alarmName: 'Clenergize-Activity-Latency-P2',
  alarmDescription: 'Activity service p95 latency above SLO',
  comparisonOperator: 'GreaterThanThreshold',
  threshold: 300, // Alert if p95 >300ms (SLO is 200ms, 50% buffer)
  evaluationPeriods: 3,
  datapointsToAlarm: 2,
  extendedStatistic: 'p95',

  metricName: 'ResponseTime',
  namespace: 'Clenergize/Application',
  dimensions: { Service: 'activity-service' },
  period: 300,

  alarmActions: [
    'arn:aws:sns:us-east-1:123456789012:pagerduty-high'
  ]
});
```

**Error Rate Alarm** (P2):

```typescript
const errorRateAlarm = new CloudWatchAlarm({
  alarmName: 'Clenergize-Organization-ErrorRate-P2',
  alarmDescription: 'Organization service error rate above threshold',
  comparisonOperator: 'GreaterThanThreshold',
  threshold: 2.0, // 2% error rate
  evaluationPeriods: 2,
  datapointsToAlarm: 2,

  metrics: [
    {
      id: 'm1',
      label: 'Error Rate',
      returnData: true,
      expression: '(errors / total) * 100'
    },
    {
      id: 'errors',
      metric: {
        namespace: 'Clenergize/SLI',
        metricName: 'ErrorRequests',
        dimensions: { Service: 'organization-service' },
        stat: 'Sum',
        period: 300
      }
    },
    {
      id: 'total',
      metric: {
        namespace: 'Clenergize/Application',
        metricName: 'RequestCount',
        dimensions: { Service: 'organization-service' },
        stat: 'Sum',
        period: 300
      }
    }
  ],

  alarmActions: [
    'arn:aws:sns:us-east-1:123456789012:pagerduty-high'
  ]
});
```

**Database Connection Pool Alarm** (P3):

```typescript
const dbPoolAlarm = new CloudWatchAlarm({
  alarmName: 'Clenergize-Activity-DBPool-P3',
  alarmDescription: 'Database connection pool utilization high',
  comparisonOperator: 'GreaterThanThreshold',
  threshold: 80, // 80% utilization
  evaluationPeriods: 3,
  datapointsToAlarm: 2,

  metricName: 'ConnectionPoolUtilization',
  namespace: 'Clenergize/Database',
  dimensions: { Service: 'activity-service' },
  statistic: 'Average',
  period: 300,

  alarmActions: [
    'arn:aws:sns:us-east-1:123456789012:slack-alerts'
  ]
});
```

**Slow Query Alarm** (P3):

```typescript
const slowQueryAlarm = new CloudWatchAlarm({
  alarmName: 'Clenergize-Calculation-SlowQueries-P3',
  alarmDescription: 'High number of slow database queries',
  comparisonOperator: 'GreaterThanThreshold',
  threshold: 100, // >100 slow queries in 5 minutes
  evaluationPeriods: 2,
  datapointsToAlarm: 2,

  metricName: 'SlowQueries',
  namespace: 'Clenergize/Database',
  dimensions: { Service: 'calculation-service' },
  statistic: 'Sum',
  period: 300,

  alarmActions: [
    'arn:aws:sns:us-east-1:123456789012:slack-alerts'
  ]
});
```

### 7.3 Anomaly Detection Alarms

**Lambda Function for Anomaly Detection**:

```typescript
// Detect anomalies using CloudWatch Anomaly Detection
const anomalyAlarm = new CloudWatchAlarm({
  alarmName: 'Clenergize-Identity-TrafficAnomaly',
  alarmDescription: 'Unusual traffic pattern detected',
  comparisonOperator: 'LessThanLowerOrGreaterThanUpperThreshold',
  evaluationPeriods: 2,
  datapointsToAlarm: 1,
  thresholdMetricId: 'ad1',

  metrics: [
    {
      id: 'm1',
      metricStat: {
        metric: {
          namespace: 'Clenergize/Application',
          metricName: 'RequestCount',
          dimensions: { Service: 'identity-service' }
        },
        period: 300,
        stat: 'Sum'
      }
    },
    {
      id: 'ad1',
      expression: 'ANOMALY_DETECTION_BAND(m1, 2)' // 2 standard deviations
    }
  ],

  alarmActions: [
    'arn:aws:sns:us-east-1:123456789012:slack-alerts'
  ]
});
```

### 7.4 Composite Alarms

**Service Health Composite Alarm**:

```typescript
const serviceHealthComposite = new CompositeAlarm({
  compositeAlarmName: 'Clenergize-Identity-ServiceHealth',
  alarmDescription: 'Overall health of Identity service',

  alarmRule: `
    ALARM(Clenergize-Identity-Availability-P1) OR
    ALARM(Clenergize-Identity-Latency-P2) OR
    ALARM(Clenergize-Identity-ErrorRate-P2)
  `,

  actionsEnabled: true,
  alarmActions: [
    'arn:aws:sns:us-east-1:123456789012:pagerduty-critical'
  ]
});
```

---

## 8. Performance Dashboards

### 8.1 Real-Time Operations Dashboard

```typescript
const operationsDashboard = new CloudWatchDashboard({
  dashboardName: 'Clenergize-Operations-RealTime',
  widgets: [
    // Service Map
    {
      type: 'xray-service-map',
      properties: {
        title: 'Service Dependencies',
        region: 'us-east-1'
      },
      width: 24,
      height: 8
    },

    // Live Request Count
    {
      type: 'metric',
      properties: {
        title: 'Requests Per Second (All Services)',
        metrics: [
          ['Clenergize/Application', 'RequestCount', { Service: 'identity' }, { stat: 'Sum', period: 60, label: 'Identity' }],
          ['...', { Service: 'organization' }, { label: 'Organization' }],
          ['...', { Service: 'activity' }, { label: 'Activity' }],
          ['...', { Service: 'calculation' }, { label: 'Calculation' }],
          ['...', { Service: 'reference' }, { label: 'Reference' }],
          ['...', { Service: 'reporting' }, { label: 'Reporting' }],
          ['...', { Service: 'audit' }, { label: 'Audit' }]
        ],
        view: 'timeSeries',
        stacked: true,
        region: 'us-east-1',
        period: 60,
        yAxis: { left: { min: 0 } }
      },
      width: 12,
      height: 6
    },

    // Live Error Rate
    {
      type: 'metric',
      properties: {
        title: 'Error Rate % (All Services)',
        metrics: [
          [{ expression: '(e1/t1)*100', label: 'Identity' }],
          [{ expression: '(e2/t2)*100', label: 'Organization' }],
          [{ expression: '(e3/t3)*100', label: 'Activity' }],

          ['Clenergize/SLI', 'ErrorRequests', { Service: 'identity' }, { id: 'e1', visible: false }],
          ['Clenergize/Application', 'RequestCount', { Service: 'identity' }, { id: 't1', visible: false }],
          ['Clenergize/SLI', 'ErrorRequests', { Service: 'organization' }, { id: 'e2', visible: false }],
          ['Clenergize/Application', 'RequestCount', { Service: 'organization' }, { id: 't2', visible: false }],
          ['Clenergize/SLI', 'ErrorRequests', { Service: 'activity' }, { id: 'e3', visible: false }],
          ['Clenergize/Application', 'RequestCount', { Service: 'activity' }, { id: 't3', visible: false }]
        ],
        period: 300,
        yAxis: { left: { min: 0, max: 5 } },
        annotations: {
          horizontal: [
            { value: 2, label: 'Warning', color: '#ff7f0e' }
          ]
        }
      },
      width: 12,
      height: 6
    },

    // Active Alarms
    {
      type: 'alarm',
      properties: {
        title: 'Active Alarms',
        alarms: [
          'arn:aws:cloudwatch:us-east-1:123456789012:alarm:Clenergize-*'
        ]
      },
      width: 12,
      height: 6
    },

    // Recent Logs (Errors only)
    {
      type: 'log',
      properties: {
        title: 'Recent Errors (All Services)',
        query: `SOURCE '/aws/ecs/clenergize-*'
                | fields @timestamp, service, level, message, errorType
                | filter level = "ERROR"
                | sort @timestamp desc
                | limit 20`,
        region: 'us-east-1'
      },
      width: 12,
      height: 6
    }
  ]
});
```

### 8.2 SLO Compliance Dashboard

```typescript
const sloDashboard = new CloudWatchDashboard({
  dashboardName: 'Clenergize-SLO-Compliance',
  widgets: [
    // Error Budget Burn Rate
    {
      type: 'metric',
      properties: {
        title: 'Error Budget Burn Rate (30-day rolling)',
        metrics: [
          [{ expression: '((1 - (m1 / (m1 + m2))) * 100) / 0.05', label: 'Burn Rate' }],
          ['Clenergize/SLI', 'SuccessfulRequests', { id: 'm1', visible: false, stat: 'Sum', period: 2592000 }],
          ['Clenergize/SLI', 'ErrorRequests', { id: 'm2', visible: false, stat: 'Sum', period: 2592000 }]
        ],
        annotations: {
          horizontal: [
            { value: 1.0, label: 'Budget Exhausted', color: '#d62728' },
            { value: 0.5, label: '50% Budget Used', color: '#ff7f0e' }
          ]
        },
        yAxis: { left: { min: 0, max: 1.5 } }
      },
      width: 24,
      height: 6
    },

    // SLO Compliance by Service
    {
      type: 'metric',
      properties: {
        title: 'Availability SLO Compliance (99.95% target)',
        metrics: [
          [{ expression: '(m1/(m1+m2))*100', label: 'Identity', id: 'a1' }],
          [{ expression: '(m3/(m3+m4))*100', label: 'Organization', id: 'a2' }],
          [{ expression: '(m5/(m5+m6))*100', label: 'Activity', id: 'a3' }],

          ['Clenergize/SLI', 'SuccessfulRequests', { Service: 'identity' }, { id: 'm1', visible: false }],
          ['Clenergize/SLI', 'ErrorRequests', { Service: 'identity' }, { id: 'm2', visible: false }],
          ['Clenergize/SLI', 'SuccessfulRequests', { Service: 'organization' }, { id: 'm3', visible: false }],
          ['Clenergize/SLI', 'ErrorRequests', { Service: 'organization' }, { id: 'm4', visible: false }],
          ['Clenergize/SLI', 'SuccessfulRequests', { Service: 'activity' }, { id: 'm5', visible: false }],
          ['Clenergize/SLI', 'ErrorRequests', { Service: 'activity' }, { id: 'm6', visible: false }]
        ],
        period: 86400, // Daily
        yAxis: { left: { min: 99.5, max: 100 } },
        annotations: {
          horizontal: [
            { value: 99.95, label: 'SLO Target', color: '#2ca02c' }
          ]
        }
      },
      width: 12,
      height: 6
    },

    // Latency SLO Compliance
    {
      type: 'metric',
      properties: {
        title: 'Latency SLO Compliance (p95 < 200ms target)',
        metrics: [
          ['Clenergize/Application', 'ResponseTime', { Service: 'identity' }, { stat: 'p95', label: 'Identity' }],
          ['...', { Service: 'organization' }, { label: 'Organization' }],
          ['...', { Service: 'activity' }, { label: 'Activity' }],
          ['...', { Service: 'calculation' }, { label: 'Calculation' }]
        ],
        period: 300,
        yAxis: { left: { min: 0, max: 500 } },
        annotations: {
          horizontal: [
            { value: 200, label: 'SLO Target', color: '#2ca02c' },
            { value: 300, label: 'Warning', color: '#ff7f0e' }
          ]
        }
      },
      width: 12,
      height: 6
    },

    // SLO Violation History
    {
      type: 'log',
      properties: {
        title: 'SLO Violations (Last 7 Days)',
        query: `SOURCE '/aws/lambda/slo-calculator'
                | fields @timestamp, service, metric, actual, target, violation
                | filter violation = true
                | sort @timestamp desc`,
        region: 'us-east-1'
      },
      width: 24,
      height: 6
    }
  ]
});
```

---

## 9. Capacity Planning

### 9.1 Resource Utilization Tracking

```typescript
// CloudWatch Metrics for Capacity Planning
const capacityMetrics = [
  // CPU Utilization
  {
    namespace: 'AWS/ECS',
    metricName: 'CPUUtilization',
    dimensions: { ServiceName: 'identity-service' },
    statistics: ['Average', 'Maximum'],
    period: 300
  },

  // Memory Utilization
  {
    namespace: 'AWS/ECS',
    metricName: 'MemoryUtilization',
    dimensions: { ServiceName: 'identity-service' },
    statistics: ['Average', 'Maximum'],
    period: 300
  },

  // Database Connection Pool
  {
    namespace: 'Clenergize/Database',
    metricName: 'ConnectionPoolUtilization',
    dimensions: { Service: 'identity-service' },
    statistics: ['Average', 'Maximum'],
    period: 300
  },

  // Redis Memory
  {
    namespace: 'AWS/ElastiCache',
    metricName: 'DatabaseMemoryUsagePercentage',
    dimensions: { CacheClusterId: 'clenergize-prod-redis' },
    statistics: ['Average', 'Maximum'],
    period: 300
  }
];
```

### 9.2 Capacity Forecasting

```typescript
@Injectable()
export class CapacityForecastService {
  private cloudWatch: CloudWatchClient;

  async forecastCapacity(
    metricName: string,
    lookbackDays: number = 30,
    forecastDays: number = 30
  ): Promise<CapacityForecast> {
    // Fetch historical data
    const endTime = new Date();
    const startTime = new Date(Date.now() - lookbackDays * 86400000);

    const historicalData = await this.cloudWatch.send(
      new GetMetricStatisticsCommand({
        Namespace: 'Clenergize/Application',
        MetricName: metricName,
        StartTime: startTime,
        EndTime: endTime,
        Period: 86400, // Daily
        Statistics: ['Average', 'Maximum']
      })
    );

    // Simple linear regression forecast
    const datapoints = historicalData.Datapoints.sort(
      (a, b) => a.Timestamp.getTime() - b.Timestamp.getTime()
    );

    const { slope, intercept } = this.linearRegression(
      datapoints.map((d, i) => [i, d.Average])
    );

    // Forecast future values
    const forecast: ForecastDatapoint[] = [];
    for (let i = 0; i < forecastDays; i++) {
      const dayIndex = datapoints.length + i;
      const predictedValue = slope * dayIndex + intercept;

      forecast.push({
        date: new Date(endTime.getTime() + i * 86400000),
        predictedValue,
        upperBound: predictedValue * 1.2, // 20% buffer
        lowerBound: predictedValue * 0.8
      });
    }

    // Calculate capacity threshold crossings
    const capacityThreshold = 80; // 80% utilization
    const daysToThreshold = forecast.findIndex(
      (f) => f.predictedValue > capacityThreshold
    );

    return {
      metricName,
      currentValue: datapoints[datapoints.length - 1].Average,
      trendSlope: slope,
      forecast,
      daysToCapacity: daysToThreshold > 0 ? daysToThreshold : null,
      recommendation: this.getRecommendation(daysToThreshold)
    };
  }

  private linearRegression(data: number[][]): { slope: number; intercept: number } {
    const n = data.length;
    const sumX = data.reduce((sum, [x]) => sum + x, 0);
    const sumY = data.reduce((sum, [, y]) => sum + y, 0);
    const sumXY = data.reduce((sum, [x, y]) => sum + x * y, 0);
    const sumXX = data.reduce((sum, [x]) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  private getRecommendation(daysToCapacity: number | null): string {
    if (daysToCapacity === null) {
      return 'No capacity concerns in next 30 days';
    } else if (daysToCapacity < 7) {
      return 'URGENT: Scale up within 7 days';
    } else if (daysToCapacity < 14) {
      return 'Plan to scale up within 2 weeks';
    } else {
      return 'Monitor - capacity adequate for now';
    }
  }
}
```

### 9.3 Auto-Scaling Configuration

```typescript
// ECS Service Auto-Scaling
const autoScalingTarget = new ApplicationAutoScaling.ScalableTarget({
  serviceNamespace: 'ecs',
  resourceId: 'service/clenergize-prod/identity-service',
  scalableDimension: 'ecs:service:DesiredCount',
  minCapacity: 2,
  maxCapacity: 20
});

// Target Tracking Scaling Policy (CPU)
const cpuScalingPolicy = new ApplicationAutoScaling.TargetTrackingScalingPolicy({
  policyName: 'identity-service-cpu-scaling',
  policyType: 'TargetTrackingScaling',
  scalingTargetId: autoScalingTarget.id,
  targetTrackingScalingPolicyConfiguration: {
    targetValue: 70, // 70% CPU utilization
    predefinedMetricSpecification: {
      predefinedMetricType: 'ECSServiceAverageCPUUtilization'
    },
    scaleInCooldown: 300,
    scaleOutCooldown: 60
  }
});

// Target Tracking Scaling Policy (Request Count)
const requestScalingPolicy = new ApplicationAutoScaling.TargetTrackingScalingPolicy({
  policyName: 'identity-service-request-scaling',
  policyType: 'TargetTrackingScaling',
  scalingTargetId: autoScalingTarget.id,
  targetTrackingScalingPolicyConfiguration: {
    targetValue: 1000, // 1000 RPS per task
    customizedMetricSpecification: {
      metricName: 'RequestCountPerTask',
      namespace: 'Clenergize/Application',
      statistic: 'Average',
      dimensions: [
        { name: 'Service', value: 'identity-service' }
      ]
    },
    scaleInCooldown: 300,
    scaleOutCooldown: 60
  }
});
```

---

## 10. Cost Optimization

### 10.1 Cost Allocation Tags

```typescript
// Tag all resources for cost tracking
const costAllocationTags = {
  Project: 'Clenergize',
  Environment: process.env.NODE_ENV,
  Service: process.env.SERVICE_NAME,
  Team: 'Engineering',
  CostCenter: 'Product-Development',
  Owner: 'platform-team@company.com'
};

// Apply to all AWS resources
const taggedResource = {
  ...resource,
  tags: costAllocationTags
};
```

### 10.2 Cost Monitoring Dashboard

```typescript
const costDashboard = new CloudWatchDashboard({
  dashboardName: 'Clenergize-Cost-Optimization',
  widgets: [
    // Daily Cost Trend
    {
      type: 'metric',
      properties: {
        title: 'Daily AWS Cost ($)',
        metrics: [
          ['AWS/Billing', 'EstimatedCharges', { Currency: 'USD' }, { stat: 'Maximum', period: 86400 }]
        ],
        period: 86400,
        yAxis: { left: { min: 0 } }
      },
      width: 12,
      height: 6
    },

    // Cost by Service
    {
      type: 'metric',
      properties: {
        title: 'Cost by Service ($)',
        metrics: [
          ['AWS/Billing', 'EstimatedCharges', { ServiceName: 'AmazonEC2' }, { label: 'EC2' }],
          ['...', { ServiceName: 'AmazonRDS' }, { label: 'RDS' }],
          ['...', { ServiceName: 'AmazonS3' }, { label: 'S3' }],
          ['...', { ServiceName: 'AmazonCloudWatch' }, { label: 'CloudWatch' }],
          ['...', { ServiceName: 'AmazonElastiCache' }, { label: 'ElastiCache' }]
        ],
        period: 86400,
        view: 'singleValue'
      },
      width: 12,
      height: 6
    },

    // Cost Efficiency Metrics
    {
      type: 'metric',
      properties: {
        title: 'Cost per 1M Requests ($)',
        metrics: [
          [{ expression: '(cost / requests) * 1000000', label: 'Cost per 1M Requests' }],
          ['AWS/Billing', 'EstimatedCharges', { id: 'cost', visible: false }],
          ['Clenergize/Application', 'RequestCount', { id: 'requests', visible: false, stat: 'Sum' }]
        ],
        period: 86400
      },
      width: 12,
      height: 6
    }
  ]
});
```

### 10.3 Cost Optimization Recommendations

```typescript
@Injectable()
export class CostOptimizationService {
  async analyzeCosts(): Promise<CostOptimization[]> {
    const recommendations: CostOptimization[] = [];

    // 1. Check for idle resources
    const idleInstances = await this.findIdleInstances();
    if (idleInstances.length > 0) {
      recommendations.push({
        category: 'Idle Resources',
        severity: 'High',
        potentialSavings: idleInstances.length * 50, // $50/month per instance
        recommendation: `Terminate ${idleInstances.length} idle EC2 instances`,
        resources: idleInstances
      });
    }

    // 2. Check for oversized instances
    const oversizedInstances = await this.findOversizedInstances();
    if (oversizedInstances.length > 0) {
      recommendations.push({
        category: 'Oversized Instances',
        severity: 'Medium',
        potentialSavings: oversizedInstances.length * 30,
        recommendation: 'Downsize instances with <30% CPU utilization',
        resources: oversizedInstances
      });
    }

    // 3. Check cache hit rate
    const cacheHitRate = await this.getCacheHitRate();
    if (cacheHitRate < 70) {
      recommendations.push({
        category: 'Cache Optimization',
        severity: 'Medium',
        potentialSavings: 100, // Reduced database costs
        recommendation: `Improve cache hit rate (current: ${cacheHitRate}%, target: >85%)`,
        resources: []
      });
    }

    // 4. Check S3 storage class optimization
    const oldS3Objects = await this.findOldS3Objects();
    if (oldS3Objects.count > 0) {
      recommendations.push({
        category: 'S3 Storage Class',
        severity: 'Low',
        potentialSavings: oldS3Objects.size * 0.02, // $0.02/GB savings
        recommendation: `Move ${oldS3Objects.count} old objects to Glacier (>90 days old)`,
        resources: []
      });
    }

    return recommendations;
  }

  private async findIdleInstances(): Promise<string[]> {
    // Query CloudWatch for instances with <5% CPU for 7 days
    const startTime = new Date(Date.now() - 7 * 86400000);
    const endTime = new Date();

    // Implementation details...
    return [];
  }

  private async findOversizedInstances(): Promise<string[]> {
    // Query CloudWatch for instances with <30% CPU for 30 days
    // Implementation details...
    return [];
  }

  private async getCacheHitRate(): Promise<number> {
    // Calculate overall cache hit rate
    // Implementation details...
    return 0;
  }

  private async findOldS3Objects(): Promise<{ count: number; size: number }> {
    // Find S3 objects >90 days old
    // Implementation details...
    return { count: 0, size: 0 };
  }
}
```

---

## 11. Incident Response

### 11.1 Runbook Template

```markdown
# Runbook: High Error Rate

## Symptoms
- Error rate >2% for >10 minutes
- CloudWatch alarm: Clenergize-{Service}-ErrorRate-P2

## Impact
- Degraded user experience
- Potential SLO violation

## Investigation Steps

1. **Check CloudWatch Dashboard**
   - Navigate to service-specific dashboard
   - Review error rate trend (last hour)
   - Identify affected endpoints

2. **Query Recent Errors**
   ```sql
   SOURCE '/aws/ecs/{service}'
   | fields @timestamp, level, message, errorType, stack
   | filter level = "ERROR"
   | sort @timestamp desc
   | limit 50
   ```

3. **Check Dependencies**
   - MongoDB connection pool: `db.serverStatus().connections`
   - Redis availability: `redis-cli ping`
   - AWS service status: https://status.aws.amazon.com

4. **Review Recent Deployments**
   - Check if error spike correlates with deployment
   - Review recent code changes

5. **Check X-Ray Traces**
   - Identify slow/failing traces
   - Look for common patterns

## Mitigation Steps

### Quick Fixes
1. **Rollback recent deployment** (if correlation found)
   ```bash
   aws ecs update-service --cluster clenergize-prod \
     --service {service-name} \
     --task-definition {previous-version}
   ```

2. **Scale up service** (if resource exhaustion)
   ```bash
   aws ecs update-service --cluster clenergize-prod \
     --service {service-name} \
     --desired-count {increased-count}
   ```

3. **Clear cache** (if stale data suspected)
   ```bash
   redis-cli FLUSHDB
   ```

### Long-term Fixes
1. Identify root cause from logs/traces
2. Create GitHub issue with incident details
3. Schedule postmortem meeting
4. Implement fix and deploy
5. Add monitoring/alerting to prevent recurrence

## Communication
- Update status page: https://status.clenergize.com
- Post in #incidents Slack channel
- Notify stakeholders if user-facing impact

## Postmortem Template
- What happened?
- What was the impact?
- What was the root cause?
- What did we learn?
- What actions will we take to prevent recurrence?
```

### 11.2 Automated Remediation

```typescript
@Injectable()
export class AutoRemediationService {
  async handleHighErrorRate(alarm: CloudWatchAlarm): Promise<void> {
    const serviceName = alarm.dimensions.Service;

    // 1. Gather context
    const recentErrors = await this.getRecentErrors(serviceName);
    const recentDeployments = await this.getRecentDeployments(serviceName);

    // 2. Analyze errors
    const errorPattern = this.analyzeErrorPattern(recentErrors);

    // 3. Attempt automatic remediation
    if (errorPattern.type === 'DATABASE_CONNECTION') {
      // Restart database connection pool
      await this.restartConnectionPool(serviceName);
      await this.notifyTeam(`Auto-remediation: Restarted DB pool for ${serviceName}`);

    } else if (errorPattern.type === 'MEMORY_LEAK') {
      // Restart service
      await this.restartService(serviceName);
      await this.notifyTeam(`Auto-remediation: Restarted ${serviceName} due to memory leak`);

    } else if (errorPattern.type === 'DEPLOYMENT_ISSUE' && recentDeployments.length > 0) {
      // Auto-rollback
      await this.rollbackDeployment(serviceName, recentDeployments[0].previousVersion);
      await this.notifyTeam(`Auto-remediation: Rolled back ${serviceName} to ${recentDeployments[0].previousVersion}`);

    } else {
      // Cannot auto-remediate, escalate to on-call
      await this.escalateToPagerDuty(serviceName, errorPattern);
    }
  }

  private analyzeErrorPattern(errors: Error[]): ErrorPattern {
    // Group errors by type
    const errorCounts = errors.reduce((acc, err) => {
      acc[err.type] = (acc[err.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Find dominant error type
    const [dominantType, count] = Object.entries(errorCounts)
      .sort(([, a], [, b]) => b - a)[0];

    return {
      type: dominantType,
      count,
      percentage: (count / errors.length) * 100
    };
  }
}
```

---

## 12. Testing & Validation

### 12.1 SLO Validation Tests

```typescript
describe('SLO Compliance Tests', () => {
  let cloudWatch: CloudWatchClient;

  beforeAll(() => {
    cloudWatch = new CloudWatchClient({ region: 'us-east-1' });
  });

  it('should meet availability SLO (99.95%)', async () => {
    const availability = await calculateAvailability('identity-service', 30);
    expect(availability).toBeGreaterThanOrEqual(99.95);
  });

  it('should meet latency SLO (p95 < 200ms)', async () => {
    const p95Latency = await getLatencyPercentile('activity-service', 95, 30);
    expect(p95Latency).toBeLessThan(200);
  });

  it('should meet error rate SLO (<0.1%)', async () => {
    const errorRate = await calculateErrorRate('organization-service', 30);
    expect(errorRate).toBeLessThan(0.1);
  });

  async function calculateAvailability(service: string, days: number): Promise<number> {
    const endTime = new Date();
    const startTime = new Date(Date.now() - days * 86400000);

    const [successData, errorData] = await Promise.all([
      cloudWatch.send(new GetMetricStatisticsCommand({
        Namespace: 'Clenergize/SLI',
        MetricName: 'SuccessfulRequests',
        Dimensions: [{ Name: 'Service', Value: service }],
        StartTime: startTime,
        EndTime: endTime,
        Period: days * 86400,
        Statistics: ['Sum']
      })),
      cloudWatch.send(new GetMetricStatisticsCommand({
        Namespace: 'Clenergize/SLI',
        MetricName: 'ErrorRequests',
        Dimensions: [{ Name: 'Service', Value: service }],
        StartTime: startTime,
        EndTime: endTime,
        Period: days * 86400,
        Statistics: ['Sum']
      }))
    ]);

    const successCount = successData.Datapoints[0]?.Sum || 0;
    const errorCount = errorData.Datapoints[0]?.Sum || 0;
    const total = successCount + errorCount;

    return (successCount / total) * 100;
  }
});
```

### 12.2 Chaos Engineering

```typescript
// Chaos experiments to validate monitoring and alerting
@Injectable()
export class ChaosExperimentService {
  // Experiment 1: Inject latency
  async injectLatency(serviceName: string, durationMs: number, delayMs: number): Promise<void> {
    console.log(`Injecting ${delayMs}ms latency to ${serviceName} for ${durationMs}ms`);

    // Enable latency injection middleware
    await this.enableChaosMiddleware(serviceName, {
      type: 'latency',
      delayMs
    });

    // Wait for experiment duration
    await new Promise(resolve => setTimeout(resolve, durationMs));

    // Disable chaos middleware
    await this.disableChaosMiddleware(serviceName);

    // Verify alerts fired
    const alerts = await this.getAlertsInTimeRange(
      new Date(Date.now() - durationMs),
      new Date()
    );

    expect(alerts.some(a => a.alarmName.includes('Latency'))).toBe(true);
  }

  // Experiment 2: Inject errors
  async injectErrors(serviceName: string, errorRate: number, durationMs: number): Promise<void> {
    console.log(`Injecting ${errorRate}% error rate to ${serviceName}`);

    await this.enableChaosMiddleware(serviceName, {
      type: 'error',
      errorRate
    });

    await new Promise(resolve => setTimeout(resolve, durationMs));
    await this.disableChaosMiddleware(serviceName);

    // Verify error rate alarm fired
    const alerts = await this.getAlertsInTimeRange(
      new Date(Date.now() - durationMs),
      new Date()
    );

    expect(alerts.some(a => a.alarmName.includes('ErrorRate'))).toBe(true);
  }

  // Experiment 3: Kill service instance
  async killServiceInstance(serviceName: string): Promise<void> {
    console.log(`Killing one instance of ${serviceName}`);

    // Get running tasks
    const tasks = await ecs.listTasks({
      cluster: 'clenergize-prod',
      serviceName
    });

    if (tasks.taskArns.length > 0) {
      // Kill first task
      await ecs.stopTask({
        cluster: 'clenergize-prod',
        task: tasks.taskArns[0],
        reason: 'Chaos engineering experiment'
      });

      // Verify service auto-recovers
      await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 1 minute

      const newTasks = await ecs.listTasks({
        cluster: 'clenergize-prod',
        serviceName
      });

      expect(newTasks.taskArns.length).toBeGreaterThanOrEqual(tasks.taskArns.length);
    }
  }
}
```

---

## Summary

This Performance SLOs & Monitoring Strategy provides:

1. **Clear SLOs** for availability (99.95%), latency (p95 <200ms), error rate (<0.1%)
2. **Service-Level Indicators (SLIs)** measured with CloudWatch metrics
3. **Comprehensive Monitoring** with structured logging, distributed tracing, custom metrics
4. **Proactive Alerting** with 4-tier severity levels and automated escalation
5. **Real-Time Dashboards** for operations, SLO compliance, and cost optimization
6. **Capacity Planning** with forecasting and auto-scaling
7. **Cost Optimization** with recommendations and budget tracking
8. **Incident Response** with runbooks and automated remediation
9. **Chaos Engineering** to validate monitoring effectiveness

### Key Metrics Summary

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Availability** | 99.95% | Success rate over 30 days |
| **Latency (p95)** | <200ms | Response time 95th percentile |
| **Error Rate** | <0.1% | 5xx errors / total requests |
| **Cache Hit Rate** | >85% | Cache hits / total cache ops |
| **Database Query** | <75ms p95 | Query duration 95th percentile |
| **Throughput** | 8,000 RPS | Peak requests per second |
| **MTTR** | <30 min | Mean time to recovery |
| **Error Budget** | 21.6 min/month | (1 - SLO) × 30 days |

### Next Steps

1. ✅ **Completed**: Performance SLOs and monitoring strategy designed
2. **Next**: NestJS Service Template - Production-ready boilerplate
3. **Next**: Implement CloudWatch dashboards
4. **Next**: Configure PagerDuty integration
5. **Next**: Set up chaos engineering experiments

---

**Document Complete**: November 18, 2025
