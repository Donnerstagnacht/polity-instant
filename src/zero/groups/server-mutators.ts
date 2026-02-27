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

/** Server-only mutators — override the shared mutators with additional server-side logic (e.g. notifications). */
export const groupServerMutators = {
  joinGroup: defineMutator(groupMembershipCreateSchema, async ({ tx, ctx, args }) => {
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
}
