-- Policy: super admin is a fixed, manually-provisioned tier — it must
-- never be grantable from within the app, even by an existing super
-- admin, so a compromised or careless admin session can't mint a second
-- one. admin_set_role can still remove/keep an existing super admin
-- (subject to the "never remove the last one" guard already in place),
-- it just can no longer promote anyone new into the role.
create or replace function public.admin_set_role(target_user_id uuid, new_is_admin boolean, new_is_super_admin boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  remaining_super_admins int;
  target_is_super_admin boolean;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_super_admin = true) then
    raise exception 'Only super admins can change account roles.';
  end if;

  select is_super_admin into target_is_super_admin from public.profiles where id = target_user_id;

  if new_is_super_admin and not target_is_super_admin then
    raise exception 'Super admin cannot be granted from the app. Contact the project owner.';
  end if;

  if new_is_super_admin then
    new_is_admin := true;
  end if;

  if not new_is_super_admin then
    select count(*) into remaining_super_admins
    from public.profiles
    where is_super_admin = true and id != target_user_id;

    if remaining_super_admins = 0 and target_is_super_admin then
      raise exception 'Cannot remove the last super admin.';
    end if;
  end if;

  update public.profiles
  set is_admin = new_is_admin,
      is_super_admin = new_is_super_admin
  where id = target_user_id;
end;
$$;
