# PHASE 3: Service Specification - Calculation Service

**Version**: 1.0.0
**Status**: Design Phase
**Last Updated**: November 18, 2025
**Owner**: Calculation Agent

---

## Table of Contents

1. [Service Overview](#service-overview)
2. [Functional Requirements](#functional-requirements)
3. [API Endpoints](#api-endpoints)
4. [Data Models](#data-models)
5. [Business Logic](#business-logic)
6. [Integration Points](#integration-points)
7. [Non-Functional Requirements](#non-functional-requirements)
8. [Testing Strategy](#testing-strategy)
9. [Deployment Configuration](#deployment-configuration)
10. [Migration from OLD System](#migration-from-old-system)

---

## 1. Service Overview

### 1.1 Purpose

The **Calculation Service** is the computational engine of the Clenergize V3 platform, responsible for:

- **GHG Protocol Calculations**: Calculate carbon emissions for Scope 1, 2, and 3 activities
- **Allocation Algorithms**: Distribute emissions across organizational hierarchies
- **Hierarchy Aggregation**: Roll up emissions from locations → subsidiaries → entities → companies
- **What-If Scenarios**: Support scenario modeling for emission reduction planning
- **Cache Management**: Intelligent invalidation of calculated results when source data changes
- **Calculation History**: Maintain audit trail of all calculations for compliance

### 1.2 Bounded Context

**Domain**: Calculation Context (part of Carbon Management Core Domain)

**Responsibilities**:
- Apply emission factors to activity data
- Execute calculation formulas based on GHG Protocol standards
- Manage calculation methods and versions
- Aggregate emissions across multiple dimensions (scope, category, time, geography, hierarchy)
- Support custom allocation rules (e.g., headcount, revenue, floor area)
- Publish calculation results for reporting

**NOT Responsible For**:
- Activity data collection (Activity Service)
- Emission factor management (Reference Service)
- Report generation (Reporting Service)
- User permissions (Identity Service)

### 1.3 Technology Stack

```yaml
Framework: NestJS 10+ (TypeScript)
Database: MongoDB 7+ (calculation-results collection)
Cache: Redis 7+ (calculation cache, invalidation queues)
Event Bus: AWS EventBridge (production), Redis Pub/Sub (local)
Queue: AWS SQS (calculation jobs)
Validation: Zod
Testing: Jest, Supertest
Documentation: OpenAPI 3.1 (Swagger)
```

### 1.4 Service Dependencies

```mermaid
graph TD
    A[Activity Service] -->|activity.data.verified.v1| C[Calculation Service]
    R[Reference Service] -->|Read: Emission Factors| C
    O[Organization Service] -->|Read: Hierarchy| C
    C -->|calculation.emission.calculated.v1| RE[Reporting Service]
    C -->|calculation.rollup.completed.v1| AU[Audit Service]
```

**Upstream Dependencies** (Services we depend on):
- Activity Service: Provides verified activity data
- Reference Service: Provides emission factors, conversion factors
- Organization Service: Provides hierarchy structure for aggregation

**Downstream Consumers** (Services that depend on us):
- Reporting Service: Consumes calculation results
- Audit Service: Logs all calculations
- Frontend: Displays results, triggers calculations

---

## 2. Functional Requirements

### 2.1 Core Features

#### F-CALC-001: Emission Calculation
**Description**: Calculate emissions using GHG Protocol methodologies

**Acceptance Criteria**:
- Support Scope 1, 2, 3 calculations
- Apply correct emission factors from Reference Service
- Handle multiple calculation methods (spend-based, activity-based, fuel-based)
- Support custom calculation formulas
- Validate all inputs before calculation
- Store calculation metadata (formula version, timestamp, user)

**Formula**:
```
Emission (tCO2e) = Activity Data × Emission Factor × Unit Conversion Factor
```

#### F-CALC-002: Hierarchy Aggregation
**Description**: Roll up emissions across organizational hierarchy

**Acceptance Criteria**:
- Aggregate from bottom-up: Location → Subsidiary → Entity → Company
- Support multiple aggregation dimensions (scope, category, time period)
- Handle missing data gracefully (partial aggregations)
- Detect circular references in hierarchy
- Cache aggregation results with invalidation
- Support point-in-time aggregations (historical hierarchy snapshots)

**Algorithm**:
```typescript
function aggregateHierarchy(nodeId: string, year: number): EmissionTotal {
  // 1. Get direct emissions for this node
  const directEmissions = getDirectEmissions(nodeId, year);

  // 2. Get all child nodes
  const children = getChildNodes(nodeId);

  // 3. Recursively aggregate child emissions
  const childEmissions = children.map(child =>
    aggregateHierarchy(child.id, year)
  );

  // 4. Sum direct + child emissions
  return {
    direct: directEmissions,
    indirect: sum(childEmissions),
    total: directEmissions + sum(childEmissions)
  };
}
```

#### F-CALC-003: Allocation Rules
**Description**: Allocate emissions based on custom business rules

**Acceptance Criteria**:
- Support allocation by: headcount, revenue, floor area, custom metrics
- Apply allocation proportionally across entities
- Handle zero-value denominators (fallback to equal distribution)
- Support multi-level allocations (e.g., first by revenue, then by headcount)
- Validate allocation percentages sum to 100%
- Audit all allocation calculations

**Example**:
```typescript
// Allocate shared energy emissions based on floor area
const sharedEmissions = 1000; // tCO2e
const allocations = [
  { entityId: 'E1', floorArea: 5000 },  // 50% = 500 tCO2e
  { entityId: 'E2', floorArea: 3000 },  // 30% = 300 tCO2e
  { entityId: 'E3', floorArea: 2000 }   // 20% = 200 tCO2e
];
const totalArea = sum(allocations.map(a => a.floorArea)); // 10000

allocations.forEach(allocation => {
  const proportion = allocation.floorArea / totalArea;
  const allocatedEmission = sharedEmissions * proportion;
  saveAllocation(allocation.entityId, allocatedEmission);
});
```

#### F-CALC-004: What-If Scenarios
**Description**: Model emission reduction scenarios

**Acceptance Criteria**:
- Create named scenarios (e.g., "2030 Net Zero Plan")
- Override activity data or emission factors for scenarios
- Compare scenario results to baseline
- Support scenario versioning
- Export scenario comparison reports
- Do not modify baseline data

**Workflow**:
```
1. User creates scenario: "Switch to Renewable Energy"
2. User overrides electricity emission factor: 0 kgCO2e/kWh
3. System recalculates emissions using override
4. System shows delta: -500 tCO2e (-25%)
5. User saves scenario for tracking
```

#### F-CALC-005: Calculation Triggers
**Description**: Automatic and manual calculation triggers

**Triggers**:
- **Automatic**: When `activity.data.verified.v1` event received
- **Manual**: User-initiated calculation via API
- **Scheduled**: Batch calculations at configured intervals
- **Bulk**: Recalculate entire project/year

**Idempotency**: Use `activityDataId + version` as calculation key

#### F-CALC-006: Calculation History
**Description**: Maintain complete audit trail of calculations

**Requirements**:
- Store every calculation with inputs, outputs, formula version
- Support time-travel queries (what was the emission on date X?)
- Track who triggered calculation and when
- Compare calculation versions (show what changed)
- Retain history indefinitely for compliance

### 2.2 Calculation Methods

| Method ID | Name | Scope | Formula | Use Case |
|-----------|------|-------|---------|----------|
| `CALC-001` | Fuel-Based Combustion | 1 | `Fuel Volume × Fuel EF × Heating Value` | Diesel generators, boilers |
| `CALC-002` | Distance-Based Transport | 1, 3 | `Distance × Passenger/Freight × Transport EF` | Company vehicles, logistics |
| `CALC-003` | Electricity Consumption | 2 | `kWh × Grid EF (location-based or market-based)` | Office electricity |
| `CALC-004` | Refrigerant Leakage | 1 | `Refrigerant Mass × GWP` | HVAC systems, cooling |
| `CALC-005` | Spend-Based | 3 | `Spend ($) × EEIO EF` | Purchased goods, services |
| `CALC-006` | Waste Disposal | 3 | `Waste Mass × Disposal Method EF` | Landfill, incineration |
| `CALC-007` | Employee Commuting | 3 | `Distance × Days × Commuters × Transport EF` | Daily commute |
| `CALC-008` | Business Travel | 3 | `Distance × Passengers × Flight Class EF` | Air, rail, hotel |

### 2.3 Uncertainty Quantification

Every calculation must include uncertainty estimates:

```typescript
interface CalculationResult {
  emission: number;              // Central estimate (tCO2e)
  uncertainty: {
    lower: number;               // 95% confidence interval lower bound
    upper: number;               // 95% confidence interval upper bound
    qualityScore: 1 | 2 | 3 | 4; // Data quality (1=measured, 4=estimated)
    sources: {
      activityData: number;      // % uncertainty from activity data
      emissionFactor: number;    // % uncertainty from emission factor
      model: number;             // % uncertainty from calculation model
    };
  };
}
```

**Uncertainty Propagation**:
```
Total Uncertainty = √(σ_activity² + σ_ef² + σ_model²)
```

---

## 3. API Endpoints

### 3.1 Calculation Execution

#### `POST /v1/calculations/single`
**Description**: Calculate emissions for a single activity data record

**Request**:
```typescript
{
  activityDataId: string;        // UUID of activity data
  emissionFactorId?: string;     // Optional: override default EF
  calculationMethod?: string;    // Optional: override method
  metadata?: {
    triggeredBy: string;         // User ID or 'system'
    reason: string;              // 'data_verified', 'manual_recalc', 'scenario'
  };
}
```

**Response** (200 OK):
```typescript
{
  calculationId: string;
  activityDataId: string;
  emission: number;              // tCO2e
  uncertainty: { ... };
  calculation: {
    method: string;
    formula: string;
    inputs: {
      activityValue: number;
      emissionFactor: number;
      conversionFactor: number;
    };
    version: string;             // Formula version (e.g., "GHG-2023")
  };
  calculatedAt: string;          // ISO 8601
  calculatedBy: string;          // User ID
}
```

**Error Responses**:
- `400 Bad Request`: Invalid activity data ID
- `404 Not Found`: Activity data not found
- `422 Unprocessable Entity`: Missing required fields (e.g., emission factor)
- `500 Internal Server Error`: Calculation failure

**Events Published**:
- `calculation.emission.calculated.v1`

---

#### `POST /v1/calculations/batch`
**Description**: Calculate emissions for multiple activity data records

**Request**:
```typescript
{
  activityDataIds: string[];     // Array of UUIDs (max 1000)
  options?: {
    parallel: boolean;           // Run calculations in parallel (default: true)
    continueOnError: boolean;    // Continue if some calculations fail
  };
}
```

**Response** (202 Accepted):
```typescript
{
  batchId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  totalCount: number;
  processedCount: number;
  failedCount: number;
  results: {
    activityDataId: string;
    calculationId?: string;
    status: 'success' | 'failed';
    error?: string;
  }[];
}
```

**Polling Endpoint**: `GET /v1/calculations/batch/{batchId}`

---

#### `POST /v1/calculations/project/{projectId}/recalculate`
**Description**: Recalculate all emissions for a project

**Path Parameters**:
- `projectId`: string (UUID)

**Query Parameters**:
- `year`: number (optional, defaults to all years)
- `scope`: 'Scope 1' | 'Scope 2' | 'Scope 3' (optional, defaults to all scopes)
- `force`: boolean (optional, bypass cache)

**Response** (202 Accepted):
```typescript
{
  jobId: string;
  status: 'queued';
  estimatedDuration: number;     // seconds
  affectedRecords: number;
}
```

**Job Status Endpoint**: `GET /v1/calculations/jobs/{jobId}`

---

### 3.2 Aggregation

#### `POST /v1/aggregations/hierarchy`
**Description**: Aggregate emissions across organizational hierarchy

**Request**:
```typescript
{
  rootNodeId: string;            // Start node (company, entity, subsidiary, location)
  year: number;
  dimensions?: {
    scope?: boolean;             // Group by scope (default: true)
    category?: boolean;          // Group by activity category (default: true)
    month?: boolean;             // Group by month (default: false)
  };
  includeChildren?: boolean;     // Include child nodes (default: true)
}
```

**Response** (200 OK):
```typescript
{
  aggregationId: string;
  rootNode: {
    id: string;
    name: string;
    type: 'Company' | 'Entity' | 'Subsidiary' | 'Location';
  };
  year: number;
  totals: {
    direct: number;              // Direct emissions (tCO2e)
    indirect: number;            // Child emissions (tCO2e)
    total: number;               // Direct + Indirect
  };
  byScope: {
    scope1: number;
    scope2: number;
    scope3: number;
  };
  byCategory: {
    [category: string]: number;
  };
  byMonth?: {
    jan: number, feb: number, ..., dec: number;
  };
  children?: [
    {
      nodeId: string;
      nodeName: string;
      emissions: number;
      percentage: number;        // % of parent total
    }
  ];
  calculatedAt: string;
  cacheHit: boolean;             // Was result served from cache?
}
```

**Caching**:
- Cache key: `hierarchy:{nodeId}:{year}:{dimensions}`
- TTL: 1 hour
- Invalidation: When any child activity data changes

---

#### `GET /v1/aggregations/comparison`
**Description**: Compare emissions across time periods or entities

**Query Parameters**:
- `entityIds`: string[] (comma-separated)
- `years`: number[] (comma-separated)
- `groupBy`: 'entity' | 'year' | 'scope' | 'category'

**Response** (200 OK):
```typescript
{
  comparison: {
    [groupKey: string]: {
      emission: number;
      percentage: number;        // % of total
      trend?: number;            // % change from previous period
    };
  };
  totals: {
    current: number;
    previous?: number;
    change?: number;             // Absolute change
    changePercent?: number;      // % change
  };
}
```

---

### 3.3 Allocation

#### `POST /v1/allocations/create`
**Description**: Create allocation rule for shared emissions

**Request**:
```typescript
{
  name: string;                  // "HQ Energy Allocation"
  emissionSourceId: string;      // Activity data or aggregation ID
  allocationType: 'headcount' | 'revenue' | 'floorArea' | 'custom';
  targets: [
    {
      entityId: string;
      allocationValue: number;   // Headcount, revenue, m², etc.
    }
  ];
  year: number;
  notes?: string;
}
```

**Response** (201 Created):
```typescript
{
  allocationId: string;
  totalEmission: number;         // Source emission (tCO2e)
  allocations: [
    {
      entityId: string;
      entityName: string;
      allocationValue: number;
      proportion: number;        // % (0-100)
      allocatedEmission: number; // tCO2e
    }
  ];
  validation: {
    sumOfProportions: number;    // Should be 100%
    isValid: boolean;
  };
}
```

**Validation Rules**:
- Sum of proportions must equal 100% (±0.01% tolerance)
- All allocation values must be > 0
- Target entities must exist and be active

---

#### `GET /v1/allocations/{allocationId}`
**Description**: Retrieve allocation details

**Response** (200 OK):
```typescript
{
  allocationId: string;
  name: string;
  allocationType: string;
  year: number;
  totalEmission: number;
  allocations: [ ... ];
  createdBy: string;
  createdAt: string;
  lastModifiedAt?: string;
}
```

---

### 3.4 Scenarios

#### `POST /v1/scenarios/create`
**Description**: Create what-if scenario

**Request**:
```typescript
{
  name: string;                  // "2030 Renewable Energy Transition"
  description?: string;
  projectId: string;
  baselineYear: number;
  targetYear?: number;
  overrides: [
    {
      type: 'emissionFactor' | 'activityData';
      targetId: string;          // EF ID or Activity Data ID
      newValue: number;
      reason?: string;
    }
  ];
}
```

**Response** (201 Created):
```typescript
{
  scenarioId: string;
  name: string;
  status: 'draft' | 'calculating' | 'completed';
  baseline: {
    totalEmission: number;
    byScope: { scope1, scope2, scope3 };
  };
  projected?: {
    totalEmission: number;
    byScope: { ... };
  };
  delta?: {
    absolute: number;            // tCO2e reduction
    percentage: number;          // % reduction
  };
}
```

---

#### `GET /v1/scenarios/{scenarioId}/results`
**Description**: Get scenario calculation results

**Response** (200 OK):
```typescript
{
  scenarioId: string;
  name: string;
  status: 'completed';
  calculatedAt: string;
  baseline: { ... },
  projected: { ... },
  delta: { ... },
  breakdown: {
    [category: string]: {
      baseline: number;
      projected: number;
      delta: number;
    };
  };
  assumptions: [
    {
      description: string;
      impact: number;            // tCO2e
    }
  ];
}
```

---

### 3.5 Calculation History

#### `GET /v1/calculations/history`
**Description**: Query calculation history

**Query Parameters**:
- `activityDataId`: string (optional)
- `projectId`: string (optional)
- `startDate`: ISO 8601 (optional)
- `endDate`: ISO 8601 (optional)
- `page`: number (default: 1)
- `limit`: number (default: 50, max: 100)

**Response** (200 OK):
```typescript
{
  calculations: [
    {
      calculationId: string;
      activityDataId: string;
      emission: number;
      calculatedAt: string;
      calculatedBy: string;
      method: string;
      version: string;
    }
  ];
  pagination: {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
  };
}
```

---

#### `GET /v1/calculations/{calculationId}/compare`
**Description**: Compare calculation versions

**Query Parameters**:
- `compareWith`: string (calculationId to compare)

**Response** (200 OK):
```typescript
{
  current: {
    calculationId: string;
    emission: number;
    calculatedAt: string;
    inputs: { ... };
  };
  previous: {
    calculationId: string;
    emission: number;
    calculatedAt: string;
    inputs: { ... };
  };
  differences: {
    emissionDelta: number;
    percentageChange: number;
    changedInputs: [
      {
        field: string;
        oldValue: any;
        newValue: any;
      }
    ];
  };
}
```

---

### 3.6 Cache Management

#### `DELETE /v1/cache/invalidate`
**Description**: Invalidate calculation cache (admin only)

**Request**:
```typescript
{
  scope: 'project' | 'entity' | 'activityData' | 'all';
  targetId?: string;             // Required unless scope='all'
  reason: string;
}
```

**Response** (200 OK):
```typescript
{
  invalidatedKeys: number;
  affectedCalculations: number;
  timestamp: string;
}
```

**Events Published**:
- `calculation.cache.invalidated.v1`

---

## 4. Data Models

### 4.1 MongoDB Collections

#### Collection: `calculation_results`

```typescript
interface CalculationResult {
  _id: ObjectId;
  calculationId: string;         // UUID
  activityDataId: ObjectId;
  projectId: ObjectId;
  entityId: ObjectId;
  year: number;
  month?: number;                // 1-12 (optional)

  // Calculation inputs
  inputs: {
    activityValue: number;
    activityUom: string;
    emissionFactorId: ObjectId;
    emissionFactorValue: number;
    emissionFactorUom: string;
    conversionFactor: number;
    conversionFactorSource: string;
  };

  // Calculation method
  method: {
    id: string;                  // CALC-001, CALC-002, etc.
    name: string;
    version: string;             // GHG-2023, ISO-14064, etc.
    formula: string;             // Human-readable formula
  };

  // Calculation results
  results: {
    emission: number;            // tCO2e
    co2: number;                 // tCO2
    ch4: number;                 // tCH4 (converted to CO2e)
    n2o: number;                 // tN2O (converted to CO2e)
    uncertainty: {
      lower: number;
      upper: number;
      qualityScore: 1 | 2 | 3 | 4;
      sources: {
        activityData: number;
        emissionFactor: number;
        model: number;
      };
    };
  };

  // GHG categorization
  scope: 'Scope 1' | 'Scope 2' | 'Scope 3';
  category: string;              // Activity category
  subcategory?: string;

  // Metadata
  calculatedAt: Date;
  calculatedBy: ObjectId;        // User ID
  trigger: 'automatic' | 'manual' | 'batch' | 'scenario';
  scenarioId?: ObjectId;

  // Version tracking
  version: number;               // Calculation version for this activity data
  supersededBy?: ObjectId;       // Next calculation ID (if recalculated)
  supersedes?: ObjectId;         // Previous calculation ID

  // Audit fields
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
```javascript
db.calculation_results.createIndex({ calculationId: 1 }, { unique: true });
db.calculation_results.createIndex({ activityDataId: 1, version: -1 });
db.calculation_results.createIndex({ projectId: 1, year: 1, scope: 1 });
db.calculation_results.createIndex({ entityId: 1, year: 1 });
db.calculation_results.createIndex({ calculatedAt: -1 });
db.calculation_results.createIndex({ 'results.emission': -1 });
```

---

#### Collection: `aggregations`

```typescript
interface Aggregation {
  _id: ObjectId;
  aggregationId: string;         // UUID
  rootNodeId: ObjectId;
  rootNodeType: 'Company' | 'Entity' | 'Subsidiary' | 'Location';
  year: number;

  // Aggregation configuration
  dimensions: {
    scope: boolean;
    category: boolean;
    month: boolean;
  };
  includeChildren: boolean;

  // Aggregation results
  totals: {
    direct: number;              // Direct emissions
    indirect: number;            // Child emissions
    total: number;
  };

  byScope?: {
    scope1: number;
    scope2: number;
    scope3: number;
  };

  byCategory?: {
    [category: string]: number;
  };

  byMonth?: {
    jan: number, feb: number, mar: number,
    apr: number, may: number, jun: number,
    jul: number, aug: number, sep: number,
    oct: number, nov: number, dec: number
  };

  // Child breakdown
  children?: {
    nodeId: ObjectId;
    nodeName: string;
    nodeType: string;
    emissions: number;
    percentage: number;
  }[];

  // Cache metadata
  calculatedAt: Date;
  cacheKey: string;
  ttl: number;                   // seconds

  // Source tracking
  sourceCalculations: ObjectId[]; // Calculation IDs used

  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
```javascript
db.aggregations.createIndex({ aggregationId: 1 }, { unique: true });
db.aggregations.createIndex({ cacheKey: 1 }, { unique: true });
db.aggregations.createIndex({ rootNodeId: 1, year: 1 });
db.aggregations.createIndex({ calculatedAt: -1 });
```

---

#### Collection: `allocations`

```typescript
interface Allocation {
  _id: ObjectId;
  allocationId: string;          // UUID
  name: string;
  description?: string;

  // Source emission
  emissionSource: {
    type: 'activityData' | 'aggregation';
    id: ObjectId;
    totalEmission: number;       // tCO2e to allocate
  };

  // Allocation method
  allocationType: 'headcount' | 'revenue' | 'floorArea' | 'custom';
  year: number;

  // Allocation targets
  targets: {
    entityId: ObjectId;
    entityName: string;
    allocationValue: number;     // Metric value (e.g., 100 employees)
    proportion: number;          // % (0-100)
    allocatedEmission: number;   // tCO2e
  }[];

  // Validation
  validation: {
    sumOfProportions: number;
    isValid: boolean;
    errors?: string[];
  };

  // Status
  status: 'draft' | 'active' | 'archived';

  // Metadata
  projectId: ObjectId;
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date;
}
```

**Indexes**:
```javascript
db.allocations.createIndex({ allocationId: 1 }, { unique: true });
db.allocations.createIndex({ projectId: 1, year: 1 });
db.allocations.createIndex({ status: 1 });
db.allocations.createIndex({ 'targets.entityId': 1 });
```

---

#### Collection: `scenarios`

```typescript
interface Scenario {
  _id: ObjectId;
  scenarioId: string;            // UUID
  name: string;
  description?: string;

  // Scope
  projectId: ObjectId;
  baselineYear: number;
  targetYear?: number;

  // Scenario configuration
  overrides: {
    type: 'emissionFactor' | 'activityData';
    targetId: ObjectId;
    originalValue: number;
    newValue: number;
    reason?: string;
  }[];

  // Calculation status
  status: 'draft' | 'calculating' | 'completed' | 'failed';

  // Results
  baseline?: {
    totalEmission: number;
    byScope: {
      scope1: number;
      scope2: number;
      scope3: number;
    };
    calculatedAt: Date;
  };

  projected?: {
    totalEmission: number;
    byScope: { ... };
    calculatedAt: Date;
  };

  delta?: {
    absolute: number;
    percentage: number;
  };

  breakdown?: {
    [category: string]: {
      baseline: number;
      projected: number;
      delta: number;
    };
  };

  // Metadata
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  calculatedAt?: Date;
}
```

**Indexes**:
```javascript
db.scenarios.createIndex({ scenarioId: 1 }, { unique: true });
db.scenarios.createIndex({ projectId: 1, status: 1 });
db.scenarios.createIndex({ createdBy: 1 });
db.scenarios.createIndex({ createdAt: -1 });
```

---

#### Collection: `calculation_methods`

```typescript
interface CalculationMethod {
  _id: ObjectId;
  methodId: string;              // CALC-001, CALC-002, etc.
  name: string;
  description: string;

  // Applicable scopes
  scopes: ('Scope 1' | 'Scope 2' | 'Scope 3')[];
  categories: string[];          // Activity categories

  // Formula definition
  formula: {
    expression: string;          // "activityValue * emissionFactor * conversionFactor"
    variables: {
      name: string;
      description: string;
      unit: string;
      required: boolean;
    }[];
  };

  // Validation rules
  validation: {
    requiredFields: string[];
    constraints: {
      field: string;
      rule: string;              // "min:0", "max:100", "enum:A,B,C"
    }[];
  };

  // Uncertainty parameters
  uncertainty: {
    activityData: { min: number, max: number };  // % range
    emissionFactor: { min: number, max: number };
    model: number;               // Fixed model uncertainty %
  };

  // Version
  version: string;               // GHG-2023
  standard: string;              // "GHG Protocol", "ISO 14064-1"
  publishedDate: Date;

  // Status
  status: 'draft' | 'active' | 'deprecated';

  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
```javascript
db.calculation_methods.createIndex({ methodId: 1, version: 1 }, { unique: true });
db.calculation_methods.createIndex({ status: 1 });
db.calculation_methods.createIndex({ scopes: 1, categories: 1 });
```

---

### 4.2 Redis Cache Schema

#### Cache Key Patterns

```typescript
// Calculation results cache
const CALC_CACHE_KEY = `calc:${activityDataId}:${version}`;
const CALC_TTL = 3600; // 1 hour

// Aggregation cache
const AGG_CACHE_KEY = `agg:${nodeId}:${year}:${dimensions}`;
const AGG_TTL = 3600; // 1 hour

// Emission factor cache (from Reference Service)
const EF_CACHE_KEY = `ef:${parameterId}:${year}`;
const EF_TTL = 86400; // 24 hours

// Hierarchy snapshot cache
const HIERARCHY_CACHE_KEY = `hierarchy:${nodeId}:${year}`;
const HIERARCHY_TTL = 3600; // 1 hour
```

#### Cache Invalidation Queue

```typescript
interface CacheInvalidationMessage {
  type: 'activityData' | 'emissionFactor' | 'hierarchy';
  targetId: string;
  reason: string;
  timestamp: string;
  cascadeInvalidation: boolean;  // Invalidate dependent caches
}
```

---

## 5. Business Logic

### 5.1 Calculation Engine

#### Core Calculation Flow

```typescript
class CalculationEngine {
  async calculateEmission(
    activityDataId: string,
    options?: CalculationOptions
  ): Promise<CalculationResult> {

    // Step 1: Fetch activity data
    const activityData = await this.activityServiceClient.getActivityData(activityDataId);
    if (!activityData.isVerified) {
      throw new UnverifiedActivityDataError(activityDataId);
    }

    // Step 2: Determine calculation method
    const method = await this.getCalculationMethod(
      activityData.scope,
      activityData.category
    );

    // Step 3: Fetch emission factor
    const emissionFactor = await this.getEmissionFactor(
      activityData.parameterId,
      activityData.year,
      activityData.region
    );

    if (!emissionFactor) {
      throw new MissingEmissionFactorError(activityData.parameterId);
    }

    // Step 4: Get conversion factor (if needed)
    const conversionFactor = await this.getConversionFactor(
      activityData.uom,
      emissionFactor.uom
    );

    // Step 5: Execute calculation
    const emission = this.executeFormula(method.formula, {
      activityValue: activityData.quantityConsumed,
      emissionFactor: emissionFactor.value,
      conversionFactor: conversionFactor
    });

    // Step 6: Calculate uncertainty
    const uncertainty = this.calculateUncertainty({
      activityData,
      emissionFactor,
      method
    });

    // Step 7: Store result
    const result = await this.calculationRepository.save({
      calculationId: uuid(),
      activityDataId,
      projectId: activityData.projectId,
      entityId: activityData.entityId,
      year: activityData.year,
      month: activityData.month,
      inputs: {
        activityValue: activityData.quantityConsumed,
        activityUom: activityData.uom,
        emissionFactorId: emissionFactor.id,
        emissionFactorValue: emissionFactor.value,
        emissionFactorUom: emissionFactor.uom,
        conversionFactor,
        conversionFactorSource: 'IPCC-2021'
      },
      method: {
        id: method.methodId,
        name: method.name,
        version: method.version,
        formula: method.formula.expression
      },
      results: {
        emission,
        co2: emission * 0.95,  // Example breakdown
        ch4: emission * 0.03,
        n2o: emission * 0.02,
        uncertainty
      },
      scope: activityData.scope,
      category: activityData.category,
      calculatedAt: new Date(),
      calculatedBy: options?.userId || 'system',
      trigger: options?.trigger || 'automatic',
      version: await this.getNextVersion(activityDataId)
    });

    // Step 8: Publish event
    await this.eventBus.publish({
      type: 'calculation.emission.calculated.v1',
      aggregateId: result.calculationId,
      aggregateType: 'CalculationResult',
      data: {
        calculationId: result.calculationId,
        activityDataId: result.activityDataId,
        emission: result.results.emission,
        scope: result.scope,
        category: result.category,
        year: result.year
      }
    });

    // Step 9: Invalidate aggregation cache
    await this.invalidateAggregationCache(activityData.entityId, activityData.year);

    return result;
  }

  private executeFormula(
    formula: string,
    variables: Record<string, number>
  ): number {
    // SECURITY: Use safe math parser (DO NOT use eval!)
    const parser = new MathParser();
    return parser.evaluate(formula, variables);
  }

  private calculateUncertainty(inputs: {
    activityData: ActivityData;
    emissionFactor: EmissionFactor;
    method: CalculationMethod;
  }): Uncertainty {
    // Combine uncertainties using propagation of uncertainty formula
    const activityUncertainty = inputs.activityData.uncertainty || 10; // %
    const efUncertainty = inputs.emissionFactor.uncertainty || 15; // %
    const modelUncertainty = inputs.method.uncertainty.model || 5; // %

    const totalUncertainty = Math.sqrt(
      Math.pow(activityUncertainty, 2) +
      Math.pow(efUncertainty, 2) +
      Math.pow(modelUncertainty, 2)
    );

    const emission = /* calculated emission */;

    return {
      lower: emission * (1 - totalUncertainty / 100),
      upper: emission * (1 + totalUncertainty / 100),
      qualityScore: this.determineQualityScore(activityUncertainty),
      sources: {
        activityData: activityUncertainty,
        emissionFactor: efUncertainty,
        model: modelUncertainty
      }
    };
  }

  private determineQualityScore(uncertainty: number): 1 | 2 | 3 | 4 {
    // GHG Protocol data quality scoring
    if (uncertainty < 5) return 1;   // Measured, high quality
    if (uncertainty < 15) return 2;  // Calculated, good quality
    if (uncertainty < 30) return 3;  // Estimated, fair quality
    return 4;                        // Proxy/assumption, low quality
  }
}
```

---

### 5.2 Hierarchy Aggregation

#### Aggregation Algorithm

```typescript
class HierarchyAggregator {
  async aggregateNode(
    nodeId: string,
    year: number,
    options: AggregationOptions
  ): Promise<Aggregation> {

    // Check cache first
    const cacheKey = this.generateCacheKey(nodeId, year, options.dimensions);
    const cached = await this.cache.get<Aggregation>(cacheKey);

    if (cached && !options.force) {
      return { ...cached, cacheHit: true };
    }

    // Fetch node details
    const node = await this.organizationServiceClient.getNode(nodeId);

    // Get direct emissions for this node
    const directEmissions = await this.getDirectEmissions(nodeId, year);

    // Get child nodes
    const children = options.includeChildren
      ? await this.organizationServiceClient.getChildren(nodeId)
      : [];

    // Recursively aggregate children
    const childAggregations = await Promise.all(
      children.map(child => this.aggregateNode(child.id, year, options))
    );

    // Sum up totals
    const totals = {
      direct: this.sumEmissions(directEmissions),
      indirect: this.sumEmissions(childAggregations.map(agg => agg.totals.total)),
      total: 0  // Calculated below
    };
    totals.total = totals.direct + totals.indirect;

    // Group by dimensions
    const byScope = options.dimensions.scope
      ? this.groupByScope(directEmissions, childAggregations)
      : undefined;

    const byCategory = options.dimensions.category
      ? this.groupByCategory(directEmissions, childAggregations)
      : undefined;

    const byMonth = options.dimensions.month
      ? this.groupByMonth(directEmissions, childAggregations)
      : undefined;

    // Create aggregation result
    const aggregation: Aggregation = {
      aggregationId: uuid(),
      rootNodeId: nodeId,
      rootNodeType: node.type,
      year,
      dimensions: options.dimensions,
      includeChildren: options.includeChildren,
      totals,
      byScope,
      byCategory,
      byMonth,
      children: children.map((child, i) => ({
        nodeId: child.id,
        nodeName: child.name,
        nodeType: child.type,
        emissions: childAggregations[i].totals.total,
        percentage: (childAggregations[i].totals.total / totals.total) * 100
      })),
      calculatedAt: new Date(),
      cacheKey,
      ttl: 3600,
      sourceCalculations: this.extractCalculationIds(directEmissions, childAggregations)
    };

    // Save to database
    await this.aggregationRepository.save(aggregation);

    // Cache result
    await this.cache.set(cacheKey, aggregation, { ttl: 3600 });

    // Publish event
    await this.eventBus.publish({
      type: 'calculation.rollup.completed.v1',
      aggregateId: aggregation.aggregationId,
      aggregateType: 'Aggregation',
      data: {
        nodeId,
        year,
        totalEmission: totals.total,
        childCount: children.length
      }
    });

    return { ...aggregation, cacheHit: false };
  }

  private async getDirectEmissions(
    nodeId: string,
    year: number
  ): Promise<CalculationResult[]> {
    return await this.calculationRepository.find({
      entityId: nodeId,
      year
    });
  }

  private groupByScope(
    directEmissions: CalculationResult[],
    childAggregations: Aggregation[]
  ): { scope1: number, scope2: number, scope3: number } {
    const direct = {
      scope1: this.sumByScope(directEmissions, 'Scope 1'),
      scope2: this.sumByScope(directEmissions, 'Scope 2'),
      scope3: this.sumByScope(directEmissions, 'Scope 3')
    };

    const indirect = childAggregations.reduce(
      (acc, agg) => ({
        scope1: acc.scope1 + (agg.byScope?.scope1 || 0),
        scope2: acc.scope2 + (agg.byScope?.scope2 || 0),
        scope3: acc.scope3 + (agg.byScope?.scope3 || 0)
      }),
      { scope1: 0, scope2: 0, scope3: 0 }
    );

    return {
      scope1: direct.scope1 + indirect.scope1,
      scope2: direct.scope2 + indirect.scope2,
      scope3: direct.scope3 + indirect.scope3
    };
  }
}
```

---

### 5.3 Allocation Engine

#### Proportional Allocation

```typescript
class AllocationEngine {
  async createAllocation(
    data: CreateAllocationDto
  ): Promise<Allocation> {

    // Step 1: Get source emission
    const sourceEmission = await this.getSourceEmission(
      data.emissionSourceId,
      data.emissionSourceType
    );

    // Step 2: Validate allocation values
    const totalAllocationValue = data.targets.reduce(
      (sum, target) => sum + target.allocationValue,
      0
    );

    if (totalAllocationValue === 0) {
      throw new InvalidAllocationError('Total allocation value cannot be zero');
    }

    // Step 3: Calculate proportions
    const allocations = data.targets.map(target => {
      const proportion = (target.allocationValue / totalAllocationValue) * 100;
      const allocatedEmission = (sourceEmission * target.allocationValue) / totalAllocationValue;

      return {
        entityId: target.entityId,
        entityName: target.entityName || 'Unknown',
        allocationValue: target.allocationValue,
        proportion,
        allocatedEmission
      };
    });

    // Step 4: Validate sum of proportions
    const sumOfProportions = allocations.reduce(
      (sum, alloc) => sum + alloc.proportion,
      0
    );

    const isValid = Math.abs(sumOfProportions - 100) < 0.01; // 0.01% tolerance

    if (!isValid) {
      throw new InvalidAllocationError(
        `Sum of proportions (${sumOfProportions}%) must equal 100%`
      );
    }

    // Step 5: Create allocation record
    const allocation: Allocation = {
      allocationId: uuid(),
      name: data.name,
      description: data.description,
      emissionSource: {
        type: data.emissionSourceType,
        id: data.emissionSourceId,
        totalEmission: sourceEmission
      },
      allocationType: data.allocationType,
      year: data.year,
      targets: allocations,
      validation: {
        sumOfProportions,
        isValid
      },
      status: 'active',
      projectId: data.projectId,
      createdBy: data.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Step 6: Save allocation
    await this.allocationRepository.save(allocation);

    // Step 7: Create activity data records for allocated emissions
    for (const alloc of allocations) {
      await this.createAllocatedActivityData({
        entityId: alloc.entityId,
        year: data.year,
        emission: alloc.allocatedEmission,
        allocationId: allocation.allocationId,
        sourceId: data.emissionSourceId
      });
    }

    // Step 8: Publish event
    await this.eventBus.publish({
      type: 'calculation.allocation.created.v1',
      aggregateId: allocation.allocationId,
      aggregateType: 'Allocation',
      data: {
        allocationId: allocation.allocationId,
        totalEmission: sourceEmission,
        targetCount: allocations.length,
        allocationType: data.allocationType
      }
    });

    return allocation;
  }
}
```

---

### 5.4 Scenario Modeling

#### What-If Scenario Engine

```typescript
class ScenarioEngine {
  async createScenario(
    data: CreateScenarioDto
  ): Promise<Scenario> {

    // Step 1: Calculate baseline emissions
    const baseline = await this.calculateBaseline(
      data.projectId,
      data.baselineYear
    );

    // Step 2: Create scenario
    const scenario: Scenario = {
      scenarioId: uuid(),
      name: data.name,
      description: data.description,
      projectId: data.projectId,
      baselineYear: data.baselineYear,
      targetYear: data.targetYear,
      overrides: data.overrides,
      status: 'draft',
      baseline: {
        totalEmission: baseline.total,
        byScope: baseline.byScope,
        calculatedAt: new Date()
      },
      createdBy: data.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.scenarioRepository.save(scenario);

    // Step 3: Queue scenario calculation
    await this.queueScenarioCalculation(scenario.scenarioId);

    return scenario;
  }

  async calculateScenario(scenarioId: string): Promise<void> {
    const scenario = await this.scenarioRepository.findOne({ scenarioId });

    if (!scenario) {
      throw new ScenarioNotFoundError(scenarioId);
    }

    // Update status
    await this.scenarioRepository.updateOne(
      { scenarioId },
      { status: 'calculating' }
    );

    try {
      // Step 1: Get all activity data for project/year
      const activityData = await this.activityServiceClient.getActivityData({
        projectId: scenario.projectId,
        year: scenario.targetYear || scenario.baselineYear
      });

      // Step 2: Apply overrides
      const modifiedData = this.applyOverrides(activityData, scenario.overrides);

      // Step 3: Recalculate emissions with overrides
      const calculations = await Promise.all(
        modifiedData.map(data => this.calculationEngine.calculateEmission(
          data.id,
          { scenarioId, overrides: data.overrides }
        ))
      );

      // Step 4: Aggregate results
      const projected = {
        totalEmission: this.sumEmissions(calculations),
        byScope: this.groupByScope(calculations),
        calculatedAt: new Date()
      };

      // Step 5: Calculate delta
      const delta = {
        absolute: projected.totalEmission - scenario.baseline.totalEmission,
        percentage: ((projected.totalEmission - scenario.baseline.totalEmission) /
                    scenario.baseline.totalEmission) * 100
      };

      // Step 6: Create breakdown
      const breakdown = this.createBreakdown(
        scenario.baseline,
        projected,
        calculations
      );

      // Step 7: Update scenario with results
      await this.scenarioRepository.updateOne(
        { scenarioId },
        {
          status: 'completed',
          projected,
          delta,
          breakdown,
          calculatedAt: new Date()
        }
      );

      // Step 8: Publish event
      await this.eventBus.publish({
        type: 'calculation.scenario.completed.v1',
        aggregateId: scenarioId,
        aggregateType: 'Scenario',
        data: {
          scenarioId,
          baselineEmission: scenario.baseline.totalEmission,
          projectedEmission: projected.totalEmission,
          reduction: -delta.absolute,
          reductionPercentage: -delta.percentage
        }
      });

    } catch (error) {
      await this.scenarioRepository.updateOne(
        { scenarioId },
        { status: 'failed' }
      );
      throw error;
    }
  }

  private applyOverrides(
    activityData: ActivityData[],
    overrides: ScenarioOverride[]
  ): ModifiedActivityData[] {
    return activityData.map(data => {
      const override = overrides.find(o =>
        o.type === 'activityData' && o.targetId === data.id
      );

      if (override) {
        return {
          ...data,
          quantityConsumed: override.newValue,
          overrides: [override]
        };
      }

      return { ...data, overrides: [] };
    });
  }
}
```

---

### 5.5 Cache Invalidation Strategy

#### Smart Cache Invalidation

```typescript
class CacheInvalidationService {
  async invalidateOnActivityDataChange(
    activityDataId: string
  ): Promise<void> {
    // Get activity data details
    const activityData = await this.activityServiceClient.getActivityData(activityDataId);

    // Invalidate calculation cache
    const calcCacheKey = `calc:${activityDataId}:*`;
    await this.cache.del(calcCacheKey);

    // Invalidate aggregation caches for all parent nodes
    await this.invalidateHierarchyCache(
      activityData.entityId,
      activityData.year
    );

    // Publish invalidation event
    await this.eventBus.publish({
      type: 'calculation.cache.invalidated.v1',
      aggregateId: activityDataId,
      aggregateType: 'ActivityData',
      data: {
        reason: 'activity_data_changed',
        affectedEntity: activityData.entityId,
        affectedYear: activityData.year
      }
    });
  }

  private async invalidateHierarchyCache(
    entityId: string,
    year: number
  ): Promise<void> {
    // Get all parent nodes in hierarchy
    const parents = await this.organizationServiceClient.getParentChain(entityId);

    // Invalidate aggregation cache for this node and all parents
    const nodesToInvalidate = [entityId, ...parents.map(p => p.id)];

    for (const nodeId of nodesToInvalidate) {
      const aggCacheKey = `agg:${nodeId}:${year}:*`;
      await this.cache.del(aggCacheKey);
    }
  }

  @EventsHandler('activity.data.verified.v1')
  async onActivityDataVerified(event: ActivityDataVerifiedEvent): Promise<void> {
    // Trigger automatic calculation
    await this.calculationEngine.calculateEmission(
      event.data.activityDataId,
      { trigger: 'automatic', userId: 'system' }
    );
  }

  @EventsHandler('reference.emission-factor.updated.v1')
  async onEmissionFactorUpdated(event: EmissionFactorUpdatedEvent): Promise<void> {
    // Invalidate emission factor cache
    const efCacheKey = `ef:${event.data.emissionFactorId}:*`;
    await this.cache.del(efCacheKey);

    // Find all calculations using this emission factor
    const affectedCalculations = await this.calculationRepository.find({
      'inputs.emissionFactorId': event.data.emissionFactorId
    });

    // Queue recalculations
    for (const calc of affectedCalculations) {
      await this.queueRecalculation(calc.activityDataId);
    }
  }
}
```

---

## 6. Integration Points

### 6.1 Activity Service

**Dependency Type**: Strong (Upstream)

**Integration Method**: Event-Driven + REST

**Events Consumed**:
```typescript
'activity.data.verified.v1' => Trigger automatic calculation
'activity.data.updated.v1' => Invalidate calculation cache
'activity.data.deleted.v1' => Mark calculations as obsolete
```

**REST Calls**:
```typescript
GET /v1/activity-data/{activityDataId}
  Purpose: Fetch activity data for calculation

GET /v1/activity-data/batch?ids={ids}
  Purpose: Batch fetch for multiple calculations

GET /v1/activity-data/project/{projectId}?year={year}
  Purpose: Get all activity data for project recalculation
```

---

### 6.2 Reference Service

**Dependency Type**: Strong (Upstream)

**Integration Method**: REST + Cache

**REST Calls**:
```typescript
GET /v1/emission-factors/{parameterId}?year={year}&region={region}
  Purpose: Fetch emission factor for calculation
  Cache: 24 hours (invalidate on EF update event)

GET /v1/conversion-factors?from={uom}&to={targetUom}
  Purpose: Get unit conversion factors
  Cache: 7 days (static data)

GET /v1/parameters/{parameterId}
  Purpose: Get parameter metadata (name, category, etc.)
  Cache: 24 hours
```

**Events Consumed**:
```typescript
'reference.emission-factor.updated.v1' => Invalidate cache, queue recalculations
'reference.emission-factor.created.v1' => Clear cache
```

---

### 6.3 Organization Service

**Dependency Type**: Moderate (Upstream)

**Integration Method**: REST + Cache

**REST Calls**:
```typescript
GET /v1/entities/{entityId}
  Purpose: Get entity details for aggregation
  Cache: 1 hour

GET /v1/entities/{entityId}/children
  Purpose: Get child nodes for hierarchy aggregation
  Cache: 1 hour

GET /v1/entities/{entityId}/parents
  Purpose: Get parent chain for cache invalidation
  Cache: 1 hour

GET /v1/hierarchy/snapshot?nodeId={id}&date={date}
  Purpose: Point-in-time hierarchy for historical calculations
  Cache: Permanent (historical data doesn't change)
```

**Events Consumed**:
```typescript
'organization.hierarchy.modified.v1' => Invalidate hierarchy cache
'organization.entity.deleted.v1' => Mark calculations as orphaned
```

---

### 6.4 Reporting Service

**Dependency Type**: Weak (Downstream)

**Integration Method**: Event-Driven

**Events Published**:
```typescript
'calculation.emission.calculated.v1' => Notify new calculation available
'calculation.rollup.completed.v1' => Notify aggregation completed
'calculation.scenario.completed.v1' => Notify scenario results ready
```

---

### 6.5 Audit Service

**Dependency Type**: Weak (Downstream)

**Integration Method**: Event-Driven

**Events Published** (all calculation events for audit trail):
```typescript
'calculation.emission.calculated.v1'
'calculation.batch.completed.v1'
'calculation.allocation.created.v1'
'calculation.scenario.completed.v1'
'calculation.cache.invalidated.v1'
```

---

### 6.6 Frontend

**Integration Method**: REST API

**Key Endpoints Used**:
- `POST /v1/calculations/single` - Manual calculation trigger
- `GET /v1/aggregations/hierarchy` - Dashboard emissions display
- `POST /v1/scenarios/create` - What-if modeling
- `GET /v1/calculations/history` - Audit trail view

---

## 7. Non-Functional Requirements

### 7.1 Performance

| Metric | Target | Critical Path |
|--------|--------|---------------|
| **Single Calculation** | < 100ms p95 | Cache EF, optimize DB queries |
| **Batch Calculation (100 records)** | < 10s total | Parallel processing |
| **Hierarchy Aggregation (5 levels)** | < 500ms p95 | Cache intermediate results |
| **Scenario Calculation (1000 activities)** | < 30s total | Queue-based async processing |
| **Cache Hit Ratio** | > 80% | Smart invalidation |

**Optimization Strategies**:
- Calculation result caching (1 hour TTL)
- Emission factor caching (24 hour TTL)
- Hierarchy snapshot caching (permanent for historical)
- Batch processing with parallelization
- Database query optimization (compound indexes)

### 7.2 Scalability

**Horizontal Scaling**:
- Stateless service design (can run multiple instances)
- Queue-based job processing (SQS)
- Read replicas for query optimization

**Data Volume Targets**:
- 1M+ activity data records per year
- 10K+ calculations per minute (peak)
- 100+ concurrent aggregation requests
- 1000+ scenarios per project

**Resource Limits**:
```yaml
Container Resources:
  CPU: 2 cores (request), 4 cores (limit)
  Memory: 2Gi (request), 4Gi (limit)

Database:
  Connections: 100 max
  Query Timeout: 30s

Cache (Redis):
  Max Memory: 2GB
  Eviction Policy: allkeys-lru
```

### 7.3 Reliability

**Error Handling**:
- Retry failed calculations (max 3 attempts)
- Dead letter queue for persistent failures
- Graceful degradation (use cached results if calculation fails)
- Circuit breaker for external service calls

**Data Integrity**:
- Calculation versioning (track all recalculations)
- Idempotent event handlers (prevent duplicate calculations)
- Transaction boundaries (atomic calculation + event publish)
- Referential integrity checks (validate activity data exists)

### 7.4 Security

**Input Validation**:
```typescript
// Zod schema for calculation request
const CalculationRequestSchema = z.object({
  activityDataId: z.string().uuid(),
  emissionFactorId: z.string().uuid().optional(),
  calculationMethod: z.string().max(50).optional(),
  metadata: z.object({
    triggeredBy: z.string().uuid(),
    reason: z.enum(['data_verified', 'manual_recalc', 'scenario'])
  }).optional()
});
```

**Formula Execution Security**:
```typescript
// NEVER use eval() - use safe math parser
import { Parser } from 'expr-eval';

const parser = new Parser();
parser.evaluate(formula, variables); // ✅ Safe

// ❌ DANGEROUS:
// eval(`const result = ${formula}`);
```

**Access Control**:
- Calculations inherit permissions from source activity data
- Only project members can trigger calculations
- Only admins can invalidate cache
- Audit all manual calculation triggers

### 7.5 Observability

**Metrics** (Prometheus):
```yaml
calculation_requests_total:
  Type: Counter
  Labels: [method, scope, status]

calculation_duration_seconds:
  Type: Histogram
  Labels: [method, scope]
  Buckets: [0.01, 0.05, 0.1, 0.5, 1, 5]

aggregation_duration_seconds:
  Type: Histogram
  Labels: [levels]

cache_hit_rate:
  Type: Gauge
  Labels: [cache_type]

calculation_errors_total:
  Type: Counter
  Labels: [error_type]
```

**Logging**:
```typescript
logger.info('Calculation started', {
  calculationId,
  activityDataId,
  scope,
  category,
  trigger
});

logger.info('Calculation completed', {
  calculationId,
  emission,
  duration: endTime - startTime,
  cacheHit: false
});

logger.error('Calculation failed', {
  calculationId,
  activityDataId,
  error: error.message,
  stack: error.stack
});
```

**Tracing** (OpenTelemetry):
- Trace calculation flow from trigger to completion
- Trace aggregation recursion (parent-child relationships)
- Trace cross-service calls (Activity, Reference, Organization)

---

## 8. Testing Strategy

### 8.1 Unit Tests

**Coverage Target**: 85%+

**Key Test Cases**:
```typescript
describe('CalculationEngine', () => {
  describe('calculateEmission', () => {
    it('should calculate Scope 1 stationary combustion correctly', async () => {
      const result = await calculationEngine.calculateEmission(activityDataId);
      expect(result.results.emission).toBe(1234.56);
    });

    it('should use correct emission factor for region', async () => {
      // Test region-specific EF selection
    });

    it('should calculate uncertainty correctly', async () => {
      const result = await calculationEngine.calculateEmission(activityDataId);
      expect(result.results.uncertainty.lower).toBeLessThan(result.results.emission);
      expect(result.results.uncertainty.upper).toBeGreaterThan(result.results.emission);
    });

    it('should throw error for unverified activity data', async () => {
      await expect(
        calculationEngine.calculateEmission(unverifiedActivityDataId)
      ).rejects.toThrow(UnverifiedActivityDataError);
    });

    it('should apply conversion factors correctly', async () => {
      // Test UOM conversion (e.g., liters to gallons)
    });
  });
});

describe('HierarchyAggregator', () => {
  it('should aggregate 5-level hierarchy correctly', async () => {
    const result = await aggregator.aggregateNode(companyId, 2024);
    expect(result.totals.total).toBe(expectedTotal);
  });

  it('should handle missing child data gracefully', async () => {
    // Test partial aggregation
  });

  it('should detect circular references', async () => {
    await expect(
      aggregator.aggregateNode(circularNodeId, 2024)
    ).rejects.toThrow(CircularReferenceError);
  });

  it('should cache aggregation results', async () => {
    const result1 = await aggregator.aggregateNode(nodeId, 2024);
    const result2 = await aggregator.aggregateNode(nodeId, 2024);
    expect(result2.cacheHit).toBe(true);
  });
});

describe('AllocationEngine', () => {
  it('should allocate by headcount proportionally', async () => {
    const allocation = await engine.createAllocation(allocationDto);
    expect(allocation.targets[0].proportion).toBe(50); // 50 employees out of 100
  });

  it('should reject allocations with zero total', async () => {
    await expect(
      engine.createAllocation({ ...dto, targets: [{ value: 0 }] })
    ).rejects.toThrow(InvalidAllocationError);
  });

  it('should validate sum of proportions equals 100%', async () => {
    const allocation = await engine.createAllocation(dto);
    const sum = allocation.targets.reduce((s, t) => s + t.proportion, 0);
    expect(Math.abs(sum - 100)).toBeLessThan(0.01);
  });
});
```

### 8.2 Integration Tests

**Coverage Target**: 70%+

**Key Test Scenarios**:
```typescript
describe('Calculation API Integration', () => {
  it('should calculate emission end-to-end', async () => {
    // 1. Create activity data (Activity Service)
    const activityData = await createActivityData({ ... });

    // 2. Trigger calculation
    const response = await request(app)
      .post('/v1/calculations/single')
      .send({ activityDataId: activityData.id })
      .expect(200);

    // 3. Verify result stored in database
    const calculation = await calculationRepository.findOne({
      calculationId: response.body.calculationId
    });
    expect(calculation).toBeDefined();

    // 4. Verify event published
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'calculation.emission.calculated.v1'
      })
    );
  });

  it('should handle batch calculation with partial failures', async () => {
    const response = await request(app)
      .post('/v1/calculations/batch')
      .send({
        activityDataIds: [validId1, invalidId, validId2],
        options: { continueOnError: true }
      })
      .expect(202);

    const batch = await pollBatchStatus(response.body.batchId);
    expect(batch.processedCount).toBe(2);
    expect(batch.failedCount).toBe(1);
  });
});

describe('Aggregation Integration', () => {
  it('should aggregate real hierarchy from database', async () => {
    // Create hierarchy: Company -> Entity -> 2 Locations
    // Add activity data to locations
    // Verify aggregation rolls up correctly
  });

  it('should invalidate cache when activity data changes', async () => {
    const agg1 = await aggregator.aggregateNode(nodeId, 2024);

    // Update activity data
    await updateActivityData(activityDataId, { quantityConsumed: 999 });

    const agg2 = await aggregator.aggregateNode(nodeId, 2024);
    expect(agg2.cacheHit).toBe(false);
    expect(agg2.totals.total).not.toBe(agg1.totals.total);
  });
});
```

### 8.3 Performance Tests

**Tool**: K6

**Test Scenarios**:
```javascript
// k6 script: calculation_load_test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 10 },   // Ramp up
    { duration: '5m', target: 100 },  // Sustained load
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<100'],  // 95% < 100ms
    http_req_failed: ['rate<0.01'],    // < 1% errors
  },
};

export default function () {
  const payload = JSON.stringify({
    activityDataId: '123e4567-e89b-12d3-a456-426614174000'
  });

  const response = http.post(
    'http://localhost:3005/v1/calculations/single',
    payload,
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 100ms': (r) => r.timings.duration < 100,
    'has calculationId': (r) => r.json('calculationId') !== undefined,
  });

  sleep(1);
}
```

### 8.4 End-to-End Tests

**Tool**: Cypress / Playwright

**Test Flows**:
```typescript
describe('E2E: Emission Calculation Flow', () => {
  it('should calculate and display emissions in dashboard', async () => {
    // 1. Login as project manager
    await login('pm@example.com', 'password');

    // 2. Navigate to activity data page
    await navigateTo('/projects/123/activity-data');

    // 3. Add new activity data
    await addActivityData({
      category: 'Stationary Combustion',
      parameter: 'Diesel',
      quantity: 1000,
      uom: 'liters'
    });

    // 4. Verify activity data
    await verifyActivityData();

    // 5. Wait for automatic calculation
    await waitForCalculation();

    // 6. Navigate to dashboard
    await navigateTo('/projects/123/dashboard');

    // 7. Verify emission displayed
    await expect(page.locator('.total-emissions')).toContainText('2.68 tCO2e');
  });

  it('should create and compare scenario', async () => {
    // Create baseline + scenario + compare results
  });
});
```

---

## 9. Deployment Configuration

### 9.1 Environment Variables

```bash
# Service Configuration
NODE_ENV=development|production
SERVICE_NAME=calculation-service
PORT=3005
LOG_LEVEL=info|debug|error

# Database
MONGODB_URI=mongodb://admin:password@mongodb:27017/clenergize_calculation?authSource=admin

# Redis Cache
REDIS_URL=redis://redis:6379
REDIS_CACHE_DB=0
REDIS_PUBSUB_DB=1
REDIS_MAX_MEMORY=2gb

# AWS Services
LOCALSTACK_ENDPOINT=http://localstack:4566  # Local dev only
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<secret>
AWS_SECRET_ACCESS_KEY=<secret>

# Event Bus
EVENTBRIDGE_BUS_NAME=clenergize-events
SQS_CALCULATION_QUEUE=calculation-jobs

# Service Dependencies
ACTIVITY_SERVICE_URL=http://activity-service:3004
REFERENCE_SERVICE_URL=http://reference-service:3003
ORGANIZATION_SERVICE_URL=http://organization-service:3002

# Calculation Configuration
CALCULATION_BATCH_SIZE=100
CALCULATION_TIMEOUT_MS=30000
AGGREGATION_CACHE_TTL=3600
CALCULATION_PARALLELISM=10

# Feature Flags
ENABLE_AUTO_CALCULATION=true
ENABLE_SCENARIO_MODELING=true
ENABLE_ALLOCATION=true
```

### 9.2 Docker Configuration

**Dockerfile**:
```dockerfile
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:24-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production
EXPOSE 3005

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3005/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

CMD ["node", "dist/main.js"]
```

**docker-compose.yml** (excerpt):
```yaml
calculation-service:
  build:
    context: ./NEW/calculation-service
    dockerfile: Dockerfile.dev
  container_name: clenergize-calculation-service
  restart: unless-stopped
  ports:
    - "3005:3005"
    - "9005:9229"  # Debug port
  environment:
    - NODE_ENV=development
    - PORT=3005
    - MONGODB_URI=mongodb://admin:localdev123@mongodb:27017/clenergize_calculation?authSource=admin
    - REDIS_URL=redis://redis:6379
    - ACTIVITY_SERVICE_URL=http://activity-service:3004
    - REFERENCE_SERVICE_URL=http://reference-service:3003
    - ORGANIZATION_SERVICE_URL=http://organization-service:3002
  volumes:
    - ./NEW/calculation-service:/app
    - /app/node_modules
  depends_on:
    - mongodb
    - redis
    - activity-service
    - reference-service
    - organization-service
  command: npm run start:dev
```

### 9.3 Health Checks

```typescript
@Get('/health')
async health(): Promise<HealthCheckResult> {
  const checks = await Promise.allSettled([
    this.checkDatabase(),
    this.checkRedis(),
    this.checkActivityService(),
    this.checkReferenceService(),
    this.checkOrganizationService(),
  ]);

  const isHealthy = checks.every(check => check.status === 'fulfilled');

  return {
    status: isHealthy ? 'healthy' : 'unhealthy',
    service: 'calculation-service',
    version: process.env.VERSION || '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    checks: {
      database: checks[0].status === 'fulfilled' ? 'up' : 'down',
      redis: checks[1].status === 'fulfilled' ? 'up' : 'down',
      activityService: checks[2].status === 'fulfilled' ? 'up' : 'down',
      referenceService: checks[3].status === 'fulfilled' ? 'up' : 'down',
      organizationService: checks[4].status === 'fulfilled' ? 'up' : 'down',
    }
  };
}
```

---

## 10. Migration from OLD System

### 10.1 Current State Analysis

**OLD Service**: `clenergizeV3-carbon-footprint-ms-dev`

**Critical Issues**:
1. No calculation versioning (can't track recalculations)
2. Calculations stored in same collection as activity data (denormalized)
3. No uncertainty quantification
4. Hardcoded emission factors (not using Reference Service)
5. No caching strategy (recalculates on every request)
6. Aggregations computed synchronously (slow dashboards)
7. No scenario modeling capability

**OLD Data Model** (flawed):
```typescript
// ❌ OLD: Calculation embedded in activity data
interface OLDActivityData {
  _id: ObjectId;
  parameter: string;
  quantityConsumed: number;
  uom: string;
  // Calculation fields embedded (BAD!)
  emissionFactor?: number;        // Hardcoded value
  calculatedEmission?: number;    // Single value, no versioning
  calculatedAt?: Date;            // Last calculation only
}
```

### 10.2 Migration Strategy

#### Phase 1: Historical Calculation Reconstruction (Week 1-2)

**Goal**: Extract and separate calculation data from activity data

**Steps**:
```typescript
// Migration Script: extract_calculations.ts
async function migrateCalculations() {
  const oldActivityData = await oldDb
    .collection('activity_data')
    .find({ calculatedEmission: { $exists: true } })
    .toArray();

  for (const oldData of oldActivityData) {
    // Create calculation result in NEW system
    await newDb.collection('calculation_results').insertOne({
      calculationId: uuid(),
      activityDataId: oldData._id,
      projectId: oldData.projectId,
      entityId: oldData.entityId,
      year: oldData.year,
      month: oldData.month,
      inputs: {
        activityValue: oldData.quantityConsumed,
        activityUom: oldData.uom,
        emissionFactorId: null,  // Unknown in OLD system
        emissionFactorValue: oldData.emissionFactor || 0,
        emissionFactorUom: 'kgCO2e/unit',
        conversionFactor: 1,
        conversionFactorSource: 'MIGRATED'
      },
      method: {
        id: 'LEGACY-001',
        name: 'Legacy Calculation',
        version: 'MIGRATED',
        formula: 'activityValue * emissionFactor'
      },
      results: {
        emission: oldData.calculatedEmission,
        co2: oldData.calculatedEmission * 0.95,
        ch4: oldData.calculatedEmission * 0.03,
        n2o: oldData.calculatedEmission * 0.02,
        uncertainty: {
          lower: oldData.calculatedEmission * 0.7,  // Assume 30% uncertainty
          upper: oldData.calculatedEmission * 1.3,
          qualityScore: 4,  // Low quality (no source data)
          sources: {
            activityData: 30,
            emissionFactor: 0,  // Unknown
            model: 0
          }
        }
      },
      scope: oldData.scope,
      category: oldData.category,
      calculatedAt: oldData.calculatedAt || new Date('2024-01-01'),
      calculatedBy: 'MIGRATION',
      trigger: 'migration',
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  console.log(`Migrated ${oldActivityData.length} calculations`);
}
```

#### Phase 2: Parallel Run (Week 3-4)

**Goal**: Run OLD and NEW calculation engines in parallel, compare results

**Approach**:
```typescript
// Dual-write pattern during migration
async function calculateWithComparison(activityDataId: string) {
  // Calculate with NEW system
  const newResult = await newCalculationEngine.calculateEmission(activityDataId);

  // Calculate with OLD system (for comparison)
  const oldResult = await oldCalculationEngine.calculate(activityDataId);

  // Compare results
  const delta = Math.abs(newResult.emission - oldResult.emission);
  const deltaPercent = (delta / oldResult.emission) * 100;

  if (deltaPercent > 5) {  // > 5% difference
    logger.warn('Calculation mismatch', {
      activityDataId,
      oldEmission: oldResult.emission,
      newEmission: newResult.emission,
      delta,
      deltaPercent
    });

    // Store for manual review
    await reviewQueue.add({ activityDataId, oldResult, newResult });
  }

  // Return NEW result (but keep OLD for comparison)
  return newResult;
}
```

#### Phase 3: Cutover (Week 5)

**Goal**: Switch to NEW calculation service completely

**Validation**:
- ✅ All historical calculations migrated
- ✅ Parallel run delta < 1% for 95% of calculations
- ✅ Performance tests passed
- ✅ Load tests passed
- ✅ Stakeholder sign-off

**Rollback Plan**:
- Keep OLD service running in read-only mode for 30 days
- Database backup before migration
- Feature flag to switch back to OLD if critical issues

### 10.3 Data Quality Improvements

**Enhancements in NEW System**:
1. **Calculation Versioning**: Track every recalculation with version number
2. **Uncertainty Quantification**: Provide confidence intervals for all results
3. **Emission Factor Traceability**: Link to Reference Service EF IDs
4. **Calculation Method Metadata**: Store formula version, standard (GHG Protocol 2023)
5. **Audit Trail**: Complete history of who triggered calculation and why
6. **Cache Strategy**: 80%+ cache hit ratio for aggregations

**Migration Quality Checks**:
```sql
-- Verify all activity data has calculations
SELECT COUNT(*) FROM activity_data ad
LEFT JOIN calculation_results cr ON ad._id = cr.activityDataId
WHERE cr.calculationId IS NULL;
-- Expected: 0

-- Verify emission totals match (within tolerance)
SELECT
  SUM(ad.calculatedEmission) as old_total,
  SUM(cr.results.emission) as new_total,
  ABS(SUM(ad.calculatedEmission) - SUM(cr.results.emission)) as delta
FROM activity_data ad
JOIN calculation_results cr ON ad._id = cr.activityDataId;
-- Expected: delta < 1%
```

---

## 11. Error Code Registry

### 11.1 Error Code Taxonomy

**Format**: `CALC_<CATEGORY>_<NUMBER>`

**Categories**:
- `VAL`: Validation errors (400 Bad Request)
- `AUTH`: Authorization errors (403 Forbidden)
- `RES`: Resource not found (404 Not Found)
- `PROC`: Processing errors (422 Unprocessable Entity)
- `DEP`: Dependency errors (424 Failed Dependency)
- `SYS`: System errors (500 Internal Server Error)

### 11.2 Complete Error Code List

#### Validation Errors (CALC_VAL_XXX)

```typescript
export const CALC_VAL_001 = {
  code: 'CALC_VAL_001',
  message: 'Activity data ID is required',
  httpStatus: 400,
  userMessage: 'Please provide a valid activity data ID',
  resolution: 'Include activityDataId in request body'
};

export const CALC_VAL_002 = {
  code: 'CALC_VAL_002',
  message: 'Invalid UUID format for activity data ID',
  httpStatus: 400,
  userMessage: 'The activity data ID format is invalid',
  resolution: 'Provide a valid UUID v4 format'
};

export const CALC_VAL_003 = {
  code: 'CALC_VAL_003',
  message: 'Year must be between 1990 and 2100',
  httpStatus: 400,
  userMessage: 'The specified year is out of valid range',
  resolution: 'Provide a year between 1990 and 2100'
};

export const CALC_VAL_004 = {
  code: 'CALC_VAL_004',
  message: 'Batch size exceeds maximum limit (1000)',
  httpStatus: 400,
  userMessage: 'Too many activity data IDs in batch request',
  resolution: 'Split batch into chunks of 1000 or fewer'
};

export const CALC_VAL_005 = {
  code: 'CALC_VAL_005',
  message: 'Invalid aggregation dimension',
  httpStatus: 400,
  userMessage: 'One or more aggregation dimensions are invalid',
  resolution: 'Use only: scope, category, month'
};

export const CALC_VAL_006 = {
  code: 'CALC_VAL_006',
  message: 'Allocation values must be greater than zero',
  httpStatus: 400,
  userMessage: 'All allocation values must be positive numbers',
  resolution: 'Ensure all allocation values are > 0'
};

export const CALC_VAL_007 = {
  code: 'CALC_VAL_007',
  message: 'Sum of allocation proportions must equal 100%',
  httpStatus: 400,
  userMessage: 'Allocation proportions do not sum to 100%',
  resolution: 'Adjust allocation values to sum exactly to 100%'
};

export const CALC_VAL_008 = {
  code: 'CALC_VAL_008',
  message: 'Scenario override type invalid',
  httpStatus: 400,
  userMessage: 'Scenario override must be activityData or emissionFactor',
  resolution: 'Use only allowed override types'
};
```

#### Authorization Errors (CALC_AUTH_XXX)

```typescript
export const CALC_AUTH_001 = {
  code: 'CALC_AUTH_001',
  message: 'User not authorized to calculate emissions for this project',
  httpStatus: 403,
  userMessage: 'You do not have permission to perform calculations for this project',
  resolution: 'Request project access from administrator'
};

export const CALC_AUTH_002 = {
  code: 'CALC_AUTH_002',
  message: 'User not authorized to create allocations',
  httpStatus: 403,
  userMessage: 'You do not have permission to create allocations',
  resolution: 'Contact administrator for allocation creation permissions'
};

export const CALC_AUTH_003 = {
  code: 'CALC_AUTH_003',
  message: 'User not authorized to invalidate cache',
  httpStatus: 403,
  userMessage: 'Cache invalidation requires administrator privileges',
  resolution: 'Contact system administrator'
};
```

#### Resource Not Found Errors (CALC_RES_XXX)

```typescript
export const CALC_RES_001 = {
  code: 'CALC_RES_001',
  message: 'Activity data not found',
  httpStatus: 404,
  userMessage: 'The specified activity data does not exist',
  resolution: 'Verify the activity data ID and try again'
};

export const CALC_RES_002 = {
  code: 'CALC_RES_002',
  message: 'Calculation result not found',
  httpStatus: 404,
  userMessage: 'The requested calculation result does not exist',
  resolution: 'Check calculation ID or trigger a new calculation'
};

export const CALC_RES_003 = {
  code: 'CALC_RES_003',
  message: 'Aggregation not found',
  httpStatus: 404,
  userMessage: 'The requested aggregation does not exist',
  resolution: 'Trigger a new aggregation for this node'
};

export const CALC_RES_004 = {
  code: 'CALC_RES_004',
  message: 'Scenario not found',
  httpStatus: 404,
  userMessage: 'The specified scenario does not exist',
  resolution: 'Verify scenario ID or create a new scenario'
};

export const CALC_RES_005 = {
  code: 'CALC_RES_005',
  message: 'Allocation not found',
  httpStatus: 404,
  userMessage: 'The specified allocation does not exist',
  resolution: 'Check allocation ID or create a new allocation'
};

export const CALC_RES_006 = {
  code: 'CALC_RES_006',
  message: 'Batch job not found',
  httpStatus: 404,
  userMessage: 'The batch calculation job does not exist',
  resolution: 'Check job ID or submit a new batch'
};
```

#### Processing Errors (CALC_PROC_XXX)

```typescript
export const CALC_PROC_001 = {
  code: 'CALC_PROC_001',
  message: 'Activity data not verified',
  httpStatus: 422,
  userMessage: 'Activity data must be verified before calculation',
  resolution: 'Verify the activity data first through Activity Service'
};

export const CALC_PROC_002 = {
  code: 'CALC_PROC_002',
  message: 'Emission factor not found for parameter',
  httpStatus: 422,
  userMessage: 'No emission factor available for this parameter and region',
  resolution: 'Contact administrator to add emission factor to Reference Service'
};

export const CALC_PROC_003 = {
  code: 'CALC_PROC_003',
  message: 'Calculation method not found',
  httpStatus: 422,
  userMessage: 'No calculation method available for scope and category',
  resolution: 'Configure calculation method in system settings'
};

export const CALC_PROC_004 = {
  code: 'CALC_PROC_004',
  message: 'Conversion factor not found',
  httpStatus: 422,
  userMessage: 'Cannot convert between specified units',
  resolution: 'Check units of measurement or contact administrator'
};

export const CALC_PROC_005 = {
  code: 'CALC_PROC_005',
  message: 'Formula execution failed',
  httpStatus: 422,
  userMessage: 'Calculation formula could not be executed',
  resolution: 'Check formula configuration or contact support'
};

export const CALC_PROC_006 = {
  code: 'CALC_PROC_006',
  message: 'Circular reference detected in hierarchy',
  httpStatus: 422,
  userMessage: 'Hierarchy contains circular references',
  resolution: 'Fix hierarchy structure in Organization Service'
};

export const CALC_PROC_007 = {
  code: 'CALC_PROC_007',
  message: 'Aggregation failed due to missing data',
  httpStatus: 422,
  userMessage: 'Some nodes in hierarchy are missing emission data',
  resolution: 'Ensure all locations have activity data for the year'
};

export const CALC_PROC_008 = {
  code: 'CALC_PROC_008',
  message: 'Allocation target entity not found',
  httpStatus: 422,
  userMessage: 'One or more allocation target entities do not exist',
  resolution: 'Verify all target entity IDs exist in Organization Service'
};

export const CALC_PROC_009 = {
  code: 'CALC_PROC_009',
  message: 'Scenario calculation already in progress',
  httpStatus: 422,
  userMessage: 'A calculation for this scenario is already running',
  resolution: 'Wait for current calculation to complete'
};

export const CALC_PROC_010 = {
  code: 'CALC_PROC_010',
  message: 'Calculation timeout exceeded',
  httpStatus: 422,
  userMessage: 'Calculation took too long and was terminated',
  resolution: 'Simplify calculation or contact administrator'
};
```

#### Dependency Errors (CALC_DEP_XXX)

```typescript
export const CALC_DEP_001 = {
  code: 'CALC_DEP_001',
  message: 'Activity Service unavailable',
  httpStatus: 424,
  userMessage: 'Activity Service is currently unavailable',
  resolution: 'Try again later or contact support'
};

export const CALC_DEP_002 = {
  code: 'CALC_DEP_002',
  message: 'Reference Service unavailable',
  httpStatus: 424,
  userMessage: 'Reference Service is currently unavailable',
  resolution: 'Try again later or contact support'
};

export const CALC_DEP_003 = {
  code: 'CALC_DEP_003',
  message: 'Organization Service unavailable',
  httpStatus: 424,
  userMessage: 'Organization Service is currently unavailable',
  resolution: 'Try again later or contact support'
};

export const CALC_DEP_004 = {
  code: 'CALC_DEP_004',
  message: 'Cache service unavailable',
  httpStatus: 424,
  userMessage: 'Caching service is currently unavailable',
  resolution: 'Calculation will proceed without cache (slower)'
};

export const CALC_DEP_005 = {
  code: 'CALC_DEP_005',
  message: 'Event bus unavailable',
  httpStatus: 424,
  userMessage: 'Event publishing failed',
  resolution: 'Calculation succeeded but events not published'
};
```

#### System Errors (CALC_SYS_XXX)

```typescript
export const CALC_SYS_001 = {
  code: 'CALC_SYS_001',
  message: 'Database connection error',
  httpStatus: 500,
  userMessage: 'A database error occurred',
  resolution: 'Try again or contact support if issue persists'
};

export const CALC_SYS_002 = {
  code: 'CALC_SYS_002',
  message: 'Unexpected error during calculation',
  httpStatus: 500,
  userMessage: 'An unexpected error occurred',
  resolution: 'Contact support with calculation ID'
};

export const CALC_SYS_003 = {
  code: 'CALC_SYS_003',
  message: 'Cache write failure',
  httpStatus: 500,
  userMessage: 'Failed to cache calculation result',
  resolution: 'Calculation succeeded but caching failed'
};

export const CALC_SYS_004 = {
  code: 'CALC_SYS_004',
  message: 'Aggregation cache corruption',
  httpStatus: 500,
  userMessage: 'Aggregation cache is corrupted',
  resolution: 'Cache will be cleared and recalculated'
};
```

### 11.3 Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;              // e.g., CALC_PROC_002
    message: string;           // Technical message
    userMessage: string;       // User-friendly message
    resolution: string;        // How to fix
    details?: any;             // Additional context
    timestamp: string;         // ISO 8601
    correlationId: string;     // Request trace ID
    path: string;              // API path
  };
}

// Example
{
  "success": false,
  "error": {
    "code": "CALC_PROC_002",
    "message": "Emission factor not found for parameter",
    "userMessage": "No emission factor available for Diesel (parameter-123) in region US-CA",
    "resolution": "Contact administrator to add emission factor to Reference Service",
    "details": {
      "parameterId": "parameter-123",
      "parameterName": "Diesel",
      "region": "US-CA",
      "year": 2024
    },
    "timestamp": "2025-11-18T10:30:00Z",
    "correlationId": "req-abc-123",
    "path": "/v1/calculations/single"
  }
}
```

---

## 12. Event Schemas (with Zod Validation)

### 12.1 Base Event Schema

```typescript
import { z } from 'zod';

export const BaseEventSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.string(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  metadata: z.record(z.any()).optional()
});

export type BaseEvent = z.infer<typeof BaseEventSchema>;
```

### 12.2 Calculation Events

#### calculation.emission.calculated.v1

```typescript
export const EmissionCalculatedEventDataSchema = z.object({
  calculationId: z.string().uuid(),
  activityDataId: z.string().uuid(),
  projectId: z.string().uuid(),
  entityId: z.string().uuid(),
  emission: z.number().nonnegative(),
  scope: z.enum(['Scope 1', 'Scope 2', 'Scope 3']),
  category: z.string().min(1).max(100),
  year: z.number().int().min(1990).max(2100),
  month: z.number().int().min(1).max(12).optional(),
  calculatedBy: z.string().uuid(),
  trigger: z.enum(['automatic', 'manual', 'batch', 'scenario']),
  method: z.object({
    id: z.string(),
    name: z.string(),
    version: z.string()
  }),
  uncertainty: z.object({
    lower: z.number().nonnegative(),
    upper: z.number().nonnegative(),
    qualityScore: z.enum([1, 2, 3, 4])
  })
});

export const EmissionCalculatedEventSchema = BaseEventSchema.extend({
  type: z.literal('calculation.emission.calculated.v1'),
  aggregateType: z.literal('CalculationResult'),
  data: EmissionCalculatedEventDataSchema
});

export type EmissionCalculatedEvent = z.infer<typeof EmissionCalculatedEventSchema>;

// Usage
const event: EmissionCalculatedEvent = {
  id: uuid(),
  type: 'calculation.emission.calculated.v1',
  version: '1.0.0',
  occurredAt: new Date().toISOString(),
  aggregateId: calculationId,
  aggregateType: 'CalculationResult',
  correlationId: request.correlationId,
  userId: request.userId,
  data: {
    calculationId,
    activityDataId,
    projectId,
    entityId,
    emission: 1234.56,
    scope: 'Scope 1',
    category: 'Stationary Combustion',
    year: 2024,
    calculatedBy: userId,
    trigger: 'automatic',
    method: {
      id: 'CALC-001',
      name: 'Fuel-Based Combustion',
      version: 'GHG-2023'
    },
    uncertainty: {
      lower: 1111.10,
      upper: 1358.02,
      qualityScore: 2
    }
  }
};

// Validate before publishing
EmissionCalculatedEventSchema.parse(event);
```

#### calculation.batch.completed.v1

```typescript
export const BatchCompletedEventDataSchema = z.object({
  batchId: z.string().uuid(),
  projectId: z.string().uuid(),
  totalCount: z.number().int().nonnegative(),
  successCount: z.number().int().nonnegative(),
  failedCount: z.number().int().nonnegative(),
  totalEmission: z.number().nonnegative(),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime(),
  durationMs: z.number().int().nonnegative(),
  triggeredBy: z.string().uuid()
});

export const BatchCompletedEventSchema = BaseEventSchema.extend({
  type: z.literal('calculation.batch.completed.v1'),
  aggregateType: z.literal('BatchCalculation'),
  data: BatchCompletedEventDataSchema
});

export type BatchCompletedEvent = z.infer<typeof BatchCompletedEventSchema>;
```

#### calculation.rollup.completed.v1

```typescript
export const RollupCompletedEventDataSchema = z.object({
  aggregationId: z.string().uuid(),
  nodeId: z.string().uuid(),
  nodeName: z.string().min(1).max(200),
  nodeType: z.enum(['Company', 'Entity', 'Subsidiary', 'Location']),
  year: z.number().int().min(1990).max(2100),
  totalEmission: z.number().nonnegative(),
  directEmission: z.number().nonnegative(),
  indirectEmission: z.number().nonnegative(),
  childCount: z.number().int().nonnegative(),
  byScope: z.object({
    scope1: z.number().nonnegative(),
    scope2: z.number().nonnegative(),
    scope3: z.number().nonnegative()
  }),
  calculationCount: z.number().int().nonnegative(),
  cacheHit: z.boolean()
});

export const RollupCompletedEventSchema = BaseEventSchema.extend({
  type: z.literal('calculation.rollup.completed.v1'),
  aggregateType: z.literal('Aggregation'),
  data: RollupCompletedEventDataSchema
});

export type RollupCompletedEvent = z.infer<typeof RollupCompletedEventSchema>;
```

#### calculation.allocation.created.v1

```typescript
export const AllocationCreatedEventDataSchema = z.object({
  allocationId: z.string().uuid(),
  name: z.string().min(1).max(200),
  projectId: z.string().uuid(),
  totalEmission: z.number().nonnegative(),
  allocationType: z.enum(['headcount', 'revenue', 'floorArea', 'custom']),
  targetCount: z.number().int().positive(),
  year: z.number().int().min(1990).max(2100),
  targets: z.array(z.object({
    entityId: z.string().uuid(),
    entityName: z.string(),
    allocatedEmission: z.number().nonnegative(),
    proportion: z.number().min(0).max(100)
  })),
  createdBy: z.string().uuid()
});

export const AllocationCreatedEventSchema = BaseEventSchema.extend({
  type: z.literal('calculation.allocation.created.v1'),
  aggregateType: z.literal('Allocation'),
  data: AllocationCreatedEventDataSchema
});

export type AllocationCreatedEvent = z.infer<typeof AllocationCreatedEventSchema>;
```

#### calculation.scenario.completed.v1

```typescript
export const ScenarioCompletedEventDataSchema = z.object({
  scenarioId: z.string().uuid(),
  name: z.string().min(1).max(200),
  projectId: z.string().uuid(),
  baselineEmission: z.number().nonnegative(),
  projectedEmission: z.number().nonnegative(),
  reduction: z.number(),
  reductionPercentage: z.number(),
  overrideCount: z.number().int().nonnegative(),
  calculationCount: z.number().int().nonnegative(),
  baselineYear: z.number().int().min(1990).max(2100),
  targetYear: z.number().int().min(1990).max(2100).optional(),
  createdBy: z.string().uuid()
});

export const ScenarioCompletedEventSchema = BaseEventSchema.extend({
  type: z.literal('calculation.scenario.completed.v1'),
  aggregateType: z.literal('Scenario'),
  data: ScenarioCompletedEventDataSchema
});

export type ScenarioCompletedEvent = z.infer<typeof ScenarioCompletedEventSchema>;
```

#### calculation.cache.invalidated.v1

```typescript
export const CacheInvalidatedEventDataSchema = z.object({
  reason: z.string().min(1).max(200),
  scope: z.enum(['project', 'entity', 'activityData', 'all']),
  targetId: z.string().uuid().optional(),
  invalidatedKeys: z.number().int().nonnegative(),
  affectedCalculations: z.number().int().nonnegative(),
  invalidatedBy: z.string().uuid()
});

export const CacheInvalidatedEventSchema = BaseEventSchema.extend({
  type: z.literal('calculation.cache.invalidated.v1'),
  aggregateType: z.literal('Cache'),
  data: CacheInvalidatedEventDataSchema
});

export type CacheInvalidatedEvent = z.infer<typeof CacheInvalidatedEventSchema>;
```

### 12.3 Event Publisher with Validation

```typescript
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';

@Injectable()
export class EventPublisherService {
  private readonly logger = new Logger(EventPublisherService.name);

  constructor(private readonly eventBridge: EventBridgeClient) {}

  async publish<T extends z.ZodType>(
    event: z.infer<T>,
    schema: T
  ): Promise<void> {
    try {
      // Validate event against schema
      schema.parse(event);

      // Publish to EventBridge
      await this.eventBridge.send(new PutEventsCommand({
        Entries: [{
          Source: 'clenergize.calculation-service',
          DetailType: event.type,
          Detail: JSON.stringify(event),
          EventBusName: process.env.EVENTBRIDGE_BUS_NAME
        }]
      }));

      this.logger.debug('Event published', {
        eventId: event.id,
        eventType: event.type,
        aggregateId: event.aggregateId
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        this.logger.error('Event validation failed', {
          eventType: event.type,
          errors: error.errors
        });
        throw new Error(`Event validation failed: ${error.message}`);
      }
      throw error;
    }
  }
}

// Usage
await eventPublisher.publish(
  emissionCalculatedEvent,
  EmissionCalculatedEventSchema
);
```

---

## 13. Caching Strategy

### 13.1 Cache Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   CALCULATION SERVICE CACHE                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Cache Layers:                                               │
│  1. Calculation Results (1 hour TTL)                         │
│  2. Aggregations (1 hour TTL, cascading invalidation)       │
│  3. Emission Factors (24 hour TTL)                           │
│  4. Hierarchy Snapshots (Permanent for historical)          │
│  5. Conversion Factors (7 days TTL)                          │
│                                                              │
│  Invalidation Triggers:                                      │
│  • activity.data.verified.v1 → Clear calc cache             │
│  • activity.data.updated.v1 → Clear calc + agg cache        │
│  • reference.emission-factor.updated.v1 → Clear EF cache    │
│  • organization.hierarchy.modified.v1 → Clear hierarchy     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 13.2 Cache Key Patterns

```typescript
export const CacheKeys = {
  // Calculation results
  calculation: (activityDataId: string, version: number) =>
    `calc:${activityDataId}:${version}`,

  // Aggregations
  aggregation: (nodeId: string, year: number, dimensions: string) =>
    `agg:${nodeId}:${year}:${dimensions}`,

  // Emission factors (from Reference Service)
  emissionFactor: (parameterId: string, year: number, region: string) =>
    `ef:${parameterId}:${year}:${region}`,

  // Hierarchy snapshots
  hierarchy: (nodeId: string, date: string) =>
    `hierarchy:${nodeId}:${date}`,

  // Conversion factors
  conversionFactor: (fromUom: string, toUom: string) =>
    `cf:${fromUom}:${toUom}`,

  // Calculation method
  calculationMethod: (scope: string, category: string) =>
    `method:${scope}:${category}`,

  // Batch job status
  batchJob: (batchId: string) =>
    `batch:${batchId}`,

  // Scenario status
  scenario: (scenarioId: string) =>
    `scenario:${scenarioId}`
};
```

### 13.3 Cache TTL Configuration

```typescript
export const CacheTTL = {
  CALCULATION_RESULT: 3600,        // 1 hour
  AGGREGATION: 3600,               // 1 hour
  EMISSION_FACTOR: 86400,          // 24 hours
  HIERARCHY_CURRENT: 3600,         // 1 hour
  HIERARCHY_HISTORICAL: -1,        // Permanent (no TTL)
  CONVERSION_FACTOR: 604800,       // 7 days
  CALCULATION_METHOD: 86400,       // 24 hours
  BATCH_JOB: 3600,                 // 1 hour
  SCENARIO: 7200                   // 2 hours
};
```

### 13.4 Cache Implementation

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@/shared/redis/redis.service';

@Injectable()
export class CalculationCacheService {
  private readonly logger = new Logger(CalculationCacheService.name);

  constructor(private readonly redis: RedisService) {}

  // Cache calculation result
  async cacheCalculation(
    activityDataId: string,
    version: number,
    result: CalculationResult
  ): Promise<void> {
    const key = CacheKeys.calculation(activityDataId, version);
    await this.redis.setex(
      key,
      CacheTTL.CALCULATION_RESULT,
      JSON.stringify(result)
    );
    this.logger.debug('Calculation cached', { key });
  }

  // Get cached calculation
  async getCalculation(
    activityDataId: string,
    version: number
  ): Promise<CalculationResult | null> {
    const key = CacheKeys.calculation(activityDataId, version);
    const cached = await this.redis.get(key);

    if (cached) {
      this.logger.debug('Calculation cache hit', { key });
      return JSON.parse(cached);
    }

    this.logger.debug('Calculation cache miss', { key });
    return null;
  }

  // Cache aggregation
  async cacheAggregation(
    nodeId: string,
    year: number,
    dimensions: AggregationDimensions,
    aggregation: Aggregation
  ): Promise<void> {
    const dimensionKey = this.serializeDimensions(dimensions);
    const key = CacheKeys.aggregation(nodeId, year, dimensionKey);

    await this.redis.setex(
      key,
      CacheTTL.AGGREGATION,
      JSON.stringify(aggregation)
    );

    // Store reverse mapping (for invalidation)
    await this.redis.sadd(`agg_index:${nodeId}:${year}`, key);

    this.logger.debug('Aggregation cached', { key });
  }

  // Get cached aggregation
  async getAggregation(
    nodeId: string,
    year: number,
    dimensions: AggregationDimensions
  ): Promise<Aggregation | null> {
    const dimensionKey = this.serializeDimensions(dimensions);
    const key = CacheKeys.aggregation(nodeId, year, dimensionKey);
    const cached = await this.redis.get(key);

    if (cached) {
      this.logger.debug('Aggregation cache hit', { key });
      return JSON.parse(cached);
    }

    this.logger.debug('Aggregation cache miss', { key });
    return null;
  }

  // Invalidate calculation cache
  async invalidateCalculation(activityDataId: string): Promise<number> {
    const pattern = CacheKeys.calculation(activityDataId, '*');
    const keys = await this.redis.keys(pattern);

    if (keys.length > 0) {
      await this.redis.del(...keys);
      this.logger.info('Calculation cache invalidated', {
        activityDataId,
        keysDeleted: keys.length
      });
    }

    return keys.length;
  }

  // Invalidate aggregation cache (with cascade)
  async invalidateAggregation(
    nodeId: string,
    year: number,
    cascade: boolean = true
  ): Promise<number> {
    let totalDeleted = 0;

    // Delete all aggregations for this node/year
    const indexKey = `agg_index:${nodeId}:${year}`;
    const keys = await this.redis.smembers(indexKey);

    if (keys.length > 0) {
      await this.redis.del(...keys);
      await this.redis.del(indexKey);
      totalDeleted += keys.length;
    }

    // Cascade to parent nodes if requested
    if (cascade) {
      const parents = await this.getParentNodes(nodeId);
      for (const parentId of parents) {
        const parentDeleted = await this.invalidateAggregation(
          parentId,
          year,
          false  // Don't cascade infinitely
        );
        totalDeleted += parentDeleted;
      }
    }

    this.logger.info('Aggregation cache invalidated', {
      nodeId,
      year,
      cascade,
      keysDeleted: totalDeleted
    });

    return totalDeleted;
  }

  // Invalidate emission factor cache
  async invalidateEmissionFactor(
    parameterId: string,
    year?: number
  ): Promise<number> {
    const pattern = year
      ? CacheKeys.emissionFactor(parameterId, year, '*')
      : CacheKeys.emissionFactor(parameterId, '*', '*');

    const keys = await this.redis.keys(pattern);

    if (keys.length > 0) {
      await this.redis.del(...keys);
      this.logger.info('Emission factor cache invalidated', {
        parameterId,
        year,
        keysDeleted: keys.length
      });
    }

    return keys.length;
  }

  // Cache emission factor
  async cacheEmissionFactor(
    parameterId: string,
    year: number,
    region: string,
    emissionFactor: EmissionFactor
  ): Promise<void> {
    const key = CacheKeys.emissionFactor(parameterId, year, region);
    await this.redis.setex(
      key,
      CacheTTL.EMISSION_FACTOR,
      JSON.stringify(emissionFactor)
    );
    this.logger.debug('Emission factor cached', { key });
  }

  // Get cached emission factor
  async getEmissionFactor(
    parameterId: string,
    year: number,
    region: string
  ): Promise<EmissionFactor | null> {
    const key = CacheKeys.emissionFactor(parameterId, year, region);
    const cached = await this.redis.get(key);

    if (cached) {
      this.logger.debug('Emission factor cache hit', { key });
      return JSON.parse(cached);
    }

    this.logger.debug('Emission factor cache miss', { key });
    return null;
  }

  // Cache hierarchy snapshot
  async cacheHierarchy(
    nodeId: string,
    date: string,
    hierarchy: HierarchySnapshot
  ): Promise<void> {
    const key = CacheKeys.hierarchy(nodeId, date);
    const ttl = this.isHistorical(date)
      ? CacheTTL.HIERARCHY_HISTORICAL
      : CacheTTL.HIERARCHY_CURRENT;

    if (ttl === -1) {
      // Permanent cache (no TTL)
      await this.redis.set(key, JSON.stringify(hierarchy));
    } else {
      await this.redis.setex(key, ttl, JSON.stringify(hierarchy));
    }

    this.logger.debug('Hierarchy cached', { key, permanent: ttl === -1 });
  }

  // Helper: Check if date is historical (> 30 days ago)
  private isHistorical(dateString: string): boolean {
    const date = new Date(dateString);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return date < thirtyDaysAgo;
  }

  // Helper: Serialize aggregation dimensions
  private serializeDimensions(dimensions: AggregationDimensions): string {
    return `${dimensions.scope ? 's' : ''}${dimensions.category ? 'c' : ''}${dimensions.month ? 'm' : ''}`;
  }

  // Helper: Get parent nodes (from Organization Service)
  private async getParentNodes(nodeId: string): Promise<string[]> {
    // Call Organization Service to get parent chain
    // Implementation depends on service client
    return [];
  }

  // Get cache statistics
  async getCacheStats(): Promise<CacheStats> {
    const info = await this.redis.info('stats');
    const keys = await this.redis.dbsize();

    return {
      totalKeys: keys,
      hitRate: this.parseHitRate(info),
      memoryUsed: this.parseMemoryUsed(info),
      evictedKeys: this.parseEvictedKeys(info)
    };
  }

  // Helper parsers for Redis INFO
  private parseHitRate(info: string): number {
    const hits = this.extractValue(info, 'keyspace_hits');
    const misses = this.extractValue(info, 'keyspace_misses');
    if (hits + misses === 0) return 0;
    return (hits / (hits + misses)) * 100;
  }

  private parseMemoryUsed(info: string): number {
    return this.extractValue(info, 'used_memory');
  }

  private parseEvictedKeys(info: string): number {
    return this.extractValue(info, 'evicted_keys');
  }

  private extractValue(info: string, key: string): number {
    const regex = new RegExp(`${key}:(\\d+)`);
    const match = info.match(regex);
    return match ? parseInt(match[1], 10) : 0;
  }
}

interface CacheStats {
  totalKeys: number;
  hitRate: number;
  memoryUsed: number;
  evictedKeys: number;
}
```

### 13.5 Cache Invalidation Event Handlers

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { EventsHandler } from '@nestjs/cqrs';

@Injectable()
export class CacheInvalidationHandler {
  private readonly logger = new Logger(CacheInvalidationHandler.name);

  constructor(private readonly cacheService: CalculationCacheService) {}

  @EventsHandler('activity.data.verified.v1')
  async onActivityDataVerified(event: ActivityDataVerifiedEvent): Promise<void> {
    const { activityDataId } = event.data;

    // Clear calculation cache for this activity data
    await this.cacheService.invalidateCalculation(activityDataId);

    this.logger.debug('Cache invalidated on activity data verified', {
      activityDataId
    });
  }

  @EventsHandler('activity.data.updated.v1')
  async onActivityDataUpdated(event: ActivityDataUpdatedEvent): Promise<void> {
    const { activityDataId, entityId, year } = event.data;

    // Clear calculation cache
    await this.cacheService.invalidateCalculation(activityDataId);

    // Clear aggregation cache (with cascade to parents)
    await this.cacheService.invalidateAggregation(entityId, year, true);

    this.logger.info('Cache invalidated on activity data updated', {
      activityDataId,
      entityId,
      year
    });
  }

  @EventsHandler('reference.emission-factor.updated.v1')
  async onEmissionFactorUpdated(event: EmissionFactorUpdatedEvent): Promise<void> {
    const { emissionFactorId, parameterId, year } = event.data;

    // Clear emission factor cache
    await this.cacheService.invalidateEmissionFactor(parameterId, year);

    // Find all calculations using this EF and queue for recalculation
    await this.queueRecalculationsForEmissionFactor(emissionFactorId);

    this.logger.warn('Emission factor updated, cache cleared', {
      emissionFactorId,
      parameterId,
      year
    });
  }

  @EventsHandler('organization.hierarchy.modified.v1')
  async onHierarchyModified(event: HierarchyModifiedEvent): Promise<void> {
    const { nodeId, year } = event.data;

    // Clear hierarchy cache
    const hierarchyKey = CacheKeys.hierarchy(nodeId, new Date().toISOString());
    await this.cacheService.redis.del(hierarchyKey);

    // Clear all aggregations for affected nodes
    await this.cacheService.invalidateAggregation(nodeId, year, true);

    this.logger.warn('Hierarchy modified, cache cleared', { nodeId, year });
  }

  private async queueRecalculationsForEmissionFactor(
    emissionFactorId: string
  ): Promise<void> {
    // Implementation: Find calculations and queue for recalc
    this.logger.debug('Queueing recalculations', { emissionFactorId });
  }
}
```

### 13.6 Cache Monitoring

```typescript
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrometheusService } from '@/shared/prometheus/prometheus.service';

@Injectable()
export class CacheMonitoringService {
  constructor(
    private readonly cacheService: CalculationCacheService,
    private readonly prometheus: PrometheusService
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async collectCacheMetrics(): Promise<void> {
    const stats = await this.cacheService.getCacheStats();

    // Update Prometheus metrics
    this.prometheus.gauge('calculation_cache_hit_rate').set(stats.hitRate);
    this.prometheus.gauge('calculation_cache_total_keys').set(stats.totalKeys);
    this.prometheus.gauge('calculation_cache_memory_bytes').set(stats.memoryUsed);
    this.prometheus.counter('calculation_cache_evictions_total').inc(stats.evictedKeys);

    // Alert if hit rate drops below threshold
    if (stats.hitRate < 60) {
      this.logger.warn('Cache hit rate below threshold', {
        hitRate: stats.hitRate,
        threshold: 60
      });
    }
  }
}
```

---

## 14. Circuit Breaker Configuration

### 14.1 Circuit Breaker Pattern

```
┌─────────────────────────────────────────────────────────────┐
│              CIRCUIT BREAKER STATE MACHINE                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│          ┌───────────┐                                       │
│          │  CLOSED   │ ◄──────── All requests pass          │
│          │ (Normal)  │              through                  │
│          └─────┬─────┘                                       │
│                │                                             │
│                │ Failures exceed                             │
│                │ threshold (5 in 10s)                        │
│                ▼                                             │
│          ┌───────────┐                                       │
│          │   OPEN    │ ◄──────── All requests fail          │
│          │ (Failing) │              fast (no call)          │
│          └─────┬─────┘                                       │
│                │                                             │
│                │ After timeout                               │
│                │ (30s)                                       │
│                ▼                                             │
│          ┌───────────┐                                       │
│          │ HALF-OPEN │ ◄──────── Limited requests           │
│          │ (Testing) │              allowed                  │
│          └─────┬─────┘                                       │
│                │                                             │
│                ├──────► Success → Close circuit             │
│                └──────► Failure → Open circuit              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 14.2 Circuit Breaker Implementation

```typescript
import { Injectable, Logger } from '@nestjs/common';

enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

interface CircuitBreakerConfig {
  failureThreshold: number;      // Number of failures before opening
  successThreshold: number;      // Number of successes to close from half-open
  timeout: number;               // ms before trying half-open
  monitoringWindow: number;      // ms window for counting failures
}

@Injectable()
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private nextAttempt: number = Date.now();
  private readonly logger = new Logger(CircuitBreaker.name);

  constructor(
    private readonly name: string,
    private readonly config: CircuitBreakerConfig
  ) {}

  async execute<T>(fn: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        this.logger.warn('Circuit breaker OPEN', { name: this.name });

        if (fallback) {
          return await fallback();
        }

        throw new Error(`Circuit breaker is OPEN for ${this.name}`);
      }

      // Transition to HALF_OPEN
      this.state = CircuitState.HALF_OPEN;
      this.logger.info('Circuit breaker transitioning to HALF_OPEN', {
        name: this.name
      });
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();

      if (fallback && this.state === CircuitState.OPEN) {
        return await fallback();
      }

      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;

      if (this.successCount >= this.config.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.logger.info('Circuit breaker CLOSED', { name: this.name });
      }
    } else {
      this.failureCount = 0;
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.successCount = 0;

    if (
      this.state === CircuitState.HALF_OPEN ||
      this.failureCount >= this.config.failureThreshold
    ) {
      this.state = CircuitState.OPEN;
      this.nextAttempt = Date.now() + this.config.timeout;

      this.logger.error('Circuit breaker OPEN', {
        name: this.name,
        failureCount: this.failureCount,
        nextAttemptAt: new Date(this.nextAttempt).toISOString()
      });
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.logger.info('Circuit breaker manually reset', { name: this.name });
  }
}
```

### 14.3 Service-Specific Circuit Breakers

```typescript
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CircuitBreakerRegistry {
  private readonly breakers = new Map<string, CircuitBreaker>();
  private readonly logger = new Logger(CircuitBreakerRegistry.name);

  constructor() {
    this.initializeBreakers();
  }

  private initializeBreakers(): void {
    // Activity Service circuit breaker
    this.breakers.set('activity-service', new CircuitBreaker(
      'activity-service',
      {
        failureThreshold: 5,
        successThreshold: 2,
        timeout: 30000,        // 30s
        monitoringWindow: 10000 // 10s
      }
    ));

    // Reference Service circuit breaker
    this.breakers.set('reference-service', new CircuitBreaker(
      'reference-service',
      {
        failureThreshold: 5,
        successThreshold: 2,
        timeout: 30000,
        monitoringWindow: 10000
      }
    ));

    // Organization Service circuit breaker
    this.breakers.set('organization-service', new CircuitBreaker(
      'organization-service',
      {
        failureThreshold: 5,
        successThreshold: 2,
        timeout: 30000,
        monitoringWindow: 10000
      }
    ));

    // Database circuit breaker
    this.breakers.set('database', new CircuitBreaker(
      'database',
      {
        failureThreshold: 3,   // More sensitive
        successThreshold: 3,
        timeout: 60000,        // 60s longer recovery
        monitoringWindow: 5000
      }
    ));

    // Cache circuit breaker
    this.breakers.set('cache', new CircuitBreaker(
      'cache',
      {
        failureThreshold: 10,  // More tolerant (cache is nice-to-have)
        successThreshold: 2,
        timeout: 15000,        // 15s faster recovery
        monitoringWindow: 10000
      }
    ));

    this.logger.log('Circuit breakers initialized', {
      count: this.breakers.size
    });
  }

  getBreaker(name: string): CircuitBreaker {
    const breaker = this.breakers.get(name);
    if (!breaker) {
      throw new Error(`Circuit breaker not found: ${name}`);
    }
    return breaker;
  }

  async executeWithBreaker<T>(
    name: string,
    fn: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    const breaker = this.getBreaker(name);
    return await breaker.execute(fn, fallback);
  }

  getAllStates(): Record<string, CircuitState> {
    const states: Record<string, CircuitState> = {};
    for (const [name, breaker] of this.breakers.entries()) {
      states[name] = breaker.getState();
    }
    return states;
  }
}
```

### 14.4 Fallback Strategies

```typescript
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class FallbackStrategies {
  private readonly logger = new Logger(FallbackStrategies.name);

  constructor(
    private readonly cacheService: CalculationCacheService
  ) {}

  // Fallback: Use cached emission factor even if expired
  async getEmissionFactorWithFallback(
    parameterId: string,
    year: number,
    region: string
  ): Promise<EmissionFactor> {
    const breaker = this.circuitBreakers.getBreaker('reference-service');

    return await breaker.execute(
      // Primary: Call Reference Service
      async () => {
        return await this.referenceServiceClient.getEmissionFactor(
          parameterId,
          year,
          region
        );
      },
      // Fallback: Use stale cache or default
      async () => {
        this.logger.warn('Using fallback emission factor', {
          parameterId,
          year,
          region
        });

        // Try stale cache first
        const stale = await this.cacheService.getStaleEmissionFactor(
          parameterId,
          year,
          region
        );

        if (stale) {
          return stale;
        }

        // Last resort: Use previous year's EF
        const previousYear = await this.cacheService.getEmissionFactor(
          parameterId,
          year - 1,
          region
        );

        if (previousYear) {
          return { ...previousYear, year }; // Mark as estimated
        }

        throw new Error('No emission factor available (primary and fallback failed)');
      }
    );
  }

  // Fallback: Return cached aggregation even if outdated
  async getAggregationWithFallback(
    nodeId: string,
    year: number,
    dimensions: AggregationDimensions
  ): Promise<Aggregation> {
    const breaker = this.circuitBreakers.getBreaker('organization-service');

    return await breaker.execute(
      // Primary: Calculate fresh aggregation
      async () => {
        return await this.hierarchyAggregator.aggregateNode(
          nodeId,
          year,
          { dimensions, includeChildren: true }
        );
      },
      // Fallback: Return cached result (even if stale)
      async () => {
        this.logger.warn('Using fallback aggregation (stale cache)', {
          nodeId,
          year
        });

        const stale = await this.cacheService.getStaleAggregation(
          nodeId,
          year,
          dimensions
        );

        if (stale) {
          return { ...stale, isStale: true };
        }

        throw new Error('No aggregation available (primary and fallback failed)');
      }
    );
  }

  // Fallback: Skip calculation if Activity Service down
  async getActivityDataWithFallback(
    activityDataId: string
  ): Promise<ActivityData> {
    const breaker = this.circuitBreakers.getBreaker('activity-service');

    return await breaker.execute(
      // Primary: Call Activity Service
      async () => {
        return await this.activityServiceClient.getActivityData(activityDataId);
      },
      // Fallback: Throw specific error (no fallback for activity data)
      async () => {
        throw new Error(
          'Activity Service unavailable - cannot proceed with calculation'
        );
      }
    );
  }

  // Fallback: Proceed without cache if Redis down
  async getCachedCalculationWithFallback(
    activityDataId: string,
    version: number
  ): Promise<CalculationResult | null> {
    const breaker = this.circuitBreakers.getBreaker('cache');

    return await breaker.execute(
      // Primary: Get from cache
      async () => {
        return await this.cacheService.getCalculation(activityDataId, version);
      },
      // Fallback: Return null (proceed without cache)
      async () => {
        this.logger.warn('Cache unavailable, proceeding without cache', {
          activityDataId,
          version
        });
        return null;
      }
    );
  }
}
```

### 14.5 Circuit Breaker Monitoring

```typescript
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CircuitBreakerMonitoring {
  constructor(
    private readonly circuitBreakers: CircuitBreakerRegistry,
    private readonly prometheus: PrometheusService
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async monitorCircuitBreakers(): Promise<void> {
    const states = this.circuitBreakers.getAllStates();

    for (const [name, state] of Object.entries(states)) {
      // Update Prometheus metrics
      const stateValue = state === CircuitState.CLOSED ? 0 :
                        state === CircuitState.HALF_OPEN ? 1 : 2;

      this.prometheus
        .gauge('circuit_breaker_state')
        .labels({ service: name })
        .set(stateValue);

      // Alert if circuit is open
      if (state === CircuitState.OPEN) {
        this.logger.error('Circuit breaker OPEN', { service: name });
        // Trigger alert (PagerDuty, Slack, etc.)
      }
    }
  }

  // Health check endpoint includes circuit breaker states
  getHealthStatus(): Record<string, any> {
    const states = this.circuitBreakers.getAllStates();
    const allClosed = Object.values(states).every(s => s === CircuitState.CLOSED);

    return {
      circuitBreakers: states,
      healthy: allClosed
    };
  }
}
```

---

## 15. Performance SLOs (Service Level Objectives)

### 15.1 Target SLOs

| Operation | p50 | p95 | p99 | Availability | Notes |
|-----------|-----|-----|-----|--------------|-------|
| **Single Calculation** | < 50ms | < 100ms | < 200ms | 99.9% | With cache hit: < 10ms |
| **Batch Calculation (100)** | < 5s | < 10s | < 15s | 99.5% | Parallel processing |
| **Hierarchy Aggregation (5 levels)** | < 200ms | < 500ms | < 1000ms | 99.9% | With cache: < 50ms |
| **Scenario Calculation (1000 activities)** | < 15s | < 30s | < 60s | 99.0% | Queue-based async |
| **Cache Operations** | < 5ms | < 10ms | < 20ms | 99.95% | Redis performance |

### 15.2 Capacity Planning

**Current Baseline** (Sprint 0.2):
- Concurrent calculations: 50
- Calculations per second: 100
- Database connections: 50
- Cache memory: 2GB

**Phase 1 Target** (Sprint 1.4):
- Concurrent calculations: 200
- Calculations per second: 500
- Database connections: 100
- Cache memory: 4GB

**Production Target** (Phase 3):
- Concurrent calculations: 1000
- Calculations per second: 5000
- Database connections: 200
- Cache memory: 8GB
- Horizontal scaling: 5+ instances

### 15.3 Performance Benchmarks

```typescript
// Performance test script (K6)
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 10 },    // Ramp up to 10 users
    { duration: '5m', target: 50 },    // Sustain 50 users
    { duration: '10m', target: 100 },  // Peak load: 100 users
    { duration: '3m', target: 0 },     // Ramp down
  ],
  thresholds: {
    // SLO: p95 < 100ms
    'http_req_duration{scenario:single_calculation}': ['p(95)<100'],
    // SLO: p95 < 500ms
    'http_req_duration{scenario:aggregation}': ['p(95)<500'],
    // SLO: < 1% errors
    'http_req_failed': ['rate<0.01'],
    // SLO: > 80% cache hits
    'cache_hit_rate': ['value>0.8'],
  },
};

export default function () {
  // Test single calculation
  const calcPayload = JSON.stringify({
    activityDataId: __ENV.ACTIVITY_DATA_ID
  });

  const calcRes = http.post(
    `${__ENV.API_URL}/v1/calculations/single`,
    calcPayload,
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { scenario: 'single_calculation' }
    }
  );

  check(calcRes, {
    'single calc: status 200': (r) => r.status === 200,
    'single calc: p95 < 100ms': (r) => r.timings.duration < 100,
    'single calc: has result': (r) => r.json('emission') !== undefined
  });

  sleep(1);

  // Test aggregation
  const aggRes = http.post(
    `${__ENV.API_URL}/v1/aggregations/hierarchy`,
    JSON.stringify({
      rootNodeId: __ENV.ROOT_NODE_ID,
      year: 2024
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { scenario: 'aggregation' }
    }
  );

  check(aggRes, {
    'aggregation: status 200': (r) => r.status === 200,
    'aggregation: p95 < 500ms': (r) => r.timings.duration < 500,
    'aggregation: cache hit tracked': (r) => r.json('cacheHit') !== undefined
  });

  sleep(2);
}
```

### 15.4 Performance Monitoring

```typescript
import { Injectable } from '@nestjs/common';
import { Histogram, Counter, Gauge } from 'prom-client';

@Injectable()
export class PerformanceMetricsService {
  // Histograms for latency tracking
  private readonly calculationDuration: Histogram;
  private readonly aggregationDuration: Histogram;
  private readonly scenarioDuration: Histogram;

  // Counters for throughput
  private readonly calculationsTotal: Counter;
  private readonly calculationErrors: Counter;

  // Gauges for capacity
  private readonly activeCalculations: Gauge;
  private readonly queueDepth: Gauge;

  constructor() {
    this.calculationDuration = new Histogram({
      name: 'calculation_duration_seconds',
      help: 'Duration of emission calculations',
      labelNames: ['scope', 'trigger'],
      buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 5]
    });

    this.aggregationDuration = new Histogram({
      name: 'aggregation_duration_seconds',
      help: 'Duration of hierarchy aggregations',
      labelNames: ['levels', 'cache_hit'],
      buckets: [0.05, 0.1, 0.2, 0.5, 1, 2, 5]
    });

    this.scenarioDuration = new Histogram({
      name: 'scenario_calculation_duration_seconds',
      help: 'Duration of scenario calculations',
      labelNames: ['activity_count'],
      buckets: [5, 10, 15, 30, 60, 120]
    });

    this.calculationsTotal = new Counter({
      name: 'calculations_total',
      help: 'Total number of calculations',
      labelNames: ['scope', 'status']
    });

    this.calculationErrors = new Counter({
      name: 'calculation_errors_total',
      help: 'Total calculation errors',
      labelNames: ['error_type']
    });

    this.activeCalculations = new Gauge({
      name: 'active_calculations',
      help: 'Number of calculations currently in progress'
    });

    this.queueDepth = new Gauge({
      name: 'calculation_queue_depth',
      help: 'Number of calculations waiting in queue'
    });
  }

  // Track calculation performance
  async trackCalculation<T>(
    scope: string,
    trigger: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    this.activeCalculations.inc();

    try {
      const result = await fn();

      const duration = (Date.now() - startTime) / 1000;
      this.calculationDuration.labels(scope, trigger).observe(duration);
      this.calculationsTotal.labels(scope, 'success').inc();

      return result;
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      this.calculationDuration.labels(scope, trigger).observe(duration);
      this.calculationsTotal.labels(scope, 'error').inc();
      this.calculationErrors.labels(error.constructor.name).inc();
      throw error;
    } finally {
      this.activeCalculations.dec();
    }
  }

  // Track aggregation performance
  async trackAggregation<T>(
    levels: number,
    cacheHit: boolean,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();

    const result = await fn();

    const duration = (Date.now() - startTime) / 1000;
    this.aggregationDuration
      .labels(levels.toString(), cacheHit.toString())
      .observe(duration);

    return result;
  }

  // Update queue metrics
  updateQueueDepth(depth: number): void {
    this.queueDepth.set(depth);
  }
}
```

### 15.5 Performance Alerts

```yaml
# Prometheus alert rules
groups:
  - name: calculation_service_performance
    interval: 30s
    rules:
      # SLO violation: p95 latency > 100ms
      - alert: CalculationLatencyHigh
        expr: |
          histogram_quantile(0.95,
            rate(calculation_duration_seconds_bucket[5m])
          ) > 0.1
        for: 5m
        labels:
          severity: warning
          service: calculation-service
        annotations:
          summary: "Calculation p95 latency exceeds 100ms"
          description: "p95 latency is {{ $value }}s (threshold: 0.1s)"

      # SLO violation: p95 aggregation latency > 500ms
      - alert: AggregationLatencyHigh
        expr: |
          histogram_quantile(0.95,
            rate(aggregation_duration_seconds_bucket[5m])
          ) > 0.5
        for: 5m
        labels:
          severity: warning
          service: calculation-service
        annotations:
          summary: "Aggregation p95 latency exceeds 500ms"
          description: "p95 latency is {{ $value }}s (threshold: 0.5s)"

      # High error rate
      - alert: CalculationErrorRateHigh
        expr: |
          (
            rate(calculations_total{status="error"}[5m]) /
            rate(calculations_total[5m])
          ) > 0.01
        for: 5m
        labels:
          severity: critical
          service: calculation-service
        annotations:
          summary: "Calculation error rate exceeds 1%"
          description: "Error rate is {{ $value }}% (threshold: 1%)"

      # Queue depth high
      - alert: CalculationQueueDepthHigh
        expr: calculation_queue_depth > 1000
        for: 10m
        labels:
          severity: warning
          service: calculation-service
        annotations:
          summary: "Calculation queue depth high"
          description: "Queue depth is {{ $value }} (threshold: 1000)"

      # Cache hit rate low
      - alert: CacheHitRateLow
        expr: calculation_cache_hit_rate < 60
        for: 15m
        labels:
          severity: warning
          service: calculation-service
        annotations:
          summary: "Cache hit rate below 60%"
          description: "Hit rate is {{ $value }}% (threshold: 60%)"
```

---

## 16. Disaster Recovery

### 16.1 Recovery Time Objectives (RTO) & Recovery Point Objectives (RPO)

| Component | RTO | RPO | Backup Frequency | Recovery Priority |
|-----------|-----|-----|------------------|-------------------|
| **Calculation Results** | 4 hours | 1 hour | Continuous (WAL) | P1 |
| **Aggregation Cache** | 15 minutes | 0 (can recalculate) | Not backed up | P3 |
| **Calculation Methods** | 1 hour | 24 hours | Daily | P2 |
| **Scenarios** | 4 hours | 1 hour | Continuous (WAL) | P2 |
| **Service Configuration** | 30 minutes | 0 (in Git) | Not needed | P1 |

### 16.2 Backup Strategy

#### MongoDB Backup (Calculation Results)

```yaml
# MongoDB backup configuration
backup:
  type: continuous
  method: point-in-time-recovery

  # Snapshot schedule
  snapshots:
    frequency: hourly
    retention: 7 days
    destination: s3://clenergize-backups/calculation-service/mongodb/

  # Write-Ahead Log (WAL)
  oplog:
    enabled: true
    retention: 48 hours

  # Full backup
  full_backup:
    frequency: daily
    time: "02:00 UTC"
    retention: 30 days
```

#### Backup Automation

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

  constructor(
    private readonly mongoClient: MongoClient,
    private readonly s3: S3Client
  ) {}

  @Cron('0 2 * * *')  // Daily at 2 AM UTC
  async performDailyBackup(): Promise<void> {
    this.logger.log('Starting daily backup');

    const timestamp = new Date().toISOString().split('T')[0];
    const backupId = `calculation_${timestamp}`;

    try {
      // 1. Create MongoDB snapshot
      const db = this.mongoClient.db('clenergize_calculation');
      const collections = await db.listCollections().toArray();

      for (const collInfo of collections) {
        const collectionName = collInfo.name;
        const data = await db.collection(collectionName).find({}).toArray();

        // 2. Upload to S3
        await this.s3.send(new PutObjectCommand({
          Bucket: 'clenergize-backups',
          Key: `calculation-service/mongodb/${backupId}/${collectionName}.json`,
          Body: JSON.stringify(data),
          ServerSideEncryption: 'AES256'
        }));

        this.logger.log(`Backed up collection: ${collectionName}`);
      }

      // 3. Create backup manifest
      await this.createBackupManifest(backupId, collections.map(c => c.name));

      this.logger.log(`Daily backup completed: ${backupId}`);

    } catch (error) {
      this.logger.error('Backup failed', error);
      // Trigger alert
      throw error;
    }
  }

  private async createBackupManifest(
    backupId: string,
    collections: string[]
  ): Promise<void> {
    const manifest = {
      backupId,
      timestamp: new Date().toISOString(),
      service: 'calculation-service',
      database: 'clenergize_calculation',
      collections,
      status: 'completed'
    };

    await this.s3.send(new PutObjectCommand({
      Bucket: 'clenergize-backups',
      Key: `calculation-service/mongodb/${backupId}/manifest.json`,
      Body: JSON.stringify(manifest, null, 2)
    }));
  }
}
```

### 16.3 Restoration Procedures

#### Full Service Restoration

```bash
#!/bin/bash
# restoration_script.sh

set -e

BACKUP_ID=$1
BACKUP_BUCKET="clenergize-backups"
SERVICE="calculation-service"

echo "Starting restoration for backup: $BACKUP_ID"

# 1. Download backup manifest
aws s3 cp \
  "s3://$BACKUP_BUCKET/$SERVICE/mongodb/$BACKUP_ID/manifest.json" \
  /tmp/manifest.json

# 2. Parse collections from manifest
COLLECTIONS=$(jq -r '.collections[]' /tmp/manifest.json)

# 3. Restore each collection
for COLLECTION in $COLLECTIONS; do
  echo "Restoring collection: $COLLECTION"

  # Download backup
  aws s3 cp \
    "s3://$BACKUP_BUCKET/$SERVICE/mongodb/$BACKUP_ID/$COLLECTION.json" \
    "/tmp/$COLLECTION.json"

  # Import to MongoDB
  mongoimport \
    --uri "$MONGODB_URI" \
    --db clenergize_calculation \
    --collection "$COLLECTION" \
    --file "/tmp/$COLLECTION.json" \
    --jsonArray \
    --drop

  echo "Restored: $COLLECTION"
done

# 4. Verify restoration
echo "Verifying restoration..."
mongo "$MONGODB_URI" --eval "
  db.calculation_results.count();
  db.aggregations.count();
  db.scenarios.count();
"

echo "Restoration completed successfully"
```

#### Point-in-Time Recovery (PITR)

```bash
#!/bin/bash
# pitr_restore.sh

TARGET_TIME=$1  # ISO 8601 format: 2025-11-18T10:30:00Z

echo "Performing point-in-time recovery to: $TARGET_TIME"

# 1. Find latest snapshot before target time
SNAPSHOT_ID=$(aws backup list-recovery-points \
  --backup-vault-name calculation-service-vault \
  --query "RecoveryPoints[?CreationDate<'$TARGET_TIME'] | [-1].RecoveryPointArn" \
  --output text)

echo "Using snapshot: $SNAPSHOT_ID"

# 2. Restore from snapshot
aws backup start-restore-job \
  --recovery-point-arn "$SNAPSHOT_ID" \
  --iam-role-arn "$RESTORE_ROLE_ARN" \
  --metadata "{
    \"targetTime\": \"$TARGET_TIME\"
  }"

# 3. Wait for restore job to complete
# ... (implementation)

# 4. Replay oplog to target time
# ... (implementation)

echo "PITR completed"
```

### 16.4 Disaster Scenarios & Response

#### Scenario 1: Database Corruption

**Detection**: Health check failures, query errors

**Response**:
1. Switch to read-only mode
2. Identify last good backup
3. Restore from backup (RTO: 4 hours)
4. Replay oplog to minimize data loss
5. Recalculate recent results if needed

#### Scenario 2: Complete Region Failure

**Detection**: AWS region unavailability, multiple service failures

**Response**:
1. Activate DR region (AWS us-west-2)
2. Redirect traffic via Route53
3. Restore from cross-region backup (RTO: 6 hours)
4. Verify data integrity
5. Resume operations in DR region

#### Scenario 3: Data Center Outage

**Detection**: All services in availability zone unavailable

**Response**:
1. Auto-failover to other availability zones
2. Rebalance load across remaining zones
3. No data loss (multi-AZ replication)
4. RTO: 15 minutes (automatic)

#### Scenario 4: Accidental Data Deletion

**Detection**: User report, audit log review

**Response**:
1. Identify deletion timestamp
2. Perform PITR to moment before deletion
3. Restore affected records only (selective restore)
4. RTO: 2 hours, RPO: 0 (oplog replay)

### 16.5 Regular DR Testing

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class DisasterRecoveryTestingService {
  private readonly logger = new Logger(DisasterRecoveryTestingService.name);

  @Cron('0 0 1 * *')  // Monthly on 1st day at midnight
  async performDRTest(): Promise<void> {
    this.logger.log('Starting monthly DR test');

    const testResults = {
      testDate: new Date(),
      scenarios: []
    };

    try {
      // Test 1: Backup integrity
      const backupTest = await this.testBackupIntegrity();
      testResults.scenarios.push(backupTest);

      // Test 2: Restore procedure
      const restoreTest = await this.testRestoreProcedure();
      testResults.scenarios.push(restoreTest);

      // Test 3: Failover to DR region
      const failoverTest = await this.testRegionalFailover();
      testResults.scenarios.push(failoverTest);

      // Generate report
      await this.generateDRReport(testResults);

      this.logger.log('DR test completed successfully');

    } catch (error) {
      this.logger.error('DR test failed', error);
      // Alert on-call engineer
      throw error;
    }
  }

  private async testBackupIntegrity(): Promise<any> {
    // 1. Download latest backup
    // 2. Verify checksums
    // 3. Validate data structure
    return {
      scenario: 'backup_integrity',
      status: 'passed',
      duration: 300  // seconds
    };
  }

  private async testRestoreProcedure(): Promise<any> {
    // 1. Restore to isolated test environment
    // 2. Verify data completeness
    // 3. Run integration tests
    return {
      scenario: 'restore_procedure',
      status: 'passed',
      rto: 3600,  // seconds
      rpo: 0
    };
  }

  private async testRegionalFailover(): Promise<any> {
    // 1. Simulate region failure
    // 2. Activate DR region
    // 3. Verify service availability
    return {
      scenario: 'regional_failover',
      status: 'passed',
      failoverTime: 900  // seconds
    };
  }

  private async generateDRReport(results: any): Promise<void> {
    // Generate and email report to stakeholders
    this.logger.log('DR test report generated', results);
  }
}
```

---

## 17. OpenAPI Specification

### 17.1 Swagger Configuration

```typescript
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Calculation Service API')
    .setDescription(`
      The Calculation Service is responsible for:
      - GHG Protocol emission calculations (Scope 1, 2, 3)
      - Hierarchy aggregation and rollups
      - Emission allocation algorithms
      - What-if scenario modeling
      - Calculation history and versioning
    `)
    .setVersion('1.0.0')
    .setContact(
      'Clenergize Support',
      'https://clenergize.com/support',
      'support@clenergize.com'
    )
    .setLicense('Proprietary', 'https://clenergize.com/license')
    .addServer('http://localhost:3005', 'Local Development')
    .addServer('https://dev-api.clenergize.com', 'Development')
    .addServer('https://staging-api.clenergize.com', 'Staging')
    .addServer('https://api.clenergize.com', 'Production')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token from Identity Service'
      },
      'JWT-auth'
    )
    .addTag('calculations', 'Emission calculation operations')
    .addTag('aggregations', 'Hierarchy aggregation operations')
    .addTag('allocations', 'Emission allocation operations')
    .addTag('scenarios', 'What-if scenario modeling')
    .addTag('history', 'Calculation history and versioning')
    .addTag('cache', 'Cache management (admin only)')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Serve Swagger UI
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Calculation Service API',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      syntaxHighlight: {
        activated: true,
        theme: 'monokai'
      }
    }
  });

  // Export OpenAPI spec as JSON
  const fs = require('fs');
  fs.writeFileSync(
    './openapi-spec.json',
    JSON.stringify(document, null, 2)
  );
}
```

### 17.2 API Endpoint Documentation

```typescript
import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody
} from '@nestjs/swagger';

