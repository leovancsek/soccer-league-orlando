-- waiver_lockdown (0007-era change, applied directly on remote as
-- "waiver_lockdown") replaced the blanket UPDATE grant on public.profiles
-- with a column whitelist to stop users touching waiver_* columns, but
-- avatar_url was left off the list. That broke profile photo uploads with
-- "permission denied for table profiles". Add it back alongside the other
-- user-editable columns.
grant update (name, position, level, city, bio, preferred_locale, avatar_url) on public.profiles to authenticated;
