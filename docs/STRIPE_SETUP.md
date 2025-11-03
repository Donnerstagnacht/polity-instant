# Stripe Subscription Integration Guide

This guide will help you set up Stripe subscriptions for the Polity platform.

## Overview

The subscription system allows users to support the platform with monthly contributions:

- **Running Costs**: €2/month - Covers server and infrastructure costs
- **Development**: €10/month - Funds new features and improvements
- **Your Choice**: Custom amount - User chooses their monthly contribution

## Setup Instructions

### 1. Create a Stripe Account

1. Go to [stripe.com](https://stripe.com) and sign up
2. Complete your account setup
3. Switch to **Test Mode** using the toggle in the Stripe Dashboard

### 2. Get Your API Keys

1. Go to [Stripe Dashboard → Developers → API Keys](https://dashboard.stripe.com/test/apikeys)
2. Copy your **Secret Key** (starts with `sk_test_`)
3. Copy your **Publishable Key** (starts with `pk_test_`)

### 3. Create Products and Prices

#### Option A: Using Stripe Dashboard (Recommended)

1. Go to [Products](https://dashboard.stripe.com/test/products)
2. Click **"+ Add product"**

**For "Running Costs" (€2/month):**

- Name: `Running Costs`
- Description: `Help cover server costs, hosting, and infrastructure`
- Pricing model: `Standard pricing`
- Price: `€2.00 EUR`
- Billing period: `Monthly`
- Click **"Save product"**
- Copy the **Price ID** (starts with `price_`)

**For "Development" (€10/month):**

- Name: `Development`
- Description: `Fund new features, improvements, and platform growth`
- Pricing model: `Standard pricing`
- Price: `€10.00 EUR`
- Billing period: `Monthly`
- Click **"Save product"**
- Copy the **Price ID** (starts with `price_`)

#### Option B: Using Stripe CLI

```bash
# Install Stripe CLI
# Windows: scoop install stripe
# Mac: brew install stripe/stripe-cli/stripe
# Linux: Download from https://github.com/stripe/stripe-cli/releases

# Login to Stripe
stripe login

# Create Running Costs product and price
stripe products create \
  --name="Running Costs" \
  --description="Help cover server costs, hosting, and infrastructure"

stripe prices create \
  --product=<PRODUCT_ID_FROM_ABOVE> \
  --unit-amount=200 \
  --currency=eur \
  --recurring[interval]=month

# Create Development product and price
stripe products create \
  --name="Development" \
  --description="Fund new features, improvements, and platform growth"

stripe prices create \
  --product=<PRODUCT_ID_FROM_ABOVE> \
  --unit-amount=1000 \
  --currency=eur \
  --recurring[interval]=month
```

### 4. Configure Environment Variables

Update your `.env.local` file with the values you copied:

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret  # See step 5

# Stripe Price IDs
NEXT_PUBLIC_STRIPE_PRICE_RUNNING=price_your_2euro_price_id
NEXT_PUBLIC_STRIPE_PRICE_DEVELOPMENT=price_your_10euro_price_id

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Set Up Webhooks (For Production)

Webhooks allow Stripe to notify your application about subscription events.

#### Development (Using Stripe CLI)

```bash
# Forward webhooks to your local dev server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# This will output a webhook signing secret (whsec_...)
# Copy it to STRIPE_WEBHOOK_SECRET in .env.local
```

#### Production

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click **"+ Add endpoint"**
3. Enter your endpoint URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Update `STRIPE_WEBHOOK_SECRET` in your production environment variables

### 6. Enable Stripe Customer Portal

1. Go to [Stripe Dashboard → Settings → Billing → Customer Portal](https://dashboard.stripe.com/test/settings/billing/portal)
2. Click **"Activate"**
3. Configure settings:
   - **Products**: Select which products customers can subscribe to
   - **Features**: Enable "Customers can update subscriptions"
   - **Features**: Enable "Customers can cancel subscriptions"
   - **Business information**: Add your company details
4. Click **"Save changes"**

### 7. Test the Integration

1. Restart your Next.js dev server:

   ```bash
   npm run dev
   ```

2. Navigate to `/user/[your-id]/edit`

3. Try subscribing with Stripe's test card numbers:

   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - **Requires authentication**: `4000 0025 0000 3155`
   - Use any future expiry date, any 3-digit CVC, and any ZIP code

4. Complete the checkout flow

5. Check the Stripe Dashboard to see the subscription

## User Flow

### Subscribing

1. User navigates to `/user/[id]/edit`
2. Scrolls to "Support Polity" section
3. Clicks "Subscribe" on desired tier (or enters custom amount)
4. Redirected to Stripe Checkout
5. Enters payment details
6. Redirected back to user page with `?success=true`

### Managing Subscription

To allow users to manage their subscriptions (cancel, update payment method, etc.):

1. Store the Stripe Customer ID in your database when checkout completes
2. Add a "Manage Subscription" button that calls `/api/stripe/create-portal`
3. User is redirected to Stripe Customer Portal
4. After managing subscription, user is redirected back to your app

## Database Integration (TODO)

You'll need to store subscription data in your database. Here's what to track:

```typescript
// Add to your user/profile schema
interface UserSubscription {
  stripeCustomerId: string; // Stripe Customer ID
  stripeSubscriptionId: string; // Stripe Subscription ID
  stripePriceId: string; // Which price they're subscribed to
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  currentPeriodEnd: Date; // When current period ends
  cancelAtPeriodEnd: boolean; // Is subscription set to cancel?
}
```

Update the webhook handler in `/src/app/api/stripe/webhook/route.ts` to save this data when subscriptions are created/updated.

## Production Checklist

Before going live:

- [ ] Switch from Test Mode to Live Mode in Stripe Dashboard
- [ ] Update `.env.local` with live API keys (`sk_live_...`)
- [ ] Create products and prices in live mode
- [ ] Update price IDs in environment variables
- [ ] Set up production webhook endpoint
- [ ] Test with real card (small amount)
- [ ] Configure Customer Portal settings
- [ ] Set up proper error handling and logging
- [ ] Add subscription status to user profile
- [ ] Implement subscription cancellation flow
- [ ] Add email notifications for successful subscriptions
- [ ] Comply with GDPR/data protection requirements
- [ ] Add terms of service and privacy policy links

## Troubleshooting

### "No checkout URL returned"

- Check that your Stripe API keys are correct
- Verify price IDs exist in your Stripe account
- Check browser console for detailed error messages

### Webhook errors

- Ensure `STRIPE_WEBHOOK_SECRET` is set correctly
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- Check webhook logs in Stripe Dashboard

### Test cards not working

- Make sure you're in Test Mode
- Use Stripe's official test card numbers
- Clear browser cache and cookies

## Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe Customer Portal](https://stripe.com/docs/billing/subscriptions/customer-portal)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

## Support

If you encounter issues:

1. Check Stripe Dashboard logs
2. Check your application logs
3. Use Stripe CLI for debugging: `stripe logs tail`
4. Contact Stripe support (they're very helpful!)
