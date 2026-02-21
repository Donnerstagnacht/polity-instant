-- =============================================================================
-- 20_vote.sql — All vote and voting session tables (consolidated)
-- Depends on: 01_user, 04_amendment, 07_blog, 14_change_request,
--             15_discussion (thread, comment), 16_election (election, election_candidate),
--             03_event
-- =============================================================================

-- Amendment vote entry table (inline upvote/downvote)
CREATE TABLE IF NOT EXISTS public.amendment_vote_entry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amendment_id UUID NOT NULL REFERENCES public.amendment (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  vote INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_amendment_vote_entry_amendment ON public.amendment_vote_entry (amendment_id);
CREATE INDEX idx_amendment_vote_entry_user ON public.amendment_vote_entry (user_id);

ALTER TABLE public.amendment_vote_entry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.amendment_vote_entry FOR ALL TO service_role USING (true);

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

-- Amendment vote table (formal event-based)
CREATE TABLE IF NOT EXISTS public.amendment_vote (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amendment_id UUID NOT NULL REFERENCES public.amendment (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  event_id UUID,
  vote TEXT,
  weight NUMERIC NOT NULL DEFAULT 1,
  is_delegate_vote BOOLEAN NOT NULL DEFAULT false,
  group_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_amendment_vote_amendment ON public.amendment_vote (amendment_id);
CREATE INDEX idx_amendment_vote_user ON public.amendment_vote (user_id);

ALTER TABLE public.amendment_vote ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.amendment_vote FOR ALL TO service_role USING (true);

-- Amendment voting session table
CREATE TABLE IF NOT EXISTS public.amendment_voting_session (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amendment_id UUID NOT NULL REFERENCES public.amendment (id) ON DELETE CASCADE,
  event_id UUID,
  title TEXT,
  description TEXT,
  status TEXT,
  voting_type TEXT,
  majority_type TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_amendment_voting_session_amendment ON public.amendment_voting_session (amendment_id);

ALTER TABLE public.amendment_voting_session ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.amendment_voting_session FOR ALL TO service_role USING (true);

-- Amendment voting session vote table
CREATE TABLE IF NOT EXISTS public.amendment_voting_session_vote (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.amendment_voting_session (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  vote TEXT,
  weight NUMERIC NOT NULL DEFAULT 1,
  is_delegate BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_amendment_voting_session_vote_session ON public.amendment_voting_session_vote (session_id);
CREATE INDEX idx_amendment_voting_session_vote_user ON public.amendment_voting_session_vote (user_id);

ALTER TABLE public.amendment_voting_session_vote ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.amendment_voting_session_vote FOR ALL TO service_role USING (true);

-- Change request vote table
CREATE TABLE IF NOT EXISTS public.change_request_vote (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  change_request_id UUID NOT NULL REFERENCES public.change_request (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  vote TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_change_request_vote_cr ON public.change_request_vote (change_request_id);
CREATE INDEX idx_change_request_vote_user ON public.change_request_vote (user_id);

ALTER TABLE public.change_request_vote ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.change_request_vote FOR ALL TO service_role USING (true);

-- Event voting session table
CREATE TABLE IF NOT EXISTS public.event_voting_session (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.event (id) ON DELETE CASCADE,
  agenda_item_id UUID,
  title TEXT,
  description TEXT,
  status TEXT,
  voting_type TEXT,
  majority_type TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_event_voting_session_event ON public.event_voting_session (event_id);

ALTER TABLE public.event_voting_session ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.event_voting_session FOR ALL TO service_role USING (true);

-- Event vote table
CREATE TABLE IF NOT EXISTS public.event_vote (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.event_voting_session (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  vote TEXT,
  weight NUMERIC NOT NULL DEFAULT 1,
  is_delegate BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_event_vote_session ON public.event_vote (session_id);
CREATE INDEX idx_event_vote_user ON public.event_vote (user_id);

ALTER TABLE public.event_vote ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.event_vote FOR ALL TO service_role USING (true);

-- Election vote table
CREATE TABLE IF NOT EXISTS public.election_vote (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL REFERENCES public.election (id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.election_candidate (id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  is_indication BOOLEAN NOT NULL DEFAULT false,
  indicated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_election_vote_election ON public.election_vote (election_id);
CREATE INDEX idx_election_vote_candidate ON public.election_vote (candidate_id);
CREATE INDEX idx_election_vote_voter ON public.election_vote (voter_id);

ALTER TABLE public.election_vote ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.election_vote FOR ALL TO service_role USING (true);

-- Blog support vote table
CREATE TABLE IF NOT EXISTS public.blog_support_vote (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id UUID NOT NULL REFERENCES public.blog (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  vote INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_blog_support_vote_blog ON public.blog_support_vote (blog_id);
CREATE INDEX idx_blog_support_vote_user ON public.blog_support_vote (user_id);

ALTER TABLE public.blog_support_vote ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.blog_support_vote FOR ALL TO service_role USING (true);

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
