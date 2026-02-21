import { useCallback } from 'react'
import { useZero } from '@rocicorp/zero/react'
import { toast } from 'sonner'
import { useTranslation } from '@/hooks/use-translation'
import { mutators } from '../mutators'

/**
 * Action hook for blog mutations.
 * Every function wraps a custom mutator + sonner toast.
 */
export function useBlogActions() {
  const zero = useZero()
  const { t } = useTranslation()

  // ── CRUD ───────────────────────────────────────────────────────────
  const createBlog = useCallback(
    async (args: Parameters<typeof mutators.blogs.create>[0]) => {
      try {
        await zero.mutate(mutators.blogs.create(args))
        toast.success(t('features.blogs.toasts.created'))
      } catch (error) {
        console.error('Failed to create blog:', error)
        toast.error(t('features.blogs.toasts.createFailed', 'Failed to create blog'))
        throw error
      }
    },
    [zero]
  )

  const updateBlog = useCallback(
    async (args: Parameters<typeof mutators.blogs.update>[0]) => {
      try {
        await zero.mutate(mutators.blogs.update(args))
      } catch (error) {
        console.error('Failed to update blog:', error)
        toast.error(t('features.blogs.toasts.updateFailed'))
        throw error
      }
    },
    [zero]
  )

  const deleteBlog = useCallback(
    async (id: string) => {
      try {
        await zero.mutate(mutators.blogs.delete({ id }))
        toast.success(t('features.blogs.toasts.deleted'))
      } catch (error) {
        console.error('Failed to delete blog:', error)
        toast.error(t('features.blogs.toasts.deleteFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Entries ────────────────────────────────────────────────────────
  const createEntry = useCallback(
    async (args: Parameters<typeof mutators.blogs.createEntry>[0]) => {
      try {
        await zero.mutate(mutators.blogs.createEntry(args))
        toast.success(t('features.blogs.toasts.entryCreated'))
      } catch (error) {
        console.error('Failed to create blog entry:', error)
        toast.error(t('features.blogs.toasts.entryCreateFailed'))
        throw error
      }
    },
    [zero]
  )

  const updateEntry = useCallback(
    async (args: Parameters<typeof mutators.blogs.updateEntry>[0]) => {
      try {
        await zero.mutate(mutators.blogs.updateEntry(args))
      } catch (error) {
        console.error('Failed to update blog entry:', error)
        toast.error(t('features.blogs.toasts.entryUpdateFailed'))
        throw error
      }
    },
    [zero]
  )

  const deleteEntry = useCallback(
    async (id: string) => {
      try {
        await zero.mutate(mutators.blogs.deleteEntry({ id }))
        toast.success(t('features.blogs.toasts.entryDeleted'))
      } catch (error) {
        console.error('Failed to delete blog entry:', error)
        toast.error(t('features.blogs.toasts.entryDeleteFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Support Votes ──────────────────────────────────────────────────
  const createSupportVote = useCallback(
    async (args: Parameters<typeof mutators.blogs.createSupportVote>[0]) => {
      try {
        await zero.mutate(mutators.blogs.createSupportVote(args))
        toast.success(t('features.blogs.toasts.supportVoteAdded'))
      } catch (error) {
        console.error('Failed to create support vote:', error)
        toast.error(t('features.blogs.toasts.supportVoteAddFailed'))
        throw error
      }
    },
    [zero]
  )

  const updateSupportVote = useCallback(
    async (args: Parameters<typeof mutators.blogs.updateSupportVote>[0]) => {
      try {
        await zero.mutate(mutators.blogs.updateSupportVote(args))
      } catch (error) {
        console.error('Failed to update support vote:', error)
        toast.error(t('features.blogs.toasts.supportVoteUpdateFailed'))
        throw error
      }
    },
    [zero]
  )

  const deleteSupportVote = useCallback(
    async (id: string) => {
      try {
        await zero.mutate(mutators.blogs.deleteSupportVote({ id }))
        toast.success(t('features.blogs.toasts.supportVoteRemoved'))
      } catch (error) {
        console.error('Failed to delete support vote:', error)
        toast.error(t('features.blogs.toasts.supportVoteRemoveFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Silent Operations (no toasts) ─────────────────────────────────

  /** Update blog without toast — for auto-save scenarios */
  const updateBlogSilent = useCallback(
    async (args: Parameters<typeof mutators.blogs.update>[0]) => {
      await zero.mutate(mutators.blogs.update(args))
    },
    [zero]
  )

  /** Full blog creation orchestration (blog + roles + action rights + entry + hashtags) */
  const createBlogFull = useCallback(
    async (args: {
      blog: Parameters<typeof mutators.blogs.create>[0]
      roles: Array<Parameters<typeof mutators.groups.createRole>[0]>
      actionRights: Array<Parameters<typeof mutators.groups.assignActionRight>[0]>
      entry: Parameters<typeof mutators.blogs.createEntry>[0]
      hashtags?: Array<Parameters<typeof mutators.common.addHashtag>[0]>
    }) => {
      await zero.mutate(mutators.blogs.create(args.blog))
      for (const role of args.roles) {
        await zero.mutate(mutators.groups.createRole(role))
      }
      for (const right of args.actionRights) {
        await zero.mutate(mutators.groups.assignActionRight(right))
      }
      await zero.mutate(mutators.blogs.createEntry(args.entry))
      if (args.hashtags) {
        for (const hashtag of args.hashtags) {
          await zero.mutate(mutators.common.addHashtag(hashtag))
        }
      }
    },
    [zero]
  )

  /** Batch sync hashtags (remove old, add new) without individual toasts */
  const syncBlogHashtags = useCallback(
    async (args: {
      hashtagsToRemove: Array<{ id: string }>
      hashtagsToAdd: Array<Parameters<typeof mutators.common.addHashtag>[0]>
    }) => {
      for (const ht of args.hashtagsToRemove) {
        await zero.mutate(mutators.common.deleteHashtag({ id: ht.id }))
      }
      for (const ht of args.hashtagsToAdd) {
        await zero.mutate(mutators.common.addHashtag(ht))
      }
    },
    [zero]
  )

  /** Subscribe to a blog without toast (caller manages UX) */
  const subscribeToBlog = useCallback(
    async (args: Parameters<typeof mutators.common.subscribe>[0]) => {
      await zero.mutate(mutators.common.subscribe(args))
    },
    [zero]
  )

  /** Unsubscribe from a blog without toast (caller manages UX) */
  const unsubscribeFromBlog = useCallback(
    async (id: string) => {
      await zero.mutate(mutators.common.unsubscribe({ id }))
    },
    [zero]
  )

  /** Send multiple notifications silently (best-effort) */
  const sendNotifications = useCallback(
    async (notifications: Array<Parameters<typeof mutators.notifications.createNotification>[0]>) => {
      for (const n of notifications) {
        try {
          await zero.mutate(mutators.notifications.createNotification(n))
        } catch { /* notification delivery is best-effort */ }
      }
    },
    [zero]
  )

  return {
    // CRUD
    createBlog,
    updateBlog,
    deleteBlog,

    // Entries
    createEntry,
    updateEntry,
    deleteEntry,

    // Support Votes
    createSupportVote,
    updateSupportVote,
    deleteSupportVote,

    // Silent Operations
    updateBlogSilent,
    createBlogFull,
    syncBlogHashtags,
    subscribeToBlog,
    unsubscribeFromBlog,
    sendNotifications,
  }
}
