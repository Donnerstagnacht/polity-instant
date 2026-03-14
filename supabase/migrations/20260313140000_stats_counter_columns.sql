-- Add stats counter columns to group and amendment tables

ALTER TABLE public."group"
  ADD COLUMN IF NOT EXISTS event_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS amendment_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS document_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.amendment
  ADD COLUMN IF NOT EXISTS comment_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS collaborator_count INTEGER NOT NULL DEFAULT 0;
