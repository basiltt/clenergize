import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * Hierarchy Template Entity
 *
 * Instead of cloning entire hierarchies, we use templates that can be referenced.
 * This solves the data duplication problem and allows for consistent updates.
 */

export interface HierarchyNode {
  id: string;
  name: string;
  type: 'entity' | 'subsidiary' | 'location' | 'department' | 'business-unit';
  level: number;
  parentId?: string;
  metadata?: Record<string, any>;
  children?: HierarchyNode[];
}

@Schema({ timestamps: true, collection: 'hierarchy_templates' })
export class HierarchyTemplate extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({
    type: String,
    enum: ['global', 'industry', 'regional', 'custom'],
    default: 'custom'
  })
  templateType: string;

  @Prop({ type: String })
  industry?: string;

  @Prop({ type: String })
  region?: string;

  @Prop({ type: Object, required: true })
  structure: HierarchyNode;

  @Prop({ type: Number, default: 1 })
  version: number;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Organization' })
  organizationId?: Types.ObjectId;

  @Prop({ type: String, required: true })
  createdBy: string;

  @Prop({ type: String })
  updatedBy?: string;

  @Prop({
    type: {
      maxDepth: Number,
      totalNodes: Number,
      allowedTypes: [String]
    }
  })
  constraints?: {
    maxDepth: number;
    totalNodes: number;
    allowedTypes: string[];
  };

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: Number, default: 0 })
  usageCount: number;

  @Prop({ type: Date })
  lastUsedAt?: Date;
}

export const HierarchyTemplateSchema = SchemaFactory.createForClass(HierarchyTemplate);

// Indexes
HierarchyTemplateSchema.index({ name: 1, version: 1 }, { unique: true });
HierarchyTemplateSchema.index({ templateType: 1, isActive: 1 });
HierarchyTemplateSchema.index({ industry: 1, isActive: 1 });
HierarchyTemplateSchema.index({ organizationId: 1 });
HierarchyTemplateSchema.index({ tags: 1 });
HierarchyTemplateSchema.index({ usageCount: -1 });