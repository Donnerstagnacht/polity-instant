import { createServerFn } from '@tanstack/start'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

interface NotificationPayload {
  title: string
  message: string
  actionUrl?: string
  notificationId?: string
  type?: string
  icon?: string
  badge?: string
  tag?: string
  requireInteraction?: boolean
  actions?: {
    action: string
    title: string
    icon?: string
  }[]
}

function initVapid() {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    throw new Error('Missing VAPID configuration')
  }
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL || 'mailto:your-email@example.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  )
}

export const pushSendFn = createServerFn({ method: 'POST' })
  .validator(
    (data: unknown) =>
      data as {
        userId: string
        notification: NotificationPayload
      },
  )
  .handler(async ({ data }) => {
    try {
      const { userId, notification } = data

      if (!userId || !notification) {
        throw new Error('Missing userId or notification data')
      }

      if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
        console.error('[Push API] VAPID keys not configured')
        throw new Error('Push notifications not configured')
      }

      initVapid()

      const supabase = getSupabase()

      // Query all push subscriptions for this user
      const { data: subscriptions } = await supabase
        .from('push_subscription')
        .select('id, endpoint, auth, p256dh, user_id')
        .eq('user_id', userId)

      if (!subscriptions || subscriptions.length === 0) {
        console.log(`[Push API] No subscriptions found for user ${userId}`)
        return { message: 'No subscriptions found', sent: 0, failed: 0 }
      }

      console.log(
        `[Push API] Found ${subscriptions.length} subscription(s) for user ${userId}`,
      )

      // Prepare notification payload
      const payload = JSON.stringify({
        title: notification.title,
        message: notification.message,
        body: notification.message,
        actionUrl: notification.actionUrl,
        notificationId: notification.notificationId,
        type: notification.type,
        icon: notification.icon || '/icons/icon-192x192.png',
        badge: notification.badge || '/icons/icon-192x192.png',
        tag: notification.tag || notification.type || 'notification',
        requireInteraction: notification.requireInteraction || false,
        actions: notification.actions || [],
      })

      // Send push notification to all subscriptions
      const results = await Promise.allSettled(
        subscriptions.map(async (subscription) => {
          try {
            const pushSubscription = {
              endpoint: subscription.endpoint,
              keys: {
                auth: subscription.auth,
                p256dh: subscription.p256dh,
              },
            }

            await webpush.sendNotification(pushSubscription, payload)

            console.log(
              `[Push API] Successfully sent notification to ${subscription.endpoint.substring(0, 50)}...`,
            )

            return { success: true, subscriptionId: subscription.id }
          } catch (error: any) {
            console.error(
              `[Push API] Failed to send to subscription ${subscription.id}:`,
              error,
            )

            // Handle expired or invalid subscriptions
            if (error.statusCode === 410 || error.statusCode === 404) {
              console.log(
                `[Push API] Subscription ${subscription.id} is no longer valid, removing...`,
              )

              try {
                await supabase
                  .from('push_subscription')
                  .delete()
                  .eq('id', subscription.id)
                console.log(
                  `[Push API] Deleted invalid subscription ${subscription.id}`,
                )
              } catch (deleteError) {
                console.error(
                  `[Push API] Failed to delete subscription ${subscription.id}:`,
                  deleteError,
                )
              }
            }

            return {
              success: false,
              subscriptionId: subscription.id,
              error: error.message,
            }
          }
        }),
      )

      const sent = results.filter(
        (r) => r.status === 'fulfilled' && r.value.success,
      ).length
      const failed = results.filter(
        (r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success),
      ).length

      console.log(
        `[Push API] Sent ${sent} notification(s), ${failed} failed for user ${userId}`,
      )

      return {
        message: 'Push notifications sent',
        sent,
        failed,
        total: subscriptions.length,
      }
    } catch (error) {
      console.error('[Push API] Error sending push notifications:', error)
      throw new Error('Failed to send push notifications')
    }
  })

/** Health check — call with GET semantics from an API route if needed */
export const pushHealthCheckFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const isConfigured =
      !!process.env.VAPID_PUBLIC_KEY && !!process.env.VAPID_PRIVATE_KEY

    return {
      status: 'ok',
      pushNotificationsEnabled: isConfigured,
      vapidPublicKey:
        isConfigured && process.env.VAPID_PUBLIC_KEY
          ? process.env.VAPID_PUBLIC_KEY.substring(0, 20) + '...'
          : 'Not configured',
    }
  },
)
