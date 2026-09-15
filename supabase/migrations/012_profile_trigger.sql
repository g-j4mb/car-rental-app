-- Auto-create a profile row when an auth user is created. This supersedes the
-- drop in 005. Differences that make it safe this time:
--   * SECURITY DEFINER + fixed search_path so it can write public.profiles
--     regardless of the caller's RLS context.
--   * role/partner_id are read from the user's metadata (so a partner login
--     created in the dashboard gets role='partner' + the right partner_id),
--     with role defaulting to 'staff'.
--   * ON CONFLICT DO NOTHING + an exception guard so a profile problem can
--     never bubble up as "Database error creating new user".
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, partner_id)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'staff'),
    NULLIF(NEW.raw_user_meta_data->>'partner_id', '')::uuid
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Never block auth user creation if the profile insert fails.
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
