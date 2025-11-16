# Organization Agent

## Role
Manages the Organization Service (formerly project-management-ms), handling organizations, projects, hierarchies, and fixing the critical hierarchy cloning issue.

## Service Configuration
- **Port**: 3002
- **Database**: MongoDB - `clenergize_organization`
- **OLD Reference**: `OLD/clenergizeV3-project-management-ms-dev/`
- **NEW Implementation**: `NEW/organization-service/`
- **Model**: Claude Sonnet (Standard)

## Critical Issues to Fix from OLD

### C3: Hierarchy Data Cloned Instead of Referenced (CRITICAL)
**Problem**: Each project clones entire hierarchy structure (300% data bloat)
```typescript
// OLD: Cloning entire structure
const project = {
  hierarchy: cloneDeep(template.hierarchy), // Full copy!
  entities: [...template.entities],         // Another copy!
  // Results in massive duplication
};
```

**Solution**: Use references
```typescript
// NEW: Reference-based approach
const project = {
  hierarchyTemplateId: template.id,
  customizations: {
    // Only store differences/overrides
    disabledNodes: ['node-123'],
    renamedNodes: { 'node-456': 'Custom Name' }
  }
};
```

### Other Issues
- No transaction boundaries for project operations
- Denormalized organization data
- Missing audit trails
- No proper state management

## NEW Service Architecture

### Domain Structure
```
NEW/organization-service/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── organization.entity.ts
│   │   │   ├── project.entity.ts
│   │   │   └── hierarchy-template.entity.ts
│   │   ├── value-objects/
│   │   │   ├── organization-id.vo.ts
│   │   │   ├── project-id.vo.ts
│   │   │   └── hierarchy-node.vo.ts
│   │   ├── events/
│   │   │   ├── organization-created.event.ts
│   │   │   ├── project-created.event.ts
│   │   │   └── hierarchy-customized.event.ts
│   │   └── services/
│   │       ├── hierarchy.service.ts
│   │       └── project-state.service.ts
│   ├── application/
│   │   ├── commands/
│   │   │   ├── create-organization.command.ts
│   │   │   ├── create-project.command.ts
│   │   │   └── customize-hierarchy.command.ts
│   │   └── queries/
│   │       ├── get-organization.query.ts
│   │       ├── get-project-hierarchy.query.ts
│   │       └── list-projects.query.ts
│   └── infrastructure/
│       ├── repositories/
│       │   ├── organization.repository.ts
│       │   ├── project.repository.ts
│       │   └── hierarchy-template.repository.ts
│       └── services/
│           └── hierarchy-resolver.service.ts
```

## Core Features to Implement

### 1. Organization Entity
```typescript
export class Organization {
  private readonly id: OrganizationId;
  private name: string;
  private code: string; // Unique identifier
  private settings: OrganizationSettings;
  private subscription: Subscription;
  private projects: ProjectId[]; // References only
  private users: UserId[]; // References only
  private status: OrganizationStatus;
  private metadata: {
    industry: string;
    country: string;
    size: 'small' | 'medium' | 'large' | 'enterprise';
    certifications: string[];
  };
  private createdAt: Date;
  private updatedAt: Date;

  constructor(props: OrganizationProps) {
    this.validateInvariants(props);
    Object.assign(this, props);
  }

  createProject(props: CreateProjectProps): Project {
    if (this.projects.length >= this.subscription.maxProjects) {
      throw new ProjectLimitExceededException();
    }

    const project = new Project({
      ...props,
      organizationId: this.id,
      hierarchyTemplateId: props.templateId // Reference, not clone!
    });

    this.projects.push(project.id);
    this.updatedAt = new Date();

    return project;
  }

  private validateInvariants(props: OrganizationProps): void {
    if (!props.name || props.name.length < 3) {
      throw new InvalidOrganizationNameException();
    }

    if (!this.isValidCode(props.code)) {
      throw new InvalidOrganizationCodeException();
    }
  }

  private isValidCode(code: string): boolean {
    return /^[A-Z0-9]{3,10}$/.test(code);
  }
}
```

