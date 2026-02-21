import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Bell, Check, Users, Search } from 'lucide-react';
import { useNotificationsPage } from './hooks/useNotificationsPage';
import { NotificationHeader } from './ui/NotificationHeader';
import { NotificationTabs } from './ui/NotificationTabs';
import { NotificationsList } from './ui/NotificationsList';

export function NotificationsPage() {
  const np = useNotificationsPage();

  return (
    <div>
      <Tabs defaultValue="all" className="w-full">
        {/* Fixed Header */}
        <div className="sticky top-0 z-10 mb-6 border-b bg-background/95 pb-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <NotificationHeader
            unreadCount={np.filteredNotifications.unread.length}
            onMarkAllAsRead={np.handleMarkAllAsRead}
          />

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={np.t('features.notifications.searchPlaceholder')}
              value={np.searchQuery}
              onChange={e => np.setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <NotificationTabs
            allCount={np.searchFilteredNotifications.all.length}
            unreadCount={np.searchFilteredNotifications.unread.length}
            personalCount={np.searchFilteredNotifications.personal.length}
            entityCount={np.searchFilteredNotifications.entity.length}
          />
        </div>

        <TabsContent value="all" className="mt-0">
          <NotificationsList
            notifications={np.paginatedNotifications.all}
            isLoading={np.isInitialLoading}
            emptyIcon={Bell}
            emptyTitle={np.t('features.notifications.empty.noNotificationsYet')}
            emptyDescription={np.t('features.notifications.empty.whenYouGet')}
            onNotificationClick={np.handleNotificationClick}
            onDeleteNotification={np.handleDeleteNotification}
          />
        </TabsContent>

        <TabsContent value="unread" className="mt-0">
          <NotificationsList
            notifications={np.paginatedNotifications.unread}
            isLoading={np.isInitialLoading}
            emptyIcon={Check}
            emptyTitle={np.t('features.notifications.allCaughtUp')}
            emptyDescription={np.t('features.notifications.empty.allRead')}
            onNotificationClick={np.handleNotificationClick}
            onDeleteNotification={np.handleDeleteNotification}
          />
        </TabsContent>

        <TabsContent value="read" className="mt-0">
          <NotificationsList
            notifications={np.paginatedNotifications.read}
            isLoading={np.isInitialLoading}
            emptyIcon={Bell}
            emptyTitle={np.t('features.notifications.empty.noRead')}
            emptyDescription={np.t('features.notifications.empty.readAppear')}
            onNotificationClick={np.handleNotificationClick}
            onDeleteNotification={np.handleDeleteNotification}
          />
        </TabsContent>

        <TabsContent value="personal" className="mt-0">
          <NotificationsList
            notifications={np.paginatedNotifications.personal}
            isLoading={np.isInitialLoading}
            emptyIcon={Bell}
            emptyTitle={np.t('features.notifications.empty.noPersonal')}
            emptyDescription={np.t('features.notifications.empty.personalAppear')}
            onNotificationClick={np.handleNotificationClick}
            onDeleteNotification={np.handleDeleteNotification}
          />
        </TabsContent>

        <TabsContent value="entity" className="mt-0">
          <NotificationsList
            notifications={np.paginatedNotifications.entity}
            isLoading={np.isInitialLoading}
            emptyIcon={Users}
            emptyTitle={np.t('features.notifications.empty.noEntity')}
            emptyDescription={np.t('features.notifications.empty.entityAppear')}
            onNotificationClick={np.handleNotificationClick}
            onDeleteNotification={np.handleDeleteNotification}
          />
        </TabsContent>

        {/* Infinite scroll trigger for client-side pagination */}
        {np.hasMore && <div ref={np.loadMoreRef} className="h-px" />}
      </Tabs>
    </div>
  );
}
