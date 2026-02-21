-- =============================================================================
-- 09_message.sql — Conversations, participants, messages
-- =============================================================================

-- Conversation table
CREATE TABLE IF NOT EXISTS public.conversation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT,
  name TEXT,
  status TEXT,
  pinned BOOLEAN,
  last_message_at TIMESTAMPTZ,
  group_id UUID,
  requested_by_id UUID REFERENCES public."user" (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_conversation_group ON public.conversation (group_id);
CREATE INDEX idx_conversation_requested_by ON public.conversation (requested_by_id);

ALTER TABLE public.conversation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.conversation FOR ALL TO service_role USING (true);

-- Conversation participant table
CREATE TABLE IF NOT EXISTS public.conversation_participant (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversation (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_read_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ
);

CREATE INDEX idx_conversation_participant_conversation ON public.conversation_participant (conversation_id);
CREATE INDEX idx_conversation_participant_user ON public.conversation_participant (user_id);

ALTER TABLE public.conversation_participant ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.conversation_participant FOR ALL TO service_role USING (true);

-- Message table
CREATE TABLE IF NOT EXISTS public.message (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversation (id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  content TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_message_conversation ON public.message (conversation_id);
CREATE INDEX idx_message_sender ON public.message (sender_id);

ALTER TABLE public.message ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.message FOR ALL TO service_role USING (true);
