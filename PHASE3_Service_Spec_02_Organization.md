# Service Specification: Organization Service

## Service Overview

**Service Name**: Organization Service
**Port**: 3002
**Purpose**: Manages companies, projects, organizational hierarchies, and team assignments
**Domain**: Organization & Project Management
**Team Ownership**: Platform Team

## 1. Functional Requirements

### 1.1 Core Features

#### Company Management
- Company registration and onboarding
- Company profile management
- Industry classification
- Multi-company support (enterprise)
- Company settings (fiscal year, currency, standards)
- Company suspension/deletion

#### Project Management
- Project creation with reporting boundaries
- Project configuration (baseline, targets, periods)
- Project lifecycle (draft, active, closed)
- Project cloning/templates
- Multi-year project support
- Project archival

#### Hierarchy Management
- Three-level hierarchy: Entity → Subsidiary → Location
- Reference-based structure (no cloning!)
- Temporal validity (effective dates)
- Hierarchy versioning for historical reporting
- Bulk hierarchy import
- Hierarchy validation rules

#### Team Management
- User-project assignments
- Role-based permissions per project
- Scope-based access (entity/subsidiary/location)
- Invitation system
- Team member removal
- Permission delegation

### 1.2 API Endpoints

#### Company Endpoints
```yaml
POST /api/v1/companies
  Request:
    - name: string (required)
    - registrationNumber: string
    - industry: string (NAICS/SIC code)
    - headquarters:
        address: string
        city: string
        country: string (ISO code)
        postalCode: string
    - settings:
        fiscalYearStart: string (MM-DD)
        currency: string (ISO code)
        reportingStandard: string (GHG Protocol/ISO)
  Response:
    - companyId: string
    - company: Company

GET /api/v1/companies/:companyId
  Response:
    - company: Company

PUT /api/v1/companies/:companyId
  Request:
    - name: string
    - industry: string
    - headquarters: object
    - settings: object
  Response:
    - company: Company

DELETE /api/v1/companies/:companyId
  Response:
    - success: boolean
    - message: string

GET /api/v1/companies
  Query:
    - search: string
    - industry: string
    - status: active|suspended|deleted
    - page: number
    - limit: number
  Response:
    - companies: Company[]
    - total: number
```

#### Project Endpoints
```yaml
POST /api/v1/projects
  Request:
    - companyId: string (required)
    - name: string (required)
    - description: string
    - reportingPeriod:
        startDate: ISO8601
        endDate: ISO8601
        frequency: annual|quarterly|monthly
    - baselineYear: number
    - targets:
        - scope: 1|2|3
          reduction: number (percentage)
          targetYear: number
    - templateId: string (optional)
  Response:
    - projectId: string
    - project: Project

GET /api/v1/projects/:projectId
  Response:
    - project: Project

PUT /api/v1/projects/:projectId
  Request:
    - name: string
    - description: string
    - reportingPeriod: object
    - targets: array
    - status: draft|active|closed
  Response:
    - project: Project

GET /api/v1/projects
  Query:
    - companyId: string
    - status: draft|active|closed
    - year: number
    - search: string
    - page: number
    - limit: number
  Response:
    - projects: Project[]
    - total: number

POST /api/v1/projects/:projectId/clone
  Request:
    - newName: string (required)
    - includeData: boolean
    - targetYear: number
  Response:
    - projectId: string
    - project: Project

DELETE /api/v1/projects/:projectId
  Response:
    - success: boolean
    - archived: boolean
```

