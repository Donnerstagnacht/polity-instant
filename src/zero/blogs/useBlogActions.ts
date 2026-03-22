import { useCallback } from 'react'
import { useZero } from '@rocicorp/zero/react'
import { toast } from 'sonner'
import { useTranslation } from '@/features/shared/hooks/use-translation'
import { mutators } from '../mutators'
import { serverConfirmed } from '../mutate-with-server-check'

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
        const result = zero.mutate(mutators.blogs.create(args))
        await serverConfirmed(result)
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
        const result = zero.mutate(mutators.blogs.update(args))
        await serverConfirmed(result)
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
        const result = zero.mutate(mutators.blogs.delete({ id }))
        await serverConfirmed(result)
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
        const result = zero.mutate(mutators.blogs.createEntry(args))
        await serverConfirmed(result)
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
        const result = zero.mutate(mutators.blogs.updateEntry(args))
        await serverConfirmed(result)
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
        const result = zero.mutate(mutators.blogs.deleteEntry({ id }))
        await serverConfirmed(result)
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
        const result = zero.mutate(mutators.blogs.createSupportVote(args))
        await serverConfirmed(result)
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
        const result = zero.mutate(mutators.blogs.updateSupportVote(args))
        await serverConfirmed(result)
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
        const result = zero.mutate(mutators.blogs.deleteSupportVote({ id }))
        await serverConfirmed(result)
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
      const result = zero.mutate(mutators.blogs.update(args))
      await serverConfirmed(result)
    },
    [zero]
  )

  /** Full blog creation orchestration (blog + roles + action rights + entry) */
  const createBlogFull = useCallback(
    async (args: {
      blog: Parameters<typeof mutators.blogs.create>[0]
      roles: Array<Parameters<typeof mutators.blogs.createRole>[0]>
      actionRights: Array<Parameters<typeof mutators.blogs.assignActionRight>[0]>
      entry: Parameters<typeof mutators.blogs.createEntry>[0]
    }) => {
      const result1 = zero.mutate(mutators.blogs.create(args.blog))
      await serverConfirmed(result1)
      for (const role of args.roles) {
        const result2 = zero.mutate(mutators.blogs.createRole(role))
        await serverConfirmed(result2)
      }
      for (const right of args.actionRights) {
        const result3 = zero.mutate(mutators.blogs.assignActionRight(right))
        await serverConfirmed(result3)
      }
      const result4 = zero.mutate(mutators.blogs.createEntry(args.entry))
      await serverConfirmed(result4)
    },
    [zero]
  )

  /** Subscribe to a blog without toast (caller manages UX) */
  const subscribeToBlog = useCallback(
    async (args: Parameters<typeof mutators.common.subscribe>[0]) => {
      const result = zero.mutate(mutators.common.subscribe(args))
      await serverConfirmed(result)
    },
    [zero]
  )

  /** Unsubscribe from a blog without toast (caller manages UX) */
  const unsubscribeFromBlog = useCallback(
    async (id: string) => {
      const result = zero.mutate(mutators.common.unsubscribe({ id }))
      await serverConfirmed(result)
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
    subscribeToBlog,
    unsubscribeFromBlog,
  }
}
