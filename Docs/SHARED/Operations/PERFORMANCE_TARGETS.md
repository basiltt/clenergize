# Performance Targets & Service Level Objectives

**Version**: 1.0.0
**Last Updated**: November 18, 2025
**Status**: ACTIVE
**Sprint**: 0.4
**Priority**: HIGH

---

## Executive Summary

This document defines quantified performance targets, Service Level Indicators (SLIs), and Service Level Objectives (SLOs) for all Clenergize V3 microservices. These targets ensure **99.9% availability**, **sub-200ms response times**, and **scalability to 10K concurrent users**.

### Key Performance Goals

| Metric | Target | Impact |
|--------|--------|--------|
| **Availability** | 99.9% | Max 43 minutes downtime/month |
| **API Latency (p95)** | < 200ms | Excellent user experience |
| **Error Rate** | < 1% | High reliability |
| **Throughput** | 5K req/sec | Scales to 10K concurrent users |
| **Database Latency (p95)** | < 50ms | Fast data access |

---

## Table of Contents

1. [Service-Level Indicators (SLIs)](#service-level-indicators-slis)
2. [Service-Level Objectives (SLOs)](#service-level-objectives-slos)
3. [Service-Specific Targets](#service-specific-targets)
4. [Database Performance](#database-performance)
5. [Infrastructure Performance](#infrastructure-performance)
6. [Error Budgets](#error-budgets)
7. [Load Testing Scenarios](#load-testing-scenarios)
8. [Performance Monitoring Setup](#performance-monitoring-setup)
9. [Optimization Strategies](#optimization-strategies)

---

## Service-Level Indicators (SLIs)

### What We Measure

| SLI | Definition | How to Measure |
|-----|------------|----------------|
| **Availability** | % of successful requests | `(successful_requests / total_requests) * 100` |
| **Latency** | Time to first byte | P50, P95, P99 percentiles |
| **Error Rate** | % of failed requests | `(failed_requests / total_requests) * 100` |
| **Throughput** | Requests per second | Count over 1-minute window |
| **Saturation** | Resource utilization | CPU%, Memory%, Disk I/O% |

### Measurement Windows

- **Real-time**: 1-minute rolling window
- **Short-term**: 1-hour rolling window
- **Long-term**: 30-day rolling window
- **Reporting**: Monthly SLO compliance

---

## Service-Level Objectives (SLOs)

### Global SLOs (All Services)

```yaml
Availability SLO:
  target: 99.9%
  measurement_window: 30 days
  error_budget: 0.1% (43 minutes/month)

Latency SLO:
  p50: < 100ms
  p95: < 200ms
  p99: < 500ms
  measurement_window: 1 hour

Error Rate SLO:
  target: < 1%
  measurement_window: 1 hour

Throughput SLO:
  minimum: 1000 req/sec
  target: 5000 req/sec
  peak: 10000 req/sec
```

### Error Budget Policy

```yaml
100% Budget Remaining (0% errors):
  - Normal operations
  - All features enabled
  - Aggressive deployments allowed

50-99% Budget Remaining:
  - Normal operations
  - Monitor closely
  - Standard deployment cadence

25-49% Budget Remaining:
  - Reduce deployment frequency
  - Focus on stability
  - Postmortem for incidents

0-24% Budget Remaining:
  - Deployment freeze
  - Mandatory postmortems
  - Stability sprint required

0% Budget (exceeded SLO):
  - Emergency mode
  - All hands on deck
  - Root cause analysis required
```

---

## Service-Specific Targets

### 1. Identity Service (Port 3001)

```yaml
Endpoints:
  POST /v1/auth/login:
    p50: < 80ms
    p95: < 150ms
    p99: < 300ms
    throughput: 500 req/sec
    notes: "JWT generation overhead"

  POST /v1/auth/verify:
    p50: < 10ms
    p95: < 20ms
    p99: < 50ms
    throughput: 2000 req/sec
    notes: "JWKS caching enabled"

  POST /v1/auth/refresh:
    p50: < 50ms
    p95: < 100ms
    p99: < 200ms
    throughput: 800 req/sec

  GET /v1/users/:id:
    p50: < 30ms
    p95: < 60ms
    p99: < 120ms
    throughput: 1500 req/sec
    notes: "Redis cache hit rate > 85%"

  POST /v1/users:
    p50: < 100ms
    p95: < 200ms
    p99: < 400ms
    throughput: 200 req/sec
    notes: "Includes password hashing (bcrypt)"

Database Operations:
  findUserById:
    p95: < 10ms
    cache_hit_rate: > 90%

  createUser:
    p95: < 50ms
    includes: "MongoDB insert + Redis cache update"

Critical Path:
  Authentication Flow (login → JWT):
    p95: < 150ms
    availability: 99.95%
    error_budget: 21 minutes/month
```

---

### 2. Organization Service (Port 3002)

```yaml
Endpoints:
  GET /v1/projects:
    p50: < 100ms
    p95: < 200ms
    p99: < 400ms
    throughput: 1000 req/sec
    notes: "Paginated results (limit 100)"

  GET /v1/projects/:id/hierarchy:
    p50: < 150ms
    p95: < 300ms
    p99: < 600ms
    throughput: 500 req/sec
    notes: "Complex hierarchy traversal"

  POST /v1/projects:
    p50: < 150ms
    p95: < 300ms
    p99: < 600ms
    throughput: 100 req/sec
    notes: "Creates hierarchy reference snapshot"

  POST /v1/permissions:
    p50: < 80ms
    p95: < 150ms
    p99: < 300ms
    throughput: 300 req/sec

Database Operations:
  findProjectsByOrganization:
    p95: < 50ms
    max_results: 1000
    pagination: required

  getHierarchyTree:
    p95: < 100ms
    max_depth: 10 levels
    notes: "Uses pre-computed paths"

Critical Path:
  Project Creation (create + hierarchy setup):
    p95: < 500ms
    availability: 99.9%
```

---

### 3. Reference Service (Port 3003)

```yaml
Endpoints:
  GET /v1/emission-factors:
    p50: < 50ms
    p95: < 100ms
    p99: < 200ms
    throughput: 2000 req/sec
    notes: "Heavily cached (99% hit rate)"

  GET /v1/emission-factors/:id:
    p50: < 20ms
    p95: < 40ms
    p99: < 80ms
    throughput: 3000 req/sec
    cache_hit_rate: > 95%

  GET /v1/units:
    p50: < 30ms
    p95: < 60ms
    p99: < 120ms
    throughput: 1500 req/sec

  POST /v1/emission-factors:
    p50: < 80ms
    p95: < 150ms
    p99: < 300ms
    throughput: 50 req/sec
    notes: "Admin operation, triggers cache invalidation"

Database Operations:
  findEmissionFactors (filtered):
    p95: < 30ms
    max_results: 500
    indexes: category, scope, geography

Critical Path:
  Factor Lookup (for calculation):
    p95: < 50ms
    availability: 99.99%
    cache_hit_rate: > 99%
    notes: "Critical for calculation service"
```

---

### 4. Activity Service (Port 3004)

```yaml
Endpoints:
  POST /v1/activity-data:
    p50: < 100ms
    p95: < 200ms
    p99: < 400ms
    throughput: 500 req/sec
    notes: "Includes validation"

  POST /v1/activity-data/bulk:
    p50: < 2000ms
    p95: < 5000ms
    p99: < 10000ms
    throughput: 50 req/sec
    batch_size: max 1000 records
    notes: "Async processing with queue"

  GET /v1/activity-data:
    p50: < 80ms
    p95: < 150ms
    p99: < 300ms
    throughput: 1000 req/sec
    pagination: required

  PUT /v1/activity-data/:id:
    p50: < 120ms
    p95: < 250ms
    p99: < 500ms
    throughput: 200 req/sec
    notes: "Triggers recalculation event"

Database Operations:
  insertActivityData:
    p95: < 50ms

  bulkInsert (1000 records):
    p95: < 3000ms
    batch_processing: enabled

Critical Path:
  Data Ingestion (validate + store + event):
    p95: < 300ms
    throughput: 100 records/sec
```

---

### 5. Calculation Service (Port 3005)

```yaml
Endpoints:
  POST /v1/calculations:
    p50: < 300ms
    p95: < 800ms
    p99: < 2000ms
    throughput: 200 req/sec
    notes: "Complex emission calculations"

  POST /v1/calculations/batch:
    p50: < 5000ms
    p95: < 15000ms
    p99: < 30000ms
    throughput: 20 req/sec
    batch_size: max 500 records

  GET /v1/calculations/:id:
    p50: < 40ms
    p95: < 80ms
    p99: < 160ms
    throughput: 1000 req/sec

  POST /v1/rollups:
    p50: < 1000ms
    p95: < 3000ms
    p99: < 6000ms
    throughput: 50 req/sec
    notes: "Hierarchy aggregation"

Calculation Operations:
  singleEmissionCalculation:
    p95: < 500ms
    includes: "Factor lookup + conversion + calculation"

  hierarchyRollup (100 nodes):
    p95: < 2000ms

  batchCalculation (100 records):
    p95: < 10000ms
    throughput: 10 batches/sec

Critical Path:
  Calculate & Store (fetch factors + compute + save):
    p95: < 1000ms
    accuracy: 99.99%
    notes: "Calculations must be exact"
```

---

### 6. Reporting Service (Port 3006)

```yaml
Endpoints:
  GET /v1/reports:
    p50: < 60ms
    p95: < 120ms
    p99: < 240ms
    throughput: 500 req/sec

  POST /v1/reports/generate:
    p50: < 3000ms
    p95: < 8000ms
    p99: < 15000ms
    throughput: 30 req/sec
    notes: "Async job creation"

  GET /v1/reports/:id/download:
    p50: < 200ms
    p95: < 500ms
    p99: < 1000ms
    throughput: 100 req/sec
    notes: "S3 presigned URL generation"

Report Generation:
  PDF (100 pages):
    p95: < 30000ms

  Excel (10K rows):
    p95: < 20000ms

  CSV (100K rows):
    p95: < 10000ms

Critical Path:
  Report Generation Queue:
    queue_lag: < 30 seconds
    throughput: 100 reports/hour
```

---

### 7. Audit Service (Port 3007)

```yaml
Endpoints:
  POST /v1/audit-logs:
    p50: < 50ms
    p95: < 100ms
    p99: < 200ms
    throughput: 2000 req/sec
    notes: "Async write to time-series DB"

  GET /v1/audit-logs:
    p50: < 100ms
    p95: < 200ms
    p99: < 400ms
    throughput: 300 req/sec
    pagination: required

  GET /v1/compliance/check:
    p50: < 2000ms
    p95: < 5000ms
    p99: < 10000ms
    throughput: 10 req/sec

Database Operations:
  insertAuditLog:
    p95: < 20ms
    batch_write: enabled

  queryAuditLogs (time-range):
    p95: < 150ms
    max_results: 1000
```

---

## Database Performance

### MongoDB Performance Targets

```yaml
Connection Pool:
  min_size: 10
  max_size: 100
  connection_timeout: 5000ms
  idle_timeout: 300000ms

Read Operations:
  findOne (indexed):
    p50: < 5ms
    p95: < 15ms
    p99: < 30ms

  find (limit 100, indexed):
    p50: < 20ms
    p95: < 50ms
    p99: < 100ms

  aggregate (simple):
    p50: < 50ms
    p95: < 150ms
    p99: < 300ms

Write Operations:
  insertOne:
    p50: < 10ms
    p95: < 30ms
    p99: < 60ms

  updateOne (indexed):
    p50: < 15ms
    p95: < 40ms
    p99: < 80ms

  bulkWrite (100 docs):
    p50: < 100ms
    p95: < 300ms
    p99: < 600ms

Index Performance:
  index_scan_efficiency: > 90%
  collection_scan_tolerance: < 5% of queries
  index_size: < 20% of data size
```

### Redis Performance Targets

```yaml
Connection Pool:
  size: 50
  connection_timeout: 1000ms

Operations:
  GET:
    p50: < 1ms
    p95: < 3ms
    p99: < 10ms

  SET:
    p50: < 2ms
    p95: < 5ms
    p99: < 15ms

  MGET (10 keys):
    p50: < 3ms
    p95: < 8ms
    p99: < 20ms

Cache Performance:
  hit_rate: > 85%
  eviction_rate: < 5%
  memory_utilization: < 80%
  key_expiration: properly configured
```

---

## Infrastructure Performance

### API Gateway

```yaml
Latency Overhead:
  routing: < 5ms
  authentication: < 10ms
  rate_limiting: < 2ms
  total_overhead: < 20ms

Throughput:
  sustained: 10000 req/sec
  burst: 20000 req/sec

Connection Management:
  keep_alive: enabled
  connection_reuse: > 90%
```

### EventBridge

```yaml
Event Publishing:
  latency_p95: < 50ms
  throughput: 5000 events/sec
  batch_size: 10 events

Event Delivery:
  delivery_attempts: 3
  retry_backoff: exponential
  dead_letter_queue: enabled
  delivery_latency_p95: < 500ms
```

### S3 Operations

```yaml
Upload:
  single_part (< 5MB):
    p95: < 500ms

  multipart (> 5MB):
    p95: < 2000ms

Download:
  presigned_url_generation:
    p95: < 50ms

  file_download (10MB):
    p95: < 1000ms
```

---

## Error Budgets

### Monthly Error Budget (99.9% SLO)

```
Total Time in Month: 43,200 minutes
Allowed Downtime: 43.2 minutes
Budget Per Service: 6.2 minutes (7 services)

Daily Budget: 1.44 minutes
Hourly Budget: 0.06 minutes (3.6 seconds)
```

### Budget Allocation

```yaml
Planned Maintenance:
  allocation: 20% (8.6 minutes/month)
  schedule: Sunday 2-4 AM UTC

Deployments:
  allocation: 30% (13 minutes/month)
  rolling_deployments: < 1 minute downtime

Incidents:
  allocation: 50% (21.6 minutes/month)
  severity_1: 15 minutes
  severity_2: 6.6 minutes
```

### Budget Tracking

```typescript
interface ErrorBudget {
  service: string;
  period: string; // '2025-11'
  budgetMinutes: number; // 43.2
  consumedMinutes: number; // actual downtime
  remainingPercent: number; // (budget - consumed) / budget * 100
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'EXHAUSTED';
  incidents: {
    timestamp: string;
    duration: number;
    severity: 'SEV1' | 'SEV2' | 'SEV3';
    impact: string;
  }[];
}

// Example
{
  "service": "identity-service",
  "period": "2025-11",
  "budgetMinutes": 43.2,
  "consumedMinutes": 12.5,
  "remainingPercent": 71.1,
  "status": "HEALTHY",
  "incidents": [
    {
      "timestamp": "2025-11-05T14:23:00Z",
      "duration": 8.3,
      "severity": "SEV2",
      "impact": "Slow JWT verification (p95: 450ms)"
    },
    {
      "timestamp": "2025-11-12T03:15:00Z",
      "duration": 4.2,
      "severity": "SEV3",
      "impact": "Database connection pool exhausted"
    }
  ]
}
```

---

## Load Testing Scenarios

### 1. Peak Load Test

```yaml
Scenario: Peak Load
Duration: 30 minutes
Ramp-up: 5 minutes
Users: 10,000 concurrent
Request Distribution:
  - GET /v1/projects: 40%
  - GET /v1/activity-data: 25%
  - POST /v1/calculations: 15%
  - GET /v1/reports: 10%
  - POST /v1/activity-data: 10%

Success Criteria:
  - p95 latency < 200ms
  - Error rate < 1%
  - No service restarts
  - CPU < 70%
  - Memory < 80%

K6 Script:
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '5m', target: 10000 }, // Ramp-up
    { duration: '30m', target: 10000 }, // Stay at peak
    { duration: '5m', target: 0 }, // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const responses = http.batch([
    ['GET', 'https://api.clenergize.com/v1/projects'],
    ['GET', 'https://api.clenergize.com/v1/activity-data'],
  ]);

  check(responses[0], {
    'projects status is 200': (r) => r.status === 200,
    'projects response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);
}
```

---

### 2. Sustained Load Test

```yaml
Scenario: Sustained Load
Duration: 2 hours
Users: 2,000 concurrent
Goal: Verify stability over time

Success Criteria:
  - No memory leaks
  - No connection pool exhaustion
  - Consistent latency (< 10% variance)
  - Error rate < 0.5%
```

---

### 3. Spike Test

```yaml
Scenario: Traffic Spike
Users: 0 → 15,000 in 2 minutes
Duration: 10 minutes

Goal: Test autoscaling and circuit breakers

Success Criteria:
  - Autoscaling triggers within 1 minute
  - p95 latency < 500ms during spike
  - No cascading failures
  - Error rate < 5% during spike
```

---

### 4. Soak Test

```yaml
Scenario: Soak Test
Duration: 24 hours
Users: 1,000 concurrent

Goal: Detect memory leaks and resource exhaustion

Success Criteria:
  - Memory usage stable (< 5% growth)
  - CPU usage stable (< 60%)
  - No connection leaks
  - Consistent performance throughout
```

---

## Performance Monitoring Setup

### Prometheus Metrics

```yaml
# Application metrics (exported by each service)
metrics:
  # HTTP metrics
  - http_request_duration_seconds:
      type: histogram
      buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1.0, 2.0, 5.0]
      labels: [service, method, endpoint, status]

  - http_requests_total:
      type: counter
      labels: [service, method, endpoint, status]

  - http_requests_in_flight:
      type: gauge
      labels: [service]

  # Database metrics
  - db_query_duration_seconds:
      type: histogram
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1.0]
      labels: [service, operation, collection]

  - db_connection_pool_size:
      type: gauge
      labels: [service, state] # active, idle

  # Cache metrics
  - cache_hit_rate:
      type: gauge
      labels: [service, cache_name]

  - cache_operation_duration_seconds:
      type: histogram
      labels: [service, operation] # get, set, delete

  # Business metrics
  - calculations_processed_total:
      type: counter
      labels: [service, status] # success, failed

  - report_generation_duration_seconds:
      type: histogram
      labels: [report_type, format]
```

### Grafana Dashboards

**Dashboard 1: Service Overview**
```yaml
Panels:
  - Request Rate (1m avg)
  - Error Rate (%)
  - Latency (p50, p95, p99)
  - Active Connections
  - Throughput (req/sec)
```

**Dashboard 2: SLO Compliance**
```yaml
Panels:
  - Availability (30-day rolling)
  - Error Budget Remaining (%)
  - Latency SLO Compliance
  - Error Rate SLO Compliance
```

**Dashboard 3: Database Performance**
```yaml
Panels:
  - Query Latency by Operation
  - Connection Pool Utilization
  - Slow Queries (> 100ms)
  - Index Usage Statistics
```

---

## Optimization Strategies

### When Performance Degrades

#### 1. API Latency > 200ms (p95)

**Diagnosis:**
```bash
# Check slow endpoints
kubectl logs -l app=identity-service --tail=1000 | \
  grep "duration" | \
  awk '{if($5>200) print $0}' | \
  sort -k5 -nr | head -20

# Check database slow queries
db.system.profile.find({millis: {$gt: 100}}).sort({millis: -1}).limit(10)
```

**Remediation:**
- Add database indexes
- Enable query result caching
- Implement pagination
- Optimize N+1 queries
- Add CDN for static content

---

#### 2. Database Queries > 50ms (p95)

**Diagnosis:**
```javascript
// Enable MongoDB profiling
db.setProfilingLevel(1, { slowms: 50 })

// Analyze slow queries
db.system.profile.find({millis: {$gt: 50}}).pretty()
```

**Remediation:**
- Add compound indexes
- Use projection to limit fields
- Implement aggregation pipeline optimization
- Consider read replicas
- Denormalize frequently joined data

---

#### 3. Memory Usage > 80%

**Diagnosis:**
```bash
# Check heap usage
kubectl top pods -l app=calculation-service

# Analyze memory leaks
node --inspect index.js
# Use Chrome DevTools → Memory tab
```

**Remediation:**
- Implement connection pooling limits
- Add cache eviction policies
- Reduce batch sizes
- Implement streaming for large datasets
- Add horizontal scaling

---

**Last Updated**: November 18, 2025
**Next Review**: Sprint 0.5 (after load testing)
**Maintained By**: DevOps Agent + Testing Agent
