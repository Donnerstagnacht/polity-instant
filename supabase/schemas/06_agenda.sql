-- =============================================================================
-- 06_agenda.sql — Agenda items and speaker lists
-- Elections moved to 16_election.sql
-- Election votes moved to 20_vote.sql
-- =============================================================================

-- Agenda item table
CREATE TABLE IF NOT EXISTS public.agenda_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID,
  amendment_id UUID,
  creator_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  type TEXT,
  status TEXT,
  forwarding_status TEXT,
  order_index INTEGER,
  duration INTEGER,
  scheduled_time TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  activated_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  majority_type TEXT,
  time_limit INTEGER,
  voting_phase TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agenda_item_event ON public.agenda_item (event_id);
CREATE INDEX idx_agenda_item_creator ON public.agenda_item (creator_id);

ALTER TABLE public.agenda_item ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.agenda_item FOR ALL TO service_role USING (true);

-- Speaker list table
CREATE TABLE IF NOT EXISTS public.speaker_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agenda_item_id UUID NOT NULL REFERENCES public.agenda_item (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  title TEXT,
  order_index INTEGER,
  time INTEGER,
  completed BOOLEAN NOT NULL DEFAULT false,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_speaker_list_agenda_item ON public.speaker_list (agenda_item_id);

ALTER TABLE public.speaker_list ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.speaker_list FOR ALL TO service_role USING (true);


