-- Phase 6C read-only verification. Safe to run after the service catalogue migration.

select '01_service_catalogue' as section, coalesce(jsonb_agg(to_jsonb(result) order by result."order"), '[]'::jsonb) as result
from (
  select title, title_ar, slug, service_group, category, page_url, "order", is_active, is_featured,
         cardinality(coalesce(features, array[]::text[])) as english_feature_count,
         cardinality(coalesce(features_ar, array[]::text[])) as arabic_feature_count
  from public.services
  order by "order", title
) result;

select '02_catalogue_checks' as section, jsonb_build_object(
  'total_services', count(*),
  'active_services', count(*) filter (where is_active),
  'featured_services', count(*) filter (where is_featured),
  'unique_slugs', count(distinct lower(slug)),
  'missing_page_links', count(*) filter (where page_url is null or btrim(page_url) = ''),
  'missing_arabic_titles', count(*) filter (where title_ar is null or btrim(title_ar) = ''),
  'missing_menu_descriptions', count(*) filter (where menu_description is null or btrim(menu_description) = '')
) as result
from public.services;

select '03_service_groups' as section, coalesce(jsonb_agg(to_jsonb(result) order by result.service_group), '[]'::jsonb) as result
from (
  select coalesce(service_group, 'Unassigned') as service_group, count(*) as service_count
  from public.services
  group by coalesce(service_group, 'Unassigned')
) result;

select '04_menu_source_status' as section, coalesce(jsonb_agg(to_jsonb(result)), '[]'::jsonb) as result
from (
  select
    count(*) filter (where child->>'source_type' = 'service') as managed_service_links,
    count(*) filter (where child->>'source_type' = 'industry') as managed_industry_links,
    count(*) filter (where coalesce(child->>'source_type', 'custom') = 'custom') as custom_links
  from public.header_footer_settings h
  cross join lateral jsonb_array_elements(coalesce(h.menu_items, '[]'::jsonb)) item
  cross join lateral jsonb_array_elements(coalesce(item->'children', '[]'::jsonb)) child
  where h.setting_key = 'header'
) result;

select '05_parent_index' as section, coalesce(jsonb_agg(to_jsonb(result)), '[]'::jsonb) as result
from (
  select indexname, indexdef
  from pg_indexes
  where schemaname = 'public' and tablename = 'services' and indexname = 'services_parent_id_idx'
) result;
