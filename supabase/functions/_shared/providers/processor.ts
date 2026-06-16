import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { WhatsAppMessage } from "./types.ts";

export async function processWhatsAppMessage(supabase: any, message: WhatsAppMessage, providerName: string) {
  console.log(`Processing message from ${providerName}:`, message.messageId);

  // 1. Identify Organization by channel (to)
  const { data: orgId, error: orgError } = await supabase
    .rpc('get_org_by_channel_identifier', { p_identifier: message.to });

  if (orgError || !orgId) {
    console.error("Organization not found for identifier:", message.to, orgError);
    return { error: "Organization not found" };
  }

  // Resolve channel (also used for demo flagging + idempotency scope)
  const { data: channel } = await supabase
    .from("channels")
    .select("id, is_demo, settings")
    .eq("identifier", message.to)
    .maybeSingle();
  const isDemo = channel?.is_demo === true;

  // 2. Find or Create Contact
  let { data: contact, error: contactError } = await supabase
    .from("contacts")
    .select("id")
    .eq("phone", message.from)
    .eq("organization_id", orgId)
    .maybeSingle();

  if (!contact) {
    const { data: newContact, error: createContactError } = await supabase
      .from("contacts")
      .insert({
        phone: message.from,
        name: message.from,
        organization_id: orgId,
        is_demo: isDemo,
      })
      .select("id")
      .single();
    
    if (createContactError) throw createContactError;
    contact = newContact;
  }

  // 3. Find or Create Active Conversation
  let { data: conversation, error: convError } = await supabase
    .from("conversations")
    .select("id")
    .eq("contact_id", contact.id)
    .eq("status", "open")
    .maybeSingle();

  if (!conversation) {
    // ---- Routing: keyword rules → default queue → optional auto-assignment ----
    const normalized = (message.body ?? "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

    let routedQueueId: string | null = null;
    let routingReason: string | null = null;

    if (normalized.length > 0) {
      // 1) New org-scoped table queue_routing_rules (keywords text[])
      const { data: newRules } = await supabase
        .from("queue_routing_rules")
        .select("id, name, keywords, queue_id, channel_id, priority, is_fallback, is_active")
        .eq("organization_id", orgId)
        .eq("is_active", true)
        .order("priority", { ascending: false });
      for (const r of (newRules ?? []) as any[]) {
        if (r.channel_id && channel?.id && r.channel_id !== channel.id) continue;
        const kws: string[] = Array.isArray(r.keywords) ? r.keywords : [];
        const matched = kws.some((k) => {
          const kw = String(k ?? "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
          return kw && normalized.includes(kw);
        });
        if (matched) {
          routedQueueId = r.queue_id;
          routingReason = `rule:${r.name}`;
          break;
        }
      }
    }

    // 2) Legacy routing_rules (company-scoped) as fallback for older data
    if (!routedQueueId && normalized.length > 0) {
      const { data: rules } = await supabase
        .from("routing_rules")
        .select("keyword, target_queue_id, priority_bonus, is_active, queues!inner(organization_id)")
        .eq("is_active", true)
        .eq("queues.organization_id", orgId)
        .order("priority_bonus", { ascending: false });
      for (const r of (rules ?? []) as any[]) {
        const kw = String(r.keyword ?? "")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .trim();
        if (kw && normalized.includes(kw)) {
          routedQueueId = r.target_queue_id;
          routingReason = `legacy:${kw}`;
          break;
        }
      }
    }

    // 3) Channel default queue (channels.settings.default_queue_id)
    if (!routedQueueId) {
      const def = (channel?.settings as any)?.default_queue_id;
      if (def) {
        routedQueueId = def;
        routingReason = "channel_default";
      }
    }

    // 4) Fallback rule (is_fallback)
    if (!routedQueueId) {
      const { data: fb } = await supabase
        .from("queue_routing_rules")
        .select("queue_id, name")
        .eq("organization_id", orgId)
        .eq("is_active", true)
        .eq("is_fallback", true)
        .order("priority", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (fb?.queue_id) {
        routedQueueId = fb.queue_id;
        routingReason = `fallback:${fb.name}`;
      }
    }

    // 5) Org default queue
    if (!routedQueueId) {
      const { data: def } = await supabase
        .from("queues")
        .select("id")
        .eq("organization_id", orgId)
        .eq("is_default", true)
        .eq("is_active", true)
        .maybeSingle();
      if (def?.id) {
        routedQueueId = def.id;
        routingReason = "org_default";
      }
    }

    // Auto-assignment (least-busy) when the routed queue is in auto mode
    let assignedAgentId: string | null = null;
    if (routedQueueId) {
      const { data: q } = await supabase
        .from("queues")
        .select("assignment_mode")
        .eq("id", routedQueueId)
        .maybeSingle();
      if (q?.assignment_mode === "auto") {
        const { data: members } = await supabase
          .from("queue_members")
          .select("user_id")
          .eq("queue_id", routedQueueId)
          .eq("is_active", true);
        if (members && members.length > 0) {
          // pick least-busy by current open/pending load
          let best: { user_id: string; load: number } | null = null;
          for (const m of members) {
            const { count } = await supabase
              .from("conversations")
              .select("id", { count: "exact", head: true })
              .eq("agent_id", m.user_id)
              .in("status", ["open", "pending", "active"]);
            const load = count ?? 0;
            if (!best || load < best.load) best = { user_id: m.user_id, load };
          }
          assignedAgentId = best?.user_id ?? null;
        }
      }
    }

    const { data: newConv, error: createConvError } = await supabase
      .from("conversations")
      .insert({
        contact_id: contact.id,
        organization_id: orgId,
        channel_id: channel?.id,
        status: "open",
        last_message_at: message.timestamp,
        last_message_preview: message.body || `[${message.type}]`,
        is_demo: isDemo,
        queue_id: routedQueueId,
        agent_id: assignedAgentId,
        routing_reason: routingReason,
      })
      .select("id")
      .single();

    if (createConvError) throw createConvError;
    conversation = newConv;
    console.log(JSON.stringify({ processor: providerName, routed: { queue_id: routedQueueId, agent_id: assignedAgentId, reason: routingReason } }));
  } else {
    await supabase
      .from("conversations")
      .update({
        last_message_at: message.timestamp,
        last_message_preview: message.body || `[${message.type}]`
      })
      .eq("id", conversation.id);
  }

  // 4. Save Message (idempotent by (conversation_id, provider_message_id))
  const { data: existing } = await supabase
    .from("messages")
    .select("id")
    .eq("conversation_id", conversation.id)
    .eq("provider_message_id", message.messageId)
    .maybeSingle();
  if (existing) {
    console.log(JSON.stringify({ processor: providerName, deduped: true, messageId: message.messageId }));
    return { success: true, conversationId: conversation.id, deduped: true };
  }

  const { data: inserted, error: msgError } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversation.id,
      organization_id: orgId,
      body: message.body,
      type: message.type === 'text' ? 'text' : 'media',
      provider_message_id: message.messageId,
      delivery_status: 'received',
      is_demo: isDemo,
      metadata: {
        provider: providerName,
        media: message.media,
        raw_type: message.type
      }
    })
    .select("id")
    .single();

  if (msgError) throw msgError;
  console.log(JSON.stringify({ processor: providerName, ok: true, conversationId: conversation.id, messageId: inserted?.id }));
  return { success: true, conversationId: conversation.id, messageId: inserted?.id };
}
