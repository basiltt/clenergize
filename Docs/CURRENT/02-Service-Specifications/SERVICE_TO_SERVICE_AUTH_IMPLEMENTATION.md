# Service-to-Service Authentication Implementation

## Executive Summary

This document provides complete implementation for securing service-to-service communication in the Clenergize V3 platform using mutual TLS (mTLS) with AWS Private Certificate Authority as the primary mechanism and JWT service tokens as fallback.

**Security Level**: Zero-Trust Architecture
**Implementation Time**: 6 hours
**Complexity**: Medium

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [mTLS Implementation](#mtls-implementation)
3. [JWT Service Tokens](#jwt-service-tokens)
4. [Service Registry](#service-registry)
5. [NestJS Middleware Implementation](#nestjs-middleware-implementation)
6. [Service Client Implementation](#service-client-implementation)
7. [Certificate Management](#certificate-management)
8. [Testing Strategy](#testing-strategy)
9. [Monitoring & Alerting](#monitoring-alerting)
10. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Security Model

```
┌─────────────────────────────────────────────────────────────┐
│                   Service-to-Service Auth                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Primary: mTLS (Mutual TLS)                                │
│  • AWS Private Certificate Authority                       │
│  • Automatic certificate rotation (30 days)                │
│  • Certificate pinning for critical services               │
│                                                             │
│  Fallback: JWT Service Tokens                              │
│  • Short-lived tokens (5 minutes)                          │
│  • Service-specific signing keys                           │
│  • Asymmetric RS256 algorithm                              │
│                                                             │
│  Service Registry:                                         │
│  • AWS Cloud Map for discovery                             │
│  • Health check validation                                 │
│  • Allowed services matrix                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Trust Model

```typescript
// Service communication matrix
const SERVICE_TRUST_MATRIX = {
  'identity-service': {
    canCall: ['audit-service'],
    canBeCalledBy: ['api-gateway', 'organization-service'],
  },
  'organization-service': {
    canCall: ['identity-service', 'reference-service', 'audit-service'],
    canBeCalledBy: ['api-gateway', 'activity-service'],
  },
  'reference-service': {
    canCall: ['audit-service'],
    canBeCalledBy: ['organization-service', 'activity-service', 'calculation-service'],
  },
  'activity-service': {
    canCall: ['organization-service', 'reference-service', 'audit-service'],
    canBeCalledBy: ['api-gateway', 'calculation-service'],
  },
  'calculation-service': {
    canCall: ['activity-service', 'reference-service', 'audit-service'],
    canBeCalledBy: ['api-gateway', 'reporting-service'],
  },
  'reporting-service': {
    canCall: ['calculation-service', 'organization-service', 'audit-service'],
    canBeCalledBy: ['api-gateway'],
  },
  'audit-service': {
    canCall: [], // Audit doesn't call other services
    canBeCalledBy: ['*'], // All services can write audit logs
  },
};
```

---

## mTLS Implementation

### AWS Private Certificate Authority Setup

```typescript
// File: infrastructure/cdk/lib/stacks/pca-stack.ts

import * as cdk from 'aws-cdk-lib';
import * as acmpca from 'aws-cdk-lib/aws-acmpca';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { Construct } from 'constructs';

export class PcaStack extends cdk.Stack {
  public readonly ca: acmpca.CfnCertificateAuthority;

  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    // Create Private Certificate Authority
    this.ca = new acmpca.CfnCertificateAuthority(this, 'ServiceCA', {
      type: 'ROOT',
      keyAlgorithm: 'RSA_4096',
      signingAlgorithm: 'SHA512WITHRSA',
      subject: {
        country: 'US',
        organization: 'Clenergize',
        organizationalUnit: 'Platform Services',
        commonName: 'Clenergize Service Root CA',
      },
      revocationConfiguration: {
        crlConfiguration: {
          enabled: true,
          expirationInDays: 7,
          s3BucketName: 'clenergize-ca-crl',
        },
      },
    });

    // Activate the CA
    const caActivation = new acmpca.CfnCertificate(this, 'CACertificate', {
      certificateAuthorityArn: this.ca.attrArn,
      certificateSigningRequest: this.ca.attrCertificateSigningRequest,
      signingAlgorithm: 'SHA512WITHRSA',
      validity: {
        type: 'YEARS',
        value: 10,
      },
      templateArn: 'arn:aws:acm-pca:::template/RootCACertificate/V1',
    });

    // Auto-rotate certificates every 30 days
    const rotationFunction = new lambda.Function(this, 'CertRotation', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'cert-rotation.handler',
      code: lambda.Code.fromInline(this.getCertRotationCode()),
      timeout: cdk.Duration.minutes(5),
      environment: {
        CA_ARN: this.ca.attrArn,
      },
    });

    // Schedule rotation
    const rotationRule = new events.Rule(this, 'RotationSchedule', {
      schedule: events.Schedule.rate(cdk.Duration.days(25)), // 5 days before expiry
    });

    rotationRule.addTarget(new targets.LambdaFunction(rotationFunction));
  }

  private getCertRotationCode(): string {
    return `
const AWS = require('aws-sdk');
const acmpca = new AWS.ACMPCA();
const secretsManager = new AWS.SecretsManager();

exports.handler = async (event) => {
  const services = [
    'identity', 'organization', 'reference',
    'activity', 'calculation', 'reporting', 'audit'
  ];

  for (const service of services) {
    try {
      // Generate new certificate
      const cert = await acmpca.issueCertificate({
        CertificateAuthorityArn: process.env.CA_ARN,
        Csr: await generateCSR(service),
        SigningAlgorithm: 'SHA512WITHRSA',
        Validity: {
          Type: 'DAYS',
          Value: 30
        },
        TemplateArn: 'arn:aws:acm-pca:::template/EndEntityCertificate/V1'
      }).promise();

      // Store in Secrets Manager
      await secretsManager.putSecretValue({
        SecretId: \`clenergize/\${service}/tls-cert\`,
        SecretString: JSON.stringify({
          certificate: cert.Certificate,
          privateKey: cert.PrivateKey,
          certificateChain: cert.CertificateChain,
          rotatedAt: new Date().toISOString()
        })
      }).promise();

      console.log(\`Rotated certificate for \${service}\`);
    } catch (error) {
      console.error(\`Failed to rotate \${service}:\`, error);
      throw error;
    }
  }
};

async function generateCSR(serviceName) {
  // Generate CSR for service
  // Implementation depends on your crypto library
  return \`-----BEGIN CERTIFICATE REQUEST-----
...
-----END CERTIFICATE REQUEST-----\`;
}
    `;
  }
}
```

### Certificate Validation Middleware

```typescript
// File: NEW/shared/src/auth/mtls.middleware.ts

import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as tls from 'tls';
import * as crypto from 'crypto';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MtlsMiddleware implements NestMiddleware {
  private trustedCertificates: Map<string, string> = new Map();
  private readonly secretsClient: SecretsManagerClient;

  constructor(private configService: ConfigService) {
    this.secretsClient = new SecretsManagerClient({
      region: this.configService.get('AWS_REGION'),
    });
    this.loadTrustedCertificates();
  }

  async use(req: Request, res: Response, next: NextFunction) {
    // Skip mTLS for health checks
    if (req.path === '/health') {
      return next();
    }

    // Get client certificate
    const clientCert = (req.socket as tls.TLSSocket).getPeerCertificate();

    if (!clientCert || !clientCert.subject) {
      // Fallback to JWT service token
      return this.validateServiceToken(req, res, next);
    }

    try {
      // Validate certificate
      await this.validateCertificate(clientCert, req);

      // Extract service identity
      const serviceId = this.extractServiceIdentity(clientCert);

      // Check trust matrix
      if (!this.isAllowedCommunication(serviceId, req.hostname)) {
        throw new UnauthorizedException(
          `Service ${serviceId} not allowed to call ${req.hostname}`
        );
      }

      // Add service identity to request
      (req as any).serviceIdentity = {
        serviceId,
        certificateSubject: clientCert.subject,
        validUntil: clientCert.valid_to,
      };

      next();
    } catch (error) {
      console.error('mTLS validation failed:', error);
      throw new UnauthorizedException('Invalid client certificate');
    }
  }

  private async validateCertificate(cert: any, req: Request): Promise<void> {
    // 1. Check certificate validity period
    const now = new Date();
    const validFrom = new Date(cert.valid_from);
    const validTo = new Date(cert.valid_to);

    if (now < validFrom || now > validTo) {
      throw new Error('Certificate expired or not yet valid');
    }

    // 2. Verify certificate chain
    if (!cert.issuerCertificate) {
      throw new Error('Certificate chain incomplete');
    }

    // 3. Check certificate pinning for critical services
    const serviceName = cert.subject.CN;
    if (this.isCriticalService(serviceName)) {
      const pinnedCert = this.trustedCertificates.get(serviceName);
      const certFingerprint = this.calculateFingerprint(cert.raw);

      if (pinnedCert !== certFingerprint) {
        throw new Error('Certificate pinning validation failed');
      }
    }

    // 4. Verify against CRL (Certificate Revocation List)
    const isRevoked = await this.checkCRL(cert.serialNumber);
    if (isRevoked) {
      throw new Error('Certificate has been revoked');
    }

    // 5. Validate certificate purpose
    if (!cert.ext_key_usage || !cert.ext_key_usage.includes('1.3.6.1.5.5.7.3.2')) {
      throw new Error('Certificate not valid for client authentication');
    }
  }

  private async validateServiceToken(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['x-service-token'] as string;

    if (!token) {
      throw new UnauthorizedException('No authentication provided');
    }

    try {
      // Verify JWT service token
      const payload = await this.verifyServiceToken(token);

      // Check token expiration (5 minutes max)
      const issued = new Date(payload.iat * 1000);
      const now = new Date();
      const age = (now.getTime() - issued.getTime()) / 1000;

      if (age > 300) { // 5 minutes
        throw new Error('Service token expired');
      }

      // Check service allowlist
      if (!this.isAllowedCommunication(payload.serviceId, req.hostname)) {
        throw new UnauthorizedException(
          `Service ${payload.serviceId} not allowed to call ${req.hostname}`
        );
      }

      // Add service identity to request
      (req as any).serviceIdentity = {
        serviceId: payload.serviceId,
        tokenId: payload.jti,
        validUntil: new Date(payload.exp * 1000),
      };

      next();
    } catch (error) {
      console.error('Service token validation failed:', error);
      throw new UnauthorizedException('Invalid service token');
    }
  }

  private extractServiceIdentity(cert: any): string {
    // Extract service name from certificate CN
    const cn = cert.subject.CN;
    const match = cn.match(/^(.+)-service\.clenergize\.local$/);

    if (!match) {
      throw new Error('Invalid certificate CN format');
    }

    return match[1];
  }

  private isAllowedCommunication(caller: string, target: string): boolean {
    const trustMatrix = this.configService.get('SERVICE_TRUST_MATRIX');
    const callerConfig = trustMatrix[`${caller}-service`];

    if (!callerConfig) {
      return false;
    }

    // Extract target service name from hostname
    const targetService = target.split('.')[0];

    return callerConfig.canCall.includes(targetService) ||
           callerConfig.canCall.includes('*');
  }

  private isCriticalService(serviceName: string): boolean {
    const criticalServices = ['identity', 'audit', 'calculation'];
    return criticalServices.some(s => serviceName.includes(s));
  }

  private calculateFingerprint(certRaw: Buffer): string {
    return crypto.createHash('sha256').update(certRaw).digest('hex');
  }

  private async checkCRL(serialNumber: string): Promise<boolean> {
    // Check Certificate Revocation List
    // In production, this would query the actual CRL endpoint
    const crlEndpoint = this.configService.get('CRL_ENDPOINT');

    try {
      // Simplified CRL check - implement actual CRL parsing
      const response = await fetch(`${crlEndpoint}/check/${serialNumber}`);
      const data = await response.json();
      return data.revoked === true;
    } catch (error) {
      console.error('CRL check failed:', error);
      // Fail open in dev, fail closed in production
      return this.configService.get('NODE_ENV') === 'production';
    }
  }

  private async loadTrustedCertificates() {
    // Load pinned certificates for critical services
    const services = ['identity', 'audit', 'calculation'];

    for (const service of services) {
      try {
        const secret = await this.secretsClient.send(
          new GetSecretValueCommand({
            SecretId: `clenergize/${service}/tls-cert-fingerprint`,
          })
        );

        if (secret.SecretString) {
          const data = JSON.parse(secret.SecretString);
          this.trustedCertificates.set(`${service}-service`, data.fingerprint);
        }
      } catch (error) {
        console.error(`Failed to load certificate for ${service}:`, error);
      }
    }
  }

  private async verifyServiceToken(token: string): Promise<any> {
    // Verify JWT with service public key
    const [header, payload, signature] = token.split('.');
    const decodedHeader = JSON.parse(Buffer.from(header, 'base64').toString());

    // Get service public key
    const publicKey = await this.getServicePublicKey(decodedHeader.kid);

    // Verify signature
    const crypto = require('crypto');
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(`${header}.${payload}`);

    if (!verifier.verify(publicKey, signature, 'base64')) {
      throw new Error('Invalid token signature');
    }

    return JSON.parse(Buffer.from(payload, 'base64').toString());
  }

  private async getServicePublicKey(keyId: string): Promise<string> {
    // Fetch public key from Secrets Manager
    const secret = await this.secretsClient.send(
      new GetSecretValueCommand({
        SecretId: `clenergize/service-keys/${keyId}/public`,
      })
    );

    return secret.SecretString || '';
  }
}
```

---

## JWT Service Tokens

### Token Generation

```typescript
// File: NEW/shared/src/auth/service-token.service.ts

import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ServiceTokenService {
  private readonly secretsClient: SecretsManagerClient;
  private privateKey: string;
  private publicKey: string;
  private keyId: string;

  constructor(private configService: ConfigService) {
    this.secretsClient = new SecretsManagerClient({
      region: this.configService.get('AWS_REGION'),
    });
    this.initializeKeys();
  }

  async generateServiceToken(targetService: string): Promise<string> {
    const serviceName = this.configService.get('SERVICE_NAME');
    const now = Math.floor(Date.now() / 1000);

    const payload = {
      iss: `clenergize:${serviceName}`,
      sub: `service:${serviceName}`,
      aud: `service:${targetService}`,
      iat: now,
      exp: now + 300, // 5 minutes
      nbf: now,
      jti: crypto.randomUUID(),
      serviceId: serviceName,
      targetService: targetService,
      permissions: this.getServicePermissions(serviceName, targetService),
    };

    return jwt.sign(payload, this.privateKey, {
      algorithm: 'RS256',
      keyid: this.keyId,
    });
  }

  async verifyServiceToken(token: string, expectedIssuer?: string): Promise<any> {
    try {
      const decoded = jwt.decode(token, { complete: true });
      if (!decoded) {
        throw new Error('Invalid token format');
      }

      // Get issuer's public key
      const issuerKey = await this.getIssuerPublicKey(decoded.payload.iss);

      // Verify token
      const verified = jwt.verify(token, issuerKey, {
        algorithms: ['RS256'],
        issuer: expectedIssuer || decoded.payload.iss,
        audience: `service:${this.configService.get('SERVICE_NAME')}`,
        clockTolerance: 10, // 10 seconds clock skew tolerance
      });

      // Additional validation
      this.validateTokenClaims(verified);

      return verified;
    } catch (error) {
      console.error('Token verification failed:', error);
      throw new Error('Invalid service token');
    }
  }

  private async initializeKeys() {
    const serviceName = this.configService.get('SERVICE_NAME');

    try {
      // Load existing keys from Secrets Manager
      const secret = await this.secretsClient.send(
        new GetSecretValueCommand({
          SecretId: `clenergize/${serviceName}/service-keys`,
        })
      );

      if (secret.SecretString) {
        const keys = JSON.parse(secret.SecretString);
        this.privateKey = keys.privateKey;
        this.publicKey = keys.publicKey;
        this.keyId = keys.keyId;
        return;
      }
    } catch (error) {
      // Keys don't exist, generate new ones
      await this.generateAndStoreKeys();
    }
  }

  private async generateAndStoreKeys() {
    const serviceName = this.configService.get('SERVICE_NAME');

    // Generate RSA key pair
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    this.privateKey = privateKey;
    this.publicKey = publicKey;
    this.keyId = crypto.randomUUID();

    // Store in Secrets Manager
    await this.secretsClient.send(
      new GetSecretValueCommand({
        SecretId: `clenergize/${serviceName}/service-keys`,
        SecretString: JSON.stringify({
          privateKey: this.privateKey,
          publicKey: this.publicKey,
          keyId: this.keyId,
          createdAt: new Date().toISOString(),
        }),
      })
    );

    // Store public key separately for other services
    await this.secretsClient.send(
      new GetSecretValueCommand({
        SecretId: `clenergize/service-keys/${this.keyId}/public`,
        SecretString: this.publicKey,
      })
    );
  }

  private getServicePermissions(caller: string, target: string): string[] {
    const permissions = {
      'identity-service': {
        'audit-service': ['write:audit-log'],
        'organization-service': ['read:user', 'read:permissions'],
      },
      'organization-service': {
        'identity-service': ['read:user', 'validate:permission'],
        'reference-service': ['read:master-data'],
        'audit-service': ['write:audit-log'],
      },
      'calculation-service': {
        'activity-service': ['read:activity-data'],
        'reference-service': ['read:emission-factors'],
        'audit-service': ['write:audit-log'],
      },
    };

    return permissions[caller]?.[target] || [];
  }

  private async getIssuerPublicKey(issuer: string): Promise<string> {
    const serviceName = issuer.replace('clenergize:', '');

    const secret = await this.secretsClient.send(
      new GetSecretValueCommand({
        SecretId: `clenergize/${serviceName}/service-keys`,
      })
    );

    if (!secret.SecretString) {
      throw new Error(`No public key found for ${serviceName}`);
    }

    const keys = JSON.parse(secret.SecretString);
    return keys.publicKey;
  }

  private validateTokenClaims(payload: any) {
    // Validate token age
    const age = Date.now() / 1000 - payload.iat;
    if (age > 300) { // 5 minutes
      throw new Error('Token too old');
    }

    // Validate permissions
    if (!payload.permissions || !Array.isArray(payload.permissions)) {
      throw new Error('Invalid permissions claim');
    }

    // Validate service IDs
    if (!payload.serviceId || !payload.targetService) {
      throw new Error('Missing service identification');
    }
  }
}
```

---

## Service Registry

### Service Discovery Implementation

```typescript
// File: NEW/shared/src/discovery/service-registry.ts

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import {
  ServiceDiscoveryClient,
  RegisterInstanceCommand,
  DeregisterInstanceCommand,
  DiscoverInstancesCommand,
  GetInstanceCommand,
} from '@aws-sdk/client-servicediscovery';
import { ConfigService } from '@nestjs/config';
import * as os from 'os';

@Injectable()
export class ServiceRegistry implements OnModuleInit, OnModuleDestroy {
  private readonly client: ServiceDiscoveryClient;
  private instanceId: string;
  private registrationInterval: NodeJS.Timeout;

  constructor(private configService: ConfigService) {
    this.client = new ServiceDiscoveryClient({
      region: this.configService.get('AWS_REGION'),
    });
    this.instanceId = `${this.configService.get('SERVICE_NAME')}-${os.hostname()}`;
  }

  async onModuleInit() {
    await this.registerService();

    // Re-register every 30 seconds (heartbeat)
    this.registrationInterval = setInterval(() => {
      this.updateHealth();
    }, 30000);
  }

  async onModuleDestroy() {
    clearInterval(this.registrationInterval);
    await this.deregisterService();
  }

  private async registerService() {
    const serviceName = this.configService.get('SERVICE_NAME');
    const port = this.configService.get('PORT');

    try {
      await this.client.send(new RegisterInstanceCommand({
        ServiceId: this.getServiceId(serviceName),
        InstanceId: this.instanceId,
        Attributes: {
          AWS_INSTANCE_IPV4: this.getPrivateIp(),
          AWS_INSTANCE_PORT: port.toString(),
          SERVICE_NAME: serviceName,
          VERSION: this.configService.get('VERSION'),
          HEALTH_STATUS: 'HEALTHY',
          MTLS_ENABLED: 'true',
          PUBLIC_KEY_ID: this.configService.get('SERVICE_KEY_ID'),
          REGISTERED_AT: new Date().toISOString(),
        },
      }));

      console.log(`Service ${serviceName} registered with ID ${this.instanceId}`);
    } catch (error) {
      console.error('Failed to register service:', error);
      throw error;
    }
  }

  private async deregisterService() {
    const serviceName = this.configService.get('SERVICE_NAME');

    try {
      await this.client.send(new DeregisterInstanceCommand({
        ServiceId: this.getServiceId(serviceName),
        InstanceId: this.instanceId,
      }));

      console.log(`Service ${serviceName} deregistered`);
    } catch (error) {
      console.error('Failed to deregister service:', error);
    }
  }

  async discoverService(targetService: string): Promise<ServiceInstance[]> {
    try {
      const response = await this.client.send(new DiscoverInstancesCommand({
        NamespaceName: 'clenergize.local',
        ServiceName: targetService,
        HealthStatus: 'HEALTHY',
        MaxResults: 10,
      }));

      if (!response.Instances || response.Instances.length === 0) {
        throw new Error(`No healthy instances found for ${targetService}`);
      }

      return response.Instances.map(instance => ({
        instanceId: instance.InstanceId || '',
        ipAddress: instance.Attributes?.AWS_INSTANCE_IPV4 || '',
        port: parseInt(instance.Attributes?.AWS_INSTANCE_PORT || '3000'),
        version: instance.Attributes?.VERSION || '',
        mtlsEnabled: instance.Attributes?.MTLS_ENABLED === 'true',
        publicKeyId: instance.Attributes?.PUBLIC_KEY_ID || '',
        healthStatus: instance.HealthStatus || 'UNKNOWN',
      }));
    } catch (error) {
      console.error(`Failed to discover ${targetService}:`, error);
      throw error;
    }
  }

  private async updateHealth() {
    // Update instance health status
    const health = await this.checkHealth();

    try {
      await this.client.send(new RegisterInstanceCommand({
        ServiceId: this.getServiceId(this.configService.get('SERVICE_NAME')),
        InstanceId: this.instanceId,
        Attributes: {
          HEALTH_STATUS: health ? 'HEALTHY' : 'UNHEALTHY',
          LAST_HEARTBEAT: new Date().toISOString(),
        },
      }));
    } catch (error) {
      console.error('Failed to update health:', error);
    }
  }

  private async checkHealth(): Promise<boolean> {
    // Implement health check logic
    // Check database connection, memory usage, etc.
    return true;
  }

  private getServiceId(serviceName: string): string {
    // Map service names to AWS Cloud Map service IDs
    const serviceMap = {
      'identity': 'srv-identity-xxx',
      'organization': 'srv-organization-xxx',
      'reference': 'srv-reference-xxx',
      'activity': 'srv-activity-xxx',
      'calculation': 'srv-calculation-xxx',
      'reporting': 'srv-reporting-xxx',
      'audit': 'srv-audit-xxx',
    };

    return serviceMap[serviceName] || 'srv-unknown';
  }

  private getPrivateIp(): string {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name] || []) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
    return '127.0.0.1';
  }
}

interface ServiceInstance {
  instanceId: string;
  ipAddress: string;
  port: number;
  version: string;
  mtlsEnabled: boolean;
  publicKeyId: string;
  healthStatus: string;
}
```

---

## NestJS Middleware Implementation

### Module Configuration

```typescript
// File: NEW/shared/src/auth/auth.module.ts

import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MtlsMiddleware } from './mtls.middleware';
import { ServiceTokenService } from './service-token.service';
import { ServiceRegistry } from '../discovery/service-registry';
import { ServiceAuthGuard } from './service-auth.guard';

@Module({
  imports: [ConfigModule],
  providers: [
    MtlsMiddleware,
    ServiceTokenService,
    ServiceRegistry,
    ServiceAuthGuard,
  ],
  exports: [
    ServiceTokenService,
    ServiceRegistry,
    ServiceAuthGuard,
  ],
})
export class ServiceAuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MtlsMiddleware)
      .exclude('/health', '/metrics')
      .forRoutes('*');
  }
}
```

### Service Auth Guard

```typescript
// File: NEW/shared/src/auth/service-auth.guard.ts

