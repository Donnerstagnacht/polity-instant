import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

/**
 * Add a user to a group's conversation
 * @param groupId - The group ID
 * @param userId - The user ID to add
 */
export async function addUserToGroupConversation(groupId: string, userId: string) {
  try {
    const { data: conversations } = await supabase
      .from('conversation')
      .select('*, conversation_participant(*)')
      .eq('group_id', groupId)
      .eq('type', 'group');

    const groupConversation = conversations?.[0];

    if (!groupConversation) {
      console.warn(`No conversation found for group ${groupId}. User ${userId} was not added.`);
      return;
    }

    // Check if user is already a participant
    const existingParticipant = groupConversation.conversation_participant?.find(
      (p: any) => p.user_id === userId
    );
    if (existingParticipant) {
      console.log('User is already a participant in the conversation');
      return;
    }

    const conversationParticipantId = crypto.randomUUID();
    const { error } = await supabase.from('conversation_participant').insert({
      id: conversationParticipantId,
      joined_at: new Date().toISOString(),
      conversation_id: groupConversation.id,
      user_id: userId,
    });

    if (error) {
      console.error('Failed to insert conversation participant:', error);
      return;
    }

    console.log(`Added user ${userId} to group conversation ${groupConversation.id}`);
  } catch (error) {
    console.error('Failed to add user to group conversation:', error);
  }
}

/**
 * Remove a user from a group's conversation
 * @param groupId - The group ID
 * @param userId - The user ID to remove
 */
export async function removeUserFromGroupConversation(groupId: string, userId: string) {
  try {
    const { data: conversations } = await supabase
      .from('conversation')
      .select('*, conversation_participant(*)')
      .eq('group_id', groupId)
      .eq('type', 'group');

    const groupConversation = conversations?.[0];
    const participant = groupConversation?.conversation_participant?.find(
      (p: any) => p.user_id === userId
    );

    if (participant) {
      await supabase.from('conversation_participant').delete().eq('id', participant.id);
    }
  } catch (error) {
    console.error('Failed to remove user from group conversation:', error);
  }
}

/**
 * Sync group name to conversation name
 * @param groupId - The group ID
 * @param newName - The new group name
 */
export async function syncGroupNameToConversation(groupId: string, newName: string) {
  try {
    const { data: conversations } = await supabase
      .from('conversation')
      .select('*')
      .eq('group_id', groupId)
      .eq('type', 'group');

    const groupConversation = conversations?.[0];

    if (groupConversation) {
      await supabase
        .from('conversation')
        .update({
          name: newName,
          last_message_at: new Date().toISOString(),
        })
        .eq('id', groupConversation.id);
    }
  } catch (error) {
    console.error('Failed to sync group name to conversation:', error);
  }
}

/**
 * Delete a group's conversation and all related data
 * @param groupId - The group ID
 */
export async function deleteGroupConversation(groupId: string) {
  try {
    const { data: conversations } = await supabase
      .from('conversation')
      .select('*, conversation_participant(*), message(*)')
      .eq('group_id', groupId)
      .eq('type', 'group');

    const groupConversation = conversations?.[0];

    if (groupConversation) {
      // Delete messages
      if (groupConversation.message?.length) {
        const messageIds = groupConversation.message.map((msg: any) => msg.id);
        await supabase.from('message').delete().in('id', messageIds);
      }

      // Delete participants
      if (groupConversation.conversation_participant?.length) {
        const participantIds = groupConversation.conversation_participant.map((p: any) => p.id);
        await supabase.from('conversation_participant').delete().in('id', participantIds);
      }

      // Delete conversation
      await supabase.from('conversation').delete().eq('id', groupConversation.id);
    }
  } catch (error) {
    console.error('Failed to delete group conversation:', error);
  }
}
