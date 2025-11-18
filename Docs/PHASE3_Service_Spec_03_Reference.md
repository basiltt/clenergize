# Service Specification: Reference Service

## Service Overview

**Service Name**: Reference Service
**Port**: 3003
**Purpose**: Manages emission factors, conversion factors, and calculation parameters
**Domain**: Reference Data Management
**Team Ownership**: Data Team

## 1. Functional Requirements

### 1.1 Core Features

#### Emission Factor Management
- CRUD operations for emission factors
- Version control with temporal validity
- Quality control workflow (Draft → Review → Approved)
- Source tracking and citations
- Geographic and industry applicability
- Batch import from recognized databases
- Factor change notifications

#### Conversion Factor Management
- Unit conversion definitions
- Energy conversions (GJ, kWh, BTU, etc.)
- Mass/volume conversions
- Custom conversion factors per project
- Reciprocal validation

#### Parameter Management
- Global warming potentials (GWP)
- Calculation constants
- Regional parameters
- Industry-specific parameters
- Regulatory thresholds

#### Master Data Management
- Reporting years and standards
- Scope definitions (1, 2, 3 categories)
- Activity type classifications
- Geographic regions and codes

### 1.2 API Endpoints

#### Emission Factor Endpoints
```yaml
GET /v1/emission-factors
  Query:
    - category: string (scope/type)
    - geography: string (country/region)
    - industry: string (NAICS/SIC)
    - year: number
    - source: string
    - status: draft|review|approved
    - search: string
    - page: number
    - limit: number
  Response:
    - factors: EmissionFactor[]
    - total: number

GET /v1/emission-factors/:factorId
  Response:
    - factor: EmissionFactor
    - history: FactorVersion[]

POST /v1/emission-factors
  Request:
    - category:
        scope: 1|2|3
        type: string
        subtype: string
    - value:
        amount: number
        unit: string (kg CO2e/unit)
        uncertainty: number (%)
    - applicability:
        geography: string[]
        industry: string[]
        dateRange: {from, to}
    - source:
        name: string
        year: number
        url: string
        citation: string
  Response:
    - factorId: string
    - factor: EmissionFactor

PUT /v1/emission-factors/:factorId
  Request:
    - Similar to POST (creates new version)
  Response:
    - factor: EmissionFactor
    - version: number

POST /v1/emission-factors/:factorId/approve
  Request:
    - comments: string
    - effectiveFrom: ISO8601
  Response:
    - factor: EmissionFactor
    - approvedAt: ISO8601

POST /v1/emission-factors/:factorId/reject
  Request:
    - reason: string
    - comments: string
  Response:
    - factor: EmissionFactor

POST /v1/emission-factors/import
  Request:
    - source: string (EPA|DEFRA|IPCC|Custom)
    - file: base64 or S3 URL
    - mappings: object
    - autoApprove: boolean
  Response:
    - importId: string
    - status: processing|complete|failed
    - imported: number
    - failed: number

GET /v1/emission-factors/search
  Request:
    - activityType: string
    - location: string
    - date: ISO8601
  Response:
    - recommendations: EmissionFactor[]
    - exactMatches: EmissionFactor[]
    - alternatives: EmissionFactor[]
```

#### Conversion Factor Endpoints
```yaml
GET /v1/conversions
  Query:
    - fromUnit: string
    - toUnit: string
    - category: string
  Response:
    - conversions: ConversionFactor[]

POST /v1/conversions
  Request:
    - fromUnit: string
    - toUnit: string
    - factor: number
    - category: string
    - bidirectional: boolean
  Response:
    - conversionId: string
    - conversion: ConversionFactor

GET /v1/conversions/convert
  Query:
    - value: number
    - fromUnit: string
    - toUnit: string
  Response:
    - result: number
    - factor: number
    - path: string[] (conversion chain)
```

#### Parameter Endpoints
```yaml
GET /v1/parameters
  Query:
    - category: string
    - name: string
    - year: number
  Response:
    - parameters: Parameter[]

PUT /v1/parameters/:parameterId
  Request:
    - value: any
    - effectiveFrom: ISO8601
  Response:
    - parameter: Parameter

GET /v1/parameters/gwp
  Query:
    - gas: string (CO2|CH4|N2O|...)
    - standard: string (AR6|AR5|AR4)
  Response:
    - gwp: number
    - source: string
```

