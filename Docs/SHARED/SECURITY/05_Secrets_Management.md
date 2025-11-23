# Secrets Management Strategy - AWS Secrets Manager

> **Document Type**: Security Architecture
> **Status**: Draft
> **Version**: 1.0.0
> **Last Updated**: November 18, 2025
> **Owner**: Security Agent

---

## Executive Summary

This document defines the secrets management strategy for Clenergize V3 using AWS Secrets Manager. This design **eliminates the critical security vulnerability** in the OLD system where secrets were hardcoded in environment files and committed to version control.

### Key Changes from OLD System

| Aspect | OLD System ❌ | NEW System ✅ |
|--------|--------------|--------------|
| **Storage** | Hardcoded in .env files | AWS Secrets Manager |
| **Version Control** | Committed to Git | Never in Git (gitignored) |
| **Rotation** | Manual (never done) | Automated rotation (30-90 days) |
| **Access Control** | Anyone with repo access | IAM-based with least privilege |
| **Encryption** | None (plaintext) | AES-256 encryption at rest |
| **Auditing** | None | CloudTrail logging all access |
| **Local Development** | Production secrets leaked | LocalStack simulation |

### Secrets Inventory

**Total Secrets**: 47 across all environments

| Category | Count | Rotation | Examples |
|----------|-------|----------|----------|
| Database Credentials | 8 | 90 days | MongoDB root password, Redis auth |
| API Keys | 12 | 30 days | AWS access keys, third-party APIs |
| JWT Secrets | 3 | Manual | Cognito client secret, signing keys |
| Encryption Keys | 5 | Never | KMS key IDs, data encryption keys |
| Service Credentials | 10 | 90 days | SMTP password, S3 access keys |
| OAuth Credentials | 6 | Manual | Client IDs, client secrets |
| Certificates | 3 | 365 days | TLS certs, service certificates |

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Secret Categorization](#secret-categorization)
3. [AWS Secrets Manager Setup](#aws-secrets-manager-setup)
4. [Secret Rotation Strategy](#secret-rotation-strategy)
5. [Implementation in NestJS](#implementation-in-nestjs)
6. [Local Development with LocalStack](#local-development-with-localstack)
7. [CI/CD Integration](#cicd-integration)
8. [Access Control & IAM Policies](#access-control--iam-policies)
9. [Monitoring & Auditing](#monitoring--auditing)
10. [Migration from OLD System](#migration-from-old-system)
11. [Best Practices](#best-practices)
12. [Disaster Recovery](#disaster-recovery)

---

## 1. Architecture Overview

### 1.1 Secrets Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   AWS Secrets Manager                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Production Secrets (us-east-1)                      │   │
│  │  ├── /clenergize/prod/mongodb-credentials           │   │
│  │  ├── /clenergize/prod/redis-auth-token              │   │
│  │  ├── /clenergize/prod/cognito-client-secret         │   │
│  │  ├── /clenergize/prod/smtp-credentials              │   │
│  │  ├── /clenergize/prod/s3-access-keys                │   │
│  │  └── ... (47 secrets total)                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                         │                                    │
│                         │ Encrypted with KMS                 │
│                         │ AES-256-GCM                        │
└─────────────────────────┼────────────────────────────────────┘
                          │
                          │ TLS 1.3
                          │ IAM Authentication
                          │
┌─────────────────────────▼────────────────────────────────────┐
│              Application (NestJS Services)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Secrets Manager Client                      │   │
│  │  • Fetch secrets on startup                          │   │
│  │  • Cache secrets in memory (5 min TTL)               │   │
│  │  • Auto-refresh on rotation                          │   │
│  │  • Graceful fallback on network issues               │   │
│  └──────────────────────────────────────────────────────┘   │
│                         │                                    │
│  ┌──────────────────────▼──────────────────────────────┐   │
│  │       Application Configuration Service              │   │
│  │  • Inject secrets into ConfigService                 │   │
│  │  • Never log secret values                           │   │
│  │  • Mask secrets in error messages                    │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### 1.2 Secret Naming Convention

**Pattern**: `/clenergize/{environment}/{service}/{secret-name}`

**Examples**:
```
/clenergize/prod/identity/mongodb-password
/clenergize/prod/shared/redis-auth-token
/clenergize/staging/calculation/aws-access-key
/clenergize/dev/frontend/api-key
```

**Benefits**:
- Clear ownership and environment separation
- Easy to grant service-specific access
- Supports AWS resource tagging
- Aligns with AWS best practices

---

## 2. Secret Categorization

### 2.1 Database Credentials

**Secrets**:
```json
{
  "name": "/clenergize/prod/mongodb-root",
  "value": {
    "username": "admin",
    "password": "Qw3rTy!@#4567890aBcDeF",
    "host": "mongodb-prod.cluster.us-east-1.docdb.amazonaws.com",
    "port": 27017,
    "authSource": "admin"
  },
  "rotation": {
    "enabled": true,
    "interval": 90,
    "lambdaArn": "arn:aws:lambda:us-east-1:123456789012:function:rotate-mongodb-password"
  },
  "tags": {
    "Service": "All",
    "Environment": "Production",
    "Type": "DatabaseCredential",
    "Compliance": "PCI-DSS"
  }
}
```

**Service-Specific Database Credentials**:
- `/clenergize/prod/identity/mongodb-password`
- `/clenergize/prod/organization/mongodb-password`
- `/clenergize/prod/reference/mongodb-password`
- `/clenergize/prod/activity/mongodb-password`
- `/clenergize/prod/calculation/mongodb-password`
- `/clenergize/prod/reporting/mongodb-password`
- `/clenergize/prod/audit/mongodb-password`

**Redis Credentials**:
- `/clenergize/prod/shared/redis-auth-token`

### 2.2 API Keys & Tokens

**AWS Access Keys** (for S3, SQS, EventBridge):
```json
{
  "name": "/clenergize/prod/aws/access-keys",
  "value": {
    "accessKeyId": "AKIAIOSFODNN7EXAMPLE",
    "secretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
    "region": "us-east-1"
  },
  "rotation": {
    "enabled": true,
    "interval": 90
  }
}
```

**Third-Party API Keys**:
- `/clenergize/prod/sendgrid/api-key` - Email service
- `/clenergize/prod/stripe/secret-key` - Payment processing
- `/clenergize/prod/google-maps/api-key` - Geocoding
- `/clenergize/prod/defra/api-key` - Emission factor data
- `/clenergize/prod/ipcc/api-key` - Climate data

### 2.3 Authentication Secrets

**AWS Cognito**:
```json
{
  "name": "/clenergize/prod/cognito/client-credentials",
  "value": {
    "userPoolId": "us-east-1_XXXXXXXXX",
    "clientId": "3qkr0b53jn9m8h7g6f5e4d3c2b1a0",
    "clientSecret": "1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
    "region": "us-east-1"
  },
  "rotation": {
    "enabled": false,
    "note": "Cognito client secrets cannot be rotated. Use new client if compromised."
  }
}
```

**JWT Signing Keys** (if not using Cognito):
```json
{
  "name": "/clenergize/prod/jwt/signing-keys",
  "value": {
    "privateKey": "-----BEGIN RSA PRIVATE KEY-----\n...",
    "publicKey": "-----BEGIN PUBLIC KEY-----\n...",
    "algorithm": "RS256",
    "kid": "key-id-2025-01"
  },
  "rotation": {
    "enabled": true,
    "interval": 90,
    "overlap": 7
  }
}
```

### 2.4 Encryption Keys

**KMS Key IDs** (references, not actual keys):
```json
{
  "name": "/clenergize/prod/kms/key-ids",
  "value": {
    "dataEncryptionKey": "arn:aws:kms:us-east-1:123456789012:key/12345678-1234-1234-1234-123456789012",
    "auditLogKey": "arn:aws:kms:us-east-1:123456789012:key/abcdefgh-abcd-abcd-abcd-abcdefghijkl",
    "backupKey": "arn:aws:kms:us-east-1:123456789012:key/98765432-9876-9876-9876-987654321098"
  },
  "rotation": {
    "enabled": false,
    "note": "KMS keys are rotated automatically by AWS"
  }
}
```

**Field-Level Encryption Keys**:
```json
{
  "name": "/clenergize/prod/field-encryption/mfa-secrets",
  "value": {
    "encryptionKey": "base64-encoded-256-bit-key",
    "algorithm": "AES-256-GCM",
    "keyVersion": "v2"
  },
  "rotation": {
    "enabled": true,
    "interval": 180
  }
}
```

### 2.5 Service Credentials

**SMTP Credentials** (email sending):
```json
{
  "name": "/clenergize/prod/smtp/credentials",
  "value": {
    "host": "smtp.sendgrid.net",
    "port": 587,
    "username": "apikey",
    "password": "SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "from": "noreply@clenergize.com",
    "replyTo": "support@clenergize.com"
  },
  "rotation": {
    "enabled": true,
    "interval": 90
  }
}
```

**S3 Bucket Credentials**:
```json
{
  "name": "/clenergize/prod/s3/upload-bucket",
  "value": {
    "bucketName": "clenergize-prod-uploads",
    "region": "us-east-1",
    "accessKeyId": "AKIAIOSFODNN7EXAMPLE",
    "secretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
  }
}
```

### 2.6 OAuth Credentials

**Social Login Providers**:
```json
{
  "name": "/clenergize/prod/oauth/google",
  "value": {
    "clientId": "123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com",
    "clientSecret": "GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx",
    "callbackUrl": "https://app.clenergize.com/auth/google/callback",
    "scopes": ["openid", "profile", "email"]
  }
}
```

### 2.7 Certificates & Keys

**TLS Certificates**:
```json
{
  "name": "/clenergize/prod/tls/wildcard-cert",
  "value": {
    "certificate": "-----BEGIN CERTIFICATE-----\n...",
    "privateKey": "-----BEGIN PRIVATE KEY-----\n...",
    "chain": "-----BEGIN CERTIFICATE-----\n...",
    "expiresAt": "2026-11-18T00:00:00Z"
  },
  "rotation": {
    "enabled": true,
    "interval": 365,
    "alertDays": 30
  }
}
```

---

## 3. AWS Secrets Manager Setup

### 3.1 Create Secrets via AWS CLI

```bash
# Create MongoDB root password
aws secretsmanager create-secret \
  --name /clenergize/prod/mongodb-root \
  --description "MongoDB root credentials for production" \
  --secret-string '{
    "username": "admin",
    "password": "'"$(openssl rand -base64 32)"'",
    "host": "mongodb-prod.cluster.docdb.amazonaws.com",
    "port": 27017,
    "authSource": "admin"
  }' \
  --tags Key=Environment,Value=Production Key=Service,Value=All \
  --region us-east-1

# Create Redis auth token
aws secretsmanager create-secret \
  --name /clenergize/prod/shared/redis-auth-token \
  --description "Redis authentication token" \
  --secret-string "$(openssl rand -base64 48)" \
  --tags Key=Environment,Value=Production Key=Service,Value=Shared \
  --region us-east-1

# Create AWS access keys (for application)
aws secretsmanager create-secret \
  --name /clenergize/prod/aws/access-keys \
  --description "AWS access keys for application services" \
  --secret-string '{
    "accessKeyId": "AKIAIOSFODNN7EXAMPLE",
    "secretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
  }' \
  --tags Key=Environment,Value=Production Key=Service,Value=All \
  --region us-east-1
```

### 3.2 Create Secrets via Terraform

```hcl
# terraform/secrets.tf

# MongoDB root password
resource "aws_secretsmanager_secret" "mongodb_root" {
  name        = "/clenergize/${var.environment}/mongodb-root"
  description = "MongoDB root credentials for ${var.environment}"

  tags = {
    Environment = var.environment
    Service     = "All"
    ManagedBy   = "Terraform"
  }
}

resource "aws_secretsmanager_secret_version" "mongodb_root" {
  secret_id = aws_secretsmanager_secret.mongodb_root.id
  secret_string = jsonencode({
    username   = "admin"
    password   = random_password.mongodb_root.result
    host       = aws_docdb_cluster.main.endpoint
    port       = 27017
    authSource = "admin"
  })
}

resource "random_password" "mongodb_root" {
  length  = 32
  special = true
}

# Enable automatic rotation
resource "aws_secretsmanager_secret_rotation" "mongodb_root" {
  secret_id           = aws_secretsmanager_secret.mongodb_root.id
  rotation_lambda_arn = aws_lambda_function.rotate_mongodb.arn

  rotation_rules {
    automatically_after_days = 90
  }
}

# Cognito client secret
resource "aws_secretsmanager_secret" "cognito_client" {
  name        = "/clenergize/${var.environment}/cognito/client-credentials"
  description = "AWS Cognito client credentials"

  tags = {
    Environment = var.environment
    Service     = "Identity"
  }
}

resource "aws_secretsmanager_secret_version" "cognito_client" {
  secret_id = aws_secretsmanager_secret.cognito_client.id
  secret_string = jsonencode({
    userPoolId   = aws_cognito_user_pool.main.id
    clientId     = aws_cognito_user_pool_client.main.id
    clientSecret = aws_cognito_user_pool_client.main.client_secret
    region       = var.aws_region
  })
}
```

### 3.3 Secret Encryption (KMS)

**KMS Key for Secrets Manager**:
```hcl
# terraform/kms.tf

resource "aws_kms_key" "secrets_manager" {
  description             = "KMS key for Secrets Manager encryption"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  tags = {
    Name        = "clenergize-secrets-manager-key"
    Environment = var.environment
  }
}

resource "aws_kms_alias" "secrets_manager" {
  name          = "alias/clenergize-secrets-manager"
  target_key_id = aws_kms_key.secrets_manager.key_id
}

# Grant Secrets Manager access to KMS key
resource "aws_kms_grant" "secrets_manager" {
  name              = "secrets-manager-grant"
  key_id            = aws_kms_key.secrets_manager.key_id
  grantee_principal = "secretsmanager.amazonaws.com"

  operations = [
    "Decrypt",
    "DescribeKey",
    "GenerateDataKey"
  ]
}

# Use custom KMS key for specific secrets
resource "aws_secretsmanager_secret" "highly_sensitive" {
  name       = "/clenergize/prod/encryption-keys"
  kms_key_id = aws_kms_key.secrets_manager.arn
}
```

---

## 4. Secret Rotation Strategy

### 4.1 Rotation Frequency

| Secret Type | Rotation Interval | Automation | Overlap Period |
|-------------|-------------------|------------|----------------|
| Database Passwords | 90 days | Automated | 1 hour |
| API Keys | 30-90 days | Manual/Automated | N/A |
| JWT Signing Keys | 90 days | Automated | 7 days |
| TLS Certificates | 365 days | Automated | 30 days |
| Encryption Keys | 180 days | Automated | 30 days |
| OAuth Secrets | Manual | Manual | N/A |

### 4.2 MongoDB Password Rotation

**Lambda Function** (Python):
```python
# lambda/rotate_mongodb_password.py
import boto3
import pymongo
import json
import os

secrets_client = boto3.client('secretsmanager')

def lambda_handler(event, context):
    """
    Rotate MongoDB password
    Steps:
    1. Create new password
    2. Set it in MongoDB (dual password support)
    3. Test new password
    4. Update secret in Secrets Manager
    5. Revoke old password
    """
    arn = event['SecretId']
    token = event['ClientRequestToken']
    step = event['Step']

    if step == "createSecret":
        create_secret(arn, token)
    elif step == "setSecret":
        set_secret(arn, token)
    elif step == "testSecret":
        test_secret(arn, token)
    elif step == "finishSecret":
        finish_secret(arn, token)
    else:
        raise ValueError("Invalid step parameter")

def create_secret(arn, token):
    """Generate new password and store as AWSPENDING version"""
    # Get current secret
    current = secrets_client.get_secret_value(SecretId=arn)
    current_dict = json.loads(current['SecretString'])

    # Generate new password (32 characters)
    import secrets
    import string
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*()"
    new_password = ''.join(secrets.choice(alphabet) for i in range(32))

    # Create new secret version
    new_dict = current_dict.copy()
    new_dict['password'] = new_password

    secrets_client.put_secret_value(
        SecretId=arn,
        ClientRequestToken=token,
        SecretString=json.dumps(new_dict),
        VersionStages=['AWSPENDING']
    )

def set_secret(arn, token):
    """Update MongoDB user with new password"""
    # Get pending secret
    pending = secrets_client.get_secret_value(
        SecretId=arn,
        VersionId=token,
        VersionStage='AWSPENDING'
    )
    pending_dict = json.loads(pending['SecretString'])

    # Get current secret (for connection)
    current = secrets_client.get_secret_value(
        SecretId=arn,
        VersionStage='AWSCURRENT'
    )
    current_dict = json.loads(current['SecretString'])

    # Connect to MongoDB with current password
    client = pymongo.MongoClient(
        host=current_dict['host'],
        port=current_dict['port'],
        username=current_dict['username'],
        password=current_dict['password'],
        authSource=current_dict['authSource']
    )

    # Update user password
    admin_db = client['admin']
    admin_db.command(
        'updateUser',
        current_dict['username'],
        pwd=pending_dict['password']
    )

    client.close()

def test_secret(arn, token):
    """Test new password works"""
    # Get pending secret
    pending = secrets_client.get_secret_value(
        SecretId=arn,
        VersionId=token,
        VersionStage='AWSPENDING'
    )
    pending_dict = json.loads(pending['SecretString'])

    # Try to connect with new password
    client = pymongo.MongoClient(
        host=pending_dict['host'],
        port=pending_dict['port'],
        username=pending_dict['username'],
        password=pending_dict['password'],
        authSource=pending_dict['authSource'],
        serverSelectionTimeoutMS=5000
    )

    # Test query
    client.admin.command('ping')
    client.close()

def finish_secret(arn, token):
    """Move AWSPENDING to AWSCURRENT"""
    # Get current version
    metadata = secrets_client.describe_secret(SecretId=arn)
    current_version = None

    for version_id, stages in metadata['VersionIdsToStages'].items():
        if 'AWSCURRENT' in stages:
            current_version = version_id
            break

    # Move AWSPENDING to AWSCURRENT
    secrets_client.update_secret_version_stage(
        SecretId=arn,
        VersionStage='AWSCURRENT',
        MoveToVersionId=token,
        RemoveFromVersionId=current_version
    )
```

**Schedule Rotation**:
```hcl
# terraform/rotation.tf

resource "aws_lambda_function" "rotate_mongodb" {
  filename      = "lambda/rotate_mongodb.zip"
  function_name = "clenergize-rotate-mongodb-password"
  role          = aws_iam_role.lambda_rotation.arn
  handler       = "rotate_mongodb_password.lambda_handler"
  runtime       = "python3.11"
  timeout       = 300

  environment {
    variables = {
      EXCLUDE_CHARACTERS = "/@\"\\'`"
    }
  }
}

# Grant Secrets Manager permission to invoke Lambda
resource "aws_lambda_permission" "allow_secrets_manager" {
  statement_id  = "AllowSecretsManager"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.rotate_mongodb.function_name
  principal     = "secretsmanager.amazonaws.com"
}
```

### 4.3 JWT Signing Key Rotation

**Strategy**: Overlap period for zero-downtime rotation

```typescript
// Key rotation with overlap
interface SigningKeyPair {
  keyId: string;
  privateKey: string;
  publicKey: string;
  validFrom: Date;
  validUntil?: Date;
  status: 'ACTIVE' | 'RETIRING' | 'RETIRED';
}

async function rotateJWTSigningKeys(): Promise<void> {
  // 1. Generate new key pair
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  const newKeyId = `key-${Date.now()}`;

  // 2. Store new key in Secrets Manager
  await secretsManager.putSecretValue({
    SecretId: '/clenergize/prod/jwt/signing-keys',
    SecretString: JSON.stringify({
      keyId: newKeyId,
      privateKey,
      publicKey,
      validFrom: new Date().toISOString(),
      status: 'ACTIVE'
    })
  });

  // 3. Publish new public key to JWKS endpoint
  await publishToJWKS({
    kid: newKeyId,
    kty: 'RSA',
    use: 'sig',
    alg: 'RS256',
    n: extractModulus(publicKey),
    e: extractExponent(publicKey)
  });

  // 4. Wait for overlap period (7 days)
  // Old tokens still valid during this time

  // 5. After 7 days, mark old key as RETIRING
  // Stop issuing new tokens with old key

  // 6. After token expiration (15 min), retire old key completely
}
```

---

## 5. Implementation in NestJS

### 5.1 Secrets Module

**File Structure**:
```
src/
├── config/
│   ├── secrets/
│   │   ├── secrets.module.ts
│   │   ├── secrets.service.ts
│   │   ├── secrets.provider.ts
│   │   └── secrets.cache.ts
│   └── config.module.ts
```

**Secrets Service**:
```typescript
// src/config/secrets/secrets.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
  DescribeSecretCommand
} from '@aws-sdk/client-secrets-manager';
import NodeCache from 'node-cache';

@Injectable()
export class SecretsService implements OnModuleInit {
  private client: SecretsManagerClient;
  private cache: NodeCache;
  private secrets: Map<string, any> = new Map();

  constructor() {
    this.client = new SecretsManagerClient({
      region: process.env.AWS_REGION || 'us-east-1',
      // For LocalStack
      endpoint: process.env.LOCALSTACK_ENDPOINT || undefined
    });

    // Cache secrets for 5 minutes
    this.cache = new NodeCache({
      stdTTL: 300, // 5 minutes
      checkperiod: 60,
      useClones: false
    });
  }

  async onModuleInit(): Promise<void> {
    // Load all required secrets on startup
    await this.loadRequiredSecrets();

    // Setup rotation listener
    this.setupRotationListener();
  }

  /**
   * Get secret value (cached)
   */
  async getSecret<T = any>(secretName: string): Promise<T> {
    // Check cache first
    const cached = this.cache.get<T>(secretName);
    if (cached) {
      return cached;
    }

    // Fetch from AWS Secrets Manager
    try {
      const command = new GetSecretValueCommand({ SecretId: secretName });
      const response = await this.client.send(command);

      if (!response.SecretString) {
        throw new Error(`Secret ${secretName} has no value`);
      }

      const secretValue = JSON.parse(response.SecretString) as T;

      // Cache secret
      this.cache.set(secretName, secretValue);

      return secretValue;

    } catch (error) {
      // Fallback to environment variable if secret not found
      const envValue = process.env[this.secretToEnvVar(secretName)];
      if (envValue) {
        console.warn(`Secret ${secretName} not found in Secrets Manager, using environment variable`);
        return JSON.parse(envValue) as T;
      }

      throw new Error(`Failed to retrieve secret ${secretName}: ${error.message}`);
    }
  }

  /**
   * Load required secrets on startup
   */
  private async loadRequiredSecrets(): Promise<void> {
    const environment = process.env.NODE_ENV || 'development';
    const serviceName = process.env.SERVICE_NAME || 'unknown';

    const requiredSecrets = [
      `/clenergize/${environment}/${serviceName}/mongodb-password`,
      `/clenergize/${environment}/shared/redis-auth-token`,
      `/clenergize/${environment}/cognito/client-credentials`,
      `/clenergize/${environment}/aws/access-keys`
    ];

    console.log('Loading required secrets...');

    await Promise.all(
      requiredSecrets.map(async (secretName) => {
        try {
          await this.getSecret(secretName);
          console.log(`✓ Loaded secret: ${secretName}`);
        } catch (error) {
          console.error(`✗ Failed to load secret: ${secretName}`, error.message);
          // Don't fail startup - allow fallback to env vars
        }
      })
    );
  }

  /**
   * Setup listener for rotation events
   */
  private setupRotationListener(): void {
    // Poll for version changes every 5 minutes
    setInterval(async () => {
      for (const [secretName] of this.secrets) {
        try {
          // Check if secret was rotated
          const command = new DescribeSecretCommand({ SecretId: secretName });
          const response = await this.client.send(command);

          const currentVersion = Object.keys(response.VersionIdsToStages || {})
            .find(versionId => response.VersionIdsToStages[versionId].includes('AWSCURRENT'));

          const cachedVersion = this.cache.get<string>(`${secretName}:version`);

          if (currentVersion !== cachedVersion) {
            console.log(`Secret ${secretName} was rotated, refreshing cache...`);

            // Clear cache
            this.cache.del(secretName);
            this.cache.set(`${secretName}:version`, currentVersion);

            // Reload secret
            await this.getSecret(secretName);

            // Notify application (emit event)
            // this.eventEmitter.emit('secret.rotated', { secretName });
          }

        } catch (error) {
          console.error(`Error checking rotation for ${secretName}:`, error.message);
        }
      }
    }, 300000); // 5 minutes
  }

  /**
   * Convert secret name to environment variable name
   */
  private secretToEnvVar(secretName: string): string {
    // /clenergize/prod/mongodb-password -> MONGODB_PASSWORD
    return secretName.split('/').pop()!.replace(/-/g, '_').toUpperCase();
  }

  /**
   * Get database connection string
   */
  async getMongoDBConnectionString(): Promise<string> {
    const environment = process.env.NODE_ENV || 'development';
    const serviceName = process.env.SERVICE_NAME || 'unknown';

    const secret = await this.getSecret<{
      username: string;
      password: string;
      host: string;
      port: number;
      authSource: string;
    }>(`/clenergize/${environment}/${serviceName}/mongodb-password`);

    return `mongodb://${secret.username}:${secret.password}@${secret.host}:${secret.port}/?authSource=${secret.authSource}`;
  }

  /**
   * Get Redis connection config
   */
  async getRedisConfig(): Promise<{ url: string; password: string }> {
    const environment = process.env.NODE_ENV || 'development';

    const authToken = await this.getSecret<string>(
      `/clenergize/${environment}/shared/redis-auth-token`
    );

    const host = process.env.REDIS_HOST || 'localhost';
    const port = process.env.REDIS_PORT || 6379;

    return {
      url: `redis://${host}:${port}`,
      password: authToken
    };
  }

  /**
   * Get AWS credentials
   */
  async getAWSCredentials(): Promise<{ accessKeyId: string; secretAccessKey: string }> {
    const environment = process.env.NODE_ENV || 'development';

    return this.getSecret<{ accessKeyId: string; secretAccessKey: string }>(
      `/clenergize/${environment}/aws/access-keys`
    );
  }
}
```

**Secrets Module**:
```typescript
// src/config/secrets/secrets.module.ts
import { Module, Global } from '@nestjs/common';
import { SecretsService } from './secrets.service';

@Global()
@Module({
  providers: [SecretsService],
  exports: [SecretsService]
})
export class SecretsModule {}
```

### 5.2 Integration with ConfigService

```typescript
// src/config/configuration.ts
import { SecretsService } from './secrets/secrets.service';

export default async (secretsService: SecretsService) => {
  const mongoConnectionString = await secretsService.getMongoDBConnectionString();
  const redisConfig = await secretsService.getRedisConfig();
  const awsCredentials = await secretsService.getAWSCredentials();

  return {
    database: {
      mongodb: {
        uri: mongoConnectionString
      },
      redis: {
        url: redisConfig.url,
        password: redisConfig.password
      }
    },
    aws: {
      accessKeyId: awsCredentials.accessKeyId,
      secretAccessKey: awsCredentials.secretAccessKey,
      region: process.env.AWS_REGION || 'us-east-1'
    },
    jwt: {
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE
    }
  };
};
```

**Usage in Services**:
```typescript
@Injectable()
export class DatabaseService {
  constructor(
    private readonly secretsService: SecretsService,
    private readonly configService: ConfigService
  ) {}

  async connect(): Promise<void> {
    // Get connection string from config (loaded from secrets)
    const mongoUri = this.configService.get<string>('database.mongodb.uri');

    // Connect to MongoDB
    await mongoose.connect(mongoUri);
  }
}
```

---

## 6. Local Development with LocalStack

### 6.1 LocalStack Configuration

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  localstack:
    image: localstack/localstack:latest
    ports:
      - "4566:4566" # LocalStack edge port
    environment:
      - SERVICES=secretsmanager,kms,s3,sqs,sns
      - DEBUG=1
      - DOCKER_HOST=unix:///var/run/docker.sock
      - LOCALSTACK_API_KEY=${LOCALSTACK_API_KEY}
    volumes:
      - "${PWD}/localstack:/var/lib/localstack"
      - "/var/run/docker.sock:/var/run/docker.sock"
      - "${PWD}/localstack/init:/etc/localstack/init/ready.d"
```

**Initialize Secrets** (localstack/init/001-secrets.sh):
```bash
#!/bin/bash

# Wait for LocalStack to be ready
echo "Waiting for LocalStack..."
while ! curl -s http://localhost:4566/_localstack/health | grep -q '"secretsmanager": "available"'; do
  sleep 1
done

echo "Creating local secrets..."

# MongoDB password
awslocal secretsmanager create-secret \
  --name /clenergize/development/identity/mongodb-password \
  --secret-string '{
    "username": "admin",
    "password": "localdev123",
    "host": "localhost",
    "port": 27017,
    "authSource": "admin"
  }'

# Redis auth token
awslocal secretsmanager create-secret \
  --name /clenergize/development/shared/redis-auth-token \
  --secret-string "localdev-redis-token"

# AWS access keys (fake for local)
awslocal secretsmanager create-secret \
  --name /clenergize/development/aws/access-keys \
  --secret-string '{
    "accessKeyId": "test",
    "secretAccessKey": "test"
  }'

# Cognito credentials (fake for local)
awslocal secretsmanager create-secret \
  --name /clenergize/development/cognito/client-credentials \
  --secret-string '{
    "userPoolId": "local_XXXXXXXXX",
    "clientId": "local-client-id",
    "clientSecret": "local-client-secret",
    "region": "us-east-1"
  }'

echo "Local secrets created successfully!"
```

### 6.2 Environment Variables for Local Development

**.env.local**:
```env
# Environment
NODE_ENV=development
SERVICE_NAME=identity

# AWS Configuration (LocalStack)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
LOCALSTACK_ENDPOINT=http://localhost:4566

# Fallback secrets (if LocalStack is not running)
MONGODB_PASSWORD={"username":"admin","password":"localdev123","host":"localhost","port":27017,"authSource":"admin"}
REDIS_AUTH_TOKEN=localdev-redis-token
```

**Note**: Never commit .env files with real secrets to Git!

---

## 7. CI/CD Integration

### 7.1 GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          role-to-assume: arn:aws:iam::123456789012:role/GitHubActions
          aws-region: us-east-1

      - name: Verify Secrets Exist
        run: |
          # Check all required secrets exist
          aws secretsmanager describe-secret --secret-id /clenergize/prod/mongodb-root
          aws secretsmanager describe-secret --secret-id /clenergize/prod/shared/redis-auth-token
          aws secretsmanager describe-secret --secret-id /clenergize/prod/cognito/client-credentials

      - name: Build and Deploy
        run: |
          # Build application
          npm run build

          # Deploy to ECS/Lambda
          # Secrets are injected at runtime via IAM role
```

### 7.2 ECS Task Definition

**Inject Secrets into Container**:
```json
{
  "family": "clenergize-identity-service",
  "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::123456789012:role/identityServiceRole",
  "containerDefinitions": [
    {
      "name": "identity-service",
      "image": "123456789012.dkr.ecr.us-east-1.amazonaws.com/identity-service:latest",
      "secrets": [
        {
          "name": "MONGODB_PASSWORD",
          "valueFrom": "/clenergize/prod/identity/mongodb-password"
        },
        {
          "name": "REDIS_AUTH_TOKEN",
          "valueFrom": "/clenergize/prod/shared/redis-auth-token"
        },
        {
          "name": "COGNITO_CLIENT_SECRET",
          "valueFrom": "/clenergize/prod/cognito/client-credentials:clientSecret::"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "SERVICE_NAME",
          "value": "identity"
        },
        {
          "name": "AWS_REGION",
          "value": "us-east-1"
        }
      ]
    }
  ]
}
```

**Benefits**:
- Secrets never appear in Docker images
- Secrets fetched at container startup
- Automatic rotation handled by AWS
- IAM-based access control

---

## 8. Access Control & IAM Policies

### 8.1 Service-Specific IAM Roles

**Identity Service Role**:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": [
        "arn:aws:secretsmanager:us-east-1:123456789012:secret:/clenergize/prod/identity/*",
        "arn:aws:secretsmanager:us-east-1:123456789012:secret:/clenergize/prod/shared/*",
        "arn:aws:secretsmanager:us-east-1:123456789012:secret:/clenergize/prod/cognito/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "kms:Decrypt",
        "kms:DescribeKey"
      ],
      "Resource": "arn:aws:kms:us-east-1:123456789012:key/12345678-1234-1234-1234-123456789012"
    }
  ]
}
```

**Principle of Least Privilege**:
- Each service can only access its own secrets
- No write permissions (read-only)
- KMS decrypt permission for encrypted secrets

### 8.2 Rotation Lambda Role

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:DescribeSecret",
        "secretsmanager:GetSecretValue",
        "secretsmanager:PutSecretValue",
        "secretsmanager:UpdateSecretVersionStage"
      ],
      "Resource": "arn:aws:secretsmanager:us-east-1:123456789012:secret:/clenergize/prod/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "kms:Decrypt",
        "kms:Encrypt",
        "kms:GenerateDataKey"
      ],
      "Resource": "arn:aws:kms:us-east-1:123456789012:key/*"
    }
  ]
}
```

### 8.3 Developer Access (Console Only)

**Read-Only Access for Debugging**:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:ListSecrets",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Deny",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "*"
    }
  ]
}
```

**Note**: Developers can see secret metadata but NOT secret values

---

## 9. Monitoring & Auditing

### 9.1 CloudTrail Logging

**Enable CloudTrail for Secrets Manager**:
```hcl
resource "aws_cloudtrail" "secrets_audit" {
  name                          = "clenergize-secrets-audit"
  s3_bucket_name                = aws_s3_bucket.cloudtrail.id
  include_global_service_events = true
  is_multi_region_trail         = true
  enable_logging                = true

  event_selector {
    read_write_type           = "All"
    include_management_events = true

    data_resource {
      type = "AWS::SecretsManager::Secret"
      values = ["arn:aws:secretsmanager:*:*:secret:/clenergize/*"]
    }
  }
}
```

**Logged Events**:
- GetSecretValue (who accessed which secret)
- PutSecretValue (secret updates)
- DeleteSecret (secret deletions)
- RotateSecret (rotation events)

### 9.2 CloudWatch Alarms

**Alert on Unauthorized Access**:
```hcl
resource "aws_cloudwatch_log_metric_filter" "unauthorized_secret_access" {
  name           = "UnauthorizedSecretAccess"
  log_group_name = aws_cloudwatch_log_group.cloudtrail.name

  pattern = <<PATTERN
{
  ($.eventName = GetSecretValue) &&
  ($.errorCode = AccessDenied)
}
PATTERN

  metric_transformation {
    name      = "UnauthorizedSecretAccessCount"
    namespace = "Clenergize/Security"
    value     = "1"
  }
}

resource "aws_cloudwatch_metric_alarm" "unauthorized_access" {
  alarm_name          = "UnauthorizedSecretAccess"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "UnauthorizedSecretAccessCount"
  namespace           = "Clenergize/Security"
  period              = "300"
  statistic           = "Sum"
  threshold           = "3"

  alarm_actions = [aws_sns_topic.security_alerts.arn]
}
```

**Alert on Rotation Failures**:
```hcl
resource "aws_cloudwatch_metric_alarm" "rotation_failed" {
  alarm_name          = "SecretRotationFailed"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "RotationFailed"
  namespace           = "AWS/SecretsManager"
  period              = "300"
  statistic           = "Sum"
  threshold           = "0"

  alarm_actions = [aws_sns_topic.devops_alerts.arn]
}
```

### 9.3 Secret Usage Metrics

**Custom CloudWatch Metrics**:
```typescript
// Log secret access
await cloudwatch.putMetricData({
  Namespace: 'Clenergize/Secrets',
  MetricData: [
    {
      MetricName: 'SecretAccess',
      Value: 1,
      Unit: 'Count',
      Dimensions: [
        { Name: 'SecretName', Value: secretName },
        { Name: 'Service', Value: serviceName },
        { Name: 'Environment', Value: environment }
      ],
      Timestamp: new Date()
    }
  ]
});
```

---

## 10. Migration from OLD System

### 10.1 Migration Checklist

**Phase 1: Setup (Week 1)**
- [ ] Create AWS Secrets Manager secrets for all environments
- [ ] Setup KMS encryption keys
- [ ] Configure IAM roles and policies
- [ ] Deploy rotation Lambda functions
- [ ] Test secret access from services

**Phase 2: Code Changes (Week 2)**
- [ ] Implement SecretsService in all services
- [ ] Update ConfigModule to use SecretsService
- [ ] Remove hardcoded secrets from code
- [ ] Add .env files to .gitignore
- [ ] Test locally with LocalStack

**Phase 3: Deployment (Week 3)**
- [ ] Deploy to staging environment
- [ ] Verify secret access works
- [ ] Test secret rotation
- [ ] Update ECS task definitions
- [ ] Deploy to production

**Phase 4: Cleanup (Week 4)**
- [ ] Remove .env files from Git history (BFG Repo-Cleaner)
- [ ] Revoke old AWS access keys
- [ ] Rotate all compromised secrets
- [ ] Update documentation
- [ ] Train team on new process

### 10.2 Git History Cleanup

**Remove secrets from Git history**:
```bash
# Install BFG Repo-Cleaner
brew install bfg

# Clone repo with mirror
git clone --mirror https://github.com/yourcompany/clenergize-v3.git

# Remove .env files from history
bfg --delete-files .env clenergize-v3.git
bfg --delete-files .env.production clenergize-v3.git
bfg --delete-files .env.staging clenergize-v3.git

# Clean up
cd clenergize-v3.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (DANGEROUS - coordinate with team!)
git push --force
```

### 10.3 Secret Rotation After Migration

**Immediately rotate all secrets** that were in Git:
```bash
# Rotate all database passwords
aws secretsmanager rotate-secret --secret-id /clenergize/prod/mongodb-root
aws secretsmanager rotate-secret --secret-id /clenergize/prod/identity/mongodb-password

# Rotate AWS access keys
aws iam create-access-key --user-name clenergize-app
# Update secret with new keys
aws secretsmanager put-secret-value --secret-id /clenergize/prod/aws/access-keys --secret-string '{...}'
# Delete old access key
aws iam delete-access-key --access-key-id AKIAIOSFODNN7EXAMPLE --user-name clenergize-app

# Regenerate API keys for third-party services
# (Manual process for SendGrid, Stripe, etc.)
```

---

## 11. Best Practices

### 11.1 Secret Naming

✅ **DO**:
- Use hierarchical naming: `/clenergize/{env}/{service}/{secret-name}`
- Use lowercase and hyphens
- Be descriptive: `mongodb-password` not `db-pw`

❌ **DON'T**:
- Use generic names: `password`, `key`, `secret`
- Include sensitive data in name: `admin-password-Abc123`
- Use spaces or special characters

### 11.2 Secret Values

✅ **DO**:
- Store complex secrets as JSON
- Use strong, random passwords (32+ characters)
- Include metadata (expiresAt, rotatedAt, etc.)

❌ **DON'T**:
- Store multiple unrelated secrets in one
- Use weak passwords
- Include comments in JSON

### 11.3 Code Practices

✅ **DO**:
- Load secrets at application startup
- Cache secrets in memory (short TTL)
- Mask secrets in logs and errors
- Use dependency injection

❌ **DON'T**:
- Log secret values
- Store secrets in global variables
- Pass secrets as URL parameters
- Include secrets in error messages

**Example - Mask Secrets in Logs**:
```typescript
class SecretMasker {
  static mask(value: string): string {
    if (value.length <= 8) {
      return '***';
    }
    return value.substring(0, 4) + '***' + value.substring(value.length - 4);
  }
}

// Usage
console.log(`Database password: ${SecretMasker.mask(password)}`);
// Output: Database password: Qw3r***cDeF
```

### 11.4 Rotation Best Practices

✅ **DO**:
- Rotate regularly (30-90 days)
- Test rotation in staging first
- Have overlap period for zero-downtime
- Monitor rotation success

❌ **DON'T**:
- Skip rotation testing
- Rotate without overlap
- Ignore rotation failures
- Manually rotate (automate!)

---

## 12. Disaster Recovery

### 12.1 Secret Backup

**Automated Backup**:
```python
# backup_secrets.py
import boto3
import json
from datetime import datetime

secrets_client = boto3.client('secretsmanager')
s3_client = boto3.client('s3')

def backup_all_secrets():
    """Backup all secrets to S3"""
    secrets = secrets_client.list_secrets()

    backup = {
        'timestamp': datetime.now().isoformat(),
        'secrets': []
    }

    for secret in secrets['SecretList']:
        secret_name = secret['Name']

        # Get secret value
        response = secrets_client.get_secret_value(SecretId=secret_name)

        backup['secrets'].append({
            'name': secret_name,
            'value': response['SecretString'],
            'versionId': response['VersionId'],
            'createdDate': secret['CreatedDate'].isoformat()
        })

    # Upload to S3 (encrypted bucket)
    s3_client.put_object(
        Bucket='clenergize-secrets-backup',
        Key=f'backups/{datetime.now().strftime("%Y-%m-%d")}.json.enc',
        Body=json.dumps(backup),
        ServerSideEncryption='aws:kms',
        SSEKMSKeyId='arn:aws:kms:us-east-1:123456789012:key/backup-key'
    )

# Run daily via Lambda
```

### 12.2 Secret Recovery

**Restore from Backup**:
```python
def restore_secret(secret_name: str, backup_file: str):
    """Restore secret from S3 backup"""
    # Download backup
    response = s3_client.get_object(
        Bucket='clenergize-secrets-backup',
        Key=backup_file
    )

    backup = json.loads(response['Body'].read())

    # Find secret in backup
    secret_data = next(
        (s for s in backup['secrets'] if s['name'] == secret_name),
        None
    )

    if not secret_data:
        raise ValueError(f"Secret {secret_name} not found in backup")

    # Restore secret
    try:
        secrets_client.create_secret(
            Name=secret_name,
            SecretString=secret_data['value']
        )
    except secrets_client.exceptions.ResourceExistsException:
        # Secret exists, update it
        secrets_client.put_secret_value(
            SecretId=secret_name,
            SecretString=secret_data['value']
        )
```

### 12.3 Emergency Access

**Break Glass Procedure**:

1. **Emergency IAM Role** (activated only during incidents):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:*"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:RequestedRegion": "us-east-1"
        }
      }
    }
  ]
}
```

2. **MFA Required**:
```json
{
  "Condition": {
    "BoolIfExists": {
      "aws:MultiFactorAuthPresent": "true"
    }
  }
}
```

3. **Audit All Access**:
```python
# Log emergency access
cloudtrail.lookup_events(
    LookupAttributes=[{
        'AttributeKey': 'Username',
        'AttributeValue': 'emergency-admin'
    }]
)
```

---

## Summary

This secrets management strategy provides a **secure, scalable, and auditable** system for managing secrets in Clenergize V3:

**Key Benefits**:
1. ✅ **Zero Secrets in Code** - All secrets in AWS Secrets Manager
2. ✅ **Automated Rotation** - 30-90 day rotation with zero downtime
3. ✅ **Encryption at Rest** - AES-256 with KMS
4. ✅ **Access Control** - IAM-based with least privilege
5. ✅ **Complete Audit Trail** - CloudTrail logging all access
6. ✅ **Local Development** - LocalStack simulation
7. ✅ **Disaster Recovery** - Automated backups to S3

**Implementation Timeline**:
- Week 1: Setup AWS Secrets Manager
- Week 2: Implement SecretsService in all services
- Week 3: Deploy to staging and production
- Week 4: Cleanup Git history and rotate all secrets

---

**Last Updated**: November 18, 2025
**Next Review**: End of Sprint 0.3
**Maintained By**: Security Agent + DevOps Agent
