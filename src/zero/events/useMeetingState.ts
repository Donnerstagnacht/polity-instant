import { useMemo } from 'react'
import { useQuery } from '@rocicorp/zero/react'
import { queries } from '../queries'

/**
 * Reactive state hook for meeting events (events with meeting_type set).
 * Returns meetings created by a specific user, with derived booking state.
 */
export function useMeetingsByCreator(userId?: string) {
  const [events, result] = useQuery(
    userId ? queries.events.byCreator({ userId }) : undefined
  )

  // Client-side filter: only events with a meeting_type
  const meetings = useMemo(
    () => (events ?? []).filter(e => e.meeting_type != null && e.meeting_type !== ''),
    [events],
  )

  return {
    meetings,
    isLoading: result.type === 'unknown',
  }
}

/**
 * Counts bookings for a specific instance of a meeting event.
 * Excludes the organizer (creator) from counting.
 */
export function getInstanceBookingCount(
  participants: Array<{ user_id: string; instance_date?: number | null }>,
  creatorId: string,
  instanceDate: number | null,
): number {
  return participants.filter(p => {
    if (p.user_id === creatorId) return false
    if (instanceDate === null || instanceDate === undefined) {
      return p.instance_date === null || p.instance_date === undefined || p.instance_date === 0
    }
    return p.instance_date === instanceDate
  }).length
}

/**
 * Checks if a specific user has booked a specific instance.
 */
export function isBookedByUser(
  participants: Array<{ user_id: string; instance_date?: number | null }>,
  userId: string,
  instanceDate: number | null,
): boolean {
  return participants.some(p => {
    if (p.user_id !== userId) return false
    if (instanceDate === null || instanceDate === undefined) {
      return p.instance_date === null || p.instance_date === undefined || p.instance_date === 0
    }
    return p.instance_date === instanceDate
  })
}
