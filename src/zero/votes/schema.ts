import { z } from 'zod'
import { timestampSchema, nullableTimestampSchema } from '../shared/helpers'

// ============================================
// Vote
// ============================================

const baseVoteSchema = z.object({
  id: z.string(),
  agenda_item_id: z.string().nullable(),
  amendment_id: z.string().nullable(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  status: z.string().nullable(),
  majority_type: z.string().nullable(),
  closing_type: z.string().nullable(),
  closing_duration_seconds: z.number().nullable(),
  closing_end_time: nullableTimestampSchema,
  visibility: z.string(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
})

const defaultVoteStatusSchema = z.string().nullable().optional().transform(value => value ?? 'indicative')
const defaultVoteMajorityTypeSchema = z.string().nullable().optional().transform(value => value ?? 'relative')
const defaultVoteClosingTypeSchema = z.string().nullable().optional().transform(value => value ?? 'moderator')
const defaultVoteVisibilitySchema = z.string().optional().transform(value => value ?? 'public')

export const selectVoteSchema = baseVoteSchema
export const createVoteSchema = baseVoteSchema
  .omit({ id: true, created_at: true, updated_at: true, status: true, majority_type: true, closing_type: true, visibility: true })
  .extend({
    id: z.string(),
    status: defaultVoteStatusSchema,
    majority_type: defaultVoteMajorityTypeSchema,
    closing_type: defaultVoteClosingTypeSchema,
    visibility: defaultVoteVisibilitySchema,
  })
export const updateVoteSchema = baseVoteSchema
  .pick({ title: true, description: true, status: true, majority_type: true, closing_type: true, closing_duration_seconds: true, closing_end_time: true, visibility: true })
  .partial()
  .extend({ id: z.string() })
export const deleteVoteSchema = z.object({ id: z.string() })

// ============================================
// Vote Choice
// ============================================

const baseVoteChoiceSchema = z.object({
  id: z.string(),
  vote_id: z.string(),
  label: z.string().nullable(),
  order_index: z.number().nullable(),
  created_at: timestampSchema,
})

export const selectVoteChoiceSchema = baseVoteChoiceSchema
export const createVoteChoiceSchema = baseVoteChoiceSchema
  .omit({ id: true, created_at: true })
  .extend({ id: z.string() })
export const updateVoteChoiceSchema = baseVoteChoiceSchema
  .pick({ label: true, order_index: true })
  .partial()
  .extend({ id: z.string() })
export const deleteVoteChoiceSchema = z.object({ id: z.string() })

// ============================================
// Voter
// ============================================

const baseVoterSchema = z.object({
  id: z.string(),
  vote_id: z.string(),
  user_id: z.string(),
  created_at: timestampSchema,
})

export const selectVoterSchema = baseVoterSchema
export const createVoterSchema = baseVoterSchema
  .omit({ id: true, created_at: true })
  .extend({ id: z.string() })
export const deleteVoterSchema = z.object({ id: z.string() })

// ============================================
// Indicative Voter Participation
// ============================================

const baseIndicativeVoterParticipationSchema = z.object({
  id: z.string(),
  vote_id: z.string(),
  voter_id: z.string(),
  created_at: timestampSchema,
})

export const selectIndicativeVoterParticipationSchema = baseIndicativeVoterParticipationSchema
export const createIndicativeVoterParticipationSchema = baseIndicativeVoterParticipationSchema
  .omit({ id: true, created_at: true })
  .extend({ id: z.string() })

// ============================================
// Indicative Choice Decision
// ============================================

const baseIndicativeChoiceDecisionSchema = z.object({
  id: z.string(),
  vote_id: z.string(),
  choice_id: z.string(),
  voter_participation_id: z.string().nullable(),
  created_at: timestampSchema,
})

export const selectIndicativeChoiceDecisionSchema = baseIndicativeChoiceDecisionSchema
export const createIndicativeChoiceDecisionSchema = baseIndicativeChoiceDecisionSchema
  .omit({ id: true, created_at: true })
  .extend({ id: z.string() })

// ============================================
// Final Voter Participation
// ============================================

const baseFinalVoterParticipationSchema = z.object({
  id: z.string(),
  vote_id: z.string(),
  voter_id: z.string(),
  created_at: timestampSchema,
})

export const selectFinalVoterParticipationSchema = baseFinalVoterParticipationSchema
export const createFinalVoterParticipationSchema = baseFinalVoterParticipationSchema
  .omit({ id: true, created_at: true })
  .extend({ id: z.string() })

// ============================================
// Final Choice Decision
// ============================================

const baseFinalChoiceDecisionSchema = z.object({
  id: z.string(),
  vote_id: z.string(),
  choice_id: z.string(),
  voter_participation_id: z.string().nullable(),
  created_at: timestampSchema,
})

export const selectFinalChoiceDecisionSchema = baseFinalChoiceDecisionSchema
export const createFinalChoiceDecisionSchema = baseFinalChoiceDecisionSchema
  .omit({ id: true, created_at: true })
  .extend({ id: z.string() })

// ============================================
// Amendment Support Vote Schemas
// ============================================

const baseAmendmentSupportVoteSchema = z.object({
  id: z.string(),
  amendment_id: z.string(),
  user_id: z.string(),
  vote: z.number().nullable(),
  created_at: timestampSchema,
})

export const selectAmendmentSupportVoteSchema = baseAmendmentSupportVoteSchema

export const createAmendmentSupportVoteSchema = baseAmendmentSupportVoteSchema
  .omit({ id: true, created_at: true, user_id: true })
  .extend({ id: z.string() })

export const updateAmendmentSupportVoteSchema = baseAmendmentSupportVoteSchema
  .pick({ vote: true })
  .extend({ id: z.string() })

export const deleteAmendmentSupportVoteSchema = z.object({ id: z.string() })

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

export const updateThreadVoteSchema = baseThreadVoteSchema
  .pick({ vote: true })
  .extend({ id: z.string() })

export const deleteThreadVoteSchema = z.object({ id: z.string() })

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

export type Vote = z.infer<typeof selectVoteSchema>
export type VoteChoice = z.infer<typeof selectVoteChoiceSchema>
export type Voter = z.infer<typeof selectVoterSchema>
export type IndicativeVoterParticipation = z.infer<typeof selectIndicativeVoterParticipationSchema>
export type IndicativeChoiceDecision = z.infer<typeof selectIndicativeChoiceDecisionSchema>
export type FinalVoterParticipation = z.infer<typeof selectFinalVoterParticipationSchema>
export type FinalChoiceDecision = z.infer<typeof selectFinalChoiceDecisionSchema>
export type AmendmentSupportVote = z.infer<typeof selectAmendmentSupportVoteSchema>
export type ChangeRequestVote = z.infer<typeof selectChangeRequestVoteSchema>
export type BlogSupportVote = z.infer<typeof selectBlogSupportVoteSchema>
export type StatementSupportVote = z.infer<typeof selectStatementSupportVoteSchema>
export type ThreadVote = z.infer<typeof selectThreadVoteSchema>
export type CommentVote = z.infer<typeof selectCommentVoteSchema>
