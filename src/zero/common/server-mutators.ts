import { defineMutator } from '@rocicorp/zero'
import { mutators } from '../mutators'
import { zql } from '../schema'
import { fireNotification } from '../server-notify'
import { groupName, eventTitle, amendmentTitle, blogTitle } from '../server-helpers'
import { createSubscriberSchema } from '../network/schema'
import { createLinkSchema, deleteLinkSchema } from './schema'

/** Server-only mutators — override the shared mutators with additional server-side logic (e.g. notifications). */
export const commonServerMutators = {
  subscribe: defineMutator(createSubscriberSchema, async ({ tx, ctx, args }) => {
    await mutators.common.subscribe.fn({ tx, ctx, args })

    if (args.group_id) {
      const gName = await groupName(tx, args.group_id)
      fireNotification('notifyGroupNewSubscriber', {
        senderId: ctx.userID, groupId: args.group_id, groupName: gName,
      })
    } else if (args.event_id) {
      const eTitle = await eventTitle(tx, args.event_id)
      fireNotification('notifyEventNewSubscriber', {
        senderId: ctx.userID, eventId: args.event_id, eventTitle: eTitle,
      })
    } else if (args.amendment_id) {
      const aTitle = await amendmentTitle(tx, args.amendment_id)
      fireNotification('notifyAmendmentNewSubscriber', {
        senderId: ctx.userID, amendmentId: args.amendment_id, amendmentTitle: aTitle,
      })
    } else if (args.blog_id) {
      const bTitle = await blogTitle(tx, args.blog_id)
      fireNotification('notifyBlogNewSubscriber', {
        senderId: ctx.userID, blogId: args.blog_id, blogTitle: bTitle,
      })
    }
  }),

  createLink: defineMutator(createLinkSchema, async ({ tx, ctx, args }) => {
    await mutators.common.createLink.fn({ tx, ctx, args })

    if (args.group_id) {
      const gName = await groupName(tx, args.group_id)
      fireNotification('notifyLinkAdded', {
        senderId: ctx.userID, groupId: args.group_id, groupName: gName,
      })
    }
  }),

  deleteLink: defineMutator(deleteLinkSchema, async ({ tx, ctx, args }) => {
    const linkRow = await tx.run(zql.link.where('id', args.id).one())

    await mutators.common.deleteLink.fn({ tx, ctx, args })

    if (linkRow?.group_id) {
      const gName = await groupName(tx, linkRow.group_id)
      fireNotification('notifyLinkRemoved', {
        senderId: ctx.userID, groupId: linkRow.group_id, groupName: gName,
      })
    }
  }),
}