import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

export const AllowedServices = (services: string[]) =>
  Reflect.metadata('allowed-services', services);

@Injectable()
export class ServiceAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedServices = this.reflector.get<string[]>(
      'allowed-services',
      context.getHandler()
    );

    if (!allowedServices || allowedServices.length === 0) {
      return true; // No restriction if not specified
    }

    const request = context.switchToHttp().getRequest();
    const serviceIdentity = request.serviceIdentity;

    if (!serviceIdentity) {
      throw new UnauthorizedException('No service identity found');
    }

    if (allowedServices.includes('*')) {
      return true; // Allow all authenticated services
    }

    if (!allowedServices.includes(serviceIdentity.serviceId)) {
      throw new UnauthorizedException(
        `Service ${serviceIdentity.serviceId} not allowed to access this endpoint`
      );
    }

    return true;
  }
}
```

---

## Service Client Implementation

### HTTP Client with mTLS

```typescript
// File: NEW/shared/src/http/service-client.ts

import { Injectable } from '@nestjs/common';
import * as https from 'https';
import * as fs from 'fs';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ServiceTokenService } from '../auth/service-token.service';
import { ServiceRegistry } from '../discovery/service-registry';
import { ConfigService } from '@nestjs/config';
import { CircuitBreaker } from '../resilience/circuit-breaker';

