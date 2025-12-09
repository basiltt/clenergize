# MongoDB Query Optimization Strategy

**Document Version**: 1.0.0
**Last Updated**: November 18, 2025
**Status**: Design Phase - Week 3-4
**Author**: Architecture Team

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Query Performance Goals](#query-performance-goals)
3. [Index Strategy](#index-strategy)
4. [Query Pattern Analysis](#query-pattern-analysis)
5. [Aggregation Pipeline Optimization](#aggregation-pipeline-optimization)
6. [Connection Pooling Strategy](#connection-pooling-strategy)
7. [Read/Write Concerns](#readwrite-concerns)
8. [Query Plan Analysis](#query-plan-analysis)
9. [Slow Query Monitoring](#slow-query-monitoring)
10. [Sharding Strategy](#sharding-strategy)
11. [Query Best Practices](#query-best-practices)
12. [Performance Testing](#performance-testing)

---

## 1. Executive Summary

### Purpose

This document defines the MongoDB query optimization strategy for Clenergize V3, ensuring:
- **Sub-200ms p95 response times** for all queries
- **Efficient index usage** across all 37 collections
- **Scalability** to handle 10,000+ concurrent users
- **Cost optimization** through reduced database load

### OLD System Performance Issues

| Metric | OLD System | NEW System Target | Improvement |
|--------|-----------|-------------------|-------------|
| **p50 Query Time** | 450ms | <50ms | 89% faster |
| **p95 Query Time** | 2,100ms | <200ms | 90% faster |
| **p99 Query Time** | 4,500ms | <500ms | 89% faster |
| **Full Table Scans** | 43% of queries | <5% of queries | 88% reduction |
| **Index Hit Rate** | 57% | >95% | 67% improvement |
| **Connection Pool Exhaustion** | Daily | Never | 100% elimination |
| **Slow Query Count** | 12,000/day | <100/day | 99% reduction |

### Key Problems Identified in OLD System

```typescript
// ❌ OLD SYSTEM ANTI-PATTERNS

// 1. No indexes on foreign keys
const projects = await db.collection('projects').find({
  organizationId: orgId // COLLSCAN! No index!
});

// 2. Fetching entire documents when only fields needed
const users = await db.collection('users').find({}).toArray(); // 50MB of data!

// 3. N+1 queries in loops
for (const project of projects) {
  // 1,000 queries for 1,000 projects!
  const activities = await db.collection('activities').find({
    projectId: project._id
  }).toArray();
}

// 4. No limit on queries
const auditLogs = await db.collection('audit_logs').find({}).toArray(); // 10M records!

// 5. Inefficient regex patterns
const users = await db.collection('users').find({
  email: { $regex: /.*@gmail.com/ } // No index usage!
});

// 6. No aggregation pipeline - client-side processing
const allData = await db.collection('activities').find({}).toArray();
const grouped = allData.reduce((acc, item) => { /* grouping logic */ }, {});
```

### NEW System Solutions

```typescript
// ✅ NEW SYSTEM OPTIMIZATIONS

// 1. Compound indexes on all query patterns
// Index: { organizationId: 1, status: 1, createdAt: -1 }
const projects = await this.projectModel
  .find({ organizationId: orgId, status: 'ACTIVE' })
  .sort({ createdAt: -1 })
  .limit(20)
  .select('name status createdAt') // Only needed fields
  .lean() // Skip Mongoose hydration
  .exec();

// 2. Aggregation with $lookup (single query)
const projectsWithActivities = await this.projectModel.aggregate([
  { $match: { organizationId: new Types.ObjectId(orgId) } },
  { $lookup: {
      from: 'activities',
      localField: '_id',
      foreignField: 'projectId',
      as: 'activities',
      pipeline: [
        { $limit: 10 },
        { $project: { name: 1, co2e: 1 } }
      ]
    }
  },
  { $limit: 20 }
]);

// 3. Efficient regex with index prefix
const users = await this.userModel
  .find({
    email: { $regex: /^user/, $options: 'i' } // Uses index!
  })
  .hint({ email: 1 }) // Force index usage
  .exec();

// 4. Aggregation pipeline for grouping
const emissionsByCategory = await this.activityModel.aggregate([
  { $match: {
      projectId: new Types.ObjectId(projectId),
      year: 2024
    }
  },
  { $group: {
      _id: '$category',
      totalCO2e: { $sum: '$co2e' },
      count: { $sum: 1 }
    }
  },
  { $sort: { totalCO2e: -1 } }
]);
```

---

## 2. Query Performance Goals

### Response Time Targets

```yaml
Read Operations:
  Point Queries (by ID):
    p50: <10ms
    p95: <25ms
    p99: <50ms

  Simple Queries (indexed fields):
    p50: <25ms
    p95: <75ms
    p99: <150ms

  Complex Queries (aggregations):
    p50: <100ms
    p95: <200ms
    p99: <500ms

  Report Queries (large aggregations):
    p50: <500ms
    p95: <2,000ms
    p99: <5,000ms

Write Operations:
  Single Document Insert:
    p50: <15ms
    p95: <50ms
    p99: <100ms

  Bulk Insert (100 docs):
    p50: <200ms
    p95: <500ms
    p99: <1,000ms

  Update Operations:
    p50: <20ms
    p95: <75ms
    p99: <150ms

Aggregation Pipelines:
  Simple Aggregation (1-2 stages):
    p50: <50ms
    p95: <150ms
    p99: <300ms

  Complex Aggregation (3-5 stages):
    p50: <150ms
    p95: <400ms
    p99: <800ms

  Report Aggregation (5+ stages):
    p50: <500ms
    p95: <2,000ms
    p99: <5,000ms
```

### Throughput Targets

```yaml
Queries per Second (QPS):
  Identity Service: 5,000 QPS
  Organization Service: 3,000 QPS
  Activity Service: 8,000 QPS
  Calculation Service: 2,000 QPS (CPU-bound)
  Reference Service: 10,000 QPS (mostly cached)
  Reporting Service: 500 QPS (complex queries)
  Audit Service: 2,000 QPS (write-heavy)

Connection Pool:
  Min Connections: 10 per service
  Max Connections: 100 per service
  Connection Acquisition Timeout: 5,000ms
  Idle Timeout: 60,000ms

Index Hit Rate: >95%
Full Table Scans: <5% of queries
Working Set Size: <80% of RAM
```

---

## 3. Index Strategy

### Index Design Principles

1. **ESR Rule** (Equality, Sort, Range)
   - Equality filters first
   - Sort fields second
   - Range filters last

2. **Index Cardinality**
   - High cardinality fields first (e.g., userId before status)
   - Low cardinality fields only in compound indexes

3. **Index Selectivity**
   - Target: Filter >90% of documents
   - Avoid indexes that return >50% of collection

4. **Covered Queries**
   - Include frequently projected fields in index
   - Avoids document fetch (IXSCAN only, no FETCH)

### Index Inventory

**Total Indexes**: 92 across 37 collections

| Service | Collections | Indexes | Total Size (Est.) |
|---------|-------------|---------|-------------------|
| Identity | 5 | 15 | 2.4 GB |
| Organization | 7 | 21 | 8.7 GB |
| Reference | 5 | 12 | 1.2 GB |
| Activity | 6 | 18 | 45.3 GB |
| Calculation | 4 | 11 | 32.1 GB |
| Reporting | 5 | 10 | 15.6 GB |
| Audit | 5 | 5 | 22.4 GB |
| **TOTAL** | **37** | **92** | **127.7 GB** |

### Index Strategy by Service

#### 3.1 Identity Service Indexes

**Collection: users**

```typescript
// Primary Key
{ _id: 1 }

// Unique Indexes
{ email: 1 } // Unique, for login
{ cognitoId: 1 } // Unique, sparse, for Cognito lookup

// Query Indexes
{
  organizationId: 1,
  status: 1,
  createdAt: -1
} // ESR: List active users by org

{
  organizationId: 1,
  roles: 1
} // Find users by role

// Text Search
{
  email: 'text',
  firstName: 'text',
  lastName: 'text'
} // Full-text search

// TTL Index
{ deletedAt: 1 } // expireAfterSeconds: 2592000 (30 days)
```

**Query Performance Analysis**:

```typescript
// ✅ OPTIMIZED QUERY (uses compound index)
db.users.find({
  organizationId: ObjectId('...'),
  status: 'ACTIVE'
})
.sort({ createdAt: -1 })
.limit(20)

// Execution Plan:
// IXSCAN { organizationId: 1, status: 1, createdAt: -1 }
// docsExamined: 20, keysExamined: 20
// executionTimeMillis: 5ms

// ❌ UNOPTIMIZED QUERY (no index)
db.users.find({
  status: 'ACTIVE',
  'preferences.theme': 'dark' // Nested field, no index!
})

// Execution Plan:
// COLLSCAN, docsExamined: 50,000
// executionTimeMillis: 450ms
```

**Index Size Estimates**:

```javascript
// Collection: users (50,000 documents, 1 KB avg size)
const indexSizes = {
  _id: '2.5 MB',
  email: '3.2 MB',
  cognitoId: '3.0 MB',
  'organizationId_status_createdAt': '4.5 MB',
  'organizationId_roles': '4.0 MB',
  'email_firstName_lastName_text': '8.5 MB',
  total: '25.7 MB'
};
```

#### 3.2 Organization Service Indexes

**Collection: projects**

```typescript
// Primary Key
{ _id: 1 }

// Unique Constraints
{ organizationId: 1, name: 1 } // Unique project names per org

// Query Indexes
{
  organizationId: 1,
  status: 1,
  reportingYear: -1
} // ESR: List active projects by year

{
  organizationId: 1,
  reportingYear: 1
} // All projects for a year

{ hierarchyId: 1 } // Lookup projects by hierarchy reference

{
  'metadata.tags': 1
} // Multi-key index for tag searches

// Geospatial Index
{ location: '2dsphere' } // For location-based queries

// Partial Index
{
  status: 1,
  archivedAt: 1
} // partialFilterExpression: { status: 'ARCHIVED' }
```

**Query Performance Analysis**:

```typescript
// ✅ COVERED QUERY (no document fetch needed)
db.projects.find(
  {
    organizationId: ObjectId('...'),
    status: 'ACTIVE'
  },
  { _id: 1, name: 1, reportingYear: 1 } // Fields in index
)
.hint({ organizationId: 1, status: 1, reportingYear: -1 })

// Execution Plan:
// IXSCAN (covered query, no FETCH stage!)
// docsExamined: 0, keysExamined: 15
// executionTimeMillis: 2ms

// ✅ EFFICIENT GEOSPATIAL QUERY
db.projects.find({
  location: {
    $near: {
      $geometry: { type: 'Point', coordinates: [-73.97, 40.77] },
      $maxDistance: 5000 // 5km
    }
  }
})

// Execution Plan:
// GEO_NEAR_2DSPHERE, keysExamined: 8
// executionTimeMillis: 12ms
```

**Collection: hierarchies**

```typescript
// Primary Key
{ _id: 1 }

// Unique Constraints
{ organizationId: 1, name: 1 }

// Materialized Path Index
{
  organizationId: 1,
  path: 1
} // Find all descendants: path: /^parent_id\./

// Query Index
{
  organizationId: 1,
  isTemplate: 1
} // Find organization templates
```

**Materialized Path Query Optimization**:

```typescript
// ✅ OPTIMIZED: Find all child nodes
const parentPath = '/location/country/usa/';
db.hierarchies.find({
  organizationId: ObjectId('...'),
  path: { $regex: `^${parentPath}` } // Uses index prefix!
})

// Execution Plan:
// IXSCAN { organizationId: 1, path: 1 }
// Bounds: ["^/location/country/usa/", "^/location/country/usa/\uffff"]
// executionTimeMillis: 8ms

// ✅ OPTIMIZED: Find parent node
const childPath = '/location/country/usa/california/';
const parentPath = childPath.split('/').slice(0, -2).join('/') + '/';
db.hierarchies.findOne({
  organizationId: ObjectId('...'),
  path: parentPath
})

// Execution Plan:
// IXSCAN { organizationId: 1, path: 1 }
// executionTimeMillis: 3ms
```

#### 3.3 Reference Service Indexes

**Collection: emission_factors**

```typescript
// Primary Key
{ _id: 1 }

// Unique Constraints
{
  source: 1,
  category: 1,
  subcategory: 1,
  version: 1
} // Unique emission factor per version

// Query Indexes
{
  category: 1,
  subcategory: 1,
  validFrom: -1
} // Find latest emission factor

{
  source: 1,
  version: 1,
  validFrom: -1
} // Version lookup

{ validFrom: 1, validTo: 1 } // Active factors in date range

// Text Search
{
  category: 'text',
  subcategory: 'text',
  description: 'text'
}
```

**Query Performance - Date Range Optimization**:

```typescript
// ✅ OPTIMIZED: Find active emission factors
const targetDate = new Date('2024-01-15');
db.emission_factors.find({
  category: 'electricity',
  subcategory: 'grid',
  validFrom: { $lte: targetDate },
  validTo: { $gte: targetDate }
})

// Execution Plan:
// IXSCAN { category: 1, subcategory: 1, validFrom: -1 }
// Filter: validTo >= targetDate
// executionTimeMillis: 6ms

// Alternative: Compound index for better performance
{
  category: 1,
  subcategory: 1,
  validFrom: -1,
  validTo: 1
}
```

#### 3.4 Activity Service Indexes

**Collection: activity_data**

```typescript
// Primary Key
{ _id: 1 }

// Unique Constraints
{
  projectId: 1,
  hierarchyNodeId: 1,
  category: 1,
  year: 1,
  month: 1
} // No duplicate activities for same period

// Query Indexes
{
  projectId: 1,
  year: 1,
  category: 1,
  month: 1
} // ESR: Query activities by project and period

{
  projectId: 1,
  hierarchyNodeId: 1,
  year: 1
} // Hierarchy-level aggregations

{
  projectId: 1,
  status: 1,
  calculatedAt: -1
} // Find pending calculations

{
  organizationId: 1,
  createdAt: -1
} // Org-wide activity feed

// Bulk Delete TTL
{ deletedAt: 1 } // expireAfterSeconds: 2592000 (30 days)
```

**Query Performance - Aggregations**:

```typescript
// ✅ OPTIMIZED: Monthly emissions by category
db.activity_data.aggregate([
  // Stage 1: Match (uses index)
  { $match: {
      projectId: ObjectId('...'),
      year: 2024
    }
  },

  // Stage 2: Group
  { $group: {
      _id: { category: '$category', month: '$month' },
      totalCO2e: { $sum: '$co2e' },
      totalQuantity: { $sum: '$quantityConsumed' },
      count: { $sum: 1 }
    }
  },

  // Stage 3: Sort
  { $sort: { '_id.month': 1, totalCO2e: -1 } },

  // Stage 4: Project
  { $project: {
      _id: 0,
      category: '$_id.category',
      month: '$_id.month',
      totalCO2e: 1,
      avgPerRecord: { $divide: ['$totalCO2e', '$count'] }
    }
  }
])

// Execution Plan:
// Stage 1: IXSCAN { projectId: 1, year: 1, category: 1, month: 1 }
// Stages 2-4: In-memory processing
// executionTimeMillis: 45ms
```

**Index Size Estimates**:

```javascript
// Collection: activity_data (5M documents, 2 KB avg size)
const indexSizes = {
  _id: '250 MB',
  'projectId_hierarchyNodeId_category_year_month': '600 MB',
  'projectId_year_category_month': '550 MB',
  'projectId_hierarchyNodeId_year': '500 MB',
  'projectId_status_calculatedAt': '450 MB',
  'organizationId_createdAt': '400 MB',
  total: '2.75 GB'
};

// Index to Collection Ratio: 27.5% (acceptable for query performance)
```

#### 3.5 Calculation Service Indexes

**Collection: emission_calculations**

```typescript
// Primary Key
{ _id: 1 }

// Query Indexes
{
  projectId: 1,
  calculatedAt: -1
} // Recent calculations for a project

{
  activityDataId: 1
} // Lookup calculation for activity

{
  projectId: 1,
  'result.scope': 1,
  calculatedAt: -1
} // Scope-specific calculations

{
  'metadata.calculationVersion': 1
} // Track calculation versions

// Hash Index for Integrity Checks
{ hash: 1 } // Verify calculation integrity
```

**Query Performance - Recalculation Detection**:

```typescript
// ✅ OPTIMIZED: Check if recalculation needed
const staleCalculations = await db.emission_calculations.find({
  projectId: ObjectId('...'),
  calculatedAt: { $lt: new Date(Date.now() - 86400000) }, // 24h ago
  'metadata.calculationVersion': { $lt: '2.0.0' }
})
.hint({ projectId: 1, calculatedAt: -1 })
.limit(1000)

// Execution Plan:
// IXSCAN { projectId: 1, calculatedAt: -1 }
// Filter: calculationVersion < 2.0.0
// executionTimeMillis: 18ms
```

#### 3.6 Reporting Service Indexes

**Collection: reports**

```typescript
// Primary Key
{ _id: 1 }

// Query Indexes
{
  organizationId: 1,
  projectId: 1,
  reportingPeriod: -1
} // Recent reports for project

{
  organizationId: 1,
  status: 1,
  createdAt: -1
} // Pending/failed reports

{
  'schedule.enabled': 1,
  'schedule.nextRun': 1
} // Scheduled report execution

// S3 Reference Index
{ s3Key: 1 } // Lookup report by S3 location

// TTL for Auto-Delete
{ expiresAt: 1 } // expireAfterSeconds: 0
```

**Query Performance - Report Scheduling**:

```typescript
// ✅ OPTIMIZED: Find reports to execute
const now = new Date();
db.reports.find({
  'schedule.enabled': true,
  'schedule.nextRun': { $lte: now }
})
.hint({ 'schedule.enabled': 1, 'schedule.nextRun': 1 })
.limit(100)

// Execution Plan:
// IXSCAN { schedule.enabled: 1, schedule.nextRun: 1 }
// Bounds: [true, true], [MinKey, now]
// executionTimeMillis: 8ms
```

#### 3.7 Audit Service Indexes

**Collection: audit_logs**

```typescript
// Primary Key
{ _id: 1 }

// Query Indexes
{
  organizationId: 1,
  timestamp: -1
} // Recent audit logs for org

{
  userId: 1,
  timestamp: -1
} // User activity audit

{
  action: 1,
  timestamp: -1
} // Filter by action type

{ hash: 1 } // Hash chain verification

{ sequenceNumber: 1 } // Sequential ordering
```

**Special Consideration - Append-Only Collection**:

```typescript
// Audit logs are append-only (no updates/deletes)
// Optimized for write throughput

// Write Concern: w: 1, j: true (journaled)
// Read Concern: majority (for compliance)

// Index Strategy:
// - Minimal indexes (only for common queries)
// - No unique indexes except _id
// - Rely on time-based partitioning

// Future: Consider time-series collection (MongoDB 5.0+)
db.createCollection('audit_logs', {
  timeseries: {
    timeField: 'timestamp',
    metaField: 'organizationId',
    granularity: 'minutes'
  }
});
```

---

## 4. Query Pattern Analysis

### 4.1 Query Classification

**By Frequency** (per service):

```yaml
High Frequency (>100 QPS):
  - GET /users/:id (Identity)
  - GET /projects/:id (Organization)
  - GET /emission-factors (Reference) [cached]
  - GET /activity-data?projectId=... (Activity)

Medium Frequency (10-100 QPS):
  - POST /activity-data (Activity)
  - GET /calculations/:id (Calculation)
  - GET /hierarchies/:id/descendants (Organization)
  - POST /audit-logs (Audit)

Low Frequency (<10 QPS):
  - POST /reports (Reporting)
  - PUT /users/:id (Identity)
  - POST /projects (Organization)
  - GET /reports/:id/download (Reporting)
```

**By Complexity**:

```yaml
Simple Queries (1-2 filters):
  - Point lookups by ID: 60% of queries
  - Single-field filters: 25% of queries

Moderate Queries (3-5 filters):
  - Compound filters: 10% of queries
  - Date range queries: 3% of queries

Complex Queries (aggregations):
  - Group by operations: 1.5% of queries
  - Multi-stage aggregations: 0.5% of queries
```

### 4.2 Top 20 Critical Query Patterns

#### Pattern 1: User Lookup by Email (Login)

**Frequency**: 50 QPS
**Response Time Target**: p95 <25ms

```typescript
// Query
db.users.findOne({ email: 'user@example.com' })

// Index Used
{ email: 1 } // Unique index

// Execution Plan
{
  stage: 'IXSCAN',
  indexName: 'email_1',
  keysExamined: 1,
  docsExamined: 1,
  executionTimeMillis: 3
}

// Mongoose Implementation
async findByEmail(email: string): Promise<User | null> {
  return this.userModel
    .findOne({ email: email.toLowerCase() })
    .select('_id email firstName lastName cognitoId status')
    .lean()
    .exec();
}
```

#### Pattern 2: List Active Projects for Organization

**Frequency**: 80 QPS
**Response Time Target**: p95 <50ms

```typescript
// Query
db.projects.find({
  organizationId: ObjectId('...'),
  status: 'ACTIVE'
})
.sort({ createdAt: -1 })
.limit(20)

// Index Used
{ organizationId: 1, status: 1, createdAt: -1 }

// Execution Plan
{
  stage: 'IXSCAN',
  indexName: 'organizationId_1_status_1_createdAt_-1',
  indexBounds: {
    organizationId: ['ObjectId(...)', 'ObjectId(...)'],
    status: ['ACTIVE', 'ACTIVE'],
    createdAt: ['MaxKey', 'MinKey']
  },
  keysExamined: 20,
  docsExamined: 20,
  executionTimeMillis: 8
}

// Mongoose Implementation
async findActiveProjects(
  organizationId: string,
  page: number = 1,
  limit: number = 20
): Promise<Project[]> {
  return this.projectModel
    .find({
      organizationId: new Types.ObjectId(organizationId),
      status: ProjectStatus.ACTIVE
    })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .select('name reportingYear hierarchyId createdAt')
    .lean()
    .exec();
}
```

#### Pattern 3: Activity Data by Project and Year

**Frequency**: 120 QPS
**Response Time Target**: p95 <75ms

```typescript
// Query
db.activity_data.find({
  projectId: ObjectId('...'),
  year: 2024,
  category: 'electricity'
})
.sort({ month: 1 })

// Index Used
{ projectId: 1, year: 1, category: 1, month: 1 }

// Execution Plan
{
  stage: 'IXSCAN',
  indexName: 'projectId_1_year_1_category_1_month_1',
  direction: 'forward',
  indexBounds: {
    projectId: ['ObjectId(...)', 'ObjectId(...)'],
    year: [2024, 2024],
    category: ['electricity', 'electricity'],
    month: ['MinKey', 'MaxKey']
  },
  keysExamined: 12,
  docsExamined: 12,
  executionTimeMillis: 6
}

// Mongoose Implementation
async findActivityData(
  projectId: string,
  year: number,
  category?: string
): Promise<ActivityData[]> {
  const filter: any = {
    projectId: new Types.ObjectId(projectId),
    year
  };

  if (category) filter.category = category;

  return this.activityDataModel
    .find(filter)
    .sort({ month: 1 })
    .select('category month quantityConsumed co2e uomId')
    .lean()
    .exec();
}
```

#### Pattern 4: Emission Factor Lookup

**Frequency**: 200 QPS (90% cached)
**Response Time Target**: p95 <25ms

```typescript
// Query
db.emission_factors.findOne({
  category: 'electricity',
  subcategory: 'grid',
  source: 'EPA',
  validFrom: { $lte: new Date('2024-01-15') },
  validTo: { $gte: new Date('2024-01-15') }
})
.sort({ version: -1 })

// Index Used
{ category: 1, subcategory: 1, validFrom: -1, validTo: 1 }

// Execution Plan
{
  stage: 'IXSCAN',
  indexName: 'category_1_subcategory_1_validFrom_-1_validTo_1',
  indexBounds: {
    category: ['electricity', 'electricity'],
    subcategory: ['grid', 'grid'],
    validFrom: ['MaxKey', ISODate('2024-01-15')],
    validTo: [ISODate('2024-01-15'), 'MaxKey']
  },
  keysExamined: 3,
  docsExamined: 1,
  executionTimeMillis: 4
}

// Mongoose Implementation
@Cacheable({ ttl: 86400, key: (args) => `ef:${args[0]}:${args[1]}:${args[2]}` })
async findActiveEmissionFactor(
  category: string,
  subcategory: string,
  date: Date
): Promise<EmissionFactor | null> {
  return this.emissionFactorModel
    .findOne({
      category,
      subcategory,
      validFrom: { $lte: date },
      validTo: { $gte: date }
    })
    .sort({ version: -1 })
    .select('factors uom source version')
    .lean()
    .exec();
}
```

#### Pattern 5: Hierarchy Descendants (Materialized Path)

**Frequency**: 40 QPS
**Response Time Target**: p95 <100ms

```typescript
// Query
const parentPath = '/location/country/usa/';
db.hierarchies.find({
  organizationId: ObjectId('...'),
  path: { $regex: `^${parentPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}` }
})

// Index Used
{ organizationId: 1, path: 1 }

// Execution Plan
{
  stage: 'IXSCAN',
  indexName: 'organizationId_1_path_1',
  indexBounds: {
    organizationId: ['ObjectId(...)', 'ObjectId(...)'],
    path: ['/location/country/usa/', '/location/country/usa/\uffff']
  },
  keysExamined: 52,
  docsExamined: 52,
  executionTimeMillis: 15
}

// Mongoose Implementation
async findDescendants(
  organizationId: string,
  parentId: string
): Promise<Hierarchy[]> {
  const parent = await this.hierarchyModel
    .findOne({
      _id: new Types.ObjectId(parentId),
      organizationId: new Types.ObjectId(organizationId)
    })
    .select('path')
    .lean()
    .exec();

  if (!parent) return [];

  const escapedPath = parent.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  return this.hierarchyModel
    .find({
      organizationId: new Types.ObjectId(organizationId),
      path: { $regex: `^${escapedPath}` },
      _id: { $ne: new Types.ObjectId(parentId) } // Exclude parent itself
    })
    .select('name path level')
    .lean()
    .exec();
}
```

#### Pattern 6: Monthly Emissions Aggregation

**Frequency**: 15 QPS
**Response Time Target**: p95 <200ms

```typescript
// Aggregation Pipeline
db.activity_data.aggregate([
  // Stage 1: Match project and year (uses index)
  { $match: {
      projectId: ObjectId('...'),
      year: 2024
    }
  },

  // Stage 2: Group by category and month
  { $group: {
      _id: {
        category: '$category',
        month: '$month'
      },
      totalCO2e: { $sum: '$co2e' },
      totalQuantity: { $sum: '$quantityConsumed' },
      recordCount: { $sum: 1 }
    }
  },

  // Stage 3: Sort by month and emissions
  { $sort: {
      '_id.month': 1,
      totalCO2e: -1
    }
  },

  // Stage 4: Reshape output
  { $project: {
      _id: 0,
      category: '$_id.category',
      month: '$_id.month',
      totalCO2e: { $round: ['$totalCO2e', 2] },
      avgCO2ePerRecord: {
        $round: [{ $divide: ['$totalCO2e', '$recordCount'] }, 2]
      }
    }
  }
])

// Index Used
{ projectId: 1, year: 1 }

// Execution Plan
{
  stages: [
    {
      $cursor: {
        queryPlanner: {
          winningPlan: {
            stage: 'IXSCAN',
            indexName: 'projectId_1_year_1'
          }
        }
      }
    },
    { $group: { ... } },
    { $sort: { ... } },
    { $project: { ... } }
  ],
  executionTimeMillis: 78,
  nReturned: 36 // 12 months * 3 categories
}

// Mongoose Implementation
async getMonthlyEmissions(
  projectId: string,
  year: number
): Promise<MonthlyEmission[]> {
  return this.activityDataModel.aggregate([
    { $match: {
        projectId: new Types.ObjectId(projectId),
        year
      }
    },
    { $group: {
        _id: {
          category: '$category',
          month: '$month'
        },
        totalCO2e: { $sum: '$co2e' },
        totalQuantity: { $sum: '$quantityConsumed' },
        recordCount: { $sum: 1 }
      }
    },
    { $sort: { '_id.month': 1, totalCO2e: -1 } },
    { $project: {
        _id: 0,
        category: '$_id.category',
        month: '$_id.month',
        totalCO2e: { $round: ['$totalCO2e', 2] },
        avgCO2ePerRecord: {
          $round: [{ $divide: ['$totalCO2e', '$recordCount'] }, 2]
        }
      }
    }
  ]).exec();
}
```

#### Pattern 7: Scope 1/2/3 Aggregation with Hierarchy Rollup

**Frequency**: 5 QPS
**Response Time Target**: p95 <500ms

```typescript
// Complex Aggregation: Join activity data with hierarchy
db.activity_data.aggregate([
  // Stage 1: Match project and year
  { $match: {
      projectId: ObjectId('...'),
      year: 2024
    }
  },

  // Stage 2: Lookup hierarchy node
  { $lookup: {
      from: 'hierarchies',
      localField: 'hierarchyNodeId',
      foreignField: '_id',
      as: 'hierarchyNode'
    }
  },

  // Stage 3: Unwind hierarchy (convert array to object)
  { $unwind: '$hierarchyNode' },

  // Stage 4: Lookup emission calculation for scope
  { $lookup: {
      from: 'emission_calculations',
      let: { activityId: '$_id' },
      pipeline: [
        { $match: {
            $expr: { $eq: ['$activityDataId', '$$activityId'] }
          }
        },
        { $project: { scope: '$result.scope', co2e: '$result.co2e' } }
      ],
      as: 'calculation'
    }
  },

  // Stage 5: Unwind calculation
  { $unwind: { path: '$calculation', preserveNullAndEmptyArrays: true } },

  // Stage 6: Group by hierarchy level and scope
  { $group: {
      _id: {
        hierarchyLevel: '$hierarchyNode.level',
        hierarchyName: '$hierarchyNode.name',
        scope: '$calculation.scope'
      },
      totalCO2e: { $sum: '$calculation.co2e' },
      activityCount: { $sum: 1 }
    }
  },

  // Stage 7: Sort by hierarchy level and emissions
  { $sort: {
      '_id.hierarchyLevel': 1,
      totalCO2e: -1
    }
  },

  // Stage 8: Group by hierarchy to get scope breakdown
  { $group: {
      _id: {
        level: '$_id.hierarchyLevel',
        name: '$_id.hierarchyName'
      },
      scopes: {
        $push: {
          scope: '$_id.scope',
          totalCO2e: '$totalCO2e',
          activityCount: '$activityCount'
        }
      },
      grandTotal: { $sum: '$totalCO2e' }
    }
  },

  // Stage 9: Final projection
  { $project: {
      _id: 0,
      hierarchyLevel: '$_id.level',
      hierarchyName: '$_id.name',
      scopes: 1,
      grandTotal: { $round: ['$grandTotal', 2] }
    }
  }
])

// Indexes Used:
// 1. activity_data: { projectId: 1, year: 1 }
// 2. hierarchies: { _id: 1 }
// 3. emission_calculations: { activityDataId: 1 }

// Execution Stats:
// nReturned: 25
// executionTimeMillis: 285
// totalDocsExamined: 1,450

// Mongoose Implementation
async getScopeBreakdownByHierarchy(
  projectId: string,
  year: number
): Promise<ScopeBreakdown[]> {
  return this.activityDataModel.aggregate([
    { $match: {
        projectId: new Types.ObjectId(projectId),
        year
      }
    },
    { $lookup: {
        from: 'hierarchies',
        localField: 'hierarchyNodeId',
        foreignField: '_id',
        as: 'hierarchyNode'
      }
    },
    { $unwind: '$hierarchyNode' },
    { $lookup: {
        from: 'emission_calculations',
        let: { activityId: '$_id' },
        pipeline: [
          { $match: {
              $expr: { $eq: ['$activityDataId', '$$activityId'] }
            }
          },
          { $project: { scope: '$result.scope', co2e: '$result.co2e' } }
        ],
        as: 'calculation'
      }
    },
    { $unwind: { path: '$calculation', preserveNullAndEmptyArrays: true } },
    { $group: {
        _id: {
          hierarchyLevel: '$hierarchyNode.level',
          hierarchyName: '$hierarchyNode.name',
          scope: '$calculation.scope'
        },
        totalCO2e: { $sum: '$calculation.co2e' },
        activityCount: { $sum: 1 }
      }
    },
    { $sort: {
        '_id.hierarchyLevel': 1,
        totalCO2e: -1
      }
    },
    { $group: {
        _id: {
          level: '$_id.hierarchyLevel',
          name: '$_id.hierarchyName'
        },
        scopes: {
          $push: {
            scope: '$_id.scope',
            totalCO2e: '$totalCO2e',
            activityCount: '$activityCount'
          }
        },
        grandTotal: { $sum: '$totalCO2e' }
      }
    },
    { $project: {
        _id: 0,
        hierarchyLevel: '$_id.level',
        hierarchyName: '$_id.name',
        scopes: 1,
        grandTotal: { $round: ['$grandTotal', 2] }
      }
    }
  ]).exec();
}
```

#### Pattern 8: Audit Log Query (Compliance)

**Frequency**: 10 QPS
**Response Time Target**: p95 <100ms

```typescript
// Query: Recent audit logs for organization
db.audit_logs.find({
  organizationId: ObjectId('...'),
  timestamp: {
    $gte: new Date('2024-01-01'),
    $lte: new Date('2024-01-31')
  },
  action: { $in: ['PROJECT_CREATED', 'PROJECT_UPDATED', 'PROJECT_DELETED'] }
})
.sort({ timestamp: -1 })
.limit(100)

// Index Used
{ organizationId: 1, timestamp: -1 }

// Execution Plan
{
  stage: 'IXSCAN',
  indexName: 'organizationId_1_timestamp_-1',
  indexBounds: {
    organizationId: ['ObjectId(...)', 'ObjectId(...)'],
    timestamp: [ISODate('2024-01-31'), ISODate('2024-01-01')]
  },
  filter: { action: { $in: ['PROJECT_CREATED', ...] } },
  keysExamined: 250,
  docsExamined: 100,
  executionTimeMillis: 32
}

// Mongoose Implementation
async findAuditLogs(
  organizationId: string,
  startDate: Date,
  endDate: Date,
  actions?: string[],
  limit: number = 100
): Promise<AuditLog[]> {
  const filter: any = {
    organizationId: new Types.ObjectId(organizationId),
    timestamp: { $gte: startDate, $lte: endDate }
  };

  if (actions && actions.length > 0) {
    filter.action = { $in: actions };
  }

  return this.auditLogModel
    .find(filter)
    .sort({ timestamp: -1 })
    .limit(limit)
    .select('action userId timestamp details ipAddress')
    .lean()
    .exec();
}
```

#### Pattern 9: User Permissions Check

**Frequency**: 500 QPS (95% cached)
**Response Time Target**: p95 <10ms

```typescript
// Query: User's permissions for a project
db.user_project_permissions.findOne({
  userId: ObjectId('...'),
  projectId: ObjectId('...')
})

// Index Used
{ userId: 1, projectId: 1 } // Unique compound index

// Execution Plan
{
  stage: 'IXSCAN',
  indexName: 'userId_1_projectId_1',
  keysExamined: 1,
  docsExamined: 1,
  executionTimeMillis: 2
}

// Mongoose Implementation (with caching)
@Cacheable({
  ttl: 300, // 5 minutes
  key: (args) => `perm:${args[0]}:${args[1]}`
})
async getUserProjectPermissions(
  userId: string,
  projectId: string
): Promise<Permission | null> {
  return this.permissionModel
    .findOne({
      userId: new Types.ObjectId(userId),
      projectId: new Types.ObjectId(projectId)
    })
    .select('role permissions')
    .lean()
    .exec();
}

// Invalidation on permission change
async updatePermissions(userId: string, projectId: string, ...): Promise<void> {
  await this.permissionModel.updateOne(...);
  await this.cacheService.del(`perm:${userId}:${projectId}`);
}
```

#### Pattern 10: Scheduled Report Execution

**Frequency**: 1 query/minute
**Response Time Target**: p95 <50ms

```typescript
// Query: Find reports due for execution
db.reports.find({
  'schedule.enabled': true,
  'schedule.nextRun': { $lte: new Date() },
  status: { $ne: 'RUNNING' }
})
.sort({ 'schedule.nextRun': 1 })
.limit(10)

// Index Used
{ 'schedule.enabled': 1, 'schedule.nextRun': 1 }

// Execution Plan
{
  stage: 'IXSCAN',
  indexName: 'schedule.enabled_1_schedule.nextRun_1',
  indexBounds: {
    'schedule.enabled': [true, true],
    'schedule.nextRun': ['MinKey', ISODate('2024-11-18T10:30:00Z')]
  },
  filter: { status: { $ne: 'RUNNING' } },
  keysExamined: 15,
  docsExamined: 10,
  executionTimeMillis: 6
}

// Mongoose Implementation
async findDueReports(): Promise<Report[]> {
  return this.reportModel
    .find({
      'schedule.enabled': true,
      'schedule.nextRun': { $lte: new Date() },
      status: { $ne: ReportStatus.RUNNING }
    })
    .sort({ 'schedule.nextRun': 1 })
    .limit(10)
    .select('name organizationId projectId schedule')
    .lean()
    .exec();
}

// Update nextRun after execution
async markReportExecuted(reportId: string, nextRun: Date): Promise<void> {
  await this.reportModel.updateOne(
    { _id: new Types.ObjectId(reportId) },
    {
      $set: {
        'schedule.nextRun': nextRun,
        'schedule.lastRun': new Date()
      }
    }
  );
}
```

---

## 5. Aggregation Pipeline Optimization

### 5.1 Aggregation Best Practices

**Pipeline Order Optimization**:

```typescript
// ❌ INEFFICIENT: Filter after lookup
db.activity_data.aggregate([
  { $lookup: { from: 'emission_calculations', ... } }, // Joins all records!
  { $match: { projectId: ObjectId('...'), year: 2024 } } // Filter last
])

// ✅ EFFICIENT: Filter before lookup
db.activity_data.aggregate([
  { $match: { projectId: ObjectId('...'), year: 2024 } }, // Filter first (uses index)
  { $lookup: { from: 'emission_calculations', ... } } // Join only filtered records
])
```

**Use `$project` to Reduce Document Size**:

```typescript
// ❌ INEFFICIENT: Carry large documents through pipeline
db.activity_data.aggregate([
  { $match: { projectId: ObjectId('...') } },
  { $lookup: { from: 'emission_calculations', ... } },
  { $group: { _id: '$category', total: { $sum: '$co2e' } } }
])

// ✅ EFFICIENT: Project only needed fields early
db.activity_data.aggregate([
  { $match: { projectId: ObjectId('...') } },
  { $project: { _id: 1, category: 1, co2e: 1 } }, // Reduce document size
  { $group: { _id: '$category', total: { $sum: '$co2e' } } }
])
```

**Optimize `$lookup` with Pipeline**:

```typescript
// ❌ INEFFICIENT: Lookup all fields
{ $lookup: {
    from: 'emission_calculations',
    localField: '_id',
    foreignField: 'activityDataId',
    as: 'calculations'
  }
}

// ✅ EFFICIENT: Lookup with pipeline and projection
{ $lookup: {
    from: 'emission_calculations',
    let: { activityId: '$_id' },
    pipeline: [
      { $match: {
          $expr: { $eq: ['$activityDataId', '$$activityId'] }
        }
      },
      { $project: { scope: '$result.scope', co2e: '$result.co2e' } }, // Only needed fields
      { $limit: 1 } // If only one result expected
    ],
    as: 'calculation'
  }
}
```

**Use `$facet` for Multiple Aggregations**:

```typescript
// ❌ INEFFICIENT: Two separate queries
const totalEmissions = await db.activity_data.aggregate([
  { $match: { projectId: ObjectId('...') } },
  { $group: { _id: null, total: { $sum: '$co2e' } } }
]);

const categoryBreakdown = await db.activity_data.aggregate([
  { $match: { projectId: ObjectId('...') } },
  { $group: { _id: '$category', total: { $sum: '$co2e' } } }
]);

// ✅ EFFICIENT: Single query with $facet
const results = await db.activity_data.aggregate([
  { $match: { projectId: ObjectId('...') } },
  { $facet: {
      totalEmissions: [
        { $group: { _id: null, total: { $sum: '$co2e' } } }
      ],
      categoryBreakdown: [
        { $group: { _id: '$category', total: { $sum: '$co2e' } } },
        { $sort: { total: -1 } }
      ],
      monthlyTrend: [
        { $group: { _id: '$month', total: { $sum: '$co2e' } } },
        { $sort: { _id: 1 } }
      ]
    }
  }
]);
```

### 5.2 Memory Limits and Optimization

**Default Memory Limit**: 100 MB per stage

**Solution 1: Use `allowDiskUse`**:

```typescript
db.activity_data.aggregate(
  [...pipeline],
  { allowDiskUse: true } // Spill to disk if >100MB
)

// Mongoose
this.activityDataModel.aggregate([...pipeline])
  .allowDiskUse(true)
  .exec();
```

**Solution 2: Break into Smaller Batches**:

```typescript
// Process data in monthly batches
const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const results = [];

for (const month of months) {
  const monthlyResult = await db.activity_data.aggregate([
    { $match: {
        projectId: ObjectId('...'),
        year: 2024,
        month
      }
    },
    { $group: { _id: '$category', total: { $sum: '$co2e' } } }
  ]);

  results.push(...monthlyResult);
}

// Aggregate results in application layer
const final = results.reduce((acc, item) => {
  acc[item._id] = (acc[item._id] || 0) + item.total;
  return acc;
}, {});
```

**Solution 3: Use `$limit` Early**:

```typescript
// ❌ INEFFICIENT: Sort all documents then limit
db.activity_data.aggregate([
  { $match: { projectId: ObjectId('...') } },
  { $sort: { co2e: -1 } }, // Sort millions of docs
  { $limit: 10 }
])

// ✅ EFFICIENT: Use index for sorting
// Create index: { projectId: 1, co2e: -1 }
db.activity_data.aggregate([
  { $match: { projectId: ObjectId('...') } },
  { $sort: { co2e: -1 } }, // Uses index
  { $limit: 10 } // Early limit
])
```

### 5.3 Common Aggregation Patterns

#### Pattern: Running Totals

```typescript
// Calculate cumulative emissions by month
db.activity_data.aggregate([
  { $match: {
      projectId: ObjectId('...'),
      year: 2024
    }
  },
  { $group: {
      _id: '$month',
      monthlyTotal: { $sum: '$co2e' }
    }
  },
  { $sort: { _id: 1 } },
  { $group: {
      _id: null,
      months: {
        $push: {
          month: '$_id',
          monthlyTotal: '$monthlyTotal'
        }
      }
    }
  },
  { $unwind: { path: '$months', includeArrayIndex: 'index' } },
  { $project: {
      _id: 0,
      month: '$months.month',
      monthlyTotal: '$months.monthlyTotal',
      cumulativeTotal: {
        $sum: {
          $slice: ['$months.monthlyTotal', 0, { $add: ['$index', 1] }]
        }
      }
    }
  }
])
```

#### Pattern: Moving Average

```typescript
// 3-month moving average of emissions
db.activity_data.aggregate([
  { $match: {
      projectId: ObjectId('...'),
      year: 2024
    }
  },
  { $group: {
      _id: '$month',
      avgCO2e: { $avg: '$co2e' }
    }
  },
  { $sort: { _id: 1 } },
  { $setWindowFields: {
      sortBy: { _id: 1 },
      output: {
        movingAvg: {
          $avg: '$avgCO2e',
          window: {
            documents: [-1, 1] // Current + 1 before + 1 after
          }
        }
      }
    }
  }
])
```

#### Pattern: Percentile Calculation

```typescript
// Calculate p50, p95, p99 of emissions
db.activity_data.aggregate([
  { $match: { projectId: ObjectId('...') } },
  { $group: {
      _id: null,
      emissions: { $push: '$co2e' }
    }
  },
  { $project: {
      _id: 0,
      p50: { $arrayElemAt: ['$emissions', { $floor: { $multiply: [{ $size: '$emissions' }, 0.5] } }] },
      p95: { $arrayElemAt: ['$emissions', { $floor: { $multiply: [{ $size: '$emissions' }, 0.95] } }] },
      p99: { $arrayElemAt: ['$emissions', { $floor: { $multiply: [{ $size: '$emissions' }, 0.99] } }] }
    }
  }
])
```

---

## 6. Connection Pooling Strategy

### 6.1 Connection Pool Configuration

**Per-Service Connection Pool**:

```typescript
// config/database.config.ts
import { MongooseModuleOptions } from '@nestjs/mongoose';

export const getDatabaseConfig = (): MongooseModuleOptions => {
  const serviceName = process.env.SERVICE_NAME || 'default';
  const environment = process.env.NODE_ENV || 'development';

  return {
    uri: process.env.MONGODB_URI,
    dbName: `clenergize_${serviceName}`,

    // Connection Pool Settings
    minPoolSize: 10, // Minimum connections
    maxPoolSize: 100, // Maximum connections
    maxIdleTimeMS: 60000, // Close idle connections after 60s
    waitQueueTimeoutMS: 5000, // Timeout when pool is exhausted

    // Timeouts
    serverSelectionTimeoutMS: 5000, // Fail fast if can't connect
    socketTimeoutMS: 45000, // Socket timeout for operations
    connectTimeoutMS: 10000, // Initial connection timeout

    // Retry Logic
    retryWrites: true,
    retryReads: true,

    // Monitoring
    monitorCommands: environment !== 'production',

    // Connection Options
    useNewUrlParser: true,
    useUnifiedTopology: true,

    // Read Preference
    readPreference: 'primaryPreferred', // Read from primary, fallback to secondary

    // Write Concern
    w: 'majority', // Wait for majority to acknowledge
    journal: true // Wait for journal commit
  };
};
```

**Dynamic Pool Sizing**:

```typescript
// Based on expected load
const connectionPoolSizes = {
  'identity': { min: 10, max: 100 }, // High read/write
  'organization': { min: 10, max: 80 },
  'reference': { min: 5, max: 30 }, // Mostly cached
  'activity': { min: 20, max: 150 }, // Highest load
  'calculation': { min: 15, max: 100 },
  'reporting': { min: 5, max: 50 }, // Batch operations
  'audit': { min: 10, max: 80 } // Write-heavy
};

export const getDatabaseConfig = (): MongooseModuleOptions => {
  const serviceName = process.env.SERVICE_NAME;
  const poolConfig = connectionPoolSizes[serviceName] || { min: 10, max: 100 };

  return {
    ...baseConfig,
    minPoolSize: poolConfig.min,
    maxPoolSize: poolConfig.max
  };
};
```

### 6.2 Connection Pool Monitoring

```typescript
@Injectable()
export class DatabaseHealthService {
  private readonly logger = new Logger(DatabaseHealthService.name);

  constructor(
    @InjectConnection() private readonly connection: Connection
  ) {
    this.startMonitoring();
  }

  private startMonitoring(): void {
    // Monitor connection pool every 30 seconds
    setInterval(() => {
      const db = this.connection.db;
      const serverStatus = db.admin().serverStatus();

      serverStatus.then((status) => {
        const connections = status.connections;

        this.logger.log({
          message: 'Connection pool status',
          current: connections.current,
          available: connections.available,
          totalCreated: connections.totalCreated,
          active: connections.active
        });

        // Alert if pool is >80% utilized
        const utilization = connections.current / connections.available;
        if (utilization > 0.8) {
          this.logger.warn({
            message: 'Connection pool utilization high',
            utilization: `${(utilization * 100).toFixed(2)}%`,
            current: connections.current,
            available: connections.available
          });
        }
      });
    }, 30000);
  }

  async getPoolStatus(): Promise<PoolStatus> {
    const db = this.connection.db;
    const status = await db.admin().serverStatus();

    return {
      current: status.connections.current,
      available: status.connections.available,
      totalCreated: status.connections.totalCreated,
      active: status.connections.active,
      utilization: (status.connections.current / status.connections.available) * 100
    };
  }
}
```

### 6.3 Connection Leak Prevention

```typescript
// Use Mongoose sessions properly
async function performTransaction() {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // All operations use session
      await UserModel.create([{ email: 'test@example.com' }], { session });
      await ProjectModel.updateOne({ _id: projectId }, { status: 'ACTIVE' }, { session });
    });
  } finally {
    // CRITICAL: Always end session
    await session.endSession();
  }
}

// Use timeout for long-running operations
async function findWithTimeout<T>(
  model: Model<T>,
  filter: any,
  timeoutMs: number = 30000
): Promise<T[]> {
  return Promise.race([
    model.find(filter).exec(),
    new Promise<T[]>((_, reject) =>
      setTimeout(() => reject(new Error('Query timeout')), timeoutMs)
    )
  ]);
}
```

---

## 7. Read/Write Concerns

### 7.1 Read Concern Levels

```yaml
Default: "local"
  - Fastest
  - May return stale data from secondary
  - Use for: Dashboards, reports, non-critical reads

Level: "majority"
  - Slower
  - Guaranteed to be acknowledged by majority of replica set
  - Use for: Financial data, compliance, audit logs

Level: "linearizable"
  - Slowest
  - Guaranteed to be the most recent write
  - Use for: Critical decisions, banking operations
```

**Implementation**:

```typescript
// Service-specific read concerns
const readConcerns = {
  identity: 'majority', // User data must be consistent
  organization: 'majority', // Project data must be consistent
  reference: 'local', // Reference data can be slightly stale
  activity: 'local', // Activity data can be eventually consistent
  calculation: 'majority', // Calculations must be accurate
  reporting: 'local', // Reports can use stale data
  audit: 'majority' // Audit logs must be accurate
};

// Apply read concern per query
async findUsers(orgId: string): Promise<User[]> {
  return this.userModel
    .find({ organizationId: orgId })
    .read('majority') // Force majority read
    .exec();
}
```

### 7.2 Write Concern Levels

```yaml
Default: w: 1, j: false
  - Fastest
  - Acknowledged by primary only
  - No journal guarantee
  - Use for: Non-critical updates, logs

Level: w: "majority", j: true
  - Slower
  - Acknowledged by majority of replica set
  - Guaranteed to be journaled
  - Use for: Financial data, compliance, critical updates

Level: w: 2, j: true
  - Custom
  - Acknowledged by specific number of nodes
  - Guaranteed to be journaled
  - Use for: Specific consistency requirements
```

**Implementation**:

```typescript
// Critical write operation with majority write concern
async createProject(projectData: CreateProjectDto): Promise<Project> {
  const session = await this.connection.startSession();

  try {
    const result = await session.withTransaction(
      async () => {
        const project = new this.projectModel(projectData);
        await project.save({ session });

        // Publish event
        await this.eventBus.publish(
          new ProjectCreatedEvent(project),
          { session }
        );

        return project;
      },
      {
        readConcern: { level: 'majority' },
        writeConcern: { w: 'majority', j: true },
        readPreference: 'primary'
      }
    );

    return result;
  } finally {
    await session.endSession();
  }
}

// Non-critical write with relaxed concern
async logActivity(activityLog: ActivityLog): Promise<void> {
  await this.activityLogModel.create(activityLog, {
    writeConcern: { w: 1, j: false } // Fast, don't wait for journal
  });
}
```

---

## 8. Query Plan Analysis

### 8.1 Using `explain()` for Query Analysis

```typescript
// Analyze query execution plan
const explainResult = await db.activity_data
  .find({
    projectId: ObjectId('...'),
    year: 2024
  })
  .explain('executionStats');

console.log(JSON.stringify(explainResult, null, 2));
```

**Example Output**:

```json
{
  "queryPlanner": {
    "plannerVersion": 1,
    "namespace": "clenergize_activity.activity_data",
    "indexFilterSet": false,
    "parsedQuery": {
      "$and": [
        { "projectId": { "$eq": "ObjectId('...')" } },
        { "year": { "$eq": 2024 } }
      ]
    },
    "winningPlan": {
      "stage": "FETCH",
      "inputStage": {
        "stage": "IXSCAN",
        "keyPattern": { "projectId": 1, "year": 1 },
        "indexName": "projectId_1_year_1",
        "isMultiKey": false,
        "isUnique": false,
        "isSparse": false,
        "isPartial": false,
        "indexVersion": 2,
        "direction": "forward",
        "indexBounds": {
          "projectId": ["ObjectId('...')", "ObjectId('...')"],
          "year": [2024, 2024]
        }
      }
    },
    "rejectedPlans": []
  },
  "executionStats": {
    "executionSuccess": true,
    "nReturned": 144,
    "executionTimeMillis": 12,
    "totalKeysExamined": 144,
    "totalDocsExamined": 144,
    "executionStages": {
      "stage": "FETCH",
      "nReturned": 144,
      "executionTimeMilliEstimate": 10,
      "works": 145,
      "advanced": 144,
      "docsExamined": 144,
      "inputStage": {
        "stage": "IXSCAN",
        "nReturned": 144,
        "executionTimeMillisEstimate": 5,
        "works": 145,
        "advanced": 144,
        "keysExamined": 144
      }
    }
  }
}
```

### 8.2 Interpreting Execution Stages

**IXSCAN (Index Scan)**: ✅ Good - Using index

```typescript
{
  stage: 'IXSCAN',
  keyPattern: { projectId: 1, year: 1 },
  keysExamined: 144,
  docsExamined: 0 // Covered query - even better!
}
```

**COLLSCAN (Collection Scan)**: ❌ Bad - Full table scan

```typescript
{
  stage: 'COLLSCAN',
  filter: { projectId: ObjectId('...') },
  docsExamined: 50000 // Scanned all documents!
}
// Solution: Add index on projectId
```

**FETCH**: Neutral - Retrieving documents after index scan

```typescript
{
  stage: 'FETCH',
  inputStage: {
    stage: 'IXSCAN',
    keysExamined: 144
  },
  docsExamined: 144
}
// Acceptable if keysExamined ≈ docsExamined
```

**SORT**: ⚠️ Warning - In-memory sort

```typescript
{
  stage: 'SORT',
  sortPattern: { createdAt: -1 },
  memUsage: 5242880, // 5 MB
  inputStage: {
    stage: 'IXSCAN'
  }
}
// Solution: Add createdAt to index
```

### 8.3 Query Efficiency Metrics

**Efficiency Ratio** = `nReturned` / `totalKeysExamined`

```typescript
// ✅ EXCELLENT (ratio = 1.0)
{
  nReturned: 100,
  totalKeysExamined: 100,
  totalDocsExamined: 100
}

// ⚠️ WARNING (ratio = 0.1)
{
  nReturned: 10,
  totalKeysExamined: 100,
  totalDocsExamined: 100
}
// Index is not selective enough

// ❌ CRITICAL (ratio < 0.01)
{
  nReturned: 10,
  totalKeysExamined: 50000,
  totalDocsExamined: 50000
}
// Need better index or query redesign
```

**Execution Time Targets**:

```yaml
Point Query (by _id):
  - executionTimeMillis: <5ms

Indexed Query:
  - executionTimeMillis: <25ms

Aggregation:
  - executionTimeMillis: <200ms

Report Query:
  - executionTimeMillis: <2000ms
```

### 8.4 Automated Query Analysis

```typescript
@Injectable()
export class QueryAnalyzerService {
  async analyzeQuery(
    model: Model<any>,
    filter: any,
    sort?: any
  ): Promise<QueryAnalysis> {
    const explain = await model
      .find(filter)
      .sort(sort || {})
      .explain('executionStats');

    const stats = explain.executionStats;
    const plan = explain.queryPlanner.winningPlan;

    // Calculate efficiency
    const efficiency = stats.nReturned / stats.totalKeysExamined;

    // Detect issues
    const issues: string[] = [];

    if (plan.stage === 'COLLSCAN') {
      issues.push('CRITICAL: Full collection scan detected');
    }

    if (efficiency < 0.1) {
      issues.push('WARNING: Low index selectivity');
    }

    if (stats.executionTimeMillis > 100) {
      issues.push('WARNING: Slow query execution');
    }

    if (this.hasSortStage(plan)) {
      issues.push('INFO: In-memory sort detected');
    }

    return {
      executionTimeMs: stats.executionTimeMillis,
      docsReturned: stats.nReturned,
      keysExamined: stats.totalKeysExamined,
      docsExamined: stats.totalDocsExamined,
      efficiency,
      indexUsed: this.getIndexName(plan),
      issues
    };
  }

  private hasSortStage(plan: any): boolean {
    if (plan.stage === 'SORT') return true;
    if (plan.inputStage) return this.hasSortStage(plan.inputStage);
    return false;
  }

  private getIndexName(plan: any): string | null {
    if (plan.stage === 'IXSCAN') return plan.indexName;
    if (plan.inputStage) return this.getIndexName(plan.inputStage);
    return null;
  }
}
```

---

## 9. Slow Query Monitoring

### 9.1 MongoDB Profiler

**Enable Profiler**:

```javascript
// Enable profiling for queries >100ms
db.setProfilingLevel(1, { slowms: 100 });

// Check profiler status
db.getProfilingStatus();
// Output: { was: 1, slowms: 100, sampleRate: 1.0 }

// Query slow queries
db.system.profile.find({
  millis: { $gt: 100 }
}).sort({ ts: -1 }).limit(10);
```

**Profiler Output Example**:

```json
{
  "op": "query",
  "ns": "clenergize_activity.activity_data",
  "command": {
    "find": "activity_data",
    "filter": { "projectId": "ObjectId('...')" },
    "sort": { "createdAt": -1 },
    "limit": 100
  },
  "keysExamined": 5000,
  "docsExamined": 5000,
  "nreturned": 100,
  "responseLength": 50000,
  "millis": 450,
  "planSummary": "COLLSCAN",
  "ts": "2024-11-18T10:30:00.000Z",
  "client": "10.0.1.50:54321",
  "user": "clenergize_activity_user"
}
```

### 9.2 Application-Level Monitoring

```typescript
// Mongoose plugin for query monitoring
export function queryMonitoringPlugin(schema: Schema): void {
  schema.pre(/^find/, function(next) {
    this['_startTime'] = Date.now();
    next();
  });

  schema.post(/^find/, function(result, next) {
    const duration = Date.now() - this['_startTime'];

    if (duration > 100) { // Log slow queries
      const logger = new Logger('SlowQueryMonitor');
      logger.warn({
        message: 'Slow query detected',
        collection: this.model.collection.name,
        filter: JSON.stringify(this.getFilter()),
        sort: JSON.stringify(this.getOptions().sort),
        duration: `${duration}ms`
      });
    }

    next();
  });
}

// Apply to all schemas
ProjectSchema.plugin(queryMonitoringPlugin);
ActivityDataSchema.plugin(queryMonitoringPlugin);
```

### 9.3 CloudWatch Custom Metrics

```typescript
@Injectable()
export class QueryMetricsService {
  private cloudWatch: CloudWatchClient;

  constructor() {
    this.cloudWatch = new CloudWatchClient({ region: 'us-east-1' });
  }

  async recordQueryMetrics(
    operation: string,
    duration: number,
    collection: string
  ): Promise<void> {
    const command = new PutMetricDataCommand({
      Namespace: 'Clenergize/Database',
      MetricData: [
        {
          MetricName: 'QueryDuration',
          Value: duration,
          Unit: 'Milliseconds',
          Timestamp: new Date(),
          Dimensions: [
            { Name: 'Operation', Value: operation },
            { Name: 'Collection', Value: collection },
            { Name: 'Service', Value: process.env.SERVICE_NAME }
          ]
        }
      ]
    });

    await this.cloudWatch.send(command);
  }
}

// Usage in repository
async findProjects(organizationId: string): Promise<Project[]> {
  const startTime = Date.now();

  const projects = await this.projectModel
    .find({ organizationId })
    .exec();

  const duration = Date.now() - startTime;
  await this.metricsService.recordQueryMetrics('find', duration, 'projects');

  return projects;
}
```

### 9.4 Slow Query Alert System

```typescript
@Injectable()
export class SlowQueryAlertService {
  private readonly logger = new Logger(SlowQueryAlertService.name);

  async checkSlowQueries(): Promise<void> {
    // Query MongoDB profiler
    const db = this.connection.db;
    const slowQueries = await db.collection('system.profile')
      .find({
        millis: { $gt: 500 }, // >500ms
        ts: { $gt: new Date(Date.now() - 300000) } // Last 5 minutes
      })
      .sort({ millis: -1 })
      .limit(10)
      .toArray();

    if (slowQueries.length > 0) {
      this.logger.error({
        message: 'Slow queries detected',
        count: slowQueries.length,
        queries: slowQueries.map(q => ({
          collection: q.ns,
          operation: q.op,
          duration: q.millis,
          plan: q.planSummary,
          filter: q.command.filter
        }))
      });

      // Send alert to Slack/PagerDuty
      await this.alertService.sendAlert({
        severity: 'warning',
        title: 'Slow Database Queries Detected',
        description: `${slowQueries.length} queries exceeded 500ms threshold`,
        queries: slowQueries
      });
    }
  }
}

// Schedule check every 5 minutes
@Cron('*/5 * * * *')
async monitorSlowQueries(): Promise<void> {
  await this.slowQueryAlertService.checkSlowQueries();
}
```

---

## 10. Sharding Strategy

### 10.1 When to Shard

**Indicators that sharding is needed**:

```yaml
Data Size:
  - Current: >1 TB per collection
  - Growth: >100 GB/month
  - Working set: >RAM available

Throughput:
  - Read QPS: >10,000 per collection
  - Write QPS: >5,000 per collection
  - Connection pool: Consistently >80% utilization

Latency:
  - p95 response time: >200ms despite indexes
  - Replication lag: >10 seconds
```

**Current Status** (Sprint 0.1):

```yaml
Sharding Required: NO
Reason:
  - Data size: <100 GB total
  - QPS: <2,000 per service
  - Single replica set can handle load

Future Consideration:
  - activity_data collection (5M docs, 10 GB)
  - audit_logs collection (grows 1M docs/month)
  - Plan sharding for Year 2 (10x growth expected)
```

### 10.2 Shard Key Selection

**Criteria for Good Shard Key**:

1. **High Cardinality**: Many unique values
2. **Even Distribution**: Balanced data across shards
3. **Query Isolation**: Queries target single shard
4. **Monotonic Growth**: Avoid hotspots

**Shard Key Options for activity_data**:

```typescript
// ❌ POOR: _id (monotonically increasing)
// Problem: All writes go to single shard
sh.shardCollection('clenergize_activity.activity_data', { _id: 1 });

// ❌ POOR: projectId (skewed distribution)
// Problem: Large projects dominate single shard
sh.shardCollection('clenergize_activity.activity_data', { projectId: 1 });

// ✅ GOOD: Hashed _id
// Pros: Even distribution, no hotspots
// Cons: All queries scatter across shards
sh.shardCollection('clenergize_activity.activity_data', { _id: 'hashed' });

// ✅ BEST: Compound key (projectId + year)
// Pros: Query isolation, even distribution
// Cons: Requires projectId in all queries
sh.shardCollection('clenergize_activity.activity_data', {
  projectId: 1,
  year: 1
});
```

**Recommended Shard Keys** (Future):

```typescript
// activity_data: Compound key for query isolation
sh.shardCollection('clenergize_activity.activity_data', {
  projectId: 1,
  year: 1
});

// audit_logs: Hashed organizationId
sh.shardCollection('clenergize_audit.audit_logs', {
  organizationId: 'hashed'
});

// emission_calculations: Compound key
sh.shardCollection('clenergize_calculation.emission_calculations', {
  projectId: 1,
  calculatedAt: 1
});
```

### 10.3 Sharding Migration Plan

**Phase 1: Preparation** (Sprint 8-10)

```bash
# 1. Enable sharding on databases
mongosh --eval "sh.enableSharding('clenergize_activity')"
mongosh --eval "sh.enableSharding('clenergize_audit')"

# 2. Create shard key indexes
db.activity_data.createIndex({ projectId: 1, year: 1 });
db.audit_logs.createIndex({ organizationId: 'hashed' });

# 3. Test sharding in staging
sh.shardCollection('clenergize_activity.activity_data', {
  projectId: 1,
  year: 1
});
```

**Phase 2: Migration** (Sprint 11-12)

```bash
# 1. Shard empty collections first
sh.shardCollection('clenergize_activity.new_activity_data', {
  projectId: 1,
  year: 1
});

# 2. Migrate data in batches
mongodump --collection=activity_data --query='{"year":2024}'
mongorestore --collection=new_activity_data

# 3. Switch application to new collection
# 4. Drop old collection
```

**Phase 3: Monitoring** (Ongoing)

```typescript
// Check shard distribution
db.activity_data.getShardDistribution();
/*
Shard shard0 at shard0/mongo1:27017,mongo2:27017,mongo3:27017
 data : 3.2 GB docs : 2.5M chunks : 45
 estimated data per chunk : 72 MB
 estimated docs per chunk : 55555

Shard shard1 at shard1/mongo4:27017,mongo5:27017,mongo6:27017
 data : 3.1 GB docs : 2.4M chunks : 43
 estimated data per chunk : 73 MB
 estimated docs per chunk : 55813

Totals
 data : 6.3 GB docs : 4.9M chunks : 88
 Shard shard0 contains 50.79% data, 51.02% docs, 51.14% chunks
 Shard shard1 contains 49.21% data, 48.98% docs, 48.86% chunks
*/
```

---

## 11. Query Best Practices

### 11.1 General Guidelines

**DO**:

```typescript
// ✅ Use lean() for read-only queries (5x faster)
const projects = await this.projectModel
  .find({ organizationId })
  .lean()
  .exec();

// ✅ Select only needed fields
const users = await this.userModel
  .find({ status: 'ACTIVE' })
  .select('email firstName lastName')
  .lean()
  .exec();

// ✅ Use limit() to avoid large result sets
const recentLogs = await this.auditLogModel
  .find({ organizationId })
  .sort({ timestamp: -1 })
  .limit(100)
  .lean()
  .exec();

// ✅ Use indexes for sorting
const projects = await this.projectModel
  .find({ organizationId, status: 'ACTIVE' })
  .sort({ createdAt: -1 }) // Uses index
  .lean()
  .exec();

// ✅ Use projection in aggregation
db.activity_data.aggregate([
  { $match: { projectId: ObjectId('...') } },
  { $project: { category: 1, co2e: 1 } }, // Reduce document size early
  { $group: { _id: '$category', total: { $sum: '$co2e' } } }
]);
```

**DON'T**:

```typescript
// ❌ Don't fetch all documents
const allProjects = await this.projectModel.find({}).exec(); // No limit!

// ❌ Don't use regex without anchoring
const users = await this.userModel
  .find({ email: { $regex: /gmail/ } }) // COLLSCAN!
  .exec();
// Use: { $regex: /^user.*@gmail\.com$/ } (anchored)

// ❌ Don't use $where or $expr unnecessarily
const results = await this.model
  .find({ $where: 'this.field1 > this.field2' }) // COLLSCAN + slow!
  .exec();
// Use: Aggregation $expr or compute in application

// ❌ Don't sort without index
const sorted = await this.model
  .find({})
  .sort({ randomField: 1 }) // No index = in-memory sort!
  .exec();

// ❌ Don't use skip() for pagination (slow for large offsets)
const page10 = await this.model
  .find({})
  .skip(10000) // Scans 10,000 documents!
  .limit(100)
  .exec();
// Use: Cursor-based pagination with _id or timestamp
```

### 11.2 Cursor-Based Pagination

```typescript
// ❌ INEFFICIENT: Offset-based pagination
async findPage(page: number, pageSize: number): Promise<Project[]> {
  return this.projectModel
    .find({})
    .sort({ createdAt: -1 })
    .skip((page - 1) * pageSize) // Slow for page 100!
    .limit(pageSize)
    .exec();
}

// ✅ EFFICIENT: Cursor-based pagination
async findNextPage(
  organizationId: string,
  cursor?: string,
  pageSize: number = 20
): Promise<{ projects: Project[], nextCursor: string | null }> {
  const filter: any = { organizationId };

  if (cursor) {
    const [timestamp, id] = Buffer.from(cursor, 'base64')
      .toString()
      .split('|');
    filter.$or = [
      { createdAt: { $lt: new Date(timestamp) } },
      {
        createdAt: new Date(timestamp),
        _id: { $lt: new Types.ObjectId(id) }
      }
    ];
  }

  const projects = await this.projectModel
    .find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(pageSize + 1) // Fetch one extra to check if more pages
    .lean()
    .exec();

  const hasMore = projects.length > pageSize;
  const results = hasMore ? projects.slice(0, pageSize) : projects;

  const nextCursor = hasMore
    ? Buffer.from(
        `${results[results.length - 1].createdAt.toISOString()}|${results[results.length - 1]._id}`
      ).toString('base64')
    : null;

  return { projects: results, nextCursor };
}

// Usage
const page1 = await service.findNextPage('org123', null, 20);
// Returns: { projects: [...20 items], nextCursor: 'eyJjcmVhdGVkQXQiOiIyMDI0...' }

const page2 = await service.findNextPage('org123', page1.nextCursor, 20);
// Returns: { projects: [...20 more items], nextCursor: 'eyJjcmVhdGVkQXQiOiIyMDI0...' }
```

### 11.3 Bulk Operations

```typescript
// ❌ INEFFICIENT: Loop with individual inserts
for (const activity of activities) {
  await this.activityDataModel.create(activity); // 1,000 queries!
}

// ✅ EFFICIENT: Bulk insert
await this.activityDataModel.insertMany(activities, {
  ordered: false, // Continue on error
  lean: true
});

// ❌ INEFFICIENT: Loop with individual updates
for (const update of updates) {
  await this.projectModel.updateOne(
    { _id: update.id },
    { $set: { status: update.status } }
  ); // 1,000 queries!
}

// ✅ EFFICIENT: Bulk write
const bulkOps = updates.map(update => ({
  updateOne: {
    filter: { _id: update.id },
    update: { $set: { status: update.status } }
  }
}));

await this.projectModel.bulkWrite(bulkOps, {
  ordered: false
});
```

### 11.4 Query Timeout Protection

```typescript
// Set timeout for long-running queries
async findWithTimeout<T>(
  model: Model<T>,
  filter: any,
  timeoutMs: number = 30000
): Promise<T[]> {
  const query = model.find(filter);

  query.maxTimeMS(timeoutMs); // MongoDB-level timeout

  return Promise.race([
    query.exec(),
    new Promise<T[]>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Query timeout after ${timeoutMs}ms`)),
        timeoutMs + 1000 // App timeout slightly longer
      )
    )
  ]);
}

// Usage
try {
  const results = await this.findWithTimeout(
    this.activityDataModel,
    { projectId: id },
    5000 // 5 second timeout
  );
} catch (error) {
  if (error.message.includes('timeout')) {
    this.logger.error('Query timeout', { projectId: id });
    // Return cached data or error
  }
  throw error;
}
```

---

## 12. Performance Testing

### 12.1 Load Testing with K6

```javascript
// k6-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '5m', target: 50 },   // Stay at 50 users
    { duration: '1m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% requests <200ms
    http_req_failed: ['rate<0.01'],   // <1% failure rate
  },
};

export default function () {
  // Test 1: List projects
  const listResponse = http.get(
    'http://localhost:3002/api/v1/projects?organizationId=507f1f77bcf86cd799439011',
    {
      headers: { Authorization: `Bearer ${__ENV.ACCESS_TOKEN}` },
    }
  );
  check(listResponse, {
    'list projects status 200': (r) => r.status === 200,
    'list projects <100ms': (r) => r.timings.duration < 100,
  });

  sleep(1);

  // Test 2: Get project details
  const detailResponse = http.get(
    'http://localhost:3002/api/v1/projects/507f1f77bcf86cd799439012',
    {
      headers: { Authorization: `Bearer ${__ENV.ACCESS_TOKEN}` },
    }
  );
  check(detailResponse, {
    'get project status 200': (r) => r.status === 200,
    'get project <50ms': (r) => r.timings.duration < 50,
  });

  sleep(2);

  // Test 3: Query activity data
  const activityResponse = http.get(
    'http://localhost:3004/api/v1/activity-data?projectId=507f1f77bcf86cd799439012&year=2024',
    {
      headers: { Authorization: `Bearer ${__ENV.ACCESS_TOKEN}` },
    }
  );
  check(activityResponse, {
    'activity data status 200': (r) => r.status === 200,
    'activity data <200ms': (r) => r.timings.duration < 200,
  });

  sleep(3);
}
```

**Run Load Test**:

```bash
k6 run --vus 100 --duration 10m k6-load-test.js

# Output:
#   checks........................: 98.45% ✓ 29535  ✗ 465
#   http_req_duration..............: avg=85ms   min=12ms med=65ms max=450ms p(95)=185ms
#   http_req_failed................: 0.52%  ✓ 156    ✗ 29844
#   http_reqs......................: 30000  50/s
```

### 12.2 Query Performance Benchmarks

```typescript
// test/performance/query-benchmarks.spec.ts
describe('Query Performance Benchmarks', () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection();
    // Seed 1M activity records
    await seedActivityData(connection, 1000000);
  });

  it('should find activity data by project+year in <75ms (p95)', async () => {
    const timings: number[] = [];

    // Run 1000 queries
    for (let i = 0; i < 1000; i++) {
      const startTime = Date.now();

      await connection.db.collection('activity_data').find({
        projectId: new ObjectId('507f1f77bcf86cd799439012'),
        year: 2024
      }).toArray();

      timings.push(Date.now() - startTime);
    }

    const p95 = calculatePercentile(timings, 95);
    expect(p95).toBeLessThan(75);
  });

  it('should aggregate monthly emissions in <200ms (p95)', async () => {
    const timings: number[] = [];

    for (let i = 0; i < 100; i++) {
      const startTime = Date.now();

      await connection.db.collection('activity_data').aggregate([
        { $match: {
            projectId: new ObjectId('507f1f77bcf86cd799439012'),
            year: 2024
          }
        },
        { $group: {
            _id: { category: '$category', month: '$month' },
            totalCO2e: { $sum: '$co2e' }
          }
        }
      ]).toArray();

      timings.push(Date.now() - startTime);
    }

    const p95 = calculatePercentile(timings, 95);
    expect(p95).toBeLessThan(200);
  });
});

