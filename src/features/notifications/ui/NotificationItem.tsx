import { useNavigate } from '@tanstack/react-router';
import { Avatar, AvatarFallback, AvatarImage } from '@/features/shared/ui/ui/avatar';
import { Button } from '@/features/shared/ui/ui/button';
import { Card, CardContent } from '@/features/shared/ui/ui/card';
import { Badge } from '@/features/shared/ui/ui/badge';
import { Users, X, Bell } from 'lucide-react';
import { cn } from '@/features/shared/utils/utils';
import { Notification, NotificationType } from '../types/notification.types';
import { getNotificationIcon, getNotificationColor } from '../utils/notificationConstants';
import { formatTime, getDisplayName } from '../logic/notificationHelpers';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { ENTITY_COLORS, type EntityType as EntityColorType } from '@/features/shared/utils/entity-colors';

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
  const navigate = useNavigate();
  const Icon = getNotificationIcon(notification.type as NotificationType);
  const iconColor = getNotificationColor(notification.type as NotificationType);

  // Determine if this is a personal or entity notification
  const isEntityNotification = !!(
    notification.recipient_group ||
    notification.recipient_event ||
    notification.recipient_amendment ||
    notification.recipient_blog
  );

  // Determine entity type for color coding
  const entityType: EntityColorType | null = notification.recipient_group
    ? 'group'
    : notification.recipient_event
      ? 'event'
      : notification.recipient_amendment
        ? 'amendment'
        : notification.recipient_blog
          ? 'blog'
          : null;

  const entityColors = entityType ? ENTITY_COLORS[entityType] : null;

  // Get entity sent on behalf of
  const onBehalfEntity =
    notification.on_behalf_of_group ||
    notification.on_behalf_of_event ||
    notification.on_behalf_of_amendment ||
    notification.on_behalf_of_blog;

  // Get recipient entity
  const recipientEntity =
    notification.recipient_group ||
    notification.recipient_event ||
    notification.recipient_amendment ||
    notification.recipient_blog;

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        !notification.is_read && 'border-l-4 border-l-primary bg-accent/50',
        isEntityNotification && entityColors && `border-l-4 ${entityColors.notificationBorderLeft}`
      )}
      onClick={() => onNotificationClick(notification)}
    >
      <CardContent className="flex items-start gap-3 p-3">
        {/* Notification Icon */}
        <div className={cn('rounded-full bg-muted p-1.5 mt-0.5', !notification.is_read && 'bg-primary/10')}>
          <Icon className={cn('h-3.5 w-3.5', iconColor)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-0.5">
          {/* Sender + On-behalf-of entity line */}
          {(notification.sender || onBehalfEntity) && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {notification.sender && (
                <>
                  <Avatar
                    className="h-5 w-5 shrink-0 cursor-pointer hover:ring-1 hover:ring-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate({ to: `/user/${notification.sender!.id}` });
                    }}
                  >
                    <AvatarImage src={notification.sender.avatar ?? undefined} />
                    <AvatarFallback className="text-[10px]">
                      {getDisplayName(notification.sender)?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className="font-medium hover:text-primary hover:underline cursor-pointer truncate"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate({ to: `/user/${notification.sender!.id}` });
                    }}
                  >
                    {getDisplayName(notification.sender)}
                  </span>
                </>
              )}
              {notification.sender && onBehalfEntity && (
                <span className="shrink-0">{t('features.notifications.item.for')}</span>
              )}
              {onBehalfEntity && (
                <>
                  <Avatar
                    className="h-5 w-5 shrink-0 cursor-pointer hover:ring-1 hover:ring-blue-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      const eType = notification.on_behalf_of_group
                        ? 'group'
                        : notification.on_behalf_of_event
                          ? 'event'
                          : notification.on_behalf_of_amendment
                            ? 'amendment'
                            : 'blog';
                      navigate({ to: `/${eType}/${onBehalfEntity.id}` });
                    }}
                  >
                    <AvatarImage src={onBehalfEntity.image_url ?? undefined} />
                    <AvatarFallback className="bg-blue-500 text-[10px] text-white">
                      {('name' in onBehalfEntity ? onBehalfEntity.name?.[0] : 'title' in onBehalfEntity ? onBehalfEntity.title?.[0] : '')?.toUpperCase() || 'E'}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className="font-medium truncate"
                  >
                    {'name' in onBehalfEntity ? onBehalfEntity.name : 'title' in onBehalfEntity ? onBehalfEntity.title : 'Entity'}
                  </span>
                </>
              )}
            </div>
          )}
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1">
              <p className={cn('text-sm font-medium', !notification.is_read && 'font-semibold')}>
                {notification.title}
              </p>
              {isEntityNotification && recipientEntity && (
                <Badge variant="outline" className={cn('w-fit', entityColors?.badgeBg)}>
                  <Users className="mr-1 h-3 w-3" />
                  {'name' in recipientEntity ? recipientEntity.name : 'title' in recipientEntity ? recipientEntity.title : 'Entity'} {t('features.notifications.item.notification')}
                </Badge>
              )}
            </div>
            {!notification.is_read && (
              <Badge variant="default" className="h-2 w-2 rounded-full p-0" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">{notification.message}</p>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{formatTime(notification.created_at)}</p>
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
