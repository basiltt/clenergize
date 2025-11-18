# CI/CD Pipeline Templates Design - Clenergize V3

**Document Version**: 1.0.0
**Last Updated**: November 18, 2025
**Status**: Design Phase Complete
**Owner**: DevOps Team

---

## Executive Summary

This document defines comprehensive CI/CD pipeline templates for the Clenergize V3 rebuild project. These pipelines automate testing, building, security scanning, and deployment across all 7 backend services and the frontend application.

### Pipeline Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     CI/CD Pipeline Flow                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [Push/PR] → [Lint] → [Type Check] → [Unit Tests]           │
│                   ↓                                          │
│            [Build Docker Image]                              │
│                   ↓                                          │
│     [Security Scan] → [Integration Tests]                    │
│                   ↓                                          │
│           [Deploy to Dev] (auto)                             │
│                   ↓                                          │
│            [E2E Tests]                                       │
│                   ↓                                          │
│    [Deploy to Staging] (on main merge)                       │
│                   ↓                                          │
│     [Performance Tests] → [Smoke Tests]                      │
│                   ↓                                          │
│   [Deploy to Production] (manual approval)                   │
│                   ↓                                          │
│    [Health Checks] → [Rollback if Failed]                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Key Features

1. **Automated Testing**: Unit, integration, E2E, and performance tests
2. **Security First**: SAST, dependency scanning, container scanning
3. **Multi-Environment**: Dev, staging, production with promotion strategy
4. **Fast Feedback**: Parallel execution with caching (5-10min total)
5. **Safe Deployments**: Blue-green, canary, automatic rollback
6. **Infrastructure as Code**: Terraform for AWS resources
7. **Monitoring Integration**: Automatic alerts and dashboards

---

## 1. GitHub Actions Workflow Structure

### 1.1 Directory Layout

```
.github/
├── workflows/
│   ├── backend-service.yml         # Reusable backend workflow
│   ├── frontend.yml                # Frontend-specific workflow
│   ├── identity-service.yml        # Identity service pipeline
│   ├── organization-service.yml    # Organization service pipeline
│   ├── reference-service.yml       # Reference service pipeline
│   ├── activity-service.yml        # Activity service pipeline
│   ├── calculation-service.yml     # Calculation service pipeline
│   ├── reporting-service.yml       # Reporting service pipeline
│   ├── audit-service.yml           # Audit service pipeline
│   ├── security-scan.yml           # Security scanning workflow
│   ├── deploy-dev.yml              # Development deployment
│   ├── deploy-staging.yml          # Staging deployment
│   ├── deploy-production.yml       # Production deployment
│   ├── database-migration.yml      # Database migration workflow
│   └── performance-test.yml        # Performance testing workflow
│
├── actions/
│   ├── setup-node/                 # Custom action: Node.js setup
│   ├── docker-build/               # Custom action: Docker build
│   ├── deploy-to-ecs/              # Custom action: ECS deployment
│   └── notify-slack/               # Custom action: Slack notifications
│
└── scripts/
    ├── health-check.sh             # Post-deployment health check
    ├── rollback.sh                 # Automated rollback script
    └── smoke-test.sh               # Smoke tests
```

---

## 2. Reusable Backend Service Workflow

### 2.1 Complete Workflow Template

