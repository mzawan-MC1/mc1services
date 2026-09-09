-- Policies to allow Admin Dashboard queries under RLS

-- Team Members: allow admins to read all
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can read team members" ON public.team_members;
CREATE POLICY "Admins can read team members" ON public.team_members
FOR SELECT TO authenticated
USING (public.is_admin());

-- Contact Submissions: admins can read and update
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can read contact submissions" ON public.contact_submissions;
CREATE POLICY "Admins can read contact submissions" ON public.contact_submissions
FOR SELECT TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update contact submissions" ON public.contact_submissions;
CREATE POLICY "Admins can update contact submissions" ON public.contact_submissions
FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Allow anyone to submit a contact form
DROP POLICY IF EXISTS "Anyone can insert contact submissions" ON public.contact_submissions;
CREATE POLICY "Anyone can insert contact submissions" ON public.contact_submissions
FOR INSERT TO anon, authenticated
WITH CHECK (true);
