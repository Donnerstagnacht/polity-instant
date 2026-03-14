import { useState, useMemo } from 'react';

// Co-located types
export type FilterType = 'all' | 'users' | 'groups' | 'amendments' | 'events' | 'blogs';

interface SubscriptionItem {
  user?: { name?: string; handle?: string };
  group?: { name?: string; description?: string };
  amendment?: { title?: string; subtitle?: string };
  event?: { title?: string; description?: string };
  blog?: { title?: string };
}

interface SubscriberItem {
  subscriber?: { name?: string; handle?: string };
}

export interface UseSubscriptionsFiltersOptions {
  subscriptions: SubscriptionItem[];
  subscribers: SubscriberItem[];
}

export interface SubscriptionCounts {
  all: number;
  users: number;
  groups: number;
  amendments: number;
  events: number;
  blogs: number;
}

export interface UseSubscriptionsFiltersReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterType: FilterType;
  setFilterType: (type: FilterType) => void;
  filteredSubscriptions: SubscriptionItem[];
  filteredSubscribers: SubscriberItem[];
  subscriptionCounts: SubscriptionCounts;
}

export function useSubscriptionsFilters({
  subscriptions,
  subscribers,
}: UseSubscriptionsFiltersOptions): UseSubscriptionsFiltersReturn {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');

  // Filter subscriptions based on type and search query
  const filteredSubscriptions = useMemo(() => {
    let filtered = subscriptions;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(sub => {
        switch (filterType) {
          case 'users':
            return !!sub.user;
          case 'groups':
            return !!sub.group;
          case 'amendments':
            return !!sub.amendment;
          case 'events':
            return !!sub.event;
          case 'blogs':
            return !!sub.blog;
          default:
            return true;
        }
      });
    }

    // Filter by search query
    if (!searchQuery.trim()) return filtered;

    const query = searchQuery.toLowerCase();
    return filtered.filter(sub => {
      if (sub.user) {
        const name = sub.user.name?.toLowerCase() || '';
        const handle = sub.user.handle?.toLowerCase() || '';
        return name.includes(query) || handle.includes(query);
      } else if (sub.group) {
        const name = sub.group.name?.toLowerCase() || '';
        const description = sub.group.description?.toLowerCase() || '';
        return name.includes(query) || description.includes(query);
      } else if (sub.amendment) {
        const title = sub.amendment.title?.toLowerCase() || '';
        const subtitle = sub.amendment.subtitle?.toLowerCase() || '';
        return title.includes(query) || subtitle.includes(query);
      } else if (sub.event) {
        const title = sub.event.title?.toLowerCase() || '';
        const description = sub.event.description?.toLowerCase() || '';
        return title.includes(query) || description.includes(query);
      } else if (sub.blog) {
        const title = sub.blog.title?.toLowerCase() || '';
        return title.includes(query);
      }
      return false;
    });
  }, [subscriptions, searchQuery, filterType]);

  // Filter subscribers based on search query
  const filteredSubscribers = useMemo(() => {
    if (!searchQuery.trim()) return subscribers;

    const query = searchQuery.toLowerCase();
    return subscribers.filter(sub => {
      const name = sub.subscriber?.name?.toLowerCase() || '';
      const handle = sub.subscriber?.handle?.toLowerCase() || '';
      return name.includes(query) || handle.includes(query);
    });
  }, [subscribers, searchQuery]);

  // Calculate counts for each type
  const subscriptionCounts: SubscriptionCounts = useMemo(() => {
    return {
      all: subscriptions.length,
      users: subscriptions.filter(sub => !!sub.user).length,
      groups: subscriptions.filter(sub => !!sub.group).length,
      amendments: subscriptions.filter(sub => !!sub.amendment).length,
      events: subscriptions.filter(sub => !!sub.event).length,
      blogs: subscriptions.filter(sub => !!sub.blog).length,
    };
  }, [subscriptions]);

  return {
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    filteredSubscriptions,
    filteredSubscribers,
    subscriptionCounts,
  };
}
