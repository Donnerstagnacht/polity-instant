import { db, id } from '../../../../db/db';
import { toast } from 'sonner';

export function useMeetingBooking() {
  const bookMeeting = async (meetingSlotId: string, notes?: string) => {
    try {
      await db.transact([
        db.tx.meetingBookings[id()].update({
          status: 'confirmed',
          createdAt: Date.now(),
          notes: notes || '',
        }).link({
          slot: meetingSlotId,
        }),
      ]);
      toast.success('Meeting booked successfully');
    } catch (error) {
      console.error('Error booking meeting:', error);
      toast.error('Failed to book meeting');
      throw error;
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      await db.transact([db.tx.meetingBookings[bookingId].delete()]);
      toast.success('Booking cancelled');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
      throw error;
    }
  };

  return {
    bookMeeting,
    cancelBooking,
  };
}
