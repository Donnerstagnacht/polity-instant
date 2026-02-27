import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';
import { useEventActions } from '@/zero/events/useEventActions';
import { useEventById, useEventParticipantsQuery } from '@/zero/events/useEventState';

export type ParticipationStatus = 'invited' | 'requested' | 'member' | 'admin' | 'confirmed';

export function useEventParticipation(eventId: string) {
  const { user } = useAuth();
  const { joinEvent, leaveEvent: doLeaveEvent, updateParticipant } = useEventActions();
  const [isLoading, setIsLoading] = useState(false);

  // Query event details including type and group
  const { event, isLoading: eventLoading } = useEventById(eventId);

  const eventType = event?.event_type;

  // Check if user is a member of the event's group
  const isGroupMember = (event as any)?.group?.memberships?.some(
    (m: any) => m.user?.id === user?.id && (m.status === 'member' || m.status === 'admin')
  );

  // Check if user is a confirmed delegate
  const isConfirmedDelegate = (event as any)?.delegates?.some(
    (d: any) => d.user?.id === user?.id && d.status === 'confirmed'
  );

  // Query participants
  const { participants: allParticipantsData, isLoading: participantsLoading } = useEventParticipantsQuery(eventId);

  const queryLoading = eventLoading || participantsLoading;

  const participation = allParticipantsData?.find((p: any) => p.user_id === user?.id);

  // Filter to count only active participants (excluding invited and requested)
  const allParticipants = allParticipantsData || [];
  const filteredParticipants = allParticipants.filter(
    (p: any) => p.status === 'member' || p.status === 'admin' || p.status === 'confirmed'
  );
  const participantCount = filteredParticipants.length;

  const status: ParticipationStatus | null = (participation?.status as ParticipationStatus) || null;
  const isParticipant = status === 'member' || status === 'admin' || status === 'confirmed';
  const isAdmin = status === 'admin';
  const hasRequested = status === 'requested';
  const isInvited = status === 'invited';

  // Request to participate in the event
  const requestParticipation = async () => {
    if (!user?.id || participation) return;

    // Validate eventId is a valid UUID
    if (!eventId || typeof eventId !== 'string') {
      console.error('Invalid eventId:', eventId);
      return;
    }

    // Check participation eligibility based on event type
    if (eventType === 'delegate_conference') {
      if (!isConfirmedDelegate) {
        toast.error('Only confirmed delegates can participate in this delegate conference');
        return;
      }
    } else if (eventType === 'general_assembly') {
      if (!isGroupMember) {
        toast.error('Only members of the associated group can participate in this general assembly');
        return;
      }
    }
    // For 'open_assembly' and 'other', anyone can request participation

    setIsLoading(true);
    try {
      const newParticipationId = crypto.randomUUID();

      await joinEvent({
        id: newParticipationId,
        status: 'requested',
        event_id: eventId,
        group_id: event?.group?.id || '',
        role_id: null,
        visibility: '',
      });


      toast.success('Participation request sent successfully');
    } catch (error) {
      console.error('Failed to request participation:', error);
      console.error('Event ID:', eventId);
      console.error('User ID:', user?.id);
      toast.error('Failed to request participation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Leave the event
  const leaveEvent = async () => {
    if (!participation?.id) return;

    setIsLoading(true);
    try {
      await doLeaveEvent({ id: participation.id });
      if (status === 'requested') {
      } else {
      }
      toast.success('Successfully left the event');
    } catch (error) {
      console.error('Failed to leave event:', error);
      toast.error('Failed to leave event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Accept invitation
  const acceptInvitation = async () => {
    if (!participation?.id || status !== 'invited') return;

    setIsLoading(true);
    try {
      await updateParticipant({
        id: participation.id,
        status: 'member',
      });
      toast.success('Successfully joined the event');
    } catch (error) {
      console.error('Failed to accept invitation:', error);
      toast.error('Failed to accept invitation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    participation,
    status,
    isParticipant,
    isAdmin,
    hasRequested,
    isInvited,
    participantCount,
    isLoading: queryLoading || isLoading,
    requestParticipation,
    leaveEvent,
    acceptInvitation,
    eventType,
    isGroupMember,
    isConfirmedDelegate,
    canParticipate:
      eventType === 'open_assembly' ||
      eventType === 'other' ||
      (eventType === 'delegate_conference' && isConfirmedDelegate) ||
      (eventType === 'general_assembly' && isGroupMember),
  };
}
