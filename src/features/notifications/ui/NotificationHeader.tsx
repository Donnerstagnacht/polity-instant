import { Button } from '@/components/ui/button';
import { CheckCheck } from 'lucide-react';
import { PushNotificationToggle } from '@/components/push-notification-toggle';

interface NotificationHeaderProps {
  unreadCount: number;
  onMarkAllAsRead: () => void;
}

export function NotificationHeader({ unreadCount, onMarkAllAsRead }: NotificationHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Notifications v1</h1>
        <p className="text-muted-foreground">
          {unreadCount > 0
            ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
            : 'All caught up!'}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <PushNotificationToggle variant="minimal" />
        {unreadCount > 0 && (
          <Button onClick={onMarkAllAsRead} variant="outline">
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>
    </div>
  );
}
