import React from 'react';
import { RightBadge } from '@/features/network/ui/RightBadge';

export function getGroupDisplayLabel(
  name: string | null | undefined,
  groupType?: string | null
): string {
  const normalizedType = (groupType ?? '').toLowerCase();
  if (normalizedType === 'hierarchical') {
    return `🏛 ${name ?? ''}`;
  }
  if (normalizedType === 'base') {
    return `◉ ${name ?? ''}`;
  }
  return name ?? '';
}

export function renderRightsEdgeLabel(rights: string[]) {
  return (
    <div className="flex flex-wrap gap-0.5 rounded-md border border-border/60 bg-background/95 px-1.5 py-1 shadow-sm backdrop-blur-sm">
      {rights.map((right) => (
        <RightBadge key={right} right={right} className="px-1.5 py-0.5 text-[10px] leading-tight" />
      ))}
    </div>
  );
}
