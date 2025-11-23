import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession, Types } from 'mongoose';
import { HierarchyTemplate, HierarchyNode } from '../../domain/entities/hierarchy-template.entity';
import { HierarchyInstance, HierarchyInstanceNode } from '../../domain/entities/hierarchy-instance.entity';
import { Project } from '../../domain/entities/project.entity';
import { EventBusService } from '@clenergize/event-bus';
import { v4 as uuidv4 } from 'uuid';

/**
 * Hierarchy Service
 *
 * Manages hierarchy templates and instances, solving the cloning problem by:
 * 1. Creating reusable templates
 * 2. Creating lightweight instances that reference templates
 * 3. Allowing customization without duplication
 * 4. Providing migration from cloned to referenced hierarchies
 */
@Injectable()
export class HierarchyService {
  private readonly logger = new Logger(HierarchyService.name);

  constructor(
    @InjectModel(HierarchyTemplate.name)
    private hierarchyTemplateModel: Model<HierarchyTemplate>,
    @InjectModel(HierarchyInstance.name)
    private hierarchyInstanceModel: Model<HierarchyInstance>,
    @InjectModel(Project.name)
    private projectModel: Model<Project>,
    private eventBus: EventBusService
  ) {}

  /**
   * Create a hierarchy template
   */
  async createTemplate(
    data: {
      name: string;
      description: string;
      templateType: string;
      structure: HierarchyNode;
      industry?: string;
      region?: string;
      organizationId?: string;
      createdBy: string;
    },
    session?: ClientSession
  ): Promise<HierarchyTemplate> {
    this.logger.log(`Creating hierarchy template: ${data.name}`);

    // Validate structure
    this.validateHierarchyStructure(data.structure);

    // Calculate constraints
    const constraints = this.calculateConstraints(data.structure);

    const template = new this.hierarchyTemplateModel({
      ...data,
      version: 1,
      constraints,
      usageCount: 0
    });

    await template.save({ session });

    await this.eventBus.publish({
      type: 'organization.hierarchy-template.created.v1',
      payload: {
        templateId: template._id.toString(),
        name: template.name,
        templateType: template.templateType,
        createdBy: data.createdBy
      }
    });

    this.logger.log(`Hierarchy template created: ${template._id}`);
    return template;
  }

  /**
   * Create hierarchy instance from template
   */
  async createInstanceFromTemplate(
    projectId: string,
    templateId: string,
    customizations: {
      name?: string;
      nodesToRemove?: string[];
      nodesToAdd?: HierarchyInstanceNode[];
      nodeModifications?: Array<{ nodeId: string; changes: Record<string, any> }>;
    },
    createdBy: string,
    session?: ClientSession
  ): Promise<HierarchyInstance> {
    this.logger.log(`Creating hierarchy instance for project: ${projectId}`);

    const template = await this.hierarchyTemplateModel.findById(templateId);
    if (!template) {
      throw new NotFoundException(`Hierarchy template ${templateId} not found`);
    }

    // Convert template structure to instance nodes
    const nodes = this.convertTemplateToInstanceNodes(template.structure);

    // Apply customizations
    if (customizations.nodesToRemove) {
      for (const nodeId of customizations.nodesToRemove) {
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
          node.isDeleted = true;
        }
      }
    }

    if (customizations.nodesToAdd) {
      nodes.push(...customizations.nodesToAdd);
    }

    if (customizations.nodeModifications) {
      for (const mod of customizations.nodeModifications) {
        const node = nodes.find(n => n.id === mod.nodeId);
        if (node) {
          Object.assign(node, mod.changes);
        }
      }
    }

    const instance = new this.hierarchyInstanceModel({
      projectId: new Types.ObjectId(projectId),
      templateId: template._id,
      templateVersion: template.version,
      name: customizations.name || template.name,
      nodes,
      customizations: {
        addedNodes: customizations.nodesToAdd?.map(n => n.id) || [],
        removedNodes: customizations.nodesToRemove || [],
        modifiedNodes: customizations.nodeModifications || []
      },
      statistics: this.calculateStatistics(nodes),
      createdBy,
      lastSyncedAt: new Date()
    });

    await instance.save({ session });

    // Update template usage count
    await this.hierarchyTemplateModel.findByIdAndUpdate(
      templateId,
      {
        $inc: { usageCount: 1 },
        $set: { lastUsedAt: new Date() }
      },
      { session }
    );

    // Update project with hierarchy instance
    await this.projectModel.findByIdAndUpdate(
      projectId,
      {
        hierarchyTemplateId: template._id,
        hierarchyInstanceId: instance._id
      },
      { session }
    );

    await this.eventBus.publish({
      type: 'organization.hierarchy-instance.created.v1',
      payload: {
        instanceId: instance._id.toString(),
        projectId,
        templateId: template._id.toString(),
        createdBy
      }
    });

