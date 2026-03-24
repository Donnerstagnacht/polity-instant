-- =============================================================================
-- Seed the Aria & Kai system assistant user
-- This is a well-known bot user used for onboarding and in-app tutorials.
-- =============================================================================

INSERT INTO public."user" (
  id,
  email,
  handle,
  first_name,
  last_name,
  bio,
  is_public,
  visibility,
  subscriber_count,
  amendment_count,
  group_count,
  created_at,
  updated_at
) VALUES (
  'a12a0000-0000-4000-a000-000000000001',
  'aria-kai-assistants@polity.com',
  'aria-kai',
  'Aria & Kai',
  'Assistants',
  'Your personal assistants — here to help you navigate Polity!',
  true,
  'public',
  0,
  0,
  0,
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;
