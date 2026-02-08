/**
 * Aria & Kai Helpers
 * Utilities for initializing conversations with the Aria & Kai assistant
 */

import { db, tx, id } from '../../../../db/db';
import { ARIA_KAI_USER_ID, ARIA_KAI_WELCOME_MESSAGE } from '../constants';

// Error message keys for i18n
export const ARIA_KAI_ERRORS = {
  NOT_FOUND: 'features.auth.errors.systemAssistantNotFound',
  CHECK_FAILED: 'features.auth.errors.systemAssistantCheckFailed',
} as const;

/**
 * Check if Aria & Kai user exists in the database
 * Throws an error if the user does not exist
 * This should be called before attempting to create conversations
 */
export async function checkAriaKaiExists(): Promise<void> {
  console.log('🔍 Checking if Aria & Kai user exists...');
  
  try {
    const { data } = await db.queryOnce({
      $users: {
        $: { where: { id: ARIA_KAI_USER_ID } },
      },
    });

    const ariaKaiUser = data?.$users?.[0];

    if (!ariaKaiUser) {
      console.error('❌ Aria & Kai user not found in database');
      const error = new Error(ARIA_KAI_ERRORS.NOT_FOUND);
      error.name = 'AriaKaiNotFoundError';
      throw error;
    }

    console.log('✅ Aria & Kai user exists:', ariaKaiUser.name);
  } catch (error) {
    if (error instanceof Error && error.message.includes('System assistant')) {
      throw error;
    }
    console.error('❌ Failed to check Aria & Kai existence:', error);
    const checkError = new Error(ARIA_KAI_ERRORS.CHECK_FAILED);
    checkError.name = 'AriaKaiCheckError';
    throw checkError;
  }
}

/**
 * Check if a conversation with Aria & Kai already exists for the user
 * 
 * @param userId - The ID of the user to check
 * @returns True if conversation exists, false otherwise
 */
export async function hasAriaKaiConversation(userId: string): Promise<boolean> {
  console.log('🔍 Checking for existing Aria & Kai conversation for user:', userId);
  
  try {
    const { data } = await db.queryOnce({
      conversationParticipants: {
        $: {
          where: {
            'user.id': userId,
          },
        },
        conversation: {
          requestedBy: {},
        },
      },
    });

    const hasConversation = data?.conversationParticipants?.some(
      (participant: any) => participant.conversation?.requestedBy?.id === ARIA_KAI_USER_ID
    );

    console.log(hasConversation ? '✅ Found existing Aria & Kai conversation' : '❌ No Aria & Kai conversation found');
    return hasConversation || false;
  } catch (error) {
    console.error('❌ Failed to check for existing conversation:', error);
    return false;
  }
}

/**
 * Build transactions to create a conversation between a user and Aria & Kai
 * Does NOT create or update the Aria & Kai user record - assumes it exists
 * 
 * @param userId - The ID of the user to create the conversation for
 * @returns Array of transactions to be executed
 */
export function buildAriaKaiConversationTransactions(userId: string): any[] {
  console.log('📝 Building Aria & Kai conversation transactions for user:', userId);
  
  const now = Date.now();
  const conversationId = id();
  const messageId = id();

  const transactions = [
    // Create the conversation
    tx.conversations[conversationId].update({
      lastMessageAt: now,
      createdAt: now,
      type: 'direct',
      status: 'accepted',
    }),
    
    // Link conversation to Aria & Kai as the requester
    tx.conversations[conversationId].link({
      requestedBy: ARIA_KAI_USER_ID,
    }),
    
    // Add user as participant
    tx.conversationParticipants[id()]
      .update({
        lastReadAt: null,
        joinedAt: now,
        leftAt: null,
      })
      .link({ user: userId, conversation: conversationId }),
    
    // Add Aria & Kai as participant (message already read by them)
    tx.conversationParticipants[id()]
      .update({
        lastReadAt: now,
        joinedAt: now,
        leftAt: null,
      })
      .link({ user: ARIA_KAI_USER_ID, conversation: conversationId }),
    
    // Create welcome message from Aria & Kai
    tx.messages[messageId]
      .update({
        content: ARIA_KAI_WELCOME_MESSAGE,
        isRead: false,
        createdAt: now,
        updatedAt: null,
        deletedAt: null,
      })
      .link({ conversation: conversationId, sender: ARIA_KAI_USER_ID }),
  ];

  console.log('✅ Built Aria & Kai conversation transactions:', {
    conversationId,
    messageId,
    transactionCount: transactions.length,
  });

  return transactions;
}
