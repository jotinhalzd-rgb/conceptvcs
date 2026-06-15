import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SimulatorProvider } from "../_shared/providers/simulator.ts";
import { processWhatsAppMessage } from "../_shared/providers/processor.ts";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/**
 * Simulated inbound webhook — DEV/PREVIEW only.
 * Requires an authenticated user belonging to the same org as the demo channel.
 * Refuses to process channels that are NOT flagged is_demo = true.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...CORS, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const { channelIdentifier, from, body: messageBody, contactName, providerMessageId } = body ?? {};
    if (!channelIdentifier || !from || !messageBody) {
      return new Response(JSON.stringify({ error: "channelIdentifier, from, body required" }), { status: 400, headers: { ...CORS, "Content-Type": "application/json" } });
    }

    // Load channel + verify it's a demo channel and caller belongs to its org
    const { data: channel, error: chErr } = await supabaseAdmin
      .from("channels")
      .select("id, identifier, organization_id, is_demo, provider")
      .eq("identifier", channelIdentifier)
      .maybeSingle();
    if (chErr || !channel) {
      return new Response(JSON.stringify({ error: "Channel not found" }), { status: 404, headers: { ...CORS, "Content-Type": "application/json" } });
    }
    if (!channel.is_demo) {
      return new Response(JSON.stringify({ error: "Simulator only allowed on demo channels" }), { status: 403, headers: { ...CORS, "Content-Type": "application/json" } });
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile || profile.organization_id !== channel.organization_id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...CORS, "Content-Type": "application/json" } });
    }

    // Optional: pre-create contact with provided name (idempotent)
    if (contactName) {
      await supabaseAdmin
        .from("contacts")
        .upsert(
          { phone: from, name: contactName, organization_id: channel.organization_id, is_demo: true },
          { onConflict: "organization_id,phone", ignoreDuplicates: true }
        );
    }

    const sim = new SimulatorProvider();
    const [parsed] = sim.parseWebhook({
      from,
      to: channel.identifier,
      body: messageBody,
      messageId: providerMessageId,
    });

    const result = await processWhatsAppMessage(supabaseAdmin, parsed, "development_simulator");
    return new Response(JSON.stringify(result), { status: 200, headers: { ...CORS, "Content-Type": "application/json" } });
  } catch (err: any) {
    console.error("sim-webhook error:", err?.message ?? err);
    return new Response(JSON.stringify({ error: err?.message ?? "Internal error" }), { status: 500, headers: { ...CORS, "Content-Type": "application/json" } });
  }
});