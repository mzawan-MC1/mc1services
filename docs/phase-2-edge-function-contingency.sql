-- Emergency rollback only: temporarily restore the pre-Edge public insertion path.
-- Use only if the deployed Edge Function fails and reverting the frontend is not immediately possible.

begin;

grant insert on table public.contact_submissions to anon, authenticated;

drop policy if exists public_contact_insert on public.contact_submissions;
create policy public_contact_insert
on public.contact_submissions
for insert
to anon, authenticated
with check (
  status = 'new'
  and char_length(btrim(name)) between 2 and 120
  and char_length(btrim(email)) between 3 and 254
  and char_length(btrim(message)) between 10 and 5000
);

commit;
