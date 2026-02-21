import { z } from 'zod'
import { timestampSchema, nullableTimestampSchema } from '../shared/helpers'

// ============================================
// Position Schemas
// ============================================

const positionBaseSchema = z.object({
  id: z.string(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  term: z.string().nullable(),
  first_term_start: nullableTimestampSchema,
  scheduled_revote_date: nullableTimestampSchema,
  group_id: z.string(),
  event_id: z.string().nullable(),
  created_at: timestampSchema,
})

export const positionSelectSchema = positionBaseSchema

export const createPositionSchema = positionBaseSchema
  .omit({ id: true, created_at: true })
  .extend({ id: z.string() })

export const updatePositionSchema = positionBaseSchema
  .pick({ title: true, description: true, term: true, first_term_start: true, scheduled_revote_date: true, event_id: true })
  .partial()
  .extend({ id: z.string(), current_holder_id: z.string().nullable().optional() })

export const deletePositionSchema = z.object({ id: z.string() })

// ============================================
// Position Holder History Schemas
// ============================================

const positionHolderHistoryBaseSchema = z.object({
  id: z.string(),
  position_id: z.string(),
  user_id: z.string(),
  start_date: nullableTimestampSchema,
  end_date: nullableTimestampSchema,
  reason: z.string().nullable(),
  created_at: timestampSchema,
})

export const positionHolderHistorySelectSchema = positionHolderHistoryBaseSchema

export const createPositionHolderHistorySchema = positionHolderHistoryBaseSchema
  .omit({ id: true, created_at: true })
  .extend({ id: z.string(), start_date: z.number() })

export const updatePositionHolderHistorySchema = z.object({
  id: z.string(),
  end_date: z.number().optional(),
  reason: z.string().optional(),
})

// ============================================
// Event Position Schemas
// ============================================

const eventPositionBaseSchema = z.object({
  id: z.string(),
  event_id: z.string(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  created_at: timestampSchema,
})

export const eventPositionSelectSchema = eventPositionBaseSchema

export const createEventPositionSchema = eventPositionBaseSchema
  .omit({ id: true, created_at: true })
  .extend({ id: z.string() })

export const updateEventPositionSchema = eventPositionBaseSchema
  .pick({ title: true, description: true })
  .partial()
  .extend({ id: z.string() })

export const deleteEventPositionSchema = z.object({ id: z.string() })

// ============================================
// Event Position Holder Schemas
// ============================================

const eventPositionHolderBaseSchema = z.object({
  id: z.string(),
  position_id: z.string(),
  user_id: z.string(),
  group_id: z.string().nullable(),
  created_at: timestampSchema,
})

export const eventPositionHolderSelectSchema = eventPositionHolderBaseSchema

// ============================================
// Inferred Types
// ============================================

export type Position = z.infer<typeof positionSelectSchema>
export type PositionHolderHistory = z.infer<typeof positionHolderHistorySelectSchema>
export type EventPosition = z.infer<typeof eventPositionSelectSchema>
export type EventPositionHolder = z.infer<typeof eventPositionHolderSelectSchema>
