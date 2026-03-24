import { z } from 'zod'
import { timestampSchema, nullableTimestampSchema } from '../shared/helpers'

// ============================================
// Agenda Item
// ============================================
const baseAgendaItemSchema = z.object({
  id: z.string(),
  event_id: z.string().nullable(),
  amendment_id: z.string().nullable(),
  creator_id: z.string(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  type: z.string().nullable(),
  status: z.string().nullable(),
  forwarding_status: z.string().nullable(),
  order_index: z.number().nullable(),
  duration: z.number().nullable(),
  scheduled_time: z.string().nullable(),
  start_time: nullableTimestampSchema,
  end_time: nullableTimestampSchema,
  activated_at: nullableTimestampSchema,
  completed_at: nullableTimestampSchema,
  majority_type: z.string().nullable(),
  time_limit: z.number().nullable(),
  voting_phase: z.string().nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
})

export const selectAgendaItemSchema = baseAgendaItemSchema
export const createAgendaItemSchema = baseAgendaItemSchema
  .omit({ id: true, created_at: true, updated_at: true, creator_id: true })
  .extend({ id: z.string() })
export const updateAgendaItemSchema = baseAgendaItemSchema
  .pick({ title: true, description: true, type: true, status: true, forwarding_status: true, order_index: true, duration: true, scheduled_time: true, activated_at: true, completed_at: true, start_time: true, end_time: true, event_id: true, amendment_id: true, majority_type: true, time_limit: true, voting_phase: true })
  .partial()
  .extend({ id: z.string() })
export const deleteAgendaItemSchema = z.object({ id: z.string() })
export const reorderAgendaItemsSchema = z.object({
  items: z.array(z.object({ id: z.string(), order_index: z.number() })),
})

// ============================================
// Speaker List
// ============================================
const baseSpeakerListSchema = z.object({
  id: z.string(),
  agenda_item_id: z.string(),
  user_id: z.string(),
  title: z.string().nullable(),
  order_index: z.number().nullable(),
  time: z.number().nullable(),
  completed: z.boolean(),
  start_time: nullableTimestampSchema,
  end_time: nullableTimestampSchema,
  created_at: timestampSchema,
})

export const selectSpeakerListSchema = baseSpeakerListSchema
export const createSpeakerListSchema = baseSpeakerListSchema
  .omit({ id: true, created_at: true })
  .extend({ id: z.string() })
export const deleteSpeakerListSchema = z.object({ id: z.string() })

// ============================================
// Agenda Item Change Request (junction)
// ============================================
const baseAgendaItemChangeRequestSchema = z.object({
  id: z.string(),
  agenda_item_id: z.string(),
  change_request_id: z.string().nullable(),
  vote_id: z.string().nullable(),
  order_index: z.number(),
  is_final_vote: z.boolean(),
  status: z.string(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
})

export const selectAgendaItemChangeRequestSchema = baseAgendaItemChangeRequestSchema
export const createAgendaItemChangeRequestSchema = baseAgendaItemChangeRequestSchema
  .omit({ created_at: true, updated_at: true })
export const updateAgendaItemChangeRequestSchema = baseAgendaItemChangeRequestSchema
  .pick({ vote_id: true, order_index: true, status: true })
  .partial()
  .extend({ id: z.string() })
export const deleteAgendaItemChangeRequestSchema = z.object({ id: z.string() })
export const reorderAgendaItemChangeRequestsSchema = z.object({
  items: z.array(z.object({ id: z.string(), order_index: z.number() })),
})

// Server-only: initialize all CR votes + final vote for an agenda item
export const initializeChangeRequestVotingSchema = z.object({
  amendment_id: z.string(),
  agenda_item_id: z.string(),
  voting_context: z.enum(['event', 'internal']).optional(),
  group_id: z.string().optional(),
})

// Server-only: process the result of a CR vote (accept/reject suggestion + save version)
export const processCRVoteResultSchema = z.object({
  agenda_item_change_request_id: z.string(),
  vote_result: z.enum(['passed', 'rejected', 'tie']),
})

// ============================================
// Inferred Types
// ============================================
export type AgendaItem = z.infer<typeof selectAgendaItemSchema>
export type SpeakerList = z.infer<typeof selectSpeakerListSchema>
export type AgendaItemChangeRequest = z.infer<typeof selectAgendaItemChangeRequestSchema>
