'use client';

import * as React from 'react';
import { Suspense, lazy, type ComponentType } from 'react';
import { cn } from '@/utils/utils';

/**
 * Lazy-loaded card components for code splitting
 *
 * These components are loaded on-demand to reduce initial bundle size.
 * Each card type is loaded only when it's needed.
 */

// Card loading fallback
function CardSkeleton({ className }: { className?: string }) {
  return <div className={cn('h-48 w-full animate-pulse rounded-xl bg-muted', className)} />;
}

// Lazy load card components
const LazyGroupTimelineCard = lazy(() =>
  import('./cards/GroupTimelineCard').then(m => ({ default: m.GroupTimelineCard }))
);

const LazyEventTimelineCard = lazy(() =>
  import('./cards/EventTimelineCard').then(m => ({ default: m.EventTimelineCard }))
);

const LazyAmendmentTimelineCard = lazy(() =>
  import('./cards/AmendmentTimelineCard').then(m => ({ default: m.AmendmentTimelineCard }))
);

const LazyVideoTimelineCard = lazy(() =>
  import('./cards/VideoTimelineCard').then(m => ({ default: m.VideoTimelineCard }))
);

const LazyImageTimelineCard = lazy(() =>
  import('./cards/ImageTimelineCard').then(m => ({ default: m.ImageTimelineCard }))
);

const LazyStatementTimelineCard = lazy(() =>
  import('./cards/StatementTimelineCard').then(m => ({ default: m.StatementTimelineCard }))
);

const LazyTodoTimelineCard = lazy(() =>
  import('./cards/TodoTimelineCard').then(m => ({ default: m.TodoTimelineCard }))
);

const LazyBlogTimelineCard = lazy(() =>
  import('./cards/BlogTimelineCard').then(m => ({ default: m.BlogTimelineCard }))
);

const LazyVoteTimelineCard = lazy(() =>
  import('./cards/VoteTimelineCard').then(m => ({ default: m.VoteTimelineCard }))
);

const LazyElectionTimelineCard = lazy(() =>
  import('./cards/ElectionTimelineCard').then(m => ({ default: m.ElectionTimelineCard }))
);

const LazyActionTimelineCard = lazy(() =>
  import('./cards/ActionTimelineCard').then(m => ({ default: m.ActionTimelineCard }))
);

/**
 * Map of content types to lazy-loaded card components
 */
export const LAZY_CARD_COMPONENTS = {
  group: LazyGroupTimelineCard,
  event: LazyEventTimelineCard,
  amendment: LazyAmendmentTimelineCard,
  video: LazyVideoTimelineCard,
  image: LazyImageTimelineCard,
  statement: LazyStatementTimelineCard,
  todo: LazyTodoTimelineCard,
  blog: LazyBlogTimelineCard,
  vote: LazyVoteTimelineCard,
  election: LazyElectionTimelineCard,
  action: LazyActionTimelineCard,
} as const;

export type CardType = keyof typeof LAZY_CARD_COMPONENTS;

/**
 * Props for DynamicTimelineCard
 */
export interface DynamicTimelineCardProps {
  /** Type of card to render */
  cardType: CardType;
  /** Props to pass to the card component */
  cardProps: Record<string, unknown>;
  /** Custom loading fallback */
  fallback?: React.ReactNode;
  /** Additional class name */
  className?: string;
}

/**
 * DynamicTimelineCard - Renders the appropriate card based on type
 *
 * Uses React.lazy and Suspense for code splitting.
 * Each card type is loaded on-demand.
 *
 * @example
 * ```tsx
 * <DynamicTimelineCard
 *   cardType="group"
 *   cardProps={{ group: myGroup, gradientIndex: 0 }}
 * />
 * ```
 */
export function DynamicTimelineCard({
  cardType,
  cardProps,
  fallback,
  className,
}: DynamicTimelineCardProps) {
  const CardComponent = LAZY_CARD_COMPONENTS[cardType];

  if (!CardComponent) {
    console.warn(`Unknown card type: ${cardType}`);
    return null;
  }

  return (
    <Suspense fallback={fallback || <CardSkeleton className={className} />}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <CardComponent {...(cardProps as any)} />
    </Suspense>
  );
}

/**
 * withLazyLoading - HOC to wrap a component with lazy loading
 *
 * @example
 * ```tsx
 * const LazyMyComponent = withLazyLoading(
 *   () => import('./MyComponent'),
 *   <Skeleton />
 * );
 * ```
 */
export function withLazyLoading<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFn);

  return function LazyWrapper(props: P) {
    return (
      <Suspense fallback={fallback || <CardSkeleton />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * Preload a card component
 *
 * Call this when you know a card type will be needed soon
 * (e.g., when user starts scrolling toward it)
 *
 * @example
 * ```tsx
 * // Preload video cards when user scrolls past a certain point
 * preloadCard('video');
 * ```
 */
export function preloadCard(cardType: CardType): void {
  const componentMap: Record<CardType, () => Promise<unknown>> = {
    group: () => import('./cards/GroupTimelineCard'),
    event: () => import('./cards/EventTimelineCard'),
    amendment: () => import('./cards/AmendmentTimelineCard'),
    video: () => import('./cards/VideoTimelineCard'),
    image: () => import('./cards/ImageTimelineCard'),
    statement: () => import('./cards/StatementTimelineCard'),
    todo: () => import('./cards/TodoTimelineCard'),
    blog: () => import('./cards/BlogTimelineCard'),
    vote: () => import('./cards/VoteTimelineCard'),
    election: () => import('./cards/ElectionTimelineCard'),
    action: () => import('./cards/ActionTimelineCard'),
  };

  componentMap[cardType]?.();
}

/**
 * Preload all card components
 *
 * Use this for aggressive preloading after initial page load
 */
export function preloadAllCards(): void {
  Object.keys(LAZY_CARD_COMPONENTS).forEach(type => {
    preloadCard(type as CardType);
  });
}

export default DynamicTimelineCard;
