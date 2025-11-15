# Migration Commands

## Hierarchy Migration Commands

### /migrate-hierarchy [old-service] [new-service]
Convert hierarchy cloning to reference pattern (fixes C3).

**Usage**: `/migrate-hierarchy OLD/clenergizeV3-project-management-ms-dev NEW/organization-service`

**Process**:
```
Analyzing: 1,234 projects with cloned hierarchies
Storage Used: 4.2 GB (denormalized)
Unique Hierarchies: 45

Migration Plan:
1. Extract unique hierarchies → reference-service
2. Create hierarchy references
3. Update projects with reference IDs
4. Remove cloned data
5. Verify data integrity

Estimated Outcome:
- Storage: 4.2 GB → 120 MB (97% reduction)
- Query Speed: 145ms → 23ms (84% faster)
- Update Operations: 1 instead of 1,234
```

**Generated Migration Script**:
```typescript
class HierarchyMigration {
  async migrate() {
    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      // Step 1: Extract unique hierarchies
      const hierarchies = await this.extractUniqueHierarchies();

      // Step 2: Create references
      const refMap = new Map();
      for (const hierarchy of hierarchies) {
        const ref = await this.createReference(hierarchy);
        refMap.set(hierarchy.hash, ref.id);
      }

      // Step 3: Update projects
      await this.updateProjectReferences(refMap);

      // Step 4: Clean up
      await this.removeClonedData();
    });
  }
}
```

### /normalize-data [collection] [field]
Convert denormalized data to normalized form.

**Usage**: `/normalize-data projects organizationDetails`

**Analysis**:
```
Field: organizationDetails
Type: Embedded Document
Occurrences: 5,678
Unique Values: 234
Duplication Rate: 96%

Normalization Strategy:
1. Create organizations collection
2. Extract unique organizations
3. Replace with organizationId reference
4. Add population middleware

Benefits:
- Storage: -85%
- Updates: O(1) instead of O(n)
- Consistency: Guaranteed
```

### /migrate-v1-to-v2 [entity]
Migrate V1 duplicate data to V2 format (fixes C5).

**Usage**: `/migrate-v1-to-v2 activities`

**Transformation**:
```javascript
// OLD: Duplicate V1 fields
{
  // V2 fields
  emissionFactor: 2.34,
  quantity: 100,
  unit: 'kg',

  // V1 duplicate fields (to remove)
  v1_emission_factor: 2.34,
  v1_amount: 100,
  v1_unit_type: 'kg',
  v1_calculation_method: 'standard'
}

// NEW: Clean V2 only
{
  emissionFactor: 2.34,
  quantity: 100,
  unit: 'kg',
  metadata: {
    version: 2,
    migrated: '2025-11-15T10:00:00Z'
  }
}
```

## Data Transfer Commands

### /export-old-data [service] [format]
Export data from OLD service for migration.

**Usage**: `/export-old-data clenergizeV3-user-management-ms-dev json`

**Formats**:
- `json`: JSON with relationships
- `csv`: Flat CSV files
- `mongodb`: MongoDB archive
- `parquet`: Columnar format

**Output**:
```
Export Summary:
- Users: 12,345 records
- Organizations: 567 records
- Roles: 15 records
- Permissions: 89 records

Files Created:
- users_2025-11-15.json (145 MB)
- users_relations.json (23 MB)
- migration_manifest.json (2 KB)

Validation:
✅ All required fields present
✅ No corrupt data detected
⚠️ 23 users with missing organizationId
```

### /import-to-new [service] [file]
Import migrated data to NEW service.

**Usage**: `/import-to-new identity-service exports/users_2025-11-15.json`

**Process**:
```
Import Pipeline:
1. Schema Validation ✅
2. Data Transformation
   - Fix JWT fields
   - Add missing defaults
   - Convert dates to ISO
3. Batch Processing (1000 records/batch)
4. Transaction Management
5. Event Publishing
6. Integrity Verification

Progress: [████████░░] 82% (10,123/12,345)
Errors: 0
Warnings: 23
Time Remaining: ~2 minutes
```

### /validate-migration [old] [new]
Validate data consistency after migration.

**Usage**: `/validate-migration OLD/clenergizeV3-project-management-ms-dev NEW/organization-service`

