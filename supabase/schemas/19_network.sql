-- =============================================================================
-- 19_network.sql — Social graph: follows, group relationships, subscribers
-- Depends on: 01_user (user), 02_group (group)
-- =============================================================================

-- Follow table
CREATE TABLE IF NOT EXISTS public.follow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  followee_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_follow_follower ON public.follow (follower_id);
CREATE INDEX idx_follow_followee ON public.follow (followee_id);

ALTER TABLE public.follow ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.follow FOR ALL TO service_role USING (true);

-- Group relationship table
CREATE TABLE IF NOT EXISTS public.group_relationship (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public."group" (id) ON DELETE CASCADE,
  related_group_id UUID NOT NULL REFERENCES public."group" (id) ON DELETE CASCADE,
  relationship_type TEXT,
  with_right TEXT,
  status TEXT,
  initiator_group_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_group_relationship_group ON public.group_relationship (group_id);
CREATE INDEX idx_group_relationship_related ON public.group_relationship (related_group_id);

ALTER TABLE public.group_relationship ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.group_relationship FOR ALL TO service_role USING (true);

-- Subscriber table
CREATE TABLE IF NOT EXISTS public.subscriber (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  user_id UUID,
  group_id UUID,
  amendment_id UUID,
  event_id UUID,
  blog_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriber_subscriber ON public.subscriber (subscriber_id);
CREATE INDEX idx_subscriber_user ON public.subscriber (user_id);
CREATE INDEX idx_subscriber_group ON public.subscriber (group_id);

ALTER TABLE public.subscriber ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.subscriber FOR ALL TO service_role USING (true);
