import { useEventActions } from '@/zero/events/useEventActions';
import { useNotificationActions } from '@/zero/notifications/useNotificationActions';
import { toast } from 'sonner';

export function useMeetingBooking() {
  const { createMeetingBooking, deleteMeetingBooking } = useEventActions();
  const { createNotification } = useNotificationActions();

  const bookMeeting = async (
    meetingSlotId: string,
    notes?: string,
    senderId?: string,
    hostUserId?: string,
    meetingTitle?: string
  ) => {
    try {
      const bookingId = crypto.randomUUID();
      const now = Date.now();

      await createMeetingBooking({
        id: bookingId,
        status: 'confirmed',
        message: notes || '',
        slot_id: meetingSlotId,
      });

      // Notify host about the booking
      if (senderId && hostUserId && meetingTitle) {
        await createNotification({
          id: crypto.randomUUID(),
          sender_id: senderId,
          recipient_id: hostUserId,
          type: 'event_meeting_booked',
          title: 'Meeting Booked',
          message: `A meeting has been booked at ${meetingTitle}`,
          action_url: '/calendar',
          related_entity_type: '',
          on_behalf_of_entity_type: '',
          on_behalf_of_entity_id: '',
          recipient_entity_type: '',
          recipient_entity_id: '',
          related_user_id: '',
          related_group_id: '',
          related_amendment_id: '',
          related_event_id: '',
          related_blog_id: '',
          on_behalf_of_group_id: '',
          on_behalf_of_event_id: '',
          on_behalf_of_amendment_id: '',
          on_behalf_of_blog_id: '',
          recipient_group_id: '',
          recipient_event_id: '',
          recipient_amendment_id: '',
          recipient_blog_id: '',
        });
      }

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
      await deleteMeetingBooking({ id: bookingId });

      // Notify host about the cancellation
      if (senderId && hostUserId && meetingTitle) {
        await createNotification({
          id: crypto.randomUUID(),
          sender_id: senderId,
          recipient_id: hostUserId,
          type: 'event_meeting_cancelled',
          title: 'Meeting Cancelled',
          message: `A meeting at ${meetingTitle} has been cancelled`,
          action_url: '/calendar',
          related_entity_type: '',
          on_behalf_of_entity_type: '',
          on_behalf_of_entity_id: '',
          recipient_entity_type: '',
          recipient_entity_id: '',
          related_user_id: '',
          related_group_id: '',
          related_amendment_id: '',
          related_event_id: '',
          related_blog_id: '',
          on_behalf_of_group_id: '',
          on_behalf_of_event_id: '',
          on_behalf_of_amendment_id: '',
          on_behalf_of_blog_id: '',
          recipient_group_id: '',
          recipient_event_id: '',
          recipient_amendment_id: '',
          recipient_blog_id: '',
        });
      }

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
