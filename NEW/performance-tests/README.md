# Clenergize V3 Performance Testing

Comprehensive performance testing suite for Clenergize V3 microservices using **K6**.

## 🎯 Overview

This performance testing framework validates that all Clenergize V3 microservices meet performance SLOs under various load conditions. Tests cover:

✅ **Smoke Testing**: Quick sanity checks
✅ **Load Testing**: Normal production traffic
✅ **Stress Testing**: System capacity limits
✅ **Spike Testing**: Sudden traffic bursts
✅ **Soak Testing**: Long-term stability (8 hours)

## 📊 Performance SLOs

| Metric | Target | Critical |
|--------|--------|----------|
| **Response Time (p50)** | < 100ms | < 200ms |
| **Response Time (p95)** | < 200ms | < 500ms |
| **Response Time (p99)** | < 500ms | < 1000ms |
| **Error Rate** | < 1% | < 5% |
| **Availability** | > 99.9% | > 99% |

### Service-Specific SLOs

| Service | p95 Target | p99 Target | Notes |
|---------|-----------|-----------|-------|
| **Identity** | 200ms | 400ms | Authentication critical path |
| **Organization** | 300ms | 600ms | Hierarchy operations |
| **Reference** | 200ms | 400ms | High cache hit rate expected |
| **Activity** | 250ms | 500ms | Data ingestion |
| **Calculation** | 400ms | 800ms | Complex aggregations |
| **Reporting** | 1000ms | 2000ms | Report generation |
| **Audit** | 500ms | 1000ms | Compliance queries |

## 🔧 Prerequisites

1. **K6 Installation**:
   ```bash
   # macOS
   brew install k6

   # Windows (via Chocolatey)
   choco install k6

   # Linux
   sudo gpg -k
   sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
   echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
   sudo apt-get update
   sudo apt-get install k6

   # Or use Docker
   docker pull grafana/k6:latest
   ```

2. **Running Services**: All Clenergize V3 services must be running
   ```bash
   # Start local development environment
   cd ../..
   make up
   ```

3. **Test Data**: Services should be seeded with test data
   ```bash
   make seed
   ```

## 🚀 Quick Start

### Run Smoke Test (1 minute)
```bash
npm run test:smoke
```

### Run Load Test (9 minutes)
```bash
npm run test:load
```

### Run All Tests
```bash
npm test
```

## 📋 Test Suite

### 1. Smoke Test
**Purpose**: Quick sanity check before full testing
**Duration**: 1 minute
**Load**: 1 concurrent user
**Command**: `npm run test:smoke`

**What it tests**:
- ✅ All services are reachable
- ✅ Health endpoints respond
- ✅ Authentication works
- ✅ Basic CRUD operations functional
- ✅ API Gateway routing correct

**When to run**:
- Before every deployment
- After configuration changes
- As part of CI/CD pipeline

---

### 2. Load Test
**Purpose**: Validate performance under normal load
**Duration**: 9 minutes (2m ramp-up + 5m sustained + 2m ramp-down)
**Load**: 100 concurrent users
**Command**: `npm run test:load`

**Traffic Distribution** (realistic user behavior):
- 40% Reading activity data
- 20% Viewing reports
- 15% Managing projects
- 10% Calculating emissions
- 10% Ingesting data
- 5% Admin tasks

**What it validates**:
- ✅ Response times meet SLOs
- ✅ Error rate < 1%
- ✅ All services scale proportionally
- ✅ Database queries optimized
- ✅ Cache hit rates acceptable

**When to run**:
- Before production deployment
- After performance optimizations
- Weekly baseline testing

---

### 3. Stress Test
**Purpose**: Find system breaking point
**Duration**: 19 minutes
**Load**: Gradually increase to 400 concurrent users
**Command**: `npm run test:stress`

**Load Profile**:
- 0-2min: Ramp to 100 users (baseline)
- 2-7min: Ramp to 200 users (2x load)
- 7-12min: Ramp to 300 users (3x load)
- 12-17min: Ramp to 400 users (4x load - stress point)
- 17-19min: Ramp down to 0

**What it reveals**:
- ✅ Maximum system capacity
- ✅ Degradation patterns under stress
- ✅ Circuit breaker activation
- ✅ Rate limiting effectiveness
- ✅ Auto-scaling triggers

**When to run**:
- Capacity planning
- Before major events (e.g., year-end reporting)
- After infrastructure changes

---

### 4. Spike Test
**Purpose**: Test resilience to traffic bursts
**Duration**: ~8 minutes
**Load**: 100 → 1400 users (14x spike!) → 100 users
**Command**: `npm run test:spike`

**Spike Profile**:
- 0-1:10: 100 users (baseline)
- 1:10-1:20: **SPIKE to 1400 users** (10 seconds)
- 1:20-4:20: Sustain 1400 users (3 minutes)
- 4:20-4:30: Drop to 100 users (10 seconds)
- 4:30-7:30: Recovery period at 100 users
- 7:30-7:40: Ramp down

