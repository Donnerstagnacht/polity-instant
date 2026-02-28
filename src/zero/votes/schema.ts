import { z } from 'zod'
import { timestampSchema, nullableTimestampSchema } from '../shared/helpers'

// ============================================
// Amendment Vote Entry Schemas
// ============================================

const baseAmendmentVoteEntrySchema = z.object({
  id: z.string(),
  amendment_id: z.string(),
  user_id: z.string(),
  vote: z.number().nullable(),
  created_at: timestampSchema,
})

export const selectAmendmentVoteEntrySchema = baseAmendmentVoteEntrySchema

export const createAmendmentVoteEntrySchema = baseAmendmentVoteEntrySchema
  .omit({ id: true, created_at: true, user_id: true })
  .extend({ id: z.string() })

export const updateAmendmentVoteEntrySchema = baseAmendmentVoteEntrySchema
  .pick({ vote: true })
  .extend({ id: z.string() })

export const deleteAmendmentVoteEntrySchema = z.object({ id: z.string() })

// ============================================
// Amendment Support Vote Schemas
// ============================================

const baseAmendmentSupportVoteSchema = z.object({
  id: z.string(),
  amendment_id: z.string(),
  user_id: z.string(),
  created_at: timestampSchema,
})

export const selectAmendmentSupportVoteSchema = baseAmendmentSupportVoteSchema

export const createAmendmentSupportVoteSchema = baseAmendmentSupportVoteSchema
  .omit({ id: true, created_at: true, user_id: true })
  .extend({ id: z.string() })

// ============================================
// Amendment Vote Schemas
// ============================================

const baseAmendmentVoteSchema = z.object({
  id: z.string(),
  amendment_id: z.string(),
  user_id: z.string(),
  event_id: z.string().nullable(),
  vote: z.string().nullable(),
  weight: z.number(),
  is_delegate_vote: z.boolean(),
  group_id: z.string().nullable(),
  created_at: timestampSchema,
})

export const selectAmendmentVoteSchema = baseAmendmentVoteSchema

export const createAmendmentVoteSchema = baseAmendmentVoteSchema
  .omit({ id: true, created_at: true, user_id: true })
  .extend({ id: z.string() })

export const deleteAmendmentVoteSchema = z.object({ id: z.string() })

// ============================================
// Amendment Voting Session Schemas
// ============================================

