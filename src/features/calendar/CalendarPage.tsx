'use client';

import { PageWrapper } from '@/components/layout/page-wrapper';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { useCalendarPage } from './hooks/useCalendarPage';
import { CalendarHeader } from './ui/CalendarHeader';
import { DayView } from './ui/DayView';
import { WeekView } from './ui/WeekView';
import { MonthView } from './ui/MonthView';

export default function CalendarPage() {
  const cp = useCalendarPage();

  if (cp.isLoading) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper>
          <div className="flex h-[400px] items-center justify-center">
            <p className="text-muted-foreground">{cp.t('features.calendar.loading')}</p>
          </div>
        </PageWrapper>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper>
        <CalendarHeader
          view={cp.view}
          setView={cp.setView}
          currentViewTitle={cp.currentViewTitle}
          onPrevious={cp.goToPrevious}
          onNext={cp.goToNext}
          onToday={cp.goToToday}
        />

        {cp.view === 'day' && (
          <DayView
            selectedDate={cp.selectedDate}
            events={cp.filteredEvents}
            allEvents={cp.events}
            onDateSelect={cp.setSelectedDate}
          />
        )}

        {cp.view === 'week' && (
          <WeekView
            selectedDate={cp.selectedDate}
            events={cp.filteredEvents}
            allEvents={cp.events}
          />
        )}

        {cp.view === 'month' && (
          <MonthView
            selectedDate={cp.selectedDate}
            onDateSelect={cp.setSelectedDate}
            events={cp.filteredEvents}
            allEvents={cp.events}
          />
        )}
      </PageWrapper>
    </AuthGuard>
  );
}
