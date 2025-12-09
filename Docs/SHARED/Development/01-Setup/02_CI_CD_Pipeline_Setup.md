# CI/CD Pipeline Setup Guide

## Overview

This guide documents the comprehensive CI/CD pipeline for the Clenergize V3 ESG Platform, implementing security scanning, automated testing, and progressive deployment across environments.

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CI/CD PIPELINE FLOW                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Trigger Events:                                            │
│  • Push to main/develop/sprint branches                    │
│  • Pull requests                                           │
│  • Manual workflow dispatch                                │
│                                                             │
│  Pipeline Stages:                                          │
│  1. Security Scanning (Trivy, npm audit, OWASP)           │
│  2. Code Quality (ESLint, Prettier, SonarCloud)           │
│  3. Unit Tests (Jest, 80% coverage)                        │
│  4. Integration Tests (TestContainers)                     │
│  5. Contract Tests (Pact)                                  │
│  6. Build Docker Images                                    │
│  7. E2E Tests (Cypress)                                    │
│  8. Performance Tests (K6)                                 │
│  9. Deploy to Environment                                  │
│  10. Security Gate Check                                   │
│                                                             │
│  Deployment Flow:                                          │
│  develop → Development Environment                         │
│  main → Staging Environment                                │
│  tags → Production Environment (manual approval)           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

### GitHub Repository Settings

1. **Branch Protection Rules**
   ```
   Branch: main
   - Require pull request reviews: 2 approvals
   - Dismiss stale reviews: Yes
   - Require review from CODEOWNERS: Yes
   - Require status checks: All CI jobs
   - Require branches up to date: Yes
   - Include administrators: Yes

   Branch: develop
   - Require pull request reviews: 1 approval
   - Require status checks: All CI jobs
   ```

2. **Required Secrets**
   ```bash
   # Docker Hub
   DOCKER_USERNAME
   DOCKER_PASSWORD

   # AWS
   AWS_ACCESS_KEY_ID
   AWS_SECRET_ACCESS_KEY
   ECR_REGISTRY

   # Code Quality
   SONAR_TOKEN
   CODECOV_TOKEN

   # Testing
   CYPRESS_RECORD_KEY
   PACT_BROKER_BASE_URL
   PACT_BROKER_TOKEN

   # Notifications
   SLACK_WEBHOOK

   # Security
   SNYK_TOKEN
   ```

3. **Environments**
   ```yaml
   development:
     url: https://dev.clenergize.com
     protection_rules: []

   staging:
     url: https://staging.clenergize.com
     protection_rules:
       - type: required_reviewers
         reviewers: ["@DevOps", "@Security"]

   production:
     url: https://clenergize.com
     protection_rules:
       - type: required_reviewers
         reviewers: ["@DevOps", "@Security", "@ProductOwner"]
       - type: wait_timer
         wait_timer: 30 # minutes
   ```

## Pipeline Stages Detailed

### 1. Security Scanning

**Purpose**: Identify vulnerabilities early in the pipeline

**Tools**:
- **Trivy**: Container and filesystem vulnerability scanning
- **npm audit**: Node.js dependency vulnerabilities
- **OWASP Dependency Check**: Known vulnerable components
- **Snyk**: Real-time vulnerability database

**Configuration**:
```yaml
# Trivy configuration (.trivy.yaml)
severity:
  - CRITICAL
  - HIGH
ignore-unfixed: true
exit-code: 1
format: sarif
db:
  repository: ghcr.io/aquasecurity/trivy-db
java-db:
  repository: ghcr.io/aquasecurity/trivy-java-db
```

**Failure Criteria**:
- Any CRITICAL vulnerabilities
- More than 5 HIGH vulnerabilities
- npm audit high/critical findings

### 2. Code Quality

**Purpose**: Ensure code meets quality standards

**Tools**:
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **SonarCloud**: Code quality metrics
- **CodeClimate**: Maintainability analysis

**ESLint Configuration**:
```javascript
// .eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:security/recommended',
    'prettier'
  ],
  rules: {
    'no-console': 'error',
    'no-debugger': 'error',
    'security/detect-object-injection': 'warn',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn'
  }
};
```

**Quality Gates**:
- Code coverage > 80%
- Technical debt ratio < 5%
- No security hotspots
- Maintainability rating >= B

### 3. Unit Tests

**Purpose**: Validate individual components

**Framework**: Jest with TypeScript

**Coverage Requirements**:
```json
{
  "collectCoverageFrom": [
    "src/**/*.{js,ts}",
    "!src/**/*.spec.{js,ts}",
    "!src/**/index.{js,ts}"
  ],
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```

**Test Structure**:
```typescript
describe('Service', () => {
  describe('Method', () => {
    it('should handle happy path', () => {});
    it('should handle edge cases', () => {});
    it('should handle error conditions', () => {});
  });
});
```

