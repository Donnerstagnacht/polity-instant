import { useMemo } from 'react';
import { useGroupEventsForCalendar } from '@/zero/events/useEventState';
import { useCalendarView, type CalendarEvent } from '@/features/events/hooks/useCalendarView';
import { useCalendarEventFilter } from '@/features/events/hooks/useCalendarEventFilter';
import { addYears, generateRecurringInstances } from '@/features/calendar/logic/recurringEventHelpers';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { extractHashtagTags } from '@/zero/common/hashtagHelpers';
import { useAuth } from '@/providers/auth-provider';
import { getInstanceBookingCount, isBookedByUser } from '@/zero/events/useMeetingState';

export function useGroupEventsPage(groupId: string) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { events: eventsData } = useGroupEventsForCalendar(groupId);
  const calendar = useCalendarView('list');

  const events: CalendarEvent[] = useMemo(() => {
    if (!eventsData) return [];

    const now = new Date();
    const rangeStart = addYears(now, -1);
    const rangeEnd = addYears(now, 1);

    return (eventsData || []).flatMap((event: any) => {
      // Exclude bookable meetings from group event listings (shown in calendar instead)
      if (event.is_bookable) return [];
      const isMeeting = !!event.meeting_type;
      const participants = event.participants ?? [];
      const instances = generateRecurringInstances(event, rangeStart, rangeEnd, event.exceptions);
      return instances.map((instance: any) => {
        const instanceDate = instance.isRecurringInstance ? instance.start_date : null;
        const bookingCount = isMeeting
          ? getInstanceBookingCount(participants, event.creator_id, instanceDate)
          : undefined;
        const bookedByMe = isMeeting && user
          ? isBookedByUser(participants, user.id, instanceDate)
          : undefined;

        return {
          ...instance,
          startDate: instance.start_date,
          endDate: instance.end_date,
          location: instance.location_name || instance.location,
          isPublic: instance.is_public ?? true,
          imageURL: instance.image_url,
          description: instance.description || '',
          organizer: event.creator,
          participants: event.participants,
          groupName: event.group?.name,
          groupId: event.group_id,
          organizerName: event.group?.name || event.creator?.name,
          attendeeCount: event.participants?.length,
          hashtags: extractHashtagTags(event.event_hashtags)?.map((tag: string) => ({ id: tag, tag })),
          isMeeting,
          meetingType: event.meeting_type,
          isBookable: event.is_bookable,
          maxBookings: event.max_bookings,
          bookingCount,
          isBookedByMe: bookedByMe,
        };
      });
    });
  }, [eventsData, user]);

  const filter = useCalendarEventFilter(events);
  const filteredEvents = calendar.filterEventsForRange(filter.filteredBySearch);

  return {
    t,
    events: filter.filteredBySearch,
    filteredEvents,
    searchQuery: filter.searchQuery,
    setSearchQuery: filter.setSearchQuery,
    dateFilter: filter.dateFilter,
    setDateFilter: filter.setDateFilter,
    ...calendar,
  };
}
