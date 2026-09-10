-- Phase 6B live-schema preflight for mc1services.com
-- READ ONLY: this file contains SELECT statements only.

select '01_relevant_columns' as section, coalesce(jsonb_agg(to_jsonb(q) order by q.table_name, q.ordinal_position), '[]'::jsonb) as result
from (
  select table_name, column_name, data_type, is_nullable, column_default, ordinal_position
  from information_schema.columns
  where table_schema = 'public'
    and table_name in (
      'portfolio', 'project_images', 'services', 'industries',
      'portfolio_industries', 'portfolio_services',
      'home_page_content', 'header_footer_settings'
    )
) q;

select '02_relevant_constraints' as section, coalesce(jsonb_agg(to_jsonb(q) order by q.table_name, q.constraint_name), '[]'::jsonb) as result
from (
  select tc.table_name, tc.constraint_name, tc.constraint_type, pg_get_constraintdef(pc.oid) as definition
  from information_schema.table_constraints tc
  join pg_catalog.pg_constraint pc on pc.conname = tc.constraint_name
  where tc.table_schema = 'public'
    and tc.table_name in (
      'portfolio', 'project_images', 'services', 'industries',
      'portfolio_industries', 'portfolio_services',
      'home_page_content', 'header_footer_settings'
    )
) q;

select '03_relevant_rls_policies' as section, coalesce(jsonb_agg(to_jsonb(q) order by q.tablename, q.policyname), '[]'::jsonb) as result
from (
  select tablename, policyname, roles, cmd, qual, with_check
  from pg_catalog.pg_policies
  where schemaname = 'public'
    and tablename in (
      'portfolio', 'project_images', 'services', 'industries',
      'portfolio_industries', 'portfolio_services',
      'home_page_content', 'header_footer_settings'
    )
) q;

select '04_current_content_counts' as section, jsonb_build_object(
  'portfolio_total', (select count(*) from public.portfolio),
  'portfolio_published', (select count(*) from public.portfolio where status = 'published'),
  'portfolio_draft', (select count(*) from public.portfolio where coalesce(status, 'draft') <> 'published'),
  'project_images', (select count(*) from public.project_images),
  'services_total', (select count(*) from public.services),
  'services_active', (select count(*) from public.services where is_active = true),
  'home_sections', (select count(*) from public.home_page_content),
  'header_footer_records', (select count(*) from public.header_footer_settings)
) as result;

select '05_current_menu_shape' as section, coalesce(jsonb_agg(jsonb_build_object(
  'setting_key', setting_key,
  'menu_item_count', case when jsonb_typeof(menu_items) = 'array' then jsonb_array_length(menu_items) else 0 end,
  'menu_items_are_array', jsonb_typeof(menu_items) = 'array'
) order by setting_key), '[]'::jsonb) as result
from public.header_footer_settings;

select '06_phase6b_functions' as section, coalesce(jsonb_agg(to_jsonb(q) order by q.function_name), '[]'::jsonb) as result
from (
  select routine_name as function_name, security_type
  from information_schema.routines
  where routine_schema = 'public'
    and routine_name in ('is_admin', 'replace_project_media', 'replace_portfolio_taxonomy')
) q;
