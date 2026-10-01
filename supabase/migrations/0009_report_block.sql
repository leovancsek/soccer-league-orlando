-- Required by App Store Review Guideline 1.2: apps with user-generated
-- content (here, in-app messaging between players and organizers) must
-- offer a way to report objectionable content/users and to block them.
--
-- Messaging is still client-side mock state (see README "Architecture
-- notes" — conversations/messages haven't been migrated off seedData.js
-- yet), so there's no real conversation/message row to reference. Reports
-- and blocks are keyed by the other person's display name instead, as a
-- pragmatic stand-in until messaging is backed by the real conversations/
-- messages tables that already exist in this schema — at which point this
-- should be revisited to key by profile id instead.
create table public.user_reports (
  id bigint generated always as identity primary key,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_name text not null,
  reason text not null,
  details text,
  created_at timestamptz not null default now()
);

create table public.user_blocks (
  id bigint generated always as identity primary key,
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  target_name text not null,
  created_at timestamptz not null default now(),
  unique (blocker_id, target_name)
);

alter table public.user_reports enable row level security;
alter table public.user_blocks enable row level security;

create policy "Users can file their own reports"
on public.user_reports for insert
with check (reporter_id = auth.uid());

create policy "Users can view their own reports"
on public.user_reports for select
using (reporter_id = auth.uid());

create policy "Admins can view all reports"
on public.user_reports for select
using (exists (select 1 from public.profiles where id = auth.uid() and (is_admin or is_super_admin)));

create policy "Users can manage their own blocks"
on public.user_blocks for all
using (blocker_id = auth.uid())
with check (blocker_id = auth.uid());