@Injectable()
export class ServiceClient {
  private clients: Map<string, AxiosInstance> = new Map();
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();

  constructor(
    private tokenService: ServiceTokenService,
    private registry: ServiceRegistry,
    private configService: ConfigService,
  ) {
    this.initializeClients();
  }

  async call<T>(
    service: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    data?: any,
    options?: AxiosRequestConfig,
  ): Promise<T> {
    const client = await this.getClient(service);
    const breaker = this.getCircuitBreaker(service);

    return breaker.execute(async () => {
      const response = await client.request<T>({
        method,
        url: path,
        data,
        ...options,
      });

      return response.data;
    });
  }

  private async getClient(service: string): Promise<AxiosInstance> {
    if (!this.clients.has(service)) {
      await this.createClient(service);
    }

    return this.clients.get(service)!;
  }

  private async createClient(service: string) {
    // Discover service endpoint
    const instances = await this.registry.discoverService(service);
    const instance = this.selectInstance(instances);

    // Load mTLS certificates
    const cert = await this.loadCertificate();
    const key = await this.loadPrivateKey();
    const ca = await this.loadCACertificate();

    // Create HTTPS agent with mTLS
    const httpsAgent = new https.Agent({
      cert,
      key,
      ca,
      rejectUnauthorized: true,
      keepAlive: true,
      maxSockets: 10,
    });

    // Create Axios instance
    const client = axios.create({
      baseURL: `https://${instance.ipAddress}:${instance.port}`,
      timeout: 5000,
      httpsAgent,
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Name': this.configService.get('SERVICE_NAME'),
        'X-Correlation-Id': this.getCorrelationId(),
      },
    });

