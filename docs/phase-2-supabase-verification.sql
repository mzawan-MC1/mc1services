-- Read-only consolidated verification after the Phase 2 migration.
-- This returns all checks in one result grid for easy copying.

select section, result
from (
  select
    1 as sort_order,
    '01_storage_buckets'::text as section,
    coalesce(jsonb_agg(to_jsonb(bucket_result) order by bucket_result.id), '[]'::jsonb) as result
  from (
    select id, name, public, file_size_limit, allowed_mime_types
    from storage.buckets
    where id in ('avatars', 'public', 'team-photos')
  ) bucket_result

  union all

  select
    2 as sort_order,
    '02_contact_constraints'::text as section,
    coalesce(jsonb_agg(to_jsonb(constraint_result) order by constraint_result.constraint_name), '[]'::jsonb) as result
  from (
    select
      conname as constraint_name,
      convalidated as validated_for_existing_rows,
      pg_get_constraintdef(oid) as definition
    from pg_constraint
    where conrelid = 'public.contact_submissions'::regclass
      and conname in ('contact_submission_lengths', 'contact_submission_status_values')
  ) constraint_result

  union all

  select
    3 as sort_order,
    '03_contact_policies'::text as section,
    coalesce(jsonb_agg(to_jsonb(policy_result) order by policy_result.policyname), '[]'::jsonb) as result
  from (
    select policyname, roles, cmd, qual, with_check
    from pg_policies
    where schemaname = 'public'
      and tablename = 'contact_submissions'
  ) policy_result
) verification
order by sort_order;
