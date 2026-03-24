-- Agenda item change request junction table
-- Links change requests to agenda items with ordering and per-CR vote tracking
CREATE TABLE IF NOT EXISTS public.agenda_item_change_request (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agenda_item_id UUID NOT NULL REFERENCES public.agenda_item (id) ON DELETE CASCADE,
  change_request_id UUID REFERENCES public.change_request (id) ON DELETE CASCADE,
  vote_id UUID REFERENCES public.vote (id) ON DELETE SET NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_final_vote BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_aicr_agenda_item ON public.agenda_item_change_request (agenda_item_id);
CREATE INDEX idx_aicr_change_request ON public.agenda_item_change_request (change_request_id);
CREATE INDEX idx_aicr_vote ON public.agenda_item_change_request (vote_id);
CREATE UNIQUE INDEX idx_aicr_unique ON public.agenda_item_change_request (agenda_item_id, change_request_id) WHERE change_request_id IS NOT NULL;

ALTER TABLE public.agenda_item_change_request ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.agenda_item_change_request FOR ALL TO service_role USING (true);
