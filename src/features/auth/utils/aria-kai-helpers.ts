/**
 * Aria & Kai Helpers
 * Utilities for initializing conversations with the Aria & Kai assistant
 */

import { createClient } from '@supabase/supabase-js';
import { ARIA_KAI_USER_ID, ARIA_KAI_WELCOME_MESSAGE } from '../constants';

function getSupabase() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

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
    const { data: ariaKaiUser } = await getSupabase()
      .from('user')
      .select('*')
      .eq('id', ARIA_KAI_USER_ID)
      .single();

    if (!ariaKaiUser) {
      console.error('❌ Aria & Kai user not found in database');
      const error = new Error(ARIA_KAI_ERRORS.NOT_FOUND);
      error.name = 'AriaKaiNotFoundError';
      throw error;
    }

    console.log('✅ Aria & Kai user exists:', ariaKaiUser.first_name);
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
    const { data: participants } = await getSupabase()
      .from('conversation_participant')
      .select('*, conversation:conversation(*, requested_by:user!conversation_requested_by_fkey(*))')
      .eq('user_id', userId);

    const hasConversation = (participants ?? []).some(
      (participant: any) => participant.conversation?.requested_by?.id === ARIA_KAI_USER_ID
    );

    console.log(hasConversation ? '✅ Found existing Aria & Kai conversation' : '❌ No Aria & Kai conversation found');
    return hasConversation || false;
  } catch (error) {
    console.error('❌ Failed to check for existing conversation:', error);
    return false;
  }
}

/**
 * Create a conversation between a user and Aria & Kai
 * Does NOT create or update the Aria & Kai user record - assumes it exists
 * 
 * @param userId - The ID of the user to create the conversation for
 */
export async function createAriaKaiConversation(userId: string): Promise<void> {
  console.log('📝 Creating Aria & Kai conversation for user:', userId);
  
  const now = Date.now();
  const conversationId = crypto.randomUUID();
  const messageId = crypto.randomUUID();

  const supabase = getSupabase();
  // Create the conversation
  await supabase.from('conversation').insert({
    id: conversationId,
    last_message_at: now,
    created_at: now,
    type: 'direct',
    status: 'accepted',
    requested_by: ARIA_KAI_USER_ID,
  });

  // Add user as participant
  await supabase.from('conversation_participant').insert({
    id: crypto.randomUUID(),
    last_read_at: null,
    joined_at: now,
    left_at: null,
    user_id: userId,
    conversation_id: conversationId,
  });

  // Add Aria & Kai as participant (message already read by them)
  await supabase.from('conversation_participant').insert({
    id: crypto.randomUUID(),
    last_read_at: now,
    joined_at: now,
    left_at: null,
    user_id: ARIA_KAI_USER_ID,
    conversation_id: conversationId,
  });

  // Create welcome message from Aria & Kai
  await supabase.from('message').insert({
    id: messageId,
    content: ARIA_KAI_WELCOME_MESSAGE,
    is_read: false,
    created_at: now,
    updated_at: null,
    deleted_at: null,
    conversation_id: conversationId,
    sender_id: ARIA_KAI_USER_ID,
  });

  console.log('✅ Created Aria & Kai conversation:', {
    conversationId,
    messageId,
  });
}
