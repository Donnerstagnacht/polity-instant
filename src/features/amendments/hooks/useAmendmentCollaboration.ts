import { useState } from 'react';
import db, { tx, id } from '../../../../db/db';
import { useAuthStore } from '@/features/auth/auth';
import { toast } from 'sonner';

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

    // Validate amendmentId is a valid UUID
    if (!amendmentId || typeof amendmentId !== 'string') {
      console.error('Invalid amendmentId:', amendmentId);
      return;
    }

    setIsLoading(true);
    try {
      const newCollaborationId = id();
      await db.transact([
        tx.amendmentCollaborators[newCollaborationId]
          .update({
            createdAt: new Date().toISOString(),
            status: 'requested',
          })
          .link({
            user: user.id,
            amendment: amendmentId,
          }),
      ]);
      toast.success('Collaboration request sent successfully');
    } catch (error) {
      console.error('Failed to request collaboration:', error);
      console.error('Amendment ID:', amendmentId);
      console.error('User ID:', user?.id);
      toast.error('Failed to request collaboration. Please try again.');
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
      toast.success('Successfully left the collaboration');
    } catch (error) {
      console.error('Failed to leave collaboration:', error);
      toast.error('Failed to leave collaboration. Please try again.');
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
      toast.success('Successfully joined the collaboration');
    } catch (error) {
      console.error('Failed to accept invitation:', error);
      toast.error('Failed to accept invitation. Please try again.');
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
