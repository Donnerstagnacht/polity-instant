'use client';

import * as React from 'react';

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
