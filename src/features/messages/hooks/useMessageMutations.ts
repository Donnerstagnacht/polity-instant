import { useState } from 'react';
import { useMessageActions } from '@/zero/messages/useMessageActions';
import { toast } from 'sonner';
import { Message, Conversation } from '../types/message.types';
import {
  notifyDirectMessage,
  notifyConversationRequest,
  notifyConversationAccepted,
} from '@/features/notifications/utils/notification-helpers.ts';

export function useMessageMutations() {
  const actions = useMessageActions();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Send a message to a conversation
   */
  const sendMessage = async (
    conversationId: string,
    senderId: string,
    content: string,
    recipientUserIds?: string[]
  ) => {
    setIsLoading(true);
    try {
      const messageId = crypto.randomUUID();

      await actions.sendMessage({
        id: messageId,
        content,
        conversation_id: conversationId,
        deleted_at: 0,
      });

      // Notify all other participants — best-effort
      try {
        if (recipientUserIds) {
          for (const recipientId of recipientUserIds) {
            if (recipientId !== senderId) {
              await notifyDirectMessage({
                senderId,
                senderName: '',
                recipientUserId: recipientId,
                conversationId,
              });
            }
          }
        }
      } catch { /* notification delivery is best-effort */ }
      return { success: true, messageId };
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Create a new conversation
   */
  const createConversation = async (
    type: string,
    participantIds: string[],
    groupId?: string,
    creatorId?: string
  ) => {
    setIsLoading(true);
    try {
      const conversationId = crypto.randomUUID();

      // Determine the requester (creator of the conversation request)
      const requesterId = creatorId || participantIds[0];

      console.log('[createConversation] Creating conversation:', {
        conversationId,
        type,
        creatorId,
        participantIds,
        requesterId,
        status: 'pending',
      });

      // Create conversation
      await actions.createConversation({
        id: conversationId,
        type,
        status: 'pending',
        group_id: groupId ?? '',
        name: '',
        pinned: false,
        last_message_at: 0,
      });

      console.log('[createConversation] Will link requestedBy to:', requesterId);

      // Add participants
      for (const participantId of participantIds) {
        const participantTxId = crypto.randomUUID();
        await actions.addParticipant({
          id: participantTxId,
          joined_at: Date.now(),
          conversation_id: conversationId,
          user_id: participantId,
          last_read_at: 0,
          left_at: 0,
        });
      }

      // Send conversation request notifications — best-effort
      try {
        if (creatorId) {
          for (const participantId of participantIds) {
            if (participantId !== creatorId) {
              await notifyConversationRequest({
                senderId: creatorId,
                senderName: '',
                recipientUserId: participantId,
              });
            }
          }
        }
      } catch { /* notification delivery is best-effort */ }
      toast.success('Conversation created');
      return { success: true, conversationId };
    } catch (error) {
      console.error('Failed to create conversation:', error);
      toast.error('Failed to create conversation');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Delete a message
   */
  const deleteMessage = async (messageId: string) => {
    setIsLoading(true);
    try {
      await actions.deleteMessage({ id: messageId });
      toast.success('Message deleted');
      return { success: true };
    } catch (error) {
      console.error('Failed to delete message:', error);
      toast.error('Failed to delete message');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (messages: Message[]) => {
    if (messages.length === 0) return;
    try {
      for (const msg of messages) {
        await actions.updateMessage({
          id: msg.id,
          is_read: true,
        });
      }
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  const acceptConversation = async (
    conversationId: string,
    params?: {
      senderId?: string;
      senderName?: string;
      requesterUserId?: string;
    }
  ) => {
    try {
      await actions.updateConversation({
        id: conversationId,
        status: 'accepted',
      });

      // Send notification to the requester
      try {
        if (params?.senderId && params?.senderName && params?.requesterUserId) {
          await notifyConversationAccepted({
            senderId: params.senderId,
            senderName: params.senderName,
            recipientUserId: params.requesterUserId,
            conversationId,
          });
        }
      } catch { /* notification delivery is best-effort */ }
      toast.success('Conversation accepted');
      return { success: true };
    } catch (error) {
      console.error('Failed to accept conversation:', error);
      toast.error('Failed to accept conversation');
      return { success: false, error };
    }
  };

  const rejectConversation = async (conversation: Conversation) => {
    try {
      for (const msg of conversation.messages) {
        await actions.deleteMessage({ id: msg.id });
      }
      for (const p of conversation.participants) {
        await actions.removeParticipant({ id: p.id });
      }
      await actions.deleteConversation({ id: conversation.id });
      toast.success('Conversation rejected');
      return { success: true };
    } catch (error) {
      console.error('Failed to reject conversation:', error);
      toast.error('Failed to reject conversation');
      return { success: false, error };
    }
  };

  const deleteConversation = async (conversation: Conversation) => {
    try {
      for (const msg of conversation.messages) {
        await actions.deleteMessage({ id: msg.id });
      }
      for (const p of conversation.participants) {
        await actions.removeParticipant({ id: p.id });
      }
      await actions.deleteConversation({ id: conversation.id });
      toast.success('Conversation deleted');
      return { success: true };
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      toast.error('Failed to delete conversation');
      return { success: false, error };
    }
  };

  const togglePin = async (conversationId: string, currentPinned: boolean) => {
    try {
      await actions.updateConversation({
        id: conversationId,
        pinned: !currentPinned,
      });
      return { success: true };
    } catch (error) {
      console.error('Failed to toggle pin:', error);
      toast.error('Failed to toggle pin');
      return { success: false, error };
    }
  };

  return {
    sendMessage,
    createConversation,
    deleteMessage,
    markAsRead,
    acceptConversation,
    rejectConversation,
    deleteConversation,
    togglePin,
    isLoading,
  };
}
