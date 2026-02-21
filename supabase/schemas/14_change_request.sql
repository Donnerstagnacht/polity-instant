-- =============================================================================
-- 14_change_request.sql — Change requests for amendments
-- Depends on: 01_user (user), 04_amendment (amendment)
-- =============================================================================

-- Change request table
CREATE TABLE IF NOT EXISTS public.change_request (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amendment_id UUID NOT NULL REFERENCES public.amendment (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  status TEXT,
  reason TEXT,
  source_type TEXT,
  source_id UUID,
  source_title TEXT,
  votes_for INTEGER NOT NULL DEFAULT 0,
  votes_against INTEGER NOT NULL DEFAULT 0,
  votes_abstain INTEGER NOT NULL DEFAULT 0,
  voting_status TEXT NOT NULL DEFAULT 'open',
  voting_deadline TIMESTAMPTZ,
  voting_majority_type TEXT,
  quorum_required INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_change_request_amendment ON public.change_request (amendment_id);
CREATE INDEX idx_change_request_user ON public.change_request (user_id);

ALTER TABLE public.change_request ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.change_request FOR ALL TO service_role USING (true);
