# Clenergize V3 Monitoring & Observability

Comprehensive monitoring dashboards and alerting for Clenergize V3 microservices.

## 🎯 Overview

This monitoring solution provides complete observability for all Clenergize V3 services using:

- **Grafana**: Real-time dashboards and visualization
- **Prometheus**: Metrics collection and alerting
- **CloudWatch**: AWS-native monitoring and log aggregation
- **AlertManager**: Alert routing and notification

## 📊 Dashboards

### Grafana Dashboards

| Dashboard | Purpose | Metrics |
|-----------|---------|---------|
| **System Overview** | High-level system health | Service status, request rates, error rates, response times |
| **Identity Service** | Authentication & user management | Login success/failure, token operations, user CRUD |
| **Organization Service** | Project & hierarchy management | Project operations, hierarchy queries |
| **Activity Service** | Activity data ingestion | Data ingestion rate, validation errors, bulk imports |
| **Calculation Service** | Emission calculations | Calculation throughput, aggregation latency, cache performance |
| **Reporting Service** | Report generation | Report queue depth, generation time, export success rate |
| **Audit Service** | Audit logging & compliance | Event ingestion, query performance, integrity checks |

### CloudWatch Dashboards

| Dashboard | Purpose | AWS Services |
|-----------|---------|--------------|
| **System Overview** | Infrastructure health | ECS, ALB, DocumentDB, ElastiCache, SQS |
| **Logs Dashboard** | Centralized logging | CloudWatch Logs from all services |
| **Cost Dashboard** | Resource usage & cost | AWS Cost Explorer integration |

## 🚀 Quick Start

### Local Development (Docker Compose)

```bash
# Start monitoring stack
cd monitoring-dashboards
docker-compose up -d

# Access dashboards
# Grafana: http://localhost:3000 (admin/admin)
# Prometheus: http://localhost:9090
# AlertManager: http://localhost:9093
```

### Production Deployment (AWS)

```bash
# Deploy Prometheus to ECS
aws cloudformation create-stack \
  --stack-name clenergize-prometheus \
  --template-body file://cloudformation/prometheus-stack.yml

# Import CloudWatch dashboards
aws cloudwatch put-dashboard \
  --dashboard-name Clenergize-V3-Overview \
  --dashboard-body file://cloudwatch/clenergize-overview-cloudwatch.json

# Import Grafana dashboards
curl -X POST http://grafana:3000/api/dashboards/import \
  -H "Content-Type: application/json" \
  -d @grafana/clenergize-overview-dashboard.json
```

## 📁 Project Structure

```
monitoring-dashboards/
├── grafana/
│   ├── clenergize-overview-dashboard.json      # System overview
│   ├── identity-service-dashboard.json         # Identity service metrics
│   ├── organization-service-dashboard.json     # Organization service (similar structure)
│   ├── activity-service-dashboard.json         # Activity service (similar structure)
│   ├── calculation-service-dashboard.json      # Calculation service (similar structure)
│   ├── reporting-service-dashboard.json        # Reporting service (similar structure)
│   └── audit-service-dashboard.json            # Audit service (similar structure)
├── cloudwatch/
│   ├── clenergize-overview-cloudwatch.json     # AWS CloudWatch dashboard
│   └── service-specific/                       # Individual service dashboards
├── prometheus/
│   ├── prometheus.yml                          # Prometheus configuration
│   └── alert-rules.yml                         # Alerting rules
├── docker-compose.yml                          # Local monitoring stack
└── README.md                                   # This file
```

## 🔧 Configuration

### Prometheus Metrics

All Clenergize V3 services expose metrics at `/metrics` endpoint using the **prom-client** library.

#### Standard Metrics (Automatically Collected)

```typescript
// HTTP Request Duration
http_request_duration_seconds_bucket{method="GET",route="/api/v1/users",status="200",le="0.1"} 245
http_request_duration_seconds_sum{method="GET",route="/api/v1/users",status="200"} 12.3
http_request_duration_seconds_count{method="GET",route="/api/v1/users",status="200"} 250

// HTTP Request Count
http_requests_total{method="GET",route="/api/v1/users",status="200"} 250

// Process Metrics
process_cpu_seconds_total 123.45
process_resident_memory_bytes 52428800
nodejs_heap_size_used_bytes 31457280
nodejs_eventloop_lag_seconds 0.012
```

#### Custom Business Metrics

Services expose domain-specific metrics:

**Identity Service**:
```typescript
identity_auth_success_total{type="login"} 1234
identity_auth_failure_total{type="login",reason="invalid_password"} 45
identity_token_refresh_total 567
identity_cache_hits_total{cache="user"} 8901
identity_cache_misses_total{cache="user"} 123
```

**Activity Service**:
```typescript
activity_data_ingested_total{scope="1"} 5678
activity_validation_errors_total{error_type="missing_field"} 23
activity_bulk_import_size_bucket{le="100"} 45
```

**Calculation Service**:
```typescript
calculation_emissions_calculated_total{scope="1"} 3456
calculation_aggregation_duration_seconds_sum 234.56
calculation_queue_size 0
```

