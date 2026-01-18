import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, X, Bell } from 'lucide-react';
import { cn } from '@/utils/utils';
import { Notification, NotificationType } from '../types/notification.types';
import { notificationIcons, notificationColors } from '../utils/notificationConstants';
import { formatTime } from '../utils/notificationHelpers';
import { useTranslation } from '@/hooks/use-translation';

interface NotificationItemProps {
  notification: Notification;
  onNotificationClick: (notification: Notification) => void;
  onDeleteNotification: (notificationId: string, e: React.MouseEvent) => void;
}

export function NotificationItem({
  notification,
  onNotificationClick,
  onDeleteNotification,
}: NotificationItemProps) {
  const { t } = useTranslation();
  const router = useRouter();
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
      onClick={() => onNotificationClick(notification)}
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
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/user/${notification.sender!.id}`);
              }}
            >
              <AvatarImage src={notification.sender.avatar} />
              <AvatarFallback>
                {notification.sender.name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            {onBehalfEntity && (
              <>
                <span className="text-xs text-muted-foreground">{t('features.notifications.item.for')}</span>
                <Avatar
                  className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-blue-500"
                  onClick={(e) => {
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
                    {((onBehalfEntity as any).name?.[0] || (onBehalfEntity as any).title?.[0])?.toUpperCase() || 'E'}
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
                  {(recipientEntity as any).name || (recipientEntity as any).title || 'Entity'} {t('features.notifications.item.notification')}
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
              onClick={(e) => onDeleteNotification(notification.id, e)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