#### Hierarchy Endpoints
```yaml
POST /api/v1/hierarchies/entities
  Request:
    - companyId: string (required)
    - code: string (required, unique)
    - name: string (required)
    - description: string
    - metadata:
        address: string
        manager: string
        costCenter: string
    - effectiveFrom: ISO8601
    - effectiveTo: ISO8601 (optional)
  Response:
    - entityId: string
    - entity: Entity

GET /api/v1/hierarchies/entities/:entityId
  Query:
    - asOf: ISO8601 (point-in-time query)
  Response:
    - entity: Entity

PUT /api/v1/hierarchies/entities/:entityId
  Request:
    - name: string
    - description: string
    - metadata: object
    - effectiveTo: ISO8601
  Response:
    - entity: Entity

POST /api/v1/hierarchies/subsidiaries
  Request:
    - entityId: string (required, parent)
    - code: string (required, unique within entity)
    - name: string (required)
    - description: string
    - metadata: object
    - effectiveFrom: ISO8601
  Response:
    - subsidiaryId: string
    - subsidiary: Subsidiary

GET /api/v1/hierarchies/subsidiaries/:subsidiaryId
  Response:
    - subsidiary: Subsidiary

POST /api/v1/hierarchies/locations
  Request:
    - subsidiaryId: string (required, parent)
    - code: string (required, unique within subsidiary)
    - name: string (required)
    - type: office|factory|warehouse|retail
    - address: object
    - coordinates:
        latitude: number
        longitude: number
    - metadata: object
    - effectiveFrom: ISO8601
  Response:
    - locationId: string
    - location: Location

GET /api/v1/hierarchies/locations/:locationId
  Response:
    - location: Location

GET /api/v1/hierarchies/tree
  Query:
    - companyId: string (required)
    - projectId: string
    - asOf: ISO8601
    - depth: number (1-3)
    - includeInactive: boolean
  Response:
    - hierarchy: HierarchyTree

POST /api/v1/hierarchies/import
  Request:
    - companyId: string (required)
    - format: csv|excel|json
    - data: base64 string or S3 URL
    - mappings: object
    - validateOnly: boolean
  Response:
    - importId: string
    - status: validating|importing|complete|failed
    - results:
        total: number
        valid: number
        errors: array

GET /api/v1/hierarchies/validate
  Request:
    - companyId: string (required)
    - structure: HierarchyStructure
  Response:
    - valid: boolean
    - errors: array
    - warnings: array
```

#### Team Assignment Endpoints
```yaml
POST /api/v1/projects/:projectId/assignments
  Request:
    - userId: string (required)
    - roleId: string (required)
    - scopes: array of
        - unitId: string
          unitType: entity|subsidiary|location
          permissions: array (optional overrides)
    - expiryDate: ISO8601 (optional)
    - sendInvite: boolean
  Response:
    - assignmentId: string
    - assignment: Assignment

GET /api/v1/projects/:projectId/assignments
  Query:
    - userId: string
    - roleId: string
    - scope: string (unitId)
    - includeExpired: boolean
  Response:
    - assignments: Assignment[]
    - total: number

PUT /api/v1/projects/:projectId/assignments/:assignmentId
  Request:
    - roleId: string
    - scopes: array
    - expiryDate: ISO8601
  Response:
    - assignment: Assignment

DELETE /api/v1/projects/:projectId/assignments/:assignmentId
  Response:
    - success: boolean
    - removedAt: ISO8601

GET /api/v1/users/:userId/projects
  Query:
    - companyId: string
    - role: string
    - includeExpired: boolean
  Response:
    - projects: ProjectAssignment[]

GET /api/v1/permissions/effective
  Query:
    - userId: string (required)
    - projectId: string (required)
    - resource: string
    - unitId: string
  Response:
    - permissions: EffectivePermissions
    - source: role|override
    - scopes: array
```

#### Invitation Endpoints
```yaml
POST /api/v1/invitations
  Request:
    - email: string (required)
    - projectId: string (required)
    - roleId: string (required)
    - scopes: array
    - message: string
    - expiryDays: number (default: 7)
  Response:
    - invitationId: string
    - invitation: Invitation

GET /api/v1/invitations/:invitationId
  Response:
    - invitation: Invitation

POST /api/v1/invitations/:invitationId/accept
  Request:
    - userId: string (optional, if not logged in)
  Response:
    - assignmentId: string
    - project: Project

POST /api/v1/invitations/:invitationId/resend
  Response:
    - success: boolean
    - resentAt: ISO8601

DELETE /api/v1/invitations/:invitationId
  Response:
    - success: boolean
    - cancelledAt: ISO8601
```

