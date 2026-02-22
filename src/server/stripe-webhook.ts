import { createServerFn } from '@tanstack/react-start'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not defined')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-10-29.clover',
  })
}

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

/**
 * Stripe webhook handler.
 * NOTE: This server function expects the raw body and signature to be passed in
 * from a thin API route wrapper that reads the raw request body, since Stripe
 * signature verification requires the raw body string.
 */
export const stripeWebhookFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => data as { rawBody: string; signature: string })
  .handler(async ({ data }) => {
    const { rawBody, signature } = data

    if (!signature) {
      throw new Error('No signature provided')
    }

    try {
      const stripe = getStripe()
      const supabase = getSupabase()

      if (!process.env.STRIPE_WEBHOOK_SECRET) {
        throw new Error('STRIPE_WEBHOOK_SECRET is not defined')
      }

      const event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      )

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session
          let userId = session.metadata?.userId

          // If userId not in session metadata, try to get it from the subscription
          if (!userId && session.subscription) {
            try {
              const subscriptionId =
                typeof session.subscription === 'string'
                  ? session.subscription
                  : session.subscription.id
              const subscription = await stripe.subscriptions.retrieve(subscriptionId)
              userId = subscription.metadata?.userId
            } catch (error) {
              console.error('Error retrieving subscription for userId:', error)
            }
          }

          // Update the Stripe customer with userId in metadata
          if (userId && session.customer) {
            const customerId =
              typeof session.customer === 'string' ? session.customer : session.customer.id

            try {
              await stripe.customers.update(customerId, {
                metadata: { userId },
              })
            } catch {
              // Ignore customer metadata update errors
            }
          }

          if (userId && session.customer) {
            try {
              const customerId =
                typeof session.customer === 'string' ? session.customer : session.customer.id

              // Check if customer exists
              const { data: existingCustomers } = await supabase
                .from('stripe_customer')
                .select('*')
                .eq('stripe_customer_id', customerId)

              const customerData = {
                stripe_customer_id: customerId,
                email: session.customer_details?.email || '',
                updated_at: new Date().toISOString(),
              }

              let customerEntityId: string

              if (!existingCustomers || existingCustomers.length === 0) {
                // Create new customer
                const { data: newCustomer } = await supabase
                  .from('stripe_customer')
                  .insert({
                    ...customerData,
                    user_id: userId,
                    created_at: new Date().toISOString(),
                  })
                  .select('id')
                  .single()

                customerEntityId = newCustomer!.id
              } else {
                // Update existing customer
                await supabase
                  .from('stripe_customer')
                  .update(customerData)
                  .eq('id', existingCustomers[0].id)

                customerEntityId = existingCustomers[0].id
              }

              // If there's a subscription, fetch and store it
              if (session.subscription) {
                const subscriptionId =
                  typeof session.subscription === 'string'
                    ? session.subscription
                    : session.subscription.id

                const subscription = await stripe.subscriptions.retrieve(subscriptionId)

                await supabase.from('stripe_subscription').insert({
                  customer_id: customerEntityId,
                  stripe_subscription_id: subscription.id,
                  stripe_customer_id: customerId,
                  status: subscription.status,
                  current_period_start: new Date(
                    (subscription as any).current_period_start * 1000,
                  ).toISOString(),
                  current_period_end: new Date(
                    (subscription as any).current_period_end * 1000,
                  ).toISOString(),
                  cancel_at_period_end: (subscription as any).cancel_at_period_end,
                  amount: subscription.items.data[0]?.price.unit_amount || 0,
                  currency: subscription.currency,
                  interval: subscription.items.data[0]?.price.recurring?.interval || 'month',
                  created_at: new Date((subscription as any).created * 1000).toISOString(),
                  updated_at: new Date().toISOString(),
                })
              }
            } catch (error) {
              console.error('Error storing customer/subscription:', error)
            }
          }
          break
        }
        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription

          try {
            const { data: existingSubs } = await supabase
              .from('stripe_subscription')
              .select('id')
              .eq('stripe_subscription_id', subscription.id)

            if (existingSubs && existingSubs.length > 0) {
              await supabase
                .from('stripe_subscription')
                .update({
                  status: subscription.status,
                  current_period_start: new Date(
                    (subscription as any).current_period_start * 1000,
                  ).toISOString(),
                  current_period_end: new Date(
                    (subscription as any).current_period_end * 1000,
                  ).toISOString(),
                  cancel_at_period_end: (subscription as any).cancel_at_period_end,
                  updated_at: new Date().toISOString(),
                  canceled_at: (subscription as any).canceled_at
                    ? new Date((subscription as any).canceled_at * 1000).toISOString()
                    : null,
                })
                .eq('id', existingSubs[0].id)
            }
          } catch (error) {
            console.error('Error updating subscription:', error)
          }
          break
        }
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription

          try {
            const { data: existingSubs } = await supabase
              .from('stripe_subscription')
              .select('id')
              .eq('stripe_subscription_id', subscription.id)

            if (existingSubs && existingSubs.length > 0) {
              await supabase
                .from('stripe_subscription')
                .update({
                  status: 'canceled',
                  updated_at: new Date().toISOString(),
                  canceled_at: new Date().toISOString(),
                })
                .eq('id', existingSubs[0].id)
            }
          } catch (error) {
            console.error('Error deleting subscription:', error)
          }
          break
        }
        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice
          const subscriptionId = (invoice as any).subscription
          try {
            const customerId =
              typeof invoice.customer === 'string'
                ? invoice.customer
                : invoice.customer?.id || ''

            const { data: customers } = await supabase
              .from('stripe_customer')
              .select('id')
              .eq('stripe_customer_id', customerId)

            if (customers && customers.length > 0) {
              const customerEntityId = customers[0].id

              await supabase.from('stripe_payment').insert({
                customer_id: customerEntityId,
                stripe_invoice_id: invoice.id,
                stripe_customer_id: customerId,
                stripe_subscription_id:
                  typeof subscriptionId === 'string' ? subscriptionId : subscriptionId?.id || '',
                amount: invoice.amount_paid,
                currency: invoice.currency,
                status: 'paid',
                created_at: new Date(invoice.created * 1000).toISOString(),
                paid_at: invoice.status_transitions?.paid_at
                  ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
                  : new Date().toISOString(),
              })
            }
          } catch (error) {
            console.error('Error storing payment:', error)
          }
          break
        }
        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice
          const subscriptionId = (invoice as any).subscription

          try {
            const customerId =
              typeof invoice.customer === 'string'
                ? invoice.customer
                : invoice.customer?.id || ''

            const { data: customers } = await supabase
              .from('stripe_customer')
              .select('id')
              .eq('stripe_customer_id', customerId)

            if (customers && customers.length > 0) {
              const customerEntityId = customers[0].id

              await supabase.from('stripe_payment').insert({
                customer_id: customerEntityId,
                stripe_invoice_id: invoice.id,
                stripe_customer_id: customerId,
                stripe_subscription_id:
                  typeof subscriptionId === 'string' ? subscriptionId : subscriptionId?.id || '',
                amount: invoice.amount_due,
                currency: invoice.currency,
                status: 'failed',
                created_at: new Date(invoice.created * 1000).toISOString(),
              })
            }
          } catch (error) {
            console.error('Error storing failed payment:', error)
          }
          break
        }
      }

      return { received: true }
    } catch (err) {
      const error = err as Error
      console.error('Webhook error:', error.message)
      throw new Error(error.message)
    }
  })
