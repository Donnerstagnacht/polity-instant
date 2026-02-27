import { useCallback } from 'react'
import { useZero } from '@rocicorp/zero/react'
import { toast } from 'sonner'
import { useTranslation } from '@/hooks/use-translation'
import { mutators } from '../mutators'

/**
 * Action hook for notification mutations.
 * Every function wraps a custom mutator + sonner toast.
 */
export function useNotificationActions() {
  const zero = useZero()
  const { t } = useTranslation()

  // ── Read Status ────────────────────────────────────────────────────
  const markRead = useCallback(
    async (args: Parameters<typeof mutators.notifications.markRead>[0]) => {
      try {
        await zero.mutate(mutators.notifications.markRead(args))
      } catch (error) {
        console.error('Failed to mark notification as read:', error)
        toast.error(t('features.notifications.toasts.markReadFailed'))
        throw error
      }
    },
    [zero]
  )

  const markAllRead = useCallback(
    async (args: Parameters<typeof mutators.notifications.markAllRead>[0]) => {
      try {
        await zero.mutate(mutators.notifications.markAllRead(args))
        toast.success(t('features.notifications.toasts.allMarkedRead'))
      } catch (error) {
        console.error('Failed to mark all notifications as read:', error)
        toast.error(t('features.notifications.toasts.markAllReadFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Delete ─────────────────────────────────────────────────────────
  const deleteNotification = useCallback(
    async (args: Parameters<typeof mutators.notifications.delete>[0]) => {
      try {
        await zero.mutate(mutators.notifications.delete(args))
        toast.success(t('features.notifications.toasts.deleted'))
      } catch (error) {
        console.error('Failed to delete notification:', error)
        toast.error(t('features.notifications.toasts.deleteFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Settings ───────────────────────────────────────────────────────
  const updateSettings = useCallback(
    async (args: Parameters<typeof mutators.notifications.updateSettings>[0]) => {
      try {
        await zero.mutate(mutators.notifications.updateSettings(args))
        toast.success(t('features.notifications.toasts.settingsUpdated'))
      } catch (error) {
        console.error('Failed to update notification settings:', error)
        toast.error(t('features.notifications.toasts.settingsUpdateFailed'))
        throw error
      }
    },
    [zero]
  )

  const createSettings = useCallback(
    async (args: Parameters<typeof mutators.notifications.createSettings>[0]) => {
      try {
        await zero.mutate(mutators.notifications.createSettings(args))
        toast.success(t('features.notifications.toasts.settingsCreated'))
      } catch (error) {
        console.error('Failed to create notification settings:', error)
        toast.error(t('features.notifications.toasts.settingsCreateFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Push Subscriptions ─────────────────────────────────────────────
  const registerPushSubscription = useCallback(
    async (
      args: Parameters<typeof mutators.notifications.registerPushSubscription>[0]
    ) => {
      try {
        await zero.mutate(mutators.notifications.registerPushSubscription(args))
        toast.success(t('features.notifications.toasts.pushEnabled'))
      } catch (error) {
        console.error('Failed to register push subscription:', error)
        toast.error(t('features.notifications.toasts.pushEnableFailed'))
        throw error
      }
    },
    [zero]
  )

  const unregisterPushSubscription = useCallback(
    async (
      args: Parameters<typeof mutators.notifications.unregisterPushSubscription>[0]
    ) => {
      try {
        await zero.mutate(mutators.notifications.unregisterPushSubscription(args))
        toast.success(t('features.notifications.toasts.pushDisabled'))
      } catch (error) {
        console.error('Failed to unregister push subscription:', error)
        toast.error(t('features.notifications.toasts.pushDisableFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Create Notification ────────────────────────────────────────────
  const createNotification = useCallback(
    async (args: Parameters<typeof mutators.notifications.createNotification>[0]) => {
      try {
        await zero.mutate(mutators.notifications.createNotification(args))
      } catch (error) {
        console.error('Failed to create notification:', error)
        toast.error(t('features.notifications.toasts.createFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Entity Notification Reads ──────────────────────────────────────
  const markEntityNotificationRead = useCallback(
    async (args: Parameters<typeof mutators.notifications.markEntityNotificationRead>[0]) => {
      try {
        await zero.mutate(mutators.notifications.markEntityNotificationRead(args))
      } catch (error) {
        console.error('Failed to mark entity notification as read:', error)
      }
    },
    [zero]
  )

  const markAllEntityNotificationsRead = useCallback(
    async (args: Parameters<typeof mutators.notifications.markAllEntityNotificationsRead>[0]) => {
      try {
        await zero.mutate(mutators.notifications.markAllEntityNotificationsRead(args))
      } catch (error) {
        console.error('Failed to mark all entity notifications as read:', error)
      }
    },
    [zero]
  )

  return {
    // Read Status
    markRead,
    markAllRead,

    // Delete
    deleteNotification,

    // Settings
    updateSettings,
    createSettings,

    // Push Subscriptions
    registerPushSubscription,
    unregisterPushSubscription,

    // Create
    createNotification,

    // Entity Notification Reads
    markEntityNotificationRead,
    markAllEntityNotificationsRead,
  }
}
