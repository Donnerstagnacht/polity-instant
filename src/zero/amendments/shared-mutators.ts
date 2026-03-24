import { defineMutator } from '@rocicorp/zero'
import { zql } from '../schema'
import {
  createAmendmentSchema,
  updateAmendmentSchema,
  deleteAmendmentSchema,
  createAmendmentCollaboratorSchema,
  updateAmendmentCollaboratorSchema,
  deleteAmendmentCollaboratorSchema,
  createAmendmentPathSchema,
  deleteAmendmentPathSchema,
  createAmendmentPathSegmentSchema,
  deleteAmendmentPathSegmentSchema,
  createSupportConfirmationSchema,
  updateSupportConfirmationSchema,
} from './schema'
import {
  createChangeRequestSchema,
  updateChangeRequestSchema,
} from '../change-requests/schema'
import {
  createChangeRequestVoteSchema,
  createAmendmentSupportVoteSchema,
} from '../votes/schema'
import { z } from 'zod'

/** Shared mutators — run on both client and server. Server mutators may override these. */
export const amendmentSharedMutators = {
  create: defineMutator(
    createAmendmentSchema,
    async ({ tx, ctx: { userID }, args }) => {
      const now = Date.now()
      await tx.mutate.amendment.insert({
        ...args,
        created_by_id: userID,
        supporters: 0,
        subscriber_count: 0,
        clone_count: 0,
        change_request_count: 0,
        supporters_required: 0,
        supporters_percentage: 0,
        upvotes: 0,
        downvotes: 0,
        comment_count: 0,
        collaborator_count: 0,
        created_at: now,
        updated_at: now,
      })
    }
  ),

  update: defineMutator(
    updateAmendmentSchema,
    async ({ tx, args }) => {
      await tx.mutate.amendment.update({
        ...args,
        updated_at: Date.now(),
      })
    }
  ),

  delete: defineMutator(
    deleteAmendmentSchema,
    async ({ tx, args }) => {
      await tx.mutate.amendment.delete({ id: args.id })
    }
  ),

  addCollaborator: defineMutator(
    createAmendmentCollaboratorSchema,
    async ({ tx, args }) => {
      const now = Date.now()
      await tx.mutate.amendment_collaborator.insert({
        ...args,
        created_at: now,
      })
    }
  ),

  removeCollaborator: defineMutator(
    deleteAmendmentCollaboratorSchema,
    async ({ tx, args }) => {
      await tx.mutate.amendment_collaborator.delete({ id: args.id })
    }
  ),

  createChangeRequest: defineMutator(
    createChangeRequestSchema,
    async ({ tx, ctx: { userID }, args }) => {
      const now = Date.now()
      await tx.mutate.change_request.insert({
        ...args,
        user_id: userID,
        votes_for: 0,
        votes_against: 0,
        votes_abstain: 0,
        created_at: now,
        updated_at: now,
      })
    }
  ),

  voteOnChangeRequest: defineMutator(
    createChangeRequestVoteSchema,
    async ({ tx, ctx: { userID }, args }) => {
      const now = Date.now()
      await tx.mutate.change_request_vote.insert({
        ...args,
        user_id: userID,
        created_at: now,
      })
    }
  ),

  supportAmendment: defineMutator(
    createAmendmentSupportVoteSchema,
    async ({ tx, ctx: { userID }, args }) => {
      const now = Date.now()
      await tx.mutate.amendment_support_vote.insert({
        ...args,
        user_id: userID,
        created_at: now,
      })
    }
  ),

  // Amendment Path mutators
  createPath: defineMutator(
    createAmendmentPathSchema,
    async ({ tx, args }) => {
      const now = Date.now()
      await tx.mutate.amendment_path.insert({
        ...args,
        created_at: now,
      })
    }
  ),

  deletePath: defineMutator(
    deleteAmendmentPathSchema,
    async ({ tx, args }) => {
      await tx.mutate.amendment_path.delete({ id: args.id })
    }
  ),

  // Amendment Path Segment mutators
  createPathSegment: defineMutator(
    createAmendmentPathSegmentSchema,
    async ({ tx, args }) => {
      const now = Date.now()
      await tx.mutate.amendment_path_segment.insert({
        ...args,
        created_at: now,
      })
    }
  ),

  deletePathSegment: defineMutator(
    deleteAmendmentPathSegmentSchema,
    async ({ tx, args }) => {
      await tx.mutate.amendment_path_segment.delete({ id: args.id })
    }
  ),

  // Support Confirmation mutators
  createSupportConfirmation: defineMutator(
    createSupportConfirmationSchema,
    async ({ tx, args }) => {
      const now = Date.now()
      await tx.mutate.support_confirmation.insert({
        ...args,
        created_at: now,
      })
    }
  ),

  updateSupportConfirmation: defineMutator(
    updateSupportConfirmationSchema,
    async ({ tx, args }) => {
      await tx.mutate.support_confirmation.update(args)
    }
  ),

  // Amendment Collaborator update
  updateCollaborator: defineMutator(
    updateAmendmentCollaboratorSchema,
    async ({ tx, args }) => {
      await tx.mutate.amendment_collaborator.update(args)
    }
  ),

  // Change Request update
  updateChangeRequest: defineMutator(
    updateChangeRequestSchema,
    async ({ tx, args }) => {
      await tx.mutate.change_request.update({
        ...args,
        updated_at: Date.now(),
      })
    }
  ),
}
