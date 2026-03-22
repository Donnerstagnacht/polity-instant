-- =============================================================================
-- 07_blog.sql — Blogs and bloggers
-- Blog support votes moved to 20_vote.sql
-- =============================================================================

-- Blog table
CREATE TABLE IF NOT EXISTS public.blog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  description TEXT,
  content JSONB,
  date TEXT,
  image_url TEXT,
  is_public BOOLEAN,
  visibility TEXT NOT NULL DEFAULT 'public',
  subscriber_count INTEGER NOT NULL DEFAULT 0,
  supporter_count INTEGER NOT NULL DEFAULT 0,
  like_count INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  editing_mode TEXT,
  discussions JSONB,
  group_id UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_blog_group ON public.blog (group_id);

ALTER TABLE public.blog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.blog FOR ALL TO service_role USING (true);

-- Blog blogger table
CREATE TABLE IF NOT EXISTS public.blog_blogger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id UUID NOT NULL REFERENCES public.blog (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  role_id UUID REFERENCES public.role (id) ON DELETE SET NULL,
  status TEXT,
  visibility TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_blog_blogger_blog ON public.blog_blogger (blog_id);
CREATE INDEX idx_blog_blogger_user ON public.blog_blogger (user_id);

ALTER TABLE public.blog_blogger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.blog_blogger FOR ALL TO service_role USING (true);

-- Blog support vote table
CREATE TABLE IF NOT EXISTS public.blog_support_vote (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id UUID NOT NULL REFERENCES public.blog (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  vote TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_blog_support_vote_blog ON public.blog_support_vote (blog_id);
CREATE INDEX idx_blog_support_vote_user ON public.blog_support_vote (user_id);

ALTER TABLE public.blog_support_vote ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.blog_support_vote FOR ALL TO service_role USING (true);

