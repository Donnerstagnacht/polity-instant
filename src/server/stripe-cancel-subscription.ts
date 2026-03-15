import { createServerFn } from '@tanstack/react-start'
import Stripe from 'stripe'
import { z } from 'zod'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not defined')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-10-29.clover',
  })
}

const stripeCancelSubscriptionSchema = z.object({
  subscriptionId: z.string(),
})

export const stripeCancelSubscriptionFn = createServerFn({ method: 'POST' })
  .validator(stripeCancelSubscriptionSchema.parse)
  .handler(async ({ data }) => {
    try {
      const stripe = getStripe()
      const { subscriptionId } = data

      if (!subscriptionId) {
        throw new Error('subscriptionId is required')
      }

      const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId)

      return {
        success: true,
        subscription: {
          id: canceledSubscription.id,
          status: canceledSubscription.status,
        },
      }
    } catch (err) {
      const error = err as Error
      console.error('Cancel subscription error:', error)
      throw new Error(error.message)
    }
  })
