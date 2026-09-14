# Phase 2 security baseline

Recorded: 2026-09-09

The project is not a Git working tree. These SHA-256 hashes record the relevant local state before Phase 2 changes. No environment values or credentials are included.

| File | SHA-256 before Phase 2 |
| --- | --- |
| `src/components/FileUpload.jsx` | `C9D73AEA20F17C0374979436306190EDB06CD703C4325ABEDBB8CCCCFA75C480` |
| `src/components/GalleryUpload.jsx` | `2B9FCD6828C1FF6CBF70FE7707C38079D0F6B58192DAEB662DB1705B15AE6153` |
| `src/components/supabaseClient.jsx` | `8023048FB8601E746C0AC2E31F777E528488806D37FA07613D2BA0D65E2CC636` |
| `src/pages/Contact.jsx` | `6A07683A615C213392B8A6799AD7A34ACAC771B8524AB2FDA5B3C744FF55AA22` |
| `src/pages/AdminProfile.jsx` | `3EA86CAFD3ADC3A3004E2EBAB6CCA1152E6365471E21BE058ED6862A4DE76B21` |
| `src/pages/AdminTestimonialEdit.jsx` | `2A75B51A9C29EE04518A6D9D2CF0DB765F4CA14AEA98C6A4888CFEACCF87110F` |

## Confirmed starting state

- Shared CMS uploads accept files without a consistent maximum size or MIME-type validation.
- Storage buckets have policy protection but no bucket-level size or MIME-type limits.
- The contact form writes submitted personal information to the browser console.
- The contact form has basic required-field validation but no honeypot, submission timing check, or maximum field lengths.
- Anonymous clients can insert directly into `contact_submissions`; frontend-only controls cannot prevent direct API abuse.

## Phase 2 local scope

- Add consistent client-side upload validation and safe storage filenames.
- Remove contact-form personal-data logging.
- Add compatible form length limits, normalization, a honeypot, and basic rapid-submission protection.
- Prepare reviewed SQL for bucket-level upload limits; do not run it.
- Do not build the final `dist`, deploy, change credentials, configure Git, or modify production systems.

## Local implementation result

- Added central MIME-type, file-size, and storage-path validation.
- Shared image uploads allow JPG, PNG, WebP, GIF, AVIF, and ICO up to 10 MB.
- Shared video uploads allow MP4, WebM, and OGG up to 25 MB.
- Avatar uploads allow JPG, PNG, and WebP up to 2 MB.
- SVG uploads are intentionally rejected because active content in uploaded SVG files creates avoidable security risk.
- Removed contact-form personal-data logging and raw backend error display.
- Added trimming, maximum lengths, a hidden honeypot, and a 2.5-second minimum form-completion time.
- Added `supabase/migrations/20260909_phase2_input_and_storage_limits.sql`; it has not been run.
- Added `docs/phase-2-supabase-verification.sql`; it is read-only.

## Local verification

- New publishable-key environment-variable name: present in `.env.local` (value not read or recorded).
- Targeted ESLint: passed.
- Upload validation smoke test: passed, including rejection of SVG.
- Vite production build: passed in a temporary directory; temporary output removed.
- Existing `dist` directory: unchanged.
- Hardcoded JWT/secret-key scan outside environment and generated folders: no matches.
- Known deferred warning: the main production JavaScript chunk remains approximately 2.48 MB minified (approximately 696 KB gzip).

Frontend controls reduce accidental misuse and simple bot traffic, but they cannot stop direct calls to the public Supabase endpoint. Strong rate limiting or CAPTCHA verification requires a server-side endpoint such as a Supabase Edge Function.

## Production verification supplied by the project owner

- Storage limits and MIME allowlists: confirmed for `avatars`, `public`, and `team-photos`.
- Contact length and status constraints: present and enforced for new or updated rows.
- Existing contact rows were intentionally not validated or changed.
- Public contact insert policy: restricted to `new` submissions within the required name, email, and message lengths.
- Contact select, update, and delete policies: confirmed to require `is_admin()`.
- Phase 2 input and storage migration: verified successfully.

## Turnstile and Edge Function baseline

Recorded before the local integration changes:

