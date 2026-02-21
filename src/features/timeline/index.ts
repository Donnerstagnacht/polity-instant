export { ModernTimeline } from './ui/ModernTimeline';
export { MasonryGrid, MasonryGridEmpty } from './ui/MasonryGrid';
export { TimelineModeToggle } from './ui/TimelineModeToggle';
export { TimelineHeader } from './ui/TimelineHeader';
export { TimelineFilterPanel } from './ui/TimelineFilterPanel';

// Lazy Card Components (Code Splitting)
export {
  DynamicTimelineCard,
  LAZY_CARD_COMPONENTS,
  withLazyLoading,
  preloadCard,
  preloadAllCards,
  type CardType,
  type DynamicTimelineCardProps,
} from './ui/LazyCardComponents';

// Hooks
export { useSubscriptionTimeline } from './hooks/useSubscriptionTimeline';
export { useTimelineMode, type TimelineMode } from './hooks/useTimelineMode';
export { useIsMobile, useBreakpoint, useResponsiveValue, BREAKPOINTS } from './hooks/useIsMobile';
export {
  useInfiniteTimeline,
  type UseInfiniteTimelineOptions,
  type UseInfiniteTimelineReturn,
} from './hooks/useInfiniteTimeline';
export { InfiniteScrollSentinel } from './ui/InfiniteScrollSentinel';
export {
  useTimelineFilters,
  type TimelineFilters,
  type DateRangeFilter,
  type TimelineSortOption,
  type EngagementFilter,
  ALL_CONTENT_TYPES,
} from './hooks/useTimelineFilters';
export { useDecisionTerminal, type UseDecisionTerminalReturn } from '@/features/decision-terminal/hooks/useDecisionTerminal';
export {
  useSubscribedTimeline,
  type TimelineItem,
  type UseSubscribedTimelineOptions,
  type UseSubscribedTimelineResult,
} from './hooks/useSubscribedTimeline';
export {
  useDecisionFlash,
  getFlashClasses,
  type FlashState,
  type UseDecisionFlashReturn,
} from '@/features/decision-terminal/hooks/useDecisionFlash';
export {
  useTerminalSubscription,
  useSingleDecisionSubscription,
  type UseTerminalSubscriptionReturn,
} from '@/features/decision-terminal/hooks/useTerminalSubscription';
export {
  useReactions,
  formatReactionCount,
  getReactionEmoji,
  type ReactionType,
  type ReactionCounts,
  type UseReactionsReturn,
} from './hooks/useReactions';

// Card components
export * from './ui/cards';

// Terminal components (re-exported from decision-terminal feature)
export * from '@/features/decision-terminal/ui';

// Constants
export * from './constants/content-type-config';

// Logic (pure functions)
export * from './logic/gradient-assignment';
export * from '@/features/decision-terminal/logic/decision-status';
export * from '@/features/decision-terminal/logic/trend-calculation';
export * from './logic/content-reasons';
export * from './logic/content-scoring';
export * from './utils/public-content-query';
export * from './utils/own-content-query';
export * from './logic/video-thumbnail';
export * from './logic/image-optimization';
export * from './constants/accessibility';
export { useScreenReaderAnnounce, useCardListKeyboardNav, usePrefersReducedMotion } from './hooks/useAccessibility';
export { FocusRing, SkipToTimeline, TimelineRegion } from './ui/AccessibilityComponents';
