-- Lets a super admin promote/demote another account's admin/super-admin
-- role from within the app, instead of needing direct database access.
--
-- Safeguards enforced server-side (not just in the UI):
--  - Only an existing super admin can call this (checked via auth.uid()).
--  - is_super_admin implies is_admin — never leaves the two contradicting.
--  - Refuses to remove the last remaining super admin, so the system can
--    never be left with zero accounts able to manage roles.
create or replace function public.admin_set_role(target_user_id uuid, new_is_admin boolean, new_is_super_admin boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  remaining_super_admins int;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_super_admin = true) then
    raise exception 'Only super admins can change account roles.';
  end if;

  if new_is_super_admin then
    new_is_admin := true;
  end if;

  if not new_is_super_admin then
    select count(*) into remaining_super_admins
    from public.profiles
    where is_super_admin = true and id != target_user_id;

    if remaining_super_admins = 0 and exists (
      select 1 from public.profiles where id = target_user_id and is_super_admin = true
    ) then
      raise exception 'Cannot remove the last super admin.';
    end if;
  end if;

  update public.profiles
  set is_admin = new_is_admin,
      is_super_admin = new_is_super_admin
  where id = target_user_id;
end;
$$;

revoke execute on function public.admin_set_role(uuid, boolean, boolean) from public;
revoke execute on function public.admin_set_role(uuid, boolean, boolean) from anon;
grant execute on function public.admin_set_role(uuid, boolean, boolean) to authenticated;
