import { useState } from 'react';
import db, { tx, id } from '../../../../db/db';
import { toast } from 'sonner';
import {
  notifyEventInvite,
  notifyParticipationApproved,
  notifyParticipationRejected,
  notifyParticipationRemoved,
  notifyOrganizerPromoted,
} from '@/utils/notification-helpers';
import { createTimelineEvent } from '@/features/timeline/utils/createTimelineEvent';

/**
 * Hook for event mutations
 */
export function useEventMutations(eventId: string) {
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
      const transactions: any[] = [];

      userIds.forEach(userId => {
        const participantId = id();
        const participantTx = tx.eventParticipants[participantId].update({
          status: 'invited',
          createdAt: new Date().toISOString(),
        });

        participantTx.link({
          user: userId,
          event: eventId,
        });

        if (roleId) {
          participantTx.link({ role: roleId });
        }

        transactions.push(participantTx);

        // Send notification
        if (senderId && eventTitle) {
          const notificationTxs = notifyEventInvite({
            senderId,
            recipientUserId: userId,
            eventId,
            eventTitle,
          });
          transactions.push(...notificationTxs);
        }
      });

      await db.transact(transactions);
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
      const transactions: any[] = [
        tx.eventParticipants[participationId].update({
          status: 'member',
        }),
      ];

      // Send notification
      if (userId && senderId && eventTitle) {
        const notificationTxs = notifyParticipationApproved({
          senderId,
          recipientUserId: userId,
          eventId,
          eventTitle,
        });
        transactions.push(...notificationTxs);
      }

      await db.transact(transactions);
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
      const transactions: any[] = [tx.eventParticipants[participationId].delete()];

      // Send notification
      if (userId && senderId && eventTitle) {
        const notificationTxs = notifyParticipationRejected({
          senderId,
          recipientUserId: userId,
          eventId,
          eventTitle,
        });
        transactions.push(...notificationTxs);
      }

      await db.transact(transactions);
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
      const transactions: any[] = [tx.eventParticipants[participationId].delete()];

      // Send notification
      if (userId && senderId && eventTitle) {
        const notificationTxs = notifyParticipationRemoved({
          senderId,
          recipientUserId: userId,
          eventId,
          eventTitle,
        });
        transactions.push(...notificationTxs);
      }

      await db.transact(transactions);
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
      const transactions: any[] = [tx.eventParticipants[participationId].link({ role: roleId })];

      // Send notification if it's an organizer promotion
      if (isPromotion && userId && senderId && eventTitle) {
        const notificationTxs = notifyOrganizerPromoted({
          senderId,
          recipientUserId: userId,
          eventId,
          eventTitle,
        });
        transactions.push(...notificationTxs);
      }

      await db.transact(transactions);
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
    }
  ) => {
    setIsLoading(true);
    try {
      const transactions: any[] = [
        tx.events[eventId].update({
          ...updates,
          updatedAt: new Date().toISOString(),
        }),
      ];

      // Add timeline event for public events
      if (options?.visibility === 'public' && options?.actorId) {
        transactions.push(
          createTimelineEvent({
            eventType: 'updated',
            entityType: 'event',
            entityId: eventId,
            actorId: options.actorId,
            title: `${options.eventTitle || 'Event'} was updated`,
            description: 'Event details have been updated',
          })
        );
      }

      await db.transact(transactions);
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
