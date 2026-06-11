import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { TwilioProvider } from "../_shared/providers/twilio.ts";
import { MetaProvider } from "../_shared/providers/meta.ts";
import { ThreeSixtyProvider } from "../_shared/providers/360dialog.ts";
import { EvolutionProvider } from "../_shared/providers/evolution.ts";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const providers: any = {
  twilio: new TwilioProvider(),
  whatsapp: new TwilioProvider(), 
  meta: new MetaProvider(),
  "360dialog": new ThreeSixtyProvider(),
  evolution: new EvolutionProvider(),
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { 
      "Access-Control-Allow-Origin": "*", 
      "Access-Control-Allow-Methods": "POST", 
      "Access-Control-Allow-Headers": "Content-Type, Authorization" 
    }});
  }

  try {
    const { conversationId, body, type = 'public', mediaUrl } = await req.json();

    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) return new Response("Unauthorized", { status: 401 });

    const { data: conversation, error: convError } = await supabaseAdmin
      .from("conversations")
      .select(`
        *,
        contacts(phone),
        channels(*)
      `)
      .eq("id", conversationId)
      .single();

    if (convError || !conversation) throw new Error("Conversation not found");

    const channel = conversation.channels;
    const providerKey = channel.provider.toLowerCase();
    const provider = providers[providerKey];

    if (!provider) throw new Error(`Provider ${providerKey} not implemented`);

    const result = await provider.sendMessage(
      conversation.contacts.phone,
      mediaUrl || body,
      mediaUrl ? 'image' : 'text',
      { ...channel.credentials, identifier: channel.identifier }
    );

    // Save to DB
    const { data: msg, error: msgError } = await supabaseAdmin
      .from("messages")
      .insert({
        conversation_id: conversationId,
        organization_id: conversation.organization_id,
        body: body,
        type: mediaUrl ? 'media' : 'text',
        sender_profile_id: user.id,
        provider_message_id: result.sid,
        delivery_status: 'sent',
        metadata: { mediaUrl, provider: providerKey }
      })
      .select().single();

    if (msgError) throw msgError;

    await supabaseAdmin
      .from("conversations")
      .update({ last_message_preview: body || '[Mídia]', last_message_at: new Date().toISOString() })
      .eq("id", conversationId);

    return new Response(JSON.stringify(msg), { 
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });

  } catch (err) {
    console.error("Send Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
});
