-- 1. Add profile_url to team_members (Idempotent)
ALTER TABLE public.team_members 
ADD COLUMN IF NOT EXISTS profile_url text;

-- 2. Fix Storage RLS Policies for "public" bucket
-- First, clean up any conflicting policies for this specific bucket
DROP POLICY IF EXISTS "public_bucket_select" ON storage.objects;
DROP POLICY IF EXISTS "public_bucket_insert" ON storage.objects;
DROP POLICY IF EXISTS "public_bucket_update" ON storage.objects;
DROP POLICY IF EXISTS "public_bucket_delete" ON storage.objects;

-- Allow public read access (Everyone can view files)
CREATE POLICY "public_bucket_select" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'public');

-- Allow authenticated users to upload (INSERT)
CREATE POLICY "public_bucket_insert" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'public');

-- Allow authenticated users to update (required for upsert operations)
CREATE POLICY "public_bucket_update" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'public') 
WITH CHECK (bucket_id = 'public');

-- Allow authenticated users to delete
CREATE POLICY "public_bucket_delete" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'public');

-- 3. Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
