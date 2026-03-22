import { useCallback } from 'react'
import { useZero } from '@rocicorp/zero/react'
import { toast } from 'sonner'
import { useTranslation } from '@/features/shared/hooks/use-translation'
import { mutators } from '../mutators'
import { serverConfirmed } from '../mutate-with-server-check'

/**
 * Action hook for document mutations.
 * Every function is a thin wrapper around a custom mutator + sonner toast.
 */
export function useDocumentActions() {
  const zero = useZero()
  const { t } = useTranslation()

  // ── CRUD ───────────────────────────────────────────────────────────
  const createDocument = useCallback(
    async (args: Parameters<typeof mutators.documents.create>[0]) => {
      try {
        const result = zero.mutate(mutators.documents.create(args))
        await serverConfirmed(result)
        toast.success(t('features.documents.toasts.created'))
      } catch (error) {
        console.error('Failed to create document:', error)
        toast.error(t('features.documents.toasts.createFailed', 'Failed to create document'))
        throw error
      }
    },
    [zero]
  )

  const updateDocument = useCallback(
    async (args: Parameters<typeof mutators.documents.updateContent>[0]) => {
      try {
        const result = zero.mutate(mutators.documents.updateContent(args))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to update document:', error)
        toast.error(t('features.documents.toasts.updateFailed'))
        throw error
      }
    },
    [zero]
  )

  const deleteDocument = useCallback(
    async (id: string) => {
      try {
        const result = zero.mutate(mutators.documents.delete({ id }))
        await serverConfirmed(result)
        toast.success(t('features.documents.toasts.deleted'))
      } catch (error) {
        console.error('Failed to delete document:', error)
        toast.error(t('features.documents.toasts.deleteFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Versions ───────────────────────────────────────────────────────
  const createVersion = useCallback(
    async (args: Parameters<typeof mutators.documents.createVersion>[0]) => {
      try {
        const result = zero.mutate(mutators.documents.createVersion(args))
        await serverConfirmed(result)
        toast.success(t('features.documents.toasts.versionCreated'))
      } catch (error) {
        console.error('Failed to create version:', error)
        toast.error(t('features.documents.toasts.versionCreateFailed'))
        throw error
      }
    },
    [zero]
  )

  const updateVersion = useCallback(
    async (args: Parameters<typeof mutators.documents.updateVersion>[0]) => {
      try {
        const result = zero.mutate(mutators.documents.updateVersion(args))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to update version:', error)
        toast.error(t('features.documents.toasts.versionUpdateFailed'))
        throw error
      }
    },
    [zero]
  )

  const deleteVersion = useCallback(
    async (id: string) => {
      try {
        const result = zero.mutate(mutators.documents.deleteVersion({ id }))
        await serverConfirmed(result)
        toast.success(t('features.documents.toasts.versionDeleted'))
      } catch (error) {
        console.error('Failed to delete version:', error)
        toast.error(t('features.documents.toasts.versionDeleteFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Threads ────────────────────────────────────────────────────────
  const createThread = useCallback(
    async (args: Parameters<typeof mutators.documents.createThread>[0]) => {
      try {
        const result = zero.mutate(mutators.documents.createThread(args))
        await serverConfirmed(result)
        toast.success(t('features.documents.toasts.threadCreated'))
      } catch (error) {
        console.error('Failed to create thread:', error)
        toast.error(t('features.documents.toasts.threadCreateFailed'))
        throw error
      }
    },
    [zero]
  )

  const voteThread = useCallback(
    async (args: Parameters<typeof mutators.documents.voteThread>[0]) => {
      try {
        const result = zero.mutate(mutators.documents.voteThread(args))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to vote on thread:', error)
        toast.error(t('features.documents.toasts.voteThreadFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Comments ───────────────────────────────────────────────────────
  const addComment = useCallback(
    async (args: Parameters<typeof mutators.documents.addComment>[0]) => {
      try {
        const result = zero.mutate(mutators.documents.addComment(args))
        await serverConfirmed(result)
        toast.success(t('features.documents.toasts.commentAdded'))
      } catch (error) {
        console.error('Failed to add comment:', error)
        toast.error(t('features.documents.toasts.commentAddFailed'))
        throw error
      }
    },
    [zero]
  )

  const voteComment = useCallback(
    async (args: Parameters<typeof mutators.documents.voteComment>[0]) => {
      try {
        const result = zero.mutate(mutators.documents.voteComment(args))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to vote on comment:', error)
        toast.error(t('features.documents.toasts.voteCommentFailed'))
        throw error
      }
    },
    [zero]
  )

  const updateCommentVote = useCallback(
    async (args: Parameters<typeof mutators.documents.updateCommentVote>[0]) => {
      try {
        const result = zero.mutate(mutators.documents.updateCommentVote(args))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to update comment vote:', error)
        toast.error(t('features.documents.toasts.updateCommentVoteFailed'))
        throw error
      }
    },
    [zero]
  )

  const deleteCommentVote = useCallback(
    async (id: string) => {
      try {
        const result = zero.mutate(mutators.documents.deleteCommentVote({ id }))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to delete comment vote:', error)
        toast.error(t('features.documents.toasts.deleteCommentVoteFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Collaboration ──────────────────────────────────────────────────
  const addCollaborator = useCallback(
    async (args: Parameters<typeof mutators.documents.addCollaborator>[0]) => {
      try {
        const result = zero.mutate(mutators.documents.addCollaborator(args))
        await serverConfirmed(result)
        toast.success(t('features.documents.toasts.collaboratorAdded'))
      } catch (error) {
        console.error('Failed to add collaborator:', error)
        toast.error(t('features.documents.toasts.collaboratorAddFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Thread vote management ─────────────────────────────────────────
  const updateThreadVote = useCallback(
    async (args: Parameters<typeof mutators.documents.updateThreadVote>[0]) => {
      try {
        const result = zero.mutate(mutators.documents.updateThreadVote(args))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to update thread vote:', error)
        toast.error(t('features.documents.toasts.voteThreadFailed'))
        throw error
      }
    },
    [zero]
  )

  const deleteThreadVote = useCallback(
    async (id: string) => {
      try {
        const result = zero.mutate(mutators.documents.deleteThreadVote({ id }))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to delete thread vote:', error)
        toast.error(t('features.documents.toasts.voteThreadFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Thread/Comment count updates ───────────────────────────────────
  const updateThread = useCallback(
    async (args: Parameters<typeof mutators.documents.updateThread>[0]) => {
      try {
        const result = zero.mutate(mutators.documents.updateThread(args))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to update thread:', error)
        throw error
      }
    },
    [zero]
  )

  const updateComment = useCallback(
    async (args: Parameters<typeof mutators.documents.updateComment>[0]) => {
      try {
        const result = zero.mutate(mutators.documents.updateComment(args))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to update comment:', error)
        throw error
      }
    },
    [zero]
  )

  return {
    // CRUD
    createDocument,
    updateDocument,
    deleteDocument,

    // Versions
    createVersion,
    updateVersion,
    deleteVersion,

    // Threads
    createThread,
    voteThread,
    updateThreadVote,
    deleteThreadVote,
    updateThread,

    // Comments
    addComment,
    voteComment,
    updateCommentVote,
    deleteCommentVote,
    updateComment,

    // Collaboration
    addCollaborator,
  }
}