    // Add request interceptor for service token fallback
    client.interceptors.request.use(async (config) => {
      if (!instance.mtlsEnabled) {
        // Use service token if mTLS not available
        const token = await this.tokenService.generateServiceToken(service);
        config.headers['X-Service-Token'] = token;
      }

      return config;
    });

    // Add response interceptor for error handling
    client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 503) {
          // Service unavailable, try another instance
          const newInstance = await this.failoverToNextInstance(service);
          if (newInstance) {
            // Retry with new instance
            return client.request(error.config);
          }
        }

        throw error;
      }
    );

    this.clients.set(service, client);
  }

  private selectInstance(instances: any[]): any {
    // Round-robin selection with health check
    const healthyInstances = instances.filter(i => i.healthStatus === 'HEALTHY');

    if (healthyInstances.length === 0) {
      throw new Error('No healthy instances available');
    }

    // Simple round-robin
    const index = Math.floor(Math.random() * healthyInstances.length);
    return healthyInstances[index];
  }

  private async failoverToNextInstance(service: string): Promise<any> {
    // Re-discover and select different instance
    const instances = await this.registry.discoverService(service);
    return this.selectInstance(instances);
  }

  private getCircuitBreaker(service: string): CircuitBreaker {
    if (!this.circuitBreakers.has(service)) {
      this.circuitBreakers.set(service, new CircuitBreaker({
        name: `${service}-breaker`,
        timeout: 5000,
        errorThreshold: 5,
        resetTimeout: 30000,
      }));
    }

    return this.circuitBreakers.get(service)!;
  }

  private async loadCertificate(): Promise<string> {
    // Load from Secrets Manager or file system
    const secretName = `clenergize/${this.configService.get('SERVICE_NAME')}/tls-cert`;
    // Implementation depends on your secret storage
    return '';
  }

  private async loadPrivateKey(): Promise<string> {
    // Load from Secrets Manager or file system
    const secretName = `clenergize/${this.configService.get('SERVICE_NAME')}/tls-key`;
    return '';
  }

  private async loadCACertificate(): Promise<string> {
    // Load CA certificate
    const secretName = 'clenergize/ca-cert';
    return '';
  }

  private getCorrelationId(): string {
    // Get from AsyncLocalStorage or generate new
    return require('crypto').randomUUID();
  }

  private initializeClients() {
    // Pre-initialize clients for known services
    const services = [
      'identity', 'organization', 'reference',
      'activity', 'calculation', 'reporting', 'audit'
    ];

    // Don't await, let them initialize in background
    services.forEach(service => {
      this.createClient(service).catch(err =>
        console.warn(`Failed to initialize client for ${service}:`, err)
      );
    });
  }
}
```

---

## Certificate Management

### Automated Rotation

```typescript
// File: NEW/shared/src/certs/cert-manager.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as crypto from 'crypto';
import { SecretsManagerClient, GetSecretValueCommand, PutSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { ACMPCAClient, IssueCertificateCommand, GetCertificateCommand } from '@aws-sdk/client-acm-pca';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CertificateManager implements OnModuleInit {
  private secretsClient: SecretsManagerClient;
  private acmPcaClient: ACMPCAClient;
  private rotationTimer: NodeJS.Timeout;

  constructor(private configService: ConfigService) {
    this.secretsClient = new SecretsManagerClient({
      region: this.configService.get('AWS_REGION'),
    });

    this.acmPcaClient = new ACMPCAClient({
      region: this.configService.get('AWS_REGION'),
    });
  }

  async onModuleInit() {
    // Check certificate validity on startup
    await this.checkAndRotateCertificate();

    // Schedule daily check
    this.rotationTimer = setInterval(() => {
      this.checkAndRotateCertificate();
    }, 24 * 60 * 60 * 1000); // 24 hours
  }

  async onModuleDestroy() {
    clearInterval(this.rotationTimer);
  }

  private async checkAndRotateCertificate() {
    const serviceName = this.configService.get('SERVICE_NAME');

    try {
      const cert = await this.getCurrentCertificate();

      if (!cert || this.shouldRotate(cert)) {
        console.log('Certificate rotation needed');
        await this.rotateCertificate();
      }
    } catch (error) {
      console.error('Certificate rotation check failed:', error);
    }
  }

  private async getCurrentCertificate(): Promise<any> {
    const serviceName = this.configService.get('SERVICE_NAME');

    try {
      const secret = await this.secretsClient.send(
        new GetSecretValueCommand({
          SecretId: `clenergize/${serviceName}/tls-cert`,
        })
      );

      if (secret.SecretString) {
        return JSON.parse(secret.SecretString);
      }
    } catch (error) {
      console.log('No existing certificate found');
    }

    return null;
  }

  private shouldRotate(cert: any): boolean {
    // Rotate if certificate expires in less than 5 days
    const expiryDate = new Date(cert.validTo);
    const now = new Date();
    const daysUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    return daysUntilExpiry < 5;
  }

  private async rotateCertificate() {
    const serviceName = this.configService.get('SERVICE_NAME');

    // Generate new private key and CSR
    const { privateKey, csr } = await this.generateCSR(serviceName);

    // Request new certificate from Private CA
    const certificateArn = await this.requestCertificate(csr);

    // Wait for certificate to be issued
    const certificate = await this.waitForCertificate(certificateArn);

    // Store new certificate and key
    await this.storeCertificate(certificate, privateKey);

    // Reload HTTPS server with new certificate
    await this.reloadHttpsServer(certificate, privateKey);

    console.log('Certificate rotation completed successfully');
  }

  private async generateCSR(serviceName: string): Promise<{ privateKey: string; csr: string }> {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
    });

    const csr = await this.createCSR(privateKey, serviceName);

    return {
      privateKey: privateKey.export({ type: 'pkcs8', format: 'pem' }) as string,
      csr,
    };
  }

  private async createCSR(privateKey: any, serviceName: string): Promise<string> {
    // Use node-forge or similar library to create CSR
    // This is a simplified example
    const forge = require('node-forge');

    const csr = forge.pki.createCertificationRequest();
    csr.publicKey = privateKey;
    csr.setSubject([
      { name: 'commonName', value: `${serviceName}-service.clenergize.local` },
      { name: 'organizationName', value: 'Clenergize' },
      { name: 'organizationalUnitName', value: 'Platform Services' },
    ]);

    csr.sign(privateKey);

    return forge.pki.certificationRequestToPem(csr);
  }

  private async requestCertificate(csr: string): Promise<string> {
    const response = await this.acmPcaClient.send(
      new IssueCertificateCommand({
        CertificateAuthorityArn: this.configService.get('PCA_ARN'),
        Csr: Buffer.from(csr),
        SigningAlgorithm: 'SHA512WITHRSA',
        Validity: {
          Type: 'DAYS',
          Value: 30,
        },
        TemplateArn: 'arn:aws:acm-pca:::template/EndEntityCertificate/V1',
      })
    );

    return response.CertificateArn!;
  }

  private async waitForCertificate(certificateArn: string): Promise<any> {
    // Poll for certificate to be issued
    for (let i = 0; i < 30; i++) {
      try {
        const response = await this.acmPcaClient.send(
          new GetCertificateCommand({
            CertificateArn: certificateArn,
            CertificateAuthorityArn: this.configService.get('PCA_ARN'),
          })
        );

        if (response.Certificate) {
          return {
            certificate: response.Certificate,
            certificateChain: response.CertificateChain,
          };
        }
      } catch (error) {
        // Certificate not ready yet
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    throw new Error('Certificate issuance timeout');
  }

  private async storeCertificate(certificate: any, privateKey: string) {
    const serviceName = this.configService.get('SERVICE_NAME');

    await this.secretsClient.send(
      new PutSecretValueCommand({
        SecretId: `clenergize/${serviceName}/tls-cert`,
        SecretString: JSON.stringify({
          certificate: certificate.certificate,
          certificateChain: certificate.certificateChain,
          privateKey,
          validFrom: new Date().toISOString(),
          validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          fingerprint: this.calculateFingerprint(certificate.certificate),
          rotatedAt: new Date().toISOString(),
        }),
      })
    );
  }

  private async reloadHttpsServer(certificate: any, privateKey: string) {
    // Update HTTPS server with new certificate
    // This depends on your server implementation
    // For Express:
    const app = this.configService.get('EXPRESS_APP');
    if (app) {
      const server = app.get('httpsServer');
      if (server) {
        server.setSecureContext({
          cert: certificate.certificate,
          key: privateKey,
          ca: certificate.certificateChain,
        });
      }
    }
  }

  private calculateFingerprint(cert: string): string {
    return crypto.createHash('sha256').update(cert).digest('hex');
  }
}
```

---

## Testing Strategy

### Integration Tests

```typescript
// File: NEW/shared/test/service-auth.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ServiceAuthModule } from '../src/auth/auth.module';
import { ConfigModule } from '@nestjs/config';

describe('Service-to-Service Authentication', () => {
  let app: INestApplication;
  let serviceToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.test',
        }),
        ServiceAuthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('mTLS Authentication', () => {
    it('should accept valid client certificate', async () => {
      // Test with valid certificate
      const response = await request(app.getHttpServer())
        .get('/test-endpoint')
        .cert(validClientCert)
        .key(validClientKey)
        .ca(caCert)
        .expect(200);

      expect(response.body).toHaveProperty('serviceIdentity');
    });

    it('should reject expired certificate', async () => {
      await request(app.getHttpServer())
        .get('/test-endpoint')
        .cert(expiredClientCert)
        .key(expiredClientKey)
        .ca(caCert)
        .expect(401);
    });

    it('should reject untrusted certificate', async () => {
      await request(app.getHttpServer())
        .get('/test-endpoint')
        .cert(untrustedCert)
        .key(untrustedKey)
        .expect(401);
    });
  });

  describe('Service Token Fallback', () => {
    it('should accept valid service token', async () => {
      const token = await generateServiceToken('test-service');

      await request(app.getHttpServer())
        .get('/test-endpoint')
        .set('X-Service-Token', token)
        .expect(200);
    });

    it('should reject expired service token', async () => {
      const expiredToken = generateExpiredToken();

      await request(app.getHttpServer())
        .get('/test-endpoint')
        .set('X-Service-Token', expiredToken)
        .expect(401);
    });

    it('should reject token from unauthorized service', async () => {
      const unauthorizedToken = await generateServiceToken('unauthorized-service');

      await request(app.getHttpServer())
        .get('/restricted-endpoint')
        .set('X-Service-Token', unauthorizedToken)
        .expect(403);
    });
  });

  describe('Service Trust Matrix', () => {
    it('should allow identity to call audit', async () => {
      const token = await generateServiceToken('identity', 'audit');

      await request(app.getHttpServer())
        .post('/audit/log')
        .set('X-Service-Token', token)
        .send({ event: 'test' })
        .expect(201);
    });

    it('should deny identity from calling calculation', async () => {
      const token = await generateServiceToken('identity', 'calculation');

      await request(app.getHttpServer())
        .get('/calculation/compute')
        .set('X-Service-Token', token)
        .expect(403);
    });
  });

  describe('Certificate Rotation', () => {
    it('should handle certificate rotation gracefully', async () => {
      // Trigger rotation
      await triggerCertificateRotation();

      // Should still accept requests during rotation
      await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      // Should use new certificate after rotation
      const newCert = await getNewCertificate();
      await request(app.getHttpServer())
        .get('/test-endpoint')
        .cert(newCert)
        .key(newKey)
        .ca(caCert)
        .expect(200);
    });
  });
});
```

---

## Monitoring & Alerting

### Metrics Collection

```typescript
// File: NEW/shared/src/monitoring/auth-metrics.ts

