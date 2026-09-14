-- Store portfolio categories in the existing site_settings configuration table.
-- Category remains the single primary classification on public.portfolio.
insert into public.site_settings (setting_key, setting_value, setting_category, display_name)
values (
  'portfolio_categories',
  '[{"value":"web_development","label":"Web Development","label_ar":"تطوير الويب","is_active":true,"display_order":0},{"value":"app_development","label":"App Development","label_ar":"تطوير التطبيقات","is_active":true,"display_order":1},{"value":"digital_marketing","label":"Digital Marketing","label_ar":"التسويق الرقمي","is_active":true,"display_order":2},{"value":"production","label":"Production","label_ar":"الإنتاج","is_active":true,"display_order":3},{"value":"it_services","label":"IT Services","label_ar":"خدمات تقنية المعلومات","is_active":true,"display_order":4},{"value":"development","label":"Development","label_ar":"التطوير","is_active":true,"display_order":5},{"value":"apps","label":"Apps","label_ar":"التطبيقات","is_active":true,"display_order":6},{"value":"marketing","label":"Marketing","label_ar":"التسويق","is_active":true,"display_order":7},{"value":"branding","label":"Branding","label_ar":"الهوية التجارية","is_active":true,"display_order":8},{"value":"creative","label":"Creative","label_ar":"الإبداع","is_active":true,"display_order":9}]',
  'portfolio',
  'Portfolio Categories'
)
on conflict (setting_key) do nothing;
