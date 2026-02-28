import { Search, X } from 'lucide-react';
import { Input } from '@/features/shared/ui/ui/input.tsx';
import { Badge } from '@/features/shared/ui/ui/badge.tsx';
import { Button } from '@/features/shared/ui/ui/button.tsx';
import { cn } from '@/features/shared/utils/utils.ts';

export interface FilterOption {
  label: string;
  value: string;
  active: boolean;
  gradient?: string;
}

interface EntitySearchBarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  placeholder?: string;
  filterOptions?: FilterOption[];
  onFilterToggle?: (value: string) => void;
  className?: string;
}

export function EntitySearchBar({
  searchQuery,
  onSearchQueryChange,
  placeholder = 'Search...',
  filterOptions,
  onFilterToggle,
  className,
}: EntitySearchBarProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={e => onSearchQueryChange(e.target.value)}
          className="pl-9 pr-9"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
            onClick={() => onSearchQueryChange('')}
          >
            <X className="h-3.5 w-3.5" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>

      {filterOptions && filterOptions.length > 0 && onFilterToggle && (
        <div className="flex flex-wrap gap-1.5">
          {filterOptions.map(option => (
            <Badge
              key={option.value}
              variant={option.active ? 'default' : 'outline'}
              className={cn(
                'cursor-pointer select-none transition-colors',
                option.active && option.gradient && 'border-0 text-white',
                option.active && option.gradient && option.gradient
              )}
              onClick={() => onFilterToggle(option.value)}
            >
              {option.label}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
