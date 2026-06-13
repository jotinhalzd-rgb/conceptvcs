import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { MetaProvider } from "../_shared/providers/meta.ts";
import { processWhatsAppMessage } from "../_shared/providers/processor.ts";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

async function verifyMetaSignature(rawBody: string, signatureHeader: string, appSecret: string): Promise<boolean> {
  if (!signatureHeader.startsWith("sha256=")) return false;
  const provided = signatureHeader.slice("sha256=".length);
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(appSecret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, enc.encode(rawBody));
  const expected = Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2, "0")).join("");
  if (expected.length !== provided.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ provided.charCodeAt(i);
  return diff === 0;
}

serve(async (req) => {
  const url = new URL(req.url);
  
  // Meta Webhook Verification (GET)
  if (req.method === "GET") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === Deno.env.get("META_VERIFY_TOKEN")) {
      return new Response(challenge, { status: 200 });
    }
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-hub-signature-256") ?? "";
    const appSecret = Deno.env.get("META_APP_SECRET") ?? "";
    if (!signature || !appSecret) {
      console.error("Meta webhook: missing signature or META_APP_SECRET");
      return new Response("Forbidden", { status: 403 });
    }
    const valid = await verifyMetaSignature(rawBody, signature, appSecret);
    if (!valid) return new Response("Forbidden", { status: 403 });
    const payload = JSON.parse(rawBody);

    const provider = new MetaProvider();
    const messages = provider.parseWebhook(payload);

    for (const msg of messages) {
      await processWhatsAppMessage(supabaseAdmin, msg, "meta");
    }

    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("Meta Webhook Error:", err);
    return new Response("Internal server error", { status: 500 });
  }
});
