-- Phase 2: server-side limits for public enquiries and Storage uploads.
-- Review first. Zubair must run this manually in the Supabase SQL Editor.
-- Existing rows and stored objects are not deleted or modified.

begin;

do $$
declare
  required_column text;
begin
  foreach required_column in array array[
    'name', 'email', 'phone', 'company', 'service_interest',
    'message', 'subject', 'status'
  ] loop
    if not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'contact_submissions'
        and column_name = required_column
    ) then
      raise exception 'Preflight failed: public.contact_submissions.% is missing', required_column;
    end if;
  end loop;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'contact_submission_lengths'
      and conrelid = 'public.contact_submissions'::regclass
  ) then
    alter table public.contact_submissions
      add constraint contact_submission_lengths check (
        char_length(btrim(name)) between 2 and 120
        and char_length(btrim(email)) between 3 and 254
        and email ~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$'
        and (phone is null or char_length(phone) <= 40)
        and (company is null or char_length(company) <= 160)
        and (service_interest is null or char_length(service_interest) <= 80)
        and char_length(btrim(message)) between 10 and 5000
        and (subject is null or char_length(subject) <= 200)
      ) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'contact_submission_status_values'
      and conrelid = 'public.contact_submissions'::regclass
  ) then
    alter table public.contact_submissions
      add constraint contact_submission_status_values
      check (status in ('new', 'contacted', 'in_progress', 'closed')) not valid;
  end if;
end
$$;

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

update storage.buckets
set file_size_limit = 2097152,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']::text[]
where id = 'avatars';

update storage.buckets
set file_size_limit = 26214400,
    allowed_mime_types = array[
      'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif',
      'image/x-icon', 'image/vnd.microsoft.icon',
      'video/mp4', 'video/webm', 'video/ogg'
    ]::text[]
where id = 'public';

update storage.buckets
set file_size_limit = 10485760,
    allowed_mime_types = array[
      'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'
    ]::text[]
where id = 'team-photos';

do $$
declare
  missing_bucket text;
begin
  select string_agg(expected.id, ', ')
  into missing_bucket
  from (values ('avatars'), ('public'), ('team-photos')) as expected(id)
  left join storage.buckets bucket on bucket.id = expected.id
  where bucket.id is null;

  if missing_bucket is not null then
    raise exception 'Preflight failed: missing Storage bucket(s): %', missing_bucket;
  end if;
end
$$;

commit;
