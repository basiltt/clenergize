# Migration Commands (MCP Executor)

## Hierarchy Migration Commands

### Migrate Hierarchy (Fix C3 - 300% Data Bloat)
```javascript
// Analyze hierarchy cloning issue
execute({
  action: 'mongodb',
  content: `
    db("clenergize_organization").collection("projects").aggregate([
      {$match: {clonedHierarchy: {$exists: true}}},
      {$group: {_id: null, count: {$sum: 1}, totalSize: {$sum: {$bsonSize: "$clonedHierarchy"}}}}
    ])
  `
})

// Extract unique hierarchies to reference service
execute({
  action: 'migration',
  content: 'extract-unique-hierarchies',
  options: {
    sourceDb: 'clenergize_organization',
    targetDb: 'clenergize_reference',
    collection: 'hierarchies'
  }
})

// Update projects with references
execute({
  action: 'migration',
  content: 'convert-to-references',
  options: {
    db: 'clenergize_organization',
    collection: 'projects',
    field: 'clonedHierarchy',
    newField: 'hierarchyRef'
  }
})

// Verify migration success
execute({
  action: 'mongodb',
  content: `
    db("clenergize_organization").collection("projects").aggregate([
      {$match: {hierarchyRef: {$exists: true}}},
      {$lookup: {
        from: "clenergize_reference.hierarchies",
        localField: "hierarchyRef",
        foreignField: "_id",
        as: "hierarchy"
      }},
      {$match: {hierarchy: {$size: 0}}},
      {$count: "brokenReferences"}
    ])
  `
})
```

**Expected Outcome**:
- Storage: 4.2 GB → 120 MB (97% reduction)
- Query Speed: 145ms → 23ms (84% faster)
- Update Operations: 1 instead of 1,234

### Normalize Data
```javascript
// Analyze denormalization
execute({
  action: 'mongodb',
  content: `
    db("clenergize_organization").collection("projects").aggregate([
      {$group: {
        _id: "$organizationDetails",
        count: {$sum: 1}
      }},
      {$match: {count: {$gt: 1}}},
      {$count: "duplicates"}
    ])
  `
})

// Extract unique organizations
execute({
  action: 'migration',
  content: 'normalize-field',
  options: {
    sourceDb: 'clenergize_organization',
    collection: 'projects',
    field: 'organizationDetails',
    targetCollection: 'organizations',
    referenceField: 'organizationId'
  }
})

// Verify normalization
execute({
  action: 'mongodb',
  content: `
    db("clenergize_organization").collection("projects").find({
      organizationDetails: {$exists: true}
    }).count()
  `
})
```

### Migrate V1 to V2 Format
```javascript
// Find V1 duplicate fields
execute({
  action: 'mongodb',
  content: `
    db("clenergize_activity").collection("activities").find({
      v1_emission_factor: {$exists: true}
    }).count()
  `
})

// Migrate to V2 format
execute({
  action: 'migration',
  content: 'v1-to-v2',
  options: {
    db: 'clenergize_activity',
    collection: 'activities',
    removeFields: [
      'v1_emission_factor',
      'v1_amount',
      'v1_unit_type',
      'v1_calculation_method'
    ],
    addMetadata: {
      version: 2,
      migrated: new Date().toISOString()
    }
  }
})

// Verify V1 fields removed
execute({
  action: 'mongodb',
  content: `
    db("clenergize_activity").collection("activities").aggregate([
      {$match: {
        $or: [
          {v1_emission_factor: {$exists: true}},
          {v1_amount: {$exists: true}}
        ]
      }},
      {$count: "remaining"}
    ])
  `
})
```

## Data Transfer Commands

### Export Old Data
```javascript
// Export from OLD service
execute({
  action: 'bash',
  content: 'mongoexport --db=clenergize_users --collection=users --out=exports/users_$(date +%Y%m%d).json --jsonArray'
})

// Export with relationships
execute({
  action: 'migration',
  content: 'export-with-relations',
  options: {
    db: 'clenergize_users',
    collections: ['users', 'roles', 'permissions'],
    outputDir: 'exports',
    format: 'json',
    includeRelations: true
  }
})

// Validate export
execute({
  action: 'bash',
  content: 'ls -lh exports/ && wc -l exports/users_*.json'
})
```

