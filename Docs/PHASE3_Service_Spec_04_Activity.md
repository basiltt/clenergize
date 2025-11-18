# Service Specification: Activity Service

## Service Overview

**Service Name**: Activity Service
**Port**: 3004
**Purpose**: Manages emissions activity data collection, validation, and bulk import operations
**Domain**: Carbon Footprint Data Management
**Team Ownership**: Carbon Intelligence Team

**Split from OLD Service**: `clenergizeV3-carbon-footprint-ms-dev` (Activity Data portion)

---

## 1. Functional Requirements

### 1.1 Core Features

#### Activity Data Management
- Activity data CRUD operations across all GHG Protocol scopes
- Monthly breakdown tracking (Jan-Dec)
- File attachment management (evidence uploads)
- Data verification workflow
- Activity data comments and reviews
- Version history tracking

#### Activity Categories
**Scope 1 (Direct Emissions)**:
- Stationary Combustion (boilers, heaters, generators)
- Mobile Combustion (vehicles, machinery)
- Fugitive Emissions (refrigerant leaks, gas leaks)
- Process Emissions (industrial processes)

**Scope 2 (Indirect Energy Emissions)**:
- Electricity (grid purchases)
- Chilled Water (district cooling)
- Heating/Steaming (district heating)

**Scope 3 (Other Indirect Emissions)**:
- Waste Water (wastewater treatment)

#### Carbon Scope Management
- Project-year scope initialization
- Module availability tracking
- Hierarchy-level scope assignment
- Scope status management

#### Bulk Operations
- Excel/CSV import with validation
- Bulk update operations
- Bulk file attachments
- Data quality scoring
- Import error reporting

#### Data Validation
- Parameter validation (via Reference Service)
- Quantity range validation
- UOM compatibility checking
- Monthly data consistency validation
- File format validation

---

## 1.2 API Endpoints

### Carbon Scope Endpoints

```yaml
POST /v1/carbon-scopes
  Description: Create carbon scope for project-year
  Auth: Required (project admin/member)
  Request:
    - projectId: string (UUID, required)
    - entityId: string (UUID, required)
    - entityType: 'Company' | 'Entity' | 'Subsidiary' | 'Location' (required)
    - scopeType: 'project' | 'entity' | 'subsidiary' | 'location' (required)
    - year: number (required, 2000-2100)
    - modules: string[] (required, activity categories to enable)
  Response:
    - carbonScopeId: string
    - projectId: string
    - entityId: string
    - year: number
    - modules: string[]
    - status: 'active' | 'inactive'
    - createdAt: string (ISO 8601)

POST /v1/carbon-scopes/bulk
  Description: Create multiple carbon scopes (project initialization)
  Auth: Required (project admin)
  Request:
    - projectId: string (required)
    - years: number[] (required)
    - entities: {
        entityId: string,
        entityType: string,
        modules: string[]
      }[]
  Response:
    - created: number (count)
    - carbonScopes: CarbonScope[]

GET /v1/carbon-scopes/project/:projectId
  Description: Get all carbon scopes for a project
  Auth: Required
  Query Params:
    - year?: number
    - entityType?: string
    - status?: string
  Response:
    - carbonScopes: CarbonScope[]
    - total: number

GET /v1/carbon-scopes/:id
  Description: Get carbon scope details
  Auth: Required
  Response: CarbonScope

PATCH /v1/carbon-scopes/:id
  Description: Update carbon scope
  Auth: Required (project admin)
  Request:
    - modules?: string[]
    - status?: 'active' | 'inactive'
  Response: CarbonScope

DELETE /v1/carbon-scopes/:id
  Description: Delete carbon scope
  Auth: Required (project admin)
  Response:
    - success: boolean
    - message: string
```

### Activity Data Endpoints (Generic Pattern)

**Note**: The following endpoints apply to all 8 activity categories:
- Stationary Combustion
- Mobile Combustion
- Fugitive Emission
- Process Emission
- Electricity
- Chilled Water
- Heating/Steaming
- Waste Water

