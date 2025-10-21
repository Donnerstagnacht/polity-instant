import type { NavigationItem } from '@/navigation/types/navigation.types';

// Next.js router type interface
interface NextRouter {
  push: (url: string) => void;
  state?: {
    location: {
      pathname: string;
    };
  };
}

// This function factory creates navigation items with router integration
export const navItemsAuthenticated = (
  router: NextRouter, // Use Next.js router type
  setCurrentPrimaryRoute?: (route: string) => void
) => {
  // Note: useTranslation() hook removed to fix hook order issues
  // Using static strings temporarily until i18n is properly configured

  // Define navigation items for primary navigation with Next.js router integration
  const primaryNavItems: NavigationItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: 'Home',
      href: '/',
      onClick: () => {
        router.push('/');
        if (setCurrentPrimaryRoute) setCurrentPrimaryRoute('home');
      },
    },
    {
      id: 'create',
      label: 'Create',
      icon: 'PlusCircle',
      href: '/create',
      onClick: () => {
        router.push('/create');
        if (setCurrentPrimaryRoute) setCurrentPrimaryRoute('create');
      },
    },
    {
      id: 'search',
      label: 'Search',
      icon: 'Search',
      href: '/search',
      onClick: () => {
        router.push('/search');
        if (setCurrentPrimaryRoute) setCurrentPrimaryRoute('search');
      },
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'LayoutDashboard',
      href: '/dashboard',
      onClick: () => {
        router.push('/dashboard');
        if (setCurrentPrimaryRoute) setCurrentPrimaryRoute('dashboard');
      },
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: 'MessageSquare',
      href: '/messages',
      onClick: () => {
        router.push('/messages');
        if (setCurrentPrimaryRoute) setCurrentPrimaryRoute('messages');
      },
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'Settings',
      href: '/settings',
      onClick: () => {
        router.push('/settings');
        if (setCurrentPrimaryRoute) setCurrentPrimaryRoute('settings');
      },
    },
    {
      id: 'files',
      label: 'Files',
      icon: 'File',
      href: '/files',
      onClick: () => {
        router.push('/files');
        if (setCurrentPrimaryRoute) setCurrentPrimaryRoute('files');
      },
    },
    {
      id: 'editor',
      label: 'Editor',
      icon: 'FileText',
      href: '/editor',
      onClick: () => {
        router.push('/editor');
        if (setCurrentPrimaryRoute) setCurrentPrimaryRoute('editor');
      },
    },
    {
      id: 'flow',
      label: 'Flow',
      icon: 'Workflow',
      href: '/flow',
      onClick: () => {
        router.push('/flow');
        if (setCurrentPrimaryRoute) setCurrentPrimaryRoute('flow');
      },
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: 'FolderOpen',
      href: '/projects',
      onClick: () => {
        router.push('/projects');
        if (setCurrentPrimaryRoute) setCurrentPrimaryRoute('projects');
      },
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: 'Calendar',
      href: '/calendar',
      onClick: () => {
        router.push('/calendar');
        if (setCurrentPrimaryRoute) setCurrentPrimaryRoute('calendar');
      },
    },
    {
      id: 'todos',
      label: 'Todos',
      icon: 'CheckSquare',
      href: '/todos',
      onClick: () => {
        router.push('/todos');
        if (setCurrentPrimaryRoute) setCurrentPrimaryRoute('todos');
      },
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: 'Bell',
      href: '/notifications',
      onClick: () => {
        router.push('/notifications');
        if (setCurrentPrimaryRoute) setCurrentPrimaryRoute('notifications');
      },
    },
    {
      id: 'groups',
      label: 'Groups',
      icon: 'Users',
      href: '/groups',
      onClick: () => {
        router.push('/groups');
        if (setCurrentPrimaryRoute) setCurrentPrimaryRoute('groups');
      },
    },
  ];
  // Define route-specific secondary navigation items
  const projectSecondaryNavItems: NavigationItem[] = [
    {
      id: 'tasks',
      label: 'Tasks',
      icon: 'File',
      badge: 3,
      href: '/projects/tasks',
      onClick: () => router.push('/projects/tasks'),
    },
    {
      id: 'tests',
      label: 'Tests',
      icon: 'FolderOpen',
      badge: 2,
      href: '/projects/tests',
      onClick: () => router.push('/projects/tests'),
    },
  ];

  // Define dashboard secondary navigation items
  const dashboardSecondaryNavItems: NavigationItem[] = [
    {
      id: 'analytics',
      label: 'Analytics',
      icon: 'LineChart',
      href: '/dashboard/analytics',
      onClick: () => router.push('/dashboard/analytics'),
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: 'AreaChart',
      href: '/dashboard/reports',
      onClick: () => router.push('/dashboard/reports'),
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
