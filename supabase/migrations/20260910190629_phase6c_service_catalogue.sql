-- Phase 6C canonical MCS service catalogue.
-- Prepared locally on 2026-09-10. Review and back up before applying to production.
-- Reuses the four existing service records and inserts only the three missing services.

begin;
set local lock_timeout = '5s';
set local statement_timeout = '30s';
create index if not exists services_parent_id_idx on public.services (parent_id);

update public.services set
  title = 'AI Solutions & Intelligent Automation', title_ar = 'حلول الذكاء الاصطناعي والأتمتة الذكية',
  description = 'Practical AI, intelligent automation and connected workflows that reduce repetitive work and improve decisions.',
  description_ar = 'حلول عملية للذكاء الاصطناعي والأتمتة الذكية وسير العمل المترابط لتقليل الأعمال المتكررة وتحسين القرارات.',
  full_description = 'We design AI-enabled business workflows, integrations and automation systems around the way your team already works. Solutions can connect existing tools, remove manual handoffs and create clear operational visibility without forcing a duplicate system.',
  full_description_ar = 'نصمم سير عمل مدعوماً بالذكاء الاصطناعي وتكاملات وأنظمة أتمتة تتوافق مع طريقة عمل فريقك الحالية، وتربط الأدوات القائمة وتقلل الخطوات اليدوية وتوفر رؤية تشغيلية واضحة دون إنشاء نظام مكرر.',
  category = 'ai_automation', category_ar = 'الذكاء الاصطناعي والأتمتة', icon = 'Sparkles',
  features = array['AI-enabled workflows', 'Business process automation', 'System integrations', 'Operational dashboards'],
  features_ar = array['سير عمل مدعوم بالذكاء الاصطناعي', 'أتمتة إجراءات الأعمال', 'تكامل الأنظمة', 'لوحات المعلومات التشغيلية'],
  slug = 'ai-solutions-intelligent-automation', parent_id = null, service_group = 'Build', page_url = '/Automation',
  menu_description = 'Practical AI and workflow automation.', menu_description_ar = 'ذكاء اصطناعي عملي وأتمتة لسير العمل.',
  "order" = 10, is_active = true, is_featured = true
where lower(title) = 'automation' or lower(slug) = 'ai-solutions-intelligent-automation';

update public.services set
  title = 'Custom Software & Business Platforms', title_ar = 'البرمجيات المخصصة ومنصات الأعمال',
  description = 'Custom ERP, portals and operational platforms built around your real business processes.',
  description_ar = 'أنظمة تخطيط موارد ومنصات وبوابات تشغيلية مخصصة مبنية حول إجراءات عملك الفعلية.',
  full_description = 'We convert complex business workflows into secure, scalable software: ERP systems, customer and staff portals, operational accounting, inventory, reporting and multi-company platforms. Every solution is designed around the existing source of truth and the people who use it.',
  full_description_ar = 'نحوّل إجراءات الأعمال المعقدة إلى برمجيات آمنة وقابلة للتوسع، بما يشمل أنظمة تخطيط الموارد وبوابات العملاء والموظفين والمحاسبة التشغيلية والمخزون والتقارير والمنصات متعددة الشركات.',
  category = 'development', category_ar = 'تطوير البرمجيات', icon = 'Code2',
  features = array['Custom ERP systems', 'Business portals', 'Workflow digitisation', 'APIs and integrations'],
  features_ar = array['أنظمة تخطيط موارد مخصصة', 'بوابات الأعمال', 'رقمنة سير العمل', 'واجهات برمجة وتكاملات'],
  slug = 'custom-software-business-platforms', parent_id = null, service_group = 'Build', page_url = '/DevelopmentServices',
  menu_description = 'ERP, portals and operational systems.', menu_description_ar = 'أنظمة تخطيط الموارد والبوابات والأنظمة التشغيلية.',
  "order" = 20, is_active = true, is_featured = true
