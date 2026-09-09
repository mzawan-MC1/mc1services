
/**
 * Fix Contact Submissions RLS
 * 
 * This script outputs the SQL to fix the "blink" issue on the contact form
 * by enabling public inserts into the contact_submissions table.
 * 
 * Usage:
 * 1. Run: node scripts/supabase/fix_contact_rls.js
 * 2. Copy the output SQL
 * 3. Paste into Supabase Dashboard > SQL Editor
 * 4. Run the SQL
 */

console.log(`
-- ==========================================
-- FIX: CONTACT FORM PERMISSIONS
-- ==========================================

-- 1. Enable Row Level Security (if not already enabled)
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- 2. Allow ANYONE (public) to insert new messages
DROP POLICY IF EXISTS "Allow public inserts" ON contact_submissions;
CREATE POLICY "Allow public inserts" ON contact_submissions
FOR INSERT 
WITH CHECK (true);

-- 3. Allow only LOGGED IN users (Admins) to view/manage messages
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

-- 4. (Optional) Verify table exists
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT,
  subject TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`);