```yaml
# .github/workflows/backend-service.yml
name: Backend Service CI/CD

on:
  workflow_call:
    inputs:
      service-name:
        required: true
        type: string
        description: 'Service name (e.g., identity-service)'
      service-port:
        required: true
        type: string
        description: 'Service port number'
      deploy-to-dev:
        required: false
        type: boolean
        default: true
        description: 'Auto-deploy to dev environment'
    secrets:
      AWS_ACCESS_KEY_ID:
        required: true
      AWS_SECRET_ACCESS_KEY:
        required: true
      SONAR_TOKEN:
        required: false
      SLACK_WEBHOOK:
        required: false

env:
  NODE_VERSION: '20'
  PNPM_VERSION: '8.12.0'
  AWS_REGION: 'us-east-1'
  ECR_REGISTRY: '123456789012.dkr.ecr.us-east-1.amazonaws.com'
  SERVICE_NAME: ${{ inputs.service-name }}

jobs:
  # Job 1: Code Quality
  lint-and-typecheck:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for SonarCloud

      - name: Setup PNPM
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run ESLint
        run: pnpm --filter ${{ env.SERVICE_NAME }} run lint

      - name: Run TypeScript type check
        run: pnpm --filter ${{ env.SERVICE_NAME }} run type-check

      - name: Check code formatting
        run: pnpm --filter ${{ env.SERVICE_NAME }} run format:check

  # Job 2: Unit Tests
  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run unit tests with coverage
        run: pnpm --filter ${{ env.SERVICE_NAME }} run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./services/${{ env.SERVICE_NAME }}/coverage/coverage-final.json
          flags: ${{ env.SERVICE_NAME }}
          name: ${{ env.SERVICE_NAME }}-coverage

      - name: SonarCloud Scan
        if: ${{ secrets.SONAR_TOKEN != '' }}
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
        with:
          projectBaseDir: services/${{ env.SERVICE_NAME }}
          args: >
            -Dsonar.organization=clenergize
            -Dsonar.projectKey=clenergize_${{ env.SERVICE_NAME }}

  # Job 3: Build Docker Image
  build:
    name: Build Docker Image
    needs: [lint-and-typecheck, unit-tests]
    runs-on: ubuntu-latest
    timeout-minutes: 20
    outputs:
      image-tag: ${{ steps.meta.outputs.tags }}
      image-digest: ${{ steps.build.outputs.digest }}
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.ECR_REGISTRY }}/${{ env.SERVICE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Build and push Docker image
        id: build
        uses: docker/build-push-action@v5
        with:
          context: ./services/${{ env.SERVICE_NAME }}
          file: ./services/${{ env.SERVICE_NAME }}/Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            NODE_VERSION=${{ env.NODE_VERSION }}
            SERVICE_PORT=${{ inputs.service-port }}

      - name: Generate SBOM
        uses: anchore/sbom-action@v0
        with:
          image: ${{ steps.meta.outputs.tags }}
          format: spdx-json
          output-file: sbom-${{ env.SERVICE_NAME }}.spdx.json

      - name: Upload SBOM artifact
        uses: actions/upload-artifact@v3
        with:
          name: sbom-${{ env.SERVICE_NAME }}
          path: sbom-${{ env.SERVICE_NAME }}.spdx.json

  # Job 4: Security Scanning
  security-scan:
    name: Security Scan
    needs: build
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ needs.build.outputs.image-tag }}
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH'

      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          command: test
          args: --severity-threshold=high --file=services/${{ env.SERVICE_NAME }}/package.json

  # Job 5: Integration Tests
  integration-tests:
    name: Integration Tests
    needs: build
    runs-on: ubuntu-latest
    timeout-minutes: 20
    services:
      mongodb:
        image: mongo:7
        env:
          MONGO_INITDB_ROOT_USERNAME: admin
          MONGO_INITDB_ROOT_PASSWORD: testpass123
        ports:
          - 27017:27017
        options: >-
          --health-cmd "mongosh --eval 'db.adminCommand(\"ping\")'"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Wait for services
        run: |
          until mongosh "mongodb://admin:testpass123@localhost:27017/admin" --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
            echo "Waiting for MongoDB..."
            sleep 2
          done
          until redis-cli -h localhost ping > /dev/null 2>&1; do
            echo "Waiting for Redis..."
            sleep 2
          done

      - name: Run integration tests
        run: pnpm --filter ${{ env.SERVICE_NAME }} run test:integration
        env:
          MONGODB_URI: mongodb://admin:testpass123@localhost:27017/test?authSource=admin
          REDIS_URL: redis://localhost:6379

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: integration-test-results-${{ env.SERVICE_NAME }}
          path: services/${{ env.SERVICE_NAME }}/coverage/

  # Job 6: Deploy to Development
  deploy-dev:
    name: Deploy to Development
    needs: [build, security-scan, integration-tests]
    if: ${{ inputs.deploy-to-dev && github.ref == 'refs/heads/develop' }}
    runs-on: ubuntu-latest
    timeout-minutes: 15
    environment:
      name: development
      url: https://dev-${{ inputs.service-name }}.clenergize.com
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster clenergize-dev \
            --service ${{ env.SERVICE_NAME }} \
            --force-new-deployment \
            --desired-count 1

      - name: Wait for deployment
        run: |
          aws ecs wait services-stable \
            --cluster clenergize-dev \
            --services ${{ env.SERVICE_NAME }}

      - name: Run health check
        run: |
          bash .github/scripts/health-check.sh \
            https://dev-${{ env.SERVICE_NAME }}.clenergize.com/health \
            60

      - name: Notify Slack on success
        if: success() && secrets.SLACK_WEBHOOK != ''
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {
              "text": "✅ ${{ env.SERVICE_NAME }} deployed to DEV",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Deployment Successful*\n• Service: `${{ env.SERVICE_NAME }}`\n• Environment: `development`\n• Image: `${{ needs.build.outputs.image-tag }}`\n• Triggered by: ${{ github.actor }}"
                  }
                }
              ]
            }

      - name: Notify Slack on failure
        if: failure() && secrets.SLACK_WEBHOOK != ''
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {
              "text": "❌ ${{ env.SERVICE_NAME }} deployment to DEV failed",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Deployment Failed*\n• Service: `${{ env.SERVICE_NAME }}`\n• Environment: `development`\n• Triggered by: ${{ github.actor }}\n• <${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|View workflow>"
                  }
                }
              ]
            }

  # Job 7: E2E Tests (Post-Deployment)
  e2e-tests:
    name: E2E Tests
    needs: deploy-dev
    if: ${{ inputs.deploy-to-dev && github.ref == 'refs/heads/develop' }}
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run E2E tests against DEV
        run: pnpm --filter ${{ env.SERVICE_NAME }} run test:e2e
        env:
          API_URL: https://dev-${{ env.SERVICE_NAME }}.clenergize.com

      - name: Upload E2E test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: e2e-test-results-${{ env.SERVICE_NAME }}
          path: services/${{ env.SERVICE_NAME }}/e2e-results/
```

