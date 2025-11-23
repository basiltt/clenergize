import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * Hierarchy Instance Entity
 *
 * Represents a specific instance of a hierarchy template for a project.
 * This allows customization without cloning the entire structure.
 *
 * Key benefits:
 * - No data duplication
 * - Template updates can be propagated
 * - Project-specific customizations preserved
 * - Efficient storage and queries
 */

export interface HierarchyInstanceNode {
  id: string;
  templateNodeId?: string; // Reference to template node if not custom
  name: string;
  type: string;
  level: number;
  parentId?: string;
  isActive: boolean;
  isCustom: boolean; // True if added to template
  isDeleted: boolean; // Soft delete for template nodes
  metadata?: Record<string, any>;
  customFields?: Record<string, any>;
}

@Schema({ timestamps: true, collection: 'hierarchy_instances' })
export class HierarchyInstance extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  projectId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'HierarchyTemplate' })
  templateId?: Types.ObjectId;

  @Prop({ type: Number })
  templateVersion?: number;

  @Prop({ required: true })
  name: string;

  // Flattened structure for efficient queries
  @Prop({ type: [Object], required: true })
  nodes: HierarchyInstanceNode[];

  // Customizations applied to template
  @Prop({
    type: {
      addedNodes: [String],
      removedNodes: [String],
      modifiedNodes: [Object]
    },
    default: {
      addedNodes: [],
      removedNodes: [],
      modifiedNodes: []
    }
  })
  customizations: {
    addedNodes: string[];
    removedNodes: string[];
    modifiedNodes: Array<{
      nodeId: string;
      changes: Record<string, any>;
    }>;
  };

  @Prop({ type: Boolean, default: false })
  isDiverged: boolean; // True if template has been updated since creation

  @Prop({ type: Date })
  lastSyncedAt?: Date;

  @Prop({
    type: {
      totalNodes: Number,
      activeNodes: Number,
      customNodes: Number,
      maxDepth: Number
    }
  })
  statistics: {
    totalNodes: number;
    activeNodes: number;
    customNodes: number;
    maxDepth: number;
  };

  @Prop({ type: String, required: true })
  createdBy: string;

  @Prop({ type: String })
  updatedBy?: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const HierarchyInstanceSchema = SchemaFactory.createForClass(HierarchyInstance);

// Indexes for performance
HierarchyInstanceSchema.index({ projectId: 1 }, { unique: true });
HierarchyInstanceSchema.index({ templateId: 1, templateVersion: 1 });
HierarchyInstanceSchema.index({ 'nodes.id': 1 });
HierarchyInstanceSchema.index({ 'nodes.type': 1, 'nodes.isActive': 1 });
HierarchyInstanceSchema.index({ isDiverged: 1 });

// Methods
HierarchyInstanceSchema.methods.addNode = function(node: HierarchyInstanceNode) {
  this.nodes.push(node);
  this.customizations.addedNodes.push(node.id);
  this.updateStatistics();
};

HierarchyInstanceSchema.methods.removeNode = function(nodeId: string) {
  const nodeIndex = this.nodes.findIndex(n => n.id === nodeId);
  if (nodeIndex > -1) {
    this.nodes[nodeIndex].isDeleted = true;
    this.customizations.removedNodes.push(nodeId);
    this.updateStatistics();
  }
};

HierarchyInstanceSchema.methods.updateNode = function(nodeId: string, changes: Record<string, any>) {
  const node = this.nodes.find(n => n.id === nodeId);
  if (node) {
    Object.assign(node, changes);

    const existing = this.customizations.modifiedNodes.find(m => m.nodeId === nodeId);
    if (existing) {
      Object.assign(existing.changes, changes);
    } else {
      this.customizations.modifiedNodes.push({ nodeId, changes });
    }
  }
};

HierarchyInstanceSchema.methods.updateStatistics = function() {
  this.statistics = {
    totalNodes: this.nodes.length,
    activeNodes: this.nodes.filter(n => n.isActive && !n.isDeleted).length,
    customNodes: this.nodes.filter(n => n.isCustom).length,
    maxDepth: Math.max(...this.nodes.map(n => n.level))
  };
};

HierarchyInstanceSchema.methods.getActiveNodes = function() {
  return this.nodes.filter(n => n.isActive && !n.isDeleted);
};

HierarchyInstanceSchema.methods.getNodesByType = function(type: string) {
  return this.nodes.filter(n => n.type === type && n.isActive && !n.isDeleted);
};

HierarchyInstanceSchema.methods.getChildNodes = function(parentId: string) {
  return this.nodes.filter(n => n.parentId === parentId && n.isActive && !n.isDeleted);
};