**Reporting Service**:
```typescript
reporting_jobs_queued_total 123
reporting_jobs_completed_total 120
reporting_jobs_failed_total 3
reporting_generation_duration_seconds_sum{format="PDF"} 456.78
```

### Grafana Dashboard Variables

Dashboards support template variables for filtering:

```javascript
// Service instance selector
instance: label_values(up{job="identity-service"}, instance)

// Time range selector
time_range: ["5m", "15m", "1h", "6h", "24h", "7d"]

// Organization/Project filter
organization_id: label_values(http_requests_total, organization_id)
project_id: label_values(http_requests_total, project_id)
```

## 🚨 Alerting

### Alert Severity Levels

| Severity | Response Time | Notification |
|----------|---------------|--------------|
| **Critical** | Immediate (< 5 min) | PagerDuty + Slack + Email |
| **Warning** | Within 1 hour | Slack + Email |
| **Info** | Next business day | Email only |

### Key Alerts

#### Service Health

- **ServiceDown**: Service has been unavailable for > 1 minute
  - Severity: Critical
  - Action: Check service logs, restart if needed

- **ServiceFlapping**: Service restarted > 3 times in 5 minutes
  - Severity: Warning
  - Action: Investigate crash loops, memory leaks

#### Performance

- **HighResponseTime**: p95 latency > 500ms for 5 minutes
  - Severity: Warning
  - Action: Check database queries, cache hit rate

- **CriticalResponseTime**: p95 latency > 1000ms for 5 minutes
  - Severity: Critical
  - Action: Scale up resources, investigate bottlenecks

#### Reliability

- **HighErrorRate**: Error rate > 1% for 5 minutes
  - Severity: Warning
  - Action: Review recent deployments, check logs

- **CriticalErrorRate**: Error rate > 5% for 2 minutes
  - Severity: Critical
  - Action: Consider rollback, investigate immediately

#### Resources

- **HighCPUUsage**: CPU > 80% for 10 minutes
  - Severity: Warning
  - Action: Scale horizontally, optimize code

- **HighMemoryUsage**: Memory > 85% for 10 minutes
  - Severity: Warning
  - Action: Check for memory leaks, scale up

#### Database

- **MongoDBHighConnectionCount**: > 800 active connections
  - Severity: Warning
  - Action: Review connection pooling, scale database

- **MongoDBSlowQueries**: Average query > 1 second
  - Severity: Warning
  - Action: Add indexes, optimize queries

#### Cache

- **LowCacheHitRate**: Cache hit rate < 90% for 10 minutes
  - Severity: Warning
  - Action: Review cache strategy, increase TTL

### AlertManager Configuration

```yaml
# alertmanager.yml
global:
  resolve_timeout: 5m
  slack_api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'

route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'default'
  routes:
    - match:
        severity: critical
      receiver: 'pagerduty'
      continue: true
    - match:
        severity: critical
      receiver: 'slack-critical'
    - match:
        severity: warning
      receiver: 'slack-warning'

receivers:
  - name: 'default'
    email_configs:
      - to: 'ops@clenergize.com'
        from: 'alertmanager@clenergize.com'
        smarthost: 'smtp.gmail.com:587'

  - name: 'pagerduty'
    pagerduty_configs:
      - service_key: 'YOUR_PAGERDUTY_KEY'

  - name: 'slack-critical'
    slack_configs:
      - channel: '#clenergize-alerts-critical'
        title: 'CRITICAL: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'

  - name: 'slack-warning'
    slack_configs:
      - channel: '#clenergize-alerts'
        title: 'Warning: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
```

## 📈 Dashboard Usage

### System Overview Dashboard

**Purpose**: High-level health check for all services

**Key Panels**:
1. **Service Health Status**: Green = UP, Red = DOWN
2. **Request Rate**: Overall throughput (requests/second)
3. **Error Rate**: Percentage of failed requests
4. **Response Time (p50, p95, p99)**: Latency distribution
5. **CPU & Memory Usage**: Resource utilization
6. **Database Connections**: Active MongoDB connections
7. **Redis Cache Hit Rate**: Cache effectiveness

**When to Use**:
- Daily health checks
- Incident investigation (first dashboard to check)
- Performance trend analysis

---

### Service-Specific Dashboards

**Purpose**: Deep dive into individual service performance

**Key Panels** (Identity Service example):
1. **Service Status**: UP/DOWN indicator
2. **Request Rate**: Requests per second
3. **Error Rate**: Percentage of errors
4. **p95 Response Time**: 95th percentile latency
5. **Requests by Endpoint**: Breakdown by API route
6. **Response Time Percentiles**: p50, p95, p99 trends
7. **HTTP Status Codes**: Distribution (2xx, 4xx, 5xx)
8. **Authentication Events**: Login success/failure rates
9. **Database Query Duration**: MongoDB performance
10. **Redis Cache Performance**: Hit/miss ratio
11. **Memory Usage**: Heap and RSS memory
12. **Event Loop Lag**: Node.js event loop health

**When to Use**:
- Troubleshooting service-specific issues
- Performance optimization
- Capacity planning
- Post-deployment validation

## 🔍 Troubleshooting

