# Performance Testing Infrastructure - Clenergize V3

> **Version**: 1.0.0
> **Status**: APPROVED
> **Critical**: Required for production readiness
> **Owner**: Testing Agent

---

## Executive Summary

Comprehensive performance testing infrastructure ensuring all 50 microservices meet SLA requirements: <200ms p95 response time, 10K concurrent users, and 99.99% availability.

---

## Performance Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Load Generation Layer                      │
│  - K6 Cloud (10K+ VUs)                                     │
│  - Artillery Pro (API testing)                             │
│  - Locust (Python-based for ML service)                    │
└─────────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  System Under Test                          │
│  - API Gateway (rate limiting, caching)                    │
│  - 50 Microservices (auto-scaled)                         │
│  - Databases (MongoDB, Redis, InfluxDB)                    │
└─────────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Monitoring & Analysis Layer                    │
│  - Prometheus (metrics collection)                         │
│  - Grafana (real-time dashboards)                         │
│  - Jaeger (distributed tracing)                            │
│  - CloudWatch (AWS metrics)                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Performance Test Types

### 1. Load Testing

```yaml
Purpose: Verify system behavior under expected load
Target: 1,000 concurrent users
Duration: 30 minutes
Success Criteria:
  - Response time p95 < 200ms
  - Error rate < 0.1%
  - CPU usage < 70%
  - Memory usage < 80%
```

### 2. Stress Testing

```yaml
Purpose: Find system breaking point
Target: Gradually increase to 10,000 users
Duration: 1 hour
Success Criteria:
  - Graceful degradation
  - No data loss
  - Automatic recovery
  - Circuit breakers activate
```

### 3. Spike Testing

```yaml
Purpose: Handle sudden traffic spikes
Target: 100 → 5,000 users in 30 seconds
Duration: 15 minutes
Success Criteria:
  - Auto-scaling triggers
  - Queue management works
  - No cascade failures
```

### 4. Soak Testing

```yaml
Purpose: Identify memory leaks and degradation
Target: 500 constant users
Duration: 24 hours
Success Criteria:
  - No memory leaks
  - Consistent response times
  - No increasing error rates
```

### 5. Volume Testing

```yaml
Purpose: Large data processing capability
Target: 1M activity records
Duration: 2 hours
Success Criteria:
  - Bulk import: 5,000 records/minute
  - Calculation: 1,000 records/minute
  - Export: 100MB in <30 seconds
```

---

## K6 Test Implementation

### Base Configuration

```javascript
// k6/config/base.js
export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up
    { duration: '5m', target: 100 },  // Stay at 100
    { duration: '2m', target: 500 },  // Scale up
    { duration: '10m', target: 500 }, // Stay at 500
    { duration: '2m', target: 1000 }, // Peak load
    { duration: '10m', target: 1000 }, // Sustain peak
    { duration: '5m', target: 0 },    // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<200', 'p(99)<500'],
    'http_req_failed': ['rate<0.1'],
    'http_reqs': ['rate>100'],
  },
  ext: {
    loadimpact: {
      projectID: 3478723,
      name: 'Clenergize Performance Test'
    }
  }
};
```

### Service-Specific Tests

```javascript
// k6/tests/identity-service.test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export function setup() {
  // Setup test data
  return {
    users: createTestUsers(1000),
    tokens: []
  };
}

export default function(data) {
  // Test 1: User Registration
  let registerRes = http.post(
    'https://api.clenergize.com/api/v1/auth/register',
    JSON.stringify({
      email: `perf-${__VU}-${__ITER}@test.com`,
      password: 'Test123!@#',
      firstName: 'Test',
      lastName: 'User'
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'UserRegistration' }
    }
  );

  check(registerRes, {
    'registration successful': (r) => r.status === 201,
    'response time OK': (r) => r.timings.duration < 200,
  });

  errorRate.add(registerRes.status !== 201);

  // Test 2: User Login
  let loginRes = http.post(
    'https://api.clenergize.com/api/v1/auth/login',
    JSON.stringify({
      email: data.users[__VU % data.users.length].email,
      password: 'Test123!@#'
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'UserLogin' }
    }
  );

  check(loginRes, {
    'login successful': (r) => r.status === 200,
    'token received': (r) => JSON.parse(r.body).accessToken !== undefined,
  });

  if (loginRes.status === 200) {
    const token = JSON.parse(loginRes.body).accessToken;

    // Test 3: Get User Profile
    let profileRes = http.get(
      'https://api.clenergize.com/api/v1/users/me',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        tags: { name: 'GetProfile' }
      }
    );

    check(profileRes, {
      'profile retrieved': (r) => r.status === 200,
      'profile has email': (r) => JSON.parse(r.body).email !== undefined,
    });
  }

  sleep(1);
}

export function teardown(data) {
  // Cleanup test data
  cleanupTestUsers(data.users);
}
```

