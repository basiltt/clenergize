# Enhanced Slash Commands for Clenergize V3

## 🔄 Data Migration Commands

### /migrate-data
Execute comprehensive data migration from OLD to NEW architecture
```bash
/migrate-data --phase=1 --service=identity --mode=dual-write --validate
```
Options:
- `--phase`: Migration phase (0-5)
- `--service`: Specific service to migrate
- `--mode`: Migration mode (dual-write|batch|incremental)
- `--validate`: Run validation after migration
- `--dry-run`: Simulate migration without changes

### /reconcile-data
Reconcile data between OLD and NEW systems
```bash
/reconcile-data --full --fix-discrepancies --report=pdf
```
Options:
- `--full`: Full reconciliation (vs sample)
- `--fix-discrepancies`: Automatically fix issues
- `--report`: Generate report (pdf|csv|json)

### /rollback-migration
Emergency rollback of migration
```bash
/rollback-migration --reason="Data validation failed" --restore-backup
```

---

## 🎭 Performance Testing Commands

### /perf-test
Run comprehensive performance tests
```bash
/perf-test --service=calculation --load=5000 --duration=30m --scenario=peak
```
Options:
- `--service`: Target service (all|specific)
- `--load`: Number of virtual users
- `--duration`: Test duration
- `--scenario`: Test scenario (baseline|peak|stress|soak)

### /load-test
Execute load testing scenarios
```bash
/load-test --type=spike --users=10000 --ramp-time=60s
```

### /optimize-query
Analyze and optimize database queries
```bash
/optimize-query --service=activity --slow-queries --create-indexes
```

---

## 🔌 Integration Commands

### /sync-erp
Synchronize data from ERP systems
```bash
/sync-erp --system=sap --mode=incremental --mapping=auto
```
Options:
- `--system`: ERP system (sap|oracle|dynamics)
- `--mode`: Sync mode (full|incremental|real-time)
- `--mapping`: Field mapping (auto|custom)

### /webhook-test
Test webhook integrations
```bash
/webhook-test --url=https://api.partner.com/hook --event=calculation.completed
```

### /iot-connect
Connect and configure IoT devices
```bash
/iot-connect --protocol=mqtt --device-id=sensor-001 --topic=emissions/realtime
```

---

## 💥 Chaos Engineering Commands

### /chaos-test
Run chaos engineering experiments
```bash
/chaos-test --type=network-partition --target=calculation-service --duration=5m
```
Options:
- `--type`: Failure type (network-partition|pod-kill|cpu-stress|memory-leak)
- `--target`: Target service
- `--duration`: Experiment duration
- `--dry-run`: Simulate without execution

### /resilience-test
Test system resilience
```bash
/resilience-test --scenario=database-failure --recovery-check
```

---

## 📊 Monitoring Commands

### /health-check
Comprehensive health check
```bash
/health-check --deep --all-services --external-deps
```

### /trace-request
Trace request across services
```bash
/trace-request --correlation-id=abc123 --show-latency --export
```

### /metrics-report
Generate metrics report
```bash
/metrics-report --period=24h --format=grafana --kpis
```

---

## 🔐 Security Commands

### /security-scan
Run security scanning
```bash
/security-scan --type=full --include-deps --fix-critical
```
Options:
- `--type`: Scan type (full|owasp|dependency|container)
- `--include-deps`: Include dependency scanning
- `--fix-critical`: Auto-fix critical issues

### /rotate-secrets
Rotate secrets and credentials
```bash
/rotate-secrets --service=all --notify --zero-downtime
```

### /compliance-check
Check compliance status
```bash
/compliance-check --framework=csrd --generate-report
```

---

## 🚀 Deployment Commands

### /deploy
Advanced deployment with strategies
```bash
/deploy --env=production --strategy=canary --percentage=10 --auto-rollback
```
Options:
- `--strategy`: Deployment strategy (blue-green|canary|rolling)
- `--percentage`: Canary percentage
- `--auto-rollback`: Enable automatic rollback

### /rollback
Emergency rollback
```bash
/rollback --env=production --to-version=1.2.3 --reason="Performance degradation"
```

### /scale
Scale services
```bash
/scale --service=calculation --replicas=10 --auto-scale-policy
```

---

## 📈 Analytics Commands

### /calculate-emissions
Trigger emission calculations
```bash
/calculate-emissions --scope=all --year=2024 --methodology=ghg-protocol --uncertainty
```

### /generate-report
Generate ESG reports
```bash
/generate-report --type=ghg-inventory --format=pdf --framework=cdp
```

### /benchmark
Run benchmarking analysis
```bash
/benchmark --peer-group=manufacturing --metrics=all --export
```

---

## 🛠️ Maintenance Commands

### /cleanup
Clean up resources
```bash
/cleanup --type=logs --older-than=30d --archive
```

### /backup
Create backups
```bash
/backup --service=all --type=full --encrypt --s3
```

### /restore
Restore from backup
```bash
/restore --backup-id=20240115-full --verify
```

---

## 🎯 Quick Actions

### /quick-fix-jwt
Fix JWT verification issues immediately
```bash
/quick-fix-jwt --verify --test --deploy
```

### /quick-cache-warm
Warm up caches
```bash
/quick-cache-warm --service=all --priority-data
```

### /quick-index-db
Create missing database indexes
```bash
/quick-index-db --analyze --create --verify
```

---

## Usage Examples

```bash
# Complete migration workflow
/migrate-data --phase=1 --validate
/reconcile-data --full --report=pdf
/perf-test --service=all --scenario=baseline

# Production deployment
/security-scan --type=full --fix-critical
/deploy --env=staging --strategy=canary --percentage=25
/health-check --deep --all-services
/deploy --env=production --strategy=blue-green

# Incident response
/trace-request --correlation-id=error-123
/rollback --env=production --to-version=previous
/health-check --deep

# Performance optimization
/optimize-query --service=calculation --slow-queries
/quick-cache-warm --priority-data
/perf-test --scenario=peak
```