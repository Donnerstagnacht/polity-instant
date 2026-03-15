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
  subscriber_count INTEGER NOT NULL DEFAULT 0,
  election_count INTEGER NOT NULL DEFAULT 0,
  amendment_count INTEGER NOT NULL DEFAULT 0,
  open_change_request_count INTEGER NOT NULL DEFAULT 0,
  agenda_management TEXT,
  meeting_type TEXT,
  is_bookable BOOLEAN NOT NULL DEFAULT false,
  max_bookings INTEGER DEFAULT 1,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurrence_pattern TEXT,
  recurrence_rule TEXT,
  recurrence_interval INTEGER DEFAULT 1,
  recurrence_days INTEGER[],
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
  current_agenda_item_id UUID,
  amendment_deadline TIMESTAMPTZ,
  delegates_nomination_deadline TIMESTAMPTZ,
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
  role_id UUID REFERENCES public.role (id) ON DELETE SET NULL,
  visibility TEXT,
  instance_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_event_participant_instance ON public.event_participant (event_id, instance_date);
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

-- Event exception table (for recurring event modifications/cancellations)
CREATE TABLE IF NOT EXISTS public.event_exception (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_event_id UUID NOT NULL REFERENCES public.event (id) ON DELETE CASCADE,
  original_date TIMESTAMPTZ NOT NULL,
  action TEXT NOT NULL,
  new_title TEXT,
  new_description TEXT,
  new_start_date TIMESTAMPTZ,
  new_end_date TIMESTAMPTZ,
  new_location_name TEXT,
  new_location_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_event_exception_parent_date UNIQUE (parent_event_id, original_date)
);

CREATE INDEX idx_event_exception_parent ON public.event_exception (parent_event_id);

ALTER TABLE public.event_exception ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.event_exception FOR ALL TO service_role USING (true);

-- Calendar subscription table (subscribe to group/user calendars)
CREATE TABLE IF NOT EXISTS public.calendar_subscription (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  target_type TEXT NOT NULL,
  target_group_id UUID REFERENCES public."group" (id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES public."user" (id) ON DELETE CASCADE,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_calendar_sub_target CHECK (
    (target_type = 'group' AND target_group_id IS NOT NULL AND target_user_id IS NULL) OR
    (target_type = 'user' AND target_user_id IS NOT NULL AND target_group_id IS NULL)
  )
);

CREATE UNIQUE INDEX idx_calendar_sub_user_group ON public.calendar_subscription (user_id, target_group_id)
  WHERE target_group_id IS NOT NULL;
CREATE UNIQUE INDEX idx_calendar_sub_user_user ON public.calendar_subscription (user_id, target_user_id)
  WHERE target_user_id IS NOT NULL;
CREATE INDEX idx_calendar_sub_user ON public.calendar_subscription (user_id);

ALTER TABLE public.calendar_subscription ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.calendar_subscription FOR ALL TO service_role USING (true);
