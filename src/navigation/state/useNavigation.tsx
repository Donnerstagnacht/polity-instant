import { useState } from 'react';
import { navItemsAuthenticated } from '@/navigation/nav-items/nav-items-authenticated';
import { useInitialRoute } from '@/navigation/state/useInitialRoute';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from '@/hooks/use-translation';
import { useUnreadNotificationsCount, useUnreadMessagesCount } from '@/hooks/use-unread-counts';
import { db } from '../../../db';
import type { NavigationItem } from '@/navigation/types/navigation.types';
import {
  hasEventPermission,
  hasGroupPermission,
  hasAmendmentPermission,
  type Participation,
  type Membership,
  type Amendment,
} from '../../../instant.helpers';

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
  const { user: authUser } = db.useAuth();

  // Get unread counts for notifications and messages
  const { count: unreadNotificationsCount } = useUnreadNotificationsCount();
  const { count: unreadMessagesCount } = useUnreadMessagesCount();

  // Create unauthenticated navigation items with proper onClick handlers
  const unauthenticatedNavItems: NavigationItem[] = [
    {
      id: 'home',
      icon: 'Home',
      label: t('navigation.primary.home'),
      href: '/',
      onClick: () => router.push('/'),
    },
    {
      id: 'features',
      icon: 'Sparkles',
      label: t('navigation.primary.features'),
      href: '/features',
      onClick: () => router.push('/features'),
    },
    {
      id: 'solutions',
      icon: 'Target',
      label: t('navigation.primary.solutions'),
      href: '/solutions',
      onClick: () => router.push('/solutions'),
    },
    {
      id: 'pricing',
      icon: 'CreditCard',
      label: t('navigation.primary.pricing'),
      href: '/pricing',
      onClick: () => router.push('/pricing'),
    },
    {
      id: 'auth',
      icon: 'User',
      label: 'Login',
      href: '/auth',
      onClick: () => router.push('/auth'),
    },
  ];

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

  const getSecondaryNavItems = (currentPrimaryRoute: string | null) => {
    // Extract event ID from pathname if on an event route
    let eventId: string | undefined;
    let isEventAdmin = false;
    if (pathname.startsWith('/event/')) {
      const match = pathname.match(/^\/event\/([^/]+)/);
      if (match) {
        eventId = match[1];
      }
    }

    // Query event participation with role and action rights if we're on an event page
    const { data: eventParticipationData } = db.useQuery(
      eventId && authUser?.id
        ? {
            participants: {
              $: {
                where: {
                  'user.id': authUser.id,
                  'event.id': eventId,
                },
              },
              role: {
                actionRights: {},
              },
            },
          }
        : { participants: {} }
    );

    // Check if user has manage_participants permission for this event
    if (eventId && authUser?.id && eventParticipationData?.participants) {
      const participations = eventParticipationData.participants as Participation[];
      isEventAdmin = hasEventPermission(participations, eventId, 'events', 'manage_participants');
    }

    // Extract user ID from pathname if on a user route
    let userId: string | undefined;
    let isOwnUser = false;
    if (pathname.startsWith('/user/')) {
      const match = pathname.match(/^\/user\/([^/]+)/);
      if (match) {
        userId = match[1];
        isOwnUser = authUser?.id === userId;
      }
    }

    // Extract group ID from pathname if on a group route
    let groupId: string | undefined;
    let isGroupAdmin = false;
    if (pathname.startsWith('/group/')) {
      const match = pathname.match(/^\/group\/([^/]+)/);
      if (match) {
        groupId = match[1];
      }
    }

    // Query group membership with group roles and action rights if we're on a group page
    const { data: membershipData } = db.useQuery(
      groupId && authUser?.id
        ? {
            groupMemberships: {
              $: {
                where: {
                  'user.id': authUser.id,
                  'group.id': groupId,
                },
              },
              group: {
                roles: {
                  actionRights: {},
                },
              },
            },
          }
        : { groupMemberships: {} }
    );

    // Check if user has manage_members permission for this group
    if (groupId && authUser?.id && membershipData?.groupMemberships) {
      const memberships = membershipData.groupMemberships as Membership[];
      isGroupAdmin = hasGroupPermission(memberships, groupId, 'groupMemberships', 'manage');
    }

    // Extract amendment ID from pathname if on an amendment route
    let amendmentId: string | undefined;
    let isAmendmentAdmin = false;
    if (pathname.startsWith('/amendment/')) {
      const match = pathname.match(/^\/amendment\/([^/]+)/);
      if (match) {
        amendmentId = match[1];
      }
    }

    // Query amendment with roles and collaborators if we're on an amendment page
    const { data: amendmentData } = db.useQuery(
      amendmentId
        ? {
            amendments: {
              $: {
                where: {
                  id: amendmentId,
                },
              },
              amendmentRoleCollaborators: {
                user: {},
                role: {},
              },
              roles: {
                actionRights: {},
              },
            },
          }
        : { amendments: {} }
    );

    // Check if user has manage permission for this amendment
    if (amendmentId && authUser?.id && amendmentData?.amendments?.[0]) {
      const amendment = amendmentData.amendments[0] as Amendment;
      isAmendmentAdmin = hasAmendmentPermission(
        amendment,
        authUser.id,
        'amendmentCollaborators',
        'manage'
      );
    }

    // Extract blog ID from pathname if on a blog route
    let blogId: string | undefined;
    let isBlogOwner = false;
    if (pathname.startsWith('/blog/')) {
      const match = pathname.match(/^\/blog\/([^/]+)/);
      if (match) {
        blogId = match[1];
      }
    }

    // Query user's blogger status for this blog
    const { data: blogBloggerData } = db.useQuery(
      blogId && authUser?.id
        ? {
            blogBloggers: {
              $: {
                where: {
                  'user.id': authUser.id,
                  'blog.id': blogId,
                },
              },
              role: {},
            },
          }
        : { blogBloggers: {} }
    );

    // Check if user is owner of this blog
    if (blogId && authUser?.id && blogBloggerData?.blogBloggers?.[0]) {
      const blogger = blogBloggerData.blogBloggers[0];
      isBlogOwner = blogger.role?.name === 'Owner';
    }

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
      isBlogOwner
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
