import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { init, id as generateId } from '@instantdb/admin';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not defined');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-10-29.clover',
  });
}

function getDB() {
  if (!process.env.NEXT_PUBLIC_INSTANT_APP_ID) {
    throw new Error('NEXT_PUBLIC_INSTANT_APP_ID is not defined');
  }
  if (!process.env.INSTANT_ADMIN_TOKEN) {
    throw new Error('INSTANT_ADMIN_TOKEN is not defined');
  }
  return init({
    appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID,
    adminToken: process.env.INSTANT_ADMIN_TOKEN,
  });
}

export async function POST(req: Request): Promise<NextResponse> {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const db = getDB();

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        let userId = session.metadata?.userId;

        // If userId not in session metadata, try to get it from the subscription
        if (!userId && session.subscription) {
          try {
            const subscriptionId =
              typeof session.subscription === 'string'
                ? session.subscription
                : session.subscription.id;
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            userId = subscription.metadata?.userId;
          } catch (error) {
            console.error('Error retrieving subscription for userId:', error);
          }
        }

        // Update the Stripe customer with userId in metadata
        if (userId && session.customer) {
          const customerId =
            typeof session.customer === 'string' ? session.customer : session.customer.id;

          try {
            await stripe.customers.update(customerId, {
              metadata: { userId },
            });
          } catch {
            // Ignore customer metadata update errors
          }
        }

        if (userId && session.customer) {
          try {
            // Store or update customer in InstantDB
            const customerId =
              typeof session.customer === 'string' ? session.customer : session.customer.id;

            // Check if customer exists
            const existingCustomers = await db.query({
              stripeCustomers: {
                $: {
                  where: {
                    stripeCustomerId: customerId,
                  },
                },
              },
            });

            const customerData = {
              stripeCustomerId: customerId,
              email: session.customer_details?.email || '',
              updatedAt: new Date().toISOString(),
            };

            if (existingCustomers.stripeCustomers.length === 0) {
              // Create new customer
              await db.transact([
                db.tx.stripeCustomers[generateId()]
                  .update({
                    ...customerData,
                    createdAt: new Date().toISOString(),
                  })
                  .link({ user: userId }),
              ]);
            } else {
              // Update existing customer
              await db.transact([
                db.tx.stripeCustomers[existingCustomers.stripeCustomers[0].id].update(customerData),
              ]);
            }

            // If there's a subscription, fetch and store it
            if (session.subscription) {
              const subscriptionId =
                typeof session.subscription === 'string'
                  ? session.subscription
                  : session.subscription.id;

              const subscription = await stripe.subscriptions.retrieve(subscriptionId);

              await db.transact([
                db.tx.stripeSubscriptions[generateId()]
                  .update({
                    stripeSubscriptionId: subscription.id,
                    stripeCustomerId: customerId,
                    status: subscription.status,
                    currentPeriodStart: new Date(
                      (subscription as any).current_period_start * 1000
                    ).toISOString(),
                    currentPeriodEnd: new Date(
                      (subscription as any).current_period_end * 1000
                    ).toISOString(),
                    cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
                    amount: subscription.items.data[0]?.price.unit_amount || 0,
                    currency: subscription.currency,
                    interval: subscription.items.data[0]?.price.recurring?.interval || 'month',
                    createdAt: new Date((subscription as any).created * 1000).toISOString(),
                    updatedAt: new Date().toISOString(),
                  })
                  .link({
                    customer: existingCustomers.stripeCustomers[0]?.id,
                  }),
              ]);
            }
          } catch (error) {
            console.error('Error storing customer/subscription:', error);
          }
        }
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        try {
          // Find and update the subscription
          const existingSubs = await db.query({
            stripeSubscriptions: {
              $: {
                where: {
                  stripeSubscriptionId: subscription.id,
                },
              },
            },
          });

          if (existingSubs.stripeSubscriptions.length > 0) {
            const subId = existingSubs.stripeSubscriptions[0].id;
            await db.transact([
              db.tx.stripeSubscriptions[subId].update({
                status: subscription.status,
                currentPeriodStart: new Date(
                  (subscription as any).current_period_start * 1000
                ).toISOString(),
                currentPeriodEnd: new Date(
                  (subscription as any).current_period_end * 1000
                ).toISOString(),
                cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
                updatedAt: new Date().toISOString(),
                canceledAt: (subscription as any).canceled_at
                  ? new Date((subscription as any).canceled_at * 1000).toISOString()
                  : undefined,
              }),
            ]);
          }
        } catch (error) {
          console.error('Error updating subscription:', error);
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        try {
          const existingSubs = await db.query({
            stripeSubscriptions: {
              $: {
                where: {
                  stripeSubscriptionId: subscription.id,
                },
              },
            },
          });

          if (existingSubs.stripeSubscriptions.length > 0) {
            const subId = existingSubs.stripeSubscriptions[0].id;
            await db.transact([
              db.tx.stripeSubscriptions[subId].update({
                status: 'canceled',
                updatedAt: new Date().toISOString(),
                canceledAt: new Date().toISOString(),
              }),
            ]);
          }
        } catch (error) {
          console.error('Error deleting subscription:', error);
        }
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription;
        try {
          const customerId =
            typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id || '';

          // Find the customer
          const customers = await db.query({
            stripeCustomers: {
              $: {
                where: {
                  stripeCustomerId: customerId,
                },
              },
            },
          });

          if (customers.stripeCustomers.length > 0) {
            const customerEntityId = customers.stripeCustomers[0].id;

            // Store the payment
            await db.transact([
              db.tx.stripePayments[generateId()]
                .update({
                  stripeInvoiceId: invoice.id,
                  stripeCustomerId: customerId,
                  stripeSubscriptionId:
                    typeof subscriptionId === 'string' ? subscriptionId : subscriptionId?.id || '',
                  amount: invoice.amount_paid,
                  currency: invoice.currency,
                  status: 'paid',
                  createdAt: new Date(invoice.created * 1000).toISOString(),
                  paidAt: invoice.status_transitions?.paid_at
                    ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
                    : new Date().toISOString(),
                })
                .link({ customer: customerEntityId }),
            ]);
          }
        } catch (error) {
          console.error('Error storing payment:', error);
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription;

        try {
          const customerId =
            typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id || '';

          const customers = await db.query({
            stripeCustomers: {
              $: {
                where: {
                  stripeCustomerId: customerId,
                },
              },
            },
          });

          if (customers.stripeCustomers.length > 0) {
            const customerEntityId = customers.stripeCustomers[0].id;

            await db.transact([
              db.tx.stripePayments[generateId()]
                .update({
                  stripeInvoiceId: invoice.id,
                  stripeCustomerId: customerId,
                  stripeSubscriptionId:
                    typeof subscriptionId === 'string' ? subscriptionId : subscriptionId?.id || '',
                  amount: invoice.amount_due,
                  currency: invoice.currency,
                  status: 'failed',
                  createdAt: new Date(invoice.created * 1000).toISOString(),
                })
                .link({ customer: customerEntityId }),
            ]);
          }
        } catch (error) {
          console.error('Error storing failed payment:', error);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const error = err as Error;
    console.error('Webhook error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