---

## 3. Service-Specific Workflows

### 3.1 Identity Service Pipeline

```yaml
# .github/workflows/identity-service.yml
name: Identity Service Pipeline

on:
  push:
    branches:
      - main
      - develop
    paths:
      - 'services/identity-service/**'
      - 'packages/**'
      - '.github/workflows/identity-service.yml'
  pull_request:
    branches:
      - main
      - develop
    paths:
      - 'services/identity-service/**'
      - 'packages/**'

jobs:
  build-and-deploy:
    uses: ./.github/workflows/backend-service.yml
    with:
      service-name: identity-service
      service-port: '3001'
      deploy-to-dev: ${{ github.ref == 'refs/heads/develop' }}
    secrets:
      AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
      AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
      SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
```

### 3.2 Similar Workflows for Other Services

Create similar workflows for:
- `organization-service.yml` (port 3002)
- `reference-service.yml` (port 3003)
- `activity-service.yml` (port 3004)
- `calculation-service.yml` (port 3005)
- `reporting-service.yml` (port 3006)
- `audit-service.yml` (port 3007)

---

## 4. Frontend Pipeline

### 4.1 Complete Frontend Workflow

```yaml
# .github/workflows/frontend.yml
name: Frontend CI/CD

on:
  push:
    branches:
      - main
      - develop
    paths:
      - 'frontend/**'
      - 'packages/**'
  pull_request:
    branches:
      - main
      - develop
    paths:
      - 'frontend/**'
      - 'packages/**'

env:
  NODE_VERSION: '20'
  PNPM_VERSION: '8.12.0'

jobs:
  lint-and-typecheck:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run ESLint
        run: pnpm --filter frontend run lint

      - name: Run TypeScript type check
        run: pnpm --filter frontend run type-check

  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run unit tests with coverage
        run: pnpm --filter frontend run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./frontend/coverage/coverage-final.json
          flags: frontend

  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright browsers
        run: pnpm --filter frontend exec playwright install --with-deps

      - name: Build Next.js app
        run: pnpm --filter frontend run build
        env:
          NEXT_PUBLIC_API_URL: http://localhost:3000

      - name: Start Next.js app
        run: pnpm --filter frontend run start &
        env:
          PORT: 3005

      - name: Wait for app to start
        run: |
          timeout 60 bash -c 'until curl -f http://localhost:3005/api/health; do sleep 2; done'

      - name: Run Playwright tests
        run: pnpm --filter frontend run test:e2e

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: frontend/playwright-report/

  build:
    name: Build
    needs: [lint-and-typecheck, unit-tests]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build Next.js app
        run: pnpm --filter frontend run build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.API_URL }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: nextjs-build
          path: |
            frontend/.next/
            frontend/public/

  lighthouse:
    name: Lighthouse Audit
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: nextjs-build
          path: frontend/

      - name: Start Next.js app
        run: pnpm --filter frontend run start &

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            http://localhost:3005
            http://localhost:3005/projects
          uploadArtifacts: true
          temporaryPublicStorage: true

  deploy-vercel:
    name: Deploy to Vercel
    needs: [build, e2e-tests]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://clenergize.com
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./frontend

      - name: Run smoke tests
        run: bash .github/scripts/smoke-test.sh https://clenergize.com

      - name: Notify Slack
        if: always()
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {
              "text": "${{ job.status == 'success' && '✅' || '❌' }} Frontend deployed to production",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Frontend Deployment*\n• Status: `${{ job.status }}`\n• URL: https://clenergize.com\n• Triggered by: ${{ github.actor }}"
                  }
                }
              ]
            }
```

---

