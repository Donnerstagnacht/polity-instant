import { useCallback } from 'react';
import { useAmendmentActions } from '@/zero/amendments/useAmendmentActions';
import { useGroupActions } from '@/zero/groups/useGroupActions';
import type { Role } from '../hooks/useCollaborators';

/**
 * Orchestration hook that composes amendment + group action hooks
 * for collaborator management operations.
 *
 * Replaces direct Supabase calls in collaborator-operations.ts.
 * Server mutators handle notifications automatically.
 */
export function useCollaboratorMutations() {
  const {
    requestCollaboration,
    leaveCollaboration,
    updateCollaborator,
  } = useAmendmentActions();

  const {
    createRole: createGroupRole,
    deleteRole: deleteGroupRole,
    assignActionRight,
    removeActionRight,
  } = useGroupActions();

  const inviteUsers = useCallback(
    async (userIds: string[], amendmentId: string, roleId: string) => {
      for (const userId of userIds) {
        await requestCollaboration({
          id: crypto.randomUUID(),
          user_id: userId,
          amendment_id: amendmentId,
          role_id: roleId,
          status: 'invited',
          visibility: null,
        });
      }
    },
    [requestCollaboration]
  );

  const changeCollaboratorRole = useCallback(
    async (collaboratorId: string, newRoleId: string) => {
      await updateCollaborator({ id: collaboratorId, role_id: newRoleId });
    },
    [updateCollaborator]
  );

  const removeCollaborator = useCallback(
    async (collaboratorId: string) => {
      await leaveCollaboration(collaboratorId);
    },
    [leaveCollaboration]
  );

  const approveRequest = useCallback(
    async (collaboratorId: string) => {
      await updateCollaborator({ id: collaboratorId, status: 'member' });
    },
    [updateCollaborator]
  );

  const rejectRequest = useCallback(
    async (collaboratorId: string) => {
      await leaveCollaboration(collaboratorId);
    },
    [leaveCollaboration]
  );

  const withdrawInvitation = useCallback(
    async (collaboratorId: string) => {
      await leaveCollaboration(collaboratorId);
    },
    [leaveCollaboration]
  );

  const promoteToAdmin = useCallback(
    async (collaboratorId: string, roles: Role[]) => {
      const authorRole = roles.find(r => r.name === 'Author');
      if (authorRole) {
        await updateCollaborator({ id: collaboratorId, role_id: authorRole.id });
      }
    },
    [updateCollaborator]
  );

  const demoteToMember = useCallback(
    async (collaboratorId: string, roles: Role[]) => {
      const collaboratorRole = roles.find(r => r.name === 'Collaborator');
      if (collaboratorRole) {
        await updateCollaborator({ id: collaboratorId, role_id: collaboratorRole.id });
      }
    },
    [updateCollaborator]
  );

  const createRole = useCallback(
    async (name: string, description: string, amendmentId: string) => {
      await createGroupRole({
        id: crypto.randomUUID(),
        name,
        description: description || '',
        scope: 'amendment',
        amendment_id: amendmentId,
        group_id: null,
        event_id: null,
        blog_id: null,
        sort_order: 0,
      });
    },
    [createGroupRole]
  );

  const deleteRole = useCallback(
    async (roleId: string) => {
      await deleteGroupRole({ id: roleId });
    },
    [deleteGroupRole]
  );

  const toggleActionRight = useCallback(
    async (
      roleId: string,
      resource: string,
      action: string,
      currentlyHas: boolean,
      roles: Role[],
      amendmentId: string
    ) => {
      if (currentlyHas) {
        const role = roles.find(r => r.id === roleId);
        const ar = role?.action_rights?.find(
          a => a.resource === resource && a.action === action
        );
        if (ar) {
          await removeActionRight({ id: ar.id });
        }
      } else {
        const role = roles.find(r => r.id === roleId);
        await assignActionRight({
          id: crypto.randomUUID(),
          resource,
          action,
          role_id: roleId,
          amendment_id: role?.scope === 'amendment' ? amendmentId : null,
          group_id: null,
          event_id: null,
          blog_id: null,
        });
      }
    },
    [assignActionRight, removeActionRight]
  );

  return {
    inviteUsers,
    changeCollaboratorRole,
    removeCollaborator,
    approveRequest,
    rejectRequest,
    withdrawInvitation,
    promoteToAdmin,
    demoteToMember,
    createRole,
    deleteRole,
    toggleActionRight,
  };
}
