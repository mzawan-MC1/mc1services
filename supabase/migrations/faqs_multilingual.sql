-- Multilingual FAQs: columns + RLS policies + schema reload
ALTER TABLE public.faqs ADD COLUMN IF NOT EXISTS question_ar TEXT;
ALTER TABLE public.faqs ADD COLUMN IF NOT EXISTS answer_ar TEXT;
ALTER TABLE public.faqs ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Public read (anon + authenticated)
DROP POLICY IF EXISTS "faqs_public_select" ON public.faqs;
CREATE POLICY "faqs_public_select" ON public.faqs
FOR SELECT TO anon, authenticated
USING (true);

-- Admin insert
DROP POLICY IF EXISTS "faqs_admin_insert" ON public.faqs;
CREATE POLICY "faqs_admin_insert" ON public.faqs
FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

-- Admin update
DROP POLICY IF EXISTS "faqs_admin_update" ON public.faqs;
CREATE POLICY "faqs_admin_update" ON public.faqs
FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

-- Admin delete
DROP POLICY IF EXISTS "faqs_admin_delete" ON public.faqs;
CREATE POLICY "faqs_admin_delete" ON public.faqs
FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

NOTIFY pgrst, 'reload schema';
