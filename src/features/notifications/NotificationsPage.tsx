import { useState, useMemo, useCallback } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Bell, Check, Users, Search } from 'lucide-react';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useNotificationMutations } from './hooks/useNotificationData';
import { useNotificationFilters } from './hooks/useNotificationFilters';
import { useNotificationActions } from './hooks/useNotificationActions';
import { useUserNotifications } from './hooks/useUserNotifications';
import { NotificationHeader } from './ui/NotificationHeader';
import { NotificationTabs } from './ui/NotificationTabs';
import { NotificationsList } from './ui/NotificationsList';
import { useTranslation } from '@/hooks/use-translation';

const EMPTY_NOTIFICATIONS: any[] = [];
const PAGE_SIZE = 30;

export function NotificationsPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Fetch only notifications relevant to the current user via server-side filtering
  const { data, isLoading, userId } = useUserNotifications();

  const notifications = useMemo(
    () => (data?.notifications as any[] | undefined) ?? EMPTY_NOTIFICATIONS,
    [data?.notifications]
  );

  const filteredNotifications = useNotificationFilters({
    notifications,
    userId,
  });

  const { markAllAsRead } = useNotificationMutations();
  const { handleNotificationClick, handleDeleteNotification } = useNotificationActions();

  const handleMarkAllAsRead = useCallback(async () => {
    const unreadIds = filteredNotifications.unread.map(n => n.id);
    if (unreadIds.length > 0) {
      await markAllAsRead(unreadIds);
    }
  }, [filteredNotifications.unread, markAllAsRead]);

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

  // Client-side pagination: only show up to visibleCount items
  const paginatedNotifications = useMemo(() => ({
    all: searchFilteredNotifications.all.slice(0, visibleCount),
    unread: searchFilteredNotifications.unread.slice(0, visibleCount),
    read: searchFilteredNotifications.read.slice(0, visibleCount),
    personal: searchFilteredNotifications.personal.slice(0, visibleCount),
    entity: searchFilteredNotifications.entity.slice(0, visibleCount),
  }), [searchFilteredNotifications, visibleCount]);

  const hasMore = searchFilteredNotifications.all.length > visibleCount;

  const handleLoadMore = useCallback(() => {
    setVisibleCount(prev => prev + PAGE_SIZE);
  }, []);

  const loadMoreRef = useInfiniteScroll({
    hasMore,
    isLoading: false,
    onLoadMore: handleLoadMore,
  });

  // Only show loading state on initial load (no data yet)
  const isInitialLoading = isLoading && notifications.length === 0;

  return (
    <Tabs defaultValue="all" className="w-full">
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 mb-6 border-b bg-background/95 pb-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <NotificationHeader
          unreadCount={filteredNotifications.unread.length}
          onMarkAllAsRead={handleMarkAllAsRead}
        />

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('features.notifications.searchPlaceholder')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <NotificationTabs
          allCount={searchFilteredNotifications.all.length}
          unreadCount={searchFilteredNotifications.unread.length}
          personalCount={searchFilteredNotifications.personal.length}
          entityCount={searchFilteredNotifications.entity.length}
        />
      </div>

      <TabsContent value="all" className="mt-0">
        <NotificationsList
          notifications={paginatedNotifications.all}
          isLoading={isInitialLoading}
          emptyIcon={Bell}
          emptyTitle={t('features.notifications.empty.noNotificationsYet')}
          emptyDescription={t('features.notifications.empty.whenYouGet')}
          onNotificationClick={handleNotificationClick}
          onDeleteNotification={handleDeleteNotification}
        />
      </TabsContent>

      <TabsContent value="unread" className="mt-0">
        <NotificationsList
          notifications={paginatedNotifications.unread}
          isLoading={isInitialLoading}
          emptyIcon={Check}
          emptyTitle={t('features.notifications.allCaughtUp')}
          emptyDescription={t('features.notifications.empty.allRead')}
          onNotificationClick={handleNotificationClick}
          onDeleteNotification={handleDeleteNotification}
        />
      </TabsContent>

      <TabsContent value="read" className="mt-0">
        <NotificationsList
          notifications={paginatedNotifications.read}
          isLoading={isInitialLoading}
          emptyIcon={Bell}
          emptyTitle={t('features.notifications.empty.noRead')}
          emptyDescription={t('features.notifications.empty.readAppear')}
          onNotificationClick={handleNotificationClick}
          onDeleteNotification={handleDeleteNotification}
        />
      </TabsContent>

      <TabsContent value="personal" className="mt-0">
        <NotificationsList
          notifications={paginatedNotifications.personal}
          isLoading={isInitialLoading}
          emptyIcon={Bell}
          emptyTitle={t('features.notifications.empty.noPersonal')}
          emptyDescription={t('features.notifications.empty.personalAppear')}
          onNotificationClick={handleNotificationClick}
          onDeleteNotification={handleDeleteNotification}
        />
      </TabsContent>

      <TabsContent value="entity" className="mt-0">
        <NotificationsList
          notifications={paginatedNotifications.entity}
          isLoading={isInitialLoading}
          emptyIcon={Users}
          emptyTitle={t('features.notifications.empty.noEntity')}
          emptyDescription={t('features.notifications.empty.entityAppear')}
          onNotificationClick={handleNotificationClick}
          onDeleteNotification={handleDeleteNotification}
        />
      </TabsContent>

      {/* Infinite scroll trigger for client-side pagination */}
      {hasMore && <div ref={loadMoreRef} className="h-px" />}
    </Tabs>
  );
}