**Validation Report**:
```
Data Validation Report
═══════════════════════════════

Record Counts:
OLD Projects: 1,234 ✅
NEW Projects: 1,234 ✅
Match: 100%

Field Mapping:
- id → _id: ✅ All mapped
- name → projectName: ✅ All mapped
- company_id → organizationId: ✅ All mapped
- hierarchy (cloned) → hierarchyRef: ✅ All converted

Data Integrity:
✅ All foreign keys valid
✅ No orphaned records
✅ Calculated fields match
⚠️ 3 projects with future dates (non-critical)

Business Logic:
✅ Emission calculations match
✅ Rollup aggregations correct
✅ Permission mappings preserved
```

## Schema Migration Commands

### /generate-migration [name]
Generate database migration script.

**Usage**: `/generate-migration add-audit-fields`

**Generated File**: `migrations/20251115_add-audit-fields.ts`
```typescript
export class AddAuditFields20251115 implements Migration {
  version = '20251115_add-audit-fields';

  async up(db: Db): Promise<void> {
    // Add audit fields to all collections
    const collections = await db.collections();

    for (const collection of collections) {
      await db.collection(collection.collectionName).updateMany(
        { createdAt: { $exists: false } },
        {
          $set: {
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1
          }
        }
      );
    }
  }

  async down(db: Db): Promise<void> {
    // Remove audit fields
    const collections = await db.collections();

    for (const collection of collections) {
      await db.collection(collection.collectionName).updateMany(
        {},
        {
          $unset: {
            createdAt: '',
            updatedAt: '',
            version: ''
          }
        }
      );
    }
  }
}
```

### /run-migration [service] [version]
Execute migration on a service database.

**Usage**: `/run-migration organization-service 20251115_add-audit-fields`

**Output**:
```
Migration Runner
Service: organization-service
Database: clenergize_organization

Current Version: 20251110_initial_schema
Target Version: 20251115_add-audit-fields

Migrations to Run:
1. 20251112_add_indexes
2. 20251113_fix_references
3. 20251115_add-audit-fields

Starting Migration...
✅ 20251112_add_indexes (234ms)
✅ 20251113_fix_references (567ms)
✅ 20251115_add-audit-fields (123ms)

Migration Complete!
Documents Modified: 5,678
New Version: 20251115_add-audit-fields
```

### /rollback-migration [service] [version]
Rollback to a previous migration version.

**Usage**: `/rollback-migration organization-service 20251110_initial_schema`

**Confirmation Required**:
```
⚠️ ROLLBACK WARNING
This will rollback 3 migrations:
- 20251115_add-audit-fields
- 20251113_fix_references
- 20251112_add_indexes

Data loss may occur!
Type 'confirm-rollback' to proceed:
```

## Data Transformation Commands

### /transform-dates [service] [format]
Standardize date formats across services.

**Usage**: `/transform-dates calculation-service ISO8601`

**Transformations**:
```javascript
// Various formats found:
"2025-11-15"           → "2025-11-15T00:00:00.000Z"
"15/11/2025"          → "2025-11-15T00:00:00.000Z"
"Nov 15, 2025"        → "2025-11-15T00:00:00.000Z"
1731657600000         → "2025-11-15T10:00:00.000Z"
"2025-11-15 10:00"    → "2025-11-15T10:00:00.000Z"

Fields Updated:
- createdAt: 12,345 documents
- updatedAt: 12,345 documents
- calculationDate: 8,901 documents
- reportingPeriod: 567 documents
```

### /fix-references [service]
Fix broken references between services.

**Usage**: `/fix-references organization-service`

**Analysis**:
```
Scanning References...

Broken References Found:
1. projects.organizationId
   - Invalid: 23 (pointing to deleted orgs)
   - Action: Set to default org or null

2. projects.createdBy
   - Invalid: 45 (pointing to deleted users)
   - Action: Set to system user

3. activities.projectId
   - Invalid: 0 ✅

Auto-fix available: Yes
Manual review needed: 23 organizational assignments
```

### /merge-duplicates [entity] [key]
Merge duplicate records based on key.

**Usage**: `/merge-duplicates emission-factors name`

