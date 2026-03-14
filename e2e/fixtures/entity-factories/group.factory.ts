/**
 * Group Factory
 *
 * Creates groups with roles, action rights, and memberships for E2E tests.
 */

import { FactoryBase } from './factory-base';
import { adminUpsert } from '../admin-db';
import { DEFAULT_GROUP_ROLES } from '../../../src/zero/rbac/constants';

export interface CreateGroupOptions {
  id?: string;
  name?: string;
  description?: string;
  isPublic?: boolean;
  visibility?: string;
  groupType?: 'base' | 'hierarchical';
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
  status?: 'active' | 'invited' | 'requested';
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
    const now = new Date().toISOString();

    const adminRoleId = this.generateId();
    const memberRoleId = this.generateId();

    // Create group entity
    await adminUpsert('group', {
      id: groupId,
      name,
      description: overrides.description ?? `Test group ${this._counter}`,
      is_public: overrides.isPublic ?? true,
      member_count: 1,
      visibility: overrides.visibility ?? 'public',
      group_type: overrides.groupType ?? 'base',
      location: overrides.location ?? '',
      owner_id: ownerId,
      created_at: now,
      updated_at: now,
    });
    this.trackEntity('group', groupId);

    // Create Admin role
    await adminUpsert('role', {
      id: adminRoleId,
      name: 'Admin',
      description: 'Full group control',
      scope: 'group',
      group_id: groupId,
      created_at: now,
    });
    this.trackEntity('role', adminRoleId);

    // Create Member role
    await adminUpsert('role', {
      id: memberRoleId,
      name: 'Member',
      description: 'Standard member access',
      scope: 'group',
      group_id: groupId,
      created_at: now,
    });
    this.trackEntity('role', memberRoleId);

    // Create action rights for Admin role
    const adminTemplate = DEFAULT_GROUP_ROLES.find(r => r.name === 'Admin');
    if (adminTemplate) {
      const rights = adminTemplate.permissions.map(perm => {
        const rightId = this.generateId();
        this.trackEntity('action_right', rightId);
        return {
          id: rightId,
          resource: perm.resource,
          action: perm.action,
          role_id: adminRoleId,
          group_id: groupId,
        };
      });
      await adminUpsert('action_right', rights);
    }

    // Create action rights for Member role
    const memberTemplate = DEFAULT_GROUP_ROLES.find(r => r.name === 'Member');
    if (memberTemplate) {
      const rights = memberTemplate.permissions.map(perm => {
        const rightId = this.generateId();
        this.trackEntity('action_right', rightId);
        return {
          id: rightId,
          resource: perm.resource,
          action: perm.action,
          role_id: memberRoleId,
          group_id: groupId,
        };
      });
      await adminUpsert('action_right', rights);
    }

    // Create owner membership (Admin role)
    const ownerMembershipId = this.generateId();
    await adminUpsert('group_membership', {
      id: ownerMembershipId,
      group_id: groupId,
      user_id: ownerId,
      role_id: adminRoleId,
      status: 'active',
      visibility: 'public',
      created_at: now,
    });
    this.trackEntity('group_membership', ownerMembershipId);

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
    const now = new Date().toISOString();

    await adminUpsert('group_membership', {
      id: membershipId,
      group_id: groupId,
      user_id: userId,
      role_id: roleId,
      status: options.status ?? 'active',
      visibility: options.visibility ?? 'public',
      created_at: now,
    });

    this.trackEntity('group_membership', membershipId);
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
    const now = new Date().toISOString();

    await adminUpsert('conversation', {
      id: conversationId,
      type: 'group',
      name: groupName,
      status: 'accepted',
      group_id: groupId,
      requested_by_id: requestedById,
      created_at: now,
      last_message_at: now,
    });
    this.trackEntity('conversation', conversationId);

    const participants = memberIds.map(memberId => {
      const participantId = this.generateId();
      this.trackEntity('conversation_participant', participantId);
      return {
        id: participantId,
        conversation_id: conversationId,
        user_id: memberId,
        joined_at: now,
        last_read_at: now,
      };
    });
    await adminUpsert('conversation_participant', participants);

    return conversationId;
  }
}
