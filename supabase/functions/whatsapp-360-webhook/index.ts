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
    const payload = await req.json();
    const provider = new ThreeSixtyProvider();
    const messages = provider.parseWebhook(payload);

    for (const msg of messages) {
      await processWhatsAppMessage(supabaseAdmin, msg, "360dialog");
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
});
