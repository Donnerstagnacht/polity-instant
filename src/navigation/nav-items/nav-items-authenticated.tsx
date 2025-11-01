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
  const getEventSecondaryNavItems = (eventId: string, isAdmin = false): NavigationItem[] => {
    const items: NavigationItem[] = [
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

    // Only add participants and edit items if user is admin
    if (isAdmin) {
      items.push(
        {
          id: 'participants',
          label: t ? t('navigation.secondary.event.participants') : 'Participants',
          icon: 'Users',
          href: `/event/${eventId}/participants`,
          onClick: () => router.push(`/event/${eventId}/participants`),
        },
        {
          id: 'edit',
          label: t ? t('navigation.secondary.event.edit') : 'Edit Event',
          icon: 'Settings',
          href: `/event/${eventId}/edit`,
          onClick: () => router.push(`/event/${eventId}/edit`),
        }
      );
    }

    return items;
  };

  // Function to create user profile secondary navigation items for a specific user
  const getUserSecondaryNavItems = (userId: string, isOwnProfile: boolean): NavigationItem[] => {
    const items: NavigationItem[] = [
      {
        id: 'profile',
        label: t ? t('navigation.secondary.user.profile') : 'Profile',
        icon: 'User',
        href: `/user/${userId}`,
        onClick: () => router.push(`/user/${userId}`),
      },
      {
        id: 'subscriptions',
        label: t ? t('navigation.secondary.user.subscriptions') : 'Subscriptions',
        icon: 'Bell',
        href: `/user/${userId}/subscriptions`,
        onClick: () => router.push(`/user/${userId}/subscriptions`),
      },
      {
        id: 'memberships',
        label: t ? t('navigation.secondary.user.memberships') : 'Memberships',
        icon: 'Users',
        href: `/user/${userId}/memberships`,
        onClick: () => router.push(`/user/${userId}/memberships`),
      },
      {
        id: 'network',
        label: t ? t('navigation.secondary.user.network') : 'Network',
        icon: 'Network',
        href: `/user/${userId}/network`,
        onClick: () => router.push(`/user/${userId}/network`),
      },
      {
        id: 'meet',
        label: t ? t('navigation.secondary.user.meet') : 'Meet',
        icon: 'Calendar',
        href: `/user/${userId}/meet`,
        onClick: () => router.push(`/user/${userId}/meet`),
      },
    ];

    // Add edit option only for own profile
    if (isOwnProfile) {
      items.push({
        id: 'edit',
        label: t ? t('navigation.secondary.user.edit') : 'Edit Profile',
        icon: 'Settings',
        href: `/user/${userId}/edit`,
        onClick: () => router.push(`/user/${userId}/edit`),
      });
    }

    return items;
  };

  // Function to create group secondary navigation items for a specific group
  const getGroupSecondaryNavItems = (groupId: string, isAdmin = false): NavigationItem[] => {
    const items: NavigationItem[] = [
      {
        id: 'overview',
        label: t ? t('navigation.secondary.group.overview') : 'Overview',
        icon: 'Home',
        href: `/group/${groupId}`,
        onClick: () => router.push(`/group/${groupId}`),
      },
      {
        id: 'events',
        label: t ? t('navigation.secondary.group.events') : 'Events',
        icon: 'Calendar',
        href: `/group/${groupId}/events`,
        onClick: () => router.push(`/group/${groupId}/events`),
      },
      {
        id: 'amendments',
        label: t ? t('navigation.secondary.group.amendments') : 'Amendments',
        icon: 'FileText',
        href: `/group/${groupId}/amendments`,
        onClick: () => router.push(`/group/${groupId}/amendments`),
      },
      {
        id: 'operation',
        label: t ? t('navigation.secondary.group.operation') : 'Operation',
        icon: 'AreaChart',
        href: `/group/${groupId}/operation`,
        onClick: () => router.push(`/group/${groupId}/operation`),
      },
      {
        id: 'network',
        label: t ? t('navigation.secondary.group.network') : 'Network',
        icon: 'Network',
        href: `/group/${groupId}/network`,
        onClick: () => router.push(`/group/${groupId}/network`),
      },
    ];

    // Only add memberships and edit items if user is admin
    if (isAdmin) {
      items.push(
        {
          id: 'memberships',
          label: t ? t('navigation.secondary.group.memberships') : 'Members',
          icon: 'Users',
          href: `/group/${groupId}/memberships`,
          onClick: () => router.push(`/group/${groupId}/memberships`),
        },
        {
          id: 'edit',
          label: t ? t('navigation.secondary.group.edit') : 'Edit Group',
          icon: 'Settings',
          href: `/group/${groupId}/edit`,
          onClick: () => router.push(`/group/${groupId}/edit`),
        }
      );
    }

    return items;
  };

  // Function to create amendment secondary navigation items for a specific amendment
  const getAmendmentSecondaryNavItems = (
    amendmentId: string,
    isAdmin = false
  ): NavigationItem[] => {
    const items: NavigationItem[] = [
      {
        id: 'overview',
        label: t ? t('navigation.secondary.amendment.overview') : 'Overview',
        icon: 'FileText',
        href: `/amendment/${amendmentId}`,
        onClick: () => router.push(`/amendment/${amendmentId}`),
      },
      {
        id: 'text',
        label: t ? t('navigation.secondary.amendment.text') : 'Full Text',
        icon: 'File',
        href: `/amendment/${amendmentId}/text`,
        onClick: () => router.push(`/amendment/${amendmentId}/text`),
      },
      {
        id: 'changeRequests',
        label: t ? t('navigation.secondary.amendment.changeRequests') : 'Change Requests',
        icon: 'FileText',
        href: `/amendment/${amendmentId}/change-requests`,
        onClick: () => router.push(`/amendment/${amendmentId}/change-requests`),
      },
      {
        id: 'discussions',
        label: t ? t('navigation.secondary.amendment.discussions') : 'Discussions',
        icon: 'MessageSquare',
        href: `/amendment/${amendmentId}/discussions`,
        onClick: () => router.push(`/amendment/${amendmentId}/discussions`),
      },
    ];

    // Only add collaborators and edit items if user is admin
    if (isAdmin) {
      items.push(
        {
          id: 'collaborators',
          label: t ? t('navigation.secondary.amendment.collaborators') : 'Collaborators',
          icon: 'Users',
          href: `/amendment/${amendmentId}/collaborators`,
          onClick: () => router.push(`/amendment/${amendmentId}/collaborators`),
        },
        {
          id: 'edit',
          label: t ? t('navigation.secondary.amendment.edit') : 'Edit Amendment',
          icon: 'Settings',
          href: `/amendment/${amendmentId}/edit`,
          onClick: () => router.push(`/amendment/${amendmentId}/edit`),
        }
      );
    }

    return items;
  };

  return {
    primaryNavItems,
    projectSecondaryNavItems,
    calendarSecondaryNavItems,
    getEventSecondaryNavItems,
    getUserSecondaryNavItems,
    getGroupSecondaryNavItems,
    getAmendmentSecondaryNavItems,

    // Utility function to get secondary items based on current route
    getSecondaryNavItems: (
      currentPrimaryRoute: string | null,
      eventId?: string,
      userId?: string,
      isOwnProfile?: boolean,
      groupId?: string,
      amendmentId?: string,
      isGroupAdmin?: boolean,
      isEventAdmin?: boolean,
      isAmendmentAdmin?: boolean
    ) => {
      switch (currentPrimaryRoute) {
        case 'projects':
          return projectSecondaryNavItems;
        case 'calendar':
          return calendarSecondaryNavItems;
        case 'event':
          return eventId ? getEventSecondaryNavItems(eventId, isEventAdmin ?? false) : null;
        case 'user':
          return userId ? getUserSecondaryNavItems(userId, isOwnProfile ?? false) : null;
        case 'group':
          return groupId ? getGroupSecondaryNavItems(groupId, isGroupAdmin ?? false) : null;
        case 'amendment':
          return amendmentId
            ? getAmendmentSecondaryNavItems(amendmentId, isAmendmentAdmin ?? false)
            : null;
        default:
          return null;
      }
    },
  };
};
