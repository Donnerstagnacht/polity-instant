/**
 * Orchestration hook for event notification dispatch.
 * Composes useNotificationDispatch with event-specific notification builders.
 */

import { useCallback } from 'react'
import { useNotificationDispatch } from '@/zero/notifications/useNotificationDispatch'
import type { NotificationType } from '@/features/notifications/types/notification.types'

export function useEventNotifications() {
  const { dispatchEntity } = useNotificationDispatch()

  const notifyEvent = useCallback(
    async (params: {
      type: NotificationType
      title: string
      message: string
      senderId: string
      eventId: string
      actionUrl?: string
      relatedEntityType?: 'group' | 'event' | 'amendment' | 'blog' | 'user'
      relatedEntityId?: string
    }) => {
      await dispatchEntity({
        type: params.type,
        title: params.title,
        message: params.message,
        senderId: params.senderId,
        recipientEntityType: 'event',
        recipientEntityId: params.eventId,
        actionUrl: params.actionUrl,
        category: 'event',
        relatedEntityType: params.relatedEntityType,
        relatedEntityId: params.relatedEntityId,
      })
    },
    [dispatchEntity]
  )

  return { notifyEvent }
}