**What it validates**:
- ✅ Circuit breakers prevent cascading failures
- ✅ Rate limiting protects services
- ✅ Auto-scaling responds quickly
- ✅ Graceful degradation under extreme load
- ✅ System recovers after spike

**When to run**:
- Before production launch
- After circuit breaker configuration changes
- Quarterly resilience testing

---

### 5. Soak Test (Endurance Test)
**Purpose**: Detect memory leaks and resource exhaustion
**Duration**: 8 hours 10 minutes
**Load**: 200 concurrent users sustained
**Command**: `npm run test:soak`

⚠️ **WARNING**: This test runs for 8+ hours. Only run in dedicated test environments.

**What it monitors**:
- ✅ Memory usage (should be stable, not increasing)
- ✅ Database connection pools (no leaks)
- ✅ Cache hit rate (should remain high)
- ✅ Response time degradation (should be minimal)
- ✅ Error rate (should stay < 1% throughout)
- ✅ CPU usage (should be consistent)
- ✅ Thread/connection count (should be stable)

**When to run**:
- Before major releases
- After significant code changes
- Monthly stability validation

---

## 📁 Project Structure

```
performance-tests/
├── k6/
│   ├── config.js                      # Central configuration
│   ├── utils/
│   │   └── helpers.js                 # Shared test utilities
│   ├── scenarios/
│   │   ├── identity-service-test.js   # Identity service scenarios
│   │   ├── organization-service-test.js
│   │   ├── activity-service-test.js
│   │   ├── calculation-service-test.js
│   │   ├── reporting-service-test.js
│   │   └── audit-service-test.js
│   ├── smoke-test.js                  # Smoke test suite
│   ├── load-test.js                   # Load test suite
│   ├── stress-test.js                 # Stress test suite
│   ├── spike-test.js                  # Spike test suite
│   └── soak-test.js                   # Soak test suite
├── package.json                       # npm scripts
└── README.md                          # This file
```

## ⚙️ Configuration

### Environment Variables

Override default configuration using environment variables:

```bash
# Service URLs
export IDENTITY_SERVICE_URL=http://localhost:3001
export ORGANIZATION_SERVICE_URL=http://localhost:3002
export REFERENCE_SERVICE_URL=http://localhost:3003
export ACTIVITY_SERVICE_URL=http://localhost:3004
export CALCULATION_SERVICE_URL=http://localhost:3005
export REPORTING_SERVICE_URL=http://localhost:3006
export AUDIT_SERVICE_URL=http://localhost:3007
export API_GATEWAY_URL=http://localhost:80

# Authentication
export TEST_USER_EMAIL=perf-test@clenergize.com
export TEST_USER_PASSWORD=TestPassword123!
export TEST_ADMIN_EMAIL=admin-perf@clenergize.com
export TEST_ADMIN_PASSWORD=AdminPassword123!

# Test Data
export TEST_ORG_ID=550e8400-e29b-41d4-a716-446655440001
export TEST_PROJECT_ID=550e8400-e29b-41d4-a716-446655440002
export TEST_USER_ID=550e8400-e29b-41d4-a716-446655440003
```

### k6/config.js

All test configuration is centralized in `k6/config.js`:

```javascript
export const config = {
  services: { /* service URLs */ },
  auth: { /* credentials */ },
  testData: { /* test UUIDs */ },
  thresholds: { /* performance SLOs */ },
  profiles: { /* load test profiles */ }
};
```

## 📊 Running Individual Service Tests

Test specific services in isolation:

```bash
# Identity Service
npm run test:service:identity

# Organization Service
npm run test:service:organization

# Activity Service
npm run test:service:activity

# Calculation Service
npm run test:service:calculation

# Reporting Service
npm run test:service:reporting

# Audit Service
npm run test:service:audit
```

## 📈 Interpreting Results

### K6 Output

K6 provides real-time metrics during test execution:

```
✓ login successful
✓ activities retrieved
✓ calculations completed

checks.........................: 95.23% ✓ 9523  ✗ 477
data_received..................: 45 MB  500 kB/s
data_sent......................: 12 MB  133 kB/s
http_req_blocked...............: avg=1.2ms    min=0s      med=1ms     max=45ms    p(90)=2ms     p(95)=3ms
http_req_connecting............: avg=0.8ms    min=0s      med=0.7ms   max=30ms    p(90)=1.5ms   p(95)=2ms
http_req_duration..............: avg=120ms    min=15ms    med=95ms    max=2.5s    p(90)=180ms   p(95)=210ms
  { expected_response:true }...: avg=115ms    min=15ms    med=90ms    max=450ms   p(90)=175ms   p(95)=200ms
http_req_failed................: 0.95%  ✓ 95    ✗ 9905
http_req_receiving.............: avg=0.5ms    min=0s      med=0.3ms   max=50ms    p(90)=1ms     p(95)=2ms
http_req_sending...............: avg=0.2ms    min=0s      med=0.1ms   max=20ms    p(90)=0.5ms   p(95)=1ms
http_req_tls_handshaking.......: avg=0ms      min=0s      med=0ms     max=0ms     p(90)=0ms     p(95)=0ms
http_req_waiting...............: avg=119ms    min=14ms    med=94ms    max=2.5s    p(90)=179ms   p(95)=209ms
http_reqs......................: 10000  111.11/s
iteration_duration.............: avg=5.2s     min=4s      med=5s      max=8s      p(90)=6s      p(95)=7s
iterations.....................: 2000   22.22/s
vus............................: 100    min=100 max=100
vus_max........................: 100    min=100 max=100
```

