import { useMemo, useState } from 'react';
import { Conversation, Message } from '../types';

export function useConversationFilters(conversations: Conversation[]) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) {
      // Sort conversations: pinned first, then by lastMessageAt (newest first)
      return [...conversations].sort((a, b) => {
        // First, sort by pinned status
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;

        // Then sort by lastMessageAt
        const timeA = new Date(a.lastMessageAt || 0).getTime();
        const timeB = new Date(b.lastMessageAt || 0).getTime();
        return timeB - timeA; // Newest first
      });
    }

    return conversations
      .filter((conv: Conversation) => {
        // Search in participant names
        const participantMatch = conv.participants.some(p => {
          const name = p.user?.name?.toLowerCase() || '';
          const handle = p.user?.handle?.toLowerCase() || '';
          return (
            name.includes(searchQuery.toLowerCase()) || handle.includes(searchQuery.toLowerCase())
          );
        });

        // Search in messages
        const messageMatch = conv.messages.some((msg: Message) =>
          msg.content.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return participantMatch || messageMatch;
      })
      .sort((a, b) => {
        // First, sort by pinned status
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;

        // Sort by lastMessageAt (newest first)
        const timeA = new Date(a.lastMessageAt || 0).getTime();
        const timeB = new Date(b.lastMessageAt || 0).getTime();
        return timeB - timeA;
      });
  }, [conversations, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredConversations,
  };
}
