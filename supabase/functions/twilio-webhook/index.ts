import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { TwilioProvider } from "../_shared/providers/twilio.ts";
import { processWhatsAppMessage } from "../_shared/providers/processor.ts";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

async function verifyTwilioSignature(
  url: string,
  params: Record<string, string>,
  signature: string,
  authToken: string,
): Promise<boolean> {
  const sortedKeys = Object.keys(params).sort();
  let data = url;
  for (const k of sortedKeys) data += k + params[k];
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(authToken),
    { name: "HMAC", hash: "SHA-1" }, false, ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  const expected = btoa(String.fromCharCode(...new Uint8Array(mac)));
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}

serve(async (req) => {
  if (req.method === "GET") return new Response("Active");

  try {
    const formData = await req.formData();
    const payload = Object.fromEntries(formData.entries()) as Record<string, string>;

    const signature = req.headers.get("x-twilio-signature") ?? "";
    const to = payload.To;
    if (!signature || !to) return new Response("Forbidden", { status: 403 });
    const { data: channel } = await supabaseAdmin
      .from("channels").select("credentials").eq("identifier", to).maybeSingle();
    const authToken = (channel?.credentials as any)?.auth_token;
    if (!authToken) return new Response("Forbidden", { status: 403 });
    const valid = await verifyTwilioSignature(req.url, payload, signature, authToken);
    if (!valid) return new Response("Forbidden", { status: 403 });

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
    return new Response("Internal server error", { status: 500 });
  }
});
