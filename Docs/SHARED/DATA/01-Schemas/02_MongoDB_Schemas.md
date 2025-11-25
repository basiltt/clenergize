# MongoDB Schema Definitions

> Comprehensive MongoDB schema definitions for all Clenergize V3 services.

---

## Overview

Each service maintains its own MongoDB database following the database-per-service pattern:

| Service | Database | Primary Collections |
|---------|----------|---------------------|
| identity-service | clenergize_identity | users, roles, sessions, audit_logs |
| organization-service | clenergize_organization | companies, projects, hierarchy_templates, permissions |
| reference-service | clenergize_reference | emission_factors, parameters, unit_conversions, years |
| activity-service | clenergize_activity | activities, imports, validations |
| calculation-service | clenergize_calculation | calculations, aggregations, results |
| reporting-service | clenergize_reporting | reports, templates, exports |
| audit-service | clenergize_audit | audit_events, compliance_logs |

---

## Identity Service Schemas

### Users Collection

```typescript
// Collection: users
// Database: clenergize_identity

interface UserDocument {
  _id: ObjectId;

  // Identity
  email: string;                    // unique, indexed
  cognitoId?: string;               // AWS Cognito sub, indexed

  // Profile
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;

  // Authentication
  passwordHash?: string;            // For local auth only
  mfaEnabled: boolean;
  mfaSecret?: string;               // Encrypted

  // Authorization
  roles: string[];                  // ['ADMIN', 'CONSULTANT', 'PROJECT_USER']
  permissions: string[];            // Computed from roles

  // Status
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  emailVerified: boolean;
  lastLoginAt?: Date;
  failedLoginAttempts: number;
  lockedUntil?: Date;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
  version: number;
}

// Indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ cognitoId: 1 }, { unique: true, sparse: true });
db.users.createIndex({ status: 1, createdAt: -1 });
db.users.createIndex({ roles: 1 });
```

### Sessions Collection

```typescript
// Collection: sessions
interface SessionDocument {
  _id: ObjectId;
  userId: ObjectId;

  token: string;                    // Hashed refresh token
  deviceInfo: {
    userAgent: string;
    ip: string;
    platform?: string;
  };

  expiresAt: Date;                  // TTL index
  revokedAt?: Date;

  createdAt: Date;
}

// Indexes
db.sessions.createIndex({ userId: 1 });
db.sessions.createIndex({ token: 1 }, { unique: true });
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

### Roles Collection

```typescript
// Collection: roles
interface RoleDocument {
  _id: ObjectId;

  name: string;                     // unique
  displayName: string;
  description?: string;

  permissions: string[];            // ['user:read', 'user:write', 'project:admin']

  isSystem: boolean;                // Cannot be deleted
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

// Indexes
db.roles.createIndex({ name: 1 }, { unique: true });
db.roles.createIndex({ isActive: 1 });
```

---

## Organization Service Schemas

### Companies Collection

```typescript
// Collection: companies
// Database: clenergize_organization

interface CompanyDocument {
  _id: ObjectId;

  // Identity
  name: string;
  legalName?: string;
  registrationNumber?: string;

  // Classification
  industry: string;
  sector?: string;
  size: 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE';

  // Location
  headquarters: {
    country: string;
    region?: string;
    city?: string;
    address?: string;
  };

  // Contact
  website?: string;
  contactEmail?: string;

  // Branding
  logo?: string;                    // S3 key
  primaryColor?: string;

  // Status
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  version: number;
}

// Indexes
db.companies.createIndex({ name: 1 });
db.companies.createIndex({ status: 1 });
db.companies.createIndex({ 'headquarters.country': 1 });
```

### Projects Collection

```typescript
// Collection: projects
interface ProjectDocument {
  _id: ObjectId;

  // Identity
  companyId: ObjectId;              // indexed
  name: string;
  description?: string;

  // Configuration
  hierarchyTemplateId: ObjectId;    // Reference to template
  years: number[];                  // [2023, 2024, 2025]
  modules: string[];                // ['CARBON', 'WATER', 'WASTE']

  // ESG Configuration
  esgConfig: {
    domain: 'ENVIRONMENTAL' | 'SOCIAL' | 'GOVERNANCE';
    subdomains: string[];
    frameworks: string[];           // ['GHG_PROTOCOL', 'GRI']
  };

  // Status
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

