-- Phase 1 production security hardening for mc1services.com
-- Prepared from the verified live schema/policy audit on 2026-09-09.
-- Review first. Run manually in the Supabase SQL Editor only after approval.

begin;

-- Abort before changing anything unless the confirmed Super Admin mapping exists.
do $preflight$
begin
  if not exists (
    select 1
    from auth.users u
    join public.admin_users au on au.id = u.id
    where lower(u.email) = lower('zubairawan91@gmail.com')
  ) then
    raise exception 'Phase 1 aborted: confirmed Super Admin mapping is missing';
  end if;
end
$preflight$;

-- admin_users is the sole source of truth for administrator membership.
alter table public.admin_users enable row level security;
revoke all on table public.admin_users from anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.admin_users au
    where au.id = (select auth.uid())
  );
$function$;

revoke all on function public.is_admin() from public, anon, authenticated;
grant execute on function public.is_admin() to authenticated;

-- New Auth users always start as ordinary users. Client metadata cannot grant roles.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  insert into public.user_profiles (id, email, full_name, role, created_at)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    'user',
    now()
  )
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$function$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

-- Block ordinary users from changing their own role field.
create or replace function public.protect_user_profile_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if (select auth.role()) = 'service_role' or public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.role := 'user';
  elsif new.role is distinct from old.role then
    raise exception 'Only an administrator may change a user role';

  end if;

  return new;
end;
$function$;

revoke all on function public.protect_user_profile_role() from public, anon, authenticated;
drop trigger if exists protect_user_profile_role on public.user_profiles;
create trigger protect_user_profile_role
before insert or update of role on public.user_profiles
for each row execute function public.protect_user_profile_role();

-- Remove the obsolete privilege-escalation recovery function.
drop function if exists public.promote_self_admin();

