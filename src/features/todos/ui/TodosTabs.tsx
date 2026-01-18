import { ScrollableTabsList } from '@/components/ui/scrollable-tabs';
import { Tabs, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckSquare,
  Circle,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { TodoStatus } from '../types/todo.types';
import { useTranslation } from '@/hooks/use-translation';

interface TodosTabsProps {
  selectedTab: 'all' | TodoStatus;
  setSelectedTab: (tab: 'all' | TodoStatus) => void;
  statusCounts: {
    all: number;
    pending: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
  children: React.ReactNode;
}

export function TodosTabs({
  selectedTab,
  setSelectedTab,
  statusCounts,
  children,
}: TodosTabsProps) {
  const { t } = useTranslation();
  
  return (
    <Tabs value={selectedTab} onValueChange={(v: any) => setSelectedTab(v)}>
      <ScrollableTabsList className="mb-6">
        <TabsTrigger value="all" className="flex items-center gap-2">
          <CheckSquare className="h-4 w-4" />
          {t('features.todos.status.all')} ({statusCounts.all})
        </TabsTrigger>
        <TabsTrigger value="pending" className="flex items-center gap-2">
          <Circle className="h-4 w-4" />
          {t('features.todos.status.pending')} ({statusCounts.pending})
        </TabsTrigger>
        <TabsTrigger value="in_progress" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          {t('features.todos.status.in_progress')} ({statusCounts.in_progress})
        </TabsTrigger>
        <TabsTrigger value="completed" className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          {t('features.todos.status.completed')} ({statusCounts.completed})
        </TabsTrigger>
        <TabsTrigger value="cancelled" className="flex items-center gap-2">
          <XCircle className="h-4 w-4" />
          {t('features.todos.status.cancelled')} ({statusCounts.cancelled})
        </TabsTrigger>
      </ScrollableTabsList>

      <TabsContent value={selectedTab}>
        {children}
      </TabsContent>
    </Tabs>
  );
}
