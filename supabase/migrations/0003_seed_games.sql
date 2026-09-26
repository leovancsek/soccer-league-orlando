-- Bookings has a foreign key to games.id, but until AppContext's client-side
-- game list is migrated to real Supabase queries (see README "Architecture
-- notes"), the app only ever books against these 5 hardcoded seed game ids.
-- Without matching rows in this table, every checkout failed with a foreign
-- key violation inside create-checkout-session ("Edge Function returned a
-- non-2xx status code" on the client).
insert into public.games (id, listing_type, format, title, venue, address, game_date, game_time, display_price, spots_total, level, pricing) overriding system value values
(1, 'casual', '5v5', 'Tuesday Night Turf League', 'Orlando Turf Club', '2100 W Colonial Dr, Orlando', 'Tue, Aug 25', '20:00', '$15', 10, 'Intermediate', '{"dropInFee":"$15","monthlyFee":"$45","leagueFee":"$150","subFee":"$20"}'::jsonb),
(2, 'casual', '7v7', 'Sunday Morning Pickup', 'Blanchard Park Fields', '2451 Dean Rd, Orlando', 'Sun, Aug 30', '09:30', '$12', 14, 'All levels', '{"dropInFee":"$12","monthlyFee":"$36","leagueFee":"$150","subFee":"$20"}'::jsonb),
(3, 'league', '11v11', 'Full Pitch Friendly', 'Orlando City Youth Complex', '3211 S Econlockhatchee Trail, Orlando', 'Wed, Aug 26', '19:00', '$18', 22, 'Advanced', '{"dropInFee":"$18","monthlyFee":"$54","leagueFee":"$150","subFee":"$20"}'::jsonb),
(4, 'casual', '5v5', 'Futsal Fridays', 'Dr. Phillips Community Park', '8249 Buenavista Woods Blvd, Orlando', 'Fri, Aug 28', '21:00', '$10', 10, 'Beginner friendly', '{"dropInFee":"$10","monthlyFee":"$30","leagueFee":"$150","subFee":"$20"}'::jsonb),
(5, 'casual', '7v7', 'Midweek Mixers', 'Baldwin Park Soccer Fields', '4770 New Broad St, Orlando', 'Thu, Aug 27', '18:30', '$12', 14, 'Intermediate', '{"dropInFee":"$12","monthlyFee":"$36","leagueFee":"$150","subFee":"$20"}'::jsonb)
on conflict (id) do nothing;

select setval(pg_get_serial_sequence('public.games', 'id'), (select max(id) from public.games));