### 4. Integration Tests

**Purpose**: Validate service interactions

**Setup**: TestContainers for dependencies

```typescript
// test/integration/setup.ts
import { MongoDBContainer } from '@testcontainers/mongodb';
import { RedisContainer } from '@testcontainers/redis';

let mongoContainer: MongoDBContainer;
let redisContainer: RedisContainer;

beforeAll(async () => {
  mongoContainer = await new MongoDBContainer().start();
  redisContainer = await new RedisContainer().start();

  process.env.MONGODB_URI = mongoContainer.getConnectionString();
  process.env.REDIS_URL = redisContainer.getConnectionString();
});

afterAll(async () => {
  await mongoContainer.stop();
  await redisContainer.stop();
});
```

### 5. Contract Tests (Pact)

**Purpose**: Ensure API compatibility between services

**Consumer Test Example**:
```typescript
// organization-service/test/contract/identity-consumer.spec.ts
describe('Organization Service consuming Identity Service', () => {
  const provider = new Pact({
    consumer: 'OrganizationService',
    provider: 'IdentityService'
  });

  beforeAll(() => provider.setup());
  afterAll(() => provider.finalize());

  test('get user by ID', async () => {
    await provider.addInteraction({
      state: 'user 123 exists',
      uponReceiving: 'a request for user 123',
      withRequest: {
        method: 'GET',
        path: '/v1/users/123',
        headers: { Authorization: 'Bearer token' }
      },
      willRespondWith: {
        status: 200,
        body: {
          id: '123',
          email: 'user@example.com',
          roles: ['USER']
        }
      }
    });

    const response = await getUserById('123');
    expect(response.email).toBe('user@example.com');
  });
});
```

### 6. Docker Image Building

**Multi-stage Dockerfile**:
```dockerfile
# Base stage
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Build stage
FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
COPY --from=base --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nodejs:nodejs /app/dist ./dist
USER nodejs
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

**Image Scanning**:
```bash
# Scan built image
trivy image clenergize/identity:latest

# Fail if vulnerabilities found
trivy image --exit-code 1 --severity CRITICAL,HIGH clenergize/identity:latest
```

### 7. E2E Tests (Cypress)

**Test Structure**:
```typescript
// cypress/e2e/auth/login.cy.ts
describe('Authentication Flow', () => {
  it('should login successfully', () => {
    cy.visit('/login');
    cy.get('[data-cy=email]').type('user@example.com');
    cy.get('[data-cy=password]').type('password123');
    cy.get('[data-cy=submit]').click();
    cy.url().should('include', '/dashboard');
    cy.get('[data-cy=welcome]').should('contain', 'Welcome');
  });

  it('should handle invalid credentials', () => {
    cy.visit('/login');
    cy.get('[data-cy=email]').type('invalid@example.com');
    cy.get('[data-cy=password]').type('wrong');
    cy.get('[data-cy=submit]').click();
    cy.get('[data-cy=error]').should('contain', 'Invalid credentials');
  });
});
```

**Cypress Configuration**:
```typescript
// cypress.config.ts
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    retries: {
      runMode: 2,
      openMode: 0
    }
  }
});
```

### 8. Performance Tests (K6)

**Load Test Script**:
```javascript
// tests/performance/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Spike
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% of requests under 200ms
    http_req_failed: ['rate<0.1'],    // Error rate under 10%
  },
};

export default function () {
  const response = http.get('https://dev.clenergize.com/api/v1/health');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
  sleep(1);
}
```

### 9. Deployment Strategies

**Blue-Green Deployment (Production)**:
```yaml
# Deploy to green environment
- name: Deploy to Green
  run: |
    aws ecs update-service \
      --cluster clenergize-prod-green \
      --service identity-service \
      --task-definition identity-service:${{ github.sha }}

# Health check
- name: Health Check Green
  run: |
    for i in {1..30}; do
      if curl -f https://green.clenergize.com/health; then
        echo "Green environment healthy"
        break
      fi
      sleep 10
    done

# Switch traffic
- name: Switch Traffic to Green
  run: |
    aws elbv2 modify-listener \
      --listener-arn ${{ secrets.PROD_LISTENER_ARN }} \
      --default-actions Type=forward,TargetGroupArn=${{ secrets.GREEN_TARGET_GROUP }}
```

**Canary Deployment (Staging)**:
```yaml
# Deploy canary version
- name: Deploy Canary
  run: |
    kubectl set image deployment/identity-service-canary \
      identity-service=${{ secrets.ECR_REGISTRY }}/identity:${{ github.sha }} \
      -n clenergize-staging

