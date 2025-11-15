# Microservice Decomposition & Bounded Contexts

## Domain-Driven Design Approach

This document details the decomposition of the Clenergize platform into well-defined microservices based on Domain-Driven Design (DDD) principles. Each microservice represents a bounded context with clear ownership of specific business capabilities.

## Bounded Context Map

```
┌──────────────────────────────────────────────────────────┐
│                   CORE DOMAIN                             │
│                                                           │
│  ┌─────────────────────┐  ┌─────────────────────┐       │
│  │  Activity Data      │  │   Calculation       │       │
│  │    Context          │→ │     Context         │       │
│  │                     │  │                     │       │
│  │  [Activity Service] │  │ [Calculation Service]│       │
│  └─────────────────────┘  └─────────────────────┘       │
│            ↑                        ↓                    │
│            │                        │                    │
│  ┌─────────────────────┐  ┌─────────────────────┐       │
│  │  Reference Data     │  │    Reporting        │       │
│  │     Context         │→ │     Context         │       │
│  │                     │  │                     │       │
│  │ [Reference Service] │  │ [Reporting Service] │       │
│  └─────────────────────┘  └─────────────────────┘       │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                 SUPPORTING DOMAIN                         │
│                                                           │
│  ┌─────────────────────┐  ┌─────────────────────┐       │
│  │  Identity & Access  │  │   Organization      │       │
│  │     Context         │← │     Context         │       │
│  │                     │  │                     │       │
│  │ [Identity Service]  │  │[Organization Service]│       │
│  └─────────────────────┘  └─────────────────────┘       │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                  GENERIC SUBDOMAIN                        │
│                                                           │
│  ┌───────────────────────────────────────────────┐       │
│  │            Audit Context                       │       │
│  │                                                │       │
│  │          [Audit Service]                       │       │
│  └───────────────────────────────────────────────┘       │
└──────────────────────────────────────────────────────────┘

Legend:
→ Direct dependency / Synchronous communication
← Event subscription / Asynchronous communication
```

## Detailed Bounded Context Specifications

### 1. Identity & Access Context

**Classification**: Supporting Domain
**Service**: Identity Service

#### Purpose
Manages all aspects of user identity, authentication, and authorization across the platform. Acts as the single source of truth for user identities and access control.

#### Core Concepts
- **User**: Individual with access to the system
- **Identity**: Authentication credentials and methods
- **Role**: Named set of permissions
- **Permission**: Granular access right
- **Session**: Active authenticated context

#### Aggregates

```
User (Aggregate Root)
├── UserId (VO)
├── Profile
│   ├── FirstName
│   ├── LastName
│   ├── Email (VO)
│   ├── Phone
│   └── Timezone
├── Credentials
│   ├── CognitoUserId
│   ├── PasswordHash
│   └── LastPasswordChange
├── MfaSettings
│   ├── Enabled
│   ├── Method (SMS/TOTP)
│   └── BackupCodes[]
└── Status (Active/Suspended/Deleted)

Role (Aggregate Root)
├── RoleId (VO)
├── Name
├── Description
├── Permissions[]
│   ├── Resource
│   ├── Action
│   └── Constraints
└── IsSystem (boolean)

Session (Aggregate Root)
├── SessionId (VO)
├── UserId (ref)
├── TokenFamily
├── CreatedAt
├── ExpiresAt
├── IpAddress
└── UserAgent
```

#### Anti-Corruption Layer
- Adapters for AWS Cognito integration
- JWT token verification using JWKS
- Legacy user migration handlers

#### Key Invariants
1. Email must be unique across all active users
2. Roles cannot be deleted if assigned to users
3. System roles cannot be modified
4. Sessions expire after inactivity period
5. Password must meet complexity requirements

---

### 2. Organization Context

**Classification**: Supporting Domain
**Service**: Organization Service

#### Purpose
Manages organizational structures, projects, and team assignments. Maintains the hierarchy of entities, subsidiaries, and locations while ensuring proper access control through project-based permissions.

