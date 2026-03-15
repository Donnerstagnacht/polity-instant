'use client';

import * as React from 'react';

/**
 * Hook to announce messages to screen readers
 * Uses a live region to announce dynamic content changes
 */
export function useScreenReaderAnnounce() {
  const [announcement, setAnnouncement] = React.useState('');
  const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

  const announce = React.useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      // Clear pending announcement
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