  // Dates
  startDate?: Date;
  endDate?: Date;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  version: number;
}

// Indexes
db.projects.createIndex({ companyId: 1 });
db.projects.createIndex({ status: 1 });
db.projects.createIndex({ companyId: 1, status: 1 });
db.projects.createIndex({ years: 1 });
```

### Hierarchy Templates Collection

```typescript
// Collection: hierarchy_templates
// Replaces OLD's hierarchy cloning with references

interface HierarchyTemplateDocument {
  _id: ObjectId;

  // Identity
  name: string;
  description?: string;
  companyId?: ObjectId;             // null for global templates

  // Structure
  levels: {
    name: string;                   // 'Entity', 'Subsidiary', 'Location'
    allowMultiple: boolean;
    requiredFields: string[];
  }[];

  // Root Nodes
  nodes: HierarchyNode[];

  // Status
  isDefault: boolean;
  isActive: boolean;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

interface HierarchyNode {
  id: string;                       // UUID
  name: string;
  level: number;                    // 0 = root
  parentId?: string;
  metadata?: Record<string, any>;
  children?: HierarchyNode[];
}

// Indexes
db.hierarchy_templates.createIndex({ companyId: 1 });
db.hierarchy_templates.createIndex({ isDefault: 1, isActive: 1 });
```

### Permissions Collection

```typescript
// Collection: permissions
// Normalized permission model (replaces OLD's nested objects)

interface PermissionDocument {
  _id: ObjectId;

  // Target
  userId: ObjectId;
  projectId: ObjectId;

  // Scope
  scopeType: 'PROJECT' | 'ENTITY' | 'SUBSIDIARY' | 'LOCATION';
  scopeId?: ObjectId;               // null for project-level

  // Permissions
  module: string;                   // 'CARBON', 'WATER', etc.
  actions: ('READ' | 'WRITE' | 'DELETE' | 'ADMIN')[];

  // Metadata
  grantedAt: Date;
  grantedBy: string;
  expiresAt?: Date;
}

// Indexes
db.permissions.createIndex({ userId: 1, projectId: 1 });
db.permissions.createIndex({ projectId: 1, scopeType: 1 });
db.permissions.createIndex({ userId: 1, module: 1 });
```

---

## Reference Service Schemas

### Emission Factors Collection

```typescript
// Collection: emission_factors
// Database: clenergize_reference

interface EmissionFactorDocument {
  _id: ObjectId;

  // Classification (ESG-generic)
  domain: 'ENVIRONMENTAL';
  subdomain: 'CARBON';
  factorType: string;               // 'SCOPE_1_STATIONARY', 'SCOPE_2_ELECTRICITY'

  // Identity
  name: string;
  description?: string;

  // Value
  value: Decimal128;                // High precision
  unit: string;                     // 'kgCO2e/kWh'
  unitNumerator: string;            // 'kgCO2e'
  unitDenominator: string;          // 'kWh'

  // Applicability
  applicability: {
    regions: string[];              // ['US', 'EU', 'GLOBAL']
    industries?: string[];
    fuelTypes?: string[];
    yearStart: number;
    yearEnd?: number;
  };

  // Source
  source: {
    name: string;                   // 'EPA', 'DEFRA', 'GHG Protocol'
    version: string;
    year: number;
    url?: string;
    citation?: string;
  };

  // Quality
  qcStatus: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'DEPRECATED';
  uncertainty?: number;             // Percentage
  verifiedBy?: string;
  verifiedAt?: Date;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

// Indexes
db.emission_factors.createIndex({ domain: 1, subdomain: 1, factorType: 1 });
db.emission_factors.createIndex({ 'applicability.regions': 1 });
db.emission_factors.createIndex({ 'applicability.yearStart': 1, 'applicability.yearEnd': 1 });
db.emission_factors.createIndex({ qcStatus: 1 });
```

### Unit Conversions Collection

```typescript
// Collection: unit_conversions
interface UnitConversionDocument {
  _id: ObjectId;

  fromUnit: string;
  toUnit: string;
  factor: Decimal128;

  category: string;                 // 'ENERGY', 'MASS', 'VOLUME'

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

// Indexes
db.unit_conversions.createIndex({ fromUnit: 1, toUnit: 1 }, { unique: true });
db.unit_conversions.createIndex({ category: 1 });
```

---

## Activity Service Schemas

### Activities Collection

```typescript
// Collection: activities
// Database: clenergize_activity

interface ActivityDocument {
  _id: ObjectId;

  // Context
  projectId: ObjectId;
  unitId: string;                   // Hierarchy node ID
  year: number;

