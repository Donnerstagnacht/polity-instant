import { defineMutator } from '@rocicorp/zero'
import { zql } from '../schema'
import {
  createHashtagSchema,
  deleteHashtagSchema,
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

export const commonMutators = {
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

  // Add a hashtag
  addHashtag: defineMutator(
    createHashtagSchema,
    async ({ tx, args }) => {
      const now = Date.now()
      await tx.mutate.hashtag.insert({
        ...args,
        post_count: 0,
        created_at: now,
      })
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

  // Delete a hashtag
  deleteHashtag: defineMutator(
    deleteHashtagSchema,
    async ({ tx, args }) => {
      await tx.mutate.hashtag.delete({ id: args.id })
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
