import { defineMutator } from '@rocicorp/zero'
import { mutators } from '../mutators'
import { zql } from '../schema'
import { fireNotification } from '../server-notify'
import { groupName } from '../server-helpers'
import {
  createPaymentSchema,
  deletePaymentSchema,
} from './schema'

/** Server-only mutators — override the shared mutators with additional server-side logic (e.g. notifications). */
export const paymentServerMutators = {
  createPayment: defineMutator(createPaymentSchema, async ({ tx, ctx, args }) => {
    await mutators.payments.createPayment.fn({ tx, ctx, args })

    const gId = args.payer_group_id ?? args.receiver_group_id
    if (gId) {
      const gName = await groupName(tx, gId)
      fireNotification('notifyPaymentCreated', {
        senderId: ctx.userID, groupId: gId, groupName: gName,
      })
    }
  }),

  deletePayment: defineMutator(deletePaymentSchema, async ({ tx, ctx, args }) => {
    const pay = await tx.run(zql.payment.where('id', args.id).one())

    await mutators.payments.deletePayment.fn({ tx, ctx, args })

    const gId = pay?.payer_group_id ?? pay?.receiver_group_id
    if (gId) {
      const gName = await groupName(tx, gId)
      fireNotification('notifyPaymentDeleted', {
        senderId: ctx.userID, groupId: gId, groupName: gName,
      })
    }
  }),
}