### 2. Project Entity with Reference-Based Hierarchy
```typescript
export class Project {
  private readonly id: ProjectId;
  private organizationId: OrganizationId;
  private name: string;
  private code: string;
  private description: string;
  private type: ProjectType;
  private hierarchyTemplateId: HierarchyTemplateId; // REFERENCE!
  private hierarchyCustomizations: HierarchyCustomization;
  private reportingPeriod: ReportingPeriod;
  private status: ProjectStatus;
  private settings: ProjectSettings;
  private dataStreams: DataStreamId[];
  private calculations: CalculationId[];
  private createdAt: Date;
  private updatedAt: Date;

  constructor(props: ProjectProps) {
    this.validateInvariants(props);
    Object.assign(this, props);
  }

  customizeHierarchy(customization: HierarchyCustomization): void {
    // Store only the differences from template
    this.hierarchyCustomizations = {
      ...this.hierarchyCustomizations,
      ...customization,
      updatedAt: new Date()
    };

    this.updatedAt = new Date();
  }

  getEffectiveHierarchy(template: HierarchyTemplate): HierarchyNode[] {
    // Apply customizations to template
    let hierarchy = [...template.nodes];

    // Apply disabled nodes
    if (this.hierarchyCustomizations.disabledNodes) {
      hierarchy = hierarchy.filter(
        node => !this.hierarchyCustomizations.disabledNodes.includes(node.id)
      );
    }

    // Apply renamed nodes
    if (this.hierarchyCustomizations.renamedNodes) {
      hierarchy = hierarchy.map(node => {
        const customName = this.hierarchyCustomizations.renamedNodes[node.id];
        return customName ? { ...node, name: customName } : node;
      });
    }

    // Apply custom nodes
    if (this.hierarchyCustomizations.customNodes) {
      hierarchy.push(...this.hierarchyCustomizations.customNodes);
    }

    return hierarchy;
  }
}

// Hierarchy Customization (stores only differences)
interface HierarchyCustomization {
  disabledNodes?: string[];              // Node IDs to hide
  renamedNodes?: Record<string, string>; // Node ID -> custom name
  customNodes?: HierarchyNode[];         // Additional nodes
  nodeMetadata?: Record<string, any>;    // Node-specific settings
  updatedAt?: Date;
}
```

### 3. Hierarchy Template (Shared Reference)
```typescript
export class HierarchyTemplate {
  private readonly id: HierarchyTemplateId;
  private name: string;
  private version: string;
  private description: string;
  private industry: string;
  private standard: 'GHG' | 'ISO14064' | 'Custom';
  private nodes: HierarchyNode[];
  private isDefault: boolean;
  private isActive: boolean;
  private createdAt: Date;
  private updatedAt: Date;

  constructor(props: HierarchyTemplateProps) {
    this.validateHierarchy(props.nodes);
    Object.assign(this, props);
  }

  private validateHierarchy(nodes: HierarchyNode[]): void {
    // Ensure no circular dependencies
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    for (const node of nodes) {
      if (this.hasCycle(node, nodes, visited, recursionStack)) {
        throw new CircularHierarchyException();
      }
    }
  }

  private hasCycle(
    node: HierarchyNode,
    allNodes: HierarchyNode[],
    visited: Set<string>,
    recursionStack: Set<string>
  ): boolean {
    visited.add(node.id);
    recursionStack.add(node.id);

    const children = allNodes.filter(n => n.parentId === node.id);
    for (const child of children) {
      if (!visited.has(child.id)) {
        if (this.hasCycle(child, allNodes, visited, recursionStack)) {
          return true;
        }
      } else if (recursionStack.has(child.id)) {
        return true;
      }
    }

    recursionStack.delete(node.id);
    return false;
  }

  clone(): HierarchyTemplate {
    return new HierarchyTemplate({
      ...this,
      id: new HierarchyTemplateId(),
      name: `${this.name} (Copy)`,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
}

// Hierarchy Node Structure
interface HierarchyNode {
  id: string;
  parentId: string | null;
  name: string;
  code: string;
  level: number;
  path: string; // e.g., "/scope1/category1/activity1"
  type: 'scope' | 'category' | 'subcategory' | 'activity';
  metadata: {
    description?: string;
    emissionFactorId?: string;
    unit?: string;
    calculationMethod?: string;
  };
  order: number;
  isActive: boolean;
}
```

