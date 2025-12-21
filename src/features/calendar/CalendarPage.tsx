'use client';

import { useMemo } from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { useCalendarData } from './hooks/useCalendarData';
import { useCalendarState } from './hooks/useCalendarState';
import { useCalendarNavigation } from './hooks/useCalendarNavigation';
import { CalendarHeader } from './ui/CalendarHeader';
import { DayView } from './ui/DayView';
import { WeekView } from './ui/WeekView';
import { MonthView } from './ui/MonthView';
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isDateInRange,
  formatDate,
  formatWeekRange,
  formatMonth,
} from './utils/dateUtils';

export default function CalendarPage() {
  const { events, isLoading } = useCalendarData();
  const { view, setView, selectedDate, setSelectedDate } = useCalendarState();
  const { goToPrevious, goToNext, goToToday } = useCalendarNavigation(
    view,
    selectedDate,
    setSelectedDate
  );

  // Filter events based on current view
  const filteredEvents = useMemo(() => {
    if (view === 'day') {
      return events.filter((event) => isSameDay(event.startDate, selectedDate));
    } else if (view === 'week') {
      const start = startOfWeek(selectedDate);
      const end = endOfWeek(selectedDate);
      return events.filter((event) => isDateInRange(event.startDate, start, end));
    } else {
      const start = startOfMonth(selectedDate);
      const end = endOfMonth(selectedDate);
      return events.filter((event) => isDateInRange(event.startDate, start, end));
    }
  }, [events, view, selectedDate]);

  const getCurrentViewTitle = () => {
    if (view === 'day') return formatDate(selectedDate);
    if (view === 'week') return formatWeekRange(selectedDate);
    return formatMonth(selectedDate);
  };

  if (isLoading) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper className="container mx-auto p-4">
          <div className="flex h-[400px] items-center justify-center">
            <p className="text-muted-foreground">Loading calendar...</p>
          </div>
        </PageWrapper>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="container mx-auto p-4">
        <CalendarHeader
          view={view}
          setView={setView}
          currentViewTitle={getCurrentViewTitle()}
          onPrevious={goToPrevious}
          onNext={goToNext}
          onToday={goToToday}
        />

        {view === 'day' && (
          <DayView
            selectedDate={selectedDate}
            events={filteredEvents}
            allEvents={events}
            onDateSelect={setSelectedDate}
          />
        )}

        {view === 'week' && (
          <WeekView
            selectedDate={selectedDate}
            events={filteredEvents}
            allEvents={events}
          />
        )}

        {view === 'month' && (
          <MonthView
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            events={filteredEvents}
            allEvents={events}
          />
        )}
      </PageWrapper>
    </AuthGuard>
  );
}