-- Keep administrative user listing and syncing, but allow execution only by signed-in users;
-- both functions perform an internal administrator check.
create or replace function public.admin_list_users()
returns table (
  id uuid,
  email text,
  full_name text,
  role text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $function$
  select
    u.id,
    u.email,
    up.full_name,
    up.role,
    coalesce(up.created_at, u.created_at)
  from auth.users u
  left join public.user_profiles up on up.id = u.id
  where public.is_admin();
$function$;

revoke all on function public.admin_list_users() from public, anon, authenticated;
grant execute on function public.admin_list_users() to authenticated;

create or replace function public.sync_profiles_from_auth()
returns integer
language plpgsql
security definer
set search_path = ''
as $function$
declare
  upserted integer;
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  with upserts as (
    insert into public.user_profiles (id, email, full_name, role, created_at)
    select
      u.id,
      u.email,
      u.raw_user_meta_data ->> 'full_name',
      'user',
      now()
    from auth.users u
    on conflict (id) do update set email = excluded.email
    returning 1
  )
  select count(*) into upserted from upserts;

  return upserted;
end;
$function$;

revoke all on function public.sync_profiles_from_auth() from public, anon, authenticated;
grant execute on function public.sync_profiles_from_auth() to authenticated;

-- Remove excessive non-CRUD privileges throughout the API-facing schema.
revoke truncate, references, trigger on all tables in schema public from anon, authenticated;

-- Public website content: public read, administrator-only write.
do $content_tables$
declare
  table_name text;
  policy_name text;
begin
  foreach table_name in array array[
    'about_page_content',
    'client_logos',
    'contact_page_content',
    'faqs',
    'header_footer_settings',
    'home_page_content',
    'legal_pages',
    'page_seo',
    'portfolio',
    'pricing_plans',
    'project_images',
    'service_page_content',
    'services',
    'site_settings',
    'team_members',
    'testimonials',
    'tools',
    'tools_page_content'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);

    for policy_name in
      select p.policyname
      from pg_catalog.pg_policies p
      where p.schemaname = 'public' and p.tablename = table_name
    loop
      execute format('drop policy if exists %I on public.%I', policy_name, table_name);
    end loop;

    execute format('revoke all on table public.%I from anon, authenticated', table_name);
    execute format('grant select on table public.%I to anon, authenticated', table_name);
    execute format('grant insert, update, delete on table public.%I to authenticated', table_name);

    execute format(
      'create policy public_read on public.%I for select to anon, authenticated using (true)',
      table_name
    );
    execute format(
      'create policy admin_insert on public.%I for insert to authenticated with check (public.is_admin())',
      table_name
    );
    execute format(
      'create policy admin_update on public.%I for update to authenticated using (public.is_admin()) with check (public.is_admin())',
      table_name
    );
    execute format(
      'create policy admin_delete on public.%I for delete to authenticated using (public.is_admin())',
      table_name
    );
  end loop;
end
$content_tables$;

-- Contact form: anyone may submit; only administrators may read or manage submissions.
alter table public.contact_submissions enable row level security;
do $drop_contact_policies$
declare policy_name text;
begin
  for policy_name in
    select p.policyname from pg_catalog.pg_policies p
    where p.schemaname = 'public' and p.tablename = 'contact_submissions'
  loop
    execute format('drop policy if exists %I on public.contact_submissions', policy_name);
  end loop;
end
$drop_contact_policies$;
revoke all on table public.contact_submissions from anon, authenticated;
grant insert on table public.contact_submissions to anon, authenticated;
grant select, update, delete on table public.contact_submissions to authenticated;
create policy public_contact_insert on public.contact_submissions
for insert to anon, authenticated with check (true);
create policy admin_contact_select on public.contact_submissions
for select to authenticated using (public.is_admin());
create policy admin_contact_update on public.contact_submissions
for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy admin_contact_delete on public.contact_submissions
for delete to authenticated using (public.is_admin());

-- First-party analytics: public page-view insert, administrator-only reporting.
alter table public.analytics_events enable row level security;
do $drop_analytics_policies$
declare policy_name text;
begin
  for policy_name in
    select p.policyname from pg_catalog.pg_policies p
    where p.schemaname = 'public' and p.tablename = 'analytics_events'
  loop
    execute format('drop policy if exists %I on public.analytics_events', policy_name);
  end loop;
end
$drop_analytics_policies$;
revoke all on table public.analytics_events from anon, authenticated;
grant insert on table public.analytics_events to anon, authenticated;
grant select, delete on table public.analytics_events to authenticated;
create policy public_analytics_insert on public.analytics_events
for insert to anon, authenticated with check (true);
create policy admin_analytics_select on public.analytics_events
for select to authenticated using (public.is_admin());
create policy admin_analytics_delete on public.analytics_events
for delete to authenticated using (public.is_admin());

-- Roles are administrative metadata, not public website content.
alter table public.roles enable row level security;
do $drop_role_policies$
declare policy_name text;
begin
  for policy_name in
    select p.policyname from pg_catalog.pg_policies p
    where p.schemaname = 'public' and p.tablename = 'roles'
  loop
    execute format('drop policy if exists %I on public.roles', policy_name);
  end loop;
end
$drop_role_policies$;
revoke all on table public.roles from anon, authenticated;
grant select, insert, update, delete on table public.roles to authenticated;
create policy admin_roles_all on public.roles
for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- User profiles: own profile access or administrator management.
alter table public.user_profiles enable row level security;
do $drop_profile_policies$
declare policy_name text;
begin
  for policy_name in
    select p.policyname from pg_catalog.pg_policies p
    where p.schemaname = 'public' and p.tablename = 'user_profiles'
  loop
    execute format('drop policy if exists %I on public.user_profiles', policy_name);
  end loop;
end
$drop_profile_policies$;
revoke all on table public.user_profiles from anon, authenticated;
grant select, insert, update, delete on table public.user_profiles to authenticated;
create policy profile_select on public.user_profiles
for select to authenticated using (id = (select auth.uid()) or public.is_admin());
create policy profile_insert on public.user_profiles
for insert to authenticated with check (id = (select auth.uid()) or public.is_admin());
create policy profile_update on public.user_profiles
for update to authenticated
using (id = (select auth.uid()) or public.is_admin())
with check (id = (select auth.uid()) or public.is_admin());
create policy profile_delete on public.user_profiles
for delete to authenticated using (public.is_admin());

-- Internal task system: authenticated read; existing admin/assignee write model retained.
do $task_tables$
declare
  table_name text;
  policy_name text;
begin
  foreach table_name in array array['tasks', 'task_assignees', 'task_subtasks', 'task_timeline']
  loop
    execute format('alter table public.%I enable row level security', table_name);
    for policy_name in
      select p.policyname from pg_catalog.pg_policies p
      where p.schemaname = 'public' and p.tablename = table_name
    loop
      execute format('drop policy if exists %I on public.%I', policy_name, table_name);
    end loop;
    execute format('revoke all on table public.%I from anon, authenticated', table_name);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', table_name);
  end loop;
end
$task_tables$;

create policy tasks_select on public.tasks
for select to authenticated using (true);
create policy tasks_admin_write on public.tasks
for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy task_assignees_select on public.task_assignees
for select to authenticated using (true);
create policy task_assignees_admin_write on public.task_assignees
for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy task_subtasks_select on public.task_subtasks
for select to authenticated using (true);
create policy task_subtasks_admin_or_assignee_write on public.task_subtasks
for all to authenticated
using (public.is_admin() or assignee = (select auth.uid()))
with check (public.is_admin() or assignee = (select auth.uid()));

create policy task_timeline_select on public.task_timeline
for select to authenticated using (true);
create policy task_timeline_admin_or_assignee_insert on public.task_timeline
for insert to authenticated with check (
  public.is_admin()
  or exists (
    select 1 from public.task_assignees ta
    where ta.task_id = task_timeline.task_id
      and ta.user_id = (select auth.uid())
  )
);

-- Ensure the aggregate view obeys the caller's underlying task-table RLS.
create or replace view public.v_task_stats
with (security_invoker = true)
as
select
  t.id as task_id,
  count(st.id) filter (where st.id is not null) as total_subtasks,
  count(st.id) filter (where st.status = 'completed') as completed_subtasks,
  greatest(coalesce(max(tt.created_at), t.updated_at), t.created_at) as last_activity
from public.tasks t
left join public.task_subtasks st on st.task_id = t.id
left join public.task_timeline tt on tt.task_id = t.id
group by t.id;
revoke all on table public.v_task_stats from anon, authenticated;
grant select on table public.v_task_stats to authenticated;

-- Storage: keep intended public reads; restrict writes by purpose.
do $drop_storage_policies$
declare policy_name text;
begin
  for policy_name in
    select p.policyname from pg_catalog.pg_policies p
    where p.schemaname = 'storage' and p.tablename = 'objects'
  loop
    execute format('drop policy if exists %I on storage.objects', policy_name);
  end loop;
end
$drop_storage_policies$;

create policy avatars_public_read on storage.objects
for select to anon, authenticated using (bucket_id = 'avatars');
create policy avatars_insert_own on storage.objects
for insert to authenticated with check (
  bucket_id = 'avatars'
  and (name like ((select auth.uid())::text || '/%') or name = (select auth.uid())::text)
);
create policy avatars_update_own on storage.objects
for update to authenticated
using (
  bucket_id = 'avatars'
  and (name like ((select auth.uid())::text || '/%') or name = (select auth.uid())::text)
)
with check (
  bucket_id = 'avatars'
  and (name like ((select auth.uid())::text || '/%') or name = (select auth.uid())::text)
);
create policy avatars_delete_own on storage.objects
for delete to authenticated using (
  bucket_id = 'avatars'
  and (name like ((select auth.uid())::text || '/%') or name = (select auth.uid())::text)
);

create policy public_bucket_read on storage.objects
for select to anon, authenticated using (bucket_id = 'public');
create policy public_bucket_insert_authorized on storage.objects
for insert to authenticated with check (
  bucket_id = 'public'
  and (
    public.is_admin()
    or exists (
      select 1 from public.task_assignees ta
      where ta.user_id = (select auth.uid())
    )
  )
);
create policy public_bucket_update_owner_or_admin on storage.objects
for update to authenticated
using (
  bucket_id = 'public'
  and (owner_id = (select auth.uid())::text or public.is_admin())
)
with check (
  bucket_id = 'public'
  and (owner_id = (select auth.uid())::text or public.is_admin())
);
create policy public_bucket_delete_owner_or_admin on storage.objects
for delete to authenticated using (
  bucket_id = 'public'
  and (owner_id = (select auth.uid())::text or public.is_admin())
);

create policy team_photos_public_read on storage.objects
for select to anon, authenticated using (bucket_id = 'team-photos');
create policy team_photos_admin_insert on storage.objects
for insert to authenticated with check (bucket_id = 'team-photos' and public.is_admin());
create policy team_photos_admin_update on storage.objects
for update to authenticated
using (bucket_id = 'team-photos' and public.is_admin())
with check (bucket_id = 'team-photos' and public.is_admin());
create policy team_photos_admin_delete on storage.objects
for delete to authenticated using (bucket_id = 'team-photos' and public.is_admin());

notify pgrst, 'reload schema';

commit;
