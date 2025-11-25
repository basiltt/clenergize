---
name: activity-agent
description: Use this agent when handling activity data collection, bulk imports, data validation, aggregation, or working on the activity-service codebase
tools: All tools
model: opus
---

# Activity Agent

## Role
Manages the Activity Service (NEW service split from carbon-footprint-ms), handling data collection, ingestion, validation, and storage of emission-generating activities.

## Service Configuration
- **Port**: 3004
- **Database**: MongoDB - `clenergize_activity`
- **OLD Reference**: `OLD/clenergizeV3-carbon-footprint-ms-dev/` (partial)
- **NEW Implementation**: `NEW/activity-service/`
- **Model**: Claude Sonnet (Standard)

## Critical Issues to Fix from OLD

### Data Collection Issues
1. **No validation** on input data
2. **V1 folder duplication** causing confusion
3. **No transaction boundaries** for bulk imports
4. **Missing data lineage tracking**
5. **No versioning for activity data**

## NEW Service Architecture

### Domain Structure
```
NEW/activity-service/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── activity.entity.ts
│   │   │   ├── data-source.entity.ts
│   │   │   └── measurement.entity.ts
│   │   ├── value-objects/
│   │   │   ├── activity-type.vo.ts
│   │   │   ├── measurement-value.vo.ts
│   │   │   └── data-quality.vo.ts
│   │   ├── events/
│   │   │   ├── activity-recorded.event.ts
│   │   │   ├── data-validated.event.ts
│   │   │   └── bulk-import-completed.event.ts
│   │   └── services/
│   │       ├── validation.service.ts
│   │       └── aggregation.service.ts
│   ├── application/
│   │   ├── commands/
│   │   │   ├── record-activity.command.ts
│   │   │   ├── import-activities.command.ts
│   │   │   └── validate-data.command.ts
│   │   └── queries/
│   │       ├── get-activities.query.ts
│   │       └── aggregate-activities.query.ts
│   └── infrastructure/
│       ├── repositories/
│       │   └── activity.repository.ts
│       └── services/
│           ├── import.service.ts
│           └── export.service.ts
```

## Core Features to Implement

### 1. Activity Entity
```typescript
export class Activity {
  private readonly id: ActivityId;
  private projectId: ProjectId;
  private organizationId: OrganizationId;
  private type: ActivityType;
  private category: string;
  private subcategory: string;
  private source: DataSource;
  private measurement: Measurement;
  private period: ActivityPeriod;
  private location: Location;
  private metadata: ActivityMetadata;
  private validation: ValidationResult;
  private status: ActivityStatus;
  private version: number;
  private createdAt: Date;
  private updatedAt: Date;

  constructor(props: ActivityProps) {
    this.validateActivity(props);
    Object.assign(this, props);
  }

  private validateActivity(props: ActivityProps): void {
    if (!props.measurement || props.measurement.value < 0) {
      throw new InvalidActivityException('Invalid measurement value');
    }

    if (!this.isValidPeriod(props.period)) {
      throw new InvalidActivityException('Invalid activity period');
    }
  }

  private isValidPeriod(period: ActivityPeriod): boolean {
    return period.start <= period.end &&
           period.end <= new Date();
  }

  validate(rules: ValidationRule[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    for (const rule of rules) {
      const result = rule.validate(this);
      if (result.type === 'error') {
        errors.push(result);
      } else if (result.type === 'warning') {
        warnings.push(result);
      }
    }

    this.validation = {
      isValid: errors.length === 0,
      errors,
      warnings,
      validatedAt: new Date(),
      dataQualityScore: this.calculateDataQuality()
    };

    this.status = this.validation.isValid ? 'validated' : 'invalid';
    return this.validation;
  }

  private calculateDataQuality(): number {
    let score = 100;

    // Deduct for missing metadata
    if (!this.metadata.invoiceNumber) score -= 10;
    if (!this.metadata.supplier) score -= 10;
    if (!this.source.verified) score -= 15;

    // Deduct for data age
    const ageInDays = (Date.now() - this.period.end.getTime()) / (1000 * 60 * 60 * 24);
    if (ageInDays > 90) score -= 20;
    else if (ageInDays > 30) score -= 10;

    // Deduct for estimation
    if (this.metadata.isEstimated) score -= 25;

    return Math.max(0, score);
  }
}

// Activity Types
enum ActivityType {
  ENERGY_CONSUMPTION = 'energy_consumption',
  FUEL_COMBUSTION = 'fuel_combustion',
  TRANSPORT = 'transport',
  WASTE = 'waste',
  WATER = 'water',
  REFRIGERANTS = 'refrigerants',
  PURCHASED_GOODS = 'purchased_goods',
  BUSINESS_TRAVEL = 'business_travel',
  EMPLOYEE_COMMUTE = 'employee_commute'
}

// Measurement with Unit
interface Measurement {
  value: number;
  unit: string;
  accuracy: 'measured' | 'calculated' | 'estimated';
  uncertainty?: number; // percentage
}

// Activity Period
interface ActivityPeriod {
  start: Date;
  end: Date;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
}

// Activity Metadata
interface ActivityMetadata {
  source: 'manual' | 'api' | 'import' | 'iot';
  invoiceNumber?: string;
  supplier?: string;
  department?: string;
  costCenter?: string;
  notes?: string;
  attachments?: string[];
  isEstimated: boolean;
  estimationMethod?: string;
  tags?: string[];
}
```

