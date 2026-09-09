-- Run only after the Edge Function and new frontend are deployed and a live test succeeds.
-- This closes the direct browser-to-table path so Turnstile cannot be bypassed.

begin;

drop policy if exists public_contact_insert on public.contact_submissions;
revoke insert on table public.contact_submissions from anon, authenticated;

commit;