```yaml
POST /v1/activity-data/{category}
  Description: Create activity data record
  Auth: Required (project member with create permission)
  Path Params:
    - category: 'stationary-combustion' | 'mobile-combustion' | ... (kebab-case)
  Request:
    - projectId: string (UUID, required)
    - scopeId: string (UUID, required - carbon scope ID)
    - entityId: string (UUID, required)
    - entityType: 'Entity' | 'Subsidiary' | 'Location' (required)
    - parentEntityId: string (UUID, optional - for roll-ups)
    - parentEntityType: string (optional)
    - parameter: string (UUID, required - parameter ID from Reference Service)
    - year: number (required, 2000-2100)
    - quantityConsumed: number (required, >= 0)
    - uom: string (required - unit of measure)
    - monthlyData?: {
        jan?: number, feb?: number, mar?: number, apr?: number,
        may?: number, jun?: number, jul?: number, aug?: number,
        sep?: number, oct?: number, nov?: number, dec?: number
      }
    - fileAttachments?: {
        janFiles?: string[], febFiles?: string[], ... // S3 URLs
      }
    - isClientCreated?: boolean (default: false)
  Response:
    - activityDataId: string
    - projectId: string
    - category: string
    - parameter: ParameterSummary (from Reference Service)
    - quantityConsumed: number
    - uom: string
    - year: number
    - monthlyData: Record<string, number>
    - createdAt: string
    - createdBy: string

POST /v1/activity-data/{category}/bulk
  Description: Create multiple activity data records (bulk import)
  Auth: Required (project member with create permission)
  Request:
    - projectId: string (required)
    - records: ActivityDataInput[] (max 1000 per request)
    - validate: boolean (default: true - dry-run mode)
  Response:
    - importId: string
    - status: 'validating' | 'importing' | 'completed' | 'failed'
    - total: number
    - valid: number
    - invalid: number
    - errors: {
        rowIndex: number,
        field: string,
        message: string
      }[]
    - createdRecords?: ActivityData[] (if validate=false)

GET /v1/activity-data/{category}
  Description: List activity data records
  Auth: Required
  Query Params:
    - projectId: string (required)
    - scopeId?: string
    - entityId?: string
    - year?: number
    - parameter?: string (parameter ID)
    - verified?: boolean
    - page?: number (default: 1)
    - limit?: number (default: 50, max: 500)
    - sort?: 'createdAt' | 'updatedAt' | 'year' | 'quantityConsumed'
    - order?: 'asc' | 'desc'
  Response:
    - data: ActivityData[]
    - pagination: {
        page: number,
        limit: number,
        total: number,
        pages: number
      }

GET /v1/activity-data/{category}/:id
  Description: Get activity data details
  Auth: Required
  Response: ActivityData (with full parameter details)

PATCH /v1/activity-data/{category}/:id
  Description: Update activity data record
  Auth: Required (project member with edit permission)
  Request:
    - quantityConsumed?: number
    - uom?: string
    - monthlyData?: MonthlyData
    - fileAttachments?: FileAttachments
  Response: ActivityData
  Events: activity.data.updated.v1

PUT /v1/activity-data/{category}/:id/replace
  Description: Replace entire activity data record
  Auth: Required (project admin)
  Request: Complete ActivityDataInput
  Response: ActivityData

PATCH /v1/activity-data/{category}/bulk-update
  Description: Update multiple records (bulk edit)
  Auth: Required (project member with edit permission)
  Request:
    - ids: string[] (activity data IDs)
    - updates: Partial<ActivityDataInput>
  Response:
    - updated: number
    - failed: number
    - errors: { id: string, message: string }[]

DELETE /v1/activity-data/{category}/:id
  Description: Delete activity data record
  Auth: Required (project admin or owner)
  Response:
    - success: boolean
    - message: string
  Events: activity.data.deleted.v1

POST /v1/activity-data/{category}/:id/verify
  Description: Verify activity data
  Auth: Required (project admin)
  Request:
    - comment?: string
  Response:
    - activityDataId: string
    - verified: boolean
    - verifiedBy: string
    - verifiedAt: string
  Events: activity.data.verified.v1

POST /v1/activity-data/{category}/:id/files
  Description: Upload file attachment for activity data
  Auth: Required (project member)
  Request: multipart/form-data
    - file: File (max 10MB)
    - month: 'jan' | 'feb' | ... | 'dec'
  Response:
    - fileUrl: string (S3 URL)
    - fileSize: number
    - uploadedAt: string

DELETE /v1/activity-data/{category}/:id/files/:fileId
  Description: Delete file attachment
  Auth: Required (project admin or owner)
  Response:
    - success: boolean
```

### Activity Comments Endpoints

