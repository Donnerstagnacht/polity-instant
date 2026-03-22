-- =============================================================================
-- 16_election.sql — Elections, candidates, electors, and voting tables
-- Depends on: 01_user (user), 03_event (event), 06_agenda (agenda_item)
-- =============================================================================

-- Election table (modified: removed amendment_id, is_multiple_choice, max_selections,
-- voting_start_time, voting_end_time; added closing_type, closing_duration_seconds,
-- closing_end_time, is_public, max_votes)
CREATE TABLE IF NOT EXISTS public.election (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agenda_item_id UUID,
  position_id UUID,
  title TEXT,
  description TEXT,
  status TEXT,
  majority_type TEXT,
  closing_type TEXT,
  closing_duration_seconds INTEGER,
  closing_end_time TIMESTAMPTZ,
  is_public BOOLEAN NOT NULL DEFAULT true,
  max_votes INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_election_agenda_item ON public.election (agenda_item_id);

ALTER TABLE public.election ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.election FOR ALL TO service_role USING (true);

-- Election candidate table (unchanged)
CREATE TABLE IF NOT EXISTS public.election_candidate (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL REFERENCES public.election (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  name TEXT,
  description TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'nominated',
  order_index INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_election_candidate_election ON public.election_candidate (election_id);
CREATE INDEX idx_election_candidate_user ON public.election_candidate (user_id);

ALTER TABLE public.election_candidate ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.election_candidate FOR ALL TO service_role USING (true);

-- Elector table (new: auto-populated from accredited participants)
CREATE TABLE IF NOT EXISTS public.elector (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL REFERENCES public.election (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (election_id, user_id)
);

CREATE INDEX idx_elector_election ON public.elector (election_id);
CREATE INDEX idx_elector_user ON public.elector (user_id);

ALTER TABLE public.elector ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.elector FOR ALL TO service_role USING (true);

-- Indicative elector participation (new: tracks that an elector voted in indicative phase)
CREATE TABLE IF NOT EXISTS public.indicative_elector_participation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL REFERENCES public.election (id) ON DELETE CASCADE,
  elector_id UUID NOT NULL REFERENCES public.elector (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (election_id, elector_id)
);

CREATE INDEX idx_indicative_elector_participation_election ON public.indicative_elector_participation (election_id);
CREATE INDEX idx_indicative_elector_participation_elector ON public.indicative_elector_participation (elector_id);

ALTER TABLE public.indicative_elector_participation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.indicative_elector_participation FOR ALL TO service_role USING (true);

-- Indicative candidate selection (new: the actual vote — links participation to candidate)
CREATE TABLE IF NOT EXISTS public.indicative_candidate_selection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL REFERENCES public.election (id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.election_candidate (id) ON DELETE CASCADE,
  elector_participation_id UUID REFERENCES public.indicative_elector_participation (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_indicative_candidate_selection_election ON public.indicative_candidate_selection (election_id);
CREATE INDEX idx_indicative_candidate_selection_candidate ON public.indicative_candidate_selection (candidate_id);
CREATE INDEX idx_indicative_candidate_selection_participation ON public.indicative_candidate_selection (elector_participation_id);

ALTER TABLE public.indicative_candidate_selection ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.indicative_candidate_selection FOR ALL TO service_role USING (true);

-- Final elector participation (new: tracks that an elector voted in final phase)
CREATE TABLE IF NOT EXISTS public.final_elector_participation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL REFERENCES public.election (id) ON DELETE CASCADE,
  elector_id UUID NOT NULL REFERENCES public.elector (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (election_id, elector_id)
);

CREATE INDEX idx_final_elector_participation_election ON public.final_elector_participation (election_id);
CREATE INDEX idx_final_elector_participation_elector ON public.final_elector_participation (elector_id);

ALTER TABLE public.final_elector_participation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.final_elector_participation FOR ALL TO service_role USING (true);

-- Final candidate selection (new: the actual vote — links participation to candidate)
CREATE TABLE IF NOT EXISTS public.final_candidate_selection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL REFERENCES public.election (id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.election_candidate (id) ON DELETE CASCADE,
  elector_participation_id UUID REFERENCES public.final_elector_participation (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_final_candidate_selection_election ON public.final_candidate_selection (election_id);
CREATE INDEX idx_final_candidate_selection_candidate ON public.final_candidate_selection (candidate_id);
CREATE INDEX idx_final_candidate_selection_participation ON public.final_candidate_selection (elector_participation_id);

ALTER TABLE public.final_candidate_selection ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.final_candidate_selection FOR ALL TO service_role USING (true);
