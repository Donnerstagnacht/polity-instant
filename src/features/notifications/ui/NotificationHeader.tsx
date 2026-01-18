import { Button } from '@/components/ui/button';
import { CheckCheck } from 'lucide-react';
import { PushNotificationToggle } from '@/components/push-notification-toggle';
import { useTranslation } from '@/hooks/use-translation';

interface NotificationHeaderProps {
  unreadCount: number;
  onMarkAllAsRead: () => void;
}

export function NotificationHeader({ unreadCount, onMarkAllAsRead }: NotificationHeaderProps) {
  const { t } = useTranslation();
  
  const getUnreadText = () => {
    if (unreadCount === 0) {
      return t('features.notifications.allCaughtUp');
    }
    return unreadCount === 1
      ? t('features.notifications.unreadCount', { count: unreadCount })
      : t('features.notifications.unreadCountPlural', { count: unreadCount });
  };

  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">{t('features.notifications.titleVersion')}</h1>
        <p className="text-muted-foreground">
          {getUnreadText()}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <PushNotificationToggle variant="minimal" />
        {unreadCount > 0 && (
          <Button onClick={onMarkAllAsRead} variant="outline">
            <CheckCheck className="mr-2 h-4 w-4" />
            {t('features.notifications.markAllAsRead')}
          </Button>
        )}
      </div>
    </div>
  );
}
