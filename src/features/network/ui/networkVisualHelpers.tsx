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
    <div className="flex flex-wrap gap-0.5">
      {rights.map((right) => (
        <RightBadge key={right} right={right} className="px-1 py-0 text-[10px] leading-tight" />
      ))}
    </div>
  );
}
