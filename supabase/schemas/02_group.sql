-- =============================================================================
-- 02_group.sql — Groups, memberships, roles, action rights
-- Group relationships moved to 19_network.sql
-- Positions moved to 17_position.sql
-- =============================================================================

-- Group table (quoted because "group" is a reserved word)
CREATE TABLE IF NOT EXISTS public."group" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  description TEXT,
  location TEXT,
  image_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  member_count INTEGER NOT NULL DEFAULT 0,
  x TEXT,
  youtube TEXT,
  linkedin TEXT,
  website TEXT,
  visibility TEXT NOT NULL DEFAULT 'public',
  owner_id UUID REFERENCES public."user" (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_group_owner ON public."group" (owner_id);

ALTER TABLE public."group" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public."group" FOR ALL TO service_role USING (true);

-- Role table
CREATE TABLE IF NOT EXISTS public.role (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  description TEXT,
  scope TEXT,
  group_id UUID REFERENCES public."group" (id) ON DELETE CASCADE,
  event_id UUID,
  amendment_id UUID,
  blog_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_role_group ON public.role (group_id);

ALTER TABLE public.role ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.role FOR ALL TO service_role USING (true);

-- Group membership table
CREATE TABLE IF NOT EXISTS public.group_membership (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public."group" (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  status TEXT,
  visibility TEXT NOT NULL DEFAULT 'public',
  role_id UUID REFERENCES public.role (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_group_membership_group ON public.group_membership (group_id);
CREATE INDEX idx_group_membership_user ON public.group_membership (user_id);

ALTER TABLE public.group_membership ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.group_membership FOR ALL TO service_role USING (true);

-- Action right table
CREATE TABLE IF NOT EXISTS public.action_right (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource TEXT,
  action TEXT,
  role_id UUID NOT NULL REFERENCES public.role (id) ON DELETE CASCADE,
  group_id UUID,
  event_id UUID,
  amendment_id UUID,
  blog_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_action_right_role ON public.action_right (role_id);

ALTER TABLE public.action_right ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.action_right FOR ALL TO service_role USING (true);


