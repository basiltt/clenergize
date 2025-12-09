# Technology POC Implementation Plans - Clenergize V3 ESG Platform

**Version**: 1.0.0
**Last Updated**: November 22, 2025
**Status**: Implementation Ready
**Owner**: DevOps & Architecture Agents

---

## Table of Contents

1. [Introduction](#introduction)
2. [POC 1: Temporal Workflow Engine](#poc-1-temporal-workflow-engine)
3. [POC 2: InfluxDB Time-Series Database](#poc-2-influxdb-time-series-database)
4. [POC 3: Neo4j Graph Database](#poc-3-neo4j-graph-database)
5. [POC 4: ClickHouse OLAP Database](#poc-4-clickhouse-olap-database)
6. [POC 5: Apache Kafka Event Streaming](#poc-5-apache-kafka-event-streaming)
7. [POC Timeline & Resources](#poc-timeline--resources)
8. [Success Criteria Summary](#success-criteria-summary)

---

## Introduction

### Purpose

This document outlines Proof-of-Concept (POC) implementation plans for 5 critical technologies in the Clenergize V3 ESG Platform. Each POC validates technical feasibility, performance, and integration patterns before full-scale implementation.

### POC Objectives

```yaml
Goals:
  - Validate technology fit for use case
  - Measure performance under realistic load
  - Document integration patterns
  - Identify risks and mitigation strategies
  - Estimate infrastructure costs
  - Train development team

Non-Goals:
  - Production-ready implementation
  - Full feature set
  - Multi-region deployment
  - Complete security hardening
```

### POC Execution Principles

1. **Time-Boxed**: Each POC limited to 1-2 weeks
2. **Measurable**: Clear success criteria with quantitative metrics
3. **Representative**: Use realistic data volumes and access patterns
4. **Documented**: Capture learnings, gotchas, and best practices
5. **Disposable**: POC code may be discarded; learnings are permanent

---

## POC 1: Temporal Workflow Engine

### Overview

**Technology**: [Temporal](https://temporal.io/) - Durable workflow orchestration
**Use Case**: Workflow Service (Port 3009) - Business process automation, approvals, multi-step tasks
**Timeline**: Week 1-2 of Sprint 0.2
**Team**: DevOps Agent + Workflow Agent
**Priority**: HIGH (critical for Phase 2)

### Business Context

Temporal replaces manual state management for complex, long-running workflows:
- **Approval workflows**: Multi-level approvals with timeouts
- **Data collection workflows**: Orchestrate data ingestion from multiple sources
- **Report generation workflows**: Multi-step report assembly with retries
- **Target review workflows**: Quarterly target review processes

### Technical Scope

#### What We'll Build

```typescript
// POC Workflow: Multi-Step Report Generation

export async function generateESGReport(
  reportId: string,
  organizationId: string,
  period: { start: Date; end: Date }
): Promise<string> {

  // Step 1: Collect data from multiple services (parallel)
  const [emissions, water, waste] = await Promise.all([
    activities.queryEmissions({ organizationId, period }),
    activities.queryWater({ organizationId, period }),
    activities.queryWaste({ organizationId, period })
  ]);

  // Step 2: Run calculations (with retry)
  const calculations = await workflow.executeChild(calculateMetrics, {
    emissions,
    water,
    waste,
    retry: { maxAttempts: 3 }
  });

  // Step 3: Generate report document (activity with timeout)
  const reportUrl = await activities.generatePDF(
    calculations,
    { startToCloseTimeout: '5 minutes' }
  );

  // Step 4: Send notifications (saga pattern)
  try {
    await activities.sendNotifications(reportUrl);
  } catch (error) {
    await activities.compensateSendNotifications(); // Rollback
    throw error;
  }

  // Step 5: Archive report (long-term storage)
  await activities.archiveReport(reportUrl, {
    startToCloseTimeout: '10 minutes'
  });

  return reportUrl;
}
```

#### Infrastructure Setup

```yaml
# docker-compose.temporal.yml

version: '3.8'

services:
  temporal:
    image: temporalio/auto-setup:1.22.0
    ports:
      - "7233:7233"
    environment:
      - DB=postgresql
      - POSTGRES_SEEDS=postgresql
      - POSTGRES_USER=temporal
      - POSTGRES_PWD=temporal
    depends_on:
      - postgresql
      - elasticsearch

  temporal-ui:
    image: temporalio/ui:2.21.0
    ports:
      - "8088:8080"
    environment:
      - TEMPORAL_ADDRESS=temporal:7233

  postgresql:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: temporal
      POSTGRES_USER: temporal
    volumes:
      - temporal-postgres:/var/lib/postgresql/data

  elasticsearch:
    image: elasticsearch:7.17.10
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    volumes:
      - temporal-elasticsearch:/usr/share/elasticsearch/data

volumes:
  temporal-postgres:
  temporal-elasticsearch:
```

#### Integration Pattern

```typescript
// workflow-service/src/temporal/worker.ts

import { NestFactory } from '@nestjs/core';
import { Worker } from '@temporalio/worker';
import * as activities from './activities';
import { generateESGReport } from './workflows';

async function bootstrap() {
  // Create NestJS app context
  const app = await NestFactory.create(AppModule);
  await app.init();

  // Create Temporal worker
  const worker = await Worker.create({
    workflowsPath: require.resolve('./workflows'),
    activities,
    taskQueue: 'workflow-service',
    namespace: 'clenergize',

    // Connection
    connection: {
      address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
    },

    // Worker tuning
    maxConcurrentActivityExecutions: 100,
    maxConcurrentWorkflowTaskExecutions: 100,
  });

  // Start worker
  await worker.run();
}

bootstrap();
```

### POC Test Scenarios

#### Scenario 1: Happy Path
- **Input**: Valid report request
- **Expected**: Report generated in <30 seconds
- **Validation**: All steps complete, notifications sent, report archived

#### Scenario 2: Retry with Transient Failure
- **Input**: Report request with simulated API timeout
- **Expected**: Workflow retries failed activity, completes successfully
- **Validation**: Max 3 retries, exponential backoff, eventual success

#### Scenario 3: Compensation (Saga Pattern)
- **Input**: Report request with notification failure
- **Expected**: Workflow rolls back partial state
- **Validation**: Compensation activities executed, workflow marked as failed

#### Scenario 4: Long-Running Workflow
- **Input**: Approval workflow with 3-day timeout
- **Expected**: Workflow waits for human approval signal
- **Validation**: Workflow state persisted, resumes after signal

#### Scenario 5: Concurrent Workflows
- **Input**: 100 simultaneous report requests
- **Expected**: All workflows complete without errors
- **Validation**: Worker scales to handle concurrency, no resource exhaustion

### Performance Targets

```yaml
Workflow Execution:
  Start Latency: <100ms
  Activity Execution: <5s (p95)
  Workflow Completion: <30s (simple), <5min (complex)
  Throughput: 1,000 workflow starts/sec

Worker Performance:
  CPU Usage: <70% under load
  Memory Usage: <2GB per worker
  Concurrent Workflows: 1,000+
  Concurrent Activities: 10,000+

Persistence:
  Workflow History Size: <1MB per workflow
  Query Latency: <50ms
  Event Replay Time: <1s per 10,000 events
```

### Success Criteria

- [ ] **Functionality**: All 5 test scenarios pass
- [ ] **Performance**: Meets latency/throughput targets
- [ ] **Reliability**: 99.9% workflow completion rate (with retries)
- [ ] **Observability**: Temporal UI shows workflow state, history, stack traces
- [ ] **Integration**: NestJS activities access database, external APIs
- [ ] **Saga Pattern**: Compensation activities execute on failure
- [ ] **Documentation**: Architecture diagram, integration guide, runbook

### Cost Estimate

```yaml
Infrastructure (Temporal Cloud):
  Development: $50/month (included in free tier)
  Production: $200/month (10K workflow executions, 100K activity executions)

Self-Hosted (AWS):
  PostgreSQL (db.t3.medium): $60/month
  Elasticsearch (t3.medium.search): $80/month
  Temporal Server (t3.medium): $60/month
  Total: $200/month

Development Effort:
  POC Implementation: 40 hours (1 week, 1 developer)
  Production Hardening: 80 hours (post-POC)
```

### Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Steep learning curve | Schedule delay | Medium | Training sessions, pair programming |
| Temporal Cloud cost | Budget overrun | Low | Start self-hosted, migrate if needed |
| Activity timeout issues | Workflow failures | Medium | Comprehensive timeout configuration, monitoring |
| Version compatibility | Breaking changes | Low | Pin Temporal versions, test upgrades |
| PostgreSQL bottleneck | Performance degradation | Low | Use AWS RDS, enable read replicas |

### Go/No-Go Decision Criteria

**Go** if:
- ✅ All 5 test scenarios pass
- ✅ Performance targets met
- ✅ Team comfortable with Temporal concepts
- ✅ Cost within budget ($200/month)

**No-Go** (fallback to custom state machine):
- ❌ >30% of workflows fail
- ❌ Latency >5x targets
- ❌ Team struggles with Temporal concepts after training
- ❌ Cost >$500/month

---

## POC 2: InfluxDB Time-Series Database

### Overview

**Technology**: [InfluxDB 2.0](https://www.influxdata.com/) - Time-series database
**Use Case**: Activity Service (Port 3004) - IoT sensor data, real-time emissions tracking
**Timeline**: Week 3-4 of Sprint 0.2
**Team**: DevOps Agent + Activity Agent
**Priority**: MEDIUM (critical for Phase 3 IoT integration)

### Business Context

InfluxDB stores high-frequency sensor data:
- **Energy meters**: kWh consumption every 15 minutes
- **Water meters**: Flow rate every 5 minutes
- **Environmental sensors**: Temperature, humidity, CO2 every 1 minute
- **Use Case**: 1,000 facilities × 10 sensors × 60 readings/hour = 600K data points/hour

### Technical Scope

#### What We'll Build

```python
# influxdb-poc/ingest_sensor_data.py

from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS
from datetime import datetime

# Configuration
url = "http://localhost:8086"
token = "my-super-secret-token"
org = "clenergize"
bucket = "esg_timeseries"

# Client
client = InfluxDBClient(url=url, token=token, org=org)
write_api = client.write_api(write_options=SYNCHRONOUS)

# Write sensor data (Line Protocol)
def write_energy_meter_data(sensor_id, facility_id, org_id, consumption, voltage, current):
    point = Point("energy") \
        .tag("sensor_id", sensor_id) \
        .tag("facility_id", facility_id) \
        .tag("org_id", org_id) \
        .field("consumption", consumption) \
        .field("voltage", voltage) \
        .field("current", current) \
        .field("power_factor", 0.98) \
        .time(datetime.utcnow(), WritePrecision.NS)

    write_api.write(bucket=bucket, record=point)

# Query data (Flux)
def query_energy_consumption(facility_id, start, end):
    query = f'''
    from(bucket: "{bucket}")
        |> range(start: {start}, stop: {end})
        |> filter(fn: (r) => r["_measurement"] == "energy")
        |> filter(fn: (r) => r["facility_id"] == "{facility_id}")
        |> filter(fn: (r) => r["_field"] == "consumption")
        |> aggregateWindow(every: 1h, fn: mean)
    '''

    query_api = client.query_api()
    result = query_api.query(query=query)

    # Process results
    for table in result:
        for record in table.records:
            print(f"{record.get_time()}: {record.get_value()} kWh")

# Downsampling Task (Flux)
downsample_task = '''
from(bucket: "esg_timeseries")
    |> range(start: -90d)
    |> filter(fn: (r) => r["_measurement"] == "energy")
    |> aggregateWindow(every: 1h, fn: mean)
    |> to(bucket: "esg_timeseries_hourly", org: "clenergize")
'''

# Create task
from influxdb_client.client.tasks_api import TasksApi
tasks_api = client.tasks_api()
tasks_api.create_task(name="downsample_energy_hourly", flux=downsample_task, every="1h")
```

#### Infrastructure Setup

```yaml
# docker-compose.influxdb.yml

version: '3.8'

services:
  influxdb:
    image: influxdb:2.7
    ports:
      - "8086:8086"
    environment:
      - DOCKER_INFLUXDB_INIT_MODE=setup
      - DOCKER_INFLUXDB_INIT_USERNAME=admin
      - DOCKER_INFLUXDB_INIT_PASSWORD=adminpassword
      - DOCKER_INFLUXDB_INIT_ORG=clenergize
      - DOCKER_INFLUXDB_INIT_BUCKET=esg_timeseries
      - DOCKER_INFLUXDB_INIT_RETENTION=90d
      - DOCKER_INFLUXDB_INIT_ADMIN_TOKEN=my-super-secret-token
    volumes:
      - influxdb-data:/var/lib/influxdb2
      - influxdb-config:/etc/influxdb2

  chronograf:
    image: chronograf:1.10
    ports:
      - "8888:8888"
    environment:
      - INFLUXDB_URL=http://influxdb:8086
    depends_on:
      - influxdb

volumes:
  influxdb-data:
  influxdb-config:
```

#### NestJS Integration

```typescript
// activity-service/src/influxdb/influxdb.service.ts

import { Injectable } from '@nestjs/common';
import { InfluxDB, Point } from '@influxdata/influxdb-client';

@Injectable()
export class InfluxDBService {
  private influxDB: InfluxDB;
  private writeApi;
  private queryApi;

  constructor() {
    this.influxDB = new InfluxDB({
      url: process.env.INFLUXDB_URL || 'http://localhost:8086',
      token: process.env.INFLUXDB_TOKEN
    });

    this.writeApi = this.influxDB.getWriteApi('clenergize', 'esg_timeseries');
    this.queryApi = this.influxDB.getQueryApi('clenergize');
  }

  async writeEnergyReading(data: {
    sensorId: string;
    facilityId: string;
    organizationId: string;
    consumption: number;
    voltage: number;
    current: number;
  }) {
    const point = new Point('energy')
      .tag('sensor_id', data.sensorId)
      .tag('facility_id', data.facilityId)
      .tag('org_id', data.organizationId)
      .floatField('consumption', data.consumption)
      .floatField('voltage', data.voltage)
      .floatField('current', data.current);

    this.writeApi.writePoint(point);
    await this.writeApi.flush();
  }

  async queryEnergyConsumption(
    facilityId: string,
    start: Date,
    end: Date
  ): Promise<any[]> {
    const query = `
      from(bucket: "esg_timeseries")
        |> range(start: ${start.toISOString()}, stop: ${end.toISOString()})
        |> filter(fn: (r) => r["_measurement"] == "energy")
        |> filter(fn: (r) => r["facility_id"] == "${facilityId}")
        |> filter(fn: (r) => r["_field"] == "consumption")
        |> aggregateWindow(every: 1h, fn: mean)
    `;

    const results = [];
    const queryResult = this.queryApi.queryRows(query, {
      next(row, tableMeta) {
        const o = tableMeta.toObject(row);
        results.push(o);
      },
      error(error) {
        console.error('Query error:', error);
      },
      complete() {
        console.log('Query complete');
      }
    });

    return results;
  }
}
```

### POC Test Scenarios

#### Scenario 1: High-Frequency Writes
- **Input**: 1M data points in 1 hour (278 points/sec)
- **Expected**: All points written with <100ms p95 latency
- **Validation**: No data loss, InfluxDB CPU <70%

#### Scenario 2: Real-Time Aggregation
- **Input**: Query last 24 hours, aggregate to hourly
- **Expected**: Query completes in <2 seconds
- **Validation**: Correct aggregated values, no missing hours

#### Scenario 3: Downsampling
- **Input**: 90 days of raw data (216M points)
- **Expected**: Downsample task creates hourly aggregates
- **Validation**: Hourly bucket has 2,160 points (90d × 24h), <5% size of raw data

#### Scenario 4: Multi-Tenant Isolation
- **Input**: Concurrent queries from 100 organizations
- **Expected**: Each query returns only that org's data
- **Validation**: No data leakage, tag-based filtering works

#### Scenario 5: Retention Policy
- **Input**: Data older than 90 days
- **Expected**: Data automatically deleted
- **Validation**: Disk usage stabilizes, old data purged

### Performance Targets

```yaml
Write Performance:
  Throughput: 1M points/sec (single node)
  Latency (p95): <100ms
  Batch Size: 5,000 points
  Compression Ratio: 10:1 (average)

Query Performance:
  Point Query (single value): <10ms
  Range Query (1 day, 1 sensor): <100ms
  Aggregation Query (30 days, 100 sensors): <2s
  Downsampling Task: <5 minutes for 90 days

Storage:
  Disk Usage: <100 GB for 90 days raw data (1,000 sensors)
  Hot Storage (90d): SSD
  Warm Storage (2y): HDD
  Cold Storage (5y): S3 (via Parquet export)
```

### Success Criteria

- [ ] **Write Throughput**: 1M points/sec sustained
- [ ] **Query Latency**: <2s for 30-day aggregation
- [ ] **Downsampling**: Automatic hourly/daily aggregates
- [ ] **Retention**: Auto-delete data >90 days
- [ ] **Compression**: 10:1 compression ratio
- [ ] **Multi-Tenancy**: Tag-based isolation works
- [ ] **Integration**: NestJS service reads/writes successfully

### Cost Estimate

```yaml
InfluxDB Cloud (Serverless):
  Development: Free tier (30-day retention, 5 MB writes/day)
  Production: $200/month (90-day retention, 100 GB storage, 10 GB writes/month)

Self-Hosted (AWS):
  EC2 (r6i.xlarge, 32 GB RAM): $250/month
  EBS (500 GB SSD): $50/month
  Total: $300/month

Development Effort:
  POC Implementation: 40 hours (1 week, 1 developer)
  Production Hardening: 60 hours (post-POC)
```

### Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Cardinality explosion | Query slowdown | Medium | Limit tag cardinality, monitor series count |
| Disk space exhaustion | Data loss | Low | Retention policies, monitoring, alerts |
| Query timeout | User frustration | Medium | Optimize Flux queries, use continuous aggregation |
| Learning curve (Flux) | Development delay | Medium | Training, query templates, documentation |
| InfluxDB version changes | Breaking changes | Low | Pin version, test upgrades in staging |

### Go/No-Go Decision Criteria

**Go** if:
- ✅ Write throughput >500K points/sec
- ✅ Query latency <5s for complex aggregations
- ✅ Downsampling reduces storage by >80%
- ✅ Cost <$300/month

**No-Go** (fallback to TimescaleDB):
- ❌ Write throughput <100K points/sec
- ❌ Query latency >10s
- ❌ Cost >$500/month
- ❌ Cardinality issues unresolvable

---

## POC 3: Neo4j Graph Database

### Overview

**Technology**: [Neo4j Aura](https://neo4j.com/cloud/aura/) - Graph database
**Use Case**: Supply chain traceability, organizational hierarchies, data lineage
**Timeline**: Week 1-2 of Sprint 0.3
**Team**: DevOps Agent + Organization Agent
**Priority**: MEDIUM (critical for Scope 3 supply chain tracking)

### Business Context

Neo4j models complex relationships:
- **Supply Chain**: 6+ tier traceability (org → suppliers → materials)
- **Organizational Hierarchy**: Multi-level rollups (corporate → BU → facility → dept)
- **Data Lineage**: Track report data back to source activities

### Technical Scope

#### What We'll Build

```cypher
// Create Supply Chain Graph

// Nodes
CREATE (org:Organization {
  id: "org-123",
  name: "Acme Corp",
  tier: 0,
  industry: "Manufacturing"
})

CREATE (supplier1:Supplier {
  id: "supplier-456",
  name: "Parts Inc",
  tier: 1,
  country: "US",
  risk_rating: "LOW"
})

CREATE (supplier2:Supplier {
  id: "supplier-789",
  name: "Raw Materials Ltd",
  tier: 2,
  country: "CN",
  risk_rating: "MEDIUM"
})

CREATE (product:Product {
  id: "product-001",
  name: "Widget A",
  category: "Electronics",
  carbon_footprint: 15.5
})

CREATE (material:Material {
  id: "material-lithium",
  name: "Lithium",
  critical_mineral: true,
  extraction_emissions: 12.3
})

// Relationships
CREATE (org)-[:PURCHASES {volume: 10000, currency: "USD", contract_date: date("2025-01-01")}]->(product)
CREATE (supplier1)-[:SUPPLIES {lead_time: 14, reliability: 0.95}]->(product)
CREATE (product)-[:CONTAINS {quantity: 0.5, unit: "kg"}]->(material)
CREATE (supplier2)-[:EXTRACTS {method: "Open-pit mining"}]->(material)
CREATE (supplier1)-[:SOURCES_FROM]->(supplier2)

// Indexes
CREATE INDEX org_id FOR (o:Organization) ON (o.id);
CREATE INDEX supplier_tier FOR (s:Supplier) ON (s.tier);
CREATE INDEX product_id FOR (p:Product) ON (p.id);
CREATE INDEX material_critical FOR (m:Material) ON (m.critical_mineral);
```

#### Query Patterns

```cypher
// 1. Supply Chain Traceability (6-hop traversal)
MATCH path = (org:Organization {id: "org-123"})-[:PURCHASES|SUPPLIES|CONTAINS|EXTRACTS*1..6]->(end)
RETURN path, length(path) as hops
ORDER BY hops DESC
LIMIT 100;

// 2. Critical Minerals in Supply Chain
MATCH (org:Organization {id: "org-123"})-[:PURCHASES*1..6]->(material:Material {critical_mineral: true})
RETURN DISTINCT material.name, material.extraction_emissions;

// 3. Supplier Risk Assessment
MATCH (org:Organization {id: "org-123"})-[:PURCHASES]->(product)-[:SUPPLIES*1..3]-(supplier:Supplier)
WHERE supplier.risk_rating IN ['HIGH', 'MEDIUM']
RETURN supplier.name, supplier.country, supplier.risk_rating, count(product) as product_count
ORDER BY product_count DESC;

// 4. Organizational Hierarchy Rollup
MATCH (parent:HierarchyNode {id: "corporate"})-[:PARENT_OF*]->(child:HierarchyNode)
RETURN child.name, child.type, sum(child.emissions) AS total_emissions
ORDER BY total_emissions DESC;

// 5. Data Lineage (Report Traceability)
MATCH path = (report:Report {id: "rep-2025-Q1"})<-[:INCLUDED_IN*]-(source)
RETURN path, [node in nodes(path) | node.id] as lineage;

// 6. Shortest Path Between Entities
MATCH path = shortestPath(
  (org:Organization {id: "org-123"})-[*..10]-(material:Material {name: "Lithium"})
)
RETURN path, length(path) as distance;
```

#### NestJS Integration

```typescript
// organization-service/src/neo4j/neo4j.service.ts

import { Injectable } from '@nestjs/common';
import neo4j, { Driver, Session } from 'neo4j-driver';

@Injectable()
export class Neo4jService {
  private driver: Driver;

  constructor() {
    this.driver = neo4j.driver(
      process.env.NEO4J_URI || 'neo4j://localhost:7687',
      neo4j.auth.basic(
        process.env.NEO4J_USER || 'neo4j',
        process.env.NEO4J_PASSWORD || 'password'
      )
    );
  }

  async createHierarchyNode(data: {
    id: string;
    name: string;
    type: string;
    level: number;
    parentId?: string;
  }): Promise<void> {
    const session = this.driver.session();
    try {
      const query = `
        CREATE (n:HierarchyNode {
          id: $id,
          name: $name,
          type: $type,
          level: $level
        })
        ${data.parentId ? `
        WITH n
        MATCH (parent:HierarchyNode {id: $parentId})
        CREATE (parent)-[:PARENT_OF]->(n)
        ` : ''}
        RETURN n
      `;

      await session.run(query, data);
    } finally {
      await session.close();
    }
  }

  async getHierarchyRollup(nodeId: string): Promise<any[]> {
    const session = this.driver.session();
    try {
      const query = `
        MATCH (parent:HierarchyNode {id: $nodeId})-[:PARENT_OF*]->(child:HierarchyNode)
        RETURN child.id AS id, child.name AS name, child.emissions AS emissions
      `;

      const result = await session.run(query, { nodeId });
      return result.records.map(record => ({
        id: record.get('id'),
        name: record.get('name'),
        emissions: record.get('emissions')
      }));
    } finally {
      await session.close();
    }
  }

  async getSupplyChainTraceability(organizationId: string, maxHops: number = 6): Promise<any> {
    const session = this.driver.session();
    try {
      const query = `
        MATCH path = (org:Organization {id: $organizationId})-[*1..${maxHops}]->(end)
        RETURN path, length(path) as hops
        ORDER BY hops DESC
        LIMIT 100
      `;

      const result = await session.run(query, { organizationId });

      return result.records.map(record => ({
        path: record.get('path'),
        hops: record.get('hops').toNumber()
      }));
    } finally {
      await session.close();
    }
  }

  async onModuleDestroy() {
    await this.driver.close();
  }
}
```

### POC Test Scenarios

#### Scenario 1: Supply Chain Depth
- **Input**: Organization with 6-tier supply chain
- **Expected**: Query returns all 6 tiers in <100ms
- **Validation**: Correct path, no missing nodes

#### Scenario 2: Large Graph Traversal
- **Input**: 10,000 suppliers, 50,000 products, 100,000 relationships
- **Expected**: Traceability query completes in <500ms
- **Validation**: Memory usage <4GB, no timeouts

#### Scenario 3: Hierarchy Rollup
- **Input**: Corporate node with 1,000 child facilities
- **Expected**: Aggregation query completes in <200ms
- **Validation**: Correct sum of child emissions

#### Scenario 4: Shortest Path
- **Input**: Find path from Organization to Material (unknown distance)
- **Expected**: Query returns shortest path in <100ms
- **Validation**: Correct path, optimal distance

#### Scenario 5: Write Performance
- **Input**: Bulk create 10,000 nodes + 50,000 relationships
- **Expected**: Completes in <30 seconds
- **Validation**: All nodes/relationships created, no duplicates

### Performance Targets

```yaml
Query Performance:
  Simple Path (1-3 hops): <50ms
  Complex Path (4-6 hops): <200ms
  Aggregation (1,000 nodes): <500ms
  Shortest Path: <100ms

Graph Size:
  Nodes: 100,000+
  Relationships: 500,000+
  Properties: 10+ per node/relationship

Write Performance:
  Single Node: <10ms
  Bulk Create (10K nodes): <30s
  Relationship Creation: <5ms

Memory:
  Graph DB Size: <10 GB
  Query Execution: <4 GB RAM
```

### Success Criteria

- [ ] **Graph Traversal**: 6-hop query <200ms
- [ ] **Aggregation**: 1,000-node rollup <500ms
- [ ] **Write Performance**: 10K nodes in <30s
- [ ] **Integration**: NestJS service performs CRUD operations
- [ ] **Visualization**: Neo4j Bloom shows graph relationships
- [ ] **Scalability**: Handles 100K nodes, 500K relationships
- [ ] **Documentation**: Cypher query cookbook, data model diagram

### Cost Estimate

```yaml
Neo4j Aura (Cloud):
  Development: Free tier (50K nodes, 175K relationships)
  Production: $65/month (AuraDB Professional, 2 GB RAM, 16 GB storage)

Self-Hosted (AWS):
  EC2 (t3.large, 8 GB RAM): $70/month
  EBS (100 GB SSD): $10/month
  Total: $80/month

Development Effort:
  POC Implementation: 40 hours (1 week, 1 developer)
  Production Hardening: 60 hours (post-POC)
```

### Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Cypher learning curve | Development delay | Medium | Training, query examples, Neo4j docs |
| Graph size exceeds RAM | Performance degradation | Low | Use Neo4j pagination, offload to disk |
| Complex queries timeout | User frustration | Medium | Query optimization, indexes, profiling |
| Cost escalation | Budget overrun | Low | Monitor usage, set budget alerts |
| Data model evolution | Refactoring effort | Medium | Design extensible schema upfront |

### Go/No-Go Decision Criteria

**Go** if:
- ✅ 6-hop traversal <500ms
- ✅ Handles 100K nodes without issues
- ✅ Team comfortable with Cypher
- ✅ Cost <$100/month

**No-Go** (fallback to PostgreSQL with recursive CTEs):
- ❌ Query latency >2s for common queries
- ❌ Memory usage >8 GB for expected data size
- ❌ Cost >$200/month

---

## POC 4: ClickHouse OLAP Database

### Overview

**Technology**: [ClickHouse](https://clickhouse.com/) - Columnar OLAP database
**Use Case**: Analytics Service (Port 3045) - Dashboard analytics, historical trend analysis
**Timeline**: Week 3-4 of Sprint 0.3
**Team**: DevOps Agent + Analytics Agent
**Priority**: HIGH (critical for Phase 6 Analytics)

### Business Context

ClickHouse powers real-time analytics dashboards:
- **500+ KPIs** across Environmental, Social, Governance domains
- **Billions of rows**: 5 years of historical ESG metrics
- **Sub-2-second queries**: Executive dashboards must load in <2s
- **Use Case**: 1,000 organizations × 10 projects × 365 days × 100 metrics = 365M rows/year

### Technical Scope

#### What We'll Build

```sql
-- ClickHouse Schema

-- Fact Table: ESG Metrics
CREATE TABLE esg_metrics_fact ON CLUSTER '{cluster}' (
    -- Dimensions
    organization_id UUID,
    project_id UUID,
    hierarchy_node_id UUID,

    date Date,
    timestamp DateTime,

    -- Metric Categorization
    domain String, -- 'ENVIRONMENTAL', 'SOCIAL', 'GOVERNANCE'
    category String, -- 'GHG_EMISSIONS', 'WATER', 'DIVERSITY', etc.
    subcategory String,
    metric_name String,

    -- Metric Value
    value Float64,
    unit String,

    -- Context
    scope String, -- For emissions: 'SCOPE_1', 'SCOPE_2', 'SCOPE_3'
    source String, -- 'CALCULATED', 'IMPORTED', 'ESTIMATED'

    -- Geographic
    country String,
    region String,
    facility_id UUID,

    -- Data Quality
    accuracy String, -- 'HIGH', 'MEDIUM', 'LOW'
    verification_status String,

    -- Metadata
    created_at DateTime DEFAULT now()
)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/esg_metrics_fact', '{replica}')
PARTITION BY toYYYYMM(date)
ORDER BY (organization_id, project_id, date, category, metric_name)
TTL date + INTERVAL 5 YEAR
SETTINGS index_granularity = 8192;

-- Materialized View: Pre-Aggregated Metrics
CREATE MATERIALIZED VIEW esg_metrics_aggregated
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (organization_id, project_id, domain, category, date)
POPULATE AS
SELECT
    organization_id,
    project_id,
    domain,
    category,
    metric_name,
    date,
    toStartOfMonth(date) AS month,
    toStartOfQuarter(date) AS quarter,
    toYear(date) AS year,

    -- Aggregations
    sum(value) AS total_value,
    avg(value) AS avg_value,
    min(value) AS min_value,
    max(value) AS max_value,
    count(*) AS record_count,

    -- Data Quality
    countIf(accuracy = 'HIGH') AS high_accuracy_count,
    countIf(verification_status = 'VERIFIED') AS verified_count
FROM esg_metrics_fact
GROUP BY
    organization_id,
    project_id,
    domain,
    category,
    metric_name,
    date,
    month,
    quarter,
    year;
```

#### Query Patterns

```sql
-- 1. Dashboard KPI: Total Emissions by Scope (YTD)
SELECT
    scope,
    sum(value) AS total_emissions,
    avg(value) AS avg_emissions,
    count(*) AS data_points
FROM esg_metrics_fact
WHERE
    organization_id = 'org-123'
    AND category = 'GHG_EMISSIONS'
    AND date >= toStartOfYear(today())
    AND date <= today()
GROUP BY scope
ORDER BY total_emissions DESC;

-- 2. Trend Analysis: Monthly Emissions (Last 12 Months)
SELECT
    toStartOfMonth(date) AS month,
    sum(value) AS monthly_emissions
FROM esg_metrics_fact
WHERE
    organization_id = 'org-123'
    AND category = 'GHG_EMISSIONS'
    AND date >= subtractMonths(today(), 12)
GROUP BY month
ORDER BY month ASC;

-- 3. Multi-Dimensional Breakdown: Emissions by Facility & Category
SELECT
    facility_id,
    category,
    subcategory,
    sum(value) AS total_emissions,
    avg(value) AS avg_emissions
FROM esg_metrics_fact
WHERE
    organization_id = 'org-123'
    AND domain = 'ENVIRONMENTAL'
    AND date >= toStartOfYear(today())
GROUP BY facility_id, category, subcategory
ORDER BY total_emissions DESC
LIMIT 100;

-- 4. Data Quality Report: Verification Status
SELECT
    verification_status,
    count(*) AS record_count,
    count(*) / (SELECT count(*) FROM esg_metrics_fact WHERE organization_id = 'org-123') AS percentage
FROM esg_metrics_fact
WHERE organization_id = 'org-123'
GROUP BY verification_status;

-- 5. Fast Dashboard Load (using Materialized View)
SELECT
    domain,
    category,
    total_value,
    avg_value,
    record_count
FROM esg_metrics_aggregated
WHERE
    organization_id = 'org-123'
    AND year = toYear(today())
ORDER BY total_value DESC;
```

#### NestJS Integration

```typescript
// analytics-service/src/clickhouse/clickhouse.service.ts

import { Injectable } from '@nestjs/common';
import { createClient, ClickHouseClient } from '@clickhouse/client';

@Injectable()
export class ClickHouseService {
  private client: ClickHouseClient;

  constructor() {
    this.client = createClient({
      host: process.env.CLICKHOUSE_HOST || 'http://localhost:8123',
      username: process.env.CLICKHOUSE_USER || 'default',
      password: process.env.CLICKHOUSE_PASSWORD || '',
      database: process.env.CLICKHOUSE_DATABASE || 'clenergize'
    });
  }

  async insertMetric(data: {
    organizationId: string;
    projectId: string;
    date: Date;
    domain: string;
    category: string;
    metricName: string;
    value: number;
    unit: string;
  }): Promise<void> {
    await this.client.insert({
      table: 'esg_metrics_fact',
      values: [{
        organization_id: data.organizationId,
        project_id: data.projectId,
        date: data.date.toISOString().split('T')[0],
        timestamp: data.date.toISOString(),
        domain: data.domain,
        category: data.category,
        metric_name: data.metricName,
        value: data.value,
        unit: data.unit,
        source: 'CALCULATED'
      }],
      format: 'JSONEachRow'
    });
  }

  async queryDashboardKPIs(organizationId: string): Promise<any[]> {
    const query = `
      SELECT
        domain,
        category,
        total_value,
        avg_value,
        record_count
      FROM esg_metrics_aggregated
      WHERE
        organization_id = {organizationId:UUID}
        AND year = toYear(today())
      ORDER BY total_value DESC
    `;

    const resultSet = await this.client.query({
      query,
      query_params: { organizationId },
      format: 'JSONEachRow'
    });

    return await resultSet.json();
  }

  async queryEmissionsTrend(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    const query = `
      SELECT
        toStartOfMonth(date) AS month,
        sum(value) AS monthly_emissions
      FROM esg_metrics_fact
      WHERE
        organization_id = {organizationId:UUID}
        AND category = 'GHG_EMISSIONS'
        AND date >= {startDate:Date}
        AND date <= {endDate:Date}
      GROUP BY month
      ORDER BY month ASC
    `;

    const resultSet = await this.client.query({
      query,
      query_params: {
        organizationId,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      },
      format: 'JSONEachRow'
    });

    return await resultSet.json();
  }
}
```

### POC Test Scenarios

#### Scenario 1: Fast Dashboard Load
- **Input**: Query 500 KPIs for 1 organization (using materialized view)
- **Expected**: Query completes in <2 seconds
- **Validation**: All KPIs returned, no timeout

#### Scenario 2: Billion-Row Query
- **Input**: Query 1 billion rows (5 years of data, 10 organizations)
- **Expected**: Aggregation query completes in <10 seconds
- **Validation**: Correct results, memory usage <8GB

#### Scenario 3: High-Cardinality Grouping
- **Input**: Group by 1,000 facilities × 100 metrics
- **Expected**: Query completes in <5 seconds
- **Validation**: 100K unique groups returned

#### Scenario 4: Write Throughput
- **Input**: Insert 1M rows in batch
- **Expected**: Completes in <10 seconds (100K rows/sec)
- **Validation**: All rows inserted, no duplicates

#### Scenario 5: Concurrent Queries
- **Input**: 100 simultaneous dashboard requests
- **Expected**: All queries complete in <5 seconds
- **Validation**: No query queue buildup, CPU <80%

### Performance Targets

```yaml
Query Performance:
  Dashboard Load (Materialized View): <2s (500 KPIs)
  Aggregation Query (1 year): <5s
  Trend Analysis (5 years): <10s
  Simple Filter Query: <500ms

Write Performance:
  Batch Insert: 1M rows/sec
  Real-Time Insert: 100K rows/sec
  Materialized View Refresh: <5s

Storage:
  Compression Ratio: 10:1 (average)
  Disk Usage: <500 GB for 5 years (365M rows/year × 5 years)
  Partition Pruning: 90% of queries scan <10% of data
```

### Success Criteria

- [ ] **Dashboard Load**: <2s for 500 KPIs
- [ ] **Billion-Row Query**: <10s
- [ ] **Write Throughput**: >500K rows/sec
- [ ] **Compression**: 10:1 ratio
- [ ] **Concurrent Queries**: 100 simultaneous queries without degradation
- [ ] **Integration**: NestJS service reads/writes successfully
- [ ] **Materialized Views**: Auto-refresh on insert

### Cost Estimate

```yaml
ClickHouse Cloud:
  Development: $50/month (100 GB storage, 10 GB compute)
  Production: $300/month (500 GB storage, 50 GB compute, auto-scaling)

Self-Hosted (AWS):
  EC2 (r6i.2xlarge, 64 GB RAM): $500/month
  EBS (1 TB SSD): $100/month
  Total: $600/month

Development Effort:
  POC Implementation: 60 hours (1.5 weeks, 1 developer)
  Production Hardening: 100 hours (post-POC)
```

### Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Query optimization challenges | Slow dashboards | Medium | Materialized views, partition pruning, indexes |
| Memory exhaustion | Query failures | Low | Increase RAM, optimize queries, use LIMIT |
| Learning curve (ClickHouse SQL) | Development delay | Medium | Training, query examples, documentation |
| Cost escalation | Budget overrun | Medium | Monitor usage, optimize queries, auto-scaling limits |
| Data skew (hot partitions) | Uneven load | Low | Partition strategy, distributed tables |

### Go/No-Go Decision Criteria

**Go** if:
- ✅ Dashboard load <5s (acceptable even if not <2s)
- ✅ Billion-row query <30s
- ✅ Write throughput >100K rows/sec
- ✅ Cost <$400/month

**No-Go** (fallback to PostgreSQL with TimescaleDB):
- ❌ Dashboard load >10s
- ❌ Query timeouts on moderate data volumes
- ❌ Cost >$800/month

---

## POC 5: Apache Kafka Event Streaming

### Overview

**Technology**: [Apache Kafka](https://kafka.apache.org/) - Distributed event streaming platform
**Use Case**: Event-driven architecture for all 50 microservices
**Timeline**: Week 1-2 of Sprint 0.4
**Team**: DevOps Agent + Architecture Agent
**Priority**: HIGH (foundational for event-driven architecture)

### Business Context

Kafka enables asynchronous, event-driven communication:
- **Inter-service events**: User created, project updated, calculation completed
- **Event sourcing**: Audit trail, replay capability, time travel
- **Real-time data pipelines**: Activity data → Calculation → Reporting
- **Use Case**: 50 services × 10 event types × 1,000 events/day = 500K events/day

### Technical Scope

#### What We'll Build

**Infrastructure Setup**:

```yaml
# docker-compose.kafka.yml

version: '3.8'

services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    volumes:
      - zookeeper-data:/var/lib/zookeeper/data
      - zookeeper-logs:/var/lib/zookeeper/log

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
      - "9093:9093"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181

      # Listeners
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:29092,PLAINTEXT_HOST://localhost:9092
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT

      # Replication
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1

      # Performance
      KAFKA_NUM_PARTITIONS: 3
      KAFKA_DEFAULT_REPLICATION_FACTOR: 1
      KAFKA_LOG_RETENTION_HOURS: 168  # 7 days
    volumes:
      - kafka-data:/var/lib/kafka/data

  kafka-ui:
    image: provectuslabs/kafka-ui:latest
    ports:
      - "8080:8080"
    environment:
      KAFKA_CLUSTERS_0_NAME: local
      KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS: kafka:29092
      KAFKA_CLUSTERS_0_ZOOKEEPER: zookeeper:2181
    depends_on:
      - kafka

volumes:
  zookeeper-data:
  zookeeper-logs:
  kafka-data:
```

**Event Schema (Avro)**:

```json
{
  "type": "record",
  "name": "UserCreatedEvent",
  "namespace": "com.clenergize.events.identity",
  "fields": [
    {
      "name": "id",
      "type": "string",
      "doc": "Event UUID"
    },
    {
      "name": "type",
      "type": "string",
      "default": "identity.user.created.v1"
    },
    {
      "name": "version",
      "type": "int",
      "default": 1
    },
    {
      "name": "correlationId",
      "type": "string"
    },
    {
      "name": "causationId",
      "type": ["null", "string"],
      "default": null
    },
    {
      "name": "metadata",
      "type": {
        "type": "record",
        "name": "EventMetadata",
        "fields": [
          {"name": "timestamp", "type": "long"},
          {"name": "service", "type": "string"},
          {"name": "userId", "type": ["null", "string"], "default": null},
          {"name": "organizationId", "type": ["null", "string"], "default": null}
        ]
      }
    },
    {
      "name": "data",
      "type": {
        "type": "record",
        "name": "UserData",
        "fields": [
          {"name": "userId", "type": "string"},
          {"name": "email", "type": "string"},
          {"name": "firstName", "type": "string"},
          {"name": "lastName", "type": "string"},
          {"name": "role", "type": "string"}
        ]
      }
    }
  ]
}
```

**NestJS Producer**:

```typescript
// identity-service/src/kafka/kafka.producer.ts

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'identity-service',
      brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
      retry: {
        retries: 5,
        initialRetryTime: 100,
        maxRetryTime: 30000
      }
    });

    this.producer = this.kafka.producer({
      allowAutoTopicCreation: false,
      transactionalId: 'identity-service-producer',
      maxInFlightRequests: 5,
      idempotent: true
    });
  }

  async onModuleInit() {
    await this.producer.connect();
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  async publishUserCreated(data: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  }, correlationId?: string): Promise<void> {
    const event = {
      id: uuidv4(),
      type: 'identity.user.created.v1',
      version: 1,
      correlationId: correlationId || uuidv4(),
      causationId: null,
      metadata: {
        timestamp: Date.now(),
        service: 'identity-service',
        userId: data.userId,
        organizationId: null
      },
      data
    };

    await this.producer.send({
      topic: 'identity.user.created.v1',
      messages: [{
        key: data.userId,
        value: JSON.stringify(event),
        headers: {
          'correlation-id': event.correlationId,
          'event-type': event.type
        }
      }],
      acks: -1, // Wait for all in-sync replicas
      timeout: 30000
    });
  }
}
```

**NestJS Consumer**:

```typescript
// organization-service/src/kafka/kafka.consumer.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';

@Injectable()
export class KafkaConsumerService implements OnModuleInit {
  private kafka: Kafka;
  private consumer: Consumer;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'organization-service',
      brokers: [process.env.KAFKA_BROKERS || 'localhost:9092']
    });

    this.consumer = this.kafka.consumer({
      groupId: 'organization-service-group',
      sessionTimeout: 30000,
      heartbeatInterval: 3000
    });
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topics: ['identity.user.created.v1'],
      fromBeginning: false
    });

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
        try {
          const event = JSON.parse(message.value.toString());
          await this.handleUserCreated(event);
        } catch (error) {
          console.error('Error processing message:', error);
          // Send to dead-letter queue
        }
      }
    });
  }

  private async handleUserCreated(event: any): Promise<void> {
    console.log('User created:', event.data.userId, event.data.email);

    // Cache user data locally
    await this.cacheService.set(
      `user:${event.data.userId}`,
      event.data,
      { ttl: 3600 }
    );
  }
}
```

### POC Test Scenarios

#### Scenario 1: Basic Pub/Sub
- **Input**: Identity Service publishes `user.created` event
- **Expected**: Organization Service consumes event in <1 second
- **Validation**: Event received, data matches, no errors

#### Scenario 2: High Throughput
- **Input**: Publish 10,000 events/sec for 1 minute (600K events)
- **Expected**: All events delivered, no message loss
- **Validation**: Consumer processes all events, lag <10 seconds

#### Scenario 3: Consumer Group Scaling
- **Input**: 3 consumers in same group, 1,000 events published
- **Expected**: Events distributed across consumers (load balancing)
- **Validation**: Each consumer processes ~333 events, no duplicates

#### Scenario 4: Exactly-Once Semantics
- **Input**: Publish same event twice (idempotency test)
- **Expected**: Consumer processes event once
- **Validation**: Idempotent consumer, deduplication works

#### Scenario 5: Dead-Letter Queue
- **Input**: Publish event that causes consumer error
- **Expected**: Event sent to DLQ after max retries
- **Validation**: DLQ contains failed event, consumer continues

### Performance Targets

```yaml
Throughput:
  Producer: 100K messages/sec (single broker)
  Consumer: 100K messages/sec (single consumer)
  End-to-End Latency (p95): <100ms

Reliability:
  Message Delivery: Exactly-once (with transactions)
  Message Retention: 7 days (configurable)
  Replication Factor: 3 (production)
  Availability: 99.95%

Scalability:
  Topics: 1,000+
  Partitions: 10,000+
  Consumers: 10,000+
  Message Size: <1 MB (typical: 1-10 KB)
```

### Success Criteria

- [ ] **Pub/Sub**: Events delivered in <1s
- [ ] **Throughput**: >50K messages/sec
- [ ] **Exactly-Once**: No duplicate processing
- [ ] **Consumer Groups**: Load balancing works
- [ ] **DLQ**: Failed events captured
- [ ] **Integration**: NestJS producer/consumer working
- [ ] **Monitoring**: Kafka UI shows topics, lag, throughput

### Cost Estimate

```yaml
Confluent Cloud (Managed Kafka):
  Development: $200/month (100 GB storage, 10 MBps)
  Production: $1,000/month (500 GB storage, 50 MBps, 3 brokers)

AWS MSK (Managed Kafka):
  Development: $150/month (kafka.t3.small, 2 brokers)
  Production: $500/month (kafka.m5.large, 3 brokers, 1 TB storage)

Self-Hosted (AWS):
  EC2 (m5.large, 3 brokers): $300/month
  EBS (500 GB per broker): $150/month
  Total: $450/month

Development Effort:
  POC Implementation: 60 hours (1.5 weeks, 1 developer)
  Production Hardening: 120 hours (post-POC)
```

### Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Message loss | Data inconsistency | Low | Replication (3x), acks=-1, producer retries |
| Consumer lag | Delayed processing | Medium | Scale consumers, optimize processing, monitoring |
| Topic sprawl | Management complexity | Medium | Naming conventions, topic governance, documentation |
| Schema evolution | Breaking changes | Medium | Avro schema registry, versioning, compatibility checks |
| Operational complexity | Downtime | Medium | Managed service (MSK/Confluent), monitoring, runbooks |

### Go/No-Go Decision Criteria

**Go** if:
- ✅ Throughput >20K messages/sec (acceptable for Phase 1)
- ✅ End-to-end latency <5s
- ✅ Exactly-once semantics working
- ✅ Cost <$600/month

**No-Go** (fallback to Redis Pub/Sub or AWS EventBridge):
- ❌ Throughput <5K messages/sec
- ❌ Message loss >0.1%
- ❌ Cost >$1,500/month
- ❌ Operational complexity unmanageable

---

## POC Timeline & Resources

### Execution Schedule

```yaml
Sprint 0.2 (Weeks 1-4):
  Week 1-2: POC 1 - Temporal Workflow Engine
    - Owner: DevOps Agent + Workflow Agent
    - Deliverables: Working workflows, NestJS integration, documentation

  Week 3-4: POC 2 - InfluxDB Time-Series Database
    - Owner: DevOps Agent + Activity Agent
    - Deliverables: IoT data ingestion, downsampling, NestJS integration

Sprint 0.3 (Weeks 5-8):
  Week 1-2: POC 3 - Neo4j Graph Database
    - Owner: DevOps Agent + Organization Agent
    - Deliverables: Supply chain graph, Cypher queries, NestJS integration

  Week 3-4: POC 4 - ClickHouse OLAP Database
    - Owner: DevOps Agent + Analytics Agent
    - Deliverables: Dashboard queries, materialized views, NestJS integration

Sprint 0.4 (Weeks 9-10):
  Week 1-2: POC 5 - Apache Kafka Event Streaming
    - Owner: DevOps Agent + Architecture Agent
    - Deliverables: Event producer/consumer, schema registry, monitoring
```

### Resource Allocation

```yaml
Personnel:
  DevOps Agent: 80 hours (16 hours/week × 5 POCs)
  Workflow Agent: 40 hours (POC 1)
  Activity Agent: 40 hours (POC 2)
  Organization Agent: 40 hours (POC 3)
  Analytics Agent: 60 hours (POC 4)
  Architecture Agent: 60 hours (POC 5)
  Total: 320 hours

Infrastructure:
  AWS Credits: $500 (for all POCs)
  Managed Services (trial): $0 (use free tiers)
  Total: $500
```

### Success Metrics Rollup

| POC | Go/No-Go Threshold | Final Decision | Fallback Technology |
|-----|-------------------|----------------|---------------------|
| **Temporal** | >80% scenarios pass, <$300/mo | TBD | Custom state machine |
| **InfluxDB** | >500K pts/sec write, <$400/mo | TBD | TimescaleDB |
| **Neo4j** | <500ms 6-hop query, <$150/mo | TBD | PostgreSQL recursive CTEs |
| **ClickHouse** | <5s dashboard load, <$500/mo | TBD | PostgreSQL + TimescaleDB |
| **Kafka** | >20K msgs/sec, <$600/mo | TBD | Redis Pub/Sub or EventBridge |

---

## Success Criteria Summary

### Quantitative Metrics

```yaml
Temporal:
  Workflow Execution: <30s (simple), <5min (complex)
  Throughput: >500 workflow starts/sec
  Reliability: 99.9% completion rate

InfluxDB:
  Write Throughput: >500K points/sec
  Query Latency: <2s (30-day aggregation)
  Compression: 10:1 ratio

Neo4j:
  Graph Traversal: <200ms (6 hops)
  Aggregation: <500ms (1,000 nodes)
  Write: 10K nodes in <30s

ClickHouse:
  Dashboard Load: <2s (500 KPIs)
  Billion-Row Query: <10s
  Write: >500K rows/sec

Kafka:
  Throughput: >50K messages/sec
  Latency: <100ms (p95)
  Reliability: Exactly-once delivery
```

### Qualitative Criteria

- [ ] **Team Confidence**: Development team comfortable with technology after training
- [ ] **Documentation Quality**: Architecture diagrams, integration guides, runbooks
- [ ] **Operational Readiness**: Monitoring, alerting, backup/restore procedures
- [ ] **Cost Predictability**: Understood cost model, no surprises
- [ ] **Integration Maturity**: Smooth integration with NestJS, TypeScript ecosystem

---

**End of POC Plans Document**

**Next Steps**:
1. Review POC plans with Architecture Agent
2. Allocate AWS credits for POC infrastructure
3. Schedule team training sessions for each technology
4. Execute POCs in sequence (Sprints 0.2-0.4)
5. Document Go/No-Go decisions in [Docs/04-Development/03-POC/02_POC_Decision_Log.md](02_POC_Decision_Log.md)
