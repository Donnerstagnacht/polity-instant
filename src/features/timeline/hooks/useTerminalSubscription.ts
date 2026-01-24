'use client';

/**
 * Hook for subscribing to real-time decision updates
 * Monitors votes, elections, and other decisions for live changes
 */

import { useEffect, useCallback, useRef } from 'react';
import { db } from 'db/db';
import type { DecisionItem } from './useDecisionTerminal';
import { useDecisionFlash } from './useDecisionFlash';

export interface TerminalSubscriptionOptions {
  /** Enable/disable subscription */
  enabled?: boolean;
  /** Poll interval in ms (for non-realtime updates) */
  pollInterval?: number;
  /** Callback when decision changes */
  onDecisionChange?: (decision: DecisionItem, previousSupport?: number) => void;
  /** Callback when new decision appears */
  onNewDecision?: (decision: DecisionItem) => void;
  /** Callback when decision closes */
  onDecisionClosed?: (decision: DecisionItem) => void;
}

export interface UseTerminalSubscriptionReturn {
  /** Whether subscription is active */
  isSubscribed: boolean;
  /** Last update timestamp */
  lastUpdate: Date | null;
  /** Flash effect manager */
  flash: ReturnType<typeof useDecisionFlash>;
  /** Force refresh */
  refresh: () => void;
}

/**
 * Subscribe to real-time decision updates
 *
 * This hook monitors decision items for changes and triggers
 * flash effects when significant changes occur.
 */
export function useTerminalSubscription(
  decisions: DecisionItem[],
  options: TerminalSubscriptionOptions = {}
): UseTerminalSubscriptionReturn {
  const {
    enabled = true,
    pollInterval = 5000,
    onDecisionChange,
    onNewDecision,
    onDecisionClosed,
  } = options;

  // Track previous decision states for comparison
  const previousDecisionsRef = useRef<Map<string, DecisionItem>>(new Map());
  const lastUpdateRef = useRef<Date | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Flash effect manager
  const flash = useDecisionFlash({
    flashDuration: 2000,
    minChangeThreshold: 2,
    highIntensityThreshold: 10,
  });

  // Compare decisions and trigger events/flashes
  const processDecisionUpdates = useCallback(() => {
    const previousMap = previousDecisionsRef.current;
    const currentMap = new Map(decisions.map(d => [d.id, d]));

    // Check for changes
    for (const decision of decisions) {
      const previous = previousMap.get(decision.id);

      if (!previous) {
        // New decision
        onNewDecision?.(decision);
      } else {
        // Check for support percentage change
        const previousSupport = previous.supportPercentage || 0;
        const currentSupport = decision.supportPercentage || 0;
        const change = currentSupport - previousSupport;

        if (Math.abs(change) >= 2) {
          // Trigger flash
          flash.triggerFlash(decision.id, change);
          onDecisionChange?.(decision, previousSupport);
        }

        // Check if decision just closed
        if (!previous.isClosed && decision.isClosed) {
          onDecisionClosed?.(decision);
        }
      }
    }

    // Check for removed decisions
    for (const [id, previous] of previousMap) {
      if (!currentMap.has(id)) {
        // Decision was removed/closed
        onDecisionClosed?.(previous);
      }
    }

    // Update previous state
    previousDecisionsRef.current = currentMap;
    lastUpdateRef.current = new Date();
  }, [decisions, flash, onDecisionChange, onNewDecision, onDecisionClosed]);

  // Process updates when decisions change
  useEffect(() => {
    if (enabled) {
      processDecisionUpdates();
    }
  }, [enabled, processDecisionUpdates]);

  // Set up polling for simulated real-time updates
  useEffect(() => {
    if (!enabled) return;

    // Clear existing interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    // In a real implementation, this would use InstantDB's real-time
    // subscriptions. For now, we poll at intervals to check for changes.
    pollIntervalRef.current = setInterval(() => {
      processDecisionUpdates();
    }, pollInterval);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [enabled, pollInterval, processDecisionUpdates]);

  const refresh = useCallback(() => {
    processDecisionUpdates();
  }, [processDecisionUpdates]);

  return {
    isSubscribed: enabled,
    lastUpdate: lastUpdateRef.current,
    flash,
    refresh,
  };
}

/**
 * Hook for subscribing to a single decision's updates
 */
export function useSingleDecisionSubscription(
  decisionId: string,
  options: {
    enabled?: boolean;
    onUpdate?: (newSupport: number, oldSupport: number) => void;
  } = {}
) {
  const { enabled = true, onUpdate } = options;
  const previousSupportRef = useRef<number | null>(null);

  // In a real implementation, this would use db.useQuery with
  // proper filters. For now, return a mock subscription.

  const updateSupport = useCallback(
    (newSupport: number) => {
      const oldSupport = previousSupportRef.current;
      if (oldSupport !== null && oldSupport !== newSupport) {
        onUpdate?.(newSupport, oldSupport);
      }
      previousSupportRef.current = newSupport;
    },
    [onUpdate]
  );

  return {
    isSubscribed: enabled,
    updateSupport,
  };
}
