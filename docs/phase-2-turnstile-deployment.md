# Phase 2 Turnstile and Edge Function deployment

This document is a deployment plan. Nothing in it has been deployed automatically.

## Architecture

The existing enquiry system remains the single source of truth:

`Contact.jsx` → `dataLayer.contactSubmissions.submitPublic` → `submit-contact` Edge Function → `public.contact_submissions`

The admin continues to read, update, and delete enquiries from `public.contact_submissions`. No new enquiry table or external CRM is introduced.

## Zubair: create the Turnstile widget manually

1. Sign in to the Cloudflare dashboard.
2. Open **Turnstile** and choose **Add widget**.
3. Name it `MCS Contact Form`.
4. Add the hostnames `mc1services.com` and `www.mc1services.com`.
5. Select Cloudflare's managed widget mode.
6. Create the widget.
7. Copy the **site key** into the project-root `.env.local` file:

   ```text
   VITE_TURNSTILE_SITE_KEY=the_site_key_from_cloudflare
   ```

The site key is designed for browser use. Do not put it into a database table or CMS setting.

## Zubair: store the secret without sharing it

1. Open the MCS Consultancy project in Supabase.
2. Open **Edge Functions**, then **Secrets**.
3. Add a secret named exactly:

   ```text
   TURNSTILE_SECRET_KEY
   ```

4. Paste the Cloudflare Turnstile secret as its value and save it.

Never paste this secret into chat, `.env.local`, source code, Git, SiteGround files, or a `VITE_` variable. Every `VITE_` variable is compiled into browser code.

Before deployment, confirm that Supabase also lists its automatically managed `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEYS`, and `SUPABASE_SECRET_KEYS` Edge Function variables. Do not copy their values anywhere.

## Consolidated deployment order

This order avoids interrupting the existing live contact form.

1. Record a fresh database verification result and create a SiteGround backup of the current website files.
2. Confirm `VITE_TURNSTILE_SITE_KEY` exists locally by variable name only.
3. Confirm `TURNSTILE_SECRET_KEY` exists in Supabase Edge Function Secrets by name only.
4. Deploy `supabase/functions/submit-contact` with `verify_jwt = false` from `supabase/config.toml`.
5. Test the function with a valid Turnstile challenge while the existing direct-insert policy still provides rollback compatibility.
6. Run targeted lint and the final production build.
7. Upload the contents of `dist`, including `.htaccess`, to the SiteGround web root using a backed-up, reversible procedure.
8. Test Home, Contact, Admin Login, Dashboard, Inquiries, Site Settings, Users, and Tasks.
9. Submit one clearly identified test enquiry and confirm it appears once in Admin Inquiries.
10. Run `supabase/migrations/20260909_phase2_require_edge_contact_submission.sql` manually. This removes anonymous direct table insertion so Turnstile cannot be bypassed.
11. Submit a second test enquiry and verify that the Edge Function path still works.
12. Monitor Edge Function errors and enquiries before changing legacy API keys.

Steps 4, 7, 9, 10, and all key changes require explicit approval at action time.

## Rollback

- Restore the backed-up SiteGround files if the frontend deployment fails.
- If the frontend cannot immediately be restored after direct inserts have been closed, run `docs/phase-2-edge-function-contingency.sql` to temporarily restore the constrained direct-insert policy.
- Do not delete existing enquiries or stored media during rollback.

## Legacy Supabase keys

The deployed frontend uses the new publishable key, and the deployed Edge Function uses the automatically managed new secret key. The repository, database dependencies, SiteGround scheduled jobs, OAuth applications, and known external automations were checked during Phase 3. The legacy JWT-based keys were then disabled, and the public website, fresh administrator authentication, and administrator functionality passed live verification.

They can be disabled safely only after:

1. The new frontend is built with `VITE_SUPABASE_PUBLISHABLE_KEY` and deployed successfully.
2. The Edge Function is confirmed to use Supabase's automatically managed `SUPABASE_SECRET_KEYS` value.
3. Public pages, authentication, admin features, uploads, and the protected enquiry flow pass live smoke tests.
4. Repository scripts, SiteGround jobs, Supabase functions, and known external automations have been checked for legacy-key use.
5. The legacy anonymous key is disabled first and the site is monitored.
6. The legacy service-role key is disabled separately and the site is monitored again.

Supabase legacy-key deactivation is reversible, but it should still be performed as a controlled change.

## Official references

- Cloudflare client rendering: https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/
- Cloudflare server validation: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
- Supabase Edge Function secrets: https://supabase.com/docs/guides/functions/secrets
- Supabase Edge Function configuration: https://supabase.com/docs/guides/functions/function-configuration
- Supabase API key migration: https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys
