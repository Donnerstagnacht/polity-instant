import { useState, useMemo } from 'react';
import db, { tx } from '../../../../db/db';
import { toast } from 'sonner';

/**
 * Hook to query notifications for a user
 */
export function useUserNotifications(userId?: string) {
  const { data, isLoading } = db.useQuery(
    userId
      ? {
          notifications: {
            $: {
              where: {
                'recipient.id': userId,
              },
            },
            sender: {},
            recipient: {},
          },
        }
      : null
  );

  const notifications = useMemo(() => data?.notifications || [], [data]);

  const { unreadNotifications, readNotifications } = useMemo(() => {
    const unread: any[] = [];
    const read: any[] = [];

    notifications.forEach((notification: any) => {
      if (notification.read) {
        read.push(notification);
      } else {
        unread.push(notification);
      }
    });

    return {
      unreadNotifications: unread,
      readNotifications: read,
    };
  }, [notifications]);

  const unreadCount = unreadNotifications.length;

  return {
    notifications,
    unreadNotifications,
    readNotifications,
    unreadCount,
    isLoading,
  };
}

/**
 * Hook for notification mutations
 */
export function useNotificationMutations() {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Mark a notification as read
   */
  const markAsRead = async (notificationId: string) => {
    setIsLoading(true);
    try {
      await db.transact([
        tx.notifications[notificationId].update({
          read: true,
          readAt: new Date().toISOString(),
        }),
      ]);
      return { success: true };
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = async (notificationIds: string[]) => {
    if (notificationIds.length === 0) return { success: true };

    setIsLoading(true);
    try {
      const transactions = notificationIds.map(id =>
        tx.notifications[id].update({
          read: true,
          readAt: new Date().toISOString(),
        })
      );
      await db.transact(transactions);
      toast.success('All notifications marked as read');
      return { success: true };
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Delete a notification
   */
  const deleteNotification = async (notificationId: string) => {
    setIsLoading(true);
    try {
      await db.transact([tx.notifications[notificationId].delete()]);
      toast.success('Notification deleted');
      return { success: true };
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isLoading,
  };
}
