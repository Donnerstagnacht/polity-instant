import { useCallback } from 'react';
import { CalendarView } from '../types';

export const useCalendarNavigation = (
  view: CalendarView,
  selectedDate: Date,
  setSelectedDate: (date: Date) => void
) => {
  const goToPrevious = useCallback(() => {
    const newDate = new Date(selectedDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setSelectedDate(newDate);
  }, [view, selectedDate, setSelectedDate]);

  const goToNext = useCallback(() => {
    const newDate = new Date(selectedDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  }, [view, selectedDate, setSelectedDate]);

  const goToToday = useCallback(() => {
    setSelectedDate(new Date());
  }, [setSelectedDate]);

  return {
    goToPrevious,
    goToNext,
    goToToday,
  };
};
