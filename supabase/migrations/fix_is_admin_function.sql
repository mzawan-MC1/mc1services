-- Create dedicated admin_users table to avoid RLS recursion on user_profiles
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Seed known admin by email (adjust as needed)
INSERT INTO public.admin_users (id)
SELECT u.id FROM auth.users u
WHERE lower(u.email) = lower('admin@mc1services.com')
ON CONFLICT (id) DO NOTHING;

-- Redefine is_admin() to check admin_users, not user_profiles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users au
    WHERE au.id = auth.uid()
  );
$$;

GRANT SELECT ON public.admin_users TO authenticated;