```yaml
POST /v1/activity-data/{category}/:id/comments
  Description: Add comment to activity data
  Auth: Required
  Request:
    - comment: string (required, max 2000 chars)
  Response:
    - commentId: string
    - activityDataId: string
    - comment: string
    - commentedBy: string
    - commentedAt: string
  Events: activity.comment.added.v1

GET /v1/activity-data/{category}/:id/comments
  Description: Get comments for activity data
  Auth: Required
  Response:
    - comments: Comment[]

PATCH /v1/activity-data/{category}/:id/comments/:commentId
  Description: Update comment
  Auth: Required (comment owner or admin)
  Request:
    - comment: string
  Response: Comment

DELETE /v1/activity-data/{category}/:id/comments/:commentId
  Description: Delete comment
  Auth: Required (comment owner or admin)
  Response:
    - success: boolean
```

### Bulk Import Endpoints

```yaml
POST /v1/import/excel
  Description: Import activity data from Excel file
  Auth: Required (project member)
  Request: multipart/form-data
    - file: File (Excel .xlsx, max 50MB)
    - projectId: string
    - category: string (activity category)
    - year: number
    - validate: boolean (default: true - dry-run mode)
  Response:
    - importId: string
    - status: 'validating' | 'importing' | 'completed' | 'failed'
    - summary: {
        totalRows: number,
        validRows: number,
        invalidRows: number,
        duplicateRows: number
      }
    - errors: {
        row: number,
        column: string,
        value: any,
        message: string
      }[]
    - warnings: {
        row: number,
        message: string
      }[]
  Events: activity.bulk-import.completed.v1 (if validate=false and successful)

GET /v1/import/:importId/status
  Description: Get import status
  Auth: Required
  Response:
    - importId: string
    - status: 'validating' | 'importing' | 'completed' | 'failed'
    - progress: number (0-100)
    - summary: ImportSummary
    - errors: ImportError[]

POST /v1/import/:importId/confirm
  Description: Confirm import after validation
  Auth: Required
  Response:
    - importId: string
    - status: 'importing'
    - message: string

DELETE /v1/import/:importId
  Description: Cancel import
  Auth: Required
  Response:
    - success: boolean
```

### Data Quality Endpoints

```yaml
GET /v1/data-quality/project/:projectId
  Description: Get data quality score for project
  Auth: Required
  Query Params:
    - year?: number
    - category?: string
  Response:
    - overall Quality: number (0-100)
    - byCategory: {
        category: string,
        quality: number,
        issues: {
          type: 'missing_data' | 'incomplete_months' | 'no_files' | 'not_verified',
          count: number
        }[]
      }[]
    - recommendations: string[]

GET /v1/data-quality/entity/:entityId
  Description: Get data quality score for entity
  Auth: Required
  Query Params:
    - year?: number
  Response:
    - entityId: string
    - entityName: string
    - quality: number
    - issues: DataQualityIssue[]
```

---

## 2. Data Models

### Carbon Scope

```typescript
interface CarbonScope {
  _id: ObjectId;
  projectId: ObjectId;
  entityId: ObjectId;
  entityType: 'Company' | 'Entity' | 'Subsidiary' | 'Location';
  scopeType: 'project' | 'entity' | 'subsidiary' | 'location';
  year: number;
  modules: string[];              // Enabled activity categories
  status: 'active' | 'inactive';
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: ObjectId;
  };

  // Indexes
  // - { projectId: 1, year: 1 }
  // - { entityId: 1, year: 1 } unique
  // - { status: 1 }
}
```

### Activity Data (Base Structure)