### 1.3 Business Rules

#### Company Rules
1. Company registration number must be unique if provided
2. At least one active admin user required per company
3. Company deletion requires all projects to be archived first
4. Industry classification must use standard codes (NAICS/SIC)
5. Fiscal year start cannot be changed after first project created

#### Project Rules
1. Projects must belong to exactly one company
2. Reporting period cannot overlap for same company
3. Baseline year must be <= current year
4. Targets must be > baseline year
5. Closed projects become read-only
6. Project deletion soft-deletes (archival)

#### Hierarchy Rules
1. Entity codes unique per company
2. Subsidiary codes unique per entity
3. Location codes unique per subsidiary
4. No circular references allowed
5. Effective dates cannot overlap for same unit
6. Parent must exist before child creation
7. Deletion cascades to children (soft delete)
8. Historical structures preserved for reporting

#### Assignment Rules
1. Users can have multiple roles per project
2. Scopes cannot overlap within same role
3. Higher-level scope includes lower levels (entity > subsidiary > location)
4. Assignments expire at project end date
5. At least one project admin required
6. Users cannot remove their own admin access

### 1.4 Error Handling

```yaml
Error Responses:
  400 Bad Request:
    - INVALID_HIERARCHY_STRUCTURE
    - INVALID_DATE_RANGE
    - MISSING_PARENT_UNIT

  403 Forbidden:
    - INSUFFICIENT_PROJECT_PERMISSIONS
    - CANNOT_DELETE_LAST_ADMIN
    - PROJECT_ARCHIVED

  404 Not Found:
    - COMPANY_NOT_FOUND
    - PROJECT_NOT_FOUND
    - HIERARCHY_UNIT_NOT_FOUND

  409 Conflict:
    - DUPLICATE_ENTITY_CODE
    - OVERLAPPING_REPORTING_PERIOD
    - USER_ALREADY_ASSIGNED

  422 Unprocessable Entity:
    - CIRCULAR_HIERARCHY_REFERENCE
    - INVALID_TEMPORAL_SEQUENCE
    - ORPHANED_HIERARCHY_NODE
```

## 2. Data Model

### 2.1 MongoDB Collections

#### companies Collection
```javascript
{
  _id: ObjectId,
  companyId: String (UUID, indexed),
  name: String (indexed),
  registrationNumber: String (unique, sparse),

  profile: {
    industry: String (NAICS/SIC),
    size: String (small|medium|large|enterprise),
    website: String,
    logo: String (S3 URL)
  },

  headquarters: {
    address: String,
    city: String,
    state: String,
    country: String (ISO),
    postalCode: String,
    timezone: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },

  settings: {
    fiscalYearStart: String (MM-DD),
    currency: String (ISO),
    reportingStandard: String,
    units: {
      energy: String,
      emissions: String,
      distance: String
    }
  },

  subscription: {
    plan: String,
    status: String,
    validUntil: Date
  },

  status: String (active|suspended|deleted),

  metadata: {
    createdAt: Date (indexed),
    createdBy: String (userId),
    updatedAt: Date,
    updatedBy: String,
    deletedAt: Date
  }
}

// Indexes
- companyId: unique
- name: text
- registrationNumber: unique, sparse
- status: 1
```

