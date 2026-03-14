import { defineMutator } from '@rocicorp/zero'
import { mutators } from '../mutators'
import { zql } from '../schema'
import { fireNotification } from '../server-notify'
import { amendmentTitle, userName, recomputeAmendmentCounters, recomputeEventCounters, recomputeGroupCounters, recomputeUserCounters } from '../server-helpers'
import { DEFAULT_AMENDMENT_ROLES } from '../rbac/constants'
import {
  createAmendmentCollaboratorSchema,
  deleteAmendmentCollaboratorSchema,
  updateAmendmentCollaboratorSchema,
  createAmendmentSchema,
  deleteAmendmentSchema,
} from './schema'
import {
  createChangeRequestSchema,
  updateChangeRequestSchema,
} from '../change-requests/schema'
import { createAmendmentSupportVoteSchema } from '../votes/schema'

/** Server-only mutators — override the shared mutators with additional server-side logic (e.g. notifications). */
export const amendmentServerMutators = {
  create: defineMutator(createAmendmentSchema, async ({ tx, ctx, args }) => {
    await mutators.amendments.create.fn({ tx, ctx, args })

    const now = Date.now()
    let authorRoleId: string | null = null
    const totalRoles = DEFAULT_AMENDMENT_ROLES.length

    for (let index = 0; index < totalRoles; index++) {
      const roleDef = DEFAULT_AMENDMENT_ROLES[index]
      const roleId = crypto.randomUUID()

      if (roleDef.name === 'Author') {
        authorRoleId = roleId
      }

      await tx.mutate.role.insert({
        id: roleId,
        name: roleDef.name,
        description: roleDef.description,
        scope: 'amendment',
        group_id: null,
        event_id: null,
        amendment_id: args.id,
        blog_id: null,
        sort_order: totalRoles - 1 - index,
        created_at: now,
      })

      for (const permission of roleDef.permissions) {
        await tx.mutate.action_right.insert({
          id: crypto.randomUUID(),
          resource: permission.resource,
          action: permission.action,
          role_id: roleId,
          group_id: null,
          event_id: null,
          amendment_id: args.id,
          blog_id: null,
          created_at: now,
        })
      }
    }

    await tx.mutate.amendment_collaborator.insert({
      id: crypto.randomUUID(),
      amendment_id: args.id,
      user_id: ctx.userID,
      role_id: authorRoleId,
      status: 'admin',
      visibility: args.visibility,
      created_at: now,
    })

    await recomputeAmendmentCounters(tx, args.id)

    await recomputeUserCounters(tx, ctx.userID)

    if (args.group_id) {
      await recomputeGroupCounters(tx, args.group_id)
    }

    if (args.event_id) {
      await recomputeEventCounters(tx, args.event_id)
    }
  }),

  delete: defineMutator(deleteAmendmentSchema, async ({ tx, ctx, args }) => {
    const amd = await tx.run(zql.amendment.where('id', args.id).one())

    await mutators.amendments.delete.fn({ tx, ctx, args })

    if (amd?.created_by_id) {
      await recomputeUserCounters(tx, amd.created_by_id)
    }

    if (amd?.group_id) {
      await recomputeGroupCounters(tx, amd.group_id)
    }

    if (amd?.event_id) {
      await recomputeEventCounters(tx, amd.event_id)
    }

    if (amd?.clone_source_id) {
      await recomputeAmendmentCounters(tx, amd.clone_source_id)
    }
  }),

  addCollaborator: defineMutator(createAmendmentCollaboratorSchema, async ({ tx, ctx, args }) => {
    await mutators.amendments.addCollaborator.fn({ tx, ctx, args })

    if (!args.amendment_id) return

    await recomputeAmendmentCounters(tx, args.amendment_id)

    const [aTitle, uName] = await Promise.all([
      amendmentTitle(tx, args.amendment_id),
      userName(tx, ctx.userID),
    ])

    if (args.status === 'requested') {
      fireNotification('notifyCollaborationRequest', {
        senderId: ctx.userID, senderName: uName, amendmentId: args.amendment_id, amendmentTitle: aTitle,
      })
    } else if (args.status === 'invited' && args.user_id) {
      fireNotification('notifyCollaborationInvite', {
        senderId: ctx.userID, recipientUserId: args.user_id, amendmentId: args.amendment_id, amendmentTitle: aTitle,
      })
    }

  }),

  removeCollaborator: defineMutator(deleteAmendmentCollaboratorSchema, async ({ tx, ctx, args }) => {
    const collab = await tx.run(zql.amendment_collaborator.where('id', args.id).one())

    await mutators.amendments.removeCollaborator.fn({ tx, ctx, args })

    if (!collab) return

    await recomputeAmendmentCounters(tx, collab.amendment_id)

    const aId = collab.amendment_id
    const collabUserId = collab.user_id
    const status = collab.status
    const isSelf = ctx.userID === collabUserId

    const [aTitle, uName] = await Promise.all([
      amendmentTitle(tx, aId),
      userName(tx, collabUserId),
    ])

    if (isSelf) {
      if (status === 'requested') {
        fireNotification('notifyCollaborationRequestWithdrawn', {
          senderId: ctx.userID, senderName: uName, amendmentId: aId, amendmentTitle: aTitle,
        })
      } else if (status === 'invited') {
        fireNotification('notifyCollaborationInvitationDeclined', {
          senderId: ctx.userID, senderName: uName, amendmentId: aId, amendmentTitle: aTitle,
        })
      } else {
        fireNotification('notifyCollaborationWithdrawn', {
          senderId: ctx.userID, senderName: uName, amendmentId: aId, amendmentTitle: aTitle,
        })
      }
    } else {
      if (status === 'requested') {
        fireNotification('notifyCollaborationRejected', {
          senderId: ctx.userID, recipientUserId: collabUserId, amendmentId: aId, amendmentTitle: aTitle,
        })
      } else {
        fireNotification('notifyCollaborationRemoved', {
          senderId: ctx.userID, recipientUserId: collabUserId, amendmentId: aId, amendmentTitle: aTitle,
        })
      }
    }

  }),

  updateCollaborator: defineMutator(updateAmendmentCollaboratorSchema, async ({ tx, ctx, args }) => {
    const oldCollab = await tx.run(zql.amendment_collaborator.where('id', args.id).one())

    await mutators.amendments.updateCollaborator.fn({ tx, ctx, args })

    if (!oldCollab) return

    await recomputeAmendmentCounters(tx, oldCollab.amendment_id)

    const aId = oldCollab.amendment_id
    const collabUserId = oldCollab.user_id
    const oldStatus = oldCollab.status
    const newStatus = args.status
    const isSelf = ctx.userID === collabUserId

    const aTitle = await amendmentTitle(tx, aId)

    if (newStatus === 'member' && (oldStatus === 'requested' || oldStatus === 'invited')) {
      if (isSelf) {
        const uName = await userName(tx, ctx.userID)
        fireNotification('notifyCollaborationInvitationAccepted', {
          senderId: ctx.userID, senderName: uName, amendmentId: aId, amendmentTitle: aTitle,
        })
      } else {
        fireNotification('notifyCollaborationApproved', {
          senderId: ctx.userID, recipientUserId: collabUserId, amendmentId: aId, amendmentTitle: aTitle,
        })
      }
    }
  }),

  createChangeRequest: defineMutator(createChangeRequestSchema, async ({ tx, ctx, args }) => {
    await mutators.amendments.createChangeRequest.fn({ tx, ctx, args })

    await recomputeAmendmentCounters(tx, args.amendment_id)

    const amendment = await tx.run(zql.amendment.where('id', args.amendment_id).one())
    if (amendment?.event_id) {
      await recomputeEventCounters(tx, amendment.event_id)
    }
  }),

  updateChangeRequest: defineMutator(updateChangeRequestSchema, async ({ tx, ctx, args }) => {
    const previous = await tx.run(zql.change_request.where('id', args.id).one())

    await mutators.amendments.updateChangeRequest.fn({ tx, ctx, args })

    if (!previous) return

    await recomputeAmendmentCounters(tx, previous.amendment_id)

    const amendment = await tx.run(zql.amendment.where('id', previous.amendment_id).one())
    if (amendment?.event_id) {
      await recomputeEventCounters(tx, amendment.event_id)
    }
  }),

  supportAmendment: defineMutator(createAmendmentSupportVoteSchema, async ({ tx, ctx, args }) => {
    await mutators.amendments.supportAmendment.fn({ tx, ctx, args })
    await recomputeAmendmentCounters(tx, args.amendment_id)
  }),
}