import { Injectable } from '@nestjs/common';
import { PrometheusService } from './prometheus.service';

@Injectable()
export class AuthMetricsService {
  private authAttempts: Counter;
  private authSuccesses: Counter;
  private authFailures: Counter;
  private certRotations: Counter;
  private certExpiryDays: Gauge;
  private tokenValidations: Histogram;

  constructor(private prometheus: PrometheusService) {
    this.initializeMetrics();
  }

  private initializeMetrics() {
    this.authAttempts = this.prometheus.createCounter({
      name: 'service_auth_attempts_total',
      help: 'Total number of authentication attempts',
      labelNames: ['method', 'service'],
    });

    this.authSuccesses = this.prometheus.createCounter({
      name: 'service_auth_successes_total',
      help: 'Total number of successful authentications',
      labelNames: ['method', 'service'],
    });

    this.authFailures = this.prometheus.createCounter({
      name: 'service_auth_failures_total',
      help: 'Total number of failed authentications',
      labelNames: ['method', 'service', 'reason'],
    });

    this.certRotations = this.prometheus.createCounter({
      name: 'certificate_rotations_total',
      help: 'Total number of certificate rotations',
      labelNames: ['service'],
    });

    this.certExpiryDays = this.prometheus.createGauge({
      name: 'certificate_expiry_days',
      help: 'Days until certificate expiry',
      labelNames: ['service'],
    });

    this.tokenValidations = this.prometheus.createHistogram({
      name: 'service_token_validation_duration_seconds',
      help: 'Duration of service token validation',
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
      labelNames: ['service', 'result'],
    });
  }

