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

export const stripeSubscriptionStatusFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => data as { userId: string })
  .handler(async ({ data }) => {
    try {
      const stripe = getStripe()
      const { userId } = data

      if (!userId) {
        throw new Error('userId is required')
      }

      // Search for customer by metadata
      const customers = await stripe.customers.list({ limit: 100 })
      let customer = customers.data.find((c) => c.metadata?.userId === userId)

      // If not found by metadata, check recent checkout sessions
      if (!customer) {
        try {
          const sessions = await stripe.checkout.sessions.list({ limit: 100 })
          const userSession = sessions.data.find(
            (s) => s.metadata?.userId === userId && s.customer,
          )

          if (userSession && userSession.customer) {
            const customerId =
              typeof userSession.customer === 'string'
                ? userSession.customer
                : userSession.customer.id
            customer = customers.data.find((c) => c.id === customerId)

            if (customer) {
              await stripe.customers.update(customerId, {
                metadata: { userId },
              })
            }
          }
        } catch {
          // Ignore metadata update errors
        }
      }

      if (!customer) {
        return {
          hasSubscription: false,
          subscription: null,
          allSubscriptions: [],
          payments: [],
        }
      }

      // Get all subscriptions for this customer
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'all',
        limit: 10,
      })

      const activeSubscription = subscriptions.data.find((sub) => sub.status === 'active')

      // Get recent invoices/payments
      const invoices = await stripe.invoices.list({
        customer: customer.id,
        limit: 10,
      })

      const payments = invoices.data.map((invoice) => ({
        id: invoice.id,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: invoice.status === 'paid' ? 'paid' : 'failed',
        createdAt: new Date(invoice.created * 1000).toISOString(),
        paidAt: invoice.status_transitions?.paid_at
          ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
          : null,
      }))

      const timestampToISO = (timestamp: number | undefined): string => {
        if (!timestamp) {
          console.warn('[API] Missing timestamp, using current date')
          return new Date().toISOString()
        }
        return new Date(timestamp * 1000).toISOString()
      }

      return {
        hasSubscription: !!activeSubscription,
        subscription: activeSubscription
          ? {
              id: activeSubscription.id,
              status: activeSubscription.status,
              amount: activeSubscription.items.data[0]?.price.unit_amount || 0,
              currency: activeSubscription.currency,
              interval:
                activeSubscription.items.data[0]?.price.recurring?.interval || 'month',
              currentPeriodStart: timestampToISO(
                (activeSubscription as any).current_period_start,
              ),
              currentPeriodEnd: timestampToISO(
                (activeSubscription as any).current_period_end,
              ),
              cancelAtPeriodEnd: activeSubscription.cancel_at_period_end,
            }
          : null,
        allSubscriptions: subscriptions.data.map((sub) => ({
          id: sub.id,
          status: sub.status,
          amount: sub.items.data[0]?.price.unit_amount || 0,
          currency: sub.currency,
          interval: sub.items.data[0]?.price.recurring?.interval || 'month',
          createdAt: new Date(sub.created * 1000).toISOString(),
          canceledAt: sub.canceled_at
            ? new Date(sub.canceled_at * 1000).toISOString()
            : null,
        })),
        payments,
      }
    } catch (err) {
      const error = err as Error
      console.error('Subscription status error:', error)
      throw new Error(error.message)
    }
  })