#### Core Concepts
- **Company**: Legal entity using the platform
- **Project**: Reporting boundary for emissions
- **Hierarchy**: Tree structure of organizational units
- **Assignment**: User's role within a project

#### Aggregates

```
Company (Aggregate Root)
├── CompanyId (VO)
├── Name
├── RegistrationNumber
├── Industry
├── Headquarters
│   ├── Address
│   ├── Country
│   └── Timezone
├── Settings
│   ├── FiscalYearStart
│   ├── Currency
│   └── ReportingStandard
└── Status

Project (Aggregate Root)
├── ProjectId (VO)
├── CompanyId (ref)
├── Name
├── ReportingPeriod
│   ├── StartDate
│   ├── EndDate
│   └── Frequency
├── BaselineYear
├── Targets[]
│   ├── Scope
│   ├── Reduction%
│   └── TargetYear
└── Status

OrganizationUnit (Aggregate Root)
├── UnitId (VO)
├── CompanyId (ref)
├── Type (Entity/Subsidiary/Location)
├── ParentId (ref)
├── Code
├── Name
├── Metadata
│   ├── Address
│   ├── Manager
│   └── CostCenter
└── EffectiveDates
    ├── ValidFrom
    └── ValidTo

ProjectAssignment (Aggregate Root)
├── AssignmentId (VO)
├── ProjectId (ref)
├── UserId (ref)
├── RoleId (ref)
├── Scopes[]
│   ├── UnitId (ref)
│   └── Permissions[]
├── AssignedBy
├── AssignedDate
└── ExpiryDate
```

#### Anti-Corruption Layer
- Reference resolver for hierarchy navigation
- Permission evaluator for effective access
- Temporal query handlers for point-in-time structures

#### Key Invariants
1. Organization units form a valid tree (no cycles)
2. Projects must belong to exactly one company
3. Users can have multiple roles per project with non-overlapping scopes
4. Hierarchy changes maintain referential integrity
5. Historical structures preserved for reporting

---

### 3. Reference Data Context

**Classification**: Core Domain
**Service**: Reference Service

#### Purpose
Manages all reference data required for emission calculations including emission factors, conversion factors, and calculation parameters. Ensures data quality through approval workflows and version control.

#### Core Concepts
- **Emission Factor**: CO2e per unit of activity
- **Conversion Factor**: Unit transformation ratios
- **Parameter**: Calculation constants
- **Quality Control**: Approval workflow
- **Version**: Temporal validity of factors

#### Aggregates

```
EmissionFactor (Aggregate Root)
├── FactorId (VO)
├── Category
│   ├── Scope (1/2/3)
│   ├── Type
│   └── SubType
├── Source
│   ├── Name
│   ├── Year
│   └── URL
├── Value
│   ├── Amount
│   ├── Unit
│   └── CO2eUnit
├── Applicability
│   ├── Geography[]
│   ├── Industry[]
│   └── Conditions
├── QualityControl
│   ├── Status (Draft/Review/Approved)
│   ├── Reviewer
│   ├── ApprovalDate
│   └── Comments
└── Validity
    ├── EffectiveFrom
    ├── EffectiveTo
    └── Version

ConversionFactor (Aggregate Root)
├── ConversionId (VO)
├── FromUnit
├── ToUnit
├── Factor
├── Category
└── Validity

Parameter (Aggregate Root)
├── ParameterId (VO)
├── Name
├── Value
├── DataType
├── Category
├── Description
└── Constraints
    ├── Min
    ├── Max
    └── AllowedValues[]

ReportingYear (Aggregate Root)
├── YearId (VO)
├── Year
├── Standards[]
│   ├── Name (GHG Protocol/ISO)
│   ├── Version
│   └── Requirements
├── IsActive
└── CloseDate
```

#### Anti-Corruption Layer
- Import adapters for external factor databases
- Version migration handlers
- Standard compliance validators

#### Key Invariants
1. Approved factors cannot be modified (new version required)
2. Only one factor version active per category/geography/time
3. Conversion factors must be reciprocal
4. Parameters must satisfy defined constraints
5. QC approval required before use in calculations

---

