-- Add missing columns to contact_submissions table
-- These columns are required by the frontend Contact form

-- 1. Add phone column
ALTER TABLE contact_submissions 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- 2. Add company column
ALTER TABLE contact_submissions 
ADD COLUMN IF NOT EXISTS company TEXT;

-- 3. Add service_interest column
ALTER TABLE contact_submissions 
ADD COLUMN IF NOT EXISTS service_interest TEXT;

-- 4. Ensure RLS policies allow public insert (redundant safety check)
DROP POLICY IF EXISTS "Allow public inserts" ON contact_submissions;
CREATE POLICY "Allow public inserts" ON contact_submissions
FOR INSERT 
WITH CHECK (true);

-- 5. Grant permissions to anon role
GRANT INSERT ON contact_submissions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON contact_submissions TO service_role;
