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
          (right.resource === 'groupNotifications' && right.action === 'viewNotifications') ||
          (right.resource === 'groupNotifications' && right.action === 'manageNotifications') ||
          (right.resource === 'groupMemberships' && right.action === 'manage') ||
          (right.resource === 'groups' && right.action === 'manage')
      );
    }

    if (n.recipientEvent?.participants && n.recipientEvent.participants.length > 0) {
      const participant = n.recipientEvent.participants[0];
      return participant.role?.actionRights?.some(
        (right: any) =>
          (right.resource === 'groupNotifications' && right.action === 'viewNotifications') ||
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
          (right.resource === 'groupNotifications' && right.action === 'viewNotifications') ||
          (right.resource === 'groupNotifications' && right.action === 'manageNotifications') ||
          (right.resource === 'amendments' && right.action === 'manage')
      );
    }

    if (n.recipientBlog?.blogRoleBloggers && n.recipientBlog.blogRoleBloggers.length > 0) {
      const blogger = n.recipientBlog.blogRoleBloggers[0];
      return blogger.role?.actionRights?.some(
        (right: any) =>
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

/**
 * Maps a raw Zero notification (snake_case fields + relation names)
 * to the camelCase Notification interface expected by the feature layer.
 */
export function mapZeroNotification(n: any): any {
  const mapActionRights = (rights: any[]) =>
    rights?.map((r: any) => ({ resource: r.resource, action: r.action }));

  const mapRole = (role: any) =>
    role ? { ...role, actionRights: mapActionRights(role.action_rights) } : undefined;

  const mapUser = (u: any) =>
    u
      ? {
          id: u.id,
          name: [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email || 'Unknown',
          avatar: u.avatar,
        }
      : undefined;

  const mapEntity = (e: any) =>
    e ? { id: e.id, name: e.name, title: e.title, imageURL: e.image_url } : undefined;

  return {
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    isRead: n.is_read ?? false,
    createdAt: n.created_at,
    actionUrl: n.action_url,
    relatedEntityType: n.related_entity_type,
    sender: mapUser(n.sender),
    recipient: n.recipient ? { id: n.recipient.id } : undefined,
    relatedUser: n.related_user ? { id: n.related_user.id } : undefined,
    relatedGroup: mapEntity(n.related_group),
    relatedEvent: mapEntity(n.related_event),
    relatedAmendment: mapEntity(n.related_amendment),
    relatedBlog: mapEntity(n.related_blog),
    onBehalfOfGroup: mapEntity(n.on_behalf_of_group),
    onBehalfOfEvent: mapEntity(n.on_behalf_of_event),
    onBehalfOfAmendment: mapEntity(n.on_behalf_of_amendment),
    onBehalfOfBlog: mapEntity(n.on_behalf_of_blog),
    recipientGroup: n.recipient_group
      ? {
          ...mapEntity(n.recipient_group),
          memberships: n.recipient_group.memberships?.map((m: any) => ({
            ...m,
            role: m.role ? { ...mapRole(m.role) } : undefined,
          })),
        }
      : undefined,
    recipientEvent: n.recipient_event
      ? {
          ...mapEntity(n.recipient_event),
          participants: n.recipient_event.participants?.map((p: any) => ({
            ...p,
            role: p.role ? { ...mapRole(p.role) } : undefined,
          })),
        }
      : undefined,
    recipientAmendment: n.recipient_amendment
      ? {
          ...mapEntity(n.recipient_amendment),
          amendmentRoleCollaborators: n.recipient_amendment.collaborators,
        }
      : undefined,
    recipientBlog: n.recipient_blog
      ? {
          ...mapEntity(n.recipient_blog),
          blogRoleBloggers: n.recipient_blog.bloggers?.map((b: any) => ({
            ...b,
            role: b.role ? { ...mapRole(b.role) } : undefined,
          })),
        }
      : undefined,
  };
}
