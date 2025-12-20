import { useState, useMemo } from 'react';
import db, { tx, id } from '../../../../db/db';
import { toast } from 'sonner';

/**
 * Hook to query conversation data
 */
export function useConversationData(conversationId?: string) {
  const { data, isLoading } = db.useQuery(
    conversationId
      ? {
          conversations: {
            $: { where: { id: conversationId } },
            participants: {
              user: {},
            },
            messages: {
              sender: {},
            },
            group: {},
          },
        }
      : null
  );

  const conversation = useMemo(() => data?.conversations?.[0] || null, [data]);
  const messages = useMemo(() => conversation?.messages || [], [conversation]);
  const participants = useMemo(() => conversation?.participants || [], [conversation]);

  return {
    conversation,
    messages,
    participants,
    isLoading,
  };
}

/**
 * Hook to query user's conversations
 */
export function useUserConversations(userId?: string) {
  const { data, isLoading } = db.useQuery(
    userId
      ? {
          conversationParticipants: {
            $: {
              where: {
                'user.id': userId,
              },
            },
            conversation: {
              participants: {
                user: {},
              },
              messages: {
                sender: {},
              },
              group: {},
            },
          },
        }
      : null
  );

  const conversations = useMemo(() => {
    return (
      data?.conversationParticipants?.map((cp: any) => cp.conversation).filter(Boolean) || []
    );
  }, [data]);

  return {
    conversations,
    isLoading,
  };
}

/**
 * Hook for message mutations
 */
export function useMessageMutations() {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Send a message to a conversation
   */
  const sendMessage = async (conversationId: string, senderId: string, content: string) => {
    setIsLoading(true);
    try {
      const messageId = id();
      await db.transact([
        tx.messages[messageId]
          .update({
            content,
            createdAt: new Date().toISOString(),
          })
          .link({
            conversation: conversationId,
            sender: senderId,
          }),
      ]);
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
    groupId?: string
  ) => {
    setIsLoading(true);
    try {
      const conversationId = id();
      const conversationTx = tx.conversations[conversationId].update({
        type,
        createdAt: new Date().toISOString(),
      });

      if (groupId) {
        conversationTx.link({ group: groupId });
      }

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

  return {
    sendMessage,
    createConversation,
    deleteMessage,
    isLoading,
  };
}