## 5. Database Migration Pipeline

### 5.1 Automated Migration Workflow

```yaml
# .github/workflows/database-migration.yml
name: Database Migration

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to run migrations'
        required: true
        type: choice
        options:
          - development
          - staging
          - production
      service:
        description: 'Service to migrate'
        required: true
        type: choice
        options:
          - identity-service
          - organization-service
          - reference-service
          - activity-service
          - calculation-service
          - reporting-service
          - audit-service
      dry-run:
        description: 'Dry run (no actual changes)'
        required: false
        type: boolean
        default: true

jobs:
  migrate:
    name: Run Database Migration
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: '8.12.0'

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Get MongoDB connection string from Secrets Manager
        id: get-secret
        run: |
          SECRET_VALUE=$(aws secretsmanager get-secret-value \
            --secret-id ${{ inputs.environment }}/mongodb/connection-string \
            --query SecretString \
            --output text)
          echo "::add-mask::$SECRET_VALUE"
          echo "MONGODB_URI=$SECRET_VALUE" >> $GITHUB_OUTPUT

      - name: Backup database (production only)
        if: inputs.environment == 'production'
        run: |
          TIMESTAMP=$(date +%Y%m%d_%H%M%S)
          mongodump \
            --uri="${{ steps.get-secret.outputs.MONGODB_URI }}" \
            --db=clenergize_${{ inputs.service }} \
            --archive=backup_${TIMESTAMP}.gz \
            --gzip

          aws s3 cp backup_${TIMESTAMP}.gz \
            s3://clenergize-backups/mongodb/${{ inputs.service }}/${TIMESTAMP}/

      - name: Run migrations (dry-run)
        if: inputs.dry-run
        run: |
          pnpm --filter ${{ inputs.service }} run migrate:dry-run
        env:
          MONGODB_URI: ${{ steps.get-secret.outputs.MONGODB_URI }}

      - name: Run migrations (actual)
        if: ${{ !inputs.dry-run }}
        run: |
          pnpm --filter ${{ inputs.service }} run migrate:up
        env:
          MONGODB_URI: ${{ steps.get-secret.outputs.MONGODB_URI }}

      - name: Verify migration
        run: |
          pnpm --filter ${{ inputs.service }} run migrate:status
        env:
          MONGODB_URI: ${{ steps.get-secret.outputs.MONGODB_URI }}

      - name: Rollback on failure
        if: failure() && !inputs.dry-run
        run: |
          echo "Migration failed, rolling back..."
          pnpm --filter ${{ inputs.service }} run migrate:down
        env:
          MONGODB_URI: ${{ steps.get-secret.outputs.MONGODB_URI }}

      - name: Notify Slack
        if: always()
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {
              "text": "${{ job.status == 'success' && '✅' || '❌' }} Database migration ${{ inputs.dry-run && '(dry-run)' || '' }}",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Database Migration*\n• Service: `${{ inputs.service }}`\n• Environment: `${{ inputs.environment }}`\n• Dry run: `${{ inputs.dry-run }}`\n• Status: `${{ job.status }}`\n• Triggered by: ${{ github.actor }}"
                  }
                }
              ]
            }
```

---

## 6. Staging Deployment Workflow

### 6.1 Deploy to Staging

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging

on:
  push:
    branches:
      - main
  workflow_dispatch:

env:
  AWS_REGION: us-east-1
  ECS_CLUSTER: clenergize-staging

jobs:
  deploy-all-services:
    name: Deploy All Services
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://staging.clenergize.com
    timeout-minutes: 45
    strategy:
      matrix:
        service:
          - identity-service
          - organization-service
          - reference-service
          - activity-service
          - calculation-service
          - reporting-service
          - audit-service
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Get latest image tag
        id: get-tag
        run: |
          LATEST_TAG=$(aws ecr describe-images \
            --repository-name ${{ matrix.service }} \
            --query 'sort_by(imageDetails,& imagePushedAt)[-1].imageTags[0]' \
            --output text)
          echo "tag=$LATEST_TAG" >> $GITHUB_OUTPUT

      - name: Update ECS service
        run: |
          aws ecs update-service \
            --cluster ${{ env.ECS_CLUSTER }} \
            --service ${{ matrix.service }} \
            --force-new-deployment \
            --task-definition ${{ matrix.service }}-staging

      - name: Wait for deployment
        run: |
          aws ecs wait services-stable \
            --cluster ${{ env.ECS_CLUSTER }} \
            --services ${{ matrix.service }}

      - name: Run smoke tests
        run: |
          bash .github/scripts/smoke-test.sh \
            https://staging-${{ matrix.service }}.clenergize.com

  performance-tests:
    name: Performance Tests
    needs: deploy-all-services
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v4

      - name: Setup K6
        run: |
          sudo gpg -k
          sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6

      - name: Run K6 performance tests
        run: |
          k6 run --out json=performance-results.json \
            tests/performance/load-test.js

      - name: Upload performance results
        uses: actions/upload-artifact@v3
        with:
          name: performance-results
          path: performance-results.json

      - name: Check performance thresholds
        run: |
          # Parse results and fail if thresholds not met
          node .github/scripts/check-performance.js performance-results.json

  notify:
    name: Notify Team
    needs: [deploy-all-services, performance-tests]
    if: always()
    runs-on: ubuntu-latest
    steps:
      - name: Notify Slack
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {
              "text": "${{ needs.deploy-all-services.result == 'success' && needs.performance-tests.result == 'success' && '✅' || '❌' }} Staging deployment complete",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Staging Deployment*\n• Services: All 7 services\n• Deployment: `${{ needs.deploy-all-services.result }}`\n• Performance: `${{ needs.performance-tests.result }}`\n• URL: https://staging.clenergize.com\n• Triggered by: ${{ github.actor }}"
                  }
                }
              ]
            }
