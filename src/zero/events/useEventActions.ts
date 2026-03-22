import { useCallback } from 'react'
import { useZero } from '@rocicorp/zero/react'
import { toast } from 'sonner'
import { useTranslation } from '@/features/shared/hooks/use-translation'
import { mutators } from '../mutators'
import { serverConfirmed } from '../mutate-with-server-check'

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
        const result = zero.mutate(mutators.events.create(args))
        await serverConfirmed(result)
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
        const result = zero.mutate(mutators.events.update(args))
        await serverConfirmed(result)
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
        const result = zero.mutate(mutators.events.cancel(args))
        await serverConfirmed(result)
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
        const result = zero.mutate(mutators.events.joinEvent(args))
        await serverConfirmed(result)
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
        const result = zero.mutate(mutators.events.inviteParticipant(args))
        await serverConfirmed(result)
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
        const result = zero.mutate(mutators.events.leaveEvent(args))
        await serverConfirmed(result)
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
        const result = zero.mutate(mutators.events.updateParticipant(args))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to update participant:', error)
        toast.error(t('features.events.toasts.updateParticipantFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Delegates ──────────────────────────────────────────────────────
  const finalizeDelegates = useCallback(
    async (args: Parameters<typeof mutators.events.finalizeDelegates>[0]) => {
      try {
        const result = zero.mutate(mutators.events.finalizeDelegates(args))
        await serverConfirmed(result)
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
        const result = zero.mutate(mutators.events.createPosition(args))
        await serverConfirmed(result)
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
        const result = zero.mutate(mutators.events.updatePosition(args))
        await serverConfirmed(result)
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
        const result = zero.mutate(mutators.events.deletePosition(args))
        await serverConfirmed(result)
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
        const result = zero.mutate(mutators.events.createMeetingSlot(args))
        await serverConfirmed(result)
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
        const result = zero.mutate(mutators.events.updateMeetingSlot(args))
        await serverConfirmed(result)
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
        const result = zero.mutate(mutators.events.deleteMeetingSlot(args))
        await serverConfirmed(result)
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
        const result = zero.mutate(mutators.events.createMeetingBooking(args))
        await serverConfirmed(result)
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
        const result = zero.mutate(mutators.events.deleteMeetingBooking(args))
        await serverConfirmed(result)
        toast.success(t('features.events.toasts.bookingCancelled'))
      } catch (error) {
        console.error('Failed to cancel booking:', error)
        toast.error(t('features.events.toasts.bookingCancelFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Event Exceptions ───────────────────────────────────────────────
  const createException = useCallback(
    async (args: Parameters<typeof mutators.events.createException>[0]) => {
      try {
        const result = zero.mutate(mutators.events.createException(args))
        await serverConfirmed(result)
        toast.success(t('features.events.toasts.exceptionCreated'))
      } catch (error) {
        console.error('Failed to create event exception:', error)
        toast.error(t('features.events.toasts.exceptionCreateFailed'))
        throw error
      }
    },
    [zero],
  )

  const updateException = useCallback(
    async (args: Parameters<typeof mutators.events.updateException>[0]) => {
      try {
        const result = zero.mutate(mutators.events.updateException(args))
        await serverConfirmed(result)
        toast.success(t('features.events.toasts.exceptionUpdated'))
      } catch (error) {
        console.error('Failed to update event exception:', error)
        toast.error(t('features.events.toasts.exceptionUpdateFailed'))
        throw error
      }
    },
    [zero],
  )

  const deleteException = useCallback(
    async (args: Parameters<typeof mutators.events.deleteException>[0]) => {
      try {
        const result = zero.mutate(mutators.events.deleteException(args))
        await serverConfirmed(result)
        toast.success(t('features.events.toasts.exceptionDeleted'))
      } catch (error) {
        console.error('Failed to delete event exception:', error)
        toast.error(t('features.events.toasts.exceptionDeleteFailed'))
        throw error
      }
    },
    [zero],
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

    // Exceptions
    createException,
    updateException,
    deleteException,
  }
}
