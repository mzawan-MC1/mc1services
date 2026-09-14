-- Read-only verification after running 20260914122427_configure_portfolio_categories.sql.
select
  '01_portfolio_category_config' as section,
  jsonb_build_object(
    'setting_key', setting_key,
    'setting_category', setting_category,
    'display_name', display_name,
    'category_count', jsonb_array_length(setting_value::jsonb),
    'categories', setting_value::jsonb
  ) as result
from public.site_settings
where setting_key = 'portfolio_categories';

select
  '02_category_remains_single_value' as section,
  jsonb_build_object(
    'table_name', table_name,
    'column_name', column_name,
    'data_type', data_type
  ) as result
from information_schema.columns
where table_schema = 'public'
  and table_name = 'portfolio'
  and column_name = 'category';
