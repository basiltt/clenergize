# ESG-Generic Data Models - Architecture Foundation

> **Version**: 1.0.0
> **Status**: APPROVED for Phase 1 Implementation
> **Purpose**: Define extensible data models that support current carbon module AND future ESG expansion

---

## 1. Why ESG-Generic Architecture

Building ESG-generic models in Phase 1 prevents costly refactoring in future phases:

| Approach | Phase 1 Cost | Future Cost | Total |
|----------|-------------|-------------|-------|
| Carbon-specific only | 340 SP | +450-625 SP refactoring | 790-965 SP |
| ESG-generic from start | 360 SP (+20 SP) | +0 SP refactoring | 360 SP |

**Investment**: ~2 sprints now saves 15-25 sprints later.

---

## 2. Core Domain Enumeration

```typescript
/**
 * Top-level ESG domain classification
 * Phase 1: Only 'Environmental' implemented, others defined for extensibility
 */
export enum ESGDomain {
  Environmental = 'ENVIRONMENTAL',
  Social = 'SOCIAL',
  Governance = 'GOVERNANCE'
}

/**
 * Subdomain classification within each domain
 * Phase 1: Only 'Carbon' implemented under Environmental
 */
export const ESGSubdomains = {
  Environmental: {
    Carbon: 'CARBON',           // Phase 1 - IMPLEMENT
    Water: 'WATER',             // Future
    Waste: 'WASTE',             // Future
    Biodiversity: 'BIODIVERSITY', // Future
    Energy: 'ENERGY',           // Future
    Pollution: 'POLLUTION'      // Future
  },
  Social: {
    Workforce: 'WORKFORCE',     // Future
    HealthSafety: 'HEALTH_SAFETY', // Future
    Diversity: 'DIVERSITY',     // Future
    LaborRights: 'LABOR_RIGHTS', // Future
    Community: 'COMMUNITY',     // Future
    SupplyChain: 'SUPPLY_CHAIN' // Future
  },
  Governance: {
    Board: 'BOARD',             // Future
    Ethics: 'ETHICS',           // Future
    Risk: 'RISK',               // Future
    Privacy: 'PRIVACY',         // Future
    Cybersecurity: 'CYBERSECURITY' // Future
  }
} as const;
```

---

## 3. Activity Data Model (Generic)

```typescript
/**
 * Generic ESG activity data structure
 * Used by: activity-service
 * Phase 1: Implement with domain='Environmental', subdomain='Carbon'
 */
export interface ESGActivityData<TMetadata = CarbonActivityMetadata> {
  // Core identification
  id: string;
  projectId: string;
  unitId: string;        // Location/entity reference

  // ESG Classification
  domain: ESGDomain;
  subdomain: string;     // From ESGSubdomains
  category: string;      // E.g., 'SCOPE_1', 'SCOPE_2', 'SCOPE_3' for carbon
  subcategory?: string;  // E.g., 'STATIONARY_COMBUSTION', 'ELECTRICITY'

  // Measurement
  measurement: ESGMeasurement;

  // Period
  period: {
    startDate: Date;
    endDate: Date;
    reportingPeriod: string; // E.g., '2024-Q1', '2024-01'
  };

  // Domain-specific metadata (generic type parameter)
  domainMetadata: TMetadata;

  // Data quality
  dataQuality: DataQualityInfo;

  // Evidence & audit
  evidence: ESGEvidence[];
  audit: AuditInfo;
}

/**
 * Measurement structure - supports any ESG metric
 */
export interface ESGMeasurement {
  quantity: number;
  unit: string;           // UOM code
  methodology?: string;   // Calculation methodology reference
  uncertainty?: {
    type: 'ABSOLUTE' | 'PERCENTAGE';
    value: number;
    confidenceLevel?: number;
  };
}

/**
 * Carbon-specific metadata for Phase 1
 */
export interface CarbonActivityMetadata {
  scope: 1 | 2 | 3;
  emissionType: string;   // E.g., 'CO2', 'CH4', 'N2O'
  fuelType?: string;
  sourceId?: string;
  locationBasedMethod?: boolean;
  marketBasedMethod?: boolean;
  monthlyBreakdown?: Record<string, number>; // Jan-Dec values
}
```

