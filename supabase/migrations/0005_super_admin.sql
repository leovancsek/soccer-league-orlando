-- Adds a super-admin tier on top of the existing is_admin flag. is_admin
-- keeps gating everything it already did (Admin tab visibility,
-- admin_accept_waiver); is_super_admin is an additional check used
-- client-side to further restrict the Features section to super admins
-- only. A super admin should also have is_admin = true.

alter table public.profiles add column if not exists is_super_admin boolean not null default false;
