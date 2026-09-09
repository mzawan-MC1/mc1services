-- Pricing Plans
create table if not exists public.pricing_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price text,
  billing_period text,
  category text,
  description text,
  features text[] default '{}',
  cta_text text,
  is_popular boolean default false,
  "order" integer default 0,
  created_at timestamptz default now()
);

alter table public.pricing_plans enable row level security;
create policy "read_all_pricing" on public.pricing_plans for select using (true);
create policy "write_auth_pricing" on public.pricing_plans for insert with check (auth.role() = 'authenticated');
create policy "update_auth_pricing" on public.pricing_plans for update using (auth.role() = 'authenticated');
create policy "delete_auth_pricing" on public.pricing_plans for delete using (auth.role() = 'authenticated');

-- Page SEO
create table if not exists public.page_seo (
  id uuid primary key default gen_random_uuid(),
  page_path text unique not null,
  title text,
  description text,
  keywords text,
  og_image text,
  created_at timestamptz default now()
);

alter table public.page_seo enable row level security;
create policy "read_all_seo" on public.page_seo for select using (true);
create policy "write_auth_seo" on public.page_seo for insert with check (auth.role() = 'authenticated');
create policy "update_auth_seo" on public.page_seo for update using (auth.role() = 'authenticated');

-- Analytics Events
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  page_path text,
  page_title text,
  referrer text,
  user_agent text,
  session_id text,
  metadata jsonb,
  created_at timestamptz default now()
);

alter table public.analytics_events enable row level security;
create policy "write_public_analytics" on public.analytics_events for insert with check (true);
create policy "read_auth_analytics" on public.analytics_events for select using (auth.role() = 'authenticated');

-- User Profiles (for Role-Based Access)
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text default 'user',
  created_at timestamptz default now()
);

alter table public.user_profiles enable row level security;
create policy "read_own_profile" on public.user_profiles for select using (auth.uid() = id);
create policy "read_all_profiles_admin" on public.user_profiles for select using (
  exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, role)
  values (new.id, 'user');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
