'use client';

import type { TypeaheadItem, EntityType } from '@/features/shared/logic/typeaheadHelpers';
import { groupResultsByType } from '@/features/shared/logic/typeaheadHelpers';
import { TypeaheadResultCard } from './TypeaheadResultCard';
import { getEntityIcon } from '@/features/shared/logic/entityCardHelpers';
import { cn } from '@/features/shared/utils/utils';
import { useMemo } from 'react';

const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  user: 'Users',
  group: 'Groups',
  amendment: 'Amendments',
  event: 'Events',
  election: 'Elections',
  position: 'Positions',
};

interface TypeaheadDropdownProps {
  results: TypeaheadItem[];
  query: string;
  selectedIndex: number;
  onSelect: (item: TypeaheadItem) => void;
  onHoverIndex: (index: number) => void;
  isLoading?: boolean;
  className?: string;
}

export function TypeaheadDropdown({
  results,
  query,
  selectedIndex,
  onSelect,
  onHoverIndex,
  isLoading,
  className,
}: TypeaheadDropdownProps) {
  const grouped = useMemo(() => groupResultsByType(results), [results]);
  const typeOrder: EntityType[] = ['user', 'group', 'amendment', 'event'];

  if (isLoading) {
    return (
      <div className={cn('rounded-md border bg-popover p-4 text-center text-sm text-muted-foreground shadow-lg', className)}>
        Loading...
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className={cn('rounded-md border bg-popover p-4 text-center text-sm text-muted-foreground shadow-lg', className)}>
        No results found
      </div>
    );
  }

  let flatIndex = 0;

  return (
    <div className={cn('max-h-80 overflow-y-auto rounded-md border bg-popover shadow-lg', className)}>
      {typeOrder.map(type => {
        const items = grouped[type];
        if (!items || items.length === 0) return null;
        const Icon = getEntityIcon(type);

        return (
          <div key={type}>
            <div className="sticky top-0 z-10 flex items-center gap-2 border-b bg-popover/95 px-3 py-1.5 backdrop-blur">
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                {ENTITY_TYPE_LABELS[type]}
              </span>
            </div>
            <div className="p-1">
              {items.map(item => {
                const currentIndex = flatIndex++;
                return (
                  <TypeaheadResultCard
                    key={item.id}
                    item={item}
                    query={query}
                    isSelected={currentIndex === selectedIndex}
                    onClick={() => onSelect(item)}
                    onMouseEnter={() => onHoverIndex(currentIndex)}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
