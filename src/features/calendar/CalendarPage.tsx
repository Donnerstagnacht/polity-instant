'use client';

import { PageWrapper } from '@/layout/page-wrapper';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { Button } from '@/features/shared/ui/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useCalendarPage } from './hooks/useCalendarPage';
import { SharedCalendarHeader } from '@/features/events/ui/calendar/SharedCalendarHeader';
import { CalendarViewContainer } from '@/features/events/ui/calendar/CalendarViewContainer';
import { CalendarExportButton } from '@/features/events/ui/calendar/CalendarExportButton';
import { CalendarSearchFilter } from '@/features/events/ui/calendar/CalendarSearchFilter';

export default function CalendarPage() {
  const cp = useCalendarPage();
  const navigate = useNavigate();

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
        <SharedCalendarHeader
          viewMode={cp.viewMode}
          setViewMode={cp.setViewMode}
          currentViewTitle={cp.currentViewTitle}
          onPrevious={cp.goToPrevious}
          onNext={cp.goToNext}
          onToday={cp.goToToday}
          title={cp.t('features.calendar.title')}
          actions={
            <>
              <CalendarExportButton events={cp.events} />
              <Button onClick={() => navigate({ to: '/create/event' })}>
                <Plus className="mr-2 h-4 w-4" />
                {cp.t('features.calendar.actions.createEvent')}
              </Button>
            </>
          }
        />

        <CalendarSearchFilter
          searchQuery={cp.searchQuery}
          onSearchChange={cp.setSearchQuery}
          dateFilter={cp.dateFilter}
          onDateFilterChange={cp.setDateFilter}
        />

        <CalendarViewContainer
          viewMode={cp.viewMode}
          selectedDate={cp.selectedDate}
          events={cp.filteredEvents}
          allEvents={cp.events}
          onDateSelect={cp.setSelectedDate}
        />
      </PageWrapper>
    </AuthGuard>
  );
}
