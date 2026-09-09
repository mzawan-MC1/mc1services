-- Ensure user_profiles columns
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Self access policies (keep admin policies elsewhere)
DROP POLICY IF EXISTS "user_profiles_self_select" ON public.user_profiles;
CREATE POLICY "user_profiles_self_select" ON public.user_profiles
FOR SELECT TO authenticated USING (id = auth.uid());

DROP POLICY IF EXISTS "user_profiles_self_insert" ON public.user_profiles;
CREATE POLICY "user_profiles_self_insert" ON public.user_profiles
FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "user_profiles_self_update" ON public.user_profiles;
CREATE POLICY "user_profiles_self_update" ON public.user_profiles
FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

NOTIFY pgrst, 'reload schema';

-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DO $$
BEGIN
  -- Select: allow anon & authenticated to read from avatars bucket
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='avatars_select_public'
  ) THEN
    CREATE POLICY avatars_select_public ON storage.objects
    FOR SELECT TO anon, authenticated
    USING (bucket_id = 'avatars');
  END IF;

  -- Insert own
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='avatars_insert_own'
  ) THEN
    CREATE POLICY avatars_insert_own ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'avatars' AND (name LIKE auth.uid()::text || '/%' OR name = auth.uid()::text));
  END IF;

  -- Update own
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='avatars_update_own'
  ) THEN
    CREATE POLICY avatars_update_own ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'avatars' AND (name LIKE auth.uid()::text || '/%' OR name = auth.uid()::text))
    WITH CHECK (bucket_id = 'avatars' AND (name LIKE auth.uid()::text || '/%' OR name = auth.uid()::text));
  END IF;

  -- Delete own
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='avatars_delete_own'
  ) THEN
    CREATE POLICY avatars_delete_own ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'avatars' AND (name LIKE auth.uid()::text || '/%' OR name = auth.uid()::text));
  END IF;
END $$;
