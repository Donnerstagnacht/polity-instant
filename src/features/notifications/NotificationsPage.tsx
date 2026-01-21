import db from '../../../db/db';
import { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Bell, Check, Users, Search } from 'lucide-react';
import { useNotificationMutations } from './hooks/useNotificationData';
import { useNotificationFilters } from './hooks/useNotificationFilters';
import { useNotificationActions } from './hooks/useNotificationActions';
import { NotificationHeader } from './ui/NotificationHeader';
import { NotificationTabs } from './ui/NotificationTabs';
import { NotificationsList } from './ui/NotificationsList';
import { useTranslation } from '@/hooks/use-translation';

export function NotificationsPage() {
  const { t } = useTranslation();
  const { user } = db.useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = db.useQuery({
    notifications: {
      $: {
        order: {
          serverCreatedAt: 'desc' as const,
        },
      },
      recipient: {},
      sender: {},
      relatedUser: {},
      relatedGroup: {},
      relatedEvent: {},
      relatedAmendment: {},
      relatedBlog: {},
      onBehalfOfGroup: {},
      onBehalfOfEvent: {},
      onBehalfOfAmendment: {},
      onBehalfOfBlog: {},
      recipientGroup: {
        memberships: {
          $: {
            where: {
              'user.id': user?.id,
            },
          },
          role: {
            actionRights: {},
          },
        },
      },
      recipientEvent: {
        participants: {
          $: {
            where: {
              'user.id': user?.id,
            },
          },
          role: {
            actionRights: {},
          },
        },
      },
      recipientAmendment: {
        amendmentRoleCollaborators: {
          $: {
            where: {
              'user.id': user?.id,
            },
          },
          role: {
            actionRights: {},
          },
        },
      },
      recipientBlog: {
        blogRoleBloggers: {
          $: {
            where: {
              'user.id': user?.id,
            },
          },
          role: {
            actionRights: {},
          },
        },
      },
    },
  });

  const notifications = (data?.notifications || []) as any[];
  const filteredNotifications = useNotificationFilters({
    notifications,
    userId: user?.id,
  });

  const { markAllAsRead } = useNotificationMutations();
  const { handleNotificationClick, handleDeleteNotification } = useNotificationActions();

  const handleMarkAllAsRead = async () => {
    const unreadIds = filteredNotifications.unread.map((n) => n.id);
    if (unreadIds.length > 0) {
      await markAllAsRead(unreadIds);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <p className="text-muted-foreground">{t('features.notifications.loading')}</p>
      </div>
    );
  }

  // Filter notifications based on search query
  const searchFilteredNotifications = {
    all: filteredNotifications.all.filter((n: any) => 
      !searchQuery || 
      n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    unread: filteredNotifications.unread.filter((n: any) => 
      !searchQuery || 
      n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    read: filteredNotifications.read.filter((n: any) => 
      !searchQuery || 
      n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    personal: filteredNotifications.personal.filter((n: any) => 
      !searchQuery || 
      n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    entity: filteredNotifications.entity.filter((n: any) => 
      !searchQuery || 
      n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  };

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
            onChange={(e) => setSearchQuery(e.target.value)}
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
          notifications={searchFilteredNotifications.all}
          emptyIcon={Bell}
          emptyTitle={t('features.notifications.empty.noNotificationsYet')}
          emptyDescription={t('features.notifications.empty.whenYouGet')}
          onNotificationClick={handleNotificationClick}
          onDeleteNotification={handleDeleteNotification}
        />
      </TabsContent>

      <TabsContent value="unread" className="mt-0">
        <NotificationsList
          notifications={searchFilteredNotifications.unread}
          emptyIcon={Check}
          emptyTitle={t('features.notifications.allCaughtUp')}
          emptyDescription={t('features.notifications.empty.allRead')}
          onNotificationClick={handleNotificationClick}
          onDeleteNotification={handleDeleteNotification}
        />
      </TabsContent>

      <TabsContent value="read" className="mt-0">
        <NotificationsList
          notifications={searchFilteredNotifications.read}
          emptyIcon={Bell}
          emptyTitle={t('features.notifications.empty.noRead')}
          emptyDescription={t('features.notifications.empty.readAppear')}
          onNotificationClick={handleNotificationClick}
          onDeleteNotification={handleDeleteNotification}
        />
      </TabsContent>

      <TabsContent value="personal" className="mt-0">
        <NotificationsList
          notifications={searchFilteredNotifications.personal}
          emptyIcon={Bell}
          emptyTitle={t('features.notifications.empty.noPersonal')}
          emptyDescription={t('features.notifications.empty.personalAppear')}
          onNotificationClick={handleNotificationClick}
          onDeleteNotification={handleDeleteNotification}
        />
      </TabsContent>

      <TabsContent value="entity" className="mt-0">
        <NotificationsList
          notifications={searchFilteredNotifications.entity}
          emptyIcon={Users}
          emptyTitle={t('features.notifications.empty.noEntity')}
          emptyDescription={t('features.notifications.empty.entityAppear')}
          onNotificationClick={handleNotificationClick}
          onDeleteNotification={handleDeleteNotification}
        />
      </TabsContent>
    </Tabs>
  );
}
