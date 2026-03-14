import { useState, useMemo, useCallback } from 'react';
import type { CalendarEvent } from '@/features/events/hooks/useCalendarView';

export function useCalendarEventFilter(events: CalendarEvent[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const filteredBySearch = useMemo(() => {
    if (!searchQuery && !dateFilter) return events;

    const lowerQuery = searchQuery.toLowerCase();

    return events.filter(event => {
      // Date filter
      if (dateFilter) {
        const eventDate = new Date(event.start_date);
        const filterDate = new Date(dateFilter + 'T00:00:00');
        const sameDay =
          eventDate.getFullYear() === filterDate.getFullYear() &&
          eventDate.getMonth() === filterDate.getMonth() &&
          eventDate.getDate() === filterDate.getDate();
        if (!sameDay) return false;
      }

      // Search query filter (title, hashtags)
      if (lowerQuery) {
        const titleMatch = event.title?.toLowerCase().includes(lowerQuery);
        const hashtagMatch = event.hashtags?.some(h =>
          h.tag.toLowerCase().includes(lowerQuery)
        );
        const groupMatch = event.groupName?.toLowerCase().includes(lowerQuery);
        const locationMatch = event.location?.toLowerCase().includes(lowerQuery);
        if (!titleMatch && !hashtagMatch && !groupMatch && !locationMatch) return false;
      }

      return true;
    });
  }, [events, searchQuery, dateFilter]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setDateFilter('');
  }, []);

  const hasActiveFilters = searchQuery !== '' || dateFilter !== '';

  return {
    searchQuery,
    setSearchQuery,
    dateFilter,
    setDateFilter,
    filteredBySearch,
    clearFilters,
    hasActiveFilters,
  };
}
