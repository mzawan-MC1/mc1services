-- Cleanup old recursive policies and reapply safe policies for user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop legacy policies that referenced user_profiles within their condition
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.user_profiles;

-- Also drop previously added policy names to ensure a clean slate
DROP POLICY IF EXISTS "read_own_or_admin_all" ON public.user_profiles;
DROP POLICY IF EXISTS "insert_own" ON public.user_profiles;
DROP POLICY IF EXISTS "update_own_or_admin_all" ON public.user_profiles;
DROP POLICY IF EXISTS "delete_admin_only" ON public.user_profiles;

-- Recreate safe, non-recursive policies using admin_users
CREATE POLICY "user_profiles_select" ON public.user_profiles
FOR SELECT TO authenticated
USING (id = auth.uid() OR EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

CREATE POLICY "user_profiles_insert" ON public.user_profiles
FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "user_profiles_update" ON public.user_profiles
FOR UPDATE TO authenticated
USING (id = auth.uid() OR EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()))
WITH CHECK (id = auth.uid() OR EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

CREATE POLICY "user_profiles_delete" ON public.user_profiles
FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));
