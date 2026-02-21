-- =============================================================================
-- 22_functions.sql — Database functions and triggers
-- =============================================================================

-- Handle new user creation from Supabase Auth
-- Automatically creates a user profile and default notification settings
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

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