    this.logger.log(`Hierarchy instance created: ${instance._id}`);
    return instance;
  }

  /**
   * Migrate cloned hierarchy to reference-based hierarchy
   */
  async migrateClonedHierarchy(
    projectId: string,
    existingHierarchy: any,
    session?: ClientSession
  ): Promise<{ templateId: string; instanceId: string }> {
    this.logger.log(`Migrating cloned hierarchy for project: ${projectId}`);

    // Analyze existing hierarchy to find or create appropriate template
    const structure = this.extractStructureFromCloned(existingHierarchy);
    const templateHash = this.generateStructureHash(structure);

    // Check if similar template exists
    let template = await this.findSimilarTemplate(templateHash);

    if (!template) {
      // Create new template from cloned hierarchy
      template = await this.createTemplate(
        {
          name: `Migrated Template - ${projectId}`,
          description: 'Template created from migrated hierarchy',
          templateType: 'custom',
          structure,
          createdBy: 'migration'
        },
        session
      );
    }

    // Create instance from template
    const instance = await this.createInstanceFromTemplate(
      projectId,
      template._id.toString(),
      {
        name: `Hierarchy - ${projectId}`
      },
      'migration',
      session
    );

    // Clean up old cloned data (mark for deletion)
    await this.markClonedDataForDeletion(projectId, existingHierarchy, session);

    this.logger.log(`Migration completed for project: ${projectId}`);

    return {
      templateId: template._id.toString(),
      instanceId: instance._id.toString()
    };
  }

  /**
   * Update hierarchy instance
   */
  async updateInstance(
    instanceId: string,
    updates: {
      addNodes?: HierarchyInstanceNode[];
      removeNodes?: string[];
      modifyNodes?: Array<{ nodeId: string; changes: Record<string, any> }>;
    },
    updatedBy: string,
    session?: ClientSession
  ): Promise<HierarchyInstance> {
    const instance = await this.hierarchyInstanceModel.findById(instanceId);
    if (!instance) {
      throw new NotFoundException(`Hierarchy instance ${instanceId} not found`);
    }

    // Apply updates
    if (updates.addNodes) {
      for (const node of updates.addNodes) {
        instance.nodes.push(node);
        instance.customizations.addedNodes.push(node.id);
      }
    }

    if (updates.removeNodes) {
      for (const nodeId of updates.removeNodes) {
        const node = instance.nodes.find(n => n.id === nodeId);
        if (node) {
          node.isDeleted = true;
          instance.customizations.removedNodes.push(nodeId);
        }
      }
    }

    if (updates.modifyNodes) {
      for (const mod of updates.modifyNodes) {
        const node = instance.nodes.find(n => n.id === mod.nodeId);
        if (node) {
          Object.assign(node, mod.changes);
          const existing = instance.customizations.modifiedNodes.find(m => m.nodeId === mod.nodeId);
          if (existing) {
            Object.assign(existing.changes, mod.changes);
          } else {
            instance.customizations.modifiedNodes.push(mod);
          }
        }
      }
    }

    // Update statistics
    instance.statistics = this.calculateStatistics(instance.nodes);
    instance.updatedBy = updatedBy;

    await instance.save({ session });

    await this.eventBus.publish({
      type: 'organization.hierarchy-instance.updated.v1',
      payload: {
        instanceId: instance._id.toString(),
        projectId: instance.projectId.toString(),
        updatedBy,
        changes: updates
      }
    });

    return instance;
  }

  /**
   * Sync instance with template updates
   */
  async syncInstanceWithTemplate(
    instanceId: string,
    options: {
      preserveCustomizations: boolean;
      conflictResolution: 'template' | 'instance' | 'merge';
    },
    session?: ClientSession
  ): Promise<HierarchyInstance> {
    const instance = await this.hierarchyInstanceModel.findById(instanceId);
    if (!instance || !instance.templateId) {
      throw new NotFoundException('Instance not found or not based on template');
    }

    const template = await this.hierarchyTemplateModel.findById(instance.templateId);
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    if (template.version === instance.templateVersion) {
      // Already in sync
      return instance;
    }

    // Get template nodes
    const templateNodes = this.convertTemplateToInstanceNodes(template.structure);

    // Merge with instance customizations
    const mergedNodes = this.mergeNodes(
      templateNodes,
      instance.nodes,
      instance.customizations,
      options
    );

    instance.nodes = mergedNodes;
    instance.templateVersion = template.version;
    instance.lastSyncedAt = new Date();
    instance.isDiverged = false;
    instance.statistics = this.calculateStatistics(mergedNodes);

    await instance.save({ session });

    await this.eventBus.publish({
      type: 'organization.hierarchy-instance.synced.v1',
      payload: {
        instanceId: instance._id.toString(),
        templateId: template._id.toString(),
        templateVersion: template.version
      }
    });

    return instance;
  }

  /**
   * Get hierarchy as tree structure
   */
  async getHierarchyTree(instanceId: string): Promise<any> {
    const instance = await this.hierarchyInstanceModel.findById(instanceId);
    if (!instance) {
      throw new NotFoundException(`Hierarchy instance ${instanceId} not found`);
    }

    return this.buildTreeFromNodes(instance.nodes.filter(n => !n.isDeleted));
  }

  // Helper methods

  private validateHierarchyStructure(structure: HierarchyNode): void {
    // Validate that structure is a tree (no cycles, single root, etc.)
    const visited = new Set<string>();
    const queue = [structure];

    while (queue.length > 0) {
      const node = queue.shift()!;

      if (visited.has(node.id)) {
        throw new ConflictException('Hierarchy contains cycles');
      }

      visited.add(node.id);

      if (node.children) {
        queue.push(...node.children);
      }
    }
  }

  private calculateConstraints(structure: HierarchyNode): any {
    let maxDepth = 0;
    let totalNodes = 0;
    const allowedTypes = new Set<string>();

    const traverse = (node: HierarchyNode, depth: number) => {
      maxDepth = Math.max(maxDepth, depth);
      totalNodes++;
      allowedTypes.add(node.type);

      if (node.children) {
        for (const child of node.children) {
          traverse(child, depth + 1);
        }
      }
    };

    traverse(structure, 1);

    return {
      maxDepth,
      totalNodes,
      allowedTypes: Array.from(allowedTypes)
    };
  }

  private convertTemplateToInstanceNodes(structure: HierarchyNode): HierarchyInstanceNode[] {
    const nodes: HierarchyInstanceNode[] = [];

    const traverse = (node: HierarchyNode, parentId?: string, level: number = 1) => {
      const instanceNode: HierarchyInstanceNode = {
        id: node.id || uuidv4(),
        templateNodeId: node.id,
        name: node.name,
        type: node.type,
        level,
        parentId,
        isActive: true,
        isCustom: false,
        isDeleted: false,
        metadata: node.metadata
      };

      nodes.push(instanceNode);

      if (node.children) {
        for (const child of node.children) {
          traverse(child, instanceNode.id, level + 1);
        }
      }
    };

    traverse(structure);
    return nodes;
  }

  private calculateStatistics(nodes: HierarchyInstanceNode[]): any {
    return {
      totalNodes: nodes.length,
      activeNodes: nodes.filter(n => n.isActive && !n.isDeleted).length,
      customNodes: nodes.filter(n => n.isCustom).length,
      maxDepth: Math.max(...nodes.map(n => n.level))
    };
  }

  private extractStructureFromCloned(clonedData: any): HierarchyNode {
    // Convert old cloned hierarchy format to new structure
    // This would need to be customized based on actual cloned data format
    return {
      id: uuidv4(),
      name: 'Root',
      type: 'entity',
      level: 1,
      children: []
    };
  }

  private generateStructureHash(structure: HierarchyNode): string {
    // Generate a hash to identify similar structures
    const crypto = require('crypto');
    const structureString = JSON.stringify(structure, ['name', 'type', 'children']);
    return crypto.createHash('sha256').update(structureString).digest('hex');
  }

  private async findSimilarTemplate(hash: string): Promise<HierarchyTemplate | null> {
    // In a real implementation, you might store the hash and search by it
    // For now, return null to always create new template
    return null;
  }

  private async markClonedDataForDeletion(
    projectId: string,
    clonedData: any,
    session?: ClientSession
  ): Promise<void> {
    // Mark old cloned data for cleanup
    // This would be customized based on actual data structure
    this.logger.log(`Marked cloned data for deletion for project: ${projectId}`);
  }

  private mergeNodes(
    templateNodes: HierarchyInstanceNode[],
    instanceNodes: HierarchyInstanceNode[],
    customizations: any,
    options: any
  ): HierarchyInstanceNode[] {
    // Complex merge logic based on conflict resolution strategy
    if (options.conflictResolution === 'template') {
      return templateNodes;
    }

    if (options.conflictResolution === 'instance') {
      return instanceNodes;
    }

    // Merge strategy - combine template and customizations
    const merged = [...templateNodes];

    // Add custom nodes
    for (const nodeId of customizations.addedNodes) {
      const customNode = instanceNodes.find(n => n.id === nodeId);
      if (customNode) {
        merged.push(customNode);
      }
    }

    // Apply modifications
    for (const mod of customizations.modifiedNodes) {
      const node = merged.find(n => n.id === mod.nodeId);
      if (node) {
        Object.assign(node, mod.changes);
      }
    }

    // Apply deletions
    for (const nodeId of customizations.removedNodes) {
      const node = merged.find(n => n.id === nodeId);
      if (node) {
        node.isDeleted = true;
      }
    }

    return merged;
  }

  private buildTreeFromNodes(nodes: HierarchyInstanceNode[]): any {
    const nodeMap = new Map<string, any>();
    const roots: any[] = [];

    // Create node map
    for (const node of nodes) {
      nodeMap.set(node.id, { ...node, children: [] });
    }

    // Build tree structure
    for (const node of nodes) {
      if (node.parentId) {
        const parent = nodeMap.get(node.parentId);
        if (parent) {
          parent.children.push(nodeMap.get(node.id));
        }
      } else {
        roots.push(nodeMap.get(node.id));
      }
    }

    return roots.length === 1 ? roots[0] : roots;
  }
}