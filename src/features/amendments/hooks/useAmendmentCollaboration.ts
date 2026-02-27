import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';
import { useAmendmentActions } from '@/zero/amendments/useAmendmentActions';
import { useAmendmentState } from '@/zero/amendments/useAmendmentState';

export type CollaborationStatus = 'invited' | 'requested' | 'member' | 'admin';

export function useAmendmentCollaboration(amendmentId: string) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { requestCollaboration: addCollaboratorAction, leaveCollaboration: removeCollaboratorAction, acceptInvitation: acceptInvitationAction } = useAmendmentActions();

  const {
    collaboration,
    status,
    isCollaborator,
    isAdmin,
    hasRequested,
    isInvited,
    collaboratorCount,
    isLoading: queryLoading,
  } = useAmendmentState({
    amendmentId,
    userId: user?.id,
  });

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
      const newCollaborationId = crypto.randomUUID();

      await addCollaboratorAction({
        id: newCollaborationId,
        status: 'requested',
        user_id: user.id,
        amendment_id: amendmentId,
        role_id: null,
        visibility: '',
      });

      // Send notification to amendment admins
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
      await removeCollaboratorAction(collaboration.id);
      if (status === 'requested') {
      } else {
      }
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
      await acceptInvitationAction(collaboration.id);
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
