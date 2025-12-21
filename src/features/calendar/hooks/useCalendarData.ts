import { useMemo } from 'react';
import { db } from '../../../../db/db';
import { CalendarEvent } from '../types';

export const useCalendarData = () => {
  const { user } = db.useAuth();
  
  const { data, isLoading } = db.useQuery({
    events: {
      organizer: {},
      group: {},
      participants: {
        user: {},
      },
    },
    meetingSlots: {
      owner: {},
      bookings: {
        booker: {},
      },
    },
  });

  const events: CalendarEvent[] = useMemo(() => {
    if (!data || !user) return [];

    // Filter events where user is a participant or organizer
    const userEvents = (data.events || [])
      .filter((event: any) => {
        const isOrganizer = event.organizer?.id === user.id;
        const isParticipant = event.participants?.some((p: any) => p.user?.id === user.id);
        return isOrganizer || isParticipant;
      })
      .map((event: any) => ({
        ...event,
        description: event.description || '',
      }));

    // Filter meeting slots where user is owner or has booked
    const userMeetings = (data.meetingSlots || []).filter((slot: any) => {
      const isOwner = slot.owner?.id === user.id;
      const hasBooked = slot.bookings?.some((b: any) => b.booker?.id === user.id);
      return isOwner || hasBooked;
    });

    // Convert meetings to event-like format for unified display
    const meetingEvents = userMeetings.map((slot: any) => ({
      id: slot.id,
      title: slot.title || 'Meeting',
      description: slot.description || '',
      location: slot.isPublic ? 'Public Meeting' : 'Private Meeting',
      startDate: slot.startTime,
      endDate: slot.endTime,
      isPublic: slot.isPublic,
      imageURL: null,
      organizer: slot.owner,
      participants: slot.bookings?.map((b: any) => ({ user: b.booker })) || [],
      isMeeting: true,
    }));

    return [...userEvents, ...meetingEvents];
  }, [data, user]);

  return { events, isLoading };
};
