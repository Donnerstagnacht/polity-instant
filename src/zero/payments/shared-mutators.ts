import { defineMutator } from '@rocicorp/zero'
import { zql } from '../schema'
import {
  createStripeCustomerSchema,
  updateStripeSubscriptionSchema,
  createStripePaymentSchema,
  createPaymentSchema,
  deletePaymentSchema,
} from './schema'

/** Shared mutators — run on both client and server. Server mutators may override these. */
export const paymentSharedMutators = {
  // Create a stripe customer record
  createCustomer: defineMutator(
    createStripeCustomerSchema,
    async ({ tx, args }) => {
      const now = Date.now()
      await tx.mutate.stripe_customer.insert({
        ...args,
        created_at: now,
        updated_at: now,
      })
    }
  ),

  // Update subscription details
  updateSubscription: defineMutator(
    updateStripeSubscriptionSchema,
    async ({ tx, args }) => {
      await tx.mutate.stripe_subscription.update({
        ...args,
        updated_at: Date.now(),
      })
    }
  ),

  // Record a stripe payment
  // NOTE: server-only mutator — should be called from server context only
  recordPayment: defineMutator(
    createStripePaymentSchema,
    async ({ tx, args }) => {
      const now = Date.now()
      await tx.mutate.stripe_payment.insert({
        ...args,
        created_at: now,
      })
    }
  ),

  // Create a payment
  createPayment: defineMutator(
    createPaymentSchema,
    async ({ tx, args }) => {
      await tx.mutate.payment.insert({
        ...args,
        created_at: Date.now(),
      })
    }
  ),

  // Delete a payment
  deletePayment: defineMutator(
    deletePaymentSchema,
    async ({ tx, args }) => {
      await tx.mutate.payment.delete({ id: args.id })
    }
  ),
}