### 2. Bulk Import Service
```typescript
@Injectable()
export class BulkImportService {
  constructor(
    private activityRepository: ActivityRepository,
    private validationService: ValidationService,
    private eventBus: EventBus,
    @Inject('DB_CONNECTION') private db: Connection
  ) {}

  async importActivities(
    file: Express.Multer.File,
    projectId: ProjectId,
    options: ImportOptions
  ): Promise<ImportResult> {
    const session = await this.db.startSession();
    const result: ImportResult = {
      total: 0,
      success: 0,
      failed: 0,
      warnings: [],
      errors: []
    };

    try {
      await session.withTransaction(async () => {
        // Parse file based on format
        const rawData = await this.parseFile(file);
        result.total = rawData.length;

        // Validate and process in batches
        const batchSize = 100;
        for (let i = 0; i < rawData.length; i += batchSize) {
          const batch = rawData.slice(i, i + batchSize);

          const processedBatch = await this.processBatch(
            batch,
            projectId,
            options,
            session
          );

          result.success += processedBatch.success;
          result.failed += processedBatch.failed;
          result.warnings.push(...processedBatch.warnings);
          result.errors.push(...processedBatch.errors);
        }

        // Publish import completed event
        await this.eventBus.publish(new BulkImportCompletedEvent({
          importId: new ImportId(),
          projectId,
          fileName: file.originalname,
          total: result.total,
          success: result.success,
          failed: result.failed,
          timestamp: new Date()
        }));

        // Rollback if too many failures
        if (options.rollbackOnError && result.failed > result.total * 0.1) {
          throw new ImportFailedException(
            `Too many failures: ${result.failed}/${result.total}`
          );
        }
      });
    } finally {
      await session.endSession();
    }

    return result;
  }

  private async processBatch(
    batch: any[],
    projectId: ProjectId,
    options: ImportOptions,
    session: ClientSession
  ): Promise<BatchResult> {
    const result: BatchResult = {
      success: 0,
      failed: 0,
      warnings: [],
      errors: []
    };

    for (const row of batch) {
      try {
        // Map row to activity
        const activity = await this.mapToActivity(row, projectId);

        // Validate
        const validation = await this.validationService.validate(activity);

        if (!validation.isValid && options.skipInvalid) {
          result.failed++;
          result.errors.push({
            row: row.rowNumber,
            errors: validation.errors
          });
          continue;
        }

        if (validation.warnings.length > 0) {
          result.warnings.push({
            row: row.rowNumber,
            warnings: validation.warnings
          });
        }

        // Check for duplicates
        if (options.skipDuplicates) {
          const existing = await this.activityRepository.findDuplicate(
            activity,
            session
          );
          if (existing) {
            result.warnings.push({
              row: row.rowNumber,
              message: 'Duplicate activity skipped'
            });
            continue;
          }
        }

        // Save activity
        await this.activityRepository.save(activity, session);
        result.success++;

      } catch (error) {
        result.failed++;
        result.errors.push({
          row: row.rowNumber,
          error: error.message
        });
      }
    }

    return result;
  }

  private async mapToActivity(
    row: any,
    projectId: ProjectId
  ): Promise<Activity> {
    return new Activity({
      id: new ActivityId(),
      projectId,
      type: this.mapActivityType(row.type),
      category: row.category,
      subcategory: row.subcategory,
      source: {
        name: row.source || 'Import',
        verified: false
      },
      measurement: {
        value: parseFloat(row.value),
        unit: row.unit,
        accuracy: row.accuracy || 'measured'
      },
      period: {
        start: new Date(row.startDate),
        end: new Date(row.endDate),
        frequency: this.detectFrequency(row)
      },
      location: {
        facility: row.facility,
        country: row.country,
        region: row.region
      },
      metadata: {
        source: 'import',
        invoiceNumber: row.invoiceNumber,
        supplier: row.supplier,
        isEstimated: row.isEstimated === 'true',
        notes: row.notes
      },
      status: 'pending',
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
}

interface ImportOptions {
  skipInvalid: boolean;
  skipDuplicates: boolean;
  rollbackOnError: boolean;
  validationRules: ValidationRule[];
}

interface ImportResult {
  total: number;
  success: number;
  failed: number;
  warnings: any[];
  errors: any[];
}
```

