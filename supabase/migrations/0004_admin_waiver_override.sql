-- Lets an admin manually mark a user's waiver as accepted, for cases where
-- it was signed outside the app (e.g. a paper waiver at the field). The
-- waiver_* columns on profiles have client UPDATE revoked at the grant
-- level (see smartwaiver-webhook), so this SECURITY DEFINER function is
-- the only other path — and it enforces the admin check itself, server
-- side, rather than trusting the caller's app-level UI.

create or replace function public.admin_accept_waiver(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_admin = true) then
    raise exception 'Only admins can override a waiver.';
  end if;

  update public.profiles
  set waiver_accepted = true,
      waiver_accepted_at = now(),
      waiver_version = 'manual-admin-override'
  where id = target_user_id;
end;
$$;

revoke execute on function public.admin_accept_waiver(uuid) from public;
revoke execute on function public.admin_accept_waiver(uuid) from anon;
grant execute on function public.admin_accept_waiver(uuid) to authenticated;
