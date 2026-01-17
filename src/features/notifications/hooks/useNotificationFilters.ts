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

      // Entity notifications where user has relevant management rights
      if (n.recipientGroup?.memberships && n.recipientGroup.memberships.length > 0) {
        const membership = n.recipientGroup.memberships[0];
        // Check for manageNotifications OR groupMemberships manage right
        // This allows users with "Manage Members" to see membership requests
        const hasRelevantRight = membership.role?.actionRights?.some(
          (right: any) =>
            (right.resource === 'groupNotifications' && right.action === 'manageNotifications') ||
            (right.resource === 'groupMemberships' && right.action === 'manage') ||
            (right.resource === 'groups' && right.action === 'manage')
        );
        return hasRelevantRight;
      }

      if (n.recipientEvent?.participants && n.recipientEvent.participants.length > 0) {
        const participant = n.recipientEvent.participants[0];
        // Check for manageNotifications OR eventParticipants manage right
        const hasRelevantRight = participant.role?.actionRights?.some(
          (right: any) =>
            (right.resource === 'groupNotifications' && right.action === 'manageNotifications') ||
            (right.resource === 'eventParticipants' && right.action === 'manage') ||
            (right.resource === 'events' && right.action === 'manage')
        );
        return hasRelevantRight;
      }

      if (n.recipientAmendment?.amendmentRoleCollaborators && n.recipientAmendment.amendmentRoleCollaborators.length > 0) {
        const collaborator = n.recipientAmendment.amendmentRoleCollaborators[0];
        // Check for manageNotifications OR amendments manage right
        const hasRelevantRight = collaborator.role?.actionRights?.some(
          (right: any) =>
            (right.resource === 'groupNotifications' && right.action === 'manageNotifications') ||
            (right.resource === 'amendments' && right.action === 'manage')
        );
        return hasRelevantRight;
      }

      if (n.recipientBlog?.blogRoleBloggers && n.recipientBlog.blogRoleBloggers.length > 0) {
        const blogger = n.recipientBlog.blogRoleBloggers[0];
        // Check for manageNotifications OR blogBloggers manage right
        const hasRelevantRight = blogger.role?.actionRights?.some(
          (right: any) =>
            (right.resource === 'groupNotifications' && right.action === 'manageNotifications') ||
            (right.resource === 'blogBloggers' && right.action === 'manage') ||
            (right.resource === 'blogs' && right.action === 'manage')
        );
        return hasRelevantRight;
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
