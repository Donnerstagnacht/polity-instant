import db from '../../../db/db';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Bell, Check, Users } from 'lucide-react';
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

  return (
    <Tabs defaultValue="all" className="w-full">
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 mb-6 border-b bg-background/95 pb-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <NotificationHeader
          unreadCount={filteredNotifications.unread.length}
          onMarkAllAsRead={handleMarkAllAsRead}
        />

        <NotificationTabs
          allCount={filteredNotifications.all.length}
          unreadCount={filteredNotifications.unread.length}
          personalCount={filteredNotifications.personal.length}
          entityCount={filteredNotifications.entity.length}
        />
      </div>

      <TabsContent value="all" className="mt-0">
        <NotificationsList
          notifications={filteredNotifications.all}
          emptyIcon={Bell}
          emptyTitle={t('features.notifications.empty.noNotificationsYet')}
          emptyDescription={t('features.notifications.empty.whenYouGet')}
          onNotificationClick={handleNotificationClick}
          onDeleteNotification={handleDeleteNotification}
        />
      </TabsContent>

      <TabsContent value="unread" className="mt-0">
        <NotificationsList
          notifications={filteredNotifications.unread}
          emptyIcon={Check}
          emptyTitle={t('features.notifications.allCaughtUp')}
          emptyDescription={t('features.notifications.empty.allRead')}
          onNotificationClick={handleNotificationClick}
          onDeleteNotification={handleDeleteNotification}
        />
      </TabsContent>

      <TabsContent value="read" className="mt-0">
        <NotificationsList
          notifications={filteredNotifications.read}
          emptyIcon={Bell}
          emptyTitle={t('features.notifications.empty.noRead')}
          emptyDescription={t('features.notifications.empty.readAppear')}
          onNotificationClick={handleNotificationClick}
          onDeleteNotification={handleDeleteNotification}
        />
      </TabsContent>

      <TabsContent value="personal" className="mt-0">
        <NotificationsList
          notifications={filteredNotifications.personal}
          emptyIcon={Bell}
          emptyTitle={t('features.notifications.empty.noPersonal')}
          emptyDescription={t('features.notifications.empty.personalAppear')}
          onNotificationClick={handleNotificationClick}
          onDeleteNotification={handleDeleteNotification}
        />
      </TabsContent>

      <TabsContent value="entity" className="mt-0">
        <NotificationsList
          notifications={filteredNotifications.entity}
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
