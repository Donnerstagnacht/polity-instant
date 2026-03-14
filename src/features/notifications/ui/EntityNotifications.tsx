'use client';

import { useEffect, useState, useMemo } from 'react';
import { useNotificationState } from '@/zero/notifications/useNotificationState.ts';
import { useNotificationActions } from '@/zero/notifications/useNotificationActions.ts';
import { Avatar, AvatarFallback, AvatarImage } from '@/features/shared/ui/ui/avatar.tsx';
import { Button } from '@/features/shared/ui/ui/button.tsx';
import { Card, CardContent } from '@/features/shared/ui/ui/card.tsx';
import { Badge } from '@/features/shared/ui/ui/badge.tsx';
import { Tabs, TabsContent, TabsTrigger } from '@/features/shared/ui/ui/tabs.tsx';
import { ScrollableTabsList } from '@/features/shared/ui/ui/scrollable-tabs.tsx';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { cn } from '@/features/shared/utils/utils.ts';
import { useNavigate } from '@tanstack/react-router';
import { EntityType } from '@/features/notifications/utils/notification-helpers.ts';
import { useTranslation } from '@/features/shared/hooks/use-translation.ts';
import { NotificationType } from '@/features/notifications/types/notification.types.ts';
import {
  getNotificationIcon,
  getNotificationColor,
} from '@/features/notifications/utils/notificationConstants.ts';
import { EntitySearchBar } from '@/features/shared/ui/ui/entity-search-bar.tsx';

interface EntityNotificationsProps {
  entityId: string;
  entityType: EntityType;
  entityName: string;
}

