import { useCallback } from 'react'
import { useZero } from '@rocicorp/zero/react'
import { toast } from 'sonner'
import { useTranslation } from '@/features/shared/hooks/use-translation'
import { mutators } from '../mutators'

/**
 * Action hook for meeting bookings (meetings as events).
 * Every function wraps a mutator + toast feedback.
 */
export function useMeetingActions() {
  const zero = useZero()
  const { t } = useTranslation()

  const bookMeeting = useCallback(
    async (eventId: string, instanceDate?: number | null) => {
      try {
        await zero.mutate(mutators.events.bookMeeting({
          event_id: eventId,
          instance_date: instanceDate ?? null,
        }))
        toast.success(t('features.meet.toasts.booked'))
      } catch (error) {
        console.error('Failed to book meeting:', error)
        toast.error(t('features.meet.toasts.bookFailed'))
        throw error
      }
    },
    [zero],
  )

  const cancelMeetingBooking = useCallback(
    async (eventId: string, instanceDate?: number | null) => {
      try {
        await zero.mutate(mutators.events.cancelMeetingBooking({
          event_id: eventId,
          instance_date: instanceDate ?? null,
        }))
        toast.success(t('features.meet.toasts.bookingCancelled'))
      } catch (error) {
        console.error('Failed to cancel meeting booking:', error)
        toast.error(t('features.meet.toasts.cancelFailed'))
        throw error
      }
    },
    [zero],
  )

  return { bookMeeting, cancelMeetingBooking }
}
