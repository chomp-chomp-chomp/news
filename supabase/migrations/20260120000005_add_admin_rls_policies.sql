-- Admin RLS policies to allow publication admins to manage related data.
-- Review in Supabase and apply as needed.

-- Publications
alter table public.publications enable row level security;
drop policy if exists "publication_admins_manage" on public.publications;
create policy "publication_admins_manage"
on public.publications
for all
using (
  exists (
    select 1
    from public.publication_admins pa
    where pa.publication_id = publications.id
      and pa.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.publication_admins pa
    where pa.publication_id = publications.id
      and pa.user_id = auth.uid()
  )
);

-- Issues
alter table public.issues enable row level security;
drop policy if exists "publication_admins_manage_issues" on public.issues;
create policy "publication_admins_manage_issues"
on public.issues
for all
using (
  exists (
    select 1
    from public.publication_admins pa
    where pa.publication_id = issues.publication_id
      and pa.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.publication_admins pa
    where pa.publication_id = issues.publication_id
      and pa.user_id = auth.uid()
  )
);

-- Blocks
alter table public.blocks enable row level security;
drop policy if exists "publication_admins_manage_blocks" on public.blocks;
create policy "publication_admins_manage_blocks"
on public.blocks
for all
using (
  exists (
    select 1
    from public.issues i
    join public.publication_admins pa on pa.publication_id = i.publication_id
    where i.id = blocks.issue_id
      and pa.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.issues i
    join public.publication_admins pa on pa.publication_id = i.publication_id
    where i.id = blocks.issue_id
      and pa.user_id = auth.uid()
  )
);

-- Subscribers
alter table public.subscribers enable row level security;
drop policy if exists "publication_admins_manage_subscribers" on public.subscribers;
create policy "publication_admins_manage_subscribers"
on public.subscribers
for all
using (
  exists (
    select 1
    from public.publication_admins pa
    where pa.publication_id = subscribers.publication_id
      and pa.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.publication_admins pa
    where pa.publication_id = subscribers.publication_id
      and pa.user_id = auth.uid()
  )
);
