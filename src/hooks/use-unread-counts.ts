import { useMemo } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { filterAccessibleNotifications } from '@/features/notifications/logic/notificationHelpers';
import { useUserNotifications } from '@/features/notifications/hooks/useUserNotifications';
import { useMessageState } from '@/zero/messages/useMessageState';

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
    return accessible.filter((n: any) => !n.is_read).length;
  }, [data?.notifications, userId]);

  return { count, isLoading };
}

/**
 * Hook to get unread messages count for the current user
 * Counts total unread messages across all conversations
 */
export function useUnreadMessagesCount() {
  const { user } = useAuth();

  const { conversationsForUnread: conversations, isLoading } = useMessageState({
    includeForUnread: !!user?.id,
  });

  const count = useMemo(() => {
    if (!user?.id || !conversations) {
      return 0;
    }

    let totalUnread = 0;
    conversations.forEach((conversation: any) => {
      const unreadInConversation = conversation.messages.filter(
        (msg: any) => !msg.is_read && msg.sender?.id !== user.id
      ).length;

      totalUnread += unreadInConversation;
    });

    return totalUnread;
  }, [conversations, user?.id]);

  return { count, isLoading };
}
