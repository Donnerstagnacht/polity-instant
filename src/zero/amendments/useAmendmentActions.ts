import { useCallback } from 'react'
import { useZero } from '@rocicorp/zero/react'
import { toast } from 'sonner'
import { useTranslation } from '@/features/shared/hooks/use-translation'
import { mutators } from '../mutators'
import { serverConfirmed } from '../mutate-with-server-check'

function isConnectivityFailure(error: unknown): boolean {
  if (!(error instanceof Error)) return false

  const message = error.message.toLowerCase()
  return (
    message.includes('econnrefused') ||
    message.includes('failed to open database transaction') ||
    message.includes('protocolerror') ||
    message.includes('websocket')
  )
}

/**
 * Action hook for amendment mutations.
 * Every function is a thin wrapper around a custom mutator + sonner toast.
 */
export function useAmendmentActions() {
  const zero = useZero()
  const { t } = useTranslation()

  // ── CRUD ───────────────────────────────────────────────────────────
  const createAmendment = useCallback(
    async (args: Parameters<typeof mutators.amendments.create>[0]) => {
      try {
        const result = zero.mutate(mutators.amendments.create(args))
        await serverConfirmed(result)
        toast.success(t('features.amendments.toasts.created'))
      } catch (error) {
        console.error('Failed to create amendment:', error)
        if (isConnectivityFailure(error)) {
          toast.error('Connection issue while creating amendment. Please check your connection and retry.')
        } else {
          toast.error(t('features.amendments.toasts.createFailed'))
        }
        throw error
      }
    },
    [zero]
  )

  const updateAmendment = useCallback(
    async (args: Parameters<typeof mutators.amendments.update>[0]) => {
      try {
        const result = zero.mutate(mutators.amendments.update(args))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to update amendment:', error)
        toast.error(t('features.amendments.toasts.updateFailed'))
        throw error
      }
    },
    [zero]
  )

  const deleteAmendment = useCallback(
    async (id: string) => {
      try {
        const result = zero.mutate(mutators.amendments.delete({ id }))
        await serverConfirmed(result)
        toast.success(t('features.amendments.toasts.deleted'))
      } catch (error) {
        console.error('Failed to delete amendment:', error)
        toast.error(t('features.amendments.toasts.deleteFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Collaboration ──────────────────────────────────────────────────
  const requestCollaboration = useCallback(
    async (args: Parameters<typeof mutators.amendments.addCollaborator>[0]) => {
      try {
        const result = zero.mutate(mutators.amendments.addCollaborator(args))
        await serverConfirmed(result)
        toast.success(t('features.amendments.toasts.collaborationRequested'))
      } catch (error) {
        console.error('Failed to request collaboration:', error)
        toast.error(t('features.amendments.toasts.collaborationRequestFailed'))
        throw error
      }
    },
    [zero]
  )

  const leaveCollaboration = useCallback(
    async (id: string) => {
      try {
        const result = zero.mutate(mutators.amendments.removeCollaborator({ id }))
        await serverConfirmed(result)
        toast.success(t('features.amendments.toasts.leftCollaboration'))
      } catch (error) {
        console.error('Failed to leave collaboration:', error)
        toast.error(t('features.amendments.toasts.leaveCollaborationFailed'))
        throw error
      }
    },
    [zero]
  )

  const acceptInvitation = useCallback(
    async (id: string) => {
      try {
        const result = zero.mutate(
          mutators.amendments.updateCollaborator({ id, status: 'member' })
        )
        await serverConfirmed(result)
        toast.success(t('features.amendments.toasts.joinedCollaboration'))
      } catch (error) {
        console.error('Failed to accept invitation:', error)
        toast.error(t('features.amendments.toasts.joinCollaborationFailed'))
        throw error
      }
    },
    [zero]
  )

  const updateCollaborator = useCallback(
    async (args: Parameters<typeof mutators.amendments.updateCollaborator>[0]) => {
      try {
        const result = zero.mutate(mutators.amendments.updateCollaborator(args))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to update collaborator:', error)
        toast.error(t('features.amendments.toasts.updateCollaboratorFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Workflow ────────────────────────────────────────────────────────
  const updateEditingMode = useCallback(
    async (id: string, editingMode: string) => {
      try {
        console.info('[useAmendmentActions] Persisting amendment editing mode', {
          amendmentId: id,
          editingMode,
        })
        const result = zero.mutate(
          mutators.amendments.update({ id, editing_mode: editingMode })
        )
        await serverConfirmed(result)
        console.info('[useAmendmentActions] Amendment editing mode persisted', {
          amendmentId: id,
          editingMode,
        })
        toast.success(t('features.amendments.toasts.workflowChanged', { status: editingMode }))
      } catch (error) {
        console.error('[useAmendmentActions] Failed to update editing mode', {
          amendmentId: id,
          editingMode,
          error,
        })
        toast.error(t('features.amendments.toasts.workflowChangeFailed'))
        throw error
      }
    },
    [zero]
  )

  const submitToEvent = useCallback(
    async (id: string, eventId: string) => {
      try {
        const result = zero.mutate(
          mutators.amendments.update({
            id,
            editing_mode: 'suggest_event',
            event_id: eventId,
          })
        )
        await serverConfirmed(result)
        toast.success(t('features.amendments.toasts.submittedToEvent'))
      } catch (error) {
        console.error('Failed to submit to event:', error)
        toast.error(t('features.amendments.toasts.submitToEventFailed'))
        throw error
      }
    },
    [zero]
  )

  const finalizeAmendment = useCallback(
    async (id: string, result: 'passed' | 'rejected') => {
      try {
        const mutationResult = zero.mutate(
          mutators.amendments.update({
            id,
            editing_mode: result,
          })
        )
        await serverConfirmed(mutationResult)
        toast.success(
          result === 'passed'
            ? t('features.amendments.toasts.passed')
            : t('features.amendments.toasts.rejected')
        )
      } catch (error) {
        console.error('Failed to finalize amendment:', error)
        toast.error(t('features.amendments.toasts.finalizeFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Change Requests ────────────────────────────────────────────────
  const createChangeRequest = useCallback(
    async (args: Parameters<typeof mutators.amendments.createChangeRequest>[0]) => {
      try {
        const result = zero.mutate(mutators.amendments.createChangeRequest(args))
        await serverConfirmed(result)
        toast.success(t('features.amendments.toasts.changeRequestCreated'))
      } catch (error) {
        console.error('Failed to create change request:', error)
        toast.error(t('features.amendments.toasts.changeRequestCreateFailed'))
        throw error
      }
    },
    [zero]
  )

  const updateChangeRequest = useCallback(
    async (args: Parameters<typeof mutators.amendments.updateChangeRequest>[0]) => {
      try {
        const result = zero.mutate(mutators.amendments.updateChangeRequest(args))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to update change request:', error)
        toast.error(t('features.amendments.toasts.changeRequestUpdateFailed'))
        throw error
      }
    },
    [zero]
  )

  const voteOnChangeRequest = useCallback(
    async (args: Parameters<typeof mutators.amendments.voteOnChangeRequest>[0]) => {
      try {
        const result = zero.mutate(mutators.amendments.voteOnChangeRequest(args))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to vote on change request:', error)
        toast.error(t('features.amendments.toasts.voteOnChangeRequestFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Support ────────────────────────────────────────────────────────
  const supportAmendment = useCallback(
    async (args: Parameters<typeof mutators.amendments.supportAmendment>[0]) => {
      try {
        const result = zero.mutate(mutators.amendments.supportAmendment(args))
        await serverConfirmed(result)
        toast.success(t('features.amendments.toasts.supportAdded'))
      } catch (error) {
        console.error('Failed to support amendment:', error)
        toast.error(t('features.amendments.toasts.supportAddFailed'))
        throw error
      }
    },
    [zero]
  )

  const createSupportConfirmation = useCallback(
    async (args: Parameters<typeof mutators.amendments.createSupportConfirmation>[0]) => {
      try {
        const result = zero.mutate(mutators.amendments.createSupportConfirmation(args))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to create support confirmation:', error)
        toast.error(t('features.amendments.toasts.supportConfirmationFailed'))
        throw error
      }
    },
    [zero]
  )

  const updateSupportConfirmation = useCallback(
    async (args: Parameters<typeof mutators.amendments.updateSupportConfirmation>[0]) => {
      try {
        const result = zero.mutate(mutators.amendments.updateSupportConfirmation(args))
        await serverConfirmed(result)
        const status = args.status
        toast.success(status === 'confirmed' ? t('features.amendments.toasts.supportConfirmed') : t('features.amendments.toasts.supportDeclined'))
      } catch (error) {
        console.error('Failed to update support confirmation:', error)
        toast.error(t('features.amendments.toasts.supportConfirmationUpdateFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Subscription (delegates to common mutators) ────────────────────
  const subscribe = useCallback(
    async (args: { id: string; amendment_id: string }) => {
      try {
        const result = zero.mutate(
          mutators.common.subscribe({
            id: args.id,
            amendment_id: args.amendment_id,
            user_id: null,
            group_id: null,
            event_id: null,
            blog_id: null,
          })
        )
        await serverConfirmed(result)
        toast.success(t('features.amendments.toasts.subscribed'))
      } catch (error) {
        console.error('Failed to subscribe:', error)
        toast.error(t('features.amendments.toasts.subscribeFailed'))
        throw error
      }
    },
    [zero]
  )

  const unsubscribe = useCallback(
    async (id: string) => {
      try {
        const result = zero.mutate(mutators.common.unsubscribe({ id }))
        await serverConfirmed(result)
        toast.success(t('features.amendments.toasts.unsubscribed'))
      } catch (error) {
        console.error('Failed to unsubscribe:', error)
        toast.error(t('features.amendments.toasts.unsubscribeFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Amendment Paths ────────────────────────────────────────────────
  const createPath = useCallback(
    async (args: Parameters<typeof mutators.amendments.createPath>[0]) => {
      try {
        const result = zero.mutate(mutators.amendments.createPath(args))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to create path:', error)
        toast.error(t('features.amendments.toasts.pathCreateFailed', 'Failed to create path'))
        throw error
      }
    },
    [zero]
  )

  const deletePath = useCallback(
    async (args: Parameters<typeof mutators.amendments.deletePath>[0]) => {
      try {
        const result = zero.mutate(mutators.amendments.deletePath(args))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to delete path:', error)
        toast.error(t('features.amendments.toasts.pathDeleteFailed', 'Failed to delete path'))
        throw error
      }
    },
    [zero]
  )

  const createPathSegment = useCallback(
    async (args: Parameters<typeof mutators.amendments.createPathSegment>[0]) => {
      try {
        const result = zero.mutate(mutators.amendments.createPathSegment(args))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to create path segment:', error)
        toast.error(t('features.amendments.toasts.pathSegmentCreateFailed', 'Failed to create path segment'))
        throw error
      }
    },
    [zero]
  )

  const deletePathSegment = useCallback(
    async (args: Parameters<typeof mutators.amendments.deletePathSegment>[0]) => {
      try {
        const result = zero.mutate(mutators.amendments.deletePathSegment(args))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to delete path segment:', error)
        toast.error(t('features.amendments.toasts.pathSegmentDeleteFailed', 'Failed to delete path segment'))
        throw error
      }
    },
    [zero]
  )

  return {
    // CRUD
    createAmendment,
    updateAmendment,
    deleteAmendment,

    // Collaboration
    requestCollaboration,
    leaveCollaboration,
    acceptInvitation,
    updateCollaborator,

    // Workflow
    updateEditingMode,
    submitToEvent,
    finalizeAmendment,

    // Paths
    createPath,
    deletePath,
    createPathSegment,
    deletePathSegment,

    // Change requests
    createChangeRequest,
    updateChangeRequest,
    voteOnChangeRequest,

    // Support
    supportAmendment,
    createSupportConfirmation,
    updateSupportConfirmation,

    // Subscription
    subscribe,
    unsubscribe,
  }
}
