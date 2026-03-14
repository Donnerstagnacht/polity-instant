import { useState, useCallback, useMemo } from 'react';

export type CalendarViewMode = 'list' | 'week' | 'month';

export interface VisibleRange {
  start: Date;
  end: Date;
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfWeek(date: Date): Date {
  const d = startOfWeek(date);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function getVisibleRange(viewMode: CalendarViewMode, selectedDate: Date): VisibleRange {
  if (viewMode === 'week') {
    return { start: startOfWeek(selectedDate), end: endOfWeek(selectedDate) };
  }
  if (viewMode === 'month') {
    return { start: startOfMonth(selectedDate), end: endOfMonth(selectedDate) };
  }
  // list: show the entire month for grouping
  return { start: startOfMonth(selectedDate), end: endOfMonth(selectedDate) };
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startDate: string | number | Date;
  endDate: string | number | Date;
  isPublic: boolean;
  imageURL?: string | null;
  organizer?: { id: string; name?: string; avatar?: string };
  participants?: readonly { user?: { id: string; name?: string; avatar?: string }; instance_date?: number | null }[];
  isMeeting?: boolean;
  meetingType?: string | null;
  isBookable?: boolean;
  maxBookings?: number;
  bookingCount?: number;
  isBookedByMe?: boolean;
  groupName?: string;
  groupId?: string;
  isRecurringInstance?: boolean;
  recurringParentId?: string;
  hashtags?: { id: string; tag: string }[];
  attendeeCount?: number;
  organizerName?: string;
}

function isDateInRange(date: Date | string | number, start: Date, end: Date): boolean {
  const d = new Date(date);
  return d >= start && d <= end;
}

function isSameDay(date1: Date | string | number, date2: Date): boolean {
  const d1 = new Date(date1);
  return (
    d1.getFullYear() === date2.getFullYear() &&
    d1.getMonth() === date2.getMonth() &&
    d1.getDate() === date2.getDate()
  );
}

export function useCalendarView(initialView: CalendarViewMode = 'list') {
  const [viewMode, setViewMode] = useState<CalendarViewMode>(initialView);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const visibleRange = useMemo(
    () => getVisibleRange(viewMode, selectedDate),
    [viewMode, selectedDate]
  );

  const goToPrevious = useCallback(() => {
    setSelectedDate(prev => {
      const d = new Date(prev);
      if (viewMode === 'week') {
        d.setDate(d.getDate() - 7);
      } else {
        d.setMonth(d.getMonth() - 1);
      }
      return d;
    });
  }, [viewMode]);

  const goToNext = useCallback(() => {
    setSelectedDate(prev => {
      const d = new Date(prev);
      if (viewMode === 'week') {
        d.setDate(d.getDate() + 7);
      } else {
        d.setMonth(d.getMonth() + 1);
      }
      return d;
    });
  }, [viewMode]);

  const goToToday = useCallback(() => {
    setSelectedDate(new Date());
  }, []);

  const filterEventsForRange = useCallback(
    (events: CalendarEvent[]): CalendarEvent[] => {
      return events.filter(e => isDateInRange(e.startDate, visibleRange.start, visibleRange.end));
    },
    [visibleRange]
  );

  const getEventsForDate = useCallback(
    (events: CalendarEvent[], date: Date): CalendarEvent[] => {
      return events.filter(e => isSameDay(e.startDate, date));
    },
    []
  );

  const currentViewTitle = useMemo(() => {
    if (viewMode === 'week') {
      const start = startOfWeek(selectedDate);
      const end = endOfWeek(selectedDate);
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [viewMode, selectedDate]);

  return {
    viewMode,
    setViewMode,
    selectedDate,
    setSelectedDate,
    visibleRange,
    currentViewTitle,
    goToPrevious,
    goToNext,
    goToToday,
    filterEventsForRange,
    getEventsForDate,
  };
}
