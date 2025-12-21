import { useState } from 'react';
import { CalendarView } from '../types';

export const useCalendarState = () => {
  const [view, setView] = useState<CalendarView>('day');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return {
    view,
    setView,
    selectedDate,
    setSelectedDate,
  };
};
