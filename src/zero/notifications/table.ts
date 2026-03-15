import { table, string, number, boolean, json } from '@rocicorp/zero'

export const notification = table('notification')
  .columns({
    id: string(),
    recipient_id: string().optional(),
    sender_id: string().optional(),
    title: string().optional(),
    message: string().optional(),
    type: string().optional(),
    action_url: string().optional(),
    is_read: boolean(),
    related_entity_type: string().optional(),
    on_behalf_of_entity_type: string().optional(),
    on_behalf_of_entity_id: string().optional(),
    recipient_entity_type: string().optional(),
    recipient_entity_id: string().optional(),
    related_user_id: string().optional(),
    related_group_id: string().optional(),
    related_amendment_id: string().optional(),
    related_event_id: string().optional(),
    related_blog_id: string().optional(),
    on_behalf_of_group_id: string().optional(),
    on_behalf_of_event_id: string().optional(),
    on_behalf_of_amendment_id: string().optional(),
    on_behalf_of_blog_id: string().optional(),
    recipient_group_id: string().optional(),
    recipient_event_id: string().optional(),
    recipient_amendment_id: string().optional(),
    recipient_blog_id: string().optional(),
    category: string().optional(),
    created_at: number(),
  })
  .primaryKey('id')

export const pushSubscription = table('push_subscription')
  .columns({
    id: string(),
    user_id: string(),
    endpoint: string(),
    auth: string().optional(),
    p256dh: string().optional(),
    user_agent: string().optional(),
    created_at: number(),
    updated_at: number(),
  })
  .primaryKey('id')

export const notificationSetting = table('notification_setting')
  .columns({
    id: string(),
    user_id: string(),
    group_notifications: json<Record<string, boolean>>().optional(),
    event_notifications: json<Record<string, boolean>>().optional(),
    amendment_notifications: json<Record<string, boolean>>().optional(),
    blog_notifications: json<Record<string, boolean>>().optional(),
    todo_notifications: json<Record<string, boolean>>().optional(),
    social_notifications: json<Record<string, boolean>>().optional(),
    delivery_settings: json<Record<string, boolean>>().optional(),
    timeline_settings: json<Record<string, boolean | string>>().optional(),
    created_at: number(),
    updated_at: number(),
  })
  .primaryKey('id')

export const notificationRead = table('notification_read')
  .columns({
    id: string(),
    notification_id: string(),
    entity_type: string(),
    entity_id: string(),
    read_by_user_id: string().optional(),
    read_at: number(),
  })
  .primaryKey('id')
