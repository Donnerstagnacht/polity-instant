-- =============================================================================
-- 17_position.sql — Positions, position holders, event positions
-- Depends on: 01_user (user), 02_group (group), 03_event (event)
-- =============================================================================

-- Position table
CREATE TABLE IF NOT EXISTS public.position (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  description TEXT,
  term TEXT,
  first_term_start TIMESTAMPTZ,
  scheduled_revote_date TIMESTAMPTZ,
  group_id UUID NOT NULL REFERENCES public."group" (id) ON DELETE CASCADE,
  event_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_position_group ON public.position (group_id);

ALTER TABLE public.position ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.position FOR ALL TO service_role USING (true);

-- Position holder history table
CREATE TABLE IF NOT EXISTS public.position_holder_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id UUID NOT NULL REFERENCES public.position (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_position_holder_history_position ON public.position_holder_history (position_id);
CREATE INDEX idx_position_holder_history_user ON public.position_holder_history (user_id);

ALTER TABLE public.position_holder_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.position_holder_history FOR ALL TO service_role USING (true);

-- Event position table
CREATE TABLE IF NOT EXISTS public.event_position (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.event (id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_event_position_event ON public.event_position (event_id);

ALTER TABLE public.event_position ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.event_position FOR ALL TO service_role USING (true);

-- Event position holder table
CREATE TABLE IF NOT EXISTS public.event_position_holder (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id UUID NOT NULL REFERENCES public.event_position (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  group_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_event_position_holder_position ON public.event_position_holder (position_id);

ALTER TABLE public.event_position_holder ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.event_position_holder FOR ALL TO service_role USING (true);
