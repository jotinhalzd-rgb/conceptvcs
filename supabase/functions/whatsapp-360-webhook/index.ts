import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ThreeSixtyProvider } from "../_shared/providers/360dialog.ts";
import { processWhatsAppMessage } from "../_shared/providers/processor.ts";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  try {
    const expected = Deno.env.get("D360_WEBHOOK_TOKEN") ?? "";
    const provided = req.headers.get("d360-api-key") ?? req.headers.get("x-webhook-token") ?? "";
    if (!expected || expected.length !== provided.length) return new Response("Forbidden", { status: 403 });
    let diff = 0;
    for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ provided.charCodeAt(i);
    if (diff !== 0) return new Response("Forbidden", { status: 403 });

    const payload = await req.json();
    const provider = new ThreeSixtyProvider();
    const messages = provider.parseWebhook(payload);

    for (const msg of messages) {
      await processWhatsAppMessage(supabaseAdmin, msg, "360dialog");
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("360dialog Webhook Error:", err);
    return new Response("Internal server error", { status: 500 });
  }
});
