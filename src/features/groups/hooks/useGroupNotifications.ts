/**
 * Orchestration hook for group notification dispatch.
 * Composes useNotificationDispatch with group-specific notification builders.
 */

import { useCallback } from 'react'
import { useNotificationDispatch } from '@/zero/notifications/useNotificationDispatch'
import type { NotificationType } from '@/features/notifications/types/notification.types'

export function useGroupNotifications() {
  const { dispatchEntity } = useNotificationDispatch()

  const notifyGroup = useCallback(
    async (params: {
      type: NotificationType
      title: string
      message: string
      senderId: string
      groupId: string
      actionUrl?: string
      relatedEntityType?: 'group' | 'event' | 'amendment' | 'blog' | 'user'
      relatedEntityId?: string
    }) => {
      await dispatchEntity({
        type: params.type,
        title: params.title,
        message: params.message,
        senderId: params.senderId,
        recipientEntityType: 'group',
        recipientEntityId: params.groupId,
        actionUrl: params.actionUrl,
        category: 'group',
        relatedEntityType: params.relatedEntityType,
        relatedEntityId: params.relatedEntityId,
      })
    },
    [dispatchEntity]
  )

  return { notifyGroup }
}