```typescript
interface ActivityData {
  _id: ObjectId;
  projectId: ObjectId;
  scopeId: ObjectId;              // CarbonScope ID
  parentEntityId?: ObjectId;      // For roll-up aggregation
  parentEntityType?: 'Entity' | 'Subsidiary' | 'Location';

  // Entity information
  entityId: ObjectId;
  entityType: 'Entity' | 'Subsidiary' | 'Location';

  // Category and parameter
  category: 'StationaryCombustion' | 'MobileCombustion' | 'FugitiveEmission' |
            'ProcessEmission' | 'Electricity' | 'ChilledWater' |
            'HeatingSteaming' | 'WasteWater';
  parameterId: ObjectId;          // Reference to Parameter in Reference Service

  // Measurement
  year: number;
  quantityConsumed: number;       // Total quantity
  uom: string;                    // Unit of measure
  defaultUom: string;             // Default UOM for this parameter
  uomList: string[];              // Available UOMs for conversion

  // Monthly breakdown
  monthlyData: {
    jan?: number;
    feb?: number;
    mar?: number;
    apr?: number;
    may?: number;
    jun?: number;
    jul?: number;
    aug?: number;
    sep?: number;
    oct?: number;
    nov?: number;
    dec?: number;
  };

  // File attachments (evidence)
  fileAttachments: {
    janFiles?: string[];          // S3 URLs
    febFiles?: string[];
    marFiles?: string[];
    aprFiles?: string[];
    mayFiles?: string[];
    junFiles?: string[];
    julFiles?: string[];
    augFiles?: string[];
    sepFiles?: string[];
    octFiles?: string[];
    novFiles?: string[];
    decFiles?: string[];
  };

  // Flags
  isYearSelected: boolean;        // Whether year was selected (vs inherited)
  isClientCreated: boolean;       // Created by client vs system

  // Verification
  isVerified: boolean;
  verifiedBy?: ObjectId;
  verifiedAt?: Date;

  // Metadata
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: ObjectId;
    updatedBy?: ObjectId;
  };

  // Indexes
  // - { projectId: 1, year: 1, category: 1 }
  // - { scopeId: 1, parameterId: 1 }
  // - { entityId: 1, year: 1 }
  // - { isVerified: 1 }
  // - { 'metadata.createdAt': 1 }
}
```

### Activity Comment

```typescript
interface ActivityComment {
  _id: ObjectId;
  activityDataId: ObjectId;
  category: string;               // Activity category
  comment: string;
  commentedBy: ObjectId;
  commentedAt: Date;
  updatedAt?: Date;

  // Indexes
  // - { activityDataId: 1, commentedAt: -1 }
}
```

### Bulk Import

```typescript
interface BulkImport {
  _id: ObjectId;
  importId: string;               // UUID
  projectId: ObjectId;
  category: string;
  year: number;
  status: 'validating' | 'importing' | 'completed' | 'failed';
  progress: number;               // 0-100

  summary: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    duplicateRows: number;
    processedRows: number;
  };

  errors: {
    row: number;
    column: string;
    value: any;
    message: string;
  }[];

  warnings: {
    row: number;
    message: string;
  }[];

  fileUrl?: string;               // S3 URL of uploaded file
  createdBy: ObjectId;
  createdAt: Date;
  completedAt?: Date;

  // Indexes
  // - { importId: 1 } unique
  // - { projectId: 1, createdAt: -1 }
  // - { status: 1, createdAt: -1 }
}
```

---

## 3. Business Logic

### 3.1 Carbon Scope Initialization

When a project is created, initialize carbon scopes for all hierarchy levels and years:

```typescript
async initializeCarbonScopes(projectId: string, config: {
  years: number[];
  entities: { entityId: string; entityType: string }[];
  modules: string[];
}): Promise<void> {
  const scopes: CarbonScope[] = [];

  // Create scope for each entity-year combination
  for (const entity of config.entities) {
    for (const year of config.years) {
      scopes.push({
        projectId,
        entityId: entity.entityId,
        entityType: entity.entityType,
        scopeType: this.getScopeType(entity.entityType),
        year,
        modules: config.modules, // Default modules
        status: 'active'
      });
    }
  }

  // Bulk insert
  await this.carbonScopeRepository.insertMany(scopes);

  // Publish event
  await this.eventBus.publish({
    type: 'activity.carbon-scopes.initialized.v1',
    data: {
      projectId,
      count: scopes.length,
      years: config.years
    }
  });
}
```

### 3.2 Activity Data Validation

Before saving activity data, validate:

