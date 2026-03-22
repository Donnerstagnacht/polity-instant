import { table, string, number, boolean } from '@rocicorp/zero'

export const election = table('election')
  .columns({
    id: string(),
    agenda_item_id: string().optional(),
    position_id: string().optional(),
    title: string().optional(),
    description: string().optional(),
    status: string().optional(),
    majority_type: string().optional(),
    closing_type: string().optional(),
    closing_duration_seconds: number().optional(),
    closing_end_time: number().optional(),
    is_public: boolean(),
    max_votes: number(),
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

export const elector = table('elector')
  .columns({
    id: string(),
    election_id: string(),
    user_id: string(),
    created_at: number(),
  })
  .primaryKey('id')

export const indicativeElectorParticipation = table('indicative_elector_participation')
  .columns({
    id: string(),
    election_id: string(),
    elector_id: string(),
    created_at: number(),
  })
  .primaryKey('id')

export const indicativeCandidateSelection = table('indicative_candidate_selection')
  .columns({
    id: string(),
    election_id: string(),
    candidate_id: string(),
    elector_participation_id: string().optional(),
    created_at: number(),
  })
  .primaryKey('id')

export const finalElectorParticipation = table('final_elector_participation')
  .columns({
    id: string(),
    election_id: string(),
    elector_id: string(),
    created_at: number(),
  })
  .primaryKey('id')

export const finalCandidateSelection = table('final_candidate_selection')
  .columns({
    id: string(),
    election_id: string(),
    candidate_id: string(),
    elector_participation_id: string().optional(),
    created_at: number(),
  })
  .primaryKey('id')
