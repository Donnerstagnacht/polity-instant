'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseInfiniteTimelineOptions<T> {
  /** Initial items (from SSR or first query) */
  initialItems?: T[];
  /** Page size (items per batch) */
  pageSize?: number;
  /** Function to fetch more items */
  fetchMore: (cursor: string | null, pageSize: number) => Promise<{
    items: T[];
    nextCursor: string | null;
    hasMore: boolean;
  }>;
  /** Whether to load automatically when scrolling */
  autoLoad?: boolean;
  /** Threshold in pixels before bottom to trigger load */
  threshold?: number;
}

export interface UseInfiniteTimelineReturn<T> {
  /** All loaded items */
  items: T[];
  /** Whether currently loading */
  isLoading: boolean;
  /** Whether loading more (subsequent pages) */
  isLoadingMore: boolean;
  /** Whether there are more items to load */
  hasMore: boolean;
  /** Error if any occurred */
  error: Error | null;
  /** Function to manually load more */
  loadMore: () => Promise<void>;
  /** Function to refresh/reset the feed */
  refresh: () => Promise<void>;
  /** Current page number (1-based) */
  page: number;
  /** Total items loaded */
  totalLoaded: number;
  /** Ref to attach to scroll container for auto-loading */
  sentinelRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * useInfiniteTimeline - Hook for infinite scrolling timeline data
 * 
 * Provides:
 * - Cursor-based pagination
 * - Automatic loading when scrolling near bottom
 * - Manual load more capability
 * - Refresh/reset functionality
 */
export function useInfiniteTimeline<T>({
  initialItems = [],
  pageSize = 20,
  fetchMore,
  autoLoad = true,
  threshold = 300,
}: UseInfiniteTimelineOptions<T>): UseInfiniteTimelineReturn<T> {
  const [items, setItems] = useState<T[]>(initialItems);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isLoadingRef = useRef(false);

  // Load more items
  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasMore) return;

    isLoadingRef.current = true;
    const isFirstLoad = items.length === 0;
    
    if (isFirstLoad) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    
    setError(null);

    try {
      const result = await fetchMore(cursor, pageSize);
      
      setItems(prev => [...prev, ...result.items]);
      setCursor(result.nextCursor);
      setHasMore(result.hasMore);
      setPage(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load more items'));
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      isLoadingRef.current = false;
    }
  }, [cursor, hasMore, items.length, fetchMore, pageSize]);

  // Refresh/reset the feed
  const refresh = useCallback(async () => {
    setItems([]);
    setCursor(null);
    setHasMore(true);
    setPage(1);
    setError(null);
    
    isLoadingRef.current = false;
    setIsLoading(true);

    try {
      const result = await fetchMore(null, pageSize);
      
      setItems(result.items);
      setCursor(result.nextCursor);
      setHasMore(result.hasMore);
      setPage(1);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh items'));
    } finally {
      setIsLoading(false);
    }
  }, [fetchMore, pageSize]);

  // Set up intersection observer for auto-loading
  useEffect(() => {
    if (!autoLoad || !sentinelRef.current) return;

    const handleIntersection: IntersectionObserverCallback = (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isLoadingRef.current) {
        loadMore();
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: `${threshold}px`,
      threshold: 0,
    });

    observerRef.current.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [autoLoad, hasMore, loadMore, threshold]);

  // Load initial data if no initial items provided
  useEffect(() => {
    if (initialItems.length === 0 && items.length === 0 && !isLoadingRef.current) {
      loadMore();
    }
  }, []);

  return {
    items,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refresh,
    page,
    totalLoaded: items.length,
    sentinelRef,
  };
}

/**
 * InfiniteScrollSentinel - Component to place at bottom of list
 * 
 * Attach the sentinelRef to this element to trigger auto-loading
 */
export function InfiniteScrollSentinel({
  sentinelRef,
  isLoading,
  hasMore,
}: {
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  isLoading: boolean;
  hasMore: boolean;
}) {
  if (!hasMore) return null;

  return (
    <div
      ref={sentinelRef}
      className="flex h-20 items-center justify-center"
      aria-hidden="true"
    >
      {isLoading && (
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      )}
    </div>
  );
}
