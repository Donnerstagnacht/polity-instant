import { useCallback } from 'react'
import { useZero } from '@rocicorp/zero/react'
import { toast } from 'sonner'
import { useTranslation } from '@/hooks/use-translation'
import { mutators } from '../mutators'

/**
 * Action hook for common cross-domain mutations.
 * Every function wraps a custom mutator + sonner toast.
 */
export function useCommonActions() {
  const zero = useZero()
  const { t } = useTranslation()

  // ── Subscribers ────────────────────────────────────────────────────
  const subscribe = useCallback(
    async (args: Parameters<typeof mutators.common.subscribe>[0]) => {
      try {
        await zero.mutate(mutators.common.subscribe(args))
        toast.success(t('common.toasts.subscribed'))
      } catch (error) {
        console.error('Failed to subscribe:', error)
        toast.error(t('common.toasts.subscribeFailed'))
        throw error
      }
    },
    [zero]
  )

  const unsubscribe = useCallback(
    async (args: Parameters<typeof mutators.common.unsubscribe>[0]) => {
      try {
        await zero.mutate(mutators.common.unsubscribe(args))
        toast.success(t('common.toasts.unsubscribed'))
      } catch (error) {
        console.error('Failed to unsubscribe:', error)
        toast.error(t('common.toasts.unsubscribeFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Hashtags ───────────────────────────────────────────────────────
  const addHashtag = useCallback(
    async (args: Parameters<typeof mutators.common.addHashtag>[0]) => {
      try {
        await zero.mutate(mutators.common.addHashtag(args))
        toast.success(t('common.toasts.hashtagAdded'))
      } catch (error) {
        console.error('Failed to add hashtag:', error)
        toast.error(t('common.toasts.hashtagAddFailed'))
        throw error
      }
    },
    [zero]
  )

  const deleteHashtag = useCallback(
    async (args: Parameters<typeof mutators.common.deleteHashtag>[0]) => {
      try {
        await zero.mutate(mutators.common.deleteHashtag(args))
        toast.success(t('common.toasts.hashtagRemoved'))
      } catch (error) {
        console.error('Failed to delete hashtag:', error)
        toast.error(t('common.toasts.hashtagRemoveFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Links ──────────────────────────────────────────────────────────
  const createLink = useCallback(
    async (args: Parameters<typeof mutators.common.createLink>[0]) => {
      try {
        await zero.mutate(mutators.common.createLink(args))
        toast.success(t('common.toasts.linkCreated'))
      } catch (error) {
        console.error('Failed to create link:', error)
        toast.error(t('common.toasts.linkCreateFailed'))
        throw error
      }
    },
    [zero]
  )

  const deleteLink = useCallback(
    async (args: Parameters<typeof mutators.common.deleteLink>[0]) => {
      try {
        await zero.mutate(mutators.common.deleteLink(args))
        toast.success(t('common.toasts.linkDeleted'))
      } catch (error) {
        console.error('Failed to delete link:', error)
        toast.error(t('common.toasts.linkDeleteFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Reactions ──────────────────────────────────────────────────────
  const createReaction = useCallback(
    async (args: Parameters<typeof mutators.common.createReaction>[0]) => {
      try {
        await zero.mutate(mutators.common.createReaction(args))
        toast.success(t('common.toasts.reactionAdded'))
      } catch (error) {
        console.error('Failed to create reaction:', error)
        toast.error(t('common.toasts.reactionAddFailed'))
        throw error
      }
    },
    [zero]
  )

  const deleteReaction = useCallback(
    async (args: Parameters<typeof mutators.common.deleteReaction>[0]) => {
      try {
        await zero.mutate(mutators.common.deleteReaction(args))
        toast.success(t('common.toasts.reactionRemoved'))
      } catch (error) {
        console.error('Failed to delete reaction:', error)
        toast.error(t('common.toasts.reactionRemoveFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Timeline ───────────────────────────────────────────────────────
  const createTimelineEvent = useCallback(
    async (
      args: Parameters<typeof mutators.common.createTimelineEvent>[0]
    ) => {
      try {
        await zero.mutate(mutators.common.createTimelineEvent(args))
        toast.success(t('common.toasts.timelineEventCreated'))
      } catch (error) {
        console.error('Failed to create timeline event:', error)
        toast.error(t('common.toasts.timelineEventCreateFailed'))
        throw error
      }
    },
    [zero]
  )

  return {
    // Subscribers
    subscribe,
    unsubscribe,

    // Hashtags
    addHashtag,
    deleteHashtag,

    // Links
    createLink,
    deleteLink,

    // Reactions
    createReaction,
    deleteReaction,

    // Timeline
    createTimelineEvent,
  }
}