  recordAuthAttempt(method: string, service: string) {
    this.authAttempts.inc({ method, service });
  }

  recordAuthSuccess(method: string, service: string) {
    this.authSuccesses.inc({ method, service });
  }

  recordAuthFailure(method: string, service: string, reason: string) {
    this.authFailures.inc({ method, service, reason });
  }

  recordCertRotation(service: string) {
    this.certRotations.inc({ service });
  }

  updateCertExpiry(service: string, daysUntilExpiry: number) {
    this.certExpiryDays.set({ service }, daysUntilExpiry);
  }

  recordTokenValidation(service: string, duration: number, success: boolean) {
    this.tokenValidations.observe(
      { service, result: success ? 'success' : 'failure' },
      duration
    );
  }
}
```

### CloudWatch Alarms

```yaml
# File: infrastructure/monitoring/service-auth-alarms.yml

AuthFailureAlarm:
  Type: AWS::CloudWatch::Alarm
  Properties:
    AlarmName: !Sub '${Environment}-high-auth-failure-rate'
    AlarmDescription: 'High service authentication failure rate'
    MetricName: service_auth_failures_total
    Namespace: Clenergize/ServiceAuth
    Statistic: Sum
    Period: 300
    EvaluationPeriods: 2
    Threshold: 10
    ComparisonOperator: GreaterThanThreshold
    AlarmActions:
      - !Ref SecurityAlertTopic

