import { BaseMigration } from '../src/base-migration';
import { Connection, ClientSession } from 'mongoose';

/**
 * Migration to convert hierarchy cloning to reference-based system
 *
 * This critical migration addresses the major performance and data integrity issue
 * where hierarchies were being cloned for each project instead of referenced.
 */
export default class HierarchyCloningToReferencesMigration extends BaseMigration {
  constructor() {
    super(
      '001_hierarchy_cloning_to_references',
      'Convert hierarchy cloning to reference-based system',
      1
    );
  }

  async up(connection: Connection, session?: ClientSession): Promise<void> {
    this.log('Starting hierarchy migration from cloning to references');

    // Step 1: Create hierarchy_templates collection
    await this.createCollection(
      connection,
      'hierarchy_templates',
      {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['name', 'templateType', 'structure', 'version'],
            properties: {
              name: { bsonType: 'string' },
              templateType: { enum: ['standard', 'custom', 'industry'] },
              structure: { bsonType: 'object' },
              version: { bsonType: 'number' },
              usageCount: { bsonType: 'number' },
            },
          },
        },
      },
      session
    );

    // Step 2: Create hierarchy_instances collection
    await this.createCollection(
      connection,
      'hierarchy_instances',
      {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['projectId', 'templateId', 'name', 'nodes'],
            properties: {
              projectId: { bsonType: 'objectId' },
              templateId: { bsonType: 'objectId' },
              name: { bsonType: 'string' },
              nodes: { bsonType: 'array' },
            },
          },
        },
      },
      session
    );

    // Step 3: Create indexes for performance
    await this.createIndex(
      connection,
      'hierarchy_templates',
      { name: 1, templateType: 1 },
      { unique: true },
      session
    );

    await this.createIndex(
      connection,
      'hierarchy_instances',
      { projectId: 1, templateId: 1 },
      {},
      session
    );

    // Step 4: Migrate existing cloned hierarchies
    const projectsWithClonedHierarchies = await connection.db
      .collection('projects')
      .find({ hierarchy: { $exists: true } }, { session })
      .toArray();

    this.log(`Found ${projectsWithClonedHierarchies.length} projects with cloned hierarchies`);

    // Group similar hierarchies to create templates
    const hierarchyMap = new Map<string, any[]>();

    for (const project of projectsWithClonedHierarchies) {
      const hierarchyHash = this.hashHierarchy(project.hierarchy);

      if (!hierarchyMap.has(hierarchyHash)) {
        hierarchyMap.set(hierarchyHash, []);
      }

      hierarchyMap.get(hierarchyHash)!.push(project);
    }

    this.log(`Identified ${hierarchyMap.size} unique hierarchy structures`);

    // Create templates and instances
    let templatesCreated = 0;
    let instancesCreated = 0;

    for (const [hash, projects] of hierarchyMap.entries()) {
      const templateStructure = projects[0].hierarchy;

      // Create template
      const templateResult = await connection.db
        .collection('hierarchy_templates')
        .insertOne(
          {
            name: `Template_${hash.substring(0, 8)}`,
            description: `Auto-generated from migration`,
            templateType: 'custom',
            structure: this.normalizeHierarchyStructure(templateStructure),
            version: 1,
            usageCount: projects.length,
            createdAt: new Date(),
            createdBy: 'migration',
          },
          { session }
        );

      templatesCreated++;

      // Create instances for each project
      for (const project of projects) {
        const instanceResult = await connection.db
          .collection('hierarchy_instances')
          .insertOne(
            {
              projectId: project._id,
              templateId: templateResult.insertedId,
              templateVersion: 1,
              name: project.hierarchy.name || `Hierarchy_${project._id}`,
              nodes: this.convertToInstanceNodes(project.hierarchy),
              customizations: {
                addedNodes: [],
                removedNodes: [],
                modifiedNodes: [],
              },
              statistics: this.calculateStatistics(project.hierarchy),
              createdAt: new Date(),
              createdBy: 'migration',
            },
            { session }
          );

        instancesCreated++;

        // Update project to reference the instance
        await connection.db.collection('projects').updateOne(
          { _id: project._id },
          {
            $set: {
              hierarchyTemplateId: templateResult.insertedId,
              hierarchyInstanceId: instanceResult.insertedId,
            },
            $unset: { hierarchy: '' }, // Remove cloned data
          },
          { session }
        );
      }
    }

    this.log(`Created ${templatesCreated} templates and ${instancesCreated} instances`);

    // Step 5: Create audit log entry
    await connection.db.collection('audit_logs').insertOne(
      {
        type: 'migration',
        action: 'hierarchy_cloning_to_references',
        metadata: {
          projectsProcessed: projectsWithClonedHierarchies.length,
          templatesCreated,
          instancesCreated,
        },
        timestamp: new Date(),
      },
      { session }
    );

    this.log('Hierarchy migration completed successfully');
  }

  async down(connection: Connection, session?: ClientSession): Promise<void> {
    this.log('Rolling back hierarchy migration');

    // Step 1: Restore cloned hierarchies to projects
    const instances = await connection.db
      .collection('hierarchy_instances')
      .find({}, { session })
      .toArray();

    for (const instance of instances) {
      const template = await connection.db
        .collection('hierarchy_templates')
        .findOne({ _id: instance.templateId }, { session });

      if (template) {
        // Reconstruct the full hierarchy from template and instance
        const hierarchy = this.reconstructHierarchy(template.structure, instance.nodes);

        // Update project with cloned hierarchy
        await connection.db.collection('projects').updateOne(
          { _id: instance.projectId },
          {
            $set: { hierarchy },
            $unset: {
              hierarchyTemplateId: '',
              hierarchyInstanceId: '',
            },
          },
          { session }
        );
      }
    }

    // Step 2: Drop the new collections
    await this.dropCollection(connection, 'hierarchy_instances', session);
    await this.dropCollection(connection, 'hierarchy_templates', session);

    // Step 3: Remove audit log entry
    await connection.db.collection('audit_logs').deleteOne(
      {
        type: 'migration',
        action: 'hierarchy_cloning_to_references',
      },
      { session }
    );

    this.log('Hierarchy migration rolled back');
  }

  async validate(connection: Connection): Promise<boolean> {
    // Check if we have projects with hierarchies
    const projectCount = await connection.db
      .collection('projects')
      .countDocuments({ hierarchy: { $exists: true } });

    if (projectCount === 0) {
      this.log('No projects with hierarchies to migrate');
      return false; // Skip migration
    }

    // Check if migration was already partially applied
    const templatesExist = await this.collectionExists(connection, 'hierarchy_templates');
    const instancesExist = await this.collectionExists(connection, 'hierarchy_instances');

    if (templatesExist || instancesExist) {
      this.log('Migration appears to be partially applied', 'warn');
      return false;
    }

    return true;
  }

  // Helper methods

  private hashHierarchy(hierarchy: any): string {
    const crypto = require('crypto');
    const normalized = JSON.stringify(this.normalizeHierarchyStructure(hierarchy));
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }

  private normalizeHierarchyStructure(hierarchy: any): any {
    // Remove instance-specific data to find common structure
    const normalized = { ...hierarchy };
    delete normalized._id;
    delete normalized.projectId;
    delete normalized.createdAt;
    delete normalized.updatedAt;
    delete normalized.createdBy;
    delete normalized.updatedBy;

    if (normalized.children) {
      normalized.children = normalized.children.map((child: any) =>
        this.normalizeHierarchyStructure(child)
      );
    }

    return normalized;
  }

  private convertToInstanceNodes(hierarchy: any): any[] {
    const nodes: any[] = [];
    let nodeCounter = 0;

    const traverse = (node: any, parentId: string | null = null, level: number = 1) => {
      const nodeId = `node_${++nodeCounter}`;

      nodes.push({
        id: nodeId,
        templateNodeId: node._id || nodeId,
        name: node.name,
        type: node.type,
        level,
        parentId,
        isActive: true,
        isCustom: false,
        isDeleted: false,
        metadata: node.metadata || {},
      });

      if (node.children && Array.isArray(node.children)) {
        for (const child of node.children) {
          traverse(child, nodeId, level + 1);
        }
      }
    };

    traverse(hierarchy);
    return nodes;
  }

  private calculateStatistics(hierarchy: any): any {
    let totalNodes = 0;
    let maxDepth = 0;

    const traverse = (node: any, depth: number = 1) => {
      totalNodes++;
      maxDepth = Math.max(maxDepth, depth);

      if (node.children && Array.isArray(node.children)) {
        for (const child of node.children) {
          traverse(child, depth + 1);
        }
      }
    };

    traverse(hierarchy);

    return {
      totalNodes,
      activeNodes: totalNodes,
      customNodes: 0,
      maxDepth,
    };
  }

  private reconstructHierarchy(template: any, instanceNodes: any[]): any {
    const nodeMap = new Map<string, any>();

    // Create node map
    for (const node of instanceNodes) {
      nodeMap.set(node.id, node);
    }

    // Build hierarchy from nodes
    const roots: any[] = [];

    for (const node of instanceNodes) {
      if (!node.parentId) {
        roots.push(this.buildHierarchyNode(node, nodeMap));
      }
    }

    return roots.length === 1 ? roots[0] : { name: 'Root', children: roots };
  }

  private buildHierarchyNode(node: any, nodeMap: Map<string, any>): any {
    const result: any = {
      name: node.name,
      type: node.type,
      metadata: node.metadata,
      children: [],
    };

    // Find children
    for (const [id, childNode] of nodeMap.entries()) {
      if (childNode.parentId === node.id) {
        result.children.push(this.buildHierarchyNode(childNode, nodeMap));
      }
    }

    if (result.children.length === 0) {
      delete result.children;
    }

    return result;
  }
}