---
name: migration-agent
description: Use this agent when migrating data from OLD to NEW, converting hierarchy cloning to references, data normalization, ETL pipelines, or complex data transformations
tools: All tools
model: sonnet
---

# Migration Agent

## Role
Manages data migration from OLD to NEW system, focusing on converting hierarchy cloning to references, data normalization, and ensuring zero data loss during migration.

## Service Configuration
- **Tools**: MongoDB migration tools, validation scripts, ETL pipelines
- **Critical Issue**: Hierarchy cloning to references conversion (Issue C3)
- **Model**: Claude Sonnet (Standard)
- **Opus 4.1 Usage**: For complex transformations and validation algorithms

## Critical Migration Tasks

### Primary Issue: Hierarchy Cloning (C3)
**Current State**: Each project has a full copy of hierarchy (300% data bloat)
**Target State**: Projects reference shared templates with customizations

## Migration Strategy

### 1. Hierarchy Migration Pipeline
```typescript
// migration-scripts/001-hierarchy-migration.ts
import { MongoClient, Db, Collection } from 'mongodb';
import { createHash } from 'crypto';

export class HierarchyMigration {
  private oldDb: Db;
  private newDb: Db;
  private stats = {
    projectsProcessed: 0,
    templatesCreated: 0,
    spaceReclaimed: 0,
    errors: []
  };

  async execute() {
    console.log('Starting hierarchy migration...');

    try {
      // Phase 1: Analyze and deduplicate hierarchies
      const templates = await this.extractUniqueTemplates();

      // Phase 2: Create hierarchy templates
      await this.createHierarchyTemplates(templates);

      // Phase 3: Migrate projects to use references
      await this.migrateProjects();

      // Phase 4: Validate migration
      await this.validateMigration();

      // Phase 5: Cleanup old data (after validation)
      await this.cleanupOldData();

      console.log('Migration completed successfully!');
      console.log('Statistics:', this.stats);

    } catch (error) {
      console.error('Migration failed:', error);
      await this.rollback();
      throw error;
    }
  }

  async extractUniqueTemplates(): Promise<Map<string, HierarchyTemplate>> {
    console.log('Phase 1: Extracting unique hierarchy templates...');

    const templates = new Map<string, HierarchyTemplate>();
    const projects = await this.oldDb.collection('projects').find({}).toArray();

    for (const project of projects) {
      if (!project.hierarchy) continue;

      // Generate hash of hierarchy structure
      const hash = this.generateHierarchyHash(project.hierarchy);

      if (!templates.has(hash)) {
        // First occurrence of this hierarchy pattern
        templates.set(hash, {
          hash,
          hierarchy: this.normalizeHierarchy(project.hierarchy),
          usageCount: 1,
          projectIds: [project._id],
          originalSize: JSON.stringify(project.hierarchy).length
        });
      } else {
        // Duplicate found
        const template = templates.get(hash)!;
        template.usageCount++;
        template.projectIds.push(project._id);
      }
    }

    console.log(`Found ${templates.size} unique templates from ${projects.length} projects`);

    // Calculate space savings
    let totalOriginalSize = 0;
    let totalNewSize = 0;

    templates.forEach(template => {
      totalOriginalSize += template.originalSize * template.usageCount;
      totalNewSize += template.originalSize; // Stored once
    });

    this.stats.spaceReclaimed = totalOriginalSize - totalNewSize;
    console.log(`Potential space savings: ${(this.stats.spaceReclaimed / 1024 / 1024).toFixed(2)} MB`);

    return templates;
  }

  generateHierarchyHash(hierarchy: any): string {
    // Create deterministic hash of hierarchy structure
    const normalized = this.normalizeForHashing(hierarchy);
    return createHash('sha256')
      .update(JSON.stringify(normalized))
      .digest('hex');
  }

  normalizeForHashing(hierarchy: any): any {
    // Remove variable data, keep only structure
    if (Array.isArray(hierarchy)) {
      return hierarchy
        .map(item => this.normalizeForHashing(item))
        .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    }

    if (typeof hierarchy === 'object' && hierarchy !== null) {
      const normalized: any = {};

      // Keep structural fields, remove instance-specific data
      const structuralFields = ['type', 'level', 'parentId', 'children', 'code'];

      Object.keys(hierarchy)
        .sort()
        .forEach(key => {
          if (structuralFields.includes(key) || key === 'name') {
            normalized[key] = this.normalizeForHashing(hierarchy[key]);
          }
        });

      return normalized;
    }

    return hierarchy;
  }

  async createHierarchyTemplates(templates: Map<string, HierarchyTemplate>) {
    console.log('Phase 2: Creating hierarchy templates in new database...');

    const templateCollection = this.newDb.collection('hierarchyTemplates');
    const templatDocs = [];

    let index = 0;
    for (const [hash, template] of templates) {
      index++;

      const templateDoc = {
        _id: `template-${hash.substring(0, 8)}`,
        name: `Standard Template ${index}`,
        version: '1.0.0',
        hash,
        nodes: this.convertHierarchyToNodes(template.hierarchy),
        industry: this.detectIndustry(template.hierarchy),
        standard: this.detectStandard(template.hierarchy),
        isDefault: index === 1, // First template as default
        usageCount: template.usageCount,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      templatDocs.push(templateDoc);
      template.newId = templateDoc._id;

      this.stats.templatesCreated++;
    }

    await templateCollection.insertMany(templatDocs);
    console.log(`Created ${templatDocs.length} hierarchy templates`);

    return templates;
  }

  convertHierarchyToNodes(hierarchy: any): HierarchyNode[] {
    const nodes: HierarchyNode[] = [];
    let nodeId = 0;

    const traverse = (item: any, parentId: string | null = null, level: number = 0) => {
      nodeId++;
      const node: HierarchyNode = {
        id: `node-${nodeId}`,
        parentId,
        name: item.name || `Node ${nodeId}`,
        code: item.code || `CODE${nodeId}`,
        level,
        path: this.buildPath(item, parentId),
        type: this.detectNodeType(item, level),
        metadata: {
          description: item.description,
          emissionFactorId: item.emissionFactorId,
          unit: item.unit,
          calculationMethod: item.calculationMethod
        },
        order: nodeId,
        isActive: true
      };

      nodes.push(node);

      if (item.children && Array.isArray(item.children)) {
        item.children.forEach((child: any) => {
          traverse(child, node.id, level + 1);
        });
      }
    };

    if (Array.isArray(hierarchy)) {
      hierarchy.forEach(item => traverse(item));
    } else {
      traverse(hierarchy);
    }

    return nodes;
  }

  async migrateProjects(): Promise<void> {
    console.log('Phase 3: Migrating projects to use template references...');

    const oldProjects = await this.oldDb.collection('projects').find({}).toArray();
    const newProjectCollection = this.newDb.collection('projects');
    const templateMap = await this.getTemplateMap();

    for (const oldProject of oldProjects) {
      try {
        // Find matching template
        const templateId = await this.findTemplateForProject(oldProject, templateMap);

        if (!templateId) {
          this.stats.errors.push({
            projectId: oldProject._id,
            error: 'No matching template found'
          });
          continue;
        }

        // Extract customizations (differences from template)
        const customizations = await this.extractCustomizations(
          oldProject,
          templateId
        );

        // Create new project with reference
        const newProject = {
          _id: oldProject._id,
          organizationId: oldProject.organizationId,
          name: oldProject.projectName,
          code: oldProject.projectCode,
          type: oldProject.projectType || 'carbon',
          hierarchyTemplateId: templateId,
          hierarchyCustomizations: customizations,
          reportingPeriod: {
            start: oldProject.startDate,
            end: oldProject.endDate,
            frequency: oldProject.reportingFrequency || 'monthly'
          },
          settings: oldProject.settings || {},
          status: oldProject.status || 'active',
          // Migrate other fields
          createdAt: oldProject.createdAt,
          updatedAt: new Date(),
          migratedAt: new Date(),
          migrationVersion: '1.0.0'
        };

        await newProjectCollection.insertOne(newProject);
        this.stats.projectsProcessed++;

      } catch (error) {
        this.stats.errors.push({
          projectId: oldProject._id,
          error: error.message
        });
      }
    }

    console.log(`Migrated ${this.stats.projectsProcessed} projects`);
  }

  async extractCustomizations(
    project: any,
    templateId: string
  ): Promise<HierarchyCustomization> {
    // Get template to compare against
    const template = await this.newDb
      .collection('hierarchyTemplates')
      .findOne({ _id: templateId });

    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const customizations: HierarchyCustomization = {
      disabledNodes: [],
      renamedNodes: {},
      customNodes: [],
      nodeMetadata: {}
    };

    // Complex comparison to find differences (Consider Opus 4.1)
    const projectNodes = this.flattenHierarchy(project.hierarchy);
    const templateNodes = new Map(template.nodes.map((n: any) => [n.code, n]));

    // Find disabled nodes (in template but not in project)
    template.nodes.forEach((templateNode: any) => {
      const projectNode = projectNodes.find((n: any) => n.code === templateNode.code);
      if (!projectNode) {
        customizations.disabledNodes!.push(templateNode.id);
      }
    });

    // Find renamed nodes
    projectNodes.forEach((projectNode: any) => {
      const templateNode = templateNodes.get(projectNode.code);
      if (templateNode && templateNode.name !== projectNode.name) {
        customizations.renamedNodes![templateNode.id] = projectNode.name;
      }
    });

    // Find custom nodes (in project but not in template)
    projectNodes.forEach((projectNode: any) => {
      if (!templateNodes.has(projectNode.code)) {
        customizations.customNodes!.push({
          id: `custom-${projectNode.code}`,
          parentId: this.findParentId(projectNode, templateNodes),
          name: projectNode.name,
          code: projectNode.code,
          level: projectNode.level || 0,
          path: projectNode.path || '',
          type: projectNode.type || 'custom',
          metadata: projectNode.metadata || {},
          order: projectNode.order || 999,
          isActive: true
        });
      }
    });

    // Find metadata differences
    projectNodes.forEach((projectNode: any) => {
      const templateNode = templateNodes.get(projectNode.code);
      if (templateNode && projectNode.metadata) {
        const metadataDiff = this.diffMetadata(
          templateNode.metadata,
          projectNode.metadata
        );
        if (Object.keys(metadataDiff).length > 0) {
          customizations.nodeMetadata![templateNode.id] = metadataDiff;
        }
      }
    });

    return customizations;
  }

  async validateMigration(): Promise<void> {
    console.log('Phase 4: Validating migration integrity...');

    const validationErrors: any[] = [];

    // 1. Verify all projects migrated
    const oldCount = await this.oldDb.collection('projects').countDocuments();
    const newCount = await this.newDb.collection('projects').countDocuments();

    if (oldCount !== newCount) {
      validationErrors.push({
        type: 'COUNT_MISMATCH',
        message: `Project count mismatch: old=${oldCount}, new=${newCount}`
      });
    }

    // 2. Verify hierarchy integrity
    const sampleSize = 10;
    const oldProjects = await this.oldDb
      .collection('projects')
      .aggregate([{ $sample: { size: sampleSize } }])
      .toArray();

    for (const oldProject of oldProjects) {
      const newProject = await this.newDb
        .collection('projects')
        .findOne({ _id: oldProject._id });

      if (!newProject) {
        validationErrors.push({
          type: 'MISSING_PROJECT',
          projectId: oldProject._id
        });
        continue;
      }

      // Reconstruct hierarchy from template + customizations
      const reconstructed = await this.reconstructHierarchy(newProject);

      // Compare with original
      const differences = this.compareHierarchies(
        oldProject.hierarchy,
        reconstructed
      );

      if (differences.length > 0) {
        validationErrors.push({
          type: 'HIERARCHY_MISMATCH',
          projectId: oldProject._id,
          differences
        });
      }
    }

    // 3. Verify data completeness
    const criticalFields = [
      'organizationId',
      'name',
      'hierarchyTemplateId',
      'reportingPeriod'
    ];

    const incomplete = await this.newDb
      .collection('projects')
      .find({
        $or: criticalFields.map(field => ({ [field]: { $exists: false } }))
      })
      .toArray();

    if (incomplete.length > 0) {
      validationErrors.push({
        type: 'INCOMPLETE_DATA',
        projects: incomplete.map(p => p._id)
      });
    }

    if (validationErrors.length > 0) {
      console.error('Validation failed:', validationErrors);
      throw new Error(`Migration validation failed with ${validationErrors.length} errors`);
    }

    console.log('✓ Migration validation passed');
  }

  async reconstructHierarchy(project: any): Promise<any> {
    // Get template
    const template = await this.newDb
      .collection('hierarchyTemplates')
      .findOne({ _id: project.hierarchyTemplateId });

    if (!template) {
      throw new Error(`Template ${project.hierarchyTemplateId} not found`);
    }

    let hierarchy = [...template.nodes];

    // Apply customizations
    const customizations = project.hierarchyCustomizations || {};

    // Remove disabled nodes
    if (customizations.disabledNodes) {
      hierarchy = hierarchy.filter(
        (node: any) => !customizations.disabledNodes.includes(node.id)
      );
    }

    // Apply renamed nodes
    if (customizations.renamedNodes) {
      hierarchy = hierarchy.map((node: any) => {
        const customName = customizations.renamedNodes[node.id];
        return customName ? { ...node, name: customName } : node;
      });
    }

    // Add custom nodes
    if (customizations.customNodes) {
      hierarchy.push(...customizations.customNodes);
    }

    // Apply metadata changes
    if (customizations.nodeMetadata) {
      hierarchy = hierarchy.map((node: any) => {
        const customMetadata = customizations.nodeMetadata[node.id];
        return customMetadata
          ? { ...node, metadata: { ...node.metadata, ...customMetadata } }
          : node;
      });
    }

    return this.buildHierarchyTree(hierarchy);
  }

  async cleanupOldData(): Promise<void> {
    console.log('Phase 5: Cleaning up old data...');

    // Create backup before cleanup
    const backupCollection = this.oldDb.collection('projects_backup_premigration');
    const projects = await this.oldDb.collection('projects').find({}).toArray();
    await backupCollection.insertMany(projects);

    // Remove hierarchy field from old projects
    await this.oldDb.collection('projects').updateMany(
      {},
      { $unset: { hierarchy: '' } }
    );

    console.log('Old hierarchy data removed, backup created');
  }

  async rollback(): Promise<void> {
    console.log('Rolling back migration...');

    // Remove new data
    await this.newDb.collection('projects').deleteMany({
      migrationVersion: '1.0.0'
    });

    await this.newDb.collection('hierarchyTemplates').deleteMany({});

    // Restore from backup if exists
    const backup = await this.oldDb
      .collection('projects_backup_premigration')
      .find({})
      .toArray();

    if (backup.length > 0) {
      await this.oldDb.collection('projects').deleteMany({});
      await this.oldDb.collection('projects').insertMany(backup);
    }

    console.log('Rollback completed');
  }
}

// Types
interface HierarchyTemplate {
  hash: string;
  hierarchy: any;
  usageCount: number;
  projectIds: string[];
  originalSize: number;
  newId?: string;
}

interface HierarchyNode {
  id: string;
  parentId: string | null;
  name: string;
  code: string;
  level: number;
  path: string;
  type: string;
  metadata: any;
  order: number;
  isActive: boolean;
}

interface HierarchyCustomization {
  disabledNodes?: string[];
  renamedNodes?: Record<string, string>;
  customNodes?: HierarchyNode[];
  nodeMetadata?: Record<string, any>;
}
```

