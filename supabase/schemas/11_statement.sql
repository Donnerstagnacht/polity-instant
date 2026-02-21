-- =============================================================================
-- 11_statement.sql — User statements
-- =============================================================================

-- Statement table
CREATE TABLE IF NOT EXISTS public.statement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  tag TEXT,
  text TEXT,
  visibility TEXT NOT NULL DEFAULT 'public',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_statement_user ON public.statement (user_id);

ALTER TABLE public.statement ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.statement FOR ALL TO service_role USING (true);
