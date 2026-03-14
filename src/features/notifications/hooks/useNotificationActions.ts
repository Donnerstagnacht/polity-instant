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
      if (!notification.is_read) {
        await markRead({ id: notification.id });
      }

      // Navigate based on related entity
      if (notification.action_url) {
        navigate({ to: notification.action_url });
      } else if (notification.related_entity_type) {
        switch (notification.related_entity_type) {
          case 'group':
            if (notification.related_group?.id) {
              navigate({ to: `/group/${notification.related_group.id}` });
            }
            break;
          case 'event':
            if (notification.related_event?.id) {
              navigate({ to: `/event/${notification.related_event.id}` });
            }
            break;
          case 'user':
            if (notification.related_user?.id) {
              navigate({ to: `/user/${notification.related_user.id}` });
            }
            break;
          case 'message':
            navigate({ to: '/messages' });
            break;
          case 'blog':
            if (notification.related_blog?.id) {
              const blogId = notification.related_blog.id;
              if (notification.on_behalf_of_group?.id) {
                navigate({ to: `/group/${notification.on_behalf_of_group.id}/blog/${blogId}` });
              } else if (notification.related_user?.id) {
                navigate({ to: `/user/${notification.related_user.id}/blog/${blogId}` });
              } else if (notification.sender?.id) {
                navigate({ to: `/user/${notification.sender.id}/blog/${blogId}` });
              }
            }
            break;
          case 'amendment':
            if (notification.related_amendment?.id) {
              navigate({ to: `/amendment/${notification.related_amendment.id}` });
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