where lower(title) = 'software development' or lower(slug) = 'custom-software-business-platforms';

update public.services set
  title = 'Digital Marketing & Growth', title_ar = 'التسويق الرقمي والنمو',
  description = 'Connected SEO, paid media, social campaigns and analytics focused on measurable business growth.',
  description_ar = 'تحسين محركات البحث والإعلانات المدفوعة والحملات الاجتماعية والتحليلات ضمن استراتيجية نمو قابلة للقياس.',
  full_description = 'We plan, create and optimise digital campaigns across search and social platforms, connecting creative work, audience strategy and performance data so marketing activity supports clear commercial goals.',
  full_description_ar = 'نخطط وننشئ ونحسّن الحملات الرقمية عبر البحث ومنصات التواصل، مع ربط المحتوى الإبداعي واستراتيجية الجمهور وبيانات الأداء بأهداف تجارية واضحة.',
  category = 'marketing', category_ar = 'التسويق', icon = 'TrendingUp',
  features = array['SEO and search marketing', 'Paid media campaigns', 'Social media growth', 'Performance analytics'],
  features_ar = array['تحسين محركات البحث', 'الحملات الإعلانية المدفوعة', 'نمو وسائل التواصل', 'تحليلات الأداء'],
  slug = 'digital-marketing-growth', parent_id = null, service_group = 'Scale', page_url = '/MarketingServices',
  menu_description = 'SEO, paid media and social growth.', menu_description_ar = 'تحسين البحث والإعلانات المدفوعة والنمو الاجتماعي.',
  "order" = 50, is_active = true, is_featured = true
where lower(title) = 'digital marketing' or lower(slug) = 'digital-marketing-growth';

update public.services set
  title = 'Cloud, IT & Managed Support', title_ar = 'الحوسبة السحابية وتقنية المعلومات والدعم المُدار',
  description = 'Cloud, infrastructure, security and dependable managed support for business-critical systems.',
  description_ar = 'خدمات سحابية وبنية تحتية وأمن ودعم مُدار موثوق للأنظمة المهمة للأعمال.',
  full_description = 'We help businesses operate and improve their technology environment through cloud services, infrastructure planning, security guidance, maintenance and responsive managed support.',
  full_description_ar = 'نساعد الشركات على تشغيل وتطوير بيئتها التقنية من خلال الخدمات السحابية وتخطيط البنية التحتية والإرشاد الأمني والصيانة والدعم المُدار.',
  category = 'it_services', category_ar = 'تقنية المعلومات', icon = 'CloudCog',
  features = array['Cloud services', 'Infrastructure planning', 'Security support', 'Managed IT services'],
  features_ar = array['الخدمات السحابية', 'تخطيط البنية التحتية', 'الدعم الأمني', 'خدمات تقنية معلومات مُدارة'],
  slug = 'cloud-it-managed-support', parent_id = null, service_group = 'Scale', page_url = '/ITServices',
  menu_description = 'Infrastructure, security and support.', menu_description_ar = 'البنية التحتية والأمن والدعم.',
  "order" = 60, is_active = true, is_featured = true
where lower(title) = 'it solutions' or lower(slug) = 'cloud-it-managed-support';

insert into public.services (title, title_ar, description, description_ar, full_description, full_description_ar, category, category_ar, icon, features, features_ar, slug, parent_id, service_group, page_url, menu_description, menu_description_ar, "order", is_active, is_featured)
select 'Application Development', 'تطوير التطبيقات', 'Modern web, mobile and desktop applications designed for real users and day-to-day operations.', 'تطبيقات ويب وهواتف وأجهزة مكتبية حديثة مصممة للمستخدمين الحقيقيين والعمليات اليومية.', 'We build customer-facing and internal applications from discovery through launch, with responsive interfaces, secure integrations and maintainable architecture across web, mobile and desktop.', 'نبني تطبيقات للعملاء والفرق الداخلية من مرحلة الاكتشاف حتى الإطلاق، مع واجهات متجاوبة وتكاملات آمنة وبنية قابلة للصيانة للويب والهواتف والأجهزة المكتبية.', 'application_development', 'تطوير التطبيقات', 'PanelsTopLeft', array['Web applications', 'Mobile applications', 'Desktop applications', 'UX and integrations'], array['تطبيقات الويب', 'تطبيقات الهواتف', 'تطبيقات سطح المكتب', 'تجربة المستخدم والتكاملات'], 'application-development', null, 'Build', '/AppDevelopment', 'Web, mobile and desktop applications.', 'تطبيقات الويب والهواتف والأجهزة المكتبية.', 30, true, true
where not exists (select 1 from public.services where lower(slug) = 'application-development' or lower(title) = 'application development');

