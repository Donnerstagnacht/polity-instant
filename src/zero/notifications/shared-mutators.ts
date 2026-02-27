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
  createNotificationReadSchema,
  deleteNotificationReadSchema,
} from './schema'

/** Shared mutators — run on both client and server. Server mutators may override these. */
export const notificationSharedMutators = {
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

  // Mark a single entity notification as read
  markEntityNotificationRead: defineMutator(
    createNotificationReadSchema,
    async ({ tx, ctx: { userID }, args }) => {
      await tx.mutate.notification_read.insert({
        ...args,
        read_by_user_id: userID,
        read_at: Date.now(),
      })
    }
  ),

  // Mark all entity notifications as read (batch)
  markAllEntityNotificationsRead: defineMutator(
    createNotificationReadSchema.pick({ entity_id: true, entity_type: true }),
    async ({ tx, ctx: { userID }, args }) => {
      // Get all notifications for this entity that the user hasn't read yet
      const entityNotifications = await tx.run(
        zql.notification
          .where('recipient_entity_id', args.entity_id)
          .where('recipient_entity_type', args.entity_type)
      )

      const existingReads = await tx.run(
        zql.notification_read
          .where('entity_id', args.entity_id)
          .where('entity_type', args.entity_type)
          .where('read_by_user_id', userID)
      )

      const readNotificationIds = new Set(existingReads.map(r => r.notification_id))
      const now = Date.now()

      for (const n of entityNotifications) {
        if (!readNotificationIds.has(n.id)) {
          await tx.mutate.notification_read.insert({
            id: crypto.randomUUID(),
            notification_id: n.id,
            entity_id: args.entity_id,
            entity_type: args.entity_type,
            read_by_user_id: userID,
            read_at: now,
          })
        }
      }
    }
  ),

  // Delete a notification read record
  deleteEntityNotificationRead: defineMutator(
    deleteNotificationReadSchema,
    async ({ tx, args }) => {
      await tx.mutate.notification_read.delete({ id: args.id })
    }
  ),
}
