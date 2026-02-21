-- =============================================================================
-- 08_todo.sql — Todos and todo assignments
-- =============================================================================

-- Todo table
CREATE TABLE IF NOT EXISTS public.todo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  description TEXT,
  status TEXT,
  priority TEXT,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  tags JSONB,
  visibility TEXT NOT NULL DEFAULT 'public',
  creator_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  group_id UUID,
  event_id UUID,
  amendment_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_todo_creator ON public.todo (creator_id);
CREATE INDEX idx_todo_group ON public.todo (group_id);
CREATE INDEX idx_todo_status ON public.todo (status);

ALTER TABLE public.todo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.todo FOR ALL TO service_role USING (true);

-- Todo assignment table
CREATE TABLE IF NOT EXISTS public.todo_assignment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  todo_id UUID NOT NULL REFERENCES public.todo (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  role TEXT,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_todo_assignment_todo ON public.todo_assignment (todo_id);
CREATE INDEX idx_todo_assignment_user ON public.todo_assignment (user_id);

ALTER TABLE public.todo_assignment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.todo_assignment FOR ALL TO service_role USING (true);
