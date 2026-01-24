'use client';

import { SlidersHorizontal, ArrowUpDown, Settings } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/utils/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TimelineModeToggle } from './TimelineModeToggle';
import { TimelineMode } from '../hooks/useTimelineMode';
import { TimelineSortOption } from '../hooks/useTimelineFilters';

export interface TimelineHeaderProps {
  /** Current active mode */
  mode: TimelineMode;
  /** Callback when mode changes */
  onModeChange: (mode: TimelineMode) => void;
  /** Current sort option */
  sortBy: TimelineSortOption;
  /** Callback when sort changes */
  onSortChange: (sort: TimelineSortOption) => void;
  /** Callback to open filter panel */
  onFilterClick?: () => void;
  /** Number of active filters */
  activeFilterCount?: number;
  /** Badge count for Following tab (unread count) */
  followingBadge?: number;
  /** Badge count for Decisions tab (urgent votes/elections) */
  decisionsBadge?: number;
  /** Callback to open settings */
  onSettingsClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Sort options with labels
 */
const SORT_OPTIONS: { value: TimelineSortOption; labelKey: string }[] = [
  { value: 'recent', labelKey: 'features.timeline.sort.recent' },
  { value: 'trending', labelKey: 'features.timeline.sort.trending' },
  { value: 'engagement', labelKey: 'features.timeline.sort.engagement' },
];

/**
 * TimelineHeader - Main header for the timeline page
 *
 * Features:
 * - Title: "Your Political Ecosystem"
 * - Mode Toggle: Following / Decisions
 * - Filter button (hidden in Decisions mode)
 * - Sort dropdown
 * - Settings icon
 */
export function TimelineHeader({
  mode,
  onModeChange,
  sortBy,
  onSortChange,
  onFilterClick,
  activeFilterCount = 0,
  followingBadge,
  decisionsBadge,
  onSettingsClick,
  className,
}: TimelineHeaderProps) {
  const { t } = useTranslation();
  const isDecisionsMode = mode === 'decisions';

  return (
    <div className={cn('space-y-4', className)}>
      {/* Title row */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          {t('features.timeline.header.title', { defaultValue: 'Your Political Ecosystem' })}
        </h1>

        {/* Settings button */}
        {onSettingsClick && (
          <Button variant="ghost" size="icon" onClick={onSettingsClick}>
            <Settings className="h-5 w-5" />
            <span className="sr-only">
              {t('features.timeline.header.settings', { defaultValue: 'Settings' })}
            </span>
          </Button>
        )}
      </div>

      {/* Controls row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Mode toggle */}
        <TimelineModeToggle
          mode={mode}
          onModeChange={onModeChange}
          followingBadge={followingBadge}
          decisionsBadge={decisionsBadge}
        />

        {/* Filter and sort controls */}
        <div className="flex items-center gap-2">
          {/* Filter button - hidden in Decisions mode */}
          {!isDecisionsMode && onFilterClick && (
            <Button variant="outline" size="sm" onClick={onFilterClick} className="relative">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              {t('features.timeline.header.filter', { defaultValue: 'Filter' })}

              {/* Active filter count badge */}
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 min-w-[20px] px-1.5 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          )}

          {/* Sort dropdown - hidden in Decisions mode (has its own sorting) */}
          {!isDecisionsMode && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  {t(`features.timeline.sort.${sortBy}`, { defaultValue: 'Sort' })}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {SORT_OPTIONS.map(option => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => onSortChange(option.value)}
                    className={cn(sortBy === option.value && 'bg-accent')}
                  >
                    {t(option.labelKey, { defaultValue: option.value })}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}

export default TimelineHeader;
