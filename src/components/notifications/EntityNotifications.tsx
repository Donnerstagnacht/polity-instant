'use client';

import { db, tx } from '../../../db';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { ScrollableTabsList } from '@/components/ui/scrollable-tabs';
import { Bell, Check, CheckCheck, Users, Calendar, MessageSquare, UserPlus, X } from 'lucide-react';
import { cn } from '@/utils/utils';
import { useRouter } from 'next/navigation';
import { EntityType } from '@/utils/notification-helpers';

type NotificationType =
  | 'group_invite'
  | 'event_invite'
  | 'message'
  | 'follow'
  | 'mention'
  | 'event_update'
  | 'group_update'
  | 'membership_approved'
  | 'membership_rejected'
  | 'membership_role_changed'
  | 'membership_removed'
  | 'membership_withdrawn'
  | 'membership_request'
  | 'collaboration_approved'
  | 'collaboration_rejected'
  | 'collaboration_role_changed'
  | 'collaboration_removed'
  | 'collaboration_withdrawn'
  | 'collaboration_request'
  | 'participation_approved'
  | 'participation_rejected'
  | 'participation_role_changed'
  | 'participation_removed'
  | 'participation_withdrawn'
  | 'participation_request';

const notificationIcons: Record<string, any> = {
  group_invite: Users,
  event_invite: Calendar,
  message: MessageSquare,
  follow: UserPlus,
  mention: Bell,
  event_update: Calendar,
  group_update: Users,
  membership_approved: Check,
  membership_rejected: X,
  membership_role_changed: Users,
  membership_removed: X,
  membership_withdrawn: UserPlus,
  membership_request: UserPlus,
  collaboration_approved: Check,
  collaboration_rejected: X,
  collaboration_role_changed: Users,
  collaboration_removed: X,
  collaboration_withdrawn: UserPlus,
  collaboration_request: UserPlus,
  participation_approved: Check,
  participation_rejected: X,
  participation_role_changed: Users,
  participation_removed: X,
  participation_withdrawn: UserPlus,
  participation_request: UserPlus,
};

const notificationColors: Record<string, string> = {
  group_invite: 'text-blue-500',
  event_invite: 'text-purple-500',
  message: 'text-green-500',
  follow: 'text-pink-500',
  mention: 'text-orange-500',
  event_update: 'text-indigo-500',
  group_update: 'text-cyan-500',
  membership_approved: 'text-green-500',
  membership_rejected: 'text-red-500',
  membership_role_changed: 'text-blue-500',
  membership_removed: 'text-red-500',
  membership_withdrawn: 'text-orange-500',
  membership_request: 'text-blue-500',
  collaboration_approved: 'text-green-500',
  collaboration_rejected: 'text-red-500',
  collaboration_role_changed: 'text-blue-500',
  collaboration_removed: 'text-red-500',
  collaboration_withdrawn: 'text-orange-500',
  collaboration_request: 'text-blue-500',
  participation_approved: 'text-green-500',
  participation_rejected: 'text-red-500',
  participation_role_changed: 'text-blue-500',
  participation_removed: 'text-red-500',
  participation_withdrawn: 'text-orange-500',
  participation_request: 'text-blue-500',
};

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
  const router = useRouter();

  // Build the recipient key for the query
  const recipientKey = `recipient${entityType.charAt(0).toUpperCase() + entityType.slice(1)}` as
    | 'recipientGroup'
    | 'recipientEvent'
    | 'recipientAmendment'
    | 'recipientBlog';

  const { data, isLoading } = db.useQuery({
    notifications: {
      $: {
        where: {
          [`${recipientKey}.id`]: entityId,
        },
        order: {
          serverCreatedAt: 'desc' as const,
        },
      },
      sender: {},
      relatedUser: {},
      relatedGroup: {},
      relatedEvent: {},
      relatedAmendment: {},
      relatedBlog: {},
      [recipientKey]: {},
    },
  } as any) as any;

  const notifications = data?.notifications || [];
  const unreadNotifications = notifications.filter((n: any) => !n.isRead);
  const readNotifications = notifications.filter((n: any) => n.isRead);

  const handleNotificationClick = async (notification: any) => {
    // Navigate based on action URL or related entity
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    } else if (notification.relatedUser?.id) {
      router.push(`/user/${notification.relatedUser.id}`);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = unreadNotifications.map((n: any) => n.id);
    if (unreadIds.length > 0) {
      await db.transact(
        unreadIds.map((notifId: string) =>
          tx.notifications[notifId].update({
            isRead: true,
          })
        )
      );
    }
  };

  const deleteNotification = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await db.transact([tx.notifications[notificationId].delete()]);
  };

  const formatTime = (date: string | number) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffInHours = (now.getTime() - notifDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    } else {
      return notifDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const NotificationItem = ({ notification }: { notification: any }) => {
    const Icon = notificationIcons[notification.type as NotificationType] || Bell;
    const iconColor = notificationColors[notification.type as NotificationType] || 'text-gray-500';

    return (
      <Card
        className={cn(
          'cursor-pointer transition-all hover:shadow-md',
          !notification.isRead && 'border-l-4 border-l-primary bg-accent/50'
        )}
        onClick={() => handleNotificationClick(notification)}
      >
        <CardContent className="flex items-start gap-4 p-4">
          {/* Notification Icon */}
          <div className={cn('rounded-full bg-muted p-2', !notification.isRead && 'bg-primary/10')}>
            <Icon className={cn('h-5 w-5', iconColor)} />
          </div>

          {/* Sender Avatar */}
          {notification.sender && (
            <Avatar
              className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-primary"
              onClick={e => {
                e.stopPropagation();
                router.push(`/user/${notification.sender.id}`);
              }}
            >
              <AvatarImage src={notification.sender.avatar} />
              <AvatarFallback>{notification.sender.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
          )}

          {/* Content */}
          <div className="flex-1 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <p className={cn('font-medium', !notification.isRead && 'font-semibold')}>
                {notification.title}
              </p>
              {!notification.isRead && (
                <Badge variant="default" className="h-2 w-2 rounded-full p-0" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">{notification.message}</p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{formatTime(notification.createdAt)}</p>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={e => deleteNotification(notification.id, e)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all" className="w-full">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{entityName} Notifications</h2>
            <p className="text-muted-foreground">
              {unreadNotifications.length > 0
                ? `${unreadNotifications.length} unread notification${unreadNotifications.length !== 1 ? 's' : ''}`
                : 'All caught up!'}
            </p>
          </div>
          {unreadNotifications.length > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>

        <ScrollableTabsList>
          <TabsTrigger value="all">
            All
            <Badge variant="secondary" className="ml-2">
              {notifications.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {unreadNotifications.length > 0 && (
              <Badge variant="default" className="ml-2">
                {unreadNotifications.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="read">Read</TabsTrigger>
        </ScrollableTabsList>

        <TabsContent value="all" className="mt-6">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-semibold">No notifications yet</p>
                <p className="text-sm text-muted-foreground">
                  Notifications for this {entityType} will show up here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification: any) => (
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
                <p className="text-lg font-semibold">All caught up!</p>
                <p className="text-sm text-muted-foreground">All notifications have been read</p>
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
                <Bell className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-semibold">No read notifications</p>
                <p className="text-sm text-muted-foreground">Read notifications will appear here</p>
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
