import { defineMutator } from '@rocicorp/zero';
import { can } from '../rbac/can';
import { zql } from '../schema';
import {
  groupCreateSchema,
  groupUpdateSchema,
  groupDeleteSchema,
  groupMembershipCreateSchema,
  groupMembershipUpdateSchema,
  groupMembershipDeleteSchema,
  roleCreateSchema,
  roleUpdateSchema,
  roleDeleteSchema,
  actionRightCreateSchema,
  actionRightDeleteSchema,
} from './schema';
import {
  createGroupRelationshipSchema,
  updateGroupRelationshipSchema,
  deleteGroupRelationshipSchema,
} from '../network/schema';
import {
  createPositionSchema,
  updatePositionSchema,
  deletePositionSchema,
  createPositionHolderHistorySchema,
  updatePositionHolderHistorySchema,
} from '../positions/schema';
import { z } from 'zod';

async function authorizeScopedRoleMutation(
  tx: Parameters<typeof can>[0],
  ctx: Parameters<typeof can>[1],
  scope: {
    group_id?: string | null;
    event_id?: string | null;
    blog_id?: string | null;
  }
) {
  if (scope.group_id) {
    await can(tx, ctx, { action: 'manage', resource: 'groupRoles', groupId: scope.group_id });
    return;
  }

  if (scope.event_id) {
    await can(tx, ctx, { action: 'manage', resource: 'events', eventId: scope.event_id });
    return;
  }

  if (scope.blog_id) {
    await can(tx, ctx, { action: 'manage', resource: 'blogs', blogId: scope.blog_id });
  }
}