---

## 4. Calculation Engine Interface (Pluggable)

```typescript
/**
 * Pluggable calculation engine interface
 * Used by: calculation-service
 * Phase 1: Only GHG calculation engine implemented
 */
export interface ESGCalculationEngine {
  // Engine identification
  domain: ESGDomain;
  subdomain: string;
  version: string;

  // Core calculation
  calculate(input: ESGCalculationInput): Promise<ESGCalculationResult>;

  // Batch processing
  calculateBatch(inputs: ESGCalculationInput[]): Promise<ESGCalculationResult[]>;

  // Validation
  validateInput(input: ESGCalculationInput): ValidationResult;

  // Factor lookup
  getApplicableFactors(context: FactorContext): Promise<ESGFactor[]>;
}

/**
 * Calculation input - generic structure
 */
export interface ESGCalculationInput {
  activityId: string;
  domain: ESGDomain;
  subdomain: string;
  measurement: ESGMeasurement;
  context: {
    projectId: string;
    unitId: string;
    period: { startDate: Date; endDate: Date };
  };
  factorOverrides?: ESGFactor[];
  options?: CalculationOptions;
}

/**
 * Calculation result - generic structure
 */
export interface ESGCalculationResult {
  calculationId: string;
  activityId: string;

  // Results can vary by domain
  results: {
    metric: string;       // E.g., 'CO2e', 'WATER_CONSUMPTION', 'WASTE_RECYCLED'
    value: number;
    unit: string;
    breakdown?: Record<string, number>; // Component breakdown
  }[];

  // Traceability
  methodology: {
    standard: string;     // E.g., 'GHG_PROTOCOL', 'CDP_WATER'
    version: string;
    approach: string;
    equations: string[];
  };

  factors: {
    factorId: string;
    value: number;
    source: string;
  }[];

  confidence: {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    uncertainty?: number;
    notes?: string;
  };

  audit: {
    calculatedAt: Date;
    calculatedBy: string;
    engineVersion: string;
  };
}
```

---

## 5. Reference Data Model (ESG Factors)

```typescript
/**
 * Generic ESG factor structure
 * Used by: reference-service
 * Phase 1: Only emission factors implemented
 */
export interface ESGFactor {
  id: string;

  // Classification
  domain: ESGDomain;
  subdomain: string;
  factorType: string;    // E.g., 'EMISSION_FACTOR', 'WATER_INTENSITY'

  // Factor details
  name: string;
  description?: string;

  // Value
  value: number;
  unit: string;
  unitNumerator: string;
  unitDenominator: string;

  // Applicability
  applicability: {
    regions?: string[];
    industries?: string[];
    activityTypes?: string[];
    validFrom: Date;
    validTo?: Date;
  };

  // Source
  source: {
    name: string;        // E.g., 'EPA', 'DEFRA', 'GHG Protocol'
    version: string;
    year: number;
    url?: string;
  };

  // Quality control
  qcStatus: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'DEPRECATED';
  verifiedBy?: string;
  verifiedAt?: Date;
}
```

---

## 6. Reporting Model (Framework-Agnostic)

```typescript
/**
 * Framework-agnostic disclosure structure
 * Used by: reporting-service
 * Phase 1: Only GHG Protocol mappings implemented
 */
export interface DisclosureRequirement {
  id: string;

  // Framework identification
  framework: ESGFramework;
  frameworkVersion: string;

  // Requirement details
  code: string;          // E.g., 'GRI 305-1', 'TCFD-M1'
  name: string;
  description: string;

  // Data mapping
  dataRequirements: {
    domain: ESGDomain;
    subdomain: string;
    metrics: string[];
    aggregationLevel: 'COMPANY' | 'PROJECT' | 'LOCATION';
  }[];

  // Reporting period
  reportingFrequency: 'ANNUAL' | 'QUARTERLY' | 'MONTHLY';

  // Assurance
  assuranceLevel?: 'LIMITED' | 'REASONABLE';
}

/**
 * Supported reporting frameworks
 * Phase 1: Only GHG_PROTOCOL implemented
 */
export enum ESGFramework {
  GHG_PROTOCOL = 'GHG_PROTOCOL',  // Phase 1 - IMPLEMENT
  GRI = 'GRI',                    // Future
  SASB = 'SASB',                  // Future
  TCFD = 'TCFD',                  // Future
  CDP = 'CDP',                    // Future
  CSRD_ESRS = 'CSRD_ESRS',        // Future
  IFRS_S1_S2 = 'IFRS_S1_S2'       // Future
}
```

