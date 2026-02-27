import { defineMutator } from '@rocicorp/zero'
import { zql } from '../schema'
import {
  createConversationSchema,
  updateConversationSchema,
  createConversationParticipantSchema,
  updateConversationParticipantSchema,
  deleteConversationParticipantSchema,
  createMessageSchema,
  updateMessageSchema,
  deleteMessageSchema,
  deleteConversationSchema,
} from './schema'

/** Shared mutators — run on both client and server. Server mutators may override these. */
export const messageSharedMutators = {
  // Create a new conversation
  createConversation: defineMutator(
    createConversationSchema,
    async ({ tx, ctx: { userID }, args }) => {
      const now = Date.now()
      await tx.mutate.conversation.insert({
        ...args,
        requested_by_id: userID,
        created_at: now,
      })
    }
  ),

  // Send a message
  sendMessage: defineMutator(
    createMessageSchema,
    async ({ tx, ctx: { userID }, args }) => {
      const now = Date.now()
      await tx.mutate.message.insert({
        ...args,
        sender_id: userID,
        is_read: false,
        created_at: now,
        updated_at: now,
      })

      // Update conversation last_message_at
      await tx.mutate.conversation.update({
        id: args.conversation_id,
        last_message_at: now,
      })
    }
  ),

  // Mark messages as read (update participant's last_read_at)
  markRead: defineMutator(
    updateConversationParticipantSchema,
    async ({ tx, args }) => {
      await tx.mutate.conversation_participant.update({
        id: args.id,
        last_read_at: args.last_read_at,
      })
    }
  ),

  // Delete a conversation
  deleteConversation: defineMutator(
    deleteConversationSchema,
    async ({ tx, args }) => {
      await tx.mutate.conversation.delete({ id: args.id })
    }
  ),

  // Update a message
  updateMessage: defineMutator(
    updateMessageSchema,
    async ({ tx, args }) => {
      await tx.mutate.message.update({
        ...args,
        updated_at: Date.now(),
      })
    }
  ),

  // Update a conversation
  updateConversation: defineMutator(
    updateConversationSchema,
    async ({ tx, args }) => {
      await tx.mutate.conversation.update(args)
    }
  ),

  // Add a participant to a conversation
  addParticipant: defineMutator(
    createConversationParticipantSchema,
    async ({ tx, args }) => {
      await tx.mutate.conversation_participant.insert(args)
    }
  ),

  // Remove a participant from a conversation
  removeParticipant: defineMutator(
    deleteConversationParticipantSchema,
    async ({ tx, args }) => {
      await tx.mutate.conversation_participant.delete({ id: args.id })
    }
  ),

  // Delete a message
  deleteMessage: defineMutator(
    deleteMessageSchema,
    async ({ tx, args }) => {
      await tx.mutate.message.delete({ id: args.id })
    }
  ),
}