#### projects Collection
```javascript
{
  _id: ObjectId,
  projectId: String (UUID, indexed),
  companyId: String (indexed, ref),

  name: String (indexed),
  description: String,
  type: String (inventory|reduction|offset),

  reportingPeriod: {
    startDate: Date (indexed),
    endDate: Date (indexed),
    frequency: String (annual|quarterly|monthly),
    currentPeriod: Number
  },

  baseline: {
    year: Number,
    verified: Boolean,
    verifiedBy: String,
    verifiedAt: Date
  },

  targets: [{
    targetId: String,
    scope: String (scope1|scope2|scope3|total),
    type: String (absolute|intensity),
    baseline: Number,
    target: Number,
    targetYear: Number,
    unit: String
  }],

  boundaries: {
    organizational: String (control|equity),
    operational: [String] (scopes included),
    geographic: [String] (countries/regions)
  },

  settings: {
    autoCalculate: Boolean,
    requireApproval: Boolean,
    dataLockDate: Date,
    notifications: {
      email: Boolean,
      frequency: String
    }
  },

  status: String (draft|active|closed|archived),

  metadata: {
    createdAt: Date (indexed),
    createdBy: String,
    updatedAt: Date,
    updatedBy: String,
    closedAt: Date,
    closedBy: String,
    archivedAt: Date
  },

  statistics: {
    totalEmissions: Number,
    lastCalculation: Date,
    completeness: Number (percentage),
    dataPoints: Number
  }
}

// Indexes
- projectId: unique
- companyId: 1
- reportingPeriod.startDate: 1
- reportingPeriod.endDate: 1
- status: 1
- name: text
```

#### organization_units Collection
```javascript
{
  _id: ObjectId,
  unitId: String (UUID, indexed),
  companyId: String (indexed, ref),

  type: String (entity|subsidiary|location),
  parentId: String (indexed, ref to parent unit),

  code: String (indexed),
  name: String (indexed),
  description: String,

  // For entities
  entity: {
    legalName: String,
    registrationNumber: String,
    taxId: String
  },

  // For subsidiaries
  subsidiary: {
    businessUnit: String,
    division: String,
    region: String
  },

  // For locations
  location: {
    locationType: String (office|factory|warehouse|retail|other),
    address: {
      street: String,
      city: String,
      state: String,
      country: String (ISO),
      postalCode: String
    },
    coordinates: {
      lat: Number,
      lng: Number
    },
    size: Number (sq meters),
    capacity: Number,
    operatingHours: String
  },

  metadata: {
    costCenter: String,
    manager: String,
    employeeCount: Number,
    customFields: Object
  },

  validity: {
    effectiveFrom: Date (indexed),
    effectiveTo: Date (indexed),
    version: Number,
    reason: String (created|modified|reorganized)
  },

  status: String (active|inactive|deleted),

  audit: {
    createdAt: Date,
    createdBy: String,
    updatedAt: Date,
    updatedBy: String,
    deletedAt: Date
  }
}

// Indexes
- unitId: unique
- companyId: 1, code: 1 (compound unique)
- parentId: 1
- type: 1
- validity.effectiveFrom: 1
- validity.effectiveTo: 1
- status: 1
```

#### project_assignments Collection
```javascript
{
  _id: ObjectId,
  assignmentId: String (UUID, indexed),
  projectId: String (indexed, ref),
  userId: String (indexed, ref),

  role: {
    roleId: String (ref),
    roleName: String (denormalized for performance)
  },

  scopes: [{
    unitId: String (ref),
    unitType: String (entity|subsidiary|location),
    unitName: String (denormalized),
    permissions: [String] (optional overrides),
    inherited: Boolean
  }],

  delegation: {
    canDelegate: Boolean,
    delegatedFrom: String (userId),
    delegationChain: [String]
  },

  validity: {
    startDate: Date,
    endDate: Date,
    expiryNotified: Boolean
  },

  invitation: {
    invitedBy: String,
    invitedAt: Date,
    acceptedAt: Date,
    inviteMessage: String
  },

  status: String (pending|active|expired|revoked),

  metadata: {
    createdAt: Date,
    createdBy: String,
    updatedAt: Date,
    updatedBy: String,
    revokedAt: Date,
    revokedBy: String,
    revokeReason: String
  }
}

// Indexes
- assignmentId: unique
- projectId: 1, userId: 1 (compound)
- userId: 1
- status: 1
- validity.endDate: 1
```

#### invitations Collection
```javascript
{
  _id: ObjectId,
  invitationId: String (UUID, indexed),
  token: String (unique, indexed),

  email: String (indexed),
  projectId: String (ref),
  companyId: String (ref),

  assignment: {
    roleId: String,
    roleName: String,
    scopes: Array
  },

  message: String,

  validity: {
    createdAt: Date,
    expiresAt: Date (indexed),
    usedAt: Date
  },

  status: String (pending|accepted|expired|cancelled),

  metadata: {
    invitedBy: String,
    invitedByName: String,
    acceptedBy: String,
    cancelledBy: String,
    resentCount: Number,
    lastResentAt: Date
  }
}

// Indexes
- invitationId: unique
- token: unique
- email: 1
- validity.expiresAt: 1 (TTL index)
- status: 1
```

