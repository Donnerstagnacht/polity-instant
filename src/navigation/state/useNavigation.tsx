import { useState } from 'react';
import { navItemsAuthenticated } from '@/navigation/nav-items/nav-items-authenticated';
import { useInitialRoute } from '@/navigation/state/useInitialRoute';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from '@/hooks/use-translation';
import { useUnreadNotificationsCount, useUnreadMessagesCount } from '@/hooks/use-unread-counts';
import { db } from '../../../db';
import type { NavigationItem } from '@/navigation/types/navigation.types';

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
      label: 'Home',
      href: '/',
      onClick: () => router.push('/'),
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

    // Query event participation status if we're on an event page
    const { data: eventParticipationData } = db.useQuery(
      eventId && authUser?.id
        ? {
            eventParticipants: {
              $: {
                where: {
                  'user.id': authUser.id,
                  'event.id': eventId,
                },
              },
            },
          }
        : { eventParticipants: {} }
    );

    // Check if user is admin of this event
    if (eventId && authUser?.id && eventParticipationData?.eventParticipants?.[0]) {
      const participation = eventParticipationData.eventParticipants[0];
      isEventAdmin = participation.status === 'admin';
    }

    // Extract user ID from pathname if on a user route
    let userId: string | undefined;
    let isOwnProfile = false;
    if (pathname.startsWith('/user/')) {
      const match = pathname.match(/^\/user\/([^/]+)/);
      if (match) {
        userId = match[1];
        // Check if this is the current user's profile
        isOwnProfile = authUser?.id === userId;
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

    // Query group membership status if we're on a group page
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
            },
          }
        : { groupMemberships: {} }
    );

    // Check if user is admin of this group
    if (
      groupId &&
      authUser?.id &&
      membershipData?.groupMemberships &&
      membershipData.groupMemberships.length > 0
    ) {
      // Check all memberships - user might have multiple records (shouldn't happen but handle it)
      const memberships = membershipData.groupMemberships;
      isGroupAdmin = memberships.some((m: any) => m.status === 'admin' || m.role === 'admin');

      // Log membership data for debugging
      console.log('Group Admin Check:', {
        groupId,
        userId: authUser.id,
        memberships: memberships.map((m: any) => ({
          id: m.id,
          status: m.status,
          role: m.role,
        })),
        isGroupAdmin,
      });
    } else if (groupId && authUser?.id) {
      console.log('No membership found:', {
        groupId,
        userId: authUser.id,
        membershipData: membershipData?.groupMemberships,
      });
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

    // Query user's owned amendments to check ownership
    const { data: ownedAmendmentsData } = db.useQuery(
      amendmentId && authUser?.id
        ? {
            amendments: {
              $: {
                where: {
                  'user.id': authUser.id,
                },
              },
            },
          }
        : { amendments: {} }
    );

    // Query user's collaboration status for this amendment
    const { data: amendmentCollaborationData } = db.useQuery(
      amendmentId && authUser?.id
        ? {
            amendmentCollaborators: {
              $: {
                where: {
                  'user.id': authUser.id,
                  'amendment.id': amendmentId,
                },
              },
            },
          }
        : { amendmentCollaborators: {} }
    );

    // Check if user is admin of this amendment (either owner or admin collaborator)
    if (amendmentId && authUser?.id) {
      const isOwner = ownedAmendmentsData?.amendments?.some((a: any) => a.id === amendmentId);
      const collaboration = amendmentCollaborationData?.amendmentCollaborators?.[0];
      const isAdminCollaborator = collaboration?.status === 'admin';
      isAmendmentAdmin = isOwner || isAdminCollaborator;
    }

    const baseSecondaryItems = baseGetSecondaryNavItems(
      currentPrimaryRoute,
      eventId,
      userId,
      isOwnProfile,
      groupId,
      amendmentId,
      isGroupAdmin,
      isEventAdmin,
      isAmendmentAdmin
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