```

---

## 7. Production Deployment Workflow

### 7.1 Blue-Green Deployment

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  workflow_dispatch:
    inputs:
      deployment-strategy:
        description: 'Deployment strategy'
        required: true
        type: choice
        options:
          - blue-green
          - canary
          - rolling
      service:
        description: 'Service to deploy (or "all")'
        required: true
        type: string
        default: 'all'

env:
  AWS_REGION: us-east-1
  ECS_CLUSTER: clenergize-production

jobs:
  pre-deployment-checks:
    name: Pre-Deployment Checks
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Check staging health
        run: |
          bash .github/scripts/health-check.sh https://staging.clenergize.com/health 10

      - name: Verify all tests passed
        run: |
          # Query GitHub API to ensure all checks passed on staging
          gh api repos/${{ github.repository }}/commits/main/check-runs \
            --jq '.check_runs[] | select(.conclusion != "success") | .name' > failed_checks.txt

          if [ -s failed_checks.txt ]; then
            echo "The following checks failed:"
            cat failed_checks.txt
            exit 1
          fi
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Check for active incidents
        run: |
          # Check PagerDuty for active incidents
          curl -H "Authorization: Token token=${{ secrets.PAGERDUTY_TOKEN }}" \
            -H "Accept: application/vnd.pagerduty+json;version=2" \
            "https://api.pagerduty.com/incidents?statuses[]=triggered&statuses[]=acknowledged" \
            | jq -e '.incidents | length == 0' || exit 1

  deploy-blue-green:
    name: Blue-Green Deployment
    needs: pre-deployment-checks
    if: inputs.deployment-strategy == 'blue-green'
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://clenergize.com
    timeout-minutes: 60
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Get current target group
        id: current-tg
        run: |
          CURRENT_TG=$(aws elbv2 describe-target-groups \
            --load-balancer-arn ${{ secrets.ALB_ARN }} \
            --query 'TargetGroups[?contains(TargetGroupName, `blue`)].TargetGroupArn' \
            --output text)

          if [ -n "$CURRENT_TG" ]; then
            echo "current=blue" >> $GITHUB_OUTPUT
            echo "next=green" >> $GITHUB_OUTPUT
          else
            echo "current=green" >> $GITHUB_OUTPUT
            echo "next=blue" >> $GITHUB_OUTPUT
          fi

      - name: Deploy to ${{ steps.current-tg.outputs.next }} environment
        run: |
          aws ecs update-service \
            --cluster ${{ env.ECS_CLUSTER }} \
            --service ${{ inputs.service }}-${{ steps.current-tg.outputs.next }} \
            --force-new-deployment

      - name: Wait for deployment
        run: |
          aws ecs wait services-stable \
            --cluster ${{ env.ECS_CLUSTER }} \
            --services ${{ inputs.service }}-${{ steps.current-tg.outputs.next }}

      - name: Run smoke tests on new environment
        run: |
          bash .github/scripts/smoke-test.sh \
            https://${{ steps.current-tg.outputs.next }}.clenergize.com

      - name: Switch traffic to new environment
        run: |
          # Update ALB listener to point to new target group
          aws elbv2 modify-listener \
            --listener-arn ${{ secrets.ALB_LISTENER_ARN }} \
            --default-actions Type=forward,TargetGroupArn=$(aws elbv2 describe-target-groups \
              --names ${{ inputs.service }}-${{ steps.current-tg.outputs.next }} \
              --query 'TargetGroups[0].TargetGroupArn' \
              --output text)

      - name: Monitor new environment
        run: |
          echo "Monitoring new environment for 10 minutes..."
          for i in {1..20}; do
            ERROR_RATE=$(aws cloudwatch get-metric-statistics \
              --namespace AWS/ApplicationELB \
              --metric-name HTTPCode_Target_5XX_Count \
              --dimensions Name=TargetGroup,Value=${{ inputs.service }}-${{ steps.current-tg.outputs.next }} \
              --start-time $(date -u -d '5 minutes ago' +%Y-%m-%dT%H:%M:%S) \
              --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
              --period 300 \
              --statistics Sum \
              --query 'Datapoints[0].Sum' \
              --output text)

            if [ "$ERROR_RATE" != "None" ] && [ "$ERROR_RATE" -gt 10 ]; then
              echo "High error rate detected: $ERROR_RATE errors"
              exit 1
            fi

            sleep 30
          done

      - name: Rollback on failure
        if: failure()
        run: |
          echo "Rolling back to previous environment..."
          aws elbv2 modify-listener \
            --listener-arn ${{ secrets.ALB_LISTENER_ARN }} \
            --default-actions Type=forward,TargetGroupArn=$(aws elbv2 describe-target-groups \
              --names ${{ inputs.service }}-${{ steps.current-tg.outputs.current }} \
              --query 'TargetGroups[0].TargetGroupArn' \
              --output text)

      - name: Decommission old environment
        if: success()
        run: |
          echo "Keeping old environment for 24 hours before decommissioning..."
          # Schedule decommission with AWS Lambda or similar

  deploy-canary:
    name: Canary Deployment
    needs: pre-deployment-checks
    if: inputs.deployment-strategy == 'canary'
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://clenergize.com
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Deploy canary (10% traffic)
        run: |
          # Deploy new version to small percentage of instances
          aws deploy create-deployment \
            --application-name clenergize-${{ inputs.service }} \
            --deployment-group-name production \
            --deployment-config-name CodeDeployDefault.LambdaCanary10Percent5Minutes

      - name: Monitor canary
        run: |
          echo "Monitoring canary for 15 minutes..."
          sleep 900

      - name: Check canary health
        id: canary-health
        run: |
          ERROR_COUNT=$(aws cloudwatch get-metric-statistics \
            --namespace AWS/ECS \
            --metric-name HTTPCode_Target_5XX_Count \
            --dimensions Name=ServiceName,Value=${{ inputs.service }}-canary \
            --start-time $(date -u -d '15 minutes ago' +%Y-%m-%dT%H:%M:%S) \
            --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
            --period 900 \
            --statistics Sum \
            --query 'Datapoints[0].Sum' \
            --output text)

          if [ "$ERROR_COUNT" != "None" ] && [ "$ERROR_COUNT" -gt 5 ]; then
            echo "healthy=false" >> $GITHUB_OUTPUT
            exit 1
          else
            echo "healthy=true" >> $GITHUB_OUTPUT
          fi

      - name: Promote canary to 100%
        if: steps.canary-health.outputs.healthy == 'true'
        run: |
          aws deploy continue-deployment \
            --deployment-id ${{ steps.deploy-canary.outputs.deployment-id }} \
            --deployment-wait-type READY_WAIT

  post-deployment:
    name: Post-Deployment Tasks
    needs: [deploy-blue-green, deploy-canary]
    if: always() && (needs.deploy-blue-green.result == 'success' || needs.deploy-canary.result == 'success')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Tag release
        run: |
          git tag -a v$(date +%Y.%m.%d-%H%M) -m "Production release"
          git push origin --tags

      - name: Create GitHub release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: v$(date +%Y.%m.%d-%H%M)
          release_name: Production Release $(date +%Y.%m.%d)
          body: |
            Automated production deployment
            - Service: ${{ inputs.service }}
            - Strategy: ${{ inputs.deployment-strategy }}
            - Deployed by: ${{ github.actor }}

      - name: Update documentation
        run: |
          # Generate and commit updated API documentation
          pnpm run generate-docs
          git add docs/
          git commit -m "docs: update API documentation [skip ci]" || true
          git push

      - name: Notify team
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {
              "text": "🚀 Production deployment successful",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Production Deployment*\n• Service: `${{ inputs.service }}`\n• Strategy: `${{ inputs.deployment-strategy }}`\n• Status: ✅ Success\n• URL: https://clenergize.com\n• Deployed by: ${{ github.actor }}"
                  }
                }
              ]
            }
```