**Detection**:
```
Duplicate Detection Report:
Key: name (case-insensitive)

Duplicates Found:
1. "Electricity - Grid" (3 variants)
   - ID: ef-001 (created: 2024-01-01)
   - ID: ef-045 (created: 2024-06-15)
   - ID: ef-089 (created: 2024-11-01)

   Merge Strategy:
   - Keep newest (ef-089)
   - Update all references
   - Archive others

2. "Natural Gas" (2 variants)
   - ID: ef-002 (345 references)
   - ID: ef-067 (12 references)

   Merge Strategy:
   - Keep most referenced (ef-002)
   - Migrate 12 references
   - Delete ef-067

Total Duplicates: 15 groups (38 records)
Space Saved: ~234 KB
```

## Backup & Recovery Commands

### /backup-before-migration [service]
Create backup before migration.

**Usage**: `/backup-before-migration organization-service`

**Output**:
```
Creating Backup...
Service: organization-service
Database: clenergize_organization
Collections: 8
Documents: 45,678
Size: 234 MB

Backup Created:
File: backups/organization_20251115_103045.archive
Format: MongoDB Archive
Compressed: Yes (67 MB)
Encryption: AES-256
Location: S3://clenergize-backups/migrations/

Restore Command:
/restore-from-backup organization_20251115_103045.archive
```

### /restore-from-backup [file]
Restore service from backup.

**Usage**: `/restore-from-backup organization_20251115_103045.archive`

**Process**:
```
Restore Process:
1. Verify backup integrity ✅
2. Stop service containers
3. Clear target database
4. Restore from archive
5. Rebuild indexes
6. Verify document counts
7. Restart services

⚠️ WARNING: This will replace all current data!
Confirm by typing the backup filename:
```

### /migration-status
Show overall migration progress.

**Usage**: `/migration-status`

**Dashboard**:
```
Migration Progress Dashboard
═══════════════════════════════════════

Service Migration Status:
✅ identity-service       100% (Phase 3: Complete)
✅ organization-service    100% (Phase 3: Complete)
🔄 reference-service       75% (Phase 2: Data Transfer)
🔄 activity-service        60% (Phase 2: Data Transfer)
⏸️ calculation-service     40% (Phase 1: Schema Design)
📅 reporting-service        0% (Scheduled: Sprint 2)
📅 audit-service           0% (Scheduled: Sprint 3)

Data Migration:
├─ Users: 12,345/12,345 ✅
├─ Organizations: 567/567 ✅
├─ Projects: 1,234/1,234 ✅
├─ Hierarchies: 45/234 🔄
├─ Activities: 456,789/1,234,567 🔄
└─ Calculations: 0/890,123 📅

Issues:
❌ Hierarchy cloning (C3): In Progress
✅ JWT verification (C1): Fixed
✅ Infinite loops (C2): Fixed

Time Remaining: ~14 days
Next Milestone: Complete reference-service (2 days)
```

## Performance Commands

### /optimize-migration [operation]
Optimize slow migration operations.

**Usage**: `/optimize-migration bulk-insert`

**Optimizations Applied**:
```javascript
// Before: Individual inserts (45 min)
for (const doc of documents) {
  await collection.insertOne(doc);
}

// After: Bulk operations (3 min)
const chunks = _.chunk(documents, 1000);
for (const chunk of chunks) {
  await collection.insertMany(chunk, {
    ordered: false,
    writeConcern: { w: 1 }
  });
}

Performance Improvement:
- Time: 45 min → 3 min (93% faster)
- CPU: 78% → 23%
- Memory: 2.3 GB → 890 MB
```

### /parallel-migration [services]
Run parallel migrations for multiple services.

**Usage**: `/parallel-migration "identity,organization,reference"`

**Execution Plan**:
```
Parallel Migration Orchestrator
═══════════════════════════════

Dependency Analysis:
- identity: No dependencies ✅
- organization: Requires identity ⚠️
- reference: No dependencies ✅

Execution Order:
Wave 1: [identity, reference] (parallel)
Wave 2: [organization] (after identity)

Resource Allocation:
- CPU Cores: 8 available, 3 allocated
- Memory: 16 GB available, 6 GB allocated
- Workers: 3 processes

Starting Wave 1...
[identity    ] ████████░░ 80%
[reference   ] ██████░░░░ 60%

Wave 1 Complete: 12 minutes
Starting Wave 2...
```