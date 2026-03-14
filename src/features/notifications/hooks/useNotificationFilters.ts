import { useMemo } from 'react';
import { Notification, NotificationFilters } from '../types/notification.types';
import { filterAccessibleNotifications } from '../logic/notificationHelpers';

interface UseNotificationFiltersProps {
  notifications: Notification[];
  userId?: string;
}

export function useNotificationFilters({
  notifications,
  userId,
}: UseNotificationFiltersProps): NotificationFilters {
  const accessibleNotifications = useMemo(
    () => filterAccessibleNotifications(notifications, userId),
    [notifications, userId]
  );

  const unreadNotifications = useMemo(() => {
    return accessibleNotifications.filter(n => !n.isRead);
  }, [accessibleNotifications]);

  const readNotifications = useMemo(() => {
    return accessibleNotifications.filter(n => n.isRead);
  }, [accessibleNotifications]);

  const personalNotifications = useMemo(() => {
    return accessibleNotifications.filter(
      n => n.recipient?.id === userId
    );
  }, [accessibleNotifications, userId]);

  const entityNotifications = useMemo(() => {
    return accessibleNotifications.filter(
      n =>
        n.recipientGroup || n.recipientEvent || n.recipientAmendment || n.recipientBlog ||
        n.onBehalfOfGroup || n.onBehalfOfEvent || n.onBehalfOfAmendment || n.onBehalfOfBlog
    );
  }, [accessibleNotifications]);

  return {
    all: accessibleNotifications,
    unread: unreadNotifications,
    read: readNotifications,
    personal: personalNotifications,
    entity: entityNotifications,
  };
}
