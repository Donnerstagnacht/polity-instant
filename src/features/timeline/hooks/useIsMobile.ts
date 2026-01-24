'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Breakpoint configuration for responsive design
 */
export const BREAKPOINTS = {
  xs: 375,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/**
 * Hook to detect if the current viewport is mobile-sized
 *
 * @param breakpoint - The maximum width to consider as "mobile" (default: 768px)
 * @returns true if viewport width is less than the breakpoint
 */
export function useIsMobile(breakpoint: number = BREAKPOINTS.md): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check initial value
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    checkMobile();

    // Listen for resize events
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [breakpoint]);

  return isMobile;
}

/**
 * Hook to get the current breakpoint name
 *
 * @returns The current breakpoint name based on viewport width
 */
export function useBreakpoint(): keyof typeof BREAKPOINTS | 'xxs' {
  const [breakpoint, setBreakpoint] = useState<keyof typeof BREAKPOINTS | 'xxs'>('md');

  useEffect(() => {
    const getBreakpoint = (): keyof typeof BREAKPOINTS | 'xxs' => {
      const width = window.innerWidth;

      if (width >= BREAKPOINTS['2xl']) return '2xl';
      if (width >= BREAKPOINTS.xl) return 'xl';
      if (width >= BREAKPOINTS.lg) return 'lg';
      if (width >= BREAKPOINTS.md) return 'md';
      if (width >= BREAKPOINTS.sm) return 'sm';
      if (width >= BREAKPOINTS.xs) return 'xs';
      return 'xxs';
    };

    const handleResize = () => {
      setBreakpoint(getBreakpoint());
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return breakpoint;
}

/**
 * Hook to get responsive values based on current breakpoint
 *
 * @param values - Object with breakpoint keys and corresponding values
 * @param defaultValue - Default value if no matching breakpoint found
 * @returns The value for the current breakpoint
 */
export function useResponsiveValue<T>(
  values: Partial<Record<keyof typeof BREAKPOINTS | 'xxs', T>>,
  defaultValue: T
): T {
  const breakpoint = useBreakpoint();

  // Find the value for the current breakpoint or fall back to smaller breakpoints
  const breakpointOrder: (keyof typeof BREAKPOINTS | 'xxs')[] = [
    'xxs',
    'xs',
    'sm',
    'md',
    'lg',
    'xl',
    '2xl',
  ];
  const currentIndex = breakpointOrder.indexOf(breakpoint);

  // Look for value at current breakpoint or smaller
  for (let i = currentIndex; i >= 0; i--) {
    const bp = breakpointOrder[i];
    if (values[bp] !== undefined) {
      return values[bp]!;
    }
  }

  return defaultValue;
}