| File | SHA-256 |
| --- | --- |
| `src/components/dataLayer.jsx` | `E5EF46F29893F3AD826603754F7E2C181777A2FE01B3BF93DF26236ED3676E9B` |
| `src/pages/Contact.jsx` | `935DB79B868D0ADAB8B539F608137485D9E8F79CD7503A38495D98CFBA1B902A` |
| `README.md` | `2E0C2FAAE3D9F8DBADB4195394419D01CF2C076FF10356797467F82ED84C73F1` |

- Existing public flow: `Contact.jsx` → `dataLayer.contactSubmissions.create` → `public.contact_submissions`.
- Existing admin flow reads and manages the same table through the same data layer.
- `supabase/config.toml` and `supabase/functions` were absent.
- `VITE_TURNSTILE_SITE_KEY` was absent from `.env.local`; no value was read or recorded.

## Turnstile and Edge Function local implementation

- Added an explicitly rendered Turnstile widget for the React single-page application.
- Changed only the public submission implementation to call `submit-contact`; administrator enquiry operations remain on the existing data layer and table.
- Added the `submit-contact` Edge Function with origin, method, content-type, request-size, payload, Turnstile hostname/action, and server-side token validation.
- The function inserts into the existing `public.contact_submissions` table using Supabase's automatically managed new `SUPABASE_SECRET_KEYS` environment variable.
- Added `supabase/config.toml` with `verify_jwt = false` because this is a public endpoint whose Turnstile credential is verified inside the function.
- Added a deferred migration that removes direct anonymous table inserts only after the function and frontend pass live testing.
- Added a constrained emergency contingency policy for reversible deployment.
- Added a detailed manual secret and consolidated deployment guide.

## Turnstile integration checks

- Frontend targeted ESLint: passed.
- Edge Function TypeScript/esbuild bundle check: passed; temporary output removed.
- Isolated Vite production build: passed; temporary output removed.
- Repository secret-value scan: no matches.
- Existing `dist` directory: unchanged.
- Supabase CLI detected: version 2.65.5. It was not linked, served, or used to deploy.
- `VITE_TURNSTILE_SITE_KEY`: still absent from `.env.local`; runtime widget testing is pending Zubair's manual site-key entry.
- Function deployment, production secrets, direct-insert closure SQL, final build, SiteGround upload, Git, and legacy-key changes: not performed.

## Credential-name readiness confirmation

- `VITE_TURNSTILE_SITE_KEY`: confirmed present in `.env.local`; value was not printed or recorded.
- `TURNSTILE_SECRET_KEY`: project owner confirmed it is stored in Supabase Edge Function Secrets; supplied screenshot showed only its digest.
- Supabase default `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEYS`, and `SUPABASE_SECRET_KEYS`: confirmed present by name in the supplied screenshot.
- Targeted ESLint after configuration: passed.
- Edge Function TypeScript bundle check after configuration: passed; temporary output removed.
- Isolated Vite build after configuration: passed; temporary output removed and existing `dist` remained unchanged.
- Repository secret-value scan excluding `.env.local` and generated dependencies: no matches.

## Deployment progress

- `submit-contact` Edge Function: deployed to the authorised MCS Supabase project.
- Deployed-function negative test: passed; an invalid Turnstile token returned HTTP 400 and no insertion path was reached.
- Pre-deployment local `dist` backup: `backups/pre-deploy-20260909-dist.zip`.
- Backup SHA-256: `A67ADD8B70E67E56AE0A78BF95479E32EEC05153C684A3F3DCD238468EC7243E`.
- Final `npm run build`: passed after running with the required file permission.
- Final `dist`: confirmed to contain `index.html`, `.htaccess`, the publishable key, and the Turnstile site key.
- Final `dist` secret scan: no Turnstile secret, Supabase secret key, or JWT found.
- SiteGround upload: completed manually by the project owner using SiteGround File Manager.
- Live public pages, administrator login, and administrator tabs: verified by the project owner after deployment.
- Live Turnstile contact submission: verified successfully before closing direct inserts.
- Direct-insert closure migration: run manually by the project owner; Supabase reported `Success. No rows returned`.
- Live Turnstile contact submission after direct-insert closure: verified successfully and visible in the existing administrator enquiries interface.
- Phase 2 protected enquiry flow: complete.
- Legacy-key changes: not performed; legacy keys remain enabled pending a separate dependency review.
