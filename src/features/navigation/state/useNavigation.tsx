import { useState, useMemo, useRef } from 'react';
import { navItemsAuthenticated } from '@/features/navigation/nav-items/nav-items-authenticated.tsx';
import { createNavItemsUnauthenticated } from '@/features/navigation/nav-items/nav-items-unauthenticated.tsx';
import { useInitialRoute } from '@/features/navigation/state/useInitialRoute.tsx';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useTranslation } from '@/features/shared/hooks/use-translation.ts';
import { useUnreadNotificationsCount, useUnreadMessagesCount } from '@/features/navigation/state/use-unread-counts.ts';
import { useAuth } from '@/providers/auth-provider.tsx';
import { useAmendmentState } from '@/zero/amendments/useAmendmentState.ts';
import type { NavigationItem } from '@/features/navigation/types/navigation.types.tsx';
import { usePermissions } from '@/zero/rbac/usePermissions.ts';
import type { Amendment, ActionRight } from '@/zero/rbac/types.ts';
import { useEntityUnreadCount } from '@/zero/notifications/useEntityUnreadCount.ts';

/**
 * Custom hook that manages navigation items for primary and secondary navigation
 * @returns Object containing primary and secondary navigation items
 */
export function useNavigation() {
  // Get router instance and pathname for TanStack Router
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const [currentPrimaryRoute, setCurrentPrimaryRoute] = useState<string | null>(null);
  const { t } = useTranslation();

  // Get unread counts for notifications and messages
  const { count: unreadNotificationsCount } = useUnreadNotificationsCount();
  const { count: unreadMessagesCount } = useUnreadMessagesCount();

  // Create unauthenticated navigation items using the factory function
  const unauthenticatedNavItems = useMemo(
    () => createNavItemsUnauthenticated(navigate, t),
    [navigate, t]
  );

  // Stable reference for setCurrentPrimaryRoute to avoid recreating nav items
  const setCurrentPrimaryRouteRef = useRef(setCurrentPrimaryRoute);
  setCurrentPrimaryRouteRef.current = setCurrentPrimaryRoute;
  const stableSetRoute = useMemo(
    () => (route: string) => setCurrentPrimaryRouteRef.current(route),
    []
  );

  // Get navigation items from the navigation config
  const { primaryNavItems: basePrimaryNavItems, getSecondaryNavItems: baseGetSecondaryNavItems } =
    useMemo(
      () => navItemsAuthenticated(navigate, stableSetRoute, t),
      [navigate, stableSetRoute, t]
    );

  // Override labels with translations and add dynamic badge counts
  const primaryNavItems: NavigationItem[] = useMemo(
    () =>
      basePrimaryNavItems.map(item => {
        let badge = item.badge;

        // Update badge counts for notifications and messages
        if (item.id === 'notifications') {
          badge = unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined;
        } else if (item.id === 'messages') {
          badge = unreadMessagesCount > 0 ? unreadMessagesCount : undefined;
        }

        return {
          ...item,
          label: t(`navigation.primary.${item.id}`),
          badge,
        };
      }),
    [basePrimaryNavItems, unreadNotificationsCount, unreadMessagesCount, t]
  );

  // Extract IDs from pathname
  const eventId = pathname.match(/^\/event\/([^/]+)/)?.[1];
  const userId = pathname.match(/^\/user\/([^/]+)/)?.[1];
  const groupId = pathname.match(/^\/group\/([^/]+)/)?.[1];
  const amendmentId = pathname.match(/^\/amendment\/([^/]+)/)?.[1];
  const blogId = pathname.match(/^\/blog\/([^/]+)/)?.[1];

  // Entity unread notification counts for secondary nav badges
  const groupUnread = useEntityUnreadCount(groupId ?? '', 'group');
  const eventUnread = useEntityUnreadCount(eventId ?? '', 'event');
  const amendmentUnread = useEntityUnreadCount(amendmentId ?? '', 'amendment');
  const blogUnread = useEntityUnreadCount(blogId ?? '', 'blog');

  // Fetch amendment data via facade for permission context
  const { amendment: amendmentData, collaborators: amendmentCollaborators, roles: amendmentRoles } = useAmendmentState({
    amendmentId: amendmentId || undefined,
    includeRoles: Boolean(amendmentId),
  });

  const amendment = useMemo(() => {
    if (!amendmentData) return undefined;

    const rawRoles = amendmentRoles ?? [];
    const rawCollaborators = amendmentCollaborators ?? [];

    // Map Zero query rows (snake_case, flat IDs) → RBAC types (camelCase, nested objects)
    const mappedRoles = rawRoles.map(role => ({
      id: role.id,
      name: role.name ?? '',
      description: role.description ?? undefined,
      scope: (role.scope ?? 'amendment') as 'group' | 'event' | 'amendment' | 'blog',
      actionRights: (role.action_rights ?? []).map(ar => ({
        id: String(ar.id),
        resource: String(ar.resource ?? '') as ActionRight['resource'],
        action: String(ar.action ?? '') as ActionRight['action'],
        group: ar.group_id ? { id: String(ar.group_id) } : undefined,
        event: ar.event_id ? { id: String(ar.event_id) } : undefined,
        amendment: ar.amendment_id ? { id: String(ar.amendment_id) } : undefined,
        blog: ar.blog_id ? { id: String(ar.blog_id) } : undefined,
      })),
    }));

    return {
      id: amendmentData.id,
      user: amendmentData.created_by ? { id: amendmentData.created_by.id } : undefined,
      group: amendmentData.group ? { id: amendmentData.group.id } : undefined,
      status: amendmentData.status ?? undefined,
      roles: mappedRoles,
      amendmentRoleCollaborators: rawCollaborators.map(collaborator => ({
        id: collaborator.id,
        user: collaborator.user ? { id: collaborator.user.id } : undefined,
        role: mappedRoles.find(role => role.id === collaborator.role_id),
      })),
    } as Amendment;
  }, [amendmentData, amendmentCollaborators, amendmentRoles]);

  const permissionGroupId = groupId ?? amendmentData?.group?.id;
  
  // Let's use the permission hook
  const { 
    canManage,
    canView,
    canUpdate,
    can,
    isMe, 
    isABlogger,
    isAuthor: isAmendmentAuthor,
    isMember
  } = usePermissions({
    groupId: permissionGroupId,
    eventId,
    blogId,
    amendmentId,
    amendment
  });

  const getSecondaryNavItems = (currentPrimaryRoute: string | null) => {
    // Determine permissions based on the hook results
    const isEventAdmin = canManage('events') || canManage('eventParticipants'); // 'manage_participants' implies manage
    const isGroupAdmin = canManage('groups') || canManage('groupMemberships');
    
    // For amendment, we check if user can view or manage it
    const canViewAmendment = canView('amendments');
    const canUpdateAmendment = canUpdate('amendments');
    const canManageAmendment = canManage('amendments');

    // For blog, we check if user can manage bloggers (which is the Owner permission)
    // The blog creator gets the Owner role with 'manage' permission for 'blogBloggers'
    const isBlogOwner = blogId ? canManage('blogBloggers') : false;

    const isOwnUser = isMe(userId);
    const isGroupMember = isMember();
    
    // Check if user can manage group memberships (for Members nav item)
    const canManageMembers = canManage('groupMemberships');

    // Notification rights are scoped differently by entity type.
    const canViewNotifications =
      currentPrimaryRoute === 'group'
        ? can('viewNotifications', 'groupNotifications')
        : currentPrimaryRoute === 'event' || currentPrimaryRoute === 'amendment'
          ? can('viewNotifications', 'notifications')
          : false;

    const baseSecondaryItems = baseGetSecondaryNavItems(
      currentPrimaryRoute,
      eventId,
      userId,
      isOwnUser,
      groupId,
      amendmentId,
      isGroupAdmin,
      isEventAdmin,
      canViewAmendment,
      canUpdateAmendment,
      canManageAmendment,
      blogId,
      isBlogOwner,
      isGroupMember,
      canManageMembers,
      canViewNotifications
    );
    if (!baseSecondaryItems) return null;

    // Determine entity unread count based on current route
    const entityUnreadCount =
      currentPrimaryRoute === 'group' ? groupUnread :
      currentPrimaryRoute === 'event' ? eventUnread :
      currentPrimaryRoute === 'amendment' ? amendmentUnread :
      currentPrimaryRoute === 'blog' ? blogUnread : 0;

    // Secondary items are already localized in the nav item factories.
    // Rebuilding keys from item.id breaks route-style ids like "blogs-and-statements".
    return baseSecondaryItems.map(item => ({
      ...item,
      ...(item.id === 'notifications' && entityUnreadCount > 0
        ? { badge: entityUnreadCount }
        : {}),
    }));
  };

  const secondaryNavItems = getSecondaryNavItems(currentPrimaryRoute);

  // Use custom hook for initial route
  useInitialRoute(setCurrentPrimaryRoute);

  return {
    primaryNavItems,
    secondaryNavItems,
    unauthenticatedNavItems,
    currentPrimaryRoute,
  };
}
