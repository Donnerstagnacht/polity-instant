-- =============================================================================
-- 12_payment.sql — Payments, Stripe customers, subscriptions, invoices
-- =============================================================================

-- Payment table
CREATE TABLE IF NOT EXISTS public.payment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount INTEGER,
  label TEXT,
  type TEXT,
  payer_user_id UUID REFERENCES public."user" (id) ON DELETE SET NULL,
  payer_group_id UUID,
  receiver_user_id UUID REFERENCES public."user" (id) ON DELETE SET NULL,
  receiver_group_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payment_payer_user ON public.payment (payer_user_id);
CREATE INDEX idx_payment_receiver_user ON public.payment (receiver_user_id);

ALTER TABLE public.payment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.payment FOR ALL TO service_role USING (true);

-- Stripe customer table
CREATE TABLE IF NOT EXISTS public.stripe_customer (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id TEXT NOT NULL UNIQUE,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.stripe_customer ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.stripe_customer FOR ALL TO service_role USING (true);

-- Stripe subscription table
CREATE TABLE IF NOT EXISTS public.stripe_subscription (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.stripe_customer (id) ON DELETE CASCADE,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  status TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN,
  amount INTEGER,
  currency TEXT,
  interval_period TEXT,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stripe_subscription_customer ON public.stripe_subscription (customer_id);

ALTER TABLE public.stripe_subscription ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.stripe_subscription FOR ALL TO service_role USING (true);

-- Stripe payment table
CREATE TABLE IF NOT EXISTS public.stripe_payment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.stripe_customer (id) ON DELETE CASCADE,
  stripe_invoice_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  amount INTEGER,
  currency TEXT,
  status TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stripe_payment_customer ON public.stripe_payment (customer_id);

ALTER TABLE public.stripe_payment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.stripe_payment FOR ALL TO service_role USING (true);