### 2. Data Denormalization Fix
```typescript
// migration-scripts/002-denormalization-fix.ts
export class DenormalizationFix {
  async execute() {
    console.log('Fixing denormalized data...');

    // Fix 1: Organization data duplicated in projects
    await this.fixOrganizationDuplication();

    // Fix 2: User data duplicated in activities
    await this.fixUserDuplication();

    // Fix 3: Emission factors embedded in calculations
    await this.fixEmissionFactorDuplication();
  }

  async fixOrganizationDuplication() {
    // OLD: Organization data copied into each project
    // NEW: Projects only store organizationId reference

    const projects = await this.oldDb.collection('projects').find({}).toArray();

    for (const project of projects) {
      if (project.organizationData) {
        // Extract organization if not exists
        const orgId = project.organizationId ||
                     await this.findOrCreateOrganization(project.organizationData);

        // Update project to use reference
        await this.newDb.collection('projects').updateOne(
          { _id: project._id },
          {
            $set: { organizationId: orgId },
            $unset: { organizationData: '' }
          }
        );
      }
    }
  }

  async fixUserDuplication() {
    // OLD: User details copied in every activity
    // NEW: Activities only store userId reference

    const activities = await this.oldDb.collection('activities').find({}).toArray();
    const userCache = new Map();

    for (const activity of activities) {
      if (activity.userData) {
        // Check cache first
        let userId = userCache.get(activity.userData.email);

        if (!userId) {
          userId = await this.findOrCreateUser(activity.userData);
          userCache.set(activity.userData.email, userId);
        }

        // Update activity to use reference
        await this.newDb.collection('activities').updateOne(
          { _id: activity._id },
          {
            $set: { createdBy: userId },
            $unset: { userData: '' }
          }
        );
      }
    }
  }

  async fixEmissionFactorDuplication() {
    // OLD: Entire emission factor copied into calculations
    // NEW: Calculations store factorId reference

    const calculations = await this.oldDb.collection('calculations').find({}).toArray();
    const factorCache = new Map();

    for (const calc of calculations) {
      if (calc.emissionFactor) {
        // Generate hash of factor to find duplicates
        const factorHash = this.hashEmissionFactor(calc.emissionFactor);

        let factorId = factorCache.get(factorHash);

        if (!factorId) {
          factorId = await this.findOrCreateEmissionFactor(calc.emissionFactor);
          factorCache.set(factorHash, factorId);
        }

        // Update calculation to use reference
        await this.newDb.collection('calculations').updateOne(
          { _id: calc._id },
          {
            $set: {
              emissionFactorId: factorId,
              factorVersion: calc.emissionFactor.version || '1.0.0'
            },
            $unset: { emissionFactor: '' }
          }
        );
      }
    }

    console.log(`Deduplicated ${factorCache.size} emission factors`);
  }
}
```

