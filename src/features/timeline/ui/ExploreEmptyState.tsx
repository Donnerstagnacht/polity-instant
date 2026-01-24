'use client';

import { cn } from '@/utils/utils';
import { Button } from '@/components/ui/button';
import { Compass, Loader2, TrendingUp, Users, Hash } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export interface ExploreEmptyStateProps {
  /** Whether content is being loaded */
  isLoading?: boolean;
  /** Suggested topics to follow */
  suggestedTopics?: Array<{
    id: string;
    name: string;
    count?: number;
  }>;
  /** Callback when a topic is selected */
  onTopicClick?: (topicId: string) => void;
  /** Callback for "Browse all topics" action */
  onBrowseTopics?: () => void;
  className?: string;
}

/**
 * Empty state for Explore mode
 * Shown when there's no content to discover
 * Different from Subscribed empty state - focuses on discovery
 */
export function ExploreEmptyState({
  isLoading = false,
  suggestedTopics = [],
  onTopicClick,
  onBrowseTopics,
  className,
}: ExploreEmptyStateProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-16', className)}>
        <div className="mb-4 rounded-full bg-blue-50 p-4 dark:bg-blue-950/30">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">{t('timeline.explore.empty.loading')}</h3>
        <p className="text-center text-sm text-muted-foreground">
          {t('timeline.explore.empty.loadingDesc')}
        </p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center justify-center py-16', className)}>
      {/* Icon */}
      <div className="mb-6 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 p-6 dark:from-blue-950/30 dark:to-purple-950/30">
        <Compass className="h-12 w-12 text-blue-500" />
      </div>

      {/* Title and description */}
      <h3 className="mb-2 text-xl font-semibold">{t('timeline.explore.empty.title')}</h3>
      <p className="mb-8 max-w-md text-center text-muted-foreground">
        {t('timeline.explore.empty.description')}
      </p>

      {/* Suggested topics */}
      {suggestedTopics.length > 0 && (
        <div className="mb-6 w-full max-w-md">
          <h4 className="mb-3 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            {t('timeline.explore.empty.popularTopics')}
          </h4>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestedTopics.map(topic => (
              <Button
                key={topic.id}
                variant="outline"
                size="sm"
                onClick={() => onTopicClick?.(topic.id)}
                className="gap-1.5"
              >
                <Hash className="h-3 w-3" />
                {topic.name}
                {topic.count !== undefined && (
                  <span className="text-xs text-muted-foreground">({topic.count})</span>
                )}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        {onBrowseTopics && (
          <Button onClick={onBrowseTopics} className="gap-2">
            <Hash className="h-4 w-4" />
            {t('timeline.explore.empty.browseTopics')}
          </Button>
        )}
        <Button variant="outline" className="gap-2">
          <Users className="h-4 w-4" />
          {t('timeline.explore.empty.findGroups')}
        </Button>
      </div>

      {/* Hint */}
      <p className="mt-8 text-center text-xs text-muted-foreground">
        {t('timeline.explore.empty.hint')}
      </p>
    </div>
  );
}

/**
 * Minimal explore empty state (for inline use)
 */
export function ExploreEmptyStateCompact({ className }: { className?: string }) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed py-8',
        className
      )}
    >
      <Compass className="mb-2 h-6 w-6 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{t('timeline.explore.empty.compact')}</p>
    </div>
  );
}
