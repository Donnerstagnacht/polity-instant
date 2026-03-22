-- =============================================================================
-- 05_document.sql — Documents, versions, collaborators, cursors
-- Threads and comments moved to 15_discussion.sql
-- Thread/comment votes moved to 20_vote.sql
-- =============================================================================

-- Document table
CREATE TABLE IF NOT EXISTS public.document (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amendment_id UUID,
  content JSONB,
  editing_mode TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_document_amendment ON public.document (amendment_id);

ALTER TABLE public.document ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.document FOR ALL TO service_role USING (true);

-- Document version table
CREATE TABLE IF NOT EXISTS public.document_version (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.document (id) ON DELETE CASCADE,
  amendment_id UUID,
  blog_id UUID,
  content JSONB,
  version_number INTEGER,
  change_summary TEXT,
  author_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_document_version_document ON public.document_version (document_id);
CREATE INDEX idx_document_version_author ON public.document_version (author_id);

ALTER TABLE public.document_version ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.document_version FOR ALL TO service_role USING (true);

-- Document collaborator table
CREATE TABLE IF NOT EXISTS public.document_collaborator (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.document (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  role_id UUID,
  status TEXT,
  visibility TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_document_collaborator_document ON public.document_collaborator (document_id);
CREATE INDEX idx_document_collaborator_user ON public.document_collaborator (user_id);

ALTER TABLE public.document_collaborator ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.document_collaborator FOR ALL TO service_role USING (true);

-- Document cursor table
CREATE TABLE IF NOT EXISTS public.document_cursor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.document (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  position JSONB,
  selection JSONB,
  color TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_document_cursor_document ON public.document_cursor (document_id);

ALTER TABLE public.document_cursor ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.document_cursor FOR ALL TO service_role USING (true);


