# Clenergize V3 Domain Model Canvas
## Bounded Contexts, Aggregates, and Ubiquitous Language

**Created**: 2025-11-18
**Purpose**: Visual and structural representation of the domain model for Clenergize V3
**Scope**: All 7 bounded contexts with relationships and shared kernel

---

## Table of Contents

1. [Bounded Context Map](#bounded-context-map)
2. [Context Catalog](#context-catalog)
3. [Aggregate Catalog](#aggregate-catalog)
4. [Context Relationships](#context-relationships)
5. [Shared Kernel](#shared-kernel)
6. [Ubiquitous Language](#ubiquitous-language)
7. [Integration Patterns](#integration-patterns)

---

## Bounded Context Map

```
┌───────────────────────────────────────────────────────────────────────┐
│                      CLENERGIZE V3 DOMAIN MODEL                        │
│                    Enterprise Carbon Footprint Platform                │
└───────────────────────────────────────────────────────────────────────┘

                         ┌──────────────────┐
                         │  Identity        │
                         │  Context         │
                         │                  │
                         │ - User           │
                         │ - Session        │
                         │ - Authentication │
                         └────────┬─────────┘
                                  │
                                  │ Customer-Supplier
                                  │ (user.created, user.delete, permission.granted)
                                  │
                                  ▼
                         ┌──────────────────┐
                         │  Organization    │
                         │  Context         │
                         │                  │
                         │ - Company        │
                         │ - Project        │
                         │ - Hierarchy      │
                         │ - Permissions    │
                         └────────┬─────────┘
                                  │
                                  │ Customer-Supplier
                                  │ (hierarchy.modified, project.created)
                                  │
           ┌──────────────────────┼──────────────────────┐
           │                      │                      │
           ▼                      ▼                      ▼
  ┌────────────────┐    ┌────────────────┐    ┌────────────────┐
  │ Reference      │    │  Activity      │    │  Reporting     │
  │ Context        │    │  Context       │    │  Context       │
  │                │    │                │    │                │
  │ - Parameters   │    │ - ActivityData │    │ - Reports      │
  │ - Emissions    │    │ - CarbonScope  │    │ - Exports      │
  │   Factors      │    │ - Comments     │    │ - Dashboards   │
  │ - Conversions  │    │                │    │                │
  └────────┬───────┘    └────────┬───────┘    └────────┬───────┘
           │                     │                     │
           │ (year.created,      │ (activity-data      │ (result.calculated,
           │  emission-factor    │  .created,          │  report.generated)
           │  .verified)         │  .verified)         │
           │                     │                     │
           │         ┌───────────┴──────────┐          │
           │         │                      │          │
           └────────►│   Calculation       │◄─────────┘
                     │   Context           │
                     │                     │
                     │ - Results           │
                     │ - Roll-ups          │
                     │ - Aggregations      │
                     └──────────┬──────────┘
                                │
                                │ (all events)
                                │
                                ▼
                       ┌────────────────┐
                       │  Audit         │
                       │  Context       │
                       │                │
                       │ - Activity Log │
                       │ - Audit Trail  │
                       │ - Compliance   │
                       └────────────────┘

LEGEND:
  ──────►  Event Flow (Customer-Supplier)
  ══════►  Shared Kernel
  ......►  Conformist Relationship
```

---

## Context Catalog

### 1. Identity Context

**Bounded Context Name**: Identity Management
**Core Responsibility**: User authentication, authorization, and session management
**Port**: 3001
**Database**: `clenergize_identity`

**Core Aggregates**:
- User (root)
- Session

**Key Concepts**:
- Authentication (login, logout, token refresh)
- Authorization (roles, permissions)
- Multi-Factor Authentication (MFA)
- Session management

**External Dependencies**:
- AWS Cognito (user pool management)
- AWS Secrets Manager (JWT signing keys)
- Redis (session cache)

**Events Published**:
- Identity.User.Created
- Identity.User.Deleted
- Identity.User.Authenticated
- Identity.Session.Expired
- Identity.User.PasswordReset
- Identity.User.MFAEnabled

**Events Consumed**: None (leaf context)

---

### 2. Organization Context

**Bounded Context Name**: Organization & Project Management
**Core Responsibility**: Company, project, hierarchy, and permission management
**Port**: 3002
**Database**: `clenergize_organization`

**Core Aggregates**:
- Company (root)
- Project (root)
- Entity, Subsidiary, Location (hierarchy)
- ProjectUser (root)
- CompanyDetails

**Key Concepts**:
- Organizational hierarchy (4 levels)
- Project lifecycle management
- User-to-project assignments
- Scope-based permissions (RBAC)
- Company metadata

**External Dependencies**:
- Identity Service (user validation)
- Reference Service (year validation)

**Events Published**:
- Organization.Project.Created
- Organization.Hierarchy.Modified
- Organization.Permission.Granted
- Organization.User.Assigned

**Events Consumed**:
- Identity.User.Created (create UserReference)
- Identity.User.Deleted (soft delete references)
- Reference.Year.Created (create YearReference)

---

### 3. Reference Context

**Bounded Context Name**: Master Data & Reference Management
**Core Responsibility**: Emission factors, parameters, conversions, and master years
**Port**: 3003
**Database**: `clenergize_reference`

**Core Aggregates**:
- MasterYear (root)
- ScopeMaster (root) - "Scope 1", "Scope 2", "Scope 3"
- Parameter (root)
- EmissionFactor
- EnergyValue
- Conversion (root)

**Key Concepts**:
- GHG Protocol scopes
- Emission factor management
- Parameter hierarchy
- Unit of measure conversions
- Year-specific emission factors
- Data verification workflow

**External Dependencies**:
- External data sources (DEFRA, ECOVADIS, EPA)

**Events Published**:
- Reference.Year.Created
- Reference.EmissionFactor.Verified
- Reference.Parameter.Created

**Events Consumed**: None (leaf context)

---

### 4. Activity Context

**Bounded Context Name**: Activity Data Collection
**Core Responsibility**: Capture and validate emissions activity data
**Port**: 3004
**Database**: `clenergize_activity`

**Core Aggregates**:
- CarbonScope (root) - tracks data availability
- StationaryCombustion (Scope 1)
- MobileCombustion (Scope 1)
- FugitiveEmission (Scope 1)
- ProcessEmission (Scope 1)
- Electricity (Scope 2)
- ChilledWater (Scope 2)
- HeatingSteaming (Scope 2)
- WasteWater (Scope 3)
- CategoryComment

**Key Concepts**:
- Activity data entry (manual, bulk import, API)
- Monthly data tracking
- File attachments (evidence)
- Data verification workflow
- Bulk imports (Excel/CSV)
- Data quality scoring

**External Dependencies**:
- Reference Service (emission factors, parameters)
- Organization Service (hierarchy validation)
- AWS S3 (file storage)

**Events Published**:
- Activity.Data.Created
- Activity.Data.Updated
- Activity.Data.Verified
- Activity.BulkImport.Completed

**Events Consumed**:
- Organization.Hierarchy.Modified (invalidate scope data)
- Reference.Parameter.Deleted (archive activity data)

---

### 5. Calculation Context

**Bounded Context Name**: Emissions Calculation Engine
**Core Responsibility**: Calculate emissions from activity data, aggregate results
**Port**: 3005
**Database**: `clenergize_calculation`

**Core Aggregates**:
- Result (root)
- Calculation (process aggregate)
- RollUp (process aggregate)

**Key Concepts**:
- Emission calculation (quantity × emission factor)
- Energy calculation (quantity × energy value × calorific value)
- Roll-up aggregation (child → parent hierarchy)
- Parametric emissions breakdown
- Emission intensity calculations
- Energy intensity calculations
- What-if scenario modeling

**External Dependencies**:
- Activity Service (activity data)
- Reference Service (emission factors, energy values, conversions)
- Organization Service (hierarchy structure)

**Events Published**:
- Calculation.Completed
- Calculation.RollUp.Completed
- Calculation.Result.Calculated

**Events Consumed**:
- Activity.Data.Created (trigger calculation)
- Activity.Data.Updated (recalculate)
- Activity.Data.Deleted (recalculate)
- Reference.EmissionFactor.Verified (recalculate all affected)

---

### 6. Reporting Context

**Bounded Context Name**: Report Generation & Export
**Core Responsibility**: Generate reports, exports, and dashboard data
**Port**: 3006
**Database**: `clenergize_reporting`

**Core Aggregates**:
- Report (root)
- Export (root)
- Dashboard (read model aggregate)

**Key Concepts**:
- PDF report generation
- Excel export (formatted reports)
- CSV export (raw data)
- Real-time dashboard data (WebSockets)
- Year-over-year comparisons
- Benchmark analysis
- Custom report templates

**External Dependencies**:
- Calculation Service (results)
- Organization Service (hierarchy, projects)
- AWS S3 (report storage)
- PDF generation library
- Excel generation library

**Events Published**:
- Reporting.Report.Generated
- Reporting.Export.Completed
- Reporting.Dashboard.Refreshed

**Events Consumed**:
- Calculation.Result.Calculated (update dashboard)
- Organization.Project.Created (initialize reporting templates)

---

### 7. Audit Context

**Bounded Context Name**: Audit Logging & Compliance
**Core Responsibility**: Track all system changes, provide audit trails
**Port**: 3007
**Database**: `clenergize_audit`

**Core Aggregates**:
- ActivityLog (root)
- AuditReport (root)

**Key Concepts**:
- Immutable audit logs
- Change history tracking
- Compliance reporting (ISO 14064, GHG Protocol)
- Data lineage tracking
- Forensic analysis
- Retention policies

**External Dependencies**: None (conformist to all contexts)

**Events Published**:
- Audit.Log.Created
- Audit.Report.Generated

**Events Consumed**: ALL events from all contexts (logging purposes)

---

## Aggregate Catalog

### Identity Context Aggregates

#### User (Aggregate Root)
```typescript
class User {
  // Identity
  _id: UserId;
  email: Email;                    // Value Object
  cognitoId: CognitoId;            // Value Object

  // Profile
  name: PersonName;                // Value Object
  phone?: PhoneNumber;             // Value Object
  username: string;

  // Status
  status: UserStatus;              // 'active' | 'inactive' | 'pending'
  userType: UserType;              // 'admin' | 'consultant' | 'project login'

  // Security
  mfa: MFASettings;                // Value Object
  permissions: Permission[];       // Value Object

  // Lifecycle methods
  activate(): void;
  deactivate(): void;
  enableMFA(secret: string): void;
  verifyMFA(code: string): boolean;
  resetPassword(token: string, newPassword: string): void;
}
```

**Value Objects**:
- `Email`: Validates email format
- `CognitoId`: AWS Cognito user pool ID
- `PersonName`: First + Last name
- `PhoneNumber`: E.164 format
- `MFASettings`: { enabled, secret, backupCodes }
- `Permission`: String enum of permission codes

**Domain Events**:
- `UserCreated`
- `UserActivated`
- `UserDeactivated`
- `MFAEnabled`
- `PasswordReset`

**Invariants**:
- Email must be unique
- CognitoId must be unique
- Active users must have verified email
- MFA secret must be encrypted at rest

---

### Organization Context Aggregates

#### Project (Aggregate Root)
```typescript
class Project {
  // Identity
  _id: ProjectId;
  companyId: CompanyId;

  // Metadata
  projectName: ProjectName;        // Value Object
  description: string;
  years: Year[];                   // Value Objects
  modules: Module[];               // Which activity categories enabled

  // Hierarchy (Value Objects, not separate aggregates in NEW design)
  entities: Map<EntityId, Entity>;

  // Status
  status: ProjectStatus;           // 'initiated' | 'created' | 'active' | 'archived'
  isDeleted: boolean;

  // Lifecycle methods
  addEntity(entity: Entity): void;
  removeEntity(entityId: EntityId): void;
  assignUser(user: ProjectUser): void;
  addYear(year: Year): void;
  archive(): void;
}
```

**Value Objects**:
- `ProjectName`: Validated, unique per company
- `Year`: Number with validation (2000-2100)
- `Entity`: { id, name, subsidiaries: Map<SubsidiaryId, Subsidiary> }
- `Subsidiary`: { id, name, locations: Map<LocationId, Location> }
- `Location`: { id, name, address, coordinates }

**Domain Events**:
- `ProjectCreated`
- `ProjectArchived`
- `EntityAdded`
- `HierarchyModified`
- `YearAdded`

**Invariants**:
- Project name unique per company
- Must have at least one year
- Cannot delete if has activity data
- Hierarchy cannot exceed 4 levels (Project → Entity → Subsidiary → Location)

#### ProjectUser (Aggregate Root)
```typescript
class ProjectUser {
  // Identity
  _id: ProjectUserId;
  projectId: ProjectId;
  userId: UserId;
  email: Email;

  // Access Control
  role: ProjectRole;               // 'admin' | 'member' | 'viewer'
  scopePermissions: ScopePermission[]; // Granular permissions per scope

  // Status
  status: InviteStatus;            // 'active' | 'invite sent' | 'rejected'
  assignedAt: Date;

  // Lifecycle methods
  grantPermission(scope: ScopeId, module: string, permission: Permission): void;
  revokePermission(scope: ScopeId, module: string, permission: Permission): void;
  acceptInvite(): void;
  rejectInvite(): void;
}
```

**Value Objects**:
- `ScopePermission`: { scopeType, scopeId, module, permissions: Set<Permission> }
- `Permission`: 'create' | 'read' | 'edit' | 'delete' | 'notify'

**Domain Events**:
- `UserAssignedToProject`
- `PermissionGranted`
- `PermissionRevoked`
- `InviteAccepted`

**Invariants**:
- User can only be assigned to project once
- Scope ID must exist in project hierarchy
- Admin role has all permissions
- Viewer role has read-only permissions

---

### Reference Context Aggregates

#### Parameter (Aggregate Root)
```typescript
class Parameter {
  // Identity
  _id: ParameterId;
  scopeId: ScopeId;                // "Scope 1", "Scope 2", "Scope 3"

  // Metadata
  name: ParameterName;             // e.g., "Natural Gas", "Diesel"
  parentId?: ParameterId;          // Supports hierarchy
  protocol: Protocol;              // 'GHG' | 'DEFRA' | 'ECOVADIS'

  // Configuration
  uom: UnitOfMeasure;              // kg, liters, kWh, etc.
  valueTypes: ValueType[];         // ['EF', 'GJ'] - has emission factor and energy value
  isCarbonEmission: boolean;

  // Versioned data (one per year)
  emissionFactors: Map<YearId, EmissionFactor>;
  energyValues: Map<YearId, EnergyValue>;

  // Lifecycle methods
  addEmissionFactor(yearId: YearId, factor: EmissionFactor): void;
  verifyEmissionFactor(yearId: YearId, verifiedBy: UserId): void;
  addEnergyValue(yearId: YearId, value: EnergyValue): void;
}
```

**Value Objects**:
- `ParameterName`: Validated string (max 200 chars)
- `Protocol`: Enum of calculation methodologies
- `UnitOfMeasure`: Validated unit (kg, liters, kWh, m³, etc.)
- `ValueType`: 'EF' (emission factor) | 'GJ' (energy value)
- `EmissionFactor`: { value: number, source: string, isVerified: boolean }
- `EnergyValue`: { value: number, source: string }

**Domain Events**:
- `ParameterCreated`
- `EmissionFactorVerified`
- `EnergyValueUpdated`

**Invariants**:
- Parameter name unique per scope
- Emission factor must be > 0
- Energy value must be > 0
- Verified emission factors cannot be modified (create new version)

---

### Activity Context Aggregates

#### ActivityData (Base Aggregate - consolidates all categories)
```typescript
class ActivityData {
  // Identity
  _id: ActivityDataId;
  projectId: ProjectId;
  scopeId: ScopeId;

  // Category
  category: ActivityCategory;      // 'Stationary Combustion', 'Electricity', etc.
  parameter: ParameterId;

  // Hierarchy
  entityId: EntityId;
  entityType: EntityType;          // 'Entity' | 'Subsidiary' | 'Location'
  parentEntityId?: EntityId;       // For roll-ups

  // Data
  year: Year;
  quantityConsumed: number;
  uom: UnitOfMeasure;
  monthlyData: Map<Month, number>; // Jan-Dec breakdown

  // Evidence
  fileAttachments: Map<Month, FileUrl[]>;

  // Status
  isVerified: boolean;
  verifiedBy?: UserId;
  verifiedAt?: Date;

  // Lifecycle methods
  updateQuantity(month: Month, quantity: number): void;
  attachFile(month: Month, fileUrl: FileUrl): void;
  verify(verifiedBy: UserId): void;
  recalculate(): void;             // Triggers calculation event
}
```

**Value Objects**:
- `ActivityCategory`: Enum of 8 categories (Scope 1: 4, Scope 2: 3, Scope 3: 1)
- `Month`: 1-12
- `FileUrl`: S3 URL with validation

**Domain Events**:
- `ActivityDataCreated`
- `ActivityDataUpdated`
- `ActivityDataVerified`
- `ActivityDataDeleted`

**Invariants**:
- Quantity must be >= 0
- Monthly data sum should equal total quantity
- Cannot verify without data
- File URLs must be valid S3 URLs

---

### Calculation Context Aggregates

#### Result (Aggregate Root)
```typescript
class Result {
  // Identity
  _id: ResultId;
  projectId: ProjectId;
  entityId: EntityId;
  entityType: EntityType;
  year: Year;

  // Emissions (tCO2e)
  scope1Emissions: number;
  scope2Emissions: number;
  scope3Emissions: number;
  totalEmissions: number;

  // Energy (GJ)
  directEnergy: number;            // Scope 1
  indirectEnergy: number;          // Scope 2
  totalEnergyConsumption: number;

  // Parametric Breakdown
  parametricEmissions: Map<ParameterId, {
    scope: 'Scope 1' | 'Scope 2' | 'Scope 3',
    emissions: number,
    energy: number
  }>;

  // Intensities
  emissionIntensity: number;       // tCO2e per unit output
  energyIntensity: number;         // GJ per unit output
  energyUsageIntensityPerArea: number;
  energyUsageIntensityPerRevenue: number;

  // Metadata
  calculatedAt: Date;
  isReportGenerated: boolean;

  // Lifecycle methods
  recalculate(activityData: ActivityData[], emissionFactors: Map<ParameterId, number>): void;
  rollUpFromChildren(childResults: Result[]): void;
}
```

**Domain Events**:
- `ResultCalculated`
- `RollUpCompleted`
- `ResultInvalidated`

**Invariants**:
- Unique constraint: (projectId, entityId, year)
- Total emissions = scope1 + scope2 + scope3
- Total energy = direct + indirect
- Cannot have negative emissions

---

### Reporting Context Aggregates

#### Report (Aggregate Root)
```typescript
class Report {
  // Identity
  _id: ReportId;
  projectId: ProjectId;

  // Configuration
  reportType: ReportType;          // 'PDF' | 'Excel' | 'CSV'
  scope: ReportScope;              // 'Project' | 'Entity' | 'Subsidiary' | 'Location'
  scopeId: string;
  years: Year[];

  // Content
  sections: ReportSection[];
  includeComparison: boolean;
  includeBenchmark: boolean;

  // Status
  status: ReportStatus;            // 'pending' | 'generating' | 'completed' | 'failed'
  generatedBy: UserId;
  generatedAt?: Date;
  fileUrl?: FileUrl;

  // Lifecycle methods
  generate(): void;
  addSection(section: ReportSection): void;
  publish(): void;
}
```

**Value Objects**:
- `ReportType`: PDF, Excel, CSV
- `ReportScope`: Project, Entity, Subsidiary, Location
- `ReportSection`: { title, content, charts[] }

**Domain Events**:
- `ReportGenerationRequested`
- `ReportGenerated`
- `ReportGenerationFailed`
- `ExportCompleted`

**Invariants**:
- Must have at least one year
- Scope ID must exist in project
- Cannot regenerate completed reports (create new)

---

### Audit Context Aggregates

#### AuditLog (Aggregate Root)
```typescript
class AuditLog {
  // Identity
  _id: AuditLogId;

  // Context
  service: ServiceName;            // Which service logged this
  entityType: string;              // 'Project', 'ActivityData', 'EmissionFactor', etc.
  entityId: string;

  // Action
  action: AuditAction;             // 'created' | 'updated' | 'deleted' | 'verified'
  field?: string;                  // Which field changed
  oldValue?: any;
  newValue?: any;

  // Metadata
  performedBy: UserId;
  performedAt: Date;
  correlationId: string;           // Request correlation ID

  // Immutability
  // No update or delete methods - immutable by design
}
```

**Domain Events**:
- `AuditLogCreated`

**Invariants**:
- Immutable after creation
- Cannot be deleted
- Retention policy (7 years minimum)

---

## Context Relationships

### Customer-Supplier Relationships

```
Identity (Upstream) ──────► Organization (Downstream)
  Events: user.created, user.delete, permission.granted
  Contract: User events must include userId, email, name

Organization (Upstream) ──────► Activity (Downstream)
  Events: hierarchy.modified, project.created
  Contract: Hierarchy events include full path (project→entity→subsidiary→location)

Reference (Upstream) ──────► Activity (Downstream)
  Events: emission-factor.verified, parameter.created
  Contract: Emission factor events include parameterId, yearId, value

Activity (Upstream) ──────► Calculation (Downstream)
  Events: activity-data.created, activity-data.updated
  Contract: Activity events include all data needed for calculation

Calculation (Upstream) ──────► Reporting (Downstream)
  Events: result.calculated, roll-up.completed
  Contract: Result events include complete emissions breakdown
```

### Conformist Relationships

```
All Contexts ──────► Audit (Downstream)
  Events: ALL events from all contexts
  Contract: Audit logs all events without modification
  Relationship: Audit is conformist - accepts whatever event format is sent
```

### Shared Kernel

```
Organization ══════► Reference
  Shared: Year concept, ScopeType concept

Activity ══════► Calculation
  Shared: EntityType, UnitOfMeasure, Month
```

---

## Shared Kernel

### Shared Types Library (`@clenergize/shared`)

```typescript
// ====================
// Hierarchy Types
// ====================

export type ScopeType = 'project' | 'entity' | 'subsidiary' | 'location';

export type EntityType = 'Company' | 'Entity' | 'Subsidiary' | 'Location';

export interface HierarchyPath {
  projectId: string;
  entityId?: string;
  subsidiaryId?: string;
  locationId?: string;
}

// ====================
// GHG Protocol Scopes
// ====================

export type EmissionScope = 'Scope 1' | 'Scope 2' | 'Scope 3';

export const SCOPE_CATEGORIES: Record<EmissionScope, string[]> = {
  'Scope 1': [
    'Stationary Combustion',
    'Mobile Combustion',
    'Fugitive Emission',
    'Process Emission'
  ],
  'Scope 2': [
    'Electricity',
    'Chilled Water',
    'Heating/Steaming'
  ],
  'Scope 3': [
    'Waste Water'
  ]
};

// ====================
// Unit of Measure
// ====================

export type UnitCategory = 'mass' | 'volume' | 'energy' | 'area' | 'distance';

export interface UnitOfMeasure {
  unit: string;
  category: UnitCategory;
  siEquivalent: number;        // Conversion factor to SI unit
}

// Common units
export const UNITS = {
  // Mass
  kg: { unit: 'kg', category: 'mass', siEquivalent: 1 },
  tonnes: { unit: 'tonnes', category: 'mass', siEquivalent: 1000 },

  // Volume
  liters: { unit: 'liters', category: 'volume', siEquivalent: 1 },
  m3: { unit: 'm³', category: 'volume', siEquivalent: 1000 },

  // Energy
  kWh: { unit: 'kWh', category: 'energy', siEquivalent: 3.6 },     // MJ
  GJ: { unit: 'GJ', category: 'energy', siEquivalent: 1000 },      // MJ

  // Area
  m2: { unit: 'm²', category: 'area', siEquivalent: 1 },
  ft2: { unit: 'ft²', category: 'area', siEquivalent: 0.0929 },
} as const;

// ====================
// Year Concept
// ====================

export class Year {
  constructor(private readonly value: number) {
    if (value < 2000 || value > 2100) {
      throw new Error('Year must be between 2000 and 2100');
    }
  }

  getValue(): number {
    return this.value;
  }

  isLeapYear(): boolean {
    return (this.value % 4 === 0 && this.value % 100 !== 0) || this.value % 400 === 0;
  }
}

// ====================
// Month Concept
// ====================

export enum Month {
  January = 1,
  February = 2,
  March = 3,
  April = 4,
  May = 5,
  June = 6,
  July = 7,
  August = 8,
  September = 9,
  October = 10,
  November = 11,
  December = 12
}

// ====================
// Permission Structure
// ====================

export interface Permission {
  create?: boolean;
  read?: boolean;
  edit?: boolean;
  delete?: boolean;
  notify?: boolean;
}

export const PERMISSIONS = {
  ADMIN: { create: true, read: true, edit: true, delete: true, notify: true },
  EDITOR: { create: true, read: true, edit: true, delete: false, notify: true },
  VIEWER: { create: false, read: true, edit: false, delete: false, notify: false }
} as const;

// ====================
// Domain Event Base
// ====================

export interface DomainEvent<T = any> {
  id: string;                      // Event unique ID
  type: string;                    // Event type (e.g., 'Identity.User.Created.v1')
  version: number;                 // Event schema version
  occurredAt: string;              // ISO 8601 timestamp
  aggregateId: string;             // ID of the aggregate that emitted this event
  aggregateType: string;           // Type of aggregate (e.g., 'User', 'Project')
  causationId?: string;            // ID of command that caused this event
  correlationId: string;           // Request correlation ID
  data: T;                         // Event payload
  metadata?: Record<string, any>;  // Additional metadata
}

// ====================
// Error Types
// ====================

export class DomainError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends DomainError {
  constructor(message: string) {
    super(message, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message: string) {
    super(message, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message, 'CONFLICT');
    this.name = 'ConflictError';
  }
}
```

---

## Ubiquitous Language

### Core Concepts (Alphabetically)

**Activity Data**: Quantified information about an emission-generating activity (e.g., liters of diesel consumed, kWh of electricity purchased)

**Aggregate**: A cluster of domain objects that can be treated as a single unit for data changes (e.g., Project with Entities, Subsidiaries, Locations)

**Allocation**: Method of distributing emissions across organizational units or products

**Audit Trail**: Immutable record of all system changes for compliance and forensic analysis

**Baseline Year**: Reference year used for comparison in emissions tracking

**Bounded Context**: A logical boundary within which a particular domain model is defined and applicable

**Carbon Footprint**: Total greenhouse gas emissions caused directly and indirectly by an organization, event, product, or individual

**Carbon Scope**: Marker indicating which hierarchical nodes have activity data for a given year

**Command**: An operation that modifies state (e.g., CreateProject, UpdateActivityData)

**Company**: Top-level legal entity in the organizational hierarchy

**Denormalization**: Storing redundant data to optimize read performance (ANTI-PATTERN in NEW system)

**Direct Energy**: Energy from Scope 1 sources (combustion of fuels), measured in GJ

**Emission Factor (EF)**: Coefficient used to convert activity data to emissions (kgCO2e per unit)

**Emission Intensity**: Emissions per unit of output (e.g., tCO2e per revenue, tCO2e per m²)

**Emission**: Release of greenhouse gases into the atmosphere, measured in tCO2e

**Energy Intensity**: Energy consumption per unit of output (e.g., GJ per revenue)

**Energy Usage Intensity (EUI)**: Energy consumption per area or revenue

**Energy Value**: Energy content of a fuel (GJ per unit)

**Entity**: First level of organizational division below Project (e.g., Business Unit, Division)

**Event Sourcing**: Pattern where state changes are stored as a sequence of events

**Event**: Something that has happened in the domain (e.g., ProjectCreated, ActivityDataVerified)

**Fugitive Emission**: Unintentional or irregular emissions (e.g., refrigerant leaks, gas leaks)

**GHG Protocol**: International standard for measuring and managing greenhouse gas emissions

**GHG**: Greenhouse Gas (CO2, CH4, N2O, HFCs, PFCs, SF6, NF3)

**Gigajoule (GJ)**: Unit of energy (1 GJ = 277.78 kWh)

**Hierarchy**: Organizational structure with four levels: Project → Entity → Subsidiary → Location

**Indirect Energy**: Energy from Scope 2 sources (purchased electricity, heating, cooling), measured in GJ

**Location**: Fourth level (leaf node) of organizational hierarchy, representing a physical facility

**Master Data**: Reference data that is shared across the organization (emission factors, parameters, years)

**Master Year**: Available reporting year with start/end dates and status

**Mobile Combustion**: Emissions from fuel use in vehicles (company cars, trucks, forklifts)

**Module**: Feature area or activity category (e.g., "Stationary Combustion", "Electricity")

**Monthly Data**: Breakdown of activity data by month (January through December)

**Outbox Pattern**: Ensures reliable event publishing by storing events in database before publishing

**Parameter**: Specific emission source (e.g., "Natural Gas", "Diesel", "Electricity - Grid")

**Parametric Emissions**: Emissions broken down by parameter (fuel type, energy source)

**Permission**: Granular access control (create, read, edit, delete, notify)

**Process Emission**: Emissions from industrial processes (e.g., cement production, chemical reactions)

**Project**: Emissions measurement initiative for a company, covering specific years and modules

**Protocol**: Calculation methodology (GHG Protocol, DEFRA, ECOVADIS)

**Read Model**: Optimized data structure for queries (CQRS pattern)

**Reference Data**: See Master Data

**Reporting Year**: Year for which emissions are being calculated and reported

**Result**: Calculated emissions for an entity for a year, including Scope 1/2/3 totals

**Roll-up**: Aggregation of child entity emissions to parent in the hierarchy

**Saga**: Pattern for managing long-running distributed transactions with compensation

**Scope 1**: Direct emissions from owned or controlled sources (combustion, processes)

**Scope 2**: Indirect emissions from purchased energy (electricity, heating, cooling)

**Scope 3**: All other indirect emissions in the value chain (waste, water treatment, supply chain)

**Scope Permission**: Permission assigned at a specific level in the hierarchy

**Scope Type**: Level in hierarchy (project, entity, subsidiary, location)

**Scope**: (1) GHG Protocol emission category (Scope 1/2/3); (2) Hierarchical node in organization

**Shared Kernel**: Domain model elements shared between multiple bounded contexts

**Soft Delete**: Marking a record as deleted without physically removing it (isDeleted flag)

**Stationary Combustion**: Fuel burning in fixed equipment (boilers, heaters, generators)

**Sub-Parameter**: Child parameter in a hierarchy (e.g., "Diesel - Road Transport" under "Diesel")

**Subsidiary**: Second level of organizational hierarchy below Entity (e.g., operating company)

**tCO2e**: Tonnes of Carbon Dioxide Equivalent (standard unit for greenhouse gas emissions)

**Unit of Measure (UOM)**: Unit for quantifying activity data (kg, liters, kWh, m³, etc.)

**Verification**: Approval of data by a reviewer, marking it as accurate and complete

**Year Reference**: Denormalized copy of year metadata (ANTI-PATTERN, to be removed)

---

## Integration Patterns

### Event-Driven Integration

**Outbox Pattern** (Reliable Event Publishing):
```typescript
// When creating an entity, atomically store event in outbox
await session.withTransaction(async () => {
  // 1. Save entity
  await userRepository.save(user);

  // 2. Save event to outbox
  await outboxRepository.save({
    aggregateId: user.id,
    eventType: 'Identity.User.Created.v1',
    payload: user.toEvent(),
    status: 'pending'
  });
});

// Separate process publishes events from outbox
// Ensures at-least-once delivery
```

**Event Consumption with Idempotency**:
```typescript
async handleUserCreated(event: UserCreatedEvent) {
  // Check if already processed (idempotency)
  const existing = await processedEvents.findOne({ eventId: event.id });
  if (existing) {
    console.log('Event already processed, skipping');
    return;
  }

  // Process event
  await userReferenceRepository.create({
    userId: event.data.userId,
    email: event.data.email,
    name: event.data.name
  });

  // Mark as processed
  await processedEvents.save({ eventId: event.id, processedAt: new Date() });
}
```

### Saga Pattern (Distributed Transactions)

**Example: Project Creation Saga**
```
CreateProject Command
  ↓
1. Create Project (Organization Service)
  ↓ (success)
2. Create CarbonScopes (Activity Service)
  ↓ (success)
3. Initialize CompanyDetails (Organization Service)
  ↓ (success)
4. Create Audit Log (Audit Service)
  ↓ (success)
SAGA COMPLETED

If any step fails:
  ↓ (failure at step 3)
Compensation:
  - Delete CarbonScopes (step 2 rollback)
  - Delete Project (step 1 rollback)
```

### API Integration

**Synchronous API Calls** (Request-Response):
```typescript
// Activity Service calls Reference Service to validate parameter
const parameter = await referenceApiClient.getParameter(parameterId);
if (!parameter) {
  throw new ValidationError('Parameter not found');
}

// Validate parameter belongs to correct scope
if (parameter.scopeId !== expectedScopeId) {
  throw new ValidationError('Parameter does not belong to this scope');
}
```

**Cache-Aside Pattern** (Reduce API calls):
```typescript
async getEmissionFactor(parameterId: string, yearId: string) {
  // Check cache first
  const cacheKey = `ef:${parameterId}:${yearId}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Cache miss - fetch from Reference Service
  const emissionFactor = await referenceApiClient.getEmissionFactor(parameterId, yearId);

  // Store in cache with TTL
  await redis.setex(cacheKey, 86400, JSON.stringify(emissionFactor)); // 24 hours

  return emissionFactor;
}
```

---

## Visual Diagrams

### Aggregate Structure (Example: Project)

```
┌─────────────────────────────────────────────────────────────┐
│                     Project (Aggregate Root)                 │
├─────────────────────────────────────────────────────────────┤
│ - projectId: ProjectId                                      │
│ - companyId: CompanyId                                      │
│ - projectName: ProjectName                                  │
│ - years: Year[]                                             │
│ - modules: Module[]                                         │
│ - status: ProjectStatus                                     │
└───────┬─────────────────────────────────────────────────────┘
        │
        │ contains (Value Objects, not separate aggregates)
        │
        ├─► Entity 1
        │   ├─► Subsidiary 1.1
        │   │   ├─► Location 1.1.1
        │   │   └─► Location 1.1.2
        │   └─► Subsidiary 1.2
        │       └─► Location 1.2.1
        │
        └─► Entity 2
            ├─► Subsidiary 2.1
            └─► Subsidiary 2.2
                ├─► Location 2.2.1
                └─► Location 2.2.2

INVARIANTS:
- Project name unique per company
- At least one year required
- Hierarchy max 4 levels
- Cannot delete with activity data
```

### Event Flow (Example: Activity Data Creation)

```
┌──────────────┐
│  Frontend    │
└──────┬───────┘
       │ POST /api/v1/activity-data
       ▼
┌──────────────┐
│  API Gateway │
└──────┬───────┘
       │ Validate JWT
       │ Check permissions
       ▼
┌──────────────────┐
│ Activity Service │
├──────────────────┤
│ 1. Validate data │ ◄─── Calls Reference Service
│ 2. Create record │      to validate parameter
│ 3. Save to DB    │
│ 4. Emit event    │
└──────┬───────────┘
       │
       │ Publish: Activity.Data.Created.v1
       │
       ├────────────────────────┬──────────────────┐
       ▼                        ▼                  ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Calculation      │  │ Audit            │  │ Notification     │
│ Service          │  │ Service          │  │ Service          │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│ - Trigger calc   │  │ - Log event      │  │ - Notify users   │
│ - Fetch EF       │  │ - Store audit    │  │ - Send email     │
│ - Calculate CO2e │  │   trail          │  │                  │
│ - Save result    │  └──────────────────┘  └──────────────────┘
│ - Emit event     │
└──────┬───────────┘
       │
       │ Publish: Calculation.Completed.v1
       │
       ▼
┌──────────────────┐
│ Reporting        │
│ Service          │
├──────────────────┤
│ - Update         │
│   dashboard      │
│ - Invalidate     │
│   cache          │
└──────────────────┘
```

---

## Conclusion

This Domain Model Canvas provides a comprehensive visual and structural representation of the Clenergize V3 domain model, covering:

✅ **7 Bounded Contexts** with clear responsibilities
✅ **22 Core Aggregates** with lifecycle methods
✅ **Shared Kernel** with common types and concepts
✅ **Ubiquitous Language** with 60+ domain terms
✅ **Integration Patterns** (events, APIs, sagas)

This canvas serves as the **single source of truth** for domain design throughout the rebuild project.

---

**Next Steps**:
1. Complete Event Schema Registry expansion (58 events with Zod schemas)
2. Create missing service specifications (Activity, Calculation, Reporting, Audit)
3. Design API contracts (165 endpoints)
4. Design database schemas (24 collections)

