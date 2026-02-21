import { useMemo } from 'react';
import { useCalendarData } from './useCalendarData';
import { useCalendarState } from './useCalendarState';
import { useCalendarNavigation } from './useCalendarNavigation';
import { useTranslation } from '@/hooks/use-translation';
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
} from '../logic/dateUtils';

export function useCalendarPage() {
  const { t } = useTranslation();
  const { events, isLoading } = useCalendarData();
  const { view, setView, selectedDate, setSelectedDate } = useCalendarState();
  const { goToPrevious, goToNext, goToToday } = useCalendarNavigation(
    view,
    selectedDate,
    setSelectedDate
  );

  const filteredEvents = useMemo(() => {
    if (view === 'day') {
      return events.filter(event => isSameDay(event.startDate, selectedDate));
    } else if (view === 'week') {
      const start = startOfWeek(selectedDate);
      const end = endOfWeek(selectedDate);
      return events.filter(event => isDateInRange(event.startDate, start, end));
    } else {
      const start = startOfMonth(selectedDate);
      const end = endOfMonth(selectedDate);
      return events.filter(event => isDateInRange(event.startDate, start, end));
    }
  }, [events, view, selectedDate]);

  const currentViewTitle = useMemo(() => {
    if (view === 'day') return formatDate(selectedDate);
    if (view === 'week') return formatWeekRange(selectedDate);
    return formatMonth(selectedDate);
  }, [view, selectedDate]);

  return {
    t,
    isLoading,
    view,
    setView,
    selectedDate,
    setSelectedDate,
    filteredEvents,
    events,
    currentViewTitle,
    goToPrevious,
    goToNext,
    goToToday,
  };
}
