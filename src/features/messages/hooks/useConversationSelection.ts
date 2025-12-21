import { useState, useEffect, useMemo } from 'react';
import { Conversation } from '../types';
import { ARIA_KAI_USER_ID } from '../../../../e2e/aria-kai';

export function useConversationSelection(conversations: Conversation[]) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  // Check URL params for auto-opening Aria & Kai conversation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const shouldOpenAriaKai = params.get('openAriaKai') === 'true';

      if (shouldOpenAriaKai && conversations.length > 0) {
        // Find Aria & Kai conversation
        const ariaKaiConversation = conversations.find((conv) =>
          conv.participants.some((p) => p.user?.id === ARIA_KAI_USER_ID)
        );

        if (ariaKaiConversation) {
          setSelectedConversationId(ariaKaiConversation.id);
          // Clean up URL
          window.history.replaceState({}, '', '/messages');
        }
      }
    }
  }, [conversations]);

  // Get selected conversation with sorted messages
  const selectedConversation = useMemo(() => {
    const conversation = conversations.find(
      (conv) => conv.id === selectedConversationId
    );
    if (!conversation) return undefined;

    // Sort messages by createdAt timestamp (oldest to newest, like WhatsApp)
    const sortedMessages = [...conversation.messages].sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return timeA - timeB;
    });

    return {
      ...conversation,
      messages: sortedMessages,
    } as Conversation;
  }, [conversations, selectedConversationId]);

  return {
    selectedConversationId,
    setSelectedConversationId,
    selectedConversation,
  };
}
