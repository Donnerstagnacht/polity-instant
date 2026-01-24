import { useState } from 'react';
import db, { tx, id } from '../../../../db/db';
import { toast } from 'sonner';
import { Message, Conversation } from '../types';
import {
  notifyDirectMessage,
  notifyConversationRequest,
  notifyConversationAccepted,
} from '@/utils/notification-helpers';

export function useMessageMutations() {
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
      const messageId = id();
      const transactions: any[] = [
        tx.messages[messageId]
          .update({
            content,
            createdAt: new Date().toISOString(),
            isRead: false,
          })
          .link({
            conversation: conversationId,
            sender: senderId,
          }),
        // Update conversation lastMessageAt
        tx.conversations[conversationId].update({
          lastMessageAt: new Date().toISOString(),
        }),
      ];

      // Notify all other participants
      if (recipientUserIds) {
        recipientUserIds.forEach(recipientId => {
          if (recipientId !== senderId) {
            const notificationTxs = notifyDirectMessage({
              senderId,
              senderName: '', // Will be filled from user data
              recipientUserId: recipientId,
              conversationId,
            });
            transactions.push(...notificationTxs);
          }
        });
      }

      await db.transact(transactions);
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
      const conversationId = id();

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

      // Build the links object - all links must be in a single .link() call
      const links: Record<string, string> = {};
      if (groupId) {
        links.group = groupId;
      }
      if (requesterId) {
        links.requestedBy = requesterId;
        console.log('[createConversation] Will link requestedBy to:', requesterId);
      }

      // Create conversation with all links in one call
      const conversationTx = tx.conversations[conversationId]
        .update({
          type,
          createdAt: new Date().toISOString(),
          lastMessageAt: new Date().toISOString(),
          status: 'pending', // Default to pending
        })
        .link(links);

      const transactions: any[] = [conversationTx];

      // Add participants
      participantIds.forEach(participantId => {
        const participantTxId = id();
        transactions.push(
          tx.conversationParticipants[participantTxId]
            .update({
              joinedAt: new Date().toISOString(),
            })
            .link({
              conversation: conversationId,
              user: participantId,
            })
        );
      });

      // Send conversation request notifications to other participants
      if (creatorId) {
        participantIds.forEach(participantId => {
          if (participantId !== creatorId) {
            const notificationTxs = notifyConversationRequest({
              senderId: creatorId,
              senderName: '', // Will be filled from user data
              recipientUserId: participantId,
            });
            transactions.push(...notificationTxs);
          }
        });
      }

      await db.transact(transactions);
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
      await db.transact([tx.messages[messageId].delete()]);
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
      await db.transact(
        messages.map(msg =>
          tx.messages[msg.id].update({
            isRead: true,
          })
        )
      );
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
      const transactions: any[] = [
        tx.conversations[conversationId].update({
          status: 'accepted',
        }),
      ];

      // Send notification to the requester
      if (params?.senderId && params?.senderName && params?.requesterUserId) {
        const notificationTxs = notifyConversationAccepted({
          senderId: params.senderId,
          senderName: params.senderName,
          recipientUserId: params.requesterUserId,
          conversationId,
        });
        transactions.push(...notificationTxs);
      }

      await db.transact(transactions);
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
      const deleteTransactions = conversation.messages.map(msg => tx.messages[msg.id].delete());

      const participantTransactions = conversation.participants.map(p =>
        tx.conversationParticipants[p.id].delete()
      );

      await db.transact([
        ...deleteTransactions,
        ...participantTransactions,
        tx.conversations[conversation.id].delete(),
      ]);
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
      const deleteTransactions = conversation.messages.map(msg => tx.messages[msg.id].delete());

      const participantTransactions = conversation.participants.map(p =>
        tx.conversationParticipants[p.id].delete()
      );

      await db.transact([
        ...deleteTransactions,
        ...participantTransactions,
        tx.conversations[conversation.id].delete(),
      ]);
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
      await db.transact([
        tx.conversations[conversationId].update({
          pinned: !currentPinned,
        }),
      ]);
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
