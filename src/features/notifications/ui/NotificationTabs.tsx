import { Badge } from '@/components/ui/badge';
import { TabsTrigger } from '@/components/ui/tabs';
import { ScrollableTabsList } from '@/components/ui/scrollable-tabs';
import { useTranslation } from '@/hooks/use-translation';

interface NotificationTabsProps {
  allCount: number;
  unreadCount: number;
  personalCount: number;
  entityCount: number;
}

export function NotificationTabs({
  allCount,
  unreadCount,
  personalCount,
  entityCount,
}: NotificationTabsProps) {
  const { t } = useTranslation();
  
  return (
    <ScrollableTabsList>
      <TabsTrigger value="all">
        {t('features.notifications.filters.all')}
        <Badge variant="secondary" className="ml-2">
          {allCount}
        </Badge>
      </TabsTrigger>
      <TabsTrigger value="unread">
        {t('features.notifications.filters.unread')}
        {unreadCount > 0 && (
          <Badge variant="default" className="ml-2">
            {unreadCount}
          </Badge>
        )}
      </TabsTrigger>
      <TabsTrigger value="read">{t('features.notifications.filters.read')}</TabsTrigger>
      <TabsTrigger value="personal">
        {t('features.notifications.filters.personal')}
        <Badge variant="secondary" className="ml-2">
          {personalCount}
        </Badge>
      </TabsTrigger>
      <TabsTrigger value="entity">
        {t('features.notifications.filters.entity')}
        <Badge variant="secondary" className="ml-2">
          {entityCount}
        </Badge>
      </TabsTrigger>
    </ScrollableTabsList>
  );
}
