import { table, string, number, boolean } from '@rocicorp/zero'

export const agendaItem = table('agenda_item')
  .columns({
    id: string(),
    event_id: string().optional(),
    amendment_id: string().optional(),
    creator_id: string(),
    title: string().optional(),
    description: string().optional(),
    type: string().optional(),
    status: string().optional(),
    forwarding_status: string().optional(),
    order_index: number().optional(),
    duration: number().optional(),
    scheduled_time: string().optional(),
    start_time: number().optional(),
    end_time: number().optional(),
    activated_at: number().optional(),
    completed_at: number().optional(),
    majority_type: string().optional(),
    time_limit: number().optional(),
    voting_phase: string().optional(),
    created_at: number(),
    updated_at: number(),
  })
  .primaryKey('id')

export const speakerList = table('speaker_list')
  .columns({
    id: string(),
    agenda_item_id: string(),
    user_id: string(),
    title: string().optional(),
    order_index: number().optional(),
    time: number().optional(),
    completed: boolean(),
    start_time: number().optional(),
    end_time: number().optional(),
    created_at: number(),
  })
  .primaryKey('id')

export const agendaItemChangeRequest = table('agenda_item_change_request')
  .columns({
    id: string(),
    agenda_item_id: string(),
    change_request_id: string().optional(),
    vote_id: string().optional(),
    order_index: number(),
    is_final_vote: boolean(),
    status: string(),
    created_at: number(),
    updated_at: number(),
  })
  .primaryKey('id')