### 4. Activity Data Context

**Classification**: Core Domain
**Service**: Activity Service

#### Purpose
Collects, validates, and manages emission activity data from various sources. Ensures data quality and completeness before calculation processing.

#### Core Concepts
- **Activity**: Emission-generating activity
- **Data Source**: Origin of activity data
- **Validation**: Data quality rules
- **Import**: Bulk data ingestion
- **Template**: Standardized data format

#### Aggregates

```
ActivityRecord (Aggregate Root)
├── ActivityId (VO)
├── ProjectId (ref)
├── UnitId (ref)
├── Period
│   ├── StartDate
│   ├── EndDate
│   └── Frequency
├── Category
│   ├── Scope
│   ├── Type
│   └── SubType
├── Data
│   ├── Quantity
│   ├── Unit
│   ├── Description
│   └── CustomFields{}
├── Source
│   ├── Type (Manual/Import/API)
│   ├── Reference
│   └── Timestamp
├── Validation
│   ├── Status (Pending/Valid/Invalid)
│   ├── Errors[]
│   └── Warnings[]
├── Attachments[]
│   ├── FileId
│   ├── FileName
│   └── Purpose
└── Audit
    ├── CreatedBy
    ├── CreatedAt
    ├── ModifiedBy
    └── ModifiedAt

DataImport (Aggregate Root)
├── ImportId (VO)
├── ProjectId (ref)
├── Template
│   ├── Format (CSV/Excel/JSON)
│   ├── Mapping{}
│   └── ValidationRules[]
├── File
│   ├── Name
│   ├── Size
│   └── S3Key
├── Status
│   ├── State (Pending/Processing/Complete/Failed)
│   ├── Progress
│   └── Message
├── Results
│   ├── TotalRecords
│   ├── ValidRecords
│   ├── InvalidRecords
│   └── Errors[]
└── ProcessedAt

ValidationRule (Value Object)
├── RuleId
├── Field
├── Type (Required/Range/Pattern/Custom)
├── Parameters{}
└── ErrorMessage
```

#### Anti-Corruption Layer
- Format converters for various import types
- Data cleaners and normalizers
- External API adapters

#### Key Invariants
1. Activity records must reference valid project/unit
2. Quantities must be positive numbers
3. Units must match category requirements
4. Period cannot overlap for same category/location
5. Validated data cannot be modified without re-validation

---

### 5. Calculation Context

**Classification**: Core Domain
**Service**: Calculation Service

#### Purpose
Performs emission calculations based on activity data and emission factors. Handles various calculation methodologies and aggregates results across organizational hierarchies.

#### Core Concepts
- **Calculation**: Emission computation process
- **Methodology**: Calculation approach/standard
- **Result**: Calculated emissions
- **Aggregation**: Roll-up to higher levels
- **Allocation**: Distribution of shared emissions

#### Aggregates

```
CalculationJob (Aggregate Root)
├── JobId (VO)
├── ProjectId (ref)
├── Scope
│   ├── Units[] (ref)
│   ├── Period
│   └── Categories[]
├── Methodology
│   ├── Standard (GHG Protocol/ISO)
│   ├── Version
│   └── Options{}
├── Status
│   ├── State (Queued/Processing/Complete/Failed)
│   ├── Progress
│   ├── StartTime
│   └── EndTime
├── Priority
└── RequestedBy

CalculationResult (Aggregate Root)
├── ResultId (VO)
├── JobId (ref)
├── ActivityId (ref)
├── Emissions
│   ├── CO2
│   ├── CH4
│   ├── N2O
│   ├── Other{}
│   └── CO2e
├── Factors
│   ├── EmissionFactorId (ref)
│   ├── Value
│   └── Source
├── Methodology
│   ├── Approach
│   ├── Equations[]
│   └── Assumptions[]
├── Confidence
│   ├── Level (High/Medium/Low)
│   └── Notes
└── Timestamp

AggregationResult (Aggregate Root)
├── AggregationId (VO)
├── ProjectId (ref)
├── Level (Location/Subsidiary/Entity/Project)
├── UnitId (ref)
├── Period
├── Totals
│   ├── Scope1
│   ├── Scope2
│   ├── Scope3
│   └── Total
├── Breakdown
│   ├── ByCategory{}
│   ├── ByUnit{}
│   └── ByPeriod{}
└── LastUpdated
```

