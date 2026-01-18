import { TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/hooks/use-translation';

export type CommentSortBy = 'votes' | 'time';

interface CommentSortSelectProps {
  sortBy: CommentSortBy;
  onSortChange: (sortBy: CommentSortBy) => void;
  className?: string;
}

export function CommentSortSelect({ sortBy, onSortChange, className }: CommentSortSelectProps) {
  const { t } = useTranslation();
  
  return (
    <Select value={sortBy} onValueChange={value => onSortChange(value as CommentSortBy)}>
      <SelectTrigger className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="votes">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>{t('common.comments.sortBy.topVoted')}</span>
          </div>
        </SelectItem>
        <SelectItem value="time">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span>{t('common.comments.sortBy.newestFirst')}</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
