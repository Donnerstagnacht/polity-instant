import { useNavigate } from '@tanstack/react-router';
import { useCallback } from 'react';
import { Notification } from '../types/notification.types';
import { useNotificationActions as useZeroNotificationActions } from '@/zero/notifications/useNotificationActions';

export function useNotificationActions() {
  const navigate = useNavigate();
  const { markRead, deleteNotification } = useZeroNotificationActions();

  const handleNotificationClick = useCallback(
    async (notification: Notification) => {
      // Mark as read if not already
      if (!notification.isRead) {
        await markRead({ id: notification.id });
      }

      // Navigate based on related entity
      if (notification.actionUrl) {
        navigate({ to: notification.actionUrl });
      } else if (notification.relatedEntityType) {
        switch (notification.relatedEntityType) {
          case 'group':
            if (notification.relatedGroup?.id) {
              navigate({ to: `/group/${notification.relatedGroup.id}` });
            }
            break;
          case 'event':
            if (notification.relatedEvent?.id) {
              navigate({ to: `/event/${notification.relatedEvent.id}` });
            }
            break;
          case 'user':
            if (notification.relatedUser?.id) {
              navigate({ to: `/user/${notification.relatedUser.id}` });
            }
            break;
          case 'message':
            navigate({ to: '/messages' });
            break;
          case 'blog':
            if (notification.relatedBlog?.id) {
              const blogId = notification.relatedBlog.id;
              if (notification.onBehalfOfGroup?.id) {
                navigate({ to: `/group/${notification.onBehalfOfGroup.id}/blog/${blogId}` });
              } else if (notification.relatedUser?.id) {
                navigate({ to: `/user/${notification.relatedUser.id}/blog/${blogId}` });
              } else if (notification.sender?.id) {
                navigate({ to: `/user/${notification.sender.id}/blog/${blogId}` });
              }
            }
            break;
          case 'amendment':
            if (notification.relatedAmendment?.id) {
              navigate({ to: `/amendment/${notification.relatedAmendment.id}` });
            }
            break;
          default:
            break;
        }
      }
    },
    [markRead, navigate]
  );

  const handleDeleteNotification = useCallback(
    async (notificationId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      await deleteNotification({ id: notificationId });
    },
    [deleteNotification]
  );

  return {
    handleNotificationClick,
    handleDeleteNotification,
  };
}
