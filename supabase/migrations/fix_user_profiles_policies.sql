-- Reset user_profiles policies to avoid recursion and rely on admin_users table
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.user_profiles;

-- Read: user can read own OR admin can read all
CREATE POLICY "read_own_or_admin_all" ON public.user_profiles
FOR SELECT
TO authenticated
USING (
  id = auth.uid() OR EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid())
);

-- Insert: user can insert own
CREATE POLICY "insert_own" ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Update: user can update own OR admin can update all
CREATE POLICY "update_own_or_admin_all" ON public.user_profiles
FOR UPDATE
TO authenticated
USING (
  id = auth.uid() OR EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid())
)
WITH CHECK (
  id = auth.uid() OR EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid())
);

-- Delete: admin only
CREATE POLICY "delete_admin_only" ON public.user_profiles
FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));
