'use client';

/**
 * Hook for managing flash effects on decision items
 * Flashes when significant changes occur (e.g., vote swings)
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export interface FlashState {
  itemId: string;
  type: 'up' | 'down' | 'neutral';
  intensity: 'low' | 'medium' | 'high';
  timestamp: number;
}

export interface UseDecisionFlashOptions {
  /** How long flash effect lasts in ms */
  flashDuration?: number;
  /** Minimum change percentage to trigger flash */
  minChangeThreshold?: number;
  /** Change threshold for high intensity flash */
  highIntensityThreshold?: number;
}

export interface UseDecisionFlashReturn {
  /** Current flash states by item ID */
  flashStates: Map<string, FlashState>;
  /** Trigger a flash for an item */
  triggerFlash: (itemId: string, change: number) => void;
  /** Check if item is currently flashing */
  isFlashing: (itemId: string) => boolean;
  /** Get flash state for an item */
  getFlashState: (itemId: string) => FlashState | undefined;
  /** Clear all flash states */
  clearAll: () => void;
}

/**
 * Hook for managing flash effects on decision items
 */
export function useDecisionFlash(options: UseDecisionFlashOptions = {}): UseDecisionFlashReturn {
  const { flashDuration = 2000, minChangeThreshold = 2, highIntensityThreshold = 10 } = options;

  const [flashStates, setFlashStates] = useState<Map<string, FlashState>>(new Map());
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  const triggerFlash = useCallback(
    (itemId: string, change: number) => {
      const absChange = Math.abs(change);

      // Don't flash for small changes
      if (absChange < minChangeThreshold) return;

      // Determine flash type and intensity
      const type: FlashState['type'] = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
      const intensity: FlashState['intensity'] =
        absChange >= highIntensityThreshold
          ? 'high'
          : absChange >= minChangeThreshold * 2
            ? 'medium'
            : 'low';

      const flashState: FlashState = {
        itemId,
        type,
        intensity,
        timestamp: Date.now(),
      };

      // Clear existing timeout for this item
      const existingTimeout = timeoutsRef.current.get(itemId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Set flash state
      setFlashStates(prev => {
        const next = new Map(prev);
        next.set(itemId, flashState);
        return next;
      });

      // Set timeout to clear flash
      const timeout = setTimeout(() => {
        setFlashStates(prev => {
          const next = new Map(prev);
          next.delete(itemId);
          return next;
        });
        timeoutsRef.current.delete(itemId);
      }, flashDuration);

      timeoutsRef.current.set(itemId, timeout);
    },
    [flashDuration, minChangeThreshold, highIntensityThreshold]
  );

  const isFlashing = useCallback(
    (itemId: string): boolean => {
      return flashStates.has(itemId);
    },
    [flashStates]
  );

  const getFlashState = useCallback(
    (itemId: string): FlashState | undefined => {
      return flashStates.get(itemId);
    },
    [flashStates]
  );

  const clearAll = useCallback(() => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current.clear();
    setFlashStates(new Map());
  }, []);

  return {
    flashStates,
    triggerFlash,
    isFlashing,
    getFlashState,
    clearAll,
  };
}

/**
 * Get CSS classes for flash effect
 */
export function getFlashClasses(flashState: FlashState | undefined): string {
  if (!flashState) return '';

  const baseClass = 'animate-flash-yellow';

  const typeClasses: Record<FlashState['type'], string> = {
    up: 'flash-up',
    down: 'flash-down',
    neutral: 'flash-neutral',
  };

  const intensityClasses: Record<FlashState['intensity'], string> = {
    low: 'flash-intensity-low',
    medium: 'flash-intensity-medium',
    high: 'flash-intensity-high',
  };

  return `${baseClass} ${typeClasses[flashState.type]} ${intensityClasses[flashState.intensity]}`;
}
