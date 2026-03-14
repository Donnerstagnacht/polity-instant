import { useCallback } from 'react'
import { useZero } from '@rocicorp/zero/react'
import { toast } from 'sonner'
import { useTranslation } from '@/features/shared/hooks/use-translation'
import { mutators } from '../mutators'

export function useCalendarSubscriptionActions() {
  const zero = useZero()
  const { t } = useTranslation()

  const subscribeToCalendar = useCallback(
    async (args: Parameters<typeof mutators.calendarSubscriptions.subscribe>[0]) => {
      try {
        await zero.mutate(mutators.calendarSubscriptions.subscribe(args))
        toast.success(t('features.calendar.toasts.subscribed'))
      } catch (error) {
        console.error('Failed to subscribe to calendar:', error)
        toast.error(t('features.calendar.toasts.subscribeFailed'))
        throw error
      }
    },
    [zero],
  )

  const updateCalendarSubscription = useCallback(
    async (args: Parameters<typeof mutators.calendarSubscriptions.update>[0]) => {
      try {
        await zero.mutate(mutators.calendarSubscriptions.update(args))
      } catch (error) {
        console.error('Failed to update calendar subscription:', error)
        toast.error(t('features.calendar.toasts.updateFailed'))
        throw error
      }
    },
    [zero],
  )

  const unsubscribeFromCalendar = useCallback(
    async (args: Parameters<typeof mutators.calendarSubscriptions.unsubscribe>[0]) => {
      try {
        await zero.mutate(mutators.calendarSubscriptions.unsubscribe(args))
        toast.success(t('features.calendar.toasts.unsubscribed'))
      } catch (error) {
        console.error('Failed to unsubscribe from calendar:', error)
        toast.error(t('features.calendar.toasts.unsubscribeFailed'))
        throw error
      }
    },
    [zero],
  )

  return {
    subscribeToCalendar,
    updateCalendarSubscription,
    unsubscribeFromCalendar,
  }
}
