# Service Health Checks - Clenergize V3 ESG Platform

**Version**: 1.0.0
**Last Updated**: November 22, 2025

## Overview

All services implement standardized health check endpoints for monitoring and orchestration.

## Health Check Endpoints

### Standard Health Check

**Endpoint**: `GET /health`
**Response Time**: < 100ms
**Authentication**: None required

**Response Format**:
```json
{
  "status": "healthy",
  "service": "identity-service",
  "version": "1.0.0",
  "uptime": 3600,
  "timestamp": "2025-11-22T10:30:00Z"
}
```

### Detailed Health Check

**Endpoint**: `GET /health/detailed`
**Response Time**: < 500ms
**Authentication**: Admin only

**Response Format**:
```json
{
  "status": "healthy",
  "service": "identity-service",
  "version": "1.0.0",
  "uptime": 3600,
  "dependencies": {
    "mongodb": {
      "status": "healthy",
      "responseTime": 5
    },
    "redis": {
      "status": "healthy",
      "responseTime": 2
    },
    "eventBridge": {
      "status": "healthy",
      "responseTime": 10
    }
  },
  "metrics": {
    "cpu": 45.2,
    "memory": 512,
    "requestsPerSecond": 120
  }
}
```

## Health Status Codes

- **healthy**: All systems operational
- **degraded**: Some non-critical dependencies down
- **unhealthy**: Critical dependencies down
- **unknown**: Unable to determine status

## ECS Health Check Configuration

```json
{
  "healthCheck": {
    "command": ["CMD-SHELL", "curl -f http://localhost:3001/health || exit 1"],
    "interval": 30,
    "timeout": 5,
    "retries": 3,
    "startPeriod": 60
  }
}
```

## Kubernetes Probes

### Liveness Probe
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3001
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

### Readiness Probe
```yaml
readinessProbe:
  httpGet:
    path: /health/detailed
    port: 3001
  initialDelaySeconds: 10
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 2
```

## Dependency Health Checks

### MongoDB Connection
```typescript
async function checkMongoDB(): Promise<boolean> {
  try {
    await mongoClient.db().admin().ping();
    return true;
  } catch (error) {
    logger.error('MongoDB health check failed', error);
    return false;
  }
}
```

### Redis Connection
```typescript
async function checkRedis(): Promise<boolean> {
  try {
    const response = await redisClient.ping();
    return response === 'PONG';
  } catch (error) {
    logger.error('Redis health check failed', error);
    return false;
  }
}
```

### EventBridge Health
```typescript
async function checkEventBridge(): Promise<boolean> {
  try {
    await eventBridgeClient.send(new ListRulesCommand({ Limit: 1 }));
    return true;
  } catch (error) {
    logger.error('EventBridge health check failed', error);
    return false;
  }
}
```

## Monitoring Integration

### CloudWatch Alarms

```bash
aws cloudwatch put-metric-alarm   --alarm-name identity-service-health-check-failed   --comparison-operator GreaterThanThreshold   --evaluation-periods 3   --metric-name HealthCheckStatus   --namespace AWS/ECS   --period 60   --statistic Average   --threshold 0   --alarm-actions arn:aws:sns:us-east-1:123456789012:critical-alerts
```

### Datadog Health Check Monitor

```yaml
name: "Identity Service Health Check"
type: service check
query: |
  "http.can_connect".over("url:https://api.clenergize.com/health").by("*").last(3).count_by_status()
message: |
  Identity service health check is failing.
  Runbook: https://docs.clenergize.com/runbooks/identity-service-down
```

## Health Check Best Practices

1. **Keep it Fast**: < 100ms for basic health check
2. **Check Dependencies**: Verify critical dependencies only
3. **Don't Block Startup**: Use startPeriod in ECS/K8s
4. **Log Failures**: Always log why health check failed
5. **Graceful Degradation**: Return degraded status for non-critical failures

## Troubleshooting

### Health Check Timeout
- Increase timeout value
- Optimize dependency checks
- Use caching for expensive checks

### False Positives
- Increase failure threshold
- Add retry logic
- Check for transient network issues

### Service Flapping
- Increase startPeriod
- Reduce check frequency
- Investigate underlying issues

---

**Owner**: DevOps Team
**Review Frequency**: Quarterly
