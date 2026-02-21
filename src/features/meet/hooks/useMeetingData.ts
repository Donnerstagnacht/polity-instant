import { useMemo } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useMeetingSlotById } from '@/zero/events/useEventState';

export function useMeetingData(meetingId: string) {
  const { user } = useAuth();

  const { meetingSlot } = useMeetingSlotById(meetingId);

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

    const isOwner = meetingSlot.user?.id === user?.id;
    const hasBooked = meetingSlot.bookings?.some((b: any) => b.user?.id === user?.id);
    const bookingCount = meetingSlot.bookings?.length || 0;
    const isPast = new Date(meetingSlot.start_time ?? 0) < new Date();
    const isAvailable = meetingSlot.is_available && !isPast;

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
    isLoading: false,
    error: null,
    ...computed,
  };
}
