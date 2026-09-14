-- Phase 6B content architecture for mc1services.com
-- Prepared locally on 2026-09-10. Do not run without a current backup and explicit approval.
-- This migration is additive: existing portfolio, service, home and menu content is preserved.

begin;

-- Portfolio stays the single source for MCS products and client projects.
alter table public.portfolio
  add column if not exists slug text,
  add column if not exists project_type text not null default 'client_project',
  add column if not exists confidentiality text not null default 'public',
  add column if not exists featured_rank integer,
  add column if not exists headline text,
  add column if not exists headline_ar text;

update public.portfolio
set slug = trim(both '-' from lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g')))
           || '-' || left(id::text, 8)
where slug is null or btrim(slug) = '';

create unique index if not exists portfolio_slug_unique
  on public.portfolio (lower(slug))
  where slug is not null;

do $portfolio_constraints$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'portfolio_project_type_values'
      and conrelid = 'public.portfolio'::regclass
  ) then
    alter table public.portfolio add constraint portfolio_project_type_values
      check (project_type in ('mc1_product', 'client_project', 'internal_demo', 'confidential_project', 'capability_example'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'portfolio_confidentiality_values'
      and conrelid = 'public.portfolio'::regclass
  ) then
    alter table public.portfolio add constraint portfolio_confidentiality_values
      check (confidentiality in ('public', 'limited', 'confidential'));
  end if;
end
$portfolio_constraints$;

-- Evolve the existing project_images collection into a mixed project-media collection.
-- The table name is retained to preserve existing code and records.
alter table public.project_images
  add column if not exists media_type text not null default 'image',
  add column if not exists media_role text not null default 'gallery',
  add column if not exists caption_ar text,
  add column if not exists alt_text text,
  add column if not exists alt_text_ar text,
  add column if not exists poster_url text,
  add column if not exists mime_type text,
  add column if not exists width integer,
  add column if not exists height integer,
  add column if not exists duration_seconds numeric(10,2),
  add column if not exists is_featured boolean not null default false;

do $project_media_constraints$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'project_images_media_type_values'
      and conrelid = 'public.project_images'::regclass
  ) then
    alter table public.project_images add constraint project_images_media_type_values
      check (media_type in ('image', 'video'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'project_images_media_role_values'
      and conrelid = 'public.project_images'::regclass
  ) then
    alter table public.project_images add constraint project_images_media_role_values
      check (media_role in ('gallery', 'hero', 'desktop', 'mobile', 'feature', 'workflow', 'poster'));
  end if;
end
$project_media_constraints$;

-- Services remain the canonical service catalogue.
alter table public.services
  add column if not exists slug text,
  add column if not exists parent_id uuid references public.services(id) on delete set null,
  add column if not exists service_group text,
  add column if not exists page_url text,
  add column if not exists menu_description text,
  add column if not exists menu_description_ar text,
  add column if not exists menu_image_url text,
  add column if not exists is_featured boolean not null default false;

update public.services
set slug = trim(both '-' from lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g')))
           || '-' || left(id::text, 8)
where slug is null or btrim(slug) = '';

create unique index if not exists services_slug_unique
  on public.services (lower(slug))
  where slug is not null;

-- One managed industry catalogue replaces free-text duplication.
create table if not exists public.industries (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  name_ar text,
  short_description text,
  short_description_ar text,
  image_url text,
  icon text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists industries_slug_unique on public.industries (lower(slug));
create index if not exists industries_active_order_idx on public.industries (is_active, display_order);

insert into public.industries (slug, name, display_order) values
  ('automotive-auctions', 'Automotive & Auctions', 10),
  ('logistics-shipping-freight', 'Logistics, Shipping & Freight', 20),
  ('entertainment-escape-rooms', 'Entertainment & Escape Rooms', 30),
  ('gaming', 'Gaming', 40),
  ('food-beverage-hospitality', 'Food, Beverage & Hospitality', 50),
  ('media-news', 'Media & News', 60),
  ('legal-professional-services', 'Legal & Professional Services', 70),
  ('custom-business-workflows', 'Other Custom Business Workflows', 80)
on conflict do nothing;

-- Projects may belong to several industries and several services.
create table if not exists public.portfolio_industries (
  portfolio_id uuid not null references public.portfolio(id) on delete cascade,
  industry_id uuid not null references public.industries(id) on delete cascade,
  is_primary boolean not null default false,
  primary key (portfolio_id, industry_id)
);

create table if not exists public.portfolio_services (
  portfolio_id uuid not null references public.portfolio(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  primary key (portfolio_id, service_id)
);

create index if not exists portfolio_industries_industry_idx on public.portfolio_industries (industry_id);
create index if not exists portfolio_services_service_idx on public.portfolio_services (service_id);

-- Media metadata replacement is defined in the companion migration.

-- Existing homepage rows become orderable and hideable without creating another page builder.
alter table public.home_page_content
  add column if not exists display_order integer not null default 0,
  add column if not exists is_visible boolean not null default true,
  add column if not exists style_variant text not null default 'default';

-- Public users must never receive draft projects or inactive catalogue records.
drop policy if exists public_read on public.portfolio;
drop policy if exists public_read_published on public.portfolio;
drop policy if exists authenticated_read_published_or_admin on public.portfolio;
create policy public_read_published on public.portfolio
for select to anon using (status = 'published' and confidentiality <> 'confidential');
create policy authenticated_read_published_or_admin on public.portfolio
for select to authenticated using (
  (status = 'published' and confidentiality <> 'confidential') or public.is_admin()
);

drop policy if exists public_read on public.services;
drop policy if exists public_read_active on public.services;
drop policy if exists authenticated_read_active_or_admin on public.services;
create policy public_read_active on public.services
for select to anon using (is_active = true);
create policy authenticated_read_active_or_admin on public.services
for select to authenticated using (is_active = true or public.is_admin());

drop policy if exists public_read on public.project_images;
drop policy if exists public_read_published_project_media on public.project_images;
drop policy if exists authenticated_read_project_media_or_admin on public.project_images;
create policy public_read_published_project_media on public.project_images
for select to anon using (
  exists (
    select 1 from public.portfolio p
    where p.id = project_id
      and p.status = 'published'
      and p.confidentiality <> 'confidential'
  )
);
create policy authenticated_read_project_media_or_admin on public.project_images
for select to authenticated using (
  public.is_admin() or exists (
    select 1 from public.portfolio p
    where p.id = project_id
      and p.status = 'published'
      and p.confidentiality <> 'confidential'
  )
);

alter table public.industries enable row level security;
alter table public.portfolio_industries enable row level security;
alter table public.portfolio_services enable row level security;

grant select on public.industries, public.portfolio_industries, public.portfolio_services to anon, authenticated;
grant insert, update, delete on public.industries, public.portfolio_industries, public.portfolio_services to authenticated;

drop policy if exists industries_public_read on public.industries;
drop policy if exists industries_authenticated_read on public.industries;
drop policy if exists industries_admin_insert on public.industries;
drop policy if exists industries_admin_update on public.industries;
drop policy if exists industries_admin_delete on public.industries;
create policy industries_public_read on public.industries
for select to anon using (is_active = true);
create policy industries_authenticated_read on public.industries
for select to authenticated using (is_active = true or public.is_admin());
create policy industries_admin_insert on public.industries
for insert to authenticated with check (public.is_admin());
create policy industries_admin_update on public.industries
for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy industries_admin_delete on public.industries
for delete to authenticated using (public.is_admin());

drop policy if exists portfolio_industries_public_read on public.portfolio_industries;
drop policy if exists portfolio_industries_authenticated_read on public.portfolio_industries;
drop policy if exists portfolio_industries_admin_write on public.portfolio_industries;
create policy portfolio_industries_public_read on public.portfolio_industries
for select to anon using (
  exists (
    select 1 from public.portfolio p
    where p.id = portfolio_id and p.status = 'published' and p.confidentiality <> 'confidential'
  )
);
create policy portfolio_industries_authenticated_read on public.portfolio_industries
for select to authenticated using (
  public.is_admin() or exists (
    select 1 from public.portfolio p
    where p.id = portfolio_id and p.status = 'published' and p.confidentiality <> 'confidential'
  )
);
create policy portfolio_industries_admin_write on public.portfolio_industries
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists portfolio_services_public_read on public.portfolio_services;
drop policy if exists portfolio_services_authenticated_read on public.portfolio_services;
drop policy if exists portfolio_services_admin_write on public.portfolio_services;
create policy portfolio_services_public_read on public.portfolio_services
for select to anon using (
  exists (
    select 1 from public.portfolio p
    where p.id = portfolio_id and p.status = 'published' and p.confidentiality <> 'confidential'
  )
);
create policy portfolio_services_authenticated_read on public.portfolio_services
for select to authenticated using (
  public.is_admin() or exists (
    select 1 from public.portfolio p
    where p.id = portfolio_id and p.status = 'published' and p.confidentiality <> 'confidential'
  )
);
create policy portfolio_services_admin_write on public.portfolio_services
for all to authenticated using (public.is_admin()) with check (public.is_admin());

notify pgrst, 'reload schema';

commit;
