import { z } from 'zod'
import { timestampSchema, nullableTimestampSchema, jsonSchema } from '../shared/helpers'

// ── event ─────────────────────────────────────────────────────────────
const eventBaseSchema = z.object({
  id: z.string(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  status: z.string().nullable(),
  event_type: z.string().nullable(),
  location_type: z.string().nullable(),
  location_name: z.string().nullable(),
  location_address: z.string().nullable(),
  location_url: z.string().nullable(),
  location_coordinates: z.string().nullable(),
  is_public: z.boolean(),
  visibility: z.string(),
  start_date: nullableTimestampSchema,
  end_date: nullableTimestampSchema,
  timezone: z.string().nullable(),
  capacity: z.number().nullable(),
  participant_count: z.number(),
  agenda_management: z.string().nullable(),
  meeting_type: z.string().nullable(),
  is_recurring: z.boolean(),
  recurrence_pattern: z.string().nullable(),
  recurrence_end_date: nullableTimestampSchema,
  original_event_id: z.string().nullable(),
  cancel_reason: z.string().nullable(),
  cancelled_at: nullableTimestampSchema,
  cancelled_by_id: z.string().nullable(),
  x: z.string().nullable(),
  youtube: z.string().nullable(),
  linkedin: z.string().nullable(),
  website: z.string().nullable(),
  stream_url: z.string().nullable(),
  image_url: z.string().nullable(),
  has_delegates: z.boolean(),
  delegate_count: z.number(),
  delegate_distribution_method: z.string().nullable(),
  delegate_distribution_status: z.string().nullable(),
  delegate_seat_allocation_type: z.string().nullable(),
  total_delegate_seats: z.number().nullable(),
  delegate_quorum_percentage: z.number().nullable(),
  delegate_vote_weight_type: z.string().nullable(),
  delegate_vote_threshold_percentage: z.number().nullable(),
  delegate_accepted_states: jsonSchema.nullable(),
  delegate_finalized_at: nullableTimestampSchema,
  delegate_approval_type: z.string().nullable(),
  delegate_check_mode: z.string().nullable(),
  main_group_delegate_allocation_mode: z.string().nullable(),
  group_id: z.string().nullable(),
  creator_id: z.string(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
})

export const eventSelectSchema = eventBaseSchema
export const eventCreateSchema = eventBaseSchema
  .omit({
    id: true,
    created_at: true,
    updated_at: true,
    participant_count: true,
    delegate_count: true,
    cancelled_at: true,
    cancelled_by_id: true,
    cancel_reason: true,
  })
  .partial()
  .extend({
    id: z.string(),
    title: z.string(),
    group_id: z.string().nullable(),
  })
export const eventUpdateSchema = eventBaseSchema
  .pick({
    title: true,
    description: true,
    status: true,
    event_type: true,
    location_type: true,
    location_name: true,
    location_address: true,
    location_url: true,
    location_coordinates: true,
    is_public: true,
    visibility: true,
    start_date: true,
    end_date: true,
    timezone: true,
    capacity: true,
    agenda_management: true,
    meeting_type: true,
    stream_url: true,
    image_url: true,
  })
  .partial()
  .extend({ id: z.string() })
export const eventDeleteSchema = z.object({ id: z.string() })
export const eventCancelSchema = z.object({
  id: z.string(),
  cancel_reason: z.string(),
})
export type Event = z.infer<typeof eventSelectSchema>

// ── event_participant ─────────────────────────────────────────────────
const eventParticipantBaseSchema = z.object({
  id: z.string(),
  event_id: z.string(),
  user_id: z.string(),
  group_id: z.string().nullable(),
  status: z.string().nullable(),
  role_id: z.string().nullable(),
  visibility: z.string().nullable(),
  created_at: timestampSchema,
})

export const eventParticipantSelectSchema = eventParticipantBaseSchema
export const eventParticipantCreateSchema = eventParticipantBaseSchema
  .omit({ id: true, created_at: true, user_id: true })
  .extend({ id: z.string(), user_id: z.string().optional() })
export const eventParticipantUpdateSchema = eventParticipantBaseSchema
  .pick({ status: true, role_id: true, visibility: true })
  .partial()
  .extend({ id: z.string() })
export const eventParticipantDeleteSchema = z.object({ id: z.string() })
export type EventParticipant = z.infer<typeof eventParticipantSelectSchema>

// ── participant ───────────────────────────────────────────────────────
const participantBaseSchema = z.object({
  id: z.string(),
  event_id: z.string(),
  user_id: z.string(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  role: z.string().nullable(),
  status: z.string().nullable(),
  created_at: timestampSchema,
})

export const participantSelectSchema = participantBaseSchema
export type Participant = z.infer<typeof participantSelectSchema>
