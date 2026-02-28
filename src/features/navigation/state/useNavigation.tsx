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
import type { Amendment } from '@/zero/rbac/types.ts';
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
  const { amendment: amendmentData } = useAmendmentState({ amendmentId: amendmentId || undefined });
  
  // Map the query result to match the Amendment interface expected by usePermissions
  const amendment = amendmentData as unknown as Amendment;
  
  // Let's use the permission hook
  const { 
    canManage,
    canView,
    can,
    isMe, 
    isABlogger,
    isAuthor: isAmendmentAuthor,
    isMember
  } = usePermissions({
    groupId,
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
    const canManageAmendment = canManage('amendments');

    // For blog, we check if user can manage bloggers (which is the Owner permission)
    // The blog creator gets the Owner role with 'manage' permission for 'blogBloggers'
    const isBlogOwner = blogId ? canManage('blogBloggers') : false;

    const isOwnUser = isMe(userId);
    const isGroupMember = isMember();
    
    // Check if user can manage group memberships (for Members nav item)
    const canManageMembers = canManage('groupMemberships');

    // Check if user can view entity notifications
    const canViewNotifications = can('viewNotifications', 'groupNotifications');

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

    // Override labels with translations for secondary items
    return baseSecondaryItems.map(item => ({
      ...item,
      label:
        currentPrimaryRoute === 'projects'
          ? t(`navigation.secondary.projects.${item.id}`)
          : currentPrimaryRoute === 'dashboard'
            ? t(`navigation.secondary.dashboard.${item.id}`)
            : currentPrimaryRoute === 'event'
                ? t(`navigation.secondary.event.${item.id}`)
                : currentPrimaryRoute === 'user'
                  ? t(`navigation.secondary.user.${item.id}`)
                  : currentPrimaryRoute === 'group'
                    ? t(`navigation.secondary.group.${item.id}`)
                    : currentPrimaryRoute === 'amendment'
                      ? t(`navigation.secondary.amendment.${item.id}`)
                      : currentPrimaryRoute === 'blog'
                        ? t(`navigation.secondary.blog.${item.id}`)
                        : item.label,
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
