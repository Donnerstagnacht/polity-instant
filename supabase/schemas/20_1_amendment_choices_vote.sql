-- =============================================================================
-- 20_1_vote_support.sql — Support vote tables & change request votes (kept)
-- Removed tables: amendment_vote, amendment_voting_session,
-- amendment_voting_session_vote, event_voting_session, event_vote, election_vote
-- (replaced by new tables in 20_0_amendment_vote.sql and 16_position_election.sql)
-- Depends on: 01_user, 04_amendment, 07_blog, 14_change_request,
--             15_discussion (thread, comment)
-- =============================================================================

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



