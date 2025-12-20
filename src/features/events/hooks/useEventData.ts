import { useMemo } from 'react';
import db from '../../../../db/db';

/**
 * Hook to query event data with all related entities
 */
export function useEventData(eventId?: string) {
  const { data, isLoading, error } = db.useQuery(
    eventId
      ? {
          events: {
            $: { where: { id: eventId } },
            organizer: {},
            group: {
              memberships: {
                user: {},
              },
              roles: {
                actionRights: {},
              },
            },
            participants: {
              user: {},
              role: {},
            },
            delegates: {
              user: {},
            },
            agendaItems: {
              election: {},
            },
            eventPositions: {},
          },
        }
      : null
  );

  const event = useMemo(() => data?.events?.[0] || null, [data]);
  const participants = useMemo(() => event?.participants || [], [event]);
  const delegates = useMemo(() => event?.delegates || [], [event]);
  const agendaItems = useMemo(() => event?.agendaItems || [], [event]);
  const positions = useMemo(() => event?.eventPositions || [], [event]);

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
  const { data, isLoading } = db.useQuery(
    eventId
      ? {
          eventParticipants: {
            $: {
              where: {
                'event.id': eventId,
              },
            },
            user: {},
            role: {},
          },
        }
      : null
  );

  const participants = useMemo(() => data?.eventParticipants || [], [data]);

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
  const { data, isLoading } = db.useQuery(
    eventId
      ? {
          agendaItems: {
            $: {
              where: {
                'event.id': eventId,
              },
            },
            election: {
              candidates: {},
            },
            amendment: {},
          },
        }
      : null
  );

  const agendaItems = useMemo(() => data?.agendaItems || [], [data]);

  return {
    agendaItems,
    isLoading,
  };
}
