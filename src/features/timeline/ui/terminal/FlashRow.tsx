'use client';

/**
 * FlashRow - Wrapper component that applies flash effect to a row
 */

import * as React from 'react';
import { cn } from '@/utils/utils';
import { type FlashState, getFlashClasses } from '../../hooks/useDecisionFlash';

export interface FlashRowProps {
  /** Flash state for this row */
  flashState?: FlashState;
  /** Children to render */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
  /** Whether to show glow effect */
  showGlow?: boolean;
}

/**
 * FlashRow wraps content and applies flash animation when triggered
 */
export function FlashRow({ flashState, children, className, showGlow = true }: FlashRowProps) {
  const flashClasses = getFlashClasses(flashState);
  const isFlashing = !!flashState;

  // Determine glow color based on flash type
  const glowColor = React.useMemo(() => {
    if (!flashState || !showGlow) return '';

    switch (flashState.type) {
      case 'up':
        return 'shadow-green-500/30';
      case 'down':
        return 'shadow-red-500/30';
      default:
        return 'shadow-yellow-500/30';
    }
  }, [flashState, showGlow]);

  // Determine background color based on flash type
  const bgColor = React.useMemo(() => {
    if (!flashState) return '';

    switch (flashState.type) {
      case 'up':
        return 'bg-green-50 dark:bg-green-950/30';
      case 'down':
        return 'bg-red-50 dark:bg-red-950/30';
      default:
        return 'bg-yellow-50 dark:bg-yellow-950/30';
    }
  }, [flashState]);

  return (
    <div
      className={cn(
        'transition-all duration-300',
        isFlashing && [flashClasses, bgColor, showGlow && 'shadow-lg', showGlow && glowColor],
        className
      )}
      data-flashing={isFlashing}
      data-flash-type={flashState?.type}
      data-flash-intensity={flashState?.intensity}
    >
      {children}
    </div>
  );
}

/**
 * FlashCell - Smaller wrapper for individual cells
 */
export function FlashCell({
  flashState,
  children,
  className,
}: {
  flashState?: FlashState;
  children: React.ReactNode;
  className?: string;
}) {
  const isFlashing = !!flashState;

  // Text color based on flash type
  const textColor = React.useMemo(() => {
    if (!flashState) return '';

    switch (flashState.type) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-yellow-600 dark:text-yellow-400';
    }
  }, [flashState]);

  return (
    <span
      className={cn(
        'transition-colors duration-300',
        isFlashing && ['font-semibold', textColor],
        className
      )}
    >
      {children}
    </span>
  );
}

/**
 * FlashIndicator - Small visual indicator for flash events
 */
export function FlashIndicator({
  flashState,
  size = 'sm',
}: {
  flashState?: FlashState;
  size?: 'sm' | 'md' | 'lg';
}) {
  if (!flashState) return null;

  const sizeClasses: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const colorClasses: Record<FlashState['type'], string> = {
    up: 'bg-green-500',
    down: 'bg-red-500',
    neutral: 'bg-yellow-500',
  };

  return (
    <span
      className={cn(
        'inline-block animate-ping rounded-full',
        sizeClasses[size],
        colorClasses[flashState.type]
      )}
      aria-hidden="true"
    />
  );
}
