import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { Notification } from '../types/notification.types';
import { useNotificationMutations } from './useNotificationData';

export function useNotificationActions() {
  const router = useRouter();
  const { markAsRead, deleteNotification: deleteNotificationMutation } = useNotificationMutations();

  const handleNotificationClick = useCallback(
    async (notification: Notification) => {
      // Mark as read if not already
      if (!notification.isRead) {
        await markAsRead(notification.id);
      }

      // Navigate based on related entity
      if (notification.actionUrl) {
        router.push(notification.actionUrl);
      } else if (notification.relatedEntityType) {
        switch (notification.relatedEntityType) {
          case 'group':
            if (notification.relatedGroup?.id) {
              router.push(`/group/${notification.relatedGroup.id}`);
            }
            break;
          case 'event':
            if (notification.relatedEvent?.id) {
              router.push(`/event/${notification.relatedEvent.id}`);
            }
            break;
          case 'user':
            if (notification.relatedUser?.id) {
              router.push(`/user/${notification.relatedUser.id}`);
            }
            break;
          case 'message':
            router.push('/messages');
            break;
          case 'blog':
            if (notification.relatedBlog?.id) {
              router.push(`/blog/${notification.relatedBlog.id}`);
            }
            break;
          case 'amendment':
            if (notification.relatedAmendment?.id) {
              router.push(`/amendment/${notification.relatedAmendment.id}`);
            }
            break;
          default:
            break;
        }
      }
    },
    [markAsRead, router]
  );

  const handleDeleteNotification = useCallback(
    async (notificationId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      await deleteNotificationMutation(notificationId);
    },
    [deleteNotificationMutation]
  );

  return {
    handleNotificationClick,
    handleDeleteNotification,
  };
}
