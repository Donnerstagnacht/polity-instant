import { useMemo } from 'react';
import { db } from '../../../../db/db';

export function useMeetingData(meetingId: string) {
  const { user } = db.useAuth();

  const { data, isLoading, error } = db.useQuery({
    meetingSlots: {
      $: {
        where: {
          id: meetingId,
        },
      },
      owner: {},
      bookings: {
        booker: {},
      },
    },
  });

  const meetingSlot = data?.meetingSlots?.[0];

  const computed = useMemo(() => {
    if (!meetingSlot) {
      return {
        isOwner: false,
        hasBooked: false,
        bookingCount: 0,
        isPast: false,
        isAvailable: false,
      };
    }

    const isOwner = meetingSlot.owner?.id === user?.id;
    const hasBooked = meetingSlot.bookings?.some((b: any) => b.booker?.id === user?.id);
    const bookingCount = meetingSlot.bookings?.length || 0;
    const isPast = new Date(meetingSlot.startTime) < new Date();
    const isAvailable = meetingSlot.isAvailable && !isPast;

    return {
      isOwner,
      hasBooked,
      bookingCount,
      isPast,
      isAvailable,
    };
  }, [meetingSlot, user?.id]);

  return {
    meetingSlot,
    isLoading,
    error,
    ...computed,
  };
}