#### Anti-Corruption Layer
- Methodology adapters for different standards
- Factor selection engine
- Uncertainty calculators

#### Key Invariants
1. Calculations must use approved factors only
2. Results immutable once finalized
3. Aggregations must equal sum of components
4. Recalculation triggers cascade updates
5. Methodology must be consistent within project

---

### 6. Reporting Context

**Classification**: Core Domain
**Service**: Reporting Service

#### Purpose
Generates reports, dashboards, and analytics based on calculated emissions. Provides real-time insights and supports various reporting formats and standards.

#### Core Concepts
- **Report**: Formatted emission disclosure
- **Dashboard**: Real-time metrics display
- **Analytics**: Statistical insights
- **Export**: Data extraction
- **Visualization**: Charts and graphs

#### Aggregates

```
Report (Aggregate Root)
├── ReportId (VO)
├── ProjectId (ref)
├── Template
│   ├── Type (Annual/Quarterly/CDP/TCFD)
│   ├── Format (PDF/Excel/HTML)
│   └── Sections[]
├── Parameters
│   ├── Period
│   ├── Units[]
│   ├── Scopes[]
│   └── Filters{}
├── Schedule
│   ├── Frequency
│   ├── NextRun
│   └── Recipients[]
├── Status
│   ├── State (Draft/Generated/Sent)
│   ├── GeneratedAt
│   └── S3Key
└── Metadata
    ├── CreatedBy
    ├── ApprovedBy
    └── Notes

Dashboard (Aggregate Root)
├── DashboardId (VO)
├── ProjectId (ref)
├── Name
├── Layout
│   ├── Grid[]
│   └── Theme
├── Widgets[]
│   ├── WidgetId
│   ├── Type (Chart/Table/Metric/Map)
│   ├── DataSource
│   ├── Configuration{}
│   └── RefreshRate
├── Filters
│   ├── Global[]
│   └── WidgetSpecific{}
├── Sharing
│   ├── IsPublic
│   ├── SharedWith[]
│   └── Permissions
└── LastModified

Analytics (Aggregate Root)
├── AnalyticsId (VO)
├── ProjectId (ref)
├── Type
│   ├── Trend
│   ├── Comparison
│   ├── Forecast
│   └── Benchmark
├── Metrics[]
│   ├── Name
│   ├── Value
│   ├── Change
│   └── Target
├── Insights[]
│   ├── Type
│   ├── Message
│   └── Severity
└── ComputedAt
```

#### Anti-Corruption Layer
- Report format converters
- Visualization libraries adapters
- Export format handlers

#### Key Invariants
1. Reports must use finalized data only
2. Dashboard access controlled by project permissions
3. Exports maintain audit trail
4. Analytics respect data privacy rules
5. Scheduled reports require active project

---

### 7. Audit Context

**Classification**: Generic Subdomain
**Service**: Audit Service

#### Purpose
Maintains comprehensive audit trail of all system activities for compliance, debugging, and forensic analysis. Ensures regulatory compliance and data lineage tracking.

#### Core Concepts
- **Audit Log**: Immutable activity record
- **Compliance**: Regulatory adherence
- **Lineage**: Data transformation tracking
- **Retention**: Data lifecycle management

#### Aggregates

