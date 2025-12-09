# Service Discovery Implementation with AWS Cloud Map

## Executive Summary

Complete implementation of service discovery for Clenergize V3 microservices using AWS Cloud Map, DNS-based discovery, health checks, and client-side load balancing with failover strategies.

**Technology**: AWS Cloud Map + Route53
**Implementation Time**: 4 hours
**Service Resolution**: <50ms

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [AWS Cloud Map Configuration](#aws-cloud-map-configuration)
3. [Service Registration](#service-registration)
4. [Service Discovery Client](#service-discovery-client)
5. [Health Check Implementation](#health-check-implementation)
6. [Load Balancing Strategies](#load-balancing-strategies)
7. [Failover & Recovery](#failover-recovery)
8. [DNS Configuration](#dns-configuration)
9. [Testing Strategy](#testing-strategy)
10. [Monitoring & Troubleshooting](#monitoring-troubleshooting)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  Service Discovery Architecture              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  AWS Cloud Map Namespace: clenergize.local                 │
│  ┌──────────────────────────────────────────────────┐      │
│  │  Services Registry                               │      │
│  │  ┌─────────────┐  ┌─────────────┐             │      │
│  │  │  Identity   │  │ Organization│  ...         │      │
│  │  │  Service    │  │   Service   │              │      │
│  │  └─────────────┘  └─────────────┘             │      │
│  └──────────────────────────────────────────────────┘      │
│                                                             │
│  Health Checks:                                            │
│  • HTTP /health endpoint (30s interval)                    │
│  • ECS Task health                                         │
│  • Custom health checks                                    │
│                                                             │
│  Discovery Methods:                                        │
│  • DNS (identity.clenergize.local)                        │
│  • API (DiscoverInstances)                                │
│  • SDK Integration                                         │
│                                                             │
│  Load Balancing:                                           │
│  • Round-robin                                             │
│  • Least connections                                       │
│  • Weighted routing                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## AWS Cloud Map Configuration

### Infrastructure as Code

```typescript
// File: infrastructure/cdk/lib/stacks/service-discovery-stack.ts

import * as cdk from 'aws-cdk-lib';
import * as servicediscovery from 'aws-cdk-lib/aws-servicediscovery';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import { Construct } from 'constructs';

export interface ServiceDiscoveryStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  environment: 'dev' | 'staging' | 'prod';
}

export class ServiceDiscoveryStack extends cdk.Stack {
  public readonly namespace: servicediscovery.PrivateDnsNamespace;
  public readonly services: Map<string, servicediscovery.Service>;

  constructor(scope: Construct, id: string, props: ServiceDiscoveryStackProps) {
    super(scope, id, props);

    this.services = new Map();

    // Create private DNS namespace
    this.namespace = new servicediscovery.PrivateDnsNamespace(this, 'Namespace', {
      name: 'clenergize.local',
      vpc: props.vpc,
      description: 'Private namespace for Clenergize microservices',
    });

    // Create Cloud Map services for each microservice
    this.createCloudMapServices(props.environment);

    // Export namespace ARN
    new cdk.CfnOutput(this, 'NamespaceArn', {
      value: this.namespace.namespaceArn,
      exportName: `${props.environment}-namespace-arn`,
    });
  }

  private createCloudMapServices(environment: string) {
    const serviceConfigs = [
      { name: 'identity', port: 3001, healthPath: '/health' },
      { name: 'organization', port: 3002, healthPath: '/health' },
      { name: 'reference', port: 3003, healthPath: '/health' },
      { name: 'activity', port: 3004, healthPath: '/health' },
      { name: 'calculation', port: 3005, healthPath: '/health' },
      { name: 'reporting', port: 3006, healthPath: '/health' },
      { name: 'audit', port: 3007, healthPath: '/health' },
    ];

    for (const config of serviceConfigs) {
      const service = new servicediscovery.Service(this, `${config.name}-service`, {
        namespace: this.namespace,
        name: config.name,
        description: `${config.name} microservice`,
        dnsRecordType: servicediscovery.DnsRecordType.A,
        dnsTtl: cdk.Duration.seconds(10),
        healthCheck: {
          type: servicediscovery.HealthCheckType.HTTP,
          resourcePath: config.healthPath,
          failureThreshold: 2,
          interval: cdk.Duration.seconds(30),
        },
        customHealthCheck: {
          failureThreshold: 2,
        },
      });

      this.services.set(config.name, service);

      // Add service attributes for discovery
      new servicediscovery.CfnService(this, `${config.name}-attributes`, {
        name: config.name,
        namespaceId: this.namespace.namespaceId,
        dnsConfig: {
          dnsRecords: [{
            type: 'A',
            ttl: 10,
          }, {
            type: 'SRV',
            ttl: 10,
          }],
          namespaceId: this.namespace.namespaceId,
        },
        healthCheckCustomConfig: {
          failureThreshold: 2,
        },
      });
    }
  }
}

// ECS Task Definition with Service Discovery
export class EcsServiceWithDiscovery extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: {
      cluster: ecs.Cluster;
      namespace: servicediscovery.PrivateDnsNamespace;
      serviceName: string;
      port: number;
      taskDefinition: ecs.TaskDefinition;
    }
  ) {
    super(scope, id);

    // Create ECS Service with Cloud Map integration
    const service = new ecs.FargateService(this, 'Service', {
      cluster: props.cluster,
      taskDefinition: props.taskDefinition,
      desiredCount: 3,
      assignPublicIp: false,
      cloudMapOptions: {
        name: props.serviceName,
        cloudMapNamespace: props.namespace,
        dnsRecordType: servicediscovery.DnsRecordType.A,
        dnsTtl: cdk.Duration.seconds(10),
        failureThreshold: 2,
        container: props.taskDefinition.defaultContainer,
        containerPort: props.port,
      },
      enableExecuteCommand: true,
    });

    // Add auto-scaling
    const scaling = service.autoScaleTaskCount({
      minCapacity: 2,
      maxCapacity: 10,
    });

    scaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 70,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60),
    });

    // Custom health check for better control
    service.taskDefinition.defaultContainer?.addPortMappings({
      containerPort: props.port,
      protocol: ecs.Protocol.TCP,
      name: `${props.serviceName}-port`,
    });
  }
}
```

---

## Service Registration

### NestJS Service Registration

```typescript
// File: NEW/shared/src/discovery/service-registration.ts

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ServiceDiscoveryClient,
  RegisterInstanceCommand,
  DeregisterInstanceCommand,
  UpdateInstanceCustomHealthStatusCommand,
} from '@aws-sdk/client-servicediscovery';
import * as os from 'os';
import { v4 as uuidv4 } from 'uuid';

export interface ServiceRegistrationOptions {
  serviceName: string;
  serviceId: string;
  port: number;
  healthCheckPath?: string;
  metadata?: Record<string, string>;
  weight?: number;
}

@Injectable()
export class ServiceRegistration implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ServiceRegistration.name);
  private readonly client: ServiceDiscoveryClient;
  private instanceId: string;
  private registrationInterval: NodeJS.Timer;
  private healthCheckInterval: NodeJS.Timer;
  private isRegistered = false;

  constructor(private configService: ConfigService) {
    this.client = new ServiceDiscoveryClient({
      region: this.configService.get('AWS_REGION', 'us-east-1'),
    });

    this.instanceId = this.generateInstanceId();
  }

  async onModuleInit() {
    await this.register();
    this.startHealthReporting();
    this.setupGracefulShutdown();
  }

  async onModuleDestroy() {
    await this.deregister();
    clearInterval(this.registrationInterval);
    clearInterval(this.healthCheckInterval);
  }

  private async register(): Promise<void> {
    const options = this.getRegistrationOptions();

    try {
      const command = new RegisterInstanceCommand({
        ServiceId: options.serviceId,
        InstanceId: this.instanceId,
        Attributes: {
          AWS_INSTANCE_IPV4: this.getPrivateIp(),
          AWS_INSTANCE_PORT: options.port.toString(),
          AWS_INSTANCE_WEIGHT: (options.weight || 100).toString(),
          SERVICE_NAME: options.serviceName,
          VERSION: this.configService.get('VERSION', '1.0.0'),
          ENVIRONMENT: this.configService.get('NODE_ENV', 'development'),
          STARTED_AT: new Date().toISOString(),
          ...options.metadata,
        },
      });

      await this.client.send(command);
      this.isRegistered = true;

      this.logger.log(`Service registered: ${options.serviceName} (${this.instanceId})`);

      // Re-register periodically to maintain registration
      this.registrationInterval = setInterval(() => {
        this.refreshRegistration();
      }, 60000); // Every minute

    } catch (error) {
      this.logger.error('Failed to register service:', error);
      throw error;
    }
  }

  private async deregister(): Promise<void> {
    if (!this.isRegistered) return;

    const options = this.getRegistrationOptions();

    try {
      const command = new DeregisterInstanceCommand({
        ServiceId: options.serviceId,
        InstanceId: this.instanceId,
      });

      await this.client.send(command);
      this.isRegistered = false;

      this.logger.log(`Service deregistered: ${options.serviceName} (${this.instanceId})`);

    } catch (error) {
      this.logger.error('Failed to deregister service:', error);
    }
  }

  private async refreshRegistration(): Promise<void> {
    if (!this.isRegistered) return;

    try {
      // Update instance metadata
      const options = this.getRegistrationOptions();

      const command = new RegisterInstanceCommand({
        ServiceId: options.serviceId,
        InstanceId: this.instanceId,
        Attributes: {
          LAST_HEARTBEAT: new Date().toISOString(),
          UPTIME: process.uptime().toString(),
          MEMORY_USAGE: JSON.stringify(process.memoryUsage()),
          ACTIVE_CONNECTIONS: this.getActiveConnections().toString(),
        },
      });

      await this.client.send(command);

    } catch (error) {
      this.logger.warn('Failed to refresh registration:', error);
    }
  }

  private startHealthReporting(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.reportHealth();
    }, 15000); // Every 15 seconds
  }

  private async reportHealth(): Promise<void> {
    if (!this.isRegistered) return;

    const isHealthy = await this.performHealthCheck();

    try {
      const command = new UpdateInstanceCustomHealthStatusCommand({
        ServiceId: this.getRegistrationOptions().serviceId,
        InstanceId: this.instanceId,
        Status: isHealthy ? 'HEALTHY' : 'UNHEALTHY',
      });

      await this.client.send(command);

    } catch (error) {
      this.logger.warn('Failed to report health:', error);
    }
  }

  private async performHealthCheck(): Promise<boolean> {
    // Check database connection
    const dbHealthy = await this.checkDatabaseHealth();

    // Check memory usage
    const memoryHealthy = this.checkMemoryHealth();

    // Check application-specific health
    const appHealthy = await this.checkApplicationHealth();

    return dbHealthy && memoryHealthy && appHealthy;
  }

  private async checkDatabaseHealth(): Promise<boolean> {
    try {
      // Implementation depends on your database
      // Example: await this.db.ping();
      return true;
    } catch (error) {
      return false;
    }
  }

  private checkMemoryHealth(): boolean {
    const memUsage = process.memoryUsage();
    const heapUsedPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    return heapUsedPercent < 90; // Less than 90% heap usage
  }

  private async checkApplicationHealth(): Promise<boolean> {
    // Application-specific health checks
    return true;
  }

  private setupGracefulShutdown(): void {
    const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

    signals.forEach(signal => {
      process.on(signal, async () => {
        this.logger.log(`Received ${signal}, starting graceful shutdown`);

        // Mark instance as unhealthy
        await this.reportUnhealthy();

        // Wait for in-flight requests to complete
        await this.drainConnections();

        // Deregister from Cloud Map
        await this.deregister();

        process.exit(0);
      });
    });
  }

  private async reportUnhealthy(): Promise<void> {
    try {
      const command = new UpdateInstanceCustomHealthStatusCommand({
        ServiceId: this.getRegistrationOptions().serviceId,
        InstanceId: this.instanceId,
        Status: 'UNHEALTHY',
      });

      await this.client.send(command);

      // Wait for DNS to update
      await new Promise(resolve => setTimeout(resolve, 5000));

    } catch (error) {
      this.logger.warn('Failed to mark instance as unhealthy:', error);
    }
  }

  private async drainConnections(): Promise<void> {
    // Implementation depends on your server
    const maxDrainTime = 30000; // 30 seconds
    const startTime = Date.now();

    while (this.getActiveConnections() > 0) {
      if (Date.now() - startTime > maxDrainTime) {
        this.logger.warn('Drain timeout reached, forcing shutdown');
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  private getRegistrationOptions(): ServiceRegistrationOptions {
    return {
      serviceName: this.configService.get('SERVICE_NAME')!,
      serviceId: this.configService.get('CLOUD_MAP_SERVICE_ID')!,
      port: parseInt(this.configService.get('PORT', '3000')),
      healthCheckPath: '/health',
      metadata: {
        region: this.configService.get('AWS_REGION', 'us-east-1'),
        zone: this.configService.get('AWS_AVAILABILITY_ZONE', 'us-east-1a'),
      },
      weight: parseInt(this.configService.get('SERVICE_WEIGHT', '100')),
    };
  }

  private generateInstanceId(): string {
    const hostname = os.hostname();
    const serviceName = this.configService.get('SERVICE_NAME');
    const uuid = uuidv4().split('-')[0];

    return `${serviceName}-${hostname}-${uuid}`;
  }

  private getPrivateIp(): string {
    const interfaces = os.networkInterfaces();

    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name] || []) {
        if (iface.family === 'IPv4' && !iface.internal) {
          // Check if it's a private IP
          const parts = iface.address.split('.');
          const firstOctet = parseInt(parts[0]);

          if (firstOctet === 10 || firstOctet === 172 || firstOctet === 192) {
            return iface.address;
          }
        }
      }
    }

    return '127.0.0.1';
  }

  private getActiveConnections(): number {
    // Implementation depends on your server
    // For Express: return server.getConnections()
    // For NestJS: return this.httpAdapter.getInstance()._connections
    return 0;
  }
}
```

---

## Service Discovery Client

### Discovery Client Implementation

```typescript
// File: NEW/shared/src/discovery/discovery-client.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ServiceDiscoveryClient,
  DiscoverInstancesCommand,
  GetInstanceCommand,
  ListInstancesCommand,
  HealthStatus,
} from '@aws-sdk/client-servicediscovery';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface ServiceInstance {
  instanceId: string;
  address: string;
  port: number;
  healthy: boolean;
  weight: number;
  metadata: Record<string, string>;
}

export interface DiscoveryOptions {
  serviceName: string;
  healthStatus?: 'HEALTHY' | 'UNHEALTHY' | 'ALL';
  maxResults?: number;
  queryParameters?: Record<string, string>;
}

@Injectable()
export class DiscoveryClient {
  private readonly logger = new Logger(DiscoveryClient.name);
  private readonly client: ServiceDiscoveryClient;
  private readonly cache = new Map<string, CachedInstances>();
  private readonly loadBalancers = new Map<string, LoadBalancer>();

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.client = new ServiceDiscoveryClient({
      region: this.configService.get('AWS_REGION', 'us-east-1'),
    });

    // Start cache refresh
    this.startCacheRefresh();
  }

  async discoverService(options: DiscoveryOptions): Promise<ServiceInstance[]> {
    const cacheKey = this.getCacheKey(options);
    const cached = this.cache.get(cacheKey);

    if (cached && !this.isCacheExpired(cached)) {
      return cached.instances;
    }

    try {
      const command = new DiscoverInstancesCommand({
        NamespaceName: this.configService.get('NAMESPACE_NAME', 'clenergize.local'),
        ServiceName: options.serviceName,
        HealthStatus: options.healthStatus || 'HEALTHY',
        MaxResults: options.maxResults || 10,
        QueryParameters: options.queryParameters,
      });

      const response = await this.client.send(command);

      const instances: ServiceInstance[] = (response.Instances || []).map(instance => ({
        instanceId: instance.InstanceId || '',
        address: instance.Attributes?.AWS_INSTANCE_IPV4 || '',
        port: parseInt(instance.Attributes?.AWS_INSTANCE_PORT || '0'),
        healthy: instance.HealthStatus === 'HEALTHY',
        weight: parseInt(instance.Attributes?.AWS_INSTANCE_WEIGHT || '100'),
        metadata: instance.Attributes || {},
      }));

      // Update cache
      this.cache.set(cacheKey, {
        instances,
        timestamp: Date.now(),
      });

      return instances;

    } catch (error) {
      this.logger.error(`Failed to discover service ${options.serviceName}:`, error);

      // Return cached instances if available
      if (cached) {
        this.logger.warn(`Returning stale cache for ${options.serviceName}`);
        return cached.instances;
      }

      throw error;
    }
  }

  async getHealthyInstance(serviceName: string): Promise<ServiceInstance | null> {
    const instances = await this.discoverService({
      serviceName,
      healthStatus: 'HEALTHY',
    });

    if (instances.length === 0) {
      return null;
    }

    // Get load balancer for this service
    let balancer = this.loadBalancers.get(serviceName);
    if (!balancer) {
      balancer = new LoadBalancer(instances);
      this.loadBalancers.set(serviceName, balancer);
    } else {
      balancer.updateInstances(instances);
    }

    return balancer.getNextInstance();
  }

  async callService<T>(
    serviceName: string,
    path: string,
    options: any = {}
  ): Promise<T> {
    const maxRetries = 3;
    let lastError: Error;

    for (let i = 0; i < maxRetries; i++) {
      const instance = await this.getHealthyInstance(serviceName);

      if (!instance) {
        throw new Error(`No healthy instances found for ${serviceName}`);
      }

      try {
        const url = `http://${instance.address}:${instance.port}${path}`;

        const response = await firstValueFrom(
          this.httpService.request({
            ...options,
            url,
            headers: {
              ...options.headers,
              'X-Service-Name': this.configService.get('SERVICE_NAME'),
              'X-Request-Id': this.generateRequestId(),
            },
          })
        );

        // Mark instance as successful
        this.recordSuccess(serviceName, instance.instanceId);

        return response.data;

      } catch (error) {
        lastError = error;

        // Mark instance as failed
        this.recordFailure(serviceName, instance.instanceId);

        this.logger.warn(
          `Failed to call ${serviceName} at ${instance.address}:${instance.port}`,
          error.message
        );

        // Try another instance
        continue;
      }
    }

    throw lastError!;
  }

  private startCacheRefresh(): void {
    setInterval(() => {
      this.refreshCache();
    }, 10000); // Every 10 seconds
  }

  private async refreshCache(): Promise<void> {
    for (const [key, cached] of this.cache.entries()) {
      if (this.isCacheExpired(cached)) {
        this.cache.delete(key);
      }
    }
  }

  private getCacheKey(options: DiscoveryOptions): string {
    return `${options.serviceName}-${options.healthStatus || 'HEALTHY'}`;
  }

  private isCacheExpired(cached: CachedInstances): boolean {
    const maxAge = 30000; // 30 seconds
    return Date.now() - cached.timestamp > maxAge;
  }

  private recordSuccess(serviceName: string, instanceId: string): void {
    const balancer = this.loadBalancers.get(serviceName);
    if (balancer) {
      balancer.recordSuccess(instanceId);
    }
  }

  private recordFailure(serviceName: string, instanceId: string): void {
    const balancer = this.loadBalancers.get(serviceName);
    if (balancer) {
      balancer.recordFailure(instanceId);
    }
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

interface CachedInstances {
  instances: ServiceInstance[];
  timestamp: number;
}

// Load Balancer Implementation
class LoadBalancer {
  private currentIndex = 0;
  private instanceStats = new Map<string, InstanceStats>();

  constructor(private instances: ServiceInstance[]) {
    this.initializeStats();
  }

  updateInstances(instances: ServiceInstance[]): void {
    this.instances = instances;
    this.initializeStats();
  }

  getNextInstance(): ServiceInstance | null {
    const healthyInstances = this.getHealthyInstances();

    if (healthyInstances.length === 0) {
      return null;
    }

    // Weighted round-robin
    const instance = this.selectWeightedInstance(healthyInstances);

    return instance;
  }

  private getHealthyInstances(): ServiceInstance[] {
    return this.instances.filter(instance => {
      const stats = this.instanceStats.get(instance.instanceId);
      return instance.healthy && (!stats || stats.failureRate < 0.5);
    });
  }

  private selectWeightedInstance(instances: ServiceInstance[]): ServiceInstance {
    const totalWeight = instances.reduce((sum, i) => sum + i.weight, 0);
    const random = Math.random() * totalWeight;

    let weightSum = 0;
    for (const instance of instances) {
      weightSum += instance.weight;
      if (random <= weightSum) {
        return instance;
      }
    }

    return instances[0];
  }

  recordSuccess(instanceId: string): void {
    const stats = this.instanceStats.get(instanceId);
    if (stats) {
      stats.successCount++;
      stats.updateFailureRate();
    }
  }

  recordFailure(instanceId: string): void {
    const stats = this.instanceStats.get(instanceId);
    if (stats) {
      stats.failureCount++;
      stats.updateFailureRate();
    }
  }

  private initializeStats(): void {
    this.instanceStats.clear();
    this.instances.forEach(instance => {
      this.instanceStats.set(instance.instanceId, new InstanceStats());
    });
  }
}

class InstanceStats {
  successCount = 0;
  failureCount = 0;
  failureRate = 0;
  lastUpdated = Date.now();

  updateFailureRate(): void {
    const total = this.successCount + this.failureCount;
    this.failureRate = total > 0 ? this.failureCount / total : 0;
    this.lastUpdated = Date.now();

    // Reset stats after 1 hour
    if (Date.now() - this.lastUpdated > 3600000) {
      this.successCount = 0;
      this.failureCount = 0;
      this.failureRate = 0;
    }
  }
}
```

---

## Health Check Implementation

### Health Check Service

```typescript
// File: NEW/shared/src/health/health-check.controller.ts

import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { CustomHealthIndicator } from './custom-health.indicator';

@Controller('health')
export class HealthCheckController {
  constructor(
    private health: HealthCheckService,
    private db: MongooseHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private custom: CustomHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Database health
      () => this.db.pingCheck('database'),

      // Memory health (heap must be under 300MB)
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),

      // Memory health (RSS must be under 300MB)
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),

      // Disk health
      () => this.disk.checkStorage('storage', {
        thresholdPercent: 0.9,
        path: '/',
      }),

      // Custom health checks
      () => this.custom.checkServiceDependencies('dependencies'),
      () => this.custom.checkCriticalResources('resources'),
    ]);
  }

  @Get('liveness')
  liveness() {
    return { status: 'alive', timestamp: new Date() };
  }

  @Get('readiness')
  async readiness() {
    try {
      await this.health.check([
        () => this.db.pingCheck('database'),
        () => this.custom.checkServiceDependencies('dependencies'),
      ]);

      return { status: 'ready', timestamp: new Date() };
    } catch (error) {
      return { status: 'not_ready', error: error.message, timestamp: new Date() };
    }
  }

  @Get('startup')
  async startup() {
    // Check if service has completed initialization
    const initialized = await this.custom.checkInitialization();

    if (initialized) {
      return { status: 'started', timestamp: new Date() };
    } else {
      throw new Error('Service not fully initialized');
    }
  }
}

// Custom Health Indicator
@Injectable()
export class CustomHealthIndicator {
  constructor(
    private discoveryClient: DiscoveryClient,
    private configService: ConfigService,
  ) {}

  async checkServiceDependencies(key: string): Promise<HealthIndicatorResult> {
    const dependencies = this.configService.get('SERVICE_DEPENDENCIES', []);
    const unhealthy: string[] = [];

    for (const dep of dependencies) {
      const instances = await this.discoveryClient.discoverService({
        serviceName: dep,
        healthStatus: 'HEALTHY',
      });

      if (instances.length === 0) {
        unhealthy.push(dep);
      }
    }

    const isHealthy = unhealthy.length === 0;

    return this.getStatus(key, isHealthy, {
      dependencies: dependencies.length,
      unhealthy: unhealthy,
    });
  }

  async checkCriticalResources(key: string): Promise<HealthIndicatorResult> {
    const checks = {
      database: await this.checkDatabaseConnections(),
      cache: await this.checkCacheConnection(),
      queue: await this.checkQueueConnection(),
    };

    const isHealthy = Object.values(checks).every(check => check);

    return this.getStatus(key, isHealthy, checks);
  }

  async checkInitialization(): Promise<boolean> {
    // Check if all required services are initialized
    const requiredServices = [
      'database',
      'cache',
      'eventBus',
      'serviceDiscovery',
    ];

    for (const service of requiredServices) {
      if (!this.isServiceInitialized(service)) {
        return false;
      }
    }

    return true;
  }

  private async checkDatabaseConnections(): Promise<boolean> {
    // Check database connection pool
    try {
      // Implementation depends on your database
      return true;
    } catch {
      return false;
    }
  }

  private async checkCacheConnection(): Promise<boolean> {
    // Check Redis connection
    try {
      // await this.redis.ping();
      return true;
    } catch {
      return false;
    }
  }

  private async checkQueueConnection(): Promise<boolean> {
    // Check message queue connection
    try {
      // await this.queue.checkConnection();
      return true;
    } catch {
      return false;
    }
  }

  private isServiceInitialized(service: string): boolean {
    // Check if service is initialized
    // Implementation depends on your initialization logic
    return true;
  }

  private getStatus(
    key: string,
    isHealthy: boolean,
    details?: any
  ): HealthIndicatorResult {
    return {
      [key]: {
        status: isHealthy ? 'up' : 'down',
        ...details,
      },
    };
  }
}
```

---

## DNS Configuration

### Route53 Integration

```typescript
// File: infrastructure/cdk/lib/stacks/dns-stack.ts

import * as cdk from 'aws-cdk-lib';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53resolver from 'aws-cdk-lib/aws-route53resolver';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class DnsStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: {
      vpc: ec2.Vpc;
      namespace: servicediscovery.PrivateDnsNamespace;
    }
  ) {
    super(scope, id, props);

    // Create Route53 Resolver endpoint for hybrid DNS
    const resolverEndpoint = new route53resolver.CfnResolverEndpoint(this, 'ResolverEndpoint', {
      direction: 'INBOUND',
      ipAddresses: props.vpc.selectSubnets({
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      }).subnets.map(subnet => ({
        subnetId: subnet.subnetId,
      })),
      securityGroupIds: [this.createResolverSecurityGroup(props.vpc).securityGroupId],
    });

    // Create forwarding rules for service discovery
    new route53resolver.CfnResolverRule(this, 'ServiceDiscoveryRule', {
      domainName: 'clenergize.local',
      ruleType: 'FORWARD',
      resolverEndpointId: resolverEndpoint.attrResolverEndpointId,
      targetIps: [{
        ip: '10.0.0.2', // VPC DNS server
      }],
    });

    // Associate rule with VPC
    new route53resolver.CfnResolverRuleAssociation(this, 'RuleAssociation', {
      resolverRuleId: resolverRule.attrResolverRuleId,
      vpcId: props.vpc.vpcId,
    });
  }

  private createResolverSecurityGroup(vpc: ec2.Vpc): ec2.SecurityGroup {
    const sg = new ec2.SecurityGroup(this, 'ResolverSecurityGroup', {
      vpc,
      description: 'Security group for Route53 Resolver',
    });

    sg.addIngressRule(
      ec2.Peer.ipv4(vpc.vpcCidrBlock),
      ec2.Port.tcp(53),
      'Allow DNS TCP'
    );

    sg.addIngressRule(
      ec2.Peer.ipv4(vpc.vpcCidrBlock),
      ec2.Port.udp(53),
      'Allow DNS UDP'
    );

    return sg;
  }
}
```

---

## Testing Strategy

### Service Discovery Tests

```typescript
// File: NEW/shared/test/service-discovery.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { ServiceRegistration } from '../src/discovery/service-registration';
import { DiscoveryClient } from '../src/discovery/discovery-client';
import { ServiceDiscoveryClient } from '@aws-sdk/client-servicediscovery';

describe('Service Discovery', () => {
  let registration: ServiceRegistration;
  let discovery: DiscoveryClient;
  let mockClient: jest.Mocked<ServiceDiscoveryClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceRegistration,
        DiscoveryClient,
        {
          provide: ServiceDiscoveryClient,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    registration = module.get<ServiceRegistration>(ServiceRegistration);
    discovery = module.get<DiscoveryClient>(DiscoveryClient);
    mockClient = module.get(ServiceDiscoveryClient);
  });

  describe('Service Registration', () => {
    it('should register service on startup', async () => {
      mockClient.send.mockResolvedValueOnce({ $metadata: {} });

      await registration.onModuleInit();

      expect(mockClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            ServiceId: expect.any(String),
            InstanceId: expect.any(String),
            Attributes: expect.objectContaining({
              AWS_INSTANCE_IPV4: expect.any(String),
              AWS_INSTANCE_PORT: expect.any(String),
            }),
          }),
        })
      );
    });

    it('should deregister service on shutdown', async () => {
      await registration.onModuleInit();

      mockClient.send.mockResolvedValueOnce({ $metadata: {} });

      await registration.onModuleDestroy();

      expect(mockClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            ServiceId: expect.any(String),
            InstanceId: expect.any(String),
          }),
        })
      );
    });

    it('should report health periodically', async () => {
      jest.useFakeTimers();

      await registration.onModuleInit();

      // Fast forward 15 seconds
      jest.advanceTimersByTime(15000);

      expect(mockClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            Status: expect.stringMatching(/HEALTHY|UNHEALTHY/),
          }),
        })
      );

      jest.useRealTimers();
    });
  });

  describe('Service Discovery', () => {
    it('should discover healthy services', async () => {
      mockClient.send.mockResolvedValueOnce({
        Instances: [
          {
            InstanceId: 'instance-1',
            HealthStatus: 'HEALTHY',
            Attributes: {
              AWS_INSTANCE_IPV4: '10.0.1.1',
              AWS_INSTANCE_PORT: '3001',
            },
          },
          {
            InstanceId: 'instance-2',
            HealthStatus: 'HEALTHY',
            Attributes: {
              AWS_INSTANCE_IPV4: '10.0.1.2',
              AWS_INSTANCE_PORT: '3001',
            },
          },
        ],
        $metadata: {},
      });

      const instances = await discovery.discoverService({
        serviceName: 'identity',
        healthStatus: 'HEALTHY',
      });

      expect(instances).toHaveLength(2);
      expect(instances[0]).toEqual(
        expect.objectContaining({
          instanceId: 'instance-1',
          address: '10.0.1.1',
          port: 3001,
          healthy: true,
        })
      );
    });

    it('should load balance between instances', async () => {
      const instances = [
        {
          instanceId: 'instance-1',
          address: '10.0.1.1',
          port: 3001,
          healthy: true,
          weight: 100,
          metadata: {},
        },
        {
          instanceId: 'instance-2',
          address: '10.0.1.2',
          port: 3001,
          healthy: true,
          weight: 100,
          metadata: {},
        },
      ];

      jest.spyOn(discovery, 'discoverService').mockResolvedValue(instances);

      const selectedInstances = new Set();

      // Make multiple requests
      for (let i = 0; i < 10; i++) {
        const instance = await discovery.getHealthyInstance('identity');
        if (instance) {
          selectedInstances.add(instance.instanceId);
        }
      }

      // Should distribute across both instances
      expect(selectedInstances.size).toBe(2);
    });

    it('should handle service call failures with retry', async () => {
      const instances = [
        {
          instanceId: 'instance-1',
          address: '10.0.1.1',
          port: 3001,
          healthy: true,
          weight: 100,
          metadata: {},
        },
        {
          instanceId: 'instance-2',
          address: '10.0.1.2',
          port: 3001,
          healthy: true,
          weight: 100,
          metadata: {},
        },
      ];

      jest.spyOn(discovery, 'discoverService').mockResolvedValue(instances);

      // Mock HTTP calls - first fails, second succeeds
      const httpSpy = jest.spyOn(discovery['httpService'], 'request');
      httpSpy.mockRejectedValueOnce(new Error('Connection failed'));
      httpSpy.mockResolvedValueOnce({ data: { success: true } });

      const result = await discovery.callService('identity', '/api/test');

      expect(result).toEqual({ success: true });
      expect(httpSpy).toHaveBeenCalledTimes(2);
    });

    it('should cache discovery results', async () => {
      const discoverSpy = jest.spyOn(mockClient, 'send');

      // First call - should hit API
      await discovery.discoverService({
        serviceName: 'identity',
      });

      // Second call within cache window - should use cache
      await discovery.discoverService({
        serviceName: 'identity',
      });

      // Should only call API once
      expect(discoverSpy).toHaveBeenCalledTimes(1);
    });
  });
});
```

---

## Monitoring & Troubleshooting

### CloudWatch Metrics

```typescript
// File: NEW/shared/src/discovery/metrics.ts

