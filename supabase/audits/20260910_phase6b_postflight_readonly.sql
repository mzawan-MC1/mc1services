-- Phase 6B post-migration verification for mc1services.com
-- READ ONLY: run after both Phase 6B migration files have completed successfully.

select '01_preserved_content_counts' as section, jsonb_build_object(
  'portfolio_total', (select count(*) from public.portfolio),
  'portfolio_published', (select count(*) from public.portfolio where status = 'published'),
  'project_media_total', (select count(*) from public.project_images),
  'services_total', (select count(*) from public.services),
  'home_sections', (select count(*) from public.home_page_content),
  'header_footer_records', (select count(*) from public.header_footer_settings),
  'industries_total', (select count(*) from public.industries),
  'portfolio_industry_links', (select count(*) from public.portfolio_industries),
  'portfolio_service_links', (select count(*) from public.portfolio_services)
) as result

union all

select '02_phase6b_columns' as section, coalesce(jsonb_agg(to_jsonb(q) order by q.table_name, q.ordinal_position), '[]'::jsonb) as result
from (
  select table_name, column_name, data_type, is_nullable, ordinal_position
  from information_schema.columns
  where table_schema = 'public'
    and (
      (table_name = 'portfolio' and column_name in ('slug', 'project_type', 'confidentiality', 'featured_rank', 'headline', 'headline_ar'))
      or (table_name = 'project_images' and column_name in ('media_type', 'media_role', 'caption_ar', 'alt_text', 'alt_text_ar', 'poster_url', 'mime_type', 'width', 'height', 'duration_seconds', 'is_featured'))
      or (table_name = 'services' and column_name in ('slug', 'parent_id', 'service_group', 'page_url', 'menu_description', 'menu_description_ar', 'menu_image_url', 'is_featured'))
      or (table_name = 'home_page_content' and column_name in ('display_order', 'is_visible', 'style_variant'))
    )
) q

union all

select '03_phase6b_policies' as section, coalesce(jsonb_agg(to_jsonb(q) order by q.tablename, q.policyname), '[]'::jsonb) as result
from (
  select tablename, policyname, roles, cmd, qual, with_check
  from pg_catalog.pg_policies
  where schemaname = 'public'
    and tablename in ('portfolio', 'project_images', 'services', 'industries', 'portfolio_industries', 'portfolio_services')
) q

union all

select '04_phase6b_functions' as section, coalesce(jsonb_agg(to_jsonb(q) order by q.function_name), '[]'::jsonb) as result
from (
  select routine_name as function_name, security_type
  from information_schema.routines
  where routine_schema = 'public'
    and routine_name in ('is_admin', 'replace_project_media', 'replace_portfolio_taxonomy')
) q

union all

select '05_seeded_industries' as section, coalesce(jsonb_agg(to_jsonb(q) order by q.display_order), '[]'::jsonb) as result
from (
  select slug, name, display_order, is_active
  from public.industries
) q

order by section;
