import { ARIA_KAI_USER_ID } from '../constants';

/**
 * Check if a user ID belongs to the Aria & Kai system assistant.
 */
export function isAssistantUser(userId: string): boolean {
  return userId === ARIA_KAI_USER_ID;
}

/**
 * Check if a conversation includes the Aria & Kai assistant as a participant.
 * Works with any conversation shape that has a `participants` array with `user_id` or nested `user.id`.
 */
export function isAssistantConversation(
  conversation: {
    participants: ReadonlyArray<{ user_id?: string; user?: { id: string } | null }>;
  },
): boolean {
  return conversation.participants.some(
    (p) => p.user_id === ARIA_KAI_USER_ID || p.user?.id === ARIA_KAI_USER_ID,
  );
}