# Gradually increase traffic
- name: Canary Rollout
  run: |
    kubectl patch service identity-service -n clenergize-staging \
      -p '{"spec":{"selector":{"version":"canary"},"weight":10}}'
    sleep 300 # Monitor for 5 minutes

    kubectl patch service identity-service -n clenergize-staging \
      -p '{"spec":{"selector":{"version":"canary"},"weight":50}}'
    sleep 300 # Monitor for 5 minutes

    kubectl patch service identity-service -n clenergize-staging \
      -p '{"spec":{"selector":{"version":"canary"},"weight":100}}'
```

## Monitoring & Alerts

### Pipeline Metrics
```yaml
# Datadog monitoring
- name: Send Metrics to Datadog
  uses: DataDog/datadog-actions-metrics@v1
  with:
    api-key: ${{ secrets.DD_API_KEY }}
    metrics: |
      - type: gauge
        name: ci.pipeline.duration
        value: ${{ env.PIPELINE_DURATION }}
        tags:
          - service:${{ matrix.service }}
          - environment:${{ env.ENVIRONMENT }}
```

### Slack Notifications
```yaml
# Success notification
- name: Notify Success
  if: success()
  uses: 8398a7/action-slack@v3
  with:
    status: custom
    custom_payload: |
      {
        "text": "✅ Deployment Successful",
        "attachments": [{
          "color": "good",
          "fields": [
            {"title": "Service", "value": "${{ matrix.service }}", "short": true},
            {"title": "Version", "value": "${{ github.sha }}", "short": true},
            {"title": "Environment", "value": "${{ env.ENVIRONMENT }}", "short": true},
            {"title": "Deployed by", "value": "${{ github.actor }}", "short": true}
          ]
        }]
      }

# Failure notification
- name: Notify Failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: custom
    custom_payload: |
      {
        "text": "❌ Deployment Failed",
        "attachments": [{
          "color": "danger",
          "fields": [
            {"title": "Service", "value": "${{ matrix.service }}", "short": true},
            {"title": "Failed Job", "value": "${{ github.job }}", "short": true},
            {"title": "Error", "value": "${{ env.ERROR_MESSAGE }}", "short": false},
            {"title": "Link", "value": "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}", "short": false}
          ]
        }]
      }
```

## Rollback Procedures

### Automatic Rollback Triggers
- Health check failures (3 consecutive)
- Error rate > 10%
- Response time > 500ms (p95)
- Memory usage > 90%

### Manual Rollback
```bash
# Rollback to previous version
gh workflow run rollback.yml \
  -f service=identity-service \
  -f environment=production \
  -f version=previous

# Rollback to specific version
gh workflow run rollback.yml \
  -f service=identity-service \
  -f environment=production \
  -f version=abc123def
```

## Security Best Practices

### Secret Management
1. Never commit secrets to repository
2. Use GitHub Secrets for sensitive data
3. Rotate secrets every 90 days
4. Use least-privilege IAM roles

### Image Security
1. Use specific image tags (never `latest` in production)
2. Scan all images before deployment
3. Use minimal base images (Alpine)
4. Run containers as non-root user

### Pipeline Security
1. Require approval for production deployments
2. Sign commits with GPG keys
3. Enable branch protection rules
4. Audit pipeline access logs

## Troubleshooting

### Common Issues

**1. Docker build failures**
```bash
# Clear Docker cache
docker system prune -a

# Build with no cache
docker build --no-cache -t service:latest .
```

**2. Test failures in CI but not locally**
```bash
# Run tests in CI environment
docker run --rm \
  -v $(pwd):/app \
  -w /app \
  node:20-alpine \
  npm test
```

**3. Deployment timeouts**
```bash
# Check service logs
aws ecs describe-services \
  --cluster clenergize-dev \
  --services identity-service \
  --query 'services[0].events[0:5]'

# Check task status
aws ecs describe-tasks \
  --cluster clenergize-dev \
  --tasks $(aws ecs list-tasks --cluster clenergize-dev --service-name identity-service --query 'taskArns[0]' --output text)
```

## Performance Optimization

### Caching Strategies
```yaml
# Cache dependencies
- name: Cache node modules
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-

# Cache Docker layers
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v3
  with:
    driver-opts: |
      image=moby/buildkit:latest
      network=host
    buildkitd-flags: |
      --allow-insecure-entitlement network.host
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

### Parallel Execution
```yaml
# Run tests in parallel
strategy:
  matrix:
    service: [identity, organization, reference, activity, calculation, reporting, audit]
  max-parallel: 4
```

## Cost Optimization

### GitHub Actions Minutes
- Use self-hosted runners for long-running tests
- Cancel redundant workflows
- Use conditional steps

### AWS Resources
- Use spot instances for test environments
- Schedule dev environment shutdown
- Clean up old Docker images

## Maintenance

### Weekly Tasks
- Review failed pipelines
- Update dependencies
- Rotate secrets
- Clean up artifacts

### Monthly Tasks
- Review pipeline performance
- Update security policies
- Audit access logs
- Cost analysis

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [AWS ECS Deployment](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/deployment-types.html)
- [Kubernetes Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)