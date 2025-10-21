import { useState } from 'react';
import { navItemsAuthenticated } from '@/navigation/nav-items/nav-items-authenticated';
import { useInitialRoute } from '@/navigation/state/useInitialRoute';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from '@/hooks/use-translation';
import { useUnreadNotificationsCount, useUnreadMessagesCount } from '@/hooks/use-unread-counts';
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

  // Get unread counts for notifications and messages
  const { count: unreadNotificationsCount } = useUnreadNotificationsCount();
  const { count: unreadMessagesCount } = useUnreadMessagesCount();

  console.log('🧭 [useNavigation] Unread counts:', {
    notifications: unreadNotificationsCount,
    messages: unreadMessagesCount,
  });

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
    navItemsAuthenticated(mockRouter, setCurrentPrimaryRoute);

  // Override labels with translations and add dynamic badge counts
  const primaryNavItems: NavigationItem[] = basePrimaryNavItems.map(item => {
    let badge = item.badge;

    // Update badge counts for notifications and messages
    if (item.id === 'notifications') {
      badge = unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined;
      console.log('🔔 [useNavigation] Setting notifications badge:', {
        itemId: item.id,
        count: unreadNotificationsCount,
        badge,
      });
    } else if (item.id === 'messages') {
      badge = unreadMessagesCount > 0 ? unreadMessagesCount : undefined;
      console.log('💬 [useNavigation] Setting messages badge:', {
        itemId: item.id,
        count: unreadMessagesCount,
        badge,
      });
    }

    return {
      ...item,
      label: t(`navigation.primary.${item.id}`),
      badge,
    };
  });

  const getSecondaryNavItems = (currentPrimaryRoute: string | null) => {
    const baseSecondaryItems = baseGetSecondaryNavItems(currentPrimaryRoute);
    if (!baseSecondaryItems) return null;

    // Override labels with translations for secondary items
    return baseSecondaryItems.map(item => ({
      ...item,
      label:
        currentPrimaryRoute === 'projects'
          ? t(`navigation.secondary.projects.${item.id}`)
          : currentPrimaryRoute === 'dashboard'
            ? t(`navigation.secondary.dashboard.${item.id}`)
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
