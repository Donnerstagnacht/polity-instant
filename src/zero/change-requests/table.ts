import { table, string, number } from '@rocicorp/zero'

export const changeRequest = table('change_request')
  .columns({
    id: string(),
    amendment_id: string(),
    user_id: string(),
    title: string().optional(),
    description: string().optional(),
    status: string().optional(),
    reason: string().optional(),
    source_type: string().optional(),
    source_id: string().optional(),
    source_title: string().optional(),
    votes_for: number(),
    votes_against: number(),
    votes_abstain: number(),
    voting_status: string(),
    voting_deadline: number().optional(),
    voting_majority_type: string().optional(),
    quorum_required: number().optional(),
    created_at: number(),
    updated_at: number(),
  })
  .primaryKey('id')
