-- Fix Contact Form Permissions and Ensure Table Exists

-- 1. Ensure Table Exists
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT,
  subject TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- 3. Allow ANYONE (public) to insert new messages
DROP POLICY IF EXISTS "Allow public inserts" ON contact_submissions;
CREATE POLICY "Allow public inserts" ON contact_submissions
FOR INSERT 
WITH CHECK (true);

-- 4. Allow only LOGGED IN users (Admins) to view/manage messages
DROP POLICY IF EXISTS "Allow authenticated view" ON contact_submissions;
CREATE POLICY "Allow authenticated view" ON contact_submissions
FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated update" ON contact_submissions;
CREATE POLICY "Allow authenticated update" ON contact_submissions
FOR UPDATE
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated delete" ON contact_submissions;
CREATE POLICY "Allow authenticated delete" ON contact_submissions
FOR DELETE
USING (auth.role() = 'authenticated');
