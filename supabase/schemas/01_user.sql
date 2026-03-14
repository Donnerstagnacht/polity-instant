-- =============================================================================
-- 01_user.sql — User accounts, files, and user stats
-- Follow table moved to 19_network.sql
-- =============================================================================

-- User table (main user profile)
CREATE TABLE IF NOT EXISTS public."user" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  handle TEXT,
  first_name TEXT,
  last_name TEXT,
  bio TEXT,
  about TEXT,
  avatar TEXT,
  x TEXT,
  youtube TEXT,
  linkedin TEXT,
  website TEXT,
  location TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  visibility TEXT NOT NULL DEFAULT 'public',
  subscriber_count INTEGER NOT NULL DEFAULT 0,
  amendment_count INTEGER NOT NULL DEFAULT 0,
  group_count INTEGER NOT NULL DEFAULT 0,
  tutorial_step INTEGER,
  assistant_introduction BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_user_handle ON public."user" (handle);
CREATE INDEX idx_user_email ON public."user" (email);

ALTER TABLE public."user" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public."user" FOR ALL TO service_role USING (true);

-- File table
CREATE TABLE IF NOT EXISTS public.file (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT,
  url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.file ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.file FOR ALL TO service_role USING (true);
