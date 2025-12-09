import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * Project Entity - Using Hierarchy References Instead of Cloning
 *
 * This implementation solves the hierarchy cloning problem by:
 * 1. Referencing hierarchy templates instead of cloning
 * 2. Using hierarchy instances that link to templates
 * 3. Allowing customization without duplication
 */

export interface ProjectScope {
  scope1: boolean;
  scope2: boolean;
  scope3: {
    upstream: boolean;
    downstream: boolean;
    businessTravel: boolean;
    employeeCommuting: boolean;
    otherIndirect: boolean;
  };
}

export interface ReportingPeriod {
  startDate: Date;
  endDate: Date;
  fiscalYear: number;
  reportingCycle: 'annual' | 'quarterly' | 'monthly';
}

@Schema({ timestamps: true, collection: 'projects' })
export class Project extends Document {
  @Prop({ required: true, unique: true })
  projectCode: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true })
  organizationId: Types.ObjectId;

  // CRITICAL: Reference to hierarchy template instead of cloning
  @Prop({ type: Types.ObjectId, ref: 'HierarchyTemplate' })
  hierarchyTemplateId?: Types.ObjectId;

  // CRITICAL: Reference to hierarchy instance (customized version of template)
  @Prop({ type: Types.ObjectId, ref: 'HierarchyInstance', required: true })
  hierarchyInstanceId: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['carbon-footprint', 'sustainability', 'esg-reporting', 'compliance'],
    required: true
  })
  projectType: string;

  @Prop({ type: Object, required: true })
  reportingPeriod: ReportingPeriod;

  @Prop({ type: Object })
  scope?: ProjectScope;

  @Prop({
    type: String,
    enum: ['draft', 'active', 'in-progress', 'completed', 'archived'],
    default: 'draft'
  })
  status: string;

  @Prop({ type: [String], default: [] })
  modules: string[];

  @Prop({ type: String, required: true })
  createdBy: string;

  @Prop({ type: String })
  updatedBy?: string;

  @Prop({ type: String })
  approvedBy?: string;

  @Prop({ type: Date })
  approvedAt?: Date;

  @Prop({
    type: {
      framework: String,
      standard: String,
      methodology: String
    }
  })
  compliance?: {
    framework?: string; // GRI, TCFD, CDP, etc.
    standard?: string; // ISO 14064, GHG Protocol
    methodology?: string;
  };

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ type: Boolean, default: false })
  isTemplate: boolean;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Date })
  deletedAt?: Date;

  // Progress tracking
  @Prop({
    type: {
      dataCollection: Number,
      calculations: Number,
      verification: Number,
      reporting: Number
    },
    default: {
      dataCollection: 0,
      calculations: 0,
      verification: 0,
      reporting: 0
    }
  })
  progress: {
    dataCollection: number;
    calculations: number;
    verification: number;
    reporting: number;
  };
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

// Indexes
ProjectSchema.index({ projectCode: 1 }, { unique: true });
ProjectSchema.index({ organizationId: 1, status: 1 });
ProjectSchema.index({ hierarchyInstanceId: 1 });
ProjectSchema.index({ hierarchyTemplateId: 1 });
ProjectSchema.index({ createdBy: 1, status: 1 });
ProjectSchema.index({ 'reportingPeriod.fiscalYear': 1 });
ProjectSchema.index({ isDeleted: 1, status: 1 });
ProjectSchema.index({ projectType: 1, status: 1 });