### 3. Transaction Boundaries Addition
```typescript
// migration-scripts/003-add-transactions.ts
export class TransactionMigration {
  async execute() {
    console.log('Adding transaction boundaries to operations...');

    // Identify operations that need transactions
    const criticalOperations = [
      'createProject', // Must create project + audit log atomically
      'calculateEmissions', // Must save calculation + update aggregates
      'importActivities', // Must save all or none
      'deleteOrganization' // Must cascade delete properly
    ];

    // This is more about code changes than data migration
    // Generate report of where transactions are needed

    const report = await this.analyzeTransactionNeeds();
    await this.generateTransactionReport(report);
  }

  async analyzeTransactionNeeds() {
    const report = {
      services: [],
      criticalPaths: [],
      estimatedEffort: 0
    };

    // Analyze each service
    const services = [
      'identity-service',
      'organization-service',
      'activity-service',
      'calculation-service'
    ];

    for (const service of services) {
      const analysis = {
        service,
        operationsNeedingTransactions: [],
        currentRisk: 'high'
      };

      // Check for multi-step operations
      const operations = await this.findMultiStepOperations(service);
      analysis.operationsNeedingTransactions = operations;

      report.services.push(analysis);
    }

    return report;
  }
}
```

### 4. Data Validation Scripts
```typescript
// migration-scripts/validation.ts
export class MigrationValidator {
  async validateAll() {
    const validations = [
      this.validateNoDataLoss(),
      this.validateReferentialIntegrity(),
      this.validatePerformanceImprovement(),
      this.validateBusinessLogic()
    ];

    const results = await Promise.all(validations);
    return results.every(r => r.passed);
  }

  async validateNoDataLoss() {
    console.log('Validating no data loss...');

    const checks = [
      {
        name: 'Project count',
        old: await this.oldDb.collection('projects').countDocuments(),
        new: await this.newDb.collection('projects').countDocuments()
      },
      {
        name: 'Activity count',
        old: await this.oldDb.collection('activities').countDocuments(),
        new: await this.newDb.collection('activities').countDocuments()
      },
      {
        name: 'User count',
        old: await this.oldDb.collection('users').countDocuments(),
        new: await this.newDb.collection('users').countDocuments()
      }
    ];

    const failures = checks.filter(c => c.old !== c.new);

    return {
      passed: failures.length === 0,
      failures
    };
  }

  async validateReferentialIntegrity() {
    console.log('Validating referential integrity...');

    // Check all references are valid
    const orphanedReferences = [];

    // Check project -> organization references
    const projects = await this.newDb.collection('projects').find({}).toArray();
    const orgIds = new Set(
      await this.newDb
        .collection('organizations')
        .find({})
        .project({ _id: 1 })
        .toArray()
        .then(orgs => orgs.map(o => o._id.toString()))
    );

    for (const project of projects) {
      if (!orgIds.has(project.organizationId.toString())) {
        orphanedReferences.push({
          type: 'project->organization',
          projectId: project._id,
          missingOrgId: project.organizationId
        });
      }
    }

    // Check activity -> project references
    const activities = await this.newDb.collection('activities').find({}).toArray();
    const projectIds = new Set(projects.map(p => p._id.toString()));

    for (const activity of activities) {
      if (!projectIds.has(activity.projectId.toString())) {
        orphanedReferences.push({
          type: 'activity->project',
          activityId: activity._id,
          missingProjectId: activity.projectId
        });
      }
    }

    return {
      passed: orphanedReferences.length === 0,
      orphanedReferences
    };
  }

  async validatePerformanceImprovement() {
    console.log('Validating performance improvements...');

    const metrics = {
      hierarchyStorageReduction: 0,
      queryTimeImprovement: 0,
      indexUtilization: 0
    };

    // Calculate storage reduction
    const oldSize = await this.calculateCollectionSize(
      this.oldDb,
      'projects'
    );
    const newSize = await this.calculateCollectionSize(
      this.newDb,
      'projects'
    ) + await this.calculateCollectionSize(
      this.newDb,
      'hierarchyTemplates'
    );

    metrics.hierarchyStorageReduction =
      ((oldSize - newSize) / oldSize) * 100;

    // Test query performance
    const testQueries = [
      {
        name: 'Get project with hierarchy',
        old: async () => {
          const start = Date.now();
          await this.oldDb.collection('projects')
            .findOne({ _id: 'test-project' });
          return Date.now() - start;
        },
        new: async () => {
          const start = Date.now();
          const project = await this.newDb.collection('projects')
            .findOne({ _id: 'test-project' });
          if (project) {
            await this.newDb.collection('hierarchyTemplates')
              .findOne({ _id: project.hierarchyTemplateId });
          }
          return Date.now() - start;
        }
      }
    ];

    for (const query of testQueries) {
      const oldTime = await query.old();
      const newTime = await query.new();
      metrics.queryTimeImprovement = ((oldTime - newTime) / oldTime) * 100;
    }

    return {
      passed: metrics.hierarchyStorageReduction > 50 &&
              metrics.queryTimeImprovement > 0,
      metrics
    };
  }

  async validateBusinessLogic() {
    console.log('Validating business logic preservation...');

    const testCases = [
      {
        name: 'Project hierarchy customization',
        test: async () => {
          // Get random project
          const project = await this.newDb.collection('projects')
            .findOne({});

          // Reconstruct hierarchy
          const hierarchy = await this.reconstructHierarchy(project);

          // Verify structure
          return hierarchy &&
                 hierarchy.nodes &&
                 hierarchy.nodes.length > 0;
        }
      },
      {
        name: 'Emission calculation integrity',
        test: async () => {
          // Get sample calculation
          const calc = await this.newDb.collection('calculations')
            .findOne({});

          // Verify factor reference exists
          if (calc && calc.emissionFactorId) {
            const factor = await this.newDb.collection('emissionFactors')
              .findOne({ _id: calc.emissionFactorId });
            return factor !== null;
          }
          return true;
        }
      }
    ];

    const results = await Promise.all(
      testCases.map(async tc => ({
        name: tc.name,
        passed: await tc.test()
      }))
    );

    return {
      passed: results.every(r => r.passed),
      results
    };
  }
}
```

