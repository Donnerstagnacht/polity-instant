import type { CalendarViewMode, CalendarEvent } from '@/features/events/hooks/useCalendarView';
import { SharedListView } from './SharedListView';
import { SharedWeekView } from './SharedWeekView';
import { SharedMonthView } from './SharedMonthView';

interface CalendarViewContainerProps {
  viewMode: CalendarViewMode;
  selectedDate: Date;
  events: CalendarEvent[];
  allEvents: CalendarEvent[];
  onDateSelect: (date: Date) => void;
}

export function CalendarViewContainer({
  viewMode,
  selectedDate,
  events,
  allEvents,
  onDateSelect,
}: CalendarViewContainerProps) {
  if (viewMode === 'list') {
    return <SharedListView events={events} selectedDate={selectedDate} />;
  }

  if (viewMode === 'week') {
    return <SharedWeekView selectedDate={selectedDate} events={allEvents} />;
  }

  return (
    <SharedMonthView
      selectedDate={selectedDate}
      onDateSelect={onDateSelect}
      events={allEvents}
    />
  );
}
