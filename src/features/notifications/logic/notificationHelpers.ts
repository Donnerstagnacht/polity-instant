import type { Notification } from '../types/notification.types';

/**
 * Constructs a display name from a user's first/last name fields.
 */
export function getDisplayName(user: { first_name?: string | null; last_name?: string | null; email?: string | null } | undefined | null): string {
  if (!user) return 'Unknown';
  return [user.first_name, user.last_name].filter(Boolean).join(' ') || String(user.email ?? 'Unknown');
}

/**
 * Filter notifications to only those the user has access to,
 * based on personal recipient or entity RBAC rights.
 * Shared between useNotificationFilters and useUnreadNotificationsCount.
 */
export function filterAccessibleNotifications(notifications: Notification[], userId?: string): Notification[] {
  if (!userId) return [];

  return notifications.filter(n => {
    // Personal notifications
    if (n.recipient?.id === userId) return true;

    // Entity notifications where user has relevant management rights
    if (n.recipient_group?.memberships && n.recipient_group.memberships.length > 0) {
      const membership = n.recipient_group.memberships[0];
      return membership.role?.action_rights?.some(
        right =>
          (right.resource === 'groupNotifications' && right.action === 'viewNotifications') ||
          (right.resource === 'groupNotifications' && right.action === 'manageNotifications') ||
          (right.resource === 'groupMemberships' && right.action === 'manage') ||
          (right.resource === 'groups' && right.action === 'manage')
      );
    }

    if (n.recipient_event?.participants && n.recipient_event.participants.length > 0) {
      const participant = n.recipient_event.participants[0];
      return participant.role?.action_rights?.some(
        right =>
          (right.resource === 'groupNotifications' && right.action === 'viewNotifications') ||
          (right.resource === 'groupNotifications' && right.action === 'manageNotifications') ||
          (right.resource === 'eventParticipants' && right.action === 'manage') ||
          (right.resource === 'events' && right.action === 'manage')
      );
    }

    if (n.recipient_amendment?.collaborators && n.recipient_amendment.collaborators.length > 0) {
      return true; // User is a collaborator on this amendment
    }

    if (n.recipient_blog?.bloggers && n.recipient_blog.bloggers.length > 0) {
      const blogger = n.recipient_blog.bloggers[0];
      return blogger.role?.action_rights?.some(
        right =>
          (right.resource === 'groupNotifications' && right.action === 'viewNotifications') ||
          (right.resource === 'groupNotifications' && right.action === 'manageNotifications') ||
          (right.resource === 'blogBloggers' && right.action === 'manage') ||
          (right.resource === 'blogs' && right.action === 'manage')
      );
    }

    return false;
  });
}

export function formatTime(date: string | number): string {
  const now = new Date();
  const notifDate = new Date(date);
  const diffInHours = (now.getTime() - notifDate.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInHours * 60);
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`;
  } else if (diffInHours < 168) {
    // 7 days
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  } else {
    return notifDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
}


