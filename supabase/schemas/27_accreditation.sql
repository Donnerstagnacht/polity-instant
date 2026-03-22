-- =============================================================================
-- 27_accreditation.sql — Event accreditation (attendance confirmation)
-- Depends on: 01_user, 03_event, 06_agenda
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.accreditation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.event (id) ON DELETE CASCADE,
  agenda_item_id UUID NOT NULL REFERENCES public.agenda_item (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

CREATE INDEX idx_accreditation_event ON public.accreditation (event_id);
CREATE INDEX idx_accreditation_agenda_item ON public.accreditation (agenda_item_id);
CREATE INDEX idx_accreditation_user ON public.accreditation (user_id);

ALTER TABLE public.accreditation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.accreditation FOR ALL TO service_role USING (true);
