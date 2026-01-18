import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import { TodoPriority } from '../types/todo.types';
import { SortBy } from '../hooks/useTodoFilters';
import { useTranslation } from '@/hooks/use-translation';

interface TodosFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterPriority: 'all' | TodoPriority;
  setFilterPriority: (priority: 'all' | TodoPriority) => void;
  sortBy: SortBy;
  setSortBy: (sort: SortBy) => void;
}

export function TodosFilters({
  searchQuery,
  setSearchQuery,
  filterPriority,
  setFilterPriority,
  sortBy,
  setSortBy,
}: TodosFiltersProps) {
  const { t } = useTranslation();
  
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('features.todos.search.placeholder')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={filterPriority} onValueChange={(v: any) => setFilterPriority(v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={t('features.todos.priority.title')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('features.todos.priority.all')}</SelectItem>
                <SelectItem value="urgent">{t('features.todos.priority.urgent')}</SelectItem>
                <SelectItem value="high">{t('features.todos.priority.high')}</SelectItem>
                <SelectItem value="medium">{t('features.todos.priority.medium')}</SelectItem>
                <SelectItem value="low">{t('features.todos.priority.low')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={t('features.todos.sort.title')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dueDate">{t('features.todos.sort.dueDate')}</SelectItem>
                <SelectItem value="priority">{t('features.todos.sort.priority')}</SelectItem>
                <SelectItem value="createdAt">{t('features.todos.sort.createdAt')}</SelectItem>
                <SelectItem value="title">{t('features.todos.sort.titleSort')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
