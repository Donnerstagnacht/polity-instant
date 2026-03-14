import type { Notification } from '../types/notification.types';

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
    if (n.recipientGroup?.memberships && n.recipientGroup.memberships.length > 0) {
      const membership = n.recipientGroup.memberships[0];
      return membership.role?.actionRights?.some(
        right =>
          (right.resource === 'groupNotifications' && right.action === 'viewNotifications') ||
          (right.resource === 'groupNotifications' && right.action === 'manageNotifications') ||
          (right.resource === 'groupMemberships' && right.action === 'manage') ||
          (right.resource === 'groups' && right.action === 'manage')
      );
    }

    if (n.recipientEvent?.participants && n.recipientEvent.participants.length > 0) {
      const participant = n.recipientEvent.participants[0];
      return participant.role?.actionRights?.some(
        right =>
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
        right =>
          (right.resource === 'groupNotifications' && right.action === 'viewNotifications') ||
          (right.resource === 'groupNotifications' && right.action === 'manageNotifications') ||
          (right.resource === 'amendments' && right.action === 'manage')
      );
    }

    if (n.recipientBlog?.blogRoleBloggers && n.recipientBlog.blogRoleBloggers.length > 0) {
      const blogger = n.recipientBlog.blogRoleBloggers[0];
      return blogger.role?.actionRights?.some(
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

/**
 * Maps a raw Zero notification (snake_case fields + relation names)
 * to the camelCase Notification interface expected by the feature layer.
 */
export function mapZeroNotification(n: Record<string, unknown>): Notification {
  const rec = (val: unknown): Record<string, unknown> | undefined =>
    val && typeof val === 'object' ? (val as Record<string, unknown>) : undefined;

  const mapActionRights = (rights: unknown) =>
    Array.isArray(rights)
      ? rights.map(r => {
          const right = r as Record<string, unknown>;
          return { resource: right.resource as string, action: right.action as string };
        })
      : undefined;

  const mapRole = (role: unknown) => {
    if (!role) return undefined;
    const r = role as Record<string, unknown>;
    return { ...r, actionRights: mapActionRights(r.action_rights) };
  };

  const mapUser = (u: unknown) => {
    const user = rec(u);
    if (!user) return undefined;
    return {
      id: user.id as string,
      name: [user.first_name, user.last_name].filter(Boolean).join(' ') || String(user.email ?? 'Unknown'),
      avatar: user.avatar as string | undefined,
    };
  };

  const mapEntity = (e: unknown) => {
    const entity = rec(e);
    if (!entity) return undefined;
    return {
      id: entity.id as string,
      name: entity.name as string | undefined,
      title: entity.title as string | undefined,
      imageURL: entity.image_url as string | undefined,
    };
  };

  return {
    id: n.id as string,
    type: n.type as Notification['type'],
    title: n.title as string,
    message: n.message as string,
    isRead: (n.is_read as boolean) ?? false,
    createdAt: n.created_at as string | number,
    actionUrl: n.action_url as string | undefined,
    relatedEntityType: n.related_entity_type as Notification['relatedEntityType'],
    sender: mapUser(n.sender),
    recipient: rec(n.recipient) ? { id: (rec(n.recipient))!.id as string } : undefined,
    relatedUser: rec(n.related_user) ? { id: (rec(n.related_user))!.id as string } : undefined,
    relatedGroup: mapEntity(n.related_group),
    relatedEvent: mapEntity(n.related_event),
    relatedAmendment: mapEntity(n.related_amendment),
    relatedBlog: mapEntity(n.related_blog),
    onBehalfOfGroup: mapEntity(n.on_behalf_of_group),
    onBehalfOfEvent: mapEntity(n.on_behalf_of_event),
    onBehalfOfAmendment: mapEntity(n.on_behalf_of_amendment),
    onBehalfOfBlog: mapEntity(n.on_behalf_of_blog),
    recipientGroup: rec(n.recipient_group)
      ? {
          ...mapEntity(n.recipient_group),
          memberships: (Array.isArray(rec(n.recipient_group)?.memberships)
            ? (rec(n.recipient_group)!.memberships as Record<string, unknown>[])
            : []
          ).map(m => ({
            ...m,
            role: m.role ? { ...mapRole(m.role) } : undefined,
          })),
        }
      : undefined,
    recipientEvent: rec(n.recipient_event)
      ? {
          ...mapEntity(n.recipient_event),
          participants: (Array.isArray(rec(n.recipient_event)?.participants)
            ? (rec(n.recipient_event)!.participants as Record<string, unknown>[])
            : []
          ).map(p => ({
            ...p,
            role: p.role ? { ...mapRole(p.role) } : undefined,
          })),
        }
      : undefined,
    recipientAmendment: rec(n.recipient_amendment)
      ? {
          ...mapEntity(n.recipient_amendment),
          amendmentRoleCollaborators: rec(n.recipient_amendment)?.collaborators as Notification['recipientAmendment'],
        }
      : undefined,
    recipientBlog: rec(n.recipient_blog)
      ? {
          ...mapEntity(n.recipient_blog),
          blogRoleBloggers: (Array.isArray(rec(n.recipient_blog)?.bloggers)
            ? (rec(n.recipient_blog)!.bloggers as Record<string, unknown>[])
            : []
          ).map(b => ({
            ...b,
            role: b.role ? { ...mapRole(b.role) } : undefined,
          })),
        }
      : undefined,
  } as Notification;
}
