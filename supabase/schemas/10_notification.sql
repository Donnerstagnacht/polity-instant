-- =============================================================================
-- 10_notification.sql — Notifications, push subscriptions, notification settings
-- =============================================================================

-- Notification table
CREATE TABLE IF NOT EXISTS public.notification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES public."user" (id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public."user" (id) ON DELETE SET NULL,
  title TEXT,
  message TEXT,
  type TEXT,
  action_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  related_entity_type TEXT,
  on_behalf_of_entity_type TEXT,
  on_behalf_of_entity_id UUID,
  recipient_entity_type TEXT,
  recipient_entity_id UUID,
  related_user_id UUID,
  related_group_id UUID,
  related_amendment_id UUID,
  related_event_id UUID,
  related_blog_id UUID,
  on_behalf_of_group_id UUID,
  on_behalf_of_event_id UUID,
  on_behalf_of_amendment_id UUID,
  on_behalf_of_blog_id UUID,
  recipient_group_id UUID,
  recipient_event_id UUID,
  recipient_amendment_id UUID,
  recipient_blog_id UUID,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notification_recipient ON public.notification (recipient_id);
CREATE INDEX idx_notification_sender ON public.notification (sender_id);
CREATE INDEX idx_notification_is_read ON public.notification (is_read);
CREATE INDEX idx_notification_recipient_entity ON public.notification (recipient_entity_id, created_at);
CREATE INDEX idx_notification_recipient_group ON public.notification (recipient_group_id, created_at);
CREATE INDEX idx_notification_recipient_read ON public.notification (recipient_id, is_read);
CREATE INDEX idx_notification_category ON public.notification (category);

ALTER TABLE public.notification ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.notification FOR ALL TO service_role USING (true);

-- Push subscription table
CREATE TABLE IF NOT EXISTS public.push_subscription (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  auth TEXT,
  p256dh TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_push_subscription_user ON public.push_subscription (user_id);

ALTER TABLE public.push_subscription ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.push_subscription FOR ALL TO service_role USING (true);

-- Notification setting table
CREATE TABLE IF NOT EXISTS public.notification_setting (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public."user" (id) ON DELETE CASCADE UNIQUE,
  group_notifications JSONB,
  event_notifications JSONB,
  amendment_notifications JSONB,
  blog_notifications JSONB,
  todo_notifications JSONB,
  social_notifications JSONB,
  delivery_settings JSONB,
  timeline_settings JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_setting ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.notification_setting FOR ALL TO service_role USING (true);

-- Notification read table (entity-level shared read tracking)
CREATE TABLE IF NOT EXISTS public.notification_read (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES public.notification (id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  read_by_user_id UUID REFERENCES public."user" (id) ON DELETE SET NULL,
  read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (notification_id, entity_type, entity_id)
);

CREATE INDEX idx_notification_read_entity ON public.notification_read (entity_type, entity_id);

ALTER TABLE public.notification_read ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.notification_read FOR ALL TO service_role USING (true);
