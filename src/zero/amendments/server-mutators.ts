import { defineMutator } from '@rocicorp/zero'
import { mutators } from '../mutators'
import { zql } from '../schema'
import { fireNotification } from '../server-notify'
import { amendmentTitle, userName } from '../server-helpers'
import {
  createAmendmentCollaboratorSchema,
  deleteAmendmentCollaboratorSchema,
  updateAmendmentCollaboratorSchema,
} from './schema'

/** Server-only mutators — override the shared mutators with additional server-side logic (e.g. notifications). */
export const amendmentServerMutators = {
  addCollaborator: defineMutator(createAmendmentCollaboratorSchema, async ({ tx, ctx, args }) => {
    await mutators.amendments.addCollaborator.fn({ tx, ctx, args })

    if (!args.amendment_id) return

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
}
