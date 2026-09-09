CREATE OR REPLACE FUNCTION public.promote_self_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'admin'
  ) THEN
    INSERT INTO public.admin_users (id)
    VALUES (auth.uid())
    ON CONFLICT (id) DO NOTHING;
    RETURN TRUE;
  END IF;
  RAISE EXCEPTION 'not authorized';
END;
$$;

GRANT EXECUTE ON FUNCTION public.promote_self_admin() TO authenticated;
