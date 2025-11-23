# Data Migration Framework - Clenergize V3

> **Version**: 1.0.0
> **Status**: APPROVED
> **Critical**: Required for Phase 1 completion
> **Owner**: Migration Agent

---

## Executive Summary

This framework provides a comprehensive, zero-downtime data migration strategy from OLD to NEW architecture with complete validation, rollback capabilities, and progress tracking.

---

## Migration Architecture

### Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    OLD System (Source)                      │
│  - MongoDB (denormalized, cloned hierarchies)              │
│  - 8 microservices with mixed concerns                     │
│  - JWT without proper verification                         │
└─────────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Migration Pipeline (ETL + CDC)                 │
│  - Apache NiFi for orchestration                           │
│  - Debezium for Change Data Capture                        │
│  - Validation & Transformation Layer                       │
│  - Dual-write pattern for zero downtime                    │
└─────────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    NEW System (Target)                      │
│  - MongoDB (normalized, reference-based)                   │
│  - 7+ clean microservices with DDD                        │
│  - Proper JWT/JWKS verification                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Migration Phases

### Phase 0: Preparation (Week 1)
```yaml
Tasks:
  - Backup all OLD databases
  - Deploy migration infrastructure
  - Create mapping documents
  - Set up monitoring dashboards
  - Establish rollback procedures

Deliverables:
  - Migration readiness checklist ✓
  - Backup verification ✓
  - Infrastructure operational ✓
```

### Phase 1: Reference Data (Week 2)
```yaml
Services:
  - Master Data → Reference Service

Data:
  - Emission factors (10,000+ records)
  - Conversion parameters
  - Scope definitions
  - Energy values

Migration Strategy:
  - Batch migration (one-time)
  - Full validation post-migration
  - No dual-write needed (read-only data)
```

### Phase 2: Identity Data (Week 3)
```yaml
Services:
  - User Management → Identity Service

Data:
  - User profiles
  - Cognito sync
  - Permissions
  - Sessions

Migration Strategy:
  - Dual-write pattern
  - Gradual user migration on login
  - Legacy auth fallback
```

### Phase 3: Organization Data (Week 4-5)
```yaml
Services:
  - Project Management → Organization Service
  - Company Details → Organization Service

Data:
  - Companies
  - Projects
  - Hierarchies (CRITICAL: denormalized → references)

Special Handling:
  - Hierarchy transformation algorithm
  - Reference ID generation
  - Snapshot creation for historical data
```

### Phase 4: Activity Data (Week 6-7)
```yaml
Services:
  - Carbon Footprint → Activity Service

Data:
  - Activity records (all categories)
  - File attachments
  - Monthly breakdowns

Migration Strategy:
  - Incremental migration by year
  - Parallel validation
  - File migration to S3
```

### Phase 5: Calculation Results (Week 8)
```yaml
Services:
  - Carbon Footprint → Calculation Service

Data:
  - Historical calculations
  - Aggregations
  - Result cache

Migration Strategy:
  - Recalculate on-demand
  - Cache warming
  - Result validation
```

---

## Data Transformation Rules

### Critical Transformation: Hierarchy Cloning → References

```typescript
// OLD Structure (Denormalized)
interface OldProject {
  _id: ObjectId;
  companyName: string; // Duplicated
  clonedHierarchy: {
    entityId: ObjectId;
    entityName: string;
    subsidiaries: [{
      subsidiaryId: ObjectId;
      subsidiaryName: string;
      locations: [{
        locationId: ObjectId;
        locationName: string;
        // ... full location data cloned
      }]
    }]
  }[]
}

// NEW Structure (References)
interface NewProject {
  id: string;
  companyRef: string; // Reference only
  hierarchyRef: string; // Reference to hierarchy version
  hierarchySnapshot: string; // Point-in-time snapshot ID
}

// Transformation Algorithm
async function transformHierarchy(oldProject: OldProject): Promise<NewProject> {
  // 1. Extract unique hierarchy structure
  const hierarchyHash = generateHash(oldProject.clonedHierarchy);

  // 2. Check if hierarchy already exists
  let hierarchyRef = await findExistingHierarchy(hierarchyHash);

  if (!hierarchyRef) {
    // 3. Create new hierarchy reference
    hierarchyRef = await createHierarchyReference({
      entities: extractEntities(oldProject.clonedHierarchy),
      version: 1,
      effectiveDate: new Date()
    });
  }

  // 4. Create snapshot for reporting period
  const snapshotId = await createHierarchySnapshot(hierarchyRef, oldProject.year);

  return {
    id: oldProject._id.toString(),
    companyRef: await findCompanyId(oldProject.companyName),
    hierarchyRef,
    hierarchySnapshot: snapshotId
  };
}
```

