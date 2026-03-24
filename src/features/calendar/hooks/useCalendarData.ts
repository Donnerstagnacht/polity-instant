import { useMemo } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useEventsForCalendarWithExceptions } from '@/zero/events/useEventState';
import { addYears, generateRecurringInstances } from '../logic/recurringEventHelpers';
import { extractHashtagTags } from '@/zero/common/hashtagHelpers';
import type { CalendarEvent } from '../types/calendar.types';
import { getInstanceBookingCount, isBookedByUser } from '@/zero/events/useMeetingState';

export const useCalendarData = () => {
  const { user } = useAuth();

  const { events: eventsData } = useEventsForCalendarWithExceptions();

  const isLoading = false;

  const calendarEvents: CalendarEvent[] = useMemo(() => {
    if (!eventsData || !user) return [];

    // Define a reasonable range for recurring events (±1 year from now)
    const now = new Date();
    const rangeStart = addYears(now, -1);
    const rangeEnd = addYears(now, 1);

    // Filter events where user is a participant, organizer, or meeting is bookable by them
    const userEvents = (eventsData || [])
      .filter((event) => {
        const isOrganizer = event.creator?.id === user.id;
        const isParticipant = event.participants?.some((p) => p.user?.id === user.id);
        // Include bookable meetings even if user hasn't booked yet (so they appear as available)
        const isBookableMeeting = event.is_bookable && event.meeting_type;
        return isOrganizer || isParticipant || isBookableMeeting;
      })
      .flatMap((event) => {
        const isMeeting = !!event.meeting_type;
        const participants = event.participants ?? [];
        // Expand recurring events into instances, passing exceptions
        const instances = generateRecurringInstances(event, rangeStart, rangeEnd, event.exceptions);
        return instances.map((instance) => {
          const instanceDate = instance.isRecurringInstance ? instance.start_date : null;
          const bookingCount = isMeeting
            ? getInstanceBookingCount(participants, event.creator_id, instanceDate)
            : undefined;
          const bookedByMe = isMeeting
            ? isBookedByUser(participants, user.id, instanceDate)
            : undefined;

          const creatorName = [event.creator?.first_name, event.creator?.last_name].filter(Boolean).join(' ') || undefined;
          return {
            ...instance,
            title: instance.title || '',
            start_date: instance.start_date ?? 0,
            end_date: instance.end_date ?? 0,
            location: instance.location_name || instance.location_address || undefined,
            visibility: instance.visibility ?? 'public',
            image_url: instance.image_url,
            description: instance.description || '',
            organizer: event.creator ? { id: event.creator.id, name: creatorName, avatar: event.creator.avatar ?? undefined } : undefined,
            participants: event.participants,
            groupName: event.group?.name,
            group_id: event.group_id,
            organizerName: event.group?.name || creatorName,
            attendeeCount: event.participants?.length,
            hashtags: extractHashtagTags(event.event_hashtags)?.map((tag: string) => ({ id: tag, tag })),
            isMeeting,
            meeting_type: event.meeting_type,
            is_bookable: event.is_bookable,
            max_bookings: event.max_bookings,
            bookingCount,
            isBookedByMe: bookedByMe,
          } as CalendarEvent;
        });
      });

    return userEvents;
  }, [eventsData, user]);

  return { events: calendarEvents, isLoading };
};
