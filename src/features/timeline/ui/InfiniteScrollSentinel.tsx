'use client';

import type React from 'react';

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
