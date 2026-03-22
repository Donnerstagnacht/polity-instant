-- =============================================================================
-- 26_voting_password.sql — User voting passwords (4-digit PIN, stored hashed)
-- Depends on: 01_user
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.voting_password (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_voting_password_user ON public.voting_password (user_id);

ALTER TABLE public.voting_password ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.voting_password FOR ALL TO service_role USING (true);
