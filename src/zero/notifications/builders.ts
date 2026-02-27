/**
 * Notification builder functions — pure functions that construct notification objects
 * for the `createNotification` mutator. These handle the complexity of mapping
 * entity types to the correct polymorphic columns.
 */

import type { NotificationType } from '@/features/notifications/types/notification.types'
import type { NotificationCategory } from './notificationTypes'

type EntityType = 'group' | 'event' | 'amendment' | 'blog'

interface BaseNotificationParams {
  id: string
  type: NotificationType
  title: string
  message: string
  senderId: string
  actionUrl?: string
  category?: NotificationCategory
}

interface EntityNotificationParams extends BaseNotificationParams {
  recipientEntityType: EntityType
  recipientEntityId: string
  /** Who is this notification about? (e.g. the user who requested membership) */
  relatedEntityType?: EntityType | 'user'
  relatedEntityId?: string
  /** On whose behalf? (e.g. the group that the action was performed on) */
  onBehalfOfEntityType?: EntityType
  onBehalfOfEntityId?: string
}

interface PersonalNotificationParams extends BaseNotificationParams {
  recipientUserId: string
  relatedEntityType?: EntityType | 'user'
  relatedEntityId?: string
  onBehalfOfEntityType?: EntityType
  onBehalfOfEntityId?: string
}

export type CreateNotificationInput = {
  id: string
  recipient_id: string
  sender_id: string | null
  type: string | null
  title: string | null
  message: string | null
  action_url: string | null
  category: string | null
  related_entity_type: string | null
  recipient_entity_type: string | null
  recipient_entity_id: string | null
  on_behalf_of_entity_type: string | null
  on_behalf_of_entity_id: string | null
  related_user_id: string | null
  related_group_id: string | null
  related_amendment_id: string | null
  related_event_id: string | null
  related_blog_id: string | null
  on_behalf_of_group_id: string | null
  on_behalf_of_event_id: string | null
  on_behalf_of_amendment_id: string | null
  on_behalf_of_blog_id: string | null
  recipient_group_id: string | null
  recipient_event_id: string | null
  recipient_amendment_id: string | null
  recipient_blog_id: string | null
}

function mapEntityToColumn(entityType: EntityType | 'user', entityId: string, prefix: string) {
  const result: Record<string, string | null> = {
    [`${prefix}_group_id`]: null,
    [`${prefix}_event_id`]: null,
    [`${prefix}_amendment_id`]: null,
    [`${prefix}_blog_id`]: null,
  }
  if (prefix === 'related') {
    result['related_user_id'] = null
  }

  switch (entityType) {
    case 'group':
      result[`${prefix}_group_id`] = entityId
      break
    case 'event':
      result[`${prefix}_event_id`] = entityId
      break
    case 'amendment':
      result[`${prefix}_amendment_id`] = entityId
      break
    case 'blog':
      result[`${prefix}_blog_id`] = entityId
      break
    case 'user':
      if (prefix === 'related') {
        result['related_user_id'] = entityId
      }
      break
  }
  return result
}

function buildBase(params: BaseNotificationParams) {
  return {
    id: params.id,
    sender_id: params.senderId,
    type: params.type,
    title: params.title,
    message: params.message,
    action_url: params.actionUrl ?? null,
    category: params.category ?? null,
  }
}

/**
 * Build a notification targeted at an entity (visible to all members with viewNotifications right).
 * The `recipient_id` is set to the sender for entity notifications (required by schema),
 * but the notification is queried by `recipient_entity_id` / `recipient_group_id` etc.
 */
export function buildEntityNotification(params: EntityNotificationParams): CreateNotificationInput {
  const base = buildBase(params)

  const recipientColumns = mapEntityToColumn(params.recipientEntityType, params.recipientEntityId, 'recipient')
  const relatedColumns = params.relatedEntityType && params.relatedEntityId
    ? mapEntityToColumn(params.relatedEntityType, params.relatedEntityId, 'related')
    : { related_user_id: null, related_group_id: null, related_event_id: null, related_amendment_id: null, related_blog_id: null }
  const onBehalfColumns = params.onBehalfOfEntityType && params.onBehalfOfEntityId
    ? mapEntityToColumn(params.onBehalfOfEntityType, params.onBehalfOfEntityId, 'on_behalf_of')
    : { on_behalf_of_group_id: null, on_behalf_of_event_id: null, on_behalf_of_amendment_id: null, on_behalf_of_blog_id: null }

  return {
    ...base,
    recipient_id: params.senderId, // entity notifications still need a recipient_id for schema compliance
    recipient_entity_type: params.recipientEntityType,
    recipient_entity_id: params.recipientEntityId,
    related_entity_type: params.relatedEntityType ?? null,
    on_behalf_of_entity_type: params.onBehalfOfEntityType ?? null,
    on_behalf_of_entity_id: params.onBehalfOfEntityId ?? null,
    ...recipientColumns,
    ...relatedColumns,
    ...onBehalfColumns,
  } as CreateNotificationInput
}

/**
 * Build a notification targeted at a specific user.
 */
export function buildPersonalNotification(params: PersonalNotificationParams): CreateNotificationInput {
  const base = buildBase(params)

  const relatedColumns = params.relatedEntityType && params.relatedEntityId
    ? mapEntityToColumn(params.relatedEntityType, params.relatedEntityId, 'related')
    : { related_user_id: null, related_group_id: null, related_event_id: null, related_amendment_id: null, related_blog_id: null }
  const onBehalfColumns = params.onBehalfOfEntityType && params.onBehalfOfEntityId
    ? mapEntityToColumn(params.onBehalfOfEntityType, params.onBehalfOfEntityId, 'on_behalf_of')
    : { on_behalf_of_group_id: null, on_behalf_of_event_id: null, on_behalf_of_amendment_id: null, on_behalf_of_blog_id: null }

  return {
    ...base,
    recipient_id: params.recipientUserId,
    recipient_entity_type: null,
    recipient_entity_id: null,
    recipient_group_id: null,
    recipient_event_id: null,
    recipient_amendment_id: null,
    recipient_blog_id: null,
    related_entity_type: params.relatedEntityType ?? null,
    on_behalf_of_entity_type: params.onBehalfOfEntityType ?? null,
    on_behalf_of_entity_id: params.onBehalfOfEntityId ?? null,
    ...relatedColumns,
    ...onBehalfColumns,
  } as CreateNotificationInput
}

/**
 * Build the same notification for multiple specific users.
 */
export function buildBatchNotifications(
  params: Omit<PersonalNotificationParams, 'recipientUserId' | 'id'> & { recipientUserIds: string[] }
): CreateNotificationInput[] {
  return params.recipientUserIds.map(userId =>
    buildPersonalNotification({
      ...params,
      id: crypto.randomUUID(),
      recipientUserId: userId,
    })
  )
}
