/**
 * Orchestration hook for amendment notification dispatch.
 * Composes useNotificationDispatch with amendment-specific notification builders.
 */

import { useCallback } from 'react'
import { useNotificationDispatch } from '@/zero/notifications/useNotificationDispatch'
import type { NotificationType } from '@/features/notifications/types/notification.types'

export function useAmendmentNotifications() {
  const { dispatchEntity } = useNotificationDispatch()

  const notifyAmendment = useCallback(
    async (params: {
      type: NotificationType
      title: string
      message: string
      senderId: string
      amendmentId: string
      actionUrl?: string
      relatedEntityType?: 'group' | 'event' | 'amendment' | 'blog' | 'user'
      relatedEntityId?: string
    }) => {
      await dispatchEntity({
        type: params.type,
        title: params.title,
        message: params.message,
        senderId: params.senderId,
        recipientEntityType: 'amendment',
        recipientEntityId: params.amendmentId,
        actionUrl: params.actionUrl,
        category: 'amendment',
        relatedEntityType: params.relatedEntityType,
        relatedEntityId: params.relatedEntityId,
      })
    },
    [dispatchEntity]
  )

  return { notifyAmendment }
}
