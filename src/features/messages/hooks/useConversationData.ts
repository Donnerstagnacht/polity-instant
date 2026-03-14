import { useMessageState } from '@/zero/messages/useMessageState';
import { Conversation } from '../types/message.types';

export function useConversationData(
  userId?: string,
  cursor: { after?: string; first: number } = { first: 20 }
) {
  const { conversationsWithRelations, isLoading } = useMessageState({
    includeRelations: true,
    limit: cursor.first,
  });

  const filteredConversations = (userId
    ? (conversationsWithRelations || []).filter((c) => c.participants?.some((p) => p.user_id === userId))
    : []) as unknown as Conversation[];

  return {
    conversations: filteredConversations,
    isLoading,
    pageInfo: undefined,
  };
}