### Calculation Service Load Test

```javascript
// k6/tests/calculation-service.test.js
import http from 'k6/http';
import { check } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

const calculationDuration = new Trend('calculation_duration');
const calculationErrors = new Rate('calculation_errors');
const calculationsCompleted = new Counter('calculations_completed');

export const options = {
  scenarios: {
    constant_load: {
      executor: 'constant-arrival-rate',
      rate: 100, // 100 calculations per second
      timeUnit: '1s',
      duration: '10m',
      preAllocatedVUs: 200,
      maxVUs: 500,
    },
  },
  thresholds: {
    'calculation_duration': ['p(95)<5000'], // 5 seconds
    'calculation_errors': ['rate<0.01'],
  },
};

export default function() {
  const payload = {
    activityIds: generateActivityIds(100),
    calculationType: 'full',
    aggregationLevel: 'company',
    reportingYear: 2024
  };

  const startTime = Date.now();

  const response = http.post(
    'https://api.clenergize.com/api/v1/calculations/request',
    JSON.stringify(payload),
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${__ENV.API_TOKEN}`,
      },
      timeout: '30s',
    }
  );

  const duration = Date.now() - startTime;
  calculationDuration.add(duration);

  const success = check(response, {
    'calculation initiated': (r) => r.status === 202,
    'job ID received': (r) => JSON.parse(r.body).jobId !== undefined,
  });

  if (!success) {
    calculationErrors.add(1);
  } else {
    calculationsCompleted.add(1);

    // Poll for result
    const jobId = JSON.parse(response.body).jobId;
    pollCalculationResult(jobId);
  }
}

function pollCalculationResult(jobId) {
  let attempts = 0;
  const maxAttempts = 30;

  while (attempts < maxAttempts) {
    const result = http.get(
      `https://api.clenergize.com/api/v1/calculations/${jobId}/status`,
      {
        headers: {
          'Authorization': `Bearer ${__ENV.API_TOKEN}`,
        },
      }
    );

    if (result.status === 200) {
      const status = JSON.parse(result.body).status;
      if (status === 'completed' || status === 'failed') {
        break;
      }
    }

    sleep(1);
    attempts++;
  }
}
```

---

## Artillery Configuration

### API Endpoint Testing

```yaml
# artillery/config.yml
config:
  target: "https://api.clenergize.com"
  phases:
    - duration: 120
      arrivalRate: 10
      rampTo: 100
    - duration: 300
      arrivalRate: 100
    - duration: 120
      arrivalRate: 100
      rampTo: 10
  processor: "./processors.js"
  payload:
    path: "./test-data.csv"
    fields:
      - "email"
      - "companyId"
      - "activityData"

scenarios:
  - name: "Complete User Journey"
    weight: 60
    flow:
      - post:
          url: "/api/v1/auth/login"
          json:
            email: "{{ email }}"
            password: "Test123!@#"
          capture:
            - json: "$.accessToken"
              as: "token"

      - get:
          url: "/api/v1/companies/{{ companyId }}"
          headers:
            Authorization: "Bearer {{ token }}"

      - post:
          url: "/api/v1/activities"
          headers:
            Authorization: "Bearer {{ token }}"
          json: "{{ activityData }}"

      - think: 5

  - name: "Heavy Calculation"
    weight: 40
    flow:
      - post:
          url: "/api/v1/calculations/request"
          headers:
            Authorization: "Bearer {{ token }}"
          json:
            scope: "all"
            year: 2024
          expect:
            - statusCode: 202
```

---

## Performance Monitoring Stack

### Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'microservices'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']

  - job_name: 'mongodb'
    static_configs:
      - targets: ['mongodb-exporter:9216']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
```

### Grafana Dashboards