#### hierarchy_snapshots Collection
```javascript
{
  _id: ObjectId,
  snapshotId: String (UUID, indexed),
  projectId: String (indexed, ref),
  companyId: String (indexed, ref),

  asOf: Date (indexed),
  reason: String (reporting|audit|backup),

  structure: {
    entities: [{
      unitId: String,
      code: String,
      name: String,
      subsidiaries: [{
        unitId: String,
        code: String,
        name: String,
        locations: [{
          unitId: String,
          code: String,
          name: String,
          metadata: Object
        }]
      }]
    }]
  },

  statistics: {
    totalEntities: Number,
    totalSubsidiaries: Number,
    totalLocations: Number,
    totalUnits: Number
  },

  metadata: {
    createdAt: Date,
    createdBy: String,
    purpose: String,
    immutable: Boolean
  }
}

// Indexes
- snapshotId: unique
- projectId: 1, asOf: -1
- companyId: 1
```

### 2.2 Event Publishing

The Organization Service publishes to AWS EventBridge for:
- Company lifecycle events
- Project lifecycle events
- Hierarchy changes
- Assignment changes

## 3. Non-Functional Requirements

### 3.1 Performance
- **Project creation**: < 2s including hierarchy setup
- **Hierarchy tree fetch**: < 500ms for 1000 nodes
- **Permission evaluation**: < 100ms
- **Bulk import**: 1000 units/minute
- **Assignment lookup**: < 200ms

### 3.2 Scalability
- **Companies**: 10K companies
- **Projects**: 100K projects
- **Hierarchy nodes**: 1M total units
- **Assignments**: 100K active
- **Concurrent users**: 5K

### 3.3 Availability
- **Uptime SLA**: 99.9%
- **RTO**: 1 hour
- **RPO**: 15 minutes
- **Graceful degradation**: Read-only mode fallback

### 3.4 Security
- **Data isolation**: Tenant data separation
- **Encryption**: At rest and in transit
- **Audit logging**: All modifications logged
- **RBAC**: Fine-grained permissions
- **Data residency**: Configurable per company

### 3.5 Observability
- **Metrics**:
  - Project creation rate
  - Hierarchy operation latency
  - Assignment changes/hour
  - Import success rate

- **Logs**:
  - All CRUD operations
  - Permission evaluations
  - Import processes
  - Error conditions

- **Alerts**:
  - Failed imports > 10/hour
  - Permission evaluation errors
  - Hierarchy inconsistencies
  - Mass assignment changes

## 4. Module Architecture

### 4.1 Internal Structure
```
organization-service/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── companies/
│   │   ├── companies.module.ts
│   │   ├── companies.controller.ts
│   │   ├── companies.service.ts
│   │   ├── companies.repository.ts
│   │   └── dto/
│   │
│   ├── projects/
│   │   ├── projects.module.ts
│   │   ├── projects.controller.ts
│   │   ├── projects.service.ts
│   │   ├── projects.repository.ts
│   │   └── dto/
│   │
│   ├── hierarchy/
│   │   ├── hierarchy.module.ts
│   │   ├── hierarchy.controller.ts
│   │   ├── hierarchy.service.ts
│   │   ├── units.repository.ts
│   │   ├── validators/
│   │   │   └── hierarchy.validator.ts
│   │   └── dto/
│   │
│   ├── assignments/
│   │   ├── assignments.module.ts
│   │   ├── assignments.controller.ts
│   │   ├── assignments.service.ts
│   │   ├── permissions.service.ts
│   │   └── dto/
│   │
│   ├── invitations/
│   │   ├── invitations.module.ts
│   │   ├── invitations.controller.ts
│   │   ├── invitations.service.ts
│   │   └── dto/
│   │
│   ├── events/
│   │   ├── events.module.ts
│   │   ├── event-publisher.service.ts
│   │   ├── event-consumer.service.ts
│   │   └── schemas/
│   │
│   └── common/
│       ├── guards/
│       ├── interceptors/
│       └── utils/
│
├── test/
├── Dockerfile
└── package.json
```

