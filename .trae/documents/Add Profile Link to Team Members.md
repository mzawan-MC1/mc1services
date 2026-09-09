## Implementation Plan for Team Member Profile Link

### 1. Database Schema Update
- Add `profile_url` column to `team_members` table in Supabase.
- Create a migration file: `supabase/migrations/20251210_add_team_profile_url.sql`.
- Update `scripts/supabase/migrateSchema.js` to include the new column in future setups.
- **Migration Logic:**
  - `ALTER TABLE team_members ADD COLUMN IF NOT EXISTS profile_url TEXT;`
  - Migrate existing `linkedin_url` to `profile_url` if it exists and `profile_url` is null.

### 2. Admin Interface (`src/pages/AdminTeamEdit.jsx`)
- Update state `formData` to include `profile_url`.
- Update `useEffect` to load `profile_url` from fetched member data.
- Add a new input field for "Profile Link" below the Bio section.
- Add validation logic: ensure URL starts with `http://` or `https://`.
- Update `saveMutation` to include `profile_url` in the payload.

### 3. Frontend Display
- Since `src/components/Team.jsx` was not found, I need to locate where team members are displayed. I'll search for "Team" or "Meet the Experts" in the pages directory (likely `About.jsx` or `Home.jsx` or a section component).
- Once located, update the rendering logic:
  - Check if `profile_url` exists.
  - Determine the social icon based on the domain (LinkedIn, Instagram, Facebook, Snapchat, or generic).
  - Render the icon/link overlaying the team member card or below their details.

### 4. Data Layer (`src/components/dataLayer.jsx`)
- Verify `dataLayer.team` methods (`create`, `update`) pass all fields through. Since it uses `supabaseHelpers.create` which likely passes the whole object, no changes might be needed in `dataLayer.jsx` itself, but I will verify.

### 5. Verification & Backward Compatibility
- The SQL migration will handle the data migration from `linkedin_url` (if it existed in the schema, though the initial schema shows `linkedin_url` and `twitter_url` columns).
- **Wait**, the initial schema (`20250207_initial_schema.sql`) shows:
  ```sql
  linkedin_url TEXT,
  twitter_url TEXT,
  ```
- **Correction:** The user asked for *ONE* profile link. I will migrate `linkedin_url` or `twitter_url` to `profile_url` in the migration script to preserve existing data.

### Todo List
1.  **Search**: Find the frontend component displaying team members.
2.  **Migration**: Create SQL migration to add `profile_url` and migrate data.
3.  **Update Script**: Update `migrateSchema.js`.
4.  **Admin**: Update `AdminTeamEdit.jsx` with new field and validation.
5.  **Frontend**: Update the team display component with dynamic icons.
