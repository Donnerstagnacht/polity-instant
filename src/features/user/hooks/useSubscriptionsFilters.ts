import { useState, useMemo } from 'react';

// Co-located types
export type FilterType = 'all' | 'users' | 'groups' | 'amendments' | 'events' | 'blogs';

export interface UseSubscriptionsFiltersOptions {
  subscriptions: any[];
  subscribers: any[];
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
  filteredSubscriptions: any[];
  filteredSubscribers: any[];
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
    let filtered: any[] = subscriptions;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter((sub: any) => {
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
    return filtered.filter((sub: any) => {
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
    return subscribers.filter((sub: any) => {
      const name = sub.subscriber?.name?.toLowerCase() || '';
      const handle = sub.subscriber?.handle?.toLowerCase() || '';
      return name.includes(query) || handle.includes(query);
    });
  }, [subscribers, searchQuery]);

  // Calculate counts for each type
  const subscriptionCounts: SubscriptionCounts = useMemo(() => {
    return {
      all: subscriptions.length,
      users: subscriptions.filter((sub: any) => !!sub.user).length,
      groups: subscriptions.filter((sub: any) => !!sub.group).length,
      amendments: subscriptions.filter((sub: any) => !!sub.amendment).length,
      events: subscriptions.filter((sub: any) => !!sub.event).length,
      blogs: subscriptions.filter((sub: any) => !!sub.blog).length,
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
