-- =============================================================================
-- 13_meet.sql — Meeting slots and bookings
-- Depends on: 01_user (user), 03_event (event)
-- =============================================================================

-- Meeting slot table
CREATE TABLE IF NOT EXISTS public.meeting_slot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.event (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  duration INTEGER,
  is_available BOOLEAN NOT NULL DEFAULT true,
  max_bookings INTEGER NOT NULL DEFAULT 1,
  booking_count INTEGER NOT NULL DEFAULT 0,
  meeting_type TEXT,
  video_call_url TEXT,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_meeting_slot_event ON public.meeting_slot (event_id);
CREATE INDEX idx_meeting_slot_user ON public.meeting_slot (user_id);

ALTER TABLE public.meeting_slot ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.meeting_slot FOR ALL TO service_role USING (true);

-- Meeting booking table
CREATE TABLE IF NOT EXISTS public.meeting_booking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID NOT NULL REFERENCES public.meeting_slot (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  status TEXT,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_meeting_booking_slot ON public.meeting_booking (slot_id);
CREATE INDEX idx_meeting_booking_user ON public.meeting_booking (user_id);

ALTER TABLE public.meeting_booking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.meeting_booking FOR ALL TO service_role USING (true);
