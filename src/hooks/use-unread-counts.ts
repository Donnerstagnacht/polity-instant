import { db } from '../../db/db';
import { useMemo } from 'react';

/**
 * Hook to get unread notifications count for the current user
 * Uses the same filtering logic as NotificationsPage to ensure consistency
 */
export function useUnreadNotificationsCount() {
  const { user, isLoading: authLoading } = db.useAuth();

  const { data, isLoading } = db.useQuery(
    user?.id
      ? {
          notifications: {
            $: {
              order: {
                serverCreatedAt: 'desc' as const,
              },
            },
            recipient: {},
            sender: {},
            relatedUser: {},
            relatedGroup: {},
            relatedEvent: {},
            relatedAmendment: {},
            relatedBlog: {},
            onBehalfOfGroup: {},
            onBehalfOfEvent: {},
            onBehalfOfAmendment: {},
            onBehalfOfBlog: {},
            recipientGroup: {
              memberships: {
                $: {
                  where: {
                    'user.id': user.id,
                  },
                },
                role: {
                  actionRights: {},
                },
              },
            },
            recipientEvent: {
              participants: {
                $: {
                  where: {
                    'user.id': user.id,
                  },
                },
                role: {
                  actionRights: {},
                },
              },
            },
            recipientAmendment: {
              amendmentRoleCollaborators: {
                $: {
                  where: {
                    'user.id': user.id,
                  },
                },
                role: {
                  actionRights: {},
                },
              },
            },
            recipientBlog: {
              blogRoleBloggers: {
                $: {
                  where: {
                    'user.id': user.id,
                  },
                },
                role: {
                  actionRights: {},
                },
              },
            },
          },
        }
      : null
  );

  const count = useMemo(() => {
    if (!user?.id) return 0;

    const notifications = (data?.notifications || []) as any[];

    // Apply the same filtering logic as useNotificationFilters
    const accessibleNotifications = notifications.filter((n: any) => {
      // Personal notifications
      if (n.recipient?.id === user.id) return true;

      // Entity notifications where user has relevant management rights
      if (n.recipientGroup?.memberships && n.recipientGroup.memberships.length > 0) {
        const membership = n.recipientGroup.memberships[0];
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
        const hasRelevantRight = participant.role?.actionRights?.some(
          (right: any) =>
            (right.resource === 'groupNotifications' && right.action === 'manageNotifications') ||
            (right.resource === 'eventParticipants' && right.action === 'manage') ||
            (right.resource === 'events' && right.action === 'manage')
        );
        return hasRelevantRight;
      }

      if (
        n.recipientAmendment?.amendmentRoleCollaborators &&
        n.recipientAmendment.amendmentRoleCollaborators.length > 0
      ) {
        const collaborator = n.recipientAmendment.amendmentRoleCollaborators[0];
        const hasRelevantRight = collaborator.role?.actionRights?.some(
          (right: any) =>
            (right.resource === 'groupNotifications' && right.action === 'manageNotifications') ||
            (right.resource === 'amendments' && right.action === 'manage')
        );
        return hasRelevantRight;
      }

      if (n.recipientBlog?.blogRoleBloggers && n.recipientBlog.blogRoleBloggers.length > 0) {
        const blogger = n.recipientBlog.blogRoleBloggers[0];
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

    // Count only unread accessible notifications
    const unreadCount = accessibleNotifications.filter((n: any) => !n.isRead).length;

    return unreadCount;
  }, [data?.notifications, user?.id]);

  return { count, isLoading: authLoading || isLoading };
}

/**
 * Hook to get unread messages count for the current user
 * Counts total unread messages across all conversations
 */
export function useUnreadMessagesCount() {
  const { user, isLoading: authLoading } = db.useAuth();

  // Get user data (like in messages page)
  const { data: userData } = db.useQuery(
    user?.id
      ? {
          $users: {
            $: {
              where: {
                id: user.id,
              },
            },
          },
        }
      : null
  );

  const currentUser = userData?.$users?.[0];

  // Query conversations (exactly like messages page) - only where user is a participant
  const { data, isLoading } = db.useQuery(
    user?.id
      ? {
          conversations: {
            $: {
              where: {
                'participants.user.id': user.id,
              },
            },
            participants: {
              user: {},
            },
            messages: {
              $: {
                order: {
                  createdAt: 'asc' as const,
                },
              },
              sender: {},
            },
          },
        }
      : null
  );

  const count = useMemo(() => {
    if (!user?.id) {
      return 0;
    }

    if (!data?.conversations || !currentUser?.id) {
      if (user.id) {
        // User exists but no conversation data available yet
      }
      return 0;
    }

    let totalUnread = 0;
    data.conversations.forEach((conversation: any) => {
      // Use same logic as messages page: !msg.isRead && msg.sender?.id !== currentUser?.id
      const unreadInConversation = conversation.messages.filter(
        (msg: any) => !msg.isRead && msg.sender?.id !== currentUser.id
      ).length;

      totalUnread += unreadInConversation;
    });

    return totalUnread;
  }, [data?.conversations, currentUser?.id, user?.id, authLoading]);

  return { count, isLoading: authLoading || isLoading };
}
