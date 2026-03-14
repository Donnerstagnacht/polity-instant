import { defineQuery, type QueryRowType } from '@rocicorp/zero'
import { z } from 'zod'
import { zql } from '../schema'

export const messageQueries = {
  // Conversations for the current user (via participant join)
  conversations: defineQuery(
    z.object({}),
    ({ ctx: { userID } }) =>
      zql.conversation_participant
        .where('user_id', userID)
        .orderBy('joined_at', 'desc')
  ),

  // Single conversation by ID
  conversationById: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.conversation.where('id', id).one()
  ),

  // Messages in a conversation
  messages: defineQuery(
    z.object({ conversation_id: z.string() }),
    ({ args: { conversation_id } }) =>
      zql.message
        .where('conversation_id', conversation_id)
        .orderBy('created_at', 'asc')
  ),

  // Unread message count for the current user
  unreadCount: defineQuery(
    z.object({ conversation_id: z.string() }),
    ({ args: { conversation_id } }) =>
      zql.message
        .where('conversation_id', conversation_id)
        .where('is_read', false)
  ),

  // Conversations with full relations (group, requested_by, participants→user, messages→sender)
  conversationsWithRelations: defineQuery(
    z.object({ limit: z.number().optional() }),
    ({ args: { limit } }) => {
      let q = zql.conversation
        .related('group')
        .related('requested_by')
        .related('participants', q => q.related('user'))
        .related('messages', q => q.orderBy('created_at', 'asc').related('sender'))
        .orderBy('last_message_at', 'desc')
      if (limit) q = q.limit(limit)
      return q
    }
  ),

  // Lighter conversation query for unread counting (participants + messages→sender)
  conversationsForUnread: defineQuery(
    z.object({}),
    ({ ctx: { userID } }) =>
      zql.conversation
        .related('participants', q => q.where('user_id', userID).related('user'))
        .related('messages', q => q.orderBy('created_at', 'asc').related('sender'))
  ),

  conversationsByUserWithRelations: defineQuery(
    z.object({ user_id: z.string() }),
    ({ args: { user_id } }) =>
      zql.conversation_participant
        .where('user_id', user_id)
        .related('conversation', q =>
          q.related('group')
            .related('participants', pq => pq.related('user'))
            .related('messages')
        )
  ),

  // Find group conversation by group_id
  conversationByGroupId: defineQuery(
    z.object({ group_id: z.string() }),
    ({ args: { group_id } }) =>
      zql.conversation
        .where('group_id', group_id)
        .where('type', 'group')
        .one()
  ),
}

// ── Query Row Types ─────────────────────────────────────────────────
export type ConversationWithRelationsRow = QueryRowType<typeof messageQueries.conversationsWithRelations>;