```typescript
async validateActivityData(data: CreateActivityDataDto): Promise<ValidationResult> {
  const errors: ValidationError[] = [];

  // 1. Validate parameter exists and is valid
  const parameter = await this.referenceServiceClient.getParameter(data.parameter);
  if (!parameter) {
    errors.push({ field: 'parameter', message: 'Parameter not found' });
  }

  // 2. Validate carbon scope exists
  const carbonScope = await this.carbonScopeRepository.findOne({
    scopeId: data.scopeId,
    status: 'active'
  });
  if (!carbonScope) {
    errors.push({ field: 'scopeId', message: 'Carbon scope not found or inactive' });
  }

  // 3. Validate module is enabled for this scope
  if (carbonScope && !carbonScope.modules.includes(data.category)) {
    errors.push({
      field: 'category',
      message: `Module ${data.category} is not enabled for this scope`
    });
  }

  // 4. Validate UOM is compatible with parameter
  if (parameter && !parameter.uomList.includes(data.uom)) {
    errors.push({
      field: 'uom',
      message: `UOM ${data.uom} is not valid for parameter ${parameter.name}. Valid units: ${parameter.uomList.join(', ')}`
    });
  }

  // 5. Validate quantity is non-negative
  if (data.quantityConsumed < 0) {
    errors.push({
      field: 'quantityConsumed',
      message: 'Quantity must be non-negative'
    });
  }

  // 6. Validate monthly data consistency
  if (data.monthlyData) {
    const monthlySum = Object.values(data.monthlyData).reduce((sum, val) => sum + (val || 0), 0);
    const tolerance = 0.01; // Allow 1% variance

    if (Math.abs(monthlySum - data.quantityConsumed) > data.quantityConsumed * tolerance) {
      errors.push({
        field: 'monthlyData',
        message: `Monthly data sum (${monthlySum}) does not match total quantity (${data.quantityConsumed})`
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
```

### 3.3 Bulk Import Processing

```typescript
async processBulkImport(importId: string, file: Buffer): Promise<void> {
  const importRecord = await this.bulkImportRepository.findByImportId(importId);

  try {
    // 1. Parse Excel file
    const workbook = XLSX.read(file, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(worksheet);

    importRecord.summary.totalRows = rows.length;

    // 2. Validate each row
    const validRows: any[] = [];
    const invalidRows: any[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const validation = await this.validateImportRow(row, i + 2); // Excel rows start at 2

      if (validation.valid) {
        validRows.push(row);
      } else {
        invalidRows.push({ row: i + 2, errors: validation.errors });
        importRecord.errors.push(...validation.errors.map(e => ({
          row: i + 2,
          column: e.field,
          value: row[e.field],
          message: e.message
        })));
      }
    }

    importRecord.summary.validRows = validRows.length;
    importRecord.summary.invalidRows = invalidRows.length;

    // Update progress
    importRecord.progress = 50;
    await this.bulkImportRepository.save(importRecord);

    // 3. If validation-only mode, stop here
    if (importRecord.status === 'validating') {
      importRecord.status = 'completed';
      await this.bulkImportRepository.save(importRecord);
      return;
    }

    // 4. Import valid rows
    const activityData: ActivityData[] = [];

    for (const row of validRows) {
      const data = await this.createActivityDataFromRow(row, importRecord);
      activityData.push(data);
    }

    // Bulk insert
    await this.activityDataRepository.insertMany(activityData);

    importRecord.summary.processedRows = activityData.length;
    importRecord.status = 'completed';
    importRecord.progress = 100;
    importRecord.completedAt = new Date();

    await this.bulkImportRepository.save(importRecord);

    // Publish event
    await this.eventBus.publish({
      type: 'activity.bulk-import.completed.v1',
      data: {
        importId,
        projectId: importRecord.projectId,
        totalRows: importRecord.summary.totalRows,
        validRows: importRecord.summary.validRows,
        invalidRows: importRecord.summary.invalidRows
      }
    });
  } catch (error) {
    importRecord.status = 'failed';
    importRecord.errors.push({
      row: 0,
      column: 'system',
      value: null,
      message: error.message
    });

    await this.bulkImportRepository.save(importRecord);
    throw error;
  }
}
```

### 3.4 Data Quality Scoring

