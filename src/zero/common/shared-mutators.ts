import { defineMutator } from '@rocicorp/zero'
import { zql } from '../schema'
import {
  createHashtagSchema,
  deleteHashtagSchema,
  createUserHashtagSchema,
  createGroupHashtagSchema,
  createAmendmentHashtagSchema,
  createEventHashtagSchema,
  createBlogHashtagSchema,
  createStatementHashtagSchema,
  deleteJunctionHashtagSchema,
  createLinkSchema,
  deleteLinkSchema,
  createReactionSchema,
  deleteReactionSchema,
  createTimelineEventSchema,
} from './schema'
import {
  createSubscriberSchema,
  deleteSubscriberSchema,
} from '../network/schema'

/** Shared mutators — run on both client and server. Server mutators may override these. */
export const commonSharedMutators = {
  // Subscribe to an entity
  subscribe: defineMutator(
    createSubscriberSchema,
    async ({ tx, ctx: { userID }, args }) => {
      const now = Date.now()
      await tx.mutate.subscriber.insert({
        ...args,
        subscriber_id: userID,
        created_at: now,
      })
    }
  ),

  // Unsubscribe from an entity
  unsubscribe: defineMutator(
    deleteSubscriberSchema,
    async ({ tx, args }) => {
      await tx.mutate.subscriber.delete({ id: args.id })
    }
  ),

  // Add a canonical hashtag
  addHashtag: defineMutator(
    createHashtagSchema,
    async ({ tx, args }) => {
      const now = Date.now()
      await tx.mutate.hashtag.insert({
        ...args,
        created_at: now,
      })
    }
  ),

  // Delete a canonical hashtag
  deleteHashtag: defineMutator(
    deleteHashtagSchema,
    async ({ tx, args }) => {
      await tx.mutate.hashtag.delete({ id: args.id })
    }
  ),

  // ── Junction table mutators ────────────────────────────────────────

  linkUserHashtag: defineMutator(
    createUserHashtagSchema,
    async ({ tx, args }) => {
      const now = Date.now()
      await tx.mutate.user_hashtag.insert({ ...args, created_at: now })
    }
  ),

  unlinkUserHashtag: defineMutator(
    deleteJunctionHashtagSchema,
    async ({ tx, args }) => {
      await tx.mutate.user_hashtag.delete({ id: args.id })
    }
  ),

  linkGroupHashtag: defineMutator(
    createGroupHashtagSchema,
    async ({ tx, args }) => {
      const now = Date.now()
      await tx.mutate.group_hashtag.insert({ ...args, created_at: now })
    }
  ),

  unlinkGroupHashtag: defineMutator(
    deleteJunctionHashtagSchema,
    async ({ tx, args }) => {
      await tx.mutate.group_hashtag.delete({ id: args.id })
    }
  ),

  linkAmendmentHashtag: defineMutator(
    createAmendmentHashtagSchema,
    async ({ tx, args }) => {
      const now = Date.now()
      await tx.mutate.amendment_hashtag.insert({ ...args, created_at: now })
    }
  ),

  unlinkAmendmentHashtag: defineMutator(
    deleteJunctionHashtagSchema,
    async ({ tx, args }) => {
      await tx.mutate.amendment_hashtag.delete({ id: args.id })
    }
  ),

  linkEventHashtag: defineMutator(
    createEventHashtagSchema,
    async ({ tx, args }) => {
      const now = Date.now()
      await tx.mutate.event_hashtag.insert({ ...args, created_at: now })
    }
  ),

  unlinkEventHashtag: defineMutator(
    deleteJunctionHashtagSchema,
    async ({ tx, args }) => {
      await tx.mutate.event_hashtag.delete({ id: args.id })
    }
  ),

  linkBlogHashtag: defineMutator(
    createBlogHashtagSchema,
    async ({ tx, args }) => {
      const now = Date.now()
      await tx.mutate.blog_hashtag.insert({ ...args, created_at: now })
    }
  ),

  unlinkBlogHashtag: defineMutator(
    deleteJunctionHashtagSchema,
    async ({ tx, args }) => {
      await tx.mutate.blog_hashtag.delete({ id: args.id })
    }
  ),

  linkStatementHashtag: defineMutator(
    createStatementHashtagSchema,
    async ({ tx, args }) => {
      const now = Date.now()
      await tx.mutate.statement_hashtag.insert({ ...args, created_at: now })
    }
  ),

  unlinkStatementHashtag: defineMutator(
    deleteJunctionHashtagSchema,
    async ({ tx, args }) => {
      await tx.mutate.statement_hashtag.delete({ id: args.id })
    }
  ),

  // Create a link
  createLink: defineMutator(
    createLinkSchema,
    async ({ tx, args }) => {
      const now = Date.now()
      await tx.mutate.link.insert({
        ...args,
        created_at: now,
      })
    }
  ),

  // Create a reaction
  createReaction: defineMutator(
    createReactionSchema,
    async ({ tx, ctx: { userID }, args }) => {
      const now = Date.now()
      await tx.mutate.reaction.insert({
        ...args,
        user_id: userID,
        created_at: now,
      })
    }
  ),

  // NOTE: server-only mutator — should be called from server context only
  createTimelineEvent: defineMutator(
    createTimelineEventSchema,
    async ({ tx, args }) => {
      const now = Date.now()
      await tx.mutate.timeline_event.insert({
        ...args,
        created_at: now,
      })
    }
  ),

  // Delete a link
  deleteLink: defineMutator(
    deleteLinkSchema,
    async ({ tx, args }) => {
      await tx.mutate.link.delete({ id: args.id })
    }
  ),

  // Delete a reaction
  deleteReaction: defineMutator(
    deleteReactionSchema,
    async ({ tx, args }) => {
      await tx.mutate.reaction.delete({ id: args.id })
    }
  ),
}
