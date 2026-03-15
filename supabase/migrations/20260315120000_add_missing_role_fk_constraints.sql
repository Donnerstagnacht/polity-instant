-- Add missing FK constraints on role_id for event_participant, amendment_collaborator, and blog_blogger.
-- group_membership already has the correct FK; these three tables were missing it,
-- which broke PostgREST relationship joins (e.g. role:role_id(...)).

-- Clean up orphaned role_id values that reference non-existent roles.
UPDATE public.event_participant
  SET role_id = NULL
  WHERE role_id IS NOT NULL
    AND role_id NOT IN (SELECT id FROM public.role);

UPDATE public.amendment_collaborator
  SET role_id = NULL
  WHERE role_id IS NOT NULL
    AND role_id NOT IN (SELECT id FROM public.role);

UPDATE public.blog_blogger
  SET role_id = NULL
  WHERE role_id IS NOT NULL
    AND role_id NOT IN (SELECT id FROM public.role);

-- Drop any partially-applied constraints from previous attempts, then add them.
ALTER TABLE public.event_participant
  DROP CONSTRAINT IF EXISTS event_participant_role_id_fkey;
ALTER TABLE public.event_participant
  ADD CONSTRAINT event_participant_role_id_fkey
  FOREIGN KEY (role_id) REFERENCES public.role (id) ON DELETE SET NULL;

ALTER TABLE public.amendment_collaborator
  DROP CONSTRAINT IF EXISTS amendment_collaborator_role_id_fkey;
ALTER TABLE public.amendment_collaborator
  ADD CONSTRAINT amendment_collaborator_role_id_fkey
  FOREIGN KEY (role_id) REFERENCES public.role (id) ON DELETE SET NULL;

ALTER TABLE public.blog_blogger
  DROP CONSTRAINT IF EXISTS blog_blogger_role_id_fkey;
ALTER TABLE public.blog_blogger
  ADD CONSTRAINT blog_blogger_role_id_fkey
  FOREIGN KEY (role_id) REFERENCES public.role (id) ON DELETE SET NULL;
