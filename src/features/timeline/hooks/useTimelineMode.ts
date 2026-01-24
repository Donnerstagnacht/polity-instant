'use client';

import { useState, useCallback, useEffect } from 'react';

/**
 * Timeline mode types
 * - subscribed: Shows content from entities the user follows
 * - decisions: Bloomberg-style terminal for active votes and elections
 */
export type TimelineMode = 'subscribed' | 'decisions';

const STORAGE_KEY = 'polity:timeline-mode';

/**
 * Hook to manage the active timeline mode with localStorage persistence
 *
 * @returns Object with current mode and functions to change it
 *
 * @example
 * ```tsx
 * const { mode, setMode, toggleMode } = useTimelineMode();
 *
 * return (
 *   <div>
 *     <button onClick={() => setMode('subscribed')}>Following</button>
 *     <button onClick={() => setMode('explore')}>Explore</button>
 *     <button onClick={() => setMode('decisions')}>Decisions</button>
 *   </div>
 * );
 * ```
 */
export function useTimelineMode(defaultMode: TimelineMode = 'subscribed') {
  // Initialize from localStorage if available
  const [mode, setModeState] = useState<TimelineMode>(() => {
    if (typeof window === 'undefined') {
      return defaultMode;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && isValidMode(stored)) {
        return stored as TimelineMode;
      }
    } catch {
      // Ignore localStorage errors (private browsing, etc.)
    }

    return defaultMode;
  });

  // Persist mode changes to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Ignore localStorage errors
    }
  }, [mode]);

  /**
   * Set the timeline mode directly
   */
  const setMode = useCallback((newMode: TimelineMode) => {
    setModeState(newMode);
  }, []);

  /**
   * Toggle between modes in order: subscribed -> decisions -> subscribed
   */
  const toggleMode = useCallback(() => {
    setModeState(current => {
      switch (current) {
        case 'subscribed':
          return 'decisions';
        case 'decisions':
          return 'subscribed';
        default:
          return 'subscribed';
      }
    });
  }, []);

  /**
   * Check if the current mode matches the given mode
   */
  const isMode = useCallback((checkMode: TimelineMode) => mode === checkMode, [mode]);

  /**
   * Check if in subscribed (following) mode
   */
  const isSubscribedMode = mode === 'subscribed';

  /**
   * Check if in decisions (terminal) mode
   */
  const isDecisionsMode = mode === 'decisions';

  return {
    mode,
    setMode,
    toggleMode,
    isMode,
    isSubscribedMode,
    isDecisionsMode,
  };
}

/**
 * Validate that a string is a valid timeline mode
 */
function isValidMode(value: string): value is TimelineMode {
  return value === 'subscribed' || value === 'decisions';
}

export default useTimelineMode;
