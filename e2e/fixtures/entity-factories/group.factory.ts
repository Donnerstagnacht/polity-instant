/**
 * Group Factory
 *
 * Creates groups with roles, action rights, and memberships for E2E tests.
 */

import { FactoryBase } from './factory-base';
import { adminTransact, tx } from '../admin-db';
import { DEFAULT_GROUP_ROLES } from '../../../db/rbac/constants';

export interface CreateGroupOptions {
  id?: string;
  name?: string;
  description?: string;
  isPublic?: boolean;
  visibility?: string;
  location?: string;
  imageURL?: string;
}

export interface CreatedGroup {
  id: string;
  name: string;
  adminRoleId: string;
  memberRoleId: string;
}

export interface AddMemberOptions {
  status?: 'member' | 'invited' | 'requested';
  roleType?: 'admin' | 'member';
  visibility?: string;
}

export class GroupFactory extends FactoryBase {
  private _counter = 0;

  /**
   * Create a group with Admin + Member roles, action rights, and owner membership.
   */
  async createGroup(ownerId: string, overrides: CreateGroupOptions = {}): Promise<CreatedGroup> {
    this._counter++;
    const groupId = overrides.id ?? this.generateId();
    const name = overrides.name ?? `E2E Group ${this._counter}`;
    const now = new Date();

    const adminRoleId = this.generateId();
    const memberRoleId = this.generateId();

    const txns: any[] = [];

    // Create group entity
    txns.push(
      tx.groups[groupId]
        .update({
          name,
          description: overrides.description ?? `Test group ${this._counter}`,
          isPublic: overrides.isPublic ?? true,
          memberCount: 1,
          visibility: overrides.visibility ?? 'public',
          location: overrides.location ?? '',
          imageURL: overrides.imageURL ?? '',
          createdAt: now,
          updatedAt: now,
        })
        .link({ owner: ownerId })
    );
    this.trackEntity('groups', groupId);
    this.trackLink('groups', groupId, 'owner', ownerId);

    // Create Admin role
    const adminTemplate = DEFAULT_GROUP_ROLES.find(r => r.name === 'Admin');
    txns.push(
      tx.roles[adminRoleId]
        .update({
          name: 'Admin',
          description: 'Full group control',
          scope: 'group',
          createdAt: now,
          updatedAt: now,
        })
        .link({ group: groupId })
    );
    this.trackEntity('roles', adminRoleId);
    this.trackLink('roles', adminRoleId, 'group', groupId);

    // Create Member role
    txns.push(
      tx.roles[memberRoleId]
        .update({
          name: 'Member',
          description: 'Standard member access',
          scope: 'group',
          createdAt: now,
          updatedAt: now,
        })
        .link({ group: groupId })
    );
    this.trackEntity('roles', memberRoleId);
    this.trackLink('roles', memberRoleId, 'group', groupId);

    // Create action rights for Admin role
    if (adminTemplate) {
      for (const perm of adminTemplate.permissions) {
        const rightId = this.generateId();
        txns.push(
          tx.actionRights[rightId]
            .update({ resource: perm.resource, action: perm.action })
            .link({ roles: adminRoleId, group: groupId })
        );
        this.trackEntity('actionRights', rightId);
      }
    }

    // Create action rights for Member role
    const memberTemplate = DEFAULT_GROUP_ROLES.find(r => r.name === 'Member');
    if (memberTemplate) {
      for (const perm of memberTemplate.permissions) {
        const rightId = this.generateId();
        txns.push(
          tx.actionRights[rightId]
            .update({ resource: perm.resource, action: perm.action })
            .link({ roles: memberRoleId, group: groupId })
        );
        this.trackEntity('actionRights', rightId);
      }
    }

    // Create owner membership (Admin role)
    const ownerMembershipId = this.generateId();
    txns.push(
      tx.groupMemberships[ownerMembershipId]
        .update({
          status: 'member',
          createdAt: now,
          visibility: 'public',
        })
        .link({ user: ownerId, group: groupId, role: adminRoleId })
    );
    this.trackEntity('groupMemberships', ownerMembershipId);

    await adminTransact(txns);

    return { id: groupId, name, adminRoleId, memberRoleId };
  }

  /**
   * Add a member to an existing group.
   */
  async addMember(
    groupId: string,
    userId: string,
    roleId: string,
    options: AddMemberOptions = {}
  ): Promise<string> {
    const membershipId = this.generateId();
    const now = new Date();

    await adminTransact([
      tx.groupMemberships[membershipId]
        .update({
          status: options.status ?? 'member',
          createdAt: now,
          visibility: options.visibility ?? 'public',
        })
        .link({ user: userId, group: groupId, role: roleId }),
    ]);

    this.trackEntity('groupMemberships', membershipId);
    return membershipId;
  }

  /**
   * Create a group conversation with participants.
   */
  async createGroupConversation(
    groupId: string,
    groupName: string,
    memberIds: string[],
    requestedById: string
  ): Promise<string> {
    const conversationId = this.generateId();
    const now = new Date();
    const txns: any[] = [];

    txns.push(
      tx.conversations[conversationId]
        .update({
          type: 'group',
          name: groupName,
          status: 'accepted',
          createdAt: now,
          lastMessageAt: now,
        })
        .link({ group: groupId, requestedBy: requestedById })
    );
    this.trackEntity('conversations', conversationId);

    for (const memberId of memberIds) {
      const participantId = this.generateId();
      txns.push(
        tx.conversationParticipants[participantId]
          .update({ joinedAt: now, lastReadAt: now })
          .link({ conversation: conversationId, user: memberId })
      );
      this.trackEntity('conversationParticipants', participantId);
    }

    await adminTransact(txns);
    return conversationId;
  }
}
