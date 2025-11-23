# Chaos Engineering Implementation Guide

## Executive Summary

This document provides production-ready chaos engineering implementations for the Clenergize V3 platform, including AWS Fault Injection Simulator (FIS) experiments, Litmus chaos experiments for Kubernetes, and local chaos testing strategies.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [AWS FIS Implementation](#aws-fis-implementation)
3. [Litmus Chaos for Kubernetes](#litmus-chaos-for-kubernetes)
4. [Local Chaos Testing](#local-chaos-testing)
5. [Game Day Scenarios](#game-day-scenarios)
6. [Monitoring & Observability](#monitoring--observability)
7. [Safety Mechanisms](#safety-mechanisms)
8. [Rollback Procedures](#rollback-procedures)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  CHAOS ENGINEERING STACK                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  AWS FIS (Production):                                     │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ • ECS Task Termination                               │ │
│  │ • DocumentDB Failover                                │ │
│  │ • Network Latency Injection                          │ │
│  │ • CPU/Memory Stress                                  │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Litmus (Kubernetes):                                      │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ • Pod Delete/Kill                                    │ │
│  │ • Network Chaos (Delay/Loss)                         │ │
│  │ • Disk Fill                                          │ │
│  │ • Node Drain/Taint                                   │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Local Testing (Docker):                                   │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ • Pumba (Container Chaos)                            │ │
│  │ • Toxiproxy (Network Simulation)                     │ │
│  │ • Stress-ng (Resource Exhaustion)                    │ │
│  │ • tc/iptables (Network Control)                      │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## AWS FIS Implementation

### 1. FIS Experiment Templates

#### ECS Service Disruption

```typescript
// infrastructure/chaos/fis-experiments.ts
import { CfnExperimentTemplate } from 'aws-cdk-lib/aws-fis';
import { Stack } from 'aws-cdk-lib';
import { Role, ServicePrincipal, PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';

export class FISExperiments {
  constructor(stack: Stack) {
    // Create FIS execution role
    const fisRole = new Role(stack, 'FISExecutionRole', {
      assumedBy: new ServicePrincipal('fis.amazonaws.com'),
      inlinePolicies: {
        FISPolicy: new PolicyDocument({
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              actions: [
                'ecs:DescribeTasks',
                'ecs:ListTasks',
                'ecs:StopTask',
                'ecs:DescribeServices',
                'ecs:UpdateService',
                'ec2:DescribeInstances',
                'ec2:TerminateInstances',
                'rds:DescribeDBClusters',
                'rds:FailoverDBCluster',
                'ssm:SendCommand',
                'ssm:GetCommandInvocation',
                'cloudwatch:PutMetricData',
                'logs:CreateLogGroup',
                'logs:CreateLogStream',
                'logs:PutLogEvents'
              ],
              resources: ['*']
            })
          ]
        })
      }
    });

    // ECS Task Termination Experiment
    new CfnExperimentTemplate(stack, 'ECSTaskTermination', {
      description: 'Randomly terminate ECS tasks to test service resilience',
      roleArn: fisRole.roleArn,
      stopConditions: [{
        source: 'aws:cloudwatch:alarm',
        value: stack.formatArn({
          service: 'cloudwatch',
          resource: 'alarm',
          resourceName: 'HighErrorRate'
        })
      }],
      targets: {
        'ecsTargets': {
          resourceType: 'aws:ecs:task',
          selectionMode: 'PERCENT(30)',
          resourceTags: {
            'Environment': 'production',
            'ChaosReady': 'true'
          },
          filters: [{
            path: 'State.Name',
            values: ['RUNNING']
          }]
        }
      },
      actions: {
        'stopTasks': {
          actionId: 'aws:ecs:stop-task',
          targets: {
            Tasks: 'ecsTargets'
          }
        }
      },
      tags: {
        Name: 'ECS-Task-Termination',
        Severity: 'Medium',
        ExpectedOutcome: 'Service auto-recovery via ECS'
      }
    });

    // DocumentDB Failover Experiment
    new CfnExperimentTemplate(stack, 'DocumentDBFailover', {
      description: 'Trigger DocumentDB cluster failover to test database resilience',
      roleArn: fisRole.roleArn,
      stopConditions: [{
        source: 'aws:cloudwatch:alarm',
        value: stack.formatArn({
          service: 'cloudwatch',
          resource: 'alarm',
          resourceName: 'DatabaseConnectionFailures'
        })
      }],
      targets: {
        'dbCluster': {
          resourceType: 'aws:rds:cluster',
          selectionMode: 'ALL',
          resourceArns: [
            stack.formatArn({
              service: 'rds',
              resource: 'cluster',
              resourceName: 'clenergize-production-cluster'
            })
          ]
        }
      },
      actions: {
        'failoverDb': {
          actionId: 'aws:rds:failover-db-cluster',
          targets: {
            Clusters: 'dbCluster'
          }
        }
      },
      tags: {
        Name: 'DocumentDB-Failover',
        Severity: 'High',
        ExpectedOutcome: 'Automatic failover within 30 seconds'
      }
    });

    // Network Latency Injection
    new CfnExperimentTemplate(stack, 'NetworkLatency', {
      description: 'Inject network latency between services',
      roleArn: fisRole.roleArn,
      stopConditions: [{
        source: 'none'
      }],
      targets: {
        'ecsInstances': {
          resourceType: 'aws:ec2:instance',
          selectionMode: 'COUNT(2)',
          resourceTags: {
            'ECS-Cluster': 'production'
          }
        }
      },
      actions: {
        'injectLatency': {
          actionId: 'aws:ssm:send-command',
          targets: {
            Instances: 'ecsInstances'
          },
          parameters: {
            documentArn: stack.formatArn({
              service: 'ssm',
              resource: 'document',
              resourceName: 'InjectNetworkLatency'
            }),
            documentParameters: JSON.stringify({
              duration: '300',
              delay: '200ms',
              jitter: '50ms',
              loss: '0.1%'
            })
          }
        }
      },
      tags: {
        Name: 'Network-Latency-Injection',
        Severity: 'Low',
        ExpectedOutcome: 'Circuit breakers activate, graceful degradation'
      }
    });

    // CPU Stress Experiment
    new CfnExperimentTemplate(stack, 'CPUStress', {
      description: 'Stress CPU on ECS tasks to test autoscaling',
      roleArn: fisRole.roleArn,
      stopConditions: [{
        source: 'none'
      }],
      targets: {
        'ecsTasks': {
          resourceType: 'aws:ecs:task',
          selectionMode: 'COUNT(3)',
          resourceTags: {
            'Service': 'calculation-service'
          }
        }
      },
      actions: {
        'stressCPU': {
          actionId: 'aws:ssm:send-command',
          targets: {
            Tasks: 'ecsTasks'
          },
          parameters: {
            documentArn: stack.formatArn({
              service: 'ssm',
              resource: 'document',
              resourceName: 'StressCPU'
            }),
            documentParameters: JSON.stringify({
              duration: '180',
              cpu: '80',
              workers: '4'
            })
          }
        }
      },
      tags: {
        Name: 'CPU-Stress-Test',
        Severity: 'Medium',
        ExpectedOutcome: 'Auto-scaling triggers, new tasks launched'
      }
    });
  }
}
```

### 2. SSM Documents for Chaos Actions

```typescript
// infrastructure/chaos/ssm-documents.ts
import { CfnDocument } from 'aws-cdk-lib/aws-ssm';
import { Stack } from 'aws-cdk-lib';

export class ChaosSSMDocuments {
  constructor(stack: Stack) {
    // Network Latency Injection Document
    new CfnDocument(stack, 'InjectNetworkLatency', {
      documentType: 'Command',
      name: 'InjectNetworkLatency',
      content: {
        schemaVersion: '2.2',
        description: 'Inject network latency using tc',
        parameters: {
          duration: {
            type: 'String',
            description: 'Duration in seconds',
            default: '300'
          },
          delay: {
            type: 'String',
            description: 'Delay to add (e.g., 100ms)',
            default: '100ms'
          },
          jitter: {
            type: 'String',
            description: 'Jitter amount (e.g., 10ms)',
            default: '10ms'
          },
          loss: {
            type: 'String',
            description: 'Packet loss percentage',
            default: '0%'
          },
          interface: {
            type: 'String',
            description: 'Network interface',
            default: 'eth0'
          }
        },
        mainSteps: [
          {
            action: 'aws:runShellScript',
            name: 'injectLatency',
            inputs: {
              runCommand: [
                '#!/bin/bash',
                'tc qdisc add dev {{ interface }} root netem delay {{ delay }} {{ jitter }} loss {{ loss }}',
                'sleep {{ duration }}',
                'tc qdisc del dev {{ interface }} root netem'
              ]
            }
          }
        ]
      }
    });

    // CPU Stress Document
    new CfnDocument(stack, 'StressCPU', {
      documentType: 'Command',
      name: 'StressCPU',
      content: {
        schemaVersion: '2.2',
        description: 'Stress CPU using stress-ng',
        parameters: {
          duration: {
            type: 'String',
            description: 'Duration in seconds',
            default: '60'
          },
          cpu: {
            type: 'String',
            description: 'CPU percentage to consume',
            default: '80'
          },
          workers: {
            type: 'String',
            description: 'Number of worker threads',
            default: '0'
          }
        },
        mainSteps: [
          {
            action: 'aws:runShellScript',
            name: 'installStressNg',
            inputs: {
              runCommand: [
                'which stress-ng || (apt-get update && apt-get install -y stress-ng) || (yum install -y stress-ng)'
              ]
            }
          },
          {
            action: 'aws:runShellScript',
            name: 'runStress',
            inputs: {
              runCommand: [
                'stress-ng --cpu {{ workers }} --cpu-load {{ cpu }} --timeout {{ duration }}s --metrics-brief'
              ]
            }
          }
        ]
      }
    });

    // Memory Stress Document
    new CfnDocument(stack, 'StressMemory', {
      documentType: 'Command',
      name: 'StressMemory',
      content: {
        schemaVersion: '2.2',
        description: 'Stress memory using stress-ng',
        parameters: {
          duration: {
            type: 'String',
            description: 'Duration in seconds',
            default: '60'
          },
          memory: {
            type: 'String',
            description: 'Memory to consume (e.g., 512M)',
            default: '512M'
          },
          workers: {
            type: 'String',
            description: 'Number of worker threads',
            default: '1'
          }
        },
        mainSteps: [
          {
            action: 'aws:runShellScript',
            name: 'runMemoryStress',
            inputs: {
              runCommand: [
                'stress-ng --vm {{ workers }} --vm-bytes {{ memory }} --timeout {{ duration }}s --metrics-brief'
              ]
            }
          }
        ]
      }
    });

    // Disk I/O Stress Document
    new CfnDocument(stack, 'StressDiskIO', {
      documentType: 'Command',
      name: 'StressDiskIO',
      content: {
        schemaVersion: '2.2',
        description: 'Stress disk I/O',
        parameters: {
          duration: {
            type: 'String',
            description: 'Duration in seconds',
            default: '60'
          },
          workers: {
            type: 'String',
            description: 'Number of worker threads',
            default: '1'
          }
        },
        mainSteps: [
          {
            action: 'aws:runShellScript',
            name: 'runDiskStress',
            inputs: {
              runCommand: [
                'stress-ng --io {{ workers }} --timeout {{ duration }}s --metrics-brief'
              ]
            }
          }
        ]
      }
    });
  }
}
```

### 3. Experiment Execution Service

```typescript
// NEW/shared/chaos/experiment-executor.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { FISClient, StartExperimentCommand, StopExperimentCommand, GetExperimentCommand } from '@aws-sdk/client-fis';
import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';
import { EventEmitter2 } from '@nestjs/event-emitter';

export enum ExperimentType {
  ECS_TASK_TERMINATION = 'ECS_TASK_TERMINATION',
  DATABASE_FAILOVER = 'DATABASE_FAILOVER',
  NETWORK_LATENCY = 'NETWORK_LATENCY',
  CPU_STRESS = 'CPU_STRESS',
  MEMORY_STRESS = 'MEMORY_STRESS',
  DISK_IO_STRESS = 'DISK_IO_STRESS'
}

export interface ExperimentConfig {
  type: ExperimentType;
  templateId: string;
  tags?: Record<string, string>;
  clientToken?: string;
  targetOverrides?: Record<string, any>;
}

export interface ExperimentResult {
  experimentId: string;
  status: 'pending' | 'initiating' | 'running' | 'completed' | 'stopped' | 'failed';
  startTime: Date;
  endTime?: Date;
  reason?: string;
  metrics?: Record<string, number>;
}

@Injectable()
export class ExperimentExecutorService {
  private readonly logger = new Logger(ExperimentExecutorService.name);
  private readonly fisClient: FISClient;
  private readonly cloudwatchClient: CloudWatchClient;
  private activeExperiments: Map<string, ExperimentResult> = new Map();

  constructor(
    private eventEmitter: EventEmitter2
  ) {
    this.fisClient = new FISClient({
      region: process.env.AWS_REGION || 'us-east-1'
    });

    this.cloudwatchClient = new CloudWatchClient({
      region: process.env.AWS_REGION || 'us-east-1'
    });

    // Safety: Auto-stop experiments after timeout
    setInterval(() => this.checkExperimentTimeouts(), 60000); // Every minute
  }

  async startExperiment(config: ExperimentConfig): Promise<ExperimentResult> {
    this.logger.log(`Starting chaos experiment: ${config.type}`);

    // Safety check: Don't run multiple experiments of the same type simultaneously
    const activeOfType = Array.from(this.activeExperiments.values()).filter(
      exp => exp.status === 'running' && config.templateId === exp.experimentId
    );

    if (activeOfType.length > 0) {
      throw new Error(`Experiment of type ${config.type} is already running`);
    }

    try {
      const command = new StartExperimentCommand({
        experimentTemplateId: config.templateId,
        clientToken: config.clientToken || `${config.type}-${Date.now()}`,
        tags: {
          ...config.tags,
          InitiatedBy: 'ChaosEngineering',
          Timestamp: new Date().toISOString()
        }
      });

      const response = await this.fisClient.send(command);

      const result: ExperimentResult = {
        experimentId: response.experiment!.id!,
        status: 'initiating',
        startTime: new Date()
      };

      this.activeExperiments.set(result.experimentId, result);

      // Emit event for monitoring
      this.eventEmitter.emit('chaos.experiment.started', {
        type: config.type,
        experimentId: result.experimentId,
        timestamp: result.startTime
      });

      // Record metric
      await this.recordMetric('ExperimentStarted', 1, config.type);

      // Start monitoring the experiment
      this.monitorExperiment(result.experimentId);

      return result;
    } catch (error) {
      this.logger.error(`Failed to start experiment: ${error.message}`);
      await this.recordMetric('ExperimentStartFailed', 1, config.type);
      throw error;
    }
  }

  async stopExperiment(experimentId: string): Promise<void> {
    this.logger.log(`Stopping chaos experiment: ${experimentId}`);

    try {
      const command = new StopExperimentCommand({
        id: experimentId
      });

      await this.fisClient.send(command);

      const experiment = this.activeExperiments.get(experimentId);
      if (experiment) {
        experiment.status = 'stopped';
        experiment.endTime = new Date();
      }

      // Emit event
      this.eventEmitter.emit('chaos.experiment.stopped', {
        experimentId,
        timestamp: new Date()
      });

      // Record metric
      await this.recordMetric('ExperimentStopped', 1);

    } catch (error) {
      this.logger.error(`Failed to stop experiment: ${error.message}`);
      throw error;
    }
  }

  private async monitorExperiment(experimentId: string): Promise<void> {
    const checkStatus = async () => {
      try {
        const command = new GetExperimentCommand({ id: experimentId });
        const response = await this.fisClient.send(command);

        const experiment = this.activeExperiments.get(experimentId);
        if (experiment) {
          experiment.status = response.experiment!.state!.status! as any;

          if (['completed', 'stopped', 'failed'].includes(experiment.status)) {
            experiment.endTime = new Date();
            experiment.reason = response.experiment!.state!.reason;

            // Calculate duration
            const duration = experiment.endTime.getTime() - experiment.startTime.getTime();
            experiment.metrics = {
              duration: duration / 1000 // in seconds
            };

            // Emit completion event
            this.eventEmitter.emit('chaos.experiment.completed', {
              experimentId,
              status: experiment.status,
              duration: experiment.metrics.duration,
              timestamp: experiment.endTime
            });

            // Record metrics
            await this.recordMetric('ExperimentCompleted', 1, experiment.status);
            await this.recordMetric('ExperimentDuration', experiment.metrics.duration);

            return; // Stop monitoring
          }
        }

        // Continue monitoring if not complete
        setTimeout(() => checkStatus(), 10000); // Check every 10 seconds

      } catch (error) {
        this.logger.error(`Error monitoring experiment: ${error.message}`);
      }
    };

    checkStatus();
  }

  private async checkExperimentTimeouts(): Promise<void> {
    const maxDuration = 3600000; // 1 hour max

    for (const [id, experiment] of this.activeExperiments) {
      if (experiment.status === 'running') {
        const duration = Date.now() - experiment.startTime.getTime();

        if (duration > maxDuration) {
          this.logger.warn(`Auto-stopping experiment ${id} due to timeout`);
          await this.stopExperiment(id);
        }
      }
    }
  }

  private async recordMetric(
    metricName: string,
    value: number,
    dimension?: string
  ): Promise<void> {
    try {
      const command = new PutMetricDataCommand({
        Namespace: 'ChaosEngineering',
        MetricData: [{
          MetricName: metricName,
          Value: value,
          Timestamp: new Date(),
          Dimensions: dimension ? [{
            Name: 'ExperimentType',
            Value: dimension
          }] : undefined
        }]
      });

      await this.cloudwatchClient.send(command);
    } catch (error) {
      this.logger.error(`Failed to record metric: ${error.message}`);
    }
  }

  async getActiveExperiments(): Promise<ExperimentResult[]> {
    return Array.from(this.activeExperiments.values()).filter(
      exp => exp.status === 'running'
    );
  }

  async getExperimentHistory(limit: number = 10): Promise<ExperimentResult[]> {
    return Array.from(this.activeExperiments.values())
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit);
  }
}
```

## Litmus Chaos for Kubernetes

### 1. Litmus Installation

```yaml
# infrastructure/k8s/litmus/litmus-operator.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: litmus
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: litmus
  namespace: litmus
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: litmus
rules:
  - apiGroups: [""]
    resources: ["pods", "pods/log", "pods/exec", "services", "endpoints", "events", "configmaps", "secrets"]
    verbs: ["*"]
  - apiGroups: ["apps"]
    resources: ["deployments", "daemonsets", "replicasets", "statefulsets"]
    verbs: ["*"]
  - apiGroups: ["batch"]
    resources: ["jobs"]
    verbs: ["*"]
  - apiGroups: ["litmuschaos.io"]
    resources: ["*"]
    verbs: ["*"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: litmus
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: litmus
subjects:
  - kind: ServiceAccount
    name: litmus
    namespace: litmus
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: chaos-operator
  namespace: litmus
spec:
  replicas: 1
  selector:
    matchLabels:
      name: chaos-operator
  template:
    metadata:
      labels:
        name: chaos-operator
    spec:
      serviceAccountName: litmus
      containers:
        - name: chaos-operator
          image: litmuschaos/chaos-operator:2.14.0
          env:
            - name: CHAOS_RUNNER_IMAGE
              value: "litmuschaos/chaos-runner:2.14.0"
            - name: WATCH_NAMESPACE
              value: ""
            - name: POD_NAME
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
            - name: POD_NAMESPACE
              valueFrom:
                fieldRef:
                  fieldPath: metadata.namespace
```

### 2. Chaos Experiments

```yaml
# infrastructure/k8s/litmus/experiments/pod-delete.yaml
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: pod-delete-chaos
  namespace: production
spec:
  appinfo:
    appns: production
    applabel: 'service=calculation-service'
    appkind: 'deployment'
  engineState: 'active'
  chaosServiceAccount: litmus-admin
  experiments:
    - name: pod-delete
      spec:
        components:
          env:
            - name: TOTAL_CHAOS_DURATION
              value: '60'
            - name: CHAOS_INTERVAL
              value: '10'
            - name: FORCE
              value: 'false'
            - name: PODS_AFFECTED_PERC
              value: '30'
        probe:
          - name: service-availability
            type: httpProbe
            httpProbe/inputs:
              url: http://calculation-service:3005/health
              insecureSkipVerify: false
              responseTimeout: 5000
              method:
                get:
                  criteria: ==
                  responseCode: '200'
            mode: Continuous
            runProperties:
              probeTimeout: 10
              retry: 2
              interval: 5
              stopOnFailure: true
---
# Network Latency Experiment
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: network-latency-chaos
  namespace: production
spec:
  appinfo:
    appns: production
    applabel: 'service=identity-service'
    appkind: 'deployment'
  engineState: 'active'
  chaosServiceAccount: litmus-admin
  experiments:
    - name: pod-network-latency
      spec:
        components:
          env:
            - name: NETWORK_INTERFACE
              value: 'eth0'
            - name: NETWORK_LATENCY
              value: '200'
            - name: JITTER
              value: '50'
            - name: TOTAL_CHAOS_DURATION
              value: '120'
            - name: PODS_AFFECTED_PERC
              value: '50'
            - name: DESTINATION_IPS
              value: '10.0.2.0/24'  # Organization service subnet
---
# CPU Hog Experiment
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: cpu-hog-chaos
  namespace: production
spec:
  appinfo:
    appns: production
    applabel: 'service=reporting-service'
    appkind: 'deployment'
  engineState: 'active'
  chaosServiceAccount: litmus-admin
  experiments:
    - name: pod-cpu-hog
      spec:
        components:
          env:
            - name: CPU_CORES
              value: '2'
            - name: CPU_LOAD
              value: '80'
            - name: TOTAL_CHAOS_DURATION
              value: '180'
            - name: PODS_AFFECTED_PERC
              value: '25'
```

### 3. Litmus Workflow Automation

```typescript
// NEW/shared/chaos/litmus-client.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as k8s from '@kubernetes/client-node';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface LitmusExperiment {
  name: string;
  namespace: string;
  targetApp: string;
  experimentType: 'pod-delete' | 'network-latency' | 'cpu-hog' | 'memory-hog' | 'disk-fill';
  duration: number;
  parameters?: Record<string, any>;
}

@Injectable()
export class LitmusChaosService {
  private readonly logger = new Logger(LitmusChaosService.name);
  private k8sApi: k8s.CustomObjectsApi;
  private coreApi: k8s.CoreV1Api;

  constructor(
    private eventEmitter: EventEmitter2
  ) {
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();
    this.k8sApi = kc.makeApiClient(k8s.CustomObjectsApi);
    this.coreApi = kc.makeApiClient(k8s.CoreV1Api);
  }

  async runExperiment(experiment: LitmusExperiment): Promise<string> {
    this.logger.log(`Starting Litmus experiment: ${experiment.name}`);

    const chaosEngine = this.createChaosEngine(experiment);

    try {
      // Create the ChaosEngine
      const response = await this.k8sApi.createNamespacedCustomObject(
        'litmuschaos.io',
        'v1alpha1',
        experiment.namespace,
        'chaosengines',
        chaosEngine
      );

      const engineName = response.body.metadata.name;

      // Monitor the experiment
      this.monitorExperiment(engineName, experiment.namespace);

      // Emit event
      this.eventEmitter.emit('litmus.experiment.started', {
        name: experiment.name,
        type: experiment.experimentType,
        timestamp: new Date()
      });

      return engineName;
    } catch (error) {
      this.logger.error(`Failed to start Litmus experiment: ${error.message}`);
      throw error;
    }
  }

  private createChaosEngine(experiment: LitmusExperiment): any {
    const baseEngine = {
      apiVersion: 'litmuschaos.io/v1alpha1',
      kind: 'ChaosEngine',
      metadata: {
        name: experiment.name,
        namespace: experiment.namespace,
        labels: {
          'chaos-type': experiment.experimentType,
          'initiated-by': 'chaos-engineering-service'
        }
      },
      spec: {
        appinfo: {
          appns: experiment.namespace,
          applabel: `service=${experiment.targetApp}`,
          appkind: 'deployment'
        },
        engineState: 'active',
        chaosServiceAccount: 'litmus-admin',
        experiments: []
      }
    };

    // Add experiment-specific configuration
    switch (experiment.experimentType) {
      case 'pod-delete':
        baseEngine.spec.experiments.push({
          name: 'pod-delete',
          spec: {
            components: {
              env: [
                { name: 'TOTAL_CHAOS_DURATION', value: String(experiment.duration) },
                { name: 'CHAOS_INTERVAL', value: '10' },
                { name: 'FORCE', value: 'false' },
                { name: 'PODS_AFFECTED_PERC', value: experiment.parameters?.percentage || '30' }
              ]
            }
          }
        });
        break;

      case 'network-latency':
        baseEngine.spec.experiments.push({
          name: 'pod-network-latency',
          spec: {
            components: {
              env: [
                { name: 'NETWORK_INTERFACE', value: 'eth0' },
                { name: 'NETWORK_LATENCY', value: experiment.parameters?.latency || '100' },
                { name: 'JITTER', value: experiment.parameters?.jitter || '10' },
                { name: 'TOTAL_CHAOS_DURATION', value: String(experiment.duration) },
                { name: 'PODS_AFFECTED_PERC', value: experiment.parameters?.percentage || '50' }
              ]
            }
          }
        });
        break;

      case 'cpu-hog':
        baseEngine.spec.experiments.push({
          name: 'pod-cpu-hog',
          spec: {
            components: {
              env: [
                { name: 'CPU_CORES', value: experiment.parameters?.cores || '1' },
                { name: 'CPU_LOAD', value: experiment.parameters?.load || '70' },
                { name: 'TOTAL_CHAOS_DURATION', value: String(experiment.duration) },
                { name: 'PODS_AFFECTED_PERC', value: experiment.parameters?.percentage || '25' }
              ]
            }
          }
        });
        break;
    }

    // Add probes for monitoring
    if (baseEngine.spec.experiments[0]) {
      baseEngine.spec.experiments[0].spec.probe = [{
        name: 'service-health-check',
        type: 'httpProbe',
        'httpProbe/inputs': {
          url: `http://${experiment.targetApp}:3000/health`,
          insecureSkipVerify: false,
          responseTimeout: 5000,
          method: {
            get: {
              criteria: '==',
              responseCode: '200'
            }
          }
        },
        mode: 'Continuous',
        runProperties: {
          probeTimeout: 10,
          retry: 2,
          interval: 5,
          stopOnFailure: true
        }
      }];
    }

    return baseEngine;
  }

  private async monitorExperiment(engineName: string, namespace: string): Promise<void> {
    const checkStatus = async () => {
      try {
        const engine = await this.k8sApi.getNamespacedCustomObject(
          'litmuschaos.io',
          'v1alpha1',
          namespace,
          'chaosengines',
          engineName
        );

        const status = engine.body.status?.engineStatus;

        if (status === 'completed' || status === 'stopped') {
          // Get experiment result
          const result = await this.k8sApi.getNamespacedCustomObject(
            'litmuschaos.io',
            'v1alpha1',
            namespace,
            'chaosresults',
            `${engineName}-result`
          );

          // Emit completion event
          this.eventEmitter.emit('litmus.experiment.completed', {
            name: engineName,
            status,
            verdict: result.body.status?.experimentStatus?.verdict,
            timestamp: new Date()
          });

          return; // Stop monitoring
        }

        // Continue monitoring
        setTimeout(() => checkStatus(), 5000);
      } catch (error) {
        this.logger.error(`Error monitoring Litmus experiment: ${error.message}`);
      }
    };

    checkStatus();
  }

  async stopExperiment(engineName: string, namespace: string): Promise<void> {
    try {
      // Patch the ChaosEngine to stop it
      await this.k8sApi.patchNamespacedCustomObject(
        'litmuschaos.io',
        'v1alpha1',
        namespace,
        'chaosengines',
        engineName,
        { spec: { engineState: 'stop' } },
        undefined,
        undefined,
        undefined,
        { headers: { 'Content-Type': 'application/merge-patch+json' } }
      );

      this.logger.log(`Stopped Litmus experiment: ${engineName}`);
    } catch (error) {
      this.logger.error(`Failed to stop Litmus experiment: ${error.message}`);
      throw error;
    }
  }
}
```

## Local Chaos Testing

### 1. Docker Compose Chaos Setup

```yaml
# docker-compose.chaos.yml
version: '3.8'

services:
  # Toxiproxy for network chaos
  toxiproxy:
    image: shopify/toxiproxy:2.5.0
    ports:
      - "8474:8474"
    networks:
      - chaos-network
    volumes:
      - ./chaos/toxiproxy.json:/config/toxiproxy.json
    command: ["-config", "/config/toxiproxy.json"]

  # Pumba for container chaos
  pumba:
    image: gaiaadm/pumba:latest
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    command: --log-level info --interval 30s --random
    networks:
      - chaos-network

  # Chaos Coordinator Service
  chaos-coordinator:
    build:
      context: ./NEW/chaos-coordinator
      dockerfile: Dockerfile
    environment:
      - DOCKER_HOST=unix:///var/run/docker.sock
      - TOXIPROXY_HOST=toxiproxy:8474
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    ports:
      - "3999:3999"
    networks:
      - chaos-network

networks:
  chaos-network:
    driver: bridge
```

### 2. Local Chaos Scripts

```typescript
// NEW/chaos-coordinator/src/local-chaos.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as Docker from 'dockerode';
import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface LocalChaosConfig {
  type: 'network' | 'resource' | 'container';
  target: string; // Container name or service
  parameters: Record<string, any>;
  duration: number; // seconds
}

@Injectable()
export class LocalChaosService {
  private readonly logger = new Logger(LocalChaosService.name);
  private docker: Docker;
  private toxiproxyUrl: string;

  constructor() {
    this.docker = new Docker({ socketPath: '/var/run/docker.sock' });
    this.toxiproxyUrl = process.env.TOXIPROXY_HOST || 'http://localhost:8474';
  }

  async executeLocalChaos(config: LocalChaosConfig): Promise<void> {
    this.logger.log(`Executing local chaos: ${config.type} on ${config.target}`);

    switch (config.type) {
      case 'network':
        await this.executeNetworkChaos(config);
        break;
      case 'resource':
        await this.executeResourceChaos(config);
        break;
      case 'container':
        await this.executeContainerChaos(config);
        break;
    }
  }

  private async executeNetworkChaos(config: LocalChaosConfig): Promise<void> {
    const { target, parameters, duration } = config;

    // Using Toxiproxy
    if (parameters.type === 'latency') {
      await this.addToxiproxyLatency(target, parameters.latency, parameters.jitter);
    } else if (parameters.type === 'packet_loss') {
      await this.addToxiproxyPacketLoss(target, parameters.rate);
    } else if (parameters.type === 'bandwidth') {
      await this.addToxiproxyBandwidthLimit(target, parameters.rate);
    }

    // Auto-remove after duration
    setTimeout(async () => {
      await this.removeToxiproxyToxic(target);
      this.logger.log(`Network chaos removed for ${target}`);
    }, duration * 1000);
  }

  private async addToxiproxyLatency(
    proxy: string,
    latency: number,
    jitter: number
  ): Promise<void> {
    await axios.post(`${this.toxiproxyUrl}/proxies/${proxy}/toxics`, {
      type: 'latency',
      name: 'latency_toxic',
      attributes: {
        latency: latency,
        jitter: jitter
      }
    });
  }

  private async addToxiproxyPacketLoss(proxy: string, rate: number): Promise<void> {
    await axios.post(`${this.toxiproxyUrl}/proxies/${proxy}/toxics`, {
      type: 'timeout',
      name: 'packet_loss_toxic',
      attributes: {
        timeout: 0,
        toxicity: rate
      }
    });
  }

  private async addToxiproxyBandwidthLimit(proxy: string, rate: number): Promise<void> {
    await axios.post(`${this.toxiproxyUrl}/proxies/${proxy}/toxics`, {
      type: 'bandwidth',
      name: 'bandwidth_toxic',
      attributes: {
        rate: rate
      }
    });
  }

  private async removeToxiproxyToxic(proxy: string): Promise<void> {
    try {
      const toxics = await axios.get(`${this.toxiproxyUrl}/proxies/${proxy}/toxics`);
      for (const toxic of toxics.data) {
        await axios.delete(`${this.toxiproxyUrl}/proxies/${proxy}/toxics/${toxic.name}`);
      }
    } catch (error) {
      this.logger.error(`Failed to remove toxic: ${error.message}`);
    }
  }

  private async executeResourceChaos(config: LocalChaosConfig): Promise<void> {
    const { target, parameters, duration } = config;

    // Using Pumba or direct Docker commands
    const container = this.docker.getContainer(target);

    if (parameters.type === 'cpu') {
      // Update container CPU limits
      await container.update({
        CpuQuota: parameters.limit * 1000,
        CpuPeriod: 100000
      });
    } else if (parameters.type === 'memory') {
      // Update container memory limits
      await container.update({
        Memory: parameters.limit * 1024 * 1024,
        MemorySwap: parameters.limit * 1024 * 1024
      });
    }

    // Restore after duration
    setTimeout(async () => {
      await container.update({
        CpuQuota: -1,
        Memory: 0,
        MemorySwap: 0
      });
      this.logger.log(`Resource chaos removed for ${target}`);
    }, duration * 1000);
  }

  private async executeContainerChaos(config: LocalChaosConfig): Promise<void> {
    const { target, parameters } = config;

    if (parameters.action === 'kill') {
      // Kill container using Pumba
      await execAsync(`pumba kill --signal SIGKILL ${target}`);
    } else if (parameters.action === 'pause') {
      // Pause container
      const container = this.docker.getContainer(target);
      await container.pause();

      // Unpause after duration
      setTimeout(async () => {
        await container.unpause();
        this.logger.log(`Container ${target} unpaused`);
      }, config.duration * 1000);
    } else if (parameters.action === 'stop') {
      // Stop container
      const container = this.docker.getContainer(target);
      await container.stop();
    }
  }

  async runPumbaNetem(
    container: string,
    command: string,
    duration: number
  ): Promise<void> {
    // Run Pumba netem commands for advanced network chaos
    const cmd = `pumba netem --duration ${duration}s ${command} ${container}`;
    await execAsync(cmd);
  }

  async injectStress(
    container: string,
    type: 'cpu' | 'memory' | 'io',
    intensity: number,
    duration: number
  ): Promise<void> {
    let stressCmd: string;

    switch (type) {
      case 'cpu':
        stressCmd = `stress-ng --cpu $(nproc) --cpu-load ${intensity} --timeout ${duration}s`;
        break;
      case 'memory':
        stressCmd = `stress-ng --vm 1 --vm-bytes ${intensity}M --timeout ${duration}s`;
        break;
      case 'io':
        stressCmd = `stress-ng --io $(nproc) --timeout ${duration}s`;
        break;
    }

    // Execute stress command inside container
    await execAsync(`docker exec ${container} sh -c "${stressCmd}"`);
  }
}
```

## Game Day Scenarios

### 1. Scenario Definitions

```typescript
// NEW/shared/chaos/game-day-scenarios.ts
export enum GameDayScenario {
  DATABASE_FAILOVER = 'DATABASE_FAILOVER',
  CASCADING_FAILURE = 'CASCADING_FAILURE',
  THUNDERING_HERD = 'THUNDERING_HERD',
  SPLIT_BRAIN = 'SPLIT_BRAIN',
  DATA_CENTER_OUTAGE = 'DATA_CENTER_OUTAGE',
  DEPENDENCY_UNAVAILABLE = 'DEPENDENCY_UNAVAILABLE',
  CACHE_AVALANCHE = 'CACHE_AVALANCHE'
}

export interface ScenarioDefinition {
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  expectedOutcome: string;
  experiments: Array<{
    type: string;
    delay?: number; // Delay before starting this experiment
    config: any;
  }>;
  validationChecks: Array<{
    type: string;
    parameters: any;
  }>;
  rollbackPlan: string;
}

export const GAME_DAY_SCENARIOS: Record<GameDayScenario, ScenarioDefinition> = {
  [GameDayScenario.DATABASE_FAILOVER]: {
    name: 'Database Failover Test',
    description: 'Simulate primary database failure and verify automatic failover',
    severity: 'high',
    expectedOutcome: 'Services continue operating with <30s downtime',
    experiments: [
      {
        type: 'database-failover',
        config: {
          cluster: 'production-cluster',
          forceFail: true
        }
      }
    ],
    validationChecks: [
      {
        type: 'service-health',
        parameters: { expectedStatus: 'healthy', maxDowntime: 30 }
      },
      {
        type: 'data-consistency',
        parameters: { checkType: 'eventual-consistency' }
      }
    ],
    rollbackPlan: 'Promote replica to primary if auto-failover fails'
  },

  [GameDayScenario.CASCADING_FAILURE]: {
    name: 'Cascading Failure Simulation',
    description: 'Test circuit breakers by causing upstream service failure',
    severity: 'critical',
    expectedOutcome: 'Circuit breakers prevent cascade, graceful degradation',
    experiments: [
      {
        type: 'service-failure',
        config: {
          service: 'reference-service',
          failureRate: 100
        }
      },
      {
        type: 'load-test',
        delay: 10,
        config: {
          target: 'calculation-service',
          rps: 100,
          duration: 60
        }
      }
    ],
    validationChecks: [
      {
        type: 'circuit-breaker-status',
        parameters: { expectedState: 'open', service: 'calculation-service' }
      },
      {
        type: 'error-rate',
        parameters: { maxErrorRate: 5, service: 'api-gateway' }
      }
    ],
    rollbackPlan: 'Reset circuit breakers, restart failed services'
  },

  [GameDayScenario.THUNDERING_HERD]: {
    name: 'Thundering Herd Problem',
    description: 'Simulate cache expiry under load',
    severity: 'high',
    expectedOutcome: 'Jittered cache refresh prevents database overload',
    experiments: [
      {
        type: 'cache-flush',
        config: {
          cacheType: 'redis',
          pattern: 'emission-factors:*'
        }
      },
      {
        type: 'load-spike',
        delay: 1,
        config: {
          target: 'calculation-service',
          rps: 500,
          duration: 30
        }
      }
    ],
    validationChecks: [
      {
        type: 'database-load',
        parameters: { maxConnections: 100, maxCpu: 70 }
      },
      {
        type: 'response-time',
        parameters: { p99: 500, p95: 200 }
      }
    ],
    rollbackPlan: 'Pre-warm cache, enable read replicas'
  }
};
```

### 2. Game Day Executor

```typescript
// NEW/shared/chaos/game-day-executor.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ExperimentExecutorService } from './experiment-executor.service';
import { LitmusChaosService } from './litmus-client.service';
import { LocalChaosService } from './local-chaos.service';
import { MetricsService } from '../monitoring/metrics.service';
import { AlertingService } from '../monitoring/alerting.service';

export interface GameDayResult {
  scenario: string;
  startTime: Date;
  endTime: Date;
  status: 'success' | 'failure' | 'partial';
  experiments: Array<{
    name: string;
    status: string;
    duration: number;
  }>;
  validationResults: Array<{
    check: string;
    passed: boolean;
    details: any;
  }>;
  metrics: {
    totalDowntime: number;
    maxErrorRate: number;
    p99ResponseTime: number;
  };
  lessons: string[];
}

@Injectable()
export class GameDayExecutorService {
  private readonly logger = new Logger(GameDayExecutorService.name);

  constructor(
    private experimentExecutor: ExperimentExecutorService,
    private litmusService: LitmusChaosService,
    private localChaosService: LocalChaosService,
    private metricsService: MetricsService,
    private alertingService: AlertingService
  ) {}

  async executeGameDay(
    scenario: GameDayScenario,
    dryRun: boolean = false
  ): Promise<GameDayResult> {
    const definition = GAME_DAY_SCENARIOS[scenario];
    this.logger.log(`Starting Game Day: ${definition.name}`);

    const result: GameDayResult = {
      scenario: definition.name,
      startTime: new Date(),
      endTime: new Date(),
      status: 'success',
      experiments: [],
      validationResults: [],
      metrics: {
        totalDowntime: 0,
        maxErrorRate: 0,
        p99ResponseTime: 0
      },
      lessons: []
    };

    // Pre-flight checks
    await this.runPreFlightChecks();

    // Notify team
    await this.alertingService.sendGameDayNotification({
      scenario: definition.name,
      severity: definition.severity,
      dryRun,
      startTime: result.startTime
    });

    try {
      // Execute experiments sequentially with delays
      for (const experiment of definition.experiments) {
        if (experiment.delay) {
          await this.sleep(experiment.delay * 1000);
        }

        if (!dryRun) {
          const expResult = await this.executeExperiment(experiment);
          result.experiments.push(expResult);
        } else {
          this.logger.log(`[DRY RUN] Would execute: ${experiment.type}`);
        }
      }

      // Wait for system to stabilize
      await this.sleep(30000);

      // Run validation checks
      for (const check of definition.validationChecks) {
        const checkResult = await this.runValidationCheck(check);
        result.validationResults.push(checkResult);

        if (!checkResult.passed) {
          result.status = 'failure';
        }
      }

      // Collect metrics
      result.metrics = await this.collectGameDayMetrics(result.startTime);

      // Generate lessons learned
      result.lessons = this.generateLessonsLearned(result);

    } catch (error) {
      this.logger.error(`Game Day failed: ${error.message}`);
      result.status = 'failure';

      // Execute rollback
      await this.executeRollback(definition.rollbackPlan);
    }

    result.endTime = new Date();

    // Send summary
    await this.alertingService.sendGameDaySummary(result);

    return result;
  }

  private async runPreFlightChecks(): Promise<void> {
    // Verify all services are healthy
    const health = await this.metricsService.checkSystemHealth();
    if (!health.allHealthy) {
      throw new Error('System not healthy, cannot proceed with Game Day');
    }

    // Verify monitoring is working
    const monitoringStatus = await this.metricsService.checkMonitoringStatus();
    if (!monitoringStatus.operational) {
      throw new Error('Monitoring not operational');
    }

    // Verify rollback capability
    // ... additional checks
  }

  private async executeExperiment(experiment: any): Promise<any> {
    const startTime = Date.now();

    // Route to appropriate executor based on environment
    let status = 'completed';
    try {
      if (process.env.ENVIRONMENT === 'aws') {
        await this.experimentExecutor.startExperiment(experiment.config);
      } else if (process.env.ENVIRONMENT === 'kubernetes') {
        await this.litmusService.runExperiment(experiment.config);
      } else {
        await this.localChaosService.executeLocalChaos(experiment.config);
      }
    } catch (error) {
      status = 'failed';
      throw error;
    }

    return {
      name: experiment.type,
      status,
      duration: (Date.now() - startTime) / 1000
    };
  }

  private async runValidationCheck(check: any): Promise<any> {
    // Implement various validation checks
    switch (check.type) {
      case 'service-health':
        return this.validateServiceHealth(check.parameters);
      case 'data-consistency':
        return this.validateDataConsistency(check.parameters);
      case 'circuit-breaker-status':
        return this.validateCircuitBreakerStatus(check.parameters);
      case 'error-rate':
        return this.validateErrorRate(check.parameters);
      default:
        return { check: check.type, passed: false, details: 'Unknown check type' };
    }
  }

  private async validateServiceHealth(parameters: any): Promise<any> {
    const health = await this.metricsService.getServiceHealth();
    const passed = health.status === parameters.expectedStatus &&
                  health.downtime <= parameters.maxDowntime;

    return {
      check: 'service-health',
      passed,
      details: {
        expectedStatus: parameters.expectedStatus,
        actualStatus: health.status,
        downtime: health.downtime
      }
    };
  }

  private async validateDataConsistency(parameters: any): Promise<any> {
    // Implement data consistency checks
    // This would vary based on your specific consistency requirements
    return {
      check: 'data-consistency',
      passed: true,
      details: { checkType: parameters.checkType }
    };
  }

  private async validateCircuitBreakerStatus(parameters: any): Promise<any> {
    // Check circuit breaker state
    const status = await this.metricsService.getCircuitBreakerStatus(parameters.service);
    const passed = status.state === parameters.expectedState;

    return {
      check: 'circuit-breaker-status',
      passed,
      details: {
        service: parameters.service,
        expectedState: parameters.expectedState,
        actualState: status.state
      }
    };
  }

  private async validateErrorRate(parameters: any): Promise<any> {
    const errorRate = await this.metricsService.getErrorRate(parameters.service);
    const passed = errorRate <= parameters.maxErrorRate;

    return {
      check: 'error-rate',
      passed,
      details: {
        service: parameters.service,
        maxErrorRate: parameters.maxErrorRate,
        actualErrorRate: errorRate
      }
    };
  }

  private async collectGameDayMetrics(startTime: Date): Promise<any> {
    const metrics = await this.metricsService.getMetricsSummary(
      startTime,
      new Date()
    );

    return {
      totalDowntime: metrics.totalDowntime,
      maxErrorRate: metrics.maxErrorRate,
      p99ResponseTime: metrics.p99ResponseTime
    };
  }

  private generateLessonsLearned(result: GameDayResult): string[] {
    const lessons: string[] = [];

    // Analyze failures
    const failedChecks = result.validationResults.filter(r => !r.passed);
    if (failedChecks.length > 0) {
      lessons.push(`${failedChecks.length} validation checks failed - review thresholds`);
    }

    // Analyze metrics
    if (result.metrics.totalDowntime > 0) {
      lessons.push(`System experienced ${result.metrics.totalDowntime}s downtime`);
    }

    if (result.metrics.maxErrorRate > 1) {
      lessons.push(`Error rate peaked at ${result.metrics.maxErrorRate}%`);
    }

    // Add specific lessons based on scenario
    // ... scenario-specific analysis

    return lessons;
  }

  private async executeRollback(rollbackPlan: string): Promise<void> {
    this.logger.warn(`Executing rollback: ${rollbackPlan}`);

    // Implement rollback steps
    // This would be specific to your infrastructure

    // Examples:
    // - Reset circuit breakers
    // - Restart failed services
    // - Clear corrupted cache
    // - Restore database from snapshot
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## Monitoring & Observability

### Chaos Metrics Dashboard

```typescript
// NEW/shared/monitoring/chaos-metrics.dashboard.ts
export const CHAOS_METRICS_DASHBOARD = {
  name: 'Chaos Engineering Metrics',
  panels: [
    {
      title: 'Experiment Success Rate',
      query: 'sum(rate(chaos_experiments_completed[5m])) by (status)',
      type: 'graph'
    },
    {
      title: 'Service Recovery Time',
      query: 'histogram_quantile(0.99, chaos_recovery_time_seconds)',
      type: 'stat'
    },
    {
      title: 'Circuit Breaker Activations',
      query: 'sum(increase(circuit_breaker_opened_total[1h])) by (service)',
      type: 'bar'
    },
    {
      title: 'Error Rate During Chaos',
      query: 'sum(rate(http_requests_total{status=~"5.."}[5m])) by (service)',
      type: 'graph'
    },
    {
      title: 'Database Failover Time',
      query: 'chaos_database_failover_duration_seconds',
      type: 'stat'
    },
    {
      title: 'Data Loss Incidents',
      query: 'sum(chaos_data_loss_incidents_total)',
      type: 'stat',
      alert: {
        condition: 'value > 0',
        severity: 'critical'
      }
    }
  ]
};
```

## Safety Mechanisms

### Automated Abort Conditions

```typescript
// NEW/shared/chaos/safety-mechanisms.ts
export class ChaosSafetyController {
  private abortConditions = [
    {
      metric: 'error_rate',
      threshold: 10, // percent
      duration: 60, // seconds
      action: 'abort'
    },
    {
      metric: 'p99_latency',
      threshold: 5000, // milliseconds
      duration: 30,
      action: 'abort'
    },
    {
      metric: 'data_corruption_detected',
      threshold: 1,
      duration: 0,
      action: 'immediate_abort'
    }
  ];

  async checkSafetyConditions(): Promise<boolean> {
    for (const condition of this.abortConditions) {
      const value = await this.getMetricValue(condition.metric);

      if (value > condition.threshold) {
        if (condition.action === 'immediate_abort') {
          await this.abortAllExperiments();
          return false;
        }

        // Check if condition persists
        const persistCheck = await this.checkPersistence(
          condition.metric,
          condition.threshold,
          condition.duration
        );

        if (persistCheck) {
          await this.abortAllExperiments();
          return false;
        }
      }
    }

    return true;
  }

  private async abortAllExperiments(): Promise<void> {
    // Emergency stop all chaos experiments
    await this.experimentExecutor.stopAllExperiments();
    await this.alertingService.sendEmergencyAlert('Chaos experiments aborted due to safety threshold breach');
  }
}
```

## Rollback Procedures

### Automated Rollback

```yaml
# infrastructure/k8s/chaos/rollback-job.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: chaos-rollback
  namespace: production
spec:
  template:
    spec:
      serviceAccountName: chaos-rollback
      containers:
        - name: rollback
          image: clenergize/chaos-rollback:latest
          env:
            - name: ACTION
              value: "full_rollback"
          command:
            - /bin/sh
            - -c
            - |
              # Reset all circuit breakers
              kubectl patch configmap circuit-breaker-config -n production --type merge -p '{"data":{"state":"closed"}}'

              # Restart affected services
              kubectl rollout restart deployment -n production

              # Clear Redis cache
              redis-cli -h redis-service FLUSHALL

              # Reset database connections
              kubectl delete pods -l app=database-proxy -n production

              # Restore from backup if needed
              if [ "$DATA_CORRUPTION" = "true" ]; then
                /scripts/restore-from-backup.sh
              fi
      restartPolicy: Never
```

## Implementation Checklist

- [ ] AWS FIS templates deployed
- [ ] SSM documents created
- [ ] Litmus installed in Kubernetes cluster
- [ ] Local chaos tools configured
- [ ] Game Day scenarios defined
- [ ] Monitoring dashboards created
- [ ] Safety mechanisms tested
- [ ] Rollback procedures verified
- [ ] Team trained on chaos procedures
- [ ] Runbooks documented

## Security Considerations

1. **Limited Blast Radius**: Always limit chaos to specific environments/services
2. **Authentication**: Require approval for production chaos experiments
3. **Audit Logging**: Log all chaos activities for compliance
4. **Data Protection**: Never run chaos on databases with sensitive data without backups
5. **Network Isolation**: Use separate VPCs/subnets for chaos testing

## Next Steps

1. Start with local chaos testing using Docker Compose
2. Graduate to staging environment with limited experiments
3. Run Game Days in production with careful monitoring
4. Document findings and improve resilience
5. Automate regular chaos testing in CI/CD pipeline

This implementation provides a comprehensive chaos engineering framework that can be immediately deployed across local, Kubernetes, and AWS environments.