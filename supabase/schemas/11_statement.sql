-- =============================================================================
-- 11_statement.sql — User statements (Reddit-style short posts)
-- =============================================================================

-- Statement table
CREATE TABLE IF NOT EXISTS public.statement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  group_id UUID REFERENCES public."group" (id) ON DELETE SET NULL,
  text TEXT,
  image_url TEXT,
  video_url TEXT,
  visibility TEXT NOT NULL DEFAULT 'public',
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_statement_user ON public.statement (user_id);
CREATE INDEX idx_statement_group ON public.statement (group_id);

ALTER TABLE public.statement ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.statement FOR ALL TO service_role USING (true);

-- Statement survey table (polls attached to statements)
CREATE TABLE IF NOT EXISTS public.statement_survey (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  statement_id UUID NOT NULL REFERENCES public.statement (id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (statement_id)
);

CREATE INDEX idx_statement_survey_statement ON public.statement_survey (statement_id);

ALTER TABLE public.statement_survey ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.statement_survey FOR ALL TO service_role USING (true);

-- Statement survey option table
CREATE TABLE IF NOT EXISTS public.statement_survey_option (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES public.statement_survey (id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  vote_count INTEGER NOT NULL DEFAULT 0,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_statement_survey_option_survey ON public.statement_survey_option (survey_id);

ALTER TABLE public.statement_survey_option ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.statement_survey_option FOR ALL TO service_role USING (true);

-- Statement survey vote table
CREATE TABLE IF NOT EXISTS public.statement_survey_vote (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_id UUID NOT NULL REFERENCES public.statement_survey_option (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (option_id, user_id)
);

CREATE INDEX idx_statement_survey_vote_option ON public.statement_survey_vote (option_id);
CREATE INDEX idx_statement_survey_vote_user ON public.statement_survey_vote (user_id);

ALTER TABLE public.statement_survey_vote ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.statement_survey_vote FOR ALL TO service_role USING (true);
