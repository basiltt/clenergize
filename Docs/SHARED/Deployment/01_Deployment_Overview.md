# Deployment Overview - Clenergize V3 ESG Platform

**Version**: 1.0.0
**Last Updated**: November 22, 2025
**Target Platform**: AWS (ECS Fargate + EKS)
**Environments**: Development, Staging, Production

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   DEPLOYMENT LAYERS                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  CLIENT LAYER                                           │
│  ├─ CloudFront CDN (Frontend assets)                   │
│  └─ Route 53 (DNS)                                      │
│                                                          │
│  APPLICATION LAYER                                      │
│  ├─ Application Load Balancer (ALB)                    │
│  ├─ ECS Fargate (7 core microservices)                 │
│  └─ EKS (43 ESG domain services - future phases)       │
│                                                          │
│  DATA LAYER                                              │
│  ├─ MongoDB Atlas (M30 cluster, multi-AZ)              │
│  ├─ Redis ElastiCache (cluster mode)                   │
│  ├─ InfluxDB Cloud                                      │
│  ├─ Neo4j Aura                                          │
│  └─ ClickHouse Cloud                                    │
│                                                          │
│  MESSAGING LAYER                                         │
│  ├─ AWS MSK (Kafka)                                     │
│  ├─ AWS SQS (queues)                                    │
│  └─ AWS EventBridge (event bus)                         │
│                                                          │
│  STORAGE LAYER                                           │
│  ├─ S3 (documents, exports, backups)                    │
│  └─ EFS (shared file storage)                           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Environment Configuration

### Development Environment
- **Infrastructure**: Docker Compose (local)
- **Databases**: LocalStack, MongoDB/Redis containers
- **Purpose**: Local development and testing
- **Access**: Developers only

### Staging Environment
- **Infrastructure**: AWS ECS Fargate (single AZ)
- **Databases**: MongoDB Atlas M10, Redis t3.small
- **Purpose**: Integration testing, UAT
- **Access**: QA team, stakeholders

### Production Environment
- **Infrastructure**: AWS ECS Fargate + EKS (multi-AZ)
- **Databases**: MongoDB Atlas M30+, Redis r6g.large cluster
- **Purpose**: Live customer traffic
- **Access**: Restricted (admins only)

## Deployment Process

### CI/CD Pipeline (GitHub Actions)

```yaml
Trigger: Push to branch
  ↓
Step 1: Lint & Unit Tests
  ↓
Step 2: Build Docker Images
  ↓
Step 3: Security Scan (Trivy)
  ↓
Step 4: Integration Tests
  ↓
Step 5: Push to ECR
  ↓
Step 6: Deploy to Environment
  ↓
Step 7: Run Smoke Tests
  ↓
Step 8: Notify Team (Slack)
```

### Deployment Commands

```bash
# Deploy to Development
npm run deploy:dev

# Deploy to Staging
npm run deploy:staging

# Deploy to Production (requires approval)
npm run deploy:prod

# Rollback to previous version
npm run rollback:prod
```

## Infrastructure as Code

### Terraform Structure

```
infrastructure/
├── terraform/
│   ├── modules/
│   │   ├── ecs-service/
│   │   ├── rds/
│   │   ├── elasticache/
│   │   └── s3/
│   ├── environments/
│   │   ├── dev/
│   │   ├── staging/
│   │   └── prod/
│   └── main.tf
```

### Deploy Infrastructure

```bash
cd infrastructure/terraform/environments/prod
terraform init
terraform plan
terraform apply
```

## Docker Images

### Multi-Stage Build Pattern

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
USER node
EXPOSE 3001
CMD ["node", "dist/main.js"]
```

### Image Naming Convention

```
{AWS_ACCOUNT_ID}.dkr.ecr.{REGION}.amazonaws.com/clenergize/{SERVICE}:{VERSION}

Example:
123456789012.dkr.ecr.us-east-1.amazonaws.com/clenergize/identity-service:1.2.3
```

## Health Checks

### Application Health Endpoint

```typescript
@Get('/health')
getHealth() {
  return {
    status: 'healthy',
    service: 'identity-service',
    version: process.env.VERSION,
    uptime: process.uptime(),
    dependencies: {
      mongodb: await checkMongoDB(),
      redis: await checkRedis()
    }
  };
}
```

### ECS Health Check Configuration

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

## Monitoring & Logging

### CloudWatch Logs

All services send logs to CloudWatch with structured JSON format:

```json
{
  "timestamp": "2025-11-22T10:30:00Z",
  "level": "info",
  "service": "identity-service",
  "correlationId": "req-123",
  "message": "User created successfully",
  "userId": "user-456"
}
```

### Metrics & Alarms

- **CPU Utilization** > 80% for 5 minutes → Alert
- **Memory Utilization** > 85% for 5 minutes → Alert
- **Request Latency** p95 > 500ms → Alert
- **Error Rate** > 1% → Alert
- **Health Check Failures** > 3 consecutive → Alert

## Scaling Strategy

### Auto-Scaling Configuration

```json
{
  "minCapacity": 2,
  "maxCapacity": 10,
  "targetMetrics": {
    "cpuUtilization": 70,
    "memoryUtilization": 75,
    "requestCountPerTarget": 1000
  }
}
```

### Database Scaling

- **MongoDB Atlas**: Auto-scaling enabled (M30 → M100)
- **Redis**: Manual scaling (r6g.large → r6g.xlarge)
- **InfluxDB**: Auto-scaling based on data ingestion rate

## Disaster Recovery

### Backup Strategy

- **MongoDB**: Continuous backups (point-in-time recovery, 7-day retention)
- **Redis**: Daily snapshots to S3
- **S3**: Cross-region replication enabled
- **Application State**: Stateless services (no local state)

### Recovery Time Objectives (RTO/RPO)

- **RTO**: 1 hour (time to restore service)
- **RPO**: 5 minutes (maximum data loss)

## Security

### Network Security

- Services in private subnets (no public IPs)
- NAT Gateway for outbound internet access
- Security groups restrict traffic between services
- WAF protects public-facing endpoints

### Secrets Management

- AWS Secrets Manager for database credentials
- Parameter Store for configuration
- IAM roles for service authentication
- Encryption at rest and in transit (TLS 1.3)

## Deployment Checklist

Before deploying to production:

- [ ] All unit tests passing (80% coverage)
- [ ] All integration tests passing
- [ ] E2E smoke tests passing
- [ ] Security scan (Trivy) shows 0 high/critical vulnerabilities
- [ ] Database migrations tested in staging
- [ ] Environment variables configured
- [ ] Secrets rotated
- [ ] CloudWatch alarms configured
- [ ] Backup verification completed
- [ ] Rollback plan documented
- [ ] Stakeholders notified

## Additional Resources

- [Disaster Recovery Plan](07_Disaster_Recovery.md)
- [Security Hardening Guide](../07-Security/01_Security_Overview.md)
- [Terraform Modules](https://github.com/yourcompany/terraform-modules)
- [Runbook](08_Runbook.md)
