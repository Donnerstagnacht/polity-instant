import { defineQuery } from '@rocicorp/zero'
import { z } from 'zod'
import { zql } from '../schema'

export const notificationQueries = {
  // Notifications for the current user
  byUser: defineQuery(
    z.object({}),
    ({ ctx: { userID } }) =>
      zql.notification
        .where('recipient_id', userID)
        .orderBy('created_at', 'desc')
        .limit(500)
  ),

  // Unread notifications for the current user
  unreadCount: defineQuery(
    z.object({}),
    ({ ctx: { userID } }) =>
      zql.notification
        .where('recipient_id', userID)
        .where('is_read', false)
  ),

  // Notification settings for the current user
  settings: defineQuery(
    z.object({}),
    ({ ctx: { userID } }) =>
      zql.notification_setting
        .where('user_id', userID)
        .one()
  ),

  // Push subscriptions for the current user
  pushSubscriptions: defineQuery(
    z.object({}),
    ({ ctx: { userID } }) =>
      zql.push_subscription
        .where('user_id', userID)
  ),

  // Notifications for a specific entity
  byEntity: defineQuery(
    z.object({ entityId: z.string(), entityType: z.string() }),
    ({ args: { entityId, entityType } }) =>
      zql.notification
        .where('recipient_entity_id', entityId)
        .where('recipient_entity_type', entityType)
        .related('sender')
        .related('related_user')
        .orderBy('created_at', 'desc')
        .limit(200)
  ),

  // Personal notifications with all relations and nested RBAC data
  byUserWithRelations: defineQuery(
    z.object({}),
    ({ ctx: { userID } }) =>
      zql.notification
        .where('recipient_id', userID)
        .related('sender')
        .related('recipient')
        .related('related_user')
        .related('related_group')
        .related('related_event')
        .related('related_amendment')
        .related('related_blog')
        .related('on_behalf_of_group')
        .related('on_behalf_of_event')
        .related('on_behalf_of_amendment')
        .related('on_behalf_of_blog')
        .related('recipient_group', q =>
          q.related('memberships', q =>
            q.where('user_id', userID).related('role', q => q.related('action_rights'))
          )
        )
        .related('recipient_event', q =>
          q.related('participants', q =>
            q.where('user_id', userID).related('role', q => q.related('action_rights'))
          )
        )
        .related('recipient_amendment', q =>
          q.related('collaborators', q =>
            q.where('user_id', userID)
          )
        )
        .related('recipient_blog', q =>
          q.related('bloggers', q =>
            q.where('user_id', userID).related('role', q => q.related('action_rights'))
          )
        )
        .orderBy('created_at', 'desc')
  ),

  // Group notifications by recipient group IDs
  byRecipientGroups: defineQuery(
    z.object({ groupIds: z.array(z.string()) }),
    ({ args: { groupIds } }) =>
      zql.notification
        .where('recipient_group_id', 'IN', groupIds)
        .related('recipient')
        .related('sender')
        .related('related_user')
        .related('related_group')
        .related('related_event')
        .related('related_amendment')
        .related('related_blog')
        .orderBy('created_at', 'desc')
        .limit(50)
  ),

  // Push subscription by endpoint
  pushSubscriptionByEndpoint: defineQuery(
    z.object({ endpoint: z.string() }),
    ({ ctx: { userID }, args: { endpoint } }) =>
      zql.push_subscription
        .where('endpoint', endpoint)
        .where('user_id', userID)
  ),

  // User's group memberships (for entity ID collection)
  userGroupMemberships: defineQuery(
    z.object({}),
    ({ ctx: { userID } }) =>
      zql.group_membership
        .where('user_id', userID)
        .related('group')
  ),

  // User's event participations
  userEventParticipations: defineQuery(
    z.object({}),
    ({ ctx: { userID } }) =>
      zql.event_participant
        .where('user_id', userID)
        .related('event')
  ),

  // User's amendment collaborations
  userAmendmentCollaborations: defineQuery(
    z.object({}),
    ({ ctx: { userID } }) =>
      zql.amendment_collaborator
        .where('user_id', userID)
        .related('amendment')
  ),

  // User's blog relations
  userBlogRelations: defineQuery(
    z.object({}),
    ({ ctx: { userID } }) =>
      zql.blog_blogger
        .where('user_id', userID)
        .related('blog')
  ),

  byEntityId: defineQuery(
    z.object({ entity_id: z.string() }),
    ({ args: { entity_id } }) =>
      zql.notification
        .where('recipient_entity_id', entity_id)
        .related('sender')
        .orderBy('created_at', 'desc')
        .limit(200)
  ),

  // ── Notification Read queries ──────────────────────────────────────

  // Reads for a specific entity (to compute unread count)
  readsByEntity: defineQuery(
    z.object({ entityId: z.string(), entityType: z.string() }),
    ({ ctx: { userID }, args: { entityId, entityType } }) =>
      zql.notification_read
        .where('entity_id', entityId)
        .where('entity_type', entityType)
        .where('read_by_user_id', userID)
  ),
}
