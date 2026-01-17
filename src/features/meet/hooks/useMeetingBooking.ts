import { db, id } from '../../../../db/db';
import { toast } from 'sonner';
import { notifyMeetingBooked, notifyMeetingCancelled } from '@/utils/notification-helpers';

export function useMeetingBooking() {
  const bookMeeting = async (
    meetingSlotId: string,
    notes?: string,
    senderId?: string,
    hostUserId?: string,
    meetingTitle?: string
  ) => {
    try {
      const bookingId = id();
      const transactions: any[] = [
        db.tx.meetingBookings[bookingId].update({
          status: 'confirmed',
          createdAt: Date.now(),
          notes: notes || '',
        }).link({
          slot: meetingSlotId,
        }),
      ];

      // Notify host about the booking
      if (senderId && hostUserId && meetingTitle) {
        const notificationTxs = notifyMeetingBooked({
          senderId,
          senderName: '', // Will be filled from user data
          recipientUserId: hostUserId,
          meetingTime: meetingTitle, // Using title as time for now
        });
        transactions.push(...notificationTxs);
      }

      await db.transact(transactions);
      toast.success('Meeting booked successfully');
    } catch (error) {
      console.error('Error booking meeting:', error);
      toast.error('Failed to book meeting');
      throw error;
    }
  };

  const cancelBooking = async (
    bookingId: string,
    senderId?: string,
    hostUserId?: string,
    meetingTitle?: string
  ) => {
    try {
      const transactions: any[] = [db.tx.meetingBookings[bookingId].delete()];

      // Notify host about the cancellation
      if (senderId && hostUserId && meetingTitle) {
        const notificationTxs = notifyMeetingCancelled({
          senderId,
          senderName: '', // Will be filled from user data
          recipientUserId: hostUserId,
          meetingTime: meetingTitle, // Using title as time for now
        });
        transactions.push(...notificationTxs);
      }

      await db.transact(transactions);
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