```json
{
  "dashboard": {
    "title": "Clenergize Performance Metrics",
    "panels": [
      {
        "id": 1,
        "title": "Request Rate",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total[5m])) by (service)",
            "legendFormat": "{{service}}"
          }
        ]
      },
      {
        "id": 2,
        "title": "Response Time (p95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (service, le))",
            "legendFormat": "{{service}}"
          }
        ]
      },
      {
        "id": 3,
        "title": "Error Rate",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total{status=~\"5..\"}[5m])) by (service)",
            "legendFormat": "{{service}}"
          }
        ]
      },
      {
        "id": 4,
        "title": "CPU Usage",
        "targets": [
          {
            "expr": "avg(rate(container_cpu_usage_seconds_total[5m])) by (pod)",
            "legendFormat": "{{pod}}"
          }
        ]
      },
      {
        "id": 5,
        "title": "Memory Usage",
        "targets": [
          {
            "expr": "sum(container_memory_usage_bytes) by (pod)",
            "legendFormat": "{{pod}}"
          }
        ]
      },
      {
        "id": 6,
        "title": "Database Query Time",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, sum(rate(mongodb_operation_duration_seconds_bucket[5m])) by (operation, le))",
            "legendFormat": "{{operation}}"
          }
        ]
      }
    ]
  }
}
```

---

## Auto-Scaling Configuration

### Kubernetes HPA

```yaml
# hpa.yml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: calculation-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: calculation-service
  minReplicas: 2
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
    - type: Pods
      pods:
        metric:
          name: http_requests_per_second
        target:
          type: AverageValue
          averageValue: "100"
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 30
      policies:
        - type: Percent
          value: 100
          periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 50
          periodSeconds: 60
```

---

## Query Optimization Patterns

### MongoDB Performance

```typescript
// Optimized Aggregation Pipeline
class OptimizedCalculationService {
  async calculateEmissions(filters: CalculationFilters): Promise<EmissionResult> {
    const pipeline = [
      // Stage 1: Match (use indexes)
      {
        $match: {
          organizationId: filters.organizationId,
          year: filters.year,
          deletedAt: null,
          ...this.buildIndexedQuery(filters)
        }
      },

      // Stage 2: Lookup with pipeline (minimize data transfer)
      {
        $lookup: {
          from: 'emission_factors',
          let: { parameterId: '$parameterId', year: '$year' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', '$$parameterId'] },
                    { $lte: ['$validFrom', '$$year'] },
                    { $gte: ['$validTo', '$$year'] }
                  ]
                }
              }
            },
            { $project: { factor: 1, unit: 1 } } // Only needed fields
          ],
          as: 'emissionFactor'
        }
      },

      // Stage 3: Unwind efficiently
      {
        $unwind: {
          path: '$emissionFactor',
          preserveNullAndEmptyArrays: false // Skip if no factor
        }
      },

      // Stage 4: Calculate in database (avoid data transfer)
      {
        $addFields: {
          emissions: {
            $multiply: ['$quantity', '$emissionFactor.factor']
          }
        }
      },

      // Stage 5: Group efficiently
      {
        $group: {
          _id: {
            scope: '$scope',
            category: '$category'
          },
          totalEmissions: { $sum: '$emissions' },
          recordCount: { $sum: 1 }
        }
      },

      // Stage 6: Sort and limit early
      {
        $sort: { totalEmissions: -1 }
      },
      {
        $limit: 1000 // Prevent massive result sets
      }
    ];

    // Use read preference for scaling
    const result = await this.activityCollection
      .aggregate(pipeline)
      .readPreference('secondaryPreferred')
      .allowDiskUse(true) // For large aggregations
      .maxTimeMS(30000) // 30 second timeout
      .toArray();

    return this.formatResult(result);
  }

  // Create optimal indexes
  async createIndexes(): Promise<void> {
    await this.activityCollection.createIndexes([
      {
        key: { organizationId: 1, year: 1, deletedAt: 1 },
        background: true
      },
      {
        key: { parameterId: 1, year: 1 },
        background: true
      },
      {
        key: { scope: 1, category: 1, year: 1 },
        background: true
      }
    ]);
  }
}
```

### Redis Caching Strategy

```typescript
// Multi-layer caching
class CacheManager {
  private redis: RedisClient;
  private memoryCache: NodeCache;

  async get<T>(key: string): Promise<T | null> {
    // L1: Memory cache (fastest)
    const memoryResult = this.memoryCache.get<T>(key);
    if (memoryResult) {
      this.metrics.recordCacheHit('memory');
      return memoryResult;
    }

    // L2: Redis cache
    const redisResult = await this.redis.get(key);
    if (redisResult) {
      this.metrics.recordCacheHit('redis');
      const parsed = JSON.parse(redisResult);
      this.memoryCache.set(key, parsed, 60); // 1 minute in memory
      return parsed;
    }

    this.metrics.recordCacheMiss();
    return null;
  }

  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    // Write to both layers
    this.memoryCache.set(key, value, Math.min(ttl, 300)); // Max 5 min in memory
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  // Warming strategy for hot data
  async warmCache(): Promise<void> {
    const hotKeys = await this.getHotKeys();

    for (const key of hotKeys) {
      const data = await this.computeExpensiveOperation(key);
      await this.set(key, data, 3600); // 1 hour
    }
  }
}
```

