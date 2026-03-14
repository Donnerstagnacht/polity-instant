import { useCallback } from 'react'
import { useZero } from '@rocicorp/zero/react'
import { toast } from 'sonner'
import { useTranslation } from '@/features/shared/hooks/use-translation'
import { mutators } from '../mutators'

type EntityType = 'user' | 'group' | 'amendment' | 'event' | 'blog' | 'statement'

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
      } catch (error) {
        console.error('Failed to add hashtag:', error)
        throw error
      }
    },
    [zero]
  )

  const deleteHashtag = useCallback(
    async (args: Parameters<typeof mutators.common.deleteHashtag>[0]) => {
      try {
        await zero.mutate(mutators.common.deleteHashtag(args))
      } catch (error) {
        console.error('Failed to delete hashtag:', error)
        throw error
      }
    },
    [zero]
  )

  // ── Junction link/unlink helpers ───────────────────────────────────
  const linkHashtag = useCallback(
    async (entityType: EntityType, args: { id: string; hashtag_id: string } & Record<string, string>) => {
      const mutatorMap = {
        user: mutators.common.linkUserHashtag,
        group: mutators.common.linkGroupHashtag,
        amendment: mutators.common.linkAmendmentHashtag,
        event: mutators.common.linkEventHashtag,
        blog: mutators.common.linkBlogHashtag,
        statement: mutators.common.linkStatementHashtag,
      } as const
      try {
        // Each mutator expects a specific FK field (user_id, group_id, etc.)
        // which is included in args via Record<string, string>.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mutator: (a: Record<string, string>) => ReturnType<(typeof mutatorMap)[typeof entityType]> = mutatorMap[entityType] as any
        await zero.mutate(mutator(args))
      } catch (error) {
        console.error(`Failed to link ${entityType} hashtag:`, error)
        throw error
      }
    },
    [zero]
  )

  const unlinkHashtag = useCallback(
    async (entityType: EntityType, args: { id: string }) => {
      const mutatorMap = {
        user: mutators.common.unlinkUserHashtag,
        group: mutators.common.unlinkGroupHashtag,
        amendment: mutators.common.unlinkAmendmentHashtag,
        event: mutators.common.unlinkEventHashtag,
        blog: mutators.common.unlinkBlogHashtag,
        statement: mutators.common.unlinkStatementHashtag,
      } as const
      try {
        await zero.mutate(mutatorMap[entityType](args))
      } catch (error) {
        console.error(`Failed to unlink ${entityType} hashtag:`, error)
        throw error
      }
    },
    [zero]
  )

  /**
   * Sync entity hashtags: computes diff between existing junction rows and desired tags,
   * then creates/removes canonical hashtags + junction rows as needed.
   *
   * @param entityType - 'user' | 'group' | 'amendment' | 'event' | 'blog'
   * @param entityId - The entity's ID
   * @param desiredTags - Array of tag strings the entity should have after sync
   * @param existingJunctions - Current junction rows (with nested hashtag) from the query
   * @param allHashtags - All canonical hashtags (for reuse lookup)
   */
  const syncEntityHashtags = useCallback(
    async (
      entityType: EntityType,
      entityId: string,
      desiredTags: string[],
      existingJunctions: Array<{ id: string; hashtag_id: string; hashtag?: { id: string; tag: string } | undefined }>,
      allHashtags: Array<{ id: string; tag: string }>
    ) => {
      try {
        // Build lookup of current tags from junctions
        const currentTagMap = new Map<string, string>() // tag → junction_id
        for (const j of existingJunctions) {
          const tag = j.hashtag?.tag
          if (tag) currentTagMap.set(tag, j.id)
        }

        const desiredSet = new Set(desiredTags)
        const existingTagLookup = new Map(allHashtags.map(h => [h.tag, h.id]))
        const entityField = `${entityType}_id`

        // Remove junctions for tags no longer desired
        for (const [tag, junctionId] of currentTagMap) {
          if (!desiredSet.has(tag)) {
            await unlinkHashtag(entityType, { id: junctionId })
          }
        }

        // Add junctions for new tags
        for (const tag of desiredTags) {
          if (currentTagMap.has(tag)) continue // already linked

          // Ensure canonical hashtag exists
          let hashtagId = existingTagLookup.get(tag)
          if (!hashtagId) {
            hashtagId = crypto.randomUUID()
            await addHashtag({ id: hashtagId, tag })
          }

          // Create junction
          await linkHashtag(entityType, {
            id: crypto.randomUUID(),
            hashtag_id: hashtagId,
            [entityField]: entityId,
          })
        }

        toast.success(t('common.toasts.hashtagsSynced'))
      } catch (error) {
        console.error('Failed to sync hashtags:', error)
        toast.error(t('common.toasts.hashtagSyncFailed'))
        throw error
      }
    },
    [addHashtag, unlinkHashtag, linkHashtag, t]
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
    linkHashtag,
    unlinkHashtag,
    syncEntityHashtags,

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
