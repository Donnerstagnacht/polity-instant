import { useState } from 'react';
import { toast } from 'sonner';
import { sendNotificationFn } from '@/server/notifications';
import { useEventActions } from '@/zero/events/useEventActions';

/**
 * Hook for event mutations
 */
export function useEventMutations(eventId: string) {
  const { inviteParticipant, updateParticipant, leaveEvent, updateEvent: doUpdateEvent } = useEventActions();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Invite participants to the event
   */
  const inviteParticipants = async (
    userIds: string[],
    roleId?: string,
    senderId?: string,
    eventTitle?: string
  ) => {
    if (userIds.length === 0) return { success: false, error: 'No users selected' };

    setIsLoading(true);
    try {
      for (const userId of userIds) {
        const participantId = crypto.randomUUID();
        await inviteParticipant({
          id: participantId,
          status: 'invited',
          user_id: userId,
          event_id: eventId,
          group_id: null,
          visibility: 'public',
          role_id: roleId ?? '',
        });

        if (senderId && eventTitle) {
          sendNotificationFn({ data: { helper: 'notifyEventInvite', params: { senderId, recipientId: userId, eventId, eventTitle } } }).catch(console.error)
        }
      }

      toast.success(`Successfully invited ${userIds.length} participant(s)`);
      return { success: true };
    } catch (error) {
      console.error('Failed to invite participants:', error);
      toast.error('Failed to invite participants');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Approve a participation request
   */
  const approveParticipation = async (
    participationId: string,
    userId?: string,
    senderId?: string,
    eventTitle?: string
  ) => {
    setIsLoading(true);
    try {
      await updateParticipant({
        id: participationId,
        status: 'member',
      });

      if (userId && senderId && eventTitle) {
        sendNotificationFn({ data: { helper: 'notifyParticipationApproved', params: { senderId, recipientId: userId, eventId, eventTitle } } }).catch(console.error)
      }

      toast.success('Participation approved');
      return { success: true };
    } catch (error) {
      console.error('Failed to approve participation:', error);
      toast.error('Failed to approve participation');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reject a participation request
   */
  const rejectParticipation = async (
    participationId: string,
    userId?: string,
    senderId?: string,
    eventTitle?: string
  ) => {
    setIsLoading(true);
    try {
      await leaveEvent({
        id: participationId,
      });

      if (userId && senderId && eventTitle) {
        sendNotificationFn({ data: { helper: 'notifyParticipationRejected', params: { senderId, recipientId: userId, eventId, eventTitle } } }).catch(console.error)
      }

      toast.success('Participation request rejected');
      return { success: true };
    } catch (error) {
      console.error('Failed to reject participation:', error);
      toast.error('Failed to reject participation');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Remove a participant from the event
   */
  const removeParticipant = async (
    participationId: string,
    userId?: string,
    senderId?: string,
    eventTitle?: string
  ) => {
    setIsLoading(true);
    try {
      await leaveEvent({
        id: participationId,
      });

      if (userId && senderId && eventTitle) {
        sendNotificationFn({ data: { helper: 'notifyParticipationRemoved', params: { senderId, recipientId: userId, eventId, eventTitle } } }).catch(console.error)
      }

      toast.success('Participant removed successfully');
      return { success: true };
    } catch (error) {
      console.error('Failed to remove participant:', error);
      toast.error('Failed to remove participant');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Change a participant's role
   */
  const changeParticipantRole = async (
    participationId: string,
    roleId: string,
    userId?: string,
    senderId?: string,
    eventTitle?: string,
    isPromotion?: boolean
  ) => {
    setIsLoading(true);
    try {
      await updateParticipant({
        id: participationId,
        role_id: roleId,
      });

      if (isPromotion && userId && senderId && eventTitle) {
        sendNotificationFn({ data: { helper: 'notifyOrganizerPromoted', params: { senderId, recipientId: userId, eventId, eventTitle } } }).catch(console.error)
      }

      toast.success('Participant role updated');
      return { success: true };
    } catch (error) {
      console.error('Failed to change participant role:', error);
      toast.error('Failed to change participant role');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update event details
   */
  const updateEvent = async (
    updates: any,
    options?: {
      actorId?: string;
      eventTitle?: string;
      visibility?: string;
      previousImageURL?: string;
      previousVideoURL?: string;
    }
  ) => {
    setIsLoading(true);
    try {
      await doUpdateEvent({
        id: eventId,
        ...updates,
      });

      if (options?.actorId && options?.eventTitle) {
        sendNotificationFn({ data: { helper: 'notifyScheduleChanged', params: { senderId: options.actorId, eventId, eventTitle: options.eventTitle } } }).catch(console.error)
      }

      toast.success('Event updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Failed to update event:', error);
      toast.error('Failed to update event');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    inviteParticipants,
    approveParticipation,
    rejectParticipation,
    removeParticipant,
    changeParticipantRole,
    updateEvent,
    isLoading,
  };
}
