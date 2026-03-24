-- =============================================================================
-- 20_0_amendment_vote.sql — Vote (for amendments), choices, voters, and participation/decision tables
-- Depends on: 01_user, 04_amendment, 06_agenda (agenda_item)
-- =============================================================================

-- Vote table (one vote per amendment agenda item)
CREATE TABLE IF NOT EXISTS public.vote (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agenda_item_id UUID,
  amendment_id UUID,
  title TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'indicative',
  majority_type TEXT NOT NULL DEFAULT 'relative',
  closing_type TEXT NOT NULL DEFAULT 'moderator',
  closing_duration_seconds INTEGER,
  closing_end_time TIMESTAMPTZ,
  visibility VARCHAR NOT NULL DEFAULT 'public',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vote_agenda_item ON public.vote (agenda_item_id);
CREATE INDEX idx_vote_amendment ON public.vote (amendment_id);

ALTER TABLE public.vote ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.vote FOR ALL TO service_role USING (true);

-- Vote choice table (e.g. Yes, No, Abstain — or custom choices)
CREATE TABLE IF NOT EXISTS public.vote_choice (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id UUID NOT NULL REFERENCES public.vote (id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vote_choice_vote ON public.vote_choice (vote_id);

ALTER TABLE public.vote_choice ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.vote_choice FOR ALL TO service_role USING (true);

-- Voter table (eligible voters for a vote, auto-populated from accredited participants)
CREATE TABLE IF NOT EXISTS public.voter (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id UUID NOT NULL REFERENCES public.vote (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (vote_id, user_id)
);

CREATE INDEX idx_voter_vote ON public.voter (vote_id);
CREATE INDEX idx_voter_user ON public.voter (user_id);

ALTER TABLE public.voter ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.voter FOR ALL TO service_role USING (true);

-- Indicative voter participation (records that a voter participated in the indicative round)
CREATE TABLE IF NOT EXISTS public.indicative_voter_participation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id UUID NOT NULL REFERENCES public.vote (id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES public.voter (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (vote_id, voter_id)
);

CREATE INDEX idx_indicative_voter_participation_vote ON public.indicative_voter_participation (vote_id);
CREATE INDEX idx_indicative_voter_participation_voter ON public.indicative_voter_participation (voter_id);

ALTER TABLE public.indicative_voter_participation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.indicative_voter_participation FOR ALL TO service_role USING (true);

-- Indicative choice decision (the actual choice in indicative round)
-- voter_participation_id is nullable: NULL = secret vote (no link to who voted)
CREATE TABLE IF NOT EXISTS public.indicative_choice_decision (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id UUID NOT NULL REFERENCES public.vote (id) ON DELETE CASCADE,
  choice_id UUID NOT NULL REFERENCES public.vote_choice (id) ON DELETE CASCADE,
  voter_participation_id UUID REFERENCES public.indicative_voter_participation (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_indicative_choice_decision_vote ON public.indicative_choice_decision (vote_id);
CREATE INDEX idx_indicative_choice_decision_choice ON public.indicative_choice_decision (choice_id);
CREATE INDEX idx_indicative_choice_decision_participation ON public.indicative_choice_decision (voter_participation_id);

ALTER TABLE public.indicative_choice_decision ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.indicative_choice_decision FOR ALL TO service_role USING (true);

-- Final voter participation (records that a voter participated in the final round)
CREATE TABLE IF NOT EXISTS public.final_voter_participation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id UUID NOT NULL REFERENCES public.vote (id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES public.voter (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (vote_id, voter_id)
);

CREATE INDEX idx_final_voter_participation_vote ON public.final_voter_participation (vote_id);
CREATE INDEX idx_final_voter_participation_voter ON public.final_voter_participation (voter_id);

ALTER TABLE public.final_voter_participation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.final_voter_participation FOR ALL TO service_role USING (true);

-- Final choice decision (the actual choice in final round)
-- voter_participation_id is nullable: NULL = secret vote (no link to who voted)
CREATE TABLE IF NOT EXISTS public.final_choice_decision (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id UUID NOT NULL REFERENCES public.vote (id) ON DELETE CASCADE,
  choice_id UUID NOT NULL REFERENCES public.vote_choice (id) ON DELETE CASCADE,
  voter_participation_id UUID REFERENCES public.final_voter_participation (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_final_choice_decision_vote ON public.final_choice_decision (vote_id);
CREATE INDEX idx_final_choice_decision_choice ON public.final_choice_decision (choice_id);
CREATE INDEX idx_final_choice_decision_participation ON public.final_choice_decision (voter_participation_id);

ALTER TABLE public.final_choice_decision ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.final_choice_decision FOR ALL TO service_role USING (true);
