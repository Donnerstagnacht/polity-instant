import { NextResponse } from 'next/server';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
});

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { subscriptionId } = await req.json();

    if (!subscriptionId) {
      return NextResponse.json({ error: 'subscriptionId is required' }, { status: 400 });
    }

    console.log('Canceling subscription:', subscriptionId);

    // Cancel the subscription immediately
    const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId);

    console.log('Subscription canceled successfully:', canceledSubscription.id);

    return NextResponse.json({
      success: true,
      subscription: {
        id: canceledSubscription.id,
        status: canceledSubscription.status,
      },
    });
  } catch (err) {
    const error = err as Error;
    console.error('Cancel subscription error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
