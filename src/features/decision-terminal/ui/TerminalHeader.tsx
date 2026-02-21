'use client';

import { useState } from 'react';
import { cn } from '@/utils/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Settings, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export type TerminalFilter = 'live' | 'closing_soon' | 'recently_closed' | 'all';

export interface TerminalHeaderProps {
  activeFilter: TerminalFilter;
  onFilterChange: (filter: TerminalFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  urgentCount?: number;
  activeCount?: number;
  className?: string;
}

/**
 * Header for Decision Terminal
 * Contains filter tabs, search, and settings
 */
export function TerminalHeader({
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  urgentCount = 0,
  activeCount = 0,
  className,
}: TerminalHeaderProps) {
  const { t } = useTranslation();
  const [showSearch, setShowSearch] = useState(false);

  const filters: { value: TerminalFilter; labelKey: string }[] = [
    { value: 'live', labelKey: 'timeline.terminal.filters.live' },
    { value: 'closing_soon', labelKey: 'timeline.terminal.filters.closingSoon' },
    { value: 'recently_closed', labelKey: 'timeline.terminal.filters.recentlyClosed' },
    { value: 'all', labelKey: 'timeline.terminal.filters.all' },
  ];

  return (
    <div className={cn('border-b border-gray-200 dark:border-gray-700', className)}>
      {/* Title bar with stats */}
      <div className="flex flex-col gap-2 px-4 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold">🖥️ {t('timeline.terminal.title')}</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {urgentCount > 0 && (
            <span className="flex items-center gap-1 font-mono text-xs">
              <span className="animate-pulse text-red-500">🔴</span>
              <span className="font-medium text-red-600 dark:text-red-400">
                {urgentCount} {t('timeline.terminal.urgent')}
              </span>
            </span>
          )}
          <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
            📊 {activeCount} {t('timeline.terminal.active')}
          </span>
        </div>
      </div>

      {/* Filter tabs and actions */}
      <div className="flex flex-col gap-2 px-4 py-2 sm:flex-row sm:items-center sm:justify-between">
        {/* Filter tabs */}
        <div className="flex flex-wrap gap-1">
          {filters.map(filter => (
            <Button
              key={filter.value}
              variant={activeFilter === filter.value ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onFilterChange(filter.value)}
              className={cn(
                'font-mono text-xs',
                activeFilter === filter.value && 'bg-muted font-medium'
              )}
            >
              {t(filter.labelKey)}
            </Button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {showSearch ? (
            <Input
              type="text"
              placeholder={t('timeline.terminal.searchPlaceholder')}
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              className="h-8 w-full font-mono text-xs sm:w-48"
              autoFocus
              onBlur={() => {
                if (!searchQuery) setShowSearch(false);
              }}
            />
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowSearch(true)}
            >
              <Search className="h-4 w-4" />
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                {t('timeline.terminal.settings.density')}
              </DropdownMenuItem>
              <DropdownMenuItem>{t('timeline.terminal.settings.refreshRate')}</DropdownMenuItem>
              <DropdownMenuItem>{t('timeline.terminal.settings.soundAlerts')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