---

## 7. Evidence & Audit Models

```typescript
/**
 * Evidence attachment structure
 * Used by: All services
 */
export interface ESGEvidence {
  id: string;

  type: 'DOCUMENT' | 'IMAGE' | 'DATA_EXPORT' | 'THIRD_PARTY_REPORT';

  file: {
    name: string;
    s3Key: string;
    mimeType: string;
    size: number;
  };

  verification?: {
    verifiedBy: string;
    verifiedAt: Date;
    assuranceLevel: 'SELF' | 'INTERNAL' | 'EXTERNAL_LIMITED' | 'EXTERNAL_REASONABLE';
    verifierOrg?: string;
  };

  audit: AuditInfo;
}

/**
 * Standard audit information
 * Used by: All entities
 */
export interface AuditInfo {
  createdAt: Date;
  createdBy: string;
  modifiedAt: Date;
  modifiedBy: string;
  version: number;
}

/**
 * Data quality scoring
 */
export interface DataQualityInfo {
  score: number;         // 1-5 scale
  level: 'HIGH' | 'MEDIUM' | 'LOW';

  dimensions: {
    completeness: number;
    accuracy: number;
    timeliness: number;
    consistency: number;
  };

  issues?: string[];
  recommendations?: string[];
}
```

---

## 8. Phase 1 Implementation Guidelines

### What to Build Now

1. **Define all interfaces** - All the above TypeScript interfaces in shared library
2. **Implement Carbon domain** - Only `domain='Environmental'`, `subdomain='Carbon'`
3. **GHG calculation engine** - Single implementation of `ESGCalculationEngine`
4. **Emission factors** - Only carbon-related `ESGFactor` records
5. **GHG Protocol reporting** - Only `framework='GHG_PROTOCOL'`

### What NOT to Build Now

- Water, Waste, Biodiversity services or calculations
- Social or Governance domain implementations
- GRI, SASB, TCFD, CDP, CSRD framework mappings
- Multi-framework reporting

### Code Pattern

```typescript
// Phase 1: Use with carbon-specific implementation
const activity: ESGActivityData<CarbonActivityMetadata> = {
  domain: ESGDomain.Environmental,
  subdomain: ESGSubdomains.Environmental.Carbon,
  category: 'SCOPE_1',
  subcategory: 'STATIONARY_COMBUSTION',
  // ... rest of fields
};

// Future: Same interface, different metadata
// const waterActivity: ESGActivityData<WaterActivityMetadata> = { ... }
```

---

## 9. Service Integration

| Service | ESG-Generic Models Used |
|---------|------------------------|
| activity-service | `ESGActivityData`, `ESGEvidence`, `DataQualityInfo` |
| calculation-service | `ESGCalculationEngine`, `ESGCalculationInput/Result` |
| reference-service | `ESGFactor`, `ESGDomain`, `ESGSubdomains` |
| reporting-service | `DisclosureRequirement`, `ESGFramework` |
| audit-service | `AuditInfo` (all events) |

---

## 10. Validation

All implementations must pass these checks:

- [ ] Uses `ESGDomain` enum for domain classification
- [ ] Uses `ESGSubdomains` for subdomain classification
- [ ] Activity data implements `ESGActivityData<T>` interface
- [ ] Calculations return `ESGCalculationResult` structure
- [ ] Factors implement `ESGFactor` interface
- [ ] Reports map to `DisclosureRequirement` structure

---

**Reference Documents**:
- [CURRENT_SCOPE.md](../../CURRENT/00-Scope/CURRENT_SCOPE.md) - Scope definition
- [FUTURE_SCOPE.md](../../CURRENT/00-Scope/FUTURE_SCOPE.md) - Future expansion plans
- [SERVICE_MAPPING.md](../../CURRENT/00-Scope/SERVICE_MAPPING.md) - Service transformation