function calculatePercentile(values: number[], percentile: number): number {
  const sorted = values.sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index];
}
```

### 12.3 Index Usage Validation

```typescript
// test/performance/index-validation.spec.ts
describe('Index Usage Validation', () => {
  it('should use index for all critical queries', async () => {
    const queries = [
      {
        name: 'List active projects',
        collection: 'projects',
        query: { organizationId: ObjectId('...'), status: 'ACTIVE' },
        expectedIndex: 'organizationId_1_status_1_createdAt_-1'
      },
      {
        name: 'Find activity data by project+year',
        collection: 'activity_data',
        query: { projectId: ObjectId('...'), year: 2024 },
        expectedIndex: 'projectId_1_year_1'
      },
      {
        name: 'User login by email',
        collection: 'users',
        query: { email: 'user@example.com' },
        expectedIndex: 'email_1'
      }
    ];

    for (const testCase of queries) {
      const explain = await connection.db
        .collection(testCase.collection)
        .find(testCase.query)
        .explain('executionStats');

      const plan = explain.queryPlanner.winningPlan;
      const indexUsed = getIndexName(plan);

      expect(indexUsed).toBe(testCase.expectedIndex);
      expect(plan.stage).not.toBe('COLLSCAN');
      expect(explain.executionStats.executionTimeMillis).toBeLessThan(100);
    }
  });
});

