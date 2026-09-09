-- Ensure FAQs have a stable integer display order
ALTER TABLE public.faqs ADD COLUMN IF NOT EXISTS display_order INTEGER;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='faqs' AND column_name='order'
  ) THEN
    EXECUTE 'UPDATE public.faqs SET display_order = COALESCE(display_order, "order")';
    EXECUTE 'ALTER TABLE public.faqs DROP COLUMN "order"';
  END IF;
END $$;

WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) AS rn
  FROM public.faqs
)
UPDATE public.faqs f
SET display_order = n.rn
FROM numbered n
WHERE f.id = n.id AND (f.display_order IS NULL OR f.display_order <= 0);

NOTIFY pgrst, 'reload schema';