CertificateExpiryAlarm:
  Type: AWS::CloudWatch::Alarm
  Properties:
    AlarmName: !Sub '${Environment}-certificate-expiry-warning'
    AlarmDescription: 'Certificate expiring soon'
    MetricName: certificate_expiry_days
    Namespace: Clenergize/ServiceAuth
    Statistic: Minimum
    Period: 86400
    EvaluationPeriods: 1
    Threshold: 3
    ComparisonOperator: LessThanThreshold
    AlarmActions:
      - !Ref OperationsAlertTopic

UnauthorizedServiceCallAlarm:
  Type: AWS::CloudWatch::Alarm
  Properties:
    AlarmName: !Sub '${Environment}-unauthorized-service-calls'
    AlarmDescription: 'Unauthorized service-to-service calls detected'
    MetricName: unauthorized_service_calls
    Namespace: Clenergize/Security
    Statistic: Sum
    Period: 300
    EvaluationPeriods: 1
    Threshold: 5
    ComparisonOperator: GreaterThanThreshold
    AlarmActions:
      - !Ref CriticalAlertTopic
```

---

## Troubleshooting

### Common Issues

1. **Certificate Validation Fails**
```bash
# Check certificate validity
openssl x509 -in cert.pem -text -noout

# Verify certificate chain
openssl verify -CAfile ca.pem cert.pem