insert into public.services (title, title_ar, description, description_ar, full_description, full_description_ar, category, category_ar, icon, features, features_ar, slug, parent_id, service_group, page_url, menu_description, menu_description_ar, "order", is_active, is_featured)
select 'SaaS Product Engineering', 'هندسة منتجات البرمجيات كخدمة', 'Multi-tenant SaaS products and MVPs engineered for secure growth, billing and ongoing evolution.', 'منتجات برمجيات كخدمة ونماذج أولية متعددة المستأجرين مصممة للنمو الآمن والفوترة والتطوير المستمر.', 'We turn a validated business idea or workflow into a scalable SaaS product, covering product discovery, multi-tenant architecture, subscriptions, administration, analytics and a practical roadmap after launch.', 'نحوّل فكرة عمل أو سير عمل مثبتاً إلى منتج برمجي كخدمة قابل للتوسع، ويشمل ذلك اكتشاف المنتج والبنية متعددة المستأجرين والاشتراكات والإدارة والتحليلات وخارطة طريق عملية بعد الإطلاق.', 'saas_engineering', 'هندسة البرمجيات كخدمة', 'Boxes', array['Product discovery', 'Multi-tenant architecture', 'Subscriptions and billing', 'Analytics and administration'], array['اكتشاف المنتج', 'بنية متعددة المستأجرين', 'الاشتراكات والفوترة', 'التحليلات والإدارة'], 'saas-product-engineering', null, 'Scale', '/DevelopmentServices', 'Multi-tenant SaaS products and MVPs.', 'منتجات برمجيات كخدمة ونماذج أولية متعددة المستأجرين.', 40, true, true
where not exists (select 1 from public.services where lower(slug) = 'saas-product-engineering' or lower(title) = 'saas product engineering');

insert into public.services (title, title_ar, description, description_ar, full_description, full_description_ar, category, category_ar, icon, features, features_ar, slug, parent_id, service_group, page_url, menu_description, menu_description_ar, "order", is_active, is_featured)
select 'Creative Content & Production', 'المحتوى الإبداعي والإنتاج', 'Brand, campaign, photography and video production designed for digital channels and business growth.', 'إنتاج العلامات والحملات والصور والفيديو المصمم للقنوات الرقمية ونمو الأعمال.', 'Our creative and production work connects brand strategy with campaign-ready photography, video and digital assets for websites, social channels and paid advertising.', 'يربط عملنا الإبداعي والإنتاجي استراتيجية العلامة التجارية بالصور والفيديو والأصول الرقمية الجاهزة للمواقع ومنصات التواصل والإعلانات المدفوعة.', 'production', 'الإنتاج الإبداعي', 'Clapperboard', array['Brand content', 'Photography', 'Video production', 'Campaign creative'], array['محتوى العلامة التجارية', 'التصوير', 'إنتاج الفيديو', 'إبداع الحملات'], 'creative-content-production', null, 'Create', '/Production', 'Brand, campaign and video production.', 'إنتاج العلامات التجارية والحملات والفيديو.', 70, true, true
where not exists (select 1 from public.services where lower(slug) = 'creative-content-production' or lower(title) = 'creative content & production');

notify pgrst, 'reload schema';
commit;
