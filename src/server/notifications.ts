import { createServerFn } from '@tanstack/start'
import * as notificationHelpers from '@/utils/notification-helpers'

/**
 * Generic server function to dispatch notification calls server-side.
 * Notification helpers require SUPABASE_SERVICE_ROLE_KEY which is only
 * available on the server. Client hooks call this fire-and-forget after mutations.
 *
 * Usage from hooks:
 *   sendNotificationFn({ data: { helper: 'notifyGroupInvite', params: { ... } } }).catch(console.error)
 */
export const sendNotificationFn = createServerFn({ method: 'POST' })
  .validator(
    (data: unknown) =>
      data as {
        helper: string
        params: Record<string, unknown>
      },
  )
  .handler(async ({ data }) => {
    const { helper, params } = data

    const fn = (notificationHelpers as Record<string, unknown>)[helper]
    if (typeof fn !== 'function') {
      console.error(`[Notifications] Unknown helper: ${helper}`)
      return { success: false, error: `Unknown helper: ${helper}` }
    }

    try {
      await (fn as (params: Record<string, unknown>) => Promise<unknown>)(params)
      return { success: true }
    } catch (error) {
      console.error(`[Notifications] Error calling ${helper}:`, error)
      return { success: false, error: String(error) }
    }
  })
