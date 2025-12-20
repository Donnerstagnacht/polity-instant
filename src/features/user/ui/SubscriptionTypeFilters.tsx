import { Tabs, TabsTrigger } from '@/components/ui/tabs';
import { ScrollableTabsList } from '@/components/ui/scrollable-tabs';
import { User, Users, Scale, Calendar, BookOpen } from 'lucide-react';
import type { FilterType, SubscriptionCounts } from '../hooks/useSubscriptionsFilters';

interface SubscriptionTypeFiltersProps {
  filterType: FilterType;
  counts: SubscriptionCounts;
  onFilterChange: (type: FilterType) => void;
}

export function SubscriptionTypeFilters({
  filterType,
  counts,
  onFilterChange,
}: SubscriptionTypeFiltersProps) {
  return (
    <Tabs value={filterType} onValueChange={(value) => onFilterChange(value as FilterType)}>
      <ScrollableTabsList>
        <TabsTrigger value="all" className="flex items-center gap-2">
          All ({counts.all})
        </TabsTrigger>
        <TabsTrigger value="users" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Users ({counts.users})
        </TabsTrigger>
        <TabsTrigger value="groups" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Groups ({counts.groups})
        </TabsTrigger>
        <TabsTrigger value="amendments" className="flex items-center gap-2">
          <Scale className="h-4 w-4" />
          Amendments ({counts.amendments})
        </TabsTrigger>
        <TabsTrigger value="events" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Events ({counts.events})
        </TabsTrigger>
        <TabsTrigger value="blogs" className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Blogs ({counts.blogs})
        </TabsTrigger>
      </ScrollableTabsList>
    </Tabs>
  );
}
