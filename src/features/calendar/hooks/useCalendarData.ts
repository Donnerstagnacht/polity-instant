import { useMemo } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useEventsForCalendar, useMeetingSlotsWithBookings } from '@/zero/events/useEventState';
import { CalendarEvent } from '../types/calendar.types';
import { addYears, generateRecurringInstances } from '../logic/recurringEventHelpers';

export const useCalendarData = () => {
  const { user } = useAuth();

  const { events: eventsData } = useEventsForCalendar();

  const { meetingSlots } = useMeetingSlotsWithBookings();

  const isLoading = false;

  const calendarEvents: CalendarEvent[] = useMemo(() => {
    if (!eventsData || !user) return [];

    // Define a reasonable range for recurring events (±1 year from now)
    const now = new Date();
    const rangeStart = addYears(now, -1);
    const rangeEnd = addYears(now, 1);

    // Filter events where user is a participant or organizer
    const userEvents = (eventsData || [])
      .filter((event: any) => {
        const isOrganizer = event.creator?.id === user.id;
        const isParticipant = event.participants?.some((p: any) => p.user?.id === user.id);
        return isOrganizer || isParticipant;
      })
      .flatMap((event: any) => {
        // Expand recurring events into instances
        const instances = generateRecurringInstances(event, rangeStart, rangeEnd);
        return instances.map((instance: any) => ({
          ...instance,
          description: instance.description || '',
        }));
      });

    // Filter meeting slots where user is owner or has booked
    const userMeetings = (meetingSlots || []).filter((slot: any) => {
      const isOwner = slot.user?.id === user.id;
      const hasBooked = slot.bookings?.some((b: any) => b.user?.id === user.id);
      return isOwner || hasBooked;
    });

    // Convert meetings to event-like format for unified display
    const meetingEvents = userMeetings.map((slot: any) => ({
      id: slot.id,
      title: slot.title || 'Meeting',
      description: slot.description || '',
      location: slot.is_public ? 'Public Meeting' : 'Private Meeting',
      startDate: slot.start_time,
      endDate: slot.end_time,
      isPublic: slot.is_public,
      imageURL: null,
      organizer: slot.user,
      participants: slot.bookings?.map((b: any) => ({ user: b.user })) || [],
      isMeeting: true,
    }));

    return [...userEvents, ...meetingEvents];
  }, [eventsData, meetingSlots, user]);

  return { events: calendarEvents, isLoading };
};
