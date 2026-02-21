import { z } from 'zod'
import { timestampSchema } from '../shared/helpers'

// ============================================
// Event Delegate Schemas
// ============================================

const eventDelegateBaseSchema = z.object({
  id: z.string(),
  event_id: z.string(),
  user_id: z.string(),
  group_id: z.string().nullable(),
  status: z.string().nullable(),
  seat_count: z.number(),
  created_at: timestampSchema,
})

export const eventDelegateSelectSchema = eventDelegateBaseSchema

// ============================================
// Group Delegate Allocation Schemas
// ============================================

const groupDelegateAllocationBaseSchema = z.object({
  id: z.string(),
  event_id: z.string(),
  group_id: z.string().nullable(),
  allocated_seats: z.number(),
  created_at: timestampSchema,
})

export const groupDelegateAllocationSelectSchema = groupDelegateAllocationBaseSchema

// ============================================
// Inferred Types
// ============================================

export type EventDelegate = z.infer<typeof eventDelegateSelectSchema>
export type GroupDelegateAllocation = z.infer<typeof groupDelegateAllocationSelectSchema>