---

## CI/CD Performance Gates

### GitHub Actions Integration

```yaml
# .github/workflows/performance.yml
name: Performance Tests

on:
  pull_request:
    branches: [main, develop]
  schedule:
    - cron: '0 2 * * *' # Daily at 2 AM

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup K6
        run: |
          sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6

      - name: Run Performance Tests
        run: |
          k6 run \
            -e API_URL=${{ secrets.STAGING_API_URL }} \
            -e API_TOKEN=${{ secrets.PERF_TEST_TOKEN }} \
            --out cloud \
            k6/tests/smoke.test.js

      - name: Check Performance Gates
        run: |
          # Parse results and check against thresholds
          node scripts/check-performance-gates.js

      - name: Comment PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const results = require('./performance-results.json');
            const comment = `
            ## 📊 Performance Test Results

            | Metric | Value | Threshold | Status |
            |--------|-------|-----------|--------|
            | P95 Response Time | ${results.p95}ms | <200ms | ${results.p95 < 200 ? '✅' : '❌'} |
            | P99 Response Time | ${results.p99}ms | <500ms | ${results.p99 < 500 ? '✅' : '❌'} |
            | Error Rate | ${results.errorRate}% | <0.1% | ${results.errorRate < 0.1 ? '✅' : '❌'} |
            | Throughput | ${results.rps} req/s | >100 req/s | ${results.rps > 100 ? '✅' : '❌'} |

            [View full report](${results.reportUrl})
            `;

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

---

## Performance Baselines

### Service-Level Baselines

```yaml
Identity Service:
  login:
    p50: 50ms
    p95: 150ms
    p99: 300ms
  token_verification:
    p50: 10ms
    p95: 30ms
    p99: 50ms

Organization Service:
  hierarchy_fetch:
    p50: 100ms
    p95: 200ms
    p99: 400ms

Activity Service:
  data_validation:
    p50: 20ms
    p95: 50ms
    p99: 100ms
  bulk_import:
    rate: 5000 records/min

Calculation Service:
  single_calculation:
    p50: 2s
    p95: 5s
    p99: 10s
  aggregation:
    p50: 5s
    p95: 10s
    p99: 20s

Reporting Service:
  dashboard_load:
    p50: 1s
    p95: 2s
    p99: 3s
  pdf_generation:
    p50: 15s
    p95: 30s
    p99: 45s
```

---

## Troubleshooting Guide

### Common Performance Issues

```yaml
High Response Times:
  Symptoms:
    - P95 > 200ms consistently
    - Increasing latency trend

  Diagnosis:
    - Check database query performance
    - Review distributed tracing
    - Analyze cache hit rates
    - Check network latency

  Solutions:
    - Add database indexes
    - Implement query result caching
    - Optimize aggregation pipelines
    - Scale read replicas

Memory Leaks:
  Symptoms:
    - Gradual memory increase
    - OOM kills after hours/days

  Diagnosis:
    - Heap dump analysis
    - Memory profiling
    - Check event listener cleanup

  Solutions:
    - Fix circular references
    - Implement proper cleanup
    - Set memory limits
    - Use weak references

CPU Spikes:
  Symptoms:
    - CPU > 90% sustained
    - Request timeouts

  Diagnosis:
    - CPU profiling
    - Check calculation complexity
    - Review synchronous operations

  Solutions:
    - Optimize algorithms
    - Implement worker threads
    - Add CPU-based auto-scaling
```

---

## Success Metrics

```yaml
Performance SLAs:
  ✅ API Response: p95 < 200ms
  ✅ Calculation Time: p95 < 5s
  ✅ Report Generation: p95 < 30s
  ✅ Dashboard Load: p95 < 2s
  ✅ Error Rate: < 0.1%
  ✅ Availability: 99.99%
  ✅ Concurrent Users: 10,000+
  ✅ Throughput: 1,000+ req/s
```

---

**Document Status**: COMPLETE
**Next Review**: Monthly performance review
**Owner**: Testing Agent