### Permission Model Transformation

```typescript
// OLD: Nested dynamic objects
interface OldPermission {
  [companyId: string]: {
    [entityId: string]: {
      [subsidiaryId: string]: {
        [locationId: string]: string[]
      }
    }
  }
}

// NEW: Normalized documents
interface NewPermission {
  id: string;
  userId: string;
  resourceType: 'company' | 'entity' | 'subsidiary' | 'location';
  resourceId: string;
  permissions: string[];
  grantedBy: string;
  grantedAt: Date;
}
```

---

## Validation Framework

### Data Quality Rules

```yaml
Emission Factors:
  - Value ranges: 0.0001 - 10000 kgCO2e/unit
  - Required fields: factor, unit, source, year
  - Geographic validity: country/region exists

User Data:
  - Email format validation
  - Cognito ID exists
  - No orphaned permissions

Hierarchy:
  - No circular references
  - All entities have valid parents
  - Location coordinates valid

Activity Data:
  - Quantities > 0
  - Dates within reporting period
  - Units match factor requirements
```

### Validation Process

```typescript
interface ValidationResult {
  recordId: string;
  status: 'valid' | 'invalid' | 'warning';
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

class DataValidator {
  async validateBatch(records: any[], type: string): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    for (const record of records) {
      const result = await this.validateRecord(record, type);
      results.push(result);

      // Log validation metrics
      await this.metrics.recordValidation(type, result.status);
    }

    return results;
  }

  async validateRecord(record: any, type: string): Promise<ValidationResult> {
    const validators = this.getValidators(type);
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    for (const validator of validators) {
      const result = await validator.validate(record);
      errors.push(...result.errors);
      warnings.push(...result.warnings);
    }

    return {
      recordId: record.id || record._id,
      status: errors.length > 0 ? 'invalid' : warnings.length > 0 ? 'warning' : 'valid',
      errors,
      warnings
    };
  }
}
```

---

## Dual-Write Pattern

### Implementation

```typescript
class DualWriteService {
  private oldDb: MongoDB;
  private newDb: MongoDB;
  private migrationMode: 'old-primary' | 'new-primary' | 'new-only';

  async write(collection: string, data: any): Promise<void> {
    switch (this.migrationMode) {
      case 'old-primary':
        // Write to OLD first (primary)
        await this.oldDb.collection(collection).insert(data);
        // Async write to NEW (eventual consistency)
        this.asyncWriteToNew(collection, data);
        break;

      case 'new-primary':
        // Write to NEW first (primary)
        await this.newDb.collection(collection).insert(data);
        // Async write to OLD (backward compatibility)
        this.asyncWriteToOld(collection, data);
        break;

      case 'new-only':
        // Migration complete, write only to NEW
        await this.newDb.collection(collection).insert(data);
        break;
    }
  }

  private async asyncWriteToNew(collection: string, data: any): Promise<void> {
    try {
      const transformed = await this.transformer.transform(data, 'old-to-new');
      await this.newDb.collection(collection).insert(transformed);
    } catch (error) {
      await this.errorHandler.handleDualWriteError(error, 'new', data);
    }
  }
}
```

---

## Reconciliation Process

### Daily Reconciliation Job

