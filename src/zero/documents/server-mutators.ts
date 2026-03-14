import { defineMutator } from '@rocicorp/zero'
import { mutators } from '../mutators'
import { zql } from '../schema'
import { fireNotification } from '../server-notify'
import { groupName, recomputeAmendmentCounters, recomputeBlogCounters } from '../server-helpers'
import { deleteDocumentSchema, createDocumentSchema } from './schema'
import { createCommentSchema } from '../discussions/schema'

/** Server-only mutators — override the shared mutators with additional server-side logic (e.g. notifications). */
export const documentServerMutators = {
  create: defineMutator(createDocumentSchema, async ({ tx, ctx, args }) => {
    await mutators.documents.create.fn({ tx, ctx, args })

    // Increment group document_count
    if (args.amendment_id) {
      const amd = await tx.run(zql.amendment.where('id', args.amendment_id).one())
      if (amd?.group_id) {
        const grp = await tx.run(zql.group.where('id', amd.group_id).one())
        if (grp) {
          await tx.mutate.group.update({
            id: amd.group_id,
            document_count: (grp.document_count ?? 0) + 1,
          })
        }
      }
    }
  }),

  delete: defineMutator(deleteDocumentSchema, async ({ tx, ctx, args }) => {
    const doc = await tx.run(zql.document.where('id', args.id).one())

    await mutators.documents.delete.fn({ tx, ctx, args })

    if (doc?.amendment_id) {
      const amd = await tx.run(zql.amendment.where('id', doc.amendment_id).one())
      if (amd?.group_id) {
        // Decrement group document_count
        const grp = await tx.run(zql.group.where('id', amd.group_id).one())
        if (grp) {
          await tx.mutate.group.update({
            id: amd.group_id,
            document_count: Math.max(0, (grp.document_count ?? 0) - 1),
          })
        }

        const gName = await groupName(tx, amd.group_id)
        fireNotification('notifyDocumentDeleted', {
          senderId: ctx.userID, groupId: amd.group_id, groupName: gName, amendmentId: doc.amendment_id,
        })
      }
    }
  }),

  addComment: defineMutator(createCommentSchema, async ({ tx, ctx, args }) => {
    await mutators.documents.addComment.fn({ tx, ctx, args })

    if (args.thread_id) {
      const thread = await tx.run(zql.thread.where('id', args.thread_id).one())
      if (thread?.amendment_id) {
        const amd = await tx.run(zql.amendment.where('id', thread.amendment_id).one())
        if (amd) {
          await tx.mutate.amendment.update({
            id: thread.amendment_id,
            comment_count: (amd.comment_count ?? 0) + 1,
          })
        }
      }

      if (thread?.blog_id) {
        await recomputeBlogCounters(tx, thread.blog_id)
      }

      if (thread?.amendment_id) {
        await recomputeAmendmentCounters(tx, thread.amendment_id)
      }
    }
  }),
}