```typescript
async calculateDataQuality(projectId: string, year: number): Promise<DataQualityScore> {
  const categories = [
    'StationaryCombustion',
    'MobileCombustion',
    'FugitiveEmission',
    'ProcessEmission',
    'Electricity',
    'ChilledWater',
    'HeatingSteaming',
    'WasteWater'
  ];

  const categoryScores: CategoryQualityScore[] = [];

  for (const category of categories) {
    const activityData = await this.activityDataRepository.find({
      projectId,
      year,
      category
    });

    const issues: DataQualityIssue[] = [];
    let score = 100;

    // Check for missing monthly data
    for (const data of activityData) {
      const monthsWithData = Object.values(data.monthlyData || {}).filter(v => v !== null && v !== undefined).length;

      if (monthsWithData === 0) {
        issues.push({
          type: 'missing_data',
          activityDataId: data._id,
          message: 'No monthly data provided'
        });
        score -= 5;
      } else if (monthsWithData < 12) {
        issues.push({
          type: 'incomplete_months',
          activityDataId: data._id,
          message: `Only ${monthsWithData}/12 months have data`
        });
        score -= 2;
      }

      // Check for file attachments
      const filesCount = Object.values(data.fileAttachments || {}).flat().length;
      if (filesCount === 0) {
        issues.push({
          type: 'no_files',
          activityDataId: data._id,
          message: 'No supporting files attached'
        });
        score -= 3;
      }

      // Check verification status
      if (!data.isVerified) {
        issues.push({
          type: 'not_verified',
          activityDataId: data._id,
          message: 'Data not verified'
        });
        score -= 2;
      }
    }

    categoryScores.push({
      category,
      quality: Math.max(0, score),
      recordCount: activityData.length,
      issues
    });
  }

  // Calculate overall score
  const overallQuality = categoryScores.reduce((sum, cat) => sum + cat.quality, 0) / categories.length;

  return {
    projectId,
    year,
    overallQuality: Math.round(overallQuality),
    byCategory: categoryScores,
    recommendations: this.generateRecommendations(categoryScores)
  };
}
```

---

## 4. Integration Points

### 4.1 Reference Service

**Purpose**: Fetch parameters, emission factors, conversions

**Endpoints Used**:
- `GET /v1/parameters/:id` - Validate parameter
- `GET /v1/parameters/by-scope/:scopeId` - Get parameters for scope
- `GET /v1/emission-factors/:parameterId/:yearId` - Get emission factor (for validation)
- `GET /v1/conversions/:fromUnit/:toUnit` - Get UOM conversion factor

**Integration Pattern**: Synchronous HTTP calls with caching (Redis, TTL 1 hour)

### 4.2 Organization Service

**Purpose**: Validate hierarchy entities, projects

**Endpoints Used**:
- `GET /v1/projects/:id` - Validate project exists
- `GET /v1/entities/:id` - Validate entity exists
- `GET /v1/subsidiaries/:id` - Validate subsidiary exists
- `GET /v1/locations/:id` - Validate location exists

**Integration Pattern**: Synchronous HTTP calls with caching (Redis, TTL 5 minutes)

### 4.3 Calculation Service

**Events Published**:
- `activity.data.created.v1` - Triggers calculation
- `activity.data.updated.v1` - Triggers recalculation
- `activity.data.deleted.v1` - Triggers recalculation
- `activity.data.verified.v1` - Optionally triggers recalculation
- `activity.bulk-import.completed.v1` - Triggers bulk calculation

**Integration Pattern**: Asynchronous events via EventBridge

### 4.4 Audit Service

**Events Published** (all activity changes):
- `activity.data.created.v1`
- `activity.data.updated.v1`
- `activity.data.deleted.v1`
- `activity.data.verified.v1`
- `activity.comment.added.v1`
- `activity.bulk-import.completed.v1`

**Integration Pattern**: Asynchronous events via EventBridge

### 4.5 AWS S3

**Purpose**: File storage for evidence attachments

**Operations**:
- Upload files (max 10MB per file)
- Generate pre-signed URLs (7-day expiry)
- Delete files

**Bucket Structure**:
```
clenergize-activity-files-{env}/
  {projectId}/
    {year}/
      {category}/
        {activityDataId}/
          {month}/
            {filename}
```

---

## 5. Non-Functional Requirements

### 5.1 Performance

**Target Metrics**:
- API Response Time: < 200ms p95 (CRUD operations)
- Bulk Import: Process 10K rows in < 30 seconds
- File Upload: Support concurrent uploads (100 files/min)
- Database Queries: < 50ms p95
- Cache Hit Ratio: > 80% (parameter/entity lookups)

**Optimization Strategies**:
- MongoDB indexes on all query fields
- Redis caching for reference data
- Bulk operations use batch inserts
- Async file processing (S3 uploads)
- Pagination on all list endpoints (max 500 records)

### 5.2 Scalability

**Horizontal Scaling**:
- Stateless service design (no in-memory state)
- Supports multiple instances behind load balancer
- Session-less architecture
- Distributed caching (Redis Cluster)

