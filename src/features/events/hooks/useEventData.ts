import { useMemo } from 'react';
import {
  useEventById,
  useEventParticipantsQuery,
  useEventAgenda as useEventAgendaQuery,
} from '@/zero/events/useEventState';

/**
 * Hook to query event data with all related entities
 */
export function useEventData(eventId?: string) {
  const { event, isLoading } = useEventById(eventId);
  const error = undefined;

  const participants = useMemo(() => event?.participants || [], [event]);
  const delegates = useMemo(() => event?.delegates || [], [event]);
  const agendaItems = useMemo(() => event?.agenda_items || [], [event]);
  const positions = useMemo(() => event?.event_positions || [], [event]);

  const participantStats = useMemo(() => {
    const stats = {
      total: participants.length,
      members: 0,
      admins: 0,
      invited: 0,
      requested: 0,
    };

    participants.forEach((participant: any) => {
      if (participant.status === 'member') stats.members++;
      if (participant.status === 'admin') stats.admins++;
      if (participant.status === 'invited') stats.invited++;
      if (participant.status === 'requested') stats.requested++;
    });

    return stats;
  }, [participants]);

  return {
    event,
    participants,
    delegates,
    agendaItems,
    positions,
    participantStats,
    isLoading,
    error,
  };
}

/**
 * Hook to query event participants with filtering
 */
export function useEventParticipants(eventId?: string) {
  const { participants: eventParticipants, isLoading } = useEventParticipantsQuery(eventId);

  const participants = useMemo(() => eventParticipants || [], [eventParticipants]);

  const { activeParticipants, invitedParticipants, requestedParticipants } = useMemo(() => {
    const active: any[] = [];
    const invited: any[] = [];
    const requested: any[] = [];

    participants.forEach((participant: any) => {
      if (participant.status === 'member' || participant.status === 'admin') {
        active.push(participant);
      } else if (participant.status === 'invited') {
        invited.push(participant);
      } else if (participant.status === 'requested') {
        requested.push(participant);
      }
    });

    return {
      activeParticipants: active,
      invitedParticipants: invited,
      requestedParticipants: requested,
    };
  }, [participants]);

  return {
    participants,
    activeParticipants,
    invitedParticipants,
    requestedParticipants,
    isLoading,
  };
}

/**
 * Hook to query event agenda items
 */
export function useEventAgenda(eventId?: string) {
  const { agendaItems, isLoading } = useEventAgendaQuery(eventId);

  return {
    agendaItems,
    isLoading,
  };
}
