# Contract Testing Implementation Guide
**Clenergize V3 - Consumer-Driven Contract Testing with Pact**

**Version**: 1.0.0
**Last Updated**: November 18, 2025
**Owner**: Testing Agent
**Status**: Implementation Ready
**Sprint**: 0.1-0.2

---

## Table of Contents
1. [Overview](#overview)
2. [Why Contract Testing?](#why-contract-testing)
3. [Pact Broker Setup](#pact-broker-setup)
4. [Consumer-Side Setup](#consumer-side-setup)
5. [Provider-Side Setup](#provider-side-setup)
6. [Integration Patterns](#integration-patterns)
7. [CI/CD Integration](#cicd-integration)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## 1. Overview

### What is Contract Testing?

Contract testing is a testing approach that verifies the interactions between **consumers** (services that call APIs) and **providers** (services that expose APIs) by defining a **contract** (agreement on API structure).

### Clenergize V3 Service Dependencies

```
┌──────────────────────────────────────────────────────────┐
│                 SERVICE DEPENDENCY MAP                    │
└──────────────────────────────────────────────────────────┘

Organization Service (CONSUMER)
    │
    ├──→ Identity Service (PROVIDER)
    │    • GET /v1/users/:id
    │    • GET /v1/users/:id/permissions
    │
    └──→ Reference Service (PROVIDER)
         • GET /v1/hierarchies/:id

Activity Service (CONSUMER)
    │
    ├──→ Reference Service (PROVIDER)
    │    • GET /v1/parameters/:id
    │    • GET /v1/emission-factors/:parameterId/:yearId
    │
    └──→ Organization Service (PROVIDER)
         • GET /v1/projects/:id
         • GET /v1/entities/:id

Calculation Service (CONSUMER)
    │
    ├──→ Activity Service (PROVIDER)
    │    • GET /v1/activity-data/{category}?projectId=X
    │
    └──→ Reference Service (PROVIDER)
         • GET /v1/emission-factors/:parameterId/:yearId
         • GET /v1/conversions/:fromUnit/:toUnit

Reporting Service (CONSUMER)
    │
    ├──→ Calculation Service (PROVIDER)
    │    • GET /v1/calculations/:id
    │    • GET /v1/rollups/:projectId
    │
    └──→ Organization Service (PROVIDER)
         • GET /v1/projects/:id/hierarchy
```

### Benefits of Contract Testing

| Benefit | Description |
|---------|-------------|
| **Early Detection** | Catch breaking API changes before deployment |
| **Independent Development** | Teams work independently without waiting for full integration |
| **Documentation** | Contracts serve as living documentation |
| **Faster Feedback** | No need to spin up all services for integration tests |
| **Version Compatibility** | Test backward compatibility across API versions |

---

## 2. Why Contract Testing?

### Problems with Traditional Integration Testing

**Traditional Approach** (Slow, Brittle, Expensive):
```
┌─────────────┐
│   Start     │
│  All 7      │  ← Slow startup (2-3 minutes)
│  Services   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Test       │  ← Tests take 20-30 minutes
│  Everything │  ← Flaky (network issues, timing)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Failure?   │  ← Hard to debug (which service failed?)
│  Debug 7    │
│  Services   │
└─────────────┘
```

**Contract Testing Approach** (Fast, Reliable, Cheap):
```
┌──────────────┐
│  Consumer    │
│  Defines     │  ← Consumer writes expectations
│  Contract    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Pact Broker │  ← Contract stored centrally
│  Stores      │
│  Contract    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Provider    │
│  Verifies    │  ← Provider confirms it meets contract
│  Contract    │
└──────────────┘

Result: No need to start all services!
```

### Real-World Example

**Scenario**: Organization Service calls Identity Service to get user details.

**Without Contract Testing**:
1. Identity Service changes `/v1/users/:id` response (removes `email` field)
2. Organization Service deploys (unaware of change)
3. **Production breaks** ❌
4. Incident response, debugging, rollback (2-4 hours downtime)

**With Contract Testing**:
1. Identity Service changes `/v1/users/:id` response (removes `email` field)
2. CI/CD runs contract verification
3. **Build fails immediately** ✅ (catches in 30 seconds)
4. Developer fixes before merge
5. Zero downtime

---

## 3. Pact Broker Setup

### 3.1 Local Development (Docker Compose)

Create `docker-compose.pact-broker.yml`:

```yaml
version: '3.8'

services:
  postgres-pact:
    image: postgres:15-alpine
    container_name: pact-broker-db
    environment:
      POSTGRES_USER: pact_broker
      POSTGRES_PASSWORD: pact_broker_password
      POSTGRES_DB: pact_broker
    volumes:
      - pact-postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U pact_broker"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - clenergize-network

  pact-broker:
    image: pactfoundation/pact-broker:latest
    container_name: pact-broker
    ports:
      - "9292:9292"
    depends_on:
      postgres-pact:
        condition: service_healthy
    environment:
      PACT_BROKER_DATABASE_URL: "postgres://pact_broker:pact_broker_password@postgres-pact:5432/pact_broker"
      PACT_BROKER_BASIC_AUTH_USERNAME: "pact_broker_user"
      PACT_BROKER_BASIC_AUTH_PASSWORD: "pact_broker_pass"
      PACT_BROKER_ALLOW_DANGEROUS_CONTRACT_MODIFICATION: "true"  # Only for local dev
      PACT_BROKER_LOG_LEVEL: "INFO"
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:9292/diagnostic/status/heartbeat"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
    networks:
      - clenergize-network

volumes:
  pact-postgres-data:

networks:
  clenergize-network:
    external: true
```

**Start Pact Broker**:
```bash
docker-compose -f docker-compose.pact-broker.yml up -d

# Verify
curl http://localhost:9292/diagnostic/status/heartbeat

# Access UI
open http://localhost:9292
# Username: pact_broker_user
# Password: pact_broker_pass
```

### 3.2 Production (AWS ECS Fargate)

**CloudFormation Template** (`infrastructure/cloudformation/pact-broker.yml`):

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Pact Broker Infrastructure'

Resources:
  # RDS PostgreSQL for Pact Broker
  PactBrokerDB:
    Type: AWS::RDS::DBInstance
    Properties:
      DBInstanceIdentifier: pact-broker-db
      Engine: postgres
      EngineVersion: '15.3'
      DBInstanceClass: db.t3.micro
      AllocatedStorage: 20
      StorageType: gp3
      MasterUsername: pact_broker
      MasterUserPassword: !Sub '{{resolve:secretsmanager:pact-broker-db-password}}'
      DBName: pact_broker
      VPCSecurityGroups:
        - !Ref PactBrokerDBSecurityGroup
      DBSubnetGroupName: !Ref PactBrokerDBSubnetGroup
      BackupRetentionPeriod: 7
      PreferredBackupWindow: '03:00-04:00'
      PreferredMaintenanceWindow: 'sun:04:00-sun:05:00'

  # ECS Task Definition
  PactBrokerTaskDefinition:
    Type: AWS::ECS::TaskDefinition
    Properties:
      Family: pact-broker
      NetworkMode: awsvpc
      RequiresCompatibilities:
        - FARGATE
      Cpu: '512'
      Memory: '1024'
      ExecutionRoleArn: !GetAtt ECSExecutionRole.Arn
      TaskRoleArn: !GetAtt ECSTaskRole.Arn
      ContainerDefinitions:
        - Name: pact-broker
          Image: pactfoundation/pact-broker:latest
          PortMappings:
            - ContainerPort: 9292
              Protocol: tcp
          Environment:
            - Name: PACT_BROKER_DATABASE_URL
              Value: !Sub 'postgres://pact_broker:${MasterUserPassword}@${PactBrokerDB.Endpoint.Address}:5432/pact_broker'
            - Name: PACT_BROKER_BASIC_AUTH_USERNAME
              Value: !Ref PactBrokerUsername
            - Name: PACT_BROKER_BASIC_AUTH_PASSWORD
              Value: !Sub '{{resolve:secretsmanager:pact-broker-password}}'
            - Name: PACT_BROKER_LOG_LEVEL
              Value: INFO
          LogConfiguration:
            LogDriver: awslogs
            Options:
              awslogs-group: /ecs/pact-broker
              awslogs-region: !Ref AWS::Region
              awslogs-stream-prefix: pact-broker

  # ECS Service
  PactBrokerService:
    Type: AWS::ECS::Service
    DependsOn: ALBListener
    Properties:
      ServiceName: pact-broker
      Cluster: !Ref ECSCluster
      TaskDefinition: !Ref PactBrokerTaskDefinition
      DesiredCount: 2
      LaunchType: FARGATE
      NetworkConfiguration:
        AwsvpcConfiguration:
          Subnets:
            - !Ref PrivateSubnet1
            - !Ref PrivateSubnet2
          SecurityGroups:
            - !Ref PactBrokerSecurityGroup
      LoadBalancers:
        - ContainerName: pact-broker
          ContainerPort: 9292
          TargetGroupArn: !Ref PactBrokerTargetGroup

  # Application Load Balancer
  ApplicationLoadBalancer:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Name: pact-broker-alb
      Scheme: internal
      Type: application
      Subnets:
        - !Ref PrivateSubnet1
        - !Ref PrivateSubnet2
      SecurityGroups:
        - !Ref ALBSecurityGroup

  PactBrokerTargetGroup:
    Type: AWS::ElasticLoadBalancingV2::TargetGroup
    Properties:
      Name: pact-broker-tg
      Port: 9292
      Protocol: HTTP
      VpcId: !Ref VPC
      TargetType: ip
      HealthCheckPath: /diagnostic/status/heartbeat
      HealthCheckIntervalSeconds: 30
      HealthCheckTimeoutSeconds: 10
      HealthyThresholdCount: 2
      UnhealthyThresholdCount: 3

  ALBListener:
    Type: AWS::ElasticLoadBalancingV2::Listener
    Properties:
      LoadBalancerArn: !Ref ApplicationLoadBalancer
      Port: 443
      Protocol: HTTPS
      Certificates:
        - CertificateArn: !Ref SSLCertificate
      DefaultActions:
        - Type: forward
          TargetGroupArn: !Ref PactBrokerTargetGroup

Outputs:
  PactBrokerURL:
    Description: Pact Broker URL
    Value: !Sub 'https://${ApplicationLoadBalancer.DNSName}'
    Export:
      Name: PactBrokerURL
```

**Deploy**:
```bash
aws cloudformation deploy \
  --template-file infrastructure/cloudformation/pact-broker.yml \
  --stack-name clenergize-pact-broker \
  --capabilities CAPABILITY_IAM
```

---

## 4. Consumer-Side Setup

### 4.1 Install Pact Dependencies

**For Each Consumer Service** (Organization, Activity, Calculation, Reporting):

```bash
cd services/organization-service

npm install --save-dev \
  @pact-foundation/pact@^11.0.0 \
  jest-pact@^0.11.0

# TypeScript types
npm install --save-dev @types/pact
```

### 4.2 Pact Configuration

Create `pact.config.ts` in the service root:

```typescript
// services/organization-service/pact.config.ts
import { LogLevel } from '@pact-foundation/pact';
import path from 'path';

export const pactConfig = {
  // Consumer details
  consumer: 'organization-service',

  // Pact Broker details
  pactBrokerUrl: process.env.PACT_BROKER_URL || 'http://localhost:9292',
  pactBrokerUsername: process.env.PACT_BROKER_USERNAME || 'pact_broker_user',
  pactBrokerPassword: process.env.PACT_BROKER_PASSWORD || 'pact_broker_pass',

  // Where to write pact files
  dir: path.resolve(__dirname, 'pacts'),

  // Logging
  log: path.resolve(__dirname, 'logs', 'pact.log'),
  logLevel: (process.env.PACT_LOG_LEVEL as LogLevel) || 'info',

  // Consumer version (from CI/CD)
  consumerVersion: process.env.GIT_COMMIT || 'dev',

  // Branch name (for deployment tracking)
  branch: process.env.GIT_BRANCH || 'develop',

  // Tags
  tags: [
    process.env.GIT_BRANCH || 'develop',
    process.env.ENVIRONMENT || 'local'
  ],

  // Publish pacts to broker
  publishVerificationResult: process.env.CI === 'true',

  // Timeout settings
  timeout: 30000
};
```

### 4.3 Write Consumer Tests

**Example: Organization Service → Identity Service**

Create `test/pact/identity-service.pact.spec.ts`:

```typescript
import { pactWith } from 'jest-pact';
import { Matchers } from '@pact-foundation/pact';
import { IdentityServiceClient } from '@/infrastructure/http/identity-service.client';
import { pactConfig } from '../../pact.config';

const { like, eachLike, iso8601DateTime, uuid } = Matchers;

pactWith(
  {
    consumer: 'organization-service',
    provider: 'identity-service',
    ...pactConfig
  },
  (provider) => {
    let identityClient: IdentityServiceClient;

    beforeEach(() => {
      // Initialize client to point to Pact mock server
      identityClient = new IdentityServiceClient({
        baseURL: provider.mockService.baseUrl
      });
    });

    describe('GET /v1/users/:id', () => {
      const userId = 'user-123';

      describe('when user exists', () => {
        beforeEach(() => {
          return provider.addInteraction({
            state: 'user with ID user-123 exists',
            uponReceiving: 'a request for user details',
            withRequest: {
              method: 'GET',
              path: `/v1/users/${userId}`,
              headers: {
                'Authorization': 'Bearer token',
                'Accept': 'application/json'
              }
            },
            willRespondWith: {
              status: 200,
              headers: {
                'Content-Type': 'application/json'
              },
              body: like({
                success: true,
                data: {
                  id: uuid(userId),
                  email: like('user@example.com'),
                  firstName: like('John'),
                  lastName: like('Doe'),
                  role: like('ADMIN'),
                  organizationId: uuid('org-123'),
                  createdAt: iso8601DateTime('2025-01-01T00:00:00Z'),
                  updatedAt: iso8601DateTime('2025-01-01T00:00:00Z')
                }
              })
            }
          });
        });

        it('returns user details', async () => {
          const user = await identityClient.getUserById(userId);

          expect(user).toMatchObject({
            id: userId,
            email: expect.any(String),
            firstName: expect.any(String),
            lastName: expect.any(String),
            role: expect.any(String)
          });
        });
      });

      describe('when user does not exist', () => {
        beforeEach(() => {
          return provider.addInteraction({
            state: 'user with ID user-999 does not exist',
            uponReceiving: 'a request for non-existent user',
            withRequest: {
              method: 'GET',
              path: '/v1/users/user-999',
              headers: {
                'Authorization': 'Bearer token',
                'Accept': 'application/json'
              }
            },
            willRespondWith: {
              status: 404,
              headers: {
                'Content-Type': 'application/json'
              },
              body: like({
                success: false,
                error: {
                  code: like('IDT_RES_101'),
                  message: like('User not found'),
                  timestamp: iso8601DateTime()
                }
              })
            }
          });
        });

        it('throws Not Found error', async () => {
          await expect(
            identityClient.getUserById('user-999')
          ).rejects.toThrow('User not found');
        });
      });
    });

    describe('GET /v1/users/:id/permissions', () => {
      const userId = 'user-123';
      const projectId = 'project-456';

      beforeEach(() => {
        return provider.addInteraction({
          state: 'user has permissions for project',
          uponReceiving: 'a request for user permissions',
          withRequest: {
            method: 'GET',
            path: `/v1/users/${userId}/permissions`,
            query: { projectId },
            headers: {
              'Authorization': 'Bearer token',
              'Accept': 'application/json'
            }
          },
          willRespondWith: {
            status: 200,
            headers: {
              'Content-Type': 'application/json'
            },
            body: like({
              success: true,
              data: {
                userId: uuid(userId),
                projectId: uuid(projectId),
                permissions: eachLike(like('READ'))
              }
            })
          }
        });
      });

      it('returns user permissions', async () => {
        const permissions = await identityClient.getUserPermissions(userId, projectId);

        expect(permissions).toMatchObject({
          userId,
          projectId,
          permissions: expect.arrayContaining([expect.any(String)])
        });
      });
    });
  }
);
```

### 4.4 Run Consumer Tests

```bash
# Run pact tests
npm run test:pact

# This generates pact files in ./pacts/
# Example: ./pacts/organization-service-identity-service.json
```

### 4.5 Publish Pacts to Broker

Add npm script to `package.json`:

```json
{
  "scripts": {
    "test:pact": "jest --testMatch='**/*.pact.spec.ts'",
    "pact:publish": "pact-broker publish ./pacts --consumer-app-version=$GIT_COMMIT --broker-base-url=$PACT_BROKER_URL --broker-username=$PACT_BROKER_USERNAME --broker-password=$PACT_BROKER_PASSWORD --tag=$GIT_BRANCH"
  }
}
```

**Publish**:
```bash
export GIT_COMMIT=$(git rev-parse HEAD)
export GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
export PACT_BROKER_URL=http://localhost:9292
export PACT_BROKER_USERNAME=pact_broker_user
export PACT_BROKER_PASSWORD=pact_broker_pass

npm run pact:publish
```

---

## 5. Provider-Side Setup

### 5.1 Install Pact Dependencies

**For Each Provider Service** (Identity, Organization, Reference, Activity, Calculation):

```bash
cd services/identity-service

npm install --save-dev \
  @pact-foundation/pact@^11.0.0 \
  jest-pact@^0.11.0
```

### 5.2 Provider Verification Test

Create `test/pact/identity-service.provider.spec.ts`:

```typescript
import { Verifier, VerifierOptions } from '@pact-foundation/pact';
import path from 'path';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@/app.module';

describe('Identity Service Provider Verification', () => {
  let app: INestApplication;
  const port = 3001;

  beforeAll(async () => {
    // Start the Identity Service
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleRef.createNestApplication();
    await app.listen(port);
  });

  afterAll(async () => {
    await app.close();
  });

  it('validates the expectations of Organization Service', async () => {
    const opts: VerifierOptions = {
      // Provider details
      provider: 'identity-service',
      providerBaseUrl: `http://localhost:${port}`,

      // Pact Broker details
      pactBrokerUrl: process.env.PACT_BROKER_URL || 'http://localhost:9292',
      pactBrokerUsername: process.env.PACT_BROKER_USERNAME || 'pact_broker_user',
      pactBrokerPassword: process.env.PACT_BROKER_PASSWORD || 'pact_broker_pass',

      // Which consumers to verify
      consumerVersionSelectors: [
        {
          tag: 'develop',
          latest: true
        },
        {
          tag: 'main',
          latest: true
        }
      ],

      // Provider version
      providerVersion: process.env.GIT_COMMIT || 'dev',
      providerVersionBranch: process.env.GIT_BRANCH || 'develop',

      // Publish verification results
      publishVerificationResult: process.env.CI === 'true',

      // State handlers (for provider states)
      stateHandlers: {
        'user with ID user-123 exists': async () => {
          // Setup: Create user in test database
          await setupUser({
            id: 'user-123',
            email: 'user@example.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'ADMIN'
          });
        },

        'user with ID user-999 does not exist': async () => {
          // Setup: Ensure user does not exist
          await deleteUser('user-999');
        },

        'user has permissions for project': async () => {
          // Setup: Create user with permissions
          await setupUser({
            id: 'user-123',
            permissions: [{
              projectId: 'project-456',
              permissions: ['READ', 'WRITE']
            }]
          });
        }
      },

      // Request filters (inject auth token)
      requestFilter: (req, res, next) => {
        // Add Bearer token to all requests
        req.headers.authorization = 'Bearer test-token';
        next();
      },

      // Logging
      logLevel: 'info'
    };

    try {
      const output = await new Verifier(opts).verifyProvider();
      console.log('Pact Verification Complete!');
      console.log(output);
    } catch (error) {
      console.error('Pact Verification Failed:', error);
      throw error;
    }
  });
});

// Helper functions
async function setupUser(user: any) {
  // Insert user into test database
  // This is test-specific implementation
}

async function deleteUser(userId: string) {
  // Remove user from test database
}
```

### 5.3 Run Provider Verification

```bash
# Run provider verification
npm run test:pact:provider

# Verify specific consumer
CONSUMER=organization-service npm run test:pact:provider
```

Add npm script:
```json
{
  "scripts": {
    "test:pact:provider": "jest --testMatch='**/*.provider.spec.ts'"
  }
}
```

---

## 6. Integration Patterns

### 6.1 Complete Integration Matrix

| Consumer | Provider | Endpoint | Contract Status |
|----------|----------|----------|----------------|
| Organization | Identity | GET /v1/users/:id | ✅ Defined |
| Organization | Identity | GET /v1/users/:id/permissions | ✅ Defined |
| Organization | Reference | GET /v1/hierarchies/:id | 🔶 Pending |
| Activity | Reference | GET /v1/parameters/:id | 🔶 Pending |
| Activity | Reference | GET /v1/emission-factors/:parameterId/:yearId | 🔶 Pending |
| Activity | Organization | GET /v1/projects/:id | 🔶 Pending |
| Activity | Organization | GET /v1/entities/:id | 🔶 Pending |
| Calculation | Activity | GET /v1/activity-data/{category} | 🔶 Pending |
| Calculation | Reference | GET /v1/emission-factors/:parameterId/:yearId | 🔶 Pending |
| Reporting | Calculation | GET /v1/calculations/:id | 🔶 Pending |
| Reporting | Organization | GET /v1/projects/:id/hierarchy | 🔶 Pending |

**Sprint 0.2 Goal**: Implement all 🔶 Pending contracts

### 6.2 Activity Service → Reference Service Example

**Consumer Test** (`activity-service/test/pact/reference-service.pact.spec.ts`):

```typescript
pactWith(
  {
    consumer: 'activity-service',
    provider: 'reference-service'
  },
  (provider) => {
    describe('GET /v1/parameters/:id', () => {
      const parameterId = 'param-123';

      beforeEach(() => {
        return provider.addInteraction({
          state: 'parameter natural-gas exists',
          uponReceiving: 'a request for parameter details',
          withRequest: {
            method: 'GET',
            path: `/v1/parameters/${parameterId}`,
            headers: {
              'Accept': 'application/json'
            }
          },
          willRespondWith: {
            status: 200,
            headers: {
              'Content-Type': 'application/json'
            },
            body: like({
              success: true,
              data: {
                id: uuid(parameterId),
                name: like('Natural Gas'),
                category: like('Stationary Combustion'),
                scope: like('Scope 1'),
                defaultUom: like('m³'),
                uomList: eachLike(like('m³')),
                activeYears: eachLike(like(2025))
              }
            })
          }
        });
      });

      it('returns parameter details', async () => {
        const parameter = await referenceClient.getParameter(parameterId);

        expect(parameter).toMatchObject({
          id: parameterId,
          name: expect.any(String),
          defaultUom: expect.any(String),
          uomList: expect.arrayContaining([expect.any(String)])
        });
      });
    });
  }
);
```

---

## 7. CI/CD Integration

### 7.1 GitHub Actions Workflow

Create `.github/workflows/pact-contract-tests.yml`:

```yaml
name: Pact Contract Tests

on:
  pull_request:
    branches: [develop, main]
  push:
    branches: [develop, main]

jobs:
  consumer-tests:
    name: Consumer Tests - ${{ matrix.service }}
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service:
          - organization-service
          - activity-service
          - calculation-service
          - reporting-service

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: services/${{ matrix.service }}/package-lock.json

      - name: Install dependencies
        working-directory: services/${{ matrix.service }}
        run: npm ci

      - name: Run Pact consumer tests
        working-directory: services/${{ matrix.service }}
        run: npm run test:pact
        env:
          CI: true

      - name: Publish pacts to broker
        working-directory: services/${{ matrix.service }}
        run: npm run pact:publish
        env:
          GIT_COMMIT: ${{ github.sha }}
          GIT_BRANCH: ${{ github.ref_name }}
          PACT_BROKER_URL: ${{ secrets.PACT_BROKER_URL }}
          PACT_BROKER_USERNAME: ${{ secrets.PACT_BROKER_USERNAME }}
          PACT_BROKER_PASSWORD: ${{ secrets.PACT_BROKER_PASSWORD }}

  provider-verification:
    name: Provider Verification - ${{ matrix.service }}
    runs-on: ubuntu-latest
    needs: consumer-tests
    strategy:
      matrix:
        service:
          - identity-service
          - organization-service
          - reference-service
          - activity-service
          - calculation-service

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: services/${{ matrix.service }}/package-lock.json

      - name: Install dependencies
        working-directory: services/${{ matrix.service }}
        run: npm ci

      - name: Start dependencies (MongoDB, Redis)
        run: docker-compose up -d mongodb redis

      - name: Run provider verification
        working-directory: services/${{ matrix.service }}
        run: npm run test:pact:provider
        env:
          CI: true
          GIT_COMMIT: ${{ github.sha }}
          GIT_BRANCH: ${{ github.ref_name }}
          PACT_BROKER_URL: ${{ secrets.PACT_BROKER_URL }}
          PACT_BROKER_USERNAME: ${{ secrets.PACT_BROKER_USERNAME }}
          PACT_BROKER_PASSWORD: ${{ secrets.PACT_BROKER_PASSWORD }}

  can-i-deploy:
    name: Can I Deploy? - ${{ matrix.service }}
    runs-on: ubuntu-latest
    needs: provider-verification
    strategy:
      matrix:
        service:
          - organization-service
          - activity-service
          - calculation-service
          - reporting-service

    steps:
      - name: Check if service can be deployed
        run: |
          npx pact-broker can-i-deploy \
            --pacticipant=${{ matrix.service }} \
            --version=${{ github.sha }} \
            --to-environment=production \
            --broker-base-url=${{ secrets.PACT_BROKER_URL }} \
            --broker-username=${{ secrets.PACT_BROKER_USERNAME }} \
            --broker-password=${{ secrets.PACT_BROKER_PASSWORD }}
```

### 7.2 Can-I-Deploy Check

The `can-i-deploy` command ensures **safe deployments**:

```bash
# Check if organization-service can be deployed
npx pact-broker can-i-deploy \
  --pacticipant=organization-service \
  --version=$GIT_COMMIT \
  --to-environment=production \
  --broker-base-url=http://localhost:9292 \
  --broker-username=pact_broker_user \
  --broker-password=pact_broker_pass

# Output (if safe):
# ✅ Computer says yes \o/
# All required provider versions are verified

# Output (if unsafe):
# ❌ Computer says no ¯\_(ツ)_/¯
# Identity Service provider verification failed
```

**Integration with Deployment**:
```yaml
# .github/workflows/deploy.yml
- name: Check if safe to deploy
  run: |
    npx pact-broker can-i-deploy \
      --pacticipant=$SERVICE_NAME \
      --version=$GIT_COMMIT \
      --to-environment=production

- name: Deploy to production
  if: success()
  run: |
    aws ecs update-service \
      --cluster clenergize \
      --service $SERVICE_NAME \
      --force-new-deployment
```

---

## 8. Best Practices

### 8.1 Writing Good Contracts

**✅ DO**:
```typescript
// Use matchers for flexible data
body: like({
  id: uuid('user-123'),              // Any UUID
  email: like('user@example.com'),   // Any string
  age: like(25),                     // Any number
  createdAt: iso8601DateTime()       // Any ISO datetime
})

// Use eachLike for arrays
body: like({
  users: eachLike({
    id: uuid(),
    name: like('John Doe')
  }, { min: 1 })  // At least 1 item
})

// Test both success and failure scenarios
describe('GET /users/:id', () => {
  it('returns user when exists', ...)
  it('returns 404 when not found', ...)
  it('returns 401 when unauthorized', ...)
})
```

**❌ DON'T**:
```typescript
// Don't use exact values for dynamic data
body: {
  id: 'user-123',                    // Too strict
  email: 'user@example.com',         // Too strict
  createdAt: '2025-01-01T00:00:00Z'  // Will fail if timestamp different
}

// Don't test every edge case
// Focus on contracts, not business logic
it('returns 400 when email is invalid format', ...)  // Too granular

// Don't make contracts too brittle
// Contracts should allow providers to evolve
```

### 8.2 Provider States

**Good State Names**:
- `user with ID user-123 exists`
- `project project-456 has 10 activities`
- `calculation calculation-789 is completed`

**Bad State Names**:
- `user exists` (too vague - which user?)
- `has data` (what data?)
- `ready` (not descriptive)

### 8.3 Contract Versioning

**Breaking Changes**: Require new contract
```typescript
// OLD (v1)
body: { name: 'John Doe' }

// NEW (v2) - Breaking change!
body: { firstName: 'John', lastName: 'Doe' }

// Solution: Create v2 contract
consumer: 'organization-service-v2',
withRequest: { path: '/v2/users/:id' }
```

**Non-Breaking Changes**: Update existing contract
```typescript
// OLD
body: { id: uuid(), name: like('John') }

// NEW - Non-breaking (added field)
body: {
  id: uuid(),
  name: like('John'),
  email: like('john@example.com')  // New optional field
}
```

---

## 9. Troubleshooting

### 9.1 Common Issues

#### Issue: Pact verification fails with "No pacts found"

**Cause**: Pacts not published to broker or wrong consumer/provider names.

**Solution**:
```bash
# Check pacts in broker
curl http://localhost:9292/pacts/provider/identity-service/consumer/organization-service/latest

# Verify names match exactly
# Consumer test:
consumer: 'organization-service'  # Must match package.json "name"
provider: 'identity-service'

# Provider test:
provider: 'identity-service'      # Must match
```

#### Issue: Provider state handler not found

**Cause**: State name mismatch between consumer and provider.

**Solution**:
```typescript
// Consumer defines state
state: 'user with ID user-123 exists'

// Provider must use EXACT same name
stateHandlers: {
  'user with ID user-123 exists': async () => { ... }
}
```

#### Issue: Verification fails with "Connection refused"

**Cause**: Provider service not running during verification.

**Solution**:
```typescript
beforeAll(async () => {
  // Start service BEFORE verification
  app = await startNestApp();
  await app.listen(3001);
});

afterAll(async () => {
  await app.close();
});
```

### 9.2 Debugging Tips

**Enable verbose logging**:
```bash
PACT_LOG_LEVEL=debug npm run test:pact
```

**View Pact Broker logs**:
```bash
docker logs pact-broker -f
```

**Validate pact JSON**:
```bash
cat pacts/organization-service-identity-service.json | jq .
```

---

## 10. Sprint 0.1-0.2 Implementation Plan

### Sprint 0.1 (Week 1-2): Foundation

**Tasks**:
1. ✅ Set up Pact Broker (Docker Compose for local)
2. ✅ Document contract testing guide
3. ⬜ Write first consumer test (Organization → Identity)
4. ⬜ Write first provider verification (Identity)
5. ⬜ Integrate with CI/CD pipeline

**Deliverables**:
- Pact Broker running locally
- 1 working consumer-provider contract
- CI/CD pipeline runs Pact tests

### Sprint 0.2 (Week 3-4): Full Coverage

**Tasks**:
1. ⬜ Implement all consumer tests (11 contracts total)
2. ⬜ Implement all provider verifications
3. ⬜ Deploy Pact Broker to AWS ECS
4. ⬜ Add `can-i-deploy` checks to deployment pipeline

**Deliverables**:
- All service integrations have contracts
- Deployment pipeline blocks unsafe deploys

---

## 11. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Contract Coverage** | 100% of service integrations | 11/11 contracts defined |
| **CI/CD Integration** | All PRs run contract tests | GitHub Actions badge |
| **Deployment Safety** | Zero breaking API changes in prod | `can-i-deploy` pass rate |
| **Test Execution Time** | < 2 minutes per service | CI/CD logs |
| **Breaking Change Detection** | 100% caught before merge | PR failures |

---

**Document Status**: ✅ Complete
**Ready for Implementation**: YES
**Owner**: Testing Agent
**Next Steps**: Begin Sprint 0.1 implementation
