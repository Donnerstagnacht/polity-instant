import { NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not defined');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-10-29.clover',
  });
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const stripe = getStripe();
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Search for customer by metadata (if you store userId in customer metadata)
    // Also get recent customers in case metadata hasn't been set yet
    const customers = await stripe.customers.list({
      limit: 100,
    });
    // Find customer by checking metadata for userId
    let customer = customers.data.find(c => c.metadata?.userId === userId);

    // If not found by metadata, check recent checkout sessions for this userId
    if (!customer) {
      try {
        const sessions = await stripe.checkout.sessions.list({
          limit: 100,
        });

        const userSession = sessions.data.find(s => s.metadata?.userId === userId && s.customer);

        if (userSession && userSession.customer) {
          const customerId =
            typeof userSession.customer === 'string'
              ? userSession.customer
              : userSession.customer.id;
          customer = customers.data.find(c => c.id === customerId);

          if (customer) {
            // Update customer metadata for future lookups
            await stripe.customers.update(customerId, {
              metadata: { userId },
            });
          }
        }
      } catch {
        // Ignore metadata update errors
      }
    }

    if (!customer) {
      return NextResponse.json({
        hasSubscription: false,
        subscription: null,
        allSubscriptions: [],
        payments: [],
      });
    }

    // Get active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'all',
      limit: 10,
    });

    const activeSubscription = subscriptions.data.find(sub => sub.status === 'active');

    // Get recent invoices/payments
    const invoices = await stripe.invoices.list({
      customer: customer.id,
      limit: 10,
    });

    const payments = invoices.data.map(invoice => ({
      id: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: invoice.status === 'paid' ? 'paid' : 'failed',
      createdAt: new Date(invoice.created * 1000).toISOString(),
      paidAt: invoice.status_transitions?.paid_at
        ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
        : null,
    }));

    // Helper to safely convert timestamp to ISO string
    const timestampToISO = (timestamp: number | undefined): string => {
      if (!timestamp) {
        console.warn('[API] Missing timestamp, using current date');
        return new Date().toISOString();
      }
      return new Date(timestamp * 1000).toISOString();
    };

    return NextResponse.json({
      hasSubscription: !!activeSubscription,
      subscription: activeSubscription
        ? {
            id: activeSubscription.id,
            status: activeSubscription.status,
            amount: activeSubscription.items.data[0]?.price.unit_amount || 0,
            currency: activeSubscription.currency,
            interval: activeSubscription.items.data[0]?.price.recurring?.interval || 'month',
            currentPeriodStart: timestampToISO((activeSubscription as any).current_period_start),
            currentPeriodEnd: timestampToISO((activeSubscription as any).current_period_end),
            cancelAtPeriodEnd: activeSubscription.cancel_at_period_end,
          }
        : null,
      allSubscriptions: subscriptions.data.map(sub => ({
        id: sub.id,
        status: sub.status,
        amount: sub.items.data[0]?.price.unit_amount || 0,
        currency: sub.currency,
        interval: sub.items.data[0]?.price.recurring?.interval || 'month',
        createdAt: new Date(sub.created * 1000).toISOString(),
        canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
      })),
      payments,
    });
  } catch (err) {
    const error = err as Error;
    console.error('Subscription status error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
