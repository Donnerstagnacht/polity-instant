import { defineQuery } from '@rocicorp/zero'
import { z } from 'zod'
import { zql } from '../schema'

export const paymentQueries = {
  // Payments for the current user (as payer)
  byUser: defineQuery(
    z.object({}),
    ({ ctx: { userID } }) =>
      zql.payment
        .where('payer_user_id', userID)
        .orderBy('created_at', 'desc')
  ),

  // Subscription status for the current user
  subscriptionStatus: defineQuery(
    z.object({}),
    ({ ctx: { userID } }) =>
      zql.stripe_customer
        .where('user_id', userID)
        .related('subscriptions')
        .one()
  ),
}
