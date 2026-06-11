import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  const method = req.method;
  
  if (method === "GET") {
    return new Response("Webhook is active", { status: 200 });
  }

  try {
    const formData = await req.formData();
    const payload = Object.fromEntries(formData.entries());
    
    console.log("Twilio Payload Received:", payload);

    const from = payload.From as string; // whatsapp:+5511...
    const to = payload.To as string;     // whatsapp:+5511...
    const body = payload.Body as string;
    const messageSid = payload.MessageSid as string;

    // 1. Identificar Organização pelo canal (To)
    const { data: orgId, error: orgError } = await supabaseAdmin
      .rpc('get_org_by_channel_identifier', { p_identifier: to });

    if (orgError || !orgId) {
      console.error("Organization not found for identifier:", to, orgError);
      return new Response("Channel mapping error", { status: 404 });
    }

    // 2. Localizar ou Criar Contato (From)
    let { data: contact, error: contactError } = await supabaseAdmin
      .from("contacts")
      .select("id")
      .eq("phone", from)
      .eq("organization_id", orgId)
      .maybeSingle();

    if (!contact) {
      const { data: newContact, error: createContactError } = await supabaseAdmin
        .from("contacts")
        .insert({
          phone: from,
          name: from,
          organization_id: orgId
        })
        .select("id")
        .single();
      
      if (createContactError) throw createContactError;
      contact = newContact;
    }

    // 3. Localizar ou Criar Conversa ativa
    let { data: conversation, error: convError } = await supabaseAdmin
      .from("conversations")
      .select("id")
      .eq("contact_id", contact.id)
      .eq("status", "open")
      .maybeSingle();

    if (!conversation) {
      // Buscar canal_id
      const { data: channel } = await supabaseAdmin
        .from("channels")
        .select("id")
        .eq("identifier", to)
        .single();

      const { data: newConv, error: createConvError } = await supabaseAdmin
        .from("conversations")
        .insert({
          contact_id: contact.id,
          organization_id: orgId,
          channel_id: channel?.id,
          status: "open",
          last_message_at: new Date().toISOString(),
          last_message_preview: body
        })
        .select("id")
        .single();

      if (createConvError) throw createConvError;
      conversation = newConv;
    } else {
      // Atualizar conversa existente
      await supabaseAdmin
        .from("conversations")
        .update({
          last_message_at: new Date().toISOString(),
          last_message_preview: body
        })
        .eq("id", conversation.id);
    }

    // 4. Salvar Mensagem
    const { error: msgError } = await supabaseAdmin
      .from("messages")
      .insert({
        conversation_id: conversation.id,
        organization_id: orgId,
        body: body,
        type: 'text',
        provider_message_id: messageSid,
        delivery_status: 'received'
      });

    if (msgError) throw msgError;

    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("Webhook Error:", err);
    return new Response(err.message, { status: 500 });
  }
});
