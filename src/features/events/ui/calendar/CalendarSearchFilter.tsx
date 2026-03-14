import { Input } from '@/features/shared/ui/ui/input';
import { Button } from '@/features/shared/ui/ui/button';
import { Search, X } from 'lucide-react';
import { useTranslation } from '@/features/shared/hooks/use-translation';

interface CalendarSearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  dateFilter: string;
  onDateFilterChange: (date: string) => void;
}

export function CalendarSearchFilter({
  searchQuery,
  onSearchChange,
  dateFilter,
  onDateFilterChange,
}: CalendarSearchFilterProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder={t('features.calendar.search.placeholder')}
          className="pl-9 pr-9"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
            onClick={() => onSearchChange('')}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      <Input
        type="date"
        value={dateFilter}
        onChange={e => onDateFilterChange(e.target.value)}
        className="w-auto sm:w-44"
      />
      {dateFilter && (
        <Button variant="ghost" size="sm" onClick={() => onDateFilterChange('')}>
          <X className="mr-1 h-3.5 w-3.5" />
          {t('features.calendar.search.clearDate')}
        </Button>
      )}
    </div>
  );
}