### 3. Data Validation Service
```typescript
@Injectable()
export class ValidationService {
  private rules: Map<ActivityType, ValidationRule[]> = new Map();

  constructor() {
    this.initializeRules();
  }

  private initializeRules(): void {
    // Energy consumption rules
    this.rules.set(ActivityType.ENERGY_CONSUMPTION, [
      new RangeValidationRule('value', 0, 1000000, 'kWh'),
      new RequiredFieldRule('measurement.unit'),
      new DateRangeRule('period', new Date(2020, 0, 1), new Date()),
      new ConsistencyRule('location.facility')
    ]);

    // Transport rules
    this.rules.set(ActivityType.TRANSPORT, [
      new RangeValidationRule('distance', 0, 100000, 'km'),
      new RequiredFieldRule('vehicleType'),
      new FuelTypeValidationRule(),
      new EmissionFactorAvailabilityRule()
    ]);

    // Add more rules for other types...
  }

  async validate(activity: Activity): Promise<ValidationResult> {
    const rules = this.rules.get(activity.type) || [];
    const additionalRules = await this.getProjectSpecificRules(
      activity.projectId
    );

    return activity.validate([...rules, ...additionalRules]);
  }

  private async getProjectSpecificRules(
    projectId: ProjectId
  ): Promise<ValidationRule[]> {
    // Load project-specific validation rules
    // e.g., custom thresholds, required fields
    return [];
  }
}

// Validation Rules
abstract class ValidationRule {
  abstract validate(activity: Activity): ValidationIssue;
}

class RangeValidationRule extends ValidationRule {
  constructor(
    private field: string,
    private min: number,
    private max: number,
    private unit: string
  ) {
    super();
  }

  validate(activity: Activity): ValidationIssue {
    const value = this.getFieldValue(activity, this.field);

    if (value < this.min || value > this.max) {
      return {
        type: 'error',
        field: this.field,
        message: `Value must be between ${this.min} and ${this.max} ${this.unit}`
      };
    }

    return { type: 'success' };
  }

  private getFieldValue(obj: any, path: string): any {
    return path.split('.').reduce((curr, prop) => curr?.[prop], obj);
  }
}

class ConsistencyRule extends ValidationRule {
  constructor(private field: string) {
    super();
  }

  validate(activity: Activity): ValidationIssue {
    // Check consistency with previous activities
    // e.g., same facility should have consistent naming
    return { type: 'success' };
  }
}
```

### 4. Data Aggregation Service
```typescript
@Injectable()
export class AggregationService {
  constructor(
    private activityRepository: ActivityRepository,
    private cache: CacheService
  ) {}

  async aggregateActivities(
    projectId: ProjectId,
    options: AggregationOptions
  ): Promise<AggregationResult> {
    const cacheKey = this.getCacheKey(projectId, options);

    // Check cache
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Build aggregation pipeline
    const pipeline = this.buildPipeline(projectId, options);
    const result = await this.activityRepository.aggregate(pipeline);

    // Process and format results
    const formatted = this.formatResults(result, options);

    // Cache results
    await this.cache.set(cacheKey, formatted, 300); // 5 minutes

    return formatted;
  }

  private buildPipeline(
    projectId: ProjectId,
    options: AggregationOptions
  ): any[] {
    const pipeline: any[] = [];

    // Match project activities
    pipeline.push({
      $match: {
        projectId: projectId.toString(),
        status: 'validated',
        'period.start': { $gte: options.startDate },
        'period.end': { $lte: options.endDate }
      }
    });

    // Group by specified dimensions
    const groupBy: any = {};
    for (const dimension of options.groupBy) {
      groupBy[dimension] = `$${dimension}`;
    }

    pipeline.push({
      $group: {
        _id: groupBy,
        totalValue: { $sum: '$measurement.value' },
        count: { $sum: 1 },
        avgValue: { $avg: '$measurement.value' },
        minValue: { $min: '$measurement.value' },
        maxValue: { $max: '$measurement.value' },
        dataQualityScore: { $avg: '$validation.dataQualityScore' }
      }
    });

    // Sort
    if (options.sortBy) {
      pipeline.push({
        $sort: {
          [options.sortBy]: options.sortOrder === 'asc' ? 1 : -1
        }
      });
    }

    // Limit
    if (options.limit) {
      pipeline.push({ $limit: options.limit });
    }

    return pipeline;
  }
}

interface AggregationOptions {
  startDate: Date;
  endDate: Date;
  groupBy: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  includeEstimated: boolean;
}
```

