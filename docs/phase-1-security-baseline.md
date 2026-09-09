# Phase 1 security baseline

Recorded: 2026-09-09T14:23:00+04:00

This record was created before Phase 1 source changes. The directory was not a Git working tree, so SHA-256 hashes provide a tamper-evident baseline for the relevant local files. No environment files or secret values are recorded.

| File | SHA-256 before Phase 1 |
| --- | --- |
| `package.json` | `8652726B0639F5AB038E41332B119B0C0C1377BFB995220F448E5921AB12225F` |
| `package-lock.json` | `341AA3A0ADDA7A1AB7FC8DE4A3090CF3E0AB5377A22CDC03E2E37E6734ACB6B1` |
| `src/pages/index.jsx` | `7FA391D58FFF6CDD5EB11ECA8F7F8F099BAE5E8BBC2C9CCCFC0E224CCD9FD7E4` |
| `src/components/AdminRoute.jsx` | `AE8F1FE388EEB083F85DFE9207CCCABBBDF9B3CF5F7916FB0E989936BD05CE9E` |
| `src/components/dataLayer.jsx` | `74B43FB9E8EDC8694CE80FF43A895CD751CF1AB6548196A7405C7DA73D2E3813` |
| `scripts/supabase/createAdmin.js` | `72CE833C73A7FD0390DE1094AD5F7C5315236D57BBABF5E30AFB2AE84B440F2D` |
| `public/.htaccess` | `E8726F4CE9834D7DEE5C455484D39A7F3E9244C86B9CF09D1A088D340184F27F` |

## Baseline state

- Git repository: not present
- Environment files found: `.env.local` only
- Production host configuration found: Vercel metadata and an Apache/SiteGround `.htaccess`
- Production build directory: `dist`
- Live database state: not inspected; repository SQL is not treated as proof of production state

## Phase 1 local scope

- Remove embedded/default privileged credentials from the admin utility.
- Fail closed when administrator status cannot be verified by the database.
- Apply the admin authorization guard centrally at the router.
- Prepare a read-only live Supabase inventory query.

No production SQL, credential rotation, deployment, push, or live-site modification is included.

## Live information supplied after the local baseline

- One intended Super Admin account was confirmed by the project owner.
- Storage buckets `avatars`, `public`, and `team-photos` are public.
- Those buckets currently have no configured file-size limit or MIME-type allowlist.
- The remaining live table, RLS, privilege, column, and function results are pending.
- Use of the exposed legacy service-role credential outside this repository is not yet known.
- The project owner approved rotation after dependency verification and a no-downtime sequence are prepared.

## Verified live security findings

- The confirmed Super Admin exists in both Supabase Auth and `public.admin_users`.
- Fourteen public tables had RLS disabled, including `admin_users` and core CMS content.
- Browser-facing roles had broad table privileges, including on tables without RLS.
- The live Auth trigger invokes `public.handle_new_user()`.
- The trigger function trusted user-supplied role metadata before hardening.
- `public.promote_self_admin()` was callable through the API and formed part of a privilege-escalation path.
- Several enabled tables had overlapping policies allowing any authenticated user or the public to write.
- `public.team_members` had public insert, update, and delete policies.
- The task statistics view did not have `security_invoker` enabled.
- The three public storage buckets had no server-side size or MIME-type restrictions.
- No project-specific database function referenced the project identifier or legacy service-role credential.

## Prepared production artifacts

- `supabase/migrations/20260909_phase1_security_hardening.sql`
- `docs/phase-1-supabase-security-verification.sql`
- `docs/phase-1-emergency-contingency.sql`

These files were prepared locally. They were not run against Supabase during preparation.

## Post-implementation verification

The project owner ran the hardening migration in Supabase and supplied the output from the verification query.

- Super Admin mapping: confirmed in both Supabase Auth and `public.admin_users`.
- Public tables without RLS: none.
- Public write policies reported by the broad-policy check: only the intentional anonymous inserts for `analytics_events` and `contact_submissions`; neither grants public read, update, or delete.
- Privileged functions: anonymous execution removed; authenticated execution remains only where required for `is_admin`, `admin_list_users`, and `sync_profiles_from_auth`.
- `promote_self_admin`: removed.
- `v_task_stats`: confirmed with `security_invoker=true`.
- Storage policies: confirmed as owner/admin-controlled for avatars, assigned-owner/admin-controlled for public uploads, and admin-controlled for team photos.
- Live public smoke test: Home, About, Portfolio, and Contact loaded; no form was submitted. `/admin` redirected to the admin login page.
- Authenticated admin smoke test: pending an authorised signed-in browser session.

## Local verification after Phase 1

- Targeted ESLint: passed.
- Node syntax checks for Supabase maintenance scripts: passed.
- Vite production build: passed in a temporary directory; temporary output removed.
- Existing `dist` directory: not rebuilt or modified.
- Hardcoded JWT/service-role scan outside environment and generated folders: no matches.
- Build warning retained for a later performance phase: the main minified JavaScript chunk is approximately 2.47 MB (approximately 696 KB gzip).

The frontend and maintenance scripts now prefer `VITE_SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SECRET_KEY`, with temporary fallback to the legacy environment-variable names during the no-downtime key migration.
