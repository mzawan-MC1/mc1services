-- Run after the Phase 1 hardening transaction.
-- Read-only verification: expected failures are returned as booleans, not exceptions.

select '01_super_admin_mapping' as section, jsonb_build_object(
  'auth_user_exists', exists (
    select 1 from auth.users where lower(email) = lower('zubairawan91@gmail.com')
  ),
  'admin_membership_exists', exists (
    select 1
    from auth.users u
    join public.admin_users au on au.id = u.id
    where lower(u.email) = lower('zubairawan91@gmail.com')
  )
) as result

union all

select '02_tables_without_rls', coalesce(jsonb_agg(to_jsonb(q)), '[]'::jsonb)
from (
  select tablename
  from pg_catalog.pg_tables
  where schemaname = 'public' and not rowsecurity
  order by tablename
) q

union all

select '03_unsafe_policies', coalesce(jsonb_agg(to_jsonb(q)), '[]'::jsonb)
from (
  select schemaname, tablename, policyname, roles, cmd, qual, with_check
  from pg_catalog.pg_policies
  where schemaname in ('public', 'storage')
    and (
      (cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL') and roles @> array['anon']::name[])
      or policyname = 'Admin write access'
      or policyname = 'team_members_insert'
      or policyname = 'team_members_update'
      or policyname = 'team_members_delete'
      or coalesce(with_check, '') like '%OR true%'
    )
  order by schemaname, tablename, policyname
) q

union all

select '04_function_permissions', coalesce(jsonb_agg(to_jsonb(q)), '[]'::jsonb)
from (
  select
    p.proname as function_name,
    p.prosecdef as security_definer,
    has_function_privilege('anon', p.oid, 'EXECUTE') as anon_can_execute,
    has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_can_execute
  from pg_catalog.pg_proc p
  join pg_catalog.pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname in (
      'is_admin',
      'promote_self_admin',
      'admin_list_users',
      'sync_profiles_from_auth',
      'handle_new_user',
      'protect_user_profile_role'
    )
  order by p.proname
) q

union all

select '05_task_view_security', coalesce(jsonb_agg(to_jsonb(q)), '[]'::jsonb)
from (
  select c.relname as view_name, c.reloptions
  from pg_catalog.pg_class c
  join pg_catalog.pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relname = 'v_task_stats'
) q

union all

select '06_storage_policies', coalesce(jsonb_agg(to_jsonb(q)), '[]'::jsonb)
from (
  select policyname, roles, cmd, qual, with_check
  from pg_catalog.pg_policies
  where schemaname = 'storage' and tablename = 'objects'
  order by policyname
) q

order by section;
