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
  setCurrentPrimaryRoute?: (route: string) => void,
  t?: (key: string) => string // Optional translation function
) => {
  // Note: useTranslation() hook removed to fix hook order issues
  // Using static strings temporarily until i18n is properly configured
  // Translation function can be passed as parameter for i18n support

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

  // Define calendar secondary navigation items
  const calendarSecondaryNavItems: NavigationItem[] = [
    {
      id: 'day',
      label: 'Day View',
      icon: 'List',
      href: '/calendar?view=day',
      onClick: () => router.push('/calendar?view=day'),
    },
    {
      id: 'week',
      label: 'Week View',
      icon: 'Grid3x3',
      href: '/calendar?view=week',
      onClick: () => router.push('/calendar?view=week'),
    },
    {
      id: 'month',
      label: 'Month View',
      icon: 'Calendar',
      href: '/calendar?view=month',
      onClick: () => router.push('/calendar?view=month'),
    },
  ];

  // Function to create event secondary navigation items for a specific event
  const getEventSecondaryNavItems = (eventId: string): NavigationItem[] => [
    {
      id: 'overview',
      label: t ? t('navigation.secondary.event.overview') : 'Overview',
      icon: 'FileText',
      href: `/event/${eventId}`,
      onClick: () => router.push(`/event/${eventId}`),
    },
    {
      id: 'agenda',
      label: t ? t('navigation.secondary.event.agenda') : 'Agenda',
      icon: 'Calendar',
      href: `/event/${eventId}/agenda`,
      onClick: () => router.push(`/event/${eventId}/agenda`),
    },
    {
      id: 'stream',
      label: t ? t('navigation.secondary.event.stream') : 'Stream',
      icon: 'Radio',
      href: `/event/${eventId}/stream`,
      onClick: () => router.push(`/event/${eventId}/stream`),
    },
  ];

  // Function to create user profile secondary navigation items for a specific user
  const getUserSecondaryNavItems = (userId: string, isOwnProfile: boolean): NavigationItem[] => {
    const items: NavigationItem[] = [
      {
        id: 'profile',
        label: 'Profile',
        icon: 'User',
        href: `/user/${userId}`,
        onClick: () => router.push(`/user/${userId}`),
      },
    ];

    // Add edit option only for own profile
    if (isOwnProfile) {
      items.push({
        id: 'edit',
        label: 'Edit Profile',
        icon: 'Settings',
        href: `/user/${userId}/edit`,
        onClick: () => router.push(`/user/${userId}/edit`),
      });
    }

    return items;
  };

  // Function to create group secondary navigation items for a specific group
  const getGroupSecondaryNavItems = (groupId: string): NavigationItem[] => [
    {
      id: 'overview',
      label: 'navigation.secondary.group.overview',
      icon: 'Home',
      href: `/group/${groupId}`,
      onClick: () => router.push(`/group/${groupId}`),
    },
    {
      id: 'events',
      label: 'navigation.secondary.group.events',
      icon: 'Calendar',
      href: `/group/${groupId}/events`,
      onClick: () => router.push(`/group/${groupId}/events`),
    },
    {
      id: 'amendments',
      label: 'navigation.secondary.group.amendments',
      icon: 'FileText',
      href: `/group/${groupId}/amendments`,
      onClick: () => router.push(`/group/${groupId}/amendments`),
    },
    {
      id: 'operation',
      label: 'navigation.secondary.group.operation',
      icon: 'AreaChart',
      href: `/group/${groupId}/operation`,
      onClick: () => router.push(`/group/${groupId}/operation`),
    },
  ];

  return {
    primaryNavItems,
    projectSecondaryNavItems,
    dashboardSecondaryNavItems,
    calendarSecondaryNavItems,
    getEventSecondaryNavItems,
    getUserSecondaryNavItems,
    getGroupSecondaryNavItems,

    // Utility function to get secondary items based on current route
    getSecondaryNavItems: (
      currentPrimaryRoute: string | null,
      eventId?: string,
      userId?: string,
      isOwnProfile?: boolean,
      groupId?: string
    ) => {
      switch (currentPrimaryRoute) {
        case 'projects':
          return projectSecondaryNavItems;
        case 'dashboard':
          return dashboardSecondaryNavItems;
        case 'calendar':
          return calendarSecondaryNavItems;
        case 'event':
          return eventId ? getEventSecondaryNavItems(eventId) : null;
        case 'user':
          return userId ? getUserSecondaryNavItems(userId, isOwnProfile ?? false) : null;
        case 'group':
          return groupId ? getGroupSecondaryNavItems(groupId) : null;
        default:
          return null;
      }
    },
  };
};
