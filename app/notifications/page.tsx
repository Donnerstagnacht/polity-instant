'use client';

import { PageWrapper } from '@/components/layout/page-wrapper';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { db, tx } from '../../db';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Check, CheckCheck, Users, Calendar, MessageSquare, UserPlus, X } from 'lucide-react';
import { cn } from '@/utils/utils';

type NotificationType =
  | 'group_invite'
  | 'event_invite'
  | 'message'
  | 'follow'
  | 'mention'
  | 'event_update'
  | 'group_update';

const notificationIcons: Record<NotificationType, any> = {
  group_invite: Users,
  event_invite: Calendar,
  message: MessageSquare,
  follow: UserPlus,
  mention: Bell,
  event_update: Calendar,
  group_update: Users,
};

const notificationColors: Record<NotificationType, string> = {
  group_invite: 'text-blue-500',
  event_invite: 'text-purple-500',
  message: 'text-green-500',
  follow: 'text-pink-500',
  mention: 'text-orange-500',
  event_update: 'text-indigo-500',
  group_update: 'text-cyan-500',
};

export default function NotificationsPage() {
  const { user } = db.useAuth();
  const router = useRouter();

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

  const notifications = data?.notifications || [];

  // Filter notifications based on user's access
  const accessibleNotifications = notifications.filter((n: any) => {
    // Personal notifications
    if (n.recipient?.id === user?.id) return true;

    // Entity notifications where user has manageNotifications right
    if (n.recipientGroup && n.recipientGroup.memberships?.length > 0) {
      const membership = n.recipientGroup.memberships[0];
      const hasManageNotificationsRight = membership.role?.actionRights?.some(
        (right: any) => right.resource === 'notifications' && right.action === 'manageNotifications'
      );
      return hasManageNotificationsRight;
    }

    if (n.recipientEvent && n.recipientEvent.participants?.length > 0) {
      const participant = n.recipientEvent.participants[0];
      const hasManageNotificationsRight = participant.role?.actionRights?.some(
        (right: any) => right.resource === 'notifications' && right.action === 'manageNotifications'
      );
      return hasManageNotificationsRight;
    }

    if (n.recipientAmendment && n.recipientAmendment.amendmentRoleCollaborators?.length > 0) {
      const collaborator = n.recipientAmendment.amendmentRoleCollaborators[0];
      const hasManageNotificationsRight = collaborator.role?.actionRights?.some(
        (right: any) => right.resource === 'notifications' && right.action === 'manageNotifications'
      );
      return hasManageNotificationsRight;
    }

    if (n.recipientBlog && n.recipientBlog.blogRoleBloggers?.length > 0) {
      const blogger = n.recipientBlog.blogRoleBloggers[0];
      const hasManageNotificationsRight = blogger.role?.actionRights?.some(
        (right: any) => right.resource === 'notifications' && right.action === 'manageNotifications'
      );
      return hasManageNotificationsRight;
    }

    return false;
  });

  const unreadNotifications = accessibleNotifications.filter((n: any) => !n.isRead);
  const readNotifications = accessibleNotifications.filter((n: any) => n.isRead);

  // Separate personal and entity notifications
  const personalNotifications = accessibleNotifications.filter(
    (n: any) => n.recipient?.id === user?.id
  );
  const entityNotifications = accessibleNotifications.filter(
    (n: any) => n.recipientGroup || n.recipientEvent || n.recipientAmendment || n.recipientBlog
  );

  const handleNotificationClick = async (notification: any) => {
    // Mark as read if not already
    if (!notification.isRead) {
      await db.transact([
        tx.notifications[notification.id].update({
          isRead: true,
        }),
      ]);
    }

    // Navigate based on related entity
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    } else if (notification.relatedEntityType) {
      switch (notification.relatedEntityType) {
        case 'group':
          if (notification.relatedGroup?.id) {
            router.push(`/group/${notification.relatedGroup.id}`);
          }
          break;
        case 'event':
          if (notification.relatedEvent?.id) {
            router.push(`/event/${notification.relatedEvent.id}`);
          }
          break;
        case 'user':
          if (notification.relatedUser?.id) {
            router.push(`/user/${notification.relatedUser.id}`);
          }
          break;
        case 'message':
          router.push('/messages');
          break;
        case 'blog':
          if (notification.relatedBlog?.id) {
            router.push(`/blog/${notification.relatedBlog.id}`);
          }
          break;
        case 'amendment':
          if (notification.relatedAmendment?.id) {
            router.push(`/amendment/${notification.relatedAmendment.id}`);
          }
          break;
        default:
          break;
      }
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
      // 7 days
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

    // Determine if this is a personal or entity notification
    const isEntityNotification = !!(
      notification.recipientGroup ||
      notification.recipientEvent ||
      notification.recipientAmendment ||
      notification.recipientBlog
    );

    // Get entity sent on behalf of
    const onBehalfEntity =
      notification.onBehalfOfGroup ||
      notification.onBehalfOfEvent ||
      notification.onBehalfOfAmendment ||
      notification.onBehalfOfBlog;

    // Get recipient entity
    const recipientEntity =
      notification.recipientGroup ||
      notification.recipientEvent ||
      notification.recipientAmendment ||
      notification.recipientBlog;

    return (
      <Card
        className={cn(
          'cursor-pointer transition-all hover:shadow-md',
          !notification.isRead && 'border-l-4 border-l-primary bg-accent/50',
          isEntityNotification && 'border-l-blue-500'
        )}
        onClick={() => handleNotificationClick(notification)}
      >
        <CardContent className="flex items-start gap-4 p-4">
          {/* Notification Icon */}
          <div className={cn('rounded-full bg-muted p-2', !notification.isRead && 'bg-primary/10')}>
            <Icon className={cn('h-5 w-5', iconColor)} />
          </div>

          {/* Sender Avatar (if available) */}
          {notification.sender && (
            <div className="flex flex-col items-center gap-1">
              <Avatar
                className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-primary"
                onClick={e => {
                  e.stopPropagation();
                  router.push(`/user/${notification.sender.id}`);
                }}
              >
                <AvatarImage src={notification.sender.avatar} />
                <AvatarFallback>
                  {notification.sender.name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              {onBehalfEntity && (
                <>
                  <span className="text-xs text-muted-foreground">for</span>
                  <Avatar
                    className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-blue-500"
                    onClick={e => {
                      e.stopPropagation();
                      const entityType = notification.onBehalfOfGroup
                        ? 'group'
                        : notification.onBehalfOfEvent
                          ? 'event'
                          : notification.onBehalfOfAmendment
                            ? 'amendment'
                            : 'blog';
                      router.push(`/${entityType}/${onBehalfEntity.id}`);
                    }}
                  >
                    <AvatarImage src={onBehalfEntity.imageURL} />
                    <AvatarFallback className="bg-blue-500 text-xs text-white">
                      {onBehalfEntity.name?.[0]?.toUpperCase() ||
                        onBehalfEntity.title?.[0]?.toUpperCase() ||
                        'E'}
                    </AvatarFallback>
                  </Avatar>
                </>
              )}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-1">
                <p className={cn('font-medium', !notification.isRead && 'font-semibold')}>
                  {notification.title}
                </p>
                {isEntityNotification && recipientEntity && (
                  <Badge variant="outline" className="w-fit">
                    <Users className="mr-1 h-3 w-3" />
                    {recipientEntity.name || recipientEntity.title || 'Entity'} notification
                  </Badge>
                )}
              </div>
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
      <AuthGuard requireAuth={true}>
        <PageWrapper className="container mx-auto p-4">
          <div className="flex h-[400px] items-center justify-center">
            <p className="text-muted-foreground">Loading notifications...</p>
          </div>
        </PageWrapper>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="container mx-auto min-h-screen max-w-4xl p-4">
        <Tabs defaultValue="all" className="w-full">
          {/* Fixed Header */}
          <div className="sticky top-0 z-10 mb-6 border-b bg-background/95 pb-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Notifications</h1>
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

            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">
                All
                <Badge variant="secondary" className="ml-2">
                  {accessibleNotifications.length}
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
              <TabsTrigger value="personal">
                Personal
                <Badge variant="secondary" className="ml-2">
                  {personalNotifications.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="entity">
                Entity
                <Badge variant="secondary" className="ml-2">
                  {entityNotifications.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-0">
            {accessibleNotifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bell className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-lg font-semibold">No notifications yet</p>
                  <p className="text-sm text-muted-foreground">
                    When you get notifications, they'll show up here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {accessibleNotifications.map((notification: any) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="unread" className="mt-0">
            {unreadNotifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Check className="mb-4 h-12 w-12 text-green-500" />
                  <p className="text-lg font-semibold">All caught up!</p>
                  <p className="text-sm text-muted-foreground">
                    You've read all your notifications
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

          <TabsContent value="read" className="mt-0">
            {readNotifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bell className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-lg font-semibold">No read notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Notifications you've read will appear here
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

          <TabsContent value="personal" className="mt-0">
            {personalNotifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bell className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-lg font-semibold">No personal notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Notifications sent directly to you will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {personalNotifications.map((notification: any) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="entity" className="mt-0">
            {entityNotifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-lg font-semibold">No entity notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Notifications for groups, events, and amendments you're part of will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {entityNotifications.map((notification: any) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </PageWrapper>
    </AuthGuard>
  );
}
