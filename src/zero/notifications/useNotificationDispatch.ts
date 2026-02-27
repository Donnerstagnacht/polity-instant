/**
 * Hook for dispatching notifications using builder functions.
 * Wraps createNotification from useNotificationActions with entity/personal builders.
 * Personal notifications are gated by recipient settings via shouldDispatchNotification().
 */

import { useCallback } from 'react'
import { useNotificationActions } from './useNotificationActions'
import {
  buildEntityNotification,
  buildPersonalNotification,
  buildBatchNotifications,
  type CreateNotificationInput,
} from './builders'
import { shouldDispatchNotification } from '@/features/notifications/logic/notificationTypeSettingMap'
import type { NotificationType } from '@/features/notifications/types/notification.types'
import type { NotificationSettings } from '@/features/notifications/types/notification-settings.types'
import type { NotificationCategory } from './notificationTypes'

type EntityType = 'group' | 'event' | 'amendment' | 'blog'

interface DispatchEntityParams {
  type: NotificationType
  title: string
  message: string
  senderId: string
  recipientEntityType: EntityType
  recipientEntityId: string
  actionUrl?: string
  category?: NotificationCategory
  relatedEntityType?: EntityType | 'user'
  relatedEntityId?: string
  onBehalfOfEntityType?: EntityType
  onBehalfOfEntityId?: string
}

interface DispatchPersonalParams {
  type: NotificationType
  title: string
  message: string
  senderId: string
  recipientUserId: string
  actionUrl?: string
  category?: NotificationCategory
  relatedEntityType?: EntityType | 'user'
  relatedEntityId?: string
  onBehalfOfEntityType?: EntityType
  onBehalfOfEntityId?: string
  /** Optional — if provided, notification is gated by recipient preferences */
  recipientSettings?: NotificationSettings | null
}

interface DispatchBatchParams extends Omit<DispatchPersonalParams, 'recipientUserId' | 'recipientSettings'> {
  recipientUserIds: string[]
  /** Map of userId → settings. Users not in the map get default (all true). */
  recipientSettingsMap?: Record<string, NotificationSettings | null>
}

export function useNotificationDispatch() {
  const { createNotification } = useNotificationActions()

  const dispatchEntity = useCallback(
    async (params: DispatchEntityParams) => {
      const notification = buildEntityNotification({
        ...params,
        id: crypto.randomUUID(),
      })
      await createNotification(notification as Parameters<typeof createNotification>[0])
    },
    [createNotification]
  )

  const dispatchPersonal = useCallback(
    async (params: DispatchPersonalParams) => {
      const { recipientSettings, ...rest } = params
      // Gate personal notification by recipient preferences
      if (!shouldDispatchNotification(params.type, recipientSettings)) return
      const notification = buildPersonalNotification({
        ...rest,
        id: crypto.randomUUID(),
      })
      await createNotification(notification as Parameters<typeof createNotification>[0])
    },
    [createNotification]
  )

  const dispatchBatch = useCallback(
    async (params: DispatchBatchParams) => {
      const { recipientUserIds, recipientSettingsMap, ...rest } = params
      // Filter recipients by their settings preferences
      const eligibleRecipientIds = recipientUserIds.filter((userId) =>
        shouldDispatchNotification(
          params.type,
          recipientSettingsMap?.[userId] ?? null
        )
      )
      if (eligibleRecipientIds.length === 0) return
      const notifications = buildBatchNotifications({
        ...rest,
        recipientUserIds: eligibleRecipientIds,
      })
      // Process in batches of 10 to limit concurrency
      const BATCH_SIZE = 10
      for (let i = 0; i < notifications.length; i += BATCH_SIZE) {
        const batch = notifications.slice(i, i + BATCH_SIZE)
        await Promise.all(
          batch.map(notification =>
            createNotification(notification as Parameters<typeof createNotification>[0])
          )
        )
      }
    },
    [createNotification]
  )

  return {
    dispatchEntity,
    dispatchPersonal,
    dispatchBatch,
  }
}
