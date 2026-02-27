-- Make recipient_id nullable to support entity-level notifications
-- (notifications sent to groups, events, amendments, blogs rather than individual users)
ALTER TABLE public.notification ALTER COLUMN recipient_id DROP NOT NULL;
