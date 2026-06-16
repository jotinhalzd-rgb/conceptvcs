import { createFileRoute } from "@tanstack/react-router";
import { maskSensitive } from "@/lib/developer/mask";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Webhook-Token, Authorization",
  "Access-Control-Max-Age": "86400",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

export const Route = createFileRoute("/api/public/channels/$channelId/inbound")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request, params }) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const channelId = params.channelId;

        let payload: any = {};
        try {
          payload = await request.json();
        } catch {
          return json({ error: "Invalid JSON body" }, 400);
        }

        const logEvent = async (
          orgId: string | null,
          provider: string,
          status: string,
          errorMessage: string | null,
          extra?: Record<string, unknown>
        ) => {
          try {
            await supabaseAdmin.from("channel_webhooks_log").insert({
              channel_id: channelId,
              organization_id: orgId,
              provider,
              payload: maskSensitive({ ...(payload ?? {}), ...(extra ?? {}) }) as any,
              status,
              error_message: errorMessage,
            } as any);
          } catch { /* never break inbound */ }
        };

        const { data: channel, error: chErr } = await supabaseAdmin
          .from("channels")
          .select("id, organization_id, identifier, is_active, is_demo, settings, credentials")
          .eq("id", channelId)
          .maybeSingle();
        if (chErr) { await logEvent(null, "inbound_api", "error", "lookup_failed"); return json({ error: "lookup_failed" }, 500); }
        if (!channel) { await logEvent(null, "inbound_api", "error", "channel_not_found"); return json({ error: "channel_not_found" }, 404); }
        if (channel.is_active === false) { await logEvent(channel.organization_id ?? null, "inbound_api", "error", "channel_inactive"); return json({ error: "channel_inactive" }, 410); }

        const creds = (channel.credentials as any) ?? {};
        const webhookSecret: string | undefined = creds.webhook_secret;
        const provided =
          request.headers.get("x-webhook-token") || payload.verify_token || "";

        if (webhookSecret) {
          if (provided !== webhookSecret) {
            await logEvent(channel.organization_id, "inbound_api", "error", "unauthorized");
            return json({ error: "unauthorized" }, 401);
          }
        } else if (!channel.is_demo) {
          await logEvent(channel.organization_id, "inbound_api", "pending", "missing_webhook_secret");
          return json(
            { status: "pending_configuration", error: "missing_webhook_secret" },
            202
          );
        }

        const orgId = channel.organization_id!;
        const from = String(
          payload.phone || payload.sender_id || payload.email || payload.external_id || ""
        ).trim();
        if (!from) {
          await logEvent(orgId, "inbound_api", "error", "missing_sender");
          return json({ error: "missing_sender" }, 400);
        }
        const body = String(payload.text || payload.body || "").toString();
        const senderName = payload.sender_name ? String(payload.sender_name) : null;
        const provider = String(payload.provider || "inbound_api");
        const timestamp = payload.timestamp || new Date().toISOString();
        const mediaUrl = payload.media_url ?? null;
        const mediaKind = payload.media_kind ?? null;
        const messageId = String(payload.message_id || `in-${crypto.randomUUID()}`);

        // Contact upsert (by phone or email within org)
        const matchCol = payload.email && !payload.phone ? "email" : "phone";
        let { data: contact } = await supabaseAdmin
          .from("contacts")
          .select("id")
          .eq("organization_id", orgId)
          .eq(matchCol, from)
          .maybeSingle();
        if (!contact) {
          const insertContact: any = {
            organization_id: orgId,
            name: senderName || from,
            is_demo: channel.is_demo === true,
          };
          insertContact[matchCol] = from;
          const { data: nc, error: cErr } = await supabaseAdmin
            .from("contacts")
            .insert(insertContact)
            .select("id")
            .single();
          if (cErr) return json({ error: "contact_create_failed", detail: cErr.message }, 500);
          contact = nc;
        }

        // Open conversation lookup
        let { data: conversation } = await supabaseAdmin
          .from("conversations")
          .select("id, queue_id, agent_id, routing_reason")
          .eq("contact_id", contact.id)
          .eq("status", "open")
          .maybeSingle();

        if (!conversation) {
          // Routing
          const norm = normalize(body);
          let routedQueueId: string | null = null;
          let routingReason: string | null = null;

          if (norm) {
            const { data: rules } = await supabaseAdmin
              .from("queue_routing_rules")
              .select("name, keywords, queue_id, channel_id, priority, is_fallback")
              .eq("organization_id", orgId)
              .eq("is_active", true)
              .order("priority", { ascending: false });
            for (const r of (rules ?? []) as any[]) {
              if (r.is_fallback) continue;
              if (r.channel_id && r.channel_id !== channel.id) continue;
              const kws: string[] = Array.isArray(r.keywords) ? r.keywords : [];
              if (kws.some((k) => k && norm.includes(normalize(k)))) {
                routedQueueId = r.queue_id;
                routingReason = `rule:${r.name}`;
                break;
              }
            }
          }

          if (!routedQueueId) {
            const def = (channel.settings as any)?.default_queue_id;
            if (def) {
              routedQueueId = def;
              routingReason = "channel_default";
            }
          }

          if (!routedQueueId) {
            const { data: fb } = await supabaseAdmin
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

          if (!routedQueueId) {
            const { data: orgDef } = await supabaseAdmin
              .from("queues")
              .select("id")
              .eq("organization_id", orgId)
              .eq("is_default", true)
              .eq("is_active", true)
              .maybeSingle();
            if (orgDef?.id) {
              routedQueueId = orgDef.id;
              routingReason = "org_default";
            }
          }

          // Auto assignment (least busy)
          let assignedAgentId: string | null = null;
          if (routedQueueId) {
            const { data: q } = await supabaseAdmin
              .from("queues")
              .select("assignment_mode")
              .eq("id", routedQueueId)
              .maybeSingle();
            if (q?.assignment_mode === "auto") {
              const { data: members } = await supabaseAdmin
                .from("queue_members")
                .select("user_id")
                .eq("queue_id", routedQueueId)
                .eq("is_active", true);
              let best: { user_id: string; load: number } | null = null;
              for (const m of members ?? []) {
                const { count } = await supabaseAdmin
                  .from("conversations")
                  .select("id", { count: "exact", head: true })
                  .eq("agent_id", m.user_id)
                  .in("status", ["open", "pending"]);
                const load = count ?? 0;
                if (!best || load < best.load) best = { user_id: m.user_id, load };
              }
              assignedAgentId = best?.user_id ?? null;
            }
          }

          const { data: nc, error: convErr } = await supabaseAdmin
            .from("conversations")
            .insert({
              contact_id: contact.id,
              organization_id: orgId,
              channel_id: channel.id,
              status: "open",
              last_message_at: timestamp,
              last_message_preview: body || `[${mediaKind || "media"}]`,
              is_demo: channel.is_demo === true,
              queue_id: routedQueueId,
              agent_id: assignedAgentId,
              routing_reason: routingReason,
            })
            .select("id, queue_id, agent_id, routing_reason")
            .single();
          if (convErr) return json({ error: "conv_create_failed", detail: convErr.message }, 500);
          conversation = nc;
        } else {
          await supabaseAdmin
            .from("conversations")
            .update({
              last_message_at: timestamp,
              last_message_preview: body || `[${mediaKind || "media"}]`,
            })
            .eq("id", conversation.id);
        }

        // Dedup message
        const { data: existing } = await supabaseAdmin
          .from("messages")
          .select("id")
          .eq("conversation_id", conversation.id)
          .eq("provider_message_id", messageId)
          .maybeSingle();

        let savedMessageId = existing?.id ?? null;
        if (!existing) {
          const { data: ins, error: mErr } = await supabaseAdmin
            .from("messages")
            .insert({
              conversation_id: conversation.id,
              organization_id: orgId,
              body,
              type: mediaUrl ? "media" : "text",
              provider_message_id: messageId,
              delivery_status: "received",
              is_demo: channel.is_demo === true,
              metadata: { provider, media_url: mediaUrl, media_kind: mediaKind },
            })
            .select("id")
            .single();
          if (mErr) return json({ error: "message_create_failed", detail: mErr.message }, 500);
          savedMessageId = ins.id;
        }

        // Log
        await supabaseAdmin.from("channel_webhooks_log").insert({
          channel_id: channel.id,
          organization_id: orgId,
          provider,
          payload: maskSensitive({ from, body, mediaUrl, mediaKind, message_id: messageId }) as any,
          status: "processed",
        } as any);

        return json({
          ok: true,
          conversation_id: conversation.id,
          queue_id: conversation.queue_id,
          routing_reason: conversation.routing_reason,
          assigned_agent_id: conversation.agent_id,
          message_id: savedMessageId,
          deduped: !!existing,
        });
      },
    },
  },
});