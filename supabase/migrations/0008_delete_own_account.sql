-- Required by App Store Review Guideline 5.1.1(v): any app that supports
-- account creation must offer in-app account deletion. Self-service only
-- (always acts on auth.uid(), never a passed-in target), so there's no
-- privilege-escalation surface the way the admin_* functions have to guard
-- against.
--
-- Deletion order matters: several tables reference profiles with NO ACTION
-- (not CASCADE) — messages.sender_id, conversations.organizer_id/player_id,
-- game_rosters.profile_id, games.organizer_id — so those must be cleared
-- first. bookings cascades from profiles already; deleting it explicitly
-- here too is harmless. Deleting the auth.users row last cascades to
-- profiles (ON DELETE CASCADE from the original schema).
--
-- Verified end-to-end against disposable test data before being wired into
-- the client: a user with an organized game, a conversation, a sent
-- message, a roster entry, and a booking was fully and cleanly removed
-- with zero orphaned rows and no FK violations.
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated.';
  end if;

  delete from public.messages where sender_id = uid;
  delete from public.conversations where organizer_id = uid or player_id = uid;
  delete from public.game_rosters where profile_id = uid;
  delete from public.games where organizer_id = uid;
  delete from public.bookings where user_id = uid;
  delete from auth.users where id = uid;
end;
$$;

revoke execute on function public.delete_own_account() from public;
revoke execute on function public.delete_own_account() from anon;
grant execute on function public.delete_own_account() to authenticated;
