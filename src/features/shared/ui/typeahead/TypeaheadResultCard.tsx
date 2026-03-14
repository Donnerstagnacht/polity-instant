'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/features/shared/ui/ui/avatar';
import { Badge } from '@/features/shared/ui/ui/badge';
import { Hash } from 'lucide-react';
import { getEntityIcon } from '@/features/shared/logic/entityCardHelpers';
import { ENTITY_COLORS } from '@/features/shared/utils/entity-colors';
import { highlightMatch } from '@/features/shared/logic/typeaheadHelpers';
import type { TypeaheadItem } from '@/features/shared/logic/typeaheadHelpers';
import { cn } from '@/features/shared/utils/utils';
import { getHashtagGradient } from '@/features/timeline/logic/gradient-assignment';

interface TypeaheadResultCardProps {
  item: TypeaheadItem;
  query: string;
  isSelected?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  const ranges = highlightMatch(text, query);
  if (ranges.length === 0) return <>{text}</>;

  const parts: React.ReactNode[] = [];
  let lastEnd = 0;
  for (const range of ranges) {
    if (range.start > lastEnd) {
      parts.push(text.slice(lastEnd, range.start));
    }
    parts.push(
      <span key={range.start} className="font-semibold text-foreground">
        {text.slice(range.start, range.end)}
      </span>,
    );
    lastEnd = range.end;
  }
  if (lastEnd < text.length) {
    parts.push(text.slice(lastEnd));
  }
  return <>{parts}</>;
}

export function TypeaheadResultCard({
  item,
  query,
  isSelected = false,
  onClick,
  onMouseEnter,
}: TypeaheadResultCardProps) {
  const Icon = getEntityIcon(item.entityType);
  const colors = ENTITY_COLORS[item.entityType as keyof typeof ENTITY_COLORS];
  const handleMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onClick?.();
  };

  return (
    <button
      type="button"
      className={cn(
        'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors',
        isSelected ? 'bg-accent' : 'hover:bg-accent/50',
      )}
      onMouseDown={handleMouseDown}
      onMouseEnter={onMouseEnter}
    >
      {/* Avatar */}
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={item.avatar ?? undefined} />
        <AvatarFallback className={cn('text-xs', colors?.badgeBg)}>
          <Icon className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">
            <HighlightedText text={item.label} query={query} />
          </span>
          {item.secondaryLabel && (
            <span className="truncate text-xs text-muted-foreground">
              <HighlightedText text={item.secondaryLabel} query={query} />
            </span>
          )}
        </div>
        {/* Hashtags */}
        {item.hashtags && item.hashtags.length > 0 && (
          <div className="mt-0.5 flex flex-wrap gap-1">
            {item.hashtags.slice(0, 3).map(tag => (
              <Badge
                key={tag}
                variant="secondary"
                className={cn('h-4 px-1 text-[10px] text-white border-0', getHashtagGradient(tag))}
              >
                <Hash className="mr-0.5 h-2 w-2" />
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Entity type badge */}
      <Badge variant="outline" className={cn('shrink-0 text-[10px]', colors?.badgeBg)}>
        {item.entityType}
      </Badge>
    </button>
  );
}
