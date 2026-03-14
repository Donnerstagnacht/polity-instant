-- Add deadline columns to event table
ALTER TABLE public.event ADD COLUMN IF NOT EXISTS amendment_deadline TIMESTAMPTZ;
ALTER TABLE public.event ADD COLUMN IF NOT EXISTS delegates_nomination_deadline TIMESTAMPTZ;
