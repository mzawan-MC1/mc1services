-- Enable RLS and add policies for team_members

-- 1. Enable Row Level Security
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- 2. Allow public read access (so they can be displayed on the site)
DROP POLICY IF EXISTS "Allow public read" ON team_members;
CREATE POLICY "Allow public read" ON team_members
FOR SELECT
USING (true);

-- 3. Allow authenticated admins to insert/update/delete
DROP POLICY IF EXISTS "Allow admin insert" ON team_members;
CREATE POLICY "Allow admin insert" ON team_members
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow admin update" ON team_members;
CREATE POLICY "Allow admin update" ON team_members
FOR UPDATE
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow admin delete" ON team_members;
CREATE POLICY "Allow admin delete" ON team_members
FOR DELETE
USING (auth.role() = 'authenticated');
