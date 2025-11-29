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
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
  }

  try {
    const stripe = getStripe();

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
        // TODO: Store customer/subscription in your database
        // const session = event.data.object as Stripe.Checkout.Session;
        break;
      }
      case 'customer.subscription.updated': {
        // TODO: Update subscription status in your database
        // const subscription = event.data.object as Stripe.Subscription;
        break;
      }
      case 'customer.subscription.deleted': {
        // TODO: Handle subscription cancellation in your database
        // const subscription = event.data.object as Stripe.Subscription;
        break;
      }
      case 'invoice.payment_succeeded': {
        // TODO: Handle successful payment
        // const invoice = event.data.object as Stripe.Invoice;
        // const subscriptionId = (invoice as any).subscription;
        break;
      }
      case 'invoice.payment_failed': {
        // TODO: Handle failed payment
        // const invoice = event.data.object as Stripe.Invoice;
        // const subscriptionId = (invoice as any).subscription;
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err instanceof Error ? err.message : String(err));
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 400 }
    );
  }
}
