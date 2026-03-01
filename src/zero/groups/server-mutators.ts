import { defineMutator } from '@rocicorp/zero'
import { mutators } from '../mutators'
import { zql } from '../schema'
import { fireNotification } from '../server-notify'
import { groupName, userName, roleName } from '../server-helpers'
import {
  groupMembershipCreateSchema,
  groupMembershipDeleteSchema,
  groupMembershipUpdateSchema,
  groupUpdateSchema,
  roleCreateSchema,
  roleDeleteSchema,
  actionRightCreateSchema,
  actionRightDeleteSchema,
} from './schema'
import {
  createPositionSchema,
  deletePositionSchema,
  createPositionHolderHistorySchema,
  updatePositionHolderHistorySchema,
} from '../positions/schema'
import {
  updateGroupRelationshipSchema,
  deleteGroupRelationshipSchema,
} from '../network/schema'
import {
  resolveHierarchicalAncestors,
  resolveChildBaseGroups,
  checkExclusivityConstraint,
  detectLinkConflicts,
} from '../../features/groups/logic/hierarchy'

/** Server-only mutators — override the shared mutators with additional server-side logic (e.g. notifications). */
export const groupServerMutators = {
  joinGroup: defineMutator(groupMembershipCreateSchema, async ({ tx, ctx, args }) => {
    const group = await tx.run(zql.group.where('id', args.group_id).one())

    // Exclusivity check for base groups within a hierarchy
    if (group?.group_type === 'base') {
      const pvrRels = await tx.run(
        zql.group_relationship.where('with_right', 'passiveVotingRight').where('status', 'active')
      )
      if (pvrRels.length > 0) {
        const userMemberships = await tx.run(
          zql.group_membership.where('user_id', ctx.userID).where('source', 'direct')
        )
        if (!checkExclusivityConstraint(ctx.userID, args.group_id, pvrRels, userMemberships)) {
          throw new Error('Cannot join: you are already a member of another base group in the same hierarchy.')
        }
      }
    }

    // Run shared mutator (guards + direct insert)
    await mutators.groups.joinGroup.fn({ tx, ctx, args })

    if (args.status === 'requested' && args.group_id) {
      const [gName, uName] = await Promise.all([
        groupName(tx, args.group_id),
        userName(tx, ctx.userID),
      ])
      fireNotification('notifyMembershipRequest', {
        senderId: ctx.userID, senderName: uName, groupId: args.group_id, groupName: gName,
      })
    }

    // Propagate derived memberships into hierarchical ancestors
    if (!group || group.group_type !== 'base') return

    const pvrRels = await tx.run(
      zql.group_relationship.where('with_right', 'passiveVotingRight').where('status', 'active')
    )
    const ancestors = resolveHierarchicalAncestors(args.group_id, pvrRels)
    if (ancestors.length === 0) return

    for (const ancestorId of ancestors) {
      // Find "Member" role in the ancestor group
      const roles = await tx.run(
        zql.role.where('group_id', ancestorId).where('scope', 'group')
      )
      const memberRole = roles.find(r => r.name === 'Member')

      await tx.mutate.group_membership.insert({
        id: crypto.randomUUID(),
        group_id: ancestorId,
        user_id: ctx.userID,
        status: 'member',
        visibility: 'public',
        role_id: memberRole?.id ?? null,
        source: 'derived',
        source_group_id: args.group_id,
        created_at: Date.now(),
      })

      // Update member_count
      const ancestorGroup = await tx.run(zql.group.where('id', ancestorId).one())
      if (ancestorGroup) {
        await tx.mutate.group.update({
          id: ancestorId,
          member_count: (ancestorGroup.member_count ?? 0) + 1,
        })
      }
    }
  }),

  inviteMember: defineMutator(groupMembershipCreateSchema, async ({ tx, ctx, args }) => {
    await mutators.groups.inviteMember.fn({ tx, ctx, args })

    if (args.user_id && args.group_id) {
      const gName = await groupName(tx, args.group_id)
      fireNotification('notifyGroupInvite', {
        senderId: ctx.userID, recipientUserId: args.user_id, groupId: args.group_id, groupName: gName,
      })
    }
  }),

  leaveGroup: defineMutator(groupMembershipDeleteSchema, async ({ tx, ctx, args }) => {
    const membership = await tx.run(zql.group_membership.where('id', args.id).one())

    await mutators.groups.leaveGroup.fn({ tx, ctx, args })

    if (!membership) return

    // Cascade: delete derived memberships from ancestor groups
    if (membership.source === 'direct') {
      const allDerived = await tx.run(
        zql.group_membership.where('user_id', membership.user_id).where('source', 'derived')
      )
      const toDelete = allDerived.filter(m => m.source_group_id === membership.group_id)
      for (const derived of toDelete) {
        await tx.mutate.group_membership.delete({ id: derived.id })
        // Decrement member_count
        const ancestorGroup = await tx.run(zql.group.where('id', derived.group_id).one())
        if (ancestorGroup) {
          await tx.mutate.group.update({
            id: derived.group_id,
            member_count: Math.max(0, (ancestorGroup.member_count ?? 0) - 1),
          })
        }
      }
    }

    const gId = membership.group_id
    const membUserId = membership.user_id
    const status = membership.status
    const isSelf = ctx.userID === membUserId

    const [gName, uName] = await Promise.all([
      groupName(tx, gId),
      userName(tx, membUserId),
    ])

    if (isSelf) {
      if (status === 'requested') {
        fireNotification('notifyGroupRequestWithdrawn', {
          senderId: ctx.userID, senderName: uName, groupId: gId, groupName: gName,
        })
      } else if (status === 'invited') {
        fireNotification('notifyGroupInvitationDeclined', {
          senderId: ctx.userID, senderName: uName, groupId: gId, groupName: gName,
        })
      } else {
        fireNotification('notifyMembershipWithdrawn', {
          senderId: ctx.userID, senderName: uName, groupId: gId, groupName: gName,
        })
      }
    } else {
      if (status === 'requested') {
        fireNotification('notifyMembershipRejected', {
          senderId: ctx.userID, recipientUserId: membUserId, groupId: gId, groupName: gName,
        })
      } else {
        fireNotification('notifyMembershipRemoved', {
          senderId: ctx.userID, recipientUserId: membUserId, groupId: gId, groupName: gName,
        })
      }
    }
  }),

  updateMemberRole: defineMutator(groupMembershipUpdateSchema, async ({ tx, ctx, args }) => {
    const oldMembership = await tx.run(zql.group_membership.where('id', args.id).one())

    await mutators.groups.updateMemberRole.fn({ tx, ctx, args })

    if (!oldMembership) return

    const gId = oldMembership.group_id
    const membUserId = oldMembership.user_id
    const oldStatus = oldMembership.status
    const newStatus = args.status
    const isSelf = ctx.userID === membUserId

    const gName = await groupName(tx, gId)

    if (newStatus === 'member' && (oldStatus === 'requested' || oldStatus === 'invited')) {
      if (isSelf) {
        const uName = await userName(tx, ctx.userID)
        fireNotification('notifyGroupInvitationAccepted', {
          senderId: ctx.userID, senderName: uName, groupId: gId, groupName: gName,
        })
      } else {
        fireNotification('notifyMembershipApproved', {
          senderId: ctx.userID, recipientUserId: membUserId, groupId: gId, groupName: gName,
        })
      }
    } else if (newStatus === 'admin') {
      fireNotification('notifyAdminPromoted', {
        senderId: ctx.userID, recipientUserId: membUserId, groupId: gId, groupName: gName,
      })
    } else if (newStatus === 'member' && oldStatus === 'admin') {
      fireNotification('notifyAdminDemoted', {
        senderId: ctx.userID, recipientUserId: membUserId, groupId: gId, groupName: gName,
      })
    }

    if (args.role_id !== undefined && args.role_id !== oldMembership.role_id && !newStatus) {
      const rInfo = args.role_id ? await roleName(tx, args.role_id) : { name: 'Default', groupId: null }
      fireNotification('notifyMembershipRoleChanged', {
        senderId: ctx.userID, recipientUserId: membUserId, groupId: gId, groupName: gName, newRole: rInfo.name,
      })
    }
  }),

  update: defineMutator(groupUpdateSchema, async ({ tx, ctx, args }) => {
    await mutators.groups.update.fn({ tx, ctx, args })

    const gName = args.name ?? (await groupName(tx, args.id))
    fireNotification('notifyGroupProfileUpdated', {
      senderId: ctx.userID, groupId: args.id, groupName: gName,
    })
  }),

  createRole: defineMutator(roleCreateSchema, async ({ tx, ctx, args }) => {
    await mutators.groups.createRole.fn({ tx, ctx, args })

    if (args.group_id) {
      const gName = await groupName(tx, args.group_id)
      fireNotification('notifyRoleCreated', {
        senderId: ctx.userID, groupId: args.group_id, groupName: gName,
      })
    }
  }),

  deleteRole: defineMutator(roleDeleteSchema, async ({ tx, ctx, args }) => {
    const rInfo = await roleName(tx, args.id)

    await mutators.groups.deleteRole.fn({ tx, ctx, args })

    if (rInfo.groupId) {
      const gName = await groupName(tx, rInfo.groupId)
      fireNotification('notifyRoleDeleted', {
        senderId: ctx.userID, groupId: rInfo.groupId, groupName: gName,
      })
    }
  }),

  assignActionRight: defineMutator(actionRightCreateSchema, async ({ tx, ctx, args }) => {
    await mutators.groups.assignActionRight.fn({ tx, ctx, args })

    if (args.role_id && args.group_id) {
      const [gName, rInfo] = await Promise.all([
        groupName(tx, args.group_id),
        roleName(tx, args.role_id),
      ])
      fireNotification('notifyActionRightsChanged', {
        senderId: ctx.userID, groupId: args.group_id, groupName: gName, roleName: rInfo.name,
      })
    }
  }),

  removeActionRight: defineMutator(actionRightDeleteSchema, async ({ tx, ctx, args }) => {
    const right = await tx.run(zql.action_right.where('id', args.id).one())

    await mutators.groups.removeActionRight.fn({ tx, ctx, args })

    if (right?.role_id && right?.group_id) {
      const [gName, rInfo] = await Promise.all([
        groupName(tx, right.group_id),
        roleName(tx, right.role_id),
      ])
      fireNotification('notifyActionRightsChanged', {
        senderId: ctx.userID, groupId: right.group_id, groupName: gName, roleName: rInfo.name,
      })
    }
  }),

  createPosition: defineMutator(createPositionSchema, async ({ tx, ctx, args }) => {
    await mutators.groups.createPosition.fn({ tx, ctx, args })

    if (args.group_id) {
      const gName = await groupName(tx, args.group_id)
      fireNotification('notifyPositionCreated', {
        senderId: ctx.userID, groupId: args.group_id, groupName: gName,
      })
    }
  }),

  deletePosition: defineMutator(deletePositionSchema, async ({ tx, ctx, args }) => {
    const pos = await tx.run(zql.position.where('id', args.id).one())

    await mutators.groups.deletePosition.fn({ tx, ctx, args })

    if (pos?.group_id) {
      const gName = await groupName(tx, pos.group_id)
      fireNotification('notifyPositionDeleted', {
        senderId: ctx.userID, groupId: pos.group_id, groupName: gName, positionTitle: pos.title,
      })
    }
  }),

  createPositionHolderHistory: defineMutator(createPositionHolderHistorySchema, async ({ tx, ctx, args }) => {
    await mutators.groups.createPositionHolderHistory.fn({ tx, ctx, args })

    if (args.position_id) {
      const pos = await tx.run(zql.position.where('id', args.position_id).one())
      if (pos?.group_id && args.user_id) {
        const gName = await groupName(tx, pos.group_id)
        fireNotification('notifyPositionAssigned', {
          senderId: ctx.userID, recipientId: args.user_id, groupId: pos.group_id, groupName: gName, positionTitle: pos.title,
        })
      }
    }
  }),

  updatePositionHolderHistory: defineMutator(updatePositionHolderHistorySchema, async ({ tx, ctx, args }) => {
    const oldHistory = await tx.run(zql.position_holder_history.where('id', args.id).one())

    await mutators.groups.updatePositionHolderHistory.fn({ tx, ctx, args })

    if (args.end_date && !oldHistory?.end_date && oldHistory?.position_id) {
      const pos = await tx.run(zql.position.where('id', oldHistory.position_id).one())
      if (pos?.group_id) {
        const gName = await groupName(tx, pos.group_id)
        fireNotification('notifyPositionVacated', {
          senderId: ctx.userID, groupId: pos.group_id, groupName: gName, positionTitle: pos.title,
        })
      }
    }
  }),

  // ── Relationship overrides (hierarchy propagation) ──────────────────

  updateRelationship: defineMutator(updateGroupRelationshipSchema, async ({ tx, ctx, args }) => {
    const relationship = await tx.run(zql.group_relationship.where('id', args.id).one())

    // Run shared mutator
    await mutators.groups.updateRelationship.fn({ tx, ctx, args })

    // Only propagate when a passiveVotingRight link becomes active
    if (
      !relationship ||
      relationship.with_right !== 'passiveVotingRight' ||
      relationship.status === 'active' ||
      args.status !== 'active'
    ) return

    const parentGroupId = relationship.group_id
    const childGroupId = relationship.related_group_id

    // Gather all pvr relationships (including the newly activated one)
    const existingPvrRels = await tx.run(
      zql.group_relationship.where('with_right', 'passiveVotingRight').where('status', 'active')
    )
    const allPvrRels = [
      ...existingPvrRels.filter(r => r.id !== relationship.id),
      { ...relationship, status: 'active' as const },
    ]

    // Check for member conflicts
    const allDirectMemberships = await tx.run(
      zql.group_membership.where('source', 'direct')
    )
    const conflicts = detectLinkConflicts(parentGroupId, childGroupId, allPvrRels, allDirectMemberships)
    if (conflicts.length > 0) {
      // Roll back the activation
      await tx.mutate.group_relationship.update({ id: args.id, status: relationship.status })
      throw new Error(`Cannot activate link: ${conflicts.length} member(s) would violate exclusivity.`)
    }

    // Transition parent to hierarchical if it was base
    const parentGroup = await tx.run(zql.group.where('id', parentGroupId).one())
    if (parentGroup?.group_type === 'base') {
      await tx.mutate.group.update({ id: parentGroupId, group_type: 'hierarchical' })

      // Promote existing direct members to Admin role
      const parentRoles = await tx.run(
        zql.role.where('group_id', parentGroupId).where('scope', 'group')
      )
      const adminRole = parentRoles.find(r => r.name === 'Admin')
      if (adminRole) {
        const existingMembers = await tx.run(
          zql.group_membership.where('group_id', parentGroupId).where('source', 'direct')
        )
        for (const member of existingMembers) {
          if (member.role_id !== adminRole.id) {
            await tx.mutate.group_membership.update({ id: member.id, role_id: adminRole.id })
          }
        }
      }
    }

    // Propagate child base-group members as derived memberships
    let baseGroupsToPropagate = resolveChildBaseGroups(childGroupId, allPvrRels)
    if (baseGroupsToPropagate.length === 0) {
      // The child itself is a leaf base group
      baseGroupsToPropagate = [childGroupId]
    }

    for (const baseGroupId of baseGroupsToPropagate) {
      const baseMembers = await tx.run(
        zql.group_membership.where('group_id', baseGroupId).where('source', 'direct')
      )
      const activeMembers = baseMembers.filter(m => m.status === 'member')

      const ancestors = resolveHierarchicalAncestors(baseGroupId, allPvrRels)
      for (const ancestorId of ancestors) {
        const ancestorRoles = await tx.run(
          zql.role.where('group_id', ancestorId).where('scope', 'group')
        )
        const memberRole = ancestorRoles.find(r => r.name === 'Member')

        for (const member of activeMembers) {
          // Check if membership already exists
          const existing = await tx.run(
            zql.group_membership.where('user_id', member.user_id).where('group_id', ancestorId)
          )
          if (existing.length > 0) continue

          await tx.mutate.group_membership.insert({
            id: crypto.randomUUID(),
            group_id: ancestorId,
            user_id: member.user_id,
            status: 'member',
            visibility: 'public',
            role_id: memberRole?.id ?? null,
            source: 'derived',
            source_group_id: baseGroupId,
            created_at: Date.now(),
          })
        }

        // Update member_count
        const allAncestorMembers = await tx.run(
          zql.group_membership.where('group_id', ancestorId).where('status', 'member')
        )
        await tx.mutate.group.update({
          id: ancestorId,
          member_count: allAncestorMembers.length,
        })
      }
    }
  }),

  deleteRelationship: defineMutator(deleteGroupRelationshipSchema, async ({ tx, ctx, args }) => {
    const relationship = await tx.run(zql.group_relationship.where('id', args.id).one())

    // Run shared mutator
    await mutators.groups.deleteRelationship.fn({ tx, ctx, args })

    // Only clean up if deleting a passiveVotingRight link
    if (!relationship || relationship.with_right !== 'passiveVotingRight' || relationship.status !== 'active') return

    const parentGroupId = relationship.group_id
    const childGroupId = relationship.related_group_id

    // Find base groups that were connected through this link
    const remainingPvrRels = await tx.run(
      zql.group_relationship.where('with_right', 'passiveVotingRight').where('status', 'active')
    )

    let affectedBaseGroups = resolveChildBaseGroups(childGroupId, remainingPvrRels)
    if (affectedBaseGroups.length === 0) {
      affectedBaseGroups = [childGroupId]
    }

    // Remove derived memberships in the parent (and its ancestors) that came from these base groups
    for (const baseGroupId of affectedBaseGroups) {
      const derivedInParent = await tx.run(
        zql.group_membership.where('group_id', parentGroupId).where('source', 'derived')
      )
      const toDelete = derivedInParent.filter(m => m.source_group_id === baseGroupId)
      for (const derived of toDelete) {
        await tx.mutate.group_membership.delete({ id: derived.id })
      }

      // Also clean up from ancestors of the parent that are no longer reachable
      const parentAncestors = resolveHierarchicalAncestors(parentGroupId, remainingPvrRels)
      for (const ancestorId of parentAncestors) {
        const derivedInAncestor = await tx.run(
          zql.group_membership.where('group_id', ancestorId).where('source', 'derived')
        )
        const ancestorToDelete = derivedInAncestor.filter(m => m.source_group_id === baseGroupId)
        for (const derived of ancestorToDelete) {
          await tx.mutate.group_membership.delete({ id: derived.id })
        }
      }
    }

    // Update member_counts for parent and its ancestors
    const parentMembers = await tx.run(
      zql.group_membership.where('group_id', parentGroupId).where('status', 'member')
    )
    await tx.mutate.group.update({
      id: parentGroupId,
      member_count: parentMembers.length,
    })

    // If parent has no more pvr children, transition back to base
    const remainingChildren = remainingPvrRels.filter(r => r.group_id === parentGroupId)
    if (remainingChildren.length === 0 && (await tx.run(zql.group.where('id', parentGroupId).one()))?.group_type === 'hierarchical') {
      await tx.mutate.group.update({ id: parentGroupId, group_type: 'base' })
    }
  }),
}
