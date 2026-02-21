/**
 * useVotingTimer Hook
 *
 * Provides countdown timer functionality for voting phases with
 * auto-close when timer expires and real-time sync.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { formatTimeRemaining } from '@/utils/voting-utils';

interface UseVotingTimerResult {
  timeRemaining: number;
  formattedTime: string;
  isExpired: boolean;
  isRunning: boolean;
  start: (duration: number) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

interface UseVotingTimerOptions {
  onExpire?: () => void;
  autoStart?: boolean;
  initialDuration?: number;
}

export function useVotingTimer(options: UseVotingTimerOptions = {}): UseVotingTimerResult {
  const { onExpire, autoStart = false, initialDuration = 0 } = options;

  const [timeRemaining, setTimeRemaining] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(autoStart && initialDuration > 0);
  const [isExpired, setIsExpired] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onExpireRef = useRef(onExpire);

  // Update callback ref when it changes
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Timer tick effect
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsExpired(true);
            if (onExpireRef.current) {
              onExpireRef.current();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isRunning, timeRemaining]);

  const start = useCallback((duration: number) => {
    setTimeRemaining(duration);
    setIsRunning(true);
    setIsExpired(false);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  const resume = useCallback(() => {
    if (timeRemaining > 0) {
      setIsRunning(true);
    }
  }, [timeRemaining]);

  const reset = useCallback(() => {
    setTimeRemaining(0);
    setIsRunning(false);
    setIsExpired(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  const formattedTime = formatTimeRemaining(timeRemaining);

  return {
    timeRemaining,
    formattedTime,
    isExpired,
    isRunning,
    start,
    pause,
    resume,
    reset,
  };
}

/**
 * Hook to sync voting timer with server time
 * Uses the session's startedAt and duration to calculate remaining time
 */
export function useSyncedVotingTimer(
  startedAt: number | undefined,
  duration: number,
  onExpire?: () => void
): UseVotingTimerResult {
  const calculateRemaining = useCallback(() => {
    if (!startedAt) return duration;
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    return Math.max(0, duration - elapsed);
  }, [startedAt, duration]);

  const [timeRemaining, setTimeRemaining] = useState(calculateRemaining);
  const [isExpired, setIsExpired] = useState(timeRemaining <= 0);
  const [isRunning, setIsRunning] = useState(startedAt !== undefined && timeRemaining > 0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  // Recalculate when startedAt changes (real-time sync)
  useEffect(() => {
    const remaining = calculateRemaining();
    setTimeRemaining(remaining);
    setIsExpired(remaining <= 0);
    setIsRunning(startedAt !== undefined && remaining > 0);
  }, [startedAt, calculateRemaining]);

  // Timer tick
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsExpired(true);
            if (onExpireRef.current) {
              onExpireRef.current();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isRunning, timeRemaining]);

  const formattedTime = formatTimeRemaining(timeRemaining);

  return {
    timeRemaining,
    formattedTime,
    isExpired,
    isRunning,
    start: () => {},
    pause: () => {},
    resume: () => {},
    reset: () => {},
  };
}
