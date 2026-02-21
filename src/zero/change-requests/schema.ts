import { z } from 'zod'
import { timestampSchema, nullableTimestampSchema } from '../shared/helpers'

// ============================================
// Change Request Schemas
// ============================================

const baseChangeRequestSchema = z.object({
  id: z.string(),
  amendment_id: z.string(),
  user_id: z.string(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  status: z.string().nullable(),
  reason: z.string().nullable(),
  source_type: z.string().nullable(),
  source_id: z.string().nullable(),
  source_title: z.string().nullable(),
  votes_for: z.number(),
  votes_against: z.number(),
  votes_abstain: z.number(),
  voting_status: z.string(),
  voting_deadline: nullableTimestampSchema,
  voting_majority_type: z.string().nullable(),
  quorum_required: z.number().nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
})

export const selectChangeRequestSchema = baseChangeRequestSchema

export const createChangeRequestSchema = baseChangeRequestSchema
  .omit({ id: true, created_at: true, updated_at: true, user_id: true, votes_for: true, votes_against: true, votes_abstain: true })
  .extend({ id: z.string() })

export const updateChangeRequestSchema = baseChangeRequestSchema
  .pick({ title: true, description: true, status: true, reason: true, voting_status: true, votes_for: true, votes_against: true, votes_abstain: true })
  .partial()
  .extend({ id: z.string() })

// ============================================
// Inferred Types
// ============================================

export type ChangeRequest = z.infer<typeof selectChangeRequestSchema>
