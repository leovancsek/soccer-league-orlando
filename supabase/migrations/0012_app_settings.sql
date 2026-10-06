-- Generic key/value settings store. First use: the WhatsApp announcements
-- group URL shown as a banner on every player's Messages tab, previously
-- only held in client-side React state (lost on every app restart/relaunch
-- — never actually persisted anywhere, so "managing" it from Admin didn't
-- do anything durable).

create table if not exists public.app_settings (
  key text primary key,
  value text,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

-- Any signed-in user needs to read it (to show the WhatsApp banner), but
-- only admins can change it.
create policy "Authenticated users can read settings"
  on public.app_settings for select
  using (auth.role() = 'authenticated');

create policy "Admins can upsert settings"
  on public.app_settings for insert
  with check (exists (select 1 from public.profiles where id = auth.uid() and (is_admin or is_super_admin)));

create policy "Admins can update settings"
  on public.app_settings for update
  using (exists (select 1 from public.profiles where id = auth.uid() and (is_admin or is_super_admin)));

grant select, insert, update on public.app_settings to authenticated;