import { Injectable } from '@nestjs/common';
import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';

@Injectable()
export class DiscoveryMetrics {
  private client: CloudWatchClient;

  constructor() {
    this.client = new CloudWatchClient({ region: 'us-east-1' });
  }

  async recordDiscoveryLatency(serviceName: string, latency: number): Promise<void> {
    await this.putMetric('DiscoveryLatency', latency, 'Milliseconds', {
      ServiceName: serviceName,
    });
  }

  async recordRegistrationSuccess(serviceName: string): Promise<void> {
    await this.putMetric('RegistrationSuccess', 1, 'Count', {
      ServiceName: serviceName,
    });
  }

  async recordDiscoveryFailure(serviceName: string): Promise<void> {
    await this.putMetric('DiscoveryFailure', 1, 'Count', {
      ServiceName: serviceName,
    });
  }

  async recordHealthCheckStatus(serviceName: string, healthy: boolean): Promise<void> {
    await this.putMetric('HealthCheckStatus', healthy ? 1 : 0, 'None', {
      ServiceName: serviceName,
    });
  }

  private async putMetric(
    metricName: string,
    value: number,
    unit: string,
    dimensions: Record<string, string>
  ): Promise<void> {
    const command = new PutMetricDataCommand({
      Namespace: 'Clenergize/ServiceDiscovery',
      MetricData: [{
        MetricName: metricName,
        Value: value,
        Unit: unit,
        Timestamp: new Date(),
        Dimensions: Object.entries(dimensions).map(([Name, Value]) => ({ Name, Value })),
      }],
    });

    try {
      await this.client.send(command);
    } catch (error) {
      console.error(`Failed to record metric ${metricName}:`, error);
    }
  }
}
```

### Troubleshooting Guide

```bash
# Check service registration
aws servicediscovery list-instances \
  --service-id srv-xxx \
  --query "Instances[*].[Id,Attributes.AWS_INSTANCE_IPV4,HealthStatus]" \
  --output table

# Check DNS resolution
nslookup identity.clenergize.local

# Test service health endpoint
curl http://identity.clenergize.local:3001/health

# View Cloud Map metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ServiceDiscovery \
  --metric-name DiscoveryLatency \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 300 \
  --statistics Average

# Debug DNS issues
dig +short identity.clenergize.local
dig +trace identity.clenergize.local

# Check ECS service discovery integration
aws ecs describe-services \
  --cluster clenergize-dev \
  --services identity \
  --query "services[0].serviceRegistries"
```

---

**This completes the Service Discovery Implementation with AWS Cloud Map, providing automatic service registration, health checks, DNS-based discovery, and client-side load balancing.**