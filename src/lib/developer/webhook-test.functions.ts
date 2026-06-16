import { createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const schema = z.object({
  channelId: z.string().uuid(),
  payload: z.record(z.string(), z.any()).optional(),
});

export const testInboundEndpoint = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => schema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: channel, error } = await supabase
      .from("channels")
      .select("id, organization_id, credentials, provider")
      .eq("id", data.channelId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!channel) throw new Error("Canal não encontrado");

    const creds = (channel.credentials as Record<string, unknown>) ?? {};
    const secret = typeof creds.webhook_secret === "string" ? (creds.webhook_secret as string) : null;
    if (!secret) {
      return { status: 0, ok: false, body: { error: "pending_configuration", detail: "Gere o webhook_secret antes de testar." } };
    }

    const req = getWebRequest();
    const url = new URL(req.url);
    const base = `${url.protocol}//${url.host}`;
    const endpoint = `${base}/api/public/channels/${channel.id}/inbound`;

    const payload = data.payload ?? {
      phone: "+5511999999999",
      sender_name: "Teste Developer",
      text: "Mensagem de teste do Developer Center",
      provider: channel.provider ?? "test",
    };

    let res: Response;
    try {
      res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-webhook-token": secret },
        body: JSON.stringify(payload),
      });
    } catch (e: any) {
      return { status: 0, ok: false, body: { error: "fetch_failed", detail: String(e?.message ?? e) } };
    }

    const text = await res.text();
    let bodyJson: any = null;
    try { bodyJson = JSON.parse(text); } catch { bodyJson = { raw: text }; }
    return { status: res.status, ok: res.ok, body: bodyJson as Record<string, any> };
  });