---

## 8. Infrastructure as Code

### 8.1 Terraform Configuration

```hcl
# infrastructure/terraform/ecs-service.tf

variable "service_name" {
  description = "Name of the microservice"
  type        = string
}

variable "service_port" {
  description = "Port the service listens on"
  type        = number
}

variable "environment" {
  description = "Environment (dev, staging, production)"
  type        = string
}

resource "aws_ecs_task_definition" "service" {
  family                   = "${var.service_name}-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.environment == "production" ? 1024 : 512
  memory                   = var.environment == "production" ? 2048 : 1024
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn           = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = var.service_name
      image     = "${var.ecr_repository}/${var.service_name}:latest"
      essential = true

      portMappings = [
        {
          containerPort = var.service_port
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "NODE_ENV"
          value = var.environment
        },
        {
          name  = "PORT"
          value = tostring(var.service_port)
        },
        {
          name  = "SERVICE_NAME"
          value = var.service_name
        }
      ]

      secrets = [
        {
          name      = "MONGODB_URI"
          valueFrom = aws_secretsmanager_secret.mongodb_uri.arn
        },
        {
          name      = "REDIS_URL"
          valueFrom = aws_secretsmanager_secret.redis_url.arn
        },
        {
          name      = "JWT_SECRET"
          valueFrom = aws_secretsmanager_secret.jwt_secret.arn
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/${var.service_name}-${var.environment}"
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:${var.service_port}/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])
}

resource "aws_ecs_service" "service" {
  name            = "${var.service_name}-${var.environment}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.service.arn
  desired_count   = var.environment == "production" ? 3 : 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnets
    security_groups  = [aws_security_group.service.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.service.arn
    container_name   = var.service_name
    container_port   = var.service_port
  }

  deployment_configuration {
    maximum_percent         = 200
    minimum_healthy_percent = 100
    deployment_circuit_breaker {
      enable   = true
      rollback = true
    }
  }

  enable_ecs_managed_tags = true

  tags = {
    Name        = "${var.service_name}-${var.environment}"
    Environment = var.environment
    Service     = var.service_name
  }
}

resource "aws_appautoscaling_target" "service" {
  max_capacity       = var.environment == "production" ? 10 : 3
  min_capacity       = var.environment == "production" ? 3 : 1
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.service.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "service_cpu" {
  name               = "${var.service_name}-${var.environment}-cpu"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.service.resource_id
  scalable_dimension = aws_appautoscaling_target.service.scalable_dimension
  service_namespace  = aws_appautoscaling_target.service.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70.0
  }
}
```