  // ESG Classification
  domain: 'ENVIRONMENTAL' | 'SOCIAL' | 'GOVERNANCE';
  subdomain: string;                // 'CARBON', 'WATER', etc.
  category: string;                 // 'SCOPE_1', 'SCOPE_2', 'SCOPE_3'
  subcategory?: string;             // 'STATIONARY_COMBUSTION'

  // Measurement
  measurement: {
    quantity: Decimal128;
    unit: string;
    methodology?: string;
  };

  // Period
  period: {
    startDate: Date;
    endDate: Date;
    reportingPeriod: string;        // '2024-Q1'
  };

  // Domain Metadata (generic)
  domainMetadata: Record<string, any>;

  // Carbon-specific (when domain=ENVIRONMENTAL, subdomain=CARBON)
  // domainMetadata: {
  //   scope: 1 | 2 | 3;
  //   emissionType: string;
  //   fuelType?: string;
  //   monthlyBreakdown?: Record<string, number>;
  // }

  // Data Quality
  dataQuality: {
    score: number;                  // 1-5
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    issues?: string[];
  };

  // Evidence
  evidence: {
    documentId?: string;
    documentName?: string;
    uploadedAt?: Date;
  }[];

  // Status
  status: 'DRAFT' | 'SUBMITTED' | 'VALIDATED' | 'APPROVED' | 'REJECTED';

  // Calculation Link
  calculationId?: ObjectId;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  version: number;
}

// Indexes
db.activities.createIndex({ projectId: 1, year: 1 });
db.activities.createIndex({ projectId: 1, unitId: 1, year: 1 });
db.activities.createIndex({ domain: 1, subdomain: 1 });
db.activities.createIndex({ status: 1 });
db.activities.createIndex({ 'period.reportingPeriod': 1 });
```

---

## Calculation Service Schemas

### Calculations Collection

```typescript
// Collection: calculations
// Database: clenergize_calculation

interface CalculationDocument {
  _id: ObjectId;

  // Source
  activityId: ObjectId;
  projectId: ObjectId;
  unitId: string;
  year: number;

  // Classification
  domain: 'ENVIRONMENTAL';
  subdomain: 'CARBON';
  category: string;

  // Input
  input: {
    quantity: Decimal128;
    unit: string;
  };

  // Results
  results: {
    metric: string;                 // 'CO2e', 'CO2', 'CH4', 'N2O'
    value: Decimal128;
    unit: string;                   // 'kgCO2e', 'tCO2e'
  }[];

  // Total (primary result)
  totalEmissions: Decimal128;
  totalUnit: string;

  // Methodology
  methodology: {
    standard: string;               // 'GHG_PROTOCOL'
    version: string;
    approach: string;               // 'LOCATION_BASED', 'MARKET_BASED'
    equations: string[];
  };

  // Factors Used
  factors: {
    factorId: ObjectId;
    factorType: string;
    value: Decimal128;
    unit: string;
    source: string;
  }[];

  // Confidence
  confidence: {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    uncertainty?: number;
    notes?: string;
  };

  // Status
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'RECALCULATION_NEEDED';

  // Metadata
  calculatedAt: Date;
  engineVersion: string;
  createdAt: Date;
  updatedAt: Date;
}

// Indexes
db.calculations.createIndex({ activityId: 1 }, { unique: true });
db.calculations.createIndex({ projectId: 1, year: 1 });
db.calculations.createIndex({ projectId: 1, unitId: 1, year: 1 });
db.calculations.createIndex({ status: 1 });
```

### Aggregations Collection

```typescript
// Collection: aggregations
// Pre-computed rollups for performance

interface AggregationDocument {
  _id: ObjectId;

  // Scope
  projectId: ObjectId;
  unitId?: string;                  // null for project-level
  year: number;

  // Aggregation Level
  level: 'PROJECT' | 'ENTITY' | 'SUBSIDIARY' | 'LOCATION';

  // Results by Scope
  scopeTotals: {
    scope1: Decimal128;
    scope2: Decimal128;
    scope3: Decimal128;
    total: Decimal128;
  };

  // Breakdown by Category
  categoryBreakdown: {
    category: string;
    total: Decimal128;
    percentage: number;
  }[];

  // Time Series (monthly)
  monthlyTrend: {
    month: string;                  // '2024-01'
    value: Decimal128;
  }[];

  // Validity
  validFrom: Date;
  validUntil?: Date;                // null = current

