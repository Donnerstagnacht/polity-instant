import { z } from 'zod'
import { timestampSchema, nullableTimestampSchema } from '../shared/helpers'

// ============================================
// Conversation
// ============================================
const baseConversationSchema = z.object({
  id: z.string(),
  type: z.string().nullable(),
  name: z.string().nullable(),
  status: z.string().nullable(),
  pinned: z.boolean().nullable(),
  last_message_at: nullableTimestampSchema,
  group_id: z.string().nullable(),
  requested_by_id: z.string().nullable(),
  created_at: timestampSchema,
})

export const selectConversationSchema = baseConversationSchema
export const createConversationSchema = baseConversationSchema
  .omit({ id: true, created_at: true, requested_by_id: true })
  .extend({ id: z.string() })
export const updateConversationSchema = baseConversationSchema
  .pick({ name: true, status: true, pinned: true, last_message_at: true })
  .partial()
  .extend({ id: z.string() })
export const deleteConversationSchema = z.object({ id: z.string() })

// ============================================
// Conversation Participant
// ============================================
const baseConversationParticipantSchema = z.object({
  id: z.string(),
  conversation_id: z.string(),
  user_id: z.string(),
  joined_at: z.number(),
  last_read_at: nullableTimestampSchema,
  left_at: nullableTimestampSchema,
})

export const selectConversationParticipantSchema = baseConversationParticipantSchema
export const createConversationParticipantSchema = baseConversationParticipantSchema
  .omit({ id: true })
  .extend({ id: z.string() })
export const updateConversationParticipantSchema = baseConversationParticipantSchema
  .pick({ last_read_at: true })
  .extend({ id: z.string() })
export const deleteConversationParticipantSchema = z.object({ id: z.string() })

// ============================================
// Message
// ============================================
const baseMessageSchema = z.object({
  id: z.string(),
  conversation_id: z.string(),
  sender_id: z.string(),
  content: z.string().nullable(),
  is_read: z.boolean(),
  deleted_at: nullableTimestampSchema,
  created_at: timestampSchema,
  updated_at: timestampSchema,
})

export const selectMessageSchema = baseMessageSchema
export const createMessageSchema = baseMessageSchema
  .omit({ id: true, created_at: true, updated_at: true, sender_id: true, is_read: true })
  .extend({ id: z.string() })
export const updateMessageSchema = baseMessageSchema
  .pick({ content: true, is_read: true })
  .partial()
  .extend({ id: z.string() })
export const deleteMessageSchema = z.object({ id: z.string() })

// ============================================
// Inferred Types
// ============================================
export type Conversation = z.infer<typeof selectConversationSchema>
export type ConversationParticipant = z.infer<typeof selectConversationParticipantSchema>
export type Message = z.infer<typeof selectMessageSchema>