### 4. Migration Strategy for Existing Data
```typescript
@Injectable()
export class HierarchyMigrationService {
  constructor(
    private oldProjectRepo: Repository,
    private newProjectRepo: ProjectRepository,
    private templateRepo: HierarchyTemplateRepository,
    private eventBus: EventBus
  ) {}

  async migrateProjectHierarchies(): Promise<MigrationResult> {
    const results = {
      total: 0,
      success: 0,
      failed: 0,
      spaceSaved: 0
    };

    // Get all projects with cloned hierarchies
    const oldProjects = await this.oldProjectRepo.find({
      hierarchy: { $exists: true }
    });

    results.total = oldProjects.length;

    for (const oldProject of oldProjects) {
      try {
        // Find or create matching template
        const template = await this.findOrCreateTemplate(
          oldProject.hierarchy
        );

        // Calculate customizations
        const customizations = this.extractCustomizations(
          oldProject.hierarchy,
          template
        );

        // Create new project with reference
        const newProject = new Project({
          id: new ProjectId(oldProject._id.toString()),
          organizationId: new OrganizationId(oldProject.organizationId),
          name: oldProject.name,
          hierarchyTemplateId: template.id,
          hierarchyCustomizations: customizations,
          // ... other fields
        });

        await this.newProjectRepo.save(newProject);

        // Calculate space saved
        const oldSize = JSON.stringify(oldProject.hierarchy).length;
        const newSize = JSON.stringify(customizations).length;
        results.spaceSaved += (oldSize - newSize);

        results.success++;

        await this.eventBus.publish(new ProjectMigratedEvent({
          projectId: newProject.id,
          oldSize,
          newSize,
          reduction: Math.round((1 - newSize/oldSize) * 100)
        }));

      } catch (error) {
        results.failed++;
        console.error(`Failed to migrate project ${oldProject._id}:`, error);
      }
    }

    console.log(`Migration complete: ${results.success}/${results.total} successful`);
    console.log(`Space saved: ${(results.spaceSaved / 1024 / 1024).toFixed(2)} MB`);

    return results;
  }

  private async findOrCreateTemplate(
    hierarchy: any
  ): Promise<HierarchyTemplate> {
    // Generate hash of hierarchy structure
    const hash = this.generateHierarchyHash(hierarchy);

    // Check if template exists
    let template = await this.templateRepo.findByHash(hash);

    if (!template) {
      // Create new template from hierarchy
      template = new HierarchyTemplate({
        id: new HierarchyTemplateId(),
        name: `Template ${hash.substring(0, 8)}`,
        nodes: this.normalizeHierarchy(hierarchy),
        hash,
        // ... other fields
      });

      await this.templateRepo.save(template);
    }

    return template;
  }

  private extractCustomizations(
    projectHierarchy: any,
    template: HierarchyTemplate
  ): HierarchyCustomization {
    const customizations: HierarchyCustomization = {};

    // Find disabled nodes
    const templateNodeIds = new Set(template.nodes.map(n => n.id));
    const projectNodeIds = new Set(projectHierarchy.nodes.map(n => n.id));

    customizations.disabledNodes = Array.from(templateNodeIds)
      .filter(id => !projectNodeIds.has(id));

    // Find renamed nodes
    customizations.renamedNodes = {};
    for (const node of projectHierarchy.nodes) {
      const templateNode = template.nodes.find(n => n.id === node.id);
      if (templateNode && templateNode.name !== node.name) {
        customizations.renamedNodes[node.id] = node.name;
      }
    }

    // Find custom nodes
    customizations.customNodes = projectHierarchy.nodes
      .filter(node => !templateNodeIds.has(node.id));

    return customizations;
  }
}
```

## API Endpoints

### Organizations
```typescript
POST   /organizations          - Create organization
GET    /organizations          - List organizations
GET    /organizations/:id      - Get organization details
PUT    /organizations/:id      - Update organization
DELETE /organizations/:id      - Delete organization (soft)
GET    /organizations/:id/projects - List organization projects
GET    /organizations/:id/users    - List organization users
```

### Projects
```typescript
POST   /projects               - Create project
GET    /projects               - List projects
GET    /projects/:id           - Get project details
PUT    /projects/:id           - Update project
DELETE /projects/:id           - Delete project
GET    /projects/:id/hierarchy - Get effective hierarchy
PUT    /projects/:id/hierarchy - Customize hierarchy
POST   /projects/:id/clone     - Clone project
```

### Hierarchy Templates
```typescript
GET    /hierarchy-templates    - List templates
GET    /hierarchy-templates/:id - Get template
POST   /hierarchy-templates    - Create template
PUT    /hierarchy-templates/:id - Update template
POST   /hierarchy-templates/:id/clone - Clone template
```

## Events Published

```typescript
// Organization.Organization.Created
{
  organizationId: string;
  name: string;
  code: string;
  createdBy: string;
  timestamp: Date;
}

// Organization.Project.Created
{
  projectId: string;
  organizationId: string;
  name: string;
  hierarchyTemplateId: string;
  createdBy: string;
  timestamp: Date;
}

// Organization.Hierarchy.Customized
{
  projectId: string;
  customizations: HierarchyCustomization;
  changedBy: string;
  timestamp: Date;
}

// Organization.Project.StatusChanged
{
  projectId: string;
  oldStatus: string;
  newStatus: string;
  reason: string;
  changedBy: string;
  timestamp: Date;
}
```

## Database Schema

### Organizations Collection
```javascript
{
  _id: ObjectId,
  name: string,
  code: string, // Unique
  settings: {
    timezone: string,
    currency: string,
    language: string,
    fiscalYearStart: number // 1-12
  },
  subscription: {
    plan: 'basic' | 'professional' | 'enterprise',
    maxProjects: number,
    maxUsers: number,
    expiresAt: Date
  },
  metadata: {
    industry: string,
    country: string,
    size: string,
    certifications: string[]
  },
  status: 'active' | 'suspended' | 'deleted',
  createdAt: Date,
  updatedAt: Date
}
```

