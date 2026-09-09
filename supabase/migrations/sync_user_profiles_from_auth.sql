-- Create trigger to mirror auth.users into public.user_profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, role, created_at)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'role', 'user'), NOW())
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill existing auth users into profiles
INSERT INTO public.user_profiles (id, email, role, created_at)
SELECT u.id, u.email, COALESCE(u.raw_user_meta_data->>'role', 'user'), NOW()
FROM auth.users u
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

-- Admin-invokable sync function to re-sync profiles from auth
CREATE OR REPLACE FUNCTION public.sync_profiles_from_auth()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  upserted integer;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  WITH upserts AS (
    INSERT INTO public.user_profiles (id, email, role, created_at)
    SELECT u.id, u.email, COALESCE(u.raw_user_meta_data->>'role', 'user'), NOW()
    FROM auth.users u
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email
    RETURNING 1
  )
  SELECT COUNT(*) INTO upserted FROM upserts;

  RETURN upserted;
END;
$$;

GRANT EXECUTE ON FUNCTION public.sync_profiles_from_auth() TO authenticated;
