// Supabase Edge Function: stripe-webhook
// Deploy with: supabase functions deploy stripe-webhook --no-verify-jwt
// (--no-verify-jwt because Stripe calls this directly, not through your app's
// authenticated client — signature verification below is what secures it.)
//
// After deploying, copy the function's URL into Stripe Dashboard →
// Developers → Webhooks → Add endpoint, subscribed to:
//   checkout.session.completed
//   checkout.session.expired
// Then: supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
//
// This is the ONLY thing that should ever mark a booking "confirmed" — never
// trust the client's success_url redirect alone, since a user can close the
// browser before it fires, or forge the deep link.

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

// Service role key — bypasses RLS. Only ever used here, server-side, never
// shipped to the client.
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature!, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const bookingId = session.metadata?.booking_id;
      if (bookingId) {
        await supabaseAdmin
          .from("bookings")
          .update({ status: "confirmed" })
          .eq("id", bookingId)
          .eq("stripe_checkout_session_id", session.id);
      }
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object;
      const bookingId = session.metadata?.booking_id;
      if (bookingId) {
        // Release the slot: mark the booking cancelled. Your client already
        // does this optimistically on the "cancel" redirect path, but this
        // covers the case where the user just closes the tab and never
        // returns to the app at all.
        await supabaseAdmin
          .from("bookings")
          .update({ status: "cancelled" })
          .eq("id", bookingId)
          .eq("stripe_checkout_session_id", session.id);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error handling webhook event:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
