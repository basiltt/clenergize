# Environment Configuration Guide

## Overview

This guide documents all environment variables required for the Clenergize V3 application across all services, infrastructure components, and local development setup.

**Key Principles**:
- **Never hardcode** configuration values
- **Always validate** environment variables on startup
- **Use defaults** only for local development
- **Fail fast** if required variables are missing

---

## Table of Contents

1. [Environment Templates](#environment-templates)
2. [Per-Service Configuration](#per-service-configuration)
3. [Infrastructure Configuration](#infrastructure-configuration)
4. [Environment Variable Validation](#environment-variable-validation)
5. [Docker Environment Setup](#docker-environment-setup)
6. [Security Best Practices](#security-best-practices)

---

## Environment Templates

### Root `.env.example` Template

Create this file at `NEW/.env.example`:

```bash
#######################
# NODE ENVIRONMENT
#######################
NODE_ENV=development
LOG_LEVEL=debug

#######################
# MONGODB
#######################
MONGODB_URI=mongodb://admin:localdev123@localhost:27017/?authSource=admin

# Service-specific databases (auto-created)
# - clenergize_identity
# - clenergize_organization
# - clenergize_reference
# - clenergize_activity
# - clenergize_calculation
# - clenergize_reporting
# - clenergize_audit
# - clenergize_gateway

#######################
# REDIS
#######################
REDIS_URL=redis://localhost:6379

#######################
# JWT CONFIGURATION
#######################
JWT_SECRET=your-secret-key-change-in-production-min-32-chars-required
JWT_ISSUER=http://localhost:3000
JWT_AUDIENCE=clenergize-v3
JWT_EXPIRES_IN=1h

# For AWS Cognito (production)
JWKS_URI=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_XXXXX/.well-known/jwks.json
COGNITO_USER_POOL_ID=us-east-1_XXXXX
COGNITO_CLIENT_ID=your-cognito-client-id

#######################
# AWS / LOCALSTACK
#######################
LOCALSTACK_ENDPOINT=http://localhost:4566
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test

# EventBridge
EVENTBRIDGE_BUS_NAME=clenergize-event-bus

# SQS Queues
SQS_CALCULATION_QUEUE=clenergize-calculation-queue
SQS_REPORTING_QUEUE=clenergize-reporting-queue

# S3 Buckets
S3_REPORTS_BUCKET=clenergize-reports
S3_EXPORTS_BUCKET=clenergize-exports

#######################
# EMAIL (MAILHOG FOR DEV)
#######################
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_FROM=noreply@clenergize.local
MAIL_SECURE=false

# For production (e.g., SendGrid, AWS SES)
# MAIL_HOST=smtp.sendgrid.net
# MAIL_PORT=587
# MAIL_USER=apikey
# MAIL_PASSWORD=your-sendgrid-api-key
# MAIL_SECURE=true

#######################
# FRONTEND
#######################
FRONTEND_URL=http://localhost:3000
API_GATEWAY_URL=http://localhost:3000

#######################
# FEATURE FLAGS
#######################
ENABLE_SWAGGER=true
ENABLE_METRICS=true
ENABLE_DEBUG_ROUTES=true

#######################
# PERFORMANCE
#######################
MAX_REQUEST_SIZE=10mb
REQUEST_TIMEOUT=30000
DB_POOL_SIZE=10

#######################
# MCP EXECUTOR
#######################
PROJECT_ROOT=/absolute/path/to/ClenergizeV3

# Jira Integration (optional)
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your_jira_api_token_here
JIRA_BASE_URL=https://yourcompany.atlassian.net

# Execution Limits
EXEC_TIMEOUT_MS=30000
MAX_QUERY_LENGTH=5000
```

---

## Per-Service Configuration

### Identity Service (Port 3001)

```bash
# .env for identity-service
SERVICE_NAME=identity-service
PORT=3001

# Database
MONGODB_URI=mongodb://admin:localdev123@localhost:27017/clenergize_identity?authSource=admin

# Redis (for session storage)
REDIS_URL=redis://localhost:6379
REDIS_DB=0

# JWT
JWT_SECRET=your-secret-key-change-in-production-min-32-chars-required
JWT_ISSUER=http://localhost:3001
JWT_AUDIENCE=clenergize-v3
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d

# Password Hashing
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Organization Service (Port 3002)

```bash
# .env for organization-service
SERVICE_NAME=organization-service
PORT=3002

# Database
MONGODB_URI=mongodb://admin:localdev123@localhost:27017/clenergize_organization?authSource=admin

# Redis
REDIS_URL=redis://localhost:6379
REDIS_DB=1

# JWT (for verification only)
JWKS_URI=http://localhost:3001/.well-known/jwks.json
JWT_ISSUER=http://localhost:3001
JWT_AUDIENCE=clenergize-v3

# Event Bus
EVENTBRIDGE_BUS_NAME=clenergize-event-bus
LOCALSTACK_ENDPOINT=http://localhost:4566
```

### Reference Service (Port 3003)

```bash
# .env for reference-service
SERVICE_NAME=reference-service
PORT=3003

# Database
MONGODB_URI=mongodb://admin:localdev123@localhost:27017/clenergize_reference?authSource=admin

# Redis (for caching emission factors)
REDIS_URL=redis://localhost:6379
REDIS_DB=2
CACHE_TTL=3600

# JWT
JWKS_URI=http://localhost:3001/.well-known/jwks.json
JWT_ISSUER=http://localhost:3001
JWT_AUDIENCE=clenergize-v3

# Data Seeding
AUTO_SEED_ON_START=true
SEED_DATA_PATH=./seeds
```

### Activity Service (Port 3004)

```bash
# .env for activity-service
SERVICE_NAME=activity-service
PORT=3004

# Database
MONGODB_URI=mongodb://admin:localdev123@localhost:27017/clenergize_activity?authSource=admin

# Redis
REDIS_URL=redis://localhost:6379
REDIS_DB=3

# JWT
JWKS_URI=http://localhost:3001/.well-known/jwks.json
JWT_ISSUER=http://localhost:3001
JWT_AUDIENCE=clenergize-v3

# File Upload
MAX_FILE_SIZE=50mb
ALLOWED_FILE_TYPES=csv,xlsx,xls,json
UPLOAD_TEMP_DIR=/tmp/uploads

# S3
S3_UPLOADS_BUCKET=clenergize-uploads
LOCALSTACK_ENDPOINT=http://localhost:4566
```

### Calculation Service (Port 3005)

```bash
# .env for calculation-service
SERVICE_NAME=calculation-service
PORT=3005

# Database
MONGODB_URI=mongodb://admin:localdev123@localhost:27017/clenergize_calculation?authSource=admin

# Redis
REDIS_URL=redis://localhost:6379
REDIS_DB=4

# JWT
JWKS_URI=http://localhost:3001/.well-known/jwks.json
JWT_ISSUER=http://localhost:3001
JWT_AUDIENCE=clenergize-v3

# SQS
SQS_CALCULATION_QUEUE=clenergize-calculation-queue
LOCALSTACK_ENDPOINT=http://localhost:4566

# Calculation Engine
CALCULATION_TIMEOUT_MS=60000
MAX_CONCURRENT_CALCULATIONS=10
```

### Reporting Service (Port 3006)

```bash
# .env for reporting-service
SERVICE_NAME=reporting-service
PORT=3006

# Database
MONGODB_URI=mongodb://admin:localdev123@localhost:27017/clenergize_reporting?authSource=admin

# Redis
REDIS_URL=redis://localhost:6379
REDIS_DB=5

# JWT
JWKS_URI=http://localhost:3001/.well-known/jwks.json
JWT_ISSUER=http://localhost:3001
JWT_AUDIENCE=clenergize-v3

# SQS
SQS_REPORTING_QUEUE=clenergize-reporting-queue
LOCALSTACK_ENDPOINT=http://localhost:4566

# S3
S3_REPORTS_BUCKET=clenergize-reports
LOCALSTACK_ENDPOINT=http://localhost:4566

# Report Generation
REPORT_TIMEOUT_MS=120000
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### Audit Service (Port 3007)

```bash
# .env for audit-service
SERVICE_NAME=audit-service
PORT=3007

# Database
MONGODB_URI=mongodb://admin:localdev123@localhost:27017/clenergize_audit?authSource=admin

# Redis
REDIS_URL=redis://localhost:6379
REDIS_DB=6

# JWT
JWKS_URI=http://localhost:3001/.well-known/jwks.json
JWT_ISSUER=http://localhost:3001
JWT_AUDIENCE=clenergize-v3

# Event Bus (for listening to all events)
EVENTBRIDGE_BUS_NAME=clenergize-event-bus
LOCALSTACK_ENDPOINT=http://localhost:4566

# Retention
AUDIT_LOG_RETENTION_DAYS=2555  # 7 years for compliance
```

---

## Infrastructure Configuration

### MongoDB

```bash
# docker-compose environment
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=localdev123
MONGO_INITDB_DATABASE=admin

# For replica set (production)
MONGO_REPLICA_SET_NAME=clenergize-rs
```

### Redis

```bash
# Redis configuration
REDIS_PASSWORD=  # Empty for local dev
REDIS_MAX_MEMORY=2gb
REDIS_EVICTION_POLICY=allkeys-lru
```

### LocalStack

```bash
# LocalStack configuration
LOCALSTACK_SERVICES=s3,sqs,sns,eventbridge,secretsmanager
LOCALSTACK_HOSTNAME=localhost
LOCALSTACK_DEBUG=1
```

---

## Environment Variable Validation

### Validation Schema Using Zod

Create `shared/packages/common/src/config/env-validator.ts`:

```typescript
import { z } from 'zod';

// Base schema for all services
export const BaseEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']),
  SERVICE_NAME: z.string().min(1),
  PORT: z.string().regex(/^\d+$/),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // Database
  MONGODB_URI: z.string().url(),

  // Redis
  REDIS_URL: z.string().url(),
  REDIS_DB: z.string().regex(/^\d+$/).optional(),

  // JWT
  JWT_ISSUER: z.string().url(),
  JWT_AUDIENCE: z.string().min(1),
});

// Extended schema for Identity Service
export const IdentityServiceEnvSchema = BaseEnvSchema.extend({
  SERVICE_NAME: z.literal('identity-service'),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().regex(/^\d+[smhd]$/),
  REFRESH_TOKEN_EXPIRES_IN: z.string().regex(/^\d+[smhd]$/),
  BCRYPT_ROUNDS: z.string().regex(/^\d+$/),
});

// Extended schema for services with JWKS verification
export const JWKSServiceEnvSchema = BaseEnvSchema.extend({
  JWKS_URI: z.string().url(),
});

// Calculation Service schema
export const CalculationServiceEnvSchema = JWKSServiceEnvSchema.extend({
  SERVICE_NAME: z.literal('calculation-service'),
  SQS_CALCULATION_QUEUE: z.string().min(1),
  LOCALSTACK_ENDPOINT: z.string().url(),
  CALCULATION_TIMEOUT_MS: z.string().regex(/^\d+$/),
  MAX_CONCURRENT_CALCULATIONS: z.string().regex(/^\d+$/),
});

// Validation function
export function validateEnv<T extends z.ZodSchema>(schema: T): z.infer<T> {
  try {
    return schema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}
```

### Usage in Services

```typescript
// identity-service/src/main.ts
import { validateEnv, IdentityServiceEnvSchema } from '@clenergize/common';

// Validate environment on startup
const env = validateEnv(IdentityServiceEnvSchema);

console.log('✅ Environment variables valid');
console.log(`Starting ${env.SERVICE_NAME} on port ${env.PORT}...`);
```

---

## Docker Environment Setup

### docker-compose.yml Environment Variables

```yaml
version: '3.8'

services:
  identity-service:
    env_file:
      - .env
      - services/identity-service/.env
    environment:
      - SERVICE_NAME=identity-service
      - PORT=3001
      - MONGODB_URI=mongodb://admin:localdev123@mongodb:27017/clenergize_identity?authSource=admin
      - REDIS_URL=redis://redis:6379

  mongodb:
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=localdev123

  redis:
    environment:
      - REDIS_PASSWORD=

  localstack:
    environment:
      - SERVICES=s3,sqs,sns,eventbridge,secretsmanager
      - DEBUG=1
      - HOSTNAME=localstack
```

---

## Security Best Practices

### 1. Never Commit `.env` Files

```bash
# .gitignore
.env
.env.local
.env.*.local
*.env

# DO commit these
.env.example
.env.template
```

### 2. Use Different Values Per Environment

```bash
# Development
JWT_SECRET=dev-secret-key-min-32-chars-required

# Staging
JWT_SECRET=staging-secret-different-from-dev-and-prod

# Production
JWT_SECRET=$(aws secretsmanager get-secret-value --secret-id prod/jwt-secret)
```

### 3. Validate on Startup

Every service must validate environment variables before starting:

```typescript
async function bootstrap() {
  // 1. Validate environment
  const env = validateEnv(ServiceEnvSchema);

  // 2. Initialize logger
  const logger = createLogger({ serviceName: env.SERVICE_NAME });

  // 3. Start application
  const app = await NestFactory.create(AppModule, { logger });
  await app.listen(env.PORT);

  logger.info(`${env.SERVICE_NAME} listening on port ${env.PORT}`);
}
```

### 4. Redact Sensitive Values in Logs

```typescript
import pino from 'pino';

const logger = pino({
  redact: {
    paths: [
      'password',
      'token',
      'secret',
      'apiKey',
      'authorization',
      '*.password',
      '*.token',
      'req.headers.authorization',
      'req.headers.cookie'
    ],
    remove: true
  }
});

// This will redact the password
logger.info({ user: 'john', password: 'secret123' });
// Output: { user: 'john' }
```

### 5. Use AWS Secrets Manager in Production

```typescript
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

async function getSecret(secretName: string) {
  const client = new SecretsManagerClient({ region: process.env.AWS_REGION });
  const command = new GetSecretValueCommand({ SecretId: secretName });
  const data = await client.send(command);
  return JSON.parse(data.SecretString!);
}

// Usage
const secrets = await getSecret('prod/clenergize/database');
process.env.MONGODB_URI = secrets.MONGODB_URI;
```

---

## Environment Variable Checklist

Before starting any service:

- [ ] `.env.example` exists with all required variables
- [ ] `.env` created from `.env.example` (for local dev)
- [ ] All required variables have values (no empty strings)
- [ ] Secrets are at least 32 characters long
- [ ] Database URIs are correct for environment
- [ ] Service names match expected values
- [ ] Ports don't conflict with other services
- [ ] Validation schema exists for service
- [ ] Validation runs on startup
- [ ] Sensitive values are redacted in logs
- [ ] `.env` is in `.gitignore`
- [ ] Production uses AWS Secrets Manager or equivalent

---

## Troubleshooting

### Service Won't Start

```bash
# Check environment variables are set
node -e "console.log(process.env.MONGODB_URI)"

# Run validation manually
npm run validate:env

# Check for typos
diff .env.example .env
```

### Variables Not Loading

```bash
# Ensure dotenv is loaded early
# src/main.ts
import * as dotenv from 'dotenv';
dotenv.config();  // Must be FIRST import

# Check file location
ls -la .env
```

### Docker Container Issues

```bash
# View environment in container
docker exec identity-service env

# Check env_file is correct
docker-compose config | grep -A 10 identity-service
```

---

## References

- [Zod Documentation](https://zod.dev)
- [dotenv Documentation](https://github.com/motdotla/dotenv)
- [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/)
- [12-Factor App Config](https://12factor.net/config)

---

**Last Updated**: November 17, 2025
**Maintained By**: DevOps Agent
**Review Frequency**: Monthly or when new services added
