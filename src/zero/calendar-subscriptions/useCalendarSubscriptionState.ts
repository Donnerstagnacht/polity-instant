import { useQuery } from '@rocicorp/zero/react'
import { queries } from '../queries'

export function useCalendarSubscriptions() {
  const [subscriptions, result] = useQuery(
    queries.calendarSubscriptions.byUser({})
  )

  return {
    subscriptions: subscriptions ?? [],
    isLoading: result.type === 'unknown',
  }
}

export function useCalendarSubscriptionForGroup(groupId?: string) {
  const [subscriptions] = useQuery(
    groupId ? queries.calendarSubscriptions.byUserAndGroup({ groupId }) : undefined
  )

  return {
    subscription: subscriptions?.[0] ?? null,
    isSubscribed: (subscriptions?.length ?? 0) > 0,
  }
}

export function useCalendarSubscriptionForUser(targetUserId?: string) {
  const [subscriptions] = useQuery(
    targetUserId ? queries.calendarSubscriptions.byUserAndUser({ targetUserId }) : undefined
  )

  return {
    subscription: subscriptions?.[0] ?? null,
    isSubscribed: (subscriptions?.length ?? 0) > 0,
  }
}