### Import to New Service
```javascript
// Transform and import data
execute({
  action: 'migration',
  content: 'import-transformed',
  options: {
    sourceFile: 'exports/users_20251115.json',
    targetDb: 'clenergize_identity',
    targetCollection: 'users',
    transformations: [
      { from: 'user_id', to: '_id' },
      { from: 'email_address', to: 'email' },
      { from: 'created_date', to: 'createdAt', type: 'date' }
    ],
    batchSize: 1000,
    validateSchema: true
  }
})

// Monitor import progress
execute({
  action: 'mongodb',
  content: `
    db("clenergize_identity").collection("users").count()
  `
})
```

### Validate Migration
```javascript
// Compare record counts
execute({
  action: 'bash',
  content: `
    OLD_COUNT=$(mongo clenergize_users --quiet --eval "db.users.count()")
    NEW_COUNT=$(mongo clenergize_identity --quiet --eval "db.users.count()")
    echo "OLD: $OLD_COUNT, NEW: $NEW_COUNT"
  `
})

// Validate data integrity
execute({
  action: 'migration',
  content: 'validate-integrity',
  options: {
    source: { db: 'clenergize_users', collection: 'users' },
    target: { db: 'clenergize_identity', collection: 'users' },
    checks: [
      'record-count',
      'field-mapping',
      'foreign-keys',
      'calculated-fields',
      'business-logic'
    ]
  }
})

// Generate validation report
execute({
  action: 'file',
  content: 'write',
  options: {
    path: 'migration-reports/validation_$(date +%Y%m%d).md',
    data: `# Migration Validation Report

Date: $(date)
Source: clenergize_users
Target: clenergize_identity

Results: See validation output above
    `
  }
})
```

## Schema Migration Commands

### Generate Migration Script
```javascript
// Create migration file
execute({
  action: 'file',
  content: 'write',
  options: {
    path: 'migrations/20251115_add_audit_fields.ts',
    data: `
import { Db } from 'mongodb';

export class AddAuditFields20251115 {
  version = '20251115_add-audit-fields';