**Data Volume Estimates**:
- Activity data records: 1M+ per year (large enterprises)
- File attachments: 500K+ per year
- Bulk imports: 10K rows per import, 100 imports per day
- MongoDB: Sharding by `projectId` if needed

### 5.3 Availability

**Target**: 99.9% uptime
- Health check endpoint: `GET /health`
- Graceful shutdown (drain connections)
- Circuit breaker for external dependencies
- Retry logic with exponential backoff
- Dead letter queue for failed events

### 5.4 Security

**Authentication**:
- All endpoints require JWT tokens (verified via JWKS)
- Service-to-service auth with API keys

**Authorization**:
- RBAC with scope-based permissions
- Project-level access control
- Operation-level permissions (create, read, edit, delete)

**Data Protection**:
- Input validation with Zod schemas
- SQL/NoSQL injection prevention
- File upload validation (type, size, content)
- S3 bucket encryption at rest
- TLS 1.3 for all connections

**Audit Logging**:
- All write operations logged
- User ID, IP, timestamp tracked
- Change history for activity data

### 5.5 Data Integrity

**Validation Rules**:
- Parameter must exist (validated via Reference Service)
- Carbon scope must be active
- Monthly data sum must match total quantity (±1%)
- UOM must be compatible with parameter

**Consistency**:
- MongoDB transactions for multi-document operations
- Outbox pattern for reliable event publishing
- Idempotency keys for duplicate prevention

---

## 6. Testing Strategy

### 6.1 Unit Tests (Target: 80% coverage)

**Test Suites**:
- Activity Data Validation Logic
- Monthly Data Consistency Checks
- Data Quality Scoring Algorithm
- UOM Conversion Logic
- Bulk Import Parsing

**Example Test**:
```typescript
describe('ActivityDataValidator', () => {
  describe('validateMonthlyData', () => {
    it('should fail if monthly sum exceeds tolerance', async () => {
      const data = {
        quantityConsumed: 100,
        monthlyData: {
          jan: 20,
          feb: 30,
          mar: 60 // Sum: 110, exceeds tolerance
        }
      };

      const result = await validator.validateMonthlyData(data);

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'monthlyData',
          message: expect.stringContaining('does not match')
        })
      );
    });
  });
});
```

### 6.2 Integration Tests

**Test Scenarios**:
- Create activity data with valid parameter (calls Reference Service)
- Bulk import Excel file end-to-end
- File upload to S3
- Event publishing to EventBridge
- Cache invalidation after update

### 6.3 Contract Tests (Pact)

**Consumer Contracts**:
- Activity Service → Reference Service (parameter validation)
- Activity Service → Organization Service (entity validation)

**Provider Contracts**:
- Calculation Service → Activity Service (event schemas)

### 6.4 E2E Tests

**User Flows**:
1. Create project → Initialize carbon scopes → Add activity data → Verify data
2. Bulk import Excel → Validate → Confirm import → View imported data
3. Upload file attachments → Add comments → Verify data quality

---

## 7. Deployment Strategy

### 7.1 Local Development

```bash
# Start dependencies
docker-compose up mongodb redis localstack s3

# Start service
npm run start:dev

# Service available at: http://localhost:3004
```

### 7.2 Staging/Production (AWS ECS)

**Infrastructure**:
- ECS Fargate (2 tasks minimum)
- Application Load Balancer
- Auto-scaling (CPU > 70% or Memory > 80%)
- MongoDB Atlas (M30 cluster minimum)
- ElastiCache Redis (cache.r6g.large)
- S3 bucket (clenergize-activity-files-{env})

**Environment Variables**:
```env
SERVICE_NAME=activity-service
PORT=3004
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
REDIS_URL=redis://...
AWS_REGION=us-east-1
S3_BUCKET=clenergize-activity-files-prod
EVENT_BUS_NAME=clenergize-events
REFERENCE_SERVICE_URL=http://reference-service:3003
ORGANIZATION_SERVICE_URL=http://organization-service:3002
```

### 7.3 Monitoring

**CloudWatch Metrics**:
- Request count per endpoint
- Error rate by error type
- API response time (p50, p95, p99)
- Bulk import success/failure rate
- File upload success rate

**Alerts**:
- Error rate > 5% for 5 minutes
- API response time p95 > 500ms
- MongoDB connection failures
- S3 upload failures > 10/minute

**Logging**:
- Structured JSON logs (Winston)
- Correlation IDs for distributed tracing
- Request/response logging (exclude sensitive data)
- Error stack traces

