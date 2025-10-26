import { useState } from 'react';
import db, { tx } from '../../../../db';
import { useAuthStore } from '@/features/auth/auth';

export type ParticipationStatus = 'invited' | 'requested' | 'member' | 'admin';

export function useEventParticipation(eventId: string) {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  // Query current user's participation status
  const { data, isLoading: queryLoading } = db.useQuery(
    user?.id
      ? {
          eventParticipants: {
            $: {
              where: {
                'user.id': user.id,
                'event.id': eventId,
              },
            },
          },
        }
      : { eventParticipants: {} }
  );

  // Query all participants for participant count (including both members and admins)
  const { data: allParticipantsData } = db.useQuery({
    eventParticipants: {
      $: {
        where: {
          'event.id': eventId,
        },
      },
    },
  });

  const participation = data?.eventParticipants?.[0];

  // Filter to count only members and admins (excluding invited and requested)
  const allParticipants = allParticipantsData?.eventParticipants || [];
  const filteredParticipants = allParticipants.filter(
    (p: any) => p.status === 'member' || p.status === 'admin'
  );
  const participantCount = filteredParticipants.length;

  const status: ParticipationStatus | null = (participation?.status as ParticipationStatus) || null;
  const isParticipant = status === 'member' || status === 'admin';
  const isAdmin = status === 'admin';
  const hasRequested = status === 'requested';
  const isInvited = status === 'invited';

  // Request to participate in the event
  const requestParticipation = async () => {
    if (!user?.id || participation) return;

    setIsLoading(true);
    try {
      const newParticipationId = crypto.randomUUID();
      await db.transact([
        tx.eventParticipants[newParticipationId]
          .update({
            createdAt: new Date().toISOString(),
            role: 'participant',
            status: 'requested',
          })
          .link({
            user: user.id,
            event: eventId,
          }),
      ]);
    } catch (error) {
      console.error('Failed to request participation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Leave the event
  const leaveEvent = async () => {
    if (!participation?.id) return;

    setIsLoading(true);
    try {
      await db.transact([tx.eventParticipants[participation.id].delete()]);
    } catch (error) {
      console.error('Failed to leave event:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Accept invitation
  const acceptInvitation = async () => {
    if (!participation?.id || status !== 'invited') return;

    setIsLoading(true);
    try {
      await db.transact([
        tx.eventParticipants[participation.id].update({
          status: 'member',
        }),
      ]);
    } catch (error) {
      console.error('Failed to accept invitation:', error);
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
  };
}
