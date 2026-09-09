-- Admin-only function to list users from auth with profile info
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  role text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT u.id,
         u.email,
         up.full_name,
         up.role,
         COALESCE(up.created_at, u.created_at)
  FROM auth.users u
  LEFT JOIN public.user_profiles up ON up.id = u.id
  WHERE EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid());
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
