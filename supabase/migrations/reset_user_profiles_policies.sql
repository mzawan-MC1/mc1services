-- Fully reset policies on public.user_profiles to eliminate recursion
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_profiles', pol.policyname);
  END LOOP;
END$$;

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Safe, non-recursive policies using admin_users
CREATE POLICY user_profiles_select ON public.user_profiles
FOR SELECT TO authenticated
USING (id = auth.uid() OR EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

CREATE POLICY user_profiles_insert ON public.user_profiles
FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY user_profiles_update ON public.user_profiles
FOR UPDATE TO authenticated
USING (id = auth.uid() OR EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()))
WITH CHECK (id = auth.uid() OR EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

CREATE POLICY user_profiles_delete ON public.user_profiles
FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));
