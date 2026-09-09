-- Add profile_url to team_members
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS profile_url TEXT;

-- Migrate existing LinkedIn/Twitter URLs to profile_url
-- Priority: LinkedIn, then Twitter
UPDATE team_members
SET profile_url = COALESCE(linkedin_url, twitter_url)
WHERE profile_url IS NULL AND (linkedin_url IS NOT NULL OR twitter_url IS NOT NULL);

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
