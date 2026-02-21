import { defineMutator } from '@rocicorp/zero'
import { zql } from '../schema'
import {
  createNotificationSchema,
  markReadNotificationSchema,
  deleteNotificationSchema,
  createNotificationSettingSchema,
  updateNotificationSettingSchema,
  createPushSubscriptionSchema,
  deletePushSubscriptionSchema,
} from './schema'

export const notificationMutators = {
  // Mark a single notification as read
  markRead: defineMutator(
    markReadNotificationSchema,
    async ({ tx, args }) => {
      await tx.mutate.notification.update({
        id: args.id,
        is_read: true,
      })
    }
  ),

  // Mark all notifications as read for the current user
  markAllRead: defineMutator(
    markReadNotificationSchema,
    async ({ tx, ctx: { userID } }) => {
      const unread = await tx.run(
        zql.notification
          .where('recipient_id', userID)
          .where('is_read', false)
      )

      for (const n of unread) {
        await tx.mutate.notification.update({
          id: n.id,
          is_read: true,
        })
      }
    }
  ),

  // Delete a notification
  delete: defineMutator(
    deleteNotificationSchema,
    async ({ tx, args }) => {
      await tx.mutate.notification.delete({ id: args.id })
    }
  ),

  // Update notification settings
  updateSettings: defineMutator(
    updateNotificationSettingSchema,
    async ({ tx, args }) => {
      const { id, ...fields } = args
      await tx.mutate.notification_setting.update({
        id,
        ...fields,
        updated_at: Date.now(),
      })
    }
  ),

  // Register a push subscription
  registerPushSubscription: defineMutator(
    createPushSubscriptionSchema,
    async ({ tx, ctx: { userID }, args }) => {
      const now = Date.now()
      await tx.mutate.push_subscription.insert({
        ...args,
        user_id: userID,
        created_at: now,
        updated_at: now,
      })
    }
  ),

  // Unregister a push subscription
  unregisterPushSubscription: defineMutator(
    deletePushSubscriptionSchema,
    async ({ tx, args }) => {
      await tx.mutate.push_subscription.delete({ id: args.id })
    }
  ),

  // Create a notification
  createNotification: defineMutator(
    createNotificationSchema,
    async ({ tx, args }) => {
      const now = Date.now()
      await tx.mutate.notification.insert({
        ...args,
        is_read: false,
        created_at: now,
      })
    }
  ),

  // Create notification settings
  createSettings: defineMutator(
    createNotificationSettingSchema,
    async ({ tx, ctx: { userID }, args }) => {
      const now = Date.now()
      await tx.mutate.notification_setting.insert({
        ...args,
        user_id: userID,
        created_at: now,
        updated_at: now,
      })
    }
  ),
}
