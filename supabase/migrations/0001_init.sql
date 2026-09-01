-- ============================================================
-- Soccer League Orlando — database schema (Supabase / Postgres)
-- Run this in Supabase Studio → SQL Editor, or via `supabase db push`
-- ============================================================

-- Profiles table, 1:1 with auth.users. Supabase Auth handles the actual
-- credentials (email/password hash, password-reset tokens) — this table
-- only stores app-facing profile data.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  position text default 'Midfielder',
  level text default 'Intermediate',
  city text default 'Orlando, FL',
  bio text default '',
  is_admin boolean not null default false,
  games_played integer not null default 0,
  rating numeric(2,1) not null default 5.0,
  wins integer not null default 0,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Games / listings
create table if not exists public.games (
  id bigint generated always as identity primary key,
  organizer_id uuid references public.profiles(id),
  listing_type text not null default 'casual' check (listing_type in ('casual','league')),
  format text not null,
  title text not null,
  venue text not null,
  address text,
  game_date text not null,
  game_time text not null,
  display_price text,
  spots_total integer not null default 10,
  level text default 'Intermediate',
  image_url text,
  pricing jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Roster entries (drop-ins, regulars, league players, substitutes)
create table if not exists public.game_rosters (
  id bigint generated always as identity primary key,
  game_id bigint not null references public.games(id) on delete cascade,
  roster_type text not null check (roster_type in ('dropIns','monthlyPlayers','leaguePlayers','substitutes')),
  player_name text not null,
  profile_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- Bookings — created *before* payment, confirmed after Stripe redirect succeeds
create table if not exists public.bookings (
  id bigint generated always as identity primary key,
  game_id bigint not null references public.games(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending_payment' check (status in ('pending_payment','confirmed','cancelled')),
  stripe_checkout_session_id text,
  amount_charged text,
  created_at timestamptz not null default now()
);

-- Conversations + messages
create table if not exists public.conversations (
  id bigint generated always as identity primary key,
  game_id bigint references public.games(id),
  player_id uuid not null references public.profiles(id),
  organizer_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id bigint generated always as identity primary key,
  conversation_id bigint not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  body text not null,
  created_at timestamptz not null default now()
);

-- Platform feature flags — admin-managed
create table if not exists public.feature_flags (
  id text primary key,
  name text not null,
  description text,
  enabled boolean not null default true
);

insert into public.feature_flags (id, name, description, enabled) values
  ('booking', 'Game Booking', 'Players can browse and book pickup games.', true),
  ('tournaments', 'Tournaments', 'Allow organizers to publish tournament brackets.', true),
  ('messaging', 'Messaging', 'In-app chat between players and organizers.', true),
  ('ratings', 'Player Ratings', 'Show skill ratings and post-game reviews.', true),
  ('payments', 'In-App Payments', 'Charge cards at checkout instead of pay-on-site.', true),
  ('waitlist', 'Waitlists', 'Let players join a waitlist when a game is full.', false)
on conflict (id) do nothing;

-- ============================================================
-- Row Level Security — every table locked down by default,
-- explicit policies for exactly what each role should see/do.
-- ============================================================
alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.game_rosters enable row level security;
alter table public.bookings enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.feature_flags enable row level security;

-- Profiles: anyone signed in can read public profile fields; users can only edit their own.
create policy "Profiles are readable by authenticated users"
  on public.profiles for select using (auth.role() = 'authenticated');
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Games: readable by everyone signed in; only admins can insert/update/delete.
create policy "Games are readable by authenticated users"
  on public.games for select using (auth.role() = 'authenticated');
create policy "Admins can manage games"
  on public.games for all using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Rosters: same pattern as games.
create policy "Rosters are readable by authenticated users"
  on public.game_rosters for select using (auth.role() = 'authenticated');
create policy "Admins can manage rosters"
  on public.game_rosters for all using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Bookings: users can only see/create their own bookings, and can only
-- cancel them (never self-confirm — confirmation is set server-side by the
-- Stripe webhook using the service_role key, which bypasses RLS entirely).
create policy "Users see their own bookings"
  on public.bookings for select using (auth.uid() = user_id);
create policy "Users create their own bookings"
  on public.bookings for insert with check (auth.uid() = user_id and status = 'pending_payment');
create policy "Users can only cancel their own bookings"
  on public.bookings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and status = 'cancelled');

-- Conversations/messages: only the two participants can read/write.
create policy "Participants read their conversations"
  on public.conversations for select using (auth.uid() in (player_id, organizer_id));
create policy "Participants create conversations"
  on public.conversations for insert with check (auth.uid() in (player_id, organizer_id));
create policy "Participants read their messages"
  on public.messages for select using (
    exists (select 1 from public.conversations c where c.id = conversation_id and auth.uid() in (c.player_id, c.organizer_id))
  );
create policy "Participants send messages"
  on public.messages for insert with check (
    auth.uid() = sender_id and
    exists (select 1 from public.conversations c where c.id = conversation_id and auth.uid() in (c.player_id, c.organizer_id))
  );

-- Feature flags: readable by everyone signed in; only admins can toggle.
create policy "Feature flags readable by authenticated users"
  on public.feature_flags for select using (auth.role() = 'authenticated');
create policy "Admins can update feature flags"
  on public.feature_flags for update using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );
