-- =============================================================================
-- 04_amendment.sql — Amendments, collaborators, paths, support confirmations
-- Vote tables moved to 20_vote.sql
-- Change request tables moved to 14_change_request.sql
-- =============================================================================

-- Amendment table
CREATE TABLE IF NOT EXISTS public.amendment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT,
  title TEXT,
  status TEXT,
  workflow_status TEXT,
  reason TEXT,
  category TEXT,
  preamble TEXT,
  created_by_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  group_id UUID,
  event_id UUID,
  clone_source_id UUID,
  supporters INTEGER NOT NULL DEFAULT 0,
  supporters_required INTEGER,
  supporters_percentage NUMERIC,
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  tags JSONB,
  visibility TEXT NOT NULL DEFAULT 'public',
  is_public BOOLEAN NOT NULL DEFAULT true,
  subscriber_count INTEGER NOT NULL DEFAULT 0,
  clone_count INTEGER NOT NULL DEFAULT 0,
  change_request_count INTEGER NOT NULL DEFAULT 0,
  editing_mode TEXT,
  discussions JSONB,
  comment_count INTEGER NOT NULL DEFAULT 0,
  collaborator_count INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  x TEXT,
  youtube TEXT,
  linkedin TEXT,
  website TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_amendment_created_by ON public.amendment (created_by_id);
CREATE INDEX idx_amendment_group ON public.amendment (group_id);
CREATE INDEX idx_amendment_event ON public.amendment (event_id);
CREATE INDEX idx_amendment_status ON public.amendment (status);

ALTER TABLE public.amendment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.amendment FOR ALL TO service_role USING (true);

-- Amendment collaborator table
CREATE TABLE IF NOT EXISTS public.amendment_collaborator (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amendment_id UUID NOT NULL REFERENCES public.amendment (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  role_id UUID REFERENCES public.role (id) ON DELETE SET NULL,
  status TEXT,
  visibility TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_amendment_collaborator_amendment ON public.amendment_collaborator (amendment_id);
CREATE INDEX idx_amendment_collaborator_user ON public.amendment_collaborator (user_id);

ALTER TABLE public.amendment_collaborator ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.amendment_collaborator FOR ALL TO service_role USING (true);

-- Amendment path table
CREATE TABLE IF NOT EXISTS public.amendment_path (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amendment_id UUID NOT NULL REFERENCES public.amendment (id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_amendment_path_amendment ON public.amendment_path (amendment_id);

ALTER TABLE public.amendment_path ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.amendment_path FOR ALL TO service_role USING (true);

-- Amendment path segment table
CREATE TABLE IF NOT EXISTS public.amendment_path_segment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id UUID NOT NULL REFERENCES public.amendment_path (id) ON DELETE CASCADE,
  group_id UUID,
  event_id UUID,
  order_index INTEGER,
  status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_amendment_path_segment_path ON public.amendment_path_segment (path_id);

ALTER TABLE public.amendment_path_segment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.amendment_path_segment FOR ALL TO service_role USING (true);

-- Support confirmation table
CREATE TABLE IF NOT EXISTS public.support_confirmation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amendment_id UUID NOT NULL REFERENCES public.amendment (id) ON DELETE CASCADE,
  group_id UUID,
  event_id UUID,
  confirmed_by_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  status TEXT,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_support_confirmation_amendment ON public.support_confirmation (amendment_id);
CREATE INDEX idx_support_confirmation_user ON public.support_confirmation (confirmed_by_id);

ALTER TABLE public.support_confirmation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.support_confirmation FOR ALL TO service_role USING (true);

-- Amendment support vote table
CREATE TABLE IF NOT EXISTS public.amendment_support_vote (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amendment_id UUID NOT NULL REFERENCES public.amendment (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_amendment_support_vote_amendment ON public.amendment_support_vote (amendment_id);
CREATE INDEX idx_amendment_support_vote_user ON public.amendment_support_vote (user_id);

ALTER TABLE public.amendment_support_vote ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.amendment_support_vote FOR ALL TO service_role USING (true);

-- Amendment vote entry table (inline upvote/downvote)
CREATE TABLE IF NOT EXISTS public.amendment_vote_entry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amendment_id UUID NOT NULL REFERENCES public.amendment (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  vote INTEGER,
  is_indication BOOLEAN NOT NULL DEFAULT false,
  indicated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_amendment_vote_entry_amendment ON public.amendment_vote_entry (amendment_id);
CREATE INDEX idx_amendment_vote_entry_user ON public.amendment_vote_entry (user_id);

ALTER TABLE public.amendment_vote_entry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.amendment_vote_entry FOR ALL TO service_role USING (true);
