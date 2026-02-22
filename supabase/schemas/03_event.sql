-- =============================================================================
-- 03_event.sql — Events and participants
-- Delegates moved to 18_delegate.sql
-- Meetings moved to 13_meet.sql
-- Positions moved to 17_position.sql
-- Voting sessions moved to 20_vote.sql
-- Scheduled elections moved to 16_election.sql
-- =============================================================================

-- Event table
CREATE TABLE IF NOT EXISTS public.event (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  description TEXT,
  status TEXT,
  event_type TEXT,
  location_type TEXT,
  location_name TEXT,
  location_address TEXT,
  location_url TEXT,
  location_coordinates TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  visibility TEXT NOT NULL DEFAULT 'public',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  timezone TEXT,
  capacity INTEGER,
  participant_count INTEGER NOT NULL DEFAULT 0,
  agenda_management TEXT,
  meeting_type TEXT,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurrence_pattern TEXT,
  recurrence_end_date TIMESTAMPTZ,
  original_event_id UUID,
  cancel_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  cancelled_by_id UUID,
  x TEXT,
  youtube TEXT,
  linkedin TEXT,
  website TEXT,
  stream_url TEXT,
  image_url TEXT,
  has_delegates BOOLEAN NOT NULL DEFAULT false,
  delegate_count INTEGER NOT NULL DEFAULT 0,
  delegate_distribution_method TEXT,
  delegate_distribution_status TEXT,
  delegate_seat_allocation_type TEXT,
  total_delegate_seats INTEGER,
  delegate_quorum_percentage NUMERIC,
  delegate_vote_weight_type TEXT,
  delegate_vote_threshold_percentage NUMERIC,
  delegate_accepted_states JSONB,
  delegate_finalized_at TIMESTAMPTZ,
  delegate_approval_type TEXT,
  delegate_check_mode TEXT,
  main_group_delegate_allocation_mode TEXT,
  group_id UUID,
  creator_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_event_creator ON public.event (creator_id);
CREATE INDEX idx_event_group ON public.event (group_id);
CREATE INDEX idx_event_status ON public.event (status);
CREATE INDEX idx_event_start_date ON public.event (start_date);

ALTER TABLE public.event ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.event FOR ALL TO service_role USING (true);

-- Event participant table
CREATE TABLE IF NOT EXISTS public.event_participant (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.event (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  group_id UUID,
  status TEXT,
  role_id UUID,
  visibility TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_event_participant_event ON public.event_participant (event_id);
CREATE INDEX idx_event_participant_user ON public.event_participant (user_id);

ALTER TABLE public.event_participant ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.event_participant FOR ALL TO service_role USING (true);

-- Participant table (generic event participant with name/email)
CREATE TABLE IF NOT EXISTS public.participant (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.event (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  role TEXT,
  status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_participant_event ON public.participant (event_id);
CREATE INDEX idx_participant_user ON public.participant (user_id);

ALTER TABLE public.participant ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.participant FOR ALL TO service_role USING (true);
