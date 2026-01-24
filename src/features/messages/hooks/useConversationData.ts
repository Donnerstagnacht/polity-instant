import db from '../../../../db/db';
import { Conversation } from '../types';

export function useConversationData(
  userId?: string,
  cursor: { after?: string; first: number } = { first: 20 }
) {
  const { data, isLoading, pageInfo } = db.useQuery(
    userId
      ? {
          conversations: {
            $: {
              where: {
                'participants.user.id': userId,
              },
              ...cursor,
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
    pageInfo,
  };
}
