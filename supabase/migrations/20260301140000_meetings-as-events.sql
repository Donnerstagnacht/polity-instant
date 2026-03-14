-- =============================================================================
-- Meetings as Events: Add booking columns to event + instance tracking to participant
-- =============================================================================

-- Add bookable fields to event table
ALTER TABLE public.event ADD COLUMN IF NOT EXISTS is_bookable BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.event ADD COLUMN IF NOT EXISTS max_bookings INTEGER DEFAULT 1;

-- Add instance tracking to event_participant (for recurring meeting bookings)
ALTER TABLE public.event_participant ADD COLUMN IF NOT EXISTS instance_date TIMESTAMPTZ;

-- Index for efficient per-instance booking lookups
CREATE INDEX IF NOT EXISTS idx_event_participant_instance
  ON public.event_participant (event_id, instance_date);

-- Partial index for quickly finding meeting-type events
CREATE INDEX IF NOT EXISTS idx_event_meeting_type
  ON public.event (meeting_type) WHERE meeting_type IS NOT NULL;
