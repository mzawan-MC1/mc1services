## Diagnosis
- Error: `PGRST204` indicates PostgREST cannot find `portfolio.main_image_url` in the schema cache.
- Frontend payload includes `main_image_url` from the admin form.
- Initial schema has `image_url` but not `main_image_url`.

## Options
1. Add `main_image_url` to `portfolio` and keep frontend as-is (preferred).
2. Rename frontend payload to match existing `image_url` everywhere (alternative).

## Implementation (Preferred)
- Run in Supabase SQL Editor:
  - `ALTER TABLE public.portfolio ADD COLUMN IF NOT EXISTS main_image_url text;`
  - `UPDATE public.portfolio SET main_image_url = image_url WHERE main_image_url IS NULL AND image_url IS NOT NULL;`
- Reload schema cache if error persists immediately after migration:
  - `SELECT pg_notify('pgrst', 'reload schema');`
- Confirm RLS policies allow `update`/`select` on `portfolio` for your frontend role.

## Verification
- Edit an existing portfolio and Save; expect `PATCH .../rest/v1/portfolio ... 200`.
- Create a new portfolio; insertion succeeds.
- Detail page displays `portfolio.main_image_url` image.

## Alternative (If you prefer no DB change)
- Replace all uses of `main_image_url` with `image_url`:
  - Insert/update payload mapping in `src/pages/AdminPortfolioEdit.jsx`.
  - Reads in `src/pages/PortfolioDetail.jsx` and any other consumers.
- Retest save and detail rendering.

## Notes
- If you encounter `No API key found in request`, verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are present; client is created in `src/components/supabaseClient.jsx`.