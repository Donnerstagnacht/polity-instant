-- =============================================================================
-- 18_delegate.sql — Event delegates and group delegate allocations
-- Depends on: 01_user (user), 03_event (event)
-- =============================================================================

-- Event delegate table
CREATE TABLE IF NOT EXISTS public.event_delegate (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.event (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  group_id UUID,
  status TEXT,
  seat_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_event_delegate_event ON public.event_delegate (event_id);
CREATE INDEX idx_event_delegate_user ON public.event_delegate (user_id);

ALTER TABLE public.event_delegate ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.event_delegate FOR ALL TO service_role USING (true);

-- Group delegate allocation table
CREATE TABLE IF NOT EXISTS public.group_delegate_allocation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.event (id) ON DELETE CASCADE,
  group_id UUID,
  allocated_seats INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_group_delegate_allocation_event ON public.group_delegate_allocation (event_id);

ALTER TABLE public.group_delegate_allocation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.group_delegate_allocation FOR ALL TO service_role USING (true);