@ApiTags('calculations')
@ApiBearerAuth('JWT-auth')
@Controller('v1/calculations')
export class CalculationsController {

  @Post('single')
  @ApiOperation({
    summary: 'Calculate emissions for single activity data',
    description: `
      Calculates GHG emissions for a single activity data record using
      the appropriate calculation method, emission factor, and conversion factors.

      **Process**:
      1. Fetch activity data from Activity Service
      2. Validate activity data is verified
      3. Determine calculation method (Scope 1/2/3 specific)
      4. Fetch emission factor from Reference Service
      5. Apply conversion factors if needed
      6. Execute calculation formula
      7. Calculate uncertainty bounds
      8. Store result with version tracking
      9. Publish calculation.emission.calculated.v1 event
      10. Invalidate aggregation cache

      **Performance**: p95 < 100ms (with cache hit: < 10ms)
    `
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['activityDataId'],
      properties: {
        activityDataId: {
          type: 'string',
          format: 'uuid',
          description: 'UUID of activity data record',
          example: '123e4567-e89b-12d3-a456-426614174000'
        },
        emissionFactorId: {
          type: 'string',
          format: 'uuid',
          description: 'Optional: Override default emission factor',
          example: '223e4567-e89b-12d3-a456-426614174001'
        },
        calculationMethod: {
          type: 'string',
          description: 'Optional: Override calculation method',
          example: 'CALC-001'
        },
        metadata: {
          type: 'object',
          properties: {
            triggeredBy: {
              type: 'string',
              description: 'User ID or "system"'
            },
            reason: {
              type: 'string',
              enum: ['data_verified', 'manual_recalc', 'scenario']
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Calculation successful',
    schema: {
      type: 'object',
      properties: {
        calculationId: { type: 'string', format: 'uuid' },
        activityDataId: { type: 'string', format: 'uuid' },
        emission: { type: 'number', description: 'tCO2e' },
        uncertainty: {
          type: 'object',
          properties: {
            lower: { type: 'number' },
            upper: { type: 'number' },
            qualityScore: { type: 'integer', enum: [1, 2, 3, 4] }
          }
        },
        calculation: {
          type: 'object',
          properties: {
            method: { type: 'string' },
            formula: { type: 'string' },
            version: { type: 'string' }
          }
        },
        calculatedAt: { type: 'string', format: 'date-time' },
        calculatedBy: { type: 'string', format: 'uuid' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error (CALC_VAL_001, CALC_VAL_002)'
  })
  @ApiResponse({
    status: 404,
    description: 'Activity data not found (CALC_RES_001)'
  })
  @ApiResponse({
    status: 422,
    description: 'Processing error (CALC_PROC_001 - CALC_PROC_010)'
  })
  @ApiResponse({
    status: 424,
    description: 'Dependency unavailable (CALC_DEP_001 - CALC_DEP_005)'
  })
  async calculateSingle(
    @Body() dto: CalculateSingleDto
  ): Promise<CalculationResult> {
    return await this.calculationService.calculateSingle(dto);
  }

  @Post('batch')
  @ApiOperation({
    summary: 'Calculate emissions for multiple activity data records',
    description: 'Batch calculation with parallel processing (max 1000 records)'
  })
  @ApiResponse({ status: 202, description: 'Batch accepted for processing' })
  async calculateBatch(
    @Body() dto: CalculateBatchDto
  ): Promise<BatchJobResponse> {
    return await this.calculationService.calculateBatch(dto);
  }

  // Additional endpoints...
}

@ApiTags('aggregations')
@ApiBearerAuth('JWT-auth')
@Controller('v1/aggregations')
export class AggregationsController {

  @Post('hierarchy')
  @ApiOperation({
    summary: 'Aggregate emissions across organizational hierarchy',
    description: `
      Performs bottom-up aggregation of emissions from leaf nodes to root.
      Supports multi-dimensional grouping (scope, category, month).
      Results are cached for 1 hour with smart invalidation.

      **Performance**: p95 < 500ms (with cache hit: < 50ms)
    `
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['rootNodeId', 'year'],
      properties: {
        rootNodeId: {
          type: 'string',
          format: 'uuid',
          description: 'Company, Entity, Subsidiary, or Location ID'
        },
        year: {
          type: 'integer',
          minimum: 1990,
          maximum: 2100
        },
        dimensions: {
          type: 'object',
          properties: {
            scope: { type: 'boolean', default: true },
            category: { type: 'boolean', default: true },
            month: { type: 'boolean', default: false }
          }
        },
        includeChildren: {
          type: 'boolean',
          default: true,
          description: 'Include emissions from child nodes'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Aggregation successful',
    schema: {
      type: 'object',
      properties: {
        aggregationId: { type: 'string', format: 'uuid' },
        rootNode: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            type: { type: 'string', enum: ['Company', 'Entity', 'Subsidiary', 'Location'] }
          }
        },
        year: { type: 'integer' },
        totals: {
          type: 'object',
          properties: {
            direct: { type: 'number', description: 'tCO2e' },
            indirect: { type: 'number', description: 'tCO2e' },
            total: { type: 'number', description: 'tCO2e' }
          }
        },
        byScope: {
          type: 'object',
          properties: {
            scope1: { type: 'number' },
            scope2: { type: 'number' },
            scope3: { type: 'number' }
          }
        },
        cacheHit: { type: 'boolean' }
      }
    }
  })
  async aggregateHierarchy(
    @Body() dto: AggregateHierarchyDto
  ): Promise<Aggregation> {
    return await this.aggregationService.aggregateHierarchy(dto);
  }
}
```

### 17.3 DTO Schemas

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsEnum, IsObject } from 'class-validator';

export class CalculateSingleDto {
  @ApiProperty({
    description: 'UUID of activity data record',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  activityDataId: string;

  @ApiPropertyOptional({
    description: 'Override default emission factor',
    example: '223e4567-e89b-12d3-a456-426614174001'
  })
  @IsUUID()
  @IsOptional()
  emissionFactorId?: string;

  @ApiPropertyOptional({
    description: 'Override calculation method',
    example: 'CALC-001'
  })
  @IsOptional()
  calculationMethod?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata'
  })
  @IsObject()
  @IsOptional()
  metadata?: {
    triggeredBy?: string;
    reason?: 'data_verified' | 'manual_recalc' | 'scenario';
  };
}

export class AggregateHierarchyDto {
  @ApiProperty({
    description: 'Root node ID (Company, Entity, Subsidiary, or Location)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  rootNodeId: string;

  @ApiProperty({
    description: 'Year for aggregation',
    example: 2024,
    minimum: 1990,
    maximum: 2100
  })
  year: number;

  @ApiPropertyOptional({
    description: 'Aggregation dimensions',
    example: { scope: true, category: true, month: false }
  })
  @IsOptional()
  dimensions?: {
    scope?: boolean;
    category?: boolean;
    month?: boolean;
  };

  @ApiPropertyOptional({
    description: 'Include child nodes in aggregation',
    default: true
  })
  @IsOptional()
  includeChildren?: boolean;
}
```

---

## 18. Security Hardening

### 18.1 Input Validation (Zod Schemas)

```typescript
import { z } from 'zod';

// Request validation schemas
export const CalculateSingleRequestSchema = z.object({
  activityDataId: z.string().uuid({
    message: 'Activity data ID must be a valid UUID'
  }),
  emissionFactorId: z.string().uuid().optional(),
  calculationMethod: z.string().max(50).optional(),
  metadata: z.object({
    triggeredBy: z.string().uuid(),
    reason: z.enum(['data_verified', 'manual_recalc', 'scenario'])
  }).optional()
}).strict();  // Reject unknown fields

export const AggregateHierarchyRequestSchema = z.object({
  rootNodeId: z.string().uuid(),
  year: z.number().int().min(1990).max(2100),
  dimensions: z.object({
    scope: z.boolean().optional(),
    category: z.boolean().optional(),
    month: z.boolean().optional()
  }).optional(),
  includeChildren: z.boolean().optional()
}).strict();

export const CreateAllocationRequestSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  emissionSourceId: z.string().uuid(),
  allocationType: z.enum(['headcount', 'revenue', 'floorArea', 'custom']),
  targets: z.array(z.object({
    entityId: z.string().uuid(),
    allocationValue: z.number().positive()
  })).min(2).max(100),
  year: z.number().int().min(1990).max(2100),
  notes: z.string().max(1000).optional()
}).strict();

// Validation middleware
@Injectable()
export class ValidationMiddleware implements NestMiddleware {
  constructor(private readonly schema: z.ZodType) {}

  use(req: Request, res: Response, next: NextFunction) {
    try {
      this.schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new BadRequestException({
          code: 'CALC_VAL_001',
          message: 'Validation failed',
          errors: error.errors
        });
      }
      throw error;
    }
  }
}
```

### 18.2 Authorization Guards

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class CalculationAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private identityService: IdentityServiceClient
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Extract required permissions from decorator
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler()
    );

    if (!requiredPermissions) {
      return true;  // No specific permissions required
    }

    // Check if user has required permissions
    const hasPermission = await this.identityService.checkPermissions(
      user.id,
      requiredPermissions
    );

    if (!hasPermission) {
      throw new ForbiddenException({
        code: 'CALC_AUTH_001',
        message: 'User not authorized to perform calculations'
      });
    }

    // Additional checks for resource ownership
    if (request.params.projectId) {
      const hasProjectAccess = await this.identityService.hasProjectAccess(
        user.id,
        request.params.projectId
      );

      if (!hasProjectAccess) {
        throw new ForbiddenException({
          code: 'CALC_AUTH_001',
          message: 'User not authorized to calculate emissions for this project'
        });
      }
    }

    return true;
  }
}

// Usage in controllers
@Controller('v1/calculations')
@UseGuards(JwtAuthGuard, CalculationAuthGuard)
export class CalculationsController {

  @Post('single')
  @Permissions('calculation:create')
  async calculateSingle(
    @Body() dto: CalculateSingleDto,
    @User() user: UserContext
  ): Promise<CalculationResult> {
    // Implementation
  }

  @Delete('cache/invalidate')
  @Permissions('calculation:admin')
  async invalidateCache(
    @Body() dto: InvalidateCacheDto
  ): Promise<void> {
    // Only admins can invalidate cache
  }
}
```

### 18.3 Rate Limiting

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  constructor(private readonly redis: Redis) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const userId = req.user?.id || req.ip;
    const endpoint = req.path;

    // Define rate limits per endpoint
    const limits = {
      '/v1/calculations/single': { requests: 100, window: 60 },  // 100 req/min
      '/v1/calculations/batch': { requests: 10, window: 60 },    // 10 req/min
      '/v1/aggregations/hierarchy': { requests: 50, window: 60 }, // 50 req/min
      default: { requests: 200, window: 60 }  // 200 req/min
    };

    const limit = limits[endpoint] || limits.default;
    const key = `ratelimit:${userId}:${endpoint}`;

    // Increment counter
    const current = await this.redis.incr(key);

    if (current === 1) {
      await this.redis.expire(key, limit.window);
    }

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', limit.requests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limit.requests - current));
    res.setHeader('X-RateLimit-Reset', Math.ceil(Date.now() / 1000) + limit.window);

    if (current > limit.requests) {
      throw new TooManyRequestsException({
        code: 'CALC_SYS_005',
        message: 'Rate limit exceeded',
        retryAfter: limit.window
      });
    }

    next();
  }
}
```

### 18.4 SQL/NoSQL Injection Prevention

```typescript
import { Injectable } from '@nestjs/common';
import { MongoClient, ObjectId } from 'mongodb';

@Injectable()
export class CalculationRepository {
  constructor(private readonly mongo: MongoClient) {}

  // SECURE: Use parameterized queries
  async findCalculationsByProject(projectId: string): Promise<CalculationResult[]> {
    const db = this.mongo.db('clenergize_calculation');

    // ✅ CORRECT: projectId is safely escaped by MongoDB driver
    return await db.collection('calculation_results').find({
      projectId: new ObjectId(projectId)
    }).toArray();
  }

  // SECURE: Validate and sanitize all inputs
  async searchCalculations(filters: any): Promise<CalculationResult[]> {
    const db = this.mongo.db('clenergize_calculation');

    // ✅ Build safe query with allowlist
    const safeQuery: any = {};

    if (filters.projectId) {
      safeQuery.projectId = new ObjectId(filters.projectId);
    }

    if (filters.scope && ['Scope 1', 'Scope 2', 'Scope 3'].includes(filters.scope)) {
      safeQuery.scope = filters.scope;
    }

    if (filters.year && typeof filters.year === 'number') {
      safeQuery.year = filters.year;
    }

    return await db.collection('calculation_results').find(safeQuery).toArray();
  }

  // ❌ DANGEROUS: Never do this!
  // async dangerousSearch(query: string): Promise<any> {
  //   return await db.collection('calculation_results').find(eval(query));  // NEVER!
  // }
}
```

### 18.5 Secrets Management

```typescript
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

@Injectable()
export class SecretsService {
  private readonly client: SecretsManagerClient;
  private readonly cache = new Map<string, { value: any; expiresAt: number }>();

  constructor() {
    this.client = new SecretsManagerClient({
      region: process.env.AWS_REGION || 'us-east-1'
    });
  }

  async getSecret(secretName: string): Promise<any> {
    // Check cache first (5 minute TTL)
    const cached = this.cache.get(secretName);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    // Fetch from AWS Secrets Manager
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const response = await this.client.send(command);

    const secret = JSON.parse(response.SecretString!);

    // Cache for 5 minutes
    this.cache.set(secretName, {
      value: secret,
      expiresAt: Date.now() + 300000
    });

    return secret;
  }
}

// Usage
@Injectable()
export class CalculationService {
  constructor(private readonly secrets: SecretsService) {}

  async initialize(): Promise<void> {
    // ✅ CORRECT: Fetch secrets from AWS Secrets Manager
    const dbCredentials = await this.secrets.getSecret('calculation/mongodb');
    this.mongoUri = dbCredentials.uri;

    // ❌ NEVER hardcode secrets!
    // this.mongoUri = 'mongodb://admin:password123@localhost:27017';
  }
}
```

### 18.6 Security Headers

```typescript
import helmet from 'helmet';

export function configureSecurityHeaders(app: INestApplication): void {
  app.use(helmet({
    // Content Security Policy
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'none'"],
        frameSrc: ["'none'"]
      }
    },
    // Strict Transport Security (HSTS)
    hsts: {
      maxAge: 31536000,  // 1 year
      includeSubDomains: true,
      preload: true
    },
    // X-Frame-Options
    frameguard: {
      action: 'deny'
    },
    // X-Content-Type-Options
    noSniff: true,
    // X-XSS-Protection
    xssFilter: true,
    // Referrer Policy
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin'
    }
  }));

  // Additional security headers
  app.use((req, res, next) => {
    res.setHeader('X-Service-Name', 'calculation-service');
    res.setHeader('X-Service-Version', process.env.VERSION || '1.0.0');
    next();
  });
}
```

---

## Appendix A: Calculation Method Reference

### Scope 1: Direct Emissions

#### Stationary Combustion (CALC-001)
```
Emission (tCO2e) = Fuel Quantity (L or m³) × Fuel Density (kg/L) × NCV (MJ/kg) × EF (kgCO2e/MJ) / 1000

Where:
- NCV = Net Calorific Value
- EF = Emission Factor (includes CO2, CH4, N2O)
```

#### Mobile Combustion (CALC-002)
```
Emission (tCO2e) = Distance (km) × Fuel Efficiency (L/km) × Fuel EF (kgCO2e/L) / 1000

Alternative:
Emission (tCO2e) = Fuel Quantity (L) × Fuel EF (kgCO2e/L) / 1000
```

#### Fugitive Emissions - Refrigerants (CALC-004)
```
Emission (tCO2e) = Refrigerant Mass (kg) × GWP

Where:
- GWP = Global Warming Potential (e.g., R-134a = 1430)
```

### Scope 2: Indirect Emissions from Purchased Energy

#### Location-Based Method (CALC-003a)
```
Emission (tCO2e) = Electricity (kWh) × Grid EF (kgCO2e/kWh) / 1000

Where:
- Grid EF = Regional grid average emission factor
```

#### Market-Based Method (CALC-003b)
```
Emission (tCO2e) = Electricity (kWh) × Supplier EF (kgCO2e/kWh) / 1000

Where:
- Supplier EF = Specific supplier/contract emission factor
- If renewable energy certificates: Supplier EF = 0
```

### Scope 3: Other Indirect Emissions

#### Purchased Goods & Services - Spend-Based (CALC-005)
```
Emission (tCO2e) = Spend ($) × EEIO EF (kgCO2e/$) / 1000

Where:
- EEIO = Environmentally-Extended Input-Output
```

#### Employee Commuting (CALC-007)
```
Emission (tCO2e) = Distance (km/day) × Days (working days) × Employees × Transport Mode EF (kgCO2e/km) / 1000
```

#### Business Travel - Air (CALC-008)
```
Emission (tCO2e) = Distance (km) × Passengers × Flight Class Factor × Aircraft EF (kgCO2e/km) / 1000

Where:
- Flight Class Factor: Economy = 1.0, Business = 2.0, First = 3.0
- Aircraft EF varies by haul distance (short/medium/long)
```

---

## Appendix B: Error Codes

| Code | Error | Description | Resolution |
|------|-------|-------------|------------|
| `CALC-001` | `UnverifiedActivityDataError` | Activity data not verified | Verify data first |
| `CALC-002` | `MissingEmissionFactorError` | No EF found for parameter | Contact admin to add EF |
| `CALC-003` | `InvalidFormulaError` | Calculation formula invalid | Check method configuration |
| `CALC-004` | `CalculationTimeoutError` | Calculation exceeded timeout | Retry or optimize query |
| `CALC-005` | `InvalidAllocationError` | Allocation proportions invalid | Fix allocation values |
| `CALC-006` | `CircularReferenceError` | Hierarchy has circular ref | Fix hierarchy structure |
| `CALC-007` | `ScenarioNotFoundError` | Scenario doesn't exist | Check scenario ID |
| `CALC-008` | `AggregationCacheError` | Cache invalidation failed | Retry with force=true |

---

## Appendix C: Event Schemas

### `calculation.emission.calculated.v1`

```typescript
{
  id: string;                      // Event ID (UUID)
  type: 'calculation.emission.calculated.v1';
  version: '1.0.0';
  occurredAt: string;              // ISO 8601
  aggregateId: string;             // Calculation ID
  aggregateType: 'CalculationResult';
  correlationId: string;           // Request trace ID
  data: {
    calculationId: string;
    activityDataId: string;
    projectId: string;
    entityId: string;
    emission: number;              // tCO2e
    scope: 'Scope 1' | 'Scope 2' | 'Scope 3';
    category: string;
    year: number;
    month?: number;
    calculatedBy: string;          // User ID
  };
}
```

### `calculation.rollup.completed.v1`

```typescript
{
  id: string;
  type: 'calculation.rollup.completed.v1';
  version: '1.0.0';
  occurredAt: string;
  aggregateId: string;             // Aggregation ID
  aggregateType: 'Aggregation';
  correlationId: string;
  data: {
    aggregationId: string;
    nodeId: string;
    nodeName: string;
    nodeType: 'Company' | 'Entity' | 'Subsidiary' | 'Location';
    year: number;
    totalEmission: number;         // tCO2e
    directEmission: number;
    indirectEmission: number;
    childCount: number;
  };
}
```

### `calculation.allocation.created.v1`

```typescript
{
  id: string;
  type: 'calculation.allocation.created.v1';
  version: '1.0.0';
  occurredAt: string;
  aggregateId: string;             // Allocation ID
  aggregateType: 'Allocation';
  correlationId: string;
  data: {
    allocationId: string;
    name: string;
    totalEmission: number;
    allocationType: 'headcount' | 'revenue' | 'floorArea' | 'custom';
    targetCount: number;
    year: number;
    createdBy: string;
  };
}
```

### `calculation.scenario.completed.v1`

```typescript
{
  id: string;
  type: 'calculation.scenario.completed.v1';
  version: '1.0.0';
  occurredAt: string;
  aggregateId: string;             // Scenario ID
  aggregateType: 'Scenario';
  correlationId: string;
  data: {
    scenarioId: string;
    name: string;
    baselineEmission: number;
    projectedEmission: number;
    reduction: number;             // Absolute reduction (tCO2e)
    reductionPercentage: number;   // % reduction
    overrideCount: number;
  };
}
```

---

**END OF SPECIFICATION**

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-18 | Calculation Agent | Initial specification |

**Next Review**: End of Week 1 (Design Phase)

**Stakeholder Approval**: [ ] Architecture Agent [ ] Security Agent [ ] Master Coordinator
