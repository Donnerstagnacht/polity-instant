import { useMemo, useState } from 'react';
import { Conversation, Message } from '../types/message.types';

export function useConversationFilters(conversations: readonly Conversation[]) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) {
      // Sort conversations: pinned first, then by last_message_at (newest first)
      return [...conversations].sort((a, b) => {
        // First, sort by pinned status
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;

        // Then sort by last_message_at
        const timeA = a.last_message_at || 0;
        const timeB = b.last_message_at || 0;
        return timeB - timeA; // Newest first
      });
    }

    return conversations
      .filter((conv: Conversation) => {
        // Search in participant names
        const participantMatch = conv.participants.some(p => {
          const name = [p.user?.first_name, p.user?.last_name].filter(Boolean).join(' ').toLowerCase();
          const handle = p.user?.handle?.toLowerCase() || '';
          return (
            name.includes(searchQuery.toLowerCase()) || handle.includes(searchQuery.toLowerCase())
          );
        });

        // Search in messages
        const messageMatch = conv.messages.some((msg: Message) =>
          (msg.content ?? '').toLowerCase().includes(searchQuery.toLowerCase())
        );

        return participantMatch || messageMatch;
      })
      .sort((a, b) => {
        // First, sort by pinned status
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;

        // Sort by last_message_at (newest first)
        const timeA = a.last_message_at || 0;
        const timeB = b.last_message_at || 0;
        return timeB - timeA;
      });
  }, [conversations, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredConversations,
  };
}