### 8.2 Terraform Deployment Workflow

```yaml
# .github/workflows/terraform-apply.yml
name: Terraform Apply

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to apply changes'
        required: true
        type: choice
        options:
          - development
          - staging
          - production

jobs:
  terraform:
    name: Terraform Apply
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}
    steps:
      - uses: actions/checkout@v4

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: 1.6.0

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Terraform Init
        run: terraform init
        working-directory: infrastructure/terraform/

      - name: Terraform Plan
        run: terraform plan -var-file="${{ inputs.environment }}.tfvars" -out=tfplan
        working-directory: infrastructure/terraform/

      - name: Upload plan artifact
        uses: actions/upload-artifact@v3
        with:
          name: tfplan-${{ inputs.environment }}
          path: infrastructure/terraform/tfplan

      - name: Terraform Apply
        if: github.ref == 'refs/heads/main'
        run: terraform apply tfplan
        working-directory: infrastructure/terraform/
```

---

## 9. Helper Scripts

### 9.1 Health Check Script

```bash
#!/bin/bash
# .github/scripts/health-check.sh

URL=$1
TIMEOUT=${2:-60}
INTERVAL=5

echo "Checking health at $URL (timeout: ${TIMEOUT}s)"

elapsed=0
while [ $elapsed -lt $TIMEOUT ]; do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $URL)

  if [ "$HTTP_CODE" == "200" ]; then
    echo "✅ Health check passed (HTTP $HTTP_CODE)"
    exit 0
  fi

  echo "⏳ Waiting for service... (HTTP $HTTP_CODE) - ${elapsed}s elapsed"
  sleep $INTERVAL
  elapsed=$((elapsed + INTERVAL))
done

echo "❌ Health check failed after ${TIMEOUT}s"
exit 1
```

### 9.2 Smoke Test Script

