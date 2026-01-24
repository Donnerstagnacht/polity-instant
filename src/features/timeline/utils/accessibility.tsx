'use client';

import * as React from 'react';

/**
 * ARIA labels for timeline components
 * These provide consistent accessibility labels across the timeline
 */
export const timelineAriaLabels = {
  // Mode toggle
  modeToggle: {
    group: 'Timeline view mode',
    following: 'Show content from groups and topics you follow',
    decisions: 'View open votes and elections',
  },

  // Filter panel
  filters: {
    panel: 'Timeline filters',
    contentType: 'Filter by content type',
    dateRange: 'Filter by date range',
    topics: 'Filter by topics',
    clearAll: 'Clear all filters',
  },

  // Cards
  cards: {
    group: (name: string) => `Group: ${name}`,
    event: (name: string) => `Event: ${name}`,
    amendment: (name: string) => `Amendment: ${name}`,
    vote: (title: string) => `Vote: ${title}`,
    election: (title: string) => `Election: ${title}`,
    video: (title: string) => `Video: ${title}`,
    image: (title: string) => `Image: ${title}`,
    statement: (author: string) => `Statement by ${author}`,
    todo: (title: string) => `Task: ${title}`,
    blog: (title: string) => `Blog post: ${title}`,
  },

  // Actions
  actions: {
    follow: (name: string) => `Follow ${name}`,
    unfollow: (name: string) => `Unfollow ${name}`,
    like: 'Like this content',
    unlike: 'Remove like',
    support: 'Support this',
    oppose: 'Oppose this',
    interested: 'Mark as interested',
    share: 'Share this content',
    discuss: 'Open discussion',
    viewDetails: 'View details',
    castVote: 'Cast your vote',
    rsvp: 'RSVP for this event',
    readMore: 'Read more',
  },

  // Decision terminal
  terminal: {
    table: 'Decision tracking table',
    row: (id: string, title: string) => `Decision ${id}: ${title}`,
    status: (status: string) => `Status: ${status}`,
    timeRemaining: (time: string) => `Time remaining: ${time}`,
    support: (percentage: number) => `${percentage}% support`,
    oppose: (percentage: number) => `${percentage}% oppose`,
  },

  // Reactions
  reactions: {
    support: (count: number) => `${count} people support this`,
    oppose: (count: number) => `${count} people oppose this`,
    interested: (count: number) => `${count} people are interested`,
  },

  // Navigation
  navigation: {
    loadMore: 'Load more items',
    refresh: 'Refresh timeline',
    scrollToTop: 'Scroll to top',
  },
} as const;

/**
 * Hook to announce messages to screen readers
 * Uses a live region to announce dynamic content changes
 */
export function useScreenReaderAnnounce() {
  const [announcement, setAnnouncement] = React.useState('');
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const announce = React.useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      // Clear any pending announcement
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set the announcement
      setAnnouncement('');

      // Small delay to ensure the change is detected
      timeoutRef.current = setTimeout(() => {
        setAnnouncement(message);
      }, 100);
    },
    []
  );

  const LiveRegion = React.useCallback(
    () => (
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
    ),
    [announcement]
  );

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { announce, LiveRegion };
}

/**
 * Hook to manage focus within a card list
 * Supports keyboard navigation between cards
 */
export function useCardListKeyboardNav(cardCount: number) {
  const [focusedIndex, setFocusedIndex] = React.useState(-1);
  const cardRefs = React.useRef<(HTMLElement | null)[]>([]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          setFocusedIndex(prev => Math.min(prev + 1, cardCount - 1));
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Home':
          e.preventDefault();
          setFocusedIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setFocusedIndex(cardCount - 1);
          break;
      }
    },
    [cardCount]
  );

  // Focus the card when index changes
  React.useEffect(() => {
    if (focusedIndex >= 0 && cardRefs.current[focusedIndex]) {
      cardRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  const setCardRef = React.useCallback(
    (index: number) => (el: HTMLElement | null) => {
      cardRefs.current[index] = el;
    },
    []
  );

  return {
    focusedIndex,
    setFocusedIndex,
    handleKeyDown,
    setCardRef,
  };
}

/**
 * Component wrapper that adds focus visibility ring
 */
export interface FocusRingProps {
  children: React.ReactNode;
  className?: string;
}

export function FocusRing({ children, className }: FocusRingProps) {
  return (
    <div
      className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${className || ''}`}
    >
      {children}
    </div>
  );
}

/**
 * Skip link for keyboard users to skip to main timeline content
 */
export function SkipToTimeline() {
  return (
    <a
      href="#timeline-content"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
    >
      Skip to timeline
    </a>
  );
}

/**
 * Wrapper that adds timeline content landmark
 */
export interface TimelineRegionProps {
  children: React.ReactNode;
  label?: string;
  className?: string;
}

export function TimelineRegion({
  children,
  label = 'Timeline content',
  className,
}: TimelineRegionProps) {
  return (
    <main id="timeline-content" role="main" aria-label={label} className={className}>
      {children}
    </main>
  );
}

/**
 * Reduces motion check hook
 * Returns true if user prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}
