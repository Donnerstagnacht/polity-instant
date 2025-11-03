import { NextResponse } from 'next/server';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
});

export async function POST(req: Request): Promise<NextResponse> {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
  }

  try {
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
        // TODO: Store customer/subscription in your database
        console.log('Checkout completed:', {
          sessionId: session.id,
          customerId: session.customer,
          subscriptionId: session.subscription,
        });
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        // TODO: Update subscription status in your database
        console.log('Subscription updated:', {
          subscriptionId: subscription.id,
          status: subscription.status,
        });
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        // TODO: Handle subscription cancellation in your database
        console.log('Subscription deleted:', {
          subscriptionId: subscription.id,
        });
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription;
        console.log('Payment succeeded:', {
          invoiceId: invoice.id,
          subscriptionId:
            typeof subscriptionId === 'string' ? subscriptionId : subscriptionId?.id || null,
        });
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription;
        console.log('Payment failed:', {
          invoiceId: invoice.id,
          subscriptionId:
            typeof subscriptionId === 'string' ? subscriptionId : subscriptionId?.id || null,
        });
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