const baseAmendmentVotingSessionSchema = z.object({
  id: z.string(),
  amendment_id: z.string(),
  event_id: z.string().nullable(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  status: z.string().nullable(),
  voting_type: z.string().nullable(),
  majority_type: z.string().nullable(),
  start_time: nullableTimestampSchema,
  end_time: nullableTimestampSchema,
  created_at: timestampSchema,
})

export const selectAmendmentVotingSessionSchema = baseAmendmentVotingSessionSchema

export const createAmendmentVotingSessionSchema = baseAmendmentVotingSessionSchema
  .omit({ id: true, created_at: true })
  .extend({ id: z.string() })

export const updateAmendmentVotingSessionSchema = baseAmendmentVotingSessionSchema
  .pick({ status: true, end_time: true })
  .partial()
  .extend({ id: z.string() })

// ============================================
// Amendment Voting Session Vote Schemas
// ============================================

const baseAmendmentVotingSessionVoteSchema = z.object({
  id: z.string(),
  session_id: z.string(),
  user_id: z.string(),
  vote: z.string().nullable(),
  weight: z.number(),
  is_delegate: z.boolean(),
  created_at: timestampSchema,
})

export const selectAmendmentVotingSessionVoteSchema = baseAmendmentVotingSessionVoteSchema

// ============================================
// Change Request Vote Schemas
// ============================================

const baseChangeRequestVoteSchema = z.object({
  id: z.string(),
  change_request_id: z.string(),
  user_id: z.string(),
  vote: z.string().nullable(),
  created_at: timestampSchema,
})

export const selectChangeRequestVoteSchema = baseChangeRequestVoteSchema

export const createChangeRequestVoteSchema = baseChangeRequestVoteSchema
  .omit({ id: true, created_at: true, user_id: true })
  .extend({ id: z.string() })

// ============================================
// Event Voting Session Schemas
// ============================================

const baseEventVotingSessionSchema = z.object({
  id: z.string(),
  event_id: z.string(),
  agenda_item_id: z.string().nullable(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  status: z.string().nullable(),
  voting_type: z.string().nullable(),
  majority_type: z.string().nullable(),
  start_time: nullableTimestampSchema,
  end_time: nullableTimestampSchema,
  created_at: timestampSchema,
})

export const eventVotingSessionSelectSchema = baseEventVotingSessionSchema
export const eventVotingSessionCreateSchema = baseEventVotingSessionSchema
  .omit({ id: true, created_at: true, start_time: true, end_time: true, status: true })
  .extend({ id: z.string() })
export const eventVotingSessionUpdateSchema = z.object({
  id: z.string(),
  status: z.string().optional(),
  start_time: z.number().optional(),
  end_time: z.number().optional(),
})

// ============================================
// Event Vote Schemas
// ============================================

const baseEventVoteSchema = z.object({
  id: z.string(),
  session_id: z.string(),
  user_id: z.string(),
  vote: z.string().nullable(),
  weight: z.number(),
  is_delegate: z.boolean(),
  created_at: timestampSchema,
})

export const eventVoteSelectSchema = baseEventVoteSchema
export const eventVoteCreateSchema = baseEventVoteSchema
  .omit({ id: true, created_at: true, user_id: true })
  .extend({ id: z.string() })

// ============================================
// Election Vote Schemas
// ============================================

const baseElectionVoteSchema = z.object({
  id: z.string(),
  election_id: z.string(),
  candidate_id: z.string(),
  voter_id: z.string(),
  is_indication: z.boolean(),
  indicated_at: nullableTimestampSchema,
  created_at: timestampSchema,
  updated_at: timestampSchema,
})

export const selectElectionVoteSchema = baseElectionVoteSchema
export const createElectionVoteSchema = baseElectionVoteSchema
  .omit({ id: true, created_at: true, updated_at: true, voter_id: true })
  .extend({ id: z.string() })
export const updateElectionVoteSchema = baseElectionVoteSchema
  .pick({ candidate_id: true, is_indication: true, indicated_at: true })
  .partial()
  .extend({ id: z.string() })
export const deleteElectionVoteSchema = z.object({ id: z.string() })

// ============================================
// Blog Support Vote Schemas
// ============================================

const baseBlogSupportVoteSchema = z.object({
  id: z.string(),
  blog_id: z.string(),
  user_id: z.string(),
  vote: z.number().nullable(),
  created_at: timestampSchema,
})

export const selectBlogSupportVoteSchema = baseBlogSupportVoteSchema

export const createBlogSupportVoteSchema = baseBlogSupportVoteSchema
  .omit({ id: true, created_at: true, user_id: true })
  .extend({ id: z.string() })

export const updateBlogSupportVoteSchema = baseBlogSupportVoteSchema
  .pick({ vote: true })
  .extend({ id: z.string() })

export const deleteBlogSupportVoteSchema = z.object({ id: z.string() })

// ============================================
// Statement Support Vote Schemas
// ============================================

const baseStatementSupportVoteSchema = z.object({
  id: z.string(),
  statement_id: z.string(),
  user_id: z.string(),
  vote: z.number().nullable(),
  created_at: timestampSchema,
})

export const selectStatementSupportVoteSchema = baseStatementSupportVoteSchema

export const createStatementSupportVoteSchema = baseStatementSupportVoteSchema
  .omit({ id: true, created_at: true, user_id: true })
  .extend({ id: z.string() })

export const updateStatementSupportVoteSchema = baseStatementSupportVoteSchema
  .pick({ vote: true })
  .extend({ id: z.string() })

export const deleteStatementSupportVoteSchema = z.object({ id: z.string() })

// ============================================
// Thread Vote Schemas
// ============================================

const baseThreadVoteSchema = z.object({
  id: z.string(),
  thread_id: z.string(),
  user_id: z.string(),
  vote: z.number().nullable(),
  created_at: timestampSchema,
})

export const selectThreadVoteSchema = baseThreadVoteSchema

export const createThreadVoteSchema = baseThreadVoteSchema
  .omit({ id: true, created_at: true })
  .extend({ id: z.string() })

// ============================================
// Comment Vote Schemas
// ============================================

const baseCommentVoteSchema = z.object({
  id: z.string(),
  comment_id: z.string(),
  user_id: z.string(),
  vote: z.number().nullable(),
  created_at: timestampSchema,
})

export const selectCommentVoteSchema = baseCommentVoteSchema

export const createCommentVoteSchema = baseCommentVoteSchema
  .omit({ id: true, created_at: true })
  .extend({ id: z.string() })

export const updateCommentVoteSchema = baseCommentVoteSchema
  .pick({ vote: true })
  .extend({ id: z.string() })

export const deleteCommentVoteSchema = z.object({ id: z.string() })

// ============================================
// Inferred Types
// ============================================

export type AmendmentVoteEntry = z.infer<typeof selectAmendmentVoteEntrySchema>
export type AmendmentSupportVote = z.infer<typeof selectAmendmentSupportVoteSchema>
export type AmendmentVote = z.infer<typeof selectAmendmentVoteSchema>
export type AmendmentVotingSession = z.infer<typeof selectAmendmentVotingSessionSchema>
export type AmendmentVotingSessionVote = z.infer<typeof selectAmendmentVotingSessionVoteSchema>
export type ChangeRequestVote = z.infer<typeof selectChangeRequestVoteSchema>
export type EventVotingSession = z.infer<typeof eventVotingSessionSelectSchema>
export type EventVote = z.infer<typeof eventVoteSelectSchema>
export type ElectionVote = z.infer<typeof selectElectionVoteSchema>
export type BlogSupportVote = z.infer<typeof selectBlogSupportVoteSchema>
export type StatementSupportVote = z.infer<typeof selectStatementSupportVoteSchema>
export type ThreadVote = z.infer<typeof selectThreadVoteSchema>
export type CommentVote = z.infer<typeof selectCommentVoteSchema>
