import { z } from 'zod'
import { timestampSchema, nullableTimestampSchema } from '../shared/helpers'

// ============================================
// Election
// ============================================
const baseElectionSchema = z.object({
  id: z.string(),
  agenda_item_id: z.string().nullable(),
  position_id: z.string().nullable(),
  amendment_id: z.string().nullable(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  status: z.string().nullable(),
  is_multiple_choice: z.boolean(),
  majority_type: z.string().nullable(),
  max_selections: z.number().nullable(),
  voting_start_time: nullableTimestampSchema,
  voting_end_time: nullableTimestampSchema,
  created_at: timestampSchema,
  updated_at: timestampSchema,
})

export const selectElectionSchema = baseElectionSchema
export const createElectionSchema = baseElectionSchema
  .omit({ id: true, created_at: true, updated_at: true })
  .extend({ id: z.string() })
export const updateElectionSchema = baseElectionSchema
  .pick({ title: true, description: true, status: true, majority_type: true, voting_start_time: true, voting_end_time: true })
  .partial()
  .extend({ id: z.string() })
export const deleteElectionSchema = z.object({ id: z.string() })

// ============================================
// Election Candidate
// ============================================
const baseElectionCandidateSchema = z.object({
  id: z.string(),
  election_id: z.string(),
  user_id: z.string(),
  name: z.string().nullable(),
  description: z.string().nullable(),
  image_url: z.string().nullable(),
  status: z.string(),
  order_index: z.number().nullable(),
  created_at: timestampSchema,
})

export const selectElectionCandidateSchema = baseElectionCandidateSchema
export const createElectionCandidateSchema = baseElectionCandidateSchema
  .omit({ id: true, created_at: true })
  .extend({ id: z.string() })
export const updateElectionCandidateSchema = baseElectionCandidateSchema
  .pick({ name: true, description: true, image_url: true, status: true, order_index: true })
  .partial()
  .extend({ id: z.string() })
export const deleteElectionCandidateSchema = z.object({ id: z.string() })

// ============================================
// Scheduled Election
// ============================================
const baseScheduledElectionSchema = z.object({
  id: z.string(),
  event_id: z.string(),
  position_id: z.string().nullable(),
  title: z.string().nullable(),
  scheduled_date: nullableTimestampSchema,
  status: z.string().nullable(),
  created_at: timestampSchema,
})

export const scheduledElectionSelectSchema = baseScheduledElectionSchema

// ============================================
// Inferred Types
// ============================================
export type Election = z.infer<typeof selectElectionSchema>
export type ElectionCandidate = z.infer<typeof selectElectionCandidateSchema>
export type ScheduledElection = z.infer<typeof scheduledElectionSelectSchema>
