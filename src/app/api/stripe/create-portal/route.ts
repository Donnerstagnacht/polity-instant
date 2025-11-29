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

interface PortalRequestBody {
  customerId: string;
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const stripe = getStripe();
    const { customerId } = (await req.json()) as PortalRequestBody;

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL;

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/user`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const error = err as Error;
    console.error('Stripe portal error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
