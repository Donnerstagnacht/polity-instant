import { useMemo } from 'react';
import { Notification, NotificationFilters } from '../types/notification.types';

interface UseNotificationFiltersProps {
  notifications: Notification[];
  userId?: string;
}

export function useNotificationFilters({
  notifications,
  userId,
}: UseNotificationFiltersProps): NotificationFilters {
  const accessibleNotifications = useMemo(() => {
    return notifications.filter((n: any) => {
      // Personal notifications
      if (n.recipient?.id === userId) return true;

      // Entity notifications where user has manageNotifications right
      if (n.recipientGroup?.memberships && n.recipientGroup.memberships.length > 0) {
        const membership = n.recipientGroup.memberships[0];
        const hasManageNotificationsRight = membership.role?.actionRights?.some(
          (right: any) => right.resource === 'notifications' && right.action === 'manageNotifications'
        );
        return hasManageNotificationsRight;
      }

      if (n.recipientEvent?.participants && n.recipientEvent.participants.length > 0) {
        const participant = n.recipientEvent.participants[0];
        const hasManageNotificationsRight = participant.role?.actionRights?.some(
          (right: any) => right.resource === 'notifications' && right.action === 'manageNotifications'
        );
        return hasManageNotificationsRight;
      }

      if (n.recipientAmendment?.amendmentRoleCollaborators && n.recipientAmendment.amendmentRoleCollaborators.length > 0) {
        const collaborator = n.recipientAmendment.amendmentRoleCollaborators[0];
        const hasManageNotificationsRight = collaborator.role?.actionRights?.some(
          (right: any) => right.resource === 'notifications' && right.action === 'manageNotifications'
        );
        return hasManageNotificationsRight;
      }

      if (n.recipientBlog?.blogRoleBloggers && n.recipientBlog.blogRoleBloggers.length > 0) {
        const blogger = n.recipientBlog.blogRoleBloggers[0];
        const hasManageNotificationsRight = blogger.role?.actionRights?.some(
          (right: any) => right.resource === 'notifications' && right.action === 'manageNotifications'
        );
        return hasManageNotificationsRight;
      }

      return false;
    });
  }, [notifications, userId]);

  const unreadNotifications = useMemo(() => {
    return accessibleNotifications.filter((n: any) => !n.isRead);
  }, [accessibleNotifications]);

  const readNotifications = useMemo(() => {
    return accessibleNotifications.filter((n: any) => n.isRead);
  }, [accessibleNotifications]);

  const personalNotifications = useMemo(() => {
    return accessibleNotifications.filter(
      (n: any) => n.recipient?.id === userId
    );
  }, [accessibleNotifications, userId]);

  const entityNotifications = useMemo(() => {
    return accessibleNotifications.filter(
      (n: any) =>
        n.recipientGroup || n.recipientEvent || n.recipientAmendment || n.recipientBlog
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