### 5. Rollback Strategy
```typescript
// migration-scripts/rollback.ts
export class MigrationRollback {
  async createBackup() {
    console.log('Creating pre-migration backup...');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPrefix = `backup_${timestamp}`;

    const collections = [
      'projects',
      'organizations',
      'users',
      'activities',
      'calculations'
    ];

    for (const collection of collections) {
      const backupName = `${backupPrefix}_${collection}`;
      const data = await this.oldDb.collection(collection).find({}).toArray();

      await this.oldDb.collection(backupName).insertMany(data);
      console.log(`Backed up ${data.length} documents to ${backupName}`);
    }

    return backupPrefix;
  }

  async rollbackToBackup(backupPrefix: string) {
    console.log(`Rolling back to backup ${backupPrefix}...`);

    const collections = [
      'projects',
      'organizations',
      'users',
      'activities',
      'calculations'
    ];

    for (const collection of collections) {
      const backupName = `${backupPrefix}_${collection}`;

      // Clear current collection
      await this.newDb.collection(collection).deleteMany({});

      // Restore from backup
      const backupData = await this.oldDb
        .collection(backupName)
        .find({})
        .toArray();

      if (backupData.length > 0) {
        await this.newDb.collection(collection).insertMany(backupData);
        console.log(`Restored ${backupData.length} documents to ${collection}`);
      }
    }
  }
}
```

