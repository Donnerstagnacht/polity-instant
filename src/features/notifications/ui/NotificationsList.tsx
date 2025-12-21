import { Card, CardContent } from '@/components/ui/card';
import { Notification } from '../types/notification.types';
import { NotificationItem } from './NotificationItem';

interface NotificationsListProps {
  notifications: Notification[];
  emptyIcon: React.ComponentType<{ className?: string }>;
  emptyTitle: string;
  emptyDescription: string;
  onNotificationClick: (notification: Notification) => void;
  onDeleteNotification: (notificationId: string, e: React.MouseEvent) => void;
}

export function NotificationsList({
  notifications,
  emptyIcon: EmptyIcon,
  emptyTitle,
  emptyDescription,
  onNotificationClick,
  onDeleteNotification,
}: NotificationsListProps) {
  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <EmptyIcon className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-semibold">{emptyTitle}</p>
          <p className="text-sm text-muted-foreground">{emptyDescription}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onNotificationClick={onNotificationClick}
          onDeleteNotification={onDeleteNotification}
        />
      ))}
    </div>
  );
}