/** Shared mutators — run on both client and server. Server mutators may override these. */
export const groupSharedMutators = {
  create: defineMutator(groupCreateSchema, async ({ tx, ctx: { userID }, args }) => {
    const now = Date.now();
    await tx.mutate.group.insert({
      ...args,
      owner_id: userID,
      member_count: 1,
      subscriber_count: 0,
      event_count: 0,
      amendment_count: 0,
      document_count: 0,
      created_at: now,
      updated_at: now,
    });
  }),

  update: defineMutator(groupUpdateSchema, async ({ tx, ctx, args }) => {
    await can(tx, ctx, { action: 'manage', resource: 'groups', groupId: args.id });
    await tx.mutate.group.update({ ...args, updated_at: Date.now() });
  }),

  delete: defineMutator(groupDeleteSchema, async ({ tx, ctx, args }) => {
    await can(tx, ctx, { action: 'manage', resource: 'groups', groupId: args.id });
    await tx.mutate.group.delete({ id: args.id });
  }),

  joinGroup: defineMutator(groupMembershipCreateSchema, async ({ tx, ctx: { userID }, args }) => {
    // Guard: cannot join hierarchical groups directly
    const group = await tx.run(zql.group.where('id', args.group_id).one());
    if (group?.group_type === 'hierarchical') {
      throw new Error('Cannot join hierarchical groups directly. Join a base subgroup instead.');
    }

    const now = Date.now();
    await tx.mutate.group_membership.insert({
      ...args,
      user_id: userID,
      source: 'direct',
      source_group_id: null,
      created_at: now,
    });
  }),

  leaveGroup: defineMutator(groupMembershipDeleteSchema, async ({ tx, args }) => {
    // Guard: cannot leave derived memberships directly
    const membership = await tx.run(zql.group_membership.where('id', args.id).one());
    if (membership?.source === 'derived') {
      throw new Error('Cannot leave a derived membership. Leave the base group instead.');
    }
    await tx.mutate.group_membership.delete({ id: args.id });
  }),

  inviteMember: defineMutator(groupMembershipCreateSchema, async ({ tx, ctx, args }) => {
    await can(tx, ctx, { action: 'manage', resource: 'groupMemberships', groupId: args.group_id });
    if (!args.user_id) throw new Error('user_id is required for inviteMember');

    // Guard: cannot invite to hierarchical groups
    const group = await tx.run(zql.group.where('id', args.group_id).one());
    if (group?.group_type === 'hierarchical') {
      throw new Error('Cannot invite to hierarchical groups. Add members to base subgroups.');
    }

    const now = Date.now();
    await tx.mutate.group_membership.insert({
      ...args,
      user_id: args.user_id,
      status: 'invited',
      source: 'direct',
      source_group_id: null,
      created_at: now,
    });
  }),

  acceptInvitation: defineMutator(z.object({ id: z.string() }), async ({ tx, args }) => {
    await tx.mutate.group_membership.update({ id: args.id, status: 'active' });
  }),

  updateMemberRole: defineMutator(groupMembershipUpdateSchema, async ({ tx, args }) => {
    await tx.mutate.group_membership.update(args);
  }),

  createRole: defineMutator(roleCreateSchema, async ({ tx, ctx, args }) => {
    await authorizeScopedRoleMutation(tx, ctx, args);
    const now = Date.now();
    await tx.mutate.role.insert({ ...args, created_at: now });
  }),

  updateRole: defineMutator(roleUpdateSchema, async ({ tx, ctx, args }) => {
    const role = await tx.run(zql.role.where('id', args.id).one());
    if (role) {
      await authorizeScopedRoleMutation(tx, ctx, role);
    }
    await tx.mutate.role.update(args);
  }),

  deleteRole: defineMutator(roleDeleteSchema, async ({ tx, ctx, args }) => {
    const role = await tx.run(zql.role.where('id', args.id).one());
    if (role) {
      await authorizeScopedRoleMutation(tx, ctx, role);
    }
    await tx.mutate.role.delete({ id: args.id });
  }),

  assignActionRight: defineMutator(actionRightCreateSchema, async ({ tx, ctx, args }) => {
    await authorizeScopedRoleMutation(tx, ctx, args);
    const now = Date.now();
    await tx.mutate.action_right.insert({ ...args, created_at: now });
  }),

  removeActionRight: defineMutator(actionRightDeleteSchema, async ({ tx, ctx, args }) => {
    const actionRight = await tx.run(zql.action_right.where('id', args.id).one());
    if (actionRight) {
      await authorizeScopedRoleMutation(tx, ctx, actionRight);
    }
    await tx.mutate.action_right.delete({ id: args.id });
  }),

  // Group Relationship mutators
  createRelationship: defineMutator(createGroupRelationshipSchema, async ({ tx, args }) => {
    const now = Date.now();
    await tx.mutate.group_relationship.insert({ ...args, created_at: now });
  }),

  updateRelationship: defineMutator(updateGroupRelationshipSchema, async ({ tx, args }) => {
    await tx.mutate.group_relationship.update(args);
  }),

  deleteRelationship: defineMutator(deleteGroupRelationshipSchema, async ({ tx, args }) => {
    await tx.mutate.group_relationship.delete({ id: args.id });
  }),

  // Position mutators
  createPosition: defineMutator(createPositionSchema, async ({ tx, args }) => {
    const now = Date.now();
    await tx.mutate.position.insert({ ...args, created_at: now });
  }),

  updatePosition: defineMutator(updatePositionSchema, async ({ tx, args }) => {
    await tx.mutate.position.update(args);
  }),

  deletePosition: defineMutator(deletePositionSchema, async ({ tx, args }) => {
    await tx.mutate.position.delete({ id: args.id });
  }),

  // Position Holder History mutators
  createPositionHolderHistory: defineMutator(
    createPositionHolderHistorySchema,
    async ({ tx, args }) => {
      const now = Date.now();
      await tx.mutate.position_holder_history.insert({ ...args, created_at: now });
    }
  ),

  updatePositionHolderHistory: defineMutator(
    updatePositionHolderHistorySchema,
    async ({ tx, args }) => {
      await tx.mutate.position_holder_history.update(args);
    }
  ),
};
