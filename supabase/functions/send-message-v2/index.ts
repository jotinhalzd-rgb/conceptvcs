import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST", "Access-Control-Allow-Headers": "Content-Type, Authorization" } });
  }

  try {
    const { conversationId, body, type = 'public' } = await req.json();

    // 1. Validar Usuário
    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) return new Response("Unauthorized", { status: 401 });

    // 2. Buscar Dados da Conversa e Canal
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

    const orgId = conversation.organization_id;
    const targetPhone = conversation.contacts.phone;
    const channel = conversation.channels;

    if (type === 'internal') {
       // Lógica de nota interna (apenas banco)
       const { data, error } = await supabaseAdmin
          .from("internal_notes")
          .insert({ conversation_id: conversationId, content: body, author_id: user.id })
          .select().single();
       if (error) throw error;
       return new Response(JSON.stringify(data), { status: 200 });
    }

    // 3. Enviar via Twilio se for WhatsApp
    if (channel.provider === 'whatsapp' || channel.provider === 'twilio') {
      const { account_sid, auth_token } = channel.credentials;
      const from = channel.identifier;

      const basicAuth = btoa(`${account_sid}:${auth_token}`);
      const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${account_sid}/Messages.json`, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: from,
          To: targetPhone,
          Body: body,
        }),
      });

      const twilioData = await twilioRes.json();
      if (!twilioRes.ok) throw new Error(`Twilio Error: ${twilioData.message}`);

      // 4. Salvar no Banco
      const { data: msg, error: msgError } = await supabaseAdmin
        .from("messages")
        .insert({
          conversation_id: conversationId,
          organization_id: orgId,
          body: body,
          type: 'text',
          sender_profile_id: user.id,
          provider_message_id: twilioData.sid,
          delivery_status: 'sent'
        })
        .select().single();

      if (msgError) throw msgError;

      // 5. Atualizar Conversa
      await supabaseAdmin
        .from("conversations")
        .update({ last_message_preview: body, last_message_at: new Date().toISOString() })
        .eq("id", conversationId);

      return new Response(JSON.stringify(msg), { 
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    throw new Error("Provider not supported yet for real sending");

  } catch (err) {
    console.error("Send Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
});
