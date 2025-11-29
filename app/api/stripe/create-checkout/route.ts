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
  userId?: string; // User ID to associate with the subscription
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const stripe = getStripe();
    const { priceId, amount, userId } = (await req.json()) as CheckoutRequestBody;
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL;

    // Validate Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured');
      return NextResponse.json(
        { error: 'Stripe is not configured on the server' },
        { status: 500 }
      );
    }

    // Check if customer already exists
    let existingCustomer: Stripe.Customer | undefined;
    if (userId) {
      try {
        // Search for existing customer by metadata
        const customers = await stripe.customers.list({
          limit: 100,
        });
        existingCustomer = customers.data.find(c => c.metadata?.userId === userId);

        // Also check recent checkout sessions
        if (!existingCustomer) {
          const sessions = await stripe.checkout.sessions.list({
            limit: 100,
          });
          const userSession = sessions.data.find(s => s.metadata?.userId === userId && s.customer);
          if (userSession && userSession.customer) {
            const customerId =
              typeof userSession.customer === 'string'
                ? userSession.customer
                : userSession.customer.id;
            existingCustomer = customers.data.find(c => c.id === customerId);
          }
        }

        if (existingCustomer) {
          // Check for active subscriptions
          const subscriptions = await stripe.subscriptions.list({
            customer: existingCustomer.id,
            status: 'active',
            limit: 10,
          });

          if (subscriptions.data.length > 0) {
            // Cancel all existing active subscriptions
            for (const sub of subscriptions.data) {
              await stripe.subscriptions.cancel(sub.id);
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
      // Session metadata will be copied to the customer and subscription
      metadata: userId ? { userId } : undefined,
      // If customer exists, use it; otherwise, a new one will be created
      ...(existingCustomer && { customer: existingCustomer.id }),
      // Also explicitly set subscription metadata
      ...(userId && {
        subscription_data: {
          metadata: { userId },
        },
      }),
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
    console.error('Stripe checkout error:', {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
