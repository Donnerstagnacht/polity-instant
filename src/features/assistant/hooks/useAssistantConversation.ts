import { useCallback, useMemo } from 'react';
import { useMessageActions } from '@/zero/messages/useMessageActions';
import { useMessageState } from '@/zero/messages/useMessageState';
import { ARIA_KAI_USER_ID, ARIA_KAI_WELCOME_MESSAGE } from '../constants';
import { isAssistantConversation } from '../logic/assistantHelpers';

/**
 * Composition hook for the Aria & Kai assistant conversation.
 *
 * - Finds an existing assistant conversation from the user's conversation list
 * - Provides `createAssistantConversation()` to create one via Zero mutators
 */
export function useAssistantConversation(userId?: string) {
  const { conversationsWithRelations, isLoading } = useMessageState({
    includeRelations: true,
  });

  const {
    createConversation,
    addParticipant,
    sendMessage,
  } = useMessageActions();

  // Find existing assistant conversation for this user
  const assistantConversation = useMemo(() => {
    if (!userId) return undefined;
    const userConversations = (conversationsWithRelations ?? []).filter((c) =>
      c.participants?.some((p) => p.user_id === userId),
    );
    return userConversations.find((c) => isAssistantConversation(c));
  }, [conversationsWithRelations, userId]);

  /**
   * Create a new conversation with Aria & Kai for the given user.
   * Creates the conversation, adds both participants, and sends the welcome message.
   */
  const createAssistantConversation = useCallback(async () => {
    if (!userId) {
      console.warn('[useAssistantConversation] No userId — skipping creation');
      return;
    }

    console.log('[useAssistantConversation] Creating assistant conversation for user:', userId);
    const now = Date.now();
    const conversationId = crypto.randomUUID();

    // 1. Create the conversation
    console.log('[useAssistantConversation] Step 1: Creating conversation', conversationId);
    await createConversation({
      id: conversationId,
      type: 'direct',
      status: 'accepted',
      name: null,
      pinned: null,
      last_message_at: now,
      group_id: null,
    });

    // 2. Add the user as participant
    console.log('[useAssistantConversation] Step 2: Adding user participant');
    await addParticipant({
      id: crypto.randomUUID(),
      conversation_id: conversationId,
      user_id: userId,
      joined_at: now,
      last_read_at: null,
      left_at: null,
    });

    // 3. Add Aria & Kai as participant
    console.log('[useAssistantConversation] Step 3: Adding Aria & Kai participant');
    await addParticipant({
      id: crypto.randomUUID(),
      conversation_id: conversationId,
      user_id: ARIA_KAI_USER_ID,
      joined_at: now,
      last_read_at: now,
      left_at: null,
    });

    // 4. Send the welcome message
    console.log('[useAssistantConversation] Step 4: Sending welcome message');
    await sendMessage({
      id: crypto.randomUUID(),
      conversation_id: conversationId,
      content: ARIA_KAI_WELCOME_MESSAGE,
      deleted_at: 0,
    });

    console.log('[useAssistantConversation] ✅ Assistant conversation created successfully:', conversationId);
  }, [userId, createConversation, addParticipant, sendMessage]);

  return {
    assistantConversation,
    createAssistantConversation,
    isLoading,
  };
}