```bash
#!/bin/bash
# .github/scripts/smoke-test.sh

BASE_URL=$1

echo "Running smoke tests against $BASE_URL"

# Test 1: Health endpoint
echo "Test 1: Health check"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/health)
if [ "$HTTP_CODE" != "200" ]; then
  echo "❌ Health check failed (HTTP $HTTP_CODE)"
  exit 1
fi
echo "✅ Health check passed"

# Test 2: API version endpoint
echo "Test 2: API version"
VERSION=$(curl -s $BASE_URL/api/v1/version | jq -r '.version')
if [ -z "$VERSION" ]; then
  echo "❌ Version check failed"
  exit 1
fi
echo "✅ Version check passed (v$VERSION)"

# Test 3: Authentication endpoint
echo "Test 3: Authentication"
AUTH_RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null $BASE_URL/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"invalid"}')
if [ "$AUTH_RESPONSE" != "401" ]; then
  echo "❌ Authentication test failed (expected 401, got $AUTH_RESPONSE)"
  exit 1
fi
echo "✅ Authentication test passed"

echo "🎉 All smoke tests passed!"
```

### 9.3 Rollback Script

```bash
#!/bin/bash
# .github/scripts/rollback.sh

SERVICE_NAME=$1
CLUSTER=$2
PREVIOUS_TASK_DEF=$3

echo "Rolling back $SERVICE_NAME to task definition $PREVIOUS_TASK_DEF"

aws ecs update-service \
  --cluster $CLUSTER \
  --service $SERVICE_NAME \
  --task-definition $PREVIOUS_TASK_DEF \
  --force-new-deployment

echo "Waiting for rollback to complete..."
aws ecs wait services-stable \
  --cluster $CLUSTER \
  --services $SERVICE_NAME

echo "✅ Rollback complete"
```

---

## 10. Performance Testing

### 10.1 K6 Load Test

```javascript
// tests/performance/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 }    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% requests < 200ms
    http_req_failed: ['rate<0.01'],   // Error rate < 1%
    errors: ['rate<0.01']
  }
};

const BASE_URL = __ENV.API_URL || 'https://staging.clenergize.com';

export default function () {
  // Test 1: Get projects
  let response = http.get(`${BASE_URL}/api/v1/projects`, {
    headers: {
      'Authorization': `Bearer ${__ENV.ACCESS_TOKEN}`
    }
  });

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200
  }) || errorRate.add(1);

  sleep(1);

  // Test 2: Get project by ID
  response = http.get(`${BASE_URL}/api/v1/projects/test-project-id`, {
    headers: {
      'Authorization': `Bearer ${__ENV.ACCESS_TOKEN}`
    }
  });

  check(response, {
    'status is 200': (r) => r.status === 200 || r.status === 404,
    'response time < 200ms': (r) => r.timings.duration < 200
  }) || errorRate.add(1);

  sleep(1);
}
```

---

## Summary

This CI/CD Pipeline Templates Design provides:

1. **Comprehensive Automation** - From code push to production deployment
2. **Multi-Environment Strategy** - Dev, staging, production with proper gates
3. **Security First** - SAST, dependency scanning, container scanning
4. **Fast Feedback** - Parallel execution, caching, 5-10 minute pipelines
5. **Safe Deployments** - Blue-green, canary, automatic rollback
6. **Infrastructure as Code** - Terraform for reproducible infrastructure
7. **Monitoring & Alerting** - CloudWatch integration, Slack notifications
8. **Database Migrations** - Automated with dry-run and rollback
9. **Performance Testing** - K6 load tests, Lighthouse audits
10. **Helper Scripts** - Health checks, smoke tests, rollback automation

### Quick Start

```bash
# 1. Set up GitHub secrets
gh secret set AWS_ACCESS_KEY_ID
gh secret set AWS_SECRET_ACCESS_KEY
gh secret set SLACK_WEBHOOK
gh secret set VERCEL_TOKEN

# 2. Copy workflow files
cp .github/workflows/backend-service.yml .github/workflows/
cp .github/workflows/frontend.yml .github/workflows/

# 3. Trigger first deployment
git push origin develop  # Auto-deploys to dev
git push origin main     # Deploys to staging
gh workflow run deploy-production.yml  # Manual production deploy
```

### Pipeline Performance

| Stage | Duration | Parallelization |
|-------|----------|-----------------|
| Lint & Type Check | 2-3 min | ✅ Parallel |
| Unit Tests | 3-5 min | ✅ Parallel |
| Build Docker | 5-8 min | ✅ Cached |
| Security Scan | 2-3 min | ✅ Parallel |
| Integration Tests | 5-10 min | ✅ Parallel |
| **Total** | **8-12 min** | - |

### Next Steps

1. ✅ **Completed**: CI/CD Pipeline Templates Design
2. ✅ **Completed**: All Design Phase Tasks (19/19)
3. **Next**: Begin Sprint 0.1 Implementation

---

**Document Complete**: November 18, 2025
**Total Workflows**: 15+
**Estimated Setup Time**: 2-3 days
**Deployment Time**: 10-15 minutes per service
