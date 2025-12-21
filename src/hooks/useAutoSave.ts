/**
 * Auto Save Hook
 *
 * Generic hook for debouncing and throttling save operations.
 * Prevents excessive database writes while ensuring data is saved regularly.
 */

import { useRef, useCallback, useEffect } from 'react';

export interface UseAutoSaveOptions {
  /**
   * Delay in milliseconds before saving after the last change (debounce)
   * @default 500
   */
  debounceMs?: number;

  /**
   * Minimum time in milliseconds between saves (throttle)
   * @default 1000
   */
  throttleMs?: number;

  /**
   * Callback to execute when data should be saved
   */
  onSave: (data: any) => Promise<void> | void;

  /**
   * Optional callback when save starts
   */
  onSaveStart?: () => void;

  /**
   * Optional callback when save completes
   */
  onSaveEnd?: () => void;

  /**
   * Optional callback when save fails
   */
  onError?: (error: Error) => void;
}

export interface UseAutoSaveResult {
  /**
   * Trigger a save with debouncing and throttling
   */
  save: (data: any) => void;

  /**
   * Force immediate save, bypassing throttle and debounce
   */
  forceSave: (data: any) => Promise<void>;

  /**
   * Cancel pending saves
   */
  cancel: () => void;

  /**
   * Whether a save is currently in progress
   */
  isSaving: boolean;
}

/**
 * Hook for auto-saving data with debouncing and throttling
 *
 * @param options - Configuration options
 * @returns Save functions and state
 *
 * @example
 * const { save, isSaving } = useAutoSave({
 *   onSave: async (data) => {
 *     await db.transact([tx.documents[id].update(data)]);
 *   },
 *   debounceMs: 500,
 *   throttleMs: 1000,
 * });
 *
 * // In your onChange handler:
 * save({ content: newContent });
 */
export function useAutoSave(options: UseAutoSaveOptions): UseAutoSaveResult {
  const {
    debounceMs = 500,
    throttleMs = 1000,
    onSave,
    onSaveStart,
    onSaveEnd,
    onError,
  } = options;

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTimeRef = useRef<number>(0);
  const isSavingRef = useRef<boolean>(false);
  const pendingDataRef = useRef<any>(null);
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Execute the save operation
   */
  const executeSave = useCallback(
    async (data: any) => {
      if (isSavingRef.current) {
        // If already saving, queue this data for later
        pendingDataRef.current = data;
        return;
      }

      isSavingRef.current = true;
      onSaveStart?.();

      try {
        await onSave(data);
        lastSaveTimeRef.current = Date.now();
        
        // If there's pending data, schedule it
        if (pendingDataRef.current) {
          const pending = pendingDataRef.current;
          pendingDataRef.current = null;
          
          // Schedule the pending save with throttle
          const timeSinceLastSave = Date.now() - lastSaveTimeRef.current;
          const delay = Math.max(0, throttleMs - timeSinceLastSave);
          
          throttleTimeoutRef.current = setTimeout(() => {
            executeSave(pending);
          }, delay);
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
        onError?.(error as Error);
      } finally {
        isSavingRef.current = false;
        onSaveEnd?.();
      }
    },
    [onSave, onSaveStart, onSaveEnd, onError, throttleMs]
  );

  /**
   * Save with debouncing and throttling
   */
  const save = useCallback(
    (data: any) => {
      // Clear existing debounce timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Check if we should throttle
      const now = Date.now();
      const timeSinceLastSave = now - lastSaveTimeRef.current;

      if (timeSinceLastSave < throttleMs && !isSavingRef.current) {
        // Within throttle period, save after delay
        pendingDataRef.current = data;
        
        debounceTimeoutRef.current = setTimeout(() => {
          if (pendingDataRef.current) {
            executeSave(pendingDataRef.current);
            pendingDataRef.current = null;
          }
        }, throttleMs - timeSinceLastSave);
        return;
      }

      // Debounce the save
      debounceTimeoutRef.current = setTimeout(() => {
        executeSave(data);
      }, debounceMs);
    },
    [executeSave, debounceMs, throttleMs]
  );

  /**
   * Force immediate save
   */
  const forceSave = useCallback(
    async (data: any) => {
      // Cancel pending timeouts
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
        throttleTimeoutRef.current = null;
      }

      await executeSave(data);
    },
    [executeSave]
  );

  /**
   * Cancel pending saves
   */
  const cancel = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    if (throttleTimeoutRef.current) {
      clearTimeout(throttleTimeoutRef.current);
      throttleTimeoutRef.current = null;
    }
    pendingDataRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    save,
    forceSave,
    cancel,
    isSaving: isSavingRef.current,
  };
}
