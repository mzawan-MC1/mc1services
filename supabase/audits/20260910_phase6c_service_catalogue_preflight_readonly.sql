-- Phase 6C read-only preflight and current-state record.
-- Run before the Phase 6C migration and retain the output as the content snapshot.

select '01_current_services_snapshot' as section,
       coalesce(jsonb_agg(to_jsonb(result) order by result."order", result.title), '[]'::jsonb) as result
from (
  select id, title, title_ar, description, description_ar, full_description, full_description_ar,
         category, category_ar, icon, features, features_ar, image_url, "order", is_active,
         slug, parent_id, service_group, page_url, menu_description, menu_description_ar,
         menu_image_url, is_featured
  from public.services
) result;

select '02_current_service_counts' as section, jsonb_build_object(
  'total_services', count(*),
  'active_services', count(*) filter (where is_active),
  'featured_services', count(*) filter (where is_featured),
  'services_with_uploaded_images', count(*) filter (where image_url is not null and btrim(image_url) <> '')
) as result
from public.services;

select '03_target_slug_conflicts' as section, coalesce(jsonb_agg(to_jsonb(result)), '[]'::jsonb) as result
from (
  select id, title, slug
  from public.services
  where lower(slug) in (
    'ai-solutions-intelligent-automation',
    'custom-software-business-platforms',
    'application-development',
    'saas-product-engineering',
    'digital-marketing-growth',
    'cloud-it-managed-support',
    'creative-content-production'
  )
) result;

select '04_navigation_snapshot' as section, coalesce(jsonb_agg(to_jsonb(result)), '[]'::jsonb) as result
from (
  select id, setting_key, menu_items
  from public.header_footer_settings
  where setting_key = 'header'
) result;

select '05_services_policies' as section, coalesce(jsonb_agg(to_jsonb(result) order by result.policyname), '[]'::jsonb) as result
from (
  select policyname, roles, cmd, qual, with_check
  from pg_policies
  where schemaname = 'public' and tablename = 'services'
) result;
