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

export const stripeCreateCheckoutFn = createServerFn({ method: 'POST' })
  .validator(
    (data: unknown) =>
      data as {
        priceId?: string
        amount?: number
        userId?: string
        origin?: string
      },
  )
  .handler(async ({ data }) => {
    try {
      const stripe = getStripe()
      const { priceId, amount, userId, origin: clientOrigin } = data
      const origin = clientOrigin || process.env.VITE_APP_URL

      // Check if customer already exists
      let existingCustomer: Stripe.Customer | undefined
      if (userId) {
        try {
          const customers = await stripe.customers.list({ limit: 100 })
          existingCustomer = customers.data.find((c) => c.metadata?.userId === userId)

          // Also check recent checkout sessions
          if (!existingCustomer) {
            const sessions = await stripe.checkout.sessions.list({ limit: 100 })
            const userSession = sessions.data.find(
              (s) => s.metadata?.userId === userId && s.customer,
            )
            if (userSession && userSession.customer) {
              const customerId =
                typeof userSession.customer === 'string'
                  ? userSession.customer
                  : userSession.customer.id
              existingCustomer = customers.data.find((c) => c.id === customerId)
            }
          }

          if (existingCustomer) {
            // Check for active subscriptions
            const subscriptions = await stripe.subscriptions.list({
              customer: existingCustomer.id,
              status: 'active',
              limit: 10,
            })

            if (subscriptions.data.length > 0) {
              // Cancel all existing active subscriptions
              for (const sub of subscriptions.data) {
                await stripe.subscriptions.cancel(sub.id)
              }
            }
          }
        } catch {
          // Continue with checkout creation even if this fails
        }
      }

      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        mode: 'subscription',
        success_url: `${origin}/user/${userId}/edit?success=true`,
        cancel_url: `${origin}/user/${userId}/edit?canceled=true`,
        line_items: [],
        metadata: userId ? { userId } : undefined,
        ...(existingCustomer && { customer: existingCustomer.id }),
        ...(userId && {
          subscription_data: {
            metadata: { userId },
          },
        }),
      }

      if (priceId) {
        sessionParams.line_items = [{ price: priceId, quantity: 1 }]
      } else if (amount) {
        sessionParams.line_items = [
          {
            price_data: {
              currency: 'eur',
              product_data: { name: 'Custom Monthly Contribution' },
              recurring: { interval: 'month' },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ]
      } else {
        throw new Error('Either priceId or amount is required')
      }

      const session = await stripe.checkout.sessions.create(sessionParams)
      return { url: session.url }
    } catch (err) {
      const error = err as Error
      console.error('Stripe checkout error:', {
        message: error.message,
        stack: error.stack,
      })
      throw new Error(error.message)
    }
  })