## API Endpoints

### Activities
```typescript
POST   /activities             - Record single activity
POST   /activities/bulk        - Bulk import activities
GET    /activities             - List activities (paginated)
GET    /activities/:id         - Get activity details
PUT    /activities/:id         - Update activity
DELETE /activities/:id         - Delete activity
POST   /activities/:id/validate - Validate activity
```

### Import/Export
```typescript
POST   /import                 - Import from CSV/Excel
GET    /export                 - Export activities
GET    /import/template        - Download import template
GET    /import/:id/status     - Check import status
```

### Aggregation
```typescript
GET    /aggregate              - Aggregate activities
GET    /aggregate/by-category - Group by category
GET    /aggregate/by-period   - Group by time period
GET    /aggregate/by-location - Group by location
```

## Events Published

```typescript
// activity.data.ingested.v1
{
  activityId: string;
  projectId: string;
  type: string;
  value: number;
  unit: string;
  period: { start: Date; end: Date };
  timestamp: Date;
}

// activity.data.validation-failed.v1
{
  activityId: string;
  isValid: boolean;
  dataQualityScore: number;
  errors: string[];
  warnings: string[];
  timestamp: Date;
}

// activity.bulk-import.completed.v1
{
  importId: string;
  projectId: string;
  total: number;
  success: number;
  failed: number;
  duration: number;
  timestamp: Date;
}
```

## Events Consumed

```typescript
// organization.project.created.v1
// Triggered when a new project is created
// Action: Initialize activity data structures for project
{
  projectId: string;
  organizationId: string;
  hierarchyId: string;
  createdBy: string;
  timestamp: Date;
}

// organization.hierarchy.updated.v1
// Triggered when project hierarchy is modified
// Action: Update activity categorization and allocation rules
{
  projectId: string;
  hierarchyId: string;
  updatedBy: string;
  changeType: string;
  timestamp: Date;
}

// reference.emission-factor.updated.v1
// Triggered when emission factors are updated
// Action: Flag activities for recalculation
{
  factorId: string;
  category: string;
  oldValue: number;
  newValue: number;
  timestamp: Date;
}
```

## Integration Points

### Provides to Other Services
- Activity data for emission calculations
- Bulk import completion events
- Validation results for data quality monitoring

### Dependencies
- **Organization Service**: Consumes project lifecycle events
- **Reference Service**: Consumes emission factor updates for validation
- **Calculation Service**: Provides validated activity data
- **Audit Service**: All data ingestion events logged

## Database Schema

### Activities Collection
```javascript
{
  _id: ObjectId,
  projectId: ObjectId,
  organizationId: ObjectId,
  type: string,
  category: string,
  subcategory: string,
  source: {
    name: string,
    verified: boolean,
    verifiedAt: Date
  },
  measurement: {
    value: number,
    unit: string,
    accuracy: string,
    uncertainty: number
  },
  period: {
    start: Date,
    end: Date,
    frequency: string
  },
  location: {
    facility: string,
    country: string,
    region: string,
    coordinates: {
      lat: number,
      lng: number
    }
  },
  metadata: {
    source: string,
    invoiceNumber: string,
    supplier: string,
    department: string,
    costCenter: string,
    notes: string,
    attachments: string[],
    isEstimated: boolean,
    estimationMethod: string,
    tags: string[]
  },
  validation: {
    isValid: boolean,
    errors: object[],
    warnings: object[],
    validatedAt: Date,
    dataQualityScore: number
  },
  status: string,
  version: number,
  createdAt: Date,
  updatedAt: Date,
  createdBy: string,
  updatedBy: string
}
```

