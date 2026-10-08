// Supabase Edge Function: smartwaiver-webhook
// Smartwaiver calls this directly (not through the app's authenticated
// client) -- verify_jwt is off, secured instead by the shared-secret query
// param below.
//
// Setup in Smartwaiver dashboard:
//   1. My Account -> Webhooks -> Web Endpoint
//   2. URL: https://<project-ref>.supabase.co/functions/v1/smartwaiver-webhook?secret=YOUR_SECRET
//   Then: supabase secrets set SMARTWAIVER_WEBHOOK_SECRET=YOUR_SECRET
//
// The "Web Endpoint" delivery mode only POSTs a bare
// `unique_id=...&credential=...&event=new-waiver` (form-encoded, NOT JSON)
// -- it never includes the signer's name/tags. To get the real waiver data
// (specifically the tag1=<user id> the app appends to the waiver URL, see
// SignWaiverScreen.js) we call back to Smartwaiver's REST API with that
// unique_id. That requires a real API key (My Account -> API, separate
// from the webhook's "private key" -- that private key only verifies the
// `credential` field and is not a bearer token for the API).
//   Then: supabase secrets set SMARTWAIVER_API_KEY=YOUR_API_KEY
//
// This is the ONLY thing that should ever mark a profile's waiver accepted
// -- migration 0003 revokes client UPDATE access to these columns at the
// Postgres grant level.

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const webhookSecret = Deno.env.get("SMARTWAIVER_WEBHOOK_SECRET")!;
const smartwaiverApiKey = Deno.env.get("SMARTWAIVER_API_KEY")!;

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

serve(async (req) => {
  const url = new URL(req.url);
  if (url.searchParams.get("secret") !== webhookSecret) {
    return new Response("Forbidden", { status: 403 });
  }

  const rawBody = await req.text();

  // Smartwaiver's own "send test" / connectivity check hits this URL with
  // an empty body -- just acknowledge it, there's nothing to process.
  if (!rawBody.trim()) {
    return new Response(JSON.stringify({ received: true, note: "empty body, treated as connectivity check" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // "Web Endpoint" mode sends form-encoded `unique_id=...&credential=...&event=...`.
  // Some setups may instead deliver full JSON directly -- handle both.
  let uniqueId: string | undefined;
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      const payload = JSON.parse(rawBody);
      const waiver = payload.data ?? payload.waiver ?? payload;
      uniqueId = waiver.waiverId ?? waiver.unique_id ?? waiver.waiver_id;
    } catch {
      console.error("smartwaiver-webhook: Invalid JSON, raw body was:", rawBody);
      return new Response("Invalid JSON", { status: 400 });
    }
  } else {
    const form = new URLSearchParams(rawBody);
    uniqueId = form.get("unique_id") ?? undefined;
  }

  if (!uniqueId) {
    console.error("smartwaiver-webhook: no unique_id found in payload", rawBody);
    return new Response(JSON.stringify({ received: true, warning: "no unique_id in payload" }), { status: 200 });
  }

  // Fetch the full waiver so we can read its tags (auto_tag=<user id>,
  // appended to the waiver URL by SignWaiverScreen.js) -- the webhook ping
  // alone never includes this.
  const waiverRes = await fetch(`https://api.smartwaiver.com/v4/waivers/${uniqueId}`, {
    headers: { "sw-api-key": smartwaiverApiKey },
  });
  if (!waiverRes.ok) {
    console.error("smartwaiver-webhook: failed to fetch waiver from Smartwaiver API", waiverRes.status, await waiverRes.text());
    return new Response(JSON.stringify({ error: "Failed to fetch waiver details" }), { status: 502 });
  }
  const waiverData = await waiverRes.json();
  const waiver = waiverData.waiver ?? waiverData;

  const tags: string[] = waiver.tags ?? (waiver.autoTag ? [waiver.autoTag] : []);
  const userId = tags[0];
  const waiverId = waiver.waiverId ?? uniqueId;
  const templateId = waiver.templateId ?? null;

  if (!userId) {
    console.error("smartwaiver-webhook: waiver has no tags, can't match to a user", JSON.stringify(waiver));
    return new Response(JSON.stringify({ received: true, warning: "no matching user id in waiver tags" }), { status: 200 });
  }

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      waiver_accepted: true,
      waiver_accepted_at: new Date().toISOString(),
      waiver_version: templateId,
      waiver_smartwaiver_id: waiverId,
    })
    .eq("id", userId);

  if (error) {
    console.error("Failed to update profile from Smartwaiver webhook:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