### Projects Collection (NEW - with references)
```javascript
{
  _id: ObjectId,
  organizationId: ObjectId,
  name: string,
  code: string,
  type: 'carbon' | 'water' | 'waste' | 'combined',
  hierarchyTemplateId: ObjectId, // REFERENCE to template
  hierarchyCustomizations: {
    disabledNodes: string[],
    renamedNodes: { [nodeId]: string },
    customNodes: HierarchyNode[],
    nodeMetadata: { [nodeId]: object }
  },
  reportingPeriod: {
    start: Date,
    end: Date,
    frequency: 'monthly' | 'quarterly' | 'annually'
  },
  settings: object,
  status: 'draft' | 'active' | 'archived',
  createdAt: Date,
  updatedAt: Date
}
```

### HierarchyTemplates Collection (NEW)
```javascript
{
  _id: ObjectId,
  name: string,
  version: string,
  hash: string, // For deduplication
  industry: string,
  standard: string,
  nodes: [{
    id: string,
    parentId: string | null,
    name: string,
    code: string,
    level: number,
    path: string,
    type: string,
    metadata: object,
    order: number,
    isActive: boolean
  }],
  isDefault: boolean,
  isActive: boolean,
  usageCount: number, // Track how many projects use this
  createdAt: Date,
  updatedAt: Date
}
```

## Migration Statistics

### Expected Improvements
```yaml
Current State (OLD):
  - Average project size: 500KB
  - Hierarchy data per project: 150KB
  - Total projects: 1000
  - Total hierarchy data: 150MB
  - Duplication rate: 95%

After Migration (NEW):
  - Unique templates: ~50
  - Template size: 150KB each
  - Customization data: ~5KB per project
  - Total hierarchy data: 7.5MB (templates) + 5MB (customizations) = 12.5MB
  - Space reduction: 91.7%
  - Query performance: 10x faster
```

## Testing Requirements

### Unit Tests
```typescript
describe('Project Entity', () => {
  it('should reference hierarchy template, not clone');
  it('should store only customizations');
  it('should correctly apply customizations to template');
  it('should validate hierarchy has no cycles');
});

describe('Hierarchy Migration', () => {
  it('should convert cloned hierarchies to references');
  it('should deduplicate identical hierarchies');
  it('should preserve customizations');
  it('should reduce storage by >90%');
});
```

## Commands

```javascript
// Create organization
execute({
  action: 'mongodb',
  content: `
    db("clenergize_organization").collection("organizations").insertOne({
      name: "Acme Corp",
      code: "ACME",
      status: "active",
      createdAt: new Date()
    })
  `
})

// Create project
execute({
  action: 'mongodb',
  content: `
    db("clenergize_organization").collection("projects").insertOne({
      name: "Q1 Emissions Report",
      organizationId: ObjectId("orgId"),
      hierarchyTemplateId: ObjectId("templateId"),
      status: "active",
      createdAt: new Date()
    })
  `
})

// Run hierarchy migration (fix C3 issue)
execute({
  action: 'migration',
  content: 'extract-unique-hierarchies',
  options: {
    sourceDb: 'clenergize_organization',
    targetDb: 'clenergize_reference',
    collection: 'hierarchies'
  }
})

// Show duplication stats
execute({
  action: 'mongodb',
  content: `
    db("clenergize_organization").collection("projects").aggregate([
      {$match: {clonedHierarchy: {$exists: true}}},
      {$group: {
        _id: null,
        count: {$sum: 1},
        totalSize: {$sum: {$bsonSize: "$clonedHierarchy"}}
      }}
    ])
  `
})

// Consolidate similar templates
execute({
  action: 'migration',
  content: 'merge-duplicates',
  options: {
    db: 'clenergize_reference',
    collection: 'hierarchy_templates',
    matchField: 'hash',
    strategy: 'keep-most-referenced'
  }
})
```

## Success Metrics
- Hierarchy data stored as references (not cloned)
- 90%+ reduction in hierarchy storage
- No data loss during migration
- Template deduplication working
- Customizations properly applied
- All projects have valid hierarchies
- Query performance improved 10x

## Current Sprint 0.1 Tasks
1. Design hierarchy template schema
2. Create migration script for existing projects
3. Implement reference-based project entity
4. Build hierarchy resolver service
5. Add customization management
6. Create template deduplication logic
7. Test migration on sample data
8. Document migration process

Remember: The hierarchy cloning issue is causing 300% data bloat. This MUST be fixed before production.