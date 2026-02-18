import { useRef, useEffect, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  /**
   * Whether there are more items to load
   */
  hasMore: boolean;
  /**
   * Whether currently loading
   */
  isLoading: boolean;
  /**
   * Callback to load more items
   */
  onLoadMore: () => void;
  /**
   * Root margin for intersection observer (default: '200px')
   */
  rootMargin?: string;
  /**
   * Intersection threshold (default: 0.1)
   */
  threshold?: number;
}

/**
 * Hook for implementing infinite scroll with intersection observer.
 * Uses a ref for onLoadMore to avoid re-creating the observer when the callback changes.
 *
 * Usage:
 * ```tsx
 * const loadMoreRef = useInfiniteScroll({
 *   hasMore: hasMore,
 *   isLoading: isLoading,
 *   onLoadMore: loadMoreItems,
 * });
 *
 * // In your JSX:
 * <div ref={loadMoreRef} className="h-px" />
 * ```
 */
export function useInfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  rootMargin = '200px',
  threshold = 0.1,
}: UseInfiniteScrollOptions) {
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  useEffect(() => {
    if (!hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          onLoadMoreRef.current();
        }
      },
      { threshold, rootMargin }
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
  }, [hasMore, isLoading, threshold, rootMargin]);

  return loadMoreTriggerRef;
}