### Issue: No Metrics in Grafana

**Symptoms**: Dashboards show "No data"

**Possible Causes**:
- Prometheus not scraping targets
- Services not exposing `/metrics` endpoint
- Network connectivity issues

**Solutions**:
```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Verify service metrics endpoint
curl http://identity-service:3001/metrics

# Check Prometheus logs
docker logs prometheus

# Verify Prometheus scrape config
docker exec prometheus cat /etc/prometheus/prometheus.yml
```

---

### Issue: Alerts Not Firing

**Symptoms**: No alerts despite threshold breaches

**Possible Causes**:
- AlertManager not configured
- Alert rules syntax error
- Notification channels misconfigured

**Solutions**:
```bash
# Check alert rules status
curl http://localhost:9090/api/v1/rules

# Validate alert rules
promtool check rules prometheus/alert-rules.yml

# Check AlertManager status
curl http://localhost:9093/api/v2/status

# View active alerts
curl http://localhost:9090/api/v1/alerts
```

---

### Issue: High Dashboard Load Time

**Symptoms**: Grafana dashboards slow to load

**Possible Causes**:
- Too many metrics queried
- Long time ranges
- High cardinality metrics

**Solutions**:
```bash
# Reduce query time range
# Change from 7d to 1h or 6h

# Limit metric cardinality
# Avoid high-cardinality labels (e.g., correlationId, userId)

# Use recording rules for expensive queries
# Add to prometheus.yml:
groups:
  - name: recording_rules
    interval: 30s
    rules:
      - record: job:http_requests:rate5m
        expr: sum(rate(http_requests_total[5m])) by (job)
```

---

### Issue: CloudWatch Dashboard Not Updating

**Symptoms**: CloudWatch metrics stale

**Possible Causes**:
- Metrics not being published
- CloudWatch agent not running
- IAM permissions missing

**Solutions**:
```bash
# Verify metrics are being published
aws cloudwatch list-metrics --namespace Clenergize/IdentityService

# Check CloudWatch agent status (on EC2)
sudo systemctl status amazon-cloudwatch-agent

# Verify IAM role has CloudWatch permissions
aws iam get-role-policy --role-name ClenergizeServiceRole --policy-name CloudWatchMetrics

# Manually publish test metric
aws cloudwatch put-metric-data \
  --namespace Clenergize/Test \
  --metric-name TestMetric \
  --value 1
```

## 📚 Best Practices

### 1. Metric Naming Conventions

```typescript
// ✅ GOOD: Clear, consistent naming
http_requests_total{method="GET",route="/api/v1/users",status="200"}
identity_auth_success_total{type="login"}
calculation_emissions_calculated_total{scope="1"}

// ❌ BAD: Inconsistent, unclear
requests
login_count
calc_done
```

### 2. Label Cardinality

```typescript
// ✅ GOOD: Low cardinality labels
http_requests_total{service="identity",method="GET",status="200"}

// ❌ BAD: High cardinality labels (causes performance issues)
http_requests_total{user_id="550e8400-e29b-41d4-a716-446655440000"}
http_requests_total{correlation_id="req-123456"}
```

### 3. Alert Design

```yaml
# ✅ GOOD: Actionable alert
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.01
  for: 5m
  annotations:
    summary: "Error rate > 1% for 5 minutes"
    description: "Check service logs and recent deployments"
    runbook_url: "https://docs.clenergize.com/runbooks/high-error-rate"

# ❌ BAD: Vague, non-actionable
- alert: SomethingWrong
  expr: some_metric > 100
  annotations:
    summary: "Metric is high"
```

### 4. Dashboard Organization

- **System Overview**: Single pane of glass for all services
- **Service Dashboards**: One per microservice
- **Infrastructure Dashboards**: Database, cache, queues
- **Business Dashboards**: KPIs, revenue metrics
- **SLO Dashboards**: Service level objectives tracking

## 🔐 Security Considerations

1. **Authentication**: Enable Grafana authentication (LDAP/OAuth)
2. **Authorization**: Use role-based access control (RBAC)
3. **Secrets**: Store AlertManager credentials in AWS Secrets Manager
4. **Network**: Restrict Prometheus/Grafana access to internal network
5. **Audit**: Enable audit logging for dashboard changes

## 📞 Support

### Runbook Links

- [Service Down Runbook](https://docs.clenergize.com/runbooks/service-down)
- [High Error Rate Runbook](https://docs.clenergize.com/runbooks/high-error-rate)
- [High Response Time Runbook](https://docs.clenergize.com/runbooks/high-response-time)
- [Database Issues Runbook](https://docs.clenergize.com/runbooks/database-issues)

### Contacts

- **Incident Response**: #clenergize-incidents (Slack)
- **On-Call Engineer**: PagerDuty rotation
- **Monitoring Team**: monitoring@clenergize.com

## 📝 Additional Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [CloudWatch Documentation](https://docs.aws.amazon.com/cloudwatch/)
- [Clenergize V3 Architecture](../../Docs/PHASE2_Target_Architecture_Overview.md)

---

**Last Updated**: November 18, 2025
**Version**: 1.0.0
