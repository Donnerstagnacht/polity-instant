import { useQuery } from '@rocicorp/zero/react'
import { useMemo } from 'react'
import { queries } from '../queries'

/**
 * Returns the unread notification count for a specific entity.
 * Uses the same is_read field that EntityNotifications page uses.
 */
export function useEntityUnreadCount(entityId: string, entityType: string) {
  const [entityNotifications] = useQuery(
    entityId
      ? queries.notifications.byEntity({ entityId, entityType })
      : undefined
  )

  const unreadCount = useMemo(() => {
    if (!entityNotifications) return 0
    return entityNotifications.filter(n => !n.is_read).length
  }, [entityNotifications])

  return unreadCount
}
