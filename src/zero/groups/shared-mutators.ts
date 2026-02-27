import { defineMutator } from '@rocicorp/zero';
import { can } from '../rbac/can';
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

/** Shared mutators — run on both client and server. Server mutators may override these. */
export const groupSharedMutators = {
  create: defineMutator(groupCreateSchema, async ({ tx, ctx: { userID }, args }) => {
    const now = Date.now();
    await tx.mutate.group.insert({
      ...args,
      owner_id: userID,
      member_count: 1,
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
    const now = Date.now();
    await tx.mutate.group_membership.insert({
      ...args,
      user_id: userID,
      created_at: now,
    });
  }),

  leaveGroup: defineMutator(groupMembershipDeleteSchema, async ({ tx, args }) => {
    await tx.mutate.group_membership.delete({ id: args.id });
  }),

  inviteMember: defineMutator(groupMembershipCreateSchema, async ({ tx, ctx, args }) => {
    await can(tx, ctx, { action: 'manage', resource: 'groupMemberships', groupId: args.group_id });
    if (!args.user_id) throw new Error('user_id is required for inviteMember');
    const now = Date.now();
    await tx.mutate.group_membership.insert({
      ...args,
      user_id: args.user_id,
      status: 'invited',
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
    await can(tx, ctx, { action: 'manage', resource: 'groupRoles', groupId: args.group_id });
    const now = Date.now();
    await tx.mutate.role.insert({ ...args, created_at: now });
  }),

  updateRole: defineMutator(roleUpdateSchema, async ({ tx, args }) => {
    await tx.mutate.role.update(args);
  }),

  deleteRole: defineMutator(roleDeleteSchema, async ({ tx, args }) => {
    await tx.mutate.role.delete({ id: args.id });
  }),

  assignActionRight: defineMutator(actionRightCreateSchema, async ({ tx, ctx, args }) => {
    await can(tx, ctx, { action: 'manage', resource: 'groupRoles', groupId: args.group_id });
    const now = Date.now();
    await tx.mutate.action_right.insert({ ...args, created_at: now });
  }),

  removeActionRight: defineMutator(actionRightDeleteSchema, async ({ tx, args }) => {
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
