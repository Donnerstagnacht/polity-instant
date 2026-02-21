import { useState, useMemo, useCallback } from 'react';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useNotificationFilters } from './useNotificationFilters';
import { useNotificationActions } from './useNotificationActions';
import { useUserNotifications } from './useUserNotifications';
import { useNotificationActions as useZeroNotificationActions } from '@/zero/notifications/useNotificationActions';
import { useTranslation } from '@/hooks/use-translation';

const EMPTY_NOTIFICATIONS: any[] = [];
const PAGE_SIZE = 30;

export function useNotificationsPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const { data, isLoading, userId } = useUserNotifications();
  const { markRead } = useZeroNotificationActions();

  const notifications = useMemo(
    () => (data?.notifications as any[] | undefined) ?? EMPTY_NOTIFICATIONS,
    [data?.notifications]
  );

  const filteredNotifications = useNotificationFilters({ notifications, userId });
  const { handleNotificationClick, handleDeleteNotification } = useNotificationActions();

  const handleMarkAllAsRead = useCallback(async () => {
    const unreadIds = filteredNotifications.unread.map(n => n.id);
    for (const id of unreadIds) {
      await markRead({ id });
    }
  }, [filteredNotifications.unread, markRead]);

  // Filter notifications based on search query
  const searchFilteredNotifications = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    const matchesSearch = (n: any) =>
      !searchQuery ||
      n.title?.toLowerCase().includes(lowerQuery) ||
      n.message?.toLowerCase().includes(lowerQuery);

    return {
      all: filteredNotifications.all.filter(matchesSearch),
      unread: filteredNotifications.unread.filter(matchesSearch),
      read: filteredNotifications.read.filter(matchesSearch),
      personal: filteredNotifications.personal.filter(matchesSearch),
      entity: filteredNotifications.entity.filter(matchesSearch),
    };
  }, [filteredNotifications, searchQuery]);

  // Client-side pagination
  const paginatedNotifications = useMemo(
    () => ({
      all: searchFilteredNotifications.all.slice(0, visibleCount),
      unread: searchFilteredNotifications.unread.slice(0, visibleCount),
      read: searchFilteredNotifications.read.slice(0, visibleCount),
      personal: searchFilteredNotifications.personal.slice(0, visibleCount),
      entity: searchFilteredNotifications.entity.slice(0, visibleCount),
    }),
    [searchFilteredNotifications, visibleCount]
  );

  const hasMore = searchFilteredNotifications.all.length > visibleCount;

  const handleLoadMore = useCallback(() => {
    setVisibleCount(prev => prev + PAGE_SIZE);
  }, []);

  const loadMoreRef = useInfiniteScroll({
    hasMore,
    isLoading: false,
    onLoadMore: handleLoadMore,
  });

  const isInitialLoading = isLoading && notifications.length === 0;

  return {
    t,
    searchQuery,
    setSearchQuery,
    filteredNotifications,
    searchFilteredNotifications,
    paginatedNotifications,
    isInitialLoading,
    hasMore,
    loadMoreRef,
    handleMarkAllAsRead,
    handleNotificationClick,
    handleDeleteNotification,
  };
}
