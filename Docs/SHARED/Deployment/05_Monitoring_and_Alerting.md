# Monitoring & Alerting Specification

**Version**: 1.0.0
**Last Updated**: November 18, 2025
**Status**: ACTIVE
**Sprint**: 0.3-0.4
**Priority**: HIGH

---

## Executive Summary

This document defines the comprehensive monitoring, observability, and alerting strategy for all Clenergize V3 microservices. The system provides **real-time visibility**, **proactive alerting**, and **rapid incident response** through a modern observability stack.

### Key Capabilities

| Capability | Tool | Purpose |
|------------|------|---------|
| **Metrics Collection** | Prometheus | Time-series metrics |
| **Visualization** | Grafana | Dashboards & analytics |
| **Log Aggregation** | CloudWatch Logs → Elasticsearch | Centralized logging |
| **Error Tracking** | Sentry | Exception monitoring |
| **Alerting** | PagerDuty | Incident management |
| **APM Tracing** | AWS X-Ray | Distributed tracing |
| **Uptime Monitoring** | UptimeRobot | External health checks |

---

## Table of Contents

1. [Monitoring Stack Architecture](#monitoring-stack-architecture)
2. [Metrics Collection](#metrics-collection)
3. [Critical Alerts (P1)](#critical-alerts-p1)
4. [Warning Alerts (P2)](#warning-alerts-p2)
5. [Grafana Dashboards](#grafana-dashboards)
6. [Logging Strategy](#logging-strategy)
7. [Error Tracking](#error-tracking)
8. [On-Call Rotation](#on-call-rotation)
9. [Runbooks](#runbooks)

---

## Monitoring Stack Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER REQUESTS                            │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────────┐
│                   API GATEWAY                                │
│  - Request/Response Logging                                 │
│  - Correlation ID Injection                                 │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────────┐
│               MICROSERVICES (7 services)                     │
│  Each service exports:                                       │
│  - Prometheus metrics (/metrics endpoint)                    │
│  - Structured JSON logs (CloudWatch Logs)                    │
│  - Error events (Sentry)                                     │
│  - Traces (AWS X-Ray)                                        │
└─────┬────────┬────────┬────────┬───────────────────────────┘
      │        │        │        │
      ↓        ↓        ↓        ↓
┌──────────┐ ┌──────┐ ┌──────┐ ┌──────────┐
│Prometheus│ │Cloud │ │Sentry│ │AWS X-Ray │
│          │ │Watch │ │      │ │          │
└────┬─────┘ └───┬──┘ └──┬───┘ └────┬─────┘
     │           │       │          │
     ↓           ↓       ↓          ↓
┌────────────────────────────────────────┐
│         OBSERVABILITY PLATFORM         │
│  - Grafana (Dashboards)                │
│  - Elasticsearch (Log search)          │
│  - PagerDuty (Alerting)                │
│  - Slack (Notifications)               │
└────────────────────────────────────────┘
```

---

## Metrics Collection

### Prometheus Exporters

Each microservice exposes a `/metrics` endpoint in Prometheus format:

```typescript
// src/infrastructure/monitoring/metrics-exporter.ts
import { Registry, Counter, Histogram, Gauge } from 'prom-client';

export class MetricsExporter {
  private readonly registry: Registry;

  // HTTP metrics
  private readonly httpRequestDuration: Histogram;
  private readonly httpRequestsTotal: Counter;
  private readonly httpRequestsInFlight: Gauge;

  // Database metrics
  private readonly dbQueryDuration: Histogram;
  private readonly dbConnectionPoolSize: Gauge;

  // Cache metrics
  private readonly cacheHitRate: Gauge;
  private readonly cacheOperationDuration: Histogram;

  // Business metrics
  private readonly businessOperationsTotal: Counter;

  constructor(serviceName: string) {
    this.registry = new Registry();

    // HTTP Request Duration (seconds)
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['service', 'method', 'endpoint', 'status'],
      buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1.0, 2.0, 5.0],
      registers: [this.registry]
    });

    // HTTP Requests Total
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['service', 'method', 'endpoint', 'status'],
      registers: [this.registry]
    });

    // HTTP Requests In Flight
    this.httpRequestsInFlight = new Gauge({
      name: 'http_requests_in_flight',
      help: 'Number of HTTP requests currently being processed',
      labelNames: ['service'],
      registers: [this.registry]
    });

    // Database Query Duration
    this.dbQueryDuration = new Histogram({
      name: 'db_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['service', 'operation', 'collection'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1.0],
      registers: [this.registry]
    });

    // Database Connection Pool
    this.dbConnectionPoolSize = new Gauge({
      name: 'db_connection_pool_size',
      help: 'Current size of database connection pool',
      labelNames: ['service', 'state'], // active, idle
      registers: [this.registry]
    });

    // Cache Hit Rate
    this.cacheHitRate = new Gauge({
      name: 'cache_hit_rate',
      help: 'Cache hit rate (0-1)',
      labelNames: ['service', 'cache_name'],
      registers: [this.registry]
    });

    // Business Metrics
    this.businessOperationsTotal = new Counter({
      name: 'business_operations_total',
      help: 'Total number of business operations',
      labelNames: ['service', 'operation', 'status'],
      registers: [this.registry]
    });
  }

  // Record HTTP request
  recordHttpRequest(
    method: string,
    endpoint: string,
    status: number,
    duration: number
  ): void {
    this.httpRequestDuration
      .labels(process.env.SERVICE_NAME!, method, endpoint, status.toString())
      .observe(duration);

    this.httpRequestsTotal
      .labels(process.env.SERVICE_NAME!, method, endpoint, status.toString())
      .inc();
  }

  // Record database query
  recordDbQuery(operation: string, collection: string, duration: number): void {
    this.dbQueryDuration
      .labels(process.env.SERVICE_NAME!, operation, collection)
      .observe(duration);
  }

  // Update connection pool stats
  updateConnectionPool(active: number, idle: number): void {
    this.dbConnectionPoolSize
      .labels(process.env.SERVICE_NAME!, 'active')
      .set(active);

    this.dbConnectionPoolSize
      .labels(process.env.SERVICE_NAME!, 'idle')
      .set(idle);
  }

  // Expose metrics endpoint
  getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}
```

### Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'clenergize-production'
    environment: 'production'

scrape_configs:
  - job_name: 'identity-service'
    static_configs:
      - targets: ['identity-service:3001']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'organization-service'
    static_configs:
      - targets: ['organization-service:3002']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'reference-service'
    static_configs:
      - targets: ['reference-service:3003']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'activity-service'
    static_configs:
      - targets: ['activity-service:3004']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'calculation-service'
    static_configs:
      - targets: ['calculation-service:3005']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'reporting-service'
    static_configs:
      - targets: ['reporting-service:3006']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'audit-service'
    static_configs:
      - targets: ['audit-service:3007']
    metrics_path: '/metrics'
    scrape_interval: 10s

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

rule_files:
  - '/etc/prometheus/alerts/*.yml'
```

---

## Critical Alerts (P1)

### P1 Alert Rules

```yaml
# alerts/critical.yml
groups:
  - name: critical_alerts
    interval: 30s
    rules:
      # Service Down
      - alert: ServiceDown
        expr: up{job=~".*-service"} == 0
        for: 2m
        labels:
          severity: critical
          priority: P1
        annotations:
          summary: "Service {{ $labels.job }} is down"
          description: "{{ $labels.job }} has been unavailable for more than 2 minutes."
          runbook: "https://docs.clenergize.com/runbooks/service-down"
          action: "Page on-call engineer immediately"

      # High Error Rate
      - alert: HighErrorRate
        expr: |
          (
            sum(rate(http_requests_total{status=~"5.."}[5m])) by (service)
            /
            sum(rate(http_requests_total[5m])) by (service)
          ) > 0.05
        for: 5m
        labels:
          severity: critical
          priority: P1
        annotations:
          summary: "High error rate on {{ $labels.service }}"
          description: "Error rate is {{ $value | humanizePercentage }} (threshold: 5%)"
          runbook: "https://docs.clenergize.com/runbooks/high-error-rate"

      # Database Connection Pool Exhausted
      - alert: DatabaseConnectionPoolExhausted
        expr: |
          db_connection_pool_size{state="active"}
          /
          (db_connection_pool_size{state="active"} + db_connection_pool_size{state="idle"})
          > 0.95
        for: 2m
        labels:
          severity: critical
          priority: P1
        annotations:
          summary: "Database connection pool exhausted on {{ $labels.service }}"
          description: "{{ $value | humanizePercentage }} of connection pool in use"
          action: "Auto-restart service + page engineer"

      # Critical Latency
      - alert: CriticalLatency
        expr: |
          histogram_quantile(0.95,
            sum(rate(http_request_duration_seconds_bucket[5m])) by (service, le)
          ) > 2.0
        for: 5m
        labels:
          severity: critical
          priority: P1
        annotations:
          summary: "Critical latency on {{ $labels.service }}"
          description: "P95 latency is {{ $value }}s (threshold: 2s)"
          runbook: "https://docs.clenergize.com/runbooks/high-latency"

      # Security: Brute Force Attack
      - alert: BruteForceAttackDetected
        expr: |
          sum(rate(http_requests_total{endpoint="/auth/login", status="401"}[1m])) by (source_ip)
          > 10
        for: 1m
        labels:
          severity: critical
          priority: P1
          category: security
        annotations:
          summary: "Brute force attack detected from {{ $labels.source_ip }}"
          description: "{{ $value }} failed login attempts per minute"
          action: "Rate limit IP + page security team"

      # Memory Usage Critical
      - alert: MemoryUsageCritical
        expr: |
          (
            container_memory_usage_bytes
            /
            container_spec_memory_limit_bytes
          ) > 0.9
        for: 5m
        labels:
          severity: critical
          priority: P1
        annotations:
          summary: "Memory usage critical on {{ $labels.pod }}"
          description: "Memory usage is {{ $value | humanizePercentage }}"
          action: "Scale up immediately"

      # Disk Space Critical
      - alert: DiskSpaceCritical
        expr: |
          (
            node_filesystem_avail_bytes{mountpoint="/"}
            /
            node_filesystem_size_bytes{mountpoint="/"}
          ) < 0.1
        for: 5m
        labels:
          severity: critical
          priority: P1
        annotations:
          summary: "Disk space critical on {{ $labels.instance }}"
          description: "Only {{ $value | humanizePercentage }} disk space remaining"
          action: "Clean up logs + expand volume"
```

### P1 Alert Routing

```yaml
# alertmanager.yml
global:
  resolve_timeout: 5m
  pagerduty_url: 'https://events.pagerduty.com/v2/enqueue'

route:
  receiver: 'default'
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 12h

  routes:
    # Critical alerts -> PagerDuty
    - match:
        severity: critical
      receiver: 'pagerduty-critical'
      continue: true

    # Critical alerts -> Slack
    - match:
        severity: critical
      receiver: 'slack-critical'

    # Security alerts -> Security team
    - match:
        category: security
      receiver: 'security-team'

receivers:
  - name: 'default'
    slack_configs:
      - channel: '#clenergize-alerts'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'

  - name: 'pagerduty-critical'
    pagerduty_configs:
      - service_key: '{{ env "PAGERDUTY_SERVICE_KEY" }}'
        severity: 'critical'
        description: '{{ .CommonAnnotations.summary }}'
        details:
          firing: '{{ template "pagerduty.default.description" . }}'
        url: '{{ template "pagerduty.default.url" . }}'

  - name: 'slack-critical'
    slack_configs:
      - channel: '#clenergize-incidents'
        username: 'AlertManager'
        icon_emoji: ':rotating_light:'
        title: 'CRITICAL ALERT'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
        send_resolved: true

  - name: 'security-team'
    pagerduty_configs:
      - service_key: '{{ env "PAGERDUTY_SECURITY_KEY" }}'
        severity: 'critical'
    slack_configs:
      - channel: '#security-alerts'
        username: 'SecurityBot'
```

---

## Warning Alerts (P2)

### P2 Alert Rules

```yaml
# alerts/warnings.yml
groups:
  - name: warning_alerts
    interval: 1m
    rules:
      # High Latency (Warning)
      - alert: HighLatency
        expr: |
          histogram_quantile(0.95,
            sum(rate(http_request_duration_seconds_bucket[5m])) by (service, le)
          ) > 0.5
        for: 10m
        labels:
          severity: warning
          priority: P2
        annotations:
          summary: "High latency on {{ $labels.service }}"
          description: "P95 latency is {{ $value }}s (threshold: 500ms)"

      # Queue Lag
      - alert: QueueLag
        expr: sqs_messages_visible > 1000
        for: 5m
        labels:
          severity: warning
          priority: P2
        annotations:
          summary: "High queue lag on {{ $labels.queue_name }}"
          description: "{{ $value }} messages in queue"
          action: "Scale up consumers"

      # Cache Hit Rate Low
      - alert: LowCacheHitRate
        expr: cache_hit_rate < 0.7
        for: 15m
        labels:
          severity: warning
          priority: P2
        annotations:
          summary: "Low cache hit rate on {{ $labels.service }}"
          description: "Cache hit rate is {{ $value | humanizePercentage }} (threshold: 70%)"

      # Slow Database Queries
      - alert: SlowDatabaseQueries
        expr: |
          histogram_quantile(0.95,
            sum(rate(db_query_duration_seconds_bucket[5m])) by (service, operation, le)
          ) > 0.1
        for: 10m
        labels:
          severity: warning
          priority: P2
        annotations:
          summary: "Slow database queries on {{ $labels.service }}"
          description: "P95 query time is {{ $value }}s for {{ $labels.operation }}"

      # Certificate Expiring Soon
      - alert: CertificateExpiringSoon
        expr: (ssl_certificate_expiry_seconds < 604800) # 7 days
        labels:
          severity: warning
          priority: P2
        annotations:
          summary: "SSL certificate expiring soon"
          description: "Certificate for {{ $labels.domain }} expires in {{ $value | humanizeDuration }}"

      # High CPU Usage
      - alert: HighCPUUsage
        expr: |
          (
            rate(container_cpu_usage_seconds_total[5m])
            /
            container_spec_cpu_quota
          ) > 0.8
        for: 15m
        labels:
          severity: warning
          priority: P2
        annotations:
          summary: "High CPU usage on {{ $labels.pod }}"
          description: "CPU usage is {{ $value | humanizePercentage }}"
```

---

## Grafana Dashboards

### Dashboard 1: Service Overview

```yaml
Dashboard Name: "Clenergize - Service Overview"
Refresh: 30s
Time Range: Last 1 hour

Panels:

1. Request Rate (Graph)
   Query: sum(rate(http_requests_total[1m])) by (service)
   Type: Time series
   Unit: req/s
   Legend: {{ service }}

2. Error Rate (Graph)
   Query: |
     sum(rate(http_requests_total{status=~"5.."}[1m])) by (service)
     /
     sum(rate(http_requests_total[1m])) by (service)
   Type: Time series
   Unit: percent
   Threshold: 1% (yellow), 5% (red)

3. Latency Percentiles (Graph)
   Queries:
     - P50: histogram_quantile(0.50, sum(rate(http_request_duration_seconds_bucket[5m])) by (service, le))
     - P95: histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (service, le))
     - P99: histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (service, le))
   Type: Time series
   Unit: seconds

4. Active Connections (Gauge)
   Query: http_requests_in_flight
   Type: Gauge
   Thresholds: 0-1000 (green), 1000-5000 (yellow), 5000+ (red)

5. Service Health (Stat)
   Query: up{job=~".*-service"}
   Type: Stat
   Mapping: 1 = UP (green), 0 = DOWN (red)

6. Throughput by Endpoint (Bar Chart)
   Query: topk(10, sum(rate(http_requests_total[5m])) by (endpoint))
   Type: Bar chart
   Unit: req/s
```

### Dashboard 2: SLO Compliance

```yaml
Dashboard Name: "Clenergize - SLO Compliance"
Refresh: 1m
Time Range: Last 30 days

Panels:

1. Availability (30-day) (Gauge)
   Query: |
     (
       sum(rate(http_requests_total{status!~"5.."}[30d]))
       /
       sum(rate(http_requests_total[30d]))
     ) * 100
   Type: Gauge
   Unit: percent
   Thresholds: < 99.9% (red), 99.9-99.99% (yellow), > 99.99% (green)
   Target: 99.9%

2. Error Budget Remaining (Bar Gauge)
   Query: |
     (
       1 - (
         sum(rate(http_requests_total{status=~"5.."}[30d]))
         /
         sum(rate(http_requests_total[30d]))
       ) / 0.001
     ) * 100
   Type: Bar gauge
   Unit: percent
   Description: "% of error budget remaining (99.9% SLO)"

3. Latency SLO Compliance (Time Series)
   Query: |
     (
       histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[1h])) by (le))
       < 0.2
     )
   Type: Binary (1 = compliant, 0 = non-compliant)
   Target: P95 < 200ms

4. Error Rate SLO Compliance (Time Series)
   Query: |
     (
       sum(rate(http_requests_total{status=~"5.."}[1h]))
       /
       sum(rate(http_requests_total[1h]))
       < 0.01
     )
   Type: Binary
   Target: < 1% error rate

5. Incidents This Month (Stat)
   Query: count(ALERTS{severity="critical"}) by (alertname)
   Type: Table
```

### Dashboard 3: Database Performance

```yaml
Dashboard Name: "Clenergize - Database Performance"

Panels:

1. Query Latency by Operation (Heatmap)
   Query: |
     sum(rate(db_query_duration_seconds_bucket[5m])) by (operation, le)
   Type: Heatmap
   Color scheme: Yellow-Orange-Red

2. Connection Pool Utilization (Graph)
   Queries:
     - Active: db_connection_pool_size{state="active"}
     - Idle: db_connection_pool_size{state="idle"}
   Type: Stacked area
   Unit: connections

3. Slow Queries (Table)
   Query: |
     topk(20,
       histogram_quantile(0.95, sum(rate(db_query_duration_seconds_bucket[5m])) by (service, operation, collection, le))
     ) > 0.1
   Type: Table
   Columns: Service, Operation, Collection, P95 Latency

4. Index Usage (Pie Chart)
   Query: mongodb_index_usage_count by (index_name)
   Type: Pie chart

5. Collection Scans (Graph)
   Query: rate(mongodb_collection_scans_total[5m]) by (collection)
   Type: Time series
   Alert: Collection scans should be < 5% of queries
```

### Dashboard 4: Security

```yaml
Dashboard Name: "Clenergize - Security Monitoring"

Panels:

1. Authentication Attempts (Graph)
   Queries:
     - Successful: sum(rate(http_requests_total{endpoint="/auth/login", status="200"}[5m]))
     - Failed: sum(rate(http_requests_total{endpoint="/auth/login", status="401"}[5m]))
   Type: Time series

2. Failed Login Attempts by IP (Table)
   Query: |
     topk(10,
       sum(rate(http_requests_total{endpoint="/auth/login", status="401"}[1h])) by (source_ip)
     )
   Type: Table
   Threshold: > 10/hour = suspicious

3. JWT Verification Failures (Stat)
   Query: sum(rate(jwt_verification_failures_total[5m]))
   Type: Stat
   Alert: > 10/min

4. API Rate Limit Hits (Graph)
   Query: sum(rate(rate_limit_exceeded_total[5m])) by (endpoint)
   Type: Time series

5. Unusual Access Patterns (Logs)
   Query: CloudWatch Logs Insights
   Pattern: Requests from unusual geolocations or at unusual times

6. Security Events (Table)
   Query: audit_security_events_total by (event_type, severity)
   Type: Table
   Filter: severity IN ('HIGH', 'CRITICAL')
```

---

## Logging Strategy

### Structured JSON Logs

```typescript
// Example structured log
{
  "level": "info",
  "message": "User created successfully",
  "service": "identity-service",
  "version": "1.0.0",
  "timestamp": "2025-11-18T14:30:00.000Z",
  "correlationId": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "user-123",
  "context": {
    "email": "user@example.com",
    "roles": ["user"],
    "duration": 125
  }
}
```

### Log Levels

```yaml
DEBUG:
  - Detailed debugging information
  - Only in development environment
  - Example: "Database query: SELECT * FROM users WHERE id = ?"

INFO:
  - General informational messages
  - Business events
  - Example: "User logged in successfully"

WARN:
  - Warning messages
  - Recoverable errors
  - Example: "Cache miss, fetching from database"

ERROR:
  - Error messages
  - Exceptions with stack traces
  - Example: "Failed to connect to database"
```

### Log Retention

```yaml
Development:
  retention: 7 days
  storage: CloudWatch Logs

Staging:
  retention: 30 days
  storage: CloudWatch Logs

Production:
  hot_storage: 30 days (CloudWatch Logs)
  cold_storage: 1 year (S3 Glacier)
  archive: 7 years (compliance requirement)
```

### Log Aggregation

```
Service Logs → CloudWatch Logs → Lambda (Filter) → Elasticsearch → Kibana
                     ↓
                   S3 Archive
```

---

## Error Tracking

### Sentry Configuration

```typescript
// src/infrastructure/error-tracking/sentry-config.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.SERVICE_VERSION,
  tracesSampleRate: 0.1, // Sample 10% of transactions

  beforeSend(event, hint) {
    // Scrub sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.Authorization;
    }

    // Filter out noise
    if (hint.originalException instanceof ValidationError) {
      // Don't send validation errors to Sentry
      return null;
    }

    return event;
  },

  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app }),
    new Sentry.Integrations.Mongo({
      useMongoose: false
    })
  ]
});
```

---

## On-Call Rotation

### Rotation Schedule

```yaml
Primary On-Call:
  rotation: weekly
  handoff: Monday 9 AM UTC
  escalation_time: 5 minutes

Secondary On-Call:
  rotation: weekly
  handoff: Monday 9 AM UTC
  escalation_time: 10 minutes

Manager On-Call:
  rotation: monthly
  escalation_time: 20 minutes

Current Rotation:
  Week of 2025-11-18:
    primary: Alice (Backend Lead)
    secondary: Bob (DevOps Engineer)
    manager: Charlie (Engineering Manager)
```

### Escalation Policy

```
Incident Triggered
  ↓
Page Primary On-Call
  ↓
5 minutes - No Response
  ↓
Page Secondary On-Call
  ↓
10 minutes - No Response
  ↓
Page Manager On-Call
  ↓
20 minutes - No Response
  ↓
Page CTO + All Engineers
```

---

## Runbooks

### Runbook Template

```markdown
# Runbook: [Alert Name]

## Severity: [P1/P2/P3]

## Description
Brief description of what this alert means.

## Impact
- User impact: [High/Medium/Low]
- Data integrity: [At Risk / Safe]
- Revenue impact: [Yes/No]

## Immediate Actions
1. Check service health dashboard
2. Review recent deployments
3. Check error logs for stack traces

## Diagnosis Steps
1. Run: `kubectl logs -l app=identity-service --tail=100`
2. Check Grafana dashboard: [link]
3. Query Elasticsearch: [query]

## Resolution Steps
1. If [condition], then [action]
2. Restart service: `kubectl rollout restart deployment/identity-service`
3. Verify fix: [verification steps]

## Follow-Up
- Create Jira ticket for root cause analysis
- Update runbook if new information learned
- Schedule postmortem (if P1)
```

---

**Last Updated**: November 18, 2025
**Next Review**: Sprint 0.5
**Maintained By**: DevOps Agent + Master Coordinator
