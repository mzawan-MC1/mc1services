-- EMERGENCY COMPATIBILITY CONTINGENCY
-- Do not run routinely. Use only if an approved Phase 1 production change prevents
-- the confirmed administrator from editing public CMS content.
-- This preserves the critical admin_users lock and does not restore public writes.

begin;

do $content_tables$
declare
  table_name text;
  policy_name text;
begin
  foreach table_name in array array[
    'about_page_content', 'client_logos', 'contact_page_content', 'faqs',
    'header_footer_settings', 'home_page_content', 'legal_pages', 'page_seo',
    'portfolio', 'pricing_plans', 'project_images', 'service_page_content',
    'services', 'site_settings', 'team_members', 'testimonials', 'tools',
    'tools_page_content'
  ]
  loop
    for policy_name in
      select p.policyname from pg_catalog.pg_policies p
      where p.schemaname = 'public' and p.tablename = table_name
    loop
      execute format('drop policy if exists %I on public.%I', policy_name, table_name);
    end loop;

    execute format(
      'create policy public_read on public.%I for select to anon, authenticated using (true)',
      table_name
    );
    execute format(
      'create policy authenticated_write_contingency on public.%I for all to authenticated using (true) with check (true)',
      table_name
    );
  end loop;
end
$content_tables$;

notify pgrst, 'reload schema';
commit;