  // Metadata
  computedAt: Date;
  computedBy: string;               // 'SYSTEM' or user ID
}

// Indexes
db.aggregations.createIndex({ projectId: 1, year: 1, level: 1 });
db.aggregations.createIndex({ projectId: 1, unitId: 1, year: 1 });
db.aggregations.createIndex({ validUntil: 1 });
```

---

## Reporting Service Schemas

### Reports Collection

```typescript
// Collection: reports
// Database: clenergize_reporting

interface ReportDocument {
  _id: ObjectId;

  // Identity
  projectId: ObjectId;
  name: string;
  description?: string;

  // Configuration
  type: 'GHG_INVENTORY' | 'ESG_DISCLOSURE' | 'CUSTOM';
  framework?: string;               // 'GHG_PROTOCOL', 'GRI', 'CDP'

  // Scope
  years: number[];
  units: string[];                  // Hierarchy node IDs

  // Parameters
  parameters: {
    includeScopes: number[];
    includeCategories: string[];
    aggregationLevel: string;
    comparativeYears?: number[];
  };

  // Generated Content
  content?: {
    sections: ReportSection[];
    charts: ReportChart[];
    tables: ReportTable[];
  };

  // Status
  status: 'DRAFT' | 'GENERATING' | 'READY' | 'FAILED';

  // Export
  exports: {
    format: 'PDF' | 'XLSX' | 'JSON';
    s3Key: string;
    generatedAt: Date;
    expiresAt: Date;
  }[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// Indexes
db.reports.createIndex({ projectId: 1 });
db.reports.createIndex({ status: 1 });
db.reports.createIndex({ type: 1, framework: 1 });
```

---

## Audit Service Schemas

### Audit Events Collection

```typescript
// Collection: audit_events
// Database: clenergize_audit

interface AuditEventDocument {
  _id: ObjectId;

  // Event Identity
  eventId: string;                  // UUID
  correlationId: string;            // Request correlation ID
  causationId?: string;             // Parent event ID

  // Actor
  actor: {
    type: 'USER' | 'SYSTEM' | 'SERVICE';
    id: string;
    email?: string;
    service?: string;
  };

  // Action
  action: string;                   // 'user.created', 'activity.updated'
  resource: {
    type: string;                   // 'User', 'Activity', 'Calculation'
    id: string;
    name?: string;
  };

  // Context
  context: {
    projectId?: string;
    companyId?: string;
    service: string;                // 'identity-service'
    endpoint?: string;
    method?: string;
    ip?: string;
    userAgent?: string;
  };

  // Changes
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
    diff?: string[];                // Changed field names
  };

  // Result
  result: 'SUCCESS' | 'FAILURE';
  errorCode?: string;
  errorMessage?: string;

  // Timing
  timestamp: Date;
  duration?: number;                // Milliseconds

  // Retention
  retentionPolicy: 'STANDARD' | 'COMPLIANCE' | 'PERMANENT';
  expiresAt?: Date;                 // TTL for STANDARD
}

// Indexes
db.audit_events.createIndex({ timestamp: -1 });
db.audit_events.createIndex({ correlationId: 1 });
db.audit_events.createIndex({ 'actor.id': 1, timestamp: -1 });
db.audit_events.createIndex({ 'resource.type': 1, 'resource.id': 1 });
db.audit_events.createIndex({ action: 1, timestamp: -1 });
db.audit_events.createIndex({ 'context.projectId': 1 });
db.audit_events.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, sparse: true });
```

---

## Common Patterns

### Soft Delete Pattern

```typescript
// Add to any document that supports soft delete
interface SoftDeletable {
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
}

// Index pattern
db.collection.createIndex({ isDeleted: 1, createdAt: -1 });
```

### Versioning Pattern

```typescript
// Optimistic concurrency control
interface Versioned {
  version: number;                  // Increment on each update
}

// Usage in update
db.collection.findOneAndUpdate(
  { _id: id, version: currentVersion },
  { $set: { ...updates }, $inc: { version: 1 } }
);
```

### Audit Trail Pattern

```typescript
// Standard audit fields
interface Auditable {
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;                // User ID or 'SYSTEM'
  updatedBy: string;
}
```

---

## Migration from OLD Schema

See [Hierarchy Migration Algorithm](../../03-Migration/04_Hierarchy_Migration.md) for converting OLD's cloned hierarchies to NEW's reference-based model.

Key transformations:
1. `projects.entities[]` → `hierarchy_templates` + `permissions`
2. `projects.permissions{}` → normalized `permissions` collection
3. `userreferences` → eliminated (use identity-service API)
4. `yearreferences` → eliminated (use reference-service API)
