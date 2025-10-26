import { db } from '../../db';
import { useMemo } from 'react';

/**
 * Hook to get unread notifications count for the current user
 */
export function useUnreadNotificationsCount() {
  const { user, isLoading: authLoading } = db.useAuth();

  const { data, isLoading } = db.useQuery(
    user?.id
      ? {
          notifications: {
            $: {
              where: {
                'recipient.id': user.id,
                isRead: false,
              },
            },
          },
        }
      : null
  );

  const count = useMemo(() => {
    if (!user?.id) return 0;
    const notificationCount = data?.notifications?.length || 0;

    return notificationCount;
  }, [data?.notifications, user?.id, isLoading, authLoading]);

  return { count, isLoading: authLoading || isLoading };
}

/**
 * Hook to get unread messages count for the current user
 * Counts total unread messages across all conversations
 */
export function useUnreadMessagesCount() {
  const { user, isLoading: authLoading } = db.useAuth();

  // Get user profile (like in messages page)
  const { data: userData } = db.useQuery(
    user?.id
      ? {
          $users: {
            $: {
              where: {
                id: user.id,
              },
            },
            profile: {},
          },
        }
      : null
  );

  const userProfile = userData?.$users?.[0]?.profile;

  // Query conversations (exactly like messages page)
  const { data, isLoading } = db.useQuery(
    user?.id
      ? {
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
        }
      : null
  );

  const count = useMemo(() => {
    if (!user?.id) {
      return 0;
    }

    if (!data?.conversations || !userProfile?.id) {
      if (user.id) {
        console.log('💬 [useUnreadMessagesCount] Early return - no data or userProfile');
      }
      return 0;
    }

    let totalUnread = 0;
    data.conversations.forEach((conversation: any) => {
      // Use same logic as messages page: !msg.isRead && msg.sender?.id !== userProfile?.id
      const unreadInConversation = conversation.messages.filter(
        (msg: any) => !msg.isRead && msg.sender?.id !== userProfile.id
      ).length;

      totalUnread += unreadInConversation;
    });

    return totalUnread;
  }, [data?.conversations, userProfile?.id, user?.id, authLoading]);

  return { count, isLoading: authLoading || isLoading };
}