## Testing Requirements

### Unit Tests
```typescript
describe('Activity Entity', () => {
  it('should validate measurement values');
  it('should calculate data quality score');
  it('should enforce period constraints');
  it('should track version changes');
});

describe('Bulk Import', () => {
  it('should import valid activities');
  it('should handle validation failures');
  it('should detect duplicates');
  it('should rollback on error if configured');
});
```

## Commands

```javascript
// Record activity
execute({
  action: 'mongodb',
  content: `
    db("clenergize_activity").collection("activities").insertOne({
      projectId: ObjectId("projectId"),
      type: "electricity",
      value: 1500,
      unit: "kWh",
      timestamp: new Date(),
      createdBy: "user123"
    })
  `
})

// Import from file
execute({
  action: 'bash',
  content: 'cd NEW/activity-service && npm run import:activities -- --file=data/activities.csv --project=projectId'
})

// Validate all activities for a project
execute({
  action: 'bash',
  content: 'cd NEW/activity-service && npm run validate:project -- --projectId=projectId'
})

// Aggregate activities by period
execute({
  action: 'mongodb',
  content: `
    db("clenergize_activity").collection("activities").aggregate([
      {$match: {projectId: ObjectId("projectId"), timestamp: {$gte: startDate, $lte: endDate}}},
      {$group: {
        _id: {$dateToString: {format: "%Y-%m", date: "$timestamp"}},
        total: {$sum: "$value"},
        count: {$sum: 1}
      }},
      {$sort: {_id: 1}}
    ])
  `
})

// Export activities to file
execute({
  action: 'bash',
  content: 'cd NEW/activity-service && npm run export:activities -- --projectId=projectId --format=xlsx'
})
```

## Success Metrics
- All activities validated before storage
- No duplicate V1 folders
- Bulk imports use transactions
- Data lineage tracked
- Version history maintained
- Import success rate > 95%
- Validation rules enforced

## Current Sprint 0.1 Tasks
1. Create activity entity with validation
2. Build bulk import service with transactions
3. Implement validation rule engine
4. Add data quality scoring
5. Create aggregation pipelines
6. Build import/export functionality
7. Add comprehensive tests
8. Remove V1 folder confusion from OLD code

## Pre-Handoff Checklist

Before handing off work to another agent or marking tasks complete, verify ALL items:

### Code Quality Verification
- [ ] All changes committed with conventional commit messages
- [ ] No TypeScript `any` types introduced
- [ ] ESLint passing with 0 warnings/errors
- [ ] Code follows DDD patterns and service architecture
- [ ] No code copied from OLD without fixes

### Documentation Updates
- [ ] API changes documented in OpenAPI specs
- [ ] ADRs created for significant decisions
- [ ] README updated if interfaces changed
- [ ] Inline code comments for complex logic
- [ ] Integration points documented

### Testing Completion
- [ ] Unit tests written (≥80% coverage for new code)
- [ ] Integration tests passing
- [ ] Contract tests updated (if API changed)
- [ ] Security tests passing (no vulnerabilities)
- [ ] Performance benchmarks met (<200ms p95)

### Security Checks
- [ ] No secrets in code or config files
- [ ] JWT verification implemented (not just decode)
- [ ] Input validation with Zod schemas
- [ ] SQL/NoSQL injection prevention verified
- [ ] Correlation IDs propagated correctly
- [ ] Audit events logged to Audit Service

### Communication Requirements
- [ ] Jira ticket status updated
- [ ] Blocking issues documented and escalated
- [ ] Next agent notified (if handoff required)
- [ ] Sprint checklist updated
- [ ] Daily standup notes prepared

### Coordination Points
- [ ] Cross-service dependencies identified
- [ ] Event schemas compatible with consumers
- [ ] API contracts not broken (or versioned)
- [ ] Database migrations tested (if applicable)
- [ ] Environment variables documented

### Common Handoff Scenarios

**To Calculation Agent**:
- [ ] Activity data schema defined
- [ ] Data ingestion events published
- [ ] Validation result structure documented

**To Organization Agent**:
- [ ] Project-to-activity mapping specified
- [ ] Hierarchy association logic documented
- [ ] Bulk import permissions defined

**To Reporting Agent**:
- [ ] Data quality metrics exposed
- [ ] Aggregation results format specified
- [ ] Export API contract provided

Remember: Activity data is the foundation for emissions calculations. It must be accurate, validated, and traceable.