# Test mTLS connection
openssl s_client -connect service:port -cert client.pem -key client.key -CAfile ca.pem
```

2. **Service Discovery Not Working**
```bash
# Check Cloud Map registration
aws servicediscovery list-instances \
  --service-id srv-xxx \
  --query 'Instances[*].[Id,Attributes.HEALTH_STATUS]'

# Verify DNS resolution
nslookup identity-service.clenergize.local
```

3. **Token Validation Fails**
```bash
# Decode JWT token
echo $TOKEN | cut -d. -f2 | base64 -d | jq

# Verify public key
openssl rsa -pubin -in public.pem -text -noout

# Test token endpoint
curl -H "X-Service-Token: $TOKEN" https://service/endpoint
```

4. **High Authentication Latency**
```bash
# Check certificate cache
redis-cli GET "cert:identity-service"

# Monitor validation duration
curl -s http://localhost:9090/metrics | grep token_validation_duration

# Check network latency
ping service-endpoint
```

---

## Security Checklist

- [ ] mTLS enabled for all production services
- [ ] Certificates rotate every 30 days
- [ ] Service tokens expire after 5 minutes
- [ ] Trust matrix enforced at all endpoints
- [ ] Certificate pinning for critical services
- [ ] CRL checking enabled
- [ ] Audit logging for all auth events
- [ ] Monitoring alerts configured
- [ ] Fallback authentication tested
- [ ] Service discovery health checks active
- [ ] Private keys stored in Secrets Manager
- [ ] Network policies restrict service communication
- [ ] Regular security audits scheduled

---

**This completes the Service-to-Service Authentication implementation. The system provides defense-in-depth with mTLS as primary and JWT tokens as fallback.**