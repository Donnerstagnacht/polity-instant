-- Add user_preference row creation to the signup trigger.
-- Previously only user + notification_setting were created on auth.users INSERT.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public."user" (id, email)
  VALUES (NEW.id, NEW.email);

  INSERT INTO public.notification_setting (user_id)
  VALUES (NEW.id);

  INSERT INTO public.user_preference (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$;
