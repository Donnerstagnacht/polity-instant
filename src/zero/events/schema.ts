import { z } from 'zod';
import { timestampSchema, nullableTimestampSchema, jsonSchema, jsonNumberArraySchema, jsonStringStringRecordSchema } from '../shared/helpers';

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
  subscriber_count: z.number(),
  election_count: z.number(),
  amendment_count: z.number(),
  open_change_request_count: z.number(),
  agenda_management: z.string().nullable(),
  meeting_type: z.string().nullable(),
  is_bookable: z.boolean(),
  max_bookings: z.number().nullable(),
  is_recurring: z.boolean(),
  recurrence_pattern: z.string().nullable(),
  recurrence_rule: z.string().nullable(),
  recurrence_interval: z.number().nullable(),
  recurrence_days: jsonNumberArraySchema.nullable(),
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
  delegate_accepted_states: jsonStringStringRecordSchema.nullable(),
  delegate_finalized_at: nullableTimestampSchema,
  delegate_approval_type: z.string().nullable(),
  delegate_check_mode: z.string().nullable(),
  main_group_delegate_allocation_mode: z.string().nullable(),
  current_agenda_item_id: z.string().nullable(),
  amendment_deadline: nullableTimestampSchema,
  delegates_nomination_deadline: nullableTimestampSchema,
  group_id: z.string().nullable(),
  creator_id: z.string(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
});

export const eventSelectSchema = eventBaseSchema;
export const eventCreateSchema = eventBaseSchema
  .omit({
    id: true,
    created_at: true,
    updated_at: true,
    participant_count: true,
    subscriber_count: true,
    election_count: true,
    amendment_count: true,
    open_change_request_count: true,
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
    invited_user_ids: z.array(z.string()).optional(),
  });
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
    is_bookable: true,
    max_bookings: true,
    stream_url: true,
    image_url: true,
    is_recurring: true,
    recurrence_pattern: true,
    recurrence_rule: true,
    recurrence_interval: true,
    recurrence_days: true,
    recurrence_end_date: true,
    current_agenda_item_id: true,
  })
  .partial()
  .extend({ id: z.string() });
export const eventDeleteSchema = z.object({ id: z.string() });
export const eventCancelSchema = z.object({
  id: z.string(),
  cancel_reason: z.string(),
});
export type Event = z.infer<typeof eventSelectSchema>;
export type EventUpdateInput = z.infer<typeof eventUpdateSchema>;

// ── event_participant ─────────────────────────────────────────────────
const eventParticipantBaseSchema = z.object({
  id: z.string(),
  event_id: z.string(),
  user_id: z.string(),
  group_id: z.string().nullable(),
  status: z.string().nullable(),
  role_id: z.string().nullable(),
  visibility: z.string().nullable(),
  instance_date: nullableTimestampSchema,
  created_at: timestampSchema,
});

export const eventParticipantSelectSchema = eventParticipantBaseSchema;
export const eventParticipantCreateSchema = eventParticipantBaseSchema
  .omit({ id: true, created_at: true, user_id: true })
  .extend({
    id: z.string(),
    user_id: z.string().optional(),
    instance_date: nullableTimestampSchema.optional(),
  });
export const eventParticipantUpdateSchema = eventParticipantBaseSchema
  .pick({ status: true, role_id: true, visibility: true })
  .partial()
  .extend({ id: z.string() });
export const eventParticipantDeleteSchema = z.object({ id: z.string() });
export type EventParticipant = z.infer<typeof eventParticipantSelectSchema>;

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
});

export const participantSelectSchema = participantBaseSchema;
export type Participant = z.infer<typeof participantSelectSchema>;

// ── event_exception ───────────────────────────────────────────────────
const eventExceptionBaseSchema = z.object({
  id: z.string(),
  parent_event_id: z.string(),
  original_date: timestampSchema,
  action: z.string(),
  new_title: z.string().nullable(),
  new_description: z.string().nullable(),
  new_start_date: nullableTimestampSchema,
  new_end_date: nullableTimestampSchema,
  new_location_name: z.string().nullable(),
  new_location_address: z.string().nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
});

export const eventExceptionSelectSchema = eventExceptionBaseSchema;
export const eventExceptionCreateSchema = eventExceptionBaseSchema
  .omit({ created_at: true, updated_at: true })
  .extend({ id: z.string() });
export const eventExceptionUpdateSchema = eventExceptionBaseSchema
  .pick({
    action: true,
    new_title: true,
    new_description: true,
    new_start_date: true,
    new_end_date: true,
    new_location_name: true,
    new_location_address: true,
  })
  .partial()
  .extend({ id: z.string() });
export const eventExceptionDeleteSchema = z.object({ id: z.string() });
export type EventException = z.infer<typeof eventExceptionSelectSchema>;

// ── meeting booking ───────────────────────────────────────────────────
export const bookMeetingSchema = z.object({
  event_id: z.string(),
  instance_date: nullableTimestampSchema,
});
export const cancelMeetingBookingSchema = z.object({
  event_id: z.string(),
  instance_date: nullableTimestampSchema,
});
