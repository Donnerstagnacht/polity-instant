/**
 * Filter notifications to only those the user has access to,
 * based on personal recipient or entity RBAC rights.
 * Shared between useNotificationFilters and useUnreadNotificationsCount.
 */
export function filterAccessibleNotifications(notifications: any[], userId?: string): any[] {
  if (!userId) return [];

  return notifications.filter((n: any) => {
    // Personal notifications
    if (n.recipient?.id === userId) return true;

    // Entity notifications where user has relevant management rights
    if (n.recipientGroup?.memberships && n.recipientGroup.memberships.length > 0) {
      const membership = n.recipientGroup.memberships[0];
      return membership.role?.actionRights?.some(
        (right: any) =>
          (right.resource === 'groupNotifications' && right.action === 'manageNotifications') ||
          (right.resource === 'groupMemberships' && right.action === 'manage') ||
          (right.resource === 'groups' && right.action === 'manage')
      );
    }

    if (n.recipientEvent?.participants && n.recipientEvent.participants.length > 0) {
      const participant = n.recipientEvent.participants[0];
      return participant.role?.actionRights?.some(
        (right: any) =>
          (right.resource === 'groupNotifications' && right.action === 'manageNotifications') ||
          (right.resource === 'eventParticipants' && right.action === 'manage') ||
          (right.resource === 'events' && right.action === 'manage')
      );
    }

    if (
      n.recipientAmendment?.amendmentRoleCollaborators &&
      n.recipientAmendment.amendmentRoleCollaborators.length > 0
    ) {
      const collaborator = n.recipientAmendment.amendmentRoleCollaborators[0];
      return collaborator.role?.actionRights?.some(
        (right: any) =>
          (right.resource === 'groupNotifications' && right.action === 'manageNotifications') ||
          (right.resource === 'amendments' && right.action === 'manage')
      );
    }

    if (n.recipientBlog?.blogRoleBloggers && n.recipientBlog.blogRoleBloggers.length > 0) {
      const blogger = n.recipientBlog.blogRoleBloggers[0];
      return blogger.role?.actionRights?.some(
        (right: any) =>
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
