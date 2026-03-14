import { defineMutator } from '@rocicorp/zero'
import { mutators } from '../mutators'
import { zql } from '../schema'
import { fireNotification } from '../server-notify'
import { groupName, eventTitle, amendmentTitle, blogTitle, recomputeAmendmentCounters, recomputeBlogCounters, recomputeEventCounters, recomputeGroupCounters, recomputeUserCounters } from '../server-helpers'
import { createSubscriberSchema, deleteSubscriberSchema } from '../network/schema'
import { createLinkSchema, deleteLinkSchema } from './schema'

/** Server-only mutators — override the shared mutators with additional server-side logic (e.g. notifications). */
export const commonServerMutators = {
  subscribe: defineMutator(createSubscriberSchema, async ({ tx, ctx, args }) => {
    await mutators.common.subscribe.fn({ tx, ctx, args })

    if (args.user_id) await recomputeUserCounters(tx, args.user_id)
    if (args.group_id) await recomputeGroupCounters(tx, args.group_id)
    if (args.event_id) await recomputeEventCounters(tx, args.event_id)
    if (args.amendment_id) await recomputeAmendmentCounters(tx, args.amendment_id)
    if (args.blog_id) await recomputeBlogCounters(tx, args.blog_id)

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

  unsubscribe: defineMutator(deleteSubscriberSchema, async ({ tx, ctx, args }) => {
    const subscription = await tx.run(zql.subscriber.where('id', args.id).one())

    await mutators.common.unsubscribe.fn({ tx, ctx, args })

    if (!subscription) return

    if (subscription.user_id) await recomputeUserCounters(tx, subscription.user_id)
    if (subscription.group_id) await recomputeGroupCounters(tx, subscription.group_id)
    if (subscription.event_id) await recomputeEventCounters(tx, subscription.event_id)
    if (subscription.amendment_id) await recomputeAmendmentCounters(tx, subscription.amendment_id)
    if (subscription.blog_id) await recomputeBlogCounters(tx, subscription.blog_id)
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
