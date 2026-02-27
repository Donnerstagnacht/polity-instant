import { defineMutator } from '@rocicorp/zero'
import { mutators } from '../mutators'
import { zql } from '../schema'
import { fireNotification } from '../server-notify'
import { groupName } from '../server-helpers'
import { deleteDocumentSchema } from './schema'

/** Server-only mutators — override the shared mutators with additional server-side logic (e.g. notifications). */
export const documentServerMutators = {
  delete: defineMutator(deleteDocumentSchema, async ({ tx, ctx, args }) => {
    const doc = await tx.run(zql.document.where('id', args.id).one())

    await mutators.documents.delete.fn({ tx, ctx, args })

    if (doc?.amendment_id) {
      const amd = await tx.run(zql.amendment.where('id', doc.amendment_id).one())
      if (amd?.group_id) {
        const gName = await groupName(tx, amd.group_id)
        fireNotification('notifyDocumentDeleted', {
          senderId: ctx.userID, groupId: amd.group_id, groupName: gName, amendmentId: doc.amendment_id,
        })
      }
    }
  }),
}
