# Phase 3 legacy Supabase key audit

Recorded: 2026-09-09

This phase verifies that the application no longer depends on Supabase's legacy JWT-based API keys. No key was printed, disabled, rotated, or changed in Supabase. No production deployment was performed.

## Baseline hashes

| File | SHA-256 before Phase 3 |
| --- | --- |
| `src/components/supabaseClient.jsx` | `73A607CDB8CDB211A19713DC2BEEEDDCBC0A13ACDC6F7F95F3A50E74FE354CF2` |
| `src/pages/AdminUsers.jsx` | `AE1F64251866237BA69D0E877C130DEACC5902C7B04FC642D225C36241068533` |
| `src/components/seedTools.jsx` | `B0F7450480C7E10167F81E1369DB3823C2899CFA07EAE1CE9093A83AE6F6577C` |
| `scripts/supabase/seedDatabase.js` | `C7FC7E2EC354D2F72C22FB6CBB286AA7D66544B2FB38B34544261FE2CC5CE456` |
| `scripts/supabase/cleanupUnusedAssets.cjs` | `DD611A20531AC0E7E616FE1396782F62937E95293493265EDE4849BA06B8D374` |
| `scripts/supabase/createAdmin.js` | `E74AD0572D30E29AD8113F1CF90A8A96839D54A5881F305DCCA082F7CA696771` |

## Confirmed local state

- `.env.local` is the only environment-variable file.
- Both the new publishable-key variable and the legacy anonymous-key variable are configured locally; their values were not printed or recorded.
- The deployed `dist` contains the new `sb_publishable_...` value and does not contain the legacy JWT anonymous-key value.
- The deployed `submit-contact` Edge Function uses the automatically managed `SUPABASE_SECRET_KEYS` value, not the legacy service-role key.
- No JWT-like API key is embedded in repository source files outside environment and generated folders.
- No repository workflow, scheduled job, webhook, worker, or second backend was found.
- Six source files retained legacy environment-variable names only as compatibility fallbacks.
- The repository is not a Git working tree.

## Local correction

- Removed the `VITE_SUPABASE_ANON_KEY` fallback from the frontend client, administrator user creation, and local maintenance/seed scripts.
- Removed the `SUPABASE_SERVICE_ROLE_KEY` fallback from the local administrator-creation script.
- Future builds and local scripts now fail clearly when the corresponding new key variable is missing instead of silently using a legacy credential.
- `.env.local` was not edited, and the legacy keys were not disabled or rotated.

## Remaining external dependency checks

Before disabling either legacy key, confirm that SiteGround scheduled jobs and any external automation do not use it. Supabase API/log usage should also be reviewed from an authorised dashboard session. Disable the legacy anonymous key first, verify the public site and administrator functions, and only then handle the legacy service-role key as a separate controlled change.

A value-safe, read-only database inventory is available in `docs/phase-3-supabase-read-only-check.sql`. It reports only object names and dependency flags and does not expose function bodies, job commands, headers, URLs, or credentials.

## Local verification

- Targeted frontend ESLint: passed.
- JavaScript syntax checks for all three maintenance scripts: passed.
- Active application, Edge Function, and maintenance-script scan for legacy key identifiers: no matches.
- Source scan for embedded JWT-like values: no matches.
- Isolated Vite production build: passed; temporary output was removed.
- Known deferred performance warning: the main JavaScript chunk remains approximately 2.48 MB minified and 697 KB gzip.
- Existing production `dist` and release ZIP: unchanged.

## Production completion

- Supabase OAuth server: confirmed disabled.
- Supabase OAuth applications: confirmed none configured.
- SiteGround scheduled jobs: confirmed none configured for this website.
- External automation, scripts, servers, and webhooks: project owner confirmed none known.
- Database dependency audit: no stored project-reference or legacy API-key dependency found. References to `anon` and `service_role` are PostgreSQL role checks and Supabase extension grants, not key values.
- Legacy JWT-based `anon` and `service_role` API keys: disabled manually by the project owner.
- Post-disable public website check: passed.
- Post-disable sign-out and fresh administrator sign-in: passed.
- Post-disable administrator functionality check: passed.
- Phase 3 legacy-key migration: complete.

The unused `VITE_SUPABASE_ANON_KEY` entry may now be removed from `.env.local`. Its value remains unrecorded, and application source no longer reads it.