```
AuditLog (Aggregate Root)
├── LogId (VO)
├── Timestamp
├── Actor
│   ├── UserId
│   ├── Name
│   ├── IpAddress
│   └── UserAgent
├── Action
│   ├── Type (Create/Update/Delete/Read)
│   ├── Resource
│   ├── ResourceId
│   └── Method
├── Context
│   ├── ProjectId
│   ├── CompanyId
│   └── SessionId
├── Changes
│   ├── Before{}
│   ├── After{}
│   └── Diff[]
├── Result
│   ├── Success
│   ├── Error
│   └── Duration
└── Metadata{}

ComplianceReport (Aggregate Root)
├── ReportId (VO)
├── Standard (SOC2/ISO27001/GDPR)
├── Period
├── Findings[]
│   ├── Requirement
│   ├── Status
│   ├── Evidence[]
│   └── Notes
├── Attestation
│   ├── Officer
│   ├── Date
│   └── Signature
└── FiledDate

DataLineage (Aggregate Root)
├── LineageId (VO)
├── EntityType
├── EntityId
├── Transformations[]
│   ├── Step
│   ├── Operation
│   ├── Source
│   ├── Target
│   └── Timestamp
├── Dependencies[]
└── Impact[]
```

#### Key Invariants
1. Audit logs are immutable and append-only
2. All write operations must generate audit entries
3. Retention policies enforced automatically
4. PII data masked in logs
5. Compliance reports require officer attestation

---

## Context Integration Patterns

### Event-Driven Integration

```yaml
Events Flow:
  Identity → Organization:
    - UserCreated
    - UserDeleted
    - RoleChanged

  Organization → Activity:
    - ProjectCreated
    - HierarchyUpdated
    - AssignmentChanged

  Activity → Calculation:
    - ActivityDataCreated
    - ActivityDataValidated
    - ImportCompleted

  Reference → Calculation:
    - EmissionFactorApproved
    - ConversionFactorUpdated

  Calculation → Reporting:
    - CalculationCompleted
    - AggregationUpdated

  All → Audit:
    - Every domain event logged
```

### Synchronous Integration Points

```yaml
API Calls (minimal):
  Organization → Identity:
    - Verify user exists
    - Check authentication status

  Calculation → Reference:
    - Fetch emission factors
    - Get conversion rates

  Calculation → Activity:
    - Retrieve activity records

  Reporting → Calculation:
    - Get latest results
```

## Data Ownership Matrix

| Context | Primary Data | Referenced Data | Cached Data |
|---------|-------------|-----------------|-------------|
| Identity | Users, Roles, Sessions | - | - |
| Organization | Companies, Projects, Hierarchies, Assignments | User IDs | User names |
| Reference | Emission Factors, Conversions, Parameters | - | - |
| Activity | Activity Records, Imports, Templates | Project IDs, Unit IDs | Hierarchy snapshot |
| Calculation | Jobs, Results, Aggregations | Activity IDs, Factor IDs | Factors, Activities |
| Reporting | Reports, Dashboards, Analytics | Project IDs, Result IDs | Calculation results |
| Audit | Audit Logs, Compliance, Lineage | All entity IDs | Entity snapshots |

## Service Interaction Rules

### 1. No Shared Databases
Each service owns its database exclusively. No service can directly access another service's database.

### 2. Reference by ID Only
Services store only IDs of entities owned by other services, not full objects.

### 3. Event-Driven Updates
State changes propagate via events, not synchronous calls.

### 4. Local Caching for Read Models
Services can cache read-only data from events for query optimization.

### 5. Compensating Transactions
Failed distributed operations use saga pattern for rollback.

### 6. Circuit Breaker Pattern
All synchronous calls implement circuit breakers with fallbacks.

## Anti-Pattern Prevention

### Avoided Patterns from Current System

1. **No Gateway Domain Logic**
   - API Gateway only handles routing, auth, rate limiting
   - All business logic in appropriate services

2. **No Data Cloning**
   - Hierarchies referenced, not duplicated
   - Single source of truth for each entity

3. **No Shared Event Types**
   - Each service publishes its own event contracts
   - Clear ownership and versioning

4. **No Distributed Monolith**
   - Services truly independent
   - Can be developed, deployed, scaled separately

5. **No Chatty Communication**
   - Bulk operations supported
   - Pagination and filtering at source

## Conclusion

This microservice decomposition establishes clear boundaries based on business capabilities, ensures data consistency through well-defined ownership, and enables independent service evolution. Each bounded context encapsulates its domain logic, maintains its invariants, and communicates through explicit contracts, creating a maintainable and scalable architecture.