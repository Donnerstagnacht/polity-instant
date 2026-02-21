-- =============================================================================
-- 16_election.sql — Elections, candidates, and scheduled elections
-- Depends on: 01_user (user), 03_event (event), 06_agenda (agenda_item)
-- =============================================================================

-- Election table
CREATE TABLE IF NOT EXISTS public.election (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agenda_item_id UUID,
  position_id UUID,
  amendment_id UUID,
  title TEXT,
  description TEXT,
  status TEXT,
  is_multiple_choice BOOLEAN NOT NULL DEFAULT false,
  majority_type TEXT,
  max_selections INTEGER,
  voting_start_time TIMESTAMPTZ,
  voting_end_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_election_agenda_item ON public.election (agenda_item_id);

ALTER TABLE public.election ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.election FOR ALL TO service_role USING (true);

-- Election candidate table
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

-- Scheduled election table
CREATE TABLE IF NOT EXISTS public.scheduled_election (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.event (id) ON DELETE CASCADE,
  position_id UUID,
  title TEXT,
  scheduled_date TIMESTAMPTZ,
  status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_scheduled_election_event ON public.scheduled_election (event_id);

ALTER TABLE public.scheduled_election ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.scheduled_election FOR ALL TO service_role USING (true);
