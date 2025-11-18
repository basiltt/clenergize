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
