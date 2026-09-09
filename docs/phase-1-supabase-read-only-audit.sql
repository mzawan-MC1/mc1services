-- PHASE 1: READ-ONLY SUPABASE INVENTORY
-- Returns seven JSON rows in one result table so the complete result can be exported.
-- This script only reads metadata and bucket configuration. It changes nothing.

select '01_public_tables_and_rls' as section, coalesce(jsonb_agg(to_jsonb(q)), '[]'::jsonb) as result
from (
  select schemaname, tablename, rowsecurity
  from pg_catalog.pg_tables
  where schemaname = 'public'
  order by tablename
) q

union all

select '02_public_and_storage_policies', coalesce(jsonb_agg(to_jsonb(q)), '[]'::jsonb)
from (
  select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
  from pg_catalog.pg_policies
  where schemaname in ('public', 'storage')
  order by schemaname, tablename, policyname
) q

union all

select '03_browser_role_table_privileges', coalesce(jsonb_agg(to_jsonb(q)), '[]'::jsonb)
from (
  select table_schema, table_name, grantee, privilege_type
  from information_schema.role_table_grants
  where table_schema in ('public', 'storage')
    and grantee in ('anon', 'authenticated')
  order by table_schema, table_name, grantee, privilege_type
) q

union all

select '04_public_table_columns', coalesce(jsonb_agg(to_jsonb(q)), '[]'::jsonb)
from (
  select table_name, ordinal_position, column_name, data_type, is_nullable, column_default
  from information_schema.columns
  where table_schema = 'public'
  order by table_name, ordinal_position
) q

union all

select '05_public_function_permissions', coalesce(jsonb_agg(to_jsonb(q)), '[]'::jsonb)
from (
  select
    n.nspname as function_schema,
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    p.prosecdef as security_definer,
    has_function_privilege('anon', p.oid, 'EXECUTE') as anon_can_execute,
    has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_can_execute
  from pg_catalog.pg_proc p
  join pg_catalog.pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
  order by p.proname, arguments
) q

union all

select '06_authorization_function_definitions', coalesce(jsonb_agg(to_jsonb(q)), '[]'::jsonb)
from (
  select p.proname as function_name, pg_get_functiondef(p.oid) as definition
  from pg_catalog.pg_proc p
  join pg_catalog.pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname in (
      'is_admin',
      'promote_self_admin',
      'admin_list_users',
      'sync_profiles_from_auth',
      'handle_new_user'
    )
  order by p.proname
) q

union all

select '07_storage_buckets', coalesce(jsonb_agg(to_jsonb(q)), '[]'::jsonb)
from (
  select id, name, public, file_size_limit, allowed_mime_types
  from storage.buckets
  order by id
) q

order by section;
