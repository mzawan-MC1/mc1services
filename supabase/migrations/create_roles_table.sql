CREATE TABLE IF NOT EXISTS public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  permissions jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Admins can read all roles
DROP POLICY IF EXISTS "roles_select_admin" ON public.roles;
CREATE POLICY "roles_select_admin" ON public.roles
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

-- Admins can insert roles
DROP POLICY IF EXISTS "roles_insert_admin" ON public.roles;
CREATE POLICY "roles_insert_admin" ON public.roles
FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

-- Admins can update roles
DROP POLICY IF EXISTS "roles_update_admin" ON public.roles;
CREATE POLICY "roles_update_admin" ON public.roles
FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

-- Admins can delete roles
DROP POLICY IF EXISTS "roles_delete_admin" ON public.roles;
CREATE POLICY "roles_delete_admin" ON public.roles
FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

-- Seed default roles
INSERT INTO public.roles (name, description)
VALUES ('admin', 'Full administrative access'), ('editor', 'Content editor'), ('viewer', 'Read-only access')
ON CONFLICT (name) DO NOTHING;
