import { db } from '../../db';
import { useMemo } from 'react';

/**
 * Hook to get unread notifications count for the current user
 */
export function useUnreadNotificationsCount() {
  const { user } = db.useAuth();

  const { data, isLoading } = db.useQuery({
    notifications: {
      $: {
        where: {
          'recipient.id': user?.id,
          isRead: false,
        },
      },
    },
  });

  const count = useMemo(() => {
    const notificationCount = data?.notifications?.length || 0;
    console.log('🔔 [useUnreadNotificationsCount] Debug:', {
      userId: user?.id,
      notificationsData: data?.notifications,
      count: notificationCount,
      isLoading,
    });
    return notificationCount;
  }, [data?.notifications, user?.id, isLoading]);

  return { count, isLoading };
}

/**
 * Hook to get unread messages count for the current user
 * Counts total unread messages across all conversations
 */
export function useUnreadMessagesCount() {
  const { user } = db.useAuth();

  // Get user profile (like in messages page)
  const { data: userData } = db.useQuery({
    $users: {
      $: {
        where: {
          id: user?.id,
        },
      },
      profile: {},
    },
  });

  const userProfile = userData?.$users?.[0]?.profile;

  // Query conversations (exactly like messages page)
  const { data, isLoading } = db.useQuery({
    conversations: {
      participants: {
        user: {
          profile: {},
        },
      },
      messages: {
        $: {
          order: {
            createdAt: 'asc' as const,
          },
        },
        sender: {}, // sender is now a profile, not a user
      },
    },
  });

  const count = useMemo(() => {
    console.log('💬 [useUnreadMessagesCount] Raw data:', {
      userId: user?.id,
      userProfile: userProfile,
      conversationsData: data?.conversations,
      isLoading,
    });

    if (!data?.conversations || !userProfile?.id) {
      console.log('💬 [useUnreadMessagesCount] Early return - no data or userProfile');
      return 0;
    }

    let totalUnread = 0;
    data.conversations.forEach((conversation: any, index: number) => {
      // Use same logic as messages page: !msg.isRead && msg.sender?.id !== userProfile?.id
      const unreadInConversation = conversation.messages.filter(
        (msg: any) => !msg.isRead && msg.sender?.id !== userProfile.id
      ).length;

      console.log(`💬 [useUnreadMessagesCount] Conversation ${index}:`, {
        conversationId: conversation.id,
        totalMessages: conversation.messages?.length || 0,
        unreadMessages: unreadInConversation,
        userProfileId: userProfile.id,
        messages: conversation.messages?.map((msg: any) => ({
          id: msg.id,
          isRead: msg.isRead,
          senderId: msg.sender?.id,
          isFromCurrentUser: msg.sender?.id === userProfile.id,
          content: msg.content?.substring(0, 20) + '...',
        })),
      });

      totalUnread += unreadInConversation;
    });

    console.log('💬 [useUnreadMessagesCount] Final count:', {
      totalUnread,
      conversationsCount: data.conversations.length,
    });

    return totalUnread;
  }, [data?.conversations, userProfile?.id]);

  return { count, isLoading };
}
