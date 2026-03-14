import { useMemo } from 'react';
import { useQuery } from '@rocicorp/zero/react';
import { useAuth } from '@/providers/auth-provider';
import { queries } from '@/zero/queries';
import { getInstanceBookingCount, isBookedByUser } from '@/zero/events/useMeetingState';

/**
 * Composition hook for single meeting (event) detail.
 * Used by MeetingPage to display a meeting's details and booking state.
 */
export function useMeetingData(eventId: string) {
  const { user } = useAuth();

  const [events, result] = useQuery(
    queries.events.byIdFull({ id: eventId })
  );
  const event = events[0];

  const computed = useMemo(() => {
    if (!event) {
      return {
        isOwner: false,
        hasBooked: false,
        bookingCount: 0,
        isPast: false,
        isAvailable: false,
      };
    }

    const participants = [...(event.participants ?? [])] as Array<{ user_id: string; instance_date?: number | null }>;
    const isOwner = event.creator_id === user?.id;
    const hasBooked = user ? isBookedByUser(participants, user.id, null) : false;
    const bookingCount = getInstanceBookingCount(participants, event.creator_id, null);
    const isPast = new Date(event.end_date ?? event.start_date ?? 0) < new Date();
    const isFull = bookingCount >= (event.max_bookings ?? 1);
    const isAvailable = event.is_bookable && !isPast && !isFull;

    return {
      isOwner,
      hasBooked,
      bookingCount,
      isPast,
      isAvailable,
    };
  }, [event, user?.id]);

  return {
    event,
    isLoading: result.type === 'unknown',
    error: null,
    ...computed,
  };
}