#### Master Data Endpoints
```yaml
GET /v1/reporting-years
  Response:
    - years: ReportingYear[]
    - activeYear: ReportingYear

POST /v1/reporting-years
  Request:
    - year: number
    - standards: array
    - isActive: boolean
  Response:
    - yearId: string
    - year: ReportingYear

GET /v1/scopes
  Response:
    - scopes: ScopeDefinition[]

GET /v1/activity-types
  Query:
    - scope: string
    - category: string
  Response:
    - types: ActivityType[]

GET /v1/regions
  Query:
    - level: country|state|city
    - parent: string
  Response:
    - regions: Region[]
```

### 1.3 Business Rules

1. **Emission Factor Rules**:
   - Approved factors cannot be modified (new version required)
   - Only one active version per category/geography/time
   - Factors must have source citation
   - Uncertainty must be documented
   - QC approval required for production use

2. **Conversion Rules**:
   - Conversions must be mathematically consistent
   - Reciprocal conversions auto-generated if bidirectional
   - Custom conversions override defaults
   - Chain conversions limited to 3 hops

3. **Parameter Rules**:
   - System parameters require admin approval
   - Parameters versioned with effective dates
   - Cannot delete parameters in use

## 2. Data Model

### 2.1 MongoDB Collections

#### emission_factors Collection
```javascript
{
  _id: ObjectId,
  factorId: String (UUID, indexed),
  version: Number,

  category: {
    scope: String (1|2|3),
    type: String,
    subtype: String,
    activityType: String,
    tags: [String]
  },

  value: {
    amount: Number,
    unit: String,
    uncertainty: Number,
    confidenceLevel: String (high|medium|low)
  },

  applicability: {
    geography: {
      countries: [String],
      regions: [String],
      global: Boolean
    },
    industry: {
      codes: [String],
      sectors: [String]
    },
    temporal: {
      effectiveFrom: Date,
      effectiveTo: Date,
      reportingYear: Number
    },
    conditions: Object
  },

  source: {
    database: String (EPA|DEFRA|IPCC|Custom),
    name: String,
    year: Number,
    version: String,
    url: String,
    citation: String,
    lastUpdated: Date
  },

  quality: {
    status: String (draft|review|approved|deprecated),
    reviewer: String,
    approvedBy: String,
    approvedAt: Date,
    comments: [String],
    dataQuality: String (measured|calculated|estimated)
  },

  usage: {
    useCount: Number,
    lastUsed: Date,
    projects: [String]
  },

  metadata: {
    createdAt: Date,
    createdBy: String,
    updatedAt: Date,
    updatedBy: String,
    isActive: Boolean
  }
}

// Indexes
- factorId: 1, version: -1 (compound)
- category.scope: 1, category.type: 1
- applicability.geography.countries: 1
- quality.status: 1
- applicability.temporal.effectiveFrom: 1
```

#### conversions Collection
```javascript
{
  _id: ObjectId,
  conversionId: String (UUID, indexed),

  fromUnit: String (indexed),
  toUnit: String (indexed),
  factor: Number,

  category: String (energy|mass|volume|distance),
  system: String (metric|imperial|custom),

  inverse: {
    factor: Number,
    calculated: Boolean
  },

  precision: Number,
  bidirectional: Boolean,

  metadata: {
    createdAt: Date,
    createdBy: String,
    source: String,
    isCustom: Boolean
  }
}

// Indexes
- fromUnit: 1, toUnit: 1 (compound unique)
- category: 1
```

#### parameters Collection
```javascript
{
  _id: ObjectId,
  parameterId: String (UUID, indexed),

  name: String (unique, indexed),
  category: String,
  description: String,

  value: {
    current: Mixed,
    dataType: String,
    unit: String
  },

  constraints: {
    min: Number,
    max: Number,
    allowedValues: Array,
    regex: String
  },

  versions: [{
    value: Mixed,
    effectiveFrom: Date,
    effectiveTo: Date,
    changedBy: String,
    changeReason: String
  }],

  usage: {
    required: Boolean,
    defaultValue: Mixed,
    scope: String (global|project|company)
  },

  metadata: {
    createdAt: Date,
    updatedAt: Date,
    isSystem: Boolean
  }
}
```

