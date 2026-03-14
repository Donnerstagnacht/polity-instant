-- =============================================================================
-- Rename event types and standardize group_membership status
-- =============================================================================

-- 1. Rename event types
UPDATE public.event SET event_type = 'delegate_assembly' WHERE event_type = 'delegate_conference';
UPDATE public.event SET event_type = 'open' WHERE event_type = 'open_assembly';
UPDATE public.event SET event_type = 'on_invite' WHERE event_type = 'other';

-- 2. Standardize group_membership status: 'member' → 'active'
UPDATE public.group_membership SET status = 'active' WHERE status = 'member';
