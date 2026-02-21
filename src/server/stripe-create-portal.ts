import { createServerFn } from '@tanstack/start'
import Stripe from 'stripe'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not defined')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-10-29.clover',
  })
}

export const stripeCreatePortalFn = createServerFn({ method: 'POST' })
  .validator(
    (data: unknown) =>
      data as {
        customerId: string
        returnOrigin?: string
      },
  )
  .handler(async ({ data }) => {
    try {
      const stripe = getStripe()
      const { customerId, returnOrigin } = data

      if (!customerId) {
        throw new Error('Customer ID is required')
      }

      const origin = returnOrigin || process.env.NEXT_PUBLIC_APP_URL

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
