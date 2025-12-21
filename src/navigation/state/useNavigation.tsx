import { useState } from 'react';
import { navItemsAuthenticated } from '@/navigation/nav-items/nav-items-authenticated';
import { createNavItemsUnauthenticated } from '@/navigation/nav-items/nav-items-unauthenticated';
import { useInitialRoute } from '@/navigation/state/useInitialRoute';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from '@/hooks/use-translation';
import { useUnreadNotificationsCount, useUnreadMessagesCount } from '@/hooks/use-unread-counts';
import { db } from '../../../db/db';
import type { NavigationItem } from '@/navigation/types/navigation.types';
import { usePermissions } from '../../../db/rbac/usePermissions.ts';
import type { Amendment } from '../../../db/rbac/types';

/**
 * Custom hook that manages navigation items for primary and secondary navigation
 * @returns Object containing primary and secondary navigation items
 */
export function useNavigation() {
  // Get router instance and pathname for Next.js
  const router = useRouter();
  const pathname = usePathname();
  const [currentPrimaryRoute, setCurrentPrimaryRoute] = useState<string | null>(null);
  const { t } = useTranslation();

  // Get unread counts for notifications and messages
  const { count: unreadNotificationsCount } = useUnreadNotificationsCount();
  const { count: unreadMessagesCount } = useUnreadMessagesCount();

  // Create unauthenticated navigation items using the factory function
  const unauthenticatedNavItems = createNavItemsUnauthenticated(router, t);

  // Create a mock router object that matches the expected interface
  const mockRouter = {
    ...router,
    state: {
      location: {
        pathname: pathname,
      },
    },
  };

  // Get navigation items from the navigation config
  const { primaryNavItems: basePrimaryNavItems, getSecondaryNavItems: baseGetSecondaryNavItems } =
    navItemsAuthenticated(mockRouter, setCurrentPrimaryRoute, t);

  // Override labels with translations and add dynamic badge counts
  const primaryNavItems: NavigationItem[] = basePrimaryNavItems.map(item => {
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
  });

  // Extract IDs from pathname
  const eventId = pathname.match(/^\/event\/([^/]+)/)?.[1];
  const userId = pathname.match(/^\/user\/([^/]+)/)?.[1];
  const groupId = pathname.match(/^\/group\/([^/]+)/)?.[1];
  const amendmentId = pathname.match(/^\/amendment\/([^/]+)/)?.[1];
  const blogId = pathname.match(/^\/blog\/([^/]+)/)?.[1];

  // Fetch amendment data if needed for permission context
  const { data: amendmentData } = db.useQuery(
    amendmentId
      ? {
          amendments: {
            $: { where: { id: amendmentId } },
            amendmentRoleCollaborators: { 
              user: {},
              role: {
                actionRights: {}
              }
            },
            roles: { actionRights: {} },
          },
        }
      : null
  );
  
  // Map the query result to match the Amendment interface expected by usePermissions
  const amendment = amendmentData?.amendments?.[0] as unknown as Amendment;
  
  // Let's use the permission hook
  const { 
    canManage, 
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
    
    // For amendment, we check if user can manage it
    const isAmendmentAdmin = canManage('amendments');

    // For blog, we check if user is owner (which usually implies manage permission)
    // The original code checked for 'Owner' role specifically.
    // `canManage('blogs')` should cover this if the Owner role has manage permission.
    const isBlogOwner = canManage('blogs');

    const isOwnUser = isMe(userId);
    const isGroupMember = isMember();

    const baseSecondaryItems = baseGetSecondaryNavItems(
      currentPrimaryRoute,
      eventId,
      userId,
      isOwnUser,
      groupId,
      amendmentId,
      isGroupAdmin,
      isEventAdmin,
      isAmendmentAdmin,
      blogId,
      isBlogOwner,
      isGroupMember
    );
    if (!baseSecondaryItems) return null;

    // Override labels with translations for secondary items
    return baseSecondaryItems.map(item => ({
      ...item,
      label:
        currentPrimaryRoute === 'projects'
          ? t(`navigation.secondary.projects.${item.id}`)
          : currentPrimaryRoute === 'dashboard'
            ? t(`navigation.secondary.dashboard.${item.id}`)
            : currentPrimaryRoute === 'calendar'
              ? t(`navigation.secondary.calendar.${item.id}`)
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