  async up(db: Db): Promise<void> {
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
    `
  }
})
```

### Run Migration
```javascript
// Execute migration
execute({
  action: 'migration',
  content: 'run',
  options: {
    service: 'organization-service',
    db: 'clenergize_organization',
    version: '20251115_add-audit-fields'
  }
})

// Verify migration applied
execute({
  action: 'mongodb',
  content: `
    db("clenergize_organization").collection("schema_versions").find().sort({version: -1}).limit(1)
  `
})
```

### Rollback Migration
```javascript
// Backup before rollback
execute({
  action: 'bash',
  content: 'mongodump --db=clenergize_organization --out=backups/pre-rollback_$(date +%Y%m%d_%H%M%S)'
})

// Rollback migration
execute({
  action: 'migration',
  content: 'rollback',
  options: {
    service: 'organization-service',
    db: 'clenergize_organization',
    targetVersion: '20251110_initial_schema'
  }
})

// Verify rollback
execute({
  action: 'mongodb',
  content: `
    db("clenergize_organization").collection("schema_versions").find().sort({version: -1}).limit(1)
  `
})
```

## Data Transformation Commands

### Transform Dates
```javascript
// Standardize date formats
execute({
  action: 'mongodb',
  content: `
    db("clenergize_calculation").collection("activities").updateMany(
      { calculationDate: { $type: "string" } },
      [{
        $set: {
          calculationDate: { $toDate: "$calculationDate" }
        }
      }]
    )
  `
})

// Verify transformation
execute({
  action: 'mongodb',
  content: `
    db("clenergize_calculation").collection("activities").aggregate([
      {$group: {
        _id: {$type: "$calculationDate"},
        count: {$sum: 1}
      }}
    ])
  `
})
```

### Fix Broken References
```javascript
// Find broken references
execute({
  action: 'mongodb',
  content: `
    db("clenergize_organization").collection("projects").aggregate([
      {$lookup: {
        from: "clenergize_identity.users",
        localField: "createdBy",
        foreignField: "_id",
        as: "user"
      }},
      {$match: {user: {$size: 0}}},
      {$project: {_id: 1, createdBy: 1}}
    ])
  `
})

// Fix references
execute({
  action: 'migration',
  content: 'fix-references',
  options: {
    db: 'clenergize_organization',
    collection: 'projects',
    referenceField: 'createdBy',
    targetDb: 'clenergize_identity',
    targetCollection: 'users',
    fallbackValue: 'system-user-id'
  }
})
```

### Merge Duplicates
```javascript
// Detect duplicates
execute({
  action: 'mongodb',
  content: `
    db("clenergize_reference").collection("emission_factors").aggregate([
      {$group: {
        _id: {$toLower: "$name"},
        ids: {$push: "$_id"},
        count: {$sum: 1}
      }},
      {$match: {count: {$gt: 1}}}
    ])
  `
})

// Merge duplicates
execute({
  action: 'migration',
  content: 'merge-duplicates',
  options: {
    db: 'clenergize_reference',
    collection: 'emission_factors',
    matchField: 'name',
    strategy: 'keep-newest', // or 'keep-most-referenced'
    updateReferences: true
  }
})
```

## Backup & Recovery Commands

### Create Backup Before Migration
```javascript
// Create backup
execute({
  action: 'bash',
  content: 'mongodump --db=clenergize_organization --out=backups/organization_$(date +%Y%m%d_%H%M%S) --gzip'
})

// Verify backup
execute({
  action: 'bash',
  content: 'ls -lh backups/ && du -sh backups/organization_*'
})

// Upload to S3 (optional)
execute({
  action: 'aws',
  content: 's3 cp backups/organization_20251115_103045 s3://clenergize-backups/migrations/ --recursive'
})
```

### Restore from Backup
```javascript
// Restore backup
execute({
  action: 'bash',
  content: 'mongorestore --db=clenergize_organization --drop backups/organization_20251115_103045/clenergize_organization --gzip'
})

// Verify restore
execute({
  action: 'mongodb',
  content: `
    db("clenergize_organization").stats()
  `
})
```

### Migration Status
```javascript
// Get overall migration status
execute({
  action: 'migration',
  content: 'status',
  options: {
    services: 'all'
  }
})

// Get detailed service status
execute({
  action: 'mongodb',
  content: `
    db("clenergize_organization").collection("schema_versions").find().sort({appliedAt: -1})
  `
})
```

## Performance Commands

### Optimize Migration Performance
```javascript
// Use bulk operations
execute({
  action: 'migration',
  content: 'optimize-bulk-insert',
  options: {
    db: 'clenergize_activity',
    collection: 'activities',
    batchSize: 1000,
    ordered: false,
    writeConcern: { w: 1 }
  }
})

// Monitor performance
execute({
  action: 'mongodb',
  content: `
    db.currentOp({
      $or: [
        { op: "insert" },
        { op: "update" }
      ]
    })
  `
})
```

### Parallel Migration
```javascript
// Run migrations in parallel
execute({
  action: 'migration',
  content: 'parallel',
  options: {
    services: ['identity', 'reference'],
    maxWorkers: 3,
    memoryLimit: '6GB',
    cpuCores: 3
  }
})

// Monitor parallel execution
execute({
  action: 'bash',
  content: 'ps aux | grep migration && docker stats'
})
```

## Quick Reference

| Task | Command |
|------|---------|
| Migrate hierarchies | `execute({ action: 'migration', content: 'extract-unique-hierarchies', options: {...}})` |
| Export OLD data | `execute({ action: 'bash', content: 'mongoexport --db=old --collection=users --out=exports/users.json' })` |
| Import to NEW | `execute({ action: 'migration', content: 'import-transformed', options: {...}})` |
| Validate migration | `execute({ action: 'migration', content: 'validate-integrity', options: {...}})` |
| Create backup | `execute({ action: 'bash', content: 'mongodump --db=dbname --out=backups/...' })` |
| Run migration | `execute({ action: 'migration', content: 'run', options: {...}})` |
| Rollback | `execute({ action: 'migration', content: 'rollback', options: {...}})` |
| Fix references | `execute({ action: 'migration', content: 'fix-references', options: {...}})` |

Remember: Always backup before migration and validate after!
