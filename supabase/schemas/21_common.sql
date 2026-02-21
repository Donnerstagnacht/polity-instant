-- =============================================================================
-- 21_common.sql — Hashtags, links, timeline events, reactions
-- Subscriber table moved to 19_network.sql
-- Cross-entity references use plain UUID columns (no FK constraints) since
-- the referenced tables may be in other files. FKs can be added later.
-- =============================================================================

-- Hashtag table
CREATE TABLE IF NOT EXISTS public.hashtag (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag TEXT,
  category TEXT,
  color TEXT,
  bg_color TEXT,
  icon TEXT,
  description TEXT,
  post_count INTEGER NOT NULL DEFAULT 0,
  amendment_id UUID,
  event_id UUID,
  group_id UUID,
  user_id UUID,
  blog_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hashtag_tag ON public.hashtag (tag);

ALTER TABLE public.hashtag ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.hashtag FOR ALL TO service_role USING (true);

-- Link table
CREATE TABLE IF NOT EXISTS public.link (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT,
  url TEXT,
  user_id UUID,
  group_id UUID,
  meeting_slot_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_link_user ON public.link (user_id);
CREATE INDEX idx_link_group ON public.link (group_id);

ALTER TABLE public.link ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.link FOR ALL TO service_role USING (true);

-- Timeline event table
CREATE TABLE IF NOT EXISTS public.timeline_event (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT,
  entity_type TEXT,
  entity_id UUID,
  title TEXT,
  description TEXT,
  metadata JSONB,
  image_url TEXT,
  video_url TEXT,
  video_thumbnail_url TEXT,
  content_type TEXT,
  tags JSONB,
  stats JSONB,
  vote_status TEXT,
  election_status TEXT,
  ends_at TIMESTAMPTZ,
  user_id UUID,
  group_id UUID,
  amendment_id UUID,
  event_id UUID,
  todo_id UUID,
  blog_id UUID,
  statement_id UUID,
  actor_id UUID,
  election_id UUID,
  amendment_vote_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_timeline_event_user ON public.timeline_event (user_id);
CREATE INDEX idx_timeline_event_group ON public.timeline_event (group_id);
CREATE INDEX idx_timeline_event_entity ON public.timeline_event (entity_type, entity_id);
CREATE INDEX idx_timeline_event_created ON public.timeline_event (created_at);

ALTER TABLE public.timeline_event ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.timeline_event FOR ALL TO service_role USING (true);

-- Reaction table
CREATE TABLE IF NOT EXISTS public.reaction (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID,
  entity_type TEXT,
  reaction_type TEXT,
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  timeline_event_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reaction_user ON public.reaction (user_id);
CREATE INDEX idx_reaction_entity ON public.reaction (entity_type, entity_id);
CREATE INDEX idx_reaction_timeline ON public.reaction (timeline_event_id);

ALTER TABLE public.reaction ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.reaction FOR ALL TO service_role USING (true);
