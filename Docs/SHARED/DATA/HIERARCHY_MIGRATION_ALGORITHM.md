# Hierarchy Migration Algorithm
**Clenergize V3 - Converting Hierarchy Cloning to References**

**Version**: 1.0.0
**Last Updated**: November 18, 2025
**Owner**: Migration Agent
**Status**: Implementation Ready
**Sprint**: 0.3

---

## Table of Contents
1. [Problem Statement](#problem-statement)
2. [Migration Strategy](#migration-strategy)
3. [Algorithm Steps](#algorithm-steps)
4. [Implementation](#implementation)
5. [Validation](#validation)
6. [Rollback Procedures](#rollback-procedures)
7. [Testing Strategy](#testing-strategy)

---

## 1. Problem Statement

### Current Issue (OLD System)

**Problem**: Projects clone entire hierarchy structures, causing 300% database bloat.

**OLD System Behavior**:
```javascript
// Organization has hierarchy template
const hierarchyTemplate = {
  name: "Corporate Hierarchy",
  levels: [
    { name: "Company", children: [
      { name: "Entity 1", children: [
        { name: "Subsidiary A", children: [
          { name: "Location 1" },
          { name: "Location 2" }
        ]}
      ]}
    ]}
  ]
};

// Project 1 CLONES the entire hierarchy
project1.hierarchy = JSON.parse(JSON.stringify(hierarchyTemplate));

// Project 2 CLONES the same hierarchy again
project2.hierarchy = JSON.parse(JSON.stringify(hierarchyTemplate));

// Project 3 CLONES it yet again
project3.hierarchy = JSON.parse(JSON.stringify(hierarchyTemplate));

// Result: Same hierarchy stored 3+ times = 300% bloat!
```

**Data Bloat Example**:
```
Organization: "Acme Corp"
Hierarchy Size: ~200 KB

Projects Using Same Hierarchy:
- Project 2023: 200 KB (cloned)
- Project 2024: 200 KB (cloned)
- Project 2025: 200 KB (cloned)

Total Storage: 600 KB for what should be 200 KB
Waste: 400 KB (67% waste)

With 1000 projects: 200 MB instead of 200 KB!
```

### Target Solution (NEW System)

**Solution**: Store hierarchy once, projects reference it.

**NEW System Behavior**:
```javascript
// Organization has hierarchy template (stored once)
const hierarchyTemplateId = "hierarchy-template-123";

// Project 1 references the hierarchy
project1.hierarchyRef = hierarchyTemplateId;

// Project 2 references the same hierarchy
project2.hierarchyRef = hierarchyTemplateId;

// Project 3 references the same hierarchy
project3.hierarchyRef = hierarchyTemplateId;

// Result: Hierarchy stored once, referenced 3 times = ~70% reduction!
```

**Storage Reduction**:
```
Organization: "Acme Corp"
Hierarchy Template: 200 KB (stored once)

Project References:
- Project 2023: 36 bytes (just the UUID reference)
- Project 2024: 36 bytes
- Project 2025: 36 bytes

Total Storage: 200 KB + 108 bytes ≈ 200 KB
Savings: 400 KB (67% reduction)

With 1000 projects: 200 KB + 36 KB ≈ 236 KB instead of 200 MB!
Savings: 199.764 MB (99.88% reduction)
```

---

## 2. Migration Strategy

### 2.1 High-Level Approach

```
Phase 1: Identify Unique Hierarchies
   ↓
Phase 2: Create Hierarchy Templates
   ↓
Phase 3: Create Historical Snapshots
   ↓
Phase 4: Update Project References
   ↓
Phase 5: Validate Migration
   ↓
Phase 6: Archive OLD Data
```

### 2.2 Migration Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| **Dry Run** | Analyze data without making changes | Initial assessment |
| **Validation** | Generate migration plan with statistics | Pre-migration verification |
| **Incremental** | Migrate one project at a time | Low-risk gradual migration |
| **Batch** | Migrate multiple projects (max 100) | Controlled batch migration |
| **Full** | Migrate all projects at once | Final cutover (downtime required) |

### 2.3 Zero-Downtime Strategy

**Goal**: Migrate without taking system offline.

**Approach**:
1. **Dual-Write Phase** (Week 1-2):
   - Write to both OLD (cloned) and NEW (referenced) formats
   - Read from OLD (existing behavior)
   - Validate NEW data accuracy

2. **Shadow Read Phase** (Week 3):
   - Write to both formats
   - Read from NEW, compare with OLD
   - Log discrepancies for investigation

3. **Cutover Phase** (Week 4):
   - Write to NEW only
   - Read from NEW
   - Keep OLD data as backup (30 days)

---

## 3. Algorithm Steps

### Phase 1: Identify Unique Hierarchies

**Goal**: Group identical hierarchies by canonical hash.

**Algorithm**:
```typescript
async function identifyUniqueHierarchies(): Promise<HierarchyGroup[]> {
  const projects = await oldDb.collection('projects').find({}).toArray();
  const hierarchyGroups = new Map<string, HierarchyGroup>();

  for (const project of projects) {
    // Generate canonical hash
    const hash = generateCanonicalHash(project.hierarchy);

    if (!hierarchyGroups.has(hash)) {
      hierarchyGroups.set(hash, {
        hash,
        canonicalStructure: project.hierarchy,
        projectIds: [],
        count: 0
      });
    }

    const group = hierarchyGroups.get(hash);
    group.projectIds.push(project._id);
    group.count++;
  }

  return Array.from(hierarchyGroups.values());
}
```

**Canonical Hash Generation**:
```typescript
function generateCanonicalHash(hierarchy: any): string {
  // Normalize hierarchy (remove IDs, timestamps, metadata)
  const normalized = normalizeHierarchy(hierarchy);

  // Sort keys alphabetically for deterministic hashing
  const sorted = sortKeysRecursively(normalized);

  // Generate SHA-256 hash
  const jsonString = JSON.stringify(sorted);
  return crypto.createHash('sha256').update(jsonString).digest('hex');
}

function normalizeHierarchy(hierarchy: any): any {
  if (Array.isArray(hierarchy)) {
    return hierarchy.map(normalizeHierarchy);
  }

  if (typeof hierarchy === 'object' && hierarchy !== null) {
    const normalized: any = {};

    // Keep only structural fields
    const structuralFields = ['name', 'type', 'children', 'level'];

    for (const field of structuralFields) {
      if (hierarchy[field] !== undefined) {
        normalized[field] = normalizeHierarchy(hierarchy[field]);
      }
    }

    return normalized;
  }

  return hierarchy;
}
```

**Example Output**:
```javascript
[
  {
    hash: "a1b2c3d4...",
    canonicalStructure: { /* hierarchy structure */ },
    projectIds: ["project-123", "project-456", "project-789"],
    count: 3
  },
  {
    hash: "e5f6g7h8...",
    canonicalStructure: { /* different hierarchy */ },
    projectIds: ["project-111", "project-222"],
    count: 2
  }
]
```

---

### Phase 2: Create Hierarchy Templates

**Goal**: Create one template per unique hierarchy.

**Algorithm**:
```typescript
async function createHierarchyTemplates(
  hierarchyGroups: HierarchyGroup[]
): Promise<Map<string, string>> {
  const hashToTemplateId = new Map<string, string>();

  for (const group of hierarchyGroups) {
    // Create hierarchy template
    const template = transformToTemplate(group.canonicalStructure);

    // Insert into NEW database
    const result = await newDb.collection('hierarchy_templates').insertOne({
      name: `Hierarchy Template ${group.hash.substr(0, 8)}`,
      structure: template,
      createdAt: new Date(),
      createdBy: 'migration-script',
      usage: {
        projectCount: group.count,
        projectIds: group.projectIds
      },
      metadata: {
        sourceHash: group.hash,
        migrationDate: new Date()
      }
    });

    hashToTemplateId.set(group.hash, result.insertedId.toString());

    console.log(`✅ Created template ${result.insertedId} for ${group.count} projects`);
  }

  return hashToTemplateId;
}

function transformToTemplate(hierarchy: any): any {
  // Transform OLD hierarchy structure to NEW template format

  function transform(node: any, parent: any = null): any {
    return {
      id: generateUUID(),
      name: node.name,
      type: node.type || inferType(node),
      parentId: parent ? parent.id : null,
      level: calculateLevel(node),
      order: node.order || 0,
      children: (node.children || []).map(child => transform(child, node))
    };
  }

  return transform(hierarchy);
}
```

---

### Phase 3: Create Historical Snapshots

**Goal**: Preserve project-specific hierarchy data for historical reporting.

**Why Snapshots?**: Some projects may have customized hierarchies over time. Snapshots preserve this history for auditing and reporting.

**Algorithm**:
```typescript
async function createHistoricalSnapshots(
  projects: any[],
  hashToTemplateId: Map<string, string>
): Promise<void> {
  for (const project of projects) {
    const hash = generateCanonicalHash(project.hierarchy);
    const templateId = hashToTemplateId.get(hash);

    // Create snapshot for historical reference
    await newDb.collection('hierarchy_snapshots').insertOne({
      projectId: project._id,
      hierarchyTemplateId: templateId,
      snapshotDate: new Date(),
      year: project.year || extractYearFromProject(project),
      structure: project.hierarchy,  // Full cloned hierarchy (for history)
      metadata: {
        migratedAt: new Date(),
        sourceProjectId: project._id,
        immutable: true
      }
    });

    console.log(`📸 Created snapshot for project ${project._id}`);
  }
}
```

**Snapshot Use Cases**:
- Historical reports comparing different years
- Audit trail showing hierarchy changes
- Rollback capability if migration fails

---

### Phase 4: Update Project References

**Goal**: Replace cloned hierarchies with template references.

**Algorithm**:
```typescript
async function updateProjectReferences(
  projects: any[],
  hashToTemplateId: Map<string, string>,
  options: MigrationOptions
): Promise<MigrationResult> {
  const result: MigrationResult = {
    successful: 0,
    failed: 0,
    errors: []
  };

  for (const project of projects) {
    try {
      const hash = generateCanonicalHash(project.hierarchy);
      const templateId = hashToTemplateId.get(hash);

      if (!templateId) {
        throw new Error(`No template found for hierarchy hash: ${hash}`);
      }

      // Update project in NEW database
      await newDb.collection('projects').updateOne(
        { _id: project._id },
        {
          $set: {
            hierarchyTemplateId: templateId,
            migratedAt: new Date()
          },
          $unset: {
            hierarchy: ''  // Remove cloned hierarchy
          }
        }
      );

      // If incremental mode, also update OLD database
      if (options.mode === 'incremental') {
        await oldDb.collection('projects').updateOne(
          { _id: project._id },
          {
            $set: {
              _migrated: true,
              _hierarchyRef: templateId
            }
          }
        );
      }

      result.successful++;
      console.log(`✅ Migrated project ${project._id}`);

    } catch (error) {
      result.failed++;
      result.errors.push({
        projectId: project._id.toString(),
        error: error.message
      });
      console.error(`❌ Failed to migrate project ${project._id}:`, error);
    }
  }

  return result;
}
```

---

### Phase 5: Validate Migration

**Goal**: Ensure data integrity after migration.

**Validation Checks**:
```typescript
async function validateMigration(): Promise<ValidationReport> {
  const checks: ValidationCheck[] = [];

  // Check 1: All projects have hierarchyTemplateId
  const orphanedProjects = await newDb.collection('projects').find({
    hierarchyTemplateId: { $exists: false }
  }).count();

  checks.push({
    name: 'Projects have hierarchy references',
    passed: orphanedProjects === 0,
    message: orphanedProjects === 0
      ? `✅ All projects have hierarchy references`
      : `❌ ${orphanedProjects} projects missing hierarchy references`
  });

  // Check 2: All templates are referenced
  const unusedTemplates = await findUnusedTemplates();

  checks.push({
    name: 'All templates are used',
    passed: unusedTemplates.length === 0,
    message: unusedTemplates.length === 0
      ? `✅ All templates are referenced by projects`
      : `⚠️  ${unusedTemplates.length} unused templates (may be intentional for future projects)`
  });

  // Check 3: Hierarchy integrity (no broken parent-child links)
  const brokenLinks = await validateHierarchyIntegrity();

  checks.push({
    name: 'Hierarchy integrity',
    passed: brokenLinks.length === 0,
    message: brokenLinks.length === 0
      ? `✅ All hierarchy parent-child links are valid`
      : `❌ ${brokenLinks.length} broken links found`
  });

  // Check 4: Snapshot count matches project count
  const projectCount = await newDb.collection('projects').count();
  const snapshotCount = await newDb.collection('hierarchy_snapshots').count();

  checks.push({
    name: 'Snapshot coverage',
    passed: snapshotCount === projectCount,
    message: snapshotCount === projectCount
      ? `✅ All ${projectCount} projects have snapshots`
      : `❌ Expected ${projectCount} snapshots, found ${snapshotCount}`
  });

  // Check 5: Data consistency (compare OLD vs NEW)
  const inconsistencies = await compareOldAndNew();

  checks.push({
    name: 'Data consistency',
    passed: inconsistencies.length === 0,
    message: inconsistencies.length === 0
      ? `✅ OLD and NEW data match perfectly`
      : `❌ ${inconsistencies.length} data inconsistencies found`
  });

  return {
    timestamp: new Date(),
    overallStatus: checks.every(c => c.passed) ? 'PASSED' : 'FAILED',
    checks,
    summary: {
      total: checks.length,
      passed: checks.filter(c => c.passed).length,
      failed: checks.filter(c => !c.passed).length
    }
  };
}

async function compareOldAndNew(): Promise<DataInconsistency[]> {
  const inconsistencies: DataInconsistency[] = [];

  const oldProjects = await oldDb.collection('projects').find({}).toArray();

  for (const oldProject of oldProjects) {
    const newProject = await newDb.collection('projects').findOne({ _id: oldProject._id });

    if (!newProject) {
      inconsistencies.push({
        projectId: oldProject._id.toString(),
        issue: 'Project missing in NEW database'
      });
      continue;
    }

    // Get hierarchy from template
    const template = await newDb.collection('hierarchy_templates').findOne({
      _id: newProject.hierarchyTemplateId
    });

    if (!template) {
      inconsistencies.push({
        projectId: oldProject._id.toString(),
        issue: 'Hierarchy template not found'
      });
      continue;
    }

    // Compare hierarchies
    const oldHash = generateCanonicalHash(oldProject.hierarchy);
    const newHash = generateCanonicalHash(template.structure);

    if (oldHash !== newHash) {
      inconsistencies.push({
        projectId: oldProject._id.toString(),
        issue: 'Hierarchy structure mismatch',
        details: {
          oldHash,
          newHash
        }
      });
    }
  }

  return inconsistencies;
}
```

---

## 4. Implementation

### 4.1 Migration Script

Create `scripts/migration/001-hierarchy-migration.ts`:

```typescript
import { MongoClient } from 'mongodb';
import * as crypto from 'crypto';

interface MigrationOptions {
  mode: 'dry-run' | 'validation' | 'incremental' | 'batch' | 'full';
  batchSize?: number;
  targetProjectIds?: string[];
}

interface MigrationResult {
  successful: number;
  failed: number;
  errors: Array<{ projectId: string; error: string }>;
  duration: number;
}

class HierarchyMigration {
  private oldDb: any;
  private newDb: any;

  constructor(
    private oldMongoUrl: string,
    private newMongoUrl: string
  ) {}

  async connect(): Promise<void> {
    const oldClient = await MongoClient.connect(this.oldMongoUrl);
    const newClient = await MongoClient.connect(this.newMongoUrl);

    this.oldDb = oldClient.db('clenergize_old');
    this.newDb = newClient.db('clenergize_organization');
  }

  async migrate(options: MigrationOptions): Promise<MigrationResult> {
    const startTime = Date.now();

    console.log(`🚀 Starting hierarchy migration (mode: ${options.mode})`);

    // Phase 1: Identify unique hierarchies
    console.log('\n📊 Phase 1: Identifying unique hierarchies...');
    const hierarchyGroups = await this.identifyUniqueHierarchies();
    console.log(`Found ${hierarchyGroups.length} unique hierarchies`);

    if (options.mode === 'dry-run') {
      return this.generateDryRunReport(hierarchyGroups);
    }

    // Phase 2: Create hierarchy templates
    console.log('\n🏗️  Phase 2: Creating hierarchy templates...');
    const hashToTemplateId = await this.createHierarchyTemplates(hierarchyGroups);
    console.log(`Created ${hashToTemplateId.size} templates`);

    // Phase 3: Create snapshots
    console.log('\n📸 Phase 3: Creating historical snapshots...');
    const projects = await this.getProjectsToMigrate(options);
    await this.createHistoricalSnapshots(projects, hashToTemplateId);
    console.log(`Created ${projects.length} snapshots`);

    if (options.mode === 'validation') {
      return this.generateValidationReport(projects, hashToTemplateId);
    }

    // Phase 4: Update project references
    console.log('\n🔄 Phase 4: Updating project references...');
    const result = await this.updateProjectReferences(projects, hashToTemplateId, options);
    console.log(`Migrated ${result.successful} projects (${result.failed} failed)`);

    // Phase 5: Validate migration
    console.log('\n✅ Phase 5: Validating migration...');
    const validationReport = await this.validateMigration();

    if (validationReport.overallStatus !== 'PASSED') {
      console.error('\n❌ Validation failed! Rolling back...');
      await this.rollback();
      throw new Error('Migration validation failed');
    }

    const duration = Date.now() - startTime;
    console.log(`\n🎉 Migration completed successfully in ${duration}ms`);

    return { ...result, duration };
  }

  // ... (implementation of all methods shown in previous sections)
}

// CLI Usage
async function main() {
  const migration = new HierarchyMigration(
    process.env.OLD_MONGODB_URI,
    process.env.NEW_MONGODB_URI
  );

  await migration.connect();

  const options: MigrationOptions = {
    mode: (process.env.MIGRATION_MODE as any) || 'dry-run',
    batchSize: parseInt(process.env.BATCH_SIZE || '100'),
    targetProjectIds: process.env.TARGET_PROJECTS?.split(',')
  };

  try {
    const result = await migration.migrate(options);
    console.log('\n📊 Migration Result:', result);
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  }
}

main();
```

### 4.2 Running the Migration

```bash
# Step 1: Dry run (analyze data, no changes)
MIGRATION_MODE=dry-run \
OLD_MONGODB_URI=mongodb://localhost:27017 \
NEW_MONGODB_URI=mongodb://localhost:27017 \
node scripts/migration/001-hierarchy-migration.ts

# Step 2: Validation (generate migration plan)
MIGRATION_MODE=validation \
node scripts/migration/001-hierarchy-migration.ts

# Step 3: Incremental migration (test with 1 project)
MIGRATION_MODE=incremental \
TARGET_PROJECTS=project-123 \
node scripts/migration/001-hierarchy-migration.ts

# Step 4: Batch migration (100 projects at a time)
MIGRATION_MODE=batch \
BATCH_SIZE=100 \
node scripts/migration/001-hierarchy-migration.ts

# Step 5: Full migration (all projects)
MIGRATION_MODE=full \
node scripts/migration/001-hierarchy-migration.ts
```

---

## 5. Validation

### 5.1 Pre-Migration Validation

**Checklist**:
- [ ] Backup OLD database (full snapshot)
- [ ] Verify NEW database schema is deployed
- [ ] Test migration script on sample data (10 projects)
- [ ] Review dry-run report for anomalies
- [ ] Confirm downtime window (if needed)
- [ ] Notify stakeholders

### 5.2 Post-Migration Validation

**Automated Checks**:
```bash
# Run validation script
node scripts/migration/validate-migration.ts

# Expected output:
# ✅ All projects have hierarchy references
# ✅ All templates are used
# ✅ Hierarchy integrity verified
# ✅ Snapshot coverage: 100%
# ✅ Data consistency: 100%
```

**Manual Checks**:
1. Random sample: Verify 20 projects manually
2. UI verification: Load projects in frontend, check hierarchies display correctly
3. Calculation verification: Run calculations on migrated projects, compare results with OLD system
4. Report verification: Generate reports, ensure hierarchy data appears correctly

---

## 6. Rollback Procedures

### 6.1 Immediate Rollback (within 1 hour)

**Scenario**: Migration failed validation or critical bug discovered.

**Steps**:
```bash
# 1. Stop NEW services
docker-compose down

# 2. Restore OLD database from backup
mongorestore --uri="mongodb://localhost:27017" --drop dump/clenergize_old

# 3. Restart OLD services
docker-compose -f docker-compose.old.yml up -d

# 4. Verify OLD system operational
curl http://localhost:3000/health
```

**RTO**: 15 minutes
**RPO**: 0 (no data loss, using backup)

### 6.2 Delayed Rollback (within 7 days)

**Scenario**: Migration succeeded but unexpected issues discovered in production.

**Steps**:
```bash
# 1. Revert projects to cloned hierarchies
node scripts/migration/rollback-to-cloned.ts

# 2. Sync any changes made in NEW system back to OLD
node scripts/migration/sync-back-to-old.ts

# 3. Switch DNS back to OLD system
# (Manual AWS Route 53 change)

# 4. Archive NEW data for investigation
mongodump --uri="mongodb://localhost:27017" --db=clenergize_organization --out=dump/rollback_investigation
```

**RTO**: 2 hours
**RPO**: 1 hour (recent changes may need manual reconciliation)

---

## 7. Testing Strategy

### 7.1 Unit Tests

```typescript
// scripts/migration/__tests__/hierarchy-migration.test.ts
describe('HierarchyMigration', () => {
  describe('generateCanonicalHash', () => {
    it('generates same hash for identical hierarchies', () => {
      const hierarchy1 = { name: 'Company', children: [{ name: 'Entity 1' }] };
      const hierarchy2 = { name: 'Company', children: [{ name: 'Entity 1' }] };

      const hash1 = generateCanonicalHash(hierarchy1);
      const hash2 = generateCanonicalHash(hierarchy2);

      expect(hash1).toBe(hash2);
    });

    it('generates different hash for different hierarchies', () => {
      const hierarchy1 = { name: 'Company A', children: [] };
      const hierarchy2 = { name: 'Company B', children: [] };

      const hash1 = generateCanonicalHash(hierarchy1);
      const hash2 = generateCanonicalHash(hierarchy2);

      expect(hash1).not.toBe(hash2);
    });

    it('ignores metadata fields (IDs, timestamps)', () => {
      const hierarchy1 = {
        _id: '123',
        name: 'Company',
        createdAt: new Date('2023-01-01')
      };
      const hierarchy2 = {
        _id: '456',
        name: 'Company',
        createdAt: new Date('2024-01-01')
      };

      const hash1 = generateCanonicalHash(hierarchy1);
      const hash2 = generateCanonicalHash(hierarchy2);

      expect(hash1).toBe(hash2);
    });
  });

  describe('transformToTemplate', () => {
    it('assigns UUIDs to all nodes', () => {
      const hierarchy = {
        name: 'Company',
        children: [
          { name: 'Entity 1', children: [{ name: 'Location 1' }] }
        ]
      };

      const template = transformToTemplate(hierarchy);

      expect(template.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      expect(template.children[0].id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });

    it('sets correct parent-child relationships', () => {
      const hierarchy = {
        name: 'Company',
        children: [
          { name: 'Entity 1', children: [{ name: 'Location 1' }] }
        ]
      };

      const template = transformToTemplate(hierarchy);

      expect(template.parentId).toBeNull();
      expect(template.children[0].parentId).toBe(template.id);
      expect(template.children[0].children[0].parentId).toBe(template.children[0].id);
    });
  });
});
```

### 7.2 Integration Tests

```typescript
describe('HierarchyMigration Integration', () => {
  let migration: HierarchyMigration;

  beforeAll(async () => {
    // Setup test databases
    migration = new HierarchyMigration(
      'mongodb://localhost:27017/test_old',
      'mongodb://localhost:27017/test_new'
    );
    await migration.connect();
  });

  it('migrates sample project successfully', async () => {
    // Insert test project in OLD database
    await oldDb.collection('projects').insertOne({
      _id: 'test-project-1',
      name: 'Test Project',
      hierarchy: {
        name: 'Company',
        children: [{ name: 'Entity 1' }]
      }
    });

    // Run migration
    const result = await migration.migrate({ mode: 'full' });

    expect(result.successful).toBe(1);
    expect(result.failed).toBe(0);

    // Verify NEW database
    const migratedProject = await newDb.collection('projects').findOne({ _id: 'test-project-1' });

    expect(migratedProject.hierarchyTemplateId).toBeDefined();
    expect(migratedProject.hierarchy).toBeUndefined();

    // Verify template created
    const template = await newDb.collection('hierarchy_templates').findOne({
      _id: migratedProject.hierarchyTemplateId
    });

    expect(template).toBeDefined();
    expect(template.structure.name).toBe('Company');
  });
});
```

---

**Document Status**: ✅ Complete
**Ready for Implementation**: YES
**Sprint**: 0.3
**Estimated Effort**: 40 hours (implementation + testing)
