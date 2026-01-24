'use client';

/**
 * Custom hook for touch swipe gesture detection
 * Implements swipe-to-dismiss and swipe-to-react functionality for timeline cards
 *
 * Note: This is a lightweight implementation without external gesture libraries.
 * For production use with complex gestures, consider adding @use-gesture/react
 */

import { useState, useCallback, useRef, type TouchEvent } from 'react';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down' | null;

export interface SwipeState {
  /** Current horizontal offset during swipe */
  offsetX: number;
  /** Current vertical offset during swipe */
  offsetY: number;
  /** Whether a swipe is currently in progress */
  isSwiping: boolean;
  /** The detected swipe direction once threshold is passed */
  direction: SwipeDirection;
  /** Whether the swipe has exceeded the action threshold */
  thresholdReached: boolean;
}

export interface SwipeGestureOptions {
  /** Minimum distance (px) to trigger swipe detection */
  threshold?: number;
  /** Distance at which the action is triggered */
  actionThreshold?: number;
  /** Enable horizontal swipe */
  enableHorizontal?: boolean;
  /** Enable vertical swipe */
  enableVertical?: boolean;
  /** Callback when swipe left action is triggered */
  onSwipeLeft?: () => void;
  /** Callback when swipe right action is triggered */
  onSwipeRight?: () => void;
  /** Callback when swipe up action is triggered (dismiss) */
  onSwipeUp?: () => void;
  /** Callback when swipe down action is triggered */
  onSwipeDown?: () => void;
  /** Whether swipe gestures are enabled */
  enabled?: boolean;
}

export interface UseSwipeGesturesReturn {
  /** Current swipe state */
  state: SwipeState;
  /** Touch event handlers to spread on element */
  handlers: {
    onTouchStart: (e: TouchEvent) => void;
    onTouchMove: (e: TouchEvent) => void;
    onTouchEnd: (e: TouchEvent) => void;
    onTouchCancel: () => void;
  };
  /** Transform style based on current swipe offset */
  style: {
    transform: string;
    transition: string;
    opacity: number;
  };
  /** Reset swipe state to initial */
  reset: () => void;
}

const INITIAL_STATE: SwipeState = {
  offsetX: 0,
  offsetY: 0,
  isSwiping: false,
  direction: null,
  thresholdReached: false,
};

/**
 * useSwipeGestures - Touch swipe gesture detection hook
 *
 * Usage:
 * ```tsx
 * const { handlers, style, state } = useSwipeGestures({
 *   onSwipeLeft: () => handleQuickReact(),
 *   onSwipeRight: () => handleDismiss(),
 *   threshold: 50,
 *   actionThreshold: 120,
 * });
 *
 * return (
 *   <div {...handlers} style={style}>
 *     {children}
 *   </div>
 * );
 * ```
 */
export function useSwipeGestures(options: SwipeGestureOptions = {}): UseSwipeGesturesReturn {
  const {
    threshold = 30,
    actionThreshold = 100,
    enableHorizontal = true,
    enableVertical = false,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    enabled = true,
  } = options;

  const [state, setState] = useState<SwipeState>(INITIAL_STATE);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const direction = useRef<SwipeDirection>(null);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
    startPos.current = null;
    direction.current = null;
  }, []);

  const onTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled) return;

      const touch = e.touches[0];
      startPos.current = { x: touch.clientX, y: touch.clientY };
      direction.current = null;

      setState(prev => ({
        ...prev,
        isSwiping: true,
      }));
    },
    [enabled]
  );

  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!enabled || !startPos.current) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - startPos.current.x;
      const deltaY = touch.clientY - startPos.current.y;

      // Determine direction if not yet set
      if (!direction.current) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        if (absX > threshold || absY > threshold) {
          if (absX > absY && enableHorizontal) {
            direction.current = deltaX > 0 ? 'right' : 'left';
          } else if (absY > absX && enableVertical) {
            direction.current = deltaY > 0 ? 'down' : 'up';
          }
        }
      }

      // Calculate offsets based on direction
      let offsetX = 0;
      let offsetY = 0;

      if (direction.current === 'left' || direction.current === 'right') {
        offsetX = deltaX;
        // Prevent vertical scrolling when swiping horizontally
        e.preventDefault();
      } else if (direction.current === 'up' || direction.current === 'down') {
        offsetY = deltaY;
      }

      const thresholdReached =
        Math.abs(offsetX) >= actionThreshold || Math.abs(offsetY) >= actionThreshold;

      setState({
        offsetX,
        offsetY,
        isSwiping: true,
        direction: direction.current,
        thresholdReached,
      });
    },
    [enabled, threshold, actionThreshold, enableHorizontal, enableVertical]
  );

  const onTouchEnd = useCallback(() => {
    if (!enabled || !startPos.current) {
      reset();
      return;
    }

    const { offsetX, offsetY, thresholdReached } = state;

    // Trigger action if threshold reached
    if (thresholdReached) {
      if (direction.current === 'left' && onSwipeLeft) {
        onSwipeLeft();
      } else if (direction.current === 'right' && onSwipeRight) {
        onSwipeRight();
      } else if (direction.current === 'up' && onSwipeUp) {
        onSwipeUp();
      } else if (direction.current === 'down' && onSwipeDown) {
        onSwipeDown();
      }
    }

    reset();
  }, [enabled, state, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, reset]);

  const onTouchCancel = useCallback(() => {
    reset();
  }, [reset]);

  // Calculate transform style
  const style = {
    transform: state.isSwiping
      ? `translate3d(${state.offsetX}px, ${state.offsetY}px, 0)`
      : 'translate3d(0, 0, 0)',
    transition: state.isSwiping ? 'none' : 'transform 0.3s ease-out, opacity 0.3s ease-out',
    opacity: state.thresholdReached ? 0.7 : 1,
  };

  const handlers = {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel,
  };

  return {
    state,
    handlers,
    style,
    reset,
  };
}

/**
 * Helper to determine which action indicator to show based on swipe direction
 */
export function getSwipeActionIndicator(
  direction: SwipeDirection,
  thresholdReached: boolean
): {
  icon: 'dismiss' | 'react' | 'hide' | 'share' | null;
  color: string;
} {
  if (!thresholdReached || !direction) {
    return { icon: null, color: '' };
  }

  switch (direction) {
    case 'left':
      return { icon: 'react', color: 'bg-green-500' };
    case 'right':
      return { icon: 'dismiss', color: 'bg-red-500' };
    case 'up':
      return { icon: 'hide', color: 'bg-gray-500' };
    case 'down':
      return { icon: 'share', color: 'bg-blue-500' };
    default:
      return { icon: null, color: '' };
  }
}
