import { useTranslation } from 'react-i18next';
import type { AnyRouter } from '@tanstack/react-router';
import type { NavigationItem } from '@/navigation/types/navigation.types.tsx';

// This function factory creates navigation items with router integration
export const navItemsAuthenticated = (
  router: AnyRouter, // Use AnyRouter type from TanStack Router
  setCurrentPrimaryRoute?: (route: string) => void
) => {
  const { t } = useTranslation();

  // Define navigation items for primary navigation with TanStack Router integration
  const primaryNavItems: NavigationItem[] = [
    {
      id: 'home',
      label: t('navigation.primary.home'),
      icon: 'Home',
      href: '/',
      onClick: () => {
        router.navigate({ to: '/' });
        if (setCurrentPrimaryRoute) setCurrentPrimaryRoute('home');
      },
    },
    {
      id: 'dashboard',
      label: t('navigation.primary.dashboard'),
      icon: 'LayoutDashboard',
      href: '/dashboard',
      onClick: () => {
        router.navigate({ to: '/dashboard' });
        if (setCurrentPrimaryRoute) setCurrentPrimaryRoute('dashboard');
      },
    },
    {
      id: 'messages',
      label: t('navigation.primary.messages'),
      icon: 'MessageSquare',
      badge: 5,
      href: '/messages',
      onClick: () => {
        router.navigate({ to: '/messages' });
        if (setCurrentPrimaryRoute) setCurrentPrimaryRoute('messages');
      },
    },
    {
      id: 'settings',
      label: t('navigation.primary.settings'),
      icon: 'Settings',
      href: '/settings',
      onClick: () => {
        router.navigate({ to: '/settings' });
        if (setCurrentPrimaryRoute) setCurrentPrimaryRoute('settings');
      },
    },
    {
      id: 'files',
      label: t('navigation.primary.files'),
      icon: 'File',
      href: '/files',
      onClick: () => {
        router.navigate({ to: '/files' });
        if (setCurrentPrimaryRoute) setCurrentPrimaryRoute('files');
      },
    },
    {
      id: 'flow',
      label: t('navigation.primary.flow'),
      icon: 'Workflow',
      href: '/flow',
      onClick: () => {
        router.navigate({ to: '/flow' });
        if (setCurrentPrimaryRoute) setCurrentPrimaryRoute('flow');
      },
    },
    {
      id: 'projects',
      label: t('navigation.primary.projects'),
      icon: 'FolderOpen',
      href: '/projects',
      onClick: () => {
        router.navigate({ to: '/projects' });
        if (setCurrentPrimaryRoute) setCurrentPrimaryRoute('projects');
      },
    },
    {
      id: 'calendar',
      label: t('navigation.primary.calendar'),
      icon: 'Calendar',
      href: '/calendar',
      onClick: () => {
        router.navigate({ to: '/calendar' });
        if (setCurrentPrimaryRoute) setCurrentPrimaryRoute('calendar');
      },
    },
    {
      id: 'notifications',
      label: t('navigation.primary.notifications'),
      icon: 'Bell',
      badge: 2,
      href: '/notifications',
      onClick: () => {
        router.navigate({ to: '/notifications' });
        if (setCurrentPrimaryRoute) setCurrentPrimaryRoute('notifications');
      },
    },
    {
      id: 'groups',
      label: t('navigation.primary.groups'),
      icon: 'Users',
      href: '/groups',
      onClick: () => {
        router.navigate({ to: '/groups' });
        if (setCurrentPrimaryRoute) setCurrentPrimaryRoute('groups');
      },
    },
  ];
  // Define route-specific secondary navigation items
  const projectSecondaryNavItems: NavigationItem[] = [
    {
      id: 'tasks',
      label: t('navigation.secondary.projects.tasks'),
      icon: 'File',
      badge: 3,
      href: '/projects/tasks',
      onClick: () => router.navigate({ to: '/projects/tasks' }),
    },
    {
      id: 'tests',
      label: t('navigation.secondary.projects.tests'),
      icon: 'FolderOpen',
      badge: 2,
      href: '/projects/tests',
      onClick: () => router.navigate({ to: '/projects/tests' }),
    },
  ];

  // Define dashboard secondary navigation items
  const dashboardSecondaryNavItems: NavigationItem[] = [
    {
      id: 'analytics',
      label: t('navigation.secondary.dashboard.analytics'),
      icon: 'LineChart',
      href: '/dashboard/analytics',
      onClick: () => router.navigate({ to: '/dashboard/analytics' }),
    },
    {
      id: 'reports',
      label: t('navigation.secondary.dashboard.reports'),
      icon: 'AreaChart',
      href: '/dashboard/reports',
      onClick: () => router.navigate({ to: '/dashboard/reports' }),
    },
  ];

  return {
    primaryNavItems,
    projectSecondaryNavItems,
    dashboardSecondaryNavItems,

    // Utility function to get secondary items based on current route
    getSecondaryNavItems: (currentPrimaryRoute: string | null) => {
      switch (currentPrimaryRoute) {
        case 'projects':
          return projectSecondaryNavItems;
        case 'dashboard':
          return dashboardSecondaryNavItems;
        default:
          return null;
      }
    },
  };
};