#### reporting_years Collection
```javascript
{
  _id: ObjectId,
  yearId: String (UUID),
  year: Number (unique),

  standards: [{
    name: String (GHG Protocol|ISO 14064),
    version: String,
    requirements: Object,
    gwpValues: {
      source: String (AR6|AR5),
      values: Object
    }
  }],

  isActive: Boolean,
  isCurrent: Boolean,
  lockDate: Date,

  metadata: {
    createdAt: Date,
    activatedAt: Date,
    closedAt: Date
  }
}
```

## 3. Non-Functional Requirements

### 3.1 Performance
- **Factor search**: < 200ms for 100K factors
- **Conversion calculation**: < 50ms
- **Import processing**: 1000 factors/minute
- **Cache hit ratio**: > 90%

### 3.2 Scalability
- **Emission factors**: 100K+ factors
- **Active factors**: 10K concurrent
- **Conversions**: 1000 conversion pairs
- **Parameters**: 500 parameters

### 3.3 Availability
- **Uptime SLA**: 99.95% (critical for calculations)
- **Cache fallback**: Local factor cache
- **Read replicas**: For high availability

### 3.4 Security
- **Approval workflow**: Role-based QC
- **Audit trail**: All factor changes
- **Data integrity**: Checksum validation

## 4. Module Architecture

### 4.1 Internal Structure
```
reference-service/
├── src/
│   ├── emission-factors/
│   │   ├── factors.controller.ts
│   │   ├── factors.service.ts
│   │   ├── factors.repository.ts
│   │   ├── qc.service.ts
│   │   └── import.service.ts
│   │
│   ├── conversions/
│   │   ├── conversions.controller.ts
│   │   ├── conversions.service.ts
│   │   └── conversion.calculator.ts
│   │
│   ├── parameters/
│   │   ├── parameters.controller.ts
│   │   ├── parameters.service.ts
│   │   └── parameters.repository.ts
│   │
│   ├── master-data/
│   │   ├── years.controller.ts
│   │   ├── scopes.controller.ts
│   │   └── regions.controller.ts
│   │
│   ├── cache/
│   │   ├── cache.module.ts
│   │   └── redis-cache.service.ts
│   │
│   └── events/
│       └── event-publisher.service.ts
```

## 5. Event Contracts

### 5.1 Published Events

#### EmissionFactorApproved
```json
{
  "eventType": "EmissionFactorApproved",
  "version": "1.0",
  "payload": {
    "factorId": "string",
    "category": "object",
    "effectiveFrom": "ISO8601",
    "approvedBy": "string"
  }
}
```

#### ConversionFactorUpdated
```json
{
  "eventType": "ConversionFactorUpdated",
  "version": "1.0",
  "payload": {
    "conversionId": "string",
    "fromUnit": "string",
    "toUnit": "string",
    "factor": "number"
  }
}
```

#### ReportingYearActivated
```json
{
  "eventType": "ReportingYearActivated",
  "version": "1.0",
  "payload": {
    "year": "number",
    "standards": "array",
    "activatedBy": "string"
  }
}
```

## 6. Caching Strategy

### Redis Cache Layers
```yaml
Factor Cache:
  Key: factor:{factorId}:{version}
  TTL: 24 hours

Factor Search Cache:
  Key: search:{category}:{geography}:{year}
  TTL: 1 hour

Conversion Cache:
  Key: convert:{fromUnit}:{toUnit}
  TTL: 24 hours

Parameter Cache:
  Key: param:{name}:{year}
  TTL: 12 hours
```

## 7. External Integrations

- **EPA API**: Factor updates
- **DEFRA Database**: UK factors
- **IPCC Database**: Global factors
- **Custom Excel/CSV imports**: Client-specific factors

## 8. Migration Considerations

1. Import all existing emission factors
2. Map current factor categories to new schema
3. Establish QC status for existing factors
4. Create version history from change logs
5. Cache frequently used factors