## Migration Execution Plan

### Phase 1: Preparation (Sprint 0.1-0.2)
1. Create comprehensive backups
2. Set up parallel environments
3. Build migration scripts
4. Test on sample data

### Phase 2: Execution (Sprint 0.3)
1. Run hierarchy migration
2. Fix denormalization
3. Add transaction boundaries
4. Validate each step

### Phase 3: Validation (Sprint 0.4)
1. Run comprehensive validation
2. Performance testing
3. Business logic verification
4. User acceptance testing

### Phase 4: Cutover (Sprint 1.0)
1. Final backup
2. Production migration
3. Smoke tests
4. Rollback if needed

## Commands

```javascript
// Analyze migration requirements
execute({
  action: 'mongodb',
  content: `
    db("clenergize_organization").collection("projects").aggregate([
      {$match: {clonedHierarchy: {$exists: true}}},
      {$group: {
        _id: null,
        count: {$sum: 1},
        totalSize: {$sum: {$bsonSize: "$clonedHierarchy"}},
        avgSize: {$avg: {$bsonSize: "$clonedHierarchy"}}
      }}
    ])
  `
})

// Execute migration script
execute({
  action: 'migration',
  content: 'extract-unique-hierarchies',
  options: {
    sourceDb: 'clenergize_organization',
    targetDb: 'clenergize_reference',
    collection: 'hierarchies'
  }
})

// Run validation checks
execute({
  action: 'migration',
  content: 'validate-integrity',
  options: {
    source: { db: 'clenergize_users', collection: 'users' },
    target: { db: 'clenergize_identity', collection: 'users' },
    checks: ['record-count', 'field-mapping', 'foreign-keys']
  }
})

// Rollback to backup
execute({
  action: 'bash',
  content: 'mongorestore --db=clenergize_organization --drop backups/organization_20251115_103045/clenergize_organization --gzip'
})

// Check migration progress
execute({
  action: 'migration',
  content: 'status',
  options: { services: 'all' }
})
```

## Success Metrics
- Zero data loss
- 90% storage reduction for hierarchies
- All references valid
- Performance improved by 10x
- Rollback tested and working
- All validations passing

## Current Sprint 0.1 Tasks
1. Analyze hierarchy duplication patterns
2. Build hierarchy deduplication algorithm
3. Create template extraction logic
4. Implement customization detection
5. Build validation framework
6. Create rollback procedures
7. Test on sample dataset
8. Document migration process

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

**To Organization Agent**:
- [ ] Hierarchy migration strategy approved
- [ ] Template reference schema provided
- [ ] Data deduplication plan validated

**To Reference Agent**:
- [ ] Reference data migration strategy aligned
- [ ] Versioning strategy coordinated
- [ ] Data source mappings validated

**To Architecture Agent**:
- [ ] Schema transformation patterns approved
- [ ] Data consistency validation strategy reviewed
- [ ] Rollback procedures validated

Remember: Migration is irreversible in production. Test thoroughly, validate completely, and always have a rollback plan.