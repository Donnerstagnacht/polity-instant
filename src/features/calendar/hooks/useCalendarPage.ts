import { useCalendarData } from './useCalendarData';
import { useCalendarView } from '@/features/events/hooks/useCalendarView';
import { useCalendarEventFilter } from '@/features/events/hooks/useCalendarEventFilter';
import { useTranslation } from '@/features/shared/hooks/use-translation';

export function useCalendarPage() {
  const { t } = useTranslation();
  const { events, isLoading } = useCalendarData();
  const calendar = useCalendarView('list');
  const filter = useCalendarEventFilter(events);

  const filteredEvents = calendar.filterEventsForRange(filter.filteredBySearch);

  return {
    t,
    isLoading,
    viewMode: calendar.viewMode,
    setViewMode: calendar.setViewMode,
    selectedDate: calendar.selectedDate,
    setSelectedDate: calendar.setSelectedDate,
    currentViewTitle: calendar.currentViewTitle,
    goToPrevious: calendar.goToPrevious,
    goToNext: calendar.goToNext,
    goToToday: calendar.goToToday,
    filteredEvents,
    events: filter.filteredBySearch,
    searchQuery: filter.searchQuery,
    setSearchQuery: filter.setSearchQuery,
    dateFilter: filter.dateFilter,
    setDateFilter: filter.setDateFilter,
  };
}
