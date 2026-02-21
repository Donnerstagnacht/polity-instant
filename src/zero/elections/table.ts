import { table, string, number, boolean } from '@rocicorp/zero'

export const election = table('election')
  .columns({
    id: string(),
    agenda_item_id: string().optional(),
    position_id: string().optional(),
    amendment_id: string().optional(),
    title: string().optional(),
    description: string().optional(),
    status: string().optional(),
    is_multiple_choice: boolean(),
    majority_type: string().optional(),
    max_selections: number().optional(),
    voting_start_time: number().optional(),
    voting_end_time: number().optional(),
    created_at: number(),
    updated_at: number(),
  })
  .primaryKey('id')

export const electionCandidate = table('election_candidate')
  .columns({
    id: string(),
    election_id: string(),
    user_id: string(),
    name: string().optional(),
    description: string().optional(),
    image_url: string().optional(),
    status: string(),
    order_index: number().optional(),
    created_at: number(),
  })
  .primaryKey('id')

export const scheduledElection = table('scheduled_election')
  .columns({
    id: string(),
    event_id: string(),
    position_id: string().optional(),
    title: string().optional(),
    scheduled_date: number().optional(),
    status: string().optional(),
    created_at: number(),
  })
  .primaryKey('id')
