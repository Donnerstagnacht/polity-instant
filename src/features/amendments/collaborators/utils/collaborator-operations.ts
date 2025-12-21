/**
 * Operations for managing collaborators, roles, and permissions
 */

import db, { tx, id as generateId } from '../../../../../db/db';
import { toast } from 'sonner';

/**
 * Invite users as collaborators
 */
export async function inviteUsers(
  userIds: string[],
  amendmentId: string,
  collaboratorRoleId: string
): Promise<void> {
  const inviteTransactions = userIds.map(userId => {
    const collaboratorId = generateId();
    return tx.amendmentCollaborators[collaboratorId]
      .update({
        status: 'invited',
        createdAt: Date.now(),
      })
      .link({ user: userId, amendment: amendmentId, role: collaboratorRoleId });
  });

  await db.transact(inviteTransactions);
}

/**
 * Change collaborator role
 */
export async function changeCollaboratorRole(
  collaboratorId: string,
  newRoleId: string
): Promise<void> {
  await db.transact([
    tx.amendmentCollaborators[collaboratorId].link({
      role: newRoleId,
    }),
  ]);
}

/**
 * Change collaborator status
 */
export async function changeCollaboratorStatus(
  collaboratorId: string,
  newStatus: string
): Promise<void> {
  await db.transact([
    tx.amendmentCollaborators[collaboratorId].update({
      status: newStatus,
    }),
  ]);
}

/**
 * Remove collaborator
 */
export async function removeCollaborator(collaboratorId: string): Promise<void> {
  await db.transact([tx.amendmentCollaborators[collaboratorId].delete()]);
}

/**
 * Approve collaboration request
 */
export async function approveRequest(collaboratorId: string): Promise<void> {
  await changeCollaboratorStatus(collaboratorId, 'member');
}

/**
 * Reject collaboration request (removes collaborator)
 */
export async function rejectRequest(collaboratorId: string): Promise<void> {
  await removeCollaborator(collaboratorId);
}

/**
 * Promote collaborator to admin
 */
export async function promoteToAdmin(collaboratorId: string, roles: any[]): Promise<void> {
  const authorRole = roles.find(r => r.name === 'Author');
  if (authorRole) {
    await changeCollaboratorRole(collaboratorId, authorRole.id);
  }
}

/**
 * Demote admin to regular collaborator
 */
export async function demoteToMember(collaboratorId: string, roles: any[]): Promise<void> {
  const collaboratorRole = roles.find(r => r.name === 'Collaborator');
  if (collaboratorRole) {
    await changeCollaboratorRole(collaboratorId, collaboratorRole.id);
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
  await db.transact([
    db.tx.roles[generateId()]
      .update({
        name,
        description: description || '',
        scope: 'amendment',
      })
      .link({
        amendment: amendmentId,
      }),
  ]);
}

/**
 * Remove a role
 */
export async function removeRole(roleId: string): Promise<void> {
  await db.transact([db.tx.roles[roleId].delete()]);
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
    // Find and remove the action right
    const role = roles.find(r => r.id === roleId);
    const actionRight = role?.actionRights?.find(
      (ar: any) => ar.resource === resource && ar.action === action
    );

    if (actionRight) {
      await db.transact([db.tx.actionRights[actionRight.id].unlink({ roles: roleId })]);
    }
  } else {
    // Create new action right and link to role
    const actionRightId = generateId();
    const role = roles.find(r => r.id === roleId);

    // Determine which ID field to use based on role scope
    const updateData: any = { resource, action };
    if (role?.scope === 'amendment') {
      updateData.amendmentId = amendmentId;
    }

    await db.transact([
      db.tx.actionRights[actionRightId].update(updateData).link({ roles: roleId }),
    ]);
  }
}
