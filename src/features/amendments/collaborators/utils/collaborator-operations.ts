/**
 * Operations for managing collaborators, roles, and permissions
 */

import { createClient } from '@/lib/supabase/client';
import {
  notifyCollaborationInvite,
  notifyCollaborationApproved,
  notifyCollaborationRejected,
  notifyCollaborationRemoved,
  notifyCollaborationRoleChanged,
} from '@/features/shared/utils/notification-helpers';

const supabase = createClient();

/**
 * Invite users as collaborators
 */
export async function inviteUsers(
  userIds: string[],
  amendmentId: string,
  collaboratorRoleId: string,
  senderId?: string,
  amendmentTitle?: string
): Promise<void> {
  for (const userId of userIds) {
    const collaboratorId = crypto.randomUUID();
    await supabase.from('amendment_collaborator').insert({
      id: collaboratorId,
      status: 'invited',
      created_at: new Date().toISOString(),
      user_id: userId,
      amendment_id: amendmentId,
      role_id: collaboratorRoleId,
    });

    if (senderId && amendmentTitle) {
      await notifyCollaborationInvite({
        senderId,
        recipientUserId: userId,
        amendmentId,
        amendmentTitle,
      });
    }
  }
}

/**
 * Change collaborator role
 */
export async function changeCollaboratorRole(
  collaboratorId: string,
  newRoleId: string
): Promise<void> {
  await supabase
    .from('amendment_collaborator')
    .update({
      role_id: newRoleId,
    })
    .eq('id', collaboratorId);
}

/**
 * Change collaborator status
 */
export async function changeCollaboratorStatus(
  collaboratorId: string,
  newStatus: string
): Promise<void> {
  await supabase
    .from('amendment_collaborator')
    .update({
      status: newStatus,
    })
    .eq('id', collaboratorId);
}

/**
 * Remove collaborator
 */
export async function removeCollaborator(
  collaboratorId: string,
  userId?: string,
  senderId?: string,
  amendmentId?: string,
  amendmentTitle?: string
): Promise<void> {
  await supabase.from('amendment_collaborator').delete().eq('id', collaboratorId);

  if (userId && senderId && amendmentId && amendmentTitle) {
    await notifyCollaborationRemoved({
      senderId,
      recipientUserId: userId,
      amendmentId,
      amendmentTitle,
    });
  }
}

/**
 * Approve collaboration request
 */
export async function approveRequest(
  collaboratorId: string,
  userId?: string,
  senderId?: string,
  amendmentId?: string,
  amendmentTitle?: string
): Promise<void> {
  await supabase
    .from('amendment_collaborator')
    .update({
      status: 'member',
    })
    .eq('id', collaboratorId);

  if (userId && senderId && amendmentId && amendmentTitle) {
    await notifyCollaborationApproved({
      senderId,
      recipientUserId: userId,
      amendmentId,
      amendmentTitle,
    });
  }
}

/**
 * Reject collaboration request (removes collaborator)
 */
export async function rejectRequest(
  collaboratorId: string,
  userId?: string,
  senderId?: string,
  amendmentId?: string,
  amendmentTitle?: string
): Promise<void> {
  await supabase.from('amendment_collaborator').delete().eq('id', collaboratorId);

  if (userId && senderId && amendmentId && amendmentTitle) {
    await notifyCollaborationRejected({
      senderId,
      recipientUserId: userId,
      amendmentId,
      amendmentTitle,
    });
  }
}

/**
 * Promote collaborator to admin
 */
export async function promoteToAdmin(
  collaboratorId: string,
  roles: any[],
  userId?: string,
  senderId?: string,
  amendmentId?: string,
  amendmentTitle?: string
): Promise<void> {
  const authorRole = roles.find(r => r.name === 'Author');
  if (authorRole) {
    await supabase
      .from('amendment_collaborator')
      .update({
        role_id: authorRole.id,
      })
      .eq('id', collaboratorId);

    if (userId && senderId && amendmentId && amendmentTitle) {
      await notifyCollaborationRoleChanged({
        senderId,
        recipientUserId: userId,
        amendmentId,
        amendmentTitle,
        newRole: 'Author',
      });
    }
  }
}

/**
 * Demote admin to regular collaborator
 */
export async function demoteToMember(
  collaboratorId: string,
  roles: any[],
  userId?: string,
  senderId?: string,
  amendmentId?: string,
  amendmentTitle?: string
): Promise<void> {
  const collaboratorRole = roles.find(r => r.name === 'Collaborator');
  if (collaboratorRole) {
    await supabase
      .from('amendment_collaborator')
      .update({
        role_id: collaboratorRole.id,
      })
      .eq('id', collaboratorId);

    if (userId && senderId && amendmentId && amendmentTitle) {
      await notifyCollaborationRoleChanged({
        senderId,
        recipientUserId: userId,
        amendmentId,
        amendmentTitle,
        newRole: 'Collaborator',
      });
    }
  }
}

/**
 * Withdraw invitation (removes collaborator)
 */
export async function withdrawInvitation(collaboratorId: string): Promise<void> {
  await removeCollaborator(collaboratorId);
}

/**
 * Create a new role
 */
export async function createRole(
  name: string,
  description: string,
  amendmentId: string
): Promise<void> {
  const roleId = crypto.randomUUID();
  await supabase.from('role').insert({
    id: roleId,
    name,
    description: description || '',
    scope: 'amendment',
    amendment_id: amendmentId,
  });
}

/**
 * Remove a role
 */
export async function removeRole(roleId: string): Promise<void> {
  await supabase.from('role').delete().eq('id', roleId);
}

/**
 * Toggle action right for a role
 */
export async function toggleActionRight(
  roleId: string,
  resource: string,
  action: string,
  currentlyHas: boolean,
  roles: any[],
  amendmentId: string
): Promise<void> {
  if (currentlyHas) {
    const role = roles.find(r => r.id === roleId);
    const actionRight = role?.actionRights?.find(
      (ar: any) => ar.resource === resource && ar.action === action
    );

    if (actionRight) {
      await supabase.from('action_right').delete().eq('id', actionRight.id);
    }
  } else {
    const actionRightId = crypto.randomUUID();
    const role = roles.find(r => r.id === roleId);

    const insertData: any = {
      id: actionRightId,
      resource,
      action,
      role_id: roleId,
    };
    if (role?.scope === 'amendment') {
      insertData.amendment_id = amendmentId;
    }

    await supabase.from('action_right').insert(insertData);
  }
}