### 4.2 Key Dependencies
```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/mongoose": "^10.0.0",
    "@aws-sdk/client-eventbridge": "^3.0.0",
    "mongoose": "^8.0.0",
    "ioredis": "^5.0.0",
    "csv-parse": "^5.0.0",
    "xlsx": "^0.18.0"
  }
}
```

## 5. Event Contracts

### 5.1 Published Events

#### CompanyCreated
```json
{
  "eventType": "CompanyCreated",
  "version": "1.0",
  "payload": {
    "companyId": "string",
    "name": "string",
    "industry": "string",
    "createdBy": "string",
    "timestamp": "ISO8601"
  }
}
```

#### ProjectCreated
```json
{
  "eventType": "ProjectCreated",
  "version": "1.0",
  "payload": {
    "projectId": "string",
    "companyId": "string",
    "name": "string",
    "reportingPeriod": {
      "start": "ISO8601",
      "end": "ISO8601"
    },
    "createdBy": "string",
    "timestamp": "ISO8601"
  }
}
```

#### HierarchyUpdated
```json
{
  "eventType": "HierarchyUpdated",
  "version": "1.0",
  "payload": {
    "companyId": "string",
    "changeType": "created|updated|deleted",
    "unit": {
      "unitId": "string",
      "type": "entity|subsidiary|location",
      "code": "string",
      "name": "string",
      "parentId": "string"
    },
    "timestamp": "ISO8601"
  }
}
```

#### UserAssignedToProject
```json
{
  "eventType": "UserAssignedToProject",
  "version": "1.0",
  "payload": {
    "assignmentId": "string",
    "projectId": "string",
    "userId": "string",
    "roleId": "string",
    "scopes": "array",
    "assignedBy": "string",
    "timestamp": "ISO8601"
  }
}
```

### 5.2 Consumed Events

#### UserRegistered (from Identity Service)
```json
{
  "eventType": "UserRegistered",
  "action": "Check for pending invitations and auto-assign"
}
```

#### UserDeleted (from Identity Service)
```json
{
  "eventType": "UserDeleted",
  "action": "Remove all project assignments for deleted user"
}
```

## 6. Integration Points

### 6.1 Identity Service
- Verify user exists (sync)
- Get user details for assignments

### 6.2 AWS EventBridge
- Publish organization events
- Subscribe to user events

### 6.3 Redis Cache
- Cache hierarchy structures
- Cache permission evaluations
- Session data for real-time updates

### 6.4 AWS S3
- Hierarchy import files
- Company logos
- Export downloads

## 7. Migration Considerations

### From Current System
1. **Critical**: Convert cloned hierarchies to references
2. Map existing project structures
3. Preserve historical assignments
4. Generate hierarchy snapshots for past periods
5. Normalize permission model

### Migration Steps
1. Extract unique hierarchy from cloned data
2. Create reference-based structure
3. Link projects to hierarchy references
4. Migrate assignments with new permission model
5. Validate data integrity
6. Create historical snapshots

## 8. Testing Requirements

### 8.1 Unit Tests (80% coverage)
- Hierarchy validation logic
- Permission evaluation
- Business rule enforcement

### 8.2 Integration Tests
- Complete project setup flow
- Hierarchy import process
- Assignment workflows

### 8.3 Performance Tests
- Large hierarchy operations (10K nodes)
- Bulk assignment creation
- Permission evaluation under load

## 9. Future Enhancements

### Phase 2
- Advanced hierarchy features (tags, attributes)
- Workflow approvals for changes
- Template marketplace

### Phase 3
- Multi-tenant architecture
- Advanced permission models (ABAC)
- Hierarchy comparison tools
- Change impact analysis