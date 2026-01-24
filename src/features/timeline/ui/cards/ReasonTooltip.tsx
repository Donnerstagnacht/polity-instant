'use client';

import { useState } from 'react';
import { cn } from '@/utils/utils';
import { Info, TrendingUp, Users, Star, User } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslation } from '@/hooks/use-translation';

export type ReasonCategory = 'trending' | 'popular_topic' | 'similar_groups' | 'your_content';

export interface ReasonTooltipProps {
  category: ReasonCategory;
  /** Additional context like topic name, group name, etc. */
  context?: string;
  className?: string;
}

/**
 * Get reason configuration for display
 */
function getReasonConfig(category: ReasonCategory, context?: string) {
  switch (category) {
    case 'trending':
      return {
        Icon: TrendingUp,
        labelKey: 'timeline.explore.reasons.trending',
        colorClass: 'text-orange-500',
        bgClass: 'bg-orange-50 dark:bg-orange-950/30',
      };
    case 'popular_topic':
      return {
        Icon: Star,
        labelKey: 'timeline.explore.reasons.popularTopic',
        colorClass: 'text-yellow-500',
        bgClass: 'bg-yellow-50 dark:bg-yellow-950/30',
        contextPrefix: 'in ',
      };
    case 'similar_groups':
      return {
        Icon: Users,
        labelKey: 'timeline.explore.reasons.similarGroups',
        colorClass: 'text-blue-500',
        bgClass: 'bg-blue-50 dark:bg-blue-950/30',
      };
    case 'your_content':
      return {
        Icon: User,
        labelKey: 'timeline.explore.reasons.yourContent',
        colorClass: 'text-green-500',
        bgClass: 'bg-green-50 dark:bg-green-950/30',
      };
    default:
      return {
        Icon: Info,
        labelKey: 'timeline.explore.reasons.default',
        colorClass: 'text-gray-500',
        bgClass: 'bg-gray-50 dark:bg-gray-950/30',
      };
  }
}

/**
 * "Why am I seeing this?" tooltip for Explore mode cards
 * Shows a small info icon that explains why content appears in the feed
 */
export function ReasonTooltip({ category, context, className }: ReasonTooltipProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const config = getReasonConfig(category, context);
  const Icon = config.Icon;

  // Build the reason text
  let reasonText = t(config.labelKey);
  if (context && config.contextPrefix) {
    reasonText = `${reasonText} ${config.contextPrefix}${context}`;
  } else if (context) {
    reasonText = `${reasonText}: ${context}`;
  }

  return (
    <TooltipProvider>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <button
            className={cn(
              'inline-flex items-center justify-center rounded-full p-1 transition-colors',
              'hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring',
              className
            )}
            onClick={e => {
              e.stopPropagation();
              setOpen(!open);
            }}
            aria-label={t('timeline.explore.whySeeing')}
          >
            <Info className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className={cn('flex items-center gap-2 px-3 py-2', config.bgClass)}
        >
          <Icon className={cn('h-4 w-4', config.colorClass)} />
          <span className="text-sm">{reasonText}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Inline reason badge (alternative to tooltip)
 * Shows reason directly on the card
 */
export function ReasonBadge({ category, context, className }: ReasonTooltipProps) {
  const { t } = useTranslation();
  const config = getReasonConfig(category, context);
  const Icon = config.Icon;

  let reasonText = t(config.labelKey);
  if (context && config.contextPrefix) {
    reasonText = `${reasonText} ${config.contextPrefix}${context}`;
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs',
        config.bgClass,
        className
      )}
    >
      <Icon className={cn('h-3 w-3', config.colorClass)} />
      <span className="text-muted-foreground">{reasonText}</span>
    </div>
  );
}
