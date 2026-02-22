import { table, string, number, boolean, json } from '@rocicorp/zero';

export const event = table('event')
  .columns({
    id: string(),
    title: string().optional(),
    description: string().optional(),
    status: string().optional(),
    event_type: string().optional(),
    location_type: string().optional(),
    location_name: string().optional(),
    location_address: string().optional(),
    location_url: string().optional(),
    location_coordinates: string().optional(),
    is_public: boolean(),
    visibility: string(),
    start_date: number().optional(),
    end_date: number().optional(),
    timezone: string().optional(),
    capacity: number().optional(),
    participant_count: number(),
    agenda_management: string().optional(),
    meeting_type: string().optional(),
    is_recurring: boolean(),
    recurrence_pattern: string().optional(),
    recurrence_end_date: number().optional(),
    original_event_id: string().optional(),
    cancel_reason: string().optional(),
    cancelled_at: number().optional(),
    cancelled_by_id: string().optional(),
    x: string().optional(),
    youtube: string().optional(),
    linkedin: string().optional(),
    website: string().optional(),
    stream_url: string().optional(),
    image_url: string().optional(),
    has_delegates: boolean(),
    delegate_count: number(),
    delegate_distribution_method: string().optional(),
    delegate_distribution_status: string().optional(),
    delegate_seat_allocation_type: string().optional(),
    total_delegate_seats: number().optional(),
    delegate_quorum_percentage: number().optional(),
    delegate_vote_weight_type: string().optional(),
    delegate_vote_threshold_percentage: number().optional(),
    delegate_accepted_states: json().optional(),
    delegate_finalized_at: number().optional(),
    delegate_approval_type: string().optional(),
    delegate_check_mode: string().optional(),
    main_group_delegate_allocation_mode: string().optional(),
    group_id: string().optional(),
    creator_id: string(),
    created_at: number(),
    updated_at: number(),
  })
  .primaryKey('id');

export const eventParticipant = table('event_participant')
  .columns({
    id: string(),
    event_id: string(),
    user_id: string(),
    group_id: string().optional(),
    status: string().optional(),
    role_id: string().optional(),
    visibility: string().optional(),
    created_at: number(),
  })
  .primaryKey('id');

export const participant = table('participant')
  .columns({
    id: string(),
    event_id: string(),
    user_id: string(),
    name: string().optional(),
    email: string().optional(),
    role: string().optional(),
    status: string().optional(),
    created_at: number(),
  })
  .primaryKey('id');
