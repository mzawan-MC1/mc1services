-- PHASE 1: SUPPLEMENTAL READ-ONLY PREFLIGHT
-- This returns one result table and changes nothing.
-- It confirms the remaining live details required before security hardening.

select '01_confirm_super_admin_mapping' as section, jsonb_build_object(
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

select '02_public_view_security', coalesce(jsonb_agg(to_jsonb(q)), '[]'::jsonb)
from (
  select
    n.nspname as view_schema,
    c.relname as view_name,
    c.reloptions,
    pg_get_viewdef(c.oid, true) as definition
  from pg_catalog.pg_class c
  join pg_catalog.pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relkind = 'v'
  order by c.relname
) q

union all

select '03_relevant_triggers', coalesce(jsonb_agg(to_jsonb(q)), '[]'::jsonb)
from (
  select
    event_object_schema,
    event_object_table,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
  from information_schema.triggers
  where event_object_schema in ('auth', 'public')
  order by event_object_schema, event_object_table, trigger_name, event_manipulation
) q

union all

select '04_sensitive_database_dependencies', jsonb_build_object(
  'functions_mentioning_service_role', coalesce((
    select jsonb_agg(p.proname order by p.proname)
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
    where n.nspname not in ('pg_catalog', 'information_schema')
      and p.prokind in ('f', 'p')
      and lower(pg_get_functiondef(p.oid)) like '%service_role%'
  ), '[]'::jsonb),
  'functions_mentioning_project_reference', coalesce((
    select jsonb_agg(p.proname order by p.proname)
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
    where n.nspname not in ('pg_catalog', 'information_schema')
      and p.prokind in ('f', 'p')
      and lower(pg_get_functiondef(p.oid)) like '%qcnxmagbeymybjtfbtzn%'
  ), '[]'::jsonb)
)

order by section;
