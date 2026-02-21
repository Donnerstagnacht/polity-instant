import { useCallback } from 'react'
import { useZero } from '@rocicorp/zero/react'
import { toast } from 'sonner'
import { useTranslation } from '@/hooks/use-translation'
import { mutators } from '../mutators'

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
        await zero.mutate(mutators.amendments.create(args))
        toast.success(t('features.amendments.toasts.created'))
      } catch (error) {
        console.error('Failed to create amendment:', error)
        toast.error(t('features.amendments.toasts.createFailed'))
        throw error
      }
    },
    [zero]
  )

  const updateAmendment = useCallback(
    async (args: Parameters<typeof mutators.amendments.update>[0]) => {
      try {
        await zero.mutate(mutators.amendments.update(args))
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
        await zero.mutate(mutators.amendments.delete({ id }))
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
        await zero.mutate(mutators.amendments.addCollaborator(args))
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
        await zero.mutate(mutators.amendments.removeCollaborator({ id }))
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
        await zero.mutate(
          mutators.amendments.updateCollaborator({ id, status: 'member' })
        )
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
        await zero.mutate(mutators.amendments.updateCollaborator(args))
      } catch (error) {
        console.error('Failed to update collaborator:', error)
        toast.error(t('features.amendments.toasts.updateCollaboratorFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Workflow ────────────────────────────────────────────────────────
  const updateWorkflowStatus = useCallback(
    async (id: string, workflowStatus: string) => {
      try {
        await zero.mutate(
          mutators.amendments.update({ id, workflow_status: workflowStatus })
        )
        toast.success(t('features.amendments.toasts.workflowChanged', { status: workflowStatus }))
      } catch (error) {
        console.error('Failed to update workflow status:', error)
        toast.error(t('features.amendments.toasts.workflowChangeFailed'))
        throw error
      }
    },
    [zero]
  )

  const submitToEvent = useCallback(
    async (id: string, eventId: string) => {
      try {
        await zero.mutate(
          mutators.amendments.update({
            id,
            workflow_status: 'event_suggesting',
            event_id: eventId,
          })
        )
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
        await zero.mutate(
          mutators.amendments.update({
            id,
            workflow_status: result,
            status: result === 'passed' ? 'Passed' : 'Rejected',
          })
        )
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

  // ── Voting Sessions ────────────────────────────────────────────────
  const createVotingSession = useCallback(
    async (args: Parameters<typeof mutators.amendments.createVotingSession>[0]) => {
      try {
        await zero.mutate(mutators.amendments.createVotingSession(args))
        toast.success(t('features.amendments.toasts.votingSessionStarted'))
        return args.id
      } catch (error) {
        console.error('Failed to start voting session:', error)
        toast.error(t('features.amendments.toasts.votingSessionStartFailed'))
        throw error
      }
    },
    [zero]
  )

  const updateVotingSession = useCallback(
    async (args: Parameters<typeof mutators.amendments.updateVotingSession>[0]) => {
      try {
        await zero.mutate(mutators.amendments.updateVotingSession(args))
      } catch (error) {
        console.error('Failed to update voting session:', error)
        toast.error(t('features.amendments.toasts.votingSessionUpdateFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Vote Entries ───────────────────────────────────────────────────
  const createVoteEntry = useCallback(
    async (args: Parameters<typeof mutators.amendments.createVoteEntry>[0]) => {
      try {
        await zero.mutate(mutators.amendments.createVoteEntry(args))
      } catch (error) {
        console.error('Failed to create vote entry:', error)
        toast.error(t('features.amendments.toasts.castVoteFailed'))
        throw error
      }
    },
    [zero]
  )

  const updateVoteEntry = useCallback(
    async (args: Parameters<typeof mutators.amendments.updateVoteEntry>[0]) => {
      try {
        await zero.mutate(mutators.amendments.updateVoteEntry(args))
      } catch (error) {
        console.error('Failed to update vote entry:', error)
        toast.error(t('features.amendments.toasts.updateVoteFailed'))
        throw error
      }
    },
    [zero]
  )

  const deleteVoteEntry = useCallback(
    async (id: string) => {
      try {
        await zero.mutate(mutators.amendments.deleteVoteEntry({ id }))
      } catch (error) {
        console.error('Failed to delete vote entry:', error)
        toast.error(t('features.amendments.toasts.removeVoteFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Change Requests ────────────────────────────────────────────────
  const createChangeRequest = useCallback(
    async (args: Parameters<typeof mutators.amendments.createChangeRequest>[0]) => {
      try {
        await zero.mutate(mutators.amendments.createChangeRequest(args))
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
        await zero.mutate(mutators.amendments.updateChangeRequest(args))
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
        await zero.mutate(mutators.amendments.voteOnChangeRequest(args))
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
        await zero.mutate(mutators.amendments.supportAmendment(args))
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
        await zero.mutate(mutators.amendments.createSupportConfirmation(args))
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
        await zero.mutate(mutators.amendments.updateSupportConfirmation(args))
        const status = (args as any).status
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
        await zero.mutate(
          mutators.common.subscribe({
            id: args.id,
            amendment_id: args.amendment_id,
            user_id: '',
            group_id: '',
            event_id: '',
            blog_id: '',
          })
        )
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
        await zero.mutate(mutators.common.unsubscribe({ id }))
        toast.success(t('features.amendments.toasts.unsubscribed'))
      } catch (error) {
        console.error('Failed to unsubscribe:', error)
        toast.error(t('features.amendments.toasts.unsubscribeFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Amendment Votes (direct votes, not voting session entries) ────
  const castAmendmentVote = useCallback(
    async (args: Parameters<typeof mutators.amendments.castAmendmentVote>[0]) => {
      try {
        await zero.mutate(mutators.amendments.castAmendmentVote(args))
      } catch (error) {
        console.error('Failed to cast amendment vote:', error)
        toast.error(t('features.amendments.toasts.voteFailed', 'Failed to cast vote'))
        throw error
      }
    },
    [zero]
  )

  const deleteAmendmentVote = useCallback(
    async (args: Parameters<typeof mutators.amendments.deleteAmendmentVote>[0]) => {
      try {
        await zero.mutate(mutators.amendments.deleteAmendmentVote(args))
      } catch (error) {
        console.error('Failed to delete amendment vote:', error)
        toast.error(t('features.amendments.toasts.voteDeleteFailed', 'Failed to delete vote'))
        throw error
      }
    },
    [zero]
  )

  // ── Amendment Paths ────────────────────────────────────────────────
  const createPath = useCallback(
    async (args: Parameters<typeof mutators.amendments.createPath>[0]) => {
      try {
        await zero.mutate(mutators.amendments.createPath(args))
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
        await zero.mutate(mutators.amendments.deletePath(args))
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
        await zero.mutate(mutators.amendments.createPathSegment(args))
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
        await zero.mutate(mutators.amendments.deletePathSegment(args))
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
    updateWorkflowStatus,
    submitToEvent,
    finalizeAmendment,

    // Voting sessions
    createVotingSession,
    updateVotingSession,

    // Vote entries
    createVoteEntry,
    updateVoteEntry,
    deleteVoteEntry,

    // Amendment votes (direct)
    castAmendmentVote,
    deleteAmendmentVote,

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
