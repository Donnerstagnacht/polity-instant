import { useState } from 'react';
import db, { tx } from '../../../../db';
import { useAuthStore } from '@/features/auth/auth';

export type CollaborationStatus = 'invited' | 'requested' | 'member' | 'admin';

export function useAmendmentCollaboration(amendmentId: string) {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  // Query current user's collaboration status
  const { data, isLoading: queryLoading } = db.useQuery(
    user?.id
      ? {
          amendmentCollaborators: {
            $: {
              where: {
                'user.id': user.id,
                'amendment.id': amendmentId,
              },
            },
          },
        }
      : { amendmentCollaborators: {} }
  );

  // Query all collaborators for collaborator count (including both members and admins)
  const { data: allCollaboratorsData } = db.useQuery({
    amendmentCollaborators: {
      $: {
        where: {
          'amendment.id': amendmentId,
        },
      },
    },
  });

  const collaboration = data?.amendmentCollaborators?.[0];
  // Filter to count only members and admins (excluding invited and requested)
  const collaboratorCount =
    allCollaboratorsData?.amendmentCollaborators?.filter(
      (c: any) => c.status === 'member' || c.status === 'admin'
    ).length || 0;
  const status: CollaborationStatus | null = (collaboration?.status as CollaborationStatus) || null;
  const isCollaborator = status === 'member' || status === 'admin';
  const isAdmin = status === 'admin';
  const hasRequested = status === 'requested';
  const isInvited = status === 'invited';

  // Request to collaborate on the amendment
  const requestCollaboration = async () => {
    if (!user?.id || collaboration) return;

    setIsLoading(true);
    try {
      const newCollaborationId = crypto.randomUUID();
      await db.transact([
        tx.amendmentCollaborators[newCollaborationId]
          .update({
            createdAt: new Date().toISOString(),
            role: 'collaborator',
            status: 'requested',
          })
          .link({
            user: user.id,
            amendment: amendmentId,
          }),
      ]);
    } catch (error) {
      console.error('Failed to request collaboration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Leave the amendment collaboration
  const leaveCollaboration = async () => {
    if (!collaboration?.id) return;

    setIsLoading(true);
    try {
      await db.transact([tx.amendmentCollaborators[collaboration.id].delete()]);
    } catch (error) {
      console.error('Failed to leave collaboration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Accept invitation
  const acceptInvitation = async () => {
    if (!collaboration?.id || status !== 'invited') return;

    setIsLoading(true);
    try {
      await db.transact([
        tx.amendmentCollaborators[collaboration.id].update({
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
    collaboration,
    status,
    isCollaborator,
    isAdmin,
    hasRequested,
    isInvited,
    collaboratorCount,
    isLoading: queryLoading || isLoading,
    requestCollaboration,
    leaveCollaboration,
    acceptInvitation,
  };
}