### Key Metrics Explained

| Metric | What It Means | SLO |
|--------|---------------|-----|
| `http_req_duration (p95)` | 95% of requests complete within this time | < 200ms |
| `http_req_duration (p99)` | 99% of requests complete within this time | < 500ms |
| `http_req_failed` | Percentage of failed requests | < 1% |
| `checks` | Percentage of validation checks passed | > 95% |
| `http_reqs` | Total requests per second (throughput) | Monitor |
| `iterations` | Virtual users completing scenarios per second | Monitor |

### Red Flags 🚨

- **p95 > 500ms**: Service degradation
- **Error rate > 1%**: Investigate failures immediately
- **Checks < 95%**: Data validation issues
- **Response time increasing over time**: Possible memory leak (soak test)
- **High `http_req_blocked`**: Connection pool exhaustion

## 🐛 Troubleshooting

### Issue: High Error Rate

**Symptoms**: `http_req_failed > 5%`

**Possible Causes**:
- Services not running
- Database connection issues
- Rate limiting triggered
- Authentication failures

**Solutions**:
```bash
# Check all services are healthy
curl http://localhost:3001/health
curl http://localhost:3002/health
# ... etc

# Check logs
docker logs clenergize-identity-1
docker logs clenergize-activity-1

# Reduce load
k6 run --vus 10 --duration 1m k6/load-test.js
```

---

### Issue: High Response Times

**Symptoms**: `http_req_duration (p95) > 1000ms`

**Possible Causes**:
- Database queries not optimized
- Missing indexes
- Cache not configured
- Insufficient resources

**Solutions**:
```bash
# Check database slow queries
docker exec -it clenergize-mongodb-1 mongosh
> use clenergize_activity
> db.setProfilingLevel(2)
> db.system.profile.find().sort({ts:-1}).limit(10)

# Check cache hit rate
docker exec -it clenergize-redis-1 redis-cli INFO stats

# Increase resources
docker-compose -f docker-compose.dev.yml up -d --scale activity-service=3
```

---

### Issue: Connection Errors

**Symptoms**: `http_req_connecting` very high or timeouts

**Possible Causes**:
- Connection pool exhausted
- Too many concurrent connections
- Network issues

**Solutions**:
```bash
# Increase connection pool size (in service config)
MONGODB_MAX_POOL_SIZE=200 npm start

# Reduce VUs
k6 run --vus 50 --duration 5m k6/load-test.js

# Check network
netstat -an | grep ESTABLISHED | wc -l
```

---

### Issue: Memory Leaks (Soak Test)

**Symptoms**: Response times degrade over hours, memory usage increases

**Possible Causes**:
- Unclosed database connections
- Event listeners not removed
- Large objects in memory
- Cache growing unbounded

**Solutions**:
```bash
# Monitor memory during soak test
docker stats

# Enable heap profiling (Node.js services)
NODE_OPTIONS="--max-old-space-size=4096 --heap-prof" npm start

# Analyze heap dump
node --inspect server.js
# Chrome DevTools > Memory > Take heap snapshot
```

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Performance Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 2 * * 0'  # Weekly on Sunday at 2 AM

jobs:
  performance-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Start Services
        run: docker-compose -f docker-compose.test.yml up -d

      - name: Wait for Services
        run: ./scripts/wait-for-services.sh

      - name: Install K6
        run: |
          sudo gpg -k
          sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6

      - name: Run Smoke Test
        run: npm run test:smoke

      - name: Run Load Test
        run: npm run test:load

      - name: Upload Results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: performance-results
          path: results/

      - name: Notify on Failure
        if: failure()
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK_URL }} \
            -H 'Content-Type: application/json' \
            -d '{"text":"Performance tests failed!"}'
```

## 📚 Resources

- [K6 Documentation](https://k6.io/docs/)
- [Performance Testing Best Practices](https://k6.io/docs/test-types/introduction/)
- [Clenergize V3 Architecture](../../Docs/PHASE2_Target_Architecture_Overview.md)
- [Service Specifications](../../Docs/)

## 🎯 Success Criteria

Before deploying to production, ensure:

- ✅ Smoke test passes 100%
- ✅ Load test meets all SLOs (p95 < 200ms, error rate < 1%)
- ✅ Stress test degrades gracefully (no crashes)
- ✅ Spike test circuit breakers activate correctly
- ✅ Soak test shows no memory leaks or degradation

## 📞 Support

For issues or questions:
1. Check service logs: `docker logs <service-name>`
2. Review [Troubleshooting](#troubleshooting) section
3. Contact the performance engineering team

---

**Last Updated**: November 18, 2025
**Version**: 1.0.0
