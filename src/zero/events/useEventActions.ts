import { useCallback } from 'react'
import { useZero } from '@rocicorp/zero/react'
import { toast } from 'sonner'
import { useTranslation } from '@/hooks/use-translation'
import { mutators } from '../mutators'

/**
 * Action hook for event mutations.
 * Every function is a thin wrapper around a custom mutator + sonner toast.
 */
export function useEventActions() {
  const zero = useZero()
  const { t } = useTranslation()

  // ── CRUD ───────────────────────────────────────────────────────────
  const createEvent = useCallback(
    async (args: Parameters<typeof mutators.events.create>[0]) => {
      try {
        await zero.mutate(mutators.events.create(args))
        toast.success(t('features.events.toasts.created'))
      } catch (error) {
        console.error('Failed to create event:', error)
        toast.error(t('features.events.toasts.createFailed'))
        throw error
      }
    },
    [zero]
  )

  const updateEvent = useCallback(
    async (args: Parameters<typeof mutators.events.update>[0]) => {
      try {
        await zero.mutate(mutators.events.update(args))
      } catch (error) {
        console.error('Failed to update event:', error)
        toast.error(t('features.events.toasts.updateFailed'))
        throw error
      }
    },
    [zero]
  )

  const cancelEvent = useCallback(
    async (args: Parameters<typeof mutators.events.cancel>[0]) => {
      try {
        await zero.mutate(mutators.events.cancel(args))
        toast.success(t('features.events.toasts.cancelled'))
      } catch (error) {
        console.error('Failed to cancel event:', error)
        toast.error(t('features.events.toasts.cancelFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Participation ──────────────────────────────────────────────────
  const joinEvent = useCallback(
    async (args: Parameters<typeof mutators.events.joinEvent>[0]) => {
      try {
        await zero.mutate(mutators.events.joinEvent(args))
        toast.success(t('features.events.toasts.joined'))
      } catch (error) {
        console.error('Failed to join event:', error)
        toast.error(t('features.events.toasts.joinFailed'))
        throw error
      }
    },
    [zero]
  )

  const inviteParticipant = useCallback(
    async (args: Parameters<typeof mutators.events.inviteParticipant>[0]) => {
      try {
        await zero.mutate(mutators.events.inviteParticipant(args))
        toast.success(t('features.events.toasts.participantInvited'))
      } catch (error) {
        console.error('Failed to invite participant:', error)
        toast.error(t('features.events.toasts.inviteFailed'))
        throw error
      }
    },
    [zero]
  )

  const leaveEvent = useCallback(
    async (args: Parameters<typeof mutators.events.leaveEvent>[0]) => {
      try {
        await zero.mutate(mutators.events.leaveEvent(args))
        toast.success(t('features.events.toasts.left'))
      } catch (error) {
        console.error('Failed to leave event:', error)
        toast.error(t('features.events.toasts.leaveFailed'))
        throw error
      }
    },
    [zero]
  )

  const updateParticipant = useCallback(
    async (args: Parameters<typeof mutators.events.updateParticipant>[0]) => {
      try {
        await zero.mutate(mutators.events.updateParticipant(args))
      } catch (error) {
        console.error('Failed to update participant:', error)
        toast.error(t('features.events.toasts.updateParticipantFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Voting ─────────────────────────────────────────────────────────
  const finalizeAgendaItem = useCallback(
    async (args: Parameters<typeof mutators.events.finalizeAgendaItem>[0]) => {
      try {
        await zero.mutate(mutators.events.finalizeAgendaItem(args))
        toast.success(t('features.events.toasts.agendaItemFinalized'))
      } catch (error) {
        console.error('Failed to finalize agenda item:', error)
        toast.error(t('features.events.toasts.agendaItemFinalizeFailed'))
        throw error
      }
    },
    [zero]
  )

  const castVote = useCallback(
    async (args: Parameters<typeof mutators.events.castVote>[0]) => {
      try {
        await zero.mutate(mutators.events.castVote(args))
      } catch (error) {
        console.error('Failed to cast vote:', error)
        toast.error(t('features.events.toasts.castVoteFailed'))
        throw error
      }
    },
    [zero]
  )

  const startVotingSession = useCallback(
    async (args: Parameters<typeof mutators.events.startVotingSession>[0]) => {
      try {
        await zero.mutate(mutators.events.startVotingSession(args))
        toast.success(t('features.events.toasts.votingSessionStarted'))
      } catch (error) {
        console.error('Failed to start voting session:', error)
        toast.error(t('features.events.toasts.votingSessionStartFailed'))
        throw error
      }
    },
    [zero]
  )

  const endVotingSession = useCallback(
    async (args: Parameters<typeof mutators.events.endVotingSession>[0]) => {
      try {
        await zero.mutate(mutators.events.endVotingSession(args))
        toast.success(t('features.events.toasts.votingSessionEnded'))
      } catch (error) {
        console.error('Failed to end voting session:', error)
        toast.error(t('features.events.toasts.votingSessionEndFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Delegates ──────────────────────────────────────────────────────
  const finalizeDelegates = useCallback(
    async (args: Parameters<typeof mutators.events.finalizeDelegates>[0]) => {
      try {
        await zero.mutate(mutators.events.finalizeDelegates(args))
        toast.success(t('features.events.toasts.delegatesFinalized'))
      } catch (error) {
        console.error('Failed to finalize delegates:', error)
        toast.error(t('features.events.toasts.delegatesFinalizeFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Positions ──────────────────────────────────────────────────────
  const createPosition = useCallback(
    async (args: Parameters<typeof mutators.events.createPosition>[0]) => {
      try {
        await zero.mutate(mutators.events.createPosition(args))
        toast.success(t('features.events.toasts.positionCreated'))
      } catch (error) {
        console.error('Failed to create position:', error)
        toast.error(t('features.events.toasts.positionCreateFailed'))
        throw error
      }
    },
    [zero]
  )

  const updatePosition = useCallback(
    async (args: Parameters<typeof mutators.events.updatePosition>[0]) => {
      try {
        await zero.mutate(mutators.events.updatePosition(args))
      } catch (error) {
        console.error('Failed to update position:', error)
        toast.error(t('features.events.toasts.positionUpdateFailed'))
        throw error
      }
    },
    [zero]
  )

  const deletePosition = useCallback(
    async (args: Parameters<typeof mutators.events.deletePosition>[0]) => {
      try {
        await zero.mutate(mutators.events.deletePosition(args))
        toast.success(t('features.events.toasts.positionDeleted'))
      } catch (error) {
        console.error('Failed to delete position:', error)
        toast.error(t('features.events.toasts.positionDeleteFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Meetings ───────────────────────────────────────────────────────
  const createMeetingSlot = useCallback(
    async (args: Parameters<typeof mutators.events.createMeetingSlot>[0]) => {
      try {
        await zero.mutate(mutators.events.createMeetingSlot(args))
        toast.success(t('features.events.toasts.meetingSlotCreated'))
      } catch (error) {
        console.error('Failed to create meeting slot:', error)
        toast.error(t('features.events.toasts.meetingSlotCreateFailed'))
        throw error
      }
    },
    [zero]
  )

  const updateMeetingSlot = useCallback(
    async (args: Parameters<typeof mutators.events.updateMeetingSlot>[0]) => {
      try {
        await zero.mutate(mutators.events.updateMeetingSlot(args))
      } catch (error) {
        console.error('Failed to update meeting slot:', error)
        toast.error(t('features.events.toasts.meetingSlotUpdateFailed'))
        throw error
      }
    },
    [zero]
  )

  const deleteMeetingSlot = useCallback(
    async (args: Parameters<typeof mutators.events.deleteMeetingSlot>[0]) => {
      try {
        await zero.mutate(mutators.events.deleteMeetingSlot(args))
        toast.success(t('features.events.toasts.meetingSlotDeleted'))
      } catch (error) {
        console.error('Failed to delete meeting slot:', error)
        toast.error(t('features.events.toasts.meetingSlotDeleteFailed'))
        throw error
      }
    },
    [zero]
  )

  const createMeetingBooking = useCallback(
    async (args: Parameters<typeof mutators.events.createMeetingBooking>[0]) => {
      try {
        await zero.mutate(mutators.events.createMeetingBooking(args))
        toast.success(t('features.events.toasts.meetingBooked'))
      } catch (error) {
        console.error('Failed to book meeting:', error)
        toast.error(t('features.events.toasts.meetingBookFailed'))
        throw error
      }
    },
    [zero]
  )

  const deleteMeetingBooking = useCallback(
    async (args: Parameters<typeof mutators.events.deleteMeetingBooking>[0]) => {
      try {
        await zero.mutate(mutators.events.deleteMeetingBooking(args))
        toast.success(t('features.events.toasts.bookingCancelled'))
      } catch (error) {
        console.error('Failed to cancel booking:', error)
        toast.error(t('features.events.toasts.bookingCancelFailed'))
        throw error
      }
    },
    [zero]
  )

  return {
    // CRUD
    createEvent,
    updateEvent,
    cancelEvent,

    // Participation
    joinEvent,
    inviteParticipant,
    leaveEvent,
    updateParticipant,

    // Voting
    finalizeAgendaItem,
    castVote,
    startVotingSession,
    endVotingSession,

    // Delegates
    finalizeDelegates,

    // Positions
    createPosition,
    updatePosition,
    deletePosition,

    // Meetings
    createMeetingSlot,
    updateMeetingSlot,
    deleteMeetingSlot,
    createMeetingBooking,
    deleteMeetingBooking,
  }
}
