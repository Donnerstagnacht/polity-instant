import { defineMutator } from '@rocicorp/zero'
import { mutators } from '../mutators'
import { zql } from '../schema'
import { fireNotification } from '../server-notify'
import { blogTitle, userName } from '../server-helpers'
import {
  updateBlogBloggerSchema,
  deleteBlogBloggerSchema,
} from './schema'

/** Server-only mutators — override the shared mutators with additional server-side logic (e.g. notifications). */
export const blogServerMutators = {
  updateEntry: defineMutator(updateBlogBloggerSchema, async ({ tx, ctx, args }) => {
    const oldEntry = await tx.run(zql.blog_blogger.where('id', args.id).one())

    await mutators.blogs.updateEntry.fn({ tx, ctx, args })

    if (!oldEntry) return

    const bId = oldEntry.blog_id
    const entryUserId = oldEntry.user_id
    const oldStatus = oldEntry.status
    const newStatus = args.status
    const isSelf = ctx.userID === entryUserId

    const bTitle = await blogTitle(tx, bId)

    if (newStatus === 'writer' && (oldStatus === 'invited' || oldStatus === 'requested')) {
      if (isSelf) {
        const uName = await userName(tx, ctx.userID)
        fireNotification('notifyBlogInvitationAccepted', {
          senderId: ctx.userID, senderName: uName, blogId: bId, blogTitle: bTitle,
        })
      } else {
        fireNotification('notifyBlogWriterApproved', {
          senderId: ctx.userID, recipientUserId: entryUserId, blogId: bId, blogTitle: bTitle,
        })
      }
    }
  }),

  deleteEntry: defineMutator(deleteBlogBloggerSchema, async ({ tx, ctx, args }) => {
    const entry = await tx.run(zql.blog_blogger.where('id', args.id).one())

    await mutators.blogs.deleteEntry.fn({ tx, ctx, args })

    if (!entry) return

    const bId = entry.blog_id
    const entryUserId = entry.user_id
    const status = entry.status
    const isSelf = ctx.userID === entryUserId

    const [bTitle, uName] = await Promise.all([
      blogTitle(tx, bId),
      userName(tx, entryUserId),
    ])

    if (isSelf) {
      if (status === 'requested') {
        fireNotification('notifyBlogRequestWithdrawn', {
          senderId: ctx.userID, senderName: uName, blogId: bId, blogTitle: bTitle,
        })
      } else if (status === 'invited') {
        fireNotification('notifyBlogInvitationDeclined', {
          senderId: ctx.userID, senderName: uName, blogId: bId, blogTitle: bTitle,
        })
      } else {
        fireNotification('notifyBlogWriterLeft', {
          senderId: ctx.userID, senderName: uName, blogId: bId, blogTitle: bTitle,
        })
      }
    } else {
      fireNotification('notifyBlogWriterRemoved', {
        senderId: ctx.userID, recipientUserId: entryUserId, blogId: bId, blogTitle: bTitle,
      })
    }
  }),
}