export function EntityNotifications({
  entityId,
  entityType,
  entityName,
}: EntityNotificationsProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { markRead } = useNotificationActions();

  const { entityNotifications: notifications, isLoading: isLoadingState } = useNotificationState({
    entityFilter: { entityId, entityType },
  });

  // Auto-mark all entity notifications as read when the component mounts
  const { markAllEntityNotificationsRead } = useNotificationActions();
  useEffect(() => {
    if (entityId && entityType && notifications.length > 0) {
      markAllEntityNotificationsRead({ entity_id: entityId, entity_type: entityType });
    }
  }, [entityId, entityType, notifications.length, markAllEntityNotificationsRead]);
  const isLoading = isLoadingState;

  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotifications = useMemo(() => {
    if (!searchQuery.trim()) return notifications;
    const q = searchQuery.toLowerCase();
    return notifications.filter((n: any) => {
      const senderName = [n.sender?.first_name, n.sender?.last_name].filter(Boolean).join(' ').toLowerCase();
      const title = (n.title || '').toLowerCase();
      const message = (n.message || '').toLowerCase();
      return senderName.includes(q) || title.includes(q) || message.includes(q);
    });
  }, [notifications, searchQuery]);

  const unreadNotifications = filteredNotifications.filter((n: any) => !n.is_read);
  const readNotifications = filteredNotifications.filter((n: any) => n.is_read);

  const handleNotificationClick = async (notification: any) => {
    // Mark as read on click
    if (!notification.is_read) {
      markRead({ id: notification.id });
    }
    // Navigate based on action URL or related entity
    if (notification.action_url) {
      navigate({ to: notification.action_url });
    } else if (notification.related_user_id) {
      navigate({ to: `/user/${notification.related_user_id}` });
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = unreadNotifications.map((n: any) => n.id);
    if (unreadIds.length > 0) {
      for (const notifId of unreadIds) {
        await markRead({ id: notifId });
      }
    }
  };

  const formatTime = (date: string | number) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffInHours = (now.getTime() - notifDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return t('pages.notifications.time.minutesAgo', { count: diffInMinutes });
    } else if (diffInHours < 24) {
      return t('pages.notifications.time.hoursAgo', { count: Math.floor(diffInHours) });
    } else if (diffInHours < 168) {
      const diffInDays = Math.floor(diffInHours / 24);
      return t('pages.notifications.time.daysAgo', { count: diffInDays });
    } else {
      return notifDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const getUserName = (user: any) => {
    if (!user) return null;
    return [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || null;
  };

  const NotificationItem = ({ notification }: { notification: any }) => {
    const Icon = getNotificationIcon(notification.type as NotificationType);
    const iconColor = getNotificationColor(notification.type as NotificationType);
    const senderName = getUserName(notification.sender);
    const receiverName = getUserName(notification.related_user);

    return (
      <Card
        className={cn(
          'cursor-pointer transition-all hover:shadow-md',
          !notification.is_read && 'border-l-primary bg-accent/50 border-l-4'
        )}
        onClick={() => handleNotificationClick(notification)}
      >
        <CardContent className="flex items-start gap-3 p-3">
          {/* Notification Icon */}
          <div
            className={cn(
              'bg-muted mt-0.5 rounded-full p-1.5',
              !notification.is_read && 'bg-primary/10'
            )}
          >
            <Icon className={cn('h-3.5 w-3.5', iconColor)} />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1 space-y-0.5">
            {/* Sender → Receiver line */}
            {(notification.sender || notification.related_user) && (
              <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                {notification.sender && (
                  <>
                    <Avatar
                      className="hover:ring-primary h-5 w-5 shrink-0 cursor-pointer hover:ring-1"
                      onClick={e => {
                        e.stopPropagation();
                        navigate({ to: `/user/${notification.sender.id}` });
                      }}
                    >
                      <AvatarImage src={notification.sender.avatar} />
                      <AvatarFallback className="text-[10px]">
                        {senderName?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className="hover:text-primary cursor-pointer truncate font-medium hover:underline"
                      onClick={e => {
                        e.stopPropagation();
                        navigate({ to: `/user/${notification.sender.id}` });
                      }}
                    >
                      {senderName}
                    </span>
                  </>
                )}
                {notification.sender && notification.related_user && (
                  <span className="shrink-0">→</span>
                )}
                {notification.related_user && (
                  <>
                    <span
                      className="hover:text-primary cursor-pointer truncate font-medium hover:underline"
                      onClick={e => {
                        e.stopPropagation();
                        navigate({ to: `/user/${notification.related_user.id}` });
                      }}
                    >
                      {receiverName}
                    </span>
                    <Avatar
                      className="hover:ring-primary h-5 w-5 shrink-0 cursor-pointer hover:ring-1"
                      onClick={e => {
                        e.stopPropagation();
                        navigate({ to: `/user/${notification.related_user.id}` });
                      }}
                    >
                      <AvatarImage src={notification.related_user.avatar} />
                      <AvatarFallback className="text-[10px]">
                        {receiverName?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </>
                )}
              </div>
            )}
            <div className="flex items-start justify-between gap-2">
              <p className={cn('text-sm font-medium', !notification.is_read && 'font-semibold')}>
                {notification.title}
              </p>
              {!notification.is_read && (
                <Badge variant="default" className="h-2 w-2 rounded-full p-0" />
              )}
            </div>
            <p className="text-muted-foreground text-sm">{notification.message}</p>
            <p className="text-muted-foreground text-xs">{formatTime(notification.created_at)}</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <p className="text-muted-foreground">
          {t('pages.notifications.entity.loadingNotifications')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all" className="w-full">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {t('pages.notifications.entity.title', { entityName })}
            </h2>
            <p className="text-muted-foreground">
              {unreadNotifications.length > 0
                ? unreadNotifications.length === 1
                  ? t('pages.notifications.entity.unreadCount', {
                      count: unreadNotifications.length,
                    })
                  : t('pages.notifications.entity.unreadCountPlural', {
                      count: unreadNotifications.length,
                    })
                : t('pages.notifications.entity.allCaughtUp')}
            </p>
          </div>
          {unreadNotifications.length > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              <CheckCheck className="mr-2 h-4 w-4" />
              {t('pages.notifications.markAllRead')}
            </Button>
          )}
        </div>

        <div className="mb-4">
          <EntitySearchBar
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            placeholder={t('features.notifications.searchPlaceholder')}
          />
        </div>

        <ScrollableTabsList>
          <TabsTrigger value="all">
            {t('pages.notifications.filters.all')}
            <Badge variant="secondary" className="ml-2">
              {notifications.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="unread">
            {t('pages.notifications.filters.unread')}
            {unreadNotifications.length > 0 && (
              <Badge variant="default" className="ml-2">
                {unreadNotifications.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="read">{t('pages.notifications.filters.read')}</TabsTrigger>
        </ScrollableTabsList>

        <TabsContent value="all" className="mt-6">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="text-muted-foreground mb-4 h-12 w-12" />
                <p className="text-lg font-semibold">
                  {t('pages.notifications.entity.noNotificationsYet')}
                </p>
                <p className="text-muted-foreground text-sm">
                  {t('pages.notifications.entity.notificationsWillShowHere', { entityType })}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification: any) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="unread" className="mt-6">
          {unreadNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Check className="mb-4 h-12 w-12 text-green-500" />
                <p className="text-lg font-semibold">
                  {t('pages.notifications.entity.allCaughtUp')}
                </p>
                <p className="text-muted-foreground text-sm">
                  {t('pages.notifications.entity.allRead')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {unreadNotifications.map((notification: any) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="read" className="mt-6">
          {readNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="text-muted-foreground mb-4 h-12 w-12" />
                <p className="text-lg font-semibold">
                  {t('pages.notifications.entity.noReadNotifications')}
                </p>
                <p className="text-muted-foreground text-sm">
                  {t('pages.notifications.entity.readNotificationsAppearHere')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {readNotifications.map((notification: any) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