```typescript
class ReconciliationJob {
  async run(): Promise<ReconciliationReport> {
    const report: ReconciliationReport = {
      timestamp: new Date(),
      discrepancies: [],
      metrics: {}
    };

    // 1. Count reconciliation
    const oldCount = await this.oldDb.count();
    const newCount = await this.newDb.count();

    if (oldCount !== newCount) {
      report.discrepancies.push({
        type: 'count_mismatch',
        old: oldCount,
        new: newCount,
        difference: Math.abs(oldCount - newCount)
      });
    }

    // 2. Sample data comparison
    const samples = await this.selectRandomSamples(1000);
    for (const sample of samples) {
      const oldRecord = await this.oldDb.findById(sample.id);
      const newRecord = await this.newDb.findById(sample.id);

      const differences = await this.compareRecords(oldRecord, newRecord);
      if (differences.length > 0) {
        report.discrepancies.push({
          type: 'data_mismatch',
          recordId: sample.id,
          differences
        });
      }
    }

    // 3. Checksum validation
    const oldChecksum = await this.calculateChecksum(this.oldDb);
    const newChecksum = await this.calculateChecksum(this.newDb);

    if (oldChecksum !== newChecksum) {
      report.discrepancies.push({
        type: 'checksum_mismatch',
        old: oldChecksum,
        new: newChecksum
      });
    }

    return report;
  }
}
```

---

## Rollback Procedures

### Automatic Rollback Triggers

```yaml
Triggers:
  - Data loss detected (>0.1% records)
  - Validation failure rate >5%
  - Performance degradation >50%
  - Critical error in transformation
  - Manual trigger by operator
```

### Rollback Process

```typescript
class RollbackManager {
  async executeRollback(reason: string): Promise<void> {
    console.log(`🔴 ROLLBACK INITIATED: ${reason}`);

    // 1. Stop all write operations
    await this.pauseWriteOperations();

    // 2. Switch traffic back to OLD
    await this.loadBalancer.switchToOld();

    // 3. Restore from backup if needed
    if (this.requiresRestore(reason)) {
      await this.restoreFromBackup(this.lastGoodBackup);
    }

    // 4. Clear NEW database
    await this.clearNewDatabase();

    // 5. Reset migration state
    await this.resetMigrationState();

    // 6. Notify stakeholders
    await this.notifyRollback(reason);

    console.log('✅ Rollback completed successfully');
  }
}
```

---

## Migration Monitoring Dashboard

### Key Metrics

```yaml
Real-time Metrics:
  - Records migrated: 145,234 / 500,000 (29%)
  - Migration rate: 1,200 records/minute
  - Error rate: 0.02%
  - Validation success: 99.98%
  - ETA: 5 hours 15 minutes

Service Status:
  - Identity: ✅ Complete
  - Organization: 🟡 In Progress (67%)
  - Reference: ✅ Complete
  - Activity: ⏳ Pending
  - Calculation: ⏳ Pending

Data Quality:
  - Valid records: 145,180 (99.96%)
  - Warnings: 45 (0.03%)
  - Errors: 9 (0.01%)
  - Pending review: 54
```

### Grafana Dashboard Configuration

```json
{
  "dashboard": {
    "title": "Clenergize Data Migration",
    "panels": [
      {
        "title": "Migration Progress",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(migration_records_total) by (service)",
            "legendFormat": "{{service}}"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "rate(migration_errors_total[5m])"
          }
        ]
      },
      {
        "title": "Data Validation",
        "type": "pie",
        "targets": [
          {
            "expr": "migration_validation_status"
          }
        ]
      }
    ]
  }
}
```

---

## Migration Commands

### CLI Tools

```bash
# Start migration
npm run migrate:start -- --phase=1 --service=identity

# Check status
npm run migrate:status

# Validate data
npm run migrate:validate -- --service=organization --sample=1000

# Reconcile
npm run migrate:reconcile -- --full

# Rollback
npm run migrate:rollback -- --reason="Validation failure"

# Export report
npm run migrate:report -- --format=pdf --output=./reports/
```

---

## Success Criteria

```yaml
Completion Criteria:
  ✅ 100% of data migrated
  ✅ Zero data loss
  ✅ All validations passing
  ✅ Reconciliation report clean
  ✅ Performance benchmarks met
  ✅ Rollback tested successfully
  ✅ Sign-off from stakeholders
```

---

## Risk Mitigation

```yaml
Risks and Mitigations:
  Data Loss:
    - Multiple backups
    - Incremental migration
    - Validation at each step

  Downtime:
    - Dual-write pattern
    - Blue-green deployment
    - Feature flags

  Performance:
    - Batch processing
    - Off-peak migration
    - Resource scaling

  Compatibility:
    - API versioning
    - Backward compatibility layer
    - Gradual deprecation
```

---

**Document Status**: COMPLETE
**Next Review**: Before Phase 1 migration start
**Owner**: Migration Agent