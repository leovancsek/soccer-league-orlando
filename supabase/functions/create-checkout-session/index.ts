// Supabase Edge Function: create-checkout-session
// Deploy with: supabase functions deploy create-checkout-session
// Requires secrets set with: supabase secrets set STRIPE_SECRET_KEY=sk_...
//
// This runs server-side (Deno), so your Stripe secret key never ships in the
// app. The client calls this function after tapping "Book & Pay", gets back
// a Checkout URL, and opens it with expo-web-browser.

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });

serve(async (req) => {
  try {
    const authHeader = req.headers.get("Authorization")!;
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });

    const { gameId, priceLabel, amountCents, gameTitle } = await req.json();
    if (!gameId || !amountCents) {
      return new Response(JSON.stringify({ error: "gameId and amountCents are required" }), { status: 400 });
    }

    // Record a pending booking row before redirecting to Stripe.
    const { data: booking, error: bookingError } = await supabaseClient
      .from("bookings")
      .insert({ game_id: gameId, user_id: user.id, status: "pending_payment", amount_charged: priceLabel })
      .select()
      .single();
    if (bookingError) throw bookingError;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: gameTitle || "Pickup game booking" },
          unit_amount: amountCents,
        },
        quantity: 1,
      }],
      // These bring the user back into the app via its deep-link scheme
      // (registered in app.json as "soccerleagueorlando://").
      success_url: `soccerleagueorlando://payment-success?booking_id=${booking.id}`,
      cancel_url: `soccerleagueorlando://payment-cancelled?booking_id=${booking.id}`,
      metadata: { booking_id: String(booking.id), game_id: String(gameId), user_id: user.id },
    });

    await supabaseClient
      .from("bookings")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", booking.id);

    return new Response(JSON.stringify({ url: session.url, bookingId: booking.id }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});

// NOTE: also set up a Stripe webhook (a second Edge Function,
// `stripe-webhook`) listening for `checkout.session.completed` to flip the
// booking's status to 'confirmed' server-side. Don't rely solely on the
// success_url redirect to confirm payment — a user can close the browser
// before it fires, so the webhook is the source of truth.
