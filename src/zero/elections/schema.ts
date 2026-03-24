import { z } from 'zod'
import { timestampSchema, nullableTimestampSchema } from '../shared/helpers'

// ============================================
// Election
// ============================================
const baseElectionSchema = z.object({
  id: z.string(),
  agenda_item_id: z.string().nullable(),
  position_id: z.string().nullable(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  status: z.string().nullable(),
  majority_type: z.string().nullable(),
  closing_type: z.string().nullable(),
  closing_duration_seconds: z.number().nullable(),
  closing_end_time: nullableTimestampSchema,
  visibility: z.string(),
  max_votes: z.number(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
})

export const selectElectionSchema = baseElectionSchema
export const createElectionSchema = baseElectionSchema
  .omit({ id: true, created_at: true, updated_at: true })
  .extend({ id: z.string() })
export const updateElectionSchema = baseElectionSchema
  .pick({ title: true, description: true, status: true, majority_type: true, closing_type: true, closing_duration_seconds: true, closing_end_time: true, visibility: true, max_votes: true })
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
// Elector
// ============================================
const baseElectorSchema = z.object({
  id: z.string(),
  election_id: z.string(),
  user_id: z.string(),
  created_at: timestampSchema,
})

export const selectElectorSchema = baseElectorSchema
export const createElectorSchema = baseElectorSchema
  .omit({ id: true, created_at: true })
  .extend({ id: z.string() })
export const deleteElectorSchema = z.object({ id: z.string() })

// ============================================
// Indicative Elector Participation
// ============================================
const baseIndicativeElectorParticipationSchema = z.object({
  id: z.string(),
  election_id: z.string(),
  elector_id: z.string(),
  created_at: timestampSchema,
})

export const selectIndicativeElectorParticipationSchema = baseIndicativeElectorParticipationSchema
export const createIndicativeElectorParticipationSchema = baseIndicativeElectorParticipationSchema
  .omit({ id: true, created_at: true })
  .extend({ id: z.string() })

// ============================================
// Indicative Candidate Selection
// ============================================
const baseIndicativeCandidateSelectionSchema = z.object({
  id: z.string(),
  election_id: z.string(),
  candidate_id: z.string(),
  elector_participation_id: z.string().nullable(),
  created_at: timestampSchema,
})

export const selectIndicativeCandidateSelectionSchema = baseIndicativeCandidateSelectionSchema
export const createIndicativeCandidateSelectionSchema = baseIndicativeCandidateSelectionSchema
  .omit({ id: true, created_at: true })
  .extend({ id: z.string() })

// ============================================
// Final Elector Participation
// ============================================
const baseFinalElectorParticipationSchema = z.object({
  id: z.string(),
  election_id: z.string(),
  elector_id: z.string(),
  created_at: timestampSchema,
})

export const selectFinalElectorParticipationSchema = baseFinalElectorParticipationSchema
export const createFinalElectorParticipationSchema = baseFinalElectorParticipationSchema
  .omit({ id: true, created_at: true })
  .extend({ id: z.string() })

// ============================================
// Final Candidate Selection
// ============================================
const baseFinalCandidateSelectionSchema = z.object({
  id: z.string(),
  election_id: z.string(),
  candidate_id: z.string(),
  elector_participation_id: z.string().nullable(),
  created_at: timestampSchema,
})

export const selectFinalCandidateSelectionSchema = baseFinalCandidateSelectionSchema
export const createFinalCandidateSelectionSchema = baseFinalCandidateSelectionSchema
  .omit({ id: true, created_at: true })
  .extend({ id: z.string() })

// ============================================
// Inferred Types
// ============================================
export type Election = z.infer<typeof selectElectionSchema>
export type ElectionCandidate = z.infer<typeof selectElectionCandidateSchema>
export type Elector = z.infer<typeof selectElectorSchema>
export type IndicativeElectorParticipation = z.infer<typeof selectIndicativeElectorParticipationSchema>
export type IndicativeCandidateSelection = z.infer<typeof selectIndicativeCandidateSelectionSchema>
export type FinalElectorParticipation = z.infer<typeof selectFinalElectorParticipationSchema>
export type FinalCandidateSelection = z.infer<typeof selectFinalCandidateSelectionSchema>
