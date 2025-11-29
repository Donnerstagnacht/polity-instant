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

interface CheckoutRequestBody {
  priceId?: string;
  amount?: number; // cents for custom amount
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const stripe = getStripe();
    const { priceId, amount } = (await req.json()) as CheckoutRequestBody;
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL;

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      success_url: `${origin}/user?success=true`,
      cancel_url: `${origin}/user?canceled=true`,
      line_items: [],
    };

    if (priceId) {
      // Fixed price subscription (€2 or €10)
      sessionParams.line_items = [{ price: priceId, quantity: 1 }];
    } else if (amount) {
      // Custom amount subscription
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
      ];
    } else {
      return NextResponse.json({ error: 'Either priceId or amount is required' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return NextResponse.json({ url: session.url });
  } catch (err) {
    const error = err as Error;
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
