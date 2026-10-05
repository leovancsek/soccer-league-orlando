-- New feature: discount codes applicable at checkout, with optional
-- expiry by date and/or a cap on total redemptions. Managed by admins.

create table if not exists public.discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  -- 'percent': 1-100. 'fixed': cents off, must be > 0.
  discount_value integer not null check (discount_value > 0),
  expires_at timestamptz null,
  max_uses integer null check (max_uses is null or max_uses > 0),
  uses_count integer not null default 0,
  active boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.discount_codes enable row level security;

-- Admins manage codes directly through the table (same pattern AdminScreen
-- already uses for profiles/waivers) rather than through RPCs.
create policy "Admins can read discount codes"
  on public.discount_codes for select
  using (exists (select 1 from public.profiles where id = auth.uid() and (is_admin or is_super_admin)));

create policy "Admins can insert discount codes"
  on public.discount_codes for insert
  with check (exists (select 1 from public.profiles where id = auth.uid() and (is_admin or is_super_admin)));

create policy "Admins can update discount codes"
  on public.discount_codes for update
  using (exists (select 1 from public.profiles where id = auth.uid() and (is_admin or is_super_admin)));

create policy "Admins can delete discount codes"
  on public.discount_codes for delete
  using (exists (select 1 from public.profiles where id = auth.uid() and (is_admin or is_super_admin)));

grant select, insert, update, delete on public.discount_codes to authenticated;

-- Regular users never get SELECT on the table (would leak all active codes
-- to anyone). Instead they validate a code they typed in via this
-- SECURITY DEFINER function, which only reveals the resulting discount
-- for THAT code, not the table contents.
create or replace function public.validate_discount_code(p_code text, p_amount_cents integer)
returns table (valid boolean, discount_amount_cents integer, final_amount_cents integer, message text, discount_code_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  rec record;
  computed_discount integer;
  computed_final integer;
begin
  select * into rec from public.discount_codes where upper(code) = upper(p_code);

  if rec is null then
    return query select false, 0, p_amount_cents, 'Invalid code.', null::uuid;
    return;
  end if;
  if not rec.active then
    return query select false, 0, p_amount_cents, 'This code is no longer active.', null::uuid;
    return;
  end if;
  if rec.expires_at is not null and rec.expires_at < now() then
    return query select false, 0, p_amount_cents, 'This code has expired.', null::uuid;
    return;
  end if;
  if rec.max_uses is not null and rec.uses_count >= rec.max_uses then
    return query select false, 0, p_amount_cents, 'This code has reached its usage limit.', null::uuid;
    return;
  end if;

  if rec.discount_type = 'percent' then
    computed_discount := round(p_amount_cents * rec.discount_value / 100.0);
  else
    computed_discount := rec.discount_value;
  end if;
  computed_discount := least(computed_discount, p_amount_cents);
  computed_final := greatest(p_amount_cents - computed_discount, 50); -- Stripe's $0.50 USD minimum

  return query select true, computed_discount, computed_final, 'Code applied.', rec.id;
end;
$$;

revoke execute on function public.validate_discount_code(text, integer) from public;
revoke execute on function public.validate_discount_code(text, integer) from anon;
grant execute on function public.validate_discount_code(text, integer) to authenticated;

-- Atomically consumes one use of a code, refusing if it would exceed
-- max_uses (handles two concurrent checkouts racing for the last use).
-- Called only from the stripe-webhook Edge Function (service role) once a
-- payment actually succeeds — never on the client, never on checkout
-- creation, so abandoned checkouts don't burn a redemption.
create or replace function public.consume_discount_code(p_discount_code_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_rows integer;
begin
  update public.discount_codes
  set uses_count = uses_count + 1
  where id = p_discount_code_id
    and active = true
    and (max_uses is null or uses_count < max_uses);
  get diagnostics updated_rows = row_count;
  return updated_rows > 0;
end;
$$;

revoke execute on function public.consume_discount_code(uuid) from public;
revoke execute on function public.consume_discount_code(uuid) from anon;
revoke execute on function public.consume_discount_code(uuid) from authenticated;
grant execute on function public.consume_discount_code(uuid) to service_role;

alter table public.bookings add column if not exists discount_code_id uuid references public.discount_codes(id);
alter table public.bookings add column if not exists discount_amount_cents integer not null default 0;
