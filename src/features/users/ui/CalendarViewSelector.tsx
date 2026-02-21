'use client';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarIcon, List, Grid3x3, ChevronLeft, ChevronRight } from 'lucide-react';

export type CalendarView = 'day' | 'week' | 'month';

interface CalendarViewSelectorProps {
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  selectedDate: Date;
  onPreviousClick: () => void;
  onTodayClick: () => void;
  onNextClick: () => void;
  currentViewTitle: string;
}

export function CalendarViewSelector({
  view,
  onViewChange,
  onPreviousClick,
  onTodayClick,
  onNextClick,
  currentViewTitle,
}: CalendarViewSelectorProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onPreviousClick}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={onTodayClick}>
          Today
        </Button>
        <Button variant="outline" size="icon" onClick={onNextClick}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <h2 className="ml-2 text-lg font-semibold">{currentViewTitle}</h2>
      </div>

      <Tabs value={view} onValueChange={v => onViewChange(v as CalendarView)}>
        <TabsList>
          <TabsTrigger value="day">
            <List className="mr-2 h-4 w-4" />
            Day
          </TabsTrigger>
          <TabsTrigger value="week">
            <Grid3x3 className="mr-2 h-4 w-4" />
            Week
          </TabsTrigger>
          <TabsTrigger value="month">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Month
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
