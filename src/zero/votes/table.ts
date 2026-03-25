import { table, string, number } from '@rocicorp/zero'

// ── Vote (amendment votes in agenda context) ──────────────────────────

export const vote = table('vote')
  .columns({
    id: string(),
    agenda_item_id: string().optional(),
    amendment_id: string().optional(),
    title: string().optional(),
    description: string().optional(),
    status: string().optional(),
    majority_type: string().optional(),
    closing_type: string().optional(),
    closing_duration_seconds: number().optional(),
    closing_end_time: number().optional(),
    visibility: string(),
    created_at: number(),
    updated_at: number(),
  })
  .primaryKey('id')

export const voteChoice = table('vote_choice')
  .columns({
    id: string(),
    vote_id: string(),
    label: string().optional(),
    order_index: number().optional(),
    created_at: number(),
  })
  .primaryKey('id')

export const voter = table('voter')
  .columns({
    id: string(),
    vote_id: string(),
    user_id: string(),
    created_at: number(),
  })
  .primaryKey('id')

export const indicativeVoterParticipation = table('indicative_voter_participation')
  .columns({
    id: string(),
    vote_id: string(),
    voter_id: string(),
    created_at: number(),
  })
  .primaryKey('id')

export const indicativeChoiceDecision = table('indicative_choice_decision')
  .columns({
    id: string(),
    vote_id: string(),
    choice_id: string(),
    voter_participation_id: string().optional(),
    created_at: number(),
  })
  .primaryKey('id')

export const finalVoterParticipation = table('final_voter_participation')
  .columns({
    id: string(),
    vote_id: string(),
    voter_id: string(),
    created_at: number(),
  })
  .primaryKey('id')

export const finalChoiceDecision = table('final_choice_decision')
  .columns({
    id: string(),
    vote_id: string(),
    choice_id: string(),
    voter_participation_id: string().optional(),
    created_at: number(),
  })
  .primaryKey('id')

// ── Amendment support votes ───────────────────────────────────────────

export const amendmentSupportVote = table('amendment_support_vote')
  .columns({
    id: string(),
    amendment_id: string(),
    user_id: string(),
    vote: number().optional(),
    created_at: number(),
  })
  .primaryKey('id')

// ── Change request votes ──────────────────────────────────────────────

export const changeRequestVote = table('change_request_vote')
  .columns({
    id: string(),
    change_request_id: string(),
    user_id: string(),
    vote: string().optional(),
    created_at: number(),
  })
  .primaryKey('id')

// ── Blog votes ────────────────────────────────────────────────────────

export const blogSupportVote = table('blog_support_vote')
  .columns({
    id: string(),
    blog_id: string(),
    user_id: string(),
    vote: number().optional(),
    created_at: number(),
  })
  .primaryKey('id')

// ── Statement votes ───────────────────────────────────────────────────

export const statementSupportVote = table('statement_support_vote')
  .columns({
    id: string(),
    statement_id: string(),
    user_id: string(),
    vote: number().optional(),
    created_at: number(),
  })
  .primaryKey('id')

// ── Discussion votes ──────────────────────────────────────────────────

export const threadVote = table('thread_vote')
  .columns({
    id: string(),
    thread_id: string(),
    user_id: string(),
    vote: number().optional(),
    created_at: number(),
  })
  .primaryKey('id')

export const commentVote = table('comment_vote')
  .columns({
    id: string(),
    comment_id: string(),
    user_id: string(),
    vote: number().optional(),
    created_at: number(),
  })
  .primaryKey('id')