---

## 8. Migration from OLD System

### 8.1 Data Migration Strategy

**OLD Collections → NEW Collections**:
- `stationary_combustion` → `activity_data` (category: 'StationaryCombustion')
- `mobile_combustion` → `activity_data` (category: 'MobileCombustion')
- `fugitive_emission` → `activity_data` (category: 'FugitiveEmission')
- (Similar for all 8 categories)
- `carbon_scope` → `carbon_scopes` (schema unchanged)
- `category_comment` → `activity_comments`

**Migration Script**:
```typescript
async migrateActivityData(oldCategory: string, newCategory: string) {
  const oldData = await oldDb.collection(oldCategory).find({}).toArray();

  const newData = oldData.map(old => ({
    projectId: old.projectId,
    scopeId: old.scopeId,
    entityId: old.entityId,
    entityType: old.entityType,
    parentEntityId: old.parentEntityId,
    parentEntityType: old.parentEntityType,
    category: newCategory,
    parameterId: old.parameter, // OLD uses parameter name, NEW uses ID
    year: old.year,
    quantityConsumed: old.quantityConsumed,
    uom: old.uom,
    defaultUom: old.defaultUom,
    uomList: old.uomList,
    monthlyData: {
      jan: old.jan,
      feb: old.feb,
      mar: old.mar,
      apr: old.apr,
      may: old.may,
      jun: old.jun,
      jul: old.jul,
      aug: old.aug,
      sep: old.sep,
      oct: old.oct,
      nov: old.nov,
      dec: old.dec
    },
    fileAttachments: {
      janFiles: old.janFiles || [],
      febFiles: old.febFiles || [],
      marFiles: old.marFiles || [],
      aprFiles: old.aprFiles || [],
      mayFiles: old.mayFiles || [],
      junFiles: old.junFiles || [],
      julFiles: old.julFiles || [],
      augFiles: old.augFiles || [],
      sepFiles: old.sepFiles || [],
      octFiles: old.octFiles || [],
      novFiles: old.novFiles || [],
      decFiles: old.decFiles || []
    },
    isYearSelected: old.isYearSelected,
    isClientCreated: old.isClientCreated,
    isVerified: false, // Re-verify after migration
    metadata: {
      createdAt: old.createdAt || new Date(),
      updatedAt: new Date(),
      createdBy: old.createdBy
    }
  }));

  await newDb.collection('activity_data').insertMany(newData);
}
```

### 8.2 Breaking Changes from OLD

1. **Consolidated Categories**: All 8 activity categories now use single `activity_data` collection with `category` field
2. **Parameter Reference**: Changed from parameter name (string) to parameter ID (ObjectId)
3. **File Attachments**: S3 URLs instead of local file paths
4. **Validation**: Stricter validation rules (monthly sum must match total)
5. **Events**: All events now typed with versioning (e.g., `activity.data.created.v1`)

---

## 9. Open Questions

1. **Monthly Data Tolerance**: Is ±1% variance acceptable, or should it be configurable per project?
2. **File Size Limits**: 10MB per file - sufficient for typical evidence (invoices, meter readings)?
3. **Bulk Import Limits**: 10K rows per import - should we support larger files (split into batches)?
4. **Data Retention**: How long should we keep old activity data? Archive after X years?
5. **Verification Workflow**: Should verification require approval from specific roles, or any admin?

---

## 10. Glossary

- **Carbon Scope**: Marker indicating that a specific entity-year combination has emissions data
- **Activity Data**: Quantified information about an emission-generating activity (fuel consumed, electricity purchased, etc.)
- **Parameter**: Specific emission source (e.g., "Natural Gas", "Diesel", "Grid Electricity")
- **UOM**: Unit of Measure (kg, liters, kWh, m³, etc.)
- **Monthly Data**: Breakdown of total quantity by month (Jan-Dec)
- **Evidence**: Supporting files attached to activity data (invoices, meter readings, receipts)
- **Verification**: Approval of activity data by authorized user (project admin)
- **Data Quality Score**: Metric (0-100) indicating completeness and accuracy of activity data
- **Bulk Import**: Importing multiple activity data records from Excel/CSV file

---

**Document Version**: 1.0.0
**Last Updated**: 2025-11-18
**Status**: APPROVED
**Next Review**: Sprint 0.3
