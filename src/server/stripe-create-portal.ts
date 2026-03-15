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

const stripeCreatePortalSchema = z.object({
  customerId: z.string(),
  returnOrigin: z.string().optional(),
})

export const stripeCreatePortalFn = createServerFn({ method: 'POST' })
  .validator(stripeCreatePortalSchema.parse)
  .handler(async ({ data }) => {
    try {
      const stripe = getStripe()
      const { customerId, returnOrigin } = data

      if (!customerId) {
        throw new Error('Customer ID is required')
      }

      const origin = returnOrigin || process.env.VITE_APP_URL

      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${origin}/user`,
      })

      return { url: session.url }
    } catch (err) {
      const error = err as Error
      console.error('Stripe portal error:', error)
      throw new Error(error.message)
    }
  })
