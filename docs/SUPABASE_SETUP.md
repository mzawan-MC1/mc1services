
# Supabase Setup Guide

This project uses **Supabase** as its backend for database, authentication, and storage.

## 1. Prerequisites

- A Supabase account and project.
- Node.js installed.

## 2. Environment Configuration

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
VITE_SUPABASE_BUCKET=public
VITE_TURNSTILE_SITE_KEY=your_cloudflare_turnstile_site_key
# Optional: For running admin scripts locally
SUPABASE_SECRET_KEY=your_supabase_secret_key
```

`VITE_TURNSTILE_SITE_KEY` is public and belongs in the frontend `.env.local`. The Turnstile secret must never be added to this file or any frontend variable. Store it only as `TURNSTILE_SECRET_KEY` in Supabase Edge Function Secrets.

## 3. Database Schema

We do not use automatic schema migrations in production. Instead, we provide SQL scripts to be run in the Supabase Dashboard.

1.  **Generate Schema SQL**:
    Run the helper script to output the required SQL:
    ```bash
    node scripts/supabase/migrateSchema.js
    ```
2.  **Apply SQL**:
    - Copy the output from the console.
    - Go to your Supabase Dashboard -> **SQL Editor**.
    - Paste and run the SQL.

This will create all necessary tables (`portfolio`, `services`, `site_settings`, etc.) and storage policies.

## 4. Seeding Data

To populate the database with initial content (Tools, Services, Testimonials, etc.):

```bash
node scripts/supabase/seedDatabase.js
```

*Note: This script is safe to run multiple times (idempotent).*

## 5. creating Admin User

To access the Admin Dashboard (`/AdminLogin`), you need an admin user.

1.  Run the creation script:
    ```bash
    node scripts/supabase/createAdmin.js
    ```
    *Defaults: `admin@mc1services.com` / `Password123!`*

2.  Or customize credentials:
    ```bash
    ADMIN_EMAIL=my@email.com ADMIN_PASSWORD=securepass node scripts/supabase/createAdmin.js
    ```

## 6. Development

The application connects to Supabase using the `dataLayer` abstraction in `src/components/dataLayer.jsx`.

- **Data Access**: Always use `dataLayer.entity.method()` (e.g., `dataLayer.portfolio.getAll()`).
- **Auth**: Use `dataLayer.auth` or standard Supabase auth hooks.

## Troubleshooting

- **"Supabase not initialized"**: Check `.env.local` variables.
- **White screen on Admin**: Ensure your user has the `admin` role in the `user_profiles` table.
- **RLS Errors**: Check the RLS policies in the SQL Editor. By default, public read access is enabled for content, and write access requires authentication.
- **PGRST204 for `main_image_url`**: Add the missing column to `portfolio` and backfill from `image_url`:

  ```sql
  ALTER TABLE public.portfolio ADD COLUMN IF NOT EXISTS main_image_url text;
  UPDATE public.portfolio
  SET main_image_url = image_url
  WHERE main_image_url IS NULL AND image_url IS NOT NULL;
  ```

  If you still see the error immediately after running the migration, reload the PostgREST schema cache:

  ```sql
  SELECT pg_notify('pgrst', 'reload schema');
  ```

  Ensure your policies allow the frontend role to update/select `portfolio`.

- **"Upload failed: new row violates row-level security policy"**:
  Your storage policies are missing UPDATE permissions (required for upsert operations) or DELETE permissions. Run this in SQL Editor:

  ```sql
  -- Fix Storage RLS Policies for "public" bucket
  DROP POLICY IF EXISTS "Public Access" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated Insert" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;

  -- Allow Public Read
  CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'public');
  -- Allow Authenticated Insert
  CREATE POLICY "Authenticated Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'public' AND auth.role() = 'authenticated');
  -- Allow Authenticated Update (for upsert)
  CREATE POLICY "Authenticated Update" ON storage.objects FOR UPDATE USING (bucket_id = 'public' AND auth.role() = 'authenticated');
  -- Allow Authenticated Delete
  CREATE POLICY "Authenticated Delete" ON storage.objects FOR DELETE USING (bucket_id = 'public' AND auth.role() = 'authenticated');
  ```

  **For `team-photos` bucket:**
  If you are using a custom bucket for team photos, ensure it exists and has policies:

  ```sql
  -- Ensure bucket exists
  INSERT INTO storage.buckets (id, name, public) VALUES ('team-photos', 'team-photos', true) ON CONFLICT (id) DO NOTHING;

  -- Create Policies
  CREATE POLICY "Public Access Team" ON storage.objects FOR SELECT USING (bucket_id = 'team-photos');
  CREATE POLICY "Auth Insert Team" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'team-photos' AND auth.role() = 'authenticated');
  CREATE POLICY "Auth Update Team" ON storage.objects FOR UPDATE USING (bucket_id = 'team-photos' AND auth.role() = 'authenticated');
  CREATE POLICY "Auth Delete Team" ON storage.objects FOR DELETE USING (bucket_id = 'team-photos' AND auth.role() = 'authenticated');
  ```

## Verification

- Open Admin Portfolio Edit and update a project.
- Confirm the request succeeds (`200 OK`) in the browser network panel.
- Ensure the detail page shows the main image (`main_image_url`).
- Upload a new image to verify updates persist to `portfolio.main_image_url`.