function getIndexName(plan: any): string | null {
  if (plan.stage === 'IXSCAN') return plan.indexName;
  if (plan.inputStage) return getIndexName(plan.inputStage);
  return null;
}
```

---

## Summary

This MongoDB Query Optimization Strategy provides:

1. **92 Optimized Indexes** across 37 collections
2. **Top 20 Critical Query Patterns** with execution plans
3. **Aggregation Pipeline Best Practices** for complex queries
4. **Connection Pooling** configured per service load
5. **Read/Write Concerns** for data consistency
6. **Query Plan Analysis** tools and automation
7. **Slow Query Monitoring** with alerts
8. **Sharding Strategy** for future scale (Year 2)
9. **Query Best Practices** and anti-patterns
10. **Performance Testing** framework with K6

### Key Performance Improvements

| Metric | OLD System | NEW System | Improvement |
|--------|-----------|------------|-------------|
| p50 Query Time | 450ms | <50ms | 89% faster |
| p95 Query Time | 2,100ms | <200ms | 90% faster |
| Index Hit Rate | 57% | >95% | 67% improvement |
| Full Table Scans | 43% | <5% | 88% reduction |
| Slow Queries | 12,000/day | <100/day | 99% reduction |

### Next Steps

1. ✅ **Completed**: Query optimization strategy designed
2. **Next**: Performance SLOs - Define monitoring targets
3. **Next**: Implement query monitoring middleware
4. **Next**: Set up CloudWatch dashboards
5. **Next**: Configure slow query alerts

---

**Document Complete**: November 18, 2025
