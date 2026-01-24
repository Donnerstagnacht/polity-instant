'use client';

import { useState } from 'react';
import { cn } from '@/utils/utils';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, User, Compass, TrendingUp } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export type ExploreSectionType = 'your_activity' | 'discover' | 'trending';

export interface ExploreSectionHeaderProps {
  section: ExploreSectionType;
  /** Number of items in this section (optional) */
  itemCount?: number;
  /** Whether the section is collapsible */
  collapsible?: boolean;
  /** Whether the section is currently collapsed */
  collapsed?: boolean;
  /** Callback when collapse state changes */
  onCollapseChange?: (collapsed: boolean) => void;
  className?: string;
}

/**
 * Get section configuration for display
 */
function getSectionConfig(section: ExploreSectionType) {
  switch (section) {
    case 'your_activity':
      return {
        Icon: User,
        labelKey: 'timeline.explore.sections.yourActivity',
        descriptionKey: 'timeline.explore.sections.yourActivityDesc',
        colorClass: 'text-green-600 dark:text-green-400',
        bgClass: 'bg-green-50 dark:bg-green-950/20',
        borderClass: 'border-green-200 dark:border-green-800',
      };
    case 'discover':
      return {
        Icon: Compass,
        labelKey: 'timeline.explore.sections.discover',
        descriptionKey: 'timeline.explore.sections.discoverDesc',
        colorClass: 'text-blue-600 dark:text-blue-400',
        bgClass: 'bg-blue-50 dark:bg-blue-950/20',
        borderClass: 'border-blue-200 dark:border-blue-800',
      };
    case 'trending':
      return {
        Icon: TrendingUp,
        labelKey: 'timeline.explore.sections.trending',
        descriptionKey: 'timeline.explore.sections.trendingDesc',
        colorClass: 'text-orange-600 dark:text-orange-400',
        bgClass: 'bg-orange-50 dark:bg-orange-950/20',
        borderClass: 'border-orange-200 dark:border-orange-800',
      };
    default:
      return {
        Icon: Compass,
        labelKey: 'timeline.explore.sections.discover',
        descriptionKey: '',
        colorClass: 'text-gray-600 dark:text-gray-400',
        bgClass: 'bg-gray-50 dark:bg-gray-950/20',
        borderClass: 'border-gray-200 dark:border-gray-800',
      };
  }
}

/**
 * Section header for Explore mode
 * Divides the timeline into sections: Your Activity, Discover, Trending
 */
export function ExploreSectionHeader({
  section,
  itemCount,
  collapsible = false,
  collapsed = false,
  onCollapseChange,
  className,
}: ExploreSectionHeaderProps) {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const config = getSectionConfig(section);
  const Icon = config.Icon;

  const handleToggle = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapseChange?.(newCollapsed);
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-lg border px-4 py-3',
        config.bgClass,
        config.borderClass,
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn('rounded-full bg-background p-2', config.borderClass)}>
          <Icon className={cn('h-5 w-5', config.colorClass)} />
        </div>
        <div>
          <h3 className="flex items-center gap-2 font-semibold">
            {t(config.labelKey)}
            {itemCount !== undefined && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                {itemCount}
              </span>
            )}
          </h3>
          {config.descriptionKey && (
            <p className="text-xs text-muted-foreground">{t(config.descriptionKey)}</p>
          )}
        </div>
      </div>

      {collapsible && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          className="h-8 w-8 p-0"
          aria-label={isCollapsed ? t('common.expand') : t('common.collapse')}
        >
          {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </Button>
      )}
    </div>
  );
}

/**
 * Simple divider version of section header
 */
export function ExploreSectionDivider({
  section,
  className,
}: {
  section: ExploreSectionType;
  className?: string;
}) {
  const { t } = useTranslation();
  const config = getSectionConfig(section);
  const Icon = config.Icon;

  return (
    <div className={cn('flex items-center gap-3 py-4', className)}>
      <div className="h-px flex-1 bg-border" />
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Icon className={cn('h-4 w-4', config.colorClass)} />
        {t(config.labelKey)}
      </div>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
