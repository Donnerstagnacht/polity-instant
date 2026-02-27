import { z } from 'zod'
import { timestampSchema, nullableTimestampSchema, jsonSchema } from '../shared/helpers'

// ============================================
// Notification
// ============================================
const baseNotificationSchema = z.object({
  id: z.string(),
  recipient_id: z.string(),
  sender_id: z.string().nullable(),
  title: z.string().nullable(),
  message: z.string().nullable(),
  type: z.string().nullable(),
  action_url: z.string().nullable(),
  is_read: z.boolean(),
  related_entity_type: z.string().nullable(),
  on_behalf_of_entity_type: z.string().nullable(),
  on_behalf_of_entity_id: z.string().nullable(),
  recipient_entity_type: z.string().nullable(),
  recipient_entity_id: z.string().nullable(),
  related_user_id: z.string().nullable(),
  related_group_id: z.string().nullable(),
  related_amendment_id: z.string().nullable(),
  related_event_id: z.string().nullable(),
  related_blog_id: z.string().nullable(),
  on_behalf_of_group_id: z.string().nullable(),
  on_behalf_of_event_id: z.string().nullable(),
  on_behalf_of_amendment_id: z.string().nullable(),
  on_behalf_of_blog_id: z.string().nullable(),
  recipient_group_id: z.string().nullable(),
  recipient_event_id: z.string().nullable(),
  recipient_amendment_id: z.string().nullable(),
  recipient_blog_id: z.string().nullable(),
  category: z.string().nullable(),
  created_at: timestampSchema,
})

export const selectNotificationSchema = baseNotificationSchema
export const createNotificationSchema = baseNotificationSchema
  .omit({ id: true, created_at: true, is_read: true })
  .extend({ id: z.string() })
export const markReadNotificationSchema = z.object({ id: z.string() })
export const deleteNotificationSchema = z.object({ id: z.string() })

// ============================================
// Push Subscription
// ============================================
const basePushSubscriptionSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  endpoint: z.string(),
  auth: z.string().nullable(),
  p256dh: z.string().nullable(),
  user_agent: z.string().nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
})

export const selectPushSubscriptionSchema = basePushSubscriptionSchema
export const createPushSubscriptionSchema = basePushSubscriptionSchema
  .omit({ id: true, user_id: true, created_at: true, updated_at: true })
  .extend({ id: z.string() })
export const deletePushSubscriptionSchema = z.object({ id: z.string() })

// ============================================
// Notification Setting
// ============================================
const baseNotificationSettingSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  group_notifications: jsonSchema.nullable(),
  event_notifications: jsonSchema.nullable(),
  amendment_notifications: jsonSchema.nullable(),
  blog_notifications: jsonSchema.nullable(),
  todo_notifications: jsonSchema.nullable(),
  social_notifications: jsonSchema.nullable(),
  delivery_settings: jsonSchema.nullable(),
  timeline_settings: jsonSchema.nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
})

export const selectNotificationSettingSchema = baseNotificationSettingSchema
export const createNotificationSettingSchema = baseNotificationSettingSchema
  .omit({ id: true, created_at: true, updated_at: true, user_id: true })
  .extend({ id: z.string() })
export const updateNotificationSettingSchema = baseNotificationSettingSchema
  .pick({
    group_notifications: true,
    event_notifications: true,
    amendment_notifications: true,
    blog_notifications: true,
    todo_notifications: true,
    social_notifications: true,
    delivery_settings: true,
    timeline_settings: true,
  })
  .partial()
  .extend({ id: z.string() })

// ============================================
// Inferred Types
// ============================================
export type Notification = z.infer<typeof selectNotificationSchema>
export type PushSubscription = z.infer<typeof selectPushSubscriptionSchema>
export type NotificationSetting = z.infer<typeof selectNotificationSettingSchema>

// ============================================
// Notification Read (entity-level shared read tracking)
// ============================================
const baseNotificationReadSchema = z.object({
  id: z.string(),
  notification_id: z.string(),
  entity_type: z.string(),
  entity_id: z.string(),
  read_by_user_id: z.string().nullable(),
  read_at: timestampSchema,
})

export const selectNotificationReadSchema = baseNotificationReadSchema
export const createNotificationReadSchema = baseNotificationReadSchema
  .omit({ id: true, read_at: true })
  .extend({ id: z.string() })
export const deleteNotificationReadSchema = z.object({ id: z.string() })
export type NotificationRead = z.infer<typeof selectNotificationReadSchema>
