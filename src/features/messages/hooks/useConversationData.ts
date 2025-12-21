import db from '../../../../db/db';
import { Conversation } from '../types';

export function useConversationData(userId?: string) {
  const { data, isLoading } = db.useQuery(
    userId
      ? {
          conversations: {
            $: {
              where: {
                'participants.user.id': userId,
              },
            },
            group: {}, // Load group data for group conversations
            requestedBy: {}, // Load user who requested the conversation
            participants: {
              user: {},
            },
            messages: {
              $: {
                order: {
                  createdAt: 'asc' as const, // Sort oldest to newest (newest at bottom like WhatsApp)
                },
              },
              sender: {},
            },
          },
        }
      : null
  );

  const conversations = (data?.conversations || []) as Conversation[];

  return {
    conversations,
    isLoading,
  };
}
