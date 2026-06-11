import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { TwilioProvider } from "../_shared/providers/twilio.ts";
import { processWhatsAppMessage } from "../_shared/providers/processor.ts";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  if (req.method === "GET") return new Response("Active");

  try {
    const formData = await req.formData();
    const payload = Object.fromEntries(formData.entries());
    
    const provider = new TwilioProvider();
    const messages = provider.parseWebhook(payload);

    for (const msg of messages) {
      await processWhatsAppMessage(supabaseAdmin, msg, "twilio");
    }

    return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', { 
      status: 200,
      headers: { "Content-Type": "text/xml" }
    });

  } catch (err) {
    console.error("Twilio Webhook Error:", err);
    return new Response(err.message, { status: 500 });
  }
});
