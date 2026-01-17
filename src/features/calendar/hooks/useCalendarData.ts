import { useMemo } from 'react';
import { db } from '../../../../db/db';
import { CalendarEvent } from '../types';

// Helper to add days to a date
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Helper to add months to a date
const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

// Helper to add years to a date
const addYears = (date: Date, years: number): Date => {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
};

// Generate recurring event instances within a date range
const generateRecurringInstances = (
  event: any,
  rangeStart: Date,
  rangeEnd: Date
): any[] => {
  if (!event.recurringPattern || event.recurringPattern === 'none') {
    return [event];
  }

  const instances: any[] = [];
  const eventStart = new Date(event.startDate);
  const eventEnd = new Date(event.endDate);
  const duration = eventEnd.getTime() - eventStart.getTime();
  const recurringEndDate = event.recurringEndDate ? new Date(event.recurringEndDate) : addYears(rangeEnd, 1);
  const interval = event.recurringInterval || 1;

  let currentStart = new Date(eventStart);
  let instanceIndex = 0;
  const maxInstances = 100; // Safety limit

  while (currentStart <= recurringEndDate && currentStart <= rangeEnd && instanceIndex < maxInstances) {
    const currentEnd = new Date(currentStart.getTime() + duration);
    
    // Only include if within the view range
    if (currentEnd >= rangeStart) {
      instances.push({
        ...event,
        id: instanceIndex === 0 ? event.id : `${event.id}_instance_${instanceIndex}`,
        startDate: currentStart.toISOString(),
        endDate: currentEnd.toISOString(),
        isRecurringInstance: instanceIndex > 0,
        recurringParentId: instanceIndex > 0 ? event.id : undefined,
      });
    }

    // Advance to next occurrence
    switch (event.recurringPattern) {
      case 'daily':
        currentStart = addDays(currentStart, interval);
        break;
      case 'weekly':
        currentStart = addDays(currentStart, 7 * interval);
        break;
      case 'monthly':
        currentStart = addMonths(currentStart, interval);
        break;
      case 'yearly':
        currentStart = addYears(currentStart, interval);
        break;
      case 'four-yearly':
        currentStart = addYears(currentStart, 4 * interval);
        break;
      default:
        currentStart = addDays(currentStart, 1);
    }
    instanceIndex++;
  }

  return instances;
};

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

    // Define a reasonable range for recurring events (±1 year from now)
    const now = new Date();
    const rangeStart = addYears(now, -1);
    const rangeEnd = addYears(now, 1);

    // Filter events where user is a participant or organizer
    const userEvents = (data.events || [])
      .filter((event: any) => {
        const isOrganizer = event.organizer?.id === user.id;
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
