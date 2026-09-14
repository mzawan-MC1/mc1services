-- Correct the public-facing company name. MC1 remains untouched in domains,
-- email addresses and compatibility identifiers such as project_type=mc1_product.
begin;

create or replace function pg_temp.correct_mcs_brand(document jsonb)
returns jsonb
language plpgsql
immutable
as $$
declare
  corrected jsonb;
begin
  if document is null then
    return null;
  end if;

  case jsonb_typeof(document)
    when 'array' then
      select coalesce(jsonb_agg(pg_temp.correct_mcs_brand(value) order by ordinal), '[]'::jsonb)
      into corrected
      from jsonb_array_elements(document) with ordinality as entries(value, ordinal);
      return corrected;
    when 'object' then
      select coalesce(
        jsonb_object_agg(
          key,
          case
            when key = any (array[
              'title', 'title_ar', 'subtitle', 'subtitle_ar',
              'description', 'description_ar', 'label', 'label_ar',
              'group', 'group_ar', 'name', 'name_ar',
              'headline', 'headline_ar', 'content', 'content_ar',
              'text', 'text_ar', 'button_text', 'button_text_ar',
              'button_text_secondary', 'button_text_secondary_ar',
              'cta_text', 'cta_text_ar', 'menu_title', 'menu_title_ar',
              'menu_description', 'menu_description_ar',
              'featured_title', 'featured_title_ar',
              'featured_cta', 'featured_cta_ar'
            ])
              and jsonb_typeof(value) = 'string'
              then to_jsonb(replace(value #>> '{}', 'MC1', 'MCS'))
            else pg_temp.correct_mcs_brand(value)
          end
        ),
        '{}'::jsonb
      )
      into corrected
      from jsonb_each(document);
      return corrected;
    else
      return document;
  end case;
end;
$$;

update public.header_footer_settings
set
  menu_items = pg_temp.correct_mcs_brand(menu_items),
  cta_button_text = replace(cta_button_text, 'MC1', 'MCS'),
  cta_button_text_ar = replace(cta_button_text_ar, 'MC1', 'MCS'),
  footer_text = replace(footer_text, 'MC1', 'MCS'),
  footer_text_ar = replace(footer_text_ar, 'MC1', 'MCS'),
  copyright_text = replace(copyright_text, 'MC1', 'MCS'),
  copyright_text_ar = replace(copyright_text_ar, 'MC1', 'MCS')
where
  coalesce(menu_items::text, '') like '%MC1%'
  or coalesce(cta_button_text, '') like '%MC1%'
  or coalesce(cta_button_text_ar, '') like '%MC1%'
  or coalesce(footer_text, '') like '%MC1%'
  or coalesce(footer_text_ar, '') like '%MC1%'
  or coalesce(copyright_text, '') like '%MC1%'
  or coalesce(copyright_text_ar, '') like '%MC1%';

update public.home_page_content
set
  title = replace(title, 'MC1', 'MCS'),
  title_ar = replace(title_ar, 'MC1', 'MCS'),
  subtitle = replace(subtitle, 'MC1', 'MCS'),
  subtitle_ar = replace(subtitle_ar, 'MC1', 'MCS'),
  description = replace(description, 'MC1', 'MCS'),
  description_ar = replace(description_ar, 'MC1', 'MCS'),
  button_text = replace(button_text, 'MC1', 'MCS'),
  button_text_ar = replace(button_text_ar, 'MC1', 'MCS'),
  button_text_secondary = replace(button_text_secondary, 'MC1', 'MCS'),
  button_text_secondary_ar = replace(button_text_secondary_ar, 'MC1', 'MCS'),
  content_data = pg_temp.correct_mcs_brand(content_data)
where concat_ws(' ', title, title_ar, subtitle, subtitle_ar, description, description_ar,
  button_text, button_text_ar, button_text_secondary, button_text_secondary_ar,
  content_data::text) like '%MC1%';

update public.about_page_content
set
  title = replace(title, 'MC1', 'MCS'),
  title_ar = replace(title_ar, 'MC1', 'MCS'),
  subtitle = replace(subtitle, 'MC1', 'MCS'),
  subtitle_ar = replace(subtitle_ar, 'MC1', 'MCS'),
  content = replace(content, 'MC1', 'MCS'),
  content_ar = replace(content_ar, 'MC1', 'MCS'),
  content_data = pg_temp.correct_mcs_brand(content_data)
where concat_ws(' ', title, title_ar, subtitle, subtitle_ar, content, content_ar,
  content_data::text) like '%MC1%';

update public.service_page_content
set
  hero_title = replace(hero_title, 'MC1', 'MCS'),
  hero_title_ar = replace(hero_title_ar, 'MC1', 'MCS'),
  hero_subtitle = replace(hero_subtitle, 'MC1', 'MCS'),
  hero_subtitle_ar = replace(hero_subtitle_ar, 'MC1', 'MCS'),
  hero_description = replace(hero_description, 'MC1', 'MCS'),
  hero_description_ar = replace(hero_description_ar, 'MC1', 'MCS'),
  cta_text = replace(cta_text, 'MC1', 'MCS'),
  cta_text_ar = replace(cta_text_ar, 'MC1', 'MCS'),
  services_data = pg_temp.correct_mcs_brand(services_data),
  process_steps = pg_temp.correct_mcs_brand(process_steps)
where concat_ws(' ', hero_title, hero_title_ar, hero_subtitle, hero_subtitle_ar,
  hero_description, hero_description_ar, cta_text, cta_text_ar,
  services_data::text, process_steps::text) like '%MC1%';

update public.portfolio
set
  title = replace(title, 'MC1', 'MCS'),
  title_ar = replace(title_ar, 'MC1', 'MCS'),
  description = replace(description, 'MC1', 'MCS'),
  description_ar = replace(description_ar, 'MC1', 'MCS'),
  full_description = replace(full_description, 'MC1', 'MCS'),
  full_description_ar = replace(full_description_ar, 'MC1', 'MCS'),
  headline = replace(headline, 'MC1', 'MCS'),
  headline_ar = replace(headline_ar, 'MC1', 'MCS'),
  short_description = replace(short_description, 'MC1', 'MCS'),
  short_description_ar = replace(short_description_ar, 'MC1', 'MCS'),
  long_description = replace(long_description, 'MC1', 'MCS'),
  long_description_ar = replace(long_description_ar, 'MC1', 'MCS'),
  project_overview = replace(project_overview, 'MC1', 'MCS'),
  project_overview_ar = replace(project_overview_ar, 'MC1', 'MCS'),
  challenges = replace(challenges, 'MC1', 'MCS'),
  challenges_ar = replace(challenges_ar, 'MC1', 'MCS'),
  solutions = replace(solutions, 'MC1', 'MCS'),
  solutions_ar = replace(solutions_ar, 'MC1', 'MCS'),
  results = replace(results, 'MC1', 'MCS'),
  results_ar = replace(results_ar, 'MC1', 'MCS')
where concat_ws(' ', title, title_ar, description, description_ar,
  full_description, full_description_ar, headline, headline_ar,
  short_description, short_description_ar, long_description, long_description_ar,
  project_overview, project_overview_ar, challenges, challenges_ar,
  solutions, solutions_ar, results, results_ar) like '%MC1%';

update public.page_seo
set
  meta_title = replace(meta_title, 'MC1', 'MCS'),
  meta_title_ar = replace(meta_title_ar, 'MC1', 'MCS'),
  meta_description = replace(meta_description, 'MC1', 'MCS'),
  meta_description_ar = replace(meta_description_ar, 'MC1', 'MCS'),
  meta_keywords = replace(meta_keywords, 'MC1', 'MCS'),
  meta_keywords_ar = replace(meta_keywords_ar, 'MC1', 'MCS'),
  og_title = replace(og_title, 'MC1', 'MCS'),
  og_title_ar = replace(og_title_ar, 'MC1', 'MCS'),
  og_description = replace(og_description, 'MC1', 'MCS'),
  og_description_ar = replace(og_description_ar, 'MC1', 'MCS')
where concat_ws(' ', meta_title, meta_title_ar, meta_description, meta_description_ar,
  meta_keywords, meta_keywords_ar, og_title, og_title_ar,
  og_description, og_description_ar) like '%MC1%';

update public.legal_pages
set
  title = replace(title, 'MC1', 'MCS'),
  title_ar = replace(title_ar, 'MC1', 'MCS'),
  content = replace(content, 'MC1', 'MCS'),
  content_ar = replace(content_ar, 'MC1', 'MCS')
where concat_ws(' ', title, title_ar, content, content_ar) like '%MC1%';

commit;
