import { table, string, number, boolean } from '@rocicorp/zero'

export const conversation = table('conversation')
  .columns({
    id: string(),
    type: string().optional(),
    name: string().optional(),
    status: string().optional(),
    pinned: boolean().optional(),
    last_message_at: number().optional(),
    group_id: string().optional(),
    requested_by_id: string().optional(),
    created_at: number(),
  })
  .primaryKey('id')

export const conversationParticipant = table('conversation_participant')
  .columns({
    id: string(),
    conversation_id: string(),
    user_id: string(),
    joined_at: number(),
    last_read_at: number().optional(),
    left_at: number().optional(),
  })
  .primaryKey('id')

export const message = table('message')
  .columns({
    id: string(),
    conversation_id: string(),
    sender_id: string(),
    content: string().optional(),
    is_read: boolean(),
    deleted_at: number().optional(),
    created_at: number(),
    updated_at: number(),
  })
  .primaryKey('id')
