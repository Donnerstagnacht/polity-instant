import { defineMutator } from '@rocicorp/zero'
import { zql } from '../schema'
import {
  createDocumentSchema,
  updateDocumentSchema,
  deleteDocumentSchema,
  createDocumentVersionSchema,
  updateDocumentVersionSchema,
  deleteDocumentVersionSchema,
  createDocumentCollaboratorSchema,
} from './schema'
import {
  createThreadSchema,
  createCommentSchema,
  updateThreadSchema,
  updateCommentSchema,
} from '../discussions/schema'
import {
  createThreadVoteSchema,
  updateThreadVoteSchema,
  deleteThreadVoteSchema,
  createCommentVoteSchema,
  updateCommentVoteSchema,
  deleteCommentVoteSchema,
} from '../votes/schema'

/** Shared mutators — run on both client and server. Server mutators may override these. */
export const documentSharedMutators = {
  // Create a document
  create: defineMutator(
    createDocumentSchema,
    async ({ tx, args }) => {
      const now = Date.now()
      await tx.mutate.document.insert({
        ...args,
        created_at: now,
        updated_at: now,
      })
    }
  ),

  // Update document content
  updateContent: defineMutator(
    updateDocumentSchema,
    async ({ tx, args }) => {
      await tx.mutate.document.update({
        ...args,
        updated_at: Date.now(),
      })
    }
  ),

  createVersion: defineMutator(
    createDocumentVersionSchema,
    async ({ tx, ctx: { userID }, args }) => {
      const now = Date.now()
      await tx.mutate.document_version.insert({
        ...args,
        author_id: userID,
        created_at: now,
      })
    }
  ),

  addCollaborator: defineMutator(
    createDocumentCollaboratorSchema,
    async ({ tx, args }) => {
      const now = Date.now()
      await tx.mutate.document_collaborator.insert({
        ...args,
        created_at: now,
      })
    }
  ),

  createThread: defineMutator(
    createThreadSchema,
    async ({ tx, ctx: { userID }, args }) => {
      const now = Date.now()
      await tx.mutate.thread.insert({
        ...args,
        user_id: userID,
        upvotes: 0,
        downvotes: 0,
        created_at: now,
        updated_at: now,
      })
    }
  ),

  addComment: defineMutator(
    createCommentSchema,
    async ({ tx, ctx: { userID }, args }) => {
      const now = Date.now()
      await tx.mutate.comment.insert({
        ...args,
        user_id: userID,
        upvotes: 0,
        downvotes: 0,
        created_at: now,
        updated_at: now,
      })
    }
  ),

  voteThread: defineMutator(
    createThreadVoteSchema,
    async ({ tx, ctx: { userID }, args }) => {
      const now = Date.now()
      await tx.mutate.thread_vote.insert({
        ...args,
        user_id: userID,
        created_at: now,
      })
    }
  ),

  voteComment: defineMutator(
    createCommentVoteSchema,
    async ({ tx, ctx: { userID }, args }) => {
      const now = Date.now()
      await tx.mutate.comment_vote.insert({
        ...args,
        user_id: userID,
        created_at: now,
      })
    }
  ),

  // Delete a document
  delete: defineMutator(
    deleteDocumentSchema,
    async ({ tx, args }) => {
      await tx.mutate.document.delete({ id: args.id })
    }
  ),

  // Update a document version
  updateVersion: defineMutator(
    updateDocumentVersionSchema,
    async ({ tx, args }) => {
      await tx.mutate.document_version.update(args)
    }
  ),

  // Delete a document version
  deleteVersion: defineMutator(
    deleteDocumentVersionSchema,
    async ({ tx, args }) => {
      await tx.mutate.document_version.delete({ id: args.id })
    }
  ),

  // Update a comment vote
  updateCommentVote: defineMutator(
    updateCommentVoteSchema,
    async ({ tx, args }) => {
      await tx.mutate.comment_vote.update(args)
    }
  ),

  // Delete a comment vote
  deleteCommentVote: defineMutator(
    deleteCommentVoteSchema,
    async ({ tx, args }) => {
      await tx.mutate.comment_vote.delete({ id: args.id })
    }
  ),

  // Update a thread vote
  updateThreadVote: defineMutator(
    updateThreadVoteSchema,
    async ({ tx, args }) => {
      await tx.mutate.thread_vote.update(args)
    }
  ),

  // Delete a thread vote
  deleteThreadVote: defineMutator(
    deleteThreadVoteSchema,
    async ({ tx, args }) => {
      await tx.mutate.thread_vote.delete({ id: args.id })
    }
  ),

  // Update a thread (vote counts)
  updateThread: defineMutator(
    updateThreadSchema,
    async ({ tx, args }) => {
      await tx.mutate.thread.update({
        ...args,
        updated_at: Date.now(),
      })
    }
  ),

  // Update a comment (vote counts)
  updateComment: defineMutator(
    updateCommentSchema,
    async ({ tx, args }) => {
      await tx.mutate.comment.update({
        ...args,
        updated_at: Date.now(),
      })
    }
  ),
}
