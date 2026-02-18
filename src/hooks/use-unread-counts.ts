import { db } from '../../db/db';
import { useMemo } from 'react';
import { filterAccessibleNotifications } from '@/features/notifications/utils/notificationHelpers';
import { useUserNotifications } from '@/features/notifications/hooks/useUserNotifications';

/**
 * Hook to get unread notifications count for the current user
 * Uses the same server-side filtered query as NotificationsPage
 */
export function useUnreadNotificationsCount() {
  const { data, isLoading, userId } = useUserNotifications();

  const count = useMemo(() => {
    if (!userId) return 0;
    const notifications = (data?.notifications || []) as any[];
    const accessible = filterAccessibleNotifications(notifications, userId);
    return accessible.filter((n: any) => !n.isRead).length;
  }, [data?.notifications, userId]);

  return { count, isLoading };
}

/**
 * Hook to get unread messages count for the current user
 * Counts total unread messages across all conversations
 */
export function useUnreadMessagesCount() {
  const { user, isLoading: authLoading } = db.useAuth();



  // Get user data (like in messages page)
  const { data: userData } = db.useQuery(
    user?.id
      ? {
          $users: {
            $: {
              where: {
                id: user.id,
              },
            },
          },
        }
      : null
  );

  const currentUser = userData?.$users?.[0];

  // Query conversations (exactly like messages page) - only where user is a participant
  const { data, isLoading } = db.useQuery(
    user?.id
      ? {
          conversations: {
            $: {
              where: {
                'participants.user.id': user.id,
              },
            },
            participants: {
              user: {},
            },
            messages: {
              $: {
                order: {
                  createdAt: 'asc' as const,
                },
              },
              sender: {},
            },
          },
        }
      : null
  );

  const count = useMemo(() => {
    if (!user?.id) {
      return 0;
    }

    if (!data?.conversations || !currentUser?.id) {
      if (user.id) {
        // User exists but no conversation data available yet
      }
      return 0;
    }

    let totalUnread = 0;
    data.conversations.forEach((conversation: any) => {
      // Use same logic as messages page: !msg.isRead && msg.sender?.id !== currentUser?.id
      const unreadInConversation = conversation.messages.filter(
        (msg: any) => !msg.isRead && msg.sender?.id !== currentUser.id
      ).length;

      totalUnread += unreadInConversation;
    });

    return totalUnread;
  }, [data?.conversations, currentUser?.id, user?.id]);

  return { count, isLoading: authLoading || isLoading };
}
