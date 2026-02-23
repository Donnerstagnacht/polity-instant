-- =============================================================================
-- 21_common.sql — Hashtags, links, timeline events, reactions
-- Subscriber table moved to 19_network.sql
-- Cross-entity references use plain UUID columns (no FK constraints) since
-- the referenced tables may be in other files. FKs can be added later.
-- =============================================================================

-- Hashtag table (canonical tag dictionary)
CREATE TABLE IF NOT EXISTS public.hashtag (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_hashtag_tag ON public.hashtag (tag);

ALTER TABLE public.hashtag ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.hashtag FOR ALL TO service_role USING (true);

-- User ↔ Hashtag junction table
CREATE TABLE IF NOT EXISTS public.user_hashtag (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  hashtag_id UUID NOT NULL REFERENCES public.hashtag (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, hashtag_id)
);

CREATE INDEX idx_user_hashtag_user ON public.user_hashtag (user_id);
CREATE INDEX idx_user_hashtag_hashtag ON public.user_hashtag (hashtag_id);

ALTER TABLE public.user_hashtag ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.user_hashtag FOR ALL TO service_role USING (true);

-- Group ↔ Hashtag junction table
CREATE TABLE IF NOT EXISTS public.group_hashtag (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public."group" (id) ON DELETE CASCADE,
  hashtag_id UUID NOT NULL REFERENCES public.hashtag (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (group_id, hashtag_id)
);

CREATE INDEX idx_group_hashtag_group ON public.group_hashtag (group_id);
CREATE INDEX idx_group_hashtag_hashtag ON public.group_hashtag (hashtag_id);

ALTER TABLE public.group_hashtag ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.group_hashtag FOR ALL TO service_role USING (true);

-- Amendment ↔ Hashtag junction table
CREATE TABLE IF NOT EXISTS public.amendment_hashtag (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amendment_id UUID NOT NULL REFERENCES public.amendment (id) ON DELETE CASCADE,
  hashtag_id UUID NOT NULL REFERENCES public.hashtag (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (amendment_id, hashtag_id)
);

CREATE INDEX idx_amendment_hashtag_amendment ON public.amendment_hashtag (amendment_id);
CREATE INDEX idx_amendment_hashtag_hashtag ON public.amendment_hashtag (hashtag_id);

ALTER TABLE public.amendment_hashtag ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.amendment_hashtag FOR ALL TO service_role USING (true);

-- Event ↔ Hashtag junction table
CREATE TABLE IF NOT EXISTS public.event_hashtag (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.event (id) ON DELETE CASCADE,
  hashtag_id UUID NOT NULL REFERENCES public.hashtag (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, hashtag_id)
);

CREATE INDEX idx_event_hashtag_event ON public.event_hashtag (event_id);
CREATE INDEX idx_event_hashtag_hashtag ON public.event_hashtag (hashtag_id);

ALTER TABLE public.event_hashtag ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.event_hashtag FOR ALL TO service_role USING (true);

-- Blog ↔ Hashtag junction table
CREATE TABLE IF NOT EXISTS public.blog_hashtag (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id UUID NOT NULL REFERENCES public.blog (id) ON DELETE CASCADE,
  hashtag_id UUID NOT NULL REFERENCES public.hashtag (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (blog_id, hashtag_id)
);

CREATE INDEX idx_blog_hashtag_blog ON public.blog_hashtag (blog_id);
CREATE INDEX idx_blog_hashtag_hashtag ON public.blog_hashtag (hashtag_id);

ALTER TABLE public.blog_hashtag ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.blog_hashtag FOR ALL TO service_role USING (true);

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
