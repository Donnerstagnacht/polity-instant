import { defineMutator } from '@rocicorp/zero'
import { zql } from '../schema'
import {
  createStatementSchema,
  updateStatementSchema,
  deleteStatementSchema,
  createStatementSurveySchema,
  deleteStatementSurveySchema,
  createStatementSurveyOptionSchema,
  deleteStatementSurveyOptionSchema,
  createStatementSurveyVoteSchema,
  deleteStatementSurveyVoteSchema,
} from './schema'
import {
  createStatementSupportVoteSchema,
  updateStatementSupportVoteSchema,
  deleteStatementSupportVoteSchema,
} from '../votes/schema'

/** Shared mutators — run on both client and server. Server mutators may override these. */
export const statementSharedMutators = {
  // Create a statement
  create: defineMutator(
    createStatementSchema,
    async ({ tx, ctx: { userID }, args }) => {
      const now = Date.now()
      await tx.mutate.statement.insert({
        ...args,
        user_id: userID,
        upvotes: 0,
        downvotes: 0,
        comment_count: 0,
        updated_at: now,
        created_at: now,
      })
    }
  ),

  // Update a statement
  update: defineMutator(
    updateStatementSchema,
    async ({ tx, args }) => {
      await tx.mutate.statement.update({
        ...args,
        updated_at: Date.now(),
      })
    }
  ),

  // Delete a statement
  delete: defineMutator(
    deleteStatementSchema,
    async ({ tx, args }) => {
      await tx.mutate.statement.delete({ id: args.id })
    }
  ),

  // Survey mutators
  createSurvey: defineMutator(
    createStatementSurveySchema,
    async ({ tx, args }) => {
      const now = Date.now()
      await tx.mutate.statement_survey.insert({
        ...args,
        created_at: now,
      })
    }
  ),

  deleteSurvey: defineMutator(
    deleteStatementSurveySchema,
    async ({ tx, args }) => {
      await tx.mutate.statement_survey.delete({ id: args.id })
    }
  ),

  // Survey option mutators
  createSurveyOption: defineMutator(
    createStatementSurveyOptionSchema,
    async ({ tx, args }) => {
      const now = Date.now()
      await tx.mutate.statement_survey_option.insert({
        ...args,
        vote_count: 0,
        created_at: now,
      })
    }
  ),

  deleteSurveyOption: defineMutator(
    deleteStatementSurveyOptionSchema,
    async ({ tx, args }) => {
      await tx.mutate.statement_survey_option.delete({ id: args.id })
    }
  ),

  // Survey vote mutators
  createSurveyVote: defineMutator(
    createStatementSurveyVoteSchema,
    async ({ tx, ctx: { userID }, args }) => {
      const now = Date.now()
      await tx.mutate.statement_survey_vote.insert({
        ...args,
        user_id: userID,
        created_at: now,
      })
    }
  ),

  deleteSurveyVote: defineMutator(
    deleteStatementSurveyVoteSchema,
    async ({ tx, args }) => {
      await tx.mutate.statement_survey_vote.delete({ id: args.id })
    }
  ),

  // Support vote mutators
  createSupportVote: defineMutator(
    createStatementSupportVoteSchema,
    async ({ tx, ctx: { userID }, args }) => {
      const now = Date.now()
      await tx.mutate.statement_support_vote.insert({
        ...args,
        user_id: userID,
        created_at: now,
      })
    }
  ),

  updateSupportVote: defineMutator(
    updateStatementSupportVoteSchema,
    async ({ tx, args }) => {
      await tx.mutate.statement_support_vote.update(args)
    }
  ),

  deleteSupportVote: defineMutator(
    deleteStatementSupportVoteSchema,
    async ({ tx, args }) => {
      await tx.mutate.statement_support_vote.delete({ id: args.id })
    }
  ),
}
