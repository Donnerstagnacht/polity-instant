import { db, tx, id } from '../../db';

/**
 * Add a user to a group's conversation
 * @param groupId - The group ID
 * @param userId - The user ID to add
 */
export async function addUserToGroupConversation(groupId: string, userId: string) {
  try {
    const conversationQuery = await db.queryOnce({
      conversations: {
        $: {
          where: {
            'group.id': groupId,
            type: 'group',
          },
        },
        participants: {
          $: {
            where: {
              'user.id': userId,
            },
          },
        },
      },
    });

    const groupConversation = conversationQuery?.data?.conversations?.[0];

    if (!groupConversation) {
      console.warn(`No conversation found for group ${groupId}. User ${userId} was not added.`);
      return;
    }

    // Check if user is already a participant
    const existingParticipant = groupConversation?.participants?.[0];
    if (existingParticipant) {
      console.log('User is already a participant in the conversation');
      return;
    }

    const conversationParticipantId = id();
    await db.transact([
      tx.conversationParticipants[conversationParticipantId]
        .update({
          joinedAt: new Date().toISOString(),
        })
        .link({
          conversation: groupConversation.id,
          user: userId,
        }),
    ]);

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
    const conversationQuery = await db.queryOnce({
      conversations: {
        $: {
          where: {
            'group.id': groupId,
            type: 'group',
          },
        },
        participants: {
          $: {
            where: {
              'user.id': userId,
            },
          },
        },
      },
    });

    const groupConversation = conversationQuery?.data?.conversations?.[0];
    const participant = groupConversation?.participants?.[0];

    if (participant) {
      await db.transact([tx.conversationParticipants[participant.id].delete()]);
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
    const conversationQuery = await db.queryOnce({
      conversations: {
        $: {
          where: {
            'group.id': groupId,
            type: 'group',
          },
        },
      },
    });

    const groupConversation = conversationQuery?.data?.conversations?.[0];

    if (groupConversation) {
      await db.transact([
        tx.conversations[groupConversation.id].update({
          name: newName,
          lastMessageAt: new Date().toISOString(), // Bump to show in list
        }),
      ]);
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
    const conversationQuery = await db.queryOnce({
      conversations: {
        $: {
          where: {
            'group.id': groupId,
            type: 'group',
          },
        },
        participants: {},
        messages: {},
      },
    });

    const groupConversation = conversationQuery?.data?.conversations?.[0];

    if (groupConversation) {
      const messageTransactions =
        groupConversation.messages?.map((msg: any) => tx.messages[msg.id].delete()) || [];

      const participantTransactions =
        groupConversation.participants?.map((p: any) =>
          tx.conversationParticipants[p.id].delete()
        ) || [];

      await db.transact([
        ...messageTransactions,
        ...participantTransactions,
        tx.conversations[groupConversation.id].delete(),
      ]);
    }
  } catch (error) {
    console.error('Failed to delete group conversation:', error);
  }
}
