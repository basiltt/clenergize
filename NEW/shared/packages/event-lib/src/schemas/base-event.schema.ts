import { z } from 'zod';

/**
 * Base schema for all domain events
 * All event schemas should extend this base schema
 */
export const BaseEventSchema = z.object({
  id: z.string().uuid(),
  type: z.string().regex(/^[a-z-]+\.[a-z-]+\.[a-z-]+(\.v\d+)?$/),
  version: z.string().default('1.0.0'),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.string().min(1),
  userId: z.string().uuid().optional(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
});

export type BaseEventType = z.infer<typeof BaseEventSchema>;

/**
 * Helper function to create an event schema
 * @param eventType The event type (e.g., 'identity.user.created.v1')
 * @param aggregateType The aggregate type (e.g., 'User')
 * @param dataSchema The Zod schema for the event's data payload
 */
export function createEventSchema<T extends z.ZodTypeAny>(
  eventType: string,
  aggregateType: string,
  dataSchema: T
) {
  return BaseEventSchema.extend({
    type: z.literal(eventType),
    aggregateType: z.literal(aggregateType),
    data: dataSchema,
  });
}
