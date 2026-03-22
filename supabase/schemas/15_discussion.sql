-- =============================================================================
-- 15_discussion.sql — Discussion threads and comments
-- Depends on: 01_user (user), 05_document (document)
-- =============================================================================

-- Thread table
CREATE TABLE IF NOT EXISTS public.thread (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.document (id) ON DELETE CASCADE,
  amendment_id UUID,
  statement_id UUID REFERENCES public.statement (id) ON DELETE CASCADE,
  blog_id UUID REFERENCES public.blog (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  content TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  resolved_at TIMESTAMPTZ,
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  position JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_thread_document ON public.thread (document_id);
CREATE INDEX idx_thread_statement ON public.thread (statement_id);
CREATE INDEX idx_thread_blog ON public.thread (blog_id);
CREATE INDEX idx_thread_user ON public.thread (user_id);

ALTER TABLE public.thread ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.thread FOR ALL TO service_role USING (true);

-- Comment table
CREATE TABLE IF NOT EXISTS public.comment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.thread (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comment (id) ON DELETE CASCADE,
  content TEXT,
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_comment_thread ON public.comment (thread_id);
CREATE INDEX idx_comment_user ON public.comment (user_id);
CREATE INDEX idx_comment_parent ON public.comment (parent_id);

ALTER TABLE public.comment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.comment FOR ALL TO service_role USING (true);

-- Thread vote table
CREATE TABLE IF NOT EXISTS public.thread_vote (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.thread (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  vote INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_thread_vote_thread ON public.thread_vote (thread_id);
CREATE INDEX idx_thread_vote_user ON public.thread_vote (user_id);

ALTER TABLE public.thread_vote ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.thread_vote FOR ALL TO service_role USING (true);

-- Comment vote table
CREATE TABLE IF NOT EXISTS public.comment_vote (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.comment (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  vote INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_comment_vote_comment ON public.comment_vote (comment_id);
CREATE INDEX idx_comment_vote_user ON public.comment_vote (user_id);

ALTER TABLE public.comment_vote ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.comment_vote FOR ALL TO service_role USING (true);
