import { table, string, number, boolean } from '@rocicorp/zero'

// ── Amendment votes ───────────────────────────────────────────────────

export const amendmentVoteEntry = table('amendment_vote_entry')
  .columns({
    id: string(),
    amendment_id: string(),
    user_id: string(),
    vote: number().optional(),
    created_at: number(),
  })
  .primaryKey('id')

export const amendmentSupportVote = table('amendment_support_vote')
  .columns({
    id: string(),
    amendment_id: string(),
    user_id: string(),
    created_at: number(),
  })
  .primaryKey('id')

export const amendmentVote = table('amendment_vote')
  .columns({
    id: string(),
    amendment_id: string(),
    user_id: string(),
    event_id: string().optional(),
    vote: string().optional(),
    weight: number(),
    is_delegate_vote: boolean(),
    group_id: string().optional(),
    created_at: number(),
  })
  .primaryKey('id')

export const amendmentVotingSession = table('amendment_voting_session')
  .columns({
    id: string(),
    amendment_id: string(),
    event_id: string().optional(),
    title: string().optional(),
    description: string().optional(),
    status: string().optional(),
    voting_type: string().optional(),
    majority_type: string().optional(),
    start_time: number().optional(),
    end_time: number().optional(),
    created_at: number(),
  })
  .primaryKey('id')

export const amendmentVotingSessionVote = table('amendment_voting_session_vote')
  .columns({
    id: string(),
    session_id: string(),
    user_id: string(),
    vote: string().optional(),
    weight: number(),
    is_delegate: boolean(),
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

// ── Event votes ───────────────────────────────────────────────────────

export const eventVotingSession = table('event_voting_session')
  .columns({
    id: string(),
    event_id: string(),
    agenda_item_id: string().optional(),
    title: string().optional(),
    description: string().optional(),
    status: string().optional(),
    voting_type: string().optional(),
    majority_type: string().optional(),
    start_time: number().optional(),
    end_time: number().optional(),
    created_at: number(),
  })
  .primaryKey('id')

export const eventVote = table('event_vote')
  .columns({
    id: string(),
    session_id: string(),
    user_id: string(),
    vote: string().optional(),
    weight: number(),
    is_delegate: boolean(),
    created_at: number(),
  })
  .primaryKey('id')

// ── Election votes ────────────────────────────────────────────────────

export const electionVote = table('election_vote')
  .columns({
    id: string(),
    election_id: string(),
    candidate_id: string(),
    voter_id: string(),
    is_indication: boolean(),
    indicated_at: number().optional(),
    created_at: number(),
    updated_at: number(),
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
