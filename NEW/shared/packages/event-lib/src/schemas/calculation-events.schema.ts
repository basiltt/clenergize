import { z } from 'zod';
import { createEventSchema } from './base-event.schema';

// ==================== CALCULATION EVENTS ====================

export const EmissionCalculatedEventSchema = createEventSchema(
  'calculation.emission.calculated.v1',
  'Emission',
  z.object({
    calculationId: z.string().uuid(),
    activityId: z.string().uuid(),
    projectId: z.string().uuid(),
    emissionFactorId: z.string().uuid(),
    scope: z.enum(['SCOPE_1', 'SCOPE_2', 'SCOPE_3']),
    category: z.string(),
    quantity: z.number(),
    unit: z.string(),
    emissionFactor: z.number(),
    co2e: z.number(),
    uncertainty: z.number().min(0).max(100).optional(),
    methodology: z.string(),
    calculatedBy: z.string().uuid(),
    timestamp: z.string().datetime(),
  })
);

export const CalculationFailedEventSchema = createEventSchema(
  'calculation.emission.calculation-failed.v1',
  'Emission',
  z.object({
    calculationId: z.string().uuid(),
    activityId: z.string().uuid(),
    errorCode: z.string(),
    errorMessage: z.string(),
    timestamp: z.string().datetime(),
  })
);

// ==================== AGGREGATION EVENTS ====================

export const AggregationStartedEventSchema = createEventSchema(
  'calculation.aggregation.started.v1',
  'Aggregation',
  z.object({
    aggregationId: z.string().uuid(),
    projectId: z.string().uuid(),
    reportingYearId: z.string().uuid(),
    aggregationType: z.enum(['SCOPE', 'CATEGORY', 'HIERARCHY', 'TIME_PERIOD']),
    startedBy: z.string().uuid(),
    timestamp: z.string().datetime(),
  })
);

export const AggregationCompletedEventSchema = createEventSchema(
  'calculation.aggregation.completed.v1',
  'Aggregation',
  z.object({
    aggregationId: z.string().uuid(),
    totalCO2e: z.number(),
    breakdown: z.record(z.number()),
    recordCount: z.number().int().positive(),
    duration: z.number().int().positive(),
    timestamp: z.string().datetime(),
  })
);

// ==================== ROLLUP EVENTS ====================

export const RollupStartedEventSchema = createEventSchema(
  'calculation.rollup.started.v1',
  'Rollup',
  z.object({
    rollupId: z.string().uuid(),
    hierarchyId: z.string().uuid(),
    projectId: z.string().uuid(),
    startedBy: z.string().uuid(),
    timestamp: z.string().datetime(),
  })
);

export const RollupCompletedEventSchema = createEventSchema(
  'calculation.rollup.completed.v1',
  'Rollup',
  z.object({
    rollupId: z.string().uuid(),
    totalNodes: z.number().int().positive(),
    totalEmissions: z.number(),
    duration: z.number().int().positive(),
    timestamp: z.string().datetime(),
  })
);

// ==================== TYPE EXPORTS ====================

export type EmissionCalculatedEvent = z.infer<typeof EmissionCalculatedEventSchema>;
export type CalculationFailedEvent = z.infer<typeof CalculationFailedEventSchema>;
export type AggregationStartedEvent = z.infer<typeof AggregationStartedEventSchema>;
export type AggregationCompletedEvent = z.infer<typeof AggregationCompletedEventSchema>;
export type RollupStartedEvent = z.infer<typeof RollupStartedEventSchema>;
export type RollupCompletedEvent = z.infer<typeof RollupCompletedEventSchema>;

export type CalculationEvent =
  | EmissionCalculatedEvent
  | CalculationFailedEvent
  | AggregationStartedEvent
  | AggregationCompletedEvent
  | RollupStartedEvent
  | RollupCompletedEvent;
