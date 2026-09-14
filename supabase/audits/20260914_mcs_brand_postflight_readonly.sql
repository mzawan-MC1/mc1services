-- Read-only verification after 20260914131650_correct_mcs_brand_name.sql.

select '01_header_and_footer' as section, jsonb_build_object(
  'records_with_mc1', count(*) filter (
    where concat_ws(' ', menu_items::text, cta_button_text, cta_button_text_ar,
      footer_text, footer_text_ar, copyright_text, copyright_text_ar) like '%MC1%'
  ),
  'records_total', count(*)
) as result
from public.header_footer_settings;

select '02_home_content' as section, jsonb_build_object(
  'records_with_mc1', count(*) filter (
    where concat_ws(' ', title, title_ar, subtitle, subtitle_ar, description,
      description_ar, button_text, button_text_ar, button_text_secondary,
      button_text_secondary_ar, content_data::text) like '%MC1%'
  ),
  'records_total', count(*)
) as result
from public.home_page_content;

select '03_portfolio_content' as section, jsonb_build_object(
  'records_with_mc1', count(*) filter (
    where concat_ws(' ', title, title_ar, description, description_ar,
      full_description, full_description_ar, headline, headline_ar,
      short_description, short_description_ar, long_description, long_description_ar,
      project_overview, project_overview_ar, challenges, challenges_ar,
      solutions, solutions_ar, results, results_ar) like '%MC1%'
  ),
  'records_total', count(*),
  'mc1_product_identifier_preserved', count(*) filter (where project_type = 'mc1_product')
) as result
from public.portfolio;

select '04_other_page_content' as section, jsonb_build_object(
  'about_with_mc1', (select count(*) from public.about_page_content
    where concat_ws(' ', title, title_ar, subtitle, subtitle_ar, content, content_ar,
      content_data::text) like '%MC1%'),
  'services_with_mc1', (select count(*) from public.service_page_content
    where concat_ws(' ', hero_title, hero_title_ar, hero_subtitle, hero_subtitle_ar,
      hero_description, hero_description_ar, cta_text, cta_text_ar,
      services_data::text, process_steps::text) like '%MC1%'),
  'seo_with_mc1', (select count(*) from public.page_seo
    where concat_ws(' ', meta_title, meta_title_ar, meta_description,
      meta_description_ar, meta_keywords, meta_keywords_ar, og_title, og_title_ar,
      og_description, og_description_ar) like '%MC1%'),
  'legal_with_mc1', (select count(*) from public.legal_pages
    where concat_ws(' ', title, title_ar, content, content_ar) like '%MC1%')
) as result;
