'use client';

import { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/utils';

interface TimelineItemProps {
  order: number;
  startTime: string;
  endTime: string;
  duration: number;
  children: ReactNode;
  className?: string;
}

export function TimelineItem({
  order,
  startTime,
  endTime,
  duration,
  children,
  className,
}: TimelineItemProps) {
  return (
    <div className={cn('relative flex gap-4', className)}>
      {/* Time Column */}
      <div className="relative flex w-24 flex-shrink-0 flex-col items-center pt-4">
        <div className="h-3 w-3 rounded-full border-2 border-background bg-primary" />
        <div className="mb-2 mt-2 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-semibold">
          {order}
        </div>
        <div className="mt-2 text-center">
          <div className="text-sm font-semibold">{startTime}</div>
          <div className="mt-1 text-xs text-muted-foreground">{endTime}</div>
          <Badge variant="outline" className="mt-2 text-xs">
            {duration}m
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">{children}</div>
    </div>
  );
}
