## What Happened
- The update request to `portfolio` returns `400 (Bad Request)` with `PGRST204`.
- Error message: "Could not find the 'main_image_url' column of 'portfolio' in the schema cache".
- The frontend sends `main_image_url` in the payload from Admin edit page.
- Code references:
  - Update call and logging: `src/components/supabaseClient.jsx:86-100` (error logged at `src/components/supabaseClient.jsx:97`).
  - Payload includes `main_image_url`: `src/pages/AdminPortfolioEdit.jsx:118-131` and usage throughout the page.
  - Display expects `portfolio.main_image_url`: `src/pages/PortfolioDetail.jsx:52-55`.
- Current DB schema for `portfolio` (initial migration) has `image_url` but not `main_image_url`: `supabase/migrations/20250207_initial_schema.sql:57-66`. The later `update_portfolio_schema.sql` adds more fields but still not `main_image_url`.

## Root Cause
- Schema/client mismatch: frontend uses `main_image_url` while the `portfolio` table only has `image_url`. PostgREST rejects unknown columns in update payload, producing `PGRST204`.

## Plan (Preferred): Add `main_image_url` to the schema
- Rationale: Keeps the clearer semantic name used across the UI and detail page, avoids touching multiple components now. We can copy existing `image_url` values to the new column for backward compatibility.
- Steps (run in Supabase SQL editor):
  1. Add the column and backfill from `image_url`:
     ```sql
     ALTER TABLE public.portfolio ADD COLUMN IF NOT EXISTS main_image_url text;
     UPDATE public.portfolio
     SET main_image_url = image_url
     WHERE main_image_url IS NULL AND image_url IS NOT NULL;
     ```
  2. Optional: keep `image_url` for now. If you plan to deprecate it later, add a follow-up migration to drop it once all code is updated.
  3. Reload PostgREST schema cache if the error persists immediately after migration:
     ```sql
     SELECT pg_notify('pgrst', 'reload schema');
     ```
  4. Confirm RLS policies allow `anon` (or your frontend role) to `select` and `update` `portfolio`. Column-level permissions aren’t separate, but table-level policies must permit the operation.

## Alternative Plan: Rename frontend to use `image_url`
- Update fields and references:
  - Admin edit payload: change `main_image_url` to `image_url` in `src/pages/AdminPortfolioEdit.jsx`.
  - Reading: use `project.image_url` when loading values.
  - Display: replace `portfolio.main_image_url` with `portfolio.image_url` in `src/pages/PortfolioDetail.jsx`.
- Pros: No DB change. Cons: Touches multiple components and diverges naming from other places that already expect `main_image_url`.

## Verification
- After applying the preferred schema change:
  - Edit an existing project and save; the network request should return `200` and the error should disappear.
  - Confirm the hero image shows on detail page, driven by `portfolio.main_image_url`.
  - Validate an update with a new uploaded image: payload includes `main_image_url` and `PATCH` succeeds.

## Notes
- The `net::ERR_FAILED` lines are a consequence of the failed `PATCH`; fix the schema mismatch and they should stop.
- Ensure environment variables are set so the client sends the proper `apikey` header; the client is created at `src/components/supabaseClient.jsx:9-16`, and current errors indicate authorization is fine but the payload is invalid.