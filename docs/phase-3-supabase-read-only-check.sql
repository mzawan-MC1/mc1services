-- Phase 3: read-only legacy-key dependency audit.
-- Safe to run in the Supabase SQL Editor. This does not modify any database object or data.
-- Results intentionally show names and boolean flags only, never function bodies, commands,
-- request headers, URLs, secrets, or key values.

select
  '01_relevant_extensions' as section,
  coalesce(
    jsonb_agg(jsonb_build_object('extension', extname) order by extname),
    '[]'::jsonb
  ) as result
from pg_extension
where extname in ('pg_cron', 'pg_net', 'vault');

select
  '02_automation_relations' as section,
  coalesce(
    jsonb_agg(
      jsonb_build_object(
        'schema', table_schema,
        'relation', table_name,
        'type', table_type
      ) order by table_schema, table_name
    ),
    '[]'::jsonb
  ) as result
from information_schema.tables
where table_schema in ('cron', 'net', 'supabase_functions', 'vault');

with trigger_inventory as (
  select
    n.nspname as schema_name,
    c.relname as table_name,
    t.tgname as trigger_name,
    pg_get_triggerdef(t.oid) as trigger_definition
  from pg_trigger t
  join pg_class c on c.oid = t.tgrelid
  join pg_namespace n on n.oid = c.relnamespace
  where not t.tgisinternal
    and n.nspname not in ('pg_catalog', 'information_schema')
)
select
  '03_possible_webhook_triggers' as section,
  coalesce(
    jsonb_agg(
      jsonb_build_object(
        'schema', schema_name,
        'table', table_name,
        'trigger', trigger_name,
        'mentions_http_or_webhook',
          trigger_definition ~* '(http|webhook|pg_net|supabase_functions)',
        'mentions_legacy_role_name',
          trigger_definition ~* '(service_role|anon)'
      ) order by schema_name, table_name, trigger_name
    ) filter (
      where trigger_definition ~* '(http|webhook|pg_net|supabase_functions|service_role)'
    ),
    '[]'::jsonb
  ) as result
from trigger_inventory;

with function_inventory as (
  select
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where p.prokind in ('f', 'p')
    and n.nspname not in ('pg_catalog', 'information_schema')
)
select
  '04_possible_key_or_network_functions' as section,
  coalesce(
    jsonb_agg(
      jsonb_build_object(
        'schema', schema_name,
        'function', function_name,
        'mentions_network_call',
          function_definition ~* '(http_request|http_post|pg_net|webhook)',
        'mentions_legacy_role_name',
          function_definition ~* '(service_role|supabase_anon_key|supabase_service_role_key)',
        'mentions_project_reference',
          function_definition ilike '%qcnxmagbeymybjtfbtzn%'
      ) order by schema_name, function_name
    ) filter (
      where function_definition ~* '(http_request|http_post|pg_net|webhook|service_role|supabase_anon_key|supabase_service_role_key)'
         or function_definition ilike '%qcnxmagbeymybjtfbtzn%'
    ),
    '[]'::jsonb
  ) as result
from function_inventory;

-- If section 02 reports cron.job, run this additional query separately.
-- It reports only whether a command mentions relevant terms; it never returns the command.
-- select
--   '05_cron_job_dependency_flags' as section,
--   coalesce(
--     jsonb_agg(
--       jsonb_build_object(
--         'jobid', jobid,
--         'active', active,
--         'schedule', schedule,
--         'mentions_supabase_or_network', command ~* '(supabase|http|net\.)',
--         'mentions_legacy_role_name', command ~* '(service_role|anon)'
--       ) order by jobid
--     ),
--     '[]'::jsonb
--   ) as result
-- from cron.job;
