ALTER TABLE public.portfolio ADD COLUMN IF NOT EXISTS main_image_url text;
UPDATE public.portfolio
SET main_image_url = image_url
WHERE main_image_url IS NULL AND image_url IS NOT NULL;
