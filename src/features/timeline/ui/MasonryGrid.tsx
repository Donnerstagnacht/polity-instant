'use client';

import { ReactNode, useMemo, useRef, useEffect } from 'react';
import { cn } from '@/utils/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Rss, Search } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/use-translation';

export interface MasonryGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T, index: number) => string;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  loadingSkeletonCount?: number;
  className?: string;
  gap?: 'sm' | 'md' | 'lg';
}

/**
 * Gap configuration for masonry grid
 */
const GAP_CLASSES = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
} as const;

/**
 * MasonryGrid - A responsive CSS-based masonry layout component
 *
 * Uses CSS columns for a simple, performant masonry effect.
 * Columns:
 * - Mobile (< 640px): 1 column
 * - Tablet (640px - 1024px): 2 columns
 * - Desktop (> 1024px): 3 columns
 * - Large Desktop (> 1280px): 4 columns
 */
export function MasonryGrid<T>({
  items,
  renderItem,
  keyExtractor,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  loadingSkeletonCount = 6,
  className,
  gap = 'md',
}: MasonryGridProps<T>) {
  const { t } = useTranslation();
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);

  const gapClass = GAP_CLASSES[gap];

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!hasMore || !onLoadMore || isLoading) return;

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    const currentTrigger = loadMoreTriggerRef.current;
    if (currentTrigger) {
      observer.observe(currentTrigger);
    }

    return () => {
      if (currentTrigger) {
        observer.unobserve(currentTrigger);
      }
    };
  }, [hasMore, onLoadMore, isLoading]);

  // Render loading skeletons
  const skeletons = useMemo(() => {
    return Array.from({ length: loadingSkeletonCount }).map((_, index) => (
      <MasonryGridSkeleton key={`skeleton-${index}`} index={index} />
    ));
  }, [loadingSkeletonCount]);

  if (isLoading && items.length === 0) {
    return (
      <div className={cn('columns-1 sm:columns-2 lg:columns-3 xl:columns-4', gapClass, className)}>
        {skeletons}
      </div>
    );
  }

  if (items.length === 0) {
    return <MasonryGridEmpty />;
  }

  return (
    <div className="space-y-6">
      <div className={cn('columns-1 sm:columns-2 lg:columns-3 xl:columns-4', gapClass, className)}>
        {items.map((item, index) => (
          <div key={keyExtractor(item, index)} className="mb-4 break-inside-avoid">
            {renderItem(item, index)}
          </div>
        ))}

        {/* Loading more skeletons */}
        {isLoading && items.length > 0 && skeletons}
      </div>

      {/* Invisible trigger element for intersection observer */}
      {hasMore && onLoadMore && <div ref={loadMoreTriggerRef} className="h-px" />}
    </div>
  );
}

/**
 * Loading skeleton for masonry items
 * Varies height based on index for visual variety
 */
function MasonryGridSkeleton({ index }: { index: number }) {
  // Alternate between different heights for variety
  const heights = ['h-48', 'h-64', 'h-56', 'h-72', 'h-52', 'h-60'];
  const heightClass = heights[index % heights.length];

  return (
    <div className="mb-4 break-inside-avoid">
      <div className={cn('animate-pulse overflow-hidden rounded-2xl', heightClass)}>
        <div className="h-1/3 bg-muted" />
        <div className="space-y-3 p-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Empty state for masonry grid
 */
export function MasonryGridEmpty() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
      <div className="rounded-full bg-muted p-4">
        <Rss className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{t('features.timeline.empty.title')}</h3>
        <p className="max-w-md text-sm text-muted-foreground">
          {t('features.timeline.emptyTimelineHint')}
        </p>
      </div>
      <Button variant="outline" asChild>
        <Link href="/search" className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          {t('features.timeline.discoverContent')}
        </Link>
      </Button>
    </div>
  );
}
