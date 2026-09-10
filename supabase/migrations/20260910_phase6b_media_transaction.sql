-- Phase 6B companion migration: atomic project media metadata replacement.
-- Apply only after 20260910_phase6b_content_foundation.sql and only with explicit approval.

begin;

create or replace function public.replace_project_media(p_project_id uuid, p_media jsonb)
returns text[]
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  removed_urls text[];
begin
  if not public.is_admin() then
    raise exception 'Administrator access required';
  end if;

  if not exists (select 1 from public.portfolio where id = p_project_id) then
    raise exception 'Portfolio project not found';
  end if;

  select coalesce(array_agg(pi.image_url), array[]::text[])
  into removed_urls
  from public.project_images pi
  where pi.project_id = p_project_id
    and not exists (
      select 1
      from jsonb_array_elements(coalesce(p_media, '[]'::jsonb)) item
      where item->>'image_url' = pi.image_url
    );

  delete from public.project_images where project_id = p_project_id;

  insert into public.project_images (
    project_id, image_url, caption, caption_ar, alt_text, alt_text_ar,
    display_order, media_type, media_role, poster_url, mime_type,
    width, height, duration_seconds, is_featured
  )
  select
    p_project_id,
    item->>'image_url',
    coalesce(item->>'caption', ''),
    nullif(item->>'caption_ar', ''),
    nullif(item->>'alt_text', ''),
    nullif(item->>'alt_text_ar', ''),
    coalesce((item->>'display_order')::integer, ordinality::integer - 1),
    coalesce(nullif(item->>'media_type', ''), 'image'),
    coalesce(nullif(item->>'media_role', ''), 'gallery'),
    nullif(item->>'poster_url', ''),
    nullif(item->>'mime_type', ''),
    nullif(item->>'width', '')::integer,
    nullif(item->>'height', '')::integer,
    nullif(item->>'duration_seconds', '')::numeric,
    coalesce((item->>'is_featured')::boolean, false)
  from jsonb_array_elements(coalesce(p_media, '[]'::jsonb)) with ordinality as media(item, ordinality)
  where nullif(item->>'image_url', '') is not null;

  return removed_urls;
end
$function$;

revoke all on function public.replace_project_media(uuid, jsonb) from public, anon;
grant execute on function public.replace_project_media(uuid, jsonb) to authenticated;

create or replace function public.replace_portfolio_taxonomy(
  p_project_id uuid,
  p_industry_ids uuid[],
  p_service_ids uuid[]
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required';
  end if;

  if not exists (select 1 from public.portfolio where id = p_project_id) then
    raise exception 'Portfolio project not found';
  end if;

  delete from public.portfolio_industries where portfolio_id = p_project_id;
  insert into public.portfolio_industries (portfolio_id, industry_id, is_primary)
  select p_project_id, industry_id, ordinality = 1
  from unnest(coalesce(p_industry_ids, array[]::uuid[])) with ordinality as selected(industry_id, ordinality)
  on conflict do nothing;

  delete from public.portfolio_services where portfolio_id = p_project_id;
  insert into public.portfolio_services (portfolio_id, service_id)
  select p_project_id, service_id
  from unnest(coalesce(p_service_ids, array[]::uuid[])) service_id
  on conflict do nothing;
end
$function$;

revoke all on function public.replace_portfolio_taxonomy(uuid, uuid[], uuid[]) from public, anon;
grant execute on function public.replace_portfolio_taxonomy(uuid, uuid[], uuid[]) to authenticated;

commit;
