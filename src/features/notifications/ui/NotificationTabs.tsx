import { Badge } from '@/components/ui/badge';
import { TabsTrigger } from '@/components/ui/tabs';
import { ScrollableTabsList } from '@/components/ui/scrollable-tabs';

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
  return (
    <ScrollableTabsList>
      <TabsTrigger value="all">
        All
        <Badge variant="secondary" className="ml-2">
          {allCount}
        </Badge>
      </TabsTrigger>
      <TabsTrigger value="unread">
        Unread
        {unreadCount > 0 && (
          <Badge variant="default" className="ml-2">
            {unreadCount}
          </Badge>
        )}
      </TabsTrigger>
      <TabsTrigger value="read">Read</TabsTrigger>
      <TabsTrigger value="personal">
        Personal
        <Badge variant="secondary" className="ml-2">
          {personalCount}
        </Badge>
      </TabsTrigger>
      <TabsTrigger value="entity">
        Entity
        <Badge variant="secondary" className="ml-2">
          {entityCount}
        </Badge>
      </TabsTrigger>
    </ScrollableTabsList>